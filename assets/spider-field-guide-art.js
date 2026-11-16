// Original field-guide-style illustrations, not photographs or a species-ID tool.
// All geometry is deterministic, local SVG; no fonts, images, network or canvas.
// Viewed from above: cephalothorax at left, abdomen at right, four pairs of legs.
const TYPE=Object.freeze({
  jumping:{hab:'leaf',head:'#38464b',body:'#59514a',leg:'#645850',accent:'#dcc9a8',h:[23,22],a:[26,24],feet:6,eye:'jumper',fuzz:2,mark:'jump',pose:'compact'},
  orb:{hab:'orb',head:'#806044',body:'#ac7140',leg:'#986b43',accent:'#efcf89',h:[18,17],a:[36,33],feet:4.1,eye:'small',mark:'orb',pose:'orb'},
  wolf:{hab:'litter',head:'#6f6954',body:'#8c7658',leg:'#72664d',accent:'#d5bf9c',h:[23,21],a:[31,25],feet:5.1,eye:'wolf',fuzz:1,mark:'wolf',pose:'runner'},
  cellar:{hab:'corner',head:'#a9957c',body:'#b4a084',leg:'#8d785e',accent:'#e5d1b6',h:[12,12],a:[14,17],feet:1.7,eye:'tiny',mark:'plain',pose:'long'},
  crab:{hab:'flower',head:'#d7b65e',body:'#ebca78',leg:'#caa153',accent:'#fff0a9',h:[22,20],a:[29,25],feet:5.5,eye:'small',mark:'crab',pose:'sideways'},
  tarantula:{hab:'burrow',head:'#514541',body:'#695751',leg:'#554b46',accent:'#b29a86',h:[27,25],a:[34,30],feet:9.2,eye:'tiny',fuzz:3,mark:'taran',pose:'heavy'},
  widow:{hab:'wood',head:'#202328',body:'#22242c',leg:'#25252c',accent:'#b9a5a1',h:[17,16],a:[35,35],feet:3.3,eye:'small',mark:'widow',pose:'long'},
  recluse:{hab:'storeroom',head:'#aa7959',body:'#bc906c',leg:'#99704f',accent:'#d8ae84',h:[21,20],a:[27,23],feet:3.7,eye:'recluse',mark:'recluse',pose:'long'},
  grass:{hab:'grass',head:'#746e53',body:'#8c805c',leg:'#7d7051',accent:'#e0c9a0',h:[21,19],a:[33,22],feet:4,eye:'small',mark:'grass',pose:'runner'},
  trapdoor:{hab:'burrow',head:'#483b35',body:'#665148',leg:'#53443b',accent:'#ae917b',h:[27,25],a:[32,27],feet:8,eye:'tiny',fuzz:2,mark:'plain',pose:'heavy'}
});
export const FIELD_GUIDE_SPECIES=Object.freeze(Object.keys(TYPE));
export function spiderFigureSize(kind){
  const { h, a, feet }=TYPE[kind]||TYPE.jumping;
  const left=137-h[0]-3, right=182+a[0]+2;
  return {
    left,
    width:right-left,
    height:4+2*Math.max(h[1],a[1]),
    legWidth:feet
  };
}
// All values are generated internally. No unsafe user strings are interpolated.
const n=(name,attrs={},inside='')=>'<'+name+Object.entries(attrs).map(([k,v])=>' '+k+'="'+v+'"').join('')+'>'+inside+'</'+name+'>';
const xy=(num)=>Number(num.toFixed(1));
const line=(x1,y1,x2,y2,stroke,w,opacity=1)=>n('path',{d:'M'+xy(x1)+' '+xy(y1)+' L'+xy(x2)+' '+xy(y2),fill:'none',stroke,'stroke-width':w,opacity,'stroke-linecap':'round'});
const ellipse=(cx,cy,rx,ry,fill,extra={})=>n('ellipse',{cx:xy(cx),cy:xy(cy),rx:xy(rx),ry:xy(ry),fill,...extra});
const path=(d,fill,extra={})=>n('path',{d,fill,...extra});
const blend=(a,b,f)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-f)+parseInt(b.slice(i,i+2),16)*f).toString(16).padStart(2,'0')).join('');
const leaf=(x,y,angle=0,scale=1,color='#689c70')=>n('g',{transform:'translate('+x+' '+y+') rotate('+angle+') scale('+scale+')'},
  path('M-39 4 Q-13 -26 43 -6 Q18 27 -39 4 Z',color,{stroke:blend(color,'#36583a',.4),'stroke-width':2})+
  path('M-32 5 Q1 0 37 -5', 'none',{stroke:'#b0cf92','stroke-width':2})+
  [-20,-2,16].map(d=>line(d,2,d+10,-9,'#b0cf92',1.2,.65)).join(''));
