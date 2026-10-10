import { newPantryChallenges } from "./pantry-extra-challenges.js";

export const expeditions = [
  { id: "bridge-buddies", title: "Bridge Buddies", icon: "🌉", topic: "Build & create", category: "Little engineers", age: "8+", minutes: "12 min", art: 0, mode: "bridge", skill: "Test, improve, try again", desc: "Build and test sixty distinct bridge-load plans with unlimited free supports, from first spans to reinforced summit crossings.", mission: "Build four strong spans per level across sixty increasingly demanding crossings. All supports stay free and replaceable. Move through twelve bridge-builder ranks and carry each cargo safely.", take: "Choose the right support for the job. Test a small model, notice what happened, and change one thing at a time." },
  { id: "water-works", title: "Water Works", icon: "💧", topic: "Planet", category: "Flow & resources", age: "7+", minutes: "12 min", art: 1, mode: "pipes", skill: "See how a system connects", desc: "Turn the pipes through twenty advancing flow puzzles and bring water through the toy filter to town.", mission: "Rotate each pipe network from the reservoir to town. Pass through the toy filter while advancing from Flow Finder to Waterworks Master.", take: "Trace a problem from its starting point and check each connection. This toy filter does not make real water safe to drink." },
  { id: "harbor-helpers", title: "Harbor Helpers", icon: "⛵", topic: "Adventures", category: "Cooperative adventures", age: "8+", minutes: "12 min", art: 2, mode: "harbor", skill: "Plan deliveries together", desc: "Load your boat for twenty advancing island deliveries and bring each community exactly what it requested.", mission: "Read each island request, choose the matching crates, stay within the boat limit, and advance through twenty harbor routes.", take: "A useful delivery starts with listening. Plan loads and routes together so supplies reach the neighbors who asked for them." },
  { id: "pantry-picnic", title: "Pantry Picnic", icon: "🥪", topic: "Everyday life", category: "Little life skills", age: "7+", minutes: "10 min", art: 3, mode: "pantry", skill: "Use what you already have", desc: "Explore sixty food-planning questions in themed picnic adventures, ten per round.", mission: "Plan ten picnic boxes per round across sixty different food challenges. Follow each request, choose one main and two produce portions, use marked leftovers, and see every question before a repeat.", take: "Check what you already have before getting more. Planning portions can reduce waste; ask an adult about allergies, food preparation, and safe storage." },
  { id: "compass-cove", title: "Compass Cove", icon: "🧭", topic: "Adventures", category: "Map adventures", age: "7+", minutes: "12 min", art: 4, mode: "compass", skill: "Read landmarks and directions", desc: "Explore a tiny island through twenty advancing compass clues and hidden treasures.", mission: "Find twenty treasures by following clues from island landmarks. Advance from Shore Scout to Master Navigator while north stays up on the map.", take: "Start from a landmark you can identify. A map and a compass help you explain a route and check where a direction will take you." },
  { id: "cipher-club", title: "Cipher Club", icon: "🔎", topic: "Digital life", category: "Secret-code workshop", age: "8+", minutes: "12 min", art: 5, mode: "cipher", skill: "Make meaning with a shared key", desc: "Turn the code wheel and solve twenty messages that grow from three to five letters.", mission: "Use the toy A–H alphabet and a shared number key to encode or decode twenty clubhouse messages. Advance through four code ranks as the words grow longer.", take: "A shared rule can change how a message looks. This tiny code is easy to break and must never be used to protect passwords or real secrets." },
  { id: "trade-town", title: "Trade Town", icon: "🪙", topic: "Money", category: "Smart shopping", age: "8+", minutes: "7 min", art: 6, mode: "trade", skill: "Compare the whole deal", desc: "Visit the market for eight shopping challenges and compare bundles, prices, and extra fees.", mission: "Fill eight shopping requests within their pretend budgets. Compare bundle sizes, unit prices, and delivery fees. You can return items before checkout.", take: "The biggest pack is not always the best fit. Compare the whole cost, including fees, with how much you actually need." },
  { id: "critter-council", title: "Critter Council", icon: "🌱", topic: "People", category: "Community builders", age: "8+", minutes: "12 min", art: 7, mode: "town", skill: "Design for different needs", desc: "Listen to eighty neighbor requests while building twenty welcoming woodland neighborhoods.", mission: "Advance through twenty town-planning levels. Place a shaded park, quiet reading hut, step-free ramp, and bench so every set of four neighbor requests is met.", take: "People can need different things from the same place. Ask, listen, and design so more neighbors can take part comfortably." },
].map(world => ({ ...world, artSet: "expedition" }));

