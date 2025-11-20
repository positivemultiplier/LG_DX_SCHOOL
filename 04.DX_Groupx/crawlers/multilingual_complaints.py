#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Multi-lingual Korea Travel Complaints Crawler
중국인, 일본인, 동남아인의 한국 여행 불만사항 수집

Data Sources:
- Weibo (微博) - Chinese social media
- Twitter/X - Japanese tourists (#韓国旅行, #韓国旅行記)
- TripAdvisor - Multi-lingual reviews (Chinese, Japanese, Thai, Vietnamese)
- Google Reviews - Seoul/Busan/Jeju attractions
"""

import requests
import json
import pandas as pd
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict
import re
from deep_translator import GoogleTranslator
import os
from dotenv import load_dotenv

# .env 파일 로드 (상위 디렉토리에서 찾기)
load_dotenv(Path(__file__).parent.parent.parent / '.env')

# 출력 디렉토리 생성
OUTPUT_DIR = Path("data/raw")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ====================
# TripAdvisor Scraper
# ====================

def scrape_tripadvisor_reviews(location_ids: List[str], languages: List[str]) -> List[Dict]:
    """
    TripAdvisor 리뷰 크롤링 (중국어, 일본어, 태국어, 베트남어)
    
    주요 관광지:
    - 서울: 명동, 남산타워, 경복궁, 홍대
    - 부산: 해운대, 감천문화마을, 광안리
    - 제주: 한라산, 성산일출봉, 중문관광단지
    - 광주: 무등산, 광주비엔날레, 양림동
    """
    reviews = []
    
    # TripAdvisor 주요 관광지 ID (실제로는 API 키 필요)
    locations = {
        "seoul_myeongdong": "명동",
        "seoul_namsan": "남산타워",
        "busan_haeundae": "해운대",
        "jeju_hallasan": "한라산",
        "gwangju_mudeungsan": "무등산"
    }
    
    print("⚠️  TripAdvisor는 공식 API가 필요합니다.")
    print("   대체 방법: Google Reviews API 또는 직접 스크래핑")
    
    return reviews


# ====================
# Google Reviews (Places API)
# ====================

def fetch_google_reviews(place_ids: List[str], languages: List[str]) -> List[Dict]:
    """
    Google Places API로 다국어 리뷰 수집
    
    필요: GOOGLE_PLACES_API_KEY
    """
    import os
    api_key = os.getenv('GOOGLE_PLACES_API_KEY')
    
    if not api_key:
        print("⚠️  GOOGLE_PLACES_API_KEY가 .env에 없습니다.")
        return []
    
    reviews = []
    base_url = "https://maps.googleapis.com/maps/api/place/details/json"
    
    # 주요 관광지 Place ID (예시)
    places = {
        "ChIJzQ7U0FWifDURH5pLwvCU7SE": "명동 거리",
        "ChIJzc7Z_jWjfDURm-TauMHO9kI": "해운대 해수욕장",
        "ChIJzWj2jL6rczUR2V5QT7EAqMI": "한라산 국립공원",
    }
    
    for place_id, place_name in places.items():
        for language in languages:
            try:
                params = {
                    'place_id': place_id,
                    'key': api_key,
                    'language': language,
                    'fields': 'name,reviews'
                }
                
                response = requests.get(base_url, params=params, timeout=10)
                data = response.json()
                
                if data.get('status') == 'OK':
                    place_reviews = data.get('result', {}).get('reviews', [])
                    
                    for review in place_reviews:
                        reviews.append({
                            'place_id': place_id,
                            'place_name': place_name,
                            'language': language,
                            'author': review.get('author_name'),
                            'rating': review.get('rating'),
                            'text': review.get('text'),
                            'time': review.get('time'),
                            'translated': review.get('translated', False)
                        })
                    
                    print(f"✅ {place_name} ({language}): {len(place_reviews)}개 리뷰")
                
                time.sleep(0.5)  # Rate limiting
                
            except Exception as e:
                print(f"❌ {place_name} ({language}) 오류: {e}")
                continue
    
    return reviews


# ====================
# Twitter/X API (일본인 트윗)
# ====================

def fetch_twitter_japan_complaints(keywords: List[str], max_tweets: int = 200) -> List[Dict]:
    """
    Twitter API v2로 일본인의 한국 여행 불만 트윗 수집
    
    검색 키워드:
    - #韓国旅行 失敗 (한국여행 실패)
    - #韓国 不便 (한국 불편)
    - ソウル 問題 (서울 문제)
    - 韓国 タクシー ぼったくり (한국 택시 바가지)
    - 韓国 言葉 通じない (한국 언어 소통 불가)
    - 済州島 観光 失敗 (제주도 관광 실패)
    """
    import os
    bearer_token = os.getenv('TWITTER_BEARER_TOKEN')
    
    if not bearer_token:
        print("⚠️  TWITTER_BEARER_TOKEN이 .env에 없습니다.")
        return []
    
    tweets = []
    base_url = "https://api.twitter.com/2/tweets/search/recent"
    
    headers = {
        'Authorization': f'Bearer {bearer_token}'
    }
    
    japanese_keywords = [
        "韓国旅行 失敗",
        "韓国 不便",
        "ソウル 問題",
        "韓国 タクシー ぼったくり",
        "韓国 言葉 通じない",
        "済州島 観光 失敗"
    ]
    
    for keyword in japanese_keywords:
        try:
            params = {
                'query': f'{keyword} -is:retweet lang:ja',
                'max_results': min(max_tweets, 100),
                'tweet.fields': 'created_at,lang,public_metrics',
                'expansions': 'author_id'
            }
            
            response = requests.get(base_url, headers=headers, params=params, timeout=10)
            data = response.json()
            
            if 'data' in data:
                for tweet in data['data']:
                    tweets.append({
                        'id': tweet['id'],
                        'text': tweet['text'],
                        'created_at': tweet['created_at'],
                        'language': 'ja',
                        'keyword': keyword,
                        'likes': tweet.get('public_metrics', {}).get('like_count', 0),
                        'retweets': tweet.get('public_metrics', {}).get('retweet_count', 0)
                    })
                
                print(f"✅ Twitter (일본어) '{keyword}': {len(data['data'])}개 트윗")
            
            time.sleep(1.0)  # Rate limiting
            
        except Exception as e:
            print(f"❌ Twitter '{keyword}' 오류: {e}")
            continue
    
    return tweets


# ====================
# Weibo API (중국인 게시물)
# ====================

def fetch_weibo_posts(keywords: List[str], max_posts: int = 200) -> List[Dict]:
    """
    Weibo (微博) API로 중국인의 한국 여행 불만 수집
    
    검색 키워드:
    - 韩国旅游 问题 (한국여행 문제)
    - 首尔 不方便 (서울 불편)
    - 韩国 出租车 宰客 (한국 택시 바가지)
    - 济州岛 旅游 失望 (제주도 여행 실망)
    """
    print("⚠️  Weibo API는 중국 내 인증이 필요합니다.")
    print("   대체 방법: Xiaohongshu (小红书) 또는 공개 데이터셋 활용")
    
    # 예시 데이터 구조
    posts = []
    
    chinese_keywords = [
        "韩国旅游 问题",
        "首尔 不方便", 
        "韩国 出租车 宰客",
        "济州岛 旅游 失望",
        "韩国 语言 不通",
        "釜山 旅游 糟糕经历"
    ]
    
    # 실제 구현 시 Weibo API 또는 스크래핑 로직 추가
    
    return posts


# ====================
# 멀티링구얼 번역 및 감성 분석
# ====================

def translate_to_english(text: str, source_lang: str) -> str:
    """Google Translate로 영어 번역"""
    try:
        translator = GoogleTranslator(source=source_lang, target='en')
        return translator.translate(text)
    except Exception as e:
        print(f"번역 오류: {e}")
        return text


def analyze_multilingual_sentiment(text: str, language: str) -> Dict:
    """
    다국어 감성 분석
    - TextBlob (영어)
    - 중국어/일본어: 번역 후 TextBlob
    """
    from textblob import TextBlob
    
    # 영어가 아니면 번역
    if language != 'en':
        text_en = translate_to_english(text, language)
    else:
        text_en = text
    
    blob = TextBlob(text_en)
    polarity = blob.sentiment.polarity
    
    if polarity > 0.1:
        sentiment = 'positive'
    elif polarity < -0.1:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'
    
    return {
        'sentiment': sentiment,
        'polarity': polarity,
        'original_text': text,
        'translated_text': text_en if language != 'en' else None
    }


# ====================
# YouTube 다국어 댓글 (추가)
# ====================

def fetch_youtube_multilingual_comments(video_queries: Dict[str, List[str]], max_videos: int = 20) -> List[Dict]:
    """
    YouTube에서 중국어/일본어 댓글 수집
    
    video_queries = {
        'zh': ['韩国旅游', '首尔旅行'],
        'ja': ['韓国旅行', 'ソウル観光'],
        'th': ['เที่ยวเกาหลี', 'โซล'],
        'vi': ['du lịch hàn quốc', 'seoul']
    }
    """
    import os
    from googleapiclient.discovery import build
    
    api_key = os.getenv('YOUTUBE_API_KEY')
    if not api_key:
        print("⚠️  YOUTUBE_API_KEY가 .env에 없습니다.")
        return []
    
    youtube = build('youtube', 'v3', developerKey=api_key)
    all_comments = []
    
    for language, queries in video_queries.items():
        for query in queries:
            try:
                # 비디오 검색
                search_response = youtube.search().list(
                    q=query,
                    part='id',
                    maxResults=max_videos,
                    type='video',
                    relevanceLanguage=language
                ).execute()
                
                video_ids = [item['id']['videoId'] for item in search_response.get('items', [])]
                
                # 댓글 수집
                for video_id in video_ids:
                    try:
                        comments_response = youtube.commentThreads().list(
                            part='snippet',
                            videoId=video_id,
                            maxResults=50,
                            textFormat='plainText'
                        ).execute()
                        
                        for item in comments_response.get('items', []):
                            comment = item['snippet']['topLevelComment']['snippet']
                            all_comments.append({
                                'video_id': video_id,
                                'query': query,
                                'language': language,
                                'author': comment['authorDisplayName'],
                                'text': comment['textDisplay'],
                                'likes': comment['likeCount'],
                                'published_at': comment['publishedAt']
                            })
                        
                        print(f"✅ YouTube ({language}) '{query}': {len(comments_response.get('items', []))}개 댓글")
                        time.sleep(1.0)
                        
                    except Exception as e:
                        print(f"⚠️  비디오 {video_id} 댓글 수집 실패: {e}")
                        continue
                
            except Exception as e:
                print(f"❌ YouTube 검색 오류 ({language} '{query}'): {e}")
                continue
    
    return all_comments


# ====================
# 메인 실행
# ====================

def main():
    print("=" * 60)
    print("Multi-lingual Korea Travel Complaints Crawler")
    print("중국어, 일본어, 동남아어 한국 여행 불만 수집")
    print("=" * 60)
    print()
    
    all_data = {
        'google_reviews': [],
        'twitter_japan': [],
        'weibo_china': [],
        'youtube_multilingual': []
    }
    
    # 1. Google Reviews (다국어)
    print("\n[1/4] Google Reviews 수집 중...")
    languages_google = ['zh-CN', 'ja', 'th', 'vi']
    place_ids = [
        "ChIJzQ7U0FWifDURH5pLwvCU7SE",  # 명동
        "ChIJzc7Z_jWjfDURm-TauMHO9kI",  # 해운대
        "ChIJzWj2jL6rczUR2V5QT7EAqMI",  # 한라산
    ]
    all_data['google_reviews'] = fetch_google_reviews(place_ids, languages_google)
    
    # 2. Twitter (일본어)
    print("\n[2/4] Twitter 일본어 트윗 수집 중...")
    all_data['twitter_japan'] = fetch_twitter_japan_complaints([], max_tweets=200)
    
    # 3. Weibo (중국어) - 현재 미구현
    print("\n[3/4] Weibo 중국어 게시물 수집 (스킵)...")
    
    # 4. YouTube (다국어)
    print("\n[4/4] YouTube 다국어 댓글 수집 중...")
    video_queries = {
        'zh': ['韩国旅游 问题', '首尔旅行 失望'],
        'ja': ['韓国旅行 失敗', 'ソウル 不便'],
        'th': ['เที่ยวเกาหลี ปัญหา'],
        'vi': ['du lịch hàn quốc khó khăn']
    }
    all_data['youtube_multilingual'] = fetch_youtube_multilingual_comments(video_queries, max_videos=20)
    
    # 데이터 저장
    print("\n" + "=" * 60)
    print("데이터 저장 중...")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Google Reviews
    if all_data['google_reviews']:
        df_google = pd.DataFrame(all_data['google_reviews'])
        output_file = OUTPUT_DIR / f"google_reviews_multilingual_{timestamp}.csv"
        df_google.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"✅ Google Reviews: {len(df_google)}건 → {output_file}")
    
    # Twitter Japan
    if all_data['twitter_japan']:
        df_twitter = pd.DataFrame(all_data['twitter_japan'])
        output_file = OUTPUT_DIR / f"twitter_japan_{timestamp}.csv"
        df_twitter.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"✅ Twitter (일본): {len(df_twitter)}건 → {output_file}")
    
    # YouTube Multilingual
    if all_data['youtube_multilingual']:
        df_youtube = pd.DataFrame(all_data['youtube_multilingual'])
        output_file = OUTPUT_DIR / f"youtube_multilingual_{timestamp}.csv"
        df_youtube.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"✅ YouTube (다국어): {len(df_youtube)}건 → {output_file}")
    
    # 전체 통계
    total = sum(len(data) for data in all_data.values())
    print(f"\n📊 총 수집 데이터: {total:,}건")
    print("=" * 60)


if __name__ == "__main__":
    main()
