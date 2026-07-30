// Test 29 — PET B1 Reading (part-time work, youth earning, small business)
export default {
  testNumber: 29,
  id: 'catalog-reading-pet-b1-test29',
  title: 'PET B1 Reading – Test 29',
  level: 'B1',
  examType: 'cambridge',
  timeLimitMinutes: 45,
  totalQuestions: 32,
  parts: [1, 2, 3, 4, 5, 6],

  part1: {
    items: [
      { title: 'Babysitting job reply', text: 'Hi Emma, thanks for your message. Yes, we still need someone for Friday evenings, roughly 6 to 10 p.m. The children are aged four and seven. You would need to prepare a simple dinner and get them to bed. We pay eight pounds an hour. Please send a photo of your first-aid certificate if you have one.', question: 'What must Emma send?', options: ['A first-aid certificate photo.', 'A reference from school.', 'Her bank details.'], answer: 'A' },
      { title: 'Shop shift confirmation', text: 'Dear Sam, your Saturday shift is confirmed: 9 a.m. to 1 p.m. in the card and gift section. Wear the green polo shirt and black trousers. If you are late, go to the staff entrance and ask for Karen. Breaks are fifteen minutes, taken in the back room. Your first pay arrives on the last Friday of the month.', question: 'What should Sam wear?', options: ['A green polo and black trousers.', 'A shop uniform provided on arrival.', 'Any smart clothes.'], answer: 'A' },
      { title: 'Market stall notice', text: 'All stall holders must arrive before 7:30 a.m. on Sunday to set up. Vehicles must leave the square by eight. Tables cost five pounds and are collected from the organiser\'s van. Rubbish must be taken home — no bins are provided. The market closes at two, and stalls cannot pack up before one-thirty.', question: 'What must stall holders do with rubbish?', options: ['Take it home.', 'Leave it under the table.', 'Put it in the market bins.'], answer: 'A' },
      { title: 'Payment reminder text', text: 'Hi Lily, just a reminder that your piano lesson fee of twelve pounds is due by Thursday. You can pay by bank transfer or cash in the lesson. If you miss two consecutive payments, I will need to offer your slot to another student. Let me know if you need to change your lesson time for next term.', question: 'What happens if Lily misses two payments?', options: ['She loses her lesson slot.', 'She pays a fine.', 'Her lessons become shorter.'], answer: 'A' },
      { title: 'Weekend job advert', text: 'Café Sunrise needs a weekend assistant, aged sixteen or over. Duties include serving drinks, clearing tables and washing up. Hours: Saturday and Sunday, 8 a.m. to noon. No experience necessary — full training given. Apply in person with a short note about yourself. Closing date: 12 March.', question: 'How should applicants apply?', options: ['Visit the café with a note.', 'Send an email with a CV.', 'Phone the manager.'], answer: 'A' },
    ],
  },

  part2: {
    domain: 'part-time work and youth earning opportunities',
    options: [
      {
        key: 'option-a',
        title: 'Saturday market assistant for a local bakery',
        openingStyle: 'audience-led',
        description: 'Teenagers aged sixteen and above can earn pocket money helping at a family bakery stall every Saturday morning. Duties include arranging bread displays, serving customers and handling cash. The shift runs from seven until one, and staff take home unsold pastries at the end. No experience is needed; the owner trains new helpers personally.',
        constraints: ['ages 16+', 'Saturday morning', 'cash handling', 'free pastries', 'training provided'],
        imageSlotKey: 'option-a',
      },
      {
        key: 'option-b',
        title: 'After-school homework club helper',
        openingStyle: 'need-led',
        description: 'Do you remember how confusing fractions felt? A local primary school needs patient teenagers to support younger children with reading and maths every Tuesday and Thursday from four to five-thirty. Helpers sit with small groups, check work and offer encouragement. A DBS check is arranged free of charge. Volunteers receive a certificate useful for university applications.',
        constraints: ['twice weekly', 'after school', 'DBS check', 'certificate', 'small groups'],
        imageSlotKey: 'option-b',
      },
      {
        key: 'option-c',
        title: 'Summer holiday lifeguard training and placement',
        openingStyle: 'outcome-led',
        description: 'By the end of this two-week intensive course, participants hold a nationally recognised lifeguard qualification and are guaranteed weekend shifts at the town pool during summer. Training covers rescue techniques, first aid and pool safety. Candidates must be strong swimmers and attend every session. The fee is one hundred and fifty pounds, but most trainees earn it back within three weekends.',
        constraints: ['two weeks', 'qualification', 'guaranteed shifts', 'strong swimmers', 'earn-back'],
        imageSlotKey: 'option-c',
      },
      {
        key: 'option-d',
        title: 'Online tutoring platform for GCSE students',
        openingStyle: 'condition-led',
        description: 'If you scored a grade seven or above in maths or English, you can earn twelve pounds an hour tutoring younger students over video call. The platform matches you with learners, handles scheduling and pays weekly. Sessions last forty-five minutes, and you choose your own availability. A short onboarding video explains how the whiteboard tool works.',
        constraints: ['grade 7+', 'twelve pounds/hour', 'online', 'flexible hours', 'weekly pay'],
        imageSlotKey: 'option-d',
      },
      {
        key: 'option-e',
        title: 'Youth social enterprise incubator',
        openingStyle: 'invitation-led',
        description: 'Fancy turning your idea into a real business? This free six-week programme invites teams of three to five young people to develop a product or service from scratch. A mentor from a local company guides each team through market research, pricing and a final pitch event. The winning team receives five hundred pounds in seed funding. Meetings are Wednesday evenings.',
        constraints: ['six weeks', 'free', 'team-based', 'mentor-guided', 'seed funding prize'],
        imageSlotKey: 'option-e',
      },
      {
        key: 'option-f',
        title: 'Weekend dog-walking service for busy owners',
        openingStyle: 'schedule-led',
        description: 'Every Saturday and Sunday morning, reliable young people collect dogs from owners\' homes and walk them in the park for one hour. The service provides leads, poo bags and a high-vis jacket. Walkers earn seven pounds per dog and can take up to three dogs per session. Owners must book by Thursday evening. A brief meet-and-greet is arranged beforehand.',
        constraints: ['weekend mornings', 'seven pounds/dog', 'max 3 dogs', 'equipment provided', 'advance booking'],
        imageSlotKey: 'option-f',
      },
      {
        key: 'option-g',
        title: 'Charity shop sorting and selling volunteer role',
        openingStyle: 'location-led',
        description: 'At the Oxfam shop on Mill Street, volunteers aged fourteen and above spend Saturday afternoons sorting donations, pricing items and serving customers. The role builds retail skills and supports a good cause. A supervisor is always present, and volunteers can choose between two-hour or four-hour shifts. A reference letter is provided after twenty hours of service.',
        constraints: ['Saturday afternoon', 'ages 14+', 'retail skills', 'flexible shifts', 'reference letter'],
        imageSlotKey: 'option-g',
      },
      {
        key: 'option-h',
        title: 'Freelance graphic design starter course',
        openingStyle: 'feature-led',
        description: 'Practical and portfolio-focused, this eight-session evening course teaches logo design, social media graphics and client communication using free software. A professional designer reviews each student\'s work weekly. By the final session, participants have five portfolio pieces and a template invoice. The course costs forty pounds, and students keep all software afterwards.',
        constraints: ['eight sessions', 'evenings', 'portfolio output', 'free software', 'forty pounds'],
        imageSlotKey: 'option-h',
      },
    ],
    profiles: [
      { key: 'profile-1', text: 'Jade is sixteen and loves animals. She wants a weekend morning job where she can be outdoors and earn a set amount per task without needing experience.', correctOptionKey: 'option-f' },
      { key: 'profile-2', text: 'Marcus got a grade eight in maths and wants flexible evening work he can do from home. He prefers being paid weekly and choosing his own hours.', correctOptionKey: 'option-d' },
      { key: 'profile-3', text: 'Aisha and two friends have an idea for a reusable water bottle brand. They want free mentoring and a chance to pitch for start-up money.', correctOptionKey: 'option-e' },
      { key: 'profile-4', text: 'Ben is fourteen and wants to build retail experience on Saturday afternoons. He would like a reference letter eventually and prefers a role supporting a charity.', correctOptionKey: 'option-g' },
      { key: 'profile-5', text: 'Chloe is a strong swimmer who wants a recognised qualification and guaranteed paid work during the summer holidays. She can commit to daily training for two weeks.', correctOptionKey: 'option-c' },
    ],
  },

  part3: {
    title: 'My first Saturday job',
    paragraphs: [
      'I was fifteen when I got my first paid job, stacking shelves in a small hardware shop near our house. My mum had seen the advert in the window and practically pushed me through the door to apply. The owner, Mr Briggs, looked me up and down and asked if I could lift a twenty-kilogram bag of compost. I said yes, although I had never tried. He told me to start the following Saturday at eight.',
      'That first morning was brutal. The shop opened at nine, but Mr Briggs wanted every shelf reorganised before customers arrived. I carried boxes from the stockroom, matched price labels to products and tried to remember where everything belonged. By eleven, my back ached and my fingers were grey with dust. I kept thinking about my friends, who were still in bed. At one point I hid in the stockroom and seriously considered never coming back.',
      'Things improved after the first month. I learned which regulars needed help and which preferred to browse alone. Mr Briggs, who rarely smiled, began leaving a chocolate biscuit on the counter for me. The other part-time worker, Diane, taught me the shortcut for printing new labels and shared gossip about the difficult customers. Saturday mornings became something I looked forward to, which surprised me more than anyone.',
      'I only worked there for eight months before exams took over. But that job taught me things no classroom could: how to handle money responsibly, how to be punctual when nobody is checking, and how a small kindness like a biscuit can make hard work bearable. Mr Briggs retired two years ago. I still walk past the shop sometimes and feel oddly proud.',
    ],
    questions: [
      { question: 'How did the writer get the job?', options: ['Their mother encouraged them to apply.', 'They saw the advert online.', 'Mr Briggs offered it at school.', 'A friend recommended the shop.'], answer: 'A' },
      { question: 'What was the first morning like?', options: ['Physically tiring and discouraging.', 'Easy and well organised.', 'Fun because of new friends.', 'Shorter than expected.'], answer: 'A' },
      { question: 'What changed after the first month?', options: ['The writer started enjoying the work.', 'Mr Briggs gave a pay rise.', 'The hours became shorter.', 'Diane left the shop.'], answer: 'A' },
      { question: 'What did Mr Briggs do that was kind?', options: ['He left a biscuit on the counter.', 'He gave extra holiday.', 'He reduced the workload.', 'He offered a permanent contract.'], answer: 'A' },
      { question: 'Why did the writer leave the job?', options: ['Exams required more time.', 'They found better pay elsewhere.', 'Mr Briggs dismissed them.', 'They moved to another town.'], answer: 'A' },
    ],
  },

  part4: {
    title: 'Starting a small business at school',
    text: 'It began as a joke in the canteen. My friend Leo said nobody sold decent phone cases at school, and I replied that we should do it ourselves. (16) ..... Within a week, we had ordered twenty cases from a wholesaler online and designed a simple logo on a free app. (17) ..... We sold our first batch during morning break, and every case went within ten minutes. (18) ..... Encouraged by the demand, we expanded to screen protectors and earphone organisers. (19) ..... A teacher warned us that we needed permission from the head, so we wrote a formal proposal and were surprisingly approved. (20) ..... By the end of term, we had made three hundred pounds profit and donated half to the school fund.',
    options: [
      'As a result, we felt like real entrepreneurs for the first time.',
      'Because of that success, other students asked us to stock their designs too.',
      'However, we quickly realised that popularity brought problems.',
      'In addition, we created a shared spreadsheet to track costs and orders.',
      'To our surprise, the initial investment was only forty pounds.',
      'The school shop had been selling the same cases for years.',
      'Leo decided to quit after the first week of trading.',
      'Our parents refused to lend us any start-up money.',
    ],
    answers: ['E', 'D', 'B', 'C', 'A'],
  },

  part5: {
    text: 'When I turned sixteen, I decided to take my finances (21) ..... seriously. I opened a savings account and set (22) ..... a fixed amount from my Saturday job wages each week. My dad was responsible (23) ..... explaining how interest worked, (24) ..... I still found the numbers confusing at first. After three months, I had saved enough (25) ..... a new phone, which felt like a real achievement. Looking back, I wish I had started (26) ..... earlier.',
    items: [
      { correct: 'more', wrong: ['most', 'much', 'many'] },
      { correct: 'aside', wrong: ['up', 'off', 'out'] },
      { correct: 'for', wrong: ['of', 'about', 'with'] },
      { correct: 'although', wrong: ['because', 'so', 'unless'] },
      { correct: 'for', wrong: ['to', 'on', 'at'] },
      { correct: 'saving', wrong: ['save', 'saved', 'to save'] },
    ],
  },

  part6: {
    text: 'Last year, our school joined a youth enterprise programme run (27) ........ the local council. Teams of four had to create a product and sell it (28) ........ a real market day. Our group designed reusable beeswax food wraps, (29) ........ turned out to be surprisingly popular. We spent (30) ........ first Saturday making prototypes in the design room. The judges said (31) ........ our pricing was fair and our stall looked professional. Winning the competition gave us confidence (32) ........ we had never expected.',
    answers: ['by', 'at', 'which', 'our', 'that', 'we'],
    targets: ['preposition', 'preposition', 'relative-word', 'article', 'conjunction', 'pronoun'],
  },
}
