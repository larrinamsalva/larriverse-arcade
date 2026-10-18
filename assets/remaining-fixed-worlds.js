// New independently playable content for the last four fixed-length worlds.
// These generators use fixed inputs and no network access, timers, or random state.
// Previously published levels remain at the front of their arrays.
const projects = [
 ["Window Herb Garden","🌿","grow","A sunny window planter","Clean planter|🪴","Potting mix|🌱","Herb seeds|🌾","Ask an adult to check the windowsill for sunlight","Fill the planter with a suitable potting mix","Sow herb seeds and gently water the soil"],
 ["Bean Teepee Model","🫘","grow","A model for climbing beans","Bean seeds|🫘","Garden soil|🪴","Wooden supports|🪵","Choose a suitable bean-growing spot with an adult","Make a simple support around the growing area","Plant beans and check the supports as they grow"],
 ["Pollinator Pot","🌼","grow","A flower pot for visiting pollinators","Flower seeds|🌼","Potting mix|🪴","Planter with drainage|🌱","Choose locally suitable flowers with an adult","Fill a drained pot with soil and plant seeds","Water gently and observe visiting insects from afar"],
 ["Kitchen Scrap Sprouts","🥬","grow","A regrowing greens experiment","Green onion bases|🧅","Shallow clean cup|🥛","Fresh water|💧","Save healthy green onion bases after preparing food","Place the roots in a cup with a little clean water","Change water with an adult and watch new growth"],
 ["Mini Compost Jar Model","🍂","grow","A classroom compost layers model","Dry leaves|🍂","Small soil sample|🌱","Clear jar|🫙","Ask an adult to gather safe dry leaves and soil","Add alternating sample layers inside the clear jar","Observe the layers; do not seal or eat the contents"],
 ["Rain Gauge Craft","🌧️","grow","A simple rain-measuring model","Clear bottle|🧴","Waterproof ruler|📏","Pebbles for base|🪨","Ask an adult to prepare a smooth-edged clear container","Place clean pebbles at the bottom for stability","Mark a scale and measure rainfall outdoors together"],
 ["Seed Sorting Station","🌰","grow","A safe seed sorting tray","Large bean seeds|🫘","Three divided cups|🥤","Sorting tray|🧺","Collect age-safe large seeds with adult guidance","Arrange cups on the tray by seed shape or size","Sort seeds and describe the differences you notice"],
 ["Mulch Observation Patch","🍁","grow","A soil moisture comparison","Two soil pots|🪴","Dry leaf mulch|🍁","Watering can|💧","Ask an adult to prepare two matching soil pots","Cover only one pot with a thin dry-leaf layer","Water equally and compare surface moisture later"],
 ["Butterfly Garden Map","🦋","grow","A pollinator-friendly garden plan","Paper garden map|🗺️","Color pencils|✏️","Native flower guide|🌼","Look up suitable native flowers with a trusted adult","Sketch sunlight and pathway spaces on your garden map","Draw flower groups and a quiet insect-viewing spot"],
 ["Plant Care Calendar","📅","grow","A weekly plant-care chart","Paper calendar|📅","Pencil|✏️","Plant care label|🏷️","Read the plant label with an adult helper","Mark regular observation days on the calendar","Check soil before watering and record plant changes"],
 ["Cardboard Desk Organizer","📦","build","A tidy desk organizer","Clean cardboard tubes|🧻","Reused cardboard base|📦","Paper tape|🧷","Collect clean, undamaged cardboard with an adult","Arrange the tubes securely on the sturdy base","Attach with paper tape and sort pencils by type"],
 ["Paper Wind Spinner","🌪️","build","A colorful paper wind spinner","Square paper|📄","Washable crayons|🖍️","Safe fastener|📎","Decorate the paper with colorful weather symbols","Ask an adult to fold and safely attach the spinner","Test gentle airflow and notice how the spinner moves"],
 ["Recycled Bird Silhouette","🐦","build","A bird-watching window guide","Scrap card|📃","Colored pencils|✏️","Bird photo guide|🐦","Choose a bird shape from a trusted picture guide","Draw and color the shape on a piece of scrap card","Display the card where it will not confuse wild birds"],
 ["Shadow Clock Model","🌞","build","A changing-shadow science model","Cardboard circle|📦","Paper straw|🥤","Pencil marks|✏️","Ask an adult to choose a safe outdoor observation spot","Stand the paper straw upright in the card circle","Mark shadows at different times without staring at the sun"],
 ["Community Kindness Cards","💌","build","A set of kindness cards","Recycled paper|📄","Markers|🖍️","Envelopes|✉️","Think of three encouraging messages for neighbors","Write the messages on clean reused paper","Place the cards in envelopes for adult-approved delivery"],
 ["Mini Ramp Test","♿","build","A model step-free toy ramp","Firm cardboard sheet|📦","Toy wheelchair|🦽","Stackable blocks|🧱","Build a low model ledge from stable blocks","Place a smooth cardboard ramp against the ledge","Test the toy wheels and adjust any steep angle"],
 ["Book Corner Sign","📚","build","A welcoming reading corner sign","Reused poster board|📋","Thick markers|🖍️","Paper tape|🧷","Choose clear and friendly words for your reading space","Write big high-contrast lettering on the board","Attach the sign without covering walkways or exits"],
 ["Floating Foil Boat","⛵","build","A miniature floating boat test","Aluminum foil sheet|🛶","Water basin|💧","Large dry beans|🫘","Fold a shallow foil boat with an adult helper","Gently float the boat in a shallow safe basin","Add dry beans one by one to test balance and capacity"],
 ["Color Wheel Spinner","🎨","build","A spinning color wheel","Round cardboard|📦","Washable colors|🖍️","Safe paper fastener|📎","Divide a cardboard circle into equal color sections","Color each section with a different bright shade","Use an adult-approved fastener and gently spin the disc"],
 ["Toy Bridge Blueprint","🌉","build","A paper bridge planning map","Grid paper|📐","Pencil|✏️","Ruler|📏","Draw two banks with a gap between them","Measure the gap and sketch supporting beams","Label a safe toy-scale bridge design to test later"],
 ["Rainbow Fruit Bowl","🍓","eat","A colorful fruit bowl","Washed berries|🍓","Banana|🍌","Clean bowl|🥣","Wash hands and ask an adult to prepare the fruit safely","Place the prepared fruit pieces in a clean bowl","Mix gently and enjoy after checking food allergies"],
 ["Cucumber Crunch Cups","🥒","eat","A cool cucumber snack","Washed cucumber|🥒","Plain yogurt|🥛","Clean snack cup|🥣","Ask an adult to wash and prepare the cucumber","Spoon plain yogurt into a clean serving cup","Add cucumber pieces and check for food allergies"],
 ["Rainbow Salad Wrap","🌯","eat","A colorful veggie wrap","Tortilla wrap|🌯","Clean leafy greens|🥬","Washed tomato|🍅","Wash hands and check food allergies with an adult","Place prepared greens and tomatoes on a tortilla","Roll the wrap and keep ingredients safely chilled"],
 ["Apple Oat Cups","🍎","eat","A no-cook apple and oat snack","Apple slices|🍎","Ready-to-eat oats|🌾","Clean yogurt cup|🥛","Ask an adult to wash and safely slice the apple","Layer the ready-to-eat oats with yogurt in a cup","Top with apple slices and enjoy while fresh"],
 ["Berry Yogurt Parfait","🫐","eat","A chilled berry layered treat","Plain yogurt|🥛","Washed blueberries|🫐","Ready-to-eat granola|🥣","Wash berries and ask an adult to check the labels","Spoon yogurt into a clean chilled serving cup","Layer berries and granola immediately before serving"],
 ["Carrot Hummus Plate","🥕","eat","A crunchy vegetable plate","Prepared carrot sticks|🥕","Hummus|🫘","Clean serving plate|🍽️","Ask an adult to prepare safe carrot pieces","Spoon hummus onto a clean small plate","Arrange carrot sticks and check sesame or legume allergies"],
 ["Peach Cottage Cheese Bowl","🍑","eat","A peach and cheese bowl","Washed peach slices|🍑","Cottage cheese|🥛","Clean spoon|🥄","Wash hands and ask an adult to slice the fruit safely","Spoon chilled cottage cheese into a serving bowl","Top with peaches and serve before the food warms"],
 ["Banana Toast Faces","🍞","eat","A silly breakfast face","Prepared toast|🍞","Banana slices|🍌","Nut-free spread|🥜","Ask an adult to prepare toast and check spread ingredients","Spread a thin layer over the cooled toast","Arrange banana slices into a smiling face"],
 ["Veggie Rainbow Skewers Model","🌈","eat","A rainbow snack pattern","Prepared pepper pieces|🫑","Washed cherry tomatoes|🍅","Clean flat plate|🍽️","Ask an adult to cut produce to safe bite sizes","Sort prepared vegetables into a rainbow pattern","Place the colors on a flat plate rather than sharp skewers"],
 ["Garden Picnic Plate","🧺","eat","A simple garden picnic plate","Washed grapes cut safely|🍇","Cheese cubes|🧀","Clean lunch box|🍱","Wash hands and ask an adult to prepare safe grape pieces","Arrange cheese and fruit separately in the lunch box","Keep chilled and check ingredients for allergies"],
];
const wrong={
  grow:["Toy race car|🚗","Remote controller|🎮","Glitter stickers|✨"],
  build:["Raw egg|🥚","Ice cream|🍦","Bath sponge|🧽"],
  eat:["Toy battery|🔋","Craft glue|🧴","Paintbrush|🖌️"],
};
export const pocketExtraProjects=projects.map(([title,icon,kind,goal,a,b,c,step1,step2,step3],i)=>({
 id:"quest-"+String(i+31).padStart(2,"0")+"-"+title.toLowerCase().replace(/[^a-z]+/g,"-"),
 title,icon,kind,goal,
 story:"Explore "+title.toLowerCase()+". Make thoughtful choices about safe supplies and learn why the order matters for this real-life-inspired project.",
 items:[a,b,c].map(x=>{const [name,icon]=x.split("|");return {name,icon,need:true};})
   .concat(wrong[kind].map(x=>{const [name,icon]=x.split("|");return {name,icon,need:false};})),
 steps:[step1,step2,step3],
}));

