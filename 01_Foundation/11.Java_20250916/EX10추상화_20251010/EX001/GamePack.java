public abstract class GamePack {
    // 추상화 메서드(Abstract Method)로 만들기. 
    public void temp(){
        System.out.println("임의로 만든 메서드");
    } 
    
    
    public abstract  void gameStart();
        // ⓐ어차피 물려받으면 상속받은 곳에서 새로운 method가 필요없다. 
        // System.out.println("");

    
}


