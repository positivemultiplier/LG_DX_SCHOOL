package EX01Array;

import java.util.Arrays;
import java.util.Random;

public class EX05Practice {
    public static void main(String[] args) {
        
        // 0. 필요도구 import
        Random ran = new Random();

        // 1. 배열 생성 , 5개 정수 저장
        int[] lotto = new int[5];

        // 2. Lotto의 0번방 데이터를 랜덤한 수로 초기화(1~5 사이의 값)
        for(int i = 0; i < lotto.length; i++){
            lotto[i] = ran.nextInt(5) + 1 ;
        
        }
        
        // 3. Lotto의 1번방 데이터를 랜덤한 수로 초기화 => 3.1. Lotto 0번방과 같은지 비교하기=> 같다면 Lotto 1번방에 다시 랜덤한 수 부여하기.
        if(lotto[0] == lotto[1]){
            lotto[1] = ran.nextInt(5)+1;
        }
        // 4. Lotto의 2번방 데이터를 랜덤한 수로 초기화 => 4.1. Lotto 0번방,1번방과 같은지 비교한후 => 같다면 Lotto 2번방에 다시 랜덤한 수 부여하기. => 4.2. 
        lotto[2] = ran.nextInt(5)+1;
        
        //4.1.
        if(lotto[0] == lotto[2]){
            lotto[2] = ran.nextInt(5)+1;
        }

        // 4.2.
        if(lotto[1] == lotto[2]) {
           lotto[2] = ran.nextInt(10)+1;
		}

        // 5. Lotto의 3번방 데이터를 랜덤한 수로 초기화 => 5.1. Lotto 0번방,1번방,2번방과 같은지 비교후 => 같다면 Lotto 3번방에 다시 랜덤한 수 부여하기.
            
        // 5.1.

        // 5.2.

        // 6. Lotto의 4번방 데이터를 랜덤한 수로 초기화 => 6.1.


        // 강사님 스타일 => 가장 안쪽부터 Execute=> if문 =>for문 => for문 으로 간다. 
        
        
        /*완성본!*/

        for(int i = 0; i < lotto.length; i++){
            
            //Execute => 배열에 랜덤한 수 넣어주기
            lotto[i] = ran.nextInt(5)+1;
            
            for(int j = 0; j < i; j++){
                
                //Condition => 랜덤한 수 부여한것이 중복일 경우 Execute
                if(lotto[i] == lotto[j] ){
                    
                    //Execute => 랜덤한 수 다시 부여하기
                    lotto[i] = ran.nextInt(5) + 1; // ★★★★break가 걸리기때문에 다시 앞으로 보내버린다고 함!! 이해가 안된다 ¿¿¿¿¿¿¿¿¿¿

                    //Execute =>  ★★★새 값도 index[0]부터  비교시작하게 만들어야한다.★★★
                    j = -1; 
                    //break; // 만약 중복된 숫자가 하나라도 발생했다면 멈추고 밖for문으로 보낼꺼야.(나와 가장가까운 반복문만 빠져나간다.)
                }                
            }
        }
        System.out.println(Arrays.toString(lotto));
        



        System.out.println("====================page195손코딩====================");
        //NullPointerException 오류 1.
        // int[] intArray = null; // intArray => Array Variable == Reference_Type Variable => null값 초기화 有
        // intArray[0] = 10; // intArray의 값은 null 이므로, NullPointerException 발생한다. (참조 객체 없기때문에)

        //NullPointerException 오류 2. 
        // String str = null;
        // System.out.println("총 문자수 : " + str.length()); //String은 Class => Refecence_Type  => null값 초기화 有
        // NullPointerException 발생한다. (참조 객체 없기때문에)




        // 참조가 같은지 확인하기
        
        String strVar1 = "신민철";
        String strVar2 = "신민철";
        if(strVar1 == strVar2){
            System.out.println("strVar1과 strVar2가 참조(Reference)가 같다.");
        }else {
            System.out.println("strVar1과 strVar2가 참조(Reference)가 다르다.");
        }
        if(strVar1.equals(strVar2)){
            System.out.println("strVar1과 strVar2는 문자열이 같음");
        }


        String strVar3 = "신민철";
        String strVar4 = new String("신민철");
        if(strVar3 == strVar4){
            System.out.println("strVar3과 strVar4가 참조(Reference)가 같다.");
        }else {
            System.out.println("strVar3과 strVar4가 참조(Reference)가 다르다.");
        }
        if(strVar3.equals(strVar4)){
            System.out.println("strVar3과 strVar4는 문자열이 같음");
        }

        // boolean result1vs2 = str1.equals(str2);
        // boolean result1vs3 = str1.equals(str3);
        // boolean result2vs3 = str2.equals(str3);


        // System.out.println("str1과2비교 : " + result1vs2);
        // System.out.println("str1과3비교 : " + result1vs3);
        // System.out.println("str2과3비교 : " + result2vs3);



    }
}