const gardenPlaces=["Clover","Sunflower","Fern","Bluebell","Sage","Rainbow","Maple","Bee","Acorn","Daisy","Willow","Meadow","Orchard"];
const gardenKinds=["Patch","Terrace","Trail","Grove","Corners"];
const gardenPlans=[];
for(let flowers=1;flowers<=4;flowers++)
 for(let carrots=0;carrots<=6-flowers;carrots++){
  const beans=6-flowers-carrots;
  gardenPlans.push({carrot:carrots,bean:beans,flower:flowers});
 }
export const gardenExtraLevels=Array.from({length:52},(_,i)=>{
 const mix=gardenPlans[i%gardenPlans.length];
 const level=i+9,zone=["meadow","orchard","hill","sunset"][Math.floor(i/13)];
 const later=i>=36;
 let target=later?6:5,water=later?12:i>=18?10:11;
 // Preserve all eight published planting/water combinations as distinct levels.
 const oldPlans=new Set(["2:2:2:6:12","3:2:1:6:12","1:2:3:5:11","1:4:1:5:10",
   "3:1:2:5:11","1:1:4:6:12","2:3:1:5:10","2:1:3:6:12"]);
 if(oldPlans.has([mix.carrot,mix.bean,mix.flower,target,water].join(":"))){
   target=5;water=12; // advanced flexible-resources variant, not an old puzzle
 }
 const name=gardenPlaces[i%gardenPlaces.length]+" "+gardenKinds[Math.floor(i/gardenPlaces.length)];
 return {id:"garden-"+String(level).padStart(2,"0"),name,rank:[
   "Compost Keeper","Water Saver","Flower Friend","Season Planner",
   "Habitat Helper","Harvest Guardian","Eco Designer","Garden Champion",
 ][Math.floor(i/7)],zone,water,target,...mix,
 lesson:"Design the "+name+" garden with "+mix.carrot+" carrots, "+mix.bean+" beans and "+mix.flower+" flowers. Carefully plan "+water+" water drops across different growing days so at least "+target+" plants thrive."};
});

