
import java.util.Scanner;

public class EX04MethodPractice {
    public static void main(String[] args) {
        // 10에 더 가까운 수 구하기

        // 정수형 num1과 num2를 입력받으세요

        // num1과 num2중 10에 더 가까운 수를 반환하는 close10 Method를 생성하세요.
        // 단, 두 숫자 모두 10과의 차이가 같다면 0을 반환하세요!

        //출력문
        /*
        정수 입력 : 15
        정수 입력 : 5
        10에 가까운 수 : 0

        정수 입력 : -1
        정수 입력 : -5
        10에 가까운 수 : -1
         */

        //0. 기본틀
        Scanner sc = new Scanner(System.in);
        System.out.print("정수 입력 : ");
        int num1 = sc.nextInt();
        System.out.print("정수 입력 : ");
        int num2 = sc.nextInt();
        int result = close10(num1, num2);
        System.out.println("10에 가까운 수 : " + result);



        // 산술 함수 
        double a = 3.1415926535798;
        double b = 2.7182818284590;
        Math.abs(a - b); // 절대값(absolute)
        Math.max(a,b);   // 최대값(Max)
        Math.min(a,b);   // 최소값(Min)

        //반올림 올림 내림
        Math.round(a); // 반올림(소수 첫째 자리 기준)
        Math.ceil(a); // 올림(X이상인 가장 작은 정수, double 반환)
        Math.floor(a); //내림 (X 이상인 가장 큰 정수, double 반환)

        //거듭제곱과 제곱근
        Math.pow(a,b); // a의 b 제곱(power) 값(double) => 분산(variance)는 제곱(power)을 사용한다.
        Math.sqrt(a); //x의 제곱근(square root) 반환(double) => 표준편차(Standard Deviation)는 제곱근(Square Root)를 사용한다.

        //로그 및 지수함수
        Math.exp(a); // 자연상수 e의 x제곱
        Math.log(a); //자연로그 (ln x)
        Math.log10(a); // 밑이 10인 로그

        //삼각 함수(사인 코사인 탄젠트)
        Math.sin(a);
        Math.cos(a);
        Math.tan(a);

        Math.toRadians(a); //deg
        Math.toDegrees(a); //rad


        //난수 생성
        Math.random(); // 0이상 1미만의 랜덤 실수 반환











    }


    private static int close10(int num1, int num2){
    
        int result = 0;
        if (Math.abs(10 - num1) < Math.abs(10 - num2)) {
            result = num1;
        }else {
            result = num2;
        }
        return result;

        // 1. 자바에서 제곱을 만드는 방법
        // if((num1-10)*(num1-10)< (num2-10)*(num2-10)){
        
        
        // }


        /* 전역변수로 사용하면 가독성만 좋아진다. code length에는 차이가 없다!
        int diff1 = Math.abs(10-num1);
        int diff2 = Math.abs(10-num2);

        if(diff1 < diff2){
            result num1;
        }else if (diff1 > diff2){
            result num2;
        }else {
            return 0;
        }

        */

        






    }
}
