// Twenty bonus challenges for the 80-level Water Works, Harbor Helpers, and Pantry Picnic journeys.
// Existing levels 1-60 remain unchanged so saved progress continues forward.

export const bonusPipePaths = [
  [10,11,12,17,16,15,20,21,22,23,18,13,8,3,4,9,14],
  [10,11,12,17,16,15,20,21,22,23,24,19,18,13,8,9,14],
  [10,11,12,17,16,21,22,23,18,13,8,7,2,3,4,9,14],
  [10,11,12,17,16,21,22,23,24,19,18,13,8,3,4,9,14],
  [10,11,12,17,22,23,18,13,8,7,6,1,2,3,4,9,14],
  [10,11,12,17,22,23,24,19,18,13,8,7,2,3,4,9,14],
  [10,11,12,7,2,3,4,9,8,13,18,17,22,23,24,19,14],
  [10,11,12,7,2,3,8,13,18,17,16,21,22,23,24,19,14],
  [10,11,12,7,6,1,2,3,4,9,8,13,18,23,24,19,14],
  [10,11,12,7,6,1,2,3,8,13,18,17,22,23,24,19,14],
  [10,11,12,7,6,5,0,1,2,3,4,9,8,13,18,19,14],
  [10,11,12,7,6,5,0,1,2,3,8,13,18,23,24,19,14],
  [10,11,12,7,8,13,18,17,16,15,20,21,22,23,24,19,14],
  [10,11,16,15,20,21,22,17,12,13,8,7,2,3,4,9,14],
  [10,11,16,15,20,21,22,17,12,7,2,3,4,9,8,13,14],
  [10,11,16,15,20,21,22,17,12,7,2,3,8,13,18,19,14],
  [10,11,16,15,20,21,22,17,12,7,6,1,2,3,4,9,14],
  [10,11,16,15,20,21,22,17,12,7,6,1,2,3,8,13,14],
  [10,11,16,15,20,21,22,17,12,7,6,1,2,3,8,9,14],
  [10,11,16,15,20,21,22,17,12,7,8,13,18,23,24,19,14],
];

export const bonusHarborLevels = [
  { name:"Lighthouse Learning Key", icon:"lighthouse", purpose:"Readers are opening a new study room", fuel:9, needs:{} },
  { name:"Bluewater Garden Dock", icon:"seed", purpose:"Garden volunteers are preparing new beds", fuel:10, needs:{} },
  { name:"Seaside Maker Point", icon:"metal", purpose:"Young makers need supplies for a workshop", fuel:11, needs:{} },
  { name:"Orchard Ferry Cove", icon:"apple", purpose:"Families are preparing an orchard workday", fuel:9, needs:{} },
  { name:"Moonlit Library Pier", icon:"book", purpose:"The island library is hosting an evening reading event", fuel:10, needs:{} },
  { name:"Community Repair Isle", icon:"wood", purpose:"Neighbors are repairing shared benches and tables", fuel:12, needs:{} },
  { name:"Sunrise Market Landing", icon:"market", purpose:"A morning market needs a carefully planned delivery", fuel:10, needs:{} },
  { name:"Wildflower Supply Bay", icon:"tree", purpose:"A pollinator garden crew is gathering materials", fuel:11, needs:{} },
  { name:"Mountain Music Wharf", icon:"music", purpose:"A hillside festival needs supplies from the harbor", fuel:12, needs:{} },
  { name:"Harbor Reading Reef", icon:"book", purpose:"A reading club is setting up a seaside story station", fuel:10, needs:{} },
  { name:"Coastal Garden Station", icon:"seed", purpose:"Students are building a coastal teaching garden", fuel:11, needs:{} },
  { name:"Festival Ferry Point", icon:"star", purpose:"Community helpers are preparing a small island festival", fuel:12, needs:{} },
  { name:"Starboard Workshop Isle", icon:"hut", purpose:"Builders are organizing a hands-on learning day", fuel:10, needs:{} },
  { name:"Lantern Orchard Dock", icon:"star", purpose:"Orchard volunteers are setting up a safe evening event", fuel:11, needs:{} },
  { name:"Riverbook Landing", icon:"book", purpose:"A floating book exchange needs its weekly supplies", fuel:12, needs:{} },
  { name:"Seaside Harvest Key", icon:"apple", purpose:"A harvest team is packing a neighborhood food table", fuel:10, needs:{} },
  { name:"Compass Community Cove", icon:"lighthouse", purpose:"Island helpers are preparing a community navigation day", fuel:11, needs:{} },
  { name:"Rainbow Repair Harbor", icon:"metal", purpose:"A repair fair needs materials for several activity tables", fuel:12, needs:{} },
  { name:"Grand Learning Wharf", icon:"book", purpose:"Teachers are opening a harbor-wide learning festival", fuel:12, needs:{} },
  { name:"Helping Hands Island", icon:"star", purpose:"Several neighborhood teams are finishing one final shared mission", fuel:12, needs:{} },
];

