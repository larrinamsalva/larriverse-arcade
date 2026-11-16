// LarriVerse Helping Hands: original expressive, cel-shaded anime-inspired people.
// No external textures or animation libraries. Characters are fully articulated
// filled silhouettes (faces, hair, sleeves, hands, legs, pants, shoes), not stick lines.
const H=(tag,attrs={},children='')=>'<'+tag+Object.entries(attrs).map(([key,value])=>' '+key+'="'+value+'"').join('')+'>'+children+'</'+tag+'>';
const P=(d,fill='none',stroke='none',width=0,extra={})=>H('path',{d,fill,stroke,'stroke-width':width,'stroke-linejoin':'round','stroke-linecap':'round',...extra});
const E=(x,y,rx,ry,fill,extra={})=>H('ellipse',{cx:x,cy:y,rx,ry,fill,...extra});
const C=(x,y,r,fill,extra={})=>H('circle',{cx:x,cy:y,r,fill,...extra});
const G=(markup,transform,meta={})=>H('g',transform?{transform,...meta}:meta,markup);
const BASE={ink:'#405466',hair:'#574538',hairLight:'#8b6b58',skin:'#f2bf9d',cheek:'#ef9f9b',dark:'#603f39',white:'#fffdf6',jeans:'#516f99',shoe:'#3a5368',sole:'#eef4ed'};
const looks=[
 {hair:'#59483f',light:'#b48360',skin:'#eeb893',pants:'#526f93'},
 {hair:'#403f4f',light:'#736b88',skin:'#c68b6d',pants:'#55748a'},
 {hair:'#775a36',light:'#d6a864',skin:'#f0c7a3',pants:'#677c9c'},
 {hair:'#48474b',light:'#8a8b8a',skin:'#aa795e',pants:'#536780'}
];
const palette=(opts={})=>{
 const style=looks[((Number(opts.style)||0)%looks.length+looks.length)%looks.length];
 return {...style,skin:opts.tone||style.skin,hair:opts.hair||style.hair,light:opts.hairLight||style.light,shirt:opts.color||'#5a9eaf'};
};
const mouth=(sad)=>sad?
 P('M-8 24 Q0 15 10 24','none','#a65e62',2.5):
 P('M-9 21 Q0 29 12 20','none','#a55f63',2.5);
