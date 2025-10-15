
import java.util.Scanner;

public class test28_1 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("문자열 형태의 2진수를 입력하세요 : ");
        String str = sc.next();

        int decimal = Integer.parseInt(str, 2);
        System.out.println(str + "(2) = " + decimal + "(10)");
    }
}
