export default {
  "testNumber": 37,
  "id": "catalog-reading-pet-b1-test37",
  "title": "PET B1 Reading – Test 37",
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
  "topic": ["youth theatre", "short play", "parents arrive early", "evidence-based timing"],
  "metadata": {
    "title": "PET B1 Reading Test 37",
    "difficulty": "B1",
    "themes": {
      "part1": "youth theatre notices, auditions and performance updates",
      "part2": "performing arts and local stories",
      "part3": "a play that found its audience",
      "part4": "a performance reshaped by its first audience",
      "part5": "joining a drama group",
      "part6": "photography workshop announcement"
    }
  },
  "part1": {
    "cards": [
      {
        "key": "p1-1",
        "template": "notice",
        "title": "Rehearsal date change",
        "text": "Friday's rehearsal has moved to Thursday at four o'clock because the main hall is booked for a community meeting. Please bring your script and a black t-shirt. The costume cupboard will be open for ten minutes before the session.",
        "question": {
          "stem": "What should cast members do?",
          "options": [
            { "key": "a1", "text": "Come on Thursday with a script and a black t-shirt." },
            { "key": "a2", "text": "Attend the community meeting instead." },
            { "key": "a3", "text": "Wait until Friday for the rehearsal." }
          ],
          "correctOptionKey": "a1"
        }
      },
      {
        "key": "p1-2",
        "template": "email",
        "title": "Dress rehearsal email",
        "text": "Your daughter's dress rehearsal starts at five thirty in the main hall. Parents are welcome to watch from the back rows, but please wait in the café until the doors open at six. The performance begins at seven.",
        "question": {
          "stem": "What should parents do?",
          "options": [
            { "key": "b1", "text": "Enter the hall as soon as they arrive." },
            { "key": "b2", "text": "Wait in the café until the doors open." },
            { "key": "b3", "text": "Collect their daughter after seven." }
          ],
          "correctOptionKey": "b2"
        }
      },
      {
        "key": "p1-3",
        "template": "poster",
        "title": "Audition poster",
        "text": "Auditions for the spring play take place on Saturday from two o'clock. Prepare a one-minute speech about a hobby you love. No experience is needed, and young people aged twelve to sixteen are welcome. Bring a photo if you have one.",
        "question": {
          "stem": "What must auditionees do?",
          "options": [
            { "key": "c1", "text": "Take a signed permission letter." },
            { "key": "c2", "text": "Arrive after two in the afternoon." },
            { "key": "c3", "text": "Prepare a one-minute speech about a hobby." }
          ],
          "correctOptionKey": "c3"
        }
      },
      {
        "key": "p1-4",
        "template": "message",
        "title": "Backstage microphone message",
        "text": "The main microphone has stopped working, so the final scene will be performed without it. Speak loudly and face the audience so that everyone can hear you. The sound team will try to repair the microphone during the interval.",
        "question": {
          "stem": "What should the actors do?",
          "options": [
            { "key": "d1", "text": "Speak loudly and face the audience." },
            { "key": "d2", "text": "Wait for the microphone to be fixed first." },
            { "key": "d3", "text": "Whisper the lines backstage." }
          ],
          "correctOptionKey": "d1"
        }
      },
      {
        "key": "p1-5",
        "template": "update",
        "title": "Performance update",
        "text": "Tonight's performance is cancelled because of a power cut at the hall. Tickets remain valid for the new date next Friday, and refunds are available at the box office until the end of the month. The cast will keep their rehearsal time tomorrow.",
        "question": {
          "stem": "What can ticket holders do?",
          "options": [
            { "key": "e1", "text": "Perform in the street tonight." },
            { "key": "e2", "text": "Use their tickets on the new date next Friday." },
            { "key": "e3", "text": "Collect costumes from the box office." }
          ],
          "correctOptionKey": "e2"
        }
      }
    ]
  },
  "part2": {
    "domain": "performing arts and local stories",
    "options": [
      {
        "key": "option-a",
        "title": "Weekend rehearsal with a public showcase",
        "openingStyle": "schedule-led",
        "description": "Two full days of rehearsal in the town hall, ending with a short public showcase for family and friends. The director plans every scene in advance, teaches the young cast to move confidently on stage and provides simple costumes. It suits performers who can commit to both days and want a real performance by the end.",
        "constraints": ["full weekend", "public showcase", "costumes provided", "commitment"],
        "imageSlotKey": "option-a"
      },
      {
        "key": "option-b",
        "title": "Backstage and lighting taster session",
        "openingStyle": "skill-led",
        "description": "A hands-on evening exploring everything that happens behind the curtain. Participants learn to use the lighting board, move scenery quietly and cue the music, then watch a scene run from the control desk. It is ideal for anyone who prefers working backstage to being on stage and wants practical skills to use in future shows.",
        "constraints": ["backstage", "practical skills", "lighting and sound", "evening session"],
        "imageSlotKey": "option-b"
      },
      {
        "key": "option-c",
        "title": "Confidence and voice workshop",
        "openingStyle": "outcome-led",
        "description": "A single session focused on speaking clearly and calmly in front of others. Warm-ups, breathing exercises and short solo speeches build confidence quickly, and everyone receives friendly feedback at the end. The session suits quieter teenagers who want to feel more comfortable performing or speaking in public without committing to a full production.",
        "constraints": ["one day", "speaking practice", "feedback", "no full production"],
        "imageSlotKey": "option-c"
      },
      {
        "key": "option-d",
        "title": "Holiday improvisation club",
        "openingStyle": "activity-led",
        "description": "Three mornings of games and invented scenes where nothing is written down in advance. The group builds short stories together, tries different characters and discovers how to react quickly on stage. It is lively and informal, with no scripts to learn and no performance at the end, so pressure stays low.",
        "constraints": ["no scripts", "no final show", "holiday mornings", "invented scenes"],
        "imageSlotKey": "option-d"
      },
      {
        "key": "option-e",
        "title": "Playwriting lab for new ideas",
        "openingStyle": "process-led",
        "description": "A creative course where young writers develop a short scene of their own over three afternoons. They discuss plots, draft dialogue and watch actors perform their words aloud, then improve the scene using the feedback. It is best for people who enjoy storytelling and want to see their ideas come to life on stage.",
        "constraints": ["writing", "draft a scene", "actor feedback", "three afternoons"],
        "imageSlotKey": "option-e"
      },
      {
        "key": "option-f",
        "title": "Family storytelling afternoon in the park",
        "openingStyle": "audience-led",
        "description": "A relaxed outdoor afternoon where families watch local teenagers retell folk tales with simple props and costumes. The young performers practise the stories for one morning first, then present them twice, and a picnic follows the final showing. It suits beginners who want a gentle first taste of performing in front of a friendly audience.",
        "constraints": ["families", "outdoors", "beginner friendly", "one morning practice"],
        "imageSlotKey": "option-f"
      },
      {
        "key": "option-g",
        "title": "Weekly beginners drama club without a show",
        "openingStyle": "need-led",
        "description": "A friendly weekly club for complete beginners who want to explore acting without the pressure of a final performance. Members play games, practise short scenes and learn to work as a team, meeting every Tuesday after school. It is perfect for shy teenagers who want regular practice in a relaxed setting.",
        "constraints": ["weekly", "beginners", "no final show", "Tuesday after school"],
        "imageSlotKey": "option-g"
      },
      {
        "key": "option-h",
        "title": "Advanced scene study for experienced actors",
        "openingStyle": "condition-led",
        "description": "A demanding weekend for performers who already act regularly and want to strengthen their technique. Participants rehearse a full scene from a published play, work on character choices and perform for the group, receiving detailed notes from the director. Previous stage experience is required, and places are limited.",
        "constraints": ["experience required", "published play", "director feedback", "weekend"],
        "imageSlotKey": "option-h"
      }
    ],
    "profiles": [
      {
        "key": "profile-1",
        "text": "Nina loves inventing characters and hates memorising scripts. She wants a lively holiday activity with no written lines and no final show, and she is free on weekday mornings.",
        "correctOptionKey": "option-d"
      },
      {
        "key": "profile-2",
        "text": "Omar has acted in two school productions already. He wants demanding weekend work on real scenes with detailed feedback from a director, and he can travel to the town hall.",
        "correctOptionKey": "option-h"
      },
      {
        "key": "profile-3",
        "text": "Priya wants to take part in a real performance with costumes provided. She can give up a full weekend and hopes her parents can watch the final show.",
        "correctOptionKey": "option-a"
      },
      {
        "key": "profile-4",
        "text": "Leo feels nervous on stage but loves technology. He wants to learn practical backstage skills like lighting and sound cues for future productions.",
        "correctOptionKey": "option-b"
      },
      {
        "key": "profile-5",
        "text": "Sofia is very shy and has never acted. She wants a friendly weekly group with no pressure and no performance, on the same day each week after school.",
        "correctOptionKey": "option-g"
      }
    ]
  },
  "part3": {
    "title": "A play that found its audience",
    "paragraphs": [
      "Our youth theatre group prepared a short play for families and wanted the performance to feel fresh rather than rehearsed. The cast gathered suggestions after school, marked which props would be needed and noted which costumes could be borrowed from the drama cupboard. Because the budget was limited, the group decided to use simple lighting and music that a few members could control backstage. Each actor learned their lines and tested the timing of different scenes, so the whole production stayed in the hands of the young people rather than relying on adult helpers.",
      "A rehearsal became unexpectedly useful when some parents arrived early to collect their children. The early audience exposed a timing problem in the rehearsal, because one long scene made the younger children lose interest and start talking. The cast listened to the comments, timed the scenes again and shortened the middle section to keep the story moving. They discovered that a shorter pause between two scenes helped the audience follow what was happening on stage, and they decided to practise the new timing before the actual performance.",
      "The cast agreed to change direction only after studying the room carefully. The group timed the revised entrance, watched audience reactions carefully and found exactly where the story lost energy during the second half. They then adjusted the blocking so the main characters faced the audience more often, which made the dialogue easier to hear and understand.",
      "Two actors preferred different entrances, so the cast timed both versions before choosing one for the final performance. The comparison turned a disagreement about style into a practical decision based on what actually worked, and the group agreed to use the same evidence-based approach for any future changes to the play."
    ],
    "buildExtension": " The final performance was well received, and several families asked whether the group would perform again. The cast recorded the timing notes so the play could be revived quickly, and they promised to test any new scene in front of an audience before accepting it.",
    "questions": [
      {
        "stem": "What was the main goal of the theatre group?",
        "options": [
          "To let adults make all the decisions.",
          "To make the performance feel natural and well timed.",
          "To spend as much money as possible.",
          "To perform without any preparation."
        ],
        "correctIndex": 1
      },
      {
        "stem": "Why did the early audience help the group?",
        "options": [
          "It forced them to cancel the performance.",
          "It gave them extra money for props.",
          "It meant they could skip rehearsals.",
          "It showed them where the play lost attention."
        ],
        "correctIndex": 3
      },
      {
        "stem": "How did the group solve the timing problem?",
        "options": [
          "They timed the scenes and shortened one section.",
          "They stopped performing in front of audiences.",
          "They added more long pauses.",
          "They ignored the comments they heard."
        ],
        "correctIndex": 0
      },
      {
        "stem": "What did the two actors disagree about?",
        "options": [
          "Whether to perform at all.",
          "Which entrance worked better for the story.",
          "Who would collect the tickets.",
          "Which day the performance would take place."
        ],
        "correctIndex": 1
      },
      {
        "stem": "What does the writer seem to value?",
        "options": [
          "Using evidence to improve a performance.",
          "Avoiding any change to the plan.",
          "Choosing the most expensive option.",
          "Letting personal preference decide."
        ],
        "correctIndex": 0
      }
    ]
  },
  "part4": {
    "title": "A performance reshaped by its first audience",
    "layoutParagraphs": [
      "The youth theatre group began rehearsing its play with a fixed running order and a careful schedule. When some parents arrived early, the cast found themselves performing the first scene in front of a real audience. (16) ..... Several parents helped by timing the scenes from the back of the hall, which gave the cast a second opinion on the pacing. The unexpected trial gave the group honest feedback that a normal rehearsal could not have provided.",
      "The early audience lost interest during one long middle scene, and the actors noticed the children starting to talk. (17) ..... The shorter version kept the youngest viewers interested, and the actors agreed that the change made the story easier to follow. The cast shortened the scene and added a short pause so the audience could follow the next part of the story more easily and stay with the action.",
      "The group had planned the whole production in advance and did not expect to change it. (18) ..... The group used a small notebook to record the timing of each scene, so no decision was based on a vague memory or guesswork. They timed every scene, listened to the recorded audience comments and decided which parts of the play needed the most attention before the real performance.",
      "Two actors preferred different entrances, and neither was willing to give way at first. (19) ..... Once both entrances had been tested, the choice became obvious, and the disagreement simply disappeared. The comparison showed that one entrance kept the story clearer, so the cast chose it and used the evidence to settle the disagreement calmly, making sure nobody felt that their idea had been ignored.",
      "After the performance, the group recorded their timing notes so that the play could be revived without starting from scratch. (20) ..... A short written summary was left with the drama teacher, so that the same notes could guide the next production. The experience convinced the young actors that testing their work in front of people was the fastest way to improve it."
    ],
    "layoutExtensions": [
      "",
      "",
      "",
      "",
      ""
    ],
    "layoutClosers": [
      "",
      "",
      "",
      "",
      ""
    ],
    "options": [
      {
        "key": "option-0",
        "text": "The actors were nervous, but they remembered their lines.",
        "correctForGap": 16
      },
      {
        "key": "option-1",
        "text": "The group shortened the scene and adjusted the timing.",
        "correctForGap": 17
      },
      {
        "key": "option-2",
        "text": "The audience feedback showed that the plan needed adjustment.",
        "correctForGap": 18
      },
      {
        "key": "option-3",
        "text": "They timed both versions before choosing the clearer one.",
        "correctForGap": 19
      },
      {
        "key": "option-4",
        "text": "These notes would help a future cast bring the play back quickly.",
        "correctForGap": 20
      },
      {
        "key": "option-5",
        "text": "The group cancelled the play and returned the costumes.",
        "correctForGap": null
      },
      {
        "key": "option-6",
        "text": "Nobody could remember any of the lines on stage.",
        "correctForGap": null
      },
      {
        "key": "option-7",
        "text": "The theatre closed before the first rehearsal began.",
        "correctForGap": null
      }
    ],
    "displayOrder": [
      5,
      2,
      7,
      0,
      4,
      1,
      6,
      3
    ]
  },
  "part5": {
    "title": "Joining a Drama Group",
    "text": "Joining a drama group is easier than most teenagers expect, and no one needs experience to begin. In the first session, the leader runs warm-up games that help everyone relax and forget their nerves. The most useful habit is to prepare for every rehearsal as if it were a real performance. Even slow learners soon manage to learn their lines without looking at the script. Nobody in the club is afraid of making mistakes, because every error is treated as part of the fun. Most members forget their nerves once the games begin; however, performing alone still scares them at first. By the final show, even quiet members speak more clearly than they ever thought possible. The confidence you gain stays with you for good, and many former members return to help the younger group each term.",
    "extra": " Newcomers are welcome to watch a session before joining, so they can see how friendly the group is and how much laughter the games produce. The group also records each rehearsal, so members can hear their own progress. The leader keeps activities short and varied, which holds everyone's attention and turns practice into play. Parents at the end-of-term show are often amazed by the difference in their children, and several ask for details about the next course.",
    "specs": [
      {
        "phrase": "prepare for every",
        "languageTarget": "verb choice",
        "options": ["prepares", "preparing", "prepare", "prepared"],
        "correctIndex": 2
      },
      {
        "phrase": "learn their",
        "languageTarget": "collocation",
        "options": ["make", "learn", "take", "do"],
        "correctIndex": 1
      },
      {
        "phrase": "of making",
        "languageTarget": "dependent preposition",
        "options": ["for", "with", "at", "of"],
        "correctIndex": 3
      },
      {
        "phrase": "however",
        "languageTarget": "linking word",
        "options": ["therefore", "however", "moreover", "otherwise"],
        "correctIndex": 1
      },
      {
        "phrase": "more clearly",
        "languageTarget": "adjective/adverb",
        "options": ["much", "most", "very", "more"],
        "correctIndex": 3
      },
      {
        "phrase": "for good",
        "languageTarget": "fixed expression",
        "options": ["on", "by", "at", "for"],
        "correctIndex": 3
      }
    ]
  },
  "part6": {
    "title": "A Free Photography Workshop",
    "text": "The youth centre opened its doors to a new evening workshop on photography, and every place was free. The idea came (27) ........ a local camera club, whose members offered to teach simple techniques. The workshop proved so popular (28) ........ the centre added a second session the following week. Young people were invited to bring their own phones, so nobody needed to buy (29) ........ for the workshop. The leader, (30) ........ teaches every session, has also offered a short talk about choosing equipment on a budget. Parents who saw the end-of-term display were surprised by (31) ........ much the young photographers had improved. The centre now hopes to run the workshop (32) ........ than once a month.",
    "extra": " The first session filled up within an hour of the booking list opening, which surprised the whole centre. Parents who collected their children were so impressed that they asked for an adult class, and the waiting list for that is already growing. The leader now sends a monthly newsletter with photography tips to everyone who has taken part.",
    "tail": " The workshops have given the centre a new sense of purpose and drawn more young people through its doors.",
    "answers": [
      "from",
      "that",
      "one",
      "who",
      "how",
      "more"
    ],
    "targets": [
      "preposition",
      "conjunction",
      "pronoun",
      "relative word",
      "linking word",
      "quantifier"
    ]
  }
}
