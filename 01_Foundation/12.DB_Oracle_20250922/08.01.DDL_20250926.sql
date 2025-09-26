/*
Oracle 명령어 VS ANSI SQL 명령어

DDL: Data Definition Language => CREATE, ALTER, DROP, TRUNCATE(잘라내기), RENAME
DML: Data Manipulation Language => SELECT, INSERT, UPDATE, DELETE
DCL: Data Control Language => GRANT(권한주기), REVOKE(권한빼기)
TCL: Transaction Control Language => COMMIT(확정), ROLLBACK(취소), SAVEPOINT(중간점)
DQL: Data Query Language => SELECT


-- DATA TYPE
-- 문자형 : char(5)(apple=> character: 고정(fixed)길이 문자열 데이터 저장), ★varchar2(5)((a, ap, app, appl, apple다 가능) =variable character: 가변(flexible)길이 문자열 데이터 저장), clob
-- 숫자형 : ★number(p,s)=> ex123.74 => number(3,0)(124)//number(3,2)(error)//number(5,2)(123.74)  => precision: 전체 자리수, scale: 소수점 이하 자리수 ), float
-- 날짜형 : ★date, timestamp
-- 기타형 : blob, raw, long, long raw 
*/

-- DDL(데이터 정의어): 테이블과 같은 데이터를 다루는 구조 생성, 수정, 삭제 하는 명령






---------- #1. CREATE: 테이블, 뷰, 인덱스, 시퀀스, 사용자 등을 "생성"하는 명령어----------
-- Table Name 생성
-- 열 Attributes, columns => 속성은 괄호안에 넣어줘야한다. 


-- 실습1. 직원 테이블을 한글버전으로 만들어주세요.
/*
CREATE TABLE 직원정보( --Table Name 한글이 된다. 
    사번 NUMBER(10,0), -- Data Type을 지정해줘야한다. & 무결성에의해 PK로 지정해줘야한다. => 중복이 안되게
    이름 VARCHAR2(100), -- 한글은 한 문자당 3byte 차지한다. => 영어는 1byte => 한글 30글자정도 
    급여 NUMBER(10,0),
    입사일 DATE,
    부서번호 NUMBER(10,0)
);
*/




-- Table Name 생성 규칙
-- 1.1. 대소문자는 구분하지 않는다.
-- 1.2. 테이블명은 중복될 수 없다. 
-- 1.3. 같은 테이블 내에서 컬럼명은 중복될 수 없다. 
-- 1.4. 문자로 시작해야하며, 예약어는 사용이 불가능하다. 
CREATE TABLE 직원정보(
    사원번호 NUMBER(10,0),
    이름 VARCHAR2(100),
    급여 NUMBER(10,0),
    입사일 DATE,
    부서번호 NUMBER(10,0)
);


----------#2 INSERT 쿼리를 실행해서 1개의 sample data를 넣어줬다. ----------
INSERT INTO 직원정보 VALUES (100, '승환', 3000, SYSDATE, 60); -- SYSDATE: 현재 날짜와 시간을 반환하는 Oracle 내장 함수



----------#3 DROP 쿼리를 실행해서 1개의 sample data를 삭제시키자. => Data도 날라가기때문에 정말 조심해서 사용해야한다. ----------  
DROP TABLE 직원정보;

--Check =>  SELECT * FROM 직원정보;

---------- #4 제약조건(Constraint) 걸기 ----------
-- 4.1. Alter 쿼리를 실행해서 이미 만들어진 데이터 구조를 변경 => Primary Key 제약조건 추가
-- 사번 컬럼에 primary key 를 부여해주세요!
ALTER TABLE 직원정보 ADD CONSTRAINT PRIMARY KEY(사번); -- 제약조건(Constraint): 테이블에 입력 가능한 데이터를 제약할 조건
ALTER TABLE 직원정보 ADD CONSTRAINT 직원정보_PK PRIMARY KEY(사원번호); -- 오라클에서는 제약조건에 이름을 붙여주는것이 좋다. 직원정보_PK => 제약조건 이름(alias 느낌인건가? )
-- ALTER TABLE 조건걸테이블명, ADD CONSTRAINT (제약조건이름) PRIMARY KEY(컬럼명) 

-- 4.2. Alter 쿼리를 실행해서 이미 만들어진 데이터 구조를 변경 => Foreign Key 제약조건 추가
-- 관리자번호는 직원정보의 사원번호를 가지고 와야한다. => Foreign Key 제약조건  
-- 부서정보 테이블의 매니저번호 컬럼이 직원정보 테이블의 사원번호 컬럼을 참조하도록 외래키 제약조건을 추가해주세요!
ALTER TABLE 직원정보 ADD CONSTRAINT 직원정보_FK FOREIGN KEY(부서번호) REFERENCES 부서정보(부서번호);
-- ALTER TABLE 조건걸테이블명, ADD CONSTRAINT (제약조건이름) FOREIGN KEY(컬럼명), REFERENCES 참조테이블명(참조컬럼명);



