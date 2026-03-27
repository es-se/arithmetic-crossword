const difficultyMap = {
  easy: { label: "簡単", size: 3, revealRate: 0.42 },
  normal: { label: "普通", size: 4, revealRate: 0.34 },
  advanced: { label: "上級", size: 5, revealRate: 0.28 },
  hard: { label: "難問", size: 6, revealRate: 0.22 },
  expert: { label: "超難問", size: 7, revealRate: 0.18 }
};

const boardArea = document.getElementById("boardArea");
const difficultySelect = document.getElementById("difficultySelect");
const calcModeSelect = document.getElementById("calcModeSelect");
const messageArea = document.getElementById("messageArea");
const progressLabel = document.getElementById("progressLabel");
const selectionLabel = document.getElementById("selectionLabel");
const keypadHint = document.getElementById("keypadHint");
const digitPad = document.getElementById("digitPad");

const state = {
  difficulty: difficultySelect.value,
  calcMode: calcModeSelect.value,
  size: difficultyMap[difficultySelect.value].size,
  solution: [],
  rowOperators: [],
  columnOperators: [],
  rowResults: [],
  columnResults: [],
  revealed: [],
  userGrid: [],
  selected: null,
  gameOver: false
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function applyOperator(left, operator, right) {
  if (operator === "+") return left + right;
  if (operator === "-") return left - right;
  if (operator === "×") return left * right;
  if (operator === "÷") {
    if (right === 0 || left % right !== 0) return null;
    return left / right;
  }
  return null;
}

function evaluateLeftToRight(numbers, operators) {
  let value = numbers[0];
  for (let i = 0; i < operators.length; i += 1) {
    value = applyOperator(value, operators[i], numbers[i + 1]);
    if (value === null) return null;
  }
  return value;
}

function evaluateWithPrecedence(numbers, operators) {
  const nums = [...numbers];
  const ops = [...operators];

  for (let i = 0; i < ops.length; ) {
    if (ops[i] === "×" || ops[i] === "÷") {
      const merged = applyOperator(nums[i], ops[i], nums[i + 1]);
      if (merged === null) return null;
      nums.splice(i, 2, merged);
      ops.splice(i, 1);
    } else {
      i += 1;
    }
  }

  let value = nums[0];
  for (let i = 0; i < ops.length; i += 1) {
    value = applyOperator(value, ops[i], nums[i + 1]);
    if (value === null) return null;
  }
  return value;
}

function evaluateExpression(numbers, operators, calcMode) {
  return calcMode === "precedence"
    ? evaluateWithPrecedence(numbers, operators)
    : evaluateLeftToRight(numbers, operators);
}

function makeOperators(size) {
  const operators = [];
  const pool = ["+", "-", "×", "÷"];
  while (operators.length < size - 1) {
    operators.push(pick(pool));
  }
  return operators;
}

function isValidResult(value, size) {
  const maxAbs = size <= 4 ? 120 : size <= 6 ? 240 : 360;
  return Number.isInteger(value) && value >= -maxAbs && value <= maxAbs;
}

function generateSolution(size) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => randomInt(0, 9))
  );
}

function buildPuzzle(size, calcMode) {
  let attempts = 0;

  while (attempts < 300) {
    attempts += 1;
    const solution = generateSolution(size);
    const rowOperators = [];
    const rowResults = [];
    const columnOperators = [];
    const columnResults = [];
    let ok = true;

    for (let r = 0; r < size; r += 1) {
      let found = false;
      for (let tries = 0; tries < 150; tries += 1) {
        const operators = makeOperators(size);
        const result = evaluateExpression(solution[r], operators, calcMode);
        if (result !== null && isValidResult(result, size)) {
          rowOperators.push(operators);
          rowResults.push(result);
          found = true;
          break;
        }
      }
      if (!found) {
        ok = false;
        break;
      }
    }

    if (!ok) continue;

    for (let c = 0; c < size; c += 1) {
      const numbers = solution.map((row) => row[c]);
      let found = false;
      for (let tries = 0; tries < 150; tries += 1) {
        const operators = makeOperators(size);
        const result = evaluateExpression(numbers, operators, calcMode);
        if (result !== null && isValidResult(result, size)) {
          columnOperators.push(operators);
          columnResults.push(result);
          found = true;
          break;
        }
      }
      if (!found) {
        ok = false;
        break;
      }
    }

    if (ok) {
      return {
        solution,
        rowOperators,
        rowResults,
        columnOperators,
        columnResults
      };
    }
  }

  return buildPuzzle(Math.max(3, size - 1), calcMode);
}

function countTrue(matrix) {
  return matrix.flat().filter(Boolean).length;
}

function createRevealedMask(size, revealRate) {
  const mask = Array.from({ length: size }, () => Array(size).fill(false));
  const positions = [];

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      positions.push({ r, c });
    }
  }

  const minOpen = Math.max(2, Math.floor(size * size * revealRate));
  while (positions.length > 0 && countTrue(mask) < minOpen) {
    const index = randomInt(0, positions.length - 1);
    const pos = positions.splice(index, 1)[0];
    mask[pos.r][pos.c] = true;
  }

  return mask;
}

