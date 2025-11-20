// ============================================
// Dart 기본 문법 학습 예제
// ============================================

void main() {
  print('=== Dart 기본 문법 학습을 시작합니다! ===\n');

  // 1. 변수와 자료형
  variablesAndTypes();

  // 2. 연산자
  operators();

  // 3. 조건문
  conditionals();

  // 4. 반복문
  loops();

  // 5. 함수
  functions();

  // 6. 컬렉션
  collections();

  // 7. 클래스와 객체
  classesAndObjects();

  // 8. Null Safety
  nullSafety();
}

// ============================================
// 1. 변수와 자료형
// ============================================
void variablesAndTypes() {
  print('\n--- 1. 변수와 자료형 ---');

  // 변수 선언 방법
  var name = '홍길동';  // 타입 추론 (String)
  String city = '서울';  // 명시적 타입

  // 기본 자료형
  int age = 25;  // 정수
  double height = 175.5;  // 실수
  bool isStudent = true;  // 불린
  String message = '안녕하세요';  // 문자열

  print('이름: $name, 나이: $age, 키: $height cm');
  print('학생 여부: $isStudent, 메시지: $message');

  // final과 const (상수)
  final birthYear = 1998;  // 런타임 상수
  const PI = 3.14159;  // 컴파일 타임 상수

  print('출생년도: $birthYear, 원주율: $PI');

  // dynamic (동적 타입)
  dynamic value = 10;
  print('dynamic value: $value');
  value = '문자열로 변경';
  print('dynamic value: $value');
}

// ============================================
// 2. 연산자
// ============================================
void operators() {
  print('\n--- 2. 연산자 ---');

  // 산술 연산자
  int a = 10, b = 3;
  print('a + b = ${a + b}');  // 덧셈
  print('a - b = ${a - b}');  // 뺄셈
  print('a * b = ${a * b}');  // 곱셈
  print('a / b = ${a / b}');  // 나눗셈 (실수)
  print('a ~/ b = ${a ~/ b}');  // 나눗셈 (정수)
  print('a % b = ${a % b}');  // 나머지

  // 비교 연산자
  print('a == b: ${a == b}');
  print('a != b: ${a != b}');
  print('a > b: ${a > b}');
  print('a < b: ${a < b}');

  // 논리 연산자
  bool x = true, y = false;
  print('x && y: ${x && y}');  // AND
  print('x || y: ${x || y}');  // OR
  print('!x: ${!x}');  // NOT

  // 증감 연산자
  int count = 0;
  print('count++: ${count++}');  // 후위 증가
  print('++count: ${++count}');  // 전위 증가

  // Null 관련 연산자
  String? nullableStr;
  print('Null 병합: ${nullableStr ?? "기본값"}');
}

// ============================================
// 3. 조건문
// ============================================
void conditionals() {
  print('\n--- 3. 조건문 ---');

  // if-else
  int score = 85;
  if (score >= 90) {
    print('학점: A');
  } else if (score >= 80) {
    print('학점: B');
  } else if (score >= 70) {
    print('학점: C');
  } else {
    print('학점: F');
  }

  // 삼항 연산자
  String result = score >= 60 ? '합격' : '불합격';
  print('결과: $result');

  // switch-case
  String day = '월요일';
  switch (day) {
    case '월요일':
    case '화요일':
    case '수요일':
    case '목요일':
    case '금요일':
      print('$day은 평일입니다.');
      break;
    case '토요일':
    case '일요일':
      print('$day은 주말입니다.');
      break;
    default:
      print('알 수 없는 요일');
  }
}

// ============================================
// 4. 반복문
// ============================================
void loops() {
  print('\n--- 4. 반복문 ---');

  // for 문
  print('for 문:');
  for (int i = 1; i <= 5; i++) {
    print('  $i번째 반복');
  }

  // while 문
  print('while 문:');
  int count = 1;
  while (count <= 3) {
    print('  카운트: $count');
    count++;
  }

  // do-while 문
  print('do-while 문:');
  int num = 1;
  do {
    print('  숫자: $num');
    num++;
  } while (num <= 3);

  // for-in 문
  print('for-in 문:');
  List<String> fruits = ['사과', '바나나', '오렌지'];
  for (var fruit in fruits) {
    print('  과일: $fruit');
  }

  // forEach (함수형 반복)
  print('forEach:');
  fruits.forEach((fruit) => print('  $fruit'));
}

