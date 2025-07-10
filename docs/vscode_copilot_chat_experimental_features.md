### 3. Python 관련 실험적(Experimental) 기능

#### 3-1. Add Hover Summaries
- **설명:**
  - Python 코드에서 마우스를 올렸을 때, Copilot이 생성한 요약(hover summary)을 툴팁으로 보여주는 기능입니다.
  - 이 기능을 활성화하면, 함수나 변수 위에 마우스를 올릴 때 AI가 자동으로 생성한 간단한 설명을 볼 수 있습니다.
  - 코드 이해와 리뷰에 도움이 됩니다.
  - 설정: `Python › Analysis: Add Hover Summaries`

#### 3-2. AI Code Actions
- **설명:**
  - Python 코드에서 AI가 제안하는 코드 액션(예: 리팩토링, 수정 등)을 사용할 수 있게 해주는 기능입니다.
  - 이 기능을 사용하려면 Copilot Chat 확장이 활성화되어 있어야 합니다.
  - 코드 편집 시 AI가 자동으로 코드 개선, 수정, 리팩토링 등의 액션을 제안할 수 있습니다.
  - 설정: `Python › Analysis: Ai Code Actions`

# VS Code GitHub Copilot Chat 실험적(Experimental) 및 프리뷰(Preview) 기능 상세 설명

이 문서는 Visual Studio Code에서 GitHub Copilot Chat의 실험적(Experimental) 기능들을 한글로 자세히 설명합니다. 각 기능은 최신 Copilot 확장(프리뷰 포함)에서 활성화할 수 있으며, 일부는 `settings.json`에서 직접 설정할 수 있습니다.

---

## 기능 분류

### 1. 프리뷰(Preview) 기능

#### 1-1. Byok: Ollama Endpoint
- **설명:**
  - Ollama를 BYOK(Bring Your Own Key) 방식으로 사용할 때 엔드포인트를 지정합니다.
  - 기본값은 `http://localhost:11434`입니다.

#### 1-2. Codesearch
- **설명:**
  - `#codebase` 명령어 사용 시 agentic 코드 검색 기능을 활성화합니다.

#### 1-3. Copilot Debug Command
- **설명:**
  - 터미널에서 `copilot-debug` 명령어를 사용할 수 있도록 활성화합니다.

#### 1-4. Review Selection
- **설명:**
  - 현재 선택 영역에 대한 코드 리뷰 기능을 활성화합니다.

#### 1-5. Review Selection: Instructions
- **설명:**
  - 선택 영역 코드 리뷰 요청에 추가할 지침을 설정합니다.
  - 워크스페이스 내 파일 또는 자연어로 지침을 입력할 수 있습니다.
  - 예시: `{ "file": "filename" }`, `{ "text": "Use underscore for field names." }`
  - 지침이 부정확하면 Copilot의 효과가 저하될 수 있습니다.

#### 1-6. Start Debugging
- **설명:**
  - 패널 챗에서 `/startDebugging` 의도를 활성화합니다.
  - 쿼리에 맞는 launch config를 생성하거나 찾아서 디버깅을 시작할 수 있습니다.

---

### 2. 실험적(Experimental) 기능


#### 2-1. Agent: Current Editor Context
- **설명:**
  - Agent 모드에서 Copilot이 현재 활성 에디터의 파일명을 컨텍스트에 포함시킵니다.
  - 복잡한 요청에서 현재 작업 중인 파일 정보를 Copilot이 더 잘 이해할 수 있게 도와줍니다.

#### 2-2. Agent: Thinking Tool
- **설명:**
  - Copilot이 응답을 생성하기 전에 요청을 더 깊이 있게 사고(thinking)할 수 있도록 하는 도구를 활성화합니다.
  - 복잡한 문제 해결이나 단계별 사고가 필요한 작업에 유용합니다.

#### 2-3. Code Generation: Instructions
- **설명:**
  - 코드 생성 요청에 추가할 지침을 설정합니다.
  - 워크스페이스 내 파일 또는 자연어로 지침을 입력할 수 있습니다.
  - 예시: `{ "file": "filename" }`, `{ "text": "Use underscore for field names." }`
  - 지침이 부정확하면 Copilot의 품질과 성능이 저하될 수 있습니다.

