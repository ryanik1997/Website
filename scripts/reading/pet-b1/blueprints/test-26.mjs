// Test 26 — PET B1 Reading (health services, fitness programmes, wellbeing)
export default {
  testNumber: 26,
  id: 'catalog-reading-pet-b1-test26',
  title: 'PET B1 Reading – Test 26',
  level: 'B1',
  examType: 'cambridge',
  timeLimitMinutes: 45,
  totalQuestions: 32,
  parts: [1, 2, 3, 4, 5, 6],

  part1: {
    items: [
      { title: 'Surgery appointment letter', text: 'Dear Patient, your appointment with Dr Singh is confirmed for Thursday 3 October at 11:20. Please arrive ten minutes early to update your records. Bring a list of any medicines you currently take. If you cannot attend, phone the reception before 9 a.m. on the day.', question: 'What should the patient bring?', options: ['A list of current medicines.', 'A referral letter.', 'Their vaccination card.'], answer: 'A' },
      { title: 'Gym membership notice', text: 'The swimming pool closes for maintenance from 1 to 15 November. Gym and studio classes continue as normal. Members affected by the closure receive a free guest pass for a friend. The sauna remains open throughout. We apologise for any inconvenience.', question: 'What do members get for the pool closure?', options: ['A free guest pass.', 'A discount on next month.', 'Extra gym sessions.'], answer: 'A' },
      { title: 'Pharmacy label', text: 'Take one tablet twice daily with food. Do not exceed two tablets in 24 hours. May cause drowsiness — avoid driving until you know how this medicine affects you. Keep out of reach of children. Store below 25°C away from direct sunlight.', question: 'What warning does the label give?', options: ['It may make you sleepy.', 'It must be kept cold.', 'Take it on an empty stomach.'], answer: 'A' },
      { title: 'Email from school nurse', text: 'A case of head lice has been reported in Year 5. Please check your child\'s hair this weekend using a fine-tooth comb. If you find lice, treat immediately and inform the school office. Children may attend school the day after treatment begins. Bedding should be washed at sixty degrees.', question: 'When can a child return to school?', options: ['The day after treatment starts.', 'After three days at home.', 'Only with a doctor\'s note.'], answer: 'A' },
      { title: 'Fitness class reminder', text: 'Hi everyone! Just a reminder that Saturday\'s HIIT class moves from the studio to the outdoor field because of a booking clash. Wear trainers with good grip and bring water. The class still starts at nine and lasts fifty minutes. See you there — Coach Dani.', question: 'What has changed about the class?', options: ['Its location.', 'Its start time.', 'Its duration.'], answer: 'A' },
    ],
  },

  part2: {
    domain: 'health services, fitness programmes and wellbeing activities',
    options: [
      {
        key: 'option-a',
        title: 'Six-week couch-to-5K running programme',
        openingStyle: 'outcome-led',
        description: 'Cross a finish line for the first time! This beginner programme takes you from walking to running five kilometres in six gentle weeks. A qualified coach leads Tuesday and Thursday evening sessions in the park, starting with intervals of jogging and rest. No experience needed; just bring trainers and water. The final week includes a celebratory group run.',
        constraints: ['six weeks', 'beginner', 'evenings', 'park-based', 'celebratory finish'],
        imageSlotKey: 'option-a',
      },
      {
        key: 'option-b',
        title: 'Teen mental health drop-in centre',
        openingStyle: 'audience-led',
        description: 'Young people aged thirteen to nineteen can visit this confidential space every weekday afternoon without an appointment. Trained counsellors offer a listening ear, stress-management tips and referrals if needed. The centre has comfortable seating, art materials and a quiet room. Everything discussed stays private unless there is a safety concern.',
        constraints: ['teenagers', 'confidential', 'no appointment', 'weekday afternoons', 'counsellors'],
        imageSlotKey: 'option-b',
      },
      {
        key: 'option-c',
        title: 'Lunchtime yoga in the office district',
        openingStyle: 'schedule-led',
        description: 'Every Tuesday and Thursday from twelve-fifteen to one, a certified instructor runs a gentle yoga flow in a studio near the business park. Sessions suit all levels, and mats are provided. Office workers can still return to their desks by one-fifteen. The block of ten classes costs sixty pounds, payable monthly.',
        constraints: ['lunchtime', 'twice weekly', 'mats provided', 'all levels', 'ten-class block'],
        imageSlotKey: 'option-c',
      },
      {
        key: 'option-d',
        title: 'Community first-aid certification course',
        openingStyle: 'invitation-led',
        description: 'Come and learn to save a life! This one-day Saturday course covers CPR, the recovery position, choking response and wound care. A paramedic instructor uses realistic scenarios and mannequins. Participants leave with a nationally recognised certificate valid for three years. Tea, lunch and all materials are included in the forty-pound fee.',
        constraints: ['one day', 'Saturday', 'certificate', 'paramedic-led', 'lunch included'],
        imageSlotKey: 'option-d',
      },
      {
        key: 'option-e',
        title: 'Gentle exercise class for over-sixties',
        openingStyle: 'condition-led',
        description: 'If you find stairs or long walks increasingly difficult, this class rebuilds strength and balance at a comfortable pace. A physiotherapist designs each Monday and Wednesday morning session around chair-based and standing exercises. No floor work is required. Participants report fewer falls and more confidence within eight weeks.',
        constraints: ['over-sixties', 'low impact', 'physiotherapist', 'mornings', 'no floor work'],
        imageSlotKey: 'option-e',
      },
      {
        key: 'option-f',
        title: 'Healthy cooking on a budget workshop',
        openingStyle: 'need-led',
        description: 'Struggling to eat well when money is tight? This practical three-hour workshop shows how to prepare five nutritious meals for under three pounds each. A dietitian explains portion sizes and label reading while you cook in pairs. Take home a recipe booklet and a bag of ingredients. Free for students and benefit recipients.',
        constraints: ['budget-focused', 'three hours', 'practical cooking', 'recipe booklet', 'free for students'],
        imageSlotKey: 'option-f',
      },
      {
        key: 'option-g',
        title: 'Outdoor swimming group at Lake Fernham',
        openingStyle: 'location-led',
        description: 'At the east shore of Lake Fernham, swimmers meet every Sunday morning from May to September. The group welcomes all abilities, and a safety kayaker accompanies every session. Wetsuits can be borrowed for a small deposit. Afterwards, members gather at the lakeside café for hot chocolate. Parking is free before nine.',
        constraints: ['Sunday morning', 'seasonal', 'safety kayaker', 'wetsuit hire', 'all abilities'],
        imageSlotKey: 'option-g',
      },
      {
        key: 'option-h',
        title: 'Sleep and stress management webinar series',
        openingStyle: 'feature-led',
        description: 'Evidence-based and fully online, this four-part evening series teaches relaxation techniques, sleep hygiene and cognitive strategies for managing exam stress. A clinical psychologist presents each ninety-minute session with live Q&A. Recordings are available for two weeks. Suitable for students, parents and working adults. Cost is twenty-five pounds for all four sessions.',
        constraints: ['online', 'four sessions', 'psychologist-led', 'recordings available', 'evenings'],
        imageSlotKey: 'option-h',
      },
    ],
    profiles: [
      { key: 'profile-1', text: 'Grace is seventy-two and worries about falling on stairs. She wants a gentle morning class with no floor exercises, led by someone who understands ageing bodies.', correctOptionKey: 'option-e' },
      { key: 'profile-2', text: 'Dev has never run before but wants to complete a 5K by the end of summer. He is free on weekday evenings and prefers a supportive group in the park.', correctOptionKey: 'option-a' },
      { key: 'profile-3', text: 'Amara is sixteen and feeling overwhelmed by exams. She wants somewhere she can talk privately after school without booking ahead or telling her parents first.', correctOptionKey: 'option-b' },
      { key: 'profile-4', text: 'Carlos works in an office and only has a lunch break free. He wants to stretch and relax twice a week without needing to bring his own equipment.', correctOptionKey: 'option-c' },
      { key: 'profile-5', text: 'Nia is a student with very little money. She wants to learn to cook healthy meals cheaply and would like to take recipes and ingredients home.', correctOptionKey: 'option-f' },
    ],
  },

  part3: {
    title: 'How I trained for my first 5K run',
    paragraphs: [
      'Six months ago, the idea of running five kilometres without stopping seemed ridiculous. I got out of breath climbing two flights of stairs, and my idea of exercise was walking to the corner shop. Then my colleague mentioned a free couch-to-5K programme at the local park, and something made me sign up. I think I was bored of feeling tired all the time.',
      'The first session was humbling. The coach asked us to jog for sixty seconds and walk for ninety, repeating this eight times. My legs ached, my chest burned, and I was certain everyone could see how unfit I was. But the coach kept saying that showing up was the hardest part, and the running would come. She was right. By week three, the jogging intervals stretched to three minutes, and I stopped feeling embarrassed.',
      'The biggest challenge was not physical; it was mental. On rainy Thursday evenings, every excuse sounded reasonable. I learned to lay out my clothes the night before and text a friend who was also doing the programme. Having someone to meet made skipping feel like letting another person down, which was a stronger motivation than willpower alone.',
      'On the final Saturday, thirty of us lined up in the park for our five-kilometre celebration run. I finished in thirty-four minutes, which is slow by any serious standard. But crossing that line with my friend, both of us grinning and slightly crying, was the proudest moment of my year. I still run three times a week, not because I love it, but because I love who I am when I do.',
    ],
    questions: [
      { question: 'Why did the writer sign up for the programme?', options: ['They were tired of feeling tired.', 'A colleague forced them.', 'They wanted to lose weight.', 'The programme was free.'], answer: 'A' },
      { question: 'What was the first session like?', options: ['Physically difficult and embarrassing.', 'Easy and enjoyable.', 'Too fast for beginners.', 'Cancelled due to rain.'], answer: 'A' },
      { question: 'What was the biggest challenge?', options: ['Staying motivated mentally.', 'The physical pain.', 'Finding time to train.', 'The coach was too strict.'], answer: 'A' },
      { question: 'What helped the writer keep going on difficult days?', options: ['Meeting a friend who also trained.', 'Loving the rain.', 'Having a personal trainer.', 'Reading motivational books.'], answer: 'A' },
      { question: 'How does the writer feel about running now?', options: ['They do it for how it makes them feel.', 'They have become a competitive runner.', 'They stopped after the 5K.', 'They wish they had started earlier.'], answer: 'A' },
    ],
  },

  part4: {
    title: 'Organising a school sports day',
    text: 'Our teacher asked if anyone wanted to help plan this year\'s sports day, and I put my hand up without thinking. (16) ..... I had no idea how much work was involved. (17) ..... First, we booked the field and ordered medals three months in advance. (18) ..... Because we advertised early, every year group signed up within a week. (19) ..... On the morning itself, it rained heavily, and we nearly cancelled everything. (20) ..... In the end, the sun appeared at noon, and the whole school cheered during the final relay race.',
    options: [
      'As a result, we had more participants than any previous year.',
      'At that point, I honestly wanted to give up my role.',
      'However, the PE teacher reminded us that rain stops eventually.',
      'In addition, I recruited four volunteers from Year 11 to help with timing.',
      'Looking back, I had underestimated the planning completely.',
      'The school had never held a sports day before.',
      'Nobody in the school was interested in sport.',
      'We decided to hold the event indoors instead.',
    ],
    answers: ['E', 'D', 'A', 'B', 'C'],
  },

  part5: {
    text: 'Our school launched a healthy eating project (21) ..... September. The canteen stopped selling fizzy drinks and (22) ..... them with water and fruit juice. At first, students complained (23) ..... the new menu. The head teacher explained (24) ..... a balanced diet improves concentration. Within a month, most pupils admitted the food tasted (25) ..... than they expected. The project was (26) ..... successful that three nearby schools asked for advice.',
    items: [
      { correct: 'in', wrong: ['on', 'at', 'for'] },
      { correct: 'replaced', wrong: ['changed', 'switched', 'turned'] },
      { correct: 'about', wrong: ['for', 'on', 'with'] },
      { correct: 'that', wrong: ['what', 'how', 'which'] },
      { correct: 'better', wrong: ['good', 'best', 'well'] },
      { correct: 'so', wrong: ['very', 'too', 'such'] },
    ],
  },

  part6: {
    text: 'The walking group (27) ........ I joined meets every Wednesday morning. We walk (28) ........ different routes each week, from canal paths to hill trails. The leader, (29) ........ is a retired nurse, always carries a first-aid kit. (30) ........ you have never walked far before, the pace is gentle enough for anyone. I have found (31) ........ a wonderful way to clear my mind. The group has grown (32) ........ five members to over twenty since spring.',
    answers: ['that', 'along', 'who', 'although', 'it', 'from'],
    targets: ['relative-word', 'preposition', 'relative-word', 'conjunction', 'pronoun', 'preposition'],
  },
}
