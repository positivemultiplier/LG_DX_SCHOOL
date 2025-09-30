package EX02ConditionalOperator;

public class EX01삼항연산자 {
    public static void main(String[] args) {
        
        // 삼항연산자( ConditionalOperator ) => if else 구문을 한 줄로 간결하게 표현한것
        // 조건문? 실행문1 : 실행문2
        // Condition ? Execute1(true) : Execute2(false) 
        // ---> 조건문이 참이면 실행문1 실행
        // ---> 조건문이 거짓이면 실행문2 실행

        int num1 = 4;
        int num2 = 7;

        String result = num1 < num2 ? "num2가 더 크다" : "num1이 더 크다";
        System.out.println(result);
    }
}
    