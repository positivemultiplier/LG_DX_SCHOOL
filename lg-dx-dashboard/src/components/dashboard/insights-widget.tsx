'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { analyticsEngine } from '@/lib/analytics'
import type { AnalyticsInsight, Recommendation } from '@/lib/analytics'
import Link from 'next/link'
import { 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  AlertTriangle,
  Zap,
  ArrowRight,
  RefreshCw
} from 'lucide-react'

interface InsightsWidgetProps {
  userId: string
}

export function InsightsWidget({ userId }: InsightsWidgetProps) {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([])
  const [quickWins, setQuickWins] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadInsightsData()
    }
  }, [userId])

  const loadInsightsData = async () => {
    try {
      setLoading(true)
      const [comprehensiveData, quickWinsData] = await Promise.all([
        analyticsEngine.getComprehensiveAnalysis(userId),
        analyticsEngine.getQuickWins(userId)
      ])
      
      setInsights(comprehensiveData.insights.slice(0, 3)) // 상위 3개만
      setQuickWins(quickWinsData.slice(0, 2)) // 상위 2개만
    } catch (error) {
      console.error('인사이트 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'performance': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'pattern': return <Brain className="h-4 w-4 text-blue-600" />
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-yellow-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Brain className="h-4 w-4 text-purple-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-500'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI 인사이트
          </CardTitle>
          <CardDescription>학습 패턴 분석 중...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI 인사이트
            </CardTitle>
            <CardDescription>개인화된 학습 분석 결과</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/analytics/insights">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 주요 인사이트 */}
          {insights.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">주요 발견사항</div>
              {insights.map((insight, index) => (
                <div 
                  key={insight.id} 
                  className={`p-3 bg-gray-50 rounded-lg border-l-4 ${getPriorityColor(insight.priority)}`}
                >
                  <div className="flex items-start gap-2">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{insight.title}</div>
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {insight.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {insight.priority}
                        </Badge>
                        {insight.confidence && (
                          <span className="text-xs text-gray-500">
                            신뢰도: {(insight.confidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Brain className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-500">
                아직 분석할 데이터가 부족합니다
              </div>
            </div>
          )}

          {/* 즉시 적용 가능한 개선사항 */}
          {quickWins.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-yellow-500" />
                <div className="text-sm font-medium text-gray-700">즉시 개선 가능</div>
                <Badge variant="secondary" className="text-xs">
                  {quickWins.length}개
                </Badge>
              </div>
              
              <div className="space-y-2">
                {quickWins.map((rec, index) => (
                  <div key={rec.id} className="p-2 bg-yellow-50 rounded border-l-4 border-l-yellow-400">
                    <div className="text-sm font-medium">{rec.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{rec.description}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-green-600">
                        효과: {(rec.expectedImpact * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs text-blue-600">
                        {rec.timeToSeeResults}일 후 확인
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="border-t pt-4">
            <Button asChild size="sm" className="w-full">
              <Link href="/analytics/insights">
                <Brain className="h-4 w-4 mr-2" />
                전체 인사이트 보기
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface QuickInsightsSummaryProps {
  userId: string
}

export function QuickInsightsSummary({ userId }: QuickInsightsSummaryProps) {
  const [summary, setSummary] = useState({
    totalInsights: 0,
    highPriorityCount: 0,
    recommendationsCount: 0,
    riskLevel: 'low' as 'low' | 'medium' | 'high'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadSummaryData()
    }
  }, [userId])

  const loadSummaryData = async () => {
    try {
      setLoading(true)
      const [comprehensiveData, riskData] = await Promise.all([
        analyticsEngine.getComprehensiveAnalysis(userId),
        analyticsEngine.getRiskAssessment(userId)
      ])
      
      setSummary({
        totalInsights: comprehensiveData.summary.totalInsights,
        highPriorityCount: comprehensiveData.summary.actionableRecommendations,
        recommendationsCount: comprehensiveData.recommendations.length,
        riskLevel: riskData.riskLevel
      })
    } catch (error) {
      console.error('요약 데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'high': return '높음'
      case 'medium': return '보통'
      case 'low': return '낮음'
      default: return '알 수 없음'
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
              <div className="w-12 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{summary.totalInsights}</div>
          <div className="text-xs text-muted-foreground">총 인사이트</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{summary.highPriorityCount}</div>
          <div className="text-xs text-muted-foreground">긴급 액션</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{summary.recommendationsCount}</div>
          <div className="text-xs text-muted-foreground">추천 사항</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className={`text-2xl font-bold ${getRiskColor(summary.riskLevel)}`}>
            {getRiskLabel(summary.riskLevel)}
          </div>
          <div className="text-xs text-muted-foreground">위험 수준</div>
        </CardContent>
      </Card>
    </div>
  )
}