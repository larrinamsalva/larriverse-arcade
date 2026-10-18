// Advanced life-skill campaigns: chapters 7–12 for five classic LarriVerse worlds.
// Generated from curated scenario sets so every activity has a distinct prompt/title while
// keeping the original answer model and kid-friendly explanations.

const safeMessages = [
  ["School calendar","📅","You open the school calendar from the bookmark your family already uses and read tomorrow's spirit-day reminder."],
  ["Library catalog","📚","You type the library address you know and check whether a book is available; it asks for no new private information."],
  ["Team practice board","⚽","Inside the normal team app, your coach posts the usual practice field and start time."],
  ["Museum hours","🏛️","You visit the museum's official site directly to check its public opening hours."],
  ["Weather page","🌤️","You open the weather service page your family normally uses and read the current forecast."],
  ["Class assignment","📝","Your regular classroom portal shows an assignment your teacher posted for next week."],
  ["Transit schedule","🚌","You use the transit agency's official route page to check the next bus time."],
  ["Community pool hours","🏊","You navigate to the city's pool page yourself and read today's public swim schedule."],
  ["Park trail map","🗺️","You open the official park map through a saved city bookmark and look at trail names."],
  ["Book-club notice","📖","The library's normal events page lists the next book-club meeting without asking for secrets or payment."],
  ["School lunch menu","🥪","The usual school website shows the weekly lunch menu after you open it yourself."],
  ["Art center schedule","🎨","The community art center's official page lists a free family workshop and its public hours."],
  ["Homework reminder","🎒","Your teacher posts a routine reminder inside the same learning system your class always uses."],
  ["Recreation calendar","🏀","The city recreation site you opened yourself lists the season's public game calendar."],
  ["Zoo map","🦒","The zoo's official public map shows exhibit locations and closing time without asking you to sign in."],
  ["Club announcement","📌","A notice appears inside the club platform you already use, posted by the known club leader."],
  ["School library due date","📕","Your normal school library account shows a book due date with no request for a password in a message."],
  ["Family calendar","🗓️","You open the shared family calendar app you already use and see a dentist appointment reminder."],
  ["Official event page","🎪","You navigate to the event organizer's official page and read the posted location and start time."],
  ["Saved recipe page","🍲","You open a recipe page your family saved earlier and read the ingredient list without entering personal details."]
];
const verifyMessages = [
  ["Changed practice link","🏀","A teammate forwards a new practice location link that does not match the normal team calendar."],
  ["Unexpected library email","📧","An email says your library hours changed, but the sender address looks slightly different from the library's usual address."],
  ["Bus screenshot","🚌","A screenshot in a group chat shows a new bus time but does not show when the screenshot was taken."],
  ["Friend's new account","💬","A new account using your friend's name says they lost their old profile and asks you to follow this one instead."],
  ["School event flyer","🏫","A forwarded flyer says the school event moved to another night, but the official calendar has not changed yet."],
  ["Weather screenshot","🌧️","Someone posts a severe-weather screenshot with no date, location, or source link."],
  ["Game update rumor","🎮","A player says a favorite game is shutting down tonight but gives no official announcement."],
  ["Concert time rumor","🎵","A fan post says the concert starts two hours earlier than the ticket information."],
  ["Club cancellation","📣","A message from an unfamiliar number says today's club meeting is canceled."],
  ["Delivery notice","📦","A text mentions a package your family may be expecting but uses a shortened link you do not recognize."],
  ["New teacher account","👩‍🏫","An account with your teacher's name messages you outside the school system for the first time."],
  ["Contest result","🏆","A social post says your school team won a contest, but you cannot find the result on the organizer's page."],
  ["Changed park closure","🌲","A neighborhood post says the park is closed today, but it does not identify who posted the notice."],
  ["Relative's new number","☎️","A new number says it belongs to a relative and asks you to save it immediately."],
  ["Schedule photo","📷","A photo of a paper schedule conflicts with the current schedule in the official app."],
  ["Fundraiser claim","🎟️","A message says your school club started a fundraiser, but it came from someone you do not know."],
  ["New meeting room","🚪","A forwarded message says the after-school group moved rooms, but your leader has not announced it."],
  ["Sports score clip","🏅","A short video caption claims your team advanced to finals, but the league page has not updated."],
  ["Road closure rumor","🚧","A social post says the main road is closed, but it provides no date or agency source."],
  ["Account warning","🔔","A notification says an account setting changed, but you are unsure whether it came from the real service."]
];
const blockMessages = [
  ["Secret recovery code","🔐","A stranger says they can fix your account if you send the one-time code that just appeared on your device."],
  ["Gift-card prize fee","🎁","A message says you won a prize but must buy gift cards and send the numbers before the prize can ship."],
  ["Remote-control helper","💻","A pop-up tells you to install a remote-control app so an unknown technician can take over your device."],
  ["Private photo demand","📷","An online stranger says you must send a private photo and keep the request secret to stay in a group."],
  ["Home-address giveaway","🏠","An unfamiliar account promises free merchandise if you send your home address, school name, and daily schedule."],
  ["Crypto payment threat","₿","A message threatens to lock your account unless payment is sent immediately to a cryptocurrency wallet."],
  ["Password verification","🔑","Someone claiming to be support asks you to type your password directly into a private chat."],
  ["Family emergency gift cards","☎️","A new number claims a relative is in trouble and demands gift-card codes before you contact anyone else."],
  ["Free currency download","💎","A video promises unlimited game currency if you download an unknown program and turn off security warnings."],
  ["Bank login request","💳","A text says a payment failed and asks you to reply with a bank password and security code."],
  ["Stay-on-the-phone demand","📞","A caller says you must stay on the phone, tell nobody, and go buy gift cards right now."],
  ["Fake police payment","🚓","A caller claiming to be law enforcement demands immediate payment by gift card to avoid arrest."],
  ["Screen-share request","🖥️","A stranger says you must share your whole screen and open your family's financial account so they can issue a refund."],
  ["Verification-code trade","🎮","A player offers rare items if you send the login verification code from your phone."],
  ["Secret meet-up","📍","An online stranger asks you to meet alone and says not to tell a parent or trusted adult."],
  ["Prize shipping card","📦","A surprise prize page asks for a full card number, security code, and birthday before it will continue."],
  ["Password challenge","🏅","A post says everyone who comments their game password will receive an exclusive badge."],
  ["Threatening download","⚠️","A pop-up claims your files will disappear unless you install its cleanup program immediately."],
  ["Impersonated charity wallet","❤️","A private account uses a charity's name but insists donations go to a personal wallet and pressures you not to verify it."],
  ["Account rental offer","👤","A stranger offers money to borrow your account and asks for your username, password, and recovery code."]
];
const makeMessage=(entry,answer)=>({
  from:entry[0],icon:entry[1],text:entry[2],answer,
  why: answer===0
    ? "You reached a familiar source through a route you chose yourself, and the information does not ask for secrets, money, or an urgent risky action."
    : answer===1
      ? "The message might be true, but something does not match your normal trusted route. Check through an official source or a person you already know before acting."
      : "Requests for secrets, payment codes, private information, remote access, or secrecy are strong warning signs. Stop, block or close it, and tell a trusted adult."
});
export const advancedMessageExtras=[
  ...safeMessages.map(entry=>makeMessage(entry,0)),
  ...verifyMessages.map(entry=>makeMessage(entry,1)),
  ...blockMessages.map(entry=>makeMessage(entry,2)),
];

