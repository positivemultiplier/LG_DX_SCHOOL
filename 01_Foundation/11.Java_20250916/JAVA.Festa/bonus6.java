public class bonus6 {
    public static void main(String[] args) {
        int base = 2;// 밑(base, underline-asset)
        int n = 4;// 지수(exponent, power)
        int result = powerN(base, n);
        System.out.println("결과 확인 : " + result);
    }

    public static int powerN(int base, int n) {
        int result;
        result = (int) Math.pow(base,n);
        // for (int i = 0; i < n; i++) {
        //     result *= base;
          
        // }
        return result;
    }

}
