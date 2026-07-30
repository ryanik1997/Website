// Test 23 — PET B1 Reading (cycle routes, commuters, safe paths, weather)
export default {
  testNumber: 23,
  id: 'catalog-reading-pet-b1-test23',
  title: 'PET B1 Reading – Test 23',
  level: 'B1',
  examType: 'cambridge',
  timeLimitMinutes: 45,
  totalQuestions: 32,
  parts: [1, 2, 3, 4, 5, 6],

  part1: {
    items: [
      { title: 'Cycle path notice', text: 'The towpath between the bridge and the lock is closed for resurfacing until 12 March. Cyclists should use the road via King Street. The alternative route adds ten minutes but avoids the hill. Pedestrians can still use the narrow side path.', question: 'What should cyclists do?', options: ['Use King Street.', 'Wait until March.', 'Use the side path.', 'Cross the hill.'], answer: 'A' },
      { title: 'Weather warning', text: 'Strong winds expected Thursday afternoon. The coastal cycle route will be exposed and dangerous between two and six. Consider the inland route via the old railway line instead. Friday looks calm and sunny.', question: 'What is advised for Thursday?', options: ['Take the inland route.', 'Cycle faster.', 'Use the coastal path early.', 'Walk instead.'], answer: 'A' },
      { title: 'Bike shop message', text: 'Your repair is ready. The new brake pads are fitted, but we noticed your rear tyre is worn. We recommend replacing it before winter. Collection is free; we can deliver for five pounds within the town centre.', question: 'What does the shop suggest?', options: ['Replacing the rear tyre.', 'Buying new brakes.', 'Waiting until winter.', 'Collecting it tomorrow.'], answer: 'A' },
      { title: 'Commuter group email', text: 'Next month we start the "Bike Buddy" scheme. New cyclists are paired with experienced riders for their first week of commuting. Sign up by Friday if you want a buddy for the school run or the station route. Helmets and lights are essential.', question: 'Who is the scheme for?', options: ['New cyclists.', 'Experienced riders only.', 'Children.', 'Mechanics.'], answer: 'A' },
      { title: 'Council update', text: 'The new cycle lane on Park Avenue opens Monday. It is separated from traffic by a low kerb and painted blue. Parking in the lane will result in a fine. The lane connects to the existing route at the roundabout near the hospital.', question: 'What is special about the lane?', options: ['It is separated from traffic.', 'It is only for buses.', 'It closes at night.', 'It has no connection.'], answer: 'A' },
    ],
  },

  part2: {
    domain: 'cycling groups, bike services and outdoor transport options',
    options: [
      {
        key: 'option-a',
        title: 'Weekday commuter cycling group with route support',
        openingStyle: 'schedule-led',
        description: 'Every weekday at seven-fifteen, a group of cyclists meets at the station car park and rides together into the city centre. A lead rider sets a steady pace suitable for people returning to cycling after a break. The route uses quiet back streets and takes twenty-five minutes. No membership fee; just arrive with a roadworthy bike and lights.',
        constraints: ['weekday morning', 'no fee', 'steady pace', 'quiet route', 'lights needed'],
        imageSlotKey: 'option-a',
      },
      {
        key: 'option-b',
        title: 'Mobile bike repair service for workplaces',
        openingStyle: 'feature-led',
        description: 'Convenient and fast, this service sends a mechanic directly to your office car park. Employees book a slot online and leave their bike at work; repairs are done during the day. Common jobs include puncture fixes, gear tuning and safety checks. Parts cost extra, but labour is included in the flat service fee.',
        constraints: ['at workplace', 'book online', 'daytime', 'labour included', 'parts extra'],
        imageSlotKey: 'option-b',
      },
      {
        key: 'option-c',
        title: 'Family cycling club with Sunday trail rides',
        openingStyle: 'audience-led',
        description: 'Traffic-free trails make this Sunday morning ride safe for young cyclists aged six and above. A trained leader chooses routes of five to fifteen kilometres depending on the group. Helmets are compulsory and the club lends bikes to children who have outgrown theirs. A café stop halfway keeps energy levels up.',
        constraints: ['family', 'Sunday morning', 'traffic-free', 'bike lending', 'café stop'],
        imageSlotKey: 'option-c',
      },
      {
        key: 'option-d',
        title: 'Evening mountain biking for intermediate riders',
        openingStyle: 'condition-led',
        description: 'If you can already handle rough terrain and want to improve your downhill technique, this Thursday-evening group suits you. Riders meet at the forest car park at six and tackle graded trails until dark. Full-suspension bikes are recommended but not required. A small fee covers trail maintenance and first-aid cover.',
        constraints: ['intermediate', 'Thursday evening', 'forest trails', 'small fee', 'own bike'],
        imageSlotKey: 'option-d',
      },
      {
        key: 'option-e',
        title: 'Free bike safety workshop for new city cyclists',
        openingStyle: 'need-led',
        description: 'Nervous about cycling in traffic? This free two-hour workshop covers road positioning, signalling and junction handling in a safe playground environment. A qualified instructor runs sessions on the first Saturday of each month. Participants bring any bike; helmets are provided. The workshop suits adults who have not cycled in years.',
        constraints: ['nervous cyclists', 'free', 'monthly', 'helmets provided', 'playground setting'],
        imageSlotKey: 'option-e',
      },
      {
        key: 'option-f',
        title: 'Guided coastal cycle tour with picnic lunch',
        openingStyle: 'location-led',
        description: 'Along the quiet sea road between the two harbours, this full-day guided tour covers thirty kilometres of stunning coastline. The guide shares local history at each stop while the group enjoys a packed lunch on the beach. Bikes and helmets are included in the price. Riders need moderate fitness but no racing experience.',
        constraints: ['coastal', 'full day', 'bikes included', 'moderate fitness', 'lunch included'],
        imageSlotKey: 'option-f',
      },
      {
        key: 'option-g',
        title: 'Bike hire and self-guided canal route package',
        openingStyle: 'invitation-led',
        description: 'Pick up a bike, follow the map and explore at your own pace — this flexible package suits visitors who dislike fixed schedules. The hire shop beside the canal provides hybrid bikes, waterproof bags and a printed route guide. Routes range from ten to forty kilometres. Return by five; no booking needed outside summer.',
        constraints: ['self-guided', 'flexible', 'no booking off-peak', 'canal route', 'return by five'],
        imageSlotKey: 'option-g',
      },
      {
        key: 'option-h',
        title: 'Winter indoor cycling fitness classes',
        openingStyle: 'outcome-led',
        description: 'By spring, regular attendees will have built the stamina for long outdoor rides. These Tuesday and Thursday evening spin classes use stationary bikes in a heated studio. An instructor varies intensity with music and interval training. Towels and water are included; cycling shoes are optional. The monthly pass is cheaper than a gym membership.',
        constraints: ['indoor', 'winter', 'twice weekly', 'monthly pass', 'shoes optional'],
        imageSlotKey: 'option-h',
      },
    ],
    profiles: [
      { key: 'profile-1', text: 'Nadia is nervous about cycling to work in traffic. She wants a free session in a safe environment where she can rebuild confidence before joining the road. She has a bike but no helmet.', correctOptionKey: 'option-e' },
      { key: 'profile-2', text: 'James wants to cycle to the station with others each morning. He prefers quiet streets, a steady pace and no membership costs. He already has lights and a working bike.', correctOptionKey: 'option-a' },
      { key: 'profile-3', text: 'Elena has two children aged seven and nine. She wants a Sunday activity on safe paths where the kids can borrow bikes and the family can stop for a snack.', correctOptionKey: 'option-c' },
      { key: 'profile-4', text: 'Hugo is visiting the coast for a day and wants a full guided experience. He does not own a bike and would like lunch included. He is reasonably fit but not a racer.', correctOptionKey: 'option-f' },
      { key: 'profile-5', text: 'Sara wants to build fitness over winter before attempting long rides in spring. She prefers indoor classes with music and can attend two evenings a week.', correctOptionKey: 'option-h' },
    ],
  },

  part3: {
    title: 'How cycling changed my daily life',
    paragraphs: [
      'Two years ago, I drove to work every day and complained about the traffic. The journey took forty-five minutes each way, and I arrived stressed and tired. A colleague suggested cycling, and I laughed — the idea of riding eight kilometres in rain and wind seemed absurd. But when roadworks doubled my driving time, I borrowed her spare bike and tried it once. That single ride changed everything.',
      'The first week was hard. My legs ached, and I arrived sweaty because I had not planned a route with fewer hills. A friend in the cycling group helped me find a flatter path along the canal, and the journey became genuinely enjoyable. I bought proper lights, a waterproof jacket and a small bag for my laptop. The council had recently added a separated lane on the busiest section, which made me feel much safer.',
      'Now I cycle four days a week and drive only when the weather is truly terrible. I save money on fuel, sleep better and no longer dread Monday mornings. The canal route has become my favourite part of the day: I see herons, meet other cyclists and arrive at work feeling awake. My colleague laughs that she created a monster, but I simply wish I had started sooner.',
    ],
    questions: [
      { question: 'Why did the writer first try cycling?', options: ['Roadworks made driving much slower.', 'They wanted to save money.', 'Their car broke down.', 'A doctor recommended exercise.'], answer: 'A' },
      { question: 'What problem did the writer face in the first week?', options: ['The route had too many hills.', 'The bike was broken.', 'It rained every day.', 'Colleagues were unhelpful.'], answer: 'A' },
      { question: 'What made the writer feel safer?', options: ['A new separated cycle lane.', 'Wearing a helmet.', 'Cycling with a group.', 'Avoiding the canal path.'], answer: 'A' },
      { question: 'How does the writer feel about cycling now?', options: ['It is the best part of their day.', 'They still prefer driving.', 'They find it boring.', 'They want to stop.'], answer: 'A' },
      { question: 'What does the writer regret?', options: ['Not starting sooner.', 'Buying an expensive bike.', 'Not driving more.', 'Joining the cycling group.'], answer: 'A' },
    ],
  },

  part4: {
    title: 'A safer route to school',
    text: 'When parents at our school complained about dangerous traffic, a group of us proposed a "bike train". (16) ..... We chose a quiet route that avoided the main road completely. (17) ..... Two adults rode at the front and back, and children followed in a line. (18) ..... At first, only five families joined, but numbers grew quickly. (19) ..... The council then painted a small crossing to make one junction safer. (20) ..... Now over thirty children cycle to school together each morning.',
    options: [
      'The idea was simple: children would ride together with adult supervision.',
      'We tested it on a Sunday to check for any dangerous spots.',
      'The children wore bright vests so drivers could see them easily.',
      'Word spread, and parents who had been nervous began to join.',
      'This small change gave everyone much more confidence.',
      'The school banned cycling on the premises.',
      'Parents refused to let children participate.',
      'The council ignored all requests for help.',
    ],
    answers: ['A', 'B', 'C', 'D', 'E'],
  },

  part5: {
    text: 'I started cycling to work (21) ..... my colleague suggested it. At first, I found (22) ..... much harder than driving. The route had too many hills, (23) ..... a friend helped me find a flatter path. I bought lights and a waterproof jacket (24) ..... I could ride in any weather. The new cycle lane made me feel (25) ..... safer than before. I now wish I had started (26) ..... I did.',
    items: [
      { correct: 'after', wrong: ['during', 'for', 'since'] },
      { correct: 'it', wrong: ['that', 'this', 'them'] },
      { correct: 'but', wrong: ['because', 'although', 'so'] },
      { correct: 'so that', wrong: ['such that', 'for', 'as to'] },
      { correct: 'much', wrong: ['very', 'more', 'too'] },
      { correct: 'earlier than', wrong: ['as', 'from', 'that'] },
    ],
  },

  part6: {
    text: 'The bike train was started (27) ........ a group of parents who worried about traffic. Children meet (28) ........ the park gate at eight each morning. They ride (29) ........ a quiet route that avoids the main road. The council painted a crossing (30) ........ drivers could see cyclists more easily. Parents say the children are (31) ........ more confident than before. The school hopes (32) ........ other neighbourhoods will copy the idea.',
    answers: ['by', 'at', 'along', 'where', 'much', 'that'],
    targets: ['preposition', 'preposition', 'preposition', 'relative-adverb', 'adverb', 'conjunction'],
  },
}
