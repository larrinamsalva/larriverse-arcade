import {test,expect} from "@playwright/test";

// A customer reported white labels/choices on white in Lemonade Lab.
// Exercise the actual market select controls, not just CSS existence.
test("Lemonade Lab market text and native dropdown choices stay readable in three themes",async({page})=>{
 await page.goto("/games/lemonade-lab/index.html");
 await expect(page.locator("[data-market-mission]")).toBeVisible();
 for(const theme of ["light","dark","high-contrast"]){
  await page.evaluate(choice=>window.LarriVerseArcade.setSettings({
   theme:choice==="high-contrast"?"dark":choice,
   highContrast:choice==="high-contrast",
   reducedMotion:true
  }),theme);
  const colors=await page.evaluate(()=>{
   const luminance=color=>{
    const values=(color.match(/[\d.]+/g)||[]).slice(0,3).map(Number).map(value=>{
     const c=value/255;return c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4;
    });
    return values[0]*.2126+values[1]*.7152+values[2]*.0722;
   };
   const contrast=(a,b)=>{
    const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
   };
   const card=document.querySelector(".creative-mission-card");
   const selected=card.querySelector("#stockInput");
   const selectedPrice=card.querySelector("#priceInput");
   const label=card.querySelector(".field-grid label");
   const title=card.querySelector("h2");
   const option=selected.options[0];
   const style=x=>getComputedStyle(x);
   return {
    card:contrast(style(card).color,style(card).backgroundColor),
    title:contrast(style(title).color,style(card).backgroundColor),
    label:contrast(style(label).color,style(card).backgroundColor),
    selected:contrast(style(selected).color,style(selected).backgroundColor),
    price:contrast(style(selectedPrice).color,style(selectedPrice).backgroundColor),
    option:contrast(style(option).color,style(option).backgroundColor),
    selectedColor:style(selected).color,
    selectedBg:style(selected).backgroundColor,
    scheme:style(selected).colorScheme
   };
  });
  for(const key of ["card","title","label","selected","price","option"])
   expect(colors[key],theme+" "+key+" fails readable contrast: "+JSON.stringify(colors)).toBeGreaterThanOrEqual(4.5);
  await page.locator("#stockInput").selectOption("8");
  await page.locator("#priceInput").selectOption("4");
  await expect(page.locator("#stockInput")).toHaveValue("8");
  await expect(page.locator("#priceInput")).toHaveValue("4");
  await expect(page.locator("#stockInput")).toBeVisible();
  if(theme==="dark"||theme==="high-contrast")expect(colors.scheme).toContain("dark");
 }
 await page.locator("#stockInput").selectOption("2");
 await page.locator("#priceInput").selectOption("3");
 await page.getByRole("button",{name:"Run my mission stand"}).click();
 await expect(page.locator("#feedback")).not.toBeEmpty();
});

test("Beat Builder rhythm mission copy stays legible in dark and high-contrast themes",async({page})=>{
  await page.goto("/games/beat-builder/index.html");
  await expect(page.locator("[data-beat-mission]")).toBeVisible();
  for(const mode of ["light","dark","high-contrast"]){
    await page.evaluate(m=>window.LarriVerseArcade.setSettings({
      theme:m==="high-contrast"?"dark":m,
      highContrast:m==="high-contrast",
      reducedMotion:true
    }),mode);
    const readings=await page.evaluate(()=>{
      const rgb=val=>(val.match(/\d+(?:\.\d+)?/g)||[]).slice(0,3).map(Number);
      const lum=val=>rgb(val).map(n=>{
        const c=n/255;return c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4;
      }).reduce((a,n,i)=>a+n*[.2126,.7152,.0722][i],0);
      const contrast=(a,b)=>{
        const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
      };
      const mathSelfCheck={
        pureWhiteVsBlack:contrast("rgb(255,255,255)","rgb(0,0,0)"),
        identicalWhite:contrast("rgb(255,255,255)","rgb(255,255,255)")
      };
      const card=document.querySelector(".creative-mission-card");
      const background=getComputedStyle(card).backgroundColor;
      return {mathSelfCheck,entries:["h2","p.eyebrow","p:not(.eyebrow)",".track-label"].map(selector=>{
        const element=card.querySelector(selector);
        const styles=getComputedStyle(element);
        return {selector,ratio:contrast(styles.color,background),foreground:styles.color,background};
      })};
    });
    expect(readings.mathSelfCheck.pureWhiteVsBlack).toBeCloseTo(21,2);
    expect(readings.mathSelfCheck.identicalWhite).toBeCloseTo(1,4);
    for(const value of readings.entries)
      expect(value.ratio,`${mode} ${value.selector} ${JSON.stringify(value)}`).toBeGreaterThanOrEqual(4.5);
  }
});
