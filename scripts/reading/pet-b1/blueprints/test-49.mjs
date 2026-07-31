/**
 * PET B1 Reading Test 49 — canonical blueprint
 * Domain: cycle routes
 */
export default {
  testNumber: 49,
  id: 'catalog-reading-pet-b1-test49',
  title: 'PET B1 Reading Test 49',
  level: 'B1',
  examType: 'cambridge',
  timeLimitMinutes: 45,
  totalQuestions: 32,
  parts: [1, 2, 3, 4, 5, 6],

  part1: {
  "cards": [
    {
      "key": "p1-1",
      "template": "generic",
      "title": "Cycle routes notice",
      "text": "The cycle routes team needs helpers on Saturday. Bring gloves and arrive before nine.",
      "explanation": "The text says: The cycle routes team needs helpers on Saturday. Bring gloves and arrive before nine.",
      "question": {
        "stem": "What should volunteers do?",
        "options": [
          {
            "key": "a",
            "text": "Bring gloves and arrive early."
          },
          {
            "key": "b",
            "text": "Pay for equipment at the gate."
          },
          {
            "key": "c",
            "text": "Work there every morning."
          }
        ],
        "correctOptionKey": "a"
      }
    },
    {
      "key": "p1-2",
      "template": "generic",
      "title": "Message from a friend",
      "text": "I have booked the safe paths session for Tuesday, but I may arrive late. Please start without me and save a place.",
      "explanation": "The text says: I have booked the safe paths session for Tuesday, but I may arrive late. Please start without me and save a place.",
      "question": {
        "stem": "What does the writer ask the friend to do?",
        "options": [
          {
            "key": "a",
            "text": "Wait until Tuesday evening."
          },
          {
            "key": "b",
            "text": "Begin the session if necessary."
          },
          {
            "key": "c",
            "text": "Cancel the booking."
          }
        ],
        "correctOptionKey": "b"
      }
    },
    {
      "key": "p1-3",
      "template": "generic",
      "title": "Information sign",
      "text": "Visitors to the cycle routes may use the tools, but they must return them before leaving.",
      "explanation": "The text says: Visitors to the cycle routes may use the tools, but they must return them before leaving.",
      "question": {
        "stem": "What must visitors do?",
        "options": [
          {
            "key": "a",
            "text": "Take the tools home."
          },
          {
            "key": "b",
            "text": "Use the tools only outdoors."
          },
          {
            "key": "c",
            "text": "Return the tools after use."
          }
        ],
        "correctOptionKey": "c"
      }
    },
    {
      "key": "p1-4",
      "template": "generic",
      "title": "Short announcement",
      "text": "The commuters meeting has moved from Room 2 to Room 4 because the first room is being painted.",
      "explanation": "The text says: The commuters meeting has moved from Room 2 to Room 4 because the first room is being painted.",
      "question": {
        "stem": "Why has the meeting moved?",
        "options": [
          {
            "key": "a",
            "text": "The original room is unavailable."
          },
          {
            "key": "b",
            "text": "The meeting has finished early."
          },
          {
            "key": "c",
            "text": "More people have joined the group."
          }
        ],
        "correctOptionKey": "a"
      }
    },
    {
      "key": "p1-5",
      "template": "generic",
      "title": "Notice for members",
      "text": "Members can borrow one safe paths guide for a week. Ask at the desk if you need another copy.",
      "explanation": "The text says: Members can borrow one safe paths guide for a week. Ask at the desk if you need another copy.",
      "question": {
        "stem": "What is the rule about guides?",
        "options": [
          {
            "key": "a",
            "text": "Members may keep one for a week."
          },
          {
            "key": "b",
            "text": "Only visitors may borrow one."
          },
          {
            "key": "c",
            "text": "All copies must be returned that day."
          }
        ],
        "correctOptionKey": "a"
      }
    }
  ]
},

  part2: {
  "domain": "cycle routes",
  "options": [
    {
      "key": "a",
      "title": "Flat riverside beginner loop",
      "description": "A flat twelve kilometre loop that follows the river and is ideal for riders trying their first route. Bikes and helmets are hired at the start, the path is smooth with no hills, and groups leave every afternoon. A leader stays at the back so nobody is left behind.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-a"
    },
    {
      "key": "b",
      "title": "Weekend off road mountain trail",
      "description": "A challenging off-road trail across rocky hills for experienced riders who own a mountain bike. The weekend route covers rough ground, steep climbs and river crossings, with no bicycle hire available. Riders carry their own water, food and repair tools. The start lies two hours from town, reached by an early train, so planning ahead is essential.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-b"
    },
    {
      "key": "c",
      "title": "Family tricycle mornings",
      "description": "A short morning loop where tricycles and balance bikes are offered to young children who have never ridden. Parents ride free alongside, the distance is under three kilometres, and a playground stop breaks the route. Helmets and pads are included for every child, and a helper stays at the front, so sessions finish before noon.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-c"
    },
    {
      "key": "d",
      "title": "Night city loop with lights",
      "description": "A ten kilometre evening loop through quiet streets, lit from start to finish with free lights and high-visibility vests. Riders sign up at the library, the ride leaves at seven and returns by ten, and there is no charge at all. The surface is smooth and even, which makes the loop suitable for commuter bikes.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-d"
    },
    {
      "key": "e",
      "title": "Free audio guided woodland ride",
      "description": "A free self-guided route through the woodland with audio stories played from your phone. Riders must bring their own bicycle, there is no hire or repair service along the way, and phone signal disappears in the deepest trees. The path winds gently and takes about two hours to complete at a relaxed pace.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-e"
    },
    {
      "key": "f",
      "title": "Race training with weekly coach",
      "description": "An eight week programme with a dedicated speed coach, aimed at riders preparing for a local race. Sessions run on weekday mornings, include timed laps and video feedback, and finish with entry to the race itself. Riders must already ride regularly. The cost covers coaching and a race number, but riders supply their own bicycles.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-f"
    },
    {
      "key": "g",
      "title": "Scenic coast ride with support van",
      "description": "A scenic forty kilometre coastal ride with a support van that carries bags and collects anyone who tires early. A lunch stop is included at a village café, and the ride follows the cliff road with wide sea views. Riders should have done a long ride before.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-g"
    },
    {
      "key": "h",
      "title": "Budget route on your own bike",
      "description": "A free weekday route where riders bring their own bicycle and receive no equipment or support. The path is flat and easy, but evenings are crowded with commuters, and there is no lighting after dark. It suits riders who simply want a quick ride after work on their own bicycles.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-h"
    }
  ],
  "profiles": [
    {
      "text": "Liam has never cycled on a road and owns no bike. He wants a flat, safe path with hired equipment, has one free afternoon, and needs a leader close by in case he struggles.",
      "correctOptionKey": "a"
    },
    {
      "text": "Priya owns a mountain bike and rides every weekend. She wants a difficult off-road route with steep climbs and no bike hire needed, and she is willing to catch an early train to reach the start.",
      "correctOptionKey": "b"
    },
    {
      "text": "Oliver rides with his five-year-old daughter, who has never ridden a bike. He wants a short morning ride, child-sized cycles, a safe surface and a rest stop with play equipment.",
      "correctOptionKey": "c"
    },
    {
      "text": "Fatima works until six every evening and cannot pay extra fees. She wants a free ride after dark, with lights supplied, on quiet streets, returning home by ten.",
      "correctOptionKey": "d"
    },
    {
      "text": "Daniel is training for his first race and wants to get faster. He is free on weekday mornings, would value a coach and timed practice, and already cycles twice a week.",
      "correctOptionKey": "f"
    }
  ]
},

  part3: {
  "title": "PLACEHOLDER_AUTHOR_ME",
  "paragraphs": [],
  "buildExtension": "",
  "questions": []
},

  part4: {
    "title": "The Commuters' Route Plan Takes Shape",
    "paragraphs": [
      { "segments": [
        { "type": "text", "value": "Every morning, office workers walked from the station to the business park along a narrow pavement. A commuter named Elena counted how many crossed through an unofficial gap in the fence instead of using the distant crossing. She shared the numbers online, and forty people replied." },
        { "type": "gap", "questionNumber": 16 },
        { "type": "text", "value": "She summarised their comments and invited everyone to discuss possible routes at the station café." }
      ] },
      { "segments": [
        { "type": "text", "value": "The group mapped three routes that avoided the busiest junction. They measured each one with a phone app and recorded cracked pavement or poor lighting. Elena compiled the findings into a short report and sent it to the local transport office." },
        { "type": "gap", "questionNumber": 17 },
        { "type": "text", "value": "Two group members later presented the same detailed findings at a public council session." }
      ] },
      { "segments": [
        { "type": "text", "value": "The transport office replied within a month, saying one route could be improved with a crossing and better signs. The group was surprised by the quick response. A council officer explained that evidence from the phone app had strengthened their case." },
        { "type": "gap", "questionNumber": 18 },
        { "type": "text", "value": "The commuters celebrated the news by walking the chosen route together on a sunny afternoon." }
      ] },
      { "segments": [
        { "type": "text", "value": "Construction of the new crossing began in September and took six weeks. Meanwhile, the group organised walking buddies so nobody had to use the dark gap alone. Commuters who had never spoken before began meeting at the station entrance each morning." },
        { "type": "gap", "questionNumber": 19 },
        { "type": "text", "value": "One regular walker said those conversations made the six-week delay pass far more quickly than expected." }
      ] },
      { "segments": [
        { "type": "text", "value": "When the crossing opened, Elena found that almost nobody used the fence gap. The business park added a coffee cart, and the council planted two trees beside the path. The group continued meeting monthly to check safety." },
        { "type": "gap", "questionNumber": 20 },
        { "type": "text", "value": "The coffee seller served forty customers on the first morning, which made the improved route feel welcoming as well as safer. Elena kept her original report to show other residents how careful observations could support a practical request." }
      ] }
    ],
    "options": [
      { "key": "option-0", "text": "The replies convinced Elena that the problem was wider than she had first thought.", "correctForGap": 16 },
      { "key": "option-1", "text": "The report gave the transport office clear evidence rather than vague complaints.", "correctForGap": 17 },
      { "key": "option-2", "text": "The officer said that data from real journeys was far more persuasive than opinions alone.", "correctForGap": 18 },
      { "key": "option-3", "text": "The walking buddy system turned a frustrating delay into a chance to build friendships.", "correctForGap": 19 },
      { "key": "option-4", "text": "Elena said the trees were a small touch that made the whole route feel finished.", "correctForGap": 20 },
      { "key": "option-5", "text": "The train company offered free tickets to anyone who walked instead of driving.", "correctForGap": null },
      { "key": "option-6", "text": "A local newspaper refused to publish the story because it was too minor.", "correctForGap": null },
      { "key": "option-7", "text": "The business park threatened to close the unofficial gap with a concrete wall.", "correctForGap": null }
    ]
  },

  part5: {
  "title": "PLACEHOLDER_AUTHOR_ME",
  "text": "",
  "extra": "",
  "specs": []
},

  part6: {
  "title": "PLACEHOLDER_AUTHOR_ME",
  "text": "",
  "extra": "",
  "tail": "",
  "answers": [],
  "targets": []
},
}
