public class EX03Multiplier {
    public static void main(String[] args) {
        
        
        //(77 * 1) + (76 * 2) + (75 * 30) + ... + ( 1 * 77) = ???을 계산하여 결과를 출력하세요
        // answer 79079

        
        //Neo's 접근법
        int sum = 0;

        for (int i = 77; i >= 1; i--){

            for(int j = 1; j <= 77; j++){
                if (i + j == 78){
                    sum += i * j;
                }
            }

        }
        System.out.println("결과는 " + sum + " 입니다.");
        System.out.println("========================================================================");




        // 풀이1.
        // think1. 독립변수2개 종속변수 1개 필요하구나.
        int sum1 = 0;
        int num1 = 1;
        for (int i = 77; i > 0; i--){ //i:77 => 1 감소
            sum1 += i * num1; // 누적해서 곱하겠다 => 복합연산자 += 
            num1++; // num: 1 => 77 증가
        }
        System.out.println("결과는 " + sum + " 입니다.");

        System.out.println("========================================================================");
        // 풀이2. 이중for문
        int total = 0;
        for (int i = 77; i > 0; i--){ // i: 77 => 1 감소
            for(int j = 1; j <= 77; j++){ // j: 1 => 77 증가
                if (i + j == 78){ // i + j = 78 이면 곱셈하겠다.
                    total += i * j; // 누적해서 곱하겠다 => 복합연산자 += 
                }
            }
        }
        System.out.println("결과는 " + total + " 입니다.");

    }
}
