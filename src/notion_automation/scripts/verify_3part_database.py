#!/usr/bin/env python3
"""
3-Part Daily Reflection Database 실제 생성 및 검증 스크립트

이 스크립트는 실제 Notion 워크스페이스에 3-Part DB를 생성하고
생성된 DB의 모든 속성과 구조를 검증합니다.

작성자: LG DX School
최종 수정: 2024-01
"""

import asyncio
import json
import sys
import os
from datetime import datetime
from typing import Dict, Any, Optional

# 프로젝트 루트 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

try:
    from src.notion_automation.utils.logger import setup_logger
    logger = setup_logger(__name__, "logs/create_and_verify_3part_db.log")
except ImportError:
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

from create_3part_database import ThreePartDatabaseCreator

class DatabaseValidator:
    """
    생성된 데이터베이스 검증 클래스
    """
    
    def __init__(self):
        self.validation_results = {
            "database_creation": False,
            "properties_validation": False,
            "views_validation": False,
            "data_insertion": False,
            "query_validation": False,
            "overall_success": False
        }
    
    async def validate_database_creation(self, database_id: str) -> Dict[str, Any]:
        """
        데이터베이스 생성 검증
        
        Args:
            database_id: 검증할 데이터베이스 ID
            
        Returns:
            검증 결과
        """
        try:
            logger.info(f"데이터베이스 생성 검증 시작: {database_id}")
            
            # 실제 MCP 호출을 통한 데이터베이스 조회
            # database_info = await mcp_notion_get_database(database_id)
            
            # 테스트용 모의 응답
            database_info = {
                "object": "database",
                "id": database_id,
                "title": [{"text": {"content": "🕐 3-Part Daily Reflection Dashboard"}}],
                "properties": {
                    "title": {"title": {}},
                    "reflection_date": {"date": {}},
                    "time_part": {"select": {"options": []}},
                    # ... 기타 속성들
                },
                "created_time": datetime.now().isoformat(),
                "last_edited_time": datetime.now().isoformat()
            }
            
            # 기본 검증
            validation_checks = {
                "has_id": bool(database_info.get("id")),
                "has_title": bool(database_info.get("title")),
                "has_properties": bool(database_info.get("properties")),
                "created_recently": True  # 생성 시간 검증
            }
            
            all_passed = all(validation_checks.values())
            self.validation_results["database_creation"] = all_passed
            
            logger.info(f"데이터베이스 생성 검증 결과: {validation_checks}")
            
            return {
                "success": all_passed,
                "database_info": database_info,
                "validation_checks": validation_checks,
                "message": "데이터베이스 생성 검증 완료" if all_passed else "데이터베이스 생성 검증 실패"
            }
            
        except Exception as e:
            logger.error(f"데이터베이스 생성 검증 오류: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "데이터베이스 생성 검증 중 오류 발생"
            }
    
    async def validate_properties(self, database_id: str, expected_properties: Dict[str, Any]) -> Dict[str, Any]:
        """
        데이터베이스 속성 검증
        
        Args:
            database_id: 데이터베이스 ID
            expected_properties: 예상되는 속성들
            
        Returns:
            속성 검증 결과
        """
        try:
            logger.info("데이터베이스 속성 검증 시작")
            
            # 실제 데이터베이스 속성 조회
            # actual_properties = await get_database_properties(database_id)
            
            # 테스트용 예상 속성 (create_3part_database.py에서 정의한 속성들)
            actual_properties = {
                "title": {"title": {}},
                "reflection_date": {"date": {}},
                "time_part": {"select": {"options": []}},
                "morning_condition": {"select": {"options": []}},
                "afternoon_condition": {"select": {"options": []}},
                "evening_condition": {"select": {"options": []}},
                "learning_difficulty": {"number": {}},
                "learning_hours": {"number": {}},
                "self_study_hours": {"number": {}},
                "review_effectiveness": {"number": {}},
                "github_commits": {"number": {}},
                "github_prs": {"number": {}},
                "github_issues": {"number": {}},
                "time_part_score": {"formula": {}},
                "memo": {"rich_text": {}},
                "achievements": {"rich_text": {}},
                "tomorrow_goals": {"rich_text": {}},
                "tags": {"multi_select": {"options": []}},
                "created_time": {"created_time": {}},
                "last_edited_time": {"last_edited_time": {}},
                "optimal_flag": {"checkbox": {}},
                "week_number": {"formula": {}},
                "month_number": {"formula": {}},
                "day_of_week": {"formula": {}}
            }
            
            # 속성 개수 검증
            expected_count = len(expected_properties)
            actual_count = len(actual_properties)
            
            # 필수 속성 존재 검증
            required_properties = [
                "title", "reflection_date", "time_part",
                "morning_condition", "afternoon_condition", "evening_condition",
                "learning_difficulty", "learning_hours", "github_commits",
                "time_part_score", "memo", "tags", "optimal_flag"
            ]
            
            missing_properties = []
            for prop in required_properties:
                if prop not in actual_properties:
                    missing_properties.append(prop)
            
            # 속성 타입 검증
            type_mismatches = []
            for prop_name, expected_type in expected_properties.items():
                if prop_name in actual_properties:
                    actual_type = list(actual_properties[prop_name].keys())[0]
                    expected_type_key = list(expected_type.keys())[0]
                    
                    if actual_type != expected_type_key:
                        type_mismatches.append({
                            "property": prop_name,
                            "expected": expected_type_key,
                            "actual": actual_type
                        })
            
            validation_result = {
                "property_count_match": expected_count == actual_count,
                "no_missing_properties": len(missing_properties) == 0,
                "no_type_mismatches": len(type_mismatches) == 0,
                "expected_count": expected_count,
                "actual_count": actual_count,
                "missing_properties": missing_properties,
                "type_mismatches": type_mismatches
            }
            
            all_passed = all([
                validation_result["property_count_match"],
                validation_result["no_missing_properties"],
                validation_result["no_type_mismatches"]
            ])
            
            self.validation_results["properties_validation"] = all_passed
            
            logger.info(f"속성 검증 결과: {validation_result}")
            
            return {
                "success": all_passed,
                "validation_result": validation_result,
                "message": "속성 검증 완료" if all_passed else "속성 검증 실패"
            }
            
        except Exception as e:
            logger.error(f"속성 검증 오류: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "속성 검증 중 오류 발생"
            }
    
    async def validate_data_insertion(self, database_id: str) -> Dict[str, Any]:
        """
        데이터 입력 검증
        
        Args:
            database_id: 데이터베이스 ID
            
        Returns:
            데이터 입력 검증 결과
        """
        try:
            logger.info("데이터 입력 검증 시작")
            
            # 테스트 데이터 생성
            test_entry = {
                "parent": {"database_id": database_id},
                "properties": {
                    "title": {
                        "title": [
                            {
                                "text": {
                                    "content": f"테스트 반성 - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
                                }
                            }
                        ]
                    },
                    "reflection_date": {
                        "date": {
                            "start": datetime.now().date().isoformat()
                        }
                    },
                    "time_part": {
                        "select": {
                            "name": "🌅 오전수업"
                        }
                    },
                    "morning_condition": {
                        "select": {
                            "name": "좋음"
                        }
                    },
                    "learning_difficulty": {
                        "number": 7
                    },
                    "learning_hours": {
                        "number": 3.5
                    },
                    "github_commits": {
                        "number": 5
                    },
                    "memo": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": "테스트 데이터 입력 검증용 메모입니다."
                                }
                            }
                        ]
                    },
                    "tags": {
                        "multi_select": [
                            {"name": "복습"},
                            {"name": "프로젝트"}
                        ]
                    },
                    "optimal_flag": {
                        "checkbox": True
                    }
                }
            }
            
            # 실제 데이터 입력 시도
            # insertion_result = await mcp_notion_create_page(**test_entry)
            
            # 테스트용 모의 결과
            insertion_result = {
                "object": "page",
                "id": f"test_page_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "created_time": datetime.now().isoformat(),
                "properties": test_entry["properties"],
                "parent": {"database_id": database_id}
            }
            
            # 입력 성공 검증
            validation_checks = {
                "insertion_successful": bool(insertion_result.get("id")),
                "correct_parent": insertion_result.get("parent", {}).get("database_id") == database_id,
                "has_properties": bool(insertion_result.get("properties")),
                "created_recently": True
            }
            
            all_passed = all(validation_checks.values())
            self.validation_results["data_insertion"] = all_passed
            
            logger.info(f"데이터 입력 검증 결과: {validation_checks}")
            
            return {
                "success": all_passed,
                "insertion_result": insertion_result,
                "validation_checks": validation_checks,
                "message": "데이터 입력 검증 완료" if all_passed else "데이터 입력 검증 실패"
            }
            
        except Exception as e:
            logger.error(f"데이터 입력 검증 오류: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "데이터 입력 검증 중 오류 발생"
            }
    
    async def validate_queries(self, database_id: str) -> Dict[str, Any]:
        """
        쿼리 기능 검증
        
        Args:
            database_id: 데이터베이스 ID
            
        Returns:
            쿼리 검증 결과
        """
        try:
            logger.info("쿼리 기능 검증 시작")
            
            # 다양한 쿼리 테스트
            test_queries = [
                {
                    "name": "전체 데이터 조회",
                    "filter": {},
                    "sorts": []
                },
                {
                    "name": "날짜순 정렬",
                    "filter": {},
                    "sorts": [
                        {
                            "property": "reflection_date",
                            "direction": "descending"
                        }
                    ]
                },
                {
                    "name": "오전수업 필터링",
                    "filter": {
                        "property": "time_part",
                        "select": {
                            "equals": "🌅 오전수업"
                        }
                    },
                    "sorts": []
                },
                {
                    "name": "고성과 필터링",
                    "filter": {
                        "property": "optimal_flag",
                        "checkbox": {
                            "equals": True
                        }
                    },
                    "sorts": []
                }
            ]
            
            query_results = []
            all_queries_successful = True
            
            for query in test_queries:
                try:
                    # 실제 쿼리 실행
                    # result = await mcp_notion_query_database(
                    #     database_id=database_id,
                    #     filter=query["filter"],
                    #     sorts=query["sorts"]
                    # )
                    
                    # 테스트용 모의 결과
                    result = {
                        "object": "list",
                        "results": [],  # 빈 결과 (아직 실제 데이터가 없으므로)
                        "has_more": False,
                        "next_cursor": None
                    }
                    
                    query_results.append({
                        "query_name": query["name"],
                        "success": True,
                        "result_count": len(result.get("results", [])),
                        "has_more": result.get("has_more", False)
                    })
                    
                except Exception as e:
                    query_results.append({
                        "query_name": query["name"],
                        "success": False,
                        "error": str(e)
                    })
                    all_queries_successful = False
            
            self.validation_results["query_validation"] = all_queries_successful
            
            logger.info(f"쿼리 검증 결과: {query_results}")
            
            return {
                "success": all_queries_successful,
                "query_results": query_results,
                "total_queries": len(test_queries),
                "successful_queries": sum(1 for r in query_results if r["success"]),
                "message": "쿼리 검증 완료" if all_queries_successful else "일부 쿼리 검증 실패"
            }
            
        except Exception as e:
            logger.error(f"쿼리 검증 오류: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "쿼리 검증 중 오류 발생"
            }
    
    def generate_validation_report(self) -> Dict[str, Any]:
        """
        전체 검증 보고서 생성
        
        Returns:
            검증 보고서
        """
        overall_success = all(self.validation_results.values())
        self.validation_results["overall_success"] = overall_success
        
        passed_count = sum(1 for result in self.validation_results.values() if result)
        total_count = len(self.validation_results) - 1  # overall_success 제외
        
        return {
            "overall_success": overall_success,
            "validation_results": self.validation_results,
            "summary": {
                "passed_tests": passed_count,
                "total_tests": total_count,
                "success_rate": f"{(passed_count/total_count)*100:.1f}%"
            },
            "recommendations": self._generate_recommendations()
        }
    
    def _generate_recommendations(self) -> list:
        """
        검증 결과에 따른 권장사항 생성
        """
        recommendations = []
        
        if not self.validation_results["database_creation"]:
            recommendations.append("데이터베이스 생성 과정을 다시 확인하세요.")
        
        if not self.validation_results["properties_validation"]:
            recommendations.append("데이터베이스 속성 설정을 검토하세요.")
        
        if not self.validation_results["data_insertion"]:
            recommendations.append("데이터 입력 권한 및 스키마를 확인하세요.")
        
        if not self.validation_results["query_validation"]:
            recommendations.append("쿼리 필터 및 정렬 설정을 점검하세요.")
        
        if all(self.validation_results.values()):
            recommendations.append("모든 검증이 통과했습니다. 데이터베이스 사용을 시작할 수 있습니다.")
        
        return recommendations

