/**
 * PET B1 Reading Test 42 — canonical blueprint
 * Domain: school libraries and reading spaces
 */
export default {
  testNumber: 42,
  id: 'catalog-reading-pet-b1-test42',
  title: 'PET B1 Reading Test 42',
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
  "domain": "school libraries and reading spaces",
  "options": [
    {
      "key": "a",
      "title": "Buddy reading scheme for new readers",
      "description": "Older pupils read aloud once a week with younger children who are just starting to read. The free sessions take place straight after school in the library, and every child is matched with one regular reading buddy, so even shy learners feel comfortable and quickly gain confidence with short picture books.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-a"
    },
    {
      "key": "b",
      "title": "Book mending and repair workshop",
      "description": "A hands-on workshop where volunteers repair damaged books using glue, tape and cloth. Tools and materials are supplied, small groups work at tables on Saturday mornings, and a librarian demonstrates simple mending methods that anyone can learn quickly. There is no cost and no need to bring anything, though volunteers should have patience for fiddly tasks.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-b"
    },
    {
      "key": "c",
      "title": "Story corner volunteer mornings",
      "description": "Volunteers run cheerful picture-book sessions for young children every Saturday in the library's story corner. You read aloud, lead a simple song and help with a craft activity. No experience is needed, and the librarian stays to supervise the whole session. Families arrive at ten, so the morning finishes by lunchtime, which suits volunteers who cannot commit to weekday duties.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-c"
    },
    {
      "key": "d",
      "title": "Exam revision with practice tests",
      "description": "A structured revision programme for students facing school exams. Each weekday evening, participants complete timed practice papers under exam conditions, then receive their scores and personal feedback from a teacher. Places are low-cost and include printed answer guides. The course runs for six weeks before the main test season, so it suits pupils who want steady preparation rather than a one-off workshop.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-d"
    },
    {
      "key": "e",
      "title": "Reading challenge with prizes",
      "description": "A term-long reading challenge open to every pupil. Participants follow themed book lists, record what they finish and earn badges and small prizes at regular checkpoints. The challenge is self-paced, so busy students can read when it suits them. Teachers post new recommendations each month, and the final celebration in June recognises every reader who reaches the target.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-e"
    },
    {
      "key": "f",
      "title": "Library card outreach at school gates",
      "description": "Volunteers meet families at the school gates for twenty minutes after the afternoon bell, helping parents register for library cards and handing out starter packs. The stand runs every weekday, no training is required, and everything needed is provided each day. It suits people who can spare a short regular slot but cannot join indoor sessions.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-f"
    },
    {
      "key": "g",
      "title": "Library stories podcast",
      "description": "A small weekly group records short interviews about favourite books and library memories. Microphones and editing software are supplied, members meet after class in the library, and episodes appear on the school channel for the whole community to hear. No previous recording experience is expected, though participants should feel comfortable speaking into a microphone.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-g"
    },
    {
      "key": "h",
      "title": "Teen manga and comics collection",
      "description": "Monthly sessions where teenage readers choose, order and organise graphic novels for the library shelves. Members suggest new titles, vote on the next purchases and help display the books. A small budget is available for each month's selection. The group meets on the first Sunday of the month, so it fits readers with packed weekday timetables, and joining costs nothing.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-h"
    }
  ],
  "profiles": [
    {
      "text": "Hugo loves reading to his young niece and has Saturday mornings free. He wants to volunteer with small children in the library but has no training, and he prefers an indoor role.",
      "correctOptionKey": "c"
    },
    {
      "text": "Priya is starting to read English and gets nervous in big groups. She wants to practise aloud after school with a patient partner, and her family cannot pay any fees this term.",
      "correctOptionKey": "a"
    },
    {
      "text": "Omar faces his final exams soon and needs timed practice under real conditions. He is free on weekday evenings, wants clear scores and personal feedback, and can only afford a low-cost course.",
      "correctOptionKey": "d"
    },
    {
      "text": "Ines only reads comics and graphic novels, which she says the school never stocks. She can attend one monthly meeting, has no money to spend, and wants to help choose new titles.",
      "correctOptionKey": "h"
    },
    {
      "text": "Daniel collects his younger sister from school each weekday and wants library cards for the whole family. He is free by the gates for only a short time and needs a helper to finish the forms on the spot because his English is limited.",
      "correctOptionKey": "f"
    }
  ]
},

  part3: {
  "title": "Turning the Noisy Corner Around",
  "paragraphs": [
    "The reading corner at Millbrook School was the noisiest place in the library. It sat right beside the computer area, so every click and printer sound travelled straight across the room, and students gave up trying to read there. A small group of pupils decided to fix the problem, and the librarian agreed to let them try anything that did not cost much.",
    "The group started with a survey of favourite books, asking every class which titles they actually borrowed and which shelves they never touched. The answers surprised them: short story collections were the most popular, yet they sat on the lowest shelf where nobody noticed them. The pupils moved the stories to eye level and hid the heavy reference books behind the desk, and borrowing rose within days.",
    "The noise problem remained, because the computer area still sat next to the corner. Moving the machines was impossible, so the students built a low shelf barrier between the two spaces and hung a soft board on the wall to catch some of the sound. The librarian added a quiet corner rule, which said that nobody could talk above a whisper near the cushions.",
    "When the corner reopened, a reading club began meeting there twice a week, and pupils who had never borrowed a book started choosing titles from the eye-level shelves. The survey sheet stayed on the wall, and new questions were added each term so the space could keep changing with the school's tastes. For the group, the project proved that a small, well-planned change could turn a familiar room into a favourite one. The following year, three more corners opened in other rooms."
  ],
  "buildExtension": " The rule was hard to follow at first, and a few older students grumbled about it, but the younger readers soon reminded them with a finger to their lips. By the end of the month, the corner was quiet enough for homework, and the computer users found they could concentrate on their own screens as well.",
  "questions": [
    {
      "stem": "What is the passage mainly about?",
      "options": [
        "How students turned a noisy library corner into a calm reading space.",
        "Why the school decided to close the computer area.",
        "How the librarian punished students who talked loudly.",
        "Why the library stopped buying reference books."
      ],
      "correctIndex": 0
    },
    {
      "stem": "Why could nobody read in the corner at the start?",
      "options": [
        "The shelves were too tall to reach.",
        "Noise from the computer area made it difficult.",
        "The librarian had banned sitting there.",
        "There were no books in the corner."
      ],
      "correctIndex": 1
    },
    {
      "stem": "What did the survey of favourite books reveal?",
      "options": [
        "Most students preferred short story collections.",
        "The reference books were the most borrowed.",
        "Students wanted the computers moved.",
        "Nobody used the library at lunchtime."
      ],
      "correctIndex": 0
    },
    {
      "stem": "Why did the students build a low shelf barrier?",
      "options": [
        "To give the printer somewhere to rest.",
        "To hide the reference books from visitors.",
        "To block some of the sound from the computers.",
        "To stop younger pupils from entering the corner."
      ],
      "correctIndex": 2
    },
    {
      "stem": "How does the writer feel about the project at the end?",
      "options": [
        "Unsure whether it changed anything.",
        "Pleased that a small change made a big difference.",
        "Sorry that it cost the library too much.",
        "Annoyed that the librarian did not help."
      ],
      "correctIndex": 1
    }
  ]
},

  part4: {
  "title": "The Club That Filled the Library",
  "layoutParagraphs": [
    "The reading club wanted to fill the library during lunch breaks, when most students stayed outside in the playground. Members counted the empty chairs and agreed that the problem was the old rule book lying on every table. (16) .....",
    "The new plan needed a corner that stayed quiet, but the space beside the computer area was the loudest place in the library. Every time a printer started, readers lost their place and looked up from their books. (17) .....",
    "Halfway through the term, the club realised that the quiet corner had grown too popular. Every cushion was taken by lunchtime, and some students sat on the floor, which the librarian did not like. (18) .....",
    "The club kept a list of the books that never left the shelves, and the survey showed a surprise. Popular stories were hiding near the floor, while the reference sets sat at eye level where nobody looked. (19) .....",
    "By the end of the year, the library felt like a different place, and the librarian wanted to thank the club. The students decided that the best reward was more responsibility rather than prizes. (20) ....."
  ],
  "layoutExtensions": [
    "The change was cheap and took an hour.",
    "The first week went well, and the corner became noticeably quieter.",
    "The move took a single afternoon, and the window corner soon had its own cushions.",
    "Borrowing rose sharply the same week.",
    "The board became a favourite stop for parents collecting children."
  ],
  "layoutClosers": [
    "Within days, more pupils sat down to read, and the club planned the next step.",
    "Only one student refused at first, and the librarian spoke to him calmly about the rule.",
    "Students soon learned to whisper in both corners, and the librarian stopped worrying about the floor.",
    "A small rearrangement had done more for the library than a year of new posters.",
    "The experience taught the club that calm spaces and good books make a library people want to visit, and the members promised to keep the corner ready for new pupils."
  ],
  "options": [
    {
      "key": "option-0",
      "text": "They replaced the rule books with a colourful list of the week's events, which made the corner look open instead of strict.",
      "correctForGap": 16
    },
    {
      "key": "option-1",
      "text": "However, moving the computers was impossible, so the club asked the computer users to wear headphones instead.",
      "correctForGap": 17
    },
    {
      "key": "option-2",
      "text": "Rather than buying more cushions, the club decided to open a second reading corner near the window.",
      "correctForGap": 18
    },
    {
      "key": "option-3",
      "text": "Because of this, the club moved the popular titles up and stored the reference sets behind the desk.",
      "correctForGap": 19
    },
    {
      "key": "option-4",
      "text": "As a result, they were given charge of the monthly display board, which they ran entirely on their own.",
      "correctForGap": 20
    },
    {
      "key": "option-5",
      "text": "The librarian ordered a new carpet, but the delivery arrived late and the club had to wait.",
      "correctForGap": null
    },
    {
      "key": "option-6",
      "text": "Nobody in the club had ever visited a library before the project began.",
      "correctForGap": null
    },
    {
      "key": "option-7",
      "text": "The window was painted shut, so the corner stayed warm but dark all winter.",
      "correctForGap": null
    }
  ],
  "displayOrder": [
    3,
    0,
    5,
    1,
    6,
    4,
    2,
    7
  ]
},

  part5: {
  "title": "A Book Swap That Surprised Everyone",
  "text": "The school library held a book week every year, but the pupils had grown tired of the same displays. A small team decided to try a book swap instead, and they asked every class to bring one unwanted book from home. The team collected more than two hundred books in a week, which surprised even the librarian. They organised them by category on long tables, then printed simple cards with a one-line description of each title. On the opening morning, pupils queued at the door before the library even opened. Each visitor could take one book for every book they gave in, so nobody left empty-handed. The team was careful to make sure that every book found a new home, and at the end of the day only eleven titles remained on the tables. The librarian was so pleased that she promised to run the swap as well next year, and the team began planning a bigger hall.",
  "extra": " The books that were left over went to a charity that sends reading boxes to small schools. Several parents asked for a second swap in the spring, so the team kept their notes for the next event.",
  "specs": [
    {
      "phrase": "which",
      "languageTarget": "relative word",
      "options": [
        "what",
        "which",
        "that",
        "who"
      ],
      "correctIndex": 1
    },
    {
      "phrase": "by",
      "languageTarget": "preposition",
      "options": [
        "in",
        "on",
        "with",
        "by"
      ],
      "correctIndex": 3
    },
    {
      "phrase": "gave",
      "languageTarget": "phrasal verb",
      "options": [
        "stood",
        "gave",
        "looked",
        "worked"
      ],
      "correctIndex": 1
    },
    {
      "phrase": "make",
      "languageTarget": "collocation",
      "options": [
        "do",
        "take",
        "give",
        "make"
      ],
      "correctIndex": 3
    },
    {
      "phrase": "remained",
      "languageTarget": "verb choice",
      "options": [
        "disappeared",
        "returned",
        "remained",
        "arrived"
      ],
      "correctIndex": 2
    },
    {
      "phrase": "well",
      "languageTarget": "fixed expression",
      "options": [
        "good",
        "so",
        "much",
        "well"
      ],
      "correctIndex": 3
    }
  ]
},

  part6: {
  "title": "Cards That Quietly Changed the Library",
  "text": "The reading club grew quickly after the corner reopened, and soon the librarian needed a simpler way to manage the books that were coming back late every day. Before the cards arrived, the queue at the desk grew so long at lunchtime (27) ........ some pupils gave up and left. Every member received a small card (28) ........ their name and class were written. The cards made borrowing so much faster that the queue at the desk disappeared within (29) ........ week of the new system starting. Members could keep a book (30) ........ two weeks and wrote the return date on the card themselves. A quiet corner rule (31) ........ also printed on the back of each card as a reminder. The rule applied to (32) ........ the reading corner and the window seats, where the light was best and the chairs were softer.",
  "extra": " The cards worked so well that other teachers asked for the same system in their classrooms, and a small poster explained it beside the desk.",
  "tail": " The club now planned to introduce the cards to younger pupils, who were already asking when they could join.",
  "answers": [
    "that",
    "where",
    "a",
    "for",
    "was",
    "both"
  ],
  "targets": [
    "conjunction",
    "relative-word",
    "article",
    "preposition",
    "auxiliary",
    "quantifier"
  ]
},
}
