import java.util.Scanner;

public class test26 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("첫 번째 숫자 입력 >> ");
        int num1 = sc.nextInt();
        System.out.print("두 번째 숫자 입력 >> ");
        int num2 = sc.nextInt();

        // 두 번째 숫자의 각 자리 수 추출
        int ones = num2 % 10;           // 일의 자리
        int tens = (num2 / 10) % 10;    // 십의 자리
        int hundreds = (num2 / 100) % 10; // 백의 자리

        // 각 자리수와의 곱셈 결과 출력
        System.out.println(num1 * ones);
        System.out.println(num1 * tens);
        System.out.println(num1 * hundreds);
        
        // 최종 결과 출력
        System.out.println(num1 * num2);
    }
}
