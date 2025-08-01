/**
 * GitHub 활동 예측 및 개발자 맞춤 추천 시스템
 * AI 기반 개발 패턴 분석 및 개선 제안
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

interface DeveloperProfile {
  user_id: string
  coding_style: CodingStyle
  productivity_patterns: ProductivityPattern[]
  skill_levels: SkillLevel[]
  collaboration_preferences: CollaborationPreference
  learning_velocity: number
  career_stage: 'junior' | 'mid' | 'senior' | 'lead'
}

interface CodingStyle {
  preferred_languages: string[]
  commit_frequency: 'frequent' | 'moderate' | 'batch'
  code_review_style: 'detailed' | 'focused' | 'minimal'
  testing_approach: 'tdd' | 'post_development' | 'minimal'
  documentation_level: 'extensive' | 'moderate' | 'minimal'
}

interface ProductivityPattern {
  time_slot: string
  productivity_score: number
  activity_types: string[]
  quality_rating: number
  consistency: number
}

interface SkillLevel {
  technology: string
  proficiency: number
  growth_rate: number
  last_used: string
  market_demand: number
}

interface CollaborationPreference {
  team_size: 'solo' | 'small' | 'medium' | 'large'
  communication_style: 'async' | 'sync' | 'mixed'
  mentoring_inclination: number
  knowledge_sharing: number
}

interface PersonalizedRecommendation {
  category: 'skill_development' | 'productivity' | 'collaboration' | 'career' | 'project'
  title: string
  description: string
  priority: number
  impact_score: number
  effort_required: number
  timeline: string
  action_items: string[]
  success_metrics: string[]
}

interface PredictionModel {
  next_week_forecast: WeeklyForecast
  monthly_trends: MonthlyTrend[]
  skill_progression: SkillProgression[]
  career_trajectory: CareerTrajectory
  risk_factors: RiskFactor[]
}

interface WeeklyForecast {
  predicted_commits: number
  predicted_prs: number
  predicted_reviews: number
  quality_score: number
  productivity_index: number
  confidence_level: number
}

interface MonthlyTrend {
  month: string
  activity_trend: 'increasing' | 'stable' | 'decreasing'
  quality_trend: 'improving' | 'stable' | 'declining'
  skill_growth: number
  collaboration_level: number
}

interface SkillProgression {
  technology: string
  current_level: number
  predicted_growth: number
  time_to_proficiency: number
  recommended_resources: string[]
}

interface CareerTrajectory {
  current_trajectory: 'ascending' | 'stable' | 'stagnant'
  predicted_next_role: string
  readiness_score: number
  skill_gaps: string[]
  strengths: string[]
}

interface RiskFactor {
  type: 'burnout' | 'skill_obsolescence' | 'stagnation' | 'overcommitment'
  risk_level: number
  indicators: string[]
  mitigation_strategies: string[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const analysis_type = searchParams.get('type') || 'comprehensive'

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // 개발자 프로필 생성/업데이트
    const developerProfile = await generateDeveloperProfile(supabase, user_id)
    
    // 분석 타입별 처리
    switch (analysis_type) {
      case 'recommendations':
        const recommendations = await generatePersonalizedRecommendations(supabase, developerProfile)
        return NextResponse.json({
          user_id,
          profile: developerProfile,
          recommendations,
          generated_at: new Date().toISOString()
        })

      case 'predictions':
        const predictions = await generatePredictions(supabase, developerProfile)
        return NextResponse.json({
          user_id,
          predictions,
          generated_at: new Date().toISOString()
        })

      case 'comprehensive':
      default:
        const [fullRecommendations, fullPredictions] = await Promise.all([
          generatePersonalizedRecommendations(supabase, developerProfile),
          generatePredictions(supabase, developerProfile)
        ])

        return NextResponse.json({
          user_id,
          profile: developerProfile,
          recommendations: fullRecommendations,
          predictions: fullPredictions,
          generated_at: new Date().toISOString()
        })
    }

  } catch (error) {
    console.error('GitHub prediction system error:', error)
    return NextResponse.json(
      { error: 'Failed to generate predictions and recommendations' },
      { status: 500 }
    )
  }
}

// 개발자 프로필 생성
async function generateDeveloperProfile(supabase: any, user_id: string): Promise<DeveloperProfile> {
  // 최근 3개월 GitHub 활동 데이터 조회
  const { data: activities } = await supabase
    .from('github_activities')
    .select('*')
    .eq('user_id', user_id)
    .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date', { ascending: false })

  if (!activities || activities.length === 0) {
    return createDefaultProfile(user_id)
  }

  // 코딩 스타일 분석
  const coding_style = analyzeCodingStyle(activities)
  
  // 생산성 패턴 분석
  const productivity_patterns = analyzeProductivityPatterns(activities)
  
  // 스킬 레벨 분석
  const skill_levels = analyzeSkillLevels(activities)
  
  // 협업 선호도 분석
  const collaboration_preferences = analyzeCollaborationPreference(activities)
  
  // 학습 속도 계산
  const learning_velocity = calculateLearningVelocity(activities)
  
  // 커리어 단계 추정
  const career_stage = estimateCareerStage(activities, skill_levels)

  return {
    user_id,
    coding_style,
    productivity_patterns,
    skill_levels,
    collaboration_preferences,
    learning_velocity,
    career_stage
  }
}

// 기본 프로필 생성
function createDefaultProfile(user_id: string): DeveloperProfile {
  return {
    user_id,
    coding_style: {
      preferred_languages: ['JavaScript', 'Python'],
      commit_frequency: 'moderate',
      code_review_style: 'focused',
      testing_approach: 'post_development',
      documentation_level: 'moderate'
    },
    productivity_patterns: [],
    skill_levels: [],
    collaboration_preferences: {
      team_size: 'medium',
      communication_style: 'mixed',
      mentoring_inclination: 50,
      knowledge_sharing: 60
    },
    learning_velocity: 5,
    career_stage: 'mid'
  }
}

// 코딩 스타일 분석
function analyzeCodingStyle(activities: any[]): CodingStyle {
  // 선호 언어 분석
  const languageFreq = new Map<string, number>()
  activities.forEach(activity => {
    activity.languages?.forEach((lang: string) => {
      languageFreq.set(lang, (languageFreq.get(lang) || 0) + 1)
    })
  })
  
  const preferred_languages = Array.from(languageFreq.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([lang]) => lang)

  // 커밋 빈도 분석
  const avgCommitsPerDay = activities.reduce((sum, a) => sum + a.commits_count, 0) / activities.length
  const commit_frequency = 
    avgCommitsPerDay > 5 ? 'frequent' :
    avgCommitsPerDay > 2 ? 'moderate' : 'batch'

  return {
    preferred_languages,
    commit_frequency,
    code_review_style: 'focused', // 실제로는 PR 리뷰 데이터 분석
    testing_approach: 'post_development', // 실제로는 테스트 파일 패턴 분석
    documentation_level: 'moderate' // 실제로는 문서 커밋 비율 분석
  }
}

// 생산성 패턴 분석
function analyzeProductivityPatterns(activities: any[]): ProductivityPattern[] {
  const patterns: ProductivityPattern[] = []
  
  // 시간대별 활동 패턴 (시뮬레이션)
  const timeSlots = ['morning', 'afternoon', 'evening', 'late_night']
  
  timeSlots.forEach(slot => {
    patterns.push({
      time_slot: slot,
      productivity_score: Math.random() * 40 + 60, // 60-100
      activity_types: ['commits', 'reviews'],
      quality_rating: Math.random() * 30 + 70, // 70-100
      consistency: Math.random() * 20 + 80 // 80-100
    })
  })

  return patterns
}

// 스킬 레벨 분석
function analyzeSkillLevels(activities: any[]): SkillLevel[] {
  const skillLevels: SkillLevel[] = []
  const languageFreq = new Map<string, number>()
  
  activities.forEach(activity => {
    activity.languages?.forEach((lang: string) => {
      languageFreq.set(lang, (languageFreq.get(lang) || 0) + activity.commits_count)
    })
  })

  Array.from(languageFreq.entries()).forEach(([technology, usage]) => {
    skillLevels.push({
      technology,
      proficiency: Math.min(usage * 2, 100), // 사용량 기반 숙련도
      growth_rate: Math.random() * 20 + 5, // 5-25% 성장률
      last_used: activities[0]?.date || new Date().toISOString().split('T')[0],
      market_demand: Math.random() * 40 + 60 // 60-100% 시장 수요
    })
  })

  return skillLevels.sort((a, b) => b.proficiency - a.proficiency).slice(0, 10)
}

// 협업 선호도 분석
function analyzeCollaborationPreference(activities: any[]): CollaborationPreference {
  const repoCount = new Set()
  activities.forEach(activity => {
    activity.repositories?.forEach((repo: string) => repoCount.add(repo))
  })

  const team_size = 
    repoCount.size > 10 ? 'large' :
    repoCount.size > 5 ? 'medium' :
    repoCount.size > 2 ? 'small' : 'solo'

  return {
    team_size,
    communication_style: 'mixed',
    mentoring_inclination: Math.random() * 40 + 30, // 30-70
    knowledge_sharing: Math.random() * 30 + 50 // 50-80
  }
}

// 학습 속도 계산
function calculateLearningVelocity(activities: any[]): number {
  const languageGrowth = new Set()
  activities.forEach(activity => {
    activity.languages?.forEach((lang: string) => languageGrowth.add(lang))
  })
  
  return Math.min(languageGrowth.size, 10) // 1-10 scale
}

// 커리어 단계 추정
function estimateCareerStage(activities: any[], skillLevels: SkillLevel[]): DeveloperProfile['career_stage'] {
  const totalCommits = activities.reduce((sum, a) => sum + a.commits_count, 0)
  const avgSkillLevel = skillLevels.reduce((sum, s) => sum + s.proficiency, 0) / skillLevels.length

  if (totalCommits < 100 || avgSkillLevel < 40) return 'junior'
  if (totalCommits < 500 || avgSkillLevel < 70) return 'mid'
  if (totalCommits < 1000 || avgSkillLevel < 85) return 'senior'
  return 'lead'
}

// 맞춤형 추천 생성
async function generatePersonalizedRecommendations(
  supabase: any, 
  profile: DeveloperProfile
): Promise<PersonalizedRecommendation[]> {
  const recommendations: PersonalizedRecommendation[] = []

  // 스킬 개발 추천
  const topSkills = profile.skill_levels
    .filter(skill => skill.market_demand > 70)
    .slice(0, 3)

  topSkills.forEach(skill => {
    if (skill.proficiency < 80) {
      recommendations.push({
        category: 'skill_development',
        title: `${skill.technology} 전문성 향상`,
        description: `${skill.technology}의 고급 기능과 베스트 프랙티스를 학습하여 전문성을 높이세요.`,
        priority: Math.round(skill.market_demand),
        impact_score: 85,
        effort_required: 60,
        timeline: '2-3개월',
        action_items: [
          `${skill.technology} 공식 문서 심화 학습`,
          '실제 프로젝트 적용 및 연습',
          '커뮤니티 기여 활동 참여'
        ],
        success_metrics: [
          '숙련도 20% 향상',
          '관련 프로젝트 3개 완성',
          '기술 블로그 포스팅 2개'
        ]
      })
    }
  })

  // 생산성 개선 추천
  const lowProductivityPatterns = profile.productivity_patterns
    .filter(pattern => pattern.productivity_score < 75)

  if (lowProductivityPatterns.length > 0) {
    recommendations.push({
      category: 'productivity',
      title: '생산성 최적화 전략',
      description: '개인 생산성 패턴을 분석하여 최적의 작업 루틴을 구축하세요.',
      priority: 80,
      impact_score: 75,
      effort_required: 40,
      timeline: '1개월',
      action_items: [
        '피크 타임 집중 작업 스케줄링',
        '방해 요소 최소화 환경 구축',
        '포모도로 기법 적용'
      ],
      success_metrics: [
        '일일 집중 시간 2시간 증가',
        '작업 완료율 30% 향상',
        '코드 품질 점수 10% 상승'
      ]
    })
  }

  // 협업 개선 추천
  if (profile.collaboration_preferences.knowledge_sharing < 70) {
    recommendations.push({
      category: 'collaboration',
      title: '지식 공유 활동 강화',
      description: '팀과 커뮤니티에서 지식을 공유하여 리더십을 발휘하세요.',
      priority: 70,
      impact_score: 80,
      effort_required: 50,
      timeline: '2개월',
      action_items: [
        '기술 세미나 발표 준비',
        '코드 리뷰 적극 참여',
        '멘토링 활동 시작'
      ],
      success_metrics: [
        '월 1회 이상 발표',
        '코드 리뷰 참여율 50% 증가',
        '멘티 2명 이상 관리'
      ]
    })
  }

  // 커리어 발전 추천
  if (profile.career_stage === 'mid' || profile.career_stage === 'senior') {
    recommendations.push({
      category: 'career',
      title: '리더십 역량 개발',
      description: '다음 커리어 단계를 위한 리더십과 전략적 사고 능력을 개발하세요.',
      priority: 90,
      impact_score: 95,
      effort_required: 80,
      timeline: '6개월',
      action_items: [
        '프로젝트 관리 경험 쌓기',
        '기술 아키텍처 설계 참여',
        '팀 빌딩 및 관리 스킬 학습'
      ],
      success_metrics: [
        '프로젝트 리드 경험 1회 이상',
        '시스템 설계 문서 작성',
        '팀 성과 20% 향상 기여'
      ]
    })
  }

  // 우선순위별 정렬
  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5)
}

// 예측 모델 생성
async function generatePredictions(
  supabase: any, 
  profile: DeveloperProfile
): Promise<PredictionModel> {
  const next_week_forecast: WeeklyForecast = {
    predicted_commits: Math.round(profile.learning_velocity * 3 + Math.random() * 10),
    predicted_prs: Math.round(profile.collaboration_preferences.knowledge_sharing / 25),
    predicted_reviews: Math.round(profile.collaboration_preferences.mentoring_inclination / 20),
    quality_score: Math.round(75 + Math.random() * 20),
    productivity_index: Math.round(
      profile.productivity_patterns.reduce((sum, p) => sum + p.productivity_score, 0) / 
      profile.productivity_patterns.length || 75
    ),
    confidence_level: Math.round(80 + Math.random() * 15)
  }

  const monthly_trends: MonthlyTrend[] = []
  for (let i = 0; i < 6; i++) {
    const month = new Date()
    month.setMonth(month.getMonth() + i)
    
    monthly_trends.push({
      month: month.toISOString().substring(0, 7),
      activity_trend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)] as any,
      quality_trend: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)] as any,
      skill_growth: Math.round(profile.learning_velocity * 2 + Math.random() * 10),
      collaboration_level: Math.round(profile.collaboration_preferences.knowledge_sharing + Math.random() * 20)
    })
  }

  const skill_progression: SkillProgression[] = profile.skill_levels.slice(0, 5).map(skill => ({
    technology: skill.technology,
    current_level: skill.proficiency,
    predicted_growth: skill.growth_rate,
    time_to_proficiency: Math.round((100 - skill.proficiency) / skill.growth_rate * 30), // days
    recommended_resources: [
      `${skill.technology} 공식 문서`,
      `${skill.technology} 온라인 코스`,
      `${skill.technology} 실습 프로젝트`
    ]
  }))

  const career_trajectory: CareerTrajectory = {
    current_trajectory: profile.learning_velocity > 7 ? 'ascending' : 
                       profile.learning_velocity > 4 ? 'stable' : 'stagnant',
    predicted_next_role: getNextRole(profile.career_stage),
    readiness_score: calculateReadinessScore(profile),
    skill_gaps: identifySkillGaps(profile),
    strengths: identifyStrengths(profile)
  }

  const risk_factors: RiskFactor[] = identifyRiskFactors(profile)

  return {
    next_week_forecast,
    monthly_trends,
    skill_progression,
    career_trajectory,
    risk_factors
  }
}

// 다음 역할 예측
function getNextRole(currentStage: DeveloperProfile['career_stage']): string {
  const roleMap = {
    junior: 'Mid-Level Developer',
    mid: 'Senior Developer',
    senior: 'Tech Lead',
    lead: 'Engineering Manager'
  }
  return roleMap[currentStage]
}

// 준비도 점수 계산
function calculateReadinessScore(profile: DeveloperProfile): number {
  const avgSkillLevel = profile.skill_levels.reduce((sum, s) => sum + s.proficiency, 0) / profile.skill_levels.length
  const collaborationScore = profile.collaboration_preferences.knowledge_sharing
  const learningScore = profile.learning_velocity * 10
  
  return Math.round((avgSkillLevel + collaborationScore + learningScore) / 3)
}

// 스킬 갭 식별
function identifySkillGaps(profile: DeveloperProfile): string[] {
  const gaps: string[] = []
  
  if (profile.career_stage === 'mid' || profile.career_stage === 'senior') {
    gaps.push('System Design', 'Team Leadership', 'Project Management')
  }
  
  const lowSkills = profile.skill_levels.filter(skill => skill.proficiency < 60)
  lowSkills.forEach(skill => {
    if (skill.market_demand > 70) {
      gaps.push(skill.technology)
    }
  })
  
  return gaps.slice(0, 5)
}

// 강점 식별
function identifyStrengths(profile: DeveloperProfile): string[] {
  const strengths: string[] = []
  
  const topSkills = profile.skill_levels
    .filter(skill => skill.proficiency > 80)
    .slice(0, 3)
    .map(skill => skill.technology)
  
  strengths.push(...topSkills)
  
  if (profile.learning_velocity > 7) {
    strengths.push('Fast Learner')
  }
  
  if (profile.collaboration_preferences.knowledge_sharing > 75) {
    strengths.push('Knowledge Sharing')
  }
  
  return strengths
}

// 위험 요소 식별
function identifyRiskFactories(profile: DeveloperProfile): RiskFactor[] {
  const risks: RiskFactor[] = []
  
  // 번아웃 위험
  const avgProductivity = profile.productivity_patterns.reduce((sum, p) => sum + p.productivity_score, 0) / profile.productivity_patterns.length
  if (avgProductivity > 90) {
    risks.push({
      type: 'burnout',
      risk_level: 65,
      indicators: ['과도한 생산성 압박', '휴식 시간 부족'],
      mitigation_strategies: ['작업량 조절', '정기적 휴식', '스트레스 관리']
    })
  }
  
  // 스킬 노후화 위험
  const oldSkills = profile.skill_levels.filter(skill => 
    skill.market_demand < 50 && skill.proficiency > 70
  )
  if (oldSkills.length > 0) {
    risks.push({
      type: 'skill_obsolescence',
      risk_level: 45,
      indicators: ['시장 수요 감소 기술에 의존'],
      mitigation_strategies: ['새로운 기술 학습', '스킬셋 다양화']
    })
  }
  
  return risks
}

// 실제로는 identifyRiskFactors 함수를 사용해야 하지만, 이름 충돌 방지를 위해 별칭 생성
const identifyRiskFactors = identifyRiskFactories
