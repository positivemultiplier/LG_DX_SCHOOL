import java.util.Scanner;

public class test25 {   
    public static void main(String[] args) {
        // 각 숫자별 대시('_') 개수 배열 (0~9)
        int[] dashCount = {6, 2, 5, 5, 4, 5, 6, 3, 7, 6};
        
        Scanner sc = new Scanner(System.in);
        System.out.print("첫자리 0을 제외한 숫자를 입력해주세요 >> ");
        String input = sc.next();
        int sum = 0;
        for (int i = 0; i < input.length(); i++) {
            //문자형 숫자를 정수형 숫자로 변환
            // 문자 '0'의 아스키코드 값은 48이고, '1'은 49, '2'는 50입니다
            // 따라서 0 을 빼주는 이유는 우리가 정말 원하는 값을 찾기 위함이다. 
            int num = input.charAt(i) - '0';
            sum += dashCount[num];
        }
        System.out.println("대시('_')의 총 합 >> " + sum);
    }
}
