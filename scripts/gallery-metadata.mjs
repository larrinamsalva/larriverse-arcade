// Descriptions refer to the clean opening views captured by arcade.spec.mjs.
// Missing subjects are release-evidence errors, never an invented fallback.
const descriptions = Object.freeze({
  lobby: 'LarriVerse Arcade opening lobby with illustrated featured adventures, a local player summary, shared settings, and optional discovery sections.',
  'bridge-buddies': 'Bridge Buddies model bridge with four numbered spans, support choices, load labels, a token budget, and a test-crossing control.',
  'water-works': 'Water Works opening mission and pipe puzzle with numbered rotating pipes, reservoir and town labels, and a marked toy filter.',
  'harbor-helpers': 'Harbor Helpers island map with supply requests, cargo choices, boat capacity, fuel tokens, and delivery controls.',
  'pantry-picnic': 'Pantry Picnic pretend food shelf with marked leftovers, three picnic slots, portion labels, and packing controls.',
  'compass-cove': 'Compass Cove numbered island grid with named landmarks, a north-east-south-west compass, a treasure clue, and a map legend.',
  'cipher-club': 'Cipher Club toy alphabet workshop with a shared number key, encode-or-decode instructions, message slots, and letter keys.',
  'trade-town': 'Trade Town pretend market with a shopping request, budget, bundle quantities, unit prices, delivery fees, and return controls.',
  'critter-council': 'Critter Council woodland town with neighbor requests, six numbered building plots, a token budget, and inclusive building choices.',
  'beat-builder': 'Beat Builder rhythm grid with named instrument rows, numbered beats, pattern controls, and sound off by default.',
  'lemonade-lab': 'Lemonade Lab pretend business board with a weather forecast, price and stock choices, and a locally saved practice ledger.',
  'robot-rover': 'Robot Rover numbered garden grid with a start and goal, command buttons, a sequence area, and run-and-debug controls.',
  'reuse-rally': 'Reuse Rally sorting board with named objects, labeled reuse and recycling choices, and the displayed town rules.',
  'energy-island': 'Energy Island resource board with generation choices, storage controls, demand labels, and a day-and-night practice mission.',
  'garden-guardians': 'Garden Guardians planting board with named crops and flowers, water choices, a twelve-drop budget, and garden feedback.',
  'time-trail': 'Time Trail numbered route grid with landmarks, picnic goals, resource labels, and keyboard or touch movement controls.',
  'repair-cafe': 'Repair Café toy workshop with named repair steps, a sequence area, safety guidance, and controls for testing a repair order.',
  'fact-finder': 'Fact Finder detective board with a sample claim, source-inspection controls, labeled evidence choices, and explanatory feedback.',
  'kindness-quest': 'Kindness Quest conversation board with a listening scenario, labeled response choices, and guidance about kindness and boundaries.',
  'scam-sleuth': 'Scam Sleuth detective board with a pretend message, inspectable clues, labeled safety choices, and explanatory feedback.',
  'traffic-town': 'Traffic Town road-sign practice board with a sign scenario, answer choices, explanation feedback, and local progress.',
  'pocket-planet': 'Pocket Planet pretend budget board with needs and wants, savings choices, item costs, and a visible coin balance.',
  'kidscoin-family': 'KidsCoin Family dashboard with fictional reward boundaries, open learning choices, parent controls, and device-local progress.',
  'brain-sweat-expanded': 'Brain Sweat Expanded workshop with reviewed skill worlds, local progress, visible review gates, and shared arcade navigation.',
  'brain-sweat-life-skills': 'Brain Sweat Life Skills lesson hub with reviewed worlds, playable question totals, queued-content protections, and shared comfort controls.',
  'bubble-resonance-phi369': 'Bubble Resonance playfield with numbered frequency bubbles, an aiming guide, keyboard controls, sound off, and the creative-theme boundary.',
  'chill-brain-rewards': 'Chill Brain onboarding view with gentle practice choices, optional sound, shared comfort controls, and local progress context.',
  'creature-catcher': 'Creature Catcher opening card with a learning-path choice, start and return controls, and a locally saved field-guide introduction.',
  'road-trip-quest': 'Road Trip Quest opening card with learning-path choices, a start button, saved-trip controls, and shared arcade context.',
  'road-trip-quest-gps': 'Road Trip Quest GPS opening view with Demo Mode, optional Live Movement, the passenger-only warning, and privacy controls.'
});

