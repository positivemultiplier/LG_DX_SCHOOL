/*
SESSION : 세션
읽기 일관성(Read Consistency) : 트랜잭션이 완성되기전까지 데이터를 직접 조회하는 SELECT문은 대기상태
Read Consistency 해제방법: 동시에 세션을 열어서 조작하면 commit 하기전에는 일관성유지를 위해 영구반영되지 않는다.

LOCK : 특정 세션에서 조작중인 데이터는 트랜잭션이 완료(COMMIT, ROLLBACK)되기 전까지 다른 세션에서 해당 데이터를 조작할 수 없는 상태, 둘 이상의 세션이 같은 행을 조작하려고 할 때 충돌하는 현상, 서로 다른 행을 조작하면 LOCK 발생 無
LOCK 해제방법: SESSION1에서 COMMIT 또는 ROLLBACK 실행 => SESSION2에서 LOCK 해제되고 해당 데이터를 조작할 수 있게 된다.

*/


-- SESSION 1. 

SELECT * FROM 카카오뱅크;

UPDATE 카카오뱅크
SET 잔액 = 잔액 + 1000
WHERE 이름 = '이우진';

-- SESSION 2에서는 잔액이 바뀌지 않고 0으로 조회된다.
-- COMMIT이 실행되기 전까지는 트랜잭션이 완성되지 않았기 때문에 영구반영이 되지 않았다. 
-- COMMIT을 하기 전까지는 읽기 일관성(Read Consistency)때문에 대기상태가 된다.

-- ★★★다른 SESSION에서 해당 내용을 조회하기 위해서 영구반영 해줘야한다!!★★★
-- 여러 사람들이 동시에 DB에 접근해서 작업하기위해서는 반드시 COMMIT을 해줘야 한다.
COMMIT;


UPDATE 카카오뱅크
SET 잔액 = 잔액 + 1000
WHERE 이름 = '이우진';