const kindnessThemes=[
  ["Taking turns","Two friends both want the same game piece.","Suggest a fair turn plan and ask whether it works for both.","Grab it before anyone else can.","Tell both friends their feelings do not matter.","A clear turn plan makes space for both people instead of rewarding grabbing."],
  ["Joining a game","A classmate is watching a group game and looks unsure about joining.","Ask whether they want to join and explain the rules without pressure.","Laugh because they do not already know the game.","Force them to play even if they say no.","An invitation can be kind while still respecting someone's choice to say no."],
  ["Borrowing supplies","A friend asks to borrow your markers, but you need them right now.","Say you are using them now and offer another time or another supply if you want.","Hand them over even though you need them.","Hide the markers and insult your friend.","A calm boundary can protect what you need without being unkind."],
  ["Different idea","Your group has two good ideas for the project.","Let everyone explain what matters, then look for a plan or fair decision.","Ignore the quieter person.","Destroy the other idea so yours wins.","Listening first helps a group make a decision that includes useful information."],
  ["Accidental bump","You bump someone's project and part of it falls down.","Own what happened, apologize, and ask whether help rebuilding would be useful.","Walk away and pretend it was not you.","Blame the person whose project was bumped.","Repair starts with naming what happened and offering useful help."],
  ["Too much teasing","A joke continues after someone asks for it to stop.","Stop the joke, check on the person, and get adult help if the behavior keeps going.","Keep joking because others are laughing.","Tell the person they are too sensitive.","A boundary matters even when something started as a joke."],
  ["Private information","A friend starts telling the group another kid's private story.","Do not spread it; change course and encourage talking to a trusted adult if help is needed.","Repeat it to more people.","Post it online before anyone else does.","Respecting privacy prevents a difficult moment from becoming a bigger one."],
  ["New student","A new student does not know where materials are kept.","Offer to show where things are and let them decide what help they want.","Make them figure everything out alone.","Take over every task for them.","Helpful support gives information without taking away independence."],
  ["Game disagreement","Two players disagree about whether a move followed the rules.","Pause, check the agreed rules, and restart the play fairly if needed.","Shout until the other player gives up.","Change the rules secretly.","Checking a shared rule is fairer than deciding by volume or pressure."],
  ["Need quiet","You need a quiet minute while friends want to keep talking.","Say you need a short quiet break and tell them when you can reconnect.","Stay while becoming more upset and say nothing.","Call everyone annoying.","Naming a need early can prevent frustration from becoming hurtful."],
  ["Helping choice","A friend looks upset but says they do not want to talk yet.","Say you are available later and give them the space they asked for.","Demand that they explain everything now.","Tell everyone they are upset.","Support can include respecting a request for space."],
  ["Shared cleanup","The group finishes an activity and there is a mess.","Divide the cleanup into small jobs and let everyone help.","Leave it for the next person.","Order one person to do all of it.","Shared responsibility works better when the jobs are clear and fair."],
  ["Credit for work","Someone uses your idea in a group project without mentioning you.","Calmly explain that you contributed the idea and ask the group to credit everyone's work.","Erase the whole project.","Spread a rumor about them.","A direct, specific request can repair credit without creating a new problem."],
  ["Online group chat","A group chat starts piling mean comments onto one person.","Do not join in; support the person and involve a trusted adult when needed.","Add another insult so you fit in.","Forward screenshots to embarrass the person more.","Group pressure does not make hurtful behavior okay."],
  ["Changing plans","A friend cancels because their family plans changed.","Acknowledge the change and make another plan if both of you want one.","Tell them they are a terrible friend.","Demand they ignore their family.","Plans can change without meaning the friendship is unimportant."],
  ["Personal space","Someone keeps leaning into your space after you move away.","Clearly ask for more space and get help if the request is ignored.","Push them as hard as possible.","Say nothing while getting more uncomfortable.","A clear boundary and adult backup are appropriate when personal space is not respected."],
  ["Winning kindly","You win a close game and the other player looks disappointed.","Celebrate without mocking them and thank them for playing.","Brag about every mistake they made.","Tell them they should quit the game.","Good sportsmanship leaves room for both pride and respect."],
  ["Losing calmly","You lose a game after trying hard.","Notice the disappointment, congratulate the winner, and decide whether you want another try later.","Throw the pieces.","Accuse everyone of cheating without evidence.","Managing disappointment is part of playing fairly."],
  ["Asking permission","You want to use a classmate's special art tool.","Ask first and accept their answer.","Take it while they are looking away.","Tell them they have to share everything.","Sharing is generous, but ownership and permission still matter."],
  ["Getting adult help","A problem keeps happening even after you used a clear boundary.","Tell a trusted adult what happened and what you already tried.","Handle it alone no matter how unsafe it feels.","Get revenge so the other person learns a lesson.","Asking for help is a useful next step when a problem repeats or feels unsafe."]
];
const kindnessVariants=[
  "During a classroom activity",
  "At an after-school club",
  "While friends are playing together"
];
export const advancedConversationExtras=kindnessThemes.flatMap((theme,themeIndex)=>
  kindnessVariants.map((setting,variant)=>{
    const correct=(themeIndex+variant)%3;
    const options=[theme[3],theme[4]];
    options.splice(correct,0,theme[2]);
    return {
      icon:["🤝","💬","🌟"][variant],
      title:`${theme[0]} · ${variant+1}`,
      text:`${setting}, ${theme[1].charAt(0).toLowerCase()+theme[1].slice(1)} What is a kind, useful next step?`,
      options,answer:correct,why:theme[5],
    };
  })
);

