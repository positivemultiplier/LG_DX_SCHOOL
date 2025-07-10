"""
3-Part 시간대별 시각화 시스템
오전수업/오후수업/저녁자율학습 3개 시간대의 성과를 비교 시각화
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

class TimePartVisualizer:
    """시간대별 성과 비교 시각화 클래스"""
    
    def __init__(self):
        self.logger = ThreePartLogger()
        self.data_dir = os.path.join(project_root, 'data')
        
        # 시간대별 색상 정의
        self.timepart_colors = {
            "🌅 오전수업": "#FFE066",      # 노란색 - 새벽/아침
            "🌞 오후수업": "#FF8A56",      # 주황색 - 오후 
            "🌙 저녁자율학습": "#9B7EDE"    # 보라색 - 저녁
        }
        
        # 성과 지표 정의
        self.performance_metrics = [
            "이해도", "집중도", "GitHub활동", "컨디션", "종합효율성"
        ]
    
    def load_3part_data(self, days: int = 7) -> Dict[str, List[Dict]]:
        """
        최근 N일간의 3-Part 데이터 로드
        
        Args:
            days: 로드할 일수 (기본값: 7일)
            
        Returns:
            시간대별로 분류된 데이터 딕셔너리
        """
        try:
            timepart_data = {
                "🌅 오전수업": [],
                "🌞 오후수업": [], 
                "🌙 저녁자율학습": []
            }
            
            # 각 시간대별 데이터 파일 로드
            for timepart in timepart_data.keys():
                data_files = []
                
                # 최근 N일간의 데이터 파일 찾기
                for day_offset in range(days):
                    date = datetime.now() - timedelta(days=day_offset)
                    date_str = date.strftime("%Y%m%d")
                    
                    # 각 시간대별 파일 경로
                    if "오전" in timepart:
                        file_path = os.path.join(self.data_dir, "morning_reflections", f"morning_reflection_{date_str}.json")
                    elif "오후" in timepart:
                        file_path = os.path.join(self.data_dir, "afternoon_reflections", f"afternoon_reflection_{date_str}.json")
                    else:  # 저녁
                        file_path = os.path.join(self.data_dir, "evening_reflections", f"evening_reflection_{date_str}.json")
                    
                    if os.path.exists(file_path):
                        with open(file_path, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            timepart_data[timepart].append(data)
            
            self.logger.info(f"3-Part 데이터 로드 완료: {sum(len(data) for data in timepart_data.values())}개 엔트리")
            return timepart_data
            
        except Exception as e:
            self.logger.log_error(e, "3-Part 데이터 로드")
            return {"🌅 오전수업": [], "🌞 오후수업": [], "🌙 저녁자율학습": []}
    
    def calculate_timepart_average(self, timepart: str, data_list: List[Dict]) -> Dict[str, float]:
        """
        특정 시간대의 평균 성과 지표 계산
        
        Args:
            timepart: 시간대 ("🌅 오전수업", "🌞 오후수업", "🌙 저녁자율학습")
            data_list: 해당 시간대의 데이터 리스트
            
        Returns:
            평균 성과 지표 딕셔너리
        """
        if not data_list:
            return {
                "understanding": 0.0,
                "concentration": 0.0, 
                "github_score": 0.0,
                "condition": 0.0,
                "efficiency": 0.0
            }
        
        total_understanding = 0
        total_concentration = 0
        total_github = 0
        total_condition = 0
        total_efficiency = 0
        
        for entry in data_list:
            # 이해도 (1-10 스케일)
            understanding = entry.get('학습이해도', entry.get('이해도', 5))
            total_understanding += understanding
            
            # 집중도 (1-10 스케일)
            concentration = entry.get('집중도', entry.get('계획달성도', 5))
            total_concentration += concentration
            
            # GitHub 활동 점수
            github_data = entry.get('github_data', {})
            github_score = github_data.get('productivity_score', 0)
            total_github += github_score
            
            # 컨디션 (좋음:8, 보통:5, 나쁨:2로 변환)
            condition_text = entry.get('컨디션', '보통')
            condition_score = {"좋음": 8, "보통": 5, "나쁨": 2}.get(condition_text, 5)
            total_condition += condition_score
            
            # 종합 효율성 (총점 기반)
            total_score = entry.get('총점', 50)
            efficiency = min(total_score / 10, 10)  # 100점 만점을 10점으로 정규화
            total_efficiency += efficiency
        
        count = len(data_list)
        return {
            "understanding": round(total_understanding / count, 1),
            "concentration": round(total_concentration / count, 1),
            "github_score": round(total_github / count, 1),
            "condition": round(total_condition / count, 1),
            "efficiency": round(total_efficiency / count, 1)
        }
    
    def create_3part_performance_radar(self, days: int = 7) -> Dict[str, Any]:
        """
        오전/오후/저녁 시간대별 성과를 레이더 차트로 시각화
        
        Args:
            days: 분석할 일수 (기본값: 7일)
            
        Returns:
            레이더 차트 데이터 및 메타데이터
        """
        try:
            # 3-Part 데이터 로드
            timepart_data = self.load_3part_data(days)
            
            # 각 시간대별 평균 계산
            radar_data = {}
            for timepart, data_list in timepart_data.items():
                avg_scores = self.calculate_timepart_average(timepart, data_list)
                radar_data[timepart] = avg_scores
            
            # 레이더 차트 구조 생성
            chart_structure = {
                "chart_type": "radar",
                "title": f"🕐 3-Part 시간대별 성과 비교 (최근 {days}일)",
                "description": "오전수업/오후수업/저녁자율학습 시간대별 5개 지표 비교",
                "metrics": self.performance_metrics,
                "timeparts": {
                    "🌅 오전수업": {
                        "color": self.timepart_colors["🌅 오전수업"],
                        "data": [
                            radar_data.get("🌅 오전수업", {}).get("understanding", 0),
                            radar_data.get("🌅 오전수업", {}).get("concentration", 0),
                            radar_data.get("🌅 오전수업", {}).get("github_score", 0),
                            radar_data.get("🌅 오전수업", {}).get("condition", 0),
                            radar_data.get("🌅 오전수업", {}).get("efficiency", 0)
                        ],
                        "entries_count": len(timepart_data.get("🌅 오전수업", []))
                    },
                    "🌞 오후수업": {
                        "color": self.timepart_colors["🌞 오후수업"],
                        "data": [
                            radar_data.get("🌞 오후수업", {}).get("understanding", 0),
                            radar_data.get("🌞 오후수업", {}).get("concentration", 0),
                            radar_data.get("🌞 오후수업", {}).get("github_score", 0),
                            radar_data.get("🌞 오후수업", {}).get("condition", 0),
                            radar_data.get("🌞 오후수업", {}).get("efficiency", 0)
                        ],
                        "entries_count": len(timepart_data.get("🌞 오후수업", []))
                    },
                    "🌙 저녁자율학습": {
                        "color": self.timepart_colors["🌙 저녁자율학습"],
                        "data": [
                            radar_data.get("🌙 저녁자율학습", {}).get("understanding", 0),
                            radar_data.get("🌙 저녁자율학습", {}).get("concentration", 0),
                            radar_data.get("🌙 저녁자율학습", {}).get("github_score", 0),
                            radar_data.get("🌙 저녁자율학습", {}).get("condition", 0),
                            radar_data.get("🌙 저녁자율학습", {}).get("efficiency", 0)
                        ],
                        "entries_count": len(timepart_data.get("🌙 저녁자율학습", []))
                    }
                },
                "analysis": self._analyze_radar_patterns(radar_data),
                "recommendations": self._generate_timepart_recommendations(radar_data),
                "created_at": datetime.now().isoformat(),
                "data_period": f"{days}일간"
            }
            
            # 레이더 차트 데이터 저장
            output_path = os.path.join(self.data_dir, f"3part_radar_chart_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(chart_structure, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f"3-Part 레이더 차트 생성 완료: {output_path}")
            return chart_structure
            
        except Exception as e:
            self.logger.log_error(e, "3-Part 레이더 차트 생성")
            return {}
    
    def _analyze_radar_patterns(self, radar_data: Dict[str, Dict[str, float]]) -> Dict[str, str]:
        """레이더 차트 패턴 분석"""
        analysis = {}
        
        try:
            # 각 지표별 최고/최저 시간대 찾기
            for metric in self.performance_metrics:
                metric_key = {
                    "이해도": "understanding",
                    "집중도": "concentration", 
                    "GitHub활동": "github_score",
                    "컨디션": "condition",
                    "종합효율성": "efficiency"
                }.get(metric, metric.lower())
                
                scores = {}
                for timepart, data in radar_data.items():
                    scores[timepart] = data.get(metric_key, 0)
                
                if scores:
                    best_timepart = max(scores.keys(), key=lambda x: scores[x])
                    worst_timepart = min(scores.keys(), key=lambda x: scores[x])
                    
                    analysis[f"{metric}_최고"] = f"{best_timepart} ({scores[best_timepart]:.1f}점)"
                    analysis[f"{metric}_최저"] = f"{worst_timepart} ({scores[worst_timepart]:.1f}점)"
            
            # 전체적인 시간대별 순위
            total_scores = {}
            for timepart, data in radar_data.items():
                total_score = sum(data.values())
                total_scores[timepart] = total_score
            
            sorted_timeparts = sorted(total_scores.items(), key=lambda x: x[1], reverse=True)
            analysis["시간대별_순위"] = " > ".join([f"{tp} ({score:.1f})" for tp, score in sorted_timeparts])
            
        except Exception as e:
            self.logger.log_error(e, "레이더 패턴 분석")
            analysis["분석_오류"] = str(e)
        
        return analysis
    
    def _generate_timepart_recommendations(self, radar_data: Dict[str, Dict[str, float]]) -> List[str]:
        """시간대별 추천사항 생성"""
        recommendations = []
        
        try:
            for timepart, data in radar_data.items():
                understanding = data.get("understanding", 0)
                concentration = data.get("concentration", 0)
                github_score = data.get("github_score", 0)
                condition = data.get("condition", 0)
                efficiency = data.get("efficiency", 0)
                
                # 각 시간대별 강점/약점 분석
                if timepart == "🌅 오전수업":
                    if understanding >= 7:
                        recommendations.append("오전은 이해도가 높아 새로운 개념 학습에 최적")
                    elif concentration >= 7:
                        recommendations.append("오전은 집중력이 좋아 집중이 필요한 이론 학습 추천")
                    else:
                        recommendations.append("오전 컨디션 관리 필요 - 충분한 수면과 아침식사 권장")
                        
                elif timepart == "🌞 오후수업":
                    if github_score >= 5:
                        recommendations.append("오후는 GitHub 활동이 활발해 실습과 프로젝트에 집중")
                    elif efficiency >= 7:
                        recommendations.append("오후는 전반적 효율성이 높아 중요한 과제 수행 적합")
                    else:
                        recommendations.append("오후 에너지 저하 - 적절한 휴식과 간식 섭취 필요")
                        
                else:  # 저녁자율학습
                    if concentration >= 7:
                        recommendations.append("저녁은 집중도가 높아 복습과 정리에 최적")
                    elif github_score >= 5:
                        recommendations.append("저녁은 개인 프로젝트와 자율 학습에 집중")
                    else:
                        recommendations.append("저녁 집중력 관리 - 규칙적인 휴식과 목표 설정 필요")
            
            # 전체적인 3-Part 밸런스 추천
            timepart_averages = {tp: sum(data.values())/5 for tp, data in radar_data.items()}
            best_timepart = max(timepart_averages.keys(), key=lambda x: timepart_averages[x])
            recommendations.append(f"현재 가장 효율적인 시간대: {best_timepart} - 중요한 학습을 이 시간에 배치")
            
        except Exception as e:
            self.logger.log_error(e, "시간대별 추천사항 생성")
            recommendations.append(f"추천사항 생성 중 오류 발생: {str(e)}")
        
        return recommendations

    def create_notion_radar_chart_blocks(self, chart_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Notion 블록 형태로 레이더 차트 데이터 변환
        
        Args:
            chart_data: 레이더 차트 데이터
            
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
                    "rich_text": [{"type": "text", "text": {"content": chart_data.get("title", "3-Part 레이더 차트")}}]
                }
            })
            
            # 설명 블록
            blocks.append({
                "object": "block", 
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": chart_data.get("description", "")}}]
                }
            })
            
            # 각 시간대별 성과 표시
            for timepart, data in chart_data.get("timeparts", {}).items():
                # 시간대 제목
                blocks.append({
                    "object": "block",
                    "type": "heading_3", 
                    "heading_3": {
                        "rich_text": [{"type": "text", "text": {"content": f"{timepart} (데이터 {data['entries_count']}개)"}}]
                    }
                })
                
                # 성과 지표 테이블
                metrics = chart_data.get("metrics", [])
                metric_values = data.get("data", [])
                
                table_content = "| 지표 | 점수 | 평가 |\n|------|------|------|\n"
                for i, (metric, value) in enumerate(zip(metrics, metric_values)):
                    grade = "🟢 우수" if value >= 7 else "🟡 보통" if value >= 4 else "🔴 개선필요"
                    table_content += f"| {metric} | {value:.1f} | {grade} |\n"
                
                blocks.append({
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": table_content}}]
                    }
                })
            
            # 분석 결과 블록
            analysis = chart_data.get("analysis", {})
            if analysis:
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {
                        "rich_text": [{"type": "text", "text": {"content": "📊 패턴 분석 결과"}}]
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
            recommendations = chart_data.get("recommendations", [])
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
            self.logger.log_error(e, "Notion 레이더 차트 블록 생성")
            return [{
                "object": "block",
                "type": "paragraph", 
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": f"차트 생성 실패: {str(e)}"}}]
                }
            }]


def test_time_part_visualizer():
    """TimePartVisualizer 테스트 함수"""
    print("🕐 3-Part 시간대별 시각화 시스템 테스트 시작")
    
    visualizer = TimePartVisualizer()
    
    # 레이더 차트 생성 테스트
    print("\n📊 3-Part 레이더 차트 생성 중...")
    radar_chart = visualizer.create_3part_performance_radar(days=7)
    
    if radar_chart:
        print("✅ 레이더 차트 생성 성공!")
        print(f"📈 분석 기간: {radar_chart.get('data_period', 'N/A')}")
        print(f"📊 시간대 수: {len(radar_chart.get('timeparts', {}))}")
        print(f"📋 추천사항 수: {len(radar_chart.get('recommendations', []))}")
        
        # 시간대별 요약 출력
        for timepart, data in radar_chart.get('timeparts', {}).items():
            entries_count = data.get('entries_count', 0)
            avg_score = sum(data.get('data', [])) / 5 if data.get('data') else 0
            print(f"  {timepart}: {entries_count}개 데이터, 평균 {avg_score:.1f}점")
            
        # Notion 블록 생성 테스트
        print("\n📝 Notion 블록 변환 중...")
        notion_blocks = visualizer.create_notion_radar_chart_blocks(radar_chart)
        print(f"✅ Notion 블록 {len(notion_blocks)}개 생성 완료")
        
    else:
        print("❌ 레이더 차트 생성 실패")
    
    print("\n✅ 3-Part 시간대별 시각화 시스템 테스트 완료")


if __name__ == "__main__":
    test_time_part_visualizer()
