# 🔍 EX10_request 문제점 분석 및 해결

## 📋 발견된 문제점 (4가지)

### ❌ 문제 1: JSP 파일 HTML 태그 오류
**위치:** `EX10_request.jsp`

**오류 코드:**
```html
<!DOCTYPE html>
< lang="en">  <!-- ❌ <html> 누락! -->
```

**원인:**
- `<html>` 태그가 `<`로만 작성됨
- `html` 단어가 빠짐

**수정:**
```html
<!DOCTYPE html>
<html lang="ko">  <!-- ✅ 완전한 태그 -->
```

**배운 점:**
- HTML 태그는 정확한 문법으로 작성
- `<html lang="ko">` - 한국어 페이지는 "ko" 사용

---

### ❌ 문제 2: 인코딩 설정 중복 및 위치 오류

**오류 코드 (JSP):**
```jsp
<%
request.setCharacterEncoding("UTF-8");  // ❌ JSP에서 설정 (늦음!)
String name = request.getParameter("name");
%>
```

**원인:**
- `getParameter()` **호출 전**에 인코딩 설정해야 함
- JSP에 도달했을 때는 이미 파라미터가 읽힌 상태

**올바른 위치 (Servlet):**
```java
@Override
protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
    req.setCharacterEncoding("UTF-8");  // ✅ getParameter 전에 설정!
    
    String name = req.getParameter("name");  // 한글 정상 처리
}
```

**배운 점:**
- 인코딩 설정은 **Servlet**에서, **getParameter() 호출 전**에!
- JSP에서 하면 이미 늦음

---

### ❌ 문제 3: HTML 파일 위치 오류

**오류 위치:**
```
❌ src/main/webapp/WEB-INF/EX10_request.html
```

**원인:**
- `/WEB-INF/` 폴더는 **외부 접근 불가** (보안 목적)
- 브라우저에서 직접 열 수 없음

**올바른 위치:**
```
✅ src/main/resources/static/EX10_request.html
```

**폴더별 역할:**

| 폴더 | 외부 접근 | 용도 |
|------|-----------|------|
| `static/` | ✅ 가능 | HTML, CSS, JS, 이미지 |
| `WEB-INF/` | ❌ 불가 | JSP, 설정 파일 (보안) |

**배운 점:**
- HTML은 `static/` 폴더에!
- JSP는 `WEB-INF/jsp/` 폴더에!

---

### ❌ 문제 4: Form Action 경로 오류

**오류 코드 (HTML):**
```html
<form action="../jsp/EX10_request.jsp" method="post">
    <!-- ❌ JSP 직접 호출 불가! -->
</form>
```

**원인:**
- JSP는 `/WEB-INF/` 하위에 있어서 직접 접근 불가
- 반드시 **Servlet을 거쳐야** 함

**수정:**
```html
<form action="/EX10_request" method="post">
    <!-- ✅ Servlet 경로로 전송 -->
</form>
```

**배운 점:**
- Form은 항상 **Servlet으로 전송**
- Servlet이 처리 후 JSP로 forward

---

## ✅ 올바른 구조

### 📁 파일 배치

```
demo/
├── src/main/
│   ├── java/com/example/servlet/
│   │   └── EX10_request.java          (Servlet - 컨트롤러)
│   ├── resources/
│   │   └── static/
│   │       └── EX10_request.html      (HTML - 입력 폼)
│   └── webapp/WEB-INF/jsp/
│       └── EX10_request.jsp           (JSP - 결과 화면)
```

### 🔄 데이터 흐름

```
1️⃣ 사용자 입력
   http://localhost:8090/EX10_request.html
   ↓ (이름, 나이 입력)
   
2️⃣ Form 전송 (POST)
   <form action="/EX10_request" method="post">
   ↓
   
3️⃣ Servlet 처리
   @WebServlet("/EX10_request")
   ├── req.setCharacterEncoding("UTF-8");  ⚠️ 인코딩 설정
   ├── String name = req.getParameter("name");
   └── forward → JSP
   
4️⃣ JSP 출력
   /WEB-INF/jsp/EX10_request.jsp
   ├── <%= name %>  (출력)
   └── HTML 생성
```

---

## 🎓 학습 포인트

### 1. GET vs POST

| 방식 | 데이터 위치 | 보안 | 용도 |
|------|-------------|------|------|
| **GET** | URL 쿼리스트링 | 낮음 | 조회, 검색 |
| **POST** | HTTP Body | 높음 | 등록, 수정, 삭제 |

