# Tomcat 완전 정복 가이드

## 📚 목차
1. [Tomcat이란?](#tomcat이란)
2. [아키텍처](#아키텍처)
3. [설치 및 설정](#설치-및-설정)
4. [디렉토리 구조](#디렉토리-구조)
5. [생명주기](#생명주기)
6. [설정 파일](#설정-파일)
7. [실전 활용](#실전-활용)

---

## 🔥 Tomcat이란?

### 정의
**Apache Tomcat**은 Java Servlet과 JSP를 실행할 수 있는 오픈소스 웹 애플리케이션 서버(WAS)입니다.

### 주요 특징
- ✅ **Servlet Container**: Servlet의 생명주기 관리
- ✅ **JSP Engine**: JSP 파일을 Servlet으로 변환
- ✅ **경량**: 순수 Java로 구현된 경량 서버
- ✅ **무료**: Apache 라이선스 (오픈소스)

### WAS vs Web Server

| 구분 | Web Server | WAS (Tomcat) |
|------|------------|--------------|
| 역할 | 정적 콘텐츠 제공 | 동적 콘텐츠 생성 |
| 처리 | HTML, CSS, JS, 이미지 | Servlet, JSP 실행 |
| 예시 | Apache HTTP, Nginx | Tomcat, WebLogic, JBoss |
| 속도 | 빠름 | 상대적으로 느림 |

**일반적인 구성:**
```
클라이언트 → Web Server (Nginx/Apache) → WAS (Tomcat) → DB
              ↓ 정적파일
              ↓ 동적요청 전달 →
```

---

## 🏗️ 아키텍처

### Tomcat의 핵심 컴포넌트

```
Server (서버 인스턴스)
  └─ Service
      ├─ Connector (포트 리스닝)
      │   ├─ HTTP Connector (8080)
      │   ├─ HTTPS Connector (8443)
      │   └─ AJP Connector (8009)
      │
      └─ Engine (요청 처리 엔진)
          └─ Host (가상 호스트)
              └─ Context (웹 애플리케이션)
                  └─ Wrapper (개별 Servlet)
```

### 각 컴포넌트 설명

#### 1. Server
- Tomcat 인스턴스 전체
- 하나의 JVM에서 실행
- 여러 Service를 포함 가능

#### 2. Service
- Connector와 Engine을 묶는 단위
- 보통 하나의 Service 사용 (Catalina)

#### 3. Connector
- 클라이언트 요청을 받는 포트
- HTTP/HTTPS/AJP 프로토콜 지원

```xml
<!-- server.xml -->
<Connector port="8080" protocol="HTTP/1.1"
           connectionTimeout="20000"
           redirectPort="8443" />
```

#### 4. Engine
- 모든 요청 처리의 진입점
- 적절한 Host로 라우팅

#### 5. Host
- 가상 호스트 (도메인 단위)
- 하나의 Tomcat에 여러 도메인 운영 가능

```xml
<Host name="localhost" appBase="webapps" />
<Host name="example.com" appBase="example-webapps" />
```

#### 6. Context
- 웹 애플리케이션 단위
- URL 경로와 매핑

```xml
<Context path="/myapp" docBase="myapp.war" />
```

#### 7. Wrapper
- 개별 Servlet을 감싸는 컴포넌트
- Servlet의 생명주기 관리

---

## 📦 설치 및 설정

### 1. 독립 실행형 Tomcat 설치

#### Windows
```powershell
# 1. 다운로드
https://tomcat.apache.org/download-90.cgi

# 2. 압축 해제
C:\Program Files\Apache Tomcat 9.0

# 3. 환경변수 설정
CATALINA_HOME = C:\Program Files\Apache Tomcat 9.0

# 4. 시작
cd %CATALINA_HOME%\bin
startup.bat

# 5. 중지
shutdown.bat
```

#### Linux
```bash
# 1. 다운로드 및 압축 해제
wget https://dlcdn.apache.org/tomcat/tomcat-9/v9.0.x/bin/apache-tomcat-9.0.x.tar.gz
tar -xzf apache-tomcat-9.0.x.tar.gz
mv apache-tomcat-9.0.x /opt/tomcat

# 2. 환경변수
export CATALINA_HOME=/opt/tomcat

# 3. 시작
$CATALINA_HOME/bin/startup.sh

# 4. 중지
$CATALINA_HOME/bin/shutdown.sh
```

### 2. Spring Boot 내장 Tomcat

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <!-- 내장 Tomcat 자동 포함 -->
</dependency>
```

**장점:**
- 별도 설치 불필요
- JAR 파일 하나로 실행
- 설정 간소화

**실행:**
```powershell
mvn spring-boot:run
# 또는
java -jar app.jar
```

---

## 📁 디렉토리 구조

### 독립 실행형 Tomcat

```
apache-tomcat-9.0.x/
├── bin/                  # 실행 스크립트
│   ├── startup.sh/bat   # 시작
│   ├── shutdown.sh/bat  # 종료
│   └── catalina.sh/bat  # 메인 스크립트
│
├── conf/                 # 설정 파일
│   ├── server.xml       # 서버 메인 설정
│   ├── web.xml          # 전역 웹 앱 설정
│   ├── context.xml      # Context 기본 설정
│   ├── tomcat-users.xml # 사용자 관리
│   └── logging.properties
│
├── lib/                  # Tomcat 라이브러리
│   └── *.jar
│
├── logs/                 # 로그 파일
│   ├── catalina.out     # 표준 출력
│   ├── localhost.log    # Host 로그
│   └── access.log       # 접근 로그
│
├── temp/                 # 임시 파일
│
├── webapps/              # 웹 애플리케이션 배포
│   ├── ROOT/            # 기본 앱 (/)
│   ├── manager/         # 관리자 콘솔
│   ├── examples/        # 예제
│   └── myapp/           # 사용자 앱
│       ├── WEB-INF/
│       │   ├── web.xml
│       │   ├── classes/
│       │   └── lib/
│       ├── META-INF/
│       └── index.html
│
└── work/                 # JSP 컴파일 결과
```

### 웹 애플리케이션 구조

```
myapp/
├── WEB-INF/              # 외부 접근 불가 (보안 영역)
│   ├── web.xml          # 배포 서술자 (Deployment Descriptor)
│   ├── classes/         # 컴파일된 .class 파일
│   │   └── com/example/*.class
│   └── lib/             # JAR 라이브러리
│       └── *.jar
│
├── META-INF/
│   └── MANIFEST.MF
│
├── index.html           # 정적 리소스 (외부 접근 가능)
├── css/
├── js/
└── images/
```

---

## ⚙️ 설정 파일

### 1. server.xml (핵심 설정)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Server port="8005" shutdown="SHUTDOWN">
  
  <!-- 서비스 정의 -->
  <Service name="Catalina">
    
    <!-- HTTP Connector -->
    <Connector port="8080" 
               protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443"
               maxThreads="200"
               minSpareThreads="10"
               acceptCount="100" />
    
    <!-- HTTPS Connector (SSL) -->
    <Connector port="8443" 
               protocol="org.apache.coyote.http11.Http11NioProtocol"
               maxThreads="150" 
               SSLEnabled="true">
      <SSLHostConfig>
        <Certificate certificateKeystoreFile="conf/keystore.jks"
                     certificateKeystorePassword="password" />
      </SSLHostConfig>
    </Connector>
    
    <!-- Engine -->
    <Engine name="Catalina" defaultHost="localhost">
      
      <!-- Host -->
      <Host name="localhost" 
            appBase="webapps"
            unpackWARs="true" 
            autoDeploy="true">
        
        <!-- Access Log -->
        <Valve className="org.apache.catalina.valves.AccessLogValve"
               directory="logs"
               prefix="localhost_access_log" 
               suffix=".txt"
               pattern="%h %l %u %t &quot;%r&quot; %s %b" />
        
      </Host>
    </Engine>
  </Service>
</Server>
```

**주요 속성:**

| 속성 | 설명 | 기본값 |
|------|------|--------|
| port | 포트 번호 | 8080 |
| maxThreads | 최대 동시 처리 스레드 | 200 |
| minSpareThreads | 최소 유지 스레드 | 10 |
| connectionTimeout | 연결 타임아웃 (ms) | 20000 |
| acceptCount | 대기 큐 크기 | 100 |

### 2. web.xml (웹 애플리케이션 설정)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         version="4.0">
  
  <!-- 웹 앱 이름 -->
  <display-name>My Application</display-name>
  
  <!-- 서블릿 정의 -->
  <servlet>
    <servlet-name>HelloServlet</servlet-name>
    <servlet-class>com.example.HelloServlet</servlet-class>
    <load-on-startup>1</load-on-startup>
  </servlet>
  
  <!-- 서블릿 매핑 -->
  <servlet-mapping>
    <servlet-name>HelloServlet</servlet-name>
    <url-pattern>/hello</url-pattern>
  </servlet-mapping>
  
  <!-- 필터 정의 -->
  <filter>
    <filter-name>EncodingFilter</filter-name>
    <filter-class>com.example.EncodingFilter</filter-class>
    <init-param>
      <param-name>encoding</param-name>
      <param-value>UTF-8</param-value>
    </init-param>
  </filter>
  
  <filter-mapping>
    <filter-name>EncodingFilter</filter-name>
    <url-pattern>/*</url-pattern>
  </filter-mapping>
  
  <!-- 세션 타임아웃 (분) -->
  <session-config>
    <session-timeout>30</session-timeout>
  </session-config>
  
  <!-- 에러 페이지 -->
  <error-page>
    <error-code>404</error-code>
    <location>/error/404.html</location>
  </error-page>
  
  <error-page>
    <error-code>500</error-code>
    <location>/error/500.html</location>
  </error-page>
  
  <!-- Welcome 파일 -->
  <welcome-file-list>
    <welcome-file>index.html</welcome-file>
    <welcome-file>index.jsp</welcome-file>
  </welcome-file-list>
  
</web-app>
```

### 3. context.xml (Context 설정)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Context>
  
  <!-- 데이터소스 (커넥션 풀) -->
  <Resource name="jdbc/MyDB"
            auth="Container"
            type="javax.sql.DataSource"
            maxTotal="100"
            maxIdle="30"
            maxWaitMillis="10000"
            username="dbuser"
            password="dbpass"
            driverClassName="com.mysql.jdbc.Driver"
            url="jdbc:mysql://localhost:3306/mydb" />
  
  <!-- 리로드 감지 -->
  <WatchedResource>WEB-INF/web.xml</WatchedResource>
  
</Context>
```

### 4. tomcat-users.xml (사용자 관리)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<tomcat-users>
  
  <role rolename="manager-gui"/>
  <role rolename="admin-gui"/>
  
  <user username="admin" 
        password="admin123" 
        roles="manager-gui,admin-gui"/>
  
</tomcat-users>
```

---

## 🔄 생명주기

### 1. Tomcat 시작 과정

```
1. JVM 시작
   ↓
2. Bootstrap 로드 (catalina.sh/bat)
   ↓
3. server.xml 파싱
   ↓
4. Connector 초기화 (포트 바인딩)
   ↓
5. Engine/Host/Context 초기화
   ↓
6. 웹 앱 배포
   - web.xml 파싱
   - Servlet 로드 (load-on-startup)
   - 리스너/필터 초기화
   ↓
7. 요청 대기 상태
```

### 2. 요청 처리 흐름

```
클라이언트 요청
   ↓
Connector (포트 리스닝)
   ↓
Coyote (HTTP 프로토콜 처리)
   ↓
Engine → Host → Context 탐색
   ↓
Filter Chain 실행
   ↓
Servlet 실행
   - service() → doGet()/doPost()
   ↓
응답 생성
   ↓
클라이언트로 전송
```

### 3. Servlet 생명주기

```java
public class MyServlet extends HttpServlet {
    
    // 1. 생성자 (인스턴스 생성 시 1회)
    public MyServlet() {
        System.out.println("Constructor called");
    }
    
    // 2. 초기화 (서버 시작 또는 첫 요청 시 1회)
    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        System.out.println("init() called");
        // DB 연결, 설정 로드 등
    }
    
    // 3. 서비스 (매 요청마다 호출)
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) {
        System.out.println("service() called");
        // 요청 메서드에 따라 doGet/doPost 호출
    }
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        System.out.println("doGet() called");
        // GET 요청 처리
    }
    
    // 4. 종료 (서버 종료 시 1회)
    @Override
    public void destroy() {
        System.out.println("destroy() called");
        // 자원 해제, 연결 종료 등
    }
}
```

**실행 순서:**
```
Constructor → init() → service() (매 요청) → destroy()
              ↑         ↓
              1회     여러 번
```

---

## 🎛️ 실전 활용

### 1. 포트 변경

#### server.xml 수정
```xml
<Connector port="8090" protocol="HTTP/1.1" />
```

#### Spring Boot (application.properties)
```properties
server.port=8090
```

### 2. 멀티 도메인 운영

```xml
<!-- server.xml -->
<Engine name="Catalina" defaultHost="localhost">
  
  <Host name="localhost" appBase="webapps" />
  
  <Host name="example.com" appBase="/var/www/example">
    <Context path="" docBase="app" />
  </Host>
  
  <Host name="test.com" appBase="/var/www/test">
    <Context path="" docBase="app" />
  </Host>
  
</Engine>
```

### 3. SSL/HTTPS 설정

#### 1단계: Keystore 생성
```bash
keytool -genkey -alias tomcat -keyalg RSA \
        -keystore keystore.jks \
        -validity 365 \
        -keysize 2048
```

#### 2단계: server.xml 설정
```xml
<Connector port="8443" protocol="HTTP/1.1" SSLEnabled="true"
           maxThreads="150" scheme="https" secure="true"
           clientAuth="false" sslProtocol="TLS"
           keystoreFile="conf/keystore.jks"
           keystorePass="password" />
```

### 4. 접근 로그 설정

```xml
<Host name="localhost" appBase="webapps">
  
  <!-- 상세 로그 -->
  <Valve className="org.apache.catalina.valves.AccessLogValve"
         directory="logs"
         prefix="access_log" 
         suffix=".txt"
         pattern="%h %l %u %t &quot;%r&quot; %s %b %D" />
         <!-- %D: 응답 시간 (밀리초) -->
  
</Host>
```

**로그 패턴:**
- `%h`: 클라이언트 IP
- `%l`: 클라이언트 식별자
- `%u`: 인증 사용자
- `%t`: 요청 시각
- `%r`: 요청 라인 (GET /path HTTP/1.1)
- `%s`: 상태 코드
- `%b`: 응답 바이트 수

### 5. 커넥션 풀 최적화

```xml
<Connector port="8080" protocol="HTTP/1.1"
           maxThreads="200"        <!-- 최대 동시 스레드 -->
           minSpareThreads="25"    <!-- 최소 유지 스레드 -->
           maxConnections="10000"  <!-- 최대 연결 수 -->
           acceptCount="100"       <!-- 대기 큐 크기 -->
           connectionTimeout="20000" />
```

**튜닝 가이드:**
- `maxThreads`: CPU 코어 * 200 정도
- `minSpareThreads`: maxThreads의 10-25%
- `acceptCount`: maxThreads와 같거나 더 크게

### 6. 메모리 설정

#### catalina.sh/bat 수정
```bash
# Linux
export CATALINA_OPTS="-Xms512m -Xmx2048m -XX:PermSize=256m -XX:MaxPermSize=512m"

# Windows
set CATALINA_OPTS=-Xms512m -Xmx2048m
```

**파라미터 설명:**
- `-Xms`: 초기 힙 크기
- `-Xmx`: 최대 힙 크기
- `-XX:PermSize`: 초기 Permanent 영역 (Java 7)
- `-XX:MaxPermSize`: 최대 Permanent 영역

### 7. 모니터링

#### JConsole 활성화
```bash
export CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote"
export CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote.port=9090"
export CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote.authenticate=false"
```

#### Manager App 사용
```
http://localhost:8080/manager/html
```

**확인 가능한 정보:**
- 실행 중인 애플리케이션
- 세션 수
- 메모리 사용량
- 스레드 풀 상태

---

## 🐛 문제 해결

### 1. 포트 충돌

**증상:**
```
Address already in use: bind
```

**해결:**
```powershell
# Windows: 포트 사용 프로세스 확인
netstat -ano | findstr :8080

# 프로세스 종료
taskkill /F /PID <PID>

# Linux
lsof -i :8080
kill -9 <PID>
```

### 2. OutOfMemoryError

**증상:**
```
java.lang.OutOfMemoryError: Java heap space
```

**해결:**
```bash
# 힙 메모리 증가
export CATALINA_OPTS="-Xms1024m -Xmx2048m"
```

### 3. 배포 실패

**체크리스트:**
- [ ] WAR 파일 형식 확인
- [ ] WEB-INF/web.xml 존재 확인
- [ ] 클래스 패키지 경로 확인
- [ ] 필요한 JAR 라이브러리 WEB-INF/lib에 포함

### 4. 느린 응답

**원인 및 해결:**

1. **스레드 부족**
   ```xml
   <Connector maxThreads="200" /> <!-- 증가 -->
   ```

2. **커넥션 타임아웃 짧음**
   ```xml
   <Connector connectionTimeout="30000" /> <!-- 30초 -->
   ```

3. **DB 커넥션 풀 부족**
   ```xml
   <Resource maxTotal="100" /> <!-- 증가 -->
   ```

---

## 📊 성능 최적화

### 1. 정적 파일 캐싱

```xml
<Context>
  <Resources cachingAllowed="true"
             cacheMaxSize="102400" /> <!-- 100MB -->
</Context>
```

### 2. 압축 활성화

```xml
<Connector port="8080" protocol="HTTP/1.1"
           compression="on"
           compressionMinSize="2048"
           noCompressionUserAgents="gozilla, traviata"
           compressableMimeType="text/html,text/xml,text/plain,text/css,text/javascript,application/javascript" />
```

### 3. 세션 최적화

```xml
<!-- web.xml -->
<session-config>
  <session-timeout>15</session-timeout> <!-- 짧게 -->
</session-config>
```

### 4. JSP 프리컴파일

```bash
# JSP를 미리 Servlet으로 컴파일
$CATALINA_HOME/bin/jspc.sh -webapp /path/to/webapp
```

---

## 🔐 보안 설정

### 1. Manager App 보안

```xml
<!-- tomcat-users.xml -->
<role rolename="manager-gui"/>
<user username="admin" password="strong_password_here" roles="manager-gui"/>
```

### 2. 불필요한 앱 제거

```bash
# webapps 디렉토리에서 제거
rm -rf examples docs host-manager
```

### 3. 에러 페이지 커스터마이징

```xml
<!-- web.xml -->
<error-page>
  <error-code>404</error-code>
  <location>/error.jsp</location>
</error-page>
```

### 4. HTTP 메서드 제한

```xml
<security-constraint>
  <web-resource-collection>
    <web-resource-name>restricted methods</web-resource-name>
    <url-pattern>/*</url-pattern>
    <http-method>TRACE</http-method>
    <http-method>OPTIONS</http-method>
  </web-resource-collection>
  <auth-constraint/>
</security-constraint>
```

---

## 📚 추가 자료

### 공식 문서
- [Tomcat 9 Documentation](https://tomcat.apache.org/tomcat-9.0-doc/index.html)
- [Servlet Specification](https://javaee.github.io/servlet-spec/)

### 권장 도서
- "Tomcat: The Definitive Guide"
- "Professional Apache Tomcat"

---

**작성일:** 2025-10-22  
**버전:** Apache Tomcat 9.0  
**프로젝트:** LG DX School Spring 학습

이 가이드를 통해 Tomcat의 모든 것을 이해하고 실무에 활용할 수 있습니다! 🚀
