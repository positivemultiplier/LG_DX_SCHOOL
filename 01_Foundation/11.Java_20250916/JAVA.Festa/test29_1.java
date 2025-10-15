
import java.util.Random;
import java.util.Scanner;

public class test29_1 {
    public static void main(String[] args) {
        Random rd = new Random();
        Scanner sc = new Scanner(System.in);

        int chance = 5;

        for (int i = 0; i < chance; i++) {
            int num1 = rd.nextInt(10);
            int num2 = rd.nextInt(10);
            int correctAnswer = num1 + num2;

            System.out.print(num1 + " + " + num2 + " = ");
            int userAnswer = sc.nextInt();

            if(userAnswer == correctAnswer){
                System.out.println("SUCCESS!");
                break;
            }else {
                System.out.println("Fail");
                if(i == chance - 1){
                    System.out.println("Game Over!");
                }
            }
        }
    }
}
