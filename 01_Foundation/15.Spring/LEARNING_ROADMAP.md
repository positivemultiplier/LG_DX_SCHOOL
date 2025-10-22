# Spring 학습 로드맵 및 실습 계획

## 🎯 학습 목표
- Servlet/JSP 기초 완벽 이해
- Spring Framework 핵심 개념 습득
- Spring Boot로 실전 프로젝트 구현

---

## 📅 4주 완성 로드맵

### Week 1: 웹 개발 기초 & Servlet
**목표:** 웹 동작 원리와 Servlet 기초 완성

#### Day 1-2: 웹 기본 개념
- [ ] HTTP 프로토콜 이해
  - 요청/응답 구조
  - 상태 코드 (200, 404, 500)
  - 헤더와 바디
- [ ] 클라이언트-서버 아키텍처
- [ ] Tomcat 설치 및 실행

**실습:**
```bash
# Tomcat 시작
cd demo
mvn spring-boot:run

# 브라우저 테스트
http://localhost:8090
```

#### Day 3-4: Servlet 기초
- [ ] Servlet이란?
- [ ] Servlet 생명주기
- [ ] `@WebServlet` 어노테이션
- [ ] HttpServletRequest/Response

**실습: EX02_get.java**
```java
@WebServlet("/Ex02_get")
public class EX02_get extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        String data = req.getParameter("data");
        // 처리 로직
    }
}
```

#### Day 5-7: 파라미터 처리
- [ ] GET vs POST
- [ ] 다양한 파라미터 타입
- [ ] 한글 인코딩 처리

**실습: EX03_plus.java, EX04_getPost.java**
```java
// 숫자 파라미터
int num1 = Integer.parseInt(req.getParameter("num1"));

// POST 한글 처리
req.setCharacterEncoding("UTF-8");
```

**주간 과제:**
- 간단한 계산기 만들기 (사칙연산)
- 로그인 폼 만들기 (ID/PW 검증)

---

### Week 2: 고급 Servlet & JSP
**목표:** 복잡한 폼 처리와 JSP 활용

#### Day 1-3: 복합 폼 데이터
- [ ] 체크박스 처리 (`getParameterValues`)
- [ ] 라디오 버튼
- [ ] 셀렉트 박스
- [ ] 파일 업로드

**실습: EX05_userInfo.java**
```java
// 체크박스 (다중 선택)
String[] hobbies = req.getParameterValues("hobby");

// 라디오 (단일 선택)
String gender = req.getParameter("gender");
```

#### Day 4-5: JSP 기초
- [ ] JSP 문법 (스크립틀릿, 표현식, 선언부)
- [ ] JSP 내장 객체 (request, response, session)
- [ ] EL (Expression Language)
- [ ] JSTL (JSP Standard Tag Library)

**실습:**
```jsp
<%-- 스크립틀릿 --%>
<% String name = request.getParameter("name"); %>

<%-- 표현식 --%>
<h1>Hello, <%= name %></h1>

<%-- EL --%>
<h1>Hello, ${param.name}</h1>

<%-- JSTL --%>
<c:if test="${not empty user}">
    Welcome, ${user.name}
</c:if>
```

#### Day 6-7: 세션과 쿠키
- [ ] 상태 유지 방법
- [ ] HttpSession 사용
- [ ] Cookie 생성/읽기
- [ ] 세션 타임아웃

**실습: 로그인 세션 관리**
```java
// 로그인 시
HttpSession session = req.getSession();
session.setAttribute("userId", userId);

// 로그인 확인
String userId = (String) session.getAttribute("userId");
if (userId == null) {
    resp.sendRedirect("/login.html");
}

// 로그아웃
session.invalidate();
```

**주간 과제:**
- 회원가입 + 로그인 + 로그아웃 기능
- 장바구니 기능 (세션 활용)

---

### Week 3: Spring Framework 입문
**목표:** Spring 핵심 개념 이해

