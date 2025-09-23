public class EX04LogicalOperator {
// 논리 연산자
// &&(AND), ||(OR), !(NOT)

    public static void main(String[] args) {
        
        // 1. AND 연산자: && 
        // : 양쪽 모두 true여야만 true, 나머지는 false
        System.out.println("true && true: " + (true && true)); // true
        System.out.println("true && false: " + (true && false)); // false
        System.out.println("false && true: " + (false && true)); // false
        System.out.println("false && false: " + (false && false)); // false

        System.out.println("---------------------");

        // 2. OR 연산자: ||
        // : 둘 중 하나만 true여도 true, 둘 다 false일 때만 false
        System.out.println("true || true: " + (true || true)); // true
        System.out.println("true || false: " + (true || false)); // true
        System.out.println("false || true: " + (false || true)); // true
        System.out.println("false || false: " + (false || false)); // false

        System.out.println("---------------------");

        // 3. NOT 연산자: !
        // : 반대로 바꿔주는 연산자
        System.out.println("!true: " + (!true)); // false
        System.out.println("!false: " + (!false)); // true

        System.out.println("---------------------");

        // 논리 연산자 활용 예시
        int num = 120;

        // num이 100 이상이고 200 이하인가?
        boolean result1 = (num >= 100) && (num <= 200);
        System.out.println("num이 100 이상이고 200 이하인가? " + result1);

        // num이 100 미만이거나 200 초과인가?
        boolean result2 = (num < 100) || (num > 200);
        System.out.println("num이 100 미만이거나 200 초과인가? " + result2);

        // num이 짝수인가?
        boolean result3 = (num % 2 == 0);
        System.out.println("num이 짝수인가? " + result3);

        // num이 홀수가 아닌가?
        boolean result4 = !(num % 2 == 1);
        System.out.println("num이 홀수가 아닌가? " + result4);

    }

}