#### 2-4. Commit Message Generation: Instructions
- **설명:**
  - 커밋 메시지 생성 시 추가 지침을 설정합니다.
  - 파일 또는 자연어로 입력 가능.
  - 예시: `{ "text": "Use conventional commit message format." }`

#### 2-5. Completion Context: TypeScript Mode
- **설명:**
  - TypeScript Copilot 컨텍스트 제공자의 실행 모드를 설정합니다.
  - 예: off/on 등

#### 2-6. Editor: Temporal Context
- **설명:**
  - 인라인 채팅 요청 시 최근에 본 파일과 편집한 파일을 포함할지 여부를 설정합니다.
  - 최근 작업 맥락을 Copilot이 더 잘 이해할 수 있게 합니다.

#### 2-7. Edits: New Notebook
- **설명:**
  - Copilot Edits에서 새로운 노트북 도구를 활성화합니다.

#### 2-8. Edits: Suggest Related Files for Tests
- **설명:**
  - 테스트 작업을 위한 관련 소스 파일 추천 기능을 활성화합니다.

#### 2-9. Edits: Suggest Related Files From Git History
- **설명:**
  - Git 히스토리에서 관련 파일 추천 기능을 활성화합니다.

#### 2-10. Edits: Temporal Context
- **설명:**
  - 최근에 본 파일과 편집한 파일을 Copilot Edits 요청에 포함할지 여부를 설정합니다.

#### 2-11. Generate Tests: Code Lens
- **설명:**
  - 테스트 커버리지에 포함되지 않은 심볼에 대해 "Generate tests" 코드 렌즈를 표시합니다.

#### 2-12. Language Context: TypeScript 관련
- **Fix / Inline / Cache Timeout / Inline Completions**
  - **설명:**
    - TypeScript 언어 컨텍스트를 /fix 명령, 인라인 채팅, 자동완성 등에 사용할 수 있도록 활성화합니다.
    - Cache Timeout: TypeScript 컨텍스트 제공자의 캐시 타임아웃(기본 500ms)을 설정합니다.

#### 2-13. New Workspace Creation
- **설명:**
  - 새로운 에이전트 워크스페이스 생성 기능을 활성화합니다.

#### 2-14. Notebook: Follow Cell Execution
- **설명:**
  - Copilot이 실행 중인 셀을 자동으로 뷰포트에 표시할지 제어합니다.

#### 2-15. Pull Request Description Generation: Instructions
- **설명:**
  - PR 제목 및 설명 생성 시 추가 지침을 설정할 수 있습니다.
  - 파일 또는 자연어로 지침 입력 가능.
  - 예시: `{ "text": "Always include a list of key changes." }`

#### 2-16. Setup Tests
- **설명:**
  - `/setupTests` 의도 및 `/tests` 생성 시 프롬프트를 활성화합니다.

#### 2-17. Summarize Agent Conversation History
- **설명:**
  - 에이전트 대화 기록이 가득 차면 자동 요약 기능을 활성화합니다.

#### 2-18. Test Generation: Instructions
- **설명:**
  - 테스트 생성 요청에 추가할 지침(instructions)을 설정합니다.
  - 워크스페이스 내 파일에서 지침을 가져오거나, 자연어로 직접 지침을 입력할 수 있습니다.
  - 예시: `{ "file": "filename" }`, `{ "text": "Use underscore for field names." }`

---

## 참고
- 각 기능은 실험적(Experimental)으로, Copilot 확장 버전에 따라 제공 여부가 달라질 수 있습니다.
- 설정은 VS Code의 `settings.json` 또는 설정 UI에서 직접 변경할 수 있습니다.
- 기능별로 성능이나 품질에 영향을 줄 수 있으니, 필요에 따라 신중히 활성화하세요.

---

**프리뷰(Preview) 기능은 실험적 기능과 달리, 정식 배포 전 미리 사용해볼 수 있는 기능입니다. Copilot 확장 버전 및 환경에 따라 노출 여부가 다를 수 있습니다.**
