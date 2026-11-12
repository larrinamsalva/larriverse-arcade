// Shared, dependency-free dinosaur meshes for both Dino Discovery views.
// Artist interpretations: most extinct animals' actual colors are unknown.
// Emit polygons to the existing canvas renderers; no downloads, animation loop or WebGL.
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>{
  const v=n=>Number.parseInt(n.slice(1),16),x=v(a),y=v(b),w=clamp(t,0,1);
  const channel=k=>Math.round(((x>>k)&255)*(1-w)+((y>>k)&255)*w);
  return '#'+[channel(16),channel(8),channel(0)].map(n=>n.toString(16).padStart(2,'0')).join('');
};
const skin=(base,back,belly,stripe,head=base)=>Object.freeze({base,back,belly,stripe,head});
export const ORGANIC_PALETTES=Object.freeze({
  trike:skin('#629c68','#376448','#b3c297','#487a50','#8bb97a'),
  rex:skin('#b66d43','#603e2d','#d5a076','#86462f','#cb8556'),
  longneck:skin('#688e8d','#365f71','#b1bba5','#4c7380','#92ada0'),
  stego:skin('#8e9959','#4d6542','#c4b88c','#65764b','#b4aa79'),
  raptor:skin('#9c8553','#4e6244','#cfb686','#7b6344','#b59a64'),
  bird:skin('#b99563','#654e39','#ead3a3','#78624a','#cdb181'),
  coelo:skin('#887b4d','#4c664c','#c6b78b','#655b3d','#af965f'),
  plateosaurus:skin('#7d9863','#486748','#c5bd90','#64794d','#9fb07c'),
  allosaurus:skin('#9a7948','#56553a','#d3b783','#7b5b3b','#af8c57'),
  flyer:skin('#986c56','#775545','#d1ab84','#94694e','#b78562'),
  marine:skin('#4a93a0','#2d6178','#a4c6bc','#327c91','#5aaabd')
});
export const TRAIL_SPECIES=Object.freeze({
  horns:'trike',plates:'stego',trex:'rex',sauropod:'longneck',
  prosauropod:'plateosaurus','large-theropod':'allosaurus',
  'small-theropod':'coelo'
});
const add=(a,b)=>a.map((n,i)=>n+b[i]),sub=(a,b)=>a.map((n,i)=>n-b[i]);
const mul=(a,t)=>a.map(n=>n*t);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>{const len=Math.hypot(...a)||1;return a.map(n=>n/len);};
const catmull=(a,b,c,d,t)=>{
  const t2=t*t,t3=t2*t;
  return a.map((_,i)=>.5*((2*b[i])+(-a[i]+c[i])*t+(2*a[i]-5*b[i]+4*c[i]-d[i])*t2+(-a[i]+3*b[i]-3*c[i]+d[i])*t3));
};

