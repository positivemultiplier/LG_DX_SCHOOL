# Spring & Servlet 학습 가이드

## 📚 목차
1. [학습 로드맵](#학습-로드맵)
2. [기초 개념](#기초-개념)
3. [실습 예제 순서](#실습-예제-순서)
4. [프로젝트 구조 이해](#프로젝트-구조-이해)
5. [주요 개념 설명](#주요-개념-설명)
6. [트러블슈팅](#트러블슈팅)
7. [다음 단계](#다음-단계)

---

## 🗺️ 학습 로드맵

```
1단계: 웹 기초 이해
   ↓
2단계: Servlet 기초
   ↓
3단계: HTTP 메서드 (GET/POST)
   ↓
4단계: 폼 데이터 처리
   ↓
5단계: Spring Framework 이해
   ↓
6단계: Spring Boot 실전
```

---

## 📖 기초 개념

### 1. 웹 애플리케이션이란?

**클라이언트(브라우저) ↔ 서버 ↔ 데이터베이스** 구조로 동작합니다.

```
사용자 → 웹 브라우저 → HTTP 요청 → 웹 서버(Tomcat) → Servlet → 응답 생성 → 사용자
```

### 2. Tomcat이란?

- **WAS (Web Application Server)**: Java 웹 애플리케이션을 실행하는 서버
- **Servlet Container**: Servlet의 생명주기를 관리
- **포트**: 기본 8080, 프로젝트에서는 8090 사용

```properties
# application.properties
server.port=8090  # Tomcat이 실행될 포트 번호
```

### 3. Servlet이란?

Java로 작성된 **서버 측 프로그램**입니다.

**핵심 특징:**
- HTTP 요청을 받아서 처리
- 동적 웹 페이지 생성
- Java 클래스로 구현

```java
@WebServlet("/hello")  // URL 매핑
public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        // 요청 처리 로직
    }
}
```

### 4. Spring Framework란?

Java 엔터프라이즈 애플리케이션 개발을 위한 **포괄적인 프레임워크**

**핵심 기능:**
- **의존성 주입 (DI)**: 객체 간 결합도 감소
- **관점 지향 프로그래밍 (AOP)**: 횡단 관심사 분리
- **데이터 액세스**: JDBC, JPA 지원
- **웹 MVC**: 웹 애플리케이션 구조화

### 5. Spring Boot란?

Spring Framework를 **쉽고 빠르게** 사용할 수 있게 해주는 도구

**장점:**
- 설정 자동화 (Auto Configuration)
- 내장 Tomcat (별도 설치 불필요)
- 의존성 관리 간소화
- 바로 실행 가능한 JAR 생성

---

## 🎯 실습 예제 순서

현재 `demo/` 프로젝트의 예제를 순서대로 학습하세요.

### 📝 EX02: 기본 데이터 전송

**파일:**
- `EX02_send.html`: 데이터 입력 폼
- `EX02_get.java`: 데이터 수신 서블릿

**학습 포인트:**
```java
// 1. URL 매핑
@WebServlet("/Ex02_get")

// 2. GET 메서드 처리
protected void doGet(HttpServletRequest req, HttpServletResponse resp) {

// 3. 파라미터 받기
String data = req.getParameter("data");

// 4. 응답 생성
resp.setContentType("text/html;charset=UTF-8");
PrintWriter out = resp.getWriter();
out.println("<h1>" + data + "</h1>");
```

**실행 방법:**
1. 서버 시작: `mvn spring-boot:run`
2. 브라우저: http://localhost:8090/EX02_send.html
3. 데이터 입력 → 전송 → 결과 확인

---

### 🧮 EX03: 계산기 (파라미터 여러 개)

**파일:**
- `EX03_plus.html`: 두 숫자 입력 폼
- `EX03_plus.java`: 덧셈 계산 서블릿

**학습 포인트:**
```java
// 여러 파라미터 받기
String num1Str = req.getParameter("num1");
String num2Str = req.getParameter("num2");

// 문자열 → 숫자 변환
int num1 = Integer.parseInt(num1Str);
int num2 = Integer.parseInt(num2Str);

// 연산 수행
int result = num1 + num2;
```

**핵심 개념:**
- 폼에서 전송된 데이터는 항상 **문자열(String)**
- 숫자 연산을 위해선 `Integer.parseInt()` 필요
- 예외 처리 고려 (숫자가 아닌 입력)

---

### 🔄 EX04: GET vs POST

**파일:**
- `EX04_getPost.html`: GET/POST 비교 폼
- `EX04_getPost.java`: 메서드 구분 서블릿

**학습 포인트:**

| 특성 | GET | POST |
|------|-----|------|
| 데이터 위치 | URL에 노출 | Body에 포함 |
| 길이 제한 | 있음 (약 1024byte) | 없음 |
| 보안 | 취약 | 상대적으로 안전 |
| 캐싱 | 가능 (빠름) | 불가능 |
| 사용 목적 | 조회 | 등록/수정/삭제 |

```java
// 메서드 확인
String method = req.getMethod();  // "GET" 또는 "POST"

// POST 한글 처리 (중요!)
req.setCharacterEncoding("UTF-8");  // getParameter 전에 필수!
```

**HTML 폼 비교:**
```html
<!-- GET 방식 -->
<form action="Ex04_getPost" method="get">
    <!-- URL에 ?data=값 형태로 전송 -->
</form>

<!-- POST 방식 -->
<form action="Ex04_getPost" method="post">
    <!-- HTTP Body에 포함되어 전송 -->
</form>
```

---

### 📋 EX05: 회원가입 폼 (복합 데이터)

**파일:**
- `EX05_userInfo.html`: 회원가입 폼
- `EX05_userInfo.java`: 회원정보 처리 서블릿

**학습 포인트:**

#### 1. 다양한 입력 타입 처리

```java
// 텍스트 입력
String id = req.getParameter("id");
String pw = req.getParameter("pw");

// 셀렉트 박스
String emailDomain = req.getParameter("email_select");

// 라디오 버튼 (단일 선택)
String gender = req.getParameter("gender");

// 체크박스 (다중 선택) ⭐ 중요!
String[] hobbies = req.getParameterValues("hobby");  // 배열로 받기!
```

#### 2. 체크박스 처리 패턴

```java
if (hobbies != null && hobbies.length > 0) {
    for (String hobby : hobbies) {
        // 각 선택된 취미 처리
    }
} else {
    // 선택 안함
}
```

#### 3. 유효성 검증

```java
// 비밀번호 일치 확인
if (!pw.equals(pw2)) {
    // 경고 메시지 표시
}

// 이메일 조합
String fullEmail = email + "@" + emailDomain;
```

---

## 🏗️ 프로젝트 구조 이해

```
demo/
├── pom.xml                          # Maven 설정 (의존성 관리)
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/
│   │   │       ├── App.java         # Spring Boot 메인 클래스
│   │   │       ├── AppConfig.java   # 설정 클래스
│   │   │       └── servlet/         # 서블릿 클래스들
│   │   │           ├── EX02_get.java
│   │   │           ├── EX03_plus.java
│   │   │           ├── EX04_getPost.java
│   │   │           └── EX05_userInfo.java
│   │   └── resources/
│   │       ├── application.properties  # Spring Boot 설정
│   │       └── static/                 # 정적 리소스 (HTML, CSS, JS)
│   │           ├── EX02_send.html
│   │           ├── EX03_plus.html
│   │           ├── EX04_getPost.html
│   │           └── EX05_userInfo.html
│   └── test/                        # 테스트 코드
└── target/                          # 빌드 결과물
```

### 주요 파일 역할

#### 1. `pom.xml`
Maven 빌드 도구 설정 파일

```xml
<dependencies>
    <!-- Spring Boot Web (내장 Tomcat 포함) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Servlet API -->
    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
    </dependency>
</dependencies>
```

#### 2. `App.java`
Spring Boot 애플리케이션 시작점

```java
@SpringBootApplication
@ServletComponentScan  // Servlet 자동 스캔 활성화
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}
```

**핵심 어노테이션:**
- `@SpringBootApplication`: Spring Boot 앱임을 선언
- `@ServletComponentScan`: `@WebServlet` 어노테이션을 자동으로 인식

#### 3. `application.properties`
애플리케이션 설정 파일

```properties
# 서버 포트 변경
server.port=8090

# 로그 레벨 설정
logging.level.com.example=DEBUG

# 한글 인코딩
spring.http.encoding.charset=UTF-8
spring.http.encoding.enabled=true
```

---

## 💡 주요 개념 설명

### 1. Servlet 생명주기

```java
public class MyServlet extends HttpServlet {
    
    @Override
    public void init() {
        // 서블릿 초기화 (한 번만 실행)
        System.out.println("서블릿 초기화");
    }
    
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) {
        // 모든 요청 처리 (GET, POST, PUT 등)
    }
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        // GET 요청만 처리
    }
    
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
        // POST 요청만 처리
    }
    
    @Override
    public void destroy() {
        // 서블릿 종료 시 (한 번만 실행)
        System.out.println("서블릿 종료");
    }
}
```

**실행 순서:**
```
1. init() → 서버 시작 시 또는 첫 요청 시
2. service() → 매 요청마다 (또는 doGet/doPost)
3. destroy() → 서버 종료 시
```

### 2. HttpServletRequest 주요 메서드

```java
// 파라미터 받기
String value = req.getParameter("name");           // 단일 값
String[] values = req.getParameterValues("hobby"); // 다중 값 (체크박스)

// HTTP 메서드 확인
String method = req.getMethod();  // "GET", "POST" 등

// 인코딩 설정 (POST 한글 처리)
req.setCharacterEncoding("UTF-8");

// 요청 정보
String uri = req.getRequestURI();      // /Ex02_get
String url = req.getRequestURL();      // http://localhost:8090/Ex02_get
String ip = req.getRemoteAddr();       // 클라이언트 IP
```

### 3. HttpServletResponse 주요 메서드

```java
// 응답 타입 설정
resp.setContentType("text/html;charset=UTF-8");
resp.setContentType("application/json");

// 출력 스트림
PrintWriter out = resp.getWriter();
out.println("<h1>Hello</h1>");

// 리다이렉트
resp.sendRedirect("/success.html");

// 상태 코드
resp.setStatus(HttpServletResponse.SC_OK);        // 200
resp.setStatus(HttpServletResponse.SC_NOT_FOUND); // 404
```

### 4. URL 매핑 규칙

```java
@WebServlet("/hello")           // 정확한 매칭: /hello
@WebServlet("/user/*")          // 경로 매칭: /user/로 시작
@WebServlet("*.do")             // 확장자 매칭: .do로 끝남
@WebServlet("/")                // 기본 서블릿
```

### 5. Spring Boot의 Auto Configuration

Spring Boot는 자동으로 다음을 설정합니다:

```java
// 자동 설정되는 것들:
// 1. 내장 Tomcat 서버
// 2. DispatcherServlet (Spring MVC 핵심)
// 3. 기본 에러 페이지
// 4. 정적 리소스 경로 (/static, /public, /resources)
// 5. 뷰 리졸버 (Thymeleaf 등)
```

---

## 🛠️ 개발 워크플로우

### 1. 서버 시작

```powershell
# 프로젝트 디렉토리로 이동
cd c:\Users\lgdx\LG_DX_School\01_Foundation\15.Spring\demo

# Maven으로 서버 시작
mvn spring-boot:run

# 또는 JAR 파일로 실행
mvn clean package
java -jar target/demo-1.0-SNAPSHOT.jar
```

### 2. 코드 수정 후 재시작

```powershell
# 1. 기존 서버 종료 (Ctrl+C)

# 2. 컴파일
mvn compile

# 3. 서버 재시작
mvn spring-boot:run
```

### 3. 테스트 방법

#### 브라우저 테스트
```
http://localhost:8090/EX02_send.html
```

#### PowerShell로 테스트
```powershell
# GET 요청
Invoke-WebRequest -Uri "http://localhost:8090/Ex02_get?data=테스트"

# POST 요청
Invoke-WebRequest -Uri "http://localhost:8090/Ex04_getPost" `
    -Method POST `
    -Body "data=테스트" `
    -ContentType "application/x-www-form-urlencoded; charset=UTF-8"
```

---

## ⚠️ 트러블슈팅

### 문제 1: 포트 충돌

**증상:** `Port 8080 already in use`

**해결:**
```properties
# application.properties
server.port=8090  # 다른 포트로 변경
```

### 문제 2: 한글 깨짐

**원인:** POST 방식에서 인코딩 미설정

**해결:**
```java
// getParameter 전에 반드시!
req.setCharacterEncoding("UTF-8");
resp.setContentType("text/html;charset=UTF-8");
```

### 문제 3: 서블릿을 찾을 수 없음 (404)

**체크리스트:**
1. `@WebServlet("/경로")` 어노테이션 확인
2. `App.java`에 `@ServletComponentScan` 있는지 확인
3. 패키지 선언 (`package com.example.servlet;`)
4. 서버 재시작했는지 확인

### 문제 4: 체크박스 값이 null

**원인:** `getParameter()` 대신 `getParameterValues()` 사용

**해결:**
```java
// 잘못된 방법
String hobby = req.getParameter("hobby");  // 첫 번째 값만 받음

// 올바른 방법
String[] hobbies = req.getParameterValues("hobby");  // 모든 값 받음
```

### 문제 5: Maven 빌드 실패

**해결:**
```powershell
# Maven 캐시 클리어
mvn clean

# 의존성 다시 다운로드
mvn dependency:resolve

# 전체 재빌드
mvn clean install
```

---

## 📚 학습 순서 추천

### Week 1: Servlet 기초
- [ ] HTTP 프로토콜 이해
- [ ] Servlet 생명주기 학습
- [ ] EX02 실습: 기본 데이터 전송
- [ ] EX03 실습: 계산기 만들기

### Week 2: HTTP 메서드
- [ ] GET vs POST 차이 이해
- [ ] EX04 실습: 메서드 비교
- [ ] 인코딩 문제 해결 실습

### Week 3: 폼 데이터 처리
- [ ] 다양한 input 타입 학습
- [ ] EX05 실습: 회원가입 폼
- [ ] 유효성 검증 구현

### Week 4: Spring 기초
- [ ] Spring Framework 아키텍처
- [ ] 의존성 주입 (DI) 개념
- [ ] Spring Boot 설정 방법

### Week 5: Spring MVC
- [ ] Controller 작성
- [ ] Model, View 분리
- [ ] Thymeleaf 템플릿 엔진

---

## 🎓 다음 단계 학습 주제

### 1. Spring MVC로 전환

현재 Servlet → Spring Controller로 리팩토링

```java
// Servlet 방식
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        // ...
    }
}

// Spring MVC 방식
@Controller
public class HelloController {
    @GetMapping("/hello")
    public String hello(Model model) {
        model.addAttribute("message", "Hello");
        return "hello";  // 뷰 이름
    }
}
```

### 2. RESTful API 개발

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @GetMapping
    public List<User> getUsers() {
        // JSON 자동 변환
        return userService.findAll();
    }
    
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }
}
```

### 3. 데이터베이스 연동

```java
// JPA Entity
@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    // ...
}

// Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByName(String name);
}

// Service
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
```

### 4. 보안 (Spring Security)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .authorizeRequests()
                .antMatchers("/public/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .formLogin();
        return http.build();
    }
}
```

---

## 📖 추천 학습 자료

### 공식 문서
- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [Spring Framework 레퍼런스](https://docs.spring.io/spring-framework/reference/)
- [Servlet API 문서](https://docs.oracle.com/javaee/7/api/javax/servlet/package-summary.html)

### 온라인 강좌
- 인프런: "스프링 입문 - 코드로 배우는 스프링 부트"
- Udemy: "Spring Framework 완전 정복"

### 책
- "스프링 부트와 AWS로 혼자 구현하는 웹 서비스"
- "토비의 스프링 3.1"

---

## 🎯 실습 과제

### 과제 1: 로그인 페이지
- 아이디/비밀번호 입력
- POST 방식 전송
- 세션에 로그인 정보 저장

### 과제 2: 방명록
- 글 작성 (이름, 내용)
- 글 목록 조회
- 간단한 데이터 저장 (ArrayList 사용)

### 과제 3: 계산기 확장
- 사칙연산 모두 지원
- 히스토리 기능 추가

---

## 🔑 핵심 요약

### 반드시 기억할 것

1. **POST 한글 처리**
   ```java
   req.setCharacterEncoding("UTF-8");  // getParameter 전!
   ```

2. **체크박스는 배열로**
   ```java
   String[] values = req.getParameterValues("name");
   ```

3. **서블릿 등록**
   ```java
   @WebServlet("/url")
   // + App.java에 @ServletComponentScan
   ```

4. **응답 인코딩**
   ```java
   resp.setContentType("text/html;charset=UTF-8");
   ```

5. **GET vs POST**
   - GET: 조회 (URL에 노출)
   - POST: 등록/수정 (Body에 포함)

---

## 📞 추가 도움말

### 디버깅 팁

```java
// 콘솔 출력으로 디버깅
System.out.println("받은 데이터: " + data);

// 모든 파라미터 확인
Enumeration<String> params = req.getParameterNames();
while (params.hasMoreElements()) {
    String name = params.nextElement();
    String value = req.getParameter(name);
    System.out.println(name + " = " + value);
}
```

### 로그 레벨 설정

```properties
# application.properties
logging.level.root=INFO
logging.level.com.example=DEBUG
```

---

**작성일:** 2025-10-22  
**프로젝트:** LG DX School - Spring 학습  
**위치:** `c:\Users\lgdx\LG_DX_School\01_Foundation\15.Spring\demo`

이 가이드를 따라 단계별로 학습하면 Spring과 Servlet의 기초를 탄탄히 다질 수 있습니다! 💪