export const bridgeParts = [
  { id: "plank", name: "Plank", capacity: 3 },
  { id: "beam", name: "Beam", capacity: 6 },
  { id: "triangle", name: "Triangle brace", capacity: 9 },
];
const bridgeBaseLevels = [
  { name: "Creek crossing", loads: [4, 7, 5, 8], scene: "creek", vehicle: "timber", landmark: "rock", cargo: "Trail timber" },
  { name: "Market crossing", loads: [3, 6, 9, 6], scene: "market", vehicle: "produce", landmark: "market", cargo: "Market produce" },
  { name: "Festival crossing", loads: [8, 3, 5, 7], scene: "festival", vehicle: "festival", landmark: "music", cargo: "Festival drums" },
  { name: "Library crossing", loads: [2, 5, 8, 4], scene: "library", vehicle: "books", landmark: "book", cargo: "Library books" },
  { name: "Garden crossing", loads: [6, 6, 3, 9], scene: "garden", vehicle: "garden", landmark: "seed", cargo: "Garden plants" },
  { name: "River crossing", loads: [9, 4, 6, 2], scene: "river", vehicle: "water", landmark: "drop", cargo: "Water barrels" },
  { name: "Night crossing", loads: [5, 8, 3, 7], scene: "night", vehicle: "lanterns", landmark: "star", cargo: "Night lanterns" },
  { name: "Parade crossing", loads: [7, 9, 6, 3], scene: "parade", vehicle: "parade", landmark: "music", cargo: "Parade decorations" },
  { name: "Mountain pass", loads: [4, 9, 6, 8], scene: "mountain", vehicle: "tools", landmark: "mountain", cargo: "Repair tools" },
  { name: "Farm road bridge", loads: [3, 7, 5, 9], scene: "farm", vehicle: "harvest", landmark: "seed", cargo: "Harvest crates" },
  { name: "Coastal mail span", loads: [8, 6, 4, 7], scene: "coast", vehicle: "mail", landmark: "lighthouse", cargo: "Island mail bags" },
  { name: "School creek bridge", loads: [5, 3, 8, 6], scene: "school", vehicle: "science", landmark: "book", cargo: "Science kits" },
  { name: "Canyon trail crossing", loads: [9, 7, 3, 5], scene: "canyon", vehicle: "bikes", landmark: "rock", cargo: "Trail bicycles" },
  { name: "Snowmelt crossing", loads: [6, 4, 9, 7], scene: "snow", vehicle: "blankets", landmark: "mountain", cargo: "Warm blankets" },
  { name: "Solar field span", loads: [7, 5, 8, 3], scene: "solar", vehicle: "solar", landmark: "sun", cargo: "Solar panels" },
  { name: "Orchard bridge", loads: [3, 8, 6, 9], scene: "orchard", vehicle: "orchard", landmark: "apple", cargo: "Orchard baskets" },
  { name: "Harbor rescue span", loads: [9, 6, 4, 8], scene: "harbor", vehicle: "rescue", landmark: "lighthouse", cargo: "Rescue supplies" },
  { name: "Community art walk", loads: [4, 5, 7, 9], scene: "art", vehicle: "art", landmark: "star", cargo: "Community artwork" },
  { name: "Sports park crossing", loads: [8, 9, 5, 6], scene: "sports", vehicle: "sports", landmark: "star", cargo: "Sports equipment" },
  { name: "Sunrise finale bridge", loads: [9, 8, 7, 9], scene: "sunrise", vehicle: "celebration", landmark: "sun", cargo: "Celebration lights" },
];
const bridgeSignatures = new Set(bridgeBaseLevels.map(level => level.loads.join(":")));
const harderBridges = [1, 2].flatMap(chapter => bridgeBaseLevels.map((base, index) => {
  let loads;
  // Twenty distinct four-span engineering plans per chapter. Later loads
  // require stronger braces, but every span remains solvable with free tools.
  for (let attempt = 0; attempt < 200; attempt++) {
    let number = chapter === 1 ? 65 + index * 27 + attempt : 7 + index * 3 + attempt;
    const minimum = chapter === 1 ? 5 : 7, baseRange = chapter === 1 ? 5 : 3;
    loads = Array.from({length: 4}, () => {
      const value = minimum + number % baseRange;
      number = Math.floor(number / baseRange);
      return value;
    });
    if (loads.every(load => load >= minimum) && !bridgeSignatures.has(loads.join(":"))) break;
  }
  if (bridgeSignatures.has(loads.join(":"))) throw Error("Repeated bridge load sequence");
  bridgeSignatures.add(loads.join(":"));
  return {
    ...base, name: `${chapter === 1 ? "Reinforced" : "Summit"} ${base.name}`,
    loads, cargo: `${chapter === 1 ? "Carefully packed" : "Heavy"} ${base.cargo}`,
  };
}));
export const bridgeLevels = [...bridgeBaseLevels, ...harderBridges];

export const pipePaths = [
  [10,11,6,7,12,13,18,19,14],
  [10,5,6,11,12,17,18,13,14],
  [10,15,16,11,12,7,8,9,14],
  [10,11,16,17,12,13,8,9,14],
  [10,5,6,7,8,13,12,17,18,19,14],
  [10,15,16,17,18,13,12,7,8,9,14],
  [10,11,16,21,22,17,12,7,8,13,14],
  [10,5,0,1,6,7,12,17,22,23,18,19,14],
  [10,11,12,13,14],
  [10,11,12,13,18,19,14],
  [10,11,12,13,8,9,14],
  [10,11,12,17,18,13,14],
  [10,11,12,7,8,13,14],
  [10,11,16,17,12,13,14],
  [10,5,6,11,12,13,14],
  [10,15,16,17,12,13,14],
  [10,11,12,13,18,23,24,19,14],
  [10,11,12,13,8,3,4,9,14],
  [10,11,12,17,22,23,18,13,14],
  [10,11,12,7,2,3,4,9,14],
];
export const directions = ["north", "east", "south", "west"];

