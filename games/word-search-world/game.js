import {WORD_SEARCH_LEVELS,WORD_SEARCH_CHAPTERS,createWordSearch,lineCells,matchWord} from "./puzzles.js";
const GAME_ID="word-search-world",SAVE_KEY="larriverse.wordSearchWorld.v1",$=id=>document.getElementById(id);
const COUNT=WORD_SEARCH_LEVELS.length;
function restoreProgress(){
 const blank={open:0,unlocked:0,stars:Array(COUNT).fill(0),current:null};
 try{
  const item=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");
  if(!item||!Array.isArray(item.stars)||item.stars.length!==COUNT)return blank;
  const stars=item.stars.map(s=>Number.isInteger(s)&&s>=0&&s<=3?s:0);
  const last=Math.max(0,stars.findLastIndex(s=>s>0)+1);
  const unlocked=Math.max(last,Number.isInteger(item.unlocked)?Math.min(COUNT-1,Math.max(0,item.unlocked)):0);
  return {open:Number.isInteger(item.open)?Math.min(unlocked,Math.max(0,item.open)):0,unlocked,stars,current:item.current&&typeof item.current==="object"?item.current:null};
 }catch{return blank}
}
let progress=restoreProgress(),levelIndex=progress.open,level,puzzle,found=new Set(),hints=0,misses=0,celebrating=false,pending=-1,drag=null,hinted=-1,preview=[];
function save(next=null){
 const record={open:next===null?levelIndex:next,unlocked:progress.unlocked,stars:progress.stars,
  current:next===null?{level:levelIndex,found:[...found],hints,misses}:null};
 try{localStorage.setItem(SAVE_KEY,JSON.stringify(record))}catch{/* Stay playable when storage is unavailable. */}
}
function feedback(message,tone=""){
 const node=$("gameFeedback");node.textContent=message;node.className="feedback"+(tone?" "+tone:"");
}
function buddy(message){$("buddySpeech").textContent=message}
function setHeader(){
 const cleared=progress.stars.filter(Boolean).length;
 $("levelLabel").textContent="Level "+(levelIndex+1)+" of "+COUNT+" · "+level.emoji+" "+level.chapterName;
 $("levelTitle").textContent=level.title;
 $("foundCount").textContent=found.size+" / "+level.words.length;
 $("levelCount").textContent=(levelIndex+1)+" / "+COUNT;
 $("starCount").textContent=progress.stars.reduce((a,b)=>a+b,0)+" / 180";
 $("hintCount").textContent=String(hints);
 $("progressBar").style.width=(100*cleared/COUNT)+"%";
 $("levelProgress").setAttribute("aria-valuenow",String(cleared));
 $("levelProgress").setAttribute("aria-valuetext",cleared+" of 60 levels finished");
 const onlyStraight=level.chapter<2;
 $("directionsText").textContent=onlyStraight?
   (level.chapter===0?"Find words moving right or down.":"Now some words read backwards or upwards!"):
   "Words may appear across, down, diagonal, or backwards. Find them in a straight line!";
 $("funFact").textContent=level.fact;
 $("wordHelp").textContent="Find "+level.words.length+" words hidden in this "+level.size+"×"+level.size+" grid:";
}
function renderChapters(){
 const root=$("chapterTrack");root.replaceChildren();
 for(const c of WORD_SEARCH_CHAPTERS){
  const done=progress.stars.slice(c.from-1,c.to).every(Boolean);
  const node=document.createElement("div");
  node.className="chapter"+(level.chapter===c.id?" active":"")+(done?" complete":"")+(c.from-1>progress.unlocked?" locked":"");
  const emoji=document.createElement("span");emoji.className="em";emoji.textContent=c.emoji;
  const title=document.createElement("strong");title.textContent=c.name;
  const sub=document.createElement("small");sub.textContent="Levels "+c.from+"–"+c.to+" · "+c.size+"×"+c.size;
  node.append(emoji,title,sub);root.append(node);
 }
}
function renderPicker(){
 const picker=$("levelPicker");picker.replaceChildren();
 for(let i=0;i<=progress.unlocked;i++){
  const item=document.createElement("option");item.value=i;
  item.textContent=(progress.stars[i]?"⭐ ":"○ ")+"Level "+(i+1)+" · "+WORD_SEARCH_LEVELS[i].chapterName;
  picker.append(item);
 }
 picker.value=String(levelIndex);
}
function renderWords(){
 const root=$("wordList");root.replaceChildren();
 for(const word of level.words){
  const li=document.createElement("li");
  li.dataset.word=word;li.textContent=found.has(word)?"✓ "+word:word;
  if(found.has(word))li.className="found";
  root.append(li);
 }
}
function cellsMarked(){
 const result=new Map();
 for(const [j,place] of puzzle.placements.entries())
  if(found.has(place.word))for(const i of place.cells)if(!result.has(i))result.set(i,j%8);
 return result;
}
function drawGrid(focus=-1){
 const n=puzzle.size,grid=$("wordGrid");
 grid.style.setProperty("--n",String(n));grid.dataset.size=String(n);
 grid.setAttribute("aria-label","Level "+(levelIndex+1)+": "+n+" by "+n+" word search letter grid");
 const marked=cellsMarked();
 grid.replaceChildren();
 for(let i=0;i<n*n;i++){
  const button=document.createElement("button");button.type="button";
  const foundColor=marked.get(i);
  button.className="letter"+(foundColor!==undefined?" found"+foundColor:"")+
   (preview.includes(i)?" preview":"")+(hinted===i?" hinted":"");
  button.dataset.cell=String(i);button.textContent=puzzle.letters[i];
  button.setAttribute("aria-label","Row "+(Math.floor(i/n)+1)+", column "+(i%n+1)+", letter "+puzzle.letters[i]+
   (foundColor!==undefined?", found word":""));
  grid.append(button);
 }
 if(focus>=0)grid.querySelector('[data-cell="'+focus+'"]')?.focus({preventScroll:true});
}
function drawHighlights(){
 const grid=$("wordGrid"),marked=cellsMarked();
 for(const button of grid.children){
  const i=Number(button.dataset.cell),c=marked.get(i);
  button.className="letter"+(c!==undefined?" found"+c:"")+(preview.includes(i)?" preview":"")+
   (hinted===i?" hinted":"");
 }
 $("selectionPreview").textContent=preview.length?
  preview.map(i=>puzzle.letters[i]).join(""):"Tap the first and last letter, or drag across a word!";
}
function render(){setHeader();renderChapters();renderPicker();renderWords();drawGrid();drawHighlights()}
function setPreview(first,last){
 preview=lineCells(first,last,puzzle.size);
 drawHighlights();
}
function clearSelection(){pending=-1;drag=null;preview=[];drawHighlights();}
function finishWord(){
 if(found.size!==level.words.length||celebrating)return;
 celebrating=true;
 const fresh=progress.stars[levelIndex]===0;
 const stars=hints===0&&misses===0?3:hints<=2?2:1;
 progress.stars[levelIndex]=Math.max(progress.stars[levelIndex],stars);
 progress.unlocked=Math.max(progress.unlocked,Math.min(COUNT-1,levelIndex+1));
 save(levelIndex===COUNT-1?levelIndex:levelIndex+1);
 if(fresh)try{
  window.LarriVerseArcade?.award?.(GAME_ID,{
   xp:15+Math.min(55,levelIndex+1),kc:3,score:(levelIndex+1)*100+stars*10,
   completed:true,metric:{words:found.size}
  });
 }catch{/* Rewards never block learning or next-level navigation. */}
 $("winTitle").textContent=levelIndex===59?"🏆 All 60 Word Searches Complete!":"🎉 Level "+(levelIndex+1)+" cleared!";
 $("winMessage").textContent="You found every word and earned "+stars+" star"+(stars===1?"":"s")+"! "+
  (levelIndex===59?"You're a Word Search Champion!":"Your next puzzle is unlocked.");
 $("nextLevel").textContent=levelIndex===59?"Replay final puzzle":"Next Level "+(levelIndex+2)+" →";
 $("celebration").hidden=false;
 buddy("Amazing detective work! Every word is found. 🌟");
 feedback("All words found! Your next level is ready.","good");
 render();$("celebration").scrollIntoView({behavior:"auto",block:"nearest"});
}
function acceptSelection(cells){
 preview=[];
 if(celebrating)return;
 const match=puzzle.placements.find(p=>!found.has(p.word)&&matchWord(p,cells));
 if(!match){
  misses++;
  feedback("Not quite a listed word. Try following the letters in one straight line.","try");
  buddy("Look carefully at the word list. The letters must form a straight line.");
 }else{
  found.add(match.word);hinted=-1;save();
  feedback("✨ You found "+match.word+"! "+found.size+" of "+level.words.length+" words discovered.","good");
  buddy("Fantastic! "+match.word+" is on the list. Keep hunting!");
 }
 renderWords();drawHighlights();setHeader();
 if(match)finishWord();
}
function tapCell(index){
 if(celebrating)return;
 if(pending<0){pending=index;setPreview(index,index);feedback("Great! Now choose the last letter of the word.");return;}
 if(pending===index){clearSelection();return;}
 const start=pending;pending=-1;
 const cells=lineCells(start,index,puzzle.size);
 if(!cells.length){clearSelection();feedback("Try a straight row, column or diagonal.","try");return}
 acceptSelection(cells);clearSelection();
}
function pointerIndex(event){
 const board=$("wordGrid"),n=puzzle.size;
 // Pointer capture retargets events to the board while dragging, but
 // elementFromPoint still identifies the exact square under the finger.
 const hit=document.elementFromPoint(event.clientX,event.clientY)?.closest?.("[data-cell]");
 if(hit&&board.contains(hit))return Number(hit.dataset.cell);
 const rect=board.getBoundingClientRect(),style=getComputedStyle(board);
 const left=parseFloat(style.borderLeftWidth)||0,top=parseFloat(style.borderTopWidth)||0;
 const right=parseFloat(style.borderRightWidth)||0,bottom=parseFloat(style.borderBottomWidth)||0;
 const x=event.clientX-rect.left-left,y=event.clientY-rect.top-top;
 const col=Math.floor(x/(rect.width-left-right)*n),row=Math.floor(y/(rect.height-top-bottom)*n);
 return row>=0&&col>=0&&row<n&&col<n?row*n+col:-1;
}
const board=$("wordGrid");
// Mouse and touch are separate streams. Mouse tests and desktop users get
// stable mousedown/mousemove/mouseup events; touch/stylus uses pointer events.
function beginDrag(event,input){
 if(celebrating||event.button!==0)return;
 const start=pointerIndex(event);
 if(start<0)return;
 event.preventDefault();
 drag={start,last:start,moved:false,input,pointerId:input==="pointer"?event.pointerId:null};
 setPreview(start,start);
}
function moveDrag(event,input){
 if(!drag||drag.input!==input||(input==="pointer"&&drag.pointerId!==event.pointerId))return;
 const next=pointerIndex(event);
 if(next<0)return;
 if(next!==drag.start)drag.moved=true;
 if(next!==drag.last){drag.last=next;setPreview(drag.start,next)}
}
function endDrag(event,input){
 if(!drag||drag.input!==input||(input==="pointer"&&drag.pointerId!==event.pointerId))return;
 const state=drag;drag=null;
 let end=pointerIndex(event);
 if(end<0||(end===state.start&&state.moved))end=state.last;
 if(end!==state.start||state.moved){
  pending=-1;
  const cells=lineCells(state.start,end,puzzle.size);
  if(cells.length>1)acceptSelection(cells);
  else feedback("Follow a straight row, column or diagonal.","try");
  clearSelection();
 }else tapCell(state.start);
}
board.addEventListener("pointerdown",event=>{
 if(event.pointerType==="mouse")return;
 beginDrag(event,"pointer");
});
window.addEventListener("pointermove",event=>{
 if(event.pointerType==="mouse")return;
 moveDrag(event,"pointer");
});
window.addEventListener("pointerup",event=>{
 if(event.pointerType==="mouse")return;
 endDrag(event,"pointer");
});
window.addEventListener("pointercancel",event=>{
 if(drag?.input==="pointer"&&drag.pointerId===event.pointerId)clearSelection();
});
board.addEventListener("mousedown",event=>beginDrag(event,"mouse"));
window.addEventListener("mousemove",event=>moveDrag(event,"mouse"));
window.addEventListener("mouseup",event=>endDrag(event,"mouse"));
board.addEventListener("keydown",event=>{
 const focus=event.target.closest?.("[data-cell]");if(!focus)return;
 const i=Number(focus.dataset.cell),n=puzzle.size;
 const next={
  ArrowRight:i%n<n-1?i+1:i,ArrowLeft:i%n>0?i-1:i,
  ArrowDown:i+n<n*n?i+n:i,ArrowUp:i-n>=0?i-n:i
 }[event.key];
 if(next!==undefined){event.preventDefault();board.querySelector('[data-cell="'+next+'"]')?.focus();return}
 if(event.key==="Enter"||event.key===" "){event.preventDefault();tapCell(i)}
 if(event.key==="Escape"){event.preventDefault();clearSelection()}
});
function startLevel(target,restore=false){
 const idx=Number(target);
 levelIndex=Number.isInteger(idx)?Math.max(0,Math.min(progress.unlocked,idx)):0;
 level=WORD_SEARCH_LEVELS[levelIndex];puzzle=createWordSearch(level);
 found=new Set();hints=0;misses=0;hinted=-1;preview=[];pending=-1;drag=null;celebrating=false;
 if(restore&&progress.current?.level===levelIndex){
  const previous=progress.current;
  if(Array.isArray(previous.found))for(const word of previous.found)
   if(level.words.includes(word))found.add(word);
  hints=Number.isInteger(previous.hints)?Math.min(999,Math.max(0,previous.hints)):0;
  misses=Number.isInteger(previous.misses)?Math.min(999,Math.max(0,previous.misses)):0;
 }
 $("celebration").hidden=true;
 if(found.size===level.words.length)found.clear();
 save();render();
 buddy(level.chapter===0?"Start with across and down. Find one word at a time!":
  level.chapter===1?"Some words run backwards. Check both directions!":"Look carefully for diagonal and backward words too!");
 feedback("Ready for Level "+(levelIndex+1)+"! Find "+level.words.length+" hidden words.");
}
$("hintButton").addEventListener("click",()=>{
 if(celebrating)return;
 const next=puzzle.placements.find(p=>!found.has(p.word));if(!next)return;
 hinted=next.cells[0];hints++;save();drawHighlights();setHeader();
 feedback("💡 Hint: "+next.word+" begins at row "+(Math.floor(hinted/puzzle.size)+1)+
  ", column "+(hinted%puzzle.size+1)+". The dotted square marks its first letter!","good");
 buddy("Follow the word "+next.word+" from that square. You can do it!");
});
$("clearSelection").addEventListener("click",()=>{clearSelection();feedback("Selection cleared. Choose a new first letter.");});
$("restartLevel").addEventListener("click",()=>startLevel(levelIndex));
$("levelPicker").addEventListener("change",event=>startLevel(Number(event.target.value)));
$("nextLevel").addEventListener("click",()=>startLevel(levelIndex===59?59:levelIndex+1));
window.addEventListener("larriverse:profile",()=>setHeader());
startLevel(levelIndex,true);
