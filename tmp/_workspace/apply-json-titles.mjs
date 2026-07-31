import fs from 'node:fs'
const props = JSON.parse(fs.readFileSync('tmp/_workspace/title_proposals.json','utf8'))
const NON_BP = new Set([31,32,33,34,35,41,42,43,44,45,46,47,48,49,50])
let changed = 0
for (const n of NON_BP){
  const pubFile = `apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.json`
  const pkgFile = `packages/catalog/data/reading-pet-b1-test${n}.json`
  for (const file of [pubFile, pkgFile]){
    const j = JSON.parse(fs.readFileSync(file,'utf8'))
    let touched = false
    for (const part of j.parts){
      if (![4,5,6].includes(part.partNumber)) continue
      const prop = props.find(p => p.test===n && p.part===part.partNumber)
      if (!prop) { console.log('MISSING PROP', n, part.partNumber); continue }
      const newTitle = `Part ${part.partNumber} – ${prop.newTitle}`
      if (part.passageTitle !== newTitle){ part.passageTitle = newTitle; touched = true }
    }
    if (touched){
      fs.writeFileSync(file, JSON.stringify(j, null, 2) + '\n')
      changed++
    }
  }
}
console.log('updated', changed, 'files')
