package EX01ArithmeticOperator;

import java.util.Scanner;

public class EX02Arithmetic_practice {
    


    
    
    public static void main(String[] args) {
    
        try (// 1. 입력도구 꺼내오기
        Scanner sc = new Scanner(System.in)) {
            // 1. 정수 입력 글자 출력
            System.out.print("첫 번째 정수를 입력하세요: ");
            
            // 2. 정수 입력
            int num1 = sc.nextInt();
            
            // 3. 정수 입력 글자 출력
            System.out.print("두 번째 정수를 입력하세요: ");
            
            // 4. 정수 입력
            int num2 = sc.nextInt();
                    
            // 5. 더한 결과 값 : 출력 (연산까지! )         
            System.out.println("덧셈: " + (num1 + num2));
            System.out.println("뺄셈: " + (num1 - num2));
            System.out.println("곱셈: " + (num1 * num2));
            System.out.println("나눗셈: " + ((float)num1 / (float)num2));  // 형변환
            System.out.println("나눗셈: "+(double)num1/num2);
        }

        // 2. 입력받기
        // String name = sc.next();
        // System.out.println("입력받은 글자는 >> " + name);

        // System.err.print("숫자를 입력하세요: ");
        // // 3. 정수형 숫자 입력받기
        // int num1 = sc.nextInt();
        // 주석 단축키 : ctrl + / 


        // 두 개의 정수를 입력 받아 두 수의 더하기, 빼기, 곱하기, 나누기 결과값을 출력하세요.
        // (단, 나누기 결과값은 아래와 같이 실수로 표현하세요.)

        
    }
}

