/**
 * PET B1 Reading Test 41 — canonical blueprint
 * Domain: cycle routes
 */
export default {
  testNumber: 41,
  id: 'catalog-reading-pet-b1-test41',
  title: 'PET B1 Reading Test 41',
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
      "title": "Weekday commuter workshop at the station",
      "description": "A practical workshop at the railway station every weekday at eight o'clock, where commuters learn to plan safe routes to work. Trainers cover quick bike checks, helmet fitting and busy junctions, and every session ends with a short ride around the station area. Bikes are not required for the first lesson.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-a"
    },
    {
      "key": "b",
      "title": "Weekend mountain-bike skills park",
      "description": "A weekend session at the outdoor skills park where riders practise hills, bends and narrow bridges on a closed course. Coaches split teenagers and adults into separate groups, helmets are supplied and beginners start on flat ground before trying slopes. The park closes if the ground is icy.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-b"
    },
    {
      "key": "c",
      "title": "Hillside family cycle trail with hire bikes",
      "description": "A gentle family route that follows a disused railway line through the hills, with hire bikes in every size from child to adult. A picnic area marks the halfway point, water is sold at the start, and the surface is smooth gravel that suits new riders. The route is eight kilometres each way.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-c"
    },
    {
      "key": "d",
      "title": "Night riders group with lights and escorts",
      "description": "An evening cycling club for people who commute after dark. Members ride in a group with front and rear lights, and experienced escorts stay at the front and back of the line. New riders must complete one daytime safety session first, and the group pauses every twenty minutes.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-d"
    },
    {
      "key": "e",
      "title": "Cargo-bike delivery trial in the city",
      "description": "A six-week trial where volunteers deliver small packages around the city centre using electric cargo bikes. The project measures how many car journeys each delivery replaces, and successful riders receive a cycling voucher. Training and bikes are free, but volunteers must be available for one weekday shift each week.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-e"
    },
    {
      "key": "f",
      "title": "Gentle health rides with a physiotherapist",
      "description": "Slow group rides arranged around the health needs of adults recovering from injury. A physiotherapist sets the pace, chooses flat, traffic-free paths and plans stops every few minutes. Bikes with low steps are available, and riders join for as many or as few sessions as they like.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-f"
    },
    {
      "key": "g",
      "title": "Long-distance tour planning club",
      "description": "A club for cyclists who want to plan and ride longer routes, such as a two-day trip to the coast. Members share maps, repair their own bikes in the club workshop and test route notes on practice rides. The club meets twice a month and expects a reasonable level of fitness.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-g"
    },
    {
      "key": "h",
      "title": "School-run cycle bus for families",
      "description": "A supervised cycle bus that collects children from set points and rides together to the school gate each morning. Adults take turns leading and the route changes each term, so families can join from anywhere along the line. Children must pass a balance check and wear a helmet.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-h"
    }
  ],
  "profiles": [
    {
      "text": "Ben wants to reduce car use in his city and can spare one fixed shift every week. He would like to ride an electric bike with free training, carry small packages in a trial project, and earn a reward after six weeks.",
      "correctOptionKey": "e"
    },
    {
      "text": "Lina has two children aged seven and nine and wants a relaxed ride they can all manage. She needs bikes in child sizes, a flat smooth surface with no traffic, a lunch stop, and a route short enough for half a day.",
      "correctOptionKey": "c"
    },
    {
      "text": "Theo is an experienced cyclist who dreams of riding two days to the coast with friends. He wants help choosing routes and sharing maps, a place to maintain his own bicycle, and a group that tests planned journeys before the real trip.",
      "correctOptionKey": "g"
    },
    {
      "text": "Aria's children are too young to ride alone and the school is two kilometres from home. She wants a supervised morning group that collects children at points along the route, adults who take turns leading, and a balance test before anyone joins.",
      "correctOptionKey": "h"
    },
    {
      "text": "Omar is recovering from a knee operation and wants to start cycling again slowly. He needs rides led by a health professional on flat paths with no traffic, frequent short stops, and a bike that is easy to get on and off.",
      "correctOptionKey": "f"
    }
  ]
},

  part3: {
    "title": "A Town's Volunteers Plan Cycle Routes",
    "paragraphs": [
      "It began with a handful of neighbours who refused to accept that the only way to work was by car. After several residents said they would cycle if the roads felt safe enough, the group mapped the most popular journeys and found that three busy junctions were putting everyone off. They counted vehicles at each junction during the morning rush and photographed the gaps where cyclists had to squeeze past parked vans.",
      "The counts produced a simple report, and the report earned the group a small grant to build a separate cycle path along the riverside road. The path was meant to connect the station to the new business park, but the survey had shown that schoolchildren used the same road in the morning, so the volunteers added a school gate and asked parents to test the surface before it opened.",
      "Before the path opened properly, the volunteers organised a trial week. Anyone who wanted to try commuting could join a guided ride, pick up a spare helmet and report what they noticed, from a cracked manhole cover to a hedge that hid a turning. Volunteers walked the route every evening to check the conditions themselves.",
      "Riders' feedback changed more than the path. Complaints about slippery gravel after winter rain persuaded the volunteers to ask the council for a stronger surface, and the opening moved to spring, when fewer cyclists would be put off by bad weather. A local school then requested a second route to the far edge of town, and the group realised their small project had become a network.",
      "By the end of the first season, more than a hundred people were cycling to work or school every week. The volunteers had not planned a movement; they had simply trusted the evidence from their surveys and the honesty of the riders who used the routes."
    ],
    "buildExtension": " The trial week produced a long list of small fixes, and every item on the list was dealt with before the official opening. The most valuable lesson, however, came from the riders' notes: people did not only want a smooth surface, they wanted to feel visible at every junction, so the group promised to keep listening.",
    "questions": [
      {
        "stem": "What is the main point of the article?",
        "options": [
          "The routes were planned using evidence and rider feedback.",
          "Cycling was made compulsory for town workers.",
          "The council rejected all the volunteers' ideas.",
          "The project failed because of the weather."
        ],
        "correctIndex": 0
      },
      {
        "stem": "Why did the volunteers count vehicles at the junctions?",
        "options": [
          "To measure the length of the morning rush.",
          "To report careless drivers to the police.",
          "To find out which junctions were too dangerous.",
          "To choose a place to park their own vans."
        ],
        "correctIndex": 2
      },
      {
        "stem": "Why did the group add a school gate to the plan?",
        "options": [
          "Because parents wanted to sell refreshments.",
          "Because schoolchildren used the same road in the morning.",
          "Because the station needed more bicycle parking.",
          "Because the business park refused to build a gate."
        ],
        "correctIndex": 1
      },
      {
        "stem": "Why was the opening moved to spring?",
        "options": [
          "The path surface was not yet built.",
          "The council ran out of money.",
          "Fewer riders wanted to join the trial.",
          "Wet winter weather made the surface slippery."
        ],
        "correctIndex": 3
      },
      {
        "stem": "What does the writer suggest about the project's success?",
        "options": [
          "It depended on one determined organiser.",
          "It was mostly a matter of good luck.",
          "It came from listening to the people who used the routes.",
          "It happened despite the riders' criticism."
        ],
        "correctIndex": 2
      }
    ]
  },

  part4: {
    "title": "Junction Surveys Shape the Cycling Plan",
    "layoutParagraphs": [
      "The town's cycle-routes group started with a single question about the station junction. Volunteers stood at the crossing every morning and recorded how many cyclists had to wait, how many cars ignored the turning and where riders felt most exposed. (16) .....",
      "The trial week was planned for March, but heavy rain forced the group to change their dates. The riverside path flooded, so the opening moved to early April, when the surface could be checked properly. (17) .....",
      "Many riders had expected the new lane to solve everything, but the first feedback told a different story. Workers at the business park said the lane ended suddenly at the car park entrance, forcing them back into traffic. (18) .....",
      "Pupils at the high school needed a second crossing, so the volunteers ran a short survey during the lunch break. Most students arrived by bus but wanted to cycle once the roads felt calmer. (19) .....",
      "By autumn, the group trusted what the riders told them. A note about wet leaves produced a grit box, and a comment about lighting led to reflectors. (20) ....."
    ],
    "layoutExtensions": [
      " That evidence convinced the council to approve a proper cycle lane.",
      " By the time the path finally opened, three schools had asked to join the scheme.",
      " However, the volunteers treated the complaint as evidence rather than criticism.",
      " As a result, the group applied for money to build a second school gate.",
      " These small changes cost almost nothing, yet they built a habit of listening."
    ],
    "layoutClosers": [
      " The lane opened two months later, but nobody expected it to change the town.",
      " The first official riders arrived in the rain anyway, and several said the delay had made them more determined to use the route.",
      " The group agreed that a route ending at the most dangerous point was worse than no route at all.",
      " The extra gate opened before the summer term, and the morning cycle bus doubled within a fortnight.",
      " The volunteers knew that a route stays safe only while people keep talking about it, so they opened a monthly meeting where riders could compare notes. That meeting was the real difference."
    ],
    "options": [
      {
        "key": "option-0",
        "text": "The results were so clear that the group could not be ignored.",
        "correctForGap": 16
      },
      {
        "key": "option-1",
        "text": "By the time the path finally opened, three schools had asked to join the scheme.",
        "correctForGap": 17
      },
      {
        "key": "option-2",
        "text": "However, the volunteers treated the complaint as evidence rather than criticism.",
        "correctForGap": 18
      },
      {
        "key": "option-3",
        "text": "As a result, the group applied for money to build a second school gate.",
        "correctForGap": 19
      },
      {
        "key": "option-4",
        "text": "These small changes cost almost nothing, yet they built a habit of listening.",
        "correctForGap": 20
      },
      {
        "key": "option-5",
        "text": "The first attempt was cancelled because the station car park stayed locked.",
        "correctForGap": null
      },
      {
        "key": "option-6",
        "text": "Riders were asked to bring their own maps to every meeting.",
        "correctForGap": null
      },
      {
        "key": "option-7",
        "text": "The volunteers measured every junction again after the heavy snowfall.",
        "correctForGap": null
      }
    ],
    "displayOrder": [
      5,
      1,
      3,
      0,
      6,
      2,
      4,
      7
    ]
  },

  part5: {
    "title": "Trial Week on the Riverside Path",
    "text": "The cycle-routes group announced a free trial week for the new riverside path. Riders who wanted to try commuting could borrow a helmet and join a guided ride each morning. The group had asked for help with the lighting, and the council paid for twelve new lamps on the bridge. On the first morning the weather turned cold, but the volunteers went ahead with the trial since the forecast promised sunshine. By the end of the week, the number of commuters had grown steadily, and the local newspaper published a photo of the crossing. The path proved so popular that the council promised a second route to the school, because parents had campaigned for years. The group began a monthly accident survey to check whether the new lanes were making the roads safer for everyone. Parents said their children felt more confident, and one teacher noted that the cycle racks were finally full. The volunteers knew that a route improves only through patient work, day after day.",
    "extra": " Riders kept sending notes whenever it rained, so the volunteers repaired small problems before they grew. The council asked to use the maps in the town's travel guide, and the school asked for a walking map.",
    "specs": [
      {
        "phrase": "borrow",
        "languageTarget": "verb choice",
        "options": [
          "borrow",
          "buy",
          "order",
          "return"
        ],
        "correctIndex": 0
      },
      {
        "phrase": "ahead",
        "languageTarget": "phrasal verb",
        "options": [
          "away",
          "round",
          "ahead",
          "back"
        ],
        "correctIndex": 2
      },
      {
        "phrase": "steadily",
        "languageTarget": "adjective/adverb",
        "options": [
          "suddenly",
          "steadily",
          "rarely",
          "quietly"
        ],
        "correctIndex": 1
      },
      {
        "phrase": "because",
        "languageTarget": "linking word",
        "options": [
          "because",
          "unless",
          "although",
          "once"
        ],
        "correctIndex": 0
      },
      {
        "phrase": "safer",
        "languageTarget": "collocation",
        "options": [
          "busier",
          "shorter",
          "safer",
          "cheaper"
        ],
        "correctIndex": 2
      },
      {
        "phrase": "after",
        "languageTarget": "fixed expression",
        "options": [
          "from",
          "after",
          "before",
          "at"
        ],
        "correctIndex": 1
      }
    ]
  },

  part6: {
    "title": "Cycle Group's Fund-raising Ride",
    "text": "The volunteers needed extra money for the riverside path, so they planned (27) ........ sponsored ride. Each rider collected money for every kilometre they completed, and the school offered its playground as the start. On the morning of the ride, heavy rain nearly stopped the event, (28) ........ the volunteers refused to give up because the forecast promised a dry afternoon. Riders set off in small groups and reached the school without any difficulty. By the time the ride finished, the volunteers (29) ........ counted over a hundred riders, and every one arrived safely. Counting the money afterwards, (30) ........ took most of the afternoon, was slow but satisfying. One rider wrote to the councillors afterwards to thank (31) ........ for the new lights, and they replied that the path was already the most popular route in the town. The volunteers learned (32) ........ their next project should start with a question, not a map.",
    "extra": " The local paper published the result, and the council promised to match the money raised. A second ride was planned for the autumn.",
    "tail": " The group's next aim is a map of every safe route, so that commuters can ride without fear.",
    "answers": [
      "a",
      "but",
      "had",
      "which",
      "them",
      "that"
    ],
    "targets": [
      "article",
      "conjunction",
      "auxiliary",
      "relative-word",
      "pronoun",
      "conjunction"
    ]
  },
}
