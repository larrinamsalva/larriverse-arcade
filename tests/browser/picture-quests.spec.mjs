import {test,expect} from '@playwright/test';

for(const slug of ['spider-scout','helping-hands']){
 const answerPicture=slug==='helping-hands'?'.picture-answer img':'.picture-answer svg';
 const sceneImage=slug==='helping-hands'?'#sceneArt img':'#sceneArt svg';
 test(slug+': 80 selectable picture missions and eight open chapters',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/games/'+slug+'/index.html');
  await expect(page.locator('#chapters button')).toHaveCount(8);
  await expect(page.locator('#levelSelect option')).toHaveCount(80);
  await expect(page.locator('.picture-answer')).toHaveCount(3);
  await expect(page.locator(answerPicture)).toHaveCount(3);
  await expect(page.locator(sceneImage)).toHaveCount(1);
  for(let i=0;i<8;i++){
   await page.locator('#chapters [data-chapter="'+i+'"]').click();
   await expect(page.locator('#caseCount')).toHaveText('Mission '+(i*10+1)+' / 80');
   await expect(page.locator('#chapters [data-chapter="'+i+'"]')).toHaveAttribute('aria-pressed','true');
  }
  await page.locator('#levelSelect').selectOption('79');
  await expect(page.locator('#caseCount')).toHaveText('Mission 80 / 80');
  await page.locator('#next').click();
  await expect(page.locator('#caseCount')).toHaveText('Mission 1 / 80');
  await expect(page.locator('#solvedCount')).toHaveText('0');
  expect(errors).toEqual([]);
 });

 test(slug+': safe picture feedback, earned-once saves and saved navigation',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/games/'+slug+'/index.html');
  const data=await page.evaluate(async slug=>{
   const module=await import('/games/'+slug+'/questions.js');
   return slug==='spider-scout'?module.SPIDER_MISSIONS[0]:module.HELP_MISSIONS[0];
  },slug);
  await page.locator('[data-answer="'+((data.answer+1)%3)+'"]').click();
  await expect(page.locator('#feedback')).toContainText('Good try');
  await page.locator('[data-answer="'+data.answer+'"]').click();
  await expect(page.locator('#feedback')).toContainText('new discovery');
  await expect(page.locator('#solvedCount')).toHaveText('1');
  const key='larriverse.'+slug+'.v1';
  let saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  expect(saved.solved).toEqual([1]);
  await page.locator('[data-answer="'+data.answer+'"]').click();
  saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  expect(saved.solved).toEqual([1]);
  await page.locator('[data-chapter="3"]').click();
  await expect(page.locator('#caseCount')).toHaveText('Mission 31 / 80');
  await page.reload();
  await expect(page.locator('#caseCount')).toHaveText('Mission 31 / 80');
  await expect(page.locator('#solvedCount')).toHaveText('1');
  expect(errors).toEqual([]);
 });

 test(slug+': readable mobile illustrated choices and dark mode',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/games/'+slug+'/index.html');
  await page.evaluate(()=>window.LarriVerseArcade.setSettings({theme:'dark',highContrast:true,reducedMotion:true}));
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('html')).toHaveClass(/larriverse-dark/);
  await expect(page.locator('#question')).toBeVisible();
  await expect(page.locator('.picture-answer')).toHaveCount(3);
  await expect(page.locator(answerPicture)).toHaveCount(3);
  const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(dims.scroll).toBeLessThanOrEqual(dims.client+4);
  await page.locator('#hint').click();
  await expect(page.locator('#teaching')).not.toHaveText('Choose a picture to learn why it helps.');
  expect(errors).toEqual([]);
 });
}

