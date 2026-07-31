/**
 * PET B1 Reading Test 16 — Batch 1 Blueprint
 * Topic: sports clubs and fitness activities
 */
export default {
  testNumber: 16,
  golden: false,
  topic: ['swimming pools', 'adult learners', 'fitness routines', 'local clubs'],

  metadata: {
    title: 'PET B1 Reading Test 16',
    difficulty: 'B1',
    themes: {
      part1: 'sports clubs and fitness activities',
      part2: 'sports clubs and fitness activities',
      part3: 'learning to swim as an adult',
      part4: 'organising a weekend tournament',
      part5: 'a new swimming pool opening',
      part6: 'a charity fun run',
    },
  },

  part1: {
    cards: [
      {
        key: 'p1-card-1',
        template: 'timetable-change',
        title: 'Gym timetable change',
        text: 'From Monday, the evening yoga class moves from 6 p.m. to 7.30 p.m. because the hall is being repainted. Members who arrive early can use the stretching room next door. The change is temporary and lasts three weeks.',
        question: {
          stem: 'What should members know?',
          options: [
            { key: 'a1', text: 'The yoga class has a new time for three weeks.' },
            { key: 'a2', text: 'The gym is closing permanently.' },
            { key: 'a3', text: 'Yoga is cancelled this month.' },
            { key: 'a4', text: 'The stretching room is closed.' },
          ],
          correctOptionKey: 'a1',
        },
      },
      {
        key: 'p1-card-2',
        template: 'notice',
        title: 'Match update',
        text: 'Saturday\u2019s football match will start at 2 p.m. instead of 3 p.m. because the pitch is booked for another game afterwards. Players should arrive thirty minutes early to warm up. Bring both shirt colours in case of a clash.',
        question: {
          stem: 'Why has the start time changed?',
          options: [
            { key: 'b1', text: 'The weather forecast is bad.' },
            { key: 'b2', text: 'Another game follows on the same pitch.' },
            { key: 'b3', text: 'Players requested an earlier start.' },
            { key: 'b4', text: 'The referee is unavailable later.' },
          ],
          correctOptionKey: 'b2',
        },
      },
      {
        key: 'p1-card-3',
        template: 'notice',
        title: 'Equipment notice',
        text: 'The tennis court net has been repaired, but the surface is still wet after yesterday\u2019s rain. Do not play until the notice is removed. Members may borrow rackets from reception during opening hours if their own are being restrung.',
        question: {
          stem: 'What can members do now?',
          options: [
            { key: 'c1', text: 'Play on the tennis court.' },
            { key: 'c2', text: 'Borrow rackets from reception.' },
            { key: 'c3', text: 'Repair the net themselves.' },
            { key: 'c4', text: 'Book the court online.' },
          ],
          correctOptionKey: 'c2',
        },
      },
      {
        key: 'p1-card-4',
        template: 'school-announcement',
        title: 'School announcement',
        text: 'Year 9 students must return signed permission forms before Friday\u2019s swimming trip. Students without a form will stay in school and attend an alternative lesson. The bus leaves at 8.45 a.m. sharp from the main gate.',
        question: {
          stem: 'What happens without a signed form?',
          options: [
            { key: 'd1', text: 'The student misses the trip.' },
            { key: 'd2', text: 'The bus leaves without them.' },
            { key: 'd3', text: 'They can sign it on the bus.' },
            { key: 'd4', text: 'The trip is cancelled.' },
          ],
          correctOptionKey: 'd1',
        },
      },
      {
        key: 'p1-card-5',
        template: 'service-confirmation',
        title: 'Service confirmation',
        text: 'Your personal training session is confirmed for Wednesday at 5 p.m. with Coach Daniels. Please bring water, a towel and indoor trainers. If you need to cancel, do so before 1 p.m. on the day to avoid a charge.',
        question: {
          stem: 'What is the cancellation deadline?',
          options: [
            { key: 'e1', text: 'Wednesday at 5 p.m.' },
            { key: 'e2', text: 'Wednesday at 1 p.m.' },
            { key: 'e3', text: 'Tuesday evening.' },
            { key: 'e4', text: 'The following Wednesday.' },
          ],
          correctOptionKey: 'e2',
        },
      },
    ],
  },

  part2: {
    domain: 'sports clubs and fitness activities',
    options: [
      {
        key: 'option-a',
        title: 'Gentle evening running group in the park',
        openingStyle: 'activity-led',
        description: 'Running at a gentle pace through the park, this weekday evening group welcomes complete beginners. A coach leads warm-up stretches before setting off, and everyone finishes together at the café for a chat. No equipment is needed beyond a pair of trainers. The group meets twice a week and never leaves anyone behind.',
        constraints: ['weekday evening', 'beginner', 'no equipment', 'social finish', 'coach-led'],
        imageSlotKey: 'option-a',
      },
      {
        key: 'option-b',
        title: 'Family cycling on quiet country lanes',
        openingStyle: 'audience-led',
        description: 'Flat, quiet country lanes make this Saturday morning cycle ride a favourite with families; children aged six and above are welcome. The route is short and includes a snack stop halfway. Helmets are compulsory but can be borrowed free of charge. The club is social and unhurried, with no pressure to keep up with faster riders.',
        constraints: ['saturday morning', 'family-friendly', 'flat route', 'helmets borrowed', 'social'],
        imageSlotKey: 'option-b',
      },
      {
        key: 'option-c',
        title: 'Free lunchtime walk along the river',
        openingStyle: 'condition-led',
        description: 'Office workers can join this thirty-minute lunchtime walk without booking, fees or special clothing. They meet in the square and follow a comfortable route along the river at whatever pace suits them. The group disbands promptly so everyone returns to work on time. It runs every weekday regardless of weather.',
        constraints: ['lunchtime', 'free', 'no booking', 'short duration', 'all fitness levels'],
        imageSlotKey: 'option-c',
      },
      {
        key: 'option-d',
        title: 'Competitive evening basketball league',
        openingStyle: 'feature-led',
        description: 'Full five-a-side matches with referees enforcing official rules define this advanced evening basketball league. Players must register as a complete team and commit to a seasonal schedule. The hall charges a seasonal fee that covers court hire and insurance. This is not a casual drop-in; it suits experienced players who want structured competition.',
        constraints: ['evening', 'advanced', 'team registration', 'seasonal fee', 'competitive'],
        imageSlotKey: 'option-d',
      },
      {
        key: 'option-e',
        title: 'Chair-based exercises, low impact',
        openingStyle: 'need-led',
        description: 'People who prefer low-impact movement or find standing difficult will suit this short accessible introduction. The instructor demonstrates gentle seated exercises in a ground-floor studio, and each participant receives a printed guide for home practice. Sessions last forty-five minutes and focus on flexibility rather than fitness. No prior experience is expected.',
        constraints: ['accessible', 'low-impact', 'printed guide', 'ground-floor', 'short sessions'],
        imageSlotKey: 'option-e',
      },
      {
        key: 'option-f',
        title: 'Swimming course with progress certificate',
        openingStyle: 'outcome-led',
        description: 'Gain confidence in water and earn a progress certificate after completing six structured lessons. A qualified instructor teaches basic strokes in a warm shallow pool, keeping groups to a maximum of five nervous adults. The fee covers all lessons and the certificate. Participants report feeling calmer in water by the third session.',
        constraints: ['qualified instructor', 'warm shallow pool', 'small group', 'certificate', 'six lessons'],
        imageSlotKey: 'option-f',
      },
      {
        key: 'option-g',
        title: 'Monthly social dance, no partner needed',
        openingStyle: 'invitation-led',
        description: 'Come along once a month to learn simple dance steps from different traditions at the community hall. No partner is required, and the atmosphere is friendly and informal. The afternoon lasts two hours with a tea break in the middle. The hall is slightly outside the town centre, so members arrange their own transport.',
        constraints: ['monthly', 'free', 'no partner', 'informal', 'own transport'],
        imageSlotKey: 'option-g',
      },
      {
        key: 'option-h',
        title: 'Weekend orienteering challenge with medal',
        openingStyle: 'problem-solution-led',
        description: 'Struggling to find an activity that combines physical effort with mental challenge? This weekend orienteering event answers that need. Teams navigate woodland routes using maps while their times are recorded. Finishers receive a medal, and the entry fee covers venue hire and refreshments. It suits people who enjoy problem-solving under pressure.',
        constraints: ['weekend', 'competitive', 'medal', 'team-based', 'higher cost'],
        imageSlotKey: 'option-h',
      },
    ],
    profiles: [
      { key: 'profile-1', text: 'Jake wants a gentle evening activity after work, needs no special equipment and enjoys finishing with a social drink nearby.', correctOptionKey: 'option-a' },
      { key: 'profile-2', text: 'Lena has a young daughter, is free Saturday mornings and wants a short flat route where helmets can be borrowed.', correctOptionKey: 'option-b' },
      { key: 'profile-3', text: 'Omar has a thirty-minute lunch break, wants free exercise outdoors and prefers no booking or commitment.', correctOptionKey: 'option-c' },
      { key: 'profile-4', text: 'Priya is nervous about water, wants a qualified instructor, a warm shallow pool and a certificate after six lessons.', correctOptionKey: 'option-f' },
      { key: 'profile-5', text: 'Tom enjoys competition and teamwork, wants a recorded challenge with a medal and is happy to pay for a weekend event.', correctOptionKey: 'option-h' },
    ],
  },

  part3: {
    title: 'Learning to swim as an adult',
    paragraphs: [
      'When I told my colleague I had signed up for swimming lessons, she looked surprised. Most people learn as children, but I had grown up in a town with no pool and never had the chance. At thirty-four, I decided it was time. The first lesson was on a Tuesday evening, and I nearly stayed home. The changing room felt crowded, and everyone else seemed to know what they were doing.',
      'The instructor, a patient woman named Ruth, asked us to stand in the shallow end and simply breathe. Six of us were in the group, and I noticed that two others also looked uncomfortable. Ruth explained that fear was normal and that nobody would be asked to do anything before they felt ready. That first evening, I managed to put my face in the water for three seconds. It was a small achievement, but I drove home feeling proud.',
      'Progress was slow. After four weeks, I could float on my back, but my legs still sank when I tried to kick. Ruth suggested I practise breathing exercises at home, blowing into a bowl of water during breakfast. I felt silly doing it, but the following week my stroke improved noticeably. Another learner, David, offered to meet on Sundays for extra practice, and having a partner made the effort feel less lonely.',
      'By the end of the course, I could swim two lengths without stopping. The certificate meant less to me than the feeling of control. I now go twice a week, and the pool that once seemed frightening has become the place where my mind goes quiet. Several friends have asked why I started so late, and my answer is always the same: the only wrong time is never.',
    ],
    buildExtension: ' Ruth later told me that adult learners often progress faster than children because they understand why a technique matters. I am not sure that is true, but it made me feel that my slow start had been useful rather than embarrassing. David and I still swim together on Sundays, and last month we entered a short charity race across a lake. We finished near the back, but the experience confirmed that learning something difficult as an adult brings a satisfaction that childhood achievements rarely match.',
    questions: [
      { number: 11, stem: 'Why did the writer almost not attend the first lesson?', options: ['The pool was too far away.', 'They felt nervous and out of place.', 'The instructor had cancelled.', 'The lesson was too expensive.'], correctIndex: 1 },
      { number: 12, stem: 'What helped the writer feel less alone in the group?', options: ['Ruth paired everyone with a partner.', 'Other learners also looked uncomfortable.', 'The writer already knew two people.', 'The class was very small.'], correctIndex: 1 },
      { number: 13, stem: 'Why does the writer mention blowing into a bowl of water?', options: ['To show that Ruth gave unusual homework.', 'To explain how a simple exercise improved their technique.', 'To describe why breakfast was rushed.', 'To prove that swimming is mainly about breathing.'], correctIndex: 1 },
      { number: 14, stem: 'What does the writer suggest about the certificate?', options: ['It was the main reason for joining.', 'It mattered less than the personal achievement.', 'It was more difficult to earn than expected.', 'It qualified them to teach others.'], correctIndex: 1 },
      { number: 15, stem: 'What is the writer\u2019s main message?', options: ['Adults should avoid learning new sports.', 'Swimming is easier than other activities.', 'Starting late is better than not starting at all.', 'Children learn faster than adults.'], correctIndex: 2 },
    ],
  },

  part4: {
    title: 'Organising a weekend tournament',
    layoutParagraphs: [
      'The idea for a weekend football tournament came from a group of parents who watched their children play in the park. They wanted a more organised event, but nobody had experience running one. (16) ..... The first step was to find a suitable pitch.',
      'The council agreed to lend the school field for two days, provided the organisers arranged insurance. This took longer than expected, because several forms had to be signed by different offices. (17) ..... By Thursday, all the paperwork was finally complete.',
      'Sixteen teams registered, which was more than the organisers had planned for. They divided the matches into morning and afternoon blocks so that each team played at least three games. (18) ..... A simple chart on the noticeboard showed who played when.',
      'On Saturday morning, rain made the pitch slippery, and two teams asked to withdraw. The organisers offered them places in the Sunday schedule instead. (19) ..... The remaining teams agreed to shorter halves so the day could finish on time.',
      'By Sunday evening, the winners had been announced and the field was cleared. Several parents said they wanted the tournament to become an annual event. (20) ..... The organising committee already had ideas for next year.',
    ],
    layoutExtensions: [
      'They decided to ask the school for help rather than giving up.',
      'The delay worried everyone, but nobody suggested cancelling.',
      'The timetable meant no team had to wait more than twenty minutes.',
      'This flexibility kept the atmosphere friendly despite the weather.',
      'The success surprised people who had doubted whether it would work.',
    ],
    layoutClosers: [
      'The head teacher was happy because the field would be used positively.',
      'One parent drove to the council office to collect the final stamp.',
      'Children checked the chart between matches to see their next opponent.',
      'Nobody complained about the shorter game, because everyone wanted to play.',
      'A local shop offered to sponsor trophies if the event continued.',
    ],
    options: [
      { key: 'opt-0', text: 'They therefore approached the school, which had a large field.', correctForGap: 16 },
      { key: 'opt-1', text: 'The insurance delay tested everyone\u2019s patience.', correctForGap: 17 },
      { key: 'opt-2', text: 'This arrangement kept the day moving without long waits.', correctForGap: 18 },
      { key: 'opt-3', text: 'The organisers quickly adapted the schedule to suit everyone.', correctForGap: 19 },
      { key: 'opt-4', text: 'The weekend had proved that volunteers could run a successful event.', correctForGap: 20 },
      { key: 'opt-5', text: 'The council refused to lend any public space.', correctForGap: null },
      { key: 'opt-6', text: 'All sixteen teams withdrew before the first match.', correctForGap: null },
      { key: 'opt-7', text: 'The parents decided to hire a professional events company.', correctForGap: null },
    ],
    displayOrder: [6, 2, 7, 0, 5, 3, 1, 4],
    extra: ' The organisers later wrote a short guide for other groups wanting to run a similar event. They listed the forms, the insurance provider and the best way to divide matches by age group. The guide was shared on the school website and downloaded by three neighbouring towns within a month.',
    tail: ' The committee meets again in September to decide whether to expand to twenty teams. They have also discussed adding a netball tournament on the same weekend.',
  },

  part5: {
    title: "The New Swimming Pool Opens",
    title: "The New Swimming Pool Opens",
    text: 'The new swimming pool opened on a bright Saturday morning, and residents had been (21) ..... forward to it for months. Before the doors opened, a long queue had already (22) ..... up outside the entrance. The mayor cut a ribbon and thanked the workers who had (23) ..... the building in under two years. Inside, visitors could try the main pool, a smaller teaching pool and a warm jacuzzi. Children were especially excited, and their laughter (24) ..... the building echo. The council had agreed to (25) ..... entry free for the first week, which attracted families who might not otherwise have visited. By closing time, the atmosphere (26) ..... relaxed, and several parents had already signed their children up for lessons.',
    extra: ' The pool manager said the first month exceeded all expectations. Staff are now planning additional early-morning sessions for people who prefer to swim before work.',
    specs: [
      { phrase: 'been (21) ..... forward', options: ['looking', 'looked', 'look', 'looks'], correctIndex: 0 },
      { phrase: 'had already (22) ..... up', options: ['built', 'made', 'lined', 'set'], correctIndex: 0 },
      { phrase: 'had (23) ..... the building', options: ['completed', 'complete', 'completing', 'completes'], correctIndex: 0 },
      { phrase: 'laughter (24) ..... the building', options: ['made', 'make', 'making', 'makes'], correctIndex: 0 },
      { phrase: 'to (25) ..... entry free', options: ['keep', 'hold', 'stay', 'remain'], correctIndex: 0 },
      { phrase: 'atmosphere (26) ..... relaxed', options: ['remained', 'remaining', 'remain', 'remains'], correctIndex: 0 },
    ],
  },

  part6: {
    title: "Taking Part in a Fun Run",
    title: "Taking Part in a Fun Run",
    text: 'I arrived (27) ........ the fun run just before eight. A friend (28) ........ I had not seen for months was already stretching near the start. The route, (29) ........ followed the river path, was longer than we expected. We had not trained seriously, (30) ........ we decided to walk the uphill sections. Other runners encouraged us, and (31) ........ made the last kilometre feel shorter. By the finish, my legs were tired, but I (32) ........ still smile.',
    extra: ' The organisers gave every finisher a small medal and a bottle of water. Several people stopped to take photographs, and the atmosphere felt more like a celebration than a race.',
    tail: ' I have already registered for next year, although I plan to train a little harder.',
    answers: ['at', 'and', 'which', 'so', 'they', 'could'],
    targets: ['preposition', 'conjunction', 'relative-word', 'linking-word', 'pronoun', 'auxiliary'],
  },
}
