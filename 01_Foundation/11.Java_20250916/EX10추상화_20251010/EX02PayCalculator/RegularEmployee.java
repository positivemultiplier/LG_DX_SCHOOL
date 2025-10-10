public class RegularEmployee extends Employee {
    
    // 1. Field
    // final은 변경불가 . 
    // private final String empno;
    // private final String name;
    // private final int pay;
    private final int bonus;
 


    // 2. Method
    
    // 2.1. constructor Method
    public RegularEmployee(String empno, String name, int pay, int bonus) {
        // this.empno = empno;
        // this.name = name;
        // this.pay = pay;
        // ⓗ 부모클래스(슈퍼클래스)에서 가져올께.
        super(empno, name, pay);
        this.bonus = bonus;
    }

    // public RegularEmployee(){
    //     this.empno = "";
    //     this.name = "";
    //     this.pay = 0;
    //     this.bonus = 0;

    
    // }


    // 2.2. getter Method
    @Override // ⓔ Overriding
    public int getMoneyPay(){
        
        return (pay + bonus)/12;
    }


    // public String print(){
    //     return empno + " : " + name + " : " + pay;
    // }


    // 2.3. setter Method


 
}
