// Optional mission paths for the original Lemonade Lab and Beat Builder.
// Offline, deterministic, and independent from unrestricted four-day lab and freestyle.
export const marketStockChoices=[2,4,6,8,10,12];
const venues=["School Fair","Park Picnic","Neighborhood Market","Summer Camp","Reading Festival",
  "Garden Party","Sports Day","Community Parade","Art Walk","Library Lawn"];
const chapters=["First Customers","Plan the Cups","Reading Demand","Price Detectives","Careful Costs","Market Masters","Forecast & Foot Traffic","Grand Market Challenge"];
export function calculateMarketDay(mission,stock,price){
  const demand=Math.max(1,mission.base-mission.sensitivity*(price-2));
  const sold=Math.min(stock,demand),cost=stock*mission.supplyCost,revenue=sold*price;
  return {demand,sold,cost,revenue,profit:revenue-cost,leftovers:stock-sold};
}
export function bestMarketPlan(mission){
  const options=[];
  for(const stock of marketStockChoices)for(let price=1;price<=5;price++){
    if(stock*mission.supplyCost>mission.startCash)continue;
    options.push({stock,price,...calculateMarketDay(mission,stock,price)});
  }
  return options.sort((a,b)=>b.profit-a.profit||a.leftovers-b.leftovers||a.stock-b.stock)[0]||null;
}
export const marketMissions=Array.from({length:80},(_,i)=>{
  const chapter=Math.floor(i/10),supplyCost=chapter<3?1:2,base=6+(i*3%8)+Math.floor(chapter/2);
  const draft={id:"market-"+String(i+1).padStart(2,"0"),
    name:venues[i%10]+" · "+chapters[chapter],chapter:chapters[chapter],
    base,sensitivity:1+(i%3),supplyCost,startCash:14+chapter*3+(i%3)*2,
    hint:chapter<2?"Make enough cups for expected customers, but avoid leftovers.":
      chapter<4?"Price changes affect demand. Compare revenue with the cost of supplies.":
      "Supplies cost more here. Compare the whole profit, not only money collected."
  };
  const best=bestMarketPlan(draft);
  return {...draft,goal:Math.max(1,best.profit-Math.max(1,5-chapter))};
});

const rhythmChapters=["First Beats","Backbeat Basics","Hi-Hat Helpers","Rhythm Switches","Offbeat Explorers","Festival Finale","Syncopation Lab","Grand Groove Stage"];
const rhythmNames=["Four on the Floor","Backbeat Bounce","Hat Parade","Sunrise Shuffle","Little March",
 "Moonwalk Groove","Corner Clap","Playground Pulse","Dancing Raindrops","Starry Steps"];
const codePositions=[1,3,5,7,9,11];
const noise=seed=>((Math.imul(seed^(seed>>>13),1103515245)+12345)>>>0)%100;
export const beatMissions=Array.from({length:80},(_,i)=>{
 const chapter=Math.floor(i/10),rows=Array.from({length:3},()=>[]);
 for(let col=0;col<16;col++){
   if(i===0){
     if(col%4===0)rows[0].push(col);
     if(col===4||col===12)rows[1].push(col);
     if(col%2===0)rows[2].push(col);
     continue;
   }
   if(col%4===(i%3)||chapter>=2&&noise(i*223+col*17+11)<chapter*3)rows[0].push(col);
   if(col%8===((i%3)*2+2)%8||chapter>=3&&noise(i*139+col*31+17)<chapter*4)rows[1].push(col);
   if(col%(chapter<=1?4:2)===(i+chapter)%(chapter<=1?4:2)
      ||chapter>=4&&noise(i*193+col*19+23)<chapter*5)rows[2].push(col);
 }
 if(i>0){
  // Six reserved hi-hat offbeats encode a unique syncopation for each mission,
  // rather than counting a repeated groove with a different title as new.
  rows[2]=rows[2].filter(col=>!codePositions.includes(col));
  codePositions.forEach((col,bit)=>{if((i>>bit)&1)rows[2].push(col)});
  rows[2].sort((a,b)=>a-b);
 }
 return {id:"beat-"+String(i+1).padStart(2,"0"),
   name:rhythmNames[i%10]+" · "+rhythmChapters[chapter],
   chapter:rhythmChapters[chapter],bpm:[80,100,120,140][Math.min(3,Math.floor(i/15))],rows,
   explanation:chapter<2?"Count each bar of four beats and follow the instrument's highlighted steps.":
     chapter<4?"Silence is part of rhythm. Leave any unlisted steps empty.":
     "Some sounds fall between the main beats. Follow the step numbers carefully."};
});
export function rhythmMatches(tracks,mission){
 return mission.rows.map((notes,row)=>tracks[row].every((on,col)=>Boolean(on)===notes.includes(col)));
}
