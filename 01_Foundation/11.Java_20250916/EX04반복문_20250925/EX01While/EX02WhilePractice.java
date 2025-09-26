
import java.util.Scanner;

public class EX02WhilePractice {
    public static void main(String[] args) {
        
        // while문을 사용하여 키보드로부터 입력받은 수가 10보다 작을 때만 계속 정수를 입력 받으세요.
        // 10보다 큰 수를 입력하면 "종료되었습니다"를 출력


        //방법1 while문 사용
        /*
        // 1. 입력받는 도구 꺼내기
        Scanner sc = new Scanner(System.in);
        int num = 0;
        
        while(num < 10) {
            // 2. 정수 입력코멘트 출력하기 
            System.out.print("정수를 입력하세요: ");
            // 3. 정수 입력받기
            num = sc.nextInt();
            System.out.println("입력하신 번호는 " + num + " 입니다.");

        }
        // 4. 10보다 큰 수를 입력받으면 '종료되었습니다.' 출력후 종료!
        System.out.println("종료되었습니다.");
        sc.close();
         */


         
        // 방법2 무한 반복문 사용
        // 1. 입력받는 도구 꺼내기
        Scanner sc = new Scanner(System.in);
        

        while (true) { 
            System.out.print("정수를 입력하세요 : ");
            // num 변수를 전역변수로 뺄 필요가 없다. Local Variable로 충분하다. 
            int num = sc.nextInt();
            System.out.println("입력하신 번호는 " + num + " 입니다.");
            // 멈추는 조건 만들어주기
            if (num >= 10) {
                System.out.println("종료되었습니다.");
                break;
            }
        }
        



        /* 혼자연습해보기 20250925
        // while문을 사용하여 키보드로부터 입력받은 수가 10보다 작을 때만 계속 정수를 입력 받으세요.
        // 10보다 큰 수를 입력하면 "종료되었습니다"를 출력
        
        // 1. 입력도구 불러오기
        Scanner sc2 = new Scanner(System.in);
        
        // 2. 전역변수 초기화
        int inputNum = 0;

        // 3. 반복문사용
        while(inputNum < 10){
            System.out.println("정수를 입력하세요: ");
            inputNum = sc2.nextInt();
            System.out.println("입력하신 번호는" + inputNum + " 입니다.");
            
            
        }
        //4. 종료 조건 만들어주기
        System.out.println("종료되었습니다.");
         */





    }
}
