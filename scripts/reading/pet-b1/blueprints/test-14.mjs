/**
 * PET B1 Reading Test 14 — Golden Sample Blueprint
 * Topic: community gardens, local gardeners, shared plots, water-saving
 */
export default {
  testNumber: 14,
  golden: true,
  topic: ['community gardens', 'local gardeners', 'shared plots', 'water-saving'],

  metadata: {
    title: 'PET B1 Reading Test 14',
    difficulty: 'B1',
    themes: {
      part1: 'local clubs, courses and community activities',
      part2: 'local clubs, courses and community activities',
      part3: 'community gardens',
      part4: 'a new use for an empty shop',
      part5: 'community garden project',
      part6: 'community garden organisation',
    },
  },

  part1: {
    cards: [
      {
        key: 'p1-card-1',
        template: 'notice',
        title: 'Community-centre notice',
        text: 'The Riverside Centre moved its Saturday cooking session upstairs. Bring an apron, arrive ten minutes early and tell reception if you need the accessible lift.',
        question: {
          stem: 'What should participants do?',
          options: [
            { key: 'a1', text: 'Bring an apron and arrive early.' },
            { key: 'a2', text: 'Collect a kitchen key.' },
            { key: 'a3', text: 'Book another Saturday.' },
            { key: 'a4', text: 'Use stairs instead of the lift.' },
          ],
          correctOptionKey: 'a1',
        },
      },
      {
        key: 'p1-card-2',
        template: 'text-message',
        title: 'Message between neighbours',
        text: 'Hi Ben, I am away on Thursday. Could you put my recycling box outside after seven? Collection has changed this week. I will bring your newspaper in on Friday.',
        question: {
          stem: 'What is Ben asked to do?',
          options: [
            { key: 'b1', text: 'Leave a newspaper Friday.' },
            { key: 'b2', text: 'Put the recycling box out Thursday.' },
            { key: 'b3', text: 'Change collection day.' },
            { key: 'b4', text: 'Visit before seven.' },
          ],
          correctOptionKey: 'b2',
        },
      },
      {
        key: 'p1-card-3',
        template: 'email',
        title: 'Volunteer email',
        text: 'We have enough food-bank drivers, but still need someone to label donated tins before the afternoon delivery. Please reply by noon if you can take this job.',
        question: {
          stem: 'What is still needed?',
          options: [
            { key: 'c1', text: 'Someone to label tins.' },
            { key: 'c2', text: 'More drivers.' },
            { key: 'c3', text: 'Donations before noon.' },
            { key: 'c4', text: 'Someone to collect food.' },
          ],
          correctOptionKey: 'c1',
        },
      },
      {
        key: 'p1-card-4',
        template: 'notice',
        title: 'Library update',
        text: 'Roof repairs finish Monday, but the study room stays closed until Wednesday while paint dries. Books can be returned through the side door during opening hours.',
        question: {
          stem: 'What can users do before Wednesday?',
          options: [
            { key: 'd1', text: 'Study in the room.' },
            { key: 'd2', text: 'Return books at the side door.' },
            { key: 'd3', text: 'Enter through the roof area.' },
            { key: 'd4', text: 'Collect paint.' },
          ],
          correctOptionKey: 'd2',
        },
      },
      {
        key: 'p1-card-5',
        template: 'booking-confirmation',
        title: 'Class booking confirmation',
        text: 'Your pottery class is confirmed for 18 March at 6 p.m. The fee includes clay, not a storage box. Cancel by Tuesday evening for a refund.',
        question: {
          stem: 'What condition applies?',
          options: [
            { key: 'e1', text: 'A box is included.' },
            { key: 'e2', text: 'It starts Tuesday.' },
            { key: 'e3', text: 'Cancellation by Tuesday is needed for a refund.' },
            { key: 'e4', text: 'It can move to April.' },
          ],
          correctOptionKey: 'e3',
        },
      },
    ],
  },

  part2: {
    domain: 'local clubs, courses and community activities',
    options: [
      { key: 'option-a', title: 'Evening beginner pottery at the arts centre', openingStyle: 'schedule-led', text: 'An evening beginner pottery course at the arts centre. Clay and tools are supplied, and finished work can be collected later. The moderate fee is paid per course; sessions end at nine.' },
      { key: 'option-b', title: 'Saturday gardening club, shared plots', openingStyle: 'audience-led', text: 'A Saturday morning gardening club beside the community centre. Members work outdoors in shared plots, bring gloves and learn from experienced growers. It is inexpensive and social.' },
      { key: 'option-c', title: 'Free lunchtime language exchange', openingStyle: 'condition-led', text: 'A free weekday lunchtime language exchange in a quiet library room. Adults practise conversation with changing partners, without formal teaching or homework.' },
      { key: 'option-d', title: 'Monthly family craft at the museum', openingStyle: 'feature-led', text: 'A monthly family craft afternoon at the museum. Materials are included and activities are indoors, but children need an accompanying adult.' },
      { key: 'option-e', title: 'Accessible photography walk, step-free', openingStyle: 'need-led', text: 'An accessible photography walk for adults. The leader chooses a short step-free route and pauses often; participants need a phone or camera.' },
      { key: 'option-f', title: 'Tuesday repair workshop, bring items', openingStyle: 'invitation-led', text: 'A free Tuesday repair workshop. Skilled members help mend small household items, but visitors bring the broken item and cannot book appointments.' },
      { key: 'option-g', title: 'Quiet monthly book group, village hall', openingStyle: 'location-led', text: 'A quiet monthly book group at a village hall. Members read one agreed novel, but the hall is outside town and transport is self-arranged.' },
      { key: 'option-h', title: 'Weekend first-aid course with certificate', openingStyle: 'outcome-led', text: 'A weekend first-aid course with a certificate and practical pair work. It costs more than clubs but suits future event volunteers.' },
    ],
    profiles: [
      { key: 'profile-1', text: 'Elliot works late and wants an indoor practical beginner course, with a medium budget and something to take home.', correctOptionKey: 'option-a' },
      { key: 'profile-2', text: 'Farah is free Saturday mornings, owns gloves, likes outdoor group work and needs a cheap activity near the centre.', correctOptionKey: 'option-b' },
      { key: 'profile-3', text: 'Grace has one free lunchtime hour and wants free indoor conversation practice without homework or formal teaching.', correctOptionKey: 'option-c' },
      { key: 'profile-4', text: 'Hugo uses a wheelchair, owns a phone and wants a small-group photography activity with a step-free route.', correctOptionKey: 'option-e' },
      { key: 'profile-5', text: 'Isla wants a recognised qualification before volunteering at festivals, can pay and is happy with practical pair work.', correctOptionKey: 'option-h' },
    ],
  },

  part3: {
    title: 'A garden that belongs to everyone',
    paragraphs: [
      'When the old railway land behind our library became available, residents had different ideas about what should happen to it. Some wanted a playground, while others imagined a car park. A small group of neighbours suggested community gardens instead. They argued that the space could provide food, teach children useful skills and give people a reason to meet. The council agreed to a one-year trial, but the volunteers had to organise almost everything themselves.',
      'The first months were harder than expected. The soil was dry, and several young plants died during a hot spell. Rather than asking for more money, the gardeners collected rainwater from nearby roofs and shared a weekly watering rota. A local café gave them empty containers for seedlings, and a retired science teacher showed children how to test the soil. These small contributions mattered because no single volunteer had enough time or experience to do the whole job.',
      `By autumn, the garden was producing vegetables, but its greatest success was less visible. People who had rarely spoken before were now exchanging advice and checking on one another's plots. The organisers still disagree about some choices, such as which plants to grow next year. Even so, they have learned that a shared place does not need everyone to think alike. It needs people to take responsibility for keeping it useful.`,
    ],
    extension: ' The project also changed how the library used its outdoor space. Children drew plans, older residents compared methods, and visitors could see the results of careful cooperation. The volunteers kept notes so the next group could begin with honest advice.',
    buildExtension: ' The organisers initially measured success by the number of vegetables collected, but the weekly meetings changed their view. They noticed that new volunteers asked questions that improved the planting plan, and that older residents enjoyed passing on knowledge they had once kept to themselves. A disagreement about a locked tool shed was solved when the group wrote simple rules together. The rules did not remove every problem, but they made responsibility visible and fair. By the end of the season, the garden had become a place where people could contribute in different ways. Some planted, some repaired fences, and some simply welcomed visitors. The writer believes this variety made the project stronger than a scheme led by only one confident organiser.',
    questions: [
      { number: 11, stem: 'Why did the neighbours suggest community gardens?', options: ['The space could serve several local purposes.', 'The council had already bought gardening tools.', 'They wanted to prevent children using the library.', 'A café promised to sell their vegetables.'], correctIndex: 0 },
      { number: 12, stem: 'What did the watering rota help the volunteers deal with?', options: ['A period when the plants received too little rain.', 'A shortage of containers at the local café.', 'A disagreement about the next year\u2019s crops.', 'A decision to move the garden behind the library.'], correctIndex: 0 },
      { number: 13, stem: 'Why does the writer mention the science teacher?', options: ['To show how one person\u2019s knowledge supported the project.', 'To explain why the council changed its rules.', 'To prove that gardening is mainly a school activity.', 'To describe the most successful crop in the garden.'], correctIndex: 0 },
      { number: 14, stem: 'What does the writer suggest about the people using the garden?', options: ['They have built connections while working on a practical task.', 'They now agree about every decision concerning the garden.', 'They prefer receiving help to taking responsibility themselves.', 'They joined mainly because the vegetables were free.'], correctIndex: 0 },
      { number: 15, stem: 'What is the writer\u2019s main point?', options: ['A shared project can improve a place and its community.', 'Local councils should always replace empty land with gardens.', 'Successful gardens depend on having expert volunteers.', 'People should avoid disagreement when planning activities.'], correctIndex: 0 },
    ],
  },

  part4: {
    title: 'A new use for an empty shop',
    layoutParagraphs: [
      'For years, the corner shop beside the bus stop stood empty. People in the area had grown used to walking past its dusty windows. (16) ..... One spring, residents began discussing whether the room could serve a useful purpose.',
      'A shared workshop seemed unusual, but it could help people repair objects instead of throwing them away. The owner agreed to lend the room for three months, provided visitors kept it clean. (17) ..... The residents then wrote a simple timetable.',
      'The owner asked visitors to keep the room clean because the building was old. (18) ..... This allowed them to work safely while they decided which activities beginners could try first.',
      'During the first Saturday, neighbours brought lamps, bicycles and small pieces of furniture. Most of the equipment arrived from people\u2019s homes. (19) ..... Visitors could therefore see which tools were available without asking each time.',
      'After several sessions, the organisers reviewed their notes and invited more residents to join. The workshop had started with very little money. (20) ..... It became a regular meeting place because people understood how to take part.',
    ],
    layoutExtensions: [
      'The change gave neighbours a reason to discuss the building again.',
      'They wanted the first trial to be practical rather than expensive.',
      'Everyone agreed that safety mattered more than completing many repairs.',
      'The arrangement also meant new volunteers could work independently.',
      'The project was small, but it gave the street a useful shared space.',
    ],
    layoutClosers: [
      'The empty windows no longer made the street feel forgotten.',
      'The timetable left room for people with different working hours.',
      'The careful check reassured visitors who had never used tools before.',
      'A labelled shelf made the shared equipment easier to return.',
      'The organisers hoped the owner would continue lending the room.',
    ],
    options: [
      { key: 'opt-0', text: 'People hurried past it without paying much attention.', correctForGap: 16 },
      { key: 'opt-1', text: 'The idea was unusual, but it solved two local problems.', correctForGap: 17 },
      { key: 'opt-2', text: 'This condition was important because the building was old.', correctForGap: 18 },
      { key: 'opt-3', text: 'Most of the equipment arrived from people\u2019s homes.', correctForGap: 20 },
      { key: 'opt-4', text: 'In this way, the project could begin without a large budget.', correctForGap: 19 },
      { key: 'opt-5', text: 'The residents decided to sell the building instead.', correctForGap: null },
      { key: 'opt-6', text: 'Nobody knew who had owned the shop before.', correctForGap: null },
      { key: 'opt-7', text: 'The bus company offered to run extra services.', correctForGap: null },
    ],
    displayOrder: [5, 0, 6, 2, 7, 1, 3, 4],
    extra: ' The first session began with a discussion about what the neighbourhood needed. Several people wanted to repair small furniture, while others suggested bicycles and lamps. The volunteers agreed to start with objects that could be handled safely on a shared table. They labelled shelves so that visitors could find screwdrivers and replacement parts without asking each time. A notice near the door explained that every item had to leave with its owner, even if the repair was unfinished. This rule prevented the room becoming a storage space and encouraged visitors to return with better information. After three Saturdays, the group reviewed its notes and changed the timetable. The workshop remained modest, but it was now easier for people to understand how to join. The organisers also invited a local electrician to demonstrate safe checks, which gave nervous visitors confidence without turning the workshop into a professional service.',
    tail: ' The team posted photographs of finished repairs, but always asked owners before sharing them. This small act of respect helped build trust between the volunteers and people bringing objects from home.',
  },

  part5: {
    text: 'The community garden started with a simple idea, but its success depended on careful planning. Each volunteer chose a task that suited their experience, and the organisers kept a record of tools and seeds. A retired teacher explained how to protect young plants, while children learned to recognise insects that help crops grow. When summer became unusually dry, the group collected rainwater and changed the watering schedule. They also shared vegetables with the food bank, which made the project feel connected to the wider neighbourhood. New members are welcome during the Saturday session, although they should contact the coordinator first. The garden is not only a place to grow food; it is also a practical way for neighbours to learn from one another and take responsibility for a shared space.',
    extra: ' The coordinator also checks the visitor book after each session and records suggestions for the following month. This record helps the team decide which tasks should be offered next and welcomes suggestions from regular visitors.',
    specs: [
      { phrase: 'careful planning', options: ['careful', 'carefully', 'care', 'caring'], correctIndex: 0 },
      { phrase: 'kept a record', options: ['kept', 'made', 'did', 'gave'], correctIndex: 0 },
      { phrase: 'protect young plants', options: ['protect', 'protection', 'protective', 'protecting'], correctIndex: 0 },
      { phrase: 'shared vegetables', options: ['shared', 'sharing', 'share', 'shares'], correctIndex: 0 },
      { phrase: 'Saturday session', options: ['Saturday', 'Saturdays', 'saturday', 'weekend'], correctIndex: 0 },
      { phrase: 'take responsibility', options: ['take', 'make', 'do', 'give'], correctIndex: 0 },
    ],
  },

  part6: {
    text: 'Before the garden opened, the organisers checked (27) ........ the ground could drain properly. They invited residents to help, (28) ........ nobody needed previous experience. A notice explained (29) ........ tools were stored and asked visitors to return them after use. The team decided (30) ........ collect rainwater from the centre roof. This meant (31) ........ plants could survive a dry week without using drinking water. Volunteers recorded (32) ........ had watered each plot, so the next person knew what remained to be done.',
    extra: ' The coordinator updates the notice whenever a tool changes location, and members check the list before they leave. This routine helps visitors work independently while keeping the shared room ready for the next group. It also means that a missing screwdriver is reported before it becomes a larger problem. The list is checked weekly.',
    tail: ' The notice is updated whenever the group changes its routine.',
    answers: ['whether', 'although', 'where', 'to', 'the', 'who'],
    targets: ['relative-word', 'conjunction', 'relative-word', 'infinitive', 'article', 'pronoun'],
  },
}