const forecasts={
 sunny:{name:"Sunny",icon:"☀️",solar:3,wind:1},
 cloudy:{name:"Cloudy",icon:"☁️",solar:1,wind:2},
 night:{name:"Night",icon:"🌙",solar:0,wind:2},
 breezy:{name:"Breezy",icon:"🌬️",solar:2,wind:2},
};
const energyPlaces=["Cedar","Otter","Pine","Daisy","Cloud","Star","Cove","Maple","Harvest","Valley","Fox","Reef","Meadow"];
const energyKinds=["Isle","Harbor","Village","Haven"];
const weatherKeys=["sunny","cloudy","breezy","night"];
export const energyExtraLevels=Array.from({length:52},(_,i)=>{
 const id=i+9, zone=["coast","village","forest","mountain"][Math.floor(i/13)];
 const demand=6+Math.floor(i/18),tokens=(demand===6?12:demand===7?14:16)+i%3;
 const code=(i*37+71)%256;
 const patterns=Array.from({length:4},(_,day)=>weatherKeys[(Math.floor(code/4**day))%4]);
 patterns[3]="night";
 const name=energyPlaces[i%13]+" "+energyKinds[Math.floor(i/13)];
 return {id:"power-"+String(id).padStart(2,"0"),name,rank:[
  "Solar Student","Wind Mapper","Forecast Reader","Battery Planner",
  "Microgrid Builder","Night Shift Planner","Resilience Designer","Power Guardian",
 ][Math.floor(i/7)],zone,tokens,demand,
 weather:patterns.map(x=>({...forecasts[x]})),
 lesson:"Plan energy for "+name+" over "+patterns.map(x=>forecasts[x].name.toLowerCase()).join(", ")+
 ". Supply "+demand+" units on each day using at most "+tokens+" builder tokens. Decide which sources can help after dark."};
});

