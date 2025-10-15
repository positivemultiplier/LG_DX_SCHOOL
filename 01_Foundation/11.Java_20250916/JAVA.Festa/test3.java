public class test3 {
    public static void main(String[] args) {
        int sum = 0;
        for(int i = 1; i <= 100; i++){
            // 홀수는 더하고 짝수는 빼기
            if (i % 2 == 1){
                sum += i ;
            }else {
                sum -= i;
            }


        }

        System.out.println(" 결과 : " + sum);
    }
}
