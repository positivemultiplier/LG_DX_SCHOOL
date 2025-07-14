#!/usr/bin/env node
/**
 * API Routes 테스트 스크립트
 * GitHub 관련 API 엔드포인트가 올바르게 작동하는지 확인
 */

const fs = require('fs')
const path = require('path')

console.log('=== API Routes 존재 확인 ===\n')

// GitHub 관련 API 경로들
const githubRoutes = [
  'src/app/api/github/activities/route.ts',
  'src/app/api/github/connect/route.ts', 
  'src/app/api/github/sync/route.ts',
  'src/app/api/github/webhook/route.ts'
]

// GitHub 라이브러리 파일들
const githubLibFiles = [
  'src/lib/github/api.ts',
  'src/lib/github/types.ts',
  'src/lib/github/rate-limiter.ts'
]

// 컴포넌트 파일들
const componentFiles = [
  'src/app/settings/github/page.tsx',
  'src/components/charts/github-heatmap.tsx'
]

// 데이터베이스 스크립트
const dbScripts = [
  'scripts/create-github-tables.sql'
]

console.log('1. GitHub API Routes 확인:')
githubRoutes.forEach(route => {
  const exists = fs.existsSync(path.join(process.cwd(), route))
  console.log(`${exists ? '✅' : '❌'} ${route}`)
})

console.log('\n2. GitHub 라이브러리 파일 확인:')
githubLibFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file))
  console.log(`${exists ? '✅' : '❌'} ${file}`)
})

console.log('\n3. GitHub UI 컴포넌트 확인:')
componentFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file))
  console.log(`${exists ? '✅' : '❌'} ${file}`)
})

console.log('\n4. 데이터베이스 스크립트 확인:')
dbScripts.forEach(script => {
  const exists = fs.existsSync(path.join(process.cwd(), script))
  console.log(`${exists ? '✅' : '❌'} ${script}`)
})

// 주요 파일의 내용 검증
console.log('\n5. 주요 파일 내용 검증:')

// API Route 검증
const connectRoutePath = path.join(process.cwd(), 'src/app/api/github/connect/route.ts')
if (fs.existsSync(connectRoutePath)) {
  const content = fs.readFileSync(connectRoutePath, 'utf8')
  const hasPOST = content.includes('export async function POST')
  const hasGET = content.includes('export async function GET')
  const hasDELETE = content.includes('export async function DELETE')
  
  console.log(`✅ /api/github/connect - POST: ${hasPOST ? '✅' : '❌'}, GET: ${hasGET ? '✅' : '❌'}, DELETE: ${hasDELETE ? '✅' : '❌'}`)
} else {
  console.log('❌ /api/github/connect - 파일 없음')
}

// GitHub API 클라이언트 검증
const apiClientPath = path.join(process.cwd(), 'src/lib/github/api.ts')
if (fs.existsSync(apiClientPath)) {
  const content = fs.readFileSync(apiClientPath, 'utf8')
  const hasGitHubApiClient = content.includes('class GitHubApiClient')
  const hasCreateGitHubClient = content.includes('export function createGitHubClient')
  
  console.log(`✅ GitHub API Client - Class: ${hasGitHubApiClient ? '✅' : '❌'}, Factory: ${hasCreateGitHubClient ? '✅' : '❌'}`)
} else {
  console.log('❌ GitHub API Client - 파일 없음')
}

console.log('\n=== 문제 분석 ===')

// 환경변수 문제
console.log('\n📍 주요 문제점들:')
console.log('1. ❌ GitHub OAuth 설정이 테스트 값으로 되어 있음')
console.log('   - NEXT_PUBLIC_GITHUB_CLIENT_ID=test_client_id')
console.log('   - GITHUB_CLIENT_SECRET=test_client_secret')
console.log('   → 실제 GitHub App을 생성하고 진짜 값으로 변경 필요')

console.log('\n2. ❌ GitHub 테이블이 데이터베이스에 생성되지 않음')
console.log('   - Supabase에 GitHub 관련 테이블이 없음')
console.log('   → scripts/create-github-tables.sql 실행 필요')

console.log('\n3. ❌ 네트워크/API 접근성 문제 가능성')
console.log('   - GitHub API 호출 시 인증 실패')
console.log('   - Supabase RLS 정책으로 인한 접근 제한')

console.log('\n=== 해결 순서 ===')
console.log('1. GitHub App 생성')
console.log('   - https://github.com/settings/apps/new')
console.log('   - App name: LG DX Dashboard')
console.log('   - Callback URL: http://localhost:3001/settings/github/callback')
console.log('   - Permissions: Repository contents (read), User email (read)')

console.log('\n2. 환경변수 업데이트')
console.log('   - .env.local에서 test_client_id → 실제 Client ID')
console.log('   - .env.local에서 test_client_secret → 실제 Client Secret')

console.log('\n3. 데이터베이스 테이블 생성')
console.log('   - Supabase Dashboard SQL Editor에서')
console.log('   - scripts/create-github-tables.sql 내용 실행')

console.log('\n4. API 라우트 테스트')
console.log('   - http://localhost:3001/api/github/connect?user_id=test')
console.log('   - 응답: {"error":"GitHub integration not found or inactive"}')

console.log('\n5. UI 테스트')
console.log('   - http://localhost:3001/settings/github')
console.log('   - GitHub 계정 연결 버튼 클릭')
console.log('   - OAuth 플로우 확인')