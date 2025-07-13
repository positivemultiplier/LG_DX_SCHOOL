-- LG DX Dashboard - Database Schema Creation
-- 리플렉션 시스템을 위한 기본 테이블 생성

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. 사용자 테이블 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  github_username TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Asia/Seoul',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 일일 리플렉션 메인 테이블
CREATE TABLE IF NOT EXISTS daily_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_part TEXT NOT NULL CHECK (time_part IN ('morning', 'afternoon', 'evening')),
  
  -- 핵심 평가 지표 (1-10점)
  understanding_score INTEGER CHECK (understanding_score BETWEEN 1 AND 10),
  concentration_score INTEGER CHECK (concentration_score BETWEEN 1 AND 10),
  achievement_score INTEGER CHECK (achievement_score BETWEEN 1 AND 10),
  
  -- 컨디션 및 종합 점수
  condition TEXT CHECK (condition IN ('좋음', '보통', '나쁨')),
  total_score INTEGER GENERATED ALWAYS AS (
    (understanding_score + concentration_score + achievement_score)
  ) STORED,
  
  -- 과목별 세부 정보 (JSON)
  subjects JSONB DEFAULT '{}',
  
  -- 텍스트 필드
  achievements TEXT[], -- 오늘의 성취
  challenges TEXT[], -- 어려웠던 점
  tomorrow_goals TEXT[], -- 내일 목표
  notes TEXT, -- 기타 메모
  
  -- GitHub 활동 데이터
  github_commits INTEGER DEFAULT 0,
  github_issues INTEGER DEFAULT 0,
  github_prs INTEGER DEFAULT 0,
  github_reviews INTEGER DEFAULT 0,
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 유니크 제약조건 (사용자별, 날짜별, 시간대별 중복 방지)
  UNIQUE(user_id, date, time_part)
);

-- 3. 과목 마스터 테이블
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Foundation', 'DX_Methodology', '빅데이터분석기사'
  subcategory TEXT,
  description TEXT,
  color_code TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT '📚',
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_hours INTEGER, -- 예상 학습 시간
  prerequisites TEXT[], -- 선수 과목
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 일일 통계 테이블
CREATE TABLE IF NOT EXISTS daily_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- 리플렉션 완성도
  reflections_completed INTEGER DEFAULT 0, -- 완성된 리플렉션 수 (최대 3)
  total_reflection_score INTEGER DEFAULT 0,
  average_reflection_score DECIMAL(4,2) DEFAULT 0,
  
  -- 학습 시간 통계
  total_study_time_minutes INTEGER DEFAULT 0,
  morning_study_time INTEGER DEFAULT 0,
  afternoon_study_time INTEGER DEFAULT 0,
  evening_study_time INTEGER DEFAULT 0,
  
  -- GitHub 활동 요약
  github_activity_score INTEGER DEFAULT 0,
  
  -- 목표 달성도
  daily_goals_completed INTEGER DEFAULT 0,
  daily_goals_total INTEGER DEFAULT 0,
  
  -- 종합 평가
  daily_grade TEXT, -- A+, A, B+, B, C+, C, D, F
  consistency_score DECIMAL(4,2) DEFAULT 0,
  
  -- 메타데이터
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Row Level Security 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_statistics ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
-- 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can manage own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own reflections" ON daily_reflections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own statistics" ON daily_statistics
  FOR SELECT USING (auth.uid() = user_id);

-- 과목 정보는 모든 인증된 사용자가 읽기 가능
CREATE POLICY "Authenticated users can read subjects" ON subjects
  FOR SELECT USING (auth.role() = 'authenticated');

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date ON daily_reflections(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_date_timepart ON daily_reflections(date, time_part);
CREATE INDEX IF NOT EXISTS idx_daily_statistics_user_date ON daily_statistics(user_id, date);

-- 기본 과목 데이터 삽입
INSERT INTO subjects (name, category, subcategory, description, color_code, icon, difficulty_level, estimated_hours) VALUES
('Python 기초', 'Foundation', 'Programming', 'Python 프로그래밍 기초 문법과 개념', '#3776AB', '🐍', 2, 40),
('데이터 구조와 알고리즘', 'Foundation', 'Computer Science', '기본적인 자료구조와 알고리즘 학습', '#FF6B6B', '🔧', 3, 60),
('웹 개발 기초', 'Foundation', 'Web Development', 'HTML, CSS, JavaScript 기초', '#F7931E', '🌐', 2, 50),
('DX 방법론', 'DX_Methodology', 'Business', '디지털 전환 방법론과 전략', '#4ECDC4', '🚀', 4, 30),
('빅데이터 분석 이론', '빅데이터분석기사', 'Theory', '빅데이터 분석 기본 이론', '#45B7D1', '📊', 3, 45),
('SQL 데이터베이스', '빅데이터분석기사', 'Database', 'SQL과 데이터베이스 활용', '#96CEB4', '🗄️', 3, 35)
ON CONFLICT DO NOTHING;

-- 일일 통계 자동 계산 함수
CREATE OR REPLACE FUNCTION calculate_daily_statistics(user_uuid UUID, target_date DATE)
RETURNS VOID AS $$
DECLARE
  reflection_count INTEGER;
  total_score INTEGER;
  avg_score DECIMAL(4,2);
BEGIN
  -- 리플렉션 통계 계산
  SELECT 
    COUNT(*),
    COALESCE(SUM(total_score), 0),
    COALESCE(AVG(total_score), 0)
  INTO reflection_count, total_score, avg_score
  FROM daily_reflections 
  WHERE user_id = user_uuid AND date = target_date;
  
  -- 일일 통계 업데이트 또는 삽입
  INSERT INTO daily_statistics (
    user_id, date, reflections_completed, total_reflection_score,
    average_reflection_score, calculated_at
  ) VALUES (
    user_uuid, target_date, reflection_count, total_score,
    avg_score, NOW()
  )
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    reflections_completed = EXCLUDED.reflections_completed,
    total_reflection_score = EXCLUDED.total_reflection_score,
    average_reflection_score = EXCLUDED.average_reflection_score,
    calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 리플렉션 입력/수정 시 통계 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION trigger_update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 새로운 데이터의 통계 계산
  PERFORM calculate_daily_statistics(NEW.user_id, NEW.date);
  
  -- 기존 데이터가 수정된 경우, 이전 날짜 통계도 업데이트
  IF TG_OP = 'UPDATE' AND OLD.date != NEW.date THEN
    PERFORM calculate_daily_statistics(OLD.user_id, OLD.date);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS reflection_stats_trigger
  AFTER INSERT OR UPDATE ON daily_reflections
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_daily_stats();