const GRID_SIZE = 11;

const BOARD_LAYOUT = [
  ["a", "+", "b", "=", "c", null, "d", "-", "e", "=", "f"],
  ["/", null, null, null, "-", null, "-", null, null, null, "/"],
  ["g", null, "h", "+", "i", "-", "j", "=", "k", null, "l"],
  ["=", null, "-", null, "=", null, "=", null, "+", null, "="],
  ["m", "-", "n", "=", "o", null, "p", "+", "q", "=", "r"],
  [null, null, "-", null, null, null, null, null, "+", null, null],
  ["s", "/", "t", "=", "u", null, "v", "+", "w", "=", "x"],
  ["*", null, "=", null, "+", null, "/", null, "=", null, "*"],
  ["y", null, "z", "+", "aa", "-", "ab", "=", "ac", null, "ad"],
  ["=", null, null, null, "=", null, "=", null, null, null, "="],
  ["ae", "/", "af", "=", "ag", null, "ah", "*", "ai", "=", "aj"]
];

const NUMBER_IDS = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o",
  "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "aa", "ab", "ac", "ad",
  "ae", "af", "ag", "ah", "ai", "aj"
];

const DIFFICULTY_CONFIG = {
  easy: 8,
  normal: 12,
  hard: 16,
  expert: 20,
  master: 24
};

const appState = {
  solution: {},
  givens: new Set(),
  inputs: {},
  selectedCellId: null,
  modalValue: "",
  revealed: false
};

const boardEl = document.getElementById("board");
const difficultyEl = document.getElementById("difficulty");
const calcModeEl = document.getElementById("calcMode");
const newGameBtn = document.getElementById("newGameBtn");
const checkBtn = document.getElementById("checkBtn");
const clearBtn = document.getElementById("clearBtn");
const answerBtn = document.getElementById("answerBtn");
const messageEl = document.getElementById("message");
const progressEl = document.getElementById("progress");

const numberModal = document.getElementById("numberModal");
const modalDisplay = document.getElementById("modalDisplay");
const modalTargetInfo = document.getElementById("modalTargetInfo");
const closeModalBtn = document.getElementById("closeModalBtn");
const applyInputBtn = document.getElementById("applyInputBtn");
const backspaceBtn = document.getElementById("backspaceBtn");
const clearDigitBtn = document.getElementById("clearDigitBtn");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSolvedBoard() {
  for (let attempt = 0; attempt < 8000; attempt += 1) {
    const g = randomInt(2, 9);
    const m = randomInt(2, 9);
    const n = randomInt(1, m - 1);
    const b = randomInt(1, 20);

    const t = randomInt(2, 9);
    const u = randomInt(2, 9);
    const y = randomInt(2, 9);
    const ae = t * u * y;
    const afCandidates = [];
    for (let d = 2; d <= 9; d += 1) {
      if (ae % d === 0) {
        afCandidates.push(d);
      }
    }
    if (!afCandidates.length) {
      continue;
    }
    const af = pickRandom(afCandidates);
    const ag = ae / af;
    const aa = ag - u;
    if (aa <= 0 || aa > 99) {
      continue;
    }

    const p = randomInt(1, 20);
    const q = randomInt(1, 20);
    const l = randomInt(2, 9);
    const e = randomInt(1, 20);
    const h = randomInt(20, 80);
    const ac = randomInt(5, 20);
    const ah = randomInt(1, 9);
    const ai = randomInt(2, 9);

    const a = g * m;
    const o = m - n;
    const c = a + b;
    const s = t * u;
    const r = p + q;
    const f = r * l;
    const d = e + f;
    const j = d - p;
    const i = c - o;
    const z = h - n - t;
    const k = h + i - j;
    const ab = z + aa - ac;
    const v = ah * ab;
    const w = ac - k - q;
    const x = v + w;
    const aj = ah * ai;

    if (x <= 0 || ab <= 0 || w <= 0 || aj % x !== 0) {
      continue;
    }

    const ad = aj / x;

    const values = {
      a, b, c, d, e, f, g, h, i, j, k, l,
      m, n, o, p, q, r, s, t, u, v, w, x,
      y, z, aa, ab, ac, ad, ae, af, ag, ah, ai, aj
    };

    if (!NUMBER_IDS.every((id) => Number.isInteger(values[id]) && values[id] > 0 && values[id] <= 99)) {
      continue;
    }

    if (!validateSolution(values)) {
      continue;
    }

    return values;
  }

  throw new Error("盤面生成に失敗しました。");
}

