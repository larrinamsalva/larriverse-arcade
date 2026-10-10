// Forty new cooperative neighborhoods and fifty-two fresh market missions.
// Generators are deterministic: revisiting a saved level shows the same puzzle.
const supplies = [
  ["Recycled sketchbooks","book"],["Soccer cones","ball"],["Sunflower packets","seed"],["Reusable lunch boxes","bread"],
  ["Rain ponchos","drop"],["Classroom crayons","pencil"],["Tomato seedlings","seed"],["Story cards","book"],
  ["Garden gloves","wood"],["Festival flags","star"],["Trail snacks","apple"],["Library bookmarks","book"],
  ["Craft beads","star"],["Bandage kits","heart"],["Reusable shopping bags","basket"],["Classroom rulers","pencil"],
  ["Community lanterns","star"],["Seedling pots","seed"],["Picnic napkins","bread"],["Berry baskets","apple"],
  ["Birdhouse planks","wood"],["Watering cans","drop"],["Science notebooks","book"],["Painting brushes","pencil"],
  ["Cleanup buckets","drop"],["Bike reflectors","star"],["Neighborhood flyers","book"],["Plant markers","seed"],
  ["Fruit cups","apple"],["Garden stakes","wood"],["Library folders","book"],["Parade ribbons","star"],
  ["Reusable bottles","drop"],["Art canvases","book"],["Beach cleanup gloves","wood"],["Soccer bibs","ball"],
  ["Community garden labels","seed"],["Emergency whistle kits","star"],["Local fair tickets","book"],["Food pantry cartons","bread"],
  ["Rain garden stones","wood"],["Mural paints","pencil"],["Trail map cards","book"],["School lunch trays","bread"],
  ["Pollinator flowers","seed"],["Team first-aid pouches","heart"],["Craft glue sticks","pencil"],["Winter scarves","star"],
  ["Farmers market signs","wood"],["Library reading lights","star"],["Compost pails","seed"],["Community thank-you cards","book"],
];
const bestShopCost = level => {
  let best = Infinity;
  for(let a=0;a<=level.need;a++) for(let b=0;b<=level.need;b++) for(let c=0;c<=level.need;c++) {
    const cart=[a,b,c];
    const units=cart.reduce((n,q,i)=>n+q*level.deals[i].quantity,0);
    if(units>=level.need) best=Math.min(best,cart.reduce((n,q,i)=>n+q*(level.deals[i].price+level.deals[i].fee),0));
  }
  return best;
};
export const tradeExtraLevels = supplies.map(([item, icon], i) => {
  const stage=i+9, need=5+(i%8)+Math.floor(i/13);
  const small=1+(i%3), medium=Math.max(small+1,3+(i%4)), large=medium+2+(i%4);
  const unit=2+(i%4);
  const courier=stage>20?(1+i%3):0, crateFee=stage>35?(2+i%4):stage>20?1:0;
  const deals=[
    {name:"Corner stall · "+small+" "+item.toLowerCase(),quantity:small,price:small*unit,fee:0},
    {name:"Co-op bundle · "+medium+" "+item.toLowerCase(),quantity:medium,price:Math.max(1,medium*unit-(2+i%3)),fee:courier},
    {name:"Delivered crate · "+large+" "+item.toLowerCase(),quantity:large,price:Math.max(1,large*unit-(4+i%5)),fee:crateFee},
  ];
  const draft={name:item+" for "+["the community day","the school club","a neighborhood project","the team workshop"][i%4],icon,need,deals};
  const best=bestShopCost(draft);
  return {...draft,budget:best+(i%3)*2,tip:stage<=20?
    "Compare how many items each pack holds before picking a bargain.":
    stage<=35?"A delivery fee changes the total even when the sticker price looks smaller.":
    "A bigger box can waste supplies. Find enough items without overspending, including every fee."};
});

