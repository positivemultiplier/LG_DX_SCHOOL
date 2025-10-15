
import java.util.Scanner;

public class test24_1 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("N 입력 >> ");
        int N = sc.nextInt();

        System.out.print("X 입력 >> ");
        int X = sc.nextInt();


        int[] nums = new int[N];
        for (int i = 0; i < N; i++) {
            System.out.print((i+1) + "번째 정수 입력 >> ");
            nums[i] = sc.nextInt();
            
        }

        System.out.println("결과 >> ");
        for(int i = 0; i < N; i++){
        
            if(nums[i] < X){
                System.out.print(nums[i]+ " ");
            }
        }


        
    }
}