const newsTopics=[
  ["garden growth","a dated garden log with measurements and photos","tomatoes are the tastiest food","a seed company pays for a post praising its seeds","a cropped photo claims every garden grows twice as fast with no source"],
  ["bus service","the transit agency posts today's route and timestamp","the bus seats are the most comfortable in town","a backpack brand sponsors a bus-trip video","an anonymous post says every bus route is canceled with no agency notice"],
  ["school library","the catalog records how many books were checked out this month","mystery books are better than biographies","a publisher pays for a featured-book display","a screenshot claims the library is closing forever but has no date or source"],
  ["weather","a thermometer log lists temperatures at the same time for seven days","rainy days are the worst kind of weather","an umbrella company sponsors a storm-preparation post","a dramatic cloud photo claims a tornado is coming without location or official alert"],
  ["sports","the league posts the final score and game statistics","the blue team played the most exciting game","a shoe company pays an athlete to praise new shoes","a short clip claims a player cheated but omits the play before and after it"],
  ["recycling","the town waste department lists materials accepted this week","reusable bottles look cooler than cans","a bin company pays for a video about its product","a viral post says every plastic item is recyclable everywhere with no local rule"],
  ["museum","the museum catalog lists the artist, date, and material for a painting","the painting is the prettiest one in the room","the gift shop pays for a post promoting a souvenir","a post says the painting is secretly 1,000 years older but cites no evidence"],
  ["food label","the package lists ingredients and a printed net weight","this cereal tastes better than every other cereal","the cereal maker pays a creator to recommend the box","a photo claims one ingredient cures every illness without a reliable source"],
  ["park wildlife","a ranger log records three bird species seen during a survey","owls are the coolest park animals","a binocular company sponsors a birdwatching guide","an unlabeled photo claims a rare animal lives in the park but gives no location or source"],
  ["science fair","the project shows its question, method, measurements, and results","the volcano project was the most fun","a kit company pays for a demonstration using its product","a post says one classroom experiment proves a rule for the whole world"],
  ["road safety","the transportation department publishes a dated crash-summary table","roundabouts are more annoying than signals","a car company sponsors a safety video featuring its model","a repost claims a new traffic law starts tomorrow but links to no government source"],
  ["community event","the organizer's official page lists date, place, and accessibility details","the parade is the best event of the year","a snack company pays to be featured in the event guide","an old flyer is reposted as if it were this year's schedule"],
  ["book review","the book page lists its author, publisher, and publication date","the ending is much too slow","a bookstore pays for a promoted recommendation","a quote image claims the author said something but provides no original interview"],
  ["water use","the utility's meter report shows daily household use totals","short showers feel better than long showers","a showerhead company sponsors a water-saving ad","a post claims one trick cuts all water use in half but provides no measurements"],
  ["space","a space agency publishes telescope images with observation dates","Saturn is the most beautiful planet","a telescope company sponsors a stargazing article","a blurry light in the sky is called an alien ship with no location, time, or original file"]
];
export const advancedNewsExtras=newsTopics.flatMap((topic,index)=>[
  {icon:"🔎",text:`For ${topic[0]}, ${topic[1]}.`,answer:0,why:"This is checkable evidence because the source provides specific records, measurements, dates, or documented details that can be inspected."},
  {icon:"💭",text:`A reviewer says that for ${topic[0]}, ${topic[2]}.`,answer:1,why:"Words about what is best, worst, prettiest, coolest, or most enjoyable express a preference rather than a fact everyone must share."},
  {icon:"📣",text:`In a post about ${topic[0]}, ${topic[3]}.`,answer:2,why:"Payment or sponsorship gives the message a selling purpose. That makes it advertising even when it also contains useful information."},
  {icon:"❓",text:`A popular post about ${topic[0]} says ${topic[4]}.`,answer:3,why:"The claim is missing enough source, date, context, or evidence to trust it yet. Find the original information before repeating it."},
]);

