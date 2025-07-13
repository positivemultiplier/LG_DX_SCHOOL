'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Activity, 
  Database,
  Github,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { LiveIndicator, PulsingDot } from './live-indicator'
import { useRealtimeReflections } from '@/hooks/use-realtime-reflections'
import { useRealtimeGitHub } from '@/hooks/use-realtime-github'
import { useRealtimeStatistics } from '@/hooks/use-realtime-statistics'

interface ConnectionStatusProps {
  className?: string
  compact?: boolean
}

export function ConnectionStatus({ className, compact = false }: ConnectionStatusProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  const reflectionsRealtime = useRealtimeReflections()
  const githubRealtime = useRealtimeGitHub()
  const statisticsRealtime = useRealtimeStatistics()

  // 전체 연결 상태 계산
  const overallConnected = 
    reflectionsRealtime.isConnected && 
    githubRealtime.isConnected && 
    statisticsRealtime.isConnected

  // 에러 상태 체크
  const hasErrors = 
    reflectionsRealtime.error || 
    githubRealtime.error || 
    statisticsRealtime.error

  // 마지막 업데이트 시간 계산
  const getLatestUpdate = () => {
    const updates = [
      reflectionsRealtime.lastUpdate,
      githubRealtime.lastUpdate,
      statisticsRealtime.lastUpdate
    ].filter(Boolean) as Date[]
    
    return updates.length > 0 ? new Date(Math.max(...updates.map(d => d.getTime()))) : null
  }

  const latestUpdate = getLatestUpdate()

  // 전체 재연결 함수
  const reconnectAll = () => {
    reflectionsRealtime.reconnect()
    githubRealtime.reconnect()
    statisticsRealtime.reconnect()
  }

  if (compact) {
    return (
      <div className={className}>
        <LiveIndicator
          isConnected={overallConnected}
          lastUpdate={latestUpdate}
          showLastUpdate
          showReconnectButton={!overallConnected}
          onReconnect={reconnectAll}
        />
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4" />
          실시간 연결 상태
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="ml-auto h-6 w-6 p-0"
          >
            {isVisible ? '−' : '+'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {isVisible && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* 전체 상태 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PulsingDot color={overallConnected ? 'green' : 'red'} />
                <span className="text-sm font-medium">
                  전체 시스템
                </span>
              </div>
              <Badge variant={overallConnected ? 'default' : 'destructive'}>
                {overallConnected ? '정상' : '오류'}
              </Badge>
            </div>

            <Separator />

            {/* 개별 서비스 상태 */}
            <div className="space-y-3">
              {/* 리플렉션 실시간 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PulsingDot 
                    color={reflectionsRealtime.isConnected ? 'green' : 'red'} 
                    size="sm" 
                  />
                  <Database className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">리플렉션</span>
                </div>
                <div className="flex items-center gap-2">
                  {reflectionsRealtime.error && (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                  <Badge 
                    variant={reflectionsRealtime.isConnected ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {reflectionsRealtime.isConnected ? '연결됨' : '연결 끊김'}
                  </Badge>
                </div>
              </div>

              {/* GitHub 실시간 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PulsingDot 
                    color={githubRealtime.isConnected ? 'green' : 'red'} 
                    size="sm" 
                  />
                  <Github className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">GitHub</span>
                </div>
                <div className="flex items-center gap-2">
                  {githubRealtime.syncStatus.isActive && (
                    <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" />
                  )}
                  {githubRealtime.error && (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                  <Badge 
                    variant={githubRealtime.isConnected ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {githubRealtime.isConnected ? '연결됨' : '연결 끊김'}
                  </Badge>
                </div>
              </div>

              {/* 통계 실시간 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PulsingDot 
                    color={statisticsRealtime.isConnected ? 'green' : 'red'} 
                    size="sm" 
                  />
                  <Activity className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">통계</span>
                </div>
                <div className="flex items-center gap-2">
                  {statisticsRealtime.error && (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                  <Badge 
                    variant={statisticsRealtime.isConnected ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {statisticsRealtime.isConnected ? '연결됨' : '연결 끊김'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 마지막 업데이트 */}
            {latestUpdate && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>마지막 업데이트: {latestUpdate.toLocaleString('ko-KR')}</span>
                </div>
              </>
            )}

            {/* 에러 메시지 */}
            {hasErrors && (
              <>
                <Separator />
                <div className="space-y-1">
                  {reflectionsRealtime.error && (
                    <div className="text-xs text-red-600">
                      리플렉션: {reflectionsRealtime.error}
                    </div>
                  )}
                  {githubRealtime.error && (
                    <div className="text-xs text-red-600">
                      GitHub: {githubRealtime.error}
                    </div>
                  )}
                  {statisticsRealtime.error && (
                    <div className="text-xs text-red-600">
                      통계: {statisticsRealtime.error}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 재연결 버튼 */}
            {!overallConnected && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reconnectAll}
                  className="w-full"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  전체 재연결
                </Button>
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}