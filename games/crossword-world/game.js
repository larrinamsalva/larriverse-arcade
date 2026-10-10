import {CROSSWORD_LEVELS,CROSSWORD_CHAPTERS,buildCrossword,matchingEntryCells,solvedCrossword} from "./puzzles.js";
const GAME_ID="crossword-world",SAVE_KEY="larriverse.crosswordWorld.v1",$=id=>document.getElementById(id),TOTAL=60;
function readSave(){
 const empty={open:0,unlocked:0,stars:Array(TOTAL).fill(0),current:null};
 try{
  const data=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");
  if(!data||!Array.isArray(data.stars)||data.stars.length!==TOTAL)return empty;
  const stars=data.stars.map(v=>Number.isInteger(v)&&v>=0&&v<=3?v:0);
  const unlocked=Math.min(TOTAL-1,Math.max(Number.isInteger(data.unlocked)?data.unlocked:0,stars.findLastIndex(v=>v>0)+1,0));
  return {open:Number.isInteger(data.open)?Math.max(0,Math.min(unlocked,data.open)):0,unlocked,stars,current:data.current&&typeof data.current==="object"?data.current:null};
 }catch{return empty}
}
let progress=readSave(),levelIndex=progress.open,level,puzzle,guesses=[],active=-1,cursor=-1,hints=0,misses=0,finished=false,wrong=new Set();
function save(next=null){
 try{localStorage.setItem(SAVE_KEY,JSON.stringify({open:next===null?levelIndex:next,
  unlocked:progress.unlocked,stars:progress.stars,
  current:next===null?{level:levelIndex,guesses:guesses.map(v=>v||"0").join(""),hints,misses}:null
 }))}catch{/* A browser without storage must still play normally. */}
}
function tell(text,tone=""){
 const p=$("feedback");p.className="feedback"+(tone?" "+tone:"");p.textContent=text;
}
function buddy(text){$("buddy").textContent=text}
function matches(i){return matchingEntryCells(guesses,puzzle.entries[i])}
function solvedCount(){return puzzle.entries.filter((entry,i)=>matches(i)).length}
function setStats(){
 const count=progress.stars.filter(Boolean).length;
 $("stage").textContent="LEVEL "+(levelIndex+1)+" OF 60 · "+level.difficulty;
 $("puzzleTitle").textContent=level.emoji+" "+level.title;
 $("difficulty").textContent=(level.bars+1)+" crossing words · "+level.difficulty;
 $("levelCount").textContent=(levelIndex+1)+" / 60";
 $("wordCount").textContent=solvedCount()+" / "+puzzle.entries.length;
 $("starsCount").textContent=progress.stars.reduce((a,b)=>a+b,0)+" / 180";
 $("hintsCount").textContent=String(hints);
 $("progressFill").style.width=(count/60*100)+"%";
 $("progress").setAttribute("aria-valuenow",String(count));
 $("progress").setAttribute("aria-valuetext",count+" of sixty crossword puzzles completed");
}
function renderChapters(){
 const root=$("chapters");root.replaceChildren();
 for(const part of CROSSWORD_CHAPTERS){
  const div=document.createElement("div");
  const done=progress.stars.slice(part.from-1,part.to).every(Boolean);
  div.className="chapter"+(part.id===level.chapter?" active":"")+(done?" complete":"")+(part.from-1>progress.unlocked?" locked":"");
  div.innerHTML='<span class="chapter-icon"></span><strong></strong><small></small>';
  div.querySelector(".chapter-icon").textContent=part.emoji;
  div.querySelector("strong").textContent=part.title;
  div.querySelector("small").textContent="Levels "+part.from+"–"+part.to;
  root.append(div);
 }
}
function renderPicker(){
 const select=$("levelPicker");select.replaceChildren();
 for(let i=0;i<=progress.unlocked;i++){
  const option=document.createElement("option");option.value=i;
  option.textContent=(progress.stars[i]?"⭐ ":"○ ")+"Level "+(i+1)+" · "+CROSSWORD_LEVELS[i].chapterName;
  select.append(option);
 }
 select.value=String(levelIndex);
}
function renderBoard(){
 const grid=$("crosswordGrid");grid.replaceChildren();
 grid.style.setProperty("--cols",String(puzzle.cols));
 grid.style.setProperty("--rows",String(puzzle.rows));
 grid.style.aspectRatio=puzzle.cols+"/"+puzzle.rows;
 grid.setAttribute("aria-label","Crossword level "+(levelIndex+1)+", "+puzzle.rows+" rows and "+puzzle.cols+" columns");
 const current=active>=0?puzzle.entries[active]:null;
 for(let i=0;i<puzzle.solution.length;i++){
  const value=puzzle.solution[i],cell=document.createElement(value?"button":"div");
  if(!value){cell.className="tile blocked";cell.setAttribute("aria-hidden","true");grid.append(cell);continue;}
  cell.className="tile"+(current?.cells.includes(i)?" selected-word":"")+
   (cursor===i?" cursor":"")+(wrong.has(i)?" wrong":"");
  cell.dataset.cell=String(i);
  cell.type="button";
  cell.setAttribute("aria-label","Row "+(Math.floor(i/puzzle.cols)+1)+", column "+(i%puzzle.cols+1)+
   ", "+(guesses[i]?"letter "+guesses[i]:"empty square")+(wrong.has(i)?", check letter":""));
  if(puzzle.cellNumbers[i]){
   const number=document.createElement("span");number.className="number";number.textContent=puzzle.cellNumbers[i];number.setAttribute("aria-hidden","true");cell.append(number);
  }
  const letter=document.createElement("span");letter.textContent=guesses[i]||"";
  letter.setAttribute("aria-hidden","true");cell.append(letter);
  const included=puzzle.entries.map((entry,j)=>entry.cells.includes(i)?j:-1).filter(x=>x>=0);
  if(guesses[i]===value&&included.some(j=>matches(j)))cell.classList.add("correct");
  cell.addEventListener("click",()=>selectCell(i));
  grid.append(cell);
 }
 if(cursor>=0)grid.querySelector('[data-cell="'+cursor+'"]')?.setAttribute("aria-pressed","true");
}
function renderClues(){
 for(const direction of ["across","down"]){
  const root=$(direction+"Clues");root.replaceChildren();
  for(let i=0;i<puzzle.entries.length;i++){
   const entry=puzzle.entries[i];if(entry.direction!==direction)continue;
   const node=document.createElement("button");node.type="button";
   node.dataset.entry=String(i);
   node.className="clue"+(i===active?" selected":"")+(matches(i)?" solved":"");
   const title=document.createElement("strong");title.textContent=entry.number+". ";
   node.append(title,document.createTextNode(entry.clue+" ("+entry.answer.length+" letters)"+(matches(i)?" ✓":"")));
   node.setAttribute("aria-label",entry.number+" "+direction+", "+entry.clue+", "+entry.answer.length+" letters");
   node.addEventListener("click",()=>selectEntry(i));
   root.append(node);
  }
 }
}
function highlight(){
 const current=active<0?null:puzzle.entries[active];
 for(const cell of $("crosswordGrid").querySelectorAll("[data-cell]")){
  const i=Number(cell.dataset.cell),inWord=Boolean(current?.cells.includes(i));
  cell.classList.toggle("selected-word",inWord);cell.classList.toggle("cursor",i===cursor);
  cell.classList.toggle("wrong",wrong.has(i));
  const included=puzzle.entries.map((entry,j)=>entry.cells.includes(i)?j:-1).filter(x=>x>=0);
  cell.classList.toggle("correct",guesses[i]===puzzle.solution[i]&&included.some(j=>matches(j)));
  const letter=cell.querySelector("span:last-child");if(letter)letter.textContent=guesses[i]||"";
  cell.setAttribute("aria-pressed",String(i===cursor));
  cell.setAttribute("aria-label","Row "+(Math.floor(i/puzzle.cols)+1)+", column "+(i%puzzle.cols+1)+
   ", "+(guesses[i]?"letter "+guesses[i]:"empty square")+(wrong.has(i)?", check letter":""));
 }
 for(const button of document.querySelectorAll(".clue-list button")){
  const i=Number(button.dataset.entry);
  button.classList.toggle("selected",i===active);
  button.classList.toggle("solved",matches(i));
  const entry=puzzle.entries[i];
  const title=button.querySelector("strong");
  button.replaceChildren(title,document.createTextNode(entry.clue+" ("+entry.answer.length+" letters)"+(matches(i)?" ✓":"")));
 }
 if(current)$("clueFocus").textContent=current.number+" "+current.direction.toUpperCase()+" · "+current.clue+" · "+current.answer.length+" letters";
 setStats();
}
function selectEntry(index,cell=null){
 if(!Number.isInteger(index)||index<0||index>=puzzle.entries.length)return;
 active=index;
 const entry=puzzle.entries[index];
 cursor=cell!==null&&entry.cells.includes(cell)?cell:entry.cells.find(i=>!guesses[i])??entry.cells[0];
 highlight();
 $("crosswordGrid").querySelector('[data-cell="'+cursor+'"]')?.focus({preventScroll:true});
}
function selectCell(i){
 const options=puzzle.entries.map((entry,j)=>entry.cells.includes(i)?j:-1).filter(j=>j>=0);
 if(!options.length)return;
 const next=options.length>1&&options.includes(active)?options[(options.indexOf(active)+1)%options.length]:options[0];
 selectEntry(next,i);
}
function finishIfSolved(){
 if(finished||!solvedCrossword(guesses,puzzle))return;
 finished=true;
 const first=progress.stars[levelIndex]===0;
 const stars=hints===0&&misses===0?3:hints<=2&&misses<=2?2:1;
 progress.stars[levelIndex]=Math.max(progress.stars[levelIndex],stars);
 progress.unlocked=Math.max(progress.unlocked,Math.min(TOTAL-1,levelIndex+1));
 save(levelIndex===59?levelIndex:levelIndex+1);
 if(first)try{window.LarriVerseArcade?.award?.(GAME_ID,{
  xp:15+Math.min(50,levelIndex+1),kc:3,score:(levelIndex+1)*100+stars*15,completed:true
 });}catch{/* Rewards must not block gameplay. */}
 $("winTitle").textContent=levelIndex===59?"🏆 All 60 crosswords complete!":"🎉 Level "+(levelIndex+1)+" solved!";
 $("winMessage").textContent="You earned "+stars+" star"+(stars===1?"":"s")+
  (levelIndex===59?"! You are a Crossword World Champion!":"! Your next crossword is ready.");
 $("nextLevel").textContent=levelIndex===59?"Replay final crossword":"Next Level "+(levelIndex+2)+" →";
 $("celebration").hidden=false;
 buddy("🌟 Fantastic crossword thinking! Every crossing fits.");
 tell("All clues solved! Congratulations!","good");
 renderChapters();renderPicker();highlight();
 $("celebration").scrollIntoView({block:"nearest",behavior:"auto"});
}
function typeLetter(ch){
 if(finished)return;
 if(active<0){tell("Choose an Across or Down clue first.");return;}
 const entry=puzzle.entries[active],at=entry.cells.indexOf(cursor);
 if(at<0)return;
 if(!/^[A-Z]$/.test(ch))return;
 guesses[cursor]=ch;wrong.delete(cursor);
 const next=entry.cells.slice(at+1).find(i=>!guesses[i]);
 cursor=next??entry.cells[Math.min(at+1,entry.cells.length-1)];
 save();highlight();
 if(matches(active)){tell("✨ Correct! "+entry.number+" "+entry.direction+" is solved.","good");buddy("Nice! That word fits every crossing.");}
 else tell("Keep going! Check the clues and where the words meet.");
 finishIfSolved();
}
function eraseLetter(){
 if(finished||active<0||cursor<0)return;
 const entry=puzzle.entries[active],p=entry.cells.indexOf(cursor);
 if(!guesses[cursor]&&p>0)cursor=entry.cells[p-1];
 guesses[cursor]="";wrong.delete(cursor);save();highlight();
 tell("Letter erased. Try a new answer!");
}
function checkWord(){
 if(finished||active<0)return;
 const entry=puzzle.entries[active],mistakes=entry.cells.filter((cell,j)=>guesses[cell]&&guesses[cell]!==entry.answer[j]);
 wrong=new Set(mistakes);
 if(mistakes.length){misses++;tell("That word has "+mistakes.length+" letter(s) to check. Look at the pink squares.","warning");}
 else if(matches(active))tell("Wonderful! That whole word is correct.","good");
 else tell("These letters are looking good. Finish the empty squares!","good");
 save();highlight();finishIfSolved();
}
function checkBoard(){
 if(finished)return;
 const mistakes=puzzle.solution.flatMap((c,i)=>c&&guesses[i]&&c!==guesses[i]?[i]:[]);
 wrong=new Set(mistakes);
 if(mistakes.length){misses++;tell(mistakes.length+" letter(s) need another look. The pink squares show where.","warning");}
 else if(!solvedCrossword(guesses,puzzle))tell("Good work! No wrong letters so far — fill the empty squares.","good");
 save();highlight();finishIfSolved();
}
function hint(){
 if(finished)return;
 let entry=active>=0?puzzle.entries[active]:null;
 if(!entry||matchingEntryCells(guesses,entry))entry=puzzle.entries.find(e=>!matchingEntryCells(guesses,e));
 if(!entry)return;
 const position=entry.cells.find((cell,i)=>guesses[cell]!==entry.answer[i]);
 if(position===undefined)return;
 guesses[position]=puzzle.solution[position];hints++;wrong.delete(position);
 active=puzzle.entries.indexOf(entry);cursor=position;
 save();highlight();
 const coordinate="row "+(Math.floor(position/puzzle.cols)+1)+", column "+(position%puzzle.cols+1);
 tell("💡 A free hint placed "+guesses[position]+" in "+coordinate+". You can finish the rest!","good");
 buddy("Use that letter and check what crosses it!");
 finishIfSolved();
}
function renderKeyboard(){
 const root=$("keyboard");root.replaceChildren();
 for(const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ"){
  const button=document.createElement("button");button.type="button";button.textContent=letter;
  button.dataset.key=letter;button.setAttribute("aria-label","Enter letter "+letter);
  button.addEventListener("click",()=>typeLetter(letter));root.append(button);
 }
}
function startLevel(index,restore=false){
 const i=Number(index);levelIndex=Number.isInteger(i)?Math.min(progress.unlocked,Math.max(0,i)):0;
 level=CROSSWORD_LEVELS[levelIndex];puzzle=buildCrossword(level);
 guesses=Array(puzzle.solution.length).fill("");hints=0;misses=0;finished=false;wrong=new Set();
 if(restore&&progress.current?.level===levelIndex){
  const raw=progress.current.guesses;
  if(typeof raw==="string"&&raw.length===guesses.length&&/^[A-Z0]*$/.test(raw))
   guesses=[...raw].map((v,i)=>puzzle.solution[i]?(v==="0"?"":v):"");
  hints=Number.isInteger(progress.current.hints)?Math.min(999,Math.max(0,progress.current.hints)):0;
  misses=Number.isInteger(progress.current.misses)?Math.min(999,Math.max(0,progress.current.misses)):0;
 }
 if(solvedCrossword(guesses,puzzle))guesses=Array(puzzle.solution.length).fill("");
 active=0;cursor=puzzle.entries[0].cells.find(i=>!guesses[i])??puzzle.entries[0].cells[0];
 $("celebration").hidden=true;
 renderChapters();renderPicker();renderKeyboard();renderClues();renderBoard();highlight();
 tell("Choose a clue and type its answer. The words cross to help you!");
 buddy(level.chapter<2?"Try the shorter clues first — every crossing gives a helpful letter!":"Check the crossing letters to help with the harder clues.");
 save();
}
$("crosswordGrid").addEventListener("keydown",event=>{
 if(!event.target.closest?.("[data-cell]"))return;
 if(event.key.length===1&&/^[A-Za-z]$/.test(event.key)){event.preventDefault();typeLetter(event.key.toUpperCase());return;}
 if(event.key==="Backspace"||event.key==="Delete"){event.preventDefault();eraseLetter();return;}
 const cell=Number(event.target.closest("[data-cell]").dataset.cell),entry=puzzle.entries[active],offset=entry?.cells.indexOf(cell)??-1;
 if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)){
  event.preventDefault();
  const direction={ArrowLeft:-1,ArrowRight:1,ArrowUp:-puzzle.cols,ArrowDown:puzzle.cols}[event.key];
  const destination=cell+direction;
  if(puzzle.solution[destination])selectCell(destination);
  return;
 }
 if(event.key==="Tab"&&offset>=0)return;
 if(event.key===" "||event.key==="Enter"){event.preventDefault();selectCell(cell)}
});
$("levelPicker").addEventListener("change",e=>startLevel(Number(e.target.value)));
$("erase").addEventListener("click",eraseLetter);
$("checkWord").addEventListener("click",checkWord);
$("checkBoard").addEventListener("click",checkBoard);
$("hint").addEventListener("click",hint);
$("restart").addEventListener("click",()=>startLevel(levelIndex));
$("nextLevel").addEventListener("click",()=>startLevel(levelIndex===59?59:levelIndex+1));
window.addEventListener("larriverse:profile",setStats);
startLevel(levelIndex,true);
