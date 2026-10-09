export const expeditions = [
  { id: "bridge-buddies", title: "Bridge Buddies", icon: "🌉", topic: "Build & create", category: "Little engineers", age: "8+", minutes: "7 min", art: 0, mode: "bridge", skill: "Test, improve, try again", desc: "Build bridges for eight different crossings and discover which supports fit each load.", mission: "Build four bridge spans within each token budget. Test every crossing, learn from weak spots, and help eight carts get across.", take: "Choose the right support for the job. Test a small model, notice what happened, and change one thing at a time." },
  { id: "water-works", title: "Water Works", icon: "💧", topic: "Planet", category: "Flow & resources", age: "7+", minutes: "7 min", art: 1, mode: "pipes", skill: "See how a system connects", desc: "Turn the pipes. Follow eight different flow paths. Bring water through the toy filter to town.", mission: "Rotate the blue pipes to connect the reservoir on the left to the house on the right. Pass through the toy filter in all eight networks.", take: "Trace a problem from its starting point and check each connection. This toy filter does not make real water safe to drink." },
  { id: "harbor-helpers", title: "Harbor Helpers", icon: "⛵", topic: "Adventures", category: "Cooperative adventures", age: "8+", minutes: "5 min", art: 2, mode: "harbor", skill: "Plan deliveries together", desc: "Load your boat and help three island communities share supplies.", mission: "Deliver nine crates to three islands. Your boat holds three crates and has twelve fuel tokens. Check what each island needs before sailing.", take: "A useful delivery starts with listening. Plan loads and routes together so supplies reach the neighbors who asked for them." },
  { id: "pantry-picnic", title: "Pantry Picnic", icon: "🥪", topic: "Everyday life", category: "Little life skills", age: "7+", minutes: "7 min", art: 3, mode: "pantry", skill: "Use what you already have", desc: "Solve eight colorful picnic challenges from a rotating bank of twenty-four pantry plans.", mission: "Pack eight pretend picnic boxes, each with one main and two produce portions. Follow each request, use marked leftovers first, and meet all twenty-four challenges before they repeat.", take: "Check what you already have before getting more. Planning portions can reduce waste; ask an adult about allergies, food preparation, and safe storage." },
  { id: "compass-cove", title: "Compass Cove", icon: "🧭", topic: "Adventures", category: "Map adventures", age: "7+", minutes: "6 min", art: 4, mode: "compass", skill: "Read landmarks and directions", desc: "Explore a tiny island with a compass, a map, and eight hidden treasures.", mission: "Find eight treasures by following clues from island landmarks. North is up, east is right, south is down, and west is left on this map.", take: "Start from a landmark you can identify. A map and a compass help you explain a route and check where a direction will take you." },
  { id: "cipher-club", title: "Cipher Club", icon: "🔎", topic: "Digital life", category: "Secret-code workshop", age: "8+", minutes: "6 min", art: 5, mode: "cipher", skill: "Make meaning with a shared key", desc: "Turn the code wheel and solve eight tiny secret messages for your clubhouse.", mission: "Use the toy A–H alphabet and a shared number key to encode or decode eight three-letter clubhouse messages. The alphabet wraps around after H.", take: "A shared rule can change how a message looks. This tiny code is easy to break and must never be used to protect passwords or real secrets." },
  { id: "trade-town", title: "Trade Town", icon: "🪙", topic: "Money", category: "Smart shopping", age: "8+", minutes: "7 min", art: 6, mode: "trade", skill: "Compare the whole deal", desc: "Visit the market for eight shopping challenges and compare bundles, prices, and extra fees.", mission: "Fill eight shopping requests within their pretend budgets. Compare bundle sizes, unit prices, and delivery fees. You can return items before checkout.", take: "The biggest pack is not always the best fit. Compare the whole cost, including fees, with how much you actually need." },
  { id: "critter-council", title: "Critter Council", icon: "🌱", topic: "People", category: "Community builders", age: "8+", minutes: "5 min", art: 7, mode: "town", skill: "Design for different needs", desc: "Build a woodland town where every little neighbor feels welcome.", mission: "Listen to four neighbors. Place a shaded park, quiet reading hut, step-free ramp, and bench near the park on six plots using twelve builder tokens.", take: "People can need different things from the same place. Ask, listen, and design so more neighbors can take part comfortably." },
].map(world => ({ ...world, artSet: "expedition" }));

