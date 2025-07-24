/**
 * GitHub 데이터 동기화 API
 * 사용자의 GitHub 활동을 수집하여 데이터베이스에 저장
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createGitHubClient, handleGitHubError } from '@/lib/github/api'
import { GitHubActivityRecord, GitHubRepository, GitHubApiError } from '@/lib/github/types'

export async function POST(request: NextRequest) {
  try {
    const { user_id, force_sync = false } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // GitHub 연동 정보 조회
    const { data: integration, error: integrationError } = await supabase
      .from('github_integrations')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'GitHub integration not found or inactive' },
        { status: 404 }
      )
    }

    // 이미 동기화 중인지 확인
    const { data: syncStatus } = await supabase
      .from('github_sync_status')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (syncStatus && syncStatus.sync_status === 'syncing' && !force_sync) {
      return NextResponse.json(
        { 
          message: 'Sync already in progress',
          sync_status: syncStatus
        },
        { status: 409 }
      )
    }

    // 동기화 상태 업데이트
    await supabase
      .from('github_sync_status')
      .upsert({
        user_id,
        sync_status: 'syncing',
        sync_progress: 0,
        last_sync_at: new Date().toISOString(),
        error_message: null
      })

    // GitHub API 클라이언트 생성
    const githubClient = createGitHubClient(integration.access_token)

    try {
      // 사용자 정보 확인
      const userResponse = await githubClient.getCurrentUser()
      const githubUser = userResponse.data

      // 저장소 목록 조회
      let allRepositories: GitHubRepository[] = []
      let page = 1
      const perPage = 100

      while (true) {
        const reposResponse = await githubClient.getUserRepositories(undefined, {
          type: 'owner',
          sort: 'updated',
          direction: 'desc',
          per_page: perPage,
          page
        })

        const repositories = reposResponse.data
        if (repositories.length === 0) break

        allRepositories.push(...repositories)
        
        // 프라이빗 저장소 제외 설정 확인
        const settings = await getGitHubSettings(supabase, user_id)
        if (!settings.include_private_repos) {
          allRepositories = allRepositories.filter(repo => !repo.private)
        }

        // 제외 목록 필터링
        if (settings.exclude_repositories.length > 0) {
          allRepositories = allRepositories.filter(
            repo => !settings.exclude_repositories.includes(repo.name)
          )
        }

        if (repositories.length < perPage) break
        page++
      }

      // 동기화 진행률 업데이트
      await supabase
        .from('github_sync_status')
        .update({
          sync_progress: 25,
          total_repositories: allRepositories.length
        })
        .eq('user_id', user_id)

      // 각 저장소의 커밋 데이터 수집
      const activityRecords: GitHubActivityRecord[] = []
      const since = new Date()
      since.setMonth(since.getMonth() - 3) // 최근 3개월

      for (let i = 0; i < allRepositories.length; i++) {
        const repo = allRepositories[i]
        
        try {
          // 커밋 목록 조회
          const commitsResponse = await githubClient.getRepositoryCommits(
            githubUser.login,
            repo.name,
            {
              author: githubUser.login,
              since: since.toISOString(),
              per_page: 100
            }
          )

          // 언어 통계 조회
          const languagesResponse = await githubClient.getRepositoryLanguages(
            githubUser.login,
            repo.name
          )

          const commits = commitsResponse.data
          const languages = Object.keys(languagesResponse.data)

          // 커밋별 활동 레코드 생성
          for (const commit of commits) {
            const commitDate = new Date(commit.author.date).toISOString().split('T')[0]
            
            // 기존 레코드 확인
            const existingRecord = activityRecords.find(
              record => record.date === commitDate && 
                       record.repository_name === repo.name &&
                       record.commit_sha === commit.sha
            )

            if (!existingRecord) {
              activityRecords.push({
                id: `${user_id}_${repo.name}_${commit.sha}`,
                user_id,
                date: commitDate,
                repository_name: repo.name,
                commit_sha: commit.sha,
                commit_message: commit.message,
                commits_count: 1,
                additions: commit.stats?.additions || 0,
                deletions: commit.stats?.deletions || 0,
                files_changed: commit.stats?.total || 0,
                languages,
                event_type: 'push',
                created_at: new Date().toISOString()
              })
            }
          }

          // 진행률 업데이트
          const progress = 25 + Math.floor((i + 1) / allRepositories.length * 50)
          await supabase
            .from('github_sync_status')
            .update({
              sync_progress: progress,
              synced_repositories: i + 1
            })
            .eq('user_id', user_id)

        } catch (repoError) {
          console.warn(`Failed to sync repository ${repo.name}:`, repoError)
          continue
        }
      }

      // 활동 데이터를 일별로 집계
      const dailyActivities = aggregateDailyActivities(activityRecords)

      // 데이터베이스에 저장
      if (dailyActivities.length > 0) {
        // 기존 데이터 삭제 (최근 3개월)
        await supabase
          .from('github_activities')
          .delete()
          .eq('user_id', user_id)
          .gte('date', since.toISOString().split('T')[0])

        // 새 데이터 삽입
        const { error: insertError } = await supabase
          .from('github_activities')
          .insert(dailyActivities)

        if (insertError) {
          throw new Error(`Failed to insert activity data: ${insertError.message}`)
        }
      }

      // 동기화 완료 상태 업데이트
      await supabase
        .from('github_sync_status')
        .update({
          sync_status: 'completed',
          sync_progress: 100,
          total_commits: activityRecords.length,
          synced_commits: activityRecords.length,
          next_sync_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6시간 후
        })
        .eq('user_id', user_id)

      // GitHub 연동 정보 업데이트
      await supabase
        .from('github_integrations')
        .update({
          last_sync_at: new Date().toISOString()
        })
        .eq('user_id', user_id)

      return NextResponse.json({
        message: 'GitHub sync completed successfully',
        synced_repositories: allRepositories.length,
        synced_commits: activityRecords.length,
        daily_activities: dailyActivities.length
      })

    } catch (githubError) {
      console.error('GitHub API error:', githubError)
      
      const errorInfo = handleGitHubError(githubError as GitHubApiError)
      
      // 에러 상태 업데이트
      await supabase
        .from('github_sync_status')
        .update({
          sync_status: 'error',
          error_message: errorInfo.message,
          next_sync_at: errorInfo.retryAfter ? 
            new Date(Date.now() + errorInfo.retryAfter * 1000).toISOString() : 
            null
        })
        .eq('user_id', user_id)

      return NextResponse.json(
        { error: errorInfo.message },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // 동기화 상태 조회
    const { data: syncStatus, error } = await supabase
      .from('github_sync_status')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({
      sync_status: syncStatus || {
        user_id,
        sync_status: 'idle',
        sync_progress: 0,
        last_sync_at: null
      }
    })

  } catch (error) {
    console.error('Get sync status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 유틸리티 함수들

interface GitHubSettingsData {
  auto_sync: boolean
  sync_interval: number
  include_private_repos: boolean
  track_languages: string[]
  exclude_repositories: string[]
  webhook_enabled: boolean
  notifications_enabled: boolean
}

async function getGitHubSettings(supabase: unknown, user_id: string): Promise<GitHubSettingsData> {
  try {
    // @ts-expect-error - Supabase 클라이언트 타입 복잡성으로 인한 임시 무시
    const { data } = await supabase
      .from('github_settings')
      .select('*')
      .eq('user_id', user_id)
      .single()

    return data || {
      auto_sync: true,
      sync_interval: 360, // 6시간
      include_private_repos: false,
      track_languages: [],
      exclude_repositories: [],
      webhook_enabled: false,
      notifications_enabled: true
    }
  } catch {
    // 에러 발생 시 기본값 반환
    return {
      auto_sync: true,
      sync_interval: 360,
      include_private_repos: false,
      track_languages: [],
      exclude_repositories: [],
      webhook_enabled: false,
      notifications_enabled: true
    }
  }
}

function aggregateDailyActivities(records: GitHubActivityRecord[]) {
  const dailyMap = new Map<string, {
    user_id: string
    date: string
    commits_count: number
    repositories: Set<string>
    languages: Set<string>
    additions: number
    deletions: number
    files_changed: number
  }>()

  records.forEach(record => {
    const key = `${record.user_id}_${record.date}`
    const existing = dailyMap.get(key)

    if (existing) {
      existing.commits_count += record.commits_count
      existing.repositories.add(record.repository_name)
      record.languages.forEach(lang => existing.languages.add(lang))
      existing.additions += record.additions
      existing.deletions += record.deletions
      existing.files_changed += record.files_changed
    } else {
      dailyMap.set(key, {
        user_id: record.user_id,
        date: record.date,
        commits_count: record.commits_count,
        repositories: new Set([record.repository_name]),
        languages: new Set(record.languages),
        additions: record.additions,
        deletions: record.deletions,
        files_changed: record.files_changed
      })
    }
  })

  return Array.from(dailyMap.values()).map(activity => ({
    user_id: activity.user_id,
    date: activity.date,
    commits_count: activity.commits_count,
    repositories_count: activity.repositories.size,
    repositories: Array.from(activity.repositories),
    languages: Array.from(activity.languages),
    additions: activity.additions,
    deletions: activity.deletions,
    files_changed: activity.files_changed,
    activity_level: calculateActivityLevel(activity.commits_count),
    created_at: new Date().toISOString()
  }))
}

function calculateActivityLevel(commits: number): 0 | 1 | 2 | 3 | 4 {
  if (commits === 0) return 0
  if (commits <= 2) return 1
  if (commits <= 5) return 2
  if (commits <= 10) return 3
  return 4
}