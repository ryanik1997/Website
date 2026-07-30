// Test 24 — PET B1 Reading (school libraries, students, reading corners, quiet study)
export default {
  testNumber: 24,
  id: 'catalog-reading-pet-b1-test24',
  title: 'PET B1 Reading – Test 24',
  level: 'B1',
  examType: 'cambridge',
  timeLimitMinutes: 45,
  totalQuestions: 32,
  parts: [1, 2, 3, 4, 5, 6],

  part1: {
    items: [
      { title: 'Library notice', text: 'The school library closes at four today for a staff meeting. Students may return books through the slot beside the main door. The reading corner remains open until five for quiet study only — no group work.', question: 'What can students do after four?', options: ['Use the reading corner quietly.', 'Borrow new books.', 'Work in groups.', 'Return books to the desk.'], answer: 'A' },
      { title: 'Email from Ms Patel', text: 'Your reserved book "Rivers of Europe" is ready for collection. Please pick it up within three days or it returns to the shelf. The library is open every lunchtime and after school until half past four.', question: 'When must the book be collected?', options: ['Within three days.', 'After half past four.', 'At lunchtime only.', 'Before the meeting.'], answer: 'A' },
      { title: 'Reading club poster', text: 'Join the Thursday reading club! We meet in the library corner from three to four. This term we are reading adventure stories. No need to finish the book each week — just come and enjoy. New members welcome; sign up with Mr Osei.', question: 'What should new members do?', options: ['Sign up with Mr Osei.', 'Finish a book first.', 'Come on Monday.', 'Bring their own books.'], answer: 'A' },
      { title: 'Exam preparation notice', text: 'The library will open early at seven-thirty during exam weeks for silent revision. Students must bring their own materials; no printing is available before eight. Bags go in the lockers outside. Water bottles are allowed but not food.', question: 'What is NOT allowed?', options: ['Food.', 'Water bottles.', 'Silent revision.', 'Own materials.'], answer: 'A' },
      { title: 'Text from Tom', text: 'Hey, are you in the library? I left my blue folder on the study desk near the window. If you see it, can you bring it to Room 12? I have a presentation in ten minutes and I need my notes!', question: 'What does Tom want?', options: ['His folder brought to Room 12.', 'A book returned.', 'Help with a presentation.', 'To meet at the window.'], answer: 'A' },
    ],
  },

  part2: {
    domain: 'study spaces, reading programmes and learning support services',
    options: [
      {
        key: 'option-a',
        title: 'Silent study room with extended evening hours',
        openingStyle: 'schedule-led',
        description: 'Open until nine every weekday during term, this dedicated silent room offers individual desks with reading lamps and power sockets. Students sign in at reception and may stay as long as they like. No talking, no phones and no food — only focused work. The room seats forty and rarely fills before seven.',
        constraints: ['evening hours', 'silent', 'power sockets', 'no phones', 'individual desks'],
        imageSlotKey: 'option-a',
      },
      {
        key: 'option-b',
        title: 'Weekly reading mentoring for struggling students',
        openingStyle: 'need-led',
        description: 'Finding texts difficult? A trained mentor meets small groups of four every Wednesday afternoon to practise reading strategies. Students bring any text they are studying, and the mentor helps with vocabulary, summarising and confidence. The programme runs for eight weeks and is free for enrolled students.',
        constraints: ['struggling readers', 'small group', 'free', 'eight weeks', 'Wednesday afternoon'],
        imageSlotKey: 'option-b',
      },
      {
        key: 'option-c',
        title: 'Weekend study café with group tables',
        openingStyle: 'location-led',
        description: 'In the converted greenhouse behind the science block, students gather on Saturday mornings to revise together. Long tables encourage discussion, and a volunteer supervisor keeps noise at a productive level. Tea and biscuits are available for a small coin. The space opens at nine and closes at one.',
        constraints: ['Saturday morning', 'group work', 'snacks available', 'supervised', 'closes at one'],
        imageSlotKey: 'option-c',
      },
      {
        key: 'option-d',
        title: 'Online reading challenge with digital badges',
        openingStyle: 'feature-led',
        description: 'Gamified and self-directed, this six-week challenge asks students to read six books and write short reviews on a school platform. Each completed review earns a digital badge, and the top readers win a bookshop voucher. Students choose their own books from any genre. A teacher checks reviews weekly for quality.',
        constraints: ['online', 'self-directed', 'digital rewards', 'six books', 'teacher feedback'],
        imageSlotKey: 'option-d',
      },
      {
        key: 'option-e',
        title: 'Lunchtime quiet reading corner for younger pupils',
        openingStyle: 'audience-led',
        description: 'Younger children aged seven to ten enjoy a cosy corner with cushions, picture books and short chapter novels every lunchtime. A librarian reads aloud for the first ten minutes, then pupils browse or read independently. The space is carpeted and shoe-free. No sign-up needed; just walk in and settle down.',
        constraints: ['younger pupils', 'lunchtime', 'no sign-up', 'cosy space', 'read-aloud'],
        imageSlotKey: 'option-e',
      },
      {
        key: 'option-f',
        title: 'Exam revision bootcamp with past papers',
        openingStyle: 'condition-led',
        description: 'If your exams start within six weeks, this intensive afternoon programme helps you practise under timed conditions. A subject teacher provides past papers, marks answers and explains common mistakes. Sessions run Monday to Thursday from four to six. Places are limited to twenty and require a teacher referral.',
        constraints: ['exam preparation', 'timed practice', 'teacher marking', 'referral needed', 'weekday afternoons'],
        imageSlotKey: 'option-f',
      },
      {
        key: 'option-g',
        title: 'Community library reading group for teenagers',
        openingStyle: 'invitation-led',
        description: 'Come and share your opinions on this month\'s chosen novel! The public library hosts a monthly discussion for thirteen-to-seventeen-year-olds on the last Friday evening. A youth worker leads the conversation, and snacks are provided. Members vote on the next book together. Entry is free and new faces are always welcome.',
        constraints: ['teenagers', 'monthly', 'free', 'discussion-based', 'Friday evening'],
        imageSlotKey: 'option-g',
      },
      {
        key: 'option-h',
        title: 'Morning study skills workshop for new students',
        openingStyle: 'outcome-led',
        description: 'After three Saturday sessions, students leave with a personal revision timetable and note-taking system they actually use. A learning coach covers memory techniques, essay planning and time management in a small seminar room. The course runs on three consecutive Saturdays from ten to twelve. Materials are included.',
        constraints: ['new students', 'three sessions', 'Saturday morning', 'materials included', 'practical skills'],
        imageSlotKey: 'option-h',
      },
    ],
    profiles: [
      { key: 'profile-1', text: 'Amir finds reading difficult and loses confidence in class. His teacher recommends a small supportive group where he can practise strategies with texts he is already studying, without paying a fee.', correctOptionKey: 'option-b' },
      { key: 'profile-2', text: 'Lucy has exams in five weeks and needs timed practice with real past papers. She wants a teacher to mark her work and explain mistakes. Her form tutor can provide a referral.', correctOptionKey: 'option-f' },
      { key: 'profile-3', text: 'Kofi is nine and loves stories but has no quiet space at home. He wants a cosy lunchtime spot where someone reads aloud and he can browse books without signing up.', correctOptionKey: 'option-e' },
      { key: 'profile-4', text: 'Mei prefers to study alone in silence after school. She needs power for her laptop, a desk lamp and no distractions. She can stay until nine if the room is open.', correctOptionKey: 'option-a' },
      { key: 'profile-5', text: 'Jack is thirteen and enjoys arguing about books with friends. He wants a monthly evening group at the public library where teenagers choose what to read next and eat snacks.', correctOptionKey: 'option-g' },
    ],
  },

  part3: {
    title: 'The reading corner that changed my school',
    paragraphs: [
      'When our head teacher announced plans for a new reading corner, most students shrugged. We already had a library, and nobody thought a few cushions and a bookshelf would change anything. But Mrs Adeyemi, our librarian, had a different vision. She did not want another silent room with rules; she wanted a place where reading felt like a choice, not a punishment. She spent the summer choosing books that reflected our lives — stories about football, music, families like ours — and arranged the space with soft lighting and bean bags.',
      'The corner opened in September, and something unexpected happened. Students who had never voluntarily opened a book began dropping in at lunchtime. The rule was simple: read anything, or read nothing, but no phones and no talking above a whisper. Mrs Adeyemi never forced recommendations; she simply left interesting books face-up on tables. Within a month, the corner was full every lunch, and students queued for the most popular titles.',
      'A year later, the school\'s reading scores improved, but Mrs Adeyemi says that is not the point she cares about. What matters, she explains, is that students now see themselves as readers. They recommend books to each other, argue about endings and ask when the next delivery arrives. The reading corner did not just improve grades; it changed how an entire school thinks about books.',
    ],
    questions: [
      { question: 'What was Mrs Adeyemi\'s main goal?', options: ['To make reading feel like a choice.', 'To replace the library.', 'To improve test scores quickly.', 'To enforce silence.'], answer: 'A' },
      { question: 'How did she choose the books?', options: ['She picked stories reflecting students\' lives.', 'She ordered the cheapest options.', 'She asked the head teacher.', 'She copied another school\'s list.'], answer: 'A' },
      { question: 'What was the only rule in the corner?', options: ['No phones and whispering only.', 'Read for thirty minutes minimum.', 'Write a review after each book.', 'Sit in assigned seats.'], answer: 'A' },
      { question: 'What happened within a month?', options: ['The corner was full every lunch.', 'Students stopped reading.', 'The head teacher closed it.', 'Teachers banned phones everywhere.'], answer: 'A' },
      { question: 'What does Mrs Adeyemi value most?', options: ['Students seeing themselves as readers.', 'Higher reading scores.', 'A quieter school.', 'More book donations.'], answer: 'A' },
    ],
  },

  part4: {
    title: 'Starting a school book club',
    text: 'Last year, I decided to start a book club because I was tired of reading alone. (16) ..... I put up a poster in the corridor and hoped someone would respond. (17) ..... To my surprise, eight students signed up on the first day. (18) ..... We agreed to meet every Thursday and choose books by voting. (19) ..... Our first discussion was awkward, but everyone relaxed after a few weeks. (20) ..... The club now has twenty members, and we even invited an author to visit our school.',
    options: [
      'I chose the school library because it was warm and had comfortable chairs.',
      'My friend offered to make biscuits for the first meeting.',
      'This democratic approach meant everyone felt ownership.',
      'Some members were shy at first and barely spoke.',
      'That author visit was the proudest moment of my school year.',
      'Nobody showed any interest in joining.',
      'The head teacher cancelled the club immediately.',
      'We argued about every single decision.',
    ],
    answers: ['A', 'B', 'C', 'D', 'E'],
  },

  part5: {
    text: 'The reading corner was created (21) ..... a librarian who wanted something different. She chose books (22) ..... reflected students\' real interests. The only rule was (23) ..... use phones or talk loudly. At first, teachers doubted (24) ..... students would use the space voluntarily. Within a month, it was (25) ..... popular that students queued at lunch. The school now believes reading should feel like a choice (26) ..... a punishment.',
    items: [
      { correct: 'by', wrong: ['from', 'with', 'of'] },
      { correct: 'that', wrong: ['what', 'who', 'where'] },
      { correct: 'not to', wrong: ['to not', 'no', 'don\u2019t'] },
      { correct: 'whether', wrong: ['that', 'what', 'which'] },
      { correct: 'so', wrong: ['very', 'too', 'such'] },
      { correct: 'rather than', wrong: ['instead', 'more than', 'less than'] },
    ],
  },

  part6: {
    text: 'The reading corner was designed (27) ........ Mrs Adeyemi, the school librarian. It is open (28) ........ lunchtime every day. Students can read (29) ........ they like, from comics to novels. There are no phones allowed, (30) ........ the atmosphere stays calm. The school says (31) ........ reading scores have improved (32) ........ the corner opened last September.',
    answers: ['by', 'at', 'whatever', 'so', 'that', 'since'],
    targets: ['preposition', 'preposition', 'pronoun', 'conjunction', 'conjunction', 'conjunction'],
  },
}
