(() => {
  'use strict';

  const GAME_ID = 'road-trip-quest';
  const SAVE_KEY = 'larriverse.roadTripQuest.v1';
  const lanes = [23, 50, 77];
  const CITIES = [
    {name:'New York City',emoji:'🗽',boss:{name:'King Cabbie',emoji:'🚕',hp:80,subject:'math'},reward:{name:'Liberty Star',emoji:'⭐',desc:'Defender of the big city!'}},
    {name:'Orlando',emoji:'🎡',boss:{name:'Gator Gulch',emoji:'🐊',hp:90,subject:'trivia'},reward:{name:'Sunny Gator',emoji:'🦎',desc:'Sunshine State warrior!'}},
    {name:'Nashville',emoji:'🎸',boss:{name:'Banjo Boss',emoji:'🤠',hp:85,subject:'reading'},reward:{name:'Country Star',emoji:'🌟',desc:'Plays the sweetest tunes!'}},
    {name:'Chicago',emoji:'🌬️',boss:{name:'Windy Wizard',emoji:'🌀',hp:95,subject:'science'},reward:{name:'Lake Guardian',emoji:'🧊',desc:'Master of the north winds!'}},
    {name:'Las Vegas',emoji:'🎰',boss:{name:'Neon Phantom',emoji:'💎',hp:100,subject:'math'},reward:{name:'Lucky Dragon',emoji:'🐉',desc:'Brings good fortune on all journeys!'}},
    {name:'Los Angeles',emoji:'🌴',boss:{name:'Surf Titan',emoji:'🏄',hp:110,subject:'trivia'},reward:{name:'Pacific Rider',emoji:'🌊',desc:'Rides the endless waves!'}},
    {name:'Denver',emoji:'⛰️',boss:{name:'Mountain Mammoth',emoji:'🦣',hp:105,subject:'science'},reward:{name:'Summit Elk',emoji:'🦌',desc:'Roams the highest peaks!'}},
    {name:'New Orleans',emoji:'🎷',boss:{name:'Jazz Phantom',emoji:'👻',hp:115,subject:'reading'},reward:{name:'Mardi Fox',emoji:'🦊',desc:'Dances through the night!'}}
  ];
  const ITEMS = [
    {emoji:'⚡',name:'Lightning Bolt',power:25,desc:'Crackles with electric energy!'},{emoji:'🔮',name:'Magic Orb',power:20,desc:'Glows with mysterious power!'},{emoji:'🍄',name:'Power Mushroom',power:15,desc:'Gives your next answer extra punch!'},{emoji:'🌟',name:'Gold Star',power:30,desc:'Shines with golden power!'},{emoji:'🧪',name:'Mystery Potion',power:18,desc:'Brewed by a roadside wizard!'},{emoji:'🔑',name:'Golden Key',power:22,desc:'Opens the door to victory!'},{emoji:'💎',name:'Road Diamond',power:35,desc:'Found sparkling on the highway!'},{emoji:'🎯',name:'Laser Target',power:28,desc:'Never misses its mark!'},{emoji:'🛡️',name:'Mini Shield',power:20,desc:'Blocks a boss attack!'},{emoji:'🏹',name:'Arrow of Speed',power:24,desc:'Fast as the open road!'},{emoji:'🌊',name:'Wave Splash',power:16,desc:'Washes away the enemy!'},{emoji:'🔥',name:'Road Flame',power:30,desc:'Burns with fierce power!'},{emoji:'🌪️',name:'Dust Twister',power:22,desc:'Picked up in the desert!'},{emoji:'🎀',name:'Lucky Ribbon',power:12,desc:'Brings good luck in battle!'},{emoji:'🦋',name:'Butterfly Wing',power:10,desc:'Light as a feather!'},{emoji:'🌈',name:'Rainbow Shard',power:40,desc:'The rarest find on any road!'}
  ];
  const ROAMERS = [
    {emoji:'🦄',name:'Road Unicorn',bonus:50,desc:'Joins you after answering its riddle!'},{emoji:'🐉',name:'Baby Dragon',bonus:60,desc:'Breathes fire on your enemies!'},{emoji:'🦅',name:'Sky Eagle',bonus:45,desc:'Spotted from the highway!'},{emoji:'🐺',name:'Highway Wolf',bonus:55,desc:'Runs alongside your car!'},{emoji:'🧜',name:'River Sprite',bonus:40,desc:'Spotted near a bridge!'},{emoji:'🦁',name:'Pride Lion',bonus:65,desc:'Roaring for adventure!'}
  ];
  const QUESTIONS = {
    math:[['What is 7 × 8?',['54','56','64','48'],1],['What is 144 ÷ 12?',['11','10','13','12'],3],['What is 25% of 80?',['15','25','20','30'],2],['A car travels 60 mph for 2 hours. How far?',['100 mi','130 mi','120 mi','90 mi'],2],['What is 9²?',['72','81','90','63'],1],['Solve: 3x = 27. What is x?',['7','8','10','9'],3]],
    trivia:[['What is the capital of Texas?',['Dallas','Houston','Austin','San Antonio'],2],['How many states are in the USA?',['48','52','50','49'],2],['What ocean is on the US East Coast?',['Pacific','Arctic','Indian','Atlantic'],3],['Which planet has the most visible rings?',['Jupiter','Mars','Saturn','Venus'],2],['How many stripes are on the US flag?',['12','13','14','50'],1],['What year did the US declare independence?',['1765','1783','1776','1800'],2]],
    science:[['What gas do plants absorb from the air?',['Oxygen','Nitrogen','Hydrogen','Carbon dioxide'],3],['How many bones are in the adult human body?',['196','206','216','186'],1],['What is H₂O?',['Hydrogen','Helium','Water','Salt'],2],['What force keeps planets orbiting the Sun?',['Magnetism','Friction','Gravity','Wind'],2],['Which is the largest planet?',['Saturn','Neptune','Jupiter','Uranus'],2],['Who studies dinosaurs?',['Archaeologist','Paleontologist','Meteorologist','Astronomer'],1]],
    reading:[['What is a word with the same meaning as another?',['Antonym','Homophone','Synonym','Prefix'],2],['What punctuation ends an exclamation?',['Period','Question mark','Exclamation mark','Comma'],2],['What is the central message of a story?',['Plot','Theme','Setting','Character'],1],['First-person stories often use which word?',['He','They','You','I'],3],['What does “un-” mean in “unhappy”?',['Very','Not','Again','Before'],1],['Who tells a story?',['Author','Character','Narrator','Editor'],2]]
  };
  const SCENERY = ['🌲','🌳','🏠','⛽','🚦','🏗️','🌾','🌵','⛰️','🏔️','🌊','🦅','🐄','🌻'];
  const $ = selector => document.querySelector(selector);
  const fresh = () => ({score:0,lane:1,bossMeter:0,currentCity:0,bag:[],heroes:[],cityProgress:{},itemsCollected:0,bossesDefeated:0,correctAnswers:0,totalAnswers:0});
  let state = loadTrip();
  let running = false;
  let paused = false;
  let spawnTimer = null;
  let sceneryTimer = null;
  let activeBattle = null;
  let toastTimer = null;

  function loadTrip(){try{return {...fresh(),...JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}}catch{return fresh()}}
  function saveTrip(){localStorage.setItem(SAVE_KEY,JSON.stringify(state))}
  function resetTrip(){localStorage.removeItem(SAVE_KEY);state=fresh();renderHud();toast('Fresh road trip started!')}
  function pick(list){return list[Math.floor(Math.random()*list.length)]}
  function profile(){return window.LarriVerseArcade?.summary?.()}

  function start(){
    $('#titleScreen').classList.remove('active');$('#gameScreen').classList.add('active');running=true;paused=false;
    renderHud();moveCar();startLoops();toast(`${CITIES[state.currentCity].emoji} Next stop: ${CITIES[state.currentCity].name}`);
  }
  function startLoops(){
    clearInterval(spawnTimer);clearInterval(sceneryTimer);
    spawnTimer=setInterval(()=>{if(running&&!paused)spawnRoadThing()},1150);
    sceneryTimer=setInterval(()=>{if(running&&!paused)spawnScenery()},900);
  }
  function togglePause(){paused=!paused;document.body.classList.toggle('paused',paused);$('#pauseButton').textContent=paused?'Resume':'Pause';$('#pauseButton').setAttribute('aria-pressed',String(paused));}
  function move(delta){if(!running||paused)return;state.lane=Math.max(0,Math.min(2,state.lane+delta));moveCar();}
  function moveCar(){$('#car').style.left=`${lanes[state.lane]}%`}

  function spawnRoadThing(){
    const special=Math.random()<.09&&state.heroes.filter(h=>h.source==='road').length<ROAMERS.length;
    const thing=special?pick(ROAMERS):pick(ITEMS);const lane=Math.floor(Math.random()*3);
    if(special&&state.heroes.some(h=>h.name===thing.name))return;
    const el=document.createElement('button');el.className=`road-item${special?' special':''}`;el.style.left=`calc(${lanes[lane]}% - 38px)`;el.style.setProperty('--speed',`${4.2+Math.random()*1.8}s`);el.dataset.lane=lane;el.innerHTML=`<b>${thing.emoji}</b><small>${special?'Mystery hero':thing.name}</small>`;el.setAttribute('aria-label',special?`${thing.name}, move into its lane to recruit`:`${thing.name}, move into its lane to collect`);$('#road').append(el);
    let checked=false;const collision=setInterval(()=>{if(!el.isConnected){clearInterval(collision);return}const top=el.offsetTop;const carTop=$('#car').offsetTop;if(!checked&&top>carTop-45&&top<carTop+65){checked=true;if(Number(el.dataset.lane)===state.lane){special?meetRoamer(thing):collectItem(thing);el.remove()} }},60);
    el.addEventListener('animationend',()=>{clearInterval(collision);el.remove()});
  }
  function spawnScenery(){const el=document.createElement('span');el.textContent=pick(SCENERY);el.style.bottom=`${4+Math.random()*30}px`;el.style.animationDuration=`${5+Math.random()*4}s`;$('#skyline').append(el);el.addEventListener('animationend',()=>el.remove())}
  function collectItem(item){
    const found=state.bag.find(x=>x.name===item.name);found?found.count++:state.bag.push({...item,count:1});
    state.itemsCollected++;state.score+=5;state.bossMeter=Math.min(100,state.bossMeter+12);saveTrip();renderHud();toast(`${item.emoji} ${item.name} collected!`);
    if(state.bossMeter>=60)$('#roadMessage').textContent='Boss battle ready — or charge to 100% for bonus damage!';
  }
  function meetRoamer(hero){
    paused=true;document.body.classList.add('paused');activeBattle={mode:'recruit',hero,subject:pick(Object.keys(QUESTIONS)),playerHp:100,bossHp:50,itemBonus:0,used:[]};openQuestion();
  }

  function triggerBoss(){
    if(state.bossMeter<60){toast('Collect more power items first!');return}
    const city=CITIES[state.currentCity];activeBattle={mode:'boss',city,boss:city.boss,subject:city.boss.subject,playerHp:100,bossHp:city.boss.hp,maxBossHp:city.boss.hp,itemBonus:state.bossMeter>=100?15:0,used:[],round:1};paused=true;document.body.classList.add('paused');openQuestion();
  }
  function openQuestion(){
    const b=activeBattle;const isBoss=b.mode==='boss';const foe=isBoss?b.boss:b.hero;
    $('#questionMode').textContent=isBoss?`${b.city.emoji} ${b.city.name} · Round ${b.round}`:'Roaming hero challenge';$('#bossEmoji').textContent=foe.emoji;$('#bossName').textContent=foe.name;$('#subjectBadge').textContent=b.subject;$('#playerHp').style.width=`${b.playerHp}%`;$('#bossHp').style.width=`${Math.max(0,100*b.bossHp/(b.maxBossHp||50))}%`;$('#feedback').textContent='';$('#nextQuestion').hidden=true;renderBattleItems();
    const raw=pick(QUESTIONS[b.subject]);b.question={text:raw[0],answers:raw[1],correct:raw[2]};$('#questionText').textContent=b.question.text;$('#answers').innerHTML='';b.question.answers.forEach((answer,index)=>{const btn=document.createElement('button');btn.type='button';btn.textContent=answer;btn.addEventListener('click',()=>answerQuestion(index,btn));$('#answers').append(btn)});$('#questionDialog').showModal();
  }
  function renderBattleItems(){
    const row=$('#battleItems');row.innerHTML=state.bag.length?'':'<span class="muted">No road items yet.</span>';
    state.bag.forEach((item,index)=>{const btn=document.createElement('button');btn.type='button';btn.innerHTML=`${item.emoji} ${item.name} ×${item.count} <small>+${item.power}</small>`;if(activeBattle.used.includes(item.name))btn.classList.add('used');btn.disabled=activeBattle.used.includes(item.name);btn.addEventListener('click',()=>useItem(index,item,btn));row.append(btn)})
  }
  function useItem(index,item,button){
    if(activeBattle.used.includes(item.name))return;activeBattle.used.push(item.name);activeBattle.itemBonus+=item.power;item.count--;if(item.count<=0)state.bag.splice(index,1);button.classList.add('used');button.disabled=true;saveTrip();renderHud();toast(`${item.emoji} +${item.power} answer power`);
  }
  function answerQuestion(index,button){
    const b=activeBattle;if(b.answered)return;b.answered=true;state.totalAnswers++;const correct=index===b.question.correct;[...$('#answers').children].forEach((el,i)=>{el.disabled=true;if(i===b.question.correct)el.classList.add('correct')});
    if(correct){button.classList.add('correct');state.correctAnswers++;const damage=30+b.itemBonus+(b.mode==='recruit'?20:0);b.bossHp=Math.max(0,b.bossHp-damage);state.score+=15;$('#feedback').textContent=`Correct! ${damage} power damage.`}
    else{button.classList.add('wrong');b.playerHp=Math.max(0,b.playerHp-25);$('#feedback').textContent=`Not quite — the correct answer was ${b.question.answers[b.question.correct]}.`}
    b.itemBonus=0;$('#playerHp').style.width=`${b.playerHp}%`;$('#bossHp').style.width=`${Math.max(0,100*b.bossHp/(b.maxBossHp||50))}%`;saveTrip();
    if(b.mode==='recruit'){setTimeout(()=>correct?recruitHero(b.hero):finishLoss(`${b.hero.emoji} ${b.hero.name} escaped down the highway.`),700);return}
    if(b.bossHp<=0){setTimeout(winBoss,700);return}if(b.playerHp<=0){setTimeout(()=>finishLoss(`${b.boss.emoji} ${b.boss.name} won this round. Collect more items and try again!`),700);return}
    $('#nextQuestion').hidden=false;
  }
  function nextRound(){activeBattle.round++;activeBattle.answered=false;$('#questionDialog').close();setTimeout(openQuestion,80)}
  function recruitHero(hero){
    $('#questionDialog').close();state.heroes.push({...hero,source:'road'});state.score+=hero.bonus;saveTrip();resumeRoad();toast(`${hero.emoji} ${hero.name} joined your crew!`);renderHud();
  }
  function finishLoss(message){$('#questionDialog').close();state.bossMeter=Math.max(0,state.bossMeter-20);saveTrip();showResult('🛞','Pit stop','Try again',message,{Score:state.score,'Boss meter':`${state.bossMeter}%`,Crew:state.heroes.length},false)}
  function winBoss(){
    $('#questionDialog').close();const city=CITIES[state.currentCity];state.cityProgress[city.name]={defeated:true};state.bossesDefeated++;state.score+=100;state.heroes.push({...city.reward,source:city.name});const accuracy=state.totalAnswers?Math.round(state.correctAnswers/state.totalAnswers*100):0;
    const sdk=window.LarriVerseArcade?.award?.(GAME_ID,{xp:36+Math.min(54,state.itemsCollected),kc:9+Math.floor(state.bossMeter/20),score:state.score,completed:true,metrics:{itemsCollected:state.itemsCollected,bossesDefeated:1,heroesRecruited:1,correctAnswers:state.correctAnswers}});
    saveTrip();showResult(city.reward.emoji,'City conquered',`${city.name} cleared!`,`${city.reward.name} joined your Hero Collection.`,{XP:`+${36+Math.min(54,state.itemsCollected)}`,KC:`+${9+Math.floor(state.bossMeter/20)+(sdk?.milestoneBonus||0)}`,Accuracy:`${accuracy}%`},true);
  }
  function showResult(icon,eyebrow,title,text,rewards,won){
    $('#resultIcon').textContent=icon;$('#resultEyebrow').textContent=eyebrow;$('#resultTitle').textContent=title;$('#resultText').textContent=text;$('#rewardGrid').innerHTML=Object.entries(rewards).map(([k,v])=>`<div><b>${v}</b><small>${k}</small></div>`).join('');$('#continueButton').dataset.won=String(won);$('#resultDialog').showModal();
  }
  function continueTrip(){
    const won=$('#continueButton').dataset.won==='true';$('#resultDialog').close();if(won){state.currentCity=(state.currentCity+1)%CITIES.length;state.bossMeter=0;state.bag=[];saveTrip();toast(`${CITIES[state.currentCity].emoji} Rolling toward ${CITIES[state.currentCity].name}!`)}resumeRoad();renderHud();
  }
  function resumeRoad(){paused=false;document.body.classList.remove('paused');activeBattle=null}

  function renderHud(){
    const city=CITIES[state.currentCity];$('#cityHud').textContent=`${city.emoji} ${city.name}`;$('#scoreHud').textContent=state.score.toLocaleString();const itemCount=state.bag.reduce((sum,x)=>sum+x.count,0);$('#itemsHud').textContent=itemCount;$('#bagBadge').textContent=itemCount;$('#heroBadge').textContent=state.heroes.length;$('#bossFill').style.width=`${state.bossMeter}%`;$('#bossValue').textContent=`${state.bossMeter}%`;$('#battleButton').disabled=state.bossMeter<60;$('#battleReady').textContent=state.bossMeter>=60?'READY':`${60-state.bossMeter}%`;moveCar();
  }
  function openPanel(name){
    let html='';
    if(name==='bagPanel')html=`<p class="eyebrow">Road inventory</p><h2>Power Bag</h2><div class="inventory">${state.bag.length?state.bag.map(i=>`<article><span>${i.emoji}</span><div><b>${i.name}</b><small class="muted">${i.desc}</small></div><strong>×${i.count}<br>+${i.power}</strong></article>`).join(''):'<p class="muted">Collect glowing items from the road.</p>'}</div>`;
    if(name==='routePanel')html=`<p class="eyebrow">Eight-city expedition</p><h2>Quest Route</h2><div class="route-list">${CITIES.map((c,i)=>`<article class="${i===state.currentCity?'current':''} ${state.cityProgress[c.name]?.defeated?'won':''}"><span>${c.emoji}</span><div><b>${c.name}</b><small class="muted">Boss: ${c.boss.emoji} ${c.boss.name} · ${c.boss.subject}</small></div><strong>${state.cityProgress[c.name]?.defeated?'✅':i===state.currentCity?'YOU':'🔒'}</strong></article>`).join('')}</div>`;
    if(name==='heroesPanel')html=`<p class="eyebrow">Friends from the road</p><h2>Hero Collection</h2><div class="hero-list">${state.heroes.length?state.heroes.map(h=>`<article><span>${h.emoji}</span><div><b>${h.name}</b><small class="muted">${h.desc}</small></div><strong>${h.source}</strong></article>`).join(''):'<p class="muted">Defeat a boss or answer a roaming hero challenge.</p>'}</div>`;
    if(name==='helpPanel')html=`<p class="eyebrow">How to play</p><h2>Driver's Guide</h2><p>Use <b>← →</b>, <b>A/D</b>, or the lane buttons. Match the car's lane with road items to collect them. Each item adds 12% to the boss meter. At 60%, you may battle; at 100%, you begin with bonus damage.</p><p>Use bag items before answering to increase correct-answer damage. Wrong answers cost 25 HP. Defeat each city's subject-themed boss to recruit its hero.</p><p class="muted">Questions are educational game content. Progress and fictional KC stay on this device.</p>`;
    $('#panelContent').innerHTML=html;$('#panelDialog').showModal();
  }
  function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2300)}
  function syncProfile(){const p=profile();$('#profileChip').textContent=p?`${p.avatar} ${p.name} · Level ${p.level} · ${p.kc} KC`:'Device-local arcade profile'}

  $('#startButton').addEventListener('click',start);$('#newTripButton').addEventListener('click',()=>{if(confirm('Reset this Road Trip Quest campaign? Shared arcade XP and KC will stay safe.'))resetTrip()});$('#leftButton').addEventListener('click',()=>move(-1));$('#rightButton').addEventListener('click',()=>move(1));$('#battleButton').addEventListener('click',triggerBoss);$('#pauseButton').addEventListener('click',togglePause);$('#nextQuestion').addEventListener('click',nextRound);$('#continueButton').addEventListener('click',continueTrip);$('#closePanel').addEventListener('click',()=>$('#panelDialog').close());document.querySelectorAll('.bottom-nav button').forEach(btn=>btn.addEventListener('click',()=>openPanel(btn.dataset.panel)));
  window.addEventListener('keydown',event=>{if(['ArrowLeft','a','A'].includes(event.key))move(-1);if(['ArrowRight','d','D'].includes(event.key))move(1);if(event.key===' '&&state.bossMeter>=60)triggerBoss();if(event.key==='p'||event.key==='P')togglePause()});window.addEventListener('larriverse:profile',syncProfile);syncProfile();renderHud();
})();
