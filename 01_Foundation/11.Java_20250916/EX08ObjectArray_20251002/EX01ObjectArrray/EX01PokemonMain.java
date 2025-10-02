
import java.util.Scanner;

public class EX01PokemonMain {
    public static void main(String[] args) {
        // 포켓몬 게임
        /* 게임 룰
         * 1. 두 마리의 포켓몬을 생성한다
         * 2. 사용자로부터 포켓몬을 선택하게 한다.
         * 3. 공격 혹은 스킬 공격 둘 중 하나를 선택하게 한다.
         * 4. 선택한 포켓몬이 다른 포켓몬을 공격한다. (공격시 포켓몬 hp - 공격력)
         * 5. 스킬 공격 시 공격력은 1.5배 증가한다.
         * 6. 한 마리의 포켓몬이 죽을때까지 게임을 반복한다.
         */

         // 0. 필요한 도구 호출
         Scanner sc = new Scanner(System.in);

         // 1. 두 마리의 포켓몬을 생성한다(Pokemon 클래스를 기반으로 객체를 2개 생성)
         // 잠만보, 노말, 잠자기, 100, 10
         // 이상해씨, 풀, 덩쿨채찍, 110, 15
         // 생성자(Constructor) method를 사용해서 만들어보기 
         EX01Pokemon jammanbo = new EX01Pokemon("잠만보", "노말", "잠자기", 100, 10);
         EX01Pokemon isanghae = new EX01Pokemon("이상해씨", "풀", "덩쿨채찍", 110, 15);


         // 2. 공격 혹은 스킬 공격 둘 중 하나를 선택하게 한다
         while(true){
            System.out.println("==================== 포켓몬을 선택하세요====================");
            System.out.print("[1]잠만보 [2]이상해씨 >>"); // 공격할 포켓몬 선택
            int choice = sc.nextInt();
            
            // 사용자가 잠만보를 선택
            if (choice == 1){
                // 잠만보가 이상해씨를 공격
                System.out.println("====================공격을 선택하세요====================");
                System.out.print("[1]일반 공격 [2]스킬공격");
                int choiceAttack = sc.nextInt();

                if(choiceAttack == 1) {
                    // 1) 일반 공격을 선택했다면
                    // 이상해씨의 hp를 잠만보의 attack만큼 감소시키기
                    isanghae.setHp(isanghae.getHp() -  jammanbo.getAttack());
                
                }else{
                    // 2) 스킬 공격을 선택했다면
                    System.out.println(jammanbo.getSkill() + "공격 !!!");
                    // 이상해씨의 hp를 잠만보의 attack * 1.5 만큼 감소시키기
                    //isanghae.setHp(isanghae.getHp() - jammanbo.getAttack());
                    isanghae.setHp(isanghae.getHp() - (int)(jammanbo.getAttack() * 1.5));
                    // parameter는 integer but argument는 double ==> 강제 형변환으로 argument를 int타입으로 변화시켜라
                }

                // 3) 두 마리 포켓몬의 hp 출력해주기
                System.out.println("====================남은 hp====================");
                System.out.println("잠만보 : " + jammanbo.getHp());
                System.out.println("이상해 : " + isanghae.getHp());
            
            // 사용자가 이상해씨를 선택
            }else if(choice == 2){
                
                // 이상해씨가 잠만보를 공격
                System.out.println("====================공격을 선택하세요====================");
                System.out.print("[1]일반 공격 [2]스킬공격");
                int choiceAttack = sc.nextInt();

                if(choiceAttack == 1) {
                    // 1) 일반 공격을 선택했다면
                    // 잠만보의 hp를 이상해씨의 attack만큼 감소시키기
                    jammanbo.setHp(jammanbo.getHp() - isanghae.getAttack());
                
                }else{
                    // 2) 스킬 공격을 선택했다면
                    System.out.println(isanghae.getSkill() + "공격 !!!");
                    // 이상해씨의 hp를 잠만보의 attack * 1.5 만큼 감소시키기
                    // jammanbo.setHp(jammanbo.getHp() - isanghae.getAttack() * 1.5);
                    jammanbo.setHp(jammanbo.getHp() - (int)(isanghae.getAttack() * 1.5));

                }
                
                // 3) 두 마리 포켓몬의 hp 출력해주기
                System.out.println("====================남은 hp====================");
                System.out.println("잠만보 : " + jammanbo.getHp());
                System.out.println("이상해 : " + isanghae.getHp());


            }else {
                System.out.println("다시 포켓몬을 선택해주세요!");
            }
        // 포켓몬 선택 ~ 공격 선택하는 것까지 계속 반복!
        // 4) 두 마리의 포켓몬 중 한마리라도 hp가 0보다 작거나 같았을 때 프로그램 종료!
        if(jammanbo.getHp() <= 0){
            System.out.println("====================승자결정!!====================");
            System.out.println("승자는 : " + isanghae.getName());
            break;
        }else if(isanghae.getHp() <= 0){
            System.out.println("====================승자결정!!====================");
            System.out.print("승자는 : " + jammanbo.getName());
            break;

        }
        // 5) 승자가 누구인지 출력! & break 사용
        }

    }
}
