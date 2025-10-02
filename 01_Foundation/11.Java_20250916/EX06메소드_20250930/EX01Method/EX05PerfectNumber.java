
import java.util.Scanner;



public class EX05PerfectNumber {
    public static void main(String[] args) {
        
        // 완전 수 구하기 (Level Up!)
        // ex)6 => 1 , 2 , 3 , 6 => 자기를 제외한 나머지 수를 더 했을때 나 자신과 같다.
        // step1. 약수를 구하고
        // step2. 다 더하기
        // step3. 비교하기

        // num2가 num1의 약수인지 확인하여 약수라면 true, 아니라면 false를 반환하는 isDivisor 메소드를 만들어주세요

        /* 출력문
         * num1 입력 : 10
         * num2 입력 : 2
         * true
         * 
         * 
         * num1 입력 : 9
         * num2 입력 : 2
         * false
         */

        
        //ⓐ 0.기본 정보 
        
        //Step1. isDivisor Mathod 만들고 => 약수 찾기
        /* 
        Scanner sc = new Scanner(System.in);
        System.out.print("num1 입력 : ");
        int num1 = sc.nextInt();
        System.out.print("num2 입력 : ");
        int num2 = sc.nextInt();
        isDivisor(num1, num2);
        boolean Divisor = isDivisor(num1, num2);
        System.out.println(Divisor);
        
        
        */

        //ⓒ step2. getSum Method만들고 =>  약수 총합 구하기
        int check = 44;
        System.out.println(getSum(check));


        //ⓔ step3. isPerfect Method 만들고 => 완전수 판별하기
        //입력받은 매개변수가 완전수라면 true, 아니라면 false를 반환한느 isPerfect메소드를 생성하세요.

        System.out.println("====================완전수 체크해보자====================");
        int perfectNumberCheck = 0;
        Scanner sc = new Scanner(System.in); 
        System.out.print("완전수를 확인할 수를 입력하세요 : ");
        perfectNumberCheck = sc.nextInt();
        
        System.out.println(perfectNumberCheck + "은(는) 완전수일까 ? " + isPerfect(perfectNumberCheck));
        System.out.println("확인할수의 총 합은? " + getSum(perfectNumberCheck)); 




    }


    // ⓑ 1. 약수 찾기 메소드
    // 메소드명 : isDivisor
    // 매개변수 : int 2개
    // 리턴타입 : boolean

    
    private static boolean isDivisor(int num1, int num2){
    
        // 약수판단 (실패)
        // for(int i = 0; i < num1; i++){
        //     if (num1 % i == 0) {
        //         return true; 
        //     }else {
        //         return false;
        //     }
        // }


        boolean result = false;

        //num2가 num1의 약수이니? 
        if (num1 % num2 == 0) {
            result = true; 
        }

        
        return result;
    
    }
     



    // ⓓ 3. 자신을 제외한 약수의 총합을 구하는 getSum 메소드를 작성하세요.
    // 메소드명 : getSum
    // 매개변수 : int 1개
    // 리턴타입 : int

    private static int getSum(int check){
        // result 변수 초기화
        int result = 0;

        // logic
        // 3.1. 입력된 숫자의 약수를 구한다 --> 1~ num까지 중 num 제외한 범위
        for (int i = 1; i < check; i++){
        
            // 3.1.1. i는 num의 약수!
            /*
            if(check % i == 0){

                //result에 누적
               result += i ;
            }
             */

            // 3.1.2.class 내부의 method 호출해서 사용하는 방법
            if(isDivisor(check, i)){
                result += i;
            }
        }
        // result 변수 반환 
        return result;
    }


    
    // 3. 완전수인지 확인하는 메소드
    // 메소드명 : isPerfect
    // 매개변수 : int i개
    // 리턴타입 : boolean
    

    private static boolean isPerfect(int perfectNumber){
    
        // result 변수 초기화
        boolean result = false;



        // logic
        if(perfectNumber == getSum(perfectNumber)){
            
            //true 라면 perfectNumber 는 완전수이다!
            result = true;
        
        }


    

        // result 변수 반환
        return result;

        // 코드 줄이기 위해서는 아래와 같이 판단해야한다.
        // return result == getSum(perfectNumber);


    }
    
   
    
}
