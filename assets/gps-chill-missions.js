import { chillBonusMissions } from "./chill-bonus-missions.js";
// Sixty distinct offline demo-map decisions and sixty optional, untimed calm-skill puzzles.
// No real-world coordinates or tracking. No health/medical claims, pressure, timers or streak gates.
// Each five-part journey visits 12 different real-life-inspired situations. Correct first
// before deterministic rotation for varied answer placement.
const gpsSites=[
 ["Public Library","📚","The book symbol identifies the library entrance","A fuel nozzle means the library","A fork means the library",
  "The accessible front door marked with a book symbol","The marked private delivery loading bay","The locked staff entrance",
  "Stay on the marked public path beside the building","Cut through the staff-only parking lot","Walk behind reversing trucks",
  "Use the pretend map without enabling live GPS","Share your precise location to strangers","Upload a photo showing your home address",
  "Return borrowed books through the correct public drop box","Leave books in a garden bed","Put books on the road"],
 ["Town Park","🌳","A tree icon indicates the public park","A train symbol labels the park","A hospital cross labels the park",
  "The path leading to the posted park entrance","The fenced maintenance equipment yard","A closed habitat restoration area",
  "Use the marked crossing to reach the park gate","Walk across an active road between cars","Climb over a closed fence",
  "Ask an adult before sharing photos that reveal your location","Post your live route to everyone","Show a stranger where your group is standing",
  "Put picnic litter in a bin or carry it home","Feed all wild ducks bread","Pick flowers from a protected patch"],
 ["Bus Stop","🚌","A bus-shaped symbol marks the transit stop","A fish icon marks the stop","A book symbol marks the stop",
  "The signed shelter on the correct side of the street","A bus maintenance depot behind a locked gate","An unrelated curb without a bus sign",
  "Wait back from the curb with your group","Step into the travel lane to wave at a bus","Race across traffic behind a departing bus",
  "Check the timetable without revealing personal movement data","Post your bus number and exact live location publicly","Send your home address to a stranger for help",
  "Leave the priority seating and boarding space open","Block the ramp with a backpack","Leave wrappers on the shelter seat"],
 ["Grocery Store","🛒","A shopping-cart icon marks a grocery store","A tent icon marks the grocery store","A mountain icon marks the store",
  "The signed pedestrian entrance near the walkway","The truck loading dock at the back","An alarmed emergency exit",
  "Walk in marked pedestrian areas of the car park","Run between reversing cars","Play beside moving delivery vans",
  "Use a pretend shopping map without saving GPS trails","Share photos of your payment details","Post where your family is buying groceries now",
  "Return carts to the designated return area","Leave carts across accessible parking","Drop groceries on the path"],
 ["Museum","🏛️","A columned-building icon marks a museum","A skate icon always marks museums","A gas-pump icon marks the museum",
  "The public entrance shown on the visitor map","A closed exhibit preparation room","A staff-only storage corridor",
  "Follow posted visitor routes and keep stairways clear","Run across a crowded exhibit","Climb an unsafe display barrier",
  "Explore the toy museum map while keeping your location private","Share a friend's full name and live coordinates","Upload private family contact information",
  "Look at objects without touching restricted exhibits","Write on a display label","Block a wheelchair access ramp"],
 ["Community Garden","🌱","A seedling symbol marks the community garden","A plane symbol marks the garden","A lighthouse symbol marks the garden",
  "The welcoming public gate with posted visiting hours","A locked compost-equipment shed","A plot labeled private",
  "Use the gate and ask a volunteer which areas are public","Step over growing beds as a shortcut","Touch unknown tools without adult guidance",
  "Use a simulated garden map with no location permission","Broadcast the gardeners' home addresses","Publish the exact location of a private plot",
  "Stay on pathways and leave crops for their gardeners","Pick every ripe tomato without asking","Trample young seedlings"],
 ["Aquarium","🐠","A fish icon identifies the aquarium","A snowflake icon means aquarium","A book icon means aquarium",
  "The ticketed public entrance labeled on the plan","A restricted animal-care laboratory","A locked filter maintenance door",
  "Walk with your group and respect wet-floor signs","Run on a slippery wet floor","Climb over a tank safety rail",
  "Try the aquarium route in demo mode without live GPS","Send a child's location to an unknown chat","Publish the visit time and live position publicly",
  "Respect the no-flash signs around sensitive animals","Tap loudly on the animal tank","Feed animals your own snacks"],
 ["Train Station","🚆","A train icon shows the railway station","A bicycle icon identifies all stations","A flower icon means a station",
  "The concourse entrance shown on the station map","A locked signal-control office","A restricted trackside maintenance gate",
  "Stay behind platform safety lines","Step onto tracks to retrieve a dropped item","Rush across closed crossing gates",
  "Read a pretend station map without sharing coordinates","Post your platform and precise position to strangers","Share a private travel itinerary with unknown users",
  "Let passengers exit before boarding and keep the aisle clear","Leave bags across platform ramps","Block the train door while playing"],
 ["Beach Path","🏖️","An umbrella-on-sand icon marks the beach path","A wrench icon marks swimming access","A library book icon means beach",
  "The marked public boardwalk toward the sand","A signed dune-restoration closure","A fenced lifeguard storage area",
  "Follow surf warnings and stay with your group","Ignore a posted strong-current warning","Enter the water alone during a storm",
  "Use the sandbox map without needing live GPS","Share a private exact beach position publicly","Upload photos containing private address cards",
  "Keep dunes and wildlife nesting sites undisturbed","Walk across a protected nesting zone","Leave plastic wrappers at the shore"],
 ["Nature Trail","🥾","A walking-boot symbol identifies a trailhead","A credit-card icon labels trails","A cutlery icon marks all trails",
  "The public trailhead sign with length and difficulty","A closed firebreak road","An unmarked wildlife management gate",
  "Tell an adult the planned route and stay on signed trails","Walk into a closed area for shortcuts","Explore alone without telling anyone",
  "Choose the offline trail demo; GPS is unnecessary","Send a live wilderness route to random viewers","Reveal a private home location",
  "Stay on the trail and carry litter home","Remove nesting branches","Scratch your initials into trees"],
 ["Sports Center","🏀","A basketball icon marks the sports center","A train symbol marks a basketball gym","A fuel icon marks the court",
  "The marked visitor entry beside the public courts","A locked equipment storage cage","A restricted repair area",
  "Use signed crossings and keep clear of moving bicycles","Run across a cycle lane without looking","Climb onto high spectator barriers",
  "Play the fictional map without sharing your address","Upload another player's home address","Give strangers exact live team locations",
  "Put equipment back and leave accessible space open","Block the ramp with sports bags","Leave bottles on the court"],
 ["Health Clinic","🏥","A medical cross symbol labels the clinic","A guitar icon labels clinics","A tree icon always marks clinics",
  "The marked public reception entrance","A staff-only medicine storage room","A restricted ambulance bay",
  "Use marked pedestrian access and let emergency vehicles through","Stand in a vehicle access lane","Follow a restricted ambulance through a gate",
  "Use the demo map; it is not an emergency service","Trust the game instead of emergency numbers for urgent help","Publish patient information or live clinic visits",
  "Respect others' privacy and keep waiting-room paths clear","Photograph other patients without consent","Block clinic accessibility equipment"]
];
const gpsChapters=[
 ["Map Symbol Sleuth","At {place}, which symbol or clue would identify the place on a toy map?","symbol",
  "Map legends help match landmarks with map symbols."],
 ["Find the Public Entrance","At {place}, which way is a suitable visitor route?","entry",
  "Signs and public entrances are more useful than shortcuts through restricted areas."],
 ["Travel Safely","What is the safer action while visiting {place}?","safety",
  "Stay aware of surroundings. Play only while parked or as a passenger, never while operating a vehicle."],
 ["Location Privacy","Which choice protects personal location privacy at {place}?","privacy",
  "These missions run offline and never require GPS permission or location uploads."],
 ["Leave Places Better","Which action is respectful at {place}?","care",
  "Public spaces and nature remain safer when we follow posted rules and look out for others."]
];
const gpsKeys=["symbol","entry","safety","privacy","care"];
export const gpsMissions=gpsChapters.flatMap(([chapter,template,key,why],group)=>
 gpsSites.map((fields,index)=>{
   const [name,icon,...answers]=fields;
   const pos=gpsKeys.indexOf(key)*3;
   const options=answers.slice(pos,pos+3);
   const answer=(index+group)%3;
   const rotated=Array.from({length:3},(_,n)=>options[(n-answer+3)%3]);
   return {id:"gps-"+String(group*12+index+1).padStart(2,"0"),
    title:icon+" "+name+" · "+chapter,chapter,icon,
    prompt:template.replace("{place}",name),options:rotated,answer,
    why:why+" "+options[0]+"."};
 }));

