package com.example.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/Ex03_plus")
public class EX03_plus extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 1. 파라미터 받기
        String num1Str = req.getParameter("num1");
        String num2Str = req.getParameter("num2");
        
        // 2. 문자열을 숫자로 변환
        int num1 = Integer.parseInt(num1Str);
        int num2 = Integer.parseInt(num2Str);
        
        // 3. 덧셈 연산
        int result = num1 + num2;
        
        // 4. 콘솔에 출력
        System.out.println(num1 + "과 " + num2 + "의 합은 " + result + "입니다.");
        
        // 5. 웹 응답 생성
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        // resp.getWriter().print(num1+"과"+num2+"의 합은"+result+"입니다.");
        
        out.println("<!DOCTYPE html>");
        out.println("<html lang='ko'>");
        out.println("<head>");
        out.println("<meta charset='UTF-8'>");
        out.println("<title>계산 결과</title>");
        out.println("<style>");
        out.println("body { font-family: 'Malgun Gothic', Arial; background: #f0f0f0; padding: 50px; }");
        out.println(".container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }");
        out.println("h1 { color: #333; font-size: 32px; margin-bottom: 30px; }");
        out.println(".result { font-size: 24px; color: #FF7F50; font-weight: bold; margin: 20px 0; }");
        out.println("a { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #FF7F50; color: white; text-decoration: none; border-radius: 8px; }");
        out.println("a:hover { background: #FF6347; }");
        out.println("</style>");
        out.println("</head>");
        out.println("<body>");
        out.println("<div class='container'>");
        out.println("<h1>계산 결과</h1>");
        out.println("<div class='result'>");
        out.println(num1 + "과 " + num2 + "의 합은 " + result + "입니다.");
        out.println("</div>");
        out.println("<a href='/EX03_plus.html'>다시 계산하기</a>");
        out.println("</div>");
        out.println("</body>");
        out.println("</html>");
    }
}
