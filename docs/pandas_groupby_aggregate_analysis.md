# Pandas GroupBy Aggregate 함수 분석

## 개요
이 문서는 pandas의 `DataFrameGroupBy.aggregate()` 함수의 내부 구현을 분석한 것입니다. 이 함수는 그룹화된 데이터에 집계 함수를 적용하는 핵심 기능을 담당합니다.

## 함수 구조

### 1. 함수 정의
```python
@doc(_agg_template_frame, examples=_agg_examples_doc, klass="DataFrame")
def aggregate(self, func=None, *args, engine=None, engine_kwargs=None, **kwargs):
```

**데코레이터**: `@doc` - 문서화를 위한 템플릿과 예제를 제공합니다.

**매개변수**:
- `func`: 적용할 집계 함수
- `*args`: 추가 위치 인수
- `engine`: 실행 엔진 (numba 등)
- `engine_kwargs`: 엔진별 키워드 인수
- `**kwargs`: 추가 키워드 인수

### 2. 초기 처리 단계

#### 2.1 함수 재구성
```python
relabeling, func, columns, order = reconstruct_func(func, **kwargs)
func = maybe_mangle_lambdas(func)
```
- **목적**: 입력된 함수를 내부 처리에 적합한 형태로 변환
- **기능**: 함수 재구성, 람다 함수 처리, 컬럼 순서 결정

#### 2.2 Numba 엔진 처리
```python
if maybe_use_numba(engine):
    kwargs["engine"] = engine
    kwargs["engine_kwargs"] = engine_kwargs
```
- **목적**: 성능 최적화를 위한 Numba 엔진 사용 설정

### 3. 집계 실행

#### 3.1 GroupByApply 객체 생성 및 실행
```python
op = GroupByApply(self, func, args=args, kwargs=kwargs)
result = op.agg()
```
- **GroupByApply**: 그룹별 함수 적용을 담당하는 핵심 클래스
- **op.agg()**: 실제 집계 연산 수행

#### 3.2 결과 처리 - 첫 번째 분기
```python
if not is_dict_like(func) and result is not None:
    if not self.as_index and is_list_like(func):
        return result.reset_index()
    else:
        return result
```
- **조건**: 함수가 딕셔너리 형태가 아니고 결과가 존재할 때
- **처리**: `as_index` 설정에 따라 인덱스 재설정 여부 결정

#### 3.3 결과 처리 - 재라벨링
```python
elif relabeling:
    result = cast(DataFrame, result)
    result = result.iloc[:, order]
    result = cast(DataFrame, result)
    result.columns = columns
```
- **목적**: 컬럼 순서 재배열 및 컬럼명 설정
- **과정**: DataFrame 타입 캐스팅 → 컬럼 순서 적용 → 컬럼명 할당

### 4. 대체 처리 경로 (result가 None인 경우)

#### 4.1 엔진 키워드 정리
```python
if "engine" in kwargs:
    del kwargs["engine"]
    del kwargs["engine_kwargs"]
```

#### 4.2 Numba 집계
```python
if maybe_use_numba(engine):
    return self._aggregate_with_numba(func, *args, engine_kwargs=engine_kwargs, **kwargs)
```

#### 4.3 다중 키 그룹화
```python
if self._grouper.nkeys > 1:
    return self._python_agg_general(func, *args, **kwargs)
```
- **조건**: 그룹화 키가 2개 이상인 경우
- **처리**: Python 기반 일반 집계 함수 사용

#### 4.4 인수가 있는 경우
```python
elif args or kwargs:
    result = self._aggregate_frame(func, *args, **kwargs)
```

#### 4.5 축(axis) 기반 처리
```python
elif self.axis == 1:
    result = self._aggregate_frame(func)
    return result
```
- **조건**: 컬럼 방향(axis=1) 집계
- **특징**: `as_index=False`와 양립할 수 없음

#### 4.6 리스트 형태로 처리
```python
else:
    gba = GroupByApply(self, [func], args=(), kwargs={})
    try:
        result = gba.agg()
    except ValueError as err:
        if "No objects to concatenate" not in str(err):
            raise
        result = self._aggregate_frame(func)
    else:
        result = cast(DataFrame, result)
        result.columns = self._obj_with_exclusions.columns.copy()
```
- **전략**: 함수를 리스트로 감싸서 재시도
- **예외 처리**: 연결할 객체가 없는 경우 프레임 집계로 대체
- **후처리**: 컬럼명 복사

### 5. 최종 처리

#### 5.1 인덱스 처리
```python
if not self.as_index:
    result = self._insert_inaxis_grouper(result)
    result.index = default_index(len(result))
```
- **조건**: `as_index=False`인 경우
- **처리**: 그룹화 컬럼을 결과에 삽입하고 기본 인덱스 설정

#### 5.2 별칭 설정
```python
agg = aggregate
```
- **목적**: `agg()`와 `aggregate()` 함수를 동일하게 사용 가능

## 핵심 개념

### 1. as_index 매개변수
- **True**: 그룹화 키를 인덱스로 사용
- **False**: 그룹화 키를 일반 컬럼으로 포함

### 2. 처리 경로 우선순위
1. 기본 GroupByApply 처리
2. Numba 엔진 사용
3. 다중 키 그룹화
4. 인수가 있는 프레임 집계
5. 축 기반 집계
6. 리스트 형태 재시도

### 3. 예외 처리
- **ValueError**: "No objects to concatenate" 에러 시 대체 방법 사용
- **타입 캐스팅**: DataFrame 타입 보장을 위한 명시적 캐스팅

## 사용 예제

### 기본 집계
```python
df.groupby('A').agg('mean')  # 평균값
df.groupby('A').agg(['min', 'max'])  # 다중 함수
```

### 사용자 정의 함수
```python
df.groupby('A').agg(lambda x: x.sum() + 2)
```

### 컬럼별 다른 집계
```python
df.groupby('A').agg({'B': ['min', 'max'], 'C': 'sum'})
```

## 성능 최적화

### 1. Numba 엔진 활용
- 수치 연산이 많은 경우 성능 향상
- 모든 집계 함수가 지원되지는 않음

### 2. 내부 최적화
- Cython 기반 빠른 경로 사용
- 메모리 효율적인 스택 연산

## 주의사항

1. **메모리 사용량**: 큰 데이터셋에서는 메모리 부족 가능
2. **타입 일관성**: 결과 데이터 타입이 입력 함수에 따라 결정
3. **인덱스 처리**: `as_index` 설정에 따른 결과 구조 차이

이 분석을 통해 pandas GroupBy 집계 함수의 복잡한 내부 처리 과정과 다양한 최적화 전략을 이해할 수 있습니다.
