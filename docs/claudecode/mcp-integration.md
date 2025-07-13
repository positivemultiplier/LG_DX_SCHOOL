# MCP (Model Context Protocol) 통합

Claude Code와 MCP 서버를 연동하여 외부 시스템과의 상호작용을 확장하는 방법을 다룹니다.

## 🔗 MCP 개요

### MCP란?

Model Context Protocol은 AI 모델이 외부 데이터와 도구에 안전하게 접근할 수 있게 하는 표준 프로토콜입니다.

```mermaid
graph TD
    A[Claude Code] --> B[MCP Client]
    B --> C[MCP Server 1]
    B --> D[MCP Server 2]
    B --> E[MCP Server 3]
    
    C --> C1[Database]
    D --> D1[File System]
    E --> E1[Web APIs]
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#c8e6c9
    style D fill:#c8e6c9
    style E fill:#c8e6c9
```

### MCP 서버 유형

```mermaid
pie title MCP 서버 전송 방식
    "stdio (표준 입출력)" : 40
    "HTTP" : 30
    "SSE (Server-Sent Events)" : 20
    "WebSocket" : 10
```

## 🚀 MCP 서버 설정

### 1. 기본 MCP 명령어

```bash
# MCP 서버 목록 확인
claude mcp list

# 특정 서버 정보 조회
claude mcp get my-server

# MCP 서버 제거
claude mcp remove my-server
```

### 2. stdio 서버 추가

```bash
# 기본 구문
claude mcp add <서버명> <명령어> [인수...]

# 예시: 로컬 파일 시스템 서버
claude mcp add filesystem-server node /path/to/filesystem-server.js

# 환경 변수와 함께
claude mcp add weather-api -e API_KEY=your_key_here -- /path/to/weather-server
```

### 3. HTTP 서버 추가

```bash
# 기본 구문
claude mcp add --transport http <서버명> <URL>

# 예시: HTTP API 서버
claude mcp add --transport http api-server https://api.example.com/mcp

# 인증 헤더와 함께
claude mcp add --transport http secure-api https://secure-api.com/mcp \
  -e Authorization="Bearer your-token"
```

### 4. SSE 서버 추가

```bash
# 기본 구문
claude mcp add --transport sse <서버명> <URL>

# 예시: 실시간 데이터 서버
claude mcp add --transport sse realtime-data https://data-stream.com/sse

# 커스텀 헤더와 함께
claude mcp add --transport sse monitoring-stream https://monitor.com/sse \
  -e X-API-Key=your-api-key
```

## 📋 프로젝트별 MCP 설정

### .mcp.json 설정 파일

프로젝트 루트에 `.mcp.json` 파일을 생성하여 프로젝트별 MCP 서버를 정의:

```json
{
  "mcpServers": {
    "database": {
      "command": "node",
      "args": ["database-mcp-server.js"],
      "env": {
        "DB_CONNECTION_STRING": "postgresql://localhost:5432/mydb",
        "DB_MAX_CONNECTIONS": "20"
      }
    },
    "file-manager": {
      "command": "/usr/local/bin/file-manager-mcp",
      "args": ["--safe-mode", "--log-level=info"],
      "env": {
        "WORKSPACE_ROOT": "/home/user/projects"
      }
    },
    "web-scraper": {
      "transport": "http",
      "url": "https://scraper-service.internal.com/mcp",
      "headers": {
        "Authorization": "Bearer ${SCRAPER_API_KEY}",
        "X-Client-ID": "claude-code"
      }
    }
  }
}
```

### JSON으로 서버 추가

```bash
# JSON 설정으로 서버 추가
claude mcp add-json weather-service '{
  "type": "stdio",
  "command": "/usr/local/bin/weather-cli",
  "args": ["--format", "json"],
  "env": {
    "API_KEY": "your-weather-api-key",
    "CACHE_DURATION": "300"
  }
}'
```

## 🛠️ 인기 MCP 서버들

### 데이터베이스 연동

```mermaid
graph LR
    A[데이터베이스 MCP] --> B[PostgreSQL]
    A --> C[MySQL]
    A --> D[MongoDB]
    A --> E[Redis]
    
    B --> B1[SQL 쿼리 실행]
    C --> C1[스키마 조회]
    D --> D1[문서 관리]
    E --> E1[캐시 조작]
    
    style A fill:#e3f2fd
```

**PostgreSQL MCP 서버 설정:**
```bash
claude mcp add postgres-db node postgres-mcp-server.js \
  -e DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"
```

### 파일 시스템

```bash
# 안전한 파일 시스템 접근
claude mcp add filesystem node filesystem-mcp-server.js \
  -e ALLOWED_PATHS="/home/user/projects,/tmp" \
  -e FORBIDDEN_PATHS="/etc,/root"
```

### 웹 API 통합

```bash
# GitHub API 연동
claude mcp add github-api https://github-mcp-server.herokuapp.com/mcp \
  -e GITHUB_TOKEN="your_github_token"

# Slack API 연동
claude mcp add slack-api node slack-mcp-server.js \
  -e SLACK_BOT_TOKEN="xoxb-your-bot-token"
```

