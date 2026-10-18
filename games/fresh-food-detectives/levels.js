export const CHAPTERS = [
  {title:"Date Hunt",icon:"🔎",summary:"Find the printed date on familiar packages."},
  {title:"Label Words",icon:"🏷️",summary:"Learn what common date-label phrases are telling you."},
  {title:"Use First",icon:"🧺",summary:"Practice first-in, first-out without treating quality dates as safety tests."},
  {title:"Cold Foods",icon:"🥛",summary:"Check labels and storage directions on refrigerated foods."},
  {title:"Deli & Dinner",icon:"🥪",summary:"Read refrigerated package labels and know when to ask an adult."},
  {title:"Frozen Aisle",icon:"❄️",summary:"Read frozen-food labels and package directions."},
  {title:"Cans, Jars & Boxes",icon:"🥫",summary:"Find dates and notice damaged packaging."},
  {title:"Snacks & Drinks",icon:"🧃",summary:"Read dates and after-opening directions on everyday foods."},
  {title:"Bread Tie Lab",icon:"🥖",summary:"Use a sample bakery color chart without pretending it is universal."},
  {title:"Code Detective",icon:"🔢",summary:"Tell a printed date from a manufacturer lot or batch code."},
  {title:"Shelf Rotation",icon:"🛒",summary:"Put older quality dates in front and newer ones behind."},
  {title:"Big Grocery Check",icon:"🕵️",summary:"Mix all the skills in full shopping and kitchen challenges."},
];

export const SAMPLE_BAKERY = {
  name:"Sunny Bakery",
  note:"Practice chart only — real bakeries and stores may use different colors. Always check the printed package information.",
  colors:[
    {color:"Blue",day:"Monday",hex:"#4386df"},
    {color:"Green",day:"Tuesday",hex:"#53a96a"},
    {color:"Red",day:"Thursday",hex:"#d65a5a"},
    {color:"White",day:"Friday",hex:"#f4f2e9"},
    {color:"Yellow",day:"Saturday",hex:"#e7bd3c"},
  ]
};

export const PRODUCTS = [
  ["Sandwich bread","bread","🥖","bag neck or printed panel","pantry"],
  ["Whole-wheat bread","bread","🍞","bag neck or printed panel","pantry"],
  ["Bagels","bread","🥯","bag clip area or printed panel","pantry"],
  ["Hamburger buns","bread","🍔","bag neck or printed panel","pantry"],
  ["Milk","carton","🥛","top flap or near the cap","fridge"],
  ["Chocolate milk","carton","🥛","top flap or near the cap","fridge"],
  ["Yogurt","cup","🥣","lid or cup rim","fridge"],
  ["Greek yogurt","cup","🥣","lid or cup rim","fridge"],
  ["Eggs","eggs","🥚","carton end or top panel","fridge"],
  ["Cheddar cheese","deli","🧀","front or back seal area","fridge"],
  ["String cheese","deli","🧀","outer package seam","fridge"],
  ["Deli turkey","deli","🥪","front label or package seam","fridge"],
  ["Hot dogs","deli","🌭","front label or package seam","fridge"],
  ["Fresh pasta","deli","🍝","front label or package edge","fridge"],
  ["Frozen peas","frozen","🫛","back or side panel","freezer"],
  ["Frozen berries","frozen","🫐","back or side panel","freezer"],
  ["Frozen pizza","frozen","🍕","side flap or back panel","freezer"],
  ["Frozen waffles","frozen","🧇","side flap or back panel","freezer"],
  ["Canned beans","can","🥫","can end, lid, or printed label","pantry"],
  ["Canned tomatoes","can","🥫","can end, lid, or printed label","pantry"],
  ["Soup can","can","🍲","can end, lid, or printed label","pantry"],
  ["Peanut butter","jar","🥜","lid, shoulder, or back label","pantry"],
  ["Pasta sauce","jar","🍅","lid or jar shoulder","pantry"],
  ["Jam","jar","🍓","lid or jar shoulder","pantry"],
  ["Cereal","box","🥣","top flap or bottom panel","pantry"],
  ["Crackers","box","🍘","top flap or bottom panel","pantry"],
  ["Pasta","box","🍝","top or bottom flap","pantry"],
  ["Rice","bag","🍚","back seam or printed panel","pantry"],
  ["Tortilla chips","bag","🌽","back seam or printed panel","pantry"],
  ["Pretzels","bag","🥨","back seam or printed panel","pantry"],
  ["Orange juice","bottle","🧃","cap, neck, or shoulder","fridge"],
  ["Apple juice","bottle","🧃","cap, neck, or shoulder","pantry"],
  ["Ketchup","bottle","🍅","cap, neck, or back label","pantry"],
  ["Salad dressing","bottle","🥗","cap, neck, or back label","fridge"],
  ["Mayonnaise","jar","🥪","lid, shoulder, or back label","fridge"],
  ["Granola bars","box","🍫","box flap or individual wrapper","pantry"],
  ["Fruit snacks","bag","🍓","back seam or printed panel","pantry"],
  ["Oatmeal","box","🥣","top or bottom panel","pantry"],
  ["Flour","bag","🌾","back seam or printed panel","pantry"],
  ["Sugar","bag","🧁","back seam or printed panel","pantry"],
  ["Coffee","bag","☕","back seam or bottom panel","pantry"],
  ["Tea","box","🫖","bottom or side panel","pantry"],
  ["Butter","deli","🧈","outer carton or wrapper seam","fridge"],
  ["Cream cheese","cup","🧀","lid or tub rim","fridge"],
  ["Hummus","cup","🫘","lid or tub rim","fridge"],
  ["Salsa","jar","🌶️","lid or jar shoulder","fridge"],
  ["Applesauce cups","cup","🍎","foil lid or carton panel","pantry"],
  ["Shelf-stable milk","carton","🥛","top flap or side panel","pantry"],
].map(([name,kind,icon,dateSpot,storage],id)=>({id,name,kind,icon,dateSpot,storage}));

