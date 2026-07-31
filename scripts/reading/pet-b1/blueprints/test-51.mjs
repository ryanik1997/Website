/**
 * PET B1 Reading Test 51 — Golden Sample Blueprint
 * Topic: coastal travel, young travellers, local buses, low-waste packing
 */
export default {
  testNumber: 51,
  golden: true,
  topic: ['coastal travel', 'young travellers', 'local buses', 'low-waste packing'],

  metadata: {
    title: 'PET B1 Reading Test 51',
    difficulty: 'B1',
    themes: {
      part1: 'trips, outdoor activities and responsible travel',
      part2: 'trips, outdoor activities and responsible travel',
      part3: 'the journey that changed our plans',
      part4: 'a cleaner way to travel',
      part5: 'coastal trip reflections',
      part6: 'responsible travel choices',
    },
  },

  part1: {
    cards: [
      {
        key: 'p1-card-1',
        template: 'transport-update',
        title: 'Transport update',
        text: 'The 8.15 bus to West Bay is cancelled Friday because of roadworks. Use the 8.35 from the same stop, but it skips the harbour. Allow extra time to walk from the station.',
        question: {
          stem: 'What should passengers do?',
          options: [
            { key: 'a1', text: 'Take the later bus and walk.' },
            { key: 'a2', text: 'Wait at the harbour.' },
            { key: 'a3', text: 'Use another 8.15 bus.' },
            { key: 'a4', text: 'Expect the harbour stop.' },
          ],
          correctOptionKey: 'a1',
        },
      },
      {
        key: 'p1-card-2',
        template: 'notice',
        title: 'Hostel notice',
        text: 'Breakfast is served 7\u20139 a.m. Early departures can request a packed breakfast at reception before 8 p.m. the previous evening. Label food kept in the shared fridge.',
        question: {
          stem: 'What should an early guest do?',
          options: [
            { key: 'b1', text: 'Request a packed breakfast in advance.' },
            { key: 'b2', text: 'Eat after returning the key.' },
            { key: 'b3', text: 'Leave food unlabelled.' },
            { key: 'b4', text: 'Collect it after nine.' },
          ],
          correctOptionKey: 'b1',
        },
      },
      {
        key: 'p1-card-3',
        template: 'eco-tour-message',
        title: 'Eco-tour message',
        text: 'Tomorrow\u2019s wetland tour uses the shorter boardwalk because rain made the outer path slippery. Bring waterproof shoes and binoculars if available. The group returns by midday.',
        question: {
          stem: 'What changed?',
          options: [
            { key: 'c1', text: 'The route is shorter.' },
            { key: 'c2', text: 'It returns afternoon.' },
            { key: 'c3', text: 'Binoculars are compulsory.' },
            { key: 'c4', text: 'The tour is cancelled.' },
          ],
          correctOptionKey: 'c1',
        },
      },
      {
        key: 'p1-card-4',
        template: 'booking-email',
        title: 'Travel booking email',
        text: 'Your sleeper-train reservation is confirmed for 4 June. One small cabin bag is included; larger luggage costs extra. Changes are free until 28 May; afterwards the booking is non-refundable.',
        question: {
          stem: 'What is important?',
          options: [
            { key: 'd1', text: 'Changes after 28 May are free.' },
            { key: 'd2', text: 'Large luggage is included.' },
            { key: 'd3', text: 'It is refundable afterwards.' },
            { key: 'd4', text: 'Free changes end 28 May.' },
          ],
          correctOptionKey: 'd4',
        },
      },
      {
        key: 'p1-card-5',
        template: 'announcement',
        title: 'Visitor-centre announcement',
        text: 'The lighthouse exhibition is open, but the viewing platform is closed while staff replace a railing. Visitors may join the guided talk inside; tickets remain valid.',
        question: {
          stem: 'What can visitors do?',
          options: [
            { key: 'e1', text: 'Join the indoor guided talk.' },
            { key: 'e2', text: 'Use the platform later.' },
            { key: 'e3', text: 'Exchange every ticket.' },
            { key: 'e4', text: 'Watch the repair.' },
          ],
          correctOptionKey: 'e1',
        },
      },
    ],
  },

  part2: {
    domain: 'trips, outdoor activities and responsible travel',
    options: [
      { key: 'option-a', title: 'Half-day beginner kayak on calm water', openingStyle: 'activity-led', text: 'A half-day beginner kayak trip on calm water. Boats and safety equipment are supplied, the launch is beside the bus station, and groups are small; participants must swim confidently.' },
      { key: 'option-b', title: 'Two-day mountain walk for experienced hikers', openingStyle: 'condition-led', text: 'A demanding two-day mountain walk for experienced hikers. Walkers carry food, tents and equipment; the remote start is reached by a morning train.' },
      { key: 'option-c', title: 'Low-cost coastal cycle with bike hire', openingStyle: 'feature-led', text: 'A low-cost coastal cycle route with bike hire. Riders use quiet lanes between villages and return before evening; the route is mostly flat but lunch is self-arranged.' },
      { key: 'option-d', title: 'Wildlife photography weekend, forest lodge', openingStyle: 'location-led', text: 'A wildlife photography weekend at a forest lodge. The guide teaches observation, vegetarian meals are provided and guests share a minibus; it is not for very young children.' },
      { key: 'option-e', title: 'Responsible city walk led by residents', openingStyle: 'need-led', text: 'A responsible city walk led by residents. It supports independent businesses, is accessible and affordable, stays on foot and has indoor stops for bad weather.' },
      { key: 'option-f', title: 'Family beach clean with plastic talk', openingStyle: 'audience-led', text: 'A family beach-clean morning. Gloves and bags are supplied, children join with an adult and the work ends with a talk about reducing plastic waste.' },
      { key: 'option-g', title: 'Luxury island boat with lunch and transfers', openingStyle: 'outcome-led', text: 'A luxury island boat excursion with lunch and transfers. It costs a lot and follows a fixed timetable, with little independent exploring.' },
      { key: 'option-h', title: 'Free self-guided moorland audio route', openingStyle: 'invitation-led', text: 'A free self-guided moorland route with audio stories. It is flexible, but has no transport or equipment hire and limited signal high up.' },
    ],
    profiles: [
      { key: 'profile-1', text: 'Sam has never kayaked, needs equipment supplied, wants a small beginner group and must reach the launch by public transport.', correctOptionKey: 'option-a' },
      { key: 'profile-2', text: 'Tara wants an affordable accessible activity supporting residents, prefers walking, needs rain shelter and has half a day in the city.', correctOptionKey: 'option-e' },
      { key: 'profile-3', text: 'Uma travels with her ten-year-old daughter and wants an adult-supervised environmental activity with gloves supplied before lunch.', correctOptionKey: 'option-f' },
      { key: 'profile-4', text: 'Victor is an experienced hiker with camping equipment, wants a remote challenge and can catch an early train.', correctOptionKey: 'option-b' },
      { key: 'profile-5', text: 'Wendy wants a weekend wildlife photography trip with vegetarian food and shared transport; she owns a camera and has no young children.', correctOptionKey: 'option-d' },
    ],
  },

  part3: {
    title: 'The journey that changed our plans',
    paragraphs: [
      'Last summer, my cousin and I planned to walk along the northern coast. We had studied the map carefully and booked a small room in a fishing village. On the first morning, however, a storm closed the cliff path. At first we were disappointed because the walk was the main reason for our trip. The owner of the guesthouse suggested that we take a local bus inland, where a community museum was looking for visitors to help prepare an exhibition.',
      'The museum was not what we had expected. It was in an old railway station, and the exhibition showed how families had travelled before the coastal road was built. We spent the morning cleaning display cases and listening to stories from a retired conductor. In the afternoon, the rain stopped, so we took the bus to a quieter beach. We noticed that the bus was nearly empty, while cars were queuing at the popular viewpoint.',
      'We eventually walked part of the coast the next day, but the changed plan stayed with us. The museum had made us curious about the places between the famous sights, and the bus journey had shown us that slower travel could be more peaceful. We still want to return for the cliff path. This time, though, we will leave space in our plan for an unexpected recommendation.',
    ],
    extension: ' The experience also changed how we packed. We bought fewer souvenirs, carried food in reusable containers and followed local advice instead of only the busiest route. These choices helped us notice places that a hurried visit might have missed.',
    buildExtension: ' We had expected the most memorable part to be the cliff walk, so the change felt disappointing at first. The museum visit gradually altered that opinion. Its displays connected transport, work and landscape, while the quiet bus ride gave us time to notice villages we would have missed by car. We also realised that responsible travel is not simply a list of rules. It involves asking local people, accepting limits and making choices that leave room for other visitors. The next morning, when the path reopened, we walked only a short section and spent longer in a small café. The journey became less about completing a route and more about paying attention to the places that made the route meaningful.',
    questions: [
      { number: 11, stem: 'Why could the writers not begin their planned walk?', options: ['A storm had made the cliff path unsafe.', 'The guesthouse had lost their booking.', 'The museum needed them to work all day.', 'The local bus had stopped running.'], correctIndex: 0 },
      { number: 12, stem: 'Why did the guesthouse owner suggest the museum?', options: ['It offered an alternative activity during the bad weather.', 'It was the fastest route to the popular viewpoint.', 'It needed someone to repair the old railway station.', 'It had already arranged a walk along the coast.'], correctIndex: 0 },
      { number: 13, stem: 'What did the writers notice about the bus and the viewpoint?', options: ['The less popular form of transport was much quieter.', 'Both places were crowded with families that afternoon.', 'Cars were avoided because the road had been closed.', 'The bus was expensive compared with travelling by car.'], correctIndex: 0 },
      { number: 14, stem: 'How did the changed plan affect the writers?', options: ['They became more interested in places away from famous sights.', 'They decided that coastal walking was no longer enjoyable.', 'They felt the museum was more interesting than every other place.', 'They planned to travel only when the weather was perfect.'], correctIndex: 0 },
      { number: 15, stem: 'What will the writers probably do on a future trip?', options: ['Keep their main plan but allow time for new suggestions.', 'Book every activity before leaving home.', 'Avoid buses because they make journeys too slow.', 'Visit only the most popular viewpoints.'], correctIndex: 0 },
    ],
  },

  part4: {
    title: 'A cleaner way to travel',
    layoutParagraphs: [
      'Maya wanted to travel across the island without producing much rubbish. She had checked the route but decided to carry only what she really needed. (16) ..... A bottle, cloth bag and small food container were enough for the first part of the journey.',
      'At the first station, a café filled Maya\u2019s bottle without charging her. Later, she bought fruit from a market rather than a wrapped snack. (17) ..... The shopkeeper then explained where visitors could refill water nearby.',
      'At another stop, Maya found a second refill point and avoided buying a disposable drink. (18) ..... The friendly service made the next part of her journey easier, because she no longer worried about running out of water.',
      'The shopkeeper explained that visitors rarely asked about local refill points. (19) ..... Maya listened to the advice and changed her route slightly, choosing a quieter road to the island centre.',
      'By the end of the trip, Maya had spent less money and carried almost no waste home. (20) ..... She decided that future trips should leave room for useful local suggestions.',
    ],
    layoutExtensions: [
      'This choice made the beginning of the trip simple and easy to manage.',
      'She preferred small practical decisions to carrying unnecessary supplies.',
      'Maya also noticed that local advice could save time and money.',
      'The conversation gave her confidence to explore beyond the main route.',
      'The unexpected delay became one of the most useful parts of the trip.',
    ],
    layoutClosers: [
      'She felt ready to continue without buying another packaged drink.',
      'The small bag was easier to carry than the supplies she had considered.',
      'The refill point also showed why local knowledge was valuable.',
      'Maya thanked him before following the quieter road.',
      'She would remember the route when planning another low-waste journey.',
    ],
    options: [
      { key: 'opt-0', text: 'Her plan began with choosing what not to take.', correctForGap: 16 },
      { key: 'opt-1', text: 'This friendly service made the next part of the journey easier.', correctForGap: 18 },
      { key: 'opt-2', text: 'The market was closed because of a public holiday.', correctForGap: null },
      { key: 'opt-3', text: 'That choice also meant she could avoid several disposable packets.', correctForGap: 17 },
      { key: 'opt-4', text: 'The journey was longer than she had first expected.', correctForGap: 20 },
      { key: 'opt-5', text: 'She decided that travelling lightly was only possible by plane.', correctForGap: null },
      { key: 'opt-6', text: 'The shopkeeper had never met a visitor before.', correctForGap: 19 },
      { key: 'opt-7', text: 'This was the first time Maya had used a train.', correctForGap: null },
    ],
    displayOrder: [7, 2, 0, 6, 4, 1, 5, 3],
    extra: ' Maya had planned each journey carefully, yet the most useful discoveries came from small delays. At one station she watched passengers refill bottles near the café, and at another she found a market selling fruit without unnecessary wrapping. The shopkeeper explained that visitors could use a public tap at the next stop. These details mattered because Maya had not packed enough food for an unexpected wait. She realised that travelling with less waste required preparation, but also attention to the habits of local people. By the time she reached the island centre, the journey felt calmer and cheaper than the route she had first imagined. She wrote the refill points in her notebook and decided to share them with other travellers, provided the information stayed accurate. The note was useful because it connected a small practical choice with the wider question of how visitors share limited resources.',
    tail: ' The traveller kept the receipt and thanked the shopkeeper, because responsible choices work best when visitors recognise the people who make them possible. That conversation became part of the memory of the journey.',
  },

  part5: {
    title: "A Low-Waste Trip to the Coast",
    title: "A Low-Waste Trip to the Coast",
    text: 'Our coastal trip changed when a storm closed the cliff path. At first we wanted to wait, but a local guide suggested a bus to a small museum inland. The museum showed how families had travelled before the new road was built, and we helped prepare a display for visitors. Later, the rain stopped and we took the bus to a quiet beach. There were few people there, while cars waited in a long queue at the famous viewpoint. We had planned to see more sights, yet the slower day made us notice how much travel depends on local advice. Since then, we have carried reusable containers, used public transport when possible and left space in our plans for places that are not in every guidebook.',
    extra: ' We now choose local services more often, because their advice makes a journey both lighter and more interesting. The choice also supports small businesses that understand the route and helped us understand the area better in many practical ways today.',
    specs: [
      { phrase: 'changed when a storm closed', options: ['changed', 'change', 'changing', 'changes'], correctIndex: 0 },
      { phrase: 'wait', options: ['wait', 'waiting', 'waited', 'waits'], correctIndex: 0 },
      { phrase: 'suggested a bus', options: ['suggested', 'suggestion', 'suggesting', 'suggests'], correctIndex: 0 },
      { phrase: 'prepare a display', options: ['prepare', 'preparing', 'preparation', 'prepares'], correctIndex: 0 },
      { phrase: 'quiet beach', options: ['quiet', 'quietly', 'quietness', 'quieten'], correctIndex: 0 },
      { phrase: 'local advice', options: ['local', 'locally', 'locality', 'locate'], correctIndex: 0 },
    ],
  },

  part6: {
    title: "Recording Notes for Greener Travel",
    title: "Recording Notes for Greener Travel",
    text: 'The storm arrived (27) ........ we reached the cliff path, so the guide suggested a safer route. We travelled (28) ........ bus and spent the morning in a museum. The exhibition explained (29) ........ coastal families had once moved between villages. We stayed there (30) ........ the rain stopped. In the afternoon, we chose a beach (31) ........ was outside the busiest resort. The experience taught us (32) ........ to travel with less waste and more curiosity.',
    extra: ' We kept the tickets and route notes, but the most useful record was a list of refill points. On our next visit, we will use it before buying anything in disposable packaging. Writing the information down made the environmental choice easier to repeat. It also gave us a practical way to compare responsible choices on future journeys.',
    tail: ' The notes will guide our choices when we travel again.',
    answers: ['before', 'by', 'how', 'until', 'that', 'how'],
    targets: ['conjunction', 'preposition', 'relative-word', 'conjunction', 'relative-word', 'infinitive'],
  },
}
