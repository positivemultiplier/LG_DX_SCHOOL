public class EX01ObjectArrayMain {
    // 기존의 객체(Object)하나씩 만들었다. => 여기에서는 객체배열(Object[]) 사용해보자.
    // 객체배열 
    // Poke[] bag = new Poke[5];
    // Poke객체 하나하나를 index에 넣을 것이다
    // Poke pika = new Poke();
    // pika(레퍼런스 변수) =>필드(Feature),메소드(Function) (클래스타입의 객체)


    
    public static void main(String[] args) {
    // 1. 객체 배열 생성
    // 자료형[] 배열이름 = new 자료형[칸수];
    // 포켓몬 자료형(EX01Poketmon)을 3개 보관할 수 있는 bag 배열 생성
    EX01Pokemon[] bag = new EX01Pokemon[3];
        
    //객체 배열의 0번 인덱스에 들어있는 데이터 출력
    System.out.println("bag의 0번방 출력 : " + bag[0]);
    

    // 2. 객체 배열의 0번 인덱스에 포켓몬을 넣어보자.
    // 이름 : 잠만보 
    // 타입 : 노멀
    // 스킬 : 잠자기
    // hp : 100
    // attack : 10
    EX01Pokemon jammanbo = new EX01Pokemon("잠만보", "노말", "잠자기", 100, 10);
    bag[0] = jammanbo;
    //한줄로 간략하게 코드 정리하기
    bag[0] = new EX01Pokemon("잠만보", "노말", "잠자기", 100, 10);

    System.out.println("bag의 0번반 출력 : "+ bag[0]);
    System.out.println("bag의 0번방 포켓몬 이름 : " + bag[0].getName());



    // 3. bag 배열의 1,2 인덱스에도 포켓몬 넣어주기
    // 1번 인덱스
    // 이름 : 이상해씨
    // 타입 : 풀
    // 스킬 : 덩쿨채찍
    // hp : 110
    // attack : 11
    bag[1] = new EX01Pokemon("이상해", "풀", "덩쿨채찍", 110, 11);
    

    // 2번 인덱스
    // 이름 : 꼬부기
    // 타입 : 물
    // 스킬 : 물대포
    // hp : 120
    // attack : 12
    bag[2] = new EX01Pokemon("꼬부기", "물", "물대포", 120, 12);

    // 4. 배열 안에 들어있는 포켓몬의 이름, 타입, hp를 전부 출력해주세요!
    // ========== 포켓몬 정보 출력 ==========

    // 이름     타입     hp
    // 잠만보   노말    100
    // 이상해씨 풀      110
    // 꼬부기   물      120

    System.out.println("========== 포켓몬 정보 출력 ==========");
    System.out.println("이름\t타입\thp");
    System.out.println("------\t----\t----");
        for(int i = 0; i < bag.length; i++){
            System.out.println(bag[i].getName()+ "\t" +bag[i].getType() + "\t" + bag[i].getHp() );
        }
    // 5. for - each문
    // 배열과 같이 여래개의 데이털르 저장하는 자료구조와 함께 사용
    /* 동작원리:
    배열 안에 저장되어 있는 데이터를 for문에서 순차적으로 꺼내서 
    :(콜론) 기준 왼쪽에 있는 변수에 담아주는 흐름을 가진다.
    */

    System.out.println("====================for-each문 연습해보자====================");
        
    System.out.println("========== 포켓몬 정보 출력 ==========");
    System.out.println("이름\t타입\thp");
    System.out.println("------\t----\t----");
    
        //for(배열안의 데이터 타입 =>  EXo1Pokemon p : 반복시키고자하는 배열이름=> bag)
        for(EX01Pokemon p : bag){
            // 포켓몬 객체를 p라고 바꿔줘야한다 bag[i] => p 로 바꿔주면 된다 
            //System.out.println(bag[i].getName()+ "\t" +bag[i].getType() + "\t" + bag[i].getHp() );
            System.out.println(p.getName()+ "\t" +p.getType() + "\t" + p.getHp() );
            
        } 

    }
    
}
