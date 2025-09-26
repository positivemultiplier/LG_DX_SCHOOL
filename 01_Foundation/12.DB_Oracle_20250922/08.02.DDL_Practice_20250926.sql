-- 실습

/*
다음과 같이 테이블 생성
테이블명 : 네이버회원
컬럼/자료형
1. ID -> 가변형문자 15BYTE
2. 이름 -> 가변형문자 12BYTE, NULL 불가
3. 비밀번호 -> 가변형문자 16BYTE
4. 생년월일 -> 날짜형
5. 성별 -> 가변형문자 3BYTE


테이블명 : 네이버블로그
컬럼/자료형
1. 블로그번호 -> NUMBER
2. 블로그제목 -> 가변형문자 100BYTE, NULL불가
3. 블로그내용 -> 가변형문자 4000BYTE
4. ID -> 가변형문자 15BYTE



Constraints
- 회원테이블의 ID컬럼은 PK제약조건 추가(이름: 회원_ID_PK)
- 회원테이블의 성별 컬럼은 CHECK 제약조건 추가(남,여)만 가능(이름: 회원_성별_CK)
- 블로그테이블의 블로그번호 컬럼은 PK제약조건 추가(이름: 블로그_번호_PK)
- 블로그테이블의 ID컬럼은 네이버회원테이블의 ID컬럼을 참조(이름: 블로그_회원ID_FK)
*/


-- Step1. 기본 테이블 생성
    -- 다음과 같이 테이블 생성
    -- 테이블명 : 네이버회원
    -- 컬럼/자료형
    -- 1. ID -> 가변형문자 15BYTE
    -- 2. 이름 -> 가변형문자 12BYTE, NULL 불가
    -- 3. 비밀번호 -> 가변형문자 16BYTE
    -- 4. 생년월일 -> 날짜형
    -- 5. 성별 -> 가변형문자 3BYTE


    -- 테이블명 : 네이버블로그
    -- 컬럼/자료형
    -- 1. 블로그번호 -> NUMBER
    -- 2. 블로그제목 -> 가변형문자 100BYTE, NULL불가
    -- 3. 블로그내용 -> 가변형문자 4000BYTE
    -- 4. ID -> 가변형문자 15BYTE


CREATE TABLE 네이버회원(
    ID VARCHAR2(15),
    이름 VARCHAR2(12),
    비밀번호 VARCHAR2(16),
    생년월일 DATE,
    성별 VARCHAR2(3)
);


CREATE TABLE 네이버블로그(
    블로그번호 NUMBER(10, 0), -- NUMBER TYPE의 인자를 안넣으면 최대값 32로 잡아준다. Precision 38, Scale 0
    블로그제목 VARCHAR2(100),
    블로그내용 VARCHAR2(4000),
    ID VARCHAR2(15)
);


-- Step2. 제약조건(Constraionts)& 무결성(Integrity) 확인 (Entity Integrity, Referential Integrity)
    -- Constraints
    -- 회원테이블의 ID컬럼은 PK제약조건 추가(이름: 회원_ID_PK)
    -- 회원테이블의 성별 컬럼은 CHECK 제약조건 추가(남,여)만 가능(이름: 회원_성별_CK)
    -- 블로그테이블의 블로그번호 컬럼은 PK제약조건 추가(이름: 블로그_번호_PK)
    -- 블로그테이블의 ID컬럼은 네이버회원테이블의 ID컬럼을 참조(이름: 블로그_회원ID_FK)


ALTER TABLE 네이버회원 ADD CONSTRAINT 회원_ID_PK PRIMARY KEY(ID);

-- 내코드의 실수 => ALTER TABLE 네이버회원 ADD CONSTRAINT 회원_성별_CK CHECK(성별); => 성별 In ('남', '여')
ALTER TABLE 네이버회원 ADD CONSTRAINT 회원_성별_CK CHECK (성별 IN ('남', '여'));

-- 내 코드의 실수 => ALTER TABLE 네이버회원 ADD CONSTRAINT 회원_이름_NN NOT NULL(이름);
ALTER TABLE 네이버회원 MODIFY 이름 NOT NULL;


ALTER TABLE 네이버블로그 ADD CONSTRAINT 블로그_번호_PK PRIMARY KEY(블로그번호);
ALTER TABLE 네이버블로그 ADD CONSTRAINT 블로그_회원ID_FK FOREIGN KEY(ID) REFERENCES 네이버회원(ID);

ALTER TABLE 네이버블로그 MODIFY 블로그제목 NOT NULL;


