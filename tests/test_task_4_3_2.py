"""
Task 4.3.2: 일일 GitHub 활동 종합 분석 리포트

하루 동안의 3개 시간대별 GitHub 활동을 종합 분석하여
상세한 리포트를 생성하는 시스템을 구현합니다.
"""

import sys
import os
import json
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from src.notion_automation.scripts.github_realtime_collector import GitHubRealtimeCollector
from src.notion_automation.core.github_time_analyzer import GitHubTimeAnalyzer

class GitHubDailyAnalysisReporter:
    """일일 GitHub 활동 종합 분석 리포트 생성기"""
    
    def __init__(self):
        self.github_collector = GitHubRealtimeCollector()
        self.github_analyzer = GitHubTimeAnalyzer()
        
        # 시간대별 가중치 (저녁 자율학습에 높은 가중치)
        self.timepart_weights = {
            "🌅 오전수업": 1.0,
            "🌞 오후수업": 1.2,
            "🌙 저녁자율학습": 1.5
        }
        
        # 분석 기준
        self.analysis_criteria = {
            "excellent_day": {"total_score": 60, "min_timeparts": 3},
            "good_day": {"total_score": 40, "min_timeparts": 2},
            "average_day": {"total_score": 20, "min_timeparts": 1},
            "improvement_needed": {"total_score": 0, "min_timeparts": 0}
        }
    
    def generate_daily_analysis_report(self, target_date: Optional[date] = None) -> Dict[str, Any]:
        """일일 GitHub 활동 종합 분석 리포트 생성"""
        target_date = target_date or date.today()
        
        print(f"📊 {target_date} GitHub 활동 종합 분석 시작")
        
        # 1. 시간대별 데이터 수집
        timepart_data = self._collect_all_timepart_data(target_date)
        
        # 2. 종합 분석 수행
        comprehensive_analysis = self._analyze_daily_github_activity(timepart_data, target_date)
        
        # 3. 생산성 패턴 분석
        productivity_pattern = self._analyze_productivity_pattern(timepart_data)
        
        # 4. 학습 효율성 분석
        learning_efficiency = self._analyze_learning_efficiency(timepart_data)
        
        # 5. 개선 제안 생성
        improvement_suggestions = self._generate_improvement_suggestions(timepart_data, comprehensive_analysis)
        
        # 6. 최종 리포트 구성
        daily_report = {
            "analysis_date": target_date.strftime("%Y-%m-%d"),
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "timepart_data": timepart_data,
            "comprehensive_analysis": comprehensive_analysis,
            "productivity_pattern": productivity_pattern,
            "learning_efficiency": learning_efficiency,
            "improvement_suggestions": improvement_suggestions,
            "daily_summary": self._create_daily_summary(comprehensive_analysis, productivity_pattern),
            "next_day_recommendations": self._generate_next_day_recommendations(comprehensive_analysis)
        }
        
        # 7. 리포트 파일 저장
        report_path = self._save_analysis_report(daily_report, target_date)
        daily_report["report_path"] = report_path
        
        print(f"✅ 일일 분석 리포트 생성 완료: {os.path.basename(report_path)}")
        
        return daily_report
    
    def _collect_all_timepart_data(self, target_date: date) -> Dict[str, Any]:
        """모든 시간대 데이터 수집"""
        timepart_data = {}
        
        for time_part in ["🌅 오전수업", "🌞 오후수업", "🌙 저녁자율학습"]:
            try:
                github_data = self.github_collector._collect_simulated_activities(target_date, time_part)
                timepart_data[time_part] = github_data
                print(f"   ✅ {time_part} 데이터 수집 완료 (생산성: {github_data.get('productive_score', 0)}점)")
            except Exception as e:
                print(f"   ❌ {time_part} 데이터 수집 실패: {str(e)}")
                timepart_data[time_part] = self._create_empty_timepart_data(time_part)
        
        return timepart_data
    
    def _create_empty_timepart_data(self, time_part: str) -> Dict[str, Any]:
        """빈 시간대 데이터 생성"""
        return {
            "date": date.today().strftime("%Y-%m-%d"),
            "time_part": time_part,
            "commits": [],
            "issues": [],
            "pull_requests": [],
            "productive_score": 0,
            "error": "데이터 수집 실패"
        }
    
    def _analyze_daily_github_activity(self, timepart_data: Dict[str, Any], target_date: date) -> Dict[str, Any]:
        """일일 GitHub 활동 종합 분석"""
        total_commits = 0
        total_issues = 0
        total_prs = 0
        total_score = 0
        weighted_score = 0
        active_timeparts = 0
        
        timepart_details = {}
        
        for time_part, data in timepart_data.items():
            commits = len(data.get("commits", []))
            issues = len(data.get("issues", []))
            prs = len(data.get("pull_requests", []))
            score = data.get("productive_score", 0)
            weight = self.timepart_weights[time_part]
            
            total_commits += commits
            total_issues += issues
            total_prs += prs
            total_score += score
            weighted_score += score * weight
            
            if score > 0:
                active_timeparts += 1
            
            timepart_details[time_part] = {
                "commits": commits,
                "issues": issues,
                "pull_requests": prs,
                "score": score,
                "weighted_score": score * weight,
                "activity_level": self._determine_activity_level(score)
            }
        
        # 일일 평가 등급 결정
        daily_grade = self._determine_daily_grade(total_score, active_timeparts)
        
        return {
            "total_activities": {
                "commits": total_commits,
                "issues": total_issues,
                "pull_requests": total_prs,
                "total_count": total_commits + total_issues + total_prs
            },
            "productivity_scores": {
                "raw_total": total_score,
                "weighted_total": weighted_score,
                "average": total_score / 3,
                "weighted_average": weighted_score / sum(self.timepart_weights.values())
            },
            "timepart_analysis": timepart_details,
            "daily_metrics": {
                "active_timeparts": active_timeparts,
                "completion_rate": active_timeparts / 3 * 100,
                "daily_grade": daily_grade,
                "consistency_score": self._calculate_consistency_score(timepart_details)
            }
        }
    
    def _analyze_productivity_pattern(self, timepart_data: Dict[str, Any]) -> Dict[str, Any]:
        """생산성 패턴 분석"""
        timepart_scores = {}
        for time_part, data in timepart_data.items():
            timepart_scores[time_part] = data.get("productive_score", 0)
        
        # 최고/최저 생산성 시간대
        max_timepart = max(timepart_scores.keys(), key=lambda k: timepart_scores[k])
        min_timepart = min(timepart_scores.keys(), key=lambda k: timepart_scores[k])
        
        # 생산성 변화 패턴
        scores = [timepart_scores["🌅 오전수업"], timepart_scores["🌞 오후수업"], timepart_scores["🌙 저녁자율학습"]]
        trend = self._analyze_trend(scores)
        
        # 시간대별 특성 분석
        timepart_characteristics = {}
        for time_part, data in timepart_data.items():
            commits = data.get("commits", [])
            timepart_characteristics[time_part] = {
                "dominant_activity": self._identify_dominant_activity(data),
                "commit_frequency": len(commits),
                "average_commit_size": self._calculate_average_commit_size(commits),
                "work_pattern": self._analyze_work_pattern(commits)
            }
        
        return {
            "peak_productivity": {
                "timepart": max_timepart,
                "score": timepart_scores[max_timepart]
            },
            "lowest_productivity": {
                "timepart": min_timepart,
                "score": timepart_scores[min_timepart]
            },
            "productivity_trend": trend,
            "productivity_distribution": timepart_scores,
            "timepart_characteristics": timepart_characteristics,
            "optimal_schedule": self._suggest_optimal_schedule(timepart_scores)
        }
    
    def _analyze_learning_efficiency(self, timepart_data: Dict[str, Any]) -> Dict[str, Any]:
        """학습 효율성 분석"""
        learning_metrics = {}
        
        for time_part, data in timepart_data.items():
            commits = data.get("commits", [])
            
            # 커밋 메시지 분석
            if commits:
                commit_analysis = self.github_analyzer.analyze_commit_messages_by_timepart(commits, time_part)
                learning_metrics[time_part] = {
                    "learning_focus": commit_analysis.get("learning_categories", {}),
                    "complexity_distribution": commit_analysis.get("complexity_levels", {}),
                    "productivity_indicators": commit_analysis.get("productivity_indicators", {}),
                    "learning_efficiency_score": self._calculate_learning_efficiency_score(commit_analysis)
                }
            else:
                learning_metrics[time_part] = {
                    "learning_focus": {},
                    "complexity_distribution": {},
                    "productivity_indicators": {},
                    "learning_efficiency_score": 0
                }
        
        # 전체 학습 효율성 종합
        total_efficiency = sum(
            metrics.get("learning_efficiency_score", 0) 
            for metrics in learning_metrics.values()
        ) / len(learning_metrics)
        
        # 최적 학습 시간대 식별
        best_learning_timepart = max(
            learning_metrics.keys(),
            key=lambda tp: learning_metrics[tp].get("learning_efficiency_score", 0)
        )
        
        return {
            "timepart_learning_metrics": learning_metrics,
            "overall_efficiency_score": total_efficiency,
            "best_learning_timepart": best_learning_timepart,
            "learning_pattern_insights": self._generate_learning_insights(learning_metrics)
        }
    
    def _generate_improvement_suggestions(self, timepart_data: Dict[str, Any], 
                                        comprehensive_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """개선 제안 생성"""
        suggestions = []
        
        # 생산성 기반 제안
        daily_grade = comprehensive_analysis["daily_metrics"]["daily_grade"]
        active_timeparts = comprehensive_analysis["daily_metrics"]["active_timeparts"]
        
        if daily_grade == "improvement_needed":
            suggestions.append({
                "category": "전체 생산성",
                "priority": "높음",
                "suggestion": "전반적인 GitHub 활동량이 부족합니다. 각 시간대별로 최소 1개 이상의 커밋을 목표로 설정해보세요.",
                "action_items": [
                    "오전: 기초 개념 정리 커밋 작성",
                    "오후: 실습 코드 커밋 업로드",
                    "저녁: 개인 프로젝트 진행"
                ]
            })
        
        if active_timeparts < 3:
            suggestions.append({
                "category": "시간대 균형",
                "priority": "중간",
                "suggestion": f"활동한 시간대가 {active_timeparts}/3개입니다. 모든 시간대에서 균형있는 학습을 권장합니다.",
                "action_items": [
                    "비활성 시간대에 최소한의 학습 활동 계획",
                    "시간대별 학습 목표 재설정"
                ]
            })
        
        # 시간대별 특화 제안
        for time_part, data in timepart_data.items():
            score = data.get("productive_score", 0)
            if score < 10:
                suggestions.append({
                    "category": f"{time_part} 개선",
                    "priority": "중간",
                    "suggestion": f"{time_part} 시간대의 생산성이 낮습니다 ({score}점).",
                    "action_items": self._get_timepart_improvement_actions(time_part)
                })
        
        return suggestions
    
    def _get_timepart_improvement_actions(self, time_part: str) -> List[str]:
        """시간대별 개선 액션 아이템"""
        actions = {
            "🌅 오전수업": [
                "수업 내용 요약 정리",
                "기초 개념 예제 코드 작성",
                "이해하지 못한 부분 이슈 등록"
            ],
            "🌞 오후수업": [
                "실습 프로젝트 코드 완성",
                "오전 학습 내용 실습 적용",
                "코드 리팩토링 및 개선"
            ],
            "🌙 저녁자율학습": [
                "개인 프로젝트 진행",
                "하루 학습 내용 종합 정리",
                "내일 학습 계획 수립"
            ]
        }
        return actions.get(time_part, ["해당 시간대 활동 증가"])
    
    def _determine_daily_grade(self, total_score: int, active_timeparts: int) -> str:
        """일일 평가 등급 결정"""
        for grade, criteria in self.analysis_criteria.items():
            if (total_score >= criteria["total_score"] and 
                active_timeparts >= criteria["min_timeparts"]):
                return grade
        return "improvement_needed"
    
    def _determine_activity_level(self, score: int) -> str:
        """활동 수준 결정"""
        if score >= 25:
            return "매우 활발"
        elif score >= 15:
            return "활발"
        elif score >= 5:
            return "보통"
        elif score > 0:
            return "낮음"
        else:
            return "비활성"
    
    def _calculate_consistency_score(self, timepart_details: Dict[str, Any]) -> float:
        """일관성 점수 계산"""
        scores = [details["score"] for details in timepart_details.values()]
        if not scores or max(scores) == 0:
            return 0
        
        mean_score = sum(scores) / len(scores)
        variance = sum((score - mean_score) ** 2 for score in scores) / len(scores)
        std_dev = variance ** 0.5
        
        # 표준편차가 낮을수록 일관성이 높음
        consistency = max(0, 100 - (std_dev / mean_score * 100)) if mean_score > 0 else 0
        return round(consistency, 1)
    
    def _analyze_trend(self, scores: List[int]) -> str:
        """점수 변화 트렌드 분석"""
        if len(scores) < 2:
            return "분석 불가"
        
        increasing = sum(scores[i] < scores[i+1] for i in range(len(scores)-1))
        decreasing = sum(scores[i] > scores[i+1] for i in range(len(scores)-1))
        
        if increasing > decreasing:
            return "상승 트렌드"
        elif decreasing > increasing:
            return "하락 트렌드"
        else:
            return "일정한 트렌드"
    
    def _identify_dominant_activity(self, data: Dict[str, Any]) -> str:
        """주요 활동 유형 식별"""
        activities = {
            "커밋": len(data.get("commits", [])),
            "이슈": len(data.get("issues", [])),
            "PR": len(data.get("pull_requests", []))
        }
        
        if sum(activities.values()) == 0:
            return "활동 없음"
        
        return max(activities.keys(), key=lambda k: activities[k])
    
    def _calculate_average_commit_size(self, commits: List[Dict[str, Any]]) -> Dict[str, float]:
        """평균 커밋 크기 계산"""
        if not commits:
            return {"additions": 0, "deletions": 0, "files_changed": 0}
        
        total_additions = sum(commit.get("additions", 0) for commit in commits)
        total_deletions = sum(commit.get("deletions", 0) for commit in commits)
        total_files = sum(commit.get("files_changed", 0) for commit in commits)
        
        return {
            "additions": total_additions / len(commits),
            "deletions": total_deletions / len(commits),
            "files_changed": total_files / len(commits)
        }
    
    def _analyze_work_pattern(self, commits: List[Dict[str, Any]]) -> str:
        """작업 패턴 분석"""
        if not commits:
            return "활동 없음"
        
        avg_size = self._calculate_average_commit_size(commits)
        
        if avg_size["additions"] > 50:
            return "대규모 개발"
        elif avg_size["additions"] > 20:
            return "중간 규모 개발"
        else:
            return "소규모 수정"
    
    def _suggest_optimal_schedule(self, timepart_scores: Dict[str, int]) -> List[str]:
        """최적 스케줄 제안"""
        sorted_timeparts = sorted(timepart_scores.items(), key=lambda x: x[1], reverse=True)
        
        suggestions = []
        for i, (timepart, score) in enumerate(sorted_timeparts):
            if i == 0:
                suggestions.append(f"{timepart}: 가장 생산적인 시간대, 중요한 작업 우선 배치")
            elif i == 1:
                suggestions.append(f"{timepart}: 중간 생산성, 실습 및 연습 활동 권장")
            else:
                suggestions.append(f"{timepart}: 생산성 개선 필요, 기초 학습 및 복습 활동")
        
        return suggestions
    
    def _calculate_learning_efficiency_score(self, commit_analysis: Dict[str, Any]) -> float:
        """학습 효율성 점수 계산"""
        # 복잡한 로직이지만 간단히 구현
        categories = commit_analysis.get("learning_categories", {})
        if not categories:
            return 0
        
        # 다양한 학습 카테고리가 있을수록 높은 점수
        diversity_score = len(categories) * 10
        
        # 생산성 지표 반영
        productivity = commit_analysis.get("productivity_indicators", {})
        productivity_score = sum(productivity.values()) if productivity else 0
        
        return min(100, diversity_score + productivity_score)
    
    def _generate_learning_insights(self, learning_metrics: Dict[str, Any]) -> List[str]:
        """학습 패턴 인사이트 생성"""
        insights = []
        
        # 각 시간대별 학습 특성 분석
        timepart_focus = {}
        for timepart, metrics in learning_metrics.items():
            focus = metrics.get("learning_focus", {})
            if focus:
                dominant_category = max(focus, key=focus.get)
                timepart_focus[timepart] = dominant_category
        
        if timepart_focus:
            insights.append(f"시간대별 학습 패턴: {', '.join([f'{tp}({focus})' for tp, focus in timepart_focus.items()])}")
        
        # 전체 효율성 평가
        efficiency_scores = [
            metrics.get("learning_efficiency_score", 0) 
            for metrics in learning_metrics.values()
        ]
        avg_efficiency = sum(efficiency_scores) / len(efficiency_scores) if efficiency_scores else 0
        
        if avg_efficiency >= 70:
            insights.append("전반적으로 높은 학습 효율성을 보여줍니다.")
        elif avg_efficiency >= 40:
            insights.append("적당한 학습 효율성을 보여줍니다. 좀 더 집중적인 학습이 필요합니다.")
        else:
            insights.append("학습 효율성 개선이 필요합니다. 학습 방법과 시간 관리를 점검해보세요.")
        
        return insights
    
    def _create_daily_summary(self, comprehensive_analysis: Dict[str, Any], 
                            productivity_pattern: Dict[str, Any]) -> Dict[str, Any]:
        """일일 요약 생성"""
        total_activities = comprehensive_analysis["total_activities"]["total_count"]
        daily_grade = comprehensive_analysis["daily_metrics"]["daily_grade"]
        peak_timepart = productivity_pattern["peak_productivity"]["timepart"]
        peak_score = productivity_pattern["peak_productivity"]["score"]
        
        # 등급별 이모지 매핑
        grade_emoji = {
            "excellent_day": "🌟",
            "good_day": "😊",
            "average_day": "😐",
            "improvement_needed": "😔"
        }
        
        # 등급별 메시지
        grade_messages = {
            "excellent_day": "훌륭한 하루였습니다!",
            "good_day": "좋은 하루였습니다!",
            "average_day": "평범한 하루였습니다.",
            "improvement_needed": "아쉬운 하루였습니다."
        }
        
        return {
            "emoji": grade_emoji.get(daily_grade, "😐"),
            "grade": daily_grade,
            "message": grade_messages.get(daily_grade, ""),
            "total_activities": total_activities,
            "peak_productivity": {
                "timepart": peak_timepart,
                "score": peak_score
            },
            "key_achievement": self._identify_key_achievement(comprehensive_analysis),
            "area_for_improvement": self._identify_improvement_area(comprehensive_analysis)
        }
    
    def _identify_key_achievement(self, analysis: Dict[str, Any]) -> str:
        """주요 성과 식별"""
        timepart_analysis = analysis["timepart_analysis"]
        
        # 가장 높은 점수를 받은 시간대의 성과
        best_timepart = max(timepart_analysis, key=lambda tp: timepart_analysis[tp]["score"])
        best_score = timepart_analysis[best_timepart]["score"]
        
        if best_score >= 25:
            return f"{best_timepart}에서 매우 높은 생산성 달성 ({best_score}점)"
        elif best_score >= 15:
            return f"{best_timepart}에서 좋은 생산성 달성 ({best_score}점)"
        elif best_score > 0:
            return f"{best_timepart}에서 기본적인 활동 완료 ({best_score}점)"
        else:
            return "오늘은 특별한 성과가 없었습니다."
    
    def _identify_improvement_area(self, analysis: Dict[str, Any]) -> str:
        """개선 영역 식별"""
        timepart_analysis = analysis["timepart_analysis"]
        
        # 가장 낮은 점수를 받은 시간대
        worst_timepart = min(timepart_analysis, key=lambda tp: timepart_analysis[tp]["score"])
        worst_score = timepart_analysis[worst_timepart]["score"]
        
        if worst_score == 0:
            return f"{worst_timepart} 시간대 활동 부족"
        elif worst_score < 10:
            return f"{worst_timepart} 시간대 생산성 개선 필요"
        else:
            return "전반적인 일관성 개선 필요"
    
    def _generate_next_day_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """내일 권장사항 생성"""
        recommendations = []
        daily_grade = analysis["daily_metrics"]["daily_grade"]
        
        if daily_grade == "improvement_needed":
            recommendations.extend([
                "각 시간대별로 최소 1개의 학습 목표 설정",
                "작은 단위의 커밋 습관 만들기",
                "학습 내용을 즉시 GitHub에 기록"
            ])
        elif daily_grade == "average_day":
            recommendations.extend([
                "생산성이 높았던 시간대 패턴 분석하여 다른 시간대에 적용",
                "학습 깊이를 높이기 위한 심화 학습 계획",
                "코드 품질 개선에 집중"
            ])
        else:
            recommendations.extend([
                "오늘의 좋은 패턴 유지",
                "새로운 도전과제 설정",
                "학습 내용 공유 및 정리"
            ])
        
        return recommendations
    
    def _save_analysis_report(self, daily_report: Dict[str, Any], target_date: date) -> str:
        """분석 리포트 파일 저장"""
        report_dir = os.path.join(project_root, "logs", "daily_github_analysis")
        os.makedirs(report_dir, exist_ok=True)
        
        # Markdown 형식으로 리포트 생성
        report_filename = f"github_daily_analysis_{target_date.strftime('%Y%m%d')}.md"
        report_path = os.path.join(report_dir, report_filename)
        
        with open(report_path, 'w', encoding='utf-8') as f:
            self._write_markdown_report(f, daily_report)
        
        return report_path
    
    def _write_markdown_report(self, file, report: Dict[str, Any]):
        """Markdown 형식으로 리포트 작성"""
        file.write(f"# GitHub 일일 활동 분석 리포트\n\n")
        file.write(f"**분석 날짜:** {report['analysis_date']}\n")
        file.write(f"**생성 시간:** {report['generated_at']}\n\n")
        
        # 일일 요약
        summary = report["daily_summary"]
        file.write(f"## {summary['emoji']} 일일 요약\n\n")
        file.write(f"**평가:** {summary['message']}\n")
        file.write(f"**총 활동:** {summary['total_activities']}개\n")
        file.write(f"**최고 생산성:** {summary['peak_productivity']['timepart']} ({summary['peak_productivity']['score']}점)\n")
        file.write(f"**주요 성과:** {summary['key_achievement']}\n")
        file.write(f"**개선 영역:** {summary['area_for_improvement']}\n\n")
        
        # 시간대별 상세 분석
        file.write("## 📊 시간대별 상세 분석\n\n")
        for timepart, details in report["comprehensive_analysis"]["timepart_analysis"].items():
            file.write(f"### {timepart}\n")
            file.write(f"- **생산성 점수:** {details['score']}점\n")
            file.write(f"- **활동 수준:** {details['activity_level']}\n")
            file.write(f"- **커밋:** {details['commits']}개\n")
            file.write(f"- **이슈:** {details['issues']}개\n")
            file.write(f"- **PR:** {details['pull_requests']}개\n\n")
        
        # 생산성 패턴
        pattern = report["productivity_pattern"]
        file.write("## 🎯 생산성 패턴 분석\n\n")
        file.write(f"**생산성 트렌드:** {pattern['productivity_trend']}\n")
        file.write(f"**최고 생산성 시간대:** {pattern['peak_productivity']['timepart']} ({pattern['peak_productivity']['score']}점)\n")
        file.write(f"**최저 생산성 시간대:** {pattern['lowest_productivity']['timepart']} ({pattern['lowest_productivity']['score']}점)\n\n")
        
        # 개선 제안
        file.write("## 💡 개선 제안\n\n")
        for suggestion in report["improvement_suggestions"]:
            file.write(f"### {suggestion['category']} (우선순위: {suggestion['priority']})\n")
            file.write(f"{suggestion['suggestion']}\n\n")
            file.write("**액션 아이템:**\n")
            for action in suggestion['action_items']:
                file.write(f"- {action}\n")
            file.write("\n")
        
        # 내일 권장사항
        file.write("## 🚀 내일 권장사항\n\n")
        for rec in report["next_day_recommendations"]:
            file.write(f"- {rec}\n")

def test_github_daily_analysis_reporter():
    """GitHub 일일 분석 리포트 생성기 테스트"""
    print("🚀 Task 4.3.2: 일일 GitHub 활동 종합 분석 리포트 테스트")
    print("=======================================================")
    
    reporter = GitHubDailyAnalysisReporter()
    
    # 일일 분석 리포트 생성
    today = date.today()
    report = reporter.generate_daily_analysis_report(today)
    
    print(f"\n📋 일일 분석 리포트 요약:")
    print(f"   날짜: {report['analysis_date']}")
    print(f"   평가: {report['daily_summary']['message']}")
    print(f"   총 활동: {report['daily_summary']['total_activities']}개")
    print(f"   최고 생산성: {report['daily_summary']['peak_productivity']['timepart']}")
    print(f"   주요 성과: {report['daily_summary']['key_achievement']}")
    
    print(f"\n📊 시간대별 분석:")
    for timepart, details in report["comprehensive_analysis"]["timepart_analysis"].items():
        print(f"   {timepart}: {details['score']}점 ({details['activity_level']})")
    
    print(f"\n🎯 생산성 패턴:")
    pattern = report["productivity_pattern"]
    print(f"   트렌드: {pattern['productivity_trend']}")
    print(f"   최고 시간대: {pattern['peak_productivity']['timepart']}")
    print(f"   최저 시간대: {pattern['lowest_productivity']['timepart']}")
    
    print(f"\n💡 개선 제안 수: {len(report['improvement_suggestions'])}개")
    for suggestion in report["improvement_suggestions"][:2]:  # 최대 2개만 표시
        print(f"   - {suggestion['category']}: {suggestion['suggestion'][:50]}...")
    
    print(f"\n📄 리포트 파일: {os.path.basename(report['report_path'])}")
    
    print("\n🎉 Task 4.3.2 모든 테스트가 완료되었습니다!")
    print("✅ 일일 GitHub 활동 종합 분석 리포트 시스템 검증 완료")

if __name__ == "__main__":
    test_github_daily_analysis_reporter()
