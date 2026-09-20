// 계산기 로직 (DOM과 무관한 순수 함수 모음)
(function (root) {
  const OPS = '+-*/';
  const NUM = /\d+\.?\d*|\.\d+/g;
  const isOp = (c) => c !== undefined && c !== '' && OPS.includes(c);
  const MAX_DIGITS = 15;

  function tokenize(s) {
    return s.match(/\d+\.?\d*|\.\d+|[+\-*/]/g) || [];
  }

  // 사칙연산 우선순위를 지키는 재귀 하강 파서 (eval 미사용)
  // 반환: { value } | { error: 'syntax' | 'div0' | 'range' }
  function evaluate(expr) {
    const t = tokenize(expr);
    while (t.length && isOp(t[t.length - 1])) t.pop();
    if (!t.length) return { error: 'syntax' };

    let i = 0;
    const fail = () => { throw new Error('syntax'); };

    function unary() {
      const x = t[i];
      if (x === undefined) fail();
      if (x === '-') { i++; return -unary(); }
      if (x === '+') { i++; return unary(); }
      const n = parseFloat(x);
      if (Number.isNaN(n)) fail();
      i++;
      return n;
    }
    function term() {
      let v = unary();
      while (t[i] === '*' || t[i] === '/') {
        const op = t[i++];
        const r = unary();
        v = op === '*' ? v * r : v / r;
      }
      return v;
    }
    function sum() {
      let v = term();
      while (t[i] === '+' || t[i] === '-') {
        const op = t[i++];
        const r = term();
        v = op === '+' ? v + r : v - r;
      }
      return v;
    }

    try {
      const v = sum();
      if (i < t.length) fail();
      if (Number.isNaN(v) || !Number.isFinite(v)) return { error: 'div0' };
      if (toPlain(v) === null) return { error: 'range' };
      return { value: v };
    } catch (e) {
      return { error: 'syntax' };
    }
  }

  // 부동소수점 오차 제거 + 지수 표기 없는 문자열로 변환 (범위 초과 시 null)
  function toPlain(n) {
    const r = parseFloat(n.toPrecision(12));
    if (r === 0) return '0';
    let s = String(r);
    if (s.includes('e')) {
      if (Math.abs(r) >= 1e21) return null;
      if (Math.abs(r) < 1) s = r.toFixed(15).replace(/0+$/, '').replace(/\.$/, '');
    }
    return s;
  }

  const lastNumber = (expr) => expr.match(/\d*\.?\d*$/)[0];

  function pressDigit(expr, d) {
    const seg = lastNumber(expr);
    if (seg === '0') return expr.slice(0, -1) + d;
    if (seg.replace('.', '').length >= MAX_DIGITS) return expr;
    return expr + d;
  }

  function pressDot(expr) {
    const seg = lastNumber(expr);
    if (seg.includes('.')) return expr;
    return seg === '' ? expr + '0.' : expr + '.';
  }

  function pressOp(expr, op) {
    if (expr === '') return op === '-' ? '-' : '';
    const last = expr.slice(-1);
    if (isOp(last)) {
      if (op === '-' && (last === '*' || last === '/')) return expr + op; // 예: 5×-3
      let e = expr;
      while (e && isOp(e.slice(-1))) e = e.slice(0, -1);
      if (e === '') return op === '-' ? '-' : '';
      return e + op;
    }
    return expr + op;
  }

  function toggleSign(expr) {
    const seg = lastNumber(expr);
    if (!seg) return expr;
    const i = expr.length - seg.length;
    const prev = expr[i - 1];
    const prev2 = expr[i - 2];
    if (prev === '-' && (i - 1 === 0 || isOp(prev2))) return expr.slice(0, i - 1) + expr.slice(i); // 단항 음수 제거
    if (prev === '-') return expr.slice(0, i - 1) + '+' + expr.slice(i);
    if (prev === '+') return expr.slice(0, i - 1) + '-' + expr.slice(i);
    return expr.slice(0, i) + '-' + expr.slice(i);
  }

  function percent(expr) {
    const seg = lastNumber(expr);
    if (!seg) return expr;
    const v = toPlain(parseFloat(seg) / 100);
    return v === null ? expr : expr.slice(0, expr.length - seg.length) + v;
  }

  function backspace(expr) {
    return expr.slice(0, -1);
  }

  // ---- 표시용 포맷 ----
  function addCommas(numStr) {
    const [int, dec] = numStr.split('.');
    const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return dec === undefined ? withCommas : withCommas + '.' + dec;
  }

  const SYMBOL = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  function formatExpr(expr) {
    const t = tokenize(expr);
    let out = '';
    t.forEach((tok, idx) => {
      if (isOp(tok)) {
        const binary = idx > 0 && !isOp(t[idx - 1]);
        out += binary ? ` ${SYMBOL[tok]} ` : SYMBOL[tok];
      } else {
        out += addCommas(tok);
      }
    });
    return out;
  }

  const api = {
    tokenize, evaluate, toPlain, pressDigit, pressDot, pressOp,
    toggleSign, percent, backspace, formatExpr, addCommas, isOp,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Calc = api;
})(typeof window !== 'undefined' ? window : globalThis);
