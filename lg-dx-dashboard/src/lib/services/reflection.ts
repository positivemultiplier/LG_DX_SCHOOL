import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import type { 
  Reflection, 
  CreateReflectionData, 
  DailyReflectionSummary,
  ReflectionFilters,
  ReflectionSortOptions,
  Subject,
  DailyStatistics,
  TimePart
} from '@/types/reflection';

type DBReflection = Database['public']['Tables']['daily_reflections']['Row'];
type DBReflectionInsert = Database['public']['Tables']['daily_reflections']['Insert'];
type DBReflectionUpdate = Database['public']['Tables']['daily_reflections']['Update'];

export class ReflectionService {
  private supabase = createClient();

  /**
   * 새로운 리플렉션 생성
   */
  async createReflection(data: CreateReflectionData): Promise<{ data: Reflection | null; error: string | null }> {
    try {
      const { data: reflection, error } = await this.supabase
        .from('daily_reflections')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Error creating reflection:', error);
        return { data: null, error: error.message };
      }

      return { data: reflection as Reflection, error: null };
    } catch (error) {
      console.error('Unexpected error creating reflection:', error);
      return { data: null, error: 'Failed to create reflection' };
    }
  }

  /**
   * 리플렉션 수정
   */
  async updateReflection(id: string, data: Partial<CreateReflectionData>): Promise<{ data: Reflection | null; error: string | null }> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: reflection, error } = await this.supabase
        .from('daily_reflections')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reflection:', error);
        return { data: null, error: error.message };
      }

      return { data: reflection as Reflection, error: null };
    } catch (error) {
      console.error('Unexpected error updating reflection:', error);
      return { data: null, error: 'Failed to update reflection' };
    }
  }

  /**
   * 리플렉션 삭제
   */
  async deleteReflection(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await this.supabase
        .from('daily_reflections')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting reflection:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error deleting reflection:', error);
      return { success: false, error: 'Failed to delete reflection' };
    }
  }

  /**
   * 특정 날짜와 시간대의 리플렉션 조회
   */
  async getReflectionByDateAndTimePart(
    date: string,
    timePart: TimePart
  ): Promise<{ data: Reflection | null; error: string | null }> {
    try {
      const { data: reflection, error } = await this.supabase
        .from('daily_reflections')
        .select('*')
        .eq('date', date)
        .eq('time_part', timePart)
        .maybeSingle();

      if (error) {
        console.error('Error fetching reflection by date and time part:', error);
        return { data: null, error: error.message };
      }

      return { data: reflection as Reflection | null, error: null };
    } catch (error) {
      console.error('Unexpected error fetching reflection by date and time part:', error);
      return { data: null, error: 'Failed to fetch reflection' };
    }
  }

  /**
   * 특정 날짜의 모든 리플렉션 조회
   */
  async getReflectionsByDate(date: string): Promise<{ data: DailyReflectionSummary | null; error: string | null }> {
    try {
      const { data: reflections, error } = await this.supabase
        .from('daily_reflections')
        .select('*')
        .eq('date', date)
        .order('time_part');

      if (error) {
        console.error('Error fetching reflections by date:', error);
        return { data: null, error: error.message };
      }

      const reflectionList = reflections as Reflection[] || [];

      // 시간대별로 그룹화
      const summary: DailyReflectionSummary = {
        date,
        completed_count: reflectionList.length,
        total_score: reflectionList.reduce((sum, r) => sum + r.total_score, 0),
        average_score: reflectionList.length > 0 
          ? reflectionList.reduce((sum, r) => sum + r.total_score, 0) / reflectionList.length 
          : 0,
      };

      reflectionList.forEach((reflection) => {
        const timePartKey = reflection.time_part as keyof DailyReflectionSummary;
        if (timePartKey === 'morning' || timePartKey === 'afternoon' || timePartKey === 'evening') {
          (summary as any)[timePartKey] = reflection;
        }
      });

      return { data: summary, error: null };
    } catch (error) {
      console.error('Unexpected error fetching reflections by date:', error);
      return { data: null, error: 'Failed to fetch reflections' };
    }
  }

  /**
   * 기간별 리플렉션 조회
   */
  async getReflectionsByPeriod(
    startDate: string,
    endDate: string,
    filters?: ReflectionFilters,
    sort?: ReflectionSortOptions
  ): Promise<{ data: Reflection[]; error: string | null; count: number }> {
    try {
      let query = this.supabase
        .from('daily_reflections')
        .select('*', { count: 'exact' })
        .gte('date', startDate)
        .lte('date', endDate);

      // 필터 적용
      if (filters?.timePart) {
        query = query.eq('time_part', filters.timePart);
      }
      if (filters?.minScore) {
        query = query.gte('total_score', filters.minScore);
      }
      if (filters?.maxScore) {
        query = query.lte('total_score', filters.maxScore);
      }

      // 정렬 적용
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('date', { ascending: false }).order('time_part');
      }

      const { data: reflections, error, count } = await query;

      if (error) {
        console.error('Error fetching reflections by period:', error);
        return { data: [], error: error.message, count: 0 };
      }

      return { data: (reflections as Reflection[]) || [], error: null, count: count || 0 };
    } catch (error) {
      console.error('Unexpected error fetching reflections by period:', error);
      return { data: [], error: 'Failed to fetch reflections', count: 0 };
    }
  }

  /**
   * 최근 리플렉션 조회
   */
  async getRecentReflections(limit: number = 10): Promise<{ data: Reflection[]; error: string | null }> {
    try {
      const { data: reflections, error } = await this.supabase
        .from('daily_reflections')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent reflections:', error);
        return { data: [], error: error.message };
      }

      return { data: (reflections as Reflection[]) || [], error: null };
    } catch (error) {
      console.error('Unexpected error fetching recent reflections:', error);
      return { data: [], error: 'Failed to fetch recent reflections' };
    }
  }

  /**
   * 특정 리플렉션 조회
   */
  async getReflectionById(id: string): Promise<{ data: Reflection | null; error: string | null }> {
    try {
      const { data: reflection, error } = await this.supabase
        .from('daily_reflections')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching reflection by ID:', error);
        return { data: null, error: error.message };
      }

      return { data: reflection as Reflection, error: null };
    } catch (error) {
      console.error('Unexpected error fetching reflection by ID:', error);
      return { data: null, error: 'Failed to fetch reflection' };
    }
  }

  /**
   * 과목 목록 조회
   */
  async getSubjects(): Promise<{ data: Subject[]; error: string | null }> {
    try {
      const { data: subjects, error } = await this.supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('name');

      if (error) {
        console.error('Error fetching subjects:', error);
        return { data: [], error: error.message };
      }

      return { data: (subjects as Subject[]) || [], error: null };
    } catch (error) {
      console.error('Unexpected error fetching subjects:', error);
      return { data: [], error: 'Failed to fetch subjects' };
    }
  }

  /**
   * 일일 통계 조회
   */
  async getDailyStatistics(date: string): Promise<{ data: DailyStatistics | null; error: string | null }> {
    try {
      const { data: stats, error } = await this.supabase
        .from('daily_statistics')
        .select('*')
        .eq('date', date)
        .maybeSingle();

      if (error) {
        console.error('Error fetching daily statistics:', error);
        return { data: null, error: error.message };
      }

      return { data: stats as DailyStatistics | null, error: null };
    } catch (error) {
      console.error('Unexpected error fetching daily statistics:', error);
      return { data: null, error: 'Failed to fetch daily statistics' };
    }
  }

  /**
   * 실시간 리플렉션 구독
   */
  subscribeToReflections(callback: (payload: any) => void) {
    const channel = this.supabase
      .channel('reflections')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_reflections'
        },
        callback
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  /**
   * 사용자의 리플렉션 완성률 계산
   */
  async getCompletionRate(startDate: string, endDate: string): Promise<{ data: number; error: string | null }> {
    try {
      const { data: reflections, error } = await this.supabase
        .from('daily_reflections')
        .select('date, time_part')
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        console.error('Error calculating completion rate:', error);
        return { data: 0, error: error.message };
      }

      // 날짜 범위 계산
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const totalPossibleReflections = dayCount * 3; // 하루 3번

      const completionRate = (reflections?.length || 0) / totalPossibleReflections * 100;

      return { data: Math.round(completionRate * 100) / 100, error: null };
    } catch (error) {
      console.error('Unexpected error calculating completion rate:', error);
      return { data: 0, error: 'Failed to calculate completion rate' };
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const reflectionService = new ReflectionService();