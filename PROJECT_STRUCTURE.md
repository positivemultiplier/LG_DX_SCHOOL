# 3-Part Daily Reflection Dashboard 프로젝트 구조

## 📁 디렉토리 구조

```
c:\Users\profe\LG_DX_School\
├── 📂 src/
│   └── 📂 notion_automation/
│       ├── 📂 core/                    # 핵심 비즈니스 로직
│       │   ├── github_time_analyzer.py # 시간대별 GitHub 활동 분석
│       │   ├── notion_db_manager.py    # Notion DB 관리
│       │   └── time_part_classifier.py # 3-Part 시간대 분류
│       ├── 📂 scripts/                 # 실행 스크립트
│       │   ├── morning_reflection.py   # 오전수업 반성 입력
│       │   ├── afternoon_reflection.py # 오후수업 반성 입력
│       │   ├── evening_reflection.py   # 저녁자율학습 반성 입력
│       │   └── test_connections.py     # MCP 연결 테스트
│       ├── 📂 dashboard/               # 대시보드 및 시각화
│       │   ├── time_part_visualizer.py # 시간대별 비교 시각화
│       │   ├── optimal_time_analyzer.py # 최적 시간대 분석
│       │   └── create_3part_dashboard.py # 통합 대시보드 생성
│       └── 📂 utils/                   # 유틸리티 함수
│           ├── logger.py              # 로깅 시스템
│           ├── error_handler.py       # 에러 처리
│           ├── date_utils.py          # 날짜 처리 유틸리티
│           └── config_loader.py       # 설정 파일 로더
├── 📂 config/                         # 설정 파일
│   ├── time_schedules.json           # 3-Part 시간대 설정
│   ├── subjects_mapping.json         # 과목별 매핑 설정
│   └── dashboard_layout.json         # 대시보드 레이아웃 설정
├── 📂 tests/                          # 테스트 파일
│   ├── test_time_classification.py   # 시간대 분류 테스트
│   ├── test_3part_integration.py     # 3-Part 통합 테스트
│   └── test_mcp_connections.py       # MCP 연결 테스트
├── 📂 logs/                           # 로그 파일
│   └── 3part_dashboard.log           # 시스템 로그
├── 📂 data/                           # 데이터 파일
│   ├── 📂 backups/                    # 백업 데이터
│   └── 📂 cache/                      # 캐시 데이터
├── 📂 docs/                           # 문서
│   ├── daily_reflection_dashboard.md
│   ├── daily_reflection_dashboard_tasks.md
│   └── phase_reports/                # Phase별 완료 보고서
├── .env.local.template               # 환경변수 템플릿
├── .env.local                        # 실제 환경변수 (생성 필요)
└── README.md                         # 프로젝트 설명
```

## 📋 주요 구성 요소

### 🔧 Core 모듈
- **github_time_analyzer.py**: 시간대별 GitHub 활동 분석 및 분류
- **notion_db_manager.py**: 3-Part Notion DB CRUD 작업
- **time_part_classifier.py**: 오전/오후/저녁 시간대 분류 로직

### ⚡ Scripts 모듈  
- **morning_reflection.py**: 12:00 오전수업 반성 입력 자동화
- **afternoon_reflection.py**: 17:00 오후수업 반성 입력 자동화
- **evening_reflection.py**: 22:00 저녁자율학습 반성 입력 자동화

### 📊 Dashboard 모듈
- **time_part_visualizer.py**: 3개 시간대 성과 비교 시각화
- **optimal_time_analyzer.py**: 개인 최적 학습 시간대 식별
- **create_3part_dashboard.py**: 통합 대시보드 페이지 생성

### 🛠️ Utils 모듈
- **logger.py**: 통합 로깅 시스템
- **error_handler.py**: 에러 처리 및 복구
- **date_utils.py**: 3-Part 날짜/시간 처리
- **config_loader.py**: 환경변수 및 설정 관리

## 🚀 실행 순서

1. **환경 설정**: `.env.local` 파일 생성 및 설정
2. **연결 테스트**: `python src/notion_automation/scripts/test_connections.py`
3. **DB 생성**: Phase 2에서 3-Part Notion DB 생성
4. **시간대별 실행**: 각 시간대에 맞는 reflection 스크립트 실행
5. **대시보드 확인**: 통합 대시보드에서 3-Part 분석 결과 확인