test('Helping Hands: nosebleed picture teaches lean forward and soft-nose pressure',async({page})=>{
 await page.goto('/games/helping-hands/index.html');
 await expect(page.locator('#caseTitle')).toHaveText('A nosebleed after recess');
 const data=await page.evaluate(async()=> (await import('/games/helping-hands/questions.js')).HELP_MISSIONS[0]);
 expect(data.options[data.answer].text).toContain('pinch the soft nose');
 await page.locator('[data-answer="'+data.answer+'"]').click();
 await expect(page.locator('#teaching')).toContainText('10–15 minutes');
 await expect(page.locator('#solvedCount')).toHaveText('1');
});

test('Spider Scout: medically significant spiders are presented with never-touch warnings',async({page})=>{
 await page.goto('/games/spider-scout/index.html');
 await page.locator('#levelSelect').selectOption('66');
 await expect(page.locator('#caseTitle')).toContainText('Black widow');
 const data=await page.evaluate(async()=> (await import('/games/spider-scout/questions.js')).SPIDER_MISSIONS[66]);
 expect(data.options[data.answer].text).toContain('left alone');
 await page.locator('[data-answer="'+data.answer+'"]').click();
 await expect(page.locator('#teaching')).toContainText('medical care');
 await page.locator('#levelSelect').selectOption('67');
 await expect(page.locator('#caseTitle')).toContainText('Brown recluse');
});

test('Spider Scout: ten field-guide spiders show articulated legs and natural habitats',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/games/spider-scout/index.html');
 const drawings=await page.evaluate(async()=>{
  const {FIELD_GUIDE_SPECIES,spiderPicture}=await import('/assets/spider-field-guide-art.js');
  return FIELD_GUIDE_SPECIES.map(kind=>{
   const svg=spiderPicture(kind);
   const parsed=new DOMParser().parseFromString(svg,'image/svg+xml');
   const root=parsed.documentElement;
   return {kind,species:root.getAttribute('data-species'),
     errors:parsed.querySelectorAll('parsererror').length,
     legs:parsed.querySelectorAll('[data-leg]').length,
     head:parsed.querySelector('[data-anatomy="cephalothorax-abdomen"]')!==null,
     habitat:root.querySelector('[data-habitat]')?.getAttribute('data-habitat'),
     gradients:root.querySelectorAll('radialGradient').length,
     eyes:root.querySelector('[data-eyes]')?.getAttribute('data-eyes'),
     web:svg.includes('data-habitat="orb"'),bytes:svg.length};
  });
 });
 expect(drawings).toHaveLength(10);
 expect(drawings.every(p=>p.errors===0&&p.legs===8&&p.head&&p.habitat&&p.gradients===2&&p.eyes&&p.bytes<55000)).toBe(true);
 expect(new Set(drawings.map(p=>p.habitat)).size).toBeGreaterThanOrEqual(7);
 expect(drawings.find(p=>p.kind==='jumping').eyes).toBe('jumper');
 expect(drawings.find(p=>p.kind==='wolf').eyes).toBe('wolf');
 expect(drawings.find(p=>p.kind==='widow').habitat).toBe('wood');
 await expect(page.locator('#sceneArt svg[data-art-version="field-guide-2"]')).toHaveCount(1);
 await page.locator('#levelSelect').selectOption('6');
 await expect(page.locator('#sceneArt svg[data-species="widow"]')).toHaveCount(1);
 await page.locator('#levelSelect').selectOption('7');
 await expect(page.locator('#sceneArt svg[data-species="recluse"]')).toHaveCount(1);
 expect(errors).toEqual([]);
});

