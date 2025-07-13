import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import { patternAnalyzer, type LearningPattern } from './pattern-analyzer'
import { predictor, type Prediction } from './predictor'

export interface Recommendation {
  id: string
  type: 'schedule' | 'method' | 'habit' | 'goal' | 'break' | 'subject' | 'productivity'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  rationale: string
  actionItems: string[]
  expectedImpact: number // 0-1 범위
  implementationDifficulty: number // 0-1 범위
  timeToSeeResults: number // days
  category: string
  tags: string[]
  metadata?: Record<string, any>
  createdAt: Date
}

export interface ScheduleRecommendation {
  timePart: '오전수업' | '오후수업' | '저녁자율학습'
  subject: string
  priority: number
  reason: string
  duration: number
}

export interface MethodRecommendation {
  technique: string
  description: string
  suitability: number
  evidence: string[]
}

export interface PersonalizedPlan {
  userId: string
  planName: string
  duration: number // days
  objectives: string[]
  dailyRecommendations: {
    day: number
    timePart: string
    activity: string
    focus: string
    expectedOutcome: string
  }[]
  milestones: {
    day: number
    goal: string
    metric: string
  }[]
  adaptations: string[]
}

export class Recommender {
  private supabase = createClient()

  async generateRecommendations(userId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    try {
      const patterns = await patternAnalyzer.analyzeAllPatterns(userId, 30)
      const predictions = await predictor.generatePredictions(userId, 7)
      const userMetrics = await this.getUserMetrics(userId)

      // 스케줄 최적화 추천
      recommendations.push(...await this.generateScheduleRecommendations(userId, patterns, userMetrics))

      // 학습 방법 추천
      recommendations.push(...await this.generateMethodRecommendations(userId, patterns, userMetrics))

      // 습관 형성 추천
      recommendations.push(...await this.generateHabitRecommendations(userId, patterns, predictions))

      // 목표 설정 추천
      recommendations.push(...await this.generateGoalRecommendations(userId, userMetrics, predictions))

      // 휴식 및 건강 추천
      recommendations.push(...await this.generateWellnessRecommendations(userId, userMetrics))

      // 생산성 향상 추천
      recommendations.push(...await this.generateProductivityRecommendations(userId, patterns, userMetrics))

      return this.prioritizeRecommendations(recommendations)
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return []
    }
  }

  private async generateScheduleRecommendations(
    userId: string, 
    patterns: LearningPattern[], 
    metrics: any
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // 최적 시간대 식별
    const timePatterns = patterns.filter(p => p.category === 'time')
    const bestTimePattern = timePatterns.reduce((best, current) => 
      current.strength > best.strength ? current : best
    , timePatterns[0])

    if (bestTimePattern && bestTimePattern.strength > 0.6) {
      recommendations.push({
        id: 'optimize-peak-hours',
        type: 'schedule',
        priority: 'high',
        title: '최적 시간대 활용',
        description: `${bestTimePattern.metadata?.timePart}에서 최고 성과를 보입니다. 이 시간에 가장 중요한 학습을 진행하세요.`,
        rationale: `평균 ${bestTimePattern.metadata?.averageScore?.toFixed(1)}점으로 다른 시간대보다 우수한 성과를 보이고 있습니다.`,
        actionItems: [
          `${bestTimePattern.metadata?.timePart}에 가장 어려운 과목 배치`,
          '집중도가 높은 이론 학습 진행',
          '중요한 프로젝트 작업 시간으로 활용'
        ],
        expectedImpact: 0.8,
        implementationDifficulty: 0.3,
        timeToSeeResults: 7,
        category: '시간 관리',
        tags: ['스케줄', '최적화', '성과향상'],
        metadata: { timePart: bestTimePattern.metadata?.timePart, averageScore: bestTimePattern.metadata?.averageScore },
        createdAt: new Date()
      })
    }

    // 요일별 최적화
    const dayPatterns = patterns.filter(p => p.metadata?.dayName)
    if (dayPatterns.length > 0) {
      const bestDays = dayPatterns
        .sort((a, b) => (b.metadata?.averageScore || 0) - (a.metadata?.averageScore || 0))
        .slice(0, 2)

      recommendations.push({
        id: 'weekly-schedule-optimization',
        type: 'schedule',
        priority: 'medium',
        title: '주간 스케줄 최적화',
        description: `${bestDays.map(d => d.metadata?.dayName).join(', ')}에 최고 성과를 보입니다.`,
        rationale: '요일별 성과 패턴을 분석한 결과입니다.',
        actionItems: [
          `${bestDays[0]?.metadata?.dayName}에 중요한 학습 계획`,
          '성과가 낮은 요일에는 복습이나 정리 시간으로 활용',
          '주간 학습 계획 수립 시 고려'
        ],
        expectedImpact: 0.6,
        implementationDifficulty: 0.4,
        timeToSeeResults: 14,
        category: '주간 계획',
        tags: ['요일', '최적화', '계획'],
        metadata: { bestDays: bestDays.map(d => d.metadata?.dayName) },
        createdAt: new Date()
      })
    }

    return recommendations
  }

