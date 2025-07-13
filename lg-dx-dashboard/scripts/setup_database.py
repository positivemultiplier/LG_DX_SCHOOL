#!/usr/bin/env python3
"""
Supabase 데이터베이스 설정 스크립트
리플렉션 시스템을 위한 테이블 생성
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv('.env.local')

def get_supabase_client() -> Client:
    """Supabase 클라이언트 생성"""
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not service_role_key:
        raise ValueError("Supabase URL 또는 Service Role Key가 설정되지 않았습니다.")
    
    print(f"Supabase URL: {url}")
    print(f"Service Role Key: {'*' * 20}...{service_role_key[-10:]}")
    
    return create_client(url, service_role_key)

def create_tables(supabase: Client):
    """테이블 생성"""
    
    # 1. users 테이블 생성
    users_sql = """
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
    """
    
    # 2. subjects 테이블 생성
    subjects_sql = """
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
    """
    
    # 3. daily_reflections 테이블 생성
    reflections_sql = """
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
    """
    
    # 4. daily_statistics 테이블 생성
    statistics_sql = """
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
    """
    
    # SQL 실행
    tables = [
        ("users", users_sql),
        ("subjects", subjects_sql), 
        ("daily_reflections", reflections_sql),
        ("daily_statistics", statistics_sql)
    ]
    
    for table_name, sql in tables:
        try:
            print(f"Creating {table_name} table...")
            result = supabase.rpc('exec_sql', {'sql': sql}).execute()
            print(f"✅ {table_name} table created successfully")
        except Exception as e:
            print(f"❌ Error creating {table_name}: {e}")

def enable_rls(supabase: Client):
    """Row Level Security 활성화"""
    rls_sql = """
    -- RLS 활성화
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.daily_statistics ENABLE ROW LEVEL SECURITY;
    """
    
    try:
        print("Enabling Row Level Security...")
        supabase.rpc('exec_sql', {'sql': rls_sql}).execute()
        print("✅ RLS enabled successfully")
    except Exception as e:
        print(f"❌ Error enabling RLS: {e}")

def create_policies(supabase: Client):
    """RLS 정책 생성"""
    policies_sql = """
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
    """
    
    try:
        print("Creating RLS policies...")
        supabase.rpc('exec_sql', {'sql': policies_sql}).execute()
        print("✅ RLS policies created successfully")
    except Exception as e:
        print(f"❌ Error creating policies: {e}")

def create_indexes(supabase: Client):
    """인덱스 생성"""
    indexes_sql = """
    -- 성능 최적화 인덱스
    CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date 
        ON public.daily_reflections(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_daily_reflections_date_timepart 
        ON public.daily_reflections(date, time_part);
    CREATE INDEX IF NOT EXISTS idx_daily_statistics_user_date 
        ON public.daily_statistics(user_id, date);
    """
    
    try:
        print("Creating indexes...")
        supabase.rpc('exec_sql', {'sql': indexes_sql}).execute()
        print("✅ Indexes created successfully")
    except Exception as e:
        print(f"❌ Error creating indexes: {e}")

def insert_sample_subjects(supabase: Client):
    """기본 과목 데이터 삽입"""
    subjects_data = [
        {
            'name': 'Python 기초',
            'category': 'Foundation',
            'subcategory': 'Programming',
            'description': 'Python 프로그래밍 기초 문법과 개념',
            'color_code': '#3776AB',
            'icon': '🐍',
            'difficulty_level': 2,
            'estimated_hours': 40
        },
        {
            'name': '데이터 구조와 알고리즘',
            'category': 'Foundation',
            'subcategory': 'Computer Science',
            'description': '기본적인 자료구조와 알고리즘 학습',
            'color_code': '#FF6B6B',
            'icon': '🔧',
            'difficulty_level': 3,
            'estimated_hours': 60
        },
        {
            'name': '웹 개발 기초',
            'category': 'Foundation',
            'subcategory': 'Web Development',
            'description': 'HTML, CSS, JavaScript 기초',
            'color_code': '#F7931E',
            'icon': '🌐',
            'difficulty_level': 2,
            'estimated_hours': 50
        },
        {
            'name': 'DX 방법론',
            'category': 'DX_Methodology',
            'subcategory': 'Business',
            'description': '디지털 전환 방법론과 전략',
            'color_code': '#4ECDC4',
            'icon': '🚀',
            'difficulty_level': 4,
            'estimated_hours': 30
        },
        {
            'name': '빅데이터 분석 이론',
            'category': '빅데이터분석기사',
            'subcategory': 'Theory',
            'description': '빅데이터 분석 기본 이론',
            'color_code': '#45B7D1',
            'icon': '📊',
            'difficulty_level': 3,
            'estimated_hours': 45
        },
        {
            'name': 'SQL 데이터베이스',
            'category': '빅데이터분석기사',
            'subcategory': 'Database',
            'description': 'SQL과 데이터베이스 활용',
            'color_code': '#96CEB4',
            'icon': '🗄️',
            'difficulty_level': 3,
            'estimated_hours': 35
        }
    ]
    
    try:
        print("Inserting sample subjects...")
        result = supabase.table('subjects').upsert(subjects_data, on_conflict='name').execute()
        print(f"✅ {len(subjects_data)} subjects inserted successfully")
        return result.data
    except Exception as e:
        print(f"❌ Error inserting subjects: {e}")
        return []

def verify_setup(supabase: Client):
    """설정 검증"""
    try:
        print("\n🔍 Verifying database setup...")
        
        # 테이블 존재 확인
        tables = ['users', 'subjects', 'daily_reflections', 'daily_statistics']
        for table in tables:
            try:
                result = supabase.table(table).select('*', count='exact').limit(1).execute()
                print(f"✅ Table '{table}' exists (count: {result.count})")
            except Exception as e:
                print(f"❌ Table '{table}' check failed: {e}")
        
        # 과목 데이터 확인
        subjects = supabase.table('subjects').select('name').execute()
        print(f"✅ Found {len(subjects.data)} subjects in database")
        for subject in subjects.data:
            print(f"   - {subject['name']}")
            
        print("\n🎉 Database setup verification completed!")
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")

def main():
    """메인 실행 함수"""
    print("Starting Supabase database setup...")
    print("=" * 50)
    
    try:
        # Supabase 클라이언트 생성
        supabase = get_supabase_client()
        print("Supabase client created successfully\n")
        
        # UUID 확장 활성화
        print("Enabling UUID extension...")
        try:
            supabase.rpc('exec_sql', {'sql': 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'}).execute()
            print("✅ UUID extension enabled\n")
        except Exception as e:
            print(f"⚠️ UUID extension warning: {e}\n")
        
        # 테이블 생성
        create_tables(supabase)
        print()
        
        # RLS 활성화
        enable_rls(supabase)
        print()
        
        # 정책 생성
        create_policies(supabase)
        print()
        
        # 인덱스 생성
        create_indexes(supabase)
        print()
        
        # 샘플 데이터 삽입
        subjects = insert_sample_subjects(supabase)
        print()
        
        # 설정 검증
        verify_setup(supabase)
        
        print("\n🎉 Database setup completed successfully!")
        print("You can now test the reflection system at http://localhost:3001")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()