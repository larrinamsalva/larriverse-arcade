// Extra Pantry Picnic challenges, authored for six new mini-themes.
// All cases use existing illustrated foods; no buying, token costs or accounts.
export const newPantryChallenges = [
  {
    "id": "orchard-morning",
    "name": "Orchard morning box",
    "chapter": "Garden & harvest",
    "prompt": "The orchard helpers saved apple pieces and a bread sandwich. Pack them with one vegetable for a picnic after picking fruit.",
    "stock": {
      "bread": 1,
      "beans": 1,
      "apple": 1,
      "orange": 1,
      "carrot": 1,
      "cucumber": 1
    },
    "mustUse": {
      "bread": 1,
      "apple": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "The saved apple and bread are packed first, and a vegetable fills the third space without waste."
  },
  {
    "id": "pea-patch-lunch",
    "name": "Pea patch lunch",
    "chapter": "Garden & harvest",
    "prompt": "The garden crew set aside prepared beans and snap peas. Use them both and choose a fruit for the lunch box.",
    "stock": {
      "beans": 1,
      "rice": 1,
      "peas": 1,
      "carrot": 1,
      "grapes": 1,
      "banana": 1
    },
    "mustUse": {
      "beans": 1,
      "peas": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "You turned two saved foods into the main and a vegetable side, then chose the missing fruit."
  },
  {
    "id": "garden-gate-crunch",
    "name": "Garden gate crunch",
    "chapter": "Garden & harvest",
    "prompt": "A picnic near the garden gate needs a veggie wrap and two different vegetables. Choose from the fresh shelf.",
    "stock": {
      "wrap": 1,
      "bread": 1,
      "carrot": 1,
      "cucumber": 1,
      "peas": 1,
      "apple": 1
    },
    "mustUse": {
      "wrap": 1
    },
    "produce": {
      "fruit": 0,
      "vegetable": 2
    },
    "differentProduce": true,
    "why": "The wrap is the main, and two different vegetables add variety while meeting the garden plan."
  },
  {
    "id": "berry-picking-break",
    "name": "Berry picking break",
    "chapter": "Garden & harvest",
    "prompt": "A berry-picking crew saved mixed berries and pasta salad. Use both, then add a vegetable for a three-part picnic.",
    "stock": {
      "pasta": 1,
      "rice": 1,
      "berries": 1,
      "grapes": 1,
      "carrot": 1,
      "peas": 1
    },
    "mustUse": {
      "pasta": 1,
      "berries": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "The saved pasta and berries anchor the meal, and a vegetable adds the remaining produce portion."
  },
  {
    "id": "sunflower-share",
    "name": "Sunflower share",
    "chapter": "Garden & harvest",
    "prompt": "Two carrot-stick portions are already packed for the sunflower garden picnic. Rescue both and choose one main.",
    "stock": {
      "bread": 1,
      "wrap": 1,
      "rice": 1,
      "carrot": 2,
      "cucumber": 1
    },
    "mustUse": {
      "carrot": 2
    },
    "produce": {
      "fruit": 0,
      "vegetable": 2
    },
    "why": "Both carrot portions are put to use, and one main makes the box complete without opening extras."
  },
  {
    "id": "harvest-rainbow",
    "name": "Harvest rainbow",
    "chapter": "Garden & harvest",
    "prompt": "The harvest team needs a rice cup, a bright orange, and a green cucumber. Find those exact three foods on the shelf.",
    "stock": {
      "rice": 1,
      "pasta": 1,
      "beans": 1,
      "orange": 1,
      "apple": 1,
      "cucumber": 1,
      "peas": 1
    },
    "mustUse": {
      "rice": 1,
      "orange": 1,
      "cucumber": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "You matched the specific rice, orange, and cucumber request and left the other foods on the shelf."
  },
  {
    "id": "library-story-picnic",
    "name": "Library story picnic",
    "chapter": "Community helpers",
    "prompt": "The book club saved a veggie wrap and grape bunch. Use both, then choose a vegetable before story time.",
    "stock": {
      "wrap": 1,
      "bread": 1,
      "grapes": 1,
      "apple": 1,
      "carrot": 1,
      "cucumber": 1
    },
    "mustUse": {
      "wrap": 1,
      "grapes": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "The wrap and grapes were already available, and one vegetable completed the story-time snack."
  },
  {
    "id": "music-park-box",
    "name": "Music park box",
    "chapter": "Community helpers",
    "prompt": "For the music-in-the-park gathering, start with the rice cup and pack two different fruits for the performers.",
    "stock": {
      "rice": 1,
      "pasta": 1,
      "banana": 1,
      "orange": 1,
      "berries": 1,
      "carrot": 1
    },
    "mustUse": {
      "rice": 1
    },
    "produce": {
      "fruit": 2,
      "vegetable": 0
    },
    "differentProduce": true,
    "why": "The rice cup forms the main, while two different fruits complete the concert picnic plan."
  },
  {
    "id": "cleanup-crew-crunch",
    "name": "Cleanup crew crunch",
    "chapter": "Community helpers",
    "prompt": "After tidying the playground, helpers will eat prepared beans and two different vegetables. Pack their requested meal.",
    "stock": {
      "beans": 1,
      "bread": 1,
      "carrot": 1,
      "cucumber": 1,
      "peas": 1,
      "orange": 1
    },
    "mustUse": {
      "beans": 1
    },
    "produce": {
      "fruit": 0,
      "vegetable": 2
    },
    "differentProduce": true,
    "why": "Prepared beans provide the main, and two different vegetables finish the crew's crunchy box."
  },
  {
    "id": "team-game-lunch",
    "name": "Team game lunch",
    "chapter": "Community helpers",
    "prompt": "The neighborhood game team saved banana slices and a bread sandwich. Use both and find a crunchy vegetable.",
    "stock": {
      "bread": 1,
      "wrap": 1,
      "banana": 1,
      "apple": 1,
      "carrot": 1,
      "peas": 1
    },
    "mustUse": {
      "bread": 1,
      "banana": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "The saved sandwich and banana are included, and a vegetable gives the team a balanced pretend box."
  },
  {
    "id": "garden-volunteer-lunch",
    "name": "Garden volunteer lunch",
    "chapter": "Community helpers",
    "prompt": "A community planting group kept pasta salad and orange wedges. Put those leftovers first, then include one vegetable.",
    "stock": {
      "pasta": 1,
      "beans": 1,
      "orange": 1,
      "grapes": 1,
      "cucumber": 1,
      "peas": 1
    },
    "mustUse": {
      "pasta": 1,
      "orange": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "You rescued the pasta and orange before adding a vegetable to finish the group request."
  },
  {
    "id": "welcome-table",
    "name": "Welcome table box",
    "chapter": "Community helpers",
    "prompt": "A newcomer is joining the picnic and prefers a fruit-and-vegetable mix. Use the leftover apple and add a main plus one vegetable.",
    "stock": {
      "wrap": 1,
      "bread": 1,
      "beans": 1,
      "apple": 1,
      "banana": 1,
      "carrot": 1,
      "cucumber": 1
    },
    "mustUse": {
      "apple": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "differentProduce": true,
    "why": "The apple was not wasted, and the main and vegetable finish a welcoming three-part meal."
  },
  {
    "id": "stargazer-snack",
    "name": "Stargazer snack",
    "chapter": "Outdoor adventures",
    "prompt": "The evening stargazers saved a rice cup. Add two different fruits to the box before heading outside.",
    "stock": {
      "rice": 1,
      "pasta": 1,
      "apple": 1,
      "banana": 1,
      "orange": 1,
      "cucumber": 1
    },
    "mustUse": {
      "rice": 1
    },
    "produce": {
      "fruit": 2,
      "vegetable": 0
    },
    "differentProduce": true,
    "why": "A rice main and two different fruits make the requested snack without packing unnecessary food."
  },
  {
    "id": "riverbank-rest",
    "name": "Riverbank rest",
    "chapter": "Outdoor adventures",
    "prompt": "The riverside explorers already have a veggie wrap and cucumber rounds. Pack those and a second kind of vegetable.",
    "stock": {
      "wrap": 1,
      "bread": 1,
      "carrot": 1,
      "cucumber": 1,
      "peas": 1,
      "banana": 1
    },
    "mustUse": {
      "wrap": 1,
      "cucumber": 1
    },
    "produce": {
      "fruit": 0,
      "vegetable": 2
    },
    "differentProduce": true,
    "why": "You used the riverbank leftovers and selected a second vegetable rather than repeating cucumber."
  },
  {
    "id": "forest-berry-trail",
    "name": "Forest berry trail",
    "chapter": "Outdoor adventures",
    "prompt": "The forest walkers saved prepared beans and berries. Add a different fruit to make a two-fruit hiking box.",
    "stock": {
      "beans": 1,
      "rice": 1,
      "berries": 1,
      "apple": 1,
      "orange": 1,
      "carrot": 1
    },
    "mustUse": {
      "beans": 1,
      "berries": 1
    },
    "produce": {
      "fruit": 2,
      "vegetable": 0
    },
    "differentProduce": true,
    "why": "The beans and berries came from the shelf first, then another fruit completed the trail request."
  },
  {
    "id": "bike-path-picnic",
    "name": "Bike path picnic",
    "chapter": "Outdoor adventures",
    "prompt": "A bicycle team has marked a bread sandwich, apple pieces, and carrot sticks for its three-part rest stop.",
    "stock": {
      "bread": 1,
      "wrap": 1,
      "apple": 1,
      "grapes": 1,
      "carrot": 1,
      "cucumber": 1
    },
    "mustUse": {
      "bread": 1,
      "apple": 1,
      "carrot": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "All three foods requested by the bike team fit into the box without packing anything extra."
  },
  {
    "id": "pinewoods-crunch",
    "name": "Pinewoods crunch",
    "chapter": "Outdoor adventures",
    "prompt": "The pinewoods explorers saved pasta salad and snap peas. Choose a second different vegetable to finish their meal.",
    "stock": {
      "pasta": 1,
      "bread": 1,
      "carrot": 1,
      "cucumber": 1,
      "peas": 1,
      "banana": 1
    },
    "mustUse": {
      "pasta": 1,
      "peas": 1
    },
    "produce": {
      "fruit": 0,
      "vegetable": 2
    },
    "differentProduce": true,
    "why": "The pasta and peas are rescued, and a different vegetable completes the forest picnic."
  },
  {
    "id": "cloudy-day-lunch",
    "name": "Cloudy day lunch",
    "chapter": "Outdoor adventures",
    "prompt": "A cloudy-day walk calls for prepared beans, orange wedges, and a different vegetable. Use the saved orange first.",
    "stock": {
      "beans": 1,
      "rice": 1,
      "orange": 1,
      "apple": 1,
      "carrot": 1,
      "cucumber": 1
    },
    "mustUse": {
      "orange": 1,
      "beans": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "The bean main and saved orange are included, and one vegetable rounds out the walk's food plan."
  },
  {
    "id": "last-banana-pair",
    "name": "Last banana pair",
    "chapter": "Rescue leftovers",
    "prompt": "Two portions of banana slices are marked to be used today. Choose a main and rescue both fruit portions.",
    "stock": {
      "rice": 1,
      "bread": 1,
      "beans": 1,
      "banana": 2,
      "apple": 1,
      "carrot": 1
    },
    "mustUse": {
      "banana": 2
    },
    "produce": {
      "fruit": 2,
      "vegetable": 0
    },
    "why": "Both banana portions were rescued, and the chosen main completes the two-fruit picnic request."
  },
  {
    "id": "snap-pea-pair",
    "name": "Snap pea pair",
    "chapter": "Rescue leftovers",
    "prompt": "Two snap-pea portions are left from lunch preparation. Use both with a bread sandwich to avoid opening new sides.",
    "stock": {
      "bread": 1,
      "wrap": 1,
      "rice": 1,
      "peas": 2,
      "carrot": 1
    },
    "mustUse": {
      "bread": 1,
      "peas": 2
    },
    "produce": {
      "fruit": 0,
      "vegetable": 2
    },
    "why": "The two snap-pea portions and the bread sandwich fill all three spots with no extra food."
  },
  {
    "id": "cucumber-double-save",
    "name": "Cucumber double save",
    "chapter": "Rescue leftovers",
    "prompt": "The shelf holds two leftover cucumber portions. Put both into a veggie-wrap box and leave unopened produce alone.",
    "stock": {
      "wrap": 1,
      "bread": 1,
      "beans": 1,
      "cucumber": 2,
      "apple": 1
    },
    "mustUse": {
      "wrap": 1,
      "cucumber": 2
    },
    "produce": {
      "fruit": 0,
      "vegetable": 2
    },
    "why": "Both cucumber portions find a home with the wrap, keeping the picnic simple and reducing waste."
  },
  {
    "id": "orange-pair-rescue",
    "name": "Orange pair rescue",
    "chapter": "Rescue leftovers",
    "prompt": "A picnic organizer has two leftover orange portions and one pasta salad. Use those exact foods for the fruit box.",
    "stock": {
      "pasta": 1,
      "rice": 1,
      "wrap": 1,
      "orange": 2,
      "grapes": 1
    },
    "mustUse": {
      "pasta": 1,
      "orange": 2
    },
    "produce": {
      "fruit": 2,
      "vegetable": 0
    },
    "why": "The two orange portions and saved pasta are all used together, with no need for more ingredients."
  },
  {
    "id": "three-saved-bites",
    "name": "Three saved bites",
    "chapter": "Rescue leftovers",
    "prompt": "The cooler has saved rice, carrot sticks, and mixed berries. Pack those three marked portions before choosing anything new.",
    "stock": {
      "rice": 1,
      "beans": 1,
      "carrot": 1,
      "cucumber": 1,
      "berries": 1,
      "grapes": 1
    },
    "mustUse": {
      "rice": 1,
      "carrot": 1,
      "berries": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "All three saved portions meet the request, demonstrating how checking leftovers helps reduce waste."
  },
  {
    "id": "rainy-day-rescue",
    "name": "Rainy day rescue",
    "chapter": "Rescue leftovers",
    "prompt": "After a rainy picnic, pasta salad, a banana, and snap peas were left over. Pack the marked foods into a new pretend lunch.",
    "stock": {
      "pasta": 1,
      "wrap": 1,
      "banana": 1,
      "apple": 1,
      "peas": 1,
      "cucumber": 1
    },
    "mustUse": {
      "pasta": 1,
      "banana": 1,
      "peas": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "You packed the three marked foods first, saving the pasta, banana, and peas for another meal."
  },
  {
    "id": "purple-fruit-plan",
    "name": "Purple fruit plan",
    "chapter": "Colors & variety",
    "prompt": "Create a purple-fruit pretend box using the leftover grape bunch and mixed berries, then choose one main.",
    "stock": {
      "bread": 1,
      "beans": 1,
      "pasta": 1,
      "grapes": 1,
      "berries": 1,
      "carrot": 1
    },
    "mustUse": {
      "grapes": 1,
      "berries": 1
    },
    "produce": {
      "fruit": 2,
      "vegetable": 0
    },
    "differentProduce": true,
    "why": "The grapes and berries are different fruits, so the box includes variety with a single main."
  },
  {
    "id": "green-garden-plan",
    "name": "Green garden plan",
    "chapter": "Colors & variety",
    "prompt": "The green garden team saved cucumber and snap peas. Choose one main and use both vegetables for its themed picnic.",
    "stock": {
      "beans": 1,
      "rice": 1,
      "wrap": 1,
      "cucumber": 1,
      "peas": 1,
      "apple": 1
    },
    "mustUse": {
      "cucumber": 1,
      "peas": 1
    },
    "produce": {
      "fruit": 0,
      "vegetable": 2
    },
    "differentProduce": true,
    "why": "Two different green vegetables and a main match the color-themed picnic request."
  },
  {
    "id": "sunny-fruit-pair",
    "name": "Sunny fruit pair",
    "chapter": "Colors & variety",
    "prompt": "Pack a bright fruit picnic with leftover banana slices and orange wedges plus one veggie wrap.",
    "stock": {
      "wrap": 1,
      "rice": 1,
      "bread": 1,
      "banana": 1,
      "orange": 1,
      "peas": 1
    },
    "mustUse": {
      "banana": 1,
      "orange": 1,
      "wrap": 1
    },
    "produce": {
      "fruit": 2,
      "vegetable": 0
    },
    "differentProduce": true,
    "why": "The orange and banana offer two different fruits, while the wrap supplies the main."
  },
  {
    "id": "crunchy-colors",
    "name": "Crunchy colors",
    "chapter": "Colors & variety",
    "prompt": "For a crunchy rainbow lunch, pack a bread sandwich, carrot sticks, and grape bunch from the marked shelf.",
    "stock": {
      "bread": 1,
      "pasta": 1,
      "carrot": 1,
      "cucumber": 1,
      "grapes": 1,
      "apple": 1
    },
    "mustUse": {
      "bread": 1,
      "carrot": 1,
      "grapes": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "The sandwich, carrot, and grapes make the specific three-color picnic the challenge requested."
  },
  {
    "id": "veggie-rainbow",
    "name": "Veggie rainbow",
    "chapter": "Colors & variety",
    "prompt": "A rainbow-themed picnic needs pasta salad and two different vegetables. Use the saved carrot sticks to start.",
    "stock": {
      "pasta": 1,
      "rice": 1,
      "carrot": 1,
      "cucumber": 1,
      "peas": 1,
      "apple": 1
    },
    "mustUse": {
      "pasta": 1,
      "carrot": 1
    },
    "produce": {
      "fruit": 0,
      "vegetable": 2
    },
    "differentProduce": true,
    "why": "The carrot is used first, and a second vegetable completes the colorful no-waste plan."
  },
  {
    "id": "autumn-trail-box",
    "name": "Autumn trail box",
    "chapter": "Colors & variety",
    "prompt": "The autumn trail team saved a rice cup, apple pieces, and snap peas. Pack these three foods without substitutions.",
    "stock": {
      "rice": 1,
      "bread": 1,
      "beans": 1,
      "apple": 1,
      "orange": 1,
      "peas": 1,
      "carrot": 1
    },
    "mustUse": {
      "rice": 1,
      "apple": 1,
      "peas": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "You matched the marked autumn snack request exactly, with one main and two produce sides."
  },
  {
    "id": "birthday-fruit-parade",
    "name": "Birthday fruit parade",
    "chapter": "Celebrations & sharing",
    "prompt": "At the birthday picnic, use the leftover bread sandwich and choose two different fruits from the table.",
    "stock": {
      "bread": 1,
      "rice": 1,
      "banana": 1,
      "berries": 1,
      "orange": 1,
      "carrot": 1
    },
    "mustUse": {
      "bread": 1
    },
    "produce": {
      "fruit": 2,
      "vegetable": 0
    },
    "differentProduce": true,
    "why": "The bread sandwich is included and two different fruits make the requested birthday snack."
  },
  {
    "id": "team-celebration",
    "name": "Team celebration",
    "chapter": "Celebrations & sharing",
    "prompt": "The team celebration needs saved pasta salad and two different vegetables. Plan a box that includes both crunchy sides.",
    "stock": {
      "pasta": 1,
      "wrap": 1,
      "carrot": 1,
      "cucumber": 1,
      "peas": 1,
      "banana": 1
    },
    "mustUse": {
      "pasta": 1
    },
    "produce": {
      "fruit": 0,
      "vegetable": 2
    },
    "differentProduce": true,
    "why": "The pasta forms the main while two different vegetables meet the team celebration request."
  },
  {
    "id": "kite-festival-lunch",
    "name": "Kite festival lunch",
    "chapter": "Celebrations & sharing",
    "prompt": "Before flying kites, the group saved a veggie wrap, orange wedges, and cucumber rounds. Pack all three.",
    "stock": {
      "wrap": 1,
      "bread": 1,
      "orange": 1,
      "banana": 1,
      "cucumber": 1,
      "peas": 1
    },
    "mustUse": {
      "wrap": 1,
      "orange": 1,
      "cucumber": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "All three marked ingredients are ready for the kite festival without extra supplies."
  },
  {
    "id": "train-window-snack",
    "name": "Train window snack",
    "chapter": "Celebrations & sharing",
    "prompt": "The train trip snack has prepared beans and a saved grape bunch. Add one different fruit for the travel box.",
    "stock": {
      "beans": 1,
      "rice": 1,
      "grapes": 1,
      "berries": 1,
      "banana": 1,
      "cucumber": 1
    },
    "mustUse": {
      "beans": 1,
      "grapes": 1
    },
    "produce": {
      "fruit": 2,
      "vegetable": 0
    },
    "differentProduce": true,
    "why": "The beans and saved grapes were packed first, followed by a different fruit as requested."
  },
  {
    "id": "rainbow-farewell",
    "name": "Rainbow farewell",
    "chapter": "Celebrations & sharing",
    "prompt": "The final playground gathering needs rice, mixed berries, and cucumber rounds, all marked as leftovers.",
    "stock": {
      "rice": 1,
      "pasta": 1,
      "berries": 1,
      "apple": 1,
      "cucumber": 1,
      "carrot": 1
    },
    "mustUse": {
      "rice": 1,
      "berries": 1,
      "cucumber": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "The group used exactly the three marked foods and left the other shelf items for later."
  },
  {
    "id": "community-finale-box",
    "name": "Community finale box",
    "chapter": "Celebrations & sharing",
    "prompt": "For the big community picnic, three foods are marked: bread, apple pieces, and snap peas. Use them all.",
    "stock": {
      "bread": 1,
      "beans": 1,
      "rice": 1,
      "apple": 1,
      "orange": 1,
      "peas": 1,
      "carrot": 1
    },
    "mustUse": {
      "bread": 1,
      "apple": 1,
      "peas": 1
    },
    "produce": {
      "fruit": 1,
      "vegetable": 1
    },
    "why": "The community picnic used its marked bread, apple, and peas, saving extra food for another day."
  }
];
