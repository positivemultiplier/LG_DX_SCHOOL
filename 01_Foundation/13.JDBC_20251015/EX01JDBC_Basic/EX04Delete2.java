package EX01JDBC_Basic;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Scanner;

public class EX04Delete2 {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        System.out.print("아이디를 입력하세요 : ");
        String ID = sc.next();
        System.out.print("비밀번호를 입력하세요 : ");
        String PW = sc.next();


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
            //ID, PW 입력시 회원삭제 되도록 만들기 
            //
            
            // DELETE 문 실행
            String deleteSql = "DELETE FROM LGDXMEMBER WHERE ID = ? AND PW = ?"; 
            psmt = conn.prepareStatement(deleteSql);
            psmt.setString(1, ID);
            psmt.setString(2, PW);

            int row = psmt.executeUpdate();

            if(row > 0) {
                System.out.println("삭제 성공~");
            }else{
                System.out.println("삭제 실패~ㅠㅠ");
            }

            // SELECT 문을 위한 새로운 PreparedStatement 생성
            String selectSql = "SELECT * FROM LGDXMEMBER";
            psmt = conn.prepareStatement(selectSql);
            rs = psmt.executeQuery();

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
