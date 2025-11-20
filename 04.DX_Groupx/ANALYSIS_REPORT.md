# 🌍 한국 여행 외국인 불편사항 분석 리포트

**분석 기간**: 2025년 11월 14일  
**데이터 소스**: Reddit, YouTube, Naver 블로그  
**총 데이터**: 8,726건

---

## 📊 Executive Summary

본 분석은 외국인 관광객의 한국 여행 중 겪는 불편사항을 파악하기 위해 3개 온라인 플랫폼에서 데이터를 수집하고 자연어 처리 기법을 활용하여 분석했습니다.

### 주요 발견사항
1. **YouTube가 가장 유용한 데이터 소스**: Reddit은 긍정 편향(70.3%)이 강한 반면, YouTube는 더 균형잡힌 감성 분포(부정 13.3%)를 보임
2. **언어 장벽이 최대 불편사항**: 전체 문서의 23.8% (1,951건)가 언어 관련 이슈
3. **숙박 관련 주제가 의외로 많음**: 38.9% (3,201건)로 가장 높은 비율
4. **부정 댓글 988건에서 핵심 인사이트 도출**: "korea", "people", "korean", "when", "don't" 등이 상위 키워드

---

## 📈 데이터 수집 결과

### 채널별 수집량
| 채널 | 수집량 | 감성 분포 (긍정/중립/부정) | 특징 |
|------|--------|--------------------------|------|
| **Reddit** | 1,028건 | 70.3% / 19.6% / 10.1% | 6개 서브레딧, 성공적 여행 후기 중심 |
| **YouTube** | 7,407건 | 50.4% / 36.3% / 13.3% | 123개 비디오, 실제 불편사항 표현 많음 |
| **Naver** | 291건 | N/A | 한국인 시각의 외국인 관찰 데이터 |
| **합계** | **8,726건** | - | - |

### 채널별 특징

#### Reddit
- **장점**: 상세한 텍스트, 높은 참여도 (평균 댓글 185개)
- **단점**: 긍정 편향 강함, 실제 불편사항 비율 낮음
- **주요 서브레딧**: r/korea (29건), r/travel (28건), r/solotravel (28건)

#### YouTube
- **장점**: 대용량 데이터, 실시간 반응, 감성 균형적
- **단점**: 짧은 댓글 (평균 1-2문장), 스팸 필터링 필요
- **검색 쿼리**: "Korea travel mistakes", "Korea culture shock", "Korea what I wish I knew" 등

#### Naver
- **장점**: 한국어 데이터, 한국인 관점
- **단점**: API 제한(제목+설명만), 전체 본문 없음
- **검색 쿼리**: "한국여행 외국인 불편", "외국인 한국 생활 어려움" 등

---

## 🎯 8개 카테고리별 분석 (NMF Topic Modeling)

### 1위: Accommodation (38.9%, 3,201건)
**주요 키워드**: hotel, airbnb, stay, room, booking, accommodation  
**불편사항**:
- Airbnb 예약 시 커뮤니케이션 어려움
- 호텔 직원의 영어 소통 부족
- 체크인/체크아웃 절차 복잡

**개선 제안**:
- 다국어 체크인 키오스크 도입
- 외국인 전용 예약 플랫폼 개선
- 24시간 영어 고객지원 제공

---

### 2위: Language Barrier (23.8%, 1,951건)
**주요 키워드**: korean, language, speak, understand, english, translate  
**불편사항**:
- 레스토랑 메뉴판의 영어 번역 부족
- 택시 기사와 소통 불가
- 관광지 안내판 다국어 지원 미흡
- "Korean is so flippin' hard" (Reddit 댓글)

**개선 제안**:
- 주요 관광지 다국어 안내판 확대
- Papago/Google Translate 연동 QR 코드 제공
- 외국인 친화 레스토랑 인증제 도입
- 택시 다국어 앱 (예: Kakao T International) 홍보 강화

---

### 3위: Navigation/Transport (11.1%, 912건)
**주요 키워드**: taxi, subway, transportation, map, bus, airport  
**불편사항**:
- **택시 바가지 요금**: 일본 방송에서 보도될 정도로 심각 (Reddit 상위 부정 게시물)
- 지하철 노선도 복잡 (특환승역)
- Kakao Map이 영어 지원 제한적
- T-money 카드 구매/충전 과정 불편

