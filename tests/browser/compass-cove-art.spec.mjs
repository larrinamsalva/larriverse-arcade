import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { landmarks, compassClues } from '../../assets/expedition-worlds.js';
import { compassTarget } from '../../assets/expedition-logic.js';

function folder(testInfo) {
  const target=path.join('artifacts','screenshots',testInfo.project.name);
  fs.mkdirSync(target,{recursive:true});
  return target;
}
async function select(page, tile) {
  await page.locator('[data-map="'+tile+'"]').focus();
  await page.keyboard.press('Enter');
}

test('Compass Cove: matching landmarks and treasure reveals keep keyboard recovery and motion preferences', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/games/compass-cove/');
  const intro=page.locator('[data-lv-world-motion="compass-cove"]');
  await expect(intro.locator('.lv-motion-landscape')).toHaveAttribute('src',/cove-welcome\.webp$/);
  await expect(intro.locator('.lv-motion-poses')).toHaveAttribute('src',/cove-explorer\.webp$/);
  await expect(intro.locator('.lv-motion-prop')).toHaveAttribute('src',/cove-compass\.webp$/);
  await intro.getByRole('button',{name:/Play scene/}).click();
  expect(await intro.evaluate(node=>node.getAnimations({subtree:true}).map(animation=>animation.effect.target.className)))
    .toEqual(expect.arrayContaining(['lv-motion-landscape','lv-motion-poses','lv-motion-prop']));
  await page.locator('.cove-landscape img, .cove-object-picture').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  await expect(page.locator('.compass-map-tile')).toHaveCount(36);
  for(const [index,landmark] of landmarks.entries()){
    const tile=page.locator('[data-map="'+landmark.id+'"]');
    await expect(tile).toHaveAccessibleName(new RegExp(landmark.name));
    const gridPicture=await tile.locator('.cove-map-art img').getAttribute('src');
    expect(gridPicture).toBe(await page.locator('.compass-map-legend > span').nth(index).locator('img').getAttribute('src'));
  }
  await expect(page.locator('.compass-rose')).toContainText('N ↑');
  await expect(page.locator('.compass-rose')).toContainText('W ← ✦ → E');
  await expect(page.locator('.compass-rose')).toContainText('S ↓');
  const output=folder(testInfo);
  await intro.screenshot({path:path.join(output,'cove-explorer-scene.png')});
  await select(page,0);
  await expect(page.locator('#feedback')).toContainText('nothing was lost');
  await expect(page.locator('[data-map="0"]')).toHaveAccessibleName(/not the treasure yet/);
  await page.getByRole('button',{name:'Clear my try',exact:true}).click();
  await expect(page.locator('.wrong-pick')).toHaveCount(0);
  await expect(page.locator('#stageLabel')).toContainText('Treasure 1 of 60');

  const first=compassTarget(landmarks[compassClues[0].landmark],compassClues[0]);
  await select(page,first);
  const discovered=page.locator('.cove-new-treasure .cove-map-art img');
  await expect(discovered).toHaveAttribute('data-cove-object','treasure');
  const moved=await discovered.evaluate(node=>new Promise(resolve=>{
    const before=getComputedStyle(node).transform;
    requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(before!==getComputedStyle(node).transform)));
  }));
  expect(moved).toBe(true);
  await expect(page.locator('.cove-new-treasure')).toHaveCount(1);
  await expect(page.locator('[data-map="'+first+'"]')).toHaveCSS('opacity','1');
  await expect(page.locator('[data-map="'+first+'"]')).toHaveAccessibleName(/treasure found/);
  await page.evaluate(()=>window.LarriVerseArcade.setSettings({reducedMotion:true}));
  await expect(discovered).toHaveCSS('animation-name','none');
  await expect(discovered).toHaveCSS('opacity','1');
  await expect(page.locator('.cove-landscape > img')).toHaveCSS('animation-name','none');
  await expect(intro.getByRole('button',{name:/Play scene/})).toBeHidden();
  await page.evaluate(()=>window.LarriVerseArcade.setSettings({reducedMotion:false}));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.getByRole('button',{name:'Next challenge',exact:true}).click();
  const second=compassTarget(landmarks[compassClues[1].landmark],compassClues[1]);
  await select(page,second);
  await expect(page.locator('.cove-new-treasure')).toHaveCount(1);
  await expect(page.locator('.cove-new-treasure .cove-map-art img')).toHaveCSS('animation-name','none');
  await expect(page.locator('.cove-new-treasure .cove-map-art img')).toHaveCSS('opacity','1');
  await expect(page.locator('[data-map="'+first+'"]')).toHaveClass(/found/);
  await expect(page.getByRole('button',{name:'Next challenge',exact:true})).toBeEnabled();
  await page.locator('.compass-grid').screenshot({path:path.join(output,'cove-discovered-map.png')});
  expect(errors).toEqual([]);
});

