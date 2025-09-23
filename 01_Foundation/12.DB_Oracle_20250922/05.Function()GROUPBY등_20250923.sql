-- Function()
-- SQL 단일행 함수
-- SQL 복수행 함수
-- GROUP BY, HAVING, ORDER BY절


-- # 1 GROUP BY절 : 특정 컬럼을 기준으로 집계내는 데 사용
-- 행을 그룹화하여 각각 단일행으로 표기
-- ex) 부서별로 평균 값을 구하겠다~
-- ex) 학생별로 과목의 총합을 구하겠다~
/*
SELECT *
from EMPLOYEES
GROUP BY DEPARTMENT_ID; 부서ID를 기준으로 그룹화
*/




SELECT DEPARTMENT_ID,EMPLOYEE_ID
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID; 
/* 
실행순서 1.from >> 2.group by >> 3.select 행의 갯수가 맞지 않아서 오류를 발생시킨다.
그룹화를 하게 되면 실제 출력되는 행의 개수가 감소
- 이미 그룹화를 하고 난 후 행의 개수는 12개
- select절에서 필요로하는 행의 개수(employee_id)는 108개
- 행의 개수가 맞지 않아서 오류 발생 
ORA-00979: not a GROUP BY expression https://docs.oracle.com/error-help/db/ora-00979/
The specified expression was not part of either the GROUP BY clause, an aggregate function, or a constant but appeared in a part of the query that is processed after the GROUP BY clause, such as the SELECT clause, the ORDER BY clause, or the HAVING clause
Error at Line: 1 Column: 20
- group by절을 사용하면 이후 실행되는 절에서는 출력될 수 있는 컬럼의 제약
*/


-- 집계함수
SELECT DEPARTMENT_ID, AVG(SALARY) AS "평균급여"
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID;


-- 단일행 함수: 함수에 입력되는 행의 개수가 1개, 각 행에 대한 결과값을 도출 => 인자 parameter에 1개의 행을 넣어줘야 한다.
SELECT FIRST_NAME, upper(FIRST_NAME) AS "대문자이름"
FROM EMPLOYEES;

-- 반올림 Round
SELECT DEPARTMENT_ID, AVG(SALARY), ROUND(AVG(SALARY)) AS "반올림"
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID;


-- 다중행 함수 : 함수에 입력되는 행의 개수가 여러개, 여러개의 행을 바탕으로 1개의 결과값을 도출 
SELECT SUM(SALARY) AS "급여합계"
FROM EMPLOYEES;

-- 집계함수 (부서별로 급여의 합계, 최소, 최대, 평균, 개수)
SELECT DEPARTMENT_ID
      ,SUM(SALARY) AS "합계"
      ,MIN(SALARY) AS "최소"
      ,MAX(SALARY) AS "최대"
      ,ROUND(AVG(SALARY)) AS "평균"
      ,COUNT(SALARY) AS "개수(컬럼)"
      ,COUNT(*) AS "개수(*)"
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID
ORDER BY 1 ASC;



-- 부서가 없는 사람 2명
SELECT *
FROM EMPLOYEES
WHERE DEPARTMENT_ID IS NULL;

-- COUNT함수 => COUNT(컬럼) => NULL 제외, COUNT(*)=> NULL 포함
SELECT DEPARTMENT_ID
      ,SUM(SALARY) AS "합계"
      ,MIN(SALARY) AS "최소"
      ,MAX(SALARY) AS "최대"
      ,ROUND(AVG(SALARY)) AS "평균"
      ,COUNT(SALARY) AS "개수(컬럼)"
      ,COUNT(*) AS "개수(*)"
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID
ORDER BY 1 ASC;


-- 부서가 없는 사람 2명

SELECT DEPARTMENT_ID, FIRST_NAME

FROM EMPLOYEES

WHERE DEPARTMENT_ID IS NULL;
 
-- COUNT함수 → COUNT(컬럼) : NULL 제외, COUNT(*) : NULL 포함

-- 집계함수는 GROUP BY가 없어도 사용 가능O