test('Spider Scout: all ten spiders move jointed legs, with planted feet during a walk', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/games/spider-scout/index.html');
  const motion = await page.evaluate(async () => {
    const { createSpiderRig } = await import('/games/spider-scout/spider-motion.js');
    const select = document.getElementById('levelSelect');
    const endOf = (part, atEnd) => {
      const path = part.querySelector('path');
      const point = path.getPointAtLength(atEnd ? path.getTotalLength() : 0);
      return new DOMPoint(point.x, point.y).matrixTransform(path.getCTM());
    };
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const poses = [];
    let plantedFootDrift;
    for (let index = 0; index < 10; index++) {
      select.value = String(index);
      select.dispatchEvent(new Event('change', { bubbles: true }));
      const svg = document.querySelector('#sceneArt svg');
      const rig = createSpiderRig(svg);
      const movements = [];
      let widestJointGap = 0;
      for (const time of [.12, .35, .56, .82]) {
        rig.pose(time);
        movements.push(svg.querySelector('[data-spider-body]').getAttribute('transform'));
        for (const leg of svg.querySelectorAll('[data-leg]')) {
          const upper = leg.querySelector('[data-leg-part="upper"]');
          const lower = leg.querySelector('[data-leg-part="lower"]');
          widestJointGap = Math.max(widestJointGap, distance(endOf(upper, true), endOf(lower, false)));
        }
      }
      if (svg.dataset.species === 'wolf') {
        const foot = svg.querySelector('[data-leg="1"] [data-leg-part="lower"]');
        rig.pose(.18);
        const planted = endOf(foot, true);
        rig.pose(.27);
        plantedFootDrift = distance(planted, endOf(foot, true));
      }
      poses.push({ species: svg.dataset.species, widestJointGap, positions: new Set(movements).size });
      rig.rest();
    }
    return { poses, plantedFootDrift };
  });
  expect(new Set(motion.poses.map(pose => pose.species)).size).toBe(10);
  for (const pose of motion.poses) {
    expect(pose.positions, pose.species).toBeGreaterThan(1);
    expect(pose.widestJointGap, pose.species).toBeLessThan(.15);
  }
  expect(motion.plantedFootDrift).toBeLessThan(.15);
});

test('Spider Scout: a keyboard replay animates the mission picture and honors both motion settings', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/games/spider-scout/index.html');
  const art = page.locator('#sceneArt');
  const watch = page.getByRole('button', { name: 'Watch spider move' });
  const body = art.locator('[data-spider-body]');
  await art.scrollIntoViewIfNeeded();
  await watch.focus();
  await page.keyboard.press('Enter');
  await expect(body).toHaveAttribute('transform', /translate\(-/);
  await expect(page.locator('#choices [data-leg-part][transform]')).toHaveCount(0);
  await expect(page.locator('#solvedCount')).toHaveText('0');

  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: true }));
  await expect(watch).toBeHidden();
  await expect(art.locator('[data-leg-part][transform]')).toHaveCount(0);
  await page.locator('#levelSelect').selectOption('4');
  await expect(art.locator('svg')).toHaveAttribute('data-species', 'crab');
  await expect(art.locator('[data-leg-part][transform]')).toHaveCount(0);

  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: false }));
  await art.scrollIntoViewIfNeeded();
  await watch.click();
  await expect(body).toHaveAttribute('transform', /translate\(/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(watch).toBeHidden();
  await expect(art.locator('[data-leg-part][transform]')).toHaveCount(0);
});

test('Spider Scout: larger phone pictures preserve 80 missions and saved discoveries',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/games/spider-scout/index.html');
 const columns=await page.locator('#choices').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
 expect(columns).toBe(2);
 await expect(page.locator('#levelSelect option')).toHaveCount(80);
 await expect(page.locator('.picture-answer')).toHaveCount(3);
 const answer=await page.evaluate(async()=>(await import('/games/spider-scout/questions.js')).SPIDER_MISSIONS[0].answer);
 await page.locator('[data-answer="'+answer+'"]').click();
 await expect(page.locator('#solvedCount')).toHaveText('1');
 await page.reload();
 await expect(page.locator('#solvedCount')).toHaveText('1');
 const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
 expect(dims.scroll).toBeLessThanOrEqual(dims.client+4);
});

