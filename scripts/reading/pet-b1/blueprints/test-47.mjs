/**
 * PET B1 Reading Test 47 — canonical blueprint
 * Domain: repair cafés
 */
export default {
  testNumber: 47,
  id: 'catalog-reading-pet-b1-test47',
  title: 'PET B1 Reading Test 47',
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
      "title": "Repair cafés notice",
      "text": "The repair cafés team needs helpers on Saturday. Bring gloves and arrive before nine.",
      "explanation": "The text says: The repair cafés team needs helpers on Saturday. Bring gloves and arrive before nine.",
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
      "text": "I have booked the broken appliances session for Tuesday, but I may arrive late. Please start without me and save a place.",
      "explanation": "The text says: I have booked the broken appliances session for Tuesday, but I may arrive late. Please start without me and save a place.",
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
      "text": "Visitors to the repair cafés may use the tools, but they must return them before leaving.",
      "explanation": "The text says: Visitors to the repair cafés may use the tools, but they must return them before leaving.",
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
      "text": "The volunteers meeting has moved from Room 2 to Room 4 because the first room is being painted.",
      "explanation": "The text says: The volunteers meeting has moved from Room 2 to Room 4 because the first room is being painted.",
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
      "text": "Members can borrow one broken appliances guide for a week. Ask at the desk if you need another copy.",
      "explanation": "The text says: Members can borrow one broken appliances guide for a week. Ask at the desk if you need another copy.",
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
  "domain": "repair cafés",
  "options": [
    {
      "key": "a",
      "title": "Kettle and toaster fix morning",
      "description": "A Saturday morning clinic where volunteers bring small household appliances that no longer work. Trained electricians test each item with you and guide simple repairs such as loose wires or worn switches. Screwdrivers, meters and spare parts are available on the benches. Repairs are free of charge.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-a"
    },
    {
      "key": "b",
      "title": "Evening bicycle service bench",
      "description": "An evening bench where you bring your bicycle and service it with help from a mechanic. You learn to adjust brakes, oil the chain and inflate tyres correctly. The mechanic checks your work at the end, and you leave with a checklist for future care of the bike.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-b"
    },
    {
      "key": "c",
      "title": "Repair cafe starter volunteer shift",
      "description": "A half-day shift for new volunteers who want to help at a repair café without knowing how to fix things. You greet visitors, take notes on broken items and keep tools tidy, while experienced repairers answer technical questions. Shifts run every Saturday afternoon and a mentor stays with you.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-c"
    },
    {
      "key": "d",
      "title": "Quiet soldering practice table",
      "description": "A calm corner of the repair café reserved for people who prefer to practise quietly. Each person gets a soldering iron, board and small kit to reassemble, and may work alone until they ask for help. A technician checks every finished board. Earplugs are available at the door.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-d"
    },
    {
      "key": "e",
      "title": "Family toy rescue afternoon",
      "description": "An afternoon when families bring broken toys and work together to give them a second life. Glue, paint and small replacement wheels are supplied, and helpers show children how to use each tool safely. The session runs only on dry afternoons and finishes before early evening.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-e"
    },
    {
      "key": "f",
      "title": "Zips and buttons masterclass",
      "description": "A focused session for people who already sew a little and struggle with zips, buttons and hems. A tailor demonstrates each fastening on a full-size model, and every participant repairs a garment they have brought. The class is limited to eight so that questions are answered at once.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-f"
    },
    {
      "key": "g",
      "title": "Secondhand furniture fixing day",
      "description": "A workshop in the café's basement workshop where volunteers restore donated furniture for families in need. Sanding, glueing and replacing handles are the main jobs, and woodworking tools are shared at each bench. The day lasts from morning until late afternoon with a shared lunch.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-g"
    },
    {
      "key": "h",
      "title": "One hour taster session",
      "description": "An invitation to spend one hour trying any repair task you like with no booking and no pressure. Coaches stand by to suggest easy first jobs such as tap washers, lamp plugs or curtain rails. Tools and refreshments are included, and you are welcome to bring one small item from home.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-h"
    }
  ],
  "profiles": [
    {
      "text": "Lena has a broken kettle and a lamp with a worn switch. She is free on Saturday mornings and has never opened an appliance before, so she wants a trained electrician to guide her through testing and fixing both items free of charge.",
      "correctOptionKey": "a"
    },
    {
      "text": "Daniel wants to volunteer at a repair café but cannot fix anything yet. He is available on Saturday afternoons, prefers helping at the desk rather than using tools, and would like an experienced mentor to stay with him during his first shifts.",
      "correctOptionKey": "c"
    },
    {
      "text": "Chloe commutes by bicycle and wants to learn to maintain it herself. She works every weekday and is only free in the evenings, and she would like a mechanic to check her work so she leaves confident she has done each task correctly.",
      "correctOptionKey": "b"
    },
    {
      "text": "Ravi is shy in busy groups and wants to repair small electronics without people around him. He would like to work on his own kit at his own pace until he asks for help, and he needs someone to check the finished result.",
      "correctOptionKey": "d"
    },
    {
      "text": "Elena sews her own clothes and wants to improve her skills with zips and buttons, which often frustrate her. She can bring a jacket that needs a new zip, and she wants close attention from a tailor in a small class.",
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
    "title": "Launching a Repair Café Group",
    "paragraphs": [
      { "segments": [
        { "type": "text", "value": "Three friends who were tired of throwing away broken toasters decided to start a monthly repair café in the village hall. They borrowed screwdrivers from a neighbour and put up handwritten posters at the bus stop. On the first Saturday, only four visitors arrived." },
        { "type": "gap", "questionNumber": 16 },
        { "type": "text", "value": "They agreed to hold the next session on the same Saturday the following month and advertise it more widely." }
      ] },
      { "segments": [
        { "type": "text", "value": "Word spread quickly because two of the four items were fixed within twenty minutes. A retired electrician named Gordon heard about the café and offered to come the following month. He brought his own multimeter and a box of spare fuses collected over thirty years." },
        { "type": "gap", "questionNumber": 17 },
        { "type": "text", "value": "Within six months, Gordon was training two younger helpers to test appliances safely before opening them." }
      ] },
      { "segments": [
        { "type": "text", "value": "By the third month, the café needed a booking system because too many people arrived at once. The organisers created a paper list at the entrance where visitors wrote their name and item. A volunteer greeted each person and estimated how long the repair might take." },
        { "type": "gap", "questionNumber": 18 },
        { "type": "text", "value": "Anyone who had to wait longer than expected was offered tea and biscuits in a quieter corner." }
      ] },
      { "segments": [
        { "type": "text", "value": "Not every repair succeeded, and the group had to decide what to do with items that could not be saved. Gordon suggested keeping a shelf for spare parts that might help future visitors. The team also began writing short notes explaining why certain repairs had failed." },
        { "type": "gap", "questionNumber": 19 },
        { "type": "text", "value": "Soon the shelf held so many useful switches and cables that the hall manager provided a second one." }
      ] },
      { "segments": [
        { "type": "text", "value": "After one year, the café had saved two hundred objects from the rubbish tip. The council mentioned the project in its newsletter, and a nearby town asked to copy the model. The friends happily shared their notes." },
        { "type": "gap", "questionNumber": 20 },
        { "type": "text", "value": "Three months later, the nearby town held its first session with twelve visitors. Gordon attended as a guest, but the new volunteers handled most repairs themselves, showing that the simple idea could work without its original team." }
      ] }
    ],
    "options": [
      { "key": "option-0", "text": "The friends felt encouraged that even a small turnout could make a difference.", "correctForGap": 16 },
      { "key": "option-1", "text": "His experience meant that some repairs which seemed impossible became straightforward.", "correctForGap": 17 },
      { "key": "option-2", "text": "The list reduced confusion and gave everyone a fair chance to be helped.", "correctForGap": 18 },
      { "key": "option-3", "text": "These notes later became a useful reference for new volunteers joining the team.", "correctForGap": 19 },
      { "key": "option-4", "text": "Gordon joked that the café had saved enough money to buy everyone a new toaster.", "correctForGap": 20 },
      { "key": "option-5", "text": "The village hall charged double rent for the extra table space.", "correctForGap": null },
      { "key": "option-6", "text": "A television crew arrived to film the entire session without warning.", "correctForGap": null },
      { "key": "option-7", "text": "The organisers decided to charge visitors for each item they brought.", "correctForGap": null }
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
