/**
 * GitHub 연동 시작 API
 * GitHub OAuth 인증 URL 생성 및 리다이렉트
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // GitHub OAuth 설정 확인
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    
    if (!clientId || clientId === 'test_client_id') {
      return NextResponse.json({
        error: 'GitHub OAuth not configured',
        message: 'Please set up GitHub OAuth App first',
        setup_url: 'https://github.com/settings/developers'
      }, { status: 400 })
    }

    // GitHub OAuth URL 생성
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/github/callback`
    const scope = 'user,repo,read:user,user:email'
    const state = user_id // user_id를 state로 전달

    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize')
    githubAuthUrl.searchParams.set('client_id', clientId)
    githubAuthUrl.searchParams.set('redirect_uri', redirectUri)
    githubAuthUrl.searchParams.set('scope', scope)
    githubAuthUrl.searchParams.set('state', state)
    githubAuthUrl.searchParams.set('allow_signup', 'false')

    return NextResponse.json({
      auth_url: githubAuthUrl.toString(),
      message: 'Redirect to GitHub for authorization'
    })

  } catch (error) {
    console.error('GitHub auth start error:', error)
    return NextResponse.json(
      { error: 'Failed to generate GitHub auth URL' },
      { status: 500 }
    )
  }
}

// GitHub 연동 상태 확인
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    
    return NextResponse.json({
      configured: !!(clientId && clientSecret && 
        clientId !== 'test_client_id' && 
        clientSecret !== 'test_client_secret'),
      client_id: clientId,
      redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/github/callback`,
      scopes: ['user', 'repo', 'read:user', 'user:email']
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check GitHub OAuth configuration' },
      { status: 500 }
    )
  }
}
