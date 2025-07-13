'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUp,
  ArrowDown,
  Equal
} from 'lucide-react'

interface ComparisonData {
  current: {
    label: string
    overall: number
    morning: number
    afternoon: number
    evening: number
    github: number
    consistency: number
  }
  previous: {
    label: string
    overall: number
    morning: number
    afternoon: number
    evening: number
    github: number
    consistency: number
  }
}

interface ComparisonChartProps {
  data: ComparisonData
  loading?: boolean
  title?: string
  description?: string
  className?: string
  showGitHub?: boolean
  chartType?: 'bar' | 'composed'
}

export function ComparisonChart({
  data,
  loading = false,
  title = "기간별 성과 비교",
  description = "이번 기간과 이전 기간의 주요 지표 비교",
  className,
  showGitHub = true,
  chartType = 'bar'
}: ComparisonChartProps) {
  
  // 차트 데이터 변환
  const chartData = React.useMemo(() => {
    const metrics = [
      { 
        category: '오전수업', 
        current: data.current.morning, 
        previous: data.previous.morning,
        key: 'morning'
      },
      { 
        category: '오후수업', 
        current: data.current.afternoon, 
        previous: data.previous.afternoon,
        key: 'afternoon'
      },
      { 
        category: '저녁자율학습', 
        current: data.current.evening, 
        previous: data.previous.evening,
        key: 'evening'
      },
      { 
        category: '일관성', 
        current: data.current.consistency, 
        previous: data.previous.consistency,
        key: 'consistency'
      }
    ]

    if (showGitHub) {
      metrics.push({
        category: 'GitHub',
        current: Math.min(data.current.github / 10, 10), // 정규화 (0-10 범위)
        previous: Math.min(data.previous.github / 10, 10),
        key: 'github'
      })
    }

    return metrics
  }, [data, showGitHub])

  // 개선/악화 계산
  const calculateChange = (current: number, previous: number) => {
    const change = current - previous
    const percentage = previous > 0 ? (change / previous) * 100 : 0
    return { change, percentage }
  }

  const getChangeIcon = (change: number) => {
    if (change > 0.5) return <ArrowUp className="h-3 w-3 text-green-600" />
    if (change < -0.5) return <ArrowDown className="h-3 w-3 text-red-600" />
    return <Equal className="h-3 w-3 text-gray-400" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0.5) return 'text-green-600'
    if (change < -0.5) return 'text-red-600'
    return 'text-gray-400'
  }

  const getChangeBadge = (change: number, percentage: number) => {
    const absChange = Math.abs(change)
    const absPercentage = Math.abs(percentage)
    
    if (change > 0.5) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          +{absChange.toFixed(1)} ({absPercentage.toFixed(0)}%)
        </Badge>
      )
    }
    if (change < -0.5) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          -{absChange.toFixed(1)} ({absPercentage.toFixed(0)}%)
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-gray-500">
        ±{absChange.toFixed(1)}
      </Badge>
    )
  }

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const current = payload.find((p: any) => p.dataKey === 'current')
      const previous = payload.find((p: any) => p.dataKey === 'previous')
      
      if (current && previous) {
        const { change, percentage } = calculateChange(current.value, previous.value)
        
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-semibold text-sm mb-2">{label}</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm">{data.current.label}: {current.value.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded"></div>
                <span className="text-sm">{data.previous.label}: {previous.value.toFixed(1)}</span>
              </div>
              <div className="pt-1 border-t">
                <div className="flex items-center gap-1">
                  {getChangeIcon(change)}
                  <span className={`text-xs ${getChangeColor(change)}`}>
                    {change > 0 ? '+' : ''}{change.toFixed(1)} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      }
    }
    return null
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="animate-pulse h-4 w-4 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-4 w-32 bg-gray-200 rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">데이터 로딩 중...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{data.current.label}</Badge>
            <span className="text-muted-foreground text-sm">vs</span>
            <Badge variant="secondary">{data.previous.label}</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {chartType === 'bar' ? (
          // 바 차트
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, 10]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="current" 
                  fill="#3B82F6" 
                  name={data.current.label}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={40}
                />
                <Bar 
                  dataKey="previous" 
                  fill="#9CA3AF" 
                  name={data.previous.label}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          // 컴포즈드 차트
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, 10]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="previous" 
                  fill="#E5E7EB" 
                  name={data.previous.label}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={50}
                />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name={data.current.label}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 상세 비교 테이블 */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-medium mb-4">세부 비교</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chartData.map((item) => {
              const { change, percentage } = calculateChange(item.current, item.previous)
              
              return (
                <div key={item.key} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{item.category}</span>
                    {getChangeIcon(change)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{data.current.label}</span>
                      <span className="font-medium">{item.current.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{data.previous.label}</span>
                      <span>{item.previous.toFixed(1)}</span>
                    </div>
                    <div className="pt-1">
                      {getChangeBadge(change, percentage)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 전체 요약 */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {data.current.overall.toFixed(1)}
              </div>
              <div className="text-sm text-blue-700">{data.current.label} 평균</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {data.previous.overall.toFixed(1)}
              </div>
              <div className="text-sm text-gray-700">{data.previous.label} 평균</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className={`text-2xl font-bold ${getChangeColor(data.current.overall - data.previous.overall)}`}>
                {data.current.overall > data.previous.overall ? '+' : ''}
                {(data.current.overall - data.previous.overall).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">전체 변화</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

ComparisonChart.displayName = 'ComparisonChart'