'use client'

import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface ConnectionManagerOptions {
  maxRetries: number
  retryDelay: number
  heartbeatInterval: number
  connectionTimeout: number
  enableBatteryOptimization: boolean
}

interface ConnectionStatus {
  isConnected: boolean
  lastConnected: Date | null
  retryCount: number
  error: string | null
  latency: number
}

interface ActiveSubscription {
  id: string
  channel: RealtimeChannel
  tableName: string
  userId: string
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastActivity: Date
  retryCount: number
}

export class RealtimeConnectionManager {
  private static instance: RealtimeConnectionManager
  private options: ConnectionManagerOptions
  private subscriptions: Map<string, ActiveSubscription> = new Map()
  private connectionStatus: ConnectionStatus
  private heartbeatTimer: NodeJS.Timeout | null = null
  private retryTimers: Map<string, NodeJS.Timeout> = new Map()
  private visibilityChangeHandler: (() => void) | null = null
  private onlineHandler: (() => void) | null = null
  private offlineHandler: (() => void) | null = null

  private constructor(options: Partial<ConnectionManagerOptions> = {}) {
    this.options = {
      maxRetries: 5,
      retryDelay: 1000,
      heartbeatInterval: 30000,
      connectionTimeout: 10000,
      enableBatteryOptimization: true,
      ...options
    }

    this.connectionStatus = {
      isConnected: false,
      lastConnected: null,
      retryCount: 0,
      error: null,
      latency: 0
    }

    this.setupEventListeners()
    this.startHeartbeat()
  }

  static getInstance(options?: Partial<ConnectionManagerOptions>): RealtimeConnectionManager {
    if (!RealtimeConnectionManager.instance) {
      RealtimeConnectionManager.instance = new RealtimeConnectionManager(options)
    }
    return RealtimeConnectionManager.instance
  }

  // 이벤트 리스너 설정 (배터리 최적화, 가시성 변화 감지)
  private setupEventListeners() {
    if (typeof window === 'undefined') return

    // 페이지 가시성 변화 감지
    this.visibilityChangeHandler = () => {
      if (document.hidden && this.options.enableBatteryOptimization) {
        this.pauseConnections()
      } else if (!document.hidden) {
        this.resumeConnections()
      }
    }
    document.addEventListener('visibilitychange', this.visibilityChangeHandler)

    // 네트워크 상태 변화 감지
    this.onlineHandler = () => {
      this.resumeConnections()
    }
    this.offlineHandler = () => {
      this.pauseConnections()
    }
    window.addEventListener('online', this.onlineHandler)
    window.addEventListener('offline', this.offlineHandler)
  }

