public class EX02DoubleForPractice {

    public static void main(String[] args) {

//Step1. 출력 예상문 만들어보기.
        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.print("*"); 
        System.out.print("*");
        System.out.println("");


//Step2. 패턴 찾아서 1중 for문 만들기
        for(int i = 0; i < 5; i ++){
            System.out.print("*");
        }
        System.out.println();

        for(int i = 0; i < 4; i ++){
            System.out.print("*");
        }
        System.out.println();

        for(int i = 0; i < 3; i ++){
            System.out.print("*");
        }
        System.out.println();

        for(int i = 0; i < 2; i ++){
            System.out.print("*");
        }
        System.out.println();

        for(int i = 0; i < 1; i ++){
            System.out.print("*");
        }
        System.out.println();

System.out.println("========================================================================");
// Step3. 2중 for문 만들어보기
        for (int i = 5; i > 0; i--){
            for (int j = 0; j < i; j++){
                System.out.print("*");
            }
            System.out.println();
        }
        
    }
}
