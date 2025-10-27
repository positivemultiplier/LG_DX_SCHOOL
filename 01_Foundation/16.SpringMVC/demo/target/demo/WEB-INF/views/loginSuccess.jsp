<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>로그인 성공</title>
    <style type="text/css">
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            padding: 20px;
        }
        .success-container {
            background: white;
            padding: 50px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 500px;
            width: 100%;
        }
        .success-icon {
            font-size: 5em;
            margin-bottom: 20px;
        }
        h1 {
            color: #4CAF50;
            margin-bottom: 20px;
        }
        .welcome-text {
            font-size: 1.2em;
            color: #333;
            margin-bottom: 30px;
        }
        .user-info {
            background: #f0f0f0;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .user-info p {
            margin: 10px 0;
            color: #555;
        }
        .btn {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: transform 0.2s;
            font-weight: 600;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="success-container">
        <div class="success-icon">✅</div>
        <h1>로그인 성공!</h1>
        <p class="welcome-text">${username}님, 환영합니다!</p>
        
        <div class="user-info">
            <p><strong>로그인 사용자:</strong> ${username}</p>
            <p><strong>로그인 시간:</strong> <%= new java.util.Date() %></p>
        </div>
        
        <a href="<c:url value='/' />" class="btn">홈으로 이동</a>
    </div>
</body>
</html>
