public class bonus2_2 {
    public static void main(String[] args) {
        System.out.println(getMiddle("power"));
        System.out.println(getMiddle("test"));
        System.out.println(getMiddle("대한민국"));
    }

    private static String getMiddle(String word) {
    
        int length = word.length();
        int middle = length / 2;
        if (length % 2 == 0){
        
            return word.substring(middle-1, middle+1);
        }else {

            return word.substring(middle, middle +1);
        }

    }
    



}
