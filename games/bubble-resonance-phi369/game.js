'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const W=1000,H=600,PHI=1.618,LAM=.618,R=28,WALL=18,COLS=16,ROWS=10,HEX=Math.sqrt(3)*R;
const SHOT_SPEED=9,MIN_UPWARD_RATIO=.38,MAX_BOUNCES=6,MAX_TRAVEL=H*3,DROP_MS=360,POWER_INTERVAL=5,LEVEL_CLEAR_PAUSE_MS=2200;
const left=WALL,right=W-WALL,top=WALL,bottom=H-10,x0=left+R+2,y0=top+R+2;
const GAME_ID='bubble-resonance-phi369';
const CANVAS_THEMES={
  dark:{mode:'dark',wall:'#5dcaa526',aim:'#78e3c0a8',danger:'#ff7d7d70',launcherBase:'#142331',launcherRail:'#35576a',launcherRim:'#78e3c0',launcherGlow:'#5dcaa566'},
  light:{mode:'light',wall:'#2c7b7130',aim:'#126c5ab8',danger:'#b832327d',launcherBase:'#dfeaf4',launcherRail:'#8bbdb8',launcherRim:'#176f68',launcherGlow:'#2fa88355'}
};
const FREQS=[
  ['396 Hz','Liberating Guilt','#e26c6c','#5a1818',396],['417 Hz','Undoing Situations','#e8934a','#5a2808',417],
  ['528 Hz','DNA Repair','#d4c44a','#4a3c00',528],['639 Hz','Connecting','#5dcaa5','#0a3a28',639],
  ['741 Hz','Awakening Intuition','#5a9ee8','#0a1e4a',741],['852 Hz','Returning to Order','#a07de0','#200a4a',852]
].map(([name,label,color,dark,hz])=>({name,label,color,dark,hz}));
const POWER_TYPES={
  row:{name:'Row Wave',short:'ROW',description:'clears every bubble in the landing row',color:'#62e7ef'},
  burst:{name:'Star Burst',short:'BURST',description:'clears the landing bubble and all touching bubbles',color:'#ffd766'},
  sweep:{name:'Color Sweep',short:'ALL',description:'clears every bubble with its matching number',color:'#ef8bea'},
};
const POWER_ORDER=['row','burst','sweep'];
const BUBBLE_LEVELS=[
  ['First Ripple',5,3,5,'A gentle opening field with three matching frequencies.'],
  ['Coral Curve',4,3,5,'Use the side walls to reach bubbles around the curve.'],
  ['Garden Glow',5,4,5,'A fourth frequency brings new matching choices.'],
  ['Bank-Shot Bay',5,4,5,'Look for open lanes and practice one clean rebound.'],
  ['Harmony Harbor',4,4,5,'Build small groups before joining them together.'],
  ['Amber Orbit',5,4,5,'Clear the lowest clusters to open the center.'],
  ['Mint Meadow',5,5,5,'Five numbered frequencies now share the field.'],
  ['Sapphire Steps',4,5,5,'Work upward one colorful step at a time.'],
  ['Violet Vale',5,5,5,'Watch both the number and color before firing.'],
  ['Resonance Ridge',6,5,5,'A deeper field rewards careful bank shots.'],
  ['Prism Path',5,5,5,'Find the shortest path to a three-bubble match.'],
  ['Echo Garden',5,5,5,'Set up one match that opens another.'],
  ['Gemstone Grove',5,6,5,'All six frequencies join the pattern.'],
  ['Coherence Cove',6,6,5,'Clear hanging groups to make whole branches fall.'],
  ['Phi Passage',5,6,4,'The ceiling moves after four misses, so aim with care.'],
  ['Pattern Peaks',6,6,4,'Look across the entire field before choosing a lane.'],
  ['Rainbow Reach',6,6,4,'Longer chains bring the summit within reach.'],
  ['Frequency Falls',6,6,4,'Drop floating groups by clearing their top connection.'],
  ['Resonance Crown',6,6,4,'Combine number clues, color clues, and wall rebounds.'],
  ['Phi Finale',6,6,4,'Clear the final field to complete all twenty stages.'],
].map(([name,rows,frequencies,dropAfter,tip],index)=>({id:index+1,name,rows,frequencies,dropAfter,tip}));
const MAX_LEVEL=BUBBLE_LEVELS.length,currentStage=()=>BUBBLE_LEVELS[level-1]||BUBBLE_LEVELS.at(-1);
let grid=[],score=0,combo=1,level=1,coherence=50,pattern=0,integration=50,cleared=0,misses=0;
let current,next,shot=null,particles=[],powerEffects=[],gameOver=false,won=false,levelCleared=false,audioOn=false,audioCtx,awarded=false,mouse={x:W/2,y:100},messageTimer,levelAdvanceTimer=null,dropAnimation=null,powerLoads=0,powerIndex=0;
const $=s=>document.querySelector(s),pos=(c,r)=>({x:x0+c*R*2+(r%2?R:0),y:y0+r*HEX});
const rand=()=>Math.floor(Math.random()*currentStage().frequencies),distance=(a,b,c,d)=>Math.hypot(a-c,b-d);
function canvasTheme(){return CANVAS_THEMES[document.documentElement.dataset.larriverseTheme==='light'?'light':'dark']}
function syncCanvasTheme(){canvas.dataset.colorMode=canvasTheme().mode}
function profile(){return window.LarriVerseArcade?.summary?.()||{name:'Player One',avatar:'🌟',level:1,kc:0,games:{}}}
function refreshProfile(){const p=profile(),g=p.games?.[GAME_ID]||{};$('#playerName').textContent=`${p.avatar||'🌟'} ${p.name||'Player One'}`;$('#playerLevel').textContent=p.level||1;$('#playerKc').textContent=p.kc||0;$('#bestScore').textContent=(g.highScore||0).toLocaleString()}
function toast(text){const n=$('#toast');n.textContent=text;n.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>n.classList.remove('show'),2600)}
function award(){if(awarded||!window.LarriVerseArcade?.award)return;awarded=true;const completed=won,kc=score>=3600?9:score>=1200?6:3,xp=Math.max(9,Math.min(99,9+level*3+Math.floor(cleared/3)));const r=window.LarriVerseArcade.award(GAME_ID,{xp,kc,score,catches:cleared,completed});refreshProfile();toast(`FIELD RECORDED · +${xp} XP · +${kc} KC${r.milestoneBonus?` +${r.milestoneBonus} BONUS`:''}${r.unlocked?.length?` · ${r.unlocked.length} ACHIEVEMENT`:''}`)}
function ac(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}
function tone(hz,type='sine',duration=.2,volume=.07){if(!audioOn)return;try{const a=ac(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type=type;o.frequency.value=hz;g.gain.setValueAtTime(volume,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+duration);o.start();o.stop(a.currentTime+duration+.02)}catch{}}
function cellY(r){return y0+r*HEX}
function neighbours(r,c,occupiedOnly=true){const offsets=r%2?[[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1]]:[[-1,-1],[-1,0],[0,-1],[0,1],[1,-1],[1,0]];return offsets.map(([dr,dc])=>({r:r+dr,c:c+dc})).filter(n=>n.r>=0&&n.r<ROWS&&n.c>=0&&n.c<COLS&&(!occupiedOnly||grid[n.r]?.[n.c]))}
function initGrid(){const stage=currentStage();grid=Array.from({length:ROWS},(_,r)=>Array.from({length:COLS},(_,c)=>r<stage.rows?{freq:rand(),gem:c%2===0&&r%3===0&&Math.random()<.12,...pos(c,r)}:null))}
function queuedPower(){powerLoads++;if(powerLoads<POWER_INTERVAL)return null;powerLoads=0;return POWER_ORDER[powerIndex++%POWER_ORDER.length]}
function makeBubble(allowPower=true){const freq=rand();if(!allowPower)return{freq,gem:false,power:null};const power=queuedPower();return{freq,power,gem:!power&&Math.random()<.05}}
function bubbleLabel(item){const number=`${item.freq+1} · ${FREQS[item.freq].name}`;return item.power?`${POWER_TYPES[item.power].name} power · ${number} · ${POWER_TYPES[item.power].description}`:number}
function nextBubble(){current=next||makeBubble(false);next=makeBubble();$('#bubbleStatus').textContent=`Stage ${level} of ${MAX_LEVEL}, ${currentStage().name}. Your bubble: ${bubbleLabel(current)}. Next: ${bubbleLabel(next)}. Match the numbers or aim a power bubble.`}
function cluster(r,c,freq,seen=new Set()){const key=`${r},${c}`;if(seen.has(key)||!grid[r]?.[c]||grid[r][c].freq!==freq)return[];seen.add(key);return[{r,c},...neighbours(r,c).flatMap(n=>cluster(n.r,n.c,freq,seen))]}
function floating(){const connected=new Set(),queue=[];for(let c=0;c<COLS;c++)if(grid[0][c]){queue.push({r:0,c});connected.add(`0,${c}`)}while(queue.length){const n=queue.shift();for(const x of neighbours(n.r,n.c)){const k=`${x.r},${x.c}`;if(!connected.has(k)){connected.add(k);queue.push(x)}}}const result=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(grid[r][c]&&!connected.has(`${r},${c}`))result.push({r,c});return result}
function particlesAt(x,y,color,count=10){if(window.LarriVerseArcade.settings().reducedMotion)return;for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=1.3+Math.random()*3.4;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,color,life:1,size:2+Math.random()*3})}}
function announce(title,sub,color='#5dcaa5',sticky=false){const m=$('#message');m.querySelector('b').textContent=title;m.querySelector('b').style.color=color;m.querySelector('span').textContent=sub;m.classList.add('show');clearTimeout(messageTimer);if(!sticky)messageTimer=setTimeout(()=>m.classList.remove('show'),1200)}
function setLevelAction(label=''){const button=$('#levelAction'),message=$('#message'),visible=Boolean(label);button.hidden=!visible;button.textContent=label;message.classList.toggle('actionable',visible)}
function updateCoherence(){coherence=Math.round(Math.min(100,Math.max(0,PHI*(pattern/10+integration/10)+(combo-1)*2-LAM*(10-combo)*2)));$('#coherenceFill').style.width=`${coherence}%`;$('#coherenceValue').textContent=coherence}
function hud(){const stage=currentStage(),progress=(level-(levelCleared?0:1))/MAX_LEVEL*100;$('#score').textContent=score.toLocaleString();$('#combo').textContent=`×${combo}`;$('#combo').style.color=combo>=5?'var(--gold)':combo>=3?'#a45d20':'var(--mint)';$('#level').textContent=`${level} / ${MAX_LEVEL}`;$('#levelName').textContent=stage.name;$('#levelProgress').textContent=`${level} of ${MAX_LEVEL}`;$('#levelFill').style.width=`${Math.max(0,Math.min(100,progress))}%`;$('#levelTrack').setAttribute('aria-valuenow',String(levelCleared?level:level-1));$('#levelTrack').setAttribute('aria-valuetext',`${levelCleared?level:level-1} of ${MAX_LEVEL} stages cleared`);$('#dropIn').textContent=Math.max(0,stage.dropAfter-misses);$('#limit').textContent=won?'WIN':gameOver?'FULL':levelCleared?'NEXT':'CLEAR';$('#limit').style.color=won?'var(--gold)':gameOver?'var(--red)':levelCleared?'var(--gold)':'var(--mint)'}
function phiMultiplier(size){return size>=13?4:size>=8?3:size>=5?PHI:1}
function boardEmpty(){return grid.every(row=>row.every(cell=>!cell))}
function removeCells(cells,particleCount=10){const seen=new Set();let removed=0;for(const n of cells){const key=`${n.r},${n.c}`,cell=grid[n.r]?.[n.c];if(seen.has(key)||!cell)continue;seen.add(key);particlesAt(cell.x,cell.y,FREQS[cell.freq].color,particleCount);grid[n.r][n.c]=null;removed++}return removed}
function powerTargets(kind,best){
  if(kind==='row')return Array.from({length:COLS},(_,c)=>({r:best.r,c}));
  if(kind==='burst')return[best,...neighbours(best.r,best.c)];
  const targets=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(grid[r][c]?.freq===current.freq)targets.push({r,c});
  return targets;
}
function activatePower(kind,best){
  const power=POWER_TYPES[kind],removed=removeCells(powerTargets(kind,best),15),drop=floating(),dropped=removeCells(drop,7),total=removed+dropped;
  score+=removed*25+dropped*10;
  cleared+=total;
  combo=Math.min(9,combo+1);
  misses=0;
  pattern=Math.min(100,pattern+total*4);
  integration=Math.min(100,integration+total*2);
  if(!window.LarriVerseArcade?.settings?.().reducedMotion)powerEffects.push({kind,x:best.x,y:best.y,row:best.r,life:1});
  tone(kind==='row'?620:kind==='burst'?760:920,'sine',.65,.13);
  announce(power.name.toUpperCase(),`${power.description} · ${total} bubble${total===1?'':'s'} cleared`,power.color);
  updateCoherence();
  if(boardEmpty()){completeLevel();return true}
  if(danger()){hud();return true}
  hud();
  return true;
}
function place(x,y){
  let best,bestD=Infinity,fallback,fallbackD=Infinity;
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    if(grid[r][c])continue;
    const p=pos(c,r),d=distance(x,y,p.x,p.y),adjacent=r<=1||neighbours(r,c).length;
    if(!adjacent)continue;
    if(d<fallbackD){fallback={r,c,...p};fallbackD=d}
    if(d<R*2.8&&d<bestD){best={r,c,...p};bestD=d}
  }
  best||=fallback;
  if(!best)return false;
  grid[best.r][best.c]={freq:current.freq,gem:current.gem,power:current.power,x:best.x,y:best.y};
  if(current.power)return activatePower(current.power,best);
  const group=cluster(best.r,best.c,current.freq);
  if(group.length>=3){
    misses=0;
    const f=FREQS[current.freq],mult=phiMultiplier(group.length),gem=group.some(n=>grid[n.r][n.c].gem);
    score+=Math.round(group.length*10*mult*(gem?2:1)*combo);
    combo=Math.min(9,combo+1);
    cleared+=group.length;
    pattern=Math.min(100,pattern+group.length*3);
    integration=Math.min(100,integration+group.length);
    tone(f.hz,'sine',.55,.12);
    removeCells(group,12);
    const drop=floating();
    score+=drop.length*8;
    cleared+=drop.length;
    removeCells(drop,6);
    announce(group.length>=8?'PHI CHAIN':'RESONANCE',`${f.name} ×${mult.toFixed(1)}`,f.color);
  }else{
    misses++;
    combo=Math.max(1,combo-1);
    tone(200);
  }
  updateCoherence();
  if(boardEmpty()){completeLevel();return true}
  if(danger()){hud();return true}
  if(misses>=currentStage().dropAfter)ceilingDrop();
  hud();
  return true;
}
function danger(){if(grid[ROWS-1].some(Boolean)){end('BOTTOM REACHED','The stack reached the launch zone. Your bubbles stay visible so you can see what happened.');return true}return false}
function ceilingDrop(){if(gameOver||dropAnimation)return;const shifted=Array.from({length:ROWS},()=>Array(COLS).fill(null));for(let r=ROWS-1;r>=1;r--)for(let c=0;c<COLS;c++){const bubble=grid[r-1][c];if(bubble)shifted[r][c]={...bubble,...pos(c,r)}}for(let c=0;c<COLS;c++)shifted[0][c]={freq:rand(),gem:c%4===0&&Math.random()<.12,...pos(c,0)};grid=shifted;misses=0;dropAnimation={start:performance.now(),duration:DROP_MS};canvas.setAttribute('aria-busy','true');announce('CEILING DROP','Fresh bubbles are moving the field down one row','#d4c44a');hud()}
function cancelLevelAdvance(){
  clearTimeout(levelAdvanceTimer);
  levelAdvanceTimer=null;
}
function completeLevel(){
  if(gameOver||levelCleared)return;
  shot=null;dropAnimation=null;canvas.setAttribute('aria-busy','false');
  if(level>=MAX_LEVEL){win();return}
  levelCleared=true;
  const completedStage=level,nextStage=BUBBLE_LEVELS[completedStage];
  $('#reset').textContent=`Continue to level ${completedStage+1}`;
  announce(`LEVEL ${completedStage} CLEAR`,`${currentStage().name} complete · Next: ${nextStage.name}`,'#d4c44a',true);
  setLevelAction(`Next level · ${nextStage.name}`);
  $('#bubbleStatus').textContent=`Level ${completedStage} clear! Level ${completedStage+1}, ${nextStage.name}, starts automatically soon. You can also choose Next level now.`;
  tone(720,'sine',.5,.12);
  hud();
  cancelLevelAdvance();
  levelAdvanceTimer=setTimeout(()=>{
    levelAdvanceTimer=null;
    if(levelCleared&&!gameOver&&level===completedStage)advanceLevel();
  },LEVEL_CLEAR_PAUSE_MS);
}
function advanceLevel(){
  cancelLevelAdvance();
  if(!levelCleared||level>=MAX_LEVEL||gameOver)return;
  level++;levelCleared=false;combo=1;misses=0;
  shot=null;dropAnimation=null;particles=[];powerEffects=[];
  current=null;next=null;setLevelAction();
  $('#message').classList.remove('show');
  $('#reset').textContent='↺ Start over';
  initGrid();nextBubble();hud();
  announce(`LEVEL ${level}`,`${currentStage().name} · ${currentStage().tip}`,'#d4c44a');
  canvas.focus({preventScroll:true});
}
function win(){
  cancelLevelAdvance();
  gameOver=true;won=true;levelCleared=false;shot=null;dropAnimation=null;
  canvas.setAttribute('aria-busy','false');award();
  $('#reset').textContent='Play all 20 again';
  announce('ALL 20 LEVELS CLEARED','Every round bubble is clear — you win!','#d4c44a',true);
  setLevelAction('Play all 20 again');tone(880,'sine',.65,.14);hud();
}
function end(title='FIELD EXPLORED',sub=`score: ${score} · cleared: ${cleared} · try another round when ready`){
  cancelLevelAdvance();
  gameOver=true;won=false;shot=null;canvas.setAttribute('aria-busy','false');award();
  $('#reset').textContent='Try another round';
  announce(title,sub,'#e26c6c',true);
  setLevelAction('Start a new game');tone(60,'sawtooth',1,.15);hud();
}
function shotDirection(tx,ty){const sx=W/2,sy=bottom-R-6,dx=tx-sx,dy=ty-sy;if(dy>=0)return null;const len=Math.hypot(dx,dy)||1;let ux=dx/len,uy=dy/len;if(-uy<MIN_UPWARD_RATIO){uy=-MIN_UPWARD_RATIO;ux=Math.sign(ux||1)*Math.sqrt(1-uy*uy)}return{x:ux,y:uy}}
function fire(tx,ty){if(shot||gameOver||levelCleared||dropAnimation)return;const sx=W/2,sy=bottom-R-6,dir=shotDirection(tx,ty);if(!dir)return;shot={x:sx,y:sy,vx:dir.x*SHOT_SPEED,vy:dir.y*SHOT_SPEED,bounces:0,travel:0};canvas.setAttribute('aria-busy','true');tone(440,'sine',.1,.07)}
function autoFire(){const a=-Math.PI/2+(Math.random()-.5)*Math.PI*.7;fire(W/2+Math.cos(a)*200,bottom-R-6+Math.sin(a)*200)}
function settleShot(x,y){if(place(x,y)){shot=null;if(!dropAnimation)canvas.setAttribute('aria-busy','false');if(!gameOver&&!levelCleared)nextBubble();return true}shot=null;canvas.setAttribute('aria-busy','false');end();return true}
function stepShot(){if(!shot)return;for(let i=0;i<6;i++){const dxStep=shot.vx/6,dyStep=shot.vy/6;shot.x+=dxStep;shot.y+=dyStep;shot.travel+=Math.hypot(dxStep,dyStep);if(shot.x<=left+R){shot.x=left+R;shot.vx=Math.abs(shot.vx);shot.bounces++;tone(200,'square',.04,.03)}if(shot.x>=right-R){shot.x=right-R;shot.vx=-Math.abs(shot.vx);shot.bounces++;tone(200,'square',.04,.03)}if(shot.bounces>MAX_BOUNCES||shot.travel>MAX_TRAVEL){settleShot(shot.x,shot.y);if(!gameOver&&!levelCleared)announce('SHOT SETTLED','Try a steeper angle for a cleaner bank shot','#5dcaa5');return}if(shot.y<=top+R){shot.y=top+R;settleShot(shot.x,shot.y);return}for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const b=grid[r][c];if(b&&distance(shot.x,shot.y,b.x,b.y)<R*1.82){const dx=shot.x-b.x,dy=shot.y-b.y,d=Math.hypot(dx,dy)||1;settleShot(b.x+dx/d*R*1.82,b.y+dy/d*R*1.82);return}}}}
function powerMark(x,y,r,power,freq){
  const spec=POWER_TYPES[power];
  ctx.save();
  ctx.strokeStyle=spec.color;
  ctx.fillStyle=spec.color;
  ctx.lineWidth=Math.max(2,r*.11);
  ctx.lineCap='round';
  ctx.lineJoin='round';
  ctx.shadowColor=spec.color;
  ctx.shadowBlur=r*.3;
  if(power==='row'){
    ctx.beginPath();ctx.moveTo(x-r*.28,y);ctx.lineTo(x+r*.28,y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x-r*.28,y);ctx.lineTo(x-r*.1,y-r*.16);ctx.moveTo(x-r*.28,y);ctx.lineTo(x-r*.1,y+r*.16);ctx.moveTo(x+r*.28,y);ctx.lineTo(x+r*.1,y-r*.16);ctx.moveTo(x+r*.28,y);ctx.lineTo(x+r*.1,y+r*.16);ctx.stroke();
  }else if(power==='burst'){
    ctx.beginPath();
    for(let i=0;i<16;i++){const a=-Math.PI/2+i*Math.PI/8,rad=i%2?r*.18:r*.36,px=x+Math.cos(a)*rad,py=y+Math.sin(a)*rad;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}
    ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.arc(x,y,r*.11,0,Math.PI*2);ctx.fillStyle='#684900';ctx.fill();
  }else{
    for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x,y,r*(.18+i*.09),Math.PI*(.15+i*.18),Math.PI*(1.45+i*.16));ctx.strokeStyle=FREQS[(freq+i*2)%FREQS.length].color;ctx.stroke()}
  }
  ctx.shadowBlur=0;
  ctx.beginPath();ctx.arc(x+r*.52,y+r*.5,r*.24,0,Math.PI*2);ctx.fillStyle='#f8fbff';ctx.fill();ctx.strokeStyle='#26394c';ctx.lineWidth=Math.max(1,r*.045);ctx.stroke();
  ctx.fillStyle='#203146';ctx.font=`900 ${r*.31}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(freq+1),x+r*.52,y+r*.51);
  ctx.restore();
}
function bubble(x,y,r,freq,gem=false,alpha=1,power=null){const f=FREQS[freq],light=canvasTheme().mode==='light';ctx.save();ctx.globalAlpha=alpha;ctx.shadowColor=power?`${POWER_TYPES[power].color}bb`:light?'#29485d55':`${f.color}88`;ctx.shadowBlur=power?r*.62:r*.42;ctx.shadowOffsetY=r*.12;const glow=ctx.createRadialGradient(x-r*.34,y-r*.42,r*.05,x,y,r);glow.addColorStop(0,'#ffffff');glow.addColorStop(.14,light?'#ffffffcc':`${f.color}ee`);glow.addColorStop(.58,f.color);glow.addColorStop(1,f.dark);ctx.beginPath();ctx.arc(x,y,r*.94,0,Math.PI*2);ctx.fillStyle=glow;ctx.fill();ctx.shadowBlur=0;ctx.lineWidth=Math.max(1.5,r*(power ? .13 : .075));ctx.strokeStyle=power?POWER_TYPES[power].color:light?'#ffffff':`${f.color}dd`;ctx.stroke();ctx.beginPath();ctx.arc(x,y,r*.78,.12,Math.PI*1.55);ctx.strokeStyle=light?'#ffffff72':'#ffffff4d';ctx.lineWidth=Math.max(1,r*.045);ctx.stroke();ctx.beginPath();ctx.ellipse(x-r*.3,y-r*.35,r*.22,r*.12,-.55,0,Math.PI*2);ctx.fillStyle='#ffffffb8';ctx.fill();ctx.beginPath();ctx.arc(x,y,r*.42,0,Math.PI*2);ctx.fillStyle=light?'#173044d9':'#07131edb';ctx.fill();ctx.strokeStyle='#ffffff9e';ctx.lineWidth=Math.max(1,r*.045);ctx.stroke();if(power)powerMark(x,y,r,power,freq);else{ctx.fillStyle='#fff';ctx.font=`800 ${r*.78}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(freq+1),x,y+r*.015)}if(gem){ctx.beginPath();ctx.arc(x+r*.58,y-r*.55,r*.24,0,Math.PI*2);ctx.fillStyle='#fff4ad';ctx.fill();ctx.strokeStyle='#6e5720';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#624b16';ctx.font=`bold ${r*.34}px system-ui`;ctx.fillText('✦',x+r*.58,y-r*.55)}ctx.restore()}
function drawPowerEffects(){
  for(let i=powerEffects.length-1;i>=0;i--){
    const effect=powerEffects[i];
    effect.life-=.025;
    if(effect.life<=0){powerEffects.splice(i,1);continue}
    const progress=1-effect.life,spec=POWER_TYPES[effect.kind];
    ctx.save();ctx.globalAlpha=effect.life;ctx.strokeStyle=spec.color;ctx.shadowColor=spec.color;ctx.shadowBlur=24;ctx.lineCap='round';
    if(effect.kind==='row'){
      ctx.lineWidth=5+effect.life*10;ctx.beginPath();ctx.moveTo(left+8,cellY(effect.row));ctx.lineTo(right-8,cellY(effect.row));ctx.stroke();
    }else if(effect.kind==='burst'){
      ctx.lineWidth=7;ctx.beginPath();ctx.arc(effect.x,effect.y,R*(1+progress*4),0,Math.PI*2);ctx.stroke();
    }else{
      for(let ring=0;ring<3;ring++){ctx.strokeStyle=FREQS[(ring*2+powerIndex)%FREQS.length].color;ctx.lineWidth=5;ctx.beginPath();ctx.arc(effect.x,effect.y,R*(1.2+progress*5+ring*.45),0,Math.PI*2);ctx.stroke()}
    }
    ctx.restore();
  }
}
function drawShooter(x,y,palette){const dir=shotDirection(mouse.x,mouse.y)||{x:0,y:-1};ctx.save();ctx.shadowColor=palette.launcherGlow;ctx.shadowBlur=22;ctx.fillStyle=palette.launcherBase;ctx.strokeStyle=palette.launcherRim;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y+R*.9,R*2.35,R*.62,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.lineCap='round';ctx.lineWidth=R*.42;ctx.strokeStyle=palette.launcherRail;ctx.beginPath();ctx.moveTo(x,y+R*.65);ctx.lineTo(x+dir.x*R*1.55,y+dir.y*R*1.55);ctx.stroke();ctx.lineWidth=3;ctx.strokeStyle=palette.launcherRim;ctx.stroke();ctx.beginPath();ctx.arc(x,y,R*1.18,0,Math.PI*2);ctx.strokeStyle=palette.launcherGlow;ctx.lineWidth=6;ctx.stroke();ctx.restore()}
function aim(palette){if(shot||gameOver||levelCleared||dropAnimation)return;const sx=W/2,sy=bottom-R-6,dir=shotDirection(mouse.x,mouse.y);if(!dir)return;let x=sx,y=sy,vx=dir.x*3,vy=dir.y*3;ctx.save();ctx.setLineDash([4,8]);ctx.strokeStyle=palette.aim;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);for(let i=0;i<260;i++){x+=vx;y+=vy;if(x<=left+R){x=left+R;vx=Math.abs(vx)}if(x>=right-R){x=right-R;vx=-Math.abs(vx)}ctx.lineTo(x,y);if(y<=top+R||grid.some(row=>row.some(b=>b&&distance(x,y,b.x,b.y)<R*1.82)))break}ctx.stroke();ctx.restore()}
function draw(now=performance.now()){if(!gameOver&&!levelCleared&&!shot&&!dropAnimation&&boardEmpty())completeLevel();const palette=canvasTheme();ctx.clearRect(0,0,W,H);ctx.fillStyle=palette.wall;ctx.fillRect(0,0,WALL,H);ctx.fillRect(W-WALL,0,WALL,H);ctx.fillRect(0,0,W,WALL);let dropOffset=0;if(dropAnimation){const t=Math.min(1,(now-dropAnimation.start)/dropAnimation.duration);const eased=1-Math.pow(1-t,3);dropOffset=-HEX*(1-eased);if(t>=1){dropAnimation=null;canvas.setAttribute('aria-busy','false');if(danger())hud()}}for(const row of grid)for(const b of row)if(b)bubble(b.x,b.y+dropOffset,R,b.freq,b.gem,1,b.power);drawPowerEffects();ctx.save();ctx.setLineDash([3,7]);ctx.strokeStyle=palette.danger;ctx.beginPath();const dangerY=Math.min(bottom-R*2.2,cellY(ROWS-1)+R+8);ctx.moveTo(left,dangerY);ctx.lineTo(right,dangerY);ctx.stroke();ctx.restore();const sx=W/2,sy=bottom-R-6;drawShooter(sx,sy,palette);aim(palette);if(!gameOver&&!levelCleared)bubble(sx,sy,R,current.freq,current.gem,1,current.power);stepShot();if(shot)bubble(shot.x,shot.y,R,current.freq,current.gem,1,current.power);if(next&&!gameOver&&!levelCleared)bubble(right-30,bottom-30,R*.7,next.freq,next.gem,.75,next.power);for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.life-=.022;if(p.life<=0){particles.splice(i,1);continue}ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}requestAnimationFrame(draw)}
function point(e){const rect=canvas.getBoundingClientRect(),t=e.touches?.[0]||e.changedTouches?.[0]||e;return{x:(t.clientX-rect.left)*W/rect.width,y:(t.clientY-rect.top)*H/rect.height}}
function reset(){cancelLevelAdvance();$('#reset').textContent='↺ Start over';canvas.setAttribute('aria-busy','false');gameOver=false;won=false;levelCleared=false;awarded=false;score=0;combo=1;level=1;coherence=50;pattern=0;integration=50;cleared=0;misses=0;powerLoads=0;powerIndex=0;current=null;next=null;shot=null;dropAnimation=null;particles=[];powerEffects=[];setLevelAction();$('#message').classList.remove('show');initGrid();nextBubble();hud();updateCoherence();refreshProfile()}
function primaryAction(x,y){if(gameOver)reset();else if(levelCleared)advanceLevel();else fire(x,y)}
canvas.addEventListener('mousemove',e=>mouse=point(e));canvas.addEventListener('touchmove',e=>{e.preventDefault();mouse=point(e)},{passive:false});canvas.addEventListener('click',e=>{const p=point(e);primaryAction(p.x,p.y)});canvas.addEventListener('touchend',e=>{e.preventDefault();const p=point(e);primaryAction(p.x,p.y)},{passive:false});
$('#reset').onclick=()=>levelCleared?advanceLevel():reset();$('#levelAction').onclick=()=>levelCleared?advanceLevel():gameOver?reset():null;$('#auto').onclick=autoFire;$('#sound').onclick=()=>{audioOn=!audioOn;$('#sound').textContent=audioOn?'♪ Sound ON':'♪ Sound OFF';$('#sound').classList.toggle('active',audioOn);$('#sound').setAttribute('aria-pressed',String(audioOn));if(audioOn)ac()};function aimBy(amount){mouse.x=Math.max(left+R,Math.min(right-R,mouse.x+amount));mouse.y=100;}
function fireAimed(){if(!document.querySelector('dialog[open]')){if(gameOver)reset();else if(levelCleared)advanceLevel();else fire(mouse.x,mouse.y)}}
$('#aimLeft').onclick=()=>aimBy(-32);$('#aimRight').onclick=()=>aimBy(32);$('#fireAimed').onclick=fireAimed;
canvas.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();aimBy(e.key==='ArrowLeft'?-32:32)}if(e.code==='Space'||e.key==='Enter'){e.preventDefault();fireAimed()}if(e.key.toLowerCase()==='r')reset()});
window.addEventListener('larriverse:settings',()=>{syncCanvasTheme();if(window.LarriVerseArcade.settings().reducedMotion){particles=[];powerEffects=[]}});
window.addEventListener('larriverse:profile',refreshProfile);
$('#legend').innerHTML=`<div class="number-legend">${FREQS.map((f,index)=>`<span><i style="background:${f.color}"></i><b>${index+1}</b> · ${f.name} · ${f.label}</span>`).join('')}</div><div class="power-legend" aria-label="Special bubble powers">${POWER_ORDER.map((id,index)=>{const power=POWER_TYPES[id];return`<span><i class="power-key power-${id}">${index===0?'↔':index===1?'✹':'ALL'}</i><b>${power.name}</b> · ${power.description}</span>`}).join('')}</div>`;syncCanvasTheme();reset();draw();