export const cargo = [
  { id: "water", name: "Water barrels", icon: "drop", count: 4 },
  { id: "seeds", name: "Seed boxes", icon: "seed", count: 4 },
  { id: "wood", name: "Lumber", icon: "wood", count: 4 },
  { id: "books", name: "Book crates", icon: "book", count: 4 },
  { id: "food", name: "Food baskets", icon: "bread", count: 4 },
  { id: "tools", name: "Tool cases", icon: "metal", count: 4 },
];
export const harborLevels = [
  { name: "Sprout Island", icon: "tree", fuel: 1, capacity: 3, needs: { water: 2, seeds: 1 } },
  { name: "Workshop Island", icon: "hut", fuel: 2, capacity: 3, needs: { wood: 2, tools: 1 } },
  { name: "Story Island", icon: "lighthouse", fuel: 3, capacity: 3, needs: { books: 2, wood: 1 } },
  { name: "Beacon Point", icon: "lighthouse", fuel: 2, capacity: 3, needs: { water: 1, books: 1 } },
  { name: "Orchard Key", icon: "apple", fuel: 2, capacity: 3, needs: { seeds: 2, food: 1 } },
  { name: "Maker Bay", icon: "metal", fuel: 3, capacity: 3, needs: { tools: 1, wood: 1, books: 1 } },
  { name: "Turtle Beach", icon: "drop", fuel: 2, capacity: 3, needs: { water: 1, food: 2 } },
  { name: "Library Isle", icon: "book", fuel: 3, capacity: 3, needs: { books: 2, food: 1 } },
  { name: "Garden Key", icon: "seed", fuel: 2, capacity: 3, needs: { seeds: 1, water: 1, tools: 1 } },
  { name: "Festival Harbor", icon: "music", fuel: 3, capacity: 3, needs: { food: 1, wood: 2 } },
  { name: "Mountain Dock", icon: "mountain", fuel: 4, capacity: 4, needs: { water: 2, food: 1, books: 1 } },
  { name: "Sunflower Island", icon: "sun", fuel: 3, capacity: 4, needs: { seeds: 2, tools: 1, wood: 1 } },
  { name: "Rainwater Cay", icon: "drop", fuel: 4, capacity: 4, needs: { books: 1, water: 2, tools: 1 } },
  { name: "Picnic Point", icon: "bread", fuel: 2, capacity: 4, needs: { food: 2, books: 1, seeds: 1 } },
  { name: "Builder Reef", icon: "wood", fuel: 4, capacity: 4, needs: { wood: 2, water: 1, tools: 1 } },
  { name: "Seedling Shore", icon: "tree", fuel: 3, capacity: 4, needs: { seeds: 2, food: 2 } },
  { name: "Repair Point", icon: "metal", fuel: 4, capacity: 4, needs: { tools: 2, books: 1, water: 1 } },
  { name: "Learning Cove", icon: "book", fuel: 3, capacity: 4, needs: { books: 2, seeds: 1, food: 1 } },
  { name: "Community Key", icon: "market", fuel: 4, capacity: 4, needs: { water: 1, wood: 1, food: 1, tools: 1 } },
  { name: "Celebration Harbor", icon: "star", fuel: 4, capacity: 4, needs: { water: 1, seeds: 1, books: 1, tools: 1 } },
];
export const pantryFoods = [
  { id: "bread", name: "Bread sandwich", group: "main", icon: "bread" },
  { id: "beans", name: "Prepared beans", group: "main", icon: "beans" },
  { id: "rice", name: "Rice cup", group: "main", icon: "rice" },
  { id: "wrap", name: "Veggie wrap", group: "main", icon: "wrap" },
  { id: "pasta", name: "Pasta salad", group: "main", icon: "pasta" },
  { id: "apple", name: "Apple pieces", group: "fruit", icon: "apple" },
  { id: "banana", name: "Banana slices", group: "fruit", icon: "banana" },
  { id: "orange", name: "Orange wedges", group: "fruit", icon: "orange" },
  { id: "berries", name: "Mixed berries", group: "fruit", icon: "berries" },
  { id: "grapes", name: "Grape bunch", group: "fruit", icon: "grapes" },
  { id: "carrot", name: "Carrot sticks", group: "vegetable", icon: "carrot" },
  { id: "cucumber", name: "Cucumber rounds", group: "vegetable", icon: "cucumber" },
  { id: "peas", name: "Snap peas", group: "vegetable", icon: "peas" },
];

export const PANTRY_ROUND_SIZE = 10;

