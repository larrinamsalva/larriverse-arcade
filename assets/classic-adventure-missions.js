// Dedicated optional learning journeys: sixty unique questions for each classic adventure.
// Fictional safari creatures remain in the original action game. These are nature literacy
// and passenger-friendly travel planning exercises; never instructions for driving.
const natureFacts=[
  {name:"Fox",icon:"🦊",place:["A woodland edge with shrubs and open clearings","A deep coral reef","A treeless glacier"],food:["Small mammals, berries and other varied foods","Only eucalyptus leaves","Only seaweed"],sign:["Tracks with four toe marks and a narrow, dog-like shape","A spiral snail shell","Broad hoof marks"],adapt:["A bushy tail can help with balance and warmth","Fins help it breathe underwater","It uses leaves to make sunlight"],care:["Keep a respectful distance and secure trash or food scraps","Offer it snacks from your hand","Follow it into its den"]},
  {name:"Frog",icon:"🐸",place:["A pond edge with moist plants and hiding places","A dry sand dune without water","The top of an icy mountain"],food:["Small insects caught with a quick tongue","Tree bark only","Large stones"],sign:["Tadpoles swimming in shallow pond water","Feathers in a nest","Claw scratches on a tree trunk"],adapt:["Moist skin helps many frogs exchange gases","A furry coat keeps its gills warm","Hard wings produce birdsong"],care:["Look without touching and help keep local ponds clean","Move every frog to your bathtub","Pour soap into its pond"]},
  {name:"Honeybee",icon:"🐝",place:["Flower-rich meadows and gardens near nesting sites","Deep ocean trenches","The center of a snowy lake"],food:["Nectar for energy and pollen for nutrients","Freshly caught fish","Gravel from a stream"],sign:["A bee visiting blooms and carrying pollen on its legs","A large antler shed","Webbed footprints in mud"],adapt:["A waggle dance can communicate directions to food","A tail works as a fishing rod","It breathes through underwater gills"],care:["Plant locally suitable flowers and watch from a distance","Disturb a busy hive","Spray flowers when bees are visiting"]},
  {name:"Hedgehog",icon:"🦔",place:["Leafy hedgerows and quiet garden edges","Open ocean waves","The tops of tall city towers"],food:["Beetles, worms and other small invertebrates","Only flower nectar","Large tree branches"],sign:["Small nighttime snuffling sounds in leaf litter","A line of enormous hoof prints","A big shell on a beach"],adapt:["Spines discourage many predators","Its feathers provide warmth","A long fin pushes it through water"],care:["Leave a safe wildlife passage through a garden fence","Pick it up to play without help","Leave uncovered deep holes in a yard"]},
  {name:"Octopus",icon:"🐙",place:["Rocky seafloor dens and reefs","A prairie burrow far from water","A desert cactus top"],food:["Crabs, shellfish and other marine animals","Grass seeds from fields","Honey from flowers"],sign:["A den with moved shells near an underwater rock","Nests built from pine needles in trees","A hoof path in snow"],adapt:["Flexible arms and camouflage help it hide","It flies using bright wings","Antlers help it swim"],care:["Admire sea creatures without pulling them from hiding spots","Reach into a den to grab it","Take living reef animals home"]},
  {name:"Dolphin",icon:"🐬",place:["Coastal waters and open sea habitats","Dry farmland","A freshwater puddle"],food:["Fish and squid","Only tree leaves","Dry grass"],sign:["A curved dorsal fin briefly appearing at the surface","A pile of feathers under a tree","Small claws in forest soil"],adapt:["Echolocation helps find objects underwater","Long horns detect wind direction","It grows waterproof feathers"],care:["Stay back from wild dolphins and never feed them","Chase a pod in a boat","Offer bread to wild dolphins"]},
  {name:"Owl",icon:"🦉",place:["Trees, woodland edges and other suitable nesting places","An empty salt-flat without shelter","A deep reef cave underwater"],food:["Small mammals, insects or other prey depending on species","Only tree sap","Pebbles"],sign:["An owl pellet on the ground below a roost","A crab shell in beach sand","An empty butterfly chrysalis"],adapt:["Special wing feathers can make flight unusually quiet","A shark-like fin propels it","It changes into a flower at night"],care:["Observe roosts from afar, especially during nesting season","Flash bright lights into a nesting hole","Climb up to touch the eggs"]},
  {name:"Butterfly",icon:"🦋",place:["Sunny spots with host plants and nectar flowers","A dark underground mining tunnel","A high-wave surf break"],food:["Flower nectar for many adult butterflies","Large fish","Hard river stones"],sign:["A chrysalis attached near a host plant","Antler rubs on tree bark","Webbed tracks at a shoreline"],adapt:["A caterpillar changes form through metamorphosis","Its fur turns into a shellfish","It must keep its wings underwater"],care:["Grow appropriate native host plants and avoid disturbing caterpillars","Pick wings up to feel their color","Remove every caterpillar from leaves"]},
  {name:"Sea Turtle",icon:"🐢",place:["Ocean waters with suitable beaches for nesting","A high-altitude snowy forest","A dry city rooftop"],food:["Seagrass, jellyfish or other foods depending on species","Only dry leaves","Chocolate"],sign:["Flipper tracks in sand near a nesting beach","A fox trail through woodland snow","Claw scratches high in a tree"],adapt:["Flippers move its body through water efficiently","It uses large wings to fly","Its shell is soft enough to fold"],care:["Keep nesting beaches dark, clean and clear of obstacles","Shine flashlights at nesting turtles","Move eggs to your garden"]},
  {name:"Rabbit",icon:"🐇",place:["Grassy meadows, brush and safe hiding cover","Ocean coral","Bare mountain ice"],food:["Grasses and leafy plants","Only insects","Fresh sea fish"],sign:["Paired bounding tracks and small round droppings","A long slimy fish trail","Huge claw marks in rock"],adapt:["Large ears can help detect predators and release heat","It uses gills in shallow rivers","Its fur is covered in scales"],care:["Watch wild rabbits from a distance and protect their habitat","Feed them sweet snacks","Chase babies out of their hiding spots"]},
  {name:"Otter",icon:"🦦",place:["Rivers, lakes or coastal waters depending on the species","Dry mountain peaks without streams","Bare pavement far from water"],food:["Fish, crustaceans and other aquatic prey","Only cactus thorns","Flower petals alone"],sign:["Sliding tracks on a muddy riverbank","An abandoned bird nest high in a pine","A butterfly cocoon"],adapt:["Dense fur helps keep many otters warm in water","Long feathers help them glide","They have hooves for digging"],care:["Keep waterways free of litter and watch from a distance","Throw food to get a closer photograph","Approach resting pups"]},
  {name:"Deer",icon:"🦌",place:["Forest edges and meadows with cover","Coral caves underwater","Roof gutters"],food:["Leaves, twigs and grasses","Only shellfish","Processed candy"],sign:["Two-part hoof prints in damp soil","Webbed footprints of a swimming duck","A curled shell on the beach"],adapt:["Ears, scent and watchfulness help detect danger","Gills help them breathe below the sea","A giant beak drills wooden holes"],care:["Slow down near wildlife crossings and never feed deer","Approach and pet fawns","Leave food beside the road for deer"]}
];
const natureChapters=[
 ["Habitat Detective","Where would a wild {name} most likely find a suitable natural home?","place",
 "Living creatures need suitable habitats that offer shelter and resources."],
 ["Food Web Explorer","What food would a {name} naturally use to survive?","food",
 "Food webs connect living things; different animals have different diets."],
 ["Evidence Tracker","Which sign could help an observer recognize a {name} nearby?","sign",
 "Look for clues from a safe distance instead of chasing wildlife."],
 ["Adaptation Scientist","Which body feature or behavior helps a {name} survive?","adapt",
 "Adaptations help living things survive in their environments."],
 ["Wildlife Guardian","Which choice best protects a wild {name} and its habitat?","care",
 "Respectful observation and habitat care protect both people and animals."]
];
export const creatureMissions=natureChapters.flatMap(([chapter,template,key,why],group)=>
 natureFacts.map((animal,index)=>{
   const options=animal[key],answer=(group+index)%3;
   const rotated=Array.from({length:3},(_,i)=>options[(i-answer+3)%3]);
   return {id:"creature-"+String(group*12+index+1).padStart(2,"0"),
     title:animal.icon+" "+animal.name+" · "+chapter,chapter,
     prompt:template.replace("{name}",animal.name.toLowerCase()),options:rotated,answer,
     why:why+" "+options[0]+".",
     icon:animal.icon};
 }));