const repairItems=[
  ["A book jacket corner is peeling","📘"],["A cardboard game divider bends","🎲"],["A paper folder tab tears","🗂️"],["A pencil case fabric loop loosens","✏️"],["A reusable tote handle seam opens","👜"],
  ["A shoebox corner collapses","📦"],["A poster edge curls","🖼️"],["A recipe card gets a small tear","📝"],["A bookmark tassel comes loose","🔖"],["A paper model roof lifts","🏠"],
  ["A toy box label peels","🏷️"],["A cardboard costume shield bends","🛡️"],["A notebook cover corner lifts","📓"],["A puzzle-board edge separates","🧩"],["A flashcard set loses its ring","🗃️"],
  ["A cloth lunch bag strap loosens","🎒"],["A reusable napkin seam opens","🧵"],["A stuffed toy bow comes loose","🧸"],["A fabric costume patch lifts","🎭"],["A soft pencil pouch lining bunches","🖊️"],
  ["A basket liner slips","🧺"],["A cloth book sleeve seam opens","📚"],["A reusable produce bag tie loosens","🥕"],["A hat decoration comes loose","🧢"],["A fabric game pouch drawstring slips","🎯"],
  ["A wooden craft sign wobbles","🪵"],["A model bridge rail loosens","🌉"],["A small wooden picture stand leans","🖼️"],["A craft-stick frame corner separates","🪵"],["A cardboard-and-wood model base rocks","🏗️"],
  ["A toy wagon handle grip twists","🛞"],["A metal lunch tin latch feels loose","🥫"],["A binder ring stops lining up","📒"],["A small storage tin lid sticks","🧰"],["A key-ring tag loop bends","🔑"],
  ["A reusable bottle label lifts","🥤"],["A jar label gets wet and wrinkles","🫙"],["A plastic organizer divider pops out","🧰"],["A reusable cup sleeve slides","🥤"],["A plant pot label loosens","🪴"],
  ["A board-game card box flap softens","🃏"],["A map fold begins to split","🗺️"],["A paper calendar hole tears","📅"],["A classroom sign corner bends","🪧"],["A craft envelope seam opens","✉️"],
  ["A toy cape fastener loosens","🦸"],["A costume belt loop pulls away","🎭"],["A doll blanket edge frays","🧵"],["A soft ball storage bag seam opens","⚽"],["A fabric flag edge frays","🚩"],
  ["A cardboard planter rim bends","🪴"],["A seed packet corner tears","🌱"],["A garden marker writing fades","🏷️"],["A watering-can label peels","💧"],["A harvest basket tag loosens","🧺"],
  ["A music folder corner tears","🎵"],["A rhythm-card set loses its clip","🥁"],["A headphone storage pouch seam opens","🎧"],["A microphone prop label lifts","🎤"],["A cardboard speaker model corner bends","🔊"]
];
export const advancedRepairExtras=repairItems.map(([title,icon],index)=>({
  icon,title,
  steps:[
    `Inspect ${title.toLowerCase()} and find the exact loose or damaged spot`,
    `Choose a gentle repair material with a trusted adult for repair ${index+61}`,
    "Line up the original shape before attaching or reinforcing anything",
    "Test the item gently and check that the repair did not block normal use"
  ],
  hint:"Inspect → choose → align → test. Use adult help for tools, sharp edges, heat, glue, or repairs that could affect safety.",
}));

