
import java.util.ArrayList;

public class EX02StudentMain {
    public static void main(String[] args) {
        
        // 1. Student 자료형을 보관할 수 있는 sList라는 이름을 가진 ArrayList 생성
        ArrayList<EX02Student> sList = new ArrayList<EX02Student>();


        // 2. 데이터 추가(본인 이름, 나이를 가지고 있는 데이터 Student를 추가)
        System.out.println("====================데이터 추가하기====================");
        
        // Student 객체 생성 (Parameter 순서를 잘 알아야한다. )
        // 방법1. 가독성 좋게
        EX02Student student1 = new EX02Student("이도연", 20);
        sList.add(student1);

        // 방법2. 코드짧게
        sList.add(new EX02Student("이도연", 20));
        
        System.out.println(sList);
        


        
        // 3. 이름출력
        System.out.println("====================이름 출력하기====================");
        // 0번 list에는 Object가 들어있다. 
        // 본질적으로 어떤 자료형인지 확인할 것!!
        // sList.get(0)==> return type : Student 객체!!

        System.out.println(sList.get(0).getName() + "\t" + sList.get(1).getAge());
        //get()은 어떤타입이냐? => ex02student 타입이다.

        // 4. 팀원 데이터 전부 추가하기!! 
        sList.add(new EX02Student("곽진규", 19));
        sList.add(new EX02Student("손지영", 21));
        sList.add(new EX02Student("김미희", 22));

        // 5. 팀원 이름, 나이 전부 출력! --> for-each문 사용해보기
        // ========== 팀원 정보 ==========
        // 이름   나이 
        // 이도연 20
        // 곽진규 19
        // 손지영 21
        // 김미희 22


        System.out.println("====================for-each문 연습해보자====================");
            
        System.out.println("========== 팀원 정보 ==========");
        System.out.println("이름\t나이");
        System.out.println("------\t----");
    
        //for(배열안의 데이터 타입 =>  EXo1Pokemon p : 반복시키고자하는 배열이름=> bag)
        for(EX02Student s : sList){
            // 포켓몬 객체를 p라고 바꿔줘야한다 bag[i] => p 로 바꿔주면 된다 
            //System.out.println(bag[i].getName()+ "\t" +bag[i].getType() + "\t" + bag[i].getHp() );
            System.out.println(s.getName() + "\t" + s.getAge());
            
        } 

    }
       

    
}
