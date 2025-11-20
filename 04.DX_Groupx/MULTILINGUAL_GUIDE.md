# 🌏 다국어 한국 여행 불만사항 수집 가이드

**목표**: 중국인, 일본인, 동남아인의 한국 여행 불만사항 데이터 수집

---

## 📊 데이터 소스

### 1. **Google Reviews** (추천 ⭐⭐⭐⭐⭐)
- **장점**: 공식 API, 다국어 지원, 신뢰도 높음
- **언어**: 중국어(간체/번체), 일본어, 태국어, 베트남어
- **수집 대상**:
  - 서울: 명동, 남산타워, 경복궁, 홍대, 강남
  - 부산: 해운대, 감천문화마을, 광안리, 자갈치시장
  - 제주: 한라산, 성산일출봉, 중문관광단지, 협재해수욕장
  - 광주: 무등산, 양림동, 광주비엔날레

**API 키 발급**:
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. "Places API" 활성화
3. API 키 생성 → `.env`에 `GOOGLE_PLACES_API_KEY` 추가

**코드 실행**:
```powershell
python crawlers/multilingual_complaints.py --source google --languages zh-CN,ja,th,vi
```

---

### 2. **YouTube** (다국어 댓글)
- **장점**: 기존 API 키 재사용, 시각적 콘텐츠 반응
- **언어**: 중국어, 일본어, 태국어, 베트남어
- **검색 쿼리**:
  - **중국어**: `韩国旅游 问题`, `首尔旅行 失望`, `济州岛 不推荐`
  - **일본어**: `韓国旅行 失敗`, `ソウル 不便`, `韓国タクシーぼったくり`
  - **태국어**: `เที่ยวเกาหลี ปัญหา`, `โซลไม่สะดวก`
  - **베트남어**: `du lịch hàn quốc khó khăn`, `seoul không tiện`

**코드 실행**:
```powershell
python crawlers/multilingual_complaints.py --source youtube --max-videos 30
```

**예상 수집량**: 5,000~10,000개 댓글

---

### 3. **Twitter/X** (일본어 특화)
- **장점**: 실시간 반응, 일본인 사용자 많음
- **언어**: 일본어
- **해시태그**:
  - `#韓国旅行` (한국여행)
  - `#韓国旅行失敗` (한국여행 실패)
  - `#韓国不便` (한국 불편)
  - `#ソウル観光` (서울 관광)

