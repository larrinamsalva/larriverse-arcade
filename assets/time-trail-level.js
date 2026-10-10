// A twenty-map, offline route-planning campaign. Every destination is reachable.
// Five distinct map puzzles appear in four orientations, with four advancement ranks.
const MAPS = [
  { id:"meadow", name:"Meadow Walk", start:20, finish:4, rocks:[6,7,8,16,17,18], flags:[15,5,2], icon:"🌼", lesson:"Collect flags along the meadow edge before visiting the picnic." },
  { id:"river", name:"Riverside Return", start:24, finish:0, rocks:[6,11,16,8,13], flags:[23,12,1], icon:"🌊", lesson:"Choose the riverside stepping stones that connect all three flags." },
  { id:"pines", name:"Pine Loop", start:0, finish:24, rocks:[7,12,17,18,6], flags:[5,10,19], icon:"🌲", lesson:"Explore the pine forest, then return through a safe opening." },
  { id:"ridge", name:"Windy Ridge", start:4, finish:20, rocks:[6,7,8,16,17,18], flags:[3,1,15], icon:"⛰️", lesson:"The flags zigzag around the ridge. Plan a path before you walk." },
  { id:"creek", name:"Forest Creek", start:22, finish:2, rocks:[8,12,17,6,18], flags:[21,10,3], icon:"🍄", lesson:"The creek has twists and turns. Work out when to collect each flag." },
];
const ORIENTATIONS = [
  { id:"north", name:"North" },
  { id:"east", name:"East" },
  { id:"south", name:"South" },
  { id:"west", name:"West" },
];
const RANKS = ["Trail Starter","Path Scout","Forest Navigator","Route Champion"];
function turnTile(index, turns, width=5) {
  let row = Math.floor(index / width), col = index % width;
  for (let i=0;i<turns;i++) [row,col] = [col,width-1-row];
  return row*width+col;
}
function rotated(base, turns) {
  const orientation=ORIENTATIONS[turns];
  return {
    id:`${base.id}-${orientation.id}`,
    name:`${base.name} · ${orientation.name}`,
    icon:base.icon,
    lesson:base.lesson,
    zone:base.id,
    rank:RANKS[turns],
    width:5,
    start:turnTile(base.start, turns),
    finish:turnTile(base.finish, turns),
    rocks:base.rocks.map(p=>turnTile(p,turns)),
    flags:base.flags.map(p=>turnTile(p,turns)),
  };
}
export const timeTrailLevels = ORIENTATIONS.flatMap((_,turns)=>MAPS.map(base=>rotated(base,turns)));

// Breadth-first search on position + collected flags proves the route is achievable.
// The returned path includes the start and picnic finish.
export function shortestTrailPath(plan=timeTrailLevels[0]) {
  const { width, start, finish, rocks, flags }=plan;
  const obstacles=new Set(rocks);
  const fullMask=(1<<flags.length)-1;
  const queue=[{tile:start,found:0,path:[start]}];
  const visited=new Set([`${start}:0`]);
  for(let i=0;i<queue.length;i++){
    const {tile,found,path}=queue[i];
    if(tile===finish&&found===fullMask)return path;
    const row=Math.floor(tile/width),col=tile%width;
    for(const next of [
      row>0?tile-width:-1,row<width-1?tile+width:-1,
      col>0?tile-1:-1,col<width-1?tile+1:-1,
    ]){
      if(next<0||obstacles.has(next))continue;
      const idx=flags.indexOf(next);
      const nextFound=found|(idx<0?0:1<<idx);
      const key=`${next}:${nextFound}`;
      if(visited.has(key))continue;
      visited.add(key);
      queue.push({tile:next,found:nextFound,path:[...path,next]});
    }
  }
  return null;
}
export const timeTrailLevelsWithGoals=timeTrailLevels.map(level=>{
  const path=shortestTrailPath(level);
  if(!path)throw new Error(`Time Trail map ${level.id} cannot be completed`);
  return Object.freeze({...level,bestMoves:path.length-1,stepLimit:path.length+3});
});
// Keep the first level available for any existing initial-map consumers.
export const timeTrail=timeTrailLevelsWithGoals[0];
