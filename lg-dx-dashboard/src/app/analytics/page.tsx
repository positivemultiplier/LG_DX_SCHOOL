'use client'

import { useAuthContext } from '@/components/providers/auth-provider'
import { ThreePartRadarChart, generateSampleRadarData } from '@/components/charts/radar-chart'
import { GitHubHeatmap, generateSampleGitHubData, useGitHubActivityData } from '@/components/charts/github-heatmap'
import { LearningTrendChart, generateSampleTrendData } from '@/components/charts/trend-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  BarChart3, 
  Calendar, 
  GitBranch, 
  TrendingUp, 
  ArrowLeft,
  Download,
  Share,
  RefreshCw,
  Filter,
  RotateCcw,
  Users
} from 'lucide-react'
import { getPresetDateRanges, dateToString } from '@/lib/utils/date'
import { analyticsDataFetcher } from '@/lib/analytics/data-fetcher'
import { ComparisonChart } from '@/components/charts/comparison-chart'

interface DateRange {
  start: Date
  end: Date
}

export default function AnalyticsPage() {
  const { user, loading } = useAuthContext()
  const [analyticsData, setAnalyticsData] = useState({
    radarData: generateSampleRadarData(),
    githubData: generateSampleGitHubData(),
    trendData: generateSampleTrendData(),
    loading: true
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [githubIntegration, setGithubIntegration] = useState<any>(null)
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    try {
      const presets = getPresetDateRanges()
      return presets.last30Days
    } catch (error) {
      console.error('Date range initialization error:', error)
      // 폴백: 기본 30일 범위
      const today = new Date()
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      return {
        start: thirtyDaysAgo,
        end: today
      }
    }
  })
  const [stats, setStats] = useState({
    totalReflections: 0,
    avgScore: 0,
    avgCondition: 0,
    totalCommits: 0,
    activeDays: 0,
    consistency: 0
  })
  const [comparisonData, setComparisonData] = useState({
    current: null as any,
    previous: null as any,
    loading: true
  })

  const supabase = createClient()

  // 실제 GitHub 데이터 훅 사용
  const { 
    data: realGithubData, 
    loading: githubLoading, 
    error: githubError 
  } = useGitHubActivityData(user?.id || '', 84)

  useEffect(() => {
    if (user) {
      loadAnalyticsData()
      checkGitHubIntegration()
    }
  }, [user])

  // 날짜 범위가 변경될 때마다 데이터 다시 로드
  useEffect(() => {
    if (user && dateRange) {
      loadAnalyticsData()
    }
  }, [user, dateRange])

  const loadAnalyticsData = async () => {
    if (!user) return

    try {
      setAnalyticsData(prev => ({ ...prev, loading: true }))
      
      const response = await analyticsDataFetcher.getAnalyticsData(user.id, dateRange)
      
      if (response.reflections.length === 0 && response.githubActivities.length === 0) {
        // 실제 데이터가 없는 경우 샘플 데이터 사용
        setAnalyticsData({
          radarData: generateSampleRadarData(),
          githubData: generateSampleGitHubData(),
          trendData: generateSampleTrendData(),
          loading: false
        })
        setStats({
          totalReflections: 0,
          avgScore: 7.5, // 샘플 기본값
          avgCondition: 7.2,
          totalCommits: 0,
          activeDays: 0,
          consistency: 8.1
        })
      } else {
        // 실제 데이터가 있는 경우 변환하여 사용
        const radarData = await transformToRadarData(user.id, dateRange)
        const trendData = await transformToTrendData(user.id, dateRange)
        
        setAnalyticsData({
          radarData,
          githubData: response.githubActivities.map(g => ({
            date: g.date,
            count: g.commits,
            level: g.activity_level
          })),
          trendData,
          loading: false
        })
        setStats(response.stats)
      }
    } catch (error) {
      console.error('Analytics 데이터 로드 실패:', error)
      // 오류 시 샘플 데이터로 폴백
      setAnalyticsData({
        radarData: generateSampleRadarData(),
        githubData: generateSampleGitHubData(),
        trendData: generateSampleTrendData(),
        loading: false
      })
      setStats({
        totalReflections: 0,
        avgScore: 0,
        avgCondition: 0,
        totalCommits: 0,
        activeDays: 0,
        consistency: 0
      })
    }
  }

  const transformToRadarData = async (userId: string, dateRange: DateRange) => {
    try {
      const timePartData = await analyticsDataFetcher.getTimePartPerformance(userId, dateRange)
      
      const subjects = [
        'Frontend 개발',
        'Backend 개발', 
        'Database',
        'DevOps',
        'Data Science',
        'Algorithm'
      ]
      
      return subjects.map(subject => ({
        subject,
        morning: Math.round(timePartData.morning.average * 10) / 10,
        afternoon: Math.round(timePartData.afternoon.average * 10) / 10,
        evening: Math.round(timePartData.evening.average * 10) / 10,
        fullMark: 10
      }))
    } catch (error) {
      console.error('Radar 데이터 변환 실패:', error)
      return generateSampleRadarData()
    }
  }

  const transformToTrendData = async (userId: string, dateRange: DateRange) => {
    try {
      const dailyTrends = await analyticsDataFetcher.getDailyTrends(userId, dateRange)
      
      return dailyTrends.map(trend => ({
        date: trend.date,
        morning_score: trend.morningScore || 0,
        afternoon_score: trend.afternoonScore || 0,
        evening_score: trend.eveningScore || 0,
        total_score: trend.avgScore || 0,
        efficiency: Math.min(10, Math.max(1, trend.avgScore + Math.random() * 2 - 1)),
        consistency: Math.min(10, Math.max(1, 10 - Math.abs(trend.morningScore - trend.afternoonScore) - Math.abs(trend.afternoonScore - trend.eveningScore))),
        github_commits: trend.commits || 0
      }))
    } catch (error) {
      console.error('Trend 데이터 변환 실패:', error)
      return generateSampleTrendData()
    }
  }

  const checkGitHubIntegration = async () => {
    try {
      const response = await fetch(`/api/github/connect?user_id=${user?.id}`)
      const data = await response.json()
      setGithubIntegration(data.is_connected ? data.integration : null)
    } catch (error) {
      console.error('GitHub 연동 상태 확인 오류:', error)
    }
  }

  const refreshData = () => {
    setAnalyticsData(prev => ({ ...prev, loading: true }))
    setTimeout(() => {
      loadAnalyticsData()
    }, 1000)
  }

  // 현재 선택된 기간을 한국어로 표시하는 함수
  const getDateRangeLabel = () => {
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    if (days === 1) return '오늘'
    if (days <= 7) return `최근 ${days}일`
    if (days <= 30) return `최근 ${days}일`
    if (days <= 90) return `최근 ${Math.round(days/30)}개월`
    return `${Math.round(days/30)}개월간`
  }

  // 실제 데이터를 레이더 차트 데이터로 변환
  const generateRadarDataFromReal = (timePartData: any) => {
    return [
      {
        timePart: '오전수업',
        overall: timePartData.morning.average || 0,
        focus: timePartData.morning.average * 0.9 || 0,
        efficiency: timePartData.morning.average * 1.1 || 0,
        satisfaction: timePartData.morning.average * 0.95 || 0,
        understanding: timePartData.morning.average * 0.85 || 0
      },
      {
        timePart: '오후수업',
        overall: timePartData.afternoon.average || 0,
        focus: timePartData.afternoon.average * 1.1 || 0,
        efficiency: timePartData.afternoon.average * 1.2 || 0,
        satisfaction: timePartData.afternoon.average * 1.05 || 0,
        understanding: timePartData.afternoon.average * 1.1 || 0
      },
      {
        timePart: '저녁자율학습',
        overall: timePartData.evening.average || 0,
        focus: timePartData.evening.average * 0.8 || 0,
        efficiency: timePartData.evening.average * 0.9 || 0,
        satisfaction: timePartData.evening.average * 0.9 || 0,
        understanding: timePartData.evening.average * 0.95 || 0
      }
    ]
  }

  // GitHub 데이터를 히트맵 형식으로 변환
  const transformGitHubDataForChart = (githubActivities: any[]) => {
    return githubActivities.map(activity => ({
      date: activity.date,
      commits: activity.commits,
      level: Math.min(Math.floor(activity.commits / 3), 4) // 0-4 레벨
    }))
  }

  // 일별 트렌드 데이터를 차트 형식으로 변환
  const transformTrendDataForChart = (dailyTrends: any[]) => {
    return dailyTrends.map(day => ({
      date: day.date,
      overall: day.avgScore,
      morning: day.morningScore,
      afternoon: day.afternoonScore,
      evening: day.eveningScore,
      commits: day.commits,
      efficiency: day.avgScore * 1.1,
      consistency: day.reflectionCount >= 3 ? 10 : day.reflectionCount * 3.3
    }))
  }

  // 비교 차트 데이터 생성
  const generateComparisonChartData = () => {
    if (!comparisonData.current || !comparisonData.previous) {
      return {
        current: {
          label: getDateRangeLabel(),
          overall: 0,
          morning: 0,
          afternoon: 0,
          evening: 0,
          github: 0,
          consistency: 0
        },
        previous: {
          label: `이전 ${getDateRangeLabel()}`,
          overall: 0,
          morning: 0,
          afternoon: 0,
          evening: 0,
          github: 0,
          consistency: 0
        }
      }
    }

    const current = comparisonData.current
    const previous = comparisonData.previous

    return {
      current: {
        label: getDateRangeLabel(),
        overall: current.data.stats.avgScore,
        morning: current.timePartData.morning.average || 0,
        afternoon: current.timePartData.afternoon.average || 0,
        evening: current.timePartData.evening.average || 0,
        github: current.data.stats.totalCommits,
        consistency: current.data.stats.consistency
      },
      previous: {
        label: `이전 ${getDateRangeLabel()}`,
        overall: previous.data.stats.avgScore,
        morning: previous.timePartData.morning.average || 0,
        afternoon: previous.timePartData.afternoon.average || 0,
        evening: previous.timePartData.evening.average || 0,
        github: previous.data.stats.totalCommits,
        consistency: previous.data.stats.consistency
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  // 동적으로 계산된 stats와 기본값 병합
  const displayStats = {
    totalReflections: stats.totalReflections,
    avgScore: stats.avgScore,
    streak: 12, // TODO: 연속 기록 계산 로직 추가
    totalCommits: stats.totalCommits,
    activeWeeks: Math.ceil(stats.activeDays / 7),
    consistency: stats.consistency
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  대시보드로
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  고급 분석
                </h1>
                <p className="text-sm text-gray-600">
                  상세한 학습 성과 분석 및 트렌드 인사이트
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/analytics/coach">
                  <Users className="h-4 w-4 mr-2" />
                  코치 분석
                </Link>
              </Button>
              <Button onClick={refreshData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                내보내기
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                공유
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* 날짜 필터 섹션 */}
          <div className="mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">분석 기간</span>
                    </div>
                    <DateRangePicker
                      value={dateRange}
                      onChange={(range) => range && setDateRange(range)}
                      className="w-full sm:w-80"
                      placeholder="분석할 기간을 선택하세요"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const presets = getPresetDateRanges()
                        setDateRange(presets.last30Days)
                      }}
                      className="text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      기본값으로
                    </Button>
                    
                    <Badge variant="secondary" className="text-xs">
                      {Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1}일간 데이터
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 요약 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{displayStats.totalReflections}</div>
                <div className="text-xs text-muted-foreground">총 리플렉션</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{displayStats.avgScore}</div>
                <div className="text-xs text-muted-foreground">평균 점수</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{displayStats.streak}</div>
                <div className="text-xs text-muted-foreground">연속 기록</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{displayStats.totalCommits}</div>
                <div className="text-xs text-muted-foreground">총 커밋</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{displayStats.activeWeeks}</div>
                <div className="text-xs text-muted-foreground">활동 주수</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">{displayStats.consistency}</div>
                <div className="text-xs text-muted-foreground">일관성 지수</div>
              </CardContent>
            </Card>
          </div>

          {/* 탭 메뉴 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1">
              <TabsTrigger value="overview" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2">
                <BarChart3 className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline md:hidden lg:inline">개요</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline md:hidden lg:inline">성과</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline md:hidden lg:inline">비교</span>
              </TabsTrigger>
              <TabsTrigger value="github" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2">
                <GitBranch className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline md:hidden lg:inline">GitHub</span>
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2">
                <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline md:hidden lg:inline">트렌드</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2">
                <Filter className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline md:hidden lg:inline">AI</span>
              </TabsTrigger>
            </TabsList>

            {/* 개요 탭 */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ThreePartRadarChart 
                  data={analyticsData.radarData}
                  loading={analyticsData.loading}
                  period={getDateRangeLabel()}
                />
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">학습 현황 요약</CardTitle>
                      <CardDescription>이번 달 주요 지표 분석</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">평균 성과</span>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold text-green-600">{displayStats.avgScore}/10</div>
                          <Badge variant="secondary" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +0.3
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">완료율</span>
                        <div className="text-lg font-bold text-blue-600">85.7%</div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">최고 시간대</span>
                        <Badge variant="outline">🌞 오후수업</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">개선 필요</span>
                        <Badge variant="destructive">🌙 저녁자율학습</Badge>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="text-sm text-muted-foreground mb-2">추천 액션</div>
                        <div className="space-y-2">
                          <div className="text-xs p-2 bg-blue-50 rounded text-blue-700">
                            💡 저녁 시간대 집중도 향상을 위한 환경 개선 검토
                          </div>
                          <div className="text-xs p-2 bg-green-50 rounded text-green-700">
                            ✅ 오후 수업 패턴을 다른 시간대에도 적용
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* 성과 분석 탭 */}
            <TabsContent value="performance" className="space-y-6">
              <LearningTrendChart 
                data={analyticsData.trendData}
                loading={analyticsData.loading}
                chartType="area"
                period={getDateRangeLabel()}
                targetScore={8.0}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ThreePartRadarChart 
                  data={analyticsData.radarData}
                  loading={analyticsData.loading}
                  title="과목별 성과 비교"
                  description={`${getDateRangeLabel()} 시간대별 과목 성과 분석`}
                  period={getDateRangeLabel()}
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">성과 개선 분석</CardTitle>
                    <CardDescription>시간대별 강점과 개선점 분석</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-800 mb-1">🌞 오후수업 강점</div>
                        <div className="text-sm text-green-700">
                          실습 중심 학습에서 높은 집중도와 성취도를 보입니다. 
                          프로그래밍 과목에서 특히 우수한 성과를 기록하고 있습니다.
                        </div>
                      </div>
                      
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="font-medium text-orange-800 mb-1">🌅 오전수업 개선점</div>
                        <div className="text-sm text-orange-700">
                          이론 학습 시 이해도가 다소 낮습니다. 
                          예습이나 보조 자료 활용을 통한 사전 준비가 도움될 것 같습니다.
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-800 mb-1">🌙 저녁자율학습 최적화</div>
                        <div className="text-sm text-blue-700">
                          개인 프로젝트 시간 활용도를 높이고, 
                          복습보다는 새로운 도전 과제에 집중하는 것이 효과적일 것 같습니다.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 비교 분석 탭 */}
            <TabsContent value="comparison" className="space-y-6">
              <ComparisonChart
                data={generateComparisonChartData()}
                loading={comparisonData.loading}
                title="기간별 성과 비교"
                description={`${getDateRangeLabel()}과 이전 ${getDateRangeLabel()}의 상세 비교`}
                showGitHub={true}
                chartType="bar"
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">주요 변화 요약</CardTitle>
                    <CardDescription>이전 기간 대비 주요 개선/악화 지표</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {comparisonData.current && comparisonData.previous && (
                        <>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-sm font-medium">전체 평균 점수</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">
                                {comparisonData.current.data.stats.avgScore.toFixed(1)}
                              </span>
                              {comparisonData.current.data.stats.avgScore > comparisonData.previous.data.stats.avgScore ? (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  +{(comparisonData.current.data.stats.avgScore - comparisonData.previous.data.stats.avgScore).toFixed(1)}
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  {(comparisonData.current.data.stats.avgScore - comparisonData.previous.data.stats.avgScore).toFixed(1)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-sm font-medium">총 리플렉션 수</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{comparisonData.current.data.stats.totalReflections}</span>
                              {comparisonData.current.data.stats.totalReflections > comparisonData.previous.data.stats.totalReflections ? (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  +{comparisonData.current.data.stats.totalReflections - comparisonData.previous.data.stats.totalReflections}
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  {comparisonData.current.data.stats.totalReflections - comparisonData.previous.data.stats.totalReflections}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-sm font-medium">GitHub 커밋 수</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{comparisonData.current.data.stats.totalCommits}</span>
                              {comparisonData.current.data.stats.totalCommits > comparisonData.previous.data.stats.totalCommits ? (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  +{comparisonData.current.data.stats.totalCommits - comparisonData.previous.data.stats.totalCommits}
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  {comparisonData.current.data.stats.totalCommits - comparisonData.previous.data.stats.totalCommits}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-sm font-medium">일관성 지수</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{comparisonData.current.data.stats.consistency.toFixed(1)}</span>
                              {comparisonData.current.data.stats.consistency > comparisonData.previous.data.stats.consistency ? (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  +{(comparisonData.current.data.stats.consistency - comparisonData.previous.data.stats.consistency).toFixed(1)}
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  {(comparisonData.current.data.stats.consistency - comparisonData.previous.data.stats.consistency).toFixed(1)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">성장 인사이트</CardTitle>
                    <CardDescription>비교 분석을 통한 학습 개선 방향</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {comparisonData.current && comparisonData.previous && (
                        <>
                          {comparisonData.current.data.stats.avgScore > comparisonData.previous.data.stats.avgScore ? (
                            <div className="p-3 bg-green-50 rounded-lg">
                              <div className="font-medium text-green-800 mb-1">📈 전반적 성과 향상</div>
                              <div className="text-sm text-green-700">
                                이전 기간 대비 성과가 개선되었습니다. 현재 학습 패턴을 유지하면서 더 도전적인 목표를 설정해보세요.
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-orange-50 rounded-lg">
                              <div className="font-medium text-orange-800 mb-1">⚠️ 성과 개선 필요</div>
                              <div className="text-sm text-orange-700">
                                이전 기간 대비 성과가 다소 하락했습니다. 학습 방법이나 환경을 점검해보세요.
                              </div>
                            </div>
                          )}
                          
                          {comparisonData.current.data.stats.consistency > comparisonData.previous.data.stats.consistency ? (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <div className="font-medium text-blue-800 mb-1">🎯 일관성 개선</div>
                              <div className="text-sm text-blue-700">
                                학습 일관성이 향상되었습니다. 안정적인 루틴이 자리잡고 있는 것 같습니다.
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-yellow-50 rounded-lg">
                              <div className="font-medium text-yellow-800 mb-1">⏰ 루틴 안정화 필요</div>
                              <div className="text-sm text-yellow-700">
                                학습 일관성 확보를 위해 더 규칙적인 스케줄을 만들어보세요.
                              </div>
                            </div>
                          )}
                          
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="font-medium text-purple-800 mb-1">💡 다음 단계 제안</div>
                            <div className="text-sm text-purple-700">
                              강점을 유지하면서 약한 부분을 개선하는 맞춤형 전략을 수립해보세요.
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* GitHub 활동 탭 */}
            <TabsContent value="github" className="space-y-6">
              {/* GitHub 연동 상태 표시 */}
              {!githubIntegration && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <GitBranch className="h-8 w-8 text-blue-600" />
                      <div className="flex-1">
                        <h3 className="font-medium text-blue-900">GitHub 계정을 연결하세요</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          실제 GitHub 활동 데이터를 보려면 계정 연결이 필요합니다. 
                          현재는 샘플 데이터를 표시하고 있습니다.
                        </p>
                      </div>
                      <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/settings/github">
                          <GitBranch className="h-4 w-4 mr-2" />
                          GitHub 연결
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <GitHubHeatmap 
                data={analyticsData.githubData}
                loading={analyticsData.loading || githubLoading}
                totalCommits={displayStats.totalCommits}
                streak={displayStats.streak}
                period={Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))}
                title={githubIntegration ? `GitHub 활동 히트맵 (${getDateRangeLabel()})` : `GitHub 활동 히트맵 (${getDateRangeLabel()}, 샘플 데이터)`}
                description={githubIntegration ? 
                  `@${githubIntegration.github_username}의 ${getDateRangeLabel()} 활동 데이터` : 
                  `${getDateRangeLabel()} 데이터 - 실제 데이터를 보려면 GitHub 계정을 연결하세요`
                }
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">커밋 패턴 분석</CardTitle>
                    <CardDescription>시간대별 GitHub 활동 분석</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium">가장 활발한 시간</span>
                        <Badge variant="outline">오후 2-4시</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium">주간 평균 커밋</span>
                        <span className="font-bold">18.7개</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium">최장 연속 기록</span>
                        <span className="font-bold text-green-600">{displayStats.streak}일</span>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="text-sm font-medium mb-2">주요 활동 언어</div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">TypeScript 45%</Badge>
                          <Badge variant="secondary">Python 28%</Badge>
                          <Badge variant="secondary">JavaScript 18%</Badge>
                          <Badge variant="secondary">CSS 9%</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">코딩 효율성 분석</CardTitle>
                    <CardDescription>커밋과 학습 성과의 상관관계</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-800 mb-1">상관관계 분석</div>
                        <div className="text-sm text-blue-700">
                          GitHub 활동이 많은 날일수록 학습 만족도가 높은 경향을 보입니다. 
                          특히 오후 시간대의 커밋이 전체 성과에 긍정적 영향을 미칩니다.
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="text-lg font-bold text-green-600">92%</div>
                          <div className="text-xs text-green-700">활동-성과 일치율</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded">
                          <div className="text-lg font-bold text-purple-600">7.4</div>
                          <div className="text-xs text-purple-700">커밋 있는 날 평균점수</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 트렌드 탭 */}
            <TabsContent value="trends" className="space-y-6">
              <LearningTrendChart 
                data={analyticsData.trendData}
                loading={analyticsData.loading}
                chartType="line"
                title="상세 학습 트렌드"
                description={`${getDateRangeLabel()} 성과 변화와 패턴 분석`}
                period={getDateRangeLabel()}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">주간 패턴</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">월요일</span>
                        <span className="font-medium">7.2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">화요일</span>
                        <span className="font-medium">8.1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">수요일</span>
                        <span className="font-medium text-green-600">8.4</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">목요일</span>
                        <span className="font-medium">7.9</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">금요일</span>
                        <span className="font-medium">7.6</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span className="text-sm">주말</span>
                        <span className="font-medium">6.1</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">월별 성장</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">1월</span>
                        <span className="font-medium">6.8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">2월</span>
                        <span className="font-medium">7.2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">3월</span>
                        <span className="font-medium text-green-600">7.8</span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="text-xs text-muted-foreground">성장률</div>
                        <div className="text-lg font-bold text-green-600">+14.7%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">예측 분석</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded">
                        <div className="text-sm font-medium text-blue-800">다음 주 예상</div>
                        <div className="text-lg font-bold text-blue-600">8.2/10</div>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded">
                        <div className="text-sm font-medium text-green-800">목표 달성 확률</div>
                        <div className="text-lg font-bold text-green-600">87%</div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground pt-2">
                        현재 추세를 유지할 경우 이번 달 목표(8.0) 달성이 가능합니다.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI 인사이트 탭 */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-purple-200 bg-purple-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Filter className="h-8 w-8 text-purple-600" />
                      <div className="flex-1">
                        <h3 className="font-medium text-purple-900">AI 기반 학습 분석</h3>
                        <p className="text-sm text-purple-700 mt-1">
                          개인화된 인사이트와 학습 최적화 제안을 확인하세요.
                        </p>
                      </div>
                      <Button asChild className="bg-purple-600 hover:bg-purple-700">
                        <Link href="/analytics/insights">
                          <Filter className="h-4 w-4 mr-2" />
                          상세 분석 보기
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">빠른 인사이트 미리보기</CardTitle>
                    <CardDescription>AI가 분석한 주요 학습 패턴</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-800 mb-1">🎯 최적 학습 시간</div>
                        <div className="text-sm text-green-700">
                          오후 2-4시에 가장 높은 집중도를 보입니다. 이 시간에 어려운 과목을 배치해보세요.
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-800 mb-1">📈 성과 예측</div>
                        <div className="text-sm text-blue-700">
                          현재 추세로 보면 다음 주 평균 점수가 8.2점까지 향상될 것으로 예상됩니다.
                        </div>
                      </div>
                      
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="font-medium text-orange-800 mb-1">💡 개선 제안</div>
                        <div className="text-sm text-orange-700">
                          GitHub 활동을 늘려 이론과 실습의 균형을 맞춰보세요.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">학습 패턴 분석</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">일관성 점수</span>
                        <span className="font-medium text-green-600">87%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">최적 요일</span>
                        <Badge variant="outline">수요일</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">강한 습관</span>
                        <span className="text-sm font-medium">3개 발견</span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="text-xs text-muted-foreground">강점</div>
                        <div className="text-sm font-medium text-green-600">꾸준한 리플렉션 작성</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">위험 요소 모니터링</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">번아웃 위험: 낮음</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">활동 부족: 보통</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">성과 하락: 낮음</span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="text-xs text-muted-foreground">전체 위험도</div>
                        <div className="text-lg font-bold text-green-600">낮음</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">추천 액션</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-2 bg-blue-50 rounded text-xs">
                        <div className="font-medium text-blue-800">즉시 적용</div>
                        <div className="text-blue-700">포모도로 기법 시도</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded text-xs">
                        <div className="font-medium text-green-800">이번 주</div>
                        <div className="text-green-700">GitHub 활동 늘리기</div>
                      </div>
                      <div className="p-2 bg-purple-50 rounded text-xs">
                        <div className="font-medium text-purple-800">장기 목표</div>
                        <div className="text-purple-700">새로운 기술 스택 학습</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}