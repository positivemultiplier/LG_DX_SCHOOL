'use client'

import { useEffect, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './use-auth'

interface GitHubActivity {
  id: string
  user_id: string
  activity_date: string
  commits_count: number
  additions: number
  deletions: number
  repositories_count: number
  activity_level: number
  languages_used: string[]
  created_at: string
  updated_at: string
}

interface GitHubActivityRecord {
  id: string
  user_id: string
  repository_name: string
  repository_owner: string
  event_type: string
  commit_sha?: string
  commit_message?: string
  additions?: number
  deletions?: number
  programming_language?: string
  occurred_at: string
  created_at: string
}

interface RealtimeGitHubState {
  activities: GitHubActivity[]
  activityRecords: GitHubActivityRecord[]
  isConnected: boolean
  lastUpdate: Date | null
  error: string | null
  syncStatus: {
    isActive: boolean
    lastSyncAt: Date | null
    progress: number
  }
}

export function useRealtimeGitHub() {
  const { user } = useAuth()
  const [state, setState] = useState<RealtimeGitHubState>({
    activities: [],
    activityRecords: [],
    isConnected: false,
    lastUpdate: null,
    error: null,
    syncStatus: {
      isActive: false,
      lastSyncAt: null,
      progress: 0
    }
  })
  const [channels, setChannels] = useState<RealtimeChannel[]>([])

  useEffect(() => {
    if (!user?.id) return

    const activitiesChannel = supabase
      .channel(`github_activities:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'github_activities',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newActivity = payload.new as GitHubActivity
          setState(prev => ({
            ...prev,
            activities: [...prev.activities, newActivity],
            lastUpdate: new Date(),
            error: null
          }))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'github_activities',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedActivity = payload.new as GitHubActivity
          setState(prev => ({
            ...prev,
            activities: prev.activities.map(activity =>
              activity.id === updatedActivity.id ? updatedActivity : activity
            ),
            lastUpdate: new Date(),
            error: null
          }))
        }
      )

    const activityRecordsChannel = supabase
      .channel(`github_activity_records:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'github_activity_records',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newRecord = payload.new as GitHubActivityRecord
          setState(prev => ({
            ...prev,
            activityRecords: [...prev.activityRecords, newRecord],
            lastUpdate: new Date(),
            error: null
          }))
        }
      )

    const syncStatusChannel = supabase
      .channel(`github_sync_status:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'github_sync_status',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const syncData = payload.new as any
          if (syncData) {
            setState(prev => ({
              ...prev,
              syncStatus: {
                isActive: syncData.is_syncing || false,
                lastSyncAt: syncData.last_sync_at ? new Date(syncData.last_sync_at) : null,
                progress: syncData.sync_progress || 0
              },
              lastUpdate: new Date(),
              error: null
            }))
          }
        }
      )

    // 모든 채널 구독
    const allChannels = [activitiesChannel, activityRecordsChannel, syncStatusChannel]
    
    Promise.all(allChannels.map(channel => 
      channel.subscribe((status) => {
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          error: status === 'CHANNEL_ERROR' ? 'GitHub realtime connection failed' : null
        }))
      })
    ))

    setChannels(allChannels)

    return () => {
      allChannels.forEach(channel => channel.unsubscribe())
    }
  }, [user?.id])

  // 연결 상태 재설정
  const reconnect = () => {
    channels.forEach(channel => channel.unsubscribe())
    setChannels([])
    
    setState(prev => ({
      ...prev,
      isConnected: false,
      error: null
    }))
  }

  // GitHub 데이터 새로고침
  const refreshGitHubData = async () => {
    if (!user?.id) return

    try {
      setState(prev => ({
        ...prev,
        error: null
      }))

      // GitHub 활동 데이터 다시 가져오기
      const { data: activities, error: activitiesError } = await supabase
        .from('github_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false })
        .limit(30)

      if (activitiesError) throw activitiesError

      // 최근 활동 기록 가져오기
      const { data: records, error: recordsError } = await supabase
        .from('github_activity_records')
        .select('*')
        .eq('user_id', user.id)
        .order('occurred_at', { ascending: false })
        .limit(100)

      if (recordsError) throw recordsError

      setState(prev => ({
        ...prev,
        activities: activities || [],
        activityRecords: records || [],
        lastUpdate: new Date()
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh GitHub data'
      }))
    }
  }

  // GitHub 동기화 트리거
  const triggerSync = async () => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to start GitHub sync')
      }

      setState(prev => ({
        ...prev,
        syncStatus: {
          ...prev.syncStatus,
          isActive: true,
          progress: 0
        }
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start sync'
      }))
    }
  }

  return {
    activities: state.activities,
    activityRecords: state.activityRecords,
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
    error: state.error,
    syncStatus: state.syncStatus,
    reconnect,
    refreshGitHubData,
    triggerSync
  }
}