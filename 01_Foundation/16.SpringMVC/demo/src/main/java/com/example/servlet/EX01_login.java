
import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class EX01_login extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 한글 인코딩 설정
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("text/html;charset=UTF-8");
        
        // JSP로 forward
        RequestDispatcher dispatcher = req.getRequestDispatcher("/WEB-INF/jsp/EX01_login.jsp");
        dispatcher.forward(req, resp);

        // 1.post 방식 인코딩
        req.setCharacterEncoding("UTF-8");
        // 2. request객체에서 데이터 꺼내기(id ,pw)
        String id = req.getParameter("id");
        String pw = req.getParameter("pw");

        
    }
    
}
