public class EX03MethodOverloading {
    public static void main(String[] args) {
        //메소드 오버로딩이란?
        // 메소드의 이름은 같지만 매개변수를 다르게 함으로써 서로 다른 메소드를 만드는 기법
        
        // add Method(더하기 기능) => method에서는 똑같은 것을 만들 수 있다. Integrity 無
        // => 정수더하기, 소수 더하기 => 매개변수의 type을 보고 구해야한다. 
       
        






        //ⓒ 메소드 호출할때는 double 타입과 int 타입을 잘 불러와야한다. Method는 Integrity 존재 無
        System.out.println(add(5, 6));
        System.out.println(add(1.1, 2.2));
    }

    // main 바깥에 메소드 생성! 

    //ⓐ정수 더하기 Method 만들기
    private static int add(int num1, int num2){
    
        // int result = 0;
        // result = num1 + num2;
        // return result;


        return num1 + num2;
    }

    //ⓑ소수 더하기 Method 만들기
    private static double add(double num1, double num2){
        

        return num1 + num2;

    }



    // 메소드 오버로딩(Method Overloading,=중복정의)
    // 메소드 오버로딩의 성립 조건
    // 1.이름이 같아야 한다.
    // 2.매개변수의 개수, 혹은 자료형(데이터 타입)이 달라야 한다.
    // 3.매개변수와 메소드의 이름이 동일하고 리턴타입만 다른 경우는 오버로딩이 아니다!

    

}
