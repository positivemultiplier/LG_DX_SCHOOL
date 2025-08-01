'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react'

interface GitHubIntegration {
  is_connected: boolean
  integration?: {
    github_username: string
    github_user_id: number
    connected_at: string
    last_sync_at?: string
    is_active: boolean
    sync_enabled: boolean
    avatar_url?: string
    github_name?: string
    public_repos?: number
    followers?: number
    following?: number
  }
}

interface GitHubOAuthConfig {
  configured: boolean
  client_id: string
  redirect_uri: string
  scopes: string[]
}

export function GitHubConnectCard({ userId }: { userId: string }) {
  const [integration, setIntegration] = useState<GitHubIntegration | null>(null)
  const [oauthConfig, setOAuthConfig] = useState<GitHubOAuthConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // GitHub 연동 상태 조회
  useEffect(() => {
    const checkIntegrationStatus = async () => {
      try {
        const response = await fetch(`/api/github/connect?user_id=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setIntegration(data)
        }
      } catch (error) {
        console.error('Failed to check GitHub integration:', error)
      }
    }

    const checkOAuthConfig = async () => {
      try {
        const response = await fetch('/api/auth/github/start')
        if (response.ok) {
          const data = await response.json()
          setOAuthConfig(data)
        }
      } catch (error) {
        console.error('Failed to check OAuth config:', error)
      }
    }

    checkIntegrationStatus()
    checkOAuthConfig()
  }, [userId])

  // GitHub 연동 시작
  const handleConnect = async () => {
    if (!oauthConfig?.configured) {
      setError('GitHub OAuth가 올바르게 설정되지 않았습니다.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/github/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      })

      if (response.ok) {
        const data = await response.json()
        // GitHub OAuth 페이지로 리다이렉트
        window.location.href = data.auth_url
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'GitHub 연동 시작에 실패했습니다.')
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // GitHub 연동 해제
  const handleDisconnect = async () => {
    if (!confirm('GitHub 연동을 해제하시겠습니까? 모든 활동 데이터가 삭제됩니다.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/github/connect', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      })

      if (response.ok) {
        setIntegration({ is_connected: false })
        window.location.reload()
      } else {
        setError('연동 해제에 실패했습니다.')
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!integration) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub 연동
          </CardTitle>
          <CardDescription>GitHub 활동을 불러오는 중...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub 연동
          {integration.is_connected ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              연결됨
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              미연결
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {integration.is_connected 
            ? 'GitHub 활동이 자동으로 동기화됩니다'
            : 'GitHub 계정을 연결하여 코딩 활동을 추적하세요'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!oauthConfig?.configured && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 mb-2">
              GitHub OAuth 설정이 필요합니다.
            </p>
            <a 
              href="https://github.com/settings/developers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              GitHub Developer Settings
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {integration.is_connected && integration.integration && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {integration.integration.avatar_url && (
                <img 
                  src={integration.integration.avatar_url}
                  alt="GitHub Avatar"
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">
                  {integration.integration.github_name || integration.integration.github_username}
                </p>
                <p className="text-sm text-gray-600">
                  @{integration.integration.github_username}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {integration.integration.public_repos || 0}
                </p>
                <p className="text-xs text-gray-600">Repositories</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {integration.integration.followers || 0}
                </p>
                <p className="text-xs text-gray-600">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {integration.integration.following || 0}
                </p>
                <p className="text-xs text-gray-600">Following</p>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <p>연결일: {new Date(integration.integration.connected_at).toLocaleDateString('ko-KR')}</p>
              {integration.integration.last_sync_at && (
                <p>마지막 동기화: {new Date(integration.integration.last_sync_at).toLocaleDateString('ko-KR')}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {integration.is_connected ? (
            <Button 
              variant="destructive" 
              onClick={handleDisconnect}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  연결 해제 중...
                </>
              ) : (
                '연결 해제'
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleConnect}
              disabled={isLoading || !oauthConfig?.configured}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  연결 중...
                </>
              ) : (
                <>
                  <Github className="h-4 w-4 mr-2" />
                  GitHub 연결
                </>
              )}
            </Button>
          )}
        </div>

        {oauthConfig?.configured && (
          <div className="text-xs text-gray-500">
            <p>권한: {oauthConfig.scopes.join(', ')}</p>
            <p>Redirect: {oauthConfig.redirect_uri}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
