
import java.util.Random;
import java.util.Scanner;

public class EX03DoWhilePractice2 {
    public static void main(String[] args) {
        // Plus Game

        /*
         * 1.랜덤으로 정수 2개를 뽑아 문제를 출력하세요.
         * 2. 사용자로부터 두 수의 합을 입력받으세요.
         * 3. 입력받은 수를 두 수의 합과 일치하면 "성공!", 그렇지 않은 경우 "실패.."를 출력해주세요.
         * 4. 일치하지 않았을 때만 다시 실행할 것인지 물어보고 "Y"를 입력하면 계속 실행, "N"을 입력하면 프로그램을 종료하세요.
         * 
         * === Plus Game===
         * 3 + 4 = ?7
         * Success
         * 6 + 9 = ?15
         * Success
         * 6 + 3 = ?9
         * Success
         * 5 + 3 = ?2
         * Fail
         * 계속 하시겠습니까?>> Y
         * 5 + 4 = ?9
         * Success
         * 8 + 5 = 2
         * Fail
         * 계속 하시겠습니까? >> N
         * 종료합니다.
         */


        // 1. 입력도구 꺼내오기.
        Scanner sc = new Scanner(System.in);

        // 2. 랜덤숫자 생성 도구 꺼내오기
        Random random = new Random();

        // 7. 무한반복문 사용
        do {
            // 3. 랜덤한 숫자 2개 생성하기(범위 : 1~9)
            int randomNum1 = random.nextInt(9) + 1;
            int randomNum2 = random.nextInt(9) + 1;
        
            System.out.println(randomNum1);
            System.out.println(randomNum2);

            // 4. 문제 출력
            System.out.print(randomNum1 + " + " + randomNum2 + " = ");
            
            // 5. 사용자로부터 정답 입력받기
            int answer = sc.nextInt();

            // 6. 입력받은 숫자와 실제 정답이 같은지 비교 
            if (answer == (randomNum1 + randomNum2)){
                System.out.println("Success!!");
            } else {
                // 6-1. 정답이 일치하지 않은 경우에만 계속하시겠습니까? 문구 출력
                System.out.println("Fail");
                System.out.print("계속 하시겠습니까? >> ");

                //sc.next()는 String으로 반환받아야한다. 
                String userChoice = sc.next(); // Y or N

                
                // 6-2. N을 입력받으면 프로그램 종료
                // String 비교는 ==(사용X) 이 아니라 equals() 메서드를 사용해야한다.
                // 문자열 비교개념
                // 기본자료형에서 같은지 비교할 때는 == 사용했음
                // String은 기본자료형X, equals() 명령어를 사용해야 한다!
                if (userChoice.equals("N") || userChoice.equals("n")){
                    System.out.println("종료합니다.");
                    
                    //반복문은 break;로 종료시킨다. 
                    break;
                            
                }
            }
        } while (true);

    }

}