## 🔧 MCP 서버 개발

### 간단한 MCP 서버 예시

**package.json:**
```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  }
}
```

**server.js:**
```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// 서버 생성
const server = new Server(
  {
    name: "my-custom-server",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// 도구 정의
server.setRequestHandler("tools/list", async () => {
  return {
    tools: [
      {
        name: "get_current_time",
        description: "현재 시간을 반환합니다",
        inputSchema: {
          type: "object",
          properties: {
            timezone: {
              type: "string",
              description: "시간대 (예: Asia/Seoul)"
            }
          }
        }
      }
    ]
  };
});

// 도구 실행
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "get_current_time") {
    const timezone = args.timezone || "UTC";
    const now = new Date();
    return {
      content: [
        {
          type: "text",
          text: `현재 시간 (${timezone}): ${now.toLocaleString()}`
        }
      ]
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

// 서버 시작
const transport = new StdioServerTransport();
await server.connect(transport);
```

### MCP 서버 등록

```bash
# 개발한 서버 등록
claude mcp add my-time-server node server.js
```

## 🔍 MCP 서버 관리

### 서버 상태 확인

```bash
# 대화형 MCP 관리
> /mcp

# 서버 연결 상태 확인
> Check the status of all MCP servers

# 특정 서버 테스트
> Test the connection to the database MCP server
```

### 인증 관리

```mermaid
graph TD
    A[MCP 인증] --> B[OAuth 2.0]
    A --> C[API 키]
    A --> D[Bearer 토큰]
    A --> E[Basic Auth]
    
    B --> B1[자동 토큰 갱신]
    C --> C1[환경 변수 저장]
    D --> D1[헤더 전송]
    E --> E1[사용자명/비밀번호]
    
    style A fill:#e3f2fd
```

**OAuth 인증 예시:**
```bash
> /mcp
# OAuth 인증 필요한 서버 선택
# 브라우저에서 인증 진행
# 토큰 자동 저장
```

## 📊 실제 사용 사례

### 데이터베이스 쿼리

```bash
# MCP를 통한 데이터베이스 작업
> Connect to the PostgreSQL database and show me all users created in the last 7 days

> Create a new table for storing product reviews with appropriate indexes

> Analyze the query performance for the user search functionality
```

### 파일 시스템 작업

```bash
# 안전한 파일 작업
> Using the filesystem MCP, backup all configuration files to /backup/configs/

> Search for all Python files containing the word "deprecated" and create a migration plan

> Organize the project structure according to clean architecture principles
```

### API 통합

```bash
# 외부 API 활용
> Use the GitHub MCP to create a new repository for this project with appropriate settings

> Fetch the latest issues from our project repository and create a summary report

> Post a status update to our Slack channel about the deployment completion
```

## 🚨 보안 고려사항

### 권한 제한

```json
{
  "mcp_security": {
    "allowed_servers": ["filesystem", "database-readonly"],
    "forbidden_operations": ["delete", "drop", "truncate"],
    "rate_limits": {
      "requests_per_minute": 60,
      "max_concurrent": 5
    }
  }
}
```

### 데이터 보호

```mermaid
graph LR
    A[데이터 보호] --> B[전송 암호화]
    A --> C[접근 제어]
    A --> D[감사 로깅]
    A --> E[데이터 마스킹]
    
    B --> B1[TLS/SSL]
    C --> C1[역할 기반 권한]
    D --> D1[모든 작업 기록]
    E --> E1[민감 정보 숨김]
    
    style A fill:#ffcdd2
```

### 네트워크 보안

```bash
# 방화벽 설정 확인
> Check if the MCP server endpoints are properly secured behind our firewall

# SSL 인증서 검증
> Verify the SSL certificates for all external MCP servers
```

## 🔧 문제 해결

### 일반적인 문제들

```mermaid
pie title MCP 관련 문제 분포
    "연결 실패" : 35
    "인증 오류" : 25
    "권한 문제" : 20
    "성능 이슈" : 15
    "설정 오류" : 5
```

### 디버깅 도구

```bash
# 상세 로깅 활성화
export ANTHROPIC_LOG=debug
claude

# 특정 서버 연결 테스트
claude mcp test my-server

# 서버 상태 진단
> /mcp
# 진단 메뉴에서 상세 정보 확인
```

### 성능 최적화

```bash
# 연결 풀 최적화
> Analyze the MCP server connection patterns and suggest optimizations for better performance

# 캐싱 전략
> Implement caching for frequently accessed MCP resources to reduce latency
```

## 📈 모니터링 및 분석

### MCP 사용량 추적

```bash
# OpenTelemetry 메트릭 활성화
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=prometheus

# 사용량 분석
> Generate a report on MCP server usage patterns and identify optimization opportunities
```

### 비용 관리

```bash
# 비용 분석
> Analyze the cost impact of different MCP servers and suggest ways to optimize usage

# 사용량 제한 설정
> Set up rate limiting for expensive MCP operations to control costs
```

---

**다음 단계**: [실전 예제](./examples.md)에서 구체적인 활용 사례들을 살펴보세요.
