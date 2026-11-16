// LarriVerse World Look: first shared visual foundation.
// Live arcade links, existing locally bundled 3D environment paintings,
// and an upgrade ledger for future verified, anatomy-correct character artwork.
// Never infer this artwork is a screenshot of the playable game.
export const VISUAL_STYLE_VERSION='real-world-foundation-1';
export const VISUAL_STANDARDS=Object.freeze({
  rendering:'cinematic educational animation',
  faces:'expressive anatomically legible eyes, noses, ears, hair and emotions',
  figures:'full bodies with joints, shaped hands and fingers, clothing and shoes',
  creatures:'recognizable real-world proportions, species marks and habitat cues',
  materials:'grounded wood, metal, fabric, water, foliage and objects with form',
  scenes:'clear foreground, middleground, background, light and cast shadows',
  safety:'non-graphic age-appropriate depictions, no fake species or injury diagnosis',
  performance:'locally bundled still assets, no required GPU, no external requests',
  inclusive:'descriptive text, keyboard navigation, readable phone layouts and dark themes'
});
export const PORTAL_STORIES=Object.freeze([
 Object.freeze({
  id:'repair-cafe',
  kicker:'BUILD & CREATE',
  subtitle:'A little workshop, a big idea',
  description:'Discover tools, everyday repairs and the joy of figuring things out together.',
  scene:'workshop',
  intendedFocus:'real materials, working objects and friendly character anatomy'
 }),
 Object.freeze({
  id:'garden-guardians',
  kicker:'NATURE & DISCOVERY',
  subtitle:'A garden full of possibilities',
  description:'Notice plants, pollinators and how a living garden changes.',
  scene:'garden',
  intendedFocus:'layered leaves, flowers, real plant shapes and warm daylight'
 }),
 Object.freeze({
  id:'robot-rover',
  kicker:'EXPLORE & INVENT',
  subtitle:'A little explorer, a huge world',
  description:'Explore places, make choices and learn from every try.',
  scene:'explorer',
  intendedFocus:'believable objects, rich landscape and expressive helpers'
 })
]);
export const visualPortalModels=catalog=>{
 const byId=new Map(catalog.map(game=>[game.id,game]));
 return PORTAL_STORIES.map(story=>{
  const game=byId.get(story.id);
  if(!game||!game.available)throw new Error('Visual world portal must link to a playable game: '+story.id);
  return {story,game};
 });
};
export const worldArtPosition=game=>{
 const art=Number.isFinite(Number(game.art))?Math.max(0,Math.floor(Number(game.art))):0;
 return '--art-x:'+(art%4*100/3)+'%;--art-y:'+(Math.floor(art/4)*(game.artSet==='expedition'?100:50))+'%';
};
// The initial portal images reuse existing bundled 3D world art; as each
// cabinet gets its bespoke visual production artwork, swap art sources here.
// This separation makes gradual upgrades independent of mission data/saves.
