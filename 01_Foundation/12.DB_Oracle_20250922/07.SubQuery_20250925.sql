/*
SubQuery CH10 p427 :

1. 서브쿼리 : 메인쿼리문을 실행시키기 위한 데이터를 조회하는 또 다른 쿼리문
2. 단일행, 다중행, 다중열 서브쿼리
3. From절 서브쿼리
4. Select 절 서브쿼리
*/


-- 실습1. first_name이 'Nancy'인 직원이 속한 부서의 평균 급여를 구하시오.
-- 1.1. Nancy라는 직원이 속한 부서의 ID 파악후 결과값 구하기.(동적인 변경이 불가능하다. 부서ID가 바뀌면 다시 조회해야한다.)
SELECT ROUND(AVG(SALARY), 2) AS "평균급여"
FROM EMPLOYEES
WHERE DEPARTMENT_ID = 100;


-- 1.2. Nancy라는 직원이 속한 부서의 ID 파악후 결과값 구하기.(동적인 변경이 가능하다.)
-- Nancy의 부서ID 100찾아야한다
SELECT DEPARTMENT_ID
FROM EMPLOYEES
WHERE FIRST_NAME = 'Nancy';


-- 1.3. 1.1과 1.2를 합쳐서 서브쿼리로 작성
SELECT ROUND(AVG(SALARY), 2) AS "평균급여"
FROM EMPLOYEES
WHERE DEPARTMENT_ID = (
    SELECT DEPARTMENT_ID
    FROM EMPLOYEES
    WHERE FIRST_NAME = 'Nancy'
);




-- 실습2. 'Nancy'보다 빨리 입사한 직원의 first_name과 입사일을 조회해주세요!
-- 2.1. Nancy의 입사일 조회
SELECT HIRE_DATE 
FROM EMPLOYEES
WHERE FIRST_NAME = 'Nancy';

-- 2.2. Nancy보다 빨리 입사한 직원 조회
SELECT FIRST_NAME AS "이름", HIRE_DATE AS "입사일"
FROM EMPLOYEES
WHERE HIRE_DATE < (
    SELECT HIRE_DATE 
    FROM EMPLOYEES 
    WHERE FIRST_NAME = 'Nancy'
)
ORDER BY HIRE_DATE DESC
;


-- 실습3. 전 직원의 평균 급여보다 더 받는 직원의 사번, 급여를 조회해주세요!
-- 3.1. 전 직원의 평균 급여 조회
-- where절에는 집계함수 사용 불가 (where절은 행(row)단위로 필터링하기 때문에 집계(aggregate) 함수와 함께 사용할 수 없습니다. 
-- 집계(aggregate)는 column 단위로 그룹화 된 상태(select절)에서 사용 가능한것)
SELECT ROUND(AVG(SALARY), 2) AS "평균급여"
FROM EMPLOYEES;

-- 3.2. 전 직원의 평균 급여보다 더 받는 직원 조회
SELECT EMPLOYEE_ID AS "사원번호", SALARY AS "급여"
FROM EMPLOYEES
WHERE SALARY > (
    SELECT ROUND(AVG(SALARY), 2)
    FROM EMPLOYEES
)
ORDER BY SALARY DESC
;


-- 실습4. 'IT'부서의 부서장보다 더 많이 받는 직원의 사번, 급여 조회해주세요!

-- 4.1. IT부서의 부서장 ID 조회
-- 부서장의 이름은 Alexander => 사원번호는 103
SELECT MANAGER_ID AS "부서장ID"
FROM DEPARTMENTS
WHERE DEPARTMENT_NAME = 'IT';

-- 4.2. IT부서의 부서장의 급여 조회
-- 부서장의 사원번호는 103 => 급여는 9000
SELECT EMPLOYEE_ID AS "사원번호", FIRST_NAME AS "이름", SALARY AS "급여"
FROM EMPLOYEES
WHERE EMPLOYEE_ID = (
    SELECT MANAGER_ID
    FROM DEPARTMENTS
    WHERE DEPARTMENT_NAME = 'IT'
);

