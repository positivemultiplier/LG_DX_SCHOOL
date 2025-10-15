
import java.util.Scanner;

public class test8 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("숫자 입력 : ");
        int number = sc.nextInt();
        int result = (int)(Math.round(number/10.0) * 10);
        System.out.println("반올림 수 : " + result);



    }
}
