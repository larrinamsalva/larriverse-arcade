// Self-contained, evidence-first museum trail. Each period is a separate time portal:
// the animals in different periods must NEVER be depicted as living together.
const site = (id, name, x, z, kind, clue, fact) =>
  Object.freeze({id,name,x,z,kind,clue,fact});

export const PERIODS = Object.freeze([
  Object.freeze({
    id:"triassic", label:"Triassic", years:"About 252–201 million years ago",
    icon:"🌱", landscape:"Early dinosaur country",
    note:"Early dinosaurs shared Earth with other reptiles. Flowering plants and grass were not yet widespread.",
    ground:"#b5bb79", sky:"#a6d6d4", hills:"#668d78",
    sites:Object.freeze([
      site("coelophysis","Coelophysis", -3,6,"small-theropod",
        "Look for a lightweight animal moving on two legs.",
        "Coelophysis was a small, slender, meat-eating theropod from the Late Triassic."),
      site("plateosaurus","Plateosaurus", 3,10,"prosauropod",
        "Notice the long neck and small head of an early plant-eating dinosaur.",
        "Plateosaurus was a large, long-necked plant-eating dinosaur of Late Triassic Europe."),
      site("conifer-grove","Conifer Grove", 0,15,"forest",
        "What plants grew long before lawns and flowering gardens?",
        "Conifers, cycads, and ferns were important parts of many Triassic landscapes.")
    ])
  }),
  Object.freeze({
    id:"jurassic", label:"Jurassic", years:"About 201–145 million years ago",
    icon:"🌿", landscape:"Fern forest and giant footsteps",
    note:"This portal shows Late Jurassic reconstructions. It does not show Cretaceous T. rex or Triceratops.",
    ground:"#94c17d", sky:"#8ccde5", hills:"#618c89",
    sites:Object.freeze([
      site("stegosaurus","Stegosaurus", -3,6,"plates",
        "Count the back plates and look for spikes on the tail.",
        "Stegosaurus was a Late Jurassic plant-eater with distinctive plates and tail spikes."),
      site("diplodocus","Diplodocus", 3,10,"sauropod",
        "Follow the animal's long neck and tail.",
        "Diplodocus was a long-necked sauropod that lived in the Late Jurassic of North America."),
      site("allosaurus","Allosaurus", 0,15,"large-theropod",
        "This hunter lived long before Tyrannosaurus rex.",
        "Allosaurus was a large carnivorous theropod from the Late Jurassic.")
    ])
  }),
  Object.freeze({
    id:"cretaceous", label:"Cretaceous", years:"About 145–66 million years ago",
    icon:"🦖", landscape:"Late Cretaceous floodplain",
    note:"This portal features Late Cretaceous North American animals and a fossil-learning station.",
    ground:"#8cb98b", sky:"#91d4e9", hills:"#578d7c",
    sites:Object.freeze([
      site("triceratops","Triceratops", -3,6,"horns",
        "Look for three horns and a large frill.",
        "Triceratops was a Late Cretaceous plant-eating ceratopsian with three facial horns."),
      site("tyrannosaurus","Tyrannosaurus rex", 3,10,"trex",
        "Study a powerful skull and strong hind legs.",
        "Tyrannosaurus rex was a large meat-eating theropod near the end of the Cretaceous."),
      site("fossil-bluff","Fossil Bluff", 0,15,"fossil",
        "Find the stone layers and the clues they protect.",
        "The position of fossils in rock layers helps paleontologists interpret past life. Not every bone becomes a fossil.")
    ])
  })
]);

export const ALL_SITES = Object.freeze(PERIODS.flatMap(p=>p.sites));
export const SITE_IDS = Object.freeze(ALL_SITES.map(s=>s.id));

export function nearestSite(periodId,x,z) {
  const period = PERIODS.find(p=>p.id===periodId) || PERIODS[0];
  return period.sites.reduce((nearest,site)=>{
    const distance=Math.hypot(site.x-x,site.z-z);
    return !nearest || distance<nearest.distance ? {site,distance} : nearest;
  },null);
}