function field(spec){
  const layers=[];
  layers.push(n('rect',{x:2,y:2,width:316,height:196,rx:22,fill:'#edf3ee',stroke:'#b7c8c5','stroke-width':3}));
  layers.push(ellipse(257,39,45,34,'#ffffff',{opacity:.28}));
  layers.push(ellipse(60,42,41,28,'#cddedf',{opacity:.3}));
  switch(spec.hab){
    case 'leaf':
      layers.push(path('M10 181 Q94 158 307 179 L307 196 H10Z','#adc9a1'));
      layers.push(path('M10 158 Q76 127 110 175 M226 174 Q248 125 307 137','none',{stroke:'#698a5c','stroke-width':6,'stroke-linecap':'round'}));
      layers.push(leaf(149,101,-14,1.72,'#72ad7c'),leaf(42,158,-45,.62,'#a2c57e'),leaf(260,161,42,.78,'#83af6e'));
      break;
    case 'orb':{
      layers.push(path('M4 188 Q107 165 317 182 V198 H4Z','#9bc5a1'));
      layers.push(line(32,8,75,80,'#6b775e',7),line(290,4,246,83,'#6b775e',7));
      const cx=165,cy=108;
      for(const radius of [20,35,51,69,86]){
        layers.push(ellipse(cx,cy,radius,radius*.77,'none',{stroke:'#91aab3','stroke-width':radius===86?2:1.45,opacity:.74}));
      }
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6;
        layers.push(line(cx,cy,cx+Math.cos(a)*86,cy+Math.sin(a)*67,'#9dafb2',1.4,.75));
      }
      layers.push(leaf(35,161,-11,.5),leaf(276,153,32,.65));
      break;}
    case 'litter':
      layers.push(path('M3 137 Q89 127 175 147 T317 137 V197 H3Z','#ae9e79'));
      for(const [x,y,a,c] of [[46,159,-32,'#b38b55'],[248,154,18,'#90764e'],[93,179,40,'#a6b26b'],[286,186,-55,'#d8b178']])
        layers.push(leaf(x,y,a,.55,c));
      layers.push(line(24,141,88,176,'#80694d',4),line(229,151,301,168,'#6b5942',4));
      break;
    case 'corner':
      layers.push(path('M6 20 H315 V183 H6Z','#e7d9c5'));
      layers.push(path('M6 92 L173 149 L315 69','none',{stroke:'#b8aa98','stroke-width':4}));
      layers.push(path('M173 149 V196 M6 92 L173 149','none',{stroke:'#b4a48e','stroke-width':3}));
      for(let i=1;i<6;i++){
        layers.push(path('M225 8 Q'+(295-i*12)+' '+(65+i*5)+' 316 '+(85+i*9),'none',{stroke:'#a5aaa2','stroke-width':1.2,opacity:.55}));
      }
      break;
    case 'flower':
      layers.push(path('M160 111 Q184 144 176 195','none',{stroke:'#548959','stroke-width':11}));
      layers.push(leaf(206,171,26,.65),leaf(119,181,-25,.6,'#7eae6c'));
      for(let i=0;i<8;i++){
        const a=i*45;
        layers.push(n('ellipse',{cx:184,cy:65,rx:25,ry:46,fill:i%2?'#f5dfb0':'#f4e7bd',stroke:'#d6be88','stroke-width':1.4,transform:'rotate('+a+' 184 112)'}));
      }
      layers.push(ellipse(184,112,28,28,'#dfad54'),ellipse(184,112,19,19,'#9b773a',{opacity:.7}));
      for(let i=0;i<9;i++){
        const a=i*2.4;
        layers.push(ellipse(184+Math.cos(a)*17,112+Math.sin(a)*15,2.2,2.2,'#f5dc9c'));
      }
      break;
    case 'burrow':
      layers.push(path('M5 109 Q82 94 161 114 T317 108 V197 H5Z','#bfa480'));
      layers.push(path('M5 132 Q86 121 151 137 T317 126 V197 H5Z','#a58a67'));
      layers.push(ellipse(191,146,62,22,'#776148',{opacity:.65}));
      layers.push(ellipse(191,153,48,20,'#3c3431'),ellipse(191,148,55,19,'none',{stroke:'#cfb18a','stroke-width':7}));
      for(const [x,y,r] of [[34,156,11],[57,172,6],[281,153,12],[296,179,7]]){
        layers.push(ellipse(x,y,r,r*.55,'#cbbba0'),ellipse(x-2,y-2,r*.5,r*.2,'#e8d0aa',{opacity:.6}));
      }
      break;
    case 'wood':
      layers.push(path('M5 119 L318 119 V197 H5Z','#896b54'));
      layers.push(path('M5 118 H317 V148 H5Z','#9c795b',{stroke:'#6a5040','stroke-width':4}));
      layers.push(path('M5 153 H317 V185 H5Z','#a98660',{stroke:'#6a5040','stroke-width':4}));
      for(let i=0;i<8;i++){
        layers.push(path('M'+(16+i*39)+' 126 q18 -4 32 0','none',{stroke:'#c49a73','stroke-width':2,opacity:.65}));
      }
      layers.push(ellipse(272,139,5,5,'#715646'),ellipse(24,174,5,5,'#715646'));
      for(let i=0;i<6;i++)layers.push(line(32+i*12,45,54+i*11,99,'#c4c7be',1.15,.55));
      break;
    case 'storeroom':
      layers.push(path('M4 9 H317 V197 H4Z','#e2d4c4'));
      layers.push(path('M34 63 H302 V190 H34Z','#c7af92',{stroke:'#8c7561','stroke-width':4}));
      layers.push(path('M34 112 H303 M158 62 V189','none',{stroke:'#a08770','stroke-width':4}));
      layers.push(path('M49 72 H136 M174 74 H276 M51 128 H128','none',{stroke:'#dfc5a7','stroke-width':3}));
      break;
    case 'grass':
      layers.push(path('M4 144 Q117 125 317 147 V197 H4Z','#9fb88e'));
      for(let i=0;i<19;i++){
        const x=12+i*17;
        layers.push(path('M'+x+' 178 Q'+(x-9)+' '+(125-i%5*8)+' '+(x+4)+' '+(105+i%4*5),'none',
          {stroke:i%3===0?'#648b60':'#73a269','stroke-width':i%4===0?5:3.6,'stroke-linecap':'round'}));
      }
      layers.push(path('M42 155 Q118 112 195 154 T304 150','none',{stroke:'#dce7dd','stroke-width':2,opacity:.9}));
      for(let i=0;i<7;i++)layers.push(line(100+i*18,140,164,160,'#dce7dd',1,.7));
      break;
  }
  return n('g',{'data-habitat':spec.hab},layers.join(''));
}
function eyeGroup(spec){
  const eye=(x,y,r,reflection=true)=>ellipse(x,y,r,r,'#171b20',{stroke:'#e1d5c1','stroke-width':.55})+
    (reflection?ellipse(x-r*.24,y-r*.27,Math.max(.7,r*.28),Math.max(.7,r*.28),'#edf8fa',{opacity:.95}):'');
  let pairs=[];
  if(spec.eye==='jumper')pairs=[[112,100,6.5],[112,112,6.5],[127,92,2.5],[127,120,2.5],[137,94,1.9],[137,117,1.9],[119,88,2],[119,124,2]];
  else if(spec.eye==='wolf')pairs=[[109,103,3.7],[115,113,3.7],[122,96,4.3],[126,118,4.3],[133,99,1.7],[133,114,1.7],[115,93,1.9],[115,122,1.9]];
  else if(spec.eye==='recluse')pairs=[[112,99,2.4],[112,118,2.4],[123,94,2.4],[123,123,2.4],[133,101,2.4],[133,116,2.4]];
  else if(spec.eye==='tiny')pairs=[[118,103,1.4],[118,112,1.4],[124,99,1.3],[124,116,1.3],[131,102,1.3],[131,113,1.3]];
  else pairs=[[115,102,2.2],[115,114,2.2],[124,98,1.5],[124,118,1.5],[131,102,1.3],[131,114,1.3]];
  const [hX,hY]=spec.h;
  return n('g',{'data-eyes':spec.eye},pairs.map(([x,y,r])=>
    eye(137+(x-137)*hX/29,108+(y-108)*hY/26,r*Math.sqrt(hX*hY/(29*26)))).join(''));
}
function restKnee([ax,ay],[kx,ky],[tx,ty],side){
  const reach=Math.hypot(tx-ax,ty-ay);
  const nx=(ay-ty)/reach, ny=(tx-ax)/reach;
  const bend=(kx-ax)*nx+(ky-ay)*ny;
  // Give nearly straight legs room to extend during a step.
  const shift=(Math.sign(bend)||side)*Math.max(0,reach*.21-Math.abs(bend));
  return [xy(kx+nx*shift),xy(ky+ny*shift)];
}
export function spiderLegLayout(kind){
  const spec=TYPE[kind]||TYPE.jumping;
  const compact=spec.pose==='compact',sideways=spec.pose==='sideways',long=spec.pose==='long';
  const kneeX=[77,91,186,229],tipX=[32,61,213,281];
  const kneeY=[54,31,40,66],tipY=[31,17,22,45];
  return Array.from({length:8},(_,index)=>{
    const i=index%4, side=index<4?-1:1;
    const shift=sideways?(i<2?-17:18):0;
    const shorten=compact?.78:1, expansion=long?1.1:1;
    const anchor=[xy(137+spec.h[0]*[-.63,-.28,.16,.6][i]),xy(108+side*spec.h[1]*[.48,.67,.7,.5][i])];
    const knee=[153+(kneeX[i]-153)*shorten*expansion+shift,108+side*(108-kneeY[i])*shorten];
    const tip=[xy(Math.max(15,Math.min(302,153+(tipX[i]-153)*shorten*expansion+shift))),xy(Math.max(18,Math.min(181,108+side*(108-tipY[i])*shorten)))];
    return {number:index+1,side,pair:i,anchor,knee:restKnee(anchor,knee,tip,side),tip};
  });
}
function legs(kind,spec){
  const w=spec.feet;
  const stroke=blend(spec.leg,'#151b21',.45);
  const contour=(curve,color,width)=>path(curve,'none',{
    stroke:color,'stroke-width':width,'stroke-linejoin':'round','stroke-linecap':'round'});
  const output=spiderLegLayout(kind).map(({number,side,pair,anchor,knee,tip})=>{
    const [ax,ay]=anchor,[kx,ky]=knee,[tx,ty]=tip;
    const upper='M'+ax+' '+ay+' Q'+xy((ax+kx)/2)+' '+xy((ay+ky)/2-8*side)+' '+kx+' '+ky;
    const lower='M'+kx+' '+ky+' Q'+xy((kx+tx)/2)+' '+xy((ky+ty)/2+2*side)+' '+tx+' '+ty;
    const hairs=[];
    if(spec.fuzz){
      for(let q=1;q<=spec.fuzz+1;q++){
        const t=q/(spec.fuzz+2),hx=ax*(1-t)+kx*t,hy=ay*(1-t)+ky*t;
        hairs.push(line(hx,hy,hx+(pair%2?-5:5),hy+side*(3+spec.fuzz),spec.accent,.9,.55));
      }
    }
    const lowerPart=n('g',{'data-leg-part':'lower'},contour(lower,stroke,w+1.8)+contour(lower,spec.leg,w));
    const upperPart=n('g',{'data-leg-part':'upper'},contour(upper,stroke,w+1.8)+contour(upper,spec.leg,w)+
      ellipse(kx,ky,w*.57,w*.57,blend(spec.leg,'#efddba',.23))+
      line(ax,ay,kx,ky,spec.accent,Math.max(.5,w*.2),.3)+hairs.join(''));
    return n('g',{'data-leg':number},lowerPart+upperPart);
  });
  return n('g',{'data-legs':'eight-articulated'},output.join(''));
}
function markings(kind,spec){
  const accent=spec.accent,marks=[];
  const a=(x,y,rx,ry,fill,opacity=1)=>ellipse(x,y,rx,ry,fill,{opacity});
  if(kind==='jumping'){
    marks.push(a(185,98,15,7,accent,.75),a(189,116,10,6,accent,.55));
    marks.push(path('M152 91 Q148 85 144 81 M152 123 Q148 129 144 132','none',{stroke:accent,'stroke-width':2,opacity:.7}));
  }else if(kind==='orb'){
    marks.push(path('M173 88 Q187 80 198 91 L207 106 L198 125 L180 133 L170 118 Z','none',
      {stroke:accent,'stroke-width':3,'stroke-linecap':'round',opacity:.85}));
    for(let i=0;i<7;i++)marks.push(a(175+(i%3)*12,93+Math.floor(i/3)*12,3,4,accent,.5));
  }else if(kind==='wolf'||kind==='grass'){
    marks.push(path('M166 99 Q181 93 197 99 L209 105 M167 117 Q188 122 202 118','none',
      {stroke:accent,'stroke-width':kind==='wolf'?7:5,opacity:.72,'stroke-linecap':'round'}));
    marks.push(path('M130 92 L141 123','none',{stroke:accent,'stroke-width':4,opacity:.4}));
  }else if(kind==='crab'){
    marks.push(path('M166 94 Q180 84 199 96 M166 119 Q185 130 201 114','none',
      {stroke:'#c4a04c','stroke-width':5,'stroke-linecap':'round',opacity:.8}));
  }else if(kind==='tarantula'||kind==='trapdoor'){
    for(let i=0;i<6;i++)marks.push(path('M'+(162+i*6)+' 87 Q'+(165+i*6)+' 103 '+(163+i*5)+' 129','none',
      {stroke:accent,'stroke-width':1.7,opacity:.38}));
  }else if(kind==='widow'){
    // The familiar red hourglass is usually VENTRAL and not shown as an
    // authoritative dorsal field mark. Some widows also have dorsal markings.
    marks.push(a(184,89,4.2,2.2,'#c76159',.7));
    marks.push(a(195,97,2.5,1.5,'#c76159',.55));
  }else if(kind==='recluse'){
    // A subtle violin suggestion is not sufficient for identification.
    marks.push(path('M127 95 Q143 92 145 104 Q142 111 138 119 L137 123','none',
      {stroke:'#745139','stroke-width':3,opacity:.55,'stroke-linecap':'round'}));
  }
  return n('g',{'data-markings':kind},marks.join(''));
}
function spider(kind,spec){
  const [headX,headY]=spec.h,[aX,aY]=spec.a,head=spec.head,body=spec.body;
  const id='field-'+kind;
  const defs=n('defs',{},
    n('radialGradient',{id:id+'-head',cx:'30%',cy:'25%',r:'85%'},
      n('stop',{offset:'0%', 'stop-color':blend(head,'#ffffff',.28)})+
      n('stop',{offset:'58%','stop-color':head})+
      n('stop',{offset:'100%','stop-color':blend(head,'#0b1217',.48)}))+
    n('radialGradient',{id:id+'-abdomen',cx:'30%',cy:'20%',r:'82%'},
      n('stop',{offset:'0%', 'stop-color':blend(body,'#ffffff',.27)})+
      n('stop',{offset:'57%', 'stop-color':body})+
      n('stop',{offset:'100%','stop-color':blend(body,'#11151c',.49)})));
  const shadow=ellipse(168,147,77,13,'#1b2b2c',{opacity:.16,'data-spider-shadow':''});
  const petiole=path('M149 104 L165 104 L165 115 L149 116 Z',blend(head,body,.5));
  const bodyShapes=
    ellipse(182,108,aX,aY,'url(#'+id+'-abdomen)',{stroke:blend(body,'#25221e',.54),'stroke-width':1.8})+
    ellipse(137,108,headX,headY,'url(#'+id+'-head)',{stroke:blend(head,'#25221e',.54),'stroke-width':1.7});
  const sheen=ellipse(172,98,aX*.43,aY*.32,'#ffffff',{opacity:kind==='widow'?.23:.07});
  const hairs=[];
  if(spec.fuzz){
    for(let k=0;k<32;k++){
      const ang=k*2.4,xx=182+Math.cos(ang)*(aX+1),yy=108+Math.sin(ang)*(aY+1);
      hairs.push(line(xx,yy,xx+Math.cos(ang)*spec.fuzz*1.8,yy+Math.sin(ang)*spec.fuzz*1.5,spec.accent,.85,.64));
    }
    for(let k=0;k<20;k++){
      const ang=k*2.7,xx=137+Math.cos(ang)*(headX+1),yy=108+Math.sin(ang)*(headY+1);
      hairs.push(line(xx,yy,xx+Math.cos(ang)*spec.fuzz*1.5,yy+Math.sin(ang)*spec.fuzz*1.4,spec.accent,.8,.49));
    }
  }
  const torso=n('g',{'data-spider-body':''},petiole+bodyShapes+sheen+
    markings(kind,spec)+eyeGroup(spec)+hairs.join(''));
  return defs+n('g',{'data-anatomy':'cephalothorax-abdomen'},shadow+legs(kind,spec)+torso);
}
export function spiderPicture(kind){
  const spec=TYPE[kind]||TYPE.jumping;
  const key=TYPE[kind]?kind:'jumping';
  return n('svg',{xmlns:'http://www.w3.org/2000/svg',viewBox:'0 0 320 200',focusable:'false',
    'aria-hidden':'true','data-species':key,'data-art-version':'field-guide-2'},
    field(spec)+spider(key,spec));
}
