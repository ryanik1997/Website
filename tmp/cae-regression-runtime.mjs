import { chromium } from 'playwright'
const browser=await chromium.launch({headless:true});const rows=[]
for(const [level,slug,shell] of [['PET','catalog-reading-pet-b1-test1','.pet-rw-shell'],['FCE','catalog-reading-fce-b2-test1','.fce-rw-shell']]){
 const page=await browser.newPage({viewport:{width:1366,height:768}});const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(`http://127.0.0.1:5173/app/exam/reading/${slug}`,{waitUntil:'domcontentloaded'});await page.waitForSelector(shell,{timeout:30000});
 rows.push({level,http:response?.status(),logo:await page.locator('img[alt="Cambridge English"]').count(),parts:await page.locator('.ket-rw-footer__part-tab').count(),bodyOverflow:await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),consoleErrors:errors.length,errors});await page.close();
}
console.log(JSON.stringify(rows,null,2));await browser.close();
