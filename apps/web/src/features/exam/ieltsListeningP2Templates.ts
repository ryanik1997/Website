import type { ListeningImportPayload } from './importListeningUtils'

type Q = ListeningImportPayload['parts'][0]['questions'][0]

function mc(
  number: number,
  prompt: string,
  a: string,
  b: string,
  c: string,
  answer: string,
  extra?: Partial<Q>,
): Q {
  return {
    number,
    type: 'multiple-choice',
    prompt,
    options: [
      { id: 'A', label: a },
      { id: 'B', label: b },
      { id: 'C', label: c },
    ],
    answer,
    explanation: 'Chọn theo audio.',
    ...extra,
  }
}

function chooseTwo(
  start: number,
  prompt: string,
  options: Array<{ id: string; label: string }>,
  extra?: Partial<Q>,
): Q[] {
  return [start, start + 1].map(number => ({
    number,
    type: 'matching' as const,
    prompt,
    options,
    answer: 'A/E',
    explanation: 'Choose TWO.',
    ...extra,
  }))
}

/** a7 — Notes 11–16 + MC 17–18 + Choose TWO 19–20 (Cam9 SPORTS WORLD). */
export function ieltsListeningP2A7Part() {
  const fitnessOpts = [
    { id: 'A', label: 'You need to reserve a place.' },
    { id: 'B', label: 'It is free to account holders.' },
    { id: 'C', label: 'You get advice on how to improve your health.' },
    { id: 'D', label: 'It takes place in a special clinic.' },
    { id: 'E', label: 'It is cheaper this month.' },
  ]
  const choosePrompt =
    'Which TWO pieces of information does the speaker give about the fitness test?'

  return {
    partNumber: 2,
    rangeLabel: 'Questions 11–20',
    instruction:
      'Questions 11–16: Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer. '
      + 'Questions 17–18: Choose the correct letter, A, B or C. '
      + 'Questions 19–20: Choose TWO letters, A–E.',
    passageTitle: 'SPORTS WORLD',
    audioFile: 'listening.mp3',
    notePassage: [
      { type: 'gap' as const, number: 11 },
      { type: 'gap' as const, number: 12 },
      { type: 'gap' as const, number: 13 },
      { type: 'gap' as const, number: 14 },
      { type: 'gap' as const, number: 15 },
      { type: 'gap' as const, number: 16 },
    ],
    questions: [
      {
        number: 11,
        type: 'gap-fill' as const,
        prompt: 'Type of store:',
        options: [],
        answer: 'branch',
        wordLimit: 1,
        gapLead: '• a new',
        gapTrail: 'of an international sports goods company',
        sectionRange: 'Questions 11 – 16',
        sectionInstruction:
          'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.',
        sectionTitle: 'SPORTS WORLD',
      },
      {
        number: 12,
        type: 'gap-fill' as const,
        prompt: 'Location:',
        options: [],
        answer: 'west',
        wordLimit: 1,
        gapLead: '• located in the shopping centre to the',
        gapTrail: 'of Bradcaster',
      },
      {
        number: 13,
        type: 'gap-fill' as const,
        prompt: 'Floors 1–3:',
        options: [],
        answer: 'clothing',
        wordLimit: 1,
        gapLead: '• has sports',
        gapTrail: 'and equipment on floors 1–3',
      },
      {
        number: 14,
        type: 'gap-fill' as const,
        prompt: 'Delivery time:',
        options: [],
        answer: '10',
        wordLimit: 1,
        gapLead: '• can get you any item within',
        gapTrail: 'days',
      },
      {
        number: 15,
        type: 'gap-fill' as const,
        prompt: 'Specialises in:',
        options: [],
        answer: 'running',
        wordLimit: 1,
        gapLead: '• shop specialises in equipment for',
      },
      {
        number: 16,
        type: 'gap-fill' as const,
        prompt: 'Special section:',
        options: [],
        answer: 'bags',
        wordLimit: 1,
        gapLead: '• has a special section which just sells',
      },
      mc(
        17,
        'A champion athlete will be in the shop',
        'on Saturday morning only',
        'all day Saturday',
        'for the whole weekend',
        'A',
        {
          sectionRange: 'Questions 17 – 18',
          sectionInstruction: 'Choose the correct letter A, B or C.',
        },
      ),
      mc(
        18,
        'The first person to answer 20 quiz questions correctly will win',
        'gym membership',
        'a video',
        'a calendar',
        'A',
      ),
      ...chooseTwo(19, choosePrompt, fitnessOpts, {
        sectionRange: 'Questions 19 – 20',
        sectionInstruction: 'Choose TWO letters, A–E.',
      }),
    ],
  }
}

