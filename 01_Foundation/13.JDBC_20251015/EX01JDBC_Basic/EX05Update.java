package EX01JDBC_Basic;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Scanner;

public class EX05Update {
    public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		// 사용자 입출력 구간
		System.out.print("ID 입력 : ");
		String id = sc.next();
		System.out.print("PW 입력 : ");
		String pw = sc.next();
		System.out.print("수정할 점수 입력 : ");
		int score = sc.nextInt();
 
		Connection conn = null;
		PreparedStatement psmt = null;
		try {
			Class.forName("oracle.jdbc.driver.OracleDriver");
 
			// 2. 데이터베이스 연결
			// 준비물 3가지
			// 1) 연결 경로
			String url = "jdbc:oracle:thin:@localhost:1521:xe";
			// 2) 계정 이름
			String user = "hr";
			// 3) 계정 비밀번호
			String password = "hr";
 
			conn = DriverManager.getConnection(url, user, password);
 
			// 3. Query(SQL)문 전송
			// 3-1) Query문 작성
			String sql = "UPDATE LGDXMEMBER SET SCORE = ? WHERE ID = ? AND PW = ?";
 
			psmt = conn.prepareStatement(sql);
 
			// ? 인자 채우는 작업!
			psmt.setInt(1, score);
			psmt.setString(2, id);
			psmt.setString(3, pw);
 
			// 4. sql문 실행
			int row = psmt.executeUpdate();
 
			// 5. 결과를 이용한 작업처리
			// : 사용자에게 어떤 모습을 보여줄건지 정의
			if (row > 0) {
				System.out.println("회원정보 수정 완료!!");
			} else {
				System.out.println("회원정보 수정 실패 ㅠㅠ");
				System.out.println("아이디나 비밀번호를 확인하세요!");
			}
 
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			// 6. DB연결 종료 --> 자원 반납
			try {
				// *** 자원을 반납할 때는 항상 사용한 순서의 역순으로 반납한다!
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
