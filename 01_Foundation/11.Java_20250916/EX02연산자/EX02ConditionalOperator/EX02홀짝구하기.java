package EX02ConditionalOperator;

import java.util.Scanner;

public class EX02홀짝구하기 {
    public static void main(String[] args) {
        
        // 삼항연산자
        // 조건문? 실행문1 : 실행문2
        // ---> 조건문이 참이면 실행문1 실행
        // ---> 조건문이 거짓이면 실행문2 실행


        // 정수를 입력받아 홀수인지 짝수인지 판별하는 프로그램을 만들어보자!

        // 정수를 입력하세요 : 35
        // 35는(은) 홀수 입니다.

        // 정수를 입력하세요 : 14
        // 14는(은) 짝수 입니다.

        // 1. 입력 도구 꺼내오기
        Scanner sc = new Scanner(System.in);

        // 2. 정수를 입력하세요. 출력하기(개행X)
        System.out.print("정수를 입력하세요: ");
        
        // 3. 정수 입력받기
        int num = sc.nextInt();

        // 4. 입력받은 정수가 홀수인지 짝수인지 판별하기
        String result = (num % 2) == 0 ? "짝수" : "홀수";

        // 5. 결과 출력하기(어디부터 어디까지 변수로 출력할지 생각해보기!)
        System.out.println(num + "는(은) " + result + " 입니다.");

        // try (Scanner sc = new Scanner(System.in)) {
        //     System.out.print("정수를 입력하세요: ");
        //     int num = sc.nextInt();


        //     String result = (num % 2) == 0 ? "짝수" : "홀수";
        //     System.out.println(num + "는(은) " + result + " 입니다.");
        }





    }
