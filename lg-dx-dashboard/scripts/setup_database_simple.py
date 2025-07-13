#!/usr/bin/env python3
"""
Supabase 데이터베이스 설정 스크립트 (간단 버전)
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

def setup_database():
    """데이터베이스 설정"""
    print("Starting Supabase database setup...")
    print("=" * 50)
    
    try:
        # Supabase 클라이언트 생성
        supabase = get_supabase_client()
        print("Supabase client created successfully")
        
        # UUID 확장 활성화
        print("\nEnabling UUID extension...")
        try:
            result = supabase.rpc('exec_sql', {'sql': 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'}).execute()
            print("UUID extension enabled")
        except Exception as e:
            print(f"UUID extension warning: {e}")
        
        # users 테이블 생성
        print("\nCreating users table...")
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
        supabase.rpc('exec_sql', {'sql': users_sql}).execute()
        print("Users table created")
        
        # subjects 테이블 생성
        print("Creating subjects table...")
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
        supabase.rpc('exec_sql', {'sql': subjects_sql}).execute()
        print("Subjects table created")
        
        # daily_reflections 테이블 생성
        print("Creating daily_reflections table...")
        reflections_sql = """
        CREATE TABLE IF NOT EXISTS public.daily_reflections (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            time_part TEXT NOT NULL CHECK (time_part IN ('morning', 'afternoon', 'evening')),
            understanding_score INTEGER CHECK (understanding_score BETWEEN 1 AND 10),
            concentration_score INTEGER CHECK (concentration_score BETWEEN 1 AND 10),
            achievement_score INTEGER CHECK (achievement_score BETWEEN 1 AND 10),
            condition TEXT CHECK (condition IN ('좋음', '보통', '나쁨')),
            total_score INTEGER GENERATED ALWAYS AS (
                (understanding_score + concentration_score + achievement_score)
            ) STORED,
            subjects JSONB DEFAULT '{}',
            achievements TEXT[] DEFAULT '{}',
            challenges TEXT[] DEFAULT '{}',
            tomorrow_goals TEXT[] DEFAULT '{}',
            notes TEXT,
            github_commits INTEGER DEFAULT 0,
            github_issues INTEGER DEFAULT 0,
            github_prs INTEGER DEFAULT 0,
            github_reviews INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, date, time_part)
        );
        """
        supabase.rpc('exec_sql', {'sql': reflections_sql}).execute()
        print("Daily reflections table created")
        
        # RLS 활성화
        print("\nEnabling Row Level Security...")
        rls_sql = """
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;
        """
        supabase.rpc('exec_sql', {'sql': rls_sql}).execute()
        print("RLS enabled")
        
        # RLS 정책 생성
        print("Creating RLS policies...")
        policies_sql = """
        DROP POLICY IF EXISTS "Users can manage own data" ON public.users;
        CREATE POLICY "Users can manage own data" ON public.users
            FOR ALL USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Authenticated users can read subjects" ON public.subjects;
        CREATE POLICY "Authenticated users can read subjects" ON public.subjects
            FOR SELECT USING (auth.role() = 'authenticated');

        DROP POLICY IF EXISTS "Users can manage own reflections" ON public.daily_reflections;
        CREATE POLICY "Users can manage own reflections" ON public.daily_reflections
            FOR ALL USING (auth.uid() = user_id);
        """
        supabase.rpc('exec_sql', {'sql': policies_sql}).execute()
        print("RLS policies created")
        
        # 인덱스 생성
        print("Creating indexes...")
        indexes_sql = """
        CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date 
            ON public.daily_reflections(user_id, date);
        CREATE INDEX IF NOT EXISTS idx_daily_reflections_date_timepart 
            ON public.daily_reflections(date, time_part);
        """
        supabase.rpc('exec_sql', {'sql': indexes_sql}).execute()
        print("Indexes created")
        
        # 기본 과목 데이터 삽입
        print("\nInserting sample subjects...")
        subjects_data = [
            {
                'name': 'Python 기초',
                'category': 'Foundation',
                'subcategory': 'Programming',
                'description': 'Python 프로그래밍 기초 문법과 개념',
                'color_code': '#3776AB',
                'icon': 'Python',
                'difficulty_level': 2,
                'estimated_hours': 40
            },
            {
                'name': 'DX 방법론',
                'category': 'DX_Methodology',
                'subcategory': 'Business',
                'description': '디지털 전환 방법론과 전략',
                'color_code': '#4ECDC4',
                'icon': 'DX',
                'difficulty_level': 4,
                'estimated_hours': 30
            },
            {
                'name': '빅데이터 분석 이론',
                'category': '빅데이터분석기사',
                'subcategory': 'Theory',
                'description': '빅데이터 분석 기본 이론',
                'color_code': '#45B7D1',
                'icon': 'Analytics',
                'difficulty_level': 3,
                'estimated_hours': 45
            }
        ]
        
        result = supabase.table('subjects').upsert(subjects_data, on_conflict='name').execute()
        print(f"Sample subjects inserted: {len(result.data)} records")
        
        # 검증
        print("\nVerifying setup...")
        tables_to_check = ['users', 'subjects', 'daily_reflections']
        for table in tables_to_check:
            try:
                result = supabase.table(table).select('*', count='exact').limit(1).execute()
                print(f"Table '{table}' verified (count: {result.count})")
            except Exception as e:
                print(f"Table '{table}' check failed: {e}")
        
        print("\nDatabase setup completed successfully!")
        print("You can now test the reflection system at http://localhost:3001")
        
    except Exception as e:
        print(f"Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    setup_database()