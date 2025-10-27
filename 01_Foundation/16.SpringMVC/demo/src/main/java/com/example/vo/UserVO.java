package com.example.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * UserVO (Value Object)
 * 
 * 사용자 데이터를 담는 객체
 * 
 * @Data: Lombok - Getter, Setter, toString, equals, hashCode 자동 생성
 * @NoArgsConstructor: 기본 생성자 자동 생성
 * @AllArgsConstructor: 모든 필드를 파라미터로 받는 생성자 자동 생성
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserVO {
    
    private int id;
    private String name;
    private String email;
    private int age;
    
    // Lombok 덕분에 다음 코드들이 자동 생성됨:
    // - getId(), setId()
    // - getName(), setName()
    // - getEmail(), setEmail()
    // - getAge(), setAge()
    // - toString()
    // - equals(), hashCode()
    
}
