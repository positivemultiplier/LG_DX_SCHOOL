"""
3-Part Daily Reflection System - GitHub 시간대별 활동 분류 시스템

Task 4.1.1: 시간대별 GitHub 활동 수집 코어 함수 개발
- codebase_upgrade_analysis.md 기반 시간대별 분류 로직 구현
- 기존 하루 전체 수집 → 시간대별 세분화
- GitHub MCP를 통한 실시간 시간대별 활동 추적
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

logger = ThreePartLogger("github_time_analyzer")

class GitHubTimeAnalyzer:
    """GitHub 시간대별 활동 분석 시스템"""
    
    def __init__(self, owner: str = None, repo: str = None, token: str = None):
        """
        GitHub 시간대별 분석기 초기화
        
        Args:
            owner: GitHub 저장소 소유자
            repo: GitHub 저장소 이름  
            token: GitHub 액세스 토큰
        """
        self.owner = owner or os.getenv("GITHUB_OWNER", "user")
        self.repo = repo or os.getenv("GITHUB_REPO", "repository")
        self.token = token or os.getenv("GITHUB_TOKEN")
        
        # 3-Part 시간대 정의
        self.time_ranges = {
            "🌅 오전수업": {"start": 9, "end": 12, "type": "morning"},
            "🌞 오후수업": {"start": 13, "end": 17, "type": "afternoon"},
            "🌙 저녁자율학습": {"start": 19, "end": 22, "type": "evening"}
        }
        
        # GitHub 활동 유형별 가중치
        self.activity_weights = {
            "commits": 3,      # 커밋이 가장 중요
            "issues": 2,       # 이슈 생성/관리
            "pull_requests": 4, # PR은 협업의 핵심
            "code_reviews": 3,  # 코드 리뷰
            "releases": 5       # 릴리즈는 높은 가치
        }

    def get_time_part_activities(self, target_date: date, time_part: str) -> Dict[str, Any]:
        """
        특정 날짜의 특정 시간대 GitHub 활동 수집
        
        Args:
            target_date: 분석할 날짜
            time_part: 시간대 ("🌅 오전수업", "🌞 오후수업", "🌙 저녁자율학습")
            
        Returns:
            시간대별 GitHub 활동 데이터
        """
        logger.info(f"GitHub 시간대별 활동 수집 시작: {target_date} {time_part}")
        
        if time_part not in self.time_ranges:
            logger.error(f"잘못된 시간대: {time_part}")
            return {}
        
        time_config = self.time_ranges[time_part]
        start_hour = time_config["start"]
        end_hour = time_config["end"]
        
        try:
            # 시간대별 활동 수집 (현재는 시뮬레이션)
            activities = {
                "date": str(target_date),
                "time_part": time_part,
                "time_range": f"{start_hour:02d}:00-{end_hour:02d}:00",
                "owner": self.owner,
                "repo": self.repo,
                "commits": self._get_commits_by_time_range(target_date, start_hour, end_hour),
                "issues": self._get_issues_by_time_range(target_date, start_hour, end_hour),
                "pull_requests": self._get_prs_by_time_range(target_date, start_hour, end_hour),
                "code_reviews": self._get_reviews_by_time_range(target_date, start_hour, end_hour),
                "productive_score": 0  # 나중에 계산
            }
            
            # 생산성 점수 계산
            activities["productive_score"] = self._calculate_time_part_productivity(activities)
            
            logger.info(f"GitHub 활동 수집 완료: {activities['productive_score']}점")
            return activities
            
        except Exception as e:
            logger.error(f"GitHub 활동 수집 오류: {e}")
            return {}

    def _get_commits_by_time_range(self, target_date: date, start_hour: int, end_hour: int) -> List[Dict[str, Any]]:
        """시간대별 커밋 수집 (시뮬레이션)"""
        # 실제 환경에서는 GitHub MCP 도구 사용
        # github_repo 도구나 실제 GitHub API 호출
        
        # 시뮬레이션 데이터 - 시간대별 특성 반영
        if start_hour == 9:  # 오전수업
            commits = [
                {
                    "sha": "abc123",
                    "message": "수업 내용 정리 및 기초 개념 추가",
                    "timestamp": f"{target_date}T10:30:00Z",
                    "author": self.owner,
                    "additions": 45,
                    "deletions": 12,
                    "files_changed": 3,
                    "type": "학습정리"
                },
                {
                    "sha": "def456", 
                    "message": "Python 기초 문법 예제 추가",
                    "timestamp": f"{target_date}T11:15:00Z",
                    "author": self.owner,
                    "additions": 23,
                    "deletions": 5,
                    "files_changed": 2,
                    "type": "예제코드"
                }
            ]
        elif start_hour == 13:  # 오후수업
            commits = [
                {
                    "sha": "ghi789",
                    "message": "HTML 실습 프로젝트 완성",
                    "timestamp": f"{target_date}T14:20:00Z",
                    "author": self.owner,
                    "additions": 78,
                    "deletions": 23,
                    "files_changed": 5,
                    "type": "실습완성"
                },
                {
                    "sha": "jkl012",
                    "message": "CSS 스타일링 개선 및 반응형 적용",
                    "timestamp": f"{target_date}T16:45:00Z",
                    "author": self.owner,
                    "additions": 134,
                    "deletions": 67,
                    "files_changed": 8,
                    "type": "기능개선"
                }
            ]
        else:  # 저녁자율학습
            commits = [
                {
                    "sha": "mno345",
                    "message": "개인 프로젝트 - 사용자 인증 기능 구현",
                    "timestamp": f"{target_date}T20:10:00Z",
                    "author": self.owner,
                    "additions": 189,
                    "deletions": 45,
                    "files_changed": 12,
                    "type": "개인프로젝트"
                },
                {
                    "sha": "pqr678",
                    "message": "알고리즘 문제 해결 및 최적화",
                    "timestamp": f"{target_date}T21:30:00Z",
                    "author": self.owner,
                    "additions": 67,
                    "deletions": 23,
                    "files_changed": 4,
                    "type": "알고리즘"
                }
            ]
        
        logger.info(f"시간대별 커밋 수집: {len(commits)}개 ({start_hour}:00-{end_hour}:00)")
        return commits

    def _get_issues_by_time_range(self, target_date: date, start_hour: int, end_hour: int) -> List[Dict[str, Any]]:
        """시간대별 이슈 수집 (시뮬레이션)"""
        # 시간대별 이슈 특성 반영
        if start_hour == 9:  # 오전수업
            issues = [
                {
                    "number": 15,
                    "title": "수업 중 발생한 오류 해결 필요",
                    "state": "open",
                    "created_at": f"{target_date}T10:45:00Z",
                    "type": "학습질문"
                }
            ]
        elif start_hour == 13:  # 오후수업
            issues = []  # 오후는 실습에 집중
        else:  # 저녁자율학습
            issues = [
                {
                    "number": 16,
                    "title": "개인 프로젝트 기능 개선 아이디어",
                    "state": "open", 
                    "created_at": f"{target_date}T20:30:00Z",
                    "type": "기능제안"
                },
                {
                    "number": 17,
                    "title": "코드 리팩토링 계획",
                    "state": "closed",
                    "created_at": f"{target_date}T21:15:00Z",
                    "type": "개선계획"
                }
            ]
        
        logger.info(f"시간대별 이슈 수집: {len(issues)}개 ({start_hour}:00-{end_hour}:00)")
        return issues

    def _get_prs_by_time_range(self, target_date: date, start_hour: int, end_hour: int) -> List[Dict[str, Any]]:
        """시간대별 Pull Request 수집 (시뮬레이션)"""
        # 시간대별 PR 특성 반영
        if start_hour == 19:  # 저녁자율학습에서 주로 PR 생성
            prs = [
                {
                    "number": 8,
                    "title": "개인 프로젝트 주요 기능 완성",
                    "state": "open",
                    "created_at": f"{target_date}T20:45:00Z",
                    "additions": 256,
                    "deletions": 89,
                    "changed_files": 15,
                    "type": "기능완성"
                }
            ]
        else:
            prs = []  # 다른 시간대에는 PR이 적음
        
        logger.info(f"시간대별 PR 수집: {len(prs)}개 ({start_hour}:00-{end_hour}:00)")
        return prs

    def _get_reviews_by_time_range(self, target_date: date, start_hour: int, end_hour: int) -> List[Dict[str, Any]]:
        """시간대별 코드 리뷰 수집 (시뮬레이션)"""
        # 저녁 시간대에 코드 리뷰 활동
        if start_hour == 19:
            reviews = [
                {
                    "pr_number": 7,
                    "state": "approved",
                    "submitted_at": f"{target_date}T21:00:00Z",
                    "type": "코드리뷰"
                }
            ]
        else:
            reviews = []
        
        logger.info(f"시간대별 리뷰 수집: {len(reviews)}개 ({start_hour}:00-{end_hour}:00)")
        return reviews

    def _calculate_time_part_productivity(self, activities: Dict[str, Any]) -> int:
        """시간대별 생산성 점수 계산"""
        try:
            score = 0
            
            # 활동별 가중치 적용
            score += len(activities.get("commits", [])) * self.activity_weights["commits"]
            score += len(activities.get("issues", [])) * self.activity_weights["issues"] 
            score += len(activities.get("pull_requests", [])) * self.activity_weights["pull_requests"]
            score += len(activities.get("code_reviews", [])) * self.activity_weights["code_reviews"]
            
            # 커밋의 질적 점수 추가
            for commit in activities.get("commits", []):
                # 추가/삭제된 라인 수에 따른 보너스
                lines_changed = commit.get("additions", 0) + commit.get("deletions", 0)
                if lines_changed > 100:
                    score += 5  # 대규모 변경
                elif lines_changed > 50:
                    score += 3  # 중간 규모 변경
                else:
                    score += 1  # 소규모 변경
            
            # PR의 질적 점수 추가
            for pr in activities.get("pull_requests", []):
                files_changed = pr.get("changed_files", 0)
                if files_changed > 10:
                    score += 10  # 대규모 PR
                elif files_changed > 5:
                    score += 7   # 중간 규모 PR
                else:
                    score += 5   # 소규모 PR
            
            # 최대 100점으로 제한
            final_score = min(score, 100)
            
            logger.info(f"생산성 점수 계산 완료: {final_score}점")
            return final_score
            
        except Exception as e:
            logger.error(f"생산성 점수 계산 오류: {e}")
            return 0

    def analyze_daily_github_pattern(self, target_date: date) -> Dict[str, Any]:
        """일일 GitHub 활동 패턴 분석"""
        logger.info(f"일일 GitHub 패턴 분석 시작: {target_date}")
        
        daily_analysis = {
            "date": str(target_date),
            "time_parts": {},
            "total_score": 0,
            "most_productive_time": "",
            "activity_distribution": {},
            "recommendations": []
        }
        
        # 각 시간대별 분석
        for time_part in self.time_ranges.keys():
            activities = self.get_time_part_activities(target_date, time_part)
            if activities:
                daily_analysis["time_parts"][time_part] = activities
                daily_analysis["total_score"] += activities.get("productive_score", 0)
        
        # 가장 생산적인 시간대 식별
        if daily_analysis["time_parts"]:
            most_productive = max(
                daily_analysis["time_parts"].items(),
                key=lambda x: x[1].get("productive_score", 0)
            )
            daily_analysis["most_productive_time"] = most_productive[0]
        
        # 활동 분포 계산
        total_commits = sum(len(part.get("commits", [])) for part in daily_analysis["time_parts"].values())
        total_issues = sum(len(part.get("issues", [])) for part in daily_analysis["time_parts"].values())
        total_prs = sum(len(part.get("pull_requests", [])) for part in daily_analysis["time_parts"].values())
        
        daily_analysis["activity_distribution"] = {
            "total_commits": total_commits,
            "total_issues": total_issues,
            "total_pull_requests": total_prs,
            "commits_per_timepart": total_commits / 3 if total_commits > 0 else 0
        }
        
        # 개선 권장사항 생성
        daily_analysis["recommendations"] = self._generate_recommendations(daily_analysis)
        
        logger.info(f"일일 GitHub 패턴 분석 완료: 총 {daily_analysis['total_score']}점")
        return daily_analysis

    def _generate_recommendations(self, daily_analysis: Dict[str, Any]) -> List[str]:
        """개선 권장사항 생성"""
        recommendations = []
        
        # 가장 생산적인 시간대 기반 권장사항
        most_productive = daily_analysis.get("most_productive_time", "")
        if most_productive:
            recommendations.append(f"{most_productive} 시간대가 가장 생산적입니다. 중요한 작업을 이 시간에 배치하세요.")
        
        # 활동 분포 기반 권장사항  
        distribution = daily_analysis.get("activity_distribution", {})
        total_commits = distribution.get("total_commits", 0)
        total_prs = distribution.get("total_pull_requests", 0)
        
        if total_commits > 10:
            recommendations.append("커밋 수가 많습니다. 더 큰 단위로 묶어서 커밋하는 것을 고려해보세요.")
        elif total_commits < 3:
            recommendations.append("커밋 수가 적습니다. 더 자주 작은 단위로 커밋하는 것을 권장합니다.")
        
        if total_prs == 0:
            recommendations.append("Pull Request를 활용하여 코드 리뷰 및 협업을 늘려보세요.")
        
        return recommendations

    def save_analysis_report(self, daily_analysis: Dict[str, Any]) -> str:
        """분석 보고서 저장"""
        report_dir = "data/github_analysis"
        os.makedirs(report_dir, exist_ok=True)
        
        target_date = daily_analysis.get("date", "unknown")
        filename = f"github_analysis_{target_date.replace('-', '')}.json"
        filepath = os.path.join(report_dir, filename)
        
        # 타임스탬프 추가
        daily_analysis["analysis_timestamp"] = datetime.now().isoformat()
        daily_analysis["analyzer_version"] = "1.0.0"
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(daily_analysis, f, ensure_ascii=False, indent=2)
        
        logger.info(f"GitHub 분석 보고서 저장: {filepath}")
        return filepath

    def analyze_commit_messages_by_timepart(self, commits: List[Dict[str, Any]], time_part: str) -> Dict[str, Any]:
        """
        시간대별 커밋 메시지 분석으로 학습 패턴 식별
        Task 4.1.2: 커밋 메시지 시간대별 분석 및 분류
        
        Args:
            commits: 커밋 리스트
            time_part: 시간대 ("🌅 오전수업", "🌞 오후수업", "🌙 저녁자율학습")
            
        Returns:
            커밋 메시지 분석 결과
        """
        
        # 시간대별 학습 패턴 키워드 정의
        patterns = {
            "🌅 오전수업": {
                "keywords": ["강의", "수업", "이론", "개념", "학습", "노트", "정리", "기초", "문법", "원리"],
                "categories": {
                    "theory_learning": ["이론", "개념", "원리", "기초"],
                    "note_taking": ["노트", "정리", "요약", "메모"],
                    "lecture_content": ["강의", "수업", "학습", "설명"],
                    "basic_practice": ["예제", "기초", "연습", "문법"]
                }
            },
            "🌞 오후수업": {
                "keywords": ["실습", "프로젝트", "구현", "실행", "테스트", "과제", "기능", "개발", "완성", "적용"],
                "categories": {
                    "hands_on_practice": ["실습", "실행", "연습", "따라하기"],
                    "project_work": ["프로젝트", "과제", "작업", "개발"],
                    "implementation": ["구현", "개발", "완성", "작성"],
                    "testing_debugging": ["테스트", "디버깅", "수정", "개선"]
                }
            },
            "🌙 저녁자율학습": {
                "keywords": ["복습", "자율", "개인", "정리", "예습", "연구", "실험", "심화", "개선", "확장"],
                "categories": {
                    "review_study": ["복습", "정리", "요약", "재학습"],
                    "personal_project": ["개인", "자율", "프로젝트", "실험"],
                    "advanced_learning": ["심화", "확장", "고급", "추가"],
                    "research_exploration": ["연구", "탐구", "분석", "조사"]
                }
            }
        }
        
        if time_part not in patterns:
            logger.warning(f"알 수 없는 시간대: {time_part}")
            return {}
        
        time_patterns = patterns[time_part]
        
        analysis = {
            "time_part": time_part,
            "total_commits": len(commits),
            "analyzed_at": datetime.now().isoformat(),
            "pattern_analysis": {
                "matching_keywords": [],
                "pattern_match_rate": 0.0,
                "dominant_pattern": "",
                "learning_focus_areas": []
            },
            "category_distribution": {
                category: 0 for category in time_patterns["categories"].keys()
            },
            "commit_classification": [],
            "learning_insights": {
                "primary_activity": "",
                "secondary_activity": "",
                "learning_depth": "shallow",  # shallow, moderate, deep
                "collaboration_level": "individual"  # individual, collaborative
            },
            "recommendations": []
        }
        
        if not commits:
            return analysis
        
        # 각 커밋 메시지 분석
        matched_keywords = set()
        category_counts = {category: 0 for category in time_patterns["categories"].keys()}
        
        for commit in commits:
            message = commit.get("message", "").lower()
            commit_analysis = {
                "sha": commit.get("sha", "unknown"),
                "message": commit.get("message", ""),
                "timestamp": commit.get("timestamp", ""),
                "matched_keywords": [],
                "categories": [],
                "learning_type": "unknown",
                "complexity_level": "basic"
            }
            
            # 키워드 매칭
            for keyword in time_patterns["keywords"]:
                if keyword in message:
                    matched_keywords.add(keyword)
                    commit_analysis["matched_keywords"].append(keyword)
            
            # 카테고리 분류
            for category, category_keywords in time_patterns["categories"].items():
                for keyword in category_keywords:
                    if keyword in message:
                        category_counts[category] += 1
                        commit_analysis["categories"].append(category)
                        break
            
            # 학습 유형 및 복잡도 분석
            commit_analysis["learning_type"] = self._determine_learning_type(message, time_part)
            commit_analysis["complexity_level"] = self._determine_complexity_level(commit)
            
            analysis["commit_classification"].append(commit_analysis)
        
        # 패턴 분석 완료
        analysis["pattern_analysis"]["matching_keywords"] = list(matched_keywords)
        analysis["pattern_analysis"]["pattern_match_rate"] = (
            len(matched_keywords) / len(time_patterns["keywords"]) * 100
        )
        
        # 지배적 패턴 식별
        if category_counts:
            dominant_category = max(category_counts.items(), key=lambda x: x[1])
            analysis["pattern_analysis"]["dominant_pattern"] = dominant_category[0]
        
        # 카테고리 분포 업데이트
        analysis["category_distribution"] = category_counts
        
        # 학습 초점 영역 식별
        focus_areas = [category for category, count in category_counts.items() if count > 0]
        analysis["pattern_analysis"]["learning_focus_areas"] = focus_areas
        
        # 학습 인사이트 생성
        analysis["learning_insights"] = self._generate_learning_insights(
            category_counts, commits, time_part
        )
        
        # 개선 권장사항 생성
        analysis["recommendations"] = self._generate_timepart_recommendations(
            analysis, time_part
        )
        
        logger.info(f"커밋 메시지 분석 완료 - {time_part}: {len(commits)}개 커밋, "
                   f"매칭률 {analysis['pattern_analysis']['pattern_match_rate']:.1f}%")
        
        return analysis
    
    def _determine_learning_type(self, message: str, time_part: str) -> str:
        """커밋 메시지로부터 학습 유형 결정"""
        message_lower = message.lower()
        
        # 학습 유형 패턴
        learning_types = {
            "theoretical": ["이론", "개념", "원리", "정의", "설명"],
            "practical": ["실습", "구현", "실행", "테스트", "적용"],
            "creative": ["프로젝트", "창작", "개발", "설계", "실험"],
            "review": ["복습", "정리", "요약", "재정리", "점검"],
            "research": ["연구", "탐구", "분석", "조사", "심화"]
        }
        
        for learning_type, keywords in learning_types.items():
            if any(keyword in message_lower for keyword in keywords):
                return learning_type
        
        # 기본값: 시간대에 따른 추정
        defaults = {
            "🌅 오전수업": "theoretical",
            "🌞 오후수업": "practical", 
            "🌙 저녁자율학습": "creative"
        }
        
        return defaults.get(time_part, "unknown")
    
    def _determine_complexity_level(self, commit: Dict[str, Any]) -> str:
        """커밋의 복잡도 수준 결정"""
        additions = commit.get("additions", 0)
        deletions = commit.get("deletions", 0)
        files_changed = commit.get("files_changed", 1)
        
        total_changes = additions + deletions
        
        if total_changes > 200 or files_changed > 10:
            return "advanced"
        elif total_changes > 50 or files_changed > 5:
            return "intermediate"
        else:
            return "basic"
    
    def _generate_learning_insights(self, category_counts: Dict[str, int], 
                                   commits: List[Dict[str, Any]], time_part: str) -> Dict[str, str]:
        """학습 인사이트 생성"""
        insights = {
            "primary_activity": "",
            "secondary_activity": "",
            "learning_depth": "shallow",
            "collaboration_level": "individual"
        }
        
        # 주요/보조 활동 식별
        sorted_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
        if sorted_categories:
            insights["primary_activity"] = sorted_categories[0][0]
            if len(sorted_categories) > 1:
                insights["secondary_activity"] = sorted_categories[1][0]
        
        # 학습 깊이 평가
        total_commits = len(commits)
        if total_commits > 5:
            insights["learning_depth"] = "deep"
        elif total_commits > 2:
            insights["learning_depth"] = "moderate"
        
        # 협업 수준 평가 (PR, 리뷰 기반)
        # 이 부분은 추후 실제 GitHub 데이터 연동 시 개선
        
        return insights
    
    def _generate_timepart_recommendations(self, analysis: Dict[str, Any], time_part: str) -> List[str]:
        """시간대별 개선 권장사항 생성"""
        recommendations = []
        
        pattern_match_rate = analysis["pattern_analysis"]["pattern_match_rate"]
        total_commits = analysis["total_commits"]
        category_dist = analysis["category_distribution"]
        
        # 시간대별 특화 권장사항
        timepart_advice = {
            "🌅 오전수업": {
                "low_activity": "오전 시간에 더 많은 학습 노트 정리를 권장합니다.",
                "good_pattern": "이론 학습 패턴이 우수합니다. 계속 유지하세요.",
                "improvement": "실습 예제를 추가하여 이론과 실습의 균형을 맞춰보세요."
            },
            "🌞 오후수업": {
                "low_activity": "오후 실습 시간을 더 적극적으로 활용해보세요.",
                "good_pattern": "실습 및 프로젝트 진행이 활발합니다.",
                "improvement": "테스트 코드 작성을 늘려 코드 품질을 향상시켜보세요."
            },
            "🌙 저녁자율학습": {
                "low_activity": "저녁 자율학습 시간을 더 체계적으로 활용해보세요.",
                "good_pattern": "자기주도적 학습이 잘 이뤄지고 있습니다.",
                "improvement": "개인 프로젝트의 범위를 확장해보세요."
            }
        }
        
        advice = timepart_advice.get(time_part, {})
        
        # 활동 수준에 따른 권장사항
        if total_commits == 0:
            recommendations.append(f"🔔 {time_part} 시간대에 GitHub 활동이 없습니다.")
            recommendations.append(advice.get("low_activity", ""))
        elif total_commits < 3:
            recommendations.append(f"📈 {time_part} 활동을 조금 더 늘려보세요.")
        else:
            recommendations.append(advice.get("good_pattern", ""))
        
        # 패턴 매칭률에 따른 권장사항
        if pattern_match_rate < 30:
            recommendations.append(f"💡 {time_part}에 적합한 활동 패턴을 늘려보세요.")
        elif pattern_match_rate > 70:
            recommendations.append(f"🎯 {time_part} 학습 패턴이 매우 우수합니다!")
        
        # 카테고리 다양성 권장사항
        active_categories = sum(1 for count in category_dist.values() if count > 0)
        if active_categories < 2:
            recommendations.append(advice.get("improvement", ""))
        
        return [rec for rec in recommendations if rec] or [f"{time_part} 활동 분석 완료"]
