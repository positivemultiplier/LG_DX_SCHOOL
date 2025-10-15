
import java.util.Scanner;

public class test27_1 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("====채점하기====");
        String ox = sc.next();

        int totalScore = 0;
        int consecutiveO = 0;

        for (int i = 0; i < ox.length(); i++) {
            if(ox.charAt(i) == 'o'){
                consecutiveO++;
                totalScore += consecutiveO;
            }else{
                consecutiveO = 0;
            }
        }
        System.out.println(totalScore);
    }
}
