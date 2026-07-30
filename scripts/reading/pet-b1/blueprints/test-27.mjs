// Test 27 — PET B1 Reading (coding clubs, digital skills, online safety)
export default {
  testNumber: 27,
  id: 'catalog-reading-pet-b1-test27',
  title: 'PET B1 Reading – Test 27',
  level: 'B1',
  examType: 'cambridge',
  timeLimitMinutes: 45,
  totalQuestions: 32,
  parts: [1, 2, 3, 4, 5, 6],

  part1: {
    items: [
      { title: 'Coding club sign-up email', text: 'Welcome to Code Ninjas! Your first session is Wednesday 4–6 p.m. in the ICT room. Bring a USB stick for saving projects. No experience needed — we start with Scratch. If you miss the first week, you can still join the following Wednesday. Speak to Mr Adeyemi if you need a club laptop.', question: 'What should members bring?', options: ['A USB stick.', 'Their own laptop.', 'A printed code.'], answer: 'A' },
      { title: 'App update notification', text: 'Version 3.2 of StudyBuddy is now available. This update fixes the calendar sync bug and adds dark mode. Your saved notes are unaffected. The app requires 45 MB of free space. Update over Wi-Fi to avoid mobile data charges. Contact support if the download fails twice.', question: 'What should users do to save data?', options: ['Update over Wi-Fi.', 'Delete old notes first.', 'Restart their phone.'], answer: 'A' },
      { title: 'Online safety poster', text: 'Think before you post! Once something is online, you cannot fully delete it. Never share your password, even with close friends. If a message makes you uncomfortable, screenshot it and tell a trusted adult. Your school counsellor is available every break time in Room 8 for confidential chats.', question: 'What should you do about an upsetting message?', options: ['Screenshot it and tell an adult.', 'Reply angrily.', 'Delete your account immediately.'], answer: 'A' },
      { title: 'IT support ticket reply', text: 'Hi Jordan, your password has been reset. Use the temporary code TEMP-4471 to log in, then change it immediately to something only you know. Do not use your name or birthday. If you are locked out again, visit the IT office during lunch. Tickets close after 48 hours of inactivity.', question: 'What must Jordan do after logging in?', options: ['Change the temporary password.', 'Reply to the ticket.', 'Visit the IT office.'], answer: 'A' },
      { title: 'Website message', text: 'Your order of wireless headphones will arrive Thursday. Track your parcel using code WH-99218. If you are not home, the courier leaves it with a neighbour or in your recycling bin. Returns are free within fourteen days. Register your product on our site to extend the warranty to two years.', question: 'How can the buyer get a longer warranty?', options: ['Register the product online.', 'Pay an extra fee.', 'Return and reorder.'], answer: 'A' },
    ],
  },

  part2: {
    domain: 'coding clubs, digital skills and online safety courses',
    options: [
      {
        key: 'option-a',
        title: 'After-school app building club for Year 7 to 9',
        openingStyle: 'condition-led',
        description: 'If your child has ever said "I wish I could make my own app," this is the place to start. Over ten Thursday afternoons, students design, code and test a simple mobile app using a visual programming tool. No prior coding knowledge is required. Each student finishes with a working app they can show friends. Laptops are provided; just bring ideas.',
        constraints: ['ten weeks', 'Thursday afternoon', 'no experience', 'laptops provided', 'working output'],
        imageSlotKey: 'option-a',
      },
      {
        key: 'option-b',
        title: 'Saturday robotics lab for teenagers',
        openingStyle: 'schedule-led',
        description: 'Every Saturday from ten to twelve, teenagers build and programme small robots in a fully equipped lab. Sessions progress from basic motor control to sensor-based navigation and line-following challenges. Teams of three compete in a mini tournament at the end of each term. The lab holds twelve participants, so booking ahead is essential.',
        constraints: ['Saturday morning', 'team-based', 'termly tournament', 'limited places', 'progressive'],
        imageSlotKey: 'option-b',
      },
      {
        key: 'option-c',
        title: 'Online safety workshop for parents and carers',
        openingStyle: 'feature-led',
        description: 'Practical and jargon-free, this two-hour evening session helps adults understand the apps, games and social platforms their children use. A safeguarding officer demonstrates privacy settings, explains grooming warning signs and shows how to set up parental controls. Attendees leave with a printed family agreement template. Free for school families.',
        constraints: ['two hours', 'evening', 'for parents', 'printed template', 'free'],
        imageSlotKey: 'option-c',
      },
      {
        key: 'option-d',
        title: 'Weekend game design jam at the library',
        openingStyle: 'location-led',
        description: 'In the community room above Harborough Library, young people aged twelve to sixteen spend a full Saturday creating a computer game from scratch. Mentors from a local studio guide each team through storyboarding, pixel art and basic scripting. Pizza is provided, and every team presents their game at four p.m. Entry is five pounds.',
        constraints: ['full Saturday', 'library venue', 'mentored', 'pizza included', 'ages 12-16'],
        imageSlotKey: 'option-d',
      },
      {
        key: 'option-e',
        title: 'Digital photography and editing masterclass',
        openingStyle: 'outcome-led',
        description: 'After three Sunday sessions, participants will have a portfolio of ten edited photographs and the skills to shoot in manual mode. A professional photographer covers composition, lighting and free editing software. Bring any camera with manual settings, including older models. The final session includes a group exhibition at the community centre.',
        constraints: ['three Sundays', 'portfolio output', 'manual camera', 'exhibition', 'editing software'],
        imageSlotKey: 'option-e',
      },
      {
        key: 'option-f',
        title: 'Lunchtime podcast recording club',
        openingStyle: 'invitation-led',
        description: 'Fancy hearing your voice on a real podcast? Join a small group of students who plan, record and publish a weekly episode about school life. Meetings are every Tuesday at lunch in the media room. You can present, operate the microphone, or edit audio — all roles are welcome. Episodes go live on the school website every Friday.',
        constraints: ['weekly', 'lunchtime', 'published output', 'varied roles', 'small group'],
        imageSlotKey: 'option-f',
      },
      {
        key: 'option-g',
        title: 'Coding bootcamp for career changers',
        openingStyle: 'need-led',
        description: 'Stuck in a job with no prospects? This intensive twelve-week evening bootcamp teaches web development from HTML to JavaScript. No degree or technical background is needed. A careers adviser helps with CV writing and interview prep in the final fortnight. Payment plans spread the cost over six months. Graduates join an alumni network for job leads.',
        constraints: ['twelve weeks', 'evenings', 'career support', 'payment plan', 'alumni network'],
        imageSlotKey: 'option-g',
      },
      {
        key: 'option-h',
        title: 'Senior citizens tablet and smartphone clinic',
        openingStyle: 'audience-led',
        description: 'Older adults who feel left behind by technology can drop into this patient, friendly clinic every Monday and Thursday morning. Volunteers help with video calls, online shopping, NHS appointments and photo sharing. No question is too basic, and sessions last as long as needed. Bring your own device; chargers and large-print guides are available.',
        constraints: ['older adults', 'drop-in', 'twice weekly', 'patient pace', 'bring own device'],
        imageSlotKey: 'option-h',
      },
    ],
    profiles: [
      { key: 'profile-1', text: 'Ravi is fourteen and wants to build robots with friends on Saturday mornings. He enjoys competition and does not mind committing to a full term.', correctOptionKey: 'option-b' },
      { key: 'profile-2', text: 'Mrs Thompson is seventy and struggles to video-call her grandchildren. She wants a relaxed morning session where she can ask basic questions without feeling rushed.', correctOptionKey: 'option-h' },
      { key: 'profile-3', text: 'Jake is twelve and dreams of making his own mobile game. He is free on Thursdays after school and has never written code before.', correctOptionKey: 'option-a' },
      { key: 'profile-4', text: 'Sandra is a mother of two teenagers and worries about their online safety. She wants a practical evening talk that shows her how to set up controls and spot risks.', correctOptionKey: 'option-c' },
      { key: 'profile-5', text: 'Omar is thirty-five and wants to leave his warehouse job for a tech career. He can study in the evenings and needs help with interviews and CVs.', correctOptionKey: 'option-g' },
    ],
  },

  part3: {
    title: 'The coding competition that surprised everyone',
    paragraphs: [
      'When Mr Osei announced that our school would enter a national coding competition, most of us groaned. Coding club was small, and we had never beaten the big city schools with their fancy labs and private tutors. But Mr Osei was determined. He divided our eight members into two teams and gave us six weeks to build a program that solved a real community problem. My team chose to create a simple app that reminded elderly neighbours when their bins needed putting out.',
      'The first two weeks were frustrating. We argued about which programming language to use, and our code kept crashing. I remember staring at the screen at nine p.m. on a Friday, wondering why I had not chosen an easier hobby. Then Yuki, our quietest member, quietly rewrote the entire database structure over the weekend. On Monday, everything worked. We stopped arguing and started building.',
      'The competition day was held in a university lecture hall with forty teams from across the country. We felt small. The judges spent ten minutes with each team, asking questions and testing the programs. When they reached us, I explained our app while Yuki demonstrated it on a tablet. One judge asked why we had chosen such a "small" problem. I said that small problems affect real people every single week.',
      'We did not win first place. We came fourth, which Mr Osei called "the best result this school has ever had." But the real surprise came a month later: the local council emailed asking if they could trial our app with fifty households. Yuki nearly fell off her chair. We were not the best coders in the country, but we had built something that mattered, and that turned out to be worth more than a trophy.',
    ],
    questions: [
      { question: 'How did students initially react to the competition?', options: ['They were unenthusiastic.', 'They were excited.', 'They demanded extra lessons.', 'They chose their own teams.'], answer: 'A' },
      { question: 'What changed the team\'s progress?', options: ['Yuki rewrote the database over the weekend.', 'Mr Osei hired a tutor.', 'They switched programming languages.', 'They copied another team\'s idea.'], answer: 'A' },
      { question: 'Why did the writer\'s team choose their project?', options: ['It solved a real community problem.', 'It was the easiest option.', 'The judges suggested it.', 'They wanted to impress the council.'], answer: 'A' },
      { question: 'What happened at the competition?', options: ['They came fourth.', 'They won first place.', 'Their app crashed.', 'They were disqualified.'], answer: 'A' },
      { question: 'What was the "real surprise"?', options: ['The council wanted to trial their app.', 'They received a cash prize.', 'Yuki became famous.', 'Mr Osei left the school.'], answer: 'A' },
    ],
  },

  part4: {
    title: 'Starting a school podcast',
    text: 'Nobody believed a school podcast would work when I first suggested it. (16) ..... The head teacher agreed to lend us the media room, but only for one term as a trial. (17) ..... We recorded our first episode on a cracked microphone, and the sound quality was terrible. (18) ..... Despite that, fifty students listened to the first upload within two days. (19) ..... A local business then offered to sponsor better equipment in exchange for a short mention each episode. (20) ..... By the end of term, we had twelve episodes and a waiting list of students who wanted to present.',
    options: [
      'As a result, the head teacher extended the trial for a full year.',
      'At first, I thought nobody would bother listening.',
      'Consequently, we could finally afford proper headphones and a mixer.',
      'However, I refused to give up because I loved the idea.',
      'To begin with, we had no budget and borrowed everything.',
      'The podcast was banned after the second episode.',
      'Every student in the school already had their own podcast.',
      'We needed a professional studio to record anything.',
    ],
    answers: ['D', 'E', 'B', 'C', 'A'],
  },

  part5: {
    text: 'Many schools have introduced tablets (21) ..... the classroom over the past five years. Teachers report that students pay attention (22) ..... longer when lessons include interactive content. However, some parents worry (23) ..... too much screen time. The head teacher insists (24) ..... tablets are only one tool among many. Students still write by hand and read paper books. The key, she says, is (25) ..... technology enhances learning (26) ..... replaces it.',
    items: [
      { correct: 'into', wrong: ['in', 'onto', 'at'] },
      { correct: 'for', wrong: ['at', 'by', 'with'] },
      { correct: 'about', wrong: ['for', 'of', 'on'] },
      { correct: 'that', wrong: ['what', 'how', 'which'] },
      { correct: 'that', wrong: ['whether', 'if', 'how'] },
      { correct: 'not', wrong: ['nor', 'never', 'neither'] },
    ],
  },

  part6: {
    text: 'The robotics workshop (27) ........ my brother attended last term changed his career plans. He learned to build a robot (28) ........ could follow a black line on the floor. The instructor said (29) ........ patience was more important than talent. My brother found (30) ........ surprisingly relaxing to programme small movements. He has (31) ........ decided to study engineering at university. I think he would recommend the workshop (32) ........ anyone who enjoys solving puzzles.',
    answers: ['that', 'which', 'that', 'it', 'now', 'to'],
    targets: ['relative-word', 'relative-word', 'conjunction', 'pronoun', 'adverb', 'preposition'],
  },
}
