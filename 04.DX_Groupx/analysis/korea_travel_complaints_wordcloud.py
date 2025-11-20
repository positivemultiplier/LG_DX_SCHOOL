#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
한국 여행 불편사항 워드클라우드 생성
전략: 부정 댓글에서 핵심 불편 키워드만 추출
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from collections import Counter
import re
from pathlib import Path

# 한글 폰트 설정
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

# ===========================================
# 1. 전략적 키워드 사전 정의
# ===========================================

# 불편사항 카테고리별 핵심 키워드
COMPLAINT_KEYWORDS = {
    'language_barrier': [
        'language', 'english', 'speak', 'understand', 'translation', 
        'communicate', 'korean only', 'cant speak', 'no english',
        'language barrier', 'hard to communicate'
    ],
    'transportation': [
        'taxi', 'subway', 'bus', 'train', 'transportation', 'metro',
        'public transport', 'confusing', 'crowded', 'expensive taxi',
        'navigation', 'getting around', 'scam taxi', 'overcharge'
    ],
    'cost': [
        'expensive', 'overpriced', 'costly', 'price', 'money',
        'rip off', 'scam', 'tourist price', 'overcharge', 'waste money'
    ],
    'service': [
        'rude', 'unfriendly', 'impolite', 'disrespectful', 'racist',
        'discrimination', 'poor service', 'bad service', 'attitude',
        'unwelcoming', 'stare', 'judge'
    ],
    'food': [
        'spicy', 'kimchi', 'food allergy', 'menu', 'restaurant',
        'side dishes', 'banchan', 'no vegetarian', 'limited options'
    ],
    'payment': [
        'cash only', 'credit card', 'payment', 'foreign card',
        'card declined', 'atm', 'exchange'
    ],
    'navigation': [
        'lost', 'confusing', 'hard to find', 'direction', 'signage',
        'map', 'gps', 'address system', 'difficult navigate'
    ],
    'accommodation': [
        'hotel', 'airbnb', 'hostel', 'room', 'small room', 'tiny',
        'uncomfortable bed', 'noise', 'location'
    ]
}

# 제외할 불용어 (한국 관련 중립 단어 + 일반 불용어)
STOPWORDS = {
    # 국가/도시명
    'korea', 'korean', 'south korea', 'seoul', 'busan', 'jeju', 
    'asia', 'asian', 'country', 'city',
    
    # 일반 여행 단어
    'travel', 'trip', 'visit', 'tourist', 'tourism', 'vacation',
    'place', 'go', 'went', 'going', 'come', 'came', 'see', 'saw',
    
    # 일반 불용어
    'the', 'and', 'or', 'but', 'if', 'then', 'so', 'as', 'at', 'by',
    'to', 'in', 'on', 'of', 'for', 'with', 'from', 'about', 'into',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
    'can', 'cant', 'cannot', 'dont', 'doesnt', 'didnt', 'wont', 'wouldnt',
    'im', 'ive', 'id', 'ill', 'youre', 'youve', 'youd', 'youll',
    'its', 'thats', 'theres', 'theyre', 'whats', 'wheres', 'heres',
    'this', 'that', 'these', 'those', 'it', 'they', 'them', 'their',
    'my', 'me', 'mine', 'your', 'you', 'yours', 'his', 'her', 'hers',
    'we', 'us', 'our', 'ours', 'one', 'ones', 'some', 'any', 'many',
    'much', 'more', 'most', 'all', 'both', 'few', 'little', 'own',
    'other', 'another', 'such', 'no', 'not', 'only', 'just', 'very',
    'too', 'also', 'well', 'even', 'still', 'really', 'quite',
    'video', 'comment', 'youtube', 'reddit', 'post', 'thread',
    'people', 'person', 'time', 'day', 'year', 'thing', 'way', 'lot',
    'get', 'got', 'make', 'made', 'take', 'took', 'know', 'think',
    'want', 'need', 'like', 'said', 'says', 'because', 'when', 'where',
    'how', 'why', 'what', 'which', 'who', 'whom', 'whose', 'there'
}

# ===========================================
# 2. 텍스트 정제 함수
# ===========================================

