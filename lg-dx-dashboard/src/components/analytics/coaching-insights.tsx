'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils/cn'
import { 
  Brain,
  Target,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  Lightbulb,
  Heart,
  Clock,
  CheckCircle,
  X,
  ThumbsUp,
  MessageSquare,
  BookOpen,
  Award,
  Zap,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react'

interface StudentProfile {
  id: string
  name: string
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
  motivation: 'intrinsic' | 'extrinsic' | 'mixed'
  strengths: string[]
  challenges: string[]
  goals: string[]
  personality: {
    openness: number // 0-10
    conscientiousness: number
    extraversion: number
    agreeableness: number
    emotionalStability: number
  }
}

interface CoachingInsight {
  id: string
  type: 'strength' | 'opportunity' | 'warning' | 'recommendation' | 'milestone'
  category: 'academic' | 'behavioral' | 'emotional' | 'social' | 'technical'
  title: string
  description: string
  confidence: number // 0-100
  impact: 'high' | 'medium' | 'low'
  urgency: 'immediate' | 'soon' | 'eventual'
  evidence: string[]
  actionSteps: string[]
  expectedOutcome: string
  timeframe: string
}

interface PersonalizedFeedback {
  overallScore: number
  progressTrend: 'improving' | 'stable' | 'declining'
  nextMilestone: string
  motivationalMessage: string
  specificPraise: string[]
  improvementAreas: string[]
  coachingNotes: string
}

interface CoachingInsightsProps {
  studentData: any
  compareData?: any
  profile?: StudentProfile
  className?: string
  onInsightAction?: (insightId: string, action: string) => void
}

export function CoachingInsights({
  studentData,
  compareData,
  profile,
  className,
  onInsightAction
}: CoachingInsightsProps) {
  const [activeTab, setActiveTab] = React.useState('insights')
  const [selectedInsight, setSelectedInsight] = React.useState<CoachingInsight | null>(null)
  const [actionFeedback, setActionFeedback] = React.useState<string>('')

  // 개인화된 인사이트 생성
  const personalizedInsights = React.useMemo((): CoachingInsight[] => {
    const insights: CoachingInsight[] = []

    if (!studentData) return insights

    // 학습 스타일 기반 추천
    if (profile?.learningStyle === 'visual') {
      insights.push({
        id: 'visual-learning',
        type: 'recommendation',
        category: 'academic',
        title: '시각적 학습 자료 활용 강화',
        description: '시각적 학습자의 특성을 활용한 맞춤형 학습 방법을 적용해보세요.',
        confidence: 85,
        impact: 'high',
        urgency: 'soon',
        evidence: ['시각적 학습 선호도 확인', '차트/그래프 이해도 높음', '이미지 기반 기억력 우수'],
        actionSteps: [
          '마인드맵과 플로우차트 활용',
          '색상 코딩 시스템 도입',
          '시각적 노트테이킹 방법 훈련',
          '인포그래픽 형태의 요약 자료 제작'
        ],
        expectedOutcome: '정보 처리 속도 20% 향상, 기억 정착률 증가',
        timeframe: '2-3주'
      })
    }

    // 성격 특성 기반 코칭
    if (profile?.personality?.conscientiousness && profile.personality.conscientiousness < 5) {
      insights.push({
        id: 'self-discipline',
        type: 'opportunity',
        category: 'behavioral',
        title: '자기규율 및 계획성 개발',
        description: '체계적인 학습 습관 형성을 통해 성과 향상을 도모할 수 있습니다.',
        confidence: 78,
        impact: 'high',
        urgency: 'immediate',
        evidence: ['불규칙한 학습 패턴', '계획 대비 실행률 부족', '마감 시간 관리 어려움'],
        actionSteps: [
          '작은 단위의 일일 목표 설정',
          '체크리스트 활용한 진행 상황 관리',
          '시간 블록킹 기법 도입',
          '완료 시 보상 시스템 구축'
        ],
        expectedOutcome: '학습 효율성 30% 향상, 스트레스 감소',
        timeframe: '4-6주'
      })
    }

    // 성과 데이터 기반 분석
    if (studentData.stats.avgScore < 6) {
      insights.push({
        id: 'academic-support',
        type: 'warning',
        category: 'academic',
        title: '기초 학습 역량 강화 필요',
        description: '현재 성과를 바탕으로 단계적 향상 계획이 필요합니다.',
        confidence: 92,
        impact: 'high',
        urgency: 'immediate',
        evidence: ['평균 점수 6점 미만', '기본 개념 이해도 부족', '학습 속도 저하'],
        actionSteps: [
          '기초 개념 재학습 계획 수립',
          '1:1 멘토링 또는 튜터링 신청',
          '학습 방법 진단 및 개선',
          '단계별 성취 목표 설정'
        ],
        expectedOutcome: '기초 실력 향상, 자신감 회복',
        timeframe: '6-8주'
      })
    }

    // 사회적 학습 추천
    if (profile?.personality?.extraversion && profile.personality.extraversion > 7) {
      insights.push({
        id: 'collaborative-learning',
        type: 'recommendation',
        category: 'social',
        title: '협력 학습 참여 확대',
        description: '외향적 성격을 활용한 그룹 학습이 효과적일 것입니다.',
        confidence: 80,
        impact: 'medium',
        urgency: 'soon',
        evidence: ['높은 외향성 지수', '팀 활동 참여도 우수', '설명을 통한 학습 선호'],
        actionSteps: [
          '스터디 그룹 참여 또는 조직',
          '피어 튜터링 활동 참여',
          '프로젝트 기반 학습 확대',
          '발표 및 토론 기회 증가'
        ],
        expectedOutcome: '학습 동기 향상, 네트워킹 효과',
        timeframe: '2-4주'
      })
    }

    return insights
  }, [studentData, profile])

  // 개인화된 피드백 생성
  const personalizedFeedback = React.useMemo((): PersonalizedFeedback => {
    if (!studentData) {
      return {
        overallScore: 0,
        progressTrend: 'stable',
        nextMilestone: '',
        motivationalMessage: '',
        specificPraise: [],
        improvementAreas: [],
        coachingNotes: ''
      }
    }

    const score = studentData.stats.avgScore
    const trend = compareData 
      ? (studentData.stats.avgScore > compareData.stats.avgScore ? 'improving' : 
         studentData.stats.avgScore < compareData.stats.avgScore ? 'declining' : 'stable')
      : 'stable'

    const motivationalMessages = {
      improving: "훌륭한 발전을 보이고 있습니다! 이 추세를 유지하며 더 높은 목표에 도전해보세요.",
      stable: "안정적인 성과를 유지하고 있습니다. 새로운 도전으로 한 단계 더 발전해보세요.",
      declining: "최근 어려움을 겪고 있지만, 이는 성장의 과정입니다. 함께 극복해나가겠습니다."
    }

    return {
      overallScore: Math.round(score * 10),
      progressTrend: trend,
      nextMilestone: score < 6 ? '기초 실력 다지기' : score < 8 ? '중급 수준 달성' : '고급 역량 개발',
      motivationalMessage: motivationalMessages[trend],
      specificPraise: [
        '꾸준한 리플렉션 작성',
        '자기 성찰 능력 향상',
        '학습 의지 지속'
      ],
      improvementAreas: [
        '시간 관리 최적화',
        '학습 방법 다양화',
        '목표 설정 구체화'
      ],
      coachingNotes: `${profile?.name || '학습자'}님만의 강점을 살려 개인 맞춤형 학습 계획을 수립하겠습니다.`
    }
  }, [studentData, compareData, profile])

  const getInsightIcon = (type: CoachingInsight['type']) => {
    switch (type) {
      case 'strength': return <Star className="h-4 w-4 text-yellow-600" />
      case 'opportunity': return <Target className="h-4 w-4 text-blue-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-purple-600" />
      case 'milestone': return <Award className="h-4 w-4 text-green-600" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: CoachingInsight['type']) => {
    switch (type) {
      case 'strength': return 'border-yellow-200 bg-yellow-50'
      case 'opportunity': return 'border-blue-200 bg-blue-50'
      case 'warning': return 'border-red-200 bg-red-50'
      case 'recommendation': return 'border-purple-200 bg-purple-50'
      case 'milestone': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getUrgencyBadge = (urgency: CoachingInsight['urgency']) => {
    switch (urgency) {
      case 'immediate': return <Badge variant="destructive">즉시</Badge>
      case 'soon': return <Badge variant="secondary">곧</Badge>
      case 'eventual': return <Badge variant="outline">향후</Badge>
      default: return null
    }
  }

  const handleInsightAction = (insight: CoachingInsight, action: string) => {
    setActionFeedback(`${action} 액션이 기록되었습니다.`)
    onInsightAction?.(insight.id, action)
    setTimeout(() => setActionFeedback(''), 3000)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* 개인화된 피드백 헤더 */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-600" />
                맞춤형 학습 코칭
              </CardTitle>
              <CardDescription>
                개인별 특성과 학습 패턴을 분석한 전문 코칭 인사이트
              </CardDescription>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {personalizedFeedback.overallScore}
              </div>
              <div className="text-sm text-muted-foreground">종합 점수</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {personalizedFeedback.progressTrend === 'improving' ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : personalizedFeedback.progressTrend === 'declining' ? (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                ) : (
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <div className="font-medium">
                {personalizedFeedback.progressTrend === 'improving' ? '향상' :
                 personalizedFeedback.progressTrend === 'declining' ? '하락' : '안정'}
              </div>
              <div className="text-sm text-muted-foreground">진행 추세</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
              <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="font-medium">{personalizedFeedback.nextMilestone}</div>
              <div className="text-sm text-muted-foreground">다음 목표</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="font-medium">
                {personalizedInsights.filter(i => i.urgency === 'immediate').length}개
              </div>
              <div className="text-sm text-muted-foreground">즉시 액션</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">{personalizedFeedback.motivationalMessage}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 메뉴 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">AI 인사이트</TabsTrigger>
          <TabsTrigger value="feedback">맞춤 피드백</TabsTrigger>
          <TabsTrigger value="actions">액션 플랜</TabsTrigger>
        </TabsList>

        {/* AI 인사이트 탭 */}
        <TabsContent value="insights" className="space-y-4">
          {actionFeedback && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">{actionFeedback}</span>
              </div>
            </div>
          )}
          
          {personalizedInsights.map((insight) => (
            <Card key={insight.id} className={getInsightColor(insight.type)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {getUrgencyBadge(insight.urgency)}
                    <Badge variant="outline">
                      신뢰도 {insight.confidence}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{insight.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">근거</div>
                    <div className="space-y-1">
                      {insight.evidence.map((evidence, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {evidence}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      예상 결과 ({insight.timeframe})
                    </div>
                    <p className="text-xs">{insight.expectedOutcome}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleInsightAction(insight, '적용')}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    적용
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedInsight(insight)}
                  >
                    상세보기
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleInsightAction(insight, '보류')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* 맞춤 피드백 탭 */}
        <TabsContent value="feedback" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  잘하고 있는 점
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {personalizedFeedback.specificPraise.map((praise, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <Zap className="h-3 w-3 text-green-600" />
                      <span className="text-sm">{praise}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  개선할 점
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {personalizedFeedback.improvementAreas.map((area, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                      <BookOpen className="h-3 w-3 text-blue-600" />
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                코치 노트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">{personalizedFeedback.coachingNotes}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 액션 플랜 탭 */}
        <TabsContent value="actions" className="space-y-4">
          {personalizedInsights
            .filter(insight => insight.urgency === 'immediate')
            .map((insight) => (
              <Card key={insight.id} className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    {insight.title} (즉시 액션 필요)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insight.actionSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-xs font-medium">
                          {i + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {/* 상세 인사이트 모달 */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedInsight.title}</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setSelectedInsight(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>{selectedInsight.description}</p>
                
                <div>
                  <h4 className="font-medium mb-2">실행 단계</h4>
                  <div className="space-y-2">
                    {selectedInsight.actionSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => {
                    handleInsightAction(selectedInsight, '적용')
                    setSelectedInsight(null)
                  }}>
                    적용하기
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedInsight(null)}>
                    닫기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

CoachingInsights.displayName = 'CoachingInsights'