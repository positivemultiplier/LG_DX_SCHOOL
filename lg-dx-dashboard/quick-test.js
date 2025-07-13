// 간단한 데이터베이스 연결 테스트
const https = require('https');

const SUPABASE_URL = 'https://uqytgcqbigejqvhgmafg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeXRnY3FiaWdlanF2aGdtYWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MzEzMzksImV4cCI6MjA1MjIwNzMzOX0.VhYOGVVb_HoFGdPxMhPaftnzIkw0vKXQoRhc6zKYSfI';

// 간단한 테이블 확인 요청
const url = `${SUPABASE_URL}/rest/v1/daily_reflections?select=count&limit=1`;

const options = {
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'count=exact'
  }
};

console.log('🔍 Supabase 연결 테스트 중...');
console.log('URL:', url);

const req = https.get(url, options, (res) => {
  console.log('✅ 응답 상태:', res.statusCode);
  console.log('📋 응답 헤더:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      console.log('📊 응답 데이터:', data);
      if (res.statusCode === 200) {
        console.log('✅ daily_reflections 테이블이 성공적으로 생성되었습니다!');
      } else if (res.statusCode === 404) {
        console.log('❌ 테이블이 존재하지 않거나 접근할 수 없습니다.');
      } else {
        console.log('⚠️  예상하지 못한 응답 상태:', res.statusCode);
      }
    } catch (err) {
      console.log('❌ JSON 파싱 오류:', err.message);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ 연결 오류:', err.message);
  console.log('🌐 네트워크 연결을 확인해주세요.');
});

req.setTimeout(10000, () => {
  console.log('⏰ 요청 시간 초과 (10초)');
  req.destroy();
});