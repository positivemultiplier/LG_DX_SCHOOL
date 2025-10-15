
import java.util.Scanner;

public class test25_1 {
    public static void main(String[] args) {
        int[] dashCount = {6, 2, 5, 5, 4, 5, 6, 3, 7, 6};

        Scanner sc = new Scanner(System.in);
        System.out.print("첫자리 0을 제외한 숫자를 입력해주세요 >> ");
        String input = sc.next();
        int sum = 0;

        for (int i = 0; i < input.length(); i++) {
            //문자형 숫자를 정수형 숫자로 변환
            int num = input.charAt(i) - '0';
            sum += dashCount[num];
            
        }
        System.out.print("대시('_')의 총 합 >> " + sum);
    }


}
