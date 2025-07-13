import { z } from 'zod';

// 기본 검증 스키마
export const reflectionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  time_part: z.enum(['morning', 'afternoon', 'evening'], {
    errorMap: () => ({ message: 'Time part must be morning, afternoon, or evening' })
  }),
  understanding_score: z.number()
    .int('Score must be an integer')
    .min(1, 'Score must be at least 1')
    .max(10, 'Score must be at most 10'),
  concentration_score: z.number()
    .int('Score must be an integer')
    .min(1, 'Score must be at least 1')
    .max(10, 'Score must be at most 10'),
  achievement_score: z.number()
    .int('Score must be an integer')
    .min(1, 'Score must be at least 1')
    .max(10, 'Score must be at most 10'),
  condition: z.enum(['좋음', '보통', '나쁨'], {
    errorMap: () => ({ message: 'Condition must be 좋음, 보통, or 나쁨' })
  }),
  subjects: z.record(z.any()).optional().default({}),
  achievements: z.array(z.string().trim().min(1, 'Achievement cannot be empty')).optional().default([]),
  challenges: z.array(z.string().trim().min(1, 'Challenge cannot be empty')).optional().default([]),
  tomorrow_goals: z.array(z.string().trim().min(1, 'Goal cannot be empty')).optional().default([]),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().default(''),
  github_commits: z.number().int().min(0).optional().default(0),
  github_issues: z.number().int().min(0).optional().default(0),
  github_prs: z.number().int().min(0).optional().default(0),
  github_reviews: z.number().int().min(0).optional().default(0),
});

// 업데이트용 스키마 (모든 필드 선택적)
export const updateReflectionSchema = reflectionSchema.partial().extend({
  id: z.string().uuid('Invalid UUID format')
});

// 클라이언트 폼 검증 스키마
export const reflectionFormSchema = z.object({
  understanding_score: z.number()
    .min(1, '이해도 점수는 1점 이상이어야 합니다')
    .max(10, '이해도 점수는 10점 이하여야 합니다'),
  concentration_score: z.number()
    .min(1, '집중도 점수는 1점 이상이어야 합니다')
    .max(10, '집중도 점수는 10점 이하여야 합니다'),
  achievement_score: z.number()
    .min(1, '성취도 점수는 1점 이상이어야 합니다')
    .max(10, '성취도 점수는 10점 이하여야 합니다'),
  condition: z.enum(['좋음', '보통', '나쁨'], {
    errorMap: () => ({ message: '컨디션을 선택해주세요' })
  }),
  subjects: z.record(z.any()).optional().default({}),
  achievements: z.array(z.string().trim()).optional().default([]),
  challenges: z.array(z.string().trim()).optional().default([]),
  tomorrow_goals: z.array(z.string().trim()).optional().default([]),
  notes: z.string().max(1000, '메모는 1000자 이하로 작성해주세요').optional().default(''),
});

// 날짜 범위 검증 스키마
export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'Start date must be before or equal to end date',
});

// 리플렉션 필터 스키마
export const reflectionFiltersSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  timePart: z.enum(['morning', 'afternoon', 'evening']).optional(),
  minScore: z.number().int().min(3).max(30).optional(), // 총점 기준
  maxScore: z.number().int().min(3).max(30).optional(),
}).refine((data) => {
  if (data.minScore && data.maxScore) {
    return data.minScore <= data.maxScore;
  }
  return true;
}, {
  message: 'Minimum score must be less than or equal to maximum score',
});

// 타입 추론
export type ReflectionInput = z.infer<typeof reflectionSchema>;
export type UpdateReflectionInput = z.infer<typeof updateReflectionSchema>;
export type ReflectionFormInput = z.infer<typeof reflectionFormSchema>;
export type ReflectionFiltersInput = z.infer<typeof reflectionFiltersSchema>;

// 유틸리티 함수
export const validateReflection = (data: unknown) => {
  return reflectionSchema.safeParse(data);
};

export const validateReflectionForm = (data: unknown) => {
  return reflectionFormSchema.safeParse(data);
};

export const validateUpdateReflection = (data: unknown) => {
  return updateReflectionSchema.safeParse(data);
};

export const validateReflectionFilters = (data: unknown) => {
  return reflectionFiltersSchema.safeParse(data);
};