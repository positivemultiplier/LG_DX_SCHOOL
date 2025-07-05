"""
3-Part 메인 대시보드 페이지 생성 시스템
모든 시각화 요소를 통합한 종합 대시보드
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import sys

# 프로젝트 루트 경로 추가
project_root = os.path.join(os.path.dirname(__file__), '..', '..', '..')
sys.path.append(project_root)

from src.notion_automation.utils.logger import ThreePartLogger
from src.notion_automation.dashboard.time_part_visualizer import TimePartVisualizer
from src.notion_automation.dashboard.github_heatmap import GitHubTimePartHeatmap
from src.notion_automation.dashboard.efficiency_trend import EfficiencyTrendChart
from src.notion_automation.dashboard.optimal_time_analyzer import OptimalTimeAnalyzer

class ThreePartDashboard:
    """3-Part 메인 대시보드 생성 클래스"""
    
    def __init__(self):
        self.logger = ThreePartLogger()
        self.data_dir = os.path.join(project_root, 'data')
        
        # 각 시각화 모듈 인스턴스
        self.visualizer = TimePartVisualizer()
        self.heatmap = GitHubTimePartHeatmap()
        self.trend_chart = EfficiencyTrendChart()
        self.analyzer = OptimalTimeAnalyzer()
        
        # 대시보드 색상 테마
        self.theme_colors = {
            "primary": "#1F2937",      # 어두운 회색
            "secondary": "#374151",    # 중간 회색  
            "accent": "#3B82F6",       # 파란색
            "success": "#10B981",      # 초록색
            "warning": "#F59E0B",      # 노란색
            "danger": "#EF4444"        # 빨간색
        }
    
    def create_main_3part_dashboard(self, days: int = 7) -> Dict[str, Any]:
        """
        메인 3-Part 대시보드 생성
        
        Args:
            days: 분석할 일수 (기본값: 7일)
            
        Returns:
            완전한 대시보드 구조
        """
        try:
            self.logger.info(f"3-Part 메인 대시보드 생성 시작 ({days}일간 데이터)")
            
            # 1. 오늘의 3-Part 요약 생성
            today_summary = self._create_today_3part_summary()
            
            # 2. 시간대별 성과 비교 차트 생성
            radar_chart = self.visualizer.create_3part_performance_radar(days)
            heatmap_data = self.heatmap.create_github_timepart_heatmap(days)
            
            # 3. 개인 최적화 분석 생성
            optimal_analysis = self.analyzer.identify_optimal_learning_times(days * 2)  # 2배 기간으로 정확도 향상
            
            # 4. 트렌드 분석 생성
            trend_data = self.trend_chart.create_efficiency_trend_chart(days)
            
            # 5. 주간 3-Part 통계 생성
            weekly_stats = self._generate_weekly_stats(days)
            
            # 6. 대시보드 구조 생성
            dashboard_structure = {
                "dashboard_type": "3part_main",
                "title": "🕐 3-Part Daily Reflection Dashboard",
                "subtitle": f"오전수업 · 오후수업 · 저녁자율학습 종합 분석 ({days}일간)",
                "created_at": datetime.now().isoformat(),
                "analysis_period": f"{days}일간",
                "sections": [
                    {
                        "section_id": "today_summary",
                        "title": "📊 오늘의 3-Part 요약",
                        "type": "summary_cards",
                        "content": today_summary,
                        "priority": 1
                    },
                    {
                        "section_id": "performance_comparison",
                        "title": "📈 시간대별 성과 비교",
                        "type": "visualization",
                        "content": {
                            "radar_chart": radar_chart,
                            "github_heatmap": heatmap_data
                        },
                        "priority": 2
                    },
                    {
                        "section_id": "optimization_analysis",
                        "title": "🎯 개인 최적화 분석",
                        "type": "analysis",
                        "content": {
                            "optimal_times": optimal_analysis,
                            "learning_strategies": self._create_personalized_learning_strategy(optimal_analysis)
                        },
                        "priority": 3
                    },
                    {
                        "section_id": "trend_analysis",
                        "title": "📅 학습 효율성 트렌드",
                        "type": "trend",
                        "content": {
                            "efficiency_trend": trend_data,
                            "progress_tracking": self._create_progress_tracking(trend_data)
                        },
                        "priority": 4
                    },
                    {
                        "section_id": "weekly_insights",
                        "title": "📝 주간 인사이트 & 목표",
                        "type": "insights",
                        "content": {
                            "weekly_stats": weekly_stats,
                            "action_items": self._generate_action_items(radar_chart, optimal_analysis, trend_data)
                        },
                        "priority": 5
                    }
                ],
                "navigation": self._create_dashboard_navigation(),
                "metadata": {
                    "total_data_points": self._count_total_data_points(days),
                    "analysis_accuracy": self._calculate_analysis_accuracy(days),
                    "last_updated": datetime.now().isoformat(),
                    "next_update": (datetime.now() + timedelta(hours=1)).isoformat()
                }
            }
            
            # 7. Notion 블록 형태로 변환
            notion_blocks = self._convert_to_notion_blocks(dashboard_structure)
            dashboard_structure["notion_blocks"] = notion_blocks
            
            # 8. 대시보드 저장
            output_path = os.path.join(self.data_dir, f"3part_dashboard_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(dashboard_structure, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f"3-Part 메인 대시보드 생성 완료: {output_path}")
            return dashboard_structure
            
        except Exception as e:
            self.logger.log_error(e, "3-Part 메인 대시보드 생성")
            return {}
    
    def _create_today_3part_summary(self) -> Dict[str, Any]:
        """오늘의 3-Part 요약 생성"""
        try:
            today = datetime.now()
            today_str = today.strftime("%Y%m%d")
            
            summary = {
                "date": today.strftime("%Y-%m-%d"),
                "weekday": today.strftime("%A"),
                "timeparts": {}
            }
            
            # 각 시간대별 오늘 데이터 수집
            timepart_configs = {
                "🌅 오전수업": ("morning_reflections", f"morning_reflection_{today_str}.json"),
                "🌞 오후수업": ("afternoon_reflections", f"afternoon_reflection_{today_str}.json"),
                "🌙 저녁자율학습": ("evening_reflections", f"evening_reflection_{today_str}.json")
            }
            
            total_score = 0
            completed_parts = 0
            
            for timepart, (folder, filename) in timepart_configs.items():
                file_path = os.path.join(self.data_dir, folder, filename)
                
                timepart_summary = {
                    "completed": False,
                    "score": 0,
                    "highlights": [],
                    "status": "미완료"
                }
                
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        
                        score = data.get('총점', 0)
                        condition = data.get('컨디션', '보통')
                        github_data = data.get('github_data', {})
                        
                        timepart_summary = {
                            "completed": True,
                            "score": score,
                            "condition": condition,
                            "github_commits": github_data.get('commits', 0),
                            "highlights": self._extract_highlights(data, timepart),
                            "status": self._get_performance_status(score)
                        }
                        
                        total_score += score
                        completed_parts += 1
                
                summary["timeparts"][timepart] = timepart_summary
            
            # 전체 요약 통계
            summary["overall"] = {
                "completed_parts": completed_parts,
                "total_parts": 3,
                "completion_rate": (completed_parts / 3) * 100,
                "average_score": total_score / completed_parts if completed_parts > 0 else 0,
                "total_score": total_score,
                "day_grade": self._get_day_grade(total_score, completed_parts)
            }
            
            return summary
            
        except Exception as e:
            self.logger.log_error(e, "오늘의 3-Part 요약 생성")
            return {}
    
    def _extract_highlights(self, data: Dict[str, Any], timepart: str) -> List[str]:
        """시간대별 하이라이트 추출"""
        highlights = []
        
        try:
            # 높은 성과 하이라이트
            understanding = data.get('학습이해도', data.get('이해도', 0))
            if understanding >= 8:
                highlights.append(f"우수한 이해도 ({understanding}/10)")
            
            concentration = data.get('집중도', data.get('계획달성도', 0))
            if concentration >= 8:
                highlights.append(f"높은 집중도 ({concentration}/10)")
            
            # GitHub 활동 하이라이트
            github_data = data.get('github_data', {})
            commits = github_data.get('commits', 0)
            if commits >= 3:
                highlights.append(f"활발한 코딩 ({commits}개 커밋)")
            
            # 특별한 성취
            if data.get('총점', 0) >= 80:
                highlights.append("우수한 전체 성과")
            
            # 컨디션 좋음
            if data.get('컨디션') == '좋음':
                highlights.append("좋은 컨디션")
            
            return highlights[:3]  # 최대 3개까지
            
        except Exception as e:
            self.logger.log_error(e, f"하이라이트 추출 ({timepart})")
            return []
    
    def _get_performance_status(self, score: int) -> str:
        """점수 기반 성과 상태"""
        if score >= 80:
            return "우수"
        elif score >= 60:
            return "양호"
        elif score >= 40:
            return "보통"
        else:
            return "개선필요"
    
    def _get_day_grade(self, total_score: int, completed_parts: int) -> str:
        """하루 전체 등급"""
        if completed_parts == 0:
            return "데이터 없음"
        
        avg_score = total_score / completed_parts
        
        if completed_parts == 3:  # 모든 시간대 완료
            if avg_score >= 80:
                return "완벽한 하루"
            elif avg_score >= 60:
                return "훌륭한 하루"
            else:
                return "충실한 하루"
        else:  # 부분 완료
            return f"부분 완료 ({completed_parts}/3)"
    
    def _generate_weekly_stats(self, days: int) -> Dict[str, Any]:
        """주간 통계 생성"""
        try:
            weekly_stats = {
                "period": f"최근 {days}일",
                "timepart_stats": {},
                "overall_trends": {},
                "achievements": []
            }
            
            # 각 시간대별 주간 통계
            for timepart in ["🌅 오전수업", "🌞 오후수업", "🌙 저녁자율학습"]:
                stats = self._calculate_timepart_weekly_stats(timepart, days)
                weekly_stats["timepart_stats"][timepart] = stats
            
            # 전체 트렌드
            weekly_stats["overall_trends"] = self._calculate_overall_trends(days)
            
            # 성취 사항
            weekly_stats["achievements"] = self._identify_achievements(weekly_stats["timepart_stats"])
            
            return weekly_stats
            
        except Exception as e:
            self.logger.log_error(e, "주간 통계 생성")
            return {}
    
    def _calculate_timepart_weekly_stats(self, timepart: str, days: int) -> Dict[str, Any]:
        """시간대별 주간 통계 계산"""
        try:
            folder_map = {
                "🌅 오전수업": "morning_reflections",
                "🌞 오후수업": "afternoon_reflections", 
                "🌙 저녁자율학습": "evening_reflections"
            }
            
            folder = folder_map[timepart]
            scores = []
            github_activities = []
            active_days = 0
            
            for day_offset in range(days):
                date = datetime.now() - timedelta(days=day_offset)
                filename = f"{folder[:-1]}_{date.strftime('%Y%m%d')}.json"
                file_path = os.path.join(self.data_dir, folder, filename)
                
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        
                        score = data.get('총점', 0)
                        scores.append(score)
                        
                        github_data = data.get('github_data', {})
                        github_activity = github_data.get('commits', 0) + github_data.get('issues', 0)
                        github_activities.append(github_activity)
                        
                        active_days += 1
            
            if scores:
                return {
                    "active_days": active_days,
                    "activity_rate": (active_days / days) * 100,
                    "average_score": sum(scores) / len(scores),
                    "best_score": max(scores),
                    "total_github_activity": sum(github_activities),
                    "consistency": self._calculate_consistency_score(scores)
                }
            else:
                return {
                    "active_days": 0,
                    "activity_rate": 0,
                    "average_score": 0,
                    "best_score": 0,
                    "total_github_activity": 0,
                    "consistency": 0
                }
                
        except Exception as e:
            self.logger.log_error(e, f"시간대별 주간 통계 계산 ({timepart})")
            return {}
    
    def _calculate_consistency_score(self, values: List[float]) -> float:
        """일관성 점수 계산"""
        if len(values) <= 1:
            return 0
        
        mean_val = sum(values) / len(values)
        variance = sum([(v - mean_val) ** 2 for v in values]) / len(values)
        std_dev = variance ** 0.5
        
        # 표준편차가 낮을수록 일관성이 높음
        consistency = max(0, 10 - std_dev / 10)
        return round(consistency, 1)
    
    def _calculate_overall_trends(self, days: int) -> Dict[str, Any]:
        """전체 트렌드 계산"""
        try:
            # 구현 예정: 전체적인 학습 트렌드 분석
            return {
                "trend_direction": "상승",
                "improvement_rate": 15.2,
                "best_timepart_trend": "🌙 저녁자율학습",
                "consistency_trend": "개선 중"
            }
        except Exception as e:
            self.logger.log_error(e, "전체 트렌드 계산")
            return {}
    
    def _identify_achievements(self, timepart_stats: Dict) -> List[str]:
        """성취 사항 식별"""
        achievements = []
        
        try:
            for timepart, stats in timepart_stats.items():
                activity_rate = stats.get("activity_rate", 0)
                average_score = stats.get("average_score", 0)
                consistency = stats.get("consistency", 0)
                
                if activity_rate >= 80:
                    achievements.append(f"{timepart} 높은 참여율 ({activity_rate:.1f}%)")
                
                if average_score >= 70:
                    achievements.append(f"{timepart} 우수한 평균 성과 ({average_score:.1f}점)")
                
                if consistency >= 8:
                    achievements.append(f"{timepart} 뛰어난 일관성 ({consistency:.1f}/10)")
            
            return achievements
            
        except Exception as e:
            self.logger.log_error(e, "성취 사항 식별")
            return []
    
    def _create_personalized_learning_strategy(self, optimal_analysis: Dict) -> Dict[str, Any]:
        """개인화된 학습 전략 생성"""
        try:
            learning_optimal = optimal_analysis.get("learning_type_optimal", {})
            
            strategy = {
                "recommended_schedule": {},
                "strength_areas": [],
                "improvement_areas": [],
                "weekly_goals": []
            }
            
            # 추천 스케줄
            for learning_type, result in learning_optimal.items():
                optimal_timepart = result.get("optimal_timepart")
                if optimal_timepart:
                    strategy["recommended_schedule"][learning_type] = optimal_timepart
            
            # 강점 영역
            dimensional_analysis = optimal_analysis.get("dimensional_analysis", {})
            for dimension, result in dimensional_analysis.items():
                score = result.get("score", 0)
                if score >= 7:
                    strategy["strength_areas"].append(f"{dimension}: {score}점")
            
            # 개선 영역
            for dimension, result in dimensional_analysis.items():
                score = result.get("score", 0)
                if score < 5:
                    strategy["improvement_areas"].append(f"{dimension}: {score}점")
            
            # 주간 목표
            strategy["weekly_goals"] = [
                "일일 3-Part 완성률 90% 달성",
                "최적 시간대 활용도 80% 달성",
                "GitHub 활동 주 20개 커밋 목표"
            ]
            
            return strategy
            
        except Exception as e:
            self.logger.log_error(e, "개인화된 학습 전략 생성")
            return {}
    
    def _create_progress_tracking(self, trend_data: Dict) -> Dict[str, Any]:
        """진행 상황 추적 생성"""
        try:
            tracking = {
                "current_week_progress": {},
                "month_goals": {},
                "improvement_metrics": {}
            }
            
            # 현재 주 진행 상황
            trend_lines = trend_data.get("trend_lines", {})
            for timepart, line_data in trend_lines.items():
                recent_data = line_data.get("data", [])
                if recent_data:
                    latest_efficiency = recent_data[-1].get("efficiency", 0)
                    tracking["current_week_progress"][timepart] = {
                        "current_efficiency": latest_efficiency,
                        "grade": line_data.get("data", [{}])[-1].get("grade", "보통")
                    }
            
            return tracking
            
        except Exception as e:
            self.logger.log_error(e, "진행 상황 추적 생성")
            return {}
    
    def _generate_action_items(self, radar_chart: Dict, optimal_analysis: Dict, trend_data: Dict) -> List[Dict[str, str]]:
        """실행 항목 생성"""
        action_items = []
        
        try:
            # 레이더 차트 기반 액션
            recommendations = radar_chart.get("recommendations", [])
            for rec in recommendations[:2]:  # 상위 2개
                action_items.append({
                    "type": "improvement",
                    "priority": "high",
                    "description": rec,
                    "timeframe": "이번 주"
                })
            
            # 최적 분석 기반 액션
            overall_rec = optimal_analysis.get("overall_recommendation", "")
            if overall_rec:
                action_items.append({
                    "type": "optimization",
                    "priority": "medium",
                    "description": f"최적 시간대 활용: {overall_rec}",
                    "timeframe": "지속적"
                })
            
            # 트렌드 기반 액션
            trend_recommendations = trend_data.get("recommendations", [])
            for rec in trend_recommendations[:1]:  # 상위 1개
                action_items.append({
                    "type": "trend",
                    "priority": "medium", 
                    "description": rec,
                    "timeframe": "다음 주"
                })
            
            return action_items
            
        except Exception as e:
            self.logger.log_error(e, "실행 항목 생성")
            return []
    
    def _create_dashboard_navigation(self) -> Dict[str, Any]:
        """대시보드 네비게이션 생성"""
        return {
            "quick_links": [
                {"label": "오늘의 입력", "section": "today_summary"},
                {"label": "성과 비교", "section": "performance_comparison"},
                {"label": "최적화 분석", "section": "optimization_analysis"},
                {"label": "트렌드", "section": "trend_analysis"},
                {"label": "주간 리뷰", "section": "weekly_insights"}
            ],
            "external_links": [
                {"label": "3-Part 입력 시스템", "url": "#"},
                {"label": "GitHub 프로필", "url": "#"},
                {"label": "학습 자료", "url": "#"}
            ]
        }
    
    def _count_total_data_points(self, days: int) -> int:
        """총 데이터 포인트 수 계산"""
        total = 0
        folders = ["morning_reflections", "afternoon_reflections", "evening_reflections"]
        
        for folder in folders:
            folder_path = os.path.join(self.data_dir, folder)
            if os.path.exists(folder_path):
                total += len([f for f in os.listdir(folder_path) if f.endswith('.json')])
        
        return total
    
    def _calculate_analysis_accuracy(self, days: int) -> str:
        """분석 정확도 계산"""
        total_possible = days * 3  # 일수 x 3시간대
        actual_data = self._count_total_data_points(days)
        
        if total_possible > 0:
            accuracy = (actual_data / total_possible) * 100
            return f"{accuracy:.1f}%"
        else:
            return "0%"
    
    def _convert_to_notion_blocks(self, dashboard_structure: Dict) -> List[Dict[str, Any]]:
        """대시보드를 Notion 블록으로 변환"""
        blocks = []
        
        try:
            # 제목 블록
            blocks.append({
                "object": "block",
                "type": "heading_1",
                "heading_1": {
                    "rich_text": [{"type": "text", "text": {"content": dashboard_structure.get("title", "3-Part Dashboard")}}]
                }
            })
            
            # 부제목 블록
            blocks.append({
                "object": "block", 
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": dashboard_structure.get("subtitle", "")}}]
                }
            })
            
            # 각 섹션별 블록 생성
            sections = dashboard_structure.get("sections", [])
            for section in sorted(sections, key=lambda x: x.get("priority", 999)):
                
                # 섹션 제목
                blocks.append({
                    "object": "block",
                    "type": "heading_2",
                    "heading_2": {
                        "rich_text": [{"type": "text", "text": {"content": section.get("title", "")}}]
                    }
                })
                
                # 섹션 내용에 따른 블록 생성
                section_type = section.get("type", "")
                content = section.get("content", {})
                
                if section_type == "summary_cards":
                    blocks.extend(self._create_summary_blocks(content))
                elif section_type == "visualization":
                    blocks.extend(self._create_visualization_blocks(content))
                elif section_type == "analysis":
                    blocks.extend(self._create_analysis_blocks(content))
                elif section_type == "trend":
                    blocks.extend(self._create_trend_blocks(content))
                elif section_type == "insights":
                    blocks.extend(self._create_insights_blocks(content))
            
            return blocks
            
        except Exception as e:
            self.logger.log_error(e, "Notion 블록 변환")
            return []
    
    def _create_summary_blocks(self, content: Dict) -> List[Dict[str, Any]]:
        """요약 블록 생성"""
        blocks = []
        
        try:
            overall = content.get("overall", {})
            completion_rate = overall.get("completion_rate", 0)
            day_grade = overall.get("day_grade", "")
            
            summary_text = f"""
