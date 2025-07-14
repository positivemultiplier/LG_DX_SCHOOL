'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { chartColors, getGithubActivityColor } from '@/lib/chart-themes'
import { CalendarDays, GitCommit, TrendingUp } from 'lucide-react'

interface GitHubActivityData {
  date: string
  count: number
  level: number // 0-4
}

interface GitHubHeatmapProps {
  data: GitHubActivityData[]
  loading?: boolean
  title?: string
  description?: string
  totalCommits?: number
  streak?: number
  period?: number // 기간 (일)
}

export function GitHubHeatmap({ 
  data, 
  loading = false, 
  title = "GitHub 활동 히트맵", 
  description = "일별 커밋 활동 분석",
  totalCommits = 0,
  streak = 0,
  period = 84 // 12주 (84일)
}: GitHubHeatmapProps) {

  // 데이터 검증 및 기본값 처리
  const chartData = data && data.length > 0 ? data : generateSampleGitHubData(period)
  const hasRealData = data && data.length > 0

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">히트맵 로딩 중...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 기간에 맞게 데이터 생성 (없는 날짜는 0으로 채움)
  const generateHeatmapGrid = () => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - period + 1)
    
    const grid: GitHubActivityData[] = []
    const dataMap = new Map(data.map(d => [d.date, d]))
    
    for (let i = 0; i < period; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      const dateStr = currentDate.toISOString().split('T')[0]
      
      const existingData = dataMap.get(dateStr)
      grid.push({
        date: dateStr,
        count: existingData?.count || 0,
        level: existingData?.level || 0
      })
    }
    
    return grid
  }

  const heatmapData = generateHeatmapGrid()
  
  // 주별로 그룹화 (7일씩)
  const weeklyData: GitHubActivityData[][] = []
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeklyData.push(heatmapData.slice(i, i + 7))
  }

  // 통계 계산
  const stats = {
    totalDays: heatmapData.length,
    activeDays: heatmapData.filter(d => d.count > 0).length,
    maxCommits: Math.max(...heatmapData.map(d => d.count)),
    avgCommits: Math.round(heatmapData.reduce((sum, d) => sum + d.count, 0) / heatmapData.length * 10) / 10
  }

  const getDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      weekday: ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
    }
  }

  const getTooltipContent = (item: GitHubActivityData) => {
    const { day, month, weekday } = getDateDisplay(item.date)
    return `${month}월 ${day}일 (${weekday}): ${item.count}개 커밋`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            {title}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              {streak}일 연속
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasRealData && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-800 font-medium">📊 샘플 데이터</div>
            <div className="text-xs text-blue-600">GitHub 연동이 되지 않아 샘플 데이터를 표시합니다. GitHub을 연결하면 실제 커밋 히스토리가 나타납니다.</div>
          </div>
        )}
        {/* 통계 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-blue-600">{totalCommits}</div>
            <div className="text-xs text-muted-foreground">총 커밋</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-green-600">{stats.activeDays}</div>
            <div className="text-xs text-muted-foreground">활동일</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-orange-600">{stats.maxCommits}</div>
            <div className="text-xs text-muted-foreground">최대/일</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-purple-600">{stats.avgCommits}</div>
            <div className="text-xs text-muted-foreground">평균/일</div>
          </div>
        </div>

        {/* 히트맵 그리드 */}
        <div className="space-y-4">
          {/* 월 레이블 */}
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            {[...Array(3)].map((_, i) => {
              const date = new Date()
              date.setDate(date.getDate() - (2 - i) * 28)
              return (
                <span key={i}>
                  {date.getMonth() + 1}월
                </span>
              )
            })}
          </div>
          
          {/* 히트맵 */}
          <div className="space-y-1">
            {weeklyData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex gap-1">
                {week.map((day, dayIndex) => {
                  const { day: dayNum, weekday } = getDateDisplay(day.date)
                  
                  return (
                    <div
                      key={dayIndex}
                      className="relative group"
                    >
                      <div
                        className="w-3 h-3 rounded-sm border border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
                        style={{
                          backgroundColor: getGithubActivityColor(day.level)
                        }}
                        title={getTooltipContent(day)}
                      />
                      
                      {/* 툴팁 */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                        {getTooltipContent(day)}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
          
          {/* 범례 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>적음</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className="w-2.5 h-2.5 rounded-sm border border-gray-200"
                    style={{
                      backgroundColor: getGithubActivityColor(level)
                    }}
                  />
                ))}
              </div>
              <span>많음</span>
            </div>
            
            <div className="text-xs text-muted-foreground">
              최근 {Math.floor(period / 7)}주
            </div>
          </div>
        </div>

        {/* 활동 패턴 분석 */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm font-medium mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            활동 패턴 분석
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">활동률:</span>
                <span className="font-medium">
                  {Math.round((stats.activeDays / stats.totalDays) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">연속 기록:</span>
                <span className="font-medium text-green-600">{streak}일</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">일평균:</span>
                <span className="font-medium">{stats.avgCommits}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">최고 기록:</span>
                <span className="font-medium text-orange-600">{stats.maxCommits}개</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function generateSampleGitHubData(days: number = 84): GitHubActivityData[] {
  const data: GitHubActivityData[] = []
  const today = new Date()
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // 주말에는 활동 확률 낮음
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const activityProbability = isWeekend ? 0.3 : 0.7
    
    if (Math.random() < activityProbability) {
      const count = Math.floor(Math.random() * 10) + 1
      const level = Math.min(4, Math.floor(count / 2.5))
      
      data.push({
        date: date.toISOString().split('T')[0],
        count,
        level
      })
    }
  }
  
  return data.reverse() // 날짜 순서대로 정렬
}

/**
 * 실제 GitHub 활동 데이터를 로드하는 훅
 */
export function useGitHubActivityData(userId: string, period: number = 84) {
  const [data, setData] = React.useState<GitHubActivityData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!userId) return

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/github/activities?user_id=${userId}&period=${period}&format=heatmap`
        )

        if (!response.ok) {
          throw new Error('Failed to load GitHub activity data')
        }

        const result = await response.json()
        setData(result.data || [])

      } catch (err) {
        console.error('GitHub activity data load error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        // 에러 시 샘플 데이터 사용
        setData(generateSampleGitHubData(period))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userId, period])

  return { data, loading, error }
}