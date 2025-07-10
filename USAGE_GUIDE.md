# 📊 Notion 학습 대시보드 자동화 시스템 사용 가이드

---

## 1. 개요 및 핵심 컨셉

이 시스템은 GitHub 활동을 자동으로 추적하고, 개인의 주관적인 학습 경험을 Notion에 결합하여 시각적인 학습 대시보드를 구축하는 것을 목표로 합니다.

핵심은 **자동화와 수동 입력의 조화**입니다. 시스템이 할 수 있는 일(코딩 활동 추적)은 최대한 자동화하고, 사람만 할 수 있는 일(경험 기록)은 가장 편리한 곳(Notion)에서 직접 수행합니다.

```mermaid
flowchart TD
    subgraph automated_area ["🤖 자동화 영역 (Automated)"]
        A["💻 GitHub Commits"] --GitHub Actions (매일 자정)--> B("🐍 Python Script")
        B --Notion API--> C{"🗂️ Notion Database"}
    end

    subgraph manual_area ["✍️ 사용자 영역 (Manual)"]
        D["🤔 학습 경험 (난이도, 이해도 등)"] --사용자 직접 입력--> C
    end

    C --> E["📊 완성된 학습 대시보드"]
```

---

## 2. 시스템 아키텍처

이 시스템은 GitHub Actions, Python 스크립트, 그리고 Notion API를 중심으로 구성됩니다. 모든 설정은 프로젝트 내 파일들로 관리됩니다.

```mermaid
graph TD
    subgraph github_repo ["🐙 GitHub Repository"]
        A["⚙️ .github/workflows/notion_sync.yml"] --"스케줄 실행"--> B["🐍 Python (ubuntu-latest)"]
        F["🔑 .env 파일 (Secrets로 등록)"] --"환경 변수 제공"--> B
        G["📄 requirements.txt"] --"라이브러리 설치"--> B
    end

    subgraph script_logic ["🧠 Python Script Logic"]
        B --"실행"--> C["src/notion_automation/sync_dashboard.py"]
        C --"GitHub API 호출"--> D["☁️ GitHub 서버"]
        C --"Notion API 호출"--> E["☁️ Notion 서버"]
    end

    subgraph notion_db ["📝 Notion"]
        E --"데이터 조회/수정/생성"--> H["🗂️ 학습 데이터베이스"]
    end
```

---

## 3. 사용 방법 (Workflow)

매일 다음의 간단한 절차를 따릅니다.

```mermaid
sequenceDiagram
    participant User as "🧑‍💻 사용자"
    participant GitHub as "🐙 GitHub"
    participant System as "🤖 자동화 시스템"
    participant Notion as "📝 Notion"

    User->>GitHub: 학습 후 코드 커밋 & 푸시
    Note over System: 매일 자정 KST
    System->>GitHub: 오늘 자 커밋 내역 요청
    GitHub-->>System: 커밋 데이터 응답
    System->>Notion: 오늘 날짜 페이지 검색
    alt 페이지가 이미 있는 경우
        Notion-->>System: 페이지 ID 반환
        System->>Notion: 기존 페이지 업데이트 (커밋 정보)
    else 페이지가 없는 경우
        Notion-->>System: 없음 응답
        System->>Notion: 새 페이지 생성 (커밋 정보 포함)
    end
    User->>Notion: Notion 페이지 열기
    User->>Notion: 난이도, 이해도, 컨디션 등<br/>주관적 지표 직접 입력
```

**핵심:**
1.  **코딩:** 평소처럼 학습하고 GitHub에 커밋/푸시합니다.
2.  **자동 기록:** 시스템이 매일 자정, 여러분의 GitHub 활동을 Notion에 자동으로 기록합니다.
3.  **수동 입력:** Notion에 생성/업데이트된 페이지를 열고, `난이도`, `이해도`, `컨디션` 등 숫자/선택 속성을 직접 입력하여 그날의 기록을 완성합니다.

---

## 4. 환경 설정 및 유지보수

시스템 설정을 변경해야 할 경우 아래 파일을 수정합니다.

```mermaid
graph TD
    subgraph sensitive_info ["🔒 민감 정보 (Secrets)"]
        A["🔑 .env 파일"] --"GitHub Repo Secrets에 복사"--> B["NOTION_API_TOKEN, GITHUB_TOKEN 등"]
    end
    subgraph exec_env ["⚙️ 실행 환경"]
        C["📄 requirements.txt"] --"사용할 Python 라이브러리 목록"--> D["pip install -r ..."]
    end
    subgraph auto_logic ["🔄 자동화 로직"]
        E["⚙️ .github/workflows/notion_sync.yml"] --"cron: '0 15 * * *'"--> F["🕒 실행 주기 (UTC 기준)"]
        E --> G["env: ..."]
        G --"스크립트에 전달할 Secrets 매핑"--> B
    end
```

-   **API 토큰 변경 시:** `.env` 파일을 수정한 후, GitHub 레포지토리의 `Settings > Secrets and variables > Actions`에서 해당 값을 업데이트해야 합니다.
-   **실행 주기 변경 시:** `notion_sync.yml` 파일의 `cron` 값을 수정합니다. (현재는 매일 UTC 15:00 = KST 00:00)
-   **새 라이브러리 추가 시:** `pip install [라이브러리명]` 후 `pip freeze > requirements.txt` 명령으로 `requirements.txt`를 업데이트합니다.

---

## 5. 문제 해결 (Troubleshooting)

자동화가 예상대로 동작하지 않을 경우 아래 순서로 확인합니다.

```mermaid
flowchart TD
    A{"❌ 자동화 실패"} --> B["🔍 GitHub Actions 로그 확인 (Repo > Actions)"]
    B --"Secret Not Found 오류"--> C{"🔑 Repo Secrets 설정 확인"}
    B --"API Error (400, 401 등)"--> D{"💳 API 토큰 만료/권한 확인"}
    B --"Database/Page not found"--> E{"🗂️ Notion DB ID/속성 확인"}
    B --"기타 코드 오류"--> F{"🐛 Python 스크립트 디버깅"}

    C --> G["✅ 해결"]
    D --> G
    E --> G
    F --> G
```

이 가이드가 성공적인 학습 대시보드 운영에 도움이 되기를 바랍니다!