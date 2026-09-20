# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

빌드·설치 과정이 없는 순수 HTML/JS/CSS 계산기입니다. 실행은 `index.html`을 브라우저에서 직접 열면 됩니다. 테스트·린트·포맷터 설정은 없습니다.

## 구조 규칙

- `calc.js`는 DOM을 전혀 쓰지 않는 순수 로직입니다. 브라우저에서는 `window.Calc`, Node에서는 `module.exports`로 함께 노출되므로 `node -e "require('./calc.js')..."`로 화면 없이 검증할 수 있습니다. 화면 관련 코드를 여기에 넣지 마세요.
- `app.js`는 화면 갱신과 키 입력(클릭·키보드)만 담당하고, 계산은 항상 `Calc`를 거칩니다.
- `index.html`은 `calc.js`, `app.js` 순서로 `<script>`를 불러옵니다. 순서를 바꾸면 `window.Calc`가 없어 동작하지 않습니다.
- 새 함수를 `calc.js`에 추가하면 파일 끝의 `api` 객체에도 등록해야 외부에서 쓸 수 있습니다.

## 지켜야 할 점

- 수식 계산에 `eval`/`new Function`을 쓰지 마세요. `evaluate()`의 재귀 하강 파서를 사용합니다.
- 수식 문자열(`expr`)은 항상 ASCII 연산자 `+ - * /`로 저장합니다. `× ÷ −`는 `formatExpr()`가 화면에 표시할 때만 바꿉니다.
- 계산 결과는 `toPlain()`으로 부동소수점 오차(12자리 정밀도)와 지수 표기를 제거한 뒤 사용합니다. `0.1 + 0.2`가 `0.3`으로 나와야 합니다.
- 오류는 예외 대신 `{ error: 'syntax' | 'div0' | 'range' }`를 반환하고, 사용자에게 보이는 메시지는 `app.js`의 `ERRORS`에서 한국어로 관리합니다.
- 화면 문구, 코드 주석은 한국어로 작성합니다.