def clean_text(text):
    """텍스트 정제: URL, 특수문자, 숫자 제거"""
    if pd.isna(text):
        return ""
    
    # 소문자 변환
    text = str(text).lower()
    
    # URL 제거
    text = re.sub(r'http\S+|www\S+|https\S+', '', text)
    
    # 이메일 제거
    text = re.sub(r'\S+@\S+', '', text)
    
    # 특수문자 제거 (알파벳, 공백만 유지)
    text = re.sub(r'[^a-z\s]', ' ', text)
    
    # 여러 공백을 하나로
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()

def extract_keywords(text, min_length=3):
    """키워드 추출: 불용어 제거 + 최소 길이 필터"""
    words = text.split()
    keywords = [
        word for word in words 
        if len(word) >= min_length and word not in STOPWORDS
    ]
    return keywords

def extract_bigrams(text):
    """2-gram (두 단어 조합) 추출"""
    words = text.split()
    bigrams = []
    for i in range(len(words) - 1):
        bigram = f"{words[i]} {words[i+1]}"
        # 불편사항 관련 bigram만
        if any(keyword in bigram for category in COMPLAINT_KEYWORDS.values() for keyword in category):
            bigrams.append(bigram)
    return bigrams

# ===========================================
# 3. 데이터 로드 및 전처리
# ===========================================

print("="*60)
print("한국 여행 불편사항 워드클라우드 생성")
print("="*60)

# YouTube 데이터
df_youtube = pd.read_csv('data/raw/youtube_comments.csv')
print(f"\n📺 YouTube 댓글: {len(df_youtube):,}건")
print(f"   부정 댓글: {(df_youtube['sentiment'] == 'negative').sum()}건")

# Reddit 데이터
df_reddit = pd.read_csv('data/raw/reddit_korea_travel.csv')
print(f"\n🔴 Reddit 포스트: {len(df_reddit):,}건")
print(f"   부정 포스트: {(df_reddit['sentiment'] == 'negative').sum()}건")

# ===========================================
# 4. 부정 댓글만 필터링
# ===========================================

# YouTube 부정 댓글
youtube_negative = df_youtube[df_youtube['sentiment'] == 'negative']['comment_text'].tolist()

# Reddit 부정 포스트 (제목 + 본문)
reddit_negative = df_reddit[df_reddit['sentiment'] == 'negative']['combined_text'].tolist()

print(f"\n✅ 분석 대상:")
print(f"   YouTube 부정 댓글: {len(youtube_negative)}건")
print(f"   Reddit 부정 포스트: {len(reddit_negative)}건")

# 전체 부정 텍스트 통합
all_negative_texts = youtube_negative + reddit_negative

# ===========================================
# 5. 키워드 추출 및 빈도 계산
# ===========================================

print("\n🔍 키워드 추출 중...")

all_keywords = []
all_bigrams = []

for text in all_negative_texts:
    cleaned = clean_text(text)
    
    # 단일 키워드
    keywords = extract_keywords(cleaned)
    all_keywords.extend(keywords)
    
    # 2-gram
    bigrams = extract_bigrams(cleaned)
    all_bigrams.extend(bigrams)

# 빈도 계산
keyword_freq = Counter(all_keywords)
bigram_freq = Counter(all_bigrams)

print(f"\n📊 추출 결과:")
print(f"   고유 단일 키워드: {len(keyword_freq)}개")
print(f"   고유 2-gram: {len(bigram_freq)}개")

# ===========================================
# 6. 불편사항 관련 키워드만 필터링
# ===========================================

# 카테고리별 키워드 플랫 리스트
complaint_keywords_flat = [kw for category in COMPLAINT_KEYWORDS.values() for kw in category]

# 필터링: 불편사항 관련 + 최소 빈도 3회
filtered_keywords = {
    word: freq for word, freq in keyword_freq.items()
    if freq >= 3 and (
        word in complaint_keywords_flat or
        any(kw in word for kw in complaint_keywords_flat)
    )
}

filtered_bigrams = {
    bigram: freq for bigram, freq in bigram_freq.items()
    if freq >= 2
}

print(f"\n🎯 필터링 후:")
print(f"   불편사항 키워드: {len(filtered_keywords)}개")
print(f"   불편사항 구문: {len(filtered_bigrams)}개")

# ===========================================
# 7. TOP 키워드 출력
# ===========================================

