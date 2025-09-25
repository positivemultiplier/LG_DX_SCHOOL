
-- JOIN : 필요한 데이터가 두 개 이상의 테이블에 나눠져 있을 때 데이터를 합쳐서 가져오고자 할 때 사용
-- 직원 ID가 100인 직원의 부서 이름을 출력
-- EMPLOYEES 테이블과 DEPARTMENTS 테이블을 JOIN
-- DEPARTMENTS PK(primary key) : DEPARTMENT_ID
-- EMPLOYEES FK(foreign key) : DEPARTMENT_ID
-- FK에는 PK의 값만 들어올 수 있음

-- #1. JOIN 사용하지 않고 문제 해결
-- 1. 직원ID가 100번인 직원의 부서 정보 파악 => 90
SELECT DEPARTMENT_ID
FROM EMPLOYEES
WHERE EMPLOYEE_ID = 100;
-- 2. 90번 부서의 이름을 파악
SELECT DEPARTMENT_NAME
FROM DEPARTMENTS
WHERE DEPARTMENT_ID = 90;



-- 3#2. JOIN 사용해서 문제 해결
-- join은 oracle에서만 지원하는 방식이다. 
-- mysql OR mongoDB에서는 다른 방식으로 join을 구현해야한다.


-- 4. 원하는 컬럼만 SELECT
SELECT E.EMPLOYEE_ID, E.DEPARTMENT_ID, D.DEPARTMENT_ID, D.DEPARTMENT_NAME

-- 1. 어느테이블의 DEPARTMENT_ID를 사용할지 명시 필요 => ★★★별칭 Alias 사용해야한다.★★★ 
FROM EMPLOYEES E, DEPARTMENTS D

-- 2. DEPARTMENT_ID가 같은 행끼리 결합
WHERE E.DEPARTMENT_ID = D.DEPARTMENT_ID

-- 3. 직원ID가 100번인 직원의 부서 이름을 파악
AND E.EMPLOYEE_ID = 100;



/* FROM절 
SELECT : 출력하고 싶은 컬럼
FROM : 테이블 A 별칭, 테이블 B 별칭
- 테이블 여러개 지정하여 출력가능
- 컬럼은 어떤 테이블의 컬럼인ㄴ지 지정
- 테이블에 별칭 생성 가능
- 별칭 사용 

1. 테이블 여러개 사용 가능
2. 테이블에 별칭 사용 가능
3. 테이블이 여러개일 경우 공통된 컬럼이 있을 때 어떤 테이블의 컬럼인지 정확하게 명시
*/


-- ORA-00918: column ambiguously defined
-- 두개의 테이블 다 DEPARTMENT_ID 컬럼이 존재하기 때문에 에러 발생
SELECT DEPARTMENT_ID
FROM EMPLOYEES, DEPARTMENTS;

-- 해결방법1. 테이블명 명시
SELECT EMPLOYEES.DEPARTMENT_ID
FROM EMPLOYEES, DEPARTMENTS;

-- ORA-00904: "EMPLOYEES"."DEPARTMENT_ID"  => 별칭 지정시 그 뒤에 실행되는 절에서는 모두 별칭만 사용해라.
SELECT EMPLOYEES.DEPARTMENT_ID
FROM EMPLOYEES E, DEPARTMENTS D;

-- 해결방법 : 1. 별칭 사용 2. 테이블명 명시
-- 해결방법1. 별칭 사용 => 별칭 지정시 그 뒤에 실행되는 절에서는 모두 별칭만 사용해라. 
SELECT E.DEPARTMENT_ID
FROM EMPLOYEES E, DEPARTMENTS D;

/*CROSS JOIN // 카티션 곱 => Oracle에서만 지원하는방식
- 두 개의 테이블을 Cartesian Product 방식으로 결합
- 결과는 두 테이블의 모든 조합
- 일반적으로 사용되지 않음

-- 직원테이블의 108개 X 부서테이블 27개 = 2916개 행 생성
-- cartesian 곱으로 출력하면 모든 직원에 부서이름 1개씩을 붙여서 출력하는것!
-- 원하는 대로 출력하려면 조인 조건이 필요!
*/
SELECT EMPLOYEE_ID, E.DEPARTMENT_ID, DEPARTMENT_NAME
FROM EMPLOYEES E, DEPARTMENTS D;

