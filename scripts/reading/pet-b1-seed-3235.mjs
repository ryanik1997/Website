/**
 * Seed content for tests 32-35 Part 4/5/6 into package files.
 * Run: node scripts/reading/pet-b1-seed-3235.mjs
 * Then: node scripts/reading/pet-b1-synth-runtime.mjs
 * Then: node scripts/reading/pet-b1-surgical-tune.mjs (after adjusting P4_TRIMS)
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..', '..')
const DATA = n => resolve(ROOT, `packages/catalog/data/reading-pet-b1-test${n}.json`)

const P4_TEXT = {
32: [
  'The night market organisers began with a short meeting about evening stalls. (16) The organisers listed foods and local crafts that visitors had requested. The council chose the square because buses stopped nearby and residents could walk there after work. Sellers were asked to label ingredients clearly for visitors with allergies. The choice also gave small businesses a fair chance to meet customers who rarely visited the daytime shops.',
  'They wanted visitors to find food and crafts without blocking the narrow square. (17) A simple map showed traders where to set up and visitors where to wait. Before opening, electricians fixed warm lamps above the stalls while organisers placed bins beside the food area. This made the narrow entrance brighter and less crowded. Organisers checked every cable and kept emergency access open behind the busiest row of stalls.',
  'The team marked spaces for sellers and left a clear route towards the bus stop. (18) Volunteers checked the lighting before the first customers arrived. Several traders shared storage space, and a local craft maker demonstrated simple weaving beside the entrance. A small band played briefly, but the stalls remained the main attraction. The craft display gave visitors a quieter reason to stay while cooks served dishes from several neighbourhoods.',
  'When rain was forecast, they tested lights and covered the most exposed tables. (19) The weather test gave sellers time to protect their goods. A sudden shower tested the plan: umbrellas covered the bread and pottery, while volunteers directed visitors towards the covered arcade and checked the last bus time. The transport check mattered because the final buses were less frequent after the market became busy.',
  'The first evening was busy, but the new layout helped people move safely. (20) The market now closes at a fixed time so nearby residents can sleep. The closing routine made the evening easier for everyone nearby. Afterwards, organisers counted visitors and asked nearby residents for comments. They decided to add another bus notice, shorten the queue beside the soup stall and keep the lights on until closing.',
],
33: [
  'The cycle-route group began by asking commuters which roads felt unsafe. (16) The first survey gave the planners evidence instead of relying on guesses. The council compared commuter surveys with accident records before drawing the first proposals. It wanted a route that helped workers as well as families travelling at weekends. The comparison included families with trailers, so the final design was not based only on confident adult riders.',
  'They marked hills, crossings and traffic-free sections on a large map. (17) The map helped riders compare the quiet path with the main road. Engineers measured the surface after rain and found a muddy section near the old mill. They considered a bridge, but a safer diversion cost less. The diversion passed a historic watermill, giving riders a useful landmark as well as a safer surface.',
  'Families then tested a shorter route with a rest stop beside the river. (18) A planned rest made the route manageable for children and less confident cyclists. At one hill, younger riders needed a place to stop and drink. The team added a bench and a warning sign before the steepest part. The bench was placed where riders could see the warning sign before beginning the difficult climb.',
  'One sign was difficult to see behind a tree, so the group moved it before publishing the map. (19) Moving the sign made the instruction visible before riders reached the crossing. Volunteers rode the route with maps and reported a hidden junction. A brighter sign and a painted line made the turn easier to understand. The report included photographs, making it easier for maintenance workers to find the hidden junction later.',
  'The revised route suited both regular riders and people returning to cycling. (20) It also connected several local landmarks without sending riders through the busiest junction. The final route offered a practical alternative to the busy junction. After the opening, commuters used the quieter path regularly. The council still records repairs and weather damage so that the map can be updated each spring.',
],
34: [
  'The school library team wanted more students to use its reading spaces. (16) The team first compared the busy library with the quieter study room. Before the work began, books were mixed together and the only table was often reserved for meetings. Students said they needed both quiet study space and somewhere to share ideas. This evidence helped the school separate furniture problems from requests for more books and better online access.',
  'They moved shelves to create a quiet corner and placed a clear sign near the entrance. (17) The new sign helped students understand the purpose of the corner. The librarian sorted requests by age and subject, then compared them with the catalogue. The school bought novels, reference books and licences for two useful databases. The catalogue also showed which older titles were still borrowed, so useful books were not removed simply because they looked old.',
  'The librarian then asked pupils which books and digital resources they needed. (18) Pupils mentioned novels, information books and online reference material. Furniture was moved so younger pupils could read near the window while older students worked near power sockets. A notice explained which areas should remain quiet. Power sockets were positioned away from the quietest seats, reducing noise when students charged devices.',
  'A borrowing card explained opening hours and showed where returned books should go. (19) The card prevented returned books from being left on the wrong shelf. The timetable included homework support after lessons, but reading clubs used the shared area on Wednesdays. Staff also taught students how to search the digital catalogue. The arrangement gave every group a clear purpose and stopped homework support from disturbing readers.',
  'Reading-club volunteers prepared recommendation cards for students who wanted help choosing. (20) By the end of term, the library felt easier to use without becoming silent or unfriendly. The recommendations supported choice rather than giving every reader the same list. A termly survey showed that borrowing rose without reducing study time. The librarian plans to review popular titles and change the layout whenever students need a different balance.',
],
35: [
  'The wildlife-walk leaders planned an evening route through woodland and wetland. (16) The route included dry woodland and a pond used by water birds. The guide chose a wet spring morning because migrating birds often stopped beside the reed beds. She checked the forecast and prepared a shorter route in case the ground became slippery. The early start also reduced disturbance from later visitors and gave the survey a consistent comparison point.',
  'They wanted visitors to observe animals without disturbing their habitats. (17) The habitat notes showed why visitors should not leave the marked path. Before setting off, participants practised using binoculars and learned why nests should never be approached. A volunteer carried a first-aid kit and a list of emergency contacts. The safety briefing explained how to move slowly on wet ground and what to do if someone became separated.',
  'A guide marked places where birds nested and reminded walkers to stay on the path. (18) The guide explained that quiet behaviour gave animals more chance to remain nearby. The group paused at a woodland edge where deer tracks crossed the mud. Nobody spoke while the guide pointed towards a distant heron, and several walkers recorded its behaviour. The observation was valuable because the group recorded location, time and behaviour rather than simply naming the bird.',
  'The group moved quietly and used field notes instead of calling out when something appeared. (19) Field notes allowed walkers to record evidence without frightening the species they saw. Rain arrived earlier than expected, so the guide led everyone beneath taller trees. They stayed together, avoided the flooded boardwalk and waited until the path was safe. The decision protected both visitors and wildlife, and nobody needed to leave the route in search of a better view.',
  'Seasonal changes gave the leaders different evidence to discuss on each walk. (20) The project now combines careful observation with simple conservation advice for local visitors. The changing seasons made each walk a new lesson about local nature. Back at the centre, the notes were added to a seasonal survey. The results showed fewer visits near one nest, giving conservation staff evidence for a temporary quiet zone.',
],
}

// Part 5: preserve original gap-text + expand with natural passage
const P5_TEXT = {
32: `The market opens (21) ........ sunset, when the square becomes cooler. Sellers arrange their tables and check that each light is (22) ........ working before visitors arrive. The organisers keep a walkway clear (23) ........ people can reach the bus stop safely through the crowd. If rain begins, traders move delicate goods (24) ........ the covered arcade where canvas sheets provide extra shelter. Families often return (25) ........ the food stalls offer small portions and local recipes that appeal to different tastes. The market has become a lively place to meet (26) ........ neighbours and share stories over a warm meal. The organisers weigh leftover food after the stalls close at night. Sellers donate safe portions to a shelter instead of throwing them away. Visitors are encouraged to carry reusable bags when they come to shop. Signs explain where each waste item should go after use. These small changes reduce the amount of rubbish collected after midnight each week. They help traders compare which dishes sell best, so next month they can prepare more accurately.`,
33: `The cycling group checks (21) ........ route before recommending it to families with children. Riders are asked to look (22) ........ signs and slow down near crossings and junctions. The organisers add a rest stop (23) ........ longer journeys do not become exhausting for younger cyclists. After heavy rain, they report loose stones (24) ........ the bridge so repairs can be arranged quickly. Commuters use the route (25) ........ it avoids the busiest road and makes the journey safer. The map helps people travel safely and notice (26) ........ landmarks and rest points along the way. The school group practises hand signals before its first long ride together. Pupils check their brakes and tyres, then study the map in pairs. A teacher chooses a quiet section so everyone can gain confidence. The group stops whenever a crossing is busy and waits for the signal. After the ride, pupils mark rough surfaces for the council to inspect.`,
34: `The librarian checks (21) ........ books have been returned before closing each evening. Students can ask (22) ........ a title or search the digital catalogue from any computer. The quiet corner is kept clear (23) ........ pupils can study without interruption from group work. Volunteers place new books (24) ........ the display shelf after they are recorded in the system. Reading clubs meet (25) ........ the final lesson on Fridays, giving members a full hour for discussion. The library welcomes (26) ........ student who wants to read or work in a calm environment. The reading club chooses a title to discuss each month. Members explain what they enjoyed about a character or an idea. The librarian records useful recommendations for other readers. New students can join even if they have missed the first meeting of the term.`,
35: `The wildlife guide checks (21) ........ path before the walk begins each morning. Walkers look (22) ........ birds and tracks without leaving the marked route through the habitat. The leader speaks softly (23) ........ animals are not frightened by human voices passing by. When rain arrives, the group waits (24) ........ a sheltered tree where the canopy provides natural cover. Visitors return (25) ........ they want to compare notes about seasonal changes they have noticed over time. The walk helps people notice (26) ........ habitats need protection from disturbance. The volunteer survey begins at dawn, when many birds are active and easy to spot. Participants carry binoculars and write notes when they see movement in the reeds. The leader divides the group so each person can watch a different area. If the path is wet, walkers stay on the wooden boards to protect the ground.`,
}

const P6_TEXT = {
32: `The market organisers check (27) ........ the lights are working before the first visitors arrive. Sellers are asked to arrive (28) ........ sunset, so tables can be arranged safely in the square. Visitors may stay after dark, (29) ........ they must keep the bus route clear of bags and boxes. Traders protect their food (30) ........ being spoiled by sudden rain using canvas covers. The square is a place (31) ........ neighbours from different streets can meet and talk. Everyone remembers (32) ........ take their rubbish home when they leave. A visitor should check whether the market is open before leaving home on the day. It is sensible to carry a light jacket because weather can change quickly in the evening. People should walk along the marked route and keep bags close in a crowd. Anyone travelling home late should check the final bus time. The organisers ask visitors to leave empty cups in the bins provided. A calm plan makes the evening more enjoyable for everyone who attends.`,
33: `The group records (27) ........ a path is steep before publishing the map for other riders. Riders travel (28) ........ the quiet section and check its surface for loose stones and mud. They can continue, (29) ........ they must slow down at the crossing near the old bridge. Volunteers stop stones (30) ........ being left on the route after heavy rain washes them onto the path. It is a path (31) ........ families with children can ride together in reasonable safety. Everyone remembers (32) ........ carry lights when returning late in the evening. Before using a new route, riders should check whether the weather is suitable for cycling. They should carry a repair kit in case a tyre loses air on a rough section. Cyclists remain on the signed path near the junction and signal before turning. The map shows places where families can rest during a long ride. Everyone remembers to check for traffic before crossing any road. A small pump and a charged phone are useful because help may be far away on a rural section.`,
34: `The librarian records (27) ........ books students borrow most often during each term. Pupils can search (28) ........ the digital catalogue before asking for help at the front desk. They may study quietly in the reading area, (29) ........ they must leave the shelves tidy after removing a book. Volunteers prevent returned books (30) ........ being lost in the wrong section before staff can check them in. The library is a place (31) ........ students of all ages can read together in a calm space. Everyone remembers (32) ........ bring their library card when borrowing any item. Students should check whether the library is open before arriving after school. They may borrow a book for two weeks unless another reader has reserved it. Quiet areas are for individual work, but the shared table is available for group discussion. Pupils can ask for help if the catalogue search does not find what they need. The librarian keeps a list where students can suggest new titles for the collection.`,
35: `The guide explains (27) ........ the birds use the wetland at different times of year before visitors set off along the path. Walkers move (28) ........ the marked path and keep their voices low at all times near the habitat. They may stop to observe, (29) ........ they must not enter the nesting area marked with rope and signs. Quiet behaviour prevents animals (30) ........ being disturbed by sudden movements or loud conversations. The woodland is a place (31) ........ many species can find shelter from weather and larger predators. Everyone remembers (32) ........ take field notes carefully during each stop along the way. Walkers should check whether the reserve has changed its route after heavy rain or flooding. They should bring a waterproof coat and keep binoculars dry during showers. Visitors remain near the guide in the wetland area. They may use binoculars, but they must not cross the rope barrier near nesting sites. The notebook is a place where observations should be recorded carefully.`,
}

function cw(text) {
  if (!text) return 0
  let t = text.replace(/\(\d+\)(?:\s*\.{2,})?/g, ' ').replace(/\s+/g, ' ').trim()
  return t ? t.split(' ').length : 0
}

for (let n = 32; n <= 35; n++) {
  const d = JSON.parse(readFileSync(DATA(n), 'utf8'))

  // Part 4 — replace with 5 blocks
  if (P4_TEXT[n]) {
    const p4 = d.parts.find(p => p.partNumber === 4)
    const labels = p4.passage.filter(b => b.label)
    p4.passage = P4_TEXT[n].map(t => ({ text: t }))
    labels.forEach(l => p4.passage.push(l))
    p4.passageTitle = {
      32: 'Part 4 – A night market',
      33: 'Part 4 – Planning cycle routes',
      34: 'Part 4 – Improving school libraries',
      35: 'Part 4 – Wildlife walks',
    }[n]
  }

  // Part 5
  if (P5_TEXT[n]) {
    const p5 = d.parts.find(p => p.partNumber === 5)
    const labels = p5.passage.filter(b => b.label)
    p5.passage = [{ text: P5_TEXT[n] }, ...labels]
  }

  // Part 6
  if (P6_TEXT[n]) {
    const p6 = d.parts.find(p => p.partNumber === 6)
    const labels = p6.passage.filter(b => b.label)
    p6.passage = [{ text: P6_TEXT[n] }, ...labels]
  }

  writeFileSync(DATA(n), JSON.stringify(d, null, 2) + '\n')

  const p4wc = cw(d.parts.find(p => p.partNumber === 4).passage.filter(b => !b.label && b.text).map(b => b.text).join(' '))
  const p5wc = cw(d.parts.find(p => p.partNumber === 5).passage.find(b => !b.label && b.text).text)
  const p6wc = cw(d.parts.find(p => p.partNumber === 6).passage.find(b => !b.label && b.text).text)
  console.log(`Test ${n}: P4=${p4wc} P5=${p5wc} P6=${p6wc}`)
}
