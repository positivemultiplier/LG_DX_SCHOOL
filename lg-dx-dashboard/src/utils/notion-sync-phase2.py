# -*- coding: utf-8 -*-
"""
Notion Daily Reflection 동기화 도구 - Phase 2

Phase 2: 데이터 모델링 및 스키마 설계
- 2.1: Notion 데이터베이스 스키마 설계 
- 2.2: 데이터 변환 로직 구현
- 2.3: Notion 데이터베이스 생성

작성일: 2025-07-23
"""

import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import json
from datetime import datetime, time

# 타입 정의를 위한 임포트 (독립적으로 정의)
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

logger = logging.getLogger(__name__)

@dataclass 
class SupabaseReflectionSchema:
    """Supabase daily_reflections 테이블 스키마"""
    id: str
    user_id: str
    date: str  # DATE
    time_part: str  # 'morning', 'afternoon', 'evening'
    
    # 핵심 평가 지표 (1-10점)
    understanding_score: int
    concentration_score: int
    achievement_score: int
    
    # 컨디션 및 종합 점수
    condition: str  # '좋음', '보통', '나쁨'
    total_score: int  # GENERATED
    
    # 시간 관련
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    study_hours: Optional[float] = None
    
    # 학습 내용
    subject: Optional[str] = None
    key_topics: Optional[List[str]] = None
    difficulty_rating: Optional[int] = None
    
    # 텍스트 필드
    achievements: Optional[List[str]] = None
    challenges: Optional[List[str]] = None
    tomorrow_goals: Optional[List[str]] = None
    notes: Optional[str] = None
    
    # GitHub 활동 데이터
    github_commits: int = 0
    github_issues: int = 0
    github_prs: int = 0
    github_reviews: int = 0
    
    # 메타데이터
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class NotionDatabaseSchema:
    """Notion 데이터베이스 속성 스키마 정의"""
    
    @staticmethod
    def get_database_properties() -> Dict[str, Any]:
        """
        Phase 2.1.2: Notion 속성 타입별 스키마 정의
        3-Part Daily Reflection DB를 위한 완전한 속성 스키마
        """
        return {
            # 기본 정보 필드
            "name": {
                "title": {}
            },
            "reflection_date": {
                "date": {}
            },
            "time_part": {
                "select": {
                    "options": [
                        {
                            "name": "🌅 오전수업",
                            "color": "yellow"
                        },
                        {
                            "name": "🌞 오후수업", 
                            "color": "orange"
                        },
                        {
                            "name": "🌙 저녁자율학습",
                            "color": "blue"
                        }
                    ]
                }
            },
            
            # 시간 관련 필드
            "start_time": {
                "rich_text": {}
            },
            "end_time": {
                "rich_text": {}
            },
            "learning_hours": {
                "number": {
                    "format": "number_with_commas"
                }
            },
            
            # 학습 내용 필드
            "subject": {
                "rich_text": {}
            },
            "key_learning": {
                "rich_text": {}
            },
            "challenges": {
                "rich_text": {}
            },
            "reflection": {
                "rich_text": {}
            },
            
            # 성과 평가 필드
            "condition": {
                "select": {
                    "options": [
                        {
                            "name": "😊 좋음",
                            "color": "green"
                        },
                        {
                            "name": "😐 보통",
                            "color": "yellow"
                        },
                        {
                            "name": "😞 나쁨",
                            "color": "red"
                        }
                    ]
                }
            },
            "difficulty": {
                "number": {
                    "format": "number"
                }
            },
            "understanding": {
                "number": {
                    "format": "number"
                }
            },
            "focus_level": {
                "select": {
                    "options": [
                        {
                            "name": "😴 매우낮음",
                            "color": "red"
                        },
                        {
                            "name": "😑 낮음",
                            "color": "orange"
                        },
                        {
                            "name": "😐 보통",
                            "color": "yellow"
                        },
                        {
                            "name": "🙂 좋음",
                            "color": "blue"
                        },
                        {
                            "name": "😊 매우좋음",
                            "color": "green"
                        }
                    ]
                }
            },
            
            # GitHub 연동 필드
            "github_commits": {
                "number": {
                    "format": "number"
                }
            },
            "github_issues": {
                "number": {
                    "format": "number"
                }
            },
            "github_prs": {
                "number": {
                    "format": "number"
                }
            },
            "github_activities": {
                "rich_text": {}
            },
            
            # 계산 및 분석 필드
            "time_part_score": {
                "formula": {
                    "expression": "prop(\"understanding\") + prop(\"difficulty\") + prop(\"focus_level\")"
                }
            },
            "optimal_flag": {
                "checkbox": {}
            },
            
            # 메타데이터 및 태그 필드
            "tags": {
                "multi_select": {
                    "options": [
                        {
                            "name": "복습필요",
                            "color": "red"
                        },
                        {
                            "name": "고난이도",
                            "color": "orange"
                        },
                        {
                            "name": "코딩실습",
                            "color": "blue"
                        },
                        {
                            "name": "파이썬",
                            "color": "green"
                        },
                        {
                            "name": "자바스크립트",
                            "color": "purple"
                        },
                        {
                            "name": "데이터분석",
                            "color": "pink"
                        },
                        {
                            "name": "프로젝트",
                            "color": "brown"
                        },
                        {
                            "name": "이론학습",
                            "color": "gray"
                        }
                    ]
                }
            },
            "memo": {
                "rich_text": {}
            }
        }

