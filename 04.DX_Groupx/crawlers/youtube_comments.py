"""YouTube comments crawler for collecting foreign tourists' complaints about Korea travel.

Usage:
    python youtube_comments.py --max-videos 100 --max-comments 100 --output data/raw/youtube_comments.csv

Setup:
    1. Install deps: pip install -r requirements_crawling.txt
    2. Set environment variable (or .env file):
        YOUTUBE_API_KEY=AIzaSy...

Output columns:
    video_id, video_title, video_published_at, video_description, video_view_count,
    video_like_count, comment_id, comment_text, comment_author, comment_published_at,
    comment_like_count, sentiment, polarity, subjectivity

Sentiment heuristic:
    - Uses TextBlob polarity as base
    - Augmented with domain-specific lexicons (complaints, travel issues)
"""
from __future__ import annotations

import argparse
import os
import sys
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List, Dict, Any

from tenacity import retry, stop_after_attempt, wait_exponential

try:
    from googleapiclient.discovery import build  # type: ignore
    from googleapiclient.errors import HttpError  # type: ignore
except ImportError as e:
    raise SystemExit(
        "google-api-python-client not installed. "
        "Run: pip install google-api-python-client"
    ) from e

from textblob import TextBlob  # type: ignore
import pandas as pd  # type: ignore
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Domain-specific lexicons (same as reddit_korea_travel.py)
NEGATIVE_LEXICON = {
    "problem", "issue", "difficult", "confusing", "hard", "impossible", "scam", "overcharge",
    "rude", "unfriendly", "expensive", "frustrating", "disappointed", "struggle", "barrier",
    "complicated", "inconvenient", "unsafe", "dangerous", "lost", "stuck", "confused", "stress",
    "uncomfortable", "dirty", "broken", "fail", "worst", "terrible", "awful", "bad", "poor",
    "complaint", "complain", "annoying", "frustration", "difficulty", "trouble"
}

POSITIVE_LEXICON = {
    "easy", "helpful", "friendly", "great", "amazing", "love", "enjoy", "convenient",
    "beautiful", "wonderful", "excellent", "fantastic", "perfect", "recommend", "impressed",
    "comfortable", "safe", "clean", "efficient", "smooth", "pleasant"
}


@dataclass
class YouTubeComment:
    video_id: str
    video_title: str
    video_published_at: str
    video_description: str
    video_view_count: int
    video_like_count: int
    comment_id: str
    comment_text: str
    comment_author: str
    comment_published_at: str
    comment_like_count: int
    sentiment: str
    polarity: float
    subjectivity: float


def compute_sentiment(text: str) -> Dict[str, Any]:
    """Compute sentiment with TextBlob + domain lexicon adjustment."""
    blob = TextBlob(text)
    polarity = float(blob.sentiment.polarity)
    subjectivity = float(blob.sentiment.subjectivity)
    
    lower = text.lower()
    # Lexicon boosts
    pos_hits = sum(1 for w in POSITIVE_LEXICON if w in lower)
    neg_hits = sum(1 for w in NEGATIVE_LEXICON if w in lower)
    adjusted = polarity + 0.02 * pos_hits - 0.02 * neg_hits
    
    if adjusted > 0.05:
        sentiment = "positive"
    elif adjusted < -0.05:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    
    return {
        "sentiment": sentiment,
        "polarity": round(adjusted, 4),
        "subjectivity": round(subjectivity, 4),
    }


def build_youtube_client():
    """Build authenticated YouTube client."""
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "Missing YOUTUBE_API_KEY environment variable. "
            "Set it in .env file or environment."
        )
    
    return build("youtube", "v3", developerKey=api_key)


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def search_videos(youtube, query: str, max_results: int = 50):
    """Search YouTube videos with retry mechanism."""
    request = youtube.search().list(
        part="snippet",
        q=query,
        type="video",
        maxResults=max_results,
        relevanceLanguage="en",  # English content
        order="relevance"
    )
    return request.execute()


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def get_video_details(youtube, video_id: str):
    """Get video statistics with retry mechanism."""
    request = youtube.videos().list(
        part="statistics,snippet",
        id=video_id
    )
    return request.execute()


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def get_video_comments(youtube, video_id: str, max_results: int = 100):
    """Get video comments with retry mechanism."""
    try:
        request = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=max_results,
            textFormat="plainText",
            order="relevance"
        )
        return request.execute()
    except HttpError as e:
        # Comments disabled
        if e.resp.status == 403:
            print(f"[WARN] Comments disabled for video {video_id}")
            return {"items": []}
        raise


