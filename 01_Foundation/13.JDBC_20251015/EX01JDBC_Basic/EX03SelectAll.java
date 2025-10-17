package EX01JDBC_Basic;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class EX03SelectAll {
    public static void main(String[] args) {


        Connection conn = null;
        PreparedStatement psmt = null;
        ResultSet rs = null;

        // 2.DB 연결
        try {
            // 2.1. 드라이버 로딩
            Class.forName("oracle.jdbc.driver.OracleDriver");
            // 2.2 DB연결 통로 열기(url, user, password)

            String url = "jdbc:oracle:thin:@localhost:1521:xe";
            String user = "hr";          
            String password = "hr";

            conn = DriverManager.getConnection(url, user, password);

            if(conn != null){
                System.out.println("연결 성공!");
            }else{
                System.out.println("연결 실패");
            }

            // 2.3. SQL문 준비
            // 로그인 >> 테이블에 데이터가 존재하는지 확인 >> select
            // 아이디, 비밀번호가 일치하는지 데이터의 모든 컬럼을 가져오기! => 뭘 어떻게 하라는거지? 일치하는 데이터만 가져오래 ... 
            
            String sql = "SELECT * FROM LGDXMEMBER"; 
            psmt = conn.prepareStatement(sql);
            

            // 2.4. SQL문 전송(실행)
            rs = psmt.executeQuery();
            // ResultSet이란? 
            // : 조회된 데이터 결과를 테이블과 같은 형태로 표현해주는 집합 자료구조!!
            // : cursor 를 가지고 있다(처음에는 column명을 가리키고 있음)
            // : cursor가 가리키고 있는 데이터만 가져올 수 있다.
            
            //rs.next();
            // rs.next(); => cursor가 1행 내려간다
            // 만약 데이터가 있다면 true// 데이터가 없다면 false => return type Boolean

            
            
            System.out.println("===== 전체 회원 조회 =====");
            System.out.println("ID\t이름\t나이\t점수");
            while (rs.next()) {
                String id = rs.getString("ID");
                String name = rs.getString("NAME");
                int age = rs.getInt("AGE");
                int score = rs.getInt("SCORE");
                System.out.println(id + "\t" + name + "\t" + age + "\t" + score);
            }

       
         




            
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 2.5. DB 연결 종료
            try {
                if (rs != null)
                    rs.close();
                                     
                
                if (psmt != null)
                    psmt.close();
                 
                    
                
                if (conn != null)
                    conn.close();
                 
                    
                
            } catch (SQLException e) {
                
                e.printStackTrace();
            }
        
        }
    }
}
