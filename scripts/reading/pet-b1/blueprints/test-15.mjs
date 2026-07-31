/**
 * PET B1 Reading Test 15 — Batch 1 Blueprint
 * Topic: food and cooking classes
 */
export default {
  testNumber: 15,
  golden: false,
  topic: ['food markets', 'home cooks', 'shared kitchens', 'seasonal recipes'],

  metadata: {
    title: 'PET B1 Reading Test 15',
    difficulty: 'B1',
    themes: {
      part1: 'food and cooking classes',
      part2: 'food and cooking classes',
      part3: 'a local cooking competition',
      part4: 'preparing a community kitchen',
      part5: 'a neighbourhood food festival',
      part6: 'joining a cookery club',
    },
  },

  part1: {
    cards: [
      {
        key: 'p1-card-1',
        template: 'email',
        title: 'Cooking-class email',
        text: 'Your pasta session has moved to Room 3 on Thursday. Please bring a clean tea towel and a container for leftovers. The flour and eggs are provided, but you will need your own rolling pin. Arrive five minutes early so we can start on time.',
        question: {
          stem: 'What must participants bring?',
          options: [
            { key: 'a1', text: 'Flour and eggs.' },
            { key: 'a2', text: 'A rolling pin.' },
            { key: 'a3', text: 'A cooking apron.' },
            { key: 'a4', text: 'Extra chairs.' },
          ],
          correctOptionKey: 'a2',
        },
      },
      {
        key: 'p1-card-2',
        template: 'notice',
        title: 'Market notice',
        text: 'The Saturday fruit market will close at one o\u2019clock this week instead of three, because of a street parade. Traders will move their tables to the car park behind the library. Customers who usually collect pre-ordered boxes should arrive before twelve.',
        question: {
          stem: 'What has changed?',
          options: [
            { key: 'b1', text: 'The market location and closing time.' },
            { key: 'b2', text: 'The price of fruit boxes.' },
            { key: 'b3', text: 'The day of the market.' },
            { key: 'b4', text: 'The library opening hours.' },
          ],
          correctOptionKey: 'b1',
        },
      },
      {
        key: 'p1-card-3',
        template: 'website-message',
        title: 'Recipe website message',
        text: 'Thank you for your question about the lemon cake recipe. You can replace butter with the same amount of coconut oil, but do not use olive oil because the flavour is too strong. The baking time stays the same. Let us know how it turns out!',
        question: {
          stem: 'What advice is given?',
          options: [
            { key: 'c1', text: 'Use olive oil for a better taste.' },
            { key: 'c2', text: 'Bake the cake for longer.' },
            { key: 'c3', text: 'Coconut oil can replace butter.' },
            { key: 'c4', text: 'Remove the lemon from the recipe.' },
          ],
          correctOptionKey: 'c3',
        },
      },
      {
        key: 'p1-card-4',
        template: 'booking-confirmation',
        title: 'Booking update',
        text: 'Your bread-making workshop is confirmed for 5 April at 10 a.m. The session lasts two hours and includes all ingredients. Cancel at least 48 hours before the date for a full refund. After that, we can offer a place on another date but cannot return the fee.',
        question: {
          stem: 'What happens if you cancel late?',
          options: [
            { key: 'd1', text: 'You receive a full refund.' },
            { key: 'd2', text: 'You can move to another date.' },
            { key: 'd3', text: 'The workshop is cancelled for everyone.' },
            { key: 'd4', text: 'You must pay an extra fee.' },
          ],
          correctOptionKey: 'd2',
        },
      },
      {
        key: 'p1-card-5',
        template: 'club-instruction',
        title: 'Club instruction',
        text: 'Members of the supper club should bring one dish to share on Friday evening. Please label your container with your name and list any nuts in the ingredients. The kitchen closes at nine, so plan to arrive with your dish ready to serve by seven.',
        question: {
          stem: 'What should members do?',
          options: [
            { key: 'e1', text: 'Cook a dish at the venue.' },
            { key: 'e2', text: 'Arrive before seven with a labelled dish.' },
            { key: 'e3', text: 'Bring ingredients for others.' },
            { key: 'e4', text: 'Stay until the kitchen closes.' },
          ],
          correctOptionKey: 'e2',
        },
      },
    ],
  },

  part2: {
    domain: 'food and cooking classes',
    options: [
      {
        key: 'option-a',
        title: 'Weekday evening Italian cooking for beginners',
        openingStyle: 'schedule-led',
        description: 'Every Thursday from six to eight, a small group gathers at the community centre to make fresh pasta and simple sauces. The tutor supplies all equipment and ingredients, so participants only need to bring themselves. Each session ends with a shared tasting, and learners take home whatever they have cooked. The six-week course suits people who work during the day.',
        constraints: ['weekday evening', 'beginner', 'equipment supplied', 'medium cost', 'take food home'],
        imageSlotKey: 'option-a',
      },
      {
        key: 'option-b',
        title: 'Saturday family baking with children',
        openingStyle: 'audience-led',
        description: 'Families with children aged five and above are welcome to join this relaxed Saturday morning baking session. Adults and children work side by side preparing sweet and savoury recipes, while aprons and mixing bowls are provided. Ingredients cost a small extra amount per family. The atmosphere is social rather than competitive, and the group often shares tea afterwards.',
        constraints: ['saturday morning', 'family-friendly', 'social', 'medium cost', 'aprons provided'],
        imageSlotKey: 'option-b',
      },
      {
        key: 'option-c',
        title: 'Free lunchtime soup taster, no booking',
        openingStyle: 'condition-led',
        description: 'No booking, no fee and no commitment are required for this forty-minute lunchtime session held in the college canteen. Each week, adults try one simple soup or bread recipe and receive printed notes to study later. Walk in during your break, grab an apron from the counter and join whenever a seat is free. Sessions run every Tuesday and Thursday.',
        constraints: ['lunchtime', 'free', 'no booking', 'printed notes', 'short duration'],
        imageSlotKey: 'option-c',
      },
      {
        key: 'option-d',
        title: 'Advanced French pastry masterclass',
        openingStyle: 'feature-led',
        description: 'French pastry techniques form the core of this demanding evening masterclass aimed at experienced home cooks. Participants work independently on croissants, éclairs and tarts while receiving detailed written feedback on each attempt. Specialist tools such as marble slabs and piping sets are provided. The fee is high, reflecting the small class size and premium ingredients.',
        constraints: ['evening', 'advanced', 'independent work', 'high cost', 'specialist tools provided'],
        imageSlotKey: 'option-d',
      },
      {
        key: 'option-e',
        title: 'Quick healthy meals, step-free kitchen',
        openingStyle: 'need-led',
        description: 'People who want quick dinner ideas without a long weekly commitment will appreciate this accessible introduction. The tutor demonstrates step-free recipes in a ground-floor kitchen, and each participant receives a printed recipe booklet to keep. Sessions last ninety minutes and focus on three-ingredient meals that take under twenty minutes. There is no homework and no pressure to return.',
        constraints: ['accessible', 'short commitment', 'recipe booklet', 'ground-floor', 'quick meals'],
        imageSlotKey: 'option-e',
      },
      {
        key: 'option-f',
        title: 'Village hall bread-making workshop',
        openingStyle: 'location-led',
        description: 'In a small village hall ten minutes from the bus stop, learners knead dough by hand and take home a finished loaf. The wood-fired oven limits the group to six people, so places must be reserved well in advance. The workshop runs on selected weekends and lasts three hours. A cup of tea and a slice of warm bread await at the end.',
        constraints: ['weekend', 'small group', 'advance booking', 'hands-on', 'take bread home'],
        imageSlotKey: 'option-f',
      },
      {
        key: 'option-g',
        title: 'Monthly supper club, everyone cooks',
        openingStyle: 'invitation-led',
        description: 'Join a friendly group of home cooks who meet once a month to prepare and share a themed meal together. The host announces the theme two weeks ahead, and each member contributes one course. The evening is informal and laughter-filled, with no judging or scoring. Members arrange their own transport, as the venue rotates between houses.',
        constraints: ['monthly', 'free', 'informal', 'own transport', 'shared cooking'],
        imageSlotKey: 'option-g',
      },
      {
        key: 'option-h',
        title: 'Weekend cooking challenge with certificate',
        openingStyle: 'outcome-led',
        description: 'Earn a recognised certificate by competing in a timed weekend cooking challenge. Teams of three prepare a full three-course meal while judges score presentation, flavour and teamwork under pressure. The entry fee covers ingredients and venue hire. Successful participants receive a printed certificate useful when applying for café or catering work.',
        constraints: ['weekend', 'competitive', 'certificate', 'team-based', 'higher cost'],
        imageSlotKey: 'option-h',
      },
    ],
    profiles: [
      { key: 'profile-1', text: 'Marco works late and wants an evening beginner course where equipment is provided. He has a medium budget and would like to take food home.', correctOptionKey: 'option-a' },
      { key: 'profile-2', text: 'Aisha is free Saturday mornings, has a medium budget and wants a social class she can attend with her young child.', correctOptionKey: 'option-b' },
      { key: 'profile-3', text: 'Ben has one free lunchtime hour, wants a free taster with no booking and prefers to receive printed notes to study later.', correctOptionKey: 'option-c' },
      { key: 'profile-4', text: 'Callum uses a wheelchair, wants a short accessible course with a recipe booklet and does not want a long weekly commitment.', correctOptionKey: 'option-e' },
      { key: 'profile-5', text: 'Diana wants to improve her skills for a future café job, enjoys pressure and would like a certificate to show employers.', correctOptionKey: 'option-h' },
    ],
  },

  part3: {
    title: 'A local cooking competition',
    paragraphs: [
      'Last October, I entered a cooking competition at our community hall for the first time. The event was organised by a local food group, and twelve of us had signed up. Each participant received a basket of ingredients and had ninety minutes to prepare two dishes. I chose a vegetable tart and a mushroom soup, feeling confident until I noticed the woman beside me unpacking professional knives and a metal whisk.',
      'The first hour went smoothly. My tart dough came together quickly, and the soup tasted good when I tested it. Then I made a mistake: I set the oven too high, and the edge of the tart turned black. For a moment, I wanted to give up. Instead, I cut away the burnt part and used the remaining pastry to make a smaller pie. A neighbour at the next table suggested I add cheese to hide the smoky flavour, which proved excellent advice.',
      'In the final thirty minutes, I stopped worrying about presentation and focused on seasoning. The judges tasted everything without knowing who had cooked it. When the results were announced, I came third, behind the woman with the professional knives and a quiet student who had made an impressive fish dish.',
      'What surprised me most was not the result but the atmosphere. Everyone offered advice rather than criticism, and several participants exchanged recipes afterwards. I have since signed up for two more competitions and now practise every weekend with a friend who also took part. My approach has changed completely: instead of following recipes exactly, I try to understand how flavours work together. The burnt tart taught me more about cooking under pressure than any lesson could.',
    ],
    buildExtension: ' Looking back, I realise the competition changed my relationship with food. Before that day, I cooked the same five meals repeatedly and avoided anything unfamiliar. Now I visit the market on Saturdays, looking for ingredients I have never tried. The woman with the professional knives turned out to be a retired teacher who now runs a small supper club, and she invited me to join. I accepted immediately. The experience proved that making a mistake in front of strangers is less frightening than I had imagined, and that local events can create friendships that last well beyond a single afternoon.',
    questions: [
      { number: 11, stem: 'Why did the writer feel less confident at the start?', options: ['The ingredients were unfamiliar.', 'Another participant had professional equipment.', 'The time limit was shorter than expected.', 'The judges were watching immediately.'], correctIndex: 1 },
      { number: 12, stem: 'What did the writer do after the tart burned?', options: ['Asked the judges for extra time.', 'Left the competition early.', 'Used the remaining pastry differently.', 'Copied the neighbour\u2019s recipe.'], correctIndex: 2 },
      { number: 13, stem: 'Why does the writer mention the quiet student?', options: ['To show that unexpected participants can do well.', 'To explain why the tart burned.', 'To criticise the judging process.', 'To suggest the competition was unfair.'], correctIndex: 0 },
      { number: 14, stem: 'What does the writer suggest about the other participants?', options: ['They were mainly professional cooks.', 'They created a supportive atmosphere.', 'They refused to share their recipes.', 'They criticised the writer\u2019s dishes.'], correctIndex: 1 },
      { number: 15, stem: 'What has changed since the competition?', options: ['The writer avoids cooking unfamiliar food.', 'The writer has stopped following recipes completely.', 'The writer now experiments and understands flavours better.', 'The writer wants to become a professional chef.'], correctIndex: 2 },
    ],
  },

  part4: {
    title: 'Preparing a community kitchen',
    layoutParagraphs: [
      'When the old classroom at the community centre became available, a group of residents saw an opportunity. They had wanted a shared cooking space for years, but the cost of renting a professional kitchen was too high. (16) ..... The room needed cleaning, but it already had a sink and electricity.',
      'The first task was to collect basic equipment. Several families donated pans, chopping boards and mixing bowls from their own homes. (17) ..... Within a week, the shelves held enough tools for six people to cook at the same time.',
      'A local electrician checked the wiring and confirmed the room was safe. The group then wrote simple rules about cleaning and food storage. (18) ..... Everyone signed the notice, and a copy was pinned beside the door.',
      'During the first month, only a few residents used the kitchen. Some felt unsure about cooking near strangers, while others simply did not know the timetable. (19) ..... Attendance grew steadily once people understood how to book a slot.',
      'By the end of the term, the kitchen had hosted thirty sessions. The organisers reviewed their notes and agreed the project had succeeded beyond expectation. (20) ..... Plans for a second room were already being discussed.',
    ],
    layoutExtensions: [
      'The change gave the building a new purpose without expensive building work.',
      'The donations meant the project could start without spending shared funds.',
      'The rules kept everyone safe without making the kitchen feel restrictive.',
      'A simple poster and a weekly email solved both problems within days.',
      'The kitchen had become a reason for neighbours to meet and share skills.',
    ],
    layoutClosers: [
      'The centre manager was pleased because the room had been empty for two years.',
      'One resident even brought a set of measuring spoons she had never used.',
      'Visitors who forgot to clean were reminded politely but firmly.',
      'The organiser noticed that regulars began helping newcomers without being asked.',
      'Several users said the kitchen had changed how they thought about their street.',
    ],
    options: [
      { key: 'opt-0', text: 'The empty classroom offered a cheaper solution.', correctForGap: 16 },
      { key: 'opt-1', text: 'A retired chef also donated a set of sharp knives.', correctForGap: 17 },
      { key: 'opt-2', text: 'These conditions reassured people who had never cooked publicly before.', correctForGap: 18 },
      { key: 'opt-3', text: 'The organisers therefore advertised the kitchen more clearly.', correctForGap: 19 },
      { key: 'opt-4', text: 'It had also brought people closer together.', correctForGap: 20 },
      { key: 'opt-5', text: 'The council refused to support any community project.', correctForGap: null },
      { key: 'opt-6', text: 'Nobody in the area had ever cooked a meal at home.', correctForGap: null },
      { key: 'opt-7', text: 'The electrician recommended closing the kitchen permanently.', correctForGap: null },
    ],
    displayOrder: [3, 7, 0, 5, 2, 6, 1, 4],
    extra: ' The kitchen now runs four sessions a week, including a Saturday morning slot for families. Users book through a simple online form, and the organiser confirms each reservation by email. A shared cupboard holds basic ingredients such as oil, flour and salt, so beginners do not need to buy everything before their first visit. The centre has also installed a second hand-washing station, which makes the room easier to share during busy periods.',
    tail: ' The organisers meet monthly to review feedback and adjust the timetable. Their next goal is to invite a nutritionist for a short talk, so that users can learn about balanced meals while they cook.',
  },

  part5: {
    title: "A Neighbourhood Food Festival",
    title: "A Neighbourhood Food Festival",
    text: 'The neighbourhood food festival began as a small idea, but it quickly became an annual event that everyone (21) ..... forward to. On the morning of the festival, volunteers arrived early to (22) ..... tents and tables in the park. Local families prepared dishes from their own cultures, and the smell of spices (23) ..... the air by midday. Children helped by carrying plates and (24) ..... out lemonade to visitors. A local shop owner agreed to (25) ..... the ingredients at a reduced price, which made the event possible without a large budget. Although rain arrived in the afternoon, nobody left early, and the atmosphere (26) ..... cheerful until the music stopped. The organisers later said the festival succeeded because people cared more about sharing than about perfection.',
    extra: ' Since then, the committee has added a recipe exchange board where visitors pin their favourite dishes. This small addition has helped neighbours discover common interests beyond the festival itself.',
    specs: [
      { phrase: 'everyone (21) ..... forward to', options: ['looked', 'moved', 'seeing', 'went'], correctIndex: 0 },
      { phrase: 'to (22) ..... tents', options: ['put up', 'put on', 'put out', 'put away'], correctIndex: 0 },
      { phrase: 'spices (23) ..... the air', options: ['filled', 'full', 'filling', 'fills'], correctIndex: 0 },
      { phrase: 'and (24) ..... out lemonade', options: ['handing', 'hand', 'handed', 'hands'], correctIndex: 0 },
      { phrase: 'to (25) ..... the ingredients', options: ['supply', 'support', 'suppose', 'surround'], correctIndex: 0 },
      { phrase: 'atmosphere (26) ..... cheerful', options: ['remained', 'remaining', 'remain', 'remains'], correctIndex: 0 },
    ],
  },

  part6: {
    title: "Joining a Cookery Club",
    title: "Joining a Cookery Club",
    text: 'When I joined (27) ........ cookery club, I was not sure what to expect. A member (28) ........ had been attending for two years welcomed me at the door. I wanted to leave early, (29) ........ she persuaded me to stay for the main dish. The group meets (30) ........ seven every Thursday evening. Members share tasks, and (31) ........ all contribute something to the meal. I learned to chop vegetables properly, (32) ........ I also discovered how to make a simple sauce from scratch.',
    extra: ' The club keeps a notebook where members write down useful tips. Newcomers are encouraged to add their own suggestions after the first month, which makes the record feel shared rather than fixed.',
    tail: ' The organiser updates the list each term so that recipes stay seasonal.',
    answers: ['the', 'who', 'but', 'at', 'they', 'so'],
    targets: ['article', 'relative-word', 'conjunction', 'preposition', 'pronoun', 'linking-word'],
  },
}