/** a10 — MC 11–16 + Choose TWO 17–18 + 19–20 (Cam20 Pottery). */
export function ieltsListeningP2A10Part() {
  const kilns = [
    { id: 'A', label: 'What their function is.' },
    { id: 'B', label: 'When they were invented.' },
    { id: 'C', label: 'Ways of keeping them safe.' },
    { id: 'D', label: 'Where to put one in your home.' },
    { id: 'E', label: 'What some people use instead of one.' },
  ]
  const tools = [
    { id: 'A', label: 'Some are hard to hold.' },
    { id: 'B', label: 'Some are worth buying.' },
    { id: 'C', label: 'Some are essential items.' },
    { id: 'D', label: 'Some have memorable names.' },
    { id: 'E', label: 'Some are available for use by participants.' },
  ]

  return {
    partNumber: 2,
    rangeLabel: 'Questions 11–20',
    instruction:
      'Questions 11–16: Choose the correct letter, A, B or C. '
      + 'Questions 17–18 and 19–20: Choose TWO letters, A–E.',
    passageTitle: 'Edelman Pottery — visitor talk',
    audioFile: 'listening.mp3',
    questions: [
      mc(
        11,
        'Heather says pottery differs from other art forms because',
        'it lasts longer in the ground',
        'it is practised by more people',
        'it can be repaired more easily',
        'A',
        {
          sectionRange: 'Questions 11 – 16',
          sectionInstruction: 'Choose the correct letter A, B or C.',
        },
      ),
      mc(12, 'Archaeologists identify ancient pottery from', 'the clay it was made with', 'the marks that are on it', 'the basic shape of it', 'B'),
      mc(13, 'Some people join Heather\'s class because they want to', 'create something that looks old', 'find something they are good at', 'make something that will outlive them', 'C'),
      mc(14, 'What does Heather value most about being a potter?', 'Its calming effect', 'Its messy nature', 'Its physical benefits', 'A'),
      mc(15, 'Most visitors to Edelman Pottery', 'bring friends to join courses', 'have never made a pot before', 'try to learn techniques too quickly', 'B'),
      mc(16, 'Heather reminds visitors they should', 'put on their aprons', 'change their clothes', 'take off their jewellery', 'C'),
      ...chooseTwo(17, 'Which TWO things does Heather explain about kilns?', kilns, {
        sectionRange: 'Questions 17 – 18',
        sectionInstruction: 'Choose TWO letters, A–E.',
      }),
      ...chooseTwo(19, 'Which TWO points does Heather make about a potter\'s tools?', tools, {
        sectionRange: 'Questions 19 – 20',
        sectionInstruction: 'Choose TWO letters, A–E.',
      }),
    ],
  }
}

