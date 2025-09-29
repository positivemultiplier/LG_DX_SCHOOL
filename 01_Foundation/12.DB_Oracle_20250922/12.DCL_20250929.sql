/*
DCL (Data Control Language) : GRANT, REVOKE, ROLE
-- 너의 계정은 이 테이블이나 저 테이블만 볼 수 있어. 
-- 신입들에게 권한을 주거나 뺏는 역할
-- GRANT, REVOKE


GRANT : 권한 부여
REVOKE : 권한 회수
ROLE : 권한 묶음
예) 특정 사용자에게 테이블에 대한 SELECT 권한 부여
GRANT SELECT ON 테이블명 TO 사용자명;
예) 특정 사용자에게 테이블에 대한 SELECT 권한 회수
REVOKE SELECT ON 테이블명 FROM 사용자명;



*/


-- 윈도우 + R => cmd => sqlplus system/12345;
-- show user; 

-- ⓐSYSTEM 계정으로 연결 
-- RUN SQL COMMAND LINE
CONNECT SYSTEM/12345;


-- ⓑ 사용자 생성
-- RUN SQL COMMAND LINE
CREATE USER DCLTEST
IDENTIFIED BY 1234;



-- ⓒ 사용자에게 권한 부여 GRANT
-- RUN SQL COMMAND LINE
-- 권한부여(GRANT): CREATE SESSION (접속권한, DB접속하기위한 권한(시스템 권한, 사용자 계정)) 
-- 누구에게(TO): DCLTEST(사용자이름, USERNAME) 
GRANT CREATE SESSION 
TO DCLTEST;-- DataBase생성 (권한이름: CREATE SESSION) 하기 위해서도 권한이 필요하다. 


-- ⓓ 사용자에게 권한 회수 REVOKE
-- RUN SQL COMMAND LINE
-- 권한회수(REVOKE): CREATE SESSION (접속권한, DB접속하기위한 권한(시스템 권한, 사용자 계정))
-- 누구로부터(FROM): DCLTEST(사용자이름, USERNAME)
REVOKE CREATE SESSION
FROM DCLTEST;-- DataBase회수 (권한이름: CREATE SESSION) 하기 위해서도 권한이 필요하다.

-- 확인
SELECT * from DCLTEST;
-- ORA-01045: user DCLTEST lacks CREATE SESSION privilege; 
--logon denied https://docs.oracle.com/error-help/db/ora-01045/. 
--Consult your database documentation for information on how to resolve the specified error code



-- ⓔ 테이블 생성 => 권한이 없기 때문에 생성이 안된다.=> 사용자계정권한과 시스템권한 부여 필요.
CREATE TABLE TEST(
    TEST NUMBER
); 



-- ORA-01031: insufficient privileges: 권한부족 
-- 시스템(SYSTEM) 권한 : CREATE SESSION, CREATE TABLE, CREATE VIEW, CREATE ANY TABLE, DROP ANY TABLE, SELECT ANY TABLE, INSERT ANY TABLE, DELETE ANY TABLE, UPDATE ANY TABLE, ALTER ANY TABLE, GRANT ANY OBJECT PRIVILEGE
-- 사용자(ROLE) 계정 : RESOURCE, CONNECT, DBA
-- RESOURCE: CREATE TABLE, CREATE VIEW, CREATE PROCEDURE, CREATE SEQUENCE, CREATE TRIGGER
-- CONNECT: CREATE SESSION, CREATE SYNONYM, CREATE DATABASE LINK
-- DBA: ALL PRIVILEGES

-- ⓕ 사용자에게 권한 부여 GRANT
-- RUN SQL COMMAND LINE에서 작성해야한다.
GRANT RESOURCE
TO DCLTEST;
-- DCLTEST 계정 접속 해제 => 다시 접속 => CREATE TABLE TEST문 실행


-- ⓖ 다른 스키마 에서 테이블 불러오기
SELECT * 
FROM HR.EMPLOYEES;
-- ORA-00942: table or view does not exist

-- schema(스키마): 스키마는 각 계정마다 존재하며, 이름이 계정과 같음
-- 오라클에서는 스키마와 사용자를 구분하지 않고 사용한다. 계정: hr => 스키마: hr
-- 원래는 다음처럼 스키마.테이블.컬럼 형태로 접근해야하지만, 
/*
SELECT HR.EMPLOYEES.EMPLOYEE_ID 
FROM HR.EMPLOYEES;
*/

--자동으로 접속한 계정의 스키마로 접근가능
/*
SELECT EMPLOYEE_ID 
FROM EMPLOYEES;
*/

-- 다른 스키마의 테이블을 사용하고 싶다면 권한이 필요하고, 접속시 스키마
--객체권한 : 특정 사용자의 객체
/*
-- GRANT 권한
-- ON 스키마, 객체
-- TO 사용자
*/

-- 실습2. DCLTEST에게 HR계정의 직원테이블에 조회하고 데이터를 수정할 권한 부여
-- RUN SQL COMMAND LINE에서 작성해야한다.

GRANT SELECT, UPDATE
ON HR.EMPLOYEES
TO DCLTEST;




-- ⓗ EMPLOYEE_ID 207번 FIRST_NAME 부여하기  & 조회하기 & COMMIT하기 (읽기 일관성: Read Consistency)
UPDATE HR.EMPLOYEES
SET FIRST_NAME = '성화'
WHERE EMPLOYEE_ID = 207;


select * from HR.EMPLOYEES
WHERE EMPLOYEE_ID = 207;


-- COMMIT 하기=> 읽기 일관성(Read Consistency) 때문에 대기상태가 된다.
-- COMMIT을 해야지만 다른 세션에서 해당 내용을 조회할 수 있다.
COMMIT;
