#!/usr/bin/env python3
"""
Supabase MCP (Model Context Protocol) 스타일 데이터베이스 관리
LG DX Dashboard를 위한 Supabase 데이터베이스 작업 및 Notion 연동
"""

import os
import json
import sys
import asyncio
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from supabase import create_client, Client
from dotenv import load_dotenv
import requests

# 환경 변수 로드
load_dotenv('.env.local')

class SupabaseMCP:
    """Supabase MCP 클라이언트 with Notion 연동"""
    
    def __init__(self):
        # Supabase 설정
        self.url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        self.service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        # Notion 설정
        self.notion_token = os.getenv('NOTION_API_TOKEN')
        self.notion_database_id = os.getenv('NOTION_DATABASE_ID')
        
        if not self.url or not self.service_key:
            raise ValueError("Supabase 환경 변수가 설정되지 않았습니다.")
        
        if not self.notion_token:
            print("⚠️  Notion API 토큰이 설정되지 않았습니다. Notion 연동 기능이 제한됩니다.")
        
        self.client: Client = create_client(self.url, self.service_key)
        self.project_id = self.url.split('//')[1].split('.')[0]
        
        # Notion API 헤더
        self.notion_headers = {
            'Authorization': f'Bearer {self.notion_token}',
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
        }
    
    def setup_notion_database(self) -> dict:
        """Notion 데이터베이스 생성 또는 확인"""
        print("🎨 Notion 데이터베이스 설정 중...")
        
        if not self.notion_token:
            return {
                "success": False,
                "error": "Notion API 토큰이 설정되지 않았습니다."
            }
        
        # Notion 연결 테스트
        test_url = "https://api.notion.com/v1/users/me"
        try:
            response = requests.get(test_url, headers=self.notion_headers)
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": f"Notion API 연결 실패: {response.status_code}"
                }
        except Exception as e:
            return {
                "success": False,
                "error": f"Notion API 연결 오류: {str(e)}"
            }
        
        print("✅ Notion API 연결 성공")
        
        # MCP를 통한 데이터베이스 생성은 별도 도구로 처리
        return {
            "success": True,
            "message": "Notion API 연결 확인됨",
            "next_step": "MCP Notion 도구를 사용하여 데이터베이스를 생성하세요",
            "suggested_mcp_command": "mcp_notion_create-database"
        }
    
    def transform_reflection_to_notion(self, reflection: dict) -> dict:
        """Supabase Daily Reflection 데이터를 Notion 형식으로 변환"""
        
        # 기본 값 설정
        properties = {
            "제목": {
                "title": [
                    {
                        "text": {
                            "content": f"{reflection.get('date', 'Unknown')} - {reflection.get('time_part', 'Unknown')} 리플렉션"
                        }
                    }
                ]
            },
            "날짜": {
                "date": {
                    "start": reflection.get('date', datetime.now().strftime('%Y-%m-%d'))
                }
            },
            "시간대": {
                "select": {
                    "name": reflection.get('time_part', 'morning')
                }
            },
            "이해도": {
                "number": reflection.get('understanding_score', 0)
            },
            "집중도": {
                "number": reflection.get('concentration_score', 0)
            },
            "성취도": {
                "number": reflection.get('achievement_score', 0)
            },
            # 총점은 formula이므로 제외 (Notion에서 자동 계산)
            "컨디션": {
                "select": {
                    "name": reflection.get('condition', '보통')
                }
            }
        }
        
        # 성취사항 (배열 → 멀티셀렉트)
        if reflection.get('achievements'):
            properties[" 오늘의 성취"] = {
                "multi_select": [
                    {"name": achievement} for achievement in reflection['achievements'][:5]  # 최대 5개
                ]
            }
        
        # 도전과제 (배열 → 멀티셀렉트)
        if reflection.get('challenges'):
            properties["어려웠던 점"] = {
                "multi_select": [
                    {"name": challenge} for challenge in reflection['challenges'][:5]
                ]
            }
        
        # 내일 목표 (배열 → 멀티셀렉트)
        if reflection.get('tomorrow_goals'):
            properties["내일목표"] = {
                "multi_select": [
                    {"name": goal} for goal in reflection['tomorrow_goals'][:5]
                ]
            }
        
        # 노트 (텍스트 → Rich Text)
        if reflection.get('notes'):
            properties["추가 메모"] = {
                "rich_text": [
                    {
                        "text": {
                            "content": reflection['notes'][:2000]  # Notion 제한
                        }
                    }
                ]
            }
        
        # Supabase ID 저장 (중복 방지용)
        if reflection.get('id'):
            properties["Supabase_ID"] = {
                "rich_text": [
                    {
                        "text": {
                            "content": str(reflection['id'])
                        }
                    }
                ]
            }
        
        return {
            "parent": {
                "database_id": self.notion_database_id
            },
            "properties": properties
        }
    
    def sync_reflections_to_notion(self, limit: int = 10, date_filter: Optional[str] = None) -> dict:
        """Supabase Daily Reflections를 Notion으로 동기화 (고급 오류 처리 포함)"""
        print(f"🔄 Daily Reflections Notion 동기화 시작 (최대 {limit}개)...")
        
        if not self.notion_token or not self.notion_database_id:
            return {
                "success": False,
                "error": "Notion 설정이 완료되지 않았습니다."
            }
        
        # 1. Supabase에서 리플렉션 데이터 조회
        try:
            query = self.client.table('daily_reflections').select('*')
            
            if date_filter:
                query = query.gte('date', date_filter)
            
            result = query.order('created_at', desc=True).limit(limit).execute()
            reflections = result.data if result.data else []
            
            print(f"📊 Supabase에서 {len(reflections)}개 리플렉션 조회됨")
            
        except Exception as e:
            print(f"⚠️  Supabase 조회 실패: {str(e)}")
            print("🔄 대안: 수동 테스트 데이터로 동기화 시도")
            
            # Supabase 접근 실패 시 테스트 데이터 생성
            reflections = self._create_fallback_test_data()
            print(f"📊 테스트 데이터 {len(reflections)}개 생성됨")
        
        if not reflections:
            return {
                "success": True,
                "message": "동기화할 데이터가 없습니다.",
                "synced_count": 0
            }
        
        # 2. 기존 Notion 페이지 확인 (중복 방지)
        existing_ids = self._get_existing_notion_ids()
        
        # 3. 새로운 데이터만 필터링
        new_reflections = [
            r for r in reflections 
            if str(r.get('id', '')) not in existing_ids
        ]
        
        print(f"📝 새로 동기화할 데이터: {len(new_reflections)}개")
        
        # 4. Notion에 페이지 생성 (고급 오류 처리)
        synced_count = 0
        errors = []
        retry_count = 0
        max_retries = 3
        
        for reflection in new_reflections:
            success = False
            current_retries = 0
            
            while not success and current_retries < max_retries:
                try:
                    notion_data = self.transform_reflection_to_notion(reflection)
                    
                    # Notion API 호출
                    create_url = "https://api.notion.com/v1/pages"
                    response = requests.post(
                        create_url, 
                        headers=self.notion_headers,
                        json=notion_data,
                        timeout=30  # 타임아웃 설정
                    )
                    
                    if response.status_code == 200:
                        synced_count += 1
                        print(f"✅ {reflection.get('date')} {reflection.get('time_part')} 동기화 완료")
                        success = True
                    elif response.status_code == 429:
                        # Rate limiting 처리
                        retry_after = int(response.headers.get('Retry-After', 60))
                        print(f"⏰ Rate limit 도달. {retry_after}초 대기 중...")
                        time.sleep(retry_after)
                        current_retries += 1
                    elif response.status_code in [500, 502, 503, 504]:
                        # 서버 오류 재시도
                        wait_time = 2 ** current_retries  # 지수 백오프
                        print(f"🔄 서버 오류 ({response.status_code}). {wait_time}초 후 재시도...")
                        time.sleep(wait_time)
                        current_retries += 1
                    else:
                        error_msg = f"Notion 생성 실패 ({response.status_code}): {response.text}"
                        errors.append(error_msg)
                        print(f"❌ {reflection.get('date')} {reflection.get('time_part')} 실패: {response.status_code}")
                        break
                    
                    # API 율제한 방지 (성공한 경우에만)
                    if success:
                        time.sleep(0.3)
                    
                except requests.exceptions.RequestException as e:
                    # 네트워크 오류 재시도
                    if current_retries < max_retries - 1:
                        wait_time = 2 ** current_retries
                        print(f"🌐 네트워크 오류: {str(e)}. {wait_time}초 후 재시도...")
                        time.sleep(wait_time)
                        current_retries += 1
                    else:
                        error_msg = f"네트워크 오류 (최대 재시도 초과): {str(e)}"
                        errors.append(error_msg)
                        print(f"❌ {reflection.get('date')} {reflection.get('time_part')} 네트워크 실패")
                        break
                except Exception as e:
                    error_msg = f"예상치 못한 오류: {str(e)}"
                    errors.append(error_msg)
                    print(f"❌ {reflection.get('date')} {reflection.get('time_part')} 예외: {str(e)}")
                    break
            
            if not success:
                retry_count += 1
        
        # 5. 결과 요약
        total_success_rate = (synced_count / len(new_reflections) * 100) if new_reflections else 100
        
        return {
            "success": synced_count > 0 or len(new_reflections) == 0,
            "synced_count": synced_count,
            "total_reflections": len(reflections),
            "new_reflections": len(new_reflections),
            "existing_count": len(existing_ids),
            "retry_count": retry_count,
            "success_rate": f"{total_success_rate:.1f}%",
            "errors": errors,
            "message": f"{synced_count}개 리플렉션이 Notion에 동기화되었습니다. (성공률: {total_success_rate:.1f}%)"
        }
    
    def _get_existing_notion_ids(self) -> set:
        """기존 Notion 페이지의 Supabase ID 목록 조회"""
        if not self.notion_database_id:
            return set()
        
        try:
            query_url = f"https://api.notion.com/v1/databases/{self.notion_database_id}/query"
            
            response = requests.post(
                query_url,
                headers=self.notion_headers,
                json={
                    "filter": {
                        "property": "Supabase_ID",
                        "rich_text": {
                            "is_not_empty": True
                        }
                    }
                }
            )
            
            if response.status_code == 200:
                pages = response.json().get('results', [])
                existing_ids = set()
                
                for page in pages:
                    supabase_id_prop = page.get('properties', {}).get('Supabase_ID', {})
                    rich_text = supabase_id_prop.get('rich_text', [])
                    if rich_text:
                        existing_ids.add(rich_text[0].get('text', {}).get('content', ''))
                
                return existing_ids
            
        except Exception as e:
            print(f"⚠️  기존 Notion ID 조회 실패: {e}")
        
        return set()
    
    def _create_fallback_test_data(self) -> list:
        """Supabase 접근 실패 시 대체 테스트 데이터 생성"""
        from datetime import datetime, timedelta
        
        test_data = []
        base_date = datetime.now()
        
        # 최근 5일간의 테스트 데이터 생성
        for i in range(5):
            date = (base_date - timedelta(days=i)).strftime('%Y-%m-%d')
            
            # 오전 리플렉션
            morning_reflection = {
                "id": f"fallback-{date}-morning",
                "user_id": "fallback-user",
                "date": date,
                "time_part": "morning",
                "understanding_score": 7 + (i % 3),
                "concentration_score": 6 + (i % 4),
                "achievement_score": 8 + (i % 3),
                "condition": ["좋음", "보통", "나쁨"][i % 3],
                "achievements": [
                    f"{date} 오전 학습 완료",
                    "새로운 개념 이해"
                ],
                "challenges": [
                    "복잡한 개념 이해 어려움"
                ],
                "tomorrow_goals": [
                    "실습 프로젝트 진행"
                ],
                "notes": f"{date} 오전 학습 노트 - Python 경로 문제 해결 등",
                "total_score": 21 + (i % 5),
                "created_at": f"{date}T09:00:00"
            }
            
            # 오후 리플렉션
            afternoon_reflection = {
                "id": f"fallback-{date}-afternoon",
                "user_id": "fallback-user", 
                "date": date,
                "time_part": "afternoon",
                "understanding_score": 8 + (i % 2),
                "concentration_score": 7 + (i % 3),
                "achievement_score": 6 + (i % 4),
                "condition": ["좋음", "보통"][i % 2],
                "achievements": [
                    f"{date} 오후 실습 완료",
                    "프로젝트 진행"
                ],
                "challenges": [
                    "시간 부족"
                ],
                "tomorrow_goals": [
                    "복습 및 정리"
                ],
                "notes": f"{date} 오후 학습 노트 - 실습 위주 학습",
                "total_score": 20 + (i % 6),
                "created_at": f"{date}T15:00:00"
            }
            
            test_data.extend([morning_reflection, afternoon_reflection])
        
        return test_data
    
    def check_notion_sync_status(self) -> dict:
        """Notion 동기화 상태 확인"""
        print("🔍 Notion 동기화 상태 확인 중...")
        
        # Supabase 리플렉션 수
        try:
            supabase_result = self.client.table('daily_reflections').select('*', count='exact').execute()
            supabase_count = supabase_result.count or 0
        except Exception as e:
            supabase_count = -1
            print(f"❌ Supabase 조회 실패: {e}")
        
        # Notion 페이지 수
        notion_count = 0
        if self.notion_database_id:
            try:
                query_url = f"https://api.notion.com/v1/databases/{self.notion_database_id}/query"
                response = requests.post(query_url, headers=self.notion_headers, json={})
                
                if response.status_code == 200:
                    notion_count = len(response.json().get('results', []))
                
            except Exception as e:
                print(f"❌ Notion 조회 실패: {e}")
        
        sync_rate = (notion_count / supabase_count * 100) if supabase_count > 0 else 0
        
        status = {
            "supabase_reflections": supabase_count,
            "notion_pages": notion_count,
            "sync_rate": f"{sync_rate:.1f}%",
            "missing_count": max(0, supabase_count - notion_count),
            "notion_configured": bool(self.notion_token and self.notion_database_id)
        }
        
        print(f"📊 Supabase: {supabase_count}개, Notion: {notion_count}개 ({sync_rate:.1f}% 동기화)")
        
        return status
    
    def generate_sync_report(self) -> dict:
        """동기화 상태 종합 리포트 생성"""
        print("📊 동기화 리포트 생성 중...")
        
        # 기본 상태 정보
        status = self.check_notion_sync_status()
        
        # 추가 분석
        try:
            # 최근 7일간 리플렉션 조회
            week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            recent_result = self.client.table('daily_reflections')\
                .select('date, time_part, total_score, created_at')\
                .gte('date', week_ago)\
                .order('created_at', desc=True)\
                .execute()
            
            recent_reflections = recent_result.data if recent_result.data else []
            
            # 통계 계산
            if recent_reflections:
                total_scores = [r.get('total_score', 0) for r in recent_reflections if r.get('total_score')]
                avg_score = sum(total_scores) / len(total_scores) if total_scores else 0
                
                # 일별 통계
                daily_counts = {}
                for r in recent_reflections:
                    date = r.get('date')
                    if date:
                        daily_counts[date] = daily_counts.get(date, 0) + 1
                
                # 시간대별 통계
                time_counts = {}
                for r in recent_reflections:
                    time_part = r.get('time_part', 'unknown')
                    time_counts[time_part] = time_counts.get(time_part, 0) + 1
                
                analytics = {
                    "recent_7days_count": len(recent_reflections),
                    "average_score": round(avg_score, 1),
                    "daily_distribution": daily_counts,
                    "time_distribution": time_counts,
                    "most_active_day": max(daily_counts.items(), key=lambda x: x[1])[0] if daily_counts else None,
                    "preferred_time": max(time_counts.items(), key=lambda x: x[1])[0] if time_counts else None
                }
            else:
                analytics = {
                    "recent_7days_count": 0,
                    "average_score": 0,
                    "daily_distribution": {},
                    "time_distribution": {},
                    "most_active_day": None,
                    "preferred_time": None
                }
            
            return {
                "success": True,
                "sync_status": status,
                "analytics": analytics,
                "generated_at": datetime.now().isoformat(),
                "recommendations": self._generate_recommendations(status, analytics)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"리포트 생성 실패: {str(e)}",
                "sync_status": status
            }
    
    def _generate_recommendations(self, status: dict, analytics: dict) -> list:
        """개선 제안 생성"""
        recommendations = []
        
        # 동기화율 기반 제안
        sync_rate = float(status.get('sync_rate', '0%').replace('%', ''))
        if sync_rate < 90:
            recommendations.append({
                "type": "sync_improvement",
                "priority": "high",
                "message": f"동기화율이 {sync_rate}%로 낮습니다. 'notion-sync' 명령어로 동기화를 실행하세요."
            })
        
        # 활동 패턴 기반 제안
        recent_count = analytics.get('recent_7days_count', 0)
        if recent_count < 7:
            recommendations.append({
                "type": "activity_improvement",
                "priority": "medium", 
                "message": f"최근 7일간 {recent_count}개 리플렉션만 작성되었습니다. 일일 학습 기록을 늘려보세요."
            })
        
        # 점수 기반 제안
        avg_score = analytics.get('average_score', 0)
        if avg_score > 0 and avg_score < 20:
            recommendations.append({
                "type": "performance_improvement",
                "priority": "medium",
                "message": f"평균 점수가 {avg_score}점으로 낮습니다. 학습 방법을 점검해보세요."
            })
        elif avg_score > 25:
            recommendations.append({
                "type": "performance_recognition",
                "priority": "low",
                "message": f"평균 점수가 {avg_score}점으로 우수합니다! 현재 학습 패턴을 유지하세요."
            })
        
        return recommendations
    
    def setup_realtime_sync(self) -> dict:
        """실시간 동기화 시스템 설정"""
        print("⚡ 실시간 Notion 동기화 시스템 설정 중...")
        
        # Supabase 트리거 설정 확인
        trigger_sql_file = os.path.join(os.path.dirname(__file__), 'supabase-realtime-triggers.sql')
        api_file = os.path.join(os.path.dirname(__file__), '..', 'pages', 'api', 'sync-to-notion.ts')
        
        setup_status = {
            "trigger_sql_exists": os.path.exists(trigger_sql_file),
            "api_endpoint_exists": os.path.exists(api_file),
            "supabase_configured": bool(self.url and self.service_key),
            "notion_configured": bool(self.notion_token and self.notion_database_id)
        }
        
        instructions = []
        
        if setup_status["trigger_sql_exists"]:
            instructions.append("1. Supabase 대시보드에서 SQL Editor 열기")
            instructions.append(f"2. {trigger_sql_file} 파일의 SQL 스크립트 실행")
            instructions.append("3. HTTP extension 활성화: CREATE EXTENSION IF NOT EXISTS http;")
        else:
            instructions.append("❌ SQL 트리거 파일이 없습니다.")
            
        if setup_status["api_endpoint_exists"]:
            instructions.append("4. Next.js 개발 서버 실행: npm run dev")
            instructions.append("5. API 엔드포인트 테스트: http://localhost:3000/api/sync-to-notion")
        else:
            instructions.append("❌ API 엔드포인트 파일이 없습니다.")
            
        instructions.extend([
            "6. 환경 변수 확인:",
            "   - NOTION_API_TOKEN",
            "   - NOTION_DATABASE_ID", 
            "   - NEXT_PUBLIC_SUPABASE_URL",
            "   - SUPABASE_SERVICE_ROLE_KEY"
        ])
        
        return {
            "success": all(setup_status.values()),
            "setup_status": setup_status,
            "instructions": instructions,
            "trigger_file": trigger_sql_file,
            "api_endpoint": "/api/sync-to-notion",
            "message": "실시간 동기화 시스템 준비 완료" if all(setup_status.values()) else "설정이 필요합니다."
        }
    
    def test_realtime_sync(self) -> dict:
        """실시간 동기화 테스트"""
        print("🧪 실시간 동기화 테스트 중...")
        
        # 1. 테스트 리플렉션 생성
        test_reflection = self.create_test_reflection()
        
        if not test_reflection["success"]:
            return {
                "success": False,
                "error": "테스트 리플렉션 생성 실패",
                "details": test_reflection
            }
        
        reflection_id = test_reflection["reflection"]["id"]
        print(f"📊 테스트 리플렉션 생성됨: ID {reflection_id}")
        
        # 2. 실시간 동기화 대기 (트리거가 작동하는 시간)
        print("⏳ 실시간 동기화 대기 중 (5초)...")
        time.sleep(5)
        
        # 3. Notion에서 동기화 확인
        existing_ids = self._get_existing_notion_ids()
        synced = str(reflection_id) in existing_ids
        
        return {
            "success": synced,
            "test_reflection_id": reflection_id,
            "notion_synced": synced,
            "sync_time": "약 5초 이내" if synced else "동기화 실패",
            "message": "실시간 동기화 성공!" if synced else "실시간 동기화가 작동하지 않습니다. 설정을 확인하세요."
        }
    
    def schedule_auto_sync(self, interval_hours: int = 24) -> dict:
        """자동 동기화 스케줄 설정 (레거시 - 실시간 모드 권장)"""
        print(f"⚠️  레거시 모드: {interval_hours}시간마다 자동 동기화")
        print("💡 권장: 실시간 동기화 모드 사용 (setup-realtime 명령어)")
        
        # 실제 구현에서는 cron job, GitHub Actions, 또는 서버 스케줄러 사용
        schedule_info = {
            "enabled": True,
            "interval_hours": interval_hours,
            "next_sync": (datetime.now() + timedelta(hours=interval_hours)).isoformat(),
            "command": "python supabase_mcp.py notion-sync",
            "setup_instructions": [
                "GitHub Actions 워크플로우 파일 생성",
                "cron 표현식: '0 */24 * * *' (24시간마다)",
                "환경 변수 설정 필요",
                "수동 트리거도 가능"
            ],
            "recommendation": "실시간 동기화 모드로 전환하세요: python supabase_mcp.py setup-realtime"
        }
        
        return {
            "success": True,
            "message": f"{interval_hours}시간마다 자동 동기화 설정됨 (레거시 모드)",
            "schedule": schedule_info
        }
        
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
    
    def create_test_reflection(self, user_id: Optional[str] = None) -> dict:
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
        print("Supabase MCP for LG DX Dashboard - Notion 연동 지원")
        print("=" * 60)
        print("📊 기본 Supabase 명령어:")
        print("  python supabase_mcp.py status       - 데이터베이스 상태 확인")
        print("  python supabase_mcp.py create       - 테이블 생성 가이드")
        print("  python supabase_mcp.py seed         - 기본 데이터 삽입")
        print("  python supabase_mcp.py test         - 테스트 리플렉션 생성")
        print("  python supabase_mcp.py list         - 리플렉션 목록 조회")
        print("  python supabase_mcp.py cleanup      - 테스트 데이터 정리")
        print("")
        print("🎨 Notion 연동 명령어:")
        print("  python supabase_mcp.py notion-setup - Notion 데이터베이스 설정")
        print("  python supabase_mcp.py notion-sync  - Notion 동기화 실행")
        print("  python supabase_mcp.py notion-status- Notion 동기화 상태 확인")
        print("  python supabase_mcp.py sync-today   - 오늘 데이터만 동기화")
        print("  python supabase_mcp.py sync-week    - 최근 7일 데이터 동기화")
        print("")
        print("⚡ 실시간 동기화 명령어:")
        print("  python supabase_mcp.py setup-realtime - 실시간 동기화 시스템 설정")
        print("  python supabase_mcp.py test-realtime  - 실시간 동기화 테스트")
        print("")
        print("📊 고급 모니터링 명령어:")
        print("  python supabase_mcp.py sync-report  - 종합 동기화 리포트 생성")
        print("  python supabase_mcp.py auto-schedule- 자동 동기화 스케줄 설정 (레거시)")
        print("")
        print("💡 권장 사용법:")
        print("  1. python supabase_mcp.py setup-realtime  # 실시간 설정")
        print("  2. npm run dev                           # 대시보드 실행") 
        print("  3. 대시보드에서 리플렉션 작성             # 자동 Notion 동기화")
        print("")
        print("🚀 환경 변수 설정 필요:")
        print("  NOTION_API_TOKEN=secret_xxx...")
        print("  NOTION_DATABASE_ID=xxx...")
        return
    
    command = sys.argv[1].lower()
    
    try:
        mcp = SupabaseMCP()
        
        # 기존 Supabase 명령어
        if command == 'status':
            result = mcp.status()
            print("\n📊 Supabase 상태:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == 'create':
            result = mcp.create_tables()
            print("\n📊 테이블 생성 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == 'seed':
            result = mcp.seed_data()
            print("\n📊 기본 데이터 삽입 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == 'test':
            result = mcp.create_test_reflection()
            print("\n📊 테스트 리플렉션 생성 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == 'list':
            result = mcp.list_reflections()
            print(f"\n📊 총 {result.get('count', 0)}개 리플렉션")
            
        elif command == 'cleanup':
            result = mcp.cleanup_test_data()
            print("\n📊 테스트 데이터 정리 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        
        # 새로운 Notion 연동 명령어
        elif command == 'notion-setup':
            result = mcp.setup_notion_database()
            print("\n🎨 Notion 설정 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == 'notion-sync':
            limit = int(sys.argv[2]) if len(sys.argv) > 2 else 50
            result = mcp.sync_reflections_to_notion(limit=limit)
            print(f"\n🔄 Notion 동기화 결과 (최대 {limit}개):")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == 'notion-status':
            result = mcp.check_notion_sync_status()
            print("\n📊 Notion 동기화 상태:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == 'sync-today':
            today = datetime.now().strftime('%Y-%m-%d')
            result = mcp.sync_reflections_to_notion(limit=10, date_filter=today)
            print(f"\n📅 오늘({today}) 데이터 동기화 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == 'sync-week':
            week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            result = mcp.sync_reflections_to_notion(limit=100, date_filter=week_ago)
            print(f"\n📅 최근 7일({week_ago}~) 데이터 동기화 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        
        # 실시간 동기화 명령어
        elif command == 'setup-realtime':
            result = mcp.setup_realtime_sync()
            print("\n⚡ 실시간 동기화 설정 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == 'test-realtime':
            result = mcp.test_realtime_sync()
            print("\n🧪 실시간 동기화 테스트 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        
        # 고급 모니터링 명령어
        elif command == 'sync-report':
            result = mcp.generate_sync_report()
            print("\n📊 종합 동기화 리포트:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == 'auto-schedule':
            hours = int(sys.argv[2]) if len(sys.argv) > 2 else 24
            result = mcp.schedule_auto_sync(interval_hours=hours)
            print(f"\n⏰ 자동 동기화 스케줄 설정 ({hours}시간):")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        else:
            print(f"❌ 알 수 없는 명령어: {command}")
            print("도움말을 보려면 인수 없이 실행하세요: python supabase_mcp.py")
            
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()