document.addEventListener('DOMContentLoaded', () => {
  const TEMPLATE = [
    [1,1,1,1,1,0,1,1,1,1,1], [1,0,1,0,1,0,1,0,1,0,1], [1,1,1,1,1,1,1,1,1,1,1], [1,0,1,0,1,0,1,0,1,0,1], [1,1,1,1,1,0,1,1,1,1,1],
    [0,0,1,0,0,0,0,0,1,0,0], [1,1,1,1,1,0,1,1,1,1,1], [1,0,1,0,1,0,1,0,1,0,1], [1,1,1,1,1,1,1,1,1,1,1], [1,0,1,0,1,0,1,0,1,0,1], [1,1,1,1,1,0,1,1,1,1,1]
  ];

  const boardEl = document.getElementById('board');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalValueEl = document.getElementById('modalValue');
  let selectedCell = null, gameState = Array.from({ length: 11 }, () => Array(11).fill(null));

  const initBoard = () => {
    boardEl.innerHTML = '';
    for (let r = 0; r < 11; r++) {
      for (let c = 0; c < 11; c++) {
        const cell = document.createElement('div');
        cell.className = `cell ${TEMPLATE[r][c] ? 'active' : 'empty'}`;
        if (TEMPLATE[r][c]) {
          cell.dataset.r = r; cell.dataset.c = c;
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
    const cells = boardEl.querySelectorAll('.cell.active');
    cells.forEach(cell => {
      const r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);
      // 演算子マスの位置（例：奇数列や奇数行）を判定
      const isOperator = (r % 2 === 0 && c % 2 !== 0) || (r % 2 !== 0 && c % 2 === 0);
      const isEqual = (r % 2 === 0 && c === 4) || (r % 2 === 0 && c === 10); // 仮の等号位置

      if (isOperator) {
        cell.classList.add('operator');
        cell.textContent = Math.random() > 0.5 ? '+' : '-'; // 仮の演算子
      } else if (isEqual) {
        cell.classList.add('equal');
        cell.textContent = '=';
      } else {
        // 数字マス
        if (Math.random() > 0.4) {
          cell.classList.add('number');
          cell.textContent = Math.floor(Math.random() * 10);
        } else {
          cell.classList.add('input', 'is-empty');
        }
      }
    });
    document.getElementById('message').textContent = "パズルを生成しました。";
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
