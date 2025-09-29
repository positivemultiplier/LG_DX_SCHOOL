
import java.util.Arrays;
import java.util.Scanner;

public class EX04ScoreCarculate {
    public static void main(String[] args) {
        
        // 1. 정수형 데이터 5개를 저장할 수 있는 배열 array를 선언하세요
        int[] array = new int[5];

        // 2. 배열 안의 데이터를 모두 입력 받으세요.
        Scanner sc = new Scanner(System.in);
        for (int i = 0; i < array.length; i++){
        
            System.out.print("점수를 입력하세요 : ");
            array[i] = sc.nextInt();
        }
        
       
        
        // 3. 입력한 점수를 출력하세요.
        System.out.println("입력된 점수 : " + Arrays.toString(array));

        // 4. 최고 점수(Max와 최저 점수(Min), 종합(Sum)을 저장할 수 있는 변수 선언하기.
        int MaxScore = 0;
        int MinScore = array[0];
        int SumScore = 0;

        // 5. 배열 안의 모든 데이터와 max를 비교하면서 최고 점수를 구하기
        for (int i = 0; i < array.length ; i ++){
            if( MaxScore < array[i] ){
                MaxScore = array[i];
            }
        
        }
        System.out.println("최고점수 : " + MaxScore);



        // 6. 배열 안의 모든 데이터와 min을 비교하면서 최저 점수 구하기
        for (int i = 0; i < array.length; i++){
            if( array[i] < MinScore){
                MinScore = array[i];
            }
        }
        System.out.println("최저점수 : " + MinScore);



        int sum = 0;

        // 7. 배열 안의 모든 데이터를 더해서 총합 구하기(누적합계)
        for (int i = 0; i < array.length; i++) {
        
            sum = sum + array[i];
            
        }
        System.out.println("총합 :" +  sum);



        float mean = 0;

        // 8.  결과값들  평균 출력하기(이때 평균은 소수점이 나올 수 있도록!)
        for(int i = 0; i < array.length; i++  ) {
            mean += (float)array[i]/array.length;
        }
        System.out.println("평균 :" + mean);


    }
}
