# LG Styler Reddit Crawler

Collect Reddit posts related to LG Styler and label sentiment (positive / negative / neutral).

## Features
- Multi-subreddit search with de-duplication
- Simple sentiment scoring (TextBlob + custom lexicon adjustment)
- Retry with backoff for transient API errors
- Output to CSV / JSON / JSONL

## Setup
1. Install dependencies
   ```powershell
   pip install -r requirements.txt
   ```
2. Create a Reddit app (https://www.reddit.com/prefs/apps) and obtain:
   - client id
   - client secret
   - user agent (custom string)
3. Set environment variables (PowerShell):
   ```powershell
   $env:REDDIT_CLIENT_ID="your_id"
   $env:REDDIT_CLIENT_SECRET="your_secret"
   $env:REDDIT_USER_AGENT="lg-dx-school-styler-crawler/0.1 by your_reddit_username"
   ```
4. Run crawler:
   ```powershell
   python src/reddit_crawler/lg_styler_crawler.py --query "lg styler" --limit 150 --output data/lg_styler/reddit_posts.csv
   ```

## Output Columns
| Column | Description |
|--------|-------------|
| id | Reddit submission ID |
| subreddit | Subreddit name |
| title | Post title |
| selftext | Body text |
| created_utc | Creation timestamp (UTC epoch) |
| score | Upvote score |
| num_comments | Number of comments |
| permalink | Full Reddit permalink |
| url | Linked URL if any |
| flair | Flair text |
| combined_text | Title + body for sentiment |
| sentiment | positive / negative / neutral |
| polarity | Adjusted polarity score |
| subjectivity | TextBlob subjectivity |

## Notes
- This uses Reddit's public search; for large scale historical data consider Pushshift alternatives (respect terms of service).
- Sentiment model is heuristic; for production consider a fine-tuned transformer.

## Next Ideas
- Add comment sentiment aggregation
- Keyword frequency & wordcloud generation
- Topic modeling (LDA) for appliance use cases
