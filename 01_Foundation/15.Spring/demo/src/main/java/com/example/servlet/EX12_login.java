package com.example.servlet;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/EX12_login")
public class EX12_login extends HttpServlet{

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 한글 인코딩 설정
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("text/html;charset=UTF-8");
        
        // 방법 1: JSP로 forward (데이터 전달 가능)
        // RequestDispatcher는 서버 내부에서 JSP로 요청을 전달
        RequestDispatcher dispatcher = req.getRequestDispatcher("/WEB-INF/jsp/EX12_login.jsp");
        dispatcher.forward(req, resp);

        
    }
    
    
}
