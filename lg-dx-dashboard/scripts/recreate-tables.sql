-- LG DX Dashboard 테이블 재생성
-- 기존 테이블 구조가 잘못된 경우 완전히 재생성

-- ⚠️ 주의: 이 스크립트는 기존 데이터를 모두 삭제합니다!
-- 프로덕션 환경에서는 사용하지 마세요.

-- 1. 기존 테이블 삭제 (의존성 순서대로)
DROP TABLE IF EXISTS public.daily_statistics CASCADE;
DROP TABLE IF EXISTS public.daily_reflections CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. users 테이블 생성 (auth.users와 연동)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    github_username TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'Asia/Seoul',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. subjects 테이블 생성
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT,
    color_code TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT '📚',
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5) DEFAULT 3,
    estimated_hours INTEGER DEFAULT 0,
    prerequisites TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. daily_reflections 테이블 생성
CREATE TABLE public.daily_reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_part TEXT NOT NULL CHECK (time_part IN ('morning', 'afternoon', 'evening')),
    
    -- 핵심 평가 지표 (1-10점)
    understanding_score INTEGER CHECK (understanding_score BETWEEN 1 AND 10),
    concentration_score INTEGER CHECK (concentration_score BETWEEN 1 AND 10),
    achievement_score INTEGER CHECK (achievement_score BETWEEN 1 AND 10),
    
    -- 컨디션 및 종합 점수
    condition TEXT CHECK (condition IN ('좋음', '보통', '나쁨')),
    total_score INTEGER GENERATED ALWAYS AS (
        COALESCE(understanding_score, 0) + COALESCE(concentration_score, 0) + COALESCE(achievement_score, 0)
    ) STORED,
    
    -- 과목별 세부 정보 (JSON)
    subjects JSONB DEFAULT '{}',
    
    -- 텍스트 필드
    achievements TEXT[] DEFAULT '{}',
    challenges TEXT[] DEFAULT '{}',
    tomorrow_goals TEXT[] DEFAULT '{}',
    notes TEXT,
    
    -- GitHub 활동 데이터
    github_commits INTEGER DEFAULT 0,
    github_issues INTEGER DEFAULT 0,
    github_prs INTEGER DEFAULT 0,
    github_reviews INTEGER DEFAULT 0,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 유니크 제약조건
    UNIQUE(user_id, date, time_part)
);

-- 6. daily_statistics 테이블 생성 (선택사항)
CREATE TABLE public.daily_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reflections_completed INTEGER DEFAULT 0,
    total_reflection_score INTEGER DEFAULT 0,
    average_reflection_score DECIMAL(4,2) DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 7. RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_statistics ENABLE ROW LEVEL SECURITY;

-- 8. RLS 정책 생성
-- users 테이블 정책
CREATE POLICY "Users can manage own data" ON public.users
    FOR ALL USING (auth.uid() = id);

-- subjects 테이블 정책 (모든 인증된 사용자가 읽기 가능)
CREATE POLICY "Authenticated users can read subjects" ON public.subjects
    FOR SELECT USING (auth.role() = 'authenticated');

-- daily_reflections 테이블 정책
CREATE POLICY "Users can manage own reflections" ON public.daily_reflections
    FOR ALL USING (auth.uid() = user_id);

-- daily_statistics 테이블 정책
CREATE POLICY "Users can view own statistics" ON public.daily_statistics
    FOR SELECT USING (auth.uid() = user_id);

-- 9. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_daily_reflections_user_date 
    ON public.daily_reflections(user_id, date);
CREATE INDEX idx_daily_reflections_date_timepart 
    ON public.daily_reflections(date, time_part);
CREATE INDEX idx_daily_statistics_user_date 
    ON public.daily_statistics(user_id, date);

-- 10. 기본 과목 데이터 삽입
INSERT INTO public.subjects (name, category, subcategory, description, color_code, icon, difficulty_level, estimated_hours) VALUES
('Python 기초', 'Foundation', 'Programming', 'Python 프로그래밍 기초 문법과 개념', '#3776AB', '🐍', 2, 40),
('데이터 구조와 알고리즘', 'Foundation', 'Computer Science', '기본적인 자료구조와 알고리즘 학습', '#FF6B6B', '🔧', 3, 60),
('웹 개발 기초', 'Foundation', 'Web Development', 'HTML, CSS, JavaScript 기초', '#F7931E', '🌐', 2, 50),
('DX 방법론', 'DX_Methodology', 'Business', '디지털 전환 방법론과 전략', '#4ECDC4', '🚀', 4, 30),
('빅데이터 분석 이론', '빅데이터분석기사', 'Theory', '빅데이터 분석 기본 이론', '#45B7D1', '📊', 3, 45),
('SQL 데이터베이스', '빅데이터분석기사', 'Database', 'SQL과 데이터베이스 활용', '#96CEB4', '🗄️', 3, 35);

-- 11. 테이블 구조 확인
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'subjects', 'daily_reflections', 'daily_statistics')
ORDER BY table_name, ordinal_position;

-- 완료 메시지
SELECT 'LG DX Dashboard 데이터베이스 테이블 재생성 완료!' as message;