const sortingGroups=[
  [0,"Reuse",[
    ["Clean glass jar with a good lid","🫙","jar"],["Outgrown jacket in good condition","🧥","shirt"],["Working desk lamp you no longer need","💡","metal"],["Reusable shopping tote","👜","shirt"],["Good puzzle with all pieces","🧩","cardboardBox"],
    ["Reusable party gift bag with sturdy handles","🎁","paper"],["Working toy truck","🚚","metal"],["Good notebook with blank pages","📓","book"],["Reusable food container with lid","🥡","bottle"],["Clean plant pot","🪴","brokenMug"],
    ["Extra pencils still usable","✏️","pencil"],["Good board game","🎲","cardboardBox"],["Reusable water bottle","🥤","bottle"],["Clean basket","🧺","basket"],["Good backpack","🎒","shirt"]
  ]],
  [1,"Recycle",[
    ["Clean cereal box","📦","cardboardBox"],["Clean aluminum drink can","🥫","can"],["Clean office paper","📄","paper"],["Clean cardboard shipping sleeve","📦","cardboardBox"],["Clean metal food can","🥫","can"],
    ["Paper mail with private details removed","✉️","paper"],["Clean paper bag","🛍️","paper"],["Flattened cardboard tube","🧻","cardboardBox"],["Clean paper egg carton accepted by Toy Town","🥚","cardboardBox"],["Clean cardboard snack box","📦","cardboardBox"],
    ["Clean metal jar lid","🫙","can"],["Clean index card","🗂️","paper"],["Clean cardboard craft scrap","✂️","cardboardBox"],["Clean paper instruction sheet","📃","paper"],["Clean metal soup can","🥫","can"]
  ]],
  [2,"Compost",[
    ["Mandarin orange peel","🍊","orange"],["Carrot tops","🥕","carrot"],["Apple peel","🍎","appleCore"],["Banana end","🍌","banana"],["Lettuce leaves","🥬","lettuce"],
    ["Cucumber ends","🥒","cucumber"],["Berry stems","🍓","berries"],["Melon rind piece","🍈","appleCore"],["Pea pods","🫛","lettuce"],["Corn husk piece","🌽","lettuce"],
    ["Wilted herb stems","🌿","lettuce"],["Tomato stem","🍅","tomatoPlant"],["Pear core","🍐","appleCore"],["Peach pit and scraps accepted by Toy Town","🍑","appleCore"],["Pumpkin peel scraps","🎃","appleCore"]
  ]],
  [3,"Trash",[
    ["Used adhesive bandage","🩹","tissue"],["Broken ceramic plate","🍽️","brokenMug"],["Greasy food wrapper","🍔","wrap"],["Used cleaning wipe","🧻","tissue"],["Cracked mirror piece for adult handling","🪞","brokenMirror"],
    ["Foam packing piece Toy Town cannot recycle","📦","wrap"],["Used disposable glove","🧤","wrap"],["Broken ceramic flowerpot","🪴","brokenMug"],["Dirty plastic film","🛍️","wrap"],["Used cotton swab","🧴","tissue"],
    ["Broken drinking glass for adult handling","🥛","brokenMirror"],["Waxed paper with food residue","📄","wrap"],["Used vacuum bag","🧹","tissue"],["Broken ceramic tile","🧱","brokenMug"],["Dirty snack pouch","🥨","wrap"]
  ]]
];
export const advancedSortingExtras=sortingGroups.flatMap(([bin,label,items])=>items.map(([name,icon,art])=>({
  name,icon,art,bin,
  why: bin===0 ? `${name} can still be used. Toy Town chooses reuse or donation before making it waste.`
    : bin===1 ? `${name} is clean and belongs in Toy Town's recycling program. Real local recycling rules can differ.`
      : bin===2 ? `${name} is a plant-based food scrap accepted by Toy Town's compost program. Check local compost rules with an adult.`
        : `${name} does not belong in Toy Town's reuse, recycling, or compost streams. Ask an adult to handle anything sharp or unsafe.`
})));
