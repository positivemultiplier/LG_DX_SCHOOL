import java.util.Scanner;

public class test30 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("==== 알파벳 빈도수 구하기 ====");
        System.out.print("입력>> ");
        String input = sc.nextLine();//next(): 공백(space) 전까지만 읽습니다, nextLine(): Enter(개행문자 \n) 전까지 전체를 읽습니다

        
        // 알파벳 빈도수 배열 (a~z)
        int[] frequency = new int[26];
        
        // 입력 문자열을 소문자로 변환하여 빈도수 계산
        input = input.toLowerCase();
        for (int i = 0; i < input.length(); i++) {
            char ch = input.charAt(i);
            if (ch >= 'a' && ch <= 'z') {
                frequency[ch - 'a']++;
            }
        }
        
        // 결과 출력
        for (int i = 0; i < 26; i++) {
            char ch = (char)('a' + i);
            System.out.println(ch + " : " + frequency[i]);
        }
    }
}
