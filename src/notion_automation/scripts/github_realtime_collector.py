"""
Task 4.2.1: GitHub MCP 실시간 데이터 수집 스크립트

Phase 4: GitHub 시간대별 연동 & 정량화
실시간으로 GitHub 활동을 수집하여 시간대별로 분류하고
3-Part Notion DB에 자동 연동하는 스크립트

Author: AI Assistant (이어받아 구현)
Date: 2025-07-05
"""

import os
import sys
import json
import logging
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional, Tuple

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
sys.path.insert(0, project_root)

from src.notion_automation.utils.logger import ThreePartLogger
from src.notion_automation.core.github_time_analyzer import GitHubTimeAnalyzer

logger = ThreePartLogger("github_realtime_collector")

class GitHubRealtimeCollector:
    """GitHub MCP 실시간 데이터 수집 및 Notion 연동 시스템"""
    
    def __init__(self, owner: Optional[str] = None, repo: Optional[str] = None):
        """
        실시간 GitHub 수집기 초기화
        
        Args:
            owner: GitHub 저장소 소유자
            repo: GitHub 저장소 이름
        """
        self.owner = owner or os.getenv("GITHUB_OWNER", "user")
        self.repo = repo or os.getenv("GITHUB_REPO", "LG_DX_School")
        
        # GitHub 시간대별 분석기 초기화
        self.analyzer = GitHubTimeAnalyzer(owner=self.owner, repo=self.repo)
        
        # 실시간 수집 설정
        self.collection_config = {
            "enable_real_github_api": False,  # 실제 GitHub API 사용 여부
            "use_simulation": True,           # 시뮬레이션 모드 사용
            "backup_to_local": True,         # 로컬 백업 활성화
            "auto_notion_sync": True,        # Notion 자동 동기화
            "error_retry_count": 3,          # 에러 시 재시도 횟수
            "api_timeout_seconds": 30        # API 타임아웃 시간
        }
        
        # 백업 디렉토리 생성
        self.backup_dir = os.path.join(project_root, "data", "github_realtime")
        os.makedirs(self.backup_dir, exist_ok=True)
        
        logger.info("GitHub 실시간 수집기 초기화 완료")

    def collect_realtime_github_data(self, target_date: Optional[date] = None, 
                                   specific_timepart: Optional[str] = None) -> Dict[str, Any]:
        """
        실시간 GitHub 활동 데이터 수집
        
        Args:
            target_date: 수집할 날짜 (기본값: 오늘)
            specific_timepart: 특정 시간대만 수집 (선택사항)
            
        Returns:
            시간대별 GitHub 활동 데이터
        """
        if target_date is None:
            target_date = datetime.now().date()
        
        logger.info(f"실시간 GitHub 데이터 수집 시작: {target_date}")
        
        try:
            # 현재 시간대 자동 식별
            current_timepart = self._get_current_timepart()
            
            # 특정 시간대 지정이 없으면 현재 시간대 사용
            if specific_timepart is None:
                timeparts_to_collect = [current_timepart]
                logger.info(f"현재 시간대 자동 식별: {current_timepart}")
            else:
                timeparts_to_collect = [specific_timepart]
                logger.info(f"지정된 시간대 수집: {specific_timepart}")
            
            # 시간대별 데이터 수집
            collected_data = {}
            
            for timepart in timeparts_to_collect:
                logger.info(f"{timepart} 시간대 데이터 수집 중...")
                
                # GitHub 활동 수집 (실제 또는 시뮬레이션)
                github_activities = self._collect_timepart_activities(target_date, timepart)
                
                # 데이터 검증 및 정제
                validated_data = self._validate_and_clean_data(github_activities)
                
                # 로컬 백업
                if self.collection_config["backup_to_local"]:
                    self._backup_to_local(validated_data, target_date, timepart)
                
                collected_data[timepart] = validated_data
                
                logger.info(f"{timepart} 데이터 수집 완료: "
                          f"{validated_data.get('commits', 0)}개 커밋, "
                          f"생산성 점수 {validated_data.get('productive_score', 0)}점")
            
            # 수집 결과 종합
            collection_result = {
                "collection_date": target_date.isoformat(),
                "collection_time": datetime.now().isoformat(),
                "collected_timeparts": list(collected_data.keys()),
                "total_timeparts": len(collected_data),
                "data": collected_data,
                "collection_success": True,
                "collection_method": "simulation" if self.collection_config["use_simulation"] else "real_api",
                "notes": f"실시간 수집 완료 - {len(collected_data)}개 시간대"
            }
            
            logger.info(f"실시간 GitHub 데이터 수집 완료: {len(collected_data)}개 시간대")
            return collection_result
            
        except Exception as e:
            logger.error(f"실시간 GitHub 데이터 수집 실패: {str(e)}")
            return self._create_empty_collection_result(target_date, str(e))

    def _get_current_timepart(self) -> str:
        """현재 시간을 기준으로 해당 시간대 반환"""
        current_hour = datetime.now().hour
        
        # 시간대 매핑
        if 9 <= current_hour < 12:
            return "🌅 오전수업"
        elif 13 <= current_hour < 17:
            return "🌞 오후수업"
        elif 19 <= current_hour < 22:
            return "🌙 저녁자율학습"
        else:
            # 수업 시간이 아닌 경우 가장 가까운 시간대 반환
            if current_hour < 9:
                return "🌅 오전수업"
            elif current_hour < 13:
                return "🌅 오전수업"
            elif current_hour < 19:
                return "🌞 오후수업"
            else:
                return "🌙 저녁자율학습"

    def _collect_timepart_activities(self, target_date: date, timepart: str) -> Dict[str, Any]:
        """특정 시간대의 GitHub 활동 수집"""
        try:
            if self.collection_config["enable_real_github_api"]:
                # 실제 GitHub API 호출 (향후 구현)
                return self._collect_real_github_activities(target_date, timepart)
            else:
                # 시뮬레이션 모드
                return self._collect_simulated_activities(target_date, timepart)
                
        except Exception as e:
            logger.error(f"{timepart} 활동 수집 실패: {str(e)}")
            return self._create_empty_timepart_data(timepart)

    def _collect_real_github_activities(self, target_date: date, timepart: str) -> Dict[str, Any]:
        """실제 GitHub MCP를 통한 활동 수집 (향후 구현)"""
        # TODO: 실제 GitHub MCP 도구 연동
        logger.warning("실제 GitHub MCP 연동은 추후 구현 예정")
        
        # 현재는 기존 분석기 활용
        return self.analyzer.get_time_part_activities(target_date, timepart)

    def _collect_simulated_activities(self, target_date: date, timepart: str) -> Dict[str, Any]:
        """시뮬레이션 모드로 GitHub 활동 수집"""
        logger.info(f"시뮬레이션 모드로 {timepart} 활동 수집")
        
        # 기존 GitHub 분석기 활용
        activities = self.analyzer.get_time_part_activities(target_date, timepart)
        
        # 실시간 수집 정보 추가
        activities.update({
            "collection_method": "simulation",
            "collection_timestamp": datetime.now().isoformat(),
            "is_realtime": True,
            "data_source": "github_time_analyzer"
        })
        
        return activities

    def _validate_and_clean_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """수집된 데이터 검증 및 정제"""
        try:
            # 필수 필드 확인
            required_fields = ["date", "time_part", "commits", "issues", "pull_requests"]
            for field in required_fields:
                if field not in raw_data:
                    logger.warning(f"필수 필드 누락: {field}")
                    raw_data[field] = [] if field in ["commits", "issues", "pull_requests"] else ""
            
            # 데이터 타입 검증
            if not isinstance(raw_data.get("commits", []), list):
                raw_data["commits"] = []
            
            if not isinstance(raw_data.get("issues", []), list):
                raw_data["issues"] = []
            
            if not isinstance(raw_data.get("pull_requests", []), list):
                raw_data["pull_requests"] = []
            
            # 생산성 점수 검증
            if "productive_score" not in raw_data or not isinstance(raw_data["productive_score"], (int, float)):
                raw_data["productive_score"] = 0
            
            # 검증 완료 표시
            raw_data["data_validated"] = True
            raw_data["validation_timestamp"] = datetime.now().isoformat()
            
            logger.info("데이터 검증 및 정제 완료")
            return raw_data
            
        except Exception as e:
            logger.error(f"데이터 검증 실패: {str(e)}")
            return raw_data

    def _backup_to_local(self, data: Dict[str, Any], target_date: date, timepart: str):
        """로컬 파일로 데이터 백업"""
        try:
            # 파일명 생성
            timepart_safe = timepart.replace("🌅", "morning").replace("🌞", "afternoon").replace("🌙", "evening")
            timepart_safe = timepart_safe.replace(" ", "_").replace("자율학습", "study")
            
            filename = f"github_realtime_{timepart_safe}_{target_date.strftime('%Y%m%d')}.json"
            filepath = os.path.join(self.backup_dir, filename)
            
            # JSON 형태로 저장
            backup_data = {
                "backup_info": {
                    "created_at": datetime.now().isoformat(),
                    "target_date": target_date.isoformat(),
                    "timepart": timepart,
                    "collector_version": "4.2.1"
                },
                "github_data": data
            }
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(backup_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"로컬 백업 완료: {filepath}")
            
        except Exception as e:
            logger.error(f"로컬 백업 실패: {str(e)}")

    def _create_empty_timepart_data(self, timepart: str) -> Dict[str, Any]:
        """빈 시간대 데이터 생성"""
        return {
            "date": datetime.now().date().isoformat(),
            "time_part": timepart,
            "commits": [],
            "issues": [],
            "pull_requests": [],
            "code_reviews": [],
            "productive_score": 0,
            "collection_method": "empty",
            "error": True,
            "data_source": "fallback"
        }

    def _create_empty_collection_result(self, target_date: date, error_message: str) -> Dict[str, Any]:
        """빈 수집 결과 생성"""
        return {
            "collection_date": target_date.isoformat(),
            "collection_time": datetime.now().isoformat(),
            "collected_timeparts": [],
            "total_timeparts": 0,
            "data": {},
            "collection_success": False,
            "error_message": error_message,
            "collection_method": "failed"
        }

    def integrate_with_notion_3part(self, github_data: Dict[str, Any], 
                                  reflection_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        GitHub 데이터를 3-Part Notion DB에 자동 통합
        
        Args:
            github_data: 수집된 GitHub 활동 데이터
            reflection_data: 기존 반성 입력 데이터 (선택사항)
            
        Returns:
            Notion 통합 결과
        """
        logger.info("GitHub 데이터 Notion 3-Part DB 통합 시작")
        
        try:
            # 통합할 데이터 준비
            integrated_data = self._prepare_notion_integration_data(github_data, reflection_data)
            
            # Notion MCP 연동 (현재는 시뮬레이션)
            if self.collection_config["auto_notion_sync"]:
                notion_result = self._sync_to_notion_database(integrated_data)
            else:
                notion_result = {"status": "disabled", "message": "Notion 동기화가 비활성화됨"}
            
            integration_result = {
                "integration_timestamp": datetime.now().isoformat(),
                "github_data_processed": True,
                "notion_sync_result": notion_result,
                "integrated_timeparts": list(github_data.get("data", {}).keys()),
                "success": True
            }
            
            logger.info("GitHub-Notion 통합 완료")
            return integration_result
            
        except Exception as e:
            logger.error(f"GitHub-Notion 통합 실패: {str(e)}")
            return {
                "integration_timestamp": datetime.now().isoformat(),
                "success": False,
                "error": str(e)
            }

    def _prepare_notion_integration_data(self, github_data: Dict[str, Any], 
                                       reflection_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Notion 통합을 위한 데이터 준비"""
        integrated_data = {}
        
        # GitHub 데이터 처리
        for timepart, activities in github_data.get("data", {}).items():
            integrated_entry = {
                "time_part": timepart,
                "date": activities.get("date"),
                "github_commit_count": len(activities.get("commits", [])),
                "github_issue_count": len(activities.get("issues", [])),
                "github_pr_count": len(activities.get("pull_requests", [])),
                "github_productivity_score": activities.get("productive_score", 0),
                "github_activities_summary": self._create_activities_summary(activities),
                "data_source": "github_realtime_collector"
            }
            
            # 기존 반성 데이터와 병합 (있는 경우)
            if reflection_data and timepart in reflection_data:
                integrated_entry.update(reflection_data[timepart])
            
            integrated_data[timepart] = integrated_entry
        
        return integrated_data

    def _create_activities_summary(self, activities: Dict[str, Any]) -> str:
        """GitHub 활동 요약 텍스트 생성"""
        commits = activities.get("commits", [])
        issues = activities.get("issues", [])
        prs = activities.get("pull_requests", [])
        
        summary_parts = []
        
        if commits:
            summary_parts.append(f"커밋 {len(commits)}개")
            # 주요 커밋 메시지 포함
            if len(commits) > 0:
                main_commit = commits[0].get("message", "")[:50]
                summary_parts.append(f"(주요: {main_commit}...)")
        
        if issues:
            summary_parts.append(f"이슈 {len(issues)}개")
        
        if prs:
            summary_parts.append(f"PR {len(prs)}개")
        
        return ", ".join(summary_parts) if summary_parts else "활동 없음"

    def _sync_to_notion_database(self, integrated_data: Dict[str, Any]) -> Dict[str, Any]:
        """Notion 데이터베이스에 동기화 (현재는 시뮬레이션)"""
        logger.info("Notion DB 동기화 시뮬레이션 실행")
        
        # TODO: 실제 mcp_notion 도구 연동
        sync_results = []
        
        for timepart, entry_data in integrated_data.items():
            # 시뮬레이션 결과
            sync_result = {
                "timepart": timepart,
                "notion_page_id": f"mock_page_id_{timepart}_{datetime.now().timestamp()}",
                "sync_status": "success",
                "sync_method": "simulation",
                "data_fields_updated": len(entry_data)
            }
            sync_results.append(sync_result)
        
        return {
            "sync_timestamp": datetime.now().isoformat(),
            "total_entries": len(sync_results),
            "successful_syncs": len(sync_results),
            "failed_syncs": 0,
            "sync_details": sync_results,
            "method": "simulation"
        }

    def handle_api_errors_and_retry(self, operation_func, max_retries: Optional[int] = None) -> Any:
        """
        API 에러 처리 및 재시도 메커니즘
        
        Args:
            operation_func: 실행할 함수
            max_retries: 최대 재시도 횟수
            
        Returns:
            함수 실행 결과
        """
        if max_retries is None:
            max_retries = self.collection_config["error_retry_count"]
        
        last_error: Optional[Exception] = None
        
        for attempt in range(max_retries + 1):
            try:
                logger.info(f"API 호출 시도 {attempt + 1}/{max_retries + 1}")
                result = operation_func()
                logger.info("API 호출 성공")
                return result
                
            except Exception as e:
                last_error = e
                logger.warning(f"API 호출 실패 (시도 {attempt + 1}): {str(e)}")
                
                if attempt < max_retries:
                    # 지수 백오프 적용
                    wait_time = 2 ** attempt
                    logger.info(f"{wait_time}초 대기 후 재시도...")
                    import time
                    time.sleep(wait_time)
                else:
                    logger.error(f"최대 재시도 횟수 초과. 마지막 에러: {str(e)}")
        
        # 모든 재시도 실패
        if last_error is not None:
            raise last_error
        else:
            raise Exception("알 수 없는 오류로 인한 실패")

    def get_collection_status(self) -> Dict[str, Any]:
        """수집기 상태 정보 반환"""
        return {
            "collector_info": {
                "version": "4.2.1",
                "owner": self.owner,
                "repo": self.repo,
                "status": "active"
            },
            "configuration": self.collection_config,
            "backup_directory": self.backup_dir,
            "current_timepart": self._get_current_timepart(),
            "analyzer_available": self.analyzer is not None
        }


def test_realtime_collector():
    """GitHub 실시간 수집기 테스트"""
    print("🧪 Task 4.2.1: GitHub MCP 실시간 데이터 수집 테스트")
    print("=" * 60)
    
    # 수집기 초기화
    collector = GitHubRealtimeCollector(owner="test_user", repo="LG_DX_School")
    
    # 상태 확인
    status = collector.get_collection_status()
    print(f"📊 수집기 상태:")
    print(f"   버전: {status['collector_info']['version']}")
    print(f"   대상 저장소: {status['collector_info']['owner']}/{status['collector_info']['repo']}")
    print(f"   현재 시간대: {status['current_timepart']}")
    print(f"   백업 디렉토리: {status['backup_directory']}")
    
    # 실시간 데이터 수집 테스트
    print(f"\n🔄 실시간 GitHub 데이터 수집 테스트:")
    test_date = datetime.now().date()
    
    # 현재 시간대 자동 수집
    collection_result = collector.collect_realtime_github_data(test_date)
    
    if collection_result["collection_success"]:
        print(f"✅ 수집 성공!")
        print(f"   수집 날짜: {collection_result['collection_date']}")
        print(f"   수집 시간대: {collection_result['collected_timeparts']}")
        print(f"   수집 방법: {collection_result['collection_method']}")
        
        # 수집된 데이터 요약
        for timepart, data in collection_result["data"].items():
            print(f"\n📋 {timepart} 수집 결과:")
            print(f"   커밋: {len(data.get('commits', []))}개")
            print(f"   이슈: {len(data.get('issues', []))}개")
            print(f"   PR: {len(data.get('pull_requests', []))}개")
            print(f"   생산성 점수: {data.get('productive_score', 0)}점")
    else:
        print(f"❌ 수집 실패: {collection_result.get('error_message', '알 수 없는 오류')}")
    
    # Notion 통합 테스트
    print(f"\n🔗 Notion 3-Part DB 통합 테스트:")
    integration_result = collector.integrate_with_notion_3part(collection_result)
    
    if integration_result["success"]:
        print(f"✅ 통합 성공!")
        print(f"   통합 시간대: {integration_result['integrated_timeparts']}")
        print(f"   Notion 동기화: {integration_result['notion_sync_result']['method']}")
    else:
        print(f"❌ 통합 실패: {integration_result.get('error', '알 수 없는 오류')}")
    
    print(f"\n🎉 Task 4.2.1 테스트 완료!")
    return True


if __name__ == "__main__":
    test_realtime_collector()