**GET 예시:**
```
http://localhost:8090/EX10_request?name=홍길동&age=25
                                   ↑ URL에 데이터 노출
```

**POST 예시:**
```
http://localhost:8090/EX10_request
                                   ↑ URL에 데이터 없음
HTTP Body: name=홍길동&age=25      ↑ Body에 숨겨짐
```

### 2. Servlet 메서드

```java
// GET 요청 처리
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
    // URL 직접 접근, 링크 클릭 등
}

// POST 요청 처리
@Override
protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
    // Form 전송 (method="post")
}

// 모든 요청 처리 (GET, POST 모두)
@Override
protected void service(HttpServletRequest req, HttpServletResponse resp) {
    // 둘 다 처리 가능
}
```

### 3. 인코딩 설정 타이밍

```java
// ✅ 올바른 순서
req.setCharacterEncoding("UTF-8");     // 1️⃣ 먼저 설정
String name = req.getParameter("name"); // 2️⃣ 그 다음 읽기

// ❌ 잘못된 순서
String name = req.getParameter("name"); // 1️⃣ 먼저 읽으면
req.setCharacterEncoding("UTF-8");     // 2️⃣ 이미 늦음! 한글 깨짐
```

### 4. Forward vs Redirect

**Forward (내부 전달):**
```java
RequestDispatcher dispatcher = req.getRequestDispatcher("/WEB-INF/jsp/EX10_request.jsp");
dispatcher.forward(req, resp);
```
- 서버 내부에서만 이동
- URL 변경 안 됨
- request 객체 유지 (데이터 전달 가능)

**Redirect (외부 이동):**
```java
resp.sendRedirect("/EX10_request.html");
```
- 브라우저에게 새 URL로 이동 지시
- URL 변경됨
- request 객체 새로 생성 (데이터 전달 불가)

---

## 🧪 테스트 방법

### 1단계: 서버 시작
```powershell
cd c:\Users\lgdx\LG_DX_School\01_Foundation\15.Spring\demo
mvn spring-boot:run
```

### 2단계: 브라우저 접속
```
http://localhost:8090/EX10_request.html
```

### 3단계: 데이터 입력
- 이름: 홍길동
- 나이: 25

### 4단계: 회원가입 버튼 클릭

### 5단계: 결과 확인
- URL: `http://localhost:8090/EX10_request` (변경 안 됨!)
- 화면: 입력한 이름과 나이 표시

---

## 🔧 문제 해결 체크리스트

### HTML 작성 시
- [ ] `<html>` 태그 완전하게 작성
- [ ] `static/` 폴더에 배치
- [ ] `action`은 Servlet 경로 (`/EX10_request`)
- [ ] `method="post"` 설정

### Servlet 작성 시
- [ ] `@WebServlet` 어노테이션 추가
- [ ] `doPost()` 메서드 구현 (POST 전송 시)
- [ ] `req.setCharacterEncoding("UTF-8")` 먼저 호출
- [ ] `forward()` 또는 `sendRedirect()` 선택

### JSP 작성 시
- [ ] `WEB-INF/jsp/` 폴더에 배치
- [ ] `<%@ page ... %>` 지시자 추가
- [ ] HTML 태그 올바르게 작성
- [ ] `<%= ... %>` 표현식으로 데이터 출력

---

## 💡 추가 학습 과제

### 과제 1: 유효성 검사 추가
```java
// Servlet에서
String age = req.getParameter("age");
if (age == null || age.trim().isEmpty()) {
    resp.sendRedirect("/EX10_request.html?error=age_required");
    return;
}
```

### 과제 2: setAttribute로 데이터 전달
```java
// Servlet에서
String name = req.getParameter("name");
req.setAttribute("userName", name.toUpperCase());
dispatcher.forward(req, resp);

// JSP에서
<p>이름 (대문자): <%= request.getAttribute("userName") %></p>
```

### 과제 3: 여러 필드 추가
- 이메일
- 전화번호
- 주소

---

## 🎯 핵심 요약

1. **HTML** → `static/` 폴더
2. **JSP** → `WEB-INF/jsp/` 폴더
3. **Form action** → Servlet 경로
4. **인코딩 설정** → `getParameter()` 전에!
5. **데이터 흐름** → HTML → Servlet → JSP

---

**작성일:** 2025-10-22  
**프로젝트:** LG DX School Spring 학습  
**학습 주제:** Servlet Request/Response 처리

이제 완벽하게 이해했습니다! 🚀