-- 단, 모든 데이터를 하나의 그룹으로 판단하기 때문에, 다른 컬럼과 함게 사용 불가능!
 






DROP TABLE 교육생정보 ; 
DROP TABLE 성적표 ;
 
CREATE TABLE 교육생정보 (
학생ID VARCHAR2(9) PRIMARY KEY , 
학생이름 VARCHAR2(50) NOT NULL , 
팀 VARCHAR2(5) 
);
 
CREATE TABLE 성적표 ( 
    학생ID VARCHAR2(9) , 
    과목   VARCHAR2(30) , 
    성적   NUMBER  , 
    CONSTRAINT PK_성적표 PRIMARY KEY(학생ID , 과목) , 
    CONSTRAINT FK_성적표 FOREIGN KEY(학생ID) REFERENCES 교육생정보(학생ID) 
)  ;
 
INSERT INTO 교육생정보 VALUES ('SMHRD1' , '박수현' , 'A') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD2' , '이도연' , 'A') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD3' , '손지영' , 'A') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD4' , '이진헌' , 'B') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD5' , '서희창' , 'B') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD6' , '최지혜' , 'C') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD7' , '강승호' , 'C') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD8' , '손지원' , 'C') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD9' , '고일웅' , 'D') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD10' , '이우진' , 'D') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD11' , '박의진' , 'D') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD12' , '배한나' , 'E') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD13' , '정민지' , 'E') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD14' , '조희경' , 'E') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD15' , '이은지' , 'F') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD16' , '전민경' , 'F') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD17' , '장인우' , 'F') ;
 