**API 키 발급**:
1. [Twitter Developer Portal](https://developer.twitter.com/) 접속
2. "Essential Access" 신청 (무료, 월 500,000 트윗)
3. Bearer Token 생성 → `.env`에 `TWITTER_BEARER_TOKEN` 추가

**코드 실행**:
```powershell
python crawlers/multilingual_complaints.py --source twitter --language ja --max-tweets 500
```

---

### 4. **TripAdvisor** (선택사항)
- **장점**: 여행 전문 플랫폼, 상세 리뷰
- **단점**: 공식 API 없음, 스크래핑 필요 (법적 리스크)
- **대체 방법**: Google Reviews로 충분히 커버 가능

---

### 5. **Weibo** (중국, 고급)
- **장점**: 중국 최대 소셜 미디어
- **단점**: API 인증 어려움 (중국 법인 필요), VPN 필요
- **대체 방법**: 
  - Xiaohongshu (小红书) 공개 데이터셋
  - YouTube 중국어 댓글로 대체

---

## 🚀 빠른 시작

### 1단계: 의존성 설치
```powershell
pip install deep-translator googletrans==4.0.0rc1
```

### 2단계: API 키 설정
`.env` 파일에 다음 추가:
```bash
GOOGLE_PLACES_API_KEY=your_key_here
TWITTER_BEARER_TOKEN=your_token_here
```

### 3단계: 크롤러 실행
```powershell
# 전체 실행 (Google + YouTube + Twitter)
python crawlers/multilingual_complaints.py

# 또는 개별 실행
python crawlers/multilingual_complaints.py --source google
python crawlers/multilingual_complaints.py --source youtube
python crawlers/multilingual_complaints.py --source twitter
```

---

## 📍 주요 관광지 Place ID (Google Reviews)

### 서울
| 장소 | Place ID | 예상 리뷰 수 |
|------|----------|-------------|
| 명동 거리 | `ChIJzQ7U0FWifDURH5pLwvCU7SE` | 10,000+ |
| 남산타워 | `ChIJ3eJHKVWjfDUR-TauMHO9kI` | 50,000+ |
| 경복궁 | `ChIJfaU_N-SifDURvF7K4CMGCzw` | 30,000+ |
| 홍대입구역 | `ChIJ3zKQFJeifDURV2JzaWn7H8k` | 5,000+ |

### 부산
| 장소 | Place ID | 예상 리뷰 수 |
|------|----------|-------------|
| 해운대 해수욕장 | `ChIJzc7Z_jWjfDURm-TauMHO9kI` | 20,000+ |
| 감천문화마을 | `ChIJQxT7L8iifDURi-eZp0V2JzI` | 15,000+ |
| 광안리 해변 | `ChIJ5xQFcTajfDURP4LwvCU7SE` | 8,000+ |

### 제주
| 장소 | Place ID | 예상 리뷰 수 |
|------|----------|-------------|
| 한라산 국립공원 | `ChIJzWj2jL6rczUR2V5QT7EAqMI` | 12,000+ |
| 성산일출봉 | `ChIJ8T7L8cifDURi-eZp0V2JzI` | 18,000+ |
| 중문관광단지 | `ChIJ3zKQFJeczUR-TauMHO9kI` | 6,000+ |

### 광주
| 장소 | Place ID | 예상 리뷰 수 |
|------|----------|-------------|
| 무등산 국립공원 | `ChIJQxT7L8iifDURi-eZp0V2JzI` | 3,000+ |
| 양림동 | `ChIJ5xQFcTajfDURP4LwvCU7SE` | 1,500+ |

**Place ID 찾는 방법**:
1. [Google Maps](https://www.google.com/maps) 에서 장소 검색
2. URL에서 `ChIJ...` 부분 복사
3. 또는 [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id) 사용

---

## 🌐 언어별 키워드 전략

### 중국어 (简体中文)
**검색 키워드**:
- `韩国旅游 问题` (한국여행 문제)
- `首尔 不方便` (서울 불편)
- `韩国 出租车 宰客` (한국 택시 바가지)
- `济州岛 旅游 失望` (제주도 여행 실망)
- `韩国 语言 不通` (한국 언어 불통)
- `釜山 旅游 糟糕` (부산 여행 형편없음)

**불용어 (Stopwords)**:
```python
chinese_stopwords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人']
```

---

### 일본어 (日本語)
**검색 키워드**:
- `韓国旅行 失敗` (한국여행 실패)
- `韓国 不便` (한국 불편)
- `ソウル 問題` (서울 문제)
- `韓国 タクシー ぼったくり` (한국 택시 바가지)
- `韓国 言葉 通じない` (한국 말 통하지 않음)
- `済州島 観光 失敗` (제주도 관광 실패)

**불용어**:
```python
japanese_stopwords = ['の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し']
```

---

### 태국어 (ไทย)
**검색 키워드**:
- `เที่ยวเกาหลี ปัญหา` (한국 여행 문제)
- `โซล ไม่สะดวก` (서울 불편)
- `เกาหลี แท็กซี่โกง` (한국 택시 사기)
- `เชจู ผิดหวัง` (제주 실망)

---

### 베트남어 (Tiếng Việt)
**검색 키워드**:
- `du lịch hàn quốc khó khăn` (한국 여행 어려움)
- `seoul không tiện` (서울 불편)
- `hàn quốc taxi lừa đảo` (한국 택시 사기)
- `jeju thất vọng` (제주 실망)

---

## 🔧 번역 및 전처리

### 자동 번역
```python
from deep_translator import GoogleTranslator

# 중국어 → 영어
translator = GoogleTranslator(source='zh-CN', target='en')
translated = translator.translate("韩国旅游很不方便")
# Output: "Traveling to Korea is very inconvenient"

# 일본어 → 영어
translator = GoogleTranslator(source='ja', target='en')
translated = translator.translate("韓国のタクシーはぼったくりです")
# Output: "Korean taxis are rip-offs"
```

### 언어 감지
```python
from langdetect import detect

text = "韩国旅游问题很多"
lang = detect(text)  # 'zh-cn'

text = "韓国旅行は不便です"
lang = detect(text)  # 'ja'
```

---

## 📈 예상 데이터 수집량

| 소스 | 언어 | 예상 수집량 | 소요 시간 |
|------|------|------------|----------|
| **Google Reviews** | zh, ja, th, vi | 10,000~50,000건 | 2~3시간 |
| **YouTube** | zh, ja, th, vi | 5,000~10,000건 | 1~2시간 |
| **Twitter** | ja | 1,000~5,000건 | 30분~1시간 |
| **합계** | - | **16,000~65,000건** | **3.5~6시간** |

---

## 🎯 분석 계획

### 1단계: 데이터 통합
```python
import pandas as pd

# 모든 소스 병합
google_df = pd.read_csv('data/raw/google_reviews_multilingual.csv')
youtube_df = pd.read_csv('data/raw/youtube_multilingual.csv')
twitter_df = pd.read_csv('data/raw/twitter_japan.csv')

combined_df = pd.concat([google_df, youtube_df, twitter_df], ignore_index=True)
```

### 2단계: 국가별/지역별 분석
- **중국인**: 주로 쇼핑/면세점 관련 불만
- **일본인**: 교통/언어 장벽 관련 불만
- **동남아**: 음식/문화 차이 관련 불만

### 3단계: 도시별 비교
- **서울 vs 부산**: 교통 편의성
- **제주**: 렌터카/운전 문화
- **광주**: 정보 부족

### 4단계: 시각화
- 국가별 워드클라우드
- 지역별 불만사항 히트맵
- 언어별 감성 분포

---

## ⚠️ 주의사항

### API 쿼터
- **Google Places API**: 무료 $200/월 (약 40,000 요청)
- **YouTube API**: 10,000 units/일
- **Twitter API**: 500,000 트윗/월 (Essential)

### 법적 고려사항
- TripAdvisor 스크래핑: 이용약관 위반 가능
- Weibo: 중국 법인 없이 API 사용 제한
- 개인정보 보호: 사용자 ID/이메일 수집 금지

### 번역 비용
- Google Translate API: 유료 ($20/1M 문자)
- Deep Translator: 무료 (Google Translate 비공식)
- 대량 번역 시 OpenAI API 고려

---

## 📝 체크리스트

### 크롤링 전
- [ ] `.env`에 API 키 3개 추가 (`GOOGLE_PLACES_API_KEY`, `TWITTER_BEARER_TOKEN`, `YOUTUBE_API_KEY`)
- [ ] `deep-translator` 설치 (`pip install deep-translator`)
- [ ] Place ID 리스트 준비 (서울/부산/제주/광주 주요 관광지)

### 크롤링 중
- [ ] 진행 상황 모니터링 (`print` 출력 확인)
- [ ] 오류 로그 저장 (`errors.log`)
- [ ] API 쿼터 체크 (Google Cloud Console)

### 크롤링 후
- [ ] 데이터 품질 확인 (NULL 값, 중복 제거)
- [ ] 언어별 샘플 검증 (번역 정확도)
- [ ] 감성 분석 실행
- [ ] 기존 데이터(Reddit/YouTube/Naver)와 통합

---

## 🚀 다음 단계

1. **지금 바로 실행**:
```powershell
python crawlers/multilingual_complaints.py
```

2. **통합 분석 노트북 업데이트**:
```python
# analysis/integrated_analysis.ipynb에 추가
multilingual_df = pd.read_csv('data/raw/google_reviews_multilingual.csv')
# 국가별 분석 코드 추가
```

3. **최종 리포트 업데이트**:
- `ANALYSIS_REPORT.md`에 국가별 섹션 추가
- 중국/일본/동남아 특화 불만사항 정리

---

**작성일**: 2025-11-14  
**크롤러 버전**: multilingual_complaints.py v1.0
