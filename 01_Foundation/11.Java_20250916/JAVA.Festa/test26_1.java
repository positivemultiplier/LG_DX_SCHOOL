
import java.util.Scanner;

public class test26_1 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("첫 번째 숫자 입력 >> ");
        int Num1 = sc.nextInt();

        System.out.print("두 번째 숫자 입력 >> ");
        int Num2 = sc.nextInt();

        // 두 번째 숫자의 각 자리수 추출
        int one = Num2 % 10;
        int ten = (Num2/10) % 10;
        int houndred = (Num2/100) % 10;

        // 각 자리수와의 곱셈 결과 출력
        System.out.println(Num1 * one);
        System.out.println(Num1 * ten);
        System.out.println(Num1 * houndred);

        // 최종 결과 출력
        System.out.println(Num1 * Num2);
        
    }
}
