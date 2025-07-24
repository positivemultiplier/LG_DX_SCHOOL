# Dashboard 데이터 부족 분석 보고서

> **작성일**: 2025년 7월 24일  
> **목적**: 현재 수집 데이터와 목표 대시보드 간의 격차 분석  
> **분석 대상**: 첨부된 대시보드 UI vs 현재 daily_reflections 데이터

## 📊 현재 데이터 구조 분석

### 🗂️ 현재 수집 중인 데이터

```mermaid
graph TD
    A[daily_reflections 테이블] --> B[기본 정보]
    A --> C[점수 데이터]
    A --> D[텍스트 데이터]
    
    B --> B1[date: 날짜]
    B --> B2[time_part: 시간대]
    B --> B3[user_id: 사용자ID]
    
    C --> C1[understanding_score: 이해도]
    C --> C2[concentration_score: 집중도]
    C --> C3[achievement_score: 성취도]
    C --> C4[total_score: 총점]
    
    D --> D1[condition: 컨디션]
    D --> D2[achievements: 성과목록]
    D --> D3[subjects: 과목정보]
    

```

### 📈 목표 대시보드 요구 데이터

```mermaid
pie title 대시보드 구성 요소별 데이터 필요도
    "현재 보유" : 30
    "부분 보유" : 35
    "완전 부족" : 35
```

## 🎯 대시보드 구성 요소별 데이터 격차 분석

### 1️⃣ **상단 지표 카드 (6개)**

| 지표 | 현재 상태 | 필요 데이터 | 구현 난이도 |
|------|-----------|-------------|-------------|
| **총 기록 수 (21)** | ✅ 가능 | `COUNT(daily_reflections)` | 🟢 쉬움 |
| **평균 점수 (18)** | ✅ 가능 | `AVG(total_score)` | 🟢 쉬움 |
| **연속 기록 (12)** | ⚠️ 복잡 | 날짜 연속성 계산 로직 필요 | 🟡 보통 |
| **총 과제 (56)** | ❌ 불가능 | `achievements` 개수? 명확하지 않음 | 🔴 어려움 |
| **활동 추천 (4)** | ❌ 불가능 | AI 분석 또는 별도 로직 필요 | 🔴 어려움 |
| **만족도 지수 (6.5)** | ⚠️ 추정 | `condition` 텍스트 → 수치 변환 | 🟡 보통 |

### 2️⃣ **3-Part 성과 비교 레이더 차트**

```mermaid
graph LR
    A[현재 데이터] --> B{레이더 차트 가능?}
    B -->|Yes| C[이해도/집중도/성취도]
    B -->|No| D[부족한 영역들]
    
    C --> C1[understanding_score ✅]
    C --> C2[concentration_score ✅]
    C --> C3[achievement_score ✅]
    
    D --> D1[Frontend 기술 ❌]
    D --> D2[Algorithm 기술 ❌]
    D --> D3[Backend 기술 ❌]
    D --> D4[Database 기술 ❌]
    D --> D5[DevOps 기술 ❌]
    D --> D6[Data Science 기술 ❌]
    

```

**분석 결과:**
- ✅ **기본 3축은 구현 가능**: understanding/concentration/achievement 점수
- ❌ **기술 영역별 세분화 불가능**: subjects 데이터가 구체적이지 않음
- 🔄 **개선 필요**: subjects를 구조화된 기술 스택별 점수로 변경

### 3️⃣ **학습 현황 오른쪽 패널**

```mermaid
flowchart TD
    A[학습 현황 요구사항] --> B[열심 상황 요약]
    A --> C[학습 설정]
    A --> D[성능]
    A --> E[최근 시간대]
    A --> F[과제 범위]
    A --> G[수정 예측]
    
    B --> B1[❌ AI 분석 필요]
    C --> C1[❌ 별도 설정 데이터]
    D --> D1[⚠️ 부분 가능]
    E --> E1[✅ time_part 활용]
    F --> F1[❌ 과제 세부 분류]
    G --> G2[❌ 예측 모델 필요]

```

### 4️⃣ **시간대별 학습 패턴 (하단)**

| 요소 | 현재 상태 | 구현 가능성 |
|------|-----------|-------------|
| **오전/오후/저녁 구분** | ✅ `time_part` 존재 | 100% |
| **시간대별 성과 비교** | ✅ 점수 데이터 존재 | 100% |
| **최적 시간대 추천** | ⚠️ 데이터 분석 필요 | 70% |

---

## 🚨 주요 데이터 부족 영역

### ❌ **완전히 부족한 데이터**

```mermaid
graph TD
    A[부족한 데이터 영역] --> B[기술 스택별 세분화]
    A --> C[학습 목표 및 계획]
    A --> D[과제 관리 시스템]
    A --> E[AI 인사이트 기능]
    
    B --> B1[Frontend/Backend 구분]
    B --> B2[Algorithm/Database 구분]
    B --> B3[각 기술별 숙련도]
    
    C --> C1[단기/장기 목표]
    C --> C2[학습 스케줄]
    C --> C3[진도율 추적]
    
    D --> D1[과제 상태 관리]
    D --> D2[우선순위]
    D --> D3[완료율 통계]
    
    E --> E1[학습 패턴 분석]
    E --> E2[개선 제안]
    E --> E3[예측 모델링]

```

### ⚠️ **부분적으로 부족한 데이터**

