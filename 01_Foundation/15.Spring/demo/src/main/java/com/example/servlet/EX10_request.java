package com.example.servlet;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * EX10_request Servlet
 * 
 * 학습 목표:
 * 1. HTML form 데이터를 Servlet에서 받기
 * 2. request.getParameter()로 데이터 추출
 * 3. JSP로 forward하여 결과 표시
 * 
 * 데이터 흐름:
 * HTML (form) → Servlet (데이터 처리) → JSP (화면 출력)
 */
@WebServlet("/EX10_request")
public class EX10_request extends HttpServlet {
   
    /**
     * doGet: GET 방식 요청 처리
     * - URL에 직접 접근할 때 (예: http://localhost:8090/EX10_request)
     * - 링크 클릭, 브라우저 주소창 입력 등
     */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 인코딩 설정 (한글 깨짐 방지)
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("text/html;charset=UTF-8");
        
        // JSP로 forward (request, response 객체 전달)
        RequestDispatcher dispatcher = req.getRequestDispatcher("/WEB-INF/jsp/EX10_request.jsp");
        dispatcher.forward(req, resp);
    }
    
    /**
     * doPost: POST 방식 요청 처리
     * - HTML form에서 method="post"로 전송할 때
     * - 데이터가 HTTP body에 숨겨져 전송됨 (보안)
     */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // ⚠️ 중요: POST 방식에서는 getParameter() 호출 전에 인코딩 설정 필수!
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("text/html;charset=UTF-8");
        
        // 📝 학습 포인트: 여기서 데이터를 받아서 처리할 수 있음
        // String name = req.getParameter("name");
        // String age = req.getParameter("age");
        // 데이터 검증, DB 저장 등의 비즈니스 로직 수행 가능
        
        // JSP로 forward (데이터는 request 객체에 담겨서 전달됨)
        RequestDispatcher dispatcher = req.getRequestDispatcher("/WEB-INF/jsp/EX10_request.jsp");
        dispatcher.forward(req, resp);
    }
}
