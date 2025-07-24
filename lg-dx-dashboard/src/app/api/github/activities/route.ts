/**
 * Phase 3: Enhanced GitHub Activities API
 * GitHub 활동 데이터 조회 및 고급 분석 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GitHub Activity 데이터 타입 정의 (기존 호환성 유지)
interface GitHubActivity {
  id: string
  user_id: string
  date: string
  commits_count: number
  repositories: string[] // 기존 호환성
  repositories_count: number
  languages: string[] // 기존 호환성
  languages_used?: string[] // 새로운 필드
  activity_level: number
  pull_requests?: number
  issues?: number
  reviews?: number
  additions?: number
  deletions?: number
  files_changed?: number
}

interface HeatmapData {
  date: string
  count: number
  level: number
  repositories: string[]
  languages: string[]
  additions: number
  deletions: number
}

interface ChartData {
  date: string
  commits: number
  repositories: number
  additions: number
  deletions: number
  files_changed: number
  languages: number
}

interface BasicStats {
  total_commits: number
  total_repositories: number
  active_days: number
  longest_streak: number
  current_streak: number
  average_commits_per_day: number
}

interface WeekdayAnalysis {
  weekday: string
  commits: number
  active_days: number
  average: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const period = searchParams.get('period') || '84' // 기본 84일
    const format = searchParams.get('format') || 'heatmap' // heatmap, chart, stats

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // 기간 계산
    const periodDays = parseInt(period)
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - periodDays + 1)

    // GitHub 활동 데이터 조회
    const { data: activities, error } = await supabase
      .from('github_activities')
      .select('*')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq('user_id', user_id as any)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) {
      throw error
    }

    // 데이터 포맷팅
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typedActivities = (activities || []) as any[] // Supabase 타입 충돌 해결을 위한 임시 타입 캐스팅
    
    switch (format) {
      case 'heatmap':
        return NextResponse.json({
          data: formatForHeatmap(typedActivities, periodDays, startDate),
          stats: calculateStats(typedActivities)
        })

      case 'chart':
        return NextResponse.json({
          data: formatForChart(typedActivities),
          stats: calculateStats(typedActivities)
        })

      case 'stats':
        return NextResponse.json({
          stats: calculateDetailedStats(typedActivities, periodDays)
        })

      default:
        return NextResponse.json({
          data: activities || [],
          stats: calculateStats(typedActivities)
        })
    }

  } catch (error) {
    console.error('Get GitHub activities error:', error)
    return NextResponse.json(
      { error: 'Failed to get GitHub activities' },
      { status: 500 }
    )
  }
}

// 히트맵용 데이터 포맷팅
function formatForHeatmap(activities: GitHubActivity[], periodDays: number, startDate: Date): HeatmapData[] {
  const activityMap = new Map<string, GitHubActivity>()
  
  // 활동 데이터를 맵으로 변환
  activities.forEach(activity => {
    activityMap.set(activity.date, activity)
  })

  // 전체 기간에 대해 데이터 생성 (없는 날짜는 0으로 채움)
  const heatmapData: HeatmapData[] = []
  for (let i = 0; i < periodDays; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    const dateStr = currentDate.toISOString().split('T')[0]
    
    const activity = activityMap.get(dateStr)
    heatmapData.push({
      date: dateStr,
      count: activity?.commits_count || 0,
      level: activity?.activity_level || 0,
      repositories: activity?.repositories || [],
      languages: activity?.languages || [],
      additions: activity?.additions || 0,
      deletions: activity?.deletions || 0
    })
  }

  return heatmapData
}

// 차트용 데이터 포맷팅
function formatForChart(activities: GitHubActivity[]): ChartData[] {
  return activities.map(activity => ({
    date: activity.date,
    commits: activity.commits_count,
    repositories: activity.repositories_count,
    additions: activity.additions || 0,
    deletions: activity.deletions || 0,
    files_changed: activity.files_changed || 0,
    languages: activity.languages.length
  }))
}

// 기본 통계 계산
function calculateStats(activities: GitHubActivity[]): BasicStats {
  if (activities.length === 0) {
    return {
      total_commits: 0,
      total_repositories: 0,
      active_days: 0,
      longest_streak: 0,
      current_streak: 0,
      average_commits_per_day: 0
    }
  }

  const totalCommits = activities.reduce((sum, activity) => sum + activity.commits_count, 0)
  const allRepositories = new Set()
  activities.forEach(activity => {
    activity.repositories.forEach((repo: string) => allRepositories.add(repo))
  })

  const activeDays = activities.filter(activity => activity.commits_count > 0).length
  const streaks = calculateStreaks(activities)

  return {
    total_commits: totalCommits,
    total_repositories: allRepositories.size,
    active_days: activeDays,
    longest_streak: streaks.longest,
    current_streak: streaks.current,
    average_commits_per_day: Math.round((totalCommits / activities.length) * 10) / 10
  }
}

// 상세 통계 계산
function calculateDetailedStats(activities: GitHubActivity[], periodDays: number) {
  const basicStats = calculateStats(activities)
  
  // 언어별 통계
  const languageStats = new Map<string, { commits: number, days: number }>()
  activities.forEach(activity => {
    activity.languages.forEach((language: string) => {
      const existing = languageStats.get(language) || { commits: 0, days: 0 }
      existing.commits += activity.commits_count
      existing.days += 1
      languageStats.set(language, existing)
    })
  })

  const favoriteLanguages = Array.from(languageStats.entries())
    .map(([language, stats]) => ({
      language,
      commits: stats.commits,
      days: stats.days,
      percentage: Math.round((stats.commits / basicStats.total_commits) * 100)
    }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 5)

  // 요일별 통계
  const weekdayStats = Array(7).fill(0).map(() => ({ commits: 0, days: 0 }))
  activities.forEach(activity => {
    const weekday = new Date(activity.date).getDay()
    weekdayStats[weekday].commits += activity.commits_count
    weekdayStats[weekday].days += activity.commits_count > 0 ? 1 : 0
  })

  const weekdayNames = ['일', '월', '화', '수', '목', '금', '토']
  const weekdayAnalysis = weekdayStats.map((stats, index) => ({
    weekday: weekdayNames[index],
    commits: stats.commits,
    active_days: stats.days,
    average: stats.days > 0 ? Math.round((stats.commits / stats.days) * 10) / 10 : 0
  }))

  // 월별 통계 (최근 활동 데이터 기준)
  const monthlyStats = new Map<string, { commits: number, repositories: Set<string>, languages: Set<string> }>()
  activities.forEach(activity => {
    const month = activity.date.substring(0, 7) // YYYY-MM
    const existing = monthlyStats.get(month) || { 
      commits: 0, 
      repositories: new Set(), 
      languages: new Set() 
    }
    existing.commits += activity.commits_count
    activity.repositories.forEach((repo: string) => existing.repositories.add(repo))
    activity.languages.forEach((lang: string) => existing.languages.add(lang))
    monthlyStats.set(month, existing)
  })

  const monthlyAnalysis = Array.from(monthlyStats.entries())
    .map(([month, stats]) => ({
      month,
      commits: stats.commits,
      repositories: stats.repositories.size,
      languages: Array.from(stats.languages)
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // 생산성 지표
  const productivity = {
    commits_per_active_day: basicStats.active_days > 0 ? 
      Math.round((basicStats.total_commits / basicStats.active_days) * 10) / 10 : 0,
    activity_rate: Math.round((basicStats.active_days / periodDays) * 100),
    consistency_score: calculateConsistencyScore(activities),
    peak_activity_day: findPeakActivityDay(weekdayAnalysis)
  }

  return {
    ...basicStats,
    favorite_languages: favoriteLanguages,
    weekday_analysis: weekdayAnalysis,
    monthly_analysis: monthlyAnalysis,
    productivity
  }
}

// 연속 기록 계산
function calculateStreaks(activities: GitHubActivity[]) {
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // 활동이 있는 날짜들을 정렬
  const activeDates = activities
    .filter(activity => activity.commits_count > 0)
    .map(activity => new Date(activity.date))
    .sort((a, b) => a.getTime() - b.getTime())

  if (activeDates.length === 0) {
    return { current: 0, longest: 0 }
  }

  // 연속 기록 계산
  for (let i = 0; i < activeDates.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const diffDays = Math.floor(
        (activeDates[i].getTime() - activeDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (diffDays === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak)

  // 현재 연속 기록 계산 (오늘부터 거꾸로)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = activeDates.length - 1; i >= 0; i--) {
    const diffDays = Math.floor(
      (today.getTime() - activeDates[i].getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (diffDays === currentStreak) {
      currentStreak++
    } else {
      break
    }
  }

  return { current: currentStreak, longest: longestStreak }
}

// 일관성 점수 계산
function calculateConsistencyScore(activities: GitHubActivity[]): number {
  if (activities.length === 0) return 0

  const commitCounts = activities.map(activity => activity.commits_count)
  const average = commitCounts.reduce((sum, count) => sum + count, 0) / commitCounts.length
  
  if (average === 0) return 0

  const variance = commitCounts.reduce((sum, count) => {
    return sum + Math.pow(count - average, 2)
  }, 0) / commitCounts.length

  const standardDeviation = Math.sqrt(variance)
  const coefficientOfVariation = standardDeviation / average

  // 일관성 점수 (0-100, 낮은 변동성일수록 높은 점수)
  return Math.max(0, Math.min(100, Math.round((1 - coefficientOfVariation) * 100)))
}

// 최고 활동 요일 찾기
function findPeakActivityDay(weekdayAnalysis: WeekdayAnalysis[]): string {
  return weekdayAnalysis.reduce((peak, current) => 
    current.commits > peak.commits ? current : peak
  ).weekday
}