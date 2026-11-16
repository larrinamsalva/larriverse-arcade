import {animeFace,animePerson,animeResting,animeListening,animeNosebleedPose} from './helping-hands-anime-characters.js';
// Anime-character edition: filled silhouettes, expressive faces, layered clothes and child-safe scenes.
// Educational, original, offline vector paintings. Not live emergency guidance.
// Each artwork has a scene-specific silhouette, recognizable objects, skin/hair
// detail, visible fingers or tools where needed, and NO external image requests.
const KINDS=Object.freeze([
 'emergency','phone','kit','bandage','pressure','water','nose','ice','medicine',
 'adult','friend','listen','rest','stop','away','noTouch','observe','clock',
 'food','cloth','door','wait','house','fire'
]);
export const HELPING_ACTION_TYPES=KINDS;
const SITUATIONS=Object.freeze([
 'A nosebleed after recess','A small playground scrape','Someone is bleeding a lot',
 'A person cannot breathe or speak','Someone will not wake up','A small hot-water burn',
 'Feeling too hot outside','A severe allergy warning','A twisted ankle during a game',
 'A fall with possible head or neck injury','Someone is having a seizure',
 'A painful eye injury','A bicycle crash near traffic','A friend is crying and upset',
 'Someone is being bullied','A child is lost in a store','Smoke from a building',
 'Someone struggling in deep water','Unknown pills or household cleaner',
 'A possible spider bite'
]);
export const HELPING_SCENE_TITLES=SITUATIONS;
const ink='#355363',skin='#e8b38e',shadow='#b9826b',shirt='#4a9eaa';
function h(tag,attrs={},inside=''){
 return '<'+tag+Object.entries(attrs).map(([k,v])=>' '+k+'="'+v+'"').join('')+'>'+inside+'</'+tag+'>';
}
const p=(d,fill='none',stroke='none',width=0,other={})=>
 h('path',{d,fill,stroke,'stroke-width':width,'stroke-linejoin':'round','stroke-linecap':'round',...other});
