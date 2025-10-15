
import java.util.Scanner;

public class test4 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("총금액 입력 : ");
        int money = sc.nextInt();


        int[] units = {10000, 5000, 1000, 500, 100};
        int[] counts = new int[units.length];

        int remain = money;

        for( int i = 0; i < units.length; i ++){
            counts[i] = remain / units[i];
            remain = remain % units[i];
        }

        System.out.println("잔돈 : "+ money + " 원");
        for(int i = 0; i < units.length; i++){
            System.out.println(units[i] + " 원 : " + counts[i] + " 개");
        }


    }
}
