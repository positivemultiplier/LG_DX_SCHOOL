public class EX01MemberMain {
    
    //실행할 수 있는 공간!
    public static void main(String[] args) {
        // 1. 객체(Object) 생성(선언)해보기
        System.out.println("====================객체 생성하기====================");
        // 클래스 설계도면을 기반으로!
        // 회원 자료형 만들기! 변수명 : member1
        // 자료형 변수명 = new 자료형();
        EX01Member member1 = new EX01Member();
        // member1 => 주소값이 저장되어 있는 레퍼런스 변수

        // 주소값 출력
        System.out.println(member1);

        // 2. 객체 안에 있는 필드에 접근하는 방법
        System.out.println("====================데이터 접근하기====================");
        // 레퍼런스 변수명.필드 => .은 가지고있는것중에~~ 라고 해석한다
        System.out.println(member1.age);
        System.out.println(member1.id);
        System.out.println(member1.name);
        System.out.println(member1.pw);
        // field에 아무런 값도 넣지 않았을 때는 기본값이 세팅된다.
        // String ==> null
        // int ==>0
        // double ==> 0.0

        // 3. 객체 안에 있는 필드 데이터를 변경하기
        System.out.println("====================데이터 변경하기====================");
        member1.name = "이도연";
        System.out.println(member1.name);
        // 나이 : 20
        // id : lgdx3
        // pw : 12345
        member1.age = 20;
        member1.id = "lgdx3";
        member1.pw = "12345";
        System.out.println(member1.age);
        System.out.println(member1.id);
        System.out.println(member1.pw);
        

 
        // 4. 하나의 클래스 설계도면으로 여러개의 객체 생성 가능
        System.out.println("====================여러개의 객체 생성====================");
        // 진규쌤 데이터를 저장하는 member2 객체 생성
        EX01Member member2 = new EX01Member();
        // 이름 : 곽진규
        // 나이 : 19
        // id : lgdx3
        // pw : 12345
        member2.name = "곽진규";
        member2.age = 19;
        member2.id = "lgdx3";
        member2.pw = "12345";

        System.out.println(member2.name);
        System.out.println(member2.age);
        System.out.println(member2.id);
        System.out.println(member2.pw);


        // 메소드 실행
        System.out.println("====================메소드(Action) 실행해보기====================");
        member2.kakaoTalk("안녕~");
        member2.sendGift("백화점 상품권 ￦1,000,000");        


    }
}
