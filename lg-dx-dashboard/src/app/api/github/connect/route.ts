/**
 * GitHub OAuth 연동 API
 * GitHub와의 인증 및 토큰 관리
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createGitHubClient } from '@/lib/github/api'

export async function POST(request: NextRequest) {
  try {
    const { code, state, user_id } = await request.json()

    if (!code || !user_id) {
      return NextResponse.json(
        { error: 'Authorization code and user_id are required' },
        { status: 400 }
      )
    }

    // 🔧 환경변수 검증 추가
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    
    if (!clientId || !clientSecret) {
      console.error('GitHub OAuth credentials not configured:', {
        clientId: !!clientId,
        clientSecret: !!clientSecret
      })
      return NextResponse.json(
        { 
          error: 'GitHub integration not configured',
          details: 'OAuth credentials missing'
        },
        { status: 500 }
      )
    }

    if (clientId === 'test_client_id' || clientSecret === 'test_client_secret') {
      return NextResponse.json(
        { 
          error: 'GitHub OAuth not properly configured',
          details: 'Please set up actual GitHub OAuth credentials'
        },
        { status: 500 }
      )
    }

    // GitHub OAuth 토큰 교환
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        state
      })
    })

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to exchange GitHub authorization code' },
        { status: 400 }
      )
    }

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return NextResponse.json(
        { error: tokenData.error_description || tokenData.error },
        { status: 400 }
      )
    }

    const { access_token, scope } = tokenData

    // GitHub API를 사용하여 사용자 정보 조회
    const githubClient = createGitHubClient(access_token)
    const userResponse = await githubClient.getCurrentUser()
    const githubUser = userResponse.data

    const supabase = createServerClient()

    // 기존 연동 정보 확인
    const { data: existingIntegration } = await supabase
      .from('github_integrations')
      .select('*')
      .eq('user_id', user_id)
      .single()

    const integrationData = {
      user_id,
      github_username: githubUser.login,
      github_user_id: githubUser.id,
      access_token,
      scope: scope || '',
      connected_at: new Date().toISOString(),
      is_active: true,
      sync_enabled: true
    }

    if (existingIntegration) {
      // 기존 연동 정보 업데이트
      const { error: updateError } = await supabase
        .from('github_integrations')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(integrationData as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('user_id', user_id as any)

      if (updateError) {
        throw updateError
      }
    } else {
      // 새 연동 정보 생성
      const { error: insertError } = await supabase
        .from('github_integrations')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(integrationData as any)

      if (insertError) {
        throw insertError
      }
    }

    // GitHub 설정 초기화
    const { error: settingsError } = await supabase
      .from('github_settings')
      .upsert({
        user_id,
        auto_sync: true,
        sync_interval: 360, // 6시간
        include_private_repos: false,
        track_languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go'],
        exclude_repositories: [],
        webhook_enabled: false,
        notifications_enabled: true
      } as any)

    if (settingsError) {
      console.warn('Failed to initialize GitHub settings:', settingsError)
    }

    // 동기화 상태 초기화
    const { error: syncStatusError } = await supabase
      .from('github_sync_status')
      .upsert({
        user_id,
        sync_status: 'idle',
        sync_progress: 0,
        last_sync_at: null,
        total_repositories: 0,
        synced_repositories: 0,
        total_commits: 0,
        synced_commits: 0
      } as any)

    if (syncStatusError) {
      console.warn('Failed to initialize sync status:', syncStatusError)
    }

    return NextResponse.json({
      message: 'GitHub account connected successfully',
      github_user: {
        login: githubUser.login,
        name: githubUser.name,
        avatar_url: githubUser.avatar_url,
        public_repos: githubUser.public_repos
      },
      scope: scope || '',
      connected_at: integrationData.connected_at
    })

  } catch (error) {
    console.error('GitHub connect error:', error)
    return NextResponse.json(
      { error: 'Failed to connect GitHub account' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user_id } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // GitHub 연동 해제
    const { error: disconnectError } = await supabase
      .from('github_integrations')
      .update({
        is_active: false,
        access_token: null
      } as any)
      .eq('user_id', user_id as any)

    if (disconnectError) {
      throw disconnectError
    }

    // 관련 데이터 정리 (선택적)
    await Promise.all([
      supabase
        .from('github_activities')
        .delete()
        .eq('user_id', user_id),
      
      supabase
        .from('github_sync_status')
        .delete()
        .eq('user_id', user_id),
      
      supabase
        .from('github_settings')
        .delete()
        .eq('user_id', user_id)
    ])

    return NextResponse.json({
      message: 'GitHub account disconnected successfully'
    })

  } catch (error) {
    console.error('GitHub disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect GitHub account' },
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

    const supabase = createServerClient()

    // 연동 상태 조회
    const { data: integration, error } = await supabase
      .from('github_integrations')
      .select('github_username, github_user_id, connected_at, last_sync_at, is_active, sync_enabled')
      .eq('user_id', user_id as any)
      .eq('is_active', true as any)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    const isConnected = !!integration

    return NextResponse.json({
      is_connected: isConnected,
      integration: integration || null
    })

  } catch (error) {
    console.error('Get GitHub connection status error:', error)
    return NextResponse.json(
      { error: 'Failed to get connection status' },
      { status: 500 }
    )
  }
}