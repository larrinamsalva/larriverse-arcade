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
import {timeTrailLevelsWithGoals} from "../assets/time-trail-level.js";
import {gardenLevels,energyLevels} from "../assets/garden-energy-levels.js";
import {messages,conversations,newsCards,repairs,sorting,robotLevels,weatherChallenges,gardenGrowthChallenges} from "../assets/skill-worlds.js";
import {streetSafetyScenarios} from "../games/street-safety-scout/scenarios.js";
import {SUDOKU_LEVELS} from "../games/kids-sudoku/puzzles.js";
import {WORD_SEARCH_LEVELS} from "../games/word-search-world/puzzles.js";
import {CROSSWORD_LEVELS} from "../games/crossword-world/puzzles.js";
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
 "lemonade-lab":{kind:"repeatable business simulation",count:null},
 "beat-builder":{kind:"open-ended music studio",count:null},
 "kidscoin-family":{kind:"family goals and multiple learning activities",count:null},
 "brain-sweat-expanded":{kind:"reviewed activities across subworlds",count:brain.integration.playableActivityCount},
 "brain-sweat-life-skills":{kind:"questions across lessons and subworlds",count:life.source.readableQuestionCount},
 "chill-brain-rewards":{kind:"guided calm sessions",count:chill.missions.length},
 "creature-catcher":{kind:"open-ended creature collecting",count:null},
 "road-trip-quest":{kind:"open-ended adventure",count:null},
 "road-trip-quest-gps":{kind:"XP milestone levels (not separate puzzles)",count:gps.levelThresholds.length}
};
const ids=catalog.map(x=>x.id);
assert.equal(new Set(ids).size,ids.length,"No duplicate game ids");
assert.deepEqual([...new Set([...Object.keys(sequential),...Object.keys(otherModes)])].sort(),[...ids].sort(),
 "Audit must cover every playable cabinet, including newly added worlds");
const counts=Object.entries(sequential);
const ready=counts.filter(([id,n])=>n>=60);
const notReady=counts.filter(([id,n])=>n<60);
const minimums={
 "bridge-buddies":60,"water-works":60,"harbor-helpers":60,"compass-cove":60,"cipher-club":60,"pantry-picnic":60,"traffic-town":60,"street-safety-scout":60,
 "scam-sleuth":60,"kindness-quest":60,"fact-finder":60,"repair-cafe":60,
 "time-trail":60,"reuse-rally":60,"kids-sudoku":60,
 "bubble-resonance-phi369":60,"weather-watchers":60,"garden-grow-harvest":60,
 "word-search-world":60,"crossword-world":60
};
for(const [id,floor] of Object.entries(minimums))assert.equal(sequential[id],floor,`${id} must keep all sixty distinct playable challenges`);
for(const [id,n] of ready)assert.ok(n>=60,id+" regressed");
assert.equal(ready.length,20,"Four additional expeditions now reach sixty real challenges");
assert.ok(gps.questions&&Object.values(gps.questions).reduce((n,a)=>n+a.length,0)===gps.source.questionCount);
for(const item of weatherChallenges.concat(gardenGrowthChallenges)){
 assert.ok(item.options[item.answer].label.trim().length>=2, "Short but clear weather labels such as Fog remain valid");
 assert.ok(item.why.length>40);
}
for(const id of ["weather-watchers","garden-grow-harvest","bridge-buddies","bubble-resonance-phi369"]){
 const game=catalog.find(g=>g.id===id);
 assert.ok(game&&/sixty|60/i.test(game.mission||game.desc),"Updated game has truthful sixty-challenge metadata");
}
const report={cabinetCount:ids.length,complete:ready.length,belowTarget:notReady.map(([id,count])=>({id,count,remaining:60-count})),otherModes,
 all:ids.map(id=>({id,count:sequential[id]??otherModes[id]?.count??null,kind:id in sequential?"fixed sequence":otherModes[id]?.kind,
 status:id in sequential?(sequential[id]>=60?"60-ready":"under-60"):"needs bespoke level design"}))};
console.log(JSON.stringify(report,null,2));
