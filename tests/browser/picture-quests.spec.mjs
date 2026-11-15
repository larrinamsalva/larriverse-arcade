import {test,expect} from '@playwright/test';

for(const slug of ['spider-scout','helping-hands']){
 test(slug+': 80 selectable picture missions and eight open chapters',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/games/'+slug+'/index.html');
  await expect(page.locator('#chapters button')).toHaveCount(8);
  await expect(page.locator('#levelSelect option')).toHaveCount(80);
  await expect(page.locator('.picture-answer')).toHaveCount(3);
  await expect(page.locator('.picture-answer svg')).toHaveCount(3);
  await expect(page.locator('#sceneArt svg')).toHaveCount(1);
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
  await page.evaluate(()=>window.LarriVerseArcade.setSettings({darkMode:true,highContrast:true,reducedMotion:true}));
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('#question')).toBeVisible();
  await expect(page.locator('.picture-answer')).toHaveCount(3);
  await expect(page.locator('.picture-answer svg')).toHaveCount(3);
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

test('Helping Hands: all twenty real-world scenes are unique, illustrated and valid SVG',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/games/helping-hands/index.html');
 const pictures=await page.evaluate(async()=>{
  const {helpScenePicture,HELPING_SCENE_TITLES}=await import('/assets/helping-hands-realistic-art.js');
  return HELPING_SCENE_TITLES.map(title=>{
   const svg=helpScenePicture({title});
   const root=new DOMParser().parseFromString(svg,'image/svg+xml');
   return {title,svg,parseErrors:root.querySelectorAll('parsererror').length,
     art:root.documentElement.getAttribute('data-help-art'),
     key:root.documentElement.getAttribute('data-key'),
     shapes:root.querySelectorAll('path,rect,circle,ellipse').length};
  });
 });
 expect(pictures).toHaveLength(20);
 expect(new Set(pictures.map(p=>p.key)).size).toBe(20);
 expect(pictures.every(p=>p.parseErrors===0&&p.art==='anime-3'&&p.shapes>=10)).toBe(true);
 await expect(page.locator('#sceneArt svg[data-kind="scenario"]')).toHaveCount(1);
 await expect(page.locator('#sceneArt svg[data-key="case-1"]')).toHaveCount(1);
 const pic=pictures[0].svg;
 expect(pic).toContain('data-face-part="nose-bridge"');
 expect(pic).toContain('data-first-aid-action="pinch-soft-nose"');
 expect(pic).toContain('data-bleed-cue="small"');
 // The same nosebleed illustration appears in each of four different question chapters.
 await page.locator('#levelSelect').selectOption('20');
 await expect(page.locator('#sceneArt svg[data-key="case-1"]')).toHaveCount(1);
 await page.locator('#levelSelect').selectOption('40');
 await expect(page.locator('#sceneArt svg[data-key="case-1"]')).toHaveCount(1);
 await page.locator('#levelSelect').selectOption('60');
 await expect(page.locator('#sceneArt svg[data-key="case-1"]')).toHaveCount(1);
 expect(errors).toEqual([]);
});

test('Helping Hands: every answer object has its own detailed picture',async({page})=>{
 await page.goto('/games/helping-hands/index.html');
 const results=await page.evaluate(async()=>{
  const {helpActionPicture,HELPING_ACTION_TYPES}=await import('/assets/helping-hands-realistic-art.js');
  return HELPING_ACTION_TYPES.map(key=>{
   const svg=helpActionPicture(key);
   const doc=new DOMParser().parseFromString(svg,'image/svg+xml');
   return {key,valid:doc.querySelectorAll('parsererror').length===0,
     detail:doc.querySelectorAll('path,rect,circle,ellipse').length,
     art:doc.documentElement.getAttribute('data-help-art'),
     scene:doc.documentElement.getAttribute('data-key')};
  });
 });
 expect(results.length).toBeGreaterThanOrEqual(24);
 expect(results.every(x=>x.valid&&x.detail>=3&&x.art==='anime-3'&&x.scene===x.key)).toBe(true);
 await expect(page.locator('#choices svg[data-help-art="anime-3"]')).toHaveCount(3);
 await expect(page.locator('#choices svg[data-key="nose"]')).toHaveCount(1);
 await page.locator('#levelSelect').selectOption('21');
 await expect(page.locator('#sceneArt svg[data-key="case-2"]')).toHaveCount(1);
});

test('Helping Hands: readable larger picture cards on narrow phones, with progress preserved',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/games/helping-hands/index.html');
 const columns=await page.locator('#choices').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
 expect(columns).toBe(2);
 await expect(page.locator('#levelSelect option')).toHaveCount(80);
 await expect(page.locator('#choices svg[data-help-art="anime-3"]')).toHaveCount(3);
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

test('Helping Hands: nosebleed anatomy, full-body helper and worried anime face stay readable on phone',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
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
