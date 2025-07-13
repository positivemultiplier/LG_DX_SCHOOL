#!/usr/bin/env python3
"""
PostgreSQL 직접 연결을 통한 데이터베이스 설정
"""

import os
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv('.env.local')

def get_db_connection():
    """PostgreSQL 연결 생성"""
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url:
        raise ValueError("NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.")
    
    # Supabase URL에서 PostgreSQL 연결 정보 추출
    # https://stgfcervmkbgaarjneyb.supabase.co -> 프로젝트 참조 ID 추출
    parsed_url = urlparse(supabase_url)
    project_ref = parsed_url.hostname.split('.')[0]
    
    # Supabase PostgreSQL 연결 문자열 구성
    db_host = f"db.{project_ref}.supabase.co"
    db_port = 5432
    db_name = "postgres"
    db_user = "postgres"
    
    # 서비스 롤 키에서 실제 패스워드 필요 (보통 별도 제공)
    # 또는 Supabase 대시보드에서 Database 설정 확인 필요
    print(f"DB Host: {db_host}")
    print(f"DB Port: {db_port}")
    print(f"DB Name: {db_name}")
    print(f"DB User: {db_user}")
    print("Note: PostgreSQL password is needed from Supabase dashboard")
    
    return None  # 실제 패스워드가 필요

def setup_via_supabase_client():
    """Supabase 클라이언트로 데이터 조작만 수행"""
    from supabase import create_client
    
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    supabase = create_client(url, service_role_key)
    
    print("Testing Supabase connection...")
    
    # 테이블 존재 확인 시도
    try:
        # auth.users 테이블 확인 (기본적으로 존재해야 함)
        result = supabase.table('auth.users').select('id').limit(1).execute()
        print(f"Auth users table exists, found {len(result.data)} users")
    except Exception as e:
        print(f"Auth users check failed: {e}")
    
    # 기존 테이블 확인
    try:
        # 시스템 테이블에서 우리 테이블 확인
        existing_tables = []
        table_names = ['users', 'subjects', 'daily_reflections']
        
        for table_name in table_names:
            try:
                result = supabase.table(table_name).select('*', count='exact').limit(1).execute()
                existing_tables.append(table_name)
                print(f"Table '{table_name}' exists with {result.count} records")
            except Exception as e:
                print(f"Table '{table_name}' does not exist: {e}")
        
        if not existing_tables:
            print("\nNo reflection system tables found.")
            print("Please create tables manually in Supabase SQL Editor:")
            print("1. Go to Supabase Dashboard > SQL Editor")
            print("2. Run the SQL from scripts/create-tables.sql")
            print("3. Then run this script again to verify")
        
        return existing_tables
        
    except Exception as e:
        print(f"Table check failed: {e}")
        return []

def insert_sample_data(supabase):
    """샘플 데이터 삽입"""
    try:
        # 과목 데이터 삽입
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
        print(f"Inserted {len(result.data)} subjects")
        
        # 삽입된 과목 확인
        subjects = supabase.table('subjects').select('name, category').execute()
        print("Available subjects:")
        for subject in subjects.data:
            print(f"  - {subject['name']} ({subject['category']})")
            
    except Exception as e:
        print(f"Sample data insertion failed: {e}")

def main():
    """메인 함수"""
    print("Supabase Database Setup Check")
    print("=" * 40)
    
    from supabase import create_client
    
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not service_role_key:
        print("Environment variables not found!")
        return
    
    supabase = create_client(url, service_role_key)
    
    # 기존 테이블 확인
    existing_tables = setup_via_supabase_client()
    
    if 'subjects' in existing_tables:
        print("\nInserting sample data...")
        insert_sample_data(supabase)
    
    print("\nSetup check completed!")
    print("\nTo create tables manually:")
    print("1. Go to https://supabase.com/dashboard")
    print("2. Select your project")
    print("3. Go to SQL Editor")
    print("4. Copy and run the SQL from scripts/create-tables.sql")

if __name__ == "__main__":
    main()