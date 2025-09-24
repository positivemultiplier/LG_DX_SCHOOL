
import java.util.Scanner;

public class EX02CalculateGrade {
    public static void main(String[] args) {
        /*
         * int타입의 변수 totalScore를 선언하고 키보드로 값을 입력 받으세요.
         * totalScore가 90점 이상이면 "A학점입니다.",
         * 80점 이상 90점 미만일 경우 "B학점입니다.",
         * 70점 이상 80점 미만일 경우 "C학점입니다.",
         * 70점 미만일 경우 "D학점입니다." 출력하는 프로그램을 작성하세요.
         * 
         * 
         */


         // 1. 입력도구 꺼내오기
        Scanner sc = new Scanner(System.in);
        
        // 2. 점수 입력받기
        //System.out.println("점수를 입력하세요 : ");
        //int totalScore = sc.nextInt();
        System.out.println("점수를 입력하세요 : ");
        int totalScore = sc.nextInt();
         


        // 3. 점수에 따른 학점 계산하기
        // 점수가 90점 이상이면 --> "A학점입니다."
        // 점수가 80점 이상 90점 미만이면 --> "B학점
        // 점수가 70점 이상 80점 미만이면 --> "C학점"
        // 점수가 70점 미만이면 --> "D학점"
        char grade = ' '; // Grobal variable  initialization
         

        switch (totalScore / 10) { //totalScore를 10으로 나눈 몫을 가지고 판단한다.
            case 10: // 100점인 경우 => break문이 없기때문에 90점 이상과 동일하게 처리됨
                // grade = 'A';
                // break;
            case 9: // 90~99점인 경우
                grade = 'A';
                break;
            case 8: // 80~89점인 경우
                grade = 'B';
                break;
            case 7: // 70~79점인 경우
                grade = 'C';
                break;
            default: // 0~69점인 경우
                grade = 'D';
                break; // 마지막에는 break가 없어도 break 걸린다. 
        }


        // 4. 학점 출력하기 
        System.out.println("입력하신 점수 " + totalScore + "는 " + grade + " 학점입니다.");
        
        switch(totalScore){
            case 100:
            case 99:
            case 98:
            case 97:
            case 96:
            case 95:
            case 94:
            case 93:
            case 92:
            case 91:
            case 90:
                System.out.println("입력하신 점수 " + totalScore + "는 A학점입니다.");
                break;
            case 89:
            case 88:
            case 87:
            case 86:
            case 85:
            case 84:
            case 83:
            case 82:
            case 81:
            case 80:
                System.out.println("입력하신 점수 " + totalScore + "는 B학점입니다.");
                break;
            case 79:
            case 78:
            case 77:
            case 76:
            case 75:
            case 74:
            case 73:
            case 72:
            case 71:
            case 70:
                System.out.println("입력하신 점수 " + totalScore + "는 C학점입니다.");
                break;
            default:
                System.out.println("입력하신 점수 " + totalScore + "는 D학점입니다.");
                break;
            

        }
    }
}
