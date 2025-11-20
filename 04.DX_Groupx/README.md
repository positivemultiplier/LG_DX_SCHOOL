# 외국인 한국여행 불편사항 크롤링 프로젝트 - 실행 가이드

## 📋 프로젝트 개요

**목적**: Reddit, YouTube, Naver 블로그에서 외국인 한국여행 불편사항 수집 및 분석  
**날짜**: 2025-11-14  
**상태**: ✅ 구현 완료 (테스트 필요)

---

## 🚀 Quick Start

### 1단계: API 키 발급

#### Reddit API
1. https://www.reddit.com/prefs/apps 접속
2. "Create App" 클릭 → "script" 선택
3. Name: `lg-dx-korea-travel`
4. Redirect URI: `http://localhost:8080`
5. **Client ID**, **Secret** 복사

#### YouTube Data API v3
1. https://console.cloud.google.com/ 접속
2. 프로젝트 생성
3. "YouTube Data API v3" 검색 후 활성화
4. "사용자 인증 정보" → "API 키 만들기"
5. **API 키** 복사

#### Naver Search API
1. https://developers.naver.com/apps/#/register 접속
2. 애플리케이션 등록 → "검색" API 추가
3. **Client ID**, **Client Secret** 복사

---

### 2단계: 환경 설정

```powershell
# 1. 04.DX_Groupx 폴더로 이동
cd 04.DX_Groupx

# 2. .env 파일 생성 (API 키 입력)
Copy-Item .env.example .env
notepad .env  # API 키를 실제 값으로 수정

# 3. 가상환경 생성 및 활성화
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 4. 의존성 설치
pip install -r requirements_crawling.txt
```

---

### 3단계: 크롤링 실행

#### 방법 1: 자동화 스크립트 (권장)
```powershell
.\run_pipeline.ps1
```

#### 방법 2: 개별 실행
```powershell
# Reddit 크롤링 (예상 시간: 5분)
python crawlers\reddit_korea_travel.py --limit 50

# YouTube 크롤링 (예상 시간: 10분)
python crawlers\youtube_comments.py --max-videos 50 --max-comments 50

# Naver 블로그 크롤링 (예상 시간: 2분)
python crawlers\naver_blog_crawler.py --display 50
```

---

### 4단계: 데이터 확인

```powershell
# 수집된 데이터 확인
ls data\raw

# 예상 파일:
# - reddit_korea_travel.csv (500+ 레코드)
# - youtube_comments.csv (5,000+ 레코드)
# - naver_blogs.json (300+ 레코드)
```

---

## 📁 프로젝트 구조

```
04.DX_Groupx/
├── crawlers/
│   ├── reddit_korea_travel.py      # Reddit 크롤러
│   ├── youtube_comments.py          # YouTube 크롤러
│   └── naver_blog_crawler.py        # Naver 크롤러
├── analysis/
│   ├── preprocess_and_sentiment.ipynb  # 전처리 & 감성분석 (TODO)
│   └── topic_modeling.ipynb            # 토픽모델링 & 워드클라우드 (TODO)
├── data/
│   ├── raw/                         # 원천 데이터
│   ├── processed/                   # 전처리 완료 데이터
│   └── figures/                     # 시각화 결과
├── .env.example                     # 환경변수 템플릿
├── .env                             # API 키 (gitignore)
├── requirements_crawling.txt        # Python 의존성
├── run_pipeline.ps1                 # 자동화 스크립트
└── crawling_plan.md                 # 상세 계획서
```

---

## ⚙️ 크롤러 옵션

### Reddit
```powershell
python crawlers\reddit_korea_travel.py `
  --queries "Korea trip issues" "Korea travel problems" `
  --subreddits "korea" "travel" "solotravel" `
  --limit 100 `
  --output data\raw\reddit_korea_travel.csv
```

### YouTube
```powershell
python crawlers\youtube_comments.py `
  --queries "Korea travel mistakes" "Korea culture shock" `
  --max-videos 100 `
  --max-comments 100 `
  --output data\raw\youtube_comments.csv
```

### Naver
```powershell
python crawlers\naver_blog_crawler.py `
  --queries "한국여행 외국인 불편" "한국 관광 문제점" `
  --display 100 `
  --sort sim `
  --output data\raw\naver_blogs.json
```

---

## 🔍 문제 해결

### 1. API 키 오류
```
EnvironmentError: Missing environment variables: ['REDDIT_CLIENT_ID']
```
**해결**: `.env` 파일에 API 키가 올바르게 입력되었는지 확인

### 2. YouTube 쿼터 초과
```
HttpError 403: quotaExceeded
```
**해결**: 
- 다음날 재실행 (쿼터 초기화)
- 또는 유료 쿼터 구매
- `--max-videos`, `--max-comments` 파라미터 감소

### 3. Naver API 429 에러
```
requests.exceptions.HTTPError: 429 Client Error: Too Many Requests
```
**해결**: 
- 1~2분 대기 후 재실행
- `--display` 파라미터 감소

### 4. KoNLPy 설치 오류 (한국어 분석용)
```
ImportError: No module named 'konlpy'
```
**해결**: 
- Java 설치 필요 (https://www.java.com/)
- `pip install konlpy JPype1`

---

## 📊 다음 단계

1. **데이터 전처리**: `analysis/preprocess_and_sentiment.ipynb` 작성
   - 언어 감지 (`langdetect`)
   - 텍스트 정제
   - 감성분석 (TextBlob, VADER)

2. **토픽모델링**: `analysis/topic_modeling.ipynb` 작성
   - TF-IDF 벡터화
   - NMF 토픽 추출 (8개 카테고리)
   - 워드클라우드 생성

3. **최종 보고서**: `ANALYSIS_REPORT.md` 작성
   - 채널별 수집량
   - 상위 10개 키워드
   - 감성 분포
   - 인사이트 요약

---

## 🛡️ 법적 유의사항

- **Reddit**: API 이용약관 준수, 60 requests/min 레이트리밋
- **YouTube**: 쿼터 제한 (10,000 units/day), 댓글 저작권 존중
- **Naver**: 상업적 이용 금지, 학술 연구 목적만 허용
- **개인정보**: 사용자 ID/닉네임 익명화 처리 필수

---

## 📞 지원

문의: LG DX School - DX Group  
작성: 2025-11-14

---

**✅ 구현 완료 항목**:
- [x] 크롤링 계획서 (`crawling_plan.md`)
- [x] 환경 설정 파일 (`.env.example`, `requirements_crawling.txt`)
- [x] Reddit 크롤러 (`reddit_korea_travel.py`)
- [x] YouTube 크롤러 (`youtube_comments.py`)
- [x] Naver 크롤러 (`naver_blog_crawler.py`)
- [x] 자동화 스크립트 (`run_pipeline.ps1`)

**🚧 TODO (다음 단계)**:
- [ ] `.env` 파일에 실제 API 키 입력
- [ ] 크롤러 테스트 실행
- [ ] `preprocess_and_sentiment.ipynb` 노트북 작성
- [ ] `topic_modeling.ipynb` 노트북 작성
- [ ] `ANALYSIS_REPORT.md` 최종 보고서 작성