/*INNER JOIN =>테이블간의 교집합 
- 일반적으로 JOIN이라고 하면 내부조인(INNER JOIN)을 의미
- 등가조인(Equi Join) : 두 테이블의 특정 컬럼이 같은 행끼리 결합
- 출력 행을 각 테이블의 특정 열에 일치한 데이터를 기준으로 출력하는 방법
*/

-- 각 직원의 부서이름을 출력! 106 row 2명은 DEPARTMENT_ID가 NULL   
SELECT EMPLOYEE_ID, DEPARTMENT_NAME
FROM EMPLOYEES E, DEPARTMENTS D 
WHERE E.DEPARTMENT_ID = D.DEPARTMENT_ID
ORDER BY 1 ASC;


/* Oracle 이외의 다른곳에서도 지원한다. 
# 3. ANSI JOIN 
ANSI 미국 표준협회
*/

SELECT EMPLOYEE_ID, DEPARTMENT_NAME
FROM EMPLOYEES E INNER JOIN DEPARTMENTS D
ON E.DEPARTMENT_ID = D.DEPARTMENT_ID
ORDER BY 1 ASC;
-- 106개의 행만 나오는 이유는? DEPARTMENT_ID가 NULL인 직원 2명은 제외되기 때문
-- INNER JOIN 자체는 NULL은 비교가 불가능해서 출력X
-- 만약, NULL값인 데이터도 출력하고 싶다면? => OUTER JOIN 사용



/*
# 4. OUTER JOIN => 합집합
- LEFT OUTER JOIN : 왼쪽 테이블의 모든 행과 오른쪽 테이블의 일치하는 행을 결합
- FULL OUTER JOIN : 양쪽 테이블의 모든 행을 결합
- RIGHT OUTER JOIN : 오른쪽 테이블의 모든 행과 왼쪽 테이블의 일치하는 행을 결합
*/

-- 4.1. LEFT OUTER JOIN : 왼쪽 테이블을 기준으로 OUTER JOIN(INNER JOIN + 왼쪽 NULL값 포함)=> 108row(inner 106, left null 2)
-- 부서에 배치되지 않은 직원= left null 2
SELECT EMPLOYEE_ID, E.DEPARTMENT_ID, D.DEPARTMENT_ID, DEPARTMENT_NAME
FROM EMPLOYEES E LEFT OUTER JOIN DEPARTMENTS D
ON E.DEPARTMENT_ID = D.DEPARTMENT_ID
ORDER BY 1 ASC;
-- 4.2. RIGHT OUTER JOIN : 오른쪽 테이블을 기준으로 OUTER JOIN(INNER JOIN + 오른쪽 NULL값 포함) => 122row(inner 106, right null 16)
-- 부서는 있는데 직원이 없는 부서= right null 16
SELECT EMPLOYEE_ID, E.DEPARTMENT_ID, D.DEPARTMENT_ID, DEPARTMENT_NAME
FROM EMPLOYEES E RIGHT OUTER JOIN DEPARTMENTS D
ON E.DEPARTMENT_ID = D.DEPARTMENT_ID
ORDER BY 1 ASC;


-- 4.3. FULL OUTER JOIN : 양쪽 테이블을 기준으로 OUTER JOIN(INNER JOIN + 양쪽 NULL값 포함) => 124row(inner 106, 왼쪽 null 2, 오른쪽 null 16)
-- 부서에 배치되지 않은 직원= left null 2 + 부서는 있는데 직원이 없는 부서= right null 16
SELECT EMPLOYEE_ID, E.DEPARTMENT_ID, D.DEPARTMENT_ID, DEPARTMENT_NAME
FROM EMPLOYEES E FULL OUTER JOIN DEPARTMENTS D
ON E.DEPARTMENT_ID = D.DEPARTMENT_ID
ORDER BY 1 ASC;


