public class EX01Pokemon {

    // 1.Field Area
    
    private String name;
    private String type;
    private String skill;
    private int hp;




    private int attack;
    
    private String action;

    // 2.Method Area

    // 2.1.모든필드의 값을 매개변수로 받아서 객체를 생성하는 순간 채워주는 생성자 하나 만들기
    // Constructor Method
    public EX01Pokemon(String name, String type, String skill, int hp, int attack) {
        this.name = name;
        this.type = type;
        this.skill = skill;
        this.hp = hp;
        this.attack = attack;
    }


    // 2.2. name,type,skill,hp,attack => getter Method 생성
    public String getName() {
        return name;
    }


    public String getType() {
        return type;
    }


    public String getSkill() {
        return skill;
    }


    public int getHp() {
        return hp;
    }


    public int getAttack() {
        return attack;
    }



    // 2.3. hp, attack => setter Method 생성 
    public void setHp(int hp) {
        this.hp = hp;
    }

    public void setAttack(int attack) {
        this.attack = attack;
    }    

    
}
