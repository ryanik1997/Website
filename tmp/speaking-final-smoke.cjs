const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const out = path.join(__dirname, 'speaking-final');
fs.mkdirSync(out, { recursive: true });
const base='http://localhost:5173/app/speaking/ielts';
const authKey='sb-afryrzlcmieedcndyeug-auth-token';
const fakeJwt='e30.'+Buffer.from(JSON.stringify({sub:'00000000-0000-4000-8000-000000000001',role:'authenticated',aud:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.sig';
const session={access_token:fakeJwt,refresh_token:'ui-test-refresh',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user:{id:'00000000-0000-4000-8000-000000000001',aud:'authenticated',role:'authenticated',email:'ui-test@example.invalid',app_metadata:{provider:'email',providers:['email']},user_metadata:{},created_at:new Date().toISOString()}};
async function setup(page){
 await page.route('**/rest/v1/**',route=>route.fulfill({status:200,contentType:'application/json',headers:{'content-range':'0-0/0'},body:'[]'}));
 await page.route('**/auth/v1/user',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(session.user)}));
 await page.addInitScript(({authKey,session})=>{
  localStorage.setItem(authKey,JSON.stringify(session));
  class Recognition { constructor(){window.__recognition=this;this.onresult=null;this.onerror=null} start(){} stop(){} emit(text){this.onresult?.({resultIndex:0,results:Object.assign([{0:{transcript:text},isFinal:true}],{length:1})})} }
  class Recorder { static isTypeSupported(){return true} constructor(){this.state='inactive';this.mimeType='audio/webm;codecs=opus';this.ondataavailable=null;this.onstop=null} start(){this.state='recording'} stop(){this.ondataavailable?.({data:new Blob(['voice'],{type:this.mimeType})});this.state='inactive';this.onstop?.()} }
  Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}});
  window.SpeechRecognition=Recognition;window.webkitSpeechRecognition=undefined;window.MediaRecorder=Recorder;
 },{authKey,session});
 await page.route('**/functions/v1/speaking-ai',async route=>{
  const req=route.request();let body={};try{body=req.postDataJSON()}catch{}
  if(body.action==='history') return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({conversations:[],access:{unlimited:false,dailyLimitSeconds:600,retentionDays:30}})});
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({conversationId:'visual-test',transcript:body.transcript,reply:'Good fluency. Add one concrete example and connect your ideas more naturally.',correction:{original:body.transcript,corrected:body.transcript,natural:'I live near the city centre, so everything I need is within walking distance.',explanation:'Use a supporting detail.'},vocabulary:[],followUpQuestion:'What do you like most about it?',usedSeconds:4,dailyLimitSeconds:600,unlimited:false,retentionDays:30})});
 });
}
async function shot(page,name,url,fullPage=false){await page.goto(url,{waitUntil:'networkidle'});await page.screenshot({path:path.join(out,name+'.png'),fullPage});return {name,url:page.url(),title:await page.title(),h1:await page.locator('h1').first().textContent().catch(()=>null),overflow:await page.evaluate(()=>({vw:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth}))};}
(async()=>{
 const browser=await chromium.launch({headless:true});const results=[];
 const errors=[];
 const watchErrors=p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())})};
 const page=await browser.newPage({viewport:{width:1366,height:768}});watchErrors(page);await setup(page);
 results.push(await shot(page,'landing-desktop',base));
 results.push(await shot(page,'forecast-desktop',base+'/forecast'));
 results.push(await shot(page,'roulette-pre-desktop',base+'/roulette'));
 await page.getByRole('button',{name:/SPIN THE DECK/i}).click();await page.waitForTimeout(800);await page.screenshot({path:path.join(out,'roulette-result-desktop.png')});results.push({name:'roulette-result',text:(await page.locator('.si-result').innerText()).slice(0,160)});
 results.push(await shot(page,'shadowing-desktop',base+'/shadowing'));
 const lessonHref=await page.locator('.si-lesson').first().getAttribute('href');results.push(await shot(page,'shadowing-player-desktop','http://localhost:5173'+lessonHref));
 results.push(await shot(page,'mock-part1-desktop',base+'/mock-interview/roulette-1-0'));
 results.push(await shot(page,'mock-part2-desktop',base+'/mock-interview/roulette-2-0'));
 results.push(await shot(page,'mock-part3-desktop',base+'/mock-interview/roulette-3-0'));
 await page.goto(base+'/mock-interview/forecast-p1-0-1',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:/Bấm để nói/i}).click();await page.evaluate(()=>window.__recognition.emit('I live near the city centre and I enjoy the convenient public transport.'));await page.getByRole('button',{name:/Dừng ghi âm/i}).click({force:true});await page.getByRole('button',{name:/Gửi để nhận feedback/i}).click();await page.getByText(/Good fluency/).waitFor();await page.screenshot({path:path.join(out,'feedback-desktop.png')});await page.locator('.si-feedback button').click();await page.getByText(/Hoàn thành bài Mock Interview/i).waitFor();await page.screenshot({path:path.join(out,'summary-desktop.png')});results.push({name:'feedback-summary',ok:true});
 const mobile=await browser.newPage({viewport:{width:390,height:844}});watchErrors(mobile);await setup(mobile);results.push(await shot(mobile,'landing-mobile',base,true));results.push(await shot(mobile,'forecast-mobile',base+'/forecast'));results.push(await shot(mobile,'mock-mobile',base+'/mock-interview/demo'));
 fs.writeFileSync(path.join(out,'smoke-results.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({screenshots:fs.readdirSync(out).filter(x=>x.endsWith('.png')).length,results,errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