function formatExpression(operators, result, vertical = false) {
  const joiner = vertical ? "<br>" : " ";
  const marks = [];
  for (let i = 0; i < operators.length + 1; i += 1) {
    marks.push("?");
    if (operators[i]) marks.push(operators[i]);
  }
  marks.push("=");
  marks.push(String(result));
  return marks.join(joiner);
}

function setupDigitPad() {
  digitPad.innerHTML = "";
  for (let digit = 0; digit <= 9; digit += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "digit-btn";
    button.textContent = String(digit);
    button.addEventListener("click", () => setSelectedDigit(digit));
    digitPad.appendChild(button);
  }
}

function newGame() {
  const difficulty = difficultyMap[difficultySelect.value];
  const calcMode = calcModeSelect.value;
  const puzzle = buildPuzzle(difficulty.size, calcMode);
  const revealed = createRevealedMask(difficulty.size, difficulty.revealRate);
  const userGrid = Array.from({ length: difficulty.size }, (_, r) =>
    Array.from({ length: difficulty.size }, (_, c) =>
      revealed[r][c] ? puzzle.solution[r][c] : ""
    )
  );

  state.difficulty = difficultySelect.value;
  state.calcMode = calcMode;
  state.size = difficulty.size;
  state.solution = puzzle.solution;
  state.rowOperators = puzzle.rowOperators;
  state.columnOperators = puzzle.columnOperators;
  state.rowResults = puzzle.rowResults;
  state.columnResults = puzzle.columnResults;
  state.revealed = revealed;
  state.userGrid = userGrid;
  state.selected = null;
  state.gameOver = false;

  const modeLabel = calcMode === "precedence" ? "四則演算優先" : "左から順";
  messageArea.textContent = `${difficulty.label} / ${modeLabel} の問題を作成しました。`;
  keypadHint.textContent = `0〜9 / ${difficulty.size}×${difficulty.size}`;
  renderBoard();
  updateProgress();
  updateSelectionLabel();
}

function renderBoard() {
  const size = state.size;
  boardArea.innerHTML = "";

  const topLayout = document.createElement("div");
  topLayout.className = "top-layout";
  topLayout.style.gridTemplateColumns = `140px repeat(${size * 2 - 1}, minmax(44px, 1fr))`;

  const corner = document.createElement("div");
  corner.className = "blank-cell grid-cell";
  topLayout.appendChild(corner);

  const columnClues = document.createElement("div");
  columnClues.className = "column-clues";
  columnClues.style.gridColumn = `2 / span ${size * 2 - 1}`;
  columnClues.style.gridTemplateColumns = `repeat(${size * 2 - 1}, minmax(44px, 1fr))`;

  for (let c = 0; c < size; c += 1) {
    const clue = document.createElement("div");
    clue.className = "column-clue";
    clue.innerHTML = `<div><span>縦${c + 1}</span><div class="equation">${formatExpression(state.columnOperators[c], state.columnResults[c], true)}</div></div>`;
    clue.style.gridColumn = `${c * 2 + 1} / span 1`;
    columnClues.appendChild(clue);

    if (c < size - 1) {
      const blank = document.createElement("div");
      blank.className = "blank-cell grid-cell";
      columnClues.appendChild(blank);
    }
  }

  topLayout.appendChild(columnClues);
  boardArea.appendChild(topLayout);

  const bodyLayout = document.createElement("div");
  bodyLayout.className = "body-layout";
  bodyLayout.style.gridTemplateColumns = `140px repeat(${size * 2 - 1}, minmax(44px, 1fr))`;

  const rowClues = document.createElement("div");
  rowClues.className = "row-clues";
  rowClues.style.gridTemplateRows = `repeat(${size * 2 - 1}, minmax(44px, 1fr))`;

  for (let r = 0; r < size; r += 1) {
    const rowClue = document.createElement("div");
    rowClue.className = "row-clue";
    rowClue.innerHTML = `<div><span>横${r + 1}</span><div class="equation">${formatExpression(state.rowOperators[r], state.rowResults[r], false)}</div></div>`;
    rowClue.style.gridRow = `${r * 2 + 1} / span 1`;
    rowClues.appendChild(rowClue);

    if (r < size - 1) {
      const blank = document.createElement("div");
      blank.className = "blank-cell grid-cell";
      rowClues.appendChild(blank);
    }
  }

  bodyLayout.appendChild(rowClues);

  const playGrid = document.createElement("div");
  playGrid.className = "play-grid";
  playGrid.style.gridColumn = `2 / span ${size * 2 - 1}`;
  playGrid.style.gridTemplateColumns = `repeat(${size * 2 - 1}, minmax(44px, 1fr))`;
  playGrid.style.gridTemplateRows = `repeat(${size * 2 - 1}, minmax(44px, 1fr))`;

  for (let rr = 0; rr < size; rr += 1) {
    for (let cc = 0; cc < size; cc += 1) {
      const digitCell = document.createElement("button");
      digitCell.type = "button";
      digitCell.className = "grid-cell digit-cell";
      if (state.revealed[rr][cc]) digitCell.classList.add("fixed");
      if (state.selected && state.selected.r === rr && state.selected.c === cc) {
        digitCell.classList.add("selected");
      }
      if (
        state.userGrid[rr][cc] !== "" &&
        !state.revealed[rr][cc] &&
        state.userGrid[rr][cc] !== state.solution[rr][cc]
      ) {
        digitCell.classList.add("wrong");
      }
      digitCell.textContent = state.userGrid[rr][cc] === "" ? "" : String(state.userGrid[rr][cc]);
      digitCell.dataset.row = String(rr);
      digitCell.dataset.col = String(cc);
      digitCell.setAttribute("aria-label", `${rr + 1}行${cc + 1}列`);
      digitCell.addEventListener("click", () => selectCell(rr, cc));
      playGrid.appendChild(digitCell);

      if (cc < size - 1) {
        const opCell = document.createElement("div");
        opCell.className = "grid-cell op-cell";
        opCell.textContent = state.rowOperators[rr][cc];
        playGrid.appendChild(opCell);
      }
    }

    if (rr < size - 1) {
      for (let cc = 0; cc < size; cc += 1) {
        const downOp = document.createElement("div");
        downOp.className = "grid-cell op-cell";
        downOp.textContent = state.columnOperators[cc][rr];
        playGrid.appendChild(downOp);

        if (cc < size - 1) {
          const blank = document.createElement("div");
          blank.className = "grid-cell blank-cell";
          playGrid.appendChild(blank);
        }
      }
    }
  }

  bodyLayout.appendChild(playGrid);
  boardArea.appendChild(bodyLayout);
}

