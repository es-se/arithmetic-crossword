
const board = document.getElementById('board');
const modal = document.getElementById('modal');

let size = 4;
let selected = null;

function newGame(){
  size = parseInt(document.getElementById('difficulty').value);
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${size},1fr)`;

  for(let r=0;r<size;r++){
    for(let c=0;c<size;c++){
      const cell = document.createElement('div');
      cell.className='cell';
      cell.dataset.r=r;
      cell.dataset.c=c;

      cell.onclick = ()=>{
        selected = cell;
        modal.classList.remove('hidden');
      };

      board.appendChild(cell);
    }
  }
}

document.querySelectorAll('.num').forEach(btn=>{
  btn.onclick=()=>{
    if(selected){
      selected.textContent = btn.textContent;
    }
    modal.classList.add('hidden');
  }
});

document.getElementById('delete').onclick=()=>{
  if(selected){
    selected.textContent="";
  }
};

document.getElementById('close').onclick=()=>{
  modal.classList.add('hidden');
};

document.getElementById('newGame').onclick=newGame;

newGame();
