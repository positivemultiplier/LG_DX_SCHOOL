'use client'

import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { chartColors, chartTheme, customChartStyles, getTimePartColor } from '@/lib/chart-themes'
import { TrendingUp, TrendingDown, Minus, Target, Calendar } from 'lucide-react'

interface TrendData {
  date: string
  morning_score: number
  afternoon_score: number
  evening_score: number
  total_score: number
  efficiency: number
  consistency: number
  github_commits: number
}

interface LearningTrendChartProps {
  data: TrendData[]
  loading?: boolean
  title?: string
  description?: string
  chartType?: 'line' | 'area'
  showEfficiency?: boolean
  showConsistency?: boolean
  period?: string
  targetScore?: number
}

export function LearningTrendChart({ 
  data, 
  loading = false, 
  title = "학습 효율 트렌드", 
  description = "시간대별 학습 성과 변화 추이",
  chartType = 'area',
  showEfficiency = true,
  showConsistency = true,
  period = "최근 2주",
  targetScore = 7.5
}: LearningTrendChartProps) {

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">트렌드 분석 중...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">트렌드 데이터가 없습니다</div>
              <div className="text-xs text-muted-foreground">더 많은 리플렉션 데이터가 필요합니다</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 트렌드 분석
  const trendAnalysis = () => {
    if (data.length < 2) return { direction: 'stable', change: 0 }
    
    const recent = data.slice(-3).map(d => d.total_score)
    const previous = data.slice(-6, -3).map(d => d.total_score)
    
    const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length
    const previousAvg = previous.reduce((sum, score) => sum + score, 0) / previous.length
    
    const change = recentAvg - previousAvg
    const direction = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable'
    
    return { direction, change: Math.round(change * 10) / 10 }
  }

  const trend = trendAnalysis()

  // 통계 계산
  const stats = {
    avgTotal: Math.round(data.reduce((sum, d) => sum + d.total_score, 0) / data.length * 10) / 10,
    avgEfficiency: Math.round(data.reduce((sum, d) => sum + d.efficiency, 0) / data.length * 10) / 10,
    avgConsistency: Math.round(data.reduce((sum, d) => sum + d.consistency, 0) / data.length * 10) / 10,
    maxScore: Math.max(...data.map(d => d.total_score)),
    totalCommits: data.reduce((sum, d) => sum + d.github_commits, 0)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload
      
      return (
        <div 
          className="bg-white p-3 border rounded-lg shadow-lg"
          style={{
            backgroundColor: chartTheme.tooltip.backgroundColor,
            color: chartTheme.tooltip.color,
            border: chartTheme.tooltip.border,
            borderRadius: chartTheme.tooltip.borderRadius,
            fontSize: chartTheme.tooltip.fontSize,
            padding: chartTheme.tooltip.padding
          }}
        >
          <p className="font-semibold mb-2">{new Date(label).toLocaleDateString()}</p>
          
          {payload.map((entry: any, index: number) => {
            if (entry.dataKey.includes('score')) {
              const timePart = entry.dataKey.replace('_score', '')
              const timePartName = {
                morning: '🌅 오전',
                afternoon: '🌞 오후', 
                evening: '🌙 저녁',
                total: '📊 종합'
              }[timePart] || timePart
              
              return (
                <p 
                  key={index} 
                  style={{ color: entry.color }}
                  className="text-sm"
                >
                  {timePartName}: {entry.value}/10
                </p>
              )
            }
            return null
          })}
          
          {data && (
            <div className="mt-2 pt-2 border-t border-gray-600 space-y-1">
              <p className="text-xs text-gray-300">
                효율성: {data.efficiency}/10
              </p>
              <p className="text-xs text-gray-300">
                일관성: {data.consistency}/10
              </p>
              <p className="text-xs text-gray-300">
                커밋: {data.github_commits}개
              </p>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  const formatXAxisLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = () => {
    switch (trend.direction) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const Chart = chartType === 'area' ? AreaChart : LineChart

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {title}
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {trend.change > 0 ? '+' : ''}{trend.change}
            </span>
          </div>
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>{description}</span>
          <Badge variant="outline" className="text-xs">{period}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 요약 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center space-y-1">
            <div className="text-lg font-bold text-blue-600">{stats.avgTotal}</div>
            <div className="text-xs text-muted-foreground">평균 점수</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-lg font-bold text-green-600">{stats.avgEfficiency}</div>
            <div className="text-xs text-muted-foreground">효율성</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-lg font-bold text-orange-600">{stats.avgConsistency}</div>
            <div className="text-xs text-muted-foreground">일관성</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-lg font-bold text-purple-600">{stats.maxScore}</div>
            <div className="text-xs text-muted-foreground">최고 점수</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-lg font-bold text-gray-600">{stats.totalCommits}</div>
            <div className="text-xs text-muted-foreground">총 커밋</div>
          </div>
        </div>

        {/* 차트 */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <Chart data={data} margin={chartTheme.defaults.margin}>
              <CartesianGrid 
                strokeDasharray={chartTheme.grid.strokeDasharray}
                stroke={chartTheme.grid.stroke}
              />
              <XAxis 
                dataKey="date"
                tickFormatter={formatXAxisLabel}
                tick={{
                  fontSize: chartTheme.axis.tick.fontSize,
                  fill: chartTheme.axis.tick.fill
                }}
                stroke={chartTheme.axis.stroke}
              />
              <YAxis 
                domain={[0, 10]}
                tick={{
                  fontSize: chartTheme.axis.tick.fontSize,
                  fill: chartTheme.axis.tick.fill
                }}
                stroke={chartTheme.axis.stroke}
              />
              
              {/* 목표선 */}
              <ReferenceLine 
                y={targetScore} 
                stroke={chartColors.status.pending}
                strokeDasharray="5 5"
                label={{ value: "목표", position: "right" }}
              />
              
              {chartType === 'area' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="morning_score"
                    stackId="1"
                    stroke={chartColors.timeParts.morning}
                    fill={chartColors.timeParts.morning}
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="afternoon_score"
                    stackId="1"
                    stroke={chartColors.timeParts.afternoon}
                    fill={chartColors.timeParts.afternoon}
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="evening_score"
                    stackId="1"
                    stroke={chartColors.timeParts.evening}
                    fill={chartColors.timeParts.evening}
                    fillOpacity={0.3}
                  />
                </>
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey="morning_score"
                    stroke={chartColors.timeParts.morning}
                    strokeWidth={customChartStyles.trend.line.strokeWidth}
                    dot={{
                      ...customChartStyles.trend.dot,
                      stroke: chartColors.timeParts.morning
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="afternoon_score"
                    stroke={chartColors.timeParts.afternoon}
                    strokeWidth={customChartStyles.trend.line.strokeWidth}
                    dot={{
                      ...customChartStyles.trend.dot,
                      stroke: chartColors.timeParts.afternoon
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="evening_score"
                    stroke={chartColors.timeParts.evening}
                    strokeWidth={customChartStyles.trend.line.strokeWidth}
                    dot={{
                      ...customChartStyles.trend.dot,
                      stroke: chartColors.timeParts.evening
                    }}
                  />
                </>
              )}
              
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{
                  fontSize: chartTheme.legend.fontSize,
                  color: chartTheme.legend.fill,
                  paddingTop: '20px'
                }}
              />
            </Chart>
          </ResponsiveContainer>
        </div>

        {/* 인사이트 */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            트렌드 인사이트
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getTrendIcon()}
                <span className="font-medium">
                  {trend.direction === 'up' && '성과가 향상되고 있습니다'}
                  {trend.direction === 'down' && '성과 개선이 필요합니다'}
                  {trend.direction === 'stable' && '안정적인 학습을 유지 중입니다'}
                </span>
              </div>
              <div className="text-muted-foreground">
                최근 평균: {stats.avgTotal}/10 (목표: {targetScore}/10)
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">학습 효율성:</span>
                <span className="font-medium">{stats.avgEfficiency}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">학습 일관성:</span>
                <span className="font-medium">{stats.avgConsistency}/10</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function generateSampleTrendData(days: number = 14): TrendData[] {
  const data: TrendData[] = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // 주말에는 낮은 점수
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const baseScore = isWeekend ? 5 : 7
    
    const morning = Math.min(10, Math.max(1, baseScore + Math.random() * 3 - 1))
    const afternoon = Math.min(10, Math.max(1, baseScore + Math.random() * 3 - 1))  
    const evening = Math.min(10, Math.max(1, baseScore + Math.random() * 3 - 1))
    
    const total = (morning + afternoon + evening) / 3
    const efficiency = Math.min(10, Math.max(1, total + Math.random() * 2 - 1))
    const consistency = Math.min(10, Math.max(1, 10 - Math.abs(morning - afternoon) - Math.abs(afternoon - evening)))
    
    data.push({
      date: date.toISOString().split('T')[0],
      morning_score: Math.round(morning * 10) / 10,
      afternoon_score: Math.round(afternoon * 10) / 10,
      evening_score: Math.round(evening * 10) / 10,
      total_score: Math.round(total * 10) / 10,
      efficiency: Math.round(efficiency * 10) / 10,
      consistency: Math.round(consistency * 10) / 10,
      github_commits: Math.floor(Math.random() * 8)
    })
  }
  
  return data
}