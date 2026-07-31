/**
 * PET B1 Reading Test 43 — canonical blueprint
 * Domain: wildlife walks
 */
export default {
  testNumber: 43,
  id: 'catalog-reading-pet-b1-test43',
  title: 'PET B1 Reading Test 43',
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
      "title": "Wildlife walks notice",
      "text": "The wildlife walks team needs helpers on Saturday. Bring gloves and arrive before nine.",
      "explanation": "The text says: The wildlife walks team needs helpers on Saturday. Bring gloves and arrive before nine.",
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
      "text": "I have booked the woodland trails session for Tuesday, but I may arrive late. Please start without me and save a place.",
      "explanation": "The text says: I have booked the woodland trails session for Tuesday, but I may arrive late. Please start without me and save a place.",
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
      "text": "Visitors to the wildlife walks may use the tools, but they must return them before leaving.",
      "explanation": "The text says: Visitors to the wildlife walks may use the tools, but they must return them before leaving.",
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
      "text": "The young naturalists meeting has moved from Room 2 to Room 4 because the first room is being painted.",
      "explanation": "The text says: The young naturalists meeting has moved from Room 2 to Room 4 because the first room is being painted.",
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
      "text": "Members can borrow one woodland trails guide for a week. Ask at the desk if you need another copy.",
      "explanation": "The text says: Members can borrow one woodland trails guide for a week. Ask at the desk if you need another copy.",
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
  "domain": "wildlife walks",
  "options": [
    {
      "key": "a",
      "title": "Dawn bird-spotting at the reservoir",
      "description": "Guided birdwatching walks begin before sunrise at the town reservoir. A volunteer identifies species by call, and participants record sightings on shared sheets. The walk finishes by nine, so early risers can still reach work on time, and well-fitting boots are recommended. Entry is free, but places are limited to keep the group quiet and the birds undisturbed.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-a"
    },
    {
      "key": "b",
      "title": "Mammal tracking with a ranger",
      "description": "A ranger-led afternoon walk where participants learn to recognise footprints, scratch marks and resting places of deer and foxes. The trail is muddy in places, lasts about two hours and welcomes complete beginners who want practical field skills. Small groups keep the experience personal, and the meeting point is reachable by the midday bus.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-b"
    },
    {
      "key": "c",
      "title": "Sensory night walk for beginners",
      "description": "A slow evening walk that explores the woods through sound, smell and touch. Torches are discouraged, the pace is gentle and a leader keeps the group together. It suits nervous newcomers who want to meet night animals safely. Warm layers help, and the route stays close to the car park so anyone can leave early.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-c"
    },
    {
      "key": "d",
      "title": "Wildflower identification ramble",
      "description": "A relaxed Sunday walk across the open meadow, naming common wildflowers and their uses. A botanist answers questions and hands out simple identification cards. The ground is firm, so the route suits comfortable walking shoes rather than heavy boots. It finishes at a village café, where participants can compare notes over lunch.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-d"
    },
    {
      "key": "e",
      "title": "Photography hide session",
      "description": "Book a fixed hide above a busy feeding area and photograph birds and small mammals through a viewing window. Cameras are not supplied, so bring your own, and sessions last three hours in complete silence with only your lens for company. Booking ahead is essential because the hide has only eight seats.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-e"
    },
    {
      "key": "f",
      "title": "Family pond dipping morning",
      "description": "Children and adults explore pond life together with nets, trays and identification charts, all provided. A warden supervises the water's edge, so parents can relax while youngsters scoop up insects and frogspawn. Sessions end before lunch. Wellies are essential, and each family group is given a clean tray to inspect their finds.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-f"
    },
    {
      "key": "g",
      "title": "Long-distance trail with overnight camping",
      "description": "A demanding two-day trek across open moorland, camping overnight at a bothy. Participants carry their own food, water and camping gear, read the route themselves and must be fit enough for steep climbs in changeable weather. The group is limited to twelve and starts from a remote car park reached by early bus.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-g"
    },
    {
      "key": "h",
      "title": "Accessible guided stroll with wheels",
      "description": "A flat one-hour stroll on smooth paths where wheelchairs and buggies move easily. A guide points out wildlife along the route and stops at benches for resting and questions. It is fully free, but booking is needed for the accessible minibus. The route loops back to the visitor centre, so there is no need for a return lift.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-h"
    }
  ],
  "profiles": [
    {
      "text": "Chloe is keen to see bats and moths but is nervous about walking in the dark. She wants a guided evening stroll, close to a car park, with no need to manage a torch while she looks around.",
      "correctOptionKey": "c"
    },
    {
      "text": "Felix uses a wheelchair and wants to watch wildlife from a smooth path that loops back to the centre. He prefers a short guided outing and needs to book the accessible minibus to reach the start.",
      "correctOptionKey": "h"
    },
    {
      "text": "Nina works from nine and is free only before that. She wants to learn bird calls, hopes to see several species and needs a cheap outing near town that finishes in good time for her shift.",
      "correctOptionKey": "a"
    },
    {
      "text": "Marcus has two young daughters who love catching insects. He wants a supervised morning activity where nets and trays are supplied, and he needs to leave by midday for another commitment.",
      "correctOptionKey": "f"
    },
    {
      "text": "Lena is an experienced hiker with camping gear and a strong map-reading habit. She wants a demanding multi-day route with overnight stops and is happy to start from a remote car park early.",
      "correctOptionKey": "g"
    }
  ]
},

  part3: {
    "title": "A club that counted the woods",
    "paragraphs": [
      "Every Saturday before sunrise, the young naturalists' club gathered at the edge of the woods with binoculars and clipboards. The group had started the previous year with only eight members, and their first wildlife walks produced little more than a list of common birds. A local ranger called Mrs Hale agreed to help them, and she showed them how to record each species quietly and accurately. From then on, the club treated every walk as a survey rather than a simple outing.",
      "Keeping silent on the trail proved harder than the members expected. Laughing and talking scattered the birds before anyone had lifted a pair of binoculars, so the ranger taught the group to stop and wait at every corner. Slowly the club discovered that the quietest mornings produced the longest species lists. After each walk they emptied their notebooks onto a large tally chart pinned inside the village hall.",
      "One autumn, heavy rain flooded the path beside the stream, and the club had to plan a detour through a younger plantation. The new route seemed dull at first, but the members soon noticed signs of activity that their usual trail had hidden. Damp mud near the plantation edge revealed fresh badger tracks, and a pile of chewed cones showed where a squirrel had been feeding.",
      "By spring, the tally chart listed more than forty species, and the local council asked the club to share its results. Mrs Hale helped the members turn their notes into a simple map of the woodland so that visitors could find the best viewing spots. The club had begun by hoping to learn the names of birds; it ended by teaching the whole village what the woods contained."
    ],
    "buildExtension": " The detour became a regular stop on later walks, because the members realised that flooded ground often forces wildlife into new places. Recording the badger tracks gave the tally chart its first mammal entries and taught the group that an obstacle can sometimes be a discovery.",
    "questions": [
      {
        "stem": "What is the main point of the text?",
        "options": [
          "The club learned more by treating its walks as careful surveys.",
          "Wildlife walks are only possible in summer.",
          "Young people should never enter the woods alone.",
          "Binoculars are the only equipment a survey needs."
        ],
        "correctIndex": 0
      },
      {
        "stem": "Why did the club start seeing more species after Mrs Hale joined?",
        "options": [
          "The members began visiting the woods later in the day.",
          "They recorded every walk and kept the group quiet.",
          "They stopped using the tally chart.",
          "They invited the whole village on each walk."
        ],
        "correctIndex": 1
      },
      {
        "stem": "What surprised the members about the flooded detour?",
        "options": [
          "It was too muddy for any animal to use.",
          "It was much longer than the path beside the stream.",
          "It was full of signs that their usual trail had missed.",
          "It forced the club to cancel the morning survey."
        ],
        "correctIndex": 2
      },
      {
        "stem": "What does the writer suggest about Mrs Hale's role?",
        "options": [
          "She stopped the members from making their own decisions.",
          "She preferred to count species on her own.",
          "She had little interest in young beginners.",
          "She gave the club the practical skills it needed."
        ],
        "correctIndex": 3
      },
      {
        "stem": "What was the result of the club's work?",
        "options": [
          "The woods were closed to walkers for a year.",
          "The village learned more about its woodland wildlife.",
          "The tally chart was removed from the village hall.",
          "The club stopped meeting on Saturday mornings."
        ],
        "correctIndex": 1
      }
    ]
  },

  part4: {
    "title": "Quiet walks and a flooded detour",
    "layoutParagraphs": [
      "The club set out on a Saturday morning to count birds, expecting the same short list as before. Halfway along the trail, one member froze and pointed at a low branch where an owl sat watching them. (16) .....",
      "The club's most useful skill was also its hardest to practise: staying silent. On one walk, three members chatted at the gate, and every bird in the nearest trees disappeared before the group could raise their binoculars. (17) .....",
      "When heavy rain flooded the path beside the stream, the ranger suggested a detour through a plantation. Several members complained that the detour would be dull, because they could not imagine much living among the new trees. (18) .....",
      "The club now kept two sets of notes, one for each trail. Comparing the lists taught the members more than either route could on its own, because some species avoided open water. (19) .....",
      "By the end of spring, the tally chart listed fifty-two species, and the club posted its results in the village hall. Several visitors asked where the strange tracks had come from, and the members explained the detour story. (20) ....."
    ],
    "layoutExtensions": [
      "They spent the next hour watching the owl, and the tally sheet slowly filled with new names.",
      "The ranger made the group walk the first fifty metres again in silence, and it took three attempts before the birds returned.",
      "Animal footprints marked the damp ground, and split cones near the path showed where a squirrel had fed.",
      "The ranger turned the extra records into a map, marking where each find had been made. Visitors could then look for the badger prints themselves.",
      "The members prepared a talk about staying quiet, the flooded trail and the badger map, rehearsing it twice before the meeting."
    ],
    "layoutClosers": [
      "Nobody minded the delay; the sighting proved what quiet could reveal.",
      "From then on, members left their conversations at the car park.",
      "From that day, the group stopped at the detour on every walk.",
      "What began as a detour had become the club's richest survey ground.",
      "By the end of the evening, the whole village had learned how much the woods contained."
    ],
    "options": [
      {
        "key": "option-0",
        "text": "It was a tawny owl, the first the club had ever recorded on the survey.",
        "correctForGap": 16
      },
      {
        "key": "option-1",
        "text": "Because the noise had reached the trees first, the day's survey had to restart from the silent gate.",
        "correctForGap": 17
      },
      {
        "key": "option-2",
        "text": "The bare ground looked empty, yet the mud beside the path told a livelier story.",
        "correctForGap": 18
      },
      {
        "key": "option-3",
        "text": "The tally chart filled with badger records and squirrel signs that never appeared on the stream pages.",
        "correctForGap": 19
      },
      {
        "key": "option-4",
        "text": "As a result, the local council invited the club to present its findings at the summer meeting.",
        "correctForGap": 20
      },
      {
        "key": "option-5",
        "text": "A visiting school group borrowed the binoculars for the whole week.",
        "correctForGap": null
      },
      {
        "key": "option-6",
        "text": "The owl flew away before anyone could write down its name.",
        "correctForGap": null
      },
      {
        "key": "option-7",
        "text": "Every member agreed to walk the old trail even in heavy rain.",
        "correctForGap": null
      }
    ],
    "displayOrder": [4, 1, 6, 0, 3, 7, 2, 5]
  },

  part5: {
    "title": "Numbers from the woodland walks",
    "text": "The young naturalists' club ran a survey of the woodland every Saturday, and each member wrote their findings in a small notebook before the walk home. Counting had become a habit they enjoyed rather than a duty they completed, and several members even walked the woods again on weekday evenings. The group soon learned that a survey only works when people stay quiet and move slowly, because noisy walkers send the best birds away long before anyone raises binoculars. One morning, heavy rain flooded the path beside the stream, so the club chose a detour through the young plantation instead of turning back. To everyone's surprise, the detour revealed far more than the usual trail, and the ranger helped the members identify the fresh tracks and chewed cones they found there. At the end of the season, the tally chart listed fifty-two species, a total that doubled the club's first-year count and impressed the village council enough to request a second year of walks.",
    "extra": " The ranger asked the club to present its results at the autumn meeting, where families could study the tally chart. Visitors were surprised that a few quiet hours each week had taught the village so much about its own woods.",
    "specs": [
      {
        "phrase": "survey",
        "languageTarget": "collocation",
        "options": ["search", "project", "meeting", "survey"],
        "correctIndex": 3
      },
      {
        "phrase": "slowly",
        "languageTarget": "adjective/adverb",
        "options": ["quickly", "slowly", "loudly", "carelessly"],
        "correctIndex": 1
      },
      {
        "phrase": "through",
        "languageTarget": "preposition",
        "options": ["across", "over", "around", "through"],
        "correctIndex": 3
      },
      {
        "phrase": "chewed",
        "languageTarget": "collocation",
        "options": ["broken", "empty", "chewed", "fallen"],
        "correctIndex": 2
      },
      {
        "phrase": "doubled",
        "languageTarget": "verb choice",
        "options": ["estimated", "reduced", "repeated", "doubled"],
        "correctIndex": 3
      },
      {
        "phrase": "impressed",
        "languageTarget": "verb choice",
        "options": ["annoyed", "impressed", "worried", "bored"],
        "correctIndex": 1
      }
    ]
  },

  part6: {
    "title": "The ranger's winter diary",
    "text": "The young naturalists' club planned its autumn walks at a meeting in the village hall, and every member was asked to bring (27) ........ own binoculars and notebook. The ranger explained that the group would visit the woodland before sunrise, when the birds sang loudly, few people walked the trails and the light was soft enough for spotting. Counting the species needed patience, (28) ........ the members soon discovered that a quiet hour produced a longer list than a busy afternoon. The tally chart grew quickly, (29) ........ meant the club had recorded more than forty kinds of bird by November. Nobody wanted the surveys to stop, (30) ........ they decided to hold one extra walk each month through the winter. The final count of the year surprised (31) ........ member of the council, and the council promised (32) ........ support the club for another year.",
    "extra": " The ranger kept a diary of each walk, noting the best spots so the club could revisit them. One page recorded the flooded path and the winter detour.",
    "tail": " The diary became the club's most useful record, showing that even a flooded trail could teach members something new.",
    "answers": ["their", "but", "which", "so", "every", "to"],
    "targets": ["pronoun", "conjunction", "relative word", "linking word", "quantifier", "preposition"]
  },
}
