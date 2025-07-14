'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils/cn'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  Dot
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Download,
  Eye
} from 'lucide-react'

interface ProgressMilestone {
  date: string
  score: number
  type: 'achievement' | 'setback' | 'milestone'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
}

interface ProgressGoal {
  id: string
  title: string
  targetScore: number
  targetDate: string
  currentProgress: number
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved'
  description: string
}

interface ProgressTrackerProps {
  data: {
    daily: Array<{
      date: string
      score: number
      trend: number
      milestones?: ProgressMilestone[]
    }>
    goals: ProgressGoal[]
    summary: {
      totalDays: number
      averageScore: number
      improvement: number
      streak: number
      milestones: number
    }
  }
  loading?: boolean
  timeRange: string
  className?: string
}

export function ProgressTracker({ 
  data, 
  loading = false, 
  timeRange,
  className 
}: ProgressTrackerProps) {
  const [selectedPeriod, setSelectedPeriod] = React.useState('all')
  const [showMilestones, setShowMilestones] = React.useState(true)

  // 필터링된 데이터 계산
  const filteredData = React.useMemo(() => {
    if (selectedPeriod === 'all') return data.daily
    
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    }[selectedPeriod] || data.daily.length

    return data.daily.slice(-periodDays)
  }, [data.daily, selectedPeriod])

  // 트렌드 분석
  const trendAnalysis = React.useMemo(() => {
    if (filteredData.length < 2) return { trend: 'stable', percentage: 0 }
    
    const recent = filteredData.slice(-7).reduce((sum, d) => sum + d.score, 0) / 7
    const previous = filteredData.slice(-14, -7).reduce((sum, d) => sum + d.score, 0) / 7
    
    if (previous === 0) return { trend: 'stable', percentage: 0 }
    
    const change = ((recent - previous) / previous) * 100
    
    return {
      trend: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
      percentage: Math.abs(change)
    }
  }, [filteredData])

  // 목표 달성 예측
  const goalPredictions = React.useMemo(() => {
    return data.goals.map(goal => {
      const recentTrend = filteredData.slice(-14).reduce((sum, d) => sum + d.score, 0) / 14
      const targetDaysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      
      if (targetDaysLeft <= 0) {
        return { ...goal, prediction: 'expired', likelihood: 0 }
      }
      
      const projectedScore = recentTrend + (recentTrend * 0.1 * (targetDaysLeft / 30)) // 월 10% 성장 가정
      const likelihood = Math.min(Math.max((projectedScore / goal.targetScore) * 100, 0), 100)
      
      return {
        ...goal,
        prediction: likelihood > 80 ? 'likely' : likelihood > 50 ? 'possible' : 'unlikely',
        likelihood: Math.round(likelihood),
        projectedScore: Math.round(projectedScore * 10) / 10
      }
    })
  }, [data.goals, filteredData])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <BarChart3 className="h-4 w-4 text-blue-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600'
      case 'declining': return 'text-red-600'
      default: return 'text-blue-600'
    }
  }

  const getMilestoneIcon = (type: ProgressMilestone['type']) => {
    switch (type) {
      case 'achievement': return <Award className="h-3 w-3 text-yellow-600" />
      case 'milestone': return <Target className="h-3 w-3 text-blue-600" />
      case 'setback': return <AlertTriangle className="h-3 w-3 text-red-600" />
      default: return <CheckCircle className="h-3 w-3 text-gray-600" />
    }
  }

  const getGoalStatusColor = (status: ProgressGoal['status']) => {
    switch (status) {
      case 'achieved': return 'bg-green-100 text-green-800 border-green-200'
      case 'on_track': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'at_risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'behind': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getGoalStatusLabel = (status: ProgressGoal['status']) => {
    switch (status) {
      case 'achieved': return '달성'
      case 'on_track': return '순조'
      case 'at_risk': return '주의'
      case 'behind': return '지연'
      default: return '알 수 없음'
    }
  }

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'likely': return 'text-green-600'
      case 'possible': return 'text-yellow-600'
      case 'unlikely': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const milestones = data.milestones || []
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm">점수: {payload[0].value.toFixed(1)}</span>
            </div>
            {data.trend && (
              <div className="flex items-center gap-2">
                {getTrendIcon(data.trend > 0 ? 'improving' : data.trend < 0 ? 'declining' : 'stable')}
                <span className="text-xs text-muted-foreground">
                  트렌드: {data.trend > 0 ? '+' : ''}{data.trend.toFixed(1)}%
                </span>
              </div>
            )}
            {milestones.length > 0 && (
              <div className="pt-2 border-t">
                <div className="text-xs font-medium mb-1">이벤트</div>
                {milestones.map((milestone: ProgressMilestone, i: number) => (
                  <div key={i} className="flex items-center gap-1 text-xs">
                    {getMilestoneIcon(milestone.type)}
                    <span>{milestone.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  // 마일스톤 점 표시 컴포넌트
  const MilestoneDot = (props: any) => {
    const { cx, cy, payload } = props
    if (!payload.milestones || payload.milestones.length === 0) return null
    
    return (
      <Dot 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill="#EF4444" 
        stroke="#FFF" 
        strokeWidth={2}
      />
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="animate-pulse h-4 w-4 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">진행률 데이터 로딩 중...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* 진행률 요약 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                학습 진행률 추적
              </CardTitle>
              <CardDescription>{timeRange} 성장 궤적 및 목표 달성 현황</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedPeriod === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('7d')}
              >
                7일
              </Button>
              <Button
                variant={selectedPeriod === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('30d')}
              >
                30일
              </Button>
              <Button
                variant={selectedPeriod === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('all')}
              >
                전체
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{data.summary.totalDays}</div>
              <div className="text-sm text-blue-700">총 학습일</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{data.summary.averageScore.toFixed(1)}</div>
              <div className="text-sm text-green-700">평균 점수</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className={`text-2xl font-bold ${getTrendColor(trendAnalysis.trend)}`}>
                {data.summary.improvement > 0 ? '+' : ''}{data.summary.improvement.toFixed(1)}%
              </div>
              <div className="text-sm text-orange-700">성장률</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{data.summary.streak}</div>
              <div className="text-sm text-purple-700">연속 기록</div>
            </div>
          </div>

          {/* 진행률 차트 */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  domain={[0, 10]}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* 목표선 표시 */}
                {data.goals.map((goal, index) => (
                  <ReferenceLine 
                    key={goal.id} 
                    y={goal.targetScore} 
                    stroke="#EF4444" 
                    strokeDasharray="5 5"
                    label={{ value: goal.title, position: "right" }}
                  />
                ))}
                
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#progressGradient)"
                  dot={showMilestones ? <MilestoneDot /> : false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 트렌드 분석 */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTrendIcon(trendAnalysis.trend)}
                <span className="text-sm font-medium">현재 트렌드</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={trendAnalysis.trend === 'improving' ? 'default' : 
                               trendAnalysis.trend === 'declining' ? 'destructive' : 'secondary'}>
                  {trendAnalysis.trend === 'improving' ? '상승' : 
                   trendAnalysis.trend === 'declining' ? '하락' : '안정'}
                </Badge>
                <span className={`text-sm font-medium ${getTrendColor(trendAnalysis.trend)}`}>
                  {trendAnalysis.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 목표 달성 현황 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            목표 달성 현황
          </CardTitle>
          <CardDescription>설정된 목표의 진행 상황 및 달성 예측</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goalPredictions.map((goal) => (
              <div key={goal.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{goal.title}</h4>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                  <Badge className={getGoalStatusColor(goal.status)}>
                    {getGoalStatusLabel(goal.status)}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>진행률</span>
                    <span className="font-medium">{goal.currentProgress}%</span>
                  </div>
                  <Progress value={goal.currentProgress} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">목표 점수: </span>
                      <span className="font-medium">{goal.targetScore}점</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">목표 날짜: </span>
                      <span className="font-medium">
                        {new Date(goal.targetDate).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                  
                  {goal.prediction && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span>달성 예측</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getPredictionColor(goal.prediction)}`}>
                            {goal.likelihood}% 가능성
                          </span>
                          <span className="text-muted-foreground">
                            (예상: {'projectedScore' in goal ? goal.projectedScore : goal.targetScore}점)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 마일스톤 히스토리 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                학습 마일스톤
              </CardTitle>
              <CardDescription>주요 성취와 변화 시점들</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMilestones(!showMilestones)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showMilestones ? '숨기기' : '보기'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredData
              .flatMap(day => (day.milestones || []).map(milestone => ({ ...milestone, date: day.date })))
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((milestone, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="mt-1">
                    {getMilestoneIcon(milestone.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-sm">{milestone.title}</h5>
                        <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {new Date(milestone.date).toLocaleDateString('ko-KR')}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {milestone.impact === 'high' ? '높음' : 
                           milestone.impact === 'medium' ? '보통' : '낮음'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

ProgressTracker.displayName = 'ProgressTracker'