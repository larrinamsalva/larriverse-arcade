// Offline-only progression for the original Garden Guardians and Energy Island worlds.
// These are simplified, fictional practice missions; no actual planting or electrical advice.
export const gardenLevels = [
  { id:"meadow-seeds", name:"Meadow Seeds", rank:"Sprout Starter", zone:"meadow", water:12, target:6, carrot:2, bean:2, flower:2, lesson:"Plant two of each kind so your first patch supports food crops and pollinators." },
  { id:"veggie-patch", name:"Veggie Patch", rank:"Sprout Starter", zone:"meadow", water:12, target:6, carrot:3, bean:2, flower:1, lesson:"Plan room for more carrots while keeping one flower for visiting pollinators." },
  { id:"flower-lane", name:"Flower Lane", rank:"Soil Scout", zone:"orchard", water:11, target:5, carrot:1, bean:2, flower:3, lesson:"Not every plot can fully grow with eleven drops. Decide where your limited water helps." },
  { id:"bean-barn", name:"Bean Barn", rank:"Soil Scout", zone:"orchard", water:10, target:5, carrot:1, bean:4, flower:1, lesson:"A bean-heavy garden still leaves space for another crop and a pollinator patch." },
  { id:"harvest-hill", name:"Harvest Hill", rank:"Pollinator Partner", zone:"hill", water:11, target:5, carrot:3, bean:1, flower:2, lesson:"When supplies are scarce, plan which five plots need two separate watering days." },
  { id:"busy-blooms", name:"Busy Blooms", rank:"Pollinator Partner", zone:"hill", water:12, target:6, carrot:1, bean:1, flower:4, lesson:"Flowers can support pollinators. Give each of six planted patches water on two days." },
  { id:"dry-season", name:"Dry Season", rank:"Garden Steward", zone:"sunset", water:10, target:5, carrot:2, bean:3, flower:1, lesson:"Conserve water: two well-spaced waterings grow a crop; a third adds nothing." },
  { id:"grand-garden", name:"Grand Garden", rank:"Garden Steward", zone:"sunset", water:12, target:6, carrot:2, bean:1, flower:3, lesson:"Use what you learned: three plant kinds, six planned plots, and careful watering." },
];

const conditions = {
  sunny: { name:"Sunny", icon:"☀️", solar:3, wind:1 },
  cloudy: { name:"Cloudy", icon:"☁️", solar:1, wind:2 },
  night: { name:"Night", icon:"🌙", solar:0, wind:2 },
  breezy: { name:"Breezy", icon:"🌬️", solar:2, wind:2 },
};
const energyData = [
  ["first-lights","First Lights","Power Beginner","coast",12,6,["sunny","cloudy","night","breezy"],"A sunny surplus can power the island at night."],
  ["windy-coast","Windy Coast","Power Beginner","coast",12,6,["breezy","cloudy","night","breezy"],"Wind still makes energy after sunset in this toy forecast."],
  ["sunshine-village","Sunshine Village","Weather Watcher","village",12,6,["sunny","sunny","cloudy","night"],"Look ahead to the final dark day when planning solar storage."],
  ["after-dark-harbor","After-dark Harbor","Weather Watcher","village",14,6,["sunny","night","night","breezy"],"Two night shifts demand a plan that does not depend only on sunlight."],
  ["misty-forest","Misty Forest","Storage Planner","forest",16,7,["cloudy","cloudy","breezy","night"],"Clouds give solar panels less energy in this simplified model."],
  ["festival-lights","Festival Lights","Storage Planner","forest",16,7,["sunny","breezy","night","cloudy"],"Higher demand makes a battery and balanced sources worth thinking about."],
  ["mountain-storm","Mountain Storm","Island Engineer","mountain",18,8,["breezy","cloudy","night","night"],"Two dark evenings in a row make unreliable surplus tricky."],
  ["northern-glow","Northern Glow","Island Engineer","mountain",18,8,["sunny","cloudy","night","breezy"],"Build a dependable blend that lights homes through every forecast."],
];
export const energyLevels = energyData.map(([id,name,rank,zone,tokens,demand,sky,lesson])=>({
  id,name,rank,zone,tokens,demand,weather:sky.map(key=>({...conditions[key]})),lesson,
}));