/** a8 — MC 11–13 + matching 14–18 + table 19–20. */
export function ieltsListeningP2A8Part() {
  const areaOpts = [
    { id: 'A', label: 'advertising' },
    { id: 'B', label: 'animal care' },
    { id: 'C', label: 'building' },
    { id: 'D', label: 'educational links' },
    { id: 'E', label: 'engine maintenance' },
    { id: 'F', label: 'food and drink' },
    { id: 'G', label: 'sales' },
    { id: 'H', label: 'staffing' },
  ]

  return {
    partNumber: 2,
    rangeLabel: 'Questions 11–20',
    instruction:
      'Questions 11–13: Choose A, B or C. Questions 14–18: matching A–H. '
      + 'Questions 19–20: Complete the table.',
    audioFile: 'listening.mp3',
    notePassageLayout: 'table' as const,
    noteTables: [
      {
        gapNumbers: [19, 20],
        instruction:
          'Questions 19 – 20\nComplete the table below. Write ONE WORD AND/OR A NUMBER for each answer.',
        headers: ['Feature', 'Size', 'Biggest challenge', 'Target age group'],
        rows: [
          {
            cells: [
              [{ type: 'static' as const, text: 'Railway' }],
              [{ type: 'static' as const, text: '1.2 km' }],
              [{ type: 'static' as const, text: 'Making tunnels' }],
              [{ type: 'gap' as const, number: 19 }],
            ],
          },
          {
            cells: [
              [{ type: 'static' as const, text: 'Go-kart arena' }],
              [
                { type: 'gap' as const, number: 20 },
                { type: 'static' as const, text: ' sq.m.' },
              ],
              [{ type: 'static' as const, text: 'Removing mounds on the track' }],
              [{ type: 'static' as const, text: '… years old' }],
            ],
          },
        ],
      },
    ],
    questions: [
      mc(11, "Simon's idea for a theme park came from", 'his childhood hobby', 'his interest in landscape design', 'his visit to another park', 'C', {
        sectionRange: 'Questions 11 – 13',
        sectionInstruction: 'Choose the correct letter A, B or C.',
      }),
      mc(12, 'When they started, the family decided to open the park only when', 'the weather was expected to be good', "the children weren't at school", 'there were fewer farming commitments', 'C'),
      mc(13, 'Since opening, the park has had', '50,000 visitors', '1,000,000 visitors', '1,500,000 visitors', 'C'),
      {
        number: 14,
        type: 'matching' as const,
        prompt: 'Simon',
        options: areaOpts,
        answer: 'C',
        sectionRange: 'Questions 14 – 18',
        sectionInstruction:
          'What is currently the main area of work of each of the following people? '
          + 'Choose FIVE answers from the box and write the correct letter A–H next to questions 14–18.',
        sectionTitle: 'AREA OF WORK',
      },
      { number: 15, type: 'matching' as const, prompt: 'Liz', options: areaOpts, answer: 'G' },
      { number: 16, type: 'matching' as const, prompt: 'Sarah', options: areaOpts, answer: 'D' },
      { number: 17, type: 'matching' as const, prompt: 'Duncan', options: areaOpts, answer: 'E' },
      { number: 18, type: 'matching' as const, prompt: 'Judith', options: areaOpts, answer: 'F' },
      {
        number: 19,
        type: 'gap-fill' as const,
        prompt: 'Target age group (Railway):',
        options: [],
        answer: '12',
        wordLimit: 2,
      },
      {
        number: 20,
        type: 'gap-fill' as const,
        prompt: 'Go-kart size:',
        options: [],
        answer: '400',
        wordLimit: 1,
      },
    ],
  }
}

