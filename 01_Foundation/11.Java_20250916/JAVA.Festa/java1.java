
import java.util.Scanner;

public class java1 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("현재 몸무게를 입력하세요 : ");
        int currentWeight = sc.nextInt();

        System.out.println("목표 몸무게를 입력하세요 : ");
        int targetWeight = sc.nextInt();

        int week = 1;


        do{
            System.out.println(week + " 주차 감량 몸무게를 입력하세요 : ");
            int downWeight = sc.nextInt();
    
            currentWeight -= downWeight;
            System.out.println("현재 몸무게는 "+ currentWeight + " kg 입니다.");
    
            if(currentWeight <= targetWeight){
                System.out.println(targetWeight + "kg 달성 !! 축하합니다.");
        
            }
                week++;

                
        } while (currentWeight > targetWeight);
        
    }
}