const eye=(x,y,sad)=>{
 const eyeY=sad?y+1:y;
 return G(
   E(0,0,9.5,11,'#fffaf6',{stroke:'#654c51','stroke-width':1.8})+
   E(1,1,5.7,8,sad?'#95769c':'#668bb4')+
   E(1,2,3.5,5.4,'#273e50')+
   C(-1,-3,2.5,'#ffffff')+E(4,4,1.5,2.2,'#cceaf7')+
   P('M-10 -5 Q-1 -13 10 -6','none','#533e45',2.7)+
   (sad?P('M-10 -15 Q1 -19 10 -13','none','#684d4b',2.2):P('M-10 -16 Q0 -21 10 -17','none','#73544c',1.9)),
   'translate('+x+' '+eyeY+')');
};
export function animeFace(x,y,scale=1,tone,expression='calm',opts={}){
 const look=palette({...opts,tone});
 const distressed=expression==='distress';
 const sad=expression==='sad'||distressed;
 const outline='#875e52',hair=look.hair,shine=look.light;
 let svg='';
 // Round, wide anime-style head with a short jaw. The previous face was
 // tall and narrow; this silhouette matches the cheeks, not a stretched oval.
 svg+=P('M-38 -15 Q-48 -37 -33 -51 Q-24 -63 5 -60 Q31 -61 41 -39 Q49 -19 38 17 L30 26 Q40 4 28 -15 L-29 -12 Q-29 8 -32 25Z',
   hair,'#40383d',2.8,{'data-anime-layer':'hair-back'});
 svg+=E(-33,0,7.5,10.5,look.skin,{stroke:outline,'stroke-width':2});
 svg+=E(33,0,7.5,10.5,look.skin,{stroke:outline,'stroke-width':2});
 svg+=P('M-31 -22 Q-28 -39 1 -39 Q30 -38 32 -19 Q38 -1 33 15 Q24 33 0 36 Q-24 33 -33 15 Q-38 -2 -31 -22Z',
   look.skin,outline,2.6,{'data-anime-anatomy':'face-and-jaw','data-face-proportion':'rounded-anime'});
 svg+=P('M20 -24 Q34 -8 31 12 Q23 29 5 34 Q29 26 33 15 L32 -17Z','#d99d83',{opacity:.38});
 svg+=E(-23,15,8,3.8,BASE.cheek,{opacity:sad?.43:.28});
 svg+=E(23,15,8,3.8,BASE.cheek,{opacity:sad?.43:.28});
 svg+=eye(-14,-3,sad)+eye(14,-3,sad);
 svg+=P('M0 4 Q-3 11 2 12','none','#b77e6f',1.6,{'data-anatomy':'nose'});
 if(distressed){
  svg+=E(2,24,6,8,'#85434d',{stroke:'#ad6162','stroke-width':2,'data-expression':'open-mouth'});
  svg+=E(2,27,3,2.2,'#e99e9c');
  svg+=P('M-25 -17 L-15 -22 M15 -22 L25 -17','none','#694d4b',2.6);
  svg+=P('M-26 -2 L-29 6 M26 0 L29 8','none','#b87b74',1.5);
 } else svg+=mouth(sad);
 if(sad&&!distressed)svg+=P('M-22 10 Q-24 16 -20 23','none','#8bc1d1',2.4,{'data-expression':'worried'});
 svg+=P('M-39 -26 Q-29 -53 -2 -58 Q25 -56 40 -36 L43 -14 Q29 -24 22 -34 Q21 -22 12 -18 L7 -32 Q-5 -19 -16 -17 L-16 -30 Q-24 -18 -37 -15Z',
   hair,'#40383d',2.5,{'data-anime-layer':'layered-bangs'});
 svg+=P('M-28 -38 Q-14 -53 0 -50 M12 -49 Q25 -46 35 -32','none',shine,2.4,{opacity:.88});
 svg+=P('M-34 -22 Q-39 -10 -33 11 M39 -23 Q42 -5 32 18','none',hair,3);
 svg+=E(-27,1,2,4,'#bc8573',{opacity:.58});
 return G(svg,'translate('+x+' '+y+') scale('+scale+')',{
  'data-anime-feature':'expressive-face','data-face-shape':'compact-rounded','data-expression':expression
 });
}
function animeHand(x,y,scale=1,angle=0,tone='#eeb893'){
 return G(P('M-10 10 Q-14 3 -15 -5 Q-17 -11 -11 -13 Q-7 -14 -3 -7 L-4 -19 Q-4 -24 1 -24 Q7 -22 7 -15 L10 -23 Q15 -26 19 -21 Q21 -18 16 -7 Q26 -14 30 -7 Q32 -2 24 9 Q19 17 4 20 L-5 20Z',
     tone,'#a87662',2,{'data-anime-anatomy':'hand-and-fingers'})+
   P('M-5 0 L5 -2 M6 6 L15 4','none','#c98e78',1.3),
   'translate('+x+' '+y+') rotate('+angle+') scale('+scale+')');
}
function animeLeg(side,look){
 const S=side;
 // Tall, solid trouser legs, knee folds, sneakers and shoe soles.
 return G(
   P('M-27 49 Q-11 44 -2 55 L-9 87 L-10 99 Q-26 104 -32 93 L-36 63Z',look.pants,'#3b5269',2.3)+
   P('M-33 71 Q-21 63 -14 76 L-18 85','none','#abc0cf',1.5,{opacity:.6})+
   P('M-11 94 Q-25 89 -35 95 Q-42 102 -36 107 L-9 108 Q-3 105 -11 94Z',BASE.shoe,'#35485c',2)+
   P('M-35 105 L-9 105','none',BASE.sole,3),
   'scale('+S+' 1)');
}
function animeArm(side,look,pose){
 if(pose==='choking'){
  // Both real hands meet at the throat. This is an observable symptom,
  // NOT an illustration of how a child should treat an airway obstruction.
  const sleeve=P('M22 18 Q35 14 43 27 L45 42 L28 49 L14 35Z',
    look.shirt,'#427887',2.3);
  const arm=P('M37 41 Q35 23 21 5 L10 -6 Q5 2 8 12 Q22 35 27 51Z',
    look.skin,'#a4745e',2.3,{'data-anime-anatomy':'forearm'});
  const hand=animeHand(12,2,.71,side===1?30:-22,look.skin);
  return G(sleeve+arm+hand,'scale('+side+' 1)',{
   'data-anime-anatomy':'arm-sleeve-hand',
   'data-body-language':'hand-at-throat'
  });
 }
 const S=side;
 const sleeve=pose==='comfort'&&side===1?
  P('M22 18 Q33 15 40 28 L48 40 Q46 49 34 51 L18 38Z',look.shirt,'#427887',2.3):
  P('M22 17 Q34 17 41 28 L45 42 Q38 48 27 45 L17 34Z',look.shirt,'#427887',2.3);
 const arm=pose==='comfort'&&side===1?
  P('M39 40 Q57 54 70 62 L60 76 Q42 72 30 50Z',look.skin,'#a4745e',2):
  pose==='signal'&&side===1?
  P('M39 34 Q65 22 62 4 L76 -2 Q83 35 50 53Z',look.skin,'#a4745e',2):
  P('M36 41 Q47 55 37 75 L25 74 Q31 54 28 47Z',look.skin,'#a4745e',2);
 const hand=pose==='comfort'&&side===1?animeHand(63,68,.52,40,look.skin):
  pose==='signal'&&side===1?animeHand(74,1,.55,10,look.skin):
  animeHand(31,76,.49,-14,look.skin);
 const shade=P('M35 40 Q39 51 36 61','none','#d29176',2,{opacity:.7});
 return G(sleeve+arm+shade+hand,'scale('+S+' 1)',{'data-anime-anatomy':'arm-sleeve-hand'});
}
export function animePerson(x,y,scale=1,opts={}){
 const look=palette(opts),pose=opts.pose||'calm';
 let svg=E(0,109,52,8,'#617989',{opacity:.18});
 svg+=animeLeg(-1,look)+animeLeg(1,look);
 svg+=P('M-29 41 Q-24 53 -19 62 L21 62 Q27 53 30 41Z','#456a83','#31485d',2);
 svg+=animeArm(-1,look,pose);
 svg+=animeArm(1,look,pose);
 // Jacket with realistic filled folds, collar, cuffs and shaded side panels.
 svg+=P('M-29 16 Q-26 9 -11 10 L-7 16 L11 16 L16 10 Q31 14 34 26 L31 55 Q0 65 -32 54 L-35 29Z',
   look.shirt,'#3d6b7a',2.7,{'data-anime-anatomy':'torso-and-clothing'});
 svg+=P('M14 17 Q32 25 27 53 L15 58 L22 38Z','#33798d',{opacity:.47});
 svg+=P('M-27 20 Q-30 39 -25 52','none','#b2e0de',2.4,{opacity:.75});
 svg+=P('M-12 11 L0 25 L12 11 M0 25 L0 57','none','#e0f3ef',2.1);
 svg+=P('M-21 51 Q0 56 23 51','none','#39758a',2.2);
 svg+=P('M-9 3 L-8 18 L12 18 L10 1Z',look.skin,'#b78470',1.5);
 svg+=animeFace(0,-17,.98,look.skin,opts.expression||(opts.sad?'sad':'calm'),look);
 return G(svg,'translate('+x+' '+y+') scale('+scale+')',{
  'data-anime-character':'full-body','data-render-style':'cel-shaded','data-pose':pose,'data-body-language':pose==='choking'?'choking-symptoms':'normal'});
}
export function animeResting(){
 // An actual resting child, with full face/hair and filled arms/pants/shoes.
 const bedding=P('M72 140 Q146 130 256 141 L264 157 L70 160Z','#8ab4b7','#4c808d',2.5)+
   P('M84 130 Q94 113 125 123 L125 145 L76 147Z','#f3efe5','#bbcbd1',2);
 const child=G(animePerson(0,0,.9,{color:'#668fbd',style:2,sad:true}),
   'translate(147 107) rotate(-89) scale(.8)');
 const blanket=P('M130 107 Q164 95 203 111 Q213 124 207 144 L130 148Z','#97c0ac','#619e9d',2.5)+
  P('M140 115 Q170 107 193 118','none','#e3f1e5',2.5);
 return G(bedding+child+blanket,'',{'data-anime-scene':'resting-with-support'});
}
export function animeListening(){
 const body=animePerson(154,110,.85,{color:'#7b92bf',style:1,pose:'comfort'});
 const attentiveness=P('M223 72 Q249 54 261 70','none','#8fb2cb',3)+
  E(268,65,8,6,'#edb0b2',{opacity:.75});
 return G(body+attentiveness,'',{'data-anime-scene':'attentive-listener'});
}
export function animeNosebleedPose(withContext=true){
 // A chin and anatomical nose in three-quarter view—not a round icon. The
 // soft nostril area is covered by thumb and forefinger, child seated forward.
 const skin='#eec09d',outline='#996c5a';
 const shirt=P('M73 186 Q70 158 96 140 Q117 125 150 139 L171 133 Q209 131 232 157 L249 194 H72Z',
   '#5f9eaf','#397888',3.2,{'data-anime-anatomy':'seated-shoulders'});
 const collar=P('M121 138 Q149 155 170 137 L181 151 Q155 175 119 155Z','#e4f1ef','#699da8',2);
 const sleeve=P('M208 154 Q228 153 238 171 L231 191 L204 186Z','#356f8a','#326779',2);
 const hairBack=P('M93 70 Q75 29 107 11 Q132 -5 160 10 Q205 13 215 57 L207 111 Q195 124 185 116 L115 127 Q87 106 93 70Z',
   '#4b4040','#302f39',3,{'data-anime-layer':'hair-back'});
 const neck=P('M142 104 L135 145 L163 151 L171 109Z',skin,outline,1.6);
 const jaw=P('M102 47 Q117 21 163 28 Q195 28 202 63 L201 80 L219 94 Q221 103 211 107 L206 124 Q192 142 164 142 Q132 137 115 115 Q103 99 102 47Z',
   skin,outline,2.8,{'data-anime-anatomy':'nose-and-face'});
 const shade=P('M175 41 Q207 60 204 85 L213 93 L201 123 Q195 138 173 141 Q206 135 208 108 L218 97 L201 78Z',
   '#d79b83',{opacity:.48});
 const ears=E(111,93,8,12,skin,{stroke:outline,'stroke-width':2});
 const eyes=E(152,79,9,12,'#fffaf4',{stroke:'#74525a','stroke-width':2})+
  E(154,81,5.5,8,'#7a8d9a')+E(155,82,3.5,5,'#334551')+
  C(152,77,2.4,'#ffffff')+
  E(181,82,7.8,10,'#fffaf4',{stroke:'#74525a','stroke-width':1.8})+
  E(182,83,5,7,'#7a8d9a')+E(182,84,3.1,4.5,'#334551')+C(180,79,2,'#ffffff')+
  P('M142 66 Q152 59 163 67 M175 69 Q186 63 190 72','none','#5b4446',2.4);
 const realNose=P('M190 85 Q198 92 204 96 L219 99 Q220 104 211 107 L205 111',
   'none','#ad7764',3,{'data-face-part':'nose-bridge'});
 const nostril=E(206,109,3,1.8,'#8c5753')+
  P('M181 125 Q191 129 199 124','none','#a65d60',2.5);
 const blush=E(138,108,10,4,'#e89a93',{opacity:.34})+
   E(188,113,12,4,'#e89a93',{opacity:.32});
 const hairFront=P('M89 77 Q72 31 113 14 Q155 -5 183 10 Q220 24 219 71 L210 57 Q197 38 188 33 Q184 55 175 57 L173 34 Q160 62 144 57 L141 42 Q125 68 110 70 L106 58 Q97 85 92 97Z',
   '#554440','#302d33',2.6,{'data-anime-layer':'long-swept-bangs'})+
  P('M106 38 Q134 14 158 18 M168 15 Q191 22 199 40','none','#ad8266',3,{opacity:.75});
 const blood=P('M208 114 Q207 123 209 128','none','#be5a64',2.6,
  {'data-bleed-cue':'small'})+E(209,130,2.2,2.5,'#be5a64');
 // A full sleeve and forearm—no line-only arm—and two grasping fingers.
 const arm=P('M244 181 Q246 155 232 141 Q220 124 214 109 L199 119 Q207 144 215 161 L218 191Z',
   skin,outline,2.4,{'data-anime-anatomy':'forearm'});
 const fingers=P('M216 112 Q212 101 207 96 Q199 90 192 95 Q187 101 193 107 L200 114 Q187 111 184 120 Q183 130 194 131 Q204 133 211 128 Q221 121 216 112Z',
   '#efc5a3','#ab7967',2.4,{'data-first-aid-action':'pinch-soft-nose'})+
  P('M197 109 Q204 106 207 100 M195 122 Q201 121 205 124','none','#c18a75',1.7)+
  P('M208 108 Q211 111 210 116','none','#fff0df',2.4,{opacity:.7});
 const detail=P('M98 160 Q132 177 167 158 M201 162 Q219 169 223 183','none','#b5d8db',2.5)+
   (withContext?E(87,188,42,6,'#5b7b83',{opacity:.13}):'');
 return G(detail+shirt+collar+sleeve+neck+
  G(hairBack+ears+jaw+shade+eyes+realNose+nostril+blush+hairFront+blood,'translate(0 24) scale(1 .78)',{'data-face-proportion':'rounded-anime'})+
  arm+fingers,'',
 {'data-anime-scene':'nosebleed-forward-lean','data-art-style':'anime-character'});
}