/** a12 — MC 11–16 + map 17–20 (cần map.jpg). */
export function ieltsListeningP2A12Part() {
  const mapOpts = 'ABCDEFG'.split('').map(id => ({ id, label: id }))

  return {
    partNumber: 2,
    rangeLabel: 'Questions 11–20',
    instruction:
      'Questions 11–16: Choose A, B or C. Questions 17–20: Label the map A–G.',
    audioFile: 'listening.mp3',
    imageFile: 'map.jpg',
    questions: [
      mc(11, 'Who was responsible for starting the community project?', 'The castle owners', 'A national charity', 'The local council', 'C', {
        sectionRange: 'Questions 11 – 16',
        sectionInstruction: 'Choose the correct letter A, B or C.',
      }),
      mc(12, 'How was the gold coin found?', 'Heavy rain had removed some of the soil', 'The ground was dug up by wild rabbits', 'A person with a metal detector searched the area', 'C'),
      mc(13, 'What led the archaeologists to believe there was an ancient village on this site?', 'The lucky discovery of old records', 'The bases of several structures visible in the grass', 'The unusual stones found near the castle', 'B'),
      mc(14, 'What are the team still hoping to find?', 'Everyday pottery', 'Animal bones', 'Pieces of jewellery', 'A'),
      mc(15, 'What was found on the other side of the river from the castle?', 'The remains of a large palace', 'The outline of fields', 'A number of small huts', 'B'),
      mc(16, 'What do the team plan to do after work ends this summer?', 'Prepare a display for a museum', 'Take part in a television programme', 'Start to organise school visits', 'A'),
      {
        number: 17,
        type: 'matching' as const,
        prompt: 'bridge foundations',
        options: mapOpts,
        answer: 'A',
        mapLabel: true,
        sectionRange: 'Questions 17 – 20',
        sectionInstruction: 'Label the map. Choose the correct letter, A–G, for each label.',
        sectionTitle: 'Bidcaster Archaeological Dig',
      },
      { number: 18, type: 'matching' as const, prompt: 'rubbish pit', options: mapOpts, answer: 'D', mapLabel: true },
      { number: 19, type: 'matching' as const, prompt: 'meeting hall', options: mapOpts, answer: 'E', mapLabel: true },
      { number: 20, type: 'matching' as const, prompt: 'fish pond', options: mapOpts, answer: 'G', mapLabel: true },
    ],
  }
}

/** a11 — Matching 11–16 + MC 17–20. */
export function ieltsListeningP2A11Part() {
  const roleOpts = 'ABCDEFGHI'.split('').map((id, i) => ({
    id,
    label: [
      'providing entertainment',
      'providing publicity about a council service',
      'contacting local businesses',
      'giving advice to visitors',
      'collecting feedback on events',
      'selling tickets',
      'introducing guest speakers at an event',
      'encouraging cooperation between local organisations',
      'helping people find their seats',
    ][i] ?? `option ${id}`,
  }))

  return {
    partNumber: 2,
    rangeLabel: 'Questions 11–20',
    audioFile: 'listening.mp3',
    questions: [
      {
        number: 11,
        type: 'matching' as const,
        prompt: 'walking around the town centre',
        options: roleOpts,
        answer: 'B',
        sectionRange: 'Questions 11 – 16',
        sectionInstruction:
          'What is the role of the volunteers in each of the following activities? '
          + 'Choose SIX answers from the box and write the correct letter A–I next to questions 11–16.',
        sectionTitle: 'ROLE OF VOLUNTEERS',
      },
      { number: 12, type: 'matching' as const, prompt: 'helping at concerts', options: roleOpts, answer: 'A' },
      { number: 13, type: 'matching' as const, prompt: 'getting involved with community groups', options: roleOpts, answer: 'H' },
      { number: 14, type: 'matching' as const, prompt: 'helping with a magazine', options: roleOpts, answer: 'E' },
      { number: 15, type: 'matching' as const, prompt: 'participating at lunches for retired people', options: roleOpts, answer: 'D' },
      { number: 16, type: 'matching' as const, prompt: 'helping with the website', options: roleOpts, answer: 'G' },
      mc(17, 'Which event requires the largest number of volunteers?', 'The music festival', 'The science festival', 'The book festival', 'A', {
        sectionRange: 'Questions 17 – 20',
        sectionInstruction: 'Choose the correct letter A, B or C.',
      }),
      mc(18, 'What is the most important requirement for volunteers at the festivals?', 'Interpersonal skills', 'Personal interest in the event', 'Flexibility', 'B'),
      mc(19, 'New volunteers will start working in the week beginning', '2 September', '9 September', '23 September', 'B'),
      mc(20, 'What is the next annual event for volunteers?', 'A boat trip', 'A barbecue', 'A party', 'A'),
    ],
  }
}

