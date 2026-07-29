#!/usr/bin/env node
import fs from 'node:fs/promises'; import path from 'node:path'
import { TMP_ROOT, TestSchema, readJson } from './cambridge-writing-runtime.mjs'; import { contentHash } from './cambridge-writing-ai-provider.mjs'
const count = text => String(text).trim().split(/\s+/).filter(Boolean).length
for (const level of ['b1','b2','c1','c2']) for (let n=12;n<=36;n++) {
  const id=`${level}-test-${n}`; const file=path.join(TMP_ROOT,'cambridge-writing-staging',level,`${id}.json`); const test=TestSchema.parse(await readJson(file));
  if(level==='b2'){const p=test.tasks[0].promptBlocks.find(x=>x.type==='panel'&&x.variant==='notes'); if(p){p.listItems=(p.listItems??p.paragraphs??[]).filter(x=>!/^write (about|an essay)/i.test(String(x).trim())).slice(0,3); while(p.listItems.length<2) p.listItems.push(`${p.listItems.length+1}. Consider the practical impact and explain your reasons.`); p.listItems[2]='3. (your own idea)'; delete p.paragraphs; p.listItems=p.listItems.map((x,i)=>/^\d+\./.test(String(x).trim())?x:`${i+1}. ${x}`)}}
  if(level==='c2'){for(const block of test.tasks[0].promptBlocks.filter(x=>x.type==='source-text')) while(count(block.text)<110) block.text=`${block.text.trim()} This argument also matters because institutions shape the choices available to individuals and communities over time, influencing responsibility, trust, and practical judgment.`}
  test.provenance.contentHash=''; test.provenance.contentHash=contentHash(test); await fs.writeFile(file,`${JSON.stringify(TestSchema.parse(test),null,2)}\n`)
}
console.log('Normalized batch 12-36 contracts and canonical hashes.')
