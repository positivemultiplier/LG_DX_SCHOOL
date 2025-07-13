'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils/cn'
import { 
  FileText,
  Download,
  Share,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  AlertTriangle,
  BookOpen,
  Clock,
  Users,
  Heart,
  Star,
  Zap
} from 'lucide-react'

interface LearningReportData {
  student: {
    name: string
    period: string
    class: string
  }
  summary: {
    totalDays: number
    averageScore: number
    improvement: number
    consistency: number
    attendance: number
    githubCommits: number
  }
  strengths: Array<{
    title: string
    description: string
    evidence: string[]
    score: number
  }>
  improvements: Array<{
    title: string
    description: string
    suggestions: string[]
    priority: 'high' | 'medium' | 'low'
  }>
  goals: Array<{
    title: string
    progress: number
    status: 'achieved' | 'on_track' | 'at_risk' | 'behind'
    nextSteps: string[]
  }>
  recommendations: Array<{
    title: string
    description: string
    timeframe: string
    expectedImpact: string
  }>
  coach: {
    name: string
    comments: string
    rating: number
    nextMeeting: string
  }
}

interface LearningReportProps {
  data: LearningReportData
  loading?: boolean
  className?: string
  reportType?: 'detailed' | 'summary' | 'parent'
}

export function LearningReport({ 
  data, 
  loading = false, 
  className,
  reportType = 'detailed'
}: LearningReportProps) {
  const [isGenerating, setIsGenerating] = React.useState(false)

  const generateReport = async (format: 'pdf' | 'html' | 'print') => {
    setIsGenerating(true)
    try {
      // TODO: 실제 리포트 생성 로직 구현
      await new Promise(resolve => setTimeout(resolve, 2000)) // 시뮬레이션
      
      if (format === 'print') {
        window.print()
      } else {
        // PDF 또는 HTML 다운로드 로직
        console.log(`Generating ${format} report...`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const getGradeLevel = (score: number) => {
    if (score >= 9) return { level: 'A+', color: 'text-green-600', bg: 'bg-green-50' }
    if (score >= 8) return { level: 'A', color: 'text-green-600', bg: 'bg-green-50' }
    if (score >= 7) return { level: 'B+', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (score >= 6) return { level: 'B', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (score >= 5) return { level: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { level: 'D', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'bg-green-100 text-green-800'
      case 'on_track': return 'bg-blue-100 text-blue-800'
      case 'at_risk': return 'bg-yellow-100 text-yellow-800'
      case 'behind': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'achieved': return '달성'
      case 'on_track': return '순조'
      case 'at_risk': return '주의'
      case 'behind': return '지연'
      default: return '알 수 없음'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '높음'
      case 'medium': return '보통'
      case 'low': return '낮음'
      default: return '알 수 없음'
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const grade = getGradeLevel(data.summary.averageScore)

  return (
    <div className={cn('space-y-6', className)}>
      {/* 리포트 헤더 */}
      <Card className="print:shadow-none">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">학습 성과 리포트</CardTitle>
                <CardDescription className="text-base">
                  {data.student.name} 학생 ({data.student.class}) - {data.student.period}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <Button 
                onClick={() => generateReport('pdf')} 
                variant="outline" 
                size="sm"
                disabled={isGenerating}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button 
                onClick={() => generateReport('print')} 
                variant="outline" 
                size="sm"
                disabled={isGenerating}
              >
                <Printer className="h-4 w-4 mr-2" />
                인쇄
              </Button>
              <Button 
                onClick={() => generateReport('html')} 
                variant="outline" 
                size="sm"
                disabled={isGenerating}
              >
                <Share className="h-4 w-4 mr-2" />
                공유
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 종합 평가 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            종합 평가
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <div className={`text-4xl font-bold ${grade.color} mb-2`}>
                  {grade.level}
                </div>
                <div className="text-lg font-medium text-gray-700">
                  평균 점수: {data.summary.averageScore.toFixed(1)}/10
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {data.summary.totalDays}일간의 학습 결과
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">학습 일관성</span>
                <div className="flex items-center gap-2">
                  <Progress value={data.summary.consistency} className="w-20 h-2" />
                  <span className="text-sm font-bold">{data.summary.consistency.toFixed(0)}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">성장률</span>
                <div className="flex items-center gap-2">
                  {data.summary.improvement > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-bold ${data.summary.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.summary.improvement > 0 ? '+' : ''}{data.summary.improvement.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">출석률</span>
                <span className="text-sm font-bold">{data.summary.attendance.toFixed(0)}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">GitHub 활동</span>
                <span className="text-sm font-bold">{data.summary.githubCommits}회</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 주요 강점 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            주요 강점
          </CardTitle>
          <CardDescription>학습자가 보여주는 뛰어난 역량들</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.strengths.map((strength, index) => (
              <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-green-800">{strength.title}</h4>
                  <Badge className="bg-green-100 text-green-700">
                    {strength.score.toFixed(1)}점
                  </Badge>
                </div>
                <p className="text-sm text-green-700 mb-3">{strength.description}</p>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-green-800">근거</div>
                  {strength.evidence.map((evidence, i) => (
                    <div key={i} className="text-xs text-green-600 flex items-center gap-1">
                      <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                      {evidence}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 개선 영역 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            개선 영역
          </CardTitle>
          <CardDescription>더 나은 학습 성과를 위한 개선 포인트</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.improvements.map((improvement, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{improvement.title}</h4>
                  <Badge className={getPriorityColor(improvement.priority)}>
                    우선순위 {getPriorityLabel(improvement.priority)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{improvement.description}</p>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">개선 방안</div>
                  {improvement.suggestions.map((suggestion, i) => (
                    <div key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <Zap className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 목표 달성 현황 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            목표 달성 현황
          </CardTitle>
          <CardDescription>설정된 학습 목표들의 진행 상황</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.goals.map((goal, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium">{goal.title}</h4>
                  <Badge className={getStatusColor(goal.status)}>
                    {getStatusLabel(goal.status)}
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>진행률</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">다음 단계</div>
                  {goal.nextSteps.map((step, i) => (
                    <div key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 맞춤 추천 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            맞춤 학습 추천
          </CardTitle>
          <CardDescription>개인별 특성에 맞는 학습 전략 제안</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.recommendations.map((rec, index) => (
              <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">{rec.title}</h4>
                <p className="text-sm text-purple-700 mb-3">{rec.description}</p>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1 text-purple-600">
                    <Clock className="h-3 w-3" />
                    {rec.timeframe}
                  </div>
                  <span className="text-purple-600 font-medium">{rec.expectedImpact}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 코치 의견 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            코치 의견
          </CardTitle>
          <CardDescription>담당 코치의 종합 평가 및 조언</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">{data.coach.name} 코치</div>
                <div className="text-sm text-gray-600">다음 상담: {data.coach.nextMeeting}</div>
              </div>
              <div className="ml-auto">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < data.coach.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-600 text-center">{data.coach.rating}/5</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Heart className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 leading-relaxed">{data.coach.comments}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 리포트 푸터 */}
      <Card className="print:shadow-none">
        <CardContent className="p-4 bg-gray-50">
          <div className="text-center text-sm text-gray-600">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              <span>리포트 생성일: {new Date().toLocaleDateString('ko-KR')}</span>
            </div>
            <p>이 리포트는 학습자의 성장을 위해 제작되었습니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

LearningReport.displayName = 'LearningReport'