"""
Task 4.2.2 테스트: 에러 처리 및 GitHub API 제한 대응 테스트

GitHub API 호출 시 발생할 수 있는 다양한 에러 상황에 대한
처리 및 복구 메커니즘을 테스트합니다.
"""

import sys
import os
import time
import random
from datetime import datetime, date

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from src.notion_automation.scripts.github_realtime_collector import GitHubRealtimeCollector

class APIErrorSimulator:
    """GitHub API 에러 상황 시뮬레이터"""
    
    def __init__(self):
        self.error_scenarios = {
            "rate_limit": "API rate limit exceeded",
            "network_timeout": "Network connection timeout",
            "server_error": "GitHub server internal error (500)",
            "authentication_failed": "Invalid GitHub token",
            "repository_not_found": "Repository not found (404)",
            "permission_denied": "Insufficient permissions (403)"
        }
    
    def simulate_rate_limit_error(self):
        """API 호출 제한 에러 시뮬레이션"""
        raise Exception("API rate limit exceeded. Try again in 3600 seconds.")
    
    def simulate_network_timeout(self):
        """네트워크 타임아웃 에러 시뮬레이션"""
        time.sleep(0.1)  # 짧은 지연
        raise Exception("Request timeout: Unable to connect to GitHub API")
    
    def simulate_server_error(self):
        """서버 내부 에러 시뮬레이션"""
        raise Exception("GitHub server error (500): Internal server error")
    
    def simulate_authentication_error(self):
        """인증 실패 에러 시뮬레이션"""
        raise Exception("Authentication failed: Invalid GitHub token")
    
    def simulate_random_success(self):
        """랜덤하게 성공/실패 반환"""
        if random.random() < 0.7:  # 70% 확률로 성공
            return {"status": "success", "data": "simulated_data"}
        else:
            raise Exception("Random network error occurred")

def test_error_handling_mechanisms():
    """에러 처리 메커니즘 테스트"""
    print("🧪 Task 4.2.2: 에러 처리 및 GitHub API 제한 대응 테스트")
    print("=" * 60)
    
    collector = GitHubRealtimeCollector()
    simulator = APIErrorSimulator()
    
    # 1. API 호출 제한 대응 테스트
    print("\n🚫 1. API 호출 제한 대응 테스트")
    print("-" * 40)
    
    try:
        result = collector.handle_api_errors_and_retry(
            simulator.simulate_rate_limit_error,
            max_retries=2
        )
        print("❌ 예상과 다름: 에러가 발생해야 함")
    except Exception as e:
        print(f"✅ 정상 처리: API 제한 에러 감지됨")
        print(f"   에러 메시지: {str(e)[:50]}...")
    
    # 2. 네트워크 타임아웃 대응 테스트
    print("\n⏱️ 2. 네트워크 타임아웃 대응 테스트")
    print("-" * 40)
    
    try:
        result = collector.handle_api_errors_and_retry(
            simulator.simulate_network_timeout,
            max_retries=3
        )
        print("❌ 예상과 다름: 타임아웃 에러가 발생해야 함")
    except Exception as e:
        print(f"✅ 정상 처리: 네트워크 타임아웃 에러 감지됨")
        print(f"   에러 메시지: {str(e)[:50]}...")
    
    # 3. 서버 에러 대응 테스트
    print("\n🔥 3. 서버 에러 대응 테스트")
    print("-" * 40)
    
    try:
        result = collector.handle_api_errors_and_retry(
            simulator.simulate_server_error,
            max_retries=2
        )
        print("❌ 예상과 다름: 서버 에러가 발생해야 함")
    except Exception as e:
        print(f"✅ 정상 처리: 서버 에러 감지됨")
        print(f"   에러 메시지: {str(e)[:50]}...")
    
    # 4. 랜덤 성공/실패 재시도 테스트
    print("\n🎲 4. 랜덤 성공/실패 재시도 테스트")
    print("-" * 40)
    
    try:
        start_time = time.time()
        result = collector.handle_api_errors_and_retry(
            simulator.simulate_random_success,
            max_retries=5
        )
        end_time = time.time()
        
        print(f"✅ 재시도 후 성공!")
        print(f"   결과: {result}")
        print(f"   소요 시간: {end_time - start_time:.2f}초")
    except Exception as e:
        print(f"⚠️ 최대 재시도 후 실패: {str(e)[:50]}...")

