package com.example.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * EX11_response Servlet
 * 
 * 학습 목표: response.sendRedirect() 이해하기
 * 
 * sendRedirect()란?
 * - 브라우저에게 "이 URL로 다시 요청하세요"라고 지시하는 메서드
 * - 완전히 새로운 요청 생성 (URL 변경됨)
 * - 외부 사이트 이동 가능 (naver.com, google.com 등)
 * 
 * forward() vs sendRedirect() 비교:
 * ┌────────────┬─────────────────┬─────────────────┐
 * │            │   forward()     │ sendRedirect()  │
 * ├────────────┼─────────────────┼─────────────────┤
 * │ 실행 위치   │ 서버 내부       │ 브라우저        │
 * │ URL 변경   │ 안 됨           │ 변경됨          │
 * │ request 공유│ O (유지)       │ X (새로 생성)   │
 * │ 속도       │ 빠름            │ 느림 (2번 요청) │
 * │ 외부 사이트│ 불가능          │ 가능            │
 * └────────────┴─────────────────┴─────────────────┘
 */
@WebServlet("/EX11_response")
public class EX11_response extends HttpServlet {
    
    /**
     * doGet: GET 방식 요청 처리
     * - 브라우저 주소창에 직접 입력: http://localhost:8090/EX11_response
     * - 링크 클릭
     */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // GET으로 직접 접근 시 안내 메시지 출력
        resp.setContentType("text/html;charset=UTF-8");
        resp.getWriter().println("<html><body>");
        resp.getWriter().println("<h1>❌ 잘못된 접근입니다</h1>");
        resp.getWriter().println("<p>이 페이지는 POST 방식으로만 접근할 수 있습니다.</p>");
        resp.getWriter().println("<a href='/EX11_response.html'>폼 페이지로 이동</a>");
        resp.getWriter().println("</body></html>");
    }

    /**
     * doPost: POST 방식 요청 처리
     * - HTML 폼에서 버튼 클릭 시 호출됨
     */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 1. 인코딩 설정 (한글 깨짐 방지)
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("text/html;charset=UTF-8");
        
        // 2. 사용자가 선택한 사이트 정보 받기
        // <input type="hidden" name="site" value="naver">
        String site = req.getParameter("site");
        
        // 3. 서버 콘솔에 로그 출력 (디버깅용)
        System.out.println("========================================");
        System.out.println("🔍 EX11_response Servlet 실행됨");
        System.out.println("📌 선택한 사이트: " + site);
        System.out.println("========================================");
        
        // 4. 선택한 사이트에 따라 다른 URL로 redirect
        String redirectUrl = "";
        
        if (site == null) {
            // site 파라미터가 없는 경우 (비정상 접근)
            redirectUrl = "/EX11_response.html";
        } else if (site.equals("naver")) {
            redirectUrl = "https://www.naver.com";
        } else if (site.equals("google")) {
            redirectUrl = "https://www.google.com";
        } else if (site.equals("youtube")) {
            redirectUrl = "https://www.youtube.com";
        } else {
            // 알 수 없는 site 값
            redirectUrl = "/EX11_response.html";
        }
        
        // 5. sendRedirect() 실행
        // 브라우저에게 "이 URL로 다시 요청하세요"라고 응답
        System.out.println("🚀 Redirect URL: " + redirectUrl);
        resp.sendRedirect(redirectUrl);
        
        // ⚠️ 주의: sendRedirect() 이후의 코드는 실행되지만 의미 없음
        // 이미 브라우저에게 리다이렉트 응답을 보냈기 때문
        // 추가 출력이나 로직은 무시됨
    }
    
    /**
     * 추가 학습: sendRedirect() 동작 원리
     * 
     * 1단계: 사용자가 버튼 클릭
     *    → POST /EX11_response (site=naver)
     * 
     * 2단계: Servlet 실행
     *    → site 파라미터 확인
     *    → resp.sendRedirect("https://www.naver.com")
     * 
     * 3단계: 서버가 브라우저에게 응답
     *    HTTP/1.1 302 Found
     *    Location: https://www.naver.com
     *    (302 상태 코드 = "다른 곳으로 가세요")
     * 
     * 4단계: 브라우저가 자동으로 새 URL 요청
     *    GET https://www.naver.com
     * 
     * 5단계: 네이버 페이지 표시
     */
}
