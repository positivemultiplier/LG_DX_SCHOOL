// main 함수- 실행
void main(){
  //다트 언어의 데이터 타입
  //bool - boolean(참/거짓)
  //정수 - int
  //실수 - double
  //숫자 타입 - num
  //문자열 - String

  //변수 선언 방법 - java 와 동일
  int num1 = 10;
  bool b = true;

  print(num1); // 회색 밑줄 - 사용하지 않는 변수 -> 링트(hint를 주는 밑줄)
  //최신 출력문

  print("hello world");


  //문자열
  print("====================문자열 학습====================");
  String s1 = "hello"; // dart 문자열 "", '' 구분하지 않습니다!
  print(s1);

  String s2 = 'world';
  print(s2);

  String s3 = """hello
  world
  nice
  to
  meet
  you""";
  print(s3);


  // 문자열 포매팅 - $변수명
  print("====================문자열 포매팅  \${변수명}====================");

  print("s1의 값은 : $s1");

  // 연산이나 객체 값을 가지고 오는 포매팅 - ${연산, 객체값}
  // int num1 에 담긴 10이란 숫자를 +5 해서 출력
  print("num1에서 5를 더한 값 :  ${num1 + 5}"); // f-formatting과 유사하다

  //var 타입 -  Type에 상관 없이 값 할당 가능. (JS와 유사하다)
  // Type이 한번 설정되면 바뀌지 않는다.

  //dynnamic 타입 - Type에 상관 없이 값 할당 가능. (var와 유사하지만, 런타임 시에 타입 체크를 한다.)
  // Type이 고정 되어있지 않다. 변경가능하다 .


  print("====================var, dynamic 타입====================");
  var num2 = 10;
  print("v1의 값 : $num2");
  num2 = 20;
  print("v1의 값 : $num2");
  // num2 = "안녕"; //
  // print("v1의 값 : "num2 = "안녕"; 불가능 $num2");

  dynamic d1 = 10;
  print("d1의 값 : $d1");
  d1 = "안녕";
  print("d1의 값 : $d1");




}