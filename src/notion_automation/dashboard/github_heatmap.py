"""
시간대별 GitHub 활동 분포 히트맵 시각화 시스템
일주일 x 3시간대 GitHub 활동 패턴 분석
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

class GitHubTimePartHeatmap:
    """시간대별 GitHub 활동 히트맵 클래스"""
    
    def __init__(self):
        self.logger = ThreePartLogger()
        self.data_dir = os.path.join(project_root, 'data')
        
        # 요일 한국어 매핑
        self.weekdays = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"]
        
        # 시간대 정의
        self.timeparts = ["🌅 오전수업", "🌞 오후수업", "🌙 저녁자율학습"]
        
        # 히트맵 색상 강도 (GitHub 활동량 기준)
        self.intensity_levels = {
            0: "#161B22",      # 활동 없음 (어두운 회색)
            1: "#0E4429",      # 낮은 활동 (어두운 녹색)
            2: "#006D32",      # 보통 활동 (중간 녹색)
            3: "#26A641",      # 높은 활동 (밝은 녹색)
            4: "#39D353"       # 매우 높은 활동 (가장 밝은 녹색)
        }
    
    def load_github_activity_data(self, days: int = 7) -> Dict[str, Dict[str, int]]:
        """
        최근 N일간의 GitHub 활동 데이터 로드
        
        Args:
            days: 로드할 일수 (기본값: 7일)
            
        Returns:
            날짜별, 시간대별 GitHub 활동 데이터
        """
        try:
            activity_data = {}
            
            for day_offset in range(days):
                date = datetime.now() - timedelta(days=day_offset)
                date_str = date.strftime("%Y-%m-%d")
                weekday = self.weekdays[date.weekday()]
                
                day_data = {
                    "date": date_str,
                    "weekday": weekday,
                    "🌅 오전수업": 0,
                    "🌞 오후수업": 0,
                    "🌙 저녁자율학습": 0
                }
                
                # 각 시간대별 데이터 파일에서 GitHub 활동 추출
                timepart_files = {
                    "🌅 오전수업": f"morning_reflection_{date.strftime('%Y%m%d')}.json",
                    "🌞 오후수업": f"afternoon_reflection_{date.strftime('%Y%m%d')}.json",
                    "🌙 저녁자율학습": f"evening_reflection_{date.strftime('%Y%m%d')}.json"
                }
                
                for timepart, filename in timepart_files.items():
                    timepart_folder = {
                        "🌅 오전수업": "morning_reflections",
                        "🌞 오후수업": "afternoon_reflections", 
                        "🌙 저녁자율학습": "evening_reflections"
                    }[timepart]
                    
                    file_path = os.path.join(self.data_dir, timepart_folder, filename)
                    
                    if os.path.exists(file_path):
                        with open(file_path, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            github_data = data.get('github_data', {})
                            
                            # GitHub 활동 점수 추출
                            commits = github_data.get('commits', 0)
                            issues = github_data.get('issues', 0)
                            pull_requests = github_data.get('pull_requests', 0)
                            
                            # 총 활동량 계산
                            total_activity = commits + issues + pull_requests
                            day_data[timepart] = total_activity
                
                activity_data[date_str] = day_data
            
            self.logger.info(f"GitHub 활동 데이터 로드 완료: {len(activity_data)}일 데이터")
            return activity_data
            
        except Exception as e:
            self.logger.log_error(e, "GitHub 활동 데이터 로드")
            return {}
    
    def calculate_intensity_level(self, activity_count: int) -> int:
        """
        GitHub 활동량을 히트맵 강도 레벨로 변환
        
        Args:
            activity_count: GitHub 활동 수
            
        Returns:
            강도 레벨 (0-4)
        """
        if activity_count == 0:
            return 0
        elif activity_count <= 2:
            return 1
        elif activity_count <= 5:
            return 2
        elif activity_count <= 10:
            return 3
        else:
            return 4
    
    def create_github_timepart_heatmap(self, days: int = 7) -> Dict[str, Any]:
        """
        일주일 x 3시간대 GitHub 활동 히트맵 생성
        
        Args:
            days: 분석할 일수 (기본값: 7일)
            
        Returns:
            히트맵 데이터 및 메타데이터
        """
        try:
            # GitHub 활동 데이터 로드
            activity_data = self.load_github_activity_data(days)
            
            # 히트맵 매트릭스 생성 (7일 x 3시간대)
            heatmap_matrix = []
            total_activity = 0
            max_activity = 0
            best_timepart = {"timepart": "", "activity": 0, "date": ""}
            
            # 날짜순으로 정렬 (최신순)
            sorted_dates = sorted(activity_data.keys(), reverse=True)
            
            for date_str in sorted_dates:
                day_data = activity_data[date_str]
                weekday = day_data["weekday"]
                
                row = {
                    "date": date_str,
                    "weekday": weekday,
                    "timeparts": []
                }
                
                for timepart in self.timeparts:
                    activity = day_data.get(timepart, 0)
                    intensity = self.calculate_intensity_level(activity)
                    color = self.intensity_levels[intensity]
                    
                    timepart_cell = {
                        "timepart": timepart,
                        "activity_count": activity,
                        "intensity_level": intensity,
                        "color": color,
                        "description": f"{timepart}: {activity}개 활동"
                    }
                    
                    row["timeparts"].append(timepart_cell)
                    total_activity += activity
                    
                    # 최고 활동 시간대 추적
                    if activity > best_timepart["activity"]:
                        best_timepart = {
                            "timepart": timepart,
                            "activity": activity,
                            "date": date_str
                        }
                    
                    max_activity = max(max_activity, activity)
                
                heatmap_matrix.append(row)
            
            # 시간대별 통계 계산
            timepart_stats = {}
            for timepart in self.timeparts:
                timepart_activities = []
                for date_str in activity_data:
                    activity = activity_data[date_str].get(timepart, 0)
                    timepart_activities.append(activity)
                
                timepart_stats[timepart] = {
                    "total": sum(timepart_activities),
                    "average": sum(timepart_activities) / len(timepart_activities) if timepart_activities else 0,
                    "max": max(timepart_activities) if timepart_activities else 0,
                    "active_days": len([a for a in timepart_activities if a > 0])
                }
            
            # 히트맵 구조 생성
            heatmap_structure = {
                "chart_type": "heatmap",
                "title": f"📈 시간대별 GitHub 활동 히트맵 (최근 {days}일)",
                "description": "요일별, 시간대별 GitHub 활동 패턴 분석",
                "matrix": heatmap_matrix,
                "timeparts": self.timeparts,
                "weekdays": [row["weekday"] for row in heatmap_matrix],
                "intensity_legend": self.intensity_levels,
                "statistics": {
                    "total_activity": total_activity,
                    "max_single_activity": max_activity,
                    "average_daily": total_activity / days if days > 0 else 0,
                    "best_timepart": best_timepart,
                    "timepart_stats": timepart_stats
                },
                "analysis": self._analyze_heatmap_patterns(timepart_stats, activity_data),
                "recommendations": self._generate_heatmap_recommendations(timepart_stats, best_timepart),
                "created_at": datetime.now().isoformat(),
                "data_period": f"{days}일간"
            }
            
            # 히트맵 데이터 저장
            output_path = os.path.join(self.data_dir, f"github_heatmap_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(heatmap_structure, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f"GitHub 히트맵 생성 완료: {output_path}")
            return heatmap_structure
            
        except Exception as e:
            self.logger.log_error(e, "GitHub 히트맵 생성")
            return {}
    
    def _analyze_heatmap_patterns(self, timepart_stats: Dict[str, Dict], activity_data: Dict[str, Dict]) -> Dict[str, str]:
        """히트맵 패턴 분석"""
        analysis = {}
        
        try:
            # 가장 활발한 시간대
            most_active_timepart = max(timepart_stats.keys(), 
                                     key=lambda x: timepart_stats[x]["total"])
            analysis["가장_활발한_시간대"] = f"{most_active_timepart} (총 {timepart_stats[most_active_timepart]['total']}개 활동)"
            
            # 가장 활발한 요일
            weekday_totals = {}
            for date_str, day_data in activity_data.items():
                weekday = day_data["weekday"]
                total = sum([day_data.get(tp, 0) for tp in self.timeparts])
                weekday_totals[weekday] = weekday_totals.get(weekday, 0) + total
            
            if weekday_totals:
                most_active_day = max(weekday_totals.keys(), key=lambda x: weekday_totals[x])
                analysis["가장_활발한_요일"] = f"{most_active_day} (총 {weekday_totals[most_active_day]}개 활동)"
            
            # 일관성 분석
            consistency_scores = {}
            for timepart in self.timeparts:
                activities = [activity_data[date].get(timepart, 0) for date in activity_data]
                active_days = len([a for a in activities if a > 0])
                consistency = (active_days / len(activities)) * 100 if activities else 0
                consistency_scores[timepart] = consistency
            
            most_consistent = max(consistency_scores.keys(), key=lambda x: consistency_scores[x])
            analysis["가장_일관된_시간대"] = f"{most_consistent} ({consistency_scores[most_consistent]:.1f}% 활동률)"
            
            # 성장 트렌드 분석 (최근 3일 vs 이전 4일)
            if len(activity_data) >= 7:
                sorted_dates = sorted(activity_data.keys())
                recent_dates = sorted_dates[-3:]
                previous_dates = sorted_dates[:4]
                
                recent_total = sum([sum([activity_data[d].get(tp, 0) for tp in self.timeparts]) for d in recent_dates])
                previous_total = sum([sum([activity_data[d].get(tp, 0) for tp in self.timeparts]) for d in previous_dates])
                
                recent_avg = recent_total / 3
                previous_avg = previous_total / 4
                
                if recent_avg > previous_avg * 1.2:
                    analysis["트렌드"] = f"상승 (최근 평균 {recent_avg:.1f} vs 이전 평균 {previous_avg:.1f})"
                elif recent_avg < previous_avg * 0.8:
                    analysis["트렌드"] = f"하락 (최근 평균 {recent_avg:.1f} vs 이전 평균 {previous_avg:.1f})"
                else:
                    analysis["트렌드"] = f"안정 (최근 평균 {recent_avg:.1f} vs 이전 평균 {previous_avg:.1f})"
            
        except Exception as e:
            self.logger.log_error(e, "히트맵 패턴 분석")
            analysis["분석_오류"] = str(e)
        
        return analysis
    
    def _generate_heatmap_recommendations(self, timepart_stats: Dict[str, Dict], best_timepart: Dict) -> List[str]:
        """히트맵 기반 추천사항 생성"""
        recommendations = []
        
        try:
            # 최고 활동 시간대 활용 추천
            if best_timepart["activity"] > 0:
                recommendations.append(f"{best_timepart['timepart']}에 가장 활발 - 중요한 코딩 작업을 이 시간에 배치하세요")
            
            # 시간대별 활동 빈도 기반 추천
            for timepart, stats in timepart_stats.items():
                avg_activity = stats["average"]
                active_days = stats["active_days"]
                
                if avg_activity >= 5:
                    recommendations.append(f"{timepart}은 평균 {avg_activity:.1f}개 활동 - 정기적인 GitHub 작업 시간으로 활용")
                elif active_days <= 2:
                    recommendations.append(f"{timepart}의 GitHub 활동 부족 - 정기적인 커밋 습관 개발 필요")
            
            # 전체적인 패턴 기반 추천
            total_activities = [stats["total"] for stats in timepart_stats.values()]
            if max(total_activities) > 0:
                if max(total_activities) / sum(total_activities) > 0.6:
                    recommendations.append("특정 시간대에 활동이 집중됨 - 다른 시간대에도 골고루 활동 분산 권장")
                else:
                    recommendations.append("시간대별 활동이 균형있게 분포 - 현재 패턴 유지 권장")
            else:
                recommendations.append("전반적인 GitHub 활동 증가 필요 - 일일 최소 커밋 목표 설정")
            
        except Exception as e:
            self.logger.log_error(e, "히트맵 추천사항 생성")
            recommendations.append(f"추천사항 생성 중 오류 발생: {str(e)}")
        
        return recommendations
    
    def create_notion_heatmap_blocks(self, heatmap_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Notion 블록 형태로 히트맵 데이터 변환
        
        Args:
            heatmap_data: 히트맵 데이터
            
        Returns:
            Notion 블록 리스트
        """
        blocks = []
        
        try:
            # 제목 블록
            blocks.append({
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": heatmap_data.get("title", "GitHub 활동 히트맵")}}]
                }
            })
            
            # 설명 블록
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": heatmap_data.get("description", "")}}]
                }
            })
            
            # 히트맵 테이블 생성
            matrix = heatmap_data.get("matrix", [])
            if matrix:
                # 테이블 헤더
                table_content = "| 날짜/요일 | 🌅 오전수업 | 🌞 오후수업 | 🌙 저녁자율학습 |\n"
                table_content += "|----------|------------|------------|---------------|\n"
                
                # 테이블 데이터
                for row in matrix:
                    date = row["date"]
                    weekday = row["weekday"]
                    
                    row_content = f"| {date}({weekday}) |"
                    for timepart_cell in row["timeparts"]:
                        activity = timepart_cell["activity_count"]
                        intensity = timepart_cell["intensity_level"]
                        
                        # 활동량에 따른 이모지 표시
                        if intensity == 0:
                            emoji = "⚫"  # 활동 없음
                        elif intensity == 1:
                            emoji = "🔵"  # 낮은 활동
                        elif intensity == 2:
                            emoji = "🟡"  # 보통 활동
                        elif intensity == 3:
                            emoji = "🟠"  # 높은 활동
                        else:
                            emoji = "🔴"  # 매우 높은 활동
                        
                        row_content += f" {emoji} {activity}개 |"
                    
                    table_content += row_content + "\n"
                
                blocks.append({
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": table_content}}]
                    }
                })
            
            # 통계 요약 블록
            stats = heatmap_data.get("statistics", {})
            if stats:
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {
                        "rich_text": [{"type": "text", "text": {"content": "📊 활동 통계 요약"}}]
                    }
                })
                
                stats_content = f"""
• 총 활동: {stats.get('total_activity', 0)}개
• 일평균 활동: {stats.get('average_daily', 0):.1f}개
• 최대 단일 활동: {stats.get('max_single_activity', 0)}개
• 최고 활동 시간대: {stats.get('best_timepart', {}).get('timepart', 'N/A')} ({stats.get('best_timepart', {}).get('activity', 0)}개)
"""
                
                blocks.append({
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": stats_content.strip()}}]
                    }
                })
            
            # 분석 결과 블록
            analysis = heatmap_data.get("analysis", {})
            if analysis:
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {
                        "rich_text": [{"type": "text", "text": {"content": "🔍 패턴 분석 결과"}}]
                    }
                })
                
                for key, value in analysis.items():
                    blocks.append({
                        "object": "block",
                        "type": "bulleted_list_item",
                        "bulleted_list_item": {
                            "rich_text": [{"type": "text", "text": {"content": f"{key}: {value}"}}]
                        }
                    })
            
            # 추천사항 블록
            recommendations = heatmap_data.get("recommendations", [])
            if recommendations:
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {
                        "rich_text": [{"type": "text", "text": {"content": "💡 개선 추천사항"}}]
                    }
                })
                
                for recommendation in recommendations:
                    blocks.append({
                        "object": "block",
                        "type": "bulleted_list_item",
                        "bulleted_list_item": {
                            "rich_text": [{"type": "text", "text": {"content": recommendation}}]
                        }
                    })
            
            return blocks
            
        except Exception as e:
            self.logger.log_error(e, "Notion 히트맵 블록 생성")
            return [{
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": f"히트맵 생성 실패: {str(e)}"}}]
                }
            }]


