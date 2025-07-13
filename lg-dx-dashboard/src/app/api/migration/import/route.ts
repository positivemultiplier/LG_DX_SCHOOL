import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import * as fs from 'fs';
import * as path from 'path';

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

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { import_type = 'all' } = await request.json();

    const results = {
      subjects: { success: false, count: 0, error: null },
      reflections: { success: false, count: 0, error: null },
      github_activities: { success: false, count: 0, error: null }
    };

    // 과목 데이터 마이그레이션
    if (import_type === 'all' || import_type === 'subjects') {
      try {
        const subjectsResult = await importSubjects(supabase);
        results.subjects = subjectsResult;
      } catch (error) {
        results.subjects.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // 샘플 리플렉션 데이터 생성
    if (import_type === 'all' || import_type === 'reflections') {
      try {
        const reflectionsResult = await createSampleReflections(supabase, user.id);
        results.reflections = reflectionsResult;
      } catch (error) {
        results.reflections.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // GitHub 활동 데이터 마이그레이션
    if (import_type === 'all' || import_type === 'github') {
      try {
        const githubResult = await importGithubActivities(supabase);
        results.github_activities = githubResult;
      } catch (error) {
        results.github_activities.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    const overallSuccess = Object.values(results).some(r => r.success);

    return NextResponse.json({
      success: overallSuccess,
      results,
      message: overallSuccess ? 'Migration completed' : 'Migration failed',
      user_id: user.id
    });

  } catch (error) {
    console.error('마이그레이션 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

async function importSubjects(supabase: any) {
  const configDir = path.join(process.cwd(), '..', '..', 'config');
  const subjectMappingPath = path.join(configDir, 'subjects_mapping.json');
  
  let subjects = [];

  // subjects_mapping.json 파일이 있으면 사용, 없으면 기본 데이터 사용
  if (fs.existsSync(subjectMappingPath)) {
    try {
      const subjectData: SubjectMappingData = JSON.parse(
        fs.readFileSync(subjectMappingPath, 'utf-8')
      );

      for (const [categoryName, categoryData] of Object.entries(subjectData.subject_categories)) {
        // 메인 카테고리
        subjects.push({
          name: categoryName,
          category: mapToFoundationCategory(categoryName),
          subcategory: 'Main',
          description: `${categoryName} 관련 전반적인 학습`,
          color_code: getCategoryColor(categoryName),
          icon: getCategoryIcon(categoryName),
          difficulty_level: Math.min(5, Math.ceil(categoryData.difficulty_weight * 2)),
          estimated_hours: estimateHours(categoryName),
          is_active: true
        });

        // 세부 과목들 (상위 3개)
        const relatedTopics = [
          ...(categoryData.languages || []),
          ...(categoryData.frameworks || []),
          ...(categoryData.tools || []),
          ...(categoryData.topics || []),
          ...(categoryData.types || []),
          ...(categoryData.activities || [])
        ];

        relatedTopics.slice(0, 3).forEach(topic => {
          subjects.push({
            name: topic,
            category: mapToFoundationCategory(categoryName),
            subcategory: categoryName,
            description: `${topic} 학습 및 실습`,
            color_code: getCategoryColor(categoryName),
            icon: getTopicIcon(topic),
            difficulty_level: Math.min(5, Math.ceil(categoryData.difficulty_weight * 2)),
            estimated_hours: estimateHours(topic),
            is_active: true
          });
        });
      }
    } catch (error) {
      console.log('subjects_mapping.json 파싱 오류, 기본 데이터 사용');
    }
  }

  // 기본 과목 데이터 (파일이 없거나 파싱 실패시)
  if (subjects.length === 0) {
    subjects = [
      {
        name: 'Python 기초',
        category: 'Foundation',
        subcategory: 'Programming',
        description: 'Python 프로그래밍 기초 문법과 개념',
        color_code: '#3776AB',
        icon: '🐍',
        difficulty_level: 2,
        estimated_hours: 40,
        is_active: true
      },
      {
        name: 'JavaScript 기초',
        category: 'Foundation', 
        subcategory: 'Web Development',
        description: 'JavaScript 프로그래밍 기초',
        color_code: '#F7DF1E',
        icon: '🟨',
        difficulty_level: 2,
        estimated_hours: 35,
        is_active: true
      },
      {
        name: 'React 개발',
        category: 'Foundation',
        subcategory: 'Frontend',
        description: 'React를 활용한 프론트엔드 개발',
        color_code: '#61DAFB',
        icon: '⚛️',
        difficulty_level: 3,
        estimated_hours: 50,
        is_active: true
      },
      {
        name: 'Next.js 개발',
        category: 'DX_Methodology',
        subcategory: 'Full-Stack',
        description: 'Next.js 풀스택 개발',
        color_code: '#000000',
        icon: '▲',
        difficulty_level: 4,
        estimated_hours: 45,
        is_active: true
      },
      {
        name: '데이터 분석',
        category: '빅데이터분석기사',
        subcategory: 'Analytics',
        description: 'Pandas, NumPy를 활용한 데이터 분석',
        color_code: '#FF6B6B',
        icon: '📊',
        difficulty_level: 3,
        estimated_hours: 40,
        is_active: true
      }
    ];
  }

  // Supabase에 삽입
  const { data, error } = await supabase
    .from('subjects')
    .upsert(subjects, { 
      onConflict: 'name',
      ignoreDuplicates: false 
    })
    .select();

  if (error) {
    throw new Error(`과목 데이터 삽입 실패: ${error.message}`);
  }

  return {
    success: true,
    count: data?.length || subjects.length,
    error: null
  };
}

async function createSampleReflections(supabase: any, userId: string) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const sampleReflections = [
    // 어제 데이터 (완성된 예시)
    {
      user_id: userId,
      date: yesterday.toISOString().split('T')[0],
      time_part: 'morning',
      understanding_score: 8,
      concentration_score: 7,
      achievement_score: 8,
      condition: '좋음',
      achievements: ['Python 기초 문법 복습 완료', '변수와 데이터 타입 정리'],
      challenges: ['함수 개념이 조금 어려웠음'],
      tomorrow_goals: ['함수 실습 예제 풀어보기', '리스트 컴프리헨션 학습'],
      notes: '전반적으로 좋은 컨디션으로 학습 진행',
      github_commits: 3,
      github_issues: 1,
      github_prs: 0
    },
    {
      user_id: userId,
      date: yesterday.toISOString().split('T')[0],
      time_part: 'afternoon',
      understanding_score: 9,
      concentration_score: 8,
      achievement_score: 9,
      condition: '좋음',
      achievements: ['React 컴포넌트 실습 완료', 'useState 훅 사용법 학습'],
      challenges: ['useEffect 사용 시기 판단이 어려움'],
      tomorrow_goals: ['useEffect 심화 학습', '커스텀 훅 만들어보기'],
      notes: '실습 위주로 진행하여 이해도가 높았음',
      github_commits: 5,
      github_issues: 0,
      github_prs: 1
    },
    {
      user_id: userId,
      date: yesterday.toISOString().split('T')[0],
      time_part: 'evening',
      understanding_score: 7,
      concentration_score: 6,
      achievement_score: 7,
      condition: '보통',
      achievements: ['개인 프로젝트 진행', '데이터베이스 스키마 설계'],
      challenges: ['시간이 부족해서 완료하지 못함'],
      tomorrow_goals: ['프로젝트 나머지 부분 완료', '테스트 코드 작성'],
      notes: '저녁이라 집중도가 떨어졌지만 꾸준히 진행',
      github_commits: 2,
      github_issues: 0,
      github_prs: 0
    },
    // 오늘 데이터 (일부만 완성된 상태)
    {
      user_id: userId,
      date: today.toISOString().split('T')[0],
      time_part: 'morning',
      understanding_score: 8,
      concentration_score: 8,
      achievement_score: 7,
      condition: '좋음',
      achievements: ['Next.js 라우팅 시스템 학습'],
      challenges: ['App Router와 Pages Router 차이점 혼란'],
      tomorrow_goals: ['API Routes 실습'],
      notes: '새로운 개념이라 흥미로웠음',
      github_commits: 4,
      github_issues: 0,
      github_prs: 0
    }
  ];

  const { data, error } = await supabase
    .from('daily_reflections')
    .upsert(sampleReflections, {
      onConflict: 'user_id,date,time_part',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    throw new Error(`리플렉션 데이터 생성 실패: ${error.message}`);
  }

  return {
    success: true,
    count: data?.length || sampleReflections.length,
    error: null
  };
}

async function importGithubActivities(supabase: any) {
  // GitHub 활동 데이터는 일단 기본 응답 반환
  // 실제 파일이 있으면 파싱하여 처리 가능
  
  return {
    success: true,
    count: 0,
    error: null
  };
}

// 헬퍼 함수들
function mapToFoundationCategory(koreanCategory: string): string {
  const mapping: Record<string, string> = {
    '프로그래밍': 'Foundation',
    '데이터사이언스': 'Foundation', 
    '이론학습': 'Foundation',
    '프로젝트': 'DX_Methodology',
    '복습정리': 'Foundation'
  };
  
  return mapping[koreanCategory] || 'Foundation';
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    '프로그래밍': '#3776AB',
    '데이터사이언스': '#FF6B6B',
    '이론학습': '#4ECDC4',
    '프로젝트': '#45B7D1',
    '복습정리': '#96CEB4'
  };
  
  return colors[category] || '#3B82F6';
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    '프로그래밍': '💻',
    '데이터사이언스': '📊',
    '이론학습': '📚',
    '프로젝트': '🚀',
    '복습정리': '📝'
  };
  
  return icons[category] || '📚';
}

function getTopicIcon(topic: string): string {
  const icons: Record<string, string> = {
    'Python': '🐍',
    'JavaScript': '🟨',
    'TypeScript': '🔷',
    'React': '⚛️',
    'Node.js': '🟢',
    'Django': '🎯',
    'FastAPI': '⚡',
    'Pandas': '🐼',
    'NumPy': '🔢',
    'Git': '📂'
  };
  
  return icons[topic] || '📄';
}

function estimateHours(subject: string): number {
  const hourMapping: Record<string, number> = {
    'Python': 40, 'JavaScript': 35, 'TypeScript': 30,
    'React': 25, 'Node.js': 20, 'Django': 30,
    'FastAPI': 25, 'Machine Learning': 50,
    'Data Analysis': 40, 'Statistics': 35,
    '프로그래밍': 50, '데이터사이언스': 45,
    '이론학습': 30, '프로젝트': 60, '복습정리': 20
  };
  
  return hourMapping[subject] || 30;
}