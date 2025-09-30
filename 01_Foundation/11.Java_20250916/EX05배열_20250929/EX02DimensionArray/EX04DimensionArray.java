package EX02DimensionArray;

public class EX04DimensionArray {
    public static void main(String[] args) {
        // 정수형 데이터를 저장할 수 있는 5행 5열 크기의 array를 선언하세요.
        // 아래와 같이 21~45까지의 숫자를 저장하고, 출력하세요.

        //21    22  23  24  25
        //30    29  28  27  26
        //31    32  33  34  35
        //40    39  38  37  36
        //41    42  43  44  45


        // 1. row 짝수인경우(증가) => row 홀수인경우(감소) 규칙 찾기
        // 2. 정수형 데이터를 저장할 수 있는 5행 5열 크기의 array를 선언하세요.
        int[][] array = new int[5][5];

        // 3. num 초기값 21로 선언해주기
        int num = 21;


        // 4. array에 숫자 증감 넣기

        //step1 규칙 찾아보기
        // array[0][0] = num++;
        // array[0][1] = num++;
        // array[0][2] = num++;
        // array[0][3] = num++;
        // array[0][4] = num++;

        // array[0][4] = num++;
        // array[0][3] = num++;
        // array[0][2] = num++;
        // array[0][1] = num++;
        // array[0][0] = num++;


        // array[1][0] = num++;
        // array[1][1] = num++;
        // array[1][2] = num++;
        // array[1][3] = num++;
        // array[1][4] = num++;

        // array[1][0] = num++;
        // array[1][1] = num++;
        // array[1][2] = num++;
        // array[1][3] = num++;
        // array[1][4] = num++;


        //step2 반복문으로 변경
        // 짝수행
        // for (int i = 0; i <array.length; i++){
        //     array[0][i] = num++;
        // }

        // // 홀수행
        // for (int i = array.length-1; i >= 0; i--){
        //     array[1][i] = num--;
        // }

        //step3 크게 5번 반복해보자

        for (int j = 0; j < array.length; j++){
            if(j % 2 == 0){
                //짝수행
                for (int i = 0; i <array.length; i++){
                array[j][i] = num++;
                }
            }else {
                //홀수행
                for (int i = array.length-1; i >= 0; i--){ // i--  포인트네
                array[j][i] = num++;
                }
            }
        
        }

        //step4 출력문
          
        System.out.println("====================출력문====================");
        for(int i = 0; i < array.length; i++){
            for(int j = 0; j <array.length; j++ ){
            
                System.out.print(array[i][j] + " \t");
            }

            System.out.println();
        }
 


        // 5. 출력하기 
        // System.out.println("====================출력문====================");

        num = 21;
        for (int i = 0; i < array.length; i++){
            if(i % 2 == 0){
            
                for(int j = 0; j < array.length; j ++){
                    array[i][j] = num++;
                        
                    // System.out.print(array[i][j]+ "\t");
                }
            }else { // 홀수 행 : 감소 순서로 채우기
                int tempNum = num + 4;
                for(int j = 0; j < array.length; j ++){
                    array[i][j] = tempNum--;
                    
                    // System.out.print(array[i][j] + "\t");
                }
                num += 5; // 다음 행 시작 순서로 조정
            }
            // System.out.println();
        
        }

        // 출력
        System.out.println("====================출력문====================");
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                System.out.print(array[i][j] + "\t");
            }
        System.out.println();
        }



    }
}
