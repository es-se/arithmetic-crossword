(function () {
  'use strict';

  const LAYOUT = [
    [n('a'), op('+'), n('b'), eq(), n('c'), null, n('d'), op('-'), n('e'), eq(), n('f')],
    [op('÷'), null, null, null, op('-'), null, op('-'), null, null, null, op('÷')],
    [n('g'), null, n('h'), op('+'), n('i'), op('-'), n('j'), eq(), n('k'), null, n('l')],
    [eq(), null, op('-'), null, eq(), null, eq(), null, op('+'), null, eq()],
    [n('m'), op('-'), n('n'), eq(), n('o'), null, n('p'), op('+'), n('q'), eq(), n('r')],
    [null, null, op('-'), null, null, null, null, null, op('+'), null, null],
    [n('s'), op('÷'), n('t'), eq(), n('u'), null, n('v'), op('+'), n('w'), eq(), n('xv')],
    [op('x'), null, eq(), null, op('+'), null, op('÷'), null, eq(), null, op('x')],
    [n('y'), null, n('z'), op('+'), n('aa'), op('-'), n('ab'), eq(), n('ac'), null, n('ad')],
    [eq(), null, null, null, eq(), null, eq(), null, null, null, eq()],
    [n('ae'), op('÷'), n('af'), eq(), n('ag'), null, n('ah'), op('x'), n('ai'), eq(), n('aj')]
  ];

  const EQUATIONS = [
    { id: 'R0L', tokens: ['a', '+', 'b', '=', 'c'] },
    { id: 'R0R', tokens: ['d', '-', 'e', '=', 'f'] },
    { id: 'R2', tokens: ['h', '+', 'i', '-', 'j', '=', 'k'] },
    { id: 'R4L', tokens: ['m', '-', 'n', '=', 'o'] },
    { id: 'R4R', tokens: ['p', '+', 'q', '=', 'r'] },
    { id: 'R6L', tokens: ['s', '÷', 't', '=', 'u'] },
    { id: 'R6R', tokens: ['v', '+', 'w', '=', 'xv'] },
    { id: 'R8', tokens: ['z', '+', 'aa', '-', 'ab', '=', 'ac'] },
    { id: 'R10L', tokens: ['ae', '÷', 'af', '=', 'ag'] },
    { id: 'R10R', tokens: ['ah', 'x', 'ai', '=', 'aj'] },
    { id: 'C0T', tokens: ['a', '÷', 'g', '=', 'm'] },
    { id: 'C0B', tokens: ['s', 'x', 'y', '=', 'ae'] },
    { id: 'C2', tokens: ['h', '-', 'n', '-', 't', '=', 'z'] },
    { id: 'C4T', tokens: ['c', '-', 'i', '=', 'o'] },
    { id: 'C4B', tokens: ['u', '+', 'aa', '=', 'ag'] },
    { id: 'C6T', tokens: ['d', '-', 'j', '=', 'p'] },
    { id: 'C6B', tokens: ['v', '÷', 'ab', '=', 'ah'] },
    { id: 'C8', tokens: ['k', '+', 'q', '+', 'w', '=', 'ac'] },
    { id: 'C10T', tokens: ['f', '÷', 'l', '=', 'r'] },
    { id: 'C10B', tokens: ['xv', 'x', 'ad', '=', 'aj'] }
  ];

  const DIFFICULTIES = {
    easy: { label: '簡単', hideCount: 8, minVisiblePerEquation: 2 },
    normal: { label: '普通', hideCount: 12, minVisiblePerEquation: 2 },
    advanced: { label: '上級', hideCount: 16, minVisiblePerEquation: 1 },
    hard: { label: '難問', hideCount: 20, minVisiblePerEquation: 1 },
    expert: { label: '超難問', hideCount: 21, minVisiblePerEquation: 1 }
  };

  const SAMPLE_FALLBACK = {
    a: 12, b: 3, c: 15, d: 21, e: 3, f: 18,
    g: 3, h: 12, i: 13, j: 16, k: 9, l: 1,
    m: 4, n: 2, o: 2, p: 5, q: 4, r: 9,
    s: 4, t: 2, u: 2, v: 9, w: 7, xv: 16,
    y: 2, z: 5, aa: 14, ab: 3, ac: 16, ad: 15,
    ae: 8, af: 4, ag: 2, ah: 3, ai: 5, aj: 15
  };

  const NUMBER_KEYS = Array.from(new Set(LAYOUT.flat().filter(Boolean).filter((cell) => cell.kind === 'number').map((cell) => cell.key)));
  const EQUATION_KEYS = EQUATIONS.map((equation) => equation.tokens.filter((token) => isNumberKey(token)));
  const KEY_TO_EQUATIONS = buildKeyToEquations();

  function n(key) {
    return { kind: 'number', key };
  }

  function op(value) {
    return { kind: 'operator', value };
  }

  function eq() {
    return { kind: 'equal', value: '=' };
  }

  function isNumberKey(token) {
    return typeof token === 'string' && !['+', '-', 'x', '÷', '='].includes(token);
  }

  function buildKeyToEquations() {
    const map = {};
    NUMBER_KEYS.forEach((key) => {
      map[key] = [];
    });
    EQUATIONS.forEach((equation, index) => {
      equation.tokens.forEach((token) => {
        if (isNumberKey(token)) {
          map[token].push(index);
        }
      });
    });
    return map;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function evaluateExpression(values, mode) {
    if (!values.length) {
      return NaN;
    }

    const numbers = [];
    const operators = [];

    values.forEach((token, index) => {
      if (index % 2 === 0) {
        numbers.push(Number(token));
      } else {
        operators.push(token);
      }
    });

    if (numbers.some((value) => Number.isNaN(value))) {
      return NaN;
    }

    if (mode === 'leftToRight') {
      let result = numbers[0];
      operators.forEach((operator, index) => {
        result = applyOperator(result, operator, numbers[index + 1]);
      });
      return result;
    }

    const collapsedNumbers = [numbers[0]];
    const collapsedOperators = [];

    operators.forEach((operator, index) => {
      const nextNumber = numbers[index + 1];
      if (operator === 'x' || operator === '÷') {
        const previous = collapsedNumbers.pop();
        collapsedNumbers.push(applyOperator(previous, operator, nextNumber));
      } else {
        collapsedOperators.push(operator);
        collapsedNumbers.push(nextNumber);
      }
    });

    let result = collapsedNumbers[0];
    collapsedOperators.forEach((operator, index) => {
      result = applyOperator(result, operator, collapsedNumbers[index + 1]);
    });
    return result;
  }

  function applyOperator(left, operator, right) {
    switch (operator) {
      case '+': return left + right;
      case '-': return left - right;
      case 'x': return left * right;
      case '÷': return right === 0 ? NaN : left / right;
      default: return NaN;
    }
  }

  function evaluateEquation(valuesByKey, equation, mode) {
    const equalIndex = equation.tokens.indexOf('=');
    const leftTokens = equation.tokens.slice(0, equalIndex).map((token) => (isNumberKey(token) ? valuesByKey[token] : token));
    const rightTokens = equation.tokens.slice(equalIndex + 1).map((token) => (isNumberKey(token) ? valuesByKey[token] : token));

    if (leftTokens.some((token) => token === null || token === undefined || token === '')) {
      return false;
    }
    if (rightTokens.some((token) => token === null || token === undefined || token === '')) {
      return false;
    }

    const leftValue = evaluateExpression(leftTokens, mode);
    const rightValue = evaluateExpression(rightTokens, mode);
    return Number.isFinite(leftValue) && Number.isFinite(rightValue) && Math.abs(leftValue - rightValue) < 1e-9;
  }

  function verifySolution(solution) {
    return EQUATIONS.every((equation) => evaluateEquation(solution, equation, 'precedence'));
  }

  function generateSolution() {
    for (let attempt = 0; attempt < 5000; attempt += 1) {
      const g = randInt(2, 9);
      const m = randInt(6, 18);
      const a = g * m;
      const b = randInt(1, 9);
      const c = a + b;
      if (c > 99) {
        continue;
      }

      const oMax = Math.min(m - 1, c - 1, 18);
      if (oMax < 1) {
        continue;
      }
      const o = randInt(1, oMax);
      const i = c - o;
      const nValue = m - o;
      if (nValue < 1 || i < 1) {
        continue;
      }

      const t = randInt(2, 6);
      const u = randInt(1, 9);
      const s = t * u;
      const aa = u * (t - 1);
      const y = randInt(1, 9);
      const af = y;
      const ae = s * y;
      const ag = s;
      if ([s, aa, ae, ag].some((value) => value > 99)) {
        continue;
      }

      const ab = randInt(1, 9);
      const ah = randInt(1, 9);
      const beta = randInt(1, 4);
      const w = ah * beta;
      const v = ab * ah;
      const xv = v + w;
      const ad = randInt(1, 9);
      const ai = ad * (ab + beta);
      const aj = xv * ad;
      if ([w, v, xv, ai, aj].some((value) => value > 99)) {
        continue;
      }

      const q = randInt(1, 9);
      const j = i + nValue + t + ab + q + w - aa;
      if (j < 2 || j > 90) {
        continue;
      }

      const zMin = Math.max(1, ab + q + w - aa + 1);
      const zMax = Math.min(28, 99);
      if (zMin > zMax) {
        continue;
      }
      const z = randInt(zMin, zMax);
      const k = z + aa - ab - q - w;
      if (k < 1 || k > 99) {
        continue;
      }
      const h = z + nValue + t;
      if (h > 99) {
        continue;
      }

      let p;
      let l;
      let r;
      let f;
      let e;
      let d;
      let topRightOk = false;
      for (let inner = 0; inner < 60 && !topRightOk; inner += 1) {
        p = randInt(1, 9);
        l = randInt(1, 3);
        r = p + q;
        f = l * r;
        d = j + p;
        e = d - f;
        if (e >= 1 && d <= 99 && f <= 99) {
          topRightOk = true;
        }
      }
      if (!topRightOk) {
        continue;
      }

      const pValue = p;
      const ac = z + aa - ab;
      if (ac < 1 || ac > 99) {
        continue;
      }

      const candidate = {
        a, b, c,
        d, e, f,
        g,
        h, i, j, k,
        l,
        m,
        n: nValue,
        o,
        p: pValue,
        q,
        r,
        s, t, u,
        v, w, xv,
        y,
        z,
        aa, ab, ac,
        ad,
        ae, af, ag,
        ah, ai, aj
      };

      if (Object.values(candidate).some((value) => !Number.isInteger(value) || value < 0 || value > 99)) {
        continue;
      }

      if (verifySolution(candidate)) {
        return candidate;
      }
    }

    return { ...SAMPLE_FALLBACK };
  }

  function buildHiddenSet(solution, difficultyKey) {
    const config = DIFFICULTIES[difficultyKey] || DIFFICULTIES.normal;
    const hidden = new Set();
    const visibleCounts = EQUATION_KEYS.map((keys) => keys.length);
    const phases = [config.minVisiblePerEquation, 1];

    phases.forEach((minimumVisible) => {
      if (hidden.size >= config.hideCount) {
        return;
      }
      shuffle(NUMBER_KEYS).forEach((key) => {
        if (hidden.size >= config.hideCount || hidden.has(key)) {
          return;
        }
        const canHide = KEY_TO_EQUATIONS[key].every((equationIndex) => visibleCounts[equationIndex] - 1 >= minimumVisible);
        if (!canHide) {
          return;
        }
        hidden.add(key);
        KEY_TO_EQUATIONS[key].forEach((equationIndex) => {
          visibleCounts[equationIndex] -= 1;
        });
      });
    });

    return hidden;
  }

  function buildPuzzleState(difficultyKey) {
    const solution = generateSolution();
    const hidden = buildHiddenSet(solution, difficultyKey);
    const given = {};
    const user = {};
    NUMBER_KEYS.forEach((key) => {
      if (!hidden.has(key)) {
        given[key] = solution[key];
      } else {
        user[key] = '';
      }
    });
    return {
      solution,
      hidden,
      given,
      user,
      difficultyKey
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      LAYOUT,
      EQUATIONS,
      DIFFICULTIES,
      evaluateExpression,
      evaluateEquation,
      generateSolution,
      buildHiddenSet,
      buildPuzzleState,
      verifySolution
    };
  }

  if (typeof document === 'undefined') {
    return;
  }

  const elements = {
    board: document.getElementById('board'),
    difficultySelect: document.getElementById('difficultySelect'),
    calcModeSelect: document.getElementById('calcModeSelect'),
    newGameBtn: document.getElementById('newGameBtn'),
    checkBtn: document.getElementById('checkBtn'),
    clearBtn: document.getElementById('clearBtn'),
    showAnswerBtn: document.getElementById('showAnswerBtn'),
    statusText: document.getElementById('statusText'),
    progressText: document.getElementById('progressText'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    modalDisplay: document.getElementById('modalDisplay'),
    modalTargetLabel: document.getElementById('modalTargetLabel'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalClearBtn: document.getElementById('modalClearBtn'),
    modalBackspaceBtn: document.getElementById('modalBackspaceBtn'),
    modalConfirmBtn: document.getElementById('modalConfirmBtn'),
    keypad: document.getElementById('keypad')
  };

  const state = {
    puzzle: null,
    activeKey: null,
    modalBuffer: '',
    revealed: false,
    validation: {}
  };

  function init() {
    buildKeypad();
    bindEvents();
    createNewPuzzle();
  }

  function buildKeypad() {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    keys.forEach((digit) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = digit;
      button.dataset.digit = digit;
      elements.keypad.appendChild(button);
    });
  }

  function bindEvents() {
    elements.newGameBtn.addEventListener('click', createNewPuzzle);
    elements.checkBtn.addEventListener('click', checkAnswers);
    elements.clearBtn.addEventListener('click', clearInputs);
    elements.showAnswerBtn.addEventListener('click', showAnswers);
    elements.modalCloseBtn.addEventListener('click', closeModal);
    elements.modalBackdrop.addEventListener('click', (event) => {
      if (event.target === elements.modalBackdrop) {
        closeModal();
      }
    });
    elements.modalClearBtn.addEventListener('click', () => {
      state.modalBuffer = '';
      renderModalDisplay();
    });
    elements.modalBackspaceBtn.addEventListener('click', () => {
      state.modalBuffer = state.modalBuffer.slice(0, -1);
      renderModalDisplay();
    });
    elements.modalConfirmBtn.addEventListener('click', commitModalValue);
    elements.keypad.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-digit]');
      if (!button) {
        return;
      }
      if (state.modalBuffer.length >= 2) {
        return;
      }
      state.modalBuffer += button.dataset.digit;
      renderModalDisplay();
    });
  }

  function createNewPuzzle() {
    const difficultyKey = elements.difficultySelect.value;
    state.puzzle = buildPuzzleState(difficultyKey);
    state.activeKey = null;
    state.modalBuffer = '';
    state.revealed = false;
    state.validation = {};
    renderBoard();
    updateStatus(`新しい問題を作成しました。難易度：${DIFFICULTIES[difficultyKey].label}`);
    updateProgress();
    closeModal();
  }

  function renderBoard() {
    elements.board.innerHTML = '';

    LAYOUT.forEach((row) => {
      row.forEach((cell) => {
        const cellElement = document.createElement('div');
        cellElement.className = 'cell';

        if (!cell) {
          cellElement.classList.add('blank');
          elements.board.appendChild(cellElement);
          return;
        }

        if (cell.kind === 'operator') {
          cellElement.classList.add('operator');
          cellElement.textContent = cell.value;
          elements.board.appendChild(cellElement);
          return;
        }

        if (cell.kind === 'equal') {
          cellElement.classList.add('equal');
          cellElement.textContent = '=';
          elements.board.appendChild(cellElement);
          return;
        }

        const key = cell.key;
        const hidden = state.puzzle.hidden.has(key);
        cellElement.classList.add('number');
        cellElement.dataset.key = key;

        if (hidden && !state.revealed) {
          cellElement.classList.add('input');
          const value = state.puzzle.user[key];
          cellElement.textContent = value === '' ? '　' : String(value);
          if (value === '') {
            cellElement.classList.add('empty');
          }
          if (state.activeKey === key) {
            cellElement.classList.add('active');
          }
          if (state.validation[key]) {
            cellElement.classList.add(state.validation[key]);
          }
          cellElement.tabIndex = 0;
          cellElement.setAttribute('role', 'button');
          cellElement.setAttribute('aria-label', `${key} の入力マス`);
          cellElement.addEventListener('click', () => openModal(key));
        } else {
          cellElement.classList.add('given');
          cellElement.textContent = String(state.puzzle.solution[key]);
        }

        elements.board.appendChild(cellElement);
      });
    });
  }

  function openModal(key) {
    state.activeKey = key;
    const current = state.puzzle.user[key];
    state.modalBuffer = current === '' ? '' : String(current);
    elements.modalBackdrop.classList.remove('hidden');
    elements.modalBackdrop.setAttribute('aria-hidden', 'false');
    elements.modalTargetLabel.textContent = `対象マス：${key}`;
    renderModalDisplay();
    renderBoard();
  }

  function renderModalDisplay() {
    elements.modalDisplay.textContent = state.modalBuffer || ' '; 
    elements.modalDisplay.classList.toggle('empty', state.modalBuffer === '');
  }

  function commitModalValue() {
    if (!state.activeKey) {
      closeModal();
      return;
    }
    const normalized = state.modalBuffer === '' ? '' : String(Math.min(99, Number(state.modalBuffer)));
    state.puzzle.user[state.activeKey] = normalized;
    delete state.validation[state.activeKey];
    updateProgress();
    renderBoard();
    closeModal();
  }

  function closeModal() {
    state.activeKey = null;
    state.modalBuffer = '';
    elements.modalBackdrop.classList.add('hidden');
    elements.modalBackdrop.setAttribute('aria-hidden', 'true');
    renderBoard();
  }

  function collectCurrentValues() {
    const values = { ...state.puzzle.solution };
    state.puzzle.hidden.forEach((key) => {
      const value = state.revealed ? state.puzzle.solution[key] : state.puzzle.user[key];
      values[key] = value === '' ? '' : Number(value);
    });
    return values;
  }

  function checkAnswers() {
    state.revealed = false;
    const currentValues = collectCurrentValues();
    let correctCount = 0;
    let filledCount = 0;
    const validation = {};

    state.puzzle.hidden.forEach((key) => {
      const current = currentValues[key];
      if (current !== '') {
        filledCount += 1;
      }
      if (current !== '' && Number(current) === Number(state.puzzle.solution[key])) {
        validation[key] = 'correct';
        correctCount += 1;
      } else if (current === '') {
        validation[key] = '';
      } else {
        validation[key] = 'wrong';
      }
    });

    state.validation = validation;
    const mode = elements.calcModeSelect.value;
    const satisfied = EQUATIONS.filter((equation) => evaluateEquation(currentValues, equation, mode)).length;
    const total = EQUATIONS.length;

    if (correctCount === state.puzzle.hidden.size && state.puzzle.hidden.size > 0) {
      updateStatus(`正解です。${total} 本中 ${satisfied} 本の式が成立しています。`);
    } else {
      updateStatus(`入力一致 ${correctCount} / ${state.puzzle.hidden.size}、式成立 ${satisfied} / ${total} です。`);
    }
    renderBoard();
  }

  function clearInputs() {
    state.revealed = false;
    state.validation = {};
    state.puzzle.hidden.forEach((key) => {
      state.puzzle.user[key] = '';
    });
    updateStatus('入力をクリアしました。');
    updateProgress();
    renderBoard();
  }

  function showAnswers() {
    state.revealed = true;
    state.validation = {};
    updateStatus('答えを表示しています。');
    updateProgress();
    renderBoard();
    closeModal();
  }

  function updateStatus(message) {
    elements.statusText.textContent = message;
  }

  function updateProgress() {
    const total = state.puzzle.hidden.size;
    const filled = Array.from(state.puzzle.hidden).filter((key) => state.puzzle.user[key] !== '').length;
    elements.progressText.textContent = `${filled} / ${total}`;
  }

  init();
})();
