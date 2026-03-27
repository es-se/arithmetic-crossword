const DIFFICULTY_MAP = {
  easy: { label: '簡単', size: 5 },
  normal: { label: '普通', size: 7 },
  advanced: { label: '上級', size: 9 },
  hard: { label: '難問', size: 11 },
  expert: { label: '超難問', size: 13 },
};

const OPERATORS = ['+', '-', '×', '÷'];

const elements = {
  board: document.getElementById('board'),
  difficultySelect: document.getElementById('difficultySelect'),
  ruleSelect: document.getElementById('ruleSelect'),
  newGameButton: document.getElementById('newGameButton'),
  checkButton: document.getElementById('checkButton'),
  clearButton: document.getElementById('clearButton'),
  answerButton: document.getElementById('answerButton'),
  statusMessage: document.getElementById('statusMessage'),
  progressText: document.getElementById('progressText'),
  modal: document.getElementById('numberModal'),
  modalCloseButton: document.getElementById('modalCloseButton'),
  numberGrid: document.getElementById('numberGrid'),
  eraseButton: document.getElementById('eraseButton'),
};

const state = {
  difficulty: elements.difficultySelect.value,
  rule: elements.ruleSelect.value,
  cells: [],
  activeCellId: null,
};

initialize();

function initialize() {
  buildNumberButtons();
  bindEvents();
  createNewPuzzle();
}

function bindEvents() {
  elements.newGameButton.addEventListener('click', createNewPuzzle);
  elements.checkButton.addEventListener('click', checkAnswers);
  elements.clearButton.addEventListener('click', clearInputs);
  elements.answerButton.addEventListener('click', revealAnswer);
  elements.modalCloseButton.addEventListener('click', closeModal);
  elements.eraseButton.addEventListener('click', eraseActiveCell);
  elements.difficultySelect.addEventListener('change', (event) => {
    state.difficulty = event.target.value;
    createNewPuzzle();
  });
  elements.ruleSelect.addEventListener('change', (event) => {
    state.rule = event.target.value;
    createNewPuzzle();
  });
  elements.modal.addEventListener('click', (event) => {
    if (event.target === elements.modal) {
      closeModal();
    }
  });
}

function buildNumberButtons() {
  elements.numberGrid.innerHTML = '';

  for (let i = 0; i <= 9; i += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'number-button';
    button.textContent = String(i);
    button.addEventListener('click', () => applyNumberToActiveCell(String(i)));
    elements.numberGrid.appendChild(button);
  }
}

function createNewPuzzle() {
  const difficulty = DIFFICULTY_MAP[state.difficulty];
  state.cells = generatePuzzle(difficulty.size, state.rule);
  state.activeCellId = null;
  renderBoard();
  updateProgress();
  setStatus(`${difficulty.label} を作成しました。マスをタップして入力してください。`);
}

function generatePuzzle(size, rule) {
  const cells = [];
  const ratio = getHiddenRatio(size);

  for (let row = 0; row < size; row += 1) {
    const rowPattern = row % 2 === 0 ? 'equation' : 'blank';

    for (let col = 0; col < size; col += 1) {
      if (rowPattern === 'equation') {
        cells.push(createEquationRowCell(row, col, size, ratio));
      } else {
        cells.push(createVerticalRowCell(row, col));
      }
    }
  }

  const equations = buildEquationsForGrid(size, rule);

  equations.horizontal.forEach((equation, equationIndex) => {
    const row = equationIndex * 2;
    applyEquationToHorizontalRow(cells, size, row, equation, ratio);
  });

  equations.vertical.forEach((equation, equationIndex) => {
    const col = equationIndex * 2;
    applyEquationToVerticalColumn(cells, size, col, equation, ratio);
  });

  ensureAtLeastOneInput(cells);
  return cells;
}

function createEquationRowCell(row, col) {
  return {
    id: `${row}-${col}`,
    row,
    col,
    kind: 'block',
    display: '',
    solution: '',
    userValue: '',
  };
}

