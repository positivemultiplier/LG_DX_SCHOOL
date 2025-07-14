'use client'

import { useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  Github,
  FileText,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { useRealtimeReflections } from '@/hooks/use-realtime-reflections'
import { useRealtimeGitHub } from '@/hooks/use-realtime-github'
import { useRealtimeStatistics } from '@/hooks/use-realtime-statistics'

// Toast 스타일 설정
const toastConfig = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '14px',
    maxWidth: '400px',
    padding: '12px 16px'
  },
  success: {
    iconTheme: {
      primary: 'hsl(var(--primary))',
      secondary: 'hsl(var(--primary-foreground))',
    },
  },
  error: {
    iconTheme: {
      primary: 'hsl(var(--destructive))',
      secondary: 'hsl(var(--destructive-foreground))',
    },
  }
}

// 사용자 정의 Toast 컴포넌트들
export const showSuccessToast = (message: string, customIcon?: React.ReactNode) => {
  if (customIcon !== undefined) {
    toast.success(message, {
      ...toastConfig,
      icon: customIcon as any
    })
  } else {
    toast.success(message, {
      ...toastConfig,
      icon: <CheckCircle className="h-5 w-5" />
    })
  }
}

export const showErrorToast = (message: string, customIcon?: React.ReactNode) => {
  if (customIcon !== undefined) {
    toast.error(message, {
      ...toastConfig,
      icon: customIcon as any
    })
  } else {
    toast.error(message, {
      ...toastConfig,
      icon: <XCircle className="h-5 w-5" />
    })
  }
}

export const showWarningToast = (message: string, customIcon?: React.ReactNode) => {
  if (customIcon !== undefined) {
    toast(message, {
      ...toastConfig,
      icon: customIcon as any
    })
  } else {
    toast(message, {
      ...toastConfig,
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />
    })
  }
}

export const showInfoToast = (message: string, customIcon?: React.ReactNode) => {
  if (customIcon !== undefined) {
    toast(message, {
      ...toastConfig,
      icon: customIcon as any
    })
  } else {
    toast(message, {
      ...toastConfig,
      icon: <Info className="h-5 w-5 text-blue-500" />
    })
  }
}

// 특정 이벤트용 Toast 함수들
export const showReflectionToast = (type: 'created' | 'updated' | 'deleted', timePart?: string) => {
  const messages = {
    created: `${timePart || ''} 리플렉션이 저장되었습니다`,
    updated: `${timePart || ''} 리플렉션이 수정되었습니다`,
    deleted: `${timePart || ''} 리플렉션이 삭제되었습니다`
  }
  
  if (type === 'deleted') {
    showWarningToast(messages[type], <FileText className="h-5 w-5" />)
  } else {
    showSuccessToast(messages[type], <FileText className="h-5 w-5" />)
  }
}

export const showGitHubToast = (type: 'commit' | 'sync_start' | 'sync_complete' | 'error', details?: string) => {
  const messages = {
    commit: `새로운 GitHub 활동이 감지되었습니다${details ? `: ${details}` : ''}`,
    sync_start: 'GitHub 데이터 동기화를 시작합니다',
    sync_complete: 'GitHub 데이터 동기화가 완료되었습니다',
    error: `GitHub 연동 오류${details ? `: ${details}` : ''}`
  }
  
  switch (type) {
    case 'commit':
      showInfoToast(messages[type], <Github className="h-5 w-5" />)
      break
    case 'sync_start':
      showInfoToast(messages[type], <RefreshCw className="h-5 w-5 animate-spin" />)
      break
    case 'sync_complete':
      showSuccessToast(messages[type], <Github className="h-5 w-5" />)
      break
    case 'error':
      showErrorToast(messages[type], <Github className="h-5 w-5" />)
      break
  }
}

export const showStatisticsToast = (message: string) => {
  showSuccessToast(message, <TrendingUp className="h-5 w-5" />)
}

