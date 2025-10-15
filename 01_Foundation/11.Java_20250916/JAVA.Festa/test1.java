
import java.util.Scanner;

public class test1 {
    public static void main(String[] args) {
        int currentWeight = 0;
        int targetWeight =0;
        int downWeight = 0;
        int week = 1;

        Scanner sc = new Scanner(System.in);
        System.out.print(" 현재 몸무게를 입력하세요 : ");
        currentWeight = sc.nextInt();

        System.out.print(" 목표 몸무게를 입력하세요 : ");
        targetWeight = sc.nextInt();

        do { 
            System.out.print( week + " 주차 감량 몸무게를 입력하세요 : ");
            downWeight = sc.nextInt();

            currentWeight -= downWeight;
            System.out.println("현재 몸무게는 " + currentWeight + " 입니다");

            if(currentWeight <= targetWeight){
                System.out.println( targetWeight + " kg 달성!! 축하합니다.");
            }
            
            week ++;

            
        } while (currentWeight > targetWeight);




    }
}
