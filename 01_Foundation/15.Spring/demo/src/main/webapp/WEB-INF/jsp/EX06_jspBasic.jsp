<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSP 기본문법</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background-color: #f5f5f5;
        }
        h1 { 
            color: #333; 
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }
        .section {
            background-color: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        p { 
            font-size: 18px; 
            margin: 10px 0; 
        }
        .highlight {
            color: blue;
            font-size: 24px;
            font-weight: bold;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 10px;
        }
        td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: center;
            font-size: 16px;
        }
        td:hover {
            background-color: #f0f0f0;
        }
    </style>
</head>
<body>
    <h1>JSP 기본문법</h1>
    
    <!-- 1. 스크립트릿 : JSP문법 내에서 JAVA코드를 작성하기 위한 문법 -->
    <%
    // Java문법 활용
    int a = 10;
    int b = 5;
    int result = a + b;
    System.out.println("Result: " + result);
    %>

    <div class="section">
        <h2>1️⃣ 스크립트릿 & 표현식</h2>
        <!-- 2. 표현식 : 동적인 데이터를 웹에 출력 (메소드의 결과, 연산, 변수 사용 가능)-->
        <p>a = <%= a %></p>
        <p>b = <%= b %></p>
        <p>a + b의 결과 : <span class="highlight"><%= result %></span></p>
    </div>

    <!-- 1~100까지의 합을 구해서 Web에 출력하기 -->
    <%
        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            sum += i;
        }
    %>
    
    <div class="section">
        <h2>2️⃣ 반복문 활용</h2>
        <p>1~100까지의 합 : <span class="highlight"><%= sum %></span></p>
    </div>

    <div class="section">
        <h2>3️⃣ 테이블 동적 생성</h2>
        <p>테이블 1행 10열 → 각 열에 1~10까지의 값을 입력</p>
        
        <!-- 테이블 1행 10열 -> 각 열에 1~10까지의 값을 입력 -->
        <table border="1">
            <tr>
                <% for(int i = 0; i < 10; i++) { %>
                    <td><%= i + 1 %></td>
                <% } %>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2>4️⃣ 구구단 (2단)</h2>
        <table border="1">
            <% for(int i = 1; i <= 9; i++) { %>
                <tr>
                    <td>2 × <%= i %> = <%= 2 * i %></td>
                </tr>
            <% } %>
        </table>
    </div>

    <div class="section">
        <h2>5️⃣ 현재 시간</h2>
        <%
            java.util.Date now = new java.util.Date();
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        %>
        <p>현재 시간: <span class="highlight"><%= sdf.format(now) %></span></p>
    </div>

    <br>
    <a href="/" style="font-size: 16px;">🏠 홈으로 돌아가기</a>
</body>
</html>
