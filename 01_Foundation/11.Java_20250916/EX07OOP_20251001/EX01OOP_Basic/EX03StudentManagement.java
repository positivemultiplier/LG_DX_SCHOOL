public class EX03StudentManagement {

    //학생의 정보를 담을 수 있는 student클래스를 작성하세요
    
    // 1.Field(Feature)
    private String name;//이름
    private String number;//학번
    private int age;//나이
    private int scoreJava;//Java 점수
    private int scoreWeb;//Web 점수
    private int scoreAndroid;//Android 점수

    





    // 2.Method(Function)
    


    // 2.1.setter Method => 클래스 내부에 있는 필드 값을 외부(다른 클래스)에서 수정할 수 있도록 하는 메소드
    // parameter가 들어있는 이유 => 뭔가 수정하겠구나. 
    public void setName(String name){
        this.name = name;
    }
    public void setNumber(String number){
        this.number = number;
    }
    public void setAge(int age){
        this.age = age;
    }
    public void setScoreJava(int scoreJava){
        this.scoreJava = scoreJava;
    }
    public void setScoreWeb(int scoreWeb){
        this.scoreWeb = scoreWeb;
    }
    public void setScoreAndroid(int scoreAndroid){
        this.scoreAndroid = scoreAndroid;
    }

    // 2.2.getter Method => 클래스 내부에 있는 필드 값을 외부(다른 클래스)에서 가져갈 수 있는 메소드
    // parameter가 안들어있는 이유 =>가지고있는것을 그냥 전달해주는 역할만 한다.
    public String getName(){
        return name;
    }
    public String getNumber(){
        return number;
    }
    public int getAge(){
        return age;
    }
    public int getScoreJava(){
        return scoreJava;
    }
    public int getScoreWeb(){
        return scoreWeb;
    }
    public int getScoreAndroid(){
        return scoreAndroid;
    }


    // 2.3. 생성자(Constructor) => 객체를 생성하는 순간에 실행되는 메소드 => 필드에 있는 데이터를 객체를 생성하는 순간에 초기값을 넣어주는 로직 작성
    // 생성자의 특징
    // 1) 리턴타입을 지정조차 하지 않는다. (void도 작성 안함)
    // 2) 생성자의 이름은 Class이름과 동일하게 만들어야한다.(대소문자까지)
    // 3) 생성자도 결국 메소드이다. 
    public EX03StudentManagement(String name, String number, int age){
        this.name = name;
        this.number = number;
        this.age = age;
    }
    // 4) 매개변수가 아무것도 없는 생성자를 기본생성자(Default Constructor)라고 부르는데 생략 가능하다.
    public EX03StudentManagement(){
    }
    // 5) 생성자도 오버로딩(OverLoading, 중복정의) 가능하다.
    // 오버로딩이란? 메소드의 이름과 리턴타입이 동일한 상태에서 배개변수의 개수와 타입을 다르게 *중복으로 정의* 하는 메소드 기법






}
