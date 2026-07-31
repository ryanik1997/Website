/**
 * Surgical tuning: fix gap-split + trim/expand without wholesale replacement.
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..', '..')

function cw(text) {
  let t = text.replace(/\(\d+\)(?:\s*\.{2,})?/g, ' ').replace(/\s+/g, ' ').trim()
  return t ? t.split(' ').length : 0
}

function fixGapSplit(blocks) {
  return blocks.map((b, i) => {
    if (i === 0) return b
    // Move leading dots from block[i] to block[i-1]
    const match = b.text.match(/^(\.{3,})\s*/)
    if (match) {
      const dots = match[1]
      const rest = b.text.slice(match[0].length)
      blocks[i - 1].text = (blocks[i - 1].text || '') + ' ' + dots
      return { ...b, text: rest }
    }
    return b
  })
}

// ── Trim removals for Part 4 ──────────────────────────
// Each entry is { test: [[blockIdx, oldStr, newStr], ...] }
const P4_TRIMS = {
32: [
  // Remove redundant/easily cut phrases from each paragraph (trim ~10-15 words each)
  [0, ' and residents could walk there after work', ''],
  [0, ' clearly', ''],
  [0, ' who rarely visited the daytime shops', ''],
  [1, ' and crafts', ''],
  [1, ' and visitors where to wait', ''],
  [1, ' Before opening', ''],
  [1, ' above the stalls', ''],
  [1, ' beside the food area', ''],
  [1, ' and less crowded', ''],
  [1, ' and kept emergency access open behind the busiest row of stalls', ''],
  [2, ' and left a clear route', ''],
  [2, ' before the first customers arrived', ''],
  [2, ' simple', ''],
  [2, ' beside the entrance', ''],
  [2, ' briefly', ''],
  [2, ' a quieter reason to stay while cooks served dishes from several neighbourhoods', 'a reason to stay'],
  [3, ' they tested lights and', ''],
  [3, ' to protect their goods', ''],
  [3, ' and pottery', ''],
  [3, ' and checked the last bus time', ''],
  [3, ' The transport check mattered because the final buses were less frequent after the market became busy', ''],
  [4, ' so nearby residents can sleep', ''],
  [4, ' The closing routine made the evening easier for everyone nearby', ''],
  [4, ' nearby', ''],
  [4, ' another', ''],
  [4, ' beside the soup stall', ''],
  [4, ' rather than being left to memory', ''],
],
34: [
  [0, ' and the only table was often reserved for meetings', ''],
  [0, ' This evidence', 'This'],
  [0, ' and better online access', ''],
  [1, ' and placed a clear sign near the entrance', ''],
  [1, ' then compared them with the catalogue', ''],
  [1, ' and licences for two useful databases', ''],
  [1, ' so useful books were not removed simply because they looked old', ''],
  [2, ' and digital resources', ''],
  [2, ' and online reference material', ''],
  [2, ' while older students worked near power sockets', ''],
  [2, ' A notice explained which areas should remain quiet', ''],
  [2, ' Power sockets were positioned away from the quietest seats, reducing noise when students charged devices', ''],
  [3, ' and showed where returned books should go', ''],
  [3, ' but reading clubs used the shared area on Wednesdays', ''],
  [3, ' Staff also taught students how to search the digital catalogue', ''],
  [3, ' and stopped homework support from disturbing readers', ''],
  [4, ' who wanted help choosing', ''],
  [4, ' or unfriendly', ''],
  [4, ' The librarian plans to review popular titles and change the layout whenever students need a different balance', ''],
  [4, ' Staff will compare borrowing figures with student comments before buying the next set of resources', ''],
],
35: [
  [0, ' through woodland and wetland', ''],
  [0, ' and a pond used by water birds', ''],
  [0, ' wet', ''],
  [0, ' She checked the forecast and prepared a shorter route in case the ground became slippery', ''],
  [0, ' The early start also reduced disturbance from later visitors and gave the survey a consistent comparison point', ''],
  [1, ' without disturbing their habitats', ''],
  [1, ' why visitors should not leave the marked path', ''],
  [1, ' and learned why nests should never be approached', ''],
  [1, ' and a list of emergency contacts', ''],
  [1, ' and what to do if someone became separated', ''],
  [2, ' and reminded walkers to stay on the path', ''],
  [2, ' that quiet behaviour gave animals more chance to remain nearby', ''],
  [2, ' where deer tracks crossed the mud', ''],
  [2, ' and several walkers recorded its behaviour', ''],
  [2, ' location, time and behaviour rather than simply naming the bird', 'behaviour'],
  [3, ' instead of calling out', ''],
  [3, ' without frightening the species they saw', ''],
  [3, ' The decision protected both visitors and wildlife, and nobody needed to leave the route in search of a better view', ''],
  [4, ' to discuss on each walk', ''],
  [4, ' for local visitors', ''],
  [4, ' The results showed fewer visits near one nest, giving conservation staff evidence for a temporary quiet zone', ''],
  [4, ' The reserve will repeat the count next season to see whether the quiet zone changes nesting activity', ''],
],
}

