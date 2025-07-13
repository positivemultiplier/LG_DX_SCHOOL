'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

interface LiveIndicatorProps {
  isConnected: boolean
  lastUpdate?: Date | null
  className?: string
  showLastUpdate?: boolean
  showReconnectButton?: boolean
  onReconnect?: () => void
}

export function LiveIndicator({
  isConnected,
  lastUpdate,
  className,
  showLastUpdate = false,
  showReconnectButton = false,
  onReconnect
}: LiveIndicatorProps) {
  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}초 전`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    return `${Math.floor(diffInSeconds / 86400)}일 전`
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* 연결 상태 배지 */}
      <Badge
        variant={isConnected ? 'default' : 'destructive'}
        className={cn(
          'flex items-center gap-1 transition-all duration-300',
          isConnected && 'bg-green-500 hover:bg-green-600'
        )}
      >
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3" />
            <span className="text-xs">실시간</span>
            <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span className="text-xs">연결 끊김</span>
          </>
        )}
      </Badge>

      {/* 마지막 업데이트 시간 */}
      {showLastUpdate && lastUpdate && (
        <span className="text-xs text-muted-foreground">
          {getTimeAgo(lastUpdate)}
        </span>
      )}

      {/* 재연결 버튼 */}
      {showReconnectButton && !isConnected && onReconnect && (
        <button
          onClick={onReconnect}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          재연결
        </button>
      )}
    </div>
  )
}

interface PulsingDotProps {
  color?: 'green' | 'red' | 'yellow' | 'blue'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PulsingDot({ 
  color = 'green', 
  size = 'md',
  className 
}: PulsingDotProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const colorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500'
  }

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <div 
        className={cn(
          'rounded-full animate-pulse',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      <div 
        className={cn(
          'absolute rounded-full animate-ping',
          sizeClasses[size],
          colorClasses[color],
          'opacity-20'
        )}
      />
    </div>
  )
}