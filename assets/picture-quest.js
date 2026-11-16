import { actionPicture, scenePicture, spiderPicture } from './picture-quest-art.js';
import { renderHelpAnswerPicture } from './helping-hands-answer-art.js';
import { renderHelpScenePicture } from './helping-hands-picture-art.js';
import { showSpiderWildlife } from './spider-wildlife-art.js';
// Same offline, accessible choice-board engine for both worlds. No timers,
// accounts, user-entered medical data, location, uploads, or remote assets.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const el=id=>document.getElementById(id);
const text=(parent,tag,content,className)=>{
  const node=document.createElement(tag);
  node.textContent=content;
  if(className)node.className=className;
  parent.append(node);
  return node;
};
export function startPictureQuest({id,world,chapters,missions,onSceneChange}){
  const KEY='larriverse.'+id+'.v1';
  if(missions.length!==80||chapters.length!==8)throw Error('World needs eight chapters and eighty picture missions');
  function load(){
    try{
      const raw=JSON.parse(localStorage.getItem(KEY)||'null');
      if(!raw||typeof raw!=='object')return {level:0,solved:[]};
      return {
        level:clamp(Number.isInteger(raw.level)?raw.level:0,0,missions.length-1),
        solved:[...new Set((Array.isArray(raw.solved)?raw.solved:[]).filter(n=>Number.isInteger(n)&&n>=1&&n<=80))].sort((a,b)=>a-b)
      };
    }catch{return {level:0,solved:[]};}
  }
  let state=load(),choice=null,hint=false;
  const current=()=>missions[state.level];
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{
    el('feedback').textContent='You can keep playing, but this browser could not save your progress.';
  }};
  function draw(){
    const mission=current(), chapter=chapters[mission.chapter],solved=state.solved.includes(mission.id);
    el('caseCount').textContent='Mission '+mission.id+' / 80';
    el('solvedCount').textContent=String(state.solved.length);
    el('progress').style.width=(state.solved.length/80*100)+'%';
    el('progressBar').setAttribute('aria-valuenow',String(state.solved.length));
    el('chapterLabel').textContent='Chapter '+(mission.chapter+1)+' · '+chapter.name;
    el('caseTitle').textContent=mission.title;
    el('question').textContent=mission.prompt;
    el('observation').textContent=mission.observation;
    const art=el('sceneArt');
    let sceneReady;
    if(world==='help'){
      renderHelpScenePicture(art,mission);
    }else{
      art.innerHTML=scenePicture(mission,world);
      sceneReady=showSpiderWildlife(art.firstElementChild);
    }
    art.setAttribute('aria-label',mission.sceneAlt||mission.title+' illustration. Use the written clues for safety.');
    el('choices').replaceChildren();
    mission.options.forEach((option,index)=>{
      const button=document.createElement('button');
      button.type='button';button.className='picture-answer';button.dataset.answer=String(index);
      const image=document.createElement('span');image.className='answer-art';
      if(option.spider){
        image.innerHTML=spiderPicture(option.spider);
        showSpiderWildlife(image.firstElementChild);
      }else if(world==='help'){
        renderHelpAnswerPicture(image,option.icon);
      }else{
        image.innerHTML=actionPicture(option.icon);
      }
      image.setAttribute('aria-hidden','true');
      text(button,'strong',String.fromCharCode(65+index)+'. '+option.text,'answer-title');
      button.prepend(image);
      button.addEventListener('click',()=>choose(index));
      el('choices').append(button);
    });
    el('chapters').replaceChildren();
    chapters.forEach((c,index)=>{
      const button=document.createElement('button');
      button.type='button';button.className='chapter-chip'+(index===mission.chapter?' active':'');
      button.dataset.chapter=String(index);
      button.setAttribute('aria-pressed',String(index===mission.chapter));
      text(button,'strong',c.icon+' '+c.name);
      const count=state.solved.filter(n=>Math.floor((n-1)/10)===index).length;
      text(button,'small',count+' / 10 discoveries');
      el('chapters').append(button);
    });
    el('levelSelect').replaceChildren();
    missions.forEach((m,i)=>{
      const o=document.createElement('option');o.value=String(i);
      o.textContent='Mission '+m.id+' · '+chapters[m.chapter].name+(state.solved.includes(m.id)?' ✓':'');
      el('levelSelect').append(o);
    });
    el('levelSelect').value=String(state.level);
    choice=null;hint=false;
    el('hint').textContent='💡 Show a clue';
    el('teaching').textContent=solved?mission.explanation:'Choose a picture to learn why it helps.';
    el('feedback').className='feedback';
    el('feedback').textContent=solved?'Discovery saved! You can revisit any mission.':'Look at the picture and clues. Take your time—there is no timer.';
    el('next').textContent=mission.id===80?'Return to mission 1 ↺':'Next picture →';
    onSceneChange?.(sceneReady);
  }
  function choose(index){
    const item=current(),good=index===item.answer;
    choice=index;
    for(const button of el('choices').querySelectorAll('button')){
      const idx=Number(button.dataset.answer);
      button.classList.toggle('picked',idx===index);
      button.classList.toggle('right',idx===index&&good);
      button.classList.toggle('try',idx===index&&!good);
    }
    el('feedback').className='feedback '+(good?'good':'retry');
    if(good){
      const fresh=!state.solved.includes(item.id);
      if(fresh){
        state.solved.push(item.id);state.solved.sort((a,b)=>a-b);
        save();
        try{window.LarriVerseArcade?.award?.(id,{
          xp:8,kc:1,score:state.solved.length*100,completed:state.solved.length===80,
          metric:{pictureMissions:state.solved.length}
        });}catch{}
      }
      el('feedback').textContent=fresh?'🌟 Great thinking! You earned a new discovery.':'🌟 Nicely remembered! You already earned this discovery.';
      el('teaching').textContent=item.explanation;
      el('solvedCount').textContent=String(state.solved.length);
      el('progress').style.width=(state.solved.length/80*100)+'%';
      el('progressBar').setAttribute('aria-valuenow',String(state.solved.length));
      const card=el('chapters').querySelector('[data-chapter="'+item.chapter+'"] small');
      if(card)card.textContent=state.solved.filter(n=>Math.floor((n-1)/10)===item.chapter).length+' / 10 discoveries';
      const option=el('levelSelect').selectedOptions[0];
      if(option&&!option.textContent.endsWith(' ✓'))option.textContent+=' ✓';
    }else{
      el('feedback').textContent='Good try. That picture is not the safest match. Check the clue and try again.';
      el('teaching').textContent=item.options[index].why||'Look for the clue that matches this situation.';
    }
  }
  function jump(index){
    const n=Number(index);
    state.level=clamp(Number.isFinite(n)?n:0,0,79);
    save();draw();
  }
  el('chapters').addEventListener('click',event=>{
    const target=event.target.closest('[data-chapter]');
    if(target)jump(Number(target.dataset.chapter)*10);
  });
  el('levelSelect').addEventListener('change',event=>jump(event.target.value));
  el('next').addEventListener('click',()=>jump((state.level+1)%80));
  el('hint').addEventListener('click',()=>{
    hint=!hint;
    el('hint').textContent=hint?'Hide clue':'💡 Show a clue';
    el('teaching').textContent=hint?current().clue:(state.solved.includes(current().id)?current().explanation:'Choose a picture to learn why it helps.');
  });
  draw();
  return {getState:()=>({level:state.level,solved:[...state.solved]}),jump};
}
