
import java.util.Scanner;

public class EX01SwitchCase {
    public static void main(String[] args) {
         /*
         * int타입의 변수 totalScore를 선언하고 키보드로 값을 입력 받으세요.
         * totalScore가 90점 이상이면 "A학점입니다.",
         * 80점 이상 90점 미만일 경우 "B학점입니다.",
         * 70점 이상 80점 미만일 경우 "C학점입니다.",
         * 70점 미만일 경우 "D학점입니다." 출력하는 프로그램을 작성하세요.
         * 
         * 
         */


         // 1. 입력도구 꺼내오기
        Scanner sc = new Scanner(System.in);
         

         // 2. 점수 입력받기
         //System.out.println("점수를 입력하세요 : ");
         //int totalScore = sc.nextInt();
         System.out.println("점수를 입력하세요 : ");
         int totalScore = sc.nextInt();
         System.out.println(totalScore);
         


         // 3. 점수에 따른 학점 계산하기
         // 점수가 90점 이상이면 --> "A학점입니다."
         // 점수가 80점 이상 90점 미만이면 --> "B학점
         // 점수가 70점 이상 80점 미만이면 --> "C학점"
         // 점수가 70점 미만이면 --> "D학점"
         

    }
}
