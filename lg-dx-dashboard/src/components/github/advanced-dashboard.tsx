'use client'

/**
 * Phase 3: Advanced GitHub Analytics Dashboard
 * 고급 GitHub 분석 및 인사이트 대시보드
 */

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  GitBranch,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Code,
  GitCommit,
  Activity,
  Target,
  Zap,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

// 색상 팔레트
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

interface GitHubAnalytics {
  summary: {
    total_repositories: number
    total_commits: number
    total_contributions: number
    most_used_language: string
    activity_streak: number
  }
  activities: Array<{
    date: string
    commits_count: number
    repositories_count: number
    activity_level: number
    languages_used: string[]
    pull_requests: number
    issues: number
    reviews: number
  }>
  repositories: Array<{
    name: string
    language: string
    size: number
    stargazers_count: number
    commits_count: number
    updated_at: string
  }>
  trends: {
    commits_trend: number
    activity_trend: number
    languages_diversity: number
    consistency_score: number
  }
}

interface SyncStatus {
  status: 'idle' | 'syncing' | 'completed' | 'error'
  progress: number
  step_description: string
  error_message?: string
}

export function AdvancedGitHubDashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<GitHubAnalytics | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ 
    status: 'idle', 
    progress: 0, 
    step_description: 'Ready to sync' 
  })
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)

      // GitHub 활동 데이터 로드
      const activitiesResponse = await fetch(`/api/github/activities?user_id=${user.id}&days=30`)
      const activitiesData = await activitiesResponse.json()

      if (activitiesResponse.ok && activitiesData.activities) {
        // 분석 데이터 생성
        const summary = generateSummary(activitiesData.activities, activitiesData.repositories || [])
        const trends = calculateTrends(activitiesData.activities)

        setAnalytics({
          summary,
          activities: activitiesData.activities,
          repositories: activitiesData.repositories || [],
          trends
        })

        setLastSync(activitiesData.last_sync || null)
      }

      // 동기화 상태 확인
      const syncResponse = await fetch(`/api/github/sync-advanced?user_id=${user.id}`)
      const syncData = await syncResponse.json()

      if (syncResponse.ok && syncData.current_sync) {
        setSyncStatus({
          status: syncData.current_sync.status,
          progress: syncData.current_sync.progress || 0,
          step_description: syncData.current_sync.step_description || 'Ready to sync',
          error_message: syncData.current_sync.error_message
        })
      }

    } catch {
      // 에러는 이미 로깅되었으므로 무시
    } finally {
      setLoading(false)
    }
  }, [user])

  const startAdvancedSync = async () => {
    if (!user) return

    try {
      setSyncStatus({ status: 'syncing', progress: 0, step_description: 'Starting sync...' })

      const response = await fetch('/api/github/sync-advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id, 
          force_full_sync: true 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSyncStatus({ 
          status: 'completed', 
          progress: 100, 
          step_description: 'Sync completed successfully!' 
        })
        
        // 데이터 새로고침
        setTimeout(() => {
          loadAnalytics()
        }, 1000)
      } else {
        setSyncStatus({ 
          status: 'error', 
          progress: 0, 
          step_description: 'Sync failed',
          error_message: data.error || 'Unknown error'
        })
      }
    } catch {
      setSyncStatus({ 
        status: 'error', 
        progress: 0, 
        step_description: 'Sync failed',
        error_message: 'Network error'
      })
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const generateSummary = (
    activities: Array<{ 
      commits_count: number; 
      pull_requests: number; 
      issues: number; 
      date: string 
    }>, 
    repositories: Array<{ 
      language: string 
    }>
  ) => {
    const totalCommits = activities.reduce((sum, activity) => sum + activity.commits_count, 0)
    const totalContributions = activities.reduce((sum, activity) => 
      sum + activity.commits_count + activity.pull_requests + activity.issues, 0
    )

    // 언어 사용 빈도 계산
    const languageCount = new Map<string, number>()
    repositories.forEach(repo => {
      if (repo.language) {
        languageCount.set(repo.language, (languageCount.get(repo.language) || 0) + 1)
      }
    })

    let mostUsedLanguage = 'Unknown'
    let maxCount = 0
    for (const [language, count] of languageCount) {
      if (count > maxCount) {
        maxCount = count
        mostUsedLanguage = language
      }
    }

    // 활동 연속 일수 계산
    const sortedActivities = [...activities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    let activityStreak = 0
    for (const activity of sortedActivities) {
      if (activity.commits_count > 0) {
        activityStreak++
      } else {
        break
      }
    }

    return {
      total_repositories: repositories.length,
      total_commits: totalCommits,
      total_contributions: totalContributions,
      most_used_language: mostUsedLanguage,
      activity_streak: activityStreak
    }
  }

  const calculateTrends = (
    activities: Array<{ 
      commits_count: number; 
      date: string; 
      languages_used?: string[] 
    }>
  ) => {
    if (activities.length < 7) {
      return {
        commits_trend: 0,
        activity_trend: 0,
        languages_diversity: 0,
        consistency_score: 0
      }
    }

    const sortedActivities = [...activities].sort((a, b) => a.date.localeCompare(b.date))
    
    // 최근 7일 vs 이전 7일 비교
    const recent7Days = sortedActivities.slice(-7)
    const previous7Days = sortedActivities.slice(-14, -7)

    const recentCommits = recent7Days.reduce((sum, a) => sum + a.commits_count, 0)
    const previousCommits = previous7Days.reduce((sum, a) => sum + a.commits_count, 0)

    const commitsTrend = previousCommits > 0 
      ? ((recentCommits - previousCommits) / previousCommits) * 100 
      : recentCommits > 0 ? 100 : 0

    // 일관성 점수 (0-100)
    const activeDays = sortedActivities.filter(a => a.commits_count > 0).length
    const consistencyScore = (activeDays / sortedActivities.length) * 100

    // 언어 다양성
    const allLanguages = new Set()
    activities.forEach(activity => {
      activity.languages_used?.forEach((lang: string) => allLanguages.add(lang))
    })

    return {
      commits_trend: Math.round(commitsTrend),
      activity_trend: Math.round(commitsTrend), // 간단화
      languages_diversity: allLanguages.size,
      consistency_score: Math.round(consistencyScore)
    }
  }

  const formatActivityData = () => {
    if (!analytics?.activities) return []
    
    return analytics.activities.slice(-14).map(activity => ({
      date: new Date(activity.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      commits: activity.commits_count,
      prs: activity.pull_requests,
      issues: activity.issues,
      total: activity.commits_count + activity.pull_requests + activity.issues
    }))
  }

  const formatLanguageData = () => {
    if (!analytics?.repositories) return []

    const languageCount = new Map<string, number>()
    analytics.repositories.forEach(repo => {
      if (repo.language) {
        languageCount.set(repo.language, (languageCount.get(repo.language) || 0) + 1)
      }
    })

    return Array.from(languageCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">GitHub Analytics</h1>
          <Button disabled>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">GitHub Analytics</h1>
          <Button onClick={startAdvancedSync}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync GitHub Data
          </Button>
        </div>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="mr-2 h-4 w-4" />
              No GitHub Data Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-orange-700">
              Connect your GitHub account and sync your data to see analytics.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">GitHub Analytics</h1>
          <p className="text-muted-foreground">
            Advanced insights into your coding activity and productivity
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={startAdvancedSync}
            disabled={syncStatus.status === 'syncing'}
          >
            {syncStatus.status === 'syncing' ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {syncStatus.status === 'syncing' ? 'Syncing...' : 'Sync Data'}
          </Button>
        </div>
      </div>

      {/* 동기화 상태 */}
      {syncStatus.status === 'syncing' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 animate-pulse" />
              Syncing GitHub Data
            </CardTitle>
            <CardDescription>{syncStatus.step_description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={syncStatus.progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {syncStatus.progress}% complete
            </p>
          </CardContent>
        </Card>
      )}

      {syncStatus.status === 'error' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Sync Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-red-700">
              {syncStatus.error_message}
            </CardDescription>
          </CardContent>
        </Card>
      )}

      {/* 요약 통계 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.total_repositories}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.trends.commits_trend > 0 ? '+' : ''}{analytics.trends.commits_trend}% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commits</CardTitle>
            <GitCommit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.total_commits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.trends.commits_trend > 0 ? (
                <TrendingUp className="inline h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="inline h-3 w-3 mr-1" />
              )}
              {Math.abs(analytics.trends.commits_trend)}% trend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.activity_streak}</div>
            <p className="text-xs text-muted-foreground">
              consecutive days with commits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consistency Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.trends.consistency_score}%</div>
            <p className="text-xs text-muted-foreground">
              coding consistency rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 활동 트렌드 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity (Last 14 Days)</CardTitle>
            <CardDescription>Commits, Pull Requests, and Issues</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formatActivityData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="commits" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="prs" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="issues" stackId="1" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 언어 분포 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>Most used programming languages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formatLanguageData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {formatLanguageData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 인사이트 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🎯 Primary Language</h4>
              <Badge variant="secondary" className="mb-2">
                <Code className="mr-1 h-3 w-3" />
                {analytics.summary.most_used_language}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Your most frequently used programming language
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">📈 Activity Trend</h4>
              <Badge variant={analytics.trends.commits_trend > 0 ? "default" : "destructive"}>
                {analytics.trends.commits_trend > 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {analytics.trends.commits_trend > 0 ? '+' : ''}{analytics.trends.commits_trend}%
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Weekly change in commit activity
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-2">
            <h4 className="font-semibold">💡 Recommendations</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {analytics.trends.consistency_score < 50 && (
                <li>• Try to maintain more consistent daily coding habits</li>
              )}
              {analytics.summary.activity_streak < 3 && (
                <li>• Build a coding streak by committing code daily</li>
              )}
              {analytics.trends.languages_diversity < 3 && (
                <li>• Consider exploring new programming languages or technologies</li>
              )}
              {analytics.trends.commits_trend < 0 && (
                <li>• Your recent activity has decreased - consider setting daily goals</li>
              )}
            </ul>
          </div>

          {lastSync && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last synced: {new Date(lastSync).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
