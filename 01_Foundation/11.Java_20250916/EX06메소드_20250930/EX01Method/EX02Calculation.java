
import java.util.Scanner;

public class EX02Calculation {

    public static void main(String[] args) {
        // conditionalOperator => 삼항연산자(조건연산자) => if else문 간략하게
        // condition? Execute1: Execute2


        // 정수형 num1과 num2를 입력 받고, 문자형 op를 선언해 원하는 연산자를 넣으세요.
        // num1과 num2를 op에 맞게 연산하여 최종 값을 반환해주는 cal메소드를 만드세요.
        // 단,빼기를 수행할 때는 더 큰 수에서 작은 수를 빼세요

        Scanner sc = new Scanner(System.in);
        System.out.print("정수1 입력 : ");
        int num1 = sc.nextInt();

        System.out.print("정수2 입력 : ");
        int num2 = sc.nextInt();

        char op = '*'; // +,-,*,/ 네개의 연산자 전부 계산되도록 만들기
        System.out.println("계산기의 결과값 : " + calculator(num1, num2, op));

    }

    private static int calculator(int num1, int num2, char op){
        // private : 다른 클래스에서는 사용할 수 없게 막는 접근제한자
       
        int result = 0;
        // op가 어떤 모양인지에 따라서 조건 비교
        
        
        if (op == '+'){
            result = num1 + num2;
        }else if(op == '-'){
            result = num1>num2? num1-num2: num2-num1;
        }else if (op == '*') {
            result = num1 * num2;
            
        }else if(op == '/'){
            result = num1/num2;
        }else {
            result = 0;
        }
        return result;
    }
}
