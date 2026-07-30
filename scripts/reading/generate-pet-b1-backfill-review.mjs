import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const root=resolve(import.meta.dirname,'../..'); let md='# PET B1 Quality Backfill 20–29 Review\n\n'
for(let n=20;n<=29;n++){
 const body=JSON.parse(readFileSync(resolve(root,`packages/catalog/data/reading-pet-b1-test${n}.json`)))
 const vault=JSON.parse(readFileSync(resolve(root,`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.answers.json`)))
 md+=`\n## Test ${n}\n`
 for(const pn of [4,5,6]){
  const p=body.parts.find(x=>x.partNumber===pn); md+=`\n### Part ${pn}\n\n`
  for(const b of (p.passage||[])) if(b.text && !b.label) md+=`${b.text}\n\n`
  for(const b of (p.passage||[])) if(b.label) md+=`- ${b.label}: ${b.text}\n`
  const qs=p.questionGroups?.[0]?.questions||[]; if(qs.length){md+='\n#### Questions / reviewer data\n\n';for(const q of qs){const a=vault.answers[q.id];md+=`- Q${q.number}: ${q.prompt}; answer ${a?.answer||'—'}; ${a?.explanation||'No rationale in runtime.'}\n`}}
 }
}
writeFileSync(resolve(root,'tmp/pet-b1-reading-quality-backfill-20-29-review.md'),md)
console.log('Review written')
