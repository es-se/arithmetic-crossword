
let selected = null;
let size = 5;

function init(){
  const board = document.getElementById('board');
  board.innerHTML='';
  board.style.gridTemplateColumns=`repeat(${size},1fr)`;

  for(let i=0;i<size*size;i++){
    const cell=document.createElement('div');
    cell.className='cell';
    cell.onclick=()=>{
      selected=cell;
      document.getElementById('modal').classList.remove('hidden');
    };
    board.appendChild(cell);
  }
}

function inputNum(n){
  if(selected){
    selected.textContent=n;
  }
  closeModal();
}

function clearCell(){
  if(selected){
    selected.textContent='';
  }
}

function closeModal(){
  document.getElementById('modal').classList.add('hidden');
}

init();
