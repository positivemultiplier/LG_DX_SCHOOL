package com.example.servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * 폼 데이터를 받는 Servlet
 * EX02_send.html에서 전송된 데이터를 처리
 */
@WebServlet("/receive")
public class ReceiveServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // 한글 깨짐 방지
        request.setCharacterEncoding("UTF-8");
        response.setContentType("text/html;charset=UTF-8");
        
        // 파라미터 받기
        String data = request.getParameter("data");
        
        // 출력
        PrintWriter out = response.getWriter();
        out.println("<!DOCTYPE html>");
        out.println("<html>");
        out.println("<head>");
        out.println("<meta charset='UTF-8'>");
        out.println("<title>데이터 수신</title>");
        out.println("<style>");
        out.println("body { font-family: Arial; padding: 20px; }");
        out.println(".result { background: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0; }");
        out.println("</style>");
        out.println("</head>");
        out.println("<body>");
        out.println("<h1>📩 데이터 수신 결과</h1>");
        out.println("<div class='result'>");
        out.println("<p><strong>받은 데이터:</strong> " + (data != null ? data : "(없음)") + "</p>");
        out.println("<p><strong>데이터 길이:</strong> " + (data != null ? data.length() : 0) + " 문자</p>");
        out.println("</div>");
        out.println("<a href='/send.html'>다시 보내기</a>");
        out.println("</body>");
        out.println("</html>");
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        doGet(request, response);
    }
}
