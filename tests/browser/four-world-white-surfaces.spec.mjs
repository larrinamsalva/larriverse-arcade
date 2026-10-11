import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const cases = [
  { id:'traffic-town', tile:'.choice-button:not(.correct):not(.wrong)' },
  { id:'pocket-planet', tile:'.item-button:not(.selected)' },
  { id:'critter-council', tile:'.town-tool-shelf .build-tool:not(.selected)' },
  { id:'cipher-club', tile:'.cipher-answer span' },
];

for (const {id,tile} of cases) {
  test(id+' no longer has large bare-white gameplay or empty tiles', async ({page},testInfo) => {
    await page.goto('/games/'+id+'/index.html',{waitUntil:'load'});
    await expect(page.locator('#gameBoard')).not.toBeEmpty();
    await expect(page.locator(tile).first()).toBeVisible();
    await expect(page.locator('link[href="../../assets/four-world-surface.css"]')).toHaveCount(1);
    mkdirSync('artifacts/screenshots/four-world-review',{recursive:true});

    for(const mode of ['light','dark','high-contrast']) {
      await page.evaluate(theme => window.LarriVerseArcade.setSettings({
        theme: theme==='high-contrast'?'dark':theme,
        highContrast:theme==='high-contrast',
        reducedMotion:true
      }),mode);
      const measurements = await page.evaluate(tileSelector => {
        const selectors=['.play-card','.mission-card','.world-banner',tileSelector];
        const panels=selectors.map(selector=>{
          const node=document.querySelector(selector);
          if(!node) return {selector,missing:true};
          const style=getComputedStyle(node);
          const bounds=node.getBoundingClientRect();
          return {
            selector,
            text:node.textContent.trim().length,
            bg:style.backgroundColor,
            image:style.backgroundImage,
            height:Math.round(bounds.height),
            width:Math.round(bounds.width)
          };
        });
        const gameBoard=document.querySelector('#gameBoard');
        const blankPlaceholders=['#gameBoard','#feedback','#gameActions'].filter(sel=>{
          const el=document.querySelector(sel);
          return el && !el.textContent.trim() && !el.querySelector('img,canvas,svg,button,a,input,select') &&
            getComputedStyle(el).display!=='none';
        });
        return {
          panels,
          blankPlaceholders,
          overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
        };
      },tile);

      for(const panel of measurements.panels) {
        expect(panel.missing,id+' '+mode+' needs '+panel.selector).not.toBe(true);
        expect(panel.height,id+' '+mode+' '+panel.selector+' has no content height').toBeGreaterThan(32);
        expect(panel.text,id+' '+mode+' '+panel.selector+' has no visible label').toBeGreaterThan(0);
        if(mode!=='high-contrast') {
          expect(panel.image,id+' '+mode+' '+panel.selector+' remained a flat white rectangle').not.toBe('none');
        }else {
          expect(panel.bg,id+' high contrast '+panel.selector).toBe('rgb(0, 0, 0)');
        }
      }
      expect(measurements.blankPlaceholders,id+' '+mode+' renders empty placeholders').toEqual([]);
      expect(measurements.overflow,id+' '+mode+' has horizontal scroll').toBeLessThanOrEqual(4);
      if(mode!=='high-contrast') {
        await page.screenshot({
          path:'artifacts/screenshots/four-world-review/'+id+'-'+mode+'-'+testInfo.project.name+'.png',
          fullPage:true,animations:'disabled'
        });
      }
    }
  });
}