  private async generateMethodRecommendations(
    userId: string,
    patterns: LearningPattern[],
    metrics: any
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // 일관성 기반 추천
    if (metrics.consistencyScore < 60) {
      recommendations.push({
        id: 'improve-consistency-methods',
        type: 'method',
        priority: 'high',
        title: '일관성 향상 방법',
        description: '학습 일관성을 개선하기 위한 구체적인 방법들을 제시합니다.',
        rationale: `현재 일관성 점수 ${metrics.consistencyScore.toFixed(0)}점으로 개선이 필요합니다.`,
        actionItems: [
          '매일 같은 시간에 학습 시작하기',
          '작은 목표부터 설정하여 성취감 쌓기',
          '학습 완료 체크리스트 작성',
          '학습 환경 일정하게 유지하기'
        ],
        expectedImpact: 0.7,
        implementationDifficulty: 0.5,
        timeToSeeResults: 21,
        category: '학습 방법',
        tags: ['일관성', '습관', '루틴'],
        createdAt: new Date()
      })
    }

    // GitHub 활동 부족 시 추천
    if (metrics.githubActivity < 10) {
      recommendations.push({
        id: 'increase-practical-learning',
        type: 'method',
        priority: 'medium',
        title: '실습 중심 학습 강화',
        description: 'GitHub 활동을 늘려 이론과 실습의 균형을 맞추세요.',
        rationale: '최근 GitHub 활동이 적어 실습 부족이 우려됩니다.',
        actionItems: [
          '학습한 내용을 코드로 실습하기',
          '작은 프로젝트 만들어보기',
          '매일 최소 1개 커밋 목표 설정',
          '학습 노트를 GitHub에 정리하기'
        ],
        expectedImpact: 0.6,
        implementationDifficulty: 0.4,
        timeToSeeResults: 14,
        category: '실습 학습',
        tags: ['GitHub', '실습', '프로젝트'],
        createdAt: new Date()
      })
    }

    // 성과 향상을 위한 방법 추천
    if (metrics.averageScore < 7) {
      recommendations.push({
        id: 'performance-improvement-methods',
        type: 'method',
        priority: 'high',
        title: '성과 향상 학습법',
        description: '학습 성과를 높이기 위한 효과적인 방법들을 적용해보세요.',
        rationale: `현재 평균 점수 ${metrics.averageScore.toFixed(1)}점으로 향상 여지가 있습니다.`,
        actionItems: [
          '능동적 학습법 적용 (요약, 질문, 설명)',
          '포모도로 기법으로 집중력 향상',
          '학습 내용을 다른 사람에게 설명해보기',
          '개념 맵 그리기로 이해도 높이기'
        ],
        expectedImpact: 0.8,
        implementationDifficulty: 0.6,
        timeToSeeResults: 14,
        category: '학습 효율성',
        tags: ['성과향상', '학습법', '집중력'],
        createdAt: new Date()
      })
    }

    return recommendations
  }