def test_github_heatmap():
    """GitHubTimePartHeatmap 테스트 함수"""
    print("📈 시간대별 GitHub 활동 히트맵 시스템 테스트 시작")
    
    heatmap = GitHubTimePartHeatmap()
    
    # 히트맵 생성 테스트
    print("\n🔥 GitHub 활동 히트맵 생성 중...")
    heatmap_data = heatmap.create_github_timepart_heatmap(days=7)
    
    if heatmap_data:
        print("✅ 히트맵 생성 성공!")
        print(f"📈 분석 기간: {heatmap_data.get('data_period', 'N/A')}")
        
        stats = heatmap_data.get('statistics', {})
        print(f"📊 총 활동: {stats.get('total_activity', 0)}개")
        print(f"📊 일평균: {stats.get('average_daily', 0):.1f}개")
        
        best = stats.get('best_timepart', {})
        if best.get('timepart'):
            print(f"🏆 최고 활동: {best['timepart']} ({best['activity']}개)")
            
        # Notion 블록 생성 테스트
        print("\n📝 Notion 블록 변환 중...")
        notion_blocks = heatmap.create_notion_heatmap_blocks(heatmap_data)
        print(f"✅ Notion 블록 {len(notion_blocks)}개 생성 완료")
        
    else:
        print("❌ 히트맵 생성 실패")
    
    print("\n✅ 시간대별 GitHub 활동 히트맵 시스템 테스트 완료")


if __name__ == "__main__":
    test_github_heatmap()