/** a6 — Table 11–13 + MC 14–16 + Map 17–20 (cần map.jpg). */
export function ieltsListeningP2A6Part() {
  const mapOpts = 'ABCDEFGHI'.split('').map(id => ({ id, label: id }))

  return {
    partNumber: 2,
    rangeLabel: 'Questions 11–20',
    instruction:
      'Questions 11–13: Complete the table. Questions 14–16: Choose A, B or C. '
      + 'Questions 17–20: Label the map A–I.',
    audioFile: 'listening.mp3',
    imageFile: 'map.jpg',
    notePassageLayout: 'table' as const,
    noteTables: [
      {
        gapNumbers: [11, 12, 13],
        instruction:
          'Questions 11 – 13\nComplete the table below. Write NO MORE THAN THREE WORDS for each answer.',
        headers: ['Name of place', 'Of particular interest', 'Open'],
        rows: [
          {
            cells: [
              [{ type: 'static' as const, text: 'Halland Common' }],
              [{ type: 'static' as const, text: 'Source of River Ouse' }],
              [{ type: 'static' as const, text: '24 hours' }],
            ],
          },
          {
            cells: [
              [{ type: 'static' as const, text: 'Hot Island' }],
              [
                { type: 'static' as const, text: 'Many different ' },
                { type: 'gap' as const, number: 11 },
              ],
              [
                { type: 'static' as const, text: 'Between ' },
                { type: 'gap' as const, number: 12 },
                { type: 'static' as const, text: ' and ' },
                { type: 'gap' as const, number: 13 },
              ],
            ],
          },
          {
            cells: [
              [{ type: 'static' as const, text: 'Longfield Country Park' }],
              [{ type: 'static' as const, text: 'Reconstruction of a 2,000-year-old roundhouse with activities for children' }],
              [{ type: 'static' as const, text: 'Daylight hours' }],
            ],
          },
        ],
      },
    ],
    questions: [
      {
        number: 11,
        type: 'gap-fill' as const,
        prompt: 'Hot Island — interest:',
        options: [],
        answer: 'birds',
        wordLimit: 3,
        sectionRange: 'Questions 11 – 13',
        sectionInstruction:
          'Complete the table below. Write NO MORE THAN THREE WORDS for each answer.',
      },
      {
        number: 12,
        type: 'gap-fill' as const,
        prompt: 'Hot Island — open from:',
        options: [],
        answer: '9.30',
        wordLimit: 3,
      },
      {
        number: 13,
        type: 'gap-fill' as const,
        prompt: 'Hot Island — open until:',
        options: [],
        answer: '5.30',
        wordLimit: 3,
      },
      mc(
        14,
        'As part of Monday\'s activity, visitors will',
        'prepare food with herbs',
        'meet a well-known herbalist',
        'dye cloth with herbs',
        'A',
        {
          sectionRange: 'Questions 14 – 16',
          sectionInstruction: 'Choose the correct letter A, B or C.',
        },
      ),
      mc(15, 'For the activity on Wednesday,', 'only group bookings are accepted', 'visitors should book in advance', 'attendance is free', 'B'),
      mc(16, 'For the activity on Saturday, visitors should', 'come in suitable clothing', 'make sure they are able to stay for the whole day', 'tell the rangers before the event what they wish to do', 'A'),
      {
        number: 17,
        type: 'matching' as const,
        prompt: 'bird hide',
        options: mapOpts,
        answer: 'C',
        mapLabel: true,
        sectionRange: 'Questions 17 – 20',
        sectionInstruction: 'Label the map below. Write the correct letter A–I next to questions 17–20.',
        sectionTitle: 'HINCHINGBROOKE PARK',
      },
      { number: 18, type: 'matching' as const, prompt: 'dog-walking area', options: mapOpts, answer: 'H', mapLabel: true },
      { number: 19, type: 'matching' as const, prompt: 'flower garden', options: mapOpts, answer: 'D', mapLabel: true },
      { number: 20, type: 'matching' as const, prompt: 'wooded area', options: mapOpts, answer: 'I', mapLabel: true },
    ],
  }
}

