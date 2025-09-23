public class EX03DataType {

    public static void main(String[] args) {
        
        // 자바의 기본 자료형



        // 1) 논리 자료형: boolean (1byte)
        // : 참 혹은 거짓을 저장하는 자료형
        // 참이라는 데이터를 저장하는 bool 변수 선언
        boolean bool = true; // false
        // bool 변수 출력해서 내용 확인해보기
        System.out.println("bool: " + bool);
        
        // bool 변수 내용 변경해보기
        bool = false;
        // bool 변수 출력해서 내용 확인해보기
        System.out.println("bool: " + bool);




        // 2) 문자 자료형: char (2byte)
        // : 따옴표를 이용해서 작성하고, 한 글자만 들어갈 수 있다. 
        // char name = "이도연"; ==> 2byte는 한 글자만 쓸 수 있다.  홀따옴표로 감싸야한다.
        char name = '이';

        // char vs String 문자열 자료형(기본 자료형이 아님!!!) => 대문자로 시작한다.
        // String: 쌍따옴표 이용해서 작성하고, 여러 글자가 들어갈 수 있다. 
        String name2 = "이도연";

        System.out.println("name: " + name);
        System.out.println("name2: " + name2);
        // 한 줄 복사 단축키 : Ctrl + Alt + Down




        //3) 정수 자료형
        // byte(1byte), short(2byte), int(4byte), long(8byte)
        // ---> 데이터의 크기가 의미하는 건 표현할 수 있는 범위!
        // 정수를 작성하면 java는 기본적으로 int로 인식한다. 
        
        // byte num1 = 128; // -128 ~ 127
        byte num1 = (byte) 128; 
        // 1.강제 형변환(명시적 형변환)
        // : 큰 크기의 자료형에서 더 작은 크기의 자료형으로 변환할 때 사용하는 형변환
        // 데이터 손실이 발생할 수 있기 때문에 정확하게 () 사용해서 손실이 일어나도 괜찮다고 명시해주는 방식

        // 2. 자동 형변환(묵시적 형변환)
        // : 작은 크기의 자료형이 자동으로 큰 크기의 자료형으로 형변환
        long num2 = 1000; // int(4byte) -> long(8byte) 자동 형변환


        System.out.println("num1: " + num1); // 넘쳐 흘러서 다시 -128로 돌아감
        System.out.println("num2: " + num2);




        
        // 4) 실수 자료형
        // float(4byte), double(8byte) => 기본값 double
        // 3.14라는 데이터를 담는 double 형태의 변수 num3 선언
        double num3 = 3.14;
        float num4 = (float) 3.14; //강제 형변환
        float num5 = 3.14f; // f를 붙여주면 float형으로 인식

        System.out.println("num3: " + num3);
        System.out.println("num4: " + num4);    
        System.out.println("num5: " + num5);



    }
}
