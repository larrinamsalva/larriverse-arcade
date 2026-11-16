// Picture-based situation practice for children in the United States.
// Based on American Red Cross Check–Call–Care and current first-aid guidance.
// Training only: not emergency response, a substitute for adult help, or a CPR course.
export const HELP_CHAPTERS=Object.freeze([
 {icon:'👀',name:'Notice the Situation'},{icon:'🚦',name:'First Safe Move'},
 {icon:'🧰',name:'Helpful Supplies'},{icon:'🩹',name:'Choose What Helps'},
 {icon:'🚨',name:'Know the Warning Signs'},{icon:'📞',name:'When to Get More Help'},
 {icon:'💛',name:'Stay With Kindness'},{icon:'🤝',name:'Calm Teamwork'}
]);
const step=(text,icon,why='')=>({text,icon,why});
const HELP_CASES=Object.freeze([
 {title:'A nosebleed after recess',scene:'nose',detail:'A child has a nosebleed but is awake and breathing normally.',
  first:step('Sit upright, lean a little forward, and pinch the soft nose for 10–15 minutes; get an adult.','nose'),
  tool:step('A clock to time uninterrupted pressure, plus clean tissues nearby.','clock'),
  alarm:step('Bleeding is heavy, follows a serious head injury, or continues after 15 minutes of pressure.','emergency'),
  support:step('Stay calm and keep the head slightly forward—not tilted back.','nose'),
  fact:'For a typical nosebleed, sit leaning slightly forward and pinch the soft part of the nose without stopping for 10–15 minutes. Get emergency or medical help for severe or persistent bleeding or a head injury.'},
 {title:'A small playground scrape',scene:'bandage',detail:'A friend scraped a knee, with a little bleeding and no serious injury.',
  first:step('Tell an adult; wash hands and gently rinse the scrape with clean water.','soapAndWater'),
  tool:step('A clean adhesive bandage from the first-aid kit.','bandage'),
  alarm:step('Bleeding will not stop, the wound is deep, or infection signs develop.','emergency'),
  support:step('Comfort the friend and help an adult cover the clean scrape.','friend'),
  fact:'Minor scrapes can usually be rinsed with clean water and covered with a clean bandage. Get adult help and appropriate medical care for deeper wounds or worsening symptoms.'},
 {title:'Someone is bleeding a lot',scene:'pressure',detail:'A person has a serious injury with blood flowing quickly.',
  first:step('Call 911 immediately and alert an adult; use firm direct pressure if safe.','emergency'),
  tool:step('Clean gauze or a cloth for direct pressure over the wound.','pressure'),
  alarm:step('Blood is flowing continuously or spurting, or the person becomes faint.','emergency'),
  support:step('Stay with the person only if safe and follow emergency dispatcher instructions.','phone'),
  fact:'Life-threatening bleeding needs emergency services right away. Firm direct pressure helps control it; get a trained adult and follow dispatcher instructions. Protect yourself from contact with blood when possible.'},
 {title:'A person cannot breathe or speak',scene:'emergency',detail:'During lunch a person appears to choke and cannot cough, speak, or breathe.',
  first:step('Call 911 and get a trained adult to give choking first aid.','emergency'),
  tool:step('A phone to call emergency services and hear the dispatcher.','phone'),
  alarm:step('They cannot cough, speak, or breathe, or their color changes.','chokingWarning'),
  support:step('Stay nearby in a safe spot and follow the emergency dispatcher’s directions.','phone'),
  fact:'Severe choking is a life-threatening emergency. Call 911 and seek a trained responder. Do not offer water or blindly put fingers in the mouth.'},
 {title:'Someone will not wake up',scene:'emergency',detail:'A person is lying still and does not respond when spoken to.',
  first:step('Call 911, get an adult and follow dispatcher guidance.','emergency'),
  tool:step('A phone to reach emergency dispatch; a trained helper may get an AED.','phone'),
  alarm:step('They remain unresponsive, are not breathing normally, or only gasp.','unresponsive'),
  support:step('Stay in a safe place nearby; let a trained adult follow dispatcher instructions.','adult'),
  fact:'Unresponsiveness or absent/abnormal breathing requires immediate 911 help. CPR and AED use need proper instructions and training; do not assume the person is just sleeping.'},
 {title:'A small hot-water burn',scene:'water',detail:'A child accidentally touches warm cooking water and has a small red burn.',
  first:step('Tell an adult and cool the area with clean, cool running water.','water'),
  tool:step('Cool running water, not ice or butter.','water'),
  alarm:step('The burn is large, deep, on the face or hands, or breathing is affected.','emergency'),
  support:step('Help keep the area away from heat while an adult checks the burn.','adult'),
  fact:'Cool a small heat burn with clean cool running water for 5–20 minutes. Avoid ice and butter. Large, deep, chemical, electrical and special-location burns need urgent medical care.'},
 {title:'Feeling too hot outside',scene:'rest',detail:'A teammate is dizzy in the heat after playing on a sunny field.',
  first:step('Stop activity, move to shade or a cooler place, and tell an adult.','rest'),
  tool:step('Cool water to sip only if awake and able to swallow safely.','drinkingWater'),
  alarm:step('Confusion, fainting, seizures or trouble breathing in the heat.','emergency'),
  support:step('Stay in shade and ask an adult to help cool the person; watch how they feel.','adult'),
  fact:'Move out of the heat, rest and cool down. Heat-related confusion or unresponsiveness is an emergency; seek urgent help. Never force a confused person to drink.'},
 {title:'A severe allergy warning',scene:'emergency',detail:'After a sting, someone suddenly has trouble breathing and facial swelling.',
  first:step('Call 911 immediately and tell a responsible adult.','emergency'),
  tool:step('A phone; a trained adult can help with prescribed emergency medicine.','phone'),
  alarm:step('Trouble breathing, throat/tongue swelling, or sudden collapse.','allergyWarning'),
  support:step('Stay nearby safely; let an adult and dispatcher guide emergency care.','adult'),
  fact:'Breathing difficulty after a sting or food exposure can mean anaphylaxis. Call 911 promptly. A trained adult should help with the person’s prescribed epinephrine when available.'},
 {title:'A twisted ankle during a game',scene:'ice',detail:'A child twists an ankle and has pain but is alert and breathing normally.',
  first:step('Stop playing and tell an adult; avoid putting weight on the injury.','rest'),
  tool:step('A cold pack wrapped in a thin cloth for comfort.','ice'),
  alarm:step('A badly deformed limb, loss of feeling or inability to stand with major pain.','emergency'),
  support:step('Sit and rest without forcing an injured ankle to move.','rest'),
  fact:'Rest, support and a wrapped cold pack may help a mild sprain. An adult should arrange medical evaluation if pain is severe, a fracture is possible or swelling worsens.'},
 {title:'A fall with possible head or neck injury',scene:'stop',detail:'Someone fell hard and now complains of neck pain.',
  first:step('Call for an adult and emergency help; ask them not to move.','emergency'),
  tool:step('A phone to reach emergency services when a serious injury is suspected.','phone'),
  alarm:step('Confusion, repeated vomiting, severe headache, or neck/spine pain.','emergency'),
  support:step('Stay nearby safely and avoid moving the person unless there is danger.','wait'),
  fact:'A serious fall with possible head, neck or spine injury needs urgent assessment. Do not move the person unless needed for immediate safety or emergency care.'},
 {title:'Someone is having a seizure',scene:'stop',detail:'A person falls and has uncontrolled shaking movements.',
  first:step('Get adult help; clear nearby hazards and call 911 when needed.','adult'),
  tool:step('A soft folded item under the head, if safe to place without restraining.','cloth'),
  alarm:step('Shaking lasts over five minutes, breathing is difficult, or it is a first seizure.','emergency'),
  support:step('Do not restrain them or put anything in their mouth.','noTouch'),
  fact:'Protect the person from nearby hazards and time the seizure. Do not hold them down or put things in their mouth. Call emergency services for prolonged seizures, first seizure or breathing trouble.'},
 {title:'A painful eye injury',scene:'observe',detail:'Someone gets an object near the eye and says it hurts.',
  first:step('Tell an adult and ask the person not to rub the eye.','adult'),
  tool:step('A clean cloth nearby; avoid pressing on an injured eye.','cloth'),
  alarm:step('Vision changes, an object stuck in the eye, or severe eye pain.','emergency'),
  support:step('Keep them calm while a grown-up arranges appropriate medical care.','listen'),
  fact:'Eye injuries can be serious. Avoid rubbing or pressing on the eye; do not pull out an embedded object. Seek prompt medical help for severe pain or vision change.'},
 {title:'A bicycle crash near traffic',scene:'stop',detail:'A friend falls from a bike next to a busy street.',
  first:step('Stay out of traffic and call a nearby adult for help.','roadsideHelp'),
  tool:step('A first-aid kit for minor scrapes once everyone is safely away from traffic.','kit'),
  alarm:step('A head injury, loss of consciousness or inability to move safely.','emergency'),
  support:step('Keep yourself safe; do not drag a person with a suspected neck injury.','stop'),
  fact:'Scene safety comes first. Get help from an adult, and call 911 for serious injuries. A helmet helps prevent injury but does not rule out a concussion.'},
 {title:'A friend is crying and upset',scene:'friend',detail:'A classmate is crying but is physically safe and wants someone to listen.',
  first:step('Ask kindly if they want help and offer to find a trusted adult.','friend'),
  tool:step('A listening ear and a calm trusted grown-up.','listen'),
  alarm:step('The person says they are in immediate danger or may hurt themselves.','emergency'),
  support:step('Listen without teasing or making promises of secrecy about danger.','friend'),
  fact:'Listening and involving a trusted adult can make a big difference. If someone is in immediate danger, get emergency help right away; do not keep a dangerous secret.'},
 {title:'Someone is being bullied',scene:'adult',detail:'A child is being threatened on the playground.',
  first:step('Get a teacher or trusted adult instead of fighting.','adult'),
  tool:step('A safe adult who can intervene.','adult'),
  alarm:step('A weapon, serious physical attack, or an immediate threat of injury.','emergency'),
  support:step('Stay with the child only if safe and report what you saw.','friend'),
  fact:'Support the person and get a trusted adult. Do not escalate a dangerous confrontation. If someone is in immediate danger, call emergency services.'},
 {title:'A child is lost in a store',scene:'house',detail:'A child cannot find their family in a busy public place.',
  first:step('Find a uniformed store worker or another safe, trusted adult.','house'),
  tool:step('The store help desk or a trusted worker’s assistance.','house'),
  alarm:step('Someone tries to force the child to leave with them.','emergency'),
  support:step('Stay in a visible public area with safe staff while help is arranged.','wait'),
  fact:'A lost child should find a safe store worker or trusted adult rather than wander off or follow an unknown person. Seek emergency help for abduction risk or immediate danger.'},
 {title:'Smoke from a building',scene:'fire',detail:'You see smoke and hear a fire alarm inside a building.',
  first:step('Leave by a safe exit, warn others and call 911 once outside.','safeExit'),
  tool:step('A phone outside the building to call firefighters.','emergency'),
  alarm:step('Smoke, visible flames or someone trapped inside.','fire'),
  support:step('Stay outside at the meeting point; never go back inside.','meetingPoint'),
  fact:'Escape first using a safe route. Stay out, call the fire department, and never reenter a burning or smoke-filled building to collect things.'},
 {title:'Someone struggling in deep water',scene:'water',detail:'A person is struggling to stay above the water.',
  first:step('Shout for an adult/lifeguard and call 911; do not jump in.','emergency'),
  tool:step('A safe floating or reaching aid if one is immediately available.','lifeRing'),
  alarm:step('The person goes under, cannot call out, or stops responding.','waterDistress'),
  support:step('Stay on safe ground and follow a lifeguard or dispatcher’s directions.','away'),
  fact:'Get a lifeguard or adult and call emergency services. Do not enter dangerous water to attempt an untrained rescue; reach or throw a floating aid from safety if possible.'},
 {title:'Unknown pills or household cleaner',scene:'medicine',detail:'A young child may have swallowed an unknown medicine or chemical.',
  first:step('Tell an adult immediately; in the U.S. call Poison Control at 1-800-222-1222.','phone'),
  tool:step('The product container for an adult to show poison experts.','medicine'),
  alarm:step('They collapse, have a seizure, or cannot breathe normally.','emergency'),
  support:step('Do not make them vomit or give anything by mouth unless experts say so.','noTouch'),
  fact:'Poison Control gives expert U.S. advice at 1-800-222-1222. Call 911 for breathing trouble, seizures or collapse. Do not induce vomiting or guess at home remedies.'},
 {title:'A possible spider bite',scene:'observe',detail:'A child has a painful red area and thinks a spider may have bitten them.',
  first:step('Tell a trusted adult, wash gently with soap and water, and get advice.','adult'),
  tool:step('Clean water and soap for gentle wound cleaning.','soapAndWater'),
  alarm:step('Breathing difficulty, severe cramps, spreading severe pain, or worsening wound.','emergency'),
  support:step('Leave the spider alone; never catch one to prove the bite.','away'),
  fact:'Many skin marks are not caused by spiders. Clean a suspected bite and seek professional advice for concerning symptoms; call emergency services for breathing difficulty or other severe symptoms.'}
]);
const lessons=[];
const wrongs={
 first:[
  step('Rush in without checking whether the place is safe.','away','Always check for dangers before you try to help.'),
  step('Ignore the person and hope someone else notices.','wait','Get a trusted adult or emergency help when needed.')
 ],
 tool:[
  step('A random pill from a medicine cabinet.','randomPill','Never give someone medication without the right adult or professional direction.'),
  step('A snack instead of checking the person’s condition.','food','Food will not fix the problem, and may be unsafe during an emergency.')
 ],
 alarm:[
  step('They are comfortable, talking normally and asking for a tissue.','tissues','This by itself is not the urgent danger sign described.'),
  step('A shoe is untied but the person feels fine.','untiedShoe','A loose shoelace is not an emergency warning sign.')
 ],
 support:[
  step('Leave the person alone without finding anyone to help.','door','A trusted adult or emergency responder may be needed.'),
  step('Try a risky treatment you saw in a video.','video','Use trusted first-aid guidance and follow trained helpers.')
 ]
};
for(let chapter=0;chapter<8;chapter++)for(let j=0;j<10;j++){
  const phase=Math.floor(chapter/2);
  const caseIndex=(chapter%2)*10+j;
  const item=HELP_CASES[caseIndex],kind=['first','tool','alarm','support'][phase];
  const correct=item[kind],bad=wrongs[kind];
  const answer=(caseIndex*2+chapter+1)%3;
  const options=[null,null,null];
  options[answer]=correct;
  options[(answer+1)%3]=bad[0];options[(answer+2)%3]=bad[1];
  const prompt=[
    'What is the safest first action in this situation?',
    'Which picture shows a helpful item or safe action for this situation?',
    'Which sign means get urgent medical or emergency help?',
    'How could a child help calmly while a trusted adult or responder takes charge?'
  ][phase];
  const header=[
    'Check the scene and ask for help.',
    'Pick a safe, useful tool. Never give random medicine.',
    'Know when to tell an adult to call 911 (in the U.S.) or seek urgent care.',
    'Calm teamwork matters more than trying to be a hero.'
  ][phase];
  lessons.push({
    id:chapter*10+j+1,chapter,scene:item.scene,
    sceneAlt:'Original picture representing '+item.title+'. Read the written scenario for details.',
    title:item.title,prompt,observation:item.detail,
    clue:header+' '+item.fact,
    explanation:correct.text+' '+item.fact,
    options,answer
  });
}
export const HELP_MISSIONS=Object.freeze(lessons);
export const HELP_CASE_COUNT=HELP_CASES.length;