  // 하트비트 시작
  private startHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
    }

    this.heartbeatTimer = setInterval(() => {
      this.checkConnections()
    }, this.options.heartbeatInterval)
  }

  // 연결 상태 확인
  private async checkConnections() {
    const startTime = Date.now()
    
    try {
      // Supabase 연결 테스트 (간단한 쿼리)
      await supabase.from('users').select('id').limit(1)
      
      this.connectionStatus = {
        isConnected: true,
        lastConnected: new Date(),
        retryCount: 0,
        error: null,
        latency: Date.now() - startTime
      }

      // 끊어진 구독들 재연결 시도
      this.reconnectFailedSubscriptions()

    } catch (error) {
      this.connectionStatus = {
        ...this.connectionStatus,
        isConnected: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        latency: Date.now() - startTime
      }
    }
  }

  // 구독 생성
  async createSubscription(
    tableName: string,
    userId: string,
    eventHandlers: {
      onInsert?: (payload: any) => void
      onUpdate?: (payload: any) => void
      onDelete?: (payload: any) => void
    }
  ): Promise<string> {
    const subscriptionId = `${tableName}:${userId}:${Date.now()}`
    
    const channel = supabase
      .channel(subscriptionId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: tableName,
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          this.updateSubscriptionActivity(subscriptionId)
          eventHandlers.onInsert?.(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: tableName,
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          this.updateSubscriptionActivity(subscriptionId)
          eventHandlers.onUpdate?.(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: tableName,
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          this.updateSubscriptionActivity(subscriptionId)
          eventHandlers.onDelete?.(payload)
        }
      )

    const subscription: ActiveSubscription = {
      id: subscriptionId,
      channel,
      tableName,
      userId,
      status: 'connecting',
      lastActivity: new Date(),
      retryCount: 0
    }

    this.subscriptions.set(subscriptionId, subscription)

    // 구독 시작
    try {
      await this.subscribeWithTimeout(channel, subscriptionId)
      subscription.status = 'connected'
    } catch (error) {
      subscription.status = 'error'
      this.scheduleRetry(subscriptionId)
    }

    return subscriptionId
  }

  // 타임아웃이 있는 구독
  private async subscribeWithTimeout(channel: RealtimeChannel, subscriptionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Subscription timeout'))
      }, this.options.connectionTimeout)

      channel.subscribe((status) => {
        clearTimeout(timeout)
        
        const subscription = this.subscriptions.get(subscriptionId)
        if (subscription) {
          if (status === 'SUBSCRIBED') {
            subscription.status = 'connected'
            subscription.retryCount = 0
            resolve()
          } else if (status === 'CHANNEL_ERROR') {
            subscription.status = 'error'
            reject(new Error('Channel error'))
          }
        }
      })
    })
  }

  // 구독 활동 업데이트
  private updateSubscriptionActivity(subscriptionId: string) {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription) {
      subscription.lastActivity = new Date()
    }
  }

  // 재시도 스케줄링
  private scheduleRetry(subscriptionId: string) {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription || subscription.retryCount >= this.options.maxRetries) {
      return
    }

    const existingTimer = this.retryTimers.get(subscriptionId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const delay = this.options.retryDelay * Math.pow(2, subscription.retryCount) // 지수 백오프
    const timer = setTimeout(() => {
      this.retrySubscription(subscriptionId)
    }, delay)

    this.retryTimers.set(subscriptionId, timer)
    subscription.retryCount++
  }

  // 구독 재시도
  private async retrySubscription(subscriptionId: string) {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) return

    try {
      subscription.status = 'connecting'
      await this.subscribeWithTimeout(subscription.channel, subscriptionId)
      subscription.status = 'connected'
      subscription.retryCount = 0
      
      // 재시도 타이머 제거
      const timer = this.retryTimers.get(subscriptionId)
      if (timer) {
        clearTimeout(timer)
        this.retryTimers.delete(subscriptionId)
      }
    } catch (error) {
      subscription.status = 'error'
      this.scheduleRetry(subscriptionId)
    }
  }

  // 실패한 구독들 재연결
  private reconnectFailedSubscriptions() {
    this.subscriptions.forEach((subscription, id) => {
      if (subscription.status === 'error' || subscription.status === 'disconnected') {
        this.retrySubscription(id)
      }
    })
  }

  // 연결 일시정지 (배터리 최적화)
  private pauseConnections() {
    this.subscriptions.forEach((subscription) => {
      if (subscription.status === 'connected') {
        subscription.channel.unsubscribe()
        subscription.status = 'disconnected'
      }
    })

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 연결 재개
  private resumeConnections() {
    this.startHeartbeat()
    this.reconnectFailedSubscriptions()
  }

  // 구독 제거
  removeSubscription(subscriptionId: string) {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription) {
      subscription.channel.unsubscribe()
      this.subscriptions.delete(subscriptionId)
      
      const timer = this.retryTimers.get(subscriptionId)
      if (timer) {
        clearTimeout(timer)
        this.retryTimers.delete(subscriptionId)
      }
    }
  }

  // 모든 구독 제거
  removeAllSubscriptions() {
    this.subscriptions.forEach((subscription, id) => {
      this.removeSubscription(id)
    })
  }

  // 연결 상태 조회
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus }
  }

  // 구독 상태 조회
  getSubscriptionStatus(subscriptionId: string): ActiveSubscription | undefined {
    return this.subscriptions.get(subscriptionId)
  }

  // 모든 구독 상태 조회
  getAllSubscriptions(): ActiveSubscription[] {
    return Array.from(this.subscriptions.values())
  }

  // 정리 (컴포넌트 언마운트 시 호출)
  cleanup() {
    this.removeAllSubscriptions()
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
    }

    this.retryTimers.forEach(timer => clearTimeout(timer))
    this.retryTimers.clear()

    // 이벤트 리스너 제거
    if (typeof window !== 'undefined') {
      if (this.visibilityChangeHandler) {
        document.removeEventListener('visibilitychange', this.visibilityChangeHandler)
      }
      if (this.onlineHandler) {
        window.removeEventListener('online', this.onlineHandler)
      }
      if (this.offlineHandler) {
        window.removeEventListener('offline', this.offlineHandler)
      }
    }
  }

  // 설정 업데이트
  updateOptions(newOptions: Partial<ConnectionManagerOptions>) {
    this.options = { ...this.options, ...newOptions }
    
    // 하트비트 간격 변경시 재시작
    if (newOptions.heartbeatInterval) {
      this.startHeartbeat()
    }
  }
}