const roverNames=["Dune Detour","North Ridge","Crystal Pass","Satellite Lane","Cloud Maze",
 "Canyon Traverse","River Bend","Copper Tunnel","Moonlight Run","Lunar Lookout",
 "Starboard Route","Cloudline Path","Beacon Bend","Cobalt Ridge","Echo Canyon",
 "Silver Circuit","Nebula Drive","Galaxy Bend","Boulder Hollow","Comet Alley",
 "Orbit Puzzle","Quartz Crossing","Pine Passage","Solar Valley","Meteor Circuit",
 "Twilight Trail","Asteroid Bridge","Aurora Lane","Summit Loop","Moonbeam Maze",
 "Starlight Canyon","Cosmic Orchard","Rocket Ridge","Saturn Passage","Skyline Maze",
 "Aurora Outpost","Nebula Switch","Comet Gateway","Stargazer Route","Rover Finale"];
const roverRanks=["Path Explorer","Corner Cartographer","Rock Dodger","Trail Strategist",
 "Space Navigator","Orbit Programmer","Galaxy Pathfinder","Rover Legend"];
const roverNext=(seed)=>((seed*1664525+1013904223)>>>0);
const nextStep=(cell,dir)=>{
 const r=Math.floor(cell/5),c=cell%5;
 if(dir===0)return r>0?cell-5:-1;
 if(dir===1)return c<4?cell+1:-1;
 if(dir===2)return r<4?cell+5:-1;
 return c>0?cell-1:-1;
};
export function roverShortestPath(level){
 const q=[{cell:level.start,dir:level.dir,path:""}],seen=new Set([level.start+":"+level.dir]);
 for(let i=0;i<q.length;i++){
  const state=q[i];if(state.cell===level.goal)return state.path;
  for(const cmd of ["F","L","R"]){
   const cell=cmd==="F"?nextStep(state.cell,state.dir):state.cell;
   const dir=cmd==="L"?(state.dir+3)%4:cmd==="R"?(state.dir+1)%4:state.dir;
   if(cell<0 || level.rocks.includes(cell))continue;
   const key=cell+":"+dir;
   if(!seen.has(key)){seen.add(key);q.push({cell,dir,path:state.path+cmd});}
  }
 }
 return null;
}
const uniqueBoards=new Set();
export const roverExtraLevels=Array.from({length:40},(_,i)=>{
 let seed=(104729+i*7919)>>>0;
 let chosen=null;
 for(let attempts=0;attempts<6000;attempts++){
  seed=roverNext(seed);const start=seed%25;
  seed=roverNext(seed);const goal=seed%25;
  seed=roverNext(seed);const dir=seed%4;
  if(start===goal)continue;
  const rocks=[];
  const rockCount=5+Math.floor(i/8);
  for(let cell=0;cell<25;cell++){
   if(cell===start||cell===goal)continue;
   seed=roverNext(seed);
   if((seed%29)<rockCount)rocks.push(cell);
  }
  const level={start,goal,dir,rocks};
  const path=roverShortestPath(level);
  const minLength=5+Math.floor(i/6);
  const key=[start,goal,dir,rocks.join(",")].join(":");
  if(path && path.length>=minLength && path.length<=26 && !uniqueBoards.has(key)){
   chosen={...level,par:path.length};uniqueBoards.add(key);break;
  }
 }
 if(!chosen)throw new Error("Rover generator could not find puzzle "+(i+21));
 return {...chosen,name:roverNames[i],rank:roverRanks[Math.floor(i/5)],zone:["meadow","canyon","crystal","cosmic"][Math.floor(i/10)],
  hint:"Plan a safe "+roverNames[i].toLowerCase()+" route. Start at row "+(Math.floor(chosen.start/5)+1)+
  ", column "+(chosen.start%5+1)+", and seek the star at row "+(Math.floor(chosen.goal/5)+1)+
  ", column "+(chosen.goal%5+1)+". Use Left and Right turns before moving Forward; avoid the rocks."};
});


