# 📊 무료 금융 API 설정 가이드

## 🎯 개요
SEC(미국 증권거래위원회) API와 유럽시장 API를 무료로 획득하여 .env 파일에 설정하는 방법을 안내합니다.

---

## 🇺🇸 1. SEC API (미국 시장)

### 📌 **SEC EDGAR API**
- **설명**: 미국 증권거래위원회의 공식 데이터베이스
- **제공 데이터**: 10-K, 10-Q, 8-K 등 기업 공시 자료
- **비용**: 완전 무료
- **제한**: 초당 10회 요청

#### 🔗 **설정 방법**

1. **API 키 불필요** - SEC API는 API 키 없이 사용 가능
2. **User-Agent 헤더 필수** - 요청 시 이메일 주소 포함 필요

```python
# 사용 예시
import requests

headers = {
    'User-Agent': 'your-email@example.com'
}

# 애플 회사 정보 조회
response = requests.get(
    'https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json',
    headers=headers
)
```

### 📌 **Alpha Vantage (SEC 데이터 포함)**
- **설명**: SEC 데이터를 포함한 종합 금융 API
- **제공 데이터**: 주식, 환율, 암호화폐, 기본적 분석 데이터
- **무료 한도**: 일 500회, 분당 5회

#### 🔑 **API 키 획득**

1. [Alpha Vantage 홈페이지](https://www.alphavantage.co/support/#api-key) 방문
2. 이메일 주소 입력하여 무료 API 키 받기
3. 즉시 발급 (회원가입 불필요)

---

## 🇪🇺 2. 유럽시장 API

### 📌 **Yahoo Finance API (유럽 시장 포함)**
- **설명**: 글로벌 주식 데이터 (유럽 포함)
- **제공 데이터**: 주가, 재무제표, 시장 데이터
- **비용**: 무료 (비공식)

```python
# 설치
pip install yfinance

# 사용 예시 (유럽 주식)
import yfinance as yf

# ASML (네덜란드)
asml = yf.Ticker("ASML.AS")
# SAP (독일)  
sap = yf.Ticker("SAP.DE")
# 네슬레 (스위스)
nestle = yf.Ticker("NESN.SW")
```

### 📌 **Twelve Data**
- **설명**: 글로벌 금융 시장 데이터 (유럽 포함)
- **제공 데이터**: 실시간 주가, 기술적 지표, 뉴스
- **무료 한도**: 일 800회

#### 🔑 **API 키 획득**

1. [Twelve Data 홈페이지](https://twelvedata.com/pricing) 방문
2. 무료 계정 생성
3. 대시보드에서 API 키 확인

### 📌 **Financial Modeling Prep**
- **설명**: 유럽 주식 포함 글로벌 금융 데이터
- **제공 데이터**: 재무제표, 주가, 비율 분석
- **무료 한도**: 일 250회

#### 🔑 **API 키 획득**

1. [Financial Modeling Prep](https://financialmodelingprep.com/developer/docs) 방문
2. 무료 계정 생성
3. API 키 발급

---

## 📁 3. .env 파일 설정

### 📝 **.env 파일 생성**

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음과 같이 설정:

```env
# SEC 및 미국 시장 API
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
SEC_USER_AGENT=your-email@example.com

# 유럽시장 API
TWELVE_DATA_API_KEY=your_twelve_data_key_here
FMP_API_KEY=your_fmp_key_here

# 기타 유용한 API
QUANDL_API_KEY=your_quandl_key_here
IEX_CLOUD_API_KEY=your_iex_key_here
```

### 🔒 **보안 설정**

1. **`.gitignore`에 추가**:
```gitignore
# Environment variables
.env
*.env
```

2. **Python에서 사용**:
```python
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# API 키 사용
alpha_vantage_key = os.getenv('ALPHA_VANTAGE_API_KEY')
twelve_data_key = os.getenv('TWELVE_DATA_API_KEY')
sec_user_agent = os.getenv('SEC_USER_AGENT')
```

---

## 💡 4. 추가 무료 API 추천

### 📊 **기타 유용한 무료 API**

| API | 설명 | 무료 한도 | 특징 |
|-----|------|-----------|------|
| **IEX Cloud** | 미국 주식 데이터 | 월 50만회 | 실시간 데이터 |
| **Quandl (Nasdaq)** | 경제/금융 데이터 | 일 50회 | 거시경제 지표 |
| **FRED API** | 미국 경제 데이터 | 무제한 | 연준 경제 지표 |
| **World Bank API** | 글로벌 경제 지표 | 무제한 | 국가별 경제 데이터 |

---

## 🚀 5. 실전 활용 예시

### 📈 **종합 데이터 수집 스크립트**

```python
import os
import requests
import yfinance as yf
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

class GlobalMarketAPI:
    def __init__(self):
        self.alpha_vantage_key = os.getenv('ALPHA_VANTAGE_API_KEY')
        self.twelve_data_key = os.getenv('TWELVE_DATA_API_KEY')
        self.sec_user_agent = os.getenv('SEC_USER_AGENT')
    
    def get_us_stock_data(self, symbol):
        """미국 주식 데이터 (Alpha Vantage)"""
        url = f"https://www.alphavantage.co/query"
        params = {
            'function': 'TIME_SERIES_DAILY',
            'symbol': symbol,
            'apikey': self.alpha_vantage_key
        }
        response = requests.get(url, params=params)
        return response.json()
    
    def get_european_stock_data(self, symbol):
        """유럽 주식 데이터 (Yahoo Finance)"""
        ticker = yf.Ticker(symbol)
        return ticker.history(period="1mo")
    
    def get_sec_filing(self, cik):
        """SEC 공시 데이터"""
        headers = {'User-Agent': self.sec_user_agent}
        url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik:010d}.json"
        response = requests.get(url, headers=headers)
        return response.json()

# 사용 예시
api = GlobalMarketAPI()

# 미국 주식 (애플)
us_data = api.get_us_stock_data('AAPL')

# 유럽 주식 (ASML)
eu_data = api.get_european_stock_data('ASML.AS')

# SEC 공시 (애플)
sec_data = api.get_sec_filing(320193)
```

---

## ⚠️ 6. 주의사항 및 팁

### 🔄 **API 사용 제한 관리**
```python
import time
import requests
from functools import wraps

def rate_limit(calls_per_minute=60):
    """API 호출 제한 데코레이터"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            time.sleep(60 / calls_per_minute)
            return func(*args, **kwargs)
        return wrapper
    return decorator

@rate_limit(calls_per_minute=30)
def api_call():
    # API 호출 코드
    pass
```

### 📋 **체크리스트**
- [ ] .env 파일이 .gitignore에 포함되어 있는가?
- [ ] API 키가 올바르게 설정되어 있는가?
- [ ] 각 API의 사용 제한을 확인했는가?
- [ ] 에러 처리 코드가 포함되어 있는가?
- [ ] 데이터 백업 계획이 있는가?

---

## 📞 문의 및 지원

문제가 발생하거나 추가 도움이 필요한 경우:
1. 각 API 공급업체의 공식 문서 확인
2. GitHub Issues 또는 Stack Overflow 검색
3. API 키 재발급 시도

---

*🎯 이 가이드를 통해 무료 금융 API를 활용하여 글로벌 시장 분석을 시작해보세요!*
