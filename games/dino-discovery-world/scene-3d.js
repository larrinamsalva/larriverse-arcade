// Dependency-free 3D polygon renderer: real 3D points, perspective, flat lighting and orbit controls.
// No external assets, GPU requirement, timers, analytics, network or animation loop.
const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const tint = (hex, shade) => {
  const raw = hex.replace("#", "");
  const color = Number.parseInt(raw, 16);
  const c = [color >> 16, (color >> 8) & 255, color & 255].map(n => Math.round(clamp(n * shade, 0, 255)));
  return "rgb(" + c.join(",") + ")";
};
export function createScene(canvas) {
  const ctx = canvas.getContext("2d", { alpha:false });
  const W = canvas.width, H = canvas.height;
  let yaw = 0.35, pitch = 0.12, zoom = 1, subject = "trike", fossilProgress = 0;
  let faces = [];
  let pointer = null;

  function project(p) {
    const co = Math.cos(yaw), si = Math.sin(yaw), ce = Math.cos(pitch), se = Math.sin(pitch);
    const sx = p[0] * co - p[2] * si;
    const sz = p[0] * si + p[2] * co;
    const y = p[1] - 1.35;
    const up = y * ce - sz * se;
    const depth = 15 + y * se + sz * ce;
    const scale = zoom * 770 / Math.max(3, depth);
    return [W * .5 + sx * scale, H * .56 - up * scale, depth];
  }
  function normal(a,b,c){
    const u = b.map((n,i)=>n-a[i]), v=c.map((n,i)=>n-a[i]);
    return [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  }
  function polygon(points,color) {
    const coords = points.map(project);
    const n = normal(points[0],points[1],points[2]);
    const len = Math.hypot(...n)||1;
    // Brighter daylight highlights and deeper shadows give the models more shape.
    const light = clamp(.79 + .38 * ((n[0]*-.34+n[1]*.81+n[2]*.47)/len),.48,1.20);
    faces.push({ coords, depth: coords.reduce((s,p)=>s+p[2],0)/coords.length, color:tint(color,light) });
  }
  // Natural tonal bands wrap the existing 3D geometry (artist interpretations).
  function oval(x,y,z,rx,ry,rz,color,lat=7,lon=12,markings=null) {
    for(let i=0;i<lat;i++){
      const a = -Math.PI/2 + i*Math.PI/lat, b=-Math.PI/2+(i+1)*Math.PI/lat;
      for(let j=0;j<lon;j++){
        const c=j*TAU/lon,d=(j+1)*TAU/lon;
        const pt=(v,t)=>[x+Math.cos(v)*Math.cos(t)*rx,y+Math.sin(v)*ry,z+Math.cos(v)*Math.sin(t)*rz];
        let facet=color;
        if(markings){
          if(i<Math.max(1,Math.floor(lat*.25)))facet=markings.belly;
          else if(i>=Math.ceil(lat*.72))facet=markings.back;
          else if(j%5===0&&i>1&&i<lat-1)facet=markings.stripe;
        }
        polygon([pt(a,c),pt(b,c),pt(b,d),pt(a,d)],facet);
      }
    }
  }
  function beam(a,b,r,color,ends=9) {
    const dv=b.map((n,i)=>n-a[i]), mag=Math.hypot(...dv)||1;
    const unit=dv.map(n=>n/mag), reference=Math.abs(unit[1])>.88?[1,0,0]:[0,1,0];
    const cross=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    const u=cross(unit,reference), norm=Math.hypot(...u)||1;u.forEach((n,i)=>u[i]=n/norm);
    const v=cross(unit,u);
    const ring=(center,r,t)=>center.map((n,i)=>n+r*(u[i]*Math.cos(t)+v[i]*Math.sin(t)));
    for(let i=0;i<ends;i++){
      const t=i*TAU/ends, nt=(i+1)*TAU/ends;
      polygon([ring(a,r,t),ring(a,r,nt),ring(b,.04,nt),ring(b,.04,t)],color);
    }
  }
  function flat(x,y,z,rx,rz,color) {
    const n=18, pts=Array.from({length:n},(_,i)=>[x+Math.cos(i*TAU/n)*rx,y,z+Math.sin(i*TAU/n)*rz]);
    for(let i=0;i<n;i++)polygon([[x,y,z],pts[i],pts[(i+1)%n]],color);
  }
  function rock(x,y,z,s=1){oval(x,y,z,.34*s,.20*s,.32*s,"#858da2",4,7);}
  function tree(x,z,s=1){
    beam([x,0,z],[x,2*s,z],.15*s,"#805a42",7);
    oval(x,2.05*s,z,.7*s,.88*s,.7*s,"#4f996e",5,7);
    oval(x-.4*s,1.7*s,z,.38*s,.5*s,.35*s,"#70bc82",4,6);
  }
  function sceneBase(water=false) {
    for(let i=0;i<14;i++){
      let x = ((i*37)%17-8)*.78, z = ((i*19)%13-6)*.65;
      if(Math.abs(x)<3.4 && Math.abs(z)<2.6)continue;
      if(i%3===0)rock(x,.12,z,.8+(i%4)*.12);else if(!water)tree(x,z,.6+(i%4)*.17);
    }
    for(let x=-8;x<8;x+=2) for(let z=-5;z<6;z+=2) {
      polygon([[x,0,z],[x+2,0,z],[x+2,0,z+2],[x,0,z+2]],water?"#2b9bb0":((x+z)%4===0?"#8ebf76":"#9acb84"));
    }
  }
  function shadow(rx=2.4,rz=1.1){flat(0,.02,0,rx,rz,"#547a58");}
  function legs(pairs,color,large=false){
    for(const [x,z] of pairs){
      beam([x,1.28,z],[x+.1,.14,z],large?.37:.27,color,8);
      oval(x+.1,.16,z,.38,.17,.34,"#6d6255",4,7);
    }
  }
  function trike() {
    shadow(); legs([[-1.18,-.72],[-1.18,.72],[1.02,-.72],[1.02,.72]],"#447c59",true);
    oval(-.2,1.75,0,2.12,1.0,1.0,"#629c68",8,15,{back:"#376448",belly:"#b3c297",stripe:"#487a50"});
    beam([-1.6,1.75,0],[-3.4,1.4,0],.4,"#477757");
    oval(1.5,2.1,0,.84,.92,.9,"#8bb97a",8,12,{back:"#477c56",belly:"#bbca97",stripe:"#649466"});
    oval(2.12,1.83,0,.75,.50,.64,"#699a68");
    for(const z of [-.54,.54])beam([2.27,2.15,z],[2.86,3.06,z],.19,"#f1deb1",9);
    beam([2.65,1.63,0],[3.16,1.85,0],.13,"#f1deb1");
    oval(2.61,1.99,-.52,.095,.1,.08,"#202b2c",4,7);
  }
  function rex(){
    shadow(2.5,1); legs([[.5,-.64],[.5,.64]],"#985132",true);
    oval(-.55,2.25,0,1.7,.87,.73,"#b66d43",8,15,{back:"#603e2d",belly:"#d5a076",stripe:"#86462f"});
    beam([-1.55,2.18,0],[-3.9,1.55,0],.50,"#8c5034");
    beam([.4,2.2,0],[1.05,3.0,0],.65,"#985132");
    oval(1.48,3.12,0,.9,.48,.57,"#cb8556",8,12,{back:"#845039",belly:"#e0ad7c",stripe:"#a3623f"});
    oval(1.8,2.84,0,.78,.16,.49,"#a85b3a");
    for(const z of [-.56,.56])beam([.56,2.55,z],[1.12,2.17,z],.13,"#985132",7);
    oval(1.88,3.23,-.48,.08,.08,.06,"#272829",4,7);
  }
  function longneck(){
    shadow(2.9,1.3);legs([[-1.6,-.78],[-1.6,.78],[1.15,-.78],[1.15,.78]],"#547b82",true);
    oval(-.15,2.3,0,2.25,1.18,1.1,"#688e8d",8,15,{back:"#365f71",belly:"#b1bba5",stripe:"#4c7380"});
    beam([-1.88,2.36,0],[-4.4,2.15,0],.43,"#4a737d");
    beam([1.18,2.55,0],[2.35,5.55,0],.49,"#6d9290",11);
    oval(2.46,5.66,0,.56,.30,.42,"#92ada0",7,10);
    oval(2.64,5.75,-.36,.075,.08,.06,"#263644",4,6);
  }
  function stego(){
    shadow();legs([[-1.25,-.62],[-1.25,.62],[1.1,-.62],[1.1,.62]],"#747c4d",true);
    oval(-.3,1.75,0,2.03,.87,.89,"#8e9959",8,15,{back:"#4d6542",belly:"#c4b88c",stripe:"#65764b"});
    oval(1.95,1.68,0,.63,.41,.5,"#b4aa79");
    beam([-1.65,1.73,0],[-3.55,1.53,0],.38,"#6c7849",9);
    for(let i=0;i<6;i++){
      const x=-1.65+i*.59, height=2.7+(i%2)*.5;
      polygon([[x-.34,2.3,-.08],[x,height,-.12],[x+.36,2.3,-.08]],"#df974c");
      polygon([[x+.36,2.3,.1],[x,height,.1],[x-.34,2.3,.1]],"#b66b39");
    }
    for(const z of [-.31,.31])beam([-3.0,1.52,z],[-3.87,2.18,z*1.9],.16,"#f7d18d",8);
  }
  function raptor(){
    shadow(2,1);
    legs([[.22,-.4],[.22,.4]],"#8a6b42");
    oval(-.55,1.9,0,1.25,.59,.5,"#9c8553",8,15,{back:"#4e6244",belly:"#cfb686",stripe:"#7b6344"});
    beam([-1.35,1.92,0],[-3.0,2.1,0],.30,"#6d7548");
    beam([.28,1.9,0],[1.08,2.52,0],.37,"#967149");
    oval(1.24,2.6,0,.68,.28,.37,"#b59a64");
    oval(1.54,2.67,-.33,.065,.07,.06,"#252734",5,7);
    for(const z of [-.45,.45])beam([.2,2.08,z],[.92,1.65,z],.13,"#bf9a66");
  }
  function flyer(){
    shadow(1.2,.6);
    oval(0,3.1,0,.95,.28,.26,"#986c56",6,10);
    beam([.75,3.12,0],[2,3.45,0],.20,"#b78562");
    beam([-1,3.1,0],[-2.4,3.2,0],.15,"#775545");
    for(const sign of [-1,1]){
      polygon([[.2,3.2,0],[.1,3.25,sign*.9],[-.9,3.7,sign*3.25]],"#d1ab84");
      polygon([[-.9,3.7,sign*3.25],[-1.5,3.4,sign*1.5],[.2,3.2,0]],"#94694e");
    }
    beam([2,3.48,0],[2.8,3.6,0],.10,"#e1c89b");
  }
  function marine(){
    shadow(2.4,1);
    oval(0,1.55,0,2.2,.57,.78,"#4a93a0",8,15,{back:"#2d6178",belly:"#a4c6bc",stripe:"#327c91"});
    beam([-1.8,1.55,0],[-3.6,1.8,0],.42,"#34778a");
    for(const z of [-.4,.4])polygon([[-.1,1.5,z],[.0,.75,z*2.5],[.95,1.48,z]],"#377f94");
    polygon([[-3.35,1.8,0],[-4.0,2.65,0],[-4.05,1.0,0]],"#5aaabd");
    oval(1.5,1.75,-.65,.08,.08,.06,"#182d3a",4,6);
  }
  function fossil(){
    shadow(2.5,1.7);
    oval(0,.45,0,3.0,.53,1.85,"#ba936b",7,11);
    if(fossilProgress>0){
      const pieces=Math.ceil(fossilProgress*5);
      beam([-1.8,1.0,0],[1.8,1.02,0],.14,"#efe2c4",9);
      for(let i=0;i<pieces;i++) {
        const x=-1.55+i*.73;
        beam([x,.99,0],[x+ .18,1.24,(i%2===0?1:-1)*.9],.12,"#f5e9cf");
      }
    }
  }
  function bird(){raptor();}
  function impact(){sceneBase(false);rock(-2.1,.17,0,1.5);oval(1.9,4,-.7,.6,.6,.6,"#ffb84e",7,9);}
  function paint(){
    const water=subject==="marine";
    const sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,water?"#17466e":"#7bc7e3");
    sky.addColorStop(.57,water?"#2aa3b9":"#d9eff0");
    sky.addColorStop(1,water?"#b5e1cd":"#c5e0ad");
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    ctx.fillStyle=water?"#277d98":"#aac99b";
    ctx.beginPath();ctx.moveTo(0,H*.66);
    for(let i=0;i<=12;i++){
      const x=i*W/12,y=H*(.52+Math.sin(i*1.35)*.045);
      ctx.lineTo(x,y);
    }ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
    faces=[];
    if(subject!=="impact")sceneBase(water);
    if(subject==="trike")trike();
    else if(subject==="rex")rex();
    else if(subject==="longneck")longneck();
    else if(subject==="stego")stego();
    else if(subject==="raptor")raptor();
    else if(subject==="flyer")flyer();
    else if(subject==="marine")marine();
    else if(subject==="fossil")fossil();
    else if(subject==="bird")bird();
    else if(subject==="impact")impact();
    faces.sort((a,b)=>b.depth-a.depth);
    for(const face of faces){
      ctx.beginPath();face.coords.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
      ctx.closePath();ctx.fillStyle=face.color;ctx.fill();
      ctx.strokeStyle="rgba(19,36,36,.055)";ctx.lineWidth=.75;ctx.stroke();
    }
    ctx.fillStyle="rgba(10,43,62,.73)";
    ctx.font="bold 18px system-ui,sans-serif";
    ctx.fillText("DRAG TO ORBIT  •  A / D TO TURN  •  + / − TO ZOOM",20,H-23);
  }
  function setSubject(s){subject=s;fossilProgress=0;paint();}
  function rotate(delta){yaw+=delta;paint();}
  function tilt(delta){pitch=clamp(pitch+delta,-.35,.55);paint();}
  function changeZoom(delta){zoom=clamp(zoom+delta,.65,1.5);paint();}
  function setFossilProgress(p){fossilProgress=clamp(p,0,1);paint();}
  canvas.addEventListener("pointerdown",e=>{pointer={x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture?.(e.pointerId);});
  canvas.addEventListener("pointermove",e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x;if(Math.abs(dx)>1){yaw+=dx*.010;pointer.x=e.clientX;paint();}});
  const end=()=>{pointer=null;};
  canvas.addEventListener("pointerup",end);canvas.addEventListener("pointercancel",end);
  canvas.addEventListener("keydown",e=>{
    if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a"){e.preventDefault();rotate(-.18);}
    if(e.key==="ArrowRight"||e.key.toLowerCase()==="d"){e.preventDefault();rotate(.18);}
    if(e.key==="+"||e.key==="="){e.preventDefault();changeZoom(.1);}
    if(e.key==="-"){e.preventDefault();changeZoom(-.1);}
    if(e.key==="PageUp"){e.preventDefault();tilt(-.12);}
    if(e.key==="PageDown"){e.preventDefault();tilt(.12);}
  });
  paint();
  return {setSubject,rotate,tilt,changeZoom,setFossilProgress,getView:()=>({yaw,pitch,zoom})};
}
