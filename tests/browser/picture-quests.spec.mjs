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
