/**
 * PET B1 Reading Test 50 — canonical blueprint
 * Domain: school library activities
 */
export default {
  testNumber: 50,
  id: 'catalog-reading-pet-b1-test50',
  title: 'PET B1 Reading Test 50',
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
      "title": "School libraries notice",
      "text": "The school libraries team needs helpers on Saturday. Bring gloves and arrive before nine.",
      "explanation": "The text says: The school libraries team needs helpers on Saturday. Bring gloves and arrive before nine.",
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
      "text": "I have booked the reading corners session for Tuesday, but I may arrive late. Please start without me and save a place.",
      "explanation": "The text says: I have booked the reading corners session for Tuesday, but I may arrive late. Please start without me and save a place.",
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
      "text": "Visitors to the school libraries may use the tools, but they must return them before leaving.",
      "explanation": "The text says: Visitors to the school libraries may use the tools, but they must return them before leaving.",
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
      "text": "The students meeting has moved from Room 2 to Room 4 because the first room is being painted.",
      "explanation": "The text says: The students meeting has moved from Room 2 to Room 4 because the first room is being painted.",
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
      "text": "Members can borrow one reading corners guide for a week. Ask at the desk if you need another copy.",
      "explanation": "The text says: Members can borrow one reading corners guide for a week. Ask at the desk if you need another copy.",
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
  "domain": "school library activities",
  "options": [
    {
      "key": "a",
      "title": "After school reading buddy",
      "description": "A weekday afternoon programme where adult volunteers read aloud with pupils in the second year, one child at a time. Training lasts one hour, no computer skills are needed, and sessions run between three and five. Volunteers meet the same child each week, which builds confidence quickly.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-a"
    },
    {
      "key": "b",
      "title": "Puppet story time for toddlers",
      "description": "A free Friday morning session for children under five, with puppets, songs and picture books. No booking is needed, parents stay with their child, and the room grows noisy as children join in the stories. It ends with a sticker for every child, and older siblings are welcome too.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-b"
    },
    {
      "key": "c",
      "title": "Book mending workshop",
      "description": "A weekend half-day class where you learn to repair torn books with new spines and clean pages. Groups stay small, every tool is supplied, and beginners finish with three techniques they can use at home. The teacher demonstrates each step, and you keep the books you practise on.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-c"
    },
    {
      "key": "d",
      "title": "Library app coaching",
      "description": "A free drop-in session where staff help you use the school library app to borrow ebooks and renew loans. Bring your own device, join on weekday lunchtimes, and follow the steps at your own speed with a helper beside you. No appointment is needed, and the service is open to all ages.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-d"
    },
    {
      "key": "e",
      "title": "Multilingual book circle",
      "description": "An evening club where members read a story in six different languages and take turns choosing the next book. Tea and biscuits are served, conversation is lively, and each member is expected to finish one novel a month. Newcomers are welcome, but regular attendance matters to the group.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-e"
    },
    {
      "key": "f",
      "title": "Silent study room with exam desk",
      "description": "A silent study room open until ten at night, with desks that students reserve in advance and revision guides kept on shelves inside. Only enrolled students may enter, and phones must stay switched off while inside. Late-evening demand is high, so desks often book out several days ahead.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-f"
    },
    {
      "key": "g",
      "title": "Holiday reading quest",
      "description": "A six-week summer challenge for readers aged twelve to sixteen, where points are collected through an app and prizes go to the ten highest scorers. Each week offers a fresh reading list, and finishing any book earns double points. A celebration event at the end marks every reader who completes the quest.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-g"
    },
    {
      "key": "h",
      "title": "Early book sorting shift",
      "description": "An early shift that shelves donated books before the school opens, with heavy boxes arriving on some mornings. No experience is needed, shifts run on weekdays from seven to nine, and volunteers work on their own or in pairs. A member of staff stays nearby to answer questions during the shift.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-h"
    }
  ],
  "profiles": [
    {
      "text": "Grace has just retired and wants to help young pupils with their reading on weekday afternoons. She prefers quiet one-to-one work, has no computer skills, and would like a little training first.",
      "correctOptionKey": "a"
    },
    {
      "text": "Hugo has a three-year-old daughter and wants a free morning activity they can attend without booking. She loves puppets and songs, and he does not mind a noisy, lively room.",
      "correctOptionKey": "b"
    },
    {
      "text": "Elena is studying for her final exams and needs a quiet place to work late in the evening. She wants to reserve a desk, keep her phone off, and have revision guides close by.",
      "correctOptionKey": "f"
    },
    {
      "text": "Marco is fourteen and wants a challenge for the school holidays that earns prizes. He enjoys using apps, reads quickly, and would like clear weekly goals with something to celebrate at the end.",
      "correctOptionKey": "g"
    },
    {
      "text": "Ivy wants to learn how to repair damaged library books as a weekend hobby. She is a complete beginner, would like small class sizes, and wants to use tools supplied by the library.",
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
    "title": "The Students' Library Plan Grows",
    "paragraphs": [
      { "segments": [
        { "type": "text", "value": "Sixth-form students noticed the school library was almost empty after lessons, although many pupils stayed late for clubs. They surveyed two hundred students and found most would use it if it stayed open. The head teacher agreed to a one-month trial if they organised the timetable." },
        { "type": "gap", "questionNumber": 16 },
        { "type": "text", "value": "They posted the plan on the library noticeboard and asked users to comment after the first week." }
      ] },
      { "segments": [
        { "type": "text", "value": "The trial began in January, with the library open until six on three evenings. Two students volunteered each evening to unlock the door and switch on the lights. A furniture shop donated four beanbag chairs and a small shelf for graphic novels." },
        { "type": "gap", "questionNumber": 17 },
        { "type": "text", "value": "A parent then donated a second-hand lamp, making the new reading corner feel warmer." }
      ] },
      { "segments": [
        { "type": "text", "value": "Within a fortnight, attendance grew from eight students to thirty-five, and the beanbags were always taken first. The team introduced a quiet zone near the windows and a discussion area by the door. The chess club could finally stop working on the floor." },
        { "type": "gap", "questionNumber": 18 },
        { "type": "text", "value": "The club moved into the discussion area, while readers beside the windows could continue without interruption." }
      ] },
      { "segments": [
        { "type": "text", "value": "The main difficulty came when two students argued over a laptop borrowed from the IT department. The team realised they needed rules for shared equipment, so they wrote an agreement and asked every user to sign it. The IT teacher offered two more laptops if everyone followed it." },
        { "type": "gap", "questionNumber": 19 },
        { "type": "text", "value": "No further disagreements about equipment were reported during the remainder of the trial." }
      ] },
      { "segments": [
        { "type": "text", "value": "After the trial, the head teacher made the evening opening permanent because attendance exceeded expectations. The team planned the next term and invited younger pupils to suggest books. Parents said their children now chose the library over the corridor." },
        { "type": "gap", "questionNumber": 20 },
        { "type": "text", "value": "The library assistant said she had not seen the room so full in twelve years. Younger students soon joined the evening teams, proving that the project could continue after its original organisers had left school." }
      ] }
    ],
    "options": [
      { "key": "option-0", "text": "The students drew up a rota and printed colour-coded cards for each evening team.", "correctForGap": 16 },
      { "key": "option-1", "text": "The beanbag chairs became so popular that students arrived early just to claim one.", "correctForGap": 17 },
      { "key": "option-2", "text": "The zoning meant that both quiet readers and group workers could use the space comfortably.", "correctForGap": 18 },
      { "key": "option-3", "text": "The agreement ended the arguments, and the extra laptops made research much easier.", "correctForGap": 19 },
      { "key": "option-4", "text": "The head teacher said the students had proved that trust and responsibility could change a school habit.", "correctForGap": 20 },
      { "key": "option-5", "text": "The school decided to close the library during lunch to save on heating costs.", "correctForGap": null },
      { "key": "option-6", "text": "A group of parents complained that the library stayed open too late in the evening.", "correctForGap": null },
      { "key": "option-7", "text": "The IT department refused to lend any equipment because of insurance rules.", "correctForGap": null }
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
