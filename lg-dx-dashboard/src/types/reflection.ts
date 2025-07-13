// 리플렉션 시스템 타입 정의
export type TimePart = 'morning' | 'afternoon' | 'evening';
export type Condition = '좋음' | '보통' | '나쁨';

export interface CreateReflectionData {
  date: string; // YYYY-MM-DD 형식
  time_part: TimePart;
  understanding_score: number; // 1-10
  concentration_score: number; // 1-10
  achievement_score: number; // 1-10
  condition: Condition;
  subjects?: Record<string, any>; // 과목별 세부 정보
  achievements?: string[]; // 오늘의 성취
  challenges?: string[]; // 어려웠던 점
  tomorrow_goals?: string[]; // 내일 목표
  notes?: string; // 기타 메모
  github_commits?: number;
  github_issues?: number;
  github_prs?: number;
  github_reviews?: number;
}

export interface UpdateReflectionData extends Partial<CreateReflectionData> {
  id: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  date: string;
  time_part: TimePart;
  understanding_score: number;
  concentration_score: number;
  achievement_score: number;
  condition: Condition;
  total_score: number; // 자동 계산
  subjects: Record<string, any>;
  achievements: string[];
  challenges: string[];
  tomorrow_goals: string[];
  notes: string | null;
  github_commits: number;
  github_issues: number;
  github_prs: number;
  github_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface DailyReflectionSummary {
  date: string;
  morning?: Reflection;
  afternoon?: Reflection;
  evening?: Reflection;
  completed_count: number;
  total_score: number;
  average_score: number;
}

export interface Subject {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  color_code: string;
  icon: string;
  difficulty_level: number;
  estimated_hours?: number;
  prerequisites: string[];
  is_active: boolean;
  created_at: string;
}

export interface DailyStatistics {
  id: string;
  user_id: string;
  date: string;
  reflections_completed: number;
  total_reflection_score: number;
  average_reflection_score: number;
  total_study_time_minutes: number;
  morning_study_time: number;
  afternoon_study_time: number;
  evening_study_time: number;
  github_activity_score: number;
  daily_goals_completed: number;
  daily_goals_total: number;
  daily_grade: string | null;
  consistency_score: number;
  calculated_at: string;
}

// 폼 검증을 위한 스키마
export interface ReflectionFormData {
  understanding_score: number;
  concentration_score: number;
  achievement_score: number;
  condition: Condition;
  subjects: Record<string, any>;
  achievements: string[];
  challenges: string[];
  tomorrow_goals: string[];
  notes: string;
}

// 리플렉션 필터 및 정렬 옵션
export interface ReflectionFilters {
  startDate?: string;
  endDate?: string;
  timePart?: TimePart;
  minScore?: number;
  maxScore?: number;
}

export interface ReflectionSortOptions {
  field: 'date' | 'total_score' | 'created_at';
  direction: 'asc' | 'desc';
}

// API 응답 타입
export interface ReflectionResponse {
  data: Reflection | null;
  error?: string;
}

export interface ReflectionsResponse {
  data: Reflection[];
  error?: string;
  count?: number;
}

export interface SubjectsResponse {
  data: Subject[];
  error?: string;
}