import {test,expect} from '@playwright/test';
import {mkdirSync,readFileSync} from 'node:fs';

// Full-page white-box investigation: previous gallery captures showed only the first viewport.
// This keeps the evidence in the existing Browser QA screenshots artifact.
const worlds=['repair-cafe','reuse-rally','fact-finder','kindness-quest','pocket-planet',
  'traffic-town','compass-cove','cipher-club','trade-town','critter-council'];

test('inspect bottom-of-page empty panels in every reported world',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Desktop full-page audit once per game');
  test.setTimeout(180000);
  mkdirSync('artifacts/screenshots/bottom-audit',{recursive:true});
  for(const world of worlds){
    await page.goto('/games/'+world+'/index.html',{waitUntil:'load'});
    await expect(page.locator('#gameBoard')).not.toBeEmpty();
    await page.evaluate(()=>window.LarriVerseArcade?.setSettings?.({theme:'light',highContrast:false,reducedMotion:true}));
    await page.screenshot({path:'artifacts/screenshots/bottom-audit/'+world+'-light.png',fullPage:true});
    const result=await page.evaluate(()=>{
      const visible=el=>{
        const st=getComputedStyle(el),r=el.getBoundingClientRect();
        return st.display!=='none'&&st.visibility!=='hidden'&&r.width>90&&r.height>35;
      };
      const info=el=>{
        const r=el.getBoundingClientRect(),css=getComputedStyle(el);
        return {node:el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+
          (typeof el.className==='string'?'.'+el.className.trim().split(/\s+/).slice(0,2).join('.'):''),
          y:Math.round(r.top+scrollY),bottom:Math.round(r.bottom+scrollY),
          height:Math.round(r.height),width:Math.round(r.width),
          background:css.backgroundColor,text:el.textContent.trim().slice(0,110)};
      };
      const blank=[...document.querySelectorAll('body *')].filter(visible)
        .filter(el=>{
          const cs=getComputedStyle(el);
          const bg=cs.backgroundColor.match(/\d+(?:\.\d+)?/g)?.slice(0,3).map(Number)||[];
          const nearWhite=bg.length===3&&bg.every(n=>n>235);
          const text=el.textContent.trim();
          return nearWhite&&text.length===0&&!el.querySelector('img,svg,canvas,video,button,a,input,select');
        }).map(info).filter(r=>r.width>160&&r.height>45);
      const bottom=[...document.querySelectorAll('.game-shell > *, .game-layout > *, .play-card > *, .mission-card > *, body > dialog')].filter(visible).map(info);
      return {height:document.documentElement.scrollHeight,blanks:blank.slice(-35),bottom:bottom.slice(-22)};
    });
    console.log('BOTTOM-AUDIT '+world+' '+JSON.stringify(result));
  }
});

test('all shared LarriVerse worlds avoid empty bottom game panels, on desktop and mobile',async({page})=>{
  test.setTimeout(180000);
  const catalog=JSON.parse(readFileSync('games/catalog.json','utf8'));
  let covered=0;
  for(const game of catalog){
    await page.goto('/'+game.href,{waitUntil:'load'});
    // Custom standalone and classic cabinets do not use the shared skill-game
    // #gameBoard structure.  Only apply this template-specific audit to pages
    // that actually contain that complete shared-game structure.
    const playArea=page.locator('#playArea.play-card');
    if(!(await playArea.count()) || !(await playArea.locator('#gameBoard').count()))continue;
    covered++;
    await expect(playArea.locator('#gameBoard')).not.toBeEmpty();
    for(const theme of ['light','dark']){
      await page.evaluate(theme=>window.LarriVerseArcade.setSettings({
        theme,highContrast:false,reducedMotion:true
      }),theme);
      const layout=await page.evaluate(()=>{
        const card=document.querySelector('#playArea.play-card');
        const rect=card.getBoundingClientRect();
        const visible=node=>{
          const css=getComputedStyle(node),box=node.getBoundingClientRect();
          return css.display!=='none'&&css.visibility!=='hidden'&&box.height>0;
        };
        const bottoms=[...card.children].filter(visible).map(node=>node.getBoundingClientRect().bottom);
        const empties=['#gameBoard','#feedback','#gameActions'].flatMap(selector=>{
          const node=card.querySelector(selector);
          if(node?.textContent.trim()===''&&node&&!node.querySelector('button,img,canvas,svg,select,input')){
            return [selector+': '+getComputedStyle(node).display];
          }
          return [];
        });
        return {
          gap:rect.bottom-Math.max(...bottoms),
          height:rect.height,
          empties,
          background:getComputedStyle(card).backgroundColor,
          footerText:document.querySelector('.game-footer')?.textContent.trim().length||0
        };
      });
      expect(layout.gap,`${game.id} (${theme}) has ${layout.gap}px of blank painted space below its last child: ${JSON.stringify(layout)}`).toBeLessThan(95);
      for(const e of layout.empties)
        expect(e,`${game.id} (${theme}) still has an empty painted placeholder`).toContain('none');
      expect(layout.footerText,`${game.id} footer must not disappear`).toBeGreaterThan(20);
    }
  }
  expect(covered,'All shared-template game worlds must be audited').toBeGreaterThanOrEqual(22);
});