| 영역 | 현재 상태 | 부족한 부분 | 해결 방안 |
|------|-----------|-------------|-----------|
| **과목별 점수** | `subjects: {}` (빈 객체) | 구체적 과목 분류 | 데이터 수집 구조 개선 |
| **성취 내용** | `achievements` 배열 | 카테고리 분류 | 텍스트 분석 + 태깅 |
| **컨디션 수치화** | `condition: "좋음"` | 정량적 지표 | 텍스트→숫자 매핑 |
| **학습 시간** | 없음 | 실제 학습 소요 시간 | 새로운 필드 추가 |

---

## 💡 개선 제안 및 해결 방안

### 🎯 **즉시 구현 가능한 영역 (현재 데이터 활용)**

```mermaid
graph LR
    A[현재 데이터] --> B[즉시 구현 가능]
    
    B --> C[기본 통계 대시보드]
    B --> D[3축 레이더 차트]
    B --> E[시간대별 분석]
    B --> F[트렌드 차트]
    
    C --> C1[총 기록 수]
    C --> C2[평균 점수]
    C --> C3[최고/최저점]
    
    D --> D1[이해도/집중도/성취도]
    D --> D2[시간대별 비교]
    
    E --> E1[morning/afternoon/evening]
    E --> E2[최적 시간대 식별]
    
    F --> F1[일별 점수 변화]
    F --> F2[주간/월간 추세]
    

```

### 🔧 **단기 개선 방안 (1-2주 내)**

1. **subjects 데이터 구조화**
```json
{
  "subjects": {
    "frontend": {"react": 8, "nextjs": 7},
    "backend": {"python": 9, "fastapi": 6},
    "database": {"postgresql": 7, "supabase": 8},
    "algorithm": {"sorting": 6, "graph": 5}
  }
}
```

2. **achievements 카테고리 분류**
```json
{
  "achievements": [
    {"category": "tableau", "content": "Excel파일 import 학습", "difficulty": "medium"},
    {"category": "dashboard", "content": "컨테이너 개념 이해", "difficulty": "easy"}
  ]
}
```

3. **새로운 필드 추가**
```sql
ALTER TABLE daily_reflections ADD COLUMN study_duration_minutes INTEGER;
ALTER TABLE daily_reflections ADD COLUMN satisfaction_score INTEGER; -- 1-10
ALTER TABLE daily_reflections ADD COLUMN energy_level INTEGER; -- 1-10
```

### 🚀 **중장기 개발 방안 (1-3개월)**

```mermaid
timeline
    title 데이터 확장 로드맵
    
    section 1주차
        데이터 구조화 : subjects 세분화
                      : achievements 태깅
                      : 새 필드 추가
    
    section 2-4주차
        고급 분석 구현 : AI 인사이트 엔진
                      : 예측 모델 개발
                      : 개인화 추천
    
    section 2-3개월
        완전한 대시보드 : 목표 관리 시스템
                        : 과제 추적 기능
                        : 소셜 기능 (비교)
```

### 🎨 **대안 대시보드 설계**

현재 데이터로 구현 가능한 **현실적인 대시보드**:

```mermaid
graph TB
    subgraph "현실적 대시보드 구성"
        A["상단: 기본 통계 (4개)"]
        B[중앙 좌측: 3축 레이더]
        C[중앙 우측: 일별 트렌드]
        D[하단: 시간대별 성과]
    end
    
    A --> A1[총 기록 수]
    A --> A2[평균 점수]
    A --> A3[연속 기록]
    A --> A4[컨디션 지수]
    
    B --> B1[이해도]
    B --> B2[집중도] 
    B --> B3[성취도]
    
    C --> C1[일별 점수 변화]
    C --> C2[주간 평균]
    
    D --> D1[오전 성과]
    D --> D2[오후 성과]
    D --> D3[저녁 성과]
    

```

---

## 📋 최종 결론 및 권장사항

### ✅ **즉시 구현 가능 (현재 데이터)**
- 기본 통계: 총 기록 수, 평균 점수, 연속 기록
- 3축 레이더 차트: 이해도/집중도/성취도
- 시간대별 성과 분석
- 일별/주별 트렌드 차트

### ⚠️ **부분 구현 가능 (데이터 가공 필요)**
- 컨디션 수치화: "좋음" → 8점 매핑
- 성취 카테고리 분석: achievements 텍스트 분류
- 연속 기록 계산: 날짜 gap 분석 로직

### ❌ **구현 불가능 (새로운 데이터 필요)**
- 기술 스택별 세분화된 레이더 차트
- AI 기반 학습 인사이트 및 추천
- 과제 관리 및 진도율 추적
- 목표 대비 성과 분석

### 🎯 **권장 우선순위**

```mermaid
graph TD
    A[1순위: 현재 데이터 활용] --> A1[기본 대시보드 구현]
    B[2순위: 데이터 구조 개선] --> B1[subjects/achievements 구조화]
    C[3순위: 고급 기능 개발] --> C1[AI 분석 및 예측]
    
    A1 --> A2[✅ 즉시 사용자 가치 제공]
    B1 --> B2[🔧 데이터 품질 향상]
    C1 --> C3[🚀 차별화된 인사이트]
    

```

**결론**: 현재 데이터로는 목표 대시보드의 **약 40%** 정도만 구현 가능하지만, 단계적 개선을 통해 완전한 대시보드 구현이 가능합니다. 먼저 현재 데이터를 활용한 **기본 버전**을 구현하고, 점진적으로 데이터 수집 구조를 개선해 나가는 것을 권장합니다.
