package EX01ArithmeticOperator;

// package EX01산술연산자;

public class EX01Arithmetic {

    public static void main(String[] args) {

        // 산술 연산자
        // +, -, *, /, %

        // 정수형 10이라는 데이터를 담는 num1 선언
        int num1 = 10;
        // 실수형 7f 라는 데이터를 담는 num2 선언
        int num2 = 7;
        
        // 실수형 7f 라는 데이터를 담는 num3 선언
        float num3 = 7f;

        System.err.println(num1/num3); // 실수형이 우선이다. // 문자열이 우선이다. 

        // + : 연결 연산
        int num4 = 10; 
        String num5 = "7"; 
        System.out.println(num4 + num5); 
        // 문자 + 숫자 ---> 연결의 의미!
        // 문자 + 숫자 ---> 문자 자료이다.
        
        
        // 1. 덧셈
        int sum = num1 + num2;
        System.out.println("덧셈: " + sum);

        // 2. 뺄셈
        int diff = num1 - num2;
        System.out.println("뺄셈: " + diff);

        // 3. 곱셈
        int product = num1 * num2;
        System.out.println("곱셈: " + product);

        // 4. 몫
        int quotient = num1 / num2;
        System.out.println("몫: " + quotient);
        // 정수와 정수의 연산은 정수로 나온다.
        // 실수로 나오게 하려면? --> 형변환
        // 실수와 실수의 연산은 실수로 나온다.
        
        // 5. 나머지
        int remainder = num1 % num2;
        System.out.println("나머지: " + remainder);





    }
}