test('Helping Hands: all 80 missions load the right scene and three distinct choice images',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/games/helping-hands/index.html');
 const pictures=await page.evaluate(async()=>{
  const {HELP_MISSIONS}=await import('/games/helping-hands/questions.js');
  const selector=document.querySelector('#levelSelect');
  const scene=document.querySelector('#sceneArt');
  const pictures=[];
  for(const mission of HELP_MISSIONS){
   selector.value=String(mission.id-1);
   selector.dispatchEvent(new Event('change',{bubbles:true}));
   const image=scene.querySelector('img');
   await image.decode();
   const url=new URL(image.src);
   const choices=Array.from(document.querySelectorAll('#choices img'),img=>new URL(img.src).pathname);
   pictures.push({
    path:url.pathname,
    local:url.origin===location.origin,
    size:[image.naturalWidth,image.naturalHeight],
    alt:image.alt,
    label:scene.getAttribute('aria-label'),
    expectedLabel:mission.sceneAlt,
    choices,
    correctPicture:choices[mission.answer]
   });
  }
  return pictures;
 });
 expect(pictures).toHaveLength(80);
 for(const [index,picture] of pictures.entries()){
  expect(picture.path).toBe('/assets/helping-hands-scenes/case-'+(index%20+1)+'.webp');
  expect(picture.local).toBe(true);
  expect(picture.size).toEqual([960,600]);
  expect(picture.alt).toBe('');
  expect(picture.label).toBe(picture.expectedLabel);
  expect(new Set(picture.choices).size,`Mission ${index+1} choice pictures`).toBe(3);
 }
 expect(pictures[12].correctPicture).toBe('/assets/helping-hands-answers/roadsideHelp.webp');
 expect(pictures[16].correctPicture).toBe('/assets/helping-hands-answers/safeExit.webp');
 expect(pictures[38].correctPicture).toBe('/assets/helping-hands-answers/medicine.webp');
 expect(pictures[38].choices).toContain('/assets/helping-hands-answers/randomPill.webp');
 expect(pictures[43].correctPicture).toBe('/assets/helping-hands-scenes/case-4.webp');
 expect(errors).toEqual([]);
});

test('Helping Hands: every answer picture loads and matches its option',async({page})=>{
 await page.goto('/games/helping-hands/index.html');
 const pictures=await page.evaluate(async()=>{
  const {HELPING_ACTION_SCENES,HELPING_ACTION_TYPES}=await import('/assets/helping-hands-realistic-art.js');
  const {renderHelpAnswerPicture}=await import('/assets/helping-hands-answer-art.js');
  return Promise.all(HELPING_ACTION_TYPES.map(async key=>{
   const container=document.createElement('span');
   renderHelpAnswerPicture(container,key);
   const picture=container.querySelector('img');
   await picture.decode();
   return {key,caseNumber:HELPING_ACTION_SCENES[key],path:new URL(picture.src).pathname,local:new URL(picture.src).origin===location.origin,
     width:picture.naturalWidth,height:picture.naturalHeight};
  }));
 });
 expect(pictures.length).toBeGreaterThanOrEqual(24);
 for(const {key,caseNumber,path,local,width,height} of pictures){
  const expectedPath=caseNumber?'/assets/helping-hands-scenes/case-'+caseNumber+'.webp':'/assets/helping-hands-answers/'+key+'.webp';
  expect(path).toBe(expectedPath);
  expect(local).toBe(true);
  expect([width,height]).toEqual(caseNumber?[960,600]:[480,300]);
 }
 await expect(page.locator('#choices img')).toHaveCount(3);
 const nose=page.locator('#choices img[src$="/nose.webp"]');
 await expect(nose).toHaveCount(1);
 await expect(nose).toHaveAttribute('alt','');
 await expect(page.getByRole('button',{name:/pinch the soft nose/})).toBeVisible();
 const waterMission=await page.evaluate(async()=>{
  const {HELP_MISSIONS}=await import('/games/helping-hands/questions.js');
  const index=HELP_MISSIONS.findIndex(m=>m.options[m.answer].text.includes('floating or reaching aid'));
  return {index,answer:HELP_MISSIONS[index].answer};
 });
 await page.locator('#levelSelect').selectOption(String(waterMission.index));
 await expect(page.locator('[data-answer="'+waterMission.answer+'"] img')).toHaveAttribute('src',/\/lifeRing\.webp$/);
});

