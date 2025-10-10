public class EX01Main {
    //닌텐도 게임( 실행할 수 있는 공간)

    // 공통의 규격을 만들어서 실행한다 (gameChip)



    public static void main(String[] args) {
        // 마리오 게임칩 꺼내오기(객체생성)
        EX01Mario m = new EX01Mario();
        

        // 게임칩 넣기
        //on(m);

        // 포켓몬 고 게임칩 꺼내오기(객체생성)
        EX01PokemonGo p = new EX01PokemonGo();
        on(p);

        // 젤다 게임칩 꺼내오기 (객체생성)
        EX01Zelda z = new EX01Zelda();
        //on(z);


        // ⓔ추상 클래스는 객체 생성이 불가능하다!!
        // EX01GameChip gc = new EX01GameChip();
        
        
    }


    // 방법 2. 게임칩을 넣어서 작동시키는 메소드 => Overriding 활용
    // Zelda(Parents)=> Mario(Child1) => Pokemon(Child2)
    private static void on(EX01PokemonGo p){
    p.gameStart();
    // m.gameStart();


    }

    // 방법 1. 메소드 오버로딩 기법으로 풀어내는 방법
    // private static void on(EX01PokemonGo p){
    //     p.gameStart();
    // }

    // private static void on(EX01Zelda z){
    //     z.gameStart();
    // }

    // private static void on(EX01Mario m){
    //     m.gameStart();
    // }




    
}
