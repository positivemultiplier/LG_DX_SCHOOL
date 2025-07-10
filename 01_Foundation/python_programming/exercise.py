
# 전역변수 선언
num1 = 0
num2 = 0

# 함수 정의
def cal_num(num1, num2):
    return num1 + num2, num1 - num2, num1 * num2, num1/num2



# 함수 호출
result_add, result_sub, result_mul, result_div = cal_num(num1, num2)

print(f"덧셈: {result_add}")
print(f"뺄셈: {result_sub}")
print(f"곱셈: {result_mul}")
print(f"나눗셈: {result_div}")

# 사용자로부터 두 숫자 입력 받기
num1 = int(input("첫 번째 숫자를 입력하세요: "))
num2 = int(input("두 번째 숫자를 입력하세요: "))