"""Reddit crawler for collecting foreign tourists' complaints about Korea travel.

Usage:
    python reddit_korea_travel.py --limit 100 --output data/raw/reddit_korea_travel.csv

Setup:
    1. Install deps: pip install -r requirements_crawling.txt
    2. Set environment variables (or .env file):
        REDDIT_CLIENT_ID=...
        REDDIT_CLIENT_SECRET=...
        REDDIT_USER_AGENT=lg-dx-korea-travel/0.1 by <your_reddit_username>

Output columns:
    id, subreddit, title, selftext, created_utc, score, num_comments,
    permalink, url, flair, combined_text, sentiment, polarity, subjectivity

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
    import praw  # type: ignore
except ImportError as e:
    raise SystemExit("PRAW not installed. Run: pip install praw") from e

from textblob import TextBlob  # type: ignore
import pandas as pd  # type: ignore
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Domain-specific lexicons for Korea travel complaints
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
class RedditPost:
    id: str
    subreddit: str
    title: str
    selftext: str
    created_utc: float
    score: int
    num_comments: int
    permalink: str
    url: str
    flair: str | None
    combined_text: str
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


def build_reddit_client() -> "praw.Reddit":
    """Build authenticated Reddit client."""
    required = ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_USER_AGENT"]
    missing = [k for k in required if not os.getenv(k)]
    if missing:
        raise EnvironmentError(
            f"Missing environment variables: {missing}. "
            f"Set them in .env file or environment."
        )
    
    return praw.Reddit(
        client_id=os.environ["REDDIT_CLIENT_ID"],
        client_secret=os.environ["REDDIT_CLIENT_SECRET"],
        user_agent=os.environ["REDDIT_USER_AGENT"],
    )


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def search_subreddit(reddit: "praw.Reddit", subreddit: str, query: str, limit: int):
    """Search subreddit with retry mechanism."""
    return list(reddit.subreddit(subreddit).search(query, limit=limit, sort="relevance"))


def collect_posts(
    queries: List[str],
    subreddits: List[str],
    per_query_limit: int,
    sleep: float = 1.2
) -> List[RedditPost]:
    """Collect Reddit posts across multiple subreddits and queries."""
    reddit = build_reddit_client()
    posts: List[RedditPost] = []
    seen_ids = set()
    
    total_queries = len(subreddits) * len(queries)
    current_query = 0
    
    for sub in subreddits:
        for query in queries:
            current_query += 1
            print(f"[{current_query}/{total_queries}] Searching r/{sub} for '{query}'...")
            
            try:
                submissions = search_subreddit(reddit, sub, query, per_query_limit)
            except Exception as e:
                print(f"[WARN] Failed subreddit r/{sub} query '{query}': {e}")
                continue
            
            for submission in submissions:
                if submission.id in seen_ids:
                    continue
                
                # Load comments (limit to avoid rate limits)
                submission.comments.replace_more(limit=0)
                
                body = submission.selftext or ""
                combined = f"{submission.title}\n{body}"
                sent = compute_sentiment(combined)
                
                post = RedditPost(
                    id=submission.id,
                    subreddit=sub,
                    title=submission.title.strip(),
                    selftext=body.strip(),
                    created_utc=float(getattr(submission, 'created_utc', 0.0)),
                    score=int(getattr(submission, 'score', 0)),
                    num_comments=int(getattr(submission, 'num_comments', 0)),
                    permalink=f"https://reddit.com{submission.permalink}",
                    url=getattr(submission, 'url', ''),
                    flair=getattr(submission, 'link_flair_text', None),
                    combined_text=combined,
                    sentiment=sent["sentiment"],
                    polarity=sent["polarity"],
                    subjectivity=sent["subjectivity"],
                )
                posts.append(post)
                seen_ids.add(submission.id)
            
            time.sleep(sleep)  # Rate limit compliance
    
    return posts


def save_posts(posts: List[RedditPost], output: Path):
    """Save posts to CSV/JSON/JSONL."""
    output.parent.mkdir(parents=True, exist_ok=True)
    rows = [asdict(p) for p in posts]
    
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
    
    print(f"\n✅ Saved {len(posts)} posts to {output}")


def summarize(posts: List[RedditPost]) -> Dict[str, Any]:
    """Summarize collected posts."""
    import collections
    by_sent = collections.Counter(p.sentiment for p in posts)
    by_sub = collections.Counter(p.subreddit for p in posts)
    
    return {
        "total_posts": len(posts),
        "sentiment_distribution": dict(by_sent),
        "subreddit_distribution": dict(by_sub),
        "avg_polarity": round(sum(p.polarity for p in posts) / len(posts), 4) if posts else 0.0,
        "avg_subjectivity": round(sum(p.subjectivity for p in posts) / len(posts), 4) if posts else 0.0,
    }


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Reddit crawler for Korea travel complaints"
    )
    parser.add_argument(
        "--queries",
        nargs="*",
        default=[
            "Seoul trip issues",
            "Seoul travel problems",
            "Seoul travel frustration",
            "Seoul foreigner complaints",
            "Seoul tourist difficulties",
            "Seoul travel things nobody tells you"
        ],
        help="Search query strings"
    )
    parser.add_argument(
        "--subreddits",
        nargs="*",
        default=["korea", "Jeju", "solotravel", "koreatravel", "Busan", "Seoul"],
        help="Target subreddit list"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=50,
        help="Per-query search limit"
    )
    parser.add_argument(
        "--output",
        default="data/raw/reddit_korea_travel.csv",
        help="Output file path (.csv/.json/.jsonl)"
    )
    return parser.parse_args(argv)


def main(argv: List[str]):
    """Main entry point."""
    print("=" * 60)
    print("Reddit Korea Travel Complaints Crawler")
    print("=" * 60)
    
    args = parse_args(argv)
    
    print(f"\n📋 Configuration:")
    print(f"  Subreddits: {', '.join(args.subreddits)}")
    print(f"  Queries: {len(args.queries)} queries")
    print(f"  Limit per query: {args.limit}")
    print(f"  Output: {args.output}\n")
    
    posts = collect_posts(args.queries, args.subreddits, args.limit)
    save_posts(posts, Path(args.output))
    
    stats = summarize(posts)
    print("\n📊 Summary:")
    for k, v in stats.items():
        print(f"  {k}: {v}")
    
    print("\n✅ Crawling completed successfully!")


if __name__ == "__main__":
    main(sys.argv[1:])
