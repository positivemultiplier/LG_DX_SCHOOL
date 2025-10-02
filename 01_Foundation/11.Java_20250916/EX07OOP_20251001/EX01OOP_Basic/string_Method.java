

public class string_Method {
    public static void main(String[] args) {

        //String 관련 Method 모음!
        
        // 1. indexOf(String s, int i) Method => index 번로를 반환함
        System.out.println("====================indexOf(string s, int i) Method====================");
        String data1 = "여러분 안녕?"; 
        System.out.println(data1.indexOf("안"));
    
        // 2. substring(int start, int end) Method => start index number 부터 end index number까지 문자열을 String에서 잘라서 반환함
        
        System.out.println("====================substring(int start, int end) Method====================");
        String data2 = "여러분 안녕?";
        String temporary2 = data2.substring(0,3);
        System.out.println(temporary2);

        // 3. contains(String s) Method => 파라미터로 받은 문자열의 포함여부를 boolean으로 반환
        System.out.println("====================contains(String s) Method====================");
        String data3 = "여러분 안녕?";
        if(data3.contains("안녕?") == true){
            System.out.println("있넹!");
        }
    
        // 4.charAt(int i)
        System.out.println("====================charAt(int i) Method====================");
        String data4 = "Hello World!!";
        char temporary4 = data4.charAt(3);
        System.out.println(temporary4);



        // 5.endWith(String s)
        System.out.println("====================endsWith(String s) Method====================");
        String data5 = "hello.txt";
        if(data5.endsWith(".txt") == true){
            System.out.println("확장자가 맞습니다!");
        }

        // 6.replace(String old, String new)
        System.out.println("====================replace(String old, String new) Method====================");
        String data6 = "여러분 안녕?";
        System.out.println("처리 전 : " + data6) ;
        data6.replace("여러분","임마");
        System.out.println("처리 후 : " + data6 );


        // 7.toLowerCase()
        System.out.println("====================toLowerCase() Method====================");
        String data7 = "Hello, World!!";
        String trans7 = data7.toLowerCase();
        System.out.println(trans7);


        // 8.toUpperCase()
        System.out.println("====================toUpperCase() Method====================");
        String data8 = "Hello, World!!";
        String trans8 = data8.toUpperCase();
        System.out.println(trans8);


        // 9.split(String s)
        System.out.println("====================split(String s) Method====================");
        String data9 = "010-3333-333";
        String[] cut = data9.split("-");
        System.out.println(cut[0] + cut[1] + cut[2]);
    
    }

    
}
