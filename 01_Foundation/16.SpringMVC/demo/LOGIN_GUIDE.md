# 로그인 기능 실행 가이드 🔐

## 완성된 파일 목록

```
✅ LoginController.java           - 로그인 요청 처리
✅ login.jsp                       - 로그인 폼
✅ loginSuccess.jsp                - 로그인 성공 페이지
✅ loginFail.jsp                   - 로그인 실패 페이지
✅ home.jsp (수정)                 - 로그인 링크 추가
```

## 📁 파일 위치

```
demo/
├── src/main/java/com/example/controller/
│   └── LoginController.java       ✅
└── src/main/webapp/WEB-INF/views/
    ├── login.jsp                   ✅
    ├── loginSuccess.jsp            ✅
    └── loginFail.jsp               ✅
```

## 🔄 동작 흐름

```
1. 사용자가 http://localhost:8080/demo/login 접속
   ↓
2. LoginController.loginForm() 실행
   ↓ return "login"
3. ViewResolver가 /WEB-INF/views/login.jsp 찾아서 표시
   ↓
4. 사용자가 ID/PW 입력 후 "로그인" 버튼 클릭
   ↓ POST /loginProgram
5. LoginController.loginProcess() 실행
   ↓ ID/PW 검증
6-A. 성공: return "loginSuccess" → loginSuccess.jsp
6-B. 실패: return "loginFail" → loginFail.jsp
```

## 💻 LoginController.java 코드 설명

```java
@Controller
public class LoginController {
    
    // GET /login → 로그인 폼 표시
    @GetMapping("/login")
    public String loginForm() {
        return "login";
    }
    
    // POST /loginProgram → 로그인 처리
    @PostMapping("/loginProgram")
    public String loginProcess(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            Model model) {
        
        // 검증 (실제로는 DB 조회)
        if ("admin".equals(username) && "1234".equals(password)) {
            model.addAttribute("username", username);
            return "loginSuccess";  // 성공
        } else {
            model.addAttribute("errorMessage", 
                "아이디 또는 비밀번호가 올바르지 않습니다.");
            return "loginFail";     // 실패
        }
    }
}
```

### 주요 어노테이션

| 어노테이션 | 설명 |
|-----------|------|
| `@Controller` | 이 클래스가 Controller임을 Spring에게 알림 |
| `@GetMapping("/login")` | GET 방식 /login 요청 처리 |
| `@PostMapping("/loginProgram")` | POST 방식 /loginProgram 요청 처리 |
| `@RequestParam("username")` | 폼 파라미터 username 값을 변수에 주입 |
| `Model model` | View에 데이터 전달하는 객체 |

## 📄 login.jsp 수정 사항

### 수정 전
```jsp
<form action="/loginProgram" method="post">
```

### 수정 후
```jsp
<form action="${pageContext.request.contextPath}/loginProgram" method="post">
```

