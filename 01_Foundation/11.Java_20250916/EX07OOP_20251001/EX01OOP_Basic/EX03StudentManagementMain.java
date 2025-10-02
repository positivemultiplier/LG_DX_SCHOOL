public class EX03StudentManagementMain {
    public static void main(String[] args) {
        // 1. student1 객체(Object) 생성 
        //
        EX03StudentManagement student1 = new EX03StudentManagement();


        // 2. 접근해서 정보 가져오기


        // setter Method 이용해서 private 자료 수정하기! 
        student1.setName("이도연");
        student1.setNumber("20241111");
        student1.setAge(20);
        student1.setScoreJava(50);
        student1.setScoreWeb(99);
        student1.setScoreAndroid(77);
        // ctrl + shift + p => source Action => generate getters and setters
        // setter,getter 자동완성 단축키 alt + insert> 
        // alt + shift + s
        // source => generate getters and setters

        
       


        // getter Method 이용해서 호출하기
        System.out.println("이름 : " + student1.getName());
        System.out.println("학번 : "+student1.getNumber());
        System.out.println("나이 : " +student1.getAge());
        System.out.println("자바점수 : " + student1.getScoreJava());
        System.out.println("웹점수 : " + student1.getScoreWeb());
        System.out.println("안드로이드점수 : " + student1.getScoreAndroid());


        // 2.3.생성자 Method
        // Student 자료형 student2객체 생성
        EX03StudentManagement student2 = new EX03StudentManagement("곽진규", "20252222", 19);
        // 생성자(constructor) Method 객체를 시작하면서 바로 ? 그게 new EX03StudentManagement() 이다
        // 생성자 메소드라고한다. 
        // 3가지의 Feature을 넣어서 한다.("곽진규", "20252222", 19) 
        // 자동으로 public Strudent(String string; String string2, int i ){
        
        //}


        // new Student() ==> 객체를 생성하는 순간에 실행되는 메소드!!
        // ★★★★★ 생성자(Consructor) => EX03StudentManagement("곽진규", "20252222", 19) ★★★★★
        
        

    }

}