public class NintendoMain {
    public static void main(String[] args) {
        // 1. 객체생성
        Mario m = new Mario();
        Zelda z = new Zelda();
        // on(z);
        Pokemon p = new Pokemon();
        
        // 2. 상속받아 실행해보기.
        on(p);



    }

    // on Method 만들어서 실행
    public static void on(Pokemon p){
        p.gameStart();
    }
}