INSERT INTO 성적표 VALUES('SMHRD1'  ,'JAVA' , 90); 
INSERT INTO 성적표 VALUES('SMHRD1'  ,'DATABASE' , 85); 
INSERT INTO 성적표 VALUES('SMHRD1'  ,'PYTHON' , 100); 
INSERT INTO 성적표 VALUES('SMHRD2'  ,'JAVA' , 100); 
INSERT INTO 성적표 VALUES('SMHRD2'  ,'DATABASE' , 100); 
INSERT INTO 성적표 VALUES('SMHRD2'  ,'PYTHON' , 20); 
INSERT INTO 성적표 VALUES('SMHRD3'  ,'JAVA' , 100); 
INSERT INTO 성적표 VALUES('SMHRD3'  ,'DATABASE' , 100); 
INSERT INTO 성적표 VALUES('SMHRD3'  ,'PYTHON' , 20); 
INSERT INTO 성적표 VALUES('SMHRD4'  ,'JAVA' , 85); 
INSERT INTO 성적표 VALUES('SMHRD4'  ,'DATABASE' , 40); 
INSERT INTO 성적표 VALUES('SMHRD4'  ,'PYTHON' , 60); 
INSERT INTO 성적표 VALUES('SMHRD5'  ,'JAVA' , 100); 
INSERT INTO 성적표 VALUES('SMHRD5'  ,'DATABASE' , 100); 
INSERT INTO 성적표 VALUES('SMHRD5'  ,'PYTHON' , 100); 
INSERT INTO 성적표 VALUES ( 'SMHRD6' , 'JAVA' , NULL ) ; 
INSERT INTO 성적표 VALUES ( 'SMHRD6' , 'DATABASE' , NULL ) ; 
INSERT INTO 성적표 VALUES ( 'SMHRD6' , 'PYTHON' , NULL ) ; 
INSERT INTO 성적표 VALUES('SMHRD7'  ,'JAVA' , 80); 
INSERT INTO 성적표 VALUES('SMHRD7'  ,'DATABASE' , 90); 
INSERT INTO 성적표 VALUES('SMHRD7'  ,'PYTHON' , 100); 
INSERT INTO 성적표 VALUES('SMHRD8'  ,'JAVA' , 100); 
INSERT INTO 성적표 VALUES('SMHRD8'  ,'DATABASE' , 70); 
INSERT INTO 성적표 VALUES('SMHRD8'  ,'PYTHON' , 85); 
INSERT INTO 성적표 VALUES('SMHRD9'  ,'JAVA' , 95); 
INSERT INTO 성적표 VALUES('SMHRD9'  ,'DATABASE' , 85); 
INSERT INTO 성적표 VALUES('SMHRD9'  ,'PYTHON' , 95); 
INSERT INTO 성적표 VALUES('SMHRD10'  ,'JAVA' , 95); 
INSERT INTO 성적표 VALUES('SMHRD10'  ,'DATABASE' , 95); 
INSERT INTO 성적표 VALUES('SMHRD10'  ,'PYTHON' , 75); 
INSERT INTO 성적표 VALUES('SMHRD11'  ,'JAVA' , 88); 
INSERT INTO 성적표 VALUES('SMHRD11'  ,'DATABASE' , NULL); 
INSERT INTO 성적표 VALUES('SMHRD11'  ,'PYTHON' , 56); 
INSERT INTO 성적표 VALUES('SMHRD12'  ,'JAVA' , 94); 
INSERT INTO 성적표 VALUES('SMHRD12'  ,'DATABASE' , 84); 
INSERT INTO 성적표 VALUES('SMHRD12'  ,'PYTHON' , 69); 
INSERT INTO 성적표 VALUES('SMHRD13'  ,'JAVA' , 96); 
INSERT INTO 성적표 VALUES('SMHRD13'  ,'DATABASE' , 92); 
INSERT INTO 성적표 VALUES('SMHRD13'  ,'PYTHON' , 95);
INSERT INTO 성적표 VALUES('SMHRD14'  ,'JAVA' , 78); 
INSERT INTO 성적표 VALUES('SMHRD14'  ,'DATABASE' , 99); 
INSERT INTO 성적표 VALUES('SMHRD14'  ,'PYTHON' , NULL);
INSERT INTO 성적표 VALUES('SMHRD15'  ,'JAVA' , 84); 
INSERT INTO 성적표 VALUES('SMHRD15'  ,'DATABASE' , 93); 
INSERT INTO 성적표 VALUES('SMHRD15'  ,'PYTHON' , 81);   
INSERT INTO 성적표 VALUES('SMHRD16'  ,'JAVA' , 65); 
INSERT INTO 성적표 VALUES('SMHRD16'  ,'DATABASE' , 84); 
INSERT INTO 성적표 VALUES('SMHRD16'  ,'PYTHON' , 81); 
INSERT INTO 성적표 VALUES('SMHRD17'  ,'JAVA' , 78); 
INSERT INTO 성적표 VALUES('SMHRD17'  ,'DATABASE' , 95); 
INSERT INTO 성적표 VALUES('SMHRD17'  ,'PYTHON' , 85); 
COMMIT;



-- #1. SQL 복수행함수(그룹함수)
-- GROUP BY절과 함께 사용

-- 실습
-- 실습1. 성적표 테이블에서 학생별로(GROUP BY) 평균점수 출력(SELECT)하기. 단, 반올림을 통해서 소수점 1자리까지만 출력
SELECT 학생ID, ROUND(AVG(성적), 3) AS "평균점수"
FROM "성적표"
GROUP BY 학생ID;


-- 실습2. 과목별로 최고 성적과 최저 성적을 출력
SELECT 과목, MAX(성적) AS "최고성적", MIN(성적) AS "최저성적"
FROM "성적표"
GROUP BY 과목;

-- 실습3. 교육생정보 테이블에서 각 팀에 몇 명이 있는지 출력
SELECT 팀, COUNT(*) AS "인원수", COUNT(팀) AS "인원수"
FROM "교육생정보"
GROUP BY 팀
ORDER BY 1 ASC;

-- 실습4. 성적표 테이블에서 학생별로 JAVA와 DATABASE 성적의 평균을 출력. 단, 1의 자리에서 반올림
-- Tip: GROUP BY 전에 PYTHON을 제외시켜야한다. WHERE절 사용한다.  

