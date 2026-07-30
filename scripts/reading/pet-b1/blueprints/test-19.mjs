/**
 * PET B1 Reading Test 19 — Batch 1 Blueprint
 * Topic: environmental volunteering and conservation
 */
export default {
  testNumber: 19,
  golden: false,
  topic: ['river banks', 'volunteers', 'wildlife habitats', 'recycling habits'],

  metadata: {
    title: 'PET B1 Reading Test 19',
    difficulty: 'B1',
    themes: {
      part1: 'environmental volunteering and conservation',
      part2: 'environmental volunteering and conservation',
      part3: 'a river clean-up day',
      part4: 'starting a tree-planting project',
      part5: 'protecting local wildlife',
      part6: 'a school recycling scheme',
    },
  },

  part1: {
    cards: [
      {
        key: 'p1-card-1',
        template: 'notice',
        title: 'Clean-up notice',
        text: 'Saturday\u2019s river clean-up will meet at the footbridge at 9 a.m. Wear old shoes that can get muddy and bring gardening gloves if you have them. Bags and litter pickers are provided. The session ends at noon, and tea will be available at the community hut.',
        question: {
          stem: 'What should volunteers bring?',
          options: [
            { key: 'a1', text: 'Litter pickers and bags.' },
            { key: 'a2', text: 'Old shoes and gloves.' },
            { key: 'a3', text: 'Tea for the group.' },
            { key: 'a4', text: 'A change of clothes.' },
          ],
          correctOptionKey: 'a2',
        },
      },
      {
        key: 'p1-card-2',
        template: 'email',
        title: 'Project update email',
        text: 'Hi volunteers, the hedgehog habitat project has received funding for materials, so we can now build the log piles this month. Please reply by Wednesday if you can help on the 22nd. We need six people minimum; if fewer reply, we will postpone to the following Saturday.',
        question: {
          stem: 'What determines whether the event proceeds?',
          options: [
            { key: 'b1', text: 'Whether the funding arrives on time.' },
            { key: 'b2', text: 'Whether at least six volunteers reply.' },
            { key: 'b3', text: 'Whether the weather is suitable.' },
            { key: 'b4', text: 'Whether the materials are delivered.' },
          ],
          correctOptionKey: 'b2',
        },
      },
      {
        key: 'p1-card-3',
        template: 'club-instruction',
        title: 'Safety instruction',
        text: 'All conservation volunteers must attend a short safety briefing before their first outdoor session. The briefing covers tool handling, tick awareness and what to do near water. It takes twenty minutes and runs every Monday at 5.30 p.m. at the ranger\u2019s office.',
        question: {
          stem: 'When is the safety briefing held?',
          options: [
            { key: 'c1', text: 'Before every outdoor session.' },
            { key: 'c2', text: 'Every Monday at 5.30 p.m.' },
            { key: 'c3', text: 'On the first Saturday of the month.' },
            { key: 'c4', text: 'After the volunteer\u2019s first session.' },
          ],
          correctOptionKey: 'c2',
        },
      },
      {
        key: 'p1-card-4',
        template: 'booking-update',
        title: 'Booking update',
        text: 'Your place on the birdwatching walk is confirmed for Sunday 8 a.m. The walk lasts two hours and follows a flat path beside the reservoir. Bring binoculars if you own them; a limited number can be borrowed from the visitor centre. Dogs are not permitted on this route.',
        question: {
          stem: 'What restriction applies?',
          options: [
            { key: 'd1', text: 'Children cannot attend.' },
            { key: 'd2', text: 'Dogs are not allowed.' },
            { key: 'd3', text: 'Binoculars are compulsory.' },
            { key: 'd4', text: 'The path is steep.' },
          ],
          correctOptionKey: 'd2',
        },
      },
      {
        key: 'p1-card-5',
        template: 'school-announcement',
        title: 'School announcement',
        text: 'Year 10 students taking part in the recycling scheme must empty their classroom bins every Thursday before lunch. Full bags should be tied and placed in the green container behind the sports hall. Do not mix paper with plastic; contaminated bags will not be collected.',
        question: {
          stem: 'What must students avoid?',
          options: [
            { key: 'e1', text: 'Emptying bins after lunch.' },
            { key: 'e2', text: 'Using the green container.' },
            { key: 'e3', text: 'Mixing paper with plastic.' },
            { key: 'e4', text: 'Tying the bags.' },
          ],
          correctOptionKey: 'e3',
        },
      },
    ],
  },

  part2: {
    domain: 'environmental volunteering and conservation',
    options: [
      {
        key: 'option-a',
        title: 'Evening litter pick with a hot drink after',
        openingStyle: 'activity-led',
        description: 'Collecting rubbish in small teams around the town centre, this weekday evening group makes a visible difference in just one hour. All equipment including gloves, grabbers and hi-vis vests is supplied. No experience is needed, and volunteers finish together over a hot drink at the nearby café. The group meets every Wednesday.',
        constraints: ['weekday evening', 'equipment supplied', 'no experience', 'social finish', 'one hour'],
        imageSlotKey: 'option-a',
      },
      {
        key: 'option-b',
        title: 'Hillside tree planting on Saturdays',
        openingStyle: 'location-led',
        description: 'On a windswept hillside overlooking the valley, volunteers dig holes and plant young saplings under expert guidance every Saturday morning. The work is physical and boots are essential. Transport to the site is self-arranged, as no bus route reaches the planting area. Each volunteer can name their tree and return to watch it grow.',
        constraints: ['saturday morning', 'physical work', 'boots essential', 'own transport', 'expert guidance'],
        imageSlotKey: 'option-b',
      },
      {
        key: 'option-c',
        title: 'Lunchtime composting demo, walk in',
        openingStyle: 'condition-led',
        description: 'This forty-minute lunchtime composting demonstration in the college garden needs no booking, fee or gardening experience. Participants learn to build a compost heap from scratch and receive a printed guide to take home. Sessions run every Thursday, and latecomers are welcome to join mid-demonstration.',
        constraints: ['lunchtime', 'free', 'no booking', 'printed guide', 'short duration'],
        imageSlotKey: 'option-c',
      },
      {
        key: 'option-d',
        title: 'Wildlife survey qualification course',
        openingStyle: 'outcome-led',
        description: 'Qualify for national monitoring programmes by completing this advanced weekend wildlife survey training. Volunteers learn to identify species, record field data accurately and operate specialist survey equipment. The certificate is recognised by conservation bodies across the country. The fee is high but includes all equipment hire and field materials.',
        constraints: ['weekend', 'advanced', 'recognised certificate', 'high fee', 'fieldwork'],
        imageSlotKey: 'option-d',
      },
      {
        key: 'option-e',
        title: 'Garden rewilding for insect support',
        openingStyle: 'need-led',
        description: 'Supporting local insects need not mean a long weekly commitment, as this short accessible introduction shows. The tutor demonstrates rewilding techniques in a step-free community garden, and each participant receives a seed pack to take home. Sessions last ninety minutes and focus on practical, low-effort changes.',
        constraints: ['accessible', 'step-free', 'seed pack', 'short course', 'low commitment'],
        imageSlotKey: 'option-e',
      },
      {
        key: 'option-f',
        title: 'Family beach clean on first Sundays',
        openingStyle: 'audience-led',
        description: 'Once a month, on the first Sunday, a morning beach clean welcomes helpers of every age. Gloves and bags are supplied, and the session ends with a short talk about ocean plastic. Parking is free and the meeting point is clearly signposted. The work is light enough for young helpers.',
        constraints: ['sunday morning', 'family-friendly', 'equipment supplied', 'free parking', 'monthly'],
        imageSlotKey: 'option-f',
      },
      {
        key: 'option-g',
        title: 'Repair café, bring your broken items',
        openingStyle: 'invitation-led',
        description: 'Bring your torn jacket or wobbly toaster and learn to mend it at this free monthly repair-and-reuse workshop. Skilled volunteers guide members through clothing repairs and small fixes instead of discarding items. The atmosphere is informal and social, with tea always brewing. The hall is outside town and buses are infrequent.',
        constraints: ['monthly', 'free', 'informal', 'hands-on', 'limited transport'],
        imageSlotKey: 'option-g',
      },
      {
        key: 'option-h',
        title: 'Conservation challenge with physical tasks',
        openingStyle: 'feature-led',
        description: 'Pond clearing, fence building and path laying under time pressure define this competitive weekend conservation challenge. Teams complete practical outdoor tasks while judges assess speed and quality. Everyone who finishes earns a medal, and the entry fee covers tools, insurance and lunch. It suits people who enjoy physical teamwork outdoors.',
        constraints: ['weekend', 'competitive', 'medal', 'physical tasks', 'higher cost'],
        imageSlotKey: 'option-h',
      },
    ],
    profiles: [
      { key: 'profile-1', text: 'Kai wants a short evening activity after work, needs equipment supplied and enjoys finishing with a social drink nearby.', correctOptionKey: 'option-a' },
      { key: 'profile-2', text: 'Mia has young children, is free Sunday mornings and wants an environmental activity where gloves are supplied and parking is easy.', correctOptionKey: 'option-f' },
      { key: 'profile-3', text: 'Leo has a free lunchtime hour, wants a free demonstration with printed notes and prefers no booking or commitment.', correctOptionKey: 'option-c' },
      { key: 'profile-4', text: 'Zara uses a wheelchair, wants a step-free garden activity with seeds to take home and prefers a short gentle introduction.', correctOptionKey: 'option-e' },
      { key: 'profile-5', text: 'Omar wants a recognised qualification for conservation work, can pay a high fee and is happy with weekend fieldwork and data recording.', correctOptionKey: 'option-d' },
    ],
  },

  part3: {
    title: 'A river clean-up day',
    paragraphs: [
      'On a grey Saturday in March, twenty of us gathered beside the footbridge with rubber gloves and black bags. The river had flooded twice during winter, and when the water receded, it left plastic bottles, food wrappers and even a shopping trolley tangled in the reeds. Our group leader, a retired teacher called Margaret, divided us into pairs and assigned each pair a fifty-metre stretch of bank.',
      'The work was messier than I had imagined. Some items were easy to reach, but others had sunk into the mud and required pulling with both hands. My partner, a teenager named Elliot, found a plastic bag full of old batteries and had to carry it carefully to the hazardous-waste container Margaret had brought. We filled three bags in the first hour, and the stretch of bank behind us looked noticeably cleaner.',
      'By midday, the group had collected fourteen bags of rubbish and several larger items, including a bicycle wheel and a broken garden chair. Margaret photographed the pile so the council could see the scale of the problem. She explained that most of the waste arrived during floods, not from local littering, which surprised several of us. The river, she said, carried other people\u2019s carelessness into our town.',
      'Walking home with muddy boots and aching shoulders, I felt a satisfaction that was difficult to explain. The river would flood again next winter, and more rubbish would arrive. But for now, the reeds were visible, and a heron stood where plastic bags had hung that morning. Margaret has already announced the next clean-up for June, and I have said I will return.',
    ],
    buildExtension: ' Several volunteers who had never met before exchanged numbers and formed a small group that meets monthly to monitor the river\u2019s condition. They photograph wildlife, record water levels and report illegal dumping to the council. Margaret says this ongoing attention matters more than any single clean-up, because it makes the river visible to people who might otherwise walk past without noticing. I have joined the monitoring group too, and last month I spotted a kingfisher from the footbridge. The sight confirmed what Margaret had told us: that caring for a place changes how you see it.',
    questions: [
      { number: 11, stem: 'Why was there so much rubbish by the river?', options: ['Local residents had dumped it deliberately.', 'Winter floods had carried it there.', 'A factory had leaked waste.', 'The council had failed to collect bins.'], correctIndex: 1 },
      { number: 12, stem: 'What made the work harder than expected?', options: ['The group was too small.', 'Some items were stuck in the mud.', 'The bags kept tearing.', 'Margaret gave unclear instructions.'], correctIndex: 1 },
      { number: 13, stem: 'Why did Margaret photograph the rubbish pile?', options: ['To share on social media for publicity.', 'To show the council how much was collected.', 'To prove the group had worked hard.', 'To compare with previous clean-ups.'], correctIndex: 1 },
      { number: 14, stem: 'What surprised the writer about the waste?', options: ['It was mainly from local households.', 'Most of it had arrived from elsewhere.', 'It included very few plastic items.', 'It was older than expected.'], correctIndex: 1 },
      { number: 15, stem: 'What is the writer\u2019s main feeling at the end?', options: ['Anger at the people who littered.', 'Satisfaction despite knowing the problem will return.', 'Disappointment that the work was unfinished.', 'Worry about the next flood.'], correctIndex: 1 },
    ],
  },

  part4: {
    title: 'Starting a tree-planting project',
    layoutParagraphs: [
      'When the farmer offered a strip of unused land beside the village, a group of residents saw a chance to create a small woodland. They had discussed the idea for years, but never had a suitable site. (16) ..... The first step was to check whether the soil could support young trees.',
      'A local ecologist visited the site and confirmed that native species such as oak and birch would grow well. She also warned that the first two years would require regular watering and protection from rabbits. (17) ..... The volunteers agreed to share these tasks on a rota basis.',
      'Funding came from a council grant and a sponsored walk organised by the primary school. The money covered saplings, tree guards and basic tools. (18) ..... Without this support, the project would have remained a discussion rather than becoming a reality.',
      'On the first planting day, thirty people turned up despite cold wind. Children carried saplings while adults dug holes, and the ecologist checked each tree before soil was replaced. (19) ..... By lunchtime, forty trees stood in neat rows along the boundary.',
      'Two years later, most of the trees had survived, and the first birds were nesting in the taller saplings. The volunteers still meet monthly to clear weeds and check guards. (20) ..... The strip of land that once grew only nettles now has a name: the Millennium Wood.',
    ],
    layoutExtensions: [
      'The offer transformed a vague ambition into a practical plan.',
      'This advice meant the volunteers had to commit beyond a single weekend.',
      'The grant arrived quickly because the school\u2019s walk had raised public interest.',
      'The shared effort made the work feel achievable despite the weather.',
      'The project had become part of the village\u2019s identity.',
    ],
    layoutClosers: [
      'The farmer said he was happy the land would serve a long-term purpose.',
      'Several volunteers bought watering cans and stored them in their sheds.',
      'A local newspaper printed a photograph of the schoolchildren on the walk.',
      'Everyone agreed that the cold made the hot soup afterwards taste better.',
      'Residents who had never volunteered before now ask when the next session is.',
    ],
    options: [
      { key: 'opt-0', text: 'The offer gave the group the site they had been waiting for.', correctForGap: 16 },
      { key: 'opt-1', text: 'The volunteers understood that planting was only the beginning.', correctForGap: 17 },
      { key: 'opt-2', text: 'This combination of funding made the project financially possible.', correctForGap: 18 },
      { key: 'opt-3', text: 'The teamwork meant that forty trees were planted in a single morning.', correctForGap: 19 },
      { key: 'opt-4', text: 'What began as an idea had grown into a shared local landmark.', correctForGap: 20 },
      { key: 'opt-5', text: 'The council refused to support any environmental project.', correctForGap: null },
      { key: 'opt-6', text: 'Every sapling died within the first month.', correctForGap: null },
      { key: 'opt-7', text: 'The farmer changed his mind and sold the land to a developer.', correctForGap: null },
    ],
    displayOrder: [4, 6, 1, 7, 3, 5, 0, 2],
    extra: ' The group now runs an annual open day in autumn, when families walk the wood and children help collect acorns for next year\u2019s planting. The ecologist gives a short talk about which species attract the most insects, and the farmer brings his dog. Attendance grows each year.',
    tail: ' The volunteers are discussing whether to add a bench and a small information board. They want visitors to understand why native species matter, without making the wood feel like a classroom.',
  },

  part5: {
    text: 'Protecting local wildlife requires effort, and residents have discovered that change depends (21) ..... small consistent actions rather than grand gestures. Last spring, a group of neighbours decided to (22) ..... up a patch of wasteland beside the railway and plant wildflowers. At first, the soil was poor and the results were slow, but they (23) ..... on because the council had agreed to let them use the space for three years. By summer, bees and butterflies appeared, (24) ..... surprised even the most optimistic volunteers. A local school adopted the patch, and children helped (25) ..... out which flowers attracted the most insects. The project has since inspired two other streets to create similar spaces, (26) ..... the neighbourhood now looks noticeably greener than it did five years ago.',
    extra: ' The group meets monthly to plan seasonal planting and share seeds. New volunteers are always welcome, and no gardening experience is required.',
    specs: [
      { phrase: 'depends (21) ..... small', options: ['on', 'in', 'at', 'for'], correctIndex: 0 },
      { phrase: 'to (22) ..... up a patch', options: ['clear', 'put', 'take', 'give'], correctIndex: 0 },
      { phrase: 'they (23) ..... on', options: ['kept', 'hold', 'carried', 'went'], correctIndex: 0 },
      { phrase: 'butterflies appeared, (24) ..... surprised', options: ['which', 'what', 'who', 'where'], correctIndex: 0 },
      { phrase: 'helped (25) ..... out', options: ['find', 'work', 'look', 'turn'], correctIndex: 0 },
      { phrase: 'spaces, (26) ..... the neighbourhood', options: ['so', 'but', 'or', 'nor'], correctIndex: 0 },
    ],
  },

  part6: {
    text: 'The recycling scheme started with (27) ........ simple idea: each classroom would collect paper separately. A teacher (28) ........ had attended an environmental course suggested the plan, (29) ........ the head teacher agreed to trial it for one term. Bins were placed (30) ........ every corridor, and students took turns emptying them. The scheme showed (31) ........ small changes could make a measurable difference, (32) ........ other schools have since asked for advice.',
    extra: ' The head teacher now includes recycling data in the annual report, and students present the figures to parents during open evenings. This visibility has encouraged families to adopt similar habits at home.',
    tail: ' The scheme will expand to include plastic bottles next term, following a student vote.',
    answers: ['a', 'who', 'and', 'in', 'that', 'so'],
    targets: ['article', 'relative-word', 'conjunction', 'preposition', 'pronoun', 'linking-word'],
  },
}
