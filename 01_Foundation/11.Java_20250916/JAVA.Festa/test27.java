import java.util.Scanner;

public class test27 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("==== 채점하기 ====");
        String input = sc.next();
        
        int totalScore = 0;
        int consecutiveO = 0;
        
        for (int i = 0; i < input.length(); i++) {
            if (input.charAt(i) == 'o') {
                consecutiveO++;
                totalScore += consecutiveO;
            } else {
                consecutiveO = 0;
            }
        }
        
        System.out.println(totalScore);
    }
}
