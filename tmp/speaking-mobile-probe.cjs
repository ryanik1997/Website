const { chromium } = require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto('http://localhost:5173/app/speaking/ielts',{waitUntil:'networkidle'});
 console.log(JSON.stringify({url:page.url(),title:await page.title(),h1:await page.locator('h1').first().textContent().catch(()=>null),body:(await page.locator('body').innerText()).slice(0,100)}));
 await browser.close();
})();
