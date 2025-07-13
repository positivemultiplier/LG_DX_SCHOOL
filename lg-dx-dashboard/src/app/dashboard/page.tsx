'use client'

import { useAuthContext } from '@/components/providers/auth-provider'
import { TodaySummary } from '@/components/dashboard/today-summary'
import { WeeklyOverview } from '@/components/dashboard/weekly-overview'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Calendar, Settings, LogOut, Database, RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const { user, signOut, loading } = useAuthContext()
  const [dashboardData, setDashboardData] = useState({
    todayReflections: [],
    weeklyData: [],
    loading: true
  })
  const [migrationStatus, setMigrationStatus] = useState({
    hasData: false,
    needsMigration: false
  })

  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadDashboardData()
      checkMigrationStatus()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      // 오늘의 리플렉션 데이터 로드
      const today = new Date().toISOString().split('T')[0]
      
      const { data: todayData, error: todayError } = await supabase
        .from('daily_reflections')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)

      if (todayError) {
        console.error('오늘 데이터 로드 오류:', todayError)
        // 테이블이 없는 경우 설정 페이지로 리다이렉트
        if (todayError.message.includes('does not exist')) {
          window.location.href = '/setup'
          return
        }
      }

      // 주간 데이터 로드 (최근 7일)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('daily_reflections')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekAgo.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (weeklyError) {
        console.error('주간 데이터 로드 오류:', weeklyError)
      }

      // 데이터 포맷팅
      const formattedTodayData = ['morning', 'afternoon', 'evening'].map(timePart => {
        const reflection = todayData?.find(r => r.time_part === timePart)
        return {
          time_part: timePart,
          understanding_score: reflection?.understanding_score || null,
          concentration_score: reflection?.concentration_score || null,
          achievement_score: reflection?.achievement_score || null,
          total_score: reflection?.total_score || null,
          condition: reflection?.condition || null,
          github_commits: reflection?.github_commits || 0,
          completed: !!reflection
        }
      })

      setDashboardData({
        todayReflections: formattedTodayData,
        weeklyData: weeklyData || [],
        loading: false
      })

    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error)
      setDashboardData(prev => ({ ...prev, loading: false }))
    }
  }

  const checkMigrationStatus = async () => {
    try {
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id')
        .limit(1)

      const { data: reflections } = await supabase
        .from('daily_reflections')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      setMigrationStatus({
        hasData: (subjects?.length || 0) > 0,
        needsMigration: (reflections?.length || 0) === 0
      })
    } catch (error) {
      console.error('마이그레이션 상태 확인 오류:', error)
    }
  }

  const runMigration = async () => {
    try {
      const response = await fetch('/api/migration/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ import_type: 'all' })
      })

      if (response.ok) {
        await loadDashboardData()
        await checkMigrationStatus()
      }
    } catch (error) {
      console.error('마이그레이션 실행 오류:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  const todayReflectionStatus = {
    morning: dashboardData.todayReflections.find(r => r.time_part === 'morning')?.completed || false,
    afternoon: dashboardData.todayReflections.find(r => r.time_part === 'afternoon')?.completed || false,
    evening: dashboardData.todayReflections.find(r => r.time_part === 'evening')?.completed || false
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                LG DX Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                안녕하세요, {user?.user_metadata?.name || user?.email?.split('@')[0]}님!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  설정
                </Link>
              </Button>
              <Button 
                onClick={() => signOut()}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Migration Status Banner */}
      {migrationStatus.needsMigration && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">데이터 초기화가 필요합니다</div>
                  <div className="text-sm text-blue-700">샘플 데이터를 생성하여 대시보드를 시작해보세요</div>
                </div>
              </div>
              <Button onClick={runMigration} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                데이터 생성
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-8">
          
          {/* 오늘의 3-Part 요약 */}
          <TodaySummary 
            data={dashboardData.todayReflections}
            loading={dashboardData.loading}
          />

          {/* 메인 컨텐츠 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 주간 트렌드 (2/3 width) */}
            <div className="lg:col-span-2">
              <WeeklyOverview 
                data={dashboardData.weeklyData}
                loading={dashboardData.loading}
              />
            </div>

            {/* 빠른 액션 (1/3 width) */}
            <div className="lg:col-span-1">
              <QuickActions 
                todayReflections={todayReflectionStatus}
                currentTimePart="morning"
              />
            </div>
          </div>

          {/* 추가 정보 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>이번 주 목표</CardDescription>
                <CardTitle className="text-lg">21개 리플렉션</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(todayReflectionStatus).filter(Boolean).length * 7}/21
                </div>
                <p className="text-xs text-muted-foreground">완료율 기준 예상</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>학습 연속일</CardDescription>
                <CardTitle className="text-lg">스트릭</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">3일</div>
                <p className="text-xs text-muted-foreground">연속 학습 기록</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>GitHub 기여</CardDescription>
                <CardTitle className="text-lg">이번 주</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">42</div>
                <p className="text-xs text-muted-foreground">총 커밋 수</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>학습 시간</CardDescription>
                <CardTitle className="text-lg">오늘</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">8.5h</div>
                <p className="text-xs text-muted-foreground">예상 학습 시간</p>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  )
}