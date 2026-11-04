// Three original fictional training specimens, not claims about a particular fossil locality.
// Every sample teaches the difference between evidence and inference.
export const SPECIMENS=Object.freeze([
 Object.freeze({
  id:"bone",name:"Mineralized Bone",icon:"🦴",kind:"body fossil",
  observation:"A hard shape sits inside the rock. It has a long shaft and rounded ends.",
  evidence:"The preserved shape resembles part of an animal's bone, but it does not tell us which species it belonged to.",
  question:"What can a fossilized bone tell a paleontologist?",
  choices:Object.freeze(["It is physical evidence of an ancient organism","Exactly what color the dinosaur's skin was","The name of the first person who found it"]),
  answer:0,
  explanation:"A fossilized bone is a body fossil. Its structure can reveal anatomy, but a single fragment cannot tell us every detail of an animal."
 }),
 Object.freeze({
  id:"track",name:"Footprint Impression",icon:"🐾",kind:"trace fossil",
  observation:"A shallow three-toed impression is preserved in the stone.",
  evidence:"The impression can show that an animal stepped on soft ground. It does not preserve the animal's foot itself.",
  question:"What kind of fossil evidence is a preserved footprint?",
  choices:Object.freeze(["A preserved dinosaur bone","A trace fossil showing past activity","A photograph taken by a dinosaur"]),
  answer:1,
  explanation:"A footprint is a trace fossil. Trace fossils are signs of what an organism did, such as walking or burrowing."
 }),
 Object.freeze({
  id:"leaf",name:"Leaf Impression",icon:"🍃",kind:"plant fossil",
  observation:"A leaf-shaped outline and branching veins appear in the fine rock.",
  evidence:"The impression reveals a plant's shape. It cannot tell us the exact original leaf color.",
  question:"Which conclusion is supported by this leaf impression?",
  choices:Object.freeze(["Every dinosaur ate this specific leaf","The fossil proves the leaf was bright purple","A plant with leaf veins grew in the ancient environment"]),
  answer:2,
  explanation:"Plant impressions are important body-fossil evidence. Shapes and veins can help us study ancient vegetation, without proving the leaf's exact color."
 })
]);
export const SPECIMEN_IDS=Object.freeze(SPECIMENS.map(s=>s.id));
export const BRUSH_STEPS=4;
export function specimenById(id){return SPECIMENS.find(s=>s.id===id)||SPECIMENS[0];}
