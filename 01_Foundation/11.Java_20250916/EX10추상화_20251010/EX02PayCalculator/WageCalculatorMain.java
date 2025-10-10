public class WageCalculatorMain {
    public static void main(String[] args) {
        // 1.1. RegularEmployee 객체 생성 (예시 데이터) => 생성자(Constructor) 사용방법 // 반드시 적절한 argument를 넣어줘야한다.
        RegularEmployee Regular = new RegularEmployee("SMHRD001", "홍길동", 4000, 300);
        TempEmployee temp = new TempEmployee("SMHRD002", "박0수", 3600);
        PartTimeEmployee partTime = new PartTimeEmployee("SMHRD003", "임성훈", 50, 20);

        // 1.2 기본생성자(Default Constructor)
        // RegularEmployee employee2 = new RegularEmployee();
        
        // 2. 월급 계산 및 출력
        System.out.println("====================구분선====================");
        int RegularMonthWage = Regular.getMoneyPay();
        System.out.println("정규직 월급 : " + RegularMonthWage);
        int TempMonthWage = temp.getMoneyPay();
        System.out.println("임시직 월급 : " + TempMonthWage );
        int PartTimeWage = partTime.getMoneyPay();
        System.out.println("파트타임 월급 : " + PartTimeWage);

        // 3. print() 메서드 결과 출력
        System.out.println("====================구분선====================");
        System.out.println("직원코드 :직원이름 : 연봉 ");
        System.out.println(Regular.print());
        System.out.println(temp.print());
        System.out.println(partTime.print());


        // ⓐ print() 쓰기가 불편해서 부모클래스를 생성하자  => ⓑ 추상클래스 Employee 만들어서 사용하자.

       
       
        
    }
}
