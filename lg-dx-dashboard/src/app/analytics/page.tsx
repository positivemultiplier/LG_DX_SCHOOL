'use client'

import { useAuthContext } from '@/components/providers/auth-provider'
import { ThreePartRadarChart, generateSampleRadarData } from '@/components/charts/radar-chart'
import { GitHubHeatmap, generateSampleGitHubData, useGitHubActivityData } from '@/components/charts/github-heatmap'
import { LearningTrendChart, generateSampleTrendData } from '@/components/charts/trend-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Filter
} from 'lucide-react'

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

  const loadAnalyticsData = async () => {
    if (!user) return

    try {
      // 실제 데이터 로드 (현재는 샘플 데이터 사용)
      setAnalyticsData({
        radarData: generateSampleRadarData(),
        githubData: realGithubData.length > 0 ? realGithubData : generateSampleGitHubData(84),
        trendData: generateSampleTrendData(21),
        loading: false
      })
    } catch (error) {
      console.error('분석 데이터 로드 오류:', error)
      setAnalyticsData(prev => ({ ...prev, loading: false }))
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  const stats = {
    totalReflections: 42,
    avgScore: 7.8,
    streak: 12,
    totalCommits: 156,
    activeWeeks: 8,
    consistency: 8.5
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
          
          {/* 요약 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalReflections}</div>
                <div className="text-xs text-muted-foreground">총 리플렉션</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.avgScore}</div>
                <div className="text-xs text-muted-foreground">평균 점수</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.streak}</div>
                <div className="text-xs text-muted-foreground">연속 기록</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalCommits}</div>
                <div className="text-xs text-muted-foreground">총 커밋</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.activeWeeks}</div>
                <div className="text-xs text-muted-foreground">활동 주수</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.consistency}</div>
                <div className="text-xs text-muted-foreground">일관성 지수</div>
              </CardContent>
            </Card>
          </div>

          {/* 탭 메뉴 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                개요
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                성과 분석
              </TabsTrigger>
              <TabsTrigger value="github" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                GitHub 활동
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                트렌드
              </TabsTrigger>
            </TabsList>

            {/* 개요 탭 */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ThreePartRadarChart 
                  data={analyticsData.radarData}
                  loading={analyticsData.loading}
                  period="이번 달"
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
                          <div className="text-lg font-bold text-green-600">{stats.avgScore}/10</div>
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
                period="최근 3주"
                targetScore={8.0}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ThreePartRadarChart 
                  data={analyticsData.radarData}
                  loading={analyticsData.loading}
                  title="과목별 성과 비교"
                  description="3-Part 시간대별 과목 성과 분석"
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
                totalCommits={stats.totalCommits}
                streak={stats.streak}
                period={84}
                title={githubIntegration ? "GitHub 활동 히트맵" : "GitHub 활동 히트맵 (샘플 데이터)"}
                description={githubIntegration ? 
                  `@${githubIntegration.github_username}의 실제 활동 데이터` : 
                  "실제 데이터를 보려면 GitHub 계정을 연결하세요"
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
                        <span className="font-bold text-green-600">{stats.streak}일</span>
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
                description="일별 성과 변화와 패턴 분석"
                period="최근 3주"
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
          </Tabs>
        </div>
      </main>
    </div>
  )
}