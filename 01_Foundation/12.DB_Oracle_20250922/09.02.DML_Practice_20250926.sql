
SELECT * FROM 네이버회원;

-- 네이버회원 테이블에 우리팀 팀원들의 정보를 넣어주세요!!
INSERT INTO 네이버회원 VALUES ('A','가','123', DATE '2020-01-01', '남');
INSERT INTO 네이버회원 VALUES ('B','나','123', DATE '2020-01-01', '여');
INSERT INTO 네이버회원 VALUES ('C','다','123', DATE '2020-01-01', '남');
INSERT INTO 네이버회원 VALUES ('D','라','123', DATE '2020-01-01', '여');
INSERT INTO 네이버회원 VALUES ('E','마','123', DATE '2020-01-01', '남');
INSERT INTO 네이버회원 VALUES ('F','바','123', DATE '2020-01-01', '여');    




-- 자신(본인) 정보는 삭제

DELETE FROM 네이버회원 WHERE ID = 'A';



-- 팀원들의 이름을 귀여운 별명으로 바꿔주세요