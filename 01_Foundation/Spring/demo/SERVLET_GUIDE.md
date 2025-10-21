# Servlet 매핑 가이드

## 📚 Servlet이란?

Servlet은 서버에서 실행되는 Java 프로그램으로, 웹 브라우저의 요청(Request)을 받아서 처리하고 응답(Response)을 돌려주는 역할을 합니다.

## 🔧 Servlet 만들기 3단계

### 1단계: Servlet 클래스 생성

```java
package com.example.servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/hello")  // ⭐ URL 매핑: http://localhost:8090/hello
public class HelloServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        // GET 요청 처리
        response.setContentType("text/html;charset=UTF-8");
        response.getWriter().println("<h1>Hello Servlet!</h1>");
    }
}
```

### 2단계: Spring Boot에서 Servlet 활성화

`App.java`에 `@ServletComponentScan` 추가:

```java
@SpringBootApplication
@ServletComponentScan  // ⭐ 이 어노테이션 추가!
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}
```

### 3단계: 빌드 & 실행

```bash
mvn clean package -DskipTests
mvn spring-boot:run
```

## 🎯 URL 매핑 방법

### 방법 1: @WebServlet 어노테이션 (권장)

```java
@WebServlet("/mypage")
public class MyServlet extends HttpServlet { ... }
```

→ 접근 URL: `http://localhost:8090/mypage`

### 방법 2: 여러 URL 매핑

```java
@WebServlet(urlPatterns = {"/page1", "/page2", "/page3"})
public class MultiServlet extends HttpServlet { ... }
```

→ 모두 같은 Servlet으로 처리됨

### 방법 3: 와일드카드 매핑

```java
@WebServlet("/admin/*")
public class AdminServlet extends HttpServlet { ... }
```

→ `/admin/users`, `/admin/settings` 등 모두 처리

## 📨 데이터 주고받기

### HTML 폼에서 데이터 전송

```html
<form action="/receive" method="GET">
    <input type="text" name="data">
    <button type="submit">전송</button>
</form>
```

### Servlet에서 데이터 받기

```java
@WebServlet("/receive")
public class ReceiveServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // 파라미터 받기
        String data = request.getParameter("data");
        
        // 응답 보내기
        response.setContentType("text/html;charset=UTF-8");
        response.getWriter().println("받은 데이터: " + data);
    }
}
```

## 🔄 GET vs POST

### GET 방식
- URL에 데이터가 노출됨: `?name=value&age=20`
- 북마크 가능, 데이터 길이 제한
- 조회/검색에 적합

```java
@Override
protected void doGet(HttpServletRequest request, HttpServletResponse response) {
    String name = request.getParameter("name");
}
```

### POST 방식
- URL에 데이터가 숨겨짐 (body에 포함)
- 데이터 길이 제한 없음
- 로그인/회원가입 등에 적합

```java
@Override
protected void doPost(HttpServletRequest request, HttpServletResponse response) {
    request.setCharacterEncoding("UTF-8"); // 한글 깨짐 방지
    String password = request.getParameter("password");
}
```

## 🌐 실습 예제

### 예제 1: HelloServlet
```
URL: http://localhost:8090/hello
기능: 간단한 인사 메시지 출력
```

### 예제 2: ReceiveServlet
```
URL: http://localhost:8090/receive?data=테스트
기능: URL 파라미터로 받은 데이터 표시
```

### 예제 3: HTML 폼
```
URL: http://localhost:8090/send.html
기능: 입력 폼 → ReceiveServlet으로 전송
```

## 📝 주요 메서드

| 메서드 | 설명 |
|--------|------|
| `request.getParameter("name")` | 파라미터 값 가져오기 |
| `request.setCharacterEncoding("UTF-8")` | 한글 인코딩 설정 |
| `response.setContentType("text/html;charset=UTF-8")` | 응답 타입 설정 |
| `response.getWriter().println()` | HTML 출력 |
| `request.getRequestURI()` | 요청 URI 가져오기 |
| `request.getMethod()` | 요청 메서드(GET/POST) |

## 🚀 프로젝트 구조

```
demo/
├── src/main/
│   ├── java/com/example/
│   │   ├── App.java (@ServletComponentScan 추가)
│   │   └── servlet/
│   │       ├── HelloServlet.java (@WebServlet("/hello"))
│   │       └── ReceiveServlet.java (@WebServlet("/receive"))
│   └── resources/
│       └── static/
│           └── send.html (폼 페이지)
└── pom.xml
```

## 💡 팁

1. **@WebServlet** 어노테이션만 있으면 자동으로 URL 매핑됨
2. **@ServletComponentScan** 반드시 메인 클래스에 추가
3. **한글 깨짐** 방지: `setCharacterEncoding("UTF-8")` 필수
4. **정적 파일** (HTML, CSS, JS)은 `src/main/resources/static/` 폴더에
5. **빌드 후** 꼭 서버 재시작!

## 🎯 테스트 방법

```bash
# 1. HelloServlet 테스트
curl http://localhost:8090/hello

# 2. ReceiveServlet 테스트 (GET)
curl "http://localhost:8090/receive?data=안녕하세요"

# 3. 브라우저에서 테스트
http://localhost:8090/send.html
```

---

이제 Servlet을 만들고 URL 매핑할 수 있습니다! 🎉
