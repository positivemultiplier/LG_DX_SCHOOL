-- 4. WHER절 (IT PROGRAMER만 가져오기)
-- 조건을 걸 때 사용하는 절
SELECT  *
FROM EMPLOYEES
WHERE JOB_ID = 'IT_PROG';

-- 실습
-- 직원ID가 105인 사람의 성과 이름을 출력
SELECT FIRST_NAME, LAST_NAME
FROM EMPLOYEES
WHERE EMPLOYEE_id = 105;

-- 산술연산자(+,-,*,/)
SELECT SALARY
      ,SALARY+2
      ,SALARY-2
      ,SALARY*2
      ,SALARY/2
FROM EMPLOYEES;

-- 비교연산자(<, <=, >, >=)
-- 직원테이블에서(FROM) 급여가 5000 이하인(WHERE) 사람들의 이름과 급여를 출력(SELECT)
SELECT FIRST_NAME, SALARY
FROM EMPLOYEES
WHERE SALARY <= 5000;

-- 직원 테이블에서 연봉이 50000 이상인 사람들의 이름과 연봉을 출력, 단 연봉은 'AnnSal'로 출력
SELECT FIRST_NAME
       ,SALARY*12 AnnSal
       ,SALARY*12 "Ann Sal"
       ,SALARY*12 as AnnSal
       ,SALARY*12 as "AnnSal"
FROM EMPLOYEES
WHERE SALARY*12 >= 50000
ORDER BY "Ann Sal" ASC;

-- # 1. 등가비교연산자(=, !=, <>, ^=, NOT)
-- <>의미 : ~이 아니다
-- <> : 가장 많이 사용하는 연산자, 나머지 성능차이는 X

-- != 연산자 : 61개 나와야한다
SELECT *
FROM EMPLOYEES
WHERE DEPARTMENT_ID != 50;

-- <> 연산자 : 61개 나와야한다
SELECT *
FROM EMPLOYEES
WHERE DEPARTMENT_ID <> 50;

-- ^= 연산자 : 61개 나와야한다
SELECT *
FROM EMPLOYEES
WHERE DEPARTMENT_ID ^= 50;

-- NOT 연산자 : 61개 나와야한다
SELECT *
FROM EMPLOYEES
WHERE NOT DEPARTMENT_ID = 50;

-- 실습1 : JOB_ID가 FI_ACCOUNT가 아닌 직원의 이름과 JOB_ID를 출력 => 103row
-- ORDER BY 2(column 순서2 = JOB_ID) DESC(내림차순, 기본값은 ASC)
SELECT FIRST_NAME, JOB_ID
FROM EMPLOYEES
WHERE JOB_ID <> 'FI_ACCOUNT'
ORDER BY 2 DESC;

-- 실습2 : 급여가 10,000미만이 아닌 직원의 이름과 급여를 출력 => 19row
SELECT FIRST_NAME, SALARY
FROM EMPLOYEES
WHERE NOT SALARY < 10000;
--where SALARY >= 10000;


-- # 2. 논리(AND, OR, NOT) 연산자
-- AND : 교집합
-- OR : 합집합
-- NOT : ~이 아니다
-- 사용법 where 조건1 AND 조건2 AND 조건3 ...

--실습1 AND(두가지조건 다 만족시 출력): 부서ID가 90이고, 급여가 5000이상인 직원의 정보를 출력
SELECT *
FROM EMPLOYEES
WHERE DEPARTMENT_ID = 90
AND SALARY >= 5000;

--실습2 OR(하나라도 만족시 출력) : 부서ID가 100이거나, 입사일이 16년 2월 2일 이후에 입사한 직원의 정보를 출력
SELECT *
FROM EMPLOYEES
WHERE DEPARTMENT_ID = 100
OR HIRE_DATE > '16/02/02';
-- 날자를 적을때는 '' 감싸줘야한다. 16-02-02 (X), 16.02.02(X), 20160202(X)

-- 실습3. : 부서ID가 100이거나 90인 직원중에서(OR) 직원ID가 101인 사람의 직원ID, 이름, 연봉을 출력하기 * 연봉 컬럼명은 AnnSal
SELECT EMPLOYEE_ID, FIRST_NAME, SALARY * 12 AS "AnnSal"
FROM EMPLOYEES
WHERE (DEPARTMENT_ID = 100
OR DEPARTMENT_ID = 90)
AND EMPLOYEE_ID = 101;
-- 산술연산자 우선순위 : 1+2*3 => * 가 더 우선순위가 높다. => (1+2)*3 
-- 논리연산자 우선순위 : A OR B AND C => AND가 더 우선순위가 높다. => (A OR B) AND C 
-- 그래서 괄호를 사용해서 우선순위를 바꿔줄 수 있다

