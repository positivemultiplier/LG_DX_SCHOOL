#!/usr/bin/env node
/**
 * GitHub 연동 상태 점검 스크립트
 * GitHub API 연결 및 설정 상태를 확인합니다.
 */

// 환경변수 수동 설정 (dotenv 없이)
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://stgfcervmkbgaarjneyb.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0Z2ZjZXJ2bWtiZ2FhcmpuZXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2OTk1ODUsImV4cCI6MjA2NzI3NTU4NX0.nU7ADQeAk-bm0k5HTCOKMIrxb5HUf3Dp4jnEBhtWXCE'
process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID = 'test_client_id'
process.env.GITHUB_CLIENT_SECRET = 'test_client_secret'
process.env.GITHUB_WEBHOOK_SECRET = 'test_webhook_secret'

console.log('=== GitHub 연동 상태 점검 ===\n')

// 1. 환경변수 확인
console.log('1. 환경변수 확인:')
console.log('NEXT_PUBLIC_GITHUB_CLIENT_ID:', process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'NOT SET')
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? '***SET***' : 'NOT SET')
console.log('GITHUB_WEBHOOK_SECRET:', process.env.GITHUB_WEBHOOK_SECRET ? '***SET***' : 'NOT SET')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***SET***' : 'NOT SET')
console.log()

// 2. GitHub OAuth 설정 상태
console.log('2. GitHub OAuth 설정 상태:')
const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET

if (!githubClientId || githubClientId === 'test_client_id') {
  console.log('❌ GitHub Client ID가 설정되지 않았거나 테스트 값입니다.')
  console.log('   실제 GitHub App의 Client ID를 설정해야 합니다.')
} else {
  console.log('✅ GitHub Client ID가 설정되어 있습니다.')
}

if (!githubClientSecret || githubClientSecret === 'test_client_secret') {
  console.log('❌ GitHub Client Secret이 설정되지 않았거나 테스트 값입니다.')
  console.log('   실제 GitHub App의 Client Secret을 설정해야 합니다.')
} else {
  console.log('✅ GitHub Client Secret이 설정되어 있습니다.')
}
console.log()

// 3. GitHub API 연결 테스트
console.log('3. GitHub API 연결 테스트:')
async function testGitHubAPI() {
  try {
    // Public API 테스트 (인증 불필요)
    const response = await fetch('https://api.github.com/rate_limit')
    if (response.ok) {
      const data = await response.json()
      console.log('✅ GitHub API 연결 성공')
      console.log('   Rate limit (unauthenticated):', data.rate.remaining, '/', data.rate.limit)
    } else {
      console.log('❌ GitHub API 연결 실패:', response.status, response.statusText)
    }
  } catch (error) {
    console.log('❌ GitHub API 연결 오류:', error.message)
  }
}

// 4. Supabase 연결 테스트
console.log('4. Supabase 연결 테스트:')
async function testSupabaseConnection() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Supabase 환경변수가 설정되지 않았습니다.')
      return
    }

    // Supabase REST API 테스트
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (response.ok) {
      console.log('✅ Supabase 연결 성공')
    } else {
      console.log('❌ Supabase 연결 실패:', response.status, response.statusText)
    }
  } catch (error) {
    console.log('❌ Supabase 연결 오류:', error.message)
  }
}

// 5. GitHub 테이블 존재 확인
console.log('5. GitHub 테이블 존재 확인:')
async function checkGitHubTables() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Supabase 환경변수가 설정되지 않았습니다.')
      return
    }

    // 테이블 목록 조회
    const response = await fetch(`${supabaseUrl}/rest/v1/information_schema.tables?table_schema=eq.public&table_name=like.github_*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (response.ok) {
      const tables = await response.json()
      const githubTables = tables.map(t => t.table_name).filter(name => name.startsWith('github_'))
      
      if (githubTables.length > 0) {
        console.log('✅ GitHub 테이블이 존재합니다:')
        githubTables.forEach(table => console.log(`   - ${table}`))
      } else {
        console.log('❌ GitHub 테이블이 존재하지 않습니다.')
        console.log('   create-github-tables.sql 스크립트를 실행해야 합니다.')
      }
    } else {
      console.log('❌ 테이블 확인 실패:', response.status, response.statusText)
    }
  } catch (error) {
    console.log('❌ 테이블 확인 오류:', error.message)
  }
}

// 실행
async function runTests() {
  await testGitHubAPI()
  console.log()
  await testSupabaseConnection()
  console.log()
  await checkGitHubTables()
  console.log()
  
  console.log('=== 해결 방안 ===')
  console.log('1. GitHub App 생성 및 OAuth 설정:')
  console.log('   - https://github.com/settings/apps/new 에서 GitHub App 생성')
  console.log('   - Authorization callback URL: http://localhost:3001/settings/github/callback')
  console.log('   - 권한: Repository (read), User (email)')
  console.log('   - .env.local에 실제 Client ID/Secret 설정')
  console.log()
  console.log('2. 데이터베이스 테이블 생성:')
  console.log('   - scripts/create-github-tables.sql 실행')
  console.log('   - Supabase Dashboard에서 직접 실행 또는 psql 사용')
  console.log()
  console.log('3. API 경로 확인:')
  console.log('   - /api/github/connect')
  console.log('   - /api/github/sync')
  console.log('   - /api/github/activities')
  console.log('   - /api/github/webhook')
}

runTests().catch(console.error)