export const pantryChallenges = [
  {
    id: "garden-leftovers", name: "Garden leftovers",
    prompt: "Use the leftover bread and carrot sticks, then add one fruit for a mixed produce box.",
    stock: { bread: 1, beans: 1, apple: 2, carrot: 1, cucumber: 1 },
    mustUse: { bread: 1, carrot: 1 }, produce: { fruit: 1, vegetable: 1 },
    why: "You used the marked leftovers first and completed the box with one fruit and one vegetable.",
  },
  {
    id: "bean-bowl", name: "Bean bowl box",
    prompt: "Start with the leftover prepared beans. Add one fruit and one vegetable from the shelf.",
    stock: { beans: 1, rice: 1, apple: 1, banana: 1, cucumber: 1 },
    mustUse: { beans: 1 }, produce: { fruit: 1, vegetable: 1 }, differentProduce: true,
    why: "The leftover beans became the main, and two different produce choices finished the plan.",
  },
  {
    id: "rice-rescue", name: "Rice rescue",
    prompt: "The rice cup and snap peas are marked leftovers. Use both and choose one fruit.",
    stock: { rice: 1, wrap: 1, berries: 1, orange: 1, carrot: 1, peas: 1 },
    mustUse: { rice: 1, peas: 1 }, produce: { fruit: 1, vegetable: 1 },
    why: "The rice and snap peas were rescued, and a fruit completed the three-part picnic box.",
  },
  {
    id: "wrap-and-crunch", name: "Wrap and crunch",
    prompt: "Use the leftover veggie wrap and cucumber rounds. Pick one fruit to complete the box.",
    stock: { wrap: 1, pasta: 1, banana: 1, orange: 1, cucumber: 1, peas: 1 },
    mustUse: { wrap: 1, cucumber: 1 }, produce: { fruit: 1, vegetable: 1 },
    why: "You built around two leftovers and added only the fruit the picnic still needed.",
  },
  {
    id: "pasta-park", name: "Pasta park lunch",
    prompt: "Use the leftover pasta salad as the main. Add one fruit and one vegetable.",
    stock: { pasta: 1, bread: 1, grapes: 1, apple: 1, carrot: 1, cucumber: 1 },
    mustUse: { pasta: 1 }, produce: { fruit: 1, vegetable: 1 }, differentProduce: true,
    why: "The leftover pasta became the center of a box with two different produce portions.",
  },
  {
    id: "two-fruit-trail", name: "Two-fruit trail",
    prompt: "Use the leftover bread sandwich and choose two different fruits for the trail picnic.",
    stock: { bread: 1, beans: 1, apple: 1, banana: 1, orange: 1, carrot: 1 },
    mustUse: { bread: 1 }, produce: { fruit: 2, vegetable: 0 }, differentProduce: true,
    why: "The bread was used first, and two different fruits added variety without overpacking.",
  },
  {
    id: "veggie-crunch", name: "Veggie crunch box",
    prompt: "Use the leftover rice cup and carrot sticks. Add a different vegetable for extra crunch.",
    stock: { rice: 1, wrap: 1, carrot: 1, cucumber: 1, peas: 1, apple: 1 },
    mustUse: { rice: 1, carrot: 1 }, produce: { fruit: 0, vegetable: 2 }, differentProduce: true,
    why: "The rice and carrots were used first, then a second vegetable completed the request.",
  },
  {
    id: "rainbow-leftovers", name: "Rainbow leftovers",
    prompt: "Apple pieces and cucumber rounds are both leftovers. Use them with one main.",
    stock: { bread: 1, beans: 1, rice: 1, apple: 1, grapes: 1, cucumber: 1 },
    mustUse: { apple: 1, cucumber: 1 }, produce: { fruit: 1, vegetable: 1 },
    why: "Both marked produce portions found a place, so only one main was needed from the shelf.",
  },
  {
    id: "berry-and-bean", name: "Berry and bean box",
    prompt: "Use the leftover beans and mixed berries. Choose one vegetable to finish the picnic.",
    stock: { beans: 1, pasta: 1, berries: 1, carrot: 1, cucumber: 1, peas: 1 },
    mustUse: { beans: 1, berries: 1 }, produce: { fruit: 1, vegetable: 1 },
    why: "You matched two leftovers with the one vegetable the box still needed.",
  },
  {
    id: "sunny-orange", name: "Sunny orange box",
    prompt: "Use the leftover orange wedges and carrot sticks, then choose one main.",
    stock: { rice: 1, wrap: 1, pasta: 1, orange: 1, carrot: 1, cucumber: 1 },
    mustUse: { orange: 1, carrot: 1 }, produce: { fruit: 1, vegetable: 1 },
    why: "The two bright leftovers were already enough produce, so you added just one main.",
  },
  {
    id: "grape-garden", name: "Grape garden lunch",
    prompt: "Use the leftover bread and grape bunch. Add one vegetable from the garden shelf.",
    stock: { bread: 1, beans: 1, grapes: 1, apple: 1, carrot: 1, peas: 1 },
    mustUse: { bread: 1, grapes: 1 }, produce: { fruit: 1, vegetable: 1 },
    why: "The bread and grapes were used before new choices, then one vegetable completed the box.",
  },
  {
    id: "banana-pea", name: "Banana and pea picnic",
    prompt: "Banana slices and snap peas are leftovers. Use both, then select one main.",
    stock: { rice: 1, pasta: 1, wrap: 1, banana: 1, cucumber: 1, peas: 1 },
    mustUse: { banana: 1, peas: 1 }, produce: { fruit: 1, vegetable: 1 },
    why: "You checked the leftovers before choosing a main and avoided taking extra produce.",
  },
  {
    id: "apple-rescue", name: "Apple rescue box",
    prompt: "Use the leftover apple pieces. Add one vegetable and one main to complete the plan.",
    stock: { bread: 1, wrap: 1, apple: 1, orange: 1, carrot: 1, cucumber: 1 },
    mustUse: { apple: 1 }, produce: { fruit: 1, vegetable: 1 }, differentProduce: true,
    why: "The apple was rescued first, and the remaining spaces were filled without doubling up.",
  },
  {
    id: "pea-pod", name: "Pea pod picnic",
    prompt: "Use the leftover prepared beans and snap peas. Add one fruit for the final space.",
    stock: { beans: 1, rice: 1, apple: 1, berries: 1, grapes: 1, peas: 1 },
    mustUse: { beans: 1, peas: 1 }, produce: { fruit: 1, vegetable: 1 },
    why: "The bean main and snap peas were used first, leaving one clear fruit choice to make.",
  },
  {
    id: "cucumber-crunch", name: "Cucumber crunch",
    prompt: "Use the leftover cucumber rounds. Choose one fruit and one main from what remains.",
    stock: { bread: 1, wrap: 1, banana: 1, orange: 1, berries: 1, cucumber: 1 },
    mustUse: { cucumber: 1 }, produce: { fruit: 1, vegetable: 1 }, differentProduce: true,
    why: "The cucumber was not forgotten, and a fruit plus a main completed the picnic.",
  },
  {
    id: "fruit-sampler", name: "Fruit sampler",
    prompt: "Use the leftover pasta salad and choose two different fruits for the sampler box.",
    stock: { pasta: 1, rice: 1, apple: 1, banana: 1, berries: 1, grapes: 1 },
    mustUse: { pasta: 1 }, produce: { fruit: 2, vegetable: 0 }, differentProduce: true,
    why: "The pasta was used first, and two different fruits made the sampler match its request.",
  },
  {
    id: "garden-sampler", name: "Garden sampler",
    prompt: "Use the leftover veggie wrap and choose two different vegetables from the garden shelf.",
    stock: { wrap: 1, beans: 1, carrot: 1, cucumber: 1, peas: 1, apple: 1 },
    mustUse: { wrap: 1 }, produce: { fruit: 0, vegetable: 2 }, differentProduce: true,
    why: "The wrap became the main, and two different vegetables completed the garden sampler.",
  },
  {
    id: "carrot-double", name: "Carrot double",
    prompt: "Two carrot portions are marked as leftovers. Use both with one main.",
    stock: { bread: 1, rice: 1, wrap: 1, carrot: 2, cucumber: 1 },
    mustUse: { carrot: 2 }, produce: { fruit: 0, vegetable: 2 },
    why: "Both carrot portions were already available, so the box needed only one main.",
  },
  {
    id: "apple-double", name: "Apple double",
    prompt: "Two apple portions are marked as leftovers. Use both with one main.",
    stock: { rice: 1, pasta: 1, beans: 1, apple: 2, orange: 1 },
    mustUse: { apple: 2 }, produce: { fruit: 2, vegetable: 0 },
    why: "Both apple portions were used before anything new, and one main finished the box.",
  },
  {
    id: "fresh-mix", name: "Fresh mix challenge",
    prompt: "Use the leftover wrap, then choose two different produce portions of any kind.",
    stock: { wrap: 1, bread: 1, apple: 1, grapes: 1, carrot: 1, peas: 1 },
    mustUse: { wrap: 1 }, differentProduce: true,
    why: "You started with the wrap and chose two different produce items without taking extras.",
  },
  {
    id: "last-rice-cup", name: "Last rice cup",
    prompt: "Use the last rice cup and grape bunch. Add one vegetable to complete the mix.",
    stock: { rice: 1, beans: 1, grapes: 1, banana: 1, carrot: 1, cucumber: 1 },
    mustUse: { rice: 1, grapes: 1 }, produce: { fruit: 1, vegetable: 1 },
    why: "The rice and grapes were used first, and one vegetable completed the mixed produce request.",
  },
  {
    id: "pasta-and-peas", name: "Pasta and peas",
    prompt: "Use the leftover pasta and snap peas. Add a different vegetable for the second side.",
    stock: { pasta: 1, bread: 1, carrot: 1, cucumber: 1, peas: 1, apple: 1 },
    mustUse: { pasta: 1, peas: 1 }, produce: { fruit: 0, vegetable: 2 }, differentProduce: true,
    why: "The pasta and peas were used, and a second vegetable completed the all-garden request.",
  },
  {
    id: "bread-and-berries", name: "Bread and berries",
    prompt: "Use the leftover bread and mixed berries. Add a different fruit for the last space.",
    stock: { bread: 1, rice: 1, apple: 1, banana: 1, berries: 1, carrot: 1 },
    mustUse: { bread: 1, berries: 1 }, produce: { fruit: 2, vegetable: 0 }, differentProduce: true,
    why: "The bread and berries came first, then a different fruit completed the two-fruit plan.",
  },
  {
    id: "pantry-finale", name: "Pantry finale",
    prompt: "Use all three marked leftovers: prepared beans, apple pieces, and carrot sticks.",
    stock: { beans: 1, wrap: 1, apple: 1, orange: 1, carrot: 1, cucumber: 1 },
    mustUse: { beans: 1, apple: 1, carrot: 1 }, produce: { fruit: 1, vegetable: 1 },
    why: "Every marked leftover fit the request exactly, so nothing else needed to be opened.",
  },
  ...newPantryChallenges
];
export const landmarks = [
  { id: 30, name: "Lighthouse", icon: "lighthouse" }, { id: 5, name: "Reading hut", icon: "hut" },
  { id: 18, name: "Big tree", icon: "tree" }, { id: 26, name: "Market", icon: "market" },
  { id: 14, name: "Fountain", icon: "drop" },
];
export const compassClues = [
  { landmark: 0, east: 1, south: -1 }, { landmark: 1, east: -1, south: 1 },
  { landmark: 2, east: 1, south: -1 }, { landmark: 3, east: 1, south: -1 },
  { landmark: 4, east: -1, south: -1 }, { landmark: 0, east: 2, south: -2 },
  { landmark: 1, east: -2, south: 2 }, { landmark: 2, east: 2, south: 2 },
  { landmark: 3, east: -2, south: -2 }, { landmark: 4, east: 2, south: 2 },
  { landmark: 0, east: 4, south: -3 }, { landmark: 1, east: -4, south: 3 },
  { landmark: 2, east: 5, south: -2 }, { landmark: 3, east: 3, south: -2 },
  { landmark: 4, east: 3, south: 1 }, { landmark: 0, east: 3, south: -4 },
  { landmark: 1, east: -5, south: 5 }, { landmark: 2, east: 5, south: 1 },
  { landmark: 3, east: -2, south: -4 }, { landmark: 4, east: 3, south: 3 },
];

