# 3-Part Daily Reflection Dashboard 복원 계획

## 📊 현재 상태 분석

### 🎯 **프로젝트 정정**: Next.js + React + TypeScript 웹 애플리케이션

**실제 프로젝트 구조:**
- **메인 애플리케이션**: `lg-dx-dashboard/` (Next.js 15.3.5)
- **프론트엔드**: React 18 + TypeScript
- **백엔드**: Supabase (PostgreSQL)
- **스타일링**: Tailwind CSS + Radix UI
- **상태관리**: Zustand
- **차트**: Recharts

### 🔍 Supabase 데이터베이스 현황

```mermaid
pie title Daily Reflection 데이터 분포
    "Morning (오전수업)" : 5
    "Afternoon (오후수업)" : 5
    "Evening (저녁자율학습)" : 3
```

**데이터베이스 상태 (2025년 7월 21일 기준):**
- 총 반성 기록: **13건**
- 오전수업 (morning): **5건**
- 오후수업 (afternoon): **5건**
- 저녁자율학습 (evening): **3건**
- 최신 데이터: **2025-07-17**

### 🗃️ 주요 테이블 구조

```mermaid
erDiagram
    daily_reflections {
        uuid id PK
        uuid user_id FK
        date date
        text time_part
        int understanding_score
        int concentration_score
        int achievement_score
        int total_score
        text condition
        jsonb subjects
        text[] achievements
        text[] challenges
        text[] tomorrow_goals
        text notes
        int github_commits
        timestamptz created_at
        timestamptz updated_at
    }
    
    github_activities {
        uuid id PK
        uuid user_id FK
        date date
        int commits_count
        int repositories_count
        text[] repositories
        text[] languages
        int additions
        int deletions
        int files_changed
        int activity_level
        timestamptz created_at
        timestamptz updated_at
    }
    
    subjects {
        uuid id PK
        text name
        text category
        text subcategory
        text description
        text color_code
        text icon
        int difficulty_level
        int estimated_hours
        text[] prerequisites
        boolean is_active
        timestamptz created_at
    }
```

### 📁 파일 손실 현황

```mermaid
graph TD
    A[삭제된 파일] --> B[Core 모듈 - 2개]
    A --> C[Utils 모듈 - 3개]
    A --> D[Scripts 모듈 - 1개]
    
    B --> B1[❌ notion_db_manager.py]
    B --> B2[❌ time_part_classifier.py]
    
    C --> C1[❌ error_handler.py]
    C --> C2[❌ date_utils.py]
    C --> C3[❌ config_loader.py]
    
    D --> D1[❌ test_connections.py]
    

```

**보존된 파일들:**
- ✅ `dashboard/create_3part_dashboard.py`
- ✅ `dashboard/time_part_visualizer.py`
- ✅ `dashboard/optimal_time_analyzer.py`
- ✅ `scripts/morning_reflection.py`
- ✅ `scripts/afternoon_reflection.py`
- ✅ `scripts/evening_reflection.py`
- ✅ `core/github_time_analyzer.py`
- ✅ `utils/logger.py`

## 🚀 복원 전략

### Phase 1: 핵심 인프라 복구 (우선순위: 🔥 높음)

```mermaid
gantt
    title 3-Part Dashboard 복원 일정
    dateFormat  YYYY-MM-DD
    section Phase 1
    config_loader.py      :active, p1a, 2025-07-21, 1d
    error_handler.py      :p1b, after p1a, 1d
    date_utils.py         :p1c, after p1b, 1d
    section Phase 2
    time_part_classifier.py :p2a, after p1c, 1d
    notion_db_manager.py    :p2b, after p2a, 2d
    section Phase 3
    test_connections.py     :p3a, after p2b, 1d
    통합 테스트              :p3b, after p3a, 1d
```

#### 1.1 `config_loader.py` - 설정 관리
```python
# 주요 기능
- 환경변수 로딩 (.env.local)
- Supabase 연결 설정
- 3-Part 시간대 설정 로딩
- 과목 매핑 설정 관리
```

#### 1.2 `error_handler.py` - 에러 처리
```python
# 주요 기능
- 데이터베이스 연결 오류 처리
- API 호출 실패 복구
- 로그 기록과 함께 예외 관리
- 재시도 로직
```

#### 1.3 `date_utils.py` - 날짜/시간 유틸리티
```python
# 주요 기능
- 3-Part 시간대 분류 (9-12시, 13-17시, 18-22시)
- 한국 시간대 (KST) 처리
- 날짜 범위 계산
- 시간대별 집계 함수
```

### Phase 2: 비즈니스 로직 복구 (우선순위: 🔥 높음)

