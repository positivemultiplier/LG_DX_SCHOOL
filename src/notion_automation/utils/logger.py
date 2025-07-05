"""
3-Part Daily Reflection Dashboard 로깅 시스템
시간대별 로깅 및 디버그 지원
"""

import logging
import os
from datetime import datetime
from typing import Optional, Dict, Any
import json

class ThreePartLogger:
    """3-Part 시스템 전용 로거"""
    
    def __init__(self, name: str = "3part_dashboard", log_level: str = "INFO"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, log_level.upper()))
        
        # 중복 핸들러 방지
        if not self.logger.handlers:
            self._setup_handlers()
    
    def _setup_handlers(self):
        """로그 핸들러 설정"""
        # 파일 핸들러
        log_dir = "logs"
        os.makedirs(log_dir, exist_ok=True)
        
        file_handler = logging.FileHandler(
            os.path.join(log_dir, "3part_dashboard.log"),
            encoding='utf-8'
        )
        file_handler.setLevel(logging.DEBUG)
        
        # 콘솔 핸들러  
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        # 포맷터
        formatter = logging.Formatter(
            '%(asctime)s | %(levelname)s | %(name)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)
    
    def log_timepart_action(self, time_part: str, action: str, details: Optional[Dict[str, Any]] = None):
        """시간대별 액션 로깅"""
        message = f"[{time_part}] {action}"
        if details:
            message += f" | Details: {json.dumps(details, ensure_ascii=False)}"
        self.logger.info(message)
    
    def log_github_activity(self, time_part: str, commits: int, activities: Dict[str, Any]):
        """GitHub 활동 로깅"""
        self.logger.info(
            f"[{time_part}] GitHub 활동: {commits}개 커밋 | "
            f"활동: {json.dumps(activities, ensure_ascii=False)}"
        )
    
    def log_notion_operation(self, operation: str, result: str, time_part: Optional[str] = None):
        """Notion 작업 로깅"""
        prefix = f"[{time_part}] " if time_part else ""
        self.logger.info(f"{prefix}Notion {operation}: {result}")
    
    def log_error(self, error: Exception, context: str = "", time_part: Optional[str] = None):
        """에러 로깅"""
        prefix = f"[{time_part}] " if time_part else ""
        self.logger.error(
            f"{prefix}ERROR in {context}: {str(error)}",
            exc_info=True
        )
    
    def log_performance(self, operation: str, duration_seconds: float, time_part: Optional[str] = None):
        """성능 로깅"""
        prefix = f"[{time_part}] " if time_part else ""
        self.logger.info(f"{prefix}Performance | {operation}: {duration_seconds:.2f}초")
    
    def debug(self, message: str, time_part: Optional[str] = None):
        """디버그 로깅"""
        prefix = f"[{time_part}] " if time_part else ""
        self.logger.debug(f"{prefix}{message}")
    
    def info(self, message: str, time_part: Optional[str] = None):
        """정보 로깅"""
        prefix = f"[{time_part}] " if time_part else ""
        self.logger.info(f"{prefix}{message}")
    
    def warning(self, message: str, time_part: Optional[str] = None):
        """경고 로깅"""
        prefix = f"[{time_part}] " if time_part else ""
        self.logger.warning(f"{prefix}{message}")
    
    def error(self, message: str, time_part: Optional[str] = None):
        """에러 로깅"""
        prefix = f"[{time_part}] " if time_part else ""
        self.logger.error(f"{prefix}{message}")

# 전역 로거 인스턴스
_logger = None

def get_logger(name: str = "3part_dashboard") -> ThreePartLogger:
    """글로벌 로거 인스턴스 반환"""
    global _logger
    if _logger is None:
        _logger = ThreePartLogger(name)
    return _logger

def log_phase_start(phase: str):
    """Phase 시작 로깅"""
    logger = get_logger()
    logger.info(f"=== Phase {phase} 시작 ===")

def log_phase_complete(phase: str, duration_minutes: float):
    """Phase 완료 로깅"""
    logger = get_logger()
    logger.info(f"=== Phase {phase} 완료 ({duration_minutes:.1f}분 소요) ===")

def log_task_start(task: str, time_part: str = None):
    """Task 시작 로깅"""
    logger = get_logger()
    logger.log_timepart_action(time_part or "SYSTEM", f"Task 시작: {task}")

def log_task_complete(task: str, time_part: str = None):
    """Task 완료 로깅"""
    logger = get_logger()
    logger.log_timepart_action(time_part or "SYSTEM", f"Task 완료: {task}")