// ============================================
// 5. 함수
// ============================================
void functions() {
  print('\n--- 5. 함수 ---');

  // 일반 함수 호출
  print('덧셈: ${add(5, 3)}');

  // 명명된 매개변수
  printPerson(name: '김철수', age: 30);
  printPerson(name: '이영희', age: 25, city: '부산');

  // 선택적 위치 매개변수
  print(greet('홍길동'));
  print(greet('박민수', '안녕하세요'));

  // 화살표 함수
  print('제곱: ${square(4)}');

  // 익명 함수
  var multiply = (int a, int b) => a * b;
  print('곱셈: ${multiply(6, 7)}');
}

// 기본 함수
int add(int a, int b) {
  return a + b;
}

// 명명된 매개변수 (required, optional)
void printPerson({required String name, required int age, String? city}) {
  print('이름: $name, 나이: $age${city != null ? ", 도시: $city" : ""}');
}

// 선택적 위치 매개변수
String greet(String name, [String greeting = '반갑습니다']) {
  return '$greeting, $name님!';
}

// 화살표 함수 (한 줄 함수)
int square(int n) => n * n;

// ============================================
// 6. 컬렉션 (List, Set, Map)
// ============================================
void collections() {
  print('\n--- 6. 컬렉션 ---');

  // List (리스트 - 순서가 있는 컬렉션)
  print('List:');
  List<int> numbers = [1, 2, 3, 4, 5];
  print('  숫자 리스트: $numbers');
  numbers.add(6);
  print('  추가 후: $numbers');
  print('  첫 번째 요소: ${numbers[0]}');
  print('  길이: ${numbers.length}');

  // List 메서드
  print('  짝수 필터: ${numbers.where((n) => n % 2 == 0).toList()}');
  print('  모두 2배: ${numbers.map((n) => n * 2).toList()}');

  // Set (집합 - 중복 없는 컬렉션)
  print('\nSet:');
  Set<String> colors = {'빨강', '파랑', '노랑'};
  colors.add('초록');
  colors.add('빨강');  // 중복은 추가되지 않음
  print('  색상 집합: $colors');

  // Map (맵 - 키-값 쌍)
  print('\nMap:');
  Map<String, int> scores = {
    '수학': 90,
    '영어': 85,
    '과학': 88
  };
  print('  점수: $scores');
  scores['국어'] = 92;
  print('  수학 점수: ${scores['수학']}');
  print('  모든 과목: ${scores.keys}');
  print('  모든 점수: ${scores.values}');
}

// ============================================
// 7. 클래스와 객체
// ============================================
void classesAndObjects() {
  print('\n--- 7. 클래스와 객체 ---');

  // 객체 생성
  Person person1 = Person('김민수', 28);
  person1.introduce();

  // Named constructor
  Person person2 = Person.guest();
  person2.introduce();

  // Getter 사용
  print('생년도: ${person1.birthYear}');

  // 상속
  Student student = Student('이지은', 20, '컴퓨터공학');
  student.introduce();
  student.study();
}

// 기본 클래스
class Person {
  String name;
  int age;

  // 생성자
  Person(this.name, this.age);

  // Named constructor
  Person.guest() : name = '손님', age = 0;

  // 메서드
  void introduce() {
    print('안녕하세요, 저는 $name이고 $age살입니다.');
  }

  // Getter
  int get birthYear => DateTime.now().year - age;

  // Setter
  set updateAge(int newAge) {
    if (newAge > 0) age = newAge;
  }
}

// 상속
class Student extends Person {
  String major;

  Student(String name, int age, this.major) : super(name, age);

  void study() {
    print('$major을 공부하고 있습니다.');
  }

  @override
  void introduce() {
    super.introduce();
    print('전공은 $major입니다.');
  }
}

// ============================================
// 8. Null Safety (널 안정성)
// ============================================
void nullSafety() {
  print('\n--- 8. Null Safety ---');

  // Non-nullable (null이 될 수 없음)
  String name = '홍길동';
  // name = null;  // 오류!

  // Nullable (null이 될 수 있음)
  String? nullableName;
  print('Nullable 변수: $nullableName');
  nullableName = '김철수';
  print('값 할당 후: $nullableName');

  // Null 체크
  print('길이: ${nullableName.length}');

  // Null 병합 연산자 (??)
  String displayName = nullableName ?? '이름 없음';
  print('표시 이름: $displayName');

  // Null-aware 연산자 (?.)
  String? optionalString;
  print('길이: ${optionalString?.length ?? 0}');

  // Late 변수 (나중에 초기화)
  late String lateInit;
  lateInit = '나중에 초기화';
  print('Late 변수: $lateInit');

  // Assert non-null (!)
  String? maybeNull = 'Not null';
  String definitelyNotNull = maybeNull;  // null이 아님을 확신할 때
  print('확실히 null 아님: $definitelyNotNull');
}

