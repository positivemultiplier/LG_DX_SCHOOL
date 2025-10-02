
import java.util.ArrayList;

public class EX01Main {
    public static void main(String[] args) {
        // # 1. ArrayList
        // 크기가 가변적(flexible)인 배열과 같은 형태를 가진 **클래스**

        // 1. ArrayList 생성
        // :레퍼런스 타입의 데이터만 저장할 수 있다.
        // ex) String, Pokemon, Student 등...

        // 객체생성 => 제네릭 기법
        // ArrayList<String>() => 생성자 (Constructor) 
        //  생성자(Constructor) => 객체를 생성하는 순간에 실행되는 메소드 => 필드에 있는 데이터를 객체를 생성하는 순간에 초기값을 넣어주는 로직 작성
        // 생성자의 특징
        // 1) 리턴타입을 지정조차 하지 않는다. (void도 작성 안함)
        // 2) 생성자의 이름은 Class이름과 동일하게 만들어야한다.(대소문자까지)
        // 3) 생성자도 결국 메소드이다. 
        // 4) 매개변수가 아무것도 없는 생성자를 기본생성자(Default Constructor)라고 부르는데 생략 가능하다.
        // 5) 생성자도 오버로딩(OverLoading, 중복정의) 가능하다.
        // 오버로딩이란? 메소드의 이름과 리턴타입이 동일한 상태에서 배개변수의 개수와 타입을 다르게 *중복으로 정의* 하는 메소드 기법
        ArrayList<String> list = new ArrayList<String>();

        // 2. 데이터 추가하기
        System.out.println("====================데이터 추가하기====================");
        // 데이터를 1개 추가하면 1칸짜리, 2개 추가하면 2칸짜리, 3개 추가하면 3칸짜리 ....... flexible
        list.add("이도연");
        list.add("곽진규");
        list.add("손지영");
        System.out.println(list);
        
        
        // 3. 데이터 가져오기
        System.out.println("====================데이터 가져오기====================");
        // arrayList는 class 이므로 getter Method를 사용한다
        System.out.println(list.get(0));
        System.out.println(list);

        // 4. 데이터를 특정 위치에 추가하기
        System.out.println("====================데이터 특정위치에 추가하기====================");
        // 기존의 데이터는 밀려난다. 즉 "손지영"이 3번으로 밀려나고 2번에는 "김미희"가 들어간다
        list.add(2, "김미희");
        System.out.println(list);

        // 5. 데이터 삭제하기
        System.out.println("====================데이터 삭제하기====================");
        list.remove(2);
        System.out.println(list);

        // 6. 데이터 크기 알아보기
        System.out.println("====================데이터 크기 알아보기====================");
        System.out.println("list의 크기 : " + list.size());
        System.out.println(list);
        // .size() : 메소드(ArrayList)에서 사용
        // .length : 속성값(배열)에서 사용

        // 7. 데이터 전체 삭제하기
        System.out.println("====================데이터 전체 삭제하기====================");
        list.clear();
        System.out.println("clear 사용 후 list의 크기 :  " + list.size());
        System.out.println(list);





        // Collection 
        // 요소(Element)라고 불리는 가변 개수의 객체들의 집합
        // 여러 개의 객체를 보관할 수 있게 만들어진 클래스들의 집합
        // 고정 크기의 배열을 ㄷ라루는 불편함 해소

        // 특징 
        // 1.요소의 개수에 따라 자동 크기조절
        // 2. 요수의 추가 삭제에 따른 요소의 이동 자동 관리
        // 3. 제네릭(generic)기법으로 구현

        // 제네릭 (generic)
        // 클래스 내부에서 사용할 데이터 타입을 외부에서 지정하는 기법
        class person<T> {
            public T name;
        }

        //사용문

        //ArrayList<자료형> 변수명 = new ArrayList<자료형>(); 
        //클래스이다, 가변적으로 크기가 변한다.

    }
}