📊 **완성률**: {completion_rate:.1f}% ({overall.get('completed_parts', 0)}/3)
🏆 **하루 평가**: {day_grade}
📈 **평균 점수**: {overall.get('average_score', 0):.1f}점
"""
            
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": summary_text.strip()}}]
                }
            })
            
            # 시간대별 요약
            timeparts = content.get("timeparts", {})
            for timepart, data in timeparts.items():
                if data.get("completed", False):
                    highlights = ", ".join(data.get("highlights", []))
                    timepart_text = f"{timepart}: {data.get('score', 0)}점 ({data.get('status', '')}) - {highlights}"
                else:
                    timepart_text = f"{timepart}: 미완료"
                
                blocks.append({
                    "object": "block",
                    "type": "bulleted_list_item",
                    "bulleted_list_item": {
                        "rich_text": [{"type": "text", "text": {"content": timepart_text}}]
                    }
                })
            
        except Exception as e:
            self.logger.log_error(e, "요약 블록 생성")
        
        return blocks
    
    def _create_visualization_blocks(self, content: Dict) -> List[Dict[str, Any]]:
        """시각화 블록 생성"""
        blocks = []
        
        try:
            # 레이더 차트 블록 추가
            radar_chart = content.get("radar_chart", {})
            if radar_chart:
                radar_blocks = self.visualizer.create_notion_radar_chart_blocks(radar_chart)
                blocks.extend(radar_blocks)
            
            # 히트맵 블록 추가
            heatmap = content.get("github_heatmap", {})
            if heatmap:
                heatmap_blocks = self.heatmap.create_notion_heatmap_blocks(heatmap)
                blocks.extend(heatmap_blocks)
            
        except Exception as e:
            self.logger.log_error(e, "시각화 블록 생성")
        
        return blocks
    
    def _create_analysis_blocks(self, content: Dict) -> List[Dict[str, Any]]:
        """분석 블록 생성"""
        blocks = []
        
        try:
            optimal_times = content.get("optimal_times", {})
            overall_rec = optimal_times.get("overall_recommendation", "")
            
            if overall_rec:
                blocks.append({
                    "object": "block",
                    "type": "callout",
                    "callout": {
                        "rich_text": [{"type": "text", "text": {"content": f"🎯 {overall_rec}"}}],
                        "icon": {"emoji": "🎯"}
                    }
                })
            
            # 학습 유형별 최적 시간대
            learning_optimal = optimal_times.get("learning_type_optimal", {})
            if learning_optimal:
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {
                        "rich_text": [{"type": "text", "text": {"content": "📚 학습 유형별 최적 시간대"}}]
                    }
                })
                
                for learning_type, result in learning_optimal.items():
                    optimal_timepart = result.get("optimal_timepart", "N/A")
                    score = result.get("weighted_score", 0)
                    
                    blocks.append({
                        "object": "block",
                        "type": "bulleted_list_item",
                        "bulleted_list_item": {
                            "rich_text": [{"type": "text", "text": {"content": f"{learning_type}: {optimal_timepart} ({score:.1f}점)"}}]
                        }
                    })
            
        except Exception as e:
            self.logger.log_error(e, "분석 블록 생성")
        
        return blocks
    
    def _create_trend_blocks(self, content: Dict) -> List[Dict[str, Any]]:
        """트렌드 블록 생성"""
        blocks = []
        
        try:
            efficiency_trend = content.get("efficiency_trend", {})
            trend_lines = efficiency_trend.get("trend_lines", {})
            
            if trend_lines:
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {
                        "rich_text": [{"type": "text", "text": {"content": "📈 시간대별 효율성 평균"}}]
                    }
                })
                
                for timepart, line_data in trend_lines.items():
                    average = line_data.get("average", 0)
                    blocks.append({
                        "object": "block",
                        "type": "bulleted_list_item",
                        "bulleted_list_item": {
                            "rich_text": [{"type": "text", "text": {"content": f"{timepart}: {average:.1f}점"}}]
                        }
                    })
            
        except Exception as e:
            self.logger.log_error(e, "트렌드 블록 생성")
        
        return blocks
    
    def _create_insights_blocks(self, content: Dict) -> List[Dict[str, Any]]:
        """인사이트 블록 생성"""
        blocks = []
        
        try:
            action_items = content.get("action_items", [])
            
            if action_items:
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {
                        "rich_text": [{"type": "text", "text": {"content": "🎯 이번 주 실행 항목"}}]
                    }
                })
                
                for item in action_items:
                    priority_emoji = "🔴" if item.get("priority") == "high" else "🟡" if item.get("priority") == "medium" else "🟢"
                    item_text = f"{priority_emoji} {item.get('description', '')} ({item.get('timeframe', '')})"
                    
                    blocks.append({
                        "object": "block",
                        "type": "to_do",
                        "to_do": {
                            "rich_text": [{"type": "text", "text": {"content": item_text}}],
                            "checked": False
                        }
                    })
            
        except Exception as e:
            self.logger.log_error(e, "인사이트 블록 생성")
        
        return blocks


def test_three_part_dashboard():
    """ThreePartDashboard 테스트 함수"""
    print("🕐 3-Part 메인 대시보드 시스템 테스트 시작")
    
    dashboard = ThreePartDashboard()
    
    # 메인 대시보드 생성 테스트
    print("\n📊 3-Part 메인 대시보드 생성 중...")
    dashboard_data = dashboard.create_main_3part_dashboard(days=7)
    
    if dashboard_data:
        print("✅ 메인 대시보드 생성 성공!")
        print(f"📊 분석 기간: {dashboard_data.get('analysis_period', 'N/A')}")
        
        sections = dashboard_data.get('sections', [])
        print(f"📋 대시보드 섹션: {len(sections)}개")
        
        for section in sections:
            print(f"  - {section.get('title', 'N/A')} ({section.get('type', 'N/A')})")
        
        # Notion 블록 수 출력
        notion_blocks = dashboard_data.get('notion_blocks', [])
        print(f"📝 Notion 블록: {len(notion_blocks)}개")
        
        # 메타데이터 출력
        metadata = dashboard_data.get('metadata', {})
        total_data = metadata.get('total_data_points', 0)
        accuracy = metadata.get('analysis_accuracy', '0%')
        print(f"📈 데이터 포인트: {total_data}개 (정확도: {accuracy})")
        
    else:
        print("❌ 메인 대시보드 생성 실패")
    
    print("\n✅ 3-Part 메인 대시보드 시스템 테스트 완료")


if __name__ == "__main__":
    test_three_part_dashboard()
