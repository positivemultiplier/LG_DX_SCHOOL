public class EX02Student {

    // 1. 필드(속성, 데이터)
    // 이름, 나이
    private String name;
    private int age;

    
    // 2. 메소드 Method (Function, 기능, 행위, 로직)

    // Constructor 생성자(모든 필드값을 채우는 생성자)
    public EX02Student( String name,int age) {
        this.name = name;
        this.age = age;
    }
    
    
    // Getter Method
    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }

    // Setter Method
    public void setName(String name) {
        this.name = name;
    }

    public void setAge(int age) {
        this.age = age;
    }

    
}
