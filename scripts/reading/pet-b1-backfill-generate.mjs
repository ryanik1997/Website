/**
 * PET B1 Quality Backfill — Content Generator for Tests 20-29 Part 4, 5, 6.
 * Run: node scripts/reading/pet-b1-backfill-generate.mjs
 *
 * Reads existing package JSON, replaces Part 4/5/6 content, writes back.
 * Also generates updated answer vault for the new content.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..', '..')
const DATA = p => resolve(ROOT, `packages/catalog/data/reading-pet-b1-test${p}.json`)
const VAULT = p => resolve(ROOT, `apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${p}.answers.json`)
const RUNTIME = p => resolve(ROOT, `apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${p}.json`)

/* ── Content definitions ────────────────────────────── */

const CONTENT = {

// ═══════════════ TEST 20 ═══════════════

20: {
  p4: {
    title: 'Part 4 – Starting a community garden',
    paragraphs: [
      'The idea for a community garden first came up at a residents\' meeting last spring. (16) ..... Many families in our street had no outdoor space of their own.',
      'A local business agreed to donate soil and seeds for the first season. (17) ..... The council also gave permission to use the empty land behind the old supermarket.',
      'Volunteers of all ages arrived on the first Saturday morning. (18) ..... Some people brought tools from home, while others simply offered to make tea for the team.',
      'By the middle of summer, the garden was full of tomatoes, lettuce and herbs. (19) ..... Neighbours who had never spoken before began exchanging recipes and gardening tips.',
      'Now the garden is a central part of the neighbourhood. (20) ..... We even hold outdoor cooking classes there during the warmer months.',
    ],
    options: [
      { label: 'A', text: 'The land had been empty for over five years.' },
      { label: 'B', text: 'This made it possible to start preparing the ground immediately.' },
      { label: 'C', text: 'Everyone worked together despite the rainy weather.' },
      { label: 'D', text: 'The garden created friendships that went far beyond planting.' },
      { label: 'E', text: 'It has become a place where people meet and share skills.' },
      { label: 'F', text: 'The supermarket refused to support the project.' },
      { label: 'G', text: 'Most residents preferred to buy vegetables from the shop.' },
      { label: 'H', text: 'No one attended the first meeting about the garden.' },
    ],
    answers: { 16: 'a', 17: 'b', 18: 'c', 19: 'd', 20: 'e' },
  },
  p5: {
    title: 'Part 5 – A photography competition',
    text: 'Our school organised a photography competition last month. The rules stated that every photo (21) ..... to be taken within the town. We had two weeks (22) ..... the deadline, which gave everyone enough time to prepare. The judges were looking for original ideas rather (23) ..... technical skill. My best picture was (24) ..... a cat sitting on an old wall, and I was surprised when it won second place. (25) ..... the winners were announced, the head teacher invited a local photographer to give a talk. Many students said they (26) ..... never thought about photography as a career before that day.',
    questions: [
      { num: 21, opts: { A: 'had', B: 'must', C: 'needs', D: 'did' }, ans: 'A', lang: 'modal-verb', why: 'had to expresses obligation in past tense.' },
      { num: 22, opts: { A: 'until', B: 'before', C: 'after', D: 'since' }, ans: 'B', lang: 'preposition-time', why: 'before the deadline means earlier than the deadline.' },
      { num: 23, opts: { A: 'from', B: 'then', C: 'than', D: 'as' }, ans: 'C', lang: 'comparison', why: 'rather than is a fixed comparative expression.' },
      { num: 24, opts: { A: 'of', B: 'by', C: 'for', D: 'with' }, ans: 'A', lang: 'preposition', why: 'a picture of something is the correct collocation.' },
      { num: 25, opts: { A: 'While', B: 'Until', C: 'When', D: 'Unless' }, ans: 'C', lang: 'linking-word', why: 'When indicates the moment the winners were announced.' },
      { num: 26, opts: { A: 'have', B: 'would', C: 'did', D: 'had' }, ans: 'D', lang: 'past-perfect', why: 'had never thought is correct past perfect for action before that day.' },
    ],
  },
  p6: {
    title: 'Part 6 – Joining a book club',
    text: 'When I first joined the school book club, I was nervous because I did not know (27) ........ else who enjoyed reading. The club met every Tuesday, and we took turns choosing (28) ........ book to discuss. My first choice was a mystery novel (29) ........ my older brother had recommended. During the discussion, I was surprised to discover (30) ........ most members had already read it. The group leader asked us to prepare three questions (31) ........ advance for each meeting. Now I look forward to Tuesdays more (32) ........ any other day of the week.',
    answers: [
      { num: 27, ans: 'anyone', cat: 'pronoun', why: 'anyone is used in negative contexts to mean any person.' },
      { num: 28, ans: 'which', cat: 'determiner', why: 'which book indicates a choice from a limited set.' },
      { num: 29, ans: 'that', cat: 'relative-word', why: 'that introduces a defining relative clause.' },
      { num: 30, ans: 'that', cat: 'conjunction', why: 'that introduces the clause after discover.' },
      { num: 31, ans: 'in', cat: 'preposition', why: 'in advance is a fixed phrase meaning beforehand.' },
      { num: 32, ans: 'than', cat: 'conjunction', why: 'more than is the standard comparative structure.' },
    ],
  },
},

// ═══════════════ TEST 21 ═══════════════

21: {
  p4: {
    title: 'Part 4 – Learning to play guitar',
    paragraphs: [
      'I had always wanted to learn the guitar, but I never seemed to find the right moment to start. (16) ..... One day, my neighbour offered to teach me a few chords in exchange for help with his English homework.',
      'My first lesson was harder than I expected. (17) ..... My fingers hurt from pressing the strings, and I could not change chords quickly enough.',
      'After a few weeks of regular practice, things began to improve. (18) ..... I could finally play a whole song without stopping, which felt like a real achievement.',
      'My neighbour suggested that I perform at the school talent show. (19) ..... I was terrified, but I agreed to play a simple piece in front of the audience.',
      'The performance went better than I had hoped. (20) ..... Now I am saving up to buy my own electric guitar so I can keep improving.',
    ],
    options: [
      { label: 'A', text: 'The deal seemed fair, so I accepted his offer immediately.' },
      { label: 'B', text: 'The pain made me want to give up after only three days.' },
      { label: 'C', text: 'That moment of success motivated me to practise even more.' },
      { label: 'D', text: 'My hands were shaking as I walked onto the stage.' },
      { label: 'E', text: 'Playing music has become my favourite way to relax after school.' },
      { label: 'F', text: 'My neighbour preferred playing classical pieces only.' },
      { label: 'G', text: 'The school had no music programme at that time.' },
      { label: 'H', text: 'I decided to stop playing after the first lesson.' },
    ],
    answers: { 16: 'a', 17: 'b', 18: 'c', 19: 'd', 20: 'e' },
  },
  p5: {
    title: 'Part 5 – A school science fair',
    text: 'Our school science fair took place in the main hall this year. Each class (21) ..... to create an experiment that demonstrated an everyday scientific principle. My group decided to build a small volcano (22 ..... baking soda and vinegar. We tested it several times (23) ..... the big day to make sure it worked properly. The volcano erupted perfectly, (24) ..... a crowd of younger students gathered around our table. One teacher was so impressed (25) ..... she asked us to present our experiment to the whole school during assembly. It was (26) ..... a successful project that we decided to enter a regional competition.',
    questions: [
      { num: 21, opts: { A: 'must', B: 'had', C: 'needs', D: 'should' }, ans: 'B', lang: 'modal-verb', why: 'had to expresses past obligation.' },
      { num: 22, opts: { A: 'by', B: 'from', C: 'using', D: 'with' }, ans: 'C', lang: 'verb-choice', why: 'using indicates the method or material employed.' },
      { num: 23, opts: { A: 'after', B: 'before', C: 'since', D: 'during' }, ans: 'B', lang: 'preposition-time', why: 'tested before the big day means earlier than the event.' },
      { num: 24, opts: { A: 'nor', B: 'or', C: 'and', D: 'but' }, ans: 'C', lang: 'linking-word', why: 'and connects two related positive events.' },
      { num: 25, opts: { A: 'which', B: 'what', C: 'that', D: 'so' }, ans: 'C', lang: 'result-clause', why: 'so that is the structure for result clauses.' },
      { num: 26, opts: { A: 'such', B: 'too', C: 'very', D: 'so' }, ans: 'A', lang: 'intensifier', why: 'such a successful project is the correct pattern.' },
    ],
  },
  p6: {
    title: 'Part 6 – Learning to swim as an adult',
    text: 'I decided to learn how to swim at the age of twenty-five. Most of (27) ........ friends had already learned when they were children, so I felt embarrassed. I signed (28) ........ for a beginner class at the local sports centre. The instructor was very patient and never made me (29) ........ rushed. After a few weeks, I could float on my back without (30) ........ any help. The first time I swam a full length, I felt so proud (31) ........ I phoned my mother immediately. Now I go to the pool twice a week, and I wonder why (32) ........ took me so long to start.',
    answers: [
      { num: 27, ans: 'my', cat: 'determiner', why: 'my friends indicates possession.' },
      { num: 28, ans: 'up', cat: 'phrasal-verb', why: 'sign up is a phrasal verb meaning to enrol.' },
      { num: 29, ans: 'feel', cat: 'verb-pattern', why: 'make + object + bare infinitive (feel).' },
      { num: 30, ans: 'any', cat: 'determiner', why: 'without any help uses any in a negative context.' },
      { num: 31, ans: 'that', cat: 'conjunction', why: 'so proud that introduces a result clause.' },
      { num: 32, ans: 'it', cat: 'pronoun', why: 'it took me so long uses it as a dummy subject.' },
    ],
  },
},

// ═══════════════ TEST 22 ═══════════════

22: {
  p4: {
    title: 'Part 4 – Organising a charity fun run',
    paragraphs: [
      'When our teacher suggested organising a charity fun run, most of us thought it was a crazy idea. (16) ..... However, a small group of students decided to give it a try and formed a planning committee.',
      'The first challenge was to find a suitable route through the town. (17) ..... We measured the distance with a smartphone app and printed simple maps for the runners.',
      'On the morning of the event, the weather was cold but dry. (18) ..... About sixty people gathered at the starting line, including several teachers and parents.',
      'The run went smoothly, and everyone who finished received a medal made by the art club. (19) ..... Some runners were so tired that they collapsed on the grass at the finish line.',
      'In total, we raised over two thousand pounds for a local animal shelter. (20) ..... The experience taught us that a small idea can grow into something meaningful with enough effort.',
    ],
    options: [
      { label: 'A', text: 'Many students were against the idea at first.' },
      { label: 'B', text: 'We checked the route carefully to avoid busy roads.' },
      { label: 'C', text: 'The atmosphere was exciting, with music playing near the start.' },
      { label: 'D', text: 'Despite their exhaustion, everyone was smiling and proud.' },
      { label: 'E', text: 'We have already started planning next year\'s event.' },
      { label: 'F', text: 'The teacher cancelled the event due to bad weather.' },
      { label: 'G', text: 'No one wanted to participate in the run.' },
      { label: 'H', text: 'The medals were bought from a shop in town.' },
    ],
    answers: { 16: 'a', 17: 'b', 18: 'c', 19: 'd', 20: 'e' },
  },
  p5: {
    title: 'Part 5 – A local theatre production',
    text: 'Our drama group decided to put (21) ..... a production of a popular children\'s story. The rehearsals lasted for three months, and everyone had to learn their lines (22) ..... heart. The director, (23) ..... was a professional actress, helped us develop our characters. On the opening night, I was (24) ..... nervous that I almost forgot to go on stage. But as soon as I heard the audience clapping, I relaxed and enjoyed (25) ..... performance. The show was (26) ..... a big success that the local newspaper wrote an article about our group.',
    questions: [
      { num: 21, opts: { A: 'up', B: 'on', C: 'off', D: 'in' }, ans: 'B', lang: 'phrasal-verb', why: 'put on a production means to stage or perform it.' },
      { num: 22, opts: { A: 'by', B: 'to', C: 'in', D: 'from' }, ans: 'A', lang: 'fixed-expression', why: 'learn by heart means memorise completely.' },
      { num: 23, opts: { A: 'which', B: 'who', C: 'what', D: 'whose' }, ans: 'B', lang: 'relative-pronoun', why: 'who refers to the director, a person.' },
      { num: 24, opts: { A: 'such', B: 'too', C: 'very', D: 'so' }, ans: 'D', lang: 'intensifier', why: 'so nervous that is the correct result structure.' },
      { num: 25, opts: { A: 'a', B: 'an', C: 'the', D: 'no' }, ans: 'C', lang: 'article', why: 'the performance refers to the specific one we were in.' },
      { num: 26, opts: { A: 'such', B: 'so', C: 'too', D: 'very' }, ans: 'A', lang: 'intensifier', why: 'such a big success that is the correct pattern.' },
    ],
  },
  p6: {
    title: 'Part 6 – A family camping trip',
    text: 'Last summer, my family went on a camping trip to the Lake District. We had never been camping (27) ........, so we borrowed most of the equipment from our neighbours. On the first night, it rained (28) ........ heavily that water came through the tent. My dad tried to fix the problem with a plastic sheet, (29) ........ it did not help much. The next morning, we discovered (30) ........ the campsite had a small café that served excellent breakfasts. After (31) ........, the weather improved, and we spent the rest of the week hiking and swimming. I would love to go back there (32) ........ summer if we can find cheaper accommodation.',
    answers: [
      { num: 27, ans: 'before', cat: 'adverb', why: 'before indicates lack of prior experience.' },
      { num: 28, ans: 'so', cat: 'intensifier', why: 'so heavily that introduces a result clause.' },
      { num: 29, ans: 'but', cat: 'conjunction', why: 'but contrasts the attempted fix with its failure.' },
      { num: 30, ans: 'that', cat: 'conjunction', why: 'that introduces the clause after discovered.' },
      { num: 31, ans: 'that', cat: 'pronoun', why: 'after that refers to the previously mentioned event.' },
      { num: 32, ans: 'next', cat: 'determiner', why: 'next summer indicates the following year\'s summer.' },
    ],
  },
},

// ═══════════════ TEST 23 ═══════════════

23: {
  p4: {
    title: 'Part 4 – Building a treehouse',
    paragraphs: [
      'My cousin and I spent an entire summer planning our dream treehouse in the old oak tree at the bottom of the garden. (16) ..... We drew designs on scrap paper and calculated how much wood we would need.',
      'Our parents agreed to help, but only if we saved half the money ourselves. (17) ..... We washed cars and walked dogs for neighbours until we had enough.',
      'Building the platform was the hardest part because the tree trunk was uneven. (18) ..... My uncle, who is a carpenter, came over to show us how to level the surface properly.',
      'Once the walls and roof were up, we added personal touches. (19) ..... We painted the inside blue and hung a solar lantern from the ceiling.',
      'The finished treehouse became our secret meeting place. (20) ..... We spent every weekend there, reading comics and planning our next adventure.',
    ],
    options: [
      { label: 'A', text: 'Every spare moment went into perfecting the designs.' },
      { label: 'B', text: 'Earning the money taught us the value of hard work.' },
      { label: 'C', text: 'His expert advice saved us from making dangerous mistakes.' },
      { label: 'D', text: 'The lantern gave the space a warm and cosy feel.' },
      { label: 'E', text: 'It remains one of my favourite places in the world.' },
      { label: 'F', text: 'We hired a professional builder to do all the work.' },
      { label: 'G', text: 'The tree had to be cut down because of disease.' },
      { label: 'H', text: 'My cousin lost interest after the first week.' },
    ],
    answers: { 16: 'a', 17: 'b', 18: 'c', 19: 'd', 20: 'e' },
  },
  p5: {
    title: 'Part 5 – A recycling initiative',
    text: 'Our neighbourhood started a recycling programme last year, and the results have been impressive. Every household received a special bin (21) ..... plastic and paper waste. At first, some residents were confused about (22) ..... to recycle certain items. Volunteers went door to door, explaining the system (23) ..... everyone understood it. Within six months, the amount of waste sent to landfill had decreased (24) ..... almost half. The success of the programme encouraged other areas to start (25) ..... own recycling schemes. It just goes to show (26) ..... a community can achieve when it works together.',
    questions: [
      { num: 21, opts: { A: 'of', B: 'to', C: 'for', D: 'by' }, ans: 'C', lang: 'preposition', why: 'a bin for plastic indicates its purpose.' },
      { num: 22, opts: { A: 'what', B: 'how', C: 'which', D: 'where' }, ans: 'B', lang: 'question-word', why: 'how to recycle indicates the method.' },
      { num: 23, opts: { A: 'until', B: 'while', C: 'when', D: 'before' }, ans: 'A', lang: 'linking-word', why: 'until indicates continuing the action up to a point.' },
      { num: 24, opts: { A: 'to', B: 'by', C: 'in', D: 'for' }, ans: 'B', lang: 'preposition', why: 'decreased by indicates the amount of reduction.' },
      { num: 25, opts: { A: 'his', B: 'her', C: 'its', D: 'their' }, ans: 'D', lang: 'possessive-pronoun', why: 'their own refers to other areas (plural).' },
      { num: 26, opts: { A: 'that', B: 'which', C: 'what', D: 'how' }, ans: 'C', lang: 'linking-word', why: 'what a community can achieve is a noun clause.' },
    ],
  },
  p6: {
    title: 'Part 6 – Learning photography',
    text: 'I borrowed my brother\'s camera last month and discovered a new hobby. I knew very little (27) ........ photography, so I watched several tutorials online. The first photos I took were blurry, (28) ........ I did not let that discourage me. My brother suggested that I practise (29) ........ the same object from different angles every day. After a week, I started to understand (30) ........ light affects the mood of a picture. I am now saving money to buy (31) ........ own camera. Everyone tells me (32) ........ I have a natural eye for composition, which makes me very happy.',
    answers: [
      { num: 27, ans: 'about', cat: 'preposition', why: 'know about indicates having knowledge of a subject.' },
      { num: 28, ans: 'but', cat: 'conjunction', why: 'but contrasts the problem with the reaction.' },
      { num: 29, ans: 'photographing', cat: 'gerund', why: 'practise + gerund (photographing) is the correct pattern.' },
      { num: 30, ans: 'how', cat: 'linking-word', why: 'how light affects introduces an indirect question.' },
      { num: 31, ans: 'my', cat: 'determiner', why: 'my own camera indicates personal possession.' },
      { num: 32, ans: 'that', cat: 'conjunction', why: 'that introduces the reported statement after tells me.' },
    ],
  },
},

// ═══════════════ TEST 24 ═══════════════

24: {
  p4: {
    title: 'Part 4 – Starting a small online business',
    paragraphs: [
      'When I was fifteen, I started selling handmade bracelets online. (16) ..... My mother taught me how to weave the patterns, and I practised every evening after finishing my homework.',
      'The first month was disappointing because only three people placed orders. (17) ..... I realised I needed better photographs and clearer product descriptions.',
      'I redesigned my online shop and asked a friend to model the bracelets. (18) ..... Sales slowly began to increase as more customers left positive reviews.',
      'By the end of the second year, I was making enough money to cover my school expenses. (19) ..... My parents were proud that I had built something from nothing.',
      'Running the business taught me valuable lessons about customer service and time management. (20) ..... I plan to study business at university and expand my shop even further.',
    ],
    options: [
      { label: 'A', text: 'It started as a simple hobby that grew into something more.' },
      { label: 'B', text: 'Improving the photos made a significant difference to sales.' },
      { label: 'C', text: 'Her help made the products look more attractive to buyers.' },
      { label: 'D', text: 'Their support gave me the confidence to continue.' },
      { label: 'E', text: 'This experience has shaped my future career ambitions.' },
      { label: 'F', text: 'I decided to close the shop after the first month.' },
      { label: 'G', text: 'My mother did not approve of my business idea.' },
      { label: 'H', text: 'The school banned students from selling items online.' },
    ],
    answers: { 16: 'a', 17: 'b', 18: 'c', 19: 'd', 20: 'e' },
  },
  p5: {
    title: 'Part 5 – A museum visit',
    text: 'Last Saturday, our history class visited the city museum. The exhibition focused (21) ..... daily life during the Victorian period. Our guide showed us a recreation of a Victorian kitchen, (22) ..... looked surprisingly modern. We were allowed to touch some of the objects, (23) ..... was unusual for a museum. I was particularly interested (24) ..... the old schoolroom with its wooden desks and chalkboards. The guide explained (25) ..... children in those days had to write with quill pens. The visit made me realise (26) ..... lucky we are to have modern technology in our classrooms.',
    questions: [
      { num: 21, opts: { A: 'in', B: 'at', C: 'on', D: 'about' }, ans: 'C', lang: 'preposition', why: 'focused on is the correct collocation.' },
      { num: 22, opts: { A: 'that', B: 'which', C: 'what', D: 'who' }, ans: 'B', lang: 'relative-pronoun', why: 'which refers to the kitchen and adds information.' },
      { num: 23, opts: { A: 'that', B: 'what', C: 'which', D: 'who' }, ans: 'C', lang: 'relative-pronoun', why: 'which refers to the whole previous clause.' },
      { num: 24, opts: { A: 'in', B: 'on', C: 'at', D: 'for' }, ans: 'A', lang: 'preposition', why: 'interested in is the correct collocation.' },
      { num: 25, opts: { A: 'that', B: 'what', C: 'how', D: 'if' }, ans: 'A', lang: 'conjunction', why: 'that introduces the reported clause.' },
      { num: 26, opts: { A: 'how', B: 'what', C: 'that', D: 'so' }, ans: 'A', lang: 'exclamation', why: 'how lucky indicates degree in an exclamation.' },
    ],
  },
  p6: {
    title: 'Part 6 – A school exchange trip',
    text: 'Last spring, I went on a school exchange to a town in southern France. I had studied French (27) ........ three years at school, but speaking with real French people was much harder. My host family was very welcoming, even (28) ........ my pronunciation was terrible at first. Every morning, I walked to school (29) ........ my host brother, who showed me the best places to buy lunch. By the end of (30) ........ first week, I could order food in a café without feeling nervous. The experience improved my French so (31) ........ that my teacher noticed the difference when I returned. I hope to visit (32) ........ again next year.',
    answers: [
      { num: 27, ans: 'for', cat: 'preposition', why: 'for + duration of time.' },
      { num: 28, ans: 'though', cat: 'conjunction', why: 'even though introduces a concessive clause.' },
      { num: 29, ans: 'with', cat: 'preposition', why: 'walked with indicates accompanying someone.' },
      { num: 30, ans: 'the', cat: 'article', why: 'the first week indicates a specific time.' },
      { num: 31, ans: 'much', cat: 'quantifier', why: 'so much that indicates degree with uncountable noun.' },
      { num: 32, ans: 'them', cat: 'pronoun', why: 'visit them refers to the host family.' },
    ],
  },
},

// ═══════════════ TEST 25 ═══════════════

25: {
  p4: {
    title: 'Part 4 – Volunteering at an animal shelter',
    paragraphs: [
      'I started volunteering at an animal shelter during the school holidays last year. (16) ..... The shelter cared for over fifty cats and dogs, and the staff were always busy.',
      'My main job was cleaning the cages and refilling food bowls. (17) ..... It was not a glamorous task, but I could see how much the animals appreciated the attention.',
      'One day, a young dog arrived who had been injured in an accident. (18) ..... The vet came twice a week to check on his progress, and I was allowed to help during the treatments.',
      'Watching the dog recover and eventually find a new home was incredibly rewarding. (19) ..... Seeing him leave with a caring family made all the hard work worthwhile.',
      'Volunteering at the shelter changed my perspective on animal welfare. (20) ..... I now hope to become a veterinarian so I can help animals professionally.',
    ],
    options: [
      { label: 'A', text: 'I chose to volunteer there because I love animals.' },
      { label: 'B', text: 'Although simple, these tasks taught me responsibility.' },
      { label: 'C', text: 'He was frightened and would not let anyone approach him at first.' },
      { label: 'D', text: 'The moment he wagged his tail at his new owners, everyone cried.' },
      { label: 'E', text: 'This experience inspired my future career choice.' },
      { label: 'F', text: 'The shelter closed down after six months.' },
      { label: 'G', text: 'I refused to clean the cages because it was too dirty.' },
      { label: 'H', text: 'The vet said the dog would never recover fully.' },
    ],
    answers: { 16: 'a', 17: 'b', 18: 'c', 19: 'd', 20: 'e' },
  },
  p5: {
    title: 'Part 5 – A sports tournament',
    text: 'Our school basketball team reached the regional finals last month. We had been training (21) ..... early morning sessions for weeks before the big match. The team we faced had (22) ..... lost a game all season, so we knew it would be tough. Our coach told us to focus (23) ..... playing as a team rather than trying to be individual stars. In the final quarter, we were five points behind, (24) ..... we did not give up. With thirty seconds left, our captain scored the winning basket. The crowd cheered (25) ..... loudly that you could hear them across the whole sports centre. It was (26) ..... unforgettable experience for everyone on the team.',
    questions: [
      { num: 21, opts: { A: 'in', B: 'on', C: 'at', D: 'by' }, ans: 'A', lang: 'preposition', why: 'in early morning sessions uses in for time periods.' },
      { num: 22, opts: { A: 'ever', B: 'never', C: 'always', D: 'still' }, ans: 'B', lang: 'adverb', why: 'had never lost indicates no prior defeats.' },
      { num: 23, opts: { A: 'in', B: 'at', C: 'on', D: 'for' }, ans: 'C', lang: 'phrasal-verb', why: 'focus on is the correct phrasal verb.' },
      { num: 24, opts: { A: 'so', B: 'but', C: 'or', D: 'because' }, ans: 'B', lang: 'linking-word', why: 'but contrasts the score with the team\'s spirit.' },
      { num: 25, opts: { A: 'such', B: 'too', C: 'very', D: 'so' }, ans: 'D', lang: 'intensifier', why: 'so loudly that introduces a result clause.' },
      { num: 26, opts: { A: 'a', B: 'an', C: 'the', D: 'some' }, ans: 'B', lang: 'article', why: 'an unforgettable starts with vowel sound.' },
    ],
  },
  p6: {
    title: 'Part 6 – Starting a recycling project',
    text: 'Our class started a recycling project after learning about plastic waste in geography. We placed separate bins (27) ........ paper, plastic and glass around the school. At first, many students put rubbish in (28) ........ wrong bin, so we made colourful posters to help them. The head teacher was (29) ........ impressed that she mentioned our project during morning assembly. Within two months, we had reduced the school\'s waste (30) ........ nearly thirty per cent. Other classes began to copy (31) ........ idea, and now the whole school participates. I feel proud (32) ........ I know we are making a real difference to the environment.',
    answers: [
      { num: 27, ans: 'for', cat: 'preposition', why: 'bins for paper indicates purpose.' },
      { num: 28, ans: 'the', cat: 'article', why: 'the wrong bin refers to a specific bin.' },
      { num: 29, ans: 'so', cat: 'intensifier', why: 'so impressed that introduces a result.' },
      { num: 30, ans: 'by', cat: 'preposition', why: 'reduced by indicates the amount of change.' },
      { num: 31, ans: 'our', cat: 'determiner', why: 'our idea indicates possession by the class.' },
      { num: 32, ans: 'because', cat: 'conjunction', why: 'because gives the reason for the feeling.' },
    ],
  },
},

// ═══════════════ TEST 26 ═══════════════

26: {
  p4: {
    title: 'Part 4 – Cooking international dishes',
    paragraphs: [
      'My passion for international cooking began when I tried a Korean dish at a friend\'s house. (16) ..... The flavours were completely different from anything I had tasted before, and I wanted to learn more.',
      'I started by watching online videos and following recipes from different countries. (17) ..... My first attempts were disasters — I burned the rice and added too much chilli.',
      'My grandmother, who was an experienced cook, offered to guide me through some basic techniques. (18) ..... She taught me how to balance flavours and adjust seasoning properly.',
      'After several months of practice, I invited my family to try a three-course meal I had prepared. (19) ..... They were surprised by how authentic the dishes tasted.',
      'Cooking has become more than a hobby for me — it is a way to connect with other cultures. (20) ..... I now keep a journal of recipes from every country I learn about.',
    ],
    options: [
      { label: 'A', text: 'The meal opened my eyes to a world of new tastes.' },
      { label: 'B', text: 'These early failures taught me to be patient.' },
      { label: 'C', text: 'Her lessons were the most valuable cooking education I could have asked for.' },
      { label: 'D', text: 'Their positive reaction encouraged me to keep experimenting.' },
      { label: 'E', text: 'This journal has become my most treasured possession.' },
      { label: 'F', text: 'I decided to stop cooking after the first failed attempt.' },
      { label: 'G', text: 'My grandmother refused to teach me any recipes.' },
      { label: 'H', text: 'My family did not like the food I prepared.' },
    ],
    answers: { 16: 'a', 17: 'b', 18: 'c', 19: 'd', 20: 'e' },
  },
  p5: {
    title: 'Part 5 – A music festival',
    text: 'Our town hosted its first music festival last weekend, and it was a huge success. The organisers had spent months preparing, (21) ..... everything went smoothly. There were three stages featuring different genres of music, (22 ..... blues to electronic. I volunteered to help backstage, (23 ..... gave me a chance to see the musicians up close. The highlight of the evening was a local band (24 ..... performance impressed everyone in the crowd. They played for over an hour, and (25 ..... single person in the audience was dancing. The festival raised enough money (26 ..... fund music programmes in local schools for the next year.',
    questions: [
      { num: 21, opts: { A: 'but', B: 'so', C: 'or', D: 'and' }, ans: 'B', lang: 'linking-word', why: 'so expresses the result of careful preparation.' },
      { num: 22, opts: { A: 'from', B: 'by', C: 'since', D: 'between' }, ans: 'A', lang: 'preposition', why: 'from blues to electronic covers the range.' },
      { num: 23, opts: { A: 'that', B: 'what', C: 'which', D: 'who' }, ans: 'C', lang: 'relative-pronoun', why: 'which refers to the volunteering activity.' },
      { num: 24, opts: { A: 'who', B: 'whose', C: 'which', D: 'what' }, ans: 'B', lang: 'relative-pronoun', why: 'whose performance indicates possession by the band.' },
      { num: 25, opts: { A: 'all', B: 'every', C: 'each', D: 'no' }, ans: 'B', lang: 'determiner', why: 'every single person emphasises all individuals.' },
      { num: 26, opts: { A: 'for', B: 'to', C: 'that', D: 'so' }, ans: 'B', lang: 'infinitive', why: 'enough to fund uses the infinitive of purpose.' },
    ],
  },
  p6: {
    title: 'Part 6 – Learning a new language',
    text: 'I started learning Japanese six months ago using a mobile app. At first, I found (27) ........ very difficult to remember the characters because (28) ........ looked so different from English letters. The app encouraged me to practise (29) ........ least ten minutes every day. After three months, I could introduce (30) ........ in simple Japanese sentences. My friends were surprised (31) ........ quickly I was learning. I have now signed up for an evening course (32) ........ I can practise speaking with other learners.',
    answers: [
      { num: 27, ans: 'it', cat: 'pronoun', why: 'it as a dummy object in find it difficult.' },
      { num: 28, ans: 'they', cat: 'pronoun', why: 'they refers to the characters (plural).' },
      { num: 29, ans: 'at', cat: 'preposition', why: 'at least is a fixed phrase indicating minimum.' },
      { num: 30, ans: 'myself', cat: 'reflexive-pronoun', why: 'introduce myself is the reflexive form.' },
      { num: 31, ans: 'how', cat: 'linking-word', why: 'how quickly indicates degree in an indirect question.' },
      { num: 32, ans: 'so', cat: 'conjunction', why: 'so that expresses purpose.' },
    ],
  },
},

// ═══════════════ TEST 27 ═══════════════

27: {
  p4: {
    title: 'Part 4 – Renovating a community centre',
    paragraphs: [
      'The old community centre in our area had been closed for years, and the building was falling apart. (16) ..... A group of residents decided it was time to bring it back to life.',
      'We formed a committee and applied for a grant from the local council to cover the cost of materials. (17) ..... To our surprise, the application was approved within a month.',
      'The renovation work began on a Saturday morning, with volunteers of all ages taking part. (18) ..... Some people painted walls, while others repaired the broken windows and doors.',
      'The biggest challenge was the old kitchen, which needed new plumbing and electrical wiring. (19) ..... A local plumber offered to do the work at a reduced rate because he believed in the project.',
      'After six months of hard work, the centre finally reopened. (20) ..... It now hosts art classes, youth clubs and weekly coffee mornings for elderly residents.',
    ],
    options: [
      { label: 'A', text: 'The idea seemed impossible at first, but we were determined.' },
      { label: 'B', text: 'The grant covered most of our expenses, which was a huge relief.' },
      { label: 'C', text: 'The atmosphere was full of energy and optimism throughout.' },
      { label: 'D', text: 'His generous offer saved us thousands of pounds.' },
      { label: 'E', text: 'The centre has become a vital part of the community once again.' },
      { label: 'F', text: 'The council rejected our funding application.' },
      { label: 'G', text: 'Only professional builders were allowed to help.' },
      { label: 'H', text: 'The centre was demolished after renovation began.' },
    ],
    answers: { 16: 'a', 17: 'b', 18: 'c', 19: 'd', 20: 'e' },
  },
  p5: {
    title: 'Part 5 – A beach clean-up event',
    text: 'Our environmental club organised a beach clean-up last Sunday. More (21) ..... fifty volunteers showed up, including families with young children. Everyone was given gloves and a bag, and (22) ..... asked to separate plastic from other rubbish. Within two hours, we had collected over a hundred kilograms of waste. It was shocking (23) ..... see how much rubbish had accumulated on such a beautiful beach. A local café provided free drinks for (24) ..... the volunteers as a thank-you gesture. The event was (25) ..... successful that we have decided to make it a monthly activity. If we want to protect our coastline, we need to take action (26) ..... than wait for others to do it.',
    questions: [
      { num: 21, opts: { A: 'of', B: 'then', C: 'that', D: 'than' }, ans: 'D', lang: 'comparison', why: 'more than is the standard comparative.' },
      { num: 22, opts: { A: 'was', B: 'were', C: 'had', D: 'been' }, ans: 'B', lang: 'passive-voice', why: 'were asked is correct plural past passive.' },
      { num: 23, opts: { A: 'for', B: 'that', C: 'to', D: 'and' }, ans: 'C', lang: 'infinitive', why: 'shocking to see uses the infinitive after adjective.' },
      { num: 24, opts: { A: 'all', B: 'every', C: 'both', D: 'some' }, ans: 'A', lang: 'determiner', why: 'all the volunteers refers to the whole group.' },
      { num: 25, opts: { A: 'so', B: 'such', C: 'too', D: 'very' }, ans: 'B', lang: 'intensifier', why: 'such a successful event that introduces result.' },
      { num: 26, opts: { A: 'later', B: 'sooner', C: 'rather', D: 'better' }, ans: 'C', lang: 'fixed-expression', why: 'rather than expresses preference between actions.' },
    ],
  },
  p6: {
    title: 'Part 6 – A weekend hiking trip',
    text: 'My friends and I went on a hiking trip to the hills last weekend. We set off early in (27) ........ morning to avoid the midday heat. The trail was steeper (28) ........ we had expected, and we stopped several times to catch our breath. (29) ........ we reached the top, the view was absolutely stunning. We ate our sandwiches while sitting on a rock, watching birds fly (30) ........ the valley below. On the way down, my friend twisted (31) ........ ankle, so we had to walk slowly. Despite the pain, she kept joking, which made (32) ........ all laugh. I cannot wait to go on another adventure with them.',
    answers: [
      { num: 27, ans: 'the', cat: 'article', why: 'in the morning is a fixed time phrase.' },
      { num: 28, ans: 'than', cat: 'conjunction', why: 'steeper than is the comparative structure.' },
      { num: 29, ans: 'When', cat: 'conjunction', why: 'When indicates the moment of arrival.' },
      { num: 30, ans: 'over', cat: 'preposition', why: 'fly over indicates movement above something.' },
      { num: 31, ans: 'her', cat: 'determiner', why: 'her ankle indicates possession.' },
      { num: 32, ans: 'us', cat: 'pronoun', why: 'made us all laugh uses the object pronoun.' },
    ],
  },
},

// ═══════════════ TEST 28 ═══════════════

28: {
  p4: {
    title: 'Part 4 – Starting a school newspaper',
    paragraphs: [
      'The idea of starting a school newspaper came from a conversation in the canteen one lunchtime. (16) ..... A group of friends complained that there was no way to share news about school events.',
      'We approached the head teacher with a proposal, and she gave us permission to publish a monthly edition. (17) ..... She even offered to let us use the printing room after school.',
      'Creating the first issue was more work than we anticipated. (18) ..... We had to write articles, take photographs and design the layout, all while keeping up with our regular studies.',
      'When the first copies were distributed, the reaction was overwhelmingly positive. (19) ..... Students stopped us in the corridor to say how much they enjoyed reading it.',
      'The newspaper has now been running for eight months. (20) ..... We have expanded from four pages to twelve and even started an online version with daily updates.',
    ],
    options: [
      { label: 'A', text: 'Someone suggested starting a newspaper to solve the problem.' },
      { label: 'B', text: 'Her support was essential to getting the project started.' },
      { label: 'C', text: 'Balancing schoolwork with the newspaper was challenging but rewarding.' },
      { label: 'D', text: 'The positive feedback motivated us to improve the next issue.' },
      { label: 'E', text: 'The newspaper has become an important part of school life.' },
      { label: 'F', text: 'The head teacher rejected our proposal immediately.' },
      { label: 'G', text: 'Only teachers were allowed to write articles for the paper.' },
      { label: 'H', text: 'Students showed no interest in reading the newspaper.' },
    ],
    answers: { 16: 'a', 17: 'b', 18: 'c', 19: 'd', 20: 'e' },
  },
  p5: {
    title: 'Part 5 – A cooking competition',
    text: 'Our school held a cooking competition last term, and I decided to enter. Each participant had (21) ..... prepare a main course and a dessert using only local ingredients. I chose to make a vegetable pie (22) ..... a fruit crumble for dessert. The judges were professional chefs, and they paid close attention (23) ..... every detail of our presentation. My pie was well cooked, but the crumble (24) ..... a little too sweet. (25) ..... my surprise, I was awarded second place. The experience taught me that cooking requires both creativity (26) ..... discipline.',
    questions: [
      { num: 21, opts: { A: 'must', B: 'had', C: 'should', D: 'got' }, ans: 'B', lang: 'modal-verb', why: 'had to expresses past obligation.' },
      { num: 22, opts: { A: 'with', B: 'and', C: 'plus', D: 'or' }, ans: 'B', lang: 'linking-word', why: 'and connects two equally important items.' },
      { num: 23, opts: { A: 'at', B: 'for', C: 'to', D: 'on' }, ans: 'C', lang: 'preposition', why: 'pay attention to is the correct collocation.' },
      { num: 24, opts: { A: 'is', B: 'was', C: 'has', D: 'had' }, ans: 'B', lang: 'past-tense', why: 'was is correct past simple for the crumble.' },
      { num: 25, opts: { A: 'At', B: 'To', C: 'In', D: 'For' }, ans: 'B', lang: 'fixed-expression', why: 'to my surprise is a fixed expression.' },
      { num: 26, opts: { A: 'and', B: 'or', C: 'nor', D: 'but' }, ans: 'A', lang: 'linking-word', why: 'both X and Y is the correct correlative.' },
    ],
  },
  p6: {
    title: 'Part 6 – Joining a drama club',
    text: 'I joined the school drama club at the beginning of this term. I had always been (27) ........ shy to speak in front of people, but my best friend encouraged me to try. At the first meeting, (28) ........ director asked us to perform a short improvisation. I was terrified, (29) ........ as soon as I started acting, I forgot about my nerves. The other members were very supportive, (30 ........ helped me a lot. After a few rehearsals, I began to feel more confident (31) ........ my ability to remember lines. I now have the lead role in (32) ........ next school play, which is both exciting and scary.',
    answers: [
      { num: 27, ans: 'too', cat: 'adverb', why: 'too shy means excessively shy (negative result).' },
      { num: 28, ans: 'the', cat: 'article', why: 'the director refers to the specific drama club director.' },
      { num: 29, ans: 'but', cat: 'conjunction', why: 'but contrasts initial fear with later calm.' },
      { num: 30, ans: 'which', cat: 'relative-pronoun', why: 'which refers to the supportive behaviour.' },
      { num: 31, ans: 'about', cat: 'preposition', why: 'confident about is the correct collocation.' },
      { num: 32, ans: 'the', cat: 'article', why: 'the next school play refers to a specific event.' },
    ],
  },
},

// ═══════════════ TEST 29 ═══════════════

29: {
  p4: {
    title: 'Part 4 – Planning a surprise party',
    paragraphs: [
      'My friends and I decided to organise a surprise party for our teacher\'s fiftieth birthday. (16) ..... She had been kind and supportive to all of us, and we wanted to show our appreciation.',
      'The first step was to choose a venue that would not raise suspicion. (17) ..... We decided to use the school hall, pretending that we needed to rehearse for a concert.',
      'Everyone was assigned a specific task. (18) ..... Some students prepared decorations, while others baked cakes and organised a playlist of her favourite songs.',
      'On the day of the party, we had to keep the plan secret from our teacher all morning. (19) ..... It was difficult to act normally when we were so excited.',
      'When she walked into the hall and saw the decorations, she burst into tears of joy. (20) ..... That moment of happiness made all our careful planning completely worthwhile.',
    ],
    options: [
      { label: 'A', text: 'We felt she deserved something special for all her efforts.' },
      { label: 'B', text: 'The excuse worked perfectly, and she did not suspect anything.' },
      { label: 'C', text: 'Everyone contributed according to their skills and interests.' },
      { label: 'D', text: 'A few of us almost gave away the secret several times.' },
      { label: 'E', text: 'Seeing her so happy was the best reward we could have imagined.' },
      { label: 'F', text: 'The teacher found out about the party and was angry.' },
      { label: 'G', text: 'No one wanted to help organise the party.' },
      { label: 'H', text: 'The party was cancelled because of bad weather.' },
    ],
    answers: { 16: 'a', 17: 'b', 18: 'c', 19: 'd', 20: 'e' },
  },
  p5: {
    title: 'Part 5 – A gardening project',
    text: 'My grandfather started a small vegetable garden in his backyard last spring. He spends at least an hour (21) ..... day tending to his plants, and the results have been impressive. His tomatoes are always the tastiest (22) ..... the neighbourhood. He insists (23) ..... using only natural fertilisers and never uses chemicals. I sometimes help him water the plants, (24 ..... gives me a chance to ask him about his childhood. He believes (25) ..... gardening teaches patience and responsibility. I have learned more from his stories (26) ..... from any textbook about nature.',
    questions: [
      { num: 21, opts: { A: 'a', B: 'an', C: 'the', D: 'some' }, ans: 'A', lang: 'article', why: 'an hour a day uses the indefinite article for frequency.' },
      { num: 22, opts: { A: 'of', B: 'in', C: 'at', D: 'from' }, ans: 'B', lang: 'preposition', why: 'best in the neighbourhood indicates location.' },
      { num: 23, opts: { A: 'on', B: 'for', C: 'in', D: 'to' }, ans: 'A', lang: 'phrasal-verb', why: 'insist on is the correct phrasal verb pattern.' },
      { num: 24, opts: { A: 'that', B: 'what', C: 'which', D: 'who' }, ans: 'C', lang: 'relative-pronoun', why: 'which refers to the activity of helping.' },
      { num: 25, opts: { A: 'that', B: 'what', C: 'if', D: 'whether' }, ans: 'A', lang: 'conjunction', why: 'believes that introduces a noun clause.' },
      { num: 26, opts: { A: 'more', B: 'most', C: 'than', D: 'as' }, ans: 'C', lang: 'comparison', why: 'more than is the comparative structure.' },
    ],
  },
  p6: {
    title: 'Part 6 – Making new friends',
    text: 'Moving to a new school was one of the hardest things I have ever done. I did not know (27) ........ single person on my first day, and I felt completely lost. During lunch, a girl named Sara sat next (28) ........ me and started a conversation. She asked me (29) ........ I liked any sports, and I told her I enjoyed basketball. Sara invited me to join (30) ........ team practice after school. That simple invitation changed everything. Over (31) ........ next few weeks, I made several good friends through the basketball team. Now I realise (32) ........ sometimes all it takes is one person to make a new place feel like home.',
    answers: [
      { num: 27, ans: 'a', cat: 'article', why: 'not a single person emphasises zero.' },
      { num: 28, ans: 'to', cat: 'preposition', why: 'next to indicates position beside someone.' },
      { num: 29, ans: 'whether', cat: 'conjunction', why: 'whether introduces an indirect yes/no question.' },
      { num: 30, ans: 'their', cat: 'determiner', why: 'their team refers to Sara\'s team.' },
      { num: 31, ans: 'the', cat: 'article', why: 'over the next few weeks is a fixed time phrase.' },
      { num: 32, ans: 'that', cat: 'conjunction', why: 'realise that introduces a noun clause.' },
    ],
  },
},

}