// Garden Guardians levels 61–120: harder resource plans with more varied harvest targets.
// Every tuple of crop mix + target + water budget is distinct from the first 60.
const advancedGardenRanks=[
 "Soil Systems","Water Wise","Crop Balancer","Pollinator Planner","Drought Detective","Harvest Planner",
 "Habitat Builder","Season Strategist","Garden Analyst","Resource Mentor","Eco Steward","Master Gardener"
];
const originalGardenPlanKeys=new Set([
 "2:2:2:6:12","3:2:1:6:12","1:2:3:5:11","1:4:1:5:10",
 "3:1:2:5:11","1:1:4:6:12","2:3:1:5:10","2:1:3:6:12",
 ...gardenExtraLevels.map(level=>[level.carrot,level.bean,level.flower,level.target,level.water].join(":"))
]);
const advancedGardenCandidates=[];
for(let flowers=1;flowers<=4;flowers++)
 for(let carrots=0;carrots<=6-flowers;carrots++){
  const bean=6-flowers-carrots;
  for(const target of [4,5,6])
   for(let water=target*2;water<=14;water++){
    const key=[carrots,bean,flowers,target,water].join(":");
    if(!originalGardenPlanKeys.has(key))advancedGardenCandidates.push({carrot:carrots,bean,flower:flowers,target,water,key});
   }
 }
