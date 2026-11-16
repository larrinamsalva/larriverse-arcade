// North American spider observation lessons. Illustrations are stylized and
// are not identification/medical diagnosis tools. Never touch a spider to test.
export const SPIDER_CHAPTERS=Object.freeze([
  {icon:'🔍',name:'Spot the Spider'},
  {icon:'🌿',name:'Find Its Habitat'},
  {icon:'🕸️',name:'Webs or Hunting?'},
  {icon:'👀',name:'Look, Never Touch'},
  {icon:'🏡',name:'Where It Hides'},
  {icon:'🧬',name:'Spider Science'},
  {icon:'🛡️',name:'Venom & Safety'},
  {icon:'🌎',name:'Nature Explorer'}
]);
export const SPIDERS=Object.freeze([
 {key:'jumping',name:'Jumping spider',look:'A small compact body and noticeably large forward-facing eyes.',home:'sunny walls, leaves and windows',homeIcon:'leaf',hunt:'Leaps after prey with excellent eyesight',huntIcon:'eyes',habit:'Searches for small insects in daylight',detail:'Watch its big forward-facing eyes from a safe distance.',benefit:'helps control small flying insects around plants',science:'Jumping spiders do not usually build large prey-catching webs.',risk:'Most jumping spiders are not medically dangerous; leave them undisturbed.',place:'a sunny leaf with a small spider looking around'},
 {key:'orb',name:'Orb-weaver spider',look:'A rounded abdomen near a wheel-shaped web with spokes and rings.',home:'gardens and open places between plants',homeIcon:'flower',hunt:'Waits in a circular capture web',huntIcon:'web',habit:'Spins a round orb web for flying insects',detail:'Find the circles and radiating lines of the web, without touching it.',benefit:'catches many flying insects with its silk web',science:'Orb-weavers are generally not considered dangerous to people.',risk:'A large web does not mean its spider is dangerous; observe without touching.',place:'a garden web strung between branches'},
 {key:'wolf',name:'Wolf spider',look:'A sturdy brown hunting spider with striped or mottled markings.',home:'leaf litter and ground-level hiding places',homeIcon:'leaf',hunt:'Runs on the ground to hunt instead of using an orb web',huntIcon:'grass',habit:'Hunts on the ground, sometimes at night',detail:'Notice its ground-hunting posture and striped body from a distance.',benefit:'hunts many crawling insects outdoors',science:'Many female wolf spiders carry their egg sacs with them.',risk:'A running brown spider is not automatically a recluse; do not guess by color.',place:'a spider moving among fallen leaves'},
 {key:'cellar',name:'Cellar spider',look:'A tiny, light-colored body with extremely long delicate legs.',home:'quiet indoor corners and cellars',homeIcon:'house',hunt:'Waits in a loose, messy corner web',huntIcon:'web',habit:'Makes a loose, irregular web in undisturbed spaces',detail:'Notice the very long fine legs and irregular web from across the room.',benefit:'eats small insects and sometimes other spiders',science:'Cellar spiders are different from harvestmen, which are not spiders.',risk:'A spider with long legs is not a reason to grab it; get a grown-up if needed.',place:'a quiet basement corner with a loose web'},
 {key:'crab',name:'Crab spider',look:'Sideways-pointing legs, with the front pairs often larger.',home:'flowers and green leaves',homeIcon:'flower',hunt:'Waits on flowers to ambush visiting insects',huntIcon:'flower',habit:'May sit still on flowers instead of building an orb web',detail:'Notice the crab-like sideways leg stance from the path.',benefit:'plays a role in flower and insect food webs',science:'Crab spiders can walk sideways, much like a crab.',risk:'Bright colors do not tell you whether a spider is safe to handle.',place:'a yellow spider waiting on a flower'},
 {key:'tarantula',name:'Tarantula',look:'A large-bodied spider with thick, hairy-looking legs.',home:'ground burrows and sheltered dry habitats',homeIcon:'burrow',hunt:'Hunts prey from the ground or near a retreat',huntIcon:'burrow',habit:'Some species live in burrows instead of large capture webs',detail:'Look at the large rounded body and hairy legs without approaching.',benefit:'eats insects and is food for some other animals',science:'Some New World tarantulas can release irritating hairs as defense.',risk:'Large size does not automatically mean a dangerous bite, but never handle wildlife.',place:'a tarantula outside a ground burrow'},
 {key:'widow',name:'Black widow spider',look:'A glossy dark abdomen; some females show a red hourglass underneath.',home:'undisturbed woodpiles and sheltered crevices',homeIcon:'wood',hunt:'Waits in a tangled, irregular web',huntIcon:'web',habit:'Prefers sheltered spaces and tangled webs',detail:'Notice the shiny rounded abdomen and tangled web from far away.',benefit:'captures insects, but its venom can cause serious symptoms',science:'Widow markings vary; a red hourglass may be on the underside and not visible.',risk:'A suspected widow should be left alone; alert an adult and never reach into its hiding place.',place:'a dark spider in a tangled web by stacked wood'},
 {key:'recluse',name:'Brown recluse spider',look:'A plain tan-brown spider; a dark violin-like mark may be present.',home:'secluded dry indoor spaces in parts of the Midwest and South',homeIcon:'house',hunt:'Wanders in sheltered spots rather than building an orb web',huntIcon:'house',habit:'May hide in undisturbed shoes, boxes or closets',detail:'A violin-like mark is not enough for a confident ID; use regional expertise.',benefit:'preys on insects; suspected bites deserve medical assessment',science:'Brown recluses are mainly established in the south-central and midwestern U.S., not all states.',risk:'Do not rely on a tan color or a skin mark to diagnose a recluse bite; seek medical advice.',place:'a secluded storage box in the southern U.S.'},
 {key:'grass',name:'Grass spider',look:'A brownish spider often seen at a sheet-and-funnel web in grass.',home:'grass, lawns and low shrubs',homeIcon:'grass',hunt:'Waits in a funnel-shaped retreat beside a flat sheet web',huntIcon:'sheet',habit:'Makes a flat silk sheet leading into a tunnel-like retreat',detail:'Look for a sheet web with a funnel-shaped hideaway in the grass.',benefit:'captures garden insects in its funnel web',science:'A funnel web in North America does not make its maker an Australian funnel-web spider.',risk:'Names can sound frightening; never judge bite danger from a name alone.',place:'a dew-covered funnel web low in the lawn'},
 {key:'trapdoor',name:'Trapdoor spider',look:'A stocky, earth-colored spider that may live at a silk-lined burrow.',home:'soil burrows in suitable warm habitats',homeIcon:'burrow',hunt:'Waits at a burrow entrance to ambush passing prey',huntIcon:'burrow',habit:'Some species make a camouflaged hinged door over the burrow',detail:'Look for a burrow entrance or silken lid without putting fingers inside.',benefit:'helps maintain a balanced food web by hunting ground insects',science:'Not every burrow spider makes a trapdoor, and many remain hidden.',risk:'Never reach into an unknown hole to see what lives there.',place:'a spider burrow under loose soil'}
]);
const option=(text,icon,why='',spider)=>({text,icon,why,spider});
const trap=(key)=>option(key==='touch'?'Pick it up for a closer look':key==='guess'?'Decide only from its color':key==='poke'?'Poke the web or burrow':key==='ignore'?'Pretend every spider is harmless':'Try to move it with bare hands','noTouch','That could put you or the animal at risk. Observe from a safe distance and involve a grown-up.');
function arrange(correct,wrongA,wrongB,shift){
 const cards=[correct,wrongA,wrongB],answer=(shift*2+1)%3;
 const options=[null,null,null];options[answer]=correct;
 options[(answer+1)%3]=wrongA;options[(answer+2)%3]=wrongB;
 return {options,answer};
}
const chapters=[];
for(let ch=0;ch<8;ch++)for(let i=0;i<SPIDERS.length;i++){
  const s=SPIDERS[i],next=SPIDERS[(i+3)%10],other=SPIDERS[(i+6)%10];
  let title='',prompt='',observation='',clue='',explanation='',correct,wrongA,wrongB;
  const common='Spiders usually avoid people; observe quietly, do not touch or trap them, and ask an adult if one is indoors.';
  if(ch===0){
    title=s.name+' · Look closely';prompt='Which illustrated spider matches these clues?';
    observation=s.look;clue='Compare body shape, eye arrangement and web or habitat, not color alone.';
    correct=option(s.name,'observe','',s.key);
    wrongA=option(next.name,'observe','Look for the clues listed in the scene.',next.key);
    wrongB=option(other.name,'observe','Different spider groups may look alike; never rely only on one mark.',other.key);
    explanation=s.name+': '+s.look+' Illustrated clues are for learning, not a guaranteed identification. '+common;
  }else if(ch===1){
    title=s.name+' · Find its home';prompt='Which picture shows a habitat where this spider may live?';
    observation='You are making a spider habitat map. '+s.look;
    clue='Look for the environment, not a close-up of a spider.';
    correct=option(s.home,s.homeIcon);
    wrongA=option(next.home,next.homeIcon,'This habitat is more typical of another spider group.');
    wrongB=option(other.home,other.homeIcon,'Habitats overlap, but the clue highlights a more typical place.');
    explanation=s.name+' is often found around '+s.home+'. Ranges and habitats vary. Leave wildlife in place.';
  }else if(ch===2){
    title=s.name+' · How it feeds';prompt='Which illustrated hunting style is most typical of this spider?';
    observation='Some spiders wait in silk, while others hunt without a large capture web.';
    clue='Think about whether the spider waits, jumps, runs or hides.';
    correct=option(s.hunt,s.huntIcon);
    wrongA=option(next.hunt,next.huntIcon,'That is a different hunting style.');
    wrongB=option(other.hunt,other.huntIcon,'That is not the best match for the clues.');
    explanation=s.name+': '+s.habit+'. Each strategy helps it find food in its habitat.';
  }else if(ch===3){
    title=s.name+' · Gentle scientist';prompt='Which observation can you make without touching a spider?';
    observation='You spot '+s.place+'. Stay back and use your eyes.';
    clue='A good scientist does not disturb a spider to identify it.';
    correct=option(s.detail,'observe');
    wrongA=trap(i%2===0?'poke':'touch');
    wrongB=trap('guess');
    explanation=s.detail+' Observation is safest when you leave wildlife undisturbed. '+common;
  }else if(ch===4){
    title=s.name+' · Habitat detective';prompt='Where should you look from a safe distance to learn about its home?';
    observation='The science team heard about '+s.place+'. Where might its shelter be?';
    clue='The spider may be outside or in a sheltered part of a building.';
    correct=option(s.home,s.homeIcon);
    wrongA=option('Open water in the middle of a lake','water','That is not the typical home in this clue.');
    wrongB=option('Inside a boiling cooking pot','fire','Spiders do not live in boiling water.');
    explanation='The observation points toward '+s.home+'. Keep away from hidden holes, crevices, woodpiles and unknown spiders.';
  }else if(ch===5){
    title=s.name+' · Nature helper';prompt='Which science fact about this spider is supported by evidence?';
    observation='Spiders have many jobs in food webs.';
    clue='Pick the statement that fits the species, not a silly claim.';
    correct=option(s.science,'observe');
    wrongA=option('All spiders make identical round webs','web','Different spiders use silk in different ways.');
    wrongB=option('Every spider always attacks people','stop','Most spiders are not aggressive and typically avoid people.');
    explanation=s.science+' '+s.benefit.charAt(0).toUpperCase()+s.benefit.slice(1)+'.';
  }else if(ch===6){
    title=s.name+' · Venom-smart';prompt='Which is the safest and most accurate statement?';
    observation=s.name+' was observed from a distance. The goal is to learn, not to handle it.';
    clue='Most spiders use venom on prey; poisonous means harmful when eaten or touched, while venom is injected.';
    correct=option(s.risk,'away');
    wrongA=option('Try to catch it to test if it bites','noTouch','Never test wildlife by handling it.');
    wrongB=option('A single skin bump always proves which spider bit you','guess','Skin marks alone cannot reliably identify a spider bite.');
    explanation=s.risk+' In the U.S., widow and recluse bites can require medical care; urgent symptoms such as breathing trouble require emergency help. '+common;
  }else{
    title=s.name+' · Field journal';prompt='What should a nature explorer record about this spider, without getting close?';
    observation='A teammate reports '+s.place+'. Your group is making an illustrated nature notebook.';
    clue='Describe a place and an observation, rather than chasing or touching.';
    correct=option('Sketch the habitat and note: '+s.habit,'observe');
    wrongA=option('Pick up the spider for a photo','noTouch','A closer photo is not worth handling an unknown spider.');
    wrongB=option('Declare it deadly without checking evidence','stop','Avoid scary guesses. A knowledgeable adult or expert can help with uncertain IDs.');
    explanation='Notice '+s.home+'. Write down behaviors such as: '+s.habit+'. This is a practice illustration, not a field identification certificate.';
  }
  const pair=arrange(correct,wrongA,wrongB,ch*10+i);
  chapters.push({id:ch*10+i+1,chapter:ch,scene:s.key,sceneAlt:'Illustration of '+s.name+'. '+s.look,title,prompt,observation,clue,explanation,options:pair.options,answer:pair.answer});
}
export const SPIDER_MISSIONS=Object.freeze(chapters);
