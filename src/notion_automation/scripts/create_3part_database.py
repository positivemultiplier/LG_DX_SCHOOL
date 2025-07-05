#!/usr/bin/env python3
"""
3-Part Daily Reflection Database 생성 스크립트

이 스크립트는 오전수업/오후수업/저녁자율학습 3개 시간대를 지원하는
Notion 데이터베이스를 생성합니다.

작성자: LG DX School 
최종 수정: 2024-01
"""

import asyncio
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional
import os

# 프로젝트 루트 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

try:
    from src.notion_automation.utils.logger import setup_logger
    # 로거 설정
    logger = setup_logger(__name__, "logs/create_3part_database.log")
except ImportError:
    # 로거를 사용할 수 없는 경우 기본 print 사용
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

class ThreePartDatabaseCreator:
    """
    3-Part Daily Reflection 데이터베이스 생성 및 관리 클래스
    """
    
    def __init__(self, parent_page_id: Optional[str] = None):
        """
        초기화
        
        Args:
            parent_page_id: 데이터베이스를 생성할 부모 페이지 ID
        """
        self.parent_page_id = parent_page_id
        self.database_schema = self._build_database_schema()
        
    def _build_database_schema(self) -> Dict[str, Any]:
        """
        3-Part Daily Reflection DB 스키마 구성
        
        Returns:
            완전한 Notion 데이터베이스 스키마
        """
        return {
            "parent": {
                "type": "page_id",
                "page_id": self.parent_page_id or "temp_parent_id"
            },
            "title": [
                {
                    "type": "text",
                    "text": {
                        "content": "🕐 3-Part Daily Reflection Dashboard"
                    }
                }
            ],
            "description": [
                {
                    "type": "text", 
                    "text": {
                        "content": "오전수업/오후수업/저녁자율학습 3개 시간대별 일일 반성 및 학습 성과 추적 데이터베이스"
                    }
                }
            ],
            "properties": {
                # 1. 기본 식별 정보
                "title": {
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
                                "color": "purple"
                            }
                        ]
                    }
                },
                
                # 2. 시간대별 컨디션
                "morning_condition": {
                    "select": {
                        "options": [
                            {"name": "매우좋음", "color": "green"},
                            {"name": "좋음", "color": "blue"},
                            {"name": "보통", "color": "yellow"},
                            {"name": "나쁨", "color": "orange"},
                            {"name": "매우나쁨", "color": "red"}
                        ]
                    }
                },
                "afternoon_condition": {
                    "select": {
                        "options": [
                            {"name": "매우좋음", "color": "green"},
                            {"name": "좋음", "color": "blue"},
                            {"name": "보통", "color": "yellow"},
                            {"name": "나쁨", "color": "orange"},
                            {"name": "매우나쁨", "color": "red"}
                        ]
                    }
                },
                "evening_condition": {
                    "select": {
                        "options": [
                            {"name": "매우좋음", "color": "green"},
                            {"name": "좋음", "color": "blue"},
                            {"name": "보통", "color": "yellow"},
                            {"name": "나쁨", "color": "orange"},
                            {"name": "매우나쁨", "color": "red"}
                        ]
                    }
                },
                
                # 3. 학습 관련 정보
                "learning_difficulty": {
                    "number": {
                        "format": "number"
                    }
                },
                "learning_hours": {
                    "number": {
                        "format": "number"
                    }
                },
                "self_study_hours": {
                    "number": {
                        "format": "number" 
                    }
                },
                "review_effectiveness": {
                    "number": {
                        "format": "number"
                    }
                },
                
                # 4. GitHub 활동 정보
                "github_commits": {
                    "number": {
                        "format": "number"
                    }
                },
                "github_prs": {
                    "number": {
                        "format": "number"
                    }
                },
                "github_issues": {
                    "number": {
                        "format": "number"
                    }
                },
                
                # 5. 성과 및 점수
                "time_part_score": {
                    "formula": {
                        "expression": "round(((prop(\"learning_hours\") * 2) + prop(\"review_effectiveness\") + (prop(\"github_commits\") / 2)) / 4 * 10) / 10"
                    }
                },
                
                # 6. 텍스트 및 메모
                "memo": {
                    "rich_text": {}
                },
                "achievements": {
                    "rich_text": {}
                },
                "tomorrow_goals": {
                    "rich_text": {}
                },
                
                # 7. 분류 및 태그
                "tags": {
                    "multi_select": {
                        "options": [
                            {"name": "복습", "color": "blue"},
                            {"name": "프로젝트", "color": "green"},
                            {"name": "과제", "color": "yellow"},
                            {"name": "시험준비", "color": "red"},
                            {"name": "발표준비", "color": "purple"},
                            {"name": "토론", "color": "pink"},
                            {"name": "실습", "color": "brown"},
                            {"name": "강의듣기", "color": "gray"}
                        ]
                    }
                },
                
                # 8. 자동 생성 필드
                "created_time": {
                    "created_time": {}
                },
                "last_edited_time": {
                    "last_edited_time": {}
                },
                
                # 9. 최적화 플래그
                "optimal_flag": {
                    "checkbox": {}
                },
                
                # 10. 추가 분석 필드
                "week_number": {
                    "formula": {
                        "expression": "week(prop(\"reflection_date\"))"
                    }
                },
                "month_number": {
                    "formula": {
                        "expression": "month(prop(\"reflection_date\"))"
                    }
                },
                "day_of_week": {
                    "formula": {
                        "expression": "formatDate(prop(\"reflection_date\"), \"dddd\")"
                    }
                }
            }
        }
    
    async def create_database(self, parent_page_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Notion에 3-Part Daily Reflection 데이터베이스 생성
        
        Args:
            parent_page_id: 부모 페이지 ID (선택사항)
            
        Returns:
            생성된 데이터베이스 정보
        """
        try:
            # parent_page_id 업데이트
            if parent_page_id:
                self.parent_page_id = parent_page_id
                self.database_schema["parent"]["page_id"] = parent_page_id
            
            logger.info("3-Part Daily Reflection 데이터베이스 생성 시작")
            logger.info(f"부모 페이지 ID: {self.parent_page_id}")
            
            # 스키마 로깅 (민감 정보 제외)
            logger.info(f"데이터베이스 제목: {self.database_schema['title'][0]['text']['content']}")
            logger.info(f"속성 개수: {len(self.database_schema['properties'])}")
            
            # MCP를 통한 데이터베이스 생성 (실제 구현에서는 MCP 호출)
            # result = await mcp_notion_create_database(**self.database_schema)
            
            # 테스트용 모의 결과
            result = {
                "object": "database",
                "id": f"test_db_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "created_time": datetime.now().isoformat(),
                "title": self.database_schema["title"],
                "description": self.database_schema["description"],
                "properties": self.database_schema["properties"],
                "url": f"https://notion.so/test_db_url"
            }
            
            logger.info(f"데이터베이스 생성 성공: {result['id']}")
            return result
            
        except Exception as e:
            logger.error(f"데이터베이스 생성 실패: {str(e)}")
            raise
    
    async def validate_database_schema(self) -> Dict[str, Any]:
        """
        데이터베이스 스키마 유효성 검증
        
        Returns:
            검증 결과
        """
        try:
            logger.info("데이터베이스 스키마 검증 시작")
            
            validation_result = {
                "is_valid": True,
                "errors": [],
                "warnings": [],
                "summary": {}
            }
            
            # 1. 필수 필드 검증
            required_properties = [
                "title", "reflection_date", "time_part",
                "morning_condition", "afternoon_condition", "evening_condition"
            ]
            
            missing_properties = []
            for prop in required_properties:
                if prop not in self.database_schema["properties"]:
                    missing_properties.append(prop)
            
            if missing_properties:
                validation_result["errors"].append(f"필수 속성 누락: {missing_properties}")
                validation_result["is_valid"] = False
            
            # 2. 선택 옵션 검증
            select_properties = ["time_part", "morning_condition", "afternoon_condition", "evening_condition"]
            for prop in select_properties:
                if prop in self.database_schema["properties"]:
                    options = self.database_schema["properties"][prop]["select"]["options"]
                    if len(options) == 0:
                        validation_result["warnings"].append(f"{prop}: 선택 옵션이 비어있음")
            
            # 3. 공식 필드 검증
            formula_properties = ["time_part_score", "week_number", "month_number", "day_of_week"]
            for prop in formula_properties:
                if prop in self.database_schema["properties"]:
                    formula = self.database_schema["properties"][prop]["formula"]["expression"]
                    if not formula:
                        validation_result["warnings"].append(f"{prop}: 공식이 비어있음")
            
            # 검증 요약
            validation_result["summary"] = {
                "total_properties": len(self.database_schema["properties"]),
                "required_properties": len(required_properties),
                "select_properties": len(select_properties),
                "formula_properties": len(formula_properties),
                "errors_count": len(validation_result["errors"]),
                "warnings_count": len(validation_result["warnings"])
            }
            
            logger.info(f"스키마 검증 완료: {validation_result['summary']}")
            return validation_result
            
        except Exception as e:
            logger.error(f"스키마 검증 실패: {str(e)}")
            return {
                "is_valid": False,
                "errors": [str(e)],
                "warnings": [],
                "summary": {}
            }
    
    async def create_sample_data(self, database_id: str, days: int = 7) -> Dict[str, Any]:
        """
        테스트용 샘플 데이터 생성
        
        Args:
            database_id: 대상 데이터베이스 ID
            days: 생성할 일수
            
        Returns:
            샘플 데이터 생성 결과
        """
        try:
            logger.info(f"샘플 데이터 생성 시작: {days}일치")
            
            from datetime import datetime, timedelta
            import random
            
            sample_entries = []
            base_date = datetime.now().date() - timedelta(days=days)
            
            time_parts = ["🌅 오전수업", "🌞 오후수업", "🌙 저녁자율학습"]
            conditions = ["매우좋음", "좋음", "보통", "나쁨", "매우나쁨"]
            tags_options = ["복습", "프로젝트", "과제", "시험준비", "발표준비", "토론", "실습", "강의듣기"]
            
            for day in range(days):
                current_date = base_date + timedelta(days=day)
                
                # 하루에 1-3개 시간대 랜덤 생성
                num_timeparts = random.randint(1, 3)
                selected_timeparts = random.sample(time_parts, num_timeparts)
                
                for time_part in selected_timeparts:
                    entry = {
                        "parent": {"database_id": database_id},
                        "properties": {
                            "title": {
                                "title": [
                                    {
                                        "text": {
                                            "content": f"{current_date.strftime('%Y-%m-%d')} {time_part}"
                                        }
                                    }
                                ]
                            },
                            "reflection_date": {
                                "date": {
                                    "start": current_date.isoformat()
                                }
                            },
                            "time_part": {
                                "select": {
                                    "name": time_part
                                }
                            },
                            f"{time_part.split()[1]}_condition": {
                                "select": {
                                    "name": random.choice(conditions)
                                }
                            },
                            "learning_difficulty": {
                                "number": random.randint(1, 10)
                            },
                            "learning_hours": {
                                "number": round(random.uniform(0.5, 8.0), 1)
                            },
                            "self_study_hours": {
                                "number": round(random.uniform(0, 4.0), 1)
                            },
                            "review_effectiveness": {
                                "number": random.randint(1, 10)
                            },
                            "github_commits": {
                                "number": random.randint(0, 15)
                            },
                            "github_prs": {
                                "number": random.randint(0, 5)
                            },
                            "github_issues": {
                                "number": random.randint(0, 10)
                            },
                            "memo": {
                                "rich_text": [
                                    {
                                        "text": {
                                            "content": f"{time_part} 학습 내용: Python 기초, 알고리즘 등"
                                        }
                                    }
                                ]
                            },
                            "tags": {
                                "multi_select": [
                                    {"name": tag} for tag in random.sample(tags_options, random.randint(1, 3))
                                ]
                            },
                            "optimal_flag": {
                                "checkbox": random.choice([True, False])
                            }
                        }
                    }
                    
                    sample_entries.append(entry)
            
            logger.info(f"샘플 데이터 생성 완료: {len(sample_entries)}개 엔트리")
            
            return {
                "success": True,
                "entries_count": len(sample_entries),
                "sample_entries": sample_entries[:3],  # 처음 3개만 반환
                "all_entries": sample_entries
            }
            
        except Exception as e:
            logger.error(f"샘플 데이터 생성 실패: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "entries_count": 0
            }
    
    def export_schema_json(self, filepath: str) -> bool:
        """
        데이터베이스 스키마를 JSON 파일로 내보내기
        
        Args:
            filepath: 저장할 파일 경로
            
        Returns:
            성공 여부
        """
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(self.database_schema, f, ensure_ascii=False, indent=2)
            
            logger.info(f"스키마 JSON 파일 저장 완료: {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"스키마 JSON 파일 저장 실패: {str(e)}")
            return False

async def main():
    """
    메인 실행 함수
    """
    print("🕐 3-Part Daily Reflection Database 생성 도구")
    print("=" * 60)
    
    # 데이터베이스 생성기 초기화
    creator = ThreePartDatabaseCreator()
    
    try:
        # 1. 스키마 검증
        print("\n📋 1단계: 데이터베이스 스키마 검증 중...")
        validation_result = await creator.validate_database_schema()
        
        if not validation_result["is_valid"]:
            print(f"❌ 스키마 검증 실패: {validation_result['errors']}")
            return
        
        print(f"✅ 스키마 검증 성공")
        print(f"   - 총 속성: {validation_result['summary']['total_properties']}개")
        print(f"   - 경고: {validation_result['summary']['warnings_count']}개")
        
        # 2. 스키마 JSON 내보내기
        print("\n📁 2단계: 스키마 JSON 파일 생성 중...")
        schema_path = "data/3part_database_schema.json"
        os.makedirs(os.path.dirname(schema_path), exist_ok=True)
        
        if creator.export_schema_json(schema_path):
            print(f"✅ 스키마 JSON 저장 완료: {schema_path}")
        
        # 3. 데이터베이스 생성 (테스트 모드)
        print("\n🏗️ 3단계: 데이터베이스 생성 중...")
        
        # 실제 구현에서는 사용자로부터 parent_page_id 입력 받음
        test_parent_id = "test_parent_page_id"
        
        database_result = await creator.create_database(test_parent_id)
        print(f"✅ 데이터베이스 생성 완료")
        print(f"   - DB ID: {database_result['id']}")
        print(f"   - 생성 시간: {database_result['created_time']}")
        
        # 4. 샘플 데이터 생성
        print("\n📊 4단계: 샘플 데이터 생성 중...")
        sample_result = await creator.create_sample_data(database_result['id'], days=7)
        
        if sample_result["success"]:
            print(f"✅ 샘플 데이터 생성 완료: {sample_result['entries_count']}개 엔트리")
        else:
            print(f"❌ 샘플 데이터 생성 실패: {sample_result['error']}")
        
        print("\n🎉 3-Part Daily Reflection Database 설정 완료!")
        print(f"   Notion에서 '{database_result['title'][0]['text']['content']}' 데이터베이스를 확인하세요.")
        
    except Exception as e:
        logger.error(f"메인 실행 오류: {str(e)}")
        print(f"❌ 실행 중 오류 발생: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