-- 4.3. IT부서의 부서장보다 더 많이 받는 직원 조회
-- 부서장의 급여 9000보다 더 많이 받는 직원은 ==> 23 row
SELECT FIRST_NAME AS "이름", EMPLOYEE_ID AS "사원번호", SALARY AS "급여"
FROM EMPLOYEES
WHERE SALARY > ( 
    SELECT SALARY
    FROM EMPLOYEES
    WHERE EMPLOYEE_ID = (
        SELECT MANAGER_ID
        FROM DEPARTMENTS
        WHERE DEPARTMENT_NAME = 'IT'
    )
)
ORDER BY SALARY DESC
;

-- 4.4.1 join문을 사용한 풀이법

SELECT SALARY 
FROM EMPLOYEES , DEPARTMENTS
WHERE DEPARTMENT_NAME = 'IT' and EMPLOYEES.EMPLOYEE_ID = DEPARTMENTS.MANAGER_ID;

-- 각 부서의 부서장 급여를 출력해주세요
SELECT FIRST_NAME, SALARY 
    -- Cross Join 발생해버림. => where절에서 연결시켜줘야함.
FROM DEPARTMENTS, EMPLOYEES
    -- 연결시켜야해 => 부서번호와 부서장사번과 같아야함
WHERE DEPARTMENTS.MANAGER_ID = EMPLOYEES.DEPARTMENT_ID
;

-- 4.4 Join문을 사용한 풀이법
select employee_id, SALARY
from EMPLOYEES
where salary > (
    select SALARY
    from employees e, departments d 
    where department_name = 'IT' and e.employee_id = d.manager_id
    );


-- 4.5 강사님이 주로 사용하는 방법 => 직관적이라고함
SELECT EMPLOYEE_ID, SALARY
FROM EMPLOYEES
WHERE SALARY > (
    SELECT SALARY
    FROM EMPLOYEES
    WHERE EMPLOYEE_ID = (
        SELECT MANAGER_ID
        FROM DEPARTMENTS
        WHERE DEPARTMENT_NAME ='IT')
);



-- 실습5. 'IT'부서에서 근무하고 있는 직원들의 이름과 급여를 구해주세요! 
-- 5.1. IT부서의 부서ID 조회 => Primary Key는 DEPARTMENT_ID
-- IT부서의 DEPARTMENT_ID는 60이다
SELECT DEPARTMENT_ID
FROM DEPARTMENTS
WHERE DEPARTMENT_NAME = 'IT';

-- 5.2. IT부서에서 근무하고 있는 직원들의 이름과 급여 조회
-- DEPARTMENT_ID 60 인직원은 6명이다.
SELECT FIRST_NAME AS "이름", SALARY AS "급여"
FROM EMPLOYEES
WHERE DEPARTMENT_ID = (
    SELECT DEPARTMENT_ID
    FROM DEPARTMENTS
    WHERE DEPARTMENT_NAME = 'IT'

)
ORDER BY SALARY DESC
;

-- 실습6. 'IT','Sales' 부서에서 근무하고 있는 직원들의 이름과 급여를 구해주세요!
-- 6.1 'IT','Sales' 부서의 부서ID 조회
-- IT부서의 DEPARTMENT_ID는 60, Sales부서의 DEPARTMENT_ID는 80이다.
SELECT DEPARTMENT_ID
FROM DEPARTMENTS
WHERE DEPARTMENT_NAME = 'IT' OR DEPARTMENT_NAME = 'Sales';



-- 6.2. 'IT','Sales' 부서에서 근무하고 있는 직원들의 이름과 급여 조회
-- SubQuery DATA는 단일행(Single Row)1개가 아니라 여러개일때 IN절 or 다중행(Multi Row)을 사용한다.
-- DEPARTMENT_ID 60, 80 인 직원은 39명이다.
SELECT FIRST_NAME AS "이름", DEPARTMENT_ID AS "부서ID", SALARY AS "급여"
FROM EMPLOYEES
WHERE DEPARTMENT_ID IN (
    SELECT DEPARTMENT_ID
    FROM DEPARTMENTS
    WHERE DEPARTMENT_NAME = 'IT' OR DEPARTMENT_NAME = 'Sales'
)
ORDER BY DEPARTMENT_ID DESC, SALARY DESC
;


