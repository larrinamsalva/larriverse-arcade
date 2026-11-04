import { PERIODS, SITE_IDS, ALL_SITES } from "./trail-data.js";
import { createWalkthrough } from "./walkthrough-3d.js";

const KEY="larriverse.dinoExplorer.v1";
const $=id=>document.getElementById(id);
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));

function read(){
  const fallback={version:1,position:{period:"triassic",x:0,z:0,heading:0},discovered:[]};
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||"null");
    if(!raw || typeof raw!=="object")return fallback;
    const discovered=Array.isArray(raw.discovered)?[...new Set(raw.discovered.filter(id=>SITE_IDS.includes(id)))]:[];
    const v=raw.position;
    return {
      version:1,
      discovered,
      position:{
        period:PERIODS.some(p=>p.id===v?.period)?v.period:"triassic",
        x:clamp(Number.isFinite(v?.x)?v.x:0,-7.5,7.5),
        z:clamp(Number.isFinite(v?.z)?v.z:0,-1.5,18),
        heading:Number.isFinite(v?.heading)?v.heading:0
      }
    };
  }catch{return fallback;}
}
let save=read();
let activeMessage="Choose a portal and explore a prehistoric landscape. No timer, no penalties.";
function persist(){
  try{localStorage.setItem(KEY,JSON.stringify(save));}
  catch{ $("saveNote").textContent="Local saving is unavailable in this browser. You can continue exploring."; }
}
function say(message){
  activeMessage=message;
  $("expeditionStatus").textContent=message;
}
function renderPortal(periodId){
  document.querySelectorAll("[data-portal]").forEach(b=>{
    const selected=b.dataset.portal===periodId;
    b.classList.toggle("active",selected);
    b.setAttribute("aria-pressed",String(selected));
  });
  const period=PERIODS.find(p=>p.id===periodId)||PERIODS[0];
  $("periodTitle").textContent=period.icon+" "+period.label+" · "+period.landscape;
  $("periodYears").textContent=period.years;
  $("periodNote").textContent=period.note;
  $("worldCanvas").setAttribute("aria-label","Interactive 3D "+period.label+" walk-through. Use W and S to walk forward or backward, A and D to step sideways, and left or right arrows to turn. All locations are also available as text buttons.");
}
function drawMap(position){
  const canvas=$("trailMap"),ctx=canvas.getContext("2d");
  const W=canvas.width,H=canvas.height,margin=22;
  const mapX=x=>margin+(x+8)*(W-2*margin)/16;
  const mapY=z=>H-margin-(z+2)*(H-2*margin)/22;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#e9f3e6";ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="#9abca8";ctx.lineWidth=2;
  for(let i=-6;i<=6;i+=3){
    ctx.beginPath();ctx.moveTo(mapX(i),mapY(-2));ctx.lineTo(mapX(i),mapY(19));ctx.stroke();
  }
  for(let z=0;z<=18;z+=3){
    ctx.beginPath();ctx.moveTo(mapX(-8),mapY(z));ctx.lineTo(mapX(8),mapY(z));ctx.stroke();
  }
  const p=PERIODS.find(p=>p.id===position.period);
  p.sites.forEach((station,i)=>{
    ctx.beginPath();ctx.arc(mapX(station.x),mapY(station.z),9,0,Math.PI*2);
    ctx.fillStyle=save.discovered.includes(station.id)?"#0c7660":"#c68c32";ctx.fill();
    ctx.fillStyle="#ffffff";ctx.font="bold 12px system-ui";ctx.textAlign="center";ctx.fillText(String(i+1),mapX(station.x),mapY(station.z)+4);
  });
  const x=mapX(position.x),y=mapY(position.z);
  ctx.save();ctx.translate(x,y);ctx.rotate(position.heading);
  ctx.fillStyle="#2531b1";ctx.beginPath();ctx.moveTo(0,-13);ctx.lineTo(-9,10);ctx.lineTo(9,10);ctx.closePath();ctx.fill();
  ctx.restore();
  ctx.textAlign="left";ctx.fillStyle="#173d39";ctx.font="bold 13px system-ui";ctx.fillText("N ↑",12,18);
}
function renderStations(periodId){
  const period=PERIODS.find(p=>p.id===periodId);
  const container=$("stationList");
  container.replaceChildren();
  for(const [index,station] of period.sites.entries()){
    const explored=save.discovered.includes(station.id);
    const card=document.createElement("article");card.className="station"+(explored?" explored":"");
    const top=document.createElement("div");top.className="station-heading";
    const title=document.createElement("strong");title.textContent=(index+1)+". "+station.name;
    const label=document.createElement("span");label.textContent=explored?"✓ Recorded":"○ Unvisited";
    top.append(title,label);
    const clue=document.createElement("p");clue.textContent=station.clue;
    const button=document.createElement("button");button.type="button";button.className="visit-button";
    button.textContent="Travel to "+station.name;
    button.addEventListener("click",()=>{
      explorer.travelTo(station.id);
      say("You arrived near "+station.name+". Examine this site to record the discovery.");
      $("inspectSite").focus();
    });
    card.append(top,clue,button);
    if(station.id==="fossil-bluff"){
      const labLink=document.createElement("a");
      labLink.href="fossil-lab.html";
      labLink.className="fossil-visit-link";
      labLink.textContent="🦴 Practice fossils in the 3D lab";
      card.append(labLink);
    }
    container.append(card);
  }
}
function update(position){
  save.position=position;
  const period=PERIODS.find(p=>p.id===position.period);
  renderPortal(position.period);
  drawMap(position);
  const nearest=explorer.nearest();
  const near=nearest?.distance<=2.6;
  $("nearestName").textContent=nearest?.site.name||"No landmark nearby";
  $("nearestDistance").textContent=nearest?nearest.distance.toFixed(1)+" steps away":"";
  $("nearestClue").textContent=nearest?.site.clue||"Explore to find a landmark.";
  $("inspectSite").disabled=!near;
  $("inspectSite").textContent=near?"🔎 Examine "+nearest.site.name:"Move closer to examine";
  $("visitCount").textContent=String(save.discovered.length);
  $("periodCount").textContent=String(period.sites.filter(s=>save.discovered.includes(s.id)).length);
  $("journalSummary").textContent=save.discovered.length+" of "+ALL_SITES.length+" field sites recorded across three time portals.";
  renderStations(period.id);
  persist();
}
const explorer=createWalkthrough($("worldCanvas"),position=>update(position));
explorer.setState(save.position);
say(activeMessage);

