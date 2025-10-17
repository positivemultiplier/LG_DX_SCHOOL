
import java.util.Scanner;



public class test31_2 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("입력 : ");
        int n = sc.nextInt();

        long factorial = 1; 
        for (int i = 1; i < n; i++) {
            factorial *= i;
        }
        System.out.println("출력 : " + factorial);
    }
}
