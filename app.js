document.addEventListener('DOMContentLoaded', () => {
  const TEMPLATE = [
    [1,1,1,1,1,0,1,1,1,1,1], [1,0,1,0,1,0,1,0,1,0,1], [1,1,1,1,1,1,1,1,1,1,1], [1,0,1,0,1,0,1,0,1,0,1], [1,1,1,1,1,0,1,1,1,1,1],
    [0,0,1,0,0,0,0,0,1,0,0], [1,1,1,1,1,0,1,1,1,1,1], [1,0,1,0,1,0,1,0,1,0,1], [1,1,1,1,1,1,1,1,1,1,1], [1,0,1,0,1,0,1,0,1,0,1], [1,1,1,1,1,0,1,1,1,1,1]
  ];
  const EQUATION_SEGMENTS = [
    { type: 'row', r: 0, c: 0 }, { type: 'row', r: 0, c: 6 }, { type: 'row', r: 2, c: 0 }, { type: 'row', r: 2, c: 6 }, { type: 'row', r: 4, c: 0 }, { type: 'row', r: 4, c: 6 },
    { type: 'row', r: 6, c: 0 }, { type: 'row', r: 6, c: 6 }, { type: 'row', r: 8, c: 0 }, { type: 'row', r: 8, c: 6 }, { type: 'row', r: 10, c: 0 }, { type: 'row', r: 10, c: 6 },
    { type: 'col', r: 0, c: 0 }, { type: 'col', r: 6, c: 0 }, { type: 'col', r: 0, c: 2 }, { type: 'col', r: 6, c: 2 }, { type: 'col', r: 0, c: 4 }, { type: 'col', r: 6, c: 4 },
    { type: 'col', r: 0, c: 6 }, { type: 'col', r: 6, c: 6 }, { type: 'col', r: 0, r: 8 }, { type: 'col', r: 6, c: 8 }, { type: 'col', r: 0, c: 10 }, { type: 'col', r: 6, c: 10 }
  ];

  const boardEl = document.getElementById('board');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalValueEl = document.getElementById('modalValue');
  let selectedCell = null, gameState = [];

  const initBoard = () => {
    boardEl.innerHTML = '';
    gameState = Array.from({ length: 11 }, () => Array(11).fill(null));
    for (let r = 0; r < 11; r++) {
      for (let c = 0; c < 11; c++) {
        const cell = document.createElement('div');
        cell.className = `cell ${TEMPLATE[r][c] ? 'active' : 'empty'}`;
        if (TEMPLATE[r][c]) {
          cell.addEventListener('click', () => {
            if (cell.classList.contains('input')) {
              selectedCell = { r, c, el: cell };
              document.querySelectorAll('.cell').forEach(el => el.classList.remove('is-selected'));
              cell.classList.add('is-selected');
              modalValueEl.textContent = gameState[r][c] || '_';
              modalBackdrop.classList.remove('hidden');
            }
          });
        }
        boardEl.appendChild(cell);
      }
    }
  };

  const generateGame = () => {
    initBoard();
    const diff = document.getElementById('difficulty').value;
    const cells = document.querySelectorAll('.cell.active');
    cells.forEach((cell, idx) => {
      const r = Math.floor(idx / 11), c = idx % 11;
      // ここにご主人様の数式生成ロジックを統合
      if (Math.random() > 0.5) {
        cell.classList.add('number');
        cell.textContent = Math.floor(Math.random() * 10);
      } else {
        cell.classList.add('input', 'is-empty');
      }
    });
    document.getElementById('message').textContent = "問題を生成しました。";
  };

  document.getElementById('newGameBtn').addEventListener('click', generateGame);
  document.getElementById('closeModalBtn').addEventListener('click', () => modalBackdrop.classList.add('hidden'));
  document.querySelectorAll('.keypad button[data-key]').forEach(btn => {
    btn.addEventListener('click', () => modalValueEl.textContent = btn.dataset.key);
  });
  document.getElementById('applyModalBtn').addEventListener('click', () => {
    if (selectedCell) {
      const val = modalValueEl.textContent;
      gameState[selectedCell.r][selectedCell.c] = val;
      selectedCell.el.textContent = val;
      selectedCell.el.classList.remove('is-empty');
      modalBackdrop.classList.add('hidden');
    }
  });

  initBoard();
});