class SupabaseToNotionMapper:
    """Supabase 데이터를 Notion 형식으로 변환하는 매퍼"""
    
    def __init__(self):
        self.time_part_mapping = {
            "morning": "🌅 오전수업",
            "afternoon": "🌞 오후수업", 
            "evening": "🌙 저녁자율학습"
        }
        
        self.condition_mapping = {
            "좋음": "😊 좋음",
            "보통": "😐 보통",
            "나쁨": "😞 나쁨"
        }
        
        self.focus_level_mapping = {
            1: "😴 매우낮음",
            2: "😑 낮음", 
            3: "😐 보통",
            4: "🙂 좋음",
            5: "😊 매우좋음"
        }
    
    def map_supabase_to_notion(self, supabase_data: SupabaseReflectionSchema) -> Dict[str, Any]:
        """
        Phase 2.2.1: transform_reflection_to_notion() 함수 완성
        Supabase 스키마를 Notion 속성으로 변환
        """
        
        # 제목 생성 (name은 title 속성)
        time_emoji = self.time_part_mapping.get(supabase_data.time_part, "📝").split()[0]
        title = f"{time_emoji} {supabase_data.subject or '일일 반성'} - {supabase_data.date}"
        
        notion_properties = {
            "name": {
                "title": [
                    {
                        "text": {
                            "content": title
                        }
                    }
                ]
            },
            "reflection_date": {
                "date": {
                    "start": supabase_data.date
                }
            },
            "time_part": {
                "select": {
                    "name": self.time_part_mapping.get(supabase_data.time_part, supabase_data.time_part)
                }
            },
            "understanding": {
                "number": supabase_data.understanding_score
            },
            "difficulty": {
                "number": supabase_data.difficulty_rating or supabase_data.concentration_score
            },
            "condition": {
                "select": {
                    "name": self.condition_mapping.get(supabase_data.condition, supabase_data.condition)
                }
            },
            "focus_level": {
                "select": {
                    "name": self.focus_level_mapping.get(supabase_data.achievement_score, "😐 보통")
                }
            },
            "github_commits": {
                "number": supabase_data.github_commits
            },
            "github_issues": {
                "number": supabase_data.github_issues
            },
            "github_prs": {
                "number": supabase_data.github_prs
            }
        }
        
        # 선택적 필드 처리
        if supabase_data.subject:
            notion_properties["subject"] = {
                "rich_text": [{"text": {"content": supabase_data.subject}}]
            }
            
        if supabase_data.key_topics:
            notion_properties["key_learning"] = {
                "rich_text": [{"text": {"content": ", ".join(supabase_data.key_topics)}}]
            }
            
        if supabase_data.challenges:
            notion_properties["challenges"] = {
                "rich_text": [{"text": {"content": ", ".join(supabase_data.challenges) if isinstance(supabase_data.challenges, list) else str(supabase_data.challenges)}}]
            }
            
        if supabase_data.notes:
            notion_properties["reflection"] = {
                "rich_text": [{"text": {"content": supabase_data.notes}}]
            }
            
        if supabase_data.start_time and supabase_data.end_time:
            notion_properties["start_time"] = {
                "rich_text": [{"text": {"content": str(supabase_data.start_time)}}]
            }
            notion_properties["end_time"] = {
                "rich_text": [{"text": {"content": str(supabase_data.end_time)}}]
            }
            
        if supabase_data.study_hours:
            notion_properties["learning_hours"] = {
                "number": supabase_data.study_hours
            }
            
        # GitHub 활동 요약
        if any([supabase_data.github_commits, supabase_data.github_issues, supabase_data.github_prs]):
            github_summary = f"커밋: {supabase_data.github_commits}, 이슈: {supabase_data.github_issues}, PR: {supabase_data.github_prs}"
            notion_properties["github_activities"] = {
                "rich_text": [{"text": {"content": github_summary}}]
            }
            
        # 최적 플래그 설정 (종합 점수 8점 이상)
        total_score = supabase_data.understanding_score + supabase_data.concentration_score + supabase_data.achievement_score
        notion_properties["optimal_flag"] = {
            "checkbox": total_score >= 24  # 30점 만점에서 80% 이상
        }
        
        return notion_properties
    
    def validate_data_types(self, notion_data: Dict[str, Any]) -> bool:
        """
        Phase 2.2.2: 데이터 타입 검증 로직 추가
        """
        try:
            # 필수 필드 검증
            required_fields = ["name", "reflection_date", "time_part"]
            for field in required_fields:
                if field not in notion_data:
                    logger.error(f"❌ 필수 필드 누락: {field}")
                    return False
            
            # 숫자 필드 검증
            number_fields = ["understanding", "difficulty", "github_commits", "github_issues", "github_prs"]
            for field in number_fields:
                if field in notion_data:
                    value = notion_data[field].get("number")
                    if value is not None and not isinstance(value, (int, float)):
                        logger.error(f"❌ 숫자 필드 타입 오류: {field} = {value}")
                        return False
            
            # 날짜 필드 검증
            if "reflection_date" in notion_data:
                date_value = notion_data["reflection_date"].get("date", {}).get("start")
                if date_value:
                    try:
                        datetime.fromisoformat(date_value)
                    except ValueError:
                        logger.error(f"❌ 날짜 형식 오류: {date_value}")
                        return False
            
            logger.info("✅ 데이터 타입 검증 통과")
            return True
            
        except Exception as e:
            logger.error(f"❌ 데이터 검증 중 오류: {e}")
            return False

