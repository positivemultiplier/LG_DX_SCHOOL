'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Recommendation } from '@/lib/analytics'
import { 
  Lightbulb, 
  Clock, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  BookOpen,
  Coffee,
  Settings,
  Zap,
  Heart
} from 'lucide-react'
import { useState } from 'react'

interface RecommendationsProps {
  recommendations: Recommendation[]
  maxItems?: number
  showDetails?: boolean
  onAccept?: (id: string) => void
  onDismiss?: (id: string) => void
}

export function Recommendations({ 
  recommendations, 
  maxItems = 6, 
  showDetails = true,
  onAccept,
  onDismiss 
}: RecommendationsProps) {
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set())
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const displayRecommendations = recommendations
    .filter(rec => !dismissedIds.has(rec.id))
    .slice(0, maxItems)

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'schedule': return <Calendar className="h-4 w-4" />
      case 'method': return <BookOpen className="h-4 w-4" />
      case 'habit': return <Target className="h-4 w-4" />
      case 'goal': return <TrendingUp className="h-4 w-4" />
      case 'break': return <Coffee className="h-4 w-4" />
      case 'subject': return <Settings className="h-4 w-4" />
      case 'productivity': return <Zap className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: Recommendation['type']) => {
    switch (type) {
      case 'schedule': return '스케줄 최적화'
      case 'method': return '학습 방법'
      case 'habit': return '습관 형성'
      case 'goal': return '목표 설정'
      case 'break': return '휴식 및 건강'
      case 'subject': return '과목별 전략'
      case 'productivity': return '생산성 향상'
      default: return '일반 추천'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'low': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">높음</Badge>
      case 'medium': return <Badge variant="secondary">보통</Badge>
      case 'low': return <Badge variant="outline">낮음</Badge>
      default: return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 0.3) return '쉬움'
    if (difficulty < 0.7) return '보통'
    return '어려움'
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 0.3) return 'text-green-600'
    if (difficulty < 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getImpactLabel = (impact: number) => {
    if (impact < 0.3) return '낮음'
    if (impact < 0.7) return '보통'
    return '높음'
  }

  const handleAccept = (id: string) => {
    setAcceptedIds(prev => new Set([...prev, id]))
    onAccept?.(id)
  }

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]))
    onDismiss?.(id)
  }

  if (displayRecommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">추천사항이 없습니다</h3>
          <p className="text-sm text-gray-500">
            현재 학습 패턴이 매우 좋습니다! 계속 현재의 방식을 유지하세요.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {displayRecommendations.map((rec) => {
        const isAccepted = acceptedIds.has(rec.id)
        
        return (
          <Card key={rec.id} className={getPriorityColor(rec.priority)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getTypeIcon(rec.type)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <CardDescription className="mt-1">{rec.description}</CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(rec.type)}
                      </Badge>
                      {getPriorityBadge(rec.priority)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {showDetails && (
                <>
                  {/* 추천 이유 */}
                  <div className="mb-4 p-3 bg-white/50 rounded-lg">
                    <div className="text-sm font-medium mb-1">추천 이유</div>
                    <div className="text-xs text-gray-600">{rec.rationale}</div>
                  </div>

                  {/* 메트릭스 */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">예상 효과</div>
                      <div className="text-lg font-bold text-green-600">
                        {(rec.expectedImpact * 100).toFixed(0)}%
                      </div>
                      <Progress value={rec.expectedImpact * 100} className="h-1 mt-1" />
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500">구현 난이도</div>
                      <div className={`text-lg font-bold ${getDifficultyColor(rec.implementationDifficulty)}`}>
                        {getDifficultyLabel(rec.implementationDifficulty)}
                      </div>
                      <Progress value={rec.implementationDifficulty * 100} className="h-1 mt-1" />
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500">효과 확인</div>
                      <div className="text-lg font-bold text-blue-600 flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4" />
                        {rec.timeToSeeResults}일
                      </div>
                    </div>
                  </div>

                  {/* 실행 단계 */}
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">실행 단계</div>
                    <div className="space-y-2">
                      {rec.actionItems.slice(0, 4).map((action, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                            {i + 1}
                          </div>
                          <span className="text-gray-700">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 태그 */}
                  {rec.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">관련 키워드</div>
                      <div className="flex flex-wrap gap-1">
                        {rec.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 액션 버튼 */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-gray-500">
                  카테고리: {rec.category}
                </div>
                
                {!isAccepted ? (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDismiss(rec.id)}
                    >
                      나중에
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleAccept(rec.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      시작하기
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">적용 중</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

interface QuickWinsProps {
  recommendations: Recommendation[]
  onAccept?: (id: string) => void
}

export function QuickWins({ recommendations, onAccept }: QuickWinsProps) {
  // 빠른 효과, 쉬운 구현의 추천들 필터링
  const quickWins = recommendations.filter(rec => 
    rec.implementationDifficulty < 0.4 && 
    rec.expectedImpact > 0.6 &&
    rec.timeToSeeResults <= 7
  ).slice(0, 3)

  if (quickWins.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="text-sm font-medium">즉시 적용 가능한 개선사항이 없습니다</div>
          <div className="text-xs text-gray-500 mt-1">현재 학습 방식이 매우 효율적입니다!</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-yellow-500" />
        <h3 className="font-medium">즉시 적용 가능한 개선사항</h3>
        <Badge variant="secondary" className="text-xs">
          {quickWins.length}개 발견
        </Badge>
      </div>
      
      {quickWins.map((rec) => (
        <Card key={rec.id} className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm">{rec.title}</div>
                <div className="text-xs text-gray-600 mt-1">{rec.description}</div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-green-600">
                    효과: {(rec.expectedImpact * 100).toFixed(0)}%
                  </span>
                  <span className="text-blue-600">
                    {rec.timeToSeeResults}일 후 확인
                  </span>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => onAccept?.(rec.id)}
                className="ml-3"
              >
                적용
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}