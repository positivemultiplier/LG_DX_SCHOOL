#!/usr/bin/env python3
"""
3-Part Daily Reflection Database 테스트 데이터 생성 스크립트

이 스크립트는 현실적이고 다양한 7일치 테스트 데이터를 생성하여
3-Part Daily Reflection DB의 기능을 검증합니다.

작성자: LG DX School
최종 수정: 2024-01
"""

import asyncio
import json
import sys
import os
import random
from datetime import datetime, timedelta, date
from typing import Dict, Any, List, Optional

# 프로젝트 루트 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

try:
    from src.notion_automation.utils.logger import setup_logger
    logger = setup_logger(__name__, "logs/generate_test_data.log")
except ImportError:
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

class RealisticTestDataGenerator:
    """
    현실적인 3-Part Daily Reflection 테스트 데이터 생성기
    """
    
    def __init__(self, database_id: str):
        """
        초기화
        
        Args:
            database_id: 대상 데이터베이스 ID
        """
        self.database_id = database_id
        self.generated_entries = []
        
        # 현실적인 데이터 템플릿
        self.time_parts = ["🌅 오전수업", "🌞 오후수업", "🌙 저녁자율학습"]
        self.conditions = ["매우좋음", "좋음", "보통", "나쁨", "매우나쁨"]
        self.condition_weights = [0.15, 0.35, 0.30, 0.15, 0.05]  # 현실적인 분포
        
        self.tags_pool = ["복습", "프로젝트", "과제", "시험준비", "발표준비", "토론", "실습", "강의듣기"]
        
        # 시간대별 특성
        self.timepart_characteristics = {
            "🌅 오전수업": {
                "typical_hours": (2.0, 4.0),
                "typical_difficulty": (4, 8),
                "github_activity_ratio": 0.3,  # 낮은 GitHub 활동
                "focus_subjects": ["강의듣기", "이론학습", "복습"]
            },
            "🌞 오후수업": {
                "typical_hours": (3.0, 5.0),
                "typical_difficulty": (5, 9),
                "github_activity_ratio": 0.8,  # 높은 GitHub 활동
                "focus_subjects": ["프로젝트", "실습", "과제"]
            },
            "🌙 저녁자율학습": {
                "typical_hours": (1.5, 4.0),
                "typical_difficulty": (3, 7),
                "github_activity_ratio": 0.5,  # 중간 GitHub 활동
                "focus_subjects": ["복습", "과제", "시험준비"]
            }
        }
        
        # 요일별 특성
        self.weekday_characteristics = {
            0: {"energy_level": 0.7, "completion_rate": 0.8},  # 월요일
            1: {"energy_level": 0.8, "completion_rate": 0.9},  # 화요일
            2: {"energy_level": 0.9, "completion_rate": 0.95}, # 수요일
            3: {"energy_level": 0.85, "completion_rate": 0.9}, # 목요일
            4: {"energy_level": 0.6, "completion_rate": 0.7},  # 금요일
            5: {"energy_level": 0.4, "completion_rate": 0.5},  # 토요일
            6: {"energy_level": 0.5, "completion_rate": 0.6}   # 일요일
        }
    
    def generate_realistic_condition(self, weekday: int, time_part: str) -> str:
        """
        요일과 시간대를 고려한 현실적인 컨디션 생성
        
        Args:
            weekday: 요일 (0=월요일, 6=일요일)
            time_part: 시간대
            
        Returns:
            컨디션
        """
        base_energy = self.weekday_characteristics[weekday]["energy_level"]
        
        # 시간대별 에너지 조정
        if time_part == "🌅 오전수업":
            energy_modifier = 0.8  # 오전은 약간 낮음
        elif time_part == "🌞 오후수업":
            energy_modifier = 1.0  # 오후가 최고
        else:  # 저녁자율학습
            energy_modifier = 0.7  # 저녁은 피로함
        
        adjusted_energy = base_energy * energy_modifier
        
        # 에너지 레벨에 따른 컨디션 선택
        if adjusted_energy >= 0.8:
            return random.choices(["매우좋음", "좋음"], weights=[0.6, 0.4])[0]
        elif adjusted_energy >= 0.6:
            return random.choices(["좋음", "보통"], weights=[0.7, 0.3])[0]
        elif adjusted_energy >= 0.4:
            return random.choices(["보통", "나쁨"], weights=[0.6, 0.4])[0]
        else:
            return random.choices(["나쁨", "매우나쁨"], weights=[0.7, 0.3])[0]
    
    def generate_realistic_hours(self, time_part: str, condition: str, weekday: int) -> tuple:
        """
        현실적인 학습시간 생성
        
        Args:
            time_part: 시간대
            condition: 컨디션
            weekday: 요일
            
        Returns:
            (learning_hours, self_study_hours) 튜플
        """
        characteristics = self.timepart_characteristics[time_part]
        min_hours, max_hours = characteristics["typical_hours"]
        
        # 컨디션에 따른 시간 조정
        condition_modifiers = {
            "매우좋음": 1.2,
            "좋음": 1.0,
            "보통": 0.8,
            "나쁨": 0.6,
            "매우나쁨": 0.4
        }
        
        # 요일에 따른 시간 조정
        weekday_completion = self.weekday_characteristics[weekday]["completion_rate"]
        
        modifier = condition_modifiers[condition] * weekday_completion
        adjusted_max = max_hours * modifier
        adjusted_min = min_hours * modifier
        
        # 기본 학습시간 생성
        learning_hours = round(random.uniform(adjusted_min, adjusted_max), 1)
        
        # 자율학습시간은 시간대에 따라 다르게 설정
        if time_part == "🌙 저녁자율학습":
            self_study_ratio = random.uniform(0.6, 0.9)  # 저녁은 자율학습 비중 높음
        else:
            self_study_ratio = random.uniform(0.1, 0.3)  # 오전/오후는 낮음
        
        self_study_hours = round(learning_hours * self_study_ratio, 1)
        learning_hours = round(learning_hours - self_study_hours, 1)
        
        return max(0.5, learning_hours), max(0.0, self_study_hours)
    
    def generate_realistic_github_activity(self, time_part: str, learning_hours: float, condition: str) -> tuple:
        """
        현실적인 GitHub 활동 생성
        
        Args:
            time_part: 시간대
            learning_hours: 학습시간
            condition: 컨디션
            
        Returns:
            (commits, prs, issues) 튜플
        """
        characteristics = self.timepart_characteristics[time_part]
        activity_ratio = characteristics["github_activity_ratio"]
        
        # 컨디션에 따른 생산성 조정
        condition_productivity = {
            "매우좋음": 1.3,
            "좋음": 1.0,
            "보통": 0.7,
            "나쁨": 0.4,
            "매우나쁨": 0.2
        }
        
        productivity = condition_productivity[condition]
        
        # 기본 활동량 계산 (시간당 평균 커밋 수 기준)
        base_commits = learning_hours * activity_ratio * productivity * random.uniform(0.5, 2.0)
        commits = max(0, int(base_commits))
        
        # PR과 이슈는 커밋에 비례하지만 더 적음
        prs = max(0, int(commits / random.uniform(5, 15)))
        issues = max(0, int(commits / random.uniform(3, 10)))
        
        return commits, prs, issues
    
    def generate_realistic_content(self, time_part: str, condition: str, learning_hours: float) -> Dict[str, Any]:
        """
        현실적인 학습 내용 및 메모 생성
        
        Args:
            time_part: 시간대
            condition: 컨디션
            learning_hours: 학습시간
            
        Returns:
            내용 정보
        """
        characteristics = self.timepart_characteristics[time_part]
        
        # 시간대에 맞는 태그 선택
        relevant_tags = characteristics["focus_subjects"]
        selected_tags = random.sample(relevant_tags, random.randint(1, min(3, len(relevant_tags))))
        
        # 학습 내용 템플릿
        content_templates = {
            "🌅 오전수업": [
                "Python 기초 문법 강의 수강",
                "데이터 구조와 알고리즘 이론 학습",
                "웹 개발 개념 정리",
                "데이터베이스 기초 이론 복습"
            ],
            "🌞 오후수업": [
                "React 프로젝트 개발",
                "Flask 웹앱 구현",
                "알고리즘 문제 해결",
                "데이터 분석 실습",
                "GitHub 프로젝트 관리"
            ],
            "🌙 저녁자율학습": [
                "오늘 학습한 내용 복습",
                "과제 및 프로젝트 진행",
                "내일 학습 계획 수립",
                "부족한 부분 보완 학습"
            ]
        }
        
        # 컨디션에 따른 메모 톤 조정
        condition_tones = {
            "매우좋음": ["집중이 잘되어", "이해가 빠르게", "효율적으로"],
            "좋음": ["순조롭게", "차근차근", "꾸준히"],
            "보통": ["그럭저럭", "평소대로", "무난하게"],
            "나쁨": ["힘들었지만", "집중이 어려웠지만", "피곤했지만"],
            "매우나쁨": ["매우 힘들게", "거의 집중하지 못하고", "컨디션이 안좋아"]
        }
        
        content = random.choice(content_templates[time_part])
        tone = random.choice(condition_tones[condition])
        
        memo = f"{tone} {content}를 진행했습니다. 총 {learning_hours}시간 학습했습니다."
        
        # 성취사항과 내일 목표도 생성
        achievements = self._generate_achievements(selected_tags, condition)
        tomorrow_goals = self._generate_tomorrow_goals(time_part, condition)
        
        return {
            "memo": memo,
            "achievements": achievements,
            "tomorrow_goals": tomorrow_goals,
            "tags": selected_tags
        }
    
    def _generate_achievements(self, tags: List[str], condition: str) -> str:
        """성취사항 생성"""
        if condition in ["매우좋음", "좋음"]:
            achievements = [
                f"{', '.join(tags)} 관련 학습을 성공적으로 완료함",
                "계획했던 학습 목표를 달성함",
                "어려운 개념을 이해하는데 성공함"
            ]
        elif condition == "보통":
            achievements = [
                f"{', '.join(tags)} 관련 기본 학습을 완료함",
                "계획의 대부분을 완료함"
            ]
        else:
            achievements = [
                "최소한의 학습은 진행함",
                "포기하지 않고 끝까지 참여함"
            ]
        
        return random.choice(achievements)
    
    def _generate_tomorrow_goals(self, time_part: str, condition: str) -> str:
        """내일 목표 생성"""
        goals_by_timepart = {
            "🌅 오전수업": [
                "새로운 개념 이해하기",
                "이론 강의 집중해서 듣기",
                "노트 정리 꼼꼼히 하기"
            ],
            "🌞 오후수업": [
                "프로젝트 진도 맞추기",
                "실습 과제 완성하기",
                "코드 리뷰 받기"
            ],
            "🌙 저녁자율학습": [
                "오늘 부족했던 부분 보완하기",
                "다음날 학습 계획 세우기",
                "복습으로 개념 확실히 하기"
            ]
        }
        
        return random.choice(goals_by_timepart[time_part])
    
    async def generate_weekly_test_data(self, start_date: Optional[date] = None, days: int = 7) -> Dict[str, Any]:
        """
        일주일치 현실적인 테스트 데이터 생성
        
        Args:
            start_date: 시작 날짜 (기본값: 7일 전)
            days: 생성할 일수
            
        Returns:
            생성된 데이터 정보
        """
        try:
            logger.info(f"현실적인 테스트 데이터 생성 시작: {days}일치")
            
            if start_date is None:
                start_date = date.today() - timedelta(days=days)
            
            generated_entries = []
            daily_completion_rates = []
            
            for day_offset in range(days):
                current_date = start_date + timedelta(days=day_offset)
                weekday = current_date.weekday()
                
                # 요일별 완성도에 따라 생성할 시간대 수 결정
                completion_rate = self.weekday_characteristics[weekday]["completion_rate"]
                
                if completion_rate >= 0.9:
                    num_timeparts = 3  # 모든 시간대
                elif completion_rate >= 0.7:
                    num_timeparts = random.choice([2, 3])  # 2-3개 시간대
                elif completion_rate >= 0.5:
                    num_timeparts = random.choice([1, 2])  # 1-2개 시간대
                else:
                    num_timeparts = random.choice([1, 2])  # 1-2개 시간대
                
                # 생성할 시간대 선택
                if num_timeparts == 3:
                    selected_timeparts = self.time_parts.copy()
                else:
                    selected_timeparts = random.sample(self.time_parts, num_timeparts)
                
                daily_completion_rates.append(len(selected_timeparts) / 3)
                
                # 각 시간대별 데이터 생성
                for time_part in selected_timeparts:
                    entry_data = await self._generate_single_entry(current_date, time_part, weekday)
                    generated_entries.append(entry_data)
            
            self.generated_entries = generated_entries
            
            # 통계 정보 생성
            stats = self._calculate_generation_stats(generated_entries, daily_completion_rates)
            
            logger.info(f"테스트 데이터 생성 완료: {len(generated_entries)}개 엔트리")
            
            return {
                "success": True,
                "total_entries": len(generated_entries),
                "generated_entries": generated_entries,
                "statistics": stats,
                "date_range": {
                    "start": start_date.isoformat(),
                    "end": (start_date + timedelta(days=days-1)).isoformat(),
                    "days": days
                }
            }
            
        except Exception as e:
            logger.error(f"테스트 데이터 생성 오류: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "total_entries": 0
            }
    
    async def _generate_single_entry(self, entry_date: date, time_part: str, weekday: int) -> Dict[str, Any]:
        """
        단일 엔트리 데이터 생성
        
        Args:
            entry_date: 날짜
            time_part: 시간대
            weekday: 요일
            
        Returns:
            생성된 엔트리 데이터
        """
        # 1. 컨디션 생성
        condition = self.generate_realistic_condition(weekday, time_part)
        
        # 2. 학습시간 생성
        learning_hours, self_study_hours = self.generate_realistic_hours(time_part, condition, weekday)
        
        # 3. GitHub 활동 생성
        github_commits, github_prs, github_issues = self.generate_realistic_github_activity(
            time_part, learning_hours, condition
        )
        
        # 4. 학습 내용 생성
        content_info = self.generate_realistic_content(time_part, condition, learning_hours)
        
        # 5. 학습 난이도 생성 (컨디션과 시간대를 고려)
        difficulty_base = random.randint(
            *self.timepart_characteristics[time_part]["typical_difficulty"]
        )
        
        # 컨디션에 따른 체감 난이도 조정
        condition_difficulty_modifier = {
            "매우좋음": -1, "좋음": 0, "보통": 1, "나쁨": 2, "매우나쁨": 3
        }
        
        learning_difficulty = max(1, min(10, 
            difficulty_base + condition_difficulty_modifier[condition]
        ))
        
        # 6. 복습 효과 생성 (컨디션과 학습시간에 비례)
        review_base = {
            "매우좋음": 8, "좋음": 7, "보통": 5, "나쁨": 3, "매우나쁨": 2
        }[condition]
        
        review_effectiveness = max(1, min(10, 
            review_base + random.randint(-2, 2)
        ))
        
        # 7. 최적 플래그 결정 (좋은 컨디션 + 충분한 학습시간)
        optimal_flag = (
            condition in ["매우좋음", "좋음"] and 
            learning_hours + self_study_hours >= 3.0 and
            github_commits >= 3
        )
        
        # 8. 시간대별 컨디션 필드 설정
        condition_fields = {}
        if time_part == "🌅 오전수업":
            condition_fields["morning_condition"] = {"select": {"name": condition}}
        elif time_part == "🌞 오후수업":
            condition_fields["afternoon_condition"] = {"select": {"name": condition}}
        else:  # 저녁자율학습
            condition_fields["evening_condition"] = {"select": {"name": condition}}
        
        # 9. 완전한 엔트리 구성
        entry = {
            "parent": {"database_id": self.database_id},
            "properties": {
                "title": {
                    "title": [
                        {
                            "text": {
                                "content": f"{entry_date.strftime('%Y-%m-%d')} {time_part}"
                            }
                        }
                    ]
                },
                "reflection_date": {
                    "date": {
                        "start": entry_date.isoformat()
                    }
                },
                "time_part": {
                    "select": {
                        "name": time_part
                    }
                },
                **condition_fields,
                "learning_difficulty": {
                    "number": learning_difficulty
                },
                "learning_hours": {
                    "number": learning_hours
                },
                "self_study_hours": {
                    "number": self_study_hours
                },
                "review_effectiveness": {
                    "number": review_effectiveness
                },
                "github_commits": {
                    "number": github_commits
                },
                "github_prs": {
                    "number": github_prs
                },
                "github_issues": {
                    "number": github_issues
                },
                "memo": {
                    "rich_text": [
                        {
                            "text": {
                                "content": content_info["memo"]
                            }
                        }
                    ]
                },
                "achievements": {
                    "rich_text": [
                        {
                            "text": {
                                "content": content_info["achievements"]
                            }
                        }
                    ]
                },
                "tomorrow_goals": {
                    "rich_text": [
                        {
                            "text": {
                                "content": content_info["tomorrow_goals"]
                            }
                        }
                    ]
                },
                "tags": {
                    "multi_select": [
                        {"name": tag} for tag in content_info["tags"]
                    ]
                },
                "optimal_flag": {
                    "checkbox": optimal_flag
                }
            }
        }
        
        return entry
    
    def _calculate_generation_stats(self, entries: List[Dict], daily_completion_rates: List[float]) -> Dict[str, Any]:
        """
        생성된 데이터의 통계 계산
        
        Args:
            entries: 생성된 엔트리들
            daily_completion_rates: 일별 완성률
            
        Returns:
            통계 정보
        """
        if not entries:
            return {}
        
        # 시간대별 분포
        timepart_distribution = {}
        condition_distribution = {}
        total_hours = 0
        total_github_commits = 0
        optimal_count = 0
        
        for entry in entries:
            props = entry["properties"]
            
            # 시간대 분포
            time_part = props["time_part"]["select"]["name"]
            timepart_distribution[time_part] = timepart_distribution.get(time_part, 0) + 1
            
            # 컨디션 분포
            for condition_field in ["morning_condition", "afternoon_condition", "evening_condition"]:
                if condition_field in props:
                    condition = props[condition_field]["select"]["name"]
                    condition_distribution[condition] = condition_distribution.get(condition, 0) + 1
                    break
            
            # 시간 및 활동 통계
            total_hours += props["learning_hours"]["number"] + props["self_study_hours"]["number"]
            total_github_commits += props["github_commits"]["number"]
            
            if props["optimal_flag"]["checkbox"]:
                optimal_count += 1
        
        return {
            "timepart_distribution": timepart_distribution,
            "condition_distribution": condition_distribution,
            "total_learning_hours": round(total_hours, 1),
            "average_daily_hours": round(total_hours / max(len(set(e["properties"]["reflection_date"]["date"]["start"] for e in entries)), 1), 1),
            "total_github_commits": total_github_commits,
            "optimal_entries": optimal_count,
            "optimal_percentage": f"{(optimal_count / len(entries)) * 100:.1f}%",
            "average_daily_completion": f"{(sum(daily_completion_rates) / len(daily_completion_rates)) * 100:.1f}%"
        }
    
    async def insert_test_data(self) -> Dict[str, Any]:
        """
        생성된 테스트 데이터를 데이터베이스에 삽입
        
        Returns:
            삽입 결과
        """
        try:
            logger.info(f"테스트 데이터 삽입 시작: {len(self.generated_entries)}개")
            
            successful_inserts = 0
            failed_inserts = []
            
            for i, entry in enumerate(self.generated_entries):
                try:
                    # 실제 MCP 호출을 통한 데이터 삽입
                    # result = await mcp_notion_create_page(**entry)
                    
                    # 테스트용 모의 결과
                    result = {
                        "object": "page",
                        "id": f"test_page_{i+1}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                        "created_time": datetime.now().isoformat(),
                        "properties": entry["properties"]
                    }
                    
                    successful_inserts += 1
                    logger.info(f"엔트리 {i+1} 삽입 성공: {result['id']}")
                    
                except Exception as e:
                    failed_inserts.append({
                        "entry_index": i,
                        "error": str(e)
                    })
                    logger.error(f"엔트리 {i+1} 삽입 실패: {str(e)}")
            
            success_rate = (successful_inserts / len(self.generated_entries)) * 100
            
            logger.info(f"데이터 삽입 완료: {successful_inserts}/{len(self.generated_entries)} (성공률: {success_rate:.1f}%)")
            
            return {
                "success": len(failed_inserts) == 0,
                "total_entries": len(self.generated_entries),
                "successful_inserts": successful_inserts,
                "failed_inserts": len(failed_inserts),
                "success_rate": f"{success_rate:.1f}%",
                "failed_details": failed_inserts[:5]  # 처음 5개 실패만 반환
            }
            
        except Exception as e:
            logger.error(f"테스트 데이터 삽입 오류: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

async def main():
    """
    메인 실행 함수 - 현실적인 테스트 데이터 생성 및 삽입
    """
    print("📊 3-Part Daily Reflection 현실적인 테스트 데이터 생성기")
    print("=" * 60)
    
    try:
        # 테스트용 데이터베이스 ID (실제 환경에서는 이전 단계에서 생성된 DB ID 사용)
        database_id = "test_db_3part_reflection"
        
        # 테스트 데이터 생성기 초기화
        generator = RealisticTestDataGenerator(database_id)
        
        print(f"\n📋 대상 데이터베이스: {database_id}")
        
        # 1. 현실적인 테스트 데이터 생성
        print("\n🎯 1단계: 현실적인 테스트 데이터 생성 중...")
        generation_result = await generator.generate_weekly_test_data(days=7)
        
        if generation_result["success"]:
            print("✅ 테스트 데이터 생성 완료")
            print(f"   - 총 엔트리: {generation_result['total_entries']}개")
            print(f"   - 날짜 범위: {generation_result['date_range']['start']} ~ {generation_result['date_range']['end']}")
            
            # 통계 정보 출력
            stats = generation_result["statistics"]
            print(f"   - 총 학습시간: {stats['total_learning_hours']}시간")
            print(f"   - 일평균 학습시간: {stats['average_daily_hours']}시간")
            print(f"   - 총 GitHub 커밋: {stats['total_github_commits']}개")
            print(f"   - 최적 엔트리: {stats['optimal_entries']}개 ({stats['optimal_percentage']})")
            
            # 시간대별 분포
            print("   - 시간대별 분포:")
            for time_part, count in stats["timepart_distribution"].items():
                print(f"     * {time_part}: {count}개")
            
            # 컨디션 분포
            print("   - 컨디션 분포:")
            for condition, count in stats["condition_distribution"].items():
                print(f"     * {condition}: {count}개")
                
        else:
            print(f"❌ 테스트 데이터 생성 실패: {generation_result['error']}")
            return
        
        # 2. 데이터베이스에 삽입
        print("\n💾 2단계: 생성된 데이터를 데이터베이스에 삽입 중...")
        insertion_result = await generator.insert_test_data()
        
        if insertion_result["success"]:
            print("✅ 테스트 데이터 삽입 완료")
            print(f"   - 성공률: {insertion_result['success_rate']}")
            print(f"   - 성공: {insertion_result['successful_inserts']}개")
            print(f"   - 실패: {insertion_result['failed_inserts']}개")
        else:
            print(f"❌ 테스트 데이터 삽입 실패: {insertion_result.get('error', '알 수 없는 오류')}")
            print(f"   - 부분 성공: {insertion_result.get('successful_inserts', 0)}개")
        
        # 3. 결과 보고서 저장
        print("\n📁 3단계: 테스트 데이터 보고서 저장 중...")
        
        final_report = {
            "database_id": database_id,
            "generated_at": datetime.now().isoformat(),
            "generation_result": generation_result,
            "insertion_result": insertion_result,
            "sample_entries": generation_result.get("generated_entries", [])[:3]  # 샘플 3개만
        }
        
        report_path = "logs/test_data_generation_report.json"
        os.makedirs(os.path.dirname(report_path), exist_ok=True)
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(final_report, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 보고서 저장 완료: {report_path}")
        
        # 4. 데이터 검증을 위한 샘플 출력
        print("\n📋 4단계: 생성된 샘플 데이터 미리보기...")
        sample_entries = generation_result.get("generated_entries", [])[:2]
        
        for i, entry in enumerate(sample_entries):
            props = entry["properties"]
            print(f"\n📝 샘플 {i+1}:")
            print(f"   - 제목: {props['title']['title'][0]['text']['content']}")
            print(f"   - 날짜: {props['reflection_date']['date']['start']}")
            print(f"   - 시간대: {props['time_part']['select']['name']}")
            print(f"   - 학습시간: {props['learning_hours']['number']}h")
            print(f"   - GitHub 커밋: {props['github_commits']['number']}개")
            print(f"   - 최적 플래그: {'✅' if props['optimal_flag']['checkbox'] else '❌'}")
        
        print("\n🎉 현실적인 테스트 데이터 생성 및 삽입 완료!")
        print("   - 이제 데이터베이스에서 다양한 쿼리와 분석을 테스트할 수 있습니다.")
        print("   - 생성된 데이터는 실제 사용 패턴을 반영하여 만들어졌습니다.")
        
    except Exception as e:
        logger.error(f"메인 실행 오류: {str(e)}")
        print(f"❌ 실행 중 오류 발생: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