/*
-- # 5. Oracle 문법 (+)
-- (+)가 없으면 INNER JOIN
-- OUTER JOIN을 하고 싶은 반대쪽 테이블에 (+)기호 붙여주기!
-- RIGHT OUTER JOIN => 왼쪽에 (+)
-- LEFT OUTER JOIN => 오른쪽에 (+)
-- FULL OUTER JOIN => UNION 연산자를 사용
*/

-- 5.1.INNER JOIN => 106row
SELECT EMPLOYEE_ID, DEPARTMENT_NAME
FROM EMPLOYEES E, DEPARTMENTS D 
WHERE E.DEPARTMENT_ID = D.DEPARTMENT_ID
ORDER BY 1 ASC;

-- 5.2.LEFT OUTER JOIN => 108row (inner 106, left null 2)
SELECT EMPLOYEE_ID, DEPARTMENT_NAME
FROM EMPLOYEES E, DEPARTMENTS D 
WHERE E.DEPARTMENT_ID = D.DEPARTMENT_ID(+)
ORDER BY 1 ASC;

-- 5.3.RIGHT OUTER JOIN => 122row (inner 106, right null 16)
SELECT EMPLOYEE_ID, DEPARTMENT_NAME
FROM EMPLOYEES E, DEPARTMENTS D 
WHERE E.DEPARTMENT_ID(+) = D.DEPARTMENT_ID
ORDER BY 1 ASC;

-- 5.4.FULL OUTER JOIN 
-- 5.4.1.UNION 연산자 사용: 합집합(중복X) => 124row (inner 106, left null 2, right null 16)
SELECT EMPLOYEE_ID, DEPARTMENT_NAME
FROM EMPLOYEES E, DEPARTMENTS D 
WHERE E.DEPARTMENT_ID = D.DEPARTMENT_ID(+)
UNION 

SELECT EMPLOYEE_ID, DEPARTMENT_NAME
FROM EMPLOYEES E, DEPARTMENTS D 
WHERE E.DEPARTMENT_ID(+) = D.DEPARTMENT_ID
ORDER BY 1 ASC;

-- 5.4.2.UNION ALL 연산자 사용: 합집합(중복O) => 230row (inner 106, left null 2, right null 16, inner 106, left null 2, right null 16)
SELECT EMPLOYEE_ID, DEPARTMENT_NAME
FROM EMPLOYEES E, DEPARTMENTS D 
WHERE E.DEPARTMENT_ID = D.DEPARTMENT_ID(+)
UNION ALL 

SELECT EMPLOYEE_ID, DEPARTMENT_NAME
FROM EMPLOYEES E, DEPARTMENTS D 
WHERE E.DEPARTMENT_ID(+) = D.DEPARTMENT_ID
ORDER BY 1 ASC;



-- 실습1.Oracle문법 => 각 직원의 직책의 이름을 출력
-- PK(primary key) : JOBS TABLE - JOB_ID
-- FK(foreign key) : EMPLOYEES TABLE - JOB_ID
SELECT E.FIRST_NAME AS "이름", JOB_TITLE AS "직책", E.JOB_ID, J.JOB_ID
FROM EMPLOYEES E, JOBS J
WHERE E.JOB_ID = J.JOB_ID
ORDER BY 1 ASC;


-- 실습2. ANSI 문법 => LEFT, RIGHT, FULL OUTER JOIN으로 변경
-- 실습2.1 INNER JOIN 
SELECT E.FIRST_NAME AS "이름", JOB_TITLE AS "직책"
FROM EMPLOYEES E INNER JOIN JOBS J
ON E.JOB_ID = J.JOB_ID
ORDER BY 1 ASC;


-- 실습2.2 LEFT OUTER JOIN
SELECT E.FIRST_NAME AS "이름", JOB_TITLE AS "직책"
FROM EMPLOYEES E LEFT OUTER JOIN JOBS J
ON E.JOB_ID = J.JOB_ID
ORDER BY 1 ASC;

