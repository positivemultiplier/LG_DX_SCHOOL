'use client'

import { useAuthContext } from '@/components/providers/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useState, useEffect } from 'react'
import { analyticsEngine } from '@/lib/analytics'
import type { AnalyticsInsight, LearningPattern, Prediction, Recommendation } from '@/lib/analytics'
import Link from 'next/link'
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Calendar,
  BarChart3,
  ArrowLeft,
  RefreshCw,
  Zap,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react'

interface InsightsData {
  insights: AnalyticsInsight[]
  patterns: LearningPattern[]
  predictions: Prediction[]
  recommendations: Recommendation[]
  summary: {
    totalInsights: number
    strongPatterns: number
    highConfidencePredictions: number
    actionableRecommendations: number
  }
}

export default function InsightsPage() {
  const { user, loading: authLoading } = useAuthContext()
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user) {
      loadInsightsData()
    }
  }, [user])

  const loadInsightsData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const insightsData = await analyticsEngine.getComprehensiveAnalysis(user.id)
      setData(insightsData)
    } catch (error) {
      console.error('인사이트 데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    loadInsightsData()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg">인사이트 분석 중...</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <div className="text-lg">데이터를 불러올 수 없습니다</div>
          <Button onClick={refreshData} className="mt-4">
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  const getInsightIcon = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'performance': return <TrendingUp className="h-4 w-4" />
      case 'pattern': return <Activity className="h-4 w-4" />
      case 'recommendation': return <Lightbulb className="h-4 w-4" />
      case 'prediction': return <Target className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: AnalyticsInsight['type'], priority: string) => {
    if (type === 'warning') return 'border-red-200 bg-red-50'
    if (priority === 'high') return 'border-blue-200 bg-blue-50'
    if (priority === 'medium') return 'border-green-200 bg-green-50'
    return 'border-gray-200 bg-gray-50'
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">높음</Badge>
      case 'medium': return <Badge variant="secondary">보통</Badge>
      case 'low': return <Badge variant="outline">낮음</Badge>
      default: return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/analytics" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  분석으로
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  AI 학습 인사이트
                </h1>
                <p className="text-sm text-gray-600">
                  개인화된 학습 분석과 성장 가이드
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={refreshData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* 요약 대시보드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{data.summary.totalInsights}</div>
                <div className="text-xs text-muted-foreground">총 인사이트</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{data.summary.strongPatterns}</div>
                <div className="text-xs text-muted-foreground">강한 패턴</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{data.summary.highConfidencePredictions}</div>
                <div className="text-xs text-muted-foreground">신뢰도 높은 예측</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{data.summary.actionableRecommendations}</div>
                <div className="text-xs text-muted-foreground">실행 가능한 추천</div>
              </CardContent>
            </Card>
          </div>

          {/* 탭 메뉴 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                핵심 인사이트
              </TabsTrigger>
              <TabsTrigger value="patterns" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                학습 패턴
              </TabsTrigger>
              <TabsTrigger value="predictions" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                성과 예측
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                맞춤 추천
              </TabsTrigger>
            </TabsList>

            {/* 핵심 인사이트 탭 */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.insights.slice(0, 8).map((insight, index) => (
                  <Card key={insight.id} className={getInsightColor(insight.type, insight.priority)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getInsightIcon(insight.type)}
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(insight.trend)}
                          {getPriorityBadge(insight.priority)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                      
                      {insight.value !== undefined && (
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">현재 값</span>
                          <span className="text-lg font-bold">
                            {insight.value.toFixed(1)}
                            {insight.change !== undefined && (
                              <span className={`text-sm ml-2 ${insight.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ({insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)})
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>신뢰도: {(insight.confidence * 100).toFixed(0)}%</span>
                        <span>{insight.actionable ? '실행 가능' : '참고용'}</span>
                      </div>
                      
                      <Progress value={insight.confidence * 100} className="mt-2 h-1" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* 학습 패턴 탭 */}
            <TabsContent value="patterns" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.patterns.map((pattern, index) => (
                  <Card key={pattern.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{pattern.name}</CardTitle>
                          <CardDescription>{pattern.description}</CardDescription>
                        </div>
                        <Badge variant="outline">{pattern.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">패턴 강도</span>
                          <span className="text-lg font-bold text-blue-600">
                            {(pattern.strength * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={pattern.strength * 100} className="h-2" />
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">발생 빈도</div>
                            <div className="font-medium">{(pattern.frequency * 100).toFixed(0)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-500">일관성</div>
                            <div className="font-medium">{(pattern.consistency * 100).toFixed(0)}%</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                          <span>첫 발견: {new Date(pattern.firstDetected).toLocaleDateString()}</span>
                          <span>트렌드: {pattern.trend}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* 성과 예측 탭 */}
            <TabsContent value="predictions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.predictions.map((prediction, index) => (
                  <Card key={prediction.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {getInsightIcon(prediction.type)}
                            {prediction.description.split(' ')[0]} 예측
                          </CardTitle>
                          <CardDescription>{prediction.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(prediction.trend)}
                          <Badge variant="outline">{prediction.timeHorizon}일 후</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">예측 값</span>
                          <span className="text-2xl font-bold text-green-600">
                            {prediction.prediction.toFixed(1)}
                            {prediction.type === 'score' && '/10'}
                            {prediction.type === 'productivity' && '%'}
                            {prediction.type === 'consistency' && '%'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">신뢰도</span>
                          <span className="font-medium">{(prediction.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={prediction.confidence * 100} className="h-2" />
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium">주요 요인</div>
                          <div className="flex flex-wrap gap-1">
                            {prediction.factors.map((factor, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{factor}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        {prediction.recommendations.length > 0 && (
                          <div className="space-y-2 pt-2 border-t">
                            <div className="text-sm font-medium">추천 액션</div>
                            <div className="space-y-1">
                              {prediction.recommendations.slice(0, 2).map((rec, i) => (
                                <div key={i} className="text-xs p-2 bg-blue-50 rounded text-blue-700">
                                  {rec}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* 맞춤 추천 탭 */}
            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.recommendations.map((rec, index) => (
                  <Card key={rec.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {getInsightIcon('recommendation')}
                            {rec.title}
                          </CardTitle>
                          <CardDescription>{rec.description}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getPriorityBadge(rec.priority)}
                          <Badge variant="outline">{rec.category}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium mb-1">추천 이유</div>
                          <div className="text-xs text-gray-600">{rec.rationale}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">예상 효과</div>
                            <div className="font-medium text-green-600">
                              {(rec.expectedImpact * 100).toFixed(0)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">구현 난이도</div>
                            <div className="font-medium text-orange-600">
                              {(rec.implementationDifficulty * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium">실행 단계</div>
                          <div className="space-y-1">
                            {rec.actionItems.slice(0, 3).map((action, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {rec.timeToSeeResults}일 후 효과 확인
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {rec.tags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}