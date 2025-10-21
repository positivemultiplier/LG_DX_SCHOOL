
package com.example.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/EX05_userInfo")
public class EX05_userInfo extends HttpServlet{

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // POST 방식 한글 인코딩 설정 (getParameter 전에 필수!)
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("text/html;charset=UTF-8");
        
        PrintWriter out = resp.getWriter();
        
        // Step 1: 아이디/비밀번호 받기
        String id = req.getParameter("id");
        String pw = req.getParameter("pw");
        String pw2 = req.getParameter("pw2");
        
        // Step 2: 추가정보 받기
        String email = req.getParameter("email");
        String emailSelect = req.getParameter("email_select");
        String fullEmail = email + "@" + emailSelect;
        
        String gender = req.getParameter("gender");
        
        // ★★★취미는 여러 개 선택 가능 (checkbox)★★★ 배열로 받아야한다.
        String[] hobbies = req.getParameterValues("hobby");
        
        // 콘솔 출력
        System.out.println("=== 회원가입 정보 ===");
        System.out.println("ID: " + id);
        System.out.println("PW: " + pw);
        System.out.println("Email: " + fullEmail);
        System.out.println("Gender: " + gender);
        if (hobbies != null) {
            System.out.print("Hobbies: ");
            for (String hobby : hobbies) {
                System.out.print(hobby + " ");
            }
            System.out.println();
        }
        
        // HTML 응답 생성
        out.println("<!DOCTYPE html>");
        out.println("<html lang='ko'>");
        out.println("<head>");
        out.println("<meta charset='UTF-8'>");
        out.println("<title>회원가입 완료</title>");
        out.println("<style>");
        out.println("body { font-family: 'Malgun Gothic', Arial; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }");
        out.println(".container { background: white; padding: 40px; border-radius: 15px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }");
        out.println("h1 { color: #667eea; text-align: center; margin-bottom: 30px; }");
        out.println(".success-icon { text-align: center; font-size: 60px; color: #4CAF50; margin-bottom: 20px; }");
        out.println("table { width: 100%; border-collapse: collapse; margin: 20px 0; }");
        out.println("th { background: #667eea; color: white; padding: 15px; text-align: left; font-size: 16px; }");
        out.println("td { padding: 12px 15px; border-bottom: 1px solid #e0e0e0; }");
        out.println("td:first-child { font-weight: bold; color: #555; width: 150px; background: #f5f5f5; }");
        out.println("td:last-child { color: #333; }");
        out.println(".warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; color: #856404; }");
        out.println(".success { background: #d4edda; border: 1px solid #28a745; padding: 15px; border-radius: 8px; margin: 20px 0; color: #155724; }");
        out.println("a { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; text-align: center; }");
        out.println("a:hover { background: #5568d3; }");
        out.println(".hobby-list { display: flex; gap: 10px; flex-wrap: wrap; }");
        out.println(".hobby-tag { background: #e3f2fd; padding: 5px 12px; border-radius: 15px; font-size: 14px; color: #1976D2; }");
        out.println("</style>");
        out.println("</head>");
        out.println("<body>");
        out.println("<div class='container'>");
        out.println("<div class='success-icon'>✓</div>");
        out.println("<h1>회원가입 완료</h1>");
        
        // 비밀번호 일치 여부 확인
        if (!pw.equals(pw2)) {
            out.println("<div class='warning'>");
            out.println("<strong>⚠️ 경고:</strong> 비밀번호와 비밀번호 확인이 일치하지 않습니다!");
            out.println("</div>");
        } else {
            out.println("<div class='success'>");
            out.println("<strong>✓ 성공:</strong> 비밀번호가 일치합니다.");
            out.println("</div>");
        }
        
        out.println("<table>");
        out.println("<tr><th colspan='2'>가입 정보</th></tr>");
        out.println("<tr><td>아이디</td><td>" + id + "</td></tr>");
        out.println("<tr><td>비밀번호</td><td>" + pw.replaceAll(".", "*") + " (보안처리됨)</td></tr>");
        out.println("<tr><td>이메일</td><td>" + fullEmail + "</td></tr>");
        
        // 성별 표시 (한글로 변환)
        String genderText = "선택안함";
        if ("men".equals(gender)) {
            genderText = "남자";
        } else if ("women".equals(gender)) {
            genderText = "여자";
        }
        out.println("<tr><td>성별</td><td>" + genderText + "</td></tr>");
        
        // 취미 표시
        out.println("<tr><td>취미</td><td>");
        if (hobbies != null && hobbies.length > 0) {
            out.println("<div class='hobby-list'>");
            for (String hobby : hobbies) {
                String hobbyText = "";
                switch(hobby) {
                    case "movie": hobbyText = "영화시청"; break;
                    case "music": hobbyText = "노래"; break;
                    case "game": hobbyText = "게임"; break;
                    default: hobbyText = hobby;
                }
                out.println("<span class='hobby-tag'>" + hobbyText + "</span>");
            }
            out.println("</div>");
        } else {
            out.println("선택안함");
        }
        out.println("</td></tr>");
        out.println("</table>");
        
        out.println("<a href='/EX05_userInfo.html'>다시 가입하기</a>");
        out.println("</div>");
        out.println("</body>");
        out.println("</html>");
    }
    
}
