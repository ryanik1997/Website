/**
 * PET B1 Reading Test 48 — canonical blueprint
 * Domain: night markets and street food
 */
export default {
  testNumber: 48,
  id: 'catalog-reading-pet-b1-test48',
  title: 'PET B1 Reading Test 48',
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
      "title": "Night markets notice",
      "text": "The night markets team needs helpers on Saturday. Bring gloves and arrive before nine.",
      "explanation": "The text says: The night markets team needs helpers on Saturday. Bring gloves and arrive before nine.",
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
      "text": "I have booked the street food session for Tuesday, but I may arrive late. Please start without me and save a place.",
      "explanation": "The text says: I have booked the street food session for Tuesday, but I may arrive late. Please start without me and save a place.",
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
      "text": "Visitors to the night markets may use the tools, but they must return them before leaving.",
      "explanation": "The text says: Visitors to the night markets may use the tools, but they must return them before leaving.",
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
      "text": "The visitors meeting has moved from Room 2 to Room 4 because the first room is being painted.",
      "explanation": "The text says: The visitors meeting has moved from Room 2 to Room 4 because the first room is being painted.",
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
      "text": "Members can borrow one street food guide for a week. Ask at the desk if you need another copy.",
      "explanation": "The text says: Members can borrow one street food guide for a week. Ask at the desk if you need another copy.",
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
  "domain": "night markets and street food",
  "options": [
    {
      "key": "a",
      "title": "Evening street food tasting walk",
      "description": "A guided evening walk that stops at six popular stalls for a taste of local specialities. The group is kept under ten, booking opens one week ahead, and the route covers about two kilometres. Guests should bring small change because several stalls only accept cash.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-a"
    },
    {
      "key": "b",
      "title": "Seated vegetarian tasting night",
      "description": "A relaxed evening meal in a covered food hall where diners sit at shared tables and receive eight small vegetarian dishes served over two hours. Every plate lists its main ingredients, and staff describe each dish. Tables stand close to the entrance, so guests hardly walk at all, and students pay a reduced price.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-b"
    },
    {
      "key": "c",
      "title": "Family lantern food evening",
      "description": "An outdoor evening event in the park with lantern making, soft music and games for young children. A separate children's menu avoids spicy dishes, the fun ends at quarter to nine, and children under ten enter free. Parents stay together and each child receives a small lantern to keep.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-c"
    },
    {
      "key": "d",
      "title": "Weekend market stall helper",
      "description": "A Sunday volunteer shift at a busy market stall that teaches useful skills and finishes with a free hot meal for every helper. Newcomers are welcome, training takes ten minutes, and the work includes carrying some heavy boxes. Helpers must be at least sixteen years old.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-d"
    },
    {
      "key": "e",
      "title": "Midnight street food crawl",
      "description": "Four cheap snack stops after eleven at night, served from standing counters by the river. Each stop offers a different unusual flavour, a student card takes money off every plate, and the last counter closes at one. Cash and cards are accepted, a drink is included, and portions are generous, so arrive hungry.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-e"
    },
    {
      "key": "f",
      "title": "Early morning food photography",
      "description": "A quiet weekday morning in the market before the crowds arrive, when the light is soft and stalls still stand half empty. A photographer shows you angles for every dish and answers questions; you need your own camera. The visit is unhurried and ends before nine.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-f"
    },
    {
      "key": "g",
      "title": "Two hour cooking masterclass",
      "description": "An evening masterclass where a chef teaches you to prepare three dishes from scratch. All ingredients are supplied, the class is limited to eight people, and participants must be able to stand for the whole two hours. A course fee is charged, and an apron is provided.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-g"
    },
    {
      "key": "h",
      "title": "Meat only food truck corner",
      "description": "An outdoor corner with three food trucks that serve only meat dishes, takeaway style, with no seating and no vegetarian choices. The trucks operate every evening but close at eight, and prices are moderate. Portions are large enough to share, and the menu changes each week.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-h"
    }
  ],
  "profiles": [
    {
      "text": "Nadia is vegetarian and cannot walk far because of a knee injury. She has one free evening this week, wants to taste many dishes without spending much, and prefers to sit rather than queue at stalls.",
      "correctOptionKey": "b"
    },
    {
      "text": "Tomas wants an outdoor evening with his two young children, who dislike spicy food and need to be home before nine. He hopes for something safe and lively near the park, with little walking.",
      "correctOptionKey": "c"
    },
    {
      "text": "Mei is a teenager with no cooking experience who wants weekend work where she can learn useful skills and receive a free meal. She is free on Sunday evenings and does not mind lifting heavy boxes.",
      "correctOptionKey": "d"
    },
    {
      "text": "Ravi is a student on a very small budget who finishes studying late and wants cheap midnight snacks. He is happy to eat standing up at a counter and enjoys trying unusual flavours.",
      "correctOptionKey": "e"
    },
    {
      "text": "Anja wants to photograph street food for her college portfolio and needs calm lighting before the crowds arrive. She is free on weekday mornings and would like a quiet, unhurried visit with expert tips on camera angles.",
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
    "title": "Building a Night Market Plan",
    "paragraphs": [
      { "segments": [
        { "type": "text", "value": "Art college students wanted a night market where local makers could sell handmade goods after dark. They chose an old car park near the river because it was empty on Friday evenings. The students drew a map showing each stall and the visitor entrance." },
        { "type": "gap", "questionNumber": 16 },
        { "type": "text", "value": "After checking the measurements again, they submitted the final version to the council for a safety inspection." }
      ] },
      { "segments": [
        { "type": "text", "value": "The first challenge was lighting, because the car park had only two working lamps. An engineering student designed battery-powered fairy lights hung between wooden poles. The college lent the poles from its theatre department, and a shop donated the necessary cable." },
        { "type": "gap", "questionNumber": 17 },
        { "type": "text", "value": "A photographer captured the finished scene from the bridge, and the image was shared widely by local residents." }
      ] },
      { "segments": [
        { "type": "text", "value": "Thirty makers joined the opening night, selling goods from printed scarves to wooden phone stands. The students asked sellers to keep prices below twenty pounds. A food van at the entrance offered hot soup and bread to anyone wanting a break." },
        { "type": "gap", "questionNumber": 18 },
        { "type": "text", "value": "The food van owner was pleased with the response and asked to return every week for the rest of term." }
      ] },
      { "segments": [
        { "type": "text", "value": "Rain threatened the second market, so the team had to cancel or find cover. A student contacted a marquee company that lent two large tents in exchange for advertising space. Visitors said the tents made the event feel cosier than the open car park." },
        { "type": "gap", "questionNumber": 19 },
        { "type": "text", "value": "Impressed by the organisation, the marquee company later offered the students a discount for any future events." }
      ] },
      { "segments": [
        { "type": "text", "value": "By the end of term, the market attracted two hundred visitors each week. The college featured it in its prospectus, and three students found part-time work managing stalls. The group planned to continue through summer with a smaller team." },
        { "type": "gap", "questionNumber": 20 },
        { "type": "text", "value": "A lecturer praised the project for combining creativity with careful organisation. More importantly, the students understood how to negotiate with suppliers, respond to bad weather and share responsibility when decisions had to be made quickly." }
      ] }
    ],
    "options": [
      { "key": "option-0", "text": "The map took three attempts to get right because the entrance was too narrow at first.", "correctForGap": 16 },
      { "key": "option-1", "text": "The lights transformed the space and gave the market a warm, festive atmosphere.", "correctForGap": 17 },
      { "key": "option-2", "text": "Several visitors stayed for over an hour, browsing between stalls and chatting to the makers.", "correctForGap": 18 },
      { "key": "option-3", "text": "The decision to go ahead despite the weather showed that the team could handle unexpected problems.", "correctForGap": 19 },
      { "key": "option-4", "text": "The students said the experience taught them more about planning than any lecture could.", "correctForGap": 20 },
      { "key": "option-5", "text": "The council refused permission because the car park flooded every winter.", "correctForGap": null },
      { "key": "option-6", "text": "A rival market opened on the same street the following weekend.", "correctForGap": null },
      { "key": "option-7", "text": "The students charged each maker fifty pounds for a stall on the first night.", "correctForGap": null }
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
