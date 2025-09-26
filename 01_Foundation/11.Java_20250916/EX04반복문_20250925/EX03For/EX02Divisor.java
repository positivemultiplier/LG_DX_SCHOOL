
import java.util.Scanner;

public class EX02Divisor {
    public static void main(String[] args) {
        // 약수(Divisor) 구하기
        // 1. 숫자를 입력 받는다.
        // 2. 입력받은 숫자를 임의의 숫자로 나누었을 때 나머지가 0 이라면 약수!

        // 1. 입력도구 꺼내오기
        Scanner sc = new Scanner(System.in);

        // 2. 정수 입력받기
        System.out.println("정수를 입력하세요 : ");
        long inputNumber = sc.nextLong();
        
        // 3. 약수 출력하기
        // 입력받은 숫자를 임의의 숫자로 나누었을 때 나머지가 0이라면? 약수
        for (long i = 1; i <= inputNumber; i++){
            if (inputNumber % i == 0){
                System.out.println(inputNumber + "의 약수는 " + i + " 입니다.");
            }
        }
    }
}
