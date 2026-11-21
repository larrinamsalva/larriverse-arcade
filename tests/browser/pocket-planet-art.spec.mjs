import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

async function choose(page,index) {
  await page.locator('[data-supply="'+index+'"]').focus();
  await page.keyboard.press('Enter');
}
async function make(page,index) {
  await page.locator('[data-make-step="'+index+'"]').focus();
  await page.keyboard.press('Enter');
}
function folder(testInfo) {
  const target=path.join('artifacts','screenshots',testInfo.project.name);
  fs.mkdirSync(target,{recursive:true});return target;
}
async function hasMotionFrames(picture, name) {
  return picture.evaluate((node, name) => {
    const animation = node.getAnimations().find(animation => animation.animationName === name);
    if (!animation || getComputedStyle(node).animationPlayState !== 'running') return false;
    const duration = animation.effect.getComputedTiming().duration;
    if (!Number.isFinite(duration) || duration <= 0) return false;
    const time = animation.currentTime, state = animation.playState;
    // These reactions last less than a second. Sample their rendered transforms
    // at fixed times even if the runner observes them after they have finished.
    animation.pause();
    try {
      animation.currentTime = duration * .2;
      const before = getComputedStyle(node).transform;
      animation.currentTime = duration * .6;
      return before !== getComputedStyle(node).transform;
    } finally {
      animation.currentTime = time;
      if (state === 'running') animation.play();
      else if (state === 'finished') animation.finish();
    }
  }, name);
}

test('Pocket Planet: matching pictures, keyboard kits and making reactions respect motion preferences',async({page},testInfo)=>{
  test.setTimeout(90_000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/games/pocket-planet/');
  const intro=page.locator('[data-lv-world-motion="pocket-planet"]');
  await expect(intro.locator('.lv-motion-poses')).toHaveAttribute('src',/planet-maker\.webp$/);
  await expect(intro.locator('.lv-motion-prop')).toHaveAttribute('src',/planet-pinwheel\.webp$/);
  await intro.getByRole('button',{name:/Play scene/}).click();
  expect(await intro.evaluate(node=>node.getAnimations({subtree:true}).map(animation=>animation.effect.target.className)))
    .toEqual(expect.arrayContaining(['lv-motion-landscape','lv-motion-poses','lv-motion-prop']));
  await page.locator('.planet-landscape img,.pocket-project-icon img,.pocket-supply-icon img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  const sources=await page.locator('[data-supply] img').evaluateAll(images=>images.map(image=>({name:image.dataset.planetSupply,source:image.src})));
  expect(sources).toHaveLength(6);
  const output=folder(testInfo);
  await intro.screenshot({path:path.join(output,'planet-maker-scene.png')});
  await page.getByRole('button',{name:'Use my supplies',exact:true}).click();
  await expect(page.locator('#feedback')).toContainText('exactly three');
  await choose(page,0);
  await expect(page.locator('[data-supply="0"]')).toBeFocused();
  await expect(page.locator('[data-supply="0"]')).toHaveAttribute('aria-pressed','true');
  expect(await hasMotionFrames(page.locator('.pocket-just-added img'), 'planet-kit-add')).toBe(true);
  await choose(page,0);
  await expect(page.locator('[data-supply="0"]')).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('.pocket-just-added')).toHaveCount(0);
  for(const index of [3,4,5])await choose(page,index);
  await choose(page,0);
  await expect(page.locator('#feedback')).toContainText('holds three');
  await page.getByRole('button',{name:'Use my supplies',exact:true}).click();
  await expect(page.locator('#feedback')).toContainText('do not help');
  for(const index of [3,4,5])await choose(page,index);
  await choose(page,0);
  await page.evaluate(()=>window.LarriVerseArcade.setSettings({reducedMotion:true}));
  await choose(page,1);
  await expect(page.locator('.pocket-just-added img')).toHaveCSS('animation-name','none');
  await expect(page.locator('.pocket-just-added img')).toHaveCSS('opacity','1');
  expect(await hasMotionFrames(page.locator('.pocket-just-added img'), 'planet-kit-add')).toBe(false);
  await expect(intro.getByRole('button',{name:/Play scene/})).toBeHidden();
  await page.evaluate(()=>window.LarriVerseArcade.setSettings({reducedMotion:false}));
  await page.emulateMedia({reducedMotion:'reduce'});
  await choose(page,2);
  await expect(page.locator('.pocket-just-added img')).toHaveCSS('animation-name','none');
  await expect(page.locator('.pocket-just-added img')).toHaveCSS('opacity','1');
  await page.locator('.pocket-supply-grid').screenshot({path:path.join(output,'planet-selected-supplies.png')});
  await page.getByRole('button',{name:'Use my supplies',exact:true}).click();
  const bench=await page.locator('.pocket-workbench img').evaluateAll(images=>images.map(image=>({name:image.dataset.planetSupply,source:image.src})));
  expect(bench).toEqual(sources.slice(0,3));
  await make(page,2);
  await expect(page.locator('#feedback')).toContainText('Try another step');
  await expect(page.locator('.pocket-step-status')).toHaveText('Step 1 of 3');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await make(page,0);
  const reaction = page.locator('.pocket-step-reaction img');
  // Exercise the late-observation case without an arbitrary sleep. This also
  // requires the normal animation to play through before sampling its frames.
  await reaction.evaluate(async node => {
    const animation = node.getAnimations().find(animation => animation.animationName === 'planet-progress');
    if (!animation) throw new Error('The making reaction must have a progress animation');
    await animation.finished;
  });
  expect(await hasMotionFrames(reaction, 'planet-progress')).toBe(true);
  await expect(page.locator('.pocket-step-status')).toHaveText('Step 2 of 3');
  await page.evaluate(()=>window.LarriVerseArcade.setSettings({reducedMotion:true}));
  await make(page,1);
  await expect(page.locator('.pocket-step-reaction img')).toHaveCSS('animation-name','none');
  await make(page,2);
  await expect(page.locator('.pocket-project-complete img')).toHaveAttribute('data-planet-project','seed-tray');
  await expect(page.locator('.pocket-project-complete img')).toHaveCSS('opacity','1');
  await expect(page.getByRole('button',{name:'Next project',exact:true})).toBeEnabled();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('larriverse.mainCampaign.pocket-planet.v1')))).toEqual({next:1,correct:1});
  await page.locator('.pocket-project-complete').screenshot({path:path.join(output,'planet-completed-project.png')});
  expect(errors).toEqual([]);
});