/*
-- BETWEEN .A. AND .B. : 범위 검색 연산자
SELECT *
FROM EMPLOYEES
WHERE SALARY BETWEEN 4000 AND 6000
ORDER BY SALARY DESC;


-- NULL : 값이 없다. => NULL과의 모든 연산은 FALSE
SELECT *
FROM EMPLOYEES
--WHERE SALARY IS NOT NULL;
--WHERE SALARY != NULL; (X)
--WHERE SALARY <> NULL; (X)
--WHERE SALARY ^= NULL; (X)
--WHERE NOT SALARY = NULL; (X)
WHERE SALARY IS NULL;
*/

-- # 4.IS NULL, IS NOT NULL
-- 실습1. IS NULL : 핸드폰 번호가 NULL인 직원의 이름과 번호를 출력
SELECT FIRST_NAME, PHONE_NUMBER, LAST_NAME
FROM EMPLOYEES
-- WHERE PHONE_NUMBER = NULL; (X)
WHERE PHONE_NUMBER IS NULL; 

-- 실습2. : 커미션 비율이 NULL이 아닌 직원의 이름과 커미션 비율을 출력
SELECT LAST_NAME, COMMISSION_PCT
from EMPLOYEES
-- WHERE COMMISSION_PCT != NULL; (X)
WHERE COMMISSION_PCT IS NOT NULL;



-- # 5. IN/NOT IN 연산자 : 여러개의 값을 한번에 비교할 때 사용
-- =연산자 + OR 연산자 => WHERE절에서 특정 값 여러개를 선택하고 싶을 때 사용
-- 실습1.(IN)연산자 : 부서ID가 30, 50, 90인 직원의 이름, 부서ID, 급여를 출력 => 54row
SELECT FIRST_NAME, DEPARTMENT_ID, SALARY
FROM EMPLOYEES
/*
WHERE DEPARTMENT_ID = 30
OR DEPARTMENT_ID = 50
OR DEPARTMENT_ID = 90
*/
WHERE DEPARTMENT_ID IN (30, 50, 90)
ORDER BY SALARY DESC;




-- 만약, 조건에 NULL이 포함되어 있다면? 54row
SELECT FIRST_NAME, DEPARTMENT_ID, SALARY
FROM EMPLOYEES
WHERE DEPARTMENT_ID IN (30, 50, 90, NULL);

/*
WHERE DEPARTMENT_ID = 30 => TRUE
OR DEPARTMENT_ID = 50 => TRUE
OR DEPARTMENT_ID = 90 => TRUE
OR DEPARTMENT_ID = NULL; => FALSE  => 전체 결과는 54row(OR 연산자 특성상 하나라도 TRUE면 전체가 TRUE)
*/


-- 실습2.(NOT IN)연산자 : 부서ID가 30, 50, 90이 아닌 직원의 이름, 부서ID, 급여를 출력 => 52row
-- IN 연산자의 부정(NOT) : = -> <>, OR -> AND
-- <> 연산자 + AND 연산자 => WHERE절에서 특정 값 여러개를 제외하고 싶을 때 사용
SELECT FIRST_NAME, DEPARTMENT_ID, SALARY
FROM EMPLOYEES
WHERE DEPARTMENT_ID NOT IN (30, 50, 90);
/*
WHERE DEPARTMENT_ID <> 30 => TRUE
AND DEPARTMENT_ID <> 50 => TRUE
AND DEPARTMENT_ID <> 90 => TRUE
AND DEPARTMENT_ID <> NULL; => FALSE => 전체 결과는 0row(AND 연산자 특성상 하나라도 FALSE면 전체가 FALSE)
*/


-- 나머지 2명의 행방은 => 2명의 부서ID가 NULL이기 때문이다.
SELECT *
FROM EMPLOYEES
WHERE DEPARTMENT_ID IS NULL; 


