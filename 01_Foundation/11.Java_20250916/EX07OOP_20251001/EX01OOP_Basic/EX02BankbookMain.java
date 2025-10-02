public class EX02BankbookMain {
    public static void main(String[] args) {
        
        // 1.1. Bankbook 설계도면을 기반으로 bank1 객체 생성
        // 자료형 변수명 = new 자료형();
        EX02Bankbook bank1 = new EX02Bankbook();
        
        // 1.2. bank1에 8000원 입금
        //bank1.money += 8000; => 정보은닉 위반


        // 1.3. bank1에 5000원 출금
        //bank1.money -= 5000; => 정보은닉 위반

        // 1.4. bank1에 잔액을 출력
        //System.out.println("잔액 : " +bank1.money ); => 정보은닉 위반


        //2. Method(Logic)
     
        //2.1.입금 deposit
        bank1.deposit(8000);
        //2.2.출금 withdraw
        bank1.withdraw(10000);
        //2.3.잔액확인 showMoney
        bank1.showMoney();
        

    }
}
