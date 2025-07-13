'use client'

import { useEffect, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './use-auth'

interface DailyStatistics {
  id: string
  user_id: string
  date: string
  total_reflections: number
  avg_score: number
  morning_score: number | null
  afternoon_score: number | null
  evening_score: number | null
  github_commits: number
  created_at: string
  updated_at: string
}

interface RealtimeStatisticsState {
  dailyStats: DailyStatistics[]
  todayStats: DailyStatistics | null
  weeklyAverage: {
    avgScore: number
    totalReflections: number
    totalCommits: number
    consistency: number
  }
  isConnected: boolean
  lastUpdate: Date | null
  error: string | null
}

export function useRealtimeStatistics() {
  const { user } = useAuth()
  const [state, setState] = useState<RealtimeStatisticsState>({
    dailyStats: [],
    todayStats: null,
    weeklyAverage: {
      avgScore: 0,
      totalReflections: 0,
      totalCommits: 0,
      consistency: 0
    },
    isConnected: false,
    lastUpdate: null,
    error: null
  })
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // 주간 평균 계산 함수
  const calculateWeeklyAverage = (stats: DailyStatistics[]) => {
    if (stats.length === 0) {
      return {
        avgScore: 0,
        totalReflections: 0,
        totalCommits: 0,
        consistency: 0
      }
    }

    const totalScore = stats.reduce((sum, stat) => sum + (stat.avg_score || 0), 0)
    const totalReflections = stats.reduce((sum, stat) => sum + stat.total_reflections, 0)
    const totalCommits = stats.reduce((sum, stat) => sum + stat.github_commits, 0)
    
    // 일관성 계산 (연속 학습 일수 기반)
    const activeDays = stats.filter(stat => stat.total_reflections > 0).length
    const consistency = stats.length > 0 ? (activeDays / stats.length) * 100 : 0

    return {
      avgScore: totalScore / stats.length,
      totalReflections,
      totalCommits,
      consistency
    }
  }

  useEffect(() => {
    if (!user?.id) return

    // 실시간 통계 채널 설정
    const statisticsChannel = supabase
      .channel(`daily_statistics:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_statistics',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newStats = payload.new as DailyStatistics
          setState(prev => {
            const updatedStats = [...prev.dailyStats, newStats]
            const today = new Date().toISOString().split('T')[0]
            
            return {
              ...prev,
              dailyStats: updatedStats,
              todayStats: newStats.date === today ? newStats : prev.todayStats,
              weeklyAverage: calculateWeeklyAverage(updatedStats.slice(-7)),
              lastUpdate: new Date(),
              error: null
            }
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'daily_statistics',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedStats = payload.new as DailyStatistics
          setState(prev => {
            const updatedDailyStats = prev.dailyStats.map(stat =>
              stat.id === updatedStats.id ? updatedStats : stat
            )
            const today = new Date().toISOString().split('T')[0]
            
            return {
              ...prev,
              dailyStats: updatedDailyStats,
              todayStats: updatedStats.date === today ? updatedStats : prev.todayStats,
              weeklyAverage: calculateWeeklyAverage(updatedDailyStats.slice(-7)),
              lastUpdate: new Date(),
              error: null
            }
          })
        }
      )
      .subscribe((status) => {
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          error: status === 'CHANNEL_ERROR' ? 'Statistics connection failed' : null
        }))
      })

    setChannel(statisticsChannel)

    // 초기 데이터 로드
    loadInitialStatistics()

    return () => {
      if (statisticsChannel) {
        statisticsChannel.unsubscribe()
      }
    }
  }, [user?.id])

  // 초기 통계 데이터 로드
  const loadInitialStatistics = async () => {
    if (!user?.id) return

    try {
      // 최근 30일 통계 가져오기
      const { data: stats, error } = await supabase
        .from('daily_statistics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30)

      if (error) throw error

      const today = new Date().toISOString().split('T')[0]
      const todayStats = stats?.find(stat => stat.date === today) || null

      setState(prev => ({
        ...prev,
        dailyStats: stats || [],
        todayStats,
        weeklyAverage: calculateWeeklyAverage((stats || []).slice(-7)),
        lastUpdate: new Date()
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load statistics'
      }))
    }
  }

  // 연결 상태 재설정
  const reconnect = () => {
    if (channel) {
      channel.unsubscribe()
      setChannel(null)
    }
    
    setState(prev => ({
      ...prev,
      isConnected: false,
      error: null
    }))
  }

  // 통계 새로고침
  const refreshStatistics = async () => {
    await loadInitialStatistics()
  }

  // 오늘 통계 업데이트 (로컬)
  const updateTodayStats = (updates: Partial<DailyStatistics>) => {
    setState(prev => {
      if (!prev.todayStats) return prev

      const updatedTodayStats = { ...prev.todayStats, ...updates }
      const updatedDailyStats = prev.dailyStats.map(stat =>
        stat.id === updatedTodayStats.id ? updatedTodayStats : stat
      )

      return {
        ...prev,
        todayStats: updatedTodayStats,
        dailyStats: updatedDailyStats,
        weeklyAverage: calculateWeeklyAverage(updatedDailyStats.slice(-7)),
        lastUpdate: new Date()
      }
    })
  }

  return {
    dailyStats: state.dailyStats,
    todayStats: state.todayStats,
    weeklyAverage: state.weeklyAverage,
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
    error: state.error,
    reconnect,
    refreshStatistics,
    updateTodayStats
  }
}