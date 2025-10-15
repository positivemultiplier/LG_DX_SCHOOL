
import java.util.Scanner;

public class bonus2_1 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        while(true){
            System.out.print("단어를 입력하세요 >> ");
            String word = sc.next();
            System.out.println(getMiddle(word));
            if("exit".equals(word)){
                break;
            }
        }

    }

    // 

    // Field
   

    // Method

    //
    public static  String getMiddle(String word) {
        int length = word.length();
        int middle = length/2;

        if(length % 2 == 0){
        
            return word.substring(middle -1, middle + 1);
        }else {
        
            return word.substring(middle, middle + 1);
        }

    }
}
