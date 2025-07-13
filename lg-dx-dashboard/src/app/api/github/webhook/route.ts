/**
 * GitHub 웹훅 API
 * GitHub에서 전송되는 실시간 이벤트를 수신하고 처리
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createHash, createHmac } from 'crypto'
import { 
  GitHubWebhookEvent, 
  GitHubPushEvent, 
  GitHubIssuesEvent, 
  GitHubPullRequestEvent,
  GitHubActivityRecord 
} from '@/lib/github/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-hub-signature-256')
    const eventType = request.headers.get('x-github-event')
    const deliveryId = request.headers.get('x-github-delivery')

    // 웹훅 서명 검증
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body) as GitHubWebhookEvent

    // 지원하는 이벤트 타입 확인
    if (!['push', 'issues', 'pull_request', 'create', 'delete'].includes(eventType || '')) {
      return NextResponse.json(
        { message: `Event type ${eventType} not supported` },
        { status: 200 }
      )
    }

    const supabase = createServerClient()

    // 저장소 정보로 사용자 찾기
    const { data: integration } = await supabase
      .from('github_integrations')
      .select('user_id, github_username')
      .eq('github_username', event.repository.owner?.login || event.sender.login)
      .eq('is_active', true)
      .single()

    if (!integration) {
      console.log(`No active integration found for ${event.repository.owner?.login || event.sender.login}`)
      return NextResponse.json(
        { message: 'No active integration found' },
        { status: 200 }
      )
    }

    // 이벤트 타입별 처리
    let activityRecord: GitHubActivityRecord | null = null

    switch (eventType) {
      case 'push':
        activityRecord = await handlePushEvent(event as GitHubPushEvent, integration.user_id)
        break
      case 'issues':
        activityRecord = await handleIssuesEvent(event as GitHubIssuesEvent, integration.user_id)
        break
      case 'pull_request':
        activityRecord = await handlePullRequestEvent(event as GitHubPullRequestEvent, integration.user_id)
        break
      case 'create':
      case 'delete':
        activityRecord = await handleRepositoryEvent(event, integration.user_id, eventType)
        break
    }

    // 활동 기록 저장
    if (activityRecord) {
      await saveActivityRecord(supabase, activityRecord)
      
      // 일별 활동 집계 업데이트
      await updateDailyActivity(supabase, activityRecord)
    }

    // 웹훅 로그 저장
    await supabase
      .from('github_webhook_logs')
      .insert({
        delivery_id: deliveryId,
        event_type: eventType,
        repository_name: event.repository.full_name,
        sender: event.sender.login,
        processed_at: new Date().toISOString(),
        success: true
      })

    return NextResponse.json({
      message: 'Webhook processed successfully',
      event_type: eventType,
      repository: event.repository.full_name
    })

  } catch (error) {
    console.error('Webhook processing error:', error)

    // 실패 로그 저장
    try {
      const supabase = createServerClient()
      await supabase
        .from('github_webhook_logs')
        .insert({
          delivery_id: request.headers.get('x-github-delivery'),
          event_type: request.headers.get('x-github-event'),
          processed_at: new Date().toISOString(),
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
    } catch (logError) {
      console.error('Failed to log webhook error:', logError)
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// 웹훅 서명 검증
function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.GITHUB_WEBHOOK_SECRET) {
    return false
  }

  const expectedSignature = createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')
  
  const receivedSignature = signature.replace('sha256=', '')
  
  return createHash('sha256')
    .update(expectedSignature)
    .digest('hex') === createHash('sha256')
    .update(receivedSignature)
    .digest('hex')
}

// Push 이벤트 처리
async function handlePushEvent(event: GitHubPushEvent, userId: string): Promise<GitHubActivityRecord | null> {
  if (!event.commits || event.commits.length === 0) {
    return null
  }

  const date = new Date().toISOString().split('T')[0]
  const commits = event.commits.filter(commit => commit.distinct)

  if (commits.length === 0) {
    return null
  }

  return {
    id: `${userId}_${event.repository.name}_${event.after}`,
    user_id: userId,
    date,
    repository_name: event.repository.name,
    commit_sha: event.after,
    commit_message: event.head_commit?.message || commits[0].message,
    commits_count: commits.length,
    additions: 0, // 웹훅에서는 상세 stats 없음
    deletions: 0,
    files_changed: 0,
    languages: [], // 별도 API 호출로 가져와야 함
    event_type: 'push',
    created_at: new Date().toISOString()
  }
}

// Issues 이벤트 처리
async function handleIssuesEvent(event: GitHubIssuesEvent, userId: string): Promise<GitHubActivityRecord | null> {
  if (!['opened', 'closed'].includes(event.action)) {
    return null
  }

  const date = new Date().toISOString().split('T')[0]

  return {
    id: `${userId}_${event.repository.name}_issue_${event.issue.id}_${event.action}`,
    user_id: userId,
    date,
    repository_name: event.repository.name,
    commit_sha: undefined,
    commit_message: `${event.action} issue: ${event.issue.title}`,
    commits_count: 0,
    additions: 0,
    deletions: 0,
    files_changed: 0,
    languages: [],
    event_type: 'issues',
    created_at: new Date().toISOString()
  }
}

// Pull Request 이벤트 처리
async function handlePullRequestEvent(event: GitHubPullRequestEvent, userId: string): Promise<GitHubActivityRecord | null> {
  if (!['opened', 'closed'].includes(event.action)) {
    return null
  }

  const date = new Date().toISOString().split('T')[0]

  return {
    id: `${userId}_${event.repository.name}_pr_${event.pull_request.id}_${event.action}`,
    user_id: userId,
    date,
    repository_name: event.repository.name,
    commit_sha: event.pull_request.head.sha,
    commit_message: `${event.action} PR: ${event.pull_request.title}`,
    commits_count: 0,
    additions: 0,
    deletions: 0,
    files_changed: 0,
    languages: [],
    event_type: 'pull_request',
    created_at: new Date().toISOString()
  }
}

// 저장소 생성/삭제 이벤트 처리
async function handleRepositoryEvent(event: GitHubWebhookEvent, userId: string, eventType: string): Promise<GitHubActivityRecord | null> {
  const date = new Date().toISOString().split('T')[0]

  return {
    id: `${userId}_${event.repository.name}_${eventType}_${Date.now()}`,
    user_id: userId,
    date,
    repository_name: event.repository.name,
    commit_sha: undefined,
    commit_message: `${eventType} repository: ${event.repository.name}`,
    commits_count: 0,
    additions: 0,
    deletions: 0,
    files_changed: 0,
    languages: [],
    event_type: eventType as any,
    created_at: new Date().toISOString()
  }
}

// 활동 기록 저장
async function saveActivityRecord(supabase: any, record: GitHubActivityRecord) {
  const { error } = await supabase
    .from('github_activity_records')
    .upsert(record, {
      onConflict: 'id'
    })

  if (error) {
    console.error('Failed to save activity record:', error)
    throw error
  }
}

// 일별 활동 집계 업데이트
async function updateDailyActivity(supabase: any, record: GitHubActivityRecord) {
  // 해당 날짜의 기존 집계 데이터 조회
  const { data: existingActivity } = await supabase
    .from('github_activities')
    .select('*')
    .eq('user_id', record.user_id)
    .eq('date', record.date)
    .single()

  if (existingActivity) {
    // 기존 데이터 업데이트
    const updatedRepositories = [...new Set([
      ...existingActivity.repositories,
      record.repository_name
    ])]

    const updatedLanguages = [...new Set([
      ...existingActivity.languages,
      ...record.languages
    ])]

    const newCommitsCount = existingActivity.commits_count + record.commits_count
    const newActivityLevel = calculateActivityLevel(newCommitsCount)

    await supabase
      .from('github_activities')
      .update({
        commits_count: newCommitsCount,
        repositories_count: updatedRepositories.length,
        repositories: updatedRepositories,
        languages: updatedLanguages,
        additions: existingActivity.additions + record.additions,
        deletions: existingActivity.deletions + record.deletions,
        files_changed: existingActivity.files_changed + record.files_changed,
        activity_level: newActivityLevel
      })
      .eq('user_id', record.user_id)
      .eq('date', record.date)

  } else {
    // 새 집계 데이터 생성
    await supabase
      .from('github_activities')
      .insert({
        user_id: record.user_id,
        date: record.date,
        commits_count: record.commits_count,
        repositories_count: 1,
        repositories: [record.repository_name],
        languages: record.languages,
        additions: record.additions,
        deletions: record.deletions,
        files_changed: record.files_changed,
        activity_level: calculateActivityLevel(record.commits_count),
        created_at: new Date().toISOString()
      })
  }
}

// 활동 레벨 계산
function calculateActivityLevel(commits: number): 0 | 1 | 2 | 3 | 4 {
  if (commits === 0) return 0
  if (commits <= 2) return 1
  if (commits <= 5) return 2
  if (commits <= 10) return 3
  return 4
}