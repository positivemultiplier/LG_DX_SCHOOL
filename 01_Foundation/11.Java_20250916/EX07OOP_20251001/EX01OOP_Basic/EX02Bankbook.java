public class EX02Bankbook {

    // 은행 프로그램 만든다고 가정!
    // 통장 정보를 저장할 수 있는 우리만의 자료형 설계도면 
    
    
    
    // # 1.Field(Data, Feature, 속성)
    
    // 잔액(money)
    //int money;
    // 접근제한자를 생성하여 보호하기. => 외부에서 데이터를 수정하지 못하게 만들어줘야해 => private 사용해서 이 Class에서만 수정할 수 있게 함.
    private int money;
    
    
    // 이름(name)
    // String name;
    // 접근제한자를 생성하여 보호하기. => 외부에서 데이터를 수정하지 못하게 만들어줘야해 => private 사용해서 이 Class에서만 수정할 수 있게 함.
    private String name;


    // # 2.Method(Logic, Function, 기능, Action, 행위)
    
    //전역변수 초기화
    int account;
 

    // 2.1. 입금하다(deposit)
    // return type 없음, 매개변수로 정수형 하나 받아오기, 로직은 아직 적지 말 것!
    public void deposit(int inputMoney){

        // 변수(money)와 파라미터(money)가 같은 이름이 구분이 어려워진다. 
        this.account += inputMoney;
        // ★★★★ this 키워드
        // this.account ==> this가 가지고 있는 money
        // == Bankbook.account
        // 현재 Class 그 자체를 지칭하는 키워드
        // System.out.println("현재 잔액은 : " + account);
    }

    // 2.2. 출금하다(withdraw)
    // return type 없음, 매개변수로 정수형 하나 받아오기, 로직은 아직 적지 말 것!
    public void withdraw(int outputMoney){
        
        // 현재 잔액보다 더 큰 돈을 출금할 때는 "잔액이 부족합니다" 라고 출력
        if(this.account < outputMoney){
            System.out.println("잔액이 부족합니다. ");
        }else{
            this.account -= outputMoney;
        }
        // System.out.println("현재 잔액은 : " + account);
    }


    // 2.3. 잔액확인(showMoney)
    // return type 있음,  int 형태로 되돌려주기, 매개변수는 없음. 현재 잔액을 리턴!
    public int showMoney(){
        // Logic
        System.out.println("현재 잔액은 : " + account);


        return account;
    }




}
