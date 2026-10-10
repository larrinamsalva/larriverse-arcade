// Curated local-only learning themes: 60 different word sets in six progressive chapters.
const CHAPTER_DATA=[{"name":"Garden Detectives","emoji":"🌱","size":6,"directions":["E","S"],"levels":[["SEED","SOIL","ROOT","LEAF"],["RAIN","BEAN","POT","SUN"],["STEM","BLOOM","MOSS","HOSE"],["PEAR","APPLE","GROW","CROP"],["BEE","BUD","WORM","WEED"],["MINT","ROSE","BARK","TREE"],["WATER","PLANT","EARTH","SPROUT"],["MULCH","PETAL","GREEN","GRAIN"],["GRASS","SHOVEL","SUNNY","FRUIT"],["BEANS","FLOWER","SQUASH","GARDEN"]],"facts":["Seeds sprout with water and warmth.","Soil helps support plant roots.","Mulch helps keep the ground moist.","Pollinators visit garden flowers.","A trellis supports climbing plants.","Plant scraps can become compost.","Some crops need more sun than others.","Roots take up water from soil.","Harvest carefully to protect plants.","Saving seeds can start next season's garden."]},{"name":"Sky & Weather","emoji":"🌦️","size":7,"directions":["E","S","W","N"],"levels":[["CLOUD","BREEZE","RAIN","SUN","FOG"],["STORM","SUNSET","WIND","GUST","SKY"],["MIST","FROST","WARM","COLD","RAIN"],["SLEET","HAIL","SNOW","ICE","GLOW"],["THUNDER","RAINBOW","WIND","CLOUD","FOG"],["DRIZZLE","BREEZE","MIST","SUN","SNOW"],["CUMULUS","CLOUD","STORM","RADAR","HEAT"],["RAINBOW","SKY","GUST","HUMID","COLD"],["WEATHER","FREEZE","SLEET","LIGHT","RAIN"],["DROUGHT","RAINBOW","THUNDER","CLOUD","FROST"]],"facts":["Weather forecasts are estimates.","Puffy clouds may be cumulus clouds.","Wind has speed and direction.","Fog is cloud close to the ground.","A rain gauge measures precipitation.","Storms can bring lightning.","Snowflakes form from ice crystals.","Radar helps track rain and storms.","Weather maps use symbols.","Go indoors if you hear thunder."]},{"name":"Kind Community","emoji":"🤝","size":8,"directions":["E","S","SE","SW"],"levels":[["SHARE","HELP","SMILE","TEAM","CARE"],["THANKS","FRIEND","KIND","TURN","FAIR"],["LISTEN","WELCOME","BRAVE","TRUST","PLAY"],["GENTLE","HONEST","PEACE","SPEAK","CALM"],["RESPECT","PEOPLE","CHOOSE","AGREE","VOICE"],["FORGIVE","PATIENT","HELPER","FRIEND","BOUND"],["COMFORT","INCLUDE","HONEST","TRUST","SMILE"],["TEAMWORK","KINDNESS","EMPATHY","SHARE","LISTEN"],["TOGETHER","SUPPORT","RESPECT","WELCOME","CARE"],["NEIGHBOR","KINDNESS","FRIEND","AGREE","CHOOSE"]],"facts":["Listening shows others respect.","Welcoming someone can ease nerves.","Fairness means sharing chances.","Kindness includes respecting 'no'.","Ask before borrowing belongings.","Trust grows through honesty.","An apology can include repair.","Everyone deserves to be included.","Teamwork is easier with patience.","Neighbors can help each other."]},{"name":"Builder Workshop","emoji":"🛠️","size":9,"directions":["E","S","W","N","SE","SW","NE","NW"],"levels":[["HAMMER","RULER","PLANK","NAIL","TOOL","WOOD"],["WRENCH","SCREW","LEVEL","BRACE","BEAM","SAW"],["DRIVER","SOCKET","METAL","PAINT","PLANE","SAND"],["SQUARE","RIVET","HINGE","BOLT","GLUE","TAPE"],["MEASURE","SHAPES","LUMBER","NAIL","PIPE","JOINT"],["DESIGN","TIMBER","CANVAS","CABLE","TOOLS","JOINT"],["REPAIR","SAFETY","GLASSES","HAMMER","PLANK","BEAM"],["BLUEPRINT","SCAFFOLD","LEVEL","BRACE","RULER","WOOD"],["TOOLBOX","WORKSHOP","MATERIAL","JOIN","SCREW","GLUE"],["BUILDING","STRUCTURE","MEASURE","SUPPORT","TIMBER","REPAIR"]],"facts":["Measure before using any tool.","A level helps check straight lines.","Use safety equipment with an adult.","Different materials have different jobs.","A plan makes building easier.","Inspect an object before repairing.","Goggles can protect eyes.","Blueprints show how parts fit.","Reuse safe supplies when possible.","Testing helps find weak structures."]},{"name":"Money & Choices","emoji":"🪙","size":10,"directions":["E","S","W","N","SE","SW","NE","NW"],"levels":[["COINS","PRICE","SAVE","NEED","WANT","SHOP"],["BUDGET","CHANGE","CASH","COST","BUY","SELL"],["WALLET","VALUE","SPEND","SAVE","CENTS","GOAL"],["CHOICE","MARKET","PRICE","TOTAL","BILLS","PLAN"],["RECEIPT","COMPARE","CREDIT","CASH","NEED","SAVE"],["SAVINGS","BALANCE","INCOME","PRICE","COINS","GOAL"],["WARRANTY","DISCOUNT","RECEIPT","VALUE","SPEND","COST"],["SHOPPING","PURCHASE","COMPARE","SAVING","BUDGET","WANT"],["INTEREST","DONATION","BALANCE","CHOICE","TOTAL","MONEY"],["PRIORITY","FINANCES","EXPENSE","SAVINGS","RECEIPT","BUDGET"]],"facts":["A budget is a spending plan.","Needs and wants are different.","Saving a little can add up.","Compare total prices when shopping.","A receipt records purchases.","A goal can guide savings.","A warranty has conditions.","A budget supports better choices.","Borrowing may involve interest.","Priorities help you make choices."]},{"name":"World Explorer","emoji":"🌍","size":12,"directions":["E","S","W","N","SE","SW","NE","NW"],"levels":[["ATLAS","MAP","TRAIL","NORTH","SOUTH","RIVER","HILL"],["ISLAND","OCEAN","EAST","WEST","ROUTE","LAKE","PATH"],["COMPASS","VALLEY","DESERT","FOREST","BRIDGE","LAKE","RIVER"],["MOUNTAIN","HARBOR","TEMPLE","MUSEUM","ATLAS","EAST","WEST"],["LONGITUDE","EQUATOR","MAPS","OCEAN","DESERT","NORTH","SOUTH"],["LATITUDE","JOURNEY","ISLAND","ROUTE","VALLEY","FOREST","PATH"],["CONTINENT","LANDMARK","SCENERY","COMPASS","MUSEUM","HILL","LAKE"],["NAVIGATE","EXPLORER","WILDLIFE","HABITAT","COAST","FOREST","RIVER"],["ADVENTURE","DISCOVERY","COMPASS","MOUNTAIN","CULTURE","JOURNEY","OCEAN"],["EXPLORATION","NAVIGATION","LANDMARK","TRAVEL","CONTINENT","HABITAT","MUSEUM"]],"facts":["An atlas is a book of maps.","A route helps with navigation.","Compasses show direction.","A map scale shows distance.","The equator circles Earth.","Latitude measures north or south.","Continents are large land areas.","Habitats are homes for living things.","Explore with safety and respect.","Maps help us plan adventures."]}];
export const WORD_SEARCH_CHAPTERS=Object.freeze(CHAPTER_DATA.map((ch,i)=>Object.freeze({id:i,name:ch.name,emoji:ch.emoji,size:ch.size,from:i*10+1,to:i*10+10})));
export const WORD_SEARCH_LEVELS=Object.freeze(CHAPTER_DATA.flatMap((ch,chapter)=>ch.levels.map((originalWords,position)=>Object.freeze({
  id:chapter*10+position+1,chapter,chapterName:ch.name,emoji:ch.emoji,
  size:ch.size,words:Object.freeze(position<4?originalWords.slice(0,-1):[...originalWords]),
  directions:Object.freeze([...ch.directions]),fact:ch.facts[position],title:`${ch.name} · Level ${position+1}`
}))));
const DIRECTIONS={E:[0,1],S:[1,0],W:[0,-1],N:[-1,0],SE:[1,1],SW:[1,-1],NE:[-1,1],NW:[-1,-1]};
function random(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;}}
function shuffle(values,next){for(let i=values.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[values[i],values[j]]=[values[j],values[i]];}return values;}
export function lineCells(start,end,size){
 if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<0||start>=size*size||end>=size*size)return [];
 const r0=Math.floor(start/size),c0=start%size,r1=Math.floor(end/size),c1=end%size;
 const dr=Math.sign(r1-r0),dc=Math.sign(c1-c0);
 if(!(r0===r1||c0===c1||Math.abs(r1-r0)===Math.abs(c1-c0)))return [];
 const length=Math.max(Math.abs(r1-r0),Math.abs(c1-c0));
 return Array.from({length:length+1},(_,i)=>(r0+dr*i)*size+c0+dc*i);
}
export function createWordSearch(level){
 if(!level||!Number.isInteger(level.id)||!Number.isInteger(level.size))throw Error("Invalid word-search level");
 const size=level.size,words=level.words,dirs=level.directions;
 for(let attempt=0;attempt<120;attempt++){
  const next=random(0xA65BD+level.id*982451653+attempt*227),board=Array(size*size).fill(""),placed=[];
  const order=[...words].sort((a,b)=>b.length-a.length);
  let failed=false;
  for(const word of order){
   const choices=[];
   for(let row=0;row<size;row++)for(let col=0;col<size;col++)for(const key of dirs){
    const [dr,dc]=DIRECTIONS[key];
    const endR=row+dr*(word.length-1),endC=col+dc*(word.length-1);
    if(endR<0||endC<0||endR>=size||endC>=size)continue;
    choices.push({row,col,dr,dc,key});
   }
   shuffle(choices,next);
   let fit=null;
   for(const choice of choices){
    const cells=Array.from({length:word.length},(_,k)=>(choice.row+choice.dr*k)*size+choice.col+choice.dc*k);
    if(cells.every((index,i)=>!board[index]||board[index]===word[i])){fit={word,cells,direction:choice.key};break;}
   }
   if(!fit){failed=true;break;}
   fit.cells.forEach((index,i)=>board[index]=word[i]);placed.push(fit);
  }
  if(failed)continue;
  for(let i=0;i<board.length;i++)if(!board[i])board[i]=String.fromCharCode(65+Math.floor(next()*26));
  return {size,letters:board.join(""),placements:words.map(word=>{
   const match=placed.find(x=>x.word===word);
   if(!match)throw Error("Missing placed word "+word);
   return {word,cells:[...match.cells],direction:match.direction};
  })};
 }
 throw Error("Word Search puzzle "+level.id+" cannot fit all words");
}
export function matchWord(placement,selection){
 if(!Array.isArray(selection)||selection.length!==placement.cells.length)return false;
 return placement.cells.every((cell,i)=>selection[i]===cell)||placement.cells.every((cell,i)=>selection[selection.length-1-i]===cell);
}
