
import java.util.Scanner;

public class EX02CalculateProgram {
    public static void main(String[] args) {
        //if-else문 예제
        //다음은 에버랜드 입장료 계산 프로그램입니다.
        //기본료는 5,000원이며, 인원수에 따라 지불해야하는 프로그램을 만들어보세요.
        //단, 20세 미만인 경우 50% 할인이 적용됩니다.
        
        int enteranceFee = 5000;
        int totalFee = 0; // ★★★전역변수(Global Variable) 초기화(init)★★★

        // 1. 입력도구 꺼내오기
        Scanner sc = new Scanner(System.in);

        // 2. 나이 입력받기
        System.out.println("==========에버랜드에 오신 걸 환영합니다! ==========");
        System.out.print("나이를 입력하세요 : ");
        int age = sc.nextInt();

        // 3. 인원수 입력받기
        System.out.print("인원수를 입력하세요 : ");
        int people = sc.nextInt();

        // 4. 입장료 계산하기
        // 4-1. 20세 미만인 경우 입장료 50% 할인(기본 입장료: 5,000원)
        if(age < 20){
            // 정수랑 실수랑 계산할때는 형변환 꼭해주기int(정수, 4byte) 0.5는 Double(실수,8byte)타입으로 인식한다.=> 강제 형변환 
            totalFee = (int)(enteranceFee * 0.5 * people);
        } else {
        // 4-2. 그렇지 않은 경우 입장료 그대로 계산
            totalFee = enteranceFee * people;
        }

        // 5. 결과 출력
        System.out.println("총 입장료는 " + totalFee + "원 입니다.");

       
    }
}
