
import java.util.Arrays;
import java.util.Random;

public class EX03OddFinding {
    public static void main(String[] args) {
        // 홀수 찾기
        // 1. 정수형 데이터 5개를 저장할 수 있는 배열 array를 선언하세요.
        // 2. 배열 안의 모든 데이터를 임의의 값으로 초기화하세요(1~100 가지의 수) => random()
        // 3. 배열 안의 데이터 중 홀수의 값만 출력하고, 총 몇 개인지 출력하세요.

        // Answer : array에 들어있는 홀수는 53 39 5 이며, 총 3개 입니다.


        // 1. 정수형 데이터 5개를 저장할 수 있는 배열 array를 선언하세요.
        int[] numbers = new int[5];
        int length = numbers.length;
        System.out.println(length);
        System.out.println("==================================================");

        
        
        
        // 2. 배열 안의 모든 데이터를 임의의 값으로 초기화하세요(1~100 가지의 수) => random()
        // 각 인덱스마다 value 값을 넣어주기.
        Random ran = new Random();
        
        
        int odd = 0;
        for (int i = 0; i < length; i++){
            
            numbers[i] = ran.nextInt(100) + 1;// 0부터 99까지 추출이지만 +1 해줘야 100까지 추출이된다. 
            
            // System.out.print(numbers[i] + " \t");
            
            
            // 3. 배열 안의 데이터 중 홀수의 값만 출력하고, 총 몇 개인지 출력하세요.
            // 배열 안의 모든 데이터 출력하기(keyword) 
            // Arrays.toString(배열명)
            System.out.println(Arrays.toString(numbers));
            System.out.println("Array에 들어있는 홀수는" );
            
            
            for(i =0; i < length; i++){
                if (numbers[i] % 2 == 1){
                    System.out.print("\n " + numbers[i] + " 는 홀수입니다.");
                    odd++ ;
                }
            }
            
            
        }
        System.out.println("이며,");
        System.out.println("총"+ odd + "개 입니다.");

        // System.out.println(Arrays.toString(numbers));
      



        




    }
}
