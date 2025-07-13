'use client'

import { useAuthContext } from '@/components/providers/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ComparisonChart } from '@/components/charts/comparison-chart'
import { CoachingInsights } from '@/components/analytics/coaching-insights'
import { ProgressTracker } from '@/components/analytics/progress-tracker'
import { LearningReport } from '@/components/analytics/learning-report'
import { useState, useEffect } from 'react'
import { analyticsDataFetcher } from '@/lib/analytics/data-fetcher'
import { getPresetDateRanges } from '@/lib/utils/date'
import Link from 'next/link'
import { 
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  Users,
  BookOpen,
  Clock,
  BarChart3,
  Download,
  Share,
  RefreshCw,
  Award,
  AlertCircle,
  Lightbulb,
  Heart
} from 'lucide-react'

interface DateRange {
  start: Date
  end: Date
}

interface CoachInsight {
  type: 'strength' | 'weakness' | 'recommendation' | 'warning'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  evidence: string[]
}

export default function CoachAnalyticsPage() {
  const { user, loading: authLoading } = useAuthContext()
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const presets = getPresetDateRanges()
    return presets.last30Days
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  const [coachData, setCoachData] = useState({
    currentPeriod: null as any,
    previousPeriod: null as any,
    insights: [] as CoachInsight[],
    recommendations: [] as any[],
    progress: {
      overall: 0,
      timeConsistency: 0,
      githubActivity: 0,
      goalAchievement: 0
    }
  })

  useEffect(() => {
    if (user) {
      loadCoachData()
    }
  }, [user, dateRange])

  const loadCoachData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // 현재 기간과 이전 기간 데이터 조회
      const daysDiff = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
      const previousStart = new Date(dateRange.start.getTime() - daysDiff * 24 * 60 * 60 * 1000)
      const previousEnd = new Date(dateRange.end.getTime() - daysDiff * 24 * 60 * 60 * 1000)
      
      const [currentData, previousData] = await Promise.all([
        analyticsDataFetcher.getAnalyticsData(user.id, dateRange),
        analyticsDataFetcher.getAnalyticsData(user.id, { start: previousStart, end: previousEnd })
      ])

      // 코치 인사이트 생성
      const insights = generateCoachInsights(currentData, previousData)
      const recommendations = generateRecommendations(currentData, previousData)
      const progress = calculateProgress(currentData, previousData)

      setCoachData({
        currentPeriod: currentData,
        previousPeriod: previousData,
        insights,
        recommendations,
        progress
      })
    } catch (error) {
      console.error('코치 데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateCoachInsights = (current: any, previous: any): CoachInsight[] => {
    const insights: CoachInsight[] = []

    // 성과 비교 분석 (더 정교한 분석)
    const scoreChange = current.stats.avgScore - previous.stats.avgScore
    const scoreChangePercent = previous.stats.avgScore > 0 ? (scoreChange / previous.stats.avgScore) * 100 : 0

    if (scoreChange > 0.5) {
      const improvementLevel = scoreChange > 1.5 ? '크게' : scoreChange > 1.0 ? '상당히' : '점진적으로'
      insights.push({
        type: 'strength',
        title: '전반적인 성과 향상',
        description: `평균 점수가 ${previous.stats.avgScore.toFixed(1)}점에서 ${current.stats.avgScore.toFixed(1)}점으로 ${improvementLevel} 상승했습니다. (${scoreChangePercent.toFixed(1)}% 향상)`,
        impact: scoreChange > 1.0 ? 'high' : 'medium',
        actionable: false,
        evidence: [
          `${scoreChange.toFixed(1)}점 상승 추세`,
          '꾸준한 리플렉션 작성',
          '자기 개선 의지 확인',
          scoreChange > 1.0 ? '학습 방법론 개선 성공' : '안정적인 성장 패턴'
        ]
      })
    } else if (scoreChange < -0.5) {
      const declineLevel = scoreChange < -1.5 ? '급격히' : scoreChange < -1.0 ? '상당히' : '소폭'
      insights.push({
        type: 'warning',
        title: '성과 하락 주의',
        description: `평균 점수가 ${Math.abs(scoreChange).toFixed(1)}점 ${declineLevel} 하락했습니다. (${Math.abs(scoreChangePercent).toFixed(1)}% 감소) 학습 패턴을 점검해보세요.`,
        impact: Math.abs(scoreChange) > 1.0 ? 'high' : 'medium',
        actionable: true,
        evidence: [
          `${Math.abs(scoreChange).toFixed(1)}점 하락`,
          Math.abs(scoreChange) > 1.0 ? '급격한 성과 변화' : '점진적 성과 감소',
          '가능한 번아웃 신호',
          '학습 방식 재검토 필요'
        ]
      })
    }

    // 일관성 분석 (더 세밀한 구간 분석)
    if (current.stats.consistency > 8) {
      insights.push({
        type: 'strength',
        title: '높은 학습 일관성',
        description: `일관성 지수 ${current.stats.consistency.toFixed(1)}점으로 매우 안정적인 학습 패턴을 보입니다. 이는 상위 10%에 해당하는 우수한 수준입니다.`,
        impact: 'medium',
        actionable: false,
        evidence: [
          '규칙적인 리플렉션 습관',
          '안정적인 점수 분포',
          '지속적인 학습 의지',
          '자기관리 능력 우수'
        ]
      })
    } else if (current.stats.consistency < 5) {
      insights.push({
        type: 'weakness',
        title: '학습 일관성 부족',
        description: `일관성 지수 ${current.stats.consistency.toFixed(1)}점으로 성과 편차가 큽니다. 일정한 학습 루틴 구축이 필요합니다.`,
        impact: 'medium',
        actionable: true,
        evidence: [
          '불규칙한 성과 패턴',
          '학습 환경 불안정',
          '동기부여 변동성',
          '시간관리 개선 필요'
        ]
      })
    } else if (current.stats.consistency >= 6 && current.stats.consistency <= 8) {
      insights.push({
        type: 'recommendation',
        title: '일관성 개선 가능',
        description: `현재 일관성 ${current.stats.consistency.toFixed(1)}점으로 양호한 수준이나, 추가 개선으로 더 안정적인 성과를 기대할 수 있습니다.`,
        impact: 'low',
        actionable: true,
        evidence: [
          '중간 수준의 일관성',
          '개선 잠재력 보유',
          '루틴 최적화 여지'
        ]
      })
    }

    // GitHub 활동 분석 (더 정교한 분석)
    const commitChange = current.stats.totalCommits - previous.stats.totalCommits
    const commitChangePercent = previous.stats.totalCommits > 0 ? (commitChange / previous.stats.totalCommits) * 100 : 0

    if (current.stats.totalCommits > previous.stats.totalCommits * 1.3) {
      insights.push({
        type: 'strength',
        title: 'GitHub 활동 급증',
        description: `커밋 수가 ${previous.stats.totalCommits}개에서 ${current.stats.totalCommits}개로 ${commitChangePercent.toFixed(0)}% 증가했습니다. 실습 참여도가 크게 향상되었습니다.`,
        impact: 'medium',
        actionable: false,
        evidence: [
          `${commitChange}개 커밋 증가`,
          '활발한 코딩 활동',
          '실습 참여도 향상',
          '자기주도적 학습 증가'
        ]
      })
    } else if (current.stats.totalCommits < previous.stats.totalCommits * 0.7) {
      insights.push({
        type: 'warning',
        title: 'GitHub 활동 감소',
        description: `커밋 수가 ${Math.abs(commitChangePercent).toFixed(0)}% 감소했습니다. 실습 활동 참여를 늘려보세요.`,
        impact: 'medium',
        actionable: true,
        evidence: [
          '코딩 활동 감소',
          '실습 참여도 하락',
          '이론-실습 균형 재검토 필요'
        ]
      })
    }

    // 시간대별 성과 패턴 분석
    const timePartData = current.reflections.reduce((acc: any, r: any) => {
      if (!acc[r.time_part]) acc[r.time_part] = []
      acc[r.time_part].push(r.overall_score)
      return acc
    }, {})

    const timeAverages = Object.keys(timePartData).map(timePart => ({
      timePart,
      average: timePartData[timePart].reduce((sum: number, score: number) => sum + score, 0) / timePartData[timePart].length,
      count: timePartData[timePart].length
    }))

    if (timeAverages.length > 1) {
      const bestTime = timeAverages.reduce((best, current) => current.average > best.average ? current : best)
      const worstTime = timeAverages.reduce((worst, current) => current.average < worst.average ? current : worst)
      
      if (bestTime.average - worstTime.average > 2.0) {
        insights.push({
          type: 'recommendation',
          title: '시간대별 성과 편차 발견',
          description: `${getTimePartName(bestTime.timePart)}(${bestTime.average.toFixed(1)}점)과 ${getTimePartName(worstTime.timePart)}(${worstTime.average.toFixed(1)}점) 간 ${(bestTime.average - worstTime.average).toFixed(1)}점 차이가 있습니다.`,
          impact: 'medium',
          actionable: true,
          evidence: [
            '시간대별 성과 불균형',
            '개인 최적 시간대 존재',
            '학습 효율성 개선 가능'
          ]
        })
      }
    }

    // 학습 빈도 분석
    if (current.stats.activeDays < 15) {
      insights.push({
        type: 'warning',
        title: '학습 빈도 부족',
        description: `활동 일수가 ${current.stats.activeDays}일로 부족합니다. 꾸준한 학습 습관 형성이 중요합니다.`,
        impact: 'high',
        actionable: true,
        evidence: [
          '낮은 학습 빈도',
          '습관 형성 필요',
          '지속성 개선 요구'
        ]
      })
    } else if (current.stats.activeDays > 25) {
      insights.push({
        type: 'strength',
        title: '우수한 학습 지속성',
        description: `${current.stats.activeDays}일간 꾸준히 학습하며 우수한 지속성을 보여주고 있습니다.`,
        impact: 'medium',
        actionable: false,
        evidence: [
          '높은 학습 빈도',
          '우수한 지속성',
          '안정적인 학습 습관'
        ]
      })
    }

    return insights
  }

  const generateRecommendations = (current: any, previous: any) => {
    const recommendations = []

    // 성과 기반 추천
    const scoreChange = current.stats.avgScore - previous.stats.avgScore
    if (scoreChange < -0.5) {
      recommendations.push({
        title: '성과 회복 전략',
        description: '최근 성과 하락을 개선하기 위한 종합적인 접근이 필요합니다.',
        priority: 'high',
        actionItems: [
          '학습 방법 재점검 및 개선',
          '개인 상담을 통한 원인 분석',
          '단기 목표 재설정으로 동기부여',
          '스터디 그룹 참여 또는 멘토링 신청',
          '학습 환경 최적화 검토'
        ]
      })
    }

    // 시간대별 추천 (개선된 버전)
    const timePartData = current.reflections.reduce((acc: any, r: any) => {
      if (!acc[r.time_part]) acc[r.time_part] = []
      acc[r.time_part].push(r.overall_score)
      return acc
    }, {})

    const averages = Object.keys(timePartData).map(timePart => ({
      timePart,
      average: timePartData[timePart].reduce((sum: number, score: number) => sum + score, 0) / timePartData[timePart].length,
      count: timePartData[timePart].length
    }))

    if (averages.length > 1) {
      const bestTime = averages.reduce((best, current) => current.average > best.average ? current : best)
      const worstTime = averages.reduce((worst, current) => current.average < worst.average ? current : worst)

      if (bestTime.average - worstTime.average > 1.5) {
        recommendations.push({
          title: '시간대별 학습 최적화',
          description: `${getTimePartName(bestTime.timePart)} 시간의 성과가 ${bestTime.average.toFixed(1)}점으로 가장 좋습니다. 전략적 시간 배치가 필요합니다.`,
          priority: 'high',
          actionItems: [
            `${getTimePartName(bestTime.timePart)} 시간에 가장 어려운 과목 배치`,
            `${getTimePartName(worstTime.timePart)} 시간에는 복습이나 가벼운 과목 배치`,
            '개인 바이오리듬 분석 및 활용',
            '집중력 향상을 위한 환경 조성',
            '시간대별 학습 효과 모니터링'
          ]
        })
      }
    }

    // 일관성 기반 추천
    if (current.stats.consistency < 6) {
      recommendations.push({
        title: '학습 일관성 향상',
        description: '성과의 일관성을 높여 안정적인 학습 패턴을 구축해보세요.',
        priority: 'medium',
        actionItems: [
          '매일 같은 시간에 리플렉션 작성 습관화',
          '학습 환경을 일정하게 유지',
          '목표 설정과 달성 여부 체크리스트 활용',
          '주간 학습 계획 수립 및 점검',
          '스트레스 관리 및 충분한 휴식'
        ]
      })
    }

    // GitHub 활동 기반 추천
    const commitChange = current.stats.totalCommits - previous.stats.totalCommits
    if (current.stats.totalCommits < 20 || commitChange < 0) {
      recommendations.push({
        title: '코딩 실습 활동 강화',
        description: 'GitHub 활동을 늘려서 이론과 실습의 균형을 맞춰보세요.',
        priority: 'medium',
        actionItems: [
          '매일 최소 1개 이상 커밋 목표 설정',
          '개인 프로젝트 또는 과제 진행',
          '코딩 테스트 문제 풀이 및 정리',
          '오픈소스 프로젝트 기여 시도',
          'GitHub 프로필 정리 및 포트폴리오 구성'
        ]
      })
    }

    // 학습 빈도 기반 추천
    if (current.stats.activeDays < 20) {
      recommendations.push({
        title: '학습 지속성 개선',
        description: '꾸준한 학습 습관 형성을 통해 장기적인 성장을 도모해보세요.',
        priority: 'high',
        actionItems: [
          '주 5일 이상 학습 목표 설정',
          '작은 단위로 학습 계획 세분화',
          '학습 동기 부여를 위한 보상 시스템 도입',
          '학습 버디 또는 스터디 그룹 참여',
          '진행 상황 시각화 및 성취감 확인'
        ]
      })
    }

    // 우수한 경우의 추천
    if (current.stats.avgScore > 8 && current.stats.consistency > 7) {
      recommendations.push({
        title: '우수 학습자 도전 과제',
        description: '현재 우수한 성과를 바탕으로 더 높은 목표에 도전해보세요.',
        priority: 'low',
        actionItems: [
          '멘토 역할을 통한 다른 학습자 도움',
          '더 심화된 학습 주제 탐구',
          '개인 프로젝트나 창작 활동 시작',
          '외부 경진대회나 인증시험 도전',
          '학습 방법론 정리 및 공유'
        ]
      })
    }

    // 특별 상황 추천
    const recentReflections = current.reflections.slice(-7) // 최근 7일
    const recentAvg = recentReflections.length > 0 
      ? recentReflections.reduce((sum: number, r: any) => sum + r.overall_score, 0) / recentReflections.length 
      : 0

    if (recentAvg < current.stats.avgScore - 1) {
      recommendations.push({
        title: '최근 성과 하락 대응',
        description: '최근 일주일간 성과가 평균보다 낮습니다. 즉시 대응이 필요합니다.',
        priority: 'high',
        actionItems: [
          '최근 변화 요인 분석 (환경, 건강, 스트레스 등)',
          '단기 회복 계획 수립',
          '코치와 긴급 상담 일정 조율',
          '학습 부담 일시적 조정 고려',
          '동기부여 회복을 위한 활동 참여'
        ]
      })
    }

    return recommendations
  }

  const calculateProgress = (current: any, previous: any) => {
    const scoreImprovement = current.stats.avgScore >= previous.stats.avgScore ? 100 : 
      Math.max(0, (current.stats.avgScore / previous.stats.avgScore) * 100)
    
    const consistencyScore = (current.stats.consistency / 10) * 100
    const activityScore = current.stats.activeDays >= 20 ? 100 : (current.stats.activeDays / 20) * 100
    const githubScore = current.stats.totalCommits >= 50 ? 100 : (current.stats.totalCommits / 50) * 100

    return {
      overall: Math.round((scoreImprovement + consistencyScore + activityScore + githubScore) / 4),
      timeConsistency: Math.round(consistencyScore),
      githubActivity: Math.round(githubScore),
      goalAchievement: Math.round(scoreImprovement)
    }
  }

  const getTimePartName = (timePart: string) => {
    switch (timePart) {
      case 'morning': return '오전수업'
      case 'afternoon': return '오후수업'
      case 'evening': return '저녁자율학습'
      default: return timePart
    }
  }

  const getDateRangeLabel = () => {
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    if (days === 1) return '오늘'
    if (days <= 7) return `최근 ${days}일`
    if (days <= 30) return `최근 ${days}일`
    return `${Math.round(days/30)}개월간`
  }

  // 비교 차트 데이터 생성
  const generateComparisonData = () => {
    if (!coachData.currentPeriod || !coachData.previousPeriod) {
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

    // 시간대별 평균 계산
    const currentTimeAvg = calculateTimePartAverages(coachData.currentPeriod.reflections)
    const previousTimeAvg = calculateTimePartAverages(coachData.previousPeriod.reflections)

    return {
      current: {
        label: getDateRangeLabel(),
        overall: coachData.currentPeriod.stats.avgScore,
        morning: currentTimeAvg.morning,
        afternoon: currentTimeAvg.afternoon,
        evening: currentTimeAvg.evening,
        github: coachData.currentPeriod.stats.totalCommits,
        consistency: coachData.currentPeriod.stats.consistency
      },
      previous: {
        label: `이전 ${getDateRangeLabel()}`,
        overall: coachData.previousPeriod.stats.avgScore,
        morning: previousTimeAvg.morning,
        afternoon: previousTimeAvg.afternoon,
        evening: previousTimeAvg.evening,
        github: coachData.previousPeriod.stats.totalCommits,
        consistency: coachData.previousPeriod.stats.consistency
      }
    }
  }

  const calculateTimePartAverages = (reflections: any[]) => {
    const timePartData = reflections.reduce((acc: any, r: any) => {
      if (!acc[r.time_part]) acc[r.time_part] = []
      acc[r.time_part].push(r.overall_score)
      return acc
    }, {})

    return {
      morning: timePartData.morning ? timePartData.morning.reduce((sum: number, score: number) => sum + score, 0) / timePartData.morning.length : 0,
      afternoon: timePartData.afternoon ? timePartData.afternoon.reduce((sum: number, score: number) => sum + score, 0) / timePartData.afternoon.length : 0,
      evening: timePartData.evening ? timePartData.evening.reduce((sum: number, score: number) => sum + score, 0) / timePartData.evening.length : 0
    }
  }

  const getInsightIcon = (type: CoachInsight['type']) => {
    switch (type) {
      case 'strength': return <Award className="h-4 w-4 text-green-600" />
      case 'weakness': return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-blue-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: CoachInsight['type']) => {
    switch (type) {
      case 'strength': return 'border-green-200 bg-green-50'
      case 'weakness': return 'border-orange-200 bg-orange-50'
      case 'recommendation': return 'border-blue-200 bg-blue-50'
      case 'warning': return 'border-red-200 bg-red-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg">코치 분석 데이터 로딩 중...</div>
        </div>
      </div>
    )
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
                  <Users className="h-6 w-6 text-purple-600" />
                  코치 분석 대시보드
                </h1>
                <p className="text-sm text-gray-600">
                  학습자 맞춤 분석 및 성장 가이드
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={loadCoachData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                리포트 출력
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
          
          {/* 날짜 필터 */}
          <div className="mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">분석 기간</span>
                    </div>
                    <DateRangePicker
                      value={dateRange}
                      onChange={(range) => range && setDateRange(range)}
                      className="w-80"
                      placeholder="분석할 기간을 선택하세요"
                    />
                  </div>
                  
                  <Badge variant="secondary" className="text-xs">
                    {getDateRangeLabel()} 코치 분석
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 진행률 요약 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">전체 성과</span>
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">{coachData.progress.overall}%</div>
                <Progress value={coachData.progress.overall} className="h-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">일관성</span>
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">{coachData.progress.timeConsistency}%</div>
                <Progress value={coachData.progress.timeConsistency} className="h-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">GitHub 활동</span>
                  <BookOpen className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-2">{coachData.progress.githubActivity}%</div>
                <Progress value={coachData.progress.githubActivity} className="h-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">목표 달성</span>
                  <Award className="h-4 w-4 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-2">{coachData.progress.goalAchievement}%</div>
                <Progress value={coachData.progress.goalAchievement} className="h-2" />
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
              <TabsTrigger value="insights" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2">
                <Award className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline md:hidden lg:inline">강점</span>
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2">
                <Lightbulb className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline md:hidden lg:inline">개선</span>
              </TabsTrigger>
              <TabsTrigger value="coaching" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2">
                <Heart className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline md:hidden lg:inline">AI</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline md:hidden lg:inline">진행</span>
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2">
                <BookOpen className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline md:hidden lg:inline">리포트</span>
              </TabsTrigger>
            </TabsList>

            {/* 개요 탭 */}
            <TabsContent value="overview" className="space-y-6">
              {/* 기간별 비교 차트 */}
              <ComparisonChart
                data={generateComparisonData()}
                loading={loading}
                title="기간별 성과 비교"
                description={`${getDateRangeLabel()}과 이전 기간의 상세 비교`}
                showGitHub={true}
                chartType="bar"
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">이번 기간 vs 이전 기간</CardTitle>
                    <CardDescription>주요 성과 지표 비교</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">평균 점수</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">
                            {coachData.currentPeriod?.stats.avgScore.toFixed(1) || 0}/10
                          </span>
                          {coachData.currentPeriod && coachData.previousPeriod && (
                            <Badge variant={
                              coachData.currentPeriod.stats.avgScore > coachData.previousPeriod.stats.avgScore 
                                ? "default" : "destructive"
                            } className="text-xs">
                              {coachData.currentPeriod.stats.avgScore > coachData.previousPeriod.stats.avgScore ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {Math.abs(coachData.currentPeriod.stats.avgScore - coachData.previousPeriod.stats.avgScore).toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">일관성 지수</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">
                            {coachData.currentPeriod?.stats.consistency.toFixed(1) || 0}/10
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">GitHub 커밋</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">
                            {coachData.currentPeriod?.stats.totalCommits || 0}개
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">활동 일수</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">
                            {coachData.currentPeriod?.stats.activeDays || 0}일
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">학습 패턴 요약</CardTitle>
                    <CardDescription>주요 특징 및 변화점</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {coachData.insights.slice(0, 3).map((insight, index) => (
                        <div key={index} className={`p-3 rounded-lg ${getInsightColor(insight.type)}`}>
                          <div className="flex items-start gap-2">
                            {getInsightIcon(insight.type)}
                            <div className="flex-1">
                              <div className="font-medium text-sm">{insight.title}</div>
                              <div className="text-xs mt-1 opacity-80">{insight.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 강점/약점 탭 */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {coachData.insights.map((insight, index) => (
                  <Card key={index} className={getInsightColor(insight.type)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getInsightIcon(insight.type)}
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                        </div>
                        <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'secondary' : 'outline'}>
                          {insight.impact === 'high' ? '높음' : insight.impact === 'medium' ? '보통' : '낮음'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{insight.description}</p>
                      
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">근거</div>
                        <div className="space-y-1">
                          {insight.evidence.map((evidence, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {evidence}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {insight.actionable && (
                        <div className="mt-4 pt-3 border-t">
                          <Badge variant="outline" className="text-xs">
                            실행 가능한 개선점
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* 개선 제안 탭 */}
            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {coachData.recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                            {rec.title}
                          </CardTitle>
                          <CardDescription>{rec.description}</CardDescription>
                        </div>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                          {rec.priority === 'high' ? '우선순위 높음' : '일반'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">실행 단계</div>
                        <div className="space-y-1">
                          {rec.actionItems.map((action: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* AI 코칭 탭 */}
            <TabsContent value="coaching" className="space-y-6">
              <CoachingInsights
                studentData={coachData.currentPeriod}
                compareData={coachData.previousPeriod}
                profile={{
                  id: user?.id || '',
                  name: user?.email?.split('@')[0] || '학습자',
                  learningStyle: 'visual', // 실제로는 DB에서 가져와야 함
                  motivation: 'mixed',
                  strengths: ['시각적 학습', '분석적 사고'],
                  challenges: ['시간 관리', '일관성'],
                  goals: ['성과 향상', '지속성 개선'],
                  personality: {
                    openness: 7,
                    conscientiousness: 6,
                    extraversion: 5,
                    agreeableness: 8,
                    emotionalStability: 6
                  }
                }}
                onInsightAction={(insightId, action) => {
                  console.log(`Insight ${insightId}: ${action}`)
                  // 실제로는 서버로 액션 로그 전송
                }}
              />
            </TabsContent>

            {/* 진행 추적 탭 */}
            <TabsContent value="progress" className="space-y-6">
              <ProgressTracker
                data={{
                  daily: coachData.currentPeriod?.reflections?.map((r: any) => ({
                    date: r.created_at,
                    score: r.overall_score,
                    trend: Math.random() * 2 - 1, // 실제로는 계산된 트렌드
                    milestones: Math.random() > 0.8 ? [{
                      date: r.created_at,
                      score: r.overall_score,
                      type: 'achievement' as const,
                      title: '목표 달성',
                      description: '일일 목표를 달성했습니다',
                      impact: 'medium' as const
                    }] : []
                  })) || [],
                  goals: [
                    {
                      id: 'goal-1',
                      title: '평균 점수 8점 달성',
                      targetScore: 8,
                      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                      currentProgress: Math.min((coachData.currentPeriod?.stats.avgScore || 0) / 8 * 100, 100),
                      status: (coachData.currentPeriod?.stats.avgScore || 0) >= 8 ? 'achieved' : 
                              (coachData.currentPeriod?.stats.avgScore || 0) >= 6 ? 'on_track' : 'behind',
                      description: '학습 성과의 일관된 향상을 통한 목표 달성'
                    }
                  ],
                  summary: {
                    totalDays: coachData.currentPeriod?.stats.activeDays || 0,
                    averageScore: coachData.currentPeriod?.stats.avgScore || 0,
                    improvement: coachData.currentPeriod && coachData.previousPeriod 
                      ? ((coachData.currentPeriod.stats.avgScore - coachData.previousPeriod.stats.avgScore) / coachData.previousPeriod.stats.avgScore) * 100
                      : 0,
                    streak: Math.floor(Math.random() * 10) + 5, // 실제로는 계산된 연속 기록
                    milestones: Math.floor(Math.random() * 5) + 2
                  }
                }}
                loading={loading}
                timeRange={getDateRangeLabel()}
              />
            </TabsContent>

            {/* 종합 리포트 탭 */}
            <TabsContent value="report" className="space-y-6">
              <LearningReport
                data={{
                  student: {
                    name: user?.email?.split('@')[0] || '학습자',
                    period: getDateRangeLabel(),
                    class: 'LG DX School'
                  },
                  summary: {
                    totalDays: coachData.currentPeriod?.stats.activeDays || 0,
                    averageScore: coachData.currentPeriod?.stats.avgScore || 0,
                    improvement: coachData.currentPeriod && coachData.previousPeriod 
                      ? ((coachData.currentPeriod.stats.avgScore - coachData.previousPeriod.stats.avgScore) / coachData.previousPeriod.stats.avgScore) * 100
                      : 0,
                    consistency: coachData.currentPeriod?.stats.consistency || 0,
                    attendance: Math.min((coachData.currentPeriod?.stats.activeDays || 0) / 30 * 100, 100),
                    githubCommits: coachData.currentPeriod?.stats.totalCommits || 0
                  },
                  strengths: coachData.insights
                    .filter(insight => insight.type === 'strength')
                    .map(insight => ({
                      title: insight.title,
                      description: insight.description,
                      evidence: insight.evidence,
                      score: 8.5
                    })),
                  improvements: coachData.insights
                    .filter(insight => insight.type === 'weakness' || insight.type === 'warning')
                    .map(insight => ({
                      title: insight.title,
                      description: insight.description,
                      suggestions: ['개선 방안 1', '개선 방안 2', '개선 방안 3'],
                      priority: insight.impact as 'high' | 'medium' | 'low'
                    })),
                  goals: [
                    {
                      title: '평균 점수 향상',
                      progress: Math.min((coachData.currentPeriod?.stats.avgScore || 0) / 8 * 100, 100),
                      status: (coachData.currentPeriod?.stats.avgScore || 0) >= 8 ? 'achieved' : 'on_track',
                      nextSteps: ['꾸준한 학습 지속', '약점 보완', '강점 활용']
                    }
                  ],
                  recommendations: coachData.recommendations.map(rec => ({
                    title: rec.title,
                    description: rec.description,
                    timeframe: '2-4주',
                    expectedImpact: '성과 향상 기대'
                  })),
                  coach: {
                    name: 'AI 코치',
                    comments: '꾸준한 학습 의지와 개선 노력이 돋보입니다. 현재의 성장 궤도를 유지하며 더 높은 목표에 도전해보세요.',
                    rating: 4,
                    nextMeeting: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')
                  }
                }}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}