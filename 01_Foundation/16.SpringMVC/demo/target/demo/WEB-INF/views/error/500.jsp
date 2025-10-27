<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 - Internal Server Error</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            padding: 20px;
        }
        .error-container {
            background: white;
            padding: 50px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 600px;
        }
        h1 {
            font-size: 6em;
            color: #fc4a1a;
            margin: 0;
        }
        h2 {
            color: #333;
            margin: 20px 0;
        }
        p {
            color: #666;
            font-size: 1.1em;
            margin: 20px 0;
        }
        a {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 20px;
            transition: transform 0.2s;
        }
        a:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>500</h1>
        <h2>서버 내부 오류</h2>
        <p>서버에서 요청을 처리하는 중 오류가 발생했습니다.</p>
        <p>잠시 후 다시 시도해주세요.</p>
        <a href="${pageContext.request.contextPath}/">홈으로 돌아가기</a>
    </div>
</body>
</html>