const qualityLabels=[
  {
    phrase:"Best if Used By",
    meaning:"A quality date: the maker expects best flavor or quality by this date.",
    wrong:["A guaranteed unsafe-after date","The day the store must throw it away","A secret batch number"]
  },
  {
    phrase:"Best By",
    meaning:"Usually a quality date, not a universal food-safety cutoff.",
    wrong:["A universal federal safety deadline","The day the food was cooked","A bread-tie color code"]
  },
  {
    phrase:"Sell By",
    meaning:"A store stock-rotation date; it is not automatically the same as an unsafe-to-eat date.",
    wrong:["A command for kids to eat it that day","The day it was frozen","A universal expiration rule"]
  },
  {
    phrase:"Freeze By",
    meaning:"A date the maker uses to guide quality when freezing the product.",
    wrong:["The day the freezer stops working","A batch number","A bread delivery color"]
  },
];

const dateText=i=>["OCT 24","NOV 02","NOV 18","DEC 05","DEC 19","JAN 07","JAN 21","FEB 04","FEB 18","MAR 03"][i%10];
const lotText=i=>["LOT L7A24","BATCH Q18X","PLT 4C7","RUN 22B","LN A903","LOT M51Z","PKG X72","BATCH R11","LINE 8K2","LOT V44"][i%10];
const rotate=(values,offset)=>{
  const n=((offset%values.length)+values.length)%values.length;
  return values.slice(n).concat(values.slice(0,n));
};
const make=(chapter,slot,data)=>({id:`fresh-${String(chapter+1).padStart(2,"0")}-${String(slot+1).padStart(2,"0")}`,chapter,...data});

