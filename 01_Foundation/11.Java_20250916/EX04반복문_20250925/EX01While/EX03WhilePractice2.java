
import java.util.Scanner;

public class EX03WhilePractice2 {
    public static void main(String[] args) {
        // 숫자를 입력 받아 홀수와 짝수가 각각 몇 개 입력되어있는지 출력하는 프로그램을 작성하세요.
        // -1을 입력한 경우 프로그램 종료

        
        // 1. 입력받는 도구 불러오기
        Scanner sc = new Scanner(System.in);

        // 홀수, 짝수 개수를 저장할 전역Global 변수variable 만들기
        int oddCount = 0; // 홀수 개수
        int evenCount = 0; // 짝수 개수
        int inputNumber = 0;

        
        while (true) { 
           
            // 2. 정수 입력멘트 출력하기(개행없이)
            System.out.print("정수를 입력하세요 : ");
    
            // 3. 정수 입력 받기
            inputNumber = sc.nextInt();

            if (inputNumber == -1) {
                System.out.println("짝수의 개수 : " + evenCount);
                System.out.println("홀수의 개수 : " + oddCount);
                System.out.println("프로그램을 종료합니다.");
                break;
                
                
            // 4. 입력받은 정수가 짝수라면 짝수의 개수를 +1
            // ---> 짝수의 개수와 홀수의 개수를 구할 변수 하나씩 필요
            }else if (inputNumber % 2 == 0) {
                System.out.println("짝수카운트를 증가시키겠습니다.");
                evenCount++;
                //break;
           
            // 5. 입력받은 정수가 홀수라면 홀수의 개수를 +1
            }else if(inputNumber % 2 != 0) {
                System.out.println("홀수카운트를 증가시키겠습니다.");
                oddCount++;
                //break;
            }
        }
        


        /*혼자 연습해보기 20250925
        // 숫자를 입력 받아 홀수와 짝수가 각각 몇 개 입력되어있는지 출력하는 프로그램을 작성하세요.
        // -1을 입력한 경우 프로그램 종료
        

        // 1. 입력도구 불러오기
        Scanner sc = new Scanner(System.in);

        // 2. 홀수와 짝수 전역변수 설정
        int oddCnt = 0;
        int evenCnt = 0;


        while(true){
            // 3. 정수 입력 멘트 
            System.out.print("정수를 입력하세요: ");

            // 4. 입력받은 정수 변수에 할당
            int inputNumber = sc.nextInt(); 


            // 5. 입력받은 정수가 홀수라면 cnt+1
            if (inputNumber % 2 == 1){
                System.out.println("입력하신" + inputNumber + "는 홀수입니다.");
                oddCnt++;

            // 6. 입력받은 정수가 짝수라면 cnt+1
            }else if (inputNumber % 2 == 0){
                System.out.println("입력하신" + inputNumber + "는 짝수입니다.");
                evenCnt++;

            // 7.    
            }else if(inputNumber == -1){
                System.out.println("시스템을 종료합니다.");
                System.out.println("홀수 카운트 : " + oddCnt);
                System.out.println("짝수 카운트 : "+ evenCnt);
                break;
            }
        }
        */





    }
}
