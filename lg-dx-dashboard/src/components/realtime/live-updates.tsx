'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  X, 
  FileText, 
  Github, 
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react'
import { useRealtimeReflections } from '@/hooks/use-realtime-reflections'
import { useRealtimeGitHub } from '@/hooks/use-realtime-github'
import { useRealtimeStatistics } from '@/hooks/use-realtime-statistics'

interface LiveUpdate {
  id: string
  type: 'reflection' | 'github' | 'statistics'
  title: string
  description: string
  timestamp: Date
  icon: React.ReactNode
  actionUrl?: string
}

interface LiveUpdatesProps {
  maxUpdates?: number
  autoHideDuration?: number
  className?: string
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
}

export function LiveUpdates({
  maxUpdates = 5,
  autoHideDuration = 5000,
  className,
  position = 'top-right'
}: LiveUpdatesProps) {
  const [updates, setUpdates] = useState<LiveUpdate[]>([])
  const [isVisible, setIsVisible] = useState(true)

  const reflectionsRealtime = useRealtimeReflections()
  const githubRealtime = useRealtimeGitHub()
  const statisticsRealtime = useRealtimeStatistics()

  // 위치 스타일
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4'
  }

  // 새 업데이트 추가
  const addUpdate = (update: Omit<LiveUpdate, 'id' | 'timestamp'>) => {
    const newUpdate: LiveUpdate = {
      ...update,
      id: crypto.randomUUID(),
      timestamp: new Date()
    }

    setUpdates(prev => {
      const newUpdates = [newUpdate, ...prev].slice(0, maxUpdates)
      return newUpdates
    })

    // 자동 숨김
    if (autoHideDuration > 0) {
      setTimeout(() => {
        removeUpdate(newUpdate.id)
      }, autoHideDuration)
    }
  }

  // 업데이트 제거
  const removeUpdate = (id: string) => {
    setUpdates(prev => prev.filter(update => update.id !== id))
  }

  // 모든 업데이트 클리어
  const clearAllUpdates = () => {
    setUpdates([])
  }

  // 리플렉션 실시간 업데이트 감지
  useEffect(() => {
    if (reflectionsRealtime.lastUpdate) {
      addUpdate({
        type: 'reflection',
        title: '리플렉션 업데이트',
        description: '새로운 리플렉션이 추가되었습니다',
        icon: <FileText className="h-4 w-4" />,
        actionUrl: '/reflection'
      })
    }
  }, [reflectionsRealtime.lastUpdate])

  // GitHub 실시간 업데이트 감지
  useEffect(() => {
    if (githubRealtime.lastUpdate) {
      if (githubRealtime.activityRecords.length > 0) {
        const latestRecord = githubRealtime.activityRecords[0]
        addUpdate({
          type: 'github',
          title: 'GitHub 활동',
          description: `${latestRecord.repository_name}에서 ${latestRecord.event_type} 이벤트`,
          icon: <Github className="h-4 w-4" />,
          actionUrl: '/analytics'
        })
      }
    }
  }, [githubRealtime.lastUpdate])

  // GitHub 동기화 상태 감지
  useEffect(() => {
    if (githubRealtime.syncStatus.isActive) {
      addUpdate({
        type: 'github',
        title: 'GitHub 동기화',
        description: `진행률: ${githubRealtime.syncStatus.progress}%`,
        icon: <Activity className="h-4 w-4 animate-spin" />
      })
    }
  }, [githubRealtime.syncStatus.isActive, githubRealtime.syncStatus.progress])

  // 통계 실시간 업데이트 감지
  useEffect(() => {
    if (statisticsRealtime.lastUpdate) {
      addUpdate({
        type: 'statistics',
        title: '통계 업데이트',
        description: '일일 통계가 업데이트되었습니다',
        icon: <TrendingUp className="h-4 w-4" />,
        actionUrl: '/dashboard'
      })
    }
  }, [statisticsRealtime.lastUpdate])

  if (!isVisible || updates.length === 0) {
    return null
  }

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      <div className="w-80 space-y-2">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="text-sm font-medium">실시간 업데이트</span>
            <Badge variant="secondary" className="text-xs">
              {updates.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllUpdates}
              className="h-6 w-6 p-0 text-muted-foreground"
            >
              모두 삭제
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* 업데이트 목록 */}
        <AnimatePresence>
          {updates.map((update) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border shadow-lg">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {update.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate">
                          {update.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUpdate(update.id)}
                          className="h-4 w-4 p-0 ml-2 flex-shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {update.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {update.timestamp.toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {update.actionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => {
                              window.location.href = update.actionUrl!
                            }}
                          >
                            보기
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// 컨트롤 토글 버튼
interface LiveUpdatesToggleProps {
  className?: string
}

export function LiveUpdatesToggle({ className }: LiveUpdatesToggleProps) {
  const [isEnabled, setIsEnabled] = useState(true)

  return (
    <Button
      variant={isEnabled ? 'default' : 'outline'}
      size="sm"
      onClick={() => setIsEnabled(!isEnabled)}
      className={className}
    >
      <Bell className="h-4 w-4 mr-2" />
      실시간 알림 {isEnabled ? 'ON' : 'OFF'}
    </Button>
  )
}