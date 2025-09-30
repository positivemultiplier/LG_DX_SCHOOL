package EX01Array;

import java.util.Arrays;
import java.util.Scanner;

public class EX04practice {
    public static void main(String[] args) {
        

        // 1. 성적 데이터를 저장할 수 있는 배열 생성
        int[] array = new int[5];

        // 2. 성적 입력받기(5개) --> Scanner 이용
        Scanner sc = new Scanner(System.in);
        
        for (int i = 0; i < array.length; i ++){
            System.out.print(i+1 + "번째 입력 >> ");
            array[i] = sc.nextInt();
        }

        // 3. 입력받은 데이터 전부 출력하기 --> Arrays.toString(배열명)
        System.out.println("입력된 점수 : " + Arrays.toString(array));

        // 4. 최고 점수(max), 최저점수(min), 종합(sum)을 저장할 수 있는 변수 선언하기
        // 저장할 수 있는 변수 선언하기

        int max = 0;
        int min = array[0];
        int sum = 0;
        double average = 0;

        // 5. 배열 안의 모든 데이터와 max를 비교하면서 최고 점수 구하기
        for(int i = 0; i < array.length; i++){
            if(max < array[i]  ){
                max = array[i];
            }
        }System.out.println("max : " + max);

        // 6. 배열 안의 모든 데이터와 min을 비교하면서 최저 점수 구하기

        for(int i = 0; i < array.length; i++){
            if(min > array[i]){
                min = array[i];
            }
        }System.out.println("min : " + min);


        // 7. 배열 안의 모든 데이터를 더해서 총합 구하기(누적합계)
        for(int i = 0; i < array.length; i++){
            sum += array[i];
        }
        System.out.println("sum : " + sum);

        // 8. 결과값들 출력하기(이때 평균은 소수점이 나올 수 있도록!)
        average = sum/array.length;
        System.out.println("average : " + average);
        System.out.println(Math.round(average));
    }
}
