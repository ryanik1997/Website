import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
const root=resolve(import.meta.dirname,'../..')
const words=s=>s.replace(/\(\d+\)\s*\.{2,}/g,' ').replace(/<[^>]*>/g,' ').trim().split(/\s+/).filter(Boolean).length
for(let n=20;n<=29;n++){
 const body=JSON.parse(readFileSync(resolve(root,`packages/catalog/data/reading-pet-b1-test${n}.json`)))
 const vault=JSON.parse(readFileSync(resolve(root,`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.answers.json`)))
 const p4=body.parts.find(p=>p.partNumber===4), p5=body.parts.find(p=>p.partNumber===5), p6=body.parts.find(p=>p.partNumber===6)
 const paras=p4.passage.filter(b=>!b.label), opts=p4.passage.filter(b=>b.label)
 if(paras.length!==5||opts.length!==8) throw Error(`Test ${n} Part 4 layout`)
 const gaps=paras.flatMap(b=>[...b.text.matchAll(/\((\d+)\)\s*\.{2,}/g)].map(x=>+x[1]))
 if(gaps.join(',')!=='16,17,18,19,20') throw Error(`Test ${n} Part 4 gaps`)
 const p4w=paras.reduce((a,b)=>a+words(b.text),0), p5w=words(p5.passage.find(b=>!b.label).text), p6w=words(p6.passage.find(b=>!b.label).text)
 if(p4w<300||p4w>360||p5w<180||p5w>220||p6w<160||p6w>200) throw Error(`Test ${n} word ranges ${p4w}/${p5w}/${p6w}`)
 for(const p of [p5,p6]) {const qs=p.questionGroups[0].questions;if(qs.length!==6) throw Error(`Test ${n} question count`);if(p.partNumber===5&&qs.some(q=>q.options.length!==4)) throw Error(`Test ${n} P5 options`)}
 for(let q=16;q<=32;q++){const id=`catalog-reading-pet-b1-test${n}-part-${q<=20?4:q<=26?5:6}-q${q}`;if(!vault.answers[id])throw Error(`Missing answer ${id}`)}
 console.log(`${n}: P4 ${p4w}, P5 ${p5w}, P6 ${p6w}`)
}
console.log('PET 20-29 backfill contract PASS')