/** a9 — Diagram 11–13 + matching 14–18 + notes 19–20 (cần diagram.jpg). */
export function ieltsListeningP2A9Part() {
  const diagramOpts = [
    { id: 'A', label: 'electricity indicator' },
    { id: 'B', label: 'on/off switch' },
    { id: 'C', label: 'reset button' },
    { id: 'D', label: 'time control' },
    { id: 'E', label: 'warning indicator' },
  ]
  const locationOpts = [
    { id: 'A', label: 'in box on washing machine' },
    { id: 'B', label: 'in cupboard on landing' },
    { id: 'C', label: 'in chest of drawers' },
    { id: 'D', label: 'next to window in living room' },
    { id: 'E', label: 'on shelf of back door' },
    { id: 'F', label: 'on top of television' },
    { id: 'G', label: 'under kitchen sink' },
  ]

  return {
    partNumber: 2,
    rangeLabel: 'Questions 11–20',
    instruction:
      'Questions 11–13: Label the diagram. Questions 14–18: Matching. '
      + 'Questions 19–20: Complete the notes.',
    audioFile: 'listening.mp3',
    imageFile: 'diagram.jpg',
    notePassage: [
      { type: 'static' as const, text: 'The best place to park in town is next to station' },
      { type: 'gap' as const, number: 19 },
      { type: 'gap' as const, number: 20 },
    ],
    questions: [
      {
        number: 11,
        type: 'matching' as const,
        prompt: 'Item 11',
        options: diagramOpts,
        answer: 'D',
        diagramLabel: true,
        sectionRange: 'Questions 11 – 13',
        sectionInstruction:
          'Label the diagram below. Choose THREE answers from the box and write the correct letter A–E.',
        sectionTitle: 'WATER HEATER',
      },
      { number: 12, type: 'matching' as const, prompt: 'Item 12', options: diagramOpts, answer: 'C', diagramLabel: true },
      { number: 13, type: 'matching' as const, prompt: 'Item 13', options: diagramOpts, answer: 'E', diagramLabel: true },
      {
        number: 14,
        type: 'matching' as const,
        prompt: 'Pillows',
        options: locationOpts,
        answer: 'B',
        sectionRange: 'Questions 14 – 18',
        sectionInstruction:
          'Where can each of the following items be found? Choose FIVE answers from the options and write the correct letter A–G.',
      },
      { number: 15, type: 'matching' as const, prompt: 'Washing powder', options: locationOpts, answer: 'G' },
      { number: 16, type: 'matching' as const, prompt: 'Key', options: locationOpts, answer: 'E' },
      { number: 17, type: 'matching' as const, prompt: 'Light bulbs', options: locationOpts, answer: 'C' },
      { number: 18, type: 'matching' as const, prompt: 'Map', options: locationOpts, answer: 'D' },
      {
        number: 19,
        type: 'gap-fill' as const,
        prompt: 'Phone number for takeaway pizzas:',
        options: [],
        answer: '327616',
        wordLimit: 2,
        gapLead: 'Phone number for takeaway pizzas –',
        sectionRange: 'Questions 19 – 20',
        sectionInstruction:
          'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.',
      },
      {
        number: 20,
        type: 'gap-fill' as const,
        prompt: 'Railway museum closed on:',
        options: [],
        answer: 'Monday',
        wordLimit: 2,
        gapLead: 'Railway museum closed on',
      },
    ],
  }
}

