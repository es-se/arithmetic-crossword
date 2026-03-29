document.addEventListener('DOMContentLoaded', () => {
  const TEMPLATE = [
    [{type:"num"}, {type:"op", value:"+"}, {type:"num"}, {type:"eq", value:"="}, {type:"num"}, null, {type:"num"}, {type:"op", value:"-"}, {type:"num"}, {type:"eq", value:"="}, {type:"num"}],
    [{type:"op", value:"÷"}, null, null, null, {type:"op", value:"-"}, null, {type:"op", value:"-"}, null, null, null, {type:"op", value:"÷"}],
    [{type:"num"}, null, {type:"num"}, {type:"op", value:"+"}, {type:"num"}, {type:"op", value:"-"}, {type:"num"}, {type:"eq", value:"="}, {type:"num"}, null, {type:"num"}],
    [{type:"eq", value:"="}, null, {type:"op", value:"-"}, null, {type:"eq", value:"="}, null, {type:"eq", value:"="}, null, {type:"op", value:"+"}, null, {type:"eq", value:"="}],
    [{type:"num"}, {type:"op", value:"-"}, {type:"num"}, {type:"eq", value:"="}, {type:"num"}, null, {type:"num"}, {type:"op", value:"+"}, {type:"num"}, {type:"eq", value:"="}, {type:"num"}],
    [null, null, {type:"op", value:"-"}, null, null, null, null, null, {type:"op", value:"+"}, null, null],
    [{type:"num"}, {type:"op", value:"+"}, {type:"num"}, {type:"eq", value:"="}, {type:"num"}, null, {type:"num"}, {type:"op", value:"-"}, {type:"num"}, {type:"eq", value:"="}, {type:"num"}],
    [{type:"op", value:"×"}, null, null, null, {type:"op", value:"+"}, null, {type:"op", value:"+"}, null, null, null, {type:"op", value:"×"}],
    [{type:"num"}, null, {type:"num"}, {type:"op", value:"-"}, {type:"num"}, {type:"op", value:"+"}, {type:"num"}, {type:"eq", value:"="}, {type:"num"}, null, {type:"num"}],
    [{type:"eq", value:"="}, null, {type:"op", value:"+"}, null, {type:"eq", value:"="}, null, {type:"eq", value:"="}, null, {type:"op", value:"-"}, null, {type:"eq", value:"="}],
    [{type:"num"}, {type:"op", value:"-"}, {type:"num"}, {type:"eq", value:"="}, {type:"num"}, null, {type:"num"}, {type:"op", value:"+"}, {type:"num"}, {type:"eq", value:"="}, {type:"num"}]
  ];

  const boardEl = document.getElementById('board');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalValueEl = document.getElementById('modalValue');
  const messageEl = document.getElementById('message');
  let selectedCell = null, gameState = Array.from({ length: 11 }, () => Array(11).fill(null));
  let modalBuffer = "";

  const initBoard = () => {
    boardEl.innerHTML = '';
    for (let r = 0; r < 11; r++) {
      for (let c = 0; c < 11; c++) {
        const data = TEMPLATE[r][c];
        const cell = document.createElement('div');
        cell.className = `cell ${data ? 'active' : 'empty'}`;
        if (data) {
          if (data.type === 'op' || data.type === 'eq') {
            cell.className += ` ${data.type === 'op' ? 'operator' : 'equal'}`;
            cell.textContent = data.value;
          } else {
            cell.dataset.r = r; cell.dataset.c = c;
            cell.addEventListener('click', () => {
              if (cell.classList.contains('input')) {
                selectedCell = { r, c, el: cell };
                document.querySelectorAll('.cell').forEach(el => el.classList.remove('is-selected'));
                cell.classList.add('is-selected');
                modalBuffer = gameState[r][c] !== null ? String(gameState[r][c]) : "";
                modalValueEl.textContent = modalBuffer || "_";
                modalBackdrop.classList.remove('hidden');
              }
            });
          }
        }
        boardEl.appendChild(cell);
      }
    }
  };

  const generateGame = () => {
    initBoard();
    const diff = document.getElementById('difficulty').value;
    const hideMap = { easy: 0.2, normal: 0.4, advanced: 0.6, hard: 0.8, expert: 0.9 };
    const prob = hideMap[diff];

    const nums = boardEl.querySelectorAll('.cell.active:not(.operator):not(.equal)');
    nums.forEach(cell => {
      const r = cell.dataset.r, c = cell.dataset.c;
      const val = Math.floor(Math.random() * 15);
      if (Math.random() > prob) {
        cell.classList.add('number');
        cell.textContent = val;
        gameState[r][c] = val;
      } else {
        cell.classList.add('input', 'is-empty');
        gameState[r][c] = null;
      }
    });
    messageEl.textContent = "新しい問題を作成しました。";
  };

  // 各種ボタンイベント
  document.getElementById('newGameBtn').addEventListener('click', generateGame);
  document.getElementById('clearBtn').addEventListener('click', () => {
    document.querySelectorAll('.cell.input').forEach(cell => {
      cell.textContent = '';
      cell.classList.add('is-empty');
      gameState[cell.dataset.r][cell.dataset.c] = null;
    });
    messageEl.textContent = "入力をすべて消去しました。";
  });
  document.getElementById('answerBtn').addEventListener('click', () => {
    alert("答えを表示するロジックをここに実装します。");
  });
  document.getElementById('checkBtn').addEventListener('click', () => {
    messageEl.textContent = "答え合わせの結果：まだ未完成です。";
  });

  // モーダル制御
  document.getElementById('closeModalBtn').addEventListener('click', () => modalBackdrop.classList.add('hidden'));
  document.querySelectorAll('.keypad button[data-key]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (modalBuffer.length < 2) modalBuffer += btn.dataset.key;
      modalValueEl.textContent = modalBuffer;
    });
  });
  document.querySelectorAll('.keypad button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'clear') modalBuffer = "";
      else if (btn.dataset.action === 'delete') modalBuffer = modalBuffer.slice(0, -1);
      modalValueEl.textContent = modalBuffer || "_";
    });
  });
  document.getElementById('applyModalBtn').addEventListener('click', () => {
    if (selectedCell) {
      gameState[selectedCell.r][selectedCell.c] = modalBuffer === "" ? null : parseInt(modalBuffer);
      selectedCell.el.textContent = modalBuffer;
      selectedCell.el.classList.toggle('is-empty', modalBuffer === "");
      modalBackdrop.classList.add('hidden');
    }
  });

  initBoard();
});
