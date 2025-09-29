

public class EX02ArrayBasic {
    public static void main(String[] args) {
        
        int [] numbers = new int[5];
        // numbers => [0, 0, 0, 0, 0]

        // 배열의 길이 알아볼 수 있는 keyword : length
        // 변수의 길이
        // 변수명.length
        System.out.println("배열의 길이 : " + numbers.length); // 5


        // 배열의 길이를 변수에 담아서 사용하기
        int length = numbers.length;
        System.out.println("배열의 길이(변수사용) : " + length);

        
        
        System.out.println("==================================================");
        // 배열의 각 칸을 5의 배수로 초기화하세요.
        // numbers[0] = 5;
        // numbers[1] = 10;
        // numbers[2] = 15;
        // numbers[3] = 20;
        // numbers[4] = 25;
        for(int i = 0; i < length; i++ ){
            numbers[i] = 5 * (i+1);
            // System.out.println("index[" + i  + "] Value: "  + numbers[i] );
        }


        // 배열의 값을 전부 출력
        // 5, 10, 15, 20, 25

        for(int i = 0; i < length; i++ ){
            // numbers[i] = 5 * (i+1);
            System.out.println("index[" + i  + "] Value: "  + numbers[i] );
        }



        System.out.println("==================================================");
        //배열을 생성함과 동시에 데이터를 집어넣는 방법
        String[] names = {"이도연", "손지영", "곽진규"};
        System.out.println(names[2]);




    }
}
