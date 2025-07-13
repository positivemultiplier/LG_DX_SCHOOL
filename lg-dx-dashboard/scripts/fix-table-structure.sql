-- LG DX Dashboard 테이블 구조 수정
-- 기존 테이블이 있지만 구조가 다른 경우 수정

-- 1. 기존 테이블 구조 확인 및 백업
-- 먼저 기존 데이터가 있는지 확인
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('daily_reflections', 'users', 'subjects')
ORDER BY table_name, ordinal_position;

-- 2. daily_reflections 테이블 수정
-- 기존 테이블이 있다면 필요한 컬럼 추가
DO $$
BEGIN
    -- time_part 컬럼 추가 (없는 경우)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'time_part'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN time_part TEXT CHECK (time_part IN ('morning', 'afternoon', 'evening'));
        
        -- 기존 데이터가 있다면 기본값 설정
        UPDATE public.daily_reflections 
        SET time_part = 'morning' 
        WHERE time_part IS NULL;
        
        -- NOT NULL 제약조건 추가
        ALTER TABLE public.daily_reflections 
        ALTER COLUMN time_part SET NOT NULL;
    END IF;

    -- user_id 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- date 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'date'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;

    -- 점수 컬럼들 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'understanding_score'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN understanding_score INTEGER CHECK (understanding_score BETWEEN 1 AND 10);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'concentration_score'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN concentration_score INTEGER CHECK (concentration_score BETWEEN 1 AND 10);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'achievement_score'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN achievement_score INTEGER CHECK (achievement_score BETWEEN 1 AND 10);
    END IF;

    -- condition 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'condition'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN condition TEXT CHECK (condition IN ('좋음', '보통', '나쁨'));
    END IF;

    -- 배열 컬럼들 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'achievements'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN achievements TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'challenges'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN challenges TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'tomorrow_goals'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN tomorrow_goals TEXT[] DEFAULT '{}';
    END IF;

    -- 기타 컬럼들
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN notes TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'subjects'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN subjects JSONB DEFAULT '{}';
    END IF;

    -- GitHub 활동 컬럼들
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'github_commits'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN github_commits INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'github_issues'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN github_issues INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'github_prs'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN github_prs INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'github_reviews'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN github_reviews INTEGER DEFAULT 0;
    END IF;

    -- 타임스탬프 컬럼들
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

END $$;

-- 3. total_score 계산 컬럼 추가 (기존 컬럼이 있다면 먼저 삭제)
DO $$
BEGIN
    -- 기존 total_score 컬럼이 있다면 삭제
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_reflections' 
        AND column_name = 'total_score'
    ) THEN
        ALTER TABLE public.daily_reflections DROP COLUMN total_score;
    END IF;
    
    -- 새로운 계산 컬럼 추가
    ALTER TABLE public.daily_reflections 
    ADD COLUMN total_score INTEGER GENERATED ALWAYS AS (
        COALESCE(understanding_score, 0) + COALESCE(concentration_score, 0) + COALESCE(achievement_score, 0)
    ) STORED;
END $$;

-- 4. 유니크 제약조건 추가 (기존에 없다면)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'daily_reflections' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%user_date_timepart%'
    ) THEN
        ALTER TABLE public.daily_reflections 
        ADD CONSTRAINT unique_user_date_timepart UNIQUE(user_id, date, time_part);
    END IF;
END $$;

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date 
    ON public.daily_reflections(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_date_timepart 
    ON public.daily_reflections(date, time_part);

-- 6. RLS 활성화 및 정책 설정
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Users can manage own reflections" ON public.daily_reflections;
CREATE POLICY "Users can manage own reflections" ON public.daily_reflections
    FOR ALL USING (auth.uid() = user_id);

-- 7. 수정된 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'daily_reflections' 
ORDER BY ordinal_position;

-- 완료 메시지
SELECT 'daily_reflections 테이블 구조 수정 완료!' as message;