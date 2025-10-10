public class TempEmployee extends Employee{
    // 1. Field
    // private final String empno;
    // private final String name;
    // private final int pay;
   

    // 2. Method

    // 2.1. Constructoin Method
    public TempEmployee(String empno, String name, int pay) {
        // this.empno = empno;
        // this.name = name;
        // this.pay = pay;
        // ⓗ 부모클래스(슈퍼클래스)에서 가져올께.
        super(empno, name, pay);
    }

    // 2.2. Getter Method
    @Override // ⓔ Overriding
    public int getMoneyPay(){

    
        return  pay/12;
    }

    // 2.3. Setter Method
    // public String print(){
    
    //     return empno + " : " + name + " : " + wageOfMonth ;
    // }

    
}
