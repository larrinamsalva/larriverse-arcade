// Time Trail: sixty distinct, offline-only route adventures across six chapters.
// Keep the original twenty maps first; the forty new maps grow from 6×6 to 7×7.
// Each map is a curated, tested arrangement, not a shuffled copy on every reload.
const BASE_MAPS = [
  {id:"meadow",name:"Meadow Walk",start:20,finish:4,rocks:[6,7,8,16,17,18],flags:[15,5,2],icon:"🌼",lesson:"Collect flags along the meadow edge before visiting the picnic."},
  {id:"river",name:"Riverside Return",start:24,finish:0,rocks:[6,11,16,8,13],flags:[23,12,1],icon:"🌊",lesson:"Choose the riverside stepping stones that connect all three flags."},
  {id:"pines",name:"Pine Loop",start:0,finish:24,rocks:[7,12,17,18,6],flags:[5,10,19],icon:"🌲",lesson:"Explore the pine forest, then return through a safe opening."},
  {id:"ridge",name:"Windy Ridge",start:4,finish:20,rocks:[6,7,8,16,17,18],flags:[3,1,15],icon:"⛰️",lesson:"The flags zigzag around the ridge. Plan a path before you walk."},
  {id:"creek",name:"Forest Creek",start:22,finish:2,rocks:[8,12,17,6,18],flags:[21,10,3],icon:"🍄",lesson:"The creek has twists and turns. Work out when to collect each flag."},
];
const ORIENTATIONS = [
  {id:"north",name:"North"}, {id:"east",name:"East"},
  {id:"south",name:"South"}, {id:"west",name:"West"},
];
export const TRAIL_CHAPTERS = Object.freeze([
  {rank:"Trail Starter",zone:"meadow",icon:"🌱",width:5,flags:3},
  {rank:"Path Scout",zone:"forest",icon:"🌲",width:5,flags:3},
  {rank:"River Guide",zone:"valley",icon:"🦦",width:6,flags:3},
  {rank:"Cloud Navigator",zone:"cloud",icon:"☁️",width:6,flags:4},
  {rank:"Mountain Ranger",zone:"mountain",icon:"⛰️",width:7,flags:4},
  {rank:"Summit Champion",zone:"summit",icon:"🌟",width:7,flags:5},
]);
function turnTile(index, turns, width=5) {
  let row=Math.floor(index/width),col=index%width;
  for(let i=0;i<turns;i++)[row,col]=[col,width-1-row];
  return row*width+col;
}
const opening = ORIENTATIONS.flatMap((orientation,turns)=>BASE_MAPS.map(base=>({
  id:`${base.id}-${orientation.id}`,
  name:`${base.name} · ${orientation.name}`,
  icon:base.icon,lesson:base.lesson,zone:base.id,width:5,
  start:turnTile(base.start,turns),finish:turnTile(base.finish,turns),
  rocks:base.rocks.map(p=>turnTile(p,turns)),
  flags:base.flags.map(p=>turnTile(p,turns)),
}))).map((level,index)=>({...level,rank:TRAIL_CHAPTERS[Math.floor(index/10)].rank,chapter:Math.floor(index/10)}));

