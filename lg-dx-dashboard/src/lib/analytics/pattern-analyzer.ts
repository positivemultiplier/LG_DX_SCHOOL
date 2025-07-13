import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

export interface LearningPattern {
  id: string
  name: string
  description: string
  category: 'time' | 'subject' | 'condition' | 'productivity' | 'habit'
  strength: number // 0-1 범위
  frequency: number // 패턴 발생 빈도
  consistency: number // 패턴 일관성
  firstDetected: Date
  lastDetected: Date
  trend: 'increasing' | 'decreasing' | 'stable'
  metadata: Record<string, any>
}

export interface SchedulePattern {
  timeSlot: string
  dayOfWeek: number
  averageScore: number
  frequency: number
  consistency: number
}

export interface SubjectPattern {
  subjectId: number
  subjectName: string
  optimalTimePart: string
  averageScore: number
  improvementRate: number
  difficultyRating: number
}

export interface ProductivityPattern {
  date: string
  githubCommits: number
  reflectionScore: number
  productivity: number
  factors: string[]
}

export interface HabitPattern {
  habitType: string
  frequency: number
  impact: number
  consistency: number
  recommendation: string
}

export class PatternAnalyzer {
  private supabase = createClient()

  async analyzeAllPatterns(userId: string, timeRange = 30): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = []

