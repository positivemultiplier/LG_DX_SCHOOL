/**
 * GitHub 실시간 활동 모니터링 API
 * 웹훅을 통한 실시간 활동 추적 및 분석
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { Octokit } from '@octokit/rest'

interface GitHubWebhookPayload {
  action: string
  repository: {
    name: string
    full_name: string
    language: string
    private: boolean
  }
  sender: {
    login: string
    id: number
  }
  commits?: Array<{
    id: string
    message: string
    author: {
      name: string
      email: string
    }
    added: string[]
    removed: string[]
    modified: string[]
  }>
  pull_request?: {
    number: number
    title: string
    state: string
    additions: number
    deletions: number
    changed_files: number
  }
  issue?: {
    number: number
    title: string
    state: string
  }
}

interface RealTimeActivity {
  user_id: string
  activity_type: 'push' | 'pull_request' | 'issue' | 'release' | 'fork' | 'star'
  repository: string
  timestamp: string
  metadata: any
  impact_score: number
  quality_indicators: QualityIndicators
}

interface QualityIndicators {
  commit_message_quality: number
  code_change_size: 'small' | 'medium' | 'large'
  test_coverage_change: number
  documentation_updated: boolean
  breaking_changes: boolean
}

interface ActivityMetrics {
  velocity: number
  quality_trend: number
  collaboration_index: number
  innovation_score: number
  consistency_rating: number
}

export async function POST(request: NextRequest) {
  try {
    const payload: GitHubWebhookPayload = await request.json()
    const signature = request.headers.get('x-hub-signature-256')
    
    // 웹훅 서명 검증 (보안)
    if (!verifyWebhookSignature(await request.text(), signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const supabase = await createServerClient()
    
    // 사용자 ID 매핑 (GitHub 사용자 -> 앱 사용자)
    const user_id = await mapGitHubUserToAppUser(supabase, payload.sender.login)
    if (!user_id) {
      return NextResponse.json({ error: 'User not mapped' }, { status: 404 })
    }

    // 활동 데이터 처리
    const activity = await processWebhookActivity(payload, user_id)
    
    // 실시간 활동 저장
    const { error: insertError } = await supabase
      .from('github_realtime_activities')
      .insert(activity)

    if (insertError) {
      throw insertError
    }

    // 실시간 메트릭스 업데이트
    await updateRealTimeMetrics(supabase, user_id, activity)

    // 알림 처리 (중요한 활동의 경우)
    if (activity.impact_score >= 80) {
      await sendHighImpactNotification(supabase, user_id, activity)
    }

    return NextResponse.json({
      success: true,
      activity_processed: true,
      impact_score: activity.impact_score
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const activity_type = searchParams.get('type')

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // 실시간 활동 조회
    let query = supabase
      .from('github_realtime_activities')
      .select('*')
      .eq('user_id', user_id)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (activity_type) {
      query = query.eq('activity_type', activity_type)
    }

    const { data: activities, error } = await query

    if (error) {
      throw error
    }

    // 실시간 메트릭스 조회
    const { data: metrics } = await supabase
      .from('github_realtime_metrics')
      .select('*')
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      activities: activities || [],
      current_metrics: metrics || null,
      total_count: activities?.length || 0
    })

  } catch (error) {
    console.error('Get real-time activities error:', error)
    return NextResponse.json(
      { error: 'Failed to get real-time activities' },
      { status: 500 }
    )
  }
}

// 웹훅 서명 검증
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature) return false
  
  // 실제 구현에서는 GitHub 웹훅 시크릿을 사용하여 HMAC-SHA256 검증
  // const expectedSignature = crypto
  //   .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
  //   .update(payload)
  //   .digest('hex')
  
  // return signature === `sha256=${expectedSignature}`
  
  // 개발용 임시 검증
  return true
}

// GitHub 사용자를 앱 사용자로 매핑
async function mapGitHubUserToAppUser(supabase: any, githubUsername: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('user_github_mappings')
      .select('user_id')
      .eq('github_username', githubUsername)
      .single()
    
    return data?.user_id || null
  } catch {
    return null
  }
}

// 웹훅 활동 처리
async function processWebhookActivity(
  payload: GitHubWebhookPayload, 
  user_id: string
): Promise<RealTimeActivity> {
  const timestamp = new Date().toISOString()
  const repository = payload.repository.full_name

  let activity_type: RealTimeActivity['activity_type'] = 'push'
  let metadata: any = {}
  let impact_score = 0
  let quality_indicators: QualityIndicators = {
    commit_message_quality: 0,
    code_change_size: 'small',
    test_coverage_change: 0,
    documentation_updated: false,
    breaking_changes: false
  }

  // 활동 타입별 처리
  switch (payload.action) {
    case 'opened':
    case 'closed':
    case 'merged':
      if (payload.pull_request) {
        activity_type = 'pull_request'
        metadata = {
          pr_number: payload.pull_request.number,
          title: payload.pull_request.title,
          state: payload.pull_request.state,
          additions: payload.pull_request.additions,
          deletions: payload.pull_request.deletions,
          changed_files: payload.pull_request.changed_files
        }
        
        // PR 임팩트 점수 계산
        impact_score = calculatePRImpactScore(payload.pull_request)
        quality_indicators = analyzePRQuality(payload.pull_request)
      } else if (payload.issue) {
        activity_type = 'issue'
        metadata = {
          issue_number: payload.issue.number,
          title: payload.issue.title,
          state: payload.issue.state
        }
        impact_score = calculateIssueImpactScore(payload.issue)
      }
      break

    default:
      if (payload.commits) {
        activity_type = 'push'
        metadata = {
          commits_count: payload.commits.length,
          commits: payload.commits.map(commit => ({
            id: commit.id.substring(0, 7),
            message: commit.message,
            files_changed: commit.added.length + commit.removed.length + commit.modified.length
          }))
        }
        
        impact_score = calculateCommitImpactScore(payload.commits)
        quality_indicators = analyzeCommitQuality(payload.commits)
      }
      break
  }

  return {
    user_id,
    activity_type,
    repository,
    timestamp,
    metadata,
    impact_score,
    quality_indicators
  }
}

// PR 임팩트 점수 계산
function calculatePRImpactScore(pr: any): number {
  let score = 0
  
  // 코드 변경량 기반 점수 (0-40점)
  const totalChanges = pr.additions + pr.deletions
  if (totalChanges > 1000) score += 40
  else if (totalChanges > 500) score += 30
  else if (totalChanges > 100) score += 20
  else score += 10

  // 파일 변경 수 기반 점수 (0-30점)
  if (pr.changed_files > 20) score += 30
  else if (pr.changed_files > 10) score += 20
  else if (pr.changed_files > 5) score += 15
  else score += 10

  // PR 상태 기반 점수 (0-30점)
  if (pr.state === 'merged') score += 30
  else if (pr.state === 'closed') score += 10
  else score += 20 // opened

  return Math.min(score, 100)
}

// 커밋 임팩트 점수 계산
function calculateCommitImpactScore(commits: any[]): number {
  let score = 0
  
  // 커밋 수 기반 점수
  score += Math.min(commits.length * 10, 40)
  
  // 파일 변경 총합 기반 점수
  const totalFilesChanged = commits.reduce((sum, commit) => 
    sum + commit.added.length + commit.removed.length + commit.modified.length, 0
  )
  score += Math.min(totalFilesChanged * 2, 40)
  
  // 커밋 메시지 품질 기반 점수
  const qualityScore = commits.reduce((sum, commit) => 
    sum + analyzeCommitMessageQuality(commit.message), 0
  ) / commits.length
  score += qualityScore * 0.2

  return Math.min(score, 100)
}

// 이슈 임팩트 점수 계산
function calculateIssueImpactScore(issue: any): number {
  let score = 30 // 기본 점수

  // 이슈 상태 기반
  if (issue.state === 'closed') score += 20
  else score += 10

  // 제목 길이 기반 (상세할수록 높은 점수)
  if (issue.title.length > 50) score += 20
  else if (issue.title.length > 20) score += 10
  else score += 5

  return Math.min(score, 100)
}

// PR 품질 분석
function analyzePRQuality(pr: any): QualityIndicators {
  return {
    commit_message_quality: 75, // 실제로는 PR 설명 분석
    code_change_size: pr.additions + pr.deletions > 500 ? 'large' : 
                     pr.additions + pr.deletions > 100 ? 'medium' : 'small',
    test_coverage_change: 0, // 실제로는 테스트 파일 변경 분석
    documentation_updated: pr.title.toLowerCase().includes('doc') || 
                          pr.title.toLowerCase().includes('readme'),
    breaking_changes: pr.title.toLowerCase().includes('break') ||
                     pr.title.toLowerCase().includes('major')
  }
}

// 커밋 품질 분석
function analyzeCommitQuality(commits: any[]): QualityIndicators {
  const avgMessageQuality = commits.reduce((sum, commit) => 
    sum + analyzeCommitMessageQuality(commit.message), 0
  ) / commits.length

  const totalChanges = commits.reduce((sum, commit) => 
    sum + commit.added.length + commit.removed.length + commit.modified.length, 0
  )

  const hasDocChanges = commits.some(commit => 
    [...commit.added, ...commit.modified].some(file => 
      file.toLowerCase().includes('readme') || 
      file.toLowerCase().includes('.md') ||
      file.toLowerCase().includes('doc')
    )
  )

  return {
    commit_message_quality: avgMessageQuality,
    code_change_size: totalChanges > 20 ? 'large' : totalChanges > 5 ? 'medium' : 'small',
    test_coverage_change: 0,
    documentation_updated: hasDocChanges,
    breaking_changes: false
  }
}

// 커밋 메시지 품질 분석
function analyzeCommitMessageQuality(message: string): number {
  let score = 0

  // 길이 체크 (10-80점)
  if (message.length >= 10 && message.length <= 72) score += 40
  else if (message.length >= 5) score += 20

  // 대문자로 시작하는지 체크 (10점)
  if (message.charAt(0) === message.charAt(0).toUpperCase()) score += 10

  // 마침표로 끝나지 않는지 체크 (10점)
  if (!message.endsWith('.')) score += 10

  // 키워드 체크 (20점)
  const goodKeywords = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore']
  if (goodKeywords.some(keyword => message.toLowerCase().includes(keyword))) score += 20

  // 설명적인지 체크 (20점)
  if (message.includes(' ') && message.split(' ').length >= 3) score += 20

  return Math.min(score, 100)
}

// 실시간 메트릭스 업데이트
async function updateRealTimeMetrics(
  supabase: any, 
  user_id: string, 
  activity: RealTimeActivity
) {
  try {
    // 현재 메트릭스 조회
    const { data: currentMetrics } = await supabase
      .from('github_realtime_metrics')
      .select('*')
      .eq('user_id', user_id)
      .single()

    const updatedMetrics = calculateUpdatedMetrics(currentMetrics, activity)

    // 메트릭스 업데이트 또는 생성
    const { error } = await supabase
      .from('github_realtime_metrics')
      .upsert({
        user_id,
        ...updatedMetrics,
        updated_at: new Date().toISOString()
      })

    if (error) {
      throw error
    }

  } catch (error) {
    console.error('Failed to update real-time metrics:', error)
  }
}

// 업데이트된 메트릭스 계산
function calculateUpdatedMetrics(currentMetrics: any, activity: RealTimeActivity): ActivityMetrics {
  const current = currentMetrics || {
    velocity: 0,
    quality_trend: 0,
    collaboration_index: 0,
    innovation_score: 0,
    consistency_rating: 0
  }

  // 속도 지표 업데이트 (최근 활동 빈도 기반)
  const velocity = Math.min(current.velocity * 0.9 + activity.impact_score * 0.1, 100)

  // 품질 트렌드 업데이트 (품질 지표 기반)
  const qualityScore = activity.quality_indicators.commit_message_quality
  const quality_trend = Math.min(current.quality_trend * 0.8 + qualityScore * 0.2, 100)

  // 협업 지수 업데이트 (PR, 이슈 활동 기반)
  const collaborationBonus = ['pull_request', 'issue'].includes(activity.activity_type) ? 10 : 0
  const collaboration_index = Math.min(current.collaboration_index * 0.9 + collaborationBonus, 100)

  // 혁신 점수 업데이트 (새로운 저장소, 기술 사용 기반)
  const innovation_score = Math.min(current.innovation_score * 0.95 + (activity.impact_score > 70 ? 5 : 0), 100)

  // 일관성 등급 업데이트
  const consistency_rating = Math.min(current.consistency_rating * 0.9 + 10, 100)

  return {
    velocity,
    quality_trend,
    collaboration_index,
    innovation_score,
    consistency_rating
  }
}

// 높은 임팩트 활동 알림
async function sendHighImpactNotification(
  supabase: any, 
  user_id: string, 
  activity: RealTimeActivity
) {
  try {
    const notificationData = {
      user_id,
      type: 'high_impact_activity',
      title: `높은 임팩트 활동 감지 (${activity.impact_score}점)`,
      message: `${activity.repository}에서 ${activity.activity_type} 활동이 감지되었습니다.`,
      metadata: {
        activity_type: activity.activity_type,
        repository: activity.repository,
        impact_score: activity.impact_score,
        timestamp: activity.timestamp
      },
      created_at: new Date().toISOString()
    }

    await supabase
      .from('user_notifications')
      .insert(notificationData)

  } catch (error) {
    console.error('Failed to send high impact notification:', error)
  }
}
