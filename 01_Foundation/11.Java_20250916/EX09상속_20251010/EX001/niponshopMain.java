public class niponshopMain {
    public static void main(String[] args) {
        // 1. parents 객체생성
        parents p = new parents();

        // 2. parents method 불러오기
        System.out.println("====================parents class====================");
        p.makeSuke();
        p.makeSushi();


        // 3. child 객체생성
        child c = new child();

        // 4. child method 불러오기
        System.out.println("====================child class====================");
        c.makeSuke();
        c.makeSushi();
        c.makeCutlet();
    }
}