-- 실습2.3 RIGHT OUTER JOIN
SELECT E.FIRST_NAME AS "이름", JOB_TITLE AS "직책"
FROM EMPLOYEES E RIGHT OUTER JOIN JOBS J
ON E.JOB_ID = J.JOB_ID
ORDER BY 1 ASC;

-- 실습2.4 FULL OUTER JOIN
SELECT E.FIRST_NAME AS "이름", JOB_TITLE AS "직책"
FROM EMPLOYEES E LEFT OUTER JOIN JOBS J
ON E.JOB_ID = J.JOB_ID

UNION ALL

SELECT E.FIRST_NAME AS "이름", JOB_TITLE AS "직책"
FROM EMPLOYEES E RIGHT OUTER JOIN JOBS J
ON E.JOB_ID = J.JOB_ID
ORDER BY 1 ASC;



-- 실습3. Oracle문법  
-- 각 직책(JOB_TITLE)별로 급여의 총합을 구하되, 직책에 Representative가 포함된 사람은 제외
-- 급여의 총합이 30,000을 초과하는 직책을 나타내며, 총합에 대해서 오름차순으로 정렬
-- 직책의 column은 "JOB", 급여의 총합은 "급여" 라고 표현함

-- 1. 직책별로 급여의 총합 구하기
SELECT J.JOB_TITLE AS "직책", SUM(E.SALARY) AS "급여"
FROM EMPLOYEES E, JOBS J
WHERE E.JOB_ID = J.JOB_ID
GROUP BY J.JOB_TITLE;

-- 2. 직책에 Representative가 포함된 사람 제외
SELECT J.JOB_TITLE AS "직책", SUM(E.SALARY) AS "급여"
FROM EMPLOYEES E, JOBS J
WHERE E.JOB_ID = J.JOB_ID
AND J.JOB_TITLE NOT LIKE '%Representative%'
GROUP BY J.JOB_TITLE;

-- 3. 급여의 총합이 30,000을 초과하는 직책을 나타내며, 총합에 대해서 오름차순으로 정렬
SELECT J.JOB_TITLE AS "직책", SUM(E.SALARY) AS "급여"
FROM EMPLOYEES E, JOBS J
WHERE E.JOB_ID = J.JOB_ID
AND J.JOB_TITLE NOT LIKE '%Representative%'
GROUP BY J.JOB_TITLE
HAVING SUM(E.SALARY) > 30000
ORDER BY "급여" ASC;

-- 4. ANSI 문법으로 변경
SELECT J.JOB_TITLE AS "직책", SUM(E.SALARY) AS "급여"
FROM EMPLOYEES E INNER JOIN JOBS J
ON E.JOB_ID = J.JOB_ID
WHERE J.JOB_TITLE NOT LIKE '%Representative%'
GROUP BY J.JOB_TITLE
HAVING SUM(E.SALARY) > 30000
ORDER BY "급여" ASC;



-- 풀이 : 
SELECT JOB_TITLE, SUM(SALARY)
FROM EMPLOYEES E, JOBS J  
WHERE E.JOB_ID = J.JOB_ID
AND JOB_TITLE NOT LIKE '%Representative%'
GROUP BY JOB_TITLE
HAVING SUM(SALARY) > 30000
ORDER BY 2 ASC;





-- 실습 4. 각 부서별로 2005년 이전에 입사한 직원들의 인원수를 조회
-- 부서명, 인원수 이름으로 출력

-- 1. 각 부서별로 2005년 이전에 입사한 직원들의 인원수 조회
SELECT D.DEPARTMENT_NAME AS "부서명", COUNT(E.EMPLOYEE_ID) AS "인원수"
FROM EMPLOYEES E, DEPARTMENTS D
WHERE E.DEPARTMENT_ID = D.DEPARTMENT_ID
AND E.HIRE_DATE < TO_DATE('2005-01-01', 'YYYY-MM-DD')
GROUP BY D.DEPARTMENT_NAME
ORDER BY "인원수" DESC;

















