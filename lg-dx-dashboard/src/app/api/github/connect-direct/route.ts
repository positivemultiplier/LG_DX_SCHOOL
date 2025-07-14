/**
 * GitHub Personal Access Token을 사용한 직접 연동 API
 * OAuth App 설정 전까지 임시로 사용할 수 있는 연동 방식
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { github_token, user_id } = await request.json()

    if (!github_token || !user_id) {
      return NextResponse.json(
        { error: 'GitHub token and user_id are required' },
        { status: 400 }
      )
    }

    // GitHub API로 사용자 정보 확인
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${github_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid GitHub token' },
        { status: 400 }
      )
    }

    const githubUser = await userResponse.json()

    // Supabase에 연동 정보 저장
    const supabase = createServerClient()

    // 기존 연동 정보 확인
    const { data: existingIntegration } = await supabase
      .from('github_integrations')
      .select('*')
      .eq('user_id', user_id)
      .eq('github_user_id', githubUser.id)
      .single()

    let integrationData

    if (existingIntegration) {
      // 기존 연동 정보 업데이트
      const { data, error } = await supabase
        .from('github_integrations')
        .update({
          access_token: github_token,
          github_username: githubUser.login,
          scope: 'repo,user:email,read:user',
          is_active: true,
          sync_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingIntegration.id)
        .select()
        .single()

      if (error) throw error
      integrationData = data
    } else {
      // 새 연동 정보 생성
      const { data, error } = await supabase
        .from('github_integrations')
        .insert({
          user_id,
          github_user_id: githubUser.id,
          github_username: githubUser.login,
          access_token: github_token,
          scope: 'repo,user:email,read:user',
          is_active: true,
          sync_enabled: true,
          connected_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      integrationData = data
    }

    // 초기 동기화 트리거
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id,
          force_sync: true
        })
      })
    } catch (syncError) {
      console.warn('Initial sync failed:', syncError)
      // 동기화 실패는 연동 자체의 성공을 방해하지 않음
    }

    return NextResponse.json({
      success: true,
      message: 'GitHub integration successful',
      integration: {
        github_username: githubUser.login,
        github_user_id: githubUser.id,
        connected_at: integrationData.connected_at,
        sync_enabled: true
      }
    })

  } catch (error) {
    console.error('GitHub direct connect error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to connect GitHub account',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