-- 실습7. 직원의 평균급여보다 더 많이 받는 직원을 포함한 부서 명 출력
-- 7.1. 직원의 평균급여 조회
SELECT ROUND(AVG(SALARY), 2) AS "평균급여"
FROM EMPLOYEES;

-- 7.2 . 직원의 평균급여보다 더 많이 받는 직원 조회
SELECT FIRST_NAME, SALARY, DEPARTMENT_ID
FROM EMPLOYEES
WHERE SALARY > (
    SELECT ROUND(AVG(SALARY), 2) AS "평균급여"
    FROM EMPLOYEES
)
ORDER BY SALARY DESC
;
-- 7.3. 직원의 평균급여보다 더 많이 받는 직원을 포함한 부서 명 출력
SELECT DISTINCT DEPARTMENT_NAME
FROM DEPARTMENTS
WHERE DEPARTMENT_ID IN (
    SELECT DEPARTMENT_ID
    FROM EMPLOYEES
    WHERE SALARY > (
        SELECT ROUND(AVG(SALARY), 2) AS "평균급여"
        FROM EMPLOYEES
    )
);

-- 실습8. seattle에서 근무하는 직원 => 1700번째 위치에서 근무하는 직원의 사번, 부서번호, 급여 출력

/*
-- 최종산출물
SELECT EMPLOYEE_ID, FIRST_NAME, DEPARTMENT_ID, SALARY
FROM EMPLOYEES
WHERE DEPARTMENT_ID = ?;
*/


-- 8.1.  (Seattle, Washington) => 1700번째 위치 조회 
SELECT LOCATION_ID, CITY, STATE_PROVINCE
FROM LOCATIONS
WHERE CITY = 'Seattle';


-- 8.2. 1700번째 위치 (Seattle, Washington)에서 근무하는 부서 조회
SELECT DEPARTMENT_ID, LOCATION_ID
FROM DEPARTMENTS
WHERE LOCATION_ID = (
    SELECT LOCATION_ID
    FROM LOCATIONS
    WHERE CITY = 'Seattle'
);


-- 8.3. Seattle에서 근무하는 직원의 사번, 부서번호, 급여 출력
SELECT EMPLOYEE_ID, FIRST_NAME, DEPARTMENT_ID, SALARY
FROM EMPLOYEES
WHERE DEPARTMENT_ID IN (
    SELECT DEPARTMENT_ID
    FROM DEPARTMENTS
    WHERE LOCATION_ID = (
        SELECT LOCATION_ID
        FROM LOCATIONS
        WHERE CITY = 'Seattle'
    )
)
ORDER BY DEPARTMENT_ID ASC, SALARY DESC
;



-- MULTY ROW SUBQUERY
-- any, all, in, exists
-- Boolean 연산 : in : or 연산자의 합(1개라도 같으면 True를 반환한다.)


-- any, all : 다중행 연산자로써 크기 비교시 사용한다!! (말장난처럼 느껴지므로 가볍게 보고 넘어가자!)

-- 실습7. any => 'IT' 부서의 급여보다 적게(기준(any)이 max or min=> 한명이라도 더 작은 값을 가지고 있다면 => any) 받는 직원의 이름과 급여를 출력해주세요!
-- 실습7.1. 최종산출물
/*
SELECT FIRST_NAME, SALARY 
FROM EMPLOYEES
WHERE SALARY < ?; 
*/

-- 7.2. IT 부서의 급여 조회
SELECT SALARY 
FROM EMPLOYEES
WHERE DEPARTMENT_ID = 60; 

