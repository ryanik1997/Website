/**
 * Final length tuning — Tests 32-35 Part 4/5/6
 * Trim Part 4, expand Part 5 and Part 6 to meet targets.
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..', '..')
const DATA = n => resolve(ROOT, `packages/catalog/data/reading-pet-b1-test${n}.json`)

function wc(text) {
  if (!text) return 0
  let t = text.replace(/\(\d+\)(?:\s*\.{2,})?/g, ' ').replace(/\s+/g, ' ').trim()
  return t ? t.split(' ').length : 0
}

// ── Trimmed Part 4 paragraphs (cuts in bold):
// Each paragraph has the gap preserved; extra phrases removed
const P4_TRIM = {
32: [
    'The night market organisers began with a short meeting about evening stalls. (16) The organisers listed foods and local crafts that visitors had requested. The council chose the square because buses stopped nearby. Sellers were asked to label ingredients for visitors with allergies. The choice gave small businesses a fair chance to meet customers.',
    'They wanted visitors to find food without blocking the narrow square. (17) A simple map showed traders where to set up and visitors where to wait. Electricians fixed warm lamps while organisers placed bins beside the food area. This made the entrance brighter and less crowded. Organisers checked every cable and kept emergency access open behind the stalls.',
    'The team marked spaces and left a clear route towards the bus stop. (18) Volunteers checked the lighting before customers arrived. Several traders shared storage space, and a craft maker demonstrated weaving beside the entrance. A small band played briefly, but the stalls remained the main attraction. The craft display gave visitors a reason to stay while cooks served dishes from several neighbourhoods.',
    'When rain was forecast, they covered the most exposed tables. (19) The weather test gave sellers time to protect their goods. A sudden shower tested the plan: umbrellas covered the bread and pottery, while volunteers directed visitors towards the covered arcade. The transport check mattered because the final buses were less frequent after the market became busy.',
    'The first evening was busy, but the new layout helped people move safely. (20) The market now closes at a fixed time so nearby residents can sleep. Afterwards, organisers counted visitors and asked for comments. They decided to add a bus notice, shorten the queue beside the soup stall and keep the lights on until closing.',
],
34: [
    'The school library team wanted more students to use its reading spaces. (16) The team first compared the busy library with the quieter study room. Books were mixed together and the only table was often reserved for meetings. Students said they needed both quiet study space and somewhere to share ideas. This evidence helped separate furniture problems from requests for more books.',
    'They moved shelves to create a quiet corner and placed a clear sign near the entrance. (17) The new sign helped students understand the purpose of the corner. The librarian sorted requests by age and subject, then compared them with the catalogue. The school bought novels, reference books and licences for two databases. The catalogue also showed which older titles were still borrowed.',
    'The librarian then asked pupils which books and digital resources they needed. (18) Pupils mentioned novels, information books and online reference material. Furniture was moved so younger pupils could read near the window while older students worked near power sockets. A notice explained which areas should remain quiet.',
    'A borrowing card explained opening hours and showed where returned books should go. (19) The card prevented returned books from being left on the wrong shelf. The timetable included homework support after lessons, but reading clubs used the shared area on Wednesdays. Staff taught students how to search the digital catalogue. The arrangement gave every group a clear purpose.',
    'Reading-club volunteers prepared recommendation cards for students who wanted help choosing. (20) By the end of term, the library felt easier to use without becoming silent. The recommendations supported choice rather than giving every reader the same list. A termly survey showed that borrowing rose without reducing study time. The librarian plans to review popular titles whenever students need a different balance.',
],
35: [
    'The wildlife-walk leaders planned an evening route through woodland and wetland. (16) The route included dry woodland and a pond used by water birds. The guide chose a wet spring morning because migrating birds often stopped beside the reed beds. She checked the forecast and prepared a shorter route in case the ground became slippery. The early start reduced disturbance and gave the survey a consistent comparison.',
    'They wanted visitors to observe animals without disturbing their habitats. (17) The habitat notes showed why visitors should not leave the marked path. Participants practised using binoculars and learned why nests should never be approached. A volunteer carried a first-aid kit and emergency contacts. The safety briefing explained how to move slowly on wet ground.',
    'A guide marked places where birds nested and reminded walkers to stay on the path. (18) The guide explained that quiet behaviour gave animals more chance to remain nearby. The group paused at a woodland edge where deer tracks crossed the mud. Nobody spoke while the guide pointed towards a distant heron. The observation was valuable because the group recorded behaviour rather than simply naming the bird.',
    'The group moved quietly and used field notes instead of calling out. (19) Field notes allowed walkers to record evidence without frightening the species they saw. Rain arrived earlier than expected, so the guide led everyone beneath taller trees. They stayed together, avoided the flooded boardwalk and waited until the path was safe. The decision protected both visitors and wildlife.',
    'Seasonal changes gave the leaders different evidence to discuss on each walk. (20) The project now combines careful observation with simple conservation advice for local visitors. The changing seasons made each walk a new lesson about local nature. Back at the centre, notes were added to a seasonal survey. The results showed fewer visits near one nest, giving staff evidence for a temporary quiet zone.',
],
}

// ── Expanded Part 5 passages — add natural context without breaking gaps
const P5_EXP = {
32: `The market opens (21) ........ sunset, when the square becomes cooler. Sellers arrange their tables and check that each light is (22) ........ before visitors arrive. The organisers keep a walkway clear (23) ........ people can reach the bus stop safely. If rain begins, traders move delicate goods (24) ........ the covered arcade, where canvas sheets offer extra shelter. Families often return (25) ........ the food stalls offer small portions and local recipes that appeal to different tastes. The market has become a lively place to meet (26) ........ neighbours and share stories over a warm meal. The organisers weigh leftover food after the stalls close. Sellers donate safe portions to a shelter instead of throwing them away. Visitors are encouraged to carry reusable bags, and signs explain where each waste item should go. These small changes reduce the amount of rubbish collected after midnight and help traders compare which dishes sell well.`,
34: `The librarian checks (21) ........ books have been returned before closing. Students can ask (22) ........ a title or search the digital catalogue. The quiet corner is kept clear (23) ........ pupils can study without interruption. Volunteers place new books (24) ........ the display shelf after they are recorded in the system. Reading clubs meet (25) ........ the final lesson on Fridays, giving members a full hour to discuss their chosen title. The library welcomes (26) ........ student who wants to read or work in a calm environment. The reading club chooses a title to discuss each month. Members explain why they enjoyed a character or an idea, and the librarian records useful recommendations. New students can join even if they have missed the first meeting. The group keeps notes so future members can see earlier choices. Volunteers return every book to its shelf and check the catalogue afterwards.`,
35: `The wildlife guide checks (21) ........ path before the walk begins. Walkers look (22) ........ birds and tracks without leaving the marked route. The leader speaks softly (23) ........ animals are not frightened by sudden noise. When rain arrives, the group waits (24) ........ a sheltered tree where the canopy provides cover. Visitors return (25) ........ they want to compare notes about seasonal changes they have observed. The walk helps people notice (26) ........ habitats need protection from human disturbance. The volunteer survey begins at dawn, when many birds are active. Participants carry binoculars and write notes when they see movement in the reeds. The leader divides the group so each person can watch a small area. If the path is wet, walkers stay on the wooden boards. They compare records after the walk and report unusual behaviour to the reserve team.`,
}

// ── Expanded Part 6 passages — add natural context without breaking gaps
const P6_EXP = {
33: `The group records (27) ........ a path is steep before publishing the map. Riders travel (28) ........ the quiet section and check its surface for loose stones. They can continue, (29) ........ they must slow down at the crossing ahead. Volunteers stop stones (30) ........ being left on the route after the ground has been disturbed by rain. It is a path (31) ........ families can ride together in safety. Everyone remembers (32) ........ carry lights when returning late in the evening. Before using a new route, riders should check whether the weather is suitable for cycling. They should carry a repair kit in case a tyre loses air on a rough section. Cyclists remain on the signed path near the junction. A rider can pass, but only after checking for approaching traffic. The map shows places where families can rest during a long ride. Everyone remembers to signal before turning at any junction.`,
34: `The librarian records (27) ........ books students borrow most often. Pupils can search (28) ........ the digital catalogue before asking for help at the desk. They may study quietly, (29) ........ they must leave the shelves tidy after removing a book. Volunteers prevent returned books (30) ........ being lost in the wrong section before they are checked in. The library is a place (31) ........ students can read together in comfort. Everyone remembers (32) ........ bring a card when borrowing any item. Students should check whether the library is open before arriving after school. They may borrow a book for two weeks unless another reader has reserved it. Quiet areas are for work, but the shared table is available for discussion. Pupils can ask for help if a catalogue search does not find what they need.`,
35: `The guide explains (27) ........ the birds use the wetland before visitors set off along the path. Walkers move (28) ........ the path and keep their voices low at all times. They may stop, (29) ........ they must not enter the nesting area marked with rope. Quiet behaviour prevents animals (30) ........ being disturbed by sudden movements or loud calls. The woodland is a place (31) ........ species can find shelter from weather and predators. Everyone remembers (32) ........ take field notes carefully during each stop. Walkers should check whether the reserve has changed its route after heavy rain. They should bring a waterproof coat and keep equipment dry. Visitors remain near the guide in the wetland area. They may use binoculars, but they must not cross the rope barrier. The notebook is a place where observations should be recorded. Everyone remembers to speak quietly near any visible birds or animals.`,
}

// ── Apply changes ──

for (let n = 32; n <= 35; n++) {
  const d = JSON.parse(readFileSync(DATA(n), 'utf8'))

  // Trim Part 4
  if (P4_TRIM[n]) {
    const p4 = d.parts.find(p => p.partNumber === 4)
    const textBlocks = p4.passage.filter(b => !b.label && b.text)
    const labels = p4.passage.filter(b => b.label)
    const trimmed = P4_TRIM[n].map(t => ({ text: t }))
    p4.passage = [...trimmed, ...labels]
  }

  // Expand Part 5
  if (P5_EXP[n]) {
    const p5 = d.parts.find(p => p.partNumber === 5)
    const labels = p5.passage.filter(b => b.label)
    p5.passage = [{ text: P5_EXP[n] }, ...labels]
  }

  // Expand Part 6
  if (P6_EXP[n]) {
    const p6 = d.parts.find(p => p.partNumber === 6)
    const labels = p6.passage.filter(b => b.label)
    p6.passage = [{ text: P6_EXP[n] }, ...labels]
  }

  writeFileSync(DATA(n), JSON.stringify(d, null, 2) + '\n')

  // Count new word counts
  const p4 = d.parts.find(p => p.partNumber === 4)
  const p5 = d.parts.find(p => p.partNumber === 5)
  const p6 = d.parts.find(p => p.partNumber === 6)
  const p4wc = wc(p4.passage.filter(b => !b.label && b.text).map(b => b.text).join(' '))
  const p5wc = wc(p5.passage.find(b => !b.label && b.text).text)
  const p6wc = wc(p6.passage.find(b => !b.label && b.text).text)

  const p4ok = p4wc >= 300 && p4wc <= 360
  const p5ok = p5wc >= 170
  const p6ok = p6wc >= 150
  console.log(`Test ${n}: P4=${p4wc}${p4ok ? ' OK' : ' TRIM'} | P5=${p5wc}${p5ok ? ' OK' : ' SHORT'} | P6=${p6wc}${p6ok ? ' OK' : ' SHORT'}`)
}
