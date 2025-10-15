
import java.util.Scanner;

public class test2 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("일한시간을 입력하세요 : ");
        int workingTime = sc.nextInt();
        int totalWage = 0;

        if(workingTime <= 8){
            totalWage = workingTime * 5000;

        }else {
            totalWage =  (int)((8 * 5000)+ (workingTime - 8)*(5000 * 1.5)); 
        }
        System.out.println("총 임금은 " + totalWage + " 원 입니다. ");


    }
}
