'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  BellOff, 
  Settings, 
  Check,
  X,
  AlertTriangle
} from 'lucide-react'

interface NotificationSettings {
  enabled: boolean
  reflections: boolean
  github: boolean
  statistics: boolean
  milestones: boolean
  dailyReminders: boolean
}

interface PushNotificationProps {
  className?: string
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    reflections: true,
    github: true,
    statistics: true,
    milestones: true,
    dailyReminders: true
  })

  // 브라우저 알림 권한 확인
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
      
      // 로컬 스토리지에서 설정 불러오기
      const savedSettings = localStorage.getItem('pushNotificationSettings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    }
  }, [])

  // 설정 저장
  useEffect(() => {
    localStorage.setItem('pushNotificationSettings', JSON.stringify(settings))
  }, [settings])

  // 알림 권한 요청
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setPermission(permission)
      
      if (permission === 'granted') {
        setSettings(prev => ({ ...prev, enabled: true }))
        showNotification('알림 활성화', '푸시 알림이 활성화되었습니다!', 'success')
      }
    }
  }

  // 알림 보내기
  const showNotification = (
    title: string, 
    body: string, 
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    actions?: { action: string; title: string }[]
  ) => {
    if (!settings.enabled || permission !== 'granted') return

    const iconMap = {
      info: '/icons/notification-info.png',
      success: '/icons/notification-success.png',
      warning: '/icons/notification-warning.png',
      error: '/icons/notification-error.png'
    }

    const notification = new Notification(title, {
      body,
      icon: iconMap[type] || '/favicon.ico',
      badge: '/favicon.ico',
      tag: `lg-dx-${type}-${Date.now()}`,
      requireInteraction: type === 'error',
      actions: actions?.map(action => ({
        action: action.action,
        title: action.title
      }))
    })

    // 자동 닫기 (에러가 아닌 경우)
    if (type !== 'error') {
      setTimeout(() => {
        notification.close()
      }, 5000)
    }

    // 클릭 이벤트
    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    return notification
  }

  // 타입별 알림 함수들
  const notifyReflectionUpdate = (timePart: string, action: 'created' | 'updated') => {
    if (!settings.reflections) return
    
    const titles = {
      created: '리플렉션 저장 완료',
      updated: '리플렉션 수정 완료'
    }
    
    showNotification(
      titles[action],
      `${timePart} 리플렉션이 ${action === 'created' ? '저장' : '수정'}되었습니다.`,
      'success'
    )
  }

  const notifyGitHubActivity = (repositoryName: string, eventType: string) => {
    if (!settings.github) return
    
    showNotification(
      'GitHub 활동 감지',
      `${repositoryName}에서 ${eventType} 이벤트가 발생했습니다.`,
      'info',
      [
        { action: 'view', title: '보기' },
        { action: 'dismiss', title: '닫기' }
      ]
    )
  }

  const notifyGitHubSync = (status: 'start' | 'complete' | 'error', message?: string) => {
    if (!settings.github) return
    
    const config = {
      start: { title: 'GitHub 동기화 시작', type: 'info' as const },
      complete: { title: 'GitHub 동기화 완료', type: 'success' as const },
      error: { title: 'GitHub 동기화 오류', type: 'error' as const }
    }
    
    showNotification(
      config[status].title,
      message || '상태가 업데이트되었습니다.',
      config[status].type
    )
  }

  const notifyStatisticsUpdate = (message: string) => {
    if (!settings.statistics) return
    
    showNotification(
      '통계 업데이트',
      message,
      'info'
    )
  }

  const notifyMilestone = (title: string, description: string) => {
    if (!settings.milestones) return
    
    showNotification(
      `🎉 ${title}`,
      description,
      'success',
      [
        { action: 'celebrate', title: '축하하기' },
        { action: 'view', title: '보기' }
      ]
    )
  }

  const notifyDailyReminder = (message: string) => {
    if (!settings.dailyReminders) return
    
    showNotification(
      '일일 리마인더',
      message,
      'info',
      [
        { action: 'open', title: '리플렉션 작성' },
        { action: 'snooze', title: '나중에' }
      ]
    )
  }

  return {
    permission,
    settings,
    setSettings,
    requestPermission,
    showNotification,
    notifyReflectionUpdate,
    notifyGitHubActivity,
    notifyGitHubSync,
    notifyStatisticsUpdate,
    notifyMilestone,
    notifyDailyReminder
  }
}

// 푸시 알림 설정 UI 컴포넌트
export function PushNotificationSettings({ className }: PushNotificationProps) {
  const {
    permission,
    settings,
    setSettings,
    requestPermission,
    showNotification
  } = usePushNotifications()

  const testNotification = () => {
    showNotification(
      '테스트 알림',
      '푸시 알림이 정상적으로 작동합니다!',
      'success'
    )
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: '허용됨', color: 'bg-green-500', icon: <Check className="h-3 w-3" /> }
      case 'denied':
        return { text: '거부됨', color: 'bg-red-500', icon: <X className="h-3 w-3" /> }
      default:
        return { text: '대기 중', color: 'bg-yellow-500', icon: <AlertTriangle className="h-3 w-3" /> }
    }
  }

  const permissionStatus = getPermissionStatus()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          푸시 알림 설정
          <Badge 
            className={`ml-auto ${permissionStatus.color} text-white`}
          >
            {permissionStatus.icon}
            {permissionStatus.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 알림 권한 요청 */}
        {permission !== 'granted' && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              실시간 알림을 받으려면 브라우저 알림 권한을 허용해주세요.
            </p>
            <Button 
              onClick={requestPermission}
              disabled={permission === 'denied'}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              알림 권한 요청
            </Button>
            {permission === 'denied' && (
              <p className="text-xs text-red-600 mt-2">
                브라우저 설정에서 알림 권한을 직접 허용해야 합니다.
              </p>
            )}
          </div>
        )}

        {/* 알림 설정 */}
        {permission === 'granted' && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">알림 활성화</span>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            {settings.enabled && (
              <div className="space-y-3 pl-6 border-l-2 border-muted">
                <div className="flex items-center justify-between">
                  <span className="text-sm">리플렉션 알림</span>
                  <Switch
                    checked={settings.reflections}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, reflections: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">GitHub 활동 알림</span>
                  <Switch
                    checked={settings.github}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, github: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">통계 업데이트 알림</span>
                  <Switch
                    checked={settings.statistics}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, statistics: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">마일스톤 알림</span>
                  <Switch
                    checked={settings.milestones}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, milestones: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">일일 리마인더</span>
                  <Switch
                    checked={settings.dailyReminders}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, dailyReminders: checked }))
                    }
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={testNotification}
                  className="w-full mt-4"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  테스트 알림 보내기
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// 푸시 알림 통합 Provider
interface PushNotificationProviderProps {
  children: React.ReactNode
}

export function PushNotificationProvider({ children }: PushNotificationProviderProps) {
  const pushNotifications = usePushNotifications()

  // 여기서 실시간 훅들과 연동하여 자동 알림 발송
  // 실제 구현은 개별 페이지나 컴포넌트에서 필요에 따라 적용

  return (
    <>
      {children}
    </>
  )
}