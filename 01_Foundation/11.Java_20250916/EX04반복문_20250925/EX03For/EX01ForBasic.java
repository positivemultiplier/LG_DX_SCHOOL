

public class EX01ForBasic {
    public static void main(String[] args) {

        //for( ⓐinitialization; ⓑⓔcondition; ⓓ△increment/decrement) {
        //    ⓒexecute;
        //}

        // for문 구조 
        // 1부터 10까지 출력

        for (int i = 1; i <= 10; i++){
            // Scanner sc = new Scanner(System.in);
            // sc.nextInt()
            System.out.println(i);
        }


        System.out.println("========================================================================");


        // 실습1. for문을 사용해서 96에서 73까지 출력하기

        for(int i = 96; i >= 73; i--){
            System.out.print(i + ",");
            if (i == 73){
                System.out.println();
                System.out.println("종료되었습니다.");
                break;
            }
        }

        System.out.println("========================================================================");


        // 실습2. 숫자들 중에서 홀수만 출력하기 (96에서 73까지 출력)

        // 방법 1
        // 1. 96부터 73까지 1씩 감소하는 for문 만들기
        for(int i = 96; i >= 73; i--){
            if (i == 73) {
                System.out.print("홀수는 " + i + ",");
                System.out.println();
                System.out.println("종료되었습니다.");
                break;
            
            }else if (i % 2 == 1){
                System.out.print("홀수는 " + i + ",");
            }
        }

        System.out.println("========================================================================");
        
        // 방법 2
        // 2. 95부터 73까지 2씩 감소하는 for문 만들기
        for(int i = 95; i > 72; i -=2){
            System.out.print(i + " ");}

    }
}
