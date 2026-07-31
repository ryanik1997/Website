/**
 * PET B1 Reading Test 17 — Batch 1 Blueprint
 * Topic: music lessons and performing arts
 */
export default {
  testNumber: 17,
  golden: false,
  topic: ['school concerts', 'young musicians', 'practice routines', 'local stages'],

  metadata: {
    title: 'PET B1 Reading Test 17',
    difficulty: 'B1',
    themes: {
      part1: 'music lessons and performing arts',
      part2: 'music lessons and performing arts',
      part3: 'a school music concert',
      part4: 'planning a music festival',
      part5: 'learning a musical instrument',
      part6: 'a youth orchestra project',
    },
  },

  part1: {
    cards: [
      {
        key: 'p1-card-1',
        template: 'email',
        title: 'Rehearsal schedule email',
        text: 'The choir rehearsal has moved to Wednesday this week because the hall is booked for a conference on Thursday. Please arrive at 6.15 p.m. so we can start promptly. Bring your folder and a pencil for marking the music.',
        question: {
          stem: 'Why has the rehearsal day changed?',
          options: [
            { key: 'a1', text: 'The conductor is away on Thursday.' },
            { key: 'a2', text: 'The hall is unavailable on Thursday.' },
            { key: 'a3', text: 'Members requested an earlier day.' },
            { key: 'a4', text: 'The concert has been postponed.' },
          ],
          correctOptionKey: 'a2',
        },
      },
      {
        key: 'p1-card-2',
        template: 'booking-confirmation',
        title: 'Concert booking confirmation',
        text: 'Your two tickets for the spring recital on 12 May are confirmed. Doors open at 7 p.m. and the performance begins at 7.30. Latecomers cannot enter until the interval. Photography is not permitted during the performance.',
        question: {
          stem: 'What should ticket holders know?',
          options: [
            { key: 'b1', text: 'They can take photos during the show.' },
            { key: 'b2', text: 'Latecomers must wait for the interval.' },
            { key: 'b3', text: 'The concert starts at 7 p.m.' },
            { key: 'b4', text: 'Tickets can be refunded.' },
          ],
          correctOptionKey: 'b2',
        },
      },
      {
        key: 'p1-card-3',
        template: 'notice',
        title: 'Music school notice',
        text: 'Piano students may use practice room B between 4 and 6 p.m. on weekdays. Book a slot at reception no more than two days ahead. The room holds one upright piano and one keyboard; drum kits are not permitted.',
        question: {
          stem: 'What is the booking rule?',
          options: [
            { key: 'c1', text: 'Book at least a week in advance.' },
            { key: 'c2', text: 'Book no more than two days ahead.' },
            { key: 'c3', text: 'Book online before 4 p.m.' },
            { key: 'c4', text: 'Book directly with the piano teacher.' },
          ],
          correctOptionKey: 'c2',
        },
      },
      {
        key: 'p1-card-4',
        template: 'text-message',
        title: 'Text message',
        text: 'Hey Sam, the band practice is still on Saturday but we\u2019ve moved it to my garage because the studio is being painted. Can you bring the spare guitar cable? The one I have keeps cutting out. See you at 3!',
        question: {
          stem: 'What does the writer need?',
          options: [
            { key: 'd1', text: 'A replacement studio key.' },
            { key: 'd2', text: 'A guitar cable that works.' },
            { key: 'd3', text: 'Help painting the studio.' },
            { key: 'd4', text: 'A different practice day.' },
          ],
          correctOptionKey: 'd2',
        },
      },
      {
        key: 'p1-card-5',
        template: 'website-message',
        title: 'Website message',
        text: 'Thank you for enrolling in the guitar video course. Your first module is available now. We recommend practising fifteen minutes daily rather than two hours once a week. You can download the chord charts from the resources tab and print them at home.',
        question: {
          stem: 'What study habit is recommended?',
          options: [
            { key: 'e1', text: 'Two hours of practice every weekend.' },
            { key: 'e2', text: 'Fifteen minutes of daily practice.' },
            { key: 'e3', text: 'Watching all videos before practising.' },
            { key: 'e4', text: 'Printing every resource immediately.' },
          ],
          correctOptionKey: 'e2',
        },
      },
    ],
  },

  part2: {
    domain: 'music lessons and performing arts',
    options: [
      {
        key: 'option-a',
        title: 'Beginner guitar, play a song by week three',
        openingStyle: 'outcome-led',
        description: 'By the third week, most participants can strum a complete song. This weekday evening guitar course at the music centre supplies instruments for the first term, so beginners need not buy anything. The tutor teaches chords through simple melodies in a small guided group. The fee is moderate and covers ten weekly sessions.',
        constraints: ['weekday evening', 'beginner', 'instrument supplied', 'small group', 'moderate fee'],
        imageSlotKey: 'option-a',
      },
      {
        key: 'option-b',
        title: 'Family drumming, loud and energetic',
        openingStyle: 'audience-led',
        description: 'Children and adults play together in this noisy Saturday morning drumming workshop. All instruments are provided, and ear protection is supplied for younger participants. The sessions are energetic and physical, with no prior rhythm experience expected. Families leave buzzing and often return the following week.',
        constraints: ['saturday morning', 'family-friendly', 'instruments provided', 'energetic', 'no experience'],
        imageSlotKey: 'option-b',
      },
      {
        key: 'option-c',
        title: 'Lunchtime singing, no audition needed',
        openingStyle: 'condition-led',
        description: 'No audition, no sheet music and no homework are required for this free lunchtime singing group in the library hall. Members learn one song per week purely by ear, following the leader’s phrase-by-phrase demonstration. The atmosphere is relaxed and welcoming to hesitant singers. Sessions last forty minutes.',
        constraints: ['lunchtime', 'free', 'no audition', 'by ear', 'relaxed'],
        imageSlotKey: 'option-c',
      },
      {
        key: 'option-d',
        title: 'Composition masterclass with studio recording',
        openingStyle: 'feature-led',
        description: 'Detailed critique from a published composer is the centrepiece of this advanced weekend masterclass. Participants bring their own compositions and receive line-by-line feedback during group sessions. The high fee includes a professional recording of each participant’s best piece. This suits experienced musicians seeking expert guidance.',
        constraints: ['weekend', 'advanced', 'expert feedback', 'high fee', 'recording included'],
        imageSlotKey: 'option-d',
      },
      {
        key: 'option-e',
        title: 'Gentle keyboard skills, adapted equipment',
        openingStyle: 'need-led',
        description: 'Gentle progress without pressure is the promise of this short accessible keyboard introduction. The tutor demonstrates in a ground-floor room with adapted equipment, and each participant receives a printed chord guide. Sessions focus on simple melodies rather than graded exams. There is no expectation of practice between meetings.',
        constraints: ['accessible', 'ground-floor', 'printed guide', 'gentle pace', 'short course'],
        imageSlotKey: 'option-e',
      },
      {
        key: 'option-f',
        title: 'Weekday afternoon violin for children',
        openingStyle: 'schedule-led',
        description: 'Every Wednesday afternoon, children aged eight to twelve gather for a structured violin course following a graded syllabus. Instruments can be borrowed for the term, and parents are welcome to observe from the back of the room. The teacher offers a term-end concert where students perform. The fee covers twelve lessons.',
        constraints: ['weekday afternoon', 'children 8-12', 'instrument borrowed', 'graded syllabus', 'concert'],
        imageSlotKey: 'option-f',
      },
      {
        key: 'option-g',
        title: 'Monthly open-mic, sign up on the night',
        openingStyle: 'invitation-led',
        description: 'Come and play one song at this free monthly open-mic evening in a small café. Performers sign up on the night, so there is no advance booking or audition. The audience is supportive and applause is generous. The venue is intimate, and members arrange their own transport home afterwards.',
        constraints: ['monthly', 'free', 'no booking', 'informal', 'own transport'],
        imageSlotKey: 'option-g',
      },
      {
        key: 'option-h',
        title: 'Music production challenge in a studio',
        openingStyle: 'location-led',
        description: 'Inside a professional recording studio, teams race against the clock to produce a short track using industry software. This competitive weekend challenge awards a certificate to finishing teams. The entry fee covers studio time, software licences and refreshments. It suits people interested in production careers who thrive under pressure.',
        constraints: ['weekend', 'competitive', 'certificate', 'studio-based', 'higher cost'],
        imageSlotKey: 'option-h',
      },
    ],
    profiles: [
      { key: 'profile-1', text: 'Nadia is a complete beginner who wants evening guitar lessons, has no instrument and prefers a small guided group with a moderate fee.', correctOptionKey: 'option-a' },
      { key: 'profile-2', text: 'Felix has a free lunchtime hour, wants to sing without reading music or practising at home, and enjoys a relaxed informal atmosphere.', correctOptionKey: 'option-c' },
      { key: 'profile-3', text: 'Grace uses a wheelchair, wants a ground-floor keyboard class with printed materials and prefers gentle progress over a long commitment.', correctOptionKey: 'option-e' },
      { key: 'profile-4', text: 'Hugo is an experienced musician who wants expert feedback on his compositions, can pay a high fee and would value a studio recording.', correctOptionKey: 'option-d' },
      { key: 'profile-5', text: 'Isla wants to build production skills for a future career, enjoys working under pressure and would like a certificate to show employers.', correctOptionKey: 'option-h' },
    ],
  },

  part3: {
    title: 'A school music concert',
    paragraphs: [
      'Every December, our school holds a music concert in the main hall, and this year I was asked to play the piano in front of the whole year group. I had performed in small classes before, but never in front of three hundred people. When the head teacher announced my name, my hands felt cold and I almost pretended to be ill. Then I remembered what my teacher had said: the audience wants you to succeed.',
      'I walked to the piano and adjusted the stool, which took longer than I expected because my fingers were shaking. The first few notes sounded thin, and I could hear a chair creak somewhere in the audience. But by the second page, something shifted. I stopped thinking about the people watching and focused on the melody. The music I had practised for weeks began to feel natural, almost automatic.',
      'When I finished, there was a pause that felt enormous, and then applause. It was not the loudest applause of the evening, but it was enough. My friend Maya, who played the violin later, said she had been more nervous watching me than performing herself. We laughed about it afterwards, but I understood what she meant. Waiting to perform is often harder than performing.',
      'The concert reminded me why I had started learning the piano three years ago. It was not to impress anyone or to win a competition. It was because my grandmother used to play, and I wanted to understand what she heard when she closed her eyes. I still play her favourite piece at home, but now I can also play it in front of others. That difference, between private enjoyment and shared performance, is something I did not expect to value so much.',
    ],
    buildExtension: ' Several classmates told me afterwards that they had no idea I played the piano, which made me realise how little we know about each other outside the classroom. The head teacher suggested starting a lunchtime music club so that students could perform informally without the pressure of a large audience. I signed up immediately. The first meeting had only four people, but by the end of term there were fifteen, and the shyest member played a guitar solo that made everyone cheer.',
    questions: [
      { number: 11, stem: 'What was the writer\u2019s main worry before performing?', options: ['Forgetting the music completely.', 'Playing in front of a large audience.', 'The piano being out of tune.', 'Arriving late to the concert.'], correctIndex: 1 },
      { number: 12, stem: 'What changed during the second page of music?', options: ['The audience started singing along.', 'The writer stopped feeling self-conscious.', 'The teacher came to help.', 'The piano sounded better.'], correctIndex: 1 },
      { number: 13, stem: 'Why does the writer mention Maya?', options: ['To show that watching can be as nerve-wracking as performing.', 'To explain why the concert was delayed.', 'To criticise Maya\u2019s violin performance.', 'To suggest Maya should have played first.'], correctIndex: 0 },
      { number: 14, stem: 'Why did the writer originally start learning piano?', options: ['To win a school competition.', 'To impress classmates.', 'To connect with a family memory.', 'To prepare for a music career.'], correctIndex: 2 },
      { number: 15, stem: 'What is the writer\u2019s main point about the concert?', options: ['Large audiences make performances better.', 'School concerts should be compulsory.', 'Performing revealed a new value in a private skill.', 'Music is more important than academic subjects.'], correctIndex: 2 },
    ],
  },

  part4: {
    title: 'Planning a music festival',
    layoutParagraphs: [
      'A group of students at the college wanted to organise a small music festival in the courtyard. They had attended similar events in other towns and believed their college could host one too. (16) ..... The first task was to choose a date that did not clash with exams.',
      'The college principal agreed to support the event, but only if the students handled the organisation themselves. She offered the courtyard and electricity, but not a budget for performers. (17) ..... They decided to invite student bands who would play for free in exchange for publicity.',
      'Posters went up three weeks before the event, and the students created a social media page to share updates. Several local cafés agreed to display flyers near their tills. (18) ..... By the week before, over two hundred people had said they would attend.',
      'On the day, one band cancelled at short notice because their drummer was ill. The organisers quickly asked a solo guitarist from the audience to fill the gap. (19) ..... The audience barely noticed the change because the music continued without a long pause.',
      'After the last performance, the students collected feedback on paper forms. Most comments were positive, and several people asked when the next festival would happen. (20) ..... The planning committee had already begun discussing a larger venue for the following year.',
    ],
    layoutExtensions: [
      'They formed a committee of six and divided the tasks between them.',
      'This condition meant the students had to be creative about finding performers.',
      'The publicity effort reached people beyond the college community.',
      'Their quick thinking kept the programme running smoothly.',
      'The success gave the group confidence to aim higher next time.',
    ],
    layoutClosers: [
      'Each member took responsibility for one area such as sound, posters or refreshments.',
      'One student suggested buskers from the town centre might also be interested.',
      'A local radio station even mentioned the event during its morning show.',
      'The guitarist later thanked them for the unexpected opportunity.',
      'The principal said she would consider a bigger space if attendance continued to grow.',
    ],
    options: [
      { key: 'opt-0', text: 'They therefore set up a small planning group with clear roles.', correctForGap: 16 },
      { key: 'opt-1', text: 'The students needed to find musicians willing to perform without payment.', correctForGap: 17 },
      { key: 'opt-2', text: 'The response was stronger than the committee had predicted.', correctForGap: 18 },
      { key: 'opt-3', text: 'This solution kept the schedule intact without disappointing the crowd.', correctForGap: 19 },
      { key: 'opt-4', text: 'The festival had proved that students could deliver a popular event independently.', correctForGap: 20 },
      { key: 'opt-5', text: 'The principal cancelled the event because of noise complaints.', correctForGap: null },
      { key: 'opt-6', text: 'Every band demanded a large fee before agreeing to play.', correctForGap: null },
      { key: 'opt-7', text: 'The students hired a professional events company to take over.', correctForGap: null },
    ],
    displayOrder: [5, 3, 7, 1, 6, 0, 4, 2],
    extra: ' The committee later produced a short handbook for other student groups. It covered how to approach the principal, where to print cheap posters and how to manage a last-minute cancellation without panicking. Three other colleges downloaded the guide within a term.',
    tail: ' The group meets monthly during term time and has already reserved the courtyard for next June. They hope to add a second stage if funding allows.',
  },

  part5: {
    title: "Learning a Musical Instrument",
    title: "Learning a Musical Instrument",
    text: 'Learning a musical instrument requires patience, and most beginners discover that progress depends (21) ..... regular practice rather than natural talent. When I started the guitar, my teacher told me to (22) ..... up a short routine each morning instead of playing for hours at the weekend. At first, my fingers hurt and the chords sounded unclear, but I (23) ..... on because I enjoyed the feeling of improvement. After three months, I could play a simple song (24) ..... mistakes, which gave me the confidence to join a practice group. The other members were supportive, and their feedback helped me (25) ..... out which notes to emphasise. Looking back, the most important lesson was not technical; it was learning that small daily efforts (26) ..... to noticeable results over time.',
    extra: ' My teacher now recommends the same approach to all her students. She keeps a chart on the wall showing how many consecutive days each person has practised, which creates a friendly sense of motivation.',
    specs: [
      { phrase: 'depends (21) ..... regular', options: ['on', 'in', 'at', 'for'], correctIndex: 0 },
      { phrase: 'to (22) ..... up a short', options: ['set', 'put', 'take', 'give'], correctIndex: 0 },
      { phrase: 'but I (23) ..... on', options: ['kept', 'hold', 'carried', 'went'], correctIndex: 0 },
      { phrase: 'song (24) ..... mistakes', options: ['without', 'within', 'beside', 'against'], correctIndex: 0 },
      { phrase: 'helped me (25) ..... out', options: ['work', 'find', 'look', 'turn'], correctIndex: 0 },
      { phrase: 'efforts (26) ..... to noticeable', options: ['lead', 'leads', 'leading', 'led'], correctIndex: 0 },
    ],
  },

  part6: {
    title: "Joining the Youth Orchestra",
    title: "Joining the Youth Orchestra",
    text: 'The youth orchestra (27) ........ I joined last September meets every Wednesday evening. We practise (28) ........ the school hall, which has good acoustics. I was nervous at first, (29) ........ the other members welcomed me quickly. Our conductor chose (30) ........ pieces carefully so that beginners could play alongside experienced musicians. I made several friends, (31) ........ we often walk to the bus stop together after rehearsal. By the winter concert, I no longer felt afraid because (32) ........ had become a familiar routine.',
    extra: ' The orchestra performs three times a year, and families are always invited. New members can attend two trial sessions before deciding whether to commit to the full term.',
    tail: ' The conductor publishes the next term\u2019s music list online so that players can practise difficult sections in advance.',
    answers: ['that', 'in', 'but', 'the', 'so', 'it'],
    targets: ['relative-word', 'preposition', 'conjunction', 'article', 'linking-word', 'pronoun'],
  },
}
