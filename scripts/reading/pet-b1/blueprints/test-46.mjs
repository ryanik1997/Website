/**
 * PET B1 Reading Test 46 — canonical blueprint
 * Domain: community gardens
 */
export default {
  testNumber: 46,
  id: 'catalog-reading-pet-b1-test46',
  title: 'PET B1 Reading Test 46',
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
      "title": "Community gardens notice",
      "text": "The community gardens team needs helpers on Saturday. Bring gloves and arrive before nine.",
      "explanation": "The text says: The community gardens team needs helpers on Saturday. Bring gloves and arrive before nine.",
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
      "text": "I have booked the shared plots session for Tuesday, but I may arrive late. Please start without me and save a place.",
      "explanation": "The text says: I have booked the shared plots session for Tuesday, but I may arrive late. Please start without me and save a place.",
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
      "text": "Visitors to the community gardens may use the tools, but they must return them before leaving.",
      "explanation": "The text says: Visitors to the community gardens may use the tools, but they must return them before leaving.",
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
      "text": "The local gardeners meeting has moved from Room 2 to Room 4 because the first room is being painted.",
      "explanation": "The text says: The local gardeners meeting has moved from Room 2 to Room 4 because the first room is being painted.",
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
      "text": "Members can borrow one shared plots guide for a week. Ask at the desk if you need another copy.",
      "explanation": "The text says: Members can borrow one shared plots guide for a week. Ask at the desk if you need another copy.",
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
  "domain": "community gardens",
  "options": [
    {
      "key": "a",
      "title": "Morning plot digging party",
      "description": "A Saturday morning gathering where new volunteers help prepare the shared vegetable plots for spring planting. Spades, forks and compost are all provided, and experienced members explain each job as you go. Wear sturdy shoes and bring a water bottle. The work finishes by noon.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-a"
    },
    {
      "key": "b",
      "title": "Evening plant swap gathering",
      "description": "A friendly evening event where gardeners bring spare seedlings and cuttings to exchange with neighbours. No money changes hands, and a table is set for beginners to ask questions. Plants without labels are welcome if the owner can name them. Hot drinks are served until closing.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-b"
    },
    {
      "key": "c",
      "title": "Rooftop herb growing course",
      "description": "A practical course held on a sunny rooftop where participants plant basil, mint and parsley in window boxes to keep at home. Pots, soil and seeds are included in the small fee, and a horticulturist demonstrates watering and picking. The course lasts two weekday evenings.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-c"
    },
    {
      "key": "d",
      "title": "Quiet flower arranging bench",
      "description": "A peaceful afternoon session for anyone who wants to slow down and arrange flowers from the garden. Each person receives a private workspace, scissors and a vase, and may spend as long as they like. A florist stays nearby to offer gentle help when requested.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-d"
    },
    {
      "key": "e",
      "title": "Community orchard planting day",
      "description": "A one-day event where volunteers plant fruit trees in the community orchard and learn how to support them. The orchard team supplies saplings, stakes and mulch, and a head gardener explains planting depth. Each participant leaves with a tree-guard kit and a map of the new orchard.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-e"
    },
    {
      "key": "f",
      "title": "Family bug hotel workshop",
      "description": "An outdoor family workshop where children and grown-ups build wooden bug hotels for the garden. All materials are provided, and the activity goes ahead only if the forecast is dry. Children must stay with an adult, and each family completes one hotel to take home and hang.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-f"
    },
    {
      "key": "g",
      "title": "Beginner allotment course",
      "description": "A six-week beginners course at the allotment site covering soil, planting and watering. Each learner is given a small starter plot, basic tools and seeds for the season. The course is very affordable and repeats every term, so missed sessions can be made up later.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-g"
    },
    {
      "key": "h",
      "title": "Night gardener social circle",
      "description": "Everyone is invited to join a relaxed circle that meets on summer evenings to water, weed and chat among the raised beds. Members take turns choosing a task, and beginners are paired with friendly regulars. Torches and watering cans are stored on site, so no one carries heavy equipment home.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-h"
    }
  ],
  "profiles": [
    {
      "text": "Tomas has two small children who love bugs and building things. He wants an outdoor family activity for the weekend that is cancelled if it rains, where everyone stays together and the family finishes with something to hang in their own garden.",
      "correctOptionKey": "f"
    },
    {
      "text": "Ingrid works a demanding office job and wants a slow, calming gardening activity after lunch. She prefers to work alone at her own table without being rushed, and she would like materials such as scissors and a vase provided for her.",
      "correctOptionKey": "d"
    },
    {
      "text": "Omar has just joined the community garden and wants to help prepare the shared vegetable plots for spring. He is free only on Saturday mornings, has no tools of his own and would like experienced members to explain each job as he works.",
      "correctOptionKey": "a"
    },
    {
      "text": "Hana is a complete beginner who wants to learn gardening properly over several weeks rather than in one session. She can afford only a small fee, and she needs the course to give her a plot of her own and basic tools to practise with.",
      "correctOptionKey": "g"
    },
    {
      "text": "Petra lives in a flat with no garden but has a sunny balcony. She wants to grow herbs at home and can attend two evenings a week, and she would like pots, soil and seeds included so she does not have to buy anything extra.",
      "correctOptionKey": "c"
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
    "title": "Organising a Community Garden",
    "paragraphs": [
      { "segments": [
        { "type": "text", "value": "The idea for a shared garden began at a residents' meeting in March. Only six people attended, but they agreed that the empty plot beside the library could become something useful. A retired teacher offered to draw a plan, and two neighbours said they would build raised beds." },
        { "type": "gap", "questionNumber": 16 },
        { "type": "text", "value": "The group then arranged another meeting to discuss what could be planted once the beds were filled." }
      ] },
      { "segments": [
        { "type": "text", "value": "By April, twelve volunteers had signed up and the council granted permission to use the land. The group cleared rubbish, tested the soil and bought compost with a small grant. A gardener named Pete showed everyone how to prepare the ground without chemicals." },
        { "type": "gap", "questionNumber": 17 },
        { "type": "text", "value": "Several members later said that April was when the garden truly began to feel like a shared project." }
      ] },
      { "segments": [
        { "type": "text", "value": "The first planting weekend attracted families who wanted to grow vegetables. Each household received a one-metre square, and a shared noticeboard recorded who had planted what. Children labelled their patches with painted stones, and a local shop donated seeds for beans and sunflowers." },
        { "type": "gap", "questionNumber": 18 },
        { "type": "text", "value": "Parents reported that their children soon began asking about composting and seasonal food at home." }
      ] },
      { "segments": [
        { "type": "text", "value": "Midsummer brought a problem: several plots were abandoned when families went on holiday. Weeds spread quickly, and the remaining volunteers struggled with watering. A teenager suggested creating a rota so that someone checked the garden every morning before school." },
        { "type": "gap", "questionNumber": 19 },
        { "type": "text", "value": "At the harvest supper, the group gave the teenager a small gift to thank her for the practical idea." }
      ] },
      { "segments": [
        { "type": "text", "value": "By October, the garden had produced enough vegetables for a harvest supper. Residents who had never spoken before exchanged recipes over the fence. After seeing photographs of the sunflowers, the council extended permission for two years." },
        { "type": "gap", "questionNumber": 20 },
        { "type": "text", "value": "A newspaper photographer visited and wrote about the project. The article brought more volunteers, while the group planned winter vegetables and covered tool storage. They also arranged monthly sessions so newcomers could learn how the plots were managed." }
      ] }
    ],
    "options": [
      { "key": "option-0", "text": "Within a fortnight, the first raised beds stood ready beside the library wall.", "correctForGap": 16 },
      { "key": "option-1", "text": "His advice made the difference between a tidy garden and an overgrown one.", "correctForGap": 17 },
      { "key": "option-2", "text": "The noticeboard became the heart of the project, and people checked it daily.", "correctForGap": 18 },
      { "key": "option-3", "text": "The rota worked so well that watering was never missed again, even during August.", "correctForGap": 19 },
      { "key": "option-4", "text": "Pete said it was the best example of neighbours working together that he had seen.", "correctForGap": 20 },
      { "key": "option-5", "text": "The library agreed to lend gardening books to every member for free.", "correctForGap": null },
      { "key": "option-6", "text": "A local restaurant offered to buy all the vegetables at market price.", "correctForGap": null },
      { "key": "option-7", "text": "The council sent a letter warning the group about noise complaints.", "correctForGap": null }
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