test('Pocket Planet: project labels and workbench fit contrast modes and enlarged text',async({page},testInfo)=>{
  test.setTimeout(60_000);
  await page.goto('/games/pocket-planet/');
  for(const mode of ['light','dark','high-contrast']){
    await page.evaluate(theme=>window.LarriVerseArcade.setSettings({theme:theme==='high-contrast'?'dark':theme,highContrast:theme==='high-contrast',reducedMotion:true}),mode);
    await expect(page.locator('[data-supply="0"]')).toHaveAccessibleName(/Seed packets.*Tap to choose/);
    if(mode==='high-contrast'){
      const colors=await page.locator('.pocket-project-hero').evaluate(node=>({background:getComputedStyle(node).backgroundColor,image:getComputedStyle(node).backgroundImage,text:[...node.querySelectorAll('h2,p')].map(text=>getComputedStyle(text).color)}));
      const rgb=color=>color.match(/[\d.]+/g).map(Number);
      const luminance=color=>rgb(color).slice(0,3).map(channel=>channel/255).map(channel=>channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4).reduce((sum,channel,index)=>sum+channel*[.2126,.7152,.0722][index],0);
      expect(colors.image).toBe('none');expect(rgb(colors.background)[3]??1).toBe(1);
      for(const color of colors.text){const levels=[luminance(color),luminance(colors.background)].sort((a,b)=>b-a);expect((levels[0]+.05)/(levels[1]+.05)).toBeGreaterThanOrEqual(7);}
    }
  }
  await page.setViewportSize({width:320,height:844});
  await page.evaluate(()=>document.documentElement.style.setProperty('font-size','200%','important'));
  const measurements=async selector=>page.evaluate(selector=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,items:[...document.querySelectorAll(selector)].map(node=>{
    const r=node.getBoundingClientRect(),picture=node.querySelector('img').getBoundingClientRect(),name=node.querySelector('b').getBoundingClientRect();
    return {left:r.left,right:r.right,width:r.width,height:r.height,imageBottom:picture.bottom,nameTop:name.top};
  })}),selector);
  const check=values=>{expect(values.scroll).toBeLessThanOrEqual(values.width+4);for(const item of values.items){expect(item.left).toBeGreaterThanOrEqual(0);expect(item.right).toBeLessThanOrEqual(values.width);expect(item.width).toBeGreaterThanOrEqual(44);expect(item.height).toBeGreaterThanOrEqual(44);expect(item.nameTop).toBeGreaterThanOrEqual(item.imageBottom);}};
  check(await measurements('.pocket-supply-card'));
  const output=folder(testInfo);
  await page.locator('.pocket-supply-card').first().screenshot({path:path.join(output,'planet-large-text-supply.png')});
  for(const index of [0,1,2])await choose(page,index);
  await page.getByRole('button',{name:'Use my supplies',exact:true}).click();
  check(await measurements('.pocket-workbench-item'));
  await page.locator('.pocket-workbench').screenshot({path:path.join(output,'planet-large-text-workbench.png')});
  for(const index of [0,1,2])await make(page,index);
  await expect(page.locator('.pocket-project-complete')).toContainText('A tray of seedlings completed!');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(4);
});
