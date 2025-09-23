-- 주석처리 
-- SQL문장에서 명령어는 대소문자 구분X
-- 띄어쓰기나 줄바꿈은 명령어에 영향X
-- SQL문장의 끝은 ;(세미콜론)으로 마무리!
-- 실행 CTRL+ENTER, F9


-- 1. 전체 컬럼 출력 107개 rows
-- *(애스터리스크) : 전체를 의미한다. 
SELECT * 
FROM EMPLOYEES;

-- 2. 원하는 컬럼 출력
SELECT EMPLOYEE_ID, LAST_NAME
FROM EMPLOYEES;

-- 실습
-- 실습1.직원 테이블의 직원ID, 이름, 입사일 출력하기
SELECT EMPLOYEE_ID, FIRST_NAME, HIRE_DATE
FROM EMPLOYEES;

-- 실습2.부서 테이블에서 부서ID,부서명,근무지ID 출력하기
SELECT DEPARTMENT_ID, DEPARTMENT_NAME, LOCATION_ID
FROM DEPARTMENTS;


-- 3.중복제거 DISTINCT
-- 일반: 107개 row
SELECT DEPARTMENT_ID
FROM EMPLOYEES;

-- 중복제거: 12개 row
SELECT DISTINCT DEPARTMENT_ID
FROM EMPLOYEES;


-- 컬럼이 여러개인 경우 중복제거 할 때: 20개 row
-- 복합 pk처럼 
SELECT DISTINCT JOB_ID, DEPARTMENT_ID
FROM EMPLOYEES;

-- 실습1. 직원 테이블에서 입사일 출력 후 행의 개수 확인: 107 row
SELECT HIRE_DATE
FROM EMPLOYEES;
-- 실습2. 직원 테이블에서 입사일 중복제거 출력 후 행의 개수 확인: 98 row
SELECT DISTINCT HIRE_DATE
FROM EMPLOYEES;

-- 4.  별칭alias 설정 =>4가지방법 => as를 선호한다.(직관적,가독성↑)=> 띄어쓰기
SELECT EMPLOYEE_ID 직원아이디
     , EMPLOYEE_ID "직원 아이디"
     , EMPLOYEE_ID AS 직원아이디
     , EMPLOYEE_ID AS "직원 아이디"
FROM EMPLOYEES;
-- 실습1. 직원 테이블에서 입사일, 입사일 다음날을 '입사일','입사일 다음날' 별칭으로 출력하기(4가지 방법 모두 사용)
SELECT HIRE_DATE 입사일
      ,HIRE_DATE "입사일"
      ,HIRE_DATE as 입사일
      ,HIRE_DATE as "입사일"

      ,HIRE_DATE + 1 입사일다음날
      ,HIRE_DATE + 1 "입사일 다음날"
      ,HIRE_DATE + 1 as 입사일다음날
      ,HIRE_DATE + 1 as "입사일 다음날"
FROM EMPLOYEES;

-- 5.NULL => 연산이 불가능하다. 
INSERT INTO EMPLOYEES(EMPLOYEE_ID, LAST_NAME, EMAIL, HIRE_DATE, JOB_ID)
VALUES (207, '박', 'neometin21', SYSDATE, 'IT_PROG');

SELECT SALARY
      ,SALARY+10
FROM EMPLOYEES
ORDER BY SALARY DESC;

