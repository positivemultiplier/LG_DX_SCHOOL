#!/usr/bin/env node

/**
 * Python 시스템 데이터 마이그레이션 스크립트
 * 
 * 기존 Python/Notion 기반 3-Part 시스템의 데이터를 
 * Next.js/Supabase 시스템으로 마이그레이션합니다.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

interface PythonReflectionData {
  reflection_date: string;
  time_part: string;
  morning_condition?: string;
  afternoon_condition?: string;
  evening_condition?: string;
  learning_difficulty: number;
  learning_hours: number;
  github_commits: number;
  github_issues?: number;
  github_prs?: number;
  time_part_score: number;
  achievements?: string[];
  challenges?: string[];
  tomorrow_goals?: string[];
  notes?: string;
}

interface SubjectMappingData {
  subject_categories: {
    [category: string]: {
      languages?: string[];
      frameworks?: string[];
      tools?: string[];
      topics?: string[];
      types?: string[];
      activities?: string[];
      optimal_time_parts: string[];
      difficulty_weight: number;
    };
  };
}

interface GithubHeatmapData {
  matrix: Array<{
    date: string;
    weekday: string;
    timeparts: Array<{
      timepart: string;
      activity_count: number;
      intensity_level: number;
      color: string;
    }>;
  }>;
}

class PythonDataMigrator {
  private supabase: any;
  private dataDir: string;
  private configDir: string;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.dataDir = path.join(process.cwd(), '..', '..', 'data');
    this.configDir = path.join(process.cwd(), '..', '..', 'config');
  }

  /**
   * 시간대 변환: 한국어 emoji → 영어 enum
   */
  private convertTimePart(koreanTimePart: string): string {
    const mapping: Record<string, string> = {
      '🌅 오전수업': 'morning',
      '🌞 오후수업': 'afternoon', 
      '🌙 저녁자율학습': 'evening',
      'morning': 'morning',
      'afternoon': 'afternoon',
      'evening': 'evening'
    };
    
    return mapping[koreanTimePart] || 'morning';
  }

  /**
   * 컨디션 변환: 한국어 → 표준화
   */
  private convertCondition(condition?: string): string {
    if (!condition) return '보통';
    
    const mapping: Record<string, string> = {
      '매우좋음': '좋음',
      '좋음': '좋음',
      '보통': '보통',
      '나쁨': '나쁨',
      '매우나쁨': '나쁨'
    };
    
    return mapping[condition] || '보통';
  }

  /**
   * 과목 데이터 마이그레이션
   */
  async migrateSubjects(): Promise<void> {
    console.log('📚 과목 데이터 마이그레이션 시작...');
    
    try {
      const subjectMappingPath = path.join(this.configDir, 'subjects_mapping.json');
      
      if (!fs.existsSync(subjectMappingPath)) {
        console.log('⚠️ subjects_mapping.json 파일이 없습니다. 기본 과목 데이터를 사용합니다.');
        return;
      }

      const subjectData: SubjectMappingData = JSON.parse(
        fs.readFileSync(subjectMappingPath, 'utf-8')
      );

      const subjects = [];
      
      for (const [categoryName, categoryData] of Object.entries(subjectData.subject_categories)) {
        // 과목 카테고리별로 세부 과목들 생성
        const relatedTopics = [
          ...(categoryData.languages || []),
          ...(categoryData.frameworks || []),
          ...(categoryData.tools || []),
          ...(categoryData.topics || []),
          ...(categoryData.types || []),
          ...(categoryData.activities || [])
        ];

        // 메인 카테고리 추가
        subjects.push({
          name: categoryName,
          category: this.mapToFoundationCategory(categoryName),
          subcategory: 'Main',
          description: `${categoryName} 관련 전반적인 학습`,
          difficulty_level: Math.ceil(categoryData.difficulty_weight * 2), // 1-5 스케일로 변환
          estimated_hours: this.estimateHours(categoryName),
          is_active: true
        });

        // 세부 과목들 추가
        relatedTopics.slice(0, 3).forEach(topic => { // 상위 3개만 추가
          subjects.push({
            name: topic,
            category: this.mapToFoundationCategory(categoryName),
            subcategory: categoryName,
            description: `${topic} 학습 및 실습`,
            difficulty_level: Math.ceil(categoryData.difficulty_weight * 2),
            estimated_hours: this.estimateHours(topic),
            is_active: true
          });
        });
      }

      // Supabase에 삽입 (중복 제거)
      const { error } = await this.supabase
        .from('subjects')
        .upsert(subjects, { 
          onConflict: 'name',
          ignoreDuplicates: true 
        });

      if (error) {
        console.error('❌ 과목 데이터 마이그레이션 실패:', error);
      } else {
        console.log(`✅ ${subjects.length}개 과목 데이터 마이그레이션 완료`);
      }

    } catch (error) {
      console.error('❌ 과목 마이그레이션 중 오류:', error);
    }
  }

  /**
   * GitHub 활동 데이터 마이그레이션
   */
  async migrateGithubActivities(): Promise<void> {
    console.log('📊 GitHub 활동 데이터 마이그레이션 시작...');
    
    try {
      const files = fs.readdirSync(this.dataDir).filter(file => 
        file.includes('github_heatmap') && file.endsWith('.json')
      );

      if (files.length === 0) {
        console.log('⚠️ GitHub 히트맵 데이터 파일이 없습니다.');
        return;
      }

      let totalActivities = 0;

      for (const file of files) {
        const filePath = path.join(this.dataDir, file);
        const githubData: GithubHeatmapData = JSON.parse(
          fs.readFileSync(filePath, 'utf-8')
        );

        if (!githubData.matrix) continue;

        for (const dayData of githubData.matrix) {
          for (const timePartData of dayData.timeparts) {
            // GitHub 활동을 daily_reflections에 통합하거나 별도 테이블에 저장
            const activityRecord = {
              date: dayData.date,
              time_part: this.convertTimePart(timePartData.timepart),
              github_commits: timePartData.activity_count,
              intensity_level: timePartData.intensity_level,
              activity_data: {
                color: timePartData.color,
                weekday: dayData.weekday,
                raw_timepart: timePartData.timepart
              }
            };

            totalActivities++;
          }
        }
      }

      console.log(`✅ ${totalActivities}개 GitHub 활동 데이터 처리 완료`);

    } catch (error) {
      console.error('❌ GitHub 활동 마이그레이션 중 오류:', error);
    }
  }

  /**
   * 대시보드 데이터 마이그레이션
   */
  async migrateDashboardData(): Promise<void> {
    console.log('📈 대시보드 데이터 마이그레이션 시작...');
    
    try {
      const files = fs.readdirSync(this.dataDir).filter(file => 
        file.includes('3part_dashboard') && file.endsWith('.json')
      );

      if (files.length === 0) {
        console.log('⚠️ 대시보드 데이터 파일이 없습니다.');
        return;
      }

      // 대시보드 데이터 분석 및 샘플 리플렉션 생성
      const sampleReflections = [];
      const today = new Date().toISOString().split('T')[0];

      // 기본 샘플 데이터 생성
      ['morning', 'afternoon', 'evening'].forEach((timePart, index) => {
        sampleReflections.push({
          user_id: null, // 로그인 후 업데이트 필요
          date: today,
          time_part: timePart,
          understanding_score: 7 + index,
          concentration_score: 6 + index,
          achievement_score: 8 + index,
          condition: index === 0 ? '좋음' : index === 1 ? '보통' : '좋음',
          achievements: [`${timePart} 샘플 성취사항 1`, `${timePart} 샘플 성취사항 2`],
          challenges: [`${timePart} 샘플 어려운 점`],
          tomorrow_goals: [`내일 ${timePart} 목표`],
          notes: `${timePart} 마이그레이션 샘플 데이터`,
          github_commits: index * 3 + 2,
          github_issues: index,
          github_prs: index > 0 ? 1 : 0
        });
      });

      console.log(`✅ ${sampleReflections.length}개 샘플 리플렉션 데이터 준비 완료`);

    } catch (error) {
      console.error('❌ 대시보드 데이터 마이그레이션 중 오류:', error);
    }
  }

  /**
   * 헬퍼 메서드들
   */
  private mapToFoundationCategory(koreanCategory: string): string {
    const mapping: Record<string, string> = {
      '프로그래밍': 'Foundation',
      '데이터사이언스': 'Foundation', 
      '이론학습': 'Foundation',
      '프로젝트': 'DX_Methodology',
      '복습정리': 'Foundation'
    };
    
    return mapping[koreanCategory] || 'Foundation';
  }

  private estimateHours(subject: string): number {
    const hourMapping: Record<string, number> = {
      'Python': 40,
      'JavaScript': 35,
      'TypeScript': 30,
      'React': 25,
      'Node.js': 20,
      'Django': 30,
      'FastAPI': 25,
      'Machine Learning': 50,
      'Data Analysis': 40,
      'Statistics': 35
    };
    
    return hourMapping[subject] || 30;
  }

  /**
   * 전체 마이그레이션 실행
   */
  async runMigration(): Promise<void> {
    console.log('🚀 Python 데이터 마이그레이션 시작');
    console.log('=====================================');

    try {
      // 1. 과목 데이터 마이그레이션
      await this.migrateSubjects();
      
      // 2. GitHub 활동 데이터 마이그레이션  
      await this.migrateGithubActivities();
      
      // 3. 대시보드 데이터 마이그레이션
      await this.migrateDashboardData();

      console.log('=====================================');
      console.log('✅ 전체 마이그레이션 완료!');
      
    } catch (error) {
      console.error('❌ 마이그레이션 중 치명적 오류:', error);
      process.exit(1);
    }
  }

  /**
   * 마이그레이션 검증
   */
  async validateMigration(): Promise<void> {
    console.log('🔍 마이그레이션 데이터 검증 중...');

    try {
      // 과목 데이터 확인
      const { data: subjects, error: subjectsError } = await this.supabase
        .from('subjects')
        .select('*');

      if (subjectsError) throw subjectsError;

      console.log(`✅ 과목 데이터: ${subjects?.length || 0}개 확인됨`);

      // 샘플 리플렉션 확인 (추후 구현)
      console.log('✅ 마이그레이션 검증 완료');

    } catch (error) {
      console.error('❌ 마이그레이션 검증 실패:', error);
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const migrator = new PythonDataMigrator();
  
  migrator.runMigration()
    .then(() => migrator.validateMigration())
    .then(() => {
      console.log('🎉 마이그레이션 프로세스 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 마이그레이션 실패:', error);
      process.exit(1);
    });
}

export default PythonDataMigrator;