export const cipherLevels = [
  { shift: 1, word: "BED", encode: true }, { shift: 2, word: "ACE", encode: false },
  { shift: 3, word: "DAD", encode: true }, { shift: 5, word: "BEE", encode: false },
  { shift: 7, word: "CAB", encode: true }, { shift: 4, word: "FAD", encode: false },
  { shift: 6, word: "EGG", encode: true }, { shift: 1, word: "HAD", encode: false },
  { shift: 2, word: "AGE", encode: true }, { shift: 3, word: "BAD", encode: false },
  { shift: 4, word: "BAG", encode: true }, { shift: 5, word: "FEE", encode: false },
  { shift: 6, word: "FACE", encode: true }, { shift: 7, word: "CAGE", encode: false },
  { shift: 1, word: "BEAD", encode: true }, { shift: 2, word: "HEAD", encode: false },
  { shift: 3, word: "FADE", encode: true }, { shift: 4, word: "FEED", encode: false },
  { shift: 5, word: "BADGE", encode: true }, { shift: 6, word: "BEACH", encode: false },
];
export const tradeLevels = [
  { name: "Apples for the picnic", icon: "apple", need: 6, budget: 8, deals: [
    { name: "Single apple", quantity: 1, price: 2, fee: 0 }, { name: "Small basket", quantity: 3, price: 3, fee: 0 }, { name: "Big basket", quantity: 6, price: 7, fee: 0 },
  ] },
  { name: "Pencils for the clubhouse", icon: "pencil", need: 4, budget: 6, deals: [
    { name: "Two pencils", quantity: 2, price: 2, fee: 0 }, { name: "Four-pencil pack", quantity: 4, price: 5, fee: 0 }, { name: "Mega pack", quantity: 8, price: 8, fee: 0 },
  ] },
  { name: "Seeds for the garden", icon: "seed", need: 6, budget: 9, deals: [
    { name: "Local seed trio", quantity: 3, price: 3, fee: 0 }, { name: "Six-pack delivery", quantity: 6, price: 4, fee: 4 }, { name: "Single packet", quantity: 1, price: 2, fee: 0 },
  ] },
  { name: "Notebooks for study time", icon: "book", need: 5, budget: 9, deals: [
    { name: "Single notebook", quantity: 1, price: 2, fee: 0 }, { name: "Three-pack", quantity: 3, price: 4, fee: 0 }, { name: "Six-pack shipped", quantity: 6, price: 7, fee: 1 },
  ] },
  { name: "Carrots for soup day", icon: "carrot", need: 8, budget: 10, deals: [
    { name: "Two-carrot bunch", quantity: 2, price: 3, fee: 0 }, { name: "Four-carrot bunch", quantity: 4, price: 4, fee: 0 }, { name: "Eight-carrot crate", quantity: 8, price: 9, fee: 0 },
  ] },
  { name: "Bread rolls for the picnic", icon: "bread", need: 7, budget: 10, deals: [
    { name: "Single roll", quantity: 1, price: 2, fee: 0 }, { name: "Four-roll delivery", quantity: 4, price: 4, fee: 1 }, { name: "Eight-roll bag", quantity: 8, price: 8, fee: 0 },
  ] },
  { name: "Wood pieces for craft club", icon: "wood", need: 9, budget: 12, deals: [
    { name: "Three-piece pack", quantity: 3, price: 4, fee: 0 }, { name: "Five-piece delivery", quantity: 5, price: 5, fee: 1 }, { name: "Ten-piece box", quantity: 10, price: 11, fee: 0 },
  ] },
  { name: "Water bottles for the team", icon: "drop", need: 10, budget: 12, deals: [
    { name: "Two bottles", quantity: 2, price: 3, fee: 0 }, { name: "Five-bottle delivery", quantity: 5, price: 5, fee: 1 }, { name: "Ten-bottle case", quantity: 10, price: 10, fee: 1 },
  ] },
];
export const townParts = [
  { id: "park", name: "Shaded park", cost: 4, icon: "tree" }, { id: "hut", name: "Reading hut", cost: 4, icon: "hut" },
  { id: "ramp", name: "Step-free ramp", cost: 3, icon: "ramp" }, { id: "bench", name: "Bench", cost: 1, icon: "bench" },
];

