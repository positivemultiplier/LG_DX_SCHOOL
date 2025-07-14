/**
 * React 성능 최적화 유틸리티
 * memo, useMemo, useCallback 적용 가이드라인
 */

import { memo, useMemo, useCallback, ReactNode } from 'react'

// GitHub 차트 컴포넌트 최적화 예시
export interface GitHubChartProps {
  data: Array<{
    date: string
    commits: number
    level: 0 | 1 | 2 | 3 | 4
  }>
  timeRange: '7d' | '30d' | '90d' | '1y'
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void
}

// 메모화된 차트 컴포넌트
export const GitHubChart = memo<GitHubChartProps>(({ 
  data, 
  timeRange, 
  onTimeRangeChange 
}) => {
  // 차트 설정을 메모화
  const chartConfig = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: `GitHub 활동 (${timeRange})`,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: Math.max(...data.map(d => d.commits)) + 5,
        },
      },
    }
  }, [data, timeRange])

  // 차트 설정을 사용하는 로그 (개발용)
  console.log('Chart config updated:', chartConfig)

  // 차트 데이터를 메모화
  const chartData = useMemo(() => {
    const filteredData = filterDataByTimeRange(data, timeRange)
    
    return {
      labels: filteredData.map(d => formatDate(d.date)),
      datasets: [
        {
          label: 'Commits',
          data: filteredData.map(d => d.commits),
          backgroundColor: filteredData.map(d => getColorByLevel(d.level)),
          borderColor: 'rgba(53, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    }
  }, [data, timeRange])

  // 이벤트 핸들러를 메모화
  const handleRangeChange = useCallback((newRange: string) => {
    onTimeRangeChange(newRange as '7d' | '30d' | '90d' | '1y')
  }, [onTimeRangeChange])

  return (
    <div className="github-chart">
      <div className="chart-controls">
        {['7d', '30d', '90d', '1y'].map(range => (
          <button
            key={range}
            onClick={() => handleRangeChange(range)}
            className={timeRange === range ? 'active' : ''}
          >
            {range}
          </button>
        ))}
      </div>
      {/* Chart 컴포넌트 */}
      <div className="chart-container">
        {JSON.stringify(chartData)}
      </div>
    </div>
  )
})

GitHubChart.displayName = 'GitHubChart'

// 유틸리티 함수들
function filterDataByTimeRange(
  data: GitHubChartProps['data'], 
  range: string
): GitHubChartProps['data'] {
  const now = new Date()
  const days = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365,
  }[range] || 30

  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  
  return data.filter(d => new Date(d.date) >= cutoff)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
}

function getColorByLevel(level: 0 | 1 | 2 | 3 | 4): string {
  const colors = {
    0: 'rgba(235, 237, 240, 0.8)',
    1: 'rgba(155, 233, 168, 0.8)',
    2: 'rgba(64, 196, 255, 0.8)',
    3: 'rgba(48, 161, 78, 0.8)',
    4: 'rgba(33, 110, 57, 0.8)',
  }
  return colors[level]
}

// 커스텀 훅 최적화 예시
export interface UseGitHubDataOptions {
  userId: string
  refreshInterval?: number
  autoRefresh?: boolean
}

export interface GitHubDataState {
  data: GitHubChartProps['data']
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useGitHubData(options: UseGitHubDataOptions): GitHubDataState & {
  refresh: () => Promise<void>
  setTimeRange: (range: string) => void
} {
  // 실제 구현은 여기에...
  // useState, useEffect, useCallback 사용
  
  const refresh = useCallback(async () => {
    // API 호출 로직
    console.log('Refreshing GitHub data for user:', options.userId)
  }, [options.userId])

  const setTimeRange = useCallback((range: string) => {
    // 시간 범위 변경 로직
    console.log('Setting time range:', range)
  }, [])

  return {
    data: [],
    loading: false,
    error: null,
    lastUpdated: null,
    refresh,
    setTimeRange,
  }
}

// 리스트 아이템 최적화
export interface GitHubActivityItemProps {
  id: string
  date: string
  commits: number
  repositories: string[]
  onClick: (id: string) => void
}

export const GitHubActivityItem = memo<GitHubActivityItemProps>(({ 
  id, 
  date, 
  commits, 
  repositories, 
  onClick 
}) => {
  const handleClick = useCallback(() => {
    onClick(id)
  }, [id, onClick])

  const repositoryText = useMemo(() => {
    if (repositories.length === 0) return 'No repositories'
    if (repositories.length === 1) return repositories[0]
    return `${repositories[0]} +${repositories.length - 1} more`
  }, [repositories])

  return (
    <div 
      className="activity-item" 
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className="activity-date">{formatDate(date)}</div>
      <div className="activity-commits">{commits} commits</div>
      <div className="activity-repos">{repositoryText}</div>
    </div>
  )
})

GitHubActivityItem.displayName = 'GitHubActivityItem'

// 컨테이너 컴포넌트 최적화
export interface GitHubDashboardProps {
  userId: string
  children: ReactNode
}

export const GitHubDashboard = memo<GitHubDashboardProps>(({ userId, children }) => {
  const githubData = useGitHubData({ 
    userId, 
    refreshInterval: 300000, // 5분
    autoRefresh: true 
  })

  // 에러 처리 메모화
  const errorMessage = useMemo(() => {
    if (!githubData.error) return null
    
    return (
      <div className="error-message">
        <h3>데이터 로드 실패</h3>
        <p>{githubData.error}</p>
        <button onClick={githubData.refresh}>다시 시도</button>
      </div>
    )
  }, [githubData.error, githubData.refresh])

  // 로딩 상태 메모화
  const loadingIndicator = useMemo(() => {
    if (!githubData.loading) return null
    
    return (
      <div className="loading-indicator">
        <div className="spinner" />
        <span>GitHub 데이터를 불러오는 중...</span>
      </div>
    )
  }, [githubData.loading])

  return (
    <div className="github-dashboard">
      {errorMessage}
      {loadingIndicator}
      {!githubData.loading && !githubData.error && children}
    </div>
  )
})

GitHubDashboard.displayName = 'GitHubDashboard'

// 성능 최적화 가이드라인
export const PERFORMANCE_GUIDELINES = {
  // 1. memo 사용 기준
  memo: {
    description: 'props가 자주 변경되지 않는 컴포넌트에 사용',
    examples: [
      'Chart 컴포넌트 (데이터가 가끔만 변경)',
      'List Item 컴포넌트 (개별 아이템)',
      'Header/Footer 컴포넌트 (정적 콘텐츠)',
    ],
  },
  
  // 2. useMemo 사용 기준
  useMemo: {
    description: '복잡한 계산이나 객체 생성을 메모화',
    examples: [
      '차트 설정 객체 생성',
      '필터링된 데이터 계산',
      '정규표현식 객체 생성',
    ],
  },
  
  // 3. useCallback 사용 기준
  useCallback: {
    description: '자식 컴포넌트에 전달되는 함수를 메모화',
    examples: [
      '이벤트 핸들러 함수',
      'API 호출 함수',
      '자식 컴포넌트 콜백',
    ],
  },
  
  // 4. 피해야 할 패턴
  antiPatterns: [
    'props로 전달되지 않는 함수에 useCallback 사용',
    '단순한 계산에 useMemo 사용',
    '매번 변경되는 props를 가진 컴포넌트에 memo 사용',
  ],
}
