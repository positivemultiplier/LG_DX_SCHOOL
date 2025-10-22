
package com.example.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/EX04_getPost")
public class EX04_getPost extends HttpServlet{

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // POST 방식일 때 한글 인코딩 설정 (반드시 getParameter 전에!)
        req.setCharacterEncoding("UTF-8");

        // 인코딩 : 문자->코드
        // 디코딩 : 코드->문자
        // get방식, post방식

        // 인코딩 -> form태그가 진행
        //form태그가 있는 html문서의 charset방식에 따라서 인코딩을 진행
        //디코딩
        // get방식 : tomcat서버에 지정, 9.0이상의 버전부턴 utf-8이 기본값
        // post방식 : 데이터가 들어있는 request객체에 설정
        // request.setCharacterEncoding("인코딩했던 방식");
        
        // 한글 깨짐 방지
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        
        // method 방식 확인
        String method = req.getMethod();

        // 데이터 확인
        String data = req.getParameter("data");

        // 콘솔 출력
        System.out.println("Method: " + method + ", Data: " + data);

        // 화면 출력 - HTML 형식으로
        // get방식 :  http://localhost:8090/Ex04_getPost?data=12312312
        // post방식 : http://localhost:8090/Ex04_getPost

        out.println("<!DOCTYPE html>");
        out.println("<html lang='ko'>");
        out.println("<head>");
        out.println("<meta charset='UTF-8'>");
        out.println("<title>GET/POST 결과</title>");
        out.println("<style>");
        out.println("body { font-family: 'Malgun Gothic', Arial; padding: 30px; background: #f5f5f5; }");
        out.println(".container { background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; }");
        out.println("h2 { color: #333; }");
        out.println(".info { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 10px 0; }");
        out.println(".method { color: #1976D2; font-weight: bold; font-size: 20px; }");
        out.println(".data { color: #388E3C; font-weight: bold; font-size: 18px; }");
        out.println("a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px; }");
        out.println("a:hover { background: #1976D2; }");
        out.println("</style>");
        out.println("</head>");
        out.println("<body>");
        out.println("<div class='container'>");
        out.println("<h2>전송 결과</h2>");
        out.println("<div class='info'>");
        out.println("<p>전송 방식: <span class='method'>" + method + "</span></p>");
        out.println("<p>받은 데이터: <span class='data'>" + data + "</span></p>");
        out.println("</div>");
        out.println("<a href='/EX04_getPost.html'>다시 전송하기</a>");
        out.println("</div>");
        out.println("</body>");
        out.println("</html>");
    }
    
}
