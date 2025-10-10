public class EX01InheritanceBasicMain {
    public static void main(String[] args) {
        

        // 1. parents 자료형 p 객체 생성
        EX01InheritanceBasicParents p = new EX01InheritanceBasicParents();


        // 2. Child 자료형 c 객체 생성 
        EX01InheritanceBasicChild c = new EX01InheritanceBasicChild();


        // 3. 상속 확인하기~!
        System.out.println("====================구분선====================");

        p.makeSushi();
        // 매소드 재정의를 한다면, overriding 되어있는 method가 호출된다.
        // 상속을 사용했기 때문에 부모클래스가 가지고 있는 메소드를 재사용하는 것이 가능하다!!
        c.makeSushi();



        /* Inheritnace의 특징!!
         * 1. 다중상속을 지원하지 않는다. extends class1 , ~~class2~~
         * 2. 상속의 횟수에 제한을 두지 않는다.  extends class1 => extends class2
         * 3. 모든 클래스는 java.lang.object를 상속받는다. => object는 공통의 조상이다=>   최상위 클래스(Object, top-level, root, Ultimate Super)  
         */

         
        // Tip 
        // 많은 class를 상속받고 싶은데요? => 다중상속은 안되지만 상속의 상속을 이용한다!! 
        // 많은 child를 갖을 수 있다.
        
        System.out.println("====================구분선====================");
        c.makeCutlet();
        // 포스트잇 확인용 /*에 들어있는 내용이 나온다고 함. */



        // Castind(캐스팅) 
        // 기존 데이터 타입을 다른 데이터타입으로 변환하는것
        // Primitive Type(기존 bite1 short2 int4 long8,// double(8), // boolean(1)) => 자동,강제 형변환 (데이터 공간의 크기 기준)
        // Reference Tyep (Private, public )=> 업 캐스팅, 다운 캐스팅(객체 내 필드, 메수드의 접근권한 기준)

        // Reference Type에서의 형변환은 반드시 상속이 전제되어 있어야한다.
        // ==> 객체 내 필드, 메소드의 접근권한을 기준으로 강제 vs 자동 결정!




        // 1) UpCasting (업캐스팅)
        // : 자식 (서브, 하위) 클래스가 부모(슈퍼, 상위)클래스 타입으로 자동으로 형변환 하는것
        // ex) 강아지는 동물이다 --> 말 됨! 자동으로 형 변환 => 모든 동물은 강아지다 --> 말 안됨! 
        EX01InheritanceBasicParents p2 = new EX01InheritanceBasicChild(); 
        // 부모자료형 레퍼런스 변수명  = new 자식자료형();
        
        
        // 
        System.out.println("====================구분선====================");
        p2.makeSushi();
        // 만약에 자식클래스가 부모클래스의 메소드를 재정의(Overriding)한 경우 => 업캐스팅(UpCasting)된 객체는 자식클래스의 메소드를 호출



        // 2) DownCasting(다운캐스팅)
        // : 부모클래스가 자식 클래스로 강제 형 변환
        // EX01InheritanceBasicChild c2 = (EX01InheritanceBasicChild) new EX01InheritanceBasicParents();
        // P 370 Exception Error
        // Exception in thread "main" java.lang.ClassCastException: class EX01InheritanceBasicParents cannot be cast to class EX01InheritanceBasicChild (EX01InheritanceBasicParents and EX01InheritanceBasicChild are in unnamed module of loader 'app')
        // at EX01InheritanceBasicMain.main(EX01InheritanceBasicMain.java:68)

        // 코드에서 빨간줄 뜬다 ==> syntax Error ( 구문 오류)
        // 코드에서 빨간줄 안뜬다 ==> Exception Error( 예외 오류) 
        // : 구문 오류는 없으나 실행했을 때 예외상황이 발생하는 것! 


        // 3) DownCasting(다운캐스팅) ==> 진짜!!
        // : 업 캐스팅된 객체를 강제 형변환으로 본래의 자료형태로 되돌려 놓는 것
        // 전재조건 : 업캐스팅 된 객체만 다운캐스팅 가능하다!
        EX01InheritanceBasicChild c2 = (EX01InheritanceBasicChild) p2;
        System.out.println("====================구분선====================");        
        // 본래 자신이 가지고 있던 메소드를 사용할 수 있다!!
        c2.makeCutlet();

        
        



    }
}
