import { useState, useEffect, useCallback } from 'react';
import { reflectionService } from '@/lib/services/reflection';
import { useAuth } from '@/hooks/use-auth';
import type {
  Reflection,
  CreateReflectionData,
  DailyReflectionSummary,
  TimePart,
  Subject
} from '@/types/reflection';

/**
 * 리플렉션 생성/수정을 위한 훅
 */
export function useCreateReflection() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReflection = useCallback(async (data: CreateReflectionData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await reflectionService.createReflection(data);
      
      if (result.error) {
        setError(result.error);
        return { success: false, data: null, error: result.error };
      }

      return { success: true, data: result.data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reflection';
      setError(errorMessage);
      return { success: false, data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateReflection = useCallback(async (id: string, data: Partial<CreateReflectionData>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await reflectionService.updateReflection(id, data);
      
      if (result.error) {
        setError(result.error);
        return { success: false, data: null, error: result.error };
      }

      return { success: true, data: result.data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update reflection';
      setError(errorMessage);
      return { success: false, data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createReflection,
    updateReflection,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}

/**
 * 특정 날짜와 시간대의 리플렉션을 조회하는 훅
 */
export function useReflectionByDateAndTimePart(date: string, timePart: TimePart) {
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReflection = useCallback(async () => {
    if (!date || !timePart) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await reflectionService.getReflectionByDateAndTimePart(date, timePart);
      
      if (result.error) {
        setError(result.error);
      } else {
        setReflection(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reflection');
    } finally {
      setIsLoading(false);
    }
  }, [date, timePart]);

  useEffect(() => {
    fetchReflection();
  }, [fetchReflection]);

  return {
    reflection,
    isLoading,
    error,
    refetch: fetchReflection
  };
}

/**
 * 특정 날짜의 모든 리플렉션을 조회하는 훅
 */
export function useReflectionsByDate(date: string) {
  const [dailySummary, setDailySummary] = useState<DailyReflectionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyReflections = useCallback(async () => {
    if (!date) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await reflectionService.getReflectionsByDate(date);
      
      if (result.error) {
        setError(result.error);
      } else {
        setDailySummary(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch daily reflections');
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchDailyReflections();
  }, [fetchDailyReflections]);

  return {
    dailySummary,
    morning: dailySummary?.morning || null,
    afternoon: dailySummary?.afternoon || null,
    evening: dailySummary?.evening || null,
    completedCount: dailySummary?.completed_count || 0,
    totalScore: dailySummary?.total_score || 0,
    averageScore: dailySummary?.average_score || 0,
    isLoading,
    error,
    refetch: fetchDailyReflections
  };
}

/**
 * 최근 리플렉션을 조회하는 훅
 */
export function useRecentReflections(limit: number = 10) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentReflections = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await reflectionService.getRecentReflections(limit);
      
      if (result.error) {
        setError(result.error);
      } else {
        setReflections(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent reflections');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecentReflections();
  }, [fetchRecentReflections]);

  return {
    reflections,
    isLoading,
    error,
    refetch: fetchRecentReflections
  };
}

/**
 * 과목 목록을 조회하는 훅
 */
export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const result = await reflectionService.getSubjects();
        
        if (result.error) {
          setError(result.error);
        } else {
          setSubjects(result.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  return {
    subjects,
    isLoading,
    error
  };
}

/**
 * 실시간 리플렉션 업데이트를 구독하는 훅
 */
export function useRealtimeReflections() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = reflectionService.subscribeToReflections((payload) => {
      console.log('Realtime reflection update:', payload);
      setLastUpdate(new Date());
    });

    return unsubscribe;
  }, []);

  return {
    lastUpdate
  };
}

/**
 * 오늘의 리플렉션 상태를 조회하는 훅
 */
export function useTodayReflections() {
  const today = new Date().toISOString().split('T')[0];
  const { dailySummary, isLoading, error, refetch } = useReflectionsByDate(today);

  const timeSlots = [
    { key: 'morning' as TimePart, label: '오전 수업', icon: '🌅' },
    { key: 'afternoon' as TimePart, label: '오후 수업', icon: '☀️' },
    { key: 'evening' as TimePart, label: '저녁 자율학습', icon: '🌙' }
  ];

  const completionStatus = timeSlots.map(slot => ({
    ...slot,
    completed: !!dailySummary?.[slot.key],
    reflection: dailySummary?.[slot.key] || null
  }));

  const overallProgress = {
    completed: dailySummary?.completed_count || 0,
    total: 3,
    percentage: Math.round(((dailySummary?.completed_count || 0) / 3) * 100),
    averageScore: dailySummary?.average_score || 0
  };

  return {
    dailySummary,
    completionStatus,
    overallProgress,
    timeSlots,
    isLoading,
    error,
    refetch
  };
}

/**
 * 리플렉션 삭제를 위한 훅
 */
export function useDeleteReflection() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteReflection = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await reflectionService.deleteReflection(id);
      
      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete reflection';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    deleteReflection,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}