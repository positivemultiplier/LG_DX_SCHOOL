<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spring MVC Home</title>
    <link rel="stylesheet" href="<c:url value='/resources/css/style.css' />">
</head>
<body>
    <div class="container">
        <header>
            <h1>🍃 Spring MVC 학습 프로젝트</h1>
        </header>
        
        <main>
            <div class="welcome-box">
                <h2>${message}</h2>
                <p>작성자: ${author}</p>
            </div>
            
            <div class="info-box">
                <h3>📚 학습 내용</h3>
                <ul>
                    <li><strong>MVC 패턴</strong>: Model - View - Controller 구조 이해</li>
                    <li><strong>Controller</strong>: @Controller, @RequestMapping, @GetMapping</li>
                    <li><strong>View</strong>: JSP, JSTL</li>
                    <li><strong>Model</strong>: 데이터 전달 (model.addAttribute)</li>
                </ul>
            </div>
            
            <div class="navigation">
                <h3>🔗 페이지 이동</h3>
                <ul>
                    <li><a href="<c:url value='/hello' />">Hello 페이지</a></li>
                    <li><a href="<c:url value='/login' />">로그인 페이지</a></li>
                    <li><a href="<c:url value='/user/list' />">사용자 목록 (예정)</a></li>
                </ul>
            </div>
        </main>
        
        <footer>
            <p>LG DX School - Spring MVC 학습 © 2025</p>
        </footer>
    </div>
</body>
</html>
