import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type Subject = Database['public']['Tables']['subjects']['Row'];
type SubjectInsert = Database['public']['Tables']['subjects']['Insert'];

export class SubjectService {
  private supabase = createClient();

  async getAllSubjects() {
    const { data, error } = await this.supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getSubjectsByCategory(category: string) {
    const { data, error } = await this.supabase
      .from('subjects')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getSubjectById(id: string) {
    const { data, error } = await this.supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createSubject(data: SubjectInsert) {
    const { data: subject, error } = await this.supabase
      .from('subjects')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return subject;
  }

  // 카테고리별 분류된 과목 목록
  async getSubjectsGroupedByCategory() {
    const subjects = await this.getAllSubjects();
    
    const grouped = subjects.reduce((acc, subject) => {
      if (!acc[subject.category]) {
        acc[subject.category] = [];
      }
      acc[subject.category].push(subject);
      return acc;
    }, {} as Record<string, Subject[]>);

    return grouped;
  }
}

export const subjectService = new SubjectService();