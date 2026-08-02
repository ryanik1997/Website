import { chromium } from 'playwright'
import fs from 'node:fs/promises'
const output='../../outputs/cae-task4.3'
await fs.mkdir(output,{recursive:true})
const browser=await chromium.launch({headless:true})
const context=await browser.newContext({viewport:{width:1920,height:1080}})
const page=await context.newPage()
const errors=[]
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})
const root='http://127.0.0.1:5173/app/exam/reading/'
const style=async()=>page.evaluate(()=>{const pick=e=>{if(!e)return null;const c=getComputedStyle(e),r=e.getBoundingClientRect();return{box:{x:r.x,y:r.y,width:r.width,height:r.height},display:c.display,verticalAlign:c.verticalAlign,width:c.width,minWidth:c.minWidth,height:c.height,minHeight:c.minHeight,padding:c.padding,marginInline:c.marginInline,marginBlock:c.marginBlock,borderWidth:c.borderWidth,borderStyle:c.borderStyle,borderColor:c.borderColor,borderRadius:c.borderRadius,lineHeight:c.lineHeight,fontSize:c.fontSize,background:c.backgroundColor,boxSizing:c.boxSizing}};const gap=document.querySelector('.gapped-text-gap'),slot=gap?.querySelector('.pet-rw-drag__slot--inline'),paragraph=gap?.closest('p'),wrapper=paragraph?.parentElement,bank=document.querySelector('.gapped-text-bank .pet-rw-drag__bank-card');return{gap:pick(gap),slot:pick(slot),paragraph:pick(paragraph),wrapper:pick(wrapper),bankCard:pick(bank),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})
const open=async(id,part,shell)=>{await page.goto(root+id);await page.locator(shell).waitFor();await page.getByRole('button',{name:new RegExp(`Part ${part}`)}).click()}
await open('catalog-reading-fce-b2-test21',6,'.fce-rw-shell')
const fce=await style();await page.screenshot({path:`${output}/fce-reference-part6.png`})
await open('catalog-reading-cae-c1-test14',7,'.cae-rw-shell')
const cae=await style();await page.screenshot({path:`${output}/cae-test14-part7-initial.png`})
const gap=n=>page.getByRole('button',{name:new RegExp(`^Gap ${n},`)})
const card=id=>page.locator(`[data-gapped-text-option="${id}"]`)
const bank=page.getByLabel('Paragraph bank')
const dragScrolled=async(source,target)=>{await source.scrollIntoViewIfNeeded();const a=await source.boundingBox();if(!a)throw Error('missing source');await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(a.x+a.width/2+12,a.y+a.height/2+8,{steps:5});await target.scrollIntoViewIfNeeded();const z=await target.boundingBox();if(!z)throw Error('missing target');await page.mouse.move(z.x+Math.min(z.width/2,120),z.y+z.height/2,{steps:20});await page.mouse.up()}
await card('A').dragTo(gap(41));const bankToGap=(await gap(41).getAttribute('aria-label'))?.includes('answer A');await page.screenshot({path:`${output}/cae-test14-part7-filled.png`})
await dragScrolled(gap(41),gap(43));const gapToGap=(await gap(41).getAttribute('aria-label'))?.includes('empty')&&(await gap(43).getAttribute('aria-label'))?.includes('answer A')
await gap(43).dragTo(bank);const gapToBank=(await gap(43).getAttribute('aria-label'))?.includes('empty')&&!((await card('A').getAttribute('class'))||'').includes('is-used');await page.screenshot({path:`${output}/cae-test14-part7-returned.png`})
await card('B').dragTo(gap(42));await card('C').dragTo(gap(42));const replace=(await gap(42).getAttribute('aria-label'))?.includes('answer C')&&!((await card('B').getAttribute('class'))||'').includes('is-used');await page.getByRole('button',{name:'Clear gap 42'}).click();const clear=(await gap(42).getAttribute('aria-label'))?.includes('empty')
// Pointer-select text before a gap, highlight, then create a note after the gap.
const textBlocks=page.locator('.ket-rw-pane-left [data-highlight-block]').filter({hasText:/[A-Za-z]/});const selectBlock=async locator=>{await locator.scrollIntoViewIfNeeded();const r=await locator.boundingBox();if(!r)throw Error('missing highlight block');await page.mouse.move(r.x+12,r.y+Math.min(r.height/2,14));await page.mouse.down();await page.mouse.move(Math.min(r.x+r.width-8,r.x+185),r.y+Math.min(r.height/2,14),{steps:14});await page.mouse.up()};await selectBlock(textBlocks.nth(2));const toolbarBefore=await page.locator('[data-cambridge-selection-toolbar]').isVisible();if(toolbarBefore)await page.getByRole('button',{name:'Highlight'}).click();const highlighted=await page.locator('mark.reading-test-highlight--yellow').count()>0;await selectBlock(textBlocks.nth(4));const toolbarAfter=await page.locator('[data-cambridge-selection-toolbar]').isVisible();if(toolbarAfter){await page.getByRole('button',{name:'Note'}).click();await page.getByLabel('Ghi chú cho đoạn đã chọn').fill('CAE Part 7 spacing annotation');await page.getByRole('button',{name:'Lưu note'}).click()}const noteSaved=await page.locator('.reading-test-note').count()>0;await page.getByRole('button',{name:/Part 6/}).click();await page.getByRole('button',{name:/Part 7/}).click();const annotationPersisted=(await page.locator('mark.reading-test-highlight--yellow').count()>0)&&(await page.locator('.reading-test-note').count()>0)
for(const test of [1,23]){await open(`catalog-reading-cae-c1-test${test}`,7,'.cae-rw-shell');await page.screenshot({path:`${output}/cae-test${test}-part7.png`})}
const result={fce,cae,interaction:{bankToGap,gapToGap,gapToBank,replace,clear},annotation:{toolbarBefore,highlighted,toolbarAfter,noteSaved,annotationPersisted},errors}
await fs.writeFile(`${output}/runtime-evidence.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();if(!bankToGap||!gapToGap||!gapToBank||!replace||!clear||!toolbarBefore||!highlighted||!toolbarAfter||!noteSaved||!annotationPersisted||errors.length)process.exit(1)
