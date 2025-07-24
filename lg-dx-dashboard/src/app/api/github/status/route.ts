/**
 * GitHub 연동 상태 확인 API
 * 사용자의 GitHub 연동 상태와 진단 정보를 제공합니다.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

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

    // 🔧 상세한 연동 상태 조회
    const { data: integration, error } = await supabase
      .from('github_integrations')
      .select(`
        github_username,
        github_user_id,
        connected_at,
        last_sync_at,
        is_active,
        sync_enabled,
        scope
      `)
      .eq('user_id', user_id)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Integration check error:', error)
      throw error
    }

    const isConnected = !!integration
    
    // 🔧 추가 진단 정보
    const diagnostics = {
      env_client_id: !!process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      env_client_secret: !!process.env.GITHUB_CLIENT_SECRET,
      env_webhook_secret: !!process.env.GITHUB_WEBHOOK_SECRET,
      env_github_token: !!process.env.GITHUB_TOKEN,
      client_id_is_test: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID === 'test_client_id',
      client_secret_is_test: process.env.GITHUB_CLIENT_SECRET === 'test_client_secret',
      db_integration_exists: isConnected,
      last_check: new Date().toISOString()
    }

    // 🔧 환경변수 상태 체크
    const envStatus = {
      oauth_configured: diagnostics.env_client_id && diagnostics.env_client_secret && 
                       !diagnostics.client_id_is_test && !diagnostics.client_secret_is_test,
      webhook_configured: diagnostics.env_webhook_secret,
      token_configured: diagnostics.env_github_token
    }

    return NextResponse.json({
      is_connected: isConnected,
      integration: integration || null,
      diagnostics,
      env_status: envStatus,
      status: isConnected ? 'connected' : 'not_connected',
      recommendations: generateRecommendations(envStatus, isConnected)
    })

  } catch (error) {
    console.error('Get GitHub connection status error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get connection status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

interface EnvStatus {
  oauth_configured: boolean
  webhook_configured: boolean
  token_configured: boolean
}

function generateRecommendations(envStatus: EnvStatus, isConnected: boolean): string[] {
  const recommendations: string[] = []

  if (!envStatus.oauth_configured) {
    recommendations.push('GitHub OAuth App을 생성하고 환경변수를 설정하세요.')
  }

  if (!envStatus.webhook_configured) {
    recommendations.push('Webhook Secret을 생성하고 설정하세요.')
  }

  if (!envStatus.token_configured) {
    recommendations.push('GitHub Personal Access Token을 설정하세요.')
  }

  if (envStatus.oauth_configured && !isConnected) {
    recommendations.push('GitHub 계정 연동을 시도해보세요.')
  }

  if (recommendations.length === 0) {
    recommendations.push('모든 설정이 완료되었습니다!')
  }

  return recommendations
}
