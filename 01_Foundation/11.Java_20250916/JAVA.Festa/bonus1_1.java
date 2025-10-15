
import java.util.Scanner;

public class bonus1_1 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        while (true) { 
            System.out.print("A 입력 >> ");
            int num1 = sc.nextInt();
    
            System.out.print("B 입력 >> ");
            int num2 = sc.nextInt();
    
            if(num1 == 0 && num2 == 0){
                System.out.println("프로그램이 종료됩니다.");
                break;
            }
            System.out.println("결과 >> " + (num1 - num2));
            
        }
    }
}
