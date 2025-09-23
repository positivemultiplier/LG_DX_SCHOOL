
import java.util.Scanner;

public class variables {

    // main을 못만들었다면!!
    // main ctrl space --> 자동완성 가능! 

    public static void main(String[] args) {
        
        // 변수 선언
        // 정수 데이터 4라는 값을 가질 수 있는 num 변수 선언
        // 자료형 변수명 = 값; 
        int num = 4;

        // 변수를 사용하는 이유는? 
        // 1. ★★★재사용성★★★
        // 2. 가독성
        // 3. 유지보수

        System.out.print(num);

        
        
        try (// 1. 입력받는 도구 꺼내오기 => 자동입력 ctrl + shift  사용하면 자동 import 된다.
        Scanner sc = new Scanner(System.in)) {
            // 2. 안내문구 출력
            System.out.print("숫자를 입력하세요 >> ");
            
            // 3. 정수형 숫자 입력받기
            // next는 문자, nextInt는 정수
            //sc.next(); => 연산이 안된다
            sc.nextInt(); // 입력받은 정수를 반환

            int input = sc.nextInt(); // 입력받은 정수를 변수에 할당.

            // 4. 입력받은 정수 출력
            System.out.println("입력받은 숫자: " + input);
        }

        //상수 선언하는 법 --> final 키워드 사용
        //정수형 숫자 3을 담을 수 있는 상수 num2 선언
        @SuppressWarnings("unused")
        final int num2 = 3; 

        //변수에 들어가는 값 변경
        num = 14;
        //num2 = 13; // ★★★상수★★★는 값을 변경할 수 없다.

        // int input = 0; => 변수명 중복선언 불가능!

    }
}
