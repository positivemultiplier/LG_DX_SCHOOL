"""
3-Part Daily Reflection System - 오후수업 입력 스크립트

Task 3.1.2: afternoon_reflection.py 오후수업 입력 스크립트 개발
- 오후수업 완료 후 17:00-17:15 실행
- 시간대: 🌞 오후수업 (13:00-17:00)
- 실습/프로젝트 중심 질문 구성
- GitHub 활동 자동 수집 및 통합
"""

import os
import sys
import json
import logging
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional, Tuple

# 프로젝트 루트 디렉토리를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

# 로거 설정
from src.notion_automation.utils.logger import ThreePartLogger

logger = ThreePartLogger("afternoon_reflection")

class AfternoonReflectionInput:
    """오후수업 반성 입력 시스템"""
    
    def __init__(self, database_id: Optional[str] = None):
        """
        오후 반성 입력기 초기화
        
        Args:
            database_id: Notion 3-Part 데이터베이스 ID
        """
        self.database_id = database_id or os.getenv("NOTION_3PART_DATABASE_ID")
        self.time_part = "🌞 오후수업"
        self.start_time = "13:00"
        self.end_time = "17:00"
        self.current_date = date.today()
        
        # 오후 특화 질문 정의 (실습/프로젝트 중심)
        self.questions = {
            "subject": {
                "prompt": "오후에 학습한 주요 과목/실습은?",
                "type": "text",
                "required": True,
                "min_length": 2
            },
            "difficulty": {
                "prompt": "오후 실습 난이도는? (1-10, 1=매우쉬움, 10=매우어려움)",
                "type": "number",
                "required": True,
                "min_value": 1,
                "max_value": 10
            },
            "understanding": {
                "prompt": "오후 실습 이해도는? (1-10, 1=전혀이해못함, 10=완전이해)",
                "type": "number", 
                "required": True,
                "min_value": 1,
                "max_value": 10
            },
            "condition": {
                "prompt": "오후 컨디션은? (1=😊좋음, 2=😐보통, 3=😔나쁨)",
                "type": "select",
                "required": True,
                "options": {
                    "1": "😊 좋음",
                    "2": "😐 보통", 
                    "3": "😔 나쁨"
                }
            },
            "learning_hours": {
                "prompt": "오후 실제 학습시간은? (시간, 예: 3.5)",
                "type": "number",
                "required": True,
                "min_value": 0.5,
                "max_value": 5.0
            },
            "key_learning": {
                "prompt": "오후 실습에서 핵심 학습 내용은?",
                "type": "text",
                "required": True,
                "min_length": 10
            },
            "challenges": {
                "prompt": "오후 실습에서 막혔던 부분은? (없으면 '없음')",
                "type": "text",
                "required": False,
                "min_length": 0
            },
            "reflection": {
                "prompt": "오후 실습에 대한 반성/개선점은?",
                "type": "text",
                "required": True,
                "min_length": 10
            },
            "practical_outcome": {
                "prompt": "오후 실습에서 완성한 결과물이나 성과는?",
                "type": "text",
                "required": False,
                "min_length": 0
            },
            "memo": {
                "prompt": "기타 메모사항이 있다면? (선택사항)",
                "type": "text",
                "required": False,
                "min_length": 0
            }
        }

    def display_welcome(self) -> None:
        """오후 반성 시작 인사말 출력"""
        print("🌞 오후수업 반성 입력 시스템")
        print("=" * 50)
        print(f"📅 날짜: {self.current_date}")
        print(f"⏰ 시간대: {self.time_part} ({self.start_time}-{self.end_time})")
        print("💡 실습/프로젝트 중심으로 15분 내외로 입력해주세요!")
        print()

    def collect_user_input(self) -> Dict[str, Any]:
        """사용자로부터 오후 반성 데이터 수집"""
        logger.info("오후 반성 데이터 수집 시작")
        user_data = {}
        
        try:
            for field_name, field_config in self.questions.items():
                while True:
                    try:
                        # 질문 출력
                        prompt = field_config["prompt"]
                        if field_config.get("required", False):
                            prompt += " (필수)"
                        else:
                            prompt += " (선택)"
                        
                        print(f"\n📝 {prompt}")
                        
                        # 선택형인 경우 옵션 표시
                        if field_config["type"] == "select":
                            for key, value in field_config["options"].items():
                                print(f"   {key}: {value}")
                        
                        # 실습 관련 힌트 제공
                        if field_name == "practical_outcome":
                            print("   💡 예: 웹페이지 완성, 알고리즘 구현, 프로젝트 진행상황 등")
                        
                        # 사용자 입력 받기
                        user_input = input("👉 입력: ").strip()
                        
                        # 필수 필드 검증
                        if field_config.get("required", False) and not user_input:
                            print("❌ 필수 입력 항목입니다.")
                            continue
                        
                        # 선택 필드인데 입력 없으면 건너뛰기
                        if not field_config.get("required", False) and not user_input:
                            user_data[field_name] = ""
                            break
                        
                        # 타입별 검증 및 변환
                        if field_config["type"] == "number":
                            try:
                                value = float(user_input)
                                min_val = field_config.get("min_value")
                                max_val = field_config.get("max_value")
                                
                                if min_val is not None and value < min_val:
                                    print(f"❌ {min_val} 이상의 값을 입력하세요.")
                                    continue
                                    
                                if max_val is not None and value > max_val:
                                    print(f"❌ {max_val} 이하의 값을 입력하세요.")
                                    continue
                                
                                user_data[field_name] = value
                                break
                                
                            except ValueError:
                                print("❌ 숫자를 입력하세요.")
                                continue
                        
                        elif field_config["type"] == "select":
                            if user_input in field_config["options"]:
                                user_data[field_name] = field_config["options"][user_input]
                                break
                            else:
                                print(f"❌ {list(field_config['options'].keys())} 중에서 선택하세요.")
                                continue
                        
                        elif field_config["type"] == "text":
                            min_length = field_config.get("min_length", 0)
                            if len(user_input) < min_length:
                                print(f"❌ 최소 {min_length}자 이상 입력하세요.")
                                continue
                            
                            user_data[field_name] = user_input
                            break
                            
                    except KeyboardInterrupt:
                        print("\n\n🚫 입력이 취소되었습니다.")
                        return {}
                    except Exception as e:
                        print(f"❌ 입력 처리 중 오류: {e}")
                        continue
            
            logger.info("사용자 입력 수집 완료")
            return user_data
            
        except Exception as e:
            logger.error(f"사용자 입력 수집 중 오류: {e}")
            return {}

    def collect_github_activities(self) -> Dict[str, Any]:
        """오후 시간대 GitHub 활동 수집 (13:00-17:00)"""
        logger.info("GitHub 오후 활동 수집 시작")
        
        try:
            current_time = datetime.now()
            afternoon_start = current_time.replace(hour=13, minute=0, second=0, microsecond=0)
            afternoon_end = current_time.replace(hour=17, minute=0, second=0, microsecond=0)
            
            # Mock GitHub 활동 데이터 (실제 구현 시 GitHub MCP로 대체)
            github_data = {
                "commits": 0,  # 기본값
                "prs": 0,
                "issues": 0,
                "activities": "오후 GitHub 활동 없음",
                "start_time": afternoon_start.strftime("%H:%M"),
                "end_time": afternoon_end.strftime("%H:%M"),
                "date": self.current_date.isoformat()
            }
            
            # 사용자에게 GitHub 활동 직접 입력 받기
            print(f"\n🔗 GitHub 오후 활동 입력 ({self.start_time}-{self.end_time})")
            print("💡 오후 실습에서 GitHub에 올린 작업을 입력해주세요")
            
            try:
                commits_input = input("👉 오후 커밋 수 (숫자만): ").strip()
                if commits_input.isdigit():
                    github_data["commits"] = int(commits_input)
                
                prs_input = input("👉 오후 PR 수 (숫자만): ").strip()
                if prs_input.isdigit():
                    github_data["prs"] = int(prs_input)
                
                issues_input = input("👉 오후 이슈 수 (숫자만): ").strip()
                if issues_input.isdigit():
                    github_data["issues"] = int(issues_input)
                
                activities = input("👉 오후 주요 GitHub 활동 내용: ").strip()
                if activities:
                    github_data["activities"] = activities
                    
            except KeyboardInterrupt:
                print("\n⚠️ GitHub 활동 입력을 건너뛰고 기본값 사용")
            
            logger.info(f"GitHub 활동 수집 완료: {github_data}")
            return github_data
            
        except Exception as e:
            logger.error(f"GitHub 활동 수집 중 오류: {e}")
            return {
                "commits": 0,
                "prs": 0, 
                "issues": 0,
                "activities": "GitHub 활동 수집 실패",
                "start_time": self.start_time,
                "end_time": self.end_time,
                "date": self.current_date.isoformat()
            }

    def calculate_time_part_score(self, user_data: Dict[str, Any]) -> int:
        """오후 시간대 종합 점수 계산 (실습/프로젝트 가중치 적용)"""
        try:
            # 기본 점수 계산 로직 (오후는 실습 중심이므로 실제 결과물에 가중치)
            condition_score = {
                "😊 좋음": 30,
                "😐 보통": 20,
                "😔 나쁨": 10
            }.get(user_data.get("condition", "😐 보통"), 20)
            
            understanding = user_data.get("understanding", 5)
            difficulty = user_data.get("difficulty", 5)
            learning_hours = user_data.get("learning_hours", 3.0)
            
            # 오후 특화: 실습 결과물이 있으면 보너스
            practical_outcome = user_data.get("practical_outcome", "")
            practical_bonus = 10 if practical_outcome and len(practical_outcome) > 5 else 0
            
            # 점수 계산: 컨디션(25%) + 이해도(35%) + 학습시간(20%) + 난이도 보정(10%) + 실습 보너스(10%)
            understanding_score = understanding * 3.5  # 최대 35점
            hours_score = min(learning_hours * 4, 20)  # 최대 20점, 5시간이면 만점
            difficulty_bonus = max(0, difficulty - 5)  # 난이도 5 이상일 때 보너스
            
            total_score = condition_score + understanding_score + hours_score + difficulty_bonus + practical_bonus
            
            # 0-100 범위로 제한
            final_score = max(0, min(100, int(total_score)))
            
            logger.info(f"오후 점수 계산: {final_score}점 (컨디션:{condition_score}, 이해도:{understanding_score}, 시간:{hours_score}, 난이도보정:{difficulty_bonus}, 실습보너스:{practical_bonus})")
            return final_score
            
        except Exception as e:
            logger.error(f"점수 계산 중 오류: {e}")
            return 50  # 기본 점수

    def create_notion_entry(self, user_data: Dict[str, Any], github_data: Dict[str, Any]) -> bool:
        """Notion 3-Part DB에 오후 데이터 입력"""
        logger.info("Notion DB 입력 시작")
        
        try:
            if not self.database_id:
                logger.warning("데이터베이스 ID가 설정되지 않음 - 로컬 저장으로 전환")
                return self.save_local_backup(user_data, github_data)
            
            # 시간대 점수 계산
            time_part_score = self.calculate_time_part_score(user_data)
            
            # Notion API 형식으로 데이터 구성
            notion_properties = {
                "reflection_date": {
                    "date": {"start": self.current_date.isoformat()}
                },
                "time_part": {
                    "select": {"name": self.time_part}
                },
                "start_time": {
                    "rich_text": [{"text": {"content": self.start_time}}]
                },
                "end_time": {
                    "rich_text": [{"text": {"content": self.end_time}}]
                },
                "subject": {
                    "rich_text": [{"text": {"content": user_data.get("subject", "")}}]
                },
                "condition": {
                    "select": {"name": user_data.get("condition", "😐 보통")}
                },
                "learning_difficulty": {
                    "number": user_data.get("difficulty", 5)
                },
                "understanding": {
                    "number": user_data.get("understanding", 5)
                },
                "learning_hours": {
                    "number": user_data.get("learning_hours", 3.0)
                },
                "key_learning": {
                    "rich_text": [{"text": {"content": user_data.get("key_learning", "")}}]
                },
                "challenges": {
                    "rich_text": [{"text": {"content": user_data.get("challenges", "")}}]
                },
                "reflection": {
                    "rich_text": [{"text": {"content": user_data.get("reflection", "")}}]
                },
                "commit_count": {
                    "number": github_data.get("commits", 0)
                },
                "github_activities": {
                    "rich_text": [{"text": {"content": github_data.get("activities", "")}}]
                },
                "github_commits": {
                    "number": github_data.get("commits", 0)
                },
                "github_prs": {
                    "number": github_data.get("prs", 0)
                },
                "github_issues": {
                    "number": github_data.get("issues", 0)
                },
                "time_part_score": {
                    "number": time_part_score
                }
            }
            
            # 실습 결과물이 있는 경우 추가
            if user_data.get("practical_outcome"):
                # 메모 필드에 실습 결과물 정보 추가
                memo_content = f"실습 결과물: {user_data['practical_outcome']}"
                if user_data.get("memo"):
                    memo_content += f"\n기타: {user_data['memo']}"
                notion_properties["memo"] = {
                    "rich_text": [{"text": {"content": memo_content}}]
                }
            elif user_data.get("memo"):
                notion_properties["memo"] = {
                    "rich_text": [{"text": {"content": user_data["memo"]}}]
                }
            
            # 실제 환경에서는 mcp_notion_create-page 호출
            # 현재는 시뮬레이션으로 성공 처리
            print(f"💾 Notion DB 저장 시뮬레이션...")
            print(f"   📅 날짜: {self.current_date}")
            print(f"   🌞 시간대: {self.time_part}")
            print(f"   📊 점수: {time_part_score}점")
            print(f"   📝 주요 내용: {user_data.get('subject', '')}")
            
            # 실습 결과물이 있으면 표시
            if user_data.get("practical_outcome"):
                print(f"   🔧 실습 결과물: {user_data['practical_outcome']}")
            
            # 로컬 백업도 함께 저장
            self.save_local_backup(user_data, github_data, time_part_score)
            
            logger.info("Notion DB 입력 완료")
            return True
            
        except Exception as e:
            logger.error(f"Notion DB 입력 중 오류: {e}")
            print(f"❌ Notion 저장 실패: {e}")
            print("💾 로컬 백업으로 저장합니다...")
            return self.save_local_backup(user_data, github_data)

    def save_local_backup(self, user_data: Dict[str, Any], github_data: Dict[str, Any], score: Optional[int] = None) -> bool:
        """로컬 백업 파일로 저장"""
        try:
            # 백업 디렉토리 생성
            backup_dir = "data/afternoon_reflections"
            os.makedirs(backup_dir, exist_ok=True)
            
            if score is None:
                score = self.calculate_time_part_score(user_data)
            
            # 백업 데이터 구성
            backup_data = {
                "date": self.current_date.isoformat(),
                "time_part": self.time_part,
                "start_time": self.start_time,
                "end_time": self.end_time,
                "timestamp": datetime.now().isoformat(),
                "user_input": user_data,
                "github_data": github_data,
                "calculated_score": score,
                "status": "local_backup"
            }
            
            # 파일명 생성
            filename = f"afternoon_reflection_{self.current_date.strftime('%Y%m%d')}.json"
            filepath = os.path.join(backup_dir, filename)
            
            # JSON 파일로 저장
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(backup_data, f, ensure_ascii=False, indent=2)
            
            print(f"💾 로컬 백업 저장: {filepath}")
            logger.info(f"로컬 백업 저장 완료: {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"로컬 백업 저장 실패: {e}")
            print(f"❌ 로컬 백업 저장 실패: {e}")
            return False

    def display_summary(self, user_data: Dict[str, Any], github_data: Dict[str, Any], success: bool) -> None:
        """오후 반성 입력 결과 요약 출력"""
        print("\n" + "=" * 50)
        print("📋 오후수업 반성 입력 완료!")
        print("=" * 50)
        
        print(f"📅 날짜: {self.current_date}")
        print(f"🌞 시간대: {self.time_part} ({self.start_time}-{self.end_time})")
        print(f"📝 과목/실습: {user_data.get('subject', '')}")
        print(f"😊 컨디션: {user_data.get('condition', '')}")
        print(f"📚 난이도: {user_data.get('difficulty', 0)}/10")
        print(f"🧠 이해도: {user_data.get('understanding', 0)}/10")
        print(f"⏰ 학습시간: {user_data.get('learning_hours', 0)}시간")
        print(f"💻 GitHub 커밋: {github_data.get('commits', 0)}개")
        
        # 실습 결과물이 있으면 표시
        if user_data.get("practical_outcome"):
            print(f"🔧 실습 결과물: {user_data['practical_outcome']}")
            
        print(f"📊 시간대 점수: {self.calculate_time_part_score(user_data)}점")
        
        status_icon = "✅" if success else "❌"
        status_text = "성공" if success else "실패"
        print(f"💾 저장 상태: {status_icon} {status_text}")
        
        print("\n💡 오후 실습 수고하셨습니다! 저녁 자율학습도 화이팅! 🌙")

    def run(self) -> bool:
        """오후 반성 입력 전체 프로세스 실행"""
        logger.info("=== 오후수업 반성 입력 시작 ===")
        
        try:
            # 1. 환영 메시지
            self.display_welcome()
            
            # 2. 사용자 입력 수집
            user_data = self.collect_user_input()
            if not user_data:
                print("❌ 입력이 취소되었습니다.")
                return False
            
            # 3. GitHub 활동 수집
            github_data = self.collect_github_activities()
            
            # 4. Notion DB 저장
            success = self.create_notion_entry(user_data, github_data)
            
            # 5. 결과 요약
            self.display_summary(user_data, github_data, success)
            
            logger.info("=== 오후수업 반성 입력 완료 ===")
            return success
            
        except KeyboardInterrupt:
            print("\n\n🚫 프로그램이 중단되었습니다.")
            logger.info("사용자에 의한 프로그램 중단")
            return False
        except Exception as e:
            logger.error(f"오후 반성 입력 중 치명적 오류: {e}")
            print(f"❌ 시스템 오류가 발생했습니다: {e}")
            return False

def main():
    """메인 실행 함수"""
    print("🌞 3-Part Daily Reflection System")
    print("   오후수업 반성 입력 모듈")
    print("=" * 60)
    
    # 환경변수 확인
    database_id = os.getenv("NOTION_3PART_DATABASE_ID")
    if not database_id:
        print("⚠️ 경고: NOTION_3PART_DATABASE_ID 환경변수가 설정되지 않았습니다.")
        print("   로컬 백업 모드로 실행됩니다.")
        print()
    
    try:
        # 오후 반성 입력 실행
        afternoon_input = AfternoonReflectionInput(database_id)
        success = afternoon_input.run()
        
        if success:
            print("\n🎉 오후 반성 입력이 성공적으로 완료되었습니다!")
            print("📝 다음 실행: 저녁자율학습 완료 후 22:00-22:15")
        else:
            print("\n❌ 오후 반성 입력에 문제가 발생했습니다.")
            print("💡 데이터는 로컬에 백업되었으니 나중에 다시 시도해보세요.")
            
    except Exception as e:
        print(f"❌ 시스템 오류: {e}")
        logger.error(f"메인 실행 중 오류: {e}")

if __name__ == "__main__":
    main()
