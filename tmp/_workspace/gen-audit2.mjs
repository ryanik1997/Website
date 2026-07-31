import fs from 'node:fs'

const PUBLIC = 'apps/web/public/catalog/exams/reading'
const props = JSON.parse(fs.readFileSync('tmp/_workspace/title_proposals.json','utf8'))
const GENERIC = new Set(['Multiple-choice cloze','Open cloze','Gapped text'])
const GENERATED = /^(1[4-9]|[2-4]\d|5[01])$/
const tests = [1,2,3,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51]

function curFile(n){ try { return JSON.parse(fs.readFileSync(`${PUBLIC}/catalog-reading-pet-b1-test${n}.json`,'utf8')) } catch { return null } }
function pkgFile(n){ try { return JSON.parse(fs.readFileSync(`packages/catalog/data/reading-pet-b1-test${n}.json`,'utf8')) } catch { return null } }

// map: test-part -> old passageTitle (pre-task state)
const oldMap = {}
for (const p of props) oldMap[`${p.test}-${p.part}`] = `Part ${p.part} \u2013 ${p.oldTitle}`
// test 23 P6 was improved by this task (2-word -> 3+ words)
oldMap['23-6'] = 'Part 6 \u2013 Learning photography'

const rows = []
for (const n of tests){
  const cur = curFile(n), pkg = pkgFile(n)
  const isGen = GENERATED.test(String(n))
  for (const pn of [4,5,6]){
    const cp = cur?.parts?.find(p=>p.partNumber===pn)
    if (!cp) continue
    const curTitle = cp.passageTitle ?? ''
    const oldTitle = oldMap[`${n}-${pn}`] ?? curTitle
    const sub = cp.passageSubtitle ?? ''
    const pkgTitle = pkg?.parts?.find(p=>p.partNumber===pn)?.passageTitle ?? ''
    const cleanCur = curTitle.replace(/^Part\s*[456]\s*[:—–-]\s*/i,'').trim()
    const cleanOld = oldTitle.replace(/^Part\s*[456]\s*[:—–-]\s*/i,'').trim()
    const changed = curTitle !== oldTitle
    let cls = 'KEPT_EXISTING'
    if (changed) cls = GENERIC.has(cleanOld) || !cleanOld ? 'ADDED_TITLE' : 'NORMALIZED_GENERIC'
    let status = 'PASS'
    if (!isGen && (GENERIC.has(cleanCur) || /^\s*$/.test(cleanCur))) status = 'LEGACY_FALLBACK'
    const sourceFile = isGen && fs.existsSync(`scripts/reading/pet-b1/blueprints/test-${n}.mjs`)
      ? `blueprints/test-${n}.mjs` : `JSON ${PUBLIC}`
    rows.push({
      test: n, part: pn,
      oldTitle: cleanOld || '(none)',
      newTitle: curTitle,
      sourceFile,
      packageTitle: pkgTitle, publicTitle: curTitle,
      runtimeVisible: sub?.trim() || cleanCur,
      status, classification: cls, changed
    })
  }
}
fs.writeFileSync('tmp/pet-b1-reading-part456-title-audit.json', JSON.stringify(rows, null, 2))
const md = ['# PET B1 Reading Part 4/5/6 Title Audit','',
  '| Test | Part | Old title | New title | Source | Package title | Public title | Runtime visible | Status | Classification | Changed |',
  '|---|---|---|---|---|---|---|---|---|---|---|']
for (const r of rows){
  md.push(`| ${r.test} | ${r.part} | ${r.oldTitle} | ${r.newTitle} | ${r.sourceFile} | ${r.packageTitle} | ${r.publicTitle} | ${r.runtimeVisible} | ${r.status} | ${r.classification} | ${r.changed?'YES':'no'} |`)
}
fs.writeFileSync('tmp/pet-b1-reading-part456-title-audit.md', md.join('\n'))
const totals = {}
for (const r of rows){ totals[r.classification] = (totals[r.classification]||0)+1 }
console.log('rows:', rows.length, '| changed:', rows.filter(r=>r.changed).length)
console.log('classification:', JSON.stringify(totals))
console.log('status PASS:', rows.filter(r=>r.status==='PASS').length, 'LEGACY_FALLBACK:', rows.filter(r=>r.status==='LEGACY_FALLBACK').length)
