
import java.util.Scanner;

public class test31_1 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("입력 : ");
        int N = sc.nextInt();

        long factorial = 1;
        for (int i = 1; i < N; i++) {
            factorial *= i;
        }

        System.out.println("출력 : " + factorial);


        System.out.print("입력 : ");
        int num = sc.nextInt();

        long factoriall = 1;
        for (int i = 0; i < num; i++) {
            factoriall *= i;
        }
        System.out.println("출력 : " + factoriall);

    }

}
