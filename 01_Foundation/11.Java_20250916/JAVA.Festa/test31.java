import java.util.Scanner;

public class test31 {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("입력 : ");
        int N = sc.nextInt();
        
        // long으로 잡는 이유는 factorial은 기하급수적으로 수가 증가한다. 
        // byte-> short-> int-> long(20!까지는 가능 21!부터는 불가능) 
        long factorial = 1;
        for (int i = 1; i <= N; i++) {
            factorial *= i;
        }
        
        System.out.println("출력 : " + factorial);
    }    
}
