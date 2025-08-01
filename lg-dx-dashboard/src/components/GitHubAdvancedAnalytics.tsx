/**
 * GitHub 고급 분석 대시보드 컴포넌트
 * 코드 품질, 생산성, 협업 패턴, 스킬 개발, 예측 분석을 시각화
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter, AreaChart, Area
} from 'recharts'
import { 
  TrendingUp, Code, Users, Target, Brain, 
  Activity, Clock, Zap, Award, AlertTriangle
} from 'lucide-react'

interface GitHubAdvancedAnalyticsProps {
  userId: string
  period?: number
}

interface AdvancedAnalyticsData {
  code_quality: any
  productivity: any
  collaboration: any
  skill_development: any
  predictive: any
}

const GitHubAdvancedAnalytics: React.FC<GitHubAdvancedAnalyticsProps> = ({ 
  userId, 
  period = 90 
}) => {
  const [analyticsData, setAnalyticsData] = useState<AdvancedAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAdvancedAnalytics()
  }, [userId, period])

  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/github/advanced-analytics?user_id=${userId}&period=${period}&type=comprehensive`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch advanced analytics')
      }

      const result = await response.json()
      setAnalyticsData(result.data)
    } catch (error) {
      console.error('Error fetching advanced analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">고급 분석 데이터를 로딩 중...</span>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">분석 데이터를 불러올 수 없습니다.</p>
        <Button onClick={fetchAdvancedAnalytics} className="mt-4">
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">GitHub 고급 분석</h2>
          <p className="text-gray-600 mt-1">AI 기반 개발자 인사이트 및 예측 분석</p>
        </div>
        <Button onClick={fetchAdvancedAnalytics} variant="outline">
          새로고침
        </Button>
      </div>

      {/* 핵심 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="코드 품질 점수"
          value={`${analyticsData.code_quality?.code_complexity_score || 0}/100`}
          icon={<Code className="h-5 w-5" />}
          trend={85}
          color="blue"
        />
        <MetricCard
          title="생산성 지수"
          value={`${analyticsData.productivity?.flow_state_indicators || 0}/100`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={92}
          color="green"
        />
        <MetricCard
          title="협업 점수"
          value={`${analyticsData.collaboration?.team_contribution_balance || 0}/100`}
          icon={<Users className="h-5 w-5" />}
          trend={76}
          color="purple"
        />
        <MetricCard
          title="번아웃 위험도"
          value={`${analyticsData.predictive?.burnout_risk_score || 0}%`}
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={23}
          color="red"
        />
      </div>

      {/* 탭 기반 상세 분석 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="quality">코드 품질</TabsTrigger>
          <TabsTrigger value="productivity">생산성</TabsTrigger>
          <TabsTrigger value="collaboration">협업</TabsTrigger>
          <TabsTrigger value="growth">성장 분석</TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 전체 성과 레이더 차트 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  종합 성과 분석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getOverviewRadarData(analyticsData)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="현재 수준"
                      dataKey="current"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="목표 수준"
                      dataKey="target"
                      stroke="#82ca9d"
                      fill="transparent"
                      strokeDasharray="5 5"
                    />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 성장 궤적 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  성장 궤적
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">기술 진화 속도</span>
                    <Badge variant="secondary">
                      {analyticsData.skill_development?.growth_trajectory || 'stable'}
                    </Badge>
                  </div>
                  <Progress 
                    value={analyticsData.skill_development?.skill_progression_rate || 0} 
                    className="w-full" 
                  />
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">새로 습득한 기술</h4>
                    <div className="flex flex-wrap gap-2">
                      {analyticsData.skill_development?.new_technologies_adopted?.map((tech: string, index: number) => (
                        <Badge key={index} variant="outline">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 예측 분석 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI 예측 인사이트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">다음 주 예측</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {analyticsData.predictive?.productivity_forecast?.[0]?.predicted_commits || 0}
                  </p>
                  <p className="text-sm text-blue-700">예상 커밋 수</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">품질 점수</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {analyticsData.predictive?.productivity_forecast?.[0]?.predicted_quality_score || 0}
                  </p>
                  <p className="text-sm text-green-700">예상 품질 점수</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900">신뢰도</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {analyticsData.predictive?.productivity_forecast?.[0]?.confidence_level || 0}%
                  </p>
                  <p className="text-sm text-purple-700">예측 신뢰도</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 코드 품질 탭 */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>코드 메트릭스</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <QualityMetric
                    label="평균 파일 크기"
                    value={`${analyticsData.code_quality?.average_file_size || 0} lines`}
                    score={75}
                  />
                  <QualityMetric
                    label="코드 복잡도"
                    value={`${analyticsData.code_quality?.code_complexity_score || 0}/100`}
                    score={analyticsData.code_quality?.code_complexity_score || 0}
                  />
                  <QualityMetric
                    label="테스트 커버리지"
                    value={`${analyticsData.code_quality?.test_coverage_estimation || 0}%`}
                    score={analyticsData.code_quality?.test_coverage_estimation || 0}
                  />
                  <QualityMetric
                    label="문서화 비율"
                    value={`${analyticsData.code_quality?.documentation_ratio || 0}%`}
                    score={analyticsData.code_quality?.documentation_ratio || 0}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>품질 개선 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getQualityTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="quality_score"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="test_coverage"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 생산성 탭 */}
        <TabsContent value="productivity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  최적 작업 패턴
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.predictive?.optimal_work_patterns?.map((pattern: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">{pattern.pattern_type}</h4>
                        <p className="text-sm text-gray-600">{pattern.optimal_time}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">+{pattern.productivity_boost}%</Badge>
                        <p className="text-xs text-gray-500">{pattern.recommended_duration}분</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  피크 활동 시간
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">플로우 상태 지표</span>
                    <span className="text-lg font-bold text-blue-600">
                      {analyticsData.productivity?.flow_state_indicators || 0}/100
                    </span>
                  </div>
                  <Progress value={analyticsData.productivity?.flow_state_indicators || 0} />
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">피크 시간대</h4>
                    <div className="flex flex-wrap gap-2">
                      {analyticsData.productivity?.peak_hours?.map((hour: string, index: number) => (
                        <Badge key={index} variant="outline">{hour}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">딥워크 세션</span>
                      <p className="font-semibold">{analyticsData.productivity?.deep_work_sessions || 0}회</p>
                    </div>
                    <div>
                      <span className="text-gray-600">집중 시간 블록</span>
                      <p className="font-semibold">{analyticsData.productivity?.focus_time_blocks || 0}시간</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 협업 탭 */}
        <TabsContent value="collaboration" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  협업 지표
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getCollaborationData(analyticsData.collaboration)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>팀 기여도 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <CollaborationMetric
                    label="PR 리뷰 참여도"
                    value={`${analyticsData.collaboration?.pr_review_participation || 0}%`}
                    score={analyticsData.collaboration?.pr_review_participation || 0}
                  />
                  <CollaborationMetric
                    label="멘토링 활동"
                    value={`${analyticsData.collaboration?.mentoring_activity || 0}%`}
                    score={analyticsData.collaboration?.mentoring_activity || 0}
                  />
                  <CollaborationMetric
                    label="지식 공유"
                    value={`${analyticsData.collaboration?.knowledge_sharing_score || 0}%`}
                    score={analyticsData.collaboration?.knowledge_sharing_score || 0}
                  />
                  <CollaborationMetric
                    label="커뮤니케이션"
                    value={`${analyticsData.collaboration?.communication_effectiveness || 0}%`}
                    score={analyticsData.collaboration?.communication_effectiveness || 0}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 성장 분석 탭 */}
        <TabsContent value="growth" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  학습 곡선 분석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.skill_development?.learning_curve_analysis?.map((curve: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{curve.technology}</h4>
                        <Badge variant={curve.proficiency_level > 70 ? 'default' : 'secondary'}>
                          {curve.proficiency_level}%
                        </Badge>
                      </div>
                      <Progress value={curve.proficiency_level} className="mb-2" />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>학습 속도: {curve.learning_velocity}/10</span>
                        <span>마스터 예상: {curve.mastery_timeline}일</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  전문 영역
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={getExpertiseData(analyticsData.skill_development?.expertise_areas)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="knowledge_depth" 
                      name="지식 깊이"
                      domain={[0, 100]}
                    />
                    <YAxis 
                      dataKey="expertise_level" 
                      name="전문성 수준"
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      formatter={(value, name) => [value, name === 'expertise_level' ? '전문성 수준' : '지식 깊이']}
                      labelFormatter={() => ''}
                    />
                    <Scatter dataKey="expertise_level" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 커리어 성장 지표 */}
          <Card>
            <CardHeader>
              <CardTitle>커리어 성장 지표</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analyticsData.predictive?.career_growth_indicators?.map((indicator: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{indicator.indicator}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>현재 수준</span>
                        <span>{indicator.current_level}%</span>
                      </div>
                      <Progress value={indicator.current_level} />
                      <div className="flex justify-between text-sm">
                        <span>성장 잠재력</span>
                        <span>{indicator.growth_potential}%</span>
                      </div>
                      <Progress value={indicator.growth_potential} className="opacity-60" />
                    </div>
                    <div className="mt-3">
                      <h5 className="text-sm font-medium mb-1">추천 액션</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {indicator.recommended_actions?.map((action: string, actionIndex: number) => (
                          <li key={actionIndex}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 보조 컴포넌트들
const MetricCard: React.FC<{
  title: string
  value: string
  icon: React.ReactNode
  trend: number
  color: 'blue' | 'green' | 'purple' | 'red'
}> = ({ title, value, icon, trend, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    red: 'text-red-600 bg-red-100'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={trend} className="w-full" />
          <p className="text-xs text-gray-500 mt-1">전체 평균 대비 {trend}%</p>
        </div>
      </CardContent>
    </Card>
  )
}

const QualityMetric: React.FC<{
  label: string
  value: string
  score: number
}> = ({ label, value, score }) => (
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-600">{value}</span>
      </div>
      <Progress value={score} className="w-full" />
    </div>
  </div>
)

const CollaborationMetric: React.FC<{
  label: string
  value: string
  score: number
}> = ({ label, value, score }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <span className="text-sm font-medium">{label}</span>
    <div className="flex items-center space-x-2">
      <span className="text-sm font-bold">{value}</span>
      <Progress value={score} className="w-16" />
    </div>
  </div>
)

// 데이터 변환 함수들
const getOverviewRadarData = (data: AdvancedAnalyticsData) => [
  {
    category: '코드품질',
    current: data.code_quality?.code_complexity_score || 0,
    target: 90
  },
  {
    category: '생산성',
    current: data.productivity?.flow_state_indicators || 0,
    target: 85
  },
  {
    category: '협업',
    current: data.collaboration?.team_contribution_balance || 0,
    target: 80
  },
  {
    category: '성장',
    current: data.skill_development?.skill_progression_rate || 0,
    target: 95
  },
  {
    category: '안정성',
    current: 100 - (data.predictive?.burnout_risk_score || 0),
    target: 90
  }
]

const getQualityTrendData = () => [
  { date: '1주전', quality_score: 65, test_coverage: 45 },
  { date: '6일전', quality_score: 68, test_coverage: 48 },
  { date: '5일전', quality_score: 72, test_coverage: 52 },
  { date: '4일전', quality_score: 75, test_coverage: 55 },
  { date: '3일전', quality_score: 78, test_coverage: 58 },
  { date: '2일전', quality_score: 80, test_coverage: 62 },
  { date: '어제', quality_score: 85, test_coverage: 65 }
]

const getCollaborationData = (collaboration: any) => [
  { metric: 'PR리뷰', score: collaboration?.pr_review_participation || 0 },
  { metric: '멘토링', score: collaboration?.mentoring_activity || 0 },
  { metric: '지식공유', score: collaboration?.knowledge_sharing_score || 0 },
  { metric: '커뮤니케이션', score: collaboration?.communication_effectiveness || 0 }
]

const getExpertiseData = (expertiseAreas: any[]) => 
  expertiseAreas?.map(area => ({
    domain: area.domain,
    expertise_level: area.expertise_level,
    knowledge_depth: area.knowledge_depth,
    contribution_volume: area.contribution_volume
  })) || []

export default GitHubAdvancedAnalytics
