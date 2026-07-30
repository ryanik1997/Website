// Test 21 — PET B1 Reading (weekend workshops, new learners, practical skills, friendly advice)
export default {
  testNumber: 21,
  id: 'catalog-reading-pet-b1-test21',
  title: 'PET B1 Reading – Test 21',
  level: 'B1',
  examType: 'cambridge',
  timeLimitMinutes: 45,
  totalQuestions: 32,
  parts: [1, 2, 3, 4, 5, 6],

  part1: {
    items: [
      { title: 'Workshop reminder', text: 'Your carpentry workshop starts at nine on Sunday. Please wear closed shoes and tie back long hair. We provide wood and tools; you only need to bring a notebook for measurements.', question: 'What must participants bring?', options: ['A notebook.', 'Wood and tools.', 'Open shoes.', 'A hairdryer.'], answer: 'A' },
      { title: 'Notice on the door', text: 'The Saturday bread-making class is full. A second session has been added on Sunday at two. Sign up at reception or online. Ingredients are included in the price.', question: 'What can people do?', options: ['Join the Sunday session.', 'Buy ingredients separately.', 'Attend Saturday anyway.', 'Get a refund.'], answer: 'A' },
      { title: 'Email from the tutor', text: 'Hi everyone, the sewing workshop has moved to Room 3 because the heating in Room 1 is broken. Same time, same day. Bring the fabric you chose last week. Machines are provided.', question: 'What has changed?', options: ['The room number.', 'The day.', 'The time.', 'The machine type.'], answer: 'A' },
      { title: 'Library poster', text: 'Free introductory first-aid session this Saturday, ten to twelve. No experience needed. Places are limited to twenty, so register by Thursday. Certificates are not included but notes will be emailed.', question: 'What must people do by Thursday?', options: ['Register for a place.', 'Collect a certificate.', 'Email their notes.', 'Pay a fee.'], answer: 'A' },
      { title: 'Text from Anna', text: 'The gardening workshop is cancelled this weekend because of frost. The tutor says we should wait until next Saturday when the soil is warmer. Same place, same time. Bring gloves if you have them.', question: 'When is the workshop now?', options: ['Next Saturday.', 'This Sunday.', 'Tomorrow.', 'This Saturday.'], answer: 'A' },
    ],
  },

  part2: {
    domain: 'practical weekend workshops and short courses',
    options: [
      {
        key: 'option-a',
        title: 'Beginner bread baking in a village kitchen',
        openingStyle: 'outcome-led',
        description: 'By Sunday afternoon, participants will have baked two loaves and a batch of rolls to take home. A professional baker explains kneading, proving and shaping in a warm kitchen beside the village hall. Flour and equipment are supplied; learners bring an apron and a bag for leftovers. The class runs from ten to three with a lunch break.',
        constraints: ['beginner', 'take food home', 'equipment supplied', 'weekend', 'lunch break'],
        imageSlotKey: 'option-a',
      },
      {
        key: 'option-b',
        title: 'Saturday bike maintenance for nervous cyclists',
        openingStyle: 'need-led',
        description: 'Worried about fixing a puncture on a quiet road? This hands-on session covers tyre changes, brake adjustments and chain care. A patient mechanic guides groups of six in a covered yard near the station. Bring your own bike; tools and spare parts are provided. The workshop lasts two hours and costs very little.',
        constraints: ['nervous cyclists', 'bring own bike', 'tools provided', 'small group', 'low cost'],
        imageSlotKey: 'option-b',
      },
      {
        key: 'option-c',
        title: 'Weekend furniture restoration at the makerspace',
        openingStyle: 'condition-led',
        description: 'If you have an old chair or table gathering dust, bring it along and learn to sand, repair and refinish it. The makerspace supplies sandpaper, clamps and stains; participants bring the item and old clothes. Sessions run both Saturday and Sunday from ten to four. Some experience with hand tools helps but is not essential.',
        constraints: ['bring own item', 'both weekend days', 'tools experience helpful', 'old clothes', 'makerspace'],
        imageSlotKey: 'option-c',
      },
      {
        key: 'option-d',
        title: 'Introduction to home electrics for new homeowners',
        openingStyle: 'audience-led',
        description: 'People who have recently bought a property often feel unsure about changing a plug or fitting a light. This Saturday course covers safe basics in a training flat downtown. A certified electrician supervises groups of eight. Materials and practice boards are included; no tools needed. The fee is moderate and includes a safety handbook.',
        constraints: ['new homeowners', 'Saturday', 'certified tutor', 'materials included', 'moderate fee'],
        imageSlotKey: 'option-d',
      },
      {
        key: 'option-e',
        title: 'Sunday morning vegetable gardening for flat dwellers',
        openingStyle: 'location-led',
        description: 'On the rooftop terrace above the community centre, participants learn to grow herbs, salad leaves and tomatoes in containers. A gardener demonstrates potting, watering and seasonal planning. Compost and seedlings are provided; attendees take their planted pots home. The session is free and runs from nine to eleven.',
        constraints: ['flat dwellers', 'free', 'take pots home', 'Sunday morning', 'containers'],
        imageSlotKey: 'option-e',
      },
      {
        key: 'option-f',
        title: 'Drop-in phone photography tips at the park',
        openingStyle: 'feature-led',
        description: 'Just arrive at the bandstand at ten on Saturday with any phone — no booking, fees or experience needed. A photographer shares five quick techniques for better outdoor shots, then the group walks the park practising together. The session ends at twelve; participants keep all photos on their own devices.',
        constraints: ['no booking', 'free', 'phone only', 'outdoor', 'Saturday morning'],
        imageSlotKey: 'option-f',
      },
      {
        key: 'option-g',
        title: 'Two-day beginner sewing and alterations course',
        openingStyle: 'schedule-led',
        description: 'Over one full weekend, learners master hemming, button replacement and simple pattern reading. The tutor provides machines and thread; participants bring fabric or an item to alter. Classes run ten to four both days in a bright studio near the market. The course fee covers all consumables and a takeaway repair kit.',
        constraints: ['two days', 'machines provided', 'bring fabric', 'near market', 'repair kit included'],
        imageSlotKey: 'option-g',
      },
      {
        key: 'option-h',
        title: 'Evening candle making with natural ingredients',
        openingStyle: 'invitation-led',
        description: 'Come and discover how to pour soy candles scented with essential oils. This relaxed Friday-evening workshop suits anyone wanting a creative gift or a new hobby. All materials are supplied and each participant leaves with two finished candles. The studio is upstairs, so step-free access is not available.',
        constraints: ['Friday evening', 'take candles home', 'materials supplied', 'no step-free access', 'creative gift'],
        imageSlotKey: 'option-h',
      },
    ],
    profiles: [
      { key: 'profile-1', text: 'Maya lives in a flat with no garden but wants to grow her own food. She is free Sunday mornings and would like to take plants home without paying a fee.', correctOptionKey: 'option-e' },
      { key: 'profile-2', text: 'Tom has just bought his first house and feels nervous about basic electrical jobs. He can attend on Saturday and prefers a course with a certified instructor and included materials.', correctOptionKey: 'option-d' },
      { key: 'profile-3', text: 'Sofia has an old wooden chair she wants to restore. She is free all weekend, does not mind wearing messy clothes and has used hand tools before.', correctOptionKey: 'option-c' },
      { key: 'profile-4', text: 'Ben cycles to work but panics when something goes wrong. He wants a short, cheap session where he can practise on his own bike with expert guidance nearby.', correctOptionKey: 'option-b' },
      { key: 'profile-5', text: 'Clara wants a full weekend of sewing to learn proper alterations. She can bring fabric from home and wants a studio close to the market where she shops.', correctOptionKey: 'option-g' },
    ],
  },

  part3: {
    title: 'Learning to build with my hands',
    paragraphs: [
      'I signed up for a weekend carpentry course almost by accident. A friend mentioned it over lunch, and I thought it would be a pleasant way to spend a Saturday. I had never held a proper saw before, and I assumed everyone else would be experienced. When I arrived, though, I discovered that most of the twelve participants were complete beginners like me, and our tutor, a cheerful woman named Helen, made us feel welcome immediately.',
      'The first morning was surprisingly difficult. Helen showed us how to measure and cut a simple joint, but my hands shook and the wood split twice. She laughed kindly and said that every carpenter ruins timber at the start. By the afternoon, I had managed a clean cut, and the small shelf I was building began to look like something real. The other learners offered tips and encouragement, and the atmosphere felt more like a group of friends than a classroom.',
      'I left on Sunday evening with a rough but functional shelf and a new respect for people who work with their hands daily. The course did not make me a carpenter, but it taught me that patience matters more than talent. I have since built two more shelves at home, and each one is slightly better than the last. Helen was right: everyone ruins timber at the start.',
    ],
    questions: [
      { question: 'Why did the writer join the course?', options: ['A friend mentioned it casually.', 'They needed a shelf for work.', 'They had carpentry experience.', 'They wanted to become a carpenter.'], answer: 'A' },
      { question: 'What surprised the writer on arrival?', options: ['Most participants were also beginners.', 'The tutor was unfriendly.', 'Everyone had brought their own tools.', 'The class was very small.'], answer: 'A' },
      { question: 'What happened during the first morning?', options: ['The writer made mistakes with the wood.', 'The writer finished the shelf quickly.', 'Helen refused to help.', 'The other learners were unkind.'], answer: 'A' },
      { question: 'How does the writer describe the group atmosphere?', options: ['Friendly and supportive.', 'Competitive and stressful.', 'Quiet and formal.', 'Disorganised and confusing.'], answer: 'A' },
      { question: 'What lesson did the writer take from the course?', options: ['Patience matters more than natural talent.', 'Carpentry is easier than expected.', 'Professional training is essential.', 'Working alone produces better results.'], answer: 'A' },
    ],
  },

  part4: {
    title: 'My first repair café visit',
    text: 'Last month, I took a broken lamp to the community repair café. (16) ..... A volunteer examined the cable and found a loose connection. (17) ..... While he worked, he explained what had gone wrong so I could spot the problem next time. (18) ..... The repair took only twenty minutes, and I paid nothing. (19) ..... I also watched other volunteers fixing bicycles and mending torn jackets. (20) ..... By the end of the morning, I felt more confident about trying simple repairs myself.',
    options: [
      'I was nervous because I had never asked a stranger for help like this.',
      'He used a small tool to tighten the wire inside the plug.',
      'This made the whole process feel less mysterious.',
      'Several other visitors were waiting with their own broken items.',
      'The experience convinced me to attend again next month.',
      'The volunteer refused to fix the lamp.',
      'I had to buy expensive replacement parts.',
      'Nobody else was interested in repairing things.',
    ],
    answers: ['A', 'B', 'C', 'D', 'E'],
  },

  part5: {
    text: 'I had never tried making anything (21) ..... my hands before the workshop. The tutor told us (22) ..... worry about mistakes because everyone learns differently. She explained (23) ..... measure the wood carefully before cutting. Most of us found (24) ..... harder than we expected, but nobody gave up. By Sunday, I had made a shelf (25) ..... I am still proud of. The experience was more enjoyable (26) ..... I had imagined.',
    items: [
      { correct: 'with', wrong: ['by', 'from', 'on'] },
      { correct: 'not to', wrong: ['to not', 'don\u2019t', 'no'] },
      { correct: 'how to', wrong: ['what', 'that', 'for'] },
      { correct: 'it', wrong: ['that', 'them', 'this'] },
      { correct: 'that', wrong: ['which', 'what', 'where'] },
      { correct: 'than', wrong: ['that', 'as', 'from'] },
    ],
  },

  part6: {
    text: 'The repair café was started (27) ........ a group of neighbours who hated throwing things away. Volunteers meet (28) ........ the first Saturday of every month. Visitors bring (29) ........ broken items they can carry, and someone tries to fix them. Nobody has to pay, (30) ........ donations are welcome. The organisers say (31) ........ the café has saved hundreds of objects (32) ........ being sent to landfill.',
    answers: ['by', 'on', 'any', 'but', 'that', 'from'],
    targets: ['preposition', 'preposition', 'determiner', 'conjunction', 'conjunction', 'preposition'],
  },
}
