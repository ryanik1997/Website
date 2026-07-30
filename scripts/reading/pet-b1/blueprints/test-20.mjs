// Test 20 — PET B1 Reading (street murals, artists, public walls, neighbourhood stories)
export default {
  testNumber: 20,
  id: 'catalog-reading-pet-b1-test20',
  title: 'PET B1 Reading – Test 20',
  level: 'B1',
  examType: 'cambridge',
  timeLimitMinutes: 45,
  totalQuestions: 32,
  parts: [1, 2, 3, 4, 5, 6],

  part1: {
    items: [
      { title: 'Mural festival notice', text: 'The High Street mural festival begins Saturday at ten. Artists will paint four walls along the old market row. Visitors may watch but must stay behind the barriers. Free maps are available at the library entrance.', question: 'What should visitors do?', options: ['Stay behind the barriers.', 'Help the artists paint.', 'Collect maps from the market.', 'Arrive before ten.'], answer: 'A' },
      { title: 'Text from Jake', text: 'Hey, the wall behind the sports hall is being repainted tomorrow. If you want to add your name to the design, send it to me before midnight. The artist chooses five names only.', question: 'What does Jake want?', options: ['Names before midnight.', 'Help painting tomorrow.', 'A new sports hall.', 'Five volunteers.'], answer: 'A' },
      { title: 'Community board', text: 'The council has approved a new mural on the bridge wall. Work starts next month and the road stays open. Residents who live nearest the bridge will receive a letter about noise during the first week.', question: 'What will nearby residents get?', options: ['A letter about noise.', 'A closed road notice.', 'Free paint.', 'A new bridge.'], answer: 'A' },
      { title: 'Art class email', text: 'Your place on the mural design course is confirmed. Bring pencils and a ruler to the first session. You do not need paint — we provide everything for the practical wall work on day two.', question: 'What should students bring?', options: ['Pencils and a ruler.', 'Paint and brushes.', 'Nothing at all.', 'A ladder.'], answer: 'A' },
      { title: 'Shop window sign', text: 'Sorry — our front wall is being cleaned this week, so the entrance is around the side. The shop is open as usual. Please watch for wet paint near the back door until Friday.', question: 'How do customers enter?', options: ['Around the side.', 'Through the back door.', 'After Friday only.', 'Through the front wall.'], answer: 'A' },
    ],
  },

  part2: {
    domain: 'art classes, creative workshops and cultural activities',
    options: [
      {
        key: 'option-a',
        title: 'Weekend mural painting for confident beginners',
        openingStyle: 'schedule-led',
        description: 'Every Saturday morning, a local artist leads a small group on a public wall project near the bus station. Participants mix colours, learn brush techniques and contribute to a permanent neighbourhood design. All materials are provided and the session ends at one. The four-week course suits people who can commit to regular attendance.',
        constraints: ['Saturday morning', 'beginner', 'materials provided', 'public wall', 'four weeks'],
        imageSlotKey: 'option-a',
        // §6 asset-preservation fixture: these fields must survive regeneration.
        imageSlotId: 'pet-b1-test20-part2-option-a-image',
        assetId: 'asset-pet-b1-test20-option-a',
        alt: 'A heron mural painted on a brick wall beside the bus station',
        media: { kind: 'image', src: '/media/pet-b1/test20/option-a-mural.jpg' },
      },
      {
        key: 'option-b',
        title: 'Evening life drawing at the community studio',
        openingStyle: 'audience-led',
        description: 'People who enjoy working after work gather every Thursday at the studio on Mill Road. A professional model poses for two hours while the tutor circulates with individual feedback. Bring your own pencils and paper; easels are available to borrow. The group welcomes all levels but is popular with those who have drawn before.',
        constraints: ['evening', 'bring own materials', 'all levels', 'tutor feedback', 'easels available'],
        imageSlotKey: 'option-b',
      },
      {
        key: 'option-c',
        title: 'Free photography walk through the old quarter',
        openingStyle: 'location-led',
        description: 'Starting from the market square, this guided walk takes participants past hidden courtyards and decorated doorways. A photographer explains composition and light while the group captures images on phones or cameras. The route is flat and takes about ninety minutes. No booking is needed; just arrive at ten on Sunday.',
        constraints: ['free', 'outdoor walk', 'phone or camera', 'no booking', 'Sunday morning'],
        imageSlotKey: 'option-c',
      },
      {
        key: 'option-d',
        title: 'Intensive weekend ceramics for experienced makers',
        openingStyle: 'condition-led',
        description: 'For makers who have already worked with clay, this two-day workshop pushes your skills further. A visiting potter demonstrates glazing and kiln techniques on Saturday, and participants fire their own pieces on Sunday. The studio is outside town, so transport is essential. Materials cost extra but the kiln fee is included.',
        constraints: ['experienced', 'two days', 'transport needed', 'materials extra', 'kiln included'],
        imageSlotKey: 'option-d',
      },
      {
        key: 'option-e',
        title: 'After-school drama club for under-fourteens',
        openingStyle: 'audience-led',
        description: 'Young people aged ten to fourteen meet every Wednesday after school in the church hall. A drama leader runs games, improvisation and short scene work that builds confidence for shy performers. Parents collect children at five. The term fee is modest and covers a final showing for families.',
        constraints: ['under-14', 'Wednesday afternoon', 'shy performers welcome', 'modest fee', 'final showing'],
        imageSlotKey: 'option-e',
      },
      {
        key: 'option-f',
        title: 'Online creative writing course with weekly feedback',
        openingStyle: 'feature-led',
        description: 'Flexible and self-paced, this six-week course sends a new writing prompt every Monday by email. Participants submit up to five hundred words and receive detailed tutor comments within three days. A live group chat on Friday evenings is optional. Only a computer and internet connection are required.',
        constraints: ['online', 'flexible', 'tutor feedback', 'six weeks', 'computer needed'],
        imageSlotKey: 'option-f',
      },
      {
        key: 'option-g',
        title: 'Monthly heritage storytelling evening at the museum',
        openingStyle: 'invitation-led',
        description: 'Join us on the first Friday of each month for an evening of local stories told by residents and historians. The museum provides tea and seating; attendees simply listen or share a tale of their own. Entry is free, though donations help fund the next exhibition. The hall is step-free and near the tram stop.',
        constraints: ['monthly', 'free', 'step-free', 'near tram', 'listening or sharing'],
        imageSlotKey: 'option-g',
      },
      {
        key: 'option-h',
        title: 'Daytime watercolour course for complete beginners',
        openingStyle: 'outcome-led',
        description: 'By the end of this five-session course, participants will have completed three small paintings suitable for framing. A patient tutor covers washes, colour mixing and simple landscapes in a bright room above the bookshop. Paper and paints are included; learners bring an apron only. Sessions run Tuesday mornings.',
        constraints: ['beginner', 'Tuesday morning', 'materials included', 'five sessions', 'take paintings home'],
        imageSlotKey: 'option-h',
      },
    ],
    profiles: [
      { key: 'profile-1', text: 'Lena has never painted before and wants a patient morning course where everything is supplied. She hopes to take finished work home and can attend every Tuesday.', correctOptionKey: 'option-h' },
      { key: 'profile-2', text: 'Omar is free on Saturdays, enjoys working outdoors on real walls and can commit to four weeks. He has no brushes but wants materials provided.', correctOptionKey: 'option-a' },
      { key: 'profile-3', text: 'Priya is thirteen and quite shy. Her parents want her to try performance activities in a supportive group that meets after school and ends with a family event.', correctOptionKey: 'option-e' },
      { key: 'profile-4', text: 'George works full-time and prefers to study from home at his own pace. He wants regular written feedback on short creative pieces and has a reliable computer.', correctOptionKey: 'option-f' },
      { key: 'profile-5', text: 'Rosa uses a walking frame and enjoys listening to local history. She wants a free monthly event that is easy to reach by tram and does not require booking weeks ahead.', correctOptionKey: 'option-g' },
    ],
  },

  part3: {
    title: 'The wall that changed our street',
    paragraphs: [
      'When the council announced plans to paint the old factory wall, most residents expected another boring grey cover-up. Instead, a young artist named Dana proposed a mural showing the street\'s history: the bakery that once stood on the corner, the children who played hopscotch in the 1960s, and the market traders who still sell fruit on Saturdays. The council agreed, and Dana spent three weeks talking to neighbours before picking up a brush.',
      'The painting took two months. Dana worked from a scaffold each morning while residents brought tea and watched the wall come alive. Some older neighbours corrected details — the bakery door was blue, not green — and Dana happily repainted sections. Children from the primary school added small tiles along the bottom, each showing their own dream for the street. The whole process felt more like a conversation than a construction project.',
      'Since the mural was finished, the street has changed in ways nobody predicted. Tourists stop to photograph it, and a nearby café now opens on Sundays to serve visitors. More importantly, residents say they talk to each other more often. The wall gave them a shared story, and that story is still growing: Dana returns each summer to add a new panel based on recent neighbourhood events.',
    ],
    questions: [
      { question: 'What did Dana do before starting to paint?', options: ['She spoke to local people about the street\'s past.', 'She copied an old photograph.', 'She asked the council for more money.', 'She visited another city\'s mural.'], answer: 'A' },
      { question: 'How did older neighbours help during the painting?', options: ['They corrected historical details.', 'They built the scaffold.', 'They organised the school tiles.', 'They opened a café nearby.'], answer: 'A' },
      { question: 'What did the school children contribute?', options: ['Small tiles showing their dreams.', 'Paint for the scaffold.', 'A written history of the street.', 'Photographs of the bakery.'], answer: 'A' },
      { question: 'What unexpected change happened after the mural was finished?', options: ['Residents began talking to each other more.', 'The factory reopened.', 'The market moved to another street.', 'The council painted more walls grey.'], answer: 'A' },
      { question: 'What does Dana plan to do each summer?', options: ['Add a new panel about recent events.', 'Repaint the whole wall.', 'Teach children to paint.', 'Move the mural to a new location.'], answer: 'A' },
    ],
  },

  part4: {
    title: 'A community art project',
    text: 'Last spring, our neighbourhood decided to turn an empty wall into a public artwork. (16) ..... A local artist was chosen to lead the project, and she began by interviewing long-term residents. (17) ..... Their memories became the basis for the design. (18) ..... Over the following weeks, volunteers prepared the surface and mixed paints. (19) ..... Even children from the nearby school added small contributions along the bottom edge. (20) ..... When the mural was finally revealed, the whole street gathered for a small celebration.',
    options: [
      'First, the council asked people what images mattered to them.',
      'These stories gave the artist real material to work with.',
      'Some residents were unsure at first but soon offered help.',
      'The artist then drew the outline in chalk so everyone could see the plan.',
      'The finished wall now attracts visitors from other parts of town.',
      'Nobody wanted to be involved in the project.',
      'The wall was demolished the following month.',
      'The artist refused to speak to any residents.',
    ],
    answers: ['A', 'B', 'C', 'D', 'E'],
  },

  part5: {
    text: 'The idea of painting a large wall in our street began (21) ..... a simple conversation between neighbours. Nobody expected it to become (22) ..... popular that tourists would visit. The artist worked carefully (23) ..... she was satisfied with every colour. Residents were invited (24) ..... share their memories, and many did so enthusiastically. The project proved (25) ..... art can bring a community closer (26) ..... anyone had imagined.',
    items: [
      { correct: 'from', wrong: ['with', 'by', 'for'] },
      { correct: 'so', wrong: ['very', 'too', 'such'] },
      { correct: 'until', wrong: ['when', 'while', 'because'] },
      { correct: 'to', wrong: ['for', 'that', 'so'] },
      { correct: 'that', wrong: ['what', 'which', 'how'] },
      { correct: 'than', wrong: ['that', 'as', 'from'] },
    ],
  },

  part6: {
    text: 'The mural project started (27) ........ the council agreed to fund the paint. A young artist (28) ........ had grown up nearby was chosen to lead the work. She asked residents (29) ........ they remembered about the old street. Many people said (30) ........ the bakery on the corner was their favourite memory. The children\'s tiles were added (31) ........ the bottom of the wall so that visitors could see them easily. The whole project took longer (32) ........ expected, but everyone agreed the result was worth the wait.',
    answers: ['when', 'who', 'what', 'that', 'along', 'than'],
    targets: ['conjunction', 'relative-word', 'relative-word', 'conjunction', 'preposition', 'conjunction'],
  },
}