function examine(){
  const nearest=explorer.nearest();
  if(!nearest || nearest.distance>2.6){
    say("Get closer using the movement controls, or use a Travel to Site button.");
    return;
  }
  const site=nearest.site;
  const fresh=!save.discovered.includes(site.id);
  if(fresh){save.discovered.push(site.id);persist();}
  const period=PERIODS.find(p=>p.id===explorer.getState().period);
  say((fresh?"✓ New discovery! ":"Already in your trail journal. ")+site.name+" — "+site.fact);
  $("fieldFact").textContent=site.fact;
  $("scienceDetail").hidden=false;
  update(explorer.getState());
  // Update redraw restores nothing about the 80-mission save: this is a separate optional trail.
  if(save.discovered.length===SITE_IDS.length)$("trailBadge").hidden=false;
}
$("inspectSite").addEventListener("click",examine);
document.querySelectorAll("[data-portal]").forEach(btn=>btn.addEventListener("click",()=>{
  explorer.switchPeriod(btn.dataset.portal);
  $("scienceDetail").hidden=true;
  const period=PERIODS.find(p=>p.id===btn.dataset.portal);
  say(period.label+" time portal opened. "+period.note);
}));
document.querySelectorAll("[data-step]").forEach(btn=>btn.addEventListener("click",()=>{
  explorer.step(btn.dataset.step);
  say("Moving through the "+PERIODS.find(p=>p.id===explorer.getState().period).label+" landscape. "+$("nearestName").textContent+" is "+$("nearestDistance").textContent+".");
}));
$("resetCamera").addEventListener("click",()=>{
  explorer.switchPeriod(explorer.getState().period);
  $("scienceDetail").hidden=true;
  say("Returned to the entrance. All recorded discoveries are kept.");
});
$("trailBadge").hidden=save.discovered.length!==SITE_IDS.length;
