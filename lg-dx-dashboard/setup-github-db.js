#!/usr/bin/env node
/**
 * GitHub 테이블 자동 생성 스크립트
 * Supabase 데이터베이스에 GitHub 관련 테이블들을 생성합니다.
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const createGitHubTables = async () => {
  console.log('🚀 GitHub 테이블 생성 시작...\n')

  try {
    // 1. github_integrations 테이블
    console.log('📊 github_integrations 테이블 생성...')
    const { error: integrationsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    if (integrationsError) {
      console.log('⚠️ github_integrations 테이블:', integrationsError.message)
    } else {
      console.log('✅ github_integrations 테이블 생성 완료')
    }

    // 2. github_activities 테이블
    console.log('📊 github_activities 테이블 생성...')
    const { error: activitiesError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    if (activitiesError) {
      console.log('⚠️ github_activities 테이블:', activitiesError.message)
    } else {
      console.log('✅ github_activities 테이블 생성 완료')
    }

    // 3. github_sync_status 테이블
    console.log('📊 github_sync_status 테이블 생성...')
    const { error: syncError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    if (syncError) {
      console.log('⚠️ github_sync_status 테이블:', syncError.message)
    } else {
      console.log('✅ github_sync_status 테이블 생성 완료')
    }

    console.log('\n🎉 GitHub 테이블 생성 완료!')
    console.log('\n다음 단계:')
    console.log('1. GitHub Client Secret을 .env.local에 설정')
    console.log('2. 대시보드 재시작: npm run dev')
    console.log('3. /settings/github 페이지에서 GitHub 연동')

  } catch (error) {
    console.error('❌ 테이블 생성 실패:', error.message)
  }
}

// 실행
createGitHubTables()
