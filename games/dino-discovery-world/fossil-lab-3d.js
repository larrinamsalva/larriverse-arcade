// No external models, libraries or network. Fossils and covering soil are represented
// as simplified 3D polygon meshes with a movable perspective camera.
const TAU=Math.PI*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function shade(hex,k){
 const n=Number.parseInt(hex.slice(1),16);
 return "rgb("+[n>>16,(n>>8)&255,n&255].map(c=>Math.round(clamp(c*k,0,255))).join(",")+")";
}

export function createFossilScene(canvas){
 const ctx=canvas.getContext("2d",{alpha:false}),W=canvas.width,H=canvas.height;
 let specimen="bone",brushed=0,yaw=.4,zoom=1,pointer=null,faces=[];
 function project(p){
   const co=Math.cos(yaw),si=Math.sin(yaw),pitch=.65,cp=Math.cos(pitch),sp=Math.sin(pitch);
   const x=p[0]*co-p[2]*si,z=p[0]*si+p[2]*co;
   const h=p[1]-.2, y=h*cp-z*sp,depth=10.8+h*sp+z*cp;
   const scale=690*zoom/Math.max(.5,depth);
   return [W*.5+x*scale,H*.53-y*scale,depth];
 }
 function face(points,color){
   if(points.length<3)return;
   const a=points[0],b=points[1],c=points[2];
   const u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]);
   const ny=u[2]*v[0]-u[0]*v[2],len=Math.hypot(u[1]*v[2]-u[2]*v[1],ny,u[0]*v[1]-u[1]*v[0])||1;
   const projected=points.map(project);
   faces.push({projected,depth:projected.reduce((s,p)=>s+p[2],0)/projected.length,color:shade(color,clamp(.85+ny/len*.16,.66,1.12))});
 }
 function cuboid(x,y,z,sx,sy,sz,color) {
   const p=[
    [x-sx,y-sy,z-sz],[x+sx,y-sy,z-sz],[x+sx,y-sy,z+sz],[x-sx,y-sy,z+sz],
    [x-sx,y+sy,z-sz],[x+sx,y+sy,z-sz],[x+sx,y+sy,z+sz],[x-sx,y+sy,z+sz]
   ];
   for(const q of [[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]])face(q.map(i=>p[i]),color);
 }
 function egg(x,y,z,rx,ry,rz,color,lat=5,lon=9){
   const v=(a,t)=>[x+rx*Math.cos(a)*Math.cos(t),y+ry*Math.sin(a),z+rz*Math.cos(a)*Math.sin(t)];
   for(let i=0;i<lat;i++)for(let j=0;j<lon;j++){
      const a=-Math.PI/2+i*Math.PI/lat,b=a+Math.PI/lat,c=j*TAU/lon,d=(j+1)*TAU/lon;
      face([v(a,c),v(b,c),v(b,d),v(a,d)],color);
   }
 }
 function tube(a,b,r,color,n=8){
   const delta=b.map((v,i)=>v-a[i]),len=Math.hypot(...delta)||1,axis=delta.map(v=>v/len);
   const cross=(p,q)=>[p[1]*q[2]-p[2]*q[1],p[2]*q[0]-p[0]*q[2],p[0]*q[1]-p[1]*q[0]];
   let u=cross(axis,Math.abs(axis[1])>.85?[1,0,0]:[0,1,0]);const norm=Math.hypot(...u)||1;u=u.map(v=>v/norm);
   const v=cross(axis,u);
   const pt=(o,t)=>o.map((value,k)=>value+r*(u[k]*Math.cos(t)+v[k]*Math.sin(t)));
   for(let j=0;j<n;j++){
     const t=j*TAU/n,nt=(j+1)*TAU/n;
     face([pt(a,t),pt(b,t),pt(b,nt),pt(a,nt)],color);
   }
 }
 function artifact(){
   if(specimen==="bone"){
      tube([-1.25,.67,0],[1.25,.67,0],.25,"#f5dfb2");
      for(const x of [-1.3,1.3])egg(x,.67,0,.48,.4,.43,"#fff0cd",6,10);
   } else if(specimen==="track"){
      // Darker raised relief: a stylized track impression, not a precise footprint cast.
      egg(0,.60,.10,.7,.07,.72,"#685344",5,11);
      for(const x of [-.65,0,.65])egg(x,.62,-.65,.22,.1,.39,"#6e5948",5,9);
   } else {
      egg(0,.65,0,.68,.09,1.38,"#8e9c70",6,12);
      tube([0,.75,-1.23],[0,.76,1.23],.035,"#d5dabb",7);
      for(const side of [-1,1])for(let i=0;i<5;i++){
       const z=-.9+i*.43;
       tube([0,.76,z],[side*(.55-Math.abs(z)*.22),.75,z+.19],.024,"#cfdfad",5);
      }
   }
 }
 function paint(){
   const back=ctx.createLinearGradient(0,0,0,H);
   back.addColorStop(0,"#224d53");back.addColorStop(.6,"#71999b");back.addColorStop(1,"#cae0cf");
   ctx.fillStyle=back;ctx.fillRect(0,0,W,H);
   faces=[];
   cuboid(0,-.03,0,3.05,.35,1.96,"#87745d");
   cuboid(0,.28,0,2.65,.18,1.64,"#c0a584");
   artifact();
   // The loose training soil peels away layer by layer; after 4 brush actions,
   // the raised specimen geometry is unobstructed.
   const coverage=[16,12,8,4,0][clamp(brushed,0,4)];
   for(let i=0;i<coverage;i++){
     const row=Math.floor(i/4),col=i%4;
     const x=-2.1+col*1.4,z=-1.25+row*.83;
     cuboid(x,.79,z,.67,.09,.39,i%3===0?"#9c8062":"#ad916e");
   }
   faces.sort((a,b)=>b.depth-a.depth);
   for(const f of faces){
     ctx.beginPath();
     f.projected.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
     ctx.closePath();ctx.fillStyle=f.color;ctx.fill();
     ctx.strokeStyle="#21383725";ctx.lineWidth=.6;ctx.stroke();
   }
   ctx.textAlign="left";ctx.fillStyle="#ffffff";
   ctx.font="bold 18px system-ui,sans-serif";ctx.fillText("FOSSIL TRAINING TRAY  •  "+brushed+" / 4 LAYERS BRUSHED",18,31);
   ctx.font="15px system-ui,sans-serif";ctx.fillText("DRAG OR A / D TO ROTATE  •  + / − TO ZOOM",18,H-18);
 }
 function setSample(id,progress){specimen=["bone","track","leaf"].includes(id)?id:"bone";brushed=clamp(Number.isInteger(progress)?progress:0,0,4);paint();}
 function rotate(delta){yaw+=delta;paint();}
 function magnify(delta){zoom=clamp(zoom+delta,.75,1.4);paint();}
 canvas.addEventListener("keydown",e=>{
   if(e.key==="a"||e.key==="ArrowLeft"){e.preventDefault();rotate(-.22);}
   if(e.key==="d"||e.key==="ArrowRight"){e.preventDefault();rotate(.22);}
   if(e.key==="+"||e.key==="="){e.preventDefault();magnify(.13);}
   if(e.key==="-"){e.preventDefault();magnify(-.13);}
 });
 canvas.addEventListener("pointerdown",e=>{pointer={id:e.pointerId,x:e.clientX};canvas.setPointerCapture?.(e.pointerId);});
 canvas.addEventListener("pointermove",e=>{
   if(!pointer||e.pointerId!==pointer.id)return;
   const dx=e.clientX-pointer.x;
   if(Math.abs(dx)>2){rotate(dx*.008);pointer.x=e.clientX;}
 });
 canvas.addEventListener("pointerup",()=>pointer=null);
 canvas.addEventListener("pointercancel",()=>pointer=null);
 paint();
 return {setSample,rotate,magnify,getView:()=>({yaw,zoom,specimen,brushed})};
}