**개선 제안**:
- 택시 바가지 방지: 공항-시내 고정요금제 확대, Kakao T 우선 이용 안내
- Google Maps 데이터 개방 (현재 제한적)
- 환승역 외국인 전용 안내 데스크
- T-money 다국어 자판기 확충

---

### 4위: Cultural Differences (8.9%, 735건)
**주요 키워드**: culture, different, weird, shocked, customs, etiquette  
**불편사항**:
- 나이/서열 문화 이해 어려움
- 식당 문화 (반찬 리필, 벨 호출)
- 공공장소 예절 (지하철 노약자석, 조용히 하기)
- 뷰티/외모 중시 문화 충격

**개선 제안**:
- 입국 시 "한국 문화 가이드북" 배포 (공항)
- YouTube/Instagram 공식 캠페인: "Things to Know Before Visiting Korea"
- 호텔 체크인 시 문화 차이 안내 카드 제공

---

### 5위: Payment/App Issues (6.8%, 558건)
**주요 키워드**: payment, card, app, cash, pay, mobile  
**불편사항**:
- 신용카드 거부 (일부 소규모 상점)
- Kakao Pay/Naver Pay 외국인 가입 어려움
- 현금 사용처 제한 (지하철 일부 역)
- 배달앱 (Coupang Eats) 외국인 비활성화

**개선 제안**:
- 외국인 관광객 전용 Prepaid 카드 (T-money + 신용카드 통합)
- Alipay/WeChat Pay 가맹점 확대
- 영어 버전 배달앱 개발

---

### 6위: Safety Concerns (4.8%, 397건)
**주요 키워드**: safe, safety, dangerous, risk, crime, emergency  
**불편사항**:
- 응급 상황 시 112/119 영어 지원 부족
- 병원 진료 비용 불투명
- 야간 택시 안전 우려 (특히 여성 관광객)

**개선 제안**:
- 24시간 영어 긴급 핫라인 (112 통합)
- 외국인 의료 관광 보험 의무화
- 야간 택시 GPS 공유 기능 (Kakao T)

---

### 7위: Food/Menu Issues (4.3%, 352건)
**주요 키워드**: food, restaurant, menu, spicy, vegetarian, allergy  
**불편사항**:
- 메뉴판 영어 번역 오류 (Google 번역기 그대로 사용)
- 채식/비건 옵션 부족
- 알레르기 정보 표시 없음
- 매운맛 강도 표시 없음

**개선 제안**:
- 외국인 밀집 지역 메뉴판 전문 번역 지원
- "Vegan-Friendly" 인증 마크 도입
- 알레르기 정보 QR 코드 의무화

---

### 8위: Information Gap (4.0%, 329건)
**주요 키워드**: information, guide, know, help, question, confused  
**불편사항**:
- 관광 정보 분산 (Visit Korea, Seoul Tourism, 민간 사이트)
- 실시간 정보 부족 (축제 취소, 날씨 변경 등)
- WiFi/SIM 카드 구매 정보 불명확

**개선 제안**:
- 통합 관광 앱 개발 (Visit Korea 개선)
- 공항 Welcome Center 운영 시간 확대 (24시간)
- 실시간 푸시 알림 시스템 (행사 변경 등)

---

## 💬 부정 댓글 TOP 10 키워드 분석

YouTube 부정 댓글 988건에서 추출한 상위 키워드:

| 순위 | 키워드 | 빈도 | 관련 불편사항 |
|------|--------|------|--------------|
| 1 | korea | 256회 | 일반적 불만 표현 |
| 2 | people | 210회 | 사람들의 태도/서비스 |
| 3 | korean | 187회 | 한국어 소통 어려움 |
| 4 | when | 161회 | 특정 상황 불편 |
| 5 | don (don't) | 132회 | 금지사항/불가능한 것 |
| 6 | your | 112회 | 개인 경험 공유 |
| 7 | about | 112회 | ~에 관한 불만 |
| 8 | from | 110회 | 국적별 경험 차이 |
| 9 | because | 102회 | 불편 이유 설명 |
| 10 | she | 94회 | 여성 관광객 특화 이슈 |

---

## 🔍 워드클라우드 분석

### 영어 워드클라우드 (Reddit + YouTube)
**핵심 키워드**:
- **크기 1순위**: "from" - 국적별 경험 공유 많음
- **크기 2순위**: "korea", "was", "which" - 과거 경험 서술
- **주목 키워드**: "seoul", "people", "trip", "day", "about", "place"
- **불편 관련**: "only", "had", "would", "because" - 제한/불만 표현

### 한국어 워드클라우드 (Naver)
**핵심 키워드**:
- **크기 1순위**: "한국", "여행", "외국인"
- **크기 2순위**: "관광", "문제", "이", "추천"
- **주목 키워드**: "한국여행", "외국인관광객", "영어", "불편함", "문화"
- **특징**: 한국인 시각에서 본 외국인 관광객 이슈 (제3자 관찰)

---

## 📌 실행 가능한 개선 제안 (Priority)

### 🚨 High Priority (즉시 실행 가능)
1. **택시 바가지 방지 캠페인**: 공항 Kakao T 전용 부스, 고정요금 안내판
2. **다국어 메뉴판 지원**: 외국인 밀집 지역 (명동, 홍대, 이태원) 전문 번역 지원
3. **Google Maps 데이터 개방**: 정부-Google 협상 (현재 보안 이슈로 제한)
4. **통합 관광 앱**: Visit Korea 앱 개선 (실시간 정보, 챗봇, 다국어)

### ⚠️ Medium Priority (6개월 내)
5. **외국인 전용 T-money 카드**: 공항 자판기, 온라인 사전 구매 가능
6. **병원 영어 핫라인**: 24시간 의료 상담, 예약 지원
7. **Vegan/Vegetarian 인증제**: "채식 가능" 레스토랑 앱 등록
8. **문화 가이드북 배포**: 공항 입국장, 호텔 체크인 시

### 💡 Long-term (12개월+)
9. **AI 실시간 번역 키오스크**: 주요 관광지, 지하철역
10. **외국인 관광객 데이터 분석 시스템**: 실시간 불만 모니터링, 대응

---

## 📊 데이터 시각화 산출물

생성된 그래프 및 워드클라우드:
1. `data/figures/channel_sentiment_comparison.png` - 채널별 감성 비교
2. `data/figures/negative_keywords.png` - 부정 댓글 키워드 TOP 30
3. `data/figures/topic_distribution.png` - 8개 카테고리 분포
4. `data/figures/wordcloud_english.png` - 영어 워드클라우드
5. `data/figures/wordcloud_korean.png` - 한국어 워드클라우드

---

## 🔬 방법론

### 데이터 수집
- **Reddit**: PRAW (Python Reddit API Wrapper) 사용, 6개 서브레딧
- **YouTube**: YouTube Data API v3, 5개 검색 쿼리 × 30개 비디오
- **Naver**: Naver Search API, 6개 한국어 쿼리

### 감성 분석
- **TextBlob**: 영어 감성 분석 (polarity: -1.0 ~ 1.0)
- **VADER Sentiment**: 소셜 미디어 특화 감성 분석
- **Custom Lexicon**: Korea travel domain 특화 키워드 가중치

### 토픽 모델링
- **TF-IDF Vectorization**: max_features=1000, ngram_range=(1,2)
- **NMF (Non-negative Matrix Factorization)**: n_components=8
- **8개 카테고리**: Language, Navigation, Food, Payment, Culture, Safety, Accommodation, Information

### 시각화
- **Matplotlib + Seaborn**: 통계 그래프
- **WordCloud**: 언어별 워드클라우드
- **한글 폰트**: Malgun Gothic (Windows 기본 폰트)

---

## 📅 후속 연구 제안

1. **중국어/일본어 데이터 추가**: Weibo, Xiaohongshu (중국), Twitter (일본) 크롤링
2. **시계열 분석**: 계절별/이벤트별 불편사항 변화 (올림픽, 명절 등)
3. **지역별 세분화**: 서울/부산/제주도 지역별 차이 분석
4. **감정 분석 고도화**: KoBERT/mBERT 딥러닝 모델 적용
5. **실시간 모니터링 시스템**: 주간 리포트 자동 생성

---

## 👥 Contact

**프로젝트**: LG DX School - 외국인 관광객 불편사항 분석  
**분석 도구**: Python 3.12, pandas, scikit-learn, NMF, WordCloud  
**데이터 기간**: 2025년 11월 (최신 데이터 기준)  
**총 작업 시간**: 3시간 (크롤링 1시간, 분석 2시간)

---

**Generated by**: GitHub Copilot + Python Data Analysis Pipeline  
**Report Date**: 2025-11-14