#### Day 1-2: Spring 개요
- [ ] Spring Framework란?
- [ ] IoC (Inversion of Control)
- [ ] DI (Dependency Injection)
- [ ] Spring Container

**이론:**
```java
// 전통적인 방식 (개발자가 직접 생성)
UserService userService = new UserService();
UserRepository userRepository = new UserRepository();
userService.setRepository(userRepository);

// Spring 방식 (컨테이너가 주입)
@Autowired
private UserService userService;  // 자동 주입!
```

#### Day 3-4: Spring Bean
- [ ] Bean 등록 방법
- [ ] `@Component`, `@Service`, `@Repository`
- [ ] Bean 스코프 (singleton, prototype)
- [ ] Bean 생명주기

**실습:**
```java
@Component
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public User findUser(Long id) {
        return userRepository.findById(id);
    }
}
```

#### Day 5-7: Spring MVC
- [ ] MVC 패턴 이해
- [ ] DispatcherServlet
- [ ] `@Controller` vs `@RestController`
- [ ] `@RequestMapping`, `@GetMapping`, `@PostMapping`
- [ ] Model, ModelAndView
- [ ] View Resolver

**실습: Controller 작성**
```java
@Controller
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // GET 요청
    @GetMapping("/users")
    public String list(Model model) {
        List<User> users = userService.findAll();
        model.addAttribute("users", users);
        return "user/list";  // user/list.jsp
    }
    
    // POST 요청
    @PostMapping("/users")
    public String create(@ModelAttribute User user) {
        userService.save(user);
        return "redirect:/users";
    }
}
```

**주간 과제:**
- Servlet → Spring Controller 변환
- CRUD 게시판 만들기 (메모리 저장)

---

### Week 4: Spring Boot 실전
**목표:** 실무 프로젝트 완성

#### Day 1-2: Spring Boot 기초
- [ ] Spring Boot란?
- [ ] Auto Configuration
- [ ] `@SpringBootApplication`
- [ ] application.properties 설정
- [ ] 내장 Tomcat

**실습:**
```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

```properties
# application.properties
server.port=8090
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=update
```

#### Day 3-4: 데이터베이스 연동
- [ ] JPA/Hibernate
- [ ] Entity 클래스
- [ ] Repository 인터페이스
- [ ] CRUD 메서드

**실습:**
```java
// Entity
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
}

// Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByName(String name);
    Optional<User> findByEmail(String email);
}

// Service
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public User save(User user) {
        return userRepository.save(user);
    }
}
```

#### Day 5-6: RESTful API
- [ ] REST 원칙
- [ ] JSON 응답
- [ ] `@RestController`
- [ ] `@PathVariable`, `@RequestBody`
- [ ] HTTP 상태 코드

**실습:**
```java
@RestController
@RequestMapping("/api/users")
public class UserApiController {
    
    @Autowired
    private UserService userService;
    
    // GET /api/users
    @GetMapping
    public List<User> list() {
        return userService.findAll();
    }
    
    // GET /api/users/1
    @GetMapping("/{id}")
    public ResponseEntity<User> get(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // POST /api/users
    @PostMapping
    public User create(@RequestBody User user) {
        return userService.save(user);
    }
    
    // PUT /api/users/1
    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        return userService.save(user);
    }
    
    // DELETE /api/users/1
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        userService.deleteById(id);
    }
}
```

#### Day 7: 최종 프로젝트
- [ ] 프로젝트 설계
- [ ] 기능 구현
- [ ] 테스트
- [ ] 배포

**최종 과제: 미니 블로그**
- 회원가입/로그인 (Spring Security)
- 게시글 CRUD (JPA)
- 댓글 기능
- 페이징 처리
- 파일 업로드
- RESTful API

---

## 📋 일일 학습 체크리스트

### 매일 해야 할 것
- [ ] 새로운 개념 학습 (1-2시간)
- [ ] 실습 코드 작성 (2-3시간)
- [ ] 에러 해결 및 디버깅
- [ ] 학습 노트 정리

### 주간 회고
```markdown
## Week X 회고