export const bridgeParts = [
  { id: "plank", name: "Plank", cost: 2, capacity: 3 },
  { id: "beam", name: "Beam", cost: 3, capacity: 6 },
  { id: "triangle", name: "Triangle brace", cost: 4, capacity: 9 },
];
export const bridgeLevels = [
  { name: "Creek crossing", loads: [4, 7, 5, 8], budget: 14 },
  { name: "Market crossing", loads: [3, 6, 9, 6], budget: 12 },
  { name: "Festival crossing", loads: [8, 3, 5, 7], budget: 13 },
  { name: "Library crossing", loads: [2, 5, 8, 4], budget: 13 },
  { name: "Garden crossing", loads: [6, 6, 3, 9], budget: 13 },
  { name: "River crossing", loads: [9, 4, 6, 2], budget: 13 },
  { name: "Night crossing", loads: [5, 8, 3, 7], budget: 14 },
  { name: "Parade crossing", loads: [7, 9, 6, 3], budget: 13 },
];
export const pipePaths = [
  [10,11,6,7,12,13,18,19,14],
  [10,5,6,11,12,17,18,13,14],
  [10,15,16,11,12,7,8,9,14],
  [10,11,16,17,12,13,8,9,14],
  [10,5,6,7,8,13,12,17,18,19,14],
  [10,15,16,17,18,13,12,7,8,9,14],
  [10,11,16,21,22,17,12,7,8,13,14],
  [10,5,0,1,6,7,12,17,22,23,18,19,14],
];
export const directions = ["north", "east", "south", "west"];

export const islands = [
  { name: "Sprout Island", fuel: 1, needs: { water: 2, seeds: 1 } },
  { name: "Workshop Island", fuel: 2, needs: { wood: 2, seeds: 1 } },
  { name: "Story Island", fuel: 3, needs: { books: 2, wood: 1 } },
];
export const cargo = [
  { id: "water", name: "Water", icon: "drop", count: 2 },
  { id: "seeds", name: "Seeds", icon: "seed", count: 2 },
  { id: "wood", name: "Wood", icon: "wood", count: 3 },
  { id: "books", name: "Books", icon: "book", count: 2 },
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

export const PANTRY_ROUND_SIZE = 8;

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
];
export const landmarks = [
  { id: 30, name: "Lighthouse", icon: "lighthouse" }, { id: 5, name: "Reading hut", icon: "hut" },
  { id: 18, name: "Big tree", icon: "tree" }, { id: 26, name: "Market", icon: "market" },
  { id: 14, name: "Fountain", icon: "drop" },
];
export const compassClues = [
  { landmark: 0, east: 2, south: -3 }, { landmark: 1, east: -2, south: 2 },
  { landmark: 2, east: 4, south: -1 }, { landmark: 3, east: -1, south: -2 },
  { landmark: 4, east: 3, south: 2 }, { landmark: 0, east: 4, south: -4 },
  { landmark: 1, east: -4, south: 3 }, { landmark: 2, east: 2, south: 2 },
];

export const cipherLevels = [
  { shift: 1, word: "BED", encode: true }, { shift: 2, word: "ACE", encode: false },
  { shift: 3, word: "DAD", encode: true }, { shift: 5, word: "BEE", encode: false },
  { shift: 7, word: "CAB", encode: true }, { shift: 4, word: "FAD", encode: false },
  { shift: 6, word: "EGG", encode: true }, { shift: 1, word: "HAD", encode: false },
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