function evaluateTokens(tokens, mode) {
  const values = [];
  const operators = [];

  tokens.forEach((token) => {
    if (typeof token === "number") {
      values.push(token);
    } else {
      operators.push(token);
    }
  });

  if (values.length === 1) {
    return values[0];
  }

  if (mode === "left") {
    let result = values[0];
    for (let i = 0; i < operators.length; i += 1) {
      result = applyOperator(result, operators[i], values[i + 1]);
    }
    return result;
  }

  const v = [...values];
  const ops = [...operators];
  for (let i = 0; i < ops.length; ) {
    if (ops[i] === "*" || ops[i] === "/") {
      const result = applyOperator(v[i], ops[i], v[i + 1]);
      v.splice(i, 2, result);
      ops.splice(i, 1);
    } else {
      i += 1;
    }
  }

  let result = v[0];
  for (let i = 0; i < ops.length; i += 1) {
    result = applyOperator(result, ops[i], v[i + 1]);
  }
  return result;
}

function applyOperator(left, operator, right) {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      if (right === 0 || left % right !== 0) {
        return Number.NaN;
      }
      return left / right;
    default:
      return Number.NaN;
  }
}

function validateSolution(values) {
  const mode = calcModeEl.value || "precedence";
  const equations = [
    [[values.a, "+", values.b], values.c],
    [[values.d, "-", values.e], values.f],
    [[values.h, "+", values.i, "-", values.j], values.k],
    [[values.m, "-", values.n], values.o],
    [[values.p, "+", values.q], values.r],
    [[values.s, "/", values.t], values.u],
    [[values.v, "+", values.w], values.x],
    [[values.z, "+", values.aa, "-", values.ab], values.ac],
    [[values.a, "/", values.g], values.m],
    [[values.c, "-", values.i], values.o],
    [[values.d, "-", values.j], values.p],
    [[values.f, "/", values.l], values.r],
    [[values.h, "-", values.n, "-", values.t], values.z],
    [[values.k, "+", values.q, "+", values.w], values.ac],
    [[values.s, "*", values.y], values.ae],
    [[values.u, "+", values.aa], values.ag],
    [[values.v, "/", values.ab], values.ah],
    [[values.x, "*", values.ad], values.aj],
    [[values.ae, "/", values.af], values.ag],
    [[values.ah, "*", values.ai], values.aj]
  ];

  return equations.every(([leftTokens, rightValue]) => evaluateTokens(leftTokens, mode) === rightValue);
}

function chooseGivenCells(difficulty) {
  const ids = [...NUMBER_IDS];
  const hiddenCount = DIFFICULTY_CONFIG[difficulty] ?? DIFFICULTY_CONFIG.normal;
  shuffle(ids);
  const hidden = new Set(ids.slice(0, hiddenCount));
  return new Set(ids.filter((id) => !hidden.has(id)));
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createNewGame() {
  const solution = generateSolvedBoard();
  const givens = chooseGivenCells(difficultyEl.value);

  appState.solution = solution;
  appState.givens = givens;
  appState.inputs = {};
  appState.selectedCellId = null;
  appState.modalValue = "";
  appState.revealed = false;

  NUMBER_IDS.forEach((id) => {
    appState.inputs[id] = givens.has(id) ? String(solution[id]) : "";
  });

  renderBoard();
  updateProgress();
  setMessage("固定形状で新しい問題を作成しました。空欄の数字を埋めてください。", false);
}

function renderBoard() {
  boardEl.innerHTML = "";

  BOARD_LAYOUT.forEach((row, rowIndex) => {
    row.forEach((token, colIndex) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.style.gridRow = String(rowIndex + 1);
      cell.style.gridColumn = String(colIndex + 1);

      if (token === null) {
        cell.classList.add("blank");
        cell.disabled = true;
        boardEl.appendChild(cell);
        return;
      }

      if (NUMBER_IDS.includes(token)) {
        const isFixed = appState.givens.has(token) || appState.revealed;
        const value = isFixed ? String(appState.solution[token]) : (appState.inputs[token] || "");
        cell.dataset.cellId = token;
        cell.classList.add(isFixed ? "number" : "input");
        if (!isFixed) {
          cell.classList.add("editable");
        }
        if (value) {
          cell.textContent = value;
          if (!isFixed) {
            cell.classList.add("has-value");
          }
        }
        if (appState.selectedCellId === token && !isFixed) {
          cell.classList.add("selected");
        }
        if (isFixed) {
          cell.disabled = true;
        } else {
          cell.addEventListener("click", () => openModal(token));
        }
      } else {
        cell.classList.add(token === "=" ? "equal" : "operator");
        cell.textContent = token === "*" ? "×" : token === "/" ? "÷" : token;
        cell.disabled = true;
      }

      boardEl.appendChild(cell);
    });
  });
}

