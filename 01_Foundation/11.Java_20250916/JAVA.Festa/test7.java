
import java.util.Scanner;

public class test7 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("행 개수 : ");
        int rowCount = sc.nextInt();
        
        for (int i = rowCount; i >= 1; i--) {
            for (int j = 1; j <= i; j++) {
                System.out.print("*");       
            }
            System.out.println();
        }

    }
}