const townRequest = (neighbor, part, text, rule) => ({ neighbor, part, text, rule });
export const townLevels = [
  {
    id: "welcome-grove", name: "Welcome Grove", intro: "The first council wants shade, quiet, river access, and a friendly resting place.",
    celebration: "Welcome Grove now gives every neighbor a comfortable way to join in.", budget: 12,
    requests: [
      townRequest("Moss", "park", "Please put the park in the shaded top row.", { type: "row", value: 0 }),
      townRequest("Pip", "hut", "My reading hut belongs in the quiet bottom row.", { type: "row", value: 1 }),
      townRequest("Tess", "ramp", "Place the step-free ramp beside the river in the right column.", { type: "column", value: 2 }),
      townRequest("Bram", "bench", "I would like the bench directly beside the park.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "river-reading", name: "River Reading Row", intro: "This neighborhood is planning a cool lower garden and a riverside reading nook.",
    celebration: "River Reading Row balances a calm book corner with an easy route to the water.", budget: 12,
    requests: [
      townRequest("Fern", "park", "Keep the park in the bottom row where the garden is coolest.", { type: "row", value: 1 }),
      townRequest("Otis", "hut", "I want the reading hut in the river-side right column.", { type: "column", value: 2 }),
      townRequest("Luma", "ramp", "Build the ramp somewhere in the top row.", { type: "row", value: 0 }),
      townRequest("Nib", "bench", "Set the bench directly beside the park.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "market-meadow", name: "Market Meadow", intro: "The market neighbors have chosen exact center plots for their busiest shared spaces.",
    celebration: "Market Meadow has a clear center, a river route, and a shaded place to pause.", budget: 12,
    requests: [
      townRequest("Clover", "park", "Please use top-center plot 2 for the park.", { type: "plot", value: 1 }),
      townRequest("Reed", "hut", "The reading hut should be on bottom-center plot 5.", { type: "plot", value: 4 }),
      townRequest("Ari", "ramp", "Keep the ramp in the river-side right column.", { type: "column", value: 2 }),
      townRequest("Juniper", "bench", "Put the bench directly beside the park.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "lantern-lane", name: "Lantern Lane", intro: "Lantern Lane needs a central gathering space and a quiet corner for stories.",
    celebration: "Lantern Lane is ready for peaceful reading and bright community evenings.", budget: 12,
    requests: [
      townRequest("Ember", "park", "Make bottom-center plot 5 our gathering park.", { type: "plot", value: 4 }),
      townRequest("Sage", "hut", "Place the reading hut on top-left plot 1.", { type: "plot", value: 0 }),
      townRequest("Wren", "ramp", "The ramp needs to stay in the right river column.", { type: "column", value: 2 }),
      townRequest("Flicker", "bench", "Keep the bench one plot away from the park.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "story-circle", name: "Story Circle", intro: "A sunny river overlook will become a place for stories, rest, and easy movement.",
    celebration: "Story Circle now connects shade, books, rest, and access in one welcoming plan.", budget: 12,
    requests: [
      townRequest("Acorn", "park", "Use top-right plot 3 for the shaded park.", { type: "plot", value: 2 }),
      townRequest("Mira", "hut", "The reading hut needs the quiet bottom row.", { type: "row", value: 1 }),
      townRequest("Sol", "ramp", "Place the ramp on bottom-right plot 6.", { type: "plot", value: 5 }),
      townRequest("Tumble", "bench", "Put the bench directly beside the park.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "creek-corner", name: "Creek Corner", intro: "The second council rank begins with connected routes between the left path and quiet row.",
    celebration: "Creek Corner has a connected layout that makes gathering and moving easier.", budget: 12,
    requests: [
      townRequest("Pebble", "park", "Keep the park in the left column near the trail.", { type: "column", value: 0 }),
      townRequest("Ivy", "hut", "My hut belongs in the quiet bottom row.", { type: "row", value: 1 }),
      townRequest("Rue", "ramp", "Build the ramp directly beside the reading hut.", { type: "adjacent", other: "hut" }),
      townRequest("Chip", "bench", "Place the bench directly beside the park.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "hilltop-hollow", name: "Hilltop Hollow", intro: "Neighbors want the lively and quiet spaces on different rows with short connections.",
    celebration: "Hilltop Hollow separates busy and quiet spaces while keeping every path close.", budget: 12,
    requests: [
      townRequest("Poppy", "park", "Put the park in the shaded top row.", { type: "row", value: 0 }),
      townRequest("Ash", "hut", "Keep the hut on the other row from the park.", { type: "differentRow", other: "park" }),
      townRequest("Kite", "ramp", "Place the ramp directly beside the park.", { type: "adjacent", other: "park" }),
      townRequest("Mallow", "bench", "Set the bench directly beside the reading hut.", { type: "adjacent", other: "hut" }),
    ],
  },
  {
    id: "meadow-middle", name: "Meadow Middle", intro: "This plan uses the middle column as a community spine between two quieter edges.",
    celebration: "Meadow Middle has a strong center and clear access from both sides.", budget: 12,
    requests: [
      townRequest("Dew", "park", "Keep the park in the center column.", { type: "column", value: 1 }),
      townRequest("Quill", "hut", "Use top-left plot 1 for the reading hut.", { type: "plot", value: 0 }),
      townRequest("Brook", "ramp", "The ramp must be in the river-side right column.", { type: "column", value: 2 }),
      townRequest("Hazel", "bench", "Place the bench directly beside the park.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "library-path", name: "Library Path", intro: "The library path needs a clear top-row rest stop and a lower river entrance.",
    celebration: "Library Path now has an easy-to-follow route from rest to reading.", budget: 12,
    requests: [
      townRequest("Maple", "park", "Place the park on top-left plot 1.", { type: "plot", value: 0 }),
      townRequest("Ink", "hut", "Keep the reading hut in the bottom row.", { type: "row", value: 1 }),
      townRequest("Skip", "ramp", "Use bottom-right plot 6 for the ramp.", { type: "plot", value: 5 }),
      townRequest("Page", "bench", "Keep the bench on the same row as the park.", { type: "sameRow", other: "park" }),
    ],
  },
  {
    id: "sunset-bank", name: "Sunset Bank", intro: "The river overlook needs a lower park, a top reading area, and a nearby resting place.",
    celebration: "Sunset Bank gives every neighbor a comfortable view and a clear way through.", budget: 12,
    requests: [
      townRequest("Goldie", "park", "Make bottom-right plot 6 the sunset park.", { type: "plot", value: 5 }),
      townRequest("Moon", "hut", "Keep the reading hut in the top row.", { type: "row", value: 0 }),
      townRequest("Drift", "ramp", "Place the ramp on the same row as the hut.", { type: "sameRow", other: "hut" }),
      townRequest("Glow", "bench", "Put the bench directly beside the park.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "access-square", name: "Access Square", intro: "Now an Access Planner, you will connect exact gathering spots with flexible routes.",
    celebration: "Access Square makes the busy corner reachable while protecting a quiet reading row.", budget: 12,
    requests: [
      townRequest("Birch", "park", "Use top-left plot 1 for the park.", { type: "plot", value: 0 }),
      townRequest("Echo", "hut", "Place the hut somewhere in the bottom row.", { type: "row", value: 1 }),
      townRequest("Rill", "ramp", "Keep the ramp on the same row as the hut.", { type: "sameRow", other: "hut" }),
      townRequest("Nook", "bench", "Set the bench directly beside the park.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "river-garden", name: "River Garden", intro: "Two exact landmarks anchor this garden while the ramp and bench complete the route.",
    celebration: "River Garden now links its center lawn and reading overlook without blocking access.", budget: 12,
    requests: [
      townRequest("Thyme", "park", "Put the park on bottom-center plot 5.", { type: "plot", value: 4 }),
      townRequest("Finch", "hut", "Place the reading hut on top-right plot 3.", { type: "plot", value: 2 }),
      townRequest("Ripple", "ramp", "Keep the ramp in the river-side right column.", { type: "column", value: 2 }),
      townRequest("Basil", "bench", "Place the bench directly beside the park.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "friendship-green", name: "Friendship Green", intro: "This council wants the park centered above a lower quiet corner and an opposite-row rest stop.",
    celebration: "Friendship Green has distinct spaces that still feel connected.", budget: 12,
    requests: [
      townRequest("Lark", "park", "Use top-center plot 2 for the park.", { type: "plot", value: 1 }),
      townRequest("Mossy", "hut", "Place the hut on bottom-left plot 4.", { type: "plot", value: 3 }),
      townRequest("Skim", "ramp", "Build the ramp on top-right plot 3.", { type: "plot", value: 2 }),
      townRequest("Daisy", "bench", "Keep the bench on the other row from the park.", { type: "differentRow", other: "park" }),
    ],
  },
  {
    id: "festival-clearing", name: "Festival Clearing", intro: "Festival paths work best when gathering, access, and resting spaces share clear relationships.",
    celebration: "Festival Clearing is ready for a lively event with quiet space still protected.", budget: 12,
    requests: [
      townRequest("Fiddle", "park", "Use bottom-left plot 4 for the park.", { type: "plot", value: 3 }),
      townRequest("Verse", "hut", "Place the reading hut on top-center plot 2.", { type: "plot", value: 1 }),
      townRequest("Tempo", "ramp", "Keep the ramp on the same row as the park.", { type: "sameRow", other: "park" }),
      townRequest("Chime", "bench", "Put the bench directly beside the park.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "sunrise-steps", name: "Sunrise Steps", intro: "A sunrise park above the river needs a lower access point and a close bench.",
    celebration: "Sunrise Steps welcomes early readers, quiet visitors, and neighbors using the ramp.", budget: 12,
    requests: [
      townRequest("Sunny", "park", "Put the park on top-right plot 3.", { type: "plot", value: 2 }),
      townRequest("Umber", "hut", "Place the reading hut on bottom-left plot 4.", { type: "plot", value: 3 }),
      townRequest("Current", "ramp", "Use bottom-right plot 6 for the ramp.", { type: "plot", value: 5 }),
      townRequest("Ray", "bench", "Set the bench directly beside the park.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "makers-meadow", name: "Makers Meadow", intro: "Council Champions combine exact landmarks with relative requests from several neighbors.",
    celebration: "Makers Meadow has a flexible plan where creating, reading, and resting can happen together.", budget: 12,
    requests: [
      townRequest("Tinker", "park", "Use bottom-center plot 5 for the park.", { type: "plot", value: 4 }),
      townRequest("Scroll", "hut", "Place the hut on top-left plot 1.", { type: "plot", value: 0 }),
      townRequest("Glide", "ramp", "Keep the ramp on the other row from the park.", { type: "differentRow", other: "park" }),
      townRequest("Rest", "bench", "Put the bench directly beside the park.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "blossom-crossing", name: "Blossom Crossing", intro: "Two different neighbors need their routes directly connected to the same central park.",
    celebration: "Blossom Crossing gives both resting and step-free routes a direct park connection.", budget: 12,
    requests: [
      townRequest("Bloom", "park", "Make top-center plot 2 the park.", { type: "plot", value: 1 }),
      townRequest("Tale", "hut", "Put the reading hut on bottom-right plot 6.", { type: "plot", value: 5 }),
      townRequest("Wheel", "ramp", "Build the ramp directly beside the park.", { type: "adjacent", other: "park" }),
      townRequest("Petal", "bench", "Place the bench directly beside the park too.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "quiet-creek", name: "Quiet Creek", intro: "A diagonal plan can still feel connected when every important destination has a nearby partner.",
    celebration: "Quiet Creek now joins reading, access, gathering, and rest without crowding one corner.", budget: 12,
    requests: [
      townRequest("Willow", "park", "Use bottom-left plot 4 for the park.", { type: "plot", value: 3 }),
      townRequest("Hush", "hut", "Put the reading hut on top-right plot 3.", { type: "plot", value: 2 }),
      townRequest("Ford", "ramp", "Place the ramp directly beside the reading hut.", { type: "adjacent", other: "hut" }),
      townRequest("Pause", "bench", "Set the bench directly beside the park.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "starlight-bank", name: "Starlight Bank", intro: "The evening council wants two top-row services above a river park and its bench.",
    celebration: "Starlight Bank is easy to navigate in a simple two-row plan.", budget: 12,
    requests: [
      townRequest("Nova", "park", "Use bottom-right plot 6 for the park.", { type: "plot", value: 5 }),
      townRequest("Fable", "hut", "Place the hut on top-left plot 1.", { type: "plot", value: 0 }),
      townRequest("Comet", "ramp", "Keep the ramp on the same row as the hut.", { type: "sameRow", other: "hut" }),
      townRequest("Twinkle", "bench", "Put the bench directly beside the park.", { type: "adjacent", other: "park" }),
    ],
  },
  {
    id: "council-commons", name: "Council Commons", intro: "The final plan combines exact places and two different neighbor-to-neighbor connections.",
    celebration: "Council Commons is complete. You listened to eighty requests across twenty welcoming neighborhoods!", budget: 12,
    requests: [
      townRequest("Harmony", "park", "Make bottom-center plot 5 the council park.", { type: "plot", value: 4 }),
      townRequest("Reader", "hut", "Place the reading hut on top-right plot 3.", { type: "plot", value: 2 }),
      townRequest("Access", "ramp", "Build the ramp directly beside the reading hut.", { type: "adjacent", other: "hut" }),
      townRequest("Welcome", "bench", "Set the bench directly beside the park.", { type: "adjacent", other: "park" }),
    ],
  },
];
