---
name: check-calc
description: calc.js의 핵심 계산 동작(우선순위, 0으로 나누기, 소수 오차, 부호 전환 등)을 Node로 자동 점검한다. 계산 로직을 고친 뒤나 "계산기 잘 되는지 확인해줘" 같은 요청에 사용한다.
---

`calc.js`는 DOM 없이 Node에서 불러올 수 있으므로, 아래 스크립트를 프로젝트 루트(`calculator/`)에서 실행해 결과를 확인한다.

```bash
node -e "
const C = require('./calc.js');
const cases = [
  ['우선순위 2+3*4',        () => C.evaluate('2+3*4').value === 14],
  ['나눗셈 10/4',           () => C.evaluate('10/4').value === 2.5],
  ['소수 오차 0.1+0.2',     () => C.toPlain(C.evaluate('0.1+0.2').value) === '0.3'],
  ['0으로 나누기',          () => C.evaluate('5/0').error === 'div0'],
  ['빈 수식',               () => C.evaluate('').error === 'syntax'],
  ['끝의 연산자 무시 5+',   () => C.evaluate('5+').value === 5],
  ['음수 곱셈 5*-3',        () => C.evaluate('5*-3').value === -15],
  ['범위 초과',             () => C.evaluate('99999999999999*99999999999999*99999999').error === 'range'],
  ['연산자 교체 5+ → 5*',   () => C.pressOp('5+', '*') === '5*'],
  ['0 뒤 숫자 덮어쓰기',    () => C.pressDigit('0', '7') === '7'],
  ['점 중복 방지',          () => C.pressDot('1.5') === '1.5'],
  ['부호 전환 5 → -5',      () => C.toggleSign('5') === '-5'],
  ['퍼센트 50 → 0.5',       () => C.percent('50') === '0.5'],
  ['천 단위 쉼표',          () => C.addCommas('1234567.89') === '1,234,567.89'],
  ['표시 기호 변환',        () => C.formatExpr('6*3-2') === '6 × 3 − 2'],
];
let fail = 0;
for (const [name, fn] of cases) {
  let ok = false;
  try { ok = fn(); } catch (e) {}
  console.log((ok ? 'PASS ' : 'FAIL ') + name);
  if (!ok) fail++;
}
console.log(fail ? fail + '개 실패' : '모두 통과');
process.exit(fail ? 1 : 0);
"
```

- 실패한 항목이 있으면 어떤 입력이 어떤 결과를 냈는지 확인해 원인이 `calc.js`인지, 점검 기준(기대값)이 잘못된 것인지 구분해서 알려 준다.
- 새 기능을 `calc.js`에 추가했다면 해당 동작을 확인하는 항목을 위 `cases`에 함께 추가한다.
- 이 스킬은 계산 로직만 확인한다. 화면(`app.js`, `index.html`, `style.css`)은 브라우저에서 직접 열어 확인해야 한다.