test('Helping Hands: failed picture requests keep the answer artwork and controls usable',async({page})=>{
 await page.route('**/helping-hands-answers/*.webp',route=>route.abort());
 await page.route('**/helping-hands-scenes/case-4.webp',route=>route.abort());
 await page.goto('/games/helping-hands/index.html');
 await expect(page.locator('#choices svg[data-help-art="anime-3"]')).toHaveCount(3);
 await expect(page.locator('#choices svg[data-key="nose"]')).toHaveCount(1);
 const answer=page.getByRole('button',{name:/pinch the soft nose/});
 await answer.focus();
 await answer.press('Enter');
 await expect(page.locator('#solvedCount')).toHaveText('1');
 await page.locator('#levelSelect').selectOption('43');
 await expect(page.locator('#choices svg')).toHaveCount(3);
 await expect(page.locator('#choices svg[data-key="chokingWarning"] [data-scene-action="choking-hands-at-throat"]')).toHaveCount(1);
 await expect(page.locator('#choices svg[data-key="untiedShoe"]')).toHaveCount(1);
 await expect(page.locator('#choices svg[data-key="tissues"]')).toHaveCount(1);
});

test('Helping Hands: readable larger picture cards on narrow phones, with progress preserved',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/games/helping-hands/index.html');
 const columns=await page.locator('#choices').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
 expect(columns).toBe(2);
 await expect(page.locator('#levelSelect option')).toHaveCount(80);
 await expect(page.locator('#choices img')).toHaveCount(3);
 const answer=await page.evaluate(async()=>{
  const {HELP_MISSIONS}=await import('/games/helping-hands/questions.js');
  return HELP_MISSIONS[0].answer;
 });
 await page.locator('[data-answer="'+answer+'"]').click();
 await expect(page.locator('#solvedCount')).toHaveText('1');
 await page.reload();
 await expect(page.locator('#solvedCount')).toHaveText('1');
 const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
 expect(dims.scroll).toBeLessThanOrEqual(dims.client+4);
});

test('Helping Hands: expressive anime anatomy replaces stick figures across all situations',async({page})=>{
 const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
 await page.goto('/games/helping-hands/index.html');
 const portraits=await page.evaluate(async()=>{
  const {HELPING_SCENE_TITLES,helpScenePicture}=await import('/assets/helping-hands-realistic-art.js');
  return HELPING_SCENE_TITLES.map((title)=>{
   const markup=helpScenePicture({title});
   const doc=new DOMParser().parseFromString(markup,'image/svg+xml');
   return {title,parseErrors:doc.querySelectorAll('parsererror').length,
    version:doc.documentElement.getAttribute('data-help-art'),
    face:doc.querySelectorAll('[data-anime-feature="expressive-face"]').length,
    people:doc.querySelectorAll('[data-anime-character="full-body"]').length,
    specific:doc.querySelectorAll('[data-anime-scene]').length,
    externalImages:doc.querySelectorAll('image,foreignObject,script').length};
  });
 });
 expect(portraits).toHaveLength(20);
 expect(portraits.every(x=>x.parseErrors===0&&x.version==='anime-3'&&
   (x.face>0||x.people>0||x.specific>0)&&x.externalImages===0)).toBe(true);
 expect(portraits.filter(x=>x.people>0).length).toBeGreaterThanOrEqual(10);
 expect(pageErrors).toEqual([]);
});

