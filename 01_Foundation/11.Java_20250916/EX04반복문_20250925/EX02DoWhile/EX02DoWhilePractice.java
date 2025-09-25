
import java.util.Scanner;

public class EX02DoWhilePractice {
    public static void main(String[] args) {
        // 몸무게 관리 프로그램

        // do-while문을 사용해서
        /*
        1. 현재 몸무게와 목표 몸무게를 입력 받으세요.
        => nowWeight, targetWeight
        2. 주차별 감량 몸무게를 입력 받으세요.
        => week, downWeight 
        3. 현재 몸무게가 목표 몸무게에 달성하면 축하한다는 문구를 출력하고 종료시켜주세요.

        현재몸무게 : 80 
        목표몸무게 : 70 
        1주차 감량 몸무게 : 2 
        2주차 감량 몸무게 : 3
        3주차 감량 몸무게 : 4 
        4주차 감량 몸무게 : 5 
        66kg 달성!! 축하합니다!! 
        */

        // 1. 입력받는 도구 꺼내오기
        Scanner sc = new Scanner(System.in); 

        // 2. 현재 몸무게 입력받기 
        System.out.print("현재 몸무게를 입력하세요: ");
        int nowWeight = sc.nextInt();

        // 3. 목표 몸무게 입력받기.
        System.out.print("목표 몸무게를 입력하세요: ");
        int targetWeight = sc.nextInt();


        int week = 1;


        // 4. 주차별 감량 몸무게 입력받기(do-while문 이용!!) 
        do {
            System.out.print(week + "주차 감량 몸무게를 입력하세요: ");
            int downWeight = sc.nextInt();
            
            // 5-1. 현재 몸무게 = 원래 몸무게 - 감량 몸무게 (변수 더 만들필요X)
            nowWeight -= downWeight; // nowWeight = nowWeight - downWeight;
            System.out.println("현재 몸무게는 " + nowWeight + "kg 입니다.");
            
            // 5-2. 현재 몸무게가 목표 몸무게에 도달했는지 조건을 판단.
            if (nowWeight <= targetWeight){
                System.out.println(targetWeight + "kg 달성!! 축하합니다!!");
            }
            week++;

        } while (nowWeight > targetWeight); // 현재 몸무게가 목표 몸무게보다 클 때 계속 반복

        // 핵심기능을 먼저 만들고, 그 다음 부가적인 기능을 추가하는 방식으로 코딩하자!!


        /* 혼자 연습하기 20250925*/
        // 몸무게 관리 프로그램

        // do-while문을 사용해서
        /*
        1. 현재 몸무게와 목표 몸무게를 입력 받으세요.
        => nowWeight, targetWeight
        2. 주차별 감량 몸무게를 입력 받으세요.
        => week, downWeight 
        3. 현재 몸무게가 목표 몸무게에 달성하면 축하한다는 문구를 출력하고 종료시켜주세요.

        현재몸무게 : 80 
        목표몸무게 : 70 
        1주차 감량 몸무게 : 2 
        2주차 감량 몸무게 : 3
        3주차 감량 몸무게 : 4 
        4주차 감량 몸무게 : 5 
        66kg 달성!! 축하합니다!! 
        */
        


        
    }
}