------------ #5. 제약조건까지 고려해서 CREATE TABLE 다시 만들기 ------------
CREATE TABLE 직원정보(
    사원번호 NUMBER(10,0) PRIMARY KEY, -- 제약조건을 컬럼에 바로 걸어줄 수도 있다.
    이름 VARCHAR2(100),
    급여 NUMBER(10,0) NOT NULL, -- NOT NULL 제약조건 => null값이 들어올 수 없다.
    입사일 DATE,
    부서번호 NUMBER(10,0),

    CONSTRAINT 직원정보_FK FOREIGN KEY(부서번호) REFERENCES 부서정보(부서번호) -- 제약조건을 컬럼에 바로 걸어줄 수도 있다.
);
--> 모든 테이블을 지우고 다시 만들경우 부서정보 테이블을 먼저만들고 직원정보 테이블을 만들때 오류가 발생한다. 왜냐하면 직원정보 테이블의 부서번호 컬럼이 부서정보 테이블의 부서번호 컬럼을 참조하고 있기 때문이다.
-- 해결방법: 
-- > 참조무결성 제약조건(Referential Integrity Constraint) : 외래키는 참조할 수 없는 값을 지닐 수 없음 => Foreign Key 없는것을 가져 올 수 없다. 있는것만 가져올 수 있다.
-- > 참조 테이블(부서정보)부터 만들고(개체 무결성 Entity Integrity), 참조 당하는 테이블(직원정보)을 만들어야 한다(Referential Integrity).
-- > 또는 부서번호에 Primary Key 제약조건을 먼저 걸어주고, 직원정보 테이블을 만든다. => Referential Integrity Constraint 만족 



-- 실습2. 부서 테이블을 한글버전으로 만들어주세요. 
CREATE TABLE 부서정보(
    부서번호 NUMBER(10,0),
    부서명 VARCHAR2(100),
    매니저번호 NUMBER(10,0),
    위치번호 NUMBER(10,0)
);

----------실습2의 #4 제약조건(Constraint) 걸기 ----------
-- Foreign Key 제약조건을 걸기 위해서는 Primary Key 제약조건을 먼저 걸어야 한다. 

-- 4.1. Alter 쿼리를 실행해서 이미 만들어진 데이터 구조를 변경 => Primary Key 제약조건 추가
-- 부서번호 컬럼에 primary key 를 부여해주세요!
ALTER TABLE 부서정보 ADD CONSTRAINT 부서정보_PK PRIMARY KEY(부서번호);

-- 4.2. Alter 쿼리를 실행해서 이미 만들어진 데이터 구조를 변경 => Foreign Key 제약조건 추가
-- 매니저번호는 직원정보의 사원번호를 가지고 와야한다. 



-- ★★★제약조건이 걸려있는 상태에서는 Table을 삭제할 수 없다★★★ ->  
-- 방법1. 제약조건을 먼저 삭제하고, 테이블을 삭제해야한다.
ALTER TABLE  직원정보 DROP CONSTRAINT 직원정보_FK; -- 제약조건 삭제
DROP TABLE 직원정보; -- 테이블 삭제

-- 방법2. 참조 테이블 부터 삭제하고, 참조 당하는 테이블을 삭제해야한다.  
DROP TABLE 부서정보;
DROP TABLE 직원정보;



/* 제약조건 : 테이블에 입력 가능한 데이터를 제약할 조건
Primary Key(PK)
Unique key(UK)
Not Null
Check
Foreign Key(FK)

무결성(Integrity) : 데이터에 결함이 없는 상태 => 즉, 데이터가 정확하고 유효하게 유지 된 상태
무결성 제약요건(Integrity Constraint) : 데이터베이스에 저장된 데이터의 무결성을 보장, 일관되게 유지하기 위함
- 개체 무결성(Entity Integrity) 제약조건 : 기본키를 구성하는 속성은 NULL 값을 가질 수 없음 =>Primary Key
- 참조 무결성(Referential Integrity ) 제약조건 : 외래키는 참조할 수 없는 값을 지닐 수 없음 =>Foreign Key 없는것을 가져 올 수 없다. 있는것만 가져올 수 있다.
*/





-- 2. ALTER: 테이블, 뷰, 인덱스, 시퀀스, 사용자 등을 "수정"하는 명령어

-- 3. DROP: 테이블, 뷰, 인덱스, 시퀀스, 사용자 등을 "삭제"하는 명령어

-- 4. TRUNCATE: 테이블의 모든 데이터를 "삭제"하는 명령어(잘라내기)

-- 5. RENAME: 테이블, 뷰, 인덱스, 시퀀스, 사용자 등의 이름을 "변경"하는 명령어




