import {test,expect} from '@playwright/test';

test('Real World hub: three rich art portals link to playable worlds, preserving forty-game access',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.locator('#worldPortalGrid .world-portal')).toHaveCount(3);
 await expect(page.locator('#gameGrid .game-card')).toHaveCount(40);
 await expect(page.locator('#playableCount')).toHaveText('40');
 const destinations=await page.locator('#worldPortalGrid .world-portal').evaluateAll(cards=>
  cards.map(card=>({href:card.getAttribute('href'),
    label:card.getAttribute('aria-label'),
    art:card.querySelector('.world-portal-visual')?.getAttribute('style'),
    css:getComputedStyle(card.querySelector('.world-portal-visual'),'::before').backgroundImage})));
 expect(destinations.map(x=>x.href)).toEqual([
   'games/repair-cafe/index.html',
   'games/garden-guardians/index.html',
   'games/robot-rover/index.html'
 ]);
 expect(destinations.every(x=>x.label?.includes('Explore ')&&x.art?.includes('--art-x:')&&x.css.includes('.webp'))).toBe(true);
 await page.locator('#search').fill('spider');
 await expect(page.locator('#gameGrid .game-card')).toHaveCount(1);
 await expect(page.locator('#worldPortalGrid .world-portal')).toHaveCount(3);
 await page.locator('#search').fill('');
 await expect(page.locator('#gameGrid .game-card')).toHaveCount(40);
 expect(errors).toEqual([]);
});

test('Real World hub: art stays legible on phones, dark and high contrast',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page.locator('#worldPortalGrid .world-portal')).toHaveCount(3);
 for(const card of await page.locator('#worldPortalGrid .world-portal').all())await expect(card).toBeVisible();
 await page.evaluate(()=>window.LarriVerseArcade.setSettings({theme:'dark',highContrast:true,reducedMotion:true}));
 await expect(page.locator('html')).toHaveClass(/larriverse-dark/);
 const result=await page.evaluate(()=>{
  const portal=document.querySelector('.world-portal');
  const text=portal.querySelector('.world-portal-content');
  const art=portal.querySelector('.world-portal-visual');
  return {scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,
   cardWidth:portal.getBoundingClientRect().width,
   textDisplay:getComputedStyle(text).display,
   textColor:getComputedStyle(text).color,
   artBackground:getComputedStyle(art,'::before').backgroundImage};
 });
 expect(result.scroll).toBeLessThanOrEqual(result.client+4);
 expect(result.cardWidth).toBeGreaterThan(250);
 expect(result.textDisplay).not.toBe('none');
 expect(result.textColor).toBe('rgb(255, 255, 255)');
 expect(result.artBackground).toContain('.webp');
 expect(errors).toEqual([]);
});

test('Real World hub: every portal remains keyboard-accessible and reaches its game',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.world-art-note')).toContainText('imaginative previews');
 const links=await page.locator('#worldPortalGrid .world-portal').evaluateAll(nodes=>nodes.map(a=>a.href));
 for(const href of links){
  const response=await page.request.get(href);
  expect(response.ok()).toBe(true);
 }
 await page.locator('#worldPortalGrid .world-portal').first().focus();
 await expect(page.locator('#worldPortalGrid .world-portal').first()).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/\/games\/repair-cafe\/index\.html/);
});

test('Real World hub: 200% text fits a 320px screen and keeps restore/erase controls separate',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.goto('/');
 await page.evaluate(()=>{
   window.LarriVerseArcade.setSettings({reducedMotion:true,highContrast:true,largeText:true});
   document.documentElement.style.setProperty('font-size','32px','important');
 });
 const layout=await page.evaluate(()=>({
   scroll:document.documentElement.scrollWidth,
   width:document.documentElement.clientWidth,
   overflowing:[...document.querySelectorAll('.world-portals,.world-portals-heading,.world-portal-grid,.world-portal,.world-portal-content,.world-portal-action')].
     filter(e=>e.getBoundingClientRect().right>document.documentElement.clientWidth+4).
     map(e=>e.className)
 }));
 expect(layout.scroll,'Art portals must not widen a 320px page: '+JSON.stringify(layout)).toBeLessThanOrEqual(layout.width+4);
 expect(layout.overflowing).toEqual([]);
 await page.locator('.nav [data-open-control]').click();
 await expect(page.locator('#controlCenter')).toBeVisible();
 const controlLayout=await page.evaluate(()=>{
  const nodes=['#exportSaves','.data-actions .import-label','#clearSaves'].map(s=>document.querySelector(s).getBoundingClientRect());
  return {width:document.documentElement.clientWidth,
    dimensions:nodes.map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom})),
    nonOverlapping:nodes.every((r,i)=>i===0||r.top>=nodes[i-1].bottom-1),
    inside:nodes.every(r=>r.width>0&&r.width<=document.querySelector('.control-center').clientWidth)};
 });
 expect(controlLayout.nonOverlapping,'Backup actions must not overlap: '+JSON.stringify(controlLayout)).toBe(true);
 expect(controlLayout.inside).toBe(true);
 page.once('dialog',dialog=>dialog.dismiss());
 await page.locator('#clearSaves').click();
 await expect(page.locator('#controlCenter')).toBeVisible();
});