// start, destination, flags, impassable rocks. Each row has been route-checked.
// Unlike the opening maps, these 40 maps have independent geometry and goals.
const EXPANDED_MAPS = [
  [12,23,[16,2,25],[28,10,34,29,30,33,22,18]],
  [5,12,[23,16,29],[14,2,13,32,1,6,24,34]],
  [31,4,[34,25,19],[11,33,10,6,7,1]],
  [12,34,[1,18,27],[6,30,11,13,19]],
  [2,33,[6,21,18],[12,16,32,29,35]],
  [32,1,[31,25,22],[3,7,5,17,34,23]],
  [29,3,[20,16,31],[27,21,2,18,26,32,17]],
  [0,31,[6,10,14],[2,21,26,4,27,23]],
  [6,5,[10,17,22],[7,1,0,23,3,20,18]],
  [34,18,[25,8,35],[5,33,21,6,27,24,20,4]],
  [24,23,[15,30,11,7],[28,12,20,1,22,25,18,6]],
  [0,11,[22,7,12,34],[15,10,35,13,3,20,1,19]],
  [34,5,[4,24,11,9],[28,19,10,26,16,1,29,21]],
  [31,17,[34,9,12,10],[35,5,15,11,29,16]],
  [23,12,[1,26,11,25],[27,19,20,21,6,5]],
  [34,18,[10,11,27,1],[30,32,24,22,20,23,8,14,13]],
  [35,1,[18,15,33,26],[6,23,7,11,19,3,9,24,4]],
  [4,24,[17,5,14,21],[15,33,26,7,20,1,3]],
  [6,17,[23,12,31,2],[24,1,0,19,9,4,11,25]],
  [11,33,[29,17,30,19],[15,13,32,7,6,3]],
  [1,48,[28,3,13,22],[18,34,16,31,38,42,15,24,25]],
  [13,35,[48,27,32,44],[14,20,30,41,2,15,37,38,21,11]],
  [21,41,[31,3,14,47],[27,1,15,29,4,5,10,30,43,20]],
  [46,3,[24,13,32,14],[1,36,41,20,39,44,19,43]],
  [21,34,[46,9,16,13],[36,4,32,39,11,38,3,22,27]],
  [47,28,[26,7,5,41],[1,32,11,4,13,46,25,15,17]],
  [3,28,[5,20,17,23],[9,25,22,24,15,13,10,30,12,36]],
  [13,14,[30,45,43,20],[42,5,22,32,29,12,23,26,21]],
  [45,13,[36,40,8,6],[38,37,1,10,39,11,44,19]],
  [0,43,[8,30,27,2],[25,42,31,17,1,34,45,10]],
  [21,6,[16,13,38,35,19],[29,30,22,40,28,17,8,27,20,23,7,0]],
  [47,14,[18,28,20,9,13],[41,19,26,10,25,8,36,21,0,30,16,48]],
  [43,4,[13,12,47,40,2],[32,10,28,34,0,39,45,30,36,25]],
  [28,20,[12,39,47,5,14],[22,0,32,6,2,24,43,23,21,11]],
  [7,48,[0,36,28,39,25],[22,23,12,3,42,29,21,17,40,18]],
  [47,7,[14,20,16,42,48],[34,38,44,6,31,30,22,35,15]],
  [47,21,[31,28,11,43,44],[19,32,17,34,10,37,25,5,30]],
  [20,7,[5,12,21,38,41],[47,18,37,3,28,36,19,39,34,15,30]],
  [5,14,[30,46,25,26,34],[20,33,6,43,3,17,2,38,7,12,48,18]],
  [5,43,[25,23,46,19,20],[17,24,21,15,30,26,18,33,29,8,10]],
];
const TRAIL_NAMES = [
  ["Riverbend Crossing","Willow Bank","Pebble Ford","Heron Hollow","Streamside Path","Otter Crossing","Frog Pond Trail","Waterfall Loop","Mossy Bridge","Blue River Run"],
  ["Cloud Ladder","Skyline Bend","Windmill Trail","Cloudberry Walk","Morning Mist","Rainy Ridge","Rainbow Pass","Cloud Forest","Cirrus Crossing","Twilight Traverse"],
  ["Canyon Gates","Eagle Mountain","Pine Summit","Highland Switchback","Alpine Lake","Red Rock Route","Snowline Walk","Mountain Echo","Hidden Valley","Granite Trail"],
  ["Starlight Switchback","Moonlight Meadow","Comet Crossing","Aurora Ridge","Night Sky Trail","Shooting Star Pass","Lunar Loop","Constellation Path","Galaxy Garden","The Final Summit"],
];
const added = EXPANDED_MAPS.map(([start,finish,flags,rocks],index)=>{
  const chapter=2+Math.floor(index/10),step=index%10,guide=TRAIL_CHAPTERS[chapter];
  return {
    id:`chapter-${chapter+1}-map-${step+1}`,
    name:TRAIL_NAMES[chapter-2][step],
    icon:guide.icon,zone:guide.zone,rank:guide.rank,chapter,width:guide.width,
    lesson:`Collect all ${flags.length} flags on this ${guide.width} by ${guide.width} route. Plan ahead around the rocks to reach the picnic.`,
    start,finish,flags,rocks,
  };
});
export const timeTrailLevels = Object.freeze([...opening,...added]);
// Explore (tile position, collected-flags bitmask), preserving all checkpoints.
export function shortestTrailPath(plan=timeTrailLevels[0]) {
  const {width,start,finish,rocks,flags}=plan;
  const obstacles=new Set(rocks),allFlags=(1<<flags.length)-1;
  const queue=[{tile:start,found:0,path:[start]}];
  const visited=new Set([`${start}:0`]);
  for(let i=0;i<queue.length;i++){
    const {tile,found,path}=queue[i];
    if(tile===finish&&found===allFlags)return path;
    const row=Math.floor(tile/width),col=tile%width;
    for(const next of [
      row>0?tile-width:-1,row<width-1?tile+width:-1,
      col>0?tile-1:-1,col<width-1?tile+1:-1,
    ]){
      if(next<0||obstacles.has(next))continue;
      const at=flags.indexOf(next),updated=found|(at<0?0:1<<at);
      const key=`${next}:${updated}`;
      if(visited.has(key))continue;
      visited.add(key);
      queue.push({tile:next,found:updated,path:[...path,next]});
    }
  }
  return null;
}
export const timeTrailLevelsWithGoals=Object.freeze(timeTrailLevels.map(level=>{
  const path=shortestTrailPath(level);
  if(!path)throw new Error(`Time Trail map ${level.id} cannot be completed`);
  const bestMoves=path.length-1;
  const spareMoves=level.width===5?4:level.width===6?6:8;
  return Object.freeze({...level,bestMoves,stepLimit:bestMoves+spareMoves});
}));
export const timeTrail=timeTrailLevelsWithGoals[0];
