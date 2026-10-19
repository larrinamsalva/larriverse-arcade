// Keep this audit honest: a question bank, a sequence of levels, and a
// free-form creative activity are not interchangeable. Do not award sixty
// levels for sixty repeats of the same prompt.
import assert from "node:assert/strict";
import fs from "node:fs";
import {
 bridgeLevels,pipePaths,harborLevels,pantryChallenges,compassClues,cipherLevels,tradeLevels,townLevels,
} from "../assets/expedition-worlds.js";
import {trafficQuestions} from "../assets/expanded-scenarios.js";
import {resourceAdventures} from "../assets/budget-adventures.js";
import {marketMissions,beatMissions,bestMarketPlan} from "../assets/creative-missions.js";
import {creatureMissions,roadMissions} from "../assets/classic-adventure-missions.js";
import {gpsMissions,chillMissions} from "../assets/gps-chill-missions.js";
import {familyMissions,sweatMissions,lifeMissions} from "../assets/final-three-missions.js";
import {timeTrailLevelsWithGoals} from "../assets/time-trail-level.js";
import {gardenLevels,energyLevels} from "../assets/garden-energy-levels.js";
import {messages,conversations,newsCards,repairs,sorting,robotLevels,weatherChallenges,gardenGrowthChallenges} from "../assets/skill-worlds.js";
import {streetSafetyScenarios} from "../games/street-safety-scout/scenarios.js";
import {SUDOKU_LEVELS} from "../games/kids-sudoku/puzzles.js";
import {WORD_SEARCH_LEVELS} from "../games/word-search-world/puzzles.js";
import {CROSSWORD_LEVELS} from "../games/crossword-world/puzzles.js";
import {CREATIVE_PROMPTS} from "../games/creative-calm-cove/prompts.js";
const catalog=JSON.parse(fs.readFileSync("games/catalog.json","utf8"));
const gps=JSON.parse(fs.readFileSync("games/road-trip-quest-gps/world.json","utf8"));
const chill=JSON.parse(fs.readFileSync("games/chill-brain-rewards/sessions.json","utf8"));
const brain=JSON.parse(fs.readFileSync("games/brain-sweat-expanded/activities.json","utf8"));
const life=JSON.parse(fs.readFileSync("games/brain-sweat-life-skills/content-manifest.json","utf8"));
const bubbleSource=fs.readFileSync("games/bubble-resonance-phi369/game.js","utf8");
const bubbleBlock=bubbleSource.match(/const BUBBLE_LEVELS=\[([\s\S]*?)\]\.map\(/)?.[1];
assert.ok(bubbleBlock,"Bubble levels must retain a verifiable source list");
const bubbleStages=[...bubbleBlock.matchAll(/^\s*\['([^']+)',(\d+),(\d+),(\d+),'([^']+)'\],?$/gm)];
assert.equal(new Set(bubbleStages.map(x=>x[1])).size,bubbleStages.length,"Bubble stages need unique names");
const sequential={
 "bridge-buddies":bridgeLevels.length,
 "water-works":pipePaths.length,
 "harbor-helpers":harborLevels.length,
 "pantry-picnic":pantryChallenges.length,
 "compass-cove":compassClues.length,
 "cipher-club":cipherLevels.length,
 "trade-town":tradeLevels.length,
 "critter-council":townLevels.length,
 "traffic-town":trafficQuestions.length,
 "street-safety-scout":streetSafetyScenarios.length,
 "pocket-planet":resourceAdventures.length,
 "scam-sleuth":messages.length,
 "kindness-quest":conversations.length,
 "fact-finder":newsCards.length,
 "repair-cafe":repairs.length,
 "time-trail":timeTrailLevelsWithGoals.length,
 "garden-guardians":gardenLevels.length,
 "energy-island":energyLevels.length,
 "reuse-rally":sorting.length,
 "robot-rover":robotLevels.length,
 "bubble-resonance-phi369":bubbleStages.length,
 "weather-watchers":weatherChallenges.length,
 "garden-grow-harvest":gardenGrowthChallenges.length,
 "kids-sudoku":SUDOKU_LEVELS.length,
 "word-search-world":WORD_SEARCH_LEVELS.length,
 "crossword-world":CROSSWORD_LEVELS.length,
};
// These cabinets are real and playable, but their mode is not one fixed
// sequence of distinct puzzles. Report actual activities/missions separately.
const otherModes={
 "lemonade-lab":{kind:"four-day business simulation + optional distinct market missions",count:marketMissions.length},
 "beat-builder":{kind:"freestyle music studio + optional distinct rhythm missions",count:beatMissions.length},
 "kidscoin-family":{kind:"parent-managed chores and rewards + optional 60 approved family-finance lessons",count:familyMissions.length},
 "brain-sweat-expanded":{kind:"69 original reviewed skill activities + 80-mission learning path with labeled safe bonus practice",count:sweatMissions.length},
 "brain-sweat-life-skills":{kind:"60 reviewed original questions in twelve unlocked lessons + 80-mission progression with labeled safe bonus practice",count:lifeMissions.length},
 "chill-brain-rewards":{kind:"guided calm sessions plus eighty optional untimed focus choices",count:chillMissions.length},
 "creature-catcher":{kind:"classic creature collection + optional distinct wildlife missions",count:creatureMissions.length},
 "road-trip-quest":{kind:"sixteen-city adventure + optional distinct travel missions",count:roadMissions.length},
 "road-trip-quest-gps":{kind:"GPS demo field + sixty optional no-location map/privacy challenges",count:gpsMissions.length},
 "creative-calm-cove":{kind:"open art studio + eighty optional no-pressure creative cards",count:CREATIVE_PROMPTS.length}
};
const ids=catalog.map(x=>x.id);
assert.equal(new Set(ids).size,ids.length,"No duplicate game ids");
assert.deepEqual([...new Set([...Object.keys(sequential),...Object.keys(otherModes)])].sort(),[...ids].sort(),
 "Audit must cover every playable cabinet, including newly added worlds");
assert.equal(marketMissions.length,80);
assert.equal(beatMissions.length,80);
assert.equal(new Set(beatMissions.map(x=>x.rows.map(row=>row.join(",")).join("|"))).size,80,
 "Eighty Beat Builder missions must be actually different patterns");
assert.ok(marketMissions.every(x=>bestMarketPlan(x)?.profit>=x.goal),
 "All market contracts must have affordable winning setups");
const optionalMissionPaths={ "lemonade-lab":marketMissions.length,"beat-builder":beatMissions.length,"creature-catcher":creatureMissions.length,"road-trip-quest":roadMissions.length,"road-trip-quest-gps":gpsMissions.length,"chill-brain-rewards":chillMissions.length,"kidscoin-family":familyMissions.length,"brain-sweat-expanded":sweatMissions.length,"brain-sweat-life-skills":lifeMissions.length,"creative-calm-cove":CREATIVE_PROMPTS.length };
for (const [id,deck] of [["creature-catcher",creatureMissions],["road-trip-quest",roadMissions]]) {
 assert.equal(deck.length,60,`${id} offers sixty optional real missions`);
 assert.equal(new Set(deck.map(x=>x.prompt)).size,60,`${id} missions are not repeats`);
}
for(const [id,deck] of [["road-trip-quest-gps",gpsMissions],["chill-brain-rewards",chillMissions]]){
 const expected=id==="chill-brain-rewards"?80:60;
 assert.equal(deck.length,expected,`${id} has ${expected} distinct objectives`);
 assert.equal(new Set(deck.map(x=>x.prompt)).size,expected,`${id} may not repeat questions`);
 assert.ok(deck.every(x=>x.why.includes(x.options[x.answer])),`${id} correct choices are explained`);
}
assert.equal(CREATIVE_PROMPTS.length,80,"Creative Calm Cove offers eighty optional creative cards");
assert.equal(new Set(CREATIVE_PROMPTS.map(x=>x.prompt)).size,80,"Creative Calm Cove prompts are not repeats");
for(const [id,deck] of [["kidscoin-family",familyMissions],["brain-sweat-expanded",sweatMissions],["brain-sweat-life-skills",lifeMissions]]){
 const expected=id==="kidscoin-family"?60:80;
 assert.equal(deck.length,expected,`${id} has its intended optional mission count`);
 assert.equal(new Set(deck.map(x=>x.prompt)).size,expected,`${id} must not recycle questions`);
 assert.ok(deck.every(m=>m.options[m.answer]!==undefined),`${id} has answer keys`);
}
const counts=Object.entries(sequential);
const ready=counts.filter(([id,n])=>n>=60);
const notReady=counts.filter(([id,n])=>n<60);
const minimums={
 "bridge-buddies":60,"water-works":80,"harbor-helpers":80,"compass-cove":60,"cipher-club":60,"trade-town":60,"critter-council":60,"pocket-planet":60,"garden-guardians":60,"energy-island":60,"robot-rover":80,"pantry-picnic":80,"traffic-town":120,"street-safety-scout":60,
 "scam-sleuth":80,"kindness-quest":60,"fact-finder":60,"repair-cafe":60,
 "time-trail":60,"reuse-rally":60,"kids-sudoku":80,
 "bubble-resonance-phi369":80,"weather-watchers":60,"garden-grow-harvest":80,
 "word-search-world":60,"crossword-world":80
};
for(const [id,floor] of Object.entries(minimums))assert.equal(sequential[id],floor,`${id} must keep its intended distinct playable challenge count`);
for(const [id,n] of ready)assert.ok(n>=60,id+" regressed");
assert.equal(ready.length,26,"All fixed-sequence worlds now provide sixty real challenges");
assert.ok(gps.questions&&Object.values(gps.questions).reduce((n,a)=>n+a.length,0)===gps.source.questionCount);
for(const item of weatherChallenges.concat(gardenGrowthChallenges)){
 assert.ok(item.options[item.answer].label.trim().length>=2, "Short but clear weather labels such as Fog remain valid");
 assert.ok(item.why.length>40);
}
for(const [id,expected] of [
 ["weather-watchers",/sixty|60/i],
 ["garden-grow-harvest",/eighty|80/i],
 ["bridge-buddies",/sixty|60/i],
 ["bubble-resonance-phi369",/eighty|80/i]
]){
 const game=catalog.find(g=>g.id===id);
 assert.ok(game&&expected.test(game.mission||game.desc),"Updated game has truthful challenge-count metadata");
}
assert.equal(ready.length+Object.keys(optionalMissionPaths).length,36,"Every cabinet has a real sixty-step path or a genuine optional mission/card path; no fake levels");
const report={cabinetCount:ids.length,complete:ready.length,optionalMissionPaths,worldsWithSixtyMissions:ready.length+Object.keys(optionalMissionPaths).length,belowTarget:notReady.map(([id,count])=>({id,count,remaining:60-count})),otherModes,
 all:ids.map(id=>({id,count:sequential[id]??otherModes[id]?.count??null,kind:id in sequential?"fixed sequence":otherModes[id]?.kind,
 status:id in sequential?(sequential[id]>=60?"60-ready":"under-60"):id in optionalMissionPaths?"60-optional-missions":"needs bespoke level design"}))};
console.log(JSON.stringify(report,null,2));
