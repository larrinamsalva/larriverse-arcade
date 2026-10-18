import assert from "node:assert/strict";
import fs from "node:fs";
import {messages,conversations,newsCards,repairs,sorting,trafficQuestions} from "../assets/skill-worlds.js";
import {tradeLevels} from "../assets/expedition-worlds.js";
import {marketMissions,beatMissions} from "../assets/creative-missions.js";
import {streetSafetyCategories,streetSafetyScenarios} from "../games/street-safety-scout/scenarios.js";
const read=file=>fs.readFileSync(file,"utf8");
const skill=read("assets/skill-games.js"),expedition=read("assets/expedition-games.js");
const street=read("games/street-safety-scout/game.js");
const catalog=JSON.parse(read("games/catalog.json"));
const campaigns=[
 ["traffic-town","traffic",trafficQuestions],
 ["scam-sleuth","messages",messages],
 ["kindness-quest","conversation",conversations],
 ["fact-finder","news",newsCards],
 ["repair-cafe","repair",repairs],
 ["reuse-rally","sorting",sorting]
];
for(const [id,mode,deck] of campaigns){
 const expected=id==="traffic-town"?120:id==="scam-sleuth"?80:60;
 assert.equal(deck.length,expected,id+" must have its intended full distinct activity count");
 const key=mode==="repair"?"title":mode==="sorting"?"name":"text";
 assert.equal(new Set(deck.map(m=>m[key])).size,expected,id+" no duplicate activities");
 assert.ok(skill.includes(`startCampaign(${mode==="messages"?"messages":mode==="conversation"?"conversations":mode==="news"?"newsCards":mode==="repair"?"repairs":mode==="sorting"?"sorting":"trafficQuestions"},"${mode}")`),id+" must use its full saved main game, never pick ten random cards");
 assert.ok(catalog.find(w=>w.id===id)?.mission.includes(String(expected)),id+" catalog explains full mission count");
}
assert.ok(skill.includes("larriverse.mainCampaign.")&&skill.includes("writeCampaign(state.step,state.correct)"),"Quiz save checkpoints");
assert.ok(skill.includes("writeCampaign(state.step,state.step)"),"Repair save checkpoints");
assert.ok(skill.includes("Chapter ${Math.floor(state.step/10)+1}/${deck.length/10}"),"Visible chapter count follows each deck length");
assert.equal(streetSafetyScenarios.length,60);
for(const cat of streetSafetyCategories)
 assert.equal(streetSafetyScenarios.filter(x=>x.category===cat).length,12,"Twelve distinct safety stops in "+cat);
assert.ok(street.includes("const ROUND_SIZE = 60")&&street.includes("larriverse.streetSafetyScout.longRoute.v1"));
assert.ok(street.includes("while (selected.length < 12)"));
assert.ok(street.includes("writeJourney(step)"),"Each safety stop saves");
assert.ok(read("games/street-safety-scout/index.html").includes('aria-valuemax="60"'),"Sixty real stop progress");
assert.equal(tradeLevels.length,60);
assert.ok(expedition.includes("larriverse.tradeTown.roadmap.v1")&&expedition.includes("saveTrade(s.level)"),"Trade campaign saves when advancing");
assert.equal(marketMissions.length,60);assert.equal(beatMissions.length,60);
assert.ok(skill.includes('case "market":\n      state.marketMode="missions"'),"Lemonade starts with 60 levels");
assert.ok(skill.includes('case "music":\n      state.musicMode="missions"'),"Beat Builder starts with 60 levels");
assert.ok(skill.includes("Return to four-day lab")&&skill.includes("Return to freestyle"),"Free-play modes remain accessible");
for(const id of ["lemonade-lab","beat-builder","trade-town"])
 assert.match(catalog.find(x=>x.id===id)?.mission||"",/60/,id+" catalogs main campaign");
console.log("Validated long-form main gameplay: Traffic Town has 120 signs, Scam Sleuth has 80 cases, the other saved card worlds remain at 60, and Street/Trade/creative campaigns retain their validated counts.");
