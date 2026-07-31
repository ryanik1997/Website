/**
 * PET B1 Reading Test 45 — canonical blueprint
 * Domain: weekend workshops and practical skills
 */
export default {
  testNumber: 45,
  id: 'catalog-reading-pet-b1-test45',
  title: 'PET B1 Reading Test 45',
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
      "title": "Weekend workshops notice",
      "text": "The weekend workshops team needs helpers on Saturday. Bring gloves and arrive before nine.",
      "explanation": "The text says: The weekend workshops team needs helpers on Saturday. Bring gloves and arrive before nine.",
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
      "text": "I have booked the practical skills session for Tuesday, but I may arrive late. Please start without me and save a place.",
      "explanation": "The text says: I have booked the practical skills session for Tuesday, but I may arrive late. Please start without me and save a place.",
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
      "text": "Visitors to the weekend workshops may use the tools, but they must return them before leaving.",
      "explanation": "The text says: Visitors to the weekend workshops may use the tools, but they must return them before leaving.",
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
      "text": "The new learners meeting has moved from Room 2 to Room 4 because the first room is being painted.",
      "explanation": "The text says: The new learners meeting has moved from Room 2 to Room 4 because the first room is being painted.",
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
      "text": "Members can borrow one practical skills guide for a week. Ask at the desk if you need another copy.",
      "explanation": "The text says: Members can borrow one practical skills guide for a week. Ask at the desk if you need another copy.",
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
  "domain": "weekend workshops and practical skills",
  "options": [
    {
      "key": "a",
      "title": "Beginner bird box workshop",
      "description": "A Saturday morning workshop where beginners build a wooden bird box to take home. All tools, screws and pre-cut panels are provided, and a tutor demonstrates each step. The group is limited to ten people, so book early. Participants only need to bring a pair of gloves.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-a"
    },
    {
      "key": "b",
      "title": "Evening clothes mending club",
      "description": "A relaxed evening club where members repair their own clothes instead of throwing them away. An experienced seamstress is always available to explain stitches and give advice. You bring a garment that needs mending; the club supplies thread, needles and spare buttons. Tea and biscuits are free.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-b"
    },
    {
      "key": "c",
      "title": "Budget home plumbing basics",
      "description": "A low-cost Sunday course that teaches simple plumbing repairs you can manage at home, such as replacing a tap washer or unblocking a sink. A plumber guides small groups through each job. The fee is small and includes a printed guide to take away. No previous experience is necessary.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-c"
    },
    {
      "key": "d",
      "title": "Quiet plant potting bench",
      "description": "A calm workshop held in a glasshouse at the edge of town, where participants pot seedlings for the community garden. Each person works at their own bench and at their own pace, with a gardener checking progress. Music is kept low, and the room stays peaceful even when full.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-d"
    },
    {
      "key": "e",
      "title": "Family banner painting day",
      "description": "An outdoor workshop for families where children and adults paint a large banner together for the town summer fair. Paints, brushes and aprons are supplied, and the activity only runs when the weather stays dry. Parents must stay with children under twelve throughout the morning.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-e"
    },
    {
      "key": "f",
      "title": "Bicycle puncture repair hour",
      "description": "A short lunchtime session that teaches you to fix a puncture so you can carry your own repair kit. Each participant brings a bicycle wheel and completes a full repair under supervision. You leave with a patch kit and the confidence to help a friend on the road.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-f"
    },
    {
      "key": "g",
      "title": "Introduction to woodcarving",
      "description": "A two-day introduction to woodcarving for people who already enjoy crafts and want a new challenge. Tools and seasoned wood are provided, and a skilled carver works alongside every participant. Places are limited to six so that each person receives individual attention throughout both days.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-g"
    },
    {
      "key": "h",
      "title": "Weekend furniture upcycling",
      "description": "An invitation to join a weekend group that turns second-hand furniture into useful pieces. A carpenter explains sanding, painting and new handles, while members decide on simple projects for the community room. Everyone is welcome, but you must book a place at least a week in advance.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-h"
    }
  ],
  "profiles": [
    {
      "text": "Nina has an old jacket with a torn sleeve that she cannot bear to throw away. She is free only on weekday evenings and would like an expert to show her how to mend it properly while she works.",
      "correctOptionKey": "b"
    },
    {
      "text": "Marco and his two young children want a shared outdoor activity where they can paint together. He needs the session to depend on fine weather, and he is happy to stay with the children for the whole activity.",
      "correctOptionKey": "e"
    },
    {
      "text": "Priya finds busy classes stressful and wants to learn a new practical skill somewhere calm. She has no experience, would like individual benches, and prefers a venue away from the noisy town centre where she can work at her own speed.",
      "correctOptionKey": "d"
    },
    {
      "text": "Jonah cycles to work every day and wants a practical skill he can use immediately on his own bike. He can only attend during his short lunch break and hopes to finish with a repair kit he can carry in his bag.",
      "correctOptionKey": "f"
    },
    {
      "text": "Alina has been doing crafts for years and now wants a more demanding skill that needs care and practice. She can give up a whole weekend and wants close personal coaching in a very small group with tools included.",
      "correctOptionKey": "g"
    }
  ]
},

  part3: {
  "title": "The Shelf That Took a Whole Saturday",
  "paragraphs": [
    "Tom noticed a poster for the community centre's weekend woodwork workshop while he was waiting for a bus. He had never held a chisel, but the poster promised a friendly tutor, a small group and a simple project to take home, so he booked the last place before the class filled up. On Saturday morning he arrived early, paid a small fee and collected a numbered apron from the reception desk. The woodwork room smelled of fresh pine, and eight workbenches stood in a row under bright windows.",
    "Meg, the tutor, began by explaining the safety rules and showing how to measure a piece of pine twice before cutting it once. She split the eight learners into pairs and gave each pair a small shelf design with clear diagrams. Tom measured carefully, but his first line wobbled, and Meg knelt beside his bench to guide his hand rather than doing the job for him. By the end of the first hour he had cut two straight boards and sanded their edges until they felt smooth.",
    "During the tea break, Tom noticed that his shelf pieces did not sit level on the bench. He had cut the second board a few millimetres too short, and the mistake would show when the shelf was hung. Instead of starting again, Meg showed him how to trim a small wedge of wood and glue it along the join. The repair took ten minutes, and Tom felt prouder of the fixed shelf than he would have felt about a perfect one.",
    "In the final hour, Tom glued the boards together, added two coat hooks and wiped the shelf with a soft cloth. The tutor checked every finished project, and the group took turns carrying the shelves down to the car park. Tom hung his shelf in the hall that evening and put his keys and glasses on it. The project taught him that a friendly workshop is more about patience than about natural talent, and he booked the cooking class for the following month."
  ],
  "buildExtension": " When the course ended, Meg pinned a photograph of the finished shelves to the noticeboard, and Tom wrote his name beside his.",
  "questions": [
    {
      "stem": "What is the text mainly about?",
      "options": [
        "A first-time learner discovering woodwork in a friendly small group.",
        "The history of the community centre's woodwork room.",
        "A tutor who refuses to give any help to beginners.",
        "The reasons why the workshop was cancelled."
      ],
      "correctIndex": 0
    },
    {
      "stem": "What did Tom collect before the workshop started?",
      "options": [
        "A list of the safety rules.",
        "A numbered apron from the reception desk.",
        "A set of chisels from the cupboard.",
        "A finished shelf from the noticeboard."
      ],
      "correctIndex": 1
    },
    {
      "stem": "Why were Tom's shelf pieces not level?",
      "options": [
        "The bench had a loose leg.",
        "He had cut the second board slightly too short.",
        "Meg gave him the wrong design.",
        "He forgot to sand the edges."
      ],
      "correctIndex": 1
    },
    {
      "stem": "How did Tom feel about the repaired shelf?",
      "options": [
        "He was ashamed of his mistake.",
        "He wished he had started again.",
        "He was prouder of it than of a perfect shelf.",
        "He decided to buy a ready-made one."
      ],
      "correctIndex": 2
    },
    {
      "stem": "In the last paragraph, what does 'it' refer to?",
      "options": [
        "the hall",
        "the shelf",
        "the evening",
        "the car park"
      ],
      "correctIndex": 1
    }
  ]
},

  part4: {
  "title": "How a Term Taught the Centre to Plan",
  "layoutParagraphs": [
    "When the community centre published its weekend workshop programme in September, the woodwork and cooking classes filled within two days. Organisers had expected the sewing group to be the most popular, so the speed of the bookings surprised them. (16) ..... The centre kept every class small so that a tutor could reach every bench.",
    "The sewing group, which the staff had expected to fill first, attracted only six people in the first week. (17) ..... So the organisers opened a second session on Saturday afternoon, and the extra volunteer soon became a regular helper.",
    "Keeping the groups small was not simply a choice, because the woodwork room had only eight benches and the kitchen held six stoves. The centre counted every bench and every stove before the bookings opened, and the numbers never changed. (18) ..... Later, tutors noticed that learners gained more in a quiet room.",
    "Midway through the term, one plan had to change. The plumbing tutor, who had agreed to run the repair workshop, announced that she was moving away at the end of the month. (19) ..... Owen asked to start a week later, and the centre agreed immediately.",
    "At the end of the term, the centre asked every learner to fill in a short comment form. The replies showed that members wanted longer courses and a few new workshops. (20) ..... The next programme, printed in January, included four new classes and kept the booking system that had worked so well."
  ],
  "layoutExtensions": [
    " A waiting list opened for each course, and nobody was turned away.",
    " The second session filled within a week, and both groups needed the same printed recipe sheet.",
    " The same numbers applied to the sewing room, which had twelve chairs.",
    " His first class passed without a single complaint.",
    " Enrolment opened on the same morning, and every class was full again within a week."
  ],
  "layoutClosers": [
    " The extra names helped the staff plan the next term.",
    " The staff marked the waiting list families first.",
    " Nobody minded, because everyone understood the reason.",
    " Members simply appreciated that the workshop had survived.",
    " The staff had learned that patience mattered most."
  ],
  "options": [
    {
      "key": "option-0",
      "text": "Their surprise soon became careful planning.",
      "correctForGap": 16
    },
    {
      "key": "option-1",
      "text": "The cooking class, by contrast, received almost a hundred requests for twenty-four places.",
      "correctForGap": 17
    },
    {
      "key": "option-2",
      "text": "These numbers were fixed by strict safety rules, so the classes could never grow beyond them.",
      "correctForGap": 18
    },
    {
      "key": "option-3",
      "text": "The centre searched its waiting list and found a retired plumber who could take over.",
      "correctForGap": 19
    },
    {
      "key": "option-4",
      "text": "Those comments shaped every decision for the winter programme.",
      "correctForGap": 20
    },
    {
      "key": "option-5",
      "text": "The plumber asked for a higher fee than the centre could afford.",
      "correctForGap": null
    },
    {
      "key": "option-6",
      "text": "Most learners preferred to practise at home before the class.",
      "correctForGap": null
    },
    {
      "key": "option-7",
      "text": "The fee for each course depended on the size of the room.",
      "correctForGap": null
    }
  ],
  "displayOrder": [
    2,
    5,
    0,
    7,
    3,
    1,
    6,
    4
  ]
},

  part5: {
  "title": "Book Early for the Weekend Classes",
  "text": "The community centre opens its weekend practical-skills workshops for booking every Monday morning. The woodwork room holds eight beginners, so places are usually gone within the hour. New learners choose a small project they can finish in two sessions, such as a bird box or a spice shelf. Everyone depends on the friendly tutor's help, and at the end of every session the tutor packs the tools away while members tidy their benches. Members often ask questions about sanding or varnishing, and the tutor writes each answer on the board. At first, cutting along the pencil line feels strange, but the group works slowly and checks every measurement twice. The friendly tutor walks between the benches, showing anyone who struggles how to hold the sandpaper. By the end of the course, most beginners have finished a shelf they can proudly hang in their kitchen. The cooking class runs on the same days and continues until June, when the centre closes for a month.",
  "extra": " A simple sign-up sheet sits beside the door, and latecomers rarely find a free place. Parents sometimes wait in the corridor and watch through the window. The centre prints a timetable each term and posts a copy near the entrance.",
  "specs": [
    {
      "phrase": "so",
      "languageTarget": "linking word",
      "options": [
        "yet",
        "unless",
        "so",
        "because"
      ],
      "correctIndex": 2
    },
    {
      "phrase": "choose",
      "languageTarget": "verb choice",
      "options": [
        "design",
        "choose",
        "order",
        "prepare"
      ],
      "correctIndex": 1
    },
    {
      "phrase": "away",
      "languageTarget": "phrasal verb",
      "options": [
        "away",
        "aside",
        "around",
        "back"
      ],
      "correctIndex": 0
    },
    {
      "phrase": "about",
      "languageTarget": "dependent preposition",
      "options": [
        "of",
        "for",
        "from",
        "about"
      ],
      "correctIndex": 3
    },
    {
      "phrase": "first",
      "languageTarget": "fixed expression",
      "options": [
        "last",
        "first",
        "once",
        "best"
      ],
      "correctIndex": 1
    },
    {
      "phrase": "until",
      "languageTarget": "time expression",
      "options": [
        "since",
        "during",
        "until",
        "after"
      ],
      "correctIndex": 2
    }
  ]
},

  part6: {
  "title": "Cooking Together on a Saturday Morning",
  "text": "I joined the Saturday cooking class at the community centre because a neighbour recommended it. The room was warm, and the windows stayed closed to keep the heat in. The tutor asked us to wear (27) ........ own aprons and to bring a tea towel. Everyone worked in pairs, and each pair took turns at one of the six stoves. The tutor answered every question, and each pair thanked (28) ........ with a small card at the end of the morning. She showed us how to test a dish by its smell, (29) ........ is quicker than tasting something too hot. The centre kept the fee low (30) ........ that anyone could afford a place. The final class ends with a shared meal, and (31) ........ of us brings a dish from home. As we cooked, the room filled (32) ........ with the smell of herbs and garlic.",
  "extra": " The tutor shared a recipe book with the group, and several of us photographed the best pages. A week later, everyone received a short summary of the course by email.",
  "tail": " The course changed how I shop, because I now choose ingredients for real recipes instead of guessing.",
  "answers": [
    "our",
    "her",
    "which",
    "so",
    "each",
    "with"
  ],
  "targets": [
    "determiner",
    "pronoun",
    "relative-word",
    "conjunction",
    "quantifier",
    "preposition"
  ]
},
}
