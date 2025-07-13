'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { AnalyticsInsight } from '@/lib/analytics'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  Brain,
  Star,
  CheckCircle
} from 'lucide-react'

interface InsightCardsProps {
  insights: AnalyticsInsight[]
  maxItems?: number
  showMetrics?: boolean
}

export function InsightCards({ insights, maxItems = 6, showMetrics = true }: InsightCardsProps) {
  const displayInsights = insights.slice(0, maxItems)

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
      case 'high': 
        return <Badge variant="destructive" className="text-xs">높음</Badge>
      case 'medium': 
        return <Badge variant="secondary" className="text-xs">보통</Badge>
      case 'low': 
        return <Badge variant="outline" className="text-xs">낮음</Badge>
      default: 
        return <Badge variant="outline" className="text-xs">{priority}</Badge>
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

  const getTypeLabel = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'performance': return '성과 분석'
      case 'pattern': return '패턴 발견'
      case 'recommendation': return '추천 사항'
      case 'prediction': return '예측 결과'
      case 'warning': return '주의 사항'
      default: return '인사이트'
    }
  }

  if (displayInsights.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-full">
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">아직 인사이트가 없습니다</h3>
            <p className="text-sm text-gray-500">
              더 많은 학습 데이터가 축적되면 개인화된 인사이트를 제공해드립니다.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {displayInsights.map((insight, index) => (
        <Card key={insight.id} className={getInsightColor(insight.type, insight.priority)}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getInsightIcon(insight.type)}
                <div>
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {getTypeLabel(insight.type)}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(insight.trend)}
                {getPriorityBadge(insight.priority)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">{insight.description}</p>
            
            {showMetrics && (
              <>
                {insight.value !== undefined && (
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">현재 값</span>
                    <div className="text-right">
                      <span className="text-lg font-bold">
                        {typeof insight.value === 'number' 
                          ? insight.value.toFixed(1) 
                          : insight.value
                        }
                      </span>
                      {insight.change !== undefined && (
                        <span className={`text-sm ml-2 ${
                          insight.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ({insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)})
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">신뢰도</span>
                    <span className="font-medium">
                      {(insight.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={insight.confidence * 100} className="h-2" />
                </div>
              </>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-3 border-t">
              <div className="flex items-center gap-2">
                {insight.actionable ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <Star className="h-3 w-3 text-yellow-600" />
                )}
                <span>{insight.actionable ? '실행 가능' : '참고용'}</span>
              </div>
              <span>{new Date(insight.generatedAt).toLocaleDateString()}</span>
            </div>
            
            {insight.metadata && Object.keys(insight.metadata).length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs text-gray-500 mb-2">상세 정보</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(insight.metadata).slice(0, 3).map(([key, value], i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {key}: {String(value).slice(0, 10)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface QuickInsightsSummaryProps {
  insights: AnalyticsInsight[]
}

export function QuickInsightsSummary({ insights }: QuickInsightsSummaryProps) {
  const highPriorityInsights = insights.filter(i => i.priority === 'high')
  const warnings = insights.filter(i => i.type === 'warning')
  const recommendations = insights.filter(i => i.type === 'recommendation' && i.actionable)
  
  const avgConfidence = insights.length > 0 
    ? insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length 
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{highPriorityInsights.length}</div>
          <div className="text-xs text-muted-foreground">긴급 인사이트</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{warnings.length}</div>
          <div className="text-xs text-muted-foreground">주의 사항</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{recommendations.length}</div>
          <div className="text-xs text-muted-foreground">실행 가능한 추천</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {(avgConfidence * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">평균 신뢰도</div>
        </CardContent>
      </Card>
    </div>
  )
}