test('Compass Cove: six-column map numbers and direction steps fit contrast modes and enlarged text', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/games/compass-cove/');
  for(const mode of ['larriverse-dark','larriverse-high-contrast']){
    await page.evaluate(className=>{
      document.documentElement.classList.remove('larriverse-dark','larriverse-high-contrast');
      document.documentElement.classList.add(className);
    },mode);
    await expect(page.locator('[data-map="30"]')).toHaveAccessibleName('Row 6, column 1, Lighthouse');
    await expect(page.locator('.compass-route-copy .eyebrow')).toHaveText('Start at the Lighthouse');
    if(mode==='larriverse-high-contrast'){
      const colors=await page.locator('.compass-clue-card').evaluate(node=>({
        background:getComputedStyle(node).backgroundColor,
        image:getComputedStyle(node).backgroundImage,
        text:[...node.querySelectorAll('.eyebrow,h2,.compass-route-copy > p')].map(text=>getComputedStyle(text).color)
      }));
      const rgb=color=>color.match(/[\d.]+/g).map(Number);
      const luminance=color=>rgb(color).slice(0,3).map(channel=>channel/255).map(channel=>channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4).reduce((sum,channel,index)=>sum+channel*[.2126,.7152,.0722][index],0);
      expect(colors.image).toBe('none');
      expect(rgb(colors.background)[3]??1).toBe(1);
      for(const color of colors.text){
        const levels=[luminance(color),luminance(colors.background)].sort((a,b)=>b-a);
        expect((levels[0]+.05)/(levels[1]+.05)).toBeGreaterThanOrEqual(7);
      }
    }
  }
  await page.setViewportSize({width:320,height:844});
  await page.evaluate(()=>document.documentElement.style.setProperty('font-size','200%','important'));
  await select(page,0);
  await expect(page.locator('#feedback')).toHaveClass(/try/);
  const bounds=await page.evaluate(()=>({
    width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
    columns:getComputedStyle(document.querySelector('.compass-grid')).gridTemplateColumns.split(' ').length,
    tiles:[...document.querySelectorAll('.compass-map-tile')].map(node=>{
      const r=node.getBoundingClientRect(),art=node.querySelector('.cove-map-art').getBoundingClientRect(),number=node.querySelector('small').getBoundingClientRect();
      return {left:r.left,right:r.right,width:r.width,artBottom:art.bottom,numberTop:number.top};
    }),
    steps:[...document.querySelectorAll('.compass-direction-list li')].map(node=>{
      const r=node.getBoundingClientRect(),text=node.querySelector('div').getBoundingClientRect();
      return {left:r.left,right:r.right,textRight:text.right};
    })
  }));
  expect(bounds.scroll).toBeLessThanOrEqual(bounds.width+4);
  expect(bounds.columns).toBe(6);
  for(const tile of bounds.tiles){
    expect(tile.left).toBeGreaterThanOrEqual(0);
    expect(tile.right).toBeLessThanOrEqual(bounds.width);
    expect(tile.width).toBeGreaterThanOrEqual(24);
    expect(tile.numberTop).toBeGreaterThanOrEqual(tile.artBottom);
  }
  for(const step of bounds.steps){
    expect(step.left).toBeGreaterThanOrEqual(0);
    expect(step.right).toBeLessThanOrEqual(bounds.width);
    expect(step.textRight).toBeLessThanOrEqual(step.right);
  }
  const output=folder(testInfo);
  await page.locator('.compass-grid').screenshot({path:path.join(output,'cove-large-text-map.png')});
  await page.locator('.compass-clue-card').screenshot({path:path.join(output,'cove-large-text-directions.png')});
});
