"""Reddit crawler for collecting LG Styler related posts with sentiment labeling.

Usage:
    python lg_styler_crawler.py --query "lg styler" --limit 300 --output data/lg_styler/reddit_posts.csv

Setup:
    1. Install deps: pip install -r requirements.txt
    2. Set environment variables (or .env file):
        REDDIT_CLIENT_ID=...
        REDDIT_CLIENT_SECRET=...
        REDDIT_USER_AGENT=lg-dx-school-styler-crawler/0.1 by <your_reddit_username>

Output columns:
    id, subreddit, title, selftext, created_utc, score, num_comments,
    permalink, url, flair, combined_text, sentiment, polarity, subjectivity

Sentiment heuristic:
    - Uses TextBlob polarity as base.
    - Augmented with custom lexicons for domain specific adjustment.
"""
from __future__ import annotations

import argparse
import csv
import os
import sys
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List, Dict, Any

from tenacity import retry, stop_after_attempt, wait_exponential

try:
    import praw  # type: ignore
except ImportError as e:  # pragma: no cover
    raise SystemExit("PRAW not installed. Run: pip install PRAW") from e

from textblob import TextBlob  # type: ignore
import pandas as pd  # type: ignore

POSITIVE_LEXICON = {
    "sanitize", "refresh", "convenient", "love", "great", "amazing", "useful", "recommend",
    "wrinkle", "odor", "deodorize", "steam", "gentle", "care", "easy", "quiet", "time-saving"
}
NEGATIVE_LEXICON = {
    "expensive", "issue", "problem", "broken", "noise", "loud", "waste", "slow", "inefficient",
    "fail", "doesn't", "didn't", "stopped", "error", "smell", "odor"  # odor ambiguous but often negative
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
    required = ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_USER_AGENT"]
    missing = [k for k in required if not os.getenv(k)]
    if missing:
        raise EnvironmentError(f"Missing environment variables: {missing}. Set them or create a .env file.")
    return praw.Reddit(
        client_id=os.environ["REDDIT_CLIENT_ID"],
        client_secret=os.environ["REDDIT_CLIENT_SECRET"],
        user_agent=os.environ["REDDIT_USER_AGENT"],
    )


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def search_subreddit(reddit: "praw.Reddit", subreddit: str, query: str, limit: int):
    return list(reddit.subreddit(subreddit).search(query, limit=limit, sort="relevance"))


def collect_posts(query: str, subreddits: List[str], per_sub_limit: int, sleep: float = 1.2) -> List[RedditPost]:
    reddit = build_reddit_client()
    posts: List[RedditPost] = []
    seen_ids = set()
    for sub in subreddits:
        try:
            submissions = search_subreddit(reddit, sub, query, per_sub_limit)
        except Exception as e:  # pragma: no cover
            print(f"[WARN] Failed subreddit {sub}: {e}")
            continue
        for submission in submissions:
            if submission.id in seen_ids:
                continue
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
        time.sleep(sleep)
    return posts


def save_posts(posts: List[RedditPost], output: Path):
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


def summarize(posts: List[RedditPost]) -> Dict[str, Any]:
    import collections
    by_sent = collections.Counter(p.sentiment for p in posts)
    return {
        "total_posts": len(posts),
        "sentiment_distribution": dict(by_sent),
        "avg_polarity": round(sum(p.polarity for p in posts) / len(posts), 4) if posts else 0.0,
        "avg_subjectivity": round(sum(p.subjectivity for p in posts) / len(posts), 4) if posts else 0.0,
    }


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="LG Styler Reddit sentiment crawler")
    parser.add_argument("--query", default="lg styler", help="Search query string")
    parser.add_argument("--subreddits", nargs="*", default=[
        "appliances", "homeappliances", "laundry", "home", "BuyItForLife", "technology", "Malelivingspace", "LG_UserHub"
    ], help="Target subreddit list (LG_UserHub 포함)")
    parser.add_argument("--limit", type=int, default=100, help="Per-subreddit search limit")
    parser.add_argument("--output", default="data/lg_styler/reddit_posts.csv", help="Output file path (.csv/.json/.jsonl)")
    return parser.parse_args(argv)


def main(argv: List[str]):
    args = parse_args(argv)
    posts = collect_posts(args.query, args.subreddits, args.limit)
    save_posts(posts, Path(args.output))
    stats = summarize(posts)
    print("Summary:")
    for k, v in stats.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":  # pragma: no cover
    main(sys.argv[1:])
