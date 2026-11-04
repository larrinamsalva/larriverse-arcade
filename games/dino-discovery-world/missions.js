// Reviewed introductory paleontology prompts. Each row is a distinct, teachable mission.
// Answer options rotate by mission ID so correct choices do not always appear first.
export const CHAPTERS = Object.freeze([
  { name:"Meet the Dinosaurs", icon:"🦕", mode:"observe" },
  { name:"Fossil Dig", icon:"🦴", mode:"dig" },
  { name:"Prehistoric Habitats", icon:"🌿", mode:"habitat" },
  { name:"Dinosaur Detective", icon:"🔎", mode:"detective" },
  { name:"Oceans & Skies", icon:"🌊", mode:"compare" },
  { name:"Survival Skills", icon:"🥚", mode:"adapt" },
  { name:"Time Traveler", icon:"⌛", mode:"timeline" },
  { name:"Extinction & Discovery", icon:"☄️", mode:"research" }
]);

// scene, observation, question, correct, distractor 1, distractor 2, teaching explanation
const chapters = [
[
["trike","This four-legged plant-eater has three prominent facial horns.","Which dinosaur has three facial horns?","Triceratops","Stegosaurus","Tyrannosaurus","Triceratops lived in the Late Cretaceous and had a large bony frill."],
["rex","Notice the huge head, strong hind legs, and much smaller front arms.","Which famous dinosaur was a large meat-eating theropod?","Tyrannosaurus rex","Apatosaurus","Triceratops","T. rex was a Late Cretaceous predator with large teeth."],
["stego","Look for a row of plates along the back and spikes on the tail.","Which dinosaur is famous for back plates?","Stegosaurus","Velociraptor","Triceratops","Stegosaurus lived in the Late Jurassic and carried plates and tail spikes."],
["longneck","This plant-eater could reach high foliage with its neck.","Which body feature helps a sauropod reach high plants?","A long neck","A sharp beak for catching fish","Broad wings","Many sauropods had long necks and comparatively small heads."],
["raptor","Think of a small, agile, feathered predator, not a giant movie monster.","What covering is supported by Velociraptor fossil evidence?","Feathers","Fur","Fish scales","Quill knobs on Velociraptor bones support feather attachment."],
["trike","Compare horns, frills, teeth, and legs instead of only color.","What kind of food did Triceratops eat?","Plants","Mostly insects caught in flight","Ocean fish","Triceratops had a beak and teeth suited to chewing vegetation."],
["rex","Dinosaurs were a diverse group of reptiles.","Which animal group includes T. rex?","Dinosaurs","Mammals","Pterosaurs","T. rex was a non-avian dinosaur in the theropod group."],
["longneck","Sauropods came in many shapes and sizes.","Which statement about sauropods is most accurate?","They were long-necked plant-eating dinosaurs","They were flying reptiles","Every sauropod lived alongside T. rex","Sauropods were herbivorous dinosaurs; different kinds lived at different times."],
["stego","A dinosaur's skeleton often reveals its posture.","Which dinosaur usually walked on four legs?","Stegosaurus","Tyrannosaurus rex","Velociraptor","Stegosaurus was a four-legged dinosaur with a small head."],
["bird","Look closely at birds you can see today.","Which living animals are classified as dinosaurs?","Birds","Lizards","Crocodiles","Modern birds are the surviving branch of the dinosaur family tree."]
],
[
["fossil","Brush the rock in layers to reveal a curved tooth.","Which fossil can reveal what an animal ate?","A fossil tooth","A cloud","A modern coin","Teeth help paleontologists infer diet, though they check other clues too."],
["fossil","A row of footprints appears beneath the sediment.","What do fossil footprints help scientists study?","Animal movement","The fossil's exact skin color","Today's weather","Trackways can show direction, stride, and sometimes group movement."],
["fossil","A hard fragment with joints and a shaft appears.","Which fossil is most useful for reconstructing a skeleton?","A bone","A raindrop","A leaf still growing","Fossil bones reveal the structure of ancient animals."],
["fossil","An egg-shaped object is partly buried in rock.","What can fossil eggs help scientists investigate?","Reproduction and nesting","How fast a car travels","What day it will rain","Eggs and nests offer clues about prehistoric reproduction."],
["fossil","A ridged print is pressed into ancient sediment.","What is an impression fossil?","A preserved shape or imprint","A living dinosaur","A time machine","Impressions preserve traces of organisms, such as skin or leaves."],
["fossil","You find stone with layers stacked above one another.","Why do scientists record the rock layer of a fossil?","It gives important geological context","It decides the dinosaur's favorite color","It proves the fossil is fake","A fossil's rock layer helps scientists determine relative sequence and environment."],
["fossil","A suspected fossil lies in fragile surrounding rock.","What is the careful first step at a real dig?","Document its position and surroundings","Pull it out quickly","Wash off every trace of sediment","Paleontologists document location and context before collecting specimens."],
["fossil","You uncover a fossilized trail rather than a bone.","A footprint is an example of what?","A trace fossil","A weather forecast","An animal's entire skeleton","Trace fossils record activity, like footprints or burrows."],
["fossil","An unusual pebble might be a fossil, but the shape is unclear.","What should a junior scientist do?","Study evidence and ask an expert","Declare it a new species","Break it open immediately","Scientists compare multiple clues and avoid unsupported guesses."],
["fossil","A field notebook sits next to a newly exposed fossil.","Why make careful notes and drawings?","So discoveries can be checked and studied","To hide the discovery","To decide how loud it roared","Records help others understand where a fossil came from and what was found."]
],
[
["longneck","A large long-necked herbivore browses leafy branches.","What resource must every plant-eating dinosaur find?","Plants to eat","Plastic toys","Gasoline","Herbivores depend on vegetation and the ecosystems that grow it."],
["rex","A predator has teeth adapted to cutting flesh.","Which role describes an animal that hunts prey?","Predator","Producer","Rock layer","Predators feed on other animals and are part of food webs."],
["trike","The ground has plants, water, and patches of shade.","What is a habitat?","The place an organism lives","A single bone","A dinosaur nickname","Habitats contain living things and environmental conditions organisms depend on."],
["stego","Plants capture sunlight and grow.","What starts many land food chains?","Plants using sunlight","Rock dust alone","A fossil cast","Plants make food using sunlight and support herbivores and their predators."],
["longneck","Several plant-eaters share a landscape.","Can different herbivores use different types of plants?","Yes, different feeding habits can reduce competition","No, all plant-eaters eat identical food","Only flying reptiles eat plants","Feeding at different heights or choosing different plants helps species coexist."],
["trike","A dry season changes an ancient landscape.","Which environmental change could affect dinosaur survival?","Less available water","A new videogame","Modern road construction","Water and food availability shape ecosystems."],
["raptor","Small animals, plants, and predators interact in a food web.","What does a food web show?","Connected feeding relationships","Only the largest dinosaur","A list of fossil prices","Food webs connect producers, consumers, and other organisms."],
["stego","A Jurassic landscape looks different from a modern park.","Which statement is most accurate?","Plant communities changed across geological time","All today's flowers covered Jurassic meadows","Every ancient forest was identical","Earth's plant life has evolved over millions of years."],
["longneck","Some dinosaurs lived in groups, but behavior is hard to observe directly.","What can groups of trackways suggest?","Possible movement together","The exact words dinosaurs spoke","A guaranteed family relationship","Multiple trackways can suggest group activity, though interpretation needs care."],
["trike","A flood buries part of a prehistoric landscape.","How can rapid burial sometimes help fossils form?","It can protect remains from disturbance","It instantly turns bone to gold","It guarantees every bone survives","Burial may protect remains long enough for fossilization, though most organisms never fossilize."]
],
[
["rex","Study the large sharp teeth in the skull.","Sharp, serrated teeth often suggest what diet?","Meat-eating","Drinking nectar only","Filtering plankton","Tooth shape is one clue to diet, checked alongside other evidence."],
["trike","Examine the bony shield around this dinosaur's skull.","What is a Triceratops frill made mainly of?","Bone","Feathers","Paper-thin leaves","Triceratops had a large bony frill at the back of its skull."],
["stego","Look at the raised plates and spiked tail.","Which feature may have helped Stegosaurus defend itself?","Tail spikes","A venomous stinger","A shell like a turtle","Stegosaurus had a spiked tail that could be used for defense."],
["longneck","Compare sturdy leg bones with long neck vertebrae.","Which bones make up the neck?","Vertebrae","Teeth","Claws","Neck vertebrae support the structure and movement of the neck."],
["raptor","A curved claw is preserved on the foot.","Why are claws useful evidence?","They can give clues to movement and behavior","They reveal a favorite song","They prove the animal could fly","Scientists study foot anatomy and wear along with other fossils."],
["fossil","A broken skull has an incomplete jaw.","What should a museum label say about an uncertain reconstruction?","Some parts are inferred from evidence","Every missing piece is known exactly","The drawing is a photograph","Scientific reconstructions distinguish fossil evidence from informed interpretation."],
["trike","Two dinosaur skulls have different beaks.","What is one good reason to compare their jaw shapes?","To investigate feeding adaptations","To measure the speed of sound","To identify a fossil's owner by name","Beak and jaw shapes help scientists investigate feeding strategies."],
["rex","Bones show where muscles may have attached.","Which evidence helps estimate how a dinosaur moved?","Skeleton joints and muscle attachment sites","The artist's favorite pose","The dinosaur's imagined nickname","Anatomy and biomechanics help scientists model movement."],
["raptor","You see small bumps in a fossil forearm bone.","What can quill knobs indicate?","Feathers were anchored there","The dinosaur had wheels","The bone is made of metal","Quill knobs are marks where feather structures can attach."],
["fossil","Two fossils look similar but are from different rock layers.","How should scientists decide whether they are one species?","Compare many anatomical features and context","Look only at one color","Assume nearby fossils match","Classifying fossils requires careful comparisons, not a single guess."]
],
[
["flyer","A flying reptile glides above the coast.","Was Pteranodon a dinosaur?","No, it was a pterosaur","Yes, every ancient reptile was a dinosaur","No, it was a mammal","Pterosaurs were flying reptiles related to—but distinct from—dinosaurs."],
["marine","A streamlined prehistoric reptile swims through the sea.","Were mosasaurs dinosaurs?","No, mosasaurs were marine reptiles","Yes, they were aquatic T. rex","Yes, all sea reptiles were dinosaurs","Mosasaurs were marine squamates, not dinosaurs."],
["marine","A plesiosaur moves with four paddle-like flippers.","Which feature helped plesiosaurs swim?","Four flippers","Feathered wings","Long running legs","Plesiosaurs used powerful flippers in the water."],
["flyer","The membrane of a pterosaur wing stretches from an elongated finger.","What supported a pterosaur's wing?","A greatly lengthened finger","A fish fin","An entire tree branch","Pterosaur wings were supported by an elongated fourth finger."],
["bird","A feathered bird crosses the sky today.","Which flying animal is also a living dinosaur?","A bird","A pterosaur","A bat","Birds are avian dinosaurs; pterosaurs and bats belong to different groups."],
["marine","A huge ocean reptile hunts fish.","Where did marine reptiles spend much of their lives?","In the water","In mountain tree nests","On modern city streets","Marine reptiles were adapted to aquatic environments."],
["flyer","A pterosaur fossil has delicate hollow bones.","What helps scientists study ancient flight?","Wing and skeletal anatomy","A fossil's favorite season","A modern aircraft's paint color","Wings, joints, and muscles help researchers model flight."],
["marine","The sea also held ammonites and fish.","Which statement about prehistoric oceans is true?","They held many animal groups, not just marine reptiles","Only dinosaurs lived there","They had no food chains","Ancient oceans contained complex food webs."],
["flyer","A pterosaur and a bird are both flying.","Does flying mean they belong to the same animal group?","No, different groups evolved flight","Yes, all flyers are dinosaurs","Yes, all wings are identical","Flight evolved in separate animal lineages."],
["marine","Compare an ocean reptile with a land dinosaur.","What is the best way to classify an extinct animal?","Study its evolutionary relationships and anatomy","Name it by where it swims","Call every reptile a dinosaur","Habitat alone does not define a dinosaur; ancestry and anatomy matter."]
],
[
["trike","Three facial horns and a frill make an impressive silhouette.","Why might horns be useful to an animal?","They may help in defense or display","They make an animal invisible","They power its legs like batteries","Horns and frills may have had multiple roles, including display and defense."],
["stego","The tail ends in sharp bony spikes.","What feature gave Stegosaurus a possible defensive tool?","Tail spikes","Feathery wings","Venom sacs","Stegosaurus tail spikes could strike threats."],
["raptor","Imagine feathers covering a small theropod.","Which is a possible benefit of feathers besides flight?","Insulation or display","Producing fossil fuel","Breathing underwater","Feathers can help with temperature regulation and visual communication."],
["longneck","A long neck lets an herbivore reach different heights.","What advantage might a long neck provide?","Access to more feeding positions","Ability to fly","The power to breathe fire","Long necks could expand feeding reach."],
["rex","Powerful legs support a heavy predator.","Why are strong limb bones useful?","Supporting weight and movement","Changing the weather","Making plants grow","Bones and muscles support locomotion, but speed estimates need careful evidence."],
["trike","A beak helps crop tough vegetation.","What helps an herbivore process plants?","Specialized beaks and teeth","Airplane propellers","Metal claws on its wings","Feeding anatomy can reveal how herbivores collected and processed food."],
["stego","Dinosaur plates might have served more than one purpose.","What is a careful science statement about Stegosaurus plates?","Their full functions are still studied","They definitely worked as solar panels","They were made of fur","Researchers study possible display and other functions without claiming certainty."],
["raptor","A small predator must sense its surroundings.","What could help an animal locate prey?","Senses such as sight and smell","Reading road signs","Solar-powered wheels","Animals use sensory systems, though fossil evidence cannot reveal every behavior."],
["bird","Feathers have different forms and uses.","What do modern birds demonstrate about feathers?","They can help with flight, insulation, and display","They always mean an animal cannot run","Only extinct dinosaurs had them","Birds show several important functions of feathers."],
["fossil","Scientists find nests near adult and juvenile fossils.","What may nests tell us?","Possible nesting and care behaviors","Exact dinosaur conversations","The time of today's sunset","Fossil nests and young animals provide clues, but behavior must be inferred cautiously."]
],
[
["fossil","Early dinosaur fossils appear in Triassic rocks.","Which came first?","Triassic","Cretaceous","Jurassic","The Mesozoic Era's periods are Triassic, Jurassic, then Cretaceous."],
["stego","Stegosaurus lived long before T. rex.","Which period is Stegosaurus associated with?","Jurassic","Paleogene","Late Cretaceous","Stegosaurus fossils date to the Late Jurassic."],
["rex","Tyrannosaurus rex lived near the end of the age of non-avian dinosaurs.","Which period included T. rex?","Cretaceous","Triassic","Permian","T. rex lived in the Late Cretaceous, tens of millions of years after Stegosaurus."],
["trike","Triceratops and T. rex lived late in the dinosaur age.","Which period included Triceratops?","Cretaceous","Jurassic","Cambrian","Triceratops lived during the Late Cretaceous."],
["longneck","Large long-necked dinosaurs diversified through the Mesozoic.","When did the Jurassic follow?","After the Triassic","After the Cretaceous","After the Ice Age","The Jurassic followed the Triassic about 201 million years ago."],
["stego","The geologic timeline spans millions of years.","Was Stegosaurus alive at the same time as T. rex?","No, they lived many millions of years apart","Yes, they shared one herd","Yes, both lived in modern cities","Stegosaurus was Jurassic; T. rex was Late Cretaceous."],
["bird","Bird-like dinosaurs appeared before the end-Cretaceous extinction.","When did early birds evolve?","During the Jurassic","After humans invented writing","Before the Earth formed","Bird origins trace to small feathered theropods during the Jurassic."],
["fossil","A sedimentary layer lies below another undisturbed layer.","In a simple undisturbed stack, which layer is older?","Usually the lower one","Always the top one","All layers are the same age","The principle of superposition helps order sedimentary layers."],
["marine","Marine reptiles and dinosaurs occupied different habitats during the Mesozoic.","What is the Mesozoic Era?","The era containing the Triassic, Jurassic, and Cretaceous","A single dinosaur species","A kind of fossil tooth","The Mesozoic spans roughly 252 to 66 million years ago."],
["rex","The timeline ends with a major mass extinction.","About when did non-avian dinosaurs go extinct?","66 million years ago","6 thousand years ago","660 years ago","Most non-avian dinosaurs disappeared at the end of the Cretaceous about 66 million years ago."]
],
[
["impact","An asteroid impact changed Earth's environment dramatically.","Which event is strongly linked to the end-Cretaceous extinction?","An enormous asteroid impact","A modern volcanic eruption","A human-made machine","The Chicxulub impact about 66 million years ago was a major cause of mass extinction."],
["bird","Birds survived while non-avian dinosaurs disappeared.","Which dinosaurs survive today?","Birds","Triceratops","Stegosaurus","Living birds are the surviving avian dinosaur lineage."],
["fossil","Thin rock layers contain tiny clues from the past.","What can fossil and rock layers reveal?","How life and environments changed through time","Tomorrow's lottery numbers","Which dinosaur was the loudest","Scientists combine fossils with geology to reconstruct Earth's history."],
["impact","Dust and other debris spread through the atmosphere after a giant impact.","What can reduced sunlight disrupt?","Food chains that rely on photosynthesis","The length of a dinosaur's name","The number of planets","Reduced sunlight can limit plant growth and disrupt food webs."],
["bird","Tiny living birds share ancestry with huge ancient theropods.","Which statement describes modern birds accurately?","They evolved from small theropod dinosaurs","They evolved directly from T. rex","They have no connection to dinosaurs","Birds evolved within a lineage of small feathered theropod dinosaurs."],
["fossil","A researcher compares bones from several places.","Why do scientists share fossil data and methods?","So others can test and improve explanations","So only one person can learn","So facts never change","Science grows through evidence, careful review, and corrections."],
["impact","The world changed after the impact.","Did every species on Earth vanish 66 million years ago?","No, many groups survived and diversified","Yes, even all bacteria vanished","Yes, Earth became lifeless","The event was devastating, but many organisms survived, including birds and mammals."],
["fossil","A newly discovered fossil changes a museum's picture.","What should scientists do when new evidence disagrees with an old idea?","Update the explanation","Hide the new fossil","Keep the old idea forever","Scientific explanations can change when better evidence becomes available."],
["bird","Compare a chicken skeleton with a theropod dinosaur fossil.","Which feature supports the bird-dinosaur connection?","Shared skeletal traits and evolutionary evidence","Having identical body sizes","Living in the same century","Anatomy, fossils, and evolutionary research show that birds are dinosaurs."],
["fossil","Your museum is full of discoveries, but the work continues.","What is a good scientist's next question?","What evidence could we investigate next?","How can we stop anyone asking questions?","Can we ignore missing information?","Curiosity, evidence, and willingness to revise ideas keep paleontology moving."]
]
];

export const MISSIONS = Object.freeze(chapters.flatMap((rows, chapter) => rows.map((row, i) => {
  const id = chapter * 10 + i + 1;
  const [scene, observation, prompt, correct, a, b, explanation] = row;
  const options = [correct, a, b];
  const shift = id % 3;
  const rotated = options.map((_, index) => options[(index + shift) % 3]);
  return Object.freeze({
    id, chapter, scene, observation, prompt,
    options: Object.freeze(rotated),
    answer: (3 - shift) % 3,
    explanation,
    mode: CHAPTERS[chapter].mode
  });
})));

export const SOURCES = Object.freeze([
  { label:"American Museum of Natural History — Dinosaur Facts", url:"https://www.amnh.org/dinosaurs/dinosaur-facts" },
  { label:"Natural History Museum — Extinction", url:"https://www.nhm.ac.uk/discover/dinosaur-extinction.html" },
  { label:"Natural History Museum — Birds are dinosaurs", url:"https://www.nhm.ac.uk/discover/why-are-birds-the-only-surviving-dinosaurs.html" },
  { label:"Natural History Museum of Utah — Pterosaurs", url:"https://nhmu.utah.edu/articles/why-arent-pterosaurs-dinosaurs" }
]);
