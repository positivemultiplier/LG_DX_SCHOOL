-- GitHub 고급 분석을 위한 데이터베이스 스키마 확장

-- 실시간 GitHub 활동 테이블
CREATE TABLE IF NOT EXISTS github_realtime_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    repository VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    impact_score INTEGER DEFAULT 0,
    quality_indicators JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 실시간 메트릭스 테이블
CREATE TABLE IF NOT EXISTS github_realtime_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    velocity DECIMAL(5,2) DEFAULT 0,
    quality_trend DECIMAL(5,2) DEFAULT 0,
    collaboration_index DECIMAL(5,2) DEFAULT 0,
    innovation_score DECIMAL(5,2) DEFAULT 0,
    consistency_rating DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 개발자 프로필 테이블
CREATE TABLE IF NOT EXISTS developer_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coding_style JSONB,
    productivity_patterns JSONB,
    skill_levels JSONB,
    collaboration_preferences JSONB,
    learning_velocity INTEGER DEFAULT 5,
    career_stage VARCHAR(20) DEFAULT 'mid',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 개인화된 추천 테이블
CREATE TABLE IF NOT EXISTS personalized_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 50,
    impact_score INTEGER DEFAULT 0,
    effort_required INTEGER DEFAULT 0,
    timeline VARCHAR(100),
    action_items JSONB,
    success_metrics JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 예측 모델 결과 테이블
CREATE TABLE IF NOT EXISTS prediction_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL,
    forecast_data JSONB,
    confidence_level DECIMAL(5,2),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- GitHub 사용자 매핑 테이블
CREATE TABLE IF NOT EXISTS user_github_mappings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    github_username VARCHAR(100) NOT NULL,
    github_user_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(github_username)
);

-- GitHub 토큰 저장 테이블 (보안 강화)
CREATE TABLE IF NOT EXISTS user_github_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    token_type VARCHAR(20) DEFAULT 'bearer',
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- 사용자 알림 테이블
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    metadata JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 코드 품질 히스토리 테이블
CREATE TABLE IF NOT EXISTS code_quality_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    average_file_size INTEGER DEFAULT 0,
    code_complexity_score INTEGER DEFAULT 0,
    test_coverage_estimation INTEGER DEFAULT 0,
    documentation_ratio INTEGER DEFAULT 0,
    refactoring_frequency INTEGER DEFAULT 0,
    bug_fix_ratio INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 협업 메트릭스 히스토리 테이블
CREATE TABLE IF NOT EXISTS collaboration_metrics_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    pr_review_participation INTEGER DEFAULT 0,
    mentoring_activity INTEGER DEFAULT 0,
    knowledge_sharing_score INTEGER DEFAULT 0,
    team_contribution_balance INTEGER DEFAULT 0,
    communication_effectiveness INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 스킬 진화 추적 테이블
CREATE TABLE IF NOT EXISTS skill_evolution_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    technology VARCHAR(100) NOT NULL,
    proficiency_level INTEGER DEFAULT 0,
    usage_frequency INTEGER DEFAULT 0,
    last_used_date DATE,
    growth_rate DECIMAL(5,2) DEFAULT 0,
    market_demand INTEGER DEFAULT 0,
    tracked_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, technology, tracked_date)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_github_realtime_activities_user_timestamp 
ON github_realtime_activities(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_github_realtime_activities_type 
ON github_realtime_activities(activity_type);

CREATE INDEX IF NOT EXISTS idx_personalized_recommendations_user_priority 
ON personalized_recommendations(user_id, priority DESC);

CREATE INDEX IF NOT EXISTS idx_prediction_results_user_type 
ON prediction_results(user_id, prediction_type);

CREATE INDEX IF NOT EXISTS idx_code_quality_history_user_date 
ON code_quality_history(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_collaboration_metrics_user_date 
ON collaboration_metrics_history(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_skill_evolution_user_tech_date 
ON skill_evolution_tracking(user_id, technology, tracked_date DESC);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE github_realtime_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_realtime_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_github_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_github_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_quality_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_evolution_tracking ENABLE ROW LEVEL SECURITY;

-- 사용자별 접근 정책 (자신의 데이터만 접근 가능)
CREATE POLICY "Users can view own github_realtime_activities" ON github_realtime_activities
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own github_realtime_activities" ON github_realtime_activities
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own github_realtime_metrics" ON github_realtime_metrics
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own github_realtime_metrics" ON github_realtime_metrics
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own github_realtime_metrics" ON github_realtime_metrics
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own developer_profiles" ON developer_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own developer_profiles" ON developer_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own developer_profiles" ON developer_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own personalized_recommendations" ON personalized_recommendations
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personalized_recommendations" ON personalized_recommendations
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personalized_recommendations" ON personalized_recommendations
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own prediction_results" ON prediction_results
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prediction_results" ON prediction_results
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own user_github_mappings" ON user_github_mappings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_github_mappings" ON user_github_mappings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own user_github_tokens" ON user_github_tokens
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own user_github_tokens" ON user_github_tokens
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_github_tokens" ON user_github_tokens
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own user_notifications" ON user_notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_notifications" ON user_notifications
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_notifications" ON user_notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own code_quality_history" ON code_quality_history
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own code_quality_history" ON code_quality_history
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own collaboration_metrics_history" ON collaboration_metrics_history
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collaboration_metrics_history" ON collaboration_metrics_history
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own skill_evolution_tracking" ON skill_evolution_tracking
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill_evolution_tracking" ON skill_evolution_tracking
FOR INSERT WITH CHECK (auth.uid() = user_id);
