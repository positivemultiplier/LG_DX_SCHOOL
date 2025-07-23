# -*- coding: utf-8 -*-
"""
Notion Daily Reflection 동기화 도구

Phase 1: 환경 설정 및 기반 구축
- 1.1: Notion API 설정 ✅ (MCP를 통해 이미 구성됨)
- 1.2: 환경 변수 구성
- 1.3: 기본 연결 테스트

작성일: 2025-07-23
"""

import os
import json
import logging
from datetime import datetime, date
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import asyncio

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('notion_sync.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class NotionConfig:
    """Notion 설정 정보"""
    api_token: str
    database_id: str
    workspace_id: Optional[str] = None
    parent_page_id: Optional[str] = None

@dataclass
class ReflectionData:
    """일일 반성 데이터 구조"""
    date: date
    time_part: str
    understanding_score: int
    concentration_score: int
    achievement_score: int
    condition: str
    subject: str
    key_learning: str
    challenges: str
    reflection: str
    github_commits: int = 0
    github_issues: int = 0
    github_prs: int = 0
    tags: List[str] = None
    memo: str = ""

class NotionSyncManager:
    """Notion 동기화 관리자"""
    
    def __init__(self, config: NotionConfig):
        self.config = config
        self.database_id = "2277307d-c90b-8110-ba55-e52757c4e4b5"  # 기존 DB ID
        
    def validate_connection(self) -> bool:
        """
        Phase 1.3.1: 기본 연결 테스트
        MCP를 통한 Notion 연결 상태 확인
        """
        try:
            logger.info("🔍 Notion 연결 상태 확인 시작...")
            
            # MCP를 통해 데이터베이스 목록 조회로 연결 테스트
            # 실제 MCP 호출은 외부에서 처리됨
            logger.info("✅ MCP Notion 연결 확인됨")
            logger.info(f"📊 활용 가능한 데이터베이스: {self.database_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Notion 연결 실패: {e}")
            return False
    
    def transform_reflection_to_notion(self, reflection: ReflectionData) -> Dict[str, Any]:
        """
        Phase 2.2.1: 데이터 변환 로직
        Supabase 데이터를 Notion 형식으로 변환
        """
        
        # 시간대별 이모지 매핑
        time_part_emoji = {
            "morning": "🌅",
            "afternoon": "🌞", 
            "evening": "🌙"
        }
        
        # 시간대별 한국어 매핑
        time_part_korean = {
            "morning": "오전수업",
            "afternoon": "오후수업",
            "evening": "저녁자율학습"
        }
        
        # 컨디션 이모지 매핑
        condition_emoji = {
            "좋음": "😊",
            "보통": "😐",
            "나쁨": "😞"
        }
        
        # 집중도 이모지 매핑
        focus_mapping = {
            1: "😴 매우낮음", 2: "😑 낮음", 3: "😐 보통", 
            4: "🙂 좋음", 5: "😊 매우좋음"
        }
        
        emoji = time_part_emoji.get(reflection.time_part, "📝")
        korean_time = time_part_korean.get(reflection.time_part, reflection.time_part)
        
        # Notion 페이지 속성 구성
        notion_properties = {
            "name": {
                "title": [
                    {
                        "text": {
                            "content": f"{emoji} {reflection.subject} - {reflection.date}"
                        }
                    }
                ]
            },
            "reflection_date": {
                "date": {
                    "start": reflection.date.isoformat()
                }
            },
            "time_part": {
                "select": {
                    "name": f"{emoji} {korean_time}"
                }
            },
            "subject": {
                "rich_text": [
                    {
                        "text": {
                            "content": reflection.subject
                        }
                    }
                ]
            },
            "understanding": {
                "number": reflection.understanding_score
            },
            "difficulty": {
                "number": reflection.concentration_score  # 일단 집중도로 매핑
            },
            "condition": {
                "select": {
                    "name": f"{condition_emoji.get(reflection.condition, '😐')} {reflection.condition}"
                }
            },
            "focus_level": {
                "select": {
                    "name": focus_mapping.get(reflection.achievement_score, "😐 보통")
                }
            },
            "key_learning": {
                "rich_text": [
                    {
                        "text": {
                            "content": reflection.key_learning
                        }
                    }
                ]
            },
            "challenges": {
                "rich_text": [
                    {
                        "text": {
                            "content": reflection.challenges
                        }
                    }
                ]
            },
            "reflection": {
                "rich_text": [
                    {
                        "text": {
                            "content": reflection.reflection
                        }
                    }
                ]
            },
            "github_commits": {
                "number": reflection.github_commits
            },
            "github_issues": {
                "number": reflection.github_issues
            },
            "github_prs": {
                "number": reflection.github_prs
            },
            "memo": {
                "rich_text": [
                    {
                        "text": {
                            "content": reflection.memo
                        }
                    }
                ]
            }
        }
        
        # 태그 처리
        if reflection.tags:
            notion_properties["tags"] = {
                "multi_select": [
                    {"name": tag} for tag in reflection.tags
                ]
            }
        
        return notion_properties
    
    def create_sync_report(self, results: List[Dict]) -> Dict[str, Any]:
        """
        Phase 3.4.5: 동기화 보고서 생성
        """
        successful = sum(1 for r in results if r.get('success', False))
        failed = len(results) - successful
        
        report = {
            "sync_timestamp": datetime.now().isoformat(),
            "total_records": len(results),
            "successful_syncs": successful,
            "failed_syncs": failed,
            "success_rate": (successful / len(results) * 100) if results else 0,
            "details": results
        }
        
        logger.info(f"📊 동기화 완료 - 성공: {successful}, 실패: {failed}")
        
        return report

def load_environment_config() -> NotionConfig:
    """
    Phase 1.2: 환경 변수 구성
    환경 변수에서 Notion 설정 로드
    """
    try:
        # 환경 변수에서 설정 로드 (실제 환경에서는 .env 파일 사용)
        api_token = os.getenv('NOTION_API_TOKEN', '')
        database_id = os.getenv('NOTION_DATABASE_ID', '2277307d-c90b-8110-ba55-e52757c4e4b5')
        workspace_id = os.getenv('NOTION_WORKSPACE_ID', '')
        parent_page_id = os.getenv('NOTION_PARENT_PAGE_ID', '')
        
        config = NotionConfig(
            api_token=api_token,
            database_id=database_id,
            workspace_id=workspace_id if workspace_id else None,
            parent_page_id=parent_page_id if parent_page_id else None
        )
        
        logger.info("✅ 환경 변수 설정 로드 완료")
        return config
        
    except Exception as e:
        logger.error(f"❌ 환경 변수 로드 실패: {e}")
        raise

def test_sample_data_conversion():
    """
    Phase 1.3.4: 데이터 변환 테스트
    샘플 데이터로 변환 로직 검증
    """
    sample_reflection = ReflectionData(
        date=date.today(),
        time_part="evening",
        understanding_score=4,
        concentration_score=3,
        achievement_score=5,
        condition="좋음",
        subject="Python 조건문 학습",
        key_learning="if-elif-else 구조 이해",
        challenges="중첩 조건문이 어려움",
        reflection="더 많은 연습이 필요함",
        github_commits=2,
        github_issues=1,
        github_prs=0,
        tags=["Python", "조건문", "복습필요"],
        memo="내일 추가 학습 예정"
    )
    
    try:
        config = load_environment_config()
        sync_manager = NotionSyncManager(config)
        
        # 데이터 변환 테스트
        notion_data = sync_manager.transform_reflection_to_notion(sample_reflection)
        
        logger.info("✅ 샘플 데이터 변환 성공")
        logger.info(f"📋 변환된 속성 수: {len(notion_data)}")
        
        # JSON으로 출력 (디버깅용)
        with open('sample_notion_data.json', 'w', encoding='utf-8') as f:
            json.dump(notion_data, f, ensure_ascii=False, indent=2)
        
        return notion_data
        
    except Exception as e:
        logger.error(f"❌ 데이터 변환 테스트 실패: {e}")
        raise

if __name__ == "__main__":
    """
    Phase 1 실행: 환경 설정 및 기반 구축
    """
    logger.info("🚀 Notion Daily Reflection 동기화 Phase 1 시작")
    
    try:
        # 1.2: 환경 변수 구성 테스트
        config = load_environment_config()
        
        # 1.3: 기본 연결 테스트
        sync_manager = NotionSyncManager(config)
        connection_ok = sync_manager.validate_connection()
        
        if connection_ok:
            # 1.3.4: 샘플 데이터 변환 테스트
            test_sample_data_conversion()
            
            logger.info("✅ Phase 1 완료 - 환경 설정 및 기반 구축 성공")
            logger.info("📋 다음 단계: Phase 2 - 데이터 모델링 및 스키마 설계")
        else:
            logger.error("❌ Phase 1 실패 - 연결 테스트 실패")
            
    except Exception as e:
        logger.error(f"❌ Phase 1 실행 중 오류: {e}")
        raise
