import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {SPIDERS,SPIDER_CHAPTERS,SPIDER_MISSIONS} from '../games/spider-scout/questions.js';
import {HELP_CASE_COUNT,HELP_CHAPTERS,HELP_MISSIONS} from '../games/helping-hands/questions.js';
import {spiderPicture,actionPicture} from '../assets/picture-quest-art.js';

const catalog=JSON.parse(fs.readFileSync('games/catalog.json','utf8'));
const release=JSON.parse(fs.readFileSync('release.json','utf8'));
assert.equal(catalog.length,40,'Arcade lists forty playable games');
assert.equal(release.cabinetCount,40,'Release manifest lists forty games');
assert.equal(release.galleryReview.expectedImages,82,'Lobby and forty games have desktop and mobile review images');
assert.equal(SPIDERS.length,10,'Ten illustrated spider families/types');
assert.equal(HELP_CASE_COUNT,20,'Twenty distinct real-world helping situations');
for(const [slug,chapters,missions] of [
 ['spider-scout',SPIDER_CHAPTERS,SPIDER_MISSIONS],
 ['helping-hands',HELP_CHAPTERS,HELP_MISSIONS]
]){
 assert.equal(chapters.length,8,slug+' must have eight open chapters');
 assert.equal(missions.length,80,slug+' must have eighty playable missions');
 assert.deepEqual(missions.map(x=>x.id),Array.from({length:80},(_,i)=>i+1),slug+' mission IDs are unique and consecutive');
 const distinct=new Set();
 for(const [i,m] of missions.entries()){
  assert.equal(m.chapter,Math.floor(i/10),slug+' chapter contains ten activities');
  assert.ok(m.title.length>=9 && m.prompt.length>=20 && m.observation.length>=25,slug+' scene provides substantial clues');
  assert.ok(m.clue.length>35&&m.explanation.length>45,slug+' provides a real teaching explanation');
  assert.equal(m.options.length,3,slug+' always has three illustrated choices');
  assert.ok(Number.isInteger(m.answer)&&m.answer>=0&&m.answer<3,slug+' has one correct choice');
  const optionTexts=new Set(m.options.map(o=>o.text));
  assert.equal(optionTexts.size,3,slug+' needs three distinct answers');
  assert.ok(m.options.every(o=>typeof o.icon==='string' && o.text.length>8 && o.text.length<350),slug+' answer labels and artwork');
  assert.ok(!distinct.has(m.title+'|'+m.prompt),slug+' has unique case prompts');
  distinct.add(m.title+'|'+m.prompt);
  assert.equal(typeof m.scene,'string');
 }
 const entry=catalog.find(x=>x.id===slug);
 assert.ok(entry?.available&&entry.featured&&entry.integration==='arcade-sdk-v3',slug+' playable catalog entry');
 assert.equal(entry.href,'games/'+slug+'/index.html');
 assert.ok(release.cabinets.some(x=>x.id===slug&&x.route===entry.href),slug+' listed in release QA');
 const html=fs.readFileSync(entry.href,'utf8');
 for(const label of ['id="chapters"','id="choices"','id="sceneArt"','id="hint"','id="next"','id="levelSelect"',
   'id="feedback"','aria-live="polite"','../../assets/arcade-sdk.js','../../assets/picture-quest.css','cabinet-shell.js',
   'Every chapter box','Every mission']) {
   // Interface copy uses "All eight chapter boxes and every mission" rather than exact starts.
   if(label==='Every chapter box'||label==='Every mission'){
    assert.ok(html.includes('chapter boxes and every mission'),slug+' must communicate open chapters');
   }else assert.ok(html.includes(label),slug+' is missing '+label);
 }
 assert.ok(html.includes('role="img"')&&html.includes('aria-label="Picture answers"'),slug+' provides text equivalents for pictures');
 assert.ok(html.includes('../../index.html'),'Back to Arcade required');
 const page=fs.readFileSync('games/'+slug+'/game.js','utf8');
 assert.ok(page.includes('startPictureQuest')&&page.includes('questions.js'),slug+' launches game engine');
 const src=fs.readFileSync('games/'+slug+'/questions.js','utf8');
 assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|navigator\.geolocation|sendBeacon|setInterval/.test(src+page),'No external uploads, location or timers');
}
const spiderText=JSON.stringify(SPIDER_MISSIONS);
assert.ok(/recluse/i.test(spiderText)&&/midwest/i.test(spiderText),'Recluse range is described');
assert.ok(/widow/i.test(spiderText)&&/venom/i.test(spiderText),'Widow warning and venom education');
assert.ok(/without touching|leave.*alone|never/.test(spiderText),'Wildlife observation discourages handling');
const helpText=JSON.stringify(HELP_MISSIONS);
for(const required of ['nosebleed','10–15 minutes','911','Poison Control','choking','seizure','burn','bully','adult']){
 assert.ok(helpText.toLowerCase().includes(required.toLowerCase()),'Helping Hands must teach '+required);
}
assert.ok(helpText.includes('cannot cough')&&helpText.includes('lean a little forward'),'Danger and nosebleed guidance');
assert.ok(helpText.includes('Do not restrain')&&helpText.includes('Do not make them vomit'),'Seizure and poison safeguards');
const game=fs.readFileSync('assets/picture-quest.js','utf8');
const css=fs.readFileSync('assets/picture-quest.css','utf8');
const art=fs.readFileSync('assets/picture-quest-art.js','utf8');
assert.ok(game.includes('localStorage.setItem')&&game.includes('state.solved.includes(item.id)'),'Local save and earned-once awards');
assert.ok(game.includes("completed:state.solved.length===80"),'Completion requires all eighty genuine discoveries');
assert.ok(game.includes("button.dataset.chapter")&&game.includes("missions.forEach"),'All levels and chapters are immediately accessible');
assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|geolocation|sendBeacon|setInterval/.test(game+art),'Picture engine uses no external calls, device location or timers');
assert.ok(css.includes('larriverse-dark')&&css.includes('larriverse-high-contrast')&&css.includes('@media(max-width:550px)'),'Dark, contrast and phone styles');
assert.ok(art.includes('<svg')&&spiderPicture('widow').includes('<ellipse')&&actionPicture('kit').includes('<rect'),'Original SVG spider and first-aid pictures');
for(const file of ['assets/picture-quest.js','assets/picture-quest-art.js','games/spider-scout/game.js',
 'games/spider-scout/questions.js','games/helping-hands/game.js','games/helping-hands/questions.js']){
 const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 assert.equal(result.status,0,file+' must parse cleanly: '+result.stderr);
}
console.log('Picture Quest validated: 40 playable worlds, 2 new visual games, 160 picture missions, safe local progress and accessibility.');
