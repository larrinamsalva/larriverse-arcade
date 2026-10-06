export const expeditions = [
  { id: "bridge-buddies", title: "Bridge Buddies", icon: "🌉", topic: "Build & create", category: "Little engineers", age: "8+", minutes: "7 min", art: 0, mode: "bridge", skill: "Test, improve, try again", desc: "Build bridges for eight different crossings and discover which supports fit each load.", mission: "Build four bridge spans within each token budget. Test every crossing, learn from weak spots, and help eight carts get across.", take: "Choose the right support for the job. Test a small model, notice what happened, and change one thing at a time." },
  { id: "water-works", title: "Water Works", icon: "💧", topic: "Planet", category: "Flow & resources", age: "7+", minutes: "7 min", art: 1, mode: "pipes", skill: "See how a system connects", desc: "Turn the pipes. Follow eight different flow paths. Bring water through the toy filter to town.", mission: "Rotate the blue pipes to connect the reservoir on the left to the house on the right. Pass through the toy filter in all eight networks.", take: "Trace a problem from its starting point and check each connection. This toy filter does not make real water safe to drink." },
  { id: "harbor-helpers", title: "Harbor Helpers", icon: "⛵", topic: "Adventures", category: "Cooperative adventures", age: "8+", minutes: "5 min", art: 2, mode: "harbor", skill: "Plan deliveries together", desc: "Load your boat and help three island communities share supplies.", mission: "Deliver nine crates to three islands. Your boat holds three crates and has twelve fuel tokens. Check what each island needs before sailing.", take: "A useful delivery starts with listening. Plan loads and routes together so supplies reach the neighbors who asked for them." },
  { id: "pantry-picnic", title: "Pantry Picnic", icon: "🥪", topic: "Everyday life", category: "Little life skills", age: "7+", minutes: "4 min", art: 3, mode: "pantry", skill: "Use what you already have", desc: "Pack three colorful picnic boxes and give leftovers a delicious second chance.", mission: "Pack three pretend picnic boxes, each with one main and two fruit or vegetable portions. Use the marked leftovers first and finish the pantry.", take: "Check what you already have before getting more. Planning portions can reduce waste; ask an adult about real food preparation and storage." },
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
  { id: "bread", name: "Bread", group: "main", icon: "bread", count: 2, leftover: true },
  { id: "beans", name: "Prepared beans", group: "main", icon: "beans", count: 1, leftover: false },
  { id: "apple", name: "Apple pieces", group: "color", icon: "apple", count: 3, leftover: false },
  { id: "carrot", name: "Carrot sticks", group: "color", icon: "carrot", count: 3, leftover: true },
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
