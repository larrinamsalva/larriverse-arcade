// Bonus missions for the two Brain Sweat cabinets.
// Existing missions 1-60 remain unchanged. Brain Sweat Expanded uses nine
// previously unused reviewed ledger activities first, then clearly labeled
// safe bonus practice. Life Skills bonus missions are new low-risk practice;
// review-queued medical, legal, and other high-risk lessons remain locked.

export const sweatBonusMissions = [
  {
    id:"sweat-61", sourceId:"checkbook-int-8", chapter:"Checkbook & Balancing",
    title:"💰 Checkbook & Balancing · Reviewed Bonus · School Trip Fee",
    prompt:"Practice ledger: start with $150. Add $50 (Allowance + Chores); spend $43 (Garden tools + seeds); add $80 (Sold old bike); spend $20 (Donate to shelter); add $60 (Monthly allowance); spend $35 (Unexpected repair); add $40 (Babysitting income); spend $28 (School trip fee). What balance remains?",
    options:["$246","$254","$262"], answer:1,
    why:"Add deposits and subtract withdrawals in order. The toy-ledger balance is $254.",
    guide:"This is a simulated classroom choice, not real financial advice or permission to spend money."
  },
  {
    id:"sweat-62", sourceId:"checkbook-adv-1", chapter:"Checkbook & Balancing",
    title:"💰 Checkbook & Balancing · Reviewed Bonus · Allowance + Part-time Work",
    prompt:"Practice ledger: start with $300. Add $120 for allowance plus part-time work. What balance remains?",
    options:["$410","$420","$430"], answer:1,
    why:"A deposit increases the practice balance: $300 + $120 = $420.",
    guide:"This is a simulated classroom choice, not real financial advice or permission to spend money."
  },
  {
    id:"sweat-63", sourceId:"checkbook-adv-2", chapter:"Checkbook & Balancing",
    title:"💰 Checkbook & Balancing · Reviewed Bonus · Garden Plot",
    prompt:"Practice ledger: start with $300. Add $120 (Allowance + Part-time work); spend $45 (Rent for garden plot). What balance remains?",
    options:["$365","$375","$385"], answer:1,
    why:"Track the deposit and withdrawal in order: $300 + $120 - $45 = $375.",
    guide:"This is a simulated classroom choice, not real financial advice or permission to spend money."
  },
  {
    id:"sweat-64", sourceId:"checkbook-adv-3", chapter:"Checkbook & Balancing",
    title:"💰 Checkbook & Balancing · Reviewed Bonus · Handmade Crafts",
    prompt:"Practice ledger: start with $300. Add $120; spend $45; then add $65 from sold handmade crafts. What balance remains?",
    options:["$430","$440","$450"], answer:1,
    why:"Following the toy ledger in order gives $300 + $120 - $45 + $65 = $440.",
    guide:"This is a simulated classroom choice, not real financial advice or permission to spend money."
  },
  {
    id:"sweat-65", sourceId:"checkbook-adv-4", chapter:"Checkbook & Balancing",
    title:"💰 Checkbook & Balancing · Reviewed Bonus · Donation",
    prompt:"Practice ledger: start with $300. Add $120; spend $45; add $65; then spend $18 on the listed donation. What balance remains?",
    options:["$412","$422","$432"], answer:1,
    why:"Following each practice transaction gives $300 + $120 - $45 + $65 - $18 = $422.",
    guide:"This is a simulated classroom choice, not real financial advice or permission to spend money."
  },
  {
    id:"sweat-66", sourceId:"checkbook-adv-5", chapter:"Checkbook & Balancing",
    title:"💰 Checkbook & Balancing · Reviewed Bonus · Gift Money",
    prompt:"Practice ledger: start with $300. Add $120; spend $45; add $65; spend $18; then add $90 in birthday and holiday gift money. What balance remains?",
    options:["$502","$512","$522"], answer:1,
    why:"Add deposits and subtract withdrawals in sequence. The practice balance becomes $512.",
    guide:"This is a simulated classroom choice, not real financial advice or permission to spend money."
  },
  {
    id:"sweat-67", sourceId:"checkbook-adv-6", chapter:"Checkbook & Balancing",
    title:"💰 Checkbook & Balancing · Reviewed Bonus · Repair Expense",
    prompt:"Practice ledger: start with $300. Add $120; spend $45; add $65; spend $18; add $90; then spend $75 on the listed repair. What balance remains?",
    options:["$427","$437","$447"], answer:1,
    why:"Keeping the toy ledger in order produces a final practice balance of $437.",
    guide:"This is a simulated classroom choice, not real financial advice or permission to spend money."
  },
  {
    id:"sweat-68", sourceId:"checkbook-adv-7", chapter:"Checkbook & Balancing",
    title:"💰 Checkbook & Balancing · Reviewed Bonus · Freelance Payment",
    prompt:"Practice ledger: continue the advanced ledger at $437, then add the listed $150 freelance project payment. What balance remains?",
    options:["$577","$587","$597"], answer:1,
    why:"The reviewed ledger adds the $150 deposit to $437, giving a practice balance of $587.",
    guide:"This is a simulated classroom choice, not real financial advice or permission to spend money."
  },
  {
    id:"sweat-69", sourceId:"checkbook-adv-8", chapter:"Checkbook & Balancing",
    title:"💰 Checkbook & Balancing · Reviewed Bonus · School Supplies",
    prompt:"Practice ledger: continue the advanced ledger at $587, then spend the listed $62 on school supplies. What balance remains?",
    options:["$515","$525","$535"], answer:1,
    why:"The reviewed ledger subtracts the $62 withdrawal from $587, leaving a practice balance of $525.",
    guide:"This is a simulated classroom choice, not real financial advice or permission to spend money."
  },
  {
    id:"sweat-70", sourceId:"bonus-workshop-70", chapter:"Logic & Planning",
    title:"🧩 Safe Bonus Practice · Put a Project in Order",
    prompt:"A classroom project has four steps: understand the goal, make a plan, do the work, and check the result. Which order makes the most sense?",
    options:["Plan → Check → Goal → Work","Goal → Plan → Work → Check","Work → Goal → Check → Plan"], answer:1,
    why:"Understanding the goal before planning, then checking after the work, makes the process easier to debug and improve.",
    guide:"This is a simulated classroom choice and a clearly labeled safe bonus practice."
  },
  {
    id:"sweat-71", sourceId:"bonus-workshop-71", chapter:"Logic & Planning",
    title:"🧩 Safe Bonus Practice · Break Down a Big Task",
    prompt:"A research poster feels too large to finish at once. Which planning move is most useful first?",
    options:["Split it into smaller named tasks","Ignore the deadline until the last day","Start five unrelated projects instead"], answer:0,
    why:"Breaking one large goal into smaller tasks makes progress visible and gives you clear places to check your work.",
    guide:"This is a simulated classroom choice and a clearly labeled safe bonus practice."
  },
  {
    id:"sweat-72", sourceId:"bonus-workshop-72", chapter:"Logic & Planning",
    title:"🧩 Safe Bonus Practice · Test One Change",
    prompt:"A simple model is not working as expected. What is the best way to learn which change helped?",
    options:["Change everything at once","Change one thing, test, and compare","Never test the model again"], answer:1,
    why:"Changing one variable at a time makes it easier to connect a result with the change that caused it.",
    guide:"This is a simulated classroom choice and a clearly labeled safe bonus practice."
  },
  {
    id:"sweat-73", sourceId:"bonus-workshop-73", chapter:"Digital Organization",
    title:"🗂️ Safe Bonus Practice · Name a File Clearly",
    prompt:"You are saving a school report that will be revised several times. Which filename is easiest to recognize later?",
    options:["stuff-final-maybe","science-report-v2","untitled-9834"], answer:1,
    why:"A short descriptive name plus a version number makes a file easier to find and distinguish from older copies.",
    guide:"This is a simulated classroom choice and a clearly labeled safe bonus practice."
  },
  {
    id:"sweat-74", sourceId:"bonus-workshop-74", chapter:"Digital Organization",
    title:"🗂️ Safe Bonus Practice · Sort Project Files",
    prompt:"A project folder has notes, pictures, and finished exports mixed together. Which setup makes future work easiest?",
    options:["Use simple folders for notes, images, and exports","Rename every file the same thing","Delete everything after each session"], answer:0,
    why:"Simple categories reduce searching and make it easier to tell source material from finished work.",
    guide:"This is a simulated classroom choice and a clearly labeled safe bonus practice."
  },
  {
    id:"sweat-75", sourceId:"bonus-workshop-75", chapter:"Digital Organization",
    title:"🗂️ Safe Bonus Practice · Keep a Backup Copy",
    prompt:"You have an important class presentation on one device. What is a sensible preparation step before presentation day?",
    options:["Keep one backup copy in an approved place","Delete the original to save space","Change every slide at the last minute"], answer:0,
    why:"A second approved copy protects your work if the first file becomes unavailable or accidentally changes.",
    guide:"This is a simulated classroom choice and a clearly labeled safe bonus practice."
  },
  {
    id:"sweat-76", sourceId:"bonus-workshop-76", chapter:"Coding Concepts",
    title:"💻 Safe Bonus Practice · Find the Repeated Step",
    prompt:"A program performs the same simple action ten times. Which coding idea is designed to repeat an instruction?",
    options:["A loop","A picture file","A password hint"], answer:0,
    why:"A loop repeats a set of instructions, which can make a program shorter and easier to update.",
    guide:"This is a simulated classroom choice and a clearly labeled safe bonus practice."
  },
  {
    id:"sweat-77", sourceId:"bonus-workshop-77", chapter:"Coding Concepts",
    title:"💻 Safe Bonus Practice · Name a Variable",
    prompt:"A program needs to remember a player's score. Which variable name communicates its purpose most clearly?",
    options:["x","playerScore","thing"], answer:1,
    why:"A descriptive variable name such as playerScore helps readers understand what the stored value represents.",
    guide:"This is a simulated classroom choice and a clearly labeled safe bonus practice."
  },
  {
    id:"sweat-78", sourceId:"bonus-workshop-78", chapter:"Coding Concepts",
    title:"💻 Safe Bonus Practice · Read an Error Message",
    prompt:"A small program stops and shows an error with a line number. What is the most useful first debugging step?",
    options:["Read the message and inspect that line","Delete the whole project immediately","Press random keys until it changes"], answer:0,
    why:"The error message and line number give a specific clue, so checking that location is a focused debugging step.",
    guide:"This is a simulated classroom choice and a clearly labeled safe bonus practice."
  },
  {
    id:"sweat-79", sourceId:"bonus-workshop-79", chapter:"Community Design",
    title:"🏘️ Safe Bonus Practice · Make Directions Clear",
    prompt:"A community map should help visitors find the library. Which design choice is most useful?",
    options:["Use a clear label and simple landmark","Hide the library behind decorative text","Use five different names for the same building"], answer:0,
    why:"A consistent label plus an easy landmark helps people orient themselves without adding unnecessary confusion.",
    guide:"This is a simulated classroom choice and a clearly labeled safe bonus practice."
  },
  {
    id:"sweat-80", sourceId:"bonus-workshop-80", chapter:"Community Design",
    title:"🏘️ Safe Bonus Practice · Improve a Shared Space",
    prompt:"Several people use the same activity table and supplies keep getting lost. Which improvement best supports everyone?",
    options:["Add labeled shared storage","Let one person hide all supplies","Remove the table so nobody can use it"], answer:0,
    why:"Clearly labeled shared storage gives everyone a predictable place to find and return common materials.",
    guide:"This is a simulated classroom choice and a clearly labeled safe bonus practice."
  }
];

