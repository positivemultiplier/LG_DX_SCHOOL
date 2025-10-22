<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>회원가입 결과</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
        }
        h2 {
            color: #4CAF50;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }
        .info {
            background-color: #f0f0f0;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid #4CAF50;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .value {
            color: #333;
            font-size: 18px;
        }
        .back-link {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
        .back-link:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <%
        // 📌 인코딩 설정은 Servlet에서 이미 처리되었음
        // request.setCharacterEncoding("UTF-8"); // 불필요 (Servlet에서 처리)
         
        // 1. 사용자가 입력한 이름과 나이 받아오기
        // getParameter()는 항상 String을 반환 (null 가능)
        String name = request.getParameter("name");
        String age = request.getParameter("age");
        
        // 2. null 체크 (데이터가 없는 경우 대비)
        if (name == null || name.trim().isEmpty()) {
            name = "미입력";
        }
        if (age == null || age.trim().isEmpty()) {
            age = "미입력";
        }
        %>
        
        <h2>✅ 회원가입 정보</h2>
        
        <div class="info">
            <span class="label">이름:</span>
            <span class="value"><%= name %></span>
        </div>
        
        <div class="info">
            <span class="label">나이:</span>
            <span class="value"><%= age %></span>
        </div>
        
        <a href="/EX10_request.html" class="back-link">🔙 다시 입력하기</a>
    </div>
</body>
</html>