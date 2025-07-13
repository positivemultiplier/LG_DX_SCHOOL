-- GitHub 연동 관련 테이블 생성 스크립트
-- Phase 3.2: GitHub API Integration

-- GitHub 연동 정보 테이블
CREATE TABLE IF NOT EXISTS github_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    github_username TEXT NOT NULL,
    github_user_id BIGINT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    scope TEXT NOT NULL DEFAULT '',
    connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sync_enabled BOOLEAN NOT NULL DEFAULT true,
    webhook_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id),
    UNIQUE(github_user_id)
);

-- GitHub 활동 일별 집계 테이블
CREATE TABLE IF NOT EXISTS github_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    commits_count INTEGER NOT NULL DEFAULT 0,
    repositories_count INTEGER NOT NULL DEFAULT 0,
    repositories TEXT[] NOT NULL DEFAULT '{}',
    languages TEXT[] NOT NULL DEFAULT '{}',
    additions INTEGER NOT NULL DEFAULT 0,
    deletions INTEGER NOT NULL DEFAULT 0,
    files_changed INTEGER NOT NULL DEFAULT 0,
    activity_level INTEGER NOT NULL DEFAULT 0 CHECK (activity_level >= 0 AND activity_level <= 4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- GitHub 활동 상세 기록 테이블
CREATE TABLE IF NOT EXISTS github_activity_records (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    repository_name TEXT NOT NULL,
    commit_sha TEXT,
    commit_message TEXT,
    commits_count INTEGER NOT NULL DEFAULT 0,
    additions INTEGER NOT NULL DEFAULT 0,
    deletions INTEGER NOT NULL DEFAULT 0,
    files_changed INTEGER NOT NULL DEFAULT 0,
    languages TEXT[] NOT NULL DEFAULT '{}',
    event_type TEXT NOT NULL CHECK (event_type IN ('push', 'pull_request', 'issues', 'create', 'delete')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GitHub 동기화 상태 테이블
CREATE TABLE IF NOT EXISTS github_sync_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sync_status TEXT NOT NULL DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error', 'completed')),
    sync_progress INTEGER NOT NULL DEFAULT 0 CHECK (sync_progress >= 0 AND sync_progress <= 100),
    last_sync_at TIMESTAMPTZ,
    next_sync_at TIMESTAMPTZ,
    total_repositories INTEGER NOT NULL DEFAULT 0,
    synced_repositories INTEGER NOT NULL DEFAULT 0,
    total_commits INTEGER NOT NULL DEFAULT 0,
    synced_commits INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- GitHub 설정 테이블
CREATE TABLE IF NOT EXISTS github_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    auto_sync BOOLEAN NOT NULL DEFAULT true,
    sync_interval INTEGER NOT NULL DEFAULT 360, -- 분 단위
    include_private_repos BOOLEAN NOT NULL DEFAULT false,
    track_languages TEXT[] NOT NULL DEFAULT '{"JavaScript", "TypeScript", "Python", "Java", "Go"}',
    exclude_repositories TEXT[] NOT NULL DEFAULT '{}',
    webhook_enabled BOOLEAN NOT NULL DEFAULT false,
    notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- GitHub 웹훅 로그 테이블
CREATE TABLE IF NOT EXISTS github_webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delivery_id TEXT,
    event_type TEXT NOT NULL,
    repository_name TEXT,
    sender TEXT,
    success BOOLEAN NOT NULL DEFAULT false,
    error_message TEXT,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_github_integrations_user_id ON github_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_github_integrations_github_user_id ON github_integrations(github_user_id);
CREATE INDEX IF NOT EXISTS idx_github_integrations_active ON github_integrations(is_active);

CREATE INDEX IF NOT EXISTS idx_github_activities_user_date ON github_activities(user_id, date);
CREATE INDEX IF NOT EXISTS idx_github_activities_date ON github_activities(date);
CREATE INDEX IF NOT EXISTS idx_github_activities_activity_level ON github_activities(activity_level);

CREATE INDEX IF NOT EXISTS idx_github_activity_records_user_date ON github_activity_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_github_activity_records_repository ON github_activity_records(repository_name);
CREATE INDEX IF NOT EXISTS idx_github_activity_records_event_type ON github_activity_records(event_type);

CREATE INDEX IF NOT EXISTS idx_github_sync_status_user_id ON github_sync_status(user_id);
CREATE INDEX IF NOT EXISTS idx_github_sync_status_status ON github_sync_status(sync_status);

CREATE INDEX IF NOT EXISTS idx_github_webhook_logs_delivery_id ON github_webhook_logs(delivery_id);
CREATE INDEX IF NOT EXISTS idx_github_webhook_logs_event_type ON github_webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_github_webhook_logs_processed_at ON github_webhook_logs(processed_at);

-- Row Level Security (RLS) 정책
ALTER TABLE github_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_activity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_settings ENABLE ROW LEVEL SECURITY;

-- github_integrations 정책
CREATE POLICY "사용자는 자신의 GitHub 연동 정보만 조회 가능" ON github_integrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 GitHub 연동 정보만 수정 가능" ON github_integrations
    FOR ALL USING (auth.uid() = user_id);

-- github_activities 정책
CREATE POLICY "사용자는 자신의 GitHub 활동 데이터만 조회 가능" ON github_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 GitHub 활동 데이터만 수정 가능" ON github_activities
    FOR ALL USING (auth.uid() = user_id);

-- github_activity_records 정책
CREATE POLICY "사용자는 자신의 GitHub 활동 기록만 조회 가능" ON github_activity_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 GitHub 활동 기록만 수정 가능" ON github_activity_records
    FOR ALL USING (auth.uid() = user_id);

-- github_sync_status 정책
CREATE POLICY "사용자는 자신의 GitHub 동기화 상태만 조회 가능" ON github_sync_status
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 GitHub 동기화 상태만 수정 가능" ON github_sync_status
    FOR ALL USING (auth.uid() = user_id);

-- github_settings 정책
CREATE POLICY "사용자는 자신의 GitHub 설정만 조회 가능" ON github_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 GitHub 설정만 수정 가능" ON github_settings
    FOR ALL USING (auth.uid() = user_id);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_github_integrations_updated_at
    BEFORE UPDATE ON github_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_activities_updated_at
    BEFORE UPDATE ON github_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_sync_status_updated_at
    BEFORE UPDATE ON github_sync_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_settings_updated_at
    BEFORE UPDATE ON github_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 뷰 생성: GitHub 활동 통계
CREATE OR REPLACE VIEW github_activity_stats AS
SELECT 
    user_id,
    COUNT(*) as total_days,
    SUM(commits_count) as total_commits,
    ROUND(AVG(commits_count), 2) as avg_commits_per_day,
    MAX(commits_count) as max_commits_per_day,
    COUNT(CASE WHEN commits_count > 0 THEN 1 END) as active_days,
    ROUND(
        COUNT(CASE WHEN commits_count > 0 THEN 1 END)::float / COUNT(*)::float * 100, 
        2
    ) as activity_rate,
    array_agg(DISTINCT repository) as all_repositories,
    array_agg(DISTINCT language) as all_languages
FROM github_activities,
     unnest(repositories) as repository,
     unnest(languages) as language
GROUP BY user_id;

-- 뷰 생성: 최근 GitHub 활동
CREATE OR REPLACE VIEW recent_github_activities AS
SELECT 
    ga.*,
    gi.github_username
FROM github_activities ga
JOIN github_integrations gi ON ga.user_id = gi.user_id
WHERE gi.is_active = true
  AND ga.date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY ga.date DESC;

-- 함수: GitHub 활동 레벨 계산
CREATE OR REPLACE FUNCTION calculate_github_activity_level(commits_count INTEGER)
RETURNS INTEGER AS $$
BEGIN
    CASE 
        WHEN commits_count = 0 THEN RETURN 0;
        WHEN commits_count <= 2 THEN RETURN 1;
        WHEN commits_count <= 5 THEN RETURN 2;
        WHEN commits_count <= 10 THEN RETURN 3;
        ELSE RETURN 4;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 함수: GitHub 데이터 정리 (30일 이상 된 상세 기록 삭제)
CREATE OR REPLACE FUNCTION cleanup_old_github_records()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM github_activity_records 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 정기 정리 작업을 위한 예약 함수 (수동 실행)
COMMENT ON FUNCTION cleanup_old_github_records() IS 
'GitHub 활동 상세 기록을 정리합니다. 30일 이상 된 기록을 삭제하여 저장공간을 절약합니다.';

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE 'GitHub 연동 테이블 생성이 완료되었습니다.';
    RAISE NOTICE '생성된 테이블: github_integrations, github_activities, github_activity_records, github_sync_status, github_settings, github_webhook_logs';
    RAISE NOTICE '생성된 뷰: github_activity_stats, recent_github_activities';
    RAISE NOTICE '생성된 함수: calculate_github_activity_level, cleanup_old_github_records';
    RAISE NOTICE 'RLS 정책이 활성화되었습니다.';
END $$;