/**
 * Phase 3: Advanced GitHub Sync System
 * 고급 GitHub 동기화 및 실시간 데이터 수집 시스템
 */

import { createServerClient } from '@/lib/supabase/server'

export interface GitHubActivity {
  date: string
  commits_count: number
  repositories_count: number
  activity_level: number
  languages_used: string[]
  pull_requests: number
  issues: number
  reviews: number
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string
  language: string
  size: number
  stargazers_count: number
  forks_count: number
  created_at: string
  updated_at: string
  pushed_at: string
  commits_count?: number
}

export interface GitHubCommit {
  sha: string
  message: string
  date: string
  repository: string
  author: string
  additions: number
  deletions: number
  files_changed: number
}

export interface GitHubSummary {
  total_repositories: number
  total_commits: number
  total_contributions: number
  most_used_language: string
  activity_streak: number
}

export class AdvancedGitHubSync {
  private token: string
  private userId: string
  private username: string

  constructor(token: string, userId: string, username: string) {
    this.token = token
    this.userId = userId
    this.username = username
  }

  /**
   * 종합적인 GitHub 데이터 동기화
   */
  async performFullSync(): Promise<{
    success: boolean
    data?: {
      repositories: GitHubRepository[]
      activities: GitHubActivity[]
      commits: GitHubCommit[]
      summary: GitHubSummary
    }
    error?: string
  }> {
    try {
      console.log(`🚀 Starting advanced GitHub sync for user: ${this.username}`)

      // 1. 저장소 목록 가져오기
      const repositories = await this.fetchRepositories()
      console.log(`📦 Found ${repositories.length} repositories`)

      // 2. 최근 활동 분석
      const activities = await this.fetchRecentActivities()
      console.log(`📊 Analyzed ${activities.length} days of activity`)

      // 3. 상세 커밋 정보 수집
      const commits = await this.fetchRecentCommits(repositories.slice(0, 10)) // 최대 10개 저장소
      console.log(`💾 Collected ${commits.length} recent commits`)

      // 4. 요약 통계 생성
      const summary = this.generateSummary(repositories, activities, commits)

      // 5. Supabase에 데이터 저장
      await this.saveToDatabase(repositories, activities, commits, summary)

      return {
        success: true,
        data: {
          repositories,
          activities,
          commits,
          summary
        }
      }
    } catch (error) {
      console.error('❌ Advanced GitHub sync failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 사용자의 모든 저장소 정보 수집
   */
  private async fetchRepositories(): Promise<GitHubRepository[]> {
    const repositories: GitHubRepository[] = []
    let page = 1
    const perPage = 100

    while (true) {
      const response = await fetch(
        `https://api.github.com/user/repos?page=${page}&per_page=${perPage}&sort=updated`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const pageData = await response.json()
      
      if (pageData.length === 0) break

      // 각 저장소의 커밋 수 계산
      for (const repo of pageData) {
        const commitsCount = await this.getRepositoryCommitCount(repo.name)
        
        repositories.push({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description || '',
          language: repo.language || 'Unknown',
          size: repo.size,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          pushed_at: repo.pushed_at,
          commits_count: commitsCount
        })
      }

      page++
      
      // API Rate Limit 고려 (최대 5000 요청/시간)
      if (repositories.length >= 500) break
    }

    return repositories
  }

  /**
   * 특정 저장소의 커밋 수 계산
   */
  private async getRepositoryCommitCount(repoName: string): Promise<number> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.username}/${repoName}/commits?per_page=1`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      if (!response.ok) return 0

      // Link 헤더에서 총 개수 파싱
      const linkHeader = response.headers.get('link')
      if (linkHeader) {
        const lastMatch = linkHeader.match(/page=(\d+)>; rel="last"/)
        if (lastMatch) {
          return parseInt(lastMatch[1]) * 100 // 대략적인 계산
        }
      }

      return 1 // 최소 1개 커밋
    } catch (error) {
      console.warn(`⚠️ Failed to get commit count for ${repoName}:`, error)
      return 0
    }
  }

  /**
   * 최근 30일간의 활동 분석
   */
  private async fetchRecentActivities(): Promise<GitHubActivity[]> {
    const activities: GitHubActivity[] = []
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // GitHub Events API 사용
    const response = await fetch(
      `https://api.github.com/users/${this.username}/events?per_page=100`,
      {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`GitHub Events API error: ${response.status}`)
    }

    const events = await response.json()

    // 날짜별로 이벤트 그룹화
    const dailyActivities = new Map<string, {
      commits: number
      repositories: Set<string>
      languages: Set<string>
      pullRequests: number
      issues: number
      reviews: number
    }>()

    for (const event of events) {
      const eventDate = new Date(event.created_at).toISOString().split('T')[0]
      
      if (!dailyActivities.has(eventDate)) {
        dailyActivities.set(eventDate, {
          commits: 0,
          repositories: new Set(),
          languages: new Set(),
          pullRequests: 0,
          issues: 0,
          reviews: 0
        })
      }

      const dayActivity = dailyActivities.get(eventDate)!

      switch (event.type) {
        case 'PushEvent':
          dayActivity.commits += event.payload.commits?.length || 0
          dayActivity.repositories.add(event.repo.name)
          break
        case 'PullRequestEvent':
          dayActivity.pullRequests++
          dayActivity.repositories.add(event.repo.name)
          break
        case 'IssuesEvent':
          dayActivity.issues++
          break
        case 'PullRequestReviewEvent':
          dayActivity.reviews++
          break
      }
    }

    // 활동 데이터 변환
    for (const [date, activity] of dailyActivities) {
      const activityLevel = this.calculateActivityLevel(
        activity.commits,
        activity.pullRequests,
        activity.issues,
        activity.reviews
      )

      activities.push({
        date,
        commits_count: activity.commits,
        repositories_count: activity.repositories.size,
        activity_level: activityLevel,
        languages_used: Array.from(activity.languages),
        pull_requests: activity.pullRequests,
        issues: activity.issues,
        reviews: activity.reviews
      })
    }

    return activities.sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * 최근 커밋 상세 정보 수집
   */
  private async fetchRecentCommits(repositories: GitHubRepository[]): Promise<GitHubCommit[]> {
    const commits: GitHubCommit[] = []
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    for (const repo of repositories.slice(0, 5)) { // 최대 5개 저장소
      try {
        const response = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?since=${oneWeekAgo.toISOString()}&per_page=50`,
          {
            headers: {
              'Authorization': `token ${this.token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        )

        if (!response.ok) continue

        const repoCommits = await response.json()

        for (const commit of repoCommits) {
          // 본인의 커밋만 필터링
          if (commit.author?.login === this.username || commit.committer?.login === this.username) {
            commits.push({
              sha: commit.sha,
              message: commit.commit.message,
              date: commit.commit.author.date,
              repository: repo.name,
              author: commit.commit.author.name,
              additions: 0, // GitHub API v3에서는 상세 정보 별도 요청 필요
              deletions: 0,
              files_changed: 0
            })
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to fetch commits for ${repo.name}:`, error)
      }
    }

    return commits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  /**
   * 활동 레벨 계산 (0-4)
   */
  private calculateActivityLevel(commits: number, prs: number, issues: number, reviews: number): number {
    const totalActivity = commits + (prs * 2) + issues + reviews
    
    if (totalActivity === 0) return 0
    if (totalActivity <= 2) return 1
    if (totalActivity <= 5) return 2
    if (totalActivity <= 10) return 3
    return 4
  }

  /**
   * 요약 통계 생성
   */
  private generateSummary(
    repositories: GitHubRepository[], 
    activities: GitHubActivity[], 
    commits: GitHubCommit[]
  ) {
    const languageCount = new Map<string, number>()
    let totalCommits = 0

    // 언어별 사용 빈도 계산
    for (const repo of repositories) {
      if (repo.language && repo.language !== 'Unknown') {
        languageCount.set(repo.language, (languageCount.get(repo.language) || 0) + 1)
      }
      totalCommits += repo.commits_count || 0
    }

    // 가장 많이 사용한 언어
    let mostUsedLanguage = 'Unknown'
    let maxCount = 0
    for (const [language, count] of languageCount) {
      if (count > maxCount) {
        maxCount = count
        mostUsedLanguage = language
      }
    }

    // 활동 연속 일수 계산
    let activityStreak = 0
    const sortedActivities = [...activities].sort((a, b) => b.date.localeCompare(a.date))
    
    for (const activity of sortedActivities) {
      if (activity.commits_count > 0 || activity.pull_requests > 0) {
        activityStreak++
      } else {
        break
      }
    }

    const totalContributions = activities.reduce(
      (sum, activity) => sum + activity.commits_count + activity.pull_requests + activity.issues,
      0
    )

    return {
      total_repositories: repositories.length,
      total_commits: totalCommits,
      total_contributions: totalContributions,
      most_used_language: mostUsedLanguage,
      activity_streak: activityStreak
    }
  }

  /**
   * 데이터베이스에 동기화된 데이터 저장
   */
  private async saveToDatabase(
    repositories: GitHubRepository[],
    activities: GitHubActivity[],
    _commits: GitHubCommit[], // 향후 사용을 위해 보관, 현재는 사용하지 않음
    summary: GitHubSummary
  ): Promise<void> {
    const supabase = createServerClient()

    try {
      // 1. GitHub 활동 데이터 저장/업데이트
      for (const activity of activities) {
        await supabase
          .from('github_activities')
          .upsert({
            user_id: this.userId,
            date: activity.date,
            commits_count: activity.commits_count,
            repositories_count: activity.repositories_count,
            activity_level: activity.activity_level,
            languages_used: activity.languages_used,
            pull_requests: activity.pull_requests,
            issues: activity.issues,
            reviews: activity.reviews,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,date'
          })
      }

      // 2. GitHub 통합 상태 업데이트
      await supabase
        .from('github_integrations')
        .update({
          last_sync_at: new Date().toISOString(),
          total_repositories: summary.total_repositories,
          total_commits: summary.total_commits,
          most_used_language: summary.most_used_language,
          activity_streak: summary.activity_streak
        })
        .eq('user_id', this.userId)

      // 3. 동기화 로그 생성
      await supabase
        .from('github_sync_logs')
        .insert({
          user_id: this.userId,
          sync_type: 'full_sync',
          status: 'completed',
          repositories_synced: repositories.length,
          activities_synced: activities.length,
          commits_synced: _commits.length,
          completed_at: new Date().toISOString(),
          summary: summary
        })

      console.log('✅ Successfully saved all GitHub data to database')
    } catch (error) {
      console.error('❌ Failed to save GitHub data to database:', error)
      throw error
    }
  }
}

/**
 * 고급 GitHub 동기화를 수행하는 헬퍼 함수
 */
export async function performAdvancedGitHubSync(
  token: string,
  userId: string,
  username: string
) {
  const syncManager = new AdvancedGitHubSync(token, userId, username)
  return await syncManager.performFullSync()
}
