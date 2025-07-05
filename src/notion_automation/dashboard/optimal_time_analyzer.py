"""
개인별 최적 학습 시간대 분석 및 추천 시스템
3-Part 데이터를 분석하여 개인화된 학습 전략 제공
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

class OptimalTimeAnalyzer:
    """개인별 최적 학습 시간대 분석 클래스"""
    
    def __init__(self):
        self.logger = ThreePartLogger()
        self.data_dir = os.path.join(project_root, 'data')
        
        # 분석 차원 정의
        self.analysis_dimensions = {
            "understanding": "이해도",
            "github_activity": "GitHub 활동",
            "condition": "컨디션",
            "concentration": "집중도",
            "learning_time": "학습시간",
            "overall_score": "종합점수"
        }
        
        # 학습 유형별 가중치
        self.learning_type_weights = {
            "이론학습": {
                "understanding": 0.4,
                "concentration": 0.3,
                "condition": 0.2,
                "github_activity": 0.05,
                "learning_time": 0.05
            },
            "실습코딩": {
                "github_activity": 0.35,
                "concentration": 0.25,
                "understanding": 0.2,
                "condition": 0.15,
                "learning_time": 0.05
            },
            "프로젝트": {
                "github_activity": 0.3,
                "concentration": 0.25,
                "condition": 0.2,
                "understanding": 0.15,
                "learning_time": 0.1
            },
            "복습정리": {
                "understanding": 0.35,
                "concentration": 0.3,
                "condition": 0.2,
                "learning_time": 0.1,
                "github_activity": 0.05
            }
        }
    
    def load_comprehensive_data(self, days: int = 14) -> Dict[str, Dict[str, Any]]:
        """
        종합적인 3-Part 데이터 로드
        
        Args:
            days: 분석할 일수 (기본값: 14일)
            
        Returns:
            날짜별, 시간대별 종합 데이터
        """
        try:
            comprehensive_data = {}
            
            for day_offset in range(days):
                date = datetime.now() - timedelta(days=day_offset)
                date_str = date.strftime("%Y-%m-%d")
                weekday = date.strftime("%A")
                
                day_data = {
                    "date": date_str,
                    "weekday": weekday,
                    "timeparts": {}
                }
                
                # 각 시간대별 데이터 수집
                timepart_configs = {
                    "🌅 오전수업": ("morning_reflections", f"morning_reflection_{date.strftime('%Y%m%d')}.json"),
                    "🌞 오후수업": ("afternoon_reflections", f"afternoon_reflection_{date.strftime('%Y%m%d')}.json"),
                    "🌙 저녁자율학습": ("evening_reflections", f"evening_reflection_{date.strftime('%Y%m%d')}.json")
                }
                
                for timepart, (folder, filename) in timepart_configs.items():
                    file_path = os.path.join(self.data_dir, folder, filename)
                    
                    timepart_data = {
                        "understanding": 0,
                        "concentration": 0,
                        "condition": 0,
                        "github_activity": 0,
                        "learning_time": 0,
                        "overall_score": 0,
                        "has_data": False
                    }
                    
                    if os.path.exists(file_path):
                        with open(file_path, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            timepart_data = self._extract_timepart_metrics(data, timepart)
                            timepart_data["has_data"] = True
                    
                    day_data["timeparts"][timepart] = timepart_data
                
                comprehensive_data[date_str] = day_data
            
            self.logger.info(f"종합 데이터 로드 완료: {len(comprehensive_data)}일 데이터")
            return comprehensive_data
            
        except Exception as e:
            self.logger.log_error(e, "종합 데이터 로드")
            return {}
    
    def _extract_timepart_metrics(self, data: Dict[str, Any], timepart: str) -> Dict[str, Any]:
        """시간대별 데이터에서 메트릭 추출"""
        try:
            # 이해도
            understanding = data.get('학습이해도', data.get('이해도', 0))
            
            # 집중도 
            concentration = data.get('집중도', data.get('계획달성도', 0))
            
            # 컨디션 (숫자로 변환)
            condition_text = data.get('컨디션', '보통')
            condition = {"좋음": 8, "보통": 5, "나쁨": 2}.get(condition_text, 5)
            
            # GitHub 활동
            github_data = data.get('github_data', {})
            github_activity = (
                github_data.get('commits', 0) * 2 +
                github_data.get('issues', 0) * 1.5 +
                github_data.get('pull_requests', 0) * 3
            )
            
            # 학습 시간
            learning_time = data.get('학습시간', data.get('실제학습시간', 0))
            
            # 종합 점수
            overall_score = data.get('총점', 0)
            
            return {
                "understanding": understanding,
                "concentration": concentration,
                "condition": condition,
                "github_activity": min(github_activity, 20),  # 최대 20점으로 제한
                "learning_time": learning_time,
                "overall_score": overall_score
            }
            
        except Exception as e:
            self.logger.log_error(e, f"메트릭 추출 ({timepart})")
            return {
                "understanding": 0,
                "concentration": 0,
                "condition": 0,
                "github_activity": 0,
                "learning_time": 0,
                "overall_score": 0
            }
    
    def identify_optimal_learning_times(self, days: int = 14) -> Dict[str, Any]:
        """
        개인의 3-Part 데이터를 분석하여 최적 학습 시간대 식별
        
        Args:
            days: 분석할 일수 (기본값: 14일)
            
        Returns:
            최적 시간대 분석 결과
        """
        try:
            # 종합 데이터 로드
            comprehensive_data = self.load_comprehensive_data(days)
            
            # 시간대별 성과 집계
            timepart_performance = {}
            for timepart in ["🌅 오전수업", "🌞 오후수업", "🌙 저녁자율학습"]:
                timepart_performance[timepart] = self._aggregate_timepart_performance(
                    comprehensive_data, timepart
                )
            
            # 다차원 분석
            dimensional_analysis = {}
            for dimension, korean_name in self.analysis_dimensions.items():
                best_timepart = self._find_best_timepart_for_dimension(
                    timepart_performance, dimension
                )
                dimensional_analysis[korean_name] = best_timepart
            
            # 학습 유형별 최적 시간대
            learning_type_optimal = {}
            for learning_type, weights in self.learning_type_weights.items():
                optimal_timepart = self._calculate_weighted_optimal_time(
                    timepart_performance, weights
                )
                learning_type_optimal[learning_type] = optimal_timepart
            
            # 일관성 분석
            consistency_analysis = self._analyze_consistency(comprehensive_data)
            
            # 요일별 패턴 분석
            weekday_patterns = self._analyze_weekday_patterns(comprehensive_data)
            
            # 종합 추천
            overall_recommendation = self._generate_overall_recommendation(
                timepart_performance, dimensional_analysis, learning_type_optimal
            )
            
            # 분석 결과 구조
            analysis_result = {
                "analysis_type": "optimal_time_identification",
                "title": f"🎯 개인별 최적 학습 시간대 분석 (최근 {days}일)",
                "analysis_period": f"{days}일간",
                "timepart_performance": timepart_performance,
                "dimensional_analysis": dimensional_analysis,
                "learning_type_optimal": learning_type_optimal,
                "consistency_analysis": consistency_analysis,
                "weekday_patterns": weekday_patterns,
                "overall_recommendation": overall_recommendation,
                "personalized_recommendations": self._generate_personalized_recommendations(
                    timepart_performance, dimensional_analysis, learning_type_optimal
                ),
                "created_at": datetime.now().isoformat()
            }
            
            # 분석 결과 저장
            output_path = os.path.join(self.data_dir, f"optimal_time_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(analysis_result, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f"최적 시간대 분석 완료: {output_path}")
            return analysis_result
            
        except Exception as e:
            self.logger.log_error(e, "최적 시간대 분석")
            return {}
    
    def _aggregate_timepart_performance(self, data: Dict[str, Dict], timepart: str) -> Dict[str, Any]:
        """시간대별 성과 집계"""
        try:
            metrics = {
                "understanding": [],
                "concentration": [],
                "condition": [],
                "github_activity": [],
                "learning_time": [],
                "overall_score": []
            }
            
            valid_days = 0
            
            for date_str, day_data in data.items():
                timepart_data = day_data["timeparts"].get(timepart, {})
                
                if timepart_data.get("has_data", False):
                    valid_days += 1
                    for metric in metrics.keys():
                        value = timepart_data.get(metric, 0)
                        metrics[metric].append(value)
            
            # 통계 계산
            aggregated = {
                "valid_days": valid_days,
                "activity_rate": (valid_days / len(data)) * 100 if data else 0
            }
            
            for metric, values in metrics.items():
                if values:
                    aggregated[metric] = {
                        "average": sum(values) / len(values),
                        "max": max(values),
                        "min": min(values),
                        "total": sum(values),
                        "consistency": self._calculate_consistency_score(values)
                    }
                else:
                    aggregated[metric] = {
                        "average": 0, "max": 0, "min": 0, "total": 0, "consistency": 0
                    }
            
            return aggregated
            
        except Exception as e:
            self.logger.log_error(e, f"시간대별 성과 집계 ({timepart})")
            return {}
    
    def _calculate_consistency_score(self, values: List[float]) -> float:
        """일관성 점수 계산 (낮은 변동성 = 높은 일관성)"""
        if len(values) <= 1:
            return 0
        
        mean_val = sum(values) / len(values)
        variance = sum([(v - mean_val) ** 2 for v in values]) / len(values)
        std_dev = variance ** 0.5
        
        # 표준편차가 낮을수록 일관성이 높음 (0-10 스케일)
        consistency = max(0, 10 - std_dev)
        return round(consistency, 1)
    
    def _find_best_timepart_for_dimension(self, timepart_performance: Dict, dimension: str) -> Dict[str, Any]:
        """특정 차원에서 최고 성과 시간대 찾기"""
        try:
            timepart_scores = {}
            
            for timepart, performance in timepart_performance.items():
                dimension_data = performance.get(dimension, {})
                score = dimension_data.get("average", 0)
                timepart_scores[timepart] = score
            
            if timepart_scores:
                best_timepart = max(timepart_scores.keys(), key=lambda x: timepart_scores[x])
                best_score = timepart_scores[best_timepart]
                
                return {
                    "best_timepart": best_timepart,
                    "score": round(best_score, 1),
                    "all_scores": {tp: round(score, 1) for tp, score in timepart_scores.items()}
                }
            
            return {"best_timepart": None, "score": 0, "all_scores": {}}
            
        except Exception as e:
            self.logger.log_error(e, f"최고 성과 시간대 찾기 ({dimension})")
            return {"best_timepart": None, "score": 0, "all_scores": {}}
    
    def _calculate_weighted_optimal_time(self, timepart_performance: Dict, weights: Dict[str, float]) -> Dict[str, Any]:
        """가중치 기반 최적 시간대 계산"""
        try:
            timepart_weighted_scores = {}
            
            for timepart, performance in timepart_performance.items():
                weighted_score = 0
                
                for dimension, weight in weights.items():
                    dimension_score = performance.get(dimension, {}).get("average", 0)
                    weighted_score += dimension_score * weight
                
                timepart_weighted_scores[timepart] = weighted_score
            
            if timepart_weighted_scores:
                optimal_timepart = max(timepart_weighted_scores.keys(), 
                                     key=lambda x: timepart_weighted_scores[x])
                optimal_score = timepart_weighted_scores[optimal_timepart]
                
                return {
                    "optimal_timepart": optimal_timepart,
                    "weighted_score": round(optimal_score, 1),
                    "all_weighted_scores": {tp: round(score, 1) for tp, score in timepart_weighted_scores.items()}
                }
            
            return {"optimal_timepart": None, "weighted_score": 0, "all_weighted_scores": {}}
            
        except Exception as e:
            self.logger.log_error(e, "가중치 기반 최적 시간대 계산")
            return {"optimal_timepart": None, "weighted_score": 0, "all_weighted_scores": {}}
    
    def _analyze_consistency(self, data: Dict[str, Dict]) -> Dict[str, Dict]:
        """일관성 분석"""
        consistency_analysis = {}
        
        try:
            for timepart in ["🌅 오전수업", "🌞 오후수업", "🌙 저녁자율학습"]:
                daily_scores = []
                
                for date_str, day_data in data.items():
                    timepart_data = day_data["timeparts"].get(timepart, {})
                    if timepart_data.get("has_data", False):
                        score = timepart_data.get("overall_score", 0)
                        daily_scores.append(score)
                
                if daily_scores:
                    consistency_score = self._calculate_consistency_score(daily_scores)
                    avg_score = sum(daily_scores) / len(daily_scores)
                    
                    consistency_analysis[timepart] = {
                        "consistency_score": consistency_score,
                        "average_performance": round(avg_score, 1),
                        "data_points": len(daily_scores),
                        "reliability": "높음" if consistency_score >= 7 else "보통" if consistency_score >= 4 else "낮음"
                    }
                
        except Exception as e:
            self.logger.log_error(e, "일관성 분석")
        
        return consistency_analysis
    
    def _analyze_weekday_patterns(self, data: Dict[str, Dict]) -> Dict[str, Any]:
        """요일별 패턴 분석"""
        weekday_patterns = {}
        
        try:
            weekday_performance = {}
            
            for date_str, day_data in data.items():
                weekday = day_data["weekday"]
                
                if weekday not in weekday_performance:
                    weekday_performance[weekday] = {
                        "🌅 오전수업": [],
                        "🌞 오후수업": [],
                        "🌙 저녁자율학습": []
                    }
                
                for timepart in ["🌅 오전수업", "🌞 오후수업", "🌙 저녁자율학습"]:
                    timepart_data = day_data["timeparts"].get(timepart, {})
                    if timepart_data.get("has_data", False):
                        score = timepart_data.get("overall_score", 0)
                        weekday_performance[weekday][timepart].append(score)
            
            # 요일별 최고 시간대 찾기
            for weekday, timepart_scores in weekday_performance.items():
                best_timepart = None
                best_avg = 0
                
                for timepart, scores in timepart_scores.items():
                    if scores:
                        avg_score = sum(scores) / len(scores)
                        if avg_score > best_avg:
                            best_avg = avg_score
                            best_timepart = timepart
                
                weekday_patterns[weekday] = {
                    "best_timepart": best_timepart,
                    "best_score": round(best_avg, 1)
                }
            
        except Exception as e:
            self.logger.log_error(e, "요일별 패턴 분석")
        
        return weekday_patterns
    
    def _generate_overall_recommendation(self, timepart_performance: Dict, dimensional_analysis: Dict, learning_type_optimal: Dict) -> str:
        """종합 추천사항 생성"""
        try:
            # 가장 많이 추천되는 시간대 찾기
            timepart_mentions = {}
            
            # 차원별 분석에서 추천 집계
            for dimension, result in dimensional_analysis.items():
                best_timepart = result.get("best_timepart")
                if best_timepart:
                    timepart_mentions[best_timepart] = timepart_mentions.get(best_timepart, 0) + 1
            
            # 학습 유형별 분석에서 추천 집계
            for learning_type, result in learning_type_optimal.items():
                optimal_timepart = result.get("optimal_timepart")
                if optimal_timepart:
                    timepart_mentions[optimal_timepart] = timepart_mentions.get(optimal_timepart, 0) + 2  # 학습 유형은 가중치 2배
            
            if timepart_mentions:
                most_recommended = max(timepart_mentions.keys(), key=lambda x: timepart_mentions[x])
                recommendation_count = timepart_mentions[most_recommended]
                
                return f"{most_recommended}이 가장 종합적으로 우수한 시간대입니다. ({recommendation_count}개 영역에서 최적)"
            else:
                return "데이터가 부족하여 명확한 추천이 어렵습니다. 더 많은 데이터 축적 후 재분석 권장합니다."
                
        except Exception as e:
            self.logger.log_error(e, "종합 추천사항 생성")
            return "추천사항 생성 중 오류가 발생했습니다."
    
    def _generate_personalized_recommendations(self, timepart_performance: Dict, dimensional_analysis: Dict, learning_type_optimal: Dict) -> List[str]:
        """개인화된 추천사항 생성"""
        recommendations = []
        
        try:
            # 학습 유형별 추천
            for learning_type, result in learning_type_optimal.items():
                optimal_timepart = result.get("optimal_timepart")
                if optimal_timepart:
                    recommendations.append(f"{learning_type}: {optimal_timepart}에서 가장 효과적")
            
            # 특별한 강점 시간대 추천
            for dimension, result in dimensional_analysis.items():
                best_timepart = result.get("best_timepart")
                score = result.get("score", 0)
                
                if score >= 8:  # 높은 점수인 경우만
                    recommendations.append(f"{dimension} 특화: {best_timepart}에서 우수한 성과 ({score}점)")
            
            # 개선이 필요한 영역 지적
            weakest_areas = []
            for timepart, performance in timepart_performance.items():
                activity_rate = performance.get("activity_rate", 0)
                if activity_rate < 50:  # 활동률이 50% 미만
                    weakest_areas.append(timepart)
            
            if weakest_areas:
                recommendations.append(f"활동 부족 시간대: {', '.join(weakest_areas)} - 정기적인 학습 습관 구축 필요")
            
            # 균형적인 발전 추천
            timepart_averages = {}
            for timepart, performance in timepart_performance.items():
                avg_overall = performance.get("overall_score", {}).get("average", 0)
                timepart_averages[timepart] = avg_overall
            
            if timepart_averages:
                best_timepart = max(timepart_averages.keys(), key=lambda x: timepart_averages[x])
                worst_timepart = min(timepart_averages.keys(), key=lambda x: timepart_averages[x])
                
                gap = timepart_averages[best_timepart] - timepart_averages[worst_timepart]
                if gap > 20:  # 큰 격차가 있는 경우
                    recommendations.append(f"시간대별 격차 큼: {worst_timepart} 시간대 집중 개선 필요")
            
        except Exception as e:
            self.logger.log_error(e, "개인화 추천사항 생성")
            recommendations.append("개인화 추천사항 생성 중 오류가 발생했습니다.")
        
        return recommendations


def test_optimal_time_analyzer():
    """OptimalTimeAnalyzer 테스트 함수"""
    print("🎯 개인별 최적 학습 시간대 분석 시스템 테스트 시작")
    
    analyzer = OptimalTimeAnalyzer()
    
    # 최적 시간대 분석 테스트
    print("\n🔍 최적 학습 시간대 분석 중...")
    analysis_result = analyzer.identify_optimal_learning_times(days=14)
    
    if analysis_result:
        print("✅ 최적 시간대 분석 성공!")
        print(f"📊 분석 기간: {analysis_result.get('analysis_period', 'N/A')}")
        
        # 종합 추천 출력
        overall_rec = analysis_result.get('overall_recommendation', '')
        if overall_rec:
            print(f"🏆 종합 추천: {overall_rec}")
        
        # 학습 유형별 최적 시간대 출력
        learning_optimal = analysis_result.get('learning_type_optimal', {})
        print(f"\n📚 학습 유형별 최적 시간대:")
        for learning_type, result in learning_optimal.items():
            optimal_timepart = result.get('optimal_timepart', 'N/A')
            score = result.get('weighted_score', 0)
            print(f"  {learning_type}: {optimal_timepart} ({score}점)")
        
        # 개인화 추천사항 개수 출력
        personal_recs = analysis_result.get('personalized_recommendations', [])
        print(f"\n💡 개인화 추천사항: {len(personal_recs)}개")
        
    else:
        print("❌ 최적 시간대 분석 실패")
    
    print("\n✅ 개인별 최적 학습 시간대 분석 시스템 테스트 완료")


if __name__ == "__main__":
    test_optimal_time_analyzer()
