/* 11. TCL(Transactional Control Language) - 03. Transaction(트랜잭션) 개념
-- 트랜잭션 : 업무를 수행하기 위한 최소 수행 단위
Transaction(트랜잭션): 하나의 작업 단위로 수행되는 일련의 데이터베이스 연산들의 집합

Data 유실 : 트랜잭션이 실패하거나 중단되었을 때, 데이터베이스의 일관성이 깨지거나 일부 데이터가 손실될 수 있다.
Data 유실을 막기위한 방법:송금 Transaction Unit 단위로 설정해야한다.


예) 은행에서 A계좌에서 B계좌로 100만원을 이체하는 작업

1. 송금 Transaction 시작(START TRANSACTION)
2. A계좌에서 100만원 출금
3. B계좌로 100만원 입금
4. 작업 완료(COMMIT)



★★★★★Transaction 4가지 특성★★★★★
Automicity(원자성) : 트랜잭션의 작업들은 모두 성공하거나 모두 실패해야 한다. (ALL OR NOTHING)
Consistency(일관성) : 트랜잭션이 성공적으로 완료되면 데이터베이스는 일관성 있는 상태를 유지해야 한다.(INTEGRITY, 무결성 느낌)
Isolation(독립성) : 트랜잭션이 수행되는 동안 다른 트랜잭션의 영향을 받지 않아야 한다. (동시 수정 불가)
Durability(지속성) : 트랜잭션이 성공적으로 완료되면 그 결과는 영구적으로 저장되어야 한다.(COMMIT => 영구저장, ROLLBACK => 취소)

-- 명령어
-- COMMIT: DB에 영구적으로 저장, 마지막 COMMIT 시점 이후의 트랜잭션 결과를 저장
-- ROLLBACK: 트랜잭션을 취소, 마지막 COMMIT 시점까지만 복구 가능
COMMIT(확정): 트랜잭션의 작업들을 영구적으로 저장
ROLLBACK(취소): 트랜잭션의 작업들을 취소하고 이전 상태


*/
-- ⓐ
CREATE TABLE 카카오뱅크(
    이름 VARCHAR2(12),
    계좌번호 VARCHAR2(50),
    잔액 NUMBER --설정안할시 default 38,0 (정수형)
);

-- ⓑ
INSERT INTO 카카오뱅크
VALUES('홍길동', '123-456-789', 0);

-- ⓒ
SELECT * FROM 카카오뱅크;


-- ⓓ
ROLLBACK; 
-- INSERT문이 취소되고, 테이블은 원래 상태로 돌아감
-- COMMIT이 실행되지 않았기 때문에 데이터는 저장되지 않음
-- DB Table에는 아무런 변화가 없음
-- DDL(CREATE, ALTER, DROP)은 자동으로 영구반영) => (일관성(Consistency)가 중요하기때문에 자동 COMMIT이 된다.
-- DML(INSERT, UPDATE, DELETE)는 테이블에 영구반영 되지 않기 때문에 꼭 COMMIT을 통해서 영구반영 해줘야함!


-- ⓔ
INSERT INTO 카카오뱅크
VALUES('홍길동', '123-456-789', 0);


-- ⓕ
COMMIT;

-- ⓖ
ROLLBACK;


-- ⓗ
SELECT * FROM 카카오뱅크;


-- ⓘ
INSERT INTO 카카오뱅크
VALUES('이우진', '123-456-789', 100);





-- 실습1. 송금 트랜잭션(이우진->홍길동, 100만원 송금)
-- 1. 잔액 확인
SELECT * FROM 카카오뱅크
WHERE 이름 ='이우진'
AND 잔액 >= 100; -- 잔액이 100만원 이상일때만 송금 가능

-- 2. 잔액을 차감
UPDATE 카카오뱅크
SET 잔액 = 잔액 - 100
WHERE 이름 = '이우진';

ROLLBACK;  -- 2번에서 전산상 오류가 생겼을 때 트랜잭션 실행 전으로 복구!
-- ★ 트랜잭션 단위로 실행되어야 하기때문에 이 단계에서 롤백을 실행해야한다 

-- 3. 100만원 입금
UPDATE 카카오뱅크
SET 잔액 = 잔액 + 100
WHERE 이름 = '홍길동';

ROLLBACK;  -- 3번에서 전산상 오류가 생겼을 때 트랜잭션 실행 전으로 복구!
-- ★ 트랜잭션 단위로 실행되어야 하기때문에 이 단계에서 롤백을 실행해야한다

-- 4. 잔액 확인
SELECT * FROM 카카오뱅크
WHERE 이름 = '홍길동';


-- 송금 트랜잭션 영구반영
COMMIT;


-- 아무리 롤백하더라도 COMMIT이 실행된 이후의 트랜잭션은 복구 불가능
ROLLBACK;

SELECT * FROM 카카오뱅크;



-- SESSION2 => LOCK 발생해버렸다 why? => SESSION1에서 COMMIT이 실행되지 않았기 때문에
-- SESSION1에서 COMMIT 하는 순간 SESSION2에서 LOCK이 풀리면서 잔액이 바뀌게 된다.
UPDATE 카카오뱅크
SET 잔액 = 잔액 + 100
WHERE 이름 = '이우진'; 

-- 읽기 일관성(Read Consistency) 때문에 대기상태가 된다.
COMMIT;