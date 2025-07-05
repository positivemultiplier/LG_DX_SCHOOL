"""
Task 4.1.2 테스트: 커밋 메시지 시간대별 분석 및 분류 테스트

GitHub 커밋 메시지를 시간대별로 분석하여 학습 패턴을 식별하는 기능을 테스트합니다.
"""

import sys
import os
from datetime import datetime, date

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, project_root)

from src.notion_automation.core.github_time_analyzer import GitHubTimeAnalyzer

def test_commit_message_analysis():
    """커밋 메시지 분석 기능 테스트"""
    print("🧪 Task 4.1.2: 커밋 메시지 시간대별 분석 테스트")
    print("=" * 60)
    
    analyzer = GitHubTimeAnalyzer()
    
    # 테스트용 커밋 데이터 (시간대별 특성 반영)
    test_commits = {
        "🌅 오전수업": [
            {
                "sha": "abc123",
                "message": "Python 기초 문법 이론 정리 및 개념 노트 추가",
                "timestamp": "2025-07-05T10:30:00Z",
                "additions": 45,
                "deletions": 12,
                "files_changed": 3
            },
            {
                "sha": "def456", 
                "message": "수업 내용 요약 및 학습 포인트 정리",
                "timestamp": "2025-07-05T11:15:00Z",
                "additions": 23,
                "deletions": 5,
                "files_changed": 2
            },
            {
                "sha": "ghi789",
                "message": "객체지향 프로그래밍 개념 설명 추가",
                "timestamp": "2025-07-05T11:45:00Z",
                "additions": 67,
                "deletions": 8,
                "files_changed": 4
            }
        ],
        "🌞 오후수업": [
            {
                "sha": "jkl012",
                "message": "HTML 실습 프로젝트 구현 시작",
                "timestamp": "2025-07-05T14:20:00Z",
                "additions": 78,
                "deletions": 23,
                "files_changed": 5
            },
            {
                "sha": "mno345",
                "message": "CSS 스타일링 실습 및 반응형 웹 적용",
                "timestamp": "2025-07-05T15:30:00Z",
                "additions": 134,
                "deletions": 67,
                "files_changed": 8
            },
            {
                "sha": "pqr678",
                "message": "JavaScript 기능 구현 및 테스트 완료",
                "timestamp": "2025-07-05T16:45:00Z",
                "additions": 89,
                "deletions": 34,
                "files_changed": 6
            },
            {
                "sha": "stu901",
                "message": "과제 제출용 프로젝트 최종 완성",
                "timestamp": "2025-07-05T16:55:00Z",
                "additions": 45,
                "deletions": 12,
                "files_changed": 3
            }
        ],
        "🌙 저녁자율학습": [
            {
                "sha": "vwx234",
                "message": "개인 프로젝트: React 컴포넌트 설계 및 구현",
                "timestamp": "2025-07-05T20:15:00Z",
                "additions": 156,
                "deletions": 89,
                "files_changed": 12
            },
            {
                "sha": "yza567",
                "message": "복습: 오늘 배운 내용 정리 및 심화 학습",
                "timestamp": "2025-07-05T20:45:00Z",
                "additions": 67,
                "deletions": 23,
                "files_changed": 4
            },
            {
                "sha": "bcd890",
                "message": "자율 연구: 고급 알고리즘 실험 및 분석",
                "timestamp": "2025-07-05T21:30:00Z",
                "additions": 123,
                "deletions": 45,
                "files_changed": 7
            },
            {
                "sha": "efg123",
                "message": "개인 포트폴리오 사이트 기능 확장",
                "timestamp": "2025-07-05T21:50:00Z",
                "additions": 89,
                "deletions": 34,
                "files_changed": 9
            }
        ]
    }
    
    # 각 시간대별 커밋 메시지 분석 테스트
    for time_part, commits in test_commits.items():
        print(f"\n📊 {time_part} 커밋 메시지 분석")
        print("-" * 40)
        
        analysis = analyzer.analyze_commit_messages_by_timepart(commits, time_part)
        
        # 기본 정보 출력
        print(f"📋 분석 대상: {analysis['total_commits']}개 커밋")
        print(f"🎯 패턴 매칭률: {analysis['pattern_analysis']['pattern_match_rate']:.1f}%")
        print(f"🏆 지배적 패턴: {analysis['pattern_analysis']['dominant_pattern']}")
        
        # 매칭된 키워드 출력
        keywords = analysis['pattern_analysis']['matching_keywords']
        if keywords:
            print(f"🔍 매칭 키워드: {', '.join(keywords)}")
        
        # 학습 초점 영역 출력
        focus_areas = analysis['pattern_analysis']['learning_focus_areas']
        if focus_areas:
            print(f"📚 학습 초점: {', '.join(focus_areas)}")
        
        # 카테고리 분포 출력
        print(f"📈 카테고리 분포:")
        for category, count in analysis['category_distribution'].items():
            if count > 0:
                print(f"   • {category}: {count}개")
        
        # 학습 인사이트 출력
        insights = analysis['learning_insights']
        print(f"💡 학습 인사이트:")
        print(f"   • 주요 활동: {insights['primary_activity']}")
        if insights['secondary_activity']:
            print(f"   • 보조 활동: {insights['secondary_activity']}")
        print(f"   • 학습 깊이: {insights['learning_depth']}")
        
        # 개선 권장사항 출력
        if analysis['recommendations']:
            print(f"🎯 개선 권장사항:")
            for i, rec in enumerate(analysis['recommendations'], 1):
                print(f"   {i}. {rec}")
        
        # 개별 커밋 분류 결과 (상위 3개만)
        print(f"🔍 개별 커밋 분류 (상위 3개):")
        for i, commit_analysis in enumerate(analysis['commit_classification'][:3], 1):
            print(f"   {i}. {commit_analysis['message'][:50]}...")
            print(f"      학습유형: {commit_analysis['learning_type']}, "
                  f"복잡도: {commit_analysis['complexity_level']}")
            if commit_analysis['matched_keywords']:
                print(f"      키워드: {', '.join(commit_analysis['matched_keywords'])}")
    
    # 종합 비교 분석
    print(f"\n📊 시간대별 종합 비교")
    print("=" * 40)
    
    total_commits = sum(len(commits) for commits in test_commits.values())
    print(f"📋 전체 분석 커밋: {total_commits}개")
    
    # 시간대별 활동량 비교
    print(f"📈 시간대별 활동량:")
    for time_part, commits in test_commits.items():
        analysis = analyzer.analyze_commit_messages_by_timepart(commits, time_part)
        pattern_rate = analysis['pattern_analysis']['pattern_match_rate']
        print(f"   • {time_part}: {len(commits)}개 커밋 (패턴 매칭 {pattern_rate:.1f}%)")
    
    # 가장 활발한 시간대 식별
    most_active_time = max(test_commits.items(), key=lambda x: len(x[1]))
    print(f"🏆 가장 활발한 시간대: {most_active_time[0]} ({len(most_active_time[1])}개 커밋)")
    
    # 가장 높은 패턴 매칭률을 가진 시간대
    pattern_rates = {}
    for time_part, commits in test_commits.items():
        analysis = analyzer.analyze_commit_messages_by_timepart(commits, time_part)
        pattern_rates[time_part] = analysis['pattern_analysis']['pattern_match_rate']
    
    best_pattern_time = max(pattern_rates.items(), key=lambda x: x[1])
    print(f"🎯 가장 적합한 패턴: {best_pattern_time[0]} ({best_pattern_time[1]:.1f}% 매칭)")
    
    print(f"\n✅ Task 4.1.2 커밋 메시지 분석 테스트 완료!")
    return True

