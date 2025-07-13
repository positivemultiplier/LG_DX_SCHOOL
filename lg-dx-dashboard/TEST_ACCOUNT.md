# 테스트 계정 정보

## 빠른 테스트를 위한 계정

**이메일**: `test@lgdx.com`  
**비밀번호**: `test123456`

## 설정 단계

1. **브라우저에서 접속**
   - `http://localhost:3002/login`

2. **회원가입**
   - 위 계정 정보로 회원가입 또는 다른 이메일 사용

3. **데이터베이스 설정**
   - [Supabase SQL Editor](https://uqytgcqbigejqvhgmafg.supabase.co/project/default/sql) 열기
   - `quick-setup.sql` 파일 내용 복사해서 실행

4. **완료 확인**
   - 로그인 후 대시보드 정상 작동 확인
   - `/setup` 페이지에서 상태 확인

## 개발 서버 정보

- **URL**: http://localhost:3002  
- **Supabase URL**: https://uqytgcqbigejqvhgmafg.supabase.co  
- **환경 변수**: `.env.local` 파일 생성됨

## 문제 해결

### 1. 테이블 오류가 계속 나는 경우
```sql
-- Supabase SQL Editor에서 실행
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'subjects', 'daily_reflections', 'daily_statistics');
```

### 2. 리플렉션 저장 오류
- 로그인 후 `/reflection/morning` 등 접속
- 폼 작성하여 정상 저장 확인

### 3. 실시간 기능 테스트
- 대시보드에서 실시간 연결 상태 확인
- 리플렉션 작성 시 즉시 반영 확인