**이유:**
- `/loginProgram`만 쓰면 루트 경로로 인식 (http://localhost:8080/loginProgram)
- 컨텍스트 경로(/demo)가 빠져서 404 에러 발생
- `${pageContext.request.contextPath}`를 붙여야 정상 동작 (http://localhost:8080/demo/loginProgram)

## 🚀 실행 방법

### 1. 프로젝트 빌드
```powershell
cd c:\Users\lgdx\LG_DX_School\01_Foundation\16.SpringMVC\demo
mvn clean package
```

### 2. Tomcat 배포

#### 방법 A: 수동 배포
1. `target/demo.war` 파일 복사
2. Tomcat의 `webapps/` 폴더에 붙여넣기
3. Tomcat 시작: `bin/startup.bat` (Windows) 또는 `bin/startup.sh` (Linux/Mac)
4. 브라우저에서 접속

#### 방법 B: Eclipse 통합
1. Eclipse에서 Server 탭 열기
2. Tomcat 서버 추가 (없으면)
3. 프로젝트 우클릭 → Run As → Run on Server
4. 브라우저에서 접속

#### 방법 C: Maven Tomcat 플러그인 (추천)
pom.xml에 플러그인 추가 후:
```powershell
mvn tomcat7:run
```

### 3. 접속 URL

```
메인 페이지:     http://localhost:8080/demo/
로그인 페이지:   http://localhost:8080/demo/login
```

## 🧪 테스트 계정

| ID | 비밀번호 | 결과 |
|----|---------|------|
| admin | 1234 | ✅ 로그인 성공 |
| user | password | ❌ 로그인 실패 |
| test | test | ❌ 로그인 실패 |

## 🎨 화면 구성

### login.jsp
- 초록색 테두리의 예쁜 폼
- 사용자 이름, 비밀번호 입력 필드
- 로그인 버튼 (초록색)

### loginSuccess.jsp
- 보라색 그라데이션 배경
- ✅ 체크 아이콘
- 환영 메시지
- 사용자 정보 박스 (이름, 로그인 시간)
- "홈으로 이동" 버튼

### loginFail.jsp
- 주황색 그라데이션 배경
- ❌ X 아이콘
- 에러 메시지
- "다시 로그인" 버튼
- "홈으로 이동" 버튼
- 💡 힌트 박스 (테스트 계정 안내)

## 🔧 디버깅 팁

### 1. 404 에러 (페이지를 찾을 수 없음)
```
증상: /login 접속 시 404
원인:
  1. Tomcat이 실행 중이 아님
  2. WAR 배포 안 됨
  3. URL 경로 오타

해결:
  ✅ Tomcat 실행 확인
  ✅ webapps/demo/ 폴더 존재 확인
  ✅ URL 정확히 입력: http://localhost:8080/demo/login
```

### 2. 405 에러 (Method Not Allowed)
```
증상: "HTTP method GET is not supported"
원인: GET 요청인데 @PostMapping만 있음

해결:
  ✅ @GetMapping 메서드 추가
  ✅ 폼 method="post" 확인
```

### 3. 로그인 버튼 눌러도 반응 없음
```
증상: 버튼 클릭 시 아무 일도 안 일어남
원인:
  1. form action 경로 오류
  2. Controller 매핑 오류

해결:
  ✅ form action="${pageContext.request.contextPath}/loginProgram"
  ✅ @PostMapping("/loginProgram") 존재 확인
```

### 4. 한글 깨짐
```
증상: 한글이 "???" 또는 깨진 문자로 표시
원인: 인코딩 설정 누락

해결:
  ✅ web.xml에 CharacterEncodingFilter 있는지 확인 (이미 추가됨)
  ✅ JSP 상단에 charset=UTF-8 확인 (이미 있음)
```

### 5. 서버 콘솔 로그 확인
```java
// LoginController에 System.out.println 추가되어 있음
System.out.println("🔑 로그인 페이지 요청됨");
System.out.println("📌 사용자 이름: " + username);
System.out.println("✅ 로그인 성공!");
```

콘솔에서 위 메시지 출력 확인 → Controller가 정상 실행되는 것

## 📚 다음 학습 단계

### 1단계: 실제 DB 연동
현재는 하드코딩된 ID/PW 검증. 실제로는:
```java
@Service
public class UserService {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public User findByUsername(String username) {
        String sql = "SELECT * FROM users WHERE username = ?";
        return jdbcTemplate.queryForObject(sql, 
            new BeanPropertyRowMapper<>(User.class), username);
    }
}
```

### 2단계: 세션 관리
로그인 상태 유지:
```java
@PostMapping("/loginProgram")
public String loginProcess(..., HttpSession session) {
    if (로그인 성공) {
        session.setAttribute("user", username);  // 세션에 저장
        return "loginSuccess";
    }
}
```

### 3단계: 비밀번호 암호화
```java
// Spring Security의 BCryptPasswordEncoder 사용
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String hashedPassword = encoder.encode("1234");
boolean matches = encoder.matches("1234", hashedPassword);
```

### 4단계: 로그아웃 기능
```java
@GetMapping("/logout")
public String logout(HttpSession session) {
    session.invalidate();  // 세션 무효화
    return "redirect:/login";
}
```

### 5단계: 인증 필터
로그인 안 한 사용자는 특정 페이지 접근 차단:
```java
public class AuthFilter implements Filter {
    public void doFilter(...) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            response.sendRedirect("/login");
            return;
        }
        chain.doFilter(request, response);
    }
}
```

## 🎯 핵심 정리

1. **Controller**: `@GetMapping`, `@PostMapping`으로 URL 매핑
2. **View**: JSP는 `/WEB-INF/views/` 폴더에 위치
3. **Model**: `model.addAttribute()`로 View에 데이터 전달
4. **Form**: `action="${pageContext.request.contextPath}/경로"` 필수
5. **RequestParam**: `@RequestParam`으로 폼 데이터 받기

---

**작성일**: 2025년 10월 23일  
**기능**: 로그인 폼 + 성공/실패 처리  
**테스트 계정**: admin / 1234
