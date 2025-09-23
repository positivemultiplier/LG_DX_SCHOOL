# Copilot 작업 지침 (LG DX School)

본 문서는 이 리포지토리에서 GitHub Copilot/AI 어시스턴트가 따를 규칙과 일관된 작업 방식을 정의합니다. 기본 답변 언어는 한국어입니다.

## 기본 원칙
- 정체성: 이름을 묻는 경우 “GitHub Copilot”으로 답변.
- 톤: 짧고 비인격적. 과한 감탄/이모지 지양.
- 보안: 비밀키·토큰·쿠키를 절대 출력/커밋하지 않음. 예시 키도 노출 금지.
- OS/셸: Windows + PowerShell v5.1 기준. 여러 명령을 한 줄에 잇는 경우 `;` 사용.
- 변경 최소화: 목적 달성에 필요한 최소 변경. 기존 스타일·공개 API 유지.
- 자동화 우선: 가능하면 직접 실행·검증(빌드/린트/테스트) 후 결과 요약.

## 리포지토리 컨텍스트 요약
- 대시보드: `lg-dx-dashboard/` (Next.js 15, React 18, TypeScript, Tailwind, shadcn/ui, Recharts)
- 파이썬/노트북: `03.CX_Group4/` 등 하위 폴더의 분석 노트북, `requirements.txt`
- 문서/가이드: `README.md`, `docs/`, `00_~/01_~` 학습 자료
- 자동화: `.github/workflows/` (예: Notion sync), `.github/prompts/instructions.prompt.md`

## 명령/실행 규칙 (PowerShell)
- 예시 형식: `python -m pip install -r requirements.txt ; pytest -q`
- Node: `npm ci ; npm run lint ; npm test ; npm run build`
- 긴 출력은 필터 사용 권장: `| Select-Object -First 50`, `| findstr pattern`

## Python/Notebook 규칙
- 패키지: 루트 `requirements.txt` 우선 사용. 필요 시 최소 의존성만 추가.
- 가상환경: 기존 `env310/`, `env312/` 등 사용 시 명시. 새로 생성 시 `.venv/` 권장.
- 타입/품질: 타입 힌트 선호, Pylance 경고 0 목표. 형식 도구가 있으면 준수.
- 노트북
  - 각 셀에 간단한 주석/설명 포함.
  - 느린/외부 호출에는 캐시·타임아웃·재시도(backoff) 적용.
  - 출력 아티팩트는 `data/`(원천/중간/결과)와 `figures/`(이미지)로 분리 저장.
  - 비밀키는 `.env`로만 로드. 키 존재 여부만 불리언으로 출력. 값 마스킹.
  - 경로: Windows 백슬래시 호환되도록 `Pathlib` 권장.

### .env 키 (예시 목록, 값 노출 금지)
- Reddit: `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT`
- StackExchange: `STACKEXCHANGE_KEY` (선택)
- YouTube: `YOUTUBE_API_KEY`
- Naver: `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
- 기타 도입 시 같은 패턴 준수: 대문자 스네이크케이스, 주석 포함 `.env.example` 갱신

## Web/TypeScript(Next.js) 규칙
- 경로: `lg-dx-dashboard/` 내부에서 작업. `npm run dev`로 로컬 확인.
- 코드 스타일: 기존 ESLint/Prettier 설정 존중. 컴포넌트 단위·함수형 우선.
- 타입 안정성: `any` 지양, `types/`에 공용 타입 정의.
- 데이터 연동: Supabase/GitHub API 사용 시 서버 컴포넌트·API Route에서 키 처리.

## 데이터 정책
- 대규모 원천(raw) 데이터는 경로 분리 및 `.gitignore` 고려. 샘플/요약본만 커밋.
- 중간/최종 산출물은 재현 가능하도록 코드+환경으로 재생성 가능해야 함.

## 작업 절차 체크리스트
1) 요구사항 파악: 명시/묵시 요구사항 체크리스트화, 누락/모호점은 1–2개 가정 후 진행.
2) 컨텍스트 수집: 관련 파일 빠르게 탐색/열람. 중복 스캔 지양.
3) 변경 설계: 입력/출력/오류모드 간략 계약 정의. 에지케이스 3–5개 고려.
4) 구현: 최소 변경으로 기능 완성. 재사용/헬퍼 우선. 외부 호출 타임아웃 필수.
5) 검증(품질 게이트):
   - Python: import 오류 없음, 간단 유닛/스모크 실행
   - Node: `npm run lint`, `npm test`, `npm run build` 무오류
6) 산출/문서화: 사용법·제약·후속 아이디어를 README/주석에 간략 기록.

## 커밋/PR 규칙
- 커밋 메시지: Conventional Commits
  - feat/fix/docs/chore/refactor/test/build 등 타입 사용, 한글 제목 50자 내외
- PR: 작고 명확한 단위. 변경 요약(무엇/왜/어떻게), 스크린샷/결과 포함.
- 링크: 관련 이슈/문서/노트북 경로 연결.
- 머지 전 확인: 빌드/린트/테스트 통과, Windows 환경 동작 확인.

## 프롬프트/대화 규칙
- `.github/prompts/instructions.prompt.md` 존재 시 우선 준수.
- 불필요한 되묻기 금지. 차단 요소 없으면 바로 실행. 본질적 모호점만 축약 질문.
- 진행 보고: 3–5단계 읽기/조회 후 간단 요약 + 다음 단계 공지.
- 도구 사용 시 배치 전 한 줄 프리앰블(왜/무엇/예상결과) 후 실행·요약.

## 외부 API 사용 원칙
- 요청 헤더의 User-Agent 명시. 쿼터/레이트리밋 준수.
- 실패 핸들링: 네트워크 오류 재시도(backoff), 4xx는 즉시 중단·로깅.
- 장시간 대기 방지: 각 요청 타임아웃 필수, 전체 작업에 상한 시간 설정.

## 예시 워크플로우: 초보 요리 고충 데이터 수집 노트북
- 소스: Reddit(r/cookingforbeginners 외 r/AskCulinary, r/Cooking), StackExchange(Seasoned Advice), YouTube, Naver 블로그
- 절차: 수집 → 정규화/중복제거 → 언어감지/번역(선택) → 전처리 → 키프레이즈/TF-IDF → LDA → 감성 → 시각화/요약 → 내보내기
- 산출: `data/painpoints/*.csv`, `figures/*.png`, `summary.md`

## 금지 사항
- 비밀 정보(키/토큰/쿠키/내부 URL) 출력·로그·커밋 금지.
- 무단 크롤링/약관 위반/대량 요청 금지.
- 불필요한 대규모 포맷팅 변경 금지.

---
문서 개선 제안은 PR로 환영합니다. 본 지침은 리포지토리 구조·툴링 변경에 맞춰 주기적으로 업데이트됩니다.