if(advancedGardenCandidates.length<60)throw new Error("Not enough distinct advanced garden plans");
const advancedGardenPlaces=["Cedar","Marigold","Juniper","Lavender","Robin","Creek","Honeybee","Oak","Moonflower","Basil"];
const advancedGardenKinds=["Terrace","Commons","Nursery","Hollow","Garden","Yard"];
export const gardenAdvancedLevels=advancedGardenCandidates.slice(0,60).map((plan,i)=>{
 const level=i+61,rank=advancedGardenRanks[Math.floor(i/5)],zone=["meadow","orchard","hill","sunset"][Math.floor(i/15)];
 const name=advancedGardenPlaces[i%advancedGardenPlaces.length]+" "+advancedGardenKinds[Math.floor(i/advancedGardenPlaces.length)];
 return {
  id:"garden-"+String(level).padStart(3,"0"),name,rank,zone,
  carrot:plan.carrot,bean:plan.bean,flower:plan.flower,target:plan.target,water:plan.water,
  lesson:"Build "+name+" with "+plan.carrot+" carrots, "+plan.bean+" beans and "+plan.flower+
   " flowers. You have "+plan.water+" water drops; plan two watering days so at least "+plan.target+
   " plants thrive without spending water where it is not needed."
 };
});

// Robot Rover levels 61–120: deterministic, solver-verified mazes.
const advancedRoverRanks=[
 "Route Reader","Turn Technician","Maze Mapper","Rock Planner","Command Builder","Debug Detective",
 "Path Optimizer","Mission Coder","Grid Engineer","Rover Captain","Star Navigator","Rover Grandmaster"
];
const advancedRoverAdjectives=["Amber","Beacon","Cinder","Delta","Emerald","Frost","Golden","Harbor","Ion","Jade","Kepler","Lunar"];
const advancedRoverNouns=["Crossing","Circuit","Pass","Switchback","Maze"];
const advancedRoverBoards=new Set(roverExtraLevels.map(level=>[level.start,level.goal,level.dir,level.rocks.join(",")].join(":")));
export const roverAdvancedLevels=Array.from({length:60},(_,i)=>{
 let seed=(900001+i*104729)>>>0,chosen=null;
 for(let attempts=0;attempts<12000;attempts++){
  seed=roverNext(seed);const start=seed%25;
  seed=roverNext(seed);const goal=seed%25;
  seed=roverNext(seed);const dir=seed%4;
  if(start===goal)continue;
  const rocks=[],rockCount=7+Math.floor(i/15);
  for(let cell=0;cell<25;cell++){
   if(cell===start||cell===goal)continue;
   seed=roverNext(seed);
   if((seed%31)<rockCount)rocks.push(cell);
  }
  const candidate={start,goal,dir,rocks};
  const path=roverShortestPath(candidate);
  const minLength=8+Math.floor(i/10);
  const key=[start,goal,dir,rocks.join(",")].join(":");
  if(path&&path.length>=minLength&&path.length<=30&&!advancedRoverBoards.has(key)){
   chosen={...candidate,par:path.length};advancedRoverBoards.add(key);break;
  }
 }
 if(!chosen)throw new Error("Advanced Rover generator could not find puzzle "+(i+61));
 const rank=advancedRoverRanks[Math.floor(i/5)],zone=["meadow","canyon","crystal","cosmic"][Math.floor(i/15)];
 const name=advancedRoverAdjectives[Math.floor(i/5)]+" "+advancedRoverNouns[i%5];
 return {...chosen,name,rank,zone,
  hint:"Plan "+name.toLowerCase()+" in short sections. Rover begins at row "+(Math.floor(chosen.start/5)+1)+
   ", column "+(chosen.start%5+1)+", facing "+["north","east","south","west"][chosen.dir]+
   ". Reach row "+(Math.floor(chosen.goal/5)+1)+", column "+(chosen.goal%5+1)+
   " without touching a rock. Test, notice the first wrong turn, then change only the commands that need debugging."};
});