### 배운 내용
- 

### 어려웠던 점
- 

### 해결 방법
- 

### 다음 주 계획
- 
```

---

## 🎓 추천 학습 자료

### 온라인 강의
1. **인프런**
   - 스프링 입문 - 코드로 배우는 스프링 부트, 웹 MVC, DB 접근 기술
   - 스프링 핵심 원리 - 기본편
   - 실전! 스프링 부트와 JPA 활용

2. **Udemy**
   - Spring Framework 5: Beginner to Guru
   - Spring Boot Complete Guide

### 책
1. **입문**
   - "스프링 부트 시작하기" (김인우)
   - "스프링 부트 핵심 가이드" (장정우)

2. **심화**
   - "토비의 스프링 3.1" (이일민)
   - "스프링 인 액션" (크레이그 월즈)

### 공식 문서
- [Spring Boot Reference](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Framework Documentation](https://docs.spring.io/spring-framework/reference/)

### 커뮤니티
- [Stack Overflow - Spring](https://stackoverflow.com/questions/tagged/spring)
- [Baeldung Spring Tutorials](https://www.baeldung.com/spring-tutorial)

---

## 💻 실습 프로젝트 아이디어

### 초급 (Week 1-2)
1. **계산기**: 사칙연산, 이력 저장
2. **방명록**: 글 작성/조회
3. **설문조사**: 투표 및 결과 표시
4. **BMI 계산기**: 키/몸무게 입력

### 중급 (Week 3)
1. **게시판**: CRUD, 페이징
2. **투두리스트**: 할 일 관리
3. **주소록**: 연락처 관리
4. **간단한 쇼핑몰**: 상품 목록/장바구니

### 고급 (Week 4)
1. **블로그**: 회원/게시글/댓글
2. **예약 시스템**: 날짜/시간 선택
3. **채팅 앱**: WebSocket 활용
4. **SNS**: 팔로우/피드/좋아요

---

## 🔍 학습 팁

### 1. 코드 타이핑
- 복사/붙여넣기 금지
- 직접 타이핑하며 이해

### 2. 에러 해결
- 에러 메시지 정확히 읽기
- 구글 검색 (영어 키워드)
- Stack Overflow 활용

### 3. 실습 위주
- 이론 30% : 실습 70%
- 작은 프로젝트 많이 만들기

### 4. 코드 리뷰
- 내 코드 개선점 찾기
- 다른 사람 코드 분석

### 5. 버전 관리
```bash
# Git으로 학습 이력 관리
git init
git add .
git commit -m "Week1: Servlet 기초 완료"
```

---

## ⚡ 빠른 참조

### 자주 쓰는 명령어

```powershell
# Maven 빌드
mvn clean install

# Spring Boot 실행
mvn spring-boot:run

# 포트 확인
netstat -ano | findstr :8090

# 프로세스 종료
taskkill /F /PID <PID>
```

### 자주 쓰는 어노테이션

```java
// Spring Core
@Component        // 일반 컴포넌트
@Service          // 비즈니스 로직
@Repository       // 데이터 액세스
@Configuration    // 설정 클래스
@Autowired        // 의존성 주입

// Spring MVC
@Controller       // 뷰 반환
@RestController   // JSON 반환
@RequestMapping   // URL 매핑
@GetMapping       // GET 요청
@PostMapping      // POST 요청

// JPA
@Entity           // 엔티티 클래스
@Table            // 테이블 매핑
@Id               // 기본키
@GeneratedValue   // 자동 생성
@Column           // 컬럼 매핑
```

---

**시작일:** 2025-10-22  
**목표 완료일:** 2025-11-19 (4주 후)  
**위치:** `c:\Users\lgdx\LG_DX_School\01_Foundation\15.Spring`

화이팅! 꾸준히 하면 반드시 마스터할 수 있습니다! 💪