export const bonusPantryChallenges = [
  {
    id:"creek-side-saver", name:"Creek-side saver", chapter:"Trail & park picnics",
    prompt:"Pack the saved veggie wrap, apple pieces, and cucumber rounds for the creek-side picnic without swapping in another food.",
    stock:{wrap:1,bread:1,apple:1,banana:1,cucumber:1,peas:1},
    mustUse:{wrap:1,apple:1,cucumber:1}, produce:{fruit:1,vegetable:1},
    why:"The saved wrap gives the main while the apple and cucumber add one fruit and one vegetable without opening extra food."
  },
  {
    id:"orchard-trail-pack", name:"Orchard trail pack", chapter:"Trail & park picnics",
    prompt:"The trail group saved a bread sandwich, banana slices, and carrot sticks. Pack those exact three portions for the walk.",
    stock:{bread:1,rice:1,banana:1,orange:1,carrot:1,cucumber:1},
    mustUse:{bread:1,banana:1,carrot:1}, produce:{fruit:1,vegetable:1},
    why:"Using the three saved portions first makes a simple picnic with one main, one fruit, and one vegetable."
  },
  {
    id:"park-pasta-picnic", name:"Park pasta picnic", chapter:"Trail & park picnics",
    prompt:"Use the leftover pasta salad, mixed berries, and snap peas to make the park lunch before choosing anything else from the shelf.",
    stock:{pasta:1,beans:1,berries:1,grapes:1,peas:1,carrot:1},
    mustUse:{pasta:1,berries:1,peas:1}, produce:{fruit:1,vegetable:1},
    why:"The pasta is the main and the berries plus snap peas complete the requested fruit-and-vegetable pair with no waste."
  },
  {
    id:"sunrise-rice-box", name:"Sunrise rice box", chapter:"Trail & park picnics",
    prompt:"For the early trail stop, pack the saved rice cup, orange wedges, and cucumber rounds exactly as the note requests.",
    stock:{rice:1,wrap:1,orange:1,apple:1,cucumber:1,carrot:1},
    mustUse:{rice:1,orange:1,cucumber:1}, produce:{fruit:1,vegetable:1},
    why:"The rice cup supplies the main while the orange and cucumber provide the two produce portions requested for the box."
  },
  {
    id:"bean-hike-box", name:"Bean hike box", chapter:"Trail & park picnics",
    prompt:"The hiking team has prepared beans, a grape bunch, and carrot sticks marked to use first. Pack all three saved portions.",
    stock:{beans:1,bread:1,grapes:1,banana:1,carrot:1,peas:1},
    mustUse:{beans:1,grapes:1,carrot:1}, produce:{fruit:1,vegetable:1},
    why:"Prepared beans make the main, and the grapes with carrots finish the picnic while using every marked leftover first."
  },
  {
    id:"meadow-mix-box", name:"Meadow mix box", chapter:"Trail & park picnics",
    prompt:"A meadow picnic note marks the veggie wrap, mixed berries, and snap peas as the portions that should be packed first.",
    stock:{wrap:1,pasta:1,berries:1,apple:1,peas:1,cucumber:1},
    mustUse:{wrap:1,berries:1,peas:1}, produce:{fruit:1,vegetable:1},
    why:"The wrap, berries, and peas meet the one-main and two-produce plan while clearing the marked food from the shelf."
  },
  {
    id:"shady-park-lunch", name:"Shady park lunch", chapter:"Trail & park picnics",
    prompt:"Pack the saved bread sandwich, apple pieces, and cucumber rounds for lunch in the shade before opening other choices.",
    stock:{bread:1,beans:1,apple:1,orange:1,cucumber:1,peas:1},
    mustUse:{bread:1,apple:1,cucumber:1}, produce:{fruit:1,vegetable:1},
    why:"The sandwich is the main and the saved apple and cucumber complete a balanced pretend picnic without extra portions."
  },
  {
    id:"trailhead-pasta-pack", name:"Trailhead pasta pack", chapter:"Trail & park picnics",
    prompt:"At the trailhead, the pasta salad, banana slices, and carrot sticks are marked leftovers. Put those exact foods in the box.",
    stock:{pasta:1,rice:1,banana:1,grapes:1,carrot:1,cucumber:1},
    mustUse:{pasta:1,banana:1,carrot:1}, produce:{fruit:1,vegetable:1},
    why:"Packing the marked pasta, banana, and carrots uses the leftovers first and gives one main plus two kinds of produce."
  },
  {
    id:"river-rice-picnic", name:"River rice picnic", chapter:"Trail & park picnics",
    prompt:"The river picnic list calls for the saved rice cup, grape bunch, and snap peas. Pack those three portions without substitutions.",
    stock:{rice:1,bread:1,grapes:1,berries:1,peas:1,carrot:1},
    mustUse:{rice:1,grapes:1,peas:1}, produce:{fruit:1,vegetable:1},
    why:"The rice is the main, and grapes plus snap peas fill the fruit and vegetable spots while using the saved foods first."
  },
  {
    id:"garden-bean-break", name:"Garden bean break", chapter:"Trail & park picnics",
    prompt:"Garden helpers saved prepared beans, orange wedges, and cucumber rounds for their break. Pack all three marked portions.",
    stock:{beans:1,wrap:1,orange:1,banana:1,cucumber:1,peas:1},
    mustUse:{beans:1,orange:1,cucumber:1}, produce:{fruit:1,vegetable:1},
    why:"The beans make the main while orange and cucumber complete the two produce portions and prevent the marked foods from being wasted."
  },
  {
    id:"share-wrap-colors", name:"Share wrap colors", chapter:"Share & save",
    prompt:"For a colorful shared lunch, use the saved veggie wrap, apple pieces, and carrot sticks before choosing any other foods.",
    stock:{wrap:1,bread:1,apple:1,grapes:1,carrot:1,cucumber:1},
    mustUse:{wrap:1,apple:1,carrot:1}, produce:{fruit:1,vegetable:1},
    why:"The wrap is the main and the apple with carrot make the requested fruit-and-vegetable pair while using the saved portions first."
  },
  {
    id:"two-fruit-pasta-share", name:"Two-fruit pasta share", chapter:"Share & save",
    prompt:"The sharing table requests pasta salad with two different fruits. Use the saved banana slices and mixed berries for both fruit spots.",
    stock:{pasta:1,rice:1,banana:1,berries:1,apple:1,cucumber:1},
    mustUse:{pasta:1,banana:1,berries:1}, produce:{fruit:2,vegetable:0}, differentProduce:true,
    why:"The pasta supplies the main, and banana plus berries are two different fruit portions that match the sharing-table request."
  },
  {
    id:"veggie-rice-share", name:"Veggie rice share", chapter:"Share & save",
    prompt:"Pack a rice cup with two different vegetables for the shared picnic. The saved carrot sticks and snap peas should both be used.",
    stock:{rice:1,beans:1,carrot:1,peas:1,cucumber:1,apple:1},
    mustUse:{rice:1,carrot:1,peas:1}, produce:{fruit:0,vegetable:2}, differentProduce:true,
    why:"Rice gives the main, while carrots and snap peas provide two different vegetables and use the marked food before anything new."
  },
  {
    id:"orange-grape-bread", name:"Orange grape bread box", chapter:"Share & save",
    prompt:"A fruit-focused picnic needs the saved bread sandwich with orange wedges and a grape bunch. Pack those exact three portions.",
    stock:{bread:1,wrap:1,orange:1,grapes:1,banana:1,carrot:1},
    mustUse:{bread:1,orange:1,grapes:1}, produce:{fruit:2,vegetable:0}, differentProduce:true,
    why:"The bread sandwich is the main and the orange plus grapes give two different fruit portions exactly as the picnic note requests."
  },
  {
    id:"bean-apple-cucumber-share", name:"Bean apple cucumber share", chapter:"Share & save",
    prompt:"The community table saved prepared beans, apple pieces, and cucumber rounds. Pack all three before opening any other portions.",
    stock:{beans:1,pasta:1,apple:1,banana:1,cucumber:1,peas:1},
    mustUse:{beans:1,apple:1,cucumber:1}, produce:{fruit:1,vegetable:1},
    why:"Prepared beans make the main, while apple and cucumber fill the produce spots and keep all three saved portions in use."
  },
  {
    id:"pasta-peas-grapes-share", name:"Pasta peas grapes share", chapter:"Share & save",
    prompt:"Use the leftover pasta salad, snap peas, and grape bunch for the neighborhood picnic instead of starting three new portions.",
    stock:{pasta:1,bread:1,peas:1,carrot:1,grapes:1,orange:1},
    mustUse:{pasta:1,peas:1,grapes:1}, produce:{fruit:1,vegetable:1},
    why:"The pasta, peas, and grapes form the requested three-part picnic and demonstrate using prepared leftovers before opening more food."
  },
  {
    id:"wrap-banana-carrot-share", name:"Wrap banana carrot share", chapter:"Share & save",
    prompt:"The picnic cooler already has a veggie wrap, banana slices, and carrot sticks marked for today. Pack those three saved portions.",
    stock:{wrap:1,rice:1,banana:1,berries:1,carrot:1,cucumber:1},
    mustUse:{wrap:1,banana:1,carrot:1}, produce:{fruit:1,vegetable:1},
    why:"The saved wrap provides the main and the banana plus carrot complete the produce pair without leaving those portions behind."
  },
  {
    id:"rice-berries-cucumber-share", name:"Rice berries cucumber share", chapter:"Share & save",
    prompt:"For the shared lunch box, pack the saved rice cup, mixed berries, and cucumber rounds exactly as the food note lists them.",
    stock:{rice:1,beans:1,berries:1,apple:1,cucumber:1,peas:1},
    mustUse:{rice:1,berries:1,cucumber:1}, produce:{fruit:1,vegetable:1},
    why:"The rice is the main and the berries with cucumber provide the two produce portions while using the marked foods first."
  },
  {
    id:"bread-apple-peas-share", name:"Bread apple peas share", chapter:"Share & save",
    prompt:"A family picnic saved a bread sandwich, apple pieces, and snap peas for the first box. Use all three before choosing extras.",
    stock:{bread:1,pasta:1,apple:1,orange:1,peas:1,carrot:1},
    mustUse:{bread:1,apple:1,peas:1}, produce:{fruit:1,vegetable:1},
    why:"The bread sandwich, apple, and snap peas make one complete pretend lunch and clear the marked portions before other food is opened."
  },
  {
    id:"pantry-grand-finale", name:"Pantry grand finale", chapter:"Share & save",
    prompt:"For the final picnic, pack the saved prepared beans, orange wedges, and carrot sticks so every marked portion gets used first.",
    stock:{beans:1,wrap:1,orange:1,grapes:1,carrot:1,cucumber:1},
    mustUse:{beans:1,orange:1,carrot:1}, produce:{fruit:1,vegetable:1},
    why:"The final box uses the saved beans as the main and pairs orange with carrots, finishing the journey with a simple no-waste plan."
  },
];
