public class EX01DoubleForBasic {
    public static void main(String[] args) {
        //실습1. 별찍기 (별 1개만 사용하기)
        // *****
        // *****
        // *****
        // *****
        // *****

        // 방법1. i를 1부터 시작하기
        for (int i = 1; i <= 5; i++){
            for (int j = 1; j <= 5; j++){
                System.out.print("*");
            }
            System.out.println();
        }

        // step1. j for문으로 column에 별 5개 찍기
        // step2. i for문으로 row를 5줄 만들기


        System.out.println("========================================================================");

        // 방법2. i를 0부터 시작하기
        for (int i = 0; i < 5; i++){
            for(int j = 0; j < 5; j ++){
                System.out.print("*");
            }
            System.out.println();
        }

        System.out.println("========================================================================");
    
        //실습2. 별찍기 (별 1개만 사용하기)
        // *
        // **
        // ***
        // ****
        // *****

        // step1. column에 별을 i개 찍기 (규칙찾기)
        for (int i = 0; i < 1; i++){
            System.out.print("*");
        }
        System.out.println();
    

        
        System.out.print("*");
        System.out.println();

        for (int i = 0; i < 2; i++){
            System.out.print("*");
        }
        System.out.println();


        System.out.print("*");
        System.out.print("*");
        System.out.println();

        for (int i = 0; i < 3; i++){
            System.out.print("*");
        }
        System.out.println();


        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.println();

        for (int i = 0; i < 4; i++){
            System.out.print("*");
        }
        System.out.println();


        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.println();

        for (int i = 0; i < 5; i++){
            System.out.print("*");
        }
        System.out.println();


        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.print("*");
        System.out.println();

        

        // step2. row를 5줄 만들기
        for(int i = 1; i <= 5; i++){
            for(int j = 1; j <= i; j++){
                System.out.print("*");
            }
            System.out.println();   
        }

        System.out.println("========================================================================");


        for(int i = 5; i >= 1; i--){
            for(int j = 1; j <= i; j++){
                System.out.print("*");
            }
            System.out.println();
        }
        System.out.println("========================================================================");

    
    
    
        for(int i = 1; i <= 5; i++){
            for(int j = 5; j >= i; j--){
                System.out.print("*");
            }  
            System.out.println();
        }





        
    

         printSeparator("Heart");
        printHeart(8);          // 크기는 6~12 정도 추천

        printSeparator("Bunny");
        printBunny();

        printSeparator("Penguin");
        printPenguin();

        printSeparator("Fish Row");
        printFishRow(5);        // 물고기 5마리

        printSeparator("Tree");
        printTree(8);           // 높이 8
    }

    // 1) 하트 (수식 기반 도형) - 이중 for문 + 점 포함 여부 판정
    static void printHeart(int size) {
        for (int y = size; y >= -size; y--) {
            for (int x = -2 * size; x <= 2 * size; x++) {
                double xx = x / (double) size;
                double yy = y / (double) size;
                double f = Math.pow(xx * xx + yy * yy - 1, 3) - xx * xx * yy * yy * yy;
                System.out.print(f <= 0 ? "*" : " ");
            }
            System.out.println();
        }
    }

    // 2) 토끼 - 문자열 행 배열을 for문으로 출력
    static void printBunny() {
        String[] bunny = new String[] {
            " (\\_/)",
            " ( •_•)",
            " / >o"
        };
        for (String line : bunny) {
            System.out.println(line);
        }
    }

    // 3) 펭귄 - 간단한 대칭 패턴, 백슬래시는 이스케이프 필요
    static void printPenguin() {
        String[] penguin = new String[] {
            "  _~_  ",
            " (o o) ",
            " / V \\ ",
            "/( _ )\\",
            " ^^ ^^ "
        };
        for (String line : penguin) {
            System.out.println(line);
        }
    }

    // 4) 물고기 여러 마리 - 바깥 for로 마릿수, 안쪽은 동일 패턴 출력
    static void printFishRow(int count) {
        for (int i = 0; i < count; i++) {
            System.out.print("<`)))><  ");
        }
        System.out.println();
    }

    // 5) 크리스마스 트리 - 피라미드(별) + 줄기
    static void printTree(int height) {
        // 잎사귀
        for (int i = 1; i <= height; i++) {
            // 왼쪽 공백
            for (int s = 0; s < height - i; s++) System.out.print(" ");
            // 별
            for (int k = 0; k < 2 * i - 1; k++) System.out.print("*");
            System.out.println();
        }
        // 줄기
        int trunkHeight = Math.max(2, height / 3);
        int trunkWidth = Math.max(1, height / 4 * 2 - 1); // 홀수 유지
        if (trunkWidth % 2 == 0) trunkWidth++;
        int pad = height - (trunkWidth / 2) - 1;
        for (int t = 0; t < trunkHeight; t++) {
            for (int s = 0; s < pad; s++) System.out.print(" ");
            for (int k = 0; k < trunkWidth; k++) System.out.print("|");
            System.out.println();
        }
    }

    static void printSeparator(String title) {
        System.out.println("==== " + title + " ====");


    }

}
