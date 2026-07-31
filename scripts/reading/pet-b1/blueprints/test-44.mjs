/**
 * PET B1 Reading Test 44 — canonical blueprint
 * Domain: street murals
 */
export default {
  testNumber: 44,
  id: 'catalog-reading-pet-b1-test44',
  title: 'PET B1 Reading Test 44',
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
      "title": "Street murals notice",
      "text": "The street murals team needs helpers on Saturday. Bring gloves and arrive before nine.",
      "explanation": "The text says: The street murals team needs helpers on Saturday. Bring gloves and arrive before nine.",
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
      "text": "I have booked the public walls session for Tuesday, but I may arrive late. Please start without me and save a place.",
      "explanation": "The text says: I have booked the public walls session for Tuesday, but I may arrive late. Please start without me and save a place.",
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
      "text": "Visitors to the street murals may use the tools, but they must return them before leaving.",
      "explanation": "The text says: Visitors to the street murals may use the tools, but they must return them before leaving.",
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
      "text": "The artists meeting has moved from Room 2 to Room 4 because the first room is being painted.",
      "explanation": "The text says: The artists meeting has moved from Room 2 to Room 4 because the first room is being painted.",
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
      "text": "Members can borrow one public walls guide for a week. Ask at the desk if you need another copy.",
      "explanation": "The text says: Members can borrow one public walls guide for a week. Ask at the desk if you need another copy.",
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
  "domain": "street murals",
  "options": [
    {
      "key": "a",
      "title": "Beginner spray-paint taster wall",
      "description": "A supervised two-hour session where newcomers spray simple shapes onto practice boards before trying a shared community wall. Overspray masks and paint are supplied, the teacher works with six people at most, and no artistic background is expected. Sessions run on Saturday afternoons and finish with everyone's piece photographed for the wall's digital gallery.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-a"
    },
    {
      "key": "b",
      "title": "Community design jam",
      "description": "A full-day gathering where residents brainstorm and sketch designs for a blank city-centre wall. Artists guide the drawing tables, colour proposals are voted on together, and the winning idea is painted the following week by the whole group. Lunch is shared, materials arrive free, and no one needs to bring anything except ideas.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-b"
    },
    {
      "key": "c",
      "title": "Murals for schoolyards",
      "description": "Teams paint cheerful murals on primary-school walls during weekday mornings while children are in class. Volunteers work in small crews with a lead artist, all brushes and ladders are provided, and the finished scenes decorate playgrounds across the district. No painting skill is needed, but volunteers must be comfortable on low ladders.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-c"
    },
    {
      "key": "d",
      "title": "Portrait mural workshop",
      "description": "A technical workshop focused on painting human faces at large scale. Students draw from photographs, practise mixing skin tones and study proportion under an experienced muralist. The course spans three weekend mornings and requires basic drawing ability. Canvas and paint are included, and each student completes a small practice head by the final session.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-d"
    },
    {
      "key": "e",
      "title": "Recycled paint drive and mix",
      "description": "Volunteers collect leftover household paint, sort it by colour and mix usable batches for community murals. Shifts run at a warehouse on weekend mornings, aprons are provided, and no artistic skill is needed because the task is about care and organisation. Households can also drop off half-full tins, which keeps thousands of litres out of landfill.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-e"
    },
    {
      "key": "f",
      "title": "Night-time wall lighting tour",
      "description": "An evening walking tour that visits the district's murals after dark, when spotlights reveal details lost in daylight. A guide explains each artist's style and the stories behind the walls. The route is flat, lasts about ninety minutes and ends at a café. Comfortable shoes are enough, and bookings cover a small number to keep groups friendly.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-f"
    },
    {
      "key": "g",
      "title": "Legal wall directory project",
      "description": "A research team walks the streets recording every approved mural wall, checking addresses, taking photos and updating the public map online. Shifts are flexible and can be done alone or in pairs, with a simple app provided for the records. No painting is involved, but volunteers should enjoy walking distances and using a phone.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-g"
    },
    {
      "key": "h",
      "title": "Mural restoration with historians",
      "description": "A weekend project that carefully cleans and repaints faded murals from the 1990s. Local historians supply photographs and explain the original colours, while conservators show volunteers safe techniques. Work stops in rain, so dates may shift to dry weekends. Open to beginners, though patience and steady hands matter more than speed.",
      "constraints": [],
      "openingStyle": "other",
      "imageSlotKey": "option-h"
    }
  ],
  "profiles": [
    {
      "text": "Jonas has never held a spray can and wants a safe first try with close supervision. He is free on Saturday afternoons, owns no equipment and would rather not commit to a long course.",
      "correctOptionKey": "a"
    },
    {
      "text": "Zara works every day until six and only wants to look at finished murals rather than paint them. She loves stories about local art and hopes to meet other residents during a relaxed evening.",
      "correctOptionKey": "f"
    },
    {
      "text": "Ethan is a retired teacher who wants to brighten primary school playgrounds. He is free on weekday mornings, likes working in small teams and does not mind low ladders if all the equipment is provided.",
      "correctOptionKey": "c"
    },
    {
      "text": "Yasmin has several half-empty paint tins in her garage and wants to keep them out of landfill. She is free on weekend mornings, prefers practical sorting to painting and wants a role that needs no art skill.",
      "correctOptionKey": "e"
    },
    {
      "text": "Tom is fascinated by the history of local murals and wants to help preserve old ones. He can volunteer on weekends, likes learning from experts and accepts that outdoor work depends on dry weather.",
      "correctOptionKey": "h"
    }
  ]
},

  part3: {
  "title": "A Wall of Neighbourhood Stories",
  "paragraphs": [
    "A small group of neighbours decided that the long grey wall beside the old bakery should carry the street's story, and they asked the council for permission to paint it. The council agreed to a mural but insisted that the design be approved by the people living nearby, so no single artist could choose the pictures alone. The group printed a simple notice inviting everyone to a design workshop in the community hall on the following Wednesday evening.",
    "At the workshop, residents shared memories of the bakery's early mornings and of the playground that once stood across the road. The artists sketched these stories as residents talked, and the group chose the strongest ideas to form a single design. A retired printer offered an old photograph of the original shop sign, which the design copied exactly. The final drawing was pinned up in the bakery window for a week, and after small changes, nearly every neighbour who passed added a signature in support.",
    "Painting was planned for a quiet weekend, when few cars used the narrow street. The wall first needed a thorough cleaning, because years of exhaust smoke had left the bricks stained, and the group spent Saturday morning scrubbing the surface until the paint would stick. Heavy rain on Sunday morning threatened to stop the work, so the group covered the fresh colours with plastic sheeting and waited for the sky to clear.",
    "The group held a celebration beside the finished mural, with music and bread from the bakery that appeared in the painting. Children added their own small pictures on the pavement, and the oldest residents cut the ribbon. Several visitors said the wall made the street feel friendlier, and the council offered the group a second wall on the next corner, provided the same residents approved the design."
  ],
  "buildExtension": " As the afternoon dried the wall, the painters returned to their ladders, and by Sunday evening the last flower was finished and the whole design could be seen from the road.",
  "questions": [
    { "stem": "What is the main purpose of the mural project?", "options": ["To brighten the bakery wall while telling the street's story.", "To win a competition for local painters.", "To cover the bakery's old sign completely.", "To persuade the council to close the road."], "correctIndex": 0 },
    { "stem": "What did the council require before allowing the painting?", "options": ["That the group hire professional artists.", "That residents approve the design.", "That the bakery pay for the paint.", "That the work finish in a single day."], "correctIndex": 1 },
    { "stem": "Why did the group paint during a quiet weekend?", "options": ["Because the bakery was closed for repairs.", "Because the design was not ready until then.", "Because few cars used the street at that time.", "Because the council had banned weekend traffic."], "correctIndex": 2 },
    { "stem": "What do the residents' signatures on the design suggest?", "options": ["They wanted the wall to stay plain grey.", "They strongly supported the chosen design.", "They preferred a design by a famous artist.", "They were too busy to attend the workshop."], "correctIndex": 1 },
    { "stem": "How does the writer feel about the finished mural?", "options": ["Disappointed that the colours faded quickly.", "Doubtful that visitors would ever notice it.", "Pleased that the whole street helped to create it.", "Unsure whether the design was approved."], "correctIndex": 2 }
  ]
},

  part4: {
  "title": "From Permission to the Finished Wall",
  "layoutParagraphs": [
    "The mural design won the support of the residents, but the council needed to see the plan before any paint touched the wall. The group delivered the drawings together with the signed list of neighbours who had approved them. (16) .....",
    "Saturday was chosen for the cleaning because the street was almost empty. Volunteers scrubbed the stained bricks with soap and water, and a ladder crew checked the top of the wall for loose paint. (17) .....",
    "The group had hoped to finish the whole scene over the weekend, but Sunday brought heavy rain that would damage fresh paint. With ladders already in place, they had to decide quickly. (18) .....",
    "When the mural was finally complete, the group organised a celebration outside the bakery. The invitation asked everyone to bring a memory of the street, and the baker promised free bread for the evening. (19) .....",
    "A year later, the mural still looked fresh, and passers-by often stopped to read the painted stories. Tourists taking photographs made the corner feel important, and the bakery stayed busy all day. (20) ....."
  ],
  "layoutExtensions": [
    "The meeting raised only one small question, about the exact size of the bakery sign.",
    "The outline and the blue sky took most of the morning.",
    "The rain lasted until late afternoon, and the plastic sheeting stayed in place overnight.",
    "Children drew with chalk on the pavement, and a local band played near the door.",
    "The council noticed the change and asked the group to plan a second mural across the road."
  ],
  "layoutClosers": [
    "The council agreed and sent the signed permission that Monday.",
    "By four o'clock the main colours were on the wall, and the scene took shape.",
    "The delay meant the last section was finished the following weekend, when the paint could dry slowly in the sun.",
    "So many people came that the street stayed lively until the lamps came on.",
    "This time residents were invited to the workshop first, and the careful steps of approval and painting began again."
  ],
  "options": [
    { "key": "option-0", "text": "They took the signed plan to the meeting, where the council had promised a quick answer.", "correctForGap": 16 },
    { "key": "option-1", "text": "Once the surface was dry, the painters marked out the design in light pencil.", "correctForGap": 17 },
    { "key": "option-2", "text": "Instead of risking the colours, the painters covered the wall and packed up their brushes early.", "correctForGap": 18 },
    { "key": "option-3", "text": "As a result of the party, neighbours who had only waved from their windows finally met.", "correctForGap": 19 },
    { "key": "option-4", "text": "The bakery owner said customers lingered longer by the wall, and bread sales rose as a result.", "correctForGap": 20 },
    { "key": "option-5", "text": "The council refused to allow any painting on public walls.", "correctForGap": null },
    { "key": "option-6", "text": "The group painted the wall before the residents had seen the design.", "correctForGap": null },
    { "key": "option-7", "text": "Fewer than five neighbours signed the list of support.", "correctForGap": null }
  ],
  "displayOrder": [
    3,
    0,
    5,
    1,
    6,
    2,
    7,
    4
  ]
},

  part5: {
  "title": "One Quiet Sunday at the Bakery Wall",
  "text": "Residents chose the bakery wall for their first mural, and everyone agreed the design should tell the story of the street. In the workshops, older neighbours described how the bakery had once been the busiest corner in town, and their memories shaped the final drawing. The group applied for council permission, which arrived after the design had been approved locally. Painting was fixed for a quiet Sunday so traffic would not disturb the work. As the first coats went on, the weather stayed clear, and the team took advantage of the dry morning. By late afternoon the wall was covered in colour, and the whole street looked different. The celebration a week later drew residents who had helped at every stage, and the group announced a second mural across the road. Nobody had expected the project to bring together so many people, and the wall soon became a popular place for photographs. Within a year, the wall was such a success that the council asked the group to design two more murals.",
  "extra": " A local newspaper wrote about the finished wall, and visitors began stopping on their way to the market. The group keeps a list of residents willing to help with the next design.",
  "specs": [
    { "phrase": "shaped", "languageTarget": "verb choice", "options": ["covered", "shaped", "removed", "divided"], "correctIndex": 1 },
    { "phrase": "took", "languageTarget": "collocation", "options": ["made", "gave", "took", "kept"], "correctIndex": 2 },
    { "phrase": "different", "languageTarget": "adjective/adverb", "options": ["similar", "empty", "painted", "different"], "correctIndex": 3 },
    { "phrase": "across", "languageTarget": "preposition", "options": ["across", "along", "under", "around"], "correctIndex": 0 },
    { "phrase": "bring", "languageTarget": "phrasal verb", "options": ["call", "bring", "set", "run"], "correctIndex": 1 },
    { "phrase": "such", "languageTarget": "fixed expression", "options": ["too", "very", "such", "quite"], "correctIndex": 2 }
  ]
},

  part6: {
  "title": "Choosing Paint That Lasts",
  "text": "The mural group wanted the finished wall to keep its colours for many years, so (27) ........ chose the paint with great care. Every shade was tested in daylight, because a colour that looked perfect inside could seem dull in (28) ........ open air. On the morning of the painting, the sky stayed clear, and the group started the day (29) ........ the pale blue section, just above the old sign, saving the darkest colours for the afternoon. By midday the colours were already matching the sketches, (30) ........ delighted the residents watching from the pavement. Even the baker's daughter, who had watched every stage, clapped when the last letter of the sign appeared. Nobody wanted to stop for lunch, yet the paint clearly needed time (31) ........ dry between coats. The finished scene showed the bakery exactly as the oldest residents remembered it, and the wall (32) ........ soon become the street's regular meeting point.",
  "extra": " The finished mural was photographed for the local news, and the photograph hung in the bakery window. A small plaque was added to name the residents who had helped.",
  "tail": " The wall now belongs to the whole street, and the next design is already being sketched.",
  "answers": [
    "they",
    "the",
    "with",
    "which",
    "to",
    "had"
  ],
  "targets": [
    "pronoun",
    "article",
    "preposition",
    "relative-word",
    "fixed-grammatical-expression",
    "auxiliary"
  ]
},
}
