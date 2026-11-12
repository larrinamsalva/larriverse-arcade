import { CHAPTERS, MISSIONS } from "./missions.js";
import { createScene } from "./scene-3d.js";

const GAME_ID = "dino-discovery-world";
const SAVE_KEY = "larriverse.dinoDiscovery.v1";
const $ = id => document.getElementById(id);
const GUIDE = Object.freeze({
  trike:{name:"Triceratops",family:"Ceratopsian dinosaur",fact:"Late Cretaceous plant-eater with a bony frill and three facial horns."},
  rex:{name:"Tyrannosaurus rex",family:"Theropod dinosaur",fact:"Late Cretaceous meat-eater with a powerful skull and massive teeth."},
  stego:{name:"Stegosaurus",family:"Stegosaur dinosaur",fact:"Late Jurassic herbivore with back plates and four tail spikes."},
  longneck:{name:"Sauropod",family:"Long-necked dinosaur group",fact:"Many sauropods ate plants and had enormous bodies, long necks, and small heads."},
  raptor:{name:"Velociraptor-inspired theropod",family:"Feathered dinosaur",fact:"Velociraptor was smaller than its movie portrayal; fossil evidence supports feathers."},
  flyer:{name:"Pterosaur",family:"Flying reptile — not a dinosaur",fact:"Pterosaurs evolved flight independently and were distinct from dinosaurs."},
  marine:{name:"Marine reptile",family:"Prehistoric sea reptile — not a dinosaur",fact:"Mosasaurs and plesiosaurs were marine reptiles, not dinosaurs."},
  fossil:{name:"Fossil discovery",family:"Paleontology evidence",fact:"Fossil remains and trace fossils help reconstruct ancient ecosystems."},
  bird:{name:"Living bird",family:"Avian dinosaur",fact:"Modern birds are the only dinosaurs alive today."},
  impact:{name:"End-Cretaceous impact",family:"Earth history",fact:"A major asteroid impact about 66 million years ago changed the planet."}
});
const subjects = ["trike","rex","stego","longneck","raptor","flyer","marine","fossil","bird","impact"];
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
function load(){
  const base = {level:0,unlocked:1,solved:[],fieldGuide:[]};
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY)||"null");
    if(!raw||typeof raw!=="object")return base;
    const solved = Array.isArray(raw.solved) ? [...new Set(raw.solved.filter(n=>Number.isInteger(n)&&n>=1&&n<=80))].sort((a,b)=>a-b) : [];
    const unlocked = clamp(Number.isInteger(raw.unlocked)?raw.unlocked:1,1,80);
    // Chapter access is free-choice; older saved games may have a low unlocked
    // checkpoint even when a player has selected a later chapter directly.
    const level = clamp(Number.isInteger(raw.level)?raw.level:0,0,MISSIONS.length-1);
    const fieldGuide = Array.isArray(raw.fieldGuide) ? [...new Set(raw.fieldGuide.filter(k=>Object.hasOwn(GUIDE,k)))] : [];
    return {level,unlocked,solved,fieldGuide};
  } catch {return base;}
}
let state = load(), selectedSubject="trike", brushes=0, solvedHere=false, hint=false;
const scene = createScene($("dinoCanvas"));
const current = () => MISSIONS[state.level];
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch{$("feedback").textContent="This browser could not save right now; you can still play.";}}
function renderGuide(){
  const sorted = subjects.filter(s=>state.fieldGuide.includes(s));
  $("guideCount").textContent=String(sorted.length);
  $("fieldGuide").replaceChildren();
  if(!sorted.length) {
    const p=document.createElement("p");p.textContent="Solve missions to unlock specimen cards here."; $("fieldGuide").append(p);return;
  }
  for(const key of sorted){
    const info=GUIDE[key], button=document.createElement("button");
    button.type="button";button.className="guide-card";
    const title=document.createElement("strong");title.textContent=info.name;
    const description=document.createElement("small");description.textContent=info.family+" · "+info.fact;
    button.append(title,description);
    button.addEventListener("click",()=>{selectedSubject=key;updateScene();$("dinoCanvas").focus();});
    $("fieldGuide").append(button);
  }
}
function chapterRail(){
  // All eight chapter boxes are playable immediately. Discovery counts track
  // real accomplishments; being able to visit a chapter is not an award.
  $("chapters").innerHTML=CHAPTERS.map((item,i)=>{
    const active=current().chapter===i;
    const solved=MISSIONS.slice(i*10,(i+1)*10).filter(m=>state.solved.includes(m.id)).length;
    const complete=solved===10;
    return '<button type="button" data-chapter="'+i+'" aria-pressed="'+active+'" class="chapter-chip'+(active?' active':'')+(complete?' done':'')+'">'+
      '<span class="chapter-title">'+item.icon+' '+item.name+'</span>'+
      '<small class="chapter-count">'+solved+' / 10 discoveries</small></button>';
  }).join("");
}
function updateScene(){
  scene.setSubject(selectedSubject);
  $("modelName").textContent=GUIDE[selectedSubject].name;
  $("modelType").textContent=GUIDE[selectedSubject].family;
  $("dinoCanvas").setAttribute("aria-label","Interactive 3D illustrated "+GUIDE[selectedSubject].name+". "+GUIDE[selectedSubject].fact+" Use A and D or left and right arrows to orbit; Page Up and Page Down to look vertically; plus and minus to zoom.");
  if(current().mode==="dig" && brushes>0)scene.setFossilProgress(brushes/3);
}
function render(){
  const item=current(), chapter=CHAPTERS[item.chapter];
  solvedHere=state.solved.includes(item.id); hint=false; brushes=solvedHere?3:0;
  selectedSubject=item.scene;updateScene();
  $("chapterName").textContent=chapter.icon+" Chapter "+(item.chapter+1)+" · "+chapter.name;
  $("levelReadout").textContent="Mission "+item.id+" of 80";
  $("solvedCount").textContent=String(state.solved.length);
  $("progress").style.width=(state.solved.length/80*100)+"%";
  $("progressBar").setAttribute("aria-valuenow",String(state.solved.length));
  $("observation").textContent=item.observation;
  $("missionQuestion").textContent=item.prompt;
  $("hintText").textContent="Inspect the specimen and read the observation. Tap for a clue if you want one.";
  $("hintButton").textContent="💡 Show clue";
  $("feedback").className="feedback";
  $("feedback").textContent=solvedHere?"Already discovered! Revisit the mission or continue.":"Explore the model and make a discovery. There's no timer.";
  $("explanation").textContent=solvedHere?item.explanation:"The science explanation appears here when you discover the answer.";
  // Moving between learning activities never requires a correct answer first.
  $("nextMission").disabled=false;
  $("nextMission").textContent=item.id===80
    ?state.solved.length===80?"Finish museum tour 🏆":"Back to mission 1 ↺"
    :"Next mission →";
  $("brushFossil").hidden=item.mode!=="dig";
  $("brushFossil").disabled=brushes>=3;
  $("brushReadout").hidden=item.mode!=="dig";
  $("brushReadout").textContent=brushes===3?"Fossil revealed! Read the evidence.":"Brush rock carefully: "+brushes+" / 3 layers uncovered";
  $("answerChoices").replaceChildren();
  item.options.forEach((option,index)=>{
    const btn=document.createElement("button");btn.type="button";btn.className="answer-option";
    btn.dataset.answer=String(index);btn.textContent=String.fromCharCode(65+index)+". "+option;
    btn.disabled=item.mode==="dig" && brushes<3;
    btn.addEventListener("click",()=>answer(index,btn));
    $("answerChoices").append(btn);
  });
  $("levelSelect").innerHTML=MISSIONS.map((mission,i)=>
    '<option value="'+i+'">Mission '+mission.id+' · '+CHAPTERS[mission.chapter].name+(state.solved.includes(mission.id)?' ✓':'')+'</option>'
  ).join("");
  $("levelSelect").value=String(state.level);
  chapterRail();renderGuide();
}
function answer(index,button){
  const item=current();
  if(item.mode==="dig" && brushes<3)return;
  document.querySelectorAll(".answer-option").forEach(b=>b.classList.remove("correct","wrong"));
  if(index!==item.answer){
    button.classList.add("wrong");$("feedback").className="feedback try";
    $("feedback").textContent="Not quite — try another clue. You can explore as long as you like.";
    return;
  }
  button.classList.add("correct");
  const fresh=!state.solved.includes(item.id);
  if(fresh){
    state.solved.push(item.id);state.solved.sort((a,b)=>a-b);
    state.unlocked=Math.max(state.unlocked,Math.min(80,item.id+1));
    if(!state.fieldGuide.includes(item.scene))state.fieldGuide.push(item.scene);
    try{window.LarriVerseArcade?.award?.(GAME_ID,{
      xp:8,kc:1,score:state.solved.length*100,completed:state.solved.length===80,
      metric:{discoveries:state.solved.length,fossils:state.solved.filter(n=>n>=11&&n<=20).length}
    });}catch{}
  }
  solvedHere=true;persist();renderGuide();
  $("nextMission").disabled=false;
  if(state.solved.length===80&&item.id===80)$("nextMission").textContent="Finish museum tour 🏆";
  // Update the mission menu's completion indicator without replacing the
  // selected mission or resetting any of the current fossil-dig interactions.
  const selectedOption=$("levelSelect").selectedOptions[0];
  if(selectedOption&&!selectedOption.textContent.endsWith(" ✓"))selectedOption.textContent+=" ✓";
  $("feedback").className="feedback good";
  $("feedback").textContent="✓ Discovery recorded! "+(fresh?"A field-guide card has been unlocked.":"You knew this one already!");
  $("explanation").textContent=item.explanation;
  chapterRail();
  $("solvedCount").textContent=String(state.solved.length);
  $("progress").style.width=(state.solved.length/80*100)+"%";
  $("progressBar").setAttribute("aria-valuenow",String(state.solved.length));
}
function jump(level){
  state.level=clamp(Number.isFinite(level)?level:0,0,MISSIONS.length-1);
  persist();render();
}
$("chapters").addEventListener("click",e=>{
  const target=e.target.closest("[data-chapter]");
  if(!target||target.disabled)return;
  jump(Number(target.dataset.chapter)*10);
});
$("levelSelect").addEventListener("change",e=>jump(Number(e.target.value)));
$("nextMission").addEventListener("click",()=>{
  if(current().id===80){
    if(state.solved.length===80){
      $("feedback").textContent="🏆 Master Paleontologist! All 80 discoveries are in your museum.";
    }else{
      jump(0);
    }
    return;
  }
  jump(state.level+1);
});
$("brushFossil").addEventListener("click",()=>{
  if(brushes>=3)return;
  brushes++;scene.setFossilProgress(brushes/3);
  $("brushReadout").textContent=brushes===3?"Fossil revealed! Read the evidence.":"Brush rock carefully: "+brushes+" / 3 layers uncovered";
  if(brushes===3){
    $("brushFossil").disabled=true;
    $("answerChoices").querySelectorAll("button").forEach(b=>b.disabled=false);
    $("feedback").textContent="🦴 Fossil uncovered! Use your evidence to answer.";
  }
});
$("hintButton").addEventListener("click",()=>{
  hint=!hint;
  $("hintText").textContent=hint?current().explanation:"Inspect the specimen and read the observation. Tap for a clue if you want one.";
  $("hintButton").textContent=hint?"Hide clue":"💡 Show clue";
});
$("turnLeft").addEventListener("click",()=>scene.rotate(-.22));
$("turnRight").addEventListener("click",()=>scene.rotate(.22));
$("tiltUp").addEventListener("click",()=>scene.tilt(-.12));
$("tiltDown").addEventListener("click",()=>scene.tilt(.12));
$("zoomIn").addEventListener("click",()=>scene.changeZoom(.12));
$("zoomOut").addEventListener("click",()=>scene.changeZoom(-.12));
$("switchDino").addEventListener("click",()=>{
  selectedSubject=subjects[(subjects.indexOf(selectedSubject)+1)%subjects.length];
  updateScene();
  $("feedback").textContent="Free exploration: "+GUIDE[selectedSubject].name+". This does not change your mission.";
});
render();
