package com.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * LoginController
 * 
 * 로그인 기능 처리 Controller
 */
@Controller
public class LoginController {
    
    /**
     * 로그인 페이지 표시 (GET)
     * 
     * URL: http://localhost:8080/demo/login
     * 
     * @return login.jsp 뷰 이름
     */
    @GetMapping("/login")
    public String loginForm() {
        System.out.println("🔑 로그인 페이지 요청됨");
        return "login";
    }
    
    /**
     * 로그인 처리 (POST)
     * 
     * URL: http://localhost:8080/demo/loginProgram
     * 
     * @param username 사용자 이름
     * @param password 비밀번호
     * @param model View에 데이터 전달
     * @return 성공/실패 페이지
     */
    @PostMapping("/loginProgram")
    public String loginProcess(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            Model model) {
        
        System.out.println("========================================");
        System.out.println("🔍 로그인 시도");
        System.out.println("📌 사용자 이름: " + username);
        System.out.println("📌 비밀번호: " + password);
        System.out.println("========================================");
        
        // 간단한 로그인 검증 (실제로는 DB 조회 필요)
        // 예시: admin / 1234
        if ("admin".equals(username) && "1234".equals(password)) {
            // 로그인 성공
            model.addAttribute("username", username);
            System.out.println("✅ 로그인 성공!");
            return "loginSuccess";
        } else {
            // 로그인 실패
            model.addAttribute("errorMessage", "아이디 또는 비밀번호가 올바르지 않습니다.");
            System.out.println("❌ 로그인 실패!");
            return "loginFail";
        }
    }
    
}
