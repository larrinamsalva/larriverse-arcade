import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {SPIDERS,SPIDER_CHAPTERS,SPIDER_MISSIONS} from '../games/spider-scout/questions.js';
import {HELP_CASE_COUNT,HELP_CHAPTERS,HELP_MISSIONS} from '../games/helping-hands/questions.js';
import {spiderPicture,actionPicture} from '../assets/picture-quest-art.js';
import {helpActionPicture,helpScenePicture,HELPING_ACTION_TYPES,HELPING_SCENE_TITLES} from '../assets/helping-hands-realistic-art.js';
import {animePerson,animeFace,animeNosebleedPose,animeResting,animeListening} from '../assets/helping-hands-anime-characters.js';
import {FIELD_GUIDE_SPECIES} from '../assets/spider-field-guide-art.js';

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
for(const required of ['nosebleed','10–15 minutes','911','Poison Control','choking','seizure','burn','bullied','adult']){
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
for(const file of ['assets/picture-quest.js','assets/picture-quest-art.js','assets/helping-hands-answer-art.js','assets/helping-hands-picture-art.js','games/spider-scout/game.js',
 'games/spider-scout/questions.js','games/helping-hands/game.js','games/helping-hands/questions.js']){
 const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 assert.equal(result.status,0,file+' must parse cleanly: '+result.stderr);
}
// Each field-guide picture is an original standalone SVG, never an image URL or
// a diagnostic certificate. Test model variety and four pairs of legs.
assert.deepEqual(FIELD_GUIDE_SPECIES,SPIDERS.map(s=>s.key),
  'Every Spider Scout lesson subject has a specifically authored field-guide illustration');
const drawings=new Set();
for(const kind of FIELD_GUIDE_SPECIES){
 const svg=spiderPicture(kind);
 assert.ok(svg.includes('data-species="'+kind+'"')&&svg.includes('data-art-version="field-guide-2"'),kind+' identifies its illustration');
 assert.ok(svg.includes('data-habitat=')&&svg.includes('data-anatomy="cephalothorax-abdomen"'),kind+' has a distinct habitat and body');
 assert.equal((svg.match(/data-leg="/g)||[]).length,8,kind+' must show all eight joined legs');
 assert.ok(svg.includes('<radialGradient')&&svg.includes('data-eyes='),kind+' has dimensional shading and a species-relevant eye arrangement');
 assert.ok(svg.includes('data-markings="'+kind+'"'),kind+' has a distinct markings layer');
 assert.ok((svg.match(/<path /g)||[]).length>=22,kind+' must have substantially more visual detail than a simple oval sketch');
 assert.ok(svg.length>4500&&svg.length<55000,kind+' SVG must be detailed but lightweight enough for mobile');
 const contentWithoutSvgNamespace=svg.replace('xmlns="http://www.w3.org/2000/svg"','');
 assert.ok(!/<script|foreignObject|https?:\/\/|<image|@import|onload=|javascript:/i.test(contentWithoutSvgNamespace),
   kind+' picture must contain no external assets, remote scripts or interactive code');
 drawings.add(svg);
}
assert.equal(drawings.size,10,'All ten spider pictures are visibly different designs');
for(const kind of ['jumping','wolf','cellar','tarantula','widow','recluse']){
 const s=spiderPicture(kind);
 assert.ok(s.includes('data-species="'+kind+'"')&&s.includes('data-markings="'+kind+'"'));
}
assert.ok(spiderPicture('jumping').includes('data-eyes="jumper"'),'Jumping spiders have prominent forward-looking eyes');
assert.ok(spiderPicture('wolf').includes('data-eyes="wolf"'),'Wolf spiders have their own eye pattern');
assert.ok(spiderPicture('recluse').includes('data-eyes="recluse"'),'Recluse art includes eye grouping without claiming definitive identification');
assert.ok(spiderPicture('widow').includes('data-habitat="wood"'),'Widow art shows a sheltered woodpile habitat');
const spiderUi=fs.readFileSync('assets/picture-quest.css','utf8');
assert.ok(spiderUi.includes('body[data-classic="spider-scout"] .choices'), 'Spider pictures stay large enough to compare on phones');
const moduleSyntax=spawnSync(process.execPath,['--check','assets/spider-field-guide-art.js'],{encoding:'utf8'});
assert.equal(moduleSyntax.status,0,'Field guide renderer must parse as JavaScript: '+moduleSyntax.stderr);
// Helping Hands bundles local WebP answers and scenarios with SVG fallbacks.
assert.equal(HELPING_SCENE_TITLES.length,20,'Twenty individual Helping Hands teaching scenes exist');
assert.equal(new Set(HELPING_SCENE_TITLES).size,20,'Every real-life situation has a unique scene');
assert.ok(HELPING_ACTION_TYPES.length>=24,'Every object/action icon gets upgraded art');
const seenSceneArt=new Set();
const seenSceneImages=new Set();
for(const [index,title] of HELPING_SCENE_TITLES.entries()){
 const file='case-'+(index+1);
 const bitmap=fs.readFileSync('assets/helping-hands-scenes/'+file+'.webp');
 assert.equal(bitmap.toString('ascii',0,4),'RIFF',title+' has a WebP container');
 assert.equal(bitmap.toString('ascii',8,12),'WEBP',title+' has a WebP signature');
 seenSceneImages.add(bitmap.toString('base64'));
 const pic=helpScenePicture({title});
 assert.ok(pic.includes('data-help-art="anime-3"')&&pic.includes('data-kind="scenario"'),title+' displays a realism scene');
 assert.ok(pic.includes('data-key="'+file+'"'),title+' has a distinct visual scene key');
 assert.ok(pic.includes('<svg')&&pic.includes('<path')&&pic.length>1400,title+' contains meaningful native SVG art');
 assert.ok(!/<script|foreignObject|<image|onload=|javascript:|@import/i.test(pic),title+' remains local and noninteractive');
 seenSceneArt.add(pic);
}
assert.equal(seenSceneArt.size,20,'All twenty helping scenes are individual illustrations');
assert.equal(seenSceneImages.size,20,'All twenty rendered Helping Hands scenes are distinct files');
const seenActions=new Set();
for(const kind of HELPING_ACTION_TYPES){
 const bitmap=fs.readFileSync('assets/helping-hands-answers/'+kind+'.webp');
 assert.equal(bitmap.toString('ascii',0,4),'RIFF',kind+' has a WebP container');
 assert.equal(bitmap.toString('ascii',8,12),'WEBP',kind+' has a WebP signature');
 const pic=helpActionPicture(kind);
 assert.ok(pic.includes('data-kind="answer"')&&pic.includes('data-key="'+kind+'"'),kind+' has its own illustrated prop');
 assert.ok(pic.includes('<svg')&&pic.length>350&&(pic.includes('<path')||pic.includes('<rect')),
  kind+' is a recognisable illustrated object, not a circle-only placeholder');
 assert.ok(!/<script|foreignObject|<image|onload=|javascript:|@import/i.test(pic),kind+' uses no external images or code');
 seenActions.add(pic);
}
assert.equal(seenActions.size,HELPING_ACTION_TYPES.length,'Answer objects are not duplicate illustrations');
const noseScene=helpScenePicture({title:'A nosebleed after recess'});
const noseOption=helpActionPicture('nose');
for(const art of [noseScene,noseOption]){
 assert.ok(art.includes('data-face-part="nose-bridge"'),'Nosebleed art includes an anatomical nose, not a circle icon');
 assert.ok(art.includes('data-first-aid-action="pinch-soft-nose"'),'Nosebleed art shows fingers pinching the soft part');
 assert.ok(art.includes('data-bleed-cue="small"'),'Nosebleed art includes a tiny non-graphic bleed cue');
}
const helpScenarioOrder=[...new Set(HELP_MISSIONS.map(q=>q.title))];
assert.deepEqual(helpScenarioOrder,HELPING_SCENE_TITLES,'Each Helping Hands scenario maps to its matching image');
assert.ok(HELP_MISSIONS.every(q=>q.options.every(option=>HELPING_ACTION_TYPES.includes(option.icon))),
 'Every image answer in the 80 Helping Hands missions uses an illustrated, registered object');
const qs=fs.readFileSync('assets/picture-quest.js','utf8');
assert.ok(qs.includes("if(world==='help'){\n        renderHelpAnswerPicture(image,option.icon);"),
 'Realism answers are limited to Helping Hands and do not replace Spider Scout art');
assert.ok(qs.includes('state.solved.includes(item.id)'), 'First-time awards are not changed');
const host=fs.readFileSync('assets/picture-quest-art.js','utf8');
assert.ok(host.includes('helpScenePicture(item)')&&host.includes("mode==='spider'?spiderPicture(item.scene)"),
 'Helping Hands scenes are improved without affecting spider specimens');
assert.ok(css.includes('body[data-classic="helping-hands"] .choices'),
 'Helping Hands art gets wide enough choice cards at phone widths');
const helpArt=fs.readFileSync('assets/helping-hands-realistic-art.js','utf8');
const helpSyntax=spawnSync(process.execPath,['--check','assets/helping-hands-realistic-art.js'],{encoding:'utf8'});
assert.equal(helpSyntax.status,0,'New first aid SVG art module must parse cleanly: '+helpSyntax.stderr);
assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|navigator\.geolocation|sendBeacon|setInterval/.test(helpArt),
 'Realistic safety art never collects incidents or contacts a remote server');
// The anime update must solve the underlying stick-figure problem, not just
// recolor a head: bodies, arms, hands, two legs, clothing, shoes, faces and eyes
// have actual filled vector geometry.
const expressive=animePerson(150,98,.85,{pose:'comfort',sad:true,style:2});
for(const label of ['data-anime-character="full-body"','data-anime-anatomy="torso-and-clothing"',
 'data-anime-anatomy="arm-sleeve-hand"','data-anime-anatomy="hand-and-fingers"',
 'data-anime-anatomy="face-and-jaw"','data-anime-layer="layered-bangs"',
 'data-anime-feature="expressive-face"','data-pose="comfort"']){
 assert.ok(expressive.includes(label),'Characters require expressive anime anatomy: '+label);
}
assert.ok((expressive.match(/data-anime-anatomy="arm-sleeve-hand"/g)||[]).length===2,
 'Each illustrated person has two filled-in arms');
assert.ok(expressive.includes('<ellipse')&&expressive.includes('<path'),
 'Anime characters contain eyes, hair shapes, full silhouettes and fabric details');
assert.ok(animeFace(151,86,1).includes('data-anime-feature="expressive-face"'),
 'Faces include layered eyes, chin and hair');
assert.ok(animeResting().includes('data-anime-scene="resting-with-support"'),
 'Resting child has a filled lying pose, pillow and bedding');
assert.ok(animeListening().includes('data-anime-scene="attentive-listener"'),
 'Listening answer shows a recognizable person, not an ear-only icon');
assert.ok(animeNosebleedPose().includes('data-anime-scene="nosebleed-forward-lean"'),
 'Nosebleed scene now has an expressive anime face and upright shoulders');
for(const title of HELPING_SCENE_TITLES){
 const pic=helpScenePicture({title});
 assert.ok(pic.includes('data-help-art="anime-3"'),'Every Helping Hands scene uses current anime illustration version');
 assert.ok(pic.includes('data-anime-'),'Every situation includes a filled anime person or character scene: '+title);
}
for(const k of ['nose','adult','friend','rest','listen','wait']){
 assert.ok(helpActionPicture(k).includes('data-anime-'),
  'Human-related answer pictures have an actual anime character: '+k);
}
const animeSrc=fs.readFileSync('assets/helping-hands-anime-characters.js','utf8');
assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|navigator\.geolocation|sendBeacon|setInterval|<script/i.test(animeSrc),
 'Anime drawings require no servers, timers, telemetry or unsafe markup');
const animeSyntax=spawnSync(process.execPath,['--check','assets/helping-hands-anime-characters.js'],{encoding:'utf8'});
assert.equal(animeSyntax.status,0,'Anime character module must parse cleanly: '+animeSyntax.stderr);
// Face proportions must match modern expressive anime rather than tall ovals.
// Choking should LOOK like choking, without teaching an untrained child treatment.
const roundedFace=animeFace(150,92,1);
assert.ok(roundedFace.includes('data-face-proportion="rounded-anime"')&&
 roundedFace.includes('data-face-shape="compact-rounded"'),
 'Characters require wider round heads and actual cheeks, not stretched faces');
const distressed=animePerson(130,95,.72,{pose:'choking',expression:'distress'});
assert.equal((distressed.match(/data-body-language="hand-at-throat"/g)||[]).length,2,
 'Both forearms and hands must clearly converge at the throat when choking');
assert.ok(distressed.includes('data-expression="open-mouth"')&&
 distressed.includes('data-body-language="choking-symptoms"')&&
 distressed.includes('data-anime-anatomy="hand-and-fingers"'),
 'Choking characters show facial distress and shaped hands, not an icon');
const chokingScene=helpScenePicture({title:'A person cannot breathe or speak'});
for(const clue of ['data-scene-action="choking-hands-at-throat"',
 'data-body-language="choking-symptoms"','data-face-proportion="rounded-anime"',
 'data-expression="open-mouth"']){
 assert.ok(chokingScene.includes(clue),'Choking problem scene must act out: '+clue);
}
const noseArt=animeNosebleedPose();
assert.ok(noseArt.includes('data-face-proportion="rounded-anime"')&&
 noseArt.includes('data-first-aid-action="pinch-soft-nose"'),
 'Nosebleed teaching retains a clear pinching hand with improved rounder head');
console.log('Picture Quest validated: 40 playable worlds, 2 new visual games, 160 picture missions, safe local progress and accessibility.');