  private async generateHabitRecommendations(
    userId: string,
    patterns: LearningPattern[],
    predictions: Prediction[]
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // 좋은 습관 유지 추천
    const goodHabits = patterns.filter(p => p.category === 'habit' && p.strength > 0.7)
    if (goodHabits.length > 0) {
      recommendations.push({
        id: 'maintain-good-habits',
        type: 'habit',
        priority: 'medium',
        title: '우수한 습관 유지',
        description: '현재 형성된 좋은 학습 습관을 계속 유지하세요.',
        rationale: '일관된 학습 패턴이 좋은 성과를 내고 있습니다.',
        actionItems: [
          '현재의 학습 루틴 지속하기',
          '습관 추적 도구 활용하기',
          '작은 보상 시스템 만들기'
        ],
        expectedImpact: 0.6,
        implementationDifficulty: 0.2,
        timeToSeeResults: 7,
        category: '습관 유지',
        tags: ['습관', '유지', '루틴'],
        metadata: { goodHabits: goodHabits.map(h => h.name) },
        createdAt: new Date()
      })
    }

    // 새로운 습관 형성 추천
    const consistencyPrediction = predictions.find(p => p.type === 'consistency')
    if (consistencyPrediction && consistencyPrediction.prediction < 70) {
      recommendations.push({
        id: 'build-learning-habits',
        type: 'habit',
        priority: 'high',
        title: '학습 습관 구축',
        description: '꾸준한 학습을 위한 새로운 습관을 만들어보세요.',
        rationale: '일관성 예측 점수가 낮아 습관 개선이 필요합니다.',
        actionItems: [
          '21일 습관 챌린지 시작하기',
          '학습 시작 전 의식(ritual) 만들기',
          '학습 완료 후 체크 표시하기',
          '연속 학습 일수 기록하기'
        ],
        expectedImpact: 0.8,
        implementationDifficulty: 0.7,
        timeToSeeResults: 21,
        category: '습관 형성',
        tags: ['습관', '일관성', '챌린지'],
        createdAt: new Date()
      })
    }

    return recommendations
  }

  private async generateGoalRecommendations(
    userId: string,
    metrics: any,
    predictions: Prediction[]
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // 단기 목표 설정 추천
    recommendations.push({
      id: 'set-short-term-goals',
      type: 'goal',
      priority: 'medium',
      title: '단기 목표 설정',
      description: '다음 주를 위한 구체적이고 달성 가능한 목표를 설정하세요.',
      rationale: '명확한 목표는 동기부여와 성과 향상에 도움됩니다.',
      actionItems: [
        '주간 학습 목표 3개 설정하기',
        'SMART 목표 기준 적용하기',
        '일일 진행상황 체크하기',
        '목표 달성 시 보상 계획하기'
      ],
      expectedImpact: 0.7,
      implementationDifficulty: 0.4,
      timeToSeeResults: 7,
      category: '목표 설정',
      tags: ['목표', '계획', '동기부여'],
      createdAt: new Date()
    })

    // 성과 기반 목표 조정 추천
    if (metrics.averageScore > 8) {
      recommendations.push({
        id: 'raise-learning-standards',
        type: 'goal',
        priority: 'medium',
        title: '도전적 목표 설정',
        description: '우수한 성과를 바탕으로 더 높은 목표에 도전해보세요.',
        rationale: `평균 ${metrics.averageScore.toFixed(1)}점의 높은 성과를 보이고 있습니다.`,
        actionItems: [
          '더 어려운 프로젝트 도전하기',
          '새로운 기술 스택 학습하기',
          '깊이 있는 학습 계획 수립',
          '멘토링이나 교육 참여 고려'
        ],
        expectedImpact: 0.8,
        implementationDifficulty: 0.8,
        timeToSeeResults: 30,
        category: '도전 목표',
        tags: ['도전', '성장', '발전'],
        createdAt: new Date()
      })
    }

    return recommendations
  }

  private async generateWellnessRecommendations(
    userId: string,
    metrics: any
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // 컨디션 개선 추천
    if (metrics.averageCondition < 3.5) {
      recommendations.push({
        id: 'improve-wellness',
        type: 'break',
        priority: 'high',
        title: '컨디션 관리',
        description: '학습 효과를 위해 신체적, 정신적 컨디션 관리가 필요합니다.',
        rationale: '최근 컨디션이 좋지 않아 학습 성과에 영향을 줄 수 있습니다.',
        actionItems: [
          '충분한 수면 시간 확보 (7-8시간)',
          '규칙적인 운동 시간 만들기',
          '학습 중간에 10분 휴식 포함',
          '스트레스 관리법 실천하기'
        ],
        expectedImpact: 0.7,
        implementationDifficulty: 0.6,
        timeToSeeResults: 14,
        category: '건강 관리',
        tags: ['컨디션', '휴식', '건강'],
        createdAt: new Date()
      })
    }

    // 번아웃 예방 추천
    if (metrics.totalReflections > 20 && metrics.consistencyScore > 80) {
      recommendations.push({
        id: 'prevent-burnout',
        type: 'break',
        priority: 'medium',
        title: '번아웃 예방',
        description: '높은 일관성을 보이고 있지만, 적절한 휴식도 중요합니다.',
        rationale: '지속적인 고강도 학습은 번아웃 위험을 높일 수 있습니다.',
        actionItems: [
          '주 1회 완전 휴식 시간 갖기',
          '취미 활동 시간 확보하기',
          '친구, 가족과의 시간 늘리기',
          '자연 속에서 산책하기'
        ],
        expectedImpact: 0.6,
        implementationDifficulty: 0.3,
        timeToSeeResults: 7,
        category: '번아웃 예방',
        tags: ['휴식', '균형', '예방'],
        createdAt: new Date()
      })
    }

    return recommendations
  }