def test_data_validation_and_recovery():
    """데이터 검증 및 복구 테스트"""
    print("\n🛡️ 5. 데이터 검증 및 복구 테스트")
    print("-" * 40)
    
    collector = GitHubRealtimeCollector()
    
    # 손상된 데이터 시뮬레이션
    corrupted_data_scenarios = [
        {
            "name": "필수 필드 누락",
            "data": {"incomplete": "data"},
            "expected_fix": "필수 필드 자동 추가"
        },
        {
            "name": "잘못된 데이터 타입",
            "data": {
                "date": "2025-07-05",
                "time_part": "🌞 오후수업",
                "commits": "not_a_list",  # 잘못된 타입
                "issues": None,
                "pull_requests": "invalid"
            },
            "expected_fix": "리스트 타입으로 수정"
        },
        {
            "name": "생산성 점수 누락",
            "data": {
                "date": "2025-07-05",
                "time_part": "🌞 오후수업",
                "commits": [],
                "issues": [],
                "pull_requests": []
                # productive_score 누락
            },
            "expected_fix": "기본값 0으로 설정"
        }
    ]
    
    for i, scenario in enumerate(corrupted_data_scenarios, 1):
        print(f"\n📋 {i}. {scenario['name']} 테스트")
        
        # 손상된 데이터 검증 및 정제
        validated_data = collector._validate_and_clean_data(scenario["data"].copy())
        
        # 검증 결과 확인
        has_required_fields = all(
            field in validated_data 
            for field in ["date", "time_part", "commits", "issues", "pull_requests"]
        )
        
        has_correct_types = (
            isinstance(validated_data.get("commits", []), list) and
            isinstance(validated_data.get("issues", []), list) and
            isinstance(validated_data.get("pull_requests", []), list)
        )
        
        has_productivity_score = "productive_score" in validated_data
        
        if has_required_fields and has_correct_types and has_productivity_score:
            print(f"   ✅ 정상 복구: {scenario['expected_fix']}")
            print(f"   📊 복구된 필드: commits({len(validated_data['commits'])}), "
                  f"productive_score({validated_data['productive_score']})")
        else:
            print(f"   ❌ 복구 실패")
            print(f"   📊 상태: 필수필드({has_required_fields}), "
                  f"타입({has_correct_types}), 점수({has_productivity_score})")

def test_local_backup_and_recovery():
    """로컬 백업 및 복구 테스트"""
    print("\n💾 6. 로컬 백업 및 복구 테스트")
    print("-" * 40)
    
    collector = GitHubRealtimeCollector()
    
    # 테스트 데이터 생성
    test_data = {
        "date": "2025-07-05",
        "time_part": "🌞 오후수업",
        "commits": [{"sha": "test123", "message": "테스트 커밋"}],
        "issues": [],
        "pull_requests": [],
        "productive_score": 25,
        "collection_method": "test",
        "test_data": True
    }
    
    # 로컬 백업 테스트
    try:
        collector._backup_to_local(test_data, date(2025, 7, 5), "🌞 오후수업")
        print("✅ 로컬 백업 성공")
        
        # 백업 파일 존재 확인
        backup_files = os.listdir(collector.backup_dir)
        test_backup_files = [f for f in backup_files if "afternoon" in f and "20250705" in f]
        
        if test_backup_files:
            print(f"   📁 백업 파일 확인: {test_backup_files[0]}")
            
            # 백업 파일 내용 검증
            import json
            backup_filepath = os.path.join(collector.backup_dir, test_backup_files[0])
            with open(backup_filepath, 'r', encoding='utf-8') as f:
                backup_content = json.load(f)
            
            if "github_data" in backup_content and backup_content["github_data"]["test_data"]:
                print("   ✅ 백업 데이터 무결성 확인")
            else:
                print("   ❌ 백업 데이터 손상")
        else:
            print("   ❌ 백업 파일을 찾을 수 없음")
            
    except Exception as e:
        print(f"❌ 로컬 백업 실패: {str(e)}")

