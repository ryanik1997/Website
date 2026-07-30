import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const root = resolve(import.meta.dirname, '../..')
const trim = {
  21: ['which seemed like a perfect arrangement.', 'which seemed like a perfect arrangement.'],
  22: ['so that nobody would get lost along the way.', 'so that nobody would get lost along the way.'],
  23: ['away from the rest of the world.', 'away from the rest of the world.'],
  25: ['and the staff were always busy looking after the animals and keeping the place clean.', 'and the staff were always busy looking after the animals.'],
  26: ['and I hope to travel and taste authentic food one day.', 'and I hope to taste authentic food one day.'],
  27: ['who live alone in the neighbourhood.', 'who live alone.'],
  28: ['about school events and sports results.', 'about school events.'],
  29: ['and created a memory we will never forget.', 'and created a lasting memory.'],
}
const addP5 = {
  23: ' The project also changed everyday habits: families began checking packaging before shopping, and the school invited the volunteers to explain the system at a parents’ evening.',
  29: ' His advice has also changed the way I cook at home, because I now plan meals carefully and use vegetables when they are freshest instead of buying whatever looks attractive in the shop.',
}
const addP6 = {
  26: ' I keep a small notebook of new phrases beside my desk, which helps me notice progress even on days when the characters still seem difficult to remember.',
}
const removeP4 = {
  21: ' My neighbour has suggested that we form a small band with other friends who play instruments, and we have already started looking for a place to practise together regularly.',
  22: ' The head teacher was so impressed with our organisation skills that she has offered to make the fun run an annual event, and we have already started planning next year edition.',
  23: ' As summer ended, we promised each other to maintain the treehouse and keep it as our special place for many years to come, no matter how busy we became.',
  25: ' I have started reading books about veterinary medicine and animal behaviour, and I hope to volunteer at a wildlife rescue centre during my summer holidays next year.',
  29: ' She later said it was the best birthday she had ever had, and the whole experience brought our class closer together than any ordinary school activity could have done.',
}
function path(n, publicCopy = false) { return resolve(root, publicCopy ? `apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.json` : `packages/catalog/data/reading-pet-b1-test${n}.json`) }
for (let n = 20; n <= 29; n++) {
  for (const pub of [false, true]) {
    const file = path(n, pub); const exam = JSON.parse(readFileSync(file, 'utf8'))
    const p4 = exam.parts.find(p => p.partNumber === 4); const p5 = exam.parts.find(p => p.partNumber === 5); const p6 = exam.parts.find(p => p.partNumber === 6)
    if (trim[n]) for (const block of p4.passage.filter(b => !b.label)) block.text = block.text.replace(trim[n][0], trim[n][1])
    if (removeP4[n]) for (const block of p4.passage.filter(b => !b.label)) block.text = block.text.replace(removeP4[n], '')
    if (addP5[n]) {
      const block = p5.passage.find(b => !b.label && b.text)
      block.text = block.text.split(addP5[n]).join('') + addP5[n]
    }
    if (addP6[n]) {
      const block = p6.passage.find(b => !b.label && b.text)
      block.text = block.text.split(addP6[n]).join('') + addP6[n]
    }
    writeFileSync(file, JSON.stringify(exam, null, 2) + '\n')
  }
}
console.log('Finalized Test 20-29 Part 4-6 content.')
