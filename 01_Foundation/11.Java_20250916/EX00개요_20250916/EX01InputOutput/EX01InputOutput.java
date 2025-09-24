package EX01InputOutput;

import java.util.Scanner;

public class EX01InputOutput {
    public static void main(String[] args) {
        // 주석: 코드에 영향을 끼치지 않는 일종의 메모
        
        // 한 줄 주석 : //
            // asdasdas
        // 범위 주석 : /*  ~~~ */
            /* 
            asdasdasdads
            asdasdasdasd
            asdasdasa 
            asd
            */
        // document 주석 : /** ~~~ */
            /**
             * 
             * asdasdasd
             * asdasdasd
             * asdasdasd
             * 
             */
        


        // 단축키
        // 1) 글자 크기 늘리기: Ctrl +
        // 2) 글자 크기 줄이기: Ctrl -
        // 3) 한 줄 삭제: Ctrl + D
        // 4) 실행 단축키: F11
        // 5) 자동 import 단축키: Ctrl + Shift + O

        // 1. 출력문
        System.out.println("Hello, World!");
        
        // 출력문 생성 단축키: syso -> Ctrl + Space
        System.out.println("Hello, Java!"   );

        // 2. 입력문
        // 2-1) 입력받는 도구 꺼내오기 = import (스캐너, Scanner)
        Scanner sc = new Scanner(System.in); // System.in : 키보드

        // 2-3) 안내문구 출력
        // System.out.println("글자를 입력하세요 >> ");
        // 개행을 하고싶지 않다면 ln만 지워주면 된다
        System.out.print("글자를 입력하세요 >> ");

        // 2-2) 입력받기
        sc.next();
        // 연산을 할때 숫자로 받아야 한다면 nextInt() 사용 => 문자는 연산이 안되니까!!
        sc.nextInt();


    }
}

    

