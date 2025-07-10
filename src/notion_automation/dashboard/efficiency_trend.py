"""
시간대별 학습 효율성 트렌드 차트 시각화 시스템
날짜별 3개 시간대 효율성 변화 추이 분석
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

class EfficiencyTrendChart:
    """시간대별 학습 효율성 트렌드 차트 클래스"""
    
    def __init__(self):
        self.logger = ThreePartLogger()
        self.data_dir = os.path.join(project_root, 'data')
        
        # 시간대별 색상 정의
        self.timepart_colors = {
            "🌅 오전수업": "#FFE066",      # 노란색
            "🌞 오후수업": "#FF8A56",      # 주황색 
            "🌙 저녁자율학습": "#9B7EDE"    # 보라색
        }
        
        # 효율성 등급 정의
        self.efficiency_grades = {
            (0, 3): "매우 낮음",
            (3, 5): "낮음", 
            (5, 7): "보통",
            (7, 8.5): "높음",
            (8.5, 10): "매우 높음"
        }
    
    def load_efficiency_data(self, days: int = 7) -> Dict[str, Dict[str, float]]:
        """
        최근 N일간의 효율성 데이터 로드
        
        Args:
            days: 로드할 일수 (기본값: 7일)
            
        Returns:
            날짜별, 시간대별 효율성 데이터
        """
        try:
            efficiency_data = {}
            
            for day_offset in range(days):
                date = datetime.now() - timedelta(days=day_offset)
                date_str = date.strftime("%Y-%m-%d")
                
                day_data = {
                    "date": date_str,
                    "🌅 오전수업": 0.0,
                    "🌞 오후수업": 0.0,
                    "🌙 저녁자율학습": 0.0
                }
                
                # 각 시간대별 데이터 파일에서 효율성 추출
                timepart_files = {
                    "🌅 오전수업": ("morning_reflections", f"morning_reflection_{date.strftime('%Y%m%d')}.json"),
                    "🌞 오후수업": ("afternoon_reflections", f"afternoon_reflection_{date.strftime('%Y%m%d')}.json"),
                    "🌙 저녁자율학습": ("evening_reflections", f"evening_reflection_{date.strftime('%Y%m%d')}.json")
                }
                
                for timepart, (folder, filename) in timepart_files.items():
                    file_path = os.path.join(self.data_dir, folder, filename)
                    
                    if os.path.exists(file_path):
                        with open(file_path, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            
                            # 효율성 점수 계산
                            efficiency = self._calculate_efficiency_score(data, timepart)
                            day_data[timepart] = efficiency
                
                efficiency_data[date_str] = day_data
            
            self.logger.info(f"효율성 데이터 로드 완료: {len(efficiency_data)}일 데이터")
            return efficiency_data
            
        except Exception as e:
            self.logger.log_error(e, "효율성 데이터 로드")
            return {}
    
    def _calculate_efficiency_score(self, data: Dict[str, Any], timepart: str) -> float:
        """
        개별 데이터에서 효율성 점수 계산
        
        Args:
            data: 시간대별 반성 데이터
            timepart: 시간대
            
        Returns:
            효율성 점수 (0-10)
        """
        try:
            # 기본 학습 지표들
            understanding = data.get('학습이해도', data.get('이해도', 5))
            concentration = data.get('집중도', data.get('계획달성도', 5))
            condition = data.get('컨디션', '보통')
            
            # 컨디션을 숫자로 변환
            condition_score = {"좋음": 8, "보통": 5, "나쁨": 2}.get(condition, 5)
            
            # GitHub 활동 점수
            github_data = data.get('github_data', {})
            github_score = github_data.get('productivity_score', 0)
            
            # 학습 시간
            study_time = data.get('학습시간', data.get('실제학습시간', 3))
            
            # 시간대별 특화 가중치
            if "오전" in timepart:
                # 오전: 이해도와 컨디션 중요
                efficiency = (understanding * 0.3 + concentration * 0.2 + 
                            condition_score * 0.3 + min(github_score/2, 5) * 0.1 + 
                            min(study_time/3, 3.33) * 0.1)
            elif "오후" in timepart:
                # 오후: 실습과 GitHub 활동 중요
                efficiency = (understanding * 0.2 + concentration * 0.3 + 
                            condition_score * 0.2 + min(github_score/2, 5) * 0.2 + 
                            min(study_time/4, 2.5) * 0.1)
            else:  # 저녁
                # 저녁: 집중도와 자기주도성 중요
                efficiency = (understanding * 0.2 + concentration * 0.4 + 
                            condition_score * 0.2 + min(github_score/2, 5) * 0.15 + 
                            min(study_time/3, 3.33) * 0.05)
            
            return round(min(efficiency, 10), 1)
            
        except Exception as e:
            self.logger.log_error(e, f"효율성 점수 계산 ({timepart})")
            return 5.0
    
    def create_efficiency_trend_chart(self, days: int = 7) -> Dict[str, Any]:
        """
        시간대별 학습 효율성 트렌드 차트 생성
        
        Args:
            days: 분석할 일수 (기본값: 7일)
            
        Returns:
            트렌드 차트 데이터 및 메타데이터
        """
        try:
            # 효율성 데이터 로드
            efficiency_data = self.load_efficiency_data(days)
            
            # 날짜순으로 정렬 (과거순)
            sorted_dates = sorted(efficiency_data.keys())
            
            # 트렌드 데이터 구성
            trend_data = {
                "🌅 오전수업": [],
                "🌞 오후수업": [], 
                "🌙 저녁자율학습": []
            }
            
            date_labels = []
            
            for date_str in sorted_dates:
                day_data = efficiency_data[date_str]
                date_labels.append(date_str)
                
                for timepart in trend_data.keys():
                    efficiency = day_data.get(timepart, 0)
                    trend_data[timepart].append({
                        "date": date_str,
                        "efficiency": efficiency,
                        "grade": self._get_efficiency_grade(efficiency)
                    })
            
            # 트렌드 분석
            trend_analysis = self._analyze_efficiency_trends(trend_data, sorted_dates)
            
            # 개선도 계산
            improvement_analysis = self._calculate_improvement_rates(trend_data)
            
            # 트렌드 차트 구조 생성
            chart_structure = {
                "chart_type": "line_trend",
                "title": f"📈 시간대별 학습 효율성 트렌드 (최근 {days}일)",
                "description": "날짜별 3개 시간대 효율성 변화 추이 및 학습 곡선 분석",
                "date_labels": date_labels,
                "trend_lines": {
                    "🌅 오전수업": {
                        "color": self.timepart_colors["🌅 오전수업"],
                        "data": trend_data["🌅 오전수업"],
                        "average": sum([d["efficiency"] for d in trend_data["🌅 오전수업"]]) / len(trend_data["🌅 오전수업"]) if trend_data["🌅 오전수업"] else 0
                    },
                    "🌞 오후수업": {
                        "color": self.timepart_colors["🌞 오후수업"],
                        "data": trend_data["🌞 오후수업"],
                        "average": sum([d["efficiency"] for d in trend_data["🌞 오후수업"]]) / len(trend_data["🌞 오후수업"]) if trend_data["🌞 오후수업"] else 0
                    },
                    "🌙 저녁자율학습": {
                        "color": self.timepart_colors["🌙 저녁자율학습"],
                        "data": trend_data["🌙 저녁자율학습"],
                        "average": sum([d["efficiency"] for d in trend_data["🌙 저녁자율학습"]]) / len(trend_data["🌙 저녁자율학습"]) if trend_data["🌙 저녁자율학습"] else 0
                    }
                },
                "trend_analysis": trend_analysis,
                "improvement_analysis": improvement_analysis,
                "recommendations": self._generate_trend_recommendations(trend_analysis, improvement_analysis),
                "created_at": datetime.now().isoformat(),
                "data_period": f"{days}일간"
            }
            
            # 트렌드 차트 데이터 저장
            output_path = os.path.join(self.data_dir, f"efficiency_trend_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(chart_structure, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f"효율성 트렌드 차트 생성 완료: {output_path}")
            return chart_structure
            
        except Exception as e:
            self.logger.log_error(e, "효율성 트렌드 차트 생성")
            return {}
    
    def _get_efficiency_grade(self, efficiency: float) -> str:
        """효율성 점수를 등급으로 변환"""
        for (min_val, max_val), grade in self.efficiency_grades.items():
            if min_val <= efficiency < max_val:
                return grade
        return "보통"
    
    def _analyze_efficiency_trends(self, trend_data: Dict[str, List], sorted_dates: List[str]) -> Dict[str, Any]:
        """효율성 트렌드 분석"""
        analysis = {}
        
        try:
            for timepart, data_points in trend_data.items():
                if len(data_points) >= 2:
                    # 첫째 날과 마지막 날 비교
                    first_efficiency = data_points[0]["efficiency"]
                    last_efficiency = data_points[-1]["efficiency"]
                    
                    change = last_efficiency - first_efficiency
                    change_percent = (change / first_efficiency * 100) if first_efficiency > 0 else 0
                    
                    # 트렌드 방향 판단
                    if change > 1:
                        trend_direction = "상승"
                    elif change < -1:
                        trend_direction = "하락"
                    else:
                        trend_direction = "안정"
                    
                    # 최고점/최저점 찾기
                    max_point = max(data_points, key=lambda x: x["efficiency"])
                    min_point = min(data_points, key=lambda x: x["efficiency"])
                    
                    analysis[timepart] = {
                        "trend_direction": trend_direction,
                        "change_amount": round(change, 1),
                        "change_percent": round(change_percent, 1),
                        "highest_point": {
                            "date": max_point["date"],
                            "efficiency": max_point["efficiency"]
                        },
                        "lowest_point": {
                            "date": min_point["date"],
                            "efficiency": min_point["efficiency"]
                        },
                        "volatility": round(max_point["efficiency"] - min_point["efficiency"], 1)
                    }
            
            # 전체적인 패턴 분석
            timepart_averages = {}
            for timepart, data_points in trend_data.items():
                avg = sum([d["efficiency"] for d in data_points]) / len(data_points) if data_points else 0
                timepart_averages[timepart] = avg
            
            best_timepart = max(timepart_averages.keys(), key=lambda x: timepart_averages[x]) if timepart_averages else None
            worst_timepart = min(timepart_averages.keys(), key=lambda x: timepart_averages[x]) if timepart_averages else None
            
            analysis["overall"] = {
                "best_performing_timepart": best_timepart,
                "worst_performing_timepart": worst_timepart,
                "timepart_averages": timepart_averages
            }
            
        except Exception as e:
            self.logger.log_error(e, "효율성 트렌드 분석")
            analysis["분석_오류"] = str(e)
        
        return analysis
    
    def _calculate_improvement_rates(self, trend_data: Dict[str, List]) -> Dict[str, Dict]:
        """개선율 계산"""
        improvement_rates = {}
        
        try:
            for timepart, data_points in trend_data.items():
                if len(data_points) >= 3:
                    # 초기 3일 평균 vs 최근 3일 평균
                    initial_avg = sum([d["efficiency"] for d in data_points[:3]]) / 3
                    recent_avg = sum([d["efficiency"] for d in data_points[-3:]]) / 3
                    
                    improvement_rate = ((recent_avg - initial_avg) / initial_avg * 100) if initial_avg > 0 else 0
                    
                    # 일관성 점수 (표준편차의 역수)
                    efficiencies = [d["efficiency"] for d in data_points]
                    mean_eff = sum(efficiencies) / len(efficiencies)
                    variance = sum([(e - mean_eff) ** 2 for e in efficiencies]) / len(efficiencies)
                    std_dev = variance ** 0.5
                    consistency_score = max(0, 10 - std_dev)  # 표준편차가 낮을수록 일관성 높음
                    
                    improvement_rates[timepart] = {
                        "improvement_rate": round(improvement_rate, 1),
                        "initial_average": round(initial_avg, 1),
                        "recent_average": round(recent_avg, 1),
                        "consistency_score": round(consistency_score, 1),
                        "trend_quality": "개선" if improvement_rate > 5 else "악화" if improvement_rate < -5 else "유지"
                    }
            
        except Exception as e:
            self.logger.log_error(e, "개선율 계산")
            improvement_rates["계산_오류"] = str(e)
        
        return improvement_rates
    
    def _generate_trend_recommendations(self, trend_analysis: Dict, improvement_analysis: Dict) -> List[str]:
        """트렌드 기반 추천사항 생성"""
        recommendations = []
        
        try:
            # 전체적인 패턴 기반 추천
            overall = trend_analysis.get("overall", {})
            best_timepart = overall.get("best_performing_timepart")
            worst_timepart = overall.get("worst_performing_timepart")
            
            if best_timepart and worst_timepart:
                recommendations.append(f"{best_timepart}의 효율성이 가장 높음 - 중요한 학습을 이 시간에 집중")
                recommendations.append(f"{worst_timepart}의 효율성 개선 필요 - 학습 방법이나 환경 점검 권장")
            
            # 시간대별 트렌드 기반 추천
            for timepart in ["🌅 오전수업", "🌞 오후수업", "🌙 저녁자율학습"]:
                timepart_trend = trend_analysis.get(timepart, {})
                improvement = improvement_analysis.get(timepart, {})
                
                if timepart_trend:
                    trend_direction = timepart_trend.get("trend_direction", "")
                    change_percent = timepart_trend.get("change_percent", 0)
                    volatility = timepart_trend.get("volatility", 0)
                    
                    if trend_direction == "상승" and change_percent > 10:
                        recommendations.append(f"{timepart} 효율성 크게 향상 중 ({change_percent:+.1f}%) - 현재 학습 방법 유지")
                    elif trend_direction == "하락" and change_percent < -10:
                        recommendations.append(f"{timepart} 효율성 저하 중 ({change_percent:+.1f}%) - 학습 전략 재검토 필요")
                    
                    if volatility > 3:
                        recommendations.append(f"{timepart} 효율성 변동 큼 - 일관된 학습 패턴 개발 필요")
                
                if improvement:
                    consistency = improvement.get("consistency_score", 0)
                    if consistency < 5:
                        recommendations.append(f"{timepart} 학습 일관성 부족 - 정기적인 학습 습관 구축 권장")
            
            # 추가 종합 추천사항
            if len(recommendations) == 0:
                recommendations.append("전반적으로 안정적인 학습 효율성 - 현재 패턴 유지하며 점진적 개선")
            
        except Exception as e:
            self.logger.log_error(e, "트렌드 추천사항 생성")
            recommendations.append(f"추천사항 생성 중 오류 발생: {str(e)}")
        
        return recommendations


def test_efficiency_trend_chart():
    """EfficiencyTrendChart 테스트 함수"""
    print("📈 시간대별 학습 효율성 트렌드 차트 시스템 테스트 시작")
    
    trend_chart = EfficiencyTrendChart()
    
    # 트렌드 차트 생성 테스트
    print("\n📊 효율성 트렌드 차트 생성 중...")
    chart_data = trend_chart.create_efficiency_trend_chart(days=7)
    
    if chart_data:
        print("✅ 트렌드 차트 생성 성공!")
        print(f"📈 분석 기간: {chart_data.get('data_period', 'N/A')}")
        
        # 시간대별 평균 효율성 출력
        trend_lines = chart_data.get('trend_lines', {})
        for timepart, line_data in trend_lines.items():
            avg_efficiency = line_data.get('average', 0)
            print(f"  {timepart}: 평균 효율성 {avg_efficiency:.1f}점")
        
        # 트렌드 분석 결과 출력
        trend_analysis = chart_data.get('trend_analysis', {})
        overall = trend_analysis.get('overall', {})
        
        best_timepart = overall.get('best_performing_timepart')
        if best_timepart:
            print(f"🏆 최고 효율 시간대: {best_timepart}")
        
        # 추천사항 개수 출력
        recommendations = chart_data.get('recommendations', [])
        print(f"💡 추천사항: {len(recommendations)}개")
        
    else:
        print("❌ 트렌드 차트 생성 실패")
    
    print("\n✅ 시간대별 학습 효율성 트렌드 차트 시스템 테스트 완료")


if __name__ == "__main__":
    test_efficiency_trend_chart()