function selectCell(r, c) {
  if (state.revealed[r][c]) {
    state.selected = null;
    messageArea.textContent = "このマスは固定数字です。";
  } else {
    state.selected = { r, c };
    messageArea.textContent = `${r + 1}行${c + 1}列を選択しました。`;
  }
  updateSelectionLabel();
  renderBoard();
}

function updateSelectionLabel() {
  if (!state.selected) {
    selectionLabel.textContent = "マスを選んでください。";
  } else {
    selectionLabel.textContent = `${state.selected.r + 1}行${state.selected.c + 1}列を選択中`;
  }
}

function updateProgress() {
  const total = state.size * state.size;
  const filled = state.userGrid.flat().filter((value) => value !== "").length;
  progressLabel.textContent = `${filled} / ${total}`;
}

function setSelectedDigit(digit) {
  if (!state.selected || state.gameOver) return;
  const { r, c } = state.selected;
  if (state.revealed[r][c]) return;
  state.userGrid[r][c] = digit;
  updateProgress();
  renderBoard();
  checkSolved(false);
}

function eraseSelected() {
  if (!state.selected || state.gameOver) return;
  const { r, c } = state.selected;
  if (state.revealed[r][c]) return;
  state.userGrid[r][c] = "";
  messageArea.textContent = `${r + 1}行${c + 1}列を消しました。`;
  updateProgress();
  renderBoard();
}

function clearInputs() {
  for (let r = 0; r < state.size; r += 1) {
    for (let c = 0; c < state.size; c += 1) {
      if (!state.revealed[r][c]) state.userGrid[r][c] = "";
    }
  }
  state.selected = null;
  state.gameOver = false;
  messageArea.textContent = "入力を消しました。";
  updateSelectionLabel();
  updateProgress();
  renderBoard();
}

function revealAnswer() {
  for (let r = 0; r < state.size; r += 1) {
    for (let c = 0; c < state.size; c += 1) {
      state.userGrid[r][c] = state.solution[r][c];
    }
  }
  state.gameOver = true;
  state.selected = null;
  messageArea.textContent = "答えを表示しました。";
  updateSelectionLabel();
  updateProgress();
  renderBoard();
}

function checkSolved(showMessage = true) {
  const filledAll = state.userGrid.flat().every((value) => value !== "");
  if (!filledAll) {
    if (showMessage) messageArea.textContent = "まだ空いているマスがあります。";
    return false;
  }

  for (let r = 0; r < state.size; r += 1) {
    for (let c = 0; c < state.size; c += 1) {
      if (state.userGrid[r][c] !== state.solution[r][c]) {
        if (showMessage) messageArea.textContent = "一致しないマスがあります。もう少しです。";
        renderBoard();
        return false;
      }
    }
  }

  state.gameOver = true;
  messageArea.textContent = "正解です。おめでとうございます。";
  return true;
}

document.getElementById("newGameButton").addEventListener("click", newGame);
document.getElementById("checkButton").addEventListener("click", () => checkSolved(true));
document.getElementById("clearButton").addEventListener("click", clearInputs);
document.getElementById("answerButton").addEventListener("click", revealAnswer);
document.getElementById("eraseButton").addEventListener("click", eraseSelected);
document.getElementById("closeSelectButton").addEventListener("click", () => {
  state.selected = null;
  updateSelectionLabel();
  renderBoard();
});
difficultySelect.addEventListener("change", newGame);
calcModeSelect.addEventListener("change", newGame);

setupDigitPad();
newGame();
