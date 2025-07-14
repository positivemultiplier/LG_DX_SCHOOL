/**
 * Phase 3: Advanced GitHub Sync API
 * 고급 GitHub 동기화 API 엔드포인트
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { performAdvancedGitHubSync } from '@/lib/github/advanced-sync'

interface SyncRequest {
  user_id: string
  force_full_sync?: boolean
  sync_repositories?: boolean
  sync_activities?: boolean
  days_to_sync?: number
}

export async function POST(request: NextRequest) {
  try {
    const requestData: SyncRequest = await request.json()
    const { user_id, force_full_sync = false } = requestData

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 1. GitHub 연동 정보 확인
    const { data: integration, error: integrationError } = await supabase
      .from('github_integrations')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json(
        { 
          error: 'GitHub integration not found or inactive',
          details: 'Please connect your GitHub account first'
        },
        { status: 404 }
      )
    }

    // 2. 동기화 진행 중인지 확인
    const { data: ongoingSync } = await supabase
      .from('github_sync_status')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'syncing')
      .single()

    if (ongoingSync && !force_full_sync) {
      return NextResponse.json(
        {
          error: 'Sync already in progress',
          sync_status: ongoingSync,
          message: 'Another sync is currently running. Use force_full_sync=true to override.'
        },
        { status: 409 }
      )
    }

    // 3. 동기화 상태 업데이트
    const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await supabase
      .from('github_sync_status')
      .upsert({
        user_id,
        sync_id: syncId,
        status: 'syncing',
        progress: 0,
        started_at: new Date().toISOString(),
        total_steps: 4,
        current_step: 1,
        step_description: 'Initializing advanced sync...'
      }, {
        onConflict: 'user_id'
      })

    // 4. GitHub 토큰 확인
    let githubToken = integration.access_token

    // Personal Access Token 사용 (환경변수에서)
    if (!githubToken || githubToken === 'test_token') {
      githubToken = process.env.GITHUB_TOKEN
      
      if (!githubToken) {
        await supabase
          .from('github_sync_status')
          .update({
            status: 'error',
            error_message: 'No valid GitHub token available',
            completed_at: new Date().toISOString()
          })
          .eq('user_id', user_id)

        return NextResponse.json(
          { 
            error: 'No valid GitHub token available',
            details: 'Please check your GitHub integration settings'
          },
          { status: 400 }
        )
      }
    }

    // 5. 고급 동기화 수행
    console.log(`🚀 Starting advanced GitHub sync for user: ${user_id}`)
    
    // 진행률 업데이트: 25%
    await supabase
      .from('github_sync_status')
      .update({
        progress: 25,
        current_step: 2,
        step_description: 'Fetching GitHub data...'
      })
      .eq('user_id', user_id)

    const syncResult = await performAdvancedGitHubSync(
      githubToken,
      user_id,
      integration.github_username
    )

    if (!syncResult.success) {
      await supabase
        .from('github_sync_status')
        .update({
          status: 'error',
          error_message: syncResult.error,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user_id)

      return NextResponse.json(
        { 
          error: 'Advanced sync failed',
          details: syncResult.error 
        },
        { status: 500 }
      )
    }

    // 6. 동기화 완료 상태 업데이트
    await supabase
      .from('github_sync_status')
      .update({
        status: 'completed',
        progress: 100,
        current_step: 4,
        step_description: 'Sync completed successfully',
        completed_at: new Date().toISOString(),
        repositories_synced: syncResult.data?.repositories.length || 0,
        activities_synced: syncResult.data?.activities.length || 0,
        commits_synced: syncResult.data?.commits.length || 0
      })
      .eq('user_id', user_id)

    // 7. 마지막 동기화 시간 업데이트
    await supabase
      .from('github_integrations')
      .update({
        last_sync_at: new Date().toISOString(),
        sync_count: (integration.sync_count || 0) + 1
      })
      .eq('user_id', user_id)

    console.log(`✅ Advanced GitHub sync completed for user: ${user_id}`)

    return NextResponse.json({
      success: true,
      sync_id: syncId,
      message: 'Advanced GitHub sync completed successfully',
      data: {
        repositories_synced: syncResult.data?.repositories.length || 0,
        activities_synced: syncResult.data?.activities.length || 0,
        commits_synced: syncResult.data?.commits.length || 0,
        summary: syncResult.data?.summary,
        sync_duration: 'N/A' // 실제 구현 시 측정
      }
    })

  } catch (error) {
    console.error('❌ Advanced GitHub sync API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * 동기화 상태 조회 API
 */
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

    const supabase = createServerClient()

    // 현재 동기화 상태 조회
    const { data: syncStatus, error } = await supabase
      .from('github_sync_status')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to get sync status' },
        { status: 500 }
      )
    }

    // 최근 동기화 로그 조회
    const { data: recentLogs } = await supabase
      .from('github_sync_logs')
      .select('*')
      .eq('user_id', user_id)
      .order('completed_at', { ascending: false })
      .limit(5)

    // GitHub 통합 정보 조회
    const { data: integration } = await supabase
      .from('github_integrations')
      .select('last_sync_at, sync_count, total_repositories, total_commits')
      .eq('user_id', user_id)
      .single()

    return NextResponse.json({
      current_sync: syncStatus || null,
      integration_info: integration || null,
      recent_syncs: recentLogs || [],
      is_sync_available: !!integration,
      next_auto_sync: null // 자동 동기화 기능 구현 시 추가
    })

  } catch (error) {
    console.error('❌ Get sync status error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