/* ── Language target map for Part 5 ────────────────── */
function langTargets(p5) {
  return p5.questions.map(q => q.lang)
}

function countCats(items) {
  const c = {}
  items.forEach(x => { c[x] = (c[x] || 0) + 1 })
  return c
}

/* ── Apply content to package data ──────────────────── */

function applyP4(pkg, testNum, content) {
  const p4 = pkg.parts.find(p => p.partNumber === 4)
  const c = content.p4

  // Build passage: 5 text blocks + 8 labeled blocks
  const textBlocks = c.paragraphs.map(t => ({ text: t }))
  const optBlocks = c.options.map(o => ({ label: o.label, text: o.text }))
  p4.passage = [...textBlocks, ...optBlocks]
  p4.passageTitle = c.title

  // Build features (the actual option bank)
  const features = c.options.map(o => ({
    id: o.label.toLowerCase(),
    name: o.text,
  }))
  p4.questionGroups[0].features = features

  // Questions stay as-is (they have empty options)
  // just need correct answer mapping in vault

  // Verify IDs match pattern
  const qIdPrefix = `catalog-reading-pet-b1-test${testNum}-part-4`
  const qIds = p4.questionGroups[0].questions.map(q => q.id)
  const expected = [16, 17, 18, 19, 20].map(n => `${qIdPrefix}-q${n}`)
  if (qIds.join(',') !== expected.join(',')) {
    console.error(`[ERROR] Test ${testNum} P4 question IDs mismatch`)
    console.error(`  Expected: ${expected.slice(0, 2).join(',')}...`)
    console.error(`  Got: ${qIds.slice(0, 2).join(',')}...`)
  }
}

