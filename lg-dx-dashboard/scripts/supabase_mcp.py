#!/usr/bin/env python3
"""
Supabase MCP (Model Context Protocol) 스타일 데이터베이스 관리
LG DX Dashboard를 위한 Supabase 데이터베이스 작업
"""

import os
import json
import sys
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv('.env.local')

class SupabaseMCP:
    """Supabase MCP 클라이언트"""
    
    def __init__(self):
        self.url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        self.service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.url or not self.service_key:
            raise ValueError("Supabase 환경 변수가 설정되지 않았습니다.")
        
        self.client: Client = create_client(self.url, self.service_key)
        self.project_id = self.url.split('//')[1].split('.')[0]
        
    def status(self) -> dict:
        """데이터베이스 상태 확인"""
        print("🔍 Supabase 데이터베이스 상태 확인 중...")
        
        status = {
            "connection": {
                "url": self.url,
                "project_id": self.project_id,
                "connected": False
            },
            "tables": {},
            "auth": {
                "users_count": 0
            }
        }
        
        try:
            # 테이블 상태 확인
            tables = ['users', 'subjects', 'daily_reflections', 'daily_statistics']
            
            for table_name in tables:
                try:
                    result = self.client.table(table_name).select('*', count='exact').limit(1).execute()
                    status["tables"][table_name] = {
                        "exists": True,
                        "count": result.count or 0
                    }
                    print(f"✅ {table_name}: {result.count or 0} records")
                except Exception as e:
                    status["tables"][table_name] = {
                        "exists": False,
                        "error": str(e)
                    }
                    print(f"❌ {table_name}: {str(e)}")
            
            status["connection"]["connected"] = True
            
        except Exception as e:
            print(f"❌ 연결 실패: {e}")
            status["connection"]["error"] = str(e)
            
        return status
    
    def create_tables(self) -> dict:
        """테이블 생성"""
        print("🚀 데이터베이스 테이블 생성 중...")
        
        # SQL 스크립트 읽기
        sql_file = os.path.join(os.path.dirname(__file__), 'supabase-manual-setup.sql')
        
        if not os.path.exists(sql_file):
            return {
                "success": False,
                "error": f"SQL 파일을 찾을 수 없습니다: {sql_file}"
            }
        
        try:
            with open(sql_file, 'r', encoding='utf-8') as f:
                sql_content = f.read()
            
            print("📄 SQL 스크립트 로드 완료")
            print("⚠️  주의: SQL 실행은 Supabase 웹 대시보드에서 수동으로 진행해야 합니다.")
            print("🌐 URL: https://supabase.com/dashboard/project/" + self.project_id)
            
            # SQL을 여러 부분으로 나누어 표시
            print("\n📝 실행할 SQL 스크립트:")
            print("=" * 60)
            print(sql_content[:500] + "..." if len(sql_content) > 500 else sql_content)
            print("=" * 60)
            
            return {
                "success": True,
                "message": "SQL 스크립트 준비 완료",
                "sql_file": sql_file,
                "dashboard_url": f"https://supabase.com/dashboard/project/{self.project_id}",
                "next_step": "Supabase 웹 대시보드에서 SQL Editor로 이동하여 스크립트를 실행하세요."
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"SQL 파일 읽기 실패: {e}"
            }
    
    def seed_data(self) -> dict:
        """기본 데이터 삽입"""
        print("🌱 기본 데이터 삽입 중...")
        
        # 과목 데이터
        subjects = [
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
            }
        ]
        
        try:
            # 기존 과목 확인
            existing = self.client.table('subjects').select('name').execute()
            existing_names = [s['name'] for s in existing.data] if existing.data else []
            
            print(f"📚 기존 과목: {len(existing_names)}개")
            
            # 새로운 과목만 삽입
            new_subjects = [s for s in subjects if s['name'] not in existing_names]
            
            if new_subjects:
                result = self.client.table('subjects').insert(new_subjects).execute()
                print(f"✅ {len(new_subjects)}개 과목 추가됨")
            else:
                print("ℹ️  모든 과목이 이미 존재합니다")
            
            # 전체 과목 목록 조회
            all_subjects = self.client.table('subjects').select('name, category, icon').execute()
            
            return {
                "success": True,
                "existing_count": len(existing_names),
                "inserted_count": len(new_subjects),
                "total_subjects": len(all_subjects.data) if all_subjects.data else 0,
                "subjects": all_subjects.data if all_subjects.data else []
            }
            
        except Exception as e:
            print(f"❌ 데이터 삽입 실패: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def create_test_reflection(self, user_id: str = None) -> dict:
        """테스트 리플렉션 생성"""
        print("🧪 테스트 리플렉션 생성 중...")
        
        if not user_id:
            # 임시 사용자 ID 생성 (실제로는 auth.users에서 가져와야 함)
            user_id = "test-user-" + datetime.now().strftime("%Y%m%d")
            print(f"⚠️  임시 사용자 ID 사용: {user_id}")
        
        test_reflection = {
            "user_id": user_id,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "time_part": "morning",
            "understanding_score": 8,
            "concentration_score": 7,
            "achievement_score": 9,
            "condition": "좋음",
            "achievements": ["Python 기본 문법 학습", "데이터 구조 이해"],
            "challenges": ["알고리즘 복잡도 개념"],
            "tomorrow_goals": ["실습 프로젝트 시작"],
            "notes": "오늘은 전반적으로 잘 진행되었습니다."
        }
        
        try:
            result = self.client.table('daily_reflections').insert([test_reflection]).execute()
            
            return {
                "success": True,
                "message": "테스트 리플렉션 생성 완료",
                "reflection": result.data[0] if result.data else None
            }
            
        except Exception as e:
            print(f"❌ 테스트 리플렉션 생성 실패: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def list_reflections(self, limit: int = 10) -> dict:
        """리플렉션 목록 조회"""
        print(f"📋 최근 리플렉션 {limit}개 조회 중...")
        
        try:
            result = self.client.table('daily_reflections')\
                .select('*')\
                .order('created_at', desc=True)\
                .limit(limit)\
                .execute()
            
            reflections = result.data if result.data else []
            
            print(f"📊 총 {len(reflections)}개 리플렉션 발견")
            
            for r in reflections:
                print(f"  - {r['date']} {r['time_part']}: {r['total_score']}/30점")
            
            return {
                "success": True,
                "count": len(reflections),
                "reflections": reflections
            }
            
        except Exception as e:
            print(f"❌ 리플렉션 조회 실패: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def cleanup_test_data(self) -> dict:
        """테스트 데이터 정리"""
        print("🧹 테스트 데이터 정리 중...")
        
        try:
            # 테스트 사용자 리플렉션 삭제
            result = self.client.table('daily_reflections')\
                .delete()\
                .like('user_id', 'test-user-%')\
                .execute()
            
            deleted_count = len(result.data) if result.data else 0
            
            return {
                "success": True,
                "deleted_count": deleted_count,
                "message": f"{deleted_count}개 테스트 리플렉션 삭제됨"
            }
            
        except Exception as e:
            print(f"❌ 테스트 데이터 정리 실패: {e}")
            return {
                "success": False,
                "error": str(e)
            }

def main():
    """CLI 인터페이스"""
    if len(sys.argv) < 2:
        print("Supabase MCP for LG DX Dashboard")
        print("=" * 40)
        print("사용법:")
        print("  python supabase_mcp.py status       - 데이터베이스 상태 확인")
        print("  python supabase_mcp.py create       - 테이블 생성 가이드")
        print("  python supabase_mcp.py seed         - 기본 데이터 삽입")
        print("  python supabase_mcp.py test         - 테스트 리플렉션 생성")
        print("  python supabase_mcp.py list         - 리플렉션 목록 조회")
        print("  python supabase_mcp.py cleanup      - 테스트 데이터 정리")
        return
    
    command = sys.argv[1].lower()
    
    try:
        mcp = SupabaseMCP()
        
        if command == 'status':
            result = mcp.status()
            print("\n📊 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == 'create':
            result = mcp.create_tables()
            print("\n📊 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == 'seed':
            result = mcp.seed_data()
            print("\n📊 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == 'test':
            result = mcp.create_test_reflection()
            print("\n📊 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == 'list':
            result = mcp.list_reflections()
            print(f"\n📊 총 {result.get('count', 0)}개 리플렉션")
            
        elif command == 'cleanup':
            result = mcp.cleanup_test_data()
            print("\n📊 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        else:
            print(f"❌ 알 수 없는 명령어: {command}")
            
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()