function openModal(cellId) {
  appState.selectedCellId = cellId;
  appState.modalValue = appState.inputs[cellId] || "";
  modalTargetInfo.textContent = `選択中のマス: ${cellId}`;
  updateModalDisplay();
  numberModal.classList.remove("hidden");
  numberModal.setAttribute("aria-hidden", "false");
  renderBoard();
}

function closeModal() {
  numberModal.classList.add("hidden");
  numberModal.setAttribute("aria-hidden", "true");
  appState.modalValue = "";
}

function updateModalDisplay() {
  modalDisplay.textContent = appState.modalValue || "--";
}

function appendDigit(digit) {
  if (appState.selectedCellId === null) {
    return;
  }
  if (appState.modalValue.length >= 2) {
    return;
  }
  appState.modalValue = appState.modalValue === "0" ? digit : `${appState.modalValue}${digit}`;
  updateModalDisplay();
}

function applyModalInput() {
  if (appState.selectedCellId === null) {
    closeModal();
    return;
  }

  appState.inputs[appState.selectedCellId] = appState.modalValue;
  renderBoard();
  updateProgress();
  setMessage("入力を更新しました。", false);
  closeModal();
}

function clearEditableInputs() {
  NUMBER_IDS.forEach((id) => {
    if (!appState.givens.has(id)) {
      appState.inputs[id] = "";
    }
  });
  appState.selectedCellId = null;
  renderBoard();
  updateProgress();
  setMessage("入力可能マスを消去しました。", false);
}

function revealAnswer() {
  appState.revealed = true;
  appState.selectedCellId = null;
  NUMBER_IDS.forEach((id) => {
    appState.inputs[id] = String(appState.solution[id]);
  });
  renderBoard();
  updateProgress();
  setMessage("答えを表示しました。", false);
}

function updateProgress() {
  const editableIds = NUMBER_IDS.filter((id) => !appState.givens.has(id));
  const filled = editableIds.filter((id) => appState.inputs[id]).length;
  progressEl.textContent = `${filled} / ${editableIds.length}`;
}

function checkBoard() {
  const missing = NUMBER_IDS.filter((id) => !appState.givens.has(id) && !appState.inputs[id]);
  if (missing.length > 0) {
    setMessage(`未入力があります。残り ${missing.length} マスです。`, true);
    return;
  }

  const enteredValues = {};
  NUMBER_IDS.forEach((id) => {
    enteredValues[id] = Number(appState.inputs[id]);
  });

  if (!validateSolution(enteredValues)) {
    setMessage("式が成立していない箇所があります。入力を見直してください。", true);
    return;
  }

  const wrong = NUMBER_IDS.filter((id) => Number(appState.inputs[id]) !== appState.solution[id]);
  if (wrong.length === 0) {
    setMessage("正解です。すべての式が成立しています。", false);
  } else {
    setMessage(`式は成立していますが、正解盤面との差分が ${wrong.length} マスあります。`, true);
  }
}

function setMessage(text, isAlert) {
  messageEl.textContent = text;
  messageEl.style.color = isAlert ? "#ffe2a3" : "#f6f8ff";
}

newGameBtn.addEventListener("click", createNewGame);
checkBtn.addEventListener("click", checkBoard);
clearBtn.addEventListener("click", clearEditableInputs);
answerBtn.addEventListener("click", revealAnswer);
closeModalBtn.addEventListener("click", closeModal);
applyInputBtn.addEventListener("click", applyModalInput);
backspaceBtn.addEventListener("click", () => {
  appState.modalValue = appState.modalValue.slice(0, -1);
  updateModalDisplay();
});
clearDigitBtn.addEventListener("click", () => {
  appState.modalValue = "";
  updateModalDisplay();
});
document.querySelectorAll(".digit-btn").forEach((button) => {
  button.addEventListener("click", () => appendDigit(button.dataset.digit));
});
numberModal.addEventListener("click", (event) => {
  if (event.target.dataset.close === "true") {
    closeModal();
  }
});
difficultyEl.addEventListener("change", createNewGame);
calcModeEl.addEventListener("change", () => {
  if (!Object.keys(appState.solution).length) {
    return;
  }
  createNewGame();
  setMessage("計算ルールを反映して問題を作り直しました。", false);
});

createNewGame();
