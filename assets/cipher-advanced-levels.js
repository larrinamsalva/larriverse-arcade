// Advanced Cipher Club chapters 13–24.
// These levels intentionally graduate from the original A–H toy alphabet to A–Z
// so later challenges can use longer, age-appropriate real words.
const FULL_ALPHABET="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const source=[
  [
    "ADVENTURE",
    "A journey with exciting experiences"
  ],
  [
    "TREASURE",
    "Something valuable that is discovered"
  ],
  [
    "DISCOVERY",
    "Finding or learning something new"
  ],
  [
    "BACKPACK",
    "A bag carried on your back"
  ],
  [
    "NOTEBOOK",
    "A book for writing notes"
  ],
  [
    "SUNSHINE",
    "Light from the sun"
  ],
  [
    "RAINBOW",
    "Colored bands seen after rain"
  ],
  [
    "MOUNTAIN",
    "A very high area of land"
  ],
  [
    "CAMPFIRE",
    "A small outdoor fire used safely with adults"
  ],
  [
    "STARLIGHT",
    "Light that comes from stars"
  ],
  [
    "BUTTERFLY",
    "An insect with colorful wings"
  ],
  [
    "WATERFALL",
    "Water dropping over a steep edge"
  ],
  [
    "PLAYGROUND",
    "A place built for play"
  ],
  [
    "FRIENDSHIP",
    "A caring relationship between friends"
  ],
  [
    "TEAMWORK",
    "People working together toward a goal"
  ],
  [
    "KINDNESS",
    "Caring and helpful behavior"
  ],
  [
    "COURAGE",
    "Doing something difficult even when nervous"
  ],
  [
    "CURIOSITY",
    "Wanting to learn or understand more"
  ],
  [
    "CREATIVE",
    "Able to make or imagine new things"
  ],
  [
    "BUILDING",
    "Making or constructing something"
  ],
  [
    "GARDENING",
    "Growing and caring for plants"
  ],
  [
    "HARVEST",
    "Gathering crops when they are ready"
  ],
  [
    "VEGETABLE",
    "An edible plant or plant part"
  ],
  [
    "BLUEBERRY",
    "A small blue-purple fruit"
  ],
  [
    "STRAWBERRY",
    "A red fruit with seeds on the outside"
  ],
  [
    "PINEAPPLE",
    "A tropical fruit with a rough outside"
  ],
  [
    "SANDWICH",
    "Food placed between pieces of bread"
  ],
  [
    "BREAKFAST",
    "The first meal of the day"
  ],
  [
    "LIBRARY",
    "A place with books and other learning resources"
  ],
  [
    "SCIENCE",
    "Learning about the natural world through evidence"
  ],
  [
    "WEATHER",
    "Conditions such as sun rain wind and clouds"
  ],
  [
    "FORECAST",
    "A prediction about future weather"
  ],
  [
    "THUNDER",
    "The sound caused by lightning"
  ],
  [
    "LIGHTNING",
    "A bright electrical flash in a storm"
  ],
  [
    "SNOWFLAKE",
    "A small crystal of snow"
  ],
  [
    "LIGHTHOUSE",
    "A tower with a guiding light near water"
  ],
  [
    "COMPASS",
    "A tool that shows direction"
  ],
  [
    "DIRECTION",
    "The way something points or moves"
  ],
  [
    "LANDMARK",
    "A recognizable place used for navigation"
  ],
  [
    "ROADTRIP",
    "A journey taken by road"
  ],
  [
    "CROSSWALK",
    "A marked place for people to cross a road"
  ],
  [
    "SIDEWALK",
    "A path beside a road for people walking"
  ],
  [
    "BICYCLE",
    "A two-wheeled vehicle moved by pedals"
  ],
  [
    "SEATBELT",
    "A safety restraint used in a vehicle"
  ],
  [
    "TRAFFIC",
    "Vehicles and road users moving through an area"
  ],
  [
    "SIGNPOST",
    "A post that holds a sign"
  ],
  [
    "EMERGENCY",
    "A serious situation needing quick help"
  ],
  [
    "HOSPITAL",
    "A place where medical care is provided"
  ],
  [
    "NEIGHBOR",
    "A person who lives nearby"
  ],
  [
    "COMMUNITY",
    "People sharing a place or common connection"
  ],
  [
    "RESPONSIBLE",
    "Able to be trusted to do what is expected"
  ],
  [
    "PRACTICE",
    "Repeated work that helps improve a skill"
  ],
  [
    "LEARNING",
    "Gaining knowledge or skill"
  ],
  [
    "QUESTION",
    "Something asked to get information"
  ],
  [
    "SOLUTION",
    "An answer to a problem"
  ],
  [
    "PATTERN",
    "A repeated or organized arrangement"
  ],
  [
    "MESSAGE",
    "Information sent from one person to another"
  ],
  [
    "DECODER",
    "A tool or person that turns code into readable meaning"
  ],
  [
    "SECURITY",
    "Protection against danger or unwanted access"
  ],
  [
    "NAVIGATION",
    "Finding and following a route"
  ]
];
export const advancedCipherLevels = source.map(([word,clue],index)=>({
  word,
  clue,
  shift:1+(index*5)%25,
  encode:index%2===0,
  alphabet:FULL_ALPHABET,
  chapter:13+Math.floor(index/5),
}));
