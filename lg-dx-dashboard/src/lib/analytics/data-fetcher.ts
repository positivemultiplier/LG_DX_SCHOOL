import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

// 날짜 범위 기반 데이터 조회를 위한 타입 정의
export interface DateRange {
  start: Date
  end: Date
}

export interface ReflectionData {
  id: string
  reflection_date: string
  time_part: 'morning' | 'afternoon' | 'evening'
  overall_score: number
  condition_score: number
  achievements: string[]
  difficulties: string[]
  tomorrow_goals: string[]
  memo: string
  github_commits: number
  created_at: string
}

export interface GitHubActivityData {
  date: string
  commits: number
  activity_level: number
  repositories: string[]
  languages: string[]
}

export interface AnalyticsDataResponse {
  reflections: ReflectionData[]
  githubActivities: GitHubActivityData[]
  stats: {
    totalReflections: number
    avgScore: number
    avgCondition: number
    totalCommits: number
    activeDays: number
    consistency: number
  }
}

export class AnalyticsDataFetcher {
  private supabase = createClient()

  /**
   * 날짜 범위에 따른 리플렉션 데이터 조회
   */
  async getReflections(userId: string, dateRange: DateRange): Promise<ReflectionData[]> {
    const startDate = format(dateRange.start, 'yyyy-MM-dd')
    const endDate = format(dateRange.end, 'yyyy-MM-dd')

    const { data, error } = await this.supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', userId)
      .gte('reflection_date', startDate)
      .lte('reflection_date', endDate)
      .order('reflection_date', { ascending: false })

    if (error) {
      console.error('리플렉션 데이터 조회 오류:', error)
      return []
    }

    return data || []
  }

  /**
   * 날짜 범위에 따른 GitHub 활동 데이터 조회
   */
  async getGitHubActivities(userId: string, dateRange: DateRange): Promise<GitHubActivityData[]> {
    const startDate = format(dateRange.start, 'yyyy-MM-dd')
    const endDate = format(dateRange.end, 'yyyy-MM-dd')

    const { data, error } = await this.supabase
      .from('github_activity_records')
      .select(`
        activity_date,
        commits_count,
        activity_level,
        repository_name,
        primary_language
      `)
      .eq('user_id', userId)
      .gte('activity_date', startDate)
      .lte('activity_date', endDate)
      .order('activity_date', { ascending: false })

    if (error) {
      console.error('GitHub 활동 데이터 조회 오류:', error)
      return []
    }

    // 날짜별로 그룹화하여 집계
    const groupedData = this.groupGitHubDataByDate(data || [])
    return groupedData
  }

  /**
   * 날짜 범위에 따른 종합 통계 조회
   */
  async getAnalyticsData(userId: string, dateRange: DateRange): Promise<AnalyticsDataResponse> {
    const [reflections, githubActivities] = await Promise.all([
      this.getReflections(userId, dateRange),
      this.getGitHubActivities(userId, dateRange)
    ])

    const stats = this.calculateStats(reflections, githubActivities)

    return {
      reflections,
      githubActivities,
      stats
    }
  }

  /**
   * 시간대별 성과 데이터 조회
   */
  async getTimePartPerformance(userId: string, dateRange: DateRange) {
    const reflections = await this.getReflections(userId, dateRange)
    
    const timePartData = {
      morning: { scores: [], count: 0, average: 0 },
      afternoon: { scores: [], count: 0, average: 0 },
      evening: { scores: [], count: 0, average: 0 }
    }

    reflections.forEach(reflection => {
      const timePart = reflection.time_part
      if (timePartData[timePart]) {
        timePartData[timePart].scores.push(reflection.overall_score)
        timePartData[timePart].count++
      }
    })

    // 평균 계산
    Object.keys(timePartData).forEach(timePart => {
      const data = timePartData[timePart as keyof typeof timePartData]
      if (data.scores.length > 0) {
        data.average = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
      }
    })

    return timePartData
  }

  /**
   * 일별 트렌드 데이터 조회
   */
  async getDailyTrends(userId: string, dateRange: DateRange) {
    const reflections = await this.getReflections(userId, dateRange)
    const githubActivities = await this.getGitHubActivities(userId, dateRange)

    // 날짜별로 데이터 그룹화
    const dailyData = new Map()

    // 리플렉션 데이터 처리
    reflections.forEach(reflection => {
      const date = reflection.reflection_date
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          morningScore: 0,
          afternoonScore: 0,
          eveningScore: 0,
          avgScore: 0,
          commits: 0,
          reflectionCount: 0
        })
      }

      const dayData = dailyData.get(date)
      dayData[`${reflection.time_part}Score`] = reflection.overall_score
      dayData.reflectionCount++
    })

    // GitHub 데이터 처리
    githubActivities.forEach(activity => {
      const date = activity.date
      if (dailyData.has(date)) {
        dailyData.get(date).commits = activity.commits
      }
    })

    // 평균 점수 계산
    dailyData.forEach((dayData) => {
      const scores = [dayData.morningScore, dayData.afternoonScore, dayData.eveningScore].filter(score => score > 0)
      dayData.avgScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
    })

    return Array.from(dailyData.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  /**
   * GitHub 데이터 날짜별 그룹화
   */
  private groupGitHubDataByDate(rawData: any[]): GitHubActivityData[] {
    const grouped = new Map<string, GitHubActivityData>()

    rawData.forEach(record => {
      const date = record.activity_date
      
      if (!grouped.has(date)) {
        grouped.set(date, {
          date,
          commits: 0,
          activity_level: 0,
          repositories: [],
          languages: []
        })
      }

      const dayData = grouped.get(date)!
      dayData.commits += record.commits_count
      dayData.activity_level = Math.max(dayData.activity_level, record.activity_level)
      
      if (record.repository_name && !dayData.repositories.includes(record.repository_name)) {
        dayData.repositories.push(record.repository_name)
      }
      
      if (record.primary_language && !dayData.languages.includes(record.primary_language)) {
        dayData.languages.push(record.primary_language)
      }
    })

    return Array.from(grouped.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  /**
   * 통계 계산
   */
  private calculateStats(reflections: ReflectionData[], githubActivities: GitHubActivityData[]) {
    const totalReflections = reflections.length
    const avgScore = totalReflections > 0 
      ? reflections.reduce((sum, r) => sum + r.overall_score, 0) / totalReflections 
      : 0
    const avgCondition = totalReflections > 0 
      ? reflections.reduce((sum, r) => sum + r.condition_score, 0) / totalReflections 
      : 0
    const totalCommits = githubActivities.reduce((sum, g) => sum + g.commits, 0)
    const activeDays = new Set([
      ...reflections.map(r => r.reflection_date),
      ...githubActivities.filter(g => g.commits > 0).map(g => g.date)
    ]).size

    // 일관성 계산 (점수의 표준편차 기반)
    const scores = reflections.map(r => r.overall_score)
    const consistency = scores.length > 1 
      ? this.calculateConsistency(scores) 
      : 0

    return {
      totalReflections,
      avgScore: Math.round(avgScore * 10) / 10,
      avgCondition: Math.round(avgCondition * 10) / 10,
      totalCommits,
      activeDays,
      consistency: Math.round(consistency * 10) / 10
    }
  }

  /**
   * 일관성 지수 계산 (표준편차의 역수 기반)
   */
  private calculateConsistency(scores: number[]): number {
    if (scores.length < 2) return 0

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)
    
    // 일관성 = 10 - 표준편차 (최대 10점)
    return Math.max(0, 10 - standardDeviation)
  }
}

export const analyticsDataFetcher = new AnalyticsDataFetcher()