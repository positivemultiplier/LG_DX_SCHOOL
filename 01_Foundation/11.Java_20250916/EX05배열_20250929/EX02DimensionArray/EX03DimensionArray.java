package EX02DimensionArray;

public class EX03DimensionArray {
    public static void main(String[] args) {
     
        // 정수형 데이터를 저장할 수 있는 5행 5열 크기의 array를 선언하세요.
        // 아래와 같이 21~45까지의 숫자를 저장하고, 출력하세요.

        //21    26  31  36  41
        //22    27  32  37  42
        //23    28  33  38  43
        //24
        //25




        // 1. 5행 5열 이차원 배열 생성
        int[][] array = new int[5][5];


        // 2. 21부터 시작하는 변수 num 선언하기
        int num = 21;

        // 3. 데이터가 저장될 수 있도록 코드 작성(열 방향으로 1씩 커지도록)
        for(int i = 0; i < array.length; i++){
        
            for(int j = 0; j < array.length; j ++){
                array[j][i] = num;  
                num ++;
            }
        
        }
        // 4. 출력
        System.out.println("====================출력문====================");
        for(int i = 0; i < array.length; i++){
            for(int j = 0; j <array[0].length; j++ ){
            
                System.out.print(array[i][j] + " \t");
            }

            System.out.println();
        }
 
        
    }
}
