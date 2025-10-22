# Maven 완전 정복 가이드

## 📚 목차
1. [Maven이란?](#maven이란)
2. [Lifecycle (생명주기)](#lifecycle-생명주기)
3. [Plugins (플러그인)](#plugins-플러그인)
4. [Dependencies (의존성)](#dependencies-의존성)
5. [pom.xml 구조](#pomxml-구조)
6. [실전 명령어](#실전-명령어)
7. [트러블슈팅](#트러블슈팅)

---

## 🔧 Maven이란?

### 정의
**Apache Maven**은 Java 프로젝트의 **빌드, 의존성 관리, 문서화**를 자동화하는 도구입니다.

### 핵심 기능
- ✅ **빌드 자동화**: 컴파일, 테스트, 패키징을 한 번에
- ✅ **의존성 관리**: 라이브러리 자동 다운로드 및 관리
- ✅ **표준 프로젝트 구조**: 일관된 디렉토리 레이아웃
- ✅ **플러그인 시스템**: 확장 가능한 기능

### Maven vs Gradle

| 특성 | Maven | Gradle |
|------|-------|--------|
| 설정 파일 | pom.xml (XML) | build.gradle (Groovy/Kotlin) |
| 속도 | 느림 | 빠름 (증분 빌드) |
| 학습 곡선 | 완만 | 가파름 |
| 사용률 | 높음 | 증가 중 |
| Spring 기본 | ✅ | ❌ |

---

## ⚙️ Lifecycle (생명주기)

Maven은 **3개의 표준 생명주기**를 가지고 있습니다.

### 1. Default Lifecycle (빌드)

가장 중요한 생명주기로, **빌드와 배포**를 담당합니다.

```
validate → compile → test → package → verify → install → deploy
```

#### Phase별 상세 설명

| Phase | 설명 | 실행 내용 |
|-------|------|----------|
| **validate** | 프로젝트 검증 | pom.xml 유효성 확인 |
| **compile** | 소스 컴파일 | src/main/java → target/classes |
| **test** | 테스트 실행 | JUnit 등 단위 테스트 |
| **package** | 패키징 | JAR/WAR 파일 생성 |
| **verify** | 검증 | 통합 테스트 실행 |
| **install** | 로컬 저장소 설치 | ~/.m2/repository에 저장 |
| **deploy** | 원격 저장소 배포 | Nexus, Artifactory 등 |

#### 실행 예시

```powershell
# compile 실행 (validate → compile)
mvn compile

# test 실행 (validate → compile → test)
mvn test

# package 실행 (validate → compile → test → package)
mvn package

# install 실행 (모든 단계 실행)
mvn install
```

**중요!** Phase는 **순차적**으로 실행됩니다. `mvn package`를 실행하면 `compile`, `test`도 자동 실행됩니다.

#### 각 Phase 자세히 보기

##### 1) validate
```powershell
mvn validate
```
- pom.xml 문법 검사
- 필수 정보 확인 (groupId, artifactId 등)
- 프로젝트 구조 검증

##### 2) compile
```powershell
mvn compile
```
**실행 과정:**
1. `src/main/java` 소스 코드 읽기
2. `.java` → `.class` 컴파일
3. `target/classes/`에 저장
4. 리소스 파일 복사 (`src/main/resources` → `target/classes`)

**출력 예:**
```
[INFO] --- compiler:3.10.1:compile (default-compile) @ demo ---
[INFO] Compiling 8 source files to C:\...\target\classes
```

##### 3) test
```powershell
mvn test
```
**실행 과정:**
1. `src/test/java` 테스트 코드 컴파일
2. JUnit/TestNG 실행
3. 테스트 리포트 생성 (`target/surefire-reports/`)

**테스트 스킵:**
```powershell
mvn test -DskipTests        # 컴파일은 하되 실행 안 함
mvn package -Dmaven.test.skip=true  # 아예 건너뜀
```

##### 4) package
```powershell
mvn package
```
**실행 과정:**
1. 컴파일된 클래스 수집
2. 리소스 파일 포함
3. JAR/WAR 파일 생성
4. `target/` 디렉토리에 저장

**결과:**
```
target/
  └── demo-1.0-SNAPSHOT.jar
```

**실행:**
```powershell
java -jar target/demo-1.0-SNAPSHOT.jar
```

##### 5) install
```powershell
mvn install
```
**실행 과정:**
1. `package` 단계까지 실행
2. 생성된 JAR/WAR를 로컬 저장소에 설치
3. 다른 프로젝트에서 의존성으로 사용 가능

**저장 위치:**
```
C:\Users\{사용자}\.m2\repository\
  └── com\example\demo\1.0-SNAPSHOT\
      └── demo-1.0-SNAPSHOT.jar
```

##### 6) deploy
```powershell
mvn deploy
```
- 원격 Maven 저장소(Nexus, Artifactory)에 업로드
- 팀원들과 공유
- 회사 내부 라이브러리 배포

### 2. Clean Lifecycle (정리)

빌드 산출물을 **삭제**합니다.

```
pre-clean → clean → post-clean
```

```powershell
# target 디렉토리 삭제
mvn clean

# 정리 후 컴파일
mvn clean compile

# 정리 후 패키징
mvn clean package
```

**언제 사용?**
- 빌드 오류 발생 시
- 깨끗한 상태에서 다시 빌드
- 배포 전 최종 빌드

### 3. Site Lifecycle (문서화)

프로젝트 **문서와 리포트** 생성

```
pre-site → site → post-site → site-deploy
```

```powershell
# 프로젝트 사이트 생성
mvn site

# 결과: target/site/index.html
```

**생성되는 문서:**
- 프로젝트 정보
- JavaDoc
- 테스트 커버리지
- 의존성 리포트

---

## 🔌 Plugins (플러그인)

Maven의 모든 작업은 **플러그인**으로 실행됩니다.

### 플러그인 구조

```
Plugin (플러그인)
  └── Goal (목표)
      └── Execution (실행)
```

**예시:**
```
compiler (플러그인)
  ├── compile (Goal)
  └── testCompile (Goal)
```

### 주요 플러그인

#### 1. maven-compiler-plugin (컴파일)

**역할:** Java 소스 코드를 컴파일

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.10.1</version>
    <configuration>
        <source>1.8</source>      <!-- Java 소스 버전 -->
        <target>1.8</target>      <!-- 컴파일 타겟 버전 -->
        <encoding>UTF-8</encoding>
    </configuration>
</plugin>
```

**Goal:**
- `compiler:compile` - 메인 소스 컴파일
- `compiler:testCompile` - 테스트 소스 컴파일

**실행:**
```powershell
mvn compiler:compile
```

#### 2. maven-surefire-plugin (테스트)

**역할:** 단위 테스트 실행 (JUnit, TestNG)

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>2.22.2</version>
    <configuration>
        <includes>
            <include>**/*Test.java</include>
        </includes>
        <excludes>
            <exclude>**/*IntegrationTest.java</exclude>
        </excludes>
    </configuration>
</plugin>
```

**Goal:**
- `surefire:test` - 테스트 실행

**실행:**
```powershell
mvn surefire:test

# 특정 테스트만 실행
mvn test -Dtest=UserServiceTest
mvn test -Dtest=UserServiceTest#testFindUser
```

#### 3. maven-jar-plugin (JAR 생성)

**역할:** JAR 파일 생성

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-jar-plugin</artifactId>
    <version>3.2.2</version>
    <configuration>
        <archive>
            <manifest>
                <mainClass>com.example.App</mainClass>
            </manifest>
        </archive>
    </configuration>
</plugin>
```

#### 4. spring-boot-maven-plugin (Spring Boot)

**역할:** Spring Boot 애플리케이션 실행 및 패키징

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <version>2.7.18</version>
    <executions>
        <execution>
            <goals>
                <goal>repackage</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

**Goal:**
- `spring-boot:run` - 애플리케이션 실행
- `spring-boot:repackage` - 실행 가능한 JAR 생성

**실행:**
```powershell
# 개발 서버 시작
mvn spring-boot:run

# 포트 변경
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8090

# 프로파일 지정
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

#### 5. maven-clean-plugin (정리)

**역할:** `target/` 디렉토리 삭제

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-clean-plugin</artifactId>
    <version>3.2.0</version>
</plugin>
```

#### 6. maven-resources-plugin (리소스 복사)

**역할:** 리소스 파일을 target으로 복사

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-resources-plugin</artifactId>
    <version>3.2.0</version>
    <configuration>
        <encoding>UTF-8</encoding>
    </configuration>
</plugin>
```

**처리 파일:**
- `src/main/resources/` → `target/classes/`
- `src/test/resources/` → `target/test-classes/`

#### 7. maven-install-plugin (로컬 설치)

**역할:** 로컬 저장소에 아티팩트 설치

```powershell
mvn install:install-file \
    -Dfile=mylib.jar \
    -DgroupId=com.mycompany \
    -DartifactId=mylib \
    -Dversion=1.0 \
    -Dpackaging=jar
```

#### 8. maven-deploy-plugin (배포)

**역할:** 원격 저장소에 아티팩트 배포

```xml
<distributionManagement>
    <repository>
        <id>nexus</id>
        <url>http://nexus.company.com/repository/releases/</url>
    </repository>
</distributionManagement>
```

#### 9. maven-site-plugin (문서 생성)

**역할:** 프로젝트 사이트 및 문서 생성

```powershell
mvn site
```

---

## 📦 Dependencies (의존성)

의존성은 프로젝트가 필요로 하는 **외부 라이브러리**입니다.

### 의존성 구조

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>      <!-- 조직/회사 -->
    <artifactId>spring-boot-starter-web</artifactId> <!-- 프로젝트명 -->
    <version>2.7.18</version>                         <!-- 버전 -->
    <scope>compile</scope>                            <!-- 범위 -->
</dependency>
```

### 의존성 좌표 (Coordinates)

```
groupId:artifactId:version
```

**예시:**
```
org.springframework.boot:spring-boot-starter-web:2.7.18
```

### Dependency Scope (범위)

의존성이 **어느 단계에서 필요한지** 지정합니다.

| Scope | 설명 | 컴파일 | 테스트 | 런타임 | 배포 |
|-------|------|--------|--------|--------|------|
| **compile** | 기본값, 모든 단계 | ✅ | ✅ | ✅ | ✅ |
| **provided** | 컴파일/테스트만 (런타임은 제공됨) | ✅ | ✅ | ❌ | ❌ |
| **runtime** | 실행/테스트만 | ❌ | ✅ | ✅ | ✅ |
| **test** | 테스트만 | ❌ | ✅ | ❌ | ❌ |
| **system** | 로컬 시스템 경로 | ✅ | ✅ | ❌ | ❌ |

#### 1) compile (기본값)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>2.7.18</version>
    <!-- scope 생략 시 기본값 -->
</dependency>
```

**특징:**
- 모든 classpath에 포함
- 컴파일, 테스트, 실행 모두 필요
- 최종 패키지에 포함

**예시:**
- Spring Framework
- Apache Commons
- Gson, Jackson

#### 2) provided

```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>4.0.1</version>
    <scope>provided</scope>
</dependency>
```

**특징:**
- 컴파일/테스트 시 필요
- 런타임은 서버가 제공
- 최종 패키지에 미포함

**예시:**
- Servlet API (Tomcat이 제공)
- JSP API
- Lombok (컴파일 시에만 필요)

#### 3) runtime

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

**특징:**
- 컴파일 불필요
- 실행 시에만 필요

**예시:**
- JDBC 드라이버 (MySQL, PostgreSQL, H2)
- 로깅 구현체 (Logback)

#### 4) test

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

**특징:**
- 테스트 코드에서만 사용
- `src/test/java`에서만 import 가능
- 최종 패키지에 미포함

**예시:**
- JUnit
- Mockito
- AssertJ

#### 5) system

```xml
<dependency>
    <groupId>com.custom</groupId>
    <artifactId>custom-lib</artifactId>
    <version>1.0</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/lib/custom-lib.jar</systemPath>
</dependency>
```

**특징:**
- 로컬 파일 시스템의 JAR 직접 지정
- 권장하지 않음 (이식성 문제)

### 의존성 전이 (Transitive Dependencies)

A → B → C 구조에서, A가 B를 의존하면 **C도 자동으로 포함**됩니다.

```
프로젝트
  └── spring-boot-starter-web (의존)
      ├── spring-web (자동 포함)
      ├── spring-webmvc (자동 포함)
      └── tomcat-embed-core (자동 포함)
```

#### 전이 의존성 제외

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### 의존성 관리 (Dependency Management)

**부모 POM에서 버전 통일 관리**

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>2.7.18</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

**자식 POM에서 버전 생략 가능:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <!-- version 생략 - 부모에서 관리 -->
</dependency>
```

### 의존성 충돌 해결

#### 1) 가까운 의존성 우선
```
A → B → C 1.0
A → D → C 2.0
```
결과: **C 2.0 사용** (D가 더 가까움)

#### 2) 먼저 선언된 의존성 우선
```xml
<dependencies>
    <dependency>C 1.0</dependency>  <!-- 이게 사용됨 -->
    <dependency>C 2.0</dependency>
</dependencies>
```

#### 3) 명시적 선언으로 강제
```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>library-c</artifactId>
    <version>3.0</version>  <!-- 명시적으로 3.0 사용 -->
</dependency>
```

### 의존성 확인 명령어

```powershell
# 의존성 트리 보기
mvn dependency:tree

# 결과 예시:
# [INFO] com.example:demo:jar:1.0-SNAPSHOT
# [INFO] +- org.springframework.boot:spring-boot-starter-web:jar:2.7.18
# [INFO] |  +- org.springframework.boot:spring-boot-starter:jar:2.7.18
# [INFO] |  |  +- org.springframework.boot:spring-boot:jar:2.7.18
# [INFO] |  |  \- org.springframework.boot:spring-boot-autoconfigure:jar:2.7.18

# 사용되지 않는 의존성 찾기
mvn dependency:analyze

# 의존성 다운로드
mvn dependency:resolve
```

---

## 📄 pom.xml 구조

### 전체 구조

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    
    <modelVersion>4.0.0</modelVersion>
    
    <!-- 1. 프로젝트 정보 -->
    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>
    <name>My Project</name>
    <description>Project Description</description>
    
    <!-- 2. 부모 POM -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.18</version>
    </parent>
    
    <!-- 3. 프로퍼티 -->
    <properties>
        <java.version>1.8</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    
    <!-- 4. 의존성 -->
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
    
    <!-- 5. 빌드 설정 -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
    
</project>
```

### 주요 섹션 설명

#### 1. 프로젝트 기본 정보

```xml
<groupId>com.example</groupId>           <!-- 패키지 경로 (회사/조직) -->
<artifactId>demo</artifactId>            <!-- 프로젝트명 -->
<version>1.0-SNAPSHOT</version>          <!-- 버전 -->
<packaging>jar</packaging>                <!-- 패키징 타입 -->
```

**packaging 타입:**
- `jar` - Java 라이브러리, Spring Boot 앱
- `war` - 웹 애플리케이션 (Tomcat 배포용)
- `pom` - 부모 프로젝트 (의존성 관리용)

**버전 규칙:**
- `1.0-SNAPSHOT` - 개발 중 (변경 가능)
- `1.0` - 릴리스 버전 (변경 불가)
- `1.0-RELEASE` - 정식 릴리스

#### 2. 부모 POM 상속

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.7.18</version>
</parent>
```

**부모로부터 상속받는 것:**
- 의존성 버전 관리
- 플러그인 설정
- 기본 디렉토리 구조
- 인코딩 설정

#### 3. Properties (변수)

```xml
<properties>
    <java.version>1.8</java.version>
    <lombok.version>1.18.30</lombok.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>
```

**사용:**
```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>${lombok.version}</version>
</dependency>
```

#### 4. Repositories (저장소)

```xml
<repositories>
    <repository>
        <id>central</id>
        <url>https://repo.maven.apache.org/maven2</url>
    </repository>
    <repository>
        <id>spring-milestones</id>
        <url>https://repo.spring.io/milestone</url>
    </repository>
</repositories>
```

---

## 🎯 실전 명령어

### 기본 명령어

```powershell
# 컴파일
mvn compile

# 테스트
mvn test

# 패키징 (JAR/WAR 생성)
mvn package

# 로컬 설치
mvn install

# 정리
mvn clean

# 정리 + 패키징
mvn clean package

# 정리 + 설치
mvn clean install
```

### Spring Boot 명령어

```powershell
# 서버 시작
mvn spring-boot:run

# 포트 변경
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8090

# 프로파일 지정
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 디버그 모드
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

### 의존성 관리

```powershell
# 의존성 트리
mvn dependency:tree

# 의존성 분석
mvn dependency:analyze

# 의존성 다운로드
mvn dependency:resolve

# 의존성 업데이트 확인
mvn versions:display-dependency-updates
```

### 테스트 관련

```powershell
# 테스트 스킵
mvn package -DskipTests

# 특정 테스트만 실행
mvn test -Dtest=UserServiceTest

# 테스트 메서드 지정
mvn test -Dtest=UserServiceTest#testFindUser

# 여러 테스트 실행
mvn test -Dtest=UserServiceTest,OrderServiceTest
```

### 빌드 옵션

```powershell
# 멀티 스레드 빌드 (4개 스레드)
mvn clean install -T 4

# 오프라인 모드 (인터넷 없이)
mvn clean install -o

# 디버그 로그
mvn clean install -X

# 에러 상세 출력
mvn clean install -e

# 조용한 모드
mvn clean install -q
```

### 프로젝트 생성

```powershell
# Maven Archetype으로 프로젝트 생성
mvn archetype:generate \
    -DgroupId=com.example \
    -DartifactId=myapp \
    -DarchetypeArtifactId=maven-archetype-quickstart \
    -DinteractiveMode=false

# Spring Boot 프로젝트 생성
mvn io.spring.platform:platform-maven-plugin:spring-boot-project
```

---

## 🔍 트러블슈팅

### 1. 플러그인을 찾을 수 없음

**증상:**
```
No plugin found for prefix 'spring-boot'
```

**원인:** 잘못된 디렉토리에서 실행

**해결:**
```powershell
# pom.xml이 있는 디렉토리로 이동
cd c:\...\demo
mvn spring-boot:run
```

### 2. 의존성 다운로드 실패

**증상:**
```
Could not resolve dependencies
```

**해결:**
```powershell
# 1. 의존성 강제 업데이트
mvn clean install -U

# 2. 로컬 저장소 정리
rm -r ~/.m2/repository/com/example/demo

# 3. 오프라인 모드 해제
mvn clean install (온라인 상태 확인)
```

### 3. 컴파일 에러

**증상:**
```
Source option 5 is no longer supported
```

**해결:**
```xml
<properties>
    <java.version>1.8</java.version>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
</properties>
```

### 4. 메모리 부족

**증상:**
```
OutOfMemoryError: Java heap space
```

**해결:**
```powershell
# Windows
set MAVEN_OPTS=-Xmx1024m

# Linux/Mac
export MAVEN_OPTS="-Xmx1024m"
```

### 5. 캐시 문제

**해결:**
```powershell
# Maven 캐시 정리
mvn dependency:purge-local-repository

# 전체 로컬 저장소 삭제 (주의!)
rm -rf ~/.m2/repository
```

---

## 📊 실전 예제

### 예제 1: 웹 애플리케이션 빌드

```xml
<project>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.18</version>
    </parent>
    
    <dependencies>
        <!-- 웹 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- 데이터베이스 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <!-- H2 -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- 테스트 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

**실행:**
```powershell
mvn clean package
java -jar target/myapp-1.0-SNAPSHOT.jar
```

### 예제 2: 프로파일 활용

```xml
<profiles>
    <!-- 개발 환경 -->
    <profile>
        <id>dev</id>
        <properties>
            <spring.profiles.active>dev</spring.profiles.active>
        </properties>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
    </profile>
    
    <!-- 운영 환경 -->
    <profile>
        <id>prod</id>
        <properties>
            <spring.profiles.active>prod</spring.profiles.active>
        </properties>
    </profile>
</profiles>
```

**실행:**
```powershell
# 개발 환경
mvn spring-boot:run

# 운영 환경
mvn spring-boot:run -Pprod
```

---

## 📚 추가 학습 자료

### 공식 문서
- [Maven 공식 가이드](https://maven.apache.org/guides/)
- [Maven Lifecycle Reference](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
- [Maven POM Reference](https://maven.apache.org/pom.html)

### 도구
- [Maven Central Repository](https://search.maven.org/)
- [MVN Repository](https://mvnrepository.com/)

---

## 🎯 핵심 요약

### 반드시 기억할 것

1. **Lifecycle 순서**
   ```
   compile → test → package → install → deploy
   ```

2. **주요 명령어**
   ```powershell
   mvn clean package      # 가장 많이 사용
   mvn spring-boot:run    # Spring Boot 개발
   mvn dependency:tree    # 의존성 확인
   ```

3. **의존성 Scope**
   - `compile` (기본) - 모든 단계
   - `provided` - Tomcat 제공
   - `test` - 테스트만
   - `runtime` - 실행만

4. **pom.xml 위치**
   - Maven 명령어는 **반드시** pom.xml이 있는 디렉토리에서 실행!

5. **플러그인 실행 형식**
   ```
   mvn <plugin>:<goal>
   예: mvn compiler:compile
   ```

---

**작성일:** 2025-10-22  
**프로젝트:** LG DX School Spring 학습  
**위치:** `c:\Users\lgdx\LG_DX_School\01_Foundation\15.Spring`

이 가이드로 Maven의 모든 것을 마스터하세요! 💪
