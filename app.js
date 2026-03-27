document.querySelectorAll('.input').forEach(cell => {
  cell.addEventListener('click', () => {
    const value = prompt('0〜9を入力');
    if (value !== null) {
      cell.textContent = value;
    }
  });
});
