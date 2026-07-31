export default {
  "testNumber": 40,
  "id": "catalog-reading-pet-b1-test40",
  "title": "PET B1 Reading – Test 40",
  "level": "B1",
  "examType": "cambridge",
  "timeLimitMinutes": 45,
  "totalQuestions": 32,
  "parts": [
    1,
    2,
    3,
    4,
    5,
    6
  ],
  "part1": {
    "cards": [
      {
        "key": "p1-card-1",
        "template": "notice",
        "title": "Garden work notice",
        "text": "The gardening session moves from Saturday morning to Friday evening because the market hall is being cleaned. Collect your gloves and trowel from the store room, and sign the book at the entrance. Only members with a signed safety form may join the work.",
        "question": {
          "stem": "What should members do first?",
          "options": [
            { "key": "a1", "text": "Sign the book and collect their tools." },
            { "key": "a2", "text": "Arrive on Saturday as planned." },
            { "key": "a3", "text": "Bring a cleaning cloth from home." }
          ],
          "correctOptionKey": "a1"
        }
      },
      {
        "key": "p1-card-2",
        "template": "email",
        "title": "Planting slot confirmed",
        "text": "Your place in Thursday's planting team is confirmed. Reply before Tuesday noon if you need a pair of knee pads, because the team has only twelve pairs. Wear boots and bring a water bottle. The engineer will check the railings before the team starts.",
        "question": {
          "stem": "What should the reader do before Tuesday?",
          "options": [
            { "key": "b1", "text": "Buy a new pair of boots." },
            { "key": "b2", "text": "Reply if knee pads are needed." },
            { "key": "b3", "text": "Confirm the railing check." }
          ],
          "correctOptionKey": "b2"
        }
      },
      {
        "key": "p1-card-3",
        "template": "poster",
        "title": "Roof garden open day",
        "text": "The community roof garden opens to visitors on Sunday from ten until four. Children must stay with an adult near the planters, and everyone should use the marked walkway so that the herbs stay safe. Seedlings are free for the first forty families.",
        "question": {
          "stem": "What must visitors do?",
          "options": [
            { "key": "c1", "text": "Bring a seedling from home." },
            { "key": "c2", "text": "Arrive before ten o'clock." },
            { "key": "c3", "text": "Keep to the marked walkway." }
          ],
          "correctOptionKey": "c3"
        }
      },
      {
        "key": "p1-card-4",
        "template": "message",
        "title": "Waiting list message",
        "text": "The Saturday digging group is full, but a waiting list has opened at the market office. If a place frees, the organiser will call you. Keep your phone on during the morning, and bring your gloves to the office when you sign up.",
        "question": {
          "stem": "What can the reader do?",
          "options": [
            { "key": "d1", "text": "Join the waiting list at the office." },
            { "key": "d2", "text": "Take a place on Saturday." },
            { "key": "d3", "text": "Leave a message for the organiser." }
          ],
          "correctOptionKey": "d1"
        }
      },
      {
        "key": "p1-card-5",
        "template": "update",
        "title": "Planting day update",
        "text": "The herb planting moves from Friday to the following Wednesday because the engineer needs more time to check the water tank. The soil will be delivered on Tuesday, and the team should meet at the lift by nine. Bring a trowel if you have one.",
        "question": {
          "stem": "When will the planting happen?",
          "options": [
            { "key": "e1", "text": "On the coming Friday." },
            { "key": "e2", "text": "On the following Wednesday." },
            { "key": "e3", "text": "On the Tuesday." }
          ],
          "correctOptionKey": "e2"
        }
      }
    ]
  },
  "part2": {
    "domain": "plants, buildings and cooperation",
    "options": [
      {
        "key": "option-a",
        "title": "Beginner potting session on the market roof",
        "openingStyle": "activity-led",
        "description": "A guided beginner session where you plant herbs in recycled containers on the market roof. Gloves, soil and seeds are supplied, the group is small, and a volunteer explains each step while you work. You can ask questions and take your finished pot home. No previous gardening experience is needed.",
        "constraints": [
          "guided",
          "beginner",
          "materials supplied",
          "small group",
          "take-home pot"
        ],
        "imageSlotKey": "option-a"
      },
      {
        "key": "option-b",
        "title": "Saturday watering rota beside the rain tank",
        "openingStyle": "schedule-led",
        "description": "A short weekly slot on the watering rota beside the big rain tank. Each volunteer looks after one corner of the roof garden for half an hour, checks the soil with a finger, and records what they watered. The times are fixed each week, so you can plan around them, and the group shares one notebook.",
        "constraints": [
          "fixed weekly time",
          "short slot",
          "self-directed",
          "outdoor",
          "record-keeping"
        ],
        "imageSlotKey": "option-b"
      },
      {
        "key": "option-c",
        "title": "Compost workshop using market waste",
        "openingStyle": "feature-led",
        "description": "A practical workshop that turns vegetable peelings from the market stalls into compost for the roof beds. The tutor demonstrates the layers, you build a bin with a small team, and every participant leaves with a printed guide. It suits people who want to reduce waste and see a clear result by the end of the session.",
        "constraints": [
          "waste reduction",
          "demonstration",
          "team work",
          "take-home guide"
        ],
        "imageSlotKey": "option-c"
      },
      {
        "key": "option-d",
        "title": "Roof tour and herb tasting for beginners",
        "openingStyle": "need-led",
        "description": "A relaxed walking tour of the roof garden designed for people who have never grown anything. You smell and taste the herbs, hear how the plants survive the wind, and finish with a cup of mint tea. There are benches at every stop, so no one needs to stand for long.",
        "constraints": [
          "gentle pace",
          "seated stops",
          "no experience needed",
          "herb tasting"
        ],
        "imageSlotKey": "option-d"
      },
      {
        "key": "option-e",
        "title": "Weekend fruit-picking team in the planters",
        "openingStyle": "outcome-led",
        "description": "A weekend team that harvests tomatoes, strawberries and beans from the tall planters and shares the crop among the helpers. The work is physical but straightforward, each shift lasts two hours, and you go home with a bag of produce. Families are welcome, and tools are provided on arrival.",
        "constraints": [
          "physical",
          "weekend",
          "produce share",
          "family friendly"
        ],
        "imageSlotKey": "option-e"
      },
      {
        "key": "option-f",
        "title": "Evening green-gym session to fix the beds",
        "openingStyle": "audience-led",
        "description": "An evening session for adults who like practical exercise in the fresh air. You rebuild wooden bed edges, hammer loose panels and move sacks of compost under the engineer's direction. It is open to all fitness levels, the pace is steady, and a cool drink is waiting at the end.",
        "constraints": [
          "evening",
          "adults",
          "physical exercise",
          "cool drink",
          "engineer supervision"
        ],
        "imageSlotKey": "option-f"
      },
      {
        "key": "option-g",
        "title": "Family seed-painting morning by the lift",
        "openingStyle": "location-led",
        "description": "A family morning that combines planting and art beside the market lift. Children decorate small pots with coloured seeds, then fill them with soil and choose a herb to grow at home. All materials are included, an adult must stay, and the session finishes before lunch.",
        "constraints": [
          "family",
          "children with adult",
          "materials included",
          "before lunch"
        ],
        "imageSlotKey": "option-g"
      },
      {
        "key": "option-h",
        "title": "Self-guided plant care with a phone guide",
        "openingStyle": "invitation-led",
        "description": "A free self-guided activity where you borrow a phone guide and wander the roof paths alone. The recording explains each plant's name and needs, but there is no staff member with you, so you set your own pace. It is flexible, though you must return the phone before the market closes.",
        "constraints": [
          "free",
          "self-guided",
          "flexible",
          "return phone"
        ],
        "imageSlotKey": "option-h"
      }
    ],
    "profiles": [
      {
        "key": "profile-1",
        "text": "Rosa is a complete beginner who wants to grow her first herbs, needs gloves and soil provided, prefers a small guided group, and can only attend during a weekday morning.",
        "correctOptionKey": "option-a"
      },
      {
        "key": "profile-2",
        "text": "Marco works in a market café and can only help after his shift ends at seven. He wants simple physical work in the fresh air and a cool drink when he finishes.",
        "correctOptionKey": "option-f"
      },
      {
        "key": "profile-3",
        "text": "Anita has two young children and wants a short activity before lunch with all materials included and no special equipment to book.",
        "correctOptionKey": "option-g"
      },
      {
        "key": "profile-4",
        "text": "Chen runs a fruit shop and wants to learn how to turn his unsold waste into something useful, leaving with clear written instructions.",
        "correctOptionKey": "option-c"
      },
      {
        "key": "profile-5",
        "text": "Iris has limited mobility and wants to see the garden slowly with somewhere to sit at each stop, tasting the herbs without doing heavy work.",
        "correctOptionKey": "option-d"
      }
    ]
  },
  "part3": {
    "title": "A roof garden built on evidence",
    "paragraphs": [
      "People who live in the flats above the market wanted an empty roof turned into a small community garden, but first they had to prove the space was safe. The residents walked the roof route, marked the narrow points and checked which signs could be moved to make room for planters without blocking the emergency exit. Because the roof was old, the group measured the distance to the edge carefully and recorded every section that needed extra support before asking the engineer for advice.",
      "The first plan changed after the engineer's safety advice. A walk along the proposed route showed that it would force visitors too close to the edge, where the ground sloped towards the street below. Residents measured a safer route, compared the two options and adjusted the position of the planters so that people could walk around them without stepping near the danger. They recorded the revised figures for the engineer.",
      "The residents did not accept the new route simply because the engineer had asked for it. They measured the revised route, asked visitors to describe its weak points and recorded the result for the engineer to review. They discovered that a slightly less attractive arrangement was much easier to use safely in wet weather, and they agreed to accept the practical choice. The extra metres cost little, yet the safety walk had shown exactly why the old route worried everyone.",
      "Several residents preferred a prettier route that wound close to the edge, but the engineer's measurements showed clearly why it was unsafe in wet weather. The final decision rested on access and safety rather than on looks, and the group presented the evidence to the market committee to win their support for the garden. The engineer also asked the group to re-measure the route after heavy rain, so the garden stayed safe all year."
    ],
    "buildExtension": " Once the planters were installed, the roof garden quickly became a popular place for residents to meet, and the market committee agreed to fund a small water tank for the plants. The group kept their measurements so future changes could be checked against the same evidence.",
    "questions": [
      {
        "stem": "What did the residents need to prove first?",
        "options": [
          "That the roof was safe to use.",
          "That the market should close.",
          "That they could grow expensive plants.",
          "That the roof was the prettiest option."
        ],
        "correctIndex": 0
      },
      {
        "stem": "Why did the first route have to change?",
        "options": [
          "It brought visitors too close to the edge.",
          "It was too expensive to build.",
          "It blocked the market entrance.",
          "It faced the wrong direction."
        ],
        "correctIndex": 0
      },
      {
        "stem": "How did the residents choose the new route?",
        "options": [
          "They measured both routes and compared them.",
          "They guessed which one looked nicer.",
          "They followed the engineer without checking.",
          "They asked visitors to vote immediately."
        ],
        "correctIndex": 0
      },
      {
        "stem": "Why did the residents accept the less attractive option?",
        "options": [
          "Because it was much safer to use.",
          "Because they had no other choice.",
          "Because the engineer refused to help.",
          "Because the market committee insisted."
        ],
        "correctIndex": 0
      },
      {
        "stem": "What is the main idea of the text?",
        "options": [
          "Evidence and safety should guide community decisions.",
          "Appearance matters more than safety.",
          "Engineers always make the wrong choices.",
          "Community projects are never successful."
        ],
        "correctIndex": 0
      }
    ]
  },
  "part4": {
    "title": "The roof garden plan is tested for safety",
    "layoutParagraphs": [
      "People living in the flats above the market wanted a community garden on the roof, but they first had to prove that the space was safe. They walked the route, marked the narrow sections and measured the distance from the edge at every point. (16) ..... These figures were written into a simple table, so the engineer could check every number against the plan before giving advice.",
      "The first route looked attractive because it passed the sunniest corner, but the safety walk showed that it led visitors too near the edge. (17) ..... That alternative added a few extra metres, yet it kept people well away from the steep edge even in heavy rain.",
      "The group had expected the original plan to be approved without changes, so the engineer's report came as a surprise. (18) ..... Comparing the two designs on paper made the choice easier, because the numbers showed the difference clearly. They measured the alternative route, compared the two options carefully and agreed to accept the safer design.",
      "Some residents still preferred the prettier path and argued that the risk was small, especially on dry days. (19) ..... The group pinned it to the notice board and used it to answer every question about the change, which finally convinced the doubters.",
      "Once the planters were installed, the roof garden quickly became a popular meeting place. (20) ..... The residents kept their records so that any future extension could be checked against the same evidence that had guided the original design."
    ],
    "layoutExtensions": [
      " The engineer later confirmed every figure on the spot.",
      " The longer route cost only a little extra time, and nobody minded the change once the figures were shown on the engineer's table.",
      " The report also explained why the first route would become dangerous after rain, which removed the last doubts about the change.",
      "",
      ""
    ],
    "layoutClosers": [
      "",
      "",
      "",
      " A copy of the drawing was also left at the market office, so residents could inspect it in their own time.",
      " The stored records meant that the next improvement could be designed with the same care, rather than starting from memory alone."
    ],
    "options": [
      {
        "key": "option-0",
        "text": "The careful measurements gave the engineer the evidence he needed.",
        "correctForGap": 16
      },
      {
        "key": "option-1",
        "text": "The safer route kept visitors well away from the steep edge.",
        "correctForGap": 17
      },
      {
        "key": "option-2",
        "text": "The engineer's report forced the group to rethink the design.",
        "correctForGap": 18
      },
      {
        "key": "option-3",
        "text": "A simple drawing from the engineer made the danger obvious to everyone.",
        "correctForGap": 19
      },
      {
        "key": "option-4",
        "text": "The recorded measurements would guide any future changes to the garden.",
        "correctForGap": 20
      },
      {
        "key": "option-5",
        "text": "The market committee closed the roof permanently.",
        "correctForGap": null
      },
      {
        "key": "option-6",
        "text": "The residents built the garden without any checks.",
        "correctForGap": null
      },
      {
        "key": "option-7",
        "text": "The engineer refused to visit the roof at all.",
        "correctForGap": null
      }
    ],
    "displayOrder": [
      2,
      6,
      0,
      5,
      1,
      7,
      3,
      4
    ]
  },
  "part5": {
    "title": "Selling Cards at the Weekend Market",
    "text": "My friend and I opened a small stall at the weekend market to sell handmade cards. We spent two weeks designing them, choosing bright colours and simple messages that would appeal to different customers. On the first morning, we sold nothing until noon, and we began to worry that our idea had failed. Then a grandmother bought three cards and asked if we could make more with her grandchildren's names on them. Word spread quickly, and by closing time we had sold almost every card. We learned that a small idea could succeed if we listened to what customers wanted, and we are already planning a bigger stall for next month with a wider range of designs.",
    "extra": " The stall cost more than we expected, but the profit from the second weekend covered our costs and left enough for new materials. We now keep a notebook of customer suggestions and use them to design the next batch of cards. Several regular customers come back every week, and we have started taking special orders for birthdays and family events. Our regulars also bring photos of the cards they have sent, which gives us ideas. We now sell a few cards at the flower stall next door.",
    "specs": [
      {
        "phrase": "handmade",
        languageTarget: 'collocation',
        "options": [
          "handmade",
          "printed",
          "knitted",
          "baked"
        ],
        "correctIndex": 0
      },
      {
        "phrase": "designing",
        languageTarget: 'verb choice',
        "options": [
          "design",
          "designing",
          "designed",
          "designs"
        ],
        "correctIndex": 1
      },
      {
        "phrase": "nothing",
        languageTarget: 'context-sensitive grammar',
        "options": [
          "anything",
          "something",
          "nothing",
          "everything"
        ],
        "correctIndex": 2
      },
      {
        "phrase": "bought",
        languageTarget: 'meaning distinction',
        "options": [
          "brought",
          "borrowed",
          "rented",
          "bought"
        ],
        "correctIndex": 3
      },
      {
        "phrase": "quickly",
        languageTarget: 'adjective/adverb',
        "options": [
          "quickly",
          "quietly",
          "loudly",
          "gently"
        ],
        "correctIndex": 0
      },
      {
        "phrase": "from",
        languageTarget: 'dependent preposition',
        "options": [
          "of",
          "from",
          "by",
          "with"
        ],
        "correctIndex": 1
      }
    ]
  },
  "part6": {
    "title": "From Car Park to Community Garden",
    "text": "A group of residents decided to turn an unused car park into a small community garden. They applied for permission, and the council agreed (27) ........ they kept the entrance clear for deliveries. The first weekend, dozens of neighbours arrived to help dig and plant, (28) ........ surprised the organisers. Each family was given a small plot, and the garden soon became a place (29) ........ neighbours could relax while watering their vegetables. The project was so successful that the council offered funding for a second garden nearby, and the residents planned to work (30) ........ one team, sharing tools and advice between the two sites. By autumn, the first vegetables were ready to harvest, and the neighbours held a meal where (31) ........ dish came from their own plots. The garden had grown into something much bigger than anyone had imagined, and it became (32) ........ most popular meeting place in the neighbourhood.",
    "extra": " The second garden opened the following spring, and the two sites now share a small shed and a compost bin near the main entrance.",
    "tail": " The garden gave neighbours a shared reason to meet and turned an empty space into a source of fresh food.",
    "answers": [
      "provided",
      "which",
      "where",
      "as",
      "every",
      "the"
    ],
    targets: [
      'conjunction',
      'relative-word',
      'relative-word',
      'preposition',
      'determiner',
      'article'
    ]
  }
}
