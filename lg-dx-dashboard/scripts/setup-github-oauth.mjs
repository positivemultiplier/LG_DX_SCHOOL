#!/usr/bin/env node

/**
 * GitHub OAuth App 설정 자동화 스크립트
 * 이 스크립트는 GitHub API를 사용하여 OAuth App을 생성하고 설정합니다.
 */

import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';
import crypto from 'crypto';

// 환경변수 로드
dotenv.config({ path: '.env.local' });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const APP_NAME = 'LG DX Dashboard';
const HOMEPAGE_URL = 'http://localhost:3001';
const CALLBACK_URL = 'http://localhost:3001/api/github/connect/callback';

if (!GITHUB_TOKEN) {
  console.error('❌ GitHub 토큰이 설정되지 않았습니다.');
  console.log('📝 .env.local 파일에 GITHUB_TOKEN을 추가해주세요.');
  console.log('🔗 토큰 생성: https://github.com/settings/tokens');
  process.exit(1);
}

console.log('🚀 GitHub OAuth 설정을 시작합니다...\n');

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

/**
 * GitHub API 연결 테스트
 */
async function testGitHubConnection() {
  try {
    console.log('🔍 GitHub API 연결을 확인하는 중...');
    
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    console.log(`✅ GitHub API 연결 성공! 사용자: ${user.login}`);
    console.log(`📊 사용자 정보:`);
    console.log(`   - 이름: ${user.name || 'N/A'}`);
    console.log(`   - 이메일: ${user.email || 'N/A'}`);
    console.log(`   - 공개 저장소: ${user.public_repos}`);
    console.log(`   - 팔로워: ${user.followers}`);
    
    return true;
  } catch (error) {
    console.error('❌ GitHub API 연결 실패:', error.message);
    
    if (error.status === 401) {
      console.log('🔑 토큰이 유효하지 않습니다. 새 토큰을 생성해주세요.');
      console.log('🔗 https://github.com/settings/tokens');
    } else if (error.status === 403) {
      console.log('🚫 API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    return false;
  }
}

/**
 * 웹훅 시크릿 생성
 */
function generateWebhookSecret() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 설정 진단
 */
async function diagnoseSetup() {
  console.log('\n🔍 현재 설정을 진단합니다...\n');
  
  const diagnostics = {
    github_token: !!GITHUB_TOKEN,
    client_id: !!process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
    client_secret: !!process.env.GITHUB_CLIENT_SECRET,
    webhook_secret: !!process.env.GITHUB_WEBHOOK_SECRET,
  };
  
  console.log('📋 환경변수 설정 상태:');
  console.log(`   GITHUB_TOKEN: ${diagnostics.github_token ? '✅' : '❌'}`);
  console.log(`   GITHUB_CLIENT_ID: ${diagnostics.client_id ? '✅' : '❌'}`);
  console.log(`   GITHUB_CLIENT_SECRET: ${diagnostics.client_secret ? '✅' : '❌'}`);
  console.log(`   GITHUB_WEBHOOK_SECRET: ${diagnostics.webhook_secret ? '✅' : '❌'}`);
  
  if (diagnostics.client_id && process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID !== 'test_client_id') {
    console.log(`\n✅ OAuth 설정이 완료된 것 같습니다!`);
    console.log(`🔗 Client ID: ${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`);
  } else {
    console.log(`\n⚠️  OAuth App을 수동으로 생성해야 합니다:`);
    console.log(`   1. https://github.com/settings/applications/new 방문`);
    console.log(`   2. Application name: ${APP_NAME}`);
    console.log(`   3. Homepage URL: ${HOMEPAGE_URL}`);
    console.log(`   4. Callback URL: ${CALLBACK_URL}`);
    console.log(`   5. 생성된 Client ID/Secret을 .env.local에 추가`);
  }
  
  return diagnostics;
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    // GitHub API 연결 테스트
    const connectionSuccess = await testGitHubConnection();
    
    if (!connectionSuccess) {
      process.exit(1);
    }
    
    // 웹훅 시크릿 생성 (표시용)
    const webhookSecret = generateWebhookSecret();
    console.log(`\n🔐 새 웹훅 시크릿 생성: ${webhookSecret.substring(0, 8)}...`);
    console.log(`📋 전체 시크릿: ${webhookSecret}`);
    
    // 설정 진단
    await diagnoseSetup();
    
    console.log('\n✨ GitHub OAuth 설정 스크립트가 완료되었습니다!');
    console.log('🔧 다음 단계:');
    console.log('   1. GitHub OAuth App을 수동으로 생성하세요');
    console.log('   2. 생성된 Client ID/Secret을 .env.local에 추가하세요');
    console.log('   3. npm run dev로 개발 서버를 실행하세요');
    console.log('   4. http://localhost:3001/settings/github에서 연동을 테스트하세요');
    
  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류 발생:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
main().catch(console.error);
