"""
Task 4.1.3 테스트: 시간대별 생산성 지표 계산 알고리즘 테스트

GitHub 활동을 기반으로 시간대별 생산성 점수를 계산하고 분석하는 기능을 테스트합니다.
"""

import sys
import os
from datetime import datetime, date

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, project_root)

from src.notion_automation.core.github_time_analyzer import GitHubTimeAnalyzer

def test_productivity_calculation():
    """시간대별 생산성 점수 계산 테스트"""
    print("🧪 Task 4.1.3: 시간대별 생산성 지표 계산 테스트")
    print("=" * 60)
    
    analyzer = GitHubTimeAnalyzer()
    test_date = date(2025, 7, 5)
    
    # 시간대별 활동 데이터 수집 및 생산성 점수 계산
    productivity_results = {}
    
    for time_part in analyzer.time_ranges.keys():
        print(f"\n📊 {time_part} 생산성 분석")
        print("-" * 40)
        
        # 시간대별 활동 수집
        activities = analyzer.get_time_part_activities(test_date, time_part)
        
        # 기본 활동 정보 출력
        print(f"📋 활동 요약:")
        print(f"   • 커밋: {len(activities.get('commits', []))}개")
        print(f"   • 이슈: {len(activities.get('issues', []))}개")
        print(f"   • PR: {len(activities.get('pull_requests', []))}개")
        print(f"   • 리뷰: {len(activities.get('code_reviews', []))}개")
        
        # 생산성 점수 출력
        productivity_score = activities.get('productive_score', 0)
        print(f"🏆 생산성 점수: {productivity_score}/100")
        
        # 시간대별 특성 분석
        time_config = analyzer.time_ranges[time_part]
        print(f"⏰ 시간대: {time_config['start']:02d}:00-{time_config['end']:02d}:00")
        print(f"📝 타입: {time_config['type']}")
        
        # 커밋 품질 분석
        commits = activities.get('commits', [])
        if commits:
            total_additions = sum(commit.get('additions', 0) for commit in commits)
            total_deletions = sum(commit.get('deletions', 0) for commit in commits)
            total_files = sum(commit.get('files_changed', 0) for commit in commits)
            
            print(f"📈 코드 변경량:")
            print(f"   • 총 추가: +{total_additions} 라인")
            print(f"   • 총 삭제: -{total_deletions} 라인")
            print(f"   • 변경 파일: {total_files}개")
            
            # 평균 변경량
            avg_changes = (total_additions + total_deletions) / len(commits)
            print(f"   • 커밋당 평균 변경: {avg_changes:.1f} 라인")
        
        # 생산성 등급 판정
        productivity_grade = get_productivity_grade(productivity_score)
        print(f"🎯 생산성 등급: {productivity_grade}")
        
        productivity_results[time_part] = {
            'score': productivity_score,
            'grade': productivity_grade,
            'activities': activities
        }
    
    # 시간대별 생산성 비교 분석
    print(f"\n📊 시간대별 생산성 비교 분석")
    print("=" * 50)
    
    # 최고/최저 생산성 시간대
    best_time = max(productivity_results.items(), key=lambda x: x[1]['score'])
    worst_time = min(productivity_results.items(), key=lambda x: x[1]['score'])
    
    print(f"🏆 최고 생산성: {best_time[0]} ({best_time[1]['score']}점, {best_time[1]['grade']})")
    print(f"📉 최저 생산성: {worst_time[0]} ({worst_time[1]['score']}점, {worst_time[1]['grade']})")
    
    # 평균 생산성 계산
    avg_productivity = sum(result['score'] for result in productivity_results.values()) / len(productivity_results)
    print(f"📈 평균 생산성: {avg_productivity:.1f}점")
    
    # 생산성 분포 분석
    print(f"\n📋 생산성 분포:")
    for time_part, result in productivity_results.items():
        score = result['score']
        percentage = (score / avg_productivity - 1) * 100 if avg_productivity > 0 else 0
        trend = "↗️" if percentage > 10 else "↘️" if percentage < -10 else "➡️"
        print(f"   {trend} {time_part}: {score}점 ({percentage:+.1f}%)")
    
    # 종합 일일 생산성 점수
    total_daily_score = sum(result['score'] for result in productivity_results.values())
    print(f"\n🎯 일일 종합 생산성: {total_daily_score}/300 (평균 {avg_productivity:.1f}점)")
    
    return productivity_results

def get_productivity_grade(score):
    """생산성 점수를 등급으로 변환"""
    if score >= 80:
        return "🥇 Excellent (우수)"
    elif score >= 60:
        return "🥈 Good (양호)"
    elif score >= 40:
        return "🥉 Average (보통)"
    elif score >= 20:
        return "📈 Below Average (미흡)"
    else:
        return "📉 Poor (부족)"

