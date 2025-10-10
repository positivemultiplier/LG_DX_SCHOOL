public class RegularEmployee1 {

    // 1. Field
    String empno;
    String name;
    int pay;
    int bonus;
    
    
    // 2. Method
    // 2.1. Constroctor
    public RegularEmployee1(String empno, String name, int pay, int bonus) {
        this.empno = empno;
        this.name = name;
        this.pay = pay;
        this.bonus = bonus;
    }
    
    // 2.2. getter
    public int getMoneyPay(){
    
        return (pay + bonus)/12 ;
    }

    // 2.3. setter

    public String print(){
    
        return empno + " : " + name +" : "  + pay; 
    }
}