// All species use the same geometry and palettes in the specimen and trail.
// The only difference is the mesh density and the scene-space transform.
export function drawOrganicDinosaur(kind,face,{x=0,y=0,z=0,scale=1,quality='high'}={}){
  const tone=ORGANIC_PALETTES[kind];
  if(!tone)throw new RangeError('Unknown dinosaur model: '+kind);
  const detailed=quality==='high';
  const lat=detailed?14:9,lon=detailed?22:14,sides=detailed?12:8,steps=detailed?5:3;
  const emit=(points,color)=>face(points.map(p=>[x+p[0]*scale,y+p[1]*scale,z+p[2]*scale]),color);
  const surfaceColor=(shade,height,along=0)=>{
    let color=shade.base;
    if(height>.18)color=mix(color,shade.back,Math.min(.7,(height-.18)*.88));
    else if(height<-.23)color=mix(color,shade.belly,Math.min(.8,(-height-.23)*.93));
    // Low-contrast, continuous stripe bands, not square checkerboard spots.
    const band=Math.max(0,(Math.cos(along*5.6)+.28)/1.28);
    return mix(color,shade.stripe,band*.14);
  };
  function oval(cx,cy,cz,rx,ry,rz,shade=tone){
    for(let i=0;i<lat;i++){
      const a=-Math.PI/2+i*Math.PI/lat,b=a+Math.PI/lat;
      for(let j=0;j<lon;j++){
        const c=j*TAU/lon,d=(j+1)*TAU/lon;
        const p=(angle,turn)=>[cx+rx*Math.cos(angle)*Math.cos(turn),cy+ry*Math.sin(angle),cz+rz*Math.cos(angle)*Math.sin(turn)];
        emit([p(a,c),p(b,c),p(b,d),p(a,d)],surfaceColor(shade,Math.sin((a+b)/2),cx+rx*Math.cos((a+b)/2)*Math.cos((c+d)/2)));
      }
    }
  }
  // Curved, tapered tube joins its rings smoothly. Used for neck, tail, horns, legs.
  function curve(nodes,radii,color=tone.base){
    const centers=[],rads=[];
    for(let i=0;i<nodes.length-1;i++){
      for(let k=0;k<steps;k++){
        const t=k/steps;
        centers.push(catmull(nodes[Math.max(0,i-1)],nodes[i],nodes[i+1],nodes[Math.min(nodes.length-1,i+2)],t));
        rads.push(radii[i]*(1-t)+radii[i+1]*t);
      }
    }
    centers.push(nodes.at(-1));rads.push(radii.at(-1));
    const rings=centers.map((p,i)=>{
      const tangent=unit(sub(centers[Math.min(i+1,centers.length-1)],centers[Math.max(0,i-1)]));
      const helper=Math.abs(tangent[2])>.88?[0,1,0]:[0,0,1];
      const u=unit(cross(tangent,helper)),v=cross(tangent,u);
      return Array.from({length:sides},(_,j)=>{
        const a=j*TAU/sides;
        return add(p,add(mul(u,Math.cos(a)*rads[i]),mul(v,Math.sin(a)*rads[i])));
      });
    });
    for(let i=0;i<rings.length-1;i++)for(let j=0;j<sides;j++)
      emit([rings[i][j],rings[i][(j+1)%sides],rings[i+1][(j+1)%sides],rings[i+1][j]],color);
  }
  const bead=(p,rx,ry,rz,c)=>oval(p[0],p[1],p[2],rx,ry,rz,skin(c,c,c,c));
  function leg(px,pz,height,thickness,color,theropod=false){
    // Bent knees, fuller thigh musculature and rounded feet.
    const knee=[px+(theropod?-.23:.10),height*.47,pz];
    curve([[px,height,pz],knee,[px+.17,.15,pz+.03]], [thickness,thickness*.74,thickness*.48],color);
    bead([px+.22,.17,pz+.07],thickness*.92,.16,thickness*.87,mix(color,'#765c48',.35));
  }
  const eye=(hx,hy,hz,r=.08)=>{
    bead([hx,hy,hz],r,r*.93,r*.83,'#222b27');
    bead([hx+.019,hy+.026,hz-.05],r*.28,r*.28,r*.24,'#f6edcf');
  };
  function broadBack(cx,cy,rx,ry,rz){
    oval(cx,cy,0,rx,ry,rz,tone);
    // Soft shoulder/hip transitions keep the silhouette organic.
    oval(cx+.75*rx,cy-.08,0,rx*.48,ry*.89,rz*.89,tone);
  }

  if(kind==='flyer'){
    oval(-.3,3.0,0,.94,.31,.28,tone);
    curve([[.35,3.05,0],[1.45,3.27,0],[2.25,3.35,0]],[.22,.14,.035],tone.head);
    curve([[-.9,2.99,0],[-1.85,3.05,0],[-2.65,3.30,0]],[.17,.09,.02],tone.back);
    for(const sign of [-1,1]){
      // Membrane from arm to long wing finger, with folded, rounded contour.
      const A=[-.1,3.11,0],B=[-.55,3.20,sign*1.2],C=[-1.55,3.55,sign*3.25],D=[-2.10,3.30,sign*2.15];
      emit([A,B,C],tone.belly);emit([A,C,D],tone.stripe);
      curve([A,B,C],[.10,.075,.022],tone.back);
    }
    eye(1.25,3.35,-.21,.065);
    return;
  }
  if(kind==='marine'){
    broadBack(-.25,1.55,2.18,.61,.75);
    curve([[-1.8,1.53,0],[-2.8,1.61,0],[-3.65,1.94,0]],[.49,.31,.07],tone.back);
    for(const sign of [-1,1]){
      curve([[.0,1.28,sign*.45],[.35,.91,sign*1.15],[1.05,.75,sign*1.38]],[.34,.19,.02],tone.base);
    }
    oval(1.56,1.65,0,.70,.32,.40,skin(tone.head,tone.back,tone.belly,tone.stripe));
    eye(1.81,1.82,-.37,.08);
    return;
  }

  const long=kind==='longneck'||kind==='plateosaurus';
  const plated=kind==='stego',horned=kind==='trike';
  const hunter=['rex','raptor','coelo','allosaurus','bird'].includes(kind);
  const giant=kind==='rex'||kind==='allosaurus';
  const little=kind==='coelo'||kind==='bird';
  if(horned||plated||long){
    const bodyY=long?2.12:1.70;
    const bodyRx=long?2.10:2.03;
    broadBack(-.34,bodyY,bodyRx,long?1.07:.84,long?1.02:.87);
    if(kind!=='plateosaurus'){
      for(const px of [-1.49,1.07])for(const sign of [-1,1])
        leg(px,sign*.63,bodyY-.25,long?.32:.32,tone.base);
    }else{
      for(const sign of [-1,1])leg(-.28,sign*.42,1.65,.34,tone.base,true);
    }
    curve([[-1.75,bodyY,0],[-2.70,bodyY-.06,0],[-3.55,bodyY-.28,0],[-4.15,bodyY-.56,0]],
      [.47,.31,.16,.018],tone.back);
    if(long){
      curve([[.90,2.25,0],[1.65,3.43,0],[2.15,4.70,0],[2.52,5.28,0]],
        [.62,.42,.26,.21],tone.base);
      oval(2.69,5.37,0,.52,.29,.36,skin(tone.head,tone.back,tone.belly,tone.stripe));
      eye(2.84,5.48,-.29,.064);
    }else if(horned){
      oval(1.55,2.03,0,.75,.81,.90,skin(tone.head,tone.back,tone.belly,tone.stripe));
      oval(2.17,1.77,0,.73,.47,.59,tone);
      curve([[2.35,2.02,-.42],[2.60,2.47,-.50],[2.89,3.00,-.52]],[.19,.13,.015],'#f0dfb8');
      curve([[2.35,2.02,.42],[2.60,2.47,.50],[2.89,3.00,.52]],[.19,.13,.015],'#f0dfb8');
      curve([[2.75,1.80,0],[3.06,1.98,0]],[.10,.012],'#f0dfb8');
      eye(2.56,1.94,-.52,.075);
    }else{
      curve([[1.22,1.76,0],[1.65,1.73,0],[2.01,1.64,0]],[.47,.31,.18],tone.base);
      oval(2.12,1.60,0,.56,.36,.44,skin(tone.head,tone.back,tone.belly,tone.stripe));
      for(let i=0;i<6;i++){
        const px=-1.64+i*.59,top=2.76+(i%2)*.26;
        // Rounded, fleshy plates instead of cut-out triangles.
        oval(px,top-.20,0,.28,.55+(i%2)*.13,.12,skin('#d9944b','#ab6c3c','#e0aa63','#c08244'));
      }
      for(const sign of [-1,1])
        curve([[-3.40,1.50,sign*.16],[-3.83,1.70,sign*.42],[-4.12,1.91,sign*.64]],[.18,.10,.01],'#edcc91');
      eye(2.36,1.72,-.36,.06);
    }
    return;
  }

  if(hunter){
    const bodyY=giant?2.20:1.89,bodyR=giant?1.70:1.35;
    broadBack(-.60,bodyY,bodyR,giant?.86:.63,giant?.70:.55);
    curve([[-1.63,bodyY,0],[-2.45,bodyY-.10,0],[-3.22,bodyY-.26,0],[-3.95,bodyY-.43,0]],
      [giant?.47:.35,giant?.32:.22,.12,.012],tone.back);
    for(const sign of [-1,1])leg(.15,sign*.41,bodyY-.36,giant?.36:.24,tone.base,true);
    curve([[.43,bodyY+.02,0],[.92,bodyY+.42,0],[1.40,bodyY+.69,0]],
      [giant?.50:.37,.40,.28],tone.base);
    oval(1.59,bodyY+.78,0,giant?.92:.73,giant?.48:.33,giant?.54:.40,
      skin(tone.head,tone.back,tone.belly,tone.stripe));
    oval(1.89,bodyY+.50,0,giant?.79:.54,.16,giant?.49:.34,
      skin(tone.head,tone.back,tone.belly,tone.stripe));
    for(const sign of [-1,1])curve([[.60,bodyY+.32,sign*.31],[.97,bodyY-.06,sign*.39],[1.25,bodyY-.13,sign*.39]],
      [giant?.13:.12,.095,.025],tone.base);
    eye(1.97,bodyY+.93,-(giant?.45:.32),giant?.08:.066);
    if(kind==='raptor'||kind==='bird'){
      // Fine feather-like crests, restrained for good legibility on phones.
      for(let i=0;i<4;i++)curve([[.95+i*.19,bodyY+1.02,-.04],[1.06+i*.19,bodyY+1.23,-.07]],
        [.09,.009],tone.back);
    }
    return;
  }
}
