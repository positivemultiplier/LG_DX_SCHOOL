void main(){
  // 1.condition 조건문

  // 1.1. if-else
  // java와 동일

  // 1.2. switch-case
  // switch(logic){
  //   case value :
  // }
  // dart 3 버전 업데이트 이후 break 생략 가능! (권장하지는 않음)
  // Switch 문에서 비교가 가능해졌다


  print("====================Switch문에서 break 사용 안해도 된다 ===================");
  String text = "hello";
  switch(text){
    case "hello":
      print("안녕");
      // break;
    case "world":
      print("세상");
      // break;
    default:
      print("넌 누구냐? ");
      // break;
  }

  print("====================Switch문에서 비교 가능해짐====================");
  int num1 = -10;

  switch(num1){
    case > 0:
      print("양수");
    case < 0:
      print("음수");
    default:
      print("넌 뭐냐? ");
  }

}