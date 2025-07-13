/**
 * GitHub API Rate Limiter
 * GitHub API 요청 제한을 관리하고 최적화
 */

interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  used: number
}

interface QueuedRequest {
  id: string
  execute: () => Promise<any>
  resolve: (value: any) => void
  reject: (error: any) => void
  priority: 'high' | 'medium' | 'low'
  retryCount: number
  maxRetries: number
}

export class GitHubRateLimiter {
  private queue: QueuedRequest[] = []
  private isProcessing = false
  private rateLimitInfo: RateLimitInfo | null = null
  private requestCounts = new Map<string, number>() // key: endpoint, value: count
  private lastResetTime = Date.now()

  constructor(
    private minInterval = 100, // 최소 요청 간격 (ms)
    private maxQueueSize = 100  // 최대 대기열 크기
  ) {}

  /**
   * Rate limit이 적용된 요청 실행
   */
  async executeRequest<T>(
    requestId: string,
    executor: () => Promise<T>,
    options: {
      priority?: 'high' | 'medium' | 'low'
      maxRetries?: number
      timeout?: number
    } = {}
  ): Promise<T> {
    const {
      priority = 'medium',
      maxRetries = 3,
      timeout = 30000
    } = options

    return new Promise((resolve, reject) => {
      // 대기열 크기 확인
      if (this.queue.length >= this.maxQueueSize) {
        reject(new Error('Request queue is full'))
        return
      }

      const queuedRequest: QueuedRequest = {
        id: requestId,
        execute: executor,
        resolve,
        reject,
        priority,
        retryCount: 0,
        maxRetries
      }

      // 우선순위에 따라 대기열에 삽입
      this.insertByPriority(queuedRequest)

      // 타임아웃 설정
      if (timeout > 0) {
        setTimeout(() => {
          this.removeFromQueue(requestId)
          reject(new Error('Request timeout'))
        }, timeout)
      }

      // 큐 처리 시작
      this.processQueue()
    })
  }

  /**
   * Rate limit 정보 업데이트
   */
  updateRateLimit(rateLimitInfo: RateLimitInfo): void {
    this.rateLimitInfo = rateLimitInfo
    
    // 리셋 시간이 지났으면 통계 초기화
    if (rateLimitInfo.reset * 1000 > this.lastResetTime) {
      this.requestCounts.clear()
      this.lastResetTime = rateLimitInfo.reset * 1000
    }
  }

  /**
   * 현재 Rate limit 상태 확인
   */
  getRateLimitStatus(): {
    canMakeRequest: boolean
    waitTime: number
    queueLength: number
    rateLimitInfo: RateLimitInfo | null
  } {
    const now = Date.now()
    const canMakeRequest = this.canMakeRequest()
    
    let waitTime = 0
    if (!canMakeRequest && this.rateLimitInfo) {
      waitTime = (this.rateLimitInfo.reset * 1000) - now
    }

    return {
      canMakeRequest,
      waitTime: Math.max(0, waitTime),
      queueLength: this.queue.length,
      rateLimitInfo: this.rateLimitInfo
    }
  }

  /**
   * 엔드포인트별 요청 통계
   */
  getRequestStats(): Record<string, number> {
    return Object.fromEntries(this.requestCounts)
  }

  /**
   * 대기열 비우기
   */
  clearQueue(): void {
    this.queue.forEach(req => {
      req.reject(new Error('Queue cleared'))
    })
    this.queue = []
  }

  /**
   * 요청 가능 여부 확인
   */
  private canMakeRequest(): boolean {
    if (!this.rateLimitInfo) return true

    // 남은 요청 수가 100개 미만이면 제한
    if (this.rateLimitInfo.remaining < 100) {
      return false
    }

    // 사용률이 80%를 넘으면 제한
    const usageRate = this.rateLimitInfo.used / this.rateLimitInfo.limit
    if (usageRate > 0.8) {
      return false
    }

    return true
  }

  /**
   * 우선순위에 따라 대기열에 삽입
   */
  private insertByPriority(request: QueuedRequest): void {
    const priorities = { high: 3, medium: 2, low: 1 }
    const requestPriority = priorities[request.priority]

    let insertIndex = this.queue.length
    for (let i = 0; i < this.queue.length; i++) {
      const queuePriority = priorities[this.queue[i].priority]
      if (requestPriority > queuePriority) {
        insertIndex = i
        break
      }
    }

    this.queue.splice(insertIndex, 0, request)
  }

