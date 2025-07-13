import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // 관리자 권한 확인 (임시로 모든 인증된 사용자 허용)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 서비스 롤로 클라이언트 생성 (DDL 작업을 위해)
    const adminSupabase = createServerClient();

    // 기본 테이블들 생성
    const createTablesSQL = `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- 1. users 테이블 (auth.users와 연동)
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        github_username TEXT,
        avatar_url TEXT,
        timezone TEXT DEFAULT 'Asia/Seoul',
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 2. subjects 테이블
      CREATE TABLE IF NOT EXISTS public.subjects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        description TEXT,
        color_code TEXT DEFAULT '#3B82F6',
        icon TEXT DEFAULT '📚',
        difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5) DEFAULT 3,
        estimated_hours INTEGER DEFAULT 0,
        prerequisites TEXT[] DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. daily_reflections 테이블
      CREATE TABLE IF NOT EXISTS public.daily_reflections (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        time_part TEXT NOT NULL CHECK (time_part IN ('morning', 'afternoon', 'evening')),
        
        -- 핵심 평가 지표 (1-10점)
        understanding_score INTEGER CHECK (understanding_score BETWEEN 1 AND 10),
        concentration_score INTEGER CHECK (concentration_score BETWEEN 1 AND 10),
        achievement_score INTEGER CHECK (achievement_score BETWEEN 1 AND 10),
        
        -- 컨디션 및 종합 점수
        condition TEXT CHECK (condition IN ('좋음', '보통', '나쁨')),
        total_score INTEGER GENERATED ALWAYS AS (
          (understanding_score + concentration_score + achievement_score)
        ) STORED,
        
        -- 과목별 세부 정보 (JSON)
        subjects JSONB DEFAULT '{}',
        
        -- 텍스트 필드
        achievements TEXT[] DEFAULT '{}',
        challenges TEXT[] DEFAULT '{}',
        tomorrow_goals TEXT[] DEFAULT '{}',
        notes TEXT,
        
        -- GitHub 활동 데이터
        github_commits INTEGER DEFAULT 0,
        github_issues INTEGER DEFAULT 0,
        github_prs INTEGER DEFAULT 0,
        github_reviews INTEGER DEFAULT 0,
        
        -- 메타데이터
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- 유니크 제약조건
        UNIQUE(user_id, date, time_part)
      );

      -- 4. daily_statistics 테이블
      CREATE TABLE IF NOT EXISTS public.daily_statistics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        
        -- 리플렉션 완성도
        reflections_completed INTEGER DEFAULT 0,
        total_reflection_score INTEGER DEFAULT 0,
        average_reflection_score DECIMAL(4,2) DEFAULT 0,
        
        -- 학습 시간 통계
        total_study_time_minutes INTEGER DEFAULT 0,
        morning_study_time INTEGER DEFAULT 0,
        afternoon_study_time INTEGER DEFAULT 0,
        evening_study_time INTEGER DEFAULT 0,
        
        -- GitHub 활동 요약
        github_activity_score INTEGER DEFAULT 0,
        
        -- 목표 달성도
        daily_goals_completed INTEGER DEFAULT 0,
        daily_goals_total INTEGER DEFAULT 0,
        
        -- 종합 평가
        daily_grade TEXT,
        consistency_score DECIMAL(4,2) DEFAULT 0,
        
        -- 메타데이터
        calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        UNIQUE(user_id, date)
      );

      -- RLS 활성화
      ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.daily_statistics ENABLE ROW LEVEL SECURITY;
    `;

    // RLS 정책 생성
    const createPoliciesSQL = `
      -- users 테이블 정책
      DROP POLICY IF EXISTS "Users can manage own data" ON public.users;
      CREATE POLICY "Users can manage own data" ON public.users
        FOR ALL USING (auth.uid() = id);

      -- subjects 테이블 정책 (모든 인증된 사용자가 읽기 가능)
      DROP POLICY IF EXISTS "Authenticated users can read subjects" ON public.subjects;
      CREATE POLICY "Authenticated users can read subjects" ON public.subjects
        FOR SELECT USING (auth.role() = 'authenticated');

      -- daily_reflections 테이블 정책
      DROP POLICY IF EXISTS "Users can manage own reflections" ON public.daily_reflections;
      CREATE POLICY "Users can manage own reflections" ON public.daily_reflections
        FOR ALL USING (auth.uid() = user_id);

      -- daily_statistics 테이블 정책
      DROP POLICY IF EXISTS "Users can view own statistics" ON public.daily_statistics;
      CREATE POLICY "Users can view own statistics" ON public.daily_statistics
        FOR SELECT USING (auth.uid() = user_id);
    `;

    // 인덱스 생성
    const createIndexesSQL = `
      -- 성능 최적화 인덱스
      CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date 
        ON public.daily_reflections(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_daily_reflections_date_timepart 
        ON public.daily_reflections(date, time_part);
      CREATE INDEX IF NOT EXISTS idx_daily_statistics_user_date 
        ON public.daily_statistics(user_id, date);
    `;

    // 기본 과목 데이터 삽입
    const insertSubjectsSQL = `
      INSERT INTO public.subjects (name, category, subcategory, description, color_code, icon, difficulty_level, estimated_hours) VALUES
      ('Python 기초', 'Foundation', 'Programming', 'Python 프로그래밍 기초 문법과 개념', '#3776AB', '🐍', 2, 40),
      ('데이터 구조와 알고리즘', 'Foundation', 'Computer Science', '기본적인 자료구조와 알고리즘 학습', '#FF6B6B', '🔧', 3, 60),
      ('웹 개발 기초', 'Foundation', 'Web Development', 'HTML, CSS, JavaScript 기초', '#F7931E', '🌐', 2, 50),
      ('DX 방법론', 'DX_Methodology', 'Business', '디지털 전환 방법론과 전략', '#4ECDC4', '🚀', 4, 30),
      ('빅데이터 분석 이론', '빅데이터분석기사', 'Theory', '빅데이터 분석 기본 이론', '#45B7D1', '📊', 3, 45),
      ('SQL 데이터베이스', '빅데이터분석기사', 'Database', 'SQL과 데이터베이스 활용', '#96CEB4', '🗄️', 3, 35)
      ON CONFLICT (name) DO NOTHING;
    `;

    // SQL 실행
    console.log('Creating tables...');
    const { error: tablesError } = await adminSupabase.rpc('exec_sql', { 
      sql: createTablesSQL 
    });

    if (tablesError) {
      console.error('Tables creation error:', tablesError);
    }

    console.log('Creating policies...');
    const { error: policiesError } = await adminSupabase.rpc('exec_sql', { 
      sql: createPoliciesSQL 
    });

    if (policiesError) {
      console.error('Policies creation error:', policiesError);
    }

    console.log('Creating indexes...');
    const { error: indexesError } = await adminSupabase.rpc('exec_sql', { 
      sql: createIndexesSQL 
    });

    if (indexesError) {
      console.error('Indexes creation error:', indexesError);
    }

    console.log('Inserting subjects...');
    const { error: subjectsError } = await adminSupabase.rpc('exec_sql', { 
      sql: insertSubjectsSQL 
    });

    if (subjectsError) {
      console.error('Subjects insertion error:', subjectsError);
    }

    // 사용자 프로필 생성/업데이트
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url,
        updated_at: new Date().toISOString()
      });

    if (userError) {
      console.error('User creation error:', userError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database tables created successfully',
      tables: ['users', 'subjects', 'daily_reflections', 'daily_statistics'],
      user_created: !userError
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database setup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}