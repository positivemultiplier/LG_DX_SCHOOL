# 외국인 한국여행 불편사항 크롤링 및 분석 실행 계획

**작성일**: 2025-11-14  
**작성자**: LG DX School - DX Group  
**목표**: Reddit, YouTube, Naver 블로그에서 외국인 한국여행 불편사항 수집 → 감성분석, 토픽모델링, 워드클라우드 시각화

---

## Executive Summary

**핵심 목표**: 8개 카테고리(언어·교통·음식·결제·문화·안전·숙소·정보불균형) 기준 외국인 한국여행 페인포인트 정량 분석

**크롤링 대상**:
- Reddit: r/korea, r/travel, r/solotravel (목표 500+ posts)
- YouTube: "Korea travel problems" 검색 (목표 100+ videos × 100 comments)
- Naver 블로그: "한국여행 외국인 불편" (목표 200+ blogs)

**기술 스택**:
- 크롤러: PRAW (Reddit API), YouTube Data API v3, Naver Search API
- 분석: TextBlob/VADER (감성), NMF (토픽모델링), WordCloud
- 환경: Python 3.10+, Windows PowerShell, Jupyter Notebook

**산출물**:
- `data/raw/*.csv`: 원천 데이터
- `data/processed/sentiment_labeled.csv`: 감성 스코어링 완료 데이터
- `data/figures/*.png`: 워드클라우드, 토픽 분포, 감성 차트
- `ANALYSIS_REPORT.md`: 인사이트 요약 보고서

---

## 1. 상위 카테고리 (크롤링 구조 설계용)

1. **언어·소통 문제 (Language & Communication)**
2. **교통·길찾기 (Navigation & Transportation)**
3. **음식·메뉴판 (Food & Menu Barriers)**
4. **결제·앱 사용 (Payment & Mobile Usability)**
5. **문화 차이 (Culture Gap)**
6. **안전·위험 (Safety & Night Travel)**
7. **숙소·편의시설 (Accommodation & Convenience)**
8. **정보 불균형 (Information Asymmetry)**

---

## 2. 크롤링용 핵심 키워드 (영문 중심)

### 2-1. 언어·소통 문제 (Language Barrier)

```
"Korea travel language problem"
"Korea English menu not available"
"Korea difficult to communicate"
"Korea translation issue"
"Korea signs not in English"
"Korea taxi communication problem"
"Korea language barrier restaurant"
```

### 2-2. 길찾기·교통 (Navigation/Transportation)

```
"Korea subway confusing"
"Korea bus difficult for tourists"
"How to get to [명소] in Seoul"
"Korea Google Maps not working"
"Naver Map hard to use"
"Kakao Map English problem"
"Korea taxi overcharge"
"Korea airport transport confusing"
```

### 2-3. 음식·메뉴판 (Food/Menu Issues)

```
"Korea restaurant no English menu"
"Korean food too spicy reviews"
"Korea menu translation wrong"
"Ordering food in Korea difficult"
"Korea table manner confusion"
"Korean BBQ how to order"
"Korea tipping or no tipping"
"Korea vegan food hard to find"
```

### 2-4. 결제·앱 사용 의존도 (Payment/App Issues)

```
"Korea payment problem tourist"
"Korea cash only store"
"Korea card not working"
"Korea mobile app required"
"Korea ID verification issue"
"KakaoTalk account problem"
"Coupang global shipping issue"
```

### 2-5. 문화 차이 (Culture/Customs)

```
"Korea cultural differences"
"Korea etiquette confusion"
"Korea table manners foreigner"
"Korea public behavior rules"
"Korea local customs tourist"
"Korea work hour closed"
```

### 2-6. 안전·위험 (Safety Issues)

```
"Is Korea safe at night"
"Korea taxi scam"
"Korea dark alley safety"
"Korea pickpocket risk"
"Korea emergency number issue"
"Korea police language barrier"
```

### 2-7. 숙소·시설 (Accommodation)

```
"Korea Airbnb problems"
"Korea hotel check-in issues"
"Korea guesthouse safety"
"Korea hostel cleanliness"
"Korea late check-in impossible"
```

### 2-8. 정보 불균형 (Information Gap)

