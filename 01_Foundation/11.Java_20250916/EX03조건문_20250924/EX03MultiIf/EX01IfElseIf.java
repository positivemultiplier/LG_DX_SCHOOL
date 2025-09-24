
import java.util.Scanner;

public class EX01IfElseIf {
    public static void main(String[] args) {
        
        /* 사용자로부터 숫자를 입력받아서 해당하는 숫자가
        홀수인지, 짝수인지, 0인지 판단하는 프로그램
        */

        // 1. 입력받는 도구 꺼내오기
        Scanner sc = new Scanner(System.in);

        // 2. 숫자를 입력하세요. 출력하기
        System.out.println("숫자를 입력하세요 :");

        // 3. 숫자 입력받기
        int num = sc.nextInt();

        // 4. 조건을 판단해서 홀수인지, 짝수인지, 0인지 출력
        // --> 다중 if 문 활용하기!!
        // ★ 조건식의 순서도 생각해서 로직 구성하기!
        if (num == 0) {
            System.out.println("입력하신 숫자는 " + num + " 입니다");
        }  else if (num % 2 == 0) {
            System.out.println("입력하신 숫자 " + num + "는 짝수 입니다.");
        } else  {
            System.out.println("입력하신 숫자 " + num + "는 홀수 입니다." );
        }
        


    }
}
