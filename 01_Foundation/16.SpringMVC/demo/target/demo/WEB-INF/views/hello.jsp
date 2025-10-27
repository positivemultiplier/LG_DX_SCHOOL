<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello Page</title>
    <link rel="stylesheet" href="<c:url value='/resources/css/style.css' />">
</head>
<body>
    <div class="container">
        <header>
            <h1>👋 Hello Page</h1>
        </header>
        
        <main>
            <div class="greeting-box">
                <h2>${greeting}</h2>
                <p>이 페이지는 Spring MVC Controller에서 처리되었습니다.</p>
            </div>
            
            <div class="code-example">
                <h3>📝 Controller 코드</h3>
                <pre><code>@GetMapping("/hello")
public String hello(Model model) {
    model.addAttribute("greeting", "안녕하세요, Spring MVC!");
    return "hello";
}</code></pre>
            </div>
            
            <div class="navigation">
                <a href="<c:url value='/' />" class="btn">🏠 홈으로 돌아가기</a>
            </div>
        </main>
        
        <footer>
            <p>LG DX School - Spring MVC 학습 © 2025</p>
        </footer>
    </div>
</body>
</html>
