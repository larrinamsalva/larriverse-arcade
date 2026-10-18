// Twenty additional Garden Grow & Harvest challenges.
// These reuse the established garden artwork vocabulary so every new level stays visual,
// deterministic, and compatible with the existing accessibility and artwork validators.
export const gardenBonusChallenges = [
  {
    id:"garden-bed-sun-map",rank:"Bed Builder",scene:"sunny-bed",title:"Map the sunny hours",
    prompt:"You watched the yard for a day. Which note best helps you choose a bed for sun-loving vegetables?",
    clues:["Write down when direct sun reaches the spot","Compare more than one location","Check the seed packet too"],
    options:[
      {label:"A simple sun map showing which bed gets long direct light",art:"sunny-bed"},
      {label:"A guess made without looking outside",art:"shade-bed"},
      {label:"A note about the color of the fence only",art:"walkway-bed"}],
    answer:0,why:"A simple sun map turns observation into a useful garden plan. Plant labels still tell you how much sun each crop needs."
  },
  {
    id:"garden-bed-reach",rank:"Bed Builder",scene:"raised-bed",title:"Build a bed you can reach",
    prompt:"Which raised-bed plan makes it easiest to care for the middle without stepping on the soil?",
    clues:["Reach from the path","Keep feet out of planting soil","Leave room to work"],
    options:[
      {label:"A bed narrow enough to reach from both sides",art:"raised-bed"},
      {label:"A bed so wide the center can only be reached by walking on it",art:"puddle-bed"},
      {label:"No path around the bed",art:"concrete"}],
    answer:0,why:"A reachable bed protects loose soil and makes planting, watering, and harvesting easier."
  },
  {
    id:"garden-compost-layer",rank:"Bed Builder",scene:"compost",title:"Mix in finished compost",
    prompt:"Where should finished compost go when preparing a vegetable bed?",
    clues:["Use finished compost","Mix with the growing soil","Do not bury trash"],
    options:[
      {label:"Mixed through the top layer of garden soil",art:"compost"},
      {label:"Replaced with plastic wrappers",art:"plastic-trash"},
      {label:"Poured on as a thick layer of salt",art:"salt"}],
    answer:0,why:"Finished compost can improve soil structure and organic matter when mixed into the bed with adult guidance."
  },
  {
    id:"garden-path-reach",rank:"Bed Builder",scene:"garden-path",title:"Leave a working path",
    prompt:"Which layout helps a gardener reach crops without crushing the growing area?",
    clues:["Walk beside the bed","Keep soil loose","Make room for a watering can"],
    options:[
      {label:"A clear path beside the planting bed",art:"garden-path"},
      {label:"A walkway straight through the seedlings",art:"walkway-bed"},
      {label:"A roof covering the whole garden",art:"roof-bed"}],
    answer:0,why:"A clear path keeps foot traffic out of the bed and gives gardeners room to carry tools and water."
  },
  {
    id:"garden-label-details",rank:"Bed Builder",scene:"plant-label",title:"Make a useful plant label",
    prompt:"Which label gives the family the most helpful information later?",
    clues:["Name the crop","Add the planting date","Use weather-safe writing"],
    options:[
      {label:"Tomato · planted April 12",art:"plant-label"},
      {label:"A blank rock with no words",art:"rock"},
      {label:"A toy placed near the row",art:"toy"}],
    answer:0,why:"A crop name and planting date help everyone remember what is growing and when to expect the next care step."
  },
  {
    id:"garden-depth-check",rank:"Planting Partner",scene:"seed-depth",title:"Double-check seed depth",
    prompt:"Two seed packets list different planting depths. What should you do?",
    clues:["Different seeds have different needs","Read each packet","Measure shallow depths carefully"],
    options:[
      {label:"Follow the depth printed on each seed packet",art:"seed-depth"},
      {label:"Plant every seed one foot deep",art:"deep-seed"},
      {label:"Leave every seed uncovered on a shelf",art:"shelf-seed"}],
    answer:0,why:"Seed size and crop type affect planting depth, so the packet is a better guide than one rule for every seed."
  },
  {
    id:"garden-spacing-thin",rank:"Planting Partner",scene:"spacing",title:"Give crowded seedlings room",
    prompt:"A row sprouted much closer together than the packet recommends. What is the best plan?",
    clues:["Crowded plants compete","Keep the strongest spacing","Ask an adult before thinning"],
    options:[
      {label:"Thin or move seedlings with adult help to the recommended spacing",art:"spacing"},
      {label:"Push every seedling into one pile",art:"seed-pile"},
      {label:"Remove every plant from the row",art:"empty-row"}],
    answer:0,why:"Recommended spacing gives leaves and roots room for light, air, water, and nutrients."
  },
  {
    id:"garden-carrot-loose-soil",rank:"Planting Partner",scene:"carrot-row",title:"Help root crops grow straight",
    prompt:"Which soil is friendliest for carrots and other long root crops?",
    clues:["Roots need room to expand","Hard clods can bend roots","Drainage still matters"],
    options:[
      {label:"Loose, crumbly garden soil with stones removed",art:"carrot-row"},
      {label:"Solid rock",art:"rock"},
      {label:"A sealed tub full of standing water",art:"puddle-bed"}],
    answer:0,why:"Loose soil gives developing roots room to grow and can reduce twisting around rocks or hard clods."
  },
  {
    id:"garden-transplant-water",rank:"Planting Partner",scene:"tomato-transplant",title:"Settle a new transplant",
    prompt:"After gently planting a seedling, what is a helpful next step?",
    clues:["Settle soil around roots","Use gentle water","Avoid blasting the stem"],
    options:[
      {label:"Water gently around the root ball",art:"watering-can"},
      {label:"Pull hard on the stem to test it",art:"pull-stem"},
      {label:"Leave the roots exposed to dry",art:"dry-roots"}],
    answer:0,why:"Gentle watering settles soil around the root ball and helps the transplant adjust without washing soil away."
  },
  {
    id:"garden-trellis-early",rank:"Planting Partner",scene:"trellis",title:"Add support before vines tangle",
    prompt:"When is a good time to place a trellis for climbing peas or cucumbers?",
    clues:["Young vines are easier to guide","Avoid damaging big roots later","Make the support sturdy"],
    options:[
      {label:"Early, while plants are still small",art:"trellis"},
      {label:"After vines are crushed on the ground",art:"box"},
      {label:"Only after harvest is finished",art:"puddle-bed"}],
    answer:0,why:"Installing support early gives vines something to climb and reduces the need to disturb roots later."
  },
  {
    id:"garden-morning-water",rank:"Garden Care Crew",scene:"root-watering",title:"Choose a calmer watering time",
    prompt:"On a hot day, which plan usually helps water reach roots with less waste?",
    clues:["Aim at the soil","Cooler times reduce evaporation","Follow local watering rules"],
    options:[
      {label:"Water the soil near the roots in the cooler morning",art:"root-watering"},
      {label:"Spray only the sidewalk at noon",art:"sidewalk-water"},
      {label:"Water the garden sign instead of the plants",art:"wet-label"}],
    answer:0,why:"Cooler morning watering at the root zone can reduce evaporation and gives leaves time to dry if they get wet."
  },
  {
    id:"garden-soil-second-check",rank:"Garden Care Crew",scene:"soil-test",title:"Check below a dry surface",
    prompt:"The very top of the soil looks dry. What should you do before watering again?",
    clues:["The surface can dry first","Check slightly below it","Different containers dry at different speeds"],
    options:[
      {label:"Feel the soil a little below the surface",art:"soil-test"},
      {label:"Water only because the clock says so",art:"clock"},
      {label:"Guess without checking anything",art:"guess-water"}],
    answer:0,why:"A quick soil check gives better information than the surface alone and can help prevent overwatering."
  },
  {
    id:"garden-mulch-space",rank:"Garden Care Crew",scene:"mulch",title:"Leave breathing room around stems",
    prompt:"Which mulch picture protects soil without crowding the plant stem?",
    clues:["Cover bare soil","Keep mulch off the stem","Do not bury leaves"],
    options:[
      {label:"A thin mulch layer with a small open ring around the stem",art:"mulch"},
      {label:"Mulch packed tightly over the stem and leaves",art:"buried-plant"},
      {label:"Plastic trash touching the crop",art:"plastic-trash"}],
    answer:0,why:"Mulch can reduce moisture loss and weeds, but a little space around the stem helps avoid constant dampness there."
  },
  {
    id:"garden-support-soft-tie",rank:"Garden Care Crew",scene:"tomato-support",title:"Tie a tall plant gently",
    prompt:"Which tie is safest for supporting a growing tomato stem?",
    clues:["Stems get thicker","Ties should not cut in","Support should be sturdy"],
    options:[
      {label:"A soft loose tie attached to a stake or cage",art:"tomato-support"},
      {label:"A tight wire cutting into the stem",art:"tight-wire"},
      {label:"A blanket wrapped over every leaf",art:"covered-plant"}],
    answer:0,why:"A soft, loose tie supports the stem while leaving room for it to thicken as the plant grows."
  },
  {
    id:"garden-pest-observe",rank:"Garden Care Crew",scene:"leaf-check",title:"Look before treating",
    prompt:"You spot holes in several leaves. What should happen before anyone uses a garden treatment?",
    clues:["Look for the cause","Check both sides of leaves","Get adult help"],
    options:[
      {label:"Inspect the plant and identify the cause with a trusted adult",art:"leaf-check"},
      {label:"Spray an unknown chemical immediately",art:"unknown-spray"},
      {label:"Taste the damaged leaf to test it",art:"taste-plant"}],
    answer:0,why:"Observation and correct identification come first. Garden treatments should only be used with responsible adult help and label directions."
  },
  {
    id:"garden-ripe-color",rank:"Harvest & Freshness",scene:"ripe-tomato",title:"Compare ripe color and size",
    prompt:"Which clue is most useful when deciding whether a tomato is ready to harvest?",
    clues:["Know the variety's ripe color","Look for full size","Check gently"],
    options:[
      {label:"The fruit matches its expected ripe color and size",art:"ripe-tomato"},
      {label:"It is still only a flower",art:"tomato-flower"},
      {label:"It has visible mold and damage",art:"moldy-fruit"}],
    answer:0,why:"Color, size, and gentle feel are useful ripeness clues, though different tomato varieties can ripen to different colors."
  },
  {
    id:"garden-carrot-one-test",rank:"Harvest & Freshness",scene:"carrot-harvest",title:"Test one root crop first",
    prompt:"The packet says carrots may be ready. What is a smart way to check?",
    clues:["Look at the top of the root","Loosen soil gently","Do not disturb the whole row"],
    options:[
      {label:"Gently test one carrot with an adult",art:"carrot-harvest"},
      {label:"Pull every tiny seedling at once",art:"tiny-carrots"},
      {label:"Wait until the whole row is rotten",art:"rotten-carrot"}],
    answer:0,why:"Testing one root gives useful information while leaving the rest of the crop undisturbed."
  },
  {
    id:"garden-lettuce-clean-cut",rank:"Harvest & Freshness",scene:"lettuce-harvest",title:"Harvest clean outer leaves",
    prompt:"Which method helps leaf lettuce keep producing?",
    clues:["Take clean outer leaves","Protect the center","Use clean hands or adult-approved tools"],
    options:[
      {label:"Harvest a few outer leaves and leave the center growing",art:"lettuce-harvest"},
      {label:"Step on the center of the plant",art:"step-plant"},
      {label:"Pull all the roots for one leaf",art:"uproot-lettuce"}],
    answer:0,why:"Many leaf lettuces can keep growing when clean outer leaves are harvested without damaging the center."
  },
  {
    id:"garden-harvest-basket",rank:"Harvest & Freshness",scene:"clean-basket",title:"Use a food-safe harvest basket",
    prompt:"Which container is the better choice for carrying vegetables to the kitchen?",
    clues:["Use a clean container","Avoid chemical buckets","Wash produce before eating"],
    options:[
      {label:"A clean basket used for food",art:"clean-basket"},
      {label:"A dirty bucket that held chemicals",art:"dirty-bucket"},
      {label:"A container holding unknown garden treatments",art:"unknown-spray"}],
    answer:0,why:"A clean food-safe container lowers the chance of contaminating freshly harvested produce."
  },
  {
    id:"garden-berry-sort",rank:"Harvest & Freshness",scene:"berry-storage",title:"Sort berries before chilling",
    prompt:"You find one damaged berry in a fresh basket. What should you do before storing the rest?",
    clues:["Remove damaged fruit","Keep sound berries cool","Wash before eating"],
    options:[
      {label:"Remove the damaged berry and refrigerate the sound dry berries",art:"berry-storage"},
      {label:"Leave them all in a hot sunny car",art:"hot-berries"},
      {label:"Hide the damaged berry under the good ones",art:"moldy-fruit"}],
    answer:0,why:"Removing damaged fruit and keeping sound berries cool and dry can help the rest stay fresh longer."
  }
];