const tripPlaces=[
 {name:"Forest Camp",icon:"🌲",route:["Follow marked paths on the park map","Cut across an unmarked closed trail","Enter a restricted maintenance zone"],
 pack:["Reusable water bottle and a suitable layered jacket","Only an empty snack wrapper","No water even on a long walk"],
 weather:["Check the forecast and plan a shorter hike if storms threaten","Assume forest weather never changes","Shelter under the tallest isolated tree during lightning"],
 safety:["Stay with your group and tell an adult before changing trails","Wander away without telling anyone","Follow unfamiliar animal tracks alone"],
 respect:["Stay on designated paths and take your litter home","Carve initials into living trees","Leave food beside wild animals"]},
 {name:"Mountain Pass",icon:"⛰️",route:["Check the planned route and whether the pass is open","Trust a shortcut through a signed closed road","Ignore every road warning"],
 pack:["Warm layers and extra drinking water","Only beach sandals in freezing weather","A heavy glass souvenir and no jacket"],
 weather:["Check snow or ice warnings before the trip","Assume mountains stay warm all day","Wait on an exposed ridge during lightning"],
 safety:["An adult checks the vehicle and chooses a safe stop if weather worsens","The passenger takes control of the steering wheel","Drive past a road-closed barrier"],
 respect:["Use safe scenic pullouts and leave plants undisturbed","Stop in a travel lane for photos","Remove protected wildflowers"]},
 {name:"Sunny Beach",icon:"🏖️",route:["Locate a designated beach entrance and lifeguard area","Climb across unstable closed cliffs","Enter a signed wildlife nesting zone"],
 pack:["Drinking water, shade and sun protection","Only electronic toys","No protection from strong sunlight"],
 weather:["Notice wind and surf warnings before going near water","Assume small-looking waves are always safe","Swim during a thunderstorm"],
 safety:["Ask a lifeguard about conditions and swim with adult supervision","Swim alone far beyond flags","Run into unfamiliar rip currents"],
 respect:["Leave shells with animals in them and dispose of trash","Chase nesting birds","Leave plastic bags where waves can reach them"]},
 {name:"Desert View",icon:"🏜️",route:["Choose a signed visitor trail and note the return route","Walk out without knowing the way back","Cross a restricted area to save a minute"],
 pack:["Extra water, a sun hat and sensible shoes","One tiny drink for everyone","Heavy winter skates"],
 weather:["Plan around extreme heat warnings","Assume shaded rocks cannot get hot","Start the longest walk at peak heat"],
 safety:["Stay on a known trail with an adult and turn back if overheated","Touch unfamiliar desert wildlife","Separate from the group to explore"],
 respect:["Look at cactus plants without touching or damaging them","Remove wild plants from the park","Leave food scraps by burrows"]},
 {name:"Snowy Town",icon:"❄️",route:["Use cleared sidewalks and designated crossings","Slide across an icy roadway","Walk behind a plow truck"],
 pack:["Warm gloves, layers and boots with traction","Bare feet and thin summer clothes","Only a water toy"],
 weather:["Check the ice forecast and dress for wind chill","Treat freezing rain as warm rain","Ignore a blizzard warning"],
 safety:["Walk carefully and cross only where an adult says it is safe","Throw packed snow at car windows","Run onto frozen ponds without checking"],
 respect:["Keep accessible sidewalks clear and help others safely","Build snow piles blocking ramps","Push snow into pedestrian crossings"]},
 {name:"Big City",icon:"🏙️",route:["Choose a well-marked pedestrian route and crossing","Cross six lanes between parked cars","Follow a stranger into a private alley"],
 pack:["A contact card, water and comfortable walking shoes","Only a game console","An unmarked card with private passwords"],
 weather:["Check if heat or rain changes the walking route","Ignore all storm notices","Assume every subway entrance is sheltered"],
 safety:["Stay together and use marked crosswalks when signals allow","Step into traffic while looking at a phone","Follow a flashing advertisement into the street"],
 respect:["Keep ramps and sidewalks clear for everyone","Stand in curb ramps for photos","Block the doorway of a bus"]},
 {name:"River Lookout",icon:"🏞️",route:["Use official viewpoint paths and posted safety signs","Climb over a riverbank barrier","Use a closed slippery shortcut"],
 pack:["Comfortable shoes and a clean water bottle","Loose glass bottles near river edges","No shoes for rocky ground"],
 weather:["Treat recent heavy rainfall as a possible rising-water warning","Assume river levels cannot change","Stand in moving floodwater to test it"],
 safety:["Stay behind barriers and never enter swift water","Lean far over railings for a photo","Try to cross a flood stream on foot"],
 respect:["Keep litter out of rivers and leave aquatic wildlife alone","Throw waste into the water","Pull nesting plants from the bank"]},
 {name:"Farm Country",icon:"🚜",route:["Follow public roads and signed visitor entrances","Cross private fields without permission","Use a closed farm machinery path"],
 pack:["Sturdy closed-toe shoes and a water bottle","Only delicate party shoes","No sun protection for an outdoor visit"],
 weather:["Check for rain and muddy walking conditions","Assume a field is dry after a downpour","Shelter beside active machinery in a storm"],
 safety:["Follow farm host instructions and stay clear of machinery","Climb onto an unattended tractor","Pet unknown livestock through fences"],
 respect:["Respect fences, animals and working crops","Pick crops without asking","Leave gates open behind the group"]},
 {name:"Museum Visit",icon:"🏛️",route:["Read the visitor map and find the accessible entrance","Use an emergency-only stairwell for fun","Climb a closed exhibit barrier"],
 pack:["A small notebook and a refillable bottle where permitted","Sticky food to touch displays","Heavy sharp crafting tools"],
 weather:["Plan a dry sheltered route if it rains","Ignore an outdoor lightning advisory","Leave rain gear in the street"],
 safety:["Follow exhibit rules and ask staff for help when lost","Run through a crowded gallery","Touch displays marked do not touch"],
 respect:["Use quiet voices and give others viewing space","Block wheelchair access to exhibits","Write your name on an exhibit"]},
 {name:"National Park",icon:"🏕️",route:["Check posted trail distances and difficulty before setting out","Start an unknown long trail without a map","Ignore closed-area signs"],
 pack:["Water, weather layers and a map with an adult","Only sweets and no water","A glass bottle for a rocky hike"],
 weather:["Check local advisories for storms or wildfire smoke","Assume all trails have the same forecast","Head toward smoke to investigate"],
 safety:["Let an adult know the plan and follow ranger guidance","Feed a bear from a car window","Leave the trail to chase an animal"],
 respect:["Observe wildlife at a distance and leave natural objects where they belong","Collect protected fossils","Play loud music at nesting sites"]},
 {name:"Train Station",icon:"🚆",route:["Check the platform signs and the correct departure board","Follow a stranger beyond a restricted gate","Guess the destination from train color"],
 pack:["A ticket or pass and a small manageable bag","An unlabelled giant suitcase left alone","No way to contact the group"],
 weather:["Check service alerts when heavy rain or snow may delay travel","Assume trains cannot be delayed","Wait outdoors during a severe-weather warning"],
 safety:["Stand behind platform safety lines with an adult","Step onto tracks to retrieve dropped items","Run across closed platform gates"],
 respect:["Let arriving passengers exit first and keep aisles open","Block doorways with bags","Play loud music over announcements"]},
 {name:"Wetland Walk",icon:"🦆",route:["Use raised boardwalks and marked observation hides","Wade into an unknown marsh","Walk through a protected nesting area"],
 pack:["Binoculars, water and comfortable walking shoes","A net for catching wild birds","Only a loudspeaker"],
 weather:["Check rain and flood advisories before the boardwalk visit","Ignore warnings of rising water","Choose an exposed platform during lightning"],
 safety:["Stay on the boardwalk and keep a safe distance from water","Lean off the rail to touch birds","Jump into deep reeds alone"],
 respect:["Watch wetland animals quietly without feeding them","Drop bread for wild birds","Pick plants from a protected habitat"]}
];
const roadChapters=[
 ["Route Reader","At {place}, which route choice is the responsible one?","route","Routes and closures should be checked before exploring."],
 ["Pack Smart","Which supplies help you prepare for a visit to {place}?","pack","Good planning balances safety, comfort and carrying what you need."],
 ["Weather Wise","The forecast may change at {place}. Which decision makes sense?","weather","Weather can change travel plans. Check reliable forecasts with an adult."],
 ["Passenger Safety","Which behavior is safest while visiting {place}?","safety","These are passenger and walking safety decisions. Never play while operating a vehicle."],
 ["Good Neighbor","Which action shows respect for people or nature at {place}?","respect","Leave places safe and welcoming for the next visitor."]
];
export const roadMissions=roadChapters.flatMap(([chapter,template,key,why],group)=>
 tripPlaces.map((place,index)=>{
   const options=place[key],answer=(group+index+1)%3;
   const rotated=Array.from({length:3},(_,i)=>options[(i-answer+3)%3]);
   return {id:"road-"+String(group*12+index+1).padStart(2,"0"),
     title:place.icon+" "+place.name+" · "+chapter,chapter,
     prompt:template.replace("{place}",place.name),options:rotated,answer,
     why:why+" "+options[0]+".",icon:place.icon};
 }));