// A 2x3 map has 360 distinct four-building layouts; visit forty different
// layouts, with each request derived from a real finishable placement.
const neighborhoods = [
  "Cedar Crossing","Otter Outlook","Foxglove Field","Turtle Terrace","Bumble Brook",
  "Pinecone Plaza","Moonflower Grove","Robin Ridge","Willow Walk","Cloudberry Cove",
  "Sunbeam Square","Hedgehog Haven","Fawn Fernbank","Sparrow Springs","Mushroom Meadow",
  "Dandelion Dell","Firefly Ferry","Pebble Point","Juniper Junction","Lilybank Landing",
  "Acorn Avenue","Bluebell Bend","Rabbit Run","Wren Woodlands","Maple Marsh",
  "Cricket Corner","Fernwood Ferry","Tadpole Terrace","Mossstone Market","Dove Hill",
  "Badger Brook","Golden Glade","Seabreeze Square","Thistle Trail","Butterfly Bank",
  "Poppy Passage","Hummingbird Hollow","Birch Basket","Clover Court","Stargazer Steps"
];
const partIds=["park","hut","ramp","bench"];
const neighbors=["Tansy","Pippin","Waffles","Mallow"];
const allPlots=[];
for(let p=0;p<6;p++)for(let h=0;h<6;h++)for(let r=0;r<6;r++)for(let b=0;b<6;b++)
  if(new Set([p,h,r,b]).size===4)allPlots.push([p,h,r,b]);
const close=(a,b)=>Math.abs(a%3-b%3)+Math.abs(Math.floor(a/3)-Math.floor(b/3))===1;
const sentence=(part, rule)=>{
  const places=["top-left plot 1","top-center plot 2","top-right plot 3","bottom-left plot 4","bottom-center plot 5","bottom-right plot 6"];
  const subject={park:"shaded park",hut:"reading hut",ramp:"step-free ramp",bench:"resting bench"}[part];
  if(rule.type==="plot")return "Please put the "+subject+" on "+places[rule.value]+".";
  if(rule.type==="row")return "Our "+subject+" needs the "+(rule.value===0?"shady top":"quiet bottom")+" row.";
  if(rule.type==="column")return "Place the "+subject+" in the "+["left trail","middle","river-side right"][rule.value]+" column.";
  const other={park:"park",hut:"reading hut",ramp:"step-free ramp",bench:"bench"}[rule.other];
  if(rule.type==="adjacent")return "Keep the "+subject+" directly beside the "+other+" (no diagonal shortcut).";
  if(rule.type==="sameRow")return "Build the "+subject+" on the same row as the "+other+".";
  return "Give the "+subject+" a different row from the "+other+".";
};
export const townExtraLevels = neighborhoods.map((name,i)=>{
  const positions=allPlots[(i*47+23)%allPlots.length];
  const rule=(partIndex)=>{
    const at=positions[partIndex], prior=partIndex===0?null:positions[(partIndex+3)%4];
    const other=partIds[(partIndex+3)%4];
    const exact={type:"plot",value:at};
    const byRow={type:"row",value:Math.floor(at/3)};
    const byColumn={type:"column",value:at%3};
    if(i<10)return partIndex<2?exact:(close(at,positions[0])?{type:"adjacent",other:"park"}:byColumn);
    if(i<20)return partIndex===0||partIndex===2?exact:
      (partIndex===3&&close(at,positions[0])?{type:"adjacent",other:"park"}:byRow);
    if(partIndex===0)return exact;
    if(prior!=null&&close(at,prior))return {type:"adjacent",other};
    if(prior!=null&&Math.floor(at/3)===Math.floor(prior/3))return {type:"sameRow",other};
    if(partIndex===3)return {type:"differentRow",other};
    return i%2?byColumn:byRow;
  };
  return {
    id:"council-"+String(i+21).padStart(2,"0")+"-"+name.toLowerCase().replace(/[^a-z]+/g,"-"),
    name, budget:12,
    intro:"Listen to four neighbors in "+name+". Follow the shaded-row, quiet-row and river-side map clues to make the whole neighborhood welcoming.",
    celebration:name+" is ready! Every neighbor can enjoy the new shared space.",
    requests:partIds.map((part,j)=>{
      const r=rule(j);
      return {part,neighbor:name+" · "+neighbors[j],text:sentence(part,r),rule:r};
    }),
  };
});