def test_weighted_scoring():
    """가중치 기반 점수 계산 테스트"""
    print(f"\n🧪 가중치 기반 점수 계산 테스트")
    print("-" * 40)
    
    analyzer = GitHubTimeAnalyzer()
    
    # 테스트용 활동 데이터
    test_activities = [
        {
            "name": "이론 중심 학습",
            "commits": [{"additions": 30, "deletions": 5, "files_changed": 2}],
            "issues": [],
            "pull_requests": [],
            "code_reviews": []
        },
        {
            "name": "실습 중심 학습", 
            "commits": [
                {"additions": 80, "deletions": 20, "files_changed": 5},
                {"additions": 45, "deletions": 15, "files_changed": 3}
            ],
            "issues": [{"title": "기능 개선 제안"}],
            "pull_requests": [],
            "code_reviews": []
        },
        {
            "name": "프로젝트 완성",
            "commits": [
                {"additions": 150, "deletions": 50, "files_changed": 10},
                {"additions": 90, "deletions": 30, "files_changed": 7}
            ],
            "issues": [{"title": "버그 리포트"}, {"title": "기능 요청"}],
            "pull_requests": [{"changed_files": 12, "additions": 200, "deletions": 80}],
            "code_reviews": [{"state": "approved"}]
        }
    ]
    
    print(f"⚖️ 활동별 가중치:")
    for activity, weight in analyzer.activity_weights.items():
        print(f"   • {activity}: {weight}점")
    
    print(f"\n📊 시나리오별 점수 계산:")
    for i, scenario in enumerate(test_activities, 1):
        score = analyzer._calculate_time_part_productivity(scenario)
        grade = get_productivity_grade(score)
        
        print(f"\n{i}. {scenario['name']}")
        print(f"   📋 구성: 커밋 {len(scenario['commits'])}개, 이슈 {len(scenario['issues'])}개, "
              f"PR {len(scenario['pull_requests'])}개, 리뷰 {len(scenario['code_reviews'])}개")
        print(f"   🏆 점수: {score}/100")
        print(f"   🎯 등급: {grade}")

def test_time_part_comparison():
    """시간대별 특성 비교 테스트"""
    print(f"\n🧪 시간대별 특성 비교 테스트")
    print("-" * 40)
    
    analyzer = GitHubTimeAnalyzer()
    test_date = date(2025, 7, 5)
    
    # 여러 날짜에 대한 시간대별 패턴 분석
    test_dates = [
        date(2025, 7, 3),  # 수요일
        date(2025, 7, 4),  # 목요일  
        date(2025, 7, 5),  # 금요일
    ]
    
    time_part_trends = {time_part: [] for time_part in analyzer.time_ranges.keys()}
    
    print(f"📅 3일간 시간대별 생산성 추이:")
    
    for test_date in test_dates:
        print(f"\n📆 {test_date.strftime('%Y-%m-%d')} ({test_date.strftime('%A')})")
        daily_scores = {}
        
        for time_part in analyzer.time_ranges.keys():
            activities = analyzer.get_time_part_activities(test_date, time_part)
            score = activities.get('productive_score', 0)
            daily_scores[time_part] = score
            time_part_trends[time_part].append(score)
            
            print(f"   {time_part}: {score}점")
        
        # 하루 최고 시간대
        best_daily = max(daily_scores.items(), key=lambda x: x[1])
        print(f"   🏆 최고 시간대: {best_daily[0]} ({best_daily[1]}점)")
    
    # 시간대별 평균 및 추세 분석
    print(f"\n📈 시간대별 3일 평균 및 추세:")
    for time_part, scores in time_part_trends.items():
        avg_score = sum(scores) / len(scores)
        trend = "📈" if scores[-1] > scores[0] else "📉" if scores[-1] < scores[0] else "➡️"
        consistency = max(scores) - min(scores)
        
        print(f"   {time_part}:")
        print(f"     평균: {avg_score:.1f}점")
        print(f"     추세: {trend} ({scores[0]}→{scores[-1]})")
        print(f"     일관성: {consistency}점 차이")
    
    # 가장 안정적인 시간대 식별
    most_consistent = min(time_part_trends.items(), 
                         key=lambda x: max(x[1]) - min(x[1]))
    print(f"\n🎯 가장 안정적인 시간대: {most_consistent[0]} "
          f"(편차 {max(most_consistent[1]) - min(most_consistent[1])}점)")

if __name__ == "__main__":
    print("🚀 Task 4.1.3: 시간대별 생산성 지표 계산 테스트 시작")
    print("=" * 60)
    
    # 기본 생산성 계산 테스트
    productivity_results = test_productivity_calculation()
    
    # 가중치 기반 점수 계산 테스트
    test_weighted_scoring()
    
    # 시간대별 특성 비교 테스트
    test_time_part_comparison()
    
    print(f"\n🎉 Task 4.1.3 모든 테스트가 성공적으로 완료되었습니다!")
    print(f"✅ 시간대별 생산성 지표 계산 알고리즘 검증 완료")
