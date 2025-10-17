
import java.util.Scanner;

public class test30_2 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("==== 알파벳 빈도수 구하기 ====");
        System.out.print("입력>> ");
        String input = sc.nextLine();

        int[] frequency = new int[26];

        for (int i = 0; i < input.length(); i++) {
            char ch = input.charAt(i);
            if(ch >='a' && ch <= 'z'){
                frequency[ch -'a']++;
            }
        }

        for (int i = 0; i < input.length(); i++) {
            char ch = (char)('a' + i);
            System.out.println(ch + " : " + frequency[i]);
        }
    }
}
