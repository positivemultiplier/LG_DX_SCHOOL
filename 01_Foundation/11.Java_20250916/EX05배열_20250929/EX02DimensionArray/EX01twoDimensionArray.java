package EX02DimensionArray;

public class EX01twoDimensionArray {
    public static void main(String[] args) {
        
                // 2차원 배열 
        // 1차원 배열 안에 또다른 배열이 있다.
        // 참조가 2번 일어나는 형태(참조의 참조다.)

        // # 1.이차원 배열 선언 방법
        // 자료형[][] 변수명 = new 자료형[행크기][열크기];
        int[][] array = new int[3][3];
        

        // # 2.이차원 배열안에 있는 데이터에 접근하는 방법
        System.out.println(array);
        System.out.println(array[0]);
        System.out.println(array[0][0]);

        array[1][1] = 5;
        System.out.println(array[1][1]);

        // # 3. 이차원 배열에 값 넣기! (1~9)
        int num = 1;

        for (int i = 0; i < array.length; i++ ){ //array.length 행의 length에 접근해야한다
            for(int j = 0; j < array[0].length; j++){ //array.length[0] 열의 length에 접근해야한다.
                array[i][j] = num++;
            }
        }

        // 이차원 배열 값 출력하기 (\t)
        // 1 2 3
        // 4 5 6 
        // 7 8 9

        /*
        System.out.println(Arrays.toString(array[0]));//사용이 가능하기는 하다.but 일일이 하나씩 출력하는게 낫다


        System.out.print(array[0][0] + " \t");
        System.out.print(array[0][1] + " \t");
        System.out.print(array[0][2] + " \t");

        System.out.print(array[1][0] + " \t");
        System.out.print(array[1][1] + " \t");
        System.out.print(array[1][2] + " \t");

        System.out.print(array[2][0] + " \t");
        System.out.print(array[2][1] + " \t");
        System.out.print(array[2][2] + " \t");

         */
        System.out.println("====================출력하기====================");
        for(int i = 0; i < array.length; i ++){
            for(int j = 0; j < array.length; j++){
                System.out.print(array[i][j] + " \t");
            }
            System.out.println();

        }




        System.out.println();



    }

}
