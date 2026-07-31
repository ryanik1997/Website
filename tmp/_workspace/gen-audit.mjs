import { execSync } from 'node:child_process'
import fs from 'node:fs'

const PUBLIC = 'apps/web/public/catalog/exams/reading'
const tests = [1,2,3,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51]

function gitFile(n){
  const f = `${PUBLIC}/catalog-reading-pet-b1-test${n}.json`
  try { return JSON.parse(execSync(`git show HEAD:${f}`, {encoding:'utf8'})) } catch { return null }
}
function curFile(n){
  try { return JSON.parse(fs.readFileSync(`${PUBLIC}/catalog-reading-pet-b1-test${n}.json`,'utf8')) } catch { return null }
}
function pkgFile(n){
  try { return JSON.parse(fs.readFileSync(`packages/catalog/data/reading-pet-b1-test${n}.json`,'utf8')) } catch { return null }
}

const GENERIC = new Set(['Multiple-choice cloze','Open cloze','Gapped text'])
const GENERATED = /^(1[4-9]|[2-4]\d|5[01])$/

const rows = []
for (const n of tests){
  const old = gitFile(n), cur = curFile(n), pkg = pkgFile(n)
  const isGen = GENERATED.test(String(n))
  for (const pn of [4,5,6]){
    const op = old?.parts?.find(p=>p.partNumber===pn)
    const cp = cur?.parts?.find(p=>p.partNumber===pn)
    if (!cp) continue
    const oldTitle = op?.passageTitle ?? ''
    const curTitle = cp.passageTitle ?? ''
    const sub = cp.passageSubtitle ?? ''
    const pkgTitle = pkg?.parts?.find(p=>p.partNumber===pn)?.passageTitle ?? ''
    const cleanCur = curTitle.replace(/^Part\s*[456]\s*[:—–-]\s*/i,'').trim()
    const cleanOld = oldTitle.replace(/^Part\s*[456]\s*[:—–-]\s*/i,'').trim()
    let changed = curTitle !== oldTitle
    let cls = 'KEPT_EXISTING'
    if (changed){
      cls = GENERIC.has(cleanOld) ? 'ADDED_TITLE' : 'NORMALIZED_GENERIC'
    }
    let status = 'PASS'
    if (!isGen && GENERIC.has(cleanCur)) status = 'LEGACY_FALLBACK'
    // legacy parity drift note
    let runtime = sub?.trim() || cleanCur
    rows.push({
      test: n, part: pn,
      oldTitle: oldTitle || (GENERIC.has(cleanOld)? cleanOld : cleanOld || '(none)'),
      newTitle: curTitle,
      sourceFile: isGen ? (fs.existsSync(`scripts/reading/pet-b1/blueprints/test-${n}.mjs`) ? `blueprints/test-${n}.mjs` : `JSON (${PUBLIC})`) : `JSON (${PUBLIC})`,
      packageTitle: pkgTitle, publicTitle: curTitle,
      runtimeVisible: runtime,
      status, classification: cls, changed
    })
  }
}

fs.writeFileSync('tmp/pet-b1-reading-part456-title-audit.json', JSON.stringify(rows, null, 2))
const md = []
md.push('# PET B1 Reading Part 4/5/6 Title Audit')
md.push('')
md.push('| Test | Part | Old title | New title | Source | Package | Public | Runtime | Status | Classification | Changed |')
md.push('|---|---|---|---|---|---|---|---|---|---|---|')
for (const r of rows){
  md.push(`| ${r.test} | ${r.part} | ${r.oldTitle} | ${r.newTitle} | ${r.sourceFile} | ${r.packageTitle} | ${r.publicTitle} | ${r.runtimeVisible} | ${r.status} | ${r.classification} | ${r.changed?'YES':'no'} |`)
}
fs.writeFileSync('tmp/pet-b1-reading-part456-title-audit.md', md.join('\n'))
const totals = {}
for (const r of rows){ totals[r.classification] = (totals[r.classification]||0)+1 }
console.log('rows:', rows.length)
console.log('classification totals:', JSON.stringify(totals))
console.log('changed parts:', rows.filter(r=>r.changed).length)