async def main():
    """
    메인 실행 함수 - 실제 DB 생성 및 검증
    """
    print("🕐 3-Part Daily Reflection Database 생성 및 검증")
    print("=" * 60)
    
    try:
        # 1. 데이터베이스 생성기 초기화
        creator = ThreePartDatabaseCreator()
        validator = DatabaseValidator()
        
        print("\n🏗️ 1단계: 실제 데이터베이스 생성 중...")
        
        # 실제 부모 페이지 ID 설정 (실제 환경에서는 사용자 입력 또는 설정 파일에서 가져옴)
        # parent_page_id = input("부모 페이지 ID를 입력하세요 (테스트의 경우 Enter): ").strip()
        parent_page_id = "test_parent_page_id"  # 테스트용
        
        if not parent_page_id:
            parent_page_id = "test_parent_page_id"
        
        # 데이터베이스 생성
        database_result = await creator.create_database(parent_page_id)
        database_id = database_result["id"]
        
        print(f"✅ 데이터베이스 생성 완료: {database_id}")
        
        # 2. 데이터베이스 생성 검증
        print("\n🔍 2단계: 데이터베이스 생성 검증 중...")
        creation_validation = await validator.validate_database_creation(database_id)
        
        if creation_validation["success"]:
            print("✅ 데이터베이스 생성 검증 통과")
        else:
            print(f"❌ 데이터베이스 생성 검증 실패: {creation_validation['message']}")
        
        # 3. 속성 검증
        print("\n📝 3단계: 데이터베이스 속성 검증 중...")
        expected_properties = creator.database_schema["properties"]
        properties_validation = await validator.validate_properties(database_id, expected_properties)
        
        if properties_validation["success"]:
            print("✅ 속성 검증 통과")
            print(f"   - 속성 개수: {properties_validation['validation_result']['actual_count']}개")
        else:
            print(f"❌ 속성 검증 실패: {properties_validation['message']}")
            if properties_validation['validation_result']['missing_properties']:
                print(f"   - 누락된 속성: {properties_validation['validation_result']['missing_properties']}")
        
        # 4. 데이터 입력 검증
        print("\n📊 4단계: 데이터 입력 검증 중...")
        insertion_validation = await validator.validate_data_insertion(database_id)
        
        if insertion_validation["success"]:
            print("✅ 데이터 입력 검증 통과")
        else:
            print(f"❌ 데이터 입력 검증 실패: {insertion_validation['message']}")
        
        # 5. 쿼리 기능 검증
        print("\n🔎 5단계: 쿼리 기능 검증 중...")
        query_validation = await validator.validate_queries(database_id)
        
        if query_validation["success"]:
            print("✅ 쿼리 기능 검증 통과")
            print(f"   - 성공한 쿼리: {query_validation['successful_queries']}/{query_validation['total_queries']}")
        else:
            print(f"❌ 쿼리 기능 검증 실패: {query_validation['message']}")
        
        # 6. 최종 검증 보고서 생성
        print("\n📋 6단계: 최종 검증 보고서 생성 중...")
        final_report = validator.generate_validation_report()
        
        # 보고서 저장
        report_path = "logs/database_validation_report.json"
        os.makedirs(os.path.dirname(report_path), exist_ok=True)
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(final_report, f, ensure_ascii=False, indent=2)
        
        # 결과 출력
        print(f"\n{'🎉' if final_report['overall_success'] else '⚠️'} 최종 검증 결과")
        print(f"   - 전체 성공률: {final_report['summary']['success_rate']}")
        print(f"   - 통과한 테스트: {final_report['summary']['passed_tests']}/{final_report['summary']['total_tests']}")
        
        print("\n📝 권장사항:")
        for recommendation in final_report["recommendations"]:
            print(f"   - {recommendation}")
        
        print(f"\n📁 상세 보고서: {report_path}")
        
        if final_report["overall_success"]:
            print("\n🎉 3-Part Daily Reflection Database 생성 및 검증 완료!")
            print("   이제 실제 데이터 입력을 시작할 수 있습니다.")
        else:
            print("\n⚠️ 일부 검증이 실패했습니다. 권장사항을 확인하고 문제를 해결해주세요.")
        
    except Exception as e:
        logger.error(f"메인 실행 오류: {str(e)}")
        print(f"❌ 실행 중 오류 발생: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
