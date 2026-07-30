// Test 25 — PET B1 Reading (travel planning, local transport, holidays)
export default {
  testNumber: 25,
  id: 'catalog-reading-pet-b1-test25',
  title: 'PET B1 Reading – Test 25',
  level: 'B1',
  examType: 'cambridge',
  timeLimitMinutes: 45,
  totalQuestions: 32,
  parts: [1, 2, 3, 4, 5, 6],

  part1: {
    items: [
      { title: 'Bus timetable notice', text: 'From Monday, the number 42 bus leaves the station ten minutes earlier than before. The first departure is now at six-fifty. Passengers with weekly tickets do not need to pay extra. Check the new times on the app before travelling.', question: 'What has changed about the number 42 bus?', options: ['Its departure time.', 'Its route.', 'Its price.'], answer: 'A' },
      { title: 'Train delay announcement', text: 'The twelve-fifteen to Bristol is delayed by approximately forty minutes due to a signal failure at Reading. Passengers may use their tickets on the next available service. We apologise for the inconvenience. Refreshments vouchers are available at the help desk.', question: 'What can passengers do?', options: ['Take a later train with the same ticket.', 'Get a full refund immediately.', 'Board the twelve-fifteen as planned.'], answer: 'A' },
      { title: 'Email from SunTravel', text: 'Your flight on 14 August has been moved from morning to evening. The new departure is 20:30. If this does not suit you, reply within 48 hours for a free date change. Airport parking can still be added at the discounted rate until Friday.', question: 'What should the customer do if the time is a problem?', options: ['Reply within two days.', 'Pay for a new ticket.', 'Arrive at the airport earlier.'], answer: 'A' },
      { title: 'Airport information screen', text: 'Gate B7: Flight EZ4821 to Barcelona — Boarding 14:10. Gate B7 is a ten-minute walk from security. Passengers with hand luggage only may use the fast-track lane. All liquids must be in a clear bag no larger than twenty centimetres.', question: 'How long does it take to reach Gate B7?', options: ['Ten minutes on foot.', 'Five minutes by shuttle.', 'Twenty minutes from check-in.'], answer: 'A' },
      { title: 'Text from Hotel Marisol', text: 'Hola! Your room is ready from 15:00 on Saturday. Early check-in costs 15 euros. Breakfast is included and served until eleven. The pool closes at eight for cleaning. Let us know if you need airport transfer — we can book a taxi for you.', question: 'What is included in the booking?', options: ['Breakfast.', 'Airport transfer.', 'Late check-out.'], answer: 'A' },
    ],
  },

  part2: {
    domain: 'travel planning, local transport and holiday services',
    options: [
      {
        key: 'option-a',
        title: 'Guided day trip to the coastal village of Wrenmouth',
        openingStyle: 'invitation-led',
        description: 'Join us every Saturday for a full-day excursion along the clifftop path to Wrenmouth harbour. The coach leaves the town centre at eight sharp and returns by six. A local guide shares stories about smuggling history, and there is free time for lunch at the fish market. Walking shoes are essential as the path is uneven.',
        constraints: ['Saturday', 'guided', 'full day', 'walking required', 'coach transport'],
        imageSlotKey: 'option-a',
      },
      {
        key: 'option-b',
        title: 'Monthly travel photography walk for beginners',
        openingStyle: 'feature-led',
        description: 'Bring any camera or phone and learn to capture stations, bridges and cityscapes. A professional photographer leads a gentle two-hour walk on the first Sunday of each month, stopping at five viewpoints. Participants receive a printed tip sheet afterwards. No booking needed; just meet outside the main entrance at nine.',
        constraints: ['monthly', 'beginners welcome', 'two hours', 'no booking', 'printed tips'],
        imageSlotKey: 'option-b',
      },
      {
        key: 'option-c',
        title: 'Evening language café for travellers',
        openingStyle: 'need-led',
        description: 'Worried about ordering food abroad or asking for directions? Drop into this relaxed Thursday session where volunteers help you practise holiday phrases in French, Spanish or Italian. Each meeting focuses on one situation, such as checking into a hotel or buying train tickets. Tea is provided and attendance is free.',
        constraints: ['Thursday evening', 'free', 'multiple languages', 'practical phrases', 'drop-in'],
        imageSlotKey: 'option-c',
      },
      {
        key: 'option-d',
        title: 'Weekend cycle route planning workshop',
        openingStyle: 'outcome-led',
        description: 'By the end of this three-hour Saturday workshop, you will have mapped a safe cycling route for your next holiday. An instructor shows how to read contour maps, find traffic-free paths and pack a repair kit. Participants leave with a personalised route card. Bring a laptop or tablet; maps are provided.',
        constraints: ['Saturday', 'three hours', 'practical output', 'bring device', 'maps provided'],
        imageSlotKey: 'option-d',
      },
      {
        key: 'option-e',
        title: 'Accessible minibus service for disabled passengers',
        openingStyle: 'audience-led',
        description: 'Designed for wheelchair users and passengers with limited mobility, this door-to-door service operates weekdays between eight and five. Drivers are trained in assistance, and vehicles have ramps and securement points. Book at least one day ahead by phone or online. Fares match the standard bus price.',
        constraints: ['wheelchair accessible', 'weekday', 'advance booking', 'door-to-door', 'standard fare'],
        imageSlotKey: 'option-e',
      },
      {
        key: 'option-f',
        title: 'Budget airline comparison masterclass',
        openingStyle: 'condition-led',
        description: 'If you have ever paid too much for a short flight, this ninety-minute online session reveals how fares change and when to book. A travel journalist explains hidden fees, luggage rules and the best days to fly. Attendees receive a comparison checklist. The class runs on three Wednesday evenings in March.',
        constraints: ['online', 'ninety minutes', 'three sessions', 'checklist included', 'March'],
        imageSlotKey: 'option-f',
      },
      {
        key: 'option-g',
        title: 'Heritage railway volunteer experience',
        openingStyle: 'schedule-led',
        description: 'Every second Saturday from April to October, volunteers help run a steam train between Millbrook and Fernham. Roles include ticket checking, platform announcing and tea serving. No experience is needed; a training morning is provided in March. Volunteers travel free on any service day and receive a discounted season pass.',
        constraints: ['fortnightly', 'April to October', 'training provided', 'free travel', 'varied roles'],
        imageSlotKey: 'option-g',
      },
      {
        key: 'option-h',
        title: 'Family camping and navigation weekend',
        openingStyle: 'location-led',
        description: 'At Greenfield Activity Centre, families spend two nights under canvas learning to navigate by map and compass. Days include a guided hill walk, an evening campfire and a morning orienteering challenge. All equipment is supplied, and instructors hold outdoor leadership certificates. Suitable for children aged eight and above.',
        constraints: ['two nights', 'equipment supplied', 'family-friendly', 'qualified instructors', 'ages 8+'],
        imageSlotKey: 'option-h',
      },
    ],
    profiles: [
      { key: 'profile-1', text: 'Sofia uses a wheelchair and needs to reach a hospital appointment across town on a Tuesday. She wants a service that picks her up at home and charges the same as the regular bus.', correctOptionKey: 'option-e' },
      { key: 'profile-2', text: 'Tom always overpays for flights and wants to understand fares better. He can attend online on weekday evenings and would like a written checklist to keep.', correctOptionKey: 'option-f' },
      { key: 'profile-3', text: 'Priya is nervous about her first trip to Spain and cannot speak any Spanish. She wants a free, relaxed group where she can practise ordering meals and asking for directions.', correctOptionKey: 'option-c' },
      { key: 'profile-4', text: 'Marcus loves steam trains and has free time on alternate Saturdays. He would enjoy a practical role outdoors and does not mind attending a training session beforehand.', correctOptionKey: 'option-g' },
      { key: 'profile-5', text: 'The Chen family wants an outdoor weekend for their two children, aged nine and twelve. They have no camping gear and need qualified staff to teach map reading.', correctOptionKey: 'option-h' },
    ],
  },

  part3: {
    title: 'The school trip that went completely wrong',
    paragraphs: [
      'It was supposed to be a simple day out: forty Year 9 students, two coaches, and a museum trip to the city. Mr Hartley, our geography teacher, had organised everything himself because the school travel company was too expensive. He booked the coaches, printed the maps and even packed a first-aid kit. What could go wrong? As it turned out, almost everything.',
      'The first coach arrived twenty minutes late with a broken seatbelt on row four. The second coach never arrived at all. After three phone calls, we discovered the driver had gone to the wrong school, one with the same name in a different town. By the time both coaches finally set off, we were already an hour behind schedule. Mr Hartley sat in the front seat, red-faced, muttering about never trusting budget companies again.',
      'At the museum, the real disaster struck. Our pre-booked workshop had been cancelled because the confirmation email went to Mr Hartley\'s spam folder. Forty teenagers stood in the entrance hall with nothing to do. Our saviour was Mrs Okafor, the deputy head, who calmly negotiated a free guided tour with the museum staff. The students actually enjoyed it more than the workshop would have been.',
      'On the way home, one coach took a wrong turning and added thirty minutes to the journey. Parents waiting at school were not impressed. Yet when I look back, that chaotic day produced the funniest stories of my school career. Mr Hartley still refuses to organise trips, and nobody blames him.',
    ],
    questions: [
      { question: 'Why did Mr Hartley organise the trip himself?', options: ['The travel company cost too much.', 'He enjoyed planning.', 'The head teacher asked him to.', 'No company was available.'], answer: 'A' },
      { question: 'What happened with the second coach?', options: ['The driver went to the wrong school.', 'It broke down on the motorway.', 'It was cancelled without notice.', 'The driver was ill.'], answer: 'A' },
      { question: 'Why was the workshop cancelled?', options: ['The confirmation went to spam.', 'The museum was closed.', 'Mr Hartley forgot to book it.', 'There were too few students.'], answer: 'A' },
      { question: 'Who solved the problem at the museum?', options: ['Mrs Okafor, the deputy head.', 'The museum manager.', 'Mr Hartley himself.', 'A parent volunteer.'], answer: 'A' },
      { question: 'How does the writer feel about the trip now?', options: ['It produced funny memories.', 'It was a complete waste of time.', 'Mr Hartley should be blamed.', 'The museum should refund them.'], answer: 'A' },
    ],
  },

  part4: {
    title: 'Cycling to school for the first time',
    text: 'When my parents said I had to cycle to school instead of taking the bus, I was not happy. (16) ..... The route was only three kilometres, but it included one steep hill and a busy roundabout. (17) ..... My dad rode behind me on that first morning, pointing out where to signal. (18) ..... By Wednesday, I managed the hill without stopping, which felt like a real achievement. (19) ..... My friend Aisha started cycling too, and we began racing each other to the bike shed. (20) ..... I now wonder why I ever complained about the bus.',
    options: [
      'As a result, I arrived at school feeling proud and wide awake.',
      'At first, I walked beside my bike up the hill every single time.',
      'However, the fresh air and exercise changed my mood completely.',
      'In addition, I saved two pounds a day on bus fares.',
      'To prepare, we spent Sunday afternoon checking my brakes and tyres.',
      'Nobody at school owned a bicycle before that year.',
      'The head teacher banned cycling the following week.',
      'My bus pass expired at exactly the wrong moment.',
    ],
    answers: ['E', 'B', 'C', 'D', 'A'],
  },

  part5: {
    text: 'Last summer, our family decided (21) ..... a road trip along the south coast. We set (22) ..... early on Saturday morning to avoid the traffic. My dad was responsible (23) ..... the map, although he kept insisting he knew a shortcut. (24) ..... he was wrong, we ended up on a tiny lane with no phone signal. My mum suggested we (25) ..... a break and ask for directions at a farm. The farmer pointed us back to the main road, and we (26) ..... at the beach just before lunch.',
    items: [
      { correct: 'on', wrong: ['for', 'to', 'at'] },
      { correct: 'off', wrong: ['up', 'out', 'on'] },
      { correct: 'for', wrong: ['of', 'with', 'about'] },
      { correct: 'Unfortunately', wrong: ['Luckily', 'Obviously', 'Naturally'] },
      { correct: 'take', wrong: ['make', 'do', 'have'] },
      { correct: 'arrived', wrong: ['reached', 'came', 'appeared'] },
    ],
  },

  part6: {
    text: 'When I moved to the city, I had never used public transport (27) ........ my life. The first thing I learned was to buy a travel card (28) ........ the station machine. Buses run every ten minutes, (29) ........ you rarely need to wait long. The tram, (30) ........ is faster than the bus, goes straight to the university. I found (31) ........ much easier than cycling in traffic. (32) ........ a month, I could not imagine getting around any other way.',
    answers: ['in', 'from', 'so', 'which', 'it', 'within'],
    targets: ['preposition', 'preposition', 'conjunction', 'relative-word', 'pronoun', 'preposition'],
  },
}