def collect_comments(
    queries: List[str],
    max_videos: int,
    max_comments: int,
    sleep: float = 1.0
) -> List[YouTubeComment]:
    """Collect YouTube comments across multiple search queries."""
    youtube = build_youtube_client()
    comments: List[YouTubeComment] = []
    seen_comment_ids = set()
    
    for query_idx, query in enumerate(queries, 1):
        print(f"\n[{query_idx}/{len(queries)}] Searching for '{query}'...")
        
        try:
            search_response = search_videos(youtube, query, max_videos)
        except Exception as e:
            print(f"[ERROR] Search failed for '{query}': {e}")
            continue
        
        video_items = search_response.get("items", [])
        print(f"  Found {len(video_items)} videos")
        
        for video_idx, item in enumerate(video_items, 1):
            video_id = item["id"]["videoId"]
            video_title = item["snippet"]["title"]
            video_published = item["snippet"]["publishedAt"]
            video_description = item["snippet"].get("description", "")
            
            # Get video statistics
            try:
                video_details = get_video_details(youtube, video_id)
                stats = video_details["items"][0]["statistics"]
                view_count = int(stats.get("viewCount", 0))
                like_count = int(stats.get("likeCount", 0))
            except Exception as e:
                print(f"  [WARN] Failed to get stats for video {video_id}: {e}")
                view_count = 0
                like_count = 0
            
            # Get comments
            try:
                comment_response = get_video_comments(youtube, video_id, max_comments)
            except Exception as e:
                print(f"  [WARN] Failed to get comments for video {video_id}: {e}")
                continue
            
            comment_items = comment_response.get("items", [])
            print(f"  [{video_idx}/{len(video_items)}] Video: '{video_title[:50]}...' ({len(comment_items)} comments)")
            
            for comment_item in comment_items:
                comment_snippet = comment_item["snippet"]["topLevelComment"]["snippet"]
                comment_id = comment_item["snippet"]["topLevelComment"]["id"]
                
                if comment_id in seen_comment_ids:
                    continue
                
                comment_text = comment_snippet["textDisplay"]
                sent = compute_sentiment(comment_text)
                
                comment_obj = YouTubeComment(
                    video_id=video_id,
                    video_title=video_title,
                    video_published_at=video_published,
                    video_description=video_description,
                    video_view_count=view_count,
                    video_like_count=like_count,
                    comment_id=comment_id,
                    comment_text=comment_text,
                    comment_author=comment_snippet["authorDisplayName"],
                    comment_published_at=comment_snippet["publishedAt"],
                    comment_like_count=int(comment_snippet.get("likeCount", 0)),
                    sentiment=sent["sentiment"],
                    polarity=sent["polarity"],
                    subjectivity=sent["subjectivity"],
                )
                comments.append(comment_obj)
                seen_comment_ids.add(comment_id)
            
            time.sleep(sleep)  # Rate limit compliance
    
    return comments


def save_comments(comments: List[YouTubeComment], output: Path):
    """Save comments to CSV/JSON/JSONL."""
    output.parent.mkdir(parents=True, exist_ok=True)
    rows = [asdict(c) for c in comments]
    
    if output.suffix.lower() == ".csv":
        pd.DataFrame(rows).to_csv(output, index=False, encoding="utf-8-sig")
    elif output.suffix.lower() in {".json", ".jsonl"}:
        import json
        if output.suffix.lower() == ".jsonl":
            with output.open("w", encoding="utf-8") as f:
                for r in rows:
                    f.write(json.dumps(r, ensure_ascii=False) + "\n")
        else:
            with output.open("w", encoding="utf-8") as f:
                json.dump(rows, f, ensure_ascii=False, indent=2)
    else:
        raise ValueError("Unsupported output extension. Use .csv, .json, or .jsonl")
    
    print(f"\n✅ Saved {len(comments)} comments to {output}")


def summarize(comments: List[YouTubeComment]) -> Dict[str, Any]:
    """Summarize collected comments."""
    import collections
    by_sent = collections.Counter(c.sentiment for c in comments)
    
    # Unique videos
    unique_videos = len(set(c.video_id for c in comments))
    
    return {
        "total_comments": len(comments),
        "unique_videos": unique_videos,
        "sentiment_distribution": dict(by_sent),
        "avg_polarity": round(sum(c.polarity for c in comments) / len(comments), 4) if comments else 0.0,
        "avg_subjectivity": round(sum(c.subjectivity for c in comments) / len(comments), 4) if comments else 0.0,
    }


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="YouTube comments crawler for Korea travel complaints"
    )
    parser.add_argument(
        "--queries",
        nargs="*",
        default=[
            "Korea travel mistakes",
            "Korea travel tips for foreigners",
            "Korea what I wish I knew",
            "Korea culture shock",
            "Korea travel problems foreigner"
        ],
        help="Search query strings"
    )
    parser.add_argument(
        "--max-videos",
        type=int,
        default=50,
        help="Maximum videos per query"
    )
    parser.add_argument(
        "--max-comments",
        type=int,
        default=100,
        help="Maximum comments per video"
    )
    parser.add_argument(
        "--output",
        default="data/raw/youtube_comments.csv",
        help="Output file path (.csv/.json/.jsonl)"
    )
    return parser.parse_args(argv)


def main(argv: List[str]):
    """Main entry point."""
    print("=" * 60)
    print("YouTube Korea Travel Complaints Crawler")
    print("=" * 60)
    
    args = parse_args(argv)
    
    print(f"\n📋 Configuration:")
    print(f"  Queries: {len(args.queries)} queries")
    print(f"  Max videos per query: {args.max_videos}")
    print(f"  Max comments per video: {args.max_comments}")
    print(f"  Output: {args.output}\n")
    
    comments = collect_comments(args.queries, args.max_videos, args.max_comments)
    save_comments(comments, Path(args.output))
    
    stats = summarize(comments)
    print("\n📊 Summary:")
    for k, v in stats.items():
        print(f"  {k}: {v}")
    
    print("\n✅ Crawling completed successfully!")


if __name__ == "__main__":
    main(sys.argv[1:])
