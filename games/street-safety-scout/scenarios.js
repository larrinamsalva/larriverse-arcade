export const streetSafetyScenarios = Object.freeze([
  {
    id: 'steady-red',
    category: 'Signal lights',
    title: 'Steady red light',
    prompt: 'The signal facing your lane is solid red. What is the safest first action?',
    options: ['Stop at the proper line and wait for a permitted, safe movement.', 'Speed up before cross traffic starts.', 'Roll through if the road looks quiet.'],
    answer: 0,
    why: 'A steady red signal requires a stop. Any movement after stopping must be both permitted and safe under local rules.',
    hint: 'Red controls your lane even when the intersection looks empty.',
    visual: 'signal-red'
  },
  {
    id: 'steady-yellow',
    category: 'Signal lights',
    title: 'Steady yellow light',
    prompt: 'A green signal changes to solid yellow as you approach. What does yellow tell you?',
    options: ['Race the red light.', 'The signal is changing; stop if you can do so safely.', 'Stop instantly even if hard braking would be unsafe.'],
    answer: 1,
    why: 'A steady yellow light warns that red is coming. Stop when you can do so safely; it is not a signal to speed up.',
    hint: 'Yellow means the protected time is ending.',
    visual: 'signal-yellow'
  },
  {
    id: 'steady-green',
    category: 'Signal lights',
    title: 'Steady green light',
    prompt: 'The signal turns green, but a person is still finishing the crosswalk. What should happen?',
    options: ['Honk so the person moves faster.', 'Enter the crosswalk because green always means go immediately.', 'Wait until the intersection and crosswalk are clear, then proceed safely.'],
    answer: 2,
    why: 'Green permits movement only when the way is clear. People and vehicles already in the intersection still need room to finish safely.',
    hint: 'Green gives permission, not a guarantee that the path is clear.',
    visual: 'signal-green'
  },
  {
    id: 'flashing-red',
    category: 'Signal lights',
    title: 'Flashing red light',
    prompt: 'A traffic signal is flashing red. How should it be treated?',
    options: ['Like a flashing yellow warning.', 'Stop fully, then continue only when it is safe and your turn.', 'Ignore it after dark.'],
    answer: 1,
    why: 'A flashing red signal is treated like a STOP control: stop first, check carefully, and proceed only when safe.',
    hint: 'Flashing red still means stop.',
    visual: 'signal-flashing-red'
  },
  {
    id: 'flashing-yellow',
    category: 'Signal lights',
    title: 'Flashing yellow light',
    prompt: 'The signal is flashing yellow at an intersection. What is the safe response?',
    options: ['Slow down, stay alert, and proceed with caution.', 'Stop and wait for a green light that may never appear.', 'Speed through before it changes.'],
    answer: 0,
    why: 'A flashing yellow signal warns you to slow down and proceed cautiously. Watch for crossing traffic and people.',
    hint: 'Flashing yellow is a caution signal, not a race signal.',
    visual: 'signal-flashing-yellow'
  },
  {
    id: 'red-arrow',
    category: 'Signal lights',
    title: 'Red arrow',
    prompt: 'A red arrow points left. What does it control?',
    options: ['Only pedestrians.', 'Traffic going straight.', 'Movement in the arrow’s direction must stop until a signal permits it.'],
    answer: 2,
    why: 'A red arrow stops movement in the direction shown. Wait for an allowed signal and a clear path.',
    hint: 'Match the arrow direction to the movement it controls.',
    visual: 'arrow-red'
  },
  {
    id: 'green-arrow',
    category: 'Signal lights',
    title: 'Green arrow',
    prompt: 'A green arrow points left. What should a road user remember?',
    options: ['The turn is required even if the crosswalk is occupied.', 'The turn is permitted, but the path still must be clear.', 'Oncoming traffic always has a green light too.'],
    answer: 1,
    why: 'A green arrow permits movement in its direction, but road users must still avoid people or vehicles remaining in the path.',
    hint: 'Permission to turn never removes the need to look.',
    visual: 'arrow-green'
  },
  {
    id: 'walk-signal',
    category: 'Signal lights',
    title: 'WALK signal',
    prompt: 'The white walking-person symbol appears. What should a pedestrian do?',
    options: ['Check for turning vehicles, then begin crossing when clear.', 'Run without looking because every vehicle must already be gone.', 'Wait in the middle of the roadway.'],
    answer: 0,
    why: 'The WALK symbol allows a pedestrian to begin crossing, but staying alert for turning or unexpected vehicles is still important.',
    hint: 'A signal helps, and looking helps too.',
    visual: 'pedestrian-walk'
  },
  {
    id: 'flashing-dont-walk',
    category: 'Signal lights',
    title: 'Flashing hand signal',
    prompt: 'The orange hand begins flashing before you step off the curb. What is the safe choice?',
    options: ['Start crossing slowly.', 'Stand in the street and wait for the countdown.', 'Do not begin crossing; wait for the next WALK signal.'],
    answer: 2,
    why: 'A flashing orange hand means do not start crossing. A person already in the crosswalk should continue toward safety without delaying.',
    hint: 'Ask whether you have already started crossing.',
    visual: 'pedestrian-wait'
  },
  {
    id: 'railroad-flashers',
    category: 'Signal lights',
    title: 'Railroad red flashers',
    prompt: 'Red railroad lights are flashing and the gate is lowering. What must road users do?',
    options: ['Go around the gate if no train is visible.', 'Stop and wait until the warning system ends and the crossing is safe.', 'Stop on the tracks for a better view.'],
    answer: 1,
    why: 'Flashing railroad lights and a lowering gate warn that rail traffic is approaching or present. Never go around a lowered gate or stop on tracks.',
    hint: 'Trains cannot stop quickly, and the gate is never a shortcut.',
    visual: 'railroad'
  },
  {
    id: 'school-crossing',
    category: 'Caution signs',
    title: 'School crossing',
    prompt: 'A fluorescent yellow-green school crossing sign is ahead. What should you expect?',
    options: ['A freeway entrance.', 'Only school buses may continue.', 'Children may be nearby; slow down and watch for crossing controls.'],
    answer: 2,
    why: 'School-area signs warn that children and school activity may be nearby. Slow attention and posted controls matter.',
    hint: 'The five-sided school shape and walking figures are clues.',
    visual: 'sign-school'
  },
  {
    id: 'road-work',
    category: 'Caution signs',
    title: 'Road work ahead',
    prompt: 'An orange diamond says ROAD WORK AHEAD. What does orange usually mean here?',
    options: ['Temporary construction or maintenance conditions are ahead.', 'A permanent hospital entrance.', 'The roadway has no rules.'],
    answer: 0,
    why: 'Orange signs mark temporary work-zone conditions. Expect workers, equipment, changed lanes, and directions that may differ from normal.',
    hint: 'Orange is the work-zone color.',
    visual: 'sign-road-work'
  },
  {
    id: 'slippery-wet',
    category: 'Caution signs',
    title: 'Slippery when wet',
    prompt: 'A yellow diamond shows a car with wavy skid marks. What is it warning about?',
    options: ['A car wash entrance.', 'Wet pavement may reduce traction, so use smoother movements and a safer speed.', 'Drivers should weave between lanes.'],
    answer: 1,
    why: 'Water can reduce tire grip. Slower speed, more space, and smooth steering or braking help reduce sudden loss of control.',
    hint: 'The wavy lines show the tires may lose grip.',
    visual: 'sign-slippery'
  },
  {
    id: 'merge-warning',
    category: 'Caution signs',
    title: 'Merge warning',
    prompt: 'A yellow sign shows one traffic line joining another. What should road users prepare for?',
    options: ['The road ends immediately.', 'Everyone must stop in both lanes.', 'Traffic streams will join, so look, signal, and create safe space.'],
    answer: 2,
    why: 'A merge warning gives road users time to notice joining traffic and cooperate instead of making a sudden move.',
    hint: 'Two paths are becoming one shared flow.',
    visual: 'sign-merge'
  },
  {
    id: 'flagger-ahead',
    category: 'Caution signs',
    title: 'Flagger ahead',
    prompt: 'A work-zone sign shows a person holding a flag. What should a driver expect?',
    options: ['A trained worker may direct traffic; slow down and follow the signal.', 'Traffic laws are paused inside the work zone.', 'Only construction trucks need to pay attention.'],
    answer: 0,
    why: 'Flaggers guide traffic through temporary work areas. Slow down early and follow their STOP or SLOW direction.',
    hint: 'A person’s temporary direction can control the work-zone lane.',
    visual: 'sign-flagger'
  },
  {
    id: 'pedestrian-crossing',
    category: 'Caution signs',
    title: 'Pedestrian crossing',
    prompt: 'A warning sign shows a person walking near a marked crossing. What should road users do?',
    options: ['Assume people will always wait.', 'Watch for people and be ready to yield or stop as required.', 'Use the crosswalk as a parking space.'],
    answer: 1,
    why: 'Pedestrian warnings mark places where people may cross. Slowing attention helps everyone see and respond in time.',
    hint: 'Look beyond the sign for people near both curbs.',
    visual: 'sign-pedestrian'
  },
  {
    id: 'bicycle-crossing',
    category: 'Caution signs',
    title: 'Bicycle crossing',
    prompt: 'A yellow warning sign shows a bicycle. What is the useful clue?',
    options: ['Bicycles are banned from every road ahead.', 'A bicycle shop is having a sale.', 'People on bikes may enter or cross the roadway; look carefully and share space.'],
    answer: 2,
    why: 'The bicycle symbol warns that riders may be present or crossing. Check mirrors and blind areas before moving across their path.',
    hint: 'The symbol warns about who may be nearby.',
    visual: 'sign-bicycle'
  },
  {
    id: 'flooded-road',
    category: 'Caution signs',
    title: 'Water over roadway',
    prompt: 'A barricade and warning sign mark water covering the road. What is the safest choice?',
    options: ['Do not enter the water; turn around and use a safe route.', 'Follow the vehicle ahead because it knows the depth.', 'Drive faster so the tires stay on top.'],
    answer: 0,
    why: 'Water can hide road damage and may be deeper or faster than it looks. Never use another vehicle as proof that a flooded crossing is safe.',
    hint: 'If you cannot see the road surface, you cannot judge the crossing.',
    visual: 'scene-flood'
  },
  {
    id: 'emergency-vehicle-approaching',
    category: 'Emergency awareness',
    title: 'Siren approaching',
    prompt: 'An ambulance approaches from behind using lights and a siren. What is the safe response?',
    options: ['Race it to the next intersection.', 'Stay calm, yield, and make a clear path as local law directs.', 'Stop immediately in the middle of an intersection.'],
    answer: 1,
    why: 'Emergency vehicles need a predictable clear path. Signal, move and stop only where it is safe and legal, and follow local rules.',
    hint: 'Be predictable and make room without creating a second emergency.',
    visual: 'emergency-approaching'
  },
  {
    id: 'move-over',
    category: 'Emergency awareness',
    title: 'Flashing lights on the shoulder',
    prompt: 'A stationary emergency vehicle has flashing lights beside the road. What should approaching drivers do?',
    options: ['Move over when safe, or slow down when a safe lane change is not possible.', 'Maintain speed and pass as close as possible.', 'Stop beside the responders to watch.'],
    answer: 0,
    why: 'Move-over laws protect responders and stopped road users. Create a lane of space when safe, or slow down when you cannot safely change lanes.',
    hint: 'Give the people beside the road more space.',
    visual: 'emergency-shoulder'
  },
  {
    id: 'school-bus-yellow',
    category: 'Emergency awareness',
    title: 'School bus yellow flashers',
    prompt: 'A school bus ahead begins flashing yellow lights. What do they warn?',
    options: ['The bus is speeding up.', 'Children may pass only behind the bus.', 'The bus is preparing to stop; slow down and prepare to stop.'],
    answer: 2,
    why: 'Flashing yellow school-bus lights give advance warning that the bus is preparing to stop to load or unload children.',
    hint: 'Yellow warns about the stop that is coming next.',
    visual: 'bus-yellow'
  },
  {
    id: 'school-bus-red',
    category: 'Emergency awareness',
    title: 'School bus red flashers',
    prompt: 'A stopped school bus displays flashing red lights and an extended stop arm. What is the safe meaning?',
    options: ['Pass slowly if no child is visible.', 'Stop and wait as required; children may be crossing.', 'Honk before passing the stop arm.'],
    answer: 1,
    why: 'Flashing red bus lights and the stop arm protect children boarding or leaving. Stop and wait as required; divided-road rules can vary by location.',
    hint: 'Red lights and the STOP arm are active controls.',
    visual: 'bus-red'
  },
  {
    id: 'fire-lane',
    category: 'Emergency awareness',
    title: 'Fire lane — no parking',
    prompt: 'A curbside sign says FIRE LANE — NO PARKING. Why must the space stay clear?',
    options: ['Emergency crews may need immediate access.', 'It is reserved for delivery trucks.', 'It becomes regular parking after dark.'],
    answer: 0,
    why: 'Fire lanes provide access for emergency vehicles and equipment. A vehicle left there can delay help.',
    hint: 'Think about the large vehicles and hoses that may need the space.',
    visual: 'sign-fire-lane'
  },
  {
    id: 'evacuation-route',
    category: 'Emergency awareness',
    title: 'Evacuation route',
    prompt: 'A white square sign contains a blue circle, arrow, and EVACUATION ROUTE words. What does it mark?',
    options: ['A daily shortcut that ignores other signs.', 'A place to park during an emergency.', 'A planned direction to follow when officials order an evacuation.'],
    answer: 2,
    why: 'Evacuation-route signs mark planned emergency travel directions. Follow official instructions and all temporary traffic controls during a real evacuation.',
    hint: 'The route matters when emergency officials activate a plan.',
    visual: 'sign-evacuation'
  },
  {
    id: 'vehicle-hazards',
    category: 'Vehicle & road hazards',
    title: 'Vehicle hazard flashers',
    prompt: 'Both amber turn lights on a stopped car blink together. What should you understand?',
    options: ['The car is definitely turning both directions.', 'The vehicle may be stopped, disabled, or warning of a hazard; slow and give space.', 'The driver is asking you to pass immediately.'],
    answer: 1,
    why: 'Hazard flashers warn that a vehicle or situation needs extra attention. Do not assume they give permission to pass.',
    hint: 'Both sides blinking together signal a warning, not a turn.',
    visual: 'vehicle-hazards'
  },
  {
    id: 'brake-lights',
    category: 'Vehicle & road hazards',
    title: 'Brake lights',
    prompt: 'The red lights on the back of the vehicle ahead glow brighter. What is the clue?',
    options: ['The vehicle is reversing.', 'The driver wants you to follow closer.', 'The vehicle is slowing or stopping; ease off and keep safe space.'],
    answer: 2,
    why: 'Bright red brake lights signal slowing or stopping. More following space gives you time to respond smoothly.',
    hint: 'Red rear lights that brighten are about speed changing.',
    visual: 'vehicle-brake'
  },
  {
    id: 'reverse-lights',
    category: 'Vehicle & road hazards',
    title: 'White reverse lights',
    prompt: 'White lights come on at the rear of a parked vehicle. What should a nearby pedestrian or rider expect?',
    options: ['The vehicle may back up; stay visible and out of its path.', 'The vehicle is parked forever.', 'The driver has seen every blind spot.'],
    answer: 0,
    why: 'White reverse lights show that reverse gear is engaged. The driver may not see every nearby person or object, so stay clear.',
    hint: 'White rear lights are different from red brake lights.',
    visual: 'vehicle-reverse'
  },
  {
    id: 'turn-signal',
    category: 'Vehicle & road hazards',
    title: 'Turn signal blinking',
    prompt: 'The vehicle ahead has one amber signal blinking. What is the careful interpretation?',
    options: ['The turn has already happened.', 'The driver is showing an intention, but wait for the vehicle’s actual movement.', 'The signal guarantees the path is safe for everyone.'],
    answer: 1,
    why: 'A turn signal communicates intent, but signals can be left on or plans can change. Watch the vehicle’s speed and position too.',
    hint: 'A signal is useful information, not a guarantee.',
    visual: 'vehicle-turn'
  },
  {
    id: 'ball-in-road',
    category: 'Vehicle & road hazards',
    title: 'Ball rolls into the street',
    prompt: 'A ball rolls from between parked cars into the roadway. What hidden hazard should you expect?',
    options: ['Nothing; balls roll by themselves.', 'A parking space is opening.', 'A child or pet may follow; slow or stop safely and scan both sides.'],
    answer: 2,
    why: 'A rolling toy can be an early clue that a child or pet is about to enter the road from a place that is hard to see.',
    hint: 'Look for what might come after the ball.',
    visual: 'scene-ball'
  },
  {
    id: 'heavy-fog',
    category: 'Vehicle & road hazards',
    title: 'Heavy fog',
    prompt: 'Fog makes the road and taillights hard to see. What is the safer plan?',
    options: ['Slow down, increase space, use appropriate low beams, and leave the road safely if visibility becomes too poor.', 'Use high beams and follow the nearest taillights closely.', 'Keep the same speed so other drivers are not surprised.'],
    answer: 0,
    why: 'Fog shortens how far you can see. A slower speed and more space improve reaction time; high beams can reflect glare back in fog.',
    hint: 'Match your speed and following space to how far you can actually see.',
    visual: 'scene-fog'
  }
]);

export const streetSafetyCategories = Object.freeze([
  'Signal lights',
  'Caution signs',
  'Emergency awareness',
  'Vehicle & road hazards'
]);