function createVerticalRowCell(row, col) {
  return {
    id: `${row}-${col}`,
    row,
    col,
    kind: 'block',
    display: '',
    solution: '',
    userValue: '',
  };
}

function getHiddenRatio(size) {
  if (size <= 5) return 0.22;
  if (size <= 7) return 0.3;
  if (size <= 9) return 0.38;
  if (size <= 11) return 0.46;
  return 0.52;
}

function buildEquationsForGrid(size, rule) {
  const count = Math.floor(size / 2) + 1;
  const horizontal = [];
  const vertical = [];

  for (let i = 0; i < count; i += 1) {
    horizontal.push(generateEquation(rule));
    vertical.push(generateEquation(rule));
  }

  return { horizontal, vertical };
}

function applyEquationToHorizontalRow(cells, size, row, equation, ratio) {
  const startIndex = row * size;
  const pattern = [
    { kind: 'number', value: String(equation.a) },
    { kind: 'operator', value: equation.operator1 },
    { kind: 'number', value: String(equation.b) },
    { kind: 'operator', value: equation.operator2 },
    { kind: 'number', value: String(equation.c) },
    { kind: 'equal', value: '=' },
    { kind: 'number', value: String(equation.result) },
  ];

  pattern.forEach((entry, index) => {
    if (index >= size) return;
    const cell = cells[startIndex + index];
    const shouldHide = entry.kind === 'number' && Math.random() < ratio;
    cell.kind = shouldHide ? 'input' : entry.kind;
    cell.display = shouldHide ? '' : entry.value;
    cell.solution = entry.kind === 'number' ? entry.value : '';
    cell.userValue = '';
  });
}

function applyEquationToVerticalColumn(cells, size, col, equation, ratio) {
  const pattern = [
    { kind: 'number', value: String(equation.a) },
    { kind: 'operator', value: equation.operator1 },
    { kind: 'number', value: String(equation.b) },
    { kind: 'operator', value: equation.operator2 },
    { kind: 'number', value: String(equation.c) },
    { kind: 'equal', value: '=' },
    { kind: 'number', value: String(equation.result) },
  ];

  pattern.forEach((entry, index) => {
    if (index >= size) return;
    const row = index;
    const cell = cells[row * size + col];

    if (cell.kind === 'input') return;
    if (entry.kind === 'number' && cell.kind === 'number' && cell.display !== entry.value) return;
    if (cell.kind === 'operator' || cell.kind === 'equal') return;

    if (entry.kind === 'number') {
      const shouldHide = Math.random() < ratio && row % 2 === 0;
      cell.kind = shouldHide ? 'input' : 'number';
      cell.display = shouldHide ? '' : entry.value;
      cell.solution = entry.value;
      cell.userValue = '';
      return;
    }

    cell.kind = entry.kind;
    cell.display = entry.value;
    cell.solution = '';
    cell.userValue = '';
  });
}

function ensureAtLeastOneInput(cells) {
  if (cells.some((cell) => cell.kind === 'input')) return;

  const firstNumber = cells.find((cell) => cell.kind === 'number' && cell.solution);
  if (!firstNumber) return;
  firstNumber.kind = 'input';
  firstNumber.display = '';
}

function generateEquation(rule) {
  for (let i = 0; i < 300; i += 1) {
    const operator1 = sample(OPERATORS);
    const operator2 = sample(OPERATORS);
    const a = randomDigit(operator1 === '÷');
    const b = randomDigit(operator1 === '÷');
    const c = randomDigit(operator2 === '÷');

    if (operator1 === '÷' && b === 0) continue;
    if (operator2 === '÷' && c === 0) continue;

    const value = evaluateExpression(a, operator1, b, operator2, c, rule);
    if (!Number.isInteger(value)) continue;
    if (value < 0 || value > 9) continue;

    return { a, operator1, b, operator2, c, result: value };
  }

  return { a: 1, operator1: '+', b: 2, operator2: '+', c: 3, result: 6 };
}

function randomDigit(preferNonZero = false) {
  const min = preferNonZero ? 1 : 0;
  return Math.floor(Math.random() * (10 - min)) + min;
}

