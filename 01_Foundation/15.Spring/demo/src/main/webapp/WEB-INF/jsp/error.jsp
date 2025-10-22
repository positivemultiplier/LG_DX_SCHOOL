<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page isErrorPage="true" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>에러 페이지</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .error-container {
            background-color: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: 600px;
            text-align: center;
        }
        .error-icon {
            font-size: 80px;
            margin-bottom: 20px;
        }
        h1 {
            color: #e74c3c;
            margin: 10px 0;
        }
        .error-message {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #721c24;
        }
        .error-details {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: left;
            font-size: 14px;
            max-height: 200px;
            overflow-y: auto;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            transition: background-color 0.3s;
        }
        .btn:hover {
            background-color: #764ba2;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h1>오류가 발생했습니다!</h1>
        <p style="color: #666;">페이지 처리 중 문제가 발생했습니다.</p>
        
        <div class="error-message">
            <strong>에러 메시지:</strong><br>
            <%= exception.getMessage() %>
        </div>
        
        <div class="error-details">
            <strong>에러 타입:</strong> <%= exception.getClass().getName() %><br>
            <strong>에러 상세:</strong><br>
            <%
                // 스택 트레이스 출력 (처음 5줄만)
                StackTraceElement[] stackTrace = exception.getStackTrace();
                for(int i = 0; i < Math.min(5, stackTrace.length); i++) {
                    out.println(stackTrace[i] + "<br>");
                }
            %>
        </div>
        
        <p style="font-size: 14px; color: #888;">
            이 페이지는 <code>errorPage</code> 지시자를 통해 표시되었습니다.
        </p>
        
        <a href="javascript:history.back()" class="btn">🔙 이전 페이지로</a>
        <a href="/" class="btn">🏠 홈으로</a>
    </div>
</body>
</html>
