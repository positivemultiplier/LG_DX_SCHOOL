# 📦 pom.xml 완전 이해 가이드

## 📋 목차
1. [pom.xml이란?](#pomxml이란)
2. [프로젝트 기본 정보 (GAV)](#프로젝트-기본-정보-gav)
3. [부모 POM 상속](#부모-pom-상속)
4. [프로퍼티 (변수)](#프로퍼티-변수)
5. [의존성 (Dependencies)](#의존성-dependencies)
6. [빌드 설정](#빌드-설정)
7. [Scope 이해하기](#scope-이해하기)
8. [실전 명령어](#실전-명령어)

---

## 🔍 pom.xml이란?

**POM (Project Object Model)**
- Maven 프로젝트의 설정 파일 (XML 형식)
- 프로젝트 정보, 의존성, 빌드 방법을 정의
- Maven의 핵심 개념

### 역할
```
pom.xml
  ├── 프로젝트 식별 (이름, 버전)
  ├── 의존성 관리 (라이브러리 자동 다운로드)
  ├── 빌드 설정 (컴파일, 패키징 방법)
  └── 플러그인 설정 (추가 기능)
```

---

## 🎯 프로젝트 기본 정보 (GAV)

### GAV 좌표 (Maven Coordinates)

프로젝트를 고유하게 식별하는 3가지 요소:

```xml
<groupId>com.example</groupId>
<artifactId>demo</artifactId>
<version>1.0-SNAPSHOT</version>
```

| 요소 | 설명 | 예시 |
|------|------|------|
| **groupId** | 조직/회사 식별자 (도메인 역순) | `com.example`, `org.springframework` |
| **artifactId** | 프로젝트 이름 | `demo`, `spring-boot-starter-web` |
| **version** | 버전 번호 | `1.0-SNAPSHOT`, `2.7.18` |

### 표기법
```
groupId:artifactId:version
→ com.example:demo:1.0-SNAPSHOT
```

### packaging 타입

```xml
<packaging>war</packaging>
```

| 타입 | 설명 | 사용 시기 |
|------|------|-----------|
| **jar** | Java 라이브러리, 독립 실행 앱 | Spring Boot 기본 (기본값) |
| **war** | 웹 애플리케이션 | JSP 사용, 외부 Tomcat 배포 |
| **pom** | 부모 프로젝트 | 의존성 관리 전용 |

### 버전 규칙

| 버전 | 의미 | 예시 |
|------|------|------|
| **SNAPSHOT** | 개발 중 (변경 가능) | `1.0-SNAPSHOT` |
| **RELEASE** | 정식 릴리스 (변경 불가) | `1.0`, `2.7.18` |
| **M** (Milestone) | 마일스톤 | `3.0.0-M1` |
| **RC** (Release Candidate) | 릴리스 후보 | `3.0.0-RC1` |

---

## 👨‍👦 부모 POM 상속

### Spring Boot Parent

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.7.18</version>
    <relativePath/>
</parent>
```

### 상속받는 것들

1. **의존성 버전 관리**
   - 자식 POM에서 version 생략 가능
   - 호환되는 버전 자동 선택

2. **플러그인 설정**
   - maven-compiler-plugin
   - maven-surefire-plugin
   - spring-boot-maven-plugin

3. **기본 설정**
   - Java 버전
   - 인코딩 (UTF-8)
   - 디렉토리 구조

### 예시: 버전 생략

```xml
<!-- 부모 POM이 버전 관리 → version 생략 가능 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <!-- version 없음! 부모에서 2.7.18로 자동 설정 -->
</dependency>
```

---

## 🔧 프로퍼티 (변수)

### 정의

```xml
<properties>
    <java.version>1.8</java.version>
    <lombok.version>1.18.30</lombok.version>
</properties>
```

### 사용

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>${lombok.version}</version> <!-- 1.18.30 -->
</dependency>
```

### 주요 프로퍼티

| 프로퍼티 | 설명 | 값 |
|----------|------|-----|
| `project.build.sourceEncoding` | 소스 파일 인코딩 | `UTF-8` |
| `java.version` | Java 버전 | `1.8`, `11`, `17` |
| `maven.compiler.source` | 컴파일 소스 버전 | `1.8` |
| `maven.compiler.target` | 컴파일 타겟 버전 | `1.8` |

### 내장 프로퍼티

```xml
${project.artifactId}  <!-- demo -->
${project.version}     <!-- 1.0-SNAPSHOT -->
${project.groupId}     <!-- com.example -->
${project.basedir}     <!-- 프로젝트 루트 경로 -->
```

---

## 📦 의존성 (Dependencies)

### 현재 프로젝트 의존성 구조

```
demo (현재 프로젝트)
├── Spring Boot 핵심
│   ├── spring-boot-starter-web (웹 개발)
│   │   ├── Spring MVC
│   │   ├── 내장 Tomcat
│   │   └── Jackson (JSON)
│   └── spring-boot-starter-jdbc (데이터베이스)
│       └── HikariCP (커넥션 풀)
├── 데이터베이스
│   └── H2 Database (인메모리 DB)
├── 개발 편의성
│   ├── Lombok (코드 자동 생성)
│   └── log4jdbc (SQL 로깅)
├── JSP 지원
│   ├── tomcat-embed-jasper (JSP 컴파일러)
│   └── JSTL (JSP 표준 태그)
└── 테스트
    ├── spring-boot-starter-test (JUnit 5)
    └── rest-assured (REST API 테스트)
```

### 1. Spring Boot Starter Web

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

**포함 내용:**
- Spring MVC (웹 프레임워크)
- 내장 Tomcat (서버)
- Jackson (JSON ↔ Java 변환)
- Validation (입력 검증)

**언제 사용?**
- REST API 개발
- 웹 애플리케이션
- HTTP 요청/응답 처리

### 2. Spring Boot Starter JDBC

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
```

**포함 내용:**
- JDBC API
- JdbcTemplate (SQL 실행 간소화)
- HikariCP (빠른 커넥션 풀)

**언제 사용?**
- 데이터베이스 연결
- SQL 직접 실행
- JPA 없이 단순 DB 작업

### 3. H2 Database

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
</dependency>
```

**특징:**
- 인메모리 데이터베이스 (메모리에서 실행)
- 별도 설치 불필요
- 재시작 시 데이터 초기화
- 웹 콘솔 제공 (`/h2-console`)

**언제 사용?**
- 개발/테스트 환경
- 빠른 프로토타이핑
- 단위 테스트

### 4. Lombok

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>${lombok.version}</version>
    <scope>provided</scope>
</dependency>
```

**제공 어노테이션:**
- `@Data` - Getter/Setter/ToString/EqualsHashCode
- `@Getter`, `@Setter` - Getter/Setter 자동 생성
- `@NoArgsConstructor` - 기본 생성자
- `@AllArgsConstructor` - 모든 필드 생성자
- `@Builder` - 빌더 패턴
- `@Slf4j` - 로거 자동 생성

**Before:**
```java
public class User {
    private String name;
    private int age;
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
}
```

**After (Lombok):**
```java
@Data
public class User {
    private String name;
    private int age;
}
```

### 5. log4jdbc-log4j2

```xml
<dependency>
    <groupId>org.bgee.log4jdbc-log4j2</groupId>
    <artifactId>log4jdbc-log4j2-jdbc4.1</artifactId>
    <version>${log4jdbc.log4j2.version}</version>
</dependency>
```

**기능:**
- 실행된 SQL 쿼리 출력
- 파라미터 바인딩 값 표시
- 쿼리 실행 시간 측정

**출력 예시:**
```sql
SELECT * FROM users WHERE id = 1 
-- 실행 시간: 15ms
```

### 6. tomcat-embed-jasper (JSP 컴파일러)

```xml
<dependency>
    <groupId>org.apache.tomcat.embed</groupId>
    <artifactId>tomcat-embed-jasper</artifactId>
    <scope>provided</scope>
</dependency>
```

**역할:**
- JSP 파일을 Java 서블릿으로 컴파일
- Spring Boot 내장 Tomcat에서 JSP 지원

**없으면?**
- JSP 파일이 컴파일되지 않음
- 404 에러 또는 다운로드됨

### 7. JSTL (JSP Standard Tag Library)

```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>jstl</artifactId>
    <version>1.2</version>
</dependency>
```

**제공 태그:**

| 태그 | 설명 | 예시 |
|------|------|------|
| `<c:if>` | 조건문 | `<c:if test="${age >= 18}">성인</c:if>` |
| `<c:forEach>` | 반복문 | `<c:forEach items="${list}" var="item">` |
| `<c:out>` | 출력 | `<c:out value="${name}" />` |
| `<c:set>` | 변수 선언 | `<c:set var="count" value="10" />` |
| `<c:choose>` | 다중 조건 | `<c:choose><c:when>...<c:otherwise>` |

**Before (스크립트릿):**
```jsp
<% if (age >= 18) { %>
    성인입니다
<% } %>
```

**After (JSTL):**
```jsp
<c:if test="${age >= 18}">
    성인입니다
</c:if>
```

### 8. spring-boot-starter-test

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

**포함 라이브러리:**
- JUnit 5 (테스트 프레임워크)
- Mockito (Mock 객체)
- AssertJ (가독성 좋은 assertion)
- Hamcrest (Matcher)

**테스트 어노테이션:**
- `@SpringBootTest` - 통합 테스트
- `@WebMvcTest` - 컨트롤러 테스트
- `@DataJpaTest` - JPA 테스트

### 9. REST Assured

```xml
<dependency>
    <groupId>io.rest-assured</groupId>
    <artifactId>rest-assured</artifactId>
    <version>${rest.assured.version}</version>
    <scope>test</scope>
</dependency>
```

**테스트 예시:**
```java
given()
    .contentType("application/json")
    .body("{\"name\":\"John\"}")
.when()
    .post("/api/users")
.then()
    .statusCode(201)
    .body("name", equalTo("John"));
```

---

## 🎯 Scope 이해하기

의존성이 **어느 단계에서 필요한지** 지정합니다.

### Scope 종류

| Scope | 컴파일 | 테스트 | 런타임 | 배포 | 설명 |
|-------|--------|--------|--------|------|------|
| **compile** | ✅ | ✅ | ✅ | ✅ | 모든 단계 (기본값) |
| **provided** | ✅ | ✅ | ❌ | ❌ | 서버가 제공 |
| **runtime** | ❌ | ✅ | ✅ | ✅ | 실행 시에만 |
| **test** | ❌ | ✅ | ❌ | ❌ | 테스트만 |
| **system** | ✅ | ✅ | ❌ | ❌ | 로컬 파일 |

### compile (기본값)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <!-- scope 생략 = compile -->
</dependency>
```

**사용 시기:**
- 모든 단계에서 필요
- 최종 패키지에 포함
- 대부분의 라이브러리

### provided

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <scope>provided</scope>
</dependency>
```

**사용 시기:**
- 컴파일 시에만 필요
- 런타임에는 서버/환경이 제공
- 예: Lombok, Servlet API, tomcat-embed-jasper

**이유:**
- Lombok은 컴파일 시 코드 생성 후 불필요
- Servlet API는 Tomcat이 제공
- Jasper는 Tomcat에 내장

### runtime

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

**사용 시기:**
- 컴파일 불필요
- 실행 시에만 필요
- 예: JDBC 드라이버 (MySQL, PostgreSQL, H2)

### test

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

**사용 시기:**
- 테스트 코드에서만 사용
- `src/test/java`에서만 import 가능
- 최종 패키지에 미포함
- 예: JUnit, Mockito, REST Assured

---

## 🏗️ 빌드 설정

### Maven 플러그인

플러그인은 Maven의 각종 작업을 수행하는 도구입니다.

### 1. spring-boot-maven-plugin

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
</plugin>
```

**제공 기능:**
- `mvn spring-boot:run` - 애플리케이션 실행
- `mvn package` - 실행 가능한 JAR/WAR 생성
- 모든 의존성을 하나로 패키징 (Fat JAR/WAR)

**Goal:**
- `spring-boot:run` - 개발 서버 시작
- `spring-boot:repackage` - 실행 가능한 패키지 생성

### 2. maven-compiler-plugin

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <source>${java.version}</source>
        <target>${java.version}</target>
        <encoding>${project.build.sourceEncoding}</encoding>
    </configuration>
</plugin>
```

**역할:**
- Java 소스 코드 컴파일
- `.java` → `.class` 변환

### 3. maven-war-plugin

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-war-plugin</artifactId>
    <configuration>
        <failOnMissingWebXml>false</failOnMissingWebXml>
    </configuration>
</plugin>
```

**역할:**
- WAR 파일 생성
- Spring Boot는 web.xml 불필요 → `failOnMissingWebXml=false`

---

## 🎮 실전 명령어

### 프로젝트 검증

```powershell
# pom.xml 유효성 검사
mvn validate

# 의존성 트리 보기
mvn dependency:tree

# 의존성 분석 (사용되지 않는 의존성 찾기)
mvn dependency:analyze
```

### 빌드

```powershell
# 컴파일
mvn compile

# 테스트
mvn test

# 패키징 (WAR 생성)
mvn package

# 정리 + 패키징
mvn clean package

# 로컬 저장소에 설치
mvn install
```

### Spring Boot 실행

```powershell
# 서버 시작
mvn spring-boot:run

# 포트 변경
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8090

# 프로파일 지정
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 의존성 업데이트

```powershell
# 업데이트 가능한 의존성 확인
mvn versions:display-dependency-updates

# 업데이트 가능한 플러그인 확인
mvn versions:display-plugin-updates
```

---

## 📊 의존성 트리 분석

### 현재 프로젝트 의존성 구조

```
com.example:demo:war:1.0-SNAPSHOT
├── spring-boot-starter-web:2.7.18
│   ├── spring-boot-starter:2.7.18
│   │   ├── spring-boot:2.7.18
│   │   ├── spring-boot-autoconfigure:2.7.18
│   │   └── spring-boot-starter-logging:2.7.18
│   ├── spring-webmvc:5.3.31
│   ├── spring-web:5.3.31
│   └── tomcat-embed-core:9.0.83
├── spring-boot-starter-jdbc:2.7.18
│   ├── HikariCP:4.0.3
│   └── spring-jdbc:5.3.31
├── h2:2.1.214
├── lombok:1.18.30 (provided)
├── log4jdbc-log4j2:1.16
├── tomcat-embed-jasper:9.0.83 (provided)
├── jstl:1.2
└── spring-boot-starter-test:2.7.18 (test)
    ├── junit-jupiter:5.8.2
    ├── mockito-core:4.5.1
    └── assertj-core:3.22.0
```

---

## 🎯 핵심 요약

### 반드시 기억할 것

1. **GAV 좌표**
   ```
   groupId:artifactId:version
   → com.example:demo:1.0-SNAPSHOT
   ```

2. **부모 POM 상속**
   - Spring Boot Parent가 버전 관리
   - 자식 POM에서 version 생략 가능

3. **Scope 이해**
   - `compile` (기본) - 모든 단계
   - `provided` - 서버 제공 (Lombok, Jasper)
   - `test` - 테스트만 (JUnit)

4. **JSP 지원 필수 의존성**
   ```xml
   tomcat-embed-jasper + jstl
   ```

5. **주요 명령어**
   ```powershell
   mvn clean package       # 빌드
   mvn spring-boot:run     # 실행
   mvn dependency:tree     # 의존성 확인
   ```

---

**작성일:** 2025-10-22  
**프로젝트:** LG DX School Spring 학습  
**위치:** `c:\Users\lgdx\LG_DX_School\01_Foundation\15.Spring\demo`

이제 pom.xml을 완벽하게 이해했습니다! 🎉