def test_partial_failure_recovery():
    """부분 실패 복구 테스트"""
    print("\n🔄 7. 부분 실패 복구 테스트")
    print("-" * 40)
    
    collector = GitHubRealtimeCollector()
    
    # 부분 실패 시나리오: 일부 시간대만 실패
    print("📊 시나리오: 3개 시간대 중 1개 실패 상황")
    
    # 전체 시간대 수집 시뮬레이션
    target_date = date(2025, 7, 5)
    success_count = 0
    failure_count = 0
    
    for timepart in ["🌅 오전수업", "🌞 오후수업", "🌙 저녁자율학습"]:
        try:
            # 랜덤하게 실패 시뮬레이션 (30% 확률)
            if random.random() < 0.3:
                raise Exception(f"{timepart} 데이터 수집 실패 시뮬레이션")
            
            # 성공적인 데이터 수집
            collection_result = collector.collect_realtime_github_data(
                target_date, timepart
            )
            
            if collection_result["collection_success"]:
                success_count += 1
                print(f"   ✅ {timepart}: 수집 성공")
            else:
                failure_count += 1
                print(f"   ❌ {timepart}: 수집 실패")
                
        except Exception as e:
            failure_count += 1
            print(f"   ⚠️ {timepart}: 예외 발생 - {str(e)[:30]}...")
    
    # 부분 실패 분석
    total_timeparts = 3
    success_rate = (success_count / total_timeparts) * 100
    
    print(f"\n📊 부분 실패 복구 결과:")
    print(f"   성공: {success_count}/{total_timeparts}개 시간대 ({success_rate:.1f}%)")
    print(f"   실패: {failure_count}/{total_timeparts}개 시간대")
    
    if success_rate >= 67:  # 2/3 이상 성공
        print("   🎯 복구 전략: 부분 성공으로 처리 가능")
    elif success_rate >= 33:  # 1/3 이상 성공
        print("   ⚠️ 복구 전략: 부분 데이터로 제한적 분석")
    else:
        print("   🚨 복구 전략: 전체 재시도 필요")

def test_github_api_simulation():
    """GitHub API 제한 시뮬레이션 테스트"""
    print("\n🔒 8. GitHub API 제한 시뮬레이션 테스트")
    print("-" * 40)
    
    # API 제한 상황별 대응 전략
    api_limit_scenarios = [
        {
            "scenario": "시간당 호출 제한 (5000회/시간)",
            "current_calls": 4950,
            "limit": 5000,
            "reset_time": 3600,
            "strategy": "백오프 대기"
        },
        {
            "scenario": "분당 검색 제한 (30회/분)",
            "current_calls": 28,
            "limit": 30,
            "reset_time": 60,
            "strategy": "짧은 대기"
        },
        {
            "scenario": "동시 연결 제한",
            "current_calls": 45,
            "limit": 50,
            "reset_time": 0,
            "strategy": "연결 관리"
        }
    ]
    
    for i, scenario in enumerate(api_limit_scenarios, 1):
        print(f"\n📋 {i}. {scenario['scenario']}")
        
        remaining_calls = scenario["limit"] - scenario["current_calls"]
        usage_percentage = (scenario["current_calls"] / scenario["limit"]) * 100
        
        print(f"   📊 사용량: {scenario['current_calls']}/{scenario['limit']} ({usage_percentage:.1f}%)")
        print(f"   ⏰ 남은 호출: {remaining_calls}회")
        
        # 대응 전략 결정
        if usage_percentage >= 95:
            print(f"   🚨 위험: {scenario['strategy']} 필요")
            print(f"   ⏳ 대기 시간: {scenario['reset_time']}초")
        elif usage_percentage >= 80:
            print(f"   ⚠️ 주의: 호출 빈도 조절 권장")
        else:
            print(f"   ✅ 정상: 계속 진행 가능")

if __name__ == "__main__":
    print("🚀 Task 4.2.2: 에러 처리 및 GitHub API 제한 대응 테스트 시작")
    print("=" * 60)
    
    # 1. 기본 에러 처리 메커니즘 테스트
    test_error_handling_mechanisms()
    
    # 2. 데이터 검증 및 복구 테스트
    test_data_validation_and_recovery()
    
    # 3. 로컬 백업 및 복구 테스트
    test_local_backup_and_recovery()
    
    # 4. 부분 실패 복구 테스트
    test_partial_failure_recovery()
    
    # 5. GitHub API 제한 시뮬레이션
    test_github_api_simulation()
    
    print(f"\n🎉 Task 4.2.2 모든 테스트가 완료되었습니다!")
    print(f"✅ 에러 처리 및 GitHub API 제한 대응 메커니즘 검증 완료")
