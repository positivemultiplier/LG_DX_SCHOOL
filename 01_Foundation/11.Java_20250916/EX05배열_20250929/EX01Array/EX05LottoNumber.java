package EX01Array;

import java.util.Arrays;
import java.util.Random;

public class EX05LottoNumber {
    public static void main(String[] args) {
        

        // 1. 정수형 데이터 5개를 저장할 수 있는 배열 array를 선언하세요.
        int[] array = new int[5];

        // 2. 배열 안의 데이터를 모두 임의의 값으로 초기화하세요(1~10 까지의 수)

        Random ran = new Random();

        for(int i = 0; i < array.length; i++){
            array[i] = ran.nextInt(10)+1;
        }
        
        // 3.방법1(2중for문). 단, 배열에 중복된 값을 제거해주세요.
        for (int i = 0; i < array.length; i++) {
            for (int j = 0; j < i; j++) {
                if (array[i] == array[j]) {
                    array[i] = ran.nextInt(10) + 1;
                    j = -1; // 새 값도 0부터 다시 비교하게 함
                }
            }
        }

        // 3.방법2(Set). 단, 배열에 중복된 값을 제거해주세요. 
        // Set<Integer> set = new HashSet<>();
        //     while (set.size() < 5) {
        //     set.add(ran.nextInt(10) + 1);
        // }
        // int index = 0;
        // for (int num : set) {
        //     array[index++] = num;
        // }



        // 4. 배열 안의 데이터를 모두 출력해주세요.
        System.out.println("=====로또타임=====");
        System.out.println("이번주 출력번호는요...!! 두구두구두구!!!!");
        System.out.println(Arrays.toString(array));


        

    }
}
