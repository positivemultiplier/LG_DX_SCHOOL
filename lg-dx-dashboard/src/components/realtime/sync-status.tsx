'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Database,
  Github,
  Activity
} from 'lucide-react'
import { useRealtimeGitHub } from '@/hooks/use-realtime-github'
import { useRealtimeStatistics } from '@/hooks/use-realtime-statistics'

interface SyncStatusProps {
  className?: string
  showDetails?: boolean
}

export function SyncStatus({ className, showDetails = true }: SyncStatusProps) {
  const githubRealtime = useRealtimeGitHub()
  const statisticsRealtime = useRealtimeStatistics()

  const syncStatus = githubRealtime.syncStatus

  const formatLastSync = (date: Date | null) => {
    if (!date) return '동기화 안됨'
    
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
    return date.toLocaleDateString('ko-KR')
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <RefreshCw className={`h-4 w-4 ${syncStatus.isActive ? 'animate-spin' : ''}`} />
          동기화 상태
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* GitHub 동기화 상태 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">GitHub</span>
              </div>
              <Badge 
                variant={syncStatus.isActive ? 'default' : 'secondary'}
                className="text-xs"
              >
                {syncStatus.isActive ? '동기화 중' : '대기'}
              </Badge>
            </div>
            
            {syncStatus.isActive && (
              <div className="space-y-2">
                <Progress value={syncStatus.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>진행률</span>
                  <span>{syncStatus.progress}%</span>
                </div>
              </div>
            )}
            
            {!syncStatus.isActive && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>마지막 동기화: {formatLastSync(syncStatus.lastSyncAt)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={githubRealtime.triggerSync}
                  className="w-full"
                  disabled={syncStatus.isActive}
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  수동 동기화
                </Button>
              </div>
            )}
          </div>

          {showDetails && (
            <>
              {/* 통계 업데이트 상태 */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">통계</span>
                  </div>
                  <Badge 
                    variant={statisticsRealtime.isConnected ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {statisticsRealtime.isConnected ? '실시간' : '연결 끊김'}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {statisticsRealtime.lastUpdate ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>마지막 업데이트: {formatLastSync(statisticsRealtime.lastUpdate)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      <span>데이터 없음</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 실시간 연결 상태 */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">실시간 연결</span>
                  </div>
                  <Badge 
                    variant={githubRealtime.isConnected ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {githubRealtime.isConnected ? '연결됨' : '연결 끊김'}
                  </Badge>
                </div>
                
                {githubRealtime.error && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    {githubRealtime.error}
                  </div>
                )}
              </div>

              {/* 액션 버튼들 */}
              <div className="border-t pt-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={githubRealtime.refreshGitHubData}
                  className="w-full"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  데이터 새로고침
                </Button>
                
                {!githubRealtime.isConnected && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={githubRealtime.reconnect}
                    className="w-full"
                  >
                    재연결 시도
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// 간단한 동기화 상태 표시기
interface SimpleSyncStatusProps {
  className?: string
}

export function SimpleSyncStatus({ className }: SimpleSyncStatusProps) {
  const githubRealtime = useRealtimeGitHub()
  const syncStatus = githubRealtime.syncStatus

  if (!syncStatus.isActive) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      <span className="text-sm text-muted-foreground">
        GitHub 동기화 중... {syncStatus.progress}%
      </span>
    </div>
  )
}