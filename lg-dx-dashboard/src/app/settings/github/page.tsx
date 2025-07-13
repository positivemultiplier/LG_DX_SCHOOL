'use client'

import { useAuthContext } from '@/components/providers/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  GitBranch, 
  ArrowLeft, 
  Settings, 
  Unlink,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Github,
  Zap,
  Shield,
  Bell
} from 'lucide-react'

interface GitHubIntegration {
  github_username: string
  github_user_id: number
  connected_at: string
  last_sync_at?: string
  is_active: boolean
  sync_enabled: boolean
}

interface GitHubSyncStatus {
  sync_status: 'idle' | 'syncing' | 'error' | 'completed'
  sync_progress: number
  last_sync_at?: string
  error_message?: string
  total_repositories?: number
  synced_repositories?: number
  total_commits?: number
  synced_commits?: number
}

interface GitHubSettings {
  auto_sync: boolean
  sync_interval: number
  include_private_repos: boolean
  track_languages: string[]
  exclude_repositories: string[]
  webhook_enabled: boolean
  notifications_enabled: boolean
}

export default function GitHubSettingsPage() {
  const { user, loading } = useAuthContext()
  const [integration, setIntegration] = useState<GitHubIntegration | null>(null)
  const [syncStatus, setSyncStatus] = useState<GitHubSyncStatus | null>(null)
  const [settings, setSettings] = useState<GitHubSettings>({
    auto_sync: true,
    sync_interval: 360,
    include_private_repos: false,
    track_languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go'],
    exclude_repositories: [],
    webhook_enabled: false,
    notifications_enabled: true
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadGitHubData()
    }
  }, [user])

  const loadGitHubData = async () => {
    try {
      setPageLoading(true)
      
      // 연동 상태 확인
      const connectionResponse = await fetch(`/api/github/connect?user_id=${user.id}`)
      const connectionData = await connectionResponse.json()
      
      if (connectionData.is_connected) {
        setIntegration(connectionData.integration)
        
        // 동기화 상태 확인
        const syncResponse = await fetch(`/api/github/sync?user_id=${user.id}`)
        const syncData = await syncResponse.json()
        setSyncStatus(syncData.sync_status)
        
        // 설정 정보 로드 (임시로 기본값 사용)
        // TODO: 실제 설정 API 구현
      }
    } catch (error) {
      console.error('Failed to load GitHub data:', error)
    } finally {
      setPageLoading(false)
    }
  }

  const handleConnectGitHub = () => {
    setIsConnecting(true)
    
    // GitHub OAuth 연동 시작
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const redirectUri = `${window.location.origin}/settings/github/callback`
    const scope = 'repo,user:email,read:user'
    const state = `${user.id}_${Date.now()}`
    
    const authUrl = `https://github.com/login/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`
    
    window.location.href = authUrl
  }

  const handleDisconnectGitHub = async () => {
    try {
      const response = await fetch('/api/github/connect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      })

      if (response.ok) {
        setIntegration(null)
        setSyncStatus(null)
      }
    } catch (error) {
      console.error('Failed to disconnect GitHub:', error)
    }
  }

  const handleManualSync = async () => {
    try {
      setIsSyncing(true)
      
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id,
          force_sync: true 
        })
      })

      if (response.ok) {
        await loadGitHubData()
      }
    } catch (error) {
      console.error('Failed to sync GitHub data:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const updateSettings = async (newSettings: Partial<GitHubSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
    // TODO: API 호출로 설정 저장
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  const getSyncStatusInfo = () => {
    if (!syncStatus) return { icon: Clock, color: 'text-gray-500', text: '동기화 정보 없음' }
    
    switch (syncStatus.sync_status) {
      case 'syncing':
        return { icon: RefreshCw, color: 'text-blue-500', text: '동기화 진행 중', animate: true }
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-500', text: '동기화 완료' }
      case 'error':
        return { icon: AlertCircle, color: 'text-red-500', text: '동기화 오류' }
      default:
        return { icon: Clock, color: 'text-gray-500', text: '대기 중' }
    }
  }

  const statusInfo = getSyncStatusInfo()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  대시보드로
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Github className="h-6 w-6 text-gray-900" />
                  GitHub 연동 설정
                </h1>
                <p className="text-sm text-gray-600">
                  GitHub 계정을 연결하여 자동으로 활동을 추적하세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          
          {/* 연동 상태 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                연동 상태
              </CardTitle>
              <CardDescription>
                GitHub 계정 연결 및 동기화 상태를 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integration ? (
                <div className="space-y-4">
                  {/* 연결된 계정 정보 */}
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Github className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-green-800">
                          @{integration.github_username}
                        </div>
                        <div className="text-sm text-green-600">
                          연결됨: {new Date(integration.connected_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      연결됨
                    </Badge>
                  </div>

                  {/* 동기화 상태 */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <statusInfo.icon 
                        className={`h-5 w-5 ${statusInfo.color} ${statusInfo.animate ? 'animate-spin' : ''}`} 
                      />
                      <div>
                        <div className="font-medium">{statusInfo.text}</div>
                        {syncStatus?.last_sync_at && (
                          <div className="text-sm text-gray-600">
                            마지막 동기화: {new Date(syncStatus.last_sync_at).toLocaleString()}
                          </div>
                        )}
                        {syncStatus?.sync_status === 'syncing' && (
                          <div className="text-sm text-blue-600">
                            진행률: {syncStatus.sync_progress}%
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleManualSync}
                        disabled={isSyncing || syncStatus?.sync_status === 'syncing'}
                        size="sm"
                      >
                        {isSyncing || syncStatus?.sync_status === 'syncing' ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        수동 동기화
                      </Button>
                      <Button
                        onClick={handleDisconnectGitHub}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Unlink className="h-4 w-4 mr-2" />
                        연결 해제
                      </Button>
                    </div>
                  </div>

                  {/* 동기화 통계 */}
                  {syncStatus && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-lg font-bold text-blue-600">
                          {syncStatus.total_repositories || 0}
                        </div>
                        <div className="text-xs text-blue-700">저장소</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">
                          {syncStatus.total_commits || 0}
                        </div>
                        <div className="text-xs text-green-700">커밋</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <div className="text-lg font-bold text-purple-600">
                          {syncStatus.synced_repositories || 0}
                        </div>
                        <div className="text-xs text-purple-700">동기화됨</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded">
                        <div className="text-lg font-bold text-orange-600">
                          {Math.round(syncStatus.sync_progress || 0)}%
                        </div>
                        <div className="text-xs text-orange-700">진행률</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Github className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    GitHub 계정을 연결하세요
                  </h3>
                  <p className="text-gray-600 mb-6">
                    GitHub 활동을 자동으로 추적하고 대시보드에서 분석할 수 있습니다
                  </p>
                  <Button 
                    onClick={handleConnectGitHub}
                    disabled={isConnecting}
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    {isConnecting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Github className="h-4 w-4 mr-2" />
                    )}
                    GitHub 계정 연결
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 동기화 설정 */}
          {integration && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  동기화 설정
                </CardTitle>
                <CardDescription>
                  GitHub 데이터 동기화 방식을 설정하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">자동 동기화</Label>
                    <p className="text-sm text-gray-600">
                      정기적으로 GitHub 활동을 자동 수집합니다
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_sync}
                    onCheckedChange={(checked) => updateSettings({ auto_sync: checked })}
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="sync-interval" className="text-base font-medium">
                    동기화 주기
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">
                    자동 동기화 실행 간격을 설정합니다 (분 단위)
                  </p>
                  <Input
                    id="sync-interval"
                    type="number"
                    min="60"
                    max="1440"
                    value={settings.sync_interval}
                    onChange={(e) => updateSettings({ sync_interval: parseInt(e.target.value) })}
                    className="w-32"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    권장: 360분 (6시간)
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">프라이빗 저장소 포함</Label>
                    <p className="text-sm text-gray-600">
                      프라이빗 저장소의 활동도 추적합니다
                    </p>
                  </div>
                  <Switch
                    checked={settings.include_private_repos}
                    onCheckedChange={(checked) => updateSettings({ include_private_repos: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 고급 설정 */}
          {integration && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  고급 설정
                </CardTitle>
                <CardDescription>
                  추가 기능 및 보안 설정을 관리하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">웹훅 활성화</Label>
                    <p className="text-sm text-gray-600">
                      실시간 GitHub 이벤트 수신 (베타 기능)
                    </p>
                  </div>
                  <Switch
                    checked={settings.webhook_enabled}
                    onCheckedChange={(checked) => updateSettings({ webhook_enabled: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">알림 활성화</Label>
                    <p className="text-sm text-gray-600">
                      동기화 완료 및 오류 알림을 받습니다
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications_enabled}
                    onCheckedChange={(checked) => updateSettings({ notifications_enabled: checked })}
                  />
                </div>

                <Separator />

                {/* 추적할 언어 설정 */}
                <div>
                  <Label className="text-base font-medium">추적할 프로그래밍 언어</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    분석에 포함할 프로그래밍 언어를 선택하세요
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'PHP'].map(lang => (
                      <Badge 
                        key={lang}
                        variant={settings.track_languages.includes(lang) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const newLanguages = settings.track_languages.includes(lang)
                            ? settings.track_languages.filter(l => l !== lang)
                            : [...settings.track_languages, lang]
                          updateSettings({ track_languages: newLanguages })
                        }}
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </main>
    </div>
  )
}