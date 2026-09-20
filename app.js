(function () {
  const C = window.Calc;
  const exprEl = document.getElementById('expr');
  const resultEl = document.getElementById('result');
  const keysEl = document.getElementById('keys');

  const ERRORS = {
    div0: '0으로 나눌 수 없어요',
    range: '숫자가 너무 커요',
    syntax: '올바르지 않은 수식이에요',
  };

  let expr = '';
  let label = '';      // 직전 계산식 (= 누른 뒤 위쪽에 표시)
  let evaluated = false;
  let error = null;

  function sizeFor(text) {
    const n = text.length;
    if (n > 20) return 'xs';
    if (n > 14) return 'sm';
    if (n > 9) return 'md';
    return 'lg';
  }

  function render() {
    const tokens = C.tokenize(expr);
    const hasOp = tokens.some((t, i) => C.isOp(t) && i > 0);
    let big;

    if (error) {
      big = ERRORS[error];
    } else if (!expr) {
      big = '0';
    } else if (!hasOp) {
      big = C.formatExpr(expr);              // 숫자 하나만 입력 중이면 그대로 표시
    } else {
      const r = C.evaluate(expr);
      big = r.error ? C.formatExpr(expr) : C.addCommas(C.toPlain(r.value));
    }

    exprEl.textContent = evaluated ? label : (hasOp ? C.formatExpr(expr) : '');
    resultEl.textContent = big;
    resultEl.classList.toggle('is-error', !!error);
    resultEl.dataset.size = error ? '' : sizeFor(big);
  }

  function reset() {
    expr = ''; label = ''; evaluated = false; error = null;
  }

  // 계산 후/오류 상태에서 새 입력이 오면 정리
  function beforeInput(kind) {
    if (error) reset();
    if (evaluated && kind === 'new') { expr = ''; label = ''; evaluated = false; }
    else if (evaluated) { label = ''; evaluated = false; }
  }

  function press(action, value) {
    switch (action) {
      case 'digit':   beforeInput('new'); expr = C.pressDigit(expr, value); break;
      case 'dot':     beforeInput('new'); expr = C.pressDot(expr); break;
      case 'op':      beforeInput('continue'); expr = C.pressOp(expr, value); break;
      case 'sign':    beforeInput('continue'); expr = C.toggleSign(expr); break;
      case 'percent': beforeInput('continue'); expr = C.percent(expr); break;
      case 'back':    beforeInput('continue'); expr = C.backspace(expr); break;
      case 'clear':   reset(); break;
      case 'equals': {
        if (!expr || error) break;
        const r = C.evaluate(expr);
        if (r.error) { error = r.error; break; }
        label = C.formatExpr(expr.replace(/[+\-*/]+$/, '')) + ' =';
        expr = C.toPlain(r.value);
        evaluated = true;
        break;
      }
    }
    render();
  }

  keysEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    press(btn.dataset.action, btn.dataset.value);
  });

  // 키보드 입력
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (/^\d$/.test(k)) press('digit', k);
    else if (k === '.' || k === ',') press('dot');
    else if (['+', '-', '*', '/'].includes(k)) { e.preventDefault(); press('op', k); }
    else if (k === 'x' || k === 'X') press('op', '*');
    else if (k === '%') press('percent');
    else if (k === 'Enter' || k === '=') { e.preventDefault(); press('equals'); }
    else if (k === 'Backspace') press('back');
    else if (k === 'Escape' || k === 'Delete') press('clear');
    else return;
  });

  render();
})();
