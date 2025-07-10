# 🎨 CSS 기본 개념

CSS (Cascading Style Sheets)는 HTML로 작성된 웹 페이지의 스타일을 지정하는 데 사용되는 스타일 시트 언어입니다. 웹 페이지의 레이아웃, 색상, 글꼴 등 시각적인 부분을 담당하여 사용자에게 더 매력적인 웹 경험을 제공합니다.

## 1. CSS의 역할

HTML이 웹 페이지의 구조와 내용을 정의한다면, CSS는 그 내용을 '어떻게' 보여줄지 결정합니다. HTML 요소의 크기, 위치, 색상, 배경, 글꼴, 테두리 등 다양한 시각적 속성을 제어하여 웹 페이지의 디자인과 레이아웃을 담당합니다.

## 2. CSS 적용 방법

CSS를 HTML 문서에 적용하는 방법은 크게 세 가지가 있습니다.

### 2.1. 인라인 스타일 (Inline Style)

HTML 요소의 `style` 속성 안에 직접 CSS 코드를 작성하는 방식입니다. 간단한 스타일을 적용할 때 유용하지만, 유지보수가 어렵고 재사용성이 낮아 권장되지 않습니다.

```html
<p style="color: blue; font-size: 16px;">이 텍스트는 파란색이고 16px 크기입니다.</p>
```

### 2.2. 내부 스타일 시트 (Internal/Embedded Style Sheet)

HTML 문서의 `<head>` 섹션 안에 `<style>` 태그를 사용하여 CSS 코드를 작성하는 방식입니다. 해당 HTML 문서에만 적용되는 스타일을 정의할 때 사용합니다.

```html
<!DOCTYPE html>
<html>
<head>
    <title>내부 스타일 시트 예제</title>
    <style>
        h1 {
            color: green;
            text-align: center;
        }
        p {
            font-family: Arial, sans-serif;
        }
    </style>
</head>
<body>
    <h1>안녕하세요!</h1>
    <p>이것은 내부 스타일이 적용된 단락입니다.</p>
</body>
</html>
```

### 2.3. 외부 스타일 시트 (External Style Sheet)

별도의 `.css` 파일에 CSS 코드를 작성하고, HTML 문서에서 `<link>` 태그를 사용하여 연결하는 방식입니다. 가장 일반적이고 권장되는 방법으로, 여러 HTML 페이지에서 동일한 스타일을 재사용할 수 있어 유지보수와 효율성이 뛰어납니다.

**`styles.css` 파일:**
```css
body {
    background-color: lightblue;
}
h1 {
    color: navy;
}
```

**`index.html` 파일:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>외부 스타일 시트 예제</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>외부 스타일이 적용된 제목</h1>
    <p>이것은 외부 스타일이 적용된 단락입니다.</p>
</body>
</html>
```

## 3. CSS 기본 문법

CSS 규칙은 **선택자(Selector)**, **속성(Property)**, **값(Value)**으로 구성됩니다.

```css
선택자 {
    속성: 값; /* 선언(Declaration) */
    속성: 값;
}
```

*   **선택자**: 스타일을 적용할 HTML 요소를 지정합니다. (예: `h1`, `p`, `.class-name`, `#id-name`)
*   **속성**: 변경하려는 스타일의 종류를 나타냅니다. (예: `color`, `font-size`, `background-color`)
*   **값**: 속성에 적용할 구체적인 설정입니다. (예: `blue`, `16px`, `red`)

## 4. 주요 CSS 선택자

*   **요소 선택자 (Element Selector)**: 특정 HTML 요소에 스타일을 적용합니다.
    ```css
    p { /* 모든 <p> 태그에 적용 */
        color: black;
    }
    ```
*   **클래스 선택자 (Class Selector)**: `class` 속성을 가진 요소에 스타일을 적용합니다. `.클래스이름`으로 사용합니다.
    ```html
    <p class="highlight">중요한 내용</p>
    ```
    ```css
    .highlight {
        background-color: yellow;
    }
    ```
*   **ID 선택자 (ID Selector)**: `id` 속성을 가진 단일 요소에 스타일을 적용합니다. `#아이디이름`으로 사용합니다. ID는 문서 내에서 유일해야 합니다.
    ```html
    <div id="header">웹사이트 헤더</div>
    ```
    ```css
    #header {
        border: 1px solid gray;
    }
    ```
*   **그룹 선택자 (Grouping Selector)**: 여러 선택자에 동일한 스타일을 적용할 때 쉼표(`,`)로 구분하여 사용합니다.
    ```css
    h1, h2, p {
        font-family: sans-serif;
    }
    ```

## 5. CSS 박스 모델 (Box Model)

모든 HTML 요소는 사각형 박스로 간주됩니다. 이 박스 모델은 콘텐츠, 패딩(padding), 테두리(border), 마진(margin)으로 구성됩니다.

```
+-----------------------+
|        Margin         |
|  +-----------------+  |
|  |     Border      |  |
|  |  +-------------+  |  |
|  |  |   Padding   |  |  |
|  |  |  +-------+  |  |  |
|  |  |  |Content|  |  |  |
|  |  |  +-------+  |  |  |
|  |  +-------------+  |  |
|  +-----------------+  |
+-----------------------+
```

*   **Content**: 텍스트나 이미지와 같은 요소의 실제 내용입니다.
*   **Padding**: 콘텐츠와 테두리 사이의 공간입니다. 배경색이 적용됩니다.
*   **Border**: 콘텐츠와 패딩을 감싸는 테두리입니다.
*   **Margin**: 테두리 바깥쪽의 공간으로, 요소와 요소 사이의 간격을 조절합니다. 배경색이 적용되지 않습니다.

## 6. CSS 주석

CSS 주석은 코드에 설명을 추가하는 데 사용되며, 브라우저에 의해 무시됩니다.

```css
/* 이것은 CSS 주석입니다. */
```

이 가이드를 통해 CSS의 기본적인 개념을 이해하고 웹 페이지의 스타일을 지정하는 데 필요한 지식을 얻으셨기를 바랍니다. 더 자세한 내용은 각 속성별 문서를 참고하시거나, JavaScript를 함께 학습하여 동적인 웹 페이지를 만드는 능력을 확장할 수 있습니다.