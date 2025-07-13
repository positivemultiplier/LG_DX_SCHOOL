'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Prediction, LearningTrajectory } from '@/lib/analytics'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  Activity,
  Calendar,
  BarChart3,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts'

interface TrendPredictionsProps {
  predictions: Prediction[]
  trajectory?: LearningTrajectory[]
  showCharts?: boolean
}

export function TrendPredictions({ predictions, trajectory = [], showCharts = true }: TrendPredictionsProps) {
  const getTypeIcon = (type: Prediction['type']) => {
    switch (type) {
      case 'score': return <BarChart3 className="h-4 w-4" />
      case 'productivity': return <Zap className="h-4 w-4" />
      case 'consistency': return <Activity className="h-4 w-4" />
      case 'goal_achievement': return <Target className="h-4 w-4" />
      case 'risk': return <AlertTriangle className="h-4 w-4" />
      default: return <TrendingUp className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: Prediction['type']) => {
    switch (type) {
      case 'score': return '성과 점수'
      case 'productivity': return '생산성'
      case 'consistency': return '일관성'
      case 'goal_achievement': return '목표 달성률'
      case 'risk': return '위험 요소'
      default: return '예측'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />
      default: return null
    }
  }

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return { label: '매우 높음', color: 'text-green-600' }
    if (confidence >= 0.6) return { label: '높음', color: 'text-blue-600' }
    if (confidence >= 0.4) return { label: '보통', color: 'text-yellow-600' }
    return { label: '낮음', color: 'text-red-600' }
  }

  const formatPredictionValue = (prediction: Prediction) => {
    const value = prediction.prediction.toFixed(1)
    switch (prediction.type) {
      case 'score': return `${value}/10`
      case 'productivity': 
      case 'consistency':
      case 'goal_achievement': return `${value}%`
      case 'risk': return `${value}% 위험도`
      default: return value
    }
  }

  const getPredictionColor = (type: Prediction['type'], trend: string) => {
    if (type === 'risk') return 'border-red-200 bg-red-50'
    if (trend === 'up') return 'border-green-200 bg-green-50'
    if (trend === 'down') return 'border-orange-200 bg-orange-50'
    return 'border-blue-200 bg-blue-50'
  }

  // 차트 데이터 준비
  const chartData = trajectory.map((point, index) => ({
    day: `${index + 1}일`,
    score: point.predictedScore,
    confidence: point.confidence * 100,
    date: point.date
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-sm text-blue-600">
            예상 점수: {data.score.toFixed(1)}/10
          </div>
          <div className="text-xs text-gray-500">
            신뢰도: {data.confidence.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-400">
            {new Date(data.date).toLocaleDateString()}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* 예측 트렌드 차트 */}
      {showCharts && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              학습 성과 예측 트렌드
            </CardTitle>
            <CardDescription>
              향후 30일간 예상되는 학습 성과 변화
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    domain={[0, 10]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={7} stroke="#10b981" strokeDasharray="5 5" />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-xs text-gray-500 text-center">
              녹색 점선: 목표 점수 (7.0점)
            </div>
          </CardContent>
        </Card>
      )}

      {/* 예측 카드들 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {predictions.map((prediction) => {
          const confidenceLevel = getConfidenceLevel(prediction.confidence)
          
          return (
            <Card key={prediction.id} className={getPredictionColor(prediction.type, prediction.trend)}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(prediction.type)}
                    <div>
                      <CardTitle className="text-lg">
                        {getTypeLabel(prediction.type)} 예측
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {prediction.timeHorizon}일 후 예상 결과
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(prediction.trend)}
                    <Badge variant="outline" className="text-xs">
                      {prediction.timeHorizon}일
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* 예측 값 */}
                <div className="mb-4">
                  <div className="text-center mb-2">
                    <div className="text-3xl font-bold text-blue-600">
                      {formatPredictionValue(prediction)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {prediction.description}
                    </div>
                  </div>
                </div>

                {/* 신뢰도 */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">예측 신뢰도</span>
                    <span className={`text-sm font-medium ${confidenceLevel.color}`}>
                      {confidenceLevel.label}
                    </span>
                  </div>
                  <Progress value={prediction.confidence * 100} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">
                    {(prediction.confidence * 100).toFixed(0)}%
                  </div>
                </div>

                {/* 주요 요인 */}
                {prediction.factors.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">영향 요인</div>
                    <div className="flex flex-wrap gap-1">
                      {prediction.factors.map((factor, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 추천 액션 */}
                {prediction.recommendations.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">권장 액션</div>
                    <div className="space-y-2">
                      {prediction.recommendations.slice(0, 2).map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs p-2 bg-white/50 rounded">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 메타데이터 */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(prediction.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span>
                    {prediction.type === 'risk' ? '위험 예측' : '성장 예측'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 예측 요약 */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">예측 요약</CardTitle>
            <CardDescription>
              모든 예측 결과의 종합 분석
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {predictions.filter(p => p.trend === 'up').length}
                </div>
                <div className="text-xs text-green-700">상승 예측</div>
              </div>
              
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">
                  {predictions.filter(p => p.trend === 'down').length}
                </div>
                <div className="text-xs text-red-700">하락 예측</div>
              </div>
              
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {predictions.filter(p => p.trend === 'stable').length}
                </div>
                <div className="text-xs text-blue-700">안정 예측</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-purple-700">평균 신뢰도</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium mb-1">전체 전망</div>
              <div className="text-xs text-gray-600">
                {predictions.filter(p => p.trend === 'up').length > predictions.filter(p => p.trend === 'down').length
                  ? '전반적으로 긍정적인 성장 전망을 보이고 있습니다. 현재의 학습 패턴을 유지하면서 추가 개선 사항을 적용해보세요.'
                  : '일부 영역에서 주의가 필요합니다. 추천 액션을 참고하여 학습 방법을 조정해보세요.'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface RiskAssessmentProps {
  predictions: Prediction[]
}

export function RiskAssessment({ predictions }: RiskAssessmentProps) {
  const riskPredictions = predictions.filter(p => p.type === 'risk')
  
  if (riskPredictions.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-900 mb-2">안전 상태</h3>
          <p className="text-sm text-green-700">
            현재 학습 패턴에서 특별한 위험 요소가 발견되지 않았습니다.
          </p>
        </CardContent>
      </Card>
    )
  }

  const highRisks = riskPredictions.filter(r => r.prediction > 70)
  const mediumRisks = riskPredictions.filter(r => r.prediction > 40 && r.prediction <= 70)
  const lowRisks = riskPredictions.filter(r => r.prediction <= 40)

  return (
    <div className="space-y-4">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertTriangle className="h-5 w-5" />
            위험 요소 분석
          </CardTitle>
          <CardDescription className="text-red-700">
            학습 성과에 부정적 영향을 줄 수 있는 요소들을 식별했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-red-100 rounded">
              <div className="text-lg font-bold text-red-700">{highRisks.length}</div>
              <div className="text-xs text-red-600">높은 위험</div>
            </div>
            <div className="text-center p-3 bg-yellow-100 rounded">
              <div className="text-lg font-bold text-yellow-700">{mediumRisks.length}</div>
              <div className="text-xs text-yellow-600">보통 위험</div>
            </div>
            <div className="text-center p-3 bg-green-100 rounded">
              <div className="text-lg font-bold text-green-700">{lowRisks.length}</div>
              <div className="text-xs text-green-600">낮은 위험</div>
            </div>
          </div>
          
          <div className="space-y-3">
            {riskPredictions.map((risk) => (
              <div key={risk.id} className="p-3 bg-white rounded border-l-4 border-red-400">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-sm">{risk.description}</div>
                  <Badge variant="destructive" className="text-xs">
                    {risk.prediction.toFixed(0)}%
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  {risk.recommendations.slice(0, 2).map((rec, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <span className="text-blue-600">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}