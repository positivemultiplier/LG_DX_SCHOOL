/**
 * 차트 테마 시스템
 * 일관된 차트 스타일링을 위한 테마 설정
 */

export const chartColors = {
  // 3-Part 시간대별 색상
  timeParts: {
    morning: '#f59e0b',   // 오전 - 따뜻한 노란색
    afternoon: '#10b981', // 오후 - 활동적인 초록색  
    evening: '#8b5cf6',   // 저녁 - 차분한 보라색
  },
  
  // 성과 등급별 색상
  performance: {
    excellent: '#10b981', // 우수 (8-10점)
    good: '#3b82f6',      // 양호 (6-7점)
    average: '#f59e0b',   // 보통 (4-5점)
    poor: '#ef4444',      // 개선필요 (1-3점)
  },
  
  // GitHub 활동 강도별 색상 (GitHub 스타일)
  github: {
    level0: '#ebedf0',    // 활동 없음
    level1: '#9be9a8',    // 낮은 활동
    level2: '#40c463',    // 보통 활동
    level3: '#30a14e',    // 높은 활동
    level4: '#216e39',    // 매우 높은 활동
  },
  
  // UI 상태별 색상
  status: {
    completed: '#10b981',
    inProgress: '#f59e0b',
    pending: '#6b7280',
    error: '#ef4444',
  },
  
  // 그라데이션 색상
  gradients: {
    primary: ['#3b82f6', '#1d4ed8'],
    success: ['#10b981', '#047857'],
    warning: ['#f59e0b', '#d97706'],
    danger: ['#ef4444', '#dc2626'],
  }
}

export const chartTheme = {
  // 기본 차트 설정
  defaults: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 12,
    fontWeight: 400,
    margin: { top: 20, right: 30, bottom: 20, left: 20 },
  },
  
  // 축 설정
  axis: {
    stroke: '#e5e7eb',
    strokeWidth: 1,
    tick: {
      fontSize: 11,
      fill: '#6b7280',
    },
    label: {
      fontSize: 12,
      fill: '#374151',
      fontWeight: 500,
    }
  },
  
  // 그리드 설정
  grid: {
    stroke: '#f3f4f6',
    strokeDasharray: '3 3',
    strokeWidth: 1,
  },
  
  // 툴팁 설정
  tooltip: {
    backgroundColor: '#1f2937',
    border: 'none',
    borderRadius: 8,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    color: '#ffffff',
    fontSize: 12,
    padding: 12,
  },
  
  // 범례 설정
  legend: {
    fontSize: 11,
    fill: '#6b7280',
    iconSize: 12,
    spacing: 16,
  }
}

/**
 * 점수에 따른 색상 반환
 */
export const getScoreColor = (score: number): string => {
  if (score >= 8) return chartColors.performance.excellent
  if (score >= 6) return chartColors.performance.good
  if (score >= 4) return chartColors.performance.average
  return chartColors.performance.poor
}

/**
 * GitHub 활동 강도에 따른 색상 반환
 */
export const getGithubActivityColor = (level: number): string => {
  const colors = chartColors.github
  switch (level) {
    case 0: return colors.level0
    case 1: return colors.level1
    case 2: return colors.level2
    case 3: return colors.level3
    case 4: return colors.level4
    default: return colors.level0
  }
}

/**
 * 시간대별 색상 반환
 */
export const getTimePartColor = (timePart: string): string => {
  switch (timePart) {
    case 'morning': return chartColors.timeParts.morning
    case 'afternoon': return chartColors.timeParts.afternoon
    case 'evening': return chartColors.timeParts.evening
    default: return chartColors.status.pending
  }
}

/**
 * 반응형 차트 크기 계산
 */
export const getResponsiveChartSize = (containerWidth: number) => {
  return {
    width: containerWidth,
    height: Math.max(200, Math.min(400, containerWidth * 0.6)),
    margin: {
      top: 20,
      right: containerWidth > 768 ? 30 : 15,
      bottom: 40,
      left: containerWidth > 768 ? 40 : 25,
    }
  }
}

/**
 * 차트 애니메이션 설정
 */
export const chartAnimations = {
  // 기본 진입 애니메이션
  enter: {
    duration: 800,
    easing: 'ease-out',
  },
  
  // 데이터 업데이트 애니메이션
  update: {
    duration: 400,
    easing: 'ease-in-out',
  },
  
  // 호버 애니메이션
  hover: {
    duration: 200,
    easing: 'ease-out',
  }
}

/**
 * 커스텀 차트 스타일
 */
export const customChartStyles = {
  // 레이더 차트 스타일
  radar: {
    polygon: {
      fill: 'rgba(59, 130, 246, 0.1)',
      stroke: '#3b82f6',
      strokeWidth: 2,
    },
    grid: {
      stroke: '#e5e7eb',
      strokeWidth: 1,
    },
    tick: {
      fontSize: 10,
      fill: '#6b7280',
    }
  },
  
  // 히트맵 스타일
  heatmap: {
    cell: {
      rx: 2,
      ry: 2,
      stroke: '#ffffff',
      strokeWidth: 1,
    },
    tooltip: {
      background: '#1f2937',
      color: '#ffffff',
      border: 'none',
      borderRadius: 6,
      padding: 8,
    }
  },
  
  // 트렌드 차트 스타일
  trend: {
    line: {
      strokeWidth: 3,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    area: {
      fillOpacity: 0.1,
    },
    dot: {
      r: 4,
      strokeWidth: 2,
      fill: '#ffffff',
    }
  }
}