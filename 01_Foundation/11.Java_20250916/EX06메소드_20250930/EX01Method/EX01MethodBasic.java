public class EX01MethodBasic {
    public static void main(String[] args) {
        // 메소드의 필요성 => 하나로 묶어버리기때문에 유지보수 편하다. 
        // 로그인 메소드

        /* 메소드의 기본구조
        public    int      addNumber(int num1, int num2){
        접근제한자 리턴타입 메소드이름  매개변수(Parameter)

            int result = num1 + num2;
            실행문(Execute)
            
            return result;
            반환데이터
        }
         */


        // # 2. method 사용하기 
        //method 사용할때는 main 영역 안쪽에서 사용해야한다
        System.out.println("====================addNum Method====================");
        double addDouble = addDouble(12.848, 2.88451);
        System.out.println("더하기method : " + addDouble);
        

        // # 4.method 사용하기
        System.out.println("====================subNum Method====================");
        int sub = subNum(77, 99);
        System.out.println("빼기method : " + sub);

        // # 6.method 사용하기
        // 불러주기만 하면 출력문도 나온다.
        System.out.println("====================HelloWorld Method====================");
        printHello();

    }


    //메소드 정의할때는 main 밖에서 선언한다.
    //실행은 main에서 실행한다
    //  # 1. 더하기 method
    // 리턴타입 : double 
    // 메소드명 : addDouble
    // 매개변수 : double 2개

    public static  double addDouble(double  num1, double num2){
        // method는 return 키워드를 만나면 데이터를 반환하고 끝난다.
        // 즉, return 키워드 위쪽에만 코드를 작성할 것!!
        
        double result = num1 + num2;

        return result;
        
    }//method 사용할때는 main 영역 안쪽에서 사용해야한다

    // # 3.빼기 method
    // 리턴타입 : int 
    // 메소드명 : subNum
    // 매개변수 : int 2개
    // 단, 큰 수에서 작은 수를 뺀 결가값을 돌려주기.

    public static int subNum(int a, int b){// subtraction 뺄셈
        
        //방법1 math함수 사용
        // int result = Math.abs(a - b) ; // math.abs(절대값 : absolute)
        
        //방법2 // 삼항연산자( ConditionalOperator ) => if else 구문을 한 줄로 간결하게 표현한것
        // 조건문 ? 실행문(참) : 실행문(거짓)
        // Condition? Execute1(true): Execute2(false)
        int result = a > b ? a -b: b-a;
        
        //방법3 if else
        // if(a > b){
        //     return a - b;
        // }else {
        //     return b - a;
             
        // }
        
        return result;
    }


    // # 5.hello world를 출력하는 메소드
    // return 없이 하려면 void
    public static void printHello(){
        // void : 리턴타입이 없음을 의미하는 키워드
        System.out.println("HelloWorld!");
        
    }

}
