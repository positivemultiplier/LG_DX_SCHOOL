import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

export interface AnalyticsInsight {
  id: string
  type: 'performance' | 'pattern' | 'recommendation' | 'prediction' | 'warning'
  title: string
  description: string
  value?: number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  priority: 'high' | 'medium' | 'low'
  confidence: number
  actionable: boolean
  metadata?: Record<string, any>
  generatedAt: Date
}

export interface LearningMetrics {
  totalReflections: number
  averageScore: number
  averageCondition: number
  consistencyScore: number
  improvementRate: number
  githubActivity: number
  productivityScore: number
}

export interface TimePartPerformance {
  timePart: '오전수업' | '오후수업' | '저녁자율학습'
  averageScore: number
  consistencyScore: number
  activityCount: number
  improvementTrend: number
  optimalDays: string[]
}

export interface LearningPattern {
  id: string
  name: string
  description: string
  strength: number
  frequency: number
  lastOccurrence: Date
  metadata: Record<string, any>
}

export class InsightsEngine {
  private supabase = createClient()

  async generateInsights(userId: string, timeRange = 30): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = []

    try {
      const metrics = await this.calculateLearningMetrics(userId, timeRange)
      const timePartPerformance = await this.analyzeTimePartPerformance(userId, timeRange)
      const patterns = await this.identifyLearningPatterns(userId, timeRange)

      // 성과 분석 인사이트
      insights.push(...this.generatePerformanceInsights(metrics, timePartPerformance))

      // 패턴 분석 인사이트
      insights.push(...this.generatePatternInsights(patterns))

      // 추천 시스템 인사이트
      insights.push(...this.generateRecommendations(metrics, timePartPerformance, patterns))

      // 예측 인사이트
      insights.push(...this.generatePredictiveInsights(metrics, timePartPerformance))

      // 경고 및 주의사항
      insights.push(...this.generateWarningInsights(metrics, timePartPerformance))

      return insights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
    } catch (error) {
      console.error('Error generating insights:', error)
      return []
    }
  }

  private async calculateLearningMetrics(userId: string, timeRange: number): Promise<LearningMetrics> {
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

    if (!reflections) {
      return {
        totalReflections: 0,
        averageScore: 0,
        averageCondition: 0,
        consistencyScore: 0,
        improvementRate: 0,
        githubActivity: 0,
        productivityScore: 0
      }
    }

    const totalReflections = reflections.length
    const averageScore = reflections.reduce((sum, r) => sum + (r.overall_score || 0), 0) / Math.max(totalReflections, 1)
    
    const conditionMapping = { '최고': 5, '좋음': 4, '보통': 3, '피곤': 2, '매우피곤': 1 }
    const averageCondition = reflections.reduce((sum, r) => {
      return sum + (conditionMapping[r.condition as keyof typeof conditionMapping] || 3)
    }, 0) / Math.max(totalReflections, 1)

    // 일관성 점수 계산 (표준편차 기반)
    const scores = reflections.map(r => r.overall_score || 0)
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / Math.max(scores.length, 1)
    const consistencyScore = Math.max(0, 100 - Math.sqrt(variance) * 10)

    // 개선률 계산 (첫 주 vs 마지막 주)
    const firstWeekReflections = reflections.slice(0, Math.min(7, reflections.length))
    const lastWeekReflections = reflections.slice(-7)
    const firstWeekAvg = firstWeekReflections.reduce((sum, r) => sum + (r.overall_score || 0), 0) / Math.max(firstWeekReflections.length, 1)
    const lastWeekAvg = lastWeekReflections.reduce((sum, r) => sum + (r.overall_score || 0), 0) / Math.max(lastWeekReflections.length, 1)
    const improvementRate = ((lastWeekAvg - firstWeekAvg) / Math.max(firstWeekAvg, 1)) * 100

    const githubActivity = githubActivities?.reduce((sum, a) => sum + (a.commits_count || 0), 0) || 0
    const productivityScore = Math.min(100, (averageScore * 0.6 + consistencyScore * 0.2 + Math.min(githubActivity / 10, 1) * 20))

    return {
      totalReflections,
      averageScore,
      averageCondition,
      consistencyScore,
      improvementRate,
      githubActivity,
      productivityScore
    }
  }

  private async analyzeTimePartPerformance(userId: string, timeRange: number): Promise<TimePartPerformance[]> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - timeRange * 24 * 60 * 60 * 1000)

    const { data: reflections } = await this.supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', userId)
      .gte('reflection_date', startDate.toISOString().split('T')[0])
      .lte('reflection_date', endDate.toISOString().split('T')[0])

    if (!reflections) return []

    const timeParts: ('오전수업' | '오후수업' | '저녁자율학습')[] = ['오전수업', '오후수업', '저녁자율학습']
    
    return timeParts.map(timePart => {
      const timePartReflections = reflections.filter(r => r.time_part === timePart)
      const scores = timePartReflections.map(r => r.overall_score || 0)
      
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / Math.max(scores.length, 1)
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / Math.max(scores.length, 1)
      const consistencyScore = Math.max(0, 100 - Math.sqrt(variance) * 10)

      // 요일별 성과 분석
      const dayPerformance = new Map<string, number[]>()
      timePartReflections.forEach(r => {
        const day = new Date(r.reflection_date).toLocaleDateString('ko-KR', { weekday: 'long' })
        if (!dayPerformance.has(day)) dayPerformance.set(day, [])
        dayPerformance.get(day)!.push(r.overall_score || 0)
      })

      const optimalDays = Array.from(dayPerformance.entries())
        .map(([day, scores]) => ({
          day,
          avg: scores.reduce((sum, score) => sum + score, 0) / scores.length
        }))
        .filter(({ avg }) => avg >= averageScore)
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 3)
        .map(({ day }) => day)

      // 개선 트렌드 계산
      const recentScores = scores.slice(-7)
      const olderScores = scores.slice(0, -7)
      const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / Math.max(recentScores.length, 1)
      const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / Math.max(olderScores.length, 1)
      const improvementTrend = ((recentAvg - olderAvg) / Math.max(olderAvg, 1)) * 100

      return {
        timePart,
        averageScore,
        consistencyScore,
        activityCount: timePartReflections.length,
        improvementTrend,
        optimalDays
      }
    })
  }

  private async identifyLearningPatterns(userId: string, timeRange: number): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = []
    
    // GitHub 활동 패턴 분석 등을 여기서 구현
    // 현재는 기본 패턴만 제공
    
    return patterns
  }

  private generatePerformanceInsights(metrics: LearningMetrics, timePartPerformance: TimePartPerformance[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = []

    // 전체 성과 인사이트
    if (metrics.averageScore >= 8) {
      insights.push({
        id: 'high-performance',
        type: 'performance',
        title: '뛰어난 학습 성과',
        description: `평균 점수 ${metrics.averageScore.toFixed(1)}점으로 매우 우수한 성과를 보이고 있습니다.`,
        value: metrics.averageScore,
        trend: metrics.improvementRate > 0 ? 'up' : 'stable',
        priority: 'high',
        confidence: 0.9,
        actionable: false,
        generatedAt: new Date()
      })
    } else if (metrics.averageScore < 5) {
      insights.push({
        id: 'low-performance',
        type: 'warning',
        title: '학습 성과 개선 필요',
        description: `평균 점수 ${metrics.averageScore.toFixed(1)}점으로 개선이 필요합니다. 학습 방법을 점검해보세요.`,
        value: metrics.averageScore,
        trend: 'down',
        priority: 'high',
        confidence: 0.8,
        actionable: true,
        generatedAt: new Date()
      })
    }

    // 일관성 인사이트
    if (metrics.consistencyScore >= 80) {
      insights.push({
        id: 'high-consistency',
        type: 'performance',
        title: '뛰어난 학습 일관성',
        description: `일관성 점수 ${metrics.consistencyScore.toFixed(1)}점으로 매우 규칙적인 학습을 하고 있습니다.`,
        value: metrics.consistencyScore,
        trend: 'stable',
        priority: 'medium',
        confidence: 0.85,
        actionable: false,
        generatedAt: new Date()
      })
    }

    // 시간대별 성과 비교
    const bestTimePart = timePartPerformance.reduce((best, current) => 
      current.averageScore > best.averageScore ? current : best
    )

    if (bestTimePart.averageScore > 0) {
      insights.push({
        id: 'best-time-part',
        type: 'pattern',
        title: '최고 성과 시간대 발견',
        description: `${bestTimePart.timePart}에서 평균 ${bestTimePart.averageScore.toFixed(1)}점으로 가장 좋은 성과를 보입니다.`,
        value: bestTimePart.averageScore,
        trend: bestTimePart.improvementTrend > 0 ? 'up' : 'stable',
        priority: 'medium',
        confidence: 0.75,
        actionable: true,
        metadata: { timePart: bestTimePart.timePart, optimalDays: bestTimePart.optimalDays },
        generatedAt: new Date()
      })
    }

    return insights
  }

  private generatePatternInsights(patterns: LearningPattern[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = []
    
    // 패턴 기반 인사이트 생성 (추후 구현)
    
    return insights
  }

  private generateRecommendations(
    metrics: LearningMetrics, 
    timePartPerformance: TimePartPerformance[], 
    patterns: LearningPattern[]
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = []

    // 시간대 최적화 추천
    const sortedTimeParts = [...timePartPerformance].sort((a, b) => b.averageScore - a.averageScore)
    const bestTimePart = sortedTimeParts[0]
    const worstTimePart = sortedTimeParts[sortedTimeParts.length - 1]

    if (bestTimePart && worstTimePart && bestTimePart.averageScore - worstTimePart.averageScore > 2) {
      insights.push({
        id: 'optimize-schedule',
        type: 'recommendation',
        title: '학습 스케줄 최적화 권장',
        description: `${bestTimePart.timePart}의 성과가 ${worstTimePart.timePart}보다 ${(bestTimePart.averageScore - worstTimePart.averageScore).toFixed(1)}점 높습니다. 중요한 학습을 ${bestTimePart.timePart}에 집중해보세요.`,
        value: bestTimePart.averageScore - worstTimePart.averageScore,
        trend: 'up',
        priority: 'high',
        confidence: 0.8,
        actionable: true,
        metadata: { bestTimePart: bestTimePart.timePart, worstTimePart: worstTimePart.timePart },
        generatedAt: new Date()
      })
    }

    // 일관성 개선 추천
    if (metrics.consistencyScore < 60) {
      insights.push({
        id: 'improve-consistency',
        type: 'recommendation',
        title: '학습 일관성 개선 필요',
        description: '학습 성과의 편차가 큽니다. 일정한 학습 루틴을 만들어 보세요.',
        value: metrics.consistencyScore,
        trend: 'stable',
        priority: 'medium',
        confidence: 0.7,
        actionable: true,
        generatedAt: new Date()
      })
    }

    // GitHub 활동 증대 추천
    if (metrics.githubActivity < 10) {
      insights.push({
        id: 'increase-github-activity',
        type: 'recommendation',
        title: 'GitHub 활동 증대 권장',
        description: '지난 기간 GitHub 활동이 적습니다. 학습한 내용을 코드로 실습해보세요.',
        value: metrics.githubActivity,
        trend: 'down',
        priority: 'medium',
        confidence: 0.6,
        actionable: true,
        generatedAt: new Date()
      })
    }

    return insights
  }

  private generatePredictiveInsights(metrics: LearningMetrics, timePartPerformance: TimePartPerformance[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = []

    // 단기 성과 예측
    const avgImprovement = timePartPerformance.reduce((sum, tp) => sum + tp.improvementTrend, 0) / timePartPerformance.length
    
    if (avgImprovement > 5) {
      const predictedScore = metrics.averageScore * (1 + avgImprovement / 100)
      insights.push({
        id: 'positive-trend-prediction',
        type: 'prediction',
        title: '긍정적 성과 예측',
        description: `현재 추세로 보면 다음 주 평균 점수가 ${predictedScore.toFixed(1)}점까지 향상될 것으로 예상됩니다.`,
        value: predictedScore,
        change: avgImprovement,
        trend: 'up',
        priority: 'medium',
        confidence: 0.6,
        actionable: false,
        generatedAt: new Date()
      })
    } else if (avgImprovement < -5) {
      insights.push({
        id: 'negative-trend-warning',
        type: 'warning',
        title: '성과 하락 경고',
        description: '최근 성과가 하락 추세입니다. 학습 방법을 점검하고 조정이 필요합니다.',
        value: metrics.averageScore,
        change: avgImprovement,
        trend: 'down',
        priority: 'high',
        confidence: 0.7,
        actionable: true,
        generatedAt: new Date()
      })
    }

    return insights
  }

  private generateWarningInsights(metrics: LearningMetrics, timePartPerformance: TimePartPerformance[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = []

    // 낮은 활동 경고
    if (metrics.totalReflections < 10) {
      insights.push({
        id: 'low-activity-warning',
        type: 'warning',
        title: '학습 활동 부족',
        description: '최근 리플렉션 작성이 적습니다. 꾸준한 기록이 학습 개선에 도움됩니다.',
        value: metrics.totalReflections,
        trend: 'down',
        priority: 'medium',
        confidence: 0.9,
        actionable: true,
        generatedAt: new Date()
      })
    }

    // 급격한 성과 변화 경고
    if (Math.abs(metrics.improvementRate) > 50) {
      insights.push({
        id: 'dramatic-change-warning',
        type: 'warning',
        title: '급격한 성과 변화 감지',
        description: '성과에 급격한 변화가 있었습니다. 변화 요인을 분석해보세요.',
        value: Math.abs(metrics.improvementRate),
        change: metrics.improvementRate,
        trend: metrics.improvementRate > 0 ? 'up' : 'down',
        priority: 'high',
        confidence: 0.8,
        actionable: true,
        generatedAt: new Date()
      })
    }

    return insights
  }

  async getRecommendations(userId: string, category?: string): Promise<AnalyticsInsight[]> {
    const insights = await this.generateInsights(userId)
    return insights.filter(insight => 
      insight.type === 'recommendation' && 
      (category ? insight.metadata?.category === category : true)
    )
  }

  async getPredictions(userId: string, timeHorizon = 7): Promise<AnalyticsInsight[]> {
    const insights = await this.generateInsights(userId)
    return insights.filter(insight => insight.type === 'prediction')
  }

  async getPerformanceAnalysis(userId: string): Promise<AnalyticsInsight[]> {
    const insights = await this.generateInsights(userId)
    return insights.filter(insight => insight.type === 'performance')
  }
}

export const insightsEngine = new InsightsEngine()