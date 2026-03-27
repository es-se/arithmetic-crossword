
let selected=null;

const layout = [
  ["n","+","n","×","n"],
  ["÷","","-","","+"],
  ["n","-","n","×","n"],
  ["×","","-","","+"],
  ["n","-","n","×","n"]
];

function init(){
  const board=document.getElementById('board');
  board.innerHTML='';
  board.style.gridTemplateColumns="repeat(5,1fr)";

  layout.forEach((row,r)=>{
    row.forEach((val,c)=>{
      const cell=document.createElement('div');

      if(val==="n"){
        cell.className="cell num";
        cell.onclick=()=>{
          selected=cell;
          document.getElementById('modal').classList.remove('hidden');
        };
      }else{
        cell.className="cell op";
        cell.textContent=val;
      }

      board.appendChild(cell);
    });
  });
}

function inputNum(n){
  if(selected){
    selected.textContent=n;
  }
  closeModal();
}

function clearCell(){
  if(selected){
    selected.textContent="";
  }
}

function closeModal(){
  document.getElementById('modal').classList.add('hidden');
}

init();
