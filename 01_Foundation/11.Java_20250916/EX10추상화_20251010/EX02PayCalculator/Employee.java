public abstract class Employee {
    // ⓑ 추상클래스로 Employee 클래스를 사용하자. 
    // 접근제한자 
    // public >> protected >> package(default) >> private
    // public : 모든 클래스에서 접근 가능
    // protected : 같은 패키지 + 상속 관계끼리 접근 가능
    // package : 같은 패키지끼리 접근 가능 
    // private : 외부 클래스에서 접근 불가

    // ⓒ 공통된 필드 찾아서 묶어보자.
    // 1.Field 겹치는것 
    
    // ⓕ 접근제한자를 private에서 protected로 변경시켜라 그래서 접근 가능하게 만들어라. => ⓖ 생성자를 단축시켜라. 
    protected String empno;
    protected String name;
    protected int pay;
    

    // ⓖ constructor를 추상클래스에서 만들어라. => ⓗregular, parttime, temp 클래스의 오류수정 
    public Employee(String empno, String name, int pay) {
        this.empno = empno;
        this.name = name;
        this.pay = pay;
    }

    // 2.Method
    //ⓓ 공통된 메서드는 추상 메서드로 만들어라. => ⓔ각 class에서 Overriding 시켜라 @Overriding
    public abstract int getMoneyPay();

    public String print(){
        return empno + " : " + name + " : " + pay;
    }




}
