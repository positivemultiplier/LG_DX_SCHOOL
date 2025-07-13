'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from './use-auth'
import { RealtimeConnectionManager } from '@/lib/realtime/connection-manager'

interface OptimizedRealtimeOptions {
  tableName: string
  enableBatteryOptimization?: boolean
  retryAttempts?: number
  heartbeatInterval?: number
  bufferTime?: number // 배치 업데이트를 위한 버퍼 시간 (ms)
}

interface RealtimeState<T> {
  data: T[]
  isConnected: boolean
  lastUpdate: Date | null
  error: string | null
  subscriptionId: string | null
  connectionStats: {
    reconnectCount: number
    lastReconnect: Date | null
    averageLatency: number
  }
}

export function useOptimizedRealtime<T = any>(
  initialData: T[] = [],
  options: OptimizedRealtimeOptions
) {
  const { user } = useAuth()
  const [state, setState] = useState<RealtimeState<T>>({
    data: initialData,
    isConnected: false,
    lastUpdate: null,
    error: null,
    subscriptionId: null,
    connectionStats: {
      reconnectCount: 0,
      lastReconnect: null,
      averageLatency: 0
    }
  })

  const connectionManager = useRef<RealtimeConnectionManager>()
  const updateBuffer = useRef<T[]>([])
  const bufferTimer = useRef<NodeJS.Timeout>()
  const latencyMeasurements = useRef<number[]>([])

  // 연결 관리자 초기화
  useEffect(() => {
    connectionManager.current = RealtimeConnectionManager.getInstance({
      enableBatteryOptimization: options.enableBatteryOptimization,
      maxRetries: options.retryAttempts || 5,
      heartbeatInterval: options.heartbeatInterval || 30000
    })

    return () => {
      if (connectionManager.current) {
        connectionManager.current.cleanup()
      }
    }
  }, [])

  // 배치 업데이트 처리
  const flushBuffer = useCallback(() => {
    if (updateBuffer.current.length === 0) return

    setState(prev => ({
      ...prev,
      data: [...updateBuffer.current],
      lastUpdate: new Date()
    }))

    updateBuffer.current = []
  }, [])

  // 버퍼에 데이터 추가
  const addToBuffer = useCallback((newData: T | T[]) => {
    const dataArray = Array.isArray(newData) ? newData : [newData]
    updateBuffer.current.push(...dataArray)

    // 버퍼 타이머 설정
    if (bufferTimer.current) {
      clearTimeout(bufferTimer.current)
    }

    bufferTimer.current = setTimeout(flushBuffer, options.bufferTime || 100)
  }, [flushBuffer, options.bufferTime])

  // 지연시간 측정 및 통계 업데이트
  const measureLatency = useCallback((startTime: number) => {
    const latency = Date.now() - startTime
    latencyMeasurements.current.push(latency)
    
    // 최근 10개 측정값만 유지
    if (latencyMeasurements.current.length > 10) {
      latencyMeasurements.current.shift()
    }

    const averageLatency = latencyMeasurements.current.reduce((sum, l) => sum + l, 0) / 
                          latencyMeasurements.current.length

    setState(prev => ({
      ...prev,
      connectionStats: {
        ...prev.connectionStats,
        averageLatency
      }
    }))
  }, [])

  // 실시간 구독 설정
  useEffect(() => {
    if (!user?.id || !connectionManager.current) return

    const setupSubscription = async () => {
      try {
        setState(prev => ({ ...prev, error: null }))

        const subscriptionId = await connectionManager.current!.createSubscription(
          options.tableName,
          user.id,
          {
            onInsert: (payload) => {
              const startTime = Date.now()
              const newItem = payload.new as T
              addToBuffer(newItem)
              measureLatency(startTime)
            },
            onUpdate: (payload) => {
              const startTime = Date.now()
              const updatedItem = payload.new as T
              
              setState(prev => ({
                ...prev,
                data: prev.data.map(item => 
                  (item as any).id === (updatedItem as any).id ? updatedItem : item
                ),
                lastUpdate: new Date()
              }))
              measureLatency(startTime)
            },
            onDelete: (payload) => {
              const startTime = Date.now()
              const deletedItem = payload.old as T
              
              setState(prev => ({
                ...prev,
                data: prev.data.filter(item => 
                  (item as any).id !== (deletedItem as any).id
                ),
                lastUpdate: new Date()
              }))
              measureLatency(startTime)
            }
          }
        )

        setState(prev => ({
          ...prev,
          subscriptionId,
          isConnected: true,
          connectionStats: {
            ...prev.connectionStats,
            reconnectCount: prev.connectionStats.reconnectCount + 1,
            lastReconnect: new Date()
          }
        }))

      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to setup subscription',
          isConnected: false
        }))
      }
    }

    setupSubscription()

    return () => {
      if (state.subscriptionId && connectionManager.current) {
        connectionManager.current.removeSubscription(state.subscriptionId)
      }
      if (bufferTimer.current) {
        clearTimeout(bufferTimer.current)
      }
    }
  }, [user?.id, options.tableName])

  // 연결 상태 모니터링
  useEffect(() => {
    if (!connectionManager.current) return

    const monitorConnection = setInterval(() => {
      const connectionStatus = connectionManager.current!.getConnectionStatus()
      
      setState(prev => ({
        ...prev,
        isConnected: connectionStatus.isConnected,
        error: connectionStatus.error
      }))
    }, 5000) // 5초마다 체크

    return () => clearInterval(monitorConnection)
  }, [])

  // 수동 새로고침
  const refresh = useCallback(async () => {
    // 버퍼 즉시 플러시
    flushBuffer()
    
    // 연결 상태 확인 및 재연결 시도
    if (!state.isConnected && connectionManager.current && user?.id) {
      try {
        setState(prev => ({ ...prev, error: null }))
        
        if (state.subscriptionId) {
          connectionManager.current.removeSubscription(state.subscriptionId)
        }

        const subscriptionId = await connectionManager.current.createSubscription(
          options.tableName,
          user.id,
          {
            onInsert: (payload) => addToBuffer(payload.new as T),
            onUpdate: (payload) => {
              const updatedItem = payload.new as T
              setState(prev => ({
                ...prev,
                data: prev.data.map(item => 
                  (item as any).id === (updatedItem as any).id ? updatedItem : item
                ),
                lastUpdate: new Date()
              }))
            },
            onDelete: (payload) => {
              const deletedItem = payload.old as T
              setState(prev => ({
                ...prev,
                data: prev.data.filter(item => 
                  (item as any).id !== (deletedItem as any).id
                ),
                lastUpdate: new Date()
              }))
            }
          }
        )

        setState(prev => ({
          ...prev,
          subscriptionId,
          isConnected: true
        }))

      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to refresh connection'
        }))
      }
    }
  }, [state.isConnected, state.subscriptionId, user?.id, options.tableName, flushBuffer, addToBuffer])

  // 로컬 데이터 업데이트 (낙관적 업데이트용)
  const updateLocal = useCallback((updater: (data: T[]) => T[]) => {
    setState(prev => ({
      ...prev,
      data: updater(prev.data),
      lastUpdate: new Date()
    }))
  }, [])

  // 로컬 데이터 추가
  const addLocal = useCallback((item: T) => {
    setState(prev => ({
      ...prev,
      data: [...prev.data, item],
      lastUpdate: new Date()
    }))
  }, [])

  // 성능 통계 조회
  const getPerformanceStats = useCallback(() => {
    const connectionStatus = connectionManager.current?.getConnectionStatus()
    const subscriptionStatus = state.subscriptionId ? 
      connectionManager.current?.getSubscriptionStatus(state.subscriptionId) : 
      null

    return {
      isOptimized: !!options.enableBatteryOptimization,
      bufferSize: updateBuffer.current.length,
      averageLatency: state.connectionStats.averageLatency,
      reconnectCount: state.connectionStats.reconnectCount,
      lastReconnect: state.connectionStats.lastReconnect,
      networkLatency: connectionStatus?.latency || 0,
      subscriptionHealth: subscriptionStatus?.status || 'unknown'
    }
  }, [state.connectionStats, state.subscriptionId, options.enableBatteryOptimization])

  return {
    data: state.data,
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
    error: state.error,
    connectionStats: state.connectionStats,
    refresh,
    updateLocal,
    addLocal,
    getPerformanceStats
  }
}