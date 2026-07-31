/**
 * Expand Tests 36-40 blueprint P4 paragraphs and P5 text to hit targets.
 * P4 target 300-360 (need ~15-20 more words per paragraph).
 * P5 target 180-220 (need ~50 more words).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BLUE = path.join(__dirname, 'pet-b1/blueprints')

// Natural sentences appended AFTER the gap marker of each P4 paragraph
// (gap is mid-paragraph; these extend the text after it).
const P4_EXTRA = {
36: [
  ' The team also prepared simple answer sheets so that families could test their own observations at home.',
  ' New helpers were given a printed guide that showed each step, which reduced the number of questions during the busy opening hours.',
  ' A shared checklist let every volunteer see what had already been finished and what still needed attention.',
  ' One visitor even suggested a way to show the results as a simple graph, which the team added to the display the next day.',
  ' The notes also included a list of questions visitors asked most often, so future organisers could answer them quickly.',
],
37: [
  ' Several parents helped by timing the scenes from the back of the hall, which gave the cast a second opinion on the pacing.',
  ' The shorter version kept the youngest viewers interested, and the actors agreed that the change made the story easier to follow.',
  ' The group used a small notebook to record the timing of each scene, so no decision was based on a vague memory.',
  ' Once both entrances had been tested, the choice became obvious, and the disagreement simply disappeared.',
  ' A short written summary was left with the drama teacher, so that the same notes could guide the next production.',
],
38: [
  ' The daily record made it easy to spot which dishes were returned half-eaten most often, so the kitchen could respond quickly.',
  ' Students who usually asked for more food said the new size was fine, which confirmed that the change had not left anyone hungry.',
  ' By comparing the figures dish by dish, the class avoided making a single broad change that might have upset the menu.',
  ' The salad bowl was refilled several times each lunch, but the amount of food thrown away still fell.',
  ' The method was written down so simply that another school could follow the same steps without any extra training.',
],
39: [
  ' The decision to search for evidence rather than guess set a clear standard that the whole group agreed to follow.',
  ' The comparison with the records did not settle the question completely, but it removed several unlikely dates.',
  ' Keeping both possibilities visible felt uncomfortable at first, yet it prevented the archive from stating a fact that might be wrong.',
  ' The separate note meant that the main label could stay simple while the uncertainty was still recorded for anyone who looked closer.',
  ' The honest approach also helped other residents trust the project, because they could see that the volunteers were careful rather than careless.',
],
40: [
  ' The measurements were written into a simple table, so the engineer could check every figure against the plan.',
  ' The safer route added a few extra metres, but it kept people well away from the steep edge even in heavy rain.',
  ' Comparing the two designs on paper made the choice easier, because the numbers showed the difference clearly.',
  ' The engineer\'s drawing was pinned to the notice board, and the group used it to answer every question about the change.',
  ' The stored records meant that the next improvement could be designed with the same care, rather than starting from memory alone.',
],
}

// Sentences to append to each P5 text (before the final sentence keeps flow)
const P5_EXTRA = {
36: ' The survey also revealed that many students preferred books with a picture on every page, so the librarian added a small display of illustrated novels near the entrance. A group of younger readers drew a short review card for each recommended book, which made the display feel personal and welcoming.',
37: ' New members are encouraged to watch the older group for a session before joining, so they understand the routine and feel less nervous. The leader also records each session on a phone, so the group can listen back and notice small improvements in timing and clarity that they might miss during the rehearsal itself.',
38: ' The recycling centre visit was arranged during a free afternoon, and everyone who collected paper was invited to come along. Seeing the whole process made the students more careful about what they put in the box, because they realised that a single dirty sheet could spoil an entire bundle.',
39: ' My grandmother still phones me every weekend to ask what I have cooked, and she always has a new tip to share. The notebook has grown to cover soups, sauces and a few desserts, and I am now brave enough to try recipes from other countries when I find one that uses ingredients from the local shop.',
40: ' The stall now takes up a little more space, and we have added a small sign showing that the cards are handmade. Several regular customers come back every week to see the new designs, and we have started taking special orders for birthdays and family events.',
}

async function patch(n) {
  const file = path.join(BLUE, `test-${n}.mjs`)
  const mod = await import(pathToFileURL(file).href)
  const bp = JSON.parse(JSON.stringify(mod.default))

  // Part 4: append extra after gap in each paragraph
  const p4 = bp.part4
  const extras = P4_EXTRA[n]
  p4.layoutParagraphs = p4.layoutParagraphs.map((para, i) => {
    const gapMatch = para.match(/\(\d+\)\s*\.{3,}/)
    if (!gapMatch || !extras[i]) return para
    const idx = para.indexOf(gapMatch[0]) + gapMatch[0].length
    return para.slice(0, idx) + extras[i] + para.slice(idx)
  })

  // Part 5: append extra sentences at end
  const p5 = bp.part5
  if (P5_EXTRA[n]) p5.extra += P5_EXTRA[n]

  // Re-validate P5 spec phrases still in text
  const full = p5.text + p5.extra
  for (const spec of p5.specs) {
    if (!full.includes(spec.phrase)) throw new Error(`T${n} P5 spec gone: "${spec.phrase}"`)
  }

  fs.writeFileSync(file, `export default ${JSON.stringify(bp, null, 2)}\n`)
  console.log(`Expanded test-${n}.mjs`)
}

for (const n of [36, 37, 38, 39, 40]) await patch(n)
console.log('Done')
