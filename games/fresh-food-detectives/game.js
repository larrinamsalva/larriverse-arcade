import { CHAPTERS, SAMPLE_BAKERY, LEVELS } from "./levels.js";

const GAME_ID="fresh-food-detectives";
const SAVE_KEY="larriverse.freshFoodDetectives.v1";
const $=id=>document.getElementById(id);
const count=LEVELS.length;

function fresh(){return{unlocked:0,open:0,stars:Array(count).fill(0)}}
function load(){
  try{
    const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");
    if(!raw||!Array.isArray(raw.stars)||raw.stars.length!==count)return fresh();
    return{
      unlocked:Number.isInteger(raw.unlocked)?Math.max(0,Math.min(count-1,raw.unlocked)):0,
      open:Number.isInteger(raw.open)?Math.max(0,Math.min(count-1,raw.open)):0,
      stars:raw.stars.map(v=>Number.isInteger(v)&&v>=0&&v<=3?v:0)
    };
  }catch{return fresh()}
}
let progress=load();
progress.unlocked=Math.max(progress.unlocked,Math.min(count-1,progress.stars.findLastIndex(v=>v>0)+1));
progress.open=Math.min(progress.open,progress.unlocked);
let index=progress.open;
let wrong=0,answered=false;

function save(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({unlocked:progress.unlocked,open:index,stars:progress.stars}))}catch{}
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function chapterOf(i){return Math.floor(i/10)}
function productModel(p,label){
  const tie=p.tie?'<span class="bread-tie" style="--tie:'+esc(p.tieHex)+'" title="'+esc(p.tie)+' tie"></span>':"";
  return '<div class="food-model kind-'+esc(p.kind)+'">'+
    '<div class="food-shadow"></div>'+
    '<div class="package-top"></div><div class="package-side"></div>'+
    '<div class="package-front">'+
      '<span class="food-icon" aria-hidden="true">'+esc(p.icon)+'</span>'+
      '<strong>'+esc(p.name)+'</strong>'+
      '<span class="mini-brand">Larri Market</span>'+
      '<span class="package-date">'+esc(label)+'</span>'+tie+
    '</div></div>';
}
function renderChapters(){
  const current=chapterOf(index),done=progress.stars.filter(Boolean).length;
  $("chapterTrack").innerHTML=CHAPTERS.map((c,i)=>{
    const start=i*10,end=start+9,complete=progress.stars.slice(start,end+1).every(Boolean);
    return '<div class="chapter-tile '+(i===current?"active ":"")+(complete?"complete ":"")+(start>progress.unlocked?"locked":"")+'">'+
      '<span>'+c.icon+'</span><strong>'+(i+1)+'. '+esc(c.title)+'</strong><small>Levels '+(start+1)+'–'+(end+1)+'</small></div>';
  }).join("");
  $("progressFill").style.width=(done/count*100)+"%";
  document.querySelector(".progress-track").setAttribute("aria-valuenow",String(done));
}
function renderSelect(){
  $("levelSelect").innerHTML=Array.from({length:progress.unlocked+1},(_,i)=>
    '<option value="'+i+'">'+(progress.stars[i]?"⭐":"○")+' Level '+(i+1)+' · '+esc(CHAPTERS[chapterOf(i)].title)+'</option>'
  ).join("");
  $("levelSelect").value=String(index);
}
function renderBakery(level){
  const visible=level.chapter===8;
  $("bakeryChart").hidden=!visible;
  if(!visible)return;
  $("tieLegend").innerHTML=SAMPLE_BAKERY.colors.map(item=>
    '<span><i style="--tie:'+item.hex+'"></i><b>'+esc(item.color)+'</b><small>'+esc(item.day)+'</small></span>'
  ).join("");
}
function render(){
  const level=LEVELS[index],chapter=CHAPTERS[level.chapter];
  $("levelChapter").textContent="Chapter "+(level.chapter+1)+" of 12 · "+chapter.title;
  $("levelTitle").textContent=level.title;
  $("levelSummary").textContent=chapter.summary;
  $("levelCounter").textContent=(index+1)+" / "+count;
  $("chapterCounter").textContent=(level.chapter+1)+" / 12";
  $("starCounter").textContent=progress.stars.reduce((a,b)=>a+b,0)+" / "+(count*3);
  $("progressText").textContent=progress.stars.filter(Boolean).length+" cleared";
  $("foodObject").innerHTML=productModel(level.product,level.visualLabel);
  $("visualLabel").textContent=level.visualLabel;
  $("modelCaption").textContent="3-D practice model: "+level.product.name;
  $("questionText").textContent=level.prompt;
  $("answers").innerHTML=level.options.map((option,i)=>'<button type="button" data-answer="'+i+'">'+esc(option)+'</button>').join("");
  $("answers").querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>choose(Number(btn.dataset.answer))));
  $("feedback").className="feedback";
  $("feedback").textContent="Look closely at the package, then choose an answer.";
  $("nextButton").hidden=true;
  $("hintButton").disabled=false;
  $("celebration").hidden=true;
  $("buddyMessage").textContent=level.chapter===8?SAMPLE_BAKERY.note:"Printed information beats guessing. Check the whole package.";
  wrong=0;answered=false;
  renderChapters();renderSelect();renderBakery(level);save();
}
function choose(choice){
  if(answered)return;
  const level=LEVELS[index],buttons=[...$("answers").querySelectorAll("button")];
  if(choice!==level.answer){
    wrong++;
    buttons[choice].classList.add("wrong");
    buttons[choice].disabled=true;
    $("feedback").className="feedback error";
    $("feedback").textContent="Good detective work checking an idea. Try another clue.";
    $("buddyMessage").textContent="Use the exact words on the package or the chart. Dates and codes can look similar.";
    return;
  }
  answered=true;
  buttons.forEach((button,i)=>{button.disabled=true;if(i===level.answer)button.classList.add("correct")});
  const wasNew=progress.stars[index]===0;
  const stars=wrong===0?3:wrong===1?2:1;
  progress.stars[index]=Math.max(progress.stars[index],stars);
  progress.unlocked=Math.max(progress.unlocked,Math.min(count-1,index+1));
  $("feedback").className="feedback success";
  $("feedback").textContent="Correct! "+level.explanation;
  $("buddyMessage").textContent=level.explanation;
  $("nextButton").hidden=false;
  $("hintButton").disabled=true;
  if(wasNew){
    try{
      window.LarriVerseArcade?.award?.(GAME_ID,{
        xp:6,kc:1,score:(index+1)*10+stars,
        completed:index===count-1,
        metrics:{activitiesCompleted:1}
      });
    }catch{}
  }
  renderChapters();renderSelect();save();
  if(index%10===9||index===count-1)showCelebration(stars);
}
function showCelebration(stars){
  const final=index===count-1;
  $("winTitle").textContent=final?"🏆 Fresh Food Detective!":"Chapter "+(chapterOf(index)+1)+" complete!";
  $("winText").textContent=final
    ?"You explored all 120 food-label missions — dates, package clues, sample bread-tie charts, lot codes, storage directions, and shopping checks."
    :"You cleared ten more food-label levels and earned "+stars+" star"+(stars===1?"":"s")+" on this one.";
  $("celebrateNext").textContent=final?"Replay level 120":"Start next chapter →";
  $("celebration").hidden=false;
}
function next(){
  if(index<count-1)index=Math.min(progress.unlocked,index+1);
  render();
  $("gamePanel").focus({preventScroll:true});
}
$("levelSelect").addEventListener("change",e=>{index=Number(e.target.value);render()});
$("nextButton").addEventListener("click",next);
$("celebrateNext").addEventListener("click",next);
$("hintButton").addEventListener("click",()=>{
  const level=LEVELS[index];
  $("feedback").className="feedback hint";
  $("feedback").textContent=level.chapter===8
    ?"Use the Sunny Bakery chart shown above, then remember that real bakery color systems can be different."
    :level.chapter===9
      ?"Look for words that explicitly introduce a date. LOT, BATCH, LINE, and similar codes may be manufacturer-specific."
      :"Read the exact words on the package and think about storage or package condition — not just the calendar number.";
});
window.addEventListener("larriverse:profile",render);
render();
