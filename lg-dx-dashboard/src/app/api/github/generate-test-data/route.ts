/**
 * Phase 3: GitHub Test Data Generator
 * 고급 GitHub 대시보드 테스트를 위한 샘플 데이터 생성기
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 테스트 GitHub 활동 데이터 생성 (최근 30일)
    const testActivities = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]

      // 랜덤한 활동 데이터 생성
      const commitsCount = Math.floor(Math.random() * 8) + (i < 7 ? 2 : 0) // 최근 7일은 더 많은 활동
      const repositoriesCount = Math.min(Math.floor(Math.random() * 3) + 1, 5)
      const pullRequests = Math.floor(Math.random() * 3)
      const issues = Math.floor(Math.random() * 2)
      const reviews = Math.floor(Math.random() * 2)

      // 활동 레벨 계산 (0-4)
      const totalActivity = commitsCount + (pullRequests * 2) + issues + reviews
      let activityLevel = 0
      if (totalActivity === 0) activityLevel = 0
      else if (totalActivity <= 2) activityLevel = 1
      else if (totalActivity <= 5) activityLevel = 2
      else if (totalActivity <= 10) activityLevel = 3
      else activityLevel = 4

      // 사용된 언어 (랜덤)
      const languages = ['TypeScript', 'JavaScript', 'Python', 'React', 'Node.js', 'CSS']
      const languagesUsed = languages.filter(() => Math.random() > 0.7).slice(0, 3)

      testActivities.push({
        user_id,
        date: dateString,
        commits_count: commitsCount,
        repositories_count: repositoriesCount,
        activity_level: activityLevel,
        languages_used: languagesUsed,
        pull_requests: pullRequests,
        issues: issues,
        reviews: reviews,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }

    // 기존 데이터 삭제 후 새 데이터 삽입
    await supabase
      .from('github_activities')
      .delete()
      .eq('user_id', user_id)

    const { error: insertError } = await supabase
      .from('github_activities')
      .insert(testActivities)

    if (insertError) {
      console.error('Failed to insert test activities:', insertError)
      return NextResponse.json(
        { error: 'Failed to create test data', details: insertError.message },
        { status: 500 }
      )
    }

    // GitHub 통합 정보 업데이트 또는 생성
    const { data: existingIntegration } = await supabase
      .from('github_integrations')
      .select('*')
      .eq('user_id', user_id)
      .single()

    const integrationData = {
      user_id,
      github_username: 'test-user',
      github_user_id: 12345,
      access_token: 'test_token',
      is_active: true,
      sync_enabled: true,
      last_sync_at: new Date().toISOString(),
      total_repositories: 15,
      total_commits: 324,
      most_used_language: 'TypeScript',
      activity_streak: 7,
      scope: 'repo,user:email',
      connected_at: existingIntegration?.connected_at || new Date().toISOString()
    }

    if (existingIntegration) {
      await supabase
        .from('github_integrations')
        .update(integrationData)
        .eq('user_id', user_id)
    } else {
      await supabase
        .from('github_integrations')
        .insert(integrationData)
    }

    // 동기화 상태 업데이트
    await supabase
      .from('github_sync_status')
      .upsert({
        user_id,
        sync_id: `test_sync_${Date.now()}`,
        status: 'completed',
        progress: 100,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        total_steps: 4,
        current_step: 4,
        step_description: 'Test data generation completed',
        repositories_synced: 15,
        activities_synced: 30,
        commits_synced: testActivities.reduce((sum, a) => sum + a.commits_count, 0)
      }, {
        onConflict: 'user_id'
      })

    // 샘플 저장소 데이터도 생성 (github_repositories 테이블이 있다면)
    const testRepositories = [
      {
        user_id,
        name: 'lg-dx-dashboard',
        language: 'TypeScript',
        size: 2048,
        stargazers_count: 12,
        commits_count: 156,
        updated_at: new Date().toISOString()
      },
      {
        user_id,
        name: 'react-components',
        language: 'JavaScript',
        size: 1024,
        stargazers_count: 8,
        commits_count: 89,
        updated_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        user_id,
        name: 'python-scripts',
        language: 'Python',
        size: 512,
        stargazers_count: 3,
        commits_count: 45,
        updated_at: new Date(Date.now() - 172800000).toISOString()
      }
    ]

    try {
      // github_repositories 테이블이 있다면 데이터 삽입
      await supabase
        .from('github_repositories')
        .delete()
        .eq('user_id', user_id)
      
      await supabase
        .from('github_repositories')
        .insert(testRepositories)
    } catch {
      console.warn('github_repositories table not found, skipping repository data')
    }

    console.log(`✅ Generated test data for user: ${user_id}`)
    console.log(`📊 Created ${testActivities.length} activity records`)
    console.log(`📦 Created ${testRepositories.length} repository records`)

    return NextResponse.json({
      success: true,
      message: 'Test data generated successfully',
      data: {
        activities_created: testActivities.length,
        repositories_created: testRepositories.length,
        total_commits: testActivities.reduce((sum, a) => sum + a.commits_count, 0),
        date_range: {
          start: testActivities[0].date,
          end: testActivities[testActivities.length - 1].date
        }
      }
    })

  } catch (error) {
    console.error('❌ Generate test data error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