#### 2.1 `time_part_classifier.py` - 시간대 분류
```python
# 주요 기능
- 시간 → 3-Part 분류 (morning/afternoon/evening)
- 학습 시간대 검증
- 시간대별 가중치 계산
- 최적 시간대 추천 로직
```

#### 2.2 `notion_db_manager.py` - 데이터베이스 관리
```python
# 주요 기능
- Supabase 연결 관리
- Daily Reflection CRUD 작업
- 시간대별 데이터 조회
- 통계 계산 및 집계
- Notion 연동 준비 (향후)
```

### Phase 3: 테스트 및 검증 (우선순위: 🟡 중간)

#### 3.1 `test_connections.py` - 연결 테스트
```python
# 주요 기능
- Supabase 연결 테스트
- 3-Part 데이터 조회 테스트
- 시간대 분류 테스트
- GitHub 연동 상태 확인
```

## 📈 데이터 활용 계획

### 기존 데이터 분석

```mermaid
graph TD
    A[기존 13건 데이터] --> B[시간대별 성과 분석]
    A --> C[학습 패턴 도출]
    A --> D[최적 시간대 식별]
    
    B --> E[오전: 평균 점수 계산]
    B --> F[오후: 평균 점수 계산]
    B --> G[저녁: 평균 점수 계산]
    
    C --> H[집중도 패턴]
    C --> I[이해도 패턴]
    C --> J[성취도 패턴]
    
    D --> K[개인 맞춤 추천]
    D --> L[시간대별 최적화]
```

### 향후 연동 계획

```mermaid
flowchart LR
    A[Supabase] --> B[3-Part Dashboard]
    B --> C[Notion 연동]
    B --> D[GitHub Actions]
    B --> E[실시간 알림]
    
    C --> F[자동 페이지 생성]
    D --> G[매일 17:30 자동 실행]
    E --> H[학습 목표 달성 알림]
```

## 🔧 기술적 요구사항

### 환경 설정
```bash
# 필수 환경변수 (.env.local)
SUPABASE_URL=https://stgfcervmkbgaarjneyb.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://postgres:[password]@db.stgfcervmkbgaarjneyb.supabase.co:5432/postgres

# GitHub 연동 (선택사항)
GITHUB_TOKEN=your_github_token
GITHUB_USER=positivemultiplier
GITHUB_MAIN_REPO=LG_DX_SCHOOL

# Notion 연동 (향후)
NOTION_API_TOKEN=your_notion_token
NOTION_DATABASE_ID=your_database_id
```

### 종속성 관리
```python
# requirements.txt 추가 필요
supabase==2.5.3
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pandas>=2.0.0
matplotlib>=3.7.0
seaborn>=0.12.0
plotly>=5.17.0
```

## 📋 구현 우선순위

```mermaid
pie title 구현 우선순위 배분
    "Phase 1: 인프라" : 40
    "Phase 2: 비즈니스 로직" : 35
    "Phase 3: 테스트" : 15
    "문서화" : 10
```

### 🔥 Critical (즉시 구현)
1. **config_loader.py** - 모든 모듈의 기반
2. **time_part_classifier.py** - 핵심 비즈니스 로직
3. **date_utils.py** - 시간 처리 필수

### ⚡ High (1-2일 내)
4. **notion_db_manager.py** - 데이터 관리 핵심
5. **error_handler.py** - 안정성 확보

### 🟡 Medium (3-5일 내)
6. **test_connections.py** - 연결 검증
7. 통합 테스트 및 버그 수정

## 🎯 성공 지표

### 복원 완료 기준
- [ ] 모든 삭제된 파일 재생성
- [ ] 기존 13건 데이터 정상 조회
- [ ] 3-Part 시간대 분류 정상 작동
- [ ] 대시보드 생성 정상 실행
- [ ] 새로운 reflection 입력 가능

### 성능 지표
```mermaid
graph LR
    A[복원 전] --> B[복원 후]
    A --> A1[파일: 80% 손실]
    A --> A2[기능: 60% 제한]
    
    B --> B1[파일: 100% 복구]
    B --> B2[기능: 100% 정상]
    B --> B3[데이터: 13건 유지]
    B --> B4[새기능: Notion 연동 준비]
```

## 🚀 실행 계획

### 즉시 시작
1. **config_loader.py** 생성
2. **date_utils.py** 생성
3. **time_part_classifier.py** 생성

### 금주 완료 목표
- Core 모듈 완전 복구
- Utils 모듈 완전 복구
- 기본 기능 테스트 완료

### 다음주 목표
- Notion 연동 기능 추가
- GitHub Actions 자동화 강화
- 실시간 알림 시스템 구축

---

**📅 작성일**: 2025년 7월 21일  
**📊 데이터 기준**: Supabase LG_DX_SCHOOL 프로젝트  
**🎯 목표**: 완전한 3-Part Dashboard 복원 및 기능 강화