def create_sample_supabase_data() -> List[SupabaseReflectionSchema]:
    """Phase 2 테스트용 샘플 Supabase 데이터 생성"""
    samples = [
        SupabaseReflectionSchema(
            id="sample1",
            user_id="user123",
            date="2025-07-23",
            time_part="morning",
            understanding_score=8,
            concentration_score=7,
            achievement_score=9,
            condition="좋음",
            total_score=24,
            subject="Python 기초",
            key_topics=["변수", "데이터타입"],
            achievements=["기본 문법 이해"],
            challenges=["타입 변환 어려움"],
            notes="전반적으로 잘 이해함",
            github_commits=3,
            github_issues=1,
            github_prs=0
        ),
        SupabaseReflectionSchema(
            id="sample2", 
            user_id="user123",
            date="2025-07-23",
            time_part="afternoon",
            understanding_score=6,
            concentration_score=5,
            achievement_score=7,
            condition="보통",
            total_score=18,
            subject="JavaScript DOM",
            key_topics=["DOM 조작", "이벤트"],
            achievements=["버튼 클릭 이벤트 구현"],
            challenges=["비동기 처리 복잡함"],
            notes="더 많은 연습 필요",
            github_commits=2,
            github_issues=2,
            github_prs=1
        ),
        SupabaseReflectionSchema(
            id="sample3",
            user_id="user123", 
            date="2025-07-23",
            time_part="evening",
            understanding_score=9,
            concentration_score=8,
            achievement_score=10,
            condition="좋음",
            total_score=27,
            subject="데이터 분석",
            key_topics=["pandas", "matplotlib"],
            achievements=["차트 생성 완료"],
            challenges=["데이터 전처리"],
            notes="매우 만족스러운 학습",
            github_commits=5,
            github_issues=0,
            github_prs=2
        )
    ]
    
    return samples

def test_phase2_data_mapping():
    """Phase 2 데이터 매핑 테스트"""
    logger.info("🧪 Phase 2 데이터 매핑 테스트 시작")
    
    try:
        # 샘플 데이터 생성
        sample_data = create_sample_supabase_data()
        mapper = SupabaseToNotionMapper()
        
        # 각 샘플 데이터를 Notion 형식으로 변환
        converted_data = []
        for data in sample_data:
            notion_data = mapper.map_supabase_to_notion(data)
            
            # 데이터 검증
            if mapper.validate_data_types(notion_data):
                converted_data.append({
                    "supabase_id": data.id,
                    "notion_properties": notion_data
                })
                logger.info(f"✅ 변환 성공: {data.id} ({data.time_part})")
            else:
                logger.error(f"❌ 변환 실패: {data.id}")
        
        # 결과 저장
        with open('phase2_mapping_results.json', 'w', encoding='utf-8') as f:
            json.dump(converted_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"📊 Phase 2 테스트 완료 - 성공: {len(converted_data)}/{len(sample_data)}")
        
        return converted_data
        
    except Exception as e:
        logger.error(f"❌ Phase 2 테스트 실패: {e}")
        raise

if __name__ == "__main__":
    """Phase 2 실행: 데이터 모델링 및 스키마 설계"""
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger.info("🚀 Notion Daily Reflection Phase 2 시작")
    
    try:
        # 2.1: Notion 데이터베이스 스키마 확인
        schema = NotionDatabaseSchema.get_database_properties()
        logger.info(f"📋 데이터베이스 속성 스키마: {len(schema)}개 필드")
        
        # 2.2: 데이터 변환 로직 테스트
        test_results = test_phase2_data_mapping()
        
        if test_results:
            logger.info("✅ Phase 2 완료 - 데이터 모델링 및 스키마 설계 성공")
            logger.info("📋 다음 단계: Phase 3 - 동기화 로직 구현")
        else:
            logger.error("❌ Phase 2 실패")
            
    except Exception as e:
        logger.error(f"❌ Phase 2 실행 중 오류: {e}")
        raise
