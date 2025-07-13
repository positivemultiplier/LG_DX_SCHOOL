import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import { patternAnalyzer, type LearningPattern } from './pattern-analyzer'

export interface Prediction {
  id: string
  type: 'score' | 'productivity' | 'consistency' | 'goal_achievement' | 'risk'
  timeHorizon: number // days
  prediction: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  factors: string[]
  description: string
  recommendations: string[]
  createdAt: Date
  metadata?: Record<string, any>
}

export interface GoalPrediction {
  goalType: string
  currentProgress: number
  predictedProgress: number
  achievementProbability: number
  estimatedCompletionDate: Date
  requiredDailyProgress: number
}

export interface RiskFactor {
  factor: string
  severity: 'low' | 'medium' | 'high'
  probability: number
  impact: number
  mitigation: string[]
}

export interface LearningTrajectory {
  date: string
  predictedScore: number
  confidence: number
  factors: string[]
}

export class Predictor {
  private supabase = createClient()

  async generatePredictions(userId: string, timeHorizon = 7): Promise<Prediction[]> {
    const predictions: Prediction[] = []

    try {
      const scorePrediction = await this.predictPerformanceScore(userId, timeHorizon)
      const productivityPrediction = await this.predictProductivity(userId, timeHorizon)
      const consistencyPrediction = await this.predictConsistency(userId, timeHorizon)
      const riskPredictions = await this.predictRisks(userId, timeHorizon)

      predictions.push(scorePrediction)
      predictions.push(productivityPrediction)
      predictions.push(consistencyPrediction)
      predictions.push(...riskPredictions)

      return predictions.sort((a, b) => b.confidence - a.confidence)
    } catch (error) {
      console.error('Error generating predictions:', error)
      return []
    }
  }

  private async predictPerformanceScore(userId: string, timeHorizon: number): Promise<Prediction> {
    const historicalData = await this.getHistoricalPerformance(userId, 30)
    const patterns = await patternAnalyzer.analyzeAllPatterns(userId, 30)

    // 선형 회귀 기반 예측
    const { slope, intercept, r2 } = this.calculateLinearTrend(historicalData)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + timeHorizon)
    
    const dayIndex = historicalData.length + timeHorizon
    const basePrediction = slope * dayIndex + intercept

    // 패턴 기반 조정
    const patternAdjustment = this.calculatePatternAdjustment(patterns, timeHorizon)
    const finalPrediction = Math.max(0, Math.min(10, basePrediction + patternAdjustment))

    // 신뢰도 계산 (R² 기반)
    const confidence = Math.min(0.95, Math.max(0.3, r2 * 0.8 + 0.2))

    const trend = slope > 0.05 ? 'up' : slope < -0.05 ? 'down' : 'stable'
    
    const factors = this.identifyPerformanceFactors(historicalData, patterns)
    const recommendations = this.generatePerformanceRecommendations(finalPrediction, trend, factors)