-- 실습1 JOB_ID가 AD_VP이거나 ST_MAN인 사람의 이름과 JOB_ID 출력 => 7row
SELECT FIRST_NAME, JOB_ID
FROM EMPLOYEES
WHERE JOB_ID IN ('AD_VP', 'ST_MAN');
/*
WHERE JOB_ID = 'AD_VP' => TRUE
OR JOB_ID = 'ST_MAN' => TRUE
*/


-- 실습2. 매니저ID가 145, 146, 147, 148, 149이 아닌 직원의 이름과 매니저ID 출력 => 76row
SELECT FIRST_NAME, MANAGER_ID
FROM EMPLOYEES
WHERE MANAGER_ID NOT IN (145, 146, 147, 148, 149)
ORDER BY 2 DESC ;
/*
WHERE MANAGER_ID <> 145 => TRUE
AND MANAGER_ID <> 146 => TRUE
AND MANAGER_ID <> 147 => TRUE
AND MANAGER_ID <> 148 => TRUE
AND MANAGER_ID <> 149 => TRUE
*/





-- # 6. BETWEEN A AND B : 범위 검색 연산자 (A이상 B이하)

-- 실습1. 급여가 3천만원인 직원들을 출력
SELECT *
FROM EMPLOYEES
/* 
WHERE SALARY >= 3000
AND SALARY < 4000;
*/
WHERE SALARY BETWEEN 3000 AND 3999.99; 


--실습2. 2005년 입사한 직원들을 출력 => 코드에는 이상 없는것같다. 
SELECT FIRST_NAME, HIRE_DATE
FROM EMPLOYEES
WHERE HIRE_DATE BETWEEN '05/01/01' AND '05/12/31'
ORDER BY 2;
-- 왜 108 row 나오는거야? 



-- # 7. LIKE 연산자: 특정 조건을 검색할 때 사용//  패턴 검색 연산자 (문자열에서 특정 패턴을 검색할 때 사용)
-- 와일드카드 % : 문자대체
/*
% : 문자열을 대체: 이름이 S로 시작하는 직원들을 출력
_ : 문자 1개를 대체: 이름이 S로 시작하고, 두번째 문자가 a인 직원들을 출력
컬럼 LIKE 'S%' : S로 시작하는 직원들을 출력
컬럼 LIKE 'S__' : S로 시작하고, 3글자인 직원들을 출력


*/
-- 이름이 S로 시작하는(대소문자 구분) 직원들을 출력 => 13row
SELECT FIRST_NAME
FROM EMPLOYEES
WHERE FIRST_NAME LIKE 'S%';


-- 이름이 S로 끝나는(대소문자 구분) 직원들을 출력 => 7row
SELECT FIRST_NAME
FROM EMPLOYEES
WHERE FIRST_NAME LIKE '%s';

-- 이름에 s가 들어가는(대소문자 구분) 직원들을 출력 => 20row      
SELECT FIRST_NAME
FROM EMPLOYEES
WHERE FIRST_NAME LIKE '%s%';


-- _(언더바) : 문자를 대체
-- 직원아이디가 1로 시작하는 100번대 직원들 출력 => 100row
SELECT EMPLOYEE_ID
FROM EMPLOYEES
WHERE EMPLOYEE_ID LIKE '1__';

-- 직원아이디가 중간에 1이 들어가는 직원들 출력 => 10row
SELECT EMPLOYEE_ID
FROM EMPLOYEES
WHERE EMPLOYEE_ID LIKE '_1_';

-- 직원아이디가 1로 끝나는 직원들 출력 => 11 row
SELECT EMPLOYEE_ID
FROM EMPLOYEES
WHERE EMPLOYEE_ID LIKE '__1';


-- 실습1. 이름이 S로 시작하고 n로 끝나는 직원 찾기 => 4row
SELECT *
FROM EMPLOYEES
WHERE FIRST_NAME LIKE 'S%'
AND FIRST_NAME LIKE '%n';
-- 4row
SELECT *
FROM EMPLOYEES
WHERE FIRST_NAME LIKE 'S%n';
-- AND FIRST_NAME LIKE '%_n';

-- 실습2. 이름에 두번째 글자가 e인 직원 찾기 => 15row
SELECT *
from EMPLOYEES
WHERE FIRST_NAME LIKE '_e%';

-- 실습3. 01월에 입사한 직원 찾기 => 14row
SELECT *
FROM EMPLOYEES
WHERE HIRE_DATE LIKE '%/01/%';
-- WHERE HIRE_DATE LIKE '___01___';
-- WHERE HIRE_DATE LIKE '___01%';