export const lifeBonusMissions = [
  {
    id:"life-61", sourceId:"bonus-life-61", chapter:"Everyday Organization",
    title:"🗓️ Safe Bonus Practice · Calendar Check",
    prompt:"Two school activities appear at the same time on your calendar. What should you do before making a new commitment?",
    options:["Check the times and ask the adults involved","Promise to attend both without checking","Delete both events"], answer:0,
    why:"Checking the details first helps you spot a real conflict and make a plan with the people responsible for the schedule.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-62", sourceId:"bonus-life-62", chapter:"Everyday Organization",
    title:"🎒 Safe Bonus Practice · Pack Ahead",
    prompt:"You need several ordinary school items tomorrow morning. Which habit can make the morning easier?",
    options:["Pack the known items the night before","Hide the list and guess in the morning","Bring everything you own"], answer:0,
    why:"Preparing known items ahead of time reduces last-minute searching and gives you a chance to notice something missing.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-63", sourceId:"bonus-life-63", chapter:"Everyday Organization",
    title:"📦 Safe Bonus Practice · Give Things a Home",
    prompt:"Craft supplies keep disappearing around the room. Which simple organization idea is most helpful?",
    options:["Use labeled places for common supplies","Move every item to a new place each day","Pile everything into one unlabeled box"], answer:0,
    why:"A consistent labeled place makes it easier to find supplies and return them when the activity is finished.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-64", sourceId:"bonus-life-64", chapter:"Everyday Organization",
    title:"✅ Safe Bonus Practice · Make a Short Checklist",
    prompt:"A five-step morning routine is easy to forget. What tool can help you remember each step without holding everything in your head?",
    options:["A short checklist","A random number generator","A blank page you never look at"], answer:0,
    why:"A short visible checklist reduces memory load and lets you mark progress one ordinary task at a time.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-65", sourceId:"bonus-life-65", chapter:"Communication & Boundaries",
    title:"💬 Safe Bonus Practice · Ask Before Sharing",
    prompt:"You took a funny photo of a friend. What should you do before posting or sending it to other people?",
    options:["Ask for their permission","Post it first and ask later","Send it to strangers for opinions"], answer:0,
    why:"Asking before sharing respects your friend's privacy and gives them a real choice about where their image goes.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-66", sourceId:"bonus-life-66", chapter:"Communication & Boundaries",
    title:"🛑 Safe Bonus Practice · Respect a No",
    prompt:"Someone says they do not want to lend an item today. What is a respectful response?",
    options:["Accept the answer and choose another option","Keep asking until they give up","Take the item while they are distracted"], answer:0,
    why:"Respecting a clear no supports healthy boundaries and avoids turning a small disagreement into a bigger problem.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-67", sourceId:"bonus-life-67", chapter:"Communication & Boundaries",
    title:"🤝 Safe Bonus Practice · Solve a Group Disagreement",
    prompt:"Two teammates want different ideas for a poster. Which response gives both people a fair chance to contribute?",
    options:["Compare the ideas and agree on a plan together","Tell one person they never get a turn","Stop the project without discussing it"], answer:0,
    why:"Listening to both ideas and choosing a shared plan helps the group solve the actual problem instead of attacking a person.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-68", sourceId:"bonus-life-68", chapter:"Communication & Boundaries",
    title:"🔒 Safe Bonus Practice · Protect Personal Details",
    prompt:"An unfamiliar online account asks for your home address to send a surprise. What is the safer choice?",
    options:["Do not share it and involve a trusted adult","Send the address immediately","Post the address publicly so delivery is easier"], answer:0,
    why:"Home addresses are private information. An unexpected request from an unfamiliar account should be checked with a trusted adult.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-69", sourceId:"bonus-life-69", chapter:"Digital Habits",
    title:"🔗 Safe Bonus Practice · Verify a Surprise Link",
    prompt:"A surprise message says your school account needs urgent attention and includes a new link. What should you do?",
    options:["Open the usual school site yourself and verify there","Use the surprise link because it says urgent","Forward the link to everyone"], answer:0,
    why:"Using a familiar route to the real service avoids trusting a link simply because a message creates urgency.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-70", sourceId:"bonus-life-70", chapter:"Digital Habits",
    title:"🔑 Safe Bonus Practice · Keep Codes Private",
    prompt:"A stranger asks you to read them a one-time sign-in code that appeared on your device. What should you do?",
    options:["Keep the code private and ask a trusted adult for help","Read the code aloud to prove you are friendly","Post the code in a group chat"], answer:0,
    why:"One-time codes help protect accounts and should not be shared with someone who unexpectedly asks for them.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-71", sourceId:"bonus-life-71", chapter:"Digital Habits",
    title:"🗂️ Safe Bonus Practice · Save Work Clearly",
    prompt:"You have several versions of the same assignment. Which habit makes the newest version easier to find?",
    options:["Use descriptive filenames with simple version numbers","Name every file document","Store each version in a random location"], answer:0,
    why:"Clear names and simple version numbers help you tell which copy is current without opening every file.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-72", sourceId:"bonus-life-72", chapter:"Digital Habits",
    title:"👀 Safe Bonus Practice · Take a Screen Break",
    prompt:"You have been staring at a screen for a long study session and feel tired of looking at it. What is a reasonable choice?",
    options:["Pause and look away or move around for a bit","Force yourself to stare without blinking","Turn the brightness to maximum and keep going"], answer:0,
    why:"A short voluntary break can make a long study session more comfortable; there is no prize for pushing through discomfort.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-73", sourceId:"bonus-life-73", chapter:"Planning & Choices",
    title:"🧾 Safe Bonus Practice · Compare the Whole Cost",
    prompt:"Two pretend school-supply bundles have different prices and quantities. What should you compare before choosing?",
    options:["The total cost and what each bundle actually includes","Only the biggest number on the sign","Only which package has brighter colors"], answer:0,
    why:"Comparing both cost and quantity helps you understand what you would receive for the pretend purchase.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-74", sourceId:"bonus-life-74", chapter:"Planning & Choices",
    title:"💰 Safe Bonus Practice · Plan Before Pretend Spending",
    prompt:"In a classroom budgeting game, you have a limited amount for several needs. What is useful before choosing extras?",
    options:["List the needs and total their pretend costs","Spend randomly until the balance reaches zero","Ignore the amount available"], answer:0,
    why:"Listing needs first makes the pretend budget visible and leaves room to decide what can fit afterward.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-75", sourceId:"bonus-life-75", chapter:"Planning & Choices",
    title:"🧠 Safe Bonus Practice · Check the Source",
    prompt:"Two posts disagree about the date of a public event. Which next step is most useful?",
    options:["Check the organizer's official information","Choose the post with more emojis","Assume the first post must be correct"], answer:0,
    why:"The event organizer's own current information is a stronger place to verify a date than competing copied posts.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-76", sourceId:"bonus-life-76", chapter:"Planning & Choices",
    title:"🧭 Safe Bonus Practice · Use a Meeting Point",
    prompt:"A family is visiting a busy public place together. What simple planning idea can help if people become separated?",
    options:["Agree on a public meeting point with the responsible adult","Wander farther away looking everywhere","Leave the area without telling anyone"], answer:0,
    why:"A pre-agreed public meeting point gives the group a simple shared plan and should be chosen with the responsible adult.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-77", sourceId:"bonus-life-77", chapter:"Home Routines",
    title:"🧺 Safe Bonus Practice · Sort Before Starting",
    prompt:"A mixed pile of ordinary clean clothing needs to be put away. What first step can make the task easier?",
    options:["Sort items into simple groups","Throw each item into a random room","Hide the whole pile under furniture"], answer:0,
    why:"Simple grouping turns one large pile into smaller decisions and makes it easier to put similar items in their usual places.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-78", sourceId:"bonus-life-78", chapter:"Home Routines",
    title:"🧹 Safe Bonus Practice · Clean One Zone",
    prompt:"A room feels cluttered and the whole job looks overwhelming. Which approach can make progress easier to see?",
    options:["Choose one small area and finish it first","Move every item into a bigger pile","Start in five places and finish none"], answer:0,
    why:"Finishing one small zone creates a clear result and gives you a natural place to continue from.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-79", sourceId:"bonus-life-79", chapter:"Home Routines",
    title:"📝 Safe Bonus Practice · Check What You Already Have",
    prompt:"Before making a pretend grocery list for a class activity, what is a useful first step?",
    options:["Check the pretend pantry list for items already available","Add every possible item automatically","Ignore the planned meals"], answer:0,
    why:"Checking what is already available can prevent duplicate choices and makes the planning exercise more realistic.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  },
  {
    id:"life-80", sourceId:"bonus-life-80", chapter:"Home Routines",
    title:"🌟 Safe Bonus Practice · Review the Day",
    prompt:"At the end of a busy day, which reflection can help with tomorrow's planning?",
    options:["Notice one thing that worked and one thing to adjust","Decide every mistake means the whole day failed","Refuse to change any plan ever"], answer:0,
    why:"A small review turns experience into useful information without demanding perfection from the day.",
    guide:"Safe bonus practice. Review-queued medical, legal, and high-risk lessons remain locked in the original game."
  }
];
