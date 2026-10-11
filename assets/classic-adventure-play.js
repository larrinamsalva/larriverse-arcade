import { creatureMissions, roadMissions } from "./classic-adventure-missions.js";
import { gpsMissions, chillMissions } from "./gps-chill-missions.js";
import { familyMissions, sweatMissions, lifeMissions } from "./final-three-missions.js";

function bootAdventureMissions(){
 // Optional offline learning for four arcade games. All original action/simulation modes remain intact.
 const trigger=document.querySelector("[data-adventure-mission]");
 if(!trigger)return;
 const kind=trigger.dataset.adventureMission;
 const decks={"creature-catcher":creatureMissions,"road-trip-quest":roadMissions,
  "road-trip-quest-gps":gpsMissions,"chill-brain-rewards":chillMissions,
  "kidscoin-family":familyMissions,"brain-sweat-expanded":sweatMissions,"brain-sweat-life-skills":lifeMissions};
 const labels={"creature-catcher":"🦋 Wildlife Explorer","road-trip-quest":"🗺️ Road Trip Navigator",
  "road-trip-quest-gps":"🧭 Demo Map Detective","chill-brain-rewards":"🌿 Gentle Focus Garden",
  "kidscoin-family":"🪙 Family Money Missions","brain-sweat-expanded":"🧠 Workshop Learning Trail",
  "brain-sweat-life-skills":"📚 Life Skills Challenge Path"};
 const deck=decks[kind];
 if(!deck)return;
 const key="larriverse.classicMissions."+kind+".v1";
 const dialog=document.createElement("dialog");
 dialog.id="adventureMissionDialog";
 dialog.className="lv-adventure-dialog";
 dialog.setAttribute("aria-labelledby","adventureMissionTitle");
 dialog.innerHTML=`
   <div class="lv-adventure-shell">
     <header class="lv-adventure-header">
       <div><p class="lv-adventure-kicker">LarriVerse · Offline mission journey</p>
         <h2 id="adventureMissionTitle">${labels[kind]}</h2></div>
       <button type="button" id="adventureClose" class="lv-adventure-close" aria-label="Close missions">✕</button>
     </header>
     <div class="lv-adventure-progress"><div class="lv-adventure-bar" id="adventureBar"></div></div>
     <p id="adventureStatus" class="lv-adventure-status" aria-live="polite"></p>
     <div id="adventureMissionContent"></div>
   </div>`;
 document.body.append(dialog);
 const $=selector=>dialog.querySelector(selector);
 let index=0,passed=false,wrongCount=0;
 function read(){
   try{const item=JSON.parse(localStorage.getItem(key)||"{}");
     if(Number.isInteger(item.next)&&item.next>=0&&item.next<=60)return item.next;}catch{}
   return 0;
 }
 function save(next){
   try{localStorage.setItem(key,JSON.stringify({next}));}
   catch{$("#adventureStatus").textContent="This device could not save your progress. You may continue playing.";}
 }
 function button(label,fn,cls="lv-adventure-action"){
   const node=document.createElement("button");
   node.type="button";node.className=cls;node.textContent=label;node.addEventListener("click",fn);return node;
 }
 function escapeHtml(str){return String(str).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
 function render(){
   const complete=index===60;
   $("#adventureBar").style.width=((index+(passed?1:0))/60*100)+"%";
   $("#adventureStatus").textContent=complete?"All 60 missions completed on this device!":`Mission ${index+1} of 60 · ${index+(passed?1:0)} completed`;
   const content=$("#adventureMissionContent");
   content.replaceChildren();
   if(complete){
     const done=document.createElement("div");
     done.className="lv-adventure-success";
     done.innerHTML=`<h3>🏆 All 60 adventures complete!</h3>
       <p>You practiced sixty different ${kind==="creature-catcher"?"wildlife science and conservation":kind==="road-trip-quest"?"map reading, packing, weather, passenger safety and respectful travel":kind==="road-trip-quest-gps"?"offline demo-map symbols, route safety and location privacy":kind==="chill-brain-rewards"?"gentle observation, focus, comfort and kindness":kind==="kidscoin-family"?"family budgeting and pretend-currency choices":kind==="brain-sweat-expanded"?"reviewed workshop and problem-solving scenarios":"reviewed practical life-skills questions"} decisions. Original game progress stays safe.</p>`;
     content.append(done);
     content.append(button("Replay the sixty missions",()=>{
       if(!window.confirm("Restart only this optional sixty-mission journey? Your original game progress stays safe."))return;
       index=0;passed=false;wrongCount=0;save(0);render();
     }));
     content.append(button("Return to the original game",()=>dialog.close(),"lv-adventure-secondary"));
     return;
   }
   const m=deck[index];
   const section=document.createElement("section");
   section.className="lv-adventure-question";
   section.dataset.missionId=m.id;
   section.innerHTML=`
     <p class="lv-adventure-chapter">${escapeHtml(m.chapter)}</p>
     <h3>${escapeHtml(m.title)}</h3>
     <p class="lv-adventure-prompt" id="adventurePrompt">${escapeHtml(m.prompt)}</p>
     ${m.guide?`<p class="lv-adventure-kicker">${escapeHtml(m.guide)}</p>`:""}
     <div class="lv-adventure-options" id="adventureOptions"></div>
     <p class="lv-adventure-feedback" id="adventureFeedback" aria-live="polite"></p>
     <div class="lv-adventure-actions" id="adventureActions"></div>`;
   content.append(section);
   const options=$("#adventureOptions"),feedback=$("#adventureFeedback"),actions=$("#adventureActions");
   m.options.forEach((choice,n)=>{
     const control=button(choice,()=>{
       if(passed)return;
       if(n===m.answer){
         passed=true;
         feedback.className="lv-adventure-feedback correct";
         feedback.textContent="That's right! "+m.why;
         [...options.children].forEach(x=>x.disabled=true);
         save(index+1);
         $("#adventureBar").style.width=((index+1)/60*100)+"%";
         $("#adventureStatus").textContent=`Mission ${index+1} of 60 · ${index+1} completed`;
         actions.append(button(index===59?"Finish my adventure":"Next mission",()=>{
           index++;passed=false;wrongCount=0;render();
         }));
       }else{
         wrongCount++;
         feedback.className="lv-adventure-feedback retry";
         feedback.textContent=kind==="chill-brain-rewards"?"A different choice might fit this gentle example. You can skip this exercise or try another option.":
           wrongCount===1?"Good try. Read the clues and choose again.":m.why+" Try again.";
       }
     },"lv-adventure-choice");
     control.dataset.choice=String(n);
     control.setAttribute("aria-label",`Answer ${n+1}: ${choice}`);
     options.append(control);
   });
   actions.append(button("Show a free hint",()=>{
     feedback.className="lv-adventure-feedback hint";
     feedback.textContent=m.why.replace(m.options[m.answer]+".","")+
       " Consider which choice best fits this explanation.";
   },"lv-adventure-secondary"));
   actions.append(button("Back to the original game",()=>dialog.close(),"lv-adventure-secondary"));
 }
 trigger.addEventListener("click",()=>{
   index=read();passed=false;wrongCount=0;render();dialog.showModal();
   $("#adventureClose").focus();
 });
 $("#adventureClose").addEventListener("click",()=>dialog.close());
 dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
}
bootAdventureMissions();
