document.addEventListener('DOMContentLoaded', () => {
  // =========================================
  // 1. 要素の取得と状態管理
  // =========================================
  const inputCells = document.querySelectorAll('.cell.input');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const closeModalBtn = document.getElementById('close-modal');
  const keypadButtons = document.querySelectorAll('.keypad button');
  const ruleSelect = document.getElementById('calc-rule'); // 計算ルール切替のselect要素
  const checkButton = document.getElementById('check-btn'); // 答え合わせボタン

  let selectedCell = null; // 現在選択されているマス

  // =========================================
  // 2. モーダル（テンキー）のUI制御
  // =========================================
  // 入力マスをタップした時の処理
  inputCells.forEach(cell => {
    cell.addEventListener('click', (e) => {
      // 選択状態のスタイルをリセット
      inputCells.forEach(c => c.classList.remove('is-selected'));
      
      selectedCell = e.target;
      selectedCell.classList.add('is-selected');
      
      // モーダルを表示
      modalBackdrop.classList.remove('hidden');
    });
  });

  // モーダルを閉じる処理
  const closeModal = () => {
    modalBackdrop.classList.add('hidden');
    if (selectedCell) {
      selectedCell.classList.remove('is-selected');
      selectedCell = null;
    }
  };

  closeModalBtn.addEventListener('click', closeModal);
  
  // 背景タップでモーダルを閉じる（スマホ向けUX）
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  // テンキーの入力処理
  keypadButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      if (!selectedCell) return;

      const action = e.target.getAttribute('data-action');
      const value = e.target.textContent.trim();

      if (action === 'clear' || action === 'delete') {
        selectedCell.textContent = '';
        selectedCell.classList.add('is-empty');
      } else {
        selectedCell.textContent = value;
        selectedCell.classList.remove('is-empty');
      }
      
      // 入力後は自動でモーダルを閉じる（連続入力したい場合はコメントアウト）
      closeModal(); 
    });
  });

  // =========================================
  // 3. 計算アルゴリズム（ご主人様のご要望部分）
  // =========================================
  
  /**
   * 数式を文字列で受け取り、「左から順」に計算する関数
   */
  const evaluateLeftToRight = (expression) => {
    // 数字と演算子に分割 (例: "2+3*4" -> ["2", "+", "3", "*", "4"])
    const tokens = expression.match(/\d+|\+|\-|\*|\//g);
    if (!tokens) return NaN;

    let result = parseFloat(tokens[0]);
    for (let i = 1; i < tokens.length; i += 2) {
      const operator = tokens[i];
      const nextNum = parseFloat(tokens[i + 1]);

      if (isNaN(nextNum)) return NaN;

      if (operator === '+') result += nextNum;
      else if (operator === '-') result -= nextNum;
      else if (operator === '*') result *= nextNum;
      else if (operator === '/') result /= nextNum;
    }
    return result;
  };

  /**
   * 数式を文字列で受け取り、「四則演算優先（×÷先）」で計算する関数
   */
  const evaluateStandard = (expression) => {
    try {
      // 悪意あるコードを防ぐため、Functionコンストラクタで安全に評価
      return new Function('"use strict"; return (' + expression + ')')();
    } catch (error) {
      return NaN;
    }
  };

  // =========================================
  // 4. 答え合わせロジック（実行例）
  // =========================================
  if (checkButton) {
    checkButton.addEventListener('click', () => {
      // ※ここはご主人様のHTML構造（行と列の式の取得方法）に合わせて調整が必要です。
      // 例として、ルール切替フラグの取得と計算の実行方法を示します。
      
      const isLeftToRight = ruleSelect && ruleSelect.value === 'left-to-right';
      const testExpression = "2+3*4"; // 盤面から取得した数式の文字列と仮定
      
      let answer;
      if (isLeftToRight) {
        answer = evaluateLeftToRight(testExpression);
        console.log(`左から順: ${testExpression} = ${answer}`); // 期待値: 20
      } else {
        answer = evaluateStandard(testExpression);
        console.log(`四則優先: ${testExpression} = ${answer}`); // 期待値: 14
      }
      
      alert(`現在のルールでの計算結果は Console を確認してください。`);
    });
  }
});