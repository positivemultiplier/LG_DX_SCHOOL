import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase configuration missing'
      });
    }

    // 서비스 롤로 Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 기본 과목 데이터
    const subjects = [
      {
        name: 'Python 기초',
        category: 'Foundation',
        subcategory: 'Programming',
        description: 'Python 프로그래밍 기초 문법과 개념',
        color_code: '#3776AB',
        icon: '🐍',
        difficulty_level: 2,
        estimated_hours: 40
      },
      {
        name: '데이터 구조와 알고리즘',
        category: 'Foundation',
        subcategory: 'Computer Science',
        description: '기본적인 자료구조와 알고리즘 학습',
        color_code: '#FF6B6B',
        icon: '🔧',
        difficulty_level: 3,
        estimated_hours: 60
      },
      {
        name: '웹 개발 기초',
        category: 'Foundation',
        subcategory: 'Web Development',
        description: 'HTML, CSS, JavaScript 기초',
        color_code: '#F7931E',
        icon: '🌐',
        difficulty_level: 2,
        estimated_hours: 50
      },
      {
        name: 'DX 방법론',
        category: 'DX_Methodology',
        subcategory: 'Business',
        description: '디지털 전환 방법론과 전략',
        color_code: '#4ECDC4',
        icon: '🚀',
        difficulty_level: 4,
        estimated_hours: 30
      },
      {
        name: '빅데이터 분석 이론',
        category: '빅데이터분석기사',
        subcategory: 'Theory',
        description: '빅데이터 분석 기본 이론',
        color_code: '#45B7D1',
        icon: '📊',
        difficulty_level: 3,
        estimated_hours: 45
      },
      {
        name: 'SQL 데이터베이스',
        category: '빅데이터분석기사',
        subcategory: 'Database',
        description: 'SQL과 데이터베이스 활용',
        color_code: '#96CEB4',
        icon: '🗄️',
        difficulty_level: 3,
        estimated_hours: 35
      }
    ];
    
    // 과목 데이터 삽입
    const { data, error } = await supabase
      .from('subjects')
      .upsert(subjects, { 
        onConflict: 'name',
        ignoreDuplicates: false
      })
      .select();
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to insert subjects',
        details: error.message,
        code: error.code,
        hint: error.hint
      });
    }
    
    // 현재 과목 목록 조회
    const { data: allSubjects, error: fetchError } = await supabase
      .from('subjects')
      .select('name, category, icon')
      .order('category, name');
    
    return NextResponse.json({ 
      success: true,
      message: `${data?.length || 0} subjects processed`,
      subjects: allSubjects || [],
      inserted: data?.length || 0
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Seed data insertion failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}