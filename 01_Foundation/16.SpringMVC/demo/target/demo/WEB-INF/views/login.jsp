<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style type="text/css">
        fieldset {
            width: 300px;
            margin: 100px auto;
            padding: 20px;
            border: 2px solid #4CAF50;
            border-radius: 8px;
            background-color: #f9f9f9;
        }
        legend {
            font-size: 1.5em;
            font-weight: bold;
            color: #4CAF50;
        }
        label {
            display: inline-block;
            width: 80px;
            margin-bottom: 10px;
        }
        input[type="text"], input[type="password"] {
            width: calc(100% - 90px);
            padding: 5px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        input[type="submit"] {
            width: 100%;
            padding: 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        input[type="submit"]:hover {
            background-color: #45a049;
        }

    </style>
</head>
<body>
    <fieldset>
        <legend>로그인</legend>
        <form action="${pageContext.request.contextPath}/loginProgram" method="post">
            <label for="username">사용자 이름:</label>
            <input type="text" id="username" name="username" required>
            <br>
            <label for="password">비밀번호:</label>
            <input type="password" id="password" name="password" required>
            <br>
            <input type="submit" value="로그인">
        </form>
    </fieldset>
</body>
</html>