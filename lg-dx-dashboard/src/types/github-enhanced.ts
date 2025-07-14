/**
 * Enhanced GitHub Types - any 타입 제거 및 타입 안전성 강화
 */

// API 응답 타입 강화
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  status?: number
}

// GitHub 연결 상태 응답
export interface GitHubConnectionResponse {
  is_connected: boolean
  integration: GitHubIntegrationData | null
  diagnostics?: {
    env_client_id: boolean
    env_client_secret: boolean
    env_webhook_secret: boolean
    db_integration_exists: boolean
    last_check: string
  }
  status: 'connected' | 'not_connected'
}

// GitHub 통합 데이터
export interface GitHubIntegrationData {
  github_username: string
  github_user_id: number
  connected_at: string
  last_sync_at: string | null
  is_active: boolean
  sync_enabled: boolean
  scope: string
}

// GitHub 동기화 응답
export interface GitHubSyncResponse {
  sync_status: GitHubSyncStatusData | null
  message?: string
}

// GitHub 동기화 상태 데이터
export interface GitHubSyncStatusData {
  user_id: string
  sync_status: 'idle' | 'syncing' | 'error' | 'completed'
  sync_progress: number
  last_sync_at: string
  next_sync_at: string | null
  total_repositories: number
  synced_repositories: number
  total_commits: number
  synced_commits: number
  error_message: string | null
}

// GitHub 설정 인터페이스
export interface GitHubSettings {
  auto_sync: boolean
  sync_interval: number
  include_private_repos: boolean
  track_languages: string[]
  exclude_repositories: string[]
  webhook_enabled: boolean
  notifications_enabled: boolean
}

// GitHub API 에러 타입
export interface GitHubApiErrorResponse {
  error: string
  details?: string
  type?: 'oauth_error' | 'api_error' | 'validation_error'
  status?: number
}

// GitHub OAuth 응답
export interface GitHubOAuthResponse {
  access_token: string
  token_type: 'bearer'
  scope: string
  error?: string
  error_description?: string
}

// GitHub 사용자 API 응답
export interface GitHubUserApiResponse {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
  html_url: string
  public_repos: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  bio: string | null
  location: string | null
  company: string | null
}

// 저장소 목록 API 응답
export interface GitHubRepositoryApiResponse {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  private: boolean
  language: string | null
  stargazers_count: number
  forks_count: number
  size: number
  created_at: string
  updated_at: string
  pushed_at: string
  default_branch: string
  owner: {
    login: string
    id: number
    avatar_url: string
    html_url: string
  }
}

// 커밋 API 응답
export interface GitHubCommitApiResponse {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
    committer: {
      name: string
      email: string
      date: string
    }
  }
  author: {
    login: string
    id: number
    avatar_url: string
  } | null
  committer: {
    login: string
    id: number
    avatar_url: string
  } | null
  url: string
  html_url: string
  stats?: {
    additions: number
    deletions: number
    total: number
  }
}

// 언어 통계 API 응답
export interface GitHubLanguageStatsApiResponse {
  [language: string]: number
}

// Rate Limit API 응답
export interface GitHubRateLimitApiResponse {
  core: {
    limit: number
    remaining: number
    reset: number
    used: number
  }
  graphql: {
    limit: number
    remaining: number
    reset: number
    used: number
  }
}

// 이벤트 핸들러 타입 정의
export type GitHubEventHandler = (data: GitHubConnectionResponse | GitHubApiErrorResponse) => void | Promise<void>

// API 요청 옵션
export interface GitHubApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: string
  timeout?: number
}

// Supabase 클라이언트 타입 (any 제거)
export interface SupabaseClient {
  from: (table: string) => SupabaseQueryBuilder
}

export interface SupabaseQueryBuilder {
  select: (columns?: string) => SupabaseQueryBuilder
  insert: (data: Record<string, unknown>) => SupabaseQueryBuilder
  update: (data: Record<string, unknown>) => SupabaseQueryBuilder
  delete: () => SupabaseQueryBuilder
  eq: (column: string, value: unknown) => SupabaseQueryBuilder
  single: () => Promise<{ data: unknown; error: Error | null }>
  upsert: (data: Record<string, unknown>) => SupabaseQueryBuilder
}

// 타입 가드 함수들
export function isGitHubConnectionResponse(obj: unknown): obj is GitHubConnectionResponse {
  return typeof obj === 'object' && obj !== null && 'is_connected' in obj
}

export function isGitHubApiErrorResponse(obj: unknown): obj is GitHubApiErrorResponse {
  return typeof obj === 'object' && obj !== null && 'error' in obj
}

export function isGitHubSyncResponse(obj: unknown): obj is GitHubSyncResponse {
  return typeof obj === 'object' && obj !== null && 'sync_status' in obj
}

// Utility 타입들
export type GitHubApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
export type GitHubSyncStatus = 'idle' | 'syncing' | 'error' | 'completed'
export type GitHubConnectionStatus = 'connected' | 'not_connected'