function applyP5(pkg, testNum, content) {
  const p5 = pkg.parts.find(p => p.partNumber === 5)
  const c = content.p5

  p5.passage = [{ text: c.text }]
  p5.passageTitle = c.title

  const qIdPrefix = `catalog-reading-pet-b1-test${testNum}-part-5`
  const questions = c.questions.map(q => ({
    id: `${qIdPrefix}-q${q.num}`,
    number: q.num,
    type: 'multiple-choice',
    prompt: `Gap (${q.num})`,
    options: Object.entries(q.opts).map(([id, label]) => ({ id, label })),
    answerConfidence: 'key',
  }))
  p5.questionGroups[0].questions = questions
}

function applyP6(pkg, testNum, content) {
  const p6 = pkg.parts.find(p => p.partNumber === 6)
  const c = content.p6

  p6.passage = [{ text: c.text }]
  p6.passageTitle = c.title

  const qIdPrefix = `catalog-reading-pet-b1-test${testNum}-part-6`
  const questions = c.answers.map(a => ({
    id: `${qIdPrefix}-q${a.num}`,
    number: a.num,
    type: 'gap-fill',
    prompt: `Gap ${a.num}`,
    options: [],
    answerConfidence: 'key',
  }))
  p6.questionGroups[0].questions = questions
}