```
"Korea tourist trap"
"Korea hidden costs"
"Korea restaurant overprice"
"Korea travel scam"
"Best local restaurant not touristy Korea"
"Korea what foreigners should know"
```

---

## 3. 국가별 페인포인트 크롤링 키워드 (국가 특성 반영)

### 일본인

```
"韓国 旅行 迷う" (길 찾기 어려움)
"韓国 メニュー 英語 ない"
"韓国 カード 使えない"
"韓国 治安 夜"
```

### 중국인

```
"韩国 旅行 难点"
"韩国 支付 问题"
"韩国 菜单 没有 中文"
"韩国 安全"
```

### 미국/유럽

```
"Korea travel problem"
"Why is Google Maps not working in Korea"
"Korea credit card declined"
"Korea English menu rare"
```

### 동남아 (태국/베트남/필리핀)

```
"Korea travel tips for first timer"
"Korea food difficult to order"
"Korea cold weather problems"
"Korea tourist scam"
```

---

## 4. SNS/리뷰 크롤링 채널별 키워드 전략

### Reddit (r/korea / r/travel / r/solotravel)

**쿼리 전략**:
```python
QUERIES = [
    "Korea trip issues",
    "Korea travel things nobody tells you",
    "Korea travel frustration",
    "Korea foreigner complaints",
    "Korea travel problems",
    "Seoul tourist difficulties"
]
```

**수집 항목**: 제목, 본문, 댓글, 스코어, 작성일, 서브레딧

### YouTube

**쿼리 전략**:
```python
QUERIES = [
    "Korea travel mistakes",
    "Korea travel tips for foreigners",
    "Korea what I wish I knew",
    "Korea culture shock",
    "Korea travel problems foreigner"
]
```

**수집 항목**: 비디오 제목, 설명, 댓글, 좋아요 수, 게시일

### Naver 블로그

**쿼리 전략**:
```python
QUERIES = [
    "한국여행 외국인 불편",
    "외국인 한국 여행 후기",
    "한국 관광 문제점",
    "외국인 한국 생활 어려움"
]
```

**수집 항목**: 제목, 본문, 블로거명, 게시일

### TripAdvisor (선택)

**제약사항**: 공식 API 없음, robots.txt 제한, CAPTCHA 위험  
**권장**: Reddit/YouTube로 충분한 데이터 확보 가능 → **1차 파이프라인 제외**

---

## 5. 기술 스택 및 도구

### 5-1. 크롤링 라이브러리

| 채널 | 라이브러리 | API 키 필요 | 쿼터 제한 |
|------|-----------|------------|-----------|
| Reddit | `praw` | ✅ (Client ID/Secret) | 60 req/min |
| YouTube | `google-api-python-client` | ✅ (API Key) | 10,000 units/day |
| Naver | `requests` | ✅ (Client ID/Secret) | 25,000 calls/day |

### 5-2. 분석 라이브러리

```python
# 감성분석
textblob                 # 영어 감성
vaderSentiment           # 소셜 미디어 감성 (영어)

# 다국어 처리
langdetect               # 언어 감지
konlpy                   # 한국어 형태소 분석
jieba                    # 중국어 토큰화
mecab-python3            # 일본어 토큰화 (선택)

# 토픽모델링 & 시각화
scikit-learn             # TF-IDF, NMF, KMeans
wordcloud                # 워드클라우드
matplotlib, seaborn      # 시각화

# 유틸리티
tenacity                 # 재시도 메커니즘
python-dotenv            # 환경변수 관리
pandas, numpy            # 데이터 처리
pathlib                  # 경로 처리 (Windows 호환)
```

### 5-3. 기존 워크스페이스 리소스 재사용

| 리소스 | 경로 | 재사용 방법 |
|--------|------|-----------|
| Reddit 크롤러 | `03.CX_Group4/00.reddit_crawler/reddit_crawler.py` | 복사 후 키워드 수정 |
| 감성분석 예제 | `03.CX_Group4/review_analysis.ipynb` | TF-IDF, NMF 패턴 참고 |
| 워드클라우드 | `02.BX_Group2/반려동물_보고서_워드클라우드.ipynb` | 한글 폰트 설정 참고 |
| SentiWord | `03.CX_Group4/data/SentiWord_info.json` | 한국어 감성 렉시콘 |

