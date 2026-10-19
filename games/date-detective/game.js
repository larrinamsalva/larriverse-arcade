import { DATE_DETECTIVE_CHAPTERS, DATE_DETECTIVE_CHALLENGES } from "./challenges.js";

const GAME_ID="date-detective";
const SAVE_KEY="larriverse.dateDetective.v1";
const $=(id)=>document.getElementById(id);
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

let state=load();
let selected=null;
let solvedCurrent=false;
let hintOpen=false;

function load(){
  try{
    const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");
    if(!raw||typeof raw!=="object")return {level:0,unlocked:1,solved:[]};
    const solved=Array.isArray(raw.solved)?[...new Set(raw.solved.filter(n=>Number.isInteger(n)&&n>=1&&n<=80))]:[];
    const unlocked=clamp(Number.isInteger(raw.unlocked)?raw.unlocked:1,1,80);
    return {level:clamp(Number.isInteger(raw.level)?raw.level:0,0,unlocked-1),unlocked,solved};
  }catch{return {level:0,unlocked:1,solved:[]};}
}
function save(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch{}
}
function current(){return DATE_DETECTIVE_CHALLENGES[state.level];}
function letter(index){return String.fromCharCode(65+index);}
function solvedCount(){return state.solved.length;}

function renderChapters(){
  $("chapterTrack").innerHTML=DATE_DETECTIVE_CHAPTERS.map((chapter,index)=>{
    const first=index*10;
    const last=first+9;
    const completed=Array.from({length:10},(_,i)=>first+i+1).every(id=>state.solved.includes(id));
    const unlocked=state.unlocked>first;
    const active=current().chapter===index;
    return '<button type="button" class="chapter-chip'+(active?" active":"")+(completed?" done":"")+'" data-chapter="'+index+'" '+(unlocked?"":"disabled")+'>'+chapter.icon+" "+chapter.name+"</button>";
  }).join("");
}
function renderLevelSelect(){
  $("levelSelect").innerHTML=DATE_DETECTIVE_CHALLENGES.slice(0,state.unlocked).map((item,index)=>
    '<option value="'+index+'">Level '+item.id+" · "+DATE_DETECTIVE_CHAPTERS[item.chapter].name+"</option>"
  ).join("");
  $("levelSelect").value=String(state.level);
}
function renderProgress(){
  $("levelReadout").textContent="Level "+current().id+" of 80";
  $("solvedReadout").textContent=String(solvedCount());
  $("progressBar").setAttribute("aria-valuenow",String(current().id));
  $("progressFill").style.width=(current().id/80*100)+"%";
  renderChapters();
  renderLevelSelect();
}
function resetCase(){
  selected=null;
  solvedCurrent=state.solved.includes(current().id);
  hintOpen=false;
}
function render(){
  const item=current();
  const chapter=DATE_DETECTIVE_CHAPTERS[item.chapter];
  $("chapterLabel").textContent="Chapter "+(item.chapter+1)+" · "+chapter.name;
  $("packageName").textContent=item.packageName;
  $("caseNumber").textContent="Case "+String(item.id).padStart(2,"0");
  $("dateLabel").textContent=item.label;
  $("dateQuestion").textContent=item.prompt;
  $("hintText").textContent="Tap Hint if you want a clue before answering.";
  $("feedbackBanner").className="feedback-banner";
  $("feedbackBanner").textContent=solvedCurrent?"✅ You already solved this case. Try it again or move on.":"🔎 Read the package carefully, then choose the best answer.";
  $("explanationCard").className="explanation-card";
  $("explanationTitle").textContent=solvedCurrent?"Case solved":"Solve the case first";
  $("explanationText").textContent=solvedCurrent?item.tip:"After you answer, this card explains why the choice is right and what the label means.";
  $("answerChoices").innerHTML=item.options.map((option,index)=>
    '<button type="button" class="answer-option" data-answer="'+index+'"><span class="letter">'+letter(index)+'</span><span>'+option.text+"</span></button>"
  ).join("");
  $("nextButton").disabled=!solvedCurrent;
  $("nextButton").textContent=item.id===80?"Finish Date Detective ✓":"Next case →";
  renderProgress();
}
function choose(index){
  const item=current();
  selected=index;
  document.querySelectorAll(".answer-option").forEach((node,i)=>{
    node.classList.toggle("selected",i===index);
    node.classList.remove("correct","wrong");
  });
  const node=document.querySelector('[data-answer="'+index+'"]');
  if(index===item.answer){
    node.classList.add("correct");
    solvedCurrent=true;
    const fresh=!state.solved.includes(item.id);
    if(fresh){
      state.solved.push(item.id);
      state.solved.sort((a,b)=>a-b);
      state.unlocked=Math.max(state.unlocked,Math.min(80,item.id+1));
      try{window.LarriVerseArcade?.award?.(GAME_ID,{xp:8,kc:1,score:state.solved.length*100,completed:item.id===80,metric:{casesSolved:state.solved.length}});}catch{}
    }
    save();
    $("feedbackBanner").className="feedback-banner good";
    $("feedbackBanner").textContent="✅ Correct — case solved!";
    $("explanationCard").className="explanation-card solved";
    $("explanationTitle").textContent="Why that works";
    $("explanationText").textContent=item.options[index].why+" "+item.tip;
    $("nextButton").disabled=false;
    renderProgress();
  }else{
    node.classList.add("wrong");
    $("feedbackBanner").className="feedback-banner bad";
    $("feedbackBanner").textContent="❌ Not quite. That answer does not match the label clue — try again.";
    $("explanationTitle").textContent="Try another clue";
    $("explanationText").textContent=item.options[index].why;
    $("nextButton").disabled=true;
  }
}
function clearChoice(){
  selected=null;
  document.querySelectorAll(".answer-option").forEach(node=>node.classList.remove("selected","correct","wrong"));
  $("feedbackBanner").className="feedback-banner";
  $("feedbackBanner").textContent="🔎 Choice cleared. Read the words around the date and try again.";
  $("explanationTitle").textContent=solvedCurrent?"Case solved":"Solve the case first";
  $("explanationText").textContent=solvedCurrent?current().tip:"After you answer, this card explains why the choice is right and what the label means.";
  $("nextButton").disabled=!solvedCurrent;
}
function next(){
  if(!solvedCurrent)return;
  if(current().id===80){
    $("feedbackBanner").className="feedback-banner good";
    $("feedbackBanner").textContent="🏆 All 80 cases solved — Date Detective badge earned!";
    $("explanationTitle").textContent="Master detective rule";
    $("explanationText").textContent="Read the phrase, date, product type, storage directions, and package condition. If a code has no reliable key, do not guess it.";
    return;
  }
  state.level=Math.min(state.level+1,state.unlocked-1);
  save();resetCase();render();
}
function jump(level){
  const next=clamp(level,0,state.unlocked-1);
  state.level=next;save();resetCase();render();
}

$("answerChoices").addEventListener("click",(event)=>{
  const button=event.target.closest("[data-answer]");
  if(button)choose(Number(button.dataset.answer));
});
$("hintButton").addEventListener("click",()=>{
  hintOpen=!hintOpen;
  $("hintText").textContent=hintOpen?current().tip:"Tap Hint if you want a clue before answering.";
  $("hintButton").textContent=hintOpen?"💡 Hide hint":"💡 Hint";
});
$("clearChoiceButton").addEventListener("click",clearChoice);
$("nextButton").addEventListener("click",next);
$("levelSelect").addEventListener("change",(event)=>jump(Number(event.target.value)));
$("chapterTrack").addEventListener("click",(event)=>{
  const button=event.target.closest("[data-chapter]");
  if(!button||button.disabled)return;
  const first=Number(button.dataset.chapter)*10;
  jump(Math.min(first,state.unlocked-1));
});

resetCase();
render();
