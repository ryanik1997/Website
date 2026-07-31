import fs from 'node:fs'
import crypto from 'node:crypto'
const root=process.cwd();const out={tests:[],duplicates:[],parity:[]}
const words=s=>s.replace(/\(\d+\)\s*\.{2,}/g,' ').replace(/\s+/g,' ').trim().split(' ').filter(Boolean).length
const sentences=s=>(s.match(/[.!?](?=\s|$)/g)||[]).length
const prose=p=>p.passage.filter(b=>!b.label).map(b=>b.text).join(' ')
for(let n=36;n<=40;n++){
 const pkg=JSON.parse(fs.readFileSync(`${root}/packages/catalog/data/reading-pet-b1-test${n}.json`));const pub=JSON.parse(fs.readFileSync(`${root}/apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.json`));
 const ph=crypto.createHash('sha256').update(JSON.stringify(pkg.parts)).digest('hex'), uh=crypto.createHash('sha256').update(JSON.stringify(pub.parts)).digest('hex');if(ph!==uh)throw Error(`parity ${n}`)
 const [p1,p2,p3,p4,p5,p6]=pub.parts;const p4p=p4.passage.filter(b=>!b.label).slice(0,5).map(b=>words(b.text));const p4w=p4p.reduce((a,b)=>a+b,0),p5w=words(prose(p5)),p6w=words(prose(p6));
 if(p4w<300||p4w>360||p4p.some(x=>x<50||x>85)||sentences(prose(p4))<14)throw Error(`P4 ${n} ${p4w}/${p4p}`)
 if(p5w<180||p5w>220||sentences(prose(p5))<8)throw Error(`P5 ${n} ${p5w}`)
 if(p6w<160||p6w>200||sentences(prose(p6))<7)throw Error(`P6 ${n} ${p6w}`)
 if(p1.passage.length!==5||p2.passage.filter(b=>b.label).length!==8||p3.passage.length<4)throw Error(`structure ${n}`)
 const q2=p2.questionGroups[0].questions;if(new Set(q2.map(q=>pub.answers?.[q.id])).size<5){}
 const ans=JSON.parse(fs.readFileSync(`${root}/apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.answers.json`)).answers;const keys=Object.keys(ans).filter(k=>k.includes('-part-2-'));if(new Set(keys.map(k=>ans[k].answer)).size!==5)throw Error(`answers p2 ${n}`)
 if(p4.passage.filter(b=>b.text&&b.label===undefined).length<5||p4.passage.filter(b=>b.label).length!==8)throw Error(`p4 shape ${n}`)
 out.tests.push({test:n,part4:p4w,part4Paragraphs:p4p,part4Sentences:sentences(prose(p4)),part5:p5w,part5Sentences:sentences(prose(p5)),part6:p6w,part6Sentences:sentences(prose(p6)),packagePublicParity:true})
}
const texts=[];for(let n=36;n<=40;n++){const d=JSON.parse(fs.readFileSync(`${root}/apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.json`));for(const p of d.parts)for(const b of p.passage)if(!b.label)texts.push([n,p.partNumber,b.text])}
for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){const a=texts[i][2].toLowerCase().split(/\s+/).slice(0,12).join(' '),b=texts[j][2].toLowerCase().split(/\s+/).slice(0,12).join(' ');if(a===b)out.duplicates.push({a:texts[i].slice(0,2),b:texts[j].slice(0,2),type:'opening'})}
fs.writeFileSync(`${root}/tmp/pet-b1-reading-quality-batch-36-40-audit.json`,JSON.stringify(out,null,2));fs.writeFileSync(`${root}/tmp/pet-b1-reading-quality-batch-36-40-audit.md`,['# PET B1 Batch 5 audit','',...out.tests.map(x=>`Test ${x.test}: P4 ${x.part4} (${x.part4Paragraphs.join('/')}, ${x.part4Sentences} sentences); P5 ${x.part5} (${x.part5Sentences} sentences); P6 ${x.part6} (${x.part6Sentences} sentences); parity PASS`),'',`Opening duplicates: ${out.duplicates.length}`].join('\n'));console.log(JSON.stringify(out,null,2));
