export const CREATIVE_CHAPTERS = Object.freeze([
  { id:"color-doodles", name:"Color & Doodles", icon:"🎨", prompts:[
    "Fill the page with three colors that feel good together.",
    "Draw a line that wiggles, loops, and finds its way home.",
    "Make a tiny doodle village using only circles and squares.",
    "Create a page of dots that slowly turn into something surprising.",
    "Draw your name as if every letter were made of clouds.",
    "Make a rainbow using colors in any order you choose.",
    "Turn one scribble into a creature, object, or imaginary place.",
    "Draw a path for a friendly bug to travel across the page.",
    "Make a picture using only thick lines and tiny dots.",
    "Choose one favorite color and invent five shades around it."
  ]},
  { id:"shapes-patterns", name:"Shapes & Patterns", icon:"🔷", prompts:[
    "Build a pattern from circles, triangles, and squares.",
    "Repeat one shape until it becomes a border around the canvas.",
    "Make a pattern that starts tiny and grows bigger toward the edge.",
    "Create a checkerboard using shapes instead of squares.",
    "Draw a spiral made from little stars or dots.",
    "Invent a symbol and repeat it in a rhythm.",
    "Make two different patterns meet in the middle.",
    "Create a maze that is fun to look at even without solving it.",
    "Use only curved shapes to fill half the canvas.",
    "Turn four simple shapes into one new imaginary object."
  ]},
  { id:"mandala-magic", name:"Mandala Magic", icon:"🪷", prompts:[
    "Use mirror mode to make a calm two-sided design.",
    "Create a six-way flower with radial symmetry.",
    "Make an eight-way starburst using short colorful strokes.",
    "Start at the center and build a mandala ring by ring.",
    "Draw one leaf and let symmetry turn it into a garden.",
    "Create a snowflake that could never melt.",
    "Make a sun with a different mark on every ray.",
    "Build a portal from circles, lines, and repeating shapes.",
    "Use two colors to make a balanced mirrored design.",
    "Create a mandala that looks like it belongs on another planet."
  ]},
  { id:"nature-studio", name:"Nature Studio", icon:"🌿", prompts:[
    "Draw a flower that has never existed before.",
    "Create a tiny garden with at least three kinds of leaves.",
    "Make a peaceful sky with clouds, stars, or a moon.",
    "Draw a tree whose branches curl into patterns.",
    "Invent a butterfly wing pattern and mirror it.",
    "Create an underwater garden with plants and bubbles.",
    "Draw a mountain made from unexpected colors.",
    "Make a field of flowers using sticker stamps and freehand lines.",
    "Create a shell spiral with repeating marks.",
    "Draw a secret forest path that disappears into the distance."
  ]},
  { id:"creature-lab", name:"Creature Lab", icon:"👾", prompts:[
    "Use Creature Spark, then add a name and personality with your own marks.",
    "Invent a friendly creature with three unusual features.",
    "Make a tiny creature that could live inside a flower.",
    "Draw a space pet that loves collecting stars.",
    "Create a creature using mostly circles.",
    "Invent a mask for a guardian of an imaginary garden.",
    "Make two mirrored creatures that look like best friends.",
    "Draw a creature with a funny hat, antenna, or backpack.",
    "Create an animal that is half land creature and half sea creature.",
    "Design a whole family of little doodle creatures."
  ]},
  { id:"space-imagination", name:"Space & Imagination", icon:"🌌", prompts:[
    "Draw a planet with rings, moons, and a place you would visit.",
    "Create a doorway to another world.",
    "Make a star map using dots and connecting lines.",
    "Design a spaceship powered by something silly.",
    "Draw an alien garden growing under two suns.",
    "Create a floating island with something surprising on top.",
    "Make a colorful comet trail across the canvas.",
    "Invent a constellation and give it a name.",
    "Draw a city inside a glass space bubble.",
    "Create the view from a window on a peaceful spaceship."
  ]},
  { id:"calm-motion", name:"Calm Motion & Spiro", icon:"🌀", prompts:[
    "Press Spiro Garden and decorate the loops with tiny marks.",
    "Make slow-looking waves using long curved lines.",
    "Create a spiral that changes color as it grows.",
    "Build a soft kaleidoscope with radial symmetry and gentle colors.",
    "Draw repeating circles that feel like ripples on water.",
    "Make a pattern that looks like music moving through the air.",
    "Create a flower from one continuous looping line.",
    "Draw a trail that circles the center without touching it.",
    "Use dots and curved lines to make a quiet night pattern.",
    "Create a motion picture that still feels peaceful when it is standing still."
  ]},
  { id:"open-studio", name:"Open Studio", icon:"✨", prompts:[
    "Make anything you want. There is no goal except enjoying the page.",
    "Combine a Spiro Garden, a creature, and your own drawing.",
    "Create a picture for someone you care about.",
    "Draw a place where you would feel comfortable resting.",
    "Make a poster for an imaginary festival.",
    "Design a flag for your own friendly planet.",
    "Create an artwork using every tool at least once.",
    "Make something using only two colors and one sticker.",
    "Start with Creature Spark and turn it into a whole scene.",
    "Create your LarriVerse masterpiece and export it when you are ready."
  ]}
]);

export const CREATIVE_PROMPTS = Object.freeze(
  CREATIVE_CHAPTERS.flatMap((chapter, chapterIndex) =>
    chapter.prompts.map((prompt, offset) => Object.freeze({
      id: chapterIndex * 10 + offset + 1,
      chapter: chapterIndex,
      chapterId: chapter.id,
      chapterName: chapter.name,
      icon: chapter.icon,
      prompt
    }))
  )
);
