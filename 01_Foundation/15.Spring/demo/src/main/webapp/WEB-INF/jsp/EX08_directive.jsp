<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.Random" %>
<%@ page import="java.util.ArrayList" %>
<%@ page errorPage="error.jsp" %>
<!-- 
    page 지시자 속성:
    - language: 사용 언어 (java)
    - contentType: MIME 타입 및 인코딩
    - pageEncoding: JSP 파일 인코딩
    - import: 사용할 클래스 import
    - errorPage: 에러 발생 시 이동할 페이지
-->
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSP Directive (지시자) 예제</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .section {
            background-color: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            color: #d63384;
        }
        .error-trigger {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <h1>📋 JSP Directive (지시자) 예제</h1>
    
    <div class="section">
        <h2>1️⃣ page 지시자 - import 속성</h2>
        <p>Java 클래스를 import하여 사용할 수 있습니다.</p>
        
        <%
        // Random 클래스 사용 (import 필요)
        Random random = new Random();
        int randomNum = random.nextInt(100);
        
        // ArrayList 클래스 사용 (import 필요)
        ArrayList<String> list = new ArrayList<String>();
        list.add("사과");
        list.add("바나나");
        list.add("오렌지");
        %>
        
        <p><strong>Random 클래스 사용:</strong> 랜덤 숫자 = <span style="color: blue; font-size: 20px;"><%= randomNum %></span></p>
        <p><strong>ArrayList 사용:</strong></p>
        <ul>
            <% for(String fruit : list) { %>
                <li><%= fruit %></li>
            <% } %>
        </ul>
    </div>
    
    <div class="section">
        <h2>2️⃣ page 지시자 - errorPage 속성</h2>
        <p>에러 발생 시 지정된 페이지로 이동합니다.</p>
        
        <div class="error-trigger">
            ⚠️ <strong>주의:</strong> 아래 주석을 해제하면 에러가 발생하여 <code>error.jsp</code>로 이동합니다.
        </div>
        
        <%-- 에러 발생 코드 (주석 처리) --%>
        <%-- 2/0 --%>
        
        <p>💡 에러 테스트를 원하면 위 주석을 해제하세요: <code>&lt;% 2/0 %&gt;</code></p>
    </div>
    
    <div class="section">
        <h2>3️⃣ 현재 페이지 정보</h2>
        <p><strong>요청 URI:</strong> <%= request.getRequestURI() %></p>
        <p><strong>컨텍스트 경로:</strong> <%= request.getContextPath() %></p>
        <p><strong>서버 정보:</strong> <%= application.getServerInfo() %></p>
        <p><strong>세션 ID:</strong> <%= session.getId() %></p>
    </div>

    <br>
    <a href="/" style="font-size: 16px;">🏠 홈으로 돌아가기</a>
</body>
</html>