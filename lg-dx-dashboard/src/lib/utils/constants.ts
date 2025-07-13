export const TIME_PARTS = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon', 
  EVENING: 'evening'
} as const;

export const TIME_PART_LABELS = {
  [TIME_PARTS.MORNING]: '🌅 오전수업',
  [TIME_PARTS.AFTERNOON]: '🌞 오후수업',
  [TIME_PARTS.EVENING]: '🌙 저녁자율학습'
} as const;

export const CONDITIONS = {
  GOOD: '좋음',
  NORMAL: '보통',
  BAD: '나쁨'
} as const;

export const GOAL_CATEGORIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly', 
  MONTHLY: 'monthly',
  PROJECT: 'project',
  SKILL: 'skill'
} as const;

export const GOAL_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
} as const;

export const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;