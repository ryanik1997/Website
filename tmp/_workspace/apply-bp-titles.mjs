import fs from 'node:fs'
const props = JSON.parse(fs.readFileSync('tmp/_workspace/title_proposals.json','utf8'))
const BP_TESTS = new Set([14,15,16,17,18,19,30,36,37,38,39,40,51])
for (const n of BP_TESTS){
  const file = `scripts/reading/pet-b1/blueprints/test-${n}.mjs`
  let src = fs.readFileSync(file,'utf8')
  for (const part of [5,6]){
    const prop = props.find(p => p.test===n && p.part===part)
    if (!prop) continue
    const title = JSON.stringify(prop.newTitle)
    // Try quoted key form, then unquoted form
    let marker = new RegExp(`^(  "${part}": \{)$`, 'm')
    let repl = `$1\n    "title": ${title},`
    if (marker.test(src)) {
      src = src.replace(marker, repl)
    } else {
      marker = new RegExp(`^(  part${part}: \{)$`, 'm')
      repl = `$1\n    title: ${title},`
      if (marker.test(src)) src = src.replace(marker, repl)
      else { console.log('NO MARKER', n, part); continue }
    }
  }
  fs.writeFileSync(file, src)
  console.log('updated blueprint test-'+n)
}