---

## 6. 데이터 수집 목표량

| 채널 | 목표량 | 예상 소요 시간 | 비고 |
|------|--------|--------------|------|
| Reddit | 500+ posts | 30분 | 서브레딧 3개 × 쿼리 6개 |
| YouTube | 10,000+ comments | 1시간 | 100 videos × 100 comments |
| Naver | 200+ blogs | 15분 | 쿼리 4개 × 50 results |
| **합계** | **10,700+ 레코드** | **1.75시간** | API 쿼터 충분 |

---

## 7. API 키 발급 가이드

### 7-1. Reddit API

1. [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) 접속
2. "Create App" → "script" 선택
3. Name: `lg-dx-korea-travel`, Redirect URI: `http://localhost:8080`
4. Client ID, Secret 복사

### 7-2. YouTube Data API v3

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 → "YouTube Data API v3" 활성화
3. "사용자 인증 정보" → "API 키 만들기"
4. API 키 복사 (쿼터: 10,000 units/day)

### 7-3. Naver Search API

1. [Naver Developers](https://developers.naver.com/apps/#/register) 접속
2. 애플리케이션 등록 → "검색" API 추가
3. Client ID, Client Secret 복사 (쿼터: 25,000 calls/day)

### 7-4. .env 파일 작성

```bash
# Reddit
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=lg-dx-korea-travel/0.1 by your_username

# YouTube
YOUTUBE_API_KEY=AIzaSy...

# Naver
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
```

**⚠️ 중요**: `.env` 파일을 `.gitignore`에 추가하여 커밋 금지

---

## 8. 데이터 저장 구조

```
04.DX_Groupx/
├── crawlers/
│   ├── reddit_korea_travel.py
│   ├── youtube_comments.py
│   └── naver_blog_crawler.py
├── analysis/
│   ├── preprocess_and_sentiment.ipynb
│   └── topic_modeling.ipynb
├── data/
│   ├── raw/
│   │   ├── reddit_korea_travel.csv
│   │   ├── youtube_comments.csv
│   │   └── naver_blogs.json
│   ├── processed/
│   │   ├── cleaned_data.csv
│   │   └── sentiment_labeled.csv
│   └── figures/
│       ├── wordcloud_en.png
│       ├── wordcloud_ko.png
│       ├── wordcloud_ja.png
│       ├── wordcloud_zh.png
│       ├── topic_distribution.png
│       ├── sentiment_pie.png
│       └── timeline_trend.png
├── .env
├── .env.example
├── requirements_crawling.txt
├── run_pipeline.ps1
├── crawling_plan.md (이 파일)
└── ANALYSIS_REPORT.md
```

---

## 9. 분석 파이프라인

### 9-1. 데이터 전처리

```python
# 1. 언어 감지 및 분리
df['language'] = df['text'].apply(lambda x: detect(x))
df_en = df[df['language'] == 'en']
df_ko = df[df['language'] == 'ko']
df_ja = df[df['language'] == 'ja']
df_zh = df[df['language'] == 'zh-cn']

# 2. 텍스트 정제
def clean_text(text):
    text = re.sub(r'http\S+', '', text)  # URL 제거
    text = re.sub(r'@\w+', '', text)     # 멘션 제거
    text = re.sub(r'#\w+', '', text)     # 해시태그 제거
    text = re.sub(r'[^\w\s]', '', text)  # 특수문자 제거
    return text.lower().strip()
```

### 9-2. 감성분석

```python
# 영어: VADER + TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
analyzer = SentimentIntensityAnalyzer()

def sentiment_vader(text):
    scores = analyzer.polarity_scores(text)
    return scores['compound']  # -1 (부정) ~ +1 (긍정)

# 한국어: SentiWord 렉시콘
with open('data/SentiWord_info.json', 'r', encoding='utf-8') as f:
    sentiword = json.load(f)

def sentiment_korean(text):
    tokens = okt.morphs(text)
    pos_score = sum(1 for t in tokens if t in sentiword['positive'])
    neg_score = sum(1 for t in tokens if t in sentiword['negative'])
    return (pos_score - neg_score) / (pos_score + neg_score + 1)
```

### 9-3. 토픽모델링 (NMF)

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF

# TF-IDF 벡터화
vectorizer = TfidfVectorizer(
    max_features=5000,
    min_df=2,
    max_df=0.8,
    ngram_range=(1, 2),
    stop_words='english'
)
X = vectorizer.fit_transform(df['clean_text'])

# NMF (8개 토픽 = 8개 카테고리)
nmf = NMF(n_components=8, random_state=42, init='nndsvda', max_iter=400)
W = nmf.fit_transform(X)
H = nmf.components_

# 토픽 라벨링
topic_labels = [
    "Language Barrier",
    "Navigation/Transport",
    "Food/Menu Issues",
    "Payment/App Issues",
    "Cultural Differences",
    "Safety Concerns",
    "Accommodation",
    "Information Gap"
]

# 문서-토픽 분포
df['dominant_topic'] = W.argmax(axis=1)
df['topic_label'] = df['dominant_topic'].map(lambda x: topic_labels[x])
```

### 9-4. 워드클라우드 생성

```python
from wordcloud import WordCloud
import matplotlib.pyplot as plt

# 언어별 폰트 설정
fonts = {
    'en': None,  # 기본 폰트
    'ko': 'C:/Windows/Fonts/malgun.ttf',
    'ja': 'C:/Windows/Fonts/msgothic.ttc',
    'zh': 'C:/Windows/Fonts/simsun.ttc'
}

for lang, font_path in fonts.items():
    df_lang = df[df['language'] == lang]
    text = ' '.join(df_lang['clean_text'])
    
    wordcloud = WordCloud(
        font_path=font_path,
        width=1200, height=800,
        background_color='white',
        max_words=100,
        colormap='viridis'
    ).generate(text)
    
    plt.figure(figsize=(15, 10))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.title(f'Word Cloud - {lang.upper()}', fontsize=20)
    plt.savefig(f'data/figures/wordcloud_{lang}.png', dpi=300, bbox_inches='tight')
    plt.close()
```

---

## 10. 법적 유의사항

### 10-1. 이용약관 준수

- **Reddit**: API 이용약관 준수, 60 requests/min 레이트리밋 엄수
- **YouTube**: 쿼터 제한 준수, 댓글 저작권 존중 (분석 목적 명시)
- **Naver**: API 이용약관 준수, 상업적 이용 금지

### 10-2. 개인정보 보호

- **사용자 ID/닉네임**: 익명화 처리 (해시 처리)
- **프로필 사진/연락처**: 수집 금지
- **IP 주소/위치 정보**: 수집 금지

### 10-3. 데이터 사용 범위

- **목적**: 학술 연구 및 데이터 분석 (LG DX School 교육용)
- **공개 범위**: 내부 보고서만 사용, 외부 공개 시 익명화 처리
- **저장 기간**: 프로젝트 종료 후 6개월 이내 삭제

---

## 11. 자동화 실행 스크립트 (run_pipeline.ps1)

```powershell
# 외국인 한국여행 불편사항 크롤링 및 분석 파이프라인
# 작성: 2025-11-14

Write-Host "=== 외국인 한국여행 불편사항 분석 파이프라인 ===" -ForegroundColor Cyan

# 1. 환경변수 확인
if (-not (Test-Path .env)) {
    Write-Host "[ERROR] .env 파일이 없습니다. API 키를 설정하세요." -ForegroundColor Red
    exit 1
}

# 2. 가상환경 활성화
if (Test-Path .venv\Scripts\Activate.ps1) {
    .\.venv\Scripts\Activate.ps1
} else {
    Write-Host "[ERROR] 가상환경이 없습니다. python -m venv .venv 실행하세요." -ForegroundColor Red
    exit 1
}

# 3. 크롤러 실행
Write-Host "`n[Step 1/5] Reddit 크롤링 시작..." -ForegroundColor Yellow
python crawlers/reddit_korea_travel.py
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] Reddit 크롤링 실패" -ForegroundColor Red; exit 1 }