  /**
   * 대기열에서 요청 제거
   */
  private removeFromQueue(requestId: string): void {
    const index = this.queue.findIndex(req => req.id === requestId)
    if (index !== -1) {
      this.queue.splice(index, 1)
    }
  }

  /**
   * 대기열 처리
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      while (this.queue.length > 0) {
        // Rate limit 확인
        if (!this.canMakeRequest()) {
          const waitTime = this.calculateWaitTime()
          if (waitTime > 0) {
            console.log(`Rate limit hit, waiting ${waitTime}ms`)
            await this.sleep(waitTime)
            continue
          }
        }

        const request = this.queue.shift()
        if (!request) continue

        try {
          // 요청 실행
          const result = await request.execute()
          request.resolve(result)

          // 요청 통계 업데이트
          this.updateRequestStats(request.id)

        } catch (error: any) {
          // Rate limit 에러 처리
          if (this.isRateLimitError(error)) {
            // Rate limit 정보 업데이트
            if (error.headers) {
              this.updateRateLimit({
                limit: parseInt(error.headers['x-ratelimit-limit'] || '5000'),
                remaining: parseInt(error.headers['x-ratelimit-remaining'] || '0'),
                reset: parseInt(error.headers['x-ratelimit-reset'] || '0'),
                used: parseInt(error.headers['x-ratelimit-used'] || '0')
              })
            }

            // 재시도 가능한 경우 다시 대기열에 추가
            if (request.retryCount < request.maxRetries) {
              request.retryCount++
              this.insertByPriority(request)
              continue
            }
          }

          // 일반 에러나 재시도 한도 초과
          request.reject(error)
        }

        // 최소 간격 대기
        await this.sleep(this.minInterval)
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Rate limit 에러 확인
   */
  private isRateLimitError(error: any): boolean {
    return error.status === 403 && 
           (error.message?.includes('rate limit') || 
            error.message?.includes('API rate limit'))
  }

  /**
   * 대기 시간 계산
   */
  private calculateWaitTime(): number {
    if (!this.rateLimitInfo) return 60000 // 기본 1분 대기

    const now = Date.now()
    const resetTime = this.rateLimitInfo.reset * 1000
    
    if (resetTime > now) {
      return resetTime - now
    }

    return 0
  }

  /**
   * 요청 통계 업데이트
   */
  private updateRequestStats(requestId: string): void {
    const endpoint = this.extractEndpoint(requestId)
    const currentCount = this.requestCounts.get(endpoint) || 0
    this.requestCounts.set(endpoint, currentCount + 1)
  }

  /**
   * 요청 ID에서 엔드포인트 추출
   */
  private extractEndpoint(requestId: string): string {
    // 요청 ID에서 엔드포인트 패턴 추출
    const patterns = [
      '/user',
      '/repos',
      '/commits',
      '/events',
      '/languages'
    ]

    for (const pattern of patterns) {
      if (requestId.includes(pattern)) {
        return pattern
      }
    }

    return 'other'
  }

  /**
   * 지연 함수
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 전역 Rate Limiter 인스턴스
 */
export const githubRateLimiter = new GitHubRateLimiter()

/**
 * Rate Limiter 데코레이터
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  func: T,
  options: {
    priority?: 'high' | 'medium' | 'low'
    maxRetries?: number
    timeout?: number
  } = {}
): T {
  return (async (...args: any[]) => {
    const requestId = `${func.name}_${Date.now()}_${Math.random()}`
    
    return githubRateLimiter.executeRequest(
      requestId,
      () => func(...args),
      options
    )
  }) as T
}

/**
 * Rate Limit 모니터링 훅
 */
export class RateLimitMonitor {
  private listeners: Array<(status: any) => void> = []
  private checkInterval = 5000 // 5초마다 확인

  constructor() {
    this.startMonitoring()
  }

  /**
   * 상태 변경 리스너 등록
   */
  onStatusChange(listener: (status: any) => void): () => void {
    this.listeners.push(listener)
    
    // 구독 해제 함수 반환
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index !== -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 모니터링 시작
   */
  private startMonitoring(): void {
    setInterval(() => {
      const status = githubRateLimiter.getRateLimitStatus()
      const stats = githubRateLimiter.getRequestStats()
      
      const monitoringData = {
        ...status,
        requestStats: stats,
        timestamp: Date.now()
      }

      this.listeners.forEach(listener => {
        try {
          listener(monitoringData)
        } catch (error) {
          console.error('Rate limit monitor listener error:', error)
        }
      })
    }, this.checkInterval)
  }
}

/**
 * 전역 Rate Limit 모니터
 */
export const rateLimitMonitor = new RateLimitMonitor()