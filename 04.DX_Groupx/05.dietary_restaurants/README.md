# 채식/할랄/글루텐프리 음식점 데이터 수집

문화공공데이터광장 API를 활용한 전국 세계음식점 데이터 크롤링

## 📋 API 정보

- **API명**: 한국문화정보원_전국 세계음식점
- **제공기관**: 한국문화정보원
- **URL**: https://api.kcisa.kr/openapi/API_TOU_052/request
- **데이터**: 발렛주차, 애완동물 동반입장, 채식메뉴, 글루텐프리 등 상세정보 포함

## 🔑 API 키 발급

1. https://www.culture.go.kr/data 접속
2. 회원가입 및 로그인
3. '오픈API' > '관광' > '한국문화정보원_전국 세계음식점' 검색
4. '활용신청' 클릭 → 서비스키 발급
5. 루트 디렉토리 `.env` 파일에 추가:

```bash
# 문화공공데이터광장 API
CULTURE_API_KEY=발급받은_서비스키
```

## 📊 수집 데이터

### 전체 음식점 정보
- `title`: 시설명
- `category1`: 카테고리1 (음식점/유흥시설)
- `category2`: 카테고리2 (동아시아음식, 인도아시아음식, 유럽음식 등)
- `category3`: 카테고리3
- `address`: 주소
- `coordinates`: 좌표 (위도/경도)
- `tel`: 전화번호
- `operatingTime`: 운영시간
- `information`: 시설정보

### 시설정보 (파싱 후)
- `vegetarian`: 채식 메뉴 제공 여부 (Yes/No)
- `halal`: 할랄음식 메뉴 제공 여부 (Yes/No)
- `gluten_free`: 글루텐프리 메뉴 제공 여부 (Yes/No)
- `parking`: 무료주차 가능 여부
- `valet_parking`: 발렛주차 가능 여부
- `baby_chair`: 유아의자 대여 가능 여부
- `wheelchair`: 휠체어 대여 가능 여부
- `pets_allowed`: 반려동물 동반 입장 가능 여부

## 🚀 사용법

### 1. 환경 설정
```bash
# requirements 설치
pip install requests pandas python-dotenv
```

### 2. 크롤링 실행
```bash
cd 05.dietary_restaurants
python crawler.py
```

### 3. 출력 파일
```
data/raw/
├── world_restaurants_all_YYYYMMDD_HHMMSS.json    # 전체 데이터 (JSON)
├── world_restaurants_all_YYYYMMDD_HHMMSS.csv     # 전체 데이터 (CSV)
├── vegetarian_restaurants_YYYYMMDD_HHMMSS.csv    # 채식 음식점만
├── halal_restaurants_YYYYMMDD_HHMMSS.csv         # 할랄 음식점만
└── gluten_free_restaurants_YYYYMMDD_HHMMSS.csv   # 글루텐프리 음식점만
```

## 📌 주요 기능

### 1. 전체 데이터 수집
- 페이지네이션 자동 처리 (100개씩)
- API 호출 제한 준수 (0.5초 대기)
- XML 응답 파싱

### 2. 채식/할랄/글루텐프리 필터링
- `information` 필드 파싱
- "채식 메뉴 있음", "할랄음식 메뉴 있음", "글루텐프리 메뉴 있음" 감지
- 좌표 데이터 추출 (위도/경도)

### 3. 다중 포맷 저장
- JSON: 원본 데이터 보존
- CSV: 엑셀/분석 도구 호환
- UTF-8-sig 인코딩 (한글 호환)

## 🎯 Travel GO 적용

### 외국인 여행자 식이 제한 대응
- **채식주의자** (Vegetarian): 채식 메뉴 제공 음식점 필터
- **무슬림** (Muslim): 할랄 인증 음식점 검색
- **글루텐 불내증** (Celiac): 글루텐프리 옵션 제공 음식점

### AR 기능 연계
```
AR 카메라로 음식점 보면
  → 채식/할랄/글루텐프리 배지 표시
  → 메뉴 번역 + 알레르기 정보
  → 영어 메뉴 제공 여부
```

## 📈 예상 데이터량

- **전체 세계음식점**: 약 2,000~5,000개
- **채식 음식점**: 예상 100~300개 (5~10%)
- **할랄 음식점**: 예상 50~150개 (2~5%)
- **글루텐프리 음식점**: 예상 20~80개 (1~3%)

※ 실제 데이터는 API 갱신 주기(연간)에 따라 변동

## ⚠️ 주의사항

1. **API 키 보안**: `.env` 파일을 절대 커밋하지 마세요
2. **호출 제한**: 과도한 호출 시 IP 차단 가능 (0.5초 대기 권장)
3. **데이터 갱신**: 연 1회 갱신되므로 정기적 재수집 필요
4. **좌표 정확도**: 일부 음식점은 좌표 없음 (주소만 제공)

## 🔗 관련 API

- 한국문화정보원_전국 반려동물 동반가능 문화시설
- 한국문화정보원_전국 다국어 가이드 제공 문화시설
- 한국문화정보원_전국 시티투어 코스와 함께하는 맛집 정보

## 📞 문의

- 문화공공데이터광장: data@kcisa.kr
- 대표번호: 02-3153-2875
