// Analytics Engine Exports
import { insightsEngine } from './insights-engine'
import { patternAnalyzer } from './pattern-analyzer'
import { predictor } from './predictor'
import { recommender } from './recommender'

export { InsightsEngine, insightsEngine } from './insights-engine'
export type { 
  AnalyticsInsight, 
  LearningMetrics, 
  TimePartPerformance 
} from './insights-engine'

export { PatternAnalyzer, patternAnalyzer } from './pattern-analyzer'
export type { 
  LearningPattern, 
  SchedulePattern, 
  SubjectPattern, 
  ProductivityPattern, 
  HabitPattern 
} from './pattern-analyzer'

export { Predictor, predictor } from './predictor'
export type { 
  Prediction, 
  GoalPrediction, 
  RiskFactor, 
  LearningTrajectory 
} from './predictor'

export { Recommender, recommender } from './recommender'
export type { 
  Recommendation, 
  ScheduleRecommendation, 
  MethodRecommendation, 
  PersonalizedPlan 
} from './recommender'

// Unified Analytics API
export class AnalyticsEngine {
  constructor(
    private insights = insightsEngine,
    private patterns = patternAnalyzer,
    private predictions = predictor,
    private recommendations = recommender
  ) {}

  // 종합 분석 대시보드 데이터
  async getComprehensiveAnalysis(userId: string) {
    const [insights, patterns, predictions, recommendations] = await Promise.all([
      this.insights.generateInsights(userId),
      this.patterns.analyzeAllPatterns(userId),
      this.predictions.generatePredictions(userId),
      this.recommendations.generateRecommendations(userId)
    ])

    return {
      insights: insights.slice(0, 10), // 상위 10개 인사이트
      patterns: patterns.slice(0, 8),   // 상위 8개 패턴
      predictions: predictions.slice(0, 5), // 상위 5개 예측
      recommendations: recommendations.slice(0, 6), // 상위 6개 추천
      summary: {
        totalInsights: insights.length,
        strongPatterns: patterns.filter(p => p.strength > 0.7).length,
        highConfidencePredictions: predictions.filter(p => p.confidence > 0.8).length,
        actionableRecommendations: recommendations.filter(r => r.priority === 'high').length
      }
    }
  }

  // 빠른 개선 제안
  async getQuickWins(userId: string) {
    return this.recommendations.getQuickWins(userId)
  }

  // 위험 요소 감지
  async getRiskAssessment(userId: string) {
    const predictions = await this.predictions.generatePredictions(userId)
    const riskPredictions = predictions.filter(p => p.type === 'risk')
    
    return {
      risks: riskPredictions,
      riskLevel: this.calculateOverallRiskLevel(riskPredictions),
      mitigationActions: riskPredictions.flatMap(r => r.recommendations)
    }
  }

  // 성장 경로 추천
  async getGrowthPath(userId: string, timeHorizon = 30) {
    const [patterns, predictions, recommendations] = await Promise.all([
      this.patterns.getStrongestPatterns(userId, 5),
      this.predictions.generateLearningTrajectory(userId, timeHorizon),
      this.recommendations.generatePersonalizedPlan(userId, timeHorizon)
    ])

    return {
      currentStrengths: patterns,
      projectedGrowth: predictions,
      actionPlan: recommendations,
      milestones: this.generateMilestones(predictions, timeHorizon)
    }
  }

  private calculateOverallRiskLevel(riskPredictions: any[]): 'low' | 'medium' | 'high' {
    if (riskPredictions.length === 0) return 'low'
    
    const avgRiskScore = riskPredictions.reduce((sum, r) => sum + r.prediction, 0) / riskPredictions.length
    
    if (avgRiskScore > 70) return 'high'
    if (avgRiskScore > 40) return 'medium'
    return 'low'
  }

  private generateMilestones(trajectory: any[], timeHorizon: number) {
    const milestones = []
    const intervals = [7, 14, 21, 30].filter(day => day <= timeHorizon)
    
    for (const day of intervals) {
      const projection = trajectory.find(t => new Date(t.date).getTime() === new Date(Date.now() + day * 24 * 60 * 60 * 1000).getTime())
      if (projection) {
        milestones.push({
          day,
          goal: `평균 점수 ${projection.predictedScore.toFixed(1)}점 달성`,
          confidence: projection.confidence
        })
      }
    }
    
    return milestones
  }
}

export const analyticsEngine = new AnalyticsEngine()