/** a13 — Choose TWO ×2 + matching 15–20 (football history). */
export function ieltsListeningP2A13Part() {
  const historyOpts = [
    { id: 'A', label: 'The introduction of pay for the players' },
    { id: 'B', label: 'A change to the design of the goal' },
    { id: 'C', label: 'The first use of lights for matches' },
    { id: 'D', label: 'The introduction of goalkeepers' },
    { id: 'E', label: 'The first international match' },
    { id: 'F', label: 'Two changes to the rules of the game' },
    { id: 'G', label: 'The introduction of a fee for spectators' },
    { id: 'H', label: 'An agreement on the length of a game' },
  ]
  const stadiumOpts = [
    { id: 'A', label: 'Children can get their photo taken with a football player.' },
    { id: 'B', label: 'There is a competition for children today.' },
    { id: 'C', label: 'Parents must stay with their children at all times.' },
    { id: 'D', label: 'Children will need sunhats and drinks.' },
    { id: 'E', label: 'The café has a special offer on meals for children.' },
  ]
  const tourOpts = [
    { id: 'A', label: 'VIP tour' },
    { id: 'B', label: '360 cinema experience' },
    { id: 'C', label: 'Audio guide' },
    { id: 'D', label: 'Dressing room tour' },
    { id: 'E', label: 'Tours in other languages' },
  ]

  return {
    partNumber: 2,
    rangeLabel: 'Questions 11–20',
    instruction:
      'Questions 11–12 and 13–14: Choose TWO letters A–E. '
      + 'Questions 15–20: Matching A–H.',
    audioFile: 'listening.mp3',
    questions: [
      ...chooseTwo(
        11,
        'Which TWO things does the speaker say about visiting the football stadium with children?',
        stadiumOpts,
        { sectionRange: 'Questions 11 – 12', sectionInstruction: 'Choose TWO letters, A–E.' },
      ),
      ...chooseTwo(
        13,
        'Which TWO features of the stadium tour are new this year?',
        tourOpts,
        { sectionRange: 'Questions 13 – 14', sectionInstruction: 'Choose TWO letters, A–E.' },
      ),
      {
        number: 15,
        type: 'matching' as const,
        prompt: '1870',
        options: historyOpts,
        answer: 'G',
        sectionRange: 'Questions 15 – 20',
        sectionInstruction:
          'Which event in the history of football in the UK took place in each of the following years? '
          + 'Choose SIX answers from the box and write the correct letter A–H next to questions 15–20.',
        sectionTitle: 'HISTORY OF FOOTBALL IN THE UK',
      },
      { number: 16, type: 'matching' as const, prompt: '1874', options: historyOpts, answer: 'B' },
      { number: 17, type: 'matching' as const, prompt: '1875', options: historyOpts, answer: 'D' },
      { number: 18, type: 'matching' as const, prompt: '1877', options: historyOpts, answer: 'C' },
      { number: 19, type: 'matching' as const, prompt: '1878', options: historyOpts, answer: 'F' },
      { number: 20, type: 'matching' as const, prompt: '1880', options: historyOpts, answer: 'H' },
    ],
  }
}

