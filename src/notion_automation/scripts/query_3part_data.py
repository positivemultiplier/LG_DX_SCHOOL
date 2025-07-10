"""
3-Part Daily Reflection System - 시간대별 데이터 조회 스크립트

Task 3.2.1: 시간대별 데이터 조회 스크립트 개발
- 특정 날짜 + 시간대 데이터 조회
- 일일 3-Part 종합 조회
- mcp_notion_query-database 활용
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

logger = ThreePartLogger("query_3part_data")

class ThreePartDataQuery:
    """3-Part 데이터 조회 시스템"""
    
    def __init__(self, database_id: Optional[str] = None):
        """
        3-Part 데이터 조회기 초기화
        
        Args:
            database_id: Notion 3-Part 데이터베이스 ID
        """
        self.database_id = database_id or os.getenv("NOTION_3PART_DATABASE_ID")
        self.time_parts = {
            "morning": "🌅 오전수업",
            "afternoon": "🌞 오후수업", 
            "evening": "🌙 저녁자율학습"
        }
        
    def display_welcome(self) -> None:
        """조회 시스템 시작 인사말"""
        print("🔍 3-Part Daily Reflection 데이터 조회 시스템")
        print("=" * 60)
        print("📊 시간대별/일별 반성 데이터를 조회할 수 있습니다")
        print()

    def get_query_options(self) -> Dict[str, Any]:
        """사용자로부터 조회 옵션 수집"""
        logger.info("조회 옵션 수집 시작")
        
        print("🔍 조회 옵션을 선택해주세요:")
        print("1. 특정 날짜의 특정 시간대 조회")
        print("2. 특정 날짜의 전체 3-Part 조회") 
        print("3. 최근 N일간 시간대별 요약")
        print("4. 주간 3-Part 종합 분석")
        print("5. 월간 3-Part 트렌드 분석")
        
        while True:
            try:
                choice = input("\n👉 선택 (1-5): ").strip()
                if choice in ["1", "2", "3", "4", "5"]:
                    break
                print("❌ 1-5 중에서 선택해주세요.")
            except KeyboardInterrupt:
                print("\n❌ 조회가 취소되었습니다.")
                return {}
        
        query_config = {"type": choice}
        
        # 조회 타입별 상세 옵션 수집
        if choice == "1":
            # 특정 날짜 + 시간대
            query_config.update(self._get_specific_datetime_query())
        elif choice == "2":
            # 특정 날짜 전체
            query_config.update(self._get_specific_date_query())
        elif choice == "3":
            # 최근 N일간
            query_config.update(self._get_recent_days_query())
        elif choice == "4":
            # 주간 분석
            query_config.update(self._get_weekly_query())
        elif choice == "5":
            # 월간 분석
            query_config.update(self._get_monthly_query())
        
        logger.info(f"조회 옵션 수집 완료: {query_config}")
        return query_config

    def _get_specific_datetime_query(self) -> Dict[str, Any]:
        """특정 날짜 + 시간대 조회 옵션"""
        print("\n📅 특정 날짜의 특정 시간대 조회")
        
        # 날짜 입력
        while True:
            try:
                date_str = input("👉 날짜 입력 (YYYY-MM-DD, 예: 2025-07-05): ").strip()
                if not date_str:
                    date_str = str(date.today())
                    print(f"   💡 오늘 날짜로 설정: {date_str}")
                
                query_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                break
            except ValueError:
                print("❌ 올바른 날짜 형식으로 입력해주세요 (YYYY-MM-DD)")
        
        # 시간대 선택
        print("\n⏰ 시간대를 선택해주세요:")
        print("1. 🌅 오전수업 (08:00-12:00)")
        print("2. 🌞 오후수업 (13:00-17:00)")
        print("3. 🌙 저녁자율학습 (19:00-22:00)")
        
        while True:
            time_choice = input("👉 시간대 선택 (1-3): ").strip()
            if time_choice == "1":
                time_part = "🌅 오전수업"
                break
            elif time_choice == "2":
                time_part = "🌞 오후수업"
                break
            elif time_choice == "3":
                time_part = "🌙 저녁자율학습"
                break
            else:
                print("❌ 1-3 중에서 선택해주세요.")
        
        return {
            "date": query_date,
            "time_part": time_part
        }

    def _get_specific_date_query(self) -> Dict[str, Any]:
        """특정 날짜 전체 조회 옵션"""
        print("\n📅 특정 날짜의 전체 3-Part 조회")
        
        while True:
            try:
                date_str = input("👉 날짜 입력 (YYYY-MM-DD, 예: 2025-07-05): ").strip()
                if not date_str:
                    date_str = str(date.today())
                    print(f"   💡 오늘 날짜로 설정: {date_str}")
                
                query_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                break
            except ValueError:
                print("❌ 올바른 날짜 형식으로 입력해주세요 (YYYY-MM-DD)")
        
        return {"date": query_date}

    def _get_recent_days_query(self) -> Dict[str, Any]:
        """최근 N일간 조회 옵션"""
        print("\n📊 최근 N일간 시간대별 요약")
        
        while True:
            try:
                days = input("👉 최근 며칠간 조회? (숫자, 기본: 7일): ").strip()
                if not days:
                    days = 7
                    print("   💡 최근 7일로 설정")
                else:
                    days = int(days)
                    if days <= 0 or days > 30:
                        print("❌ 1-30 사이의 숫자를 입력해주세요.")
                        continue
                break
            except ValueError:
                print("❌ 숫자를 입력해주세요.")
        
        return {"days": days}

    def _get_weekly_query(self) -> Dict[str, Any]:
        """주간 분석 조회 옵션"""
        print("\n📈 주간 3-Part 종합 분석")
        
        # 주간 옵션 선택
        print("1. 이번 주 (월-일)")
        print("2. 지난 주")
        print("3. 특정 주 선택")
        
        while True:
            week_choice = input("👉 주 선택 (1-3): ").strip()
            if week_choice in ["1", "2", "3"]:
                break
            print("❌ 1-3 중에서 선택해주세요.")
        
        if week_choice == "1":
            # 이번 주
            today = date.today()
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)
        elif week_choice == "2":
            # 지난 주
            today = date.today()
            start_date = today - timedelta(days=today.weekday() + 7)
            end_date = start_date + timedelta(days=6)
        else:
            # 특정 주
            while True:
                try:
                    date_str = input("👉 해당 주의 임의 날짜 입력 (YYYY-MM-DD): ").strip()
                    target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                    start_date = target_date - timedelta(days=target_date.weekday())
                    end_date = start_date + timedelta(days=6)
                    break
                except ValueError:
                    print("❌ 올바른 날짜 형식으로 입력해주세요 (YYYY-MM-DD)")
        
        return {
            "start_date": start_date,
            "end_date": end_date
        }

    def _get_monthly_query(self) -> Dict[str, Any]:
        """월간 분석 조회 옵션"""
        print("\n📅 월간 3-Part 트렌드 분석")
        
        while True:
            try:
                month_str = input("👉 조회할 월 입력 (YYYY-MM, 예: 2025-07): ").strip()
                if not month_str:
                    today = date.today()
                    month_str = f"{today.year}-{today.month:02d}"
                    print(f"   💡 이번 달로 설정: {month_str}")
                
                year, month = map(int, month_str.split('-'))
                start_date = date(year, month, 1)
                
                # 해당 월의 마지막 날 계산
                if month == 12:
                    end_date = date(year + 1, 1, 1) - timedelta(days=1)
                else:
                    end_date = date(year, month + 1, 1) - timedelta(days=1)
                    
                break
            except ValueError:
                print("❌ 올바른 형식으로 입력해주세요 (YYYY-MM)")
        
        return {
            "start_date": start_date,
            "end_date": end_date
        }

    def query_specific_datetime(self, target_date: date, time_part: str) -> Dict[str, Any]:
        """특정 날짜 + 시간대 데이터 조회"""
        logger.info(f"특정 날짜/시간대 조회: {target_date}, {time_part}")
        
        # 시뮬레이션 - 실제 환경에서는 mcp_notion_query-database 사용
        print(f"🔍 {target_date} {time_part} 데이터 조회 중...")
        
        # 로컬 백업 파일에서 조회 시도
        backup_data = self._query_from_local_backup(target_date, time_part)
        
        if backup_data:
            print("📁 로컬 백업에서 데이터 발견!")
            return backup_data
        else:
            print("❌ 해당 날짜/시간대 데이터를 찾을 수 없습니다.")
            return {}

    def query_specific_date(self, target_date: date) -> Dict[str, Any]:
        """특정 날짜 전체 3-Part 데이터 조회"""
        logger.info(f"특정 날짜 전체 조회: {target_date}")
        
        print(f"🔍 {target_date} 전체 3-Part 데이터 조회 중...")
        
        all_data = {}
        for time_key, time_part in self.time_parts.items():
            backup_data = self._query_from_local_backup(target_date, time_part)
            if backup_data:
                all_data[time_key] = backup_data
        
        if all_data:
            print(f"📊 {len(all_data)}/3 시간대 데이터 발견!")
            return all_data
        else:
            print("❌ 해당 날짜의 데이터를 찾을 수 없습니다.")
            return {}

    def _query_from_local_backup(self, target_date: date, time_part: str) -> Optional[Dict[str, Any]]:
        """로컬 백업 파일에서 데이터 조회"""
        try:
            date_str = target_date.strftime("%Y%m%d")
            
            # 시간대별 폴더 매핑
            folder_map = {
                "🌅 오전수업": "morning_reflections",
                "🌞 오후수업": "afternoon_reflections",
                "🌙 저녁자율학습": "evening_reflections"
            }
            
            folder = folder_map.get(time_part)
            if not folder:
                return None
            
            file_prefix = folder.replace("_reflections", "_reflection")
            filepath = f"data/{folder}/{file_prefix}_{date_str}.json"
            
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    return json.load(f)
            
            return None
            
        except Exception as e:
            logger.error(f"로컬 백업 조회 오류: {e}")
            return None

    def display_specific_data(self, data: Dict[str, Any], target_date: date, time_part: str) -> None:
        """특정 데이터 상세 출력"""
        if not data:
            return
        
        print("\n" + "=" * 60)
        print(f"📊 {target_date} {time_part} 상세 데이터")
        print("=" * 60)
        
        # 기본 정보
        print(f"📅 날짜: {data.get('date', 'N/A')}")
        print(f"⏰ 시간대: {data.get('time_part', 'N/A')}")
        print(f"🕒 시간범위: {data.get('start_time', 'N/A')}-{data.get('end_time', 'N/A')}")
        print(f"📊 종합점수: {data.get('calculated_score', 'N/A')}점")
        
        # 사용자 입력 데이터
        user_input = data.get('user_input', {})
        if user_input:
            print("\n📝 입력 데이터:")
            for key, value in user_input.items():
                print(f"   • {key}: {value}")
        
        # GitHub 데이터
        github_data = data.get('github_data', {})
        if github_data:
            print("\n🔗 GitHub 활동:")
            print(f"   • 커밋: {github_data.get('commits', 0)}개")
            print(f"   • PR: {github_data.get('prs', 0)}개")
            print(f"   • 이슈: {github_data.get('issues', 0)}개")
            print(f"   • 활동내용: {github_data.get('activities', 'N/A')}")

    def display_daily_summary(self, all_data: Dict[str, Any], target_date: date) -> None:
        """일일 3-Part 종합 요약 출력"""
        if not all_data:
            return
        
        print("\n" + "=" * 60)
        print(f"📊 {target_date} 일일 3-Part 종합 요약")
        print("=" * 60)
        
        total_score = 0
        total_parts = 0
        
        # 시간대별 요약
        for time_key, time_part in self.time_parts.items():
            if time_key in all_data:
                data = all_data[time_key]
                score = data.get('calculated_score', 0)
                total_score += score
                total_parts += 1
                
                print(f"\n{time_part}:")
                print(f"   📊 점수: {score}점")
                
                # 주요 정보 요약
                user_input = data.get('user_input', {})
                if 'condition' in user_input:
                    print(f"   😊 컨디션: {user_input['condition']}")
                if 'learning_hours' in user_input:
                    print(f"   ⏰ 학습시간: {user_input['learning_hours']}시간")
                
                # GitHub 활동 요약
                github_data = data.get('github_data', {})
                commits = github_data.get('commits', 0)
                if commits > 0:
                    print(f"   💻 GitHub 커밋: {commits}개")
            else:
                print(f"\n{time_part}: ❌ 데이터 없음")
        
        # 일일 종합 점수
        if total_parts > 0:
            avg_score = total_score / total_parts
            print(f"\n🏆 일일 종합:")
            print(f"   📊 평균 점수: {avg_score:.1f}점")
            print(f"   ✅ 완성도: {total_parts}/3 시간대")
            
            # 하루 평가
            if avg_score >= 80:
                evaluation = "🌟 훌륭한 하루!"
            elif avg_score >= 70:
                evaluation = "😊 좋은 하루!"
            elif avg_score >= 60:
                evaluation = "😐 보통의 하루"
            else:
                evaluation = "😔 아쉬운 하루"
            
            print(f"   🎯 하루 평가: {evaluation}")

    def run(self) -> bool:
        """데이터 조회 프로세스 실행"""
        try:
            logger.info("=== 3-Part 데이터 조회 시작 ===")
            
            # 환영 메시지 출력
            self.display_welcome()
            
            # 조회 옵션 수집
            query_config = self.get_query_options()
            if not query_config:
                return False
            
            # 조회 타입별 실행
            query_type = query_config.get("type")
            
            if query_type == "1":
                # 특정 날짜 + 시간대
                data = self.query_specific_datetime(
                    query_config["date"], 
                    query_config["time_part"]
                )
                if data:
                    self.display_specific_data(
                        data, 
                        query_config["date"], 
                        query_config["time_part"]
                    )
                
            elif query_type == "2":
                # 특정 날짜 전체
                all_data = self.query_specific_date(query_config["date"])
                if all_data:
                    self.display_daily_summary(all_data, query_config["date"])
                    
                    # 개별 시간대 상세 조회 여부 확인
                    show_details = input("\n📝 개별 시간대 상세 정보도 보시겠습니까? (y/n): ").strip().lower()
                    if show_details in ['y', 'yes']:
                        for time_key, data in all_data.items():
                            time_part = self.time_parts[time_key]
                            self.display_specific_data(data, query_config["date"], time_part)
            
            elif query_type in ["3", "4", "5"]:
                print("🚧 해당 기능은 향후 버전에서 구현 예정입니다.")
                print("💡 현재는 특정 날짜/시간대 조회만 지원됩니다.")
            
            logger.info("=== 3-Part 데이터 조회 완료 ===")
            return True
            
        except KeyboardInterrupt:
            print("\n❌ 조회가 중단되었습니다.")
            logger.info("조회 중단")
            return False
        except Exception as e:
            print(f"❌ 조회 중 오류 발생: {e}")
            logger.error(f"조회 오류: {e}")
            return False

def main():
    """메인 함수"""
    print("🔍 3-Part Daily Reflection 데이터 조회 시스템")
    print("=" * 60)
    
    # 데이터 조회 실행
    query_system = ThreePartDataQuery()
    success = query_system.run()
    
    if success:
        print("\n✅ 데이터 조회가 완료되었습니다!")
    else:
        print("\n❌ 데이터 조회에 실패했습니다.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