const levels=[];
for(let chapter=0;chapter<12;chapter++){
  for(let slot=0;slot<10;slot++){
    const p=PRODUCTS[(chapter*7+slot*3)%PRODUCTS.length];
    if(chapter===0){
      const opts=rotate([p.dateSpot,"nutrition facts only","brand logo only","the biggest picture on the package"],slot%4);
      levels.push(make(chapter,slot,{title:`Find the date · ${p.name}`,product:p,visualLabel:`BEST IF USED BY ${dateText(slot)}`,prompt:`Where should you look first for the printed date on this ${p.name.toLowerCase()} package?`,options:opts,answer:opts.indexOf(p.dateSpot),explanation:`Start with the ${p.dateSpot}. Date placement varies, so scan the package carefully.`}));
    }else if(chapter===1){
      const d=qualityLabels[slot%qualityLabels.length];
      const opts=rotate([d.meaning,...d.wrong],slot%4);
      levels.push(make(chapter,slot,{title:`${d.phrase} · what does it tell you?`,product:p,visualLabel:`${d.phrase.toUpperCase()} ${dateText(slot)}`,prompt:`What is the best kid-friendly meaning of “${d.phrase}” on many U.S. food packages?`,options:opts,answer:opts.indexOf(d.meaning),explanation:d.meaning+" Printed date phrases are not fully uniform across U.S. foods; check package directions and ask an adult when unsure."}));
    }else if(chapter===2){
      const older=["OCT 21","NOV 04","NOV 19","DEC 02"][slot%4], newer=["NOV 14","DEC 01","DEC 22","JAN 08"][slot%4];
      const correct=`${older} — put this one in front`;
      const opts=rotate([correct,`${newer} — put this one in front`,"Ignore both dates","Choose by package color only"],slot%4);
      levels.push(make(chapter,slot,{title:`Use-first shelf · ${p.name}`,product:p,visualLabel:`BEST IF USED BY ${older}`,prompt:`Two unopened ${p.name.toLowerCase()} packages have been stored the same way. For simple first-in, first-out rotation, which quality date should go in front?`,options:opts,answer:opts.indexOf(correct),explanation:"Put the older quality date in front so it is noticed first. This is a rotation habit, not a promise that a date alone proves food is safe."}));
    }else if(chapter===3){
      const cold=PRODUCTS.filter(x=>x.storage==="fridge")[(slot*2)%PRODUCTS.filter(x=>x.storage==="fridge").length];
      const correct="Read the package directions and keep it refrigerated as directed";
      const opts=rotate([correct,"Leave it on a sunny counter","Use the bread-tie color to decide","Scratch off the date"],slot%4);
      levels.push(make(chapter,slot,{title:`Cold-food check · ${cold.name}`,product:cold,visualLabel:`BEST IF USED BY ${dateText(slot)}`,prompt:`What is the smartest first habit with this ${cold.name.toLowerCase()}?`,options:opts,answer:opts.indexOf(correct),explanation:"Read the printed label and follow storage directions. Refrigerated foods need proper cold storage; ask an adult if you are unsure."}));
    }else if(chapter===4){
      const deli=PRODUCTS.filter(x=>["deli","cup","eggs"].includes(x.kind))[(slot*3)%PRODUCTS.filter(x=>["deli","cup","eggs"].includes(x.kind)).length];
      const correct="Check the printed label, storage directions, and ask an adult if anything seems wrong";
      const opts=rotate([correct,"Taste it first to test it","Use only the package color","Assume every date phrase means exactly the same thing"],slot%4);
      levels.push(make(chapter,slot,{title:`Deli detective · ${deli.name}`,product:deli,visualLabel:`USE BY ${dateText(slot)}`,prompt:"Which choice uses the most reliable information before eating or serving this refrigerated food?",options:opts,answer:opts.indexOf(correct),explanation:"Use the printed label and storage directions, and involve an adult when a refrigerated food is questionable. Do not taste food just to test whether it is safe."}));
    }else if(chapter===5){
      const frozen=PRODUCTS.filter(x=>x.storage==="freezer")[slot%PRODUCTS.filter(x=>x.storage==="freezer").length];
      const correct="Check the printed date and follow the package’s frozen-storage and cooking directions";
      const opts=rotate([correct,"Leave it thawing anywhere all day","Ignore a torn package","Use a bread-tie chart"],slot%4);
      levels.push(make(chapter,slot,{title:`Frozen aisle · ${frozen.name}`,product:frozen,visualLabel:`BEST IF USED BY ${dateText(slot)}`,prompt:`What should you do with this ${frozen.name.toLowerCase()}?`,options:opts,answer:opts.indexOf(correct),explanation:"Frozen foods still need label reading. Follow the package’s storage and cooking directions and ask an adult for help."}));
    }else if(chapter===6){
      const shelf=PRODUCTS.filter(x=>["can","jar","box"].includes(x.kind))[slot%PRODUCTS.filter(x=>["can","jar","box"].includes(x.kind)).length];
      const damage=slot%3===0?"bulging":slot%3===1?"leaking":"badly torn or unsealed";
      const correct="Do not use it; show an adult and choose an undamaged package";
      const opts=rotate([correct,"Hide the damage under another label","Taste a little first","Only check the price"],slot%4);
      levels.push(make(chapter,slot,{title:`Package check · ${shelf.name}`,product:shelf,visualLabel:`BEST IF USED BY ${dateText(slot)}`,prompt:`The package is ${damage}. What is the smart choice?`,options:opts,answer:opts.indexOf(correct),explanation:"Damaged, leaking, bulging, open, or badly torn packages should not be chosen. Package condition matters in addition to date labels."}));
    }else if(chapter===7){
      const everyday=PRODUCTS.filter(x=>["bag","bottle","box","jar"].includes(x.kind))[(slot*4)%PRODUCTS.filter(x=>["bag","bottle","box","jar"].includes(x.kind)).length];
      const correct="Read both the printed date and any “refrigerate after opening” or storage directions";
      const opts=rotate([correct,"Use only the front picture","Ignore directions after opening","Guess based on package size"],slot%4);
      levels.push(make(chapter,slot,{title:`After-opening clue · ${everyday.name}`,product:everyday,visualLabel:`BEST IF USED BY ${dateText(slot)}`,prompt:"What information should you check besides the date on an everyday snack, drink, or condiment?",options:opts,answer:opts.indexOf(correct),explanation:"Storage directions can change after a package is opened. Read the whole label rather than relying on the date alone."}));
    }else if(chapter===8){
      const tie=SAMPLE_BAKERY.colors[slot%SAMPLE_BAKERY.colors.length];
      const askDay=slot%2===0;
      const correct=askDay?tie.day:tie.color;
      const opts=askDay
        ? rotate([tie.day,...SAMPLE_BAKERY.colors.filter(x=>x.day!==tie.day).slice(0,3).map(x=>x.day)],slot%4)
        : rotate([tie.color,...SAMPLE_BAKERY.colors.filter(x=>x.color!==tie.color).slice(0,3).map(x=>x.color)],slot%4);
      levels.push(make(chapter,slot,{title:`Sunny Bakery tie chart · ${tie.color}`,product:{...PRODUCTS[slot%4],tie:tie.color,tieHex:tie.hex},visualLabel:`BEST IF USED BY ${dateText(slot)}`,prompt:askDay?`In the SAMPLE Sunny Bakery chart only, what delivery day does a ${tie.color.toLowerCase()} tie represent?`:`In the SAMPLE Sunny Bakery chart only, which tie color represents ${tie.day}?`,options:opts,answer:opts.indexOf(correct),explanation:`${tie.color} means ${tie.day} in Sunny Bakery’s practice chart. Real bakeries can use different systems, so always check the printed package information too.`}));
    }else if(chapter===9){
      const printed=`BEST IF USED BY ${dateText(slot)}`, lot=lotText(slot);
      const correct=printed;
      const opts=rotate([correct,lot,"The barcode","The price"],slot%4);
      levels.push(make(chapter,slot,{title:`Code detective · ${p.name}`,product:p,visualLabel:`${printed} · ${lot}`,prompt:"Which text is clearly presented as the package date instead of a manufacturer lot/batch code?",options:opts,answer:opts.indexOf(correct),explanation:`${printed} is explicitly labeled as a date. “${lot}” is a manufacturer code; do not guess an expiration date from an unexplained lot code.`}));
    }else if(chapter===10){
      const correct="Put the older quality-date package in front and the newer one behind";
      const opts=rotate([correct,"Hide the older package in back","Sort only by package color","Remove all date labels"],slot%4);
      levels.push(make(chapter,slot,{title:`Shelf rotation · ${p.name}`,product:p,visualLabel:`BEST IF USED BY ${dateText(slot)}`,prompt:"You are helping organize two properly stored, unopened packages of the same food. What is a useful first-in, first-out habit?",options:opts,answer:opts.indexOf(correct),explanation:"Putting the older quality date in front can reduce forgotten food. Date order helps rotation; it does not replace storage directions or food-safety judgment."}));
    }else{
      const mode=slot%5;
      const scenarios=[
        ["A bread tie color and a printed package date disagree. What should you trust first?","The printed package information",["The tie color no matter what","Whichever color you like","The price sticker"],"Tie colors are not universal. Use the printed package information first."],
        ["A package has a date but its seal is broken. What should you do?","Do not use it; show an adult",["Eat it because the date looks fine","Tape it shut and ignore it","Taste-test it"],"Package condition matters. A date does not cancel a broken seal."],
        ["You see BEST IF USED BY and a strange LOT code. Which one is meant to be the readable date clue?","BEST IF USED BY",["The LOT code","The barcode","The brand logo"],"An explicitly labeled date is the readable date clue; manufacturer lot codes can be company-specific."],
        ["Two properly stored boxes have different quality dates. Which goes in front for rotation?","The older quality date",["The newer date","The brighter box","The heavier box"],"First-in, first-out rotation puts the older quality date where it will be noticed first."],
        ["You are unsure whether a refrigerated food was stored correctly. What should a kid do?","Ask an adult and do not guess",["Taste it to test it","Use the bread tie color","Ignore storage history"],"When storage history is uncertain, kids should involve an adult instead of guessing."]
      ][mode];
      const opts=rotate([scenarios[1],...scenarios[2]],slot%4);
      levels.push(make(chapter,slot,{title:`Big grocery check · ${p.name}`,product:p,visualLabel:`BEST IF USED BY ${dateText(slot)} · ${lotText(slot)}`,prompt:scenarios[0],options:opts,answer:opts.indexOf(scenarios[1]),explanation:scenarios[3]}));
    }
  }
}
export const LEVELS=levels;