    return {
      id: 'performance-score-prediction',
      type: 'score',
      timeHorizon,
      prediction: finalPrediction,
      confidence,
      trend,
      factors,
      description: `${timeHorizon}일 후 예상 성과 점수는 ${finalPrediction.toFixed(1)}점입니다.`,
      recommendations,
      createdAt: new Date(),
      metadata: {
        slope,
        r2,
        patternAdjustment,
        basePrediction
      }
    }
  }

  private async predictProductivity(userId: string, timeHorizon: number): Promise<Prediction> {
    const { data: reflections } = await this.supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', userId)
      .order('reflection_date', { ascending: false })
      .limit(30)

    const { data: githubActivities } = await this.supabase
      .from('github_activities')
      .select('*')
      .eq('user_id', userId)
      .order('activity_date', { ascending: false })
      .limit(30)

    if (!reflections || !githubActivities) {
      return this.createDefaultPrediction('productivity', timeHorizon)
    }

    // 생산성 점수 계산 (리플렉션 점수 + GitHub 활동)
    const productivityScores = reflections.map(r => {
      const githubActivity = githubActivities.find(g => g.activity_date === r.reflection_date)
      const githubScore = Math.min(30, (githubActivity?.commits_count || 0) * 5)
      return (r.overall_score || 0) * 0.7 + githubScore
    })

    const { slope, intercept, r2 } = this.calculateLinearTrend(productivityScores)
    const dayIndex = productivityScores.length + timeHorizon
    const prediction = Math.max(0, Math.min(100, slope * dayIndex + intercept))

    const confidence = Math.min(0.9, Math.max(0.4, r2 * 0.7 + 0.3))
    const trend = slope > 1 ? 'up' : slope < -1 ? 'down' : 'stable'

    return {
      id: 'productivity-prediction',
      type: 'productivity',
      timeHorizon,
      prediction,
      confidence,
      trend,
      factors: ['학습 성과', 'GitHub 활동', '일관성'],
      description: `${timeHorizon}일 후 예상 생산성 점수는 ${prediction.toFixed(0)}%입니다.`,
      recommendations: this.generateProductivityRecommendations(prediction, trend),
      createdAt: new Date(),
      metadata: { slope, r2, avgProductivity: productivityScores.reduce((a, b) => a + b, 0) / productivityScores.length }
    }
  }

  private async predictConsistency(userId: string, timeHorizon: number): Promise<Prediction> {
    const { data: reflections } = await this.supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', userId)
      .order('reflection_date', { ascending: false })
      .limit(30)

    if (!reflections) {
      return this.createDefaultPrediction('consistency', timeHorizon)
    }

    // 주간 일관성 계산
    const weeklyConsistency = this.calculateWeeklyConsistency(reflections)
    const { slope, intercept, r2 } = this.calculateLinearTrend(weeklyConsistency)
    
    const prediction = Math.max(0, Math.min(100, slope * (weeklyConsistency.length + 1) + intercept))
    const confidence = Math.min(0.85, Math.max(0.5, r2 * 0.6 + 0.4))
    const trend = slope > 2 ? 'up' : slope < -2 ? 'down' : 'stable'

    return {
      id: 'consistency-prediction',
      type: 'consistency',
      timeHorizon,
      prediction,
      confidence,
      trend,
      factors: ['학습 규칙성', '습관 형성', '의지력'],
      description: `${timeHorizon}일 후 예상 일관성 점수는 ${prediction.toFixed(0)}%입니다.`,
      recommendations: this.generateConsistencyRecommendations(prediction, trend),
      createdAt: new Date(),
      metadata: { slope, r2, currentConsistency: weeklyConsistency[weeklyConsistency.length - 1] || 0 }
    }
  }

  private async predictRisks(userId: string, timeHorizon: number): Promise<Prediction[]> {
    const risks: Prediction[] = []
    const riskFactors = await this.identifyRiskFactors(userId)

    for (const risk of riskFactors) {
      if (risk.severity === 'high' || risk.probability > 0.6) {
        risks.push({
          id: `risk-${risk.factor.toLowerCase().replace(/\s+/g, '-')}`,
          type: 'risk',
          timeHorizon,
          prediction: risk.probability * 100,
          confidence: 0.7,
          trend: 'up',
          factors: [risk.factor],
          description: `${risk.factor} 위험도: ${(risk.probability * 100).toFixed(0)}%`,
          recommendations: risk.mitigation,
          createdAt: new Date(),
          metadata: { severity: risk.severity, impact: risk.impact }
        })
      }
    }

    return risks
  }

  private async getHistoricalPerformance(userId: string, days: number): Promise<number[]> {
    const { data: reflections } = await this.supabase
      .from('daily_reflections')
      .select('overall_score, reflection_date')
      .eq('user_id', userId)
      .order('reflection_date', { ascending: true })
      .limit(days)

    if (!reflections) return []

    return reflections.map(r => r.overall_score || 0)
  }

  private calculateLinearTrend(data: number[]): { slope: number; intercept: number; r2: number } {
    if (data.length < 2) {
      return { slope: 0, intercept: data[0] || 0, r2: 0 }
    }

    const n = data.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = data

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // R² 계산
    const yMean = sumY / n
    const totalSumSquares = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
    const residualSumSquares = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + intercept
      return sum + Math.pow(yi - predicted, 2)
    }, 0)
    const r2 = totalSumSquares > 0 ? 1 - (residualSumSquares / totalSumSquares) : 0

    return { slope, intercept, r2: Math.max(0, r2) }
  }

  private calculatePatternAdjustment(patterns: LearningPattern[], timeHorizon: number): number {
    let adjustment = 0

    for (const pattern of patterns) {
      if (pattern.category === 'time' && pattern.strength > 0.7) {
        adjustment += pattern.strength * 0.5 // 강한 시간 패턴은 성과를 개선
      }
      if (pattern.category === 'habit' && pattern.strength > 0.8) {
        adjustment += pattern.strength * 0.3 // 좋은 습관은 성과 향상
      }
      if (pattern.category === 'productivity' && pattern.strength > 0.6) {
        adjustment += pattern.strength * 0.4 // 생산성 패턴 기여
      }
    }

    return Math.min(1.5, Math.max(-1.5, adjustment)) // 조정값 제한
  }

  private calculateWeeklyConsistency(reflections: any[]): number[] {
    const weeks: number[] = []
    const weeklyData = new Map<number, number>()

    reflections.forEach(r => {
      const date = new Date(r.reflection_date)
      const weekNumber = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000))
      weeklyData.set(weekNumber, (weeklyData.get(weekNumber) || 0) + 1)
    })

    for (const [week, count] of weeklyData.entries()) {
      weeks.push(Math.min(100, (count / 7) * 100)) // 주간 완료율
    }

    return weeks.sort()
  }

  private identifyPerformanceFactors(historicalData: number[], patterns: LearningPattern[]): string[] {
    const factors: string[] = []

    if (historicalData.length > 0) {
      const recent = historicalData.slice(-7)
      const older = historicalData.slice(0, -7)
      
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
      const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg

      if (recentAvg > olderAvg + 0.5) {
        factors.push('최근 성과 향상')
      }
    }

    patterns.forEach(pattern => {
      if (pattern.strength > 0.6) {
        factors.push(pattern.name)
      }
    })

    return factors.slice(0, 5)
  }

  private generatePerformanceRecommendations(prediction: number, trend: string, factors: string[]): string[] {
    const recommendations: string[] = []

    if (prediction < 6) {
      recommendations.push('학습 방법을 재검토하고 개선이 필요합니다.')
      recommendations.push('작은 목표부터 설정하여 성취감을 늘려보세요.')
    } else if (prediction > 8) {
      recommendations.push('현재의 좋은 패턴을 계속 유지하세요.')
      recommendations.push('새로운 도전 과제를 추가해보세요.')
    }

    if (trend === 'down') {
      recommendations.push('최근 하락 요인을 분석하고 조정이 필요합니다.')
    } else if (trend === 'up') {
      recommendations.push('상승 추세를 유지하기 위한 요인들을 지속하세요.')
    }

    return recommendations.slice(0, 3)
  }

  private generateProductivityRecommendations(prediction: number, trend: string): string[] {
    const recommendations: string[] = []

    if (prediction < 50) {
      recommendations.push('GitHub 활동을 늘려 실습과 이론을 병행하세요.')
      recommendations.push('학습 시간을 늘리거나 집중도를 개선하세요.')
    } else if (prediction > 80) {
      recommendations.push('현재의 높은 생산성을 계속 유지하세요.')
      recommendations.push('더 도전적인 프로젝트를 시작해보세요.')
    }

    return recommendations
  }

  private generateConsistencyRecommendations(prediction: number, trend: string): string[] {
    const recommendations: string[] = []

    if (prediction < 60) {
      recommendations.push('일정한 학습 루틴을 만들어 습관화하세요.')
      recommendations.push('작은 목표부터 꾸준히 달성해나가세요.')
    } else if (prediction > 85) {
      recommendations.push('뛰어난 일관성을 계속 유지하세요.')
    }

    return recommendations
  }

  private async identifyRiskFactors(userId: string): Promise<RiskFactor[]> {
    const risks: RiskFactor[] = []

    const { data: recentReflections } = await this.supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', userId)
      .order('reflection_date', { ascending: false })
      .limit(14)

    if (!recentReflections) return risks

    // 낮은 활동 위험
    if (recentReflections.length < 7) {
      risks.push({
        factor: '학습 활동 부족',
        severity: 'high',
        probability: 0.8,
        impact: 0.7,
        mitigation: ['일정한 학습 루틴 설정', '작은 목표부터 시작', '알림 설정 활용']
      })
    }

    // 성과 하락 위험
    const recentScores = recentReflections.map(r => r.overall_score || 0)
    const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
    
    if (avgScore < 5) {
      risks.push({
        factor: '지속적 성과 하락',
        severity: 'high',
        probability: 0.7,
        impact: 0.8,
        mitigation: ['학습 방법 재검토', '멘토링 요청', '목표 재설정']
      })
    }

    // 번아웃 위험
    const burnoutIndicators = recentReflections.filter(r => 
      r.condition === '매우피곤' || r.condition === '피곤'
    ).length

    if (burnoutIndicators > recentReflections.length * 0.6) {
      risks.push({
        factor: '학습 번아웃',
        severity: 'medium',
        probability: 0.6,
        impact: 0.6,
        mitigation: ['적절한 휴식', '학습량 조절', '스트레스 관리']
      })
    }

    return risks
  }

  private createDefaultPrediction(type: Prediction['type'], timeHorizon: number): Prediction {
    return {
      id: `default-${type}`,
      type,
      timeHorizon,
      prediction: 5,
      confidence: 0.3,
      trend: 'stable',
      factors: ['데이터 부족'],
      description: '충분한 데이터가 없어 예측이 제한적입니다.',
      recommendations: ['더 많은 데이터를 축적하세요.'],
      createdAt: new Date()
    }
  }

  async predictGoalAchievement(userId: string, goalType: string): Promise<GoalPrediction> {
    // 목표 달성 예측 (현재는 기본 구조만 제공)
    return {
      goalType,
      currentProgress: 0,
      predictedProgress: 0,
      achievementProbability: 0.5,
      estimatedCompletionDate: new Date(),
      requiredDailyProgress: 0
    }
  }

  async generateLearningTrajectory(userId: string, days = 30): Promise<LearningTrajectory[]> {
    const trajectory: LearningTrajectory[] = []
    const baseData = await this.getHistoricalPerformance(userId, 30)
    
    if (baseData.length === 0) return trajectory

    const { slope, intercept } = this.calculateLinearTrend(baseData)
    
    for (let i = 1; i <= days; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      const dayIndex = baseData.length + i
      const predictedScore = Math.max(0, Math.min(10, slope * dayIndex + intercept))
      
      // 불확실성 증가를 반영한 신뢰도
      const confidence = Math.max(0.2, 0.8 - (i / days) * 0.4)
      
      trajectory.push({
        date: date.toISOString().split('T')[0],
        predictedScore,
        confidence,
        factors: i <= 7 ? ['최근 패턴'] : ['장기 트렌드', '불확실성 증가']
      })
    }

    return trajectory
  }
}

export const predictor = new Predictor()