  private async generateProductivityRecommendations(
    userId: string,
    patterns: LearningPattern[],
    metrics: any
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    const productivityPatterns = patterns.filter(p => p.category === 'productivity')
    
    if (productivityPatterns.length > 0) {
      const bestPattern = productivityPatterns[0]
      
      recommendations.push({
        id: 'replicate-productive-conditions',
        type: 'productivity',
        priority: 'high',
        title: '생산적 조건 재현',
        description: '높은 생산성을 보인 조건들을 다른 시간에도 적용해보세요.',
        rationale: `특정 조건에서 ${bestPattern.metadata?.averageProductivity?.toFixed(0) || 'N/A'}%의 높은 생산성을 보였습니다.`,
        actionItems: [
          '성공 요인 분석하고 체크리스트 작성',
          '비슷한 환경 조건 재현하기',
          '생산적인 시간대와 장소 활용',
          '방해 요소 제거하기'
        ],
        expectedImpact: 0.8,
        implementationDifficulty: 0.5,
        timeToSeeResults: 7,
        category: '생산성',
        tags: ['생산성', '환경', '최적화'],
        metadata: { factors: bestPattern.metadata?.factors },
        createdAt: new Date()
      })
    }

    return recommendations
  }

  private prioritizeRecommendations(recommendations: Recommendation[]): Recommendation[] {
    return recommendations.sort((a, b) => {
      // 우선순위별 점수
      const priorityScore = { high: 3, medium: 2, low: 1 }
      
      // 영향도와 구현 용이성을 고려한 점수
      const scoreA = priorityScore[a.priority] * 3 + a.expectedImpact * 2 + (1 - a.implementationDifficulty)
      const scoreB = priorityScore[b.priority] * 3 + b.expectedImpact * 2 + (1 - b.implementationDifficulty)
      
      return scoreB - scoreA
    })
  }

  private async getUserMetrics(userId: string) {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

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
        githubActivity: 0
      }
    }

    const totalReflections = reflections.length
    const averageScore = reflections.reduce((sum, r) => sum + (r.overall_score || 0), 0) / Math.max(totalReflections, 1)
    
    const conditionMapping = { '최고': 5, '좋음': 4, '보통': 3, '피곤': 2, '매우피곤': 1 }
    const averageCondition = reflections.reduce((sum, r) => {
      return sum + (conditionMapping[r.condition as keyof typeof conditionMapping] || 3)
    }, 0) / Math.max(totalReflections, 1)

    const scores = reflections.map(r => r.overall_score || 0)
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / Math.max(scores.length, 1)
    const consistencyScore = Math.max(0, 100 - Math.sqrt(variance) * 10)

    const githubActivity = githubActivities?.reduce((sum, a) => sum + (a.commits_count || 0), 0) || 0

    return {
      totalReflections,
      averageScore,
      averageCondition,
      consistencyScore,
      githubActivity
    }
  }

  async getRecommendationsByType(userId: string, type: Recommendation['type']): Promise<Recommendation[]> {
    const allRecommendations = await this.generateRecommendations(userId)
    return allRecommendations.filter(rec => rec.type === type)
  }

  async generatePersonalizedPlan(userId: string, duration = 14): Promise<PersonalizedPlan> {
    const patterns = await patternAnalyzer.analyzeAllPatterns(userId, 30)
    const recommendations = await this.generateRecommendations(userId)
    
    // 기본 계획 구조 (추후 더 정교하게 개발)
    return {
      userId,
      planName: `${duration}일 개인화 학습 계획`,
      duration,
      objectives: [
        '학습 일관성 향상',
        '성과 개선',
        '효율적 시간 활용'
      ],
      dailyRecommendations: [],
      milestones: [],
      adaptations: []
    }
  }

  async getQuickWins(userId: string): Promise<Recommendation[]> {
    const allRecommendations = await this.generateRecommendations(userId)
    return allRecommendations.filter(rec => 
      rec.implementationDifficulty < 0.4 && 
      rec.expectedImpact > 0.6 &&
      rec.timeToSeeResults <= 7
    ).slice(0, 3)
  }
}

export const recommender = new Recommender()