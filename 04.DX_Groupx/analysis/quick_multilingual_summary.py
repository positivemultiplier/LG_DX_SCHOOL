#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""다국어 크롤링 데이터 빠른 요약"""

import pandas as pd
from pathlib import Path

# 데이터 로드
youtube_file = Path('data/raw/youtube_multilingual_20251117_115817.csv')
twitter_file = Path('data/raw/twitter_japan_20251117_115817.csv')

print("="*60)
print("다국어 한국 여행 불만사항 데이터 요약")
print("="*60)

# YouTube 다국어 댓글
if youtube_file.exists():
    df_youtube = pd.read_csv(youtube_file)
    print(f"\n📺 YouTube 다국어 댓글: {len(df_youtube):,}건")
    print(f"\n언어별 분포:")
    print(df_youtube['language'].value_counts())
    
    print(f"\n=== 샘플 댓글 (중국어) ===")
    zh_sample = df_youtube[df_youtube['language']=='zh'][['text', 'query', 'likes']].head(5)
    for idx, row in zh_sample.iterrows():
        print(f"\n쿼리: {row['query']}")
        print(f"댓글: {row['text'][:150]}")
        print(f"좋아요: {row['likes']}개")
    
    print(f"\n=== 샘플 댓글 (일본어) ===")
    ja_sample = df_youtube[df_youtube['language']=='ja'][['text', 'query', 'likes']].head(3)
    for idx, row in ja_sample.iterrows():
        print(f"\n쿼리: {row['query']}")
        print(f"댓글: {row['text'][:150]}")
        print(f"좋아요: {row['likes']}개")

# Twitter 일본어 트윗
if twitter_file.exists():
    df_twitter = pd.read_csv(twitter_file)
    print(f"\n\n🐦 Twitter 일본어 트윗: {len(df_twitter):,}건")
    
    print(f"\n=== 샘플 트윗 ===")
    for idx, row in df_twitter.head(4).iterrows():
        print(f"\n트윗: {row['text'][:200]}")
        print(f"좋아요: {row['likes']}개 | 리트윗: {row['retweets']}개")

print("\n" + "="*60)
print(f"✅ 총 수집: {len(df_youtube) + len(df_twitter):,}건")
print("="*60)
