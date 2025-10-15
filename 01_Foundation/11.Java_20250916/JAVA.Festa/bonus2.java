public class bonus2 {
    public static void main(String[] args) {
        System.out.println(getMiddle("power"));
        System.out.println(getMiddle("test"));
    }
    
    public static String getMiddle(String word) {
        int length = word.length();
        int middle = length / 2;
        
        if (length % 2 == 0) {
            // 짝수일 경우 가운데 두 글자 반환
            return word.substring(middle - 1, middle + 1);
        } else {
            // 홀수일 경우 가운데 한 글자 반환
            return word.substring(middle, middle + 1);
        }
    }
}
