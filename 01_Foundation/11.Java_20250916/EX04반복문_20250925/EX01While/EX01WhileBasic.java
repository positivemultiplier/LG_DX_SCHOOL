public class EX01WhileBasic {
    public static void main(String[] args) {
        // While문 구조
        // Hello World! 5번 출력하는 코드를 생성하기!

        /*
        중요한 핵심부터 미리 작성하고, 그 다음 부가적인 기능을 추가하는 방식으로 코딩하자!!


        step1.반복될 execute문장
        System.out.println("Hello World!!");

        step2.괄호에 넣어주기
        {
            System.out.println("Hello World!!");
        }

        step3. 전역변수 초기화
        int num = 0;

        {
            System.out.println("Hello World!!");
        }

        step4. 조건식(while(condition){execute}) 추가
        int num = 0;

        while (num < 5) {
            System.out.println("Hello World!!");
            num++;
        }
        */


        // ctrl + shift + f : 정렬 단축키

        int num = 0;

        while (num < 5) {
            System.out.println("Hello World!!");
            num++;
        }

        /* 혼자 연습해보기 20250925
        int cnt = 0;
        
        while (cnt < 10){
        System.out.println("오늘의 수업 종료");
        cnt++;
        }
        */
    }
}
