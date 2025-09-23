-- 1. 연봉이 120,000 이상인 직원의 이름과 연봉을 출력하시오. => 19 row
SELECT FIRST_NAME AS "사원이름", SALARY*12 AS "연봉"
FROM EMPLOYEES
WHERE SALARY*12 >= 120000
ORDER By 2 DESC;

-- 2. 사원번호가 176인 사원의 이름과 부서 번호를 출력하시오. => 1 row
SELECT FIRST_NAME AS "사원이름", DEPARTMENT_ID AS "부서번호"
FROM EMPLOYEES
WHERE EMPLOYEE_ID = 176;

-- 3. 연봉이 150,000 에서 200,000의 범위 이외인 사원들의 이름 및 연봉을 출력하시오. 단, 연봉은 AnnSal로 출력하시오. => 104 row
SELECT FIRST_NAME AS "사원이름", SALARY*12 AS "Ann Sal"
FROM EMPLOYEES
WHERE SALARY * 12 NOT BETWEEN 150000 AND 200000;


-- 4.1. 2003/01/01 부터 2005/05/30일 사이에 고용된 사원들의 이름, 사번, 고용일자를 출력하시오. 고용일자를 역순으로 정렬하시오.
SELECT FIRST_NAME AS "사원이름", EMPLOYEE_ID AS "사원번호", HIRE_DATE AS "고용일자"
FROM EMPLOYEES
WHERE HIRE_DATE BETWEEN '03/01/01' AND '05/05/30'
ORDER BY HIRE_DATE DESC; 

-- 4.2. 2003/01/01 부터 2005/05/30일 사이에 고용된 사원들의 이름, 사번, 고용일자를 출력하시오. 고용일자를 역순으로 정렬하시오.
/*
원인: 문자열 날짜('03/01/01')에 대한 암묵적 형변환과 NLS_DATE_FORMAT 차이 때문. 
도구마다 문자열→DATE 파싱이 달라져 필터/정렬이 기대와 다르게 동작할 수 있음. 
날짜는 ANSI DATE 리터럴 또는 TO_DATE로 명시하고, 시간값 무시하려면 TRUNC를 사용.
*/

SELECT FIRST_NAME AS "사원이름", EMPLOYEE_ID AS "사원번호", HIRE_DATE AS "고용일자"
FROM EMPLOYEES
WHERE TRUNC(HIRE_DATE) BETWEEN DATE '2003-01-01' AND DATE '2005-05-30'
ORDER BY TRUNC(HIRE_DATE) DESC, EMPLOYEE_ID DESC;


-- 5. 20번 및 50번 부서에서 근무하는 모든 사원들의 이름 및 부서 번호를 알파벳순으로 출력하시오. => 47row
SELECT FIRST_NAME AS "사원이름", DEPARTMENT_ID AS "부서번호"
FROM EMPLOYEES
WHERE DEPARTMENT_ID IN (20, 50)
ORDER BY 2 ASC;

-- 6. 20번 및 50번 부서에서 근무하며, 연봉이 200,000 ~ 250,000 사이인 사원들의 이름 및 연봉을 출력하시오.
SELECT FIRST_NAME AS "사원이름", SALARY*12 AS "연봉"
FROM EMPLOYEES
WHERE DEPARTMENT_ID IN (20, 50)
AND SALARY*12 BETWEEN 200000 AND 250000;

-- 7.1. 2006년도에 고용된 모든 사람들의 이름 및 고용일을 조회한다.
SELECT FIRST_NAME AS "사원이름", HIRE_DATE AS "고용일자"
FROM EMPLOYEES
WHERE HIRE_DATE BETWEEN '06/01/01' AND '06/12/31';

-- 7.2. 2006년도에 고용된 모든 사람들의 이름 및 고용일을 조회한다.
SELECT FIRST_NAME AS "사원이름", HIRE_DATE AS "고용일자"
FROM EMPLOYEES
-- WHERE HIRE_DATE BETWEEN TO_DATE('06/01/01', 'RR/MM/DD') AND TO_DATE('06/12/31', 'RR/MM/DD');
/*
원인: 문자열 날짜('03/01/01')에 대한 암묵적 형변환과 NLS_DATE_FORMAT 차이 때문. 
도구마다 문자열→DATE 파싱이 달라져 필터/정렬이 기대와 다르게 동작할 수 있음. 
날짜는 ANSI DATE 리터럴 또는 TO_DATE로 명시하고, 시간값 무시하려면 TRUNC를 사용.
*/
WHERE TRUNC(HIRE_DATE) BETWEEN DATE '2006-01-01' AND DATE '2006-12-31';


