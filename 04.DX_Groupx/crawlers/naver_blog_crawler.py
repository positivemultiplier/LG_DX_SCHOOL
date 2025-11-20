"""Naver blog crawler for collecting Korean perspectives on foreign tourists' issues.

Usage:
    python naver_blog_crawler.py --display 100 --output data/raw/naver_blogs.json

Setup:
    1. Install deps: pip install -r requirements_crawling.txt
    2. Set environment variables (or .env file):
        NAVER_CLIENT_ID=...
        NAVER_CLIENT_SECRET=...

Output columns (JSON):
    title, link, description, bloggername, bloggerlink, postdate, query

Note:
    - Naver Blog API returns HTML-escaped text in description
    - For full blog content, secondary scraping is needed (not implemented)
    - This crawler collects only search result metadata
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List, Dict, Any
from html import unescape

from tenacity import retry, stop_after_attempt, wait_exponential

try:
    import requests  # type: ignore
except ImportError as e:
    raise SystemExit("requests not installed. Run: pip install requests") from e

import pandas as pd  # type: ignore
from dotenv import load_dotenv

# Load .env file
load_dotenv()


@dataclass
class NaverBlog:
    title: str
    link: str
    description: str
    bloggername: str
    bloggerlink: str
    postdate: str
    query: str


def build_naver_headers() -> Dict[str, str]:
    """Build Naver API request headers."""
    client_id = os.getenv("NAVER_CLIENT_ID")
    client_secret = os.getenv("NAVER_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        raise EnvironmentError(
            "Missing NAVER_CLIENT_ID or NAVER_CLIENT_SECRET environment variable. "
            "Set them in .env file or environment."
        )
    
    return {
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret
    }


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def search_naver_blog(query: str, display: int = 100, start: int = 1, sort: str = "sim") -> Dict[str, Any]:
    """Search Naver Blog API with retry mechanism.
    
    Args:
        query: Search query string
        display: Number of results per page (1-100)
        start: Starting index (1-1000)
        sort: 'sim' (accuracy) or 'date' (recency)
    
    Returns:
        API response JSON
    """
    url = "https://openapi.naver.com/v1/search/blog"
    headers = build_naver_headers()
    params = {
        "query": query,
        "display": min(display, 100),  # Max 100
        "start": start,
        "sort": sort
    }
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()


def clean_html_tags(text: str) -> str:
    """Remove HTML tags and unescape HTML entities."""
    # Remove <b> tags (Naver highlights)
    text = re.sub(r'<b>|</b>', '', text)
    # Unescape HTML entities
    text = unescape(text)
    return text.strip()


def collect_blogs(
    queries: List[str],
    display: int,
    sort: str = "sim",
    sleep: float = 0.5
) -> List[NaverBlog]:
    """Collect Naver blog posts across multiple queries."""
    blogs: List[NaverBlog] = []
    seen_links = set()
    
    for query_idx, query in enumerate(queries, 1):
        print(f"\n[{query_idx}/{len(queries)}] Searching for '{query}'...")
        
        try:
            response = search_naver_blog(query, display, start=1, sort=sort)
        except Exception as e:
            print(f"[ERROR] Search failed for '{query}': {e}")
            continue
        
        total = response.get("total", 0)
        items = response.get("items", [])
        print(f"  Total: {total}, Retrieved: {len(items)}")
        
        for item in items:
            link = item["link"]
            if link in seen_links:
                continue
            
            blog = NaverBlog(
                title=clean_html_tags(item["title"]),
                link=link,
                description=clean_html_tags(item["description"]),
                bloggername=item.get("bloggername", ""),
                bloggerlink=item.get("bloggerlink", ""),
                postdate=item.get("postdate", ""),
                query=query
            )
            blogs.append(blog)
            seen_links.add(link)
        
        time.sleep(sleep)  # Rate limit compliance
    
    return blogs


def save_blogs(blogs: List[NaverBlog], output: Path):
    """Save blogs to CSV/JSON/JSONL."""
    output.parent.mkdir(parents=True, exist_ok=True)
    rows = [asdict(b) for b in blogs]
    
    if output.suffix.lower() == ".csv":
        pd.DataFrame(rows).to_csv(output, index=False, encoding="utf-8-sig")
    elif output.suffix.lower() in {".json", ".jsonl"}:
        if output.suffix.lower() == ".jsonl":
            with output.open("w", encoding="utf-8") as f:
                for r in rows:
                    f.write(json.dumps(r, ensure_ascii=False) + "\n")
        else:
            with output.open("w", encoding="utf-8") as f:
                json.dump(rows, f, ensure_ascii=False, indent=2)
    else:
        raise ValueError("Unsupported output extension. Use .csv, .json, or .jsonl")
    
    print(f"\n✅ Saved {len(blogs)} blogs to {output}")


def summarize(blogs: List[NaverBlog]) -> Dict[str, Any]:
    """Summarize collected blogs."""
    import collections
    by_query = collections.Counter(b.query for b in blogs)
    
    # Date distribution
    postdates = [b.postdate for b in blogs if b.postdate]
    date_counts = collections.Counter(postdates)
    recent_dates = dict(date_counts.most_common(5))
    
    return {
        "total_blogs": len(blogs),
        "query_distribution": dict(by_query),
        "top_5_dates": recent_dates,
    }


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Naver blog crawler for Korea travel issues"
    )
    parser.add_argument(
        "--queries",
        nargs="*",
        default=[
            "한국여행 외국인 불편",
            "외국인 한국 여행 후기",
            "한국 관광 문제점",
            "외국인 한국 생활 어려움",
            "한국여행 언어장벽",
            "한국여행 교통 불편"
        ],
        help="Search query strings (Korean)"
    )
    parser.add_argument(
        "--display",
        type=int,
        default=100,
        help="Number of results per query (max 100)"
    )
    parser.add_argument(
        "--sort",
        choices=["sim", "date"],
        default="sim",
        help="Sort order: 'sim' (accuracy) or 'date' (recency)"
    )
    parser.add_argument(
        "--output",
        default="data/raw/naver_blogs.json",
        help="Output file path (.csv/.json/.jsonl)"
    )
    return parser.parse_args(argv)


def main(argv: List[str]):
    """Main entry point."""
    print("=" * 60)
    print("Naver Blog Korea Travel Issues Crawler")
    print("=" * 60)
    
    args = parse_args(argv)
    
    print(f"\n📋 Configuration:")
    print(f"  Queries: {len(args.queries)} queries")
    print(f"  Display per query: {args.display}")
    print(f"  Sort: {args.sort}")
    print(f"  Output: {args.output}\n")
    
    blogs = collect_blogs(args.queries, args.display, args.sort)
    save_blogs(blogs, Path(args.output))
    
    stats = summarize(blogs)
    print("\n📊 Summary:")
    for k, v in stats.items():
        print(f"  {k}: {v}")
    
    print("\n✅ Crawling completed successfully!")
    print("\n⚠️  Note: Naver API returns only metadata (title, description).")
    print("   For full blog content, secondary scraping is needed.")


if __name__ == "__main__":
    main(sys.argv[1:])
