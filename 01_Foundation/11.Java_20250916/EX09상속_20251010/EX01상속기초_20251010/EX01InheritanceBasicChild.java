public class EX01InheritanceBasicChild extends EX01InheritanceBasicParents {
    // extends Inheritance클래스를 갖고온다. 



    // 일식당 2호점 
    // 새로운 클래스, 자식(child) 클래스, 서브(sub) 클래스, 파생(derived) 클래스
    
    // 1. 돈까스 메뉴를 만든다
    /* 대량의 meta data를 주석으로 전달한다. 
     * 메소드가 어떤 기능을 하는지 알려주면 된다. 
     * 돈까스 메뉴를 만드는 메소드
     * @author 이도연
     * @since 2025.10.10
     * @return void
     * @param 매개변수 없음
     */
    public void makeCutlet(){
        System.out.println("맛있는 돈가스를 만든다~");
    }
   


    // 2. 부모님 가게의 스시 메뉴를 변경


    // 일종의 어노테이션(Annotation)  => 추가적인 정보(meta data)를 전달하고, 컴파일러나 프로그램에게 특정 기능을 수행하도록 지시하는 역할을 하는 문법요소 
    //  @Override, @Deprecated, @SuppressWarnings 등이 있으며, 개발자가 직접 정의해 사용할 수도 있습니다.
    @Override
    public void makeSushi(){
        // 메소드 오버라이딩(method overriding)
        // : 상속이 전제되어있어야 한다.
        // : 부모 클래스가 가지고 있는 메소드 틀(Return type, Method name, Parameter)을 그대로 그대로 가지고 와서 {} 안쪽의 로직만 ***재정의*** 하는것
        // :Overriding => 재정의 과 Overloading => 중복정의


        System.out.println("아주아주 맛있는 스시를 만든다~");
    }



}
