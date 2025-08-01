-- GitHub 연동 관련 테이블 생성 (수동 실행용)
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. github_integrations 테이블
CREATE TABLE IF NOT EXISTS github_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
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

-- 2. github_activities 테이블  
CREATE TABLE IF NOT EXISTS github_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
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

-- 3. github_sync_status 테이블
CREATE TABLE IF NOT EXISTS github_sync_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    sync_status TEXT NOT NULL DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'completed', 'failed')),
    sync_progress INTEGER NOT NULL DEFAULT 0 CHECK (sync_progress >= 0 AND sync_progress <= 100),
    last_sync_at TIMESTAMPTZ,
    next_sync_at TIMESTAMPTZ,
    error_message TEXT,
    repositories_synced INTEGER NOT NULL DEFAULT 0,
    total_repositories INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_github_activities_user_date ON github_activities(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_github_integrations_user ON github_integrations(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_github_sync_status_user ON github_sync_status(user_id);

-- 테이블 생성 확인
SELECT 'github_integrations' as table_name, COUNT(*) as row_count FROM github_integrations
UNION ALL
SELECT 'github_activities' as table_name, COUNT(*) as row_count FROM github_activities  
UNION ALL
SELECT 'github_sync_status' as table_name, COUNT(*) as row_count FROM github_sync_status;
