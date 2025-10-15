

import java.util.Scanner;

public class test {
    public static void main(String[] args) {
        
        
        Scanner sc = new Scanner(System.in);
        System.out.print("현재몸무게 : ");
        int currentWeight = sc.nextInt();
        System.out.print("목표몸무게 : ");
        int targetWeight = sc.nextInt();

        int week = 1;
        do { 
            System.out.print(week + " 주차 감량 몸무게를 입력하세요 : ");
            int downWeight = sc.nextInt();

            currentWeight -= downWeight;
            System.out.println("현재 몸무게는 " + currentWeight + " 입니다.");


            if (currentWeight <= targetWeight) {
                System.out.println(targetWeight + " Kg달성 !! 축하합니다 ");
            }

            week ++;
            System.out.println("========================================");


        } while (currentWeight > targetWeight);

            
        


    }
}
