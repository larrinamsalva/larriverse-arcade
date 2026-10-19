// Twenty extra low-pressure Chill Brain missions.
// These append after the original 60, preserving existing saved progress.
const bonusScenes = [
  ["Window Shapes","🪟","Which pattern is easiest to verify in a simple window picture?",
    ["Count the visible panes one at a time","Guess how many panes are hidden behind the wall","Count only imaginary panes"],
    "If the picture feels busy, which choice keeps the activity gentle?",
    ["Look at one small section at a time","Race to scan every detail instantly","Keep staring after your eyes feel tired"]],
  ["Leaf Pairs","🍃","Which noticing task fits a picture with several leaves?",
    ["Match two leaves with the same simple shape","Pretend every leaf is identical without looking","Count leaves that are not shown"],
    "If you lose your place while matching leaves, what is a calm next step?",
    ["Start again from one clear leaf","Get angry and tap randomly","Keep guessing without looking"]],
  ["Book Stack","📚","Which small memory task fits a stack of three colored books?",
    ["Notice the top, middle, and bottom colors","Memorize every book ever printed","Ignore the stack and invent new colors"],
    "If you forget the order, which response is most useful?",
    ["Look again and rebuild the order slowly","Decide forgetting means you failed","Close the activity forever"]],
  ["Garden Colors","🌷","Which focus task fits a picture of flowers in three colors?",
    ["Group the visible flowers by color","Name colors that are not in the picture","Count the soil instead of the flowers"],
    "If two colors look similar, what can you do?",
    ["Compare them side by side without rushing","Force an answer before looking","Skip all visual details"]],
  ["Shell Spirals","🐚","Which pattern task fits a drawing of spiral shells?",
    ["Trace each visible spiral with your eyes","Spin yourself in circles to copy the shell","Guess the number of spirals without looking"],
    "If the spiral feels hard to follow, what is a gentle option?",
    ["Pause and restart from the center or edge","Move faster until it becomes confusing","Keep going even if uncomfortable"]],
  ["Tree Branches","🌳","Which observation task fits a simple tree drawing?",
    ["Find one branch that splits into two smaller branches","Count roots that are hidden underground","Pretend the trunk is not visible"],
    "If the drawing has many branches, what helps?",
    ["Choose one branch and follow it at your own pace","Try to track every branch at once","Stop looking and guess"]],
  ["Star Groups","⭐","Which counting task fits several small groups of stars?",
    ["Count one group, then move to the next","Count all groups at the same time","Choose a total before counting"],
    "If you make a counting mistake, what should happen next?",
    ["Correct it and continue without penalty","Start over because mistakes are not allowed","Rush the rest of the activity"]],
  ["Pebble Rows","🪨","Which sorting task fits a picture of pebbles in rows?",
    ["Compare which row has more visible pebbles","Sort pebbles that are outside the picture","Choose the longest row without counting"],
    "If two rows are close in size, what is a useful choice?",
    ["Count each row again slowly","Assume the first guess must be right","Tap quickly without checking"]],
  ["Cloud Layers","☁️","Which noticing task fits a sky picture with high and low clouds?",
    ["Identify one cloud near the top and one near the horizon","Look for clouds behind the screen","Count clouds without viewing the picture"],
    "If the sky picture feels visually crowded, what can you do?",
    ["Focus on one area before moving to another","Force yourself to inspect everything at once","Increase the pace until it feels stressful"]],
  ["Butterfly Sides","🦋","Which pattern task fits a butterfly illustration?",
    ["Compare a marking on the left wing with the right wing","Look for wheels under the wings","Ignore the visible wing patterns"],
    "If the two sides are not exactly identical, what is a good response?",
    ["Notice both similarities and differences","Decide the picture is wrong","Keep clicking until something changes"]]
];

function rotateChoices(choices, answer) {
  return Array.from({length:3},(_,n)=>choices[(n-answer+3)%3]);
}

export const chillBonusMissions = [
  ...bonusScenes.map((scene,index)=>{
    const [name,icon,prompt,choices]=scene;
    const answer=index%3, options=rotateChoices(choices,answer);
    return {
      id:"chill-"+String(61+index).padStart(2,"0"),
      title:icon+" "+name+" · Pattern & Memory",
      chapter:"Pattern & Memory", icon,
      prompt, options, answer,
      why:"This mission is about unhurried noticing, not speed or perfection. "+choices[0]+"."
    };
  }),
  ...bonusScenes.map((scene,index)=>{
    const [name,icon,,,prompt,choices]=scene;
    const answer=(index+1)%3, options=rotateChoices(choices,answer);
    return {
      id:"chill-"+String(71+index).padStart(2,"0"),
      title:icon+" "+name+" · Gentle Decision Making",
      chapter:"Gentle Decision Making", icon,
      prompt, options, answer,
      why:"This mission keeps control with the player and allows pausing or trying again. "+choices[0]+"."
    };
  })
];
