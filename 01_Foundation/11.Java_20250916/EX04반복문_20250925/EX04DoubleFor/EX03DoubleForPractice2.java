public class EX03DoubleForPractice2 {
    public static void main(String[] args) {
        //공포의 별찍기

        //     *-> Space4번, *1번
        //    **-> Space3번, *2번
        //   ***-> Space2번, *3번
        //  ****-> Space1번, *4번
        // *****-> Space0번, *5번

       //step1. 출력 예상문 만들어보기.
        System.out.print(" ");
        System.out.print(" ");    
        System.out.print(" ");       
        System.out.print(" ");      
        System.out.print("*");
        System.out.println("");

        System.out.print(" ");
        System.out.print(" ");
        System.out.print(" ");
        System.out.print("*");
        System.out.print("*");
        System.out.println("");


        System.out.print(" ");
        System.out.print(" ");
        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.println("");


        System.out.print(" ");
        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.println("");

        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.println("");
        

    System.out.println("========================================================================");    


        //step2. 반복되는 패턴 찾아서 1중 for문 만들기   
    
        for( int i = 0; i < 4; i ++){
            System.out.print(" ");
        }
        System.out.print("*");
        System.out.println();

        for( int i = 0; i < 3; i ++){
            System.out.print(" ");
        }
        System.out.print("*");
        System.out.print("*");
        System.out.println();

        for( int i = 0; i < 2; i ++){
            System.out.print(" ");
        }
        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.println();        

        
        for( int i = 0; i < 1; i ++){
            System.out.print(" ");
        }
        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.println();


        for( int i = 0; i < 0; i ++){
            System.out.print(" ");
        }
        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.println();   


    System.out.println("========================================================================");

        // step3. 2번째 for문 규칙 찾기
        for( int i = 0; i < 0; i ++){
            System.out.print(" ");
        }
        for (int i = 0; i < 4; i++){
            System.out.println("*");
        }
        System.out.println();




        //Step 4. 2중for문 
        for(int j = 1; j <6; j++ ){
            for (int i = 0; j < 5-j; i++) { // 5-j : 4-3-2-1-0
                System.out.print(" ");
            }
            for (int i = 0; i < j; i++) { // j : 1-2-3-4-5
                System.out.print("*");
            }
            System.out.println();
        }
    }
}
