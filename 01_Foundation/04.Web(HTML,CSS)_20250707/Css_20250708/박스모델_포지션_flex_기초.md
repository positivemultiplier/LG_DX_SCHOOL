# CSS 박스모델(Box Model), 포지션(Position), Flexbox 기초

이 문서는 CSS의 박스모델, 포지션, Flexbox에 대해 웹 개발 초보자를 위해 쉽게 설명합니다.

---

## 1. 박스모델(Box Model)

- **박스모델이란?**
  - 모든 HTML 요소는 네모난 박스 형태로 화면에 표시됩니다.
  - 이 박스는 4가지 영역으로 구성됩니다.

```
+-----------------------------+
|        margin(바깥여백)      |
|  +-----------------------+  |
|  |   border(테두리)       |  |
|  |  +-----------------+  |  |
|  |  | padding(안쪽여백)|  |  |
|  |  | +-------------+ |  |  |
|  |  | | content    | |  |  |
|  |  | +-------------+ |  |  |
|  |  +-----------------+  |  |
|  +-----------------------+  |
+-----------------------------+
```

- **구성요소 설명**
  - content : 실제 내용(텍스트, 이미지 등)
  - padding : 내용과 테두리 사이의 공간(안쪽 여백)
  - border  : 테두리
  - margin  : 테두리 바깥의 공간(바깥 여백)

- **예시 코드**
```css
.box {
  margin: 20px;
  padding: 10px;
  border: 2px solid black;
}
```

---

## 2. 포지션(Position)

- **포지션이란?**
  - 요소를 웹 페이지 내에서 어디에 배치할지 결정하는 속성입니다.

- **종류**
  1. static (기본값): 문서 흐름에 따라 자동 배치
  2. relative: 원래 위치를 기준으로 이동 (top, left 등 사용)
  3. absolute: 가장 가까운 position이 지정된 조상 기준으로 위치 지정
  4. fixed: 브라우저 창(뷰포트) 기준으로 고정
  5. sticky: 스크롤 위치에 따라 static/ fixed처럼 동작

- **예시 코드**
```css
.relative-box {
  position: relative;
  top: 20px;
  left: 10px;
}

.absolute-box {
  position: absolute;
  top: 50px;
  left: 100px;
}

.fixed-box {
  position: fixed;
  bottom: 10px;
  right: 10px;
}
```

---

## 3. Flexbox (Flexible Box)

- **Flexbox란?**
  - 여러 요소(박스)를 한 줄 또는 여러 줄에 쉽게 정렬하고 배치할 수 있게 해주는 CSS 레이아웃 방법입니다.
  - 부모 요소에 `display: flex;`를 주면 자식들이 flex 아이템이 됩니다.

- **주요 속성**
  - `display: flex;` : flex 컨테이너(부모)로 만듦
  - `flex-direction` : 주축 방향(row, column)
  - `justify-content` : 주축(가로/세로) 정렬(가운데, 양끝 등)
  - `align-items` : 교차축(세로/가로) 정렬
  - `flex-wrap` : 줄바꿈 허용 여부

- **예시 코드**
```css
.flex-container {
  display: flex;
  flex-direction: row; /* row(가로), column(세로) */
  justify-content: center; /* 가운데 정렬 */
  align-items: center;     /* 세로축 가운데 정렬 */
  gap: 10px;               /* 아이템 사이 간격 */
}
.flex-item {
  width: 100px;
  height: 100px;
  background: skyblue;
}
```

- **예시 결과**
```
+-------------------------------+
|   [box1] [box2] [box3]        |
+-------------------------------+
```

---

## 4. 실습 예제

```html
<div class="flex-container">
  <div class="flex-item">box1</div>
  <div class="flex-item">box2</div>
  <div class="flex-item">box3</div>
</div>
```

---

## 5. 요약
- 박스모델: margin, border, padding, content 구조 이해
- 포지션: 요소의 위치 지정 방법
- Flexbox: 여러 박스를 쉽고 유연하게 정렬하는 방법

웹 레이아웃의 기본이므로 꼭 연습해보세요!
