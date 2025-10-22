<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h3> 1.변수선언</h3>
    <% int a = 10; %>
    <c:set var="b" value="15"></c:set>

    <hr>
    <h3> 2.출력</h3>
    <%= a%>
    <c:out value="${b}"></c:out>

    <hr>
    <h3> 3.조건문 if문 </h3>
    <c:if test="${b%2 ==0  }">
        <c:out value="b는 짝수입니다."></c:out>
    </c:if>
    <c:if test="${b%2 !=0  }">
        <c:out value="b는 홀수입니다."></c:out>
    </c:if>

    <hr>
    <h3> 4.switch문 forEach</h3>
    <c:choose>
        <c:when test="${b%2 == 0 }">
            <c:out value="b는 짝수입니다."></c:out>
        </c:when>
        <c:otherwise>
            <c:out value="b는 홀수입니다."></c:out>
        </c:otherwise>
    </c:choose>

    <hr>
    <h3> 5.for문 forEach</h3>
    <c:forEach var="i" begin="1" end="5" step="1">
        <c:out value="${i}"></c:out>
    </c:forEach>

    <hr>
    <h3> 6.functions로 배열만들기</h3>
    <p>split은 첫번째 param : arrayvalues, 두번째 param : 구분자 </p>
    <c:set var="team" value="${fn:split('박수현, 정형, 이도연, 손지영', ',')}"></c:set>
    <c:forEach var="member" items="${team}">
        <c:out value="${member}"></c:out>
    </c:forEach>
    <p>
        <c:out value="인원수: ${fn:length(team)}"></c:out>
    </p>


</body>
</html>