-- 8. 매니저가 없는 사람들의 이름 및 업무를 출력하시오. 2row
SELECT FIRST_NAME AS "사원이름", JOB_ID AS "업무"
FROM EMPLOYEES
WHERE MANAGER_ID IS NULL;

-- 9. 매니저가 있는 사람들의 이름 및 업무, 매니저번호를 조회한다. => 106row
SELECT FIRST_NAME AS "사원이름", JOB_ID AS "업무", MANAGER_ID AS "매니저번호"
FROM EMPLOYEES
WHERE MANAGER_ID IS NOT NULL;


-- 10. 커미션을 받는 모든 사원들의 이름, 연봉 및 커미션을 출력하시오. => 35row
-- 연봉을 역순으로 정렬하고, 연봉은 ANNSAL로 출력하시오.
SELECT FIRST_NAME AS "사원이름", SALARY*12 AS "ANN SAL", COMMISSION_PCT AS "커미션"
FROM EMPLOYEES
WHERE COMMISSION_PCT IS NOT NULL
ORDER BY 'ANN SAL' DESC;


-- 11. 이름의 네번째 글자가 a인 사원의 이름을 조회하시오 => 12row
SELECT FIRST_NAME AS "사원이름"
FROM EMPLOYEES
WHERE FIRST_NAME LIKE '___a%';


-- 12. 이름에 a 및 e 글자가 있는 사원의 이름을 조회하시오. => 95row
SELECT FIRST_NAME AS "사원이름"
FROM EMPLOYEES
WHERE FIRST_NAME LIKE '%a%'
OR FIRST_NAME LIKE '%e%';

-- 13. 급여가 2500, 3500, 7000이 아니며 직업이 SA_REP나 ST_CLERK인 사원의 이름과 급여,직업을 출력하시오. => 43row
SELECT FIRST_NAME AS "사원이름", SALARY AS "급여", JOB_ID AS "직업"
FROM EMPLOYEES
WHERE SALARY NOT IN (2500, 3500, 7000)
AND JOB_ID IN ('SA_REP', 'ST_CLERK')
ORDER BY 2 DESC;

-- 14. 30번 부서내의 모든 직업들을 유일한 값(중복제거, Distinct)으로 출력하시오. 90번 부서 또한 포함하고, 직업을 오름차순으로 출력하시오. => 9row
-- 문제 이해X
SELECT DISTINCT JOB_ID AS "직업"
FROM EMPLOYEES
WHERE DEPARTMENT_ID IN (30, 90)
ORDER BY 1 ASC;

-- 15. 회사 전체의 최대 급여, 최소 급여, 급여 총 합 및 평균 급여를 출력하시오.
SELECT MAX(SALARY) AS "최대급여", MIN(SALARY) AS "최소급여", SUM(SALARY) AS "급여총합", ROUND(AVG(SALARY), 2) AS "평균급여"
FROM EMPLOYEES;

-- 16. 동일한 직업을 가진 사원들의 총 수를 출력하시오.
SELECT JOB_ID, COUNT(*) AS "사원수"
FROM EMPLOYEES
GROUP BY JOB_ID
ORDER BY 2 DESC;

SELECT JOB_ID, COUNT(employee_ID)
FROM EMPLOYEES
GROUP BY JOB_ID
ORDER BY 2 DESC;


-- 17. 각 직업별, 최대 급여, 최소 급여, 급여 총 합 및 평균 급여를 출력하시오. 단 최대 급여는 MAX, 최소 급여는 MIN, 급여 총 합은 SUM 및 평균 급여는 AVG로 출력하고, 직업을 오름차순으로 정렬하시오.
SELECT JOB_ID
      ,MAX(SALARY) AS "최대 급여(MAX)"
      ,MIN(SALARY) AS "최소 급여(MIN)"
      ,SUM(SALARY) AS "급여 총 합(SUM)"
      ,ROUND(AVG(SALARY)) AS "평균 급여(AVG)"
FROM EMPLOYEES
GROUP BY JOB_ID
ORDER BY JOB_ID ASC;

-- 18. 매니저로 근무하는 사원들의 총 수를 출력하시오.

SELECT COUNT(DISTINCT MANAGER_ID)
FROM EMPLOYEES;


-- 19. 사내의 최대 급여 및 최소 급여의 차이를 출력하시오. 
SELECT MAX(SALARY) - MIN(SALARY) AS "급여차이"
FROM EMPLOYEES;

-- 20. 모든 사원들의 이름, 부서 이름 및 부서 번호를 출력하시오. 
