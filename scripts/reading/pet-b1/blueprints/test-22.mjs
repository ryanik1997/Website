// Test 22 — PET B1 Reading (night markets, visitors, street food, local traders)
export default {
  testNumber: 22,
  id: 'catalog-reading-pet-b1-test22',
  title: 'PET B1 Reading – Test 22',
  level: 'B1',
  examType: 'cambridge',
  timeLimitMinutes: 45,
  totalQuestions: 32,
  parts: [1, 2, 3, 4, 5, 6],

  part1: {
    items: [
      { title: 'Market announcement', text: 'The Friday night market will close early this week at ten instead of midnight because of a road closure. Food stalls remain open until ten. The car park on Bridge Street is unavailable; use the station car park instead.', question: 'What has changed?', options: ['The closing time.', 'The market day.', 'The food prices.', 'The stall locations.'], answer: 'A' },
      { title: 'Stall application form', text: 'Applications for a December market stall close on 15 November. You must sell handmade or locally produced goods. Reselling imported items is not permitted. A deposit of twenty pounds is required with your application.', question: 'Who can apply?', options: ['Sellers of handmade or local goods.', 'Anyone who imports products.', 'Only food sellers.', 'People who pay fifty pounds.'], answer: 'A' },
      { title: 'Text from Dad', text: 'The night market is on tonight. Shall we meet at the entrance near the clock tower at seven? I heard there is a new Thai stall and a dessert van. Bring cash — the card machine was broken last time.', question: 'What does Dad suggest?', options: ['Bringing cash.', 'Meeting at eight.', 'Going to a restaurant.', 'Using a card.'], answer: 'A' },
      { title: 'Visitor information board', text: 'The harbour night market runs every Saturday from six until eleven. Entry is free. Dogs are welcome on leads but not inside the food hall. Live music starts at eight near the fountain.', question: 'Where is the music?', options: ['Near the fountain.', 'Inside the food hall.', 'At the harbour entrance.', 'On the beach.'], answer: 'A' },
      { title: 'Trader email', text: 'Your pitch number for Saturday is B14. Set-up begins at four; all vehicles must leave the market square by five. You may collect unsold goods after eleven. The organisers are not responsible for damage to equipment overnight.', question: 'When must vehicles leave?', options: ['By five.', 'After eleven.', 'At four.', 'At six.'], answer: 'A' },
    ],
  },

  part2: {
    domain: 'evening food events, markets and social dining experiences',
    options: [
      {
        key: 'option-a',
        title: 'Riverside street food market every Friday night',
        openingStyle: 'schedule-led',
        description: 'From six until eleven every Friday, the riverside walk fills with food vans serving dishes from twelve countries. Visitors eat at shared wooden tables while musicians play nearby. Entry is free and no booking is needed. The nearest car park is a five-minute walk away, and buses run until midnight.',
        constraints: ['Friday night', 'free entry', 'no booking', 'shared seating', 'late buses'],
        imageSlotKey: 'option-a',
      },
      {
        key: 'option-b',
        title: 'Guided night market food tour for small groups',
        openingStyle: 'feature-led',
        description: 'Tasting eight dishes across two hours, this guided walk suits visitors who want to understand local food culture. A knowledgeable guide explains each stall\'s history while the group samples specialities. Groups are limited to ten people. The tour costs more than eating alone but includes every tasting and a recipe booklet.',
        constraints: ['guided', 'small group', 'includes tastings', 'recipe booklet', 'more expensive'],
        imageSlotKey: 'option-b',
      },
      {
        key: 'option-c',
        title: 'Family-friendly weekend market with cooking demos',
        openingStyle: 'audience-led',
        description: 'Children love watching chefs prepare dishes on the open stage at this Saturday market. Parents browse craft stalls while kids join free biscuit-decorating sessions at two and four. The market is fully step-free, has baby-changing facilities and closes at eight so younger visitors are not out too late.',
        constraints: ['family-friendly', 'step-free', 'closes early', 'kids activities', 'Saturday'],
        imageSlotKey: 'option-c',
      },
      {
        key: 'option-d',
        title: 'Late-night artisan cheese and wine tasting',
        openingStyle: 'condition-led',
        description: 'If you prefer a quieter evening away from crowds, this monthly tasting in a cellar bar suits you. A sommelier pairs five regional cheeses with local wines while explaining production methods. Places are limited to sixteen and must be booked online. The event runs from eight to ten and costs a moderate fee.',
        constraints: ['quiet', 'monthly', 'booking required', 'limited places', 'moderate fee'],
        imageSlotKey: 'option-d',
      },
      {
        key: 'option-e',
        title: 'Budget lunchtime market near the university',
        openingStyle: 'location-led',
        description: 'Between the library and the science block, this weekday market serves students cheap hot meals from eleven to two. Stalls change daily, so regulars never eat the same thing twice. Payment is by card or app only. Seating is limited to standing counters, but the food is freshly cooked and under five pounds.',
        constraints: ['budget', 'weekday lunch', 'card only', 'near university', 'standing seating'],
        imageSlotKey: 'option-e',
      },
      {
        key: 'option-f',
        title: 'Monthly vegan night market with live DJs',
        openingStyle: 'invitation-led',
        description: 'Come hungry and leave inspired — this plant-based market takes over the old warehouse on the last Saturday of each month. Over twenty stalls serve creative vegan dishes while DJs play until midnight. Entry costs five pounds including a welcome drink. The venue has step-free access and a covered outdoor area.',
        constraints: ['vegan', 'monthly', 'live music', 'entry fee', 'covered area'],
        imageSlotKey: 'option-f',
      },
      {
        key: 'option-g',
        title: 'Traditional farmers market with morning workshops',
        openingStyle: 'outcome-led',
        description: 'Visitors leave this Saturday-morning market knowing exactly where their food comes from. Farmers explain growing methods while shoppers taste seasonal produce. A short workshop at eleven teaches preserving or bread making. The market is outdoors, so waterproof clothing is sensible. Parking is free in the adjacent field.',
        constraints: ['Saturday morning', 'outdoor', 'workshops', 'free parking', 'seasonal produce'],
        imageSlotKey: 'option-g',
      },
      {
        key: 'option-h',
        title: 'Harbour seafood evening with cook-along sessions',
        openingStyle: 'need-led',
        description: 'Want to learn how professionals grill fish? This summer evening event on the harbour lets visitors watch and then try cooking mussels and prawns themselves. An experienced chef guides each group of twelve. Ingredients and aprons are provided; the session ends with everyone eating together at nine. Booking is essential.',
        constraints: ['cook-along', 'booking essential', 'summer evening', 'small group', 'eat together'],
        imageSlotKey: 'option-h',
      },
    ],
    profiles: [
      { key: 'profile-1', text: 'Aisha wants a lively Friday-night meal outdoors with friends. She needs free entry, no advance booking and late public transport home. She enjoys trying dishes from many countries.', correctOptionKey: 'option-a' },
      { key: 'profile-2', text: 'Marco is visiting for one weekend and wants an expert to show him the best local food. He is happy to pay more for a small guided group and would like something to take home as a souvenir.', correctOptionKey: 'option-b' },
      { key: 'profile-3', text: 'Jen has two young children and needs a step-free venue that closes before bedtime. She wants the kids to have their own activity while she browses stalls on Saturday.', correctOptionKey: 'option-c' },
      { key: 'profile-4', text: 'David and his partner prefer quiet evenings without crowds. They enjoy wine, want to learn about production and are happy to book online for a limited-place event.', correctOptionKey: 'option-d' },
      { key: 'profile-5', text: 'Yuki loves plant-based food and wants a monthly event with music. She does not mind paying entry and values a covered area in case of rain.', correctOptionKey: 'option-f' },
    ],
  },

  part3: {
    title: 'The night market that saved our high street',
    paragraphs: [
      'Three years ago, Millbrook\'s high street was dying. Half the shops were empty, and residents drove to the out-of-town centre for everything. Then a group of traders proposed a simple idea: open the street on Friday evenings with food stalls, music and lights. The council was sceptical, but agreed to a three-month trial. On the first night, only six stalls appeared and perhaps fifty visitors came. Nobody expected what happened next.',
      'Word spread quickly. By the fourth week, three hundred people filled the street. Local restaurants stayed open later to serve the crowds, and two empty shops became permanent cafés. The traders organised themselves into an association, sharing costs for lighting, music and advertising. Regulars began arriving early to get the best food before queues formed. The market became a weekly ritual, not just a shopping trip.',
      'Today, the Millbrook night market attracts over a thousand visitors each Friday. Property values on the street have risen, and four new businesses opened this year alone. The original traders admit it was not always smooth — noise complaints, bad weather and disagreements about stall positions all caused problems. But the community that grew around those first six stalls proved stronger than any difficulty. The high street is alive again.',
    ],
    questions: [
      { question: 'What was the council\'s initial reaction?', options: ['They doubted it would work.', 'They refused completely.', 'They offered extra funding.', 'They moved it to another street.'], answer: 'A' },
      { question: 'What happened by the fourth week?', options: ['Visitor numbers grew significantly.', 'The market was cancelled.', 'Traders left the association.', 'The council ended the trial.'], answer: 'A' },
      { question: 'How did existing restaurants benefit?', options: ['They stayed open later for market visitors.', 'They moved to the out-of-town centre.', 'They became food stalls.', 'They reduced their prices.'], answer: 'A' },
      { question: 'What problems does the writer mention?', options: ['Noise complaints and weather.', 'Lack of food variety.', 'Too few visitors.', 'High council taxes.'], answer: 'A' },
      { question: 'What is the writer\'s main point?', options: ['A simple idea revived a struggling street.', 'Night markets are always profitable.', 'Councils should fund all markets.', 'Out-of-town centres are closing.'], answer: 'A' },
    ],
  },

  part4: {
    title: 'Starting a food stall',
    text: 'When I lost my office job, I decided to turn my love of cooking into a business. (16) ..... I applied for a pitch at the Saturday market and was surprised to get one immediately. (17) ..... My first morning was terrifying — I had made too much food and nobody stopped. (18) ..... Then a woman tasted my soup and told her friends. (19) ..... By lunchtime, I had sold almost everything. (20) ..... That first day taught me that persistence matters more than perfection.',
    options: [
      'I had spent months perfecting my soup recipes at home.',
      'The market organiser showed me where to set up my table.',
      'I nearly packed up and went home before ten.',
      'Within minutes, a small queue had formed.',
      'I now attend three markets every week.',
      'The council refused my application.',
      'I had no recipes to offer customers.',
      'Nobody at the market liked soup.',
    ],
    answers: ['A', 'B', 'C', 'D', 'E'],
  },

  part5: {
    text: 'The night market began (21) ..... a small experiment by local traders. Nobody knew (22) ..... it would attract so many visitors. The council agreed (23) ..... let them try for three months. Each Friday, more people arrived (24) ..... the week before. Traders learned (25) ..... cooperate rather than compete. The street is now livelier (26) ..... it has been for decades.',
    items: [
      { correct: 'as', wrong: ['from', 'for', 'like'] },
      { correct: 'that', wrong: ['what', 'which', 'when'] },
      { correct: 'to', wrong: ['that', 'for', 'letting'] },
      { correct: 'than', wrong: ['that', 'as', 'from'] },
      { correct: 'to', wrong: ['how', 'that', 'for'] },
      { correct: 'than', wrong: ['that', 'as', 'from'] },
    ],
  },

  part6: {
    text: 'The market was organised (27) ........ a group of local traders who wanted to save their street. It takes place (28) ........ Friday evenings throughout the year. Visitors can try food (29) ........ many different countries. The traders say (30) ........ the community spirit is the best part. Some stalls have been there (31) ........ the very first night. The council now hopes (32) ........ other streets will copy the idea.',
    answers: ['by', 'on', 'from', 'that', 'since', 'that'],
    targets: ['preposition', 'preposition', 'preposition', 'conjunction', 'preposition', 'conjunction'],
  },
}
