/**
 * Final expansion pass — unique per-test additions to hit word targets.
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..', '..')

const DATA = n => resolve(ROOT, `packages/catalog/data/reading-pet-b1-test${n}.json`)

// Unique additional text for each test Part 5 (append after last gap)
const P5_TAILS = {
20: ' The competition also inspired several other students to take up photography as a hobby, and the art teacher started a weekly photography club that meets every Friday afternoon after lessons finish.',
21: ' Several parents who attended the fair said they had learned something new, and the science department has already started planning an even bigger event for next year with more experiments and demonstrations.',
22: ' The experience of performing on stage in front of a live audience gave me much more confidence in my speaking ability, and I have now joined the drama club permanently to continue developing my skills.',
23: ' The local council has even contacted our group to ask for advice on starting similar programmes in other neighbourhoods, which shows how successful our initiative has been in the area.',
24: ' Many of my classmates said the visit had changed the way they thought about history, and our teacher has promised to organise another trip to a different museum next term if we finish our projects on time.',
25: ' The victory was celebrated by the whole school, and our team was invited to represent the region in the national championship next month, which is an incredible honour for all of us.',
26: ' The festival organisers have already confirmed that the event will return next year, and they have promised to add two more stages with even more diverse musical acts from around the country.',
27: ' Several local businesses have offered to sponsor future clean-up events, and the council has promised to install more rubbish bins along the beach to make it easier for visitors to dispose of their waste properly.',
28: ' I have started practising new recipes at home every weekend, and my family has been enjoying the opportunity to taste different dishes from around the world that I prepare for them.',
29: ' My grandfather\'s garden has become a gathering place for the whole family on weekends, and his neighbours have started bringing their own plants to exchange, creating a small community of gardeners on our street.',
}

const P6_TAILS = {
20: ' Reading has become an even bigger part of my life since joining the club, and I have discovered authors I would never have found on my own without the recommendations from other members.',
21: ' Learning to swim as an adult taught me that it is never too late to try something new, and I now encourage my friends to take up hobbies they have always been curious about but never tried.',
22: ' The camping trip taught our family to be more prepared and to expect the unexpected when travelling, and we have already started planning a longer trip to Scotland for next summer with better equipment.',
23: ' Photography has opened my eyes to the beauty of ordinary things around me, and I now carry a camera everywhere I go so I never miss a good shot during my daily activities.',
24: ' The exchange experience made me more independent and confident in my ability to communicate with people from different cultures, which will be very useful for my future studies and career.',
25: ' The success of our recycling project has made me more aware of my own environmental impact at home, and I now try to reduce waste in every aspect of my daily life as much as possible.',
26: ' Learning a new language has been challenging but incredibly rewarding, and I can already hold simple conversations with native speakers I meet online through language exchange websites.',
27: ' The hiking trip brought my friends and me closer together, and we have already started planning our next adventure, which will be a longer three-day hike in a more remote mountainous area.',
28: ' Being part of the drama club has helped me overcome my fear of public speaking, and I now feel much more comfortable presenting in front of my class during regular school lessons.',
29: ' Looking back, I am grateful that Sara sat next to me that day, and I have learned that being the new person is only temporary — soon enough, you find your place and your people.',
}

for (let n = 20; n <= 29; n++) {
  const d = JSON.parse(readFileSync(DATA(n), 'utf8'))

  // Expand Part 5 tail
  const p5 = d.parts.find(p => p.partNumber === 5)
  if (p5 && P5_TAILS[n]) {
    const textBlock = p5.passage.find(b => !b.label && b.text)
    if (textBlock) textBlock.text += P5_TAILS[n]
  }

  // Expand Part 6 tail
  const p6 = d.parts.find(p => p.partNumber === 6)
  if (p6 && P6_TAILS[n]) {
    const textBlock = p6.passage.find(b => !b.label && b.text)
    if (textBlock) textBlock.text += P6_TAILS[n]
  }

  writeFileSync(DATA(n), JSON.stringify(d, null, 2) + '\n')
  console.log(`Test ${n} tail expanded`)
}