/** a14 — MC 11–14 + Map 15–20 (cần map.jpg). */
export function ieltsListeningP2A14Part() {
  const mapOpts = 'ABCDEFGHI'.split('').map(id => ({ id, label: id }))

  return {
    partNumber: 2,
    rangeLabel: 'Questions 11–20',
    instruction:
      'Questions 11–14: Choose A, B or C. Questions 15–20: Label the map A–I.',
    audioFile: 'listening.mp3',
    imageFile: 'map.jpg',
    questions: [
      mc(
        11,
        'Which is the most rapidly growing group of residents in the Sheepmarket area?',
        'young professional people',
        'students from the university',
        'employees in the local market',
        'A',
        {
          sectionRange: 'Questions 11 – 14',
          sectionInstruction: 'Choose the correct letter A, B or C.',
        },
      ),
      mc(12, 'The speaker recommends the side streets in the Sheepmarket for their', 'international restaurants', 'historical buildings', 'arts and crafts', 'C'),
      mc(13, 'Clothes designed by entrants for the Young Fashion competition must', 'be modelled by the designers themselves', 'be inspired by aspects of contemporary culture', 'be made from locally produced materials', 'B'),
      mc(14, 'Car parking is free in some car parks if you', 'stay for less than an hour', 'buy something in the shops', 'park in the evenings or at weekends', 'B'),
      {
        number: 15,
        type: 'matching' as const,
        prompt: 'The Reynolds House',
        options: mapOpts,
        answer: 'C',
        mapLabel: true,
        sectionRange: 'Questions 15 – 20',
        sectionInstruction: 'Label the map below. Write the correct letter A–I next to questions 15–20.',
        sectionTitle: 'ART AND HISTORY IN THE SHEEPMARKET',
      },
      { number: 16, type: 'matching' as const, prompt: 'The Thumb', options: mapOpts, answer: 'G', mapLabel: true },
      { number: 17, type: 'matching' as const, prompt: 'The Museum', options: mapOpts, answer: 'D', mapLabel: true },
      { number: 18, type: 'matching' as const, prompt: 'The Contemporary Art Gallery', options: mapOpts, answer: 'A', mapLabel: true },
      { number: 19, type: 'matching' as const, prompt: 'The Warner Gallery', options: mapOpts, answer: 'E', mapLabel: true },
      { number: 20, type: 'matching' as const, prompt: 'Nucleus', options: mapOpts, answer: 'H', mapLabel: true },
    ],
  }
}

export type IeltsListeningP2TemplateKind =
  | 'p2-a6'
  | 'p2-a7'
  | 'p2-a8'
  | 'p2-a9'
  | 'p2-a10'
  | 'p2-a11'
  | 'p2-a12'
  | 'p2-a13'
  | 'p2-a14'

export function buildIeltsListeningP2Template(
  kind: IeltsListeningP2TemplateKind,
): ListeningImportPayload {
  const parts = {
    'p2-a6': ieltsListeningP2A6Part,
    'p2-a7': ieltsListeningP2A7Part,
    'p2-a8': ieltsListeningP2A8Part,
    'p2-a9': ieltsListeningP2A9Part,
    'p2-a10': ieltsListeningP2A10Part,
    'p2-a11': ieltsListeningP2A11Part,
    'p2-a12': ieltsListeningP2A12Part,
    'p2-a13': ieltsListeningP2A13Part,
    'p2-a14': ieltsListeningP2A14Part,
  }

  const labels: Record<IeltsListeningP2TemplateKind, string> = {
    'p2-a6': 'a6 — Table + MC + Map',
    'p2-a7': 'a7 — Notes + MC + Choose TWO',
    'p2-a8': 'a8 — MC + Matching + Table',
    'p2-a9': 'a9 — Diagram + Match + Notes',
    'p2-a10': 'a10 — MC + Choose TWO ×2',
    'p2-a11': 'a11 — Matching + MC',
    'p2-a12': 'a12 — MC + Map',
    'p2-a13': 'a13 — Choose TWO ×2 + Match',
    'p2-a14': 'a14 — MC + Map',
  }

  return {
    version: 1,
    title: `IELTS Listening — Part 2 (${labels[kind]})`,
    durationMinutes: 30,
    bandHint: `IELTS · Part 2 · Giaodien/Part2-Listening/${kind.replace('p2-', '')}.jpg`,
    examType: 'ielts',
    examMode: 'practice',
    parts: [parts[kind]()],
  }
}

export function ieltsListeningP2TemplateFilename(kind: IeltsListeningP2TemplateKind): string {
  return `ielts-listening-${kind}-template.json`
}