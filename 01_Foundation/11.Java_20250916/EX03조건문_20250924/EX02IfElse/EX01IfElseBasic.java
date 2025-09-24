import java.util.Scanner;

public class EX01IfElseBasic {

    public static void main(String[] args) {

        // 1. 입력도구 꺼내오기
        Scanner sc = new Scanner(System.in);
        
        // 2. 점수 입력받기
        System.out.println("점수를 입력하세요 : ");
        int grade = sc.nextInt();

        // 3. 60점 이상인지 조건 판별
        if (grade >= 60){
            System.out.println("합격입니다.");
        } else {
            System.out.println("불합격입니다.");
        }

    }
}
