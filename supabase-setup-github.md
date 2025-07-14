# Supabase GitHub 테이블 생성 가이드

## 1. Supabase Dashboard 접속
1. https://supabase.com/dashboard 접속
2. LG_DX_SCHOOL 프로젝트 선택
3. 좌측 메뉴에서 "SQL Editor" 클릭

## 2. GitHub 테이블 생성
아래 SQL 스크립트를 SQL Editor에 붙여넣고 실행:

```sql
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_github_integrations_user_id ON github_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_github_activities_user_date ON github_activities(user_id, date);

-- Row Level Security (RLS) 정책
ALTER TABLE github_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_activities ENABLE ROW LEVEL SECURITY;

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
```

## 3. 실행 확인
- "Run" 버튼 클릭
- 성공 메시지 확인
- 좌측 메뉴 "Table Editor"에서 테이블 생성 확인

## 4. 다음 단계
1. GitHub App 생성
2. OAuth 설정 업데이트
3. 연동 테스트