Write-Host "`n[Step 2/5] YouTube 크롤링 시작..." -ForegroundColor Yellow
python crawlers/youtube_comments.py
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] YouTube 크롤링 실패" -ForegroundColor Red; exit 1 }

Write-Host "`n[Step 3/5] Naver 블로그 크롤링 시작..." -ForegroundColor Yellow
python crawlers/naver_blog_crawler.py
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] Naver 크롤링 실패" -ForegroundColor Red; exit 1 }

# 4. 분석 노트북 실행
Write-Host "`n[Step 4/5] 데이터 전처리 및 감성분석..." -ForegroundColor Yellow
jupyter nbconvert --to notebook --execute analysis/preprocess_and_sentiment.ipynb --output preprocess_and_sentiment_executed.ipynb

Write-Host "`n[Step 5/5] 토픽모델링 및 워드클라우드 생성..." -ForegroundColor Yellow
jupyter nbconvert --to notebook --execute analysis/topic_modeling.ipynb --output topic_modeling_executed.ipynb

# 5. 결과 확인
Write-Host "`n=== 파이프라인 완료 ===" -ForegroundColor Green
Write-Host "산출물 위치:" -ForegroundColor Cyan
Write-Host "  - 원천 데이터: data/raw/" -ForegroundColor White
Write-Host "  - 처리 데이터: data/processed/" -ForegroundColor White
Write-Host "  - 시각화: data/figures/" -ForegroundColor White
Write-Host "  - 보고서: ANALYSIS_REPORT.md" -ForegroundColor White
```

---

## 12. 예상 산출물 미리보기

### 12-1. 워드클라우드 (언어별)

- `wordcloud_en.png`: "language", "menu", "subway", "payment", "confusing"
- `wordcloud_ko.png`: "언어", "메뉴판", "지하철", "결제", "불편"
- `wordcloud_ja.png`: "言語", "メニュー", "地下鉄", "支払い"
- `wordcloud_zh.png`: "语言", "菜单", "地铁", "支付"

### 12-2. 토픽 분포 (막대그래프)

| 토픽 | 문서 수 | 비율 |
|------|---------|------|
| Language Barrier | 2,150 | 20.1% |
| Navigation/Transport | 1,890 | 17.7% |
| Food/Menu Issues | 1,670 | 15.6% |
| Payment/App Issues | 1,430 | 13.4% |
| Cultural Differences | 1,210 | 11.3% |
| Safety Concerns | 980 | 9.2% |
| Accommodation | 820 | 7.7% |
| Information Gap | 550 | 5.1% |

### 12-3. 감성 분포 (파이차트)

- 부정 (Negative): 4,280건 (40.0%)
- 중립 (Neutral): 3,750건 (35.1%)
- 긍정 (Positive): 2,670건 (24.9%)

### 12-4. 시계열 트렌드

- X축: 게시일 (2023-01 ~ 2025-11)
- Y축: 월별 불만 게시물 수
- 피크: 2024년 7-8월 (여름 휴가 시즌)

---

## 13. 최종 크롤링 키워드 요약

1. **영어·중국어·일본어 3개 언어** 기준으로 "언어 문제, 메뉴판, 교통, 결제, 안전, 문화 차이" 키워드 중심의 데이터 수집이 가장 효율적이다.
2. **국가별 특성을 반영한 맞춤형 키워드**를 포함해야 실제 페인포인트가 잘 수집된다. (예: 일본인 - 카드 사용 불편, 중국인 - 위챗페이 미지원)
3. **Reddit + YouTube 조합**이 법적 리스크 없이 가장 많은 UGC(User Generated Content) 수집 가능. Naver는 한국 내부 시각 보완용.

---

## 14. Next Steps (실행 전 체크리스트)

- [ ] API 키 발급 완료 (Reddit, YouTube, Naver)
- [ ] `.env` 파일 작성 및 `.gitignore` 확인
- [ ] 가상환경 생성 및 `requirements_crawling.txt` 설치
- [ ] `crawlers/` 폴더 및 크롤러 스크립트 3개 작성
- [ ] `analysis/` 폴더 및 노트북 2개 작성
- [ ] `run_pipeline.ps1` 테스트 실행
- [ ] 결과 검증 및 `ANALYSIS_REPORT.md` 작성