function buildAnswers(testNum, content) {
  const testId = `catalog-reading-pet-b1-test${testNum}`
  const vault = {}

  // Part 4
  const p4 = content.p4
  for (const [qNum, ans] of Object.entries(p4.answers)) {
    vault[`${testId}-part-4-q${qNum}`] = {
      answer: ans,
      explanation: `Sentence ${ans.toUpperCase()} fits gap ${qNum}.`,
    }
  }

  // Part 5
  const p5 = content.p5
  for (const q of p5.questions) {
    vault[`${testId}-part-5-q${q.num}`] = {
      answer: q.ans,
      explanation: `The answer completes gap ${q.num} naturally: ${q.why || ''}`,
    }
  }

  // Part 6
  const p6 = content.p6
  for (const a of p6.answers) {
    vault[`${testId}-part-6-q${a.num}`] = {
      answer: a.ans,
      explanation: `Grammar target: ${a.cat}. ${a.why || ''}`,
    }
  }

  return vault
}

/* ── Main ────────────────────────────────────────────── */

function main() {
  const tests = Object.keys(CONTENT).map(Number).sort((a, b) => a - b)

  // Check all exist
  for (const n of tests) {
    if (!existsSync(DATA(n))) {
      console.error(`Missing: packages/catalog/data/reading-pet-b1-test${n}.json`)
      process.exit(1)
    }
  }

  const allVaults = {}

  for (const n of tests) {
    const c = CONTENT[n]
    const pkg = JSON.parse(readFileSync(DATA(n), 'utf8'))

    console.log(`\nTest ${n}:`)
    applyP4(pkg, n, c)
    console.log(`  P4 applied`)
    applyP5(pkg, n, c)
    console.log(`  P5 applied`)
    applyP6(pkg, n, c)
    console.log(`  P6 applied`)

    writeFileSync(DATA(n), JSON.stringify(pkg, null, 2) + '\n')

    // Build and save answer vault for this test
    const vault = buildAnswers(n, c)
    allVaults[n] = vault

    // Preserve existing non-P4/5/6 answers
    let existingVault = {}
    if (existsSync(VAULT(n))) {
      existingVault = JSON.parse(readFileSync(VAULT(n), 'utf8'))
    }
    const merged = { ...existingVault }
    for (const [k, v] of Object.entries(vault)) {
      merged[k] = v
    }
    // Ensure top-level structure
    const vaultOut = {
      examId: `catalog-reading-pet-b1-test${n}`,
      version: existingVault.version || 1,
      mode: 'answers-vault',
      answers: merged,
    }
    writeFileSync(VAULT(n), JSON.stringify(vaultOut, null, 2) + '\n')
    console.log(`  Answer vault updated`)
  }

  // Generate audit report
  const tmp = resolve(ROOT, 'tmp')
  if (!existsSync(tmp)) mkdirSync(tmp, { recursive: true })

  // Word count check
  let md = '# PET B1 Quality Backfill — Generated Content\n\n'
  md += '## Word counts\n\n| Test | P4 words | P4 paras | P4 gaps | P5 words | P5 gaps | P5 qs | P6 words | P6 gaps | P6 qs |\n'
  md += '|------|----------|---------|---------|---------|---------|-------|---------|---------|-------|\n'

  for (const n of tests) {
    const c = CONTENT[n]
    const p4text = c.p4.paragraphs.join(' ')
    const p4clean = p4text.replace(/\(\d+\)\s*\.{3,}/g, ' ').replace(/\s+/g, ' ').trim()
    const p4words = p4clean ? p4clean.split(' ').length : 0
    const p5clean = c.p5.text.replace(/\(\d+\)\s*\.{3,}/g, ' ').replace(/\s+/g, ' ').trim()
    const p5words = p5clean ? p5clean.split(' ').length : 0
    const p6clean = c.p6.text.replace(/\(\d+\)\s*\.{3,}/g, ' ').replace(/\s+/g, ' ').trim()
    const p6words = p6clean ? p6clean.split(' ').length : 0

    md += `| ${n} | ${p4words} | 5 | 5 | ${p5words} | 6 | 6 | ${p6words} | 6 | 6 |\n`
  }

  // P4 gap distribution
  md += '\n## Part 4 gap distribution\n\n'
  for (const n of tests) {
    const paras = CONTENT[n].p4.paragraphs
    md += `**Test ${n}:**\n`
    const counts = {}
    let prevEnd = 0
    for (let i = 0; i < paras.length; i++) {
      const before = paras[i].split(/\(\d+\)/)[0].trim().split(/\s+/).filter(Boolean).length
      const after = paras[i].split(/\(\d+\)/)[1] || ''
      const afterWords = after.trim().split(/\s+/).filter(Boolean).length
      const total = before + afterWords
      md += `  Para ${i + 1}: ~${total} words (${before} before gap)\n`
    }
  }

  // P5 language targets
  md += '\n## Part 5 language targets\n\n'
  for (const n of tests) {
    const targets = langTargets(CONTENT[n].p5)
    const counts = countCats(targets)
    md += `**Test ${n}:** ${targets.join(', ')}\n`
    md += `  Counts: ${Object.entries(counts).map(([k, v]) => `${k}(${v})`).join(', ')}\n`
  }

  // P6 grammar categories
  md += '\n## Part 6 grammar categories\n\n'
  for (const n of tests) {
    const cats = CONTENT[n].p6.answers.map(a => a.cat)
    const counts = countCats(cats)
    md += `**Test ${n}:** ${cats.join(', ')}\n`
    md += `  Counts: ${Object.entries(counts).map(([k, v]) => `${k}(${v})`).join(', ')}\n`
  }

  writeFileSync(resolve(tmp, 'pet-b1-reading-quality-backfill-20-29-review.md'), md)
  console.log('\nReport saved to tmp/pet-b1-reading-quality-backfill-20-29-review.md')
  console.log('Done.')
}

main()
