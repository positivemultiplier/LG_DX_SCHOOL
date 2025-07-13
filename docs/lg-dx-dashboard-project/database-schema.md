# Database Schema & Data Model

## 🗄 Supabase PostgreSQL 스키마

### 1. 사용자 관리 (Users)

```sql
-- 사용자 테이블
CREATE TABLE users (
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

-- 사용자 프로필 설정
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'ko' CHECK (language IN ('ko', 'en')),
  notifications JSONB DEFAULT '{
    "reflection_reminders": true,
    "weekly_reports": true,
    "goal_deadlines": true,
    "github_activity": false
  }',
  dashboard_layout JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

### 2. 일일 리플렉션 시스템

```sql
-- 일일 리플렉션 메인 테이블
CREATE TABLE daily_reflections (
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

-- 리플렉션 첨부파일 테이블
CREATE TABLE reflection_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reflection_id UUID REFERENCES daily_reflections(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. 과목 및 학습 진도 관리

```sql
-- 과목 마스터 테이블
CREATE TABLE subjects (
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

-- 사용자별 과목 학습 진도
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- 진도 정보
  progress_percentage DECIMAL(5,2) CHECK (progress_percentage BETWEEN 0 AND 100),
  time_spent_minutes INTEGER DEFAULT 0,
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 10),
  
  -- 세부 내용
  topics_covered TEXT[],
  exercises_completed INTEGER DEFAULT 0,
  exercises_total INTEGER DEFAULT 0,
  notes TEXT,
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, subject_id, date)
);

-- 과목별 세부 토픽
CREATE TABLE subject_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER,
  estimated_hours DECIMAL(4,2),
  resources JSONB DEFAULT '[]', -- 학습 자료 링크
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. 목표 설정 및 추적

```sql
-- 목표 테이블
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('daily', 'weekly', 'monthly', 'project', 'skill')),
  
  -- 목표 상태 및 우선순위
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  
  -- 날짜 관리
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  completed_date DATE,
  
  -- 진행률 추적
  progress_percentage DECIMAL(5,2) DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  
  -- 측정 가능한 지표
  target_value DECIMAL(10,2), -- 목표값 (점수, 시간 등)
  current_value DECIMAL(10,2) DEFAULT 0, -- 현재값
  unit TEXT, -- 단위 (점, 시간, 개 등)
  
  -- 관련 데이터
  related_subjects UUID[], -- 관련 과목 ID 배열
  milestones JSONB DEFAULT '[]', -- 중간 목표
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 목표 달성 로그
CREATE TABLE goal_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  achievement_date DATE NOT NULL,
  value_achieved DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. GitHub 활동 추적

```sql
-- GitHub 활동 상세 로그
CREATE TABLE github_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  github_username TEXT NOT NULL,
  activity_date DATE NOT NULL,
  
  -- 활동 유형별 카운트
  commits_count INTEGER DEFAULT 0,
  issues_opened INTEGER DEFAULT 0,
  issues_closed INTEGER DEFAULT 0,
  prs_opened INTEGER DEFAULT 0,
  prs_merged INTEGER DEFAULT 0,
  reviews_given INTEGER DEFAULT 0,
  
  -- 활동 세부 데이터 (JSON)
  commits_detail JSONB DEFAULT '[]',
  issues_detail JSONB DEFAULT '[]',
  prs_detail JSONB DEFAULT '[]',
  
  -- 통계 데이터
  total_additions INTEGER DEFAULT 0,
  total_deletions INTEGER DEFAULT 0,
  repositories TEXT[],
  
  -- 메타데이터
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, activity_date)
);

-- GitHub 리포지토리 정보
CREATE TABLE github_repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  repo_name TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  description TEXT,
  language TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  is_fork BOOLEAN DEFAULT FALSE,
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  last_commit_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, repo_name)
);
```

### 6. 분석 및 통계

```sql
-- 일별 종합 통계
CREATE TABLE daily_statistics (
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

-- 주간/월간 요약 통계
CREATE TABLE period_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period_type TEXT CHECK (period_type IN ('week', 'month', 'quarter')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- 기간별 요약 통계
  total_reflections INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  average_daily_score DECIMAL(4,2) DEFAULT 0,
  best_timepart TEXT, -- 가장 성과가 좋은 시간대
  
  -- 학습 패턴 분석
  most_productive_day TEXT, -- 가장 생산적인 요일
  study_consistency DECIMAL(4,2) DEFAULT 0,
  improvement_trend TEXT CHECK (improvement_trend IN ('improving', 'stable', 'declining')),
  
  -- 목표 달성 현황
  goals_achieved INTEGER DEFAULT 0,
  goals_set INTEGER DEFAULT 0,
  
  -- GitHub 활동 요약
  total_commits INTEGER DEFAULT 0,
  repositories_worked INTEGER DEFAULT 0,
  
  -- 메타데이터
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, period_type, start_date)
);
```

## 🔧 Database Functions & Triggers

### 1. 자동 계산 함수

```sql
-- 일일 통계 자동 계산 함수
CREATE OR REPLACE FUNCTION calculate_daily_statistics(user_uuid UUID, target_date DATE)
RETURNS VOID AS $$
DECLARE
  reflection_count INTEGER;
  total_score INTEGER;
  avg_score DECIMAL(4,2);
  study_minutes INTEGER;
  github_score INTEGER;
BEGIN
  -- 리플렉션 통계 계산
  SELECT 
    COUNT(*),
    COALESCE(SUM(total_score), 0),
    COALESCE(AVG(total_score), 0)
  INTO reflection_count, total_score, avg_score
  FROM daily_reflections 
  WHERE user_id = user_uuid AND date = target_date;
  
  -- GitHub 활동 점수 계산
  SELECT COALESCE(commits_count * 2 + prs_opened * 5 + issues_closed * 3, 0)
  INTO github_score
  FROM github_activities 
  WHERE user_id = user_uuid AND activity_date = target_date;
  
  -- 일일 통계 업데이트 또는 삽입
  INSERT INTO daily_statistics (
    user_id, date, reflections_completed, total_reflection_score,
    average_reflection_score, github_activity_score, calculated_at
  ) VALUES (
    user_uuid, target_date, reflection_count, total_score,
    avg_score, github_score, NOW()
  )
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    reflections_completed = EXCLUDED.reflections_completed,
    total_reflection_score = EXCLUDED.total_reflection_score,
    average_reflection_score = EXCLUDED.average_reflection_score,
    github_activity_score = EXCLUDED.github_activity_score,
    calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

### 2. 트리거 설정

```sql
-- 리플렉션 입력/수정 시 통계 자동 업데이트
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

CREATE TRIGGER reflection_stats_trigger
  AFTER INSERT OR UPDATE ON daily_reflections
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_daily_stats();
```

## 🔒 Row Level Security (RLS) 정책

### 1. 사용자 데이터 보호

```sql
-- 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can manage own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own reflections" ON daily_reflections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress" ON learning_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own statistics" ON daily_statistics
  FOR SELECT USING (auth.uid() = user_id);
```

### 2. 공개 데이터 정책

```sql
-- 과목 정보는 모든 인증된 사용자가 읽기 가능
CREATE POLICY "Authenticated users can read subjects" ON subjects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read subject topics" ON subject_topics
  FOR SELECT USING (auth.role() = 'authenticated');
```

## 📊 Performance Optimization

### 1. 인덱스 생성

```sql
-- 자주 사용되는 쿼리 최적화 인덱스
CREATE INDEX idx_daily_reflections_user_date ON daily_reflections(user_id, date);
CREATE INDEX idx_daily_reflections_date_timepart ON daily_reflections(date, time_part);
CREATE INDEX idx_learning_progress_user_subject ON learning_progress(user_id, subject_id);
CREATE INDEX idx_github_activities_user_date ON github_activities(user_id, activity_date);
CREATE INDEX idx_goals_user_status ON goals(user_id, status);
CREATE INDEX idx_daily_statistics_user_date ON daily_statistics(user_id, date);

-- 복합 인덱스 (범위 조회 최적화)
CREATE INDEX idx_reflections_user_period ON daily_reflections(user_id, date DESC);
CREATE INDEX idx_progress_user_date ON learning_progress(user_id, date DESC);
```

### 2. 파티셔닝 (선택사항)

```sql
-- 대용량 데이터 처리를 위한 날짜별 파티셔닝
CREATE TABLE daily_reflections_2025 PARTITION OF daily_reflections
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE github_activities_2025 PARTITION OF github_activities
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

## 🔄 Data Migration Scripts

### 1. 기존 Python 데이터 마이그레이션

```sql
-- 마이그레이션 임시 테이블
CREATE TEMP TABLE migration_reflections (
  date DATE,
  time_part TEXT,
  understanding_score INTEGER,
  concentration_score INTEGER,
  achievement_score INTEGER,
  condition TEXT,
  github_commits INTEGER,
  notes TEXT
);
```

### 2. 데이터 검증 함수

```sql
-- 데이터 무결성 검증
CREATE OR REPLACE FUNCTION validate_reflection_data()
RETURNS TABLE(user_id UUID, issue_description TEXT) AS $$
BEGIN
  -- 중복 데이터 체크
  RETURN QUERY
  SELECT dr.user_id, 'Duplicate reflection: ' || dr.date || ' ' || dr.time_part
  FROM daily_reflections dr
  GROUP BY dr.user_id, dr.date, dr.time_part
  HAVING COUNT(*) > 1;
  
  -- 점수 범위 체크
  RETURN QUERY
  SELECT dr.user_id, 'Invalid score range: ' || dr.id::TEXT
  FROM daily_reflections dr
  WHERE dr.understanding_score NOT BETWEEN 1 AND 10
     OR dr.concentration_score NOT BETWEEN 1 AND 10
     OR dr.achievement_score NOT BETWEEN 1 AND 10;
END;
$$ LANGUAGE plpgsql;
```

---

**🔄 스키마 버전**: v1.0.0  
**📅 최종 업데이트**: 2025-07-12  
**🛠 마이그레이션 도구**: Supabase CLI + 커스텀 스크립트  