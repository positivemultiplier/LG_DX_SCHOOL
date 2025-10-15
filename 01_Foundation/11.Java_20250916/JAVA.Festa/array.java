
import java.util.Arrays;
import java.util.Random;

public class array {
    public static void main(String[] args) {
        // 문제:  8칸 크기의 배열을 선언하고 랜덤수로 초기화 한 후 가장 큰 수와 작은 수를 각각 출력하시오.

        //결과화면
        // 배열에 있는 모든 값 : 10, 56, 21, 55, 35, 54, 14, 26
        // 가장 큰 값 : 56
        // 가장 작은 값 : 10

        // 1. 도구 불러오기.
        Random ran = new Random();

        // 2. 배열 선언 및 초기화
        int[] array = new int[8];

        
        // 3. 랜덤수 배열에 넣기
        // for (int i = 0; i < array.length; i++ ){
            //     array[i] = ran.nextInt(8)+1;
            // }
            
            // System.out.println(Arrays.toString(array));

            
        // 4. max, min 값 골라내기.
            int max = 0;
            int min = array[0];
            
        for (int i = 0; i < array.length; i++){
                
            array[i] = ran.nextInt(8)+1;
            
            
            for (int j = 0; j < i; j++){
                if (array[i] == array[j]){
                    array[i] = ran.nextInt(8)+1;
                    j = -1; 
                }
                // else if (max < array[i]){
                //     max = array[i];
                // }else if (min > array[i]){
                //     min = array[i];
                // }   
            }
        }

        for(int i = 0; i < array.length; i++ ){
            if(max < array[i]){
                max = array[i];
            }else if(min > array[i]){
                min = array[i];
            }
        }
        System.out.println("배열에 있는 모든 값 : " + Arrays.toString(array));
        System.out.println("가장 큰 값 : " + max);
        System.out.println("가장 작은 값 : " + min);

    }
}