// Mobile captures begin at the top of the page; most boards are farther down.
// Describe what is visible instead of borrowing the desktop board description.
const mobileDescriptions = Object.freeze({
  lobby: 'LarriVerse Arcade opening lobby with the curiosity invitation, local player summary, illustrated featured adventure, and mobile shortcuts.',
  'bridge-buddies': 'Bridge Buddies illustrated introduction and model-building mission, with LarriVerse navigation, sound off, and shared comfort controls.',
  'water-works': 'Water Works illustrated introduction and toy pipe-network mission, with LarriVerse navigation, sound off, and shared comfort controls.',
  'harbor-helpers': 'Harbor Helpers illustrated introduction and island-delivery mission, with LarriVerse navigation, sound off, and shared comfort controls.',
  'pantry-picnic': 'Pantry Picnic illustrated introduction and pretend-food planning mission, with LarriVerse navigation, sound off, and shared comfort controls.',
  'compass-cove': 'Compass Cove illustrated introduction and landmark treasure mission, with LarriVerse navigation, sound off, and shared comfort controls.',
  'cipher-club': 'Cipher Club illustrated introduction and toy shared-key mission, with LarriVerse navigation, sound off, and shared comfort controls.',
  'trade-town': 'Trade Town illustrated introduction and pretend-shopping mission, with LarriVerse navigation, sound off, and shared comfort controls.',
  'critter-council': 'Critter Council illustrated introduction and inclusive-town mission, with LarriVerse navigation, sound off, and shared comfort controls.',
  'beat-builder': 'Beat Builder illustrated introduction to rhythm and patterns, with LarriVerse navigation, local personal best, and shared comfort controls.',
  'lemonade-lab': 'Lemonade Lab illustrated introduction to a pretend small business, with LarriVerse navigation, local personal best, and shared comfort controls.',
  'robot-rover': 'Robot Rover illustrated introduction to sequencing and debugging, with LarriVerse navigation, local personal best, and shared comfort controls.',
  'reuse-rally': 'Reuse Rally illustrated introduction to sorting and thoughtful reuse, with LarriVerse navigation, local personal best, and shared comfort controls.',
  'energy-island': 'Energy Island illustrated introduction to energy and storage, with LarriVerse navigation, local personal best, and shared comfort controls.',
  'garden-guardians': 'Garden Guardians illustrated introduction to resource care and diverse gardens, with LarriVerse navigation and shared comfort controls.',
  'time-trail': 'Time Trail illustrated introduction to planning and tradeoffs, with LarriVerse navigation, local personal best, and shared comfort controls.',
  'repair-cafe': 'Repair Café illustrated introduction to repair before replacing, with LarriVerse navigation, local personal best, and shared comfort controls.',
  'fact-finder': 'Fact Finder illustrated introduction to claims and sources, with LarriVerse navigation, local personal best, and shared comfort controls.',
  'kindness-quest': 'Kindness Quest illustrated introduction to listening and boundaries, with LarriVerse navigation, local personal best, and shared comfort controls.',
  'scam-sleuth': 'Scam Sleuth illustrated introduction to spotting online tricks, with LarriVerse navigation, local personal best, and shared comfort controls.',
  'traffic-town': 'Traffic Town illustrated introduction to common road signs and safe choices, with LarriVerse navigation, local personal best, and shared comfort controls.',
  'pocket-planet': 'Pocket Planet illustrated introduction to budget choices, with LarriVerse navigation, local personal best, and shared comfort controls.',
  'kidscoin-family': 'KidsCoin Family opening dashboard with shared LarriVerse player context, an arcade return, comfort controls, and fictional reward framing.',
  'brain-sweat-expanded': 'Brain Sweat Expanded opening workshop introduction with shared LarriVerse player context, an arcade return, and comfort controls.',
  'brain-sweat-life-skills': 'Brain Sweat Life Skills opening lesson introduction with shared LarriVerse player context, an arcade return, and comfort controls.',
  'bubble-resonance-phi369': 'Bubble Resonance opening playfield and score area beneath shared LarriVerse player context, an arcade return, and comfort controls.',
  'chill-brain-rewards': 'Chill Brain gentle onboarding introduction beneath shared LarriVerse player context, an arcade return, and comfort controls.',
  'creature-catcher': 'Creature Catcher illustrated opening dialog introducing its question safari, with instructions and a scrollable learning-path and start area.',
  'road-trip-quest': 'Road Trip Quest opening adventure title beneath shared LarriVerse player context, an arcade return, and comfort controls.',
  'road-trip-quest-gps': 'Road Trip Quest GPS opening Demo Mode introduction beneath shared LarriVerse player context, an arcade return, and comfort controls.'
});

export function galleryMetadata(subject, project) {
  const description = (project?.id === 'mobile-chromium' ? mobileDescriptions : descriptions)[subject?.id];
  if (!description) throw new Error(`Missing gallery description for ${subject?.id}`);
  if (typeof subject.title !== 'string' || !subject.title.trim() || /\b(undefined|null)\b/i.test(subject.title)) {
    throw new Error(`Invalid gallery title for ${subject.id}`);
  }
  const views = { 'desktop-chromium': 'Desktop view.', 'mobile-chromium': 'Mobile view.' };
  if (!views[project?.id]) throw new Error(`Unknown gallery project ${project?.id}`);
  const defaultAlt = `${description} ${views[project.id]}`;
  if (defaultAlt.length < 40 || defaultAlt.length > 300 || /\b(undefined|null)\b/i.test(defaultAlt)) {
    throw new Error(`Invalid gallery alt text for ${subject.id}`);
  }
  return { title: subject.title, defaultAlt };
}
