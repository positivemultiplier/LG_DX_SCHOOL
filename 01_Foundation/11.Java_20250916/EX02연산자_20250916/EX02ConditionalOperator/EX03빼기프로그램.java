package EX02ConditionalOperator;

import java.util.Scanner;

public class EX03빼기프로그램 {
    public static void main(String[] args) {
        

        // 두개의 정수를 입력받아 큰 수에서 작은수를 뺀 결과값을 출력하는 프로그램을 만들어보자!
        // 첫 번째 정수 입력 : 10
        // 두 번째 정수 입력 : 45
        // 두 수의 차는 35 입니다. 


        // 1. 입력도구 꺼내오기
        Scanner sc = new Scanner(System.in);

        // 2. 입력 받기
        System.out.print("첫 번째 정수 입력 : ");
        int first = sc.nextInt();

        System.out.print("두 번째 정수 입력 : ");
        int second = sc.nextInt();

        // 3. 큰 수에서 작은 수를 뺀 결과값 출력하기(큰 수와 작은 수를 어떻게 판별할지 생각해보기!)
        // 조건문? 실행문1 : 실행문2
        int result = (first > second) ? (first - second) : (second - first);

        // 4. 결과 출력하기.
        System.out.println("두 수의 차는 " + result + " 입니다.");
        



        
    }
}