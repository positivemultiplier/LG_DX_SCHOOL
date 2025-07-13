/**
 * GitHub API 클라이언트
 * GitHub REST API와의 통신을 담당
 */

import { 
  GitHubUser, 
  GitHubRepository, 
  GitHubCommit, 
  GitHubEvent,
  GitHubApiResponse,
  GitHubApiError,
  GitHubLanguageStats,
  GitHubContribution
} from './types'
import { githubRateLimiter, withRateLimit } from './rate-limiter'

export class GitHubApiClient {
  private baseUrl = 'https://api.github.com'
  private token: string

  constructor(token: string) {
    this.token = token
  }

  /**
   * API 요청을 위한 공통 헤더
   */
  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'LG-DX-Dashboard/1.0'
    }
  }

  /**
   * API 요청 래퍼
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<GitHubApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        }
      })

      // Rate limit 정보 추출
      const rateLimitInfo = {
        limit: parseInt(response.headers.get('x-ratelimit-limit') || '0'),
        remaining: parseInt(response.headers.get('x-ratelimit-remaining') || '0'),
        reset: parseInt(response.headers.get('x-ratelimit-reset') || '0'),
        used: parseInt(response.headers.get('x-ratelimit-used') || '0')
      }

      // Rate Limiter에 정보 업데이트
      githubRateLimiter.updateRateLimit(rateLimitInfo)

      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          message: errorData.message || 'GitHub API request failed',
          status: response.status,
          errors: errorData.errors
        } as GitHubApiError
      }

      const data = await response.json()

      return {
        data,
        status: response.status,
        headers: responseHeaders,
        rate_limit: rateLimitInfo
      }
    } catch (error) {
      if (error instanceof Error) {
        throw {
          message: error.message,
          status: 0
        } as GitHubApiError
      }
      throw error
    }
  }

  /**
   * 현재 인증된 사용자 정보 조회
   */
  async getCurrentUser(): Promise<GitHubApiResponse<GitHubUser>> {
    return githubRateLimiter.executeRequest(
      'getCurrentUser',
      () => this.makeRequest<GitHubUser>('/user'),
      { priority: 'high' }
    )
  }

  /**
   * 사용자의 저장소 목록 조회
   */
  async getUserRepositories(
    username?: string,
    options: {
      type?: 'all' | 'owner' | 'member'
      sort?: 'created' | 'updated' | 'pushed' | 'full_name'
      direction?: 'asc' | 'desc'
      per_page?: number
      page?: number
    } = {}
  ): Promise<GitHubApiResponse<GitHubRepository[]>> {
    const { 
      type = 'owner', 
      sort = 'updated', 
      direction = 'desc',
      per_page = 100,
      page = 1
    } = options

    const endpoint = username ? `/users/${username}/repos` : '/user/repos'
    const params = new URLSearchParams({
      type,
      sort,
      direction,
      per_page: per_page.toString(),
      page: page.toString()
    })

    return this.makeRequest<GitHubRepository[]>(`${endpoint}?${params}`)
  }

  /**
   * 저장소의 커밋 목록 조회
   */
  async getRepositoryCommits(
    owner: string,
    repo: string,
    options: {
      sha?: string
      path?: string
      author?: string
      since?: string
      until?: string
      per_page?: number
      page?: number
    } = {}
  ): Promise<GitHubApiResponse<GitHubCommit[]>> {
    const { per_page = 100, page = 1 } = options
    const params = new URLSearchParams({
      per_page: per_page.toString(),
      page: page.toString()
    })

    // 옵션 파라미터 추가
    if (options.sha) params.append('sha', options.sha)
    if (options.path) params.append('path', options.path)
    if (options.author) params.append('author', options.author)
    if (options.since) params.append('since', options.since)
    if (options.until) params.append('until', options.until)

    return this.makeRequest<GitHubCommit[]>(`/repos/${owner}/${repo}/commits?${params}`)
  }

  /**
   * 사용자의 공개 이벤트 조회
   */
  async getUserEvents(
    username: string,
    options: {
      per_page?: number
      page?: number
    } = {}
  ): Promise<GitHubApiResponse<GitHubEvent[]>> {
    const { per_page = 100, page = 1 } = options
    const params = new URLSearchParams({
      per_page: per_page.toString(),
      page: page.toString()
    })

    return this.makeRequest<GitHubEvent[]>(`/users/${username}/events/public?${params}`)
  }

  /**
   * 저장소의 언어 통계 조회
   */
  async getRepositoryLanguages(
    owner: string,
    repo: string
  ): Promise<GitHubApiResponse<GitHubLanguageStats>> {
    return this.makeRequest<GitHubLanguageStats>(`/repos/${owner}/${repo}/languages`)
  }

  /**
   * 사용자의 기여도 데이터 조회 (GraphQL API 사용)
   */
  async getUserContributions(
    username: string,
    fromDate: string,
    toDate: string
  ): Promise<GitHubContribution[]> {
    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                  contributionLevel
                }
              }
            }
          }
        }
      }
    `

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables: {
          username,
          from: fromDate,
          to: toDate
        }
      })
    })

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
    }

    const weeks = result.data?.user?.contributionsCollection?.contributionCalendar?.weeks || []
    const contributions: GitHubContribution[] = []

    weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        contributions.push({
          date: day.date,
          count: day.contributionCount,
          level: day.contributionLevel as 0 | 1 | 2 | 3 | 4
        })
      })
    })

    return contributions
  }

  /**
   * Rate Limit 상태 확인
   */
  async getRateLimit(): Promise<GitHubApiResponse<{
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
  }>> {
    return this.makeRequest('/rate_limit')
  }

  /**
   * 토큰 유효성 검증
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch (error) {
      return false
    }
  }
}

/**
 * GitHub API 클라이언트 팩토리
 */
export function createGitHubClient(token: string): GitHubApiClient {
  return new GitHubApiClient(token)
}

/**
 * Rate Limit 확인 유틸리티
 */
export function checkRateLimit(response: GitHubApiResponse<any>): {
  isNearLimit: boolean
  resetTime: Date
  remainingRequests: number
} {
  const rateLimit = response.rate_limit
  if (!rateLimit) {
    return {
      isNearLimit: false,
      resetTime: new Date(),
      remainingRequests: 0
    }
  }

  return {
    isNearLimit: rateLimit.remaining < 100, // 100개 미만이면 경고
    resetTime: new Date(rateLimit.reset * 1000),
    remainingRequests: rateLimit.remaining
  }
}

/**
 * GitHub API 에러 처리 유틸리티
 */
export function handleGitHubError(error: GitHubApiError): {
  message: string
  isRetryable: boolean
  retryAfter?: number
} {
  switch (error.status) {
    case 401:
      return {
        message: 'GitHub 토큰이 유효하지 않습니다. 다시 연결해주세요.',
        isRetryable: false
      }
    case 403:
      return {
        message: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
        isRetryable: true,
        retryAfter: 3600 // 1시간 후 재시도
      }
    case 404:
      return {
        message: '요청한 GitHub 리소스를 찾을 수 없습니다.',
        isRetryable: false
      }
    case 422:
      return {
        message: '잘못된 요청입니다. 입력 데이터를 확인해주세요.',
        isRetryable: false
      }
    case 500:
    case 502:
    case 503:
      return {
        message: 'GitHub 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        isRetryable: true,
        retryAfter: 300 // 5분 후 재시도
      }
    default:
      return {
        message: error.message || '알 수 없는 오류가 발생했습니다.',
        isRetryable: true,
        retryAfter: 60 // 1분 후 재시도
      }
  }
}