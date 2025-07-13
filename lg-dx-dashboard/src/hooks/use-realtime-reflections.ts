'use client'

import { useEffect, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { DailyReflection } from '@/types/database'
import { useAuth } from './use-auth'

interface RealtimeReflectionsState {
  reflections: DailyReflection[]
  isConnected: boolean
  lastUpdate: Date | null
  error: string | null
}

export function useRealtimeReflections(initialReflections: DailyReflection[] = []) {
  const { user } = useAuth()
  const [state, setState] = useState<RealtimeReflectionsState>({
    reflections: initialReflections,
    isConnected: false,
    lastUpdate: null,
    error: null
  })
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!user?.id) return

    // Realtime 채널 설정
    const realtimeChannel = supabase
      .channel(`reflections:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_reflections',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newReflection = payload.new as DailyReflection
          setState(prev => ({
            ...prev,
            reflections: [...prev.reflections, newReflection],
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
          table: 'daily_reflections',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedReflection = payload.new as DailyReflection
          setState(prev => ({
            ...prev,
            reflections: prev.reflections.map(reflection =>
              reflection.id === updatedReflection.id ? updatedReflection : reflection
            ),
            lastUpdate: new Date(),
            error: null
          }))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'daily_reflections',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const deletedReflection = payload.old as DailyReflection
          setState(prev => ({
            ...prev,
            reflections: prev.reflections.filter(reflection =>
              reflection.id !== deletedReflection.id
            ),
            lastUpdate: new Date(),
            error: null
          }))
        }
      )
      .subscribe((status) => {
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          error: status === 'CHANNEL_ERROR' ? 'Connection failed' : null
        }))
      })

    setChannel(realtimeChannel)

    return () => {
      if (realtimeChannel) {
        realtimeChannel.unsubscribe()
      }
    }
  }, [user?.id])

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

  // 실시간 리플렉션 추가 (로컬 업데이트)
  const addRealtimeReflection = (reflection: DailyReflection) => {
    setState(prev => ({
      ...prev,
      reflections: [...prev.reflections, reflection],
      lastUpdate: new Date()
    }))
  }

  // 실시간 리플렉션 업데이트 (로컬 업데이트)
  const updateRealtimeReflection = (id: string, updates: Partial<DailyReflection>) => {
    setState(prev => ({
      ...prev,
      reflections: prev.reflections.map(reflection =>
        reflection.id === id ? { ...reflection, ...updates } : reflection
      ),
      lastUpdate: new Date()
    }))
  }

  // 실시간 리플렉션 삭제 (로컬 업데이트)
  const removeRealtimeReflection = (id: string) => {
    setState(prev => ({
      ...prev,
      reflections: prev.reflections.filter(reflection => reflection.id !== id),
      lastUpdate: new Date()
    }))
  }

  return {
    reflections: state.reflections,
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
    error: state.error,
    reconnect,
    addRealtimeReflection,
    updateRealtimeReflection,
    removeRealtimeReflection
  }
}