print(f"\n📌 TOP 20 불편사항 키워드:")
for word, freq in sorted(filtered_keywords.items(), key=lambda x: x[1], reverse=True)[:20]:
    print(f"   {word:20s}: {freq:3d}회")

print(f"\n📌 TOP 10 불편사항 구문 (2-gram):")
for bigram, freq in sorted(filtered_bigrams.items(), key=lambda x: x[1], reverse=True)[:10]:
    print(f"   {bigram:30s}: {freq:3d}회")

# ===========================================
# 8. 워드클라우드 생성
# ===========================================

print(f"\n🎨 워드클라우드 생성 중...")

# 단일 키워드 + 2-gram 통합 (2-gram은 가중치 1.5배)
wordcloud_dict = {**filtered_keywords}
for bigram, freq in filtered_bigrams.items():
    wordcloud_dict[bigram] = int(freq * 1.5)

# 워드클라우드 생성
wordcloud = WordCloud(
    width=1600,
    height=800,
    background_color='white',
    colormap='Reds',  # 불편사항이므로 빨간 계열
    max_words=100,
    relative_scaling=0.5,
    min_font_size=10,
    prefer_horizontal=0.7
).generate_from_frequencies(wordcloud_dict)

# 시각화
fig, axes = plt.subplots(1, 2, figsize=(20, 8))

# 워드클라우드
axes[0].imshow(wordcloud, interpolation='bilinear')
axes[0].axis('off')
axes[0].set_title('한국 여행 불편사항 워드클라우드', fontsize=20, fontweight='bold', pad=20)

# TOP 15 막대 차트
top_15 = dict(sorted(filtered_keywords.items(), key=lambda x: x[1], reverse=True)[:15])
axes[1].barh(list(top_15.keys()), list(top_15.values()), color='#d62728')
axes[1].set_xlabel('언급 횟수', fontsize=12)
axes[1].set_title('TOP 15 불편사항 키워드', fontsize=16, fontweight='bold')
axes[1].invert_yaxis()
axes[1].grid(axis='x', alpha=0.3)

plt.tight_layout()

# 저장
output_dir = Path('data/figures')
output_dir.mkdir(parents=True, exist_ok=True)
output_path = output_dir / 'korea_travel_complaints_wordcloud.png'
plt.savefig(output_path, dpi=300, bbox_inches='tight')
print(f"\n✅ 저장 완료: {output_path}")

# ===========================================
# 9. 카테고리별 분석
# ===========================================

print(f"\n📊 불편사항 카테고리별 분석:")

category_counts = {}
for category, keywords in COMPLAINT_KEYWORDS.items():
    count = sum(filtered_keywords.get(kw, 0) for kw in keywords)
    if count > 0:
        category_counts[category] = count

# 카테고리 차트
fig, ax = plt.subplots(figsize=(12, 6))
categories = list(category_counts.keys())
counts = list(category_counts.values())

# 한글 카테고리명
category_names_kr = {
    'language_barrier': '언어 장벽',
    'transportation': '교통/이동',
    'cost': '비용/가격',
    'service': '서비스 태도',
    'food': '음식',
    'payment': '결제',
    'navigation': '내비게이션',
    'accommodation': '숙박'
}

categories_kr = [category_names_kr.get(c, c) for c in categories]

bars = ax.bar(categories_kr, counts, color=['#d62728', '#ff7f0e', '#2ca02c', '#1f77b4', 
                                              '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'][:len(counts)])
ax.set_ylabel('언급 횟수', fontsize=12)
ax.set_title('불편사항 카테고리별 분포', fontsize=16, fontweight='bold')
ax.grid(axis='y', alpha=0.3)
plt.xticks(rotation=45, ha='right')

# 막대 위에 숫자 표시
for bar in bars:
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height,
            f'{int(height)}',
            ha='center', va='bottom', fontsize=10)

plt.tight_layout()
category_path = output_dir / 'korea_travel_complaints_by_category.png'
plt.savefig(category_path, dpi=300, bbox_inches='tight')
print(f"✅ 카테고리 차트 저장: {category_path}")

# 카테고리별 통계
print(f"\n카테고리별 언급 횟수:")
for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
    cat_kr = category_names_kr.get(cat, cat)
    print(f"   {cat_kr:15s}: {count:3d}회")

print("\n" + "="*60)
print("✅ 워드클라우드 생성 완료!")
print("="*60)