    try {
      const timePatterns = await this.analyzeTimePatterns(userId, timeRange)
      const subjectPatterns = await this.analyzeSubjectPatterns(userId, timeRange)
      const productivityPatterns = await this.analyzeProductivityPatterns(userId, timeRange)
      const habitPatterns = await this.analyzeHabitPatterns(userId, timeRange)

      patterns.push(...timePatterns)
      patterns.push(...subjectPatterns)
      patterns.push(...productivityPatterns)
      patterns.push(...habitPatterns)

      return patterns.sort((a, b) => b.strength - a.strength)
    } catch (error) {
      console.error('Error analyzing patterns:', error)
      return []
    }
  }

  private async analyzeTimePatterns(userId: string, timeRange: number): Promise<LearningPattern[]> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - timeRange * 24 * 60 * 60 * 1000)

    const { data: reflections } = await this.supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', userId)
      .gte('reflection_date', startDate.toISOString().split('T')[0])
      .lte('reflection_date', endDate.toISOString().split('T')[0])

    if (!reflections || reflections.length === 0) return []

    const patterns: LearningPattern[] = []

    // 시간대별 성과 패턴 분석
    const timePartPerformance = new Map<string, number[]>()
    reflections.forEach(r => {
      if (!timePartPerformance.has(r.time_part)) {
        timePartPerformance.set(r.time_part, [])
      }
      timePartPerformance.get(r.time_part)!.push(r.overall_score || 0)
    })

    for (const [timePart, scores] of timePartPerformance.entries()) {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
      const frequency = scores.length / timeRange
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length
      const consistency = Math.max(0, 1 - Math.sqrt(variance) / 10)

      if (avgScore > 7 && frequency > 0.3) {
        patterns.push({
          id: `time-pattern-${timePart}`,
          name: `${timePart} 고성과 패턴`,
          description: `${timePart}에서 평균 ${avgScore.toFixed(1)}점의 높은 성과를 보입니다.`,
          category: 'time',
          strength: Math.min(1, (avgScore / 10) * frequency),
          frequency,
          consistency,
          firstDetected: new Date(startDate),
          lastDetected: new Date(endDate),
          trend: 'stable',
          metadata: {
            timePart,
            averageScore: avgScore,
            totalSessions: scores.length
          }
        })
      }
    }

    // 요일별 성과 패턴 분석
    const dayPerformance = new Map<number, number[]>()
    reflections.forEach(r => {
      const dayOfWeek = new Date(r.reflection_date).getDay()
      if (!dayPerformance.has(dayOfWeek)) {
        dayPerformance.set(dayOfWeek, [])
      }
      dayPerformance.get(dayOfWeek)!.push(r.overall_score || 0)
    })

    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    for (const [dayOfWeek, scores] of dayPerformance.entries()) {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
      const frequency = scores.length / Math.floor(timeRange / 7)

      if (avgScore > 7 && scores.length >= 3) {
        patterns.push({
          id: `day-pattern-${dayOfWeek}`,
          name: `${dayNames[dayOfWeek]} 최적 성과`,
          description: `${dayNames[dayOfWeek]}에 평균 ${avgScore.toFixed(1)}점의 높은 성과를 보입니다.`,
          category: 'time',
          strength: Math.min(1, avgScore / 10),
          frequency,
          consistency: 0.8,
          firstDetected: new Date(startDate),
          lastDetected: new Date(endDate),
          trend: 'stable',
          metadata: {
            dayOfWeek,
            dayName: dayNames[dayOfWeek],
            averageScore: avgScore
          }
        })
      }
    }

    return patterns
  }

  private async analyzeSubjectPatterns(userId: string, timeRange: number): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = []

    try {
      // 과목별 성과 데이터가 있다면 분석
      // 현재는 기본 구조만 제공
      return patterns
    } catch (error) {
      console.error('Error analyzing subject patterns:', error)
      return []
    }
  }

  private async analyzeProductivityPatterns(userId: string, timeRange: number): Promise<LearningPattern[]> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - timeRange * 24 * 60 * 60 * 1000)

    const { data: reflections } = await this.supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', userId)
      .gte('reflection_date', startDate.toISOString().split('T')[0])
      .lte('reflection_date', endDate.toISOString().split('T')[0])

    const { data: githubActivities } = await this.supabase
      .from('github_activities')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', startDate.toISOString().split('T')[0])
      .lte('activity_date', endDate.toISOString().split('T')[0])

    if (!reflections || !githubActivities) return []

    const patterns: LearningPattern[] = []

    // 일별 생산성 분석
    const dailyProductivity = new Map<string, ProductivityPattern>()
    
    reflections.forEach(r => {
      if (!dailyProductivity.has(r.reflection_date)) {
        dailyProductivity.set(r.reflection_date, {
          date: r.reflection_date,
          githubCommits: 0,
          reflectionScore: 0,
          productivity: 0,
          factors: []
        })
      }
      const data = dailyProductivity.get(r.reflection_date)!
      data.reflectionScore = Math.max(data.reflectionScore, r.overall_score || 0)
    })

    githubActivities.forEach(g => {
      if (!dailyProductivity.has(g.activity_date)) {
        dailyProductivity.set(g.activity_date, {
          date: g.activity_date,
          githubCommits: 0,
          reflectionScore: 0,
          productivity: 0,
          factors: []
        })
      }
      const data = dailyProductivity.get(g.activity_date)!
      data.githubCommits += g.commits_count || 0
    })

    // 생산성 점수 계산
    for (const [date, data] of dailyProductivity.entries()) {
      data.productivity = (data.reflectionScore * 0.7) + (Math.min(data.githubCommits / 5, 1) * 30)
    }

    // 고생산성 패턴 식별
    const highProductivityDays = Array.from(dailyProductivity.values())
      .filter(d => d.productivity > 70)
      .sort((a, b) => b.productivity - a.productivity)

    if (highProductivityDays.length >= 3) {
      const avgProductivity = highProductivityDays.reduce((sum, d) => sum + d.productivity, 0) / highProductivityDays.length
      
      patterns.push({
        id: 'high-productivity-pattern',
        name: '고생산성 패턴',
        description: `특정 조건에서 평균 ${avgProductivity.toFixed(0)}%의 높은 생산성을 보입니다.`,
        category: 'productivity',
        strength: Math.min(1, avgProductivity / 100),
        frequency: highProductivityDays.length / timeRange,
        consistency: 0.8,
        firstDetected: new Date(startDate),
        lastDetected: new Date(endDate),
        trend: 'stable',
        metadata: {
          averageProductivity: avgProductivity,
          highProductivityDays: highProductivityDays.length,
          factors: this.identifyProductivityFactors(highProductivityDays)
        }
      })
    }

    // GitHub 활동 패턴
    const totalCommits = githubActivities.reduce((sum, g) => sum + (g.commits_count || 0), 0)
    const avgCommitsPerDay = totalCommits / timeRange

    if (avgCommitsPerDay > 2) {
      patterns.push({
        id: 'consistent-github-activity',
        name: '일관된 GitHub 활동',
        description: `일평균 ${avgCommitsPerDay.toFixed(1)}회의 꾸준한 커밋을 유지하고 있습니다.`,
        category: 'habit',
        strength: Math.min(1, avgCommitsPerDay / 5),
        frequency: githubActivities.length / timeRange,
        consistency: 0.7,
        firstDetected: new Date(startDate),
        lastDetected: new Date(endDate),
        trend: 'stable',
        metadata: {
          avgCommitsPerDay,
          totalCommits,
          activeDays: githubActivities.length
        }
      })
    }

    return patterns
  }

  private async analyzeHabitPatterns(userId: string, timeRange: number): Promise<LearningPattern[]> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - timeRange * 24 * 60 * 60 * 1000)

    const { data: reflections } = await this.supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', userId)
      .gte('reflection_date', startDate.toISOString().split('T')[0])
      .lte('reflection_date', endDate.toISOString().split('T')[0])

    if (!reflections) return []

    const patterns: LearningPattern[] = []

    // 일관성 패턴 분석
    const consistentDays = reflections.length
    const consistency = consistentDays / timeRange

    if (consistency > 0.7) {
      patterns.push({
        id: 'consistent-reflection-habit',
        name: '꾸준한 리플렉션 습관',
        description: `${(consistency * 100).toFixed(0)}%의 높은 일관성으로 리플렉션을 작성하고 있습니다.`,
        category: 'habit',
        strength: consistency,
        frequency: consistency,
        consistency,
        firstDetected: new Date(startDate),
        lastDetected: new Date(endDate),
        trend: 'stable',
        metadata: {
          consistentDays,
          totalDays: timeRange,
          consistencyRate: consistency
        }
      })
    }

    // 컨디션 패턴 분석
    const conditionCounts = new Map<string, number>()
    reflections.forEach(r => {
      conditionCounts.set(r.condition, (conditionCounts.get(r.condition) || 0) + 1)
    })

    const dominantCondition = Array.from(conditionCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]

    if (dominantCondition && dominantCondition[1] / reflections.length > 0.6) {
      const [condition, count] = dominantCondition
      patterns.push({
        id: `condition-pattern-${condition}`,
        name: `${condition} 컨디션 패턴`,
        description: `대부분의 시간을 '${condition}' 컨디션으로 보내고 있습니다.`,
        category: 'condition',
        strength: count / reflections.length,
        frequency: count / timeRange,
        consistency: 0.9,
        firstDetected: new Date(startDate),
        lastDetected: new Date(endDate),
        trend: 'stable',
        metadata: {
          condition,
          frequency: count,
          percentage: (count / reflections.length) * 100
        }
      })
    }

    return patterns
  }

  private identifyProductivityFactors(highProductivityDays: ProductivityPattern[]): string[] {
    const factors: string[] = []

    const avgGithubCommits = highProductivityDays.reduce((sum, d) => sum + d.githubCommits, 0) / highProductivityDays.length
    const avgReflectionScore = highProductivityDays.reduce((sum, d) => sum + d.reflectionScore, 0) / highProductivityDays.length

    if (avgGithubCommits > 3) {
      factors.push('활발한 GitHub 활동')
    }
    if (avgReflectionScore > 8) {
      factors.push('높은 학습 만족도')
    }

    // 요일 패턴 분석
    const dayCount = new Map<number, number>()
    highProductivityDays.forEach(d => {
      const day = new Date(d.date).getDay()
      dayCount.set(day, (dayCount.get(day) || 0) + 1)
    })

    const dominantDay = Array.from(dayCount.entries())
      .sort((a, b) => b[1] - a[1])[0]

    if (dominantDay && dominantDay[1] / highProductivityDays.length > 0.4) {
      const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
      factors.push(`${dayNames[dominantDay[0]]} 집중`)
    }

    return factors
  }

  async getPatternsByCategory(userId: string, category: LearningPattern['category']): Promise<LearningPattern[]> {
    const allPatterns = await this.analyzeAllPatterns(userId)
    return allPatterns.filter(pattern => pattern.category === category)
  }

  async getStrongestPatterns(userId: string, limit = 5): Promise<LearningPattern[]> {
    const allPatterns = await this.analyzeAllPatterns(userId)
    return allPatterns
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit)
  }

  async getPatternTrends(userId: string, patternId: string): Promise<{ date: string; strength: number }[]> {
    // 패턴의 시간별 변화 추적
    // 현재는 기본 구조만 제공
    return []
  }

  // 패턴 기반 예측
  async predictOptimalSchedule(userId: string): Promise<SchedulePattern[]> {
    const timePatterns = await this.getPatternsByCategory(userId, 'time')
    const schedulePatterns: SchedulePattern[] = []

    // 시간대별 최적 스케줄 예측
    timePatterns.forEach(pattern => {
      if (pattern.metadata?.timePart) {
        schedulePatterns.push({
          timeSlot: pattern.metadata.timePart,
          dayOfWeek: pattern.metadata.dayOfWeek || 0,
          averageScore: pattern.metadata.averageScore || 0,
          frequency: pattern.frequency,
          consistency: pattern.consistency
        })
      }
    })

    return schedulePatterns.sort((a, b) => b.averageScore - a.averageScore)
  }

  async getPersonalizedRecommendations(userId: string): Promise<string[]> {
    const patterns = await this.analyzeAllPatterns(userId)
    const recommendations: string[] = []

    patterns.forEach(pattern => {
      switch (pattern.category) {
        case 'time':
          if (pattern.strength > 0.7) {
            recommendations.push(`${pattern.metadata?.timePart || '특정 시간대'}를 활용하여 중요한 학습을 진행하세요.`)
          }
          break
        case 'habit':
          if (pattern.strength > 0.8) {
            recommendations.push(`현재의 ${pattern.name.toLowerCase()} 습관을 계속 유지하세요.`)
          }
          break
        case 'productivity':
          if (pattern.metadata?.factors) {
            recommendations.push(`${pattern.metadata.factors.join(', ')} 조건에서 최고 성과를 냅니다.`)
          }
          break
      }
    })

    return recommendations.slice(0, 5)
  }
}

export const patternAnalyzer = new PatternAnalyzer()