SELECT 학생ID, ROUND(AVG(성적), 3) AS "JAVA와 DATABASE 평균"
FROM "성적표"
WHERE 과목 IN ('JAVA', 'DATABASE')
-- WHERE 과목 <> 'PYTHON'
GROUP BY 학생ID
ORDER BY 2 DESC;


-- #2. HAVING절 : GROUP BY절을 통해서 그룹화 된 결과 중에서 원하는 결과로 필터링 하는 문법
-- WHERE절과 비슷한 역할 (2번째 순서임 => GROUP BY 이전에 조건이 걸린다)
-- HAVING절(4번째 순서임 => GROUP BY 이후에 조건을 걸 때 사용)

-- 학생별로 평균성적이 70점 이하인 학생들을 선별
SELECT 학생ID, ROUND(AVG(성적), 3) AS "평균점수"
FROM "성적표"
GROUP BY 학생ID
HAVING AVG(성적) <= 70;

-- 파이썬 성적을 제외한 평균이 80 이상인 성적을 출력
SELECT 학생ID, ROUND(AVG(성적), 3) AS "JAVA와 DATABASE 평균"
FROM "성적표"
WHERE 과목 IN ('JAVA', 'DATABASE')
-- WHERE 과목 <> 'PYTHON'
GROUP BY 학생ID
HAVING AVG(성적) >= 90;

-- 실습
-- 실습1. 수강생 정보에서 소속된 팀의 인원수가 3이상인 팀만 출력
SELECT 팀, COUNT(팀) AS "인원수"
-- SELECT 팀, COUNT(*) AS "인원수" NULL값이 있다면 astalisk 사용하면 오류가 발생한다.
FROM "교육생정보"
GROUP BY 팀
HAVING COUNT(팀) >= 3;
-- HAVING COUNT(*) >= 3;


-- 실습2. 성적표 테이블에서 학생 별 평균성적을 출력하되, NULL이 아닌 값만 출력. 단, 성적은 1의 자리까지만 표시
SELECT 학생ID, ROUND(AVG(성적), 1) AS "평균성적"
FROM "성적표"
--WHERE 성적 IS NOT NULL
GROUP BY 학생ID
HAVING AVG(성적) IS NOT NULL
ORDER BY 2 DESC;



-- 실습3. 직원 테이블에서 부서별 최고 연봉이 100,000 이상인 부서만 출력
SELECT DEPARTMENT_ID, MAX(SALARY*12) AS "최고연봉"
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID
HAVING MAX(SALARY*12) >= 100000
ORDER BY 2 DESC;

-- test 애스터리스크(*, asterisk)와 컬럼명 차이
SELECT COUNT(*), COUNT(성적)
FROM "성적표";


-- #3. ORDER BY절 : 특정 컬럼을 기준으로 정렬(ASCending, DESCending)
-- 기본값은 ASC 오름차순
-- 여러 컬럼을 기준으로 정렬 가능
-- 컬럼이름 외의 별칭이나 숫자로도 정렬이 가능하다.
-- 여러 컬럼을 기준으로 정렬 가능
SELECT *
FROM 성적표
ORDER BY 학생ID DESC, 성적 ASC;

-- SELECT절에 입력되지 않은 컬럼을 기준으로도 정렬 가능
SELECT EMPLOYEE_ID, SALARY
FROM EMPLOYEES
ORDER BY SALARY DESC;

-- GROUP BY가 명시된 경우, GROUP BY 절에서 한정된 컬럼만 가능
-- ORA-00979: not a GROUP BY expression => 그룹바이가 먼저 되어서 기준으로 잡을 수 없다. 
SELECT DEPARTMENT_ID, SUM(SALARY) AS "급여합계"
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID
ORDER BY EMPLOYEE_ID;

-- 컬럼이름 외의 별칭이나 순서로도 정렬 가능
SELECT DEpartment_id, SUM(SALARY) AS "급여합계"
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID
ORDER BY "급여합계" DESC;

SELECT DEpartment_id, SUM(SALARY) AS "급여합계"
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID
ORDER BY 2 DESC;
