package EX02DimensionArray;

import java.util.Random;

public class EX02twoDimensionArray {
    public static void main(String[] args) {
        

        Random ran = new Random();
        // 1. 5행 5열 크기의 array 선언
        int[][] array = new int[5][5];
        int num = 1;
     
        // 2. 1~25까지의 숫자를 순차적으로 저장
        for (int i = 0; i < array.length; i++){
            
            for(int j = 0; j < array[0].length; j++){
                
                array[i][j] = num++;
            }
        }

        // 3. 출력
        // 1    2   3   4   5
        // 6    7   8   9   10
        System.out.println("====================출력하기====================");

        for (int i = 0; i < array.length; i++ ){
            for(int j = 0; j < array.length; j ++){
            
                System.out.print(array[i][j] + " \t");
            }
            System.out.println();
        }




    
    
        
    }
}
