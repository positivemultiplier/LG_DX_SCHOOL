
package com.example.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/Ex02_get")
public class EX02_get extends HttpServlet{

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 요청한 페이지
        // 데이터를 전송받는곳
        // http://localhost:8090/Ex02_get
        
        // 한글 깨짐 방지
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("text/html;charset=UTF-8");
        
        // 요청과 관련된 모든 정보 -> request객체
        String data = req.getParameter("data");
        System.out.println("받은 데이터: " + data);
        
        
        // 브라우저로 응답 보내기
        PrintWriter out = resp.getWriter(); //설명 :  응답을 작성하기 위한 PrintWriter 객체를 생성
        out.println("<!DOCTYPE html>");
        out.println("<html>");
        out.println("<head>");
        out.println("<meta charset='UTF-8'>");
        out.println("<title>데이터 수신 결과</title>");
        out.println("<style>");
        out.println("body { font-family: Arial; padding: 20px; background: #f5f5f5; }");
        out.println(".container { background: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; }");
        out.println("h1 { color: #4CAF50; }");
        out.println(".data { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; }");
        out.println("a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }");
        out.println("a:hover { background: #45a049; }");
        out.println("</style>");
        out.println("</head>");
        out.println("<body>");
        out.println("<div class='container'>");
        out.println("<h1>✅ 데이터 수신 성공!</h1>");
        out.println("<div class='data'>");
        out.println("<p><strong>받은 데이터:</strong> " + (data != null ? data : "(데이터 없음)") + "</p>");
        out.println("<p><strong>데이터 길이:</strong> " + (data != null ? data.length() : 0) + " 문자</p>");
        out.println("</div>");
        out.println("<a href='/EX02_send.html'>다시 전송하기</a>");
        out.println("</div>");
        out.println("</body>");
        out.println("</html>");

    }
}
