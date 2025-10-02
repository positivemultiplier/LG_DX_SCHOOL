public class EX01Member {
    // 나만의 자료형 설계 도면
    // main을 만들지 않은 이유는 main method 포함하지 않겠다.
    // 자체적으로 실행되지 않는다는 의미
    // 진짜 설계도면 그 이상 이하도 아님!!

    //객체지향프로그래밍 (OOP, Object Oriented Programming)

    // 1.Field(Data, Feature, 속성)
    // 2.Method(Logic, Action, 행위, Function, 기능)


    // 1.1.Field(Data, Feature)
    //이름,나이, ID, 비밀번호 등 변수 생성
    String name; //  = "이도현" => 변수에 담으면 안된다
    int age;
    String id;
    String pw;
    
    // 1.2.Method(Logic, 행위, 기능)
    // 카카오톡에서 메세지 보내기
    public void kakaoTalk(String msg){
        System.out.println(name + " 님이 " + msg + " 를 전송합니다.");
    }

    // 기프티콘 보내기
    public void sendGift(String gift) {
        System.out.println(name + " 님이 " + gift + " 를 선물합니다.");
    }
    
    
}