-- 7.3. any 사용(max or min 중 한명이라도 더 작은값을 가지고있다면 출력 => any)
SELECT FIRST_NAME, SALARY 
FROM EMPLOYEES
WHERE SALARY < ANY (
    SELECT SALARY 
    FROM EMPLOYEES
    WHERE DEPARTMENT_ID = 60
); 

-- CF ) => any는 MAX와 같은 의미다
SELECT FIRST_NAME, SALARY 
FROM EMPLOYEES
WHERE SALARY < (
    SELECT MAX(SALARY) 
    FROM EMPLOYEES
    WHERE DEPARTMENT_ID = 60
); 




-- 실습8. all => 'IT' 부서의 전체급여보다 많이(기준(all)이 전체다 만족해야한다. => all) 받는 직원의 이름과 급여를 출력해주세요!
/*

*/

-- 실습8.1. IT 부서의 급여 조회
SELECT SALARY 
FROM EMPLOYEES
WHERE DEPARTMENT_ID = 60; 


-- 실습8.2. all 사용(전체다 만족해야한다 => all)
SELECT FIRST_NAME, SALARY 
FROM EMPLOYEES
WHERE SALARY > ALL (
    SELECT SALARY 
    FROM EMPLOYEES
    WHERE DEPARTMENT_ID = 60
);

-- CF ) => all은 max와 같은 의미다 
SELECT FIRST_NAME, SALARY 
FROM EMPLOYEES
WHERE SALARY > (
    SELECT MAX(SALARY) 
    FROM EMPLOYEES
    WHERE DEPARTMENT_ID = 60
);




-- 실습9. 다중행(MULTY ROW => IN등), 다중열(MULTY COLUMN => (DEPARTMENT_ID,SALARY)) SubQuery
-- DEPARTMENT_ID, SALARY 2개의 COLUMN을 SubQuery로 조회할때
-- 각 부서별 최고 급여를 받는 직원의 사원번호, 이름, 급여 출력!
SELECT EMPLOYEE_ID, FIRST_NAME, SALARY
FROM EMPLOYEES
WHERE (DEPARTMENT_ID, SALARY) IN (
    SELECT DEPARTMENT_ID, MAX(SALARY)
    FROM EMPLOYEES
    GROUP BY DEPARTMENT_ID
);

-- 강사님 설명
-- step1
SELECT EMPLOYEE_ID, FIRST_NAME, SALARY
FROM EMPLOYEES 
WHERE SALARY = ? ;

-- step02
SELECT MAX(SALARY)
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID;

-- step03 
-- IN은 OR 조건의 결합과 같다
SELECT EMPLOYEE_ID, FIRST_NAME, SALARY
FROM EMPLOYEES 
WHERE SALARY IN (
    SELECT MAX(SALARY)
    FROM EMPLOYEES
    GROUP BY DEPARTMENT_ID
    ) 
;

-- step04
-- SubQuery에도 department_id를 포함시키고
-- where절에도 department_id를 포함시켜야한다 => 조합시켜서 진행해야한다.
SELECT EMPLOYEE_ID, FIRST_NAME, SALARY
FROM EMPLOYEES
WHERE (SALARY, DEPARTMENT_ID) IN (
    SELECT MAX(SALARY), DEPARTMENT_ID
    FROM EMPLOYEES
    GROUP BY DEPARTMENT_ID
    )
;

-- 상호연관() 서브쿼리(Correlated Subquery)
-- main query와 sub query가 서로 데이터를 주고 받는 형태 => 성능이 아주 나쁜 유형이므로 아주 조심해야한다.
SELECT FIRST_NAME, DEPARTMENT_ID, SALARY, TO_CHAR(SALARY, '$999,999') AS "화폐"
FROM EMPLOYEES E1
WHERE SALARY >= (
    SELECT AVG(SALARY)
    FROM EMPLOYEES E2
    WHERE E1.DEPARTMENT_ID = E2.DEPARTMENT_ID
    )
ORDER BY DEPARTMENT_ID ASC, SALARY DESC
;
