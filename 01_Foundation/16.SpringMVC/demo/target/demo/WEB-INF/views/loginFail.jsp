<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>로그인 실패</title>
    <style type="text/css">
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
        .fail-container {
            background: white;
            padding: 50px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 500px;
            width: 100%;
        }
        .fail-icon {
            font-size: 5em;
            margin-bottom: 20px;
        }
        h1 {
            color: #f44336;
            margin-bottom: 20px;
        }
        .error-message {
            font-size: 1.1em;
            color: #555;
            margin-bottom: 30px;
            padding: 20px;
            background: #ffebee;
            border-left: 4px solid #f44336;
            border-radius: 5px;
        }
        .help-text {
            color: #777;
            margin-bottom: 30px;
        }
        .btn {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: transform 0.2s;
            font-weight: 600;
            margin: 5px;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .hint {
            background: #fff3cd;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            color: #856404;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="fail-container">
        <div class="fail-icon">❌</div>
        <h1>로그인 실패</h1>
        
        <div class="error-message">
            ${errorMessage}
        </div>
        
        <p class="help-text">아이디와 비밀번호를 다시 확인해주세요.</p>
        
        <a href="<c:url value='/login' />" class="btn">다시 로그인</a>
        <a href="<c:url value='/' />" class="btn">홈으로 이동</a>
        
        <div class="hint">
            <strong>💡 힌트:</strong> 테스트 계정 - ID: admin / PW: 1234
        </div>
    </div>
</body>
</html>
