/**
 * GitHub OAuth 콜백 처리 API
 * GitHub 인증 완료 후 토큰 교환 및 저장
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createGitHubClient } from '@/lib/github/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // user_id가 state로 전달됨
    const error = searchParams.get('error')

    // 에러 처리
    if (error) {
      console.error('GitHub OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=github_auth_failed`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=missing_params`
      )
    }

    const user_id = state

    // GitHub OAuth 토큰 교환
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error('GitHub OAuth credentials not configured')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=oauth_config_missing`
      )
    }

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
      throw new Error('Failed to exchange GitHub authorization code')
    }

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error)
    }

    const { access_token, scope } = tokenData

    // GitHub API를 사용하여 사용자 정보 조회
    const githubClient = createGitHubClient(access_token)
    const userResponse = await githubClient.getCurrentUser()
    const githubUser = userResponse.data

    const supabase = await createServerClient()

    // GitHub 연동 정보 저장
    const integrationData = {
      user_id,
      github_username: githubUser.login,
      github_user_id: githubUser.id,
      access_token,
      scope: scope || '',
      connected_at: new Date().toISOString(),
      is_active: true,
      sync_enabled: true,
      avatar_url: githubUser.avatar_url,
      github_name: githubUser.name || githubUser.login,
      public_repos: githubUser.public_repos || 0,
      followers: githubUser.followers || 0,
      following: githubUser.following || 0
    }

    // 기존 연동 정보 확인 후 upsert
    const { error: upsertError } = await supabase
      .from('github_integrations')
      .upsert(integrationData as any, {
        onConflict: 'user_id'
      })

    if (upsertError) {
      console.error('Failed to save GitHub integration:', upsertError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=save_failed`
      )
    }

    // GitHub 설정 초기화
    await supabase
      .from('github_settings')
      .upsert({
        user_id,
        auto_sync: true,
        sync_interval: 360, // 6시간
        include_private_repos: false,
        track_languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'HTML', 'CSS'],
        exclude_repositories: [],
        webhook_enabled: false,
        notifications_enabled: true
      } as any, {
        onConflict: 'user_id'
      })

    // 초기 동기화 트리거 (백그라운드에서 실행)
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/github/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id,
        force_sync: true
      })
    }).catch(console.error) // 비동기로 실행하여 리다이렉트 차단하지 않음

    // 성공 페이지로 리다이렉트
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=github_connected&username=${githubUser.login}`
    )

  } catch (error) {
    console.error('GitHub OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=oauth_failed&message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`
    )
  }
}
