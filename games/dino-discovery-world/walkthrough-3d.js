import { PERIODS, nearestSite } from "./trail-data.js";

// A dependency-free 3D *walk-through* renderer, not a flat panoramic image.
// Geometry is in three-dimensional world coordinates; moving the camera
// changes apparent position, size, perspective and occlusion of the exhibits.
// It paints only on user input: no animation loop, telemetry or WebGL download.
const TAU=Math.PI*2;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const NEAR=.38;
const palette=(hex,light)=>{
  const n=Number.parseInt(hex.slice(1),16);
  return "rgb("+[n>>16,(n>>8)&255,n&255].map(c=>Math.round(clamp(c*light,0,255))).join(",")+")";
};

export function createWalkthrough(canvas,onTravel=()=>{}){
  const ctx=canvas.getContext("2d",{alpha:false});
  const W=canvas.width,H=canvas.height,F=680;
  const camera={x:0,z:0,heading:0};
  let period=PERIODS[0],triangles=[],paused=false;

  const worldToView=point=>{
    const dx=point[0]-camera.x,dz=point[2]-camera.z;
    const si=Math.sin(camera.heading),co=Math.cos(camera.heading);
    return [dx*co-dz*si,point[1]-1.85,dx*si+dz*co];
  };
  const interpolate=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  function clipNear(points) {
    const out=[];
    for(let i=0;i<points.length;i++){
      const a=points[i],b=points[(i+1)%points.length];
      const insideA=a[2]>=NEAR,insideB=b[2]>=NEAR;
      if(insideA)out.push(a);
      if(insideA!==insideB)out.push(interpolate(a,b,(NEAR-a[2])/(b[2]-a[2])));
    }
    return out;
  }
  function face(points,color){
    const view=clipNear(points.map(worldToView));
    if(view.length<3)return;
    const depth=view.reduce((sum,p)=>sum+p[2],0)/view.length;
    const u=view[1].map((v,i)=>v-view[0][i]);
    const v=view[2].map((n,i)=>n-view[0][i]);
    const ny=u[2]*v[0]-u[0]*v[2],nx=u[1]*v[2]-u[2]*v[1],nz=u[0]*v[1]-u[1]*v[0];
    const normal=Math.hypot(nx,ny,nz)||1;
    const lighting=clamp(.88+(ny*.52+nx*.3+nz*.15)/normal*.23,.63,1.13);
    const projected=view.map(p=>[W/2+p[0]*F/p[2],H*.51-p[1]*F/p[2]]);
    triangles.push({projected,color:palette(color,lighting),depth});
  }
  function egg(x,y,z,rx,ry,rz,color,lat=6,lon=9){
    const p=(a,t)=>[x+rx*Math.cos(a)*Math.cos(t),y+ry*Math.sin(a),z+rz*Math.cos(a)*Math.sin(t)];
    for(let i=0;i<lat;i++){
      const a=-Math.PI/2+i*Math.PI/lat,b=a+Math.PI/lat;
      for(let j=0;j<lon;j++){
        const c=j*TAU/lon,d=(j+1)*TAU/lon;
        face([p(a,c),p(b,c),p(b,d),p(a,d)],color);
      }
    }
  }
  function tube(a,b,r,color,sides=7){
    const d=b.map((n,i)=>n-a[i]),m=Math.hypot(...d)||1,n=d.map(v=>v/m);
    const cross=(x,y)=>[x[1]*y[2]-x[2]*y[1],x[2]*y[0]-x[0]*y[2],x[0]*y[1]-x[1]*y[0]];
    let u=cross(n,Math.abs(n[1])>.8?[1,0,0]:[0,1,0]);
    const ul=Math.hypot(...u)||1;u=u.map(t=>t/ul);
    const v=cross(n,u);
    const pt=(p,t)=>p.map((value,i)=>value+r*(Math.cos(t)*u[i]+Math.sin(t)*v[i]));
    for(let i=0;i<sides;i++){
      const a0=i*TAU/sides,a1=(i+1)*TAU/sides;
      face([pt(a,a0),pt(b,a0),pt(b,a1),pt(a,a1)],color);
    }
  }
  function cone(x,y,z,rx,h,color,sides=9){
    for(let i=0;i<sides;i++){
      const a=i*TAU/sides,b=(i+1)*TAU/sides;
      face([[x+rx*Math.cos(a),y,z+rx*Math.sin(a)],[x,y+h,z],[x+rx*Math.cos(b),y,z+rx*Math.sin(b)]],color);
    }
  }
  function boulder(x,z,s=1){egg(x,.28*s,z,.6*s,.3*s,.45*s,"#8d9c9a",4,7);}
  function conifer(x,z,scale=1) {
    tube([x,0,z],[x,2.3*scale,z],.11*scale,"#795c40",6);
    cone(x,.75*scale,z,.86*scale,2.5*scale,"#4c906f",7);
    cone(x,1.5*scale,z,.65*scale,1.9*scale,"#68ac79",7);
  }
  function fern(x,z,s=1){
    tube([x,0,z],[x,.75*s,z],.04*s,"#597c46",5);
    for(let i=0;i<6;i++){
      const angle=i*TAU/6;
      tube([x,.60*s,z],[x+Math.cos(angle)*.72*s,.36*s,z+Math.sin(angle)*.72*s],.06*s,"#5fa36d",5);
    }
  }
  function animal(x,z,kind){
    const tall=kind==="sauropod"||kind==="prosauropod";
    const carnivore=["small-theropod","large-theropod","trex"].includes(kind);
    const bodyColor=kind==="trex"?"#ba7863":kind==="large-theropod"?"#9c8b68":kind==="plates"?"#b5a878":kind==="horns"?"#6aa98a":kind==="prosauropod"?"#8aaf86":"#79a6b0";
    const size=kind==="small-theropod"?.67:kind==="sauropod"?1.25:1;
    const o=(dx,dy,dz)=>[x+dx*size,dy*size,z+dz*size];
    const limb=(a,b,r)=>tube(o(...a),o(...b),r*size,bodyColor,7);
    if(kind==="forest"){
      for(let i=0;i<5;i++)conifer(x+(i%3-1)*1.05,z+(Math.floor(i/3)-.5)*1.2,.76+i*.08);
      return;
    }
    if(kind==="fossil"){
      egg(x,.33,z,1.1,.36,.9,"#a8896b",5,9);
      tube([x-.85,.7,z],[x+.8,.7,z],.12,"#ead7ab");
      for(let i=0;i<4;i++){
        let xi=x-.6+i*.4;
        tube([xi,.7,z],[xi+.13,.78,z+(.3+i*.08)],.07,"#f9e8c2");
      }
      return;
    }
    // Four-legged herbivores versus two-legged theropods.
    if(carnivore){
      for(const side of [-1,1])limb([-.35,1.1,side*.38],[-.4,.12,side*.4],.18);
    } else {
      for(const forward of [-.8,.8])for(const side of [-1,1])
        limb([forward,1.14,side*.37],[forward,.12,side*.4],.18);
    }
    egg(x,1.32*size,z,1.2*size,.55*size,.56*size,bodyColor);
    limb([-1,1.32,0],[-2.05,1.22,0],.20);
    if(tall){
      limb([.75,1.5,0],[1.25,3.15,0],.23);
      egg(x+1.35*size,3.2*size,z,.45*size,.22*size,.29*size,"#9ac9a5");
    }else{
      limb([.75,1.5,0],[1.23,1.8,0],.30);
      egg(x+1.42*size,1.85*size,z,.51*size,.32*size,.4*size,bodyColor);
    }
    if(kind==="horns"){
      for(const side of [-1,1])tube(o(1.55,2.04,side*.25),o(1.83,2.78,side*.3),.12,"#fff0bf");
      tube(o(1.9,1.76,0),o(2.24,1.95,0),.09,"#fff0bf");
    }
    if(kind==="plates"){
      for(let i=0;i<5;i++){
        const a=-.8+i*.4;
        face([o(a-.2,1.8,0),o(a,2.65+(i%2)*.25,0),o(a+.22,1.8,0)],"#e2a468");
      }
    }
    if(carnivore){
      for(const side of [-1,1])limb([.85,1.55,side*.27],[1.35,1.18,side*.27],.09);
      if(kind==="small-theropod")for(let i=0;i<3;i++)cone(x-i*.3,1.55*size,z,.19,.32,"#c0d3a5",5);
    }
    egg(x+1.5*size,(tall?3.22:1.9)*size,z-.32*size,.065,.065,.065,"#29302d",4,5);
  }
  function buildWorld(){
    // Flat shaded terrain tiles in actual world space: the horizon recedes as the viewer walks.
    for(let xx=-12;xx<13;xx+=2.5)for(let zz=-6;zz<27;zz+=2.5){
      const d=(Math.round(xx*3+zz*7)%5===0),c=d?"#9bbf84":period.ground;
      face([[xx,0,zz],[xx+2.5,0,zz],[xx+2.5,0,zz+2.5],[xx,0,zz+2.5]],c);
    }
    for(let i=0;i<29;i++){
      const x=((i*53)%23-11)*.85,z=((i*37)%26-3)*.9;
      if(Math.abs(x)<1.1 && z<3)continue;
      if(period.id==="triassic"){i%4===0?boulder(x,z,.7):conifer(x,z,.6+(i%5)*.12);}
      else if(period.id==="jurassic"){i%4===0?conifer(x,z,.65):fern(x,z,.8+(i%4)*.18);}
      else {i%5===0?boulder(x,z,.75):i%3===0?conifer(x,z,.7):fern(x,z,.65);}
    }
    for(const item of period.sites){
      egg(item.x,.13,item.z,1.65,.15,1.65,"#c7a674",5,9);
      tube([item.x+1.52,.15,item.z],[item.x+1.52,2.5,item.z],.08,"#d6e4b5",6);
      face([[item.x+1.52,2.45,item.z],[item.x+2.4,2.18,item.z],[item.x+1.52,1.89,item.z]],"#ffd77b");
      animal(item.x,item.z,item.kind);
    }
  }
  function render(){
    const sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,period.sky);
    sky.addColorStop(.75,"#e4f1c8");
    sky.addColorStop(1,"#d1dfac");
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    ctx.fillStyle=period.hills;
    ctx.beginPath();ctx.moveTo(0,H*.60);
    for(let x=0;x<=W;x+=60){ctx.lineTo(x,H*(.54+.055*Math.sin(x*.011+period.sites.length)));}ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
    triangles=[];buildWorld();
    triangles.sort((a,b)=>b.depth-a.depth);
    for(const tile of triangles){
      ctx.beginPath();
      tile.projected.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
      ctx.closePath();ctx.fillStyle=tile.color;ctx.fill();
    }
    // Visible sign labels are projected; the accompanying station list remains accessible.
    ctx.font="bold 18px system-ui,sans-serif";ctx.textAlign="center";
    for(const station of period.sites){
      const point=worldToView([station.x,3.3,station.z]);
      if(point[2]<.7 || point[2]>24)continue;
      const x=W/2+point[0]*F/point[2], y=H*.51-point[1]*F/point[2];
      if(x<-160||x>W+160)continue;
      const name=station.name,boxW=Math.min(270,ctx.measureText(name).width+28);
      ctx.fillStyle="#153b38e6";ctx.fillRect(x-boxW/2,y-22,boxW,30);
      ctx.fillStyle="#ffffff";ctx.fillText(name,x,y);
    }
    const horizonName=period.label+" expedition";
    ctx.textAlign="left";ctx.font="bold 18px system-ui,sans-serif";ctx.fillStyle="#123a39";
    ctx.fillText(horizonName,20,32);
    ctx.font="15px system-ui,sans-serif";
    ctx.fillText("WALK  •  TURN  •  EXPLORE THE SIGNS",20,H-20);
  }
  function notify(){render();onTravel(getState());}
  function getState(){return {period:period.id,x:camera.x,z:camera.z,heading:camera.heading};}
  function setState(input) {
    period=PERIODS.find(p=>p.id===input?.period)||PERIODS[0];
    camera.x=clamp(Number.isFinite(input?.x)?input.x:0,-7.5,7.5);
    camera.z=clamp(Number.isFinite(input?.z)?input.z:0,-1.5,18);
    camera.heading=Number.isFinite(input?.heading)?input.heading:0;
    notify();
  }
  function switchPeriod(id){
    const next=PERIODS.find(p=>p.id===id);
    if(!next)return;
    period=next;camera.x=0;camera.z=0;camera.heading=0;notify();
  }
  function step(action){
    const speed=.85, si=Math.sin(camera.heading), co=Math.cos(camera.heading);
    switch(action){
      case "forward":camera.x+=si*speed;camera.z+=co*speed;break;
      case "back":camera.x-=si*speed;camera.z-=co*speed;break;
      case "left":camera.heading-=.23;break;
      case "right":camera.heading+=.23;break;
      case "side-left":camera.x-=co*speed;camera.z+=si*speed;break;
      case "side-right":camera.x+=co*speed;camera.z-=si*speed;break;
      default:return;
    }
    camera.x=clamp(camera.x,-7.5,7.5);
    camera.z=clamp(camera.z,-1.5,18);
    notify();
  }
  function travelTo(stationId){
    const s=period.sites.find(s=>s.id===stationId);
    if(!s)return false;
    camera.x=clamp(s.x,-7.5,7.5);
    camera.z=clamp(s.z-1.9,-1.5,18);
    camera.heading=0;
    notify();
    return true;
  }
  function nearest(){return nearestSite(period.id,camera.x,camera.z);}
  function onKeydown(e){
    if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;
    const actions={w:"forward",ArrowUp:"forward",s:"back",ArrowDown:"back",a:"side-left",d:"side-right",ArrowLeft:"left",ArrowRight:"right"};
    const action=actions[e.key]||actions[e.key.toLowerCase()];
    if(action){e.preventDefault();step(action);}
  }
  canvas.addEventListener("keydown",onKeydown);
  // Drag in the scene to look around; tapping a station's accessible button can also travel there.
  let drag=null;
  canvas.addEventListener("pointerdown",e=>{drag={id:e.pointerId,x:e.clientX};canvas.setPointerCapture?.(e.pointerId);});
  canvas.addEventListener("pointermove",e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const delta=e.clientX-drag.x;
    if(Math.abs(delta)<5)return;
    drag.x=e.clientX;
    camera.heading+=delta*.008;
    notify();
  });
  canvas.addEventListener("pointerup",()=>drag=null);
  canvas.addEventListener("pointercancel",()=>drag=null);
  render();
  return {getState,setState,switchPeriod,step,travelTo,nearest,render};
}