test('Helping Hands: nosebleed and helper SVG fallbacks stay readable on phone',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/helping-hands-scenes/*.webp',route=>route.abort());
 await page.setViewportSize({width:390,height:844});
 await page.goto('/games/helping-hands/index.html');
 const scene=page.locator('#sceneArt svg');
 await expect(scene).toHaveAttribute('data-help-art','anime-3');
 await expect(scene.locator('[data-anime-scene="nosebleed-forward-lean"]')).toHaveCount(1);
 await expect(scene.locator('[data-anime-anatomy="nose-and-face"]')).toHaveCount(1);
 await expect(scene.locator('[data-first-aid-action="pinch-soft-nose"]')).toHaveCount(1);
 await expect(scene.locator('[data-bleed-cue="small"]')).toHaveCount(1);
 await page.locator('#levelSelect').selectOption('13');
 await expect(scene.locator('[data-anime-character="full-body"]')).toHaveCount(2);
 await expect(scene.locator('[data-anime-feature="expressive-face"]')).toHaveCount(2);
 await page.evaluate(()=>window.LarriVerseArcade.setSettings({theme:'dark',highContrast:true}));
 await expect(page.locator('#sceneArt svg[data-help-art="anime-3"]')).toHaveCount(1);
 const dims=await page.evaluate(()=>({width:document.documentElement.clientWidth,
  scroll:document.documentElement.scrollWidth}));
 expect(dims.scroll).toBeLessThanOrEqual(dims.width+4);
 expect(errors).toEqual([]);
});

test('Helping Hands: failed scene requests show the correct SVG after navigation',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/helping-hands-scenes/case-4.webp',route=>route.abort());
 await page.goto('/games/helping-hands/index.html');
 const previous=await page.locator('#sceneArt img').elementHandle();
 await page.locator('#levelSelect').selectOption('3');
 const root=page.locator('#sceneArt svg');
 await expect(root).toHaveAttribute('data-key','case-4');
 await previous.dispatchEvent('error');
 await expect(root).toHaveAttribute('data-key','case-4');
 await expect(root.locator('[data-scene-action="choking-hands-at-throat"]')).toHaveCount(1);
 await expect(root.locator('[data-body-language="hand-at-throat"]')).toHaveCount(2);
 await expect(root.locator('[data-body-language="choking-symptoms"]')).toHaveCount(1);
 await expect(root.locator('[data-expression="open-mouth"]')).toHaveCount(1);
 await expect(root.locator('[data-face-proportion="rounded-anime"]')).toHaveCount(1);
 const face=await root.locator('[data-face-proportion="rounded-anime"]').evaluate(el=>{
  const b=el.getBBox();return {width:b.width,height:b.height};
 });
 expect(face.width).toBeGreaterThan(55);
 expect(face.height/face.width,'No unnaturally stretched head').toBeLessThan(1.26);
 await page.setViewportSize({width:390,height:844});
 await expect(root.locator('[data-scene-action="choking-hands-at-throat"]')).toHaveCount(1);
 const dims=await page.evaluate(()=>({
  scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth
 }));
 expect(dims.scroll).toBeLessThanOrEqual(dims.client+4);
 expect(errors).toEqual([]);
});
test('Helping Hands: every expressive face uses shorter rounded anime proportions',async({page})=>{
 await page.goto('/games/helping-hands/index.html');
 const ratios=await page.evaluate(async()=>{
  const {animePerson,animeFace}=await import('/assets/helping-hands-anime-characters.js');
  const drawings=[animeFace(100,90),...['calm','sad','distress'].map(expression=>
   animePerson(100,90,.75,{expression,pose:expression==='distress'?'choking':'comfort'}))];
  return drawings.map(svg=>{
   const node=document.createElementNS('http://www.w3.org/2000/svg','svg');
   node.innerHTML=svg;document.body.append(node);
   const part=node.querySelector('[data-face-proportion="rounded-anime"]');
   const box=part?.getBBox();node.remove();
   return {present:!!part,width:box?.width,height:box?.height};
  });
 });
 expect(ratios.every(x=>x.present&&x.width>55&&x.height/x.width<1.26)).toBe(true);
});