function sample(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function evaluateExpression(a, operator1, b, operator2, c, rule) {
  if (rule === 'leftToRight') {
    return applyOperator(applyOperator(a, operator1, b), operator2, c);
  }

  const precedence1 = getPrecedence(operator1);
  const precedence2 = getPrecedence(operator2);

  if (precedence2 > precedence1) {
    const tail = applyOperator(b, operator2, c);
    return applyOperator(a, operator1, tail);
  }

  const head = applyOperator(a, operator1, b);
  return applyOperator(head, operator2, c);
}

function getPrecedence(operator) {
  return operator === '×' || operator === '÷' ? 2 : 1;
}

function applyOperator(left, operator, right) {
  if (!Number.isFinite(left) || !Number.isFinite(right)) return Number.NaN;

  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      if (right === 0) return Number.NaN;
      return left / right;
    default:
      return Number.NaN;
  }
}

function renderBoard() {
  const size = DIFFICULTY_MAP[state.difficulty].size;
  elements.board.innerHTML = '';
  elements.board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  state.cells.forEach((cell) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `cell ${cell.kind}`;
    button.dataset.cellId = cell.id;
    button.textContent = getCellText(cell);
    button.disabled = cell.kind !== 'input';

    if (cell.kind === 'input') {
      if (state.activeCellId === cell.id) {
        button.classList.add('is-active');
      }
      if (cell.isWrong) {
        button.classList.add('is-wrong');
      }
      button.addEventListener('click', () => openModal(cell.id));
    }

    if (cell.kind === 'block') {
      button.setAttribute('aria-hidden', 'true');
    }

    elements.board.appendChild(button);
  });
}

function getCellText(cell) {
  if (cell.kind === 'input') return cell.userValue || '・';
  return cell.display || '';
}

function openModal(cellId) {
  state.activeCellId = cellId;
  renderBoard();
  elements.modal.classList.remove('hidden');
}

function closeModal() {
  state.activeCellId = null;
  elements.modal.classList.add('hidden');
  renderBoard();
}

function applyNumberToActiveCell(value) {
  const cell = state.cells.find((item) => item.id === state.activeCellId);
  if (!cell) return;

  cell.userValue = value;
  cell.isWrong = false;
  updateProgress();
  renderBoard();
  closeModal();
}

function eraseActiveCell() {
  const cell = state.cells.find((item) => item.id === state.activeCellId);
  if (!cell) return;
  cell.userValue = '';
  cell.isWrong = false;
  updateProgress();
  renderBoard();
  closeModal();
}

function checkAnswers() {
  const inputs = state.cells.filter((cell) => cell.kind === 'input');
  let solved = 0;

  inputs.forEach((cell) => {
    const correct = cell.userValue === cell.solution;
    cell.isWrong = Boolean(cell.userValue) && !correct;
    if (correct) solved += 1;
  });

  renderBoard();
  updateProgress();

  if (solved === inputs.length && inputs.length > 0) {
    setStatus('すべて正解です。お見事です。');
    return;
  }

  setStatus(`チェック完了。正解 ${solved} / ${inputs.length} です。`);
}

function clearInputs() {
  state.cells.forEach((cell) => {
    if (cell.kind === 'input') {
      cell.userValue = '';
      cell.isWrong = false;
    }
  });
  renderBoard();
  updateProgress();
  setStatus('入力を消しました。');
}

function revealAnswer() {
  state.cells.forEach((cell) => {
    if (cell.kind === 'input') {
      cell.userValue = cell.solution;
      cell.isWrong = false;
    }
  });
  renderBoard();
  updateProgress();
  setStatus('答えを表示しました。');
}

function updateProgress() {
  const inputs = state.cells.filter((cell) => cell.kind === 'input');
  const filled = inputs.filter((cell) => cell.userValue !== '').length;
  elements.progressText.textContent = `${filled} / ${inputs.length}`;
}

function setStatus(message) {
  elements.statusMessage.textContent = message;
}
