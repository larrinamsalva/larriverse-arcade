import { SPECIMENS, SPECIMEN_IDS, BRUSH_STEPS, specimenById } from "./fossil-lab-data.js";
import { createFossilScene } from "./fossil-lab-3d.js";

// Separate from the 80-mission save and the nine-site trail: never write either.
const KEY="larriverse.dinoFossilLab.v1";
const $=id=>document.getElementById(id);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function read(){
  const base={version:1,selected:"bone",progress:{bone:0,track:0,leaf:0},solved:[]};
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||"null");
    if(!raw||typeof raw!=="object")return base;
    const selected=SPECIMEN_IDS.includes(raw.selected)?raw.selected:"bone";
    const progress=Object.fromEntries(SPECIMEN_IDS.map(id=>[id,clamp(Number.isInteger(raw.progress?.[id])?raw.progress[id]:0,0,BRUSH_STEPS)]));
    const solved=Array.isArray(raw.solved)?[...new Set(raw.solved.filter(id=>SPECIMEN_IDS.includes(id)))]:[];
    for(const id of solved)progress[id]=BRUSH_STEPS;
    return {version:1,selected,progress,solved};
  }catch{return base;}
}
let save=read();
const scene=createFossilScene($("fossilCanvas"));
function persist(){
  try{localStorage.setItem(KEY,JSON.stringify(save));}
  catch{$("saveNote").textContent="This browser cannot save locally right now; you may still explore the lab.";}
}
const current=()=>specimenById(save.selected);
const solved=()=>save.solved.includes(save.selected);
function collection(){
  $("fossilsFound").textContent=String(save.solved.length);
  $("fossilBadge").hidden=save.solved.length!==SPECIMEN_IDS.length;
  $("labProgress").textContent=save.solved.length+" / "+SPECIMEN_IDS.length+" careful investigations completed";
  $("fossilCards").replaceChildren();
  for(const sample of SPECIMENS){
    const done=save.solved.includes(sample.id);
    const card=document.createElement("article");card.className="fossil-card"+(done?" complete":"");
    const icon=document.createElement("span");icon.setAttribute("aria-hidden","true");icon.textContent=sample.icon;
    const name=document.createElement("strong");name.textContent=sample.name;
    const note=document.createElement("p");
    note.textContent=done?sample.explanation:"Not yet discovered. Brush its training tray to investigate.";
    const button=document.createElement("button");button.type="button";
    button.textContent=(done?"Review ":"Investigate ")+sample.name;
    button.addEventListener("click",()=>{save.selected=sample.id;persist();render();$("fossilCanvas").focus();});
    card.append(icon,name,note,button);$("fossilCards").append(card);
  }
}
function render(){
 const sample=current(),progress=save.progress[sample.id],done=solved();
 scene.setSample(sample.id,progress);
 document.querySelectorAll("[data-specimen]").forEach(btn=>{
   const active=btn.dataset.specimen===sample.id;
   btn.setAttribute("aria-pressed",String(active));btn.classList.toggle("active",active);
 });
 $("specimenName").textContent=sample.icon+" "+sample.name;
 $("specimenType").textContent=sample.kind;
 $("specimenObservation").textContent=sample.observation;
 $("brushCount").textContent=progress+" of "+BRUSH_STEPS+" layers";
 $("brushBar").style.width=(progress/BRUSH_STEPS*100)+"%";
 $("brushProgress").setAttribute("aria-valuenow",String(progress));
 $("brushLayer").disabled=progress>=BRUSH_STEPS;
 $("brushNote").textContent=progress===BRUSH_STEPS?
   "All four training soil layers are cleared. Study the evidence and choose a supported conclusion.":
   "Real fossils are delicate. Brush slowly and remember which layer held each clue.";
 $("specimenEvidence").textContent=progress===BRUSH_STEPS?sample.evidence:
   "First brush the training soil to reveal the evidence. You can turn the 3D tray while you work.";
 $("labQuestion").textContent=sample.question;
 $("labChoices").replaceChildren();
 for(const [i,option] of sample.choices.entries()){
   const button=document.createElement("button");
   button.type="button";button.className="science-choice";
   button.textContent=String.fromCharCode(65+i)+". "+option;
   button.disabled=progress<BRUSH_STEPS;
   if(done && i===sample.answer)button.classList.add("correct");
   button.addEventListener("click",()=>answer(i,button));
   $("labChoices").append(button);
 }
 $("labExplanation").hidden=!done;
 $("labScience").textContent=done?sample.explanation:"";
 $("labFeedback").className="feedback"+(done?" good":"");
 $("labFeedback").textContent=done?"✓ Discovery recorded! Review the explanation or choose another training tray.":
   progress===BRUSH_STEPS?"The evidence is visible. Which explanation does it support?":
   "Gently brush the soil away. There is no time limit.";
 $("fossilCanvas").setAttribute("aria-label","Simplified 3D "+sample.name+" training specimen, "+progress+" of "+BRUSH_STEPS+" soil layers brushed. Use A and D or arrows to orbit, plus or minus to zoom. Scientific clues also appear in the Evidence notebook.");
 collection();
}
function answer(index,button){
 const sample=current();
 if(save.progress[sample.id]<BRUSH_STEPS)return;
 $("labChoices").querySelectorAll("button").forEach(b=>b.classList.remove("wrong","correct"));
 if(index!==sample.answer){
   button.classList.add("wrong");
   $("labFeedback").className="feedback try";
   $("labFeedback").textContent="Good observation! Look again: "+sample.evidence+" Try a more careful conclusion.";
   return;
 }
 button.classList.add("correct");
 if(!save.solved.includes(sample.id)){
   save.solved.push(sample.id);
   persist();
 }
 $("labFeedback").className="feedback good";
 $("labFeedback").textContent="✓ Careful discovery recorded! "+sample.explanation;
 $("labExplanation").hidden=false;
 $("labScience").textContent=sample.explanation;
 collection();
}
document.querySelectorAll("[data-specimen]").forEach(btn=>btn.addEventListener("click",()=>{
  save.selected=btn.dataset.specimen;persist();render();
}));
$("brushLayer").addEventListener("click",()=>{
  if(save.progress[save.selected]>=BRUSH_STEPS)return;
  save.progress[save.selected]++;
  persist();
  render();
});
$("rotateLeft").addEventListener("click",()=>scene.rotate(-.23));
$("rotateRight").addEventListener("click",()=>scene.rotate(.23));
$("zoomCloser").addEventListener("click",()=>scene.magnify(.13));
$("zoomFarther").addEventListener("click",()=>scene.magnify(-.13));
render();