def test_learning_type_determination():
    """학습 유형 결정 기능 테스트"""
    print(f"\n🧪 학습 유형 결정 기능 테스트")
    print("-" * 30)
    
    analyzer = GitHubTimeAnalyzer()
    
    test_messages = [
        ("Python 기초 이론 정리", "🌅 오전수업"),
        ("HTML 실습 프로젝트 구현", "🌞 오후수업"), 
        ("개인 프로젝트 연구 및 실험", "🌙 저녁자율학습"),
        ("오늘 배운 내용 복습 정리", "🌙 저녁자율학습"),
        ("JavaScript 기능 테스트 완료", "🌞 오후수업")
    ]
    
    for message, time_part in test_messages:
        learning_type = analyzer._determine_learning_type(message, time_part)
        print(f"📝 '{message}' → {learning_type}")
    
    print("✅ 학습 유형 결정 테스트 완료!")

def test_complexity_determination():
    """복잡도 결정 기능 테스트"""
    print(f"\n🧪 복잡도 결정 기능 테스트")
    print("-" * 30)
    
    analyzer = GitHubTimeAnalyzer()
    
    test_commits = [
        {"additions": 10, "deletions": 5, "files_changed": 1},    # basic
        {"additions": 80, "deletions": 30, "files_changed": 6},  # intermediate  
        {"additions": 250, "deletions": 100, "files_changed": 15}, # advanced
    ]
    
    for i, commit in enumerate(test_commits, 1):
        complexity = analyzer._determine_complexity_level(commit)
        print(f"📊 커밋 {i}: +{commit['additions']} -{commit['deletions']} "
              f"({commit['files_changed']}파일) → {complexity}")
    
    print("✅ 복잡도 결정 테스트 완료!")

if __name__ == "__main__":
    print("🚀 Task 4.1.2: 커밋 메시지 시간대별 분석 테스트 시작")
    print("=" * 60)
    
    test_commit_message_analysis()
    test_learning_type_determination()
    test_complexity_determination()
    
    print(f"\n🎉 모든 테스트가 성공적으로 완료되었습니다!")