// 연결 상태 Toast
export const showConnectionToast = (isConnected: boolean, service: string) => {
  if (isConnected) {
    showSuccessToast(`${service} 실시간 연결이 복원되었습니다`)
  } else {
    showErrorToast(`${service} 실시간 연결이 끊어졌습니다`)
  }
}

// 메인 Toast 알림 시스템
interface ToastNotificationsProps {
  enableRealtimeNotifications?: boolean
}

export function ToastNotifications({ 
  enableRealtimeNotifications = true 
}: ToastNotificationsProps) {
  const reflectionsRealtime = useRealtimeReflections()
  const githubRealtime = useRealtimeGitHub()
  const statisticsRealtime = useRealtimeStatistics()

  // 리플렉션 실시간 알림
  useEffect(() => {
    if (!enableRealtimeNotifications) return

    if (reflectionsRealtime.lastUpdate) {
      const recentReflection = reflectionsRealtime.reflections[0]
      if (recentReflection) {
        showReflectionToast('created', recentReflection.time_part)
      }
    }
  }, [reflectionsRealtime.lastUpdate, enableRealtimeNotifications])

  // GitHub 실시간 알림
  useEffect(() => {
    if (!enableRealtimeNotifications) return

    if (githubRealtime.lastUpdate && githubRealtime.activityRecords.length > 0) {
      const latestRecord = githubRealtime.activityRecords[0]
      showGitHubToast('commit', `${latestRecord.repository_name}`)
    }
  }, [githubRealtime.lastUpdate, enableRealtimeNotifications])

  // GitHub 동기화 상태 알림
  useEffect(() => {
    if (!enableRealtimeNotifications) return

    if (githubRealtime.syncStatus.isActive && githubRealtime.syncStatus.progress === 0) {
      showGitHubToast('sync_start')
    }
  }, [githubRealtime.syncStatus.isActive, enableRealtimeNotifications])

  // GitHub 동기화 완료 알림
  useEffect(() => {
    if (!enableRealtimeNotifications) return

    if (!githubRealtime.syncStatus.isActive && githubRealtime.syncStatus.progress === 100) {
      showGitHubToast('sync_complete')
    }
  }, [githubRealtime.syncStatus.isActive, githubRealtime.syncStatus.progress, enableRealtimeNotifications])

  // 통계 업데이트 알림
  useEffect(() => {
    if (!enableRealtimeNotifications) return

    if (statisticsRealtime.lastUpdate && statisticsRealtime.todayStats) {
      showStatisticsToast('일일 통계가 업데이트되었습니다')
    }
  }, [statisticsRealtime.lastUpdate, enableRealtimeNotifications])

  // 연결 상태 변화 알림
  useEffect(() => {
    if (!enableRealtimeNotifications) return
    
    showConnectionToast(reflectionsRealtime.isConnected, '리플렉션')
  }, [reflectionsRealtime.isConnected, enableRealtimeNotifications])

  useEffect(() => {
    if (!enableRealtimeNotifications) return
    
    showConnectionToast(githubRealtime.isConnected, 'GitHub')
  }, [githubRealtime.isConnected, enableRealtimeNotifications])

  useEffect(() => {
    if (!enableRealtimeNotifications) return
    
    showConnectionToast(statisticsRealtime.isConnected, '통계')
  }, [statisticsRealtime.isConnected, enableRealtimeNotifications])

  // 에러 알림
  useEffect(() => {
    if (reflectionsRealtime.error) {
      showErrorToast(`리플렉션 오류: ${reflectionsRealtime.error}`)
    }
  }, [reflectionsRealtime.error])

  useEffect(() => {
    if (githubRealtime.error) {
      showGitHubToast('error', githubRealtime.error)
    }
  }, [githubRealtime.error])

  useEffect(() => {
    if (statisticsRealtime.error) {
      showErrorToast(`통계 오류: ${statisticsRealtime.error}`)
    }
  }, [statisticsRealtime.error])

  return (
    <Toaster
      position={toastConfig.position}
      toastOptions={toastConfig}
      containerStyle={{
        top: 80, // 헤더 아래 여백
      }}
    />
  )
}