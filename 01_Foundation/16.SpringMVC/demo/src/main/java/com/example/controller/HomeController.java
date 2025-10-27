package com.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * HomeController
 * 
 * Spring MVC에서 HTTP 요청을 처리하는 Controller
 * 
 * @Controller: 이 클래스가 Controller임을 Spring에게 알림
 * @RequestMapping: URL 매핑 설정
 */
@Controller
@RequestMapping("/")
public class HomeController {
    
    /**
     * 메인 페이지 처리
     * 
     * @GetMapping: GET 방식 요청 처리
     * @param model: View에 데이터 전달하는 객체
     * @return View 이름 (dispatcher-servlet.xml의 ViewResolver가 처리)
     *         "home" → /WEB-INF/views/home.jsp
     */
    @GetMapping
    public String home(Model model) {
        model.addAttribute("message", "Spring MVC 학습을 시작합니다!");
        model.addAttribute("author", "LG DX School");
        return "home";
    }
    
    /**
     * /hello 페이지 처리
     * 
     * URL: http://localhost:8080/demo/hello
     */
    @GetMapping("/hello")
    public String hello(Model model) {
        model.addAttribute("greeting", "안녕하세요, Spring MVC!");
        return "hello";
    }
    
}
