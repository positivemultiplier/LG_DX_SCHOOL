"""
3-Part Daily Reflection System - 저녁자율학습 입력 스크립트

Task 3.1.3: evening_reflection.py 저녁자율학습 입력 스크립트 개발
- 저녁자율학습 완료 후 22:00-22:15 실행
- 시간대: 🌙 저녁자율학습 (19:00-22:00)
- 자기주도학습 중심 질문 구성
- 하루 전체 총합 및 개인 목표 달성도 평가
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

logger = ThreePartLogger("evening_reflection")

class EveningReflectionInput:
    """저녁자율학습 반성 입력 시스템"""
    
    def __init__(self, database_id: Optional[str] = None):
        """
        저녁 반성 입력기 초기화
        
        Args:
            database_id: Notion 3-Part 데이터베이스 ID
        """
        self.database_id = database_id or os.getenv("NOTION_3PART_DATABASE_ID")
        self.time_part = "🌙 저녁자율학습"
        self.start_time = "19:00"
        self.end_time = "22:00"
        self.current_date = date.today()
        
        # 저녁 특화 질문 정의 (자기주도학습 중심)
        self.questions = {
            "study_plan": {
                "prompt": "저녁 자율학습 계획이 있었나요?",
                "type": "select",
                "required": True,
                "options": {
                    "1": "📋 세부계획 있었음",
                    "2": "📝 대략적계획 있었음", 
                    "3": "❌ 계획 없이 진행"
                }
            },
            "plan_achievement": {
                "prompt": "저녁 자율학습 계획 달성도는? (1-10, 1=전혀달성못함, 10=완전달성)",
                "type": "number",
                "required": True,
                "min_value": 1,
                "max_value": 10
            },
            "study_subjects": {
                "prompt": "저녁에 학습한 주요 과목/분야는? (쉼표로 구분)",
                "type": "text",
                "required": True,
                "min_length": 2
            },
            "focus_level": {
                "prompt": "저녁 집중도는? (1-10, 1=전혀집중못함, 10=완전집중)",
                "type": "number",
                "required": True,
                "min_value": 1,
                "max_value": 10
            },
            "condition": {
                "prompt": "저녁 컨디션은? (1=😊좋음, 2=😐보통, 3=😔나쁨)",
                "type": "select",
                "required": True,
                "options": {
                    "1": "😊 좋음",
                    "2": "😐 보통", 
                    "3": "😔 나쁨"
                }
            },
            "learning_hours": {
                "prompt": "저녁 실제 학습시간은? (시간, 예: 2.5)",
                "type": "number",
                "required": True,
                "min_value": 0.5,
                "max_value": 4.0
            },
            "productive_activities": {
                "prompt": "저녁에 가장 생산적이었던 활동은?",
                "type": "text",
                "required": True,
                "min_length": 10
            },
            "challenges": {
                "prompt": "저녁 자율학습에서 어려웠던 점은? (없으면 '없음')",
                "type": "text",
                "required": False,
                "min_length": 0
            },
            "daily_goals": {
                "prompt": "오늘 개인 목표 달성도는? (1-10, 1=전혀달성못함, 10=완전달성)",
                "type": "number",
                "required": True,
                "min_value": 1,
                "max_value": 10
            },
            "tomorrow_plan": {
                "prompt": "내일 가장 집중하고 싶은 학습 분야는?",
                "type": "text",
                "required": True,
                "min_length": 5
            },
            "overall_reflection": {
                "prompt": "오늘 하루 전체에 대한 반성은?",
                "type": "text",
                "required": True,
                "min_length": 15
            },
            "energy_level": {
                "prompt": "저녁 시간대 체력/에너지 상태는? (1=😴매우피곤, 2=😐보통, 3=😊활력충만)",
                "type": "select",
                "required": True,
                "options": {
                    "1": "😴 매우피곤",
                    "2": "😐 보통",
                    "3": "😊 활력충만"
                }
            },
            "memo": {
                "prompt": "기타 메모사항이 있다면? (선택사항)",
                "type": "text",
                "required": False,
                "min_length": 0
            }
        }

    def display_welcome(self) -> None:
        """저녁 반성 시작 인사말 출력"""
        print("🌙 저녁자율학습 반성 입력 시스템")
        print("=" * 50)
        print(f"📅 날짜: {self.current_date}")
        print(f"⏰ 시간대: {self.time_part} ({self.start_time}-{self.end_time})")
        print("💡 자기주도학습 중심으로 하루 마무리 반성을 해주세요!")
        print()

    def collect_user_input(self) -> Dict[str, Any]:
        """사용자로부터 저녁 반성 데이터 수집"""
        logger.info("저녁 반성 데이터 수집 시작")
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
                        
                        # 자율학습 관련 힌트 제공
                        if field_name == "productive_activities":
                            print("   💡 예: 코딩테스트 문제풀이, 개인프로젝트, 개념정리, 복습 등")
                        elif field_name == "tomorrow_plan":
                            print("   💡 예: 알고리즘 문제풀이, React 심화학습, 프로젝트 완성 등")
                        
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
                        print("\n❌ 입력이 중단되었습니다.")
                        logger.error("사용자 입력 중단")
                        return {}
                    except Exception as e:
                        print(f"❌ 입력 처리 중 오류: {e}")
                        logger.error(f"입력 처리 오류: {e}")
                        continue
                        
            logger.info("사용자 입력 수집 완료")
            return user_data
            
        except Exception as e:
            print(f"❌ 데이터 수집 중 오류 발생: {e}")
            logger.error(f"데이터 수집 오류: {e}")
            return {}

    def collect_github_activities(self) -> Dict[str, Any]:
        """저녁 시간대 GitHub 활동 수집 (19:00-22:00)"""
        logger.info("GitHub 저녁 활동 수집 시작")
        
        print("\n🔗 GitHub 저녁 활동 입력 (19:00-22:00)")
        print("💡 저녁 자율학습에서 GitHub에 올린 작업을 입력해주세요")
        
        github_data = {
            "start_time": self.start_time,
            "end_time": self.end_time,
            "date": str(self.current_date),
            "commits": 0,
            "prs": 0,
            "issues": 0,
            "activities": ""
        }
        
        try:
            # 커밋 수 입력
            while True:
                try:
                    commits = input("👉 저녁 커밋 수 (숫자만): ").strip()
                    commits = int(commits) if commits else 0
                    if commits >= 0:
                        github_data["commits"] = commits
                        break
                    print("❌ 0 이상의 숫자를 입력하세요.")
                except ValueError:
                    print("❌ 숫자만 입력하세요.")
            
            # PR 수 입력
            while True:
                try:
                    prs = input("👉 저녁 PR 수 (숫자만): ").strip()
                    prs = int(prs) if prs else 0
                    if prs >= 0:
                        github_data["prs"] = prs
                        break
                    print("❌ 0 이상의 숫자를 입력하세요.")
                except ValueError:
                    print("❌ 숫자만 입력하세요.")
            
            # 이슈 수 입력
            while True:
                try:
                    issues = input("👉 저녁 이슈 수 (숫자만): ").strip()
                    issues = int(issues) if issues else 0
                    if issues >= 0:
                        github_data["issues"] = issues
                        break
                    print("❌ 0 이상의 숫자를 입력하세요.")
                except ValueError:
                    print("❌ 숫자만 입력하세요.")
            
            # 주요 활동 내용
            activities = input("👉 저녁 주요 GitHub 활동 내용: ").strip()
            github_data["activities"] = activities if activities else "활동 없음"
            
            logger.info(f"GitHub 활동 수집 완료: {github_data}")
            return github_data
            
        except Exception as e:
            print(f"❌ GitHub 활동 수집 중 오류: {e}")
            logger.error(f"GitHub 활동 수집 오류: {e}")
            return github_data

    def calculate_evening_score(self, user_data: Dict[str, Any], github_data: Dict[str, Any]) -> int:
        """저녁 시간대 종합 점수 계산"""
        try:
            score = 0
            score_breakdown = {}
            
            # 1. 컨디션 점수 (최대 25점)
            condition_map = {"😊 좋음": 25, "😐 보통": 18, "😔 나쁨": 10}
            condition_score = condition_map.get(user_data.get("condition", "😐 보통"), 18)
            score += condition_score
            score_breakdown["컨디션"] = condition_score
            
            # 2. 집중도 점수 (최대 25점)
            focus_score = (user_data.get("focus_level", 5) / 10) * 25
            score += focus_score
            score_breakdown["집중도"] = focus_score
            
            # 3. 학습시간 점수 (최대 20점)
            learning_hours = user_data.get("learning_hours", 0)
            if learning_hours >= 3.0:
                time_score = 20
            elif learning_hours >= 2.0:
                time_score = 15
            elif learning_hours >= 1.0:
                time_score = 10
            else:
                time_score = 5
            score += time_score
            score_breakdown["학습시간"] = time_score
            
            # 4. 계획 달성도 점수 (최대 15점)
            plan_score = (user_data.get("plan_achievement", 5) / 10) * 15
            score += plan_score
            score_breakdown["계획달성도"] = plan_score
            
            # 5. 개인 목표 달성도 점수 (최대 10점)
            goals_score = (user_data.get("daily_goals", 5) / 10) * 10
            score += goals_score
            score_breakdown["목표달성도"] = goals_score
            
            # 6. GitHub 활동 보너스 (최대 5점)
            github_score = 0
            if github_data.get("commits", 0) > 0:
                github_score += 2
            if github_data.get("prs", 0) > 0:
                github_score += 2
            if github_data.get("issues", 0) > 0:
                github_score += 1
            score += github_score
            score_breakdown["GitHub활동"] = github_score
            
            # 총점 보정 (100점 만점)
            final_score = min(int(score), 100)
            
            logger.info(f"저녁 점수 계산: {final_score}점 - {score_breakdown}")
            return final_score
            
        except Exception as e:
            logger.error(f"점수 계산 오류: {e}")
            return 70  # 기본 점수
    
    def save_to_notion(self, user_data: Dict[str, Any], github_data: Dict[str, Any], score: int) -> bool:
        """Notion 데이터베이스에 저장 (시뮬레이션)"""
        logger.info("Notion DB 입력 시작")
        
        try:
            # 실제 환경에서는 여기서 Notion MCP 호출
            print("💾 Notion DB 저장 시뮬레이션...")
            print(f"   📅 날짜: {self.current_date}")
            print(f"   🌙 시간대: {self.time_part}")
            print(f"   📊 점수: {score}점")
            print(f"   📝 주요 과목: {user_data.get('study_subjects', 'N/A')}")
            print(f"   🎯 목표달성도: {user_data.get('daily_goals', 'N/A')}/10")
            
            logger.info("Notion DB 입력 완료")
            return True
            
        except Exception as e:
            print(f"❌ Notion 저장 실패: {e}")
            logger.error(f"Notion 저장 오류: {e}")
            return False

    def save_local_backup(self, user_data: Dict[str, Any], github_data: Dict[str, Any], score: int) -> str:
        """로컬 백업 파일 저장"""
        backup_dir = "data/evening_reflections"
        os.makedirs(backup_dir, exist_ok=True)
        
        backup_data = {
            "date": str(self.current_date),
            "time_part": self.time_part,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "timestamp": datetime.now().isoformat(),
            "user_input": user_data,
            "github_data": github_data,
            "calculated_score": score,
            "status": "local_backup"
        }
        
        filename = f"evening_reflection_{self.current_date.strftime('%Y%m%d')}.json"
        filepath = os.path.join(backup_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, ensure_ascii=False, indent=2)
        
        print(f"💾 로컬 백업 저장: {filepath}")
        logger.info(f"로컬 백업 저장 완료: {filepath}")
        return filepath

    def display_summary(self, user_data: Dict[str, Any], github_data: Dict[str, Any], score: int) -> None:
        """입력 완료 요약 출력"""
        print("\n" + "=" * 50)
        print("📋 저녁자율학습 반성 입력 완료!")
        print("=" * 50)
        print(f"📅 날짜: {self.current_date}")
        print(f"🌙 시간대: {self.time_part} ({self.start_time}-{self.end_time})")
        print(f"📝 학습과목: {user_data.get('study_subjects', 'N/A')}")
        print(f"😊 컨디션: {user_data.get('condition', 'N/A')}")
        print(f"🎯 집중도: {user_data.get('focus_level', 'N/A')}/10")
        print(f"📋 계획달성도: {user_data.get('plan_achievement', 'N/A')}/10")
        print(f"🏆 목표달성도: {user_data.get('daily_goals', 'N/A')}/10")
        print(f"⏰ 학습시간: {user_data.get('learning_hours', 'N/A')}시간")
        print(f"💻 GitHub 커밋: {github_data.get('commits', 0)}개")
        print(f"📊 시간대 점수: {score}점")
        print("💾 저장 상태: ✅ 성공")
        print("💡 오늘 하루 수고하셨습니다! 내일도 화이팅! 🌟")

    def run(self) -> bool:
        """저녁 반성 입력 프로세스 실행"""
        try:
            logger.info("=== 저녁자율학습 반성 입력 시작 ===")
            
            # 환영 메시지 출력
            self.display_welcome()
            
            # 사용자 입력 수집
            user_data = self.collect_user_input()
            if not user_data:
                print("❌ 입력이 취소되었습니다.")
                return False
            
            # GitHub 활동 수집
            github_data = self.collect_github_activities()
            
            # 점수 계산
            score = self.calculate_evening_score(user_data, github_data)
            logger.info(f"저녁 점수 계산: {score}점")
            
            # Notion DB 저장
            notion_success = self.save_to_notion(user_data, github_data, score)
            
            # 로컬 백업 저장
            backup_path = self.save_local_backup(user_data, github_data, score)
            
            # 결과 요약 출력
            self.display_summary(user_data, github_data, score)
            
            logger.info("=== 저녁자율학습 반성 입력 완료 ===")
            return True
            
        except KeyboardInterrupt:
            print("\n❌ 프로그램이 중단되었습니다.")
            logger.info("프로그램 중단")
            return False
        except Exception as e:
            print(f"❌ 오류 발생: {e}")
            logger.error(f"실행 오류: {e}")
            return False

def main():
    """메인 함수"""
    print("🌙 3-Part Daily Reflection System")
    print("   저녁자율학습 반성 입력 모듈")
    print("=" * 60)
    
    # 저녁 반성 입력 실행
    evening_input = EveningReflectionInput()
    success = evening_input.run()
    
    if success:
        print("\n🎉 저녁 반성 입력이 성공적으로 완료되었습니다!")
        print("📝 다음 실행: 내일 오전수업 시작 전 08:00-08:15")
    else:
        print("\n❌ 저녁 반성 입력에 실패했습니다.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