// Five different gently challenging skills. None are scored as health outcomes,
// and there are no enforced breath holds, countdowns, streaks or audio requirements.
const calmScenes=[
 ["Morning Window","🌤️",
  "The sun is above the house roof","A moon is underneath the water","There is a river inside the sky",
  "Notice your natural breathing while resting comfortably","Hold your breath until it hurts","Force the biggest breath you can manage",
  "Name the three colors on a small picture before moving on","Try to look at every picture on the screen at once","Race the next person to finish first",
  "Shift to a comfortable seated position if you choose","Continue any posture that feels painful","Keep your muscles tensed as hard as possible",
  "Say one kind thing about your own effort today","Compare yourself to everyone else","Call yourself names if a task is hard"],
 ["Rain on Leaves","🌧️",
  "Raindrops make small patterns on a leaf","Rain has to be bright orange","Leaves always become glass in rain",
  "Let breathing stay easy as you listen to a soft rain sound","Breathe faster to match each falling drop","Stop breathing while counting rain",
  "Count four drawn raindrops slowly at your own pace","Count them as fast as possible to earn points","Ignore each drop and guess a total",
  "Move to a dry, comfortable spot if you want","Stand in cold rain until uncomfortable","Keep wet clothing on even if chilled",
  "Offer a gentle word to someone who dislikes storms","Tell them they are silly for feeling worried","Make loud thunder noises to upset them"],
 ["Cozy Reading Nook","📚",
  "A book has a front and back cover","A closed book is always empty","A bookshelf is made from rainwater",
  "Read one short line with an easy, relaxed breath","Hold your breath for the entire page","Try to inhale while speaking as fast as possible",
  "Find two letters that appear twice in a sentence","Only look for letters nobody wrote","Rush ahead without looking at the words",
  "Rest your eyes by looking away from the page briefly","Stare without blinking until your eyes hurt","Read in a position that strains your neck",
  "Tell a friend their reading practice matters","Laugh at their slower reading speed","Say they must finish faster than you"],
 ["Quiet Garden","🌼",
  "A flower has petals surrounding its center","A flower is a kind of metal cup","Flowers always grow inside plastic toys",
  "Take an easy breath and let your shoulders settle if comfortable","Force a long breath hold before looking at flowers","Breathe as quickly as you can",
  "Look for a leaf, a stem, and a flower in an illustration","Count only the invisible plants","Try to remember every garden in the world",
  "Relax your hands and rest them somewhere comfortable","Squeeze your fingers until they hurt","Keep your arms raised while tired",
  "Be gentle with a child learning to grow their first seed","Scold them for a seed that did not sprout","Pull out their plant as a joke"],
 ["Beach Shells","🐚",
  "A seashell can show a curved spiral","Every shell is a square window","Seashells float in clouds by themselves",
  "Breathe naturally while imagining a calm shoreline","Time your breaths to beat a speed record","Hold each breath longer than the last",
  "Trace one spiral shape with your eyes at your own pace","Try to trace it while spinning quickly","Close your eyes and guess its color",
  "Choose to sit or lie down in a safe comfortable place","Keep sitting on sharp stones if it hurts","Stay under strong sun without moving",
  "Leave living sea creatures in their natural home","Take every live creature as a prize","Throw shells at other visitors"],
 ["Windy Tree","🌳",
  "A tree trunk supports branches","Trees grow by drinking gasoline","Every tree has a metal trunk",
  "Let your breathing remain natural as the breeze comes and goes","Try to stop breathing whenever wind blows","Force your breathing to match a fan",
  "Notice which way three leaves point in an illustration","Guess without inspecting any leaves","Spin around rapidly while counting",
  "Let your shoulders rest if that position feels comfortable","Keep your shoulders tightly raised if they hurt","Stretch farther even when it becomes painful",
  "Help someone protect a small sapling","Pull on its new branches for fun","Leave trash tangled around the roots"],
 ["Starlight Sky","⭐",
  "Stars may look like points of light in a dark sky","Stars are tiny holes in a painted ceiling","Every star can be touched from the ground",
  "Let breathing happen naturally as you notice the sky","Hold air until you feel dizzy","Take sudden forced breaths repeatedly",
  "Count five drawn stars without needing to hurry","Count 100 stars in one second","Look for a sound instead of a shape",
  "Find a comfortable resting position for your neck","Tilt your neck painfully to see more sky","Keep moving even if you need a break",
  "Encourage a friend who finds counting difficult","Tell them only perfect answers count","Take away their drawing for a mistake"],
 ["River Pebbles","🪨",
  "River pebbles can have smooth rounded edges","Every stone is made of soft candy","Pebbles always have feathers",
  "Breathe at your ordinary pace while watching flowing water","Breathe in river water","Race your breathing to the strongest current",
  "Sort a picture of stones into large and small groups","Mix all shapes without checking sizes","Count the spaces where no stones appear",
  "Choose a comfortable spot away from slippery river edges","Sit where fast water can pull you in","Balance on a slippery rock to relax",
  "Keep the river clean for other visitors","Drop wrappers into moving water","Disturb animals resting by the bank"],
 ["Mountain Clouds","☁️",
  "Clouds can partly cover a mountain peak","Mountains turn into balloons when clouds appear","Clouds are solid concrete",
  "Let your breath be comfortable while imagining soft clouds","Try to hold a breath until the clouds move","Breathe forcefully to make a cloud move faster",
  "Spot a large cloud, a small cloud, and a clear gap","Identify an invisible cloud behind the picture","Name each cloud without looking",
  "Take a break if you feel cold or uncomfortable","Ignore every sign that you need rest","Force a stretch while shivering",
  "Help your group choose a safe place to rest","Tease someone for being tired","Leave a friend alone on an unfamiliar trail"],
 ["Butterfly Meadow","🦋",
  "Butterflies have two pairs of wings","Butterflies have wheels instead of wings","A butterfly is a tiny paper plane",
  "Breathe easily while you watch a pretend butterfly land","Make yourself breathe as fast as fluttering wings","Stop breathing while the butterfly moves",
  "Find matching patterns on a butterfly's two sides","Choose patterns with your eyes shut without viewing them","Count insects that are not in the picture",
  "Rest your hands if they become tired from tapping","Keep tapping even if your wrists hurt","Grip the screen as hard as you can",
  "Speak kindly about a different kind of animal","Say only colorful creatures matter","Scare away all insects for fun"],
 ["Warm Blanket","🧣",
  "A soft blanket can keep a person warmer","Blankets are made from glass windows","Blankets turn night into daytime",
  "Let your breath remain gentle while you settle under a blanket","Press the blanket over your nose to test breathing","Try the longest breath hold possible",
  "Notice one repeating stripe or shape in a blanket pattern","Force yourself to memorize 200 squares","Pretend there are no stripes at all",
  "Adjust the blanket if it becomes too hot or uncomfortable","Stay overheated without moving","Wrap it tightly around your face",
  "Thank someone who helps make a shared space comfortable","Demand that nobody else can use blankets","Mock someone for feeling cold"],
 ["Soft Lantern","🏮",
  "A lantern can give a warm gentle light","A lantern is an animal with wings","Lanterns make sunlight from rain",
  "Take a relaxed natural breath while watching steady light","Force your breath to match a flashing alarm","Hold your breath until the lantern dims",
  "Find which of three shapes matches the lantern's outline","Choose an unshown shape without checking","Look only at the timer to find it",
  "Lower brightness or rest your eyes if the light is uncomfortable","Stare at a bright bulb until it hurts","Keep your eyes close to a hot flame",
  "Share a gentle encouraging message before bedtime","Tell someone they failed if they feel awake","Make fun of someone needing quiet time"]
];
const chillChapters=[
 ["Gentle Observation","In {scene}, which detail could you notice in a calm picture?","observe",
  "Noticing one clear detail can make a simple visual observation game."],
 ["Easy Breathing Choices","While imagining {scene}, which breathing choice is comfortable and safe?","breathe",
  "Let breathing stay natural. Stop or skip any exercise that feels uncomfortable."],
 ["Unhurried Focus","Which small noticing or counting task fits {scene}?","focus",
  "Practice at your own pace. No timer, forced focus, or perfect speed is needed."],
 ["Comfort Check","At {scene}, which choice respects your body's comfort?","comfort",
  "You can move, rest, stop or change position whenever you need."],
 ["Kindness Practice","What kind action makes sense around {scene}?","kindness",
  "Kindness includes caring for yourself, others and the world around you."]
];
const calmKeys=["observe","breathe","focus","comfort","kindness"];
const chillBaseMissions=chillChapters.flatMap(([chapter,template,key,why],group)=>
 calmScenes.map((fields,index)=>{
   const [name,icon,...answers]=fields;
   const options=answers.slice(calmKeys.indexOf(key)*3,calmKeys.indexOf(key)*3+3);
   const answer=(index+group+2)%3;
   const rotated=Array.from({length:3},(_,n)=>options[(n-answer+3)%3]);
   return {id:"chill-"+String(group*12+index+1).padStart(2,"0"),
     title:icon+" "+name+" · "+chapter,chapter,icon,
     prompt:template.replace("{scene}",name.toLowerCase()),options:rotated,answer,
     why:why+" "+options[0]+"."};
 }));
export const chillMissions=[...chillBaseMissions,...chillBonusMissions];
