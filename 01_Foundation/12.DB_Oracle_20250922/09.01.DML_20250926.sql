/*
Oracle 명령어 VS ANSI SQL 명령어

DDL: Data Definition Language => CREATE, ALTER, DROP, TRUNCATE(잘라내기), RENAME
DML: Data Manipulation Language => SELECT, INSERT, UPDATE, DELETE
DCL: Data Control Language => GRANT(권한주기), REVOKE(권한빼기)
TCL: Transaction Control Language => COMMIT(확정), ROLLBACK(취소), SAVEPOINT(중간점)
DQL: Data Query Language => SELECT
*/

-- DML (Data Manipulation Language) : 데이터 조작어 (데이터 삽입, 수정, 삭제)
-- 1. INSERT: 데이터 삽입
-- 2. UPDATE: 데이터 수정
-- 3. DELETE: 데이터 삭제

----------#1. INSERT: 데이터 삽입----------
-- INSERT INTO 테이블명 VALUES (값1, 값2, 값3, ...);
-- INSERT INTO 테이블명 (컬럼1, 컬럼2, 컬럼3, ...) VALUES (값1, 값2, 값3, ...);
-- 컬럼명 생략시 테이블의 컬럼 순서대로 값을 넣어줘야 한다.


-- 실습1. 네이버회원테이블에 데이터 삽입
INSERT INTO 네이버회원 VALUES ('SMHRD', '승환', '123', DATE '2006-06-06', '남'); -- 날짜형은 년월일 format으로 넣어주기만 하면 비교 가능하다.
INSERT INTO 네이버회원 VALUES ('승환', 'SMHRD',  '123', DATE '2006-06-06', '남');

INSERT INTO 네이버회원 VALUES ('SMHRD2', '영희',  DATE '2007-07-07', '여');  -- => Data가 들어가지 않는다 -> 오류발생 반드시 순서대로 해야함. 해결방법은 아래 

INSERT INTO 네이버회원 (ID, 이름, 생년월일, 성별) VALUES( 'SMHRD1', '승환', DATE '2006-06-06', '남'); -- 비밀번호는 NULL로 들어간다.


----------#2. DELETE: 데이터 삭제----------
-- DELETE FROM 테이블명; 
-- DELETE FROM 테이블명 WHERE 조건;
DELETE FROM 네이버회원 WHERE ID = '승환';




----------#2. UPDATE: 데이터 수정----------
-- UPDATE 테이블명 SET 컬럼1 = 값1, 컬럼2 = 값2, ... WHERE 조건;
UPDATE 네이버회원 SET 비밀번호 ='456'; -- 전부다 바껴버린다. => WHERE 조건을 꼭 넣어주자
UPDATE 네이버회원 SET 비밀번호 ='456' WHERE ID = 'SMHRD1';

