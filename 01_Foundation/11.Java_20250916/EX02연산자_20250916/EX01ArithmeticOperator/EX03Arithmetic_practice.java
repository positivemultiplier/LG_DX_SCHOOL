package EX01ArithmeticOperator;

import java.util.Scanner;

public class EX03Arithmetic_practice {

    public static void main(String[] args) {
        // 변수 num 값을 입력받아 백의자리 이하를 버리는 코드를 작성하라.
        //만일 변수 num의 값이 456이라면 400이 되고, 111이라면 100이 된다.

        // Scanner sc = new Scanner(System.in);
        // System.out.print("정수를 입력하세요: ");
        // int num = sc.nextInt();

        // 정수입력 : 456
        // 결과값 : 400

        // 정수입력 : 111
        // 결과값 : 100



        try(
        // 1. 입력받는 도구 꺼내오기
        Scanner sc = new Scanner(System.in)){

        // 2. 정수입력 출력하기(개행없이)
        System.out.print("정수를 입력하세요: ");

        // 3. 정수 입력받기
        int num = sc.nextInt();

        // 4. 백의자리 이하를 버리기(백의자리 이하를 버리는 걸 어떻게 머리에서 계산했는지 생각해보기!)
        int result1 = (num / 100) * 100;
        // 4.2. 방법2
        int result2 = num - (num % 100);


        // 5. 결과값 출력하기
        System.out.println("결과값(NUM1): " + result1);
        System.out.println("결과값(NUM2): " + result2);
        } 
    }
}
