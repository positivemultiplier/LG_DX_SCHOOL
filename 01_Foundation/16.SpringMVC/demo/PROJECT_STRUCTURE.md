# Spring MVC 프로젝트 구조 가이드 📂

## 프로젝트 구조 (이클립스 방식)

```
demo/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/
│   │   │       ├── controller/      # Controller Layer (요청 처리)
│   │   │       │   └── HomeController.java
│   │   │       ├── service/         # Service Layer (비즈니스 로직)
│   │   │       │   └── (추후 추가)
│   │   │       ├── dao/             # DAO Layer (데이터베이스 접근)
│   │   │       │   └── (추후 추가)
│   │   │       └── vo/              # Value Object (데이터 객체)
│   │   │           └── UserVO.java
│   │   ├── resources/               # 설정 파일, properties
│   │   └── webapp/
│   │       ├── index.jsp            # 기본 index 페이지
│   │       ├── WEB-INF/
│   │       │   ├── web.xml          # 웹 애플리케이션 설정
│   │       │   ├── spring/
│   │       │   │   └── dispatcher-servlet.xml  # Spring MVC 설정
│   │       │   └── views/           # JSP View 파일
│   │       │       ├── home.jsp
│   │       │       ├── hello.jsp
│   │       │       └── error/
│   │       │           ├── 404.jsp
│   │       │           └── 500.jsp
│   │       └── resources/           # 정적 리소스
│   │           ├── css/
│   │           │   └── style.css
│   │           ├── js/
│   │           └── images/
│   └── test/
│       └── java/
│           └── com/example/         # 테스트 코드
└── pom.xml                          # Maven 설정
```

## 각 폴더의 역할

### 1. **controller/** - Controller Layer
```
역할: HTTP 요청을 받아서 처리하고 응답 결정
책임:
  - URL 매핑 (@RequestMapping, @GetMapping, @PostMapping)
  - 요청 파라미터 받기
  - Service Layer 호출
  - Model에 데이터 담기
  - View 이름 반환 (forward) 또는 redirect
  
어노테이션:
  @Controller        - 이 클래스가 Controller임을 표시
  @RequestMapping    - 클래스/메서드 레벨 URL 매핑
  @GetMapping        - GET 요청 처리
  @PostMapping       - POST 요청 처리
  @RequestParam      - 요청 파라미터 받기
  @PathVariable      - URL 경로 변수 받기
  @ModelAttribute    - 객체로 파라미터 받기
```

### 2. **service/** - Service Layer
```
역할: 비즈니스 로직 처리
책임:
  - 트랜잭션 관리
  - 복잡한 비즈니스 규칙 구현
  - 여러 DAO 조합
  - 계산, 검증, 데이터 가공
  
어노테이션:
  @Service           - 이 클래스가 Service임을 표시
  @Transactional     - 트랜잭션 관리
  @Autowired         - 의존성 주입
```

### 3. **dao/** - DAO (Data Access Object) Layer
```
역할: 데이터베이스 접근
책임:
  - SQL 실행
  - CRUD 작업 (Create, Read, Update, Delete)
  - JdbcTemplate 또는 MyBatis 사용
  
어노테이션:
  @Repository        - 이 클래스가 DAO임을 표시
  @Autowired         - JdbcTemplate 주입
```

### 4. **vo/** - Value Object (또는 DTO)
```
역할: 데이터를 담는 객체
책임:
  - 데이터 전달
  - Getter/Setter 제공
  
Lombok 어노테이션:
  @Data              - Getter, Setter, toString, equals, hashCode 자동 생성
  @NoArgsConstructor - 기본 생성자
  @AllArgsConstructor- 모든 필드 생성자
  @Getter            - Getter만 생성
  @Setter            - Setter만 생성
```

### 5. **webapp/WEB-INF/views/** - JSP View 파일
```
역할: 사용자에게 보여지는 화면
책임:
  - HTML 생성
  - JSTL/EL로 데이터 표시
  - CSS/JS 적용
  
참고:
  - /WEB-INF/ 안의 파일은 직접 접근 불가
  - Controller를 거쳐야만 접근 가능 (보안)
```

### 6. **webapp/resources/** - 정적 리소스
```
역할: CSS, JavaScript, 이미지 등 정적 파일
책임:
  - 스타일링 (CSS)
  - 클라이언트 사이드 로직 (JavaScript)
  - 이미지, 폰트 등
  
참고:
  - 직접 접근 가능 (브라우저에서 바로 요청)
  - dispatcher-servlet.xml에서 <mvc:resources> 설정 필요
```

## MVC 패턴 흐름

```
[브라우저]
   ↓ HTTP Request (GET /hello)
[DispatcherServlet] (Front Controller)
   ↓ URL 매핑 검색
[HandlerMapping]
   ↓ @GetMapping("/hello") 찾음
[Controller] (HomeController)
   ↓ 1. 요청 처리
   ↓ 2. Service 호출 (비즈니스 로직)
   ↓ 3. Model에 데이터 추가
   ↓ 4. View 이름 반환 ("hello")
[ViewResolver]
   ↓ "hello" → "/WEB-INF/views/hello.jsp"
[JSP View]
   ↓ HTML 생성
[DispatcherServlet]
   ↓ HTTP Response (HTML)
[브라우저]
   ✅ 화면 표시
```

## 설정 파일

### web.xml
```xml
역할:
  - 웹 애플리케이션 전체 설정
  - DispatcherServlet 등록
  - 필터 설정 (인코딩 등)
  - 에러 페이지 매핑
  
위치: src/main/webapp/WEB-INF/web.xml
```

### dispatcher-servlet.xml
```xml
역할:
  - Spring MVC 설정
  - Component Scan (어노테이션 스캔)
  - ViewResolver 설정
  - 정적 리소스 매핑
  - 데이터베이스 설정 (선택)
  
위치: src/main/webapp/WEB-INF/spring/dispatcher-servlet.xml
```

### pom.xml
```xml
역할:
  - Maven 프로젝트 설정
  - 의존성 관리 (라이브러리)
  - 빌드 설정
  - 플러그인 설정
  
위치: 프로젝트 루트/pom.xml
```

## 실행 방법

### 1. Maven 컴파일
```powershell
cd c:\Users\lgdx\LG_DX_School\01_Foundation\16.SpringMVC\demo
mvn clean compile
```

### 2. WAR 파일 생성
```powershell
mvn package
# target/demo.war 생성됨
```

### 3. Tomcat 배포
```
방법 1: 수동 배포
  1. target/demo.war 복사
  2. Tomcat의 webapps/ 폴더에 붙여넣기
  3. Tomcat 시작 (startup.bat 또는 startup.sh)
  4. http://localhost:8080/demo/ 접속

방법 2: Eclipse 통합 실행
  1. Server 탭에서 Tomcat 추가
  2. 프로젝트 우클릭 → Run As → Run on Server
  3. http://localhost:8080/demo/ 접속

방법 3: Maven Tomcat 플러그인 (추천)
  mvn tomcat7:run
  http://localhost:8080/demo/ 접속
```

## 다음 학습 단계

### 단계 1: 기본 CRUD
- [ ] UserController 작성
- [ ] UserService 작성
- [ ] UserDAO 작성
- [ ] 사용자 목록 조회
- [ ] 사용자 추가/수정/삭제

### 단계 2: 폼 처리
- [ ] 회원가입 폼 만들기
- [ ] @ModelAttribute로 데이터 받기
- [ ] 유효성 검증 (@Valid, @NotNull 등)
- [ ] 에러 메시지 표시

### 단계 3: 데이터베이스 연동
- [ ] DataSource 설정
- [ ] JdbcTemplate 사용
- [ ] 트랜잭션 관리
- [ ] 커넥션 풀 설정

### 단계 4: REST API
- [ ] @RestController 사용
- [ ] JSON 응답 (@ResponseBody)
- [ ] AJAX 연동
- [ ] RESTful URL 설계

## 참고 자료

### Spring MVC 주요 어노테이션
```
@Controller          - Controller 클래스
@Service             - Service 클래스
@Repository          - DAO 클래스
@Component           - 일반 Bean
@Autowired           - 의존성 주입
@RequestMapping      - URL 매핑
@GetMapping          - GET 요청
@PostMapping         - POST 요청
@RequestParam        - 요청 파라미터
@PathVariable        - URL 경로 변수
@ModelAttribute      - 모델 데이터
@ResponseBody        - JSON/XML 응답
@RestController      - REST API Controller
```

### JSTL 태그
```jsp
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<c:out value="${변수}" />           - 변수 출력
<c:if test="${조건}">...</c:if>      - 조건문
<c:forEach items="${list}" var="item">  - 반복문
<c:url value="/path" />             - URL 생성
<c:set var="변수" value="값" />      - 변수 설정
```

### EL (Expression Language)
```jsp
${변수}                    - 변수 출력
${객체.속성}               - 속성 접근
${list[0]}                - 배열/리스트 접근
${map['key']}             - Map 접근
${empty 변수}             - null/빈값 체크
${변수 == '값'}           - 비교 연산
```

---

**작성일**: 2025년 10월 23일  
**프로젝트**: Spring MVC 학습  
**목적**: 이클립스 방식 Spring MVC 프로젝트 구조 학습
