package com.example;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class DAO {

    //DAO : Data Access Object -> DB접근객체

    PreparedStatement psmt = null;
    Connection conn = null;
    ResultSet rs = null;

    // DB 연결 메서드
    public void db_connection(){
        // 프로젝트에 jar 파일 넣어주기!
        // 1.ojdbc6.jar 외부 라이브러리 불러오기
        // c:\oraclexe\app\oracle\product\11.2.0\server\jdbc\lib\ojdbc6.jar


    }
}