const e=(cx,cy,rx,ry,fill,other={})=>h('ellipse',{cx,cy,rx,ry,fill,...other});
const c=(cx,cy,r,fill,other={})=>h('circle',{cx,cy,r,fill,...other});
const r=(x,y,w,hgt,rx,fill,other={})=>h('rect',{x,y,width:w,height:hgt,rx,fill,...other});
const line=(x1,y1,x2,y2,color,width=2)=>p('M'+x1+' '+y1+' L'+x2+' '+y2,'none',color,width);
const g=(inside,transform)=>h('g',transform?{transform}: {},inside);
const tx=(x,y,value,size=15,fill=ink)=>h('text',{x,y,fill,'text-anchor':'middle','font-family':'system-ui,Arial,sans-serif','font-size':size,'font-weight':800},value);
// Soft painterly floor and slight cast shadows make the objects feel tangible.
function frame(inner,kind,key,background='#f1f5f2'){
 return h('svg',{xmlns:'http://www.w3.org/2000/svg',viewBox:'0 0 320 200',focusable:'false','aria-hidden':'true',
   'data-help-art':'anime-3','data-kind':kind,'data-key':key,'data-illustration':'offline-original-svg'},
   r(2,2,316,196,21,background,{stroke:'#a4bbc1','stroke-width':3})+
   c(269,42,32,'#ffffff',{opacity:.27})+
   e(165,172,126,12,'#536b72',{opacity:.11})+
   inner);
}
function room(theme='classroom'){
 let bg= r(12,12,296,170,12,theme==='school'?'#e8f0eb':'#f3f1e9');
 bg+=p('M13 138 H307 V181 H13Z',theme==='school'?'#d2e3d5':'#ddd8c9');
 bg+=line(13,138,307,138,'#a4b5ac',2);
 bg+=p('M19 19 H92 L117 108 H42Z','#fffaf0','none',0,{opacity:.23});
 bg+=p('M225 20 L304 32 V81 L259 60Z','#ffffff','none',0,{opacity:.25});
 bg+=r(28,28,68,68,7,'#d2e9f1',{stroke:'#9ab9bc','stroke-width':3})+
      line(62,29,62,96,'#9fb8b7',3)+line(29,62,96,62,'#9fb8b7',3);
 if(theme==='school')bg+=r(228,34,56,37,4,'#d2e7d4',{stroke:'#789981','stroke-width':3})+
   line(239,44,273,44,'#8caf89',2);
 return bg;
}
function outside(mode='park'){
 let bg=p('M12 137 Q83 117 160 136 T308 129 L308 184 H12Z',mode==='street'?'#aebec1':'#a6c6a1');
 bg+=p('M15 168 H305','none',mode==='street'?'#eae9d3':'#729974',4);
 bg+=p('M24 136 Q40 106 45 62','none','#7c9d70',7);
 bg+=e(46,57,30,27,'#7eb080')+e(65,73,21,18,'#6aa276');
 bg+=e(270,53,32,27,'#aad1cc',{opacity:.7});
 return bg;
}
function face(x,y,scale=1,tone=skin,expression='calm'){return animeFace(x,y,scale,tone,expression);}
function person(x,y,scale=1,opts={}){return animePerson(x,y,scale,opts);}
function hand(x,y,scale=1,angle=0){
 const fingers=p('M-29 15 Q-25 1 -16 -13 Q-11 -22 -4 -18 Q0 -13 -8 -2 L-3 -18 Q1 -29 8 -24 Q14 -20 8 -8 L12 -15 Q18 -22 23 -17 Q29 -12 21 -2 Q34 0 32 9 Q29 25 10 27 L-5 29Z',
 '#e9b68e','#a97966',2);
 const creases=p('M-8 11 L9 11 M-10 18 L11 18','none','#c28a70',1.7);
 return g(fingers+creases,'translate('+x+' '+y+') rotate('+angle+') scale('+scale+')');
}
function phone(emergency=false){
 return e(162,159,61,10,'#6c8290',{opacity:.2})+
   r(105,23,114,149,17,'#314f60',{stroke:'#203f51','stroke-width':4})+
   r(116,36,92,121,7,emergency?'#dceff1':'#e3ece9')+
   r(146,28,30,4,2,'#172d3b')+
   (emergency?tx(162,106,'911',42,'#b54349')+tx(162,129,'EMERGENCY',11,'#5b6972'):
    p('M147 75 Q156 106 185 115','none','#21756d',10)+c(163,57,17,'#a4d4cf'))+
   c(162,164,4,'#b6d0d3');
}
function firstAidKit(){
 return e(158,162,106,11,'#8298a0',{opacity:.17})+
   r(67,67,184,100,13,'#eef4ef',{stroke:'#5c7580','stroke-width':4})+
   p('M120 67 V48 Q121 40 130 40 H189 Q199 40 199 49 V67','none','#637f8b',9)+
   r(76,76,167,11,5,'#ffffff',{opacity:.85})+
   r(130,85,60,60,7,'#ffffff',{stroke:'#bdcfcf','stroke-width':2})+
   r(151,95,17,41,3,'#d45559')+r(139,107,42,16,3,'#d45559')+
   line(70,125,248,125,'#a2b6b9',2)+r(89,121,23,12,3,'#8fa6ab')+
   r(209,121,23,12,3,'#8fa6ab');
}
function bandage(){
 return e(161,154,103,13,'#91a09b',{opacity:.15})+
  g(r(47,76,224,57,27,'#ddb08d',{stroke:'#9d6e59','stroke-width':2.6})+
  r(117,81,87,47,8,'#f3dcc1',{stroke:'#c49a80','stroke-width':1.3})+
  Array.from({length:5},(_,i)=>c(132+i*14,95+(i%2)*16,1.9,'#bb8a6d')).join('')+
  p('M56 98 H104 M217 98 H263','none','#f4c6a5',3),
  'rotate(-15 160 108)');
}
function medicalCloth(){
 return e(158,162,91,9,'#647b7d',{opacity:.13})+
  g(r(76,64,168,102,10,'#f7faf6',{stroke:'#91a8ad','stroke-width':4})+
   p('M86 99 H234 M87 130 H233 M130 67 V162 M183 67 V162','none','#c1d9da',2)+
   p('M190 65 L241 110 L190 163','none','#9db8bc',2),
   'rotate(-9 160 115)');
}
function pressure(){
 return p('M45 145 Q75 109 113 119 Q178 110 274 135 L282 166 L44 173 Z','#e6b088','#af8067',3)+
   p('M91 129 L237 124 L255 158 L101 161Z','#eef4ef','#8bafb2',3)+
   p('M112 128 L117 158 M148 126 L151 159 M182 125 L183 160 M210 127 L217 155','none','#c9dcda',1.6)+
   g(p('M-38 11 Q-30 -21 -19 -25 Q-10 -29 -8 -12 L-3 -30 Q6 -33 12 -22 L17 -13 Q29 -18 34 -7 Q45 15 19 31 L-16 31Z','#dfab82','#a4735d',2.6),
     'translate(157 112) scale(.93)');
}
function faucet(){
 return r(42,58,83,94,7,'#dae7e5',{stroke:'#9bb2b5','stroke-width':3})+
  p('M53 92 H147 V68 Q147 58 160 58 H184 Q195 58 195 68 V92','none','#77989e',15)+
  r(172,90,39,14,5,'#849ca3')+
  p('M194 104 Q190 116 195 130 Q200 147 194 158','none','#5bb9d9',8)+
  p('M206 105 Q202 121 211 134','none','#9bdef0',4);
}
function water(){
 return faucet()+hand(218,137,.8,-85)+e(224,157,40,10,'#a7d8e2',{opacity:.65});
}
function coldPack(){
 return e(162,162,89,10,'#95aeb3',{opacity:.2})+
  g(r(68,60,185,97,16,'#9bd8e7',{stroke:'#4d8fa0','stroke-width':4})+
   r(77,70,167,22,8,'#def4f8',{opacity:.7})+
   p('M161 84 V140 M133 113 H190 M139 91 L184 136 M182 90 L140 136','none','#ffffff',5)+
   p('M87 68 H238','none','#6ab0c1',3),'rotate(-8 160 111)');
}
function bottle(){
 return e(157,169,64,9,'#6b848a',{opacity:.14})+
  r(99,58,117,110,13,'#dba879',{stroke:'#976e58','stroke-width':3})+
  r(94,39,128,29,6,'#7d9fae',{stroke:'#556e78','stroke-width':3})+
  r(117,89,81,55,8,'#fffaf0',{stroke:'#d5bca6','stroke-width':1.4})+
  p('M150 98 V135 M133 116 H169','none','#c96465',8)+
  tx(158,157,'KEEP CLOSED',10,'#715a4c');
}
function thermometerClock(){
 return c(159,102,61,'#e7f2f2',{stroke:'#69939e','stroke-width':8})+
  c(159,102,4,'#4b7180')+
  line(159,102,158,62,'#426d79',6)+line(159,102,189,121,'#426d79',6)+
  Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return line(159+Math.cos(a)*50,102+Math.sin(a)*50,159+Math.cos(a)*56,102+Math.sin(a)*56,'#7fa3aa',2);}).join('');
}
function stopSign(){
 return p('M120 41 H200 L247 86 V139 L200 181 H120 L77 139 V86Z','#d05a5a','#fff7e8',6)+
  tx(160,124,'STOP',32,'#ffffff')+
  r(157,180,7,17,3,'#6f8589');
}
function arrowAway(){
 return p('M67 119 L165 119 L165 85 L246 143 L165 195 L165 164 L67 164Z','#4a91a5','#285c72',5)+
 e(77,160,25,7,'#87abb2',{opacity:.25});
}
function warningHands(){
 return g(p('M-32 24 L-32 -9 Q-33 -22 -23 -23 Q-16 -24 -13 -13 V-39 Q-12 -48 -2 -46 Q8 -44 8 -34 V-18 Q8 -35 18 -35 Q28 -35 27 -22 V-9 Q34 -18 42 -10 Q51 5 37 29 Q23 52 -2 52 Q-24 49 -32 24Z','#efbd98','#a77961',3),
  'translate(160 105) scale(1.1)')+
  c(160,110,77,'none',{stroke:'#c95558','stroke-width':9})+
  line(112,166,211,53,'#c95558',9);
}
function magnifier(){
 return c(145,93,43,'#d8edf1',{stroke:'#618e9c','stroke-width':9})+
  c(145,93,18,'#a6c8d3')+p('M178 124 L222 171','none','#315568',15);
}
function peoplePair(){
 return person(107,118,.68,{color:'#7b90b3'})+
    person(221,118,.79,{color:'#d2a269',style:2,pose:'comfort'})+
    p('M130 129 Q160 143 184 127','none','#a77761',7);
}
function resting(){return animeResting();}
function listening(){return animeListening();}
function shelter(){
 return r(75,55,177,124,7,'#e4bc92',{stroke:'#a87f62','stroke-width':4})+
   p('M63 68 L164 20 L265 68','none','#b08060',13)+
   r(103,89,53,88,3,'#a2b6a6')+r(179,89,45,43,4,'#c4e2eb',{stroke:'#91adaf','stroke-width':3});
}
function door(){
 return r(100,26,124,157,5,'#bd9372',{stroke:'#80654f','stroke-width':5})+
   r(111,39,97,134,3,'#d3aa87',{stroke:'#a67c5d','stroke-width':2})+
   c(191,112,7,'#eee4bb')+r(110,26,8,157,0,'#af815f',{opacity:.5});
}
function fire(){
 return r(63,54,201,125,4,'#c7cbd0',{stroke:'#879aa0','stroke-width':3})+
  r(91,77,41,57,2,'#d7edf0')+
  p('M130 166 Q99 135 132 109 Q150 91 143 71 Q172 97 171 118 Q179 95 188 91 Q225 133 198 164Z','#e08049','#b84e3b',4)+
  p('M150 165 Q131 141 155 119 Q165 133 174 134 Q182 149 170 164Z','#f5c26b')+
  p('M98 83 Q67 49 104 29 Q139 14 162 45','none','#b6bcbf',13,{opacity:.7});
}
function food(){
 return e(161,135,91,33,'#edf6f2',{stroke:'#91a5aa','stroke-width':4})+
   p('M101 124 Q114 94 145 98 T206 114','none','#ba986c',18)+
   e(178,128,26,11,'#92b678');
}
function actionParts(kind){
 switch(kind){
  case 'emergency':return phone(true);
  case 'phone':return phone(false);
  case 'kit':return firstAidKit();
  case 'bandage':return bandage();
  case 'pressure':return pressure();
  case 'water':return water();
  case 'nose':return nosebleedPose(false);
  case 'ice':return coldPack();
  case 'medicine':return bottle();
  case 'adult':return peoplePair();
  case 'friend':return peoplePair()+c(157,60,12,'#e7a4ab')+
     p('M157 78 L143 62 Q135 44 149 48 Q157 54 160 58 Q174 44 182 53 Q188 62 157 78Z','#e18b9a');
  case 'listen':return listening();
  case 'rest':return resting();
  case 'stop':return stopSign();
  case 'away':return arrowAway();
  case 'noTouch':return warningHands();
  case 'observe':return magnifier();
  case 'clock':return thermometerClock();
  case 'food':return food();
  case 'cloth':return medicalCloth();
  case 'door':return door();
  case 'wait':return person(159,108,.79)+thermometerClock();
  case 'house':return shelter();
  case 'fire':return fire();
  default:return magnifier();
 }
}
// Detailed, explicit nose/profile + pinching fingers, not a face-shaped circle.
function nosebleedPose(withContext=true){return animeNosebleedPose(withContext);}
export function helpActionPicture(kind){
 const key=KINDS.includes(kind)?kind:'observe';
 return frame(actionParts(key),'answer',key);
}
function scenarioScene(index){
 const id=index,base=id===12?outside('street'):id===6||id===8||id===17||id===19?outside():room(id===0||id===1||id===13||id===14?'school':'room');
 let scene='';
 switch(id){
  case 0: // Real recognizable child's face, nose and fingers for a nosebleed.
   scene=base+g(nosebleedPose(),'translate(-4 0)')+g(medicalCloth(),'translate(154 92) scale(.35)');
   break;
  case 1:scene=base+person(112,105,.78,{color:'#63a8b6'})+
    g(p('M61 130 Q77 119 85 138','none','#e7b28c',13)+
      e(83,135,6,4,'#bd6870'),'translate(0 0)')+
    g(bandage(),'translate(156 112) scale(.4)');
   break;
  case 2:scene=base+person(111,100,.82,{color:'#658f9e'})+
    g(pressure(),'translate(150 79) scale(.55)')+
    g(phone(true),'translate(234 20) scale(.28)');
   break;
  case 3: // A real symptom pose: leaning forward, both hands at throat.
   // NOT a demonstration of choking treatment or abdominal thrusts.
   scene=base+
     g(person(125,98,.71,{color:'#d39172',style:1,pose:'choking',expression:'distress'}),
       'rotate(11 125 118)',{'data-scene-action':'choking-hands-at-throat'})+
     g(food(),'translate(215 93) scale(.38)')+
     g(phone(true),'translate(250 28) scale(.21)');

   break;
  case 4:scene=base+g(resting(),'translate(-27 -16) scale(1.08)')+
    g(phone(true),'translate(191 73) scale(.53)');
   break;
  case 5:scene=base+person(112,109,.76,{color:'#648d9b'})+
    g(faucet(),'translate(104 42) scale(.63)')+
    g(hand(0,0,.8,50),'translate(173 139)');
   break;
  case 6:scene=base+e(145,42,53,29,'#f0dc8a')+
    person(110,117,.75,{color:'#ba9b72'})+
    g(water(),'translate(170 78) scale(.43)')+
    g(resting(),'translate(163 113) scale(.45)');
   break;
  case 7:scene=base+person(103,106,.84,{color:'#d0a07c'})+
    p('M80 72 Q100 83 123 72','none','#d27a71',5)+
    g(phone(true),'translate(181 67) scale(.6)');
   break;
  case 8:scene=base+g(resting(),'translate(-37 9) scale(.8)')+
    g(coldPack(),'translate(152 113) scale(.5)');
   break;
  case 9:scene=base+g(resting(),'translate(-36 0) scale(.88)')+
    g(stopSign(),'translate(172 72) scale(.55)');
   break;
  case 10:scene=base+g(resting(),'translate(-34 9) scale(.87)')+
    g(thermometerClock(),'translate(171 66) scale(.55)');
   break;
  case 11:scene=base+person(113,104,.84,{color:'#668caa'})+
    p('M134 70 Q147 76 157 90','none','#eab894',9)+
    g(medicalCloth(),'translate(166 109) scale(.44)');
   break;
  case 12:scene=base+g(p('M35 140 L75 140 L113 107 H160 L206 140 H265','none','#567e91',6)+
    c(93,153,20,'#344b56',{stroke:'#bed1ca','stroke-width':5})+
    c(213,153,20,'#344b56',{stroke:'#bed1ca','stroke-width':5})+
    p('M112 110 L154 154 L179 111','none','#638ca0',5),'')+
    g(person(0,0,.78),'translate(230 16)');
   break;
  case 13:scene=base+person(101,119,.78,{color:'#7ba0b0',sad:true,style:1})+
    person(223,119,.78,{color:'#daa975',style:2,pose:'comfort'})+
    p('M138 125 Q162 117 183 123','none','#e6b18c',8);
   break;
  case 14:scene=base+person(95,115,.74,{color:'#84a6b5',sad:true})+
    person(225,119,.86,{color:'#cf9a70',style:2,pose:'comfort'})+
    g(person(0,0,.5,{color:'#7d9367'}),'translate(164 62)');
   break;
  case 15:scene=base+g(shelter(),'translate(88 11) scale(.77)')+
    person(98,110,.72,{color:'#7aa2b2'})+
    person(220,105,.86,{color:'#c4a16e',style:3,pose:'comfort'});
   break;
  case 16:scene=base+g(fire(),'translate(-50 30) scale(.85)')+
    g(arrowAway(),'translate(144 58) scale(.58)')+
    g(person(0,0,.54,{color:'#72a396',pose:'signal'}),'translate(263 86)');
   break;
  case 17:scene=base+r(18,116,284,60,10,'#9fcfdc')+
    p('M22 120 Q68 103 115 121 T211 121 T299 120','none','#67a8bd',6)+
    g(face(0,0,.7),'translate(104 96)')+
    g(arrowAway(),'translate(129 33) scale(.58)')+
    g(phone(true),'translate(221 54) scale(.34)');
   break;
  case 18:scene=base+g(bottle(),'translate(-38 40) scale(.75)')+
    g(phone(false),'translate(120 36) scale(.6)')+
    g(person(0,0,.45,{color:'#96a76a',style:1}),'translate(262 78)');
   break;
  case 19:scene=base+person(112,111,.77,{color:'#73a39c'})+
    g(p('M68 85 Q84 78 93 92','none','#b65c66',5),'')+
    g(magnifier(),'translate(157 80) scale(.51)');
   break;
 }
 return scene;
}
export function helpScenePicture(item){
 const index=SITUATIONS.indexOf(item?.title);
 const sceneIndex=index<0?0:index;
 return frame(scenarioScene(sceneIndex),'scenario','case-'+(sceneIndex+1),sceneIndex===17?'#e5f4f4':'#f3f4ed');
}
