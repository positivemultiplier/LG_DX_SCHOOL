package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;

@SpringBootApplication
@ServletComponentScan  // @WebServlet 어노테이션을 스캔하여 Servlet 등록
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}