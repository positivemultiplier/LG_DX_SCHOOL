public abstract class EX01GameChip {
    // ⓓ 추상 클래스 
    // 추상 메서드를 하나라도 가지고 있다면, 반드시 추상클래스가 되어야 한다.
    // 추상 클래스도 일반 메서드를 가질 수 있다.
    // abstract 키워드를 사용해서 선언한다.

    // ⓔ추상 클래스는 객체 생성이 불가능하다!!
    // main에서
    // EX01GameChip gc = new EX01GameChip();

    public void temp(){
        System.out.println("임의로 만든 메서드");
    }



    public abstract void gameStart(); // ⓒ추상화 =>  캡상추다
    // 추상 메서드(Abstract method) 
    // {}가 없는 메서드
    // 선언(틀: 리턴타입, 매개변수, 메소드명)은 되어있으나 로직이 구현되지 않은 메서드
    // abstract 키워드를 사용해서 선언한다.

    // ⓑ 어차피 중괄호가 필요없지 않냐? 
    //{

        // ⓐ 어차피 물려받으면 상속받은곳에서 새로 method가 필요없다
        // System.out.println("젤다의 전설을 시작한다~");
    //}
}
