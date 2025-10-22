# EX11_response 학습 가이드 📚

## 목차
1. [전체 흐름 개요](#1-전체-흐름-개요)
2. [HTTP 메서드: GET vs POST](#2-http-메서드-get-vs-post)
3. [MVC 패턴으로 이해하기](#3-mvc-패턴으로-이해하기)
4. [Servlet 생명주기](#4-servlet-생명주기)
5. [Tomcat의 역할](#5-tomcat의-역할)
6. [Spring Boot의 역할](#6-spring-boot의-역할)
7. [sendRedirect() 상세 분석](#7-sendredirect-상세-분석)
8. [forward() vs sendRedirect()](#8-forward-vs-sendredirect)
9. [실전 디버깅 가이드](#9-실전-디버깅-가이드)

---

## 1. 전체 흐름 개요

### 🎯 사용자 관점 (What you see)
```
1. 브라우저에서 http://localhost:8090/EX11_response.html 접속
2. 예쁜 버튼 3개 보임 (네이버, 구글, 유튜브)
3. "네이버로 이동" 버튼 클릭
4. 네이버 페이지가 열림 (주소창 URL이 naver.com으로 변경됨)
```

### 🔧 내부 동작 (What really happens)
```
[브라우저] 
   ↓ GET /EX11_response.html
[Tomcat: Static File Serving]
   ↓ HTML 파일 전송
[브라우저: HTML 렌더링]
   ↓ 사용자가 "네이버" 버튼 클릭
[브라우저]
   ↓ POST /EX11_response (site=naver)
[Tomcat: Servlet Container]
   ↓ @WebServlet("/EX11_response") 매핑 검색
[EX11_response.doPost() 실행]
   ↓ req.getParameter("site") → "naver"
   ↓ resp.sendRedirect("https://www.naver.com")
[Tomcat]
   ↓ HTTP 응답 생성
   ↓ 302 Found
   ↓ Location: https://www.naver.com
[브라우저]
   ↓ 302 응답 수신 → Location 헤더 확인
   ↓ GET https://www.naver.com (새로운 요청)
[네이버 서버]
   ↓ 네이버 메인 페이지 HTML 응답
[브라우저]
   ✅ 네이버 페이지 표시
```

---

## 2. HTTP 메서드: GET vs POST

### 📖 GET 방식
```
특징:
- URL에 데이터가 노출됨
- 북마크 가능
- 브라우저 히스토리에 남음
- 데이터 길이 제한 (2048자)
- 멱등성(Idempotent): 여러 번 호출해도 같은 결과

사용 사례:
✅ 검색 쿼리 (https://www.google.com/search?q=servlet)
✅ 페이지 조회
✅ 필터링/정렬

예시 URL:
http://localhost:8090/EX11_response?site=naver&lang=ko

보안:
⚠️ 비밀번호 같은 민감 정보 전송 금지
⚠️ URL에 모든 파라미터 노출
```

### 📮 POST 방식
```
특징:
- HTTP Body에 데이터 포함 (URL에 안 보임)
- 북마크 불가
- 브라우저 뒤로가기 시 재전송 경고
- 데이터 길이 제한 없음
- 비멱등성: 호출할 때마다 다른 결과 가능 (예: 회원가입)

사용 사례:
✅ 로그인
✅ 회원가입
✅ 게시글 작성
✅ 파일 업로드
✅ 결제 처리

HTTP 요청 예시:
POST /EX11_response HTTP/1.1
Host: localhost:8090
Content-Type: application/x-www-form-urlencoded
Content-Length: 10

site=naver

보안:
✅ URL에 파라미터 노출 안 됨
✅ HTTPS 사용 시 암호화 가능
⚠️ 여전히 네트워크 스니핑 가능 (HTTPS 필수)
```

### 🔄 EX11_response에서의 POST 사용 이유
```html
<!-- HTML Form -->
<form action="/EX11_response" method="post">
    <input type="hidden" name="site" value="naver">
    <button type="submit">네이버로 이동</button>
</form>
```

**Q: 왜 GET이 아니라 POST를 사용했나요?**

A: 실무 베스트 프랙티스 학습 목적
- GET은 "조회"용 (Read)
- POST는 "상태 변경"용 (Create/Update/Delete)
- Redirect는 "상태 변경" 개념에 가까움
- RESTful API 설계 원칙 준수

---

## 3. MVC 패턴으로 이해하기

### 📐 MVC (Model-View-Controller) 패턴

```
┌─────────────────────────────────────────────────┐
│                   사용자                          │
│            (브라우저 / 클라이언트)                 │
└─────────────┬───────────────────────┬───────────┘
              │ HTTP Request          │ HTTP Response
              ↓                       ↑
┌─────────────────────────────────────────────────┐
│                Controller Layer                 │
│          (Servlet: EX11_response.java)          │
│                                                 │
│  역할:                                           │
│  - HTTP 요청 받기 (doGet/doPost)                │
│  - 파라미터 추출 (req.getParameter)             │
│  - 비즈니스 로직 호출 (Model)                   │
│  - 응답 방식 결정 (forward/redirect)            │
└─────────────┬──────────────────┬────────────────┘
              │                  │
              ↓                  ↓
┌─────────────────────┐   ┌─────────────────────┐
│    Model Layer      │   │    View Layer       │
│   (비즈니스 로직)    │   │    (JSP/HTML)       │
│                     │   │                     │
│  역할:               │   │  역할:               │
│  - 데이터 처리       │   │  - 화면 렌더링       │
│  - DB 접근          │   │  - HTML 생성        │
│  - 계산/검증        │   │  - CSS/JS 포함      │
│                     │   │                     │
│  예시:               │   │  예시:               │
│  - UserService      │   │  - login.jsp        │
│  - ProductDAO       │   │  - list.jsp         │
│  - OrderManager     │   │  - error.jsp        │
└─────────────────────┘   └─────────────────────┘
```

### 🎯 EX11_response의 MVC 구조

#### **View (HTML)**
```
파일: EX11_response.html
위치: src/main/resources/static/
역할: 사용자 인터페이스 제공

책임:
- 3개 버튼 표시 (네이버, 구글, 유튜브)
- 각 버튼을 Form으로 구현
- hidden input으로 site 파라미터 전송
- 예쁜 CSS 스타일링

특징:
- 정적 파일 (Static Resource)
- Tomcat이 직접 서빙 (Servlet 거치지 않음)
- /static 폴더는 Spring Boot가 자동 매핑
```

#### **Controller (Servlet)**
```java
파일: EX11_response.java
위치: src/main/java/com/example/servlet/
역할: HTTP 요청 처리 및 흐름 제어

책임:
- @WebServlet("/EX11_response") URL 매핑
- doPost() 메서드로 POST 요청 처리
- req.getParameter("site") 파라미터 추출
- if/else 분기로 URL 결정
- resp.sendRedirect() 호출

특징:
- HttpServlet 상속
- Tomcat Servlet Container가 관리
- 요청당 스레드 생성 (Thread per Request)
- 싱글톤 패턴 (인스턴스 1개만 생성)
```

#### **Model (이 예제에서는 없음)**
```
EX11_response는 단순 Redirect 예제이므로 Model 없음

만약 있다면:
- RedirectService.java
  - 메서드: String getRedirectUrl(String site)
  - 역할: site 파라미터 → URL 변환 로직
  - DB 조회: 사이트별 통계 저장

- RedirectRepository.java
  - DB 접근 계층
  - 리다이렉트 로그 저장

실무 예시:
Controller → Service → Repository → Database
```

---

## 4. Servlet 생명주기

### 🔄 Servlet Lifecycle

```
[ Tomcat 시작 ]
       ↓
┌──────────────────────────────────────┐
│  1. 로딩 (Loading)                   │
│     - 클래스 파일 메모리에 로드       │
│     - 아직 인스턴스 생성 안 됨        │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│  2. 인스턴스화 (Instantiation)        │
│     - new EX11_response()            │
│     - 서블릿 객체 생성 (1개만!)       │
│     - 싱글톤 패턴                    │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│  3. 초기화 (Initialization)           │
│     - init() 메서드 호출              │
│     - 최초 1회만 실행                │
│     - DB 연결, 설정 로드 등          │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│  4. 서비스 (Service)                  │
│     ┌────────────────────────┐       │
│     │ 요청1 → service()      │       │
│     │  ↓                    │       │
│     │ doGet() or doPost()   │       │
│     └────────────────────────┘       │
│     ┌────────────────────────┐       │
│     │ 요청2 → service()      │       │
│     │  ↓                    │       │
│     │ doGet() or doPost()   │       │
│     └────────────────────────┘       │
│     ... (반복)                       │
│                                      │
│  ⚠️ 각 요청은 새로운 스레드에서 실행  │
│  ⚠️ 하지만 같은 Servlet 인스턴스 공유│
└──────────────────────────────────────┘
       ↓
[ Tomcat 종료 or 재배포 ]
       ↓
┌──────────────────────────────────────┐
│  5. 소멸 (Destroy)                   │
│     - destroy() 메서드 호출           │
│     - 리소스 정리 (DB 연결 해제 등)   │
│     - 객체 메모리 해제               │
└──────────────────────────────────────┘
```

### 📌 EX11_response.java의 생명주기

```java
@WebServlet("/EX11_response")
public class EX11_response extends HttpServlet {
    
    // ========== 1단계: 로딩 + 인스턴스화 ==========
    // Tomcat이 자동으로 처리 (개발자가 new 하지 않음)
    
    // ========== 2단계: 초기화 ==========
    @Override
    public void init() throws ServletException {
        // 이 예제에서는 구현 안 했지만, 필요하면 여기서:
        // - DB 커넥션 풀 생성
        // - 설정 파일 로드
        // - 캐시 초기화
        System.out.println("EX11_response Servlet 초기화됨!");
    }
    
    // ========== 3단계: 서비스 (요청 처리) ==========
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        // GET 요청 처리
        // 스레드마다 별도로 실행됨
    }
    
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        // POST 요청 처리
        // 스레드마다 별도로 실행됨
        
        // ⚠️ 주의: 인스턴스 변수 사용 금지!
        // 여러 스레드가 공유하므로 동기화 문제 발생
        
        // ✅ 지역 변수 사용
        String site = req.getParameter("site"); // 스레드 안전
    }
    
    // ========== 4단계: 소멸 ==========
    @Override
    public void destroy() {
        // Tomcat 종료 시 자동 호출
        // 리소스 정리 코드
        System.out.println("EX11_response Servlet 소멸됨!");
    }
}
```

### 🧵 멀티스레드 환경에서의 Servlet

```
시나리오: 동시에 3명의 사용자가 버튼 클릭

[ EX11_response 인스턴스 1개 ]
              ↓
    ┌─────────┴─────────┐
    │   Servlet 객체     │
    │   (싱글톤)         │
    └─┬─────┬─────┬─────┘
      │     │     │
  ┌───┘     │     └───┐
  │         │         │
Thread 1  Thread 2  Thread 3
  │         │         │
doPost()  doPost()  doPost()
  │         │         │
site=     site=     site=
"naver"   "google"  "youtube"

⚠️ 동시성 문제 예시:

// ❌ 잘못된 코드 (인스턴스 변수 사용)
public class BadServlet extends HttpServlet {
    private String site; // 위험! 여러 스레드가 공유
    
    protected void doPost(...) {
        site = req.getParameter("site"); // Thread1: "naver"
        // Thread2가 site를 "google"로 덮어씀!
        resp.sendRedirect(getUrl(site)); // Thread1이 google로 가버림!
    }
}

// ✅ 올바른 코드 (지역 변수 사용)
public class EX11_response extends HttpServlet {
    protected void doPost(...) {
        String site = req.getParameter("site"); // 지역 변수 (스레드 안전)
        resp.sendRedirect(getUrl(site));
    }
}
```

---

## 5. Tomcat의 역할

### 🐱 Tomcat이란?

```
정의:
Apache Tomcat = Servlet Container + Web Server

역할:
1. HTTP 요청 받기 (포트 8090 리스닝)
2. Servlet 생명주기 관리
3. 멀티스레드 처리
4. 정적 파일 서빙 (HTML, CSS, JS, 이미지)
5. JSP 컴파일
```

### 📦 Tomcat의 구조

```
┌────────────────────────────────────────┐
│         Tomcat Server (Port 8090)      │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────┐     │
│  │    Connector (HTTP/1.1)      │     │
│  │  - Socket 연결 관리           │     │
│  │  - HTTP 파싱                 │     │
│  │  - 요청/응답 변환             │     │
│  └──────────────────────────────┘     │
│                ↓                       │
│  ┌──────────────────────────────┐     │
│  │      Service Engine          │     │
│  │  - 가상 호스트 관리           │     │
│  └──────────────────────────────┘     │
│                ↓                       │
│  ┌──────────────────────────────┐     │
│  │   Servlet Container (Catalina)│     │
│  │                               │     │
│  │  ┌─────────────────────┐     │     │
│  │  │  Context (/)        │     │     │
│  │  │                     │     │     │
│  │  │  - Servlet 관리     │     │     │
│  │  │  - Filter 체인      │     │     │
│  │  │  - Listener         │     │     │
│  │  │                     │     │     │
│  │  │  Servlets:          │     │     │
│  │  │  ├─ EX06_jspBasic  │     │     │
│  │  │  ├─ EX08_directive │     │     │
│  │  │  ├─ EX09_JSTL      │     │     │
│  │  │  ├─ EX10_request   │     │     │
│  │  │  └─ EX11_response  │     │     │
│  │  └─────────────────────┘     │     │
│  └──────────────────────────────┘     │
│                ↓                       │
│  ┌──────────────────────────────┐     │
│  │    Static Resource Handler   │     │
│  │  - HTML, CSS, JS 서빙        │     │
│  │  - /static 폴더 매핑         │     │
│  └──────────────────────────────┘     │
│                                        │
└────────────────────────────────────────┘
```

### 🔄 Tomcat의 요청 처리 흐름

```
[브라우저]
   ↓
   POST /EX11_response HTTP/1.1
   Host: localhost:8090
   Content-Type: application/x-www-form-urlencoded
   
   site=naver
   ↓
[Tomcat Connector]
   ↓ HTTP 요청 파싱
   ↓ HttpServletRequest 객체 생성
   ↓ HttpServletResponse 객체 생성
   ↓
[Servlet Container]
   ↓ URL 매핑 테이블 검색
   ↓ "/EX11_response" → EX11_response 클래스 찾음
   ↓
   ✅ Servlet 인스턴스 있음? 
   │  ├─ Yes → 기존 인스턴스 사용
   │  └─ No → new EX11_response() + init() 호출
   ↓
[Thread Pool]
   ↓ 가용 스레드 할당 (예: Thread-42)
   ↓
[EX11_response.service()]
   ↓ POST 메서드 확인
   ↓ doPost() 호출
   ↓
[doPost() 실행]
   String site = req.getParameter("site");
   resp.sendRedirect("https://www.naver.com");
   ↓
[Tomcat Connector]
   ↓ HTTP 응답 생성
   
   HTTP/1.1 302 Found
   Location: https://www.naver.com
   Content-Length: 0
   ↓
[브라우저]
   ✅ 302 응답 수신 → naver.com으로 리다이렉트
```

### ⚙️ 임베디드 Tomcat (Embedded Tomcat)

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<!-- 위 의존성에 Tomcat 포함됨! -->
```

**전통적인 Tomcat vs 임베디드 Tomcat**

```
┌─────────────────────────────────────────────────┐
│         전통적인 Tomcat (별도 설치)               │
├─────────────────────────────────────────────────┤
│  1. Tomcat 9.0 다운로드 및 설치                  │
│  2. 프로젝트를 WAR 파일로 빌드                   │
│  3. WAR 파일을 Tomcat webapps/ 폴더에 배포       │
│  4. Tomcat 시작 (startup.sh)                    │
│  5. 여러 애플리케이션 동시 실행 가능              │
│                                                 │
│  장점: 여러 앱 하나의 Tomcat에서 관리            │
│  단점: 배포 복잡, 설정 번거로움                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│    임베디드 Tomcat (Spring Boot 사용)            │
├─────────────────────────────────────────────────┤
│  1. Tomcat이 JAR/WAR 안에 포함됨                │
│  2. java -jar demo.war 실행                     │
│  3. 끝! (별도 Tomcat 설치 불필요)               │
│                                                 │
│  장점:                                          │
│  ✅ 배포 간편 (하나의 파일)                      │
│  ✅ 버전 충돌 없음 (각 앱마다 독립적인 Tomcat)   │
│  ✅ 클라우드 배포 최적화 (Docker, Kubernetes)    │
│                                                 │
│  단점: 앱마다 Tomcat 포함 (용량 증가)            │
└─────────────────────────────────────────────────┘
```

---

## 6. Spring Boot의 역할

### 🍃 Spring Boot란?

```
정의:
Spring Framework + Auto-Configuration + Embedded Server

철학:
"Convention over Configuration"
(설정보다 관습 우선)

목표:
- XML 설정 제거
- 즉시 실행 가능한 애플리케이션
- 프로덕션 준비된 기능 제공
```

### 🎁 Spring Boot가 자동으로 해주는 것들

```
1. 임베디드 Tomcat 설정
   - server.port=8090 (application.properties)
   - 별도 Tomcat 설치 불필요

2. Servlet 자동 등록
   - @WebServlet이 붙은 클래스 스캔
   - ServletRegistrationBean 자동 생성

3. 정적 리소스 매핑
   - /static, /public, /resources, /META-INF/resources
   - 자동으로 URL에 매핑

4. JSP 지원 (의존성 추가 시)
   - tomcat-embed-jasper
   - /WEB-INF/jsp/*.jsp 자동 컴파일

5. Character Encoding
   - UTF-8 기본 설정
   - CharacterEncodingFilter 자동 등록

6. Error Page
   - /error 엔드포인트 자동 생성
   - 예외 발생 시 자동 라우팅
```

### 📂 Spring Boot 프로젝트 구조

```
demo/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/
│   │   │       ├── DemoApplication.java    # 진입점
│   │   │       └── servlet/
│   │   │           └── EX11_response.java  # Servlet
│   │   └── resources/
│   │       ├── static/                     # 정적 파일
│   │       │   └── EX11_response.html
│   │       ├── templates/                  # Thymeleaf (미사용)
│   │       └── application.properties      # 설정 파일
│   └── test/
│       └── java/                           # 테스트 코드
├── pom.xml                                 # Maven 설정
└── target/                                 # 빌드 결과물
    └── demo-0.0.1-SNAPSHOT.war
```

### ⚙️ application.properties 설정

```properties
# 서버 포트 변경
server.port=8090

# 컨텍스트 패스 변경 (선택)
# server.servlet.context-path=/myapp
# → http://localhost:8090/myapp/EX11_response

# JSP 설정
spring.mvc.view.prefix=/WEB-INF/jsp/
spring.mvc.view.suffix=.jsp

# 인코딩 설정 (기본값이 UTF-8이므로 생략 가능)
server.servlet.encoding.charset=UTF-8
server.servlet.encoding.enabled=true
server.servlet.encoding.force=true

# 로그 레벨
logging.level.com.example=DEBUG
```

### 🚀 Spring Boot 실행 과정

```
[mvn spring-boot:run 실행]
       ↓
┌──────────────────────────────────────┐
│  1. DemoApplication.main() 실행      │
│     @SpringBootApplication           │
│     - @ComponentScan                 │
│     - @EnableAutoConfiguration       │
│     - @Configuration                 │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│  2. Spring Context 초기화            │
│     - Bean 스캔 및 등록              │
│     - Auto-Configuration 적용        │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│  3. 임베디드 Tomcat 시작             │
│     - ServletWebServerFactory 생성   │
│     - Tomcat 인스턴스 생성           │
│     - Port 8090 리스닝 시작          │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│  4. Servlet 등록                     │
│     - @WebServlet 스캔               │
│     - EX11_response 등록             │
│     - URL 매핑: /EX11_response       │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│  5. 정적 리소스 핸들러 등록          │
│     - /static/** → ResourceHandler   │
│     - EX11_response.html 서빙 준비   │
└──────────────────────────────────────┘
       ↓
✅ Started DemoApplication in 2.5 seconds
✅ Tomcat started on port(s): 8090
```

---

## 7. sendRedirect() 상세 분석

### 🔀 sendRedirect()란?

```java
// 메서드 시그니처
void sendRedirect(String location) throws IOException
```

**정의:**
- 클라이언트(브라우저)에게 "이 URL로 다시 요청하세요"라고 지시
- HTTP 302 응답 코드 사용
- Location 헤더에 목적지 URL 포함

### 📡 HTTP 프로토콜 관점

```
┌─────────────────────────────────────────────────┐
│  1단계: 클라이언트 → 서버 (최초 요청)            │
└─────────────────────────────────────────────────┘

POST /EX11_response HTTP/1.1
Host: localhost:8090
Content-Type: application/x-www-form-urlencoded
Content-Length: 10

site=naver

┌─────────────────────────────────────────────────┐
│  2단계: 서버 처리 (Servlet 실행)                 │
└─────────────────────────────────────────────────┘

EX11_response.doPost() {
    String site = req.getParameter("site"); // "naver"
    resp.sendRedirect("https://www.naver.com");
}

┌─────────────────────────────────────────────────┐
│  3단계: 서버 → 클라이언트 (Redirect 응답)        │
└─────────────────────────────────────────────────┘

HTTP/1.1 302 Found
Location: https://www.naver.com
Content-Length: 0
Connection: close

(Body 없음)

┌─────────────────────────────────────────────────┐
│  4단계: 클라이언트 → 네이버 (새로운 요청)        │
└─────────────────────────────────────────────────┘

GET / HTTP/1.1
Host: www.naver.com
User-Agent: Mozilla/5.0 ...

┌─────────────────────────────────────────────────┐
│  5단계: 네이버 → 클라이언트 (HTML 응답)          │
└─────────────────────────────────────────────────┘

HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 123456

<!DOCTYPE html>
<html>
  네이버 메인 페이지 HTML...
</html>
```

### 🔢 HTTP 상태 코드

```
302 Found (sendRedirect 기본값)
├─ 임시 이동 (Temporary Redirect)
├─ 검색 엔진: 원본 URL 유지
└─ 브라우저: 자동으로 Location 헤더 URL 요청

301 Moved Permanently
├─ 영구 이동
├─ 검색 엔진: 새 URL로 인덱싱
└─ 사용 예: 도메인 변경, HTTPS 강제

303 See Other
├─ POST 후 GET 요청으로 리다이렉트
└─ PRG 패턴 (Post-Redirect-Get)

307 Temporary Redirect
├─ 302와 유사하지만 HTTP 메서드 변경 금지
└─ POST → POST 유지

308 Permanent Redirect
├─ 301과 유사하지만 HTTP 메서드 변경 금지
└─ POST → POST 유지
```

### 🎯 sendRedirect() 사용 예시

```java
// 1. 절대 URL (외부 사이트)
resp.sendRedirect("https://www.google.com");
resp.sendRedirect("https://www.youtube.com");

// 2. 상대 URL (같은 서버)
resp.sendRedirect("/login.jsp");
resp.sendRedirect("/board/list");

// 3. 컨텍스트 경로 포함
String contextPath = req.getContextPath(); // "/myapp"
resp.sendRedirect(contextPath + "/success.jsp");

// 4. 쿼리 파라미터 포함
resp.sendRedirect("/search?keyword=" + 
    URLEncoder.encode("자바", "UTF-8"));

// 5. 다른 Servlet으로 리다이렉트
resp.sendRedirect("/EX10_request");
```

### ⚠️ sendRedirect() 주의사항

```java
// ❌ 잘못된 사용 1: sendRedirect 후 코드 계속 실행
protected void doPost(...) {
    resp.sendRedirect("/success");
    System.out.println("이 코드는 실행됨!"); // ⚠️ 실행됨
    resp.getWriter().println("출력 안 됨"); // ⚠️ 이미 응답 전송됨
}

// ✅ 올바른 사용 1: return으로 즉시 종료
protected void doPost(...) {
    resp.sendRedirect("/success");
    return; // 즉시 메서드 종료
}

// ❌ 잘못된 사용 2: 응답 전송 후 sendRedirect
protected void doPost(...) {
    resp.getWriter().println("Hello");
    resp.sendRedirect("/success"); // IllegalStateException!
}

// ❌ 잘못된 사용 3: forward와 함께 사용
protected void doPost(...) {
    req.getRequestDispatcher("/a.jsp").forward(req, resp);
    resp.sendRedirect("/b.jsp"); // IllegalStateException!
}

// ❌ 잘못된 사용 4: 인코딩 안 함
String keyword = "한글 검색어";
resp.sendRedirect("/search?q=" + keyword); // ❌ 한글 깨짐

// ✅ 올바른 사용 4: URL 인코딩
String keyword = "한글 검색어";
resp.sendRedirect("/search?q=" + 
    URLEncoder.encode(keyword, "UTF-8")); // ✅
```

---

## 8. forward() vs sendRedirect()

### 🔄 forward() (서버 내부 이동)

```java
// forward() 사용법
RequestDispatcher dispatcher = 
    req.getRequestDispatcher("/result.jsp");
dispatcher.forward(req, resp);
```

**동작 원리:**
```
[브라우저]
   ↓ GET /search?q=java
[Servlet A]
   ↓ req.getRequestDispatcher("/result.jsp")
   ↓ forward(req, resp)
[JSP (서버 내부)]
   ↓ HTML 생성
[브라우저]
   ✅ HTML 표시
   ✅ URL: /search?q=java (변경 안 됨!)
```

### 🔀 sendRedirect() (클라이언트 리다이렉트)

```java
// sendRedirect() 사용법
resp.sendRedirect("/result.jsp");
```

**동작 원리:**
```
[브라우저]
   ↓ GET /search?q=java
[Servlet A]
   ↓ resp.sendRedirect("/result.jsp")
[브라우저]
   ↓ 302 응답 수신
   ↓ Location: /result.jsp
   ↓ 자동으로 새 요청 생성
   ↓ GET /result.jsp
[JSP]
   ↓ HTML 생성
[브라우저]
   ✅ HTML 표시
   ✅ URL: /result.jsp (변경됨!)
```

### 📊 비교표

| 구분 | forward() | sendRedirect() |
|------|-----------|----------------|
| **실행 위치** | 서버 내부 | 클라이언트 (브라우저) |
| **요청 횟수** | 1회 | 2회 (원본 + 리다이렉트) |
| **URL 변경** | ❌ 안 됨 | ✅ 변경됨 |
| **request 공유** | ✅ 유지 (같은 request) | ❌ 새로운 request |
| **response 공유** | ✅ 유지 | ❌ 새로운 response |
| **속도** | ⚡ 빠름 (1번 왕복) | 🐢 느림 (2번 왕복) |
| **외부 사이트** | ❌ 불가능 | ✅ 가능 |
| **HTTP 메서드** | 유지 (POST → POST) | 변경될 수 있음 (POST → GET) |
| **브라우저 새로고침** | ⚠️ 폼 재전송 경고 | ✅ 경고 없음 |
| **데이터 전달** | request.setAttribute() | URL 파라미터 or Session |

### 🎯 사용 시나리오

```
┌─────────────────────────────────────────────────┐
│            forward() 사용 케이스                 │
├─────────────────────────────────────────────────┤
│  1. Servlet → JSP (MVC 패턴)                    │
│     Controller에서 데이터 처리 → View로 전달     │
│                                                 │
│  2. 에러 페이지 표시                             │
│     예외 발생 → error.jsp로 forward            │
│                                                 │
│  3. 내부 페이지 이동                             │
│     메뉴 선택 → 해당 콘텐츠 표시                 │
│                                                 │
│  4. 공통 레이아웃 적용                           │
│     헤더/푸터 포함된 레이아웃 JSP               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│         sendRedirect() 사용 케이스               │
├─────────────────────────────────────────────────┤
│  1. PRG 패턴 (Post-Redirect-Get)                │
│     폼 제출 → 처리 → 결과 페이지로 리다이렉트   │
│     (브라우저 새로고침 시 중복 제출 방지)        │
│                                                 │
│  2. 외부 사이트 이동                             │
│     결제 페이지, OAuth 로그인 등                │
│                                                 │
│  3. 인증 실패 시 로그인 페이지로                 │
│     권한 없음 → /login 리다이렉트               │
│                                                 │
│  4. URL 정규화                                   │
│     /oldpath → /newpath 영구 이동               │
└─────────────────────────────────────────────────┘
```

### 💡 PRG 패턴 (Post-Redirect-Get)

```
❌ PRG 패턴 없이 (문제 발생)

[브라우저]
   ↓ POST /order (상품 주문)
[Servlet]
   ↓ DB에 주문 저장
   ↓ forward("/success.jsp")
[브라우저]
   ✅ "주문 완료" 페이지 표시
   ⚠️ URL: /order (POST)
   ⚠️ 사용자가 F5 (새로고침)
   ↓ POST /order 재전송!
[Servlet]
   ↓ 또 DB에 주문 저장!
   ⚠️ 중복 주문 발생!

✅ PRG 패턴 적용 (문제 해결)

[브라우저]
   ↓ POST /order (상품 주문)
[Servlet]
   ↓ DB에 주문 저장
   ↓ resp.sendRedirect("/success")
[브라우저]
   ↓ 302 응답 수신
   ↓ GET /success (새 요청)
[Servlet]
   ↓ 성공 페이지 표시
[브라우저]
   ✅ "주문 완료" 페이지 표시
   ✅ URL: /success (GET)
   ✅ 사용자가 F5 (새로고침)
   ↓ GET /success 재전송
   ✅ 단순히 성공 페이지만 다시 표시
   ✅ 중복 주문 없음!
```

### 📝 코드 예시

```java
// ========== forward() 예시 ==========
@WebServlet("/search")
public class SearchServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        
        // 1. 검색 로직
        String keyword = req.getParameter("keyword");
        List<Product> results = productService.search(keyword);
        
        // 2. request에 데이터 저장
        req.setAttribute("results", results);
        req.setAttribute("keyword", keyword);
        
        // 3. JSP로 forward (URL 변경 안 됨)
        req.getRequestDispatcher("/WEB-INF/search_result.jsp")
           .forward(req, resp);
        
        // 브라우저 URL: /search?keyword=java
    }
}

// ========== sendRedirect() 예시 ==========
@WebServlet("/order")
public class OrderServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        
        // 1. 주문 처리
        String productId = req.getParameter("productId");
        orderService.createOrder(productId);
        
        // 2. PRG 패턴: redirect (URL 변경됨)
        resp.sendRedirect("/order/success?orderId=12345");
        
        // 브라우저 URL: /order/success?orderId=12345
        // 새로고침 시 중복 주문 방지됨
    }
}

// ========== 데이터 전달 차이 ==========

// forward: request.setAttribute 사용
req.setAttribute("user", userObj); // 객체 전달 가능
req.getRequestDispatcher("/result.jsp").forward(req, resp);
// JSP에서: ${user.name}

// sendRedirect: URL 파라미터 사용
resp.sendRedirect("/result?userId=123"); // 문자열만 전달 가능
// 또는 Session 사용
session.setAttribute("user", userObj);
resp.sendRedirect("/result");
```

---

## 9. 실전 디버깅 가이드

### 🐛 디버깅 도구

#### 1. 서버 콘솔 로그
```java
@WebServlet("/EX11_response")
public class EX11_response extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        
        // ✅ 로깅 추가
        System.out.println("========================================");
        System.out.println("🔍 EX11_response.doPost() 호출됨");
        System.out.println("📌 Timestamp: " + LocalDateTime.now());
        System.out.println("📌 Thread: " + Thread.currentThread().getName());
        
        String site = req.getParameter("site");
        System.out.println("📌 site 파라미터: " + site);
        
        if (site == null) {
            System.out.println("⚠️ site 파라미터가 null입니다!");
        }
        
        String redirectUrl = getRedirectUrl(site);
        System.out.println("🚀 Redirect URL: " + redirectUrl);
        System.out.println("========================================");
        
        resp.sendRedirect(redirectUrl);
    }
}
```

#### 2. 브라우저 개발자 도구

```
Chrome DevTools 사용법:

1. F12 키 눌러서 개발자 도구 열기

2. Network 탭 선택

3. "Preserve log" 체크 (리다이렉트 기록 유지)

4. 버튼 클릭 후 관찰

요청 순서:
┌─────────────────────────────────────────┐
│  Name           Status  Type     Size   │
├─────────────────────────────────────────┤
│  EX11_response  302     xhr      0 B    │
│  (red arrow)    ↓                       │
│  www.naver.com  200     document 50 KB  │
└─────────────────────────────────────────┘

5. EX11_response 클릭 → Headers 탭
   - Status Code: 302 Found
   - Location: https://www.naver.com

6. Response 탭 확인
   - Body 없음 (Content-Length: 0)
```

#### 3. cURL로 테스트

```powershell
# POST 요청 테스트
curl -X POST http://localhost:8090/EX11_response `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "site=naver" `
  -v

# 출력 예시:
> POST /EX11_response HTTP/1.1
> Host: localhost:8090
> Content-Type: application/x-www-form-urlencoded
> Content-Length: 10
> 
> site=naver

< HTTP/1.1 302 
< Location: https://www.naver.com
< Content-Length: 0
< Date: Tue, 22 Oct 2025 10:30:00 GMT
```

### 🔍 일반적인 문제와 해결책

#### 문제 1: 404 Not Found
```
증상: http://localhost:8090/EX11_response.html 접속 시 404

원인:
1. HTML 파일 위치 잘못됨
2. 서버 재시작 안 함
3. 경로 오타

해결:
✅ src/main/resources/static/EX11_response.html 확인
✅ mvn clean compile
✅ mvn spring-boot:run
✅ 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
```

#### 문제 2: 405 Method Not Allowed
```
증상: "HTTP method GET is not supported by this URL"

원인:
1. doGet() 메서드 없음
2. form method가 GET인데 doGet() 구현 안 함

해결:
✅ doGet() 메서드 추가
✅ form method="post" 확인
```

#### 문제 3: IllegalStateException
```
증상: "Cannot call sendRedirect() after the response has been committed"

원인:
1. 이미 response에 데이터를 씀
2. forward() 후 sendRedirect() 호출

코드 예시:
❌ resp.getWriter().println("Hello");
❌ resp.sendRedirect("/success"); // 에러!

해결:
✅ sendRedirect() 먼저 호출
✅ 또는 forward()만 사용
```

#### 문제 4: 파라미터 값이 null
```
증상: req.getParameter("site") == null

원인:
1. form name 속성 오타
2. POST인데 GET으로 요청
3. 인코딩 문제

해결:
✅ HTML: <input name="site"> (철자 확인)
✅ Servlet: req.getParameter("site") (철자 확인)
✅ form method="post" 확인
✅ req.setCharacterEncoding("UTF-8") 추가
```

#### 문제 5: 한글 깨짐
```
증상: 파라미터 한글이 "???" 또는 깨진 문자

원인:
1. 인코딩 설정 누락
2. 인코딩 설정 순서 잘못됨

해결:
✅ getParameter() 전에 setCharacterEncoding() 호출
```

```java
protected void doPost(HttpServletRequest req, HttpServletResponse resp) 
        throws ServletException, IOException {
    
    // ✅ 가장 먼저 인코딩 설정!
    req.setCharacterEncoding("UTF-8");
    resp.setContentType("text/html;charset=UTF-8");
    
    // 그 다음 파라미터 읽기
    String site = req.getParameter("site");
}
```

### 📋 체크리스트

```
배포 전 점검 사항:

서버 설정
□ pom.xml에 필요한 의존성 추가됨
□ application.properties 설정 확인
□ server.port=8090 설정됨

파일 위치
□ HTML: src/main/resources/static/
□ Servlet: src/main/java/com/example/servlet/
□ JSP: src/main/webapp/WEB-INF/jsp/

코드 확인
□ @WebServlet 어노테이션 올바름
□ doGet/doPost 메서드 구현됨
□ 인코딩 설정 추가됨
□ sendRedirect() 전에 응답 출력 안 함

빌드 & 실행
□ mvn clean compile 성공
□ mvn spring-boot:run 성공
□ 콘솔에 에러 없음
□ "Started DemoApplication" 메시지 확인

테스트
□ HTML 파일 접속 확인
□ 버튼 클릭 시 리다이렉트 확인
□ URL 변경 확인
□ 콘솔 로그 출력 확인
```

---

## 마무리 🎓

### 핵심 개념 정리

1. **POST 방식**: 민감 데이터, 상태 변경에 사용
2. **MVC 패턴**: View(HTML) → Controller(Servlet) → Model(Service)
3. **Servlet 생명주기**: 초기화(1회) → 서비스(요청마다) → 소멸(1회)
4. **Tomcat**: Servlet Container + HTTP 서버
5. **Spring Boot**: 자동 설정 + 임베디드 Tomcat
6. **sendRedirect()**: 브라우저에게 다른 URL 요청 지시 (302 응답)
7. **forward() vs sendRedirect()**: 서버 내부 vs 클라이언트 리다이렉트

### 다음 학습 주제

- Session & Cookie
- Filter & Interceptor
- REST API 설계
- Spring MVC (@Controller, @RequestMapping)
- JPA/Hibernate (ORM)
- Spring Security (인증/인가)

---

**작성일**: 2025년 10월 22일  
**프로젝트**: Spring Boot + Servlet 학습  
**목적**: EX11_response 예제 이해 및 실무 적용
