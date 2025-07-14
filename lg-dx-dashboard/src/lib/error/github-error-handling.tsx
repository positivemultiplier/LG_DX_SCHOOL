/**
 * GitHub 연동을 위한 강화된 에러 처리 시스템
 */

import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

// 에러 타입 정의
export interface AppError {
  code: string
  message: string
  details?: string
  retryable: boolean
  timestamp: Date
  userId?: string
  context?: Record<string, unknown>
}

// GitHub 관련 에러 타입
export type GitHubErrorCode = 
  | 'GITHUB_TOKEN_INVALID'
  | 'GITHUB_TOKEN_EXPIRED'
  | 'GITHUB_RATE_LIMIT'
  | 'GITHUB_API_ERROR'
  | 'GITHUB_NETWORK_ERROR'
  | 'GITHUB_OAUTH_ERROR'
  | 'GITHUB_SYNC_ERROR'

// 에러 생성 헬퍼
export function createAppError(
  code: GitHubErrorCode, 
  message: string, 
  details?: string,
  context?: Record<string, unknown>
): AppError {
  return {
    code,
    message,
    details,
    retryable: getRetryableStatus(code),
    timestamp: new Date(),
    context,
  }
}

function getRetryableStatus(code: GitHubErrorCode): boolean {
  const retryableCodes: GitHubErrorCode[] = [
    'GITHUB_RATE_LIMIT',
    'GITHUB_NETWORK_ERROR',
    'GITHUB_SYNC_ERROR',
  ]
  return retryableCodes.includes(code)
}

// 에러 바운더리 Props
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorId: string | null
}

// GitHub 전용 에러 바운더리
export class GitHubErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    console.error('GitHub Error Boundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    })

    // 사용자 정의 에러 핸들러 호출
    this.props.onError?.(error, errorInfo)

    // 에러 리포팅 서비스에 전송 (예: Sentry)
    // reportError(error, errorInfo, this.state.errorId)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <GitHubErrorDisplay 
          error={this.state.error}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

// 에러 표시 컴포넌트
interface GitHubErrorDisplayProps {
  error: Error | null
  errorId: string | null
  onRetry: () => void
}

function GitHubErrorDisplay({ error, errorId, onRetry }: GitHubErrorDisplayProps) {
  const errorType = detectErrorType(error)
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-red-50 rounded-lg border border-red-200">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        GitHub 연동 오류가 발생했습니다
      </h3>
      
      <p className="text-red-700 text-center mb-4 max-w-md">
        {getErrorMessage(errorType)}
      </p>
      
      {error?.message && (
        <details className="mb-4">
          <summary className="text-sm text-red-600 cursor-pointer">
            기술적 세부사항
          </summary>
          <pre className="text-xs text-red-800 mt-2 p-2 bg-red-100 rounded overflow-auto max-w-md">
            {error.message}
          </pre>
        </details>
      )}
      
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </button>
        
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          <Home className="h-4 w-4" />
          대시보드로
        </button>
      </div>
      
      {errorId && (
        <p className="text-xs text-gray-500 mt-4">
          오류 ID: {errorId}
        </p>
      )}
    </div>
  )
}

// 에러 타입 감지
function detectErrorType(error: Error | null): GitHubErrorCode {
  if (!error) return 'GITHUB_API_ERROR'
  
  const message = error.message.toLowerCase()
  
  if (message.includes('token') && message.includes('invalid')) {
    return 'GITHUB_TOKEN_INVALID'
  }
  if (message.includes('rate limit')) {
    return 'GITHUB_RATE_LIMIT'
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'GITHUB_NETWORK_ERROR'
  }
  if (message.includes('oauth')) {
    return 'GITHUB_OAUTH_ERROR'
  }
  if (message.includes('sync')) {
    return 'GITHUB_SYNC_ERROR'
  }
  
  return 'GITHUB_API_ERROR'
}

// 사용자 친화적 에러 메시지
function getErrorMessage(errorType: GitHubErrorCode): string {
  const messages: Record<GitHubErrorCode, string> = {
    GITHUB_TOKEN_INVALID: 'GitHub 토큰이 유효하지 않습니다. 다시 연결해주세요.',
    GITHUB_TOKEN_EXPIRED: 'GitHub 토큰이 만료되었습니다. 다시 로그인해주세요.',
    GITHUB_RATE_LIMIT: 'GitHub API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
    GITHUB_API_ERROR: 'GitHub API 통신 중 오류가 발생했습니다.',
    GITHUB_NETWORK_ERROR: '네트워크 연결을 확인하고 다시 시도해주세요.',
    GITHUB_OAUTH_ERROR: 'GitHub 로그인 과정에서 오류가 발생했습니다.',
    GITHUB_SYNC_ERROR: 'GitHub 데이터 동기화 중 오류가 발생했습니다.',
  }
  
  return messages[errorType] || '알 수 없는 오류가 발생했습니다.'
}

// API 요청 래퍼 - 에러 처리 강화
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  errorContext?: Record<string, unknown>
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await apiCall()
    return { data, error: null }
  } catch (err) {
    const error = err as Error
    
    // GitHub 특화 에러 처리
    const appError = createAppError(
      detectErrorType(error),
      error.message,
      error.stack,
      errorContext
    )
    
    console.error('API Call Failed:', appError)
    
    return { data: null, error: appError }
  }
}

// React Hook 형태의 에러 처리
export function useErrorHandler() {
  const handleError = (error: unknown, context?: Record<string, unknown>) => {
    const appError = error instanceof Error 
      ? createAppError(detectErrorType(error), error.message, error.stack, context)
      : createAppError('GITHUB_API_ERROR', 'Unknown error occurred', undefined, context)
    
    console.error('Handled Error:', appError)
    
    // 에러 상태 관리나 토스트 알림 등을 여기서 처리
    // toast.error(getErrorMessage(appError.code))
    
    return appError
  }

  return { handleError }
}

// HOC 형태의 에러 처리
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ErrorHandledComponent(props: P) {
    return (
      <GitHubErrorBoundary>
        <Component {...props} />
      </GitHubErrorBoundary>
    )
  }
}

// 에러 리포팅 함수 (선택사항)
export function reportError(
  error: Error, 
  errorInfo: ErrorInfo, 
  errorId: string | null,
  userId?: string
) {
  // 실제 에러 리포팅 서비스 연동
  const errorReport = {
    errorId,
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    userId,
    url: window.location.href,
    userAgent: navigator.userAgent,
  }
  
  console.log('Error Report:', errorReport)
  
  // 예: Sentry, LogRocket, 또는 자체 에러 로깅 시스템
  // Sentry.captureException(error, { extra: errorReport })
}
