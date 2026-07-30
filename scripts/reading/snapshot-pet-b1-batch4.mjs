import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
const root = resolve(import.meta.dirname, '../..'); mkdirSync(resolve(root,'tmp'), {recursive:true})
const files=[]
for (const n of [14,19,30,51]) for (const f of [`packages/catalog/data/reading-pet-b1-test${n}.json`,`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.json`,`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.answers.json`]) files.push({file:f,sha256:createHash('sha256').update(readFileSync(resolve(root,f))).digest('hex')})
writeFileSync(resolve(root,'tmp/pet-b1-batch4-preservation-before.json'),JSON.stringify({tests:[14,19,30,51],files},null,2)+'\n')
console.log('Batch 4 snapshot written')
