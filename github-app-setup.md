# GitHub App 생성 및 OAuth 설정 가이드

## 1. GitHub App 생성
1. https://github.com/settings/apps/new 접속
2. 다음 정보 입력:

### 기본 정보
- **GitHub App name**: `LG DX Dashboard`
- **Description**: `LG DX School 학습 대시보드 GitHub 연동`
- **Homepage URL**: `http://localhost:3001`

### 인증 설정
- **User authorization callback URL**: `http://localhost:3001/api/github/connect/callback`
- **Setup URL (optional)**: `http://localhost:3001/settings/github`
- **Webhook URL**: `http://localhost:3001/api/github/webhook`
- **Webhook secret**: 랜덤 문자열 생성 (32자 이상 권장)

### 권한 설정
#### Repository permissions:
- **Contents**: Read
- **Metadata**: Read
- **Pull requests**: Read
- **Issues**: Read

#### User permissions:
- **Email addresses**: Read

### 이벤트 구독
- [x] Push
- [x] Pull request
- [x] Issues
- [x] Create
- [x] Delete

## 2. 앱 생성 후 설정
1. "Create GitHub App" 클릭
2. 생성된 앱 페이지에서 다음 정보 복사:
   - **App ID**
   - **Client ID** 
   - **Client Secret** (Generate 버튼 클릭 후 생성)

## 3. 환경변수 업데이트
`.env.local` 파일에서 다음 값들을 실제 값으로 변경:

```bash
# GitHub OAuth 설정 (실제 값으로 교체)
NEXT_PUBLIC_GITHUB_CLIENT_ID=실제_Client_ID
GITHUB_CLIENT_SECRET=실제_Client_Secret

# GitHub 웹훅 설정 (실제 값으로 교체)
GITHUB_WEBHOOK_SECRET=실제_Webhook_Secret
```

## 4. 앱 설치
1. GitHub App 페이지에서 "Install App" 클릭
2. 본인 계정 또는 조직 선택
3. 리포지토리 접근 권한 설정 (All repositories 또는 Selected repositories)
4. "Install" 클릭

## 5. 테스트
1. 개발 서버 재시작: `npm run dev`
2. http://localhost:3001/settings/github 접속
3. "GitHub 계정 연결" 버튼 클릭
4. GitHub OAuth 인증 진행
5. 연동 성공 확인

## 주의사항
- **Production 환경**에서는 HTTPS URL 사용 필요
- **Webhook Secret**은 보안을 위해 강력한 랜덤 문자열 사용
- **Client Secret**은 절대 공개하지 않기