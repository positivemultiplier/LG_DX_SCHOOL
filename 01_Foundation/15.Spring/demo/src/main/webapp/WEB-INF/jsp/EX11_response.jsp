<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <%
        System.out.println("EX11_response.jsp 파일이 실행되었습니다.");
        
        // sendRedirect(이동할 주소)
        // 현재 실행중인 페이지를 중단하고, 새로운 주소를 요청하는 메소드
        response.sendRedirect("https://www.naver.com");

    %>
    
</body>
</html>