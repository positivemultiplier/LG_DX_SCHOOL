# 📊 LG DX School 프로젝트 구조

## 🏗️ 전체 프로젝트 구조 개요

```mermaid
graph TD
    A["LG DX School<br/>교육 과정 시스템"] --> B["00_General<br/>특강 자료"]
    A --> C["01_Foundation<br/>기초 역량"]
    A --> D["02.BX_Group2<br/>Business Experience"]
    A --> E["03.CX_Group4<br/>Customer Experience"]
    A --> F["04.DX_Groupx<br/>Digital Experience"]
    A --> G["05.DataAnalyst<br/>자격증 준비"]
    A --> H["lg-dx-dashboard<br/>대시보드 프로젝트"]
    A --> I["docs<br/>문서 관리"]
    A --> J["SNA<br/>소셜 네트워크 분석"]
    A --> K["src<br/>추가 소스 코드"]

```

## 📚 교육 과정 상세 구조

### 1. Foundation (기초 역량) 구조

```mermaid
graph LR
    A["01_Foundation<br/>기초 역량"] --> B["Python<br/>프로그래밍"]
    A --> C["Python<br/>라이브러리"]
    A --> D["크롤링<br/>데이터 수집"]
    A --> E["웹 기초<br/>HTML/CSS"]
    A --> F["데이터 시각화<br/>Tableau"]
    A --> G["텍스트 마이닝<br/>NLP 기초"]
    A --> H["머신러닝<br/>ML"]
    A --> I["딥러닝<br/>DL"]
    A --> J["컴퓨터 비전<br/>OpenCV"]
    A --> K["LLM & LangChain<br/>AI 에이전트"]
    A --> L["Java 프로그래밍<br/>백엔드 기초"]
    A --> M["DB & SQL<br/>Oracle"]
    A --> N["JDBC<br/>Java-DB 연결"]


```

### 2. DX 방법론 (BX, CX, DX) 구조

```mermaid
graph TB
    A["DX 방법론<br/>Digital Experience"] --> B["02_BX_Group2<br/>Business Experience"]
    A --> C["03_CX_Group4<br/>Customer Experience"]
    A --> D["04_DX_Groupx<br/>Digital Experience"]
    
    B --> B1["반려동물 산업 분석"]
    B --> B2["LG 전자 영업 분석"]
    B --> B3["시장 경쟁 분석"]
    
    C --> C1["Reddit 크롤링<br/>고객 인사이트"]
    C --> C2["LG ThinQ 분석<br/>IoT 디바이스"]
    C --> C3["LG Gram 분석<br/>프리미엄 노트북"]
    C --> C4["오븐 경험 분석<br/>주방 가전"]
    C --> C5["Active Senior<br/>고령자 대상 서비스"]
    
    D --> D1["광주광역시<br/>DX 사례"]
    D --> D2["이미지 개선<br/>디자인 시스템"]

```

### 3. LG DX Dashboard 프로젝트 구조

```mermaid
graph TB
    A["lg-dx-dashboard<br/>Next.js 15 + React 19"] --> B["Frontend<br/>Pages & Components"]
    A --> C["Backend<br/>API Routes"]
    A --> D["Database<br/>Supabase"]
    A --> E["External APIs<br/>GitHub, Notion"]
    A --> F["Scripts<br/>DB Setup & Migration"]
    
    B --> B1["대시보드<br/>Dashboard"]
    B --> B2["분석<br/>Analytics"]
    B --> B3["리플렉션<br/>Reflection"]
    B --> B4["설정<br/>Settings"]
    B --> B5["인증<br/>Auth"]
    
    C --> C1["GitHub API<br/>연동"]
    C --> C2["Notion API<br/>동기화"]
    C --> C3["Admin API<br/>관리자 기능"]
    
    D --> D1["PostgreSQL<br/>메인 DB"]
    D --> D2["Realtime<br/>실시간 업데이트"]
    
    E --> E1["GitHub<br/>커밋 추적"]
    E --> E2["Notion<br/>일일 회고 동기화"]


```

### 4. Dashboard 상세 아키텍처

```mermaid
graph LR
    subgraph Client["클라이언트"]
        A["Next.js<br/>App Router"]
        B["React Components<br/>Tailwind CSS"]
        C["UI Components<br/>Radix UI"]
    end
    
    subgraph State["상태 관리"]
        D["Zustand<br/>전역 상태"]
        E["React Hooks<br/>로직 재사용"]
    end
    
    subgraph API["API 레이어"]
        F["Route Handlers<br/>Next.js API"]
        G["GitHub API<br/>Octokit"]
        H["Notion API<br/>동기화"]
    end
    
    subgraph Database["데이터베이스"]
        I["Supabase<br/>PostgreSQL"]
        J["Realtime<br/>Supabase Channels"]
        K["Auth<br/>Supabase Auth"]
    end
    
    subgraph External["외부 서비스"]
        L["GitHub<br/>Repository"]
        M["Notion<br/>워크스페이스"]
    end
    
    A --> B
    B --> C
    A --> E
    E --> D
    A --> F
    F --> G
    F --> H
    F --> I
    I --> J
    I --> K
    G --> L
    H --> M
```

### 5. Foundation 학습 흐름

