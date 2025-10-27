<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
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