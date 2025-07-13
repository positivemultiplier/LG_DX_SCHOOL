# Claude Code 완전 가이드

Claude Code는 Anthropic에서 개발한 AI 기반 코딩 도구로, 터미널에서 직접 작동하며 자연어 명령을 통해 코딩 작업을 지원합니다.

## 📊 문서 구조 개요

```mermaid
graph TD
    A[Claude Code 가이드] --> B[설치 및 설정]
    A --> C[기본 사용법]
    A --> D[고급 기능]
    A --> E[MCP 통합]
    A --> F[실전 예제]
    
    B --> B1[installation.md]
    C --> C1[basic-usage.md]
    D --> D1[advanced-features.md]
    E --> E1[mcp-integration.md]
    F --> F1[examples.md]
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#e0f2f1
```

## 📋 문서 목차

```mermaid
pie title 문서 카테고리 구성
    "설치 및 설정" : 20
    "기본 사용법" : 25
    "고급 기능" : 25
    "MCP 통합" : 15
    "실전 예제" : 15
```

### 📚 주요 문서

1. **[설치 및 설정](./installation.md)** - Claude Code 설치부터 초기 설정까지
2. **[기본 사용법](./basic-usage.md)** - 기본 명령어와 일반적인 사용 패턴
3. **[고급 기능](./advanced-features.md)** - 고급 기능과 도구 활용법
4. **[MCP 통합](./mcp-integration.md)** - Model Context Protocol 서버 연동
5. **[실전 예제](./examples.md)** - 실제 프로젝트에서 활용할 수 있는 예제들

## 🚀 빠른 시작

### 설치
```bash
npm install -g @anthropic-ai/claude-code
```

### 기본 사용
```bash
claude
```

## 📈 Claude Code 워크플로우

```mermaid
graph TD
    A[터미널에서 claude 실행] --> B[인증 및 설정]
    B --> C[프로젝트 디렉토리 이동]
    C --> D[자연어로 작업 요청]
    D --> E[Claude가 코드 분석]
    E --> F[파일 편집 또는 명령 실행]
    F --> G[결과 확인 및 피드백]
    G --> H{추가 작업 필요?}
    H -->|예| D
    H -->|아니오| I[작업 완료]
    
    style A fill:#e3f2fd
    style I fill:#c8e6c9
```

## 🛠️ 주요 기능

```mermaid
graph LR
    A[Claude Code] --> B[코드 편집]
    A --> C[파일 관리]
    A --> D[Git 워크플로우]
    A --> E[디버깅 지원]
    A --> F[테스트 실행]
    
    B --> B1[자동 리팩토링]
    B --> B2[코드 생성]
    C --> C1[파일 검색]
    C --> C2[구조 분석]
    D --> D1[커밋 작성]
    D --> D2[브랜치 관리]
    E --> E1[오류 분석]
    E --> E2[해결책 제시]
    F --> F1[단위 테스트]
    F --> F2[통합 테스트]
```

## 🎯 사용 사례

### 개발자를 위한 핵심 기능

```mermaid
pie title Claude Code 활용 영역
    "코드 작성 및 리팩토링" : 30
    "버그 수정 및 디버깅" : 25
    "프로젝트 분석" : 20
    "문서화" : 15
    "테스트 작성" : 10
```

1. **코드 작성**: "이 API 엔드포인트에 대한 테스트 케이스를 작성해줘"
2. **리팩토링**: "이 함수를 더 읽기 쉽게 개선해줘"
3. **버그 수정**: "이 오류를 분석하고 수정해줘"
4. **프로젝트 분석**: "이 프로젝트의 구조를 분석해줘"

## 📖 추가 자료

- [Anthropic 공식 문서](https://docs.anthropic.com/claude/docs/claude-code)
- [GitHub 저장소](https://github.com/anthropics/claude-code)
- [커뮤니티 포럼](https://community.anthropic.com)

---

**참고**: 이 가이드는 Claude Code v1.0+ 기준으로 작성되었습니다.
