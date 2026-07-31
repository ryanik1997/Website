import fs from 'node:fs'

const tests = [14,15,16,17,18,19,20,21,22,23,24,30,51]
const norm = s => s.toLowerCase().replace(/[^a-z0-9\s]/g,'').split(/\s+/).filter(Boolean).slice(0,3).join(' ')

const all = [] // {test, letter, first3, full}
for (const n of tests) {
  const j = JSON.parse(fs.readFileSync(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.json`,'utf8'))
  const p2 = j.parts[1]
  p2.passage.slice(1).forEach(b => {
    const desc = b.text.split(' \u2014 ')[1] || b.text
    all.push({ test: n, letter: b.label, first3: norm(desc), full: desc })
  })
}

// Check shared first-3-tokens
const byFirst3 = {}
for (const o of all) (byFirst3[o.first3] ||= []).push(o)
const dupes = Object.entries(byFirst3).filter(([,v]) => v.length > 1)
console.log('=== SHARED FIRST-3-TOKEN GROUPS ===')
if (dupes.length === 0) console.log('NONE — all openings unique')
else dupes.forEach(([k,v]) => console.log(`"${k}":`, v.map(x=>`T${x.test}${x.letter}`).join(', ')))

// Check article-led openings per test
console.log('\n=== ARTICLE-LED OPENINGS (a/an/the) ===')
for (const n of tests) {
  const opts = all.filter(o => o.test === n)
  const art = opts.filter(o => /^(a|an|the)\b/.test(o.first3))
  if (art.length > 0) console.log(`Test ${n}: ${art.length} article-led`, art.map(o=>o.letter).join(','))
}

// Check time-led openings per test
console.log('\n=== TIME-LED OPENINGS ===')
const timeWords = /^(every|on|at|from|each|during|before|after|until|by)\b/
for (const n of tests) {
  const opts = all.filter(o => o.test === n)
  const t = opts.filter(o => timeWords.test(o.first3))
  if (t.length > 2) console.log(`Test ${n}: ${t.length} time-led (MAX 2 EXCEEDED)`, t.map(o=>`${o.letter}:${o.first3}`).join(', '))
}

// Opening style diversity: count distinct first-3 per test
console.log('\n=== DISTINCT OPENING COUNT PER TEST (need >=5 styles) ===')
for (const n of tests) {
  const opts = all.filter(o => o.test === n)
  console.log(`Test ${n}: ${opts.length} options, ${new Set(opts.map(o=>o.first3)).size} distinct openings`)
}

// Repeated clauses > 8 words across tests
console.log('\n=== REPEATED CLAUSES >8 WORDS (cross-test) ===')
function clauses(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s']/g,' ').split(/\s+/).filter(Boolean)
    .reduce((acc,_,i,arr) => { for (let len=9; len<=15; len++) if (i+len<=arr.length) acc.push(arr.slice(i,i+len).join(' ')); return acc }, [])
}
const clauseMap = {}
for (const o of all) for (const c of clauses(o.full)) (clauseMap[c] ||= new Set()).add(`${o.test}${o.letter}`)
const repeated = Object.entries(clauseMap).filter(([,s]) => s.size > 1)
if (repeated.length === 0) console.log('NONE')
else repeated.slice(0,10).forEach(([c,s]) => console.log(`"${c}" in ${[...s].join(', ')}`))
