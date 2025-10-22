<% page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1> JSP 기본문법 : 선언문</h1>
    <!-- 3. 선언문 : 멤버변수, 메소드 등 클래스 영역에 선언하기 위해 사용 -->
    <%
        // 합을 구하는 메서드
        public int addNum(int num1, int num2) {
            System.out.println("addNum() 메서드 호출됨");
            return num1 + num2;
        }

        
        // 멤버변수 선언
        String name;
        int age;

        // 메소드 선언
        void printInfo() {
            System.out.println("Name: " + name);
            System.out.println("Age: " + age);
        }
    %>
</body>
</html>