/**
 * GitHub API 관련 타입 정의
 */

// GitHub 사용자 정보
export interface GitHubUser {
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

// GitHub 저장소 정보
export interface GitHubRepository {
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
  owner?: {
    login: string
    id: number
    avatar_url: string
    html_url: string
  }
}

// GitHub 커밋 정보
export interface GitHubCommit {
  sha: string
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
  url: string
  html_url: string
  stats?: {
    additions: number
    deletions: number
    total: number
  }
}

// GitHub 이벤트 정보
export interface GitHubEvent {
  id: string
  type: string
  actor: {
    id: number
    login: string
    avatar_url: string
  }
  repo: {
    id: number
    name: string
    url: string
  }
  payload: Record<string, any>
  public: boolean
  created_at: string
}

// GitHub 기여도 데이터
export interface GitHubContribution {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

// GitHub 언어 통계
export interface GitHubLanguageStats {
  [language: string]: number
}

// GitHub 활동 집계 데이터
export interface GitHubActivitySummary {
  date: string
  commits: number
  repositories: string[]
  languages: string[]
  additions: number
  deletions: number
  files_changed: number
}

// GitHub API 응답 래퍼
export interface GitHubApiResponse<T> {
  data: T
  status: number
  headers: Record<string, string>
  rate_limit?: {
    limit: number
    remaining: number
    reset: number
    used: number
  }
}

// GitHub API 에러
export interface GitHubApiError {
  message: string
  status: number
  errors?: Array<{
    resource: string
    field: string
    code: string
  }>
}

// GitHub 웹훅 이벤트
export interface GitHubWebhookEvent {
  action: string
  repository: GitHubRepository
  sender: GitHubUser
  installation?: {
    id: number
  }
}

// Push 이벤트 페이로드
export interface GitHubPushEvent extends GitHubWebhookEvent {
  ref: string
  before: string
  after: string
  commits: Array<{
    id: string
    message: string
    author: {
      name: string
      email: string
      username?: string
    }
    url: string
    distinct: boolean
  }>
  head_commit: GitHubCommit | null
}

// Issues 이벤트 페이로드
export interface GitHubIssuesEvent extends GitHubWebhookEvent {
  action: 'opened' | 'closed' | 'reopened' | 'assigned' | 'unassigned'
  issue: {
    id: number
    number: number
    title: string
    state: 'open' | 'closed'
    created_at: string
    updated_at: string
    assignee: GitHubUser | null
  }
}

// Pull Request 이벤트 페이로드
export interface GitHubPullRequestEvent extends GitHubWebhookEvent {
  action: 'opened' | 'closed' | 'reopened' | 'synchronize'
  pull_request: {
    id: number
    number: number
    title: string
    state: 'open' | 'closed'
    merged: boolean
    created_at: string
    updated_at: string
    assignee: GitHubUser | null
    head: {
      ref: string
      sha: string
    }
    base: {
      ref: string
      sha: string
    }
  }
}

// GitHub 토큰 정보
export interface GitHubToken {
  access_token: string
  token_type: string
  scope: string
}

// GitHub 연동 설정
export interface GitHubIntegration {
  user_id: string
  github_username: string
  github_user_id: number
  access_token: string
  refresh_token?: string
  scope: string
  connected_at: string
  last_sync_at?: string
  is_active: boolean
  sync_enabled: boolean
  webhook_id?: string
}

// GitHub 데이터 동기화 상태
export interface GitHubSyncStatus {
  user_id: string
  last_sync_at: string
  sync_status: 'idle' | 'syncing' | 'error' | 'completed'
  sync_progress: number
  total_repositories: number
  synced_repositories: number
  total_commits: number
  synced_commits: number
  error_message?: string
  next_sync_at?: string
}

// GitHub 설정 옵션
export interface GitHubSettings {
  auto_sync: boolean
  sync_interval: number // minutes
  include_private_repos: boolean
  track_languages: string[]
  exclude_repositories: string[]
  webhook_enabled: boolean
  notifications_enabled: boolean
}

// 내부 데이터베이스 GitHub 활동 레코드
export interface GitHubActivityRecord {
  id: string
  user_id: string
  date: string
  repository_name: string
  commit_sha?: string
  commit_message?: string
  commits_count: number
  additions: number
  deletions: number
  files_changed: number
  languages: string[]
  event_type: 'push' | 'pull_request' | 'issues' | 'create' | 'delete'
  created_at: string
}

// GitHub 통계 집계
export interface GitHubStats {
  total_commits: number
  total_repositories: number
  total_contributions: number
  active_days: number
  longest_streak: number
  current_streak: number
  favorite_languages: Array<{
    language: string
    count: number
    percentage: number
  }>
  activity_by_day: Array<{
    date: string
    commits: number
    level: 0 | 1 | 2 | 3 | 4
  }>
  monthly_summary: Array<{
    month: string
    commits: number
    repositories: number
    languages: string[]
  }>
}