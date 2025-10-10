public class PartTimeEmployee extends Employee {
    // 1. Field

    // private final String empno;
    // private final String name;
    // private final int pay;
    private final int workDay;


    // 2. Method

    // 2.1. Constructor Method
    public PartTimeEmployee(String empno, String name, int pay, int workDay) {
        // this.empno = empno;
        // this.name = name;
        // this.pay = pay;
        // ⓗ 부모클래스(슈퍼클래스)에서 가져올께.
        super(empno, name, pay);
        this.workDay = workDay;
    }


    // 2.2. Getter 
    @Override // ⓔ Overriding
    public int getMoneyPay(){
    
        return pay*workDay;
    }


    // public String print(){
    //     return empno + " : " + name + " : "+ wageOfMonth;
    // }
}
