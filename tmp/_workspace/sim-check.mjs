import fs from 'node:fs'
const dir = 'apps/web/public/catalog/exams/reading/'
const norm = s => String(s).toLowerCase().replace(/\((\d+)\)/g, ' ').replace(/\.{3,}/g, ' ').replace(/[^a-z0-9'\s-]/g, ' ').replace(/\s+/g, ' ').trim()
const wc = t => t ? t.split(/\s+/).filter(Boolean).length : 0
// collect passages
const passages = {}
for (const n of [...Array.from({length:40},(_,i)=>i+1), 13, ...Array.from({length:38},(_,i)=>i+14)]) {
  const f = `${dir}catalog-reading-pet-b1-test${n}.json`
  if (!fs.existsSync(f)) continue
  const j = JSON.parse(fs.readFileSync(f,'utf8'))
  for (const p of j.parts) {
    if (![3,4,5,6].includes(p.partNumber)) continue
    const text = p.passage.filter(b => b.text && !b.label).map(b => b.text).join(' ') || p.passage[0]?.text || ''
    passages[`t${n}-p${p.partNumber}`] = norm(text)
  }
}
// Compare new tests 41-45 against everything
const newKeys = ['41','42','43','44','45'].flatMap(n => ['3','4','5','6'].map(p => `t${n}-p${p}`))
let issues = 0, top = []
for (const a of newKeys) {
  for (const [b, textB] of Object.entries(passages)) {
    if (a === b) continue
    const textA = passages[a]
    if (!textA || !textB) continue
    // exact repeated sentence >10 words
    const sentA = new Set(textA.split(/(?<=[.!?])\s+/).filter(s => wc(s) > 10))
    for (const s of sentA) if (textB.includes(s)) { issues++; top.push({a, b, type:'sentence>10', frag: s.slice(0,60)}) }
    // repeated clause >8 words (any shared 9-word n-gram)
    const gramsA = new Set()
    const wa = textA.split(' ')
    for (let i = 0; i + 8 < wa.length; i++) gramsA.add(wa.slice(i, i + 9).join(' '))
    const wb = textB.split(' ')
    for (let i = 0; i + 8 < wb.length; i++) {
      const g = wb.slice(i, i + 9).join(' ')
      if (gramsA.has(g)) { issues++; top.push({a, b, type:'clause>8', frag: g.slice(0,60)}) }
    }
    // same opening 5 tokens
    const openA = wa.slice(0,5).join(' '), openB = wb.slice(0,5).join(' ')
    if (wc(openA) >= 5 && openA === openB) { issues++; top.push({a, b, type:'same-opening', frag: openA}) }
  }
}
// also within 41-45 (each pair)
for (let i = 0; i < newKeys.length; i++) for (let k = i+1; k < newKeys.length; k++) {
  const a = newKeys[i], b = newKeys[k]
  const wa = passages[a].split(' '), wb = passages[b].split(' ')
  const setA = new Set()
  for (let x = 0; x + 8 < wa.length; x++) setA.add(wa.slice(x, x + 9).join(' '))
  for (let x = 0; x + 8 < wb.length; x++) {
    const g = wb.slice(x, x + 9).join(' ')
    if (setA.has(g)) { issues++; top.push({a, b, type:'clause>8 (in-batch)', frag: g.slice(0,60)}) }
  }
}
console.log('similarity issues:', issues)
top.slice(0, 20).forEach(t => console.log(`  ${t.a} vs ${t.b} [${t.type}]: "${t.frag}"`))