// ── Tail expansions ───────────────────────────────────
const P5_TAILS = {
32: ' The organisers weigh leftover food after the stalls close. Sellers donate safe portions to a shelter instead of throwing them away. Visitors are encouraged to carry reusable bags. Signs explain where each waste item should go. These small changes reduce the amount of rubbish collected after midnight and help traders compare which dishes sell well.',
34: ' The reading club chooses a title to discuss each month. Members explain why they enjoyed a character or an idea, and the librarian records useful recommendations. New students can join even if they have missed the first meeting. The group keeps notes so future members can see earlier choices. Volunteers return every book to its shelf and check the catalogue afterwards.',
35: ' The volunteer survey begins at dawn, when many birds are active. Participants carry binoculars and write notes when they see movement in the reeds. The leader divides the group so each person can watch a small area. If the path is wet, walkers stay on the wooden boards. They compare records after the walk and report unusual behaviour to the reserve team.',
}

const P6_TAILS = {
33: ' Before using a new route, riders should check whether the weather is suitable. They should carry a repair kit in case a tyre loses air on a rough section. Cyclists remain on the signed path near the junction and signal before turning. Everyone remembers to check for traffic before crossing any road.',
34: ' Students should check whether the library is open before arriving after school. They may borrow a book for two weeks unless another reader has reserved it. Quiet areas are for individual work, but the shared table near the window is available for group discussion. Pupils can ask for help if a catalogue search does not find what they need.',
35: ' Walkers should check whether the reserve has changed its route after heavy rain. They should bring a waterproof coat and keep sensitive equipment dry. Visitors remain near the guide in the wetland area. They may use binoculars, but they must not cross the rope barrier near nesting sites.',
}

// ── Apply ─────────────────────────────────────────────
for (let n = 32; n <= 35; n++) {
  const p = resolve(ROOT, `apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.json`)
  let d = JSON.parse(readFileSync(p, 'utf8'))

  // Part 4: fix gap split + trim
  const p4 = d.parts.find(p => p.partNumber === 4)
  const p4blocks = p4.passage.filter(b => !b.label && b.text)
  const p4labels = p4.passage.filter(b => b.label)
  const p4texts = p4blocks.map(b => b.text)

  // Fix gap split first
  const fixed = []
  for (let i = 0; i < p4texts.length; i++) {
    let text = p4texts[i]
    if (i > 0) {
      // Move leading dots to previous block
      const m = text.match(/^(\.{3,})\s*/)
      if (m) {
        fixed[i - 1] = (fixed[i - 1] || '') + ' ' + m[1]
        text = text.slice(m[0].length)
      }
    }
    fixed.push(text)
  }

  // Apply trims
  const trims = P4_TRIMS[n] || []
  let trimmed = fixed
  for (const [blockIdx, oldStr, newStr] of trims) {
    if (trimmed[blockIdx] !== undefined) {
      trimmed[blockIdx] = trimmed[blockIdx].replace(oldStr, newStr)
    }
  }
  // Remove extra spaces
  trimmed = trimmed.map(t => t.replace(/\s{2,}/g, ' ').trim())

  p4.passage = [...trimmed.map(t => ({ text: t })), ...p4labels]

  // Part 5: append tail
  if (P5_TAILS[n]) {
    const p5 = d.parts.find(p => p.partNumber === 5)
    const p5block = p5.passage.find(b => !b.label && b.text)
    if (p5block) p5block.text += P5_TAILS[n]
  }

  // Part 6: append tail
  if (P6_TAILS[n]) {
    const p6 = d.parts.find(p => p.partNumber === 6)
    const p6block = p6.passage.find(b => !b.label && b.text)
    if (p6block) p6block.text += P6_TAILS[n]
  }

  writeFileSync(p, JSON.stringify(d, null, 2) + '\n')

  // Report
  const rp4 = cw(d.parts.find(p => p.partNumber === 4).passage.filter(b => !b.label && b.text).map(b => b.text).join(' '))
  const rp5 = cw(d.parts.find(p => p.partNumber === 5).passage.find(b => !b.label && b.text).text)
  const rp6 = cw(d.parts.find(p => p.partNumber === 6).passage.find(b => !b.label && b.text).text)
  // Check gap split
  const p4c = d.parts.find(p => p.partNumber === 4).passage.filter(b => !b.label && b.text)
  const splitBad = p4c.filter((b, i) => i > 0 && /^\.{3,}\s*/.test(b.text)).length

  console.log(`Test ${n}: P4=${rp4} P5=${rp5} P6=${rp6} gapSplit=${splitBad}`)
}
