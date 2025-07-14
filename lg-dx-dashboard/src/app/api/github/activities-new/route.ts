/**
 * Phase 3: Enhanced GitHub Activities API
 * GitHub 활동 데이터 조회 및 고급 분석 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

interface Repository {
  name: string
  language: string
  size: number
  stargazers_count: number
  commits_count: number
  updated_at: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const days = parseInt(searchParams.get('days') || '30')

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 지정된 일수만큼의 활동 데이터 조회
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: activities, error: activitiesError } = await supabase
      .from('github_activities')
      .select('*')
      .eq('user_id', user_id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (activitiesError) {
      console.error('Failed to fetch GitHub activities:', activitiesError)
      return NextResponse.json(
        { error: 'Failed to fetch GitHub activities' },
        { status: 500 }
      )
    }

    // GitHub 통합 정보 조회
    const { data: integration } = await supabase
      .from('github_integrations')
      .select('last_sync_at, github_username, total_repositories, total_commits')
      .eq('user_id', user_id)
      .eq('is_active', true)
      .single()

    // 저장소 정보 조회 (상위 10개) - 테이블이 없으면 빈 배열
    let repositories: Repository[] = []
    try {
      const { data: repoData } = await supabase
        .from('github_repositories')
        .select('name, language, size, stargazers_count, commits_count, updated_at')
        .eq('user_id', user_id)
        .order('updated_at', { ascending: false })
        .limit(10)
      
      repositories = repoData || []
    } catch {
      console.warn('GitHub repositories table not found, using empty array')
      repositories = []
    }

    return NextResponse.json({
      success: true,
      activities: activities || [],
      repositories: repositories,
      integration: integration,
      last_sync: integration?.last_sync_at,
      total_days: days,
      data_available: (activities?.length || 0) > 0
    })

  } catch (error) {
    console.error('GitHub activities API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