```mermaid
flowchart TD
    Start([교육 시작]) --> Python["Python 프로그래밍<br/>기본 문법"]
    Python --> Libs["Python 라이브러리<br/>Numpy, Pandas"]
    Libs --> Crawl["크롤링<br/>데이터 수집"]
    Crawl --> Web["웹 기초<br/>HTML/CSS"]
    Web --> Viz["데이터 시각화<br/>Tableau"]
    
    Viz --> Text["텍스트 마이닝<br/>NLP 기초"]
    Text --> ML["머신러닝<br/>ML 모델"]
    ML --> DL["딥러닝<br/>Neural Networks"]
    DL --> CV["컴퓨터 비전<br/>OpenCV"]
    CV --> LLM["LLM & LangChain<br/>AI 에이전트"]
    
    Viz --> Backend["백엔드 개발"]
    Backend --> Java["Java 프로그래밍<br/>기본 문법"]
    Java --> DB["DB & SQL<br/>Oracle"]
    DB --> JDBC["JDBC<br/>Java-DB 연결"]
    
    ML --> End([DX 역량 확보])
    JDBC --> End


```

### 6. 프로젝트 실행 환경

```mermaid
graph LR
    subgraph Tools["주요 도구"]
        A["Python 3.10/3.12<br/>개발 환경"]
        B["Node.js<br/>Next.js 실행"]
        C["Supabase<br/>클라우드 DB"]
        D["Git<br/>버전 관리"]
    end
    
    subgraph Languages["프로그래밍 언어"]
        E["Python<br/>데이터 분석"]
        F["Java<br/>백엔드 개발"]
        G["TypeScript/JavaScript<br/>프론트엔드"]
        H["SQL<br/>데이터베이스"]
    end
    
    subgraph Frameworks["프레임워크"]
        I["Next.js 15<br/>React 프레임워크"]
        J["Tailwind CSS<br/>스타일링"]
        K["Pandas, Numpy<br/>데이터 처리"]
        L["Spring Boot<br/>Java 백엔드"]
    end
    
    A --> E
    B --> G
    C --> H
    D --> A
    D --> B
    
    G --> I
    I --> J
    E --> K
```

## 📊 프로젝트 통계

### 기술 스택 분포

```mermaid
pie title 프로젝트별 기술 스택 사용률
    "Python 프로젝트" : 45
    "Next.js 프로젝트" : 25
    "Java 프로젝트" : 15
    "SQL 프로젝트" : 10
    "HTML/CSS" : 5
```

### 프로젝트 타입 분류

```mermaid
mindmap
  root((LG DX School))
    교육 과정
      01_Foundation 기초
      Python 프로그래밍
      Java & DB
      ML/DL/AI
    프로젝트
      02_BX 사업 경험
      03_CX 고객 경험
      04_DX 디지털 경험
    도구
      lg-dx-dashboard
      Supabase
      GitHub 연동
    자격증
      05_DataAnalyst 준비
```

## 🎯 주요 컴포넌트 간 의존성

```mermaid
graph TB
    subgraph Foundation["기초 역량"]
        A1["Python"] --> A2["데이터 처리"]
        A2 --> A3["ML/DL"]
    end
    
    subgraph DX["DX 프로젝트"]
        B1["BX 분석"] --> B3["DX 솔루션"]
        B2["CX 분석"] --> B3
    end
    
    subgraph Dashboard["대시보드 시스템"]
        C1["GitHub 연동"]
        C2["학습 추적"]
        C3["실시간 분석"]
    end
    
    Foundation --> DX
    Foundation --> Dashboard
    DX --> Dashboard
    
    A3 --> B1
    A3 --> B2
    C1 --> C2
    C2 --> C3
```

## 📁 디렉토리 구조 요약

| 디렉토리 | 목적 | 주요 내용 |
|---------|------|----------|
| `00_General` | 특강 자료 | BX/CX 특강, PM 특강 등 |
| `01_Foundation` | 기초 역량 | Python, Java, DB, ML/DL |
| `02.BX_Group2` | Business Experience | 반려동물 산업, LG 전자 분석 |
| `03.CX_Group4` | Customer Experience | Reddit, LG 제품 분석 |
| `04.DX_Groupx` | Digital Experience | 광주광역시 DX, 이미지 개선 |
| `05.DataAnalyst` | 자격증 준비 | 필기/실기 학습 자료 |
| `lg-dx-dashboard` | 대시보드 앱 | Next.js + Supabase 기반 |
| `docs` | 문서 관리 | 프로젝트 문서 |
| `SNA` | 소셜 네트워크 분석 | 네트워크 분석 프로젝트 |

## 🚀 프로젝트 실행 가이드

### Python 환경 설정

```bash
# 가상환경 생성 및 활성화
python -m venv env310
.\env310\Scripts\activate  # Windows
source env310/bin/activate  # macOS/Linux

# 패키지 설치
pip install -r requirements.txt
```

### Next.js 대시보드 실행

```bash
cd lg-dx-dashboard
npm install
npm run dev
```

### Supabase 데이터베이스 설정

```bash
cd lg-dx-dashboard
npm run setup:github
```

---

**📌 참고**: 이 문서는 LG DX School 프로젝트의 전체 구조를 시각화한 것입니다.
