import {
  READING_EXAMS,
  YNNG_OPTIONS,
  type ReadingNotePassageBlock,
  type ReadingNoteTable,
  type ReadingPart,
  type ReadingQuestion,
  type ReadingQuestionGroup,
} from '../examData'
import type { ReadingImportPartJson } from '../importReadingManualUtils'
import {
  IELTS_READING_DEFAULT_TEMPLATES,
  IELTS_READING_PASSAGE_NUMBERS,
  type IeltsReadingPassageNumber,
  type IeltsReadingWizardTemplateKind,
} from './ieltsReadingWizardConfig'
import {
  isKnownReadingTemplateKind,
  resolveReadingTemplateKind as resolveReadingTemplateKindFromCatalog,
  templateOptionsForPassage,
} from './ieltsReadingTemplateCatalog'

const MOCK = READING_EXAMS.find(e => e.id === 'ielts-reading-01')!
const DEMO = READING_EXAMS.find(e => e.id === 'ielts-reading-types-demo')!

const TFNG_OPTIONS = [
  { id: 'true', label: 'TRUE' },
  { id: 'false', label: 'FALSE' },
  { id: 'not-given', label: 'NOT GIVEN' },
]

function partToImportJson(part: ReadingPart): ReadingImportPartJson {
  return {
    partNumber: part.partNumber,
    rangeLabel: part.rangeLabel,
    passageTitle: part.passageTitle,
    passageSubtitle: part.passageSubtitle,
    passage: part.passage.map(block => ({
      label: block.label,
      text: block.text,
    })),
    questionGroups: part.questionGroups.map(group => ({
      range: group.range,
      instruction: group.instruction,
      note: group.note,
      imageFile: group.imageFile,
      noteTable: group.noteTable,
      notePassage: group.notePassage,
      notesTitle: group.notesTitle,
      type: group.type,
      paragraphLetters: group.paragraphLetters,
      headings: group.headings,
      features: group.features,
      wordBank: group.wordBank,
      questions: group.questions.map(q => ({
        number: q.number,
        type: q.type,
        prompt: q.prompt,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
      })),
    })),
  }
}

function stripQuestionIds(questions: ReadingQuestion[], start: number, count?: number): ReadingImportPartJson['questionGroups'][0]['questions'] {
  const slice = count != null ? questions.slice(0, count) : questions
  return slice.map((q, i) => ({
    number: start + i,
    type: q.type,
    prompt: q.prompt,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
  }))
}

function renumberGroup(
  group: ReadingQuestionGroup,
  range: string,
  start: number,
  count?: number,
): ReadingImportPartJson['questionGroups'][0] {
  return {
    range,
    instruction: group.instruction,
    note: group.note,
    imageFile: group.imageFile,
    noteTable: group.noteTable,
    notePassage: group.notePassage,
    notesTitle: group.notesTitle,
    type: group.type,
    paragraphLetters: group.paragraphLetters,
    headings: group.headings,
    features: group.features,
    wordBank: group.wordBank,
    questions: stripQuestionIds(group.questions, start, count),
  }
}

function gapQuestions(start: number, items: Array<{ prompt: string; answer: string; explanation: string }>) {
  return items.map((item, i) => ({
    number: start + i,
    type: 'gap-fill' as const,
    prompt: item.prompt,
    options: [],
    answer: item.answer,
    explanation: item.explanation,
  }))
}

function sentenceQuestions(start: number, items: Array<{ prompt: string; answer: string; explanation: string }>) {
  return items.map((item, i) => ({
    number: start + i,
    type: 'sentence-completion' as const,
    prompt: item.prompt,
    options: [],
    answer: item.answer,
    explanation: item.explanation,
  }))
}

/** Cam10 T1 — TFNG + MC */
export function ieltsReadingP1R1Part(): ReadingImportPartJson {
  return partToImportJson(MOCK.parts[0])
}

/** Cam10 T1 — bảng Stepwells Q9–13 */
export const CAM10_T1_STEPWELLS_TABLE: ReadingNoteTable = {
  headers: ['Stepwells', 'Date', 'Features', 'Other notes'],
  gapNumbers: [9, 10, 11, 12, 13],
  rows: [
    {
      cells: [
        [{ type: 'static', text: 'Rani Ki Vav' }],
        [{ type: 'static', text: 'Late 11th century' }],
        [{ type: 'static', text: 'As many as 500 sculptures decorate the monument' }],
        [
          { type: 'static', text: 'Restored in the 1990s' },
          { type: 'break' },
          { type: 'static', text: 'Excellent condition, despite the ' },
          { type: 'gap', number: 9 },
          { type: 'static', text: ' of 2001.' },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'Surya Kund' }],
        [{ type: 'static', text: '1026' }],
        [
          { type: 'static', text: 'Steps on the ' },
          { type: 'gap', number: 10 },
          { type: 'static', text: ' produce a geometric pattern' },
          { type: 'break' },
          { type: 'static', text: 'Carved shrines.' },
        ],
        [
          { type: 'static', text: 'Looks more like a ' },
          { type: 'gap', number: 11 },
          { type: 'static', text: ' than a well.' },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'Raniji Ki Baori' }],
        [{ type: 'static', text: '1699' }],
        [{ type: 'static', text: 'Intricately carved monument' }],
        [{ type: 'static', text: 'One of 21 baoris in the area commissioned by Queen Nathavatji' }],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'Chand Baori' }],
        [{ type: 'static', text: '850 AD' }],
        [{ type: 'static', text: 'Steps take you down 11 storeys to the bottom' }],
        [
          { type: 'static', text: 'Old, deep and very dramatic' },
          { type: 'break' },
          { type: 'static', text: 'Has ' },
          { type: 'gap', number: 12 },
          { type: 'static', text: ' which provide a view of the steps.' },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'Neemrana Ki Baori' }],
        [{ type: 'static', text: '1700' }],
        [
          { type: 'static', text: 'Has two ' },
          { type: 'gap', number: 13 },
          { type: 'static', text: ' levels.' },
        ],
        [{ type: 'static', text: 'Used by public today' }],
      ],
    },
  ],
}

/** Cam10 T1 — TFNG Q1–5 + gap Q6–8 + table Q9–13 */
export function ieltsReadingP1TfngGapTablePart(): ReadingImportPartJson {
  const base = MOCK.parts[0]
  const tfng = base.questionGroups[0]

  return {
    ...partToImportJson(base),
    passageTitle: 'Stepwells',
    passageSubtitle: 'A millennium ago, stepwells were fundamental to life in the driest parts of India.',
    questionGroups: [
      {
        range: 'Questions 1–5',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.',
        type: 'tfng',
        questions: tfng.questions.slice(0, 5).map((q, i) => ({
          number: 1 + i,
          type: q.type,
          prompt: q.prompt,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
        })),
      },
      {
        range: 'Questions 6–8',
        instruction: 'Answer the questions below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(6, [
          { prompt: 'Which part of some stepwells provided shade for people?', answer: 'pavilions', explanation: 'Pavilions che nắng cho du khách.' },
          { prompt: 'What type of serious climatic event, which took place in southern Rajasthan, is mentioned?', answer: 'drought', explanation: 'Hạn hán 8 năm 1996–2004.' },
          { prompt: 'Who are frequent visitors to stepwells nowadays?', answer: 'tourists', explanation: 'Du khách đến chiêm ngưỡng các công trình cổ.' },
        ]),
      },
      {
        range: 'Questions 9–13',
        instruction: 'Complete the table below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.',
        type: 'gap-fill',
        noteTable: CAM10_T1_STEPWELLS_TABLE,
        questions: gapQuestions(9, [
          { prompt: 'Gap (9)', answer: 'earthquake', explanation: 'Sống sót sau động đất 7.6 Richter năm 2001.' },
          { prompt: 'Gap (10)', answer: '4 sides|four sides', explanation: 'Bốn cạnh bậc thang tạo hình học.' },
          { prompt: 'Gap (11)', answer: 'tank', explanation: 'Giống hồ chứa (kund) hơn giếng.' },
          { prompt: 'Gap (12)', answer: 'verandas', explanation: 'Hành lang verandas nhìn xuống bậc.' },
          { prompt: 'Gap (13)', answer: 'underwater', explanation: 'Hai tầng dưới nước.' },
        ]),
      },
    ],
  }
}

/** Cam10 T4 — notes Wildfires Q1–6 */
export const CAM10_T4_WILDFIRES_NOTE_PASSAGE: ReadingNotePassageBlock[] = [
  {
    type: 'section',
    text: '• Characteristics of wildfires and wildfire conditions today compared to the past:',
  },
  { type: 'static', text: '– occurrence: more frequent' },
  { type: 'static', text: '– temperature: hotter' },
  { type: 'static', text: '– speed: faster' },
  { type: 'static', text: '– movement: ' },
  { type: 'gap', number: 1 },
  { type: 'static', text: ' more unpredictable' },
  { type: 'static', text: '– size of fires: ' },
  { type: 'gap', number: 2 },
  { type: 'static', text: ' greater on average than two decades ago' },
  {
    type: 'section',
    text: '• Reasons wildfires cause more damage today compared to the past:',
  },
  { type: 'static', text: '– rainfall: ' },
  { type: 'gap', number: 3 },
  { type: 'static', text: ' average' },
  { type: 'static', text: '– more brush to act as ' },
  { type: 'gap', number: 4 },
  { type: 'static', text: '– increase in yearly temperature' },
  { type: 'static', text: '– extended fire ' },
  { type: 'gap', number: 5 },
  { type: 'static', text: '– more building of ' },
  { type: 'gap', number: 6 },
  { type: 'static', text: ' in vulnerable places' },
]

/** Cam12 T8 — notes Glass Q1–8 */
export const CAM12_T8_GLASS_NOTE_PASSAGE: ReadingNotePassageBlock[] = [
  { type: 'static', text: '• Early humans used a material called ' },
  { type: 'gap', number: 1 },
  { type: 'static', text: ' to make the sharp points of their ' },
  { type: 'gap', number: 2 },
  { type: 'static', text: '• 4000 BC: ' },
  { type: 'gap', number: 3 },
  { type: 'static', text: ' made of stone were covered in a coating of man-made glass.' },
  { type: 'static', text: '• First century BC: glass was coloured because of the ' },
  { type: 'gap', number: 4 },
  { type: 'static', text: ' in the material.' },
  { type: 'static', text: '• Until 476 AD: Only the ' },
  { type: 'gap', number: 5 },
  { type: 'static', text: ' knew how to make glass.' },
  { type: 'static', text: '• From 10th century: Venetians became famous for making bottles out of glass.' },
  { type: 'static', text: '• 17th century: George Ravenscroft developed a process using ' },
  { type: 'gap', number: 6 },
  { type: 'static', text: ' to avoid the occurrence of ' },
  { type: 'gap', number: 7 },
  { type: 'static', text: ' in blown glass.' },
  { type: 'static', text: '• Mid-19th century: British glass production developed after changes to laws concerning ' },
  { type: 'gap', number: 8 },
]

/** Cam12 T8 — notes Q1–8 (notePassage) + TFNG Q9–13 */
export function ieltsReadingP1NotesTfng8Part(): ReadingImportPartJson {
  return {
    partNumber: 1,
    rangeLabel: 'Read the text and answer questions 1–13.',
    passageTitle: 'The history of glass',
    passage: [
      {
        text: 'From our earliest origins, man has been making use of glass. Historians have discovered that a type of natural glass - obsidian - formed in places such as the mouth of a volcano as a result of the intense heat of an eruption melting sand - was first used as tips for spears. Archaeologists have even found evidence of man-made glass which dates back to 4000 BC; this took the form of glazes used for coating stone beads. It was not until 1500 BC, however, that the first hollow glass container was made by covering a sand core with a layer of molten glass.',
      },
      {
        text: 'Glass blowing became the most common way to make glass containers from the first century BC. The glass made during this time was highly coloured due to the impurities of the raw material. In the first century AD, methods of creating colourless glass were developed, which was then tinted by the addition of colouring materials. The secret of glass making was taken across Europe by the Romans during this century. However, they guarded the skills and technology required to make glass very closely, and it was not until their empire collapsed in 476 AD that glass-making knowledge became widespread throughout Europe and the Middle East. From the 10th century onwards, the Venetians gained a reputation for technical skill and artistic ability in the making of glass bottles, and many of the city\'s craftsmen left Italy to set up glassworks throughout Europe.',
      },
      {
        text: 'A major milestone in the history of glass occurred with the invention of lead crystal glass by the English glass manufacturer George Ravenscroft (1632 - 1683). He attempted to counter the effect of clouding that sometimes occurred in blown glass by introducing lead to the raw materials used in the process. The new glass he created was softer and easier to decorate, and had a higher refractive index, adding to its brilliance and beauty, and it proved invaluable to the optical industry. It is thanks to Ravenscroft\'s invention that optical lenses, astronomical telescopes, microscopes and the like became possible.',
      },
      {
        text: 'In Britain, the modern glass industry only really started to develop after the repeal of the Excise Act in 1845. Before that time, heavy taxes had been placed on the amount of glass melted in a glasshouse, and were levied continuously from 1745 to 1845. Joseph Paxton\'s Crystal Palace at London\'s Great Exhibition of 1851 marked the beginning of glass as a material used in the building industry. This revolutionary new building encouraged the use of glass in public, domestic and horticultural architecture. Glass manufacturing techniques also improved with the advancement of science and the development of better technology.',
      },
      {
        text: 'From 1887 onwards, glass making developed from traditional mouth-blowing to a semi-automatic process, after factory-owner HM Ashley introduced a machine capable of producing 200 bottles per hour in Castleford, Yorkshire, England - more than three times quicker than any previous production method. Then in 1907, the first fully automated machine was developed in the USA by Michael Owens - founder of the Owens Bottle Machine Company (later the major manufacturers Owens-Illinois) - and installed in its factory. Owens\' invention could produce an impressive 2,500 bottles per hour. Other developments followed rapidly, but it was not until the First World War when Britain became cut off from essential glass suppliers, that glass became part of the scientific sector. Previous to this, glass had been seen as a craft rather than a precise science.',
      },
      {
        text: 'Today, glass making is big business. It has become a modern, hi-tech industry operating in a fiercely competitive global market where quality, design and service levels are critical to maintaining market share. Modern glass plants are capable of making millions of glass containers a day in many different colours, with green, brown and clear remaining the most popular. Few of us can imagine modern life without glass. It features in almost every aspect of our lives - in our homes, our cars and whenever we sit down to eat or drink. Glass packaging is used for many products, many beverages are sold in glass, as are numerous foodstuffs, as well as medicines and cosmetics.',
      },
      {
        text: 'Glass is an ideal material for recycling, and with growing consumer concern for green issues, glass bottles and jars are becoming ever more popular. Glass recycling is good news for the environment. It saves used glass containers being sent to landfill. As less energy is needed to melt recycled glass than to melt down raw materials, this also saves fuel and production costs. Recycling also reduces the need for raw materials to be quarried, thus saving precious resources.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 1–8',
        instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        notesTitle: 'The History of Glass',
        notePassage: CAM12_T8_GLASS_NOTE_PASSAGE,
        questions: gapQuestions(1, [
          { prompt: 'Gap (1)', answer: 'obsidian', explanation: 'Natural glass obsidian dùng làm đầu nhọn giáo.' },
          { prompt: 'Gap (2)', answer: 'spears', explanation: 'Obsidian làm tips for spears.' },
          { prompt: 'Gap (3)', answer: 'beads', explanation: 'Glazes phủ stone beads từ 4000 BC.' },
          { prompt: 'Gap (4)', answer: 'impurities', explanation: 'Kính màu do tạp chất nguyên liệu thô.' },
          { prompt: 'Gap (5)', answer: 'Romans', explanation: 'Chỉ người La Mã giữ bí mật cho đến 476 AD.' },
          { prompt: 'Gap (6)', answer: 'lead', explanation: 'Ravenscroft thêm lead vào nguyên liệu.' },
          { prompt: 'Gap (7)', answer: 'clouding', explanation: 'Lead chống hiện tượng clouding.' },
          { prompt: 'Gap (8)', answer: 'taxes', explanation: 'Bãi bỏ thuế Excise Act 1845.' },
        ]),
      },
      {
        range: 'Questions 9–13',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.',
        type: 'tfng',
        questions: [
          { number: 9, type: 'true-false-not-given', prompt: 'In 1887, HM Ashley had the fastest bottle-producing machine that existed at the time.', options: TFNG_OPTIONS, answer: 'true', explanation: '200 chai/giờ — nhanh hơn 3 lần mọi phương pháp trước.' },
          { number: 10, type: 'true-false-not-given', prompt: 'Michael Owens was hired by a large US company to design a fully-automated bottle manufacturing machine for them.', options: TFNG_OPTIONS, answer: 'false', explanation: 'Owens tự sáng lập Owens Bottle Machine Company.' },
          { number: 11, type: 'true-false-not-given', prompt: 'Nowadays, most glass is produced by large international manufacturers.', options: TFNG_OPTIONS, answer: 'not-given', explanation: 'Passage nói ngành cạnh tranh toàn cầu — không nói ai sản xuất phần lớn.' },
          { number: 12, type: 'true-false-not-given', prompt: 'Concern for the environment is leading to an increased demand for glass containers.', options: TFNG_OPTIONS, answer: 'true', explanation: 'Growing consumer concern for green issues — chai lọ kính phổ biến hơn.' },
          { number: 13, type: 'true-false-not-given', prompt: 'It is more expensive to produce recycled glass than to manufacture new glass.', options: TFNG_OPTIONS, answer: 'false', explanation: 'Ít năng lượng hơn — tiết kiệm chi phí sản xuất.' },
        ],
      },
    ],
  }
}

/** Cam10 T4 — notes Q1–6 (notePassage) + TFNG Q7–13 */
export function ieltsReadingP1NotesTfngPart(): ReadingImportPartJson {
  const base = MOCK.parts[0]

  return {
    ...partToImportJson(base),
    passageTitle: 'The megafires of California',
    passageSubtitle: 'Drought, housing expansion, and oversupply of tinder make for bigger, hotter fires in the western United States.',
    questionGroups: [
      {
        range: 'Questions 1–6',
        instruction: 'Complete the notes below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.',
        type: 'gap-fill',
        notesTitle: 'Wildfires',
        notePassage: CAM10_T4_WILDFIRES_NOTE_PASSAGE,
        questions: gapQuestions(1, [
          { prompt: 'Gap (1)', answer: 'spread', explanation: 'Cháy lan không ổn định hơn (spread more erratically).' },
          { prompt: 'Gap (2)', answer: '10 times|ten times', explanation: 'Megafire gấp 10 lần cháy rừng trung bình 20 năm trước.' },
          { prompt: 'Gap (3)', answer: 'below', explanation: 'Lượng mưa dưới mức bình thường.' },
          { prompt: 'Gap (4)', answer: 'fuel', explanation: 'Underbrush là nhiên liệu chính.' },
          { prompt: 'Gap (5)', answer: 'seasons', explanation: 'Mùa cháy dài hơn 78 ngày.' },
          { prompt: 'Gap (6)', answer: 'homes', explanation: 'Xây nhà trong vùng dễ cháy.' },
        ]),
      },
      {
        range: 'Questions 7–13',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.',
        type: 'tfng',
        questions: [
          { number: 7, type: 'true-false-not-given', prompt: 'The amount of open space in California has diminished over the last ten years.', options: TFNG_OPTIONS, answer: 'true', explanation: 'Đất trống thành nhà ở — tăng >600.000/người/năm.' },
          { number: 8, type: 'true-false-not-given', prompt: 'Many experts believe California has made little progress in readying itself to fight fires.', options: TFNG_OPTIONS, answer: 'false', explanation: 'Nhiều chuyên gia đánh giá cao tiến bộ chuẩn bị.' },
          { number: 9, type: 'true-false-not-given', prompt: 'Personnel in the past have been criticised for mishandling fire containment.', options: TFNG_OPTIONS, answer: 'true', explanation: 'Từng bị chỉ trích vì để cháy lan.' },
          { number: 10, type: 'true-false-not-given', prompt: 'California has replaced a range of firefighting tools.', options: TFNG_OPTIONS, answer: 'true', explanation: 'Cung cấp máy, xe, trực thăng mới hơn.' },
          { number: 11, type: 'true-false-not-given', prompt: 'More firefighters have been hired to improve fire-fighting capacity.', options: TFNG_OPTIONS, answer: 'not-given', explanation: 'Tăng ngân sách — không nói tuyển thêm lính cứu hỏa.' },
          { number: 12, type: 'true-false-not-given', prompt: 'Citizens and government groups disapprove of the efforts of different states and agencies working together.', options: TFNG_OPTIONS, answer: 'false', explanation: 'Phối hợp liên bang hiệu quả hơn trước.' },
          { number: 13, type: 'true-false-not-given', prompt: 'Randy Jacobs believes that loss of life from fires will continue at the same levels, despite changes made.', options: TFNG_OPTIONS, answer: 'false', explanation: 'Ông tin sẽ không còn mất mạng như trước.' },
        ],
      },
    ],
  }
}

/** Cam13 T1 — bảng NZ website Q1–7 (2 cột × 5 hàng, không merge) */
export const CAM13_T1_NZ_WEBSITE_TABLE: ReadingNoteTable = {
  headers: ['Section of website', 'Comments'],
  gapNumbers: [1, 2, 3, 4, 5, 6, 7],
  rows: [
    {
      cells: [
        [{ type: 'static', text: 'Database of tourism services' }],
        [
          { type: 'static', text: '• easy for tourism-related businesses to get on the list' },
          { type: 'break' },
          { type: 'static', text: '• allowed businesses to ' },
          { type: 'gap', number: 1 },
          { type: 'static', text: ' information regularly' },
          { type: 'break' },
          { type: 'static', text: '• provided a country-wide evaluation of businesses, including their impact on the ' },
          { type: 'gap', number: 2 },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'Special features on local topics' }],
        [
          { type: 'static', text: '• e.g. an interview with a former sports ' },
          { type: 'gap', number: 3 },
          { type: 'static', text: ', and an interactive tour of various locations used in ' },
          { type: 'gap', number: 4 },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'Information on driving routes' }],
        [
          { type: 'static', text: '• varied depending on the ' },
          { type: 'gap', number: 5 },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'Travel Planner' }],
        [
          { type: 'static', text: '• included a map showing selected places, details of public transport and local ' },
          { type: 'gap', number: 6 },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: "'Your Words'" }],
        [
          { type: 'static', text: '• travelers could send a link to their ' },
          { type: 'gap', number: 7 },
        ],
      ],
    },
  ],
}

/** Cam13 T4 — bảng Coconut palm Q1–8 (3 cột, merge dọc "fruits") — mẫu r1tt */
export const R1TT_MERGE_TABLE_SAMPLE: ReadingNoteTable = {
  title: 'THE COCONUT PALM',
  headers: ['Part', 'Description', 'Uses'],
  gapNumbers: [1, 2, 3, 4, 5, 6, 7, 8],
  rows: [
    {
      cells: [
        [{ type: 'static', text: 'trunk' }],
        [{ type: 'static', text: 'up to 30 metres' }],
        [
          { type: 'static', text: 'timber for houses and the making of ' },
          { type: 'gap', number: 1 },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'trunk' }],
        [{ type: 'static', text: 'up to 6 metres long' }],
        [{ type: 'static', text: 'to make brushes' }],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'flowers' }],
        [{ type: 'static', text: 'at the top of the trunk' }],
        [
          { type: 'static', text: 'stems provide sap, used as a drink or a source of ' },
          { type: 'gap', number: 2 },
        ],
      ],
    },
    {
      cells: [
        { rowSpan: 5, blocks: [{ type: 'static', text: 'fruits' }] },
        [{ type: 'static', text: 'Outer layers' }],
        [],
      ],
    },
    {
      cells: [
        { skip: true },
        [{ type: 'static', text: 'middle layer (coir fibres)' }],
        [
          { type: 'static', text: 'used for ' },
          { type: 'gap', number: 3 },
        ],
      ],
    },
    {
      cells: [
        { skip: true },
        [{ type: 'static', text: 'Inner layer (shell)' }],
        [
          { type: 'static', text: 'a source of ' },
          { type: 'gap', number: 4 },
          { type: 'static', text: ' (when halved) for ' },
          { type: 'gap', number: 5 },
        ],
      ],
    },
    {
      cells: [
        { skip: true },
        [{ type: 'static', text: 'coconut water' }],
        [
          { type: 'static', text: 'a drink a source of ' },
          { type: 'gap', number: 6 },
          { type: 'static', text: ' for other plants' },
        ],
      ],
    },
    {
      cells: [
        { skip: true },
        [{ type: 'static', text: 'coconut flesh' }],
        [
          { type: 'static', text: 'oil and milk for cooking and ' },
          { type: 'gap', number: 7 },
          { type: 'static', text: ' glycerine (an ingredient in ' },
          { type: 'gap', number: 8 },
          { type: 'static', text: ' )' },
        ],
      ],
    },
  ],
}

/** Cam nutmeg — notes Q1–4 (r1n8 style) */
export const CAM_NUTMEG_NOTE_PASSAGE: ReadingNotePassageBlock[] = [
  { type: 'static', text: '• the leaves of the tree are ' },
  { type: 'gap', number: 1 },
  { type: 'static', text: ' in shape' },
  { type: 'static', text: '• the ' },
  { type: 'gap', number: 2 },
  { type: 'static', text: ' surrounds the fruit and breaks open when the fruit is ripe' },
  { type: 'static', text: '• the ' },
  { type: 'gap', number: 3 },
  { type: 'static', text: ' is used to produce the spice nutmeg' },
  { type: 'static', text: '• the covering known as the aril is used to produce ' },
  { type: 'gap', number: 4 },
  { type: 'static', text: '• the tree has yellow flowers and fruit' },
]

/** Timeline table Q8–13 — 2 cột Period|Events; merge dọc 17th century + Late 18th century (như r1tt) */
export const CAM_NUTMEG_HISTORY_TABLE: ReadingNoteTable = {
  headers: ['Period', 'Events'],
  gapNumbers: [8, 9, 10, 11, 12, 13],
  rows: [
    {
      cells: [
        [{ type: 'static', text: 'Middle Ages' }],
        [
          { type: 'static', text: 'Nutmeg was brought to Europe by the ' },
          { type: 'gap', number: 8 },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: '16th century' }],
        [{ type: 'static', text: 'European nations took control of the nutmeg trade' }],
      ],
    },
    // 17th century — 6 dòng (rowSpan 6)
    {
      cells: [
        { rowSpan: 6, blocks: [{ type: 'static', text: '17th century' }] },
        [
          { type: 'static', text: 'Demand for nutmeg grew, as it was believed to be effective against the disease known as the ' },
          { type: 'gap', number: 9 },
        ],
      ],
    },
    {
      cells: [
        { skip: true },
        [{ type: 'static', text: 'The Dutch' }],
      ],
    },
    {
      cells: [
        { skip: true },
        [{ type: 'static', text: '– took control of the Banda Islands' }],
      ],
    },
    {
      cells: [
        { skip: true },
        [{ type: 'static', text: '– restricted nutmeg production to a few areas' }],
      ],
    },
    {
      cells: [
        { skip: true },
        [
          { type: 'static', text: '– put ' },
          { type: 'gap', number: 10 },
          { type: 'static', text: ' on nutmeg to avoid it being cultivated outside the islands' },
        ],
      ],
    },
    {
      cells: [
        { skip: true },
        [
          { type: 'static', text: '– finally obtained the island of ' },
          { type: 'gap', number: 11 },
          { type: 'static', text: ' from the British' },
        ],
      ],
    },
    // Late 18th century — 2 dòng (rowSpan 2)
    {
      cells: [
        { rowSpan: 2, blocks: [{ type: 'static', text: 'Late 18th century' }] },
        [
          { type: 'static', text: '1770 – nutmeg plants were secretly taken to ' },
          { type: 'gap', number: 12 },
        ],
      ],
    },
    {
      cells: [
        { skip: true },
        [
          { type: 'static', text: '1778 – half the Banda Islands\' nutmeg plantations were destroyed by a ' },
          { type: 'gap', number: 13 },
        ],
      ],
    },
  ],
}

/**
 * Cam17 T4 P1 — Rocha “Bats to the rescue” table Q7–13
 * (Teamplate_Part1_10 / engnovate full wording)
 */
export const CAM_ROCHA_BAT_TABLE: ReadingNoteTable = {
  title: 'The study carried out by Rocha\'s team',
  headers: ['Section', 'Details'],
  gapNumbers: [7, 8, 9, 10, 11, 12, 13],
  rows: [
    {
      cells: [
        [{ type: 'static', text: 'Aim' }],
        [{ type: 'static', text: '• to investigate the feeding habits of bats in farmland near the Ranomafana National Park' }],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'Method' }],
        [
          { type: 'static', text: '• ultrasonic recording to identify favourite feeding spots' },
          { type: 'break' },
          { type: 'static', text: '• DNA analysis of bat ' },
          { type: 'gap', number: 7 },
        ],
      ],
    },
    {
      cells: [
        { rowSpan: 8, blocks: [{ type: 'static', text: 'Findings' }] },
        [{ type: 'static', text: 'the bats' }],
      ],
    },
    {
      cells: [
        { skip: true },
        [{ type: 'static', text: '– were most active in rice fields located on hills' }],
      ],
    },
    {
      cells: [
        { skip: true },
        [
          { type: 'static', text: '– ate pests of rice, ' },
          { type: 'gap', number: 8 },
          { type: 'static', text: ', sugarcane, nuts and fruit' },
        ],
      ],
    },
    {
      cells: [
        { skip: true },
        [
          { type: 'static', text: '– prevent the spread of disease by eating ' },
          { type: 'gap', number: 9 },
          { type: 'static', text: ' and blackflies' },
        ],
      ],
    },
    {
      cells: [
        { skip: true },
        [{ type: 'static', text: '• local attitudes to bats are mixed:' }],
      ],
    },
    {
      cells: [
        { skip: true },
        [
          { type: 'static', text: '– they provide food rich in ' },
          { type: 'gap', number: 10 },
        ],
      ],
    },
    {
      cells: [
        { skip: true },
        [
          { type: 'static', text: '– the buildings where they roost become ' },
          { type: 'gap', number: 11 },
        ],
      ],
    },
    {
      cells: [
        { skip: true },
        [
          { type: 'static', text: '– they play an important role in local ' },
          { type: 'gap', number: 12 },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'Recommendation' }],
        [
          { type: 'static', text: '• farmers should provide special ' },
          { type: 'gap', number: 13 },
          { type: 'static', text: ' to support the bat population' },
        ],
      ],
    },
  ],
}

/** Huarango — notes Q1–5 */
export const CAM_HUARANGO_NOTE_PASSAGE: ReadingNotePassageBlock[] = [
  { type: 'static', text: '• Its roots can extend as far as 80 metres into the soil' },
  { type: 'static', text: '• Can access ' },
  { type: 'gap', number: 1 },
  { type: 'static', text: ' deep below the surface' },
  { type: 'static', text: '• Was a crucial part of local inhabitants\' ' },
  { type: 'gap', number: 2 },
  { type: 'static', text: ' a long time ago' },
  { type: 'static', text: '• Helped people to survive periods of ' },
  { type: 'gap', number: 3 },
  { type: 'static', text: '• Prevents ' },
  { type: 'gap', number: 4 },
  { type: 'static', text: ' of the soil' },
  { type: 'static', text: '• Prevents land from becoming a ' },
  { type: 'gap', number: 5 },
]

/** Huarango — table Q6–8 (Part of tree | Traditional use) */
export const CAM_HUARANGO_USES_TABLE: ReadingNoteTable = {
  title: 'Traditional uses of the huarango tree',
  headers: ['Part of tree', 'Traditional use'],
  gapNumbers: [6, 7, 8],
  rows: [
    {
      cells: [
        [{ type: 'gap', number: 6 }],
        [{ type: 'static', text: 'fuel' }],
      ],
    },
    {
      cells: [
        [
          { type: 'static', text: 'leaves and ' },
          { type: 'gap', number: 7 },
        ],
        [{ type: 'static', text: 'Medicine' }],
      ],
    },
    {
      cells: [
        [{ type: 'gap', number: 8 }],
        [{ type: 'static', text: 'construction' }],
      ],
    },
  ],
}

/**
 * r1ntf — Notes Q1–5 + Table Q6–8 + TFNG Q9–13
 * Preview: Teamplate_Part1_10.jpg (Huarango tree)
 */
export function ieltsReadingP1NotesTableTfngPart(): ReadingImportPartJson {
  return {
    partNumber: 1,
    rangeLabel: 'Read the text and answer questions 1–13.',
    passageTitle: 'The huarango tree',
    passageSubtitle: 'A desert tree that supports people and the land',
    passage: [
      {
        text: 'The huarango is a remarkable desert tree. Its roots can extend as far as 80 metres into the soil and can access water deep below the surface. It was a crucial part of local inhabitants\' diet a long time ago and helped people to survive periods of drought. The tree prevents erosion of the soil and prevents land from becoming a desert.',
      },
      {
        text: 'Traditional uses of the huarango are still remembered. Wood provides fuel. Leaves and bark are used for medicine. Timber is used in construction. Local families have told Whaley about some traditional uses of huarango products, and researchers continue to document how the species supports both communities and fragile desert ecosystems.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 1–5',
        instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        notesTitle: 'The importance of the huarango tree',
        notePassage: CAM_HUARANGO_NOTE_PASSAGE,
        questions: gapQuestions(1, [
          { prompt: 'Gap (1)', answer: 'water', explanation: 'Can access water deep below the surface.' },
          { prompt: 'Gap (2)', answer: 'diet', explanation: 'crucial part of local inhabitants\' diet.' },
          { prompt: 'Gap (3)', answer: 'drought', explanation: 'survive periods of drought.' },
          { prompt: 'Gap (4)', answer: 'erosion', explanation: 'Prevents erosion of the soil.' },
          { prompt: 'Gap (5)', answer: 'desert', explanation: 'Prevents land from becoming a desert.' },
        ]),
      },
      {
        range: 'Questions 6–8',
        instruction: 'Complete the table below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        noteTable: CAM_HUARANGO_USES_TABLE,
        questions: gapQuestions(6, [
          { prompt: 'Gap (6)', answer: 'wood', explanation: 'Wood … fuel.' },
          { prompt: 'Gap (7)', answer: 'bark', explanation: 'leaves and bark … medicine.' },
          { prompt: 'Gap (8)', answer: 'timber', explanation: 'Timber … construction.' },
        ]),
      },
      {
        range: 'Questions 9–13',
        instruction: 'Do the following statements agree with the information given in the Reading Passage? In boxes 9–13 on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        type: 'tfng',
        questions: [
          {
            number: 9,
            type: 'true-false-not-given',
            prompt: 'Local families have told Whaley about some traditional uses of huarango products.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'Local families have told Whaley about traditional uses.',
          },
          {
            number: 10,
            type: 'true-false-not-given',
            prompt: 'The huarango\'s roots never grow deeper than 20 metres.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Roots can extend as far as 80 metres.',
          },
          {
            number: 11,
            type: 'true-false-not-given',
            prompt: 'Huarango wood is mainly exported to other countries today.',
            options: [...TFNG_OPTIONS],
            answer: 'not given',
            explanation: 'Passage không nói export gỗ huarango.',
          },
          {
            number: 12,
            type: 'true-false-not-given',
            prompt: 'The tree helps stop land turning into desert.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'Prevents land from becoming a desert.',
          },
          {
            number: 13,
            type: 'true-false-not-given',
            prompt: 'Bark is used only for fuel, not for medicine.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Leaves and bark used for medicine; wood for fuel.',
          },
        ],
      },
    ],
  }
}

/**
 * r1nt — Notes Q1–4 (notePassage như r1n8) + TFNG Q5–7 + Table Q8–13 (noteTable merge như r1tt)
 * Preview: Teamplate_Part1_9.jpg (Nutmeg)
 */
export function ieltsReadingP1NotesTfngTablePart(): ReadingImportPartJson {
  return {
    partNumber: 1,
    rangeLabel: 'Read the text and answer questions 1–13.',
    passageTitle: 'The story of nutmeg',
    passageSubtitle: 'How a tropical spice shaped trade and empire',
    passage: [
      {
        text: 'The nutmeg tree is a tropical evergreen. Its leaves are oval in shape. A husk surrounds the fruit and breaks open when the fruit is ripe. The seed is used to produce the spice nutmeg, while the covering known as the aril is used to produce mace. The tree has yellow flowers and fruit.',
      },
      {
        text: 'In the Middle Ages, most Europeans did not know where nutmeg was grown. The spice was brought to Europe by the Arabs. In the 16th century European nations took control of the nutmeg trade. Demand for nutmeg grew in the 17th century, as it was believed to be effective against the disease known as the plague. The Dutch took control of the Banda Islands, restricted nutmeg production to a few areas, put lime on nutmeg to avoid it being cultivated outside the islands, and finally obtained the island of Run from the British.',
      },
      {
        text: 'In the late 18th century, in 1770, nutmeg plants were secretly taken to Mauritius. In 1778 half the Banda Islands\' nutmeg plantations were destroyed by a tsunami. Over time cultivation spread and the spice became more widely available.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 1–4',
        instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        notesTitle: 'The nutmeg tree and fruit',
        notePassage: CAM_NUTMEG_NOTE_PASSAGE,
        questions: gapQuestions(1, [
          { prompt: 'Gap (1)', answer: 'oval', explanation: 'leaves … oval in shape.' },
          { prompt: 'Gap (2)', answer: 'husk', explanation: 'A husk surrounds the fruit…' },
          { prompt: 'Gap (3)', answer: 'seed', explanation: 'The seed is used to produce the spice nutmeg.' },
          { prompt: 'Gap (4)', answer: 'mace', explanation: 'the aril is used to produce mace.' },
        ]),
      },
      {
        range: 'Questions 5–7',
        instruction: 'Do the following statements agree with the information given in the Reading Passage? In boxes 5–7 on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        type: 'tfng',
        questions: [
          {
            number: 5,
            type: 'true-false-not-given',
            prompt: 'In the Middle Ages, most Europeans knew where nutmeg was grown.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Most Europeans did not know where nutmeg was grown.',
          },
          {
            number: 6,
            type: 'true-false-not-given',
            prompt: 'The Dutch restricted nutmeg production to a few areas in the Banda Islands.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'The Dutch … restricted nutmeg production to a few areas.',
          },
          {
            number: 7,
            type: 'true-false-not-given',
            prompt: 'Nutmeg plants were first taken to Mauritius by the British government.',
            options: [...TFNG_OPTIONS],
            answer: 'not given',
            explanation: 'Passage says plants were secretly taken — không nói British government.',
          },
        ],
      },
      {
        range: 'Questions 8–13',
        instruction: 'Complete the table below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        noteTable: CAM_NUTMEG_HISTORY_TABLE,
        questions: gapQuestions(8, [
          { prompt: 'Gap (8)', answer: 'Arabs', explanation: 'brought to Europe by the Arabs.' },
          { prompt: 'Gap (9)', answer: 'plague', explanation: 'disease known as the plague.' },
          { prompt: 'Gap (10)', answer: 'lime', explanation: 'put lime on nutmeg…' },
          { prompt: 'Gap (11)', answer: 'Run', explanation: 'island of Run from the British.' },
          { prompt: 'Gap (12)', answer: 'Mauritius', explanation: 'secretly taken to Mauritius.' },
          { prompt: 'Gap (13)', answer: 'tsunami', explanation: 'destroyed by a tsunami.' },
        ]),
      },
    ],
  }
}

/** Aeroponic urban farming — table Q4–7 (4 cột) — Teamplate_Part1_11.jpg */
export const CAM_AEROPONIC_FARMING_TABLE: ReadingNoteTable = {
  title: 'Intensive farming versus aeroponic urban farming',
  // Cột 1 header trống trên đề giấy — normalize PHẢI giữ '' (không filter bỏ)
  headers: ['', 'Growth', 'Selection', 'Sale'],
  gapNumbers: [4, 5, 6, 7],
  rows: [
    {
      cells: [
        [{ type: 'static', text: 'Intensive farming' }],
        [
          { type: 'static', text: '• wide range of ' },
          { type: 'gap', number: 4 },
          { type: 'static', text: ' used' },
          { type: 'break' },
          { type: 'static', text: '• techniques pollute air' },
        ],
        [
          { type: 'static', text: '• quality not good' },
          { type: 'break' },
          { type: 'static', text: '• varieties of fruit and vegetables chosen that can survive long ' },
          { type: 'gap', number: 5 },
        ],
        [
          { type: 'static', text: '• ' },
          { type: 'gap', number: 6 },
          { type: 'static', text: ' receive very little of overall income' },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'Aeroponic urban farming' }],
        [
          { type: 'static', text: '• no soil used' },
          { type: 'break' },
          { type: 'static', text: '• nutrients added to water, which is recycled' },
        ],
        [
          { type: 'static', text: '• produce chosen because of its ' },
          { type: 'gap', number: 7 },
        ],
        [],
      ],
    },
  ],
}

const CAM_WOOD_BUILDINGS_SUMMARY_NOTE = [
  'Making buildings with wood',
  '',
  'Wood is a traditional building material, but current environmental concerns are encouraging 5________ to use wood in modern construction projects. Using wood, however, has its challenges. For example, as 6________ in the atmosphere enters wood, it increases in size. In addition, wood is prone to pests and the risk of fire is greater. However, wood can be turned into a better construction material if it is treated and combined with other materials. In one process, 7________ of solid wood are glued together to create building blocks. These blocks are lighter than concrete and steel but equal them in strength. Experts say that wooden buildings are an improvement on those made of concrete and steel in terms of the 8________ with which they can be constructed and how much noise is generated by the process.',
].join('\n')

const CAM_WOOD_BUILDINGS_FEATURES = [
  { id: 'a', name: 'Chris Cheeseman' },
  { id: 'b', name: 'Markus Mannstrom' },
  { id: 'c', name: 'Anna Surgenor' },
  { id: 'd', name: 'Felix Preston and Johanna Lehne' },
]

const CAM_GREEN_ROOFS_SUMMARY_NOTE = [
  'Advantages of green roofs',
  '',
  'City rooftops covered with greenery have many advantages. These include lessening the likelihood that floods will occur, reducing how much money is spent on 6________ and creating environments that are suitable for wildlife. In many cases, they can also be used for producing 7________.',
  '',
  'There are also social benefits of green roofs. For example, the medical profession recommends 8________ as an activity to help people cope with mental health issues. Studies have also shown that the availability of green spaces can prevent physical problems such as 9________.',
].join('\n')

const CAM_GREEN_ROOFS_CHOOSE_TWO_OPTS = [
  { id: 'a', label: 'a longer growing season for edible produce' },
  { id: 'b', label: 'more economical use of water' },
  { id: 'c', label: 'greater water-storage capacity' },
  { id: 'd', label: 'ability to cultivate more plant types' },
  { id: 'e', label: 'a large surface area for growing plants' },
]

/**
 * r1ms2 — Match đoạn Q1–5 + Summary Q6–9 + Choose TWO Q10–11 (+ MC Q12–13)
 * Preview: Teamplate_Part1_13.jpg (Green roofs)
 */
export function ieltsReadingP1MatchSummaryChooseTwoPart(): ReadingImportPartJson {
  return {
    partNumber: 1,
    rangeLabel: 'Read the text and answer questions 1–13.',
    passageTitle: 'Green roofs',
    passageSubtitle: 'Growing cities upwards with rooftop greenery',
    passage: [
      {
        label: 'A',
        text: 'Before a green roof can be installed, several challenges must be overcome: structural load limits, waterproofing, drainage design, and access for maintenance. Planners also need to check local building codes and insurance requirements.',
      },
      {
        label: 'B',
        text: 'In Stuttgart, green roofs have been promoted for many years as part of city policy. Officials point to a long record of projects that cool urban heat islands and absorb rainfall.',
      },
      {
        label: 'C',
        text: 'Existing green roofs in the city serve as a model for new developments. Newer buildings used for green roofs can offer a longer growing season for edible produce, more economical use of water, and greater water-storage capacity than older flat roofs. They also allow a wider range of plant types and a large surface area for growing plants.',
      },
      {
        label: 'D',
        text: 'Green roofs work in combination with other initiatives such as permeable pavements, street trees and rain gardens. Together these measures form a network of green infrastructure rather than isolated showpieces.',
      },
      {
        label: 'E',
        text: 'For many developers the most persuasive argument is financial: lower cooling costs, longer roof life and reduced storm-water fees. City rooftops covered with greenery can lessen flood risk, cut money spent on energy, create wildlife habitat and produce food. Doctors often recommend gardening for mental health, and green spaces can help prevent obesity and other physical problems.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 1–5',
        instruction: 'Reading Passage 1 has sections A–E. Which section contains the following information? Write the correct letter, A–E, in boxes 1–5 on your answer sheet.',
        note: 'NB You may use any letter more than once.',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E'],
        questions: [
          {
            number: 1,
            type: 'matching-paragraph',
            prompt: 'Mention of several challenges to be overcome before a green roof can be installed',
            options: [],
            answer: 'a',
            explanation: 'Section A — challenges before installation.',
          },
          {
            number: 2,
            type: 'matching-paragraph',
            prompt: 'a city where green roofs have been promoted for many years',
            options: [],
            answer: 'b',
            explanation: 'Section B — Stuttgart promoted for many years.',
          },
          {
            number: 3,
            type: 'matching-paragraph',
            prompt: 'existing green roofs as a model',
            options: [],
            answer: 'c',
            explanation: 'Section C — existing green roofs as a model.',
          },
          {
            number: 4,
            type: 'matching-paragraph',
            prompt: 'work in combination with other initiatives',
            options: [],
            answer: 'd',
            explanation: 'Section D — combination with other initiatives.',
          },
          {
            number: 5,
            type: 'matching-paragraph',
            prompt: 'financial benefits as a persuasive argument',
            options: [],
            answer: 'e',
            explanation: 'Section E — most persuasive argument is financial.',
          },
        ],
      },
      {
        range: 'Questions 6–9',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        note: CAM_GREEN_ROOFS_SUMMARY_NOTE,
        questions: gapQuestions(6, [
          { prompt: 'Gap (6)', answer: 'energy', explanation: 'money spent on energy (cooling/heating).' },
          { prompt: 'Gap (7)', answer: 'food', explanation: 'used for producing food.' },
          { prompt: 'Gap (8)', answer: 'gardening', explanation: 'recommends gardening as an activity.' },
          { prompt: 'Gap (9)', answer: 'obesity', explanation: 'physical problems such as obesity.' },
        ]),
      },
      {
        range: 'Questions 10–11',
        instruction: 'Choose TWO correct answers, A–E.',
        type: 'multiple-choice',
        questions: [
          {
            number: 10,
            type: 'multiple-choice',
            prompt: 'Which TWO advantages of using newer buildings for green roofs are mentioned in Paragraph C of the passage? (first answer)',
            options: CAM_GREEN_ROOFS_CHOOSE_TWO_OPTS,
            answer: 'a',
            explanation: 'A — longer growing season for edible produce (SAMPLE pair; adjust to key).',
          },
          {
            number: 11,
            type: 'multiple-choice',
            prompt: 'Which TWO advantages of using newer buildings for green roofs are mentioned in Paragraph C of the passage? (second answer)',
            options: CAM_GREEN_ROOFS_CHOOSE_TWO_OPTS,
            answer: 'c',
            explanation: 'C — greater water-storage capacity (SAMPLE pair).',
          },
        ],
      },
      {
        range: 'Questions 12–13',
        instruction: 'Choose the correct letter, A, B, C or D.',
        type: 'multiple-choice',
        questions: [
          {
            number: 12,
            type: 'multiple-choice',
            prompt: 'According to the passage, green roofs can help cities by',
            options: [
              { id: 'a', label: 'removing the need for waterproofing.' },
              { id: 'b', label: 'reducing flood risk and energy costs.' },
              { id: 'c', label: 'replacing all street trees.' },
              { id: 'd', label: 'increasing storm-water fees.' },
            ],
            answer: 'b',
            explanation: 'B — lessen flood risk and cut money spent on energy.',
          },
          {
            number: 13,
            type: 'multiple-choice',
            prompt: 'What do medical professionals recommend in relation to green roofs?',
            options: [
              { id: 'a', label: 'Avoiding all outdoor activity.' },
              { id: 'b', label: 'Gardening to help with mental health.' },
              { id: 'c', label: 'Building only underground farms.' },
              { id: 'd', label: 'Using concrete roofs only.' },
            ],
            answer: 'b',
            explanation: 'B — gardening recommended for mental health.',
          },
        ],
      },
    ],
  }
}

/**
 * r1msf — Match đoạn Q1–4 + Summary ONE WORD Q5–8 + Features Q9–13
 * Preview: Teamplate_Part1_12.jpg (Making buildings with wood)
 */
export function ieltsReadingP1MatchSummaryFeaturesPart(): ReadingImportPartJson {
  return {
    partNumber: 1,
    rangeLabel: 'Read the text and answer questions 1–13.',
    passageTitle: 'Making buildings with wood',
    passageSubtitle: 'Why architects are looking again at timber high-rises',
    passage: [
      {
        label: 'A',
        text: 'Industrial processes such as steel-making and power generation create by-products that can become raw materials for concrete. Understanding those processes helps explain the supply chain behind conventional construction.',
      },
      {
        label: 'B',
        text: 'High-rise wooden buildings can already be found in several cities in Europe, North America and elsewhere, showing that multi-storey timber construction is no longer only experimental.',
      },
      {
        label: 'C',
        text: 'The raw materials of concrete — sand, gravel and cement components — are widely available in most regions, which has long favoured concrete over less ubiquitous materials.',
      },
      {
        label: 'D',
        text: 'Some specialists believe more high-rise wooden buildings must be completed before wood is widely regarded as a fully viable mainstream construction material for tall structures.',
      },
      {
        label: 'E',
        text: 'Environmental concerns are encouraging architects to use wood in modern projects. Moisture in the atmosphere can make wood expand; pests and fire remain risks. Engineered blocks made by gluing layers of solid wood can match concrete and steel in strength while remaining lighter.',
      },
      {
        label: 'F',
        text: 'Chris Cheeseman notes that the environmental advantage of some cement alternatives may not be as great as initially assumed. Markus Mannstrom argues it would be hard to create a construction alternative to concrete that offers so many comparable benefits.',
      },
      {
        label: 'G',
        text: 'Anna Surgenor points out that worries about the environment have led to increased interest in wood as a construction material. Felix Preston and Johanna Lehne link expense to the negative response to the development of new cements, and stress that environmental damage from concrete is tied to production at very large scale.',
      },
      {
        label: 'H',
        text: 'Experts also compare build speed and noise: wooden buildings can be an improvement on concrete and steel in terms of the speed with which they can be constructed and how much noise the process generates.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 1–4',
        instruction: 'Reading Passage 1 has sections A–H. Which section contains the following information? Write the correct letter, A–H, in boxes 1–4 on your answer sheet.',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        questions: [
          {
            number: 1,
            type: 'matching-paragraph',
            prompt: 'An explanation of the industrial processes that create potential raw materials for concrete',
            options: [],
            answer: 'a',
            explanation: 'Section A — industrial processes and raw materials for concrete.',
          },
          {
            number: 2,
            type: 'matching-paragraph',
            prompt: 'A reference to the various locations where high-rise wooden buildings can be found',
            options: [],
            answer: 'b',
            explanation: 'Section B — locations of high-rise wooden buildings.',
          },
          {
            number: 3,
            type: 'matching-paragraph',
            prompt: 'An indication of how widely available the raw materials of concrete are',
            options: [],
            answer: 'c',
            explanation: 'Section C — raw materials widely available.',
          },
          {
            number: 4,
            type: 'matching-paragraph',
            prompt: 'The belief that more high-rise wooden buildings are needed before wood can be regarded as a viable construction material',
            options: [],
            answer: 'd',
            explanation: 'Section D — more buildings needed before wood is regarded as viable.',
          },
        ],
      },
      {
        range: 'Questions 5–8',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        note: CAM_WOOD_BUILDINGS_SUMMARY_NOTE,
        questions: gapQuestions(5, [
          { prompt: 'Gap (5)', answer: 'architects', explanation: 'encouraging architects to use wood.' },
          { prompt: 'Gap (6)', answer: 'moisture', explanation: 'as moisture in the atmosphere enters wood.' },
          { prompt: 'Gap (7)', answer: 'layers', explanation: 'layers of solid wood are glued together.' },
          { prompt: 'Gap (8)', answer: 'speed', explanation: 'in terms of the speed with which they can be constructed.' },
        ]),
      },
      {
        range: 'Questions 9–13',
        instruction: 'Match each statement with the correct option, A–D. Write the correct letter in boxes 9–13 on your answer sheet.',
        note: 'NB You may use any letter more than once.',
        type: 'matching-features',
        features: CAM_WOOD_BUILDINGS_FEATURES,
        questions: [
          {
            number: 9,
            type: 'matching-features',
            prompt: 'The environmental advantage of cement alternatives may not be as great as initially assumed.',
            options: [],
            answer: 'a',
            explanation: 'Chris Cheeseman.',
          },
          {
            number: 10,
            type: 'matching-features',
            prompt: 'It would be hard to create a construction alternative to concrete that offers so many comparable benefits.',
            options: [],
            answer: 'b',
            explanation: 'Markus Mannstrom.',
          },
          {
            number: 11,
            type: 'matching-features',
            prompt: 'Worries about the environment have led to increased interest in wood as a construction material.',
            options: [],
            answer: 'c',
            explanation: 'Anna Surgenor.',
          },
          {
            number: 12,
            type: 'matching-features',
            prompt: 'Expense has been a factor in the negative response to the development of new cements.',
            options: [],
            answer: 'd',
            explanation: 'Felix Preston and Johanna Lehne.',
          },
          {
            number: 13,
            type: 'matching-features',
            prompt: 'The environmental damage caused by concrete is due to it being produced in large quantities.',
            options: [],
            answer: 'd',
            explanation: 'Felix Preston and Johanna Lehne — production at large scale.',
          },
        ],
      },
    ],
  }
}

/**
 * r1st — Sentence Q1–3 + Table Q4–7 + TFNG Q8–13
 * Preview: Teamplate_Part1_11.jpg (Aeroponic / intensive farming)
 */
export function ieltsReadingP1SentenceTableTfngPart(): ReadingImportPartJson {
  return {
    partNumber: 1,
    rangeLabel: 'Read the text and answer questions 1–13.',
    passageTitle: 'Crop-growing skyscrapers',
    passageSubtitle: 'Aeroponic urban farms and intensive agriculture',
    passage: [
      {
        text: 'Vertical tubes are used to grow strawberries, tomatoes and herbs without soil. Nutrients are added to water that is recycled in closed systems. Developers say there will eventually be a daily harvest of as much as 20 tonnes in weight of fruit and vegetables. It may be possible that the farm\'s produce will account for as much as 10% of the city\'s food overall.',
      },
      {
        text: 'Intensive farming uses a wide range of chemicals and techniques that pollute the air. Quality is often not good, and varieties are chosen that can survive long journeys. Farmers receive very little of overall income. By contrast, aeroponic urban farming uses no soil; produce is chosen because of its freshness.',
      },
      {
        text: 'Urban farming can take place above or below ground in multi-storey buildings. Some projects already supply restaurants in the same city block. Whether the model can scale city-wide remains under study.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 1–3',
        instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.',
        type: 'sentence-completion',
        questions: sentenceQuestions(1, [
          {
            prompt: 'Vertical tubes are used to grow strawberries, ___ and herbs.',
            answer: 'tomatoes',
            explanation: 'strawberries, tomatoes and herbs.',
          },
          {
            prompt: 'There will eventually be a daily harvest of as much as ___ in weight of fruit and vegetables.',
            answer: '20 tonnes',
            explanation: 'daily harvest of as much as 20 tonnes.',
          },
          {
            prompt: 'It may be possible that the farm\'s produce will account for as much as 10% of the city\'s ___ overall.',
            answer: 'food',
            explanation: '10% of the city\'s food overall.',
          },
        ]),
      },
      {
        range: 'Questions 4–7',
        instruction: 'Complete the table below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.',
        type: 'gap-fill',
        noteTable: CAM_AEROPONIC_FARMING_TABLE,
        questions: gapQuestions(4, [
          { prompt: 'Gap (4)', answer: 'chemicals', explanation: 'wide range of chemicals used.' },
          { prompt: 'Gap (5)', answer: 'journeys', explanation: 'survive long journeys.' },
          { prompt: 'Gap (6)', answer: 'farmers', explanation: 'farmers receive very little of overall income.' },
          { prompt: 'Gap (7)', answer: 'freshness', explanation: 'chosen because of its freshness.' },
        ]),
      },
      {
        range: 'Questions 8–13',
        instruction: 'Do the following statements agree with the information given in the Reading Passage? In boxes 8–13 on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        type: 'tfng',
        questions: [
          {
            number: 8,
            type: 'true-false-not-given',
            prompt: 'Urban farming can take place above or below ground.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'Passage says above or below ground.',
          },
          {
            number: 9,
            type: 'true-false-not-given',
            prompt: 'Aeroponic systems always use soil mixed with water.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'No soil used.',
          },
          {
            number: 10,
            type: 'true-false-not-given',
            prompt: 'Intensive farming techniques can pollute the air.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'techniques pollute air.',
          },
          {
            number: 11,
            type: 'true-false-not-given',
            prompt: 'Most city residents already buy aeroponic produce weekly.',
            options: [...TFNG_OPTIONS],
            answer: 'not-given',
            explanation: 'No information on how often residents buy.',
          },
          {
            number: 12,
            type: 'true-false-not-given',
            prompt: 'Farmers keep most of the income from intensive farming sales.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Farmers receive very little of overall income.',
          },
          {
            number: 13,
            type: 'true-false-not-given',
            prompt: 'Some urban farms already supply restaurants nearby.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'projects already supply restaurants in the same city block.',
          },
        ],
      },
    ],
  }
}

/**
 * r1tb — TFNG Q1–6 + table Q7–13 (noteTable n cột × m dòng, merge ô)
 * Preview: Teamplate_Part1_10.jpg (Rocha bat study)
 */
export function ieltsReadingP1TfngTablePart(): ReadingImportPartJson {
  return {
    partNumber: 1,
    rangeLabel: 'Read the text and answer questions 1–13.',
    passageTitle: 'Bats in Madagascar',
    passageSubtitle: 'How bats help farmers and ecosystems',
    passage: [
      {
        text: 'Madagascar is home to many species of bat. In farmland near Ranomafana National Park, researchers led by Rocha studied how bats feed on crop pests. The team used ultrasonic recording to find where bats hunted most often, and DNA analysis of bat droppings to identify what they ate.',
      },
      {
        text: 'The bats were most active in rice fields on hills. They consumed pests of rice, maize, sugarcane, nuts and fruit. By eating mosquitoes and blackflies, they also helped limit the spread of disease. Local people had mixed views: bat meat was valued as food rich in protein, but roosting sites could leave buildings damaged. Bats nonetheless played an important role in local agriculture.',
      },
      {
        text: 'Rocha\'s team recommended that farmers provide special shelters to support bat populations and reduce reliance on chemical pesticides.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 1–6',
        instruction: 'Do the following statements agree with the information given in the Reading Passage? In boxes 1–6 on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        type: 'tfng',
        questions: [
          {
            number: 1,
            type: 'true-false-not-given',
            prompt: 'Many Madagascan forests are being destroyed by attacks from insects.',
            options: [...TFNG_OPTIONS],
            answer: 'not-given',
            explanation: 'Passage nói farmland và bats — không nói rừng bị phá hoại bởi côn trùng.',
          },
          {
            number: 2,
            type: 'true-false-not-given',
            prompt: 'Rocha\'s team used ultrasound to locate where bats fed.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'Ultrasonic recording to find where bats hunted.',
          },
          {
            number: 3,
            type: 'true-false-not-given',
            prompt: 'The bats studied fed only on rice pests.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Họ ăn nhiều loại sâu bệnh: rice, maize, sugarcane, nuts, fruit.',
          },
          {
            number: 4,
            type: 'true-false-not-given',
            prompt: 'Bats were most frequently recorded in rice fields on hills.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'Most active in rice fields on hills.',
          },
          {
            number: 5,
            type: 'true-false-not-given',
            prompt: 'All local people welcomed bats roosting in their buildings.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Mixed views — roosting could damage buildings.',
          },
          {
            number: 6,
            type: 'true-false-not-given',
            prompt: 'The researchers suggested farmers build structures for bats.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'Recommended special shelters for bat populations.',
          },
        ],
      },
      {
        range: 'Questions 7–13',
        instruction: 'Complete the table below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        noteTable: CAM_ROCHA_BAT_TABLE,
        questions: gapQuestions(7, [
          { prompt: 'Gap (7)', answer: 'droppings', explanation: 'DNA analysis of bat droppings.' },
          { prompt: 'Gap (8)', answer: 'coffee', explanation: 'pests of rice, coffee, sugarcane… (black twig borer / coffee).' },
          { prompt: 'Gap (9)', answer: 'mosquitoes', explanation: 'eating mosquitoes and blackflies.' },
          { prompt: 'Gap (10)', answer: 'protein', explanation: 'food rich in protein.' },
          { prompt: 'Gap (11)', answer: 'unclean', explanation: 'buildings where they roost become unclean.' },
          { prompt: 'Gap (12)', answer: 'culture', explanation: 'important role in local culture.' },
          { prompt: 'Gap (13)', answer: 'houses', explanation: 'install bat houses.' },
        ]),
      },
    ],
  }
}

/** r1tt — table Q1–8 (có merge) + TFNG Q9–13; SAMPLE schema cho wizard AI */
export function ieltsReadingP1TableTfngPart(): ReadingImportPartJson {
  return {
    partNumber: 1,
    rangeLabel: 'Read the text and answer questions 1–13.',
    passageTitle: 'The coconut palm',
    passage: [
      {
        label: 'A',
        text: 'New Zealand is a small country of four million inhabitants, a long-haul flight from all the major tourist-generating markets of the world. Tourism currently makes up 9% of the country\'s gross domestic product and is the country\'s largest export sector. Unlike other export sectors, which make products and then sell them overseas, tourism brings its customers to New Zealand. The product is the country itself – the people, the places, and the experiences. In 1999, Tourism New Zealand launched a campaign to communicate a new brand position to the world. The campaign focused on New Zealand\'s scenic beauty, exhilarating outdoor activities and authentic Maori culture, and it made New Zealand one of the strongest national brands in the world.',
      },
      {
        label: 'B',
        text: 'A key feature of the campaign was the website www.newzealand.com, which provided potential visitors to New Zealand with a single gateway to everything the destination had to offer. The heart of the website was a database of tourism services operators, both those based in New Zealand and those based abroad which offered tourism service to the country. Any tourism-related business could be listed by filling in a simple form. This meant that even the smallest bed and breakfast address or specialist activity provider could gain a web presence with access to an audience of long-haul visitors. In addition, because participating businesses were able to update the details they gave on a regular basis, the information provided remained accurate. And to maintain and improve standards, Tourism New Zealand organised a scheme whereby organisations appearing on the website underwent an independent evaluation against a set of agreed national standards of quality. As part of this, the effect of each business on the environment was considered.',
      },
      {
        label: 'C',
        text: 'To communicate the New Zealand experience, the site also carried features relating to famous people and places. One of the most popular was an interview with former New Zealand All Blacks rugby captain Tana Umaga. Another feature that attracted a lot of attention was an interactive journey through a number of the locations chosen for blockbuster films which had made use of New Zealand\'s stunning scenery as a backdrop. As the site developed, additional features were added to help independent travelers devise their own customised itineraries. To make it easier to plan motoring holidays, the site catalogued the most popular driving routes in the country, highlighting different routes according to the season and indicating distances and times.',
      },
      {
        label: 'D',
        text: 'Later, a Travel Planner feature was added, which allowed visitors to click and \'bookmark\' places or attractions they were interested in, and then view the results on a map. The Travel Planner offered suggested routes and public transport options between the chosen locations. There were also links to accommodation in the area. By registering with the website, users could save their Travel Plan and return to it later, or print it out to take on the visit. The website also had a \'Your Words\' section where anyone could submit a blog of their New Zealand travels for possible inclusion on the website.',
      },
      {
        label: 'E',
        text: 'The Tourism New Zealand website won two Webby awards for online achievement and innovation. More importantly perhaps, the growth of tourism to New Zealand was impressive. Overall tourism expenditure increased by an average of 6.9% per year between 1999 and 2004. From Britain, visits to New Zealand grew at an average annual rate of 13% between 2002 and 2006, compared to a rate of 4% overall for British visits abroad.',
      },
      {
        label: 'F',
        text: 'The website was set up to allow both individuals and travel organizations to create itineraries and travel packages to suit their own needs and interests. On the website, visitors can search for activities not solely by geographical location, but also by the particular nature of the activity. This is important as research shows that activities are the key driver of visitor satisfaction, contributing 74% to visitor satisfaction, while transport and accommodation account for the remaining 26%. The more activities that visitors undertake, the more satisfied they will be. It has also been found that visitors enjoy cultural activities most when they are interactive, such as visiting a marae (meeting ground) to learn about traditional Maori life. Many long-haul travelers enjoy such learning experiences, which provide them with stories to take home to their friends and family. In addition, it appears that visitors to New Zealand don\'t want to be \'one of the crowd\' and find activities that involve only a few people more special and meaningful.',
      },
      {
        label: 'G',
        text: 'It could be argued that New Zealand is not a typical destination. New Zealand is a small country with a visitor economy composed mainly of small businesses. It is generally perceived as a safe English-speaking country with reliable transport infrastructure. Because of the long-haul flight, most visitors stay for longer (average 20 days) and want to see as much of the country as possible on what is often seen as a once-in-a-lifetime visit. However, the underlying lessons apply anywhere – the effectiveness of a strong brand, a strategy based on unique experiences and a comprehensive and user-friendly website.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 1–8',
        instruction: 'Complete the table below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        noteTable: R1TT_MERGE_TABLE_SAMPLE,
        questions: gapQuestions(1, [
          { prompt: 'Gap (1)', answer: 'ropes', explanation: 'Timber for houses and making of ropes.' },
          { prompt: 'Gap (2)', answer: 'sugar', explanation: 'Sap used as drink or source of sugar.' },
          { prompt: 'Gap (3)', answer: 'ropes', explanation: 'Coir fibres used for ropes.' },
          { prompt: 'Gap (4)', answer: 'charcoal', explanation: 'Shell as source of charcoal.' },
          { prompt: 'Gap (5)', answer: 'bowls', explanation: 'Halved shell used for bowls.' },
          { prompt: 'Gap (6)', answer: 'fertiliser', explanation: 'Coconut water as fertiliser for plants.' },
          { prompt: 'Gap (7)', answer: 'cosmetics', explanation: 'Oil and milk for cooking and cosmetics.' },
          { prompt: 'Gap (8)', answer: 'soap', explanation: 'Glycerine ingredient in soap.' },
        ]),
      },
      {
        range: 'Questions 9–13',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.',
        type: 'tfng',
        questions: [
          {
            number: 9,
            type: 'true-false-not-given',
            prompt: 'Coconut seeds need shade in order to germinate.',
            options: TFNG_OPTIONS,
            answer: 'false',
            explanation: 'Hạt dừa nảy mầm tốt ở nơi nắng — không cần bóng râm.',
          },
          {
            number: 10,
            type: 'true-false-not-given',
            prompt: 'Coconuts were probably transported to Asia from America in the 16th century.',
            options: TFNG_OPTIONS,
            answer: 'not-given',
            explanation: 'Passage không nói vận chuyển dừa sang châu Á thế kỷ 16.',
          },
          {
            number: 11,
            type: 'true-false-not-given',
            prompt: 'Coconuts found on the west coast of America were a different type from those found on the east coast.',
            options: TFNG_OPTIONS,
            answer: 'not-given',
            explanation: 'Không so sánh loại dừa hai bờ Mỹ.',
          },
          {
            number: 12,
            type: 'true-false-not-given',
            prompt: 'All the coconuts found in Asia are cultivated varieties.',
            options: TFNG_OPTIONS,
            answer: 'false',
            explanation: 'Có giống hoang dã ở châu Á — không phải tất cả đều trồng.',
          },
          {
            number: 13,
            type: 'true-false-not-given',
            prompt: 'Coconuts are cultivated in different ways in America and the Pacific.',
            options: TFNG_OPTIONS,
            answer: 'true',
            explanation: 'Cách trồng dừa khác nhau giữa Mỹ và Thái Bình Dương.',
          },
        ],
      },
    ],
  }
}

const CAM11_T2_MARY_ROSE_DATES = [
  { id: 'a', name: '1836' },
  { id: 'b', name: '1840' },
  { id: 'c', name: '1965' },
  { id: 'd', name: '1967' },
  { id: 'e', name: '1971' },
  { id: 'f', name: '1979' },
  { id: 'g', name: '1982' },
]

/** Cam11 T2 — notes Mary Rose Q9–13 */
export const CAM11_T2_MARY_ROSE_NOTE_PASSAGE: ReadingNotePassageBlock[] = [
  { type: 'static', text: '• A ' },
  { type: 'gap', number: 9 },
  { type: 'static', text: ' attached to hull by wires' },
  { type: 'static', text: '• ' },
  { type: 'gap', number: 10 },
  { type: 'static', text: ' to prevent hull being sucked into mud' },
  { type: 'static', text: '• ' },
  { type: 'gap', number: 11 },
  { type: 'static', text: ' used to raise hull' },
  { type: 'static', text: '• hull remains underwater until ' },
  { type: 'gap', number: 12 },
  { type: 'static', text: ' removed' },
  { type: 'static', text: '• ' },
  { type: 'gap', number: 13 },
  { type: 'static', text: ' used to secure hull to lifting frame' },
]

/** Cam11 T2 — TFNG Q1–4 + match dates Q5–8 + notes Q9–13 */
export function ieltsReadingP1TfngMatchNotesPart(): ReadingImportPartJson {
  return {
    partNumber: 1,
    rangeLabel: 'Read the text and answer questions 1–13.',
    passageTitle: 'Raising the Mary Rose',
    passageSubtitle: 'How a sixteenth-century warship was recovered from the seabed',
    passage: [
      {
        text: 'On 19 July 1545, English and French fleets met in the Solent. Among the English vessels was a warship by the name of Mary Rose. Built in Portsmouth some 35 years earlier, she had had a long and successful fighting career, and was a favourite of King Henry VIII. Accounts of what happened to the ship vary: while witnesses agree that she was not hit by the French, some maintain that she was outdated, overladen and sailing too low in the water, others that she was mishandled by undisciplined crew. What is undisputed, however, is that the Mary Rose sank into the muddy seabed of the Solent, taking her crew of 500 with her.',
      },
      {
        text: 'Then, on 16 June 1836, some fishermen in the Solent found that their equipment was caught on an underwater obstruction, which turned out to be the Mary Rose. Diver John Deane happened to be exploring another sunken ship nearby, and the fishermen approached him, asking him to free their gear. Deane dived down, and found the equipment caught on a timber protruding from the seabed. Exploring further, he uncovered several other timbers and a bronze gun. Deane continued diving on the site intermittently until 1840, recovering several more guns, two bows, various remains of the hull and other items.',
      },
      {
        text: 'The Mary Rose then faded into obscurity for another hundred years. But in 1965, military historian and amateur diver Alexander McKee, in conjunction with the British Sub-Aqua Club, initiated a project called "Solent Ships". While on paper this was a plan to examine a number of known wrecks in the Solent, what McKee really hoped for was to find the Mary Rose. Ordinary search techniques proved unsatisfactory, so McKee entered into collaboration with Harold E. Martin. Using a side-scan sonar, Martin identified a large, unusually shaped object, which McKee believed was the Mary Rose.',
      },
      {
        text: 'Further excavations revealed stray pieces of timber and an iron gun. But the climax to the operation came when, on 5 May 1971, part of the ship\'s frame was uncovered. McKee and his team now knew for certain that they had found the wreck, but were as yet unaware that it also housed a treasure trove of beautifully preserved artefacts. Interest in the project grew, and in 1979, The Mary Rose Trust was formed, with Prince Charles as president and Dr Margaret Rule as archaeology director.',
      },
      {
        text: 'The decision whether or not to salvage the wreck was not an easy one, although in principle it had been agreed in 1971. The hull was covered in a layer of silt and mud, and the team had to decide whether to leave it in place or remove it. If they left it, the hull would eventually be destroyed by chemical and biological action. On the other hand, removing it would be a much greater undertaking, involving the construction of a cofferdam around the site.',
      },
      {
        text: 'An important factor in trying to salvage the Mary Rose was that the remaining hull was an open shell. This led to an important decision being taken: namely to carry out the lifting operation in three very distinct stages. The hull was attached to a lifting frame via a network of bolts and wires. The problem of the hull being sucked back downwards into the mud was overcome by using 12 hydraulic jacks. These raised it a few centimetres over a period of several days, as the lifting frame rose slowly up its four legs. It was only when the hull was hanging free from the seabed, clear of the bottom sediment, that the salvage operation progressed to the second stage.',
      },
      {
        text: 'In this stage, the lifting frame was fixed to a hook attached to a crane, and the hull was lifted completely clear of the seabed and transferred underwater into the lifting cradle. This required precise positioning to locate the legs into the "stabbing guides" of the lifting cradle. The lifting cradle was designed to fit the hull using archaeological survey drawings, and was fitted with air bags to provide additional cushioning for the hull\'s delicate timber structure. The third and final stage was to lift the entire structure out of the water, by which time the hull was also supported from below.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 1–4',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.',
        type: 'tfng',
        questions: [
          { number: 1, type: 'true-false-not-given', prompt: 'There is some doubt about what caused the Mary Rose to sink.', options: TFNG_OPTIONS, answer: 'true', explanation: 'Accounts vary — chưa chắc nguyên nhân chìm.' },
          { number: 2, type: 'true-false-not-given', prompt: 'The Mary Rose was the only ship to sink in the battle of 19 July 1545.', options: TFNG_OPTIONS, answer: 'false', explanation: 'Passage không nói đây là tàu duy nhất bị chìm.' },
          { number: 3, type: 'true-false-not-given', prompt: 'Most of one side of the Mary Rose lay undamaged under the sea.', options: TFNG_OPTIONS, answer: 'not-given', explanation: 'Không có thông tin về mức độ hư hại một bên thân tàu.' },
          { number: 4, type: 'true-false-not-given', prompt: 'Alexander McKee knew that the wreck would contain many valuable historical objects.', options: TFNG_OPTIONS, answer: 'false', explanation: 'McKee tìm xác tàu — chưa biết có kho cổ vật khi phát hiện.' },
        ],
      },
      {
        range: 'Questions 5–8',
        instruction: 'Match each statement with the correct date, A–G. Write the correct letter in boxes 5–8 on your answer sheet.',
        type: 'matching-features',
        features: CAM11_T2_MARY_ROSE_DATES,
        questions: [
          { number: 5, type: 'matching-features', prompt: 'A search for the Mary Rose was launched.', options: [], answer: 'c', explanation: '1965 — dự án Solent Ships của McKee.' },
          { number: 6, type: 'matching-features', prompt: "One person's exploration of the Mary Rose site stopped.", options: [], answer: 'b', explanation: '1840 — John Deane ngừng lặn tại hiện trường.' },
          { number: 7, type: 'matching-features', prompt: 'It was agreed that the hull of the Mary Rose should be raised.', options: [], answer: 'e', explanation: '1971 — nguyên tắc đồng ý nâng thân tàu.' },
          { number: 8, type: 'matching-features', prompt: 'The site of the Mary Rose was found by chance.', options: [], answer: 'd', explanation: '1967 — phát hiện tình cờ (sonar Martin).' },
        ],
      },
      {
        range: 'Questions 9–13',
        instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        notesTitle: 'Raising the Mary Rose',
        notePassage: CAM11_T2_MARY_ROSE_NOTE_PASSAGE,
        questions: gapQuestions(9, [
          { prompt: 'Gap (9)', answer: 'cage', explanation: 'A cage gắn thân tàu bằng dây.' },
          { prompt: 'Gap (10)', answer: 'air bags|airbags', explanation: 'Air bags chống hút xuống bùn.' },
          { prompt: 'Gap (11)', answer: 'hydraulic jacks|jacks', explanation: 'Hydraulic jacks nâng thân tàu.' },
          { prompt: 'Gap (12)', answer: 'mud', explanation: 'Thân tàu dưới nước đến khi bùn được gỡ.' },
          { prompt: 'Gap (13)', answer: 'anchor', explanation: 'Anchor cố định thân tàu vào khung nâng.' },
        ]),
      },
    ],
  }
}

const CAM11_T4_TWINS_RESEARCHERS = [
  { id: 'a', name: 'Francis Galton' },
  { id: 'b', name: 'Thomas Bouchard' },
  { id: 'c', name: 'Danielle Reed' },
]

const CAM11_T4_EPIGENETIC_WORD_BANK = [
  { id: 'a', label: 'nurture' },
  { id: 'b', label: 'organs' },
  { id: 'c', label: 'code' },
  { id: 'd', label: 'chemicals' },
  { id: 'e', label: 'environment' },
  { id: 'f', label: 'behaviour' },
]

const CAM11_T4_EPIGENETIC_SUMMARY_NOTE = [
  'Epigenetic processes',
  '',
  'In epigenetic processes, 10________ influence the activity of our genes, for example in creating our '
  + 'internal 11________. The study of epigenetic processes is uncovering a way in which our genes can be '
  + 'affected by our 12________. One example is that if a pregnant rat suffers stress, the new-born rat may '
  + 'later show problems in its 13________.',
].join('\n')

/** Cam11 T4 — TFNG Q1–4 + match researchers Q5–9 + summary word bank Q10–13 */
export function ieltsReadingP1TfngMatchSummaryPart(): ReadingImportPartJson {
  return {
    partNumber: 1,
    rangeLabel: 'Read the text and answer questions 1–13.',
    passageTitle: 'Research using twins',
    passageSubtitle: 'To biomedical researchers all over the world, twins offer a precious opportunity to untangle the influence of genes and the environment',
    passage: [
      {
        text: 'To biomedical researchers all over the world, twins offer a precious opportunity to untangle the influence of genes and the environment — of nature and nurture. Because identical twins come from a single fertilized egg that splits into two, they share virtually the same genetic code. Any differences between them — one twin having younger looking skin, for example — must be due to environmental factors such as less time spent in the sun.',
      },
      {
        text: 'Alternatively, by comparing the experiences of identical twins with those of fraternal twins, who come from separate eggs and share on average half their DNA, researchers can quantify the extent to which our genes affect our susceptibility to different diseases. Fraternal twins are more likely to experience similar ailments than unrelated people, but less so than identical twins.',
      },
      {
        text: 'These two lines of research — studying the differences between identical twins, and comparing identical with fraternal twins — have a crucial difference. The first can tell us what environmental factors affect a trait, while the second can tell us how strongly that trait is linked to our genes.',
      },
      {
        text: 'The idea of using twins to measure the influence of heredity dates back to 1875, when the English scientist Francis Galton first suggested the approach (and coined the phrase "nature and nurture"). But twin studies took a surprising twist in the 1980s, with the arrival of studies into identical twins who had been separated at birth and reunited as adults. Over two decades 137 sets of twins eventually visited Thomas Bouchard\'s lab in what became known as the Minnesota Study of Twins Reared Apart.',
      },
      {
        text: 'Bouchard and his colleagues used this mountain of data to identify how far twins were affected by their genetic makeup. The key to their approach was a statistical concept called heritability. In broad terms, the heritability of a trait measures the extent to which differences among members of a population can be explained by differences in their genetics.',
      },
      {
        text: 'Lately, however, twin studies have helped lead scientists to a radical new conclusion: that nature and nurture are not the only elemental forces at work. According to a recent field called epigenetics, there is a third factor also in play, one that in some cases serves as a bridge between the environment and our genes.',
      },
      {
        text: 'Epigenetic processes are chemical reactions tied to neither nature nor nurture but representing what researchers have called a "third component". These reactions influence how our genetic code is expressed: how each gene is strengthened or weakened, even turned on or off, to build our bones, brains and all other parts of our bodies.',
      },
      {
        text: 'If you think of our DNA as an immense piano keyboard and our genes as the keys, epigenetic processes determine when and how each key can be struck, changing the tune being played. One way the study of epigenetics is revolutionizing our understanding of biology is by revealing a mechanism by which the environment directly impacts our genes.',
      },
      {
        text: 'Studies of animals, for example, have shown that when a rat experiences stress during pregnancy, it can cause epigenetic changes in a fetus that lead to behavioral problems as the rodent grows up. Other epigenetic processes appear to occur randomly, while others are influenced by factors such as diet and lifestyle.',
      },
      {
        text: 'Geneticist Danielle Reed has worked with many twins over the years and thought deeply about what twin studies have taught us. "It\'s very clear when you look at twins that much of what they share is hardwired," she says. "Many things about our behavior are not learned — they are innate."',
      },
      {
        text: 'Reed credits Thomas Bouchard\'s work for today\'s surge in twin studies. "He was the trailblazer," she says. "We forget that 50 years ago things like heart disease were thought to be caused entirely by lifestyle. Schizophrenia was thought to be due to poor mothering. Twin studies have allowed us to be more reflective about what people are actually born with and what\'s caused by experience."',
      },
      {
        text: 'Having said that, Reed adds, the latest work in epigenetics promises to take our understanding even further. "What I like to say is that nature writes some things in pencil and some things in pen," she says. "Things written in pen you can\'t change. That\'s DNA. But things written in pencil you can. That\'s epigenetics."',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 1–4',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? In boxes 1–4 on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        type: 'tfng',
        questions: [
          {
            number: 1,
            type: 'true-false-not-given',
            prompt: 'There may be genetic causes for the differences in how young the skin of identical twins looks.',
            options: TFNG_OPTIONS,
            answer: 'false',
            explanation: 'Khác biệt do yếu tố môi trường, không phải gen.',
          },
          {
            number: 2,
            type: 'true-false-not-given',
            prompt: 'Twins are at greater risk of developing certain illnesses than non-twins.',
            options: TFNG_OPTIONS,
            answer: 'not-given',
            explanation: 'Passage không so sánh twins với non-twins về bệnh.',
          },
          {
            number: 3,
            type: 'true-false-not-given',
            prompt: 'Bouchard advertised in newspapers for twins who had been separated at birth.',
            options: TFNG_OPTIONS,
            answer: 'not-given',
            explanation: 'Không nêu quảng cáo trên báo.',
          },
          {
            number: 4,
            type: 'true-false-not-given',
            prompt: 'Epigenetic processes are different from both genetic and environmental processes.',
            options: TFNG_OPTIONS,
            answer: 'true',
            explanation: 'Epigenetics là yếu tố thứ ba, cầu nối giữa môi trường và gen.',
          },
        ],
      },
      {
        range: 'Questions 5–9',
        instruction: 'Look at the following statements (Questions 5–9) and the list of researchers below. Match each statement with the correct researcher, A–C. Write the correct letter in boxes 5–9 on your answer sheet.',
        type: 'matching-features',
        features: CAM11_T4_TWINS_RESEARCHERS,
        questions: [
          { number: 5, type: 'matching-features', prompt: 'invented a term used to distinguish two factors affecting human characteristics', options: [], answer: 'a', explanation: 'Galton coined "nature and nurture".' },
          { number: 6, type: 'matching-features', prompt: 'expressed the view that the study of epigenetics will increase our knowledge', options: [], answer: 'c', explanation: 'Reed — epigenetics promises to take understanding further.' },
          { number: 7, type: 'matching-features', prompt: 'developed a mathematical method of measuring genetic influences', options: [], answer: 'b', explanation: 'Bouchard — statistical concept heritability.' },
          { number: 8, type: 'matching-features', prompt: 'pioneered research into genetics using twins', options: [], answer: 'a', explanation: 'Galton first suggested twin studies (1875).' },
          { number: 9, type: 'matching-features', prompt: 'carried out research into twins who had lived apart', options: [], answer: 'b', explanation: 'Bouchard — Minnesota Study of Twins Reared Apart.' },
        ],
      },
      {
        range: 'Questions 10–13',
        instruction: 'Complete the summary using the list of phrases, A–F, below.',
        type: 'summary-completion',
        note: CAM11_T4_EPIGENETIC_SUMMARY_NOTE,
        wordBank: CAM11_T4_EPIGENETIC_WORD_BANK,
        questions: [
          { number: 10, type: 'summary-completion', prompt: 'Gap (10)', options: [], answer: 'd', explanation: 'Epigenetic processes are chemical reactions.' },
          { number: 11, type: 'summary-completion', prompt: 'Gap (11)', options: [], answer: 'b', explanation: 'Build bones, brains and all other parts (organs).' },
          { number: 12, type: 'summary-completion', prompt: 'Gap (12)', options: [], answer: 'e', explanation: 'Environment directly impacts our genes.' },
          { number: 13, type: 'summary-completion', prompt: 'Gap (13)', options: [], answer: 'f', explanation: 'Behavioral problems in stressed rat offspring.' },
        ],
      },
    ],
  }
}

const CAM12_T6_AGRICULTURE_PEOPLE = [
  { id: 'a', name: 'Kanayo F. Nwanze' },
  { id: 'b', name: 'Sophia Murphy' },
  { id: 'c', name: 'Shenggen Fan' },
  { id: 'd', name: 'Rokeya Kabir' },
  { id: 'e', name: 'Pat Mooney' },
  { id: 'f', name: 'Giel Ton' },
  { id: 'g', name: 'Sonali Bisht' },
]

const CAM12_T6_SMALL_FARM_PROBLEMS_OPTS = [
  { id: 'a', label: 'lack of demand for locally produced food' },
  { id: 'b', label: 'lack of irrigation programmes' },
  { id: 'c', label: 'being unable to get insurance' },
  { id: 'd', label: 'the effects of changing weather patterns' },
  { id: 'e', label: 'having to sell their goods to intermediary buyers' },
]

const CAM12_T6_FARMER_ACTIONS_OPTS = [
  { id: 'a', label: 'reducing the size of food stocks' },
  { id: 'b', label: 'attempting to ensure that prices rise at certain times of the year' },
  { id: 'c', label: 'organising co-operation between a wide range of interested parties' },
  { id: 'd', label: 'encouraging consumers to take a financial stake in farming' },
  { id: 'e', label: 'making customers aware of the reasons for changing food prices' },
]

/** Cam12 T6 — match paragraph Q1–3 + match people Q4–9 + Choose TWO Q10–13 */
export function ieltsReadingP1MatchChooseTwoPart(): ReadingImportPartJson {
  return {
    partNumber: 1,
    rangeLabel: 'Read the text and answer questions 1–13.',
    passageTitle: 'The risks agriculture faces in developing countries',
    passageSubtitle: 'Synthesis of an online debate',
    passage: [
      {
        label: 'A',
        text: 'Two things distinguish food production from all other productive activities: first, every single person needs food each day and has a right to it; and second, it is hugely dependent on nature. These two unique aspects, one political, the other natural, make food production highly vulnerable and different from any other business. At the same time, cultural values are highly entrenched in food and agricultural systems worldwide.',
      },
      {
        label: 'B',
        text: 'Farmers everywhere face major risks; including extreme weather, long-term climate change, and price volatility in input and product markets. However, smallholder farmers in developing countries must in addition deal with adverse environments, both natural, in terms of soil quality, rainfall, etc. and human, in terms of infrastructure, financial systems, markets, knowledge and technology. Counter-intuitively, hunger is prevalent among many smallholder farmers in the developing world.',
      },
      {
        label: 'C',
        text: 'Participants in the online debate argued that our biggest challenge is to address the underlying causes of the agricultural system\'s inability to ensure sufficient food for all, and they identified as drivers of this problem our dependency on fossil fuels and unsupportive government policies.',
      },
      {
        label: 'D',
        text: 'On the question of mitigating the risks farmers face, most essayists called for greater state intervention. In his essay, Kanayo F. Nwanze, President of the International Fund for Agricultural Development, argued that governments can significantly reduce risks for farmers by providing basic services like roads to get produce more efficiently to markets, or water and food storage facilities to reduce losses. Sophia Murphy, senior advisor to the Institute for Agriculture and Trade Policy, suggested that the procurement and holding of stocks by governments can also help mitigate wild swings in food prices by alleviating uncertainties about market supply.',
      },
      {
        label: 'E',
        text: 'Shenggen Fan, Director General of the International Food Policy Research Institute, held up social safety nets and public welfare programmes in Ethiopia, Brazil and Mexico as valuable ways to address poverty among farming families and reduce their vulnerability to agriculture shocks. However, some commentators responded that cash transfers to poor families do not necessarily translate into increased food security, as these programmes do not always strengthen food production or raise incomes.',
      },
      {
        label: 'F',
        text: 'Regarding state subsidies for agriculture, Rokeya Kabir, Executive Director of Bangladesh Nari Progati Sangha, commented in her essay that these \'have not compensated for the stranglehold exercised by private traders. In fact, studies show that sixty percent of beneficiaries of subsidies are not poor, but rich landowners and non-farmer traders.\' Nwanze, Murphy and Fan argued that private risk management tools, like private insurance, commodity futures markets, and rural finance can help small-scale producers mitigate risk and allow for investment in improvements. Kabir warned that financial support schemes often encourage the adoption of high-input agricultural practices, which in the medium term may raise production costs beyond the value of their harvests. Murphy noted that when futures markets become excessively financialised they can contribute to short-term price volatility, which increases farmers\' food insecurity. Many participants and commentators emphasised that greater transparency in markets is needed to mitigate the impact of volatility, and make evident whether adequate stocks and supplies are available. Others contended that agribusiness companies should be held responsible for paying for negative side effects.',
      },
      {
        label: 'G',
        text: 'Many essayists mentioned climate change and its consequences for small-scale agriculture. Fan explained that in addition to reducing crop yields, climate change increases the magnitude and the frequency of extreme weather events, which increase smallholder vulnerability. The growing unpredictability of weather patterns increases farmers\' difficulty in managing weather-related risks. According to this author, one solution would be to develop crop varieties that are more resilient to new climate trends and extreme weather patterns. Accordingly, Pat Mooney, co-founder and executive director of the ETC Group, suggested that \'if we are to survive climate change, we must adopt policies that let peasants diversify the plant and animal species and varieties/breeds that make up our menus.\'',
      },
      {
        label: 'H',
        text: 'Some participating authors and commentators argued in favour of community-based and autonomous risk management strategies through collective action groups, co-operatives or producers\' groups. Such groups enhance market opportunities for small-scale producers, reduce marketing costs and synchronise buying and selling with seasonal price conditions. According to Murphy, \'collective action offers an important way for farmers to strengthen their political and economic bargaining power, and to reduce their business risks.\' One commentator, Giel Ton, warned that collective action does not come as a free good. It takes time, effort and money to organise, build trust and to experiment. Others, like Marcel Vernooij and Marcel Beukeboom, suggested that in order to \'apply what we already know\', all stakeholders, including business, government, scientists and civil society, must work together, starting at the beginning of the value chain.',
      },
      {
        label: 'I',
        text: 'Some participants explained that market price volatility is often worsened by the presence of intermediary purchasers who, taking advantage of farmers\' vulnerability, dictate prices. One commentator suggested farmers can gain greater control over prices and minimise price volatility by selling directly to consumers. Similarly, Sonali Bisht, founder and advisor to the Institute of Himalayan Environmental Research and Education (INHERE), India, wrote that community-supported agriculture, where consumers invest in local farmers by subscription and guarantee producers a fair price, is a risk-sharing model worth more attention. Direct food distribution systems not only encourage small-scale agriculture but also give consumers more control over the food they consume, she wrote.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 1–3',
        instruction: 'Reading Passage 1 has nine paragraphs, A–I. Which paragraph contains the following information?',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
        questions: [
          { number: 1, type: 'matching-paragraph', prompt: 'a reference to characteristics that only apply to food production', options: [], answer: 'a', explanation: 'Đoạn A — hai đặc điểm chỉ có ở sản xuất thực phẩm.' },
          { number: 2, type: 'matching-paragraph', prompt: 'a reference to challenges faced only by farmers in certain parts of the world', options: [], answer: 'b', explanation: 'Đoạn B — smallholder farmers ở nước đang phát triển.' },
          { number: 3, type: 'matching-paragraph', prompt: 'a reference to difficulties in bringing about co-operation between farmers', options: [], answer: 'h', explanation: 'Đoạn H — Giel Ton: collective action tốn thời gian, công sức, tiền.' },
        ],
      },
      {
        range: 'Questions 4–9',
        instruction: 'Look at the following statements (Questions 4–9) and the list of people below. Match each statement with the correct person, A–G.',
        note: 'NB You may use any letter more than once.',
        type: 'matching-features',
        features: CAM12_T6_AGRICULTURE_PEOPLE,
        questions: [
          { number: 4, type: 'matching-features', prompt: 'Financial assistance from the government does not always go to the farmers who most need it.', options: [], answer: 'd', explanation: 'Kabir — 60% beneficiaries không phải nông dân nghèo.' },
          { number: 5, type: 'matching-features', prompt: 'Farmers can benefit from collaborating as a group.', options: [], answer: 'b', explanation: 'Murphy — collective action giảm rủi ro kinh doanh.' },
          { number: 6, type: 'matching-features', prompt: 'Financial assistance from the government can improve the standard of living of farmers.', options: [], answer: 'c', explanation: 'Fan — social safety nets giảm nghèo nông dân.' },
          { number: 7, type: 'matching-features', prompt: 'Farmers may be helped if there is financial input by the same individuals who buy from them.', options: [], answer: 'g', explanation: 'Bisht — community-supported agriculture.' },
          { number: 8, type: 'matching-features', prompt: 'Governments can help to reduce variation in prices.', options: [], answer: 'b', explanation: 'Murphy — procurement and holding stocks giảm biến động giá.' },
          { number: 9, type: 'matching-features', prompt: 'Improvements to infrastructure can have a major impact on risk for farmers.', options: [], answer: 'a', explanation: 'Nwanze — roads, water and food storage facilities.' },
        ],
      },
      {
        range: 'Questions 10–11',
        instruction: 'Choose TWO correct answers, A–E.',
        type: 'multiple-choice',
        questions: [
          {
            number: 10,
            type: 'multiple-choice',
            prompt: 'Which TWO problems are mentioned which affect farmers with small farms in developing countries? (first answer)',
            options: CAM12_T6_SMALL_FARM_PROBLEMS_OPTS,
            answer: 'd',
            explanation: 'D — biến đổi thời tiết / climate change.',
          },
          {
            number: 11,
            type: 'multiple-choice',
            prompt: 'Which TWO problems are mentioned which affect farmers with small farms in developing countries? (second answer)',
            options: CAM12_T6_SMALL_FARM_PROBLEMS_OPTS,
            answer: 'e',
            explanation: 'E — phải bán qua intermediary buyers.',
          },
        ],
      },
      {
        range: 'Questions 12–13',
        instruction: 'Choose TWO correct answers, A–E.',
        type: 'multiple-choice',
        questions: [
          {
            number: 12,
            type: 'multiple-choice',
            prompt: 'Which TWO actions are recommended for improving conditions for farmers? (first answer)',
            options: CAM12_T6_FARMER_ACTIONS_OPTS,
            answer: 'c',
            explanation: 'C — stakeholders làm việc cùng nhau (đoạn H).',
          },
          {
            number: 13,
            type: 'multiple-choice',
            prompt: 'Which TWO actions are recommended for improving conditions for farmers? (second answer)',
            options: CAM12_T6_FARMER_ACTIONS_OPTS,
            answer: 'd',
            explanation: 'D — consumers đầu tư vào nông dân (community-supported agriculture).',
          },
        ],
      },
    ],
  }
}

/** Cam9 T1 — TFNG Q1–7 + gap-fill Q8–13 */
export function ieltsReadingP1TfngGapPart(): ReadingImportPartJson {
  const base = MOCK.parts[0]
  const tfng = base.questionGroups[0]
  const tfngQs = [
    ...tfng.questions,
    {
      ...tfng.questions[0],
      prompt: 'The kākāpō can live for up to 100 years.',
      answer: 'true',
      explanation: 'The passage states they can live for up to 100 years.',
    },
  ]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 1–7',
        instruction: tfng.instruction,
        type: 'tfng',
        questions: tfngQs.slice(0, 7).map((q, i) => ({
          number: 1 + i,
          type: q.type,
          prompt: q.prompt,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
        })),
      },
      {
        range: 'Questions 8–13',
        instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(8, [
          { prompt: 'The kākāpō is described as a ___ parrot.', answer: 'flightless', explanation: 'Passage mô tả nocturnal, flightless parrot.' },
          { prompt: 'Female kākāpō lay eggs when ___ is plentiful.', answer: 'food', explanation: 'Breeding phụ thuộc abundant food supplies.' },
          { prompt: 'Polynesian settlers introduced animals such as ___', answer: 'dogs', explanation: 'Polynesian settlers brought dogs and rats.' },
          { prompt: 'European colonisation caused widespread ___', answer: 'habitat loss', explanation: 'European colonisation gây habitat loss.' },
          { prompt: 'In 1894 the government made its first attempt to ___ the kākāpō.', answer: 'save', explanation: 'First attempt to save the kākāpō.' },
          { prompt: 'Conservationists created ___ where birds could breed safely.', answer: 'predator-free islands', explanation: 'Predator-free islands cho breeding.' },
        ]),
      },
    ],
  }
}

/** Cam11 T3 — Matching headings Q1–7 + MC Q8–13 */
export function ieltsReadingP1HeadingsMcPart(): ReadingImportPartJson {
  const headingsPart = DEMO.parts[0]
  const mcGroup = MOCK.parts[0].questionGroups[1]

  return {
    ...partToImportJson(headingsPart),
    rangeLabel: 'Read the text and answer questions 1–13.',
    questionGroups: [
      renumberGroup(headingsPart.questionGroups[0], 'Questions 1–7', 1),
      renumberGroup(mcGroup, 'Questions 8–13', 8, 6),
    ],
  }
}

/** Sentence completion Q1–8 + MC Q9–13 */
export function ieltsReadingP1SentenceMcPart(): ReadingImportPartJson {
  const base = MOCK.parts[0]
  const mcGroup = base.questionGroups[1]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 1–8',
        instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'sentence-completion',
        questions: sentenceQuestions(1, [
          { prompt: 'The kākāpō is a ___ parrot found only in New Zealand.', answer: 'flightless', explanation: 'Passage mô tả flightless parrot.' },
          { prompt: 'Kākāpō can live for up to ___ years.', answer: '100', explanation: 'Có thể sống tới 100 năm.' },
          { prompt: 'Females alone ___ the eggs.', answer: 'incubate', explanation: 'Females incubate eggs.' },
          { prompt: 'Breeding depends on abundant ___ supplies.', answer: 'food', explanation: 'Abundant food supplies.' },
          { prompt: 'Polynesian settlers brought ___ and rats.', answer: 'dogs', explanation: 'Dogs and rats introduced.' },
          { prompt: 'European colonisation caused habitat ___', answer: 'loss', explanation: 'Widespread habitat loss.' },
          { prompt: 'The first government rescue attempt was in ___', answer: '1894', explanation: '1894 first attempt.' },
          { prompt: 'Birds breed on predator-free ___', answer: 'islands', explanation: 'Predator-free islands.' },
        ]),
      },
      renumberGroup(mcGroup, 'Questions 9–13', 9, 5),
    ],
  }
}

const CAM12_T5_FLYING_TORTOISES_HEADINGS = [
  { id: 'i', label: 'The importance of getting the timing right' },
  { id: 'ii', label: 'Young meets old' },
  { id: 'iii', label: 'Developments to the disadvantage of tortoise populations' },
  { id: 'iv', label: 'Planning a bigger idea' },
  { id: 'v', label: 'Tortoises populate the islands' },
  { id: 'vi', label: 'Carrying out a carefully prepared operation' },
  { id: 'vii', label: 'Looking for a home for the islands\' tortoises' },
  { id: 'viii', label: 'The start of the conservation project' },
]

/** Cam12 T5 — notes Galápagos tortoise Q8–13 */
export const CAM12_T5_TORTOISE_DECLINE_NOTE_PASSAGE: ReadingNotePassageBlock[] = [
  { type: 'static', text: '• Originally from mainland South America' },
  { type: 'static', text: '• Numbers on Galapagos islands increased, due to lack of predators' },
  { type: 'static', text: '• 17th century: small numbers taken onto ships used by ' },
  { type: 'gap', number: 8 },
  { type: 'static', text: '• 1790s: very large numbers taken onto whaling ships, kept for ' },
  { type: 'gap', number: 9 },
  { type: 'static', text: ', and also used to produce ' },
  { type: 'gap', number: 10 },
  { type: 'static', text: '• Hunted by ' },
  { type: 'gap', number: 11 },
  { type: 'static', text: ' on islands' },
  { type: 'static', text: '• Habitat destruction: for the establishment of agriculture and by various ' },
  { type: 'gap', number: 12 },
  { type: 'static', text: ' not native to the islands, which also fed on baby tortoises and tortoises\' ' },
  { type: 'gap', number: 13 },
]

/** Cam12 T5 — headings Q1–7 + note completion Q8–13 */
export function ieltsReadingP1HeadingsNotesPart(): ReadingImportPartJson {
  return {
    partNumber: 1,
    rangeLabel: 'Read the text and answer questions 1–13.',
    passageTitle: 'Flying tortoises',
    passageSubtitle: 'An airborne reintroduction programme has helped conservationists take significant steps to protect the endangered Galapagos tortoise.',
    passage: [
      {
        label: 'A',
        text: 'Forests of spiny cacti cover much of the uneven lava plains that separate the interior of the Galapagos island of Isabela from the Pacific Ocean. With its five distinct volcanoes, the island resembles a lunar landscape. Only the thick vegetation at the skirt of the often cloud-covered peak of Sierra Negra offers respite from the barren terrain below. This inhospitable environment is home to the giant Galapagos tortoise. Some time after the Galapagos\'s birth, around five million years ago, the islands were colonised by one or more tortoises from mainland South America. As these ancestral tortoises settled on the individual islands, the different populations adapted to their unique environments, giving rise to at least 14 different subspecies. Island life agreed with them. In the absence of significant predators, they grew to become the largest and longest-living tortoises on the planet, weighing more than 400 kilograms, occasionally exceeding 1.8 metres in length and living for more than a century.',
      },
      {
        label: 'B',
        text: 'Before human arrival, the archipelago\'s tortoises numbered in the hundreds of thousands. From the 17th century onwards, pirates took a few on board for food, but the arrival of whaling ships in the 1790s saw this exploitation grow exponentially. Relatively immobile and capable of surviving for months without food or water, the tortoises were taken on board these ships to act as food supplies during long ocean passages. Sometimes, their bodies were processed into high-grade oil. In total, an estimated 200,000 animals were taken from the archipelago before the 20th century. This historical exploitation was then exacerbated when settlers came to the islands. They hunted the tortoises and destroyed their habitat to clear land for agriculture. They also introduced alien species - ranging from cattle, pigs, goats, rats and dogs to plants and ants - that either prey on the eggs and young tortoises or damage or destroy their habitat.',
      },
      {
        label: 'C',
        text: 'Today, only 11 of the original subspecies survive and of these, several are highly endangered. In 1989, work began on a tortoise-breeding centre just outside the town of Puerto Villamil on Isabela, dedicated to protecting the island\'s tortoise populations. The centre\'s captive-breeding programme proved to be extremely successful, and it eventually had to deal with an overpopulation problem.',
      },
      {
        label: 'D',
        text: 'The problem was also a pressing one. Captive-bred tortoises can\'t be reintroduced into the wild until they\'re at least five years old and weigh at least 4.5 kilograms, at which point their size and weight - and their hardened shells - are sufficient to protect them from predators. But if people wait too long after that point, the tortoises eventually become too large to transport.',
      },
      {
        label: 'E',
        text: 'For years, repatriation efforts were carried out in small numbers, with the tortoises carried on the backs of men over weeks of long, treacherous hikes along narrow trails. But in November 2010, the environmentalist and Galapagos National Park liaison officer Godfrey Merlin, a visiting private motor yacht captain and a helicopter pilot gathered around a table in a small cafe in Puerto Ayora on the island of Santa Cruz to work out more ambitious reintroduction. The aim was to use a helicopter to move 300 of the breeding centre\'s tortoises to various locations close to Sierra Negra.',
      },
      {
        label: 'F',
        text: 'This unprecedented effort was made possible by the owners of the 67-metre yacht White Cloud, who provided the Galapagos National Park with free use of their helicopter and its experienced pilot, as well as the logistical support of the yacht, its captain and crew. Originally an air ambulance, the yacht\'s helicopter has a rear double door and a large internal space that\'s well suited for cargo, so a custom crate was designed to hold up to 33 tortoises with a total weight of about 150 kilograms. This weight, together with that of the fuel, pilot and four crew, approached the helicopter\'s maximum payload, and there were times when it was clearly right on the edge of the helicopter\'s capabilities. During a period of three days, a group of volunteers from the breeding centre worked around the clock to prepare the young tortoises for transport. Meanwhile, park wardens, dropped off ahead of time in remote locations, cleared landing sites within the thick brush, cacti and lava rocks.',
      },
      {
        label: 'G',
        text: 'Upon their release, the juvenile tortoises quickly spread out over their ancestral territory, investigating their new surroundings and feeding on the vegetation. Eventually, one tiny tortoise came across a fully grown giant who had been lumbering around the island for around a hundred years. The two stood side by side, a powerful symbol of the regeneration of an ancient species.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 1–7',
        instruction: 'Reading Passage 1 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below.',
        note: 'There are more headings than paragraphs, so you will not use all of them.',
        type: 'matching-headings',
        headings: CAM12_T5_FLYING_TORTOISES_HEADINGS,
        questions: [
          { number: 1, type: 'matching-headings', prompt: 'Paragraph A', options: [], answer: 'v', explanation: 'Đoạn A mô tả rùa đến từ Nam Mỹ và lan rộng trên các đảo — heading v.' },
          { number: 2, type: 'matching-headings', prompt: 'Paragraph B', options: [], answer: 'iii', explanation: 'Đoạn B: cướp biển, tàu săn cá voi, người định cư — suy giảm quần thể.' },
          { number: 3, type: 'matching-headings', prompt: 'Paragraph C', options: [], answer: 'viii', explanation: '1989 — trung tâm nhân giống bảo tồn bắt đầu.' },
          { number: 4, type: 'matching-headings', prompt: 'Paragraph D', options: [], answer: 'i', explanation: 'Thời điểm thả lại tự nhiên phải đúng (5 tuổi, 4.5 kg).' },
          { number: 5, type: 'matching-headings', prompt: 'Paragraph E', options: [], answer: 'iv', explanation: 'Kế hoạch tái thả quy mô lớn bằng trực thăng.' },
          { number: 6, type: 'matching-headings', prompt: 'Paragraph F', options: [], answer: 'vi', explanation: 'Chi tiết chuẩn bị và vận chuyển bằng trực thăng.' },
          { number: 7, type: 'matching-headings', prompt: 'Paragraph G', options: [], answer: 'ii', explanation: 'Rùa non gặp rùa già — Young meets old.' },
        ],
      },
      {
        range: 'Questions 8–13',
        instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        notesTitle: 'The decline of the Galapagos tortoise',
        notePassage: CAM12_T5_TORTOISE_DECLINE_NOTE_PASSAGE,
        questions: gapQuestions(8, [
          { prompt: 'Gap (8)', answer: 'pirates', explanation: 'Thế kỷ 17: cướp biển lấy rùa lên tàu.' },
          { prompt: 'Gap (9)', answer: 'food', explanation: 'Tàu săn cá voi giữ rùa làm thực phẩm.' },
          { prompt: 'Gap (10)', answer: 'oil', explanation: 'Xử lý thành dầu chất lượng cao.' },
          { prompt: 'Gap (11)', answer: 'settlers', explanation: 'Người định cư săn rùa trên đảo.' },
          { prompt: 'Gap (12)', answer: 'species', explanation: 'Giới thiệu loài ngoại lai (cattle, pigs, rats…).' },
          { prompt: 'Gap (13)', answer: 'eggs', explanation: 'Loài ngoại lai ăn trứng và rùa con.' },
        ]),
      },
    ],
  }
}

/** Matching headings Q1–7 + gap Q8–13 */
export function ieltsReadingP1HeadingsGapPart(): ReadingImportPartJson {
  const headingsPart = DEMO.parts[0]

  return {
    ...partToImportJson(headingsPart),
    rangeLabel: 'Read the text and answer questions 1–13.',
    questionGroups: [
      renumberGroup(headingsPart.questionGroups[0], 'Questions 1–7', 1),
      {
        range: 'Questions 8–13',
        instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(8, [
          { prompt: 'City planners now treat parks as essential ___', answer: 'infrastructure', explanation: 'Green space as essential infrastructure.' },
          { prompt: 'Residents near parks reported lower ___ levels.', answer: 'stress', explanation: 'Lower stress levels.' },
          { prompt: 'Some councils resist projects because of maintenance ___', answer: 'budgets', explanation: 'Maintenance budgets strained.' },
          { prompt: 'Volunteer groups create community ___', answer: 'gardens', explanation: 'Community gardens from abandoned lots.' },
          { prompt: 'Victorian cities invested in public ___', answer: 'parks', explanation: 'Investment in public parks.' },
          { prompt: 'The link between greenery and economic growth remains ___', answer: 'debated', explanation: 'Relationship remains debated.' },
        ]),
      },
    ],
  }
}

/** Gap-fill Q1–6 + MC Q7–13 */
export function ieltsReadingP1GapMcPart(): ReadingImportPartJson {
  const base = MOCK.parts[0]
  const mcGroup = base.questionGroups[1]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 1–6',
        instruction: 'Complete the notes below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(1, [
          { prompt: 'Type of parrot: ___', answer: 'flightless', explanation: 'Flightless parrot.' },
          { prompt: 'Maximum lifespan: ___ years', answer: '100', explanation: 'Up to 100 years.' },
          { prompt: 'Diet: completely ___', answer: 'vegetarian', explanation: 'Completely vegetarian diet.' },
          { prompt: 'Chicks produced when food is ___', answer: 'plentiful', explanation: 'When food plentiful.' },
          { prompt: 'Predators introduced by settlers: dogs and ___', answer: 'rats', explanation: 'Dogs and rats.' },
          { prompt: 'Safe breeding areas: predator-free ___', answer: 'islands', explanation: 'Predator-free islands.' },
        ]),
      },
      renumberGroup(mcGroup, 'Questions 7–13', 7, 7),
    ],
  }
}

/** Cam10 T1 — Match paragraph + features + MC */
export function ieltsReadingP2R2Part(): ReadingImportPartJson {
  return partToImportJson(MOCK.parts[1])
}

/** Cam10 T4 — YNNG + match paragraph + features + MC */
export function ieltsReadingP2YnngMatchPart(): ReadingImportPartJson {
  const origP2 = MOCK.parts[1]
  const ynngGroup = DEMO.parts[1].questionGroups[0]

  return {
    ...partToImportJson(origP2),
    questionGroups: [
      renumberGroup(ynngGroup, 'Questions 14–18', 14, 5),
      renumberGroup(origP2.questionGroups[0], 'Questions 19–22', 19, 4),
      renumberGroup(origP2.questionGroups[1], 'Questions 23–25', 23, 3),
      renumberGroup(origP2.questionGroups[2], 'Questions 26', 26, 1),
    ],
  }
}

const CAM11_T4_EASTER_ISLAND_HEADINGS = [
  { id: 'i', label: 'Evidence of innovative environment management practices' },
  { id: 'ii', label: 'An undisputed answer to a question about the moai' },
  { id: 'iii', label: 'A theory which supports a local belief about the moai' },
  { id: 'iv', label: 'A description of how some sites on the island were used' },
  { id: 'v', label: 'The process of creating the moai' },
  { id: 'vi', label: 'A mention of how some analyses were carried out' },
  { id: 'vii', label: 'A reference to a book which looks at many aspects of the island\'s history' },
  { id: 'viii', label: 'A reference to a particular event that took place on the island' },
  { id: 'ix', label: 'A reference to the unique character of the island\'s animals and plants' },
]

const CAM11_T4_DIAMOND_SUMMARY_NOTE = [
  "Jared Diamond's View",
  '',
  'Diamond believes that the Polynesian settlers on Rapa Nui destroyed its trees, cutting them down for fuel and clearing land for 21________. '
  + 'Twentieth-century discoveries of pollen prove that Rapa Nui had once been covered in palm forests, which had turned into grassland by the time the Europeans arrived on the island. '
  + 'When the islanders were no longer able to build the 22________ they needed to go fishing, they began using the island\'s 23________ as a food source, according to Diamond. '
  + 'Diamond also claims that the moai were built to show the power of the island\'s chieftains, and that the methods of transporting the statues needed not only a great number of people, but also a great deal of 24________.',
].join('\n')

const CAM11_T4_HUNT_LIPO_OPTS = [
  { id: 'a', label: 'the period when the moai were created' },
  { id: 'b', label: 'how the moai were transported' },
  { id: 'c', label: 'the impact of the moai on Rapanui society' },
  { id: 'd', label: 'how the moai were carved' },
  { id: 'e', label: 'the origins of the people who made the moai' },
]

/** Cam11 T4 — headings Q14–20 + summary Q21–24 + Choose TWO Q25–26 */
export function ieltsReadingP2HeadingsSummaryMcPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'Easter Island',
    passageSubtitle: 'The mystery of the moai on Rapa Nui',
    passage: [
      {
        label: 'A',
        text: 'Easter Island, or Rapa Nui as it is known locally, is home to several hundred ancient stone statues, or moai, whose existence has captivated explorers and researchers. When Europeans first arrived in 1722, they found a treeless landscape and a society that had declined dramatically from its peak.',
      },
      {
        label: 'B',
        text: 'Archaeological surveys have revealed that the island was once covered in palm forests. Pollen records show a sharp decline in tree cover after Polynesian settlement, supporting theories that deforestation played a central role in ecological collapse.',
      },
      {
        label: 'C',
        text: 'Local oral tradition holds that the moai walked to their platforms. Recent experimental archaeology suggests that teams could have moved the statues upright using ropes and coordinated rocking — a theory that resonates with indigenous accounts.',
      },
      {
        label: 'D',
        text: 'Quarries at Rano Raraku supplied the volcanic tuff from which most moai were carved. Incomplete statues still lie in the rock face, showing stages of production from outline to detachment.',
      },
      {
        label: 'E',
        text: 'Chemical and radiocarbon analyses of tools, charcoal and bone fragments have helped researchers reconstruct diet, fuel use and construction timelines across different periods of island history.',
      },
      {
        label: 'F',
        text: 'In 1960 a tsunami struck the coast, toppling some moai and platforms. The event reminded conservation teams how vulnerable coastal sites remain to natural forces.',
      },
      {
        label: 'G',
        text: 'Jared Diamond\'s book Collapse discusses Rapa Nui alongside other societies that failed to manage resources sustainably. His account emphasises deforestation, competition between clans and ecological limits.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–20',
        instruction: 'Reading Passage 2 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below.',
        note: 'There are more headings than paragraphs, so you will not use all of them.',
        type: 'matching-headings',
        headings: CAM11_T4_EASTER_ISLAND_HEADINGS,
        questions: [
          { number: 14, type: 'matching-headings', prompt: 'Paragraph A', options: [], answer: 'iii', explanation: 'Đoạn A giới thiệu moai và bối cảnh suy thoái — heading iii (theory + local belief).' },
          { number: 15, type: 'matching-headings', prompt: 'Paragraph B', options: [], answer: 'i', explanation: 'Pollen chứng minh quản lý môi trường / deforestation — heading i.' },
          { number: 16, type: 'matching-headings', prompt: 'Paragraph C', options: [], answer: 'ii', explanation: 'Moai "walked" — undisputed answer về moai trong truyền thuyết địa phương.' },
          { number: 17, type: 'matching-headings', prompt: 'Paragraph D', options: [], answer: 'v', explanation: 'Mô tả quy trình tạc tượng tại Rano Raraku.' },
          { number: 18, type: 'matching-headings', prompt: 'Paragraph E', options: [], answer: 'vi', explanation: 'Phân tích hóa học và radiocarbon.' },
          { number: 19, type: 'matching-headings', prompt: 'Paragraph F', options: [], answer: 'viii', explanation: 'Sự kiện sóng thần năm 1960.' },
          { number: 20, type: 'matching-headings', prompt: 'Paragraph G', options: [], answer: 'vii', explanation: 'Tham chiếu sách Collapse của Diamond.' },
        ],
      },
      {
        range: 'Questions 21–24',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        note: CAM11_T4_DIAMOND_SUMMARY_NOTE,
        questions: gapQuestions(21, [
          { prompt: 'Gap (21)', answer: 'farming', explanation: 'Clearing land for farming / agriculture.' },
          { prompt: 'Gap (22)', answer: 'canoes', explanation: 'Không còn gỗ để làm canoes đi câu.' },
          { prompt: 'Gap (23)', answer: 'birds', explanation: 'Dùng chim làm nguồn thực phẩm.' },
          { prompt: 'Gap (24)', answer: 'wood', explanation: 'Cần nhiều wood để vận chuyển moai.' },
        ]),
      },
      {
        range: 'Questions 25–26',
        instruction: 'Choose TWO correct answers, A–E.',
        type: 'multiple-choice',
        questions: [
          {
            number: 25,
            type: 'multiple-choice',
            prompt: 'On what points do Hunt and Lipo disagree with Diamond? (first answer)',
            options: CAM11_T4_HUNT_LIPO_OPTS,
            answer: 'b',
            explanation: 'B — cách vận chuyển moai (walking theory).',
          },
          {
            number: 26,
            type: 'multiple-choice',
            prompt: 'On what points do Hunt and Lipo disagree with Diamond? (second answer)',
            options: CAM11_T4_HUNT_LIPO_OPTS,
            answer: 'c',
            explanation: 'C — tác động moai lên xã hội Rapanui.',
          },
        ],
      },
    ],
  }
}

const CAM11_T3_MIGRATION_ENDINGS_BANK = [
  { id: 'a', label: 'be discouraged by difficulties.' },
  { id: 'b', label: 'travel in open land where they can look out for predators.' },
  { id: 'c', label: 'eat more than they need for immediate purposes.' },
  { id: 'd', label: 'be repeated daily.' },
  { id: 'e', label: 'ignore distractions.' },
  { id: 'f', label: 'be governed by the availability of water.' },
  { id: 'g', label: 'follow a straight line.' },
]

const CAM11_T3_PRONGHORN_SUMMARY_NOTE = [
  'The migration of pronghorns',
  '',
  'Pronghorns rely on their eyesight and 23________ to avoid predators. One particular population\'s summer '
  + 'habitat is a national park, and their winter home is on the 24________, where they go to avoid the danger '
  + 'presented by the snow at that time of year. However, their route between these two areas contains three '
  + '25________. One problem is the construction of new homes in a narrow 26________ of land on the pronghorns\' route.',
].join('\n')

/** Cam11 T3 — TFNG Q14–18 + sentence endings Q19–22 + summary ONE WORD Q23–26 */
export function ieltsReadingP2TfngEndingsSummaryPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'Great Migrations',
    passageSubtitle: 'Animal migration, however it is defined, is far more than just the movement of animals',
    passage: [
      {
        text: 'Animal migration, however it is defined, is far more than just the movement of animals. It can loosely be described as travel that takes animals at least partly out of their embedded circumstances, and that carries them beyond the reach of local environmental influences. The biologist Hugh Dingle has identified five characteristics that apply, in varying degrees and combinations, to all migrations. They are prolonged movements that carry animals outside familiar habitats; they tend to be linear, not zigzaggy; they involve special behaviour concerning preparation (such as overfeeding) and arrival; and they demand large allocations of energy. And one more: migrating animals maintain an intense attentiveness to the greater mission, which keeps them undistracted by temptations and undeterred by challenges.',
      },
      {
        text: 'An arctic tern, on its 20,000 km flight from the extreme south of South America to the Arctic circle will take no notice of a nice smelly herring offered from a bird-watcher\'s boat along the way. While local gulls will dive voraciously for such handouts, the tern flies on. Why? The arctic tern resists distraction because it is driven at the moment by an instinctive sense of something we humans find admirable: larger purpose.',
      },
      {
        text: 'But migration is a complex issue, and biologists define it differently, depending on what sorts of animals they study. Some scientists hold that aphids, tiny insects that live on plants, migrate when they are carried far from their starting point by a storm. But others object that this is not migration, because it is not intentional.',
      },
      {
        text: 'Dingle is an evolutionary biologist who studies insect behaviour at the University of Michigan. His definition is more intricate than Berger\'s, citing those five features that distinguish migration from other forms of movement. They allow for the fact that, for example, aphids will become sensitive to blue light (from the sky) when it\'s time for takeoff on their big journey, and sensitive to yellow light (reflected from tender young leaves) when it\'s appropriate to land.',
      },
      {
        text: 'But daily vertical movements, which Dingle considers a kind of migration, are not intentional. They happen, for example, to marine plankton that rise to the surface at night to feed and sink by day to avoid predators.',
      },
      {
        text: 'Human behaviour, however, is having a detrimental impact on animal migration. Pronghorn, dependent on distance vision and speed to keep safe from predators, follow an ancient route between their summer and winter homes. For 20 kilometres in one stretch, the migration path is reduced to a width of about 150 metres, as a forested hill rises to form a V, leaving a corridor of open ground.',
      },
      {
        text: 'Conservation scientists, along with some biologists and land managers within the USA\'s National Forest Service and Fish and Wildlife Service, are working to unravel the mysteries of migration corridors. One population of pronghorns migrates 350 kilometres between summer range in Grand Teton National Park and winter range on the plains below. If they can\'t pass through again in autumn, escaping south onto those windblown plains, they are likely to die trying to overwinter in the deep snow.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–18',
        instruction: 'Do the following statements agree with the information given in Reading Passage 2? In boxes 14–18 on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        type: 'tfng',
        questions: [
          {
            number: 14,
            type: 'true-false-not-given',
            prompt: 'Local gulls and migrating arctic terns behave in the same way when offered food.',
            options: TFNG_OPTIONS,
            answer: 'false',
            explanation: 'Gulls dive for handouts; terns fly on — hành vi khác nhau.',
          },
          {
            number: 15,
            type: 'true-false-not-given',
            prompt: 'Experts\' definitions of migration tend to vary according to their area of study.',
            options: TFNG_OPTIONS,
            answer: 'true',
            explanation: 'Biologists define migration differently depending on animals studied.',
          },
          {
            number: 16,
            type: 'true-false-not-given',
            prompt: 'Very few experts agree that the movement of aphids can be considered migration.',
            options: TFNG_OPTIONS,
            answer: 'not-given',
            explanation: 'Passage nêu tranh luận nhưng không nói "very few experts agree".',
          },
          {
            number: 17,
            type: 'true-false-not-given',
            prompt: 'Aphids\' journeys are affected by changes in the light that they perceive.',
            options: TFNG_OPTIONS,
            answer: 'true',
            explanation: 'Sensitive to blue/yellow light for takeoff and landing.',
          },
          {
            number: 18,
            type: 'true-false-not-given',
            prompt: 'Dingle\'s aim is to distinguish between the migratory behaviours of different species.',
            options: TFNG_OPTIONS,
            answer: 'false',
            explanation: 'Dingle distinguishes migration from other forms of movement.',
          },
        ],
      },
      {
        range: 'Questions 19–22',
        instruction: 'Complete each sentence with the correct ending, A–G, below. Write the correct letter in boxes 19–22 on your answer sheet.',
        type: 'summary-completion',
        wordBank: CAM11_T3_MIGRATION_ENDINGS_BANK,
        questions: [
          { number: 19, type: 'summary-completion', prompt: 'According to Dingle, migratory routes are likely to', options: [], answer: 'g', explanation: 'Migrations tend to be linear — follow a straight line.' },
          { number: 20, type: 'summary-completion', prompt: 'To prepare for migration, animals are likely to', options: [], answer: 'c', explanation: 'Special behaviour including overfeeding.' },
          { number: 21, type: 'summary-completion', prompt: 'During migration, animals are unlikely to', options: [], answer: 'a', explanation: 'Undeterred by challenges — not discouraged.' },
          { number: 22, type: 'summary-completion', prompt: 'Arctic terns illustrate migrating animals\' ability to', options: [], answer: 'e', explanation: 'Resists distraction — ignore distractions.' },
        ],
      },
      {
        range: 'Questions 23–26',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        note: CAM11_T3_PRONGHORN_SUMMARY_NOTE,
        questions: gapQuestions(23, [
          { prompt: 'Gap (23)', answer: 'speed', explanation: 'Dependent on distance vision and speed.' },
          { prompt: 'Gap (24)', answer: 'plains', explanation: 'Winter range on the plains below.' },
          { prompt: 'Gap (25)', answer: 'bottlenecks', explanation: 'Route constricted at three bottlenecks.' },
          { prompt: 'Gap (26)', answer: 'corridor', explanation: 'Corridor of open ground only 150 metres wide.' },
        ]),
      },
    ],
  }
}

/** Cam11 T1 — TFNG Q14–19 + diagram labeling ONE WORD Q20–26 */
export function ieltsReadingP2TfngDiagramPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'The Falkirk Wheel',
    passageSubtitle: 'A unique engineering achievement',
    passage: [
      {
        text: 'The Falkirk Wheel in Scotland is the world\'s first and only rotating boat lift. Opened in 2002, it is central to the ambitious £84.5m Millennium Link project to restore navigability across Scotland by reconnecting the historic waterways of the Forth & Clyde and Union Canals.',
      },
      {
        text: 'The major challenge of the project lay in the fact that the Forth & Clyde Canal is situated 35 metres below the level of the Union Canal. Historically, the two canals had been joined near the town of Falkirk by a sequence of 11 locks — enclosed sections of canal in which the water level could be raised or lowered — that stepped down across a distance of 1.5 km. This had been dismantled in 1933, thereby breaking the link. When the project was launched in 1994, the British Waterways authority were keen to create a dramatic twenty-first-century landmark which would not only be a fitting commemoration of the Millennium, but also a lasting symbol of the economic regeneration of the region.',
      },
      {
        text: 'Numerous ideas were submitted for the project, including concepts ranging from rolling eggs to tilting tanks, from giant see-saws to overhead monorails. The eventual winner was a plan for the huge rotating steel boat lift which was to become The Falkirk Wheel. The unique shape of the structure is claimed to have been inspired by various sources, both manmade and natural, most notably a Celtic double-headed axe, but also the vast turning propeller of a ship, the ribcage of a whale or the spine of a fish.',
      },
      {
        text: 'The various parts of The Falkirk Wheel were all constructed and assembled, like one giant toy building set, at Butterley Engineering\'s Steelworks in Derbyshire, some 400 km from Falkirk. A team there carefully assembled the 1,200 tonnes of steel, painstakingly fitting the pieces together to an accuracy of just 10 mm to ensure a perfect final fit. In the summer of 2001, the structure was then dismantled and transported on 35 lorries to Falkirk, before all being bolted back together again on the ground, and finally lifted into position in five large sections by crane. The Wheel would need to withstand immense and constantly changing stresses as it rotated, so to make the structure more robust, the steel sections were bolted rather than welded together. Over 45,000 bolt holes were matched with their bolts, and each bolt was hand-tightened.',
      },
      {
        text: 'The Wheel consists of two sets of opposing axe-shaped arms, attached about 25 metres apart to a fixed central spine. Two diametrically opposed water-filled \'gondolas\', each with a capacity of 360,000 litres, are fitted between the ends of the arms. These gondolas always weigh the same, whether or not they are carrying boats. This is because, according to Archimedes\' principle of displacement, floating objects displace their own weight in water. So when a boat enters a gondola, the amount of water leaving the gondola weighs exactly the same as the boat. This keeps the Wheel balanced and so, despite its enormous mass, it rotates through 180° in five and a half minutes while using very little power.',
      },
      {
        text: 'Boats needing to be lifted up enter the canal basin at the level of the Forth & Clyde Canal and then enter the lower gondola of the Wheel. Two hydraulic steel gates are raised, so as to seal the gondola off from the water in the canal basin. The water between the gates is then pumped out. A hydraulic clamp, which prevents the arms of the Wheel moving while the gondola is docked, is removed, allowing the Wheel to turn. In the central machine room an array of ten hydraulic motors then begins to rotate the central axle. The axle connects to the outer arms of the Wheel, which begin to rotate at a speed of 1/8 of a revolution per minute. As the wheel rotates, the gondolas are kept in the upright position by a simple gearing system. Two eight-metre-wide cogs orbit a fixed inner cog of the same width, connected by two smaller cogs travelling in the opposite direction to the outer cogs — so ensuring that the gondolas always remain level. When the gondola reaches the top, the boat passes straight onto the aqueduct situated 24 metres above the canal basin.',
      },
      {
        text: 'The remaining 11 metres of lift needed to reach the Union Canal is achieved by means of a pair of locks. The Wheel could not be constructed to elevate boats over the full 35-metre difference between the two canals, owing to the presence of the historically important Antonine Wall, which was built by the Romans in the second century AD. Boats travel under this wall via a tunnel, then through the locks, and finally on to the Union Canal.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–19',
        instruction: 'Do the following statements agree with the information given in Reading Passage 2? In boxes 14–19 on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        type: 'tfng',
        questions: [
          {
            number: 14,
            type: 'true-false-not-given',
            prompt: 'The Falkirk Wheel has linked the Forth & Clyde Canal with the Union Canal for the first time in their history.',
            options: TFNG_OPTIONS,
            answer: 'false',
            explanation: 'Hai kênh đã được nối trước đó bằng 11 locks — dismantled 1933.',
          },
          {
            number: 15,
            type: 'true-false-not-given',
            prompt: 'There was some opposition to the design of the Falkirk Wheel at first.',
            options: TFNG_OPTIONS,
            answer: 'not-given',
            explanation: 'Passage nêu nhiều ý tưởng nhưng không nói opposition.',
          },
          {
            number: 16,
            type: 'true-false-not-given',
            prompt: 'The Falkirk Wheel was initially put together at the location where its components were manufactured.',
            options: TFNG_OPTIONS,
            answer: 'true',
            explanation: 'Constructed and assembled at Butterley Engineering\'s Steelworks.',
          },
          {
            number: 17,
            type: 'true-false-not-given',
            prompt: 'The Falkirk Wheel is the only boat lift in the world which has steel sections bolted together by hand.',
            options: TFNG_OPTIONS,
            answer: 'not-given',
            explanation: 'Each bolt hand-tightened nhưng không nói "only boat lift in the world".',
          },
          {
            number: 18,
            type: 'true-false-not-given',
            prompt: 'The weight of the gondolas varies according to the size of boat being carried.',
            options: TFNG_OPTIONS,
            answer: 'false',
            explanation: 'Gondolas always weigh the same — Archimedes displacement.',
          },
          {
            number: 19,
            type: 'true-false-not-given',
            prompt: 'The construction of the Falkirk Wheel site took into account the presence of a nearby ancient monument.',
            options: TFNG_OPTIONS,
            answer: 'true',
            explanation: 'Presence of historically important Antonine Wall.',
          },
        ],
      },
      {
        range: 'Questions 20–26',
        instruction: 'Label the diagram below. Choose ONE WORD from the passage for each answer.',
        type: 'gap-fill',
        imageFile: 'falkirk-wheel-diagram.jpg',
        questions: gapQuestions(20, [
          { prompt: 'Gap (20)', answer: 'gates', explanation: 'Two hydraulic steel gates raised to seal gondola.' },
          { prompt: 'Gap (21)', answer: 'clamp', explanation: 'Hydraulic clamp removed to allow wheel to turn.' },
          { prompt: 'Gap (22)', answer: 'axle', explanation: 'Hydraulic motors rotate the central axle.' },
          { prompt: 'Gap (23)', answer: 'cogs', explanation: 'Range of different-sized cogs keep gondolas upright.' },
          { prompt: 'Gap (24)', answer: 'aqueduct', explanation: 'Boat passes onto aqueduct at top.' },
          { prompt: 'Gap (25)', answer: 'wall', explanation: 'Tunnel beneath Roman Antonine Wall.' },
          { prompt: 'Gap (26)', answer: 'locks', explanation: 'Pair of locks achieve remaining 11m lift.' },
        ]),
      },
    ],
  }
}

const CAM12_T8_LOST_CITY_HEADINGS = [
  { id: 'i', label: 'Different accounts of the same journey' },
  { id: 'ii', label: 'How two men brought about a modern disaster' },
  { id: 'iii', label: 'A common belief' },
  { id: 'iv', label: 'The aim of the trip' },
  { id: 'v', label: 'A dramatic description' },
  { id: 'vi', label: 'A new route' },
  { id: 'vii', label: 'Bingham publishes his theory' },
  { id: 'viii', label: 'Bingham\'s lack of enthusiasm' },
]

/** Cam12 T8 — headings Q14–20 + TFNG Q21–24 + sentence ONE WORD Q25–26 */
export function ieltsReadingP2HeadingsTfngSentencePart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'The Lost City',
    passageSubtitle: 'Hiram Bingham and the discovery of Machu Picchu',
    passage: [
      {
        label: 'A',
        text: 'The US explorer and academic Hiram Bingham arrived in South America in 1911 to explore the remote hinterland to the west of Cusco, the old capital of the Inca empire in the Andes mountains of Peru. His goal was to locate the remains of a city called Vitcos, the last capital of the Inca civilisation. Bingham\'s plan was to descend from this plateau and follow a river down to the Amazon, and then return to Cusco via a different route.',
      },
      {
        label: 'B',
        text: 'When Bingham and his team set off down the Urubamba in late July, they had an advantage over travellers who had gone before them: a track had recently been blasted down the valley canyon to enable rubber to be brought up by mules from the jungle. Almost all previous travellers had left the river at Ollantaytambo and taken a high pass across the mountains to the north of the site, but also therefore never passing through the area around Machu Picchu.',
      },
      {
        label: 'C',
        text: 'On 24 July Bingham and his team were a few days into their descent of the Urubamba valley. His companions showed no interest in accompanying him up the nearby hill to see some ruins that a local farmer, Melchor Arteaga, had told them about the night before. Bingham also seemed to have been less than keen on the prospect of climbing the hill. In his book Lost City of the Incas, he relates that he made the ascent without having the least expectation that he would find anything at the top.',
      },
      {
        label: 'D',
        text: 'Bingham writes about the approach in vivid style in his book. In the beginning there is the ever-present possibility of deadly snakes capable of making considerable springs when in pursuit of their prey; he climbs up the hill but does not see any. Then there is a sense of mounting discovery as he comes across great sweeps of terraces, then a mausoleum, followed by monumental staircases and, finally, the grand ceremonial buildings of Machu Picchu. It seemed like an unbelievable dream.',
      },
      {
        label: 'E',
        text: 'His journal entries of the time reveal a much more gradual appreciation of his achievement. While noting down his experience and the dimensions of some of the buildings, he did not realise the extent or the importance of the site, nor did he realise what use he could make of the discovery. When he rejoined his companions, to whom he seems to have said little about his discovery, they were busy with their own concerns.',
      },
      {
        label: 'F',
        text: 'When Bingham came to write the National Geographic magazine article that broke the story to the world in April 1913, he knew he had to produce a big idea. He wondered whether Machu Picchu could have been the birthplace of the very first Inca, Manco the Great, and whether it could also have been what chroniclers described as "the last city of the Incas". He made desperate attempts to prove this belief for nearly 40 years. Sadly, his vision of the site as both the beginning and end of the Inca civilisation is inaccurate.',
      },
      {
        label: 'G',
        text: 'An idea which has gained wide acceptance over the past few years is that Machu Picchu was a moya, a country estate built by an Inca emperor to escape the cold winters of Cusco, where the elite could enjoy monumental architecture and spectacular views. Other theories suggest it was a religious sanctuary or an administrative centre. Whatever its purpose, the ruins remain one of the most remarkable archaeological sites in the Americas.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–20',
        instruction: 'Reading Passage 2 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below.',
        note: 'There are more headings than paragraphs, so you will not use all of them.',
        type: 'matching-headings',
        headings: CAM12_T8_LOST_CITY_HEADINGS,
        questions: [
          { number: 14, type: 'matching-headings', prompt: 'Paragraph A', options: [], answer: 'iv', explanation: 'Mục tiêu tìm Vitcos và kế hoạch hành trình — heading iv (The aim of the trip).' },
          { number: 15, type: 'matching-headings', prompt: 'Paragraph B', options: [], answer: 'vi', explanation: 'Đường mới xuống Urubamba — heading vi (A new route).' },
          { number: 16, type: 'matching-headings', prompt: 'Paragraph C', options: [], answer: 'viii', explanation: 'Bingham không hào hứng leo đồi — heading viii.' },
          { number: 17, type: 'matching-headings', prompt: 'Paragraph D', options: [], answer: 'v', explanation: 'Mô tả sinh động khi lên đỉnh — heading v (A dramatic description).' },
          { number: 18, type: 'matching-headings', prompt: 'Paragraph E', options: [], answer: 'i', explanation: 'Nhật ký khác với cách kể với đồng đội — heading i (Different accounts).' },
          { number: 19, type: 'matching-headings', prompt: 'Paragraph F', options: [], answer: 'vii', explanation: 'Bài National Geographic 1913 — heading vii (publishes his theory).' },
          { number: 20, type: 'matching-headings', prompt: 'Paragraph G', options: [], answer: 'iii', explanation: 'Ý tưởng moya được chấp nhận rộng rãi — heading iii (A common belief).' },
        ],
      },
      {
        range: 'Questions 21–24',
        instruction: 'Do the following statements agree with the information given in Reading Passage 2? In boxes 21–24 on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        type: 'tfng',
        questions: [
          {
            number: 21,
            type: 'true-false-not-given',
            prompt: 'Bingham went to South America in search of an Inca city.',
            options: TFNG_OPTIONS,
            answer: 'true',
            explanation: 'Đến Peru tìm Vitcos — thủ đô cuối của Inca.',
          },
          {
            number: 22,
            type: 'true-false-not-given',
            prompt: 'Bingham chose a route through the Urubamba valley in preference to others because it was more direct.',
            options: TFNG_OPTIONS,
            answer: 'false',
            explanation: 'Đường mới vừa được đục — du khách trước đi đường khác qua đèo.',
          },
          {
            number: 23,
            type: 'true-false-not-given',
            prompt: 'Bingham understood the significance of Machu Picchu as soon as he saw it.',
            options: TFNG_OPTIONS,
            answer: 'false',
            explanation: 'Nhật ký cho thấy chỉ dần nhận ra tầm quan trọng.',
          },
          {
            number: 24,
            type: 'true-false-not-given',
            prompt: 'Bingham returned to Machu Picchu in order to find evidence to support his theory.',
            options: TFNG_OPTIONS,
            answer: 'not-given',
            explanation: 'Passage không nói ông quay lại tìm bằng chứng.',
          },
        ],
      },
      {
        range: 'Questions 25–26',
        instruction: 'Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'sentence-completion',
        questions: sentenceQuestions(25, [
          {
            prompt: 'The track that took Bingham down the Urubamba valley had been created for the transportation of ___',
            answer: 'rubber',
            explanation: 'Đường mới để kéo rubber từ rừng bằng mules.',
          },
          {
            prompt: 'Bingham found out about the ruins of Machu Picchu from a ___ in the Urubamba valley.',
            answer: 'farmer',
            explanation: 'Nông dân Melchor Arteaga kể về ruins.',
          },
        ]),
      },
    ],
  }
}

const CAM12_T8_LYNX_WORD_BANK = [
  { id: 'a', label: 'trees' },
  { id: 'b', label: 'endangered species' },
  { id: 'c', label: 'hillsides' },
  { id: 'd', label: 'wild animals' },
  { id: 'e', label: 'humans' },
  { id: 'f', label: 'farm animals' },
]

const CAM12_T8_LYNX_SUMMARY_NOTE = [
  'Reintroducing the lynx to Britain',
  '',
  'There would be many advantages to reintroducing the lynx to Britain. While there is no evidence that the lynx has ever put 19________ in danger, it would reduce the numbers of certain 20________ whose populations have increased enormously in recent decades. It would present only a minimal threat to 21________, provided these were kept away from lynx habitats. Furthermore, the reintroduction programme would also link efficiently with initiatives to return native 22________ to certain areas of the country.',
].join('\n')

/** Cam12 T8 — MC Q14–18 + summary word bank Q19–22 + YNNG Q23–26 */
export function ieltsReadingP2McSummaryYnngPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'Bring back the big cats',
    passageSubtitle: 'It\'s time to start returning vanished native animals to Britain, says John Vesty',
    passage: [
      {
        text: 'There is a poem, written around 598 AD, which describes hunting a mystery animal called a llewyn. But what was it? Nothing seemed to fit, until 2006, when an animal bone, dating from around the same period, was found in the Kinsey Cave in northern England. Until this discovery, the lynx - a large spotted cat with tasselled ears - was presumed to have died out in Britain at least 6,000 years ago, before the inhabitants of these islands took up farming. But the 2006 find, together with three others in Yorkshire and Scotland, is compelling evidence that the lynx and the mysterious llewyn were in fact one and the same animal. If this is so, it would bring forward the tassel-eared cat\'s estimated extinction date by roughly 5,000 years.',
      },
      {
        text: 'However, this is not quite the last glimpse of the animal in British culture. A 9th-century stone cross from the Isle of Eigg shows, alongside the deer, boar and aurochs pursued by a mounted hunter, a speckled cat with tasselled ears. Were it not for the animal\'s backside having worn away with time, we could have been certain, as the lynx\'s stubby tail is unmistakable. But even without this key feature, it\'s hard to see what else the creature could have been. The lynx is now becoming the totemic animal of a movement that is transforming British environmentalism: rewilding.',
      },
      {
        text: 'Rewilding means the mass restoration of damaged ecosystems. It involves letting trees return to places that have been denuded, allowing parts of the seabed to recover from trawling and dredging, permitting rivers to flow freely again. Above all, it means bringing back missing species. One of the most striking findings of modern ecology is that ecosystems without large predators behave in completely different ways from those that retain them. Some of them drive dynamic processes that resonate through the whole food chain, creating niches for hundreds of species that might otherwise struggle to survive. The killers turn out to be bringers of life.',
      },
      {
        text: 'Such findings present a big challenge to British conservation, which has often selected arbitrary assemblages of plants and animals and sought, at great effort and expense, to prevent them from changing. It has tried to preserve the living world as if it were a jar of pickles, letting nothing in and nothing out, keeping nature in a state of arrested development. But ecosystems are not merely collections of species; they are also the dynamic and ever-shifting relationships between them. And this dynamism often depends on large predators.',
      },
      {
        text: 'At sea the potential is even greater: by protecting large areas from commercial fishing, we could once more see what 18th-century literature describes: vast shoals of fish being chased by fin and sperm whales, within sight of the English shore. This policy would also greatly boost catches in the surrounding seas; the fishing industry\'s insistence on scouring every inch of seabed, leaving no breeding reserves, could not be more damaging to its own interests.',
      },
      {
        text: 'Rewilding is a rare example of an environmental movement in which campaigners articulate what they are for rather than only what they are against. One of the reasons why the enthusiasm for rewilding is spreading so quickly in Britain is that it helps to create a more inspiring vision than the green movement\'s usual promise of "Follow us and the world will be slightly less awful than it would otherwise have been."',
      },
      {
        text: 'The lynx presents no threat to human beings: there is no known instance of one preying on people. It is a specialist predator of roe deer, a species that has exploded in Britain in recent decades, holding back, by intensive browsing, attempts to re-establish forests. It will also winkle out sika deer: an exotic species that is almost impossible for human beings to control, as it hides in impenetrable plantations of young trees. The attempt to reintroduce this predator marries well with the aim of bringing forests back to parts of our bare and barren uplands. The lynx requires deep cover, and as such presents little risk to sheep and other livestock, which are supposed, as a condition of farm subsidies, to be kept out of the woods.',
      },
      {
        text: 'On a recent trip to the Cairngorm Mountains, I heard several conservationists suggest that the lynx could be reintroduced there within 20 years. If trees return to the bare hills elsewhere in Britain, the big cats could soon follow. There is nothing extraordinary about these proposals, seen from the perspective of anywhere else in Europe. The lynx has now been reintroduced to the Pyrenees, the Alps, the Jura in eastern France and the Harz mountains in Germany, and has re-established itself in many more places. The European population has tripled since 1970 to roughly 10,000. As with wolves, bears, beavers, boar, bison, moose and many other species, the lynx has been able to spread as farming has left the hills and people discover that it is more lucrative to protect charismatic wildlife than to hunt it, as tourists will pay for the chance to see it. Large-scale rewilding is happening almost everywhere - except Britain.',
      },
      {
        text: 'Here, attitudes are just beginning to change. Conservationists are starting to accept that the old preservation-jar model is failing, even on its own terms. Already, projects such as Trees for Life in the Highlands provide a hint of what might be coming. An organisation is being set up that will seek to catalyse the rewilding of land and sea across Britain, its aim being to reintroduce that rarest of species to British ecosystems: hope.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–18',
        instruction: 'Choose the correct answer.',
        type: 'multiple-choice',
        questions: [
          {
            number: 14,
            type: 'multiple-choice',
            prompt: 'What did the 2006 discovery of the animal bone reveal about the lynx?',
            options: [
              { id: 'a', label: 'Its physical appearance was very distinctive.' },
              { id: 'b', label: 'Its extinction was linked to the spread of farming.' },
              { id: 'c', label: 'It vanished from Britain several thousand years ago.' },
              { id: 'd', label: 'It survived in Britain longer than was previously thought.' },
            ],
            answer: 'd',
            explanation: '2006 find đẩy ngày tuyệt chủng lùi khoảng 5.000 năm — sống lâu hơn nghĩ.',
          },
          {
            number: 15,
            type: 'multiple-choice',
            prompt: 'What point does the writer make about large predators in the third paragraph?',
            options: [
              { id: 'a', label: 'Their presence can increase biodiversity.' },
              { id: 'b', label: 'They may cause damage to local ecosystems.' },
              { id: 'c', label: 'Their behaviour can alter according to the environment.' },
              { id: 'd', label: 'They should be reintroduced only to areas where they were native.' },
            ],
            answer: 'a',
            explanation: 'Large predators tạo niches cho hàng trăm loài — tăng đa dạng sinh học.',
          },
          {
            number: 16,
            type: 'multiple-choice',
            prompt: 'What does the writer suggest about British conservation in the fourth paragraph?',
            options: [
              { id: 'a', label: 'It has failed to achieve its aims.' },
              { id: 'b', label: 'It is beginning to change direction.' },
              { id: 'c', label: 'It has taken a misguided approach.' },
              { id: 'd', label: 'It has focused on the most widespread species.' },
            ],
            answer: 'c',
            explanation: 'Giữ thiên nhiên như jar of pickles — cách tiếp cận sai lầm.',
          },
          {
            number: 17,
            type: 'multiple-choice',
            prompt: 'Protecting large areas of the sea from commercial fishing would result in',
            options: [
              { id: 'a', label: 'practical benefits for the fishing industry.' },
              { id: 'b', label: 'some short-term losses to the fishing industry.' },
              { id: 'c', label: 'widespread opposition from the fishing industry.' },
              { id: 'd', label: 'certain changes to techniques within the fishing industry.' },
            ],
            answer: 'a',
            explanation: 'Policy would greatly boost catches in surrounding seas.',
          },
          {
            number: 18,
            type: 'multiple-choice',
            prompt: 'According to the author, what distinguishes rewilding from other environmental campaigns?',
            options: [
              { id: 'a', label: 'Its objective is more achievable.' },
              { id: 'b', label: 'Its supporters are more articulate.' },
              { id: 'c', label: 'Its positive message is more appealing.' },
              { id: 'd', label: 'It is based on sounder scientific principles.' },
            ],
            answer: 'c',
            explanation: 'Rewilding tạo tầm nhìn truyền cảm hơn — thông điệp tích cực.',
          },
        ],
      },
      {
        range: 'Questions 19–22',
        instruction: 'Complete the summary using the list of phrases, A–F, below.',
        type: 'summary-completion',
        note: CAM12_T8_LYNX_SUMMARY_NOTE,
        wordBank: CAM12_T8_LYNX_WORD_BANK,
        questions: [
          { number: 19, type: 'summary-completion', prompt: 'Gap (19)', options: [], answer: 'e', explanation: 'Không có bằng chứng lynx từng đe dọa humans.' },
          { number: 20, type: 'summary-completion', prompt: 'Gap (20)', options: [], answer: 'd', explanation: 'Giảm số lượng wild animals (roe deer, sika deer).' },
          { number: 21, type: 'summary-completion', prompt: 'Gap (21)', options: [], answer: 'f', explanation: 'Ít rủi ro với farm animals nếu giữ khỏi habitat lynx.' },
          { number: 22, type: 'summary-completion', prompt: 'Gap (22)', options: [], answer: 'a', explanation: 'Liên kết với initiatives trồng lại trees.' },
        ],
      },
      {
        range: 'Questions 23–26',
        instruction: 'Do the following statements agree with the claims of the writer in Reading Passage 2? Write YES, NO or NOT GIVEN.',
        type: 'ynng',
        questions: [
          {
            number: 23,
            type: 'yes-no-not-given',
            prompt: 'Britain could become the first European country to reintroduce the lynx.',
            options: YNNG_OPTIONS,
            answer: 'no',
            explanation: 'Lynx đã tái thả ở nhiều nước châu Âu — Britain không phải đầu tiên.',
          },
          {
            number: 24,
            type: 'yes-no-not-given',
            prompt: 'The large growth in the European lynx population since 1970 has exceeded conservationists\' expectations.',
            options: YNNG_OPTIONS,
            answer: 'not-given',
            explanation: 'Population tripled — không nói vượt kỳ vọng nhà bảo tồn.',
          },
          {
            number: 25,
            type: 'yes-no-not-given',
            prompt: 'Changes in agricultural practices have extended the habitat of the lynx in Europe.',
            options: YNNG_OPTIONS,
            answer: 'yes',
            explanation: 'Lynx spread as farming has left the hills.',
          },
          {
            number: 26,
            type: 'yes-no-not-given',
            prompt: 'It has become apparent that species reintroduction has commercial advantages.',
            options: YNNG_OPTIONS,
            answer: 'yes',
            explanation: 'More lucrative to protect wildlife — tourists pay to see it.',
          },
        ],
      },
    ],
  }
}

const CAM13_T1_BOREDOM_HEADINGS = [
  { id: 'i', label: 'The productive outcomes that may result from boredom' },
  { id: 'ii', label: 'What teachers can do to prevent boredom' },
  { id: 'iii', label: 'A new explanation and a new cure for boredom' },
  { id: 'iv', label: 'Problems with a scientific approach to boredom' },
  { id: 'v', label: 'A potential danger arising from boredom' },
  { id: 'vi', label: 'Creating a system of classification for feelings of boredom' },
  { id: 'vii', label: 'Age groups most affected by boredom' },
  { id: 'viii', label: 'Identifying those most affected by boredom' },
]

const CAM13_T1_BOREDOM_IDEAS = [
  { id: 'a', name: 'The way we live today may encourage boredom.' },
  { id: 'b', name: 'One sort of boredom is worse than all the others.' },
  { id: 'c', name: 'Levels of boredom may fall in the future.' },
  { id: 'd', name: 'Trying to cope with boredom can increase its negative effects.' },
  { id: 'e', name: 'Boredom may encourage us to avoid an unpleasant experience.' },
]

const CAM13_T1_BOREDOM_SUMMARY_NOTE = [
  'Responses to boredom',
  '',
  'For John Eastwood, the central feature of boredom is that people cannot 24________ due to a failure in what he calls the \'attention system\'; and as a result they become frustrated and irritable. His team suggests that those for whom 25________ is an important aim in life may have problems in coping with boredom, whereas those who have the characteristic of 26________ can generally cope with it.',
].join('\n')

/** Cam13 T1 — headings Q14–19 + match ideas Q20–23 + summary Q24–26 */
export function ieltsReadingP2HeadingsMatchSummaryPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'Why being bored is stimulating – and useful, too',
    passageSubtitle: 'This most common of emotions is turning out to be more interesting than we thought',
    passage: [
      {
        label: 'A',
        text: 'We all know how it feels – it\'s impossible to keep your mind on anything, time stretches out, and all the things you could do seem equally unlikely to make you feel better. But defining boredom so that it can be studied in the lab has proved difficult. For a start, it can include a lot of other mental states, such as frustration, apathy, depression and indifference. There isn\'t even agreement over whether boredom is always a low-energy, flat kind of emotion or whether feeling agitated and restless counts as boredom, too. In his book, Boredom: A Lively History, Peter Toohey at the University of Calgary, Canada, compares it to disgust – an emotion that motivates us to stay away from certain situations. \'If disgust protects humans from infection, boredom may protect them from "infectious" social situations,\' he suggests.',
      },
      {
        label: 'B',
        text: 'By asking people about their experiences of boredom, Thomas Goetz and his team at the University of Konstanz in Germany have recently identified five distinct types: indifferent, calibrating, searching, reactant and apathetic. These can be plotted on two axes – one running left to right, which measures low to high arousal, and the other from top to bottom, which measures how positive or negative the feeling is. Intriguingly, Goetz has found that while people experience all kinds of boredom, they tend to specialise in one. Of the five types, the most damaging is \'reactant\' boredom with its explosive combination of high arousal and negative emotion. The most useful is what Goetz calls \'indifferent\' boredom: someone isn\'t engaged in anything satisfying but still feels relaxed and calm. However, it remains to be seen whether there are any character traits that predict the kind of boredom each of us might be prone to.',
      },
      {
        label: 'C',
        text: 'Psychologist Sandi Mann at the University of Central Lancashire, UK, goes further. \'All emotions are there for a reason, including boredom,\' she says. Mann has found that being bored makes us more creative. \'We\'re all afraid of being bored but in actual fact it can lead to all kinds of amazing things,\' she says. In experiments published last year, Mann found that people who had been made to feel bored by copying numbers out of the phone book for 15 minutes came up with more creative ideas about how to use a polystyrene cup than a control group. Mann concluded that a passive, boring activity is best for creativity because it allows the mind to wander. In fact, she goes so far as to suggest that we should seek out more boredom in our lives.',
      },
      {
        label: 'D',
        text: 'Psychologist John Eastwood at York University in Toronto, Canada, isn\'t convinced. \'If you are in a state of mind-wandering you are not bored,\' he says. \'In my view, by definition boredom is an undesirable state\'. That doesn\'t necessarily mean that it isn\'t adaptive, he adds. \'Pain is adaptive – if we didn\'t have physical pain, bad things would happen to us. Does that mean that we should actively cause pain? No. But even if boredom has evolved to help us survive, it can still be toxic if allowed to fester. For Eastwood, the central feature of boredom is a failure to put our \'attention system\' into gear. This causes an inability to focus on anything, which makes time seem to go painfully slowly. What\'s more, your efforts to improve the situation can end up making you feel worse. \'People try to connect with the world and if they are not successful there\'s that frustration and irritability,\' he says. Perhaps most worryingly, says Eastwood, repeatedly failing to engage attention can lead to a state where we don\'t know what to do any more, and no longer care.',
      },
      {
        label: 'E',
        text: 'Eastwood\'s team is now trying to explore why the attention system fails. It\'s early days but they think that at least some of it comes down to personality. Boredom proneness has been linked with a variety of traits. People who are motivated by pleasure seem to suffer particularly badly. Other personality traits, such as curiosity, are associated with a high boredom threshold. More evidence that boredom has detrimental effects comes from studies of people who are more or less prone to boredom. It seems those who bore easily face poorer prospects in education, their career and even life in general. But of course, boredom itself cannot kill – it\'s the things we do to deal with it that may put us in danger. What can we do to alleviate it before it comes to that? Goetz\'s group has one suggestion. Working with teenagers, they found that those who \'approach\' a boring situation – in other words, see that it\'s boring and get stuck in anyway – report less boredom than those who try to avoid it by using snacks, TV or social media for distraction.',
      },
      {
        label: 'F',
        text: 'Psychologist Francoise Wemelsfelder speculates that our over-connected lifestyles might even be a new source of boredom. \'In modern human society there is a lot of overstimulation but still a lot of problems finding meaning,\' she says. So instead of seeking yet more mental stimulation, perhaps we should leave our phones alone, and use boredom to motivate us to engage with the world in a more meaningful way.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–19',
        instruction: 'Reading Passage 2 has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings below.',
        note: 'There are more headings than paragraphs, so you will not use all of them.',
        type: 'matching-headings',
        headings: CAM13_T1_BOREDOM_HEADINGS,
        questions: [
          { number: 14, type: 'matching-headings', prompt: 'Paragraph A', options: [], answer: 'iv', explanation: 'Khó định nghĩa/nghiên cứu boredom trong lab — vấn đề khoa học.' },
          { number: 15, type: 'matching-headings', prompt: 'Paragraph B', options: [], answer: 'vi', explanation: 'Goetz phân loại 5 kiểu boredom.' },
          { number: 16, type: 'matching-headings', prompt: 'Paragraph C', options: [], answer: 'i', explanation: 'Mann — boredom kích thích sáng tạo.' },
          { number: 17, type: 'matching-headings', prompt: 'Paragraph D', options: [], answer: 'v', explanation: 'Eastwood — boredom độc hại nếu kéo dài.' },
          { number: 18, type: 'matching-headings', prompt: 'Paragraph E', options: [], answer: 'viii', explanation: 'Ai dễ chán — pleasure-motivated vs curious.' },
          { number: 19, type: 'matching-headings', prompt: 'Paragraph F', options: [], answer: 'iii', explanation: 'Wemelsfelder — lifestyle over-connected + cách xử lý mới.' },
        ],
      },
      {
        range: 'Questions 20–23',
        instruction: 'Match each statement with the correct option, A–E. Write the correct letter in boxes 20–23 on your answer sheet.',
        type: 'matching-features',
        features: CAM13_T1_BOREDOM_IDEAS,
        questions: [
          { number: 20, type: 'matching-features', prompt: 'Peter Toohey', options: [], answer: 'e', explanation: 'Boredom như disgust — tránh tình huống xã hội khó chịu.' },
          { number: 21, type: 'matching-features', prompt: 'Thomas Goetz', options: [], answer: 'b', explanation: 'Reactant boredom nguy hiểm nhất.' },
          { number: 22, type: 'matching-features', prompt: 'John Eastwood', options: [], answer: 'd', explanation: 'Cố cải thiện boredom có thể làm tệ hơn.' },
          { number: 23, type: 'matching-features', prompt: 'Francoise Wemelsfelder', options: [], answer: 'a', explanation: 'Lối sống over-connected gây boredom.' },
        ],
      },
      {
        range: 'Questions 24–26',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        note: CAM13_T1_BOREDOM_SUMMARY_NOTE,
        questions: gapQuestions(24, [
          { prompt: 'Gap (24)', answer: 'focus', explanation: 'Inability to focus — attention system failure.' },
          { prompt: 'Gap (25)', answer: 'pleasure', explanation: 'Motivated by pleasure — dễ chán hơn.' },
          { prompt: 'Gap (26)', answer: 'curiosity', explanation: 'Curiosity — high boredom threshold.' },
        ]),
      },
    ],
  }
}

const CAM11_T4_FILM_SOUND_ENDINGS_BANK = [
  { id: 'a', label: 'when the audience listens to the dialogue.' },
  { id: 'b', label: 'if the film reflects the audience\'s own concerns.' },
  { id: 'c', label: 'if voice, sound and music are combined appropriately.' },
  { id: 'd', label: 'when the director is aware of how the audience will respond.' },
  { id: 'e', label: 'when the actor\'s appearance, voice and moves are consistent with each other.' },
]

/** Cam11 T4 — MC Q14–18 + TFNG Q19–23 + sentence endings A–E Q24–26 */
export function ieltsReadingP2McTfngEndingsPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'An Introduction to Film Sound',
    passageSubtitle: 'Though we might think of film as an essentially visual experience, we really cannot afford to underestimate the importance of film sound',
    passage: [
      {
        text: 'Though we might think of film as an essentially visual experience, we really cannot afford to underestimate the importance of film sound. A meaningful sound track is often as complicated as the image on the screen, and is ultimately just as much the responsibility of the director. The entire sound track consists of three essential ingredients: the human voice, sound effects and music. These three tracks must be mixed and balanced so as to produce the necessary emphases which in turn create desired effects. Topics which essentially refer to the three previously mentioned tracks are discussed below. They include dialogue, synchronous and asynchronous sound effects, and music.',
      },
      {
        text: 'Let us start with dialogue. As is the case with stage drama, dialogue serves to tell the story and expresses feelings and motivations of characters as well. Often with film characterization the audience perceives little or no difference between the character and the actor. Thus, for example, the actor Humphrey Bogart is the character Sam Spade; film personality and life personality seem to merge. Perhaps this is because the very texture of a performer\'s voice supplies an element of character.',
      },
      {
        text: 'When voice textures fit the performer\'s physiognomy and gestures, a whole and very realistic persona emerges. The viewer sees not an actor working at his craft, but another human being struggling with life. It is interesting to note that how dialogue is used and the very amount of dialogue used varies widely among films. For example, in the highly successful science-fiction film 2001, little dialogue was evident, and most of it was banal and of little intrinsic interest. In this way the film-maker was able to portray what Thomas Sobchack and Vivian Sobchack call, in An Introduction to Film, the "inadequacy of human responses when compared with the magnificent technology created by man and the visual beauties of the universe".',
      },
      {
        text: 'The comedy Bringing Up Baby, on the other hand, presents practically non-stop dialogue delivered at breakneck speed. This use of dialogue underscores not only the dizzy quality of the character played by Katherine Hepburn, but also the absurdity of the film itself and thus its humor. The audience is bounced from gag to gag and conversation to conversation; there is no time for audience reflection. The audience is caught up in a whirlwind of activity in simply managing to follow the plot. This film presents pure escapism — largely due to its frenetic dialogue.',
      },
      {
        text: 'Synchronous sound effects are those sounds which are synchronized or matched with what is viewed. For example, if the film portrays a character playing the piano, the sounds of the piano are projected. Synchronous sounds contribute to the realism of film and also help to create a particular atmosphere. For example, the "click" of a door being opened may simply serve to convince the audience that the image portrayed is real, and the audience may only subconsciously note the expected sound. However, if the "click" of an opening door is part of an ominous action such as a burglary, the sound mixer may call attention to the "click" with an increase in volume; this helps to engage the audience in a moment of suspense.',
      },
      {
        text: 'Asynchronous sound effects, on the other hand, are not matched with a visible source of the sound on screen. Such sounds are included so as to provide an appropriate emotional nuance, and they may also add to the realism of the film. For example, a film-maker might opt to include the background sound of an ambulance\'s siren while the foreground sound and image portrays an arguing couple. The asynchronous ambulance siren underscores the psychic injury incurred in the argument; at the same time the noise of the siren adds to the realism of the film by acknowledging the film\'s city setting.',
      },
      {
        text: 'We are probably all familiar with background music in films, which has become so ubiquitous as to be noticeable in its absence. We are aware that it is used to add emotion and rhythm. Usually not meant to be noticeable, it often provides a tone or an emotional attitude toward the story and/or the characters depicted. In addition, background music often foreshadows a change in mood. For example, dissonant music may be used in film to indicate an approaching (but not yet visible) menace or disaster. Background music may aid viewer understanding by linking scenes. For example, a particular musical theme associated with an individual character or situation may be repeated at various points in a film in order to remind the audience of salient motifs or ideas.',
      },
      {
        text: 'Film sound comprises conventions and innovations. We have come to expect an acceleration of music during car chases and creaky doors in horror films. Yet, it is important to note as well that sound is often brilliantly conceived. The effects of sound are often largely subtle and often are noted by only our subconscious minds. We need to foster an awareness of film sound as well as film space so as to truly appreciate an art form that sprang to life during the twentieth century — the modern film.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–18',
        instruction: 'Choose the correct letter, A, B, C or D.',
        type: 'multiple-choice',
        questions: [
          {
            number: 14,
            type: 'multiple-choice',
            prompt: 'In the first paragraph, the writer makes a point that',
            options: [
              { id: 'a', label: 'the director should plan the soundtrack at an early stage in filming.' },
              { id: 'b', label: 'it would be wrong to overlook the contribution of sound to the artistry of films.' },
              { id: 'c', label: 'the music industry can have a beneficial influence on sound in film.' },
              { id: 'd', label: 'it is important for those working on the sound in a film to have sole responsibility for it.' },
            ],
            answer: 'b',
            explanation: 'Cannot afford to underestimate the importance of film sound.',
          },
          {
            number: 15,
            type: 'multiple-choice',
            prompt: 'One reason that the writer refers to Humphrey Bogart is to exemplify',
            options: [
              { id: 'a', label: 'the importance of the actor and the character appearing to have similar personalities.' },
              { id: 'b', label: 'the audience\'s wish that actors are visually appropriate for their roles.' },
              { id: 'c', label: 'the value of the actor having had similar feelings to the character.' },
              { id: 'd', label: 'the audience\'s preference for dialogue to be as authentic as possible.' },
            ],
            answer: 'a',
            explanation: 'Film personality and life personality seem to merge.',
          },
          {
            number: 16,
            type: 'multiple-choice',
            prompt: 'In the third paragraph, the writer suggests that',
            options: [
              { id: 'a', label: 'audiences are likely to be critical of film dialogue that does not reflect their own experience.' },
              { id: 'b', label: 'film dialogue that appears to be dull may have a specific purpose.' },
              { id: 'c', label: 'filmmakers vary considerably in the skill with which they handle dialogue.' },
              { id: 'd', label: 'the most successful films are those with dialogue of a high quality.' },
            ],
            answer: 'b',
            explanation: '2001 — banal dialogue used deliberately to portray inadequacy of human responses.',
          },
          {
            number: 17,
            type: 'multiple-choice',
            prompt: 'What does the writer suggest about Bringing Up Baby?',
            options: [
              { id: 'a', label: 'The plot suffers from the filmmaker\'s wish to focus on humorous dialogue.' },
              { id: 'b', label: 'The dialogue helps to make it one of the best comedy films ever produced.' },
              { id: 'c', label: 'There is a mismatch between the speed of the dialogue and the speed of actions.' },
              { id: 'd', label: 'The nature of the dialogue emphasises key elements of the film.' },
            ],
            answer: 'd',
            explanation: 'Dialogue underscores dizzy quality and absurdity/humor of the film.',
          },
          {
            number: 18,
            type: 'multiple-choice',
            prompt: 'The writer refers to the \'click\' of a door to make the point that realistic sounds',
            options: [
              { id: 'a', label: 'are often used to give the audience a false impression of events in the film.' },
              { id: 'b', label: 'may be interpreted in different ways by different members of the audience.' },
              { id: 'c', label: 'may be modified in order to manipulate the audience\'s response to the film.' },
              { id: 'd', label: 'tend to be more significant in films presenting realistic situations.' },
            ],
            answer: 'c',
            explanation: 'Sound mixer may increase volume to engage audience in suspense.',
          },
        ],
      },
      {
        range: 'Questions 19–23',
        instruction: 'Do the following statements agree with the information given in Reading Passage 2? In boxes 19–23 on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        type: 'tfng',
        questions: [
          {
            number: 19,
            type: 'true-false-not-given',
            prompt: 'Audiences are likely to be surprised if a film lacks background music.',
            options: TFNG_OPTIONS,
            answer: 'true',
            explanation: 'Background music ubiquitous — noticeable in its absence.',
          },
          {
            number: 20,
            type: 'true-false-not-given',
            prompt: 'Background music may anticipate a development in a film.',
            options: TFNG_OPTIONS,
            answer: 'true',
            explanation: 'Background music often foreshadows a change in mood.',
          },
          {
            number: 21,
            type: 'true-false-not-given',
            prompt: 'Background music has more effect on some people than on others.',
            options: TFNG_OPTIONS,
            answer: 'not-given',
            explanation: 'Passage không so sánh tác động giữa các nhóm người.',
          },
          {
            number: 22,
            type: 'true-false-not-given',
            prompt: 'Background music may help the audience to make certain connections within the film.',
            options: TFNG_OPTIONS,
            answer: 'true',
            explanation: 'Background music may aid viewer understanding by linking scenes.',
          },
          {
            number: 23,
            type: 'true-false-not-given',
            prompt: 'Audiences tend to be aware of how the background music is affecting them.',
            options: TFNG_OPTIONS,
            answer: 'false',
            explanation: 'Effects often noted only by subconscious minds — need awareness.',
          },
        ],
      },
      {
        range: 'Questions 24–26',
        instruction: 'Complete each sentence with the correct ending, A–E, below. Write the correct letter, A–E, in boxes 24–26 on your answer sheet.',
        type: 'summary-completion',
        wordBank: CAM11_T4_FILM_SOUND_ENDINGS_BANK,
        questions: [
          { number: 24, type: 'summary-completion', prompt: 'The audience\'s response to different parts of a film can be controlled', options: [], answer: 'c', explanation: 'Three tracks mixed and balanced to create desired effects.' },
          { number: 25, type: 'summary-completion', prompt: 'The feelings and motivations of characters become clear', options: [], answer: 'a', explanation: 'Dialogue serves to tell the story and express feelings.' },
          { number: 26, type: 'summary-completion', prompt: 'A character seems to be a real person rather than an actor', options: [], answer: 'e', explanation: 'Voice textures fit physiognomy and gestures — realistic persona.' },
        ],
      },
    ],
  }
}

/** Cam9 T1 — Headings Q14–17 + gap Q18–20 + YNNG Q21–26 */
export function ieltsReadingP2HeadingsYnngPart(): ReadingImportPartJson {
  const headingsPart = DEMO.parts[0]
  const ynngGroup = DEMO.parts[1].questionGroups[0]
  const ynngExtra = {
    ...ynngGroup.questions[0],
    prompt: 'The writer believes reintroducing elms is straightforward and inexpensive.',
    answer: 'no',
    explanation: 'Passage nêu nhiều khó khăn và tranh luận.',
  }

  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: headingsPart.passageTitle,
    passage: headingsPart.passage.slice(0, 4).map(block => ({ label: block.label, text: block.text })),
    questionGroups: [
      {
        range: 'Questions 14–17',
        instruction: 'Reading Passage 2 has four paragraphs, A–D. Choose the correct heading for each paragraph.',
        note: 'There are more headings than paragraphs, so you will not use all of them.',
        type: 'matching-headings',
        headings: headingsPart.questionGroups[0].headings,
        questions: stripQuestionIds(headingsPart.questionGroups[0].questions, 14, 4),
      },
      {
        range: 'Questions 18–20',
        instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(18, [
          { prompt: 'Dutch elm disease is spread by ___', answer: 'bark beetles', explanation: 'Beetles spread the fungus between trees.' },
          { prompt: 'Young elms become vulnerable when trunks reach ___ in diameter.', answer: '10–15 cm', explanation: 'Paragraph C nêu 10–15 cm.' },
          { prompt: 'A Scottish valley has remained free of the disease because of its ___', answer: 'isolation', explanation: 'Isolation and climate giúp tránh disease.' },
        ]),
      },
      {
        range: 'Questions 21–26',
        instruction: 'Do the following statements agree with the views of the writer in Reading Passage 2? Write YES, NO or NOT GIVEN.',
        type: 'ynng',
        questions: [...ynngGroup.questions, ynngExtra].slice(0, 6).map((q, i) => ({
          number: 21 + i,
          type: q.type,
          prompt: q.prompt,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
        })),
      },
    ],
  }
}

/** Cam10 T1 — TFNG + MC */
export function ieltsReadingP3R3Part(): ReadingImportPartJson {
  return partToImportJson(MOCK.parts[2])
}

/** Cam9 T1 — Gap Q27–30 + TFNG Q31–33 + flow/summary Q34–39 + MC Q40 */
export function ieltsReadingP3GapTfngFlowMcPart(): ReadingImportPartJson {
  const base = MOCK.parts[2]
  const tfngGroup = base.questionGroups[0]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 27–30',
        instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(27, [
          { prompt: 'Sleep has long been linked to ___', answer: 'memory', explanation: 'Opening sentence links sleep and memory.' },
          { prompt: 'During slow-wave sleep the brain replays experiences from the ___', answer: 'day', explanation: 'Brain replays experiences from the day.' },
          { prompt: 'REM sleep is associated with ___ forms of problem solving.', answer: 'creative', explanation: 'REM linked to creative problem solving.' },
          { prompt: 'Some experiments use small ___', answer: 'sample sizes', explanation: 'Limitation: small sample sizes.' },
        ]),
      },
      {
        range: 'Questions 31–33',
        instruction: tfngGroup.instruction,
        type: 'tfng',
        questions: stripQuestionIds(tfngGroup.questions, 31, 3),
      },
      {
        range: 'Questions 34–39',
        instruction: 'Complete the flow-chart below. Choose SIX answers from the box and write the correct letter A–G next to questions 34–39.',
        type: 'summary-completion',
        wordBank: [
          { id: 'a', label: 'slow-wave sleep' },
          { id: 'b', label: 'REM sleep' },
          { id: 'c', label: 'neural connections' },
          { id: 'd', label: 'laboratory' },
          { id: 'e', label: 'productivity' },
          { id: 'f', label: 'revision' },
          { id: 'g', label: 'motor skills' },
        ],
        questions: [
          { number: 34, type: 'summary-completion', prompt: 'Stage 1: experiences replayed during ___', options: [], answer: 'a', explanation: 'Slow-wave sleep replays experiences.' },
          { number: 35, type: 'summary-completion', prompt: 'Stage 2: useful ___ strengthened', options: [], answer: 'c', explanation: 'Neural connections strengthened.' },
          { number: 36, type: 'summary-completion', prompt: 'Stage 3: creative solving linked to ___', options: [], answer: 'b', explanation: 'REM sleep for creative solving.' },
          { number: 37, type: 'summary-completion', prompt: 'Students who sleep after ___ perform better', options: [], answer: 'f', explanation: 'Sleep after revision improves tests.' },
          { number: 38, type: 'summary-completion', prompt: 'Different stages support ___ and factual recall', options: [], answer: 'g', explanation: 'Motor skills and factual recall.' },
          { number: 39, type: 'summary-completion', prompt: 'Cutting sleep reduces ___ and retention', options: [], answer: 'e', explanation: 'Reduces productivity and retention.' },
        ],
      },
      {
        range: 'Questions 40',
        instruction: 'Choose the correct letter, A, B, C or D.',
        type: 'multiple-choice',
        questions: stripQuestionIds(base.questionGroups[1].questions, 40, 1),
      },
    ],
  }
}

/** TFNG Q14–18 + match paragraph + features + MC */
export function ieltsReadingP2TfngMatchPart(): ReadingImportPartJson {
  const origP2 = MOCK.parts[1]
  const tfngGroup = MOCK.parts[0].questionGroups[0]

  return {
    ...partToImportJson(origP2),
    questionGroups: [
      renumberGroup(tfngGroup, 'Questions 14–18', 14, 5),
      renumberGroup(origP2.questionGroups[0], 'Questions 19–22', 19, 4),
      renumberGroup(origP2.questionGroups[1], 'Questions 23–25', 23, 3),
      renumberGroup(origP2.questionGroups[2], 'Questions 26', 26, 1),
    ],
  }
}

/** Cam10 T4 — summary đoạn văn liền Q14–18 */
export const CAM10_T4_P2_SUMMARY_NOTE = [
  'Psychologists have traditionally believed that a personality 14________ was impossible and that by a 15________ '
  + "a person's character tends to be fixed. This is not true according to positive psychologists, who say that our "
  + 'personal qualities can be seen as habitual behaviour. One of the easiest qualities to acquire is 16________. '
  + 'However, regardless of the quality, it is necessary to learn a wide variety of different 17________ in order '
  + 'for a new quality to develop; for example, a person must understand and feel some 18________ in order to '
  + 'increase their happiness.',
].join('\n')

const CAM10_T4_SECOND_NATURE_FEATURES = [
  { id: 'a', name: 'Christopher Peterson' },
  { id: 'b', name: 'David Fajgenbaum' },
  { id: 'c', name: 'Suzanne Segerstrom' },
  { id: 'd', name: 'Tanya Streeter' },
  { id: 'e', name: 'Todd Kashdan' },
  { id: 'f', name: 'Kenneth Pedeleose' },
  { id: 'g', name: 'Cynthia Pury' },
]

/** Cam10 T4 — summary Q14–18 (note inline) + match people Q19–22 + match para Q23–26 */
export function ieltsReadingP2GapMatchPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'Second nature',
    passageSubtitle: "Your personality isn't necessarily set in stone.",
    passage: [
      {
        label: 'A',
        text: 'Psychologists have long held that a person\'s character cannot undergo a transformation in any meaningful way and that the key traits of personality are determined at a very young age. However, researchers have begun looking more closely at ways we can change. Positive psychologists have identified 24 qualities we admire, such as loyalty and kindness, and are studying them to find out why they come so naturally to some people.',
      },
      {
        label: 'B',
        text: '\'The evidence is good that most personality traits can be altered,\' says Christopher Peterson, professor of psychology at the University of Michigan, who cites himself as an example. Inherently introverted, he realised early on that as an academic, his reticence would prove disastrous in the lecture hall. So he learned to be more outgoing and to entertain his classes.',
      },
      {
        label: 'C',
        text: 'David Fajgenbaum had to make a similar transition. He was preparing for university, when he had an accident that put an end to his sports career. On campus, he quickly found that beyond ordinary counselling, the university had no services for students who were undergoing physical rehabilitation and suffering from depression like him. He therefore launched a support group to help others in similar situations.',
      },
      {
        label: 'D',
        text: 'Suzanne Segerstrom, professor of psychology at the University of Kentucky, believes that the key to increasing optimism is through cultivating optimistic behaviour, rather than positive thinking. She recommends you train yourself to pay attention to good fortune by writing down three positive things that come about each day.',
      },
      {
        label: 'E',
        text: 'You can recognise a person who is passionate about a pursuit by the way they are so strongly involved in it. Tanya Streeter\'s passion is freediving — the sport of plunging deep into the water without tanks or other breathing equipment. Streeter learned to untangle her fears from her judgment of what her body and mind could do.',
      },
      {
        label: 'F',
        text: 'Finding a pursuit that excites you can improve anyone\'s life. Psychologist Todd Kashdan has this advice for those people taking up a new passion: \'As a newcomer, you also have to tolerate and laugh at your own ignorance. You must be willing to accept the negative feelings that come your way,\' he says.',
      },
      {
        label: 'G',
        text: 'In 2004, physician-scientist Mauro Zappaterra began his PhD research at Harvard Medical School. Unfortunately, he was miserable as his research wasn\'t compatible with his curiosity about healing. He finally took a break and during eight months in Santa Fe, Zappaterra learned about alternative healing techniques not taught at Harvard. When he got back, he switched labs.',
      },
      {
        label: 'H',
        text: 'Usually, we think of courage in physical terms but ordinary life demands something else. For marketing executive Kenneth Pedeleose, it meant speaking out against something he thought was ethically wrong. According to Cynthia Pury, a psychologist at Clemson University, Pedeleose\'s story proves the point that courage is not motivated by fearlessness, but by moral obligation.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–18',
        instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        note: CAM10_T4_P2_SUMMARY_NOTE,
        questions: gapQuestions(14, [
          { prompt: 'Gap (14)', answer: 'transformation', explanation: 'Tính cách không thể thay đổi có ý nghĩa.' },
          { prompt: 'Gap (15)', answer: 'young age', explanation: 'Đặc điểm hình thành từ rất sớm.' },
          { prompt: 'Gap (16)', answer: 'optimism', explanation: 'Lạc quan dễ phát triển hơn.' },
          { prompt: 'Gap (17)', answer: 'skills', explanation: 'Cần nhiều kỹ năng đa dạng.' },
          { prompt: 'Gap (18)', answer: 'negative emotions', explanation: 'Phải chấp nhận cảm xúc tiêu cực để có niềm vui.' },
        ]),
      },
      {
        range: 'Questions 19–22',
        instruction: 'Look at the following statements and the list of people below. Match each statement with the correct person, A–G.',
        type: 'matching-features',
        features: CAM10_T4_SECOND_NATURE_FEATURES,
        questions: [
          { number: 19, type: 'matching-features', prompt: 'People must accept that they do not know much when first trying something new.', options: [], answer: 'e', explanation: 'Kashdan — chấp nhận ngu dốt khi bắt đầu.' },
          { number: 20, type: 'matching-features', prompt: 'It is important for people to actively notice when good things happen.', options: [], answer: 'c', explanation: 'Segerstrom — ghi 3 điều tích cực mỗi ngày.' },
          { number: 21, type: 'matching-features', prompt: 'Courage can be learned once its origins in a sense of responsibility are understood.', options: [], answer: 'g', explanation: 'Pury — can đảm từ nghĩa vụ đạo đức.' },
          { number: 22, type: 'matching-features', prompt: 'It is possible to overcome shyness when faced with the need to speak in public.', options: [], answer: 'a', explanation: 'Peterson — học hướng ngoại cho giảng dạy.' },
        ],
      },
      {
        range: 'Questions 23–26',
        instruction: 'Reading Passage 2 has eight sections, A–H. Which section contains the following information?',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        questions: [
          { number: 23, type: 'matching-paragraph', prompt: 'a mention of how rational thinking enabled someone to achieve physical goals', options: [], answer: 'd', explanation: 'Streeter tách nỗi sợ khỏi phán đoán thể chất.' },
          { number: 24, type: 'matching-paragraph', prompt: 'an account of how someone overcame a sad experience', options: [], answer: 'b', explanation: 'Fajgenbaum vượt qua tai nạn, trầm cảm.' },
          { number: 25, type: 'matching-paragraph', prompt: 'a description of how someone decided to rethink their academic career path', options: [], answer: 'g', explanation: 'Zappaterra đổi lab, học healing.' },
          { number: 26, type: 'matching-paragraph', prompt: 'an example of how someone risked his career out of a sense of duty', options: [], answer: 'f', explanation: 'Pedeleose tố cáo sếp dù mất việc.' },
        ],
      },
    ],
  }
}

/** Summary (word bank) + YNNG + MC */
export function ieltsReadingP2SummaryYnngMcPart(): ReadingImportPartJson {
  const origP2 = MOCK.parts[1]
  const ynngGroup = DEMO.parts[1].questionGroups[0]
  const wordBank = [
    { id: 'a', label: 'productivity' },
    { id: 'b', label: 'hybrid models' },
    { id: 'c', label: 'structured check-ins' },
    { id: 'd', label: 'physical space' },
    { id: 'e', label: 'communication habits' },
    { id: 'f', label: 'office redesign' },
    { id: 'g', label: 'salary differences' },
  ]

  return {
    ...partToImportJson(origP2),
    questionGroups: [
      {
        range: 'Questions 14–17',
        instruction: 'Complete the summary below. Choose FOUR answers from the box and write the correct letter A–G next to questions 14–17.',
        type: 'summary-completion',
        wordBank,
        questions: [
          { number: 14, type: 'summary-completion', prompt: 'Remote work exposed weak ___', options: [], answer: 'e', explanation: 'Weak communication habits.' },
          { number: 15, type: 'summary-completion', prompt: 'Marsh favours ___ over monitoring hours', options: [], answer: 'c', explanation: 'Structured check-ins.' },
          { number: 16, type: 'summary-completion', prompt: 'Ortiz says brainstorming needs shared ___', options: [], answer: 'd', explanation: 'Shared physical space.' },
          { number: 17, type: 'summary-completion', prompt: 'He predicts ___ will dominate', options: [], answer: 'b', explanation: 'Hybrid models.' },
        ],
      },
      renumberGroup(ynngGroup, 'Questions 18–22', 18, 5),
      renumberGroup(origP2.questionGroups[2], 'Questions 23–26', 23, 4),
    ],
  }
}

/** Gap Q27–31 + YNNG Q32–36 + MC Q37–40 */
export function ieltsReadingP3GapYnngMcPart(): ReadingImportPartJson {
  const base = MOCK.parts[2]
  const ynngGroup = DEMO.parts[1].questionGroups[0]
  const mcGroup = base.questionGroups[1]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 27–31',
        instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(27, [
          { prompt: 'Sleep has long been linked to ___', answer: 'memory', explanation: 'Sleep linked to memory.' },
          { prompt: 'During slow-wave sleep the brain replays experiences from the ___', answer: 'day', explanation: 'Experiences from the day.' },
          { prompt: 'REM sleep supports ___ problem solving.', answer: 'creative', explanation: 'Creative problem solving.' },
          { prompt: 'Some studies use small ___', answer: 'sample sizes', explanation: 'Small sample sizes.' },
          { prompt: 'Cutting sleep reduces ___ and retention.', answer: 'productivity', explanation: 'Reduces productivity.' },
        ]),
      },
      renumberGroup(ynngGroup, 'Questions 32–36', 32, 5),
      renumberGroup(mcGroup, 'Questions 37–40', 37, 4),
    ],
  }
}

const CAM10_T2_P3_SUMMARY_NOTE = [
  'The value attached to original works of art',
  '',
  'People go to art museums because they accept the value of seeing an original work of art. '
  + 'But they do not go to museums to read original manuscripts of novels, perhaps because the availability '
  + 'of novels has depended on 27________ for so long, and also because with novels, the 28________ '
  + 'are the most important thing.',
  '',
  'However, in historical times artists such as Leonardo were happy to instruct 29________ to produce '
  + 'copies of their work and these days new methods of reproduction allow excellent replication of '
  + 'surface relief features as well as colour and 30________',
  '',
  'It is regrettable that museums still promote the superiority of original works of art, since this '
  + 'may not be in the interests of the 31________',
].join('\n')

/** Summary đoạn văn liền (note) + MC + YNNG — Cam10 Test 2 P3 */
export function ieltsReadingP3SummaryMcYnngPart(): ReadingImportPartJson {
  const base = MOCK.parts[2]
  const ynngGroup = DEMO.parts[1].questionGroups[0]
  const mcGroup = base.questionGroups[1]
  const wordBank = [
    { id: 'a', label: 'institution' },
    { id: 'b', label: 'mass production' },
    { id: 'c', label: 'mechanical processes' },
    { id: 'd', label: 'public' },
    { id: 'e', label: 'paints' },
    { id: 'f', label: 'artist' },
    { id: 'g', label: 'size' },
    { id: 'h', label: 'underlying ideas' },
    { id: 'i', label: 'basic technology' },
    { id: 'j', label: 'readers' },
    { id: 'k', label: 'picture frames' },
    { id: 'l', label: 'assistants' },
  ]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 27–31',
        instruction: 'Complete the summary using the list of phrases, A–L, below.',
        type: 'summary-completion',
        note: CAM10_T2_P3_SUMMARY_NOTE,
        wordBank,
        questions: [
          { number: 27, type: 'summary-completion', prompt: 'Gap (27)', options: [], answer: 'b', explanation: 'Tiểu thuyết nhờ sản xuất hàng loạt (in ấn).' },
          { number: 28, type: 'summary-completion', prompt: 'Gap (28)', options: [], answer: 'h', explanation: 'Ý nghĩa từ ngữ quan trọng hơn hình thức in.' },
          { number: 29, type: 'summary-completion', prompt: 'Gap (29)', options: [], answer: 'l', explanation: 'Học viên xưởng sao chép tác phẩm.' },
          { number: 30, type: 'summary-completion', prompt: 'Gap (30)', options: [], answer: 'g', explanation: 'Sao chép cả kích thước (scale).' },
          { number: 31, type: 'summary-completion', prompt: 'Gap (31)', options: [], answer: 'd', explanation: 'Không có lợi cho công chúng.' },
        ],
      },
      renumberGroup(mcGroup, 'Questions 32–35', 32, 4),
      renumberGroup(ynngGroup, 'Questions 36–40', 36, 5),
    ],
  }
}

/** Summary (word bank) + YNNG + MC — generic SAMPLE (sleep) */
export function ieltsReadingP3SummaryYnngMcPart(): ReadingImportPartJson {
  const base = MOCK.parts[2]
  const ynngGroup = DEMO.parts[1].questionGroups[0]
  const mcGroup = base.questionGroups[1]
  const wordBank = [
    { id: 'a', label: 'slow-wave sleep' },
    { id: 'b', label: 'REM sleep' },
    { id: 'c', label: 'neural connections' },
    { id: 'd', label: 'sample sizes' },
    { id: 'e', label: 'creative solving' },
    { id: 'f', label: 'productivity' },
    { id: 'g', label: 'factual recall' },
  ]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 27–31',
        instruction: 'Complete the summary below. Choose FIVE answers from the box and write the correct letter A–G next to questions 27–31.',
        type: 'summary-completion',
        wordBank,
        questions: [
          { number: 27, type: 'summary-completion', prompt: 'Experiences replayed during ___', options: [], answer: 'a', explanation: 'Slow-wave sleep.' },
          { number: 28, type: 'summary-completion', prompt: 'Useful ___ are strengthened', options: [], answer: 'c', explanation: 'Neural connections.' },
          { number: 29, type: 'summary-completion', prompt: 'REM linked to ___', options: [], answer: 'e', explanation: 'Creative solving.' },
          { number: 30, type: 'summary-completion', prompt: 'Studies limited by small ___', options: [], answer: 'd', explanation: 'Sample sizes.' },
          { number: 31, type: 'summary-completion', prompt: 'Sleep loss hurts ___', options: [], answer: 'f', explanation: 'Productivity.' },
        ],
      },
      renumberGroup(ynngGroup, 'Questions 32–36', 32, 5),
      renumberGroup(mcGroup, 'Questions 37–40', 37, 4),
    ],
  }
}

const CAM19_T2_GIFTED_WORD_BANK = [
  { id: 'a', label: 'appeal' },
  { id: 'b', label: 'determined' },
  { id: 'c', label: 'intrigued' },
  { id: 'd', label: 'single' },
  { id: 'e', label: 'achievement' },
  { id: 'f', label: 'devoted' },
  { id: 'g', label: 'involved' },
  { id: 'h', label: 'unique' },
  { id: 'i', label: 'innovative' },
  { id: 'j', label: 'satisfaction' },
  { id: 'k', label: 'intent' },
]

const CAM19_T2_GIFTED_SUMMARY_NOTE = [
  'Maryam Mirzakhani',
  '',
  'Maryam Mirzakhani is regarded as 27________ in the field of mathematics because she was the only female holder of the prestigious Fields Medal – a record that she retained at the time of her death. However, maths held little 28________ for her as a child and in fact her performance was below average until she was 29________ by a difficult puzzle that one of her siblings showed her. Later, as a professional mathematician, she had an inquiring mind and proved herself to be 30________ when things did not go smoothly. She said she got the greatest 31________ from making ground-breaking discoveries and in fact she was responsible for some extremely 32________ mathematical studies.',
].join('\n')

/**
 * r3sb — Summary bank A–K Q27–32 + YNNG Q33–37 + MC Q38–40
 * Preview: Teamplate_Part3_15.jpg (gifted child / Mirzakhani — Cam19 T2 P3)
 */
export function ieltsReadingP3SummaryBankYnngMcPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'An inquiry into the existence of the gifted child',
    passageSubtitle: 'Is exceptional ability innate, or can it be developed?',
    passage: [
      {
        text: 'Let us start by looking at a modern \'genius\', Maryam Mirzakhani, who died at the early age of 40. She is regarded as unique in the field of mathematics because she was the only female holder of the prestigious Fields Medal – a record she retained at the time of her death. However, maths held little appeal for her as a child and her performance was below average until she was intrigued by a difficult puzzle that one of her siblings showed her. Later, as a professional mathematician, she had an inquiring mind and proved herself to be determined when things did not go smoothly. She said she got the greatest satisfaction from making ground-breaking discoveries and was responsible for some extremely innovative mathematical studies.',
      },
      {
        text: 'Many people who later win prestigious intellectual prizes only reached an average standard when young. The writer notes that early performance is not always a reliable guide to later achievement. Giftedness research has also examined how attitudes and habits of mind support high performance over time.',
      },
      {
        text: 'Joan Freeman and others have studied how schools label children. Eyre believes most individuals can equal gifted standards if taught the right attitudes – curiosity, persistence and hard work – developing a spirit of inquiry towards their studies. After research since 1980 on diverse achievements, Ericsson did not think unique innate talents were at the heart of outstanding performance; deliberate practice mattered more.',
      },
      {
        text: 'Interviews with children from difficult circumstances have found strong evidence of an adult in their lives who valued and supported education and recognised the benefits of learning. Character and persistence, rather than raw speed of thought alone, also appear in reflections attributed to Einstein about what makes a great scientist.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–32',
        instruction: 'Complete the summary using the list of phrases, A–K, below.',
        type: 'summary-completion',
        note: CAM19_T2_GIFTED_SUMMARY_NOTE,
        wordBank: CAM19_T2_GIFTED_WORD_BANK,
        questions: [
          { number: 27, type: 'summary-completion', prompt: 'Gap (27)', options: [], answer: 'h', explanation: 'unique' },
          { number: 28, type: 'summary-completion', prompt: 'Gap (28)', options: [], answer: 'a', explanation: 'appeal' },
          { number: 29, type: 'summary-completion', prompt: 'Gap (29)', options: [], answer: 'c', explanation: 'intrigued' },
          { number: 30, type: 'summary-completion', prompt: 'Gap (30)', options: [], answer: 'b', explanation: 'determined' },
          { number: 31, type: 'summary-completion', prompt: 'Gap (31)', options: [], answer: 'j', explanation: 'satisfaction' },
          { number: 32, type: 'summary-completion', prompt: 'Gap (32)', options: [], answer: 'i', explanation: 'innovative' },
        ],
      },
      {
        range: 'Questions 33–37',
        instruction: 'Do the following statements agree with the claims of the writer in the Reading Passage? In boxes 33–37 on your answer sheet, write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        type: 'ynng',
        questions: [
          {
            number: 33,
            type: 'yes-no-not-given',
            prompt: 'Many people who ended up winning prestigious intellectual prizes only reached an average standard when young.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Writer notes early average standard among later prize-winners.',
          },
          {
            number: 34,
            type: 'yes-no-not-given',
            prompt: 'Maryam Mirzakhani\'s Fields Medal was later awarded to another woman during her lifetime.',
            options: [...YNNG_OPTIONS],
            answer: 'not-given',
            explanation: 'She retained the record at death — no claim about another award during her life.',
          },
          {
            number: 35,
            type: 'yes-no-not-given',
            prompt: 'Ericsson\'s research suggested deliberate practice matters more than unique innate talent alone.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Ericsson did not put unique innate talents at the heart of performance.',
          },
          {
            number: 36,
            type: 'yes-no-not-given',
            prompt: 'Joan Freeman argues that every school should abolish all forms of assessment.',
            options: [...YNNG_OPTIONS],
            answer: 'not-given',
            explanation: 'No such claim in SAMPLE passage.',
          },
          {
            number: 37,
            type: 'yes-no-not-given',
            prompt: 'Einstein believed that sheer speed of dealing with problems is what makes a great scientist.',
            options: [...YNNG_OPTIONS],
            answer: 'no',
            explanation: 'He emphasised character / staying with problems longer, not mere speed.',
          },
        ],
      },
      {
        range: 'Questions 38–40',
        instruction: 'Choose the correct answer.',
        type: 'multiple-choice',
        questions: [
          {
            number: 38,
            type: 'multiple-choice',
            prompt: 'What does Eyre believe is needed for children to equal \'gifted\' standards?',
            options: [
              { id: 'a', label: 'strict discipline from the teaching staff' },
              { id: 'b', label: 'assistance from their peers in the classroom' },
              { id: 'c', label: 'the development of a spirit of inquiry towards their studies' },
              { id: 'd', label: 'the determination to surpass everyone else\'s achievements' },
            ],
            answer: 'c',
            explanation: 'C — curiosity, persistence, hard work / spirit of inquiry.',
          },
          {
            number: 39,
            type: 'multiple-choice',
            prompt: 'What does the writer report about Ericsson\'s view of outstanding performance?',
            options: [
              { id: 'a', label: 'Very gifted students do not need to train memory skills.' },
              { id: 'b', label: 'Being born with a special gift is not the key factor.' },
              { id: 'c', label: 'Exercise is essential to raise performance.' },
              { id: 'd', label: '10,000 hours of practice will always produce a genius.' },
            ],
            answer: 'b',
            explanation: 'B — unique innate talents not at the heart of performance.',
          },
          {
            number: 40,
            type: 'multiple-choice',
            prompt: 'What evidence was found in interviews with children from difficult circumstances?',
            options: [
              { id: 'a', label: 'regular nutritious meals at home' },
              { id: 'b', label: 'loving support from more than one parent' },
              { id: 'c', label: 'well-funded facilities for study' },
              { id: 'd', label: 'an adult who recognised the benefits of learning' },
            ],
            answer: 'd',
            explanation: 'D — adult who valued and supported education.',
          },
        ],
      },
    ],
  }
}

const CAM19_T3_SPEECH_ENDINGS_BANK = [
  { id: 'a', label: 'but there are concerns about this.' },
  { id: 'b', label: 'as systems do not need to conform to standard practices.' },
  { id: 'c', label: 'but they are far from perfect.' },
  { id: 'd', label: 'despite the noise issues.' },
  { id: 'e', label: 'because translation is immediate.' },
  { id: 'f', label: 'and have an awareness of good manners.' },
]

const CAM19_T4_UNSELFISH_SUMMARY_NOTE = [
  'Contemporary hunter-gatherer societies',
  '',
  'Bruce Knauft\'s research shows that contemporary hunter-gatherer societies tend to exhibit a high level of 31________ in all areas of life. In these cultures, distributing resources fairly among all members is a moral obligation. These societies also employ strategies to prevent differences in 32________ occurring: for example, the !Kung follow a custom whereby the credit for one person\'s success at 33________ is given to another member of the group. Individuals who behave in a 34________ manner are punished by being excluded from the group, and women have a considerable amount of 35________ in choices regarding work and marriage.',
].join('\n')

/**
 * r3mgy — MC Q27–30 + Summary ONE WORD Q31–35 + YNNG Q36–40
 * Preview: Teamplate_Part3_17.jpg (The Unselfish Gene / hunter-gatherers — Cam19 T4 P3)
 */
export function ieltsReadingP3McSummaryGapYnngPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'The Unselfish Gene',
    passageSubtitle: 'Is human nature inherently selfish, or cooperative?',
    passage: [
      {
        text: 'A common claim is that humans are naturally selfish and competitive. In the first paragraph the writer is mainly describing a commonly held belief about people\'s behaviour rather than proving that greed is inevitable. Opposing views about human nature are often simplified in popular debate.',
      },
      {
        text: 'As the anthropologist Bruce Knauft has remarked, hunter-gatherers are characterised by extreme political and sexual egalitarianism. Knauft has observed that individuals in such groups don\'t accumulate property or possessions and have an ethical obligation to share everything. They also have methods of preserving egalitarianism by ensuring that disparities of status don\'t arise.',
      },
      {
        text: 'The !Kung people of southern Africa, for example, swap arrows before going hunting and when an animal is killed, the acclaim does not go to the person who fired the arrow, but to the person the arrow belongs to. And if a person becomes too domineering, the other members of the group ostracise them, exiling the offender from society. Typically in such groups, men do not dictate what women do. Women in hunter-gatherer groups worldwide often benefit from a high level of autonomy, being able to select their own marriage partners, decide what work they do and work whenever they choose to.',
      },
      {
        text: 'Some anthropologists have debated when the number of societies such as the !Kung began to decline. The writer argues that certain accounts of that timing are mistaken. Cooperative norms appear deep in human history, though selfish behaviour can still emerge under particular social and economic conditions.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–30',
        instruction: 'Choose the correct answer.',
        type: 'multiple-choice',
        questions: [
          {
            number: 27,
            type: 'multiple-choice',
            prompt: 'What is the writer doing in the first paragraph?',
            options: [
              { id: 'a', label: 'setting out two opposing views about human nature' },
              { id: 'b', label: 'justifying his opinion about our tendency to be greedy' },
              { id: 'c', label: 'describing a commonly held belief about people\'s behaviour' },
              { id: 'd', label: 'explaining why he thinks that humans act in a selfish manner' },
            ],
            answer: 'c',
            explanation: 'C — describing a commonly held belief about people\'s behaviour.',
          },
          {
            number: 28,
            type: 'multiple-choice',
            prompt: 'According to the passage, Knauft\'s observations of hunter-gatherers emphasise',
            options: [
              { id: 'a', label: 'how property is inherited through male lines.' },
              { id: 'b', label: 'an ethical duty to share and limit status differences.' },
              { id: 'c', label: 'the absence of any moral rules about food.' },
              { id: 'd', label: 'competition for leadership among young men.' },
            ],
            answer: 'b',
            explanation: 'B — obligation to share; strategies against status disparities.',
          },
          {
            number: 29,
            type: 'multiple-choice',
            prompt: 'The !Kung custom of swapping arrows is presented as a way to',
            options: [
              { id: 'a', label: 'increase the number of animals killed.' },
              { id: 'b', label: 'stop credit concentrating on a single hunter.' },
              { id: 'c', label: 'train children to make better weapons.' },
              { id: 'd', label: 'identify the owner of each animal\'s meat.' },
            ],
            answer: 'b',
            explanation: 'B — acclaim goes to the arrow owner, not the shooter.',
          },
          {
            number: 30,
            type: 'multiple-choice',
            prompt: 'What does the writer say about women in many hunter-gatherer groups?',
            options: [
              { id: 'a', label: 'They rarely choose their marriage partners.' },
              { id: 'b', label: 'They often have substantial autonomy over work and marriage.' },
              { id: 'c', label: 'They must leave the group if a marriage ends.' },
              { id: 'd', label: 'They control all hunting decisions.' },
            ],
            answer: 'b',
            explanation: 'B — high level of autonomy in work and marriage choices.',
          },
        ],
      },
      {
        range: 'Questions 31–35',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        note: CAM19_T4_UNSELFISH_SUMMARY_NOTE,
        questions: [
          { number: 31, type: 'gap-fill', prompt: 'Gap (31)', options: [], answer: 'egalitarianism', explanation: 'high level of egalitarianism.' },
          { number: 32, type: 'gap-fill', prompt: 'Gap (32)', options: [], answer: 'status', explanation: 'differences in status.' },
          { number: 33, type: 'gap-fill', prompt: 'Gap (33)', options: [], answer: 'hunting', explanation: 'success at hunting (credit goes to arrow owner).' },
          { number: 34, type: 'gap-fill', prompt: 'Gap (34)', options: [], answer: 'domineering', explanation: 'behave in a domineering manner.' },
          { number: 35, type: 'gap-fill', prompt: 'Gap (35)', options: [], answer: 'autonomy', explanation: 'considerable amount of autonomy.' },
        ],
      },
      {
        range: 'Questions 36–40',
        instruction: 'Do the following statements agree with the claims of the writer in the Reading Passage? In boxes 36–40 on your answer sheet, write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        type: 'ynng',
        questions: [
          {
            number: 36,
            type: 'yes-no-not-given',
            prompt: 'Some anthropologists are mistaken about the point when the number of societies such as the !Kung began to decline.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Writer argues certain accounts of that timing are mistaken.',
          },
          {
            number: 37,
            type: 'yes-no-not-given',
            prompt: 'Hunter-gatherer groups never punish members who become too dominant.',
            options: [...YNNG_OPTIONS],
            answer: 'no',
            explanation: 'Domineering individuals may be ostracised / excluded.',
          },
          {
            number: 38,
            type: 'yes-no-not-given',
            prompt: 'Knauft claims that hunter-gatherers accumulate large private stores of goods.',
            options: [...YNNG_OPTIONS],
            answer: 'no',
            explanation: 'They don\'t accumulate property or possessions.',
          },
          {
            number: 39,
            type: 'yes-no-not-given',
            prompt: 'The writer gives the exact global population of !Kung people today.',
            options: [...YNNG_OPTIONS],
            answer: 'not-given',
            explanation: 'No exact population figure.',
          },
          {
            number: 40,
            type: 'yes-no-not-given',
            prompt: 'Cooperative norms appear to have deep roots in human history.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Writer notes cooperative norms deep in human history.',
          },
        ],
      },
    ],
  }
}

const CAM_ROBOTS_FEATURES = [
  { id: 'a', name: 'Martin Rees' },
  { id: 'b', name: 'Daniel Wolpert' },
  { id: 'c', name: 'Kathleen Richardson' },
]

const CAM_ROBOTS_ENDINGS_BANK = [
  { id: 'a', label: 'robots to explore outer space.' },
  { id: 'b', label: 'advances made in machine intelligence so far.' },
  { id: 'c', label: 'changes made to other planets for our own benefit.' },
  { id: 'd', label: 'the harm already done by artificial intelligence.' },
]

/**
 * r3fem — Features A–C Q27–33 + sentence endings A–D Q34–36 + MC Q37–40
 * Preview: Teamplate_Part3_19.jpg (robots — Rees / Wolpert / Richardson)
 */
export function ieltsReadingP3FeaturesEndingsMcPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'What robots can — and cannot — do',
    passageSubtitle: 'Three experts on intelligence, risk and the ethics of machines',
    passage: [
      {
        text: 'Astronomer Martin Rees has long argued that for our own safety, humans will need to restrict the abilities of robots before they become too powerful. He also suggests that robots are probably of more help to us on Earth than in space, where human presence still carries symbolic and scientific value. Rees is fond of noting that the ideas in high-quality science fiction may prove to be just as accurate as those found in the work of mediocre scientists. On ethics, he and Kathleen Richardson express similar caution about changes made to other planets for our own benefit — terraforming, for example, raises moral questions if life already exists there. Rees and neuroscientist Daniel Wolpert share a sober view of the extent of advances made in machine intelligence so far: impressive demos, they say, should not be mistaken for human-like understanding.',
      },
      {
        text: 'Daniel Wolpert is more relaxed about danger. In his view, the risk of robots harming us is less serious than humans believe it to be; engineering limits and human control still dominate real systems. He also stresses that it will take many decades for robot intelligence to be as imaginative as human intelligence. Wolpert disagrees with Richardson on the question of the harm already done by artificial intelligence: he sees today\'s systems as tools with limited agency, not moral patients that have already been wronged at scale.',
      },
      {
        text: 'Anthropologist Kathleen Richardson focuses on how we treat machines as social beings. She argues that we may have to start considering whether we are treating robots fairly, especially as they enter care homes and classrooms. There are those who look forward to robots developing greater intelligence — and Richardson includes herself among people curious about that future — yet she also analyses fear of machines. That fear, she says, is the result of our inclination to attribute human characteristics to non-human entities (anthropomorphism), not merely a rational response to engineering risk.',
      },
      {
        text: 'Together the three voices map a debate rather than a consensus: safety limits, technical patience, and ethical care for how humans project minds onto metal. The writer presents their views side by side so readers can compare risk, ethics and imagination without reducing robots to either utopia or catastrophe.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–33',
        instruction: 'Match each statement with the correct option, A–C. Write the correct letter in boxes 27–33 on your answer sheet.',
        note: 'NB You may use any letter more than once.',
        type: 'matching-features',
        features: CAM_ROBOTS_FEATURES,
        questions: [
          {
            number: 27,
            type: 'matching-features',
            prompt: 'For our own safety, humans will need to restrict the abilities of robots.',
            options: [],
            answer: 'a',
            explanation: 'A Martin Rees — restrict abilities for safety.',
          },
          {
            number: 28,
            type: 'matching-features',
            prompt: 'The risk of robots harming us is less serious than humans believe it to be.',
            options: [],
            answer: 'b',
            explanation: 'B Daniel Wolpert — risk less serious than believed.',
          },
          {
            number: 29,
            type: 'matching-features',
            prompt: 'It will take many decades for robot intelligence to be as imaginative as human intelligence.',
            options: [],
            answer: 'b',
            explanation: 'B Wolpert — many decades for imaginative intelligence.',
          },
          {
            number: 30,
            type: 'matching-features',
            prompt: 'We may have to start considering whether we are treating robots fairly.',
            options: [],
            answer: 'c',
            explanation: 'C Kathleen Richardson — treating robots fairly.',
          },
          {
            number: 31,
            type: 'matching-features',
            prompt: 'Robots are probably of more help to us on Earth than in space.',
            options: [],
            answer: 'a',
            explanation: 'A Rees — more help on Earth than in space.',
          },
          {
            number: 32,
            type: 'matching-features',
            prompt: 'The ideas in high-quality science fiction may prove to be just as accurate as those found in the work of mediocre scientists.',
            options: [],
            answer: 'a',
            explanation: 'A Rees — science fiction vs mediocre scientists.',
          },
          {
            number: 33,
            type: 'matching-features',
            prompt: 'There are those who look forward to robots developing greater intelligence.',
            options: [],
            answer: 'c',
            explanation: 'C Richardson — includes herself among those curious about greater robot intelligence.',
          },
        ],
      },
      {
        range: 'Questions 34–36',
        instruction: 'Complete each sentence with the correct ending, A–D, below. Write the correct letter in boxes 34–36 on your answer sheet.',
        type: 'summary-completion',
        wordBank: CAM_ROBOTS_ENDINGS_BANK,
        questions: [
          {
            number: 34,
            type: 'summary-completion',
            prompt: 'Richardson and Rees express similar views regarding the ethical aspect of',
            options: [],
            answer: 'c',
            explanation: 'C — changes made to other planets for our own benefit.',
          },
          {
            number: 35,
            type: 'summary-completion',
            prompt: 'Rees and Wolpert share an opinion about the extent of',
            options: [],
            answer: 'b',
            explanation: 'B — advances made in machine intelligence so far.',
          },
          {
            number: 36,
            type: 'summary-completion',
            prompt: 'Wolpert disagrees with Richardson on the question of',
            options: [],
            answer: 'd',
            explanation: 'D — the harm already done by artificial intelligence.',
          },
        ],
      },
      {
        range: 'Questions 37–40',
        instruction: 'Choose the correct answer.',
        type: 'multiple-choice',
        questions: [
          {
            number: 37,
            type: 'multiple-choice',
            prompt: 'What point does Richardson make about fear of machines?',
            options: [
              { id: 'a', label: 'It has grown alongside the development of ever more advanced robots.' },
              { id: 'b', label: 'It is the result of our inclination to attribute human characteristics to non-human entities.' },
              { id: 'c', label: 'It has its origins in basic misunderstandings about how inanimate objects function.' },
              { id: 'd', label: 'It demonstrates a key difference between human intelligence and machine intelligence.' },
            ],
            answer: 'b',
            explanation: 'B — anthropomorphism: attributing human characteristics to non-human entities.',
          },
          {
            number: 38,
            type: 'multiple-choice',
            prompt: 'According to Rees, science fiction is mentioned in order to',
            options: [
              { id: 'a', label: 'dismiss all popular culture as unreliable.' },
              { id: 'b', label: 'suggest that good speculative ideas can rival weak scientific work.' },
              { id: 'c', label: 'prove that robots already write novels.' },
              { id: 'd', label: 'argue that only astronomers should design robots.' },
            ],
            answer: 'b',
            explanation: 'B — high-quality SF may match mediocre scientists\' accuracy.',
          },
          {
            number: 39,
            type: 'multiple-choice',
            prompt: 'What does Wolpert believe about the danger posed by robots?',
            options: [
              { id: 'a', label: 'It is overstated compared with what many people fear.' },
              { id: 'b', label: 'It will make human workers obsolete within five years.' },
              { id: 'c', label: 'It only exists in science-fiction films.' },
              { id: 'd', label: 'It is greater in care homes than in factories.' },
            ],
            answer: 'a',
            explanation: 'A — risk less serious than humans believe.',
          },
          {
            number: 40,
            type: 'multiple-choice',
            prompt: 'Overall, the passage mainly',
            options: [
              { id: 'a', label: 'recommends banning all robot research immediately.' },
              { id: 'b', label: 'presents contrasting expert views on robots, risk and ethics.' },
              { id: 'c', label: 'describes how to build a robot from recycled parts.' },
              { id: 'd', label: 'argues that only Martin Rees is correct.' },
            ],
            answer: 'b',
            explanation: 'B — three expert voices mapped as a debate.',
          },
        ],
      },
    ],
  }
}

/**
 * r3mey — MC Q27–30 + Sentence endings A–F Q31–34 + YNNG Q35–40
 * Preview: Teamplate_Part3_16.jpg (artificial speech translation — Cam19 T3 P3)
 */
export function ieltsReadingP3McEndingsYnngPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'Is the era of artificial speech translation upon us?',
    passageSubtitle: 'How close is seamless machine interpretation?',
    passage: [
      {
        text: 'Imagine two people trying to talk over a poor phone line in a noisy café, far from any shared language. Aspects of the conversation are challenging for both speakers: noise, distance, and imperfect connection make understanding difficult even before translation begins.',
      },
      {
        text: 'At Karlsruhe Institute of Technology, electronic translators used in lectures are assisted by the repeated content of lectures, which gives systems more predictable input than free conversation. Systems are improving quickly, yet accuracy still varies by domain and language pair.',
      },
      {
        text: 'Writers often invoke The Hitchhiker\'s Guide to the Galaxy when discussing instantaneous translation gadgets. The fantasy device highlights public expectations that software will one day remove language barriers entirely, even if real tools remain imperfect.',
      },
      {
        text: 'Sharing earpieces for live interpretation is something people may get used to doing in meetings and classrooms. Speech translation methods are developing fast in Japan, but there are concerns about this. TV interviews that use translation voiceover methods are successful despite the noise issues. Future translation systems should address people appropriately and have an awareness of good manners. Users may be able to maintain their local customs as systems do not need to conform to standard practices.',
      },
      {
        text: 'Professors and professionals are unlikely to outsource all language awareness to software. Language translation systems will not simply be dismissed as toys: many expect them to prove useful in academic and professional settings, though the overall value to family life is still open to question. Automated translation could help after migration when children and grandparents lack a shared language, rather than only making life more difficult. Visual aspects of dubbing and lip-sync remain awkward. Software will never fully replace the social value of sharing a language, even if practical needs diminish.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–30',
        instruction: 'Choose the correct answer.',
        type: 'multiple-choice',
        questions: [
          {
            number: 27,
            type: 'multiple-choice',
            prompt: 'What does the reader learn about the conversation in the first paragraph?',
            options: [
              { id: 'a', label: 'The speakers are communicating in different languages.' },
              { id: 'b', label: 'Neither of the speakers is familiar with their environment.' },
              { id: 'c', label: 'The topic of the conversation is difficult for both speakers.' },
              { id: 'd', label: 'Aspects of the conversation are challenging for both speakers.' },
            ],
            answer: 'd',
            explanation: 'D — noise, distance, and connection challenges for both speakers.',
          },
          {
            number: 28,
            type: 'multiple-choice',
            prompt: 'What assists the electronic translator during lectures at Karlsruhe Institute of Technology?',
            options: [
              { id: 'a', label: 'the repeated content of lectures' },
              { id: 'b', label: 'the students\' reading skills' },
              { id: 'c', label: 'the languages used' },
              { id: 'd', label: 'the lecturers\' technical ability' },
            ],
            answer: 'a',
            explanation: 'A — repeated content of lectures.',
          },
          {
            number: 29,
            type: 'multiple-choice',
            prompt: 'When referring to The Hitchhiker\'s Guide to the Galaxy, the writer suggests that',
            options: [
              { id: 'a', label: 'science fiction predicted exact modern devices.' },
              { id: 'b', label: 'public expectations of instant translation are shaped by fantasy gadgets.' },
              { id: 'c', label: 'translation software already matches the novel\'s accuracy.' },
              { id: 'd', label: 'readers should avoid science-fiction analogies.' },
            ],
            answer: 'b',
            explanation: 'B — fantasy device highlights public expectations.',
          },
          {
            number: 30,
            type: 'multiple-choice',
            prompt: 'What does the writer say about sharing earpieces?',
            options: [
              { id: 'a', label: 'It will remain socially unacceptable.' },
              { id: 'b', label: 'It is something people will get used to doing.' },
              { id: 'c', label: 'It only works for one language pair.' },
              { id: 'd', label: 'It requires no technical support.' },
            ],
            answer: 'b',
            explanation: 'B — people may get used to sharing earpieces.',
          },
        ],
      },
      {
        range: 'Questions 31–34',
        instruction: 'Complete each sentence with the correct ending, A–F, below. Write the correct letter in boxes 31–34 on your answer sheet.',
        type: 'summary-completion',
        wordBank: CAM19_T3_SPEECH_ENDINGS_BANK,
        questions: [
          {
            number: 31,
            type: 'summary-completion',
            prompt: 'Speech translation methods are developing fast in Japan',
            options: [],
            answer: 'a',
            explanation: 'A — but there are concerns about this.',
          },
          {
            number: 32,
            type: 'summary-completion',
            prompt: 'TV interviews that use translation voiceover methods are successful',
            options: [],
            answer: 'd',
            explanation: 'D — despite the noise issues.',
          },
          {
            number: 33,
            type: 'summary-completion',
            prompt: 'Future translation systems should address people appropriately',
            options: [],
            answer: 'f',
            explanation: 'F — and have an awareness of good manners.',
          },
          {
            number: 34,
            type: 'summary-completion',
            prompt: 'Users may be able to maintain their local customs',
            options: [],
            answer: 'b',
            explanation: 'B — as systems do not need to conform to standard practices.',
          },
        ],
      },
      {
        range: 'Questions 35–40',
        instruction: 'Do the following statements agree with the claims of the writer in the Reading Passage? In boxes 35–40 on your answer sheet, write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        type: 'ynng',
        questions: [
          {
            number: 35,
            type: 'yes-no-not-given',
            prompt: 'Language translation systems will be seen as very useful throughout the academic and professional worlds.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Writer expects usefulness in academic and professional settings.',
          },
          {
            number: 36,
            type: 'yes-no-not-given',
            prompt: 'The overall value of automated translation to family life is yet to be shown.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Value to family life is open to question.',
          },
          {
            number: 37,
            type: 'yes-no-not-given',
            prompt: 'Automated translation could make life more difficult for immigrant families.',
            options: [...YNNG_OPTIONS],
            answer: 'no',
            explanation: 'Could overcome barriers between generations after migration.',
          },
          {
            number: 38,
            type: 'yes-no-not-given',
            prompt: 'Visual aspects of language translation are being considered by scientists.',
            options: [...YNNG_OPTIONS],
            answer: 'not-given',
            explanation: 'Lip-sync awkwardness noted; not framed as active research claim.',
          },
          {
            number: 39,
            type: 'yes-no-not-given',
            prompt: 'International scientists have found English easier to translate into other languages than Latin.',
            options: [...YNNG_OPTIONS],
            answer: 'not-given',
            explanation: 'No such comparison of ease of translation.',
          },
          {
            number: 40,
            type: 'yes-no-not-given',
            prompt: 'As far as language is concerned, there is a difference between people\'s social and practical needs.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Practical need for a common language may diminish while social value persists.',
          },
        ],
      },
    ],
  }
}

/** Cam11 T1 — bảng geo-engineering Q30–36 */
export const CAM11_T1_GEO_ENGINEERING_TABLE: ReadingNoteTable = {
  title: 'GEO-ENGINEERING PROJECTS',
  headers: ['Procedure', 'Aim'],
  gapNumbers: [30, 31, 32, 33, 34, 35, 36],
  rows: [
    {
      cells: [
        [{ type: 'static', text: 'put a large number of tiny spacecraft into orbit far above Earth' }],
        [
          { type: 'static', text: 'to create a ' },
          { type: 'gap', number: 30 },
          { type: 'static', text: ' that would reduce the amount of light reaching Earth' },
        ],
      ],
    },
    {
      cells: [
        [
          { type: 'static', text: 'place ' },
          { type: 'gap', number: 31 },
          { type: 'static', text: ' in the sea' },
        ],
        [
          { type: 'static', text: 'to encourage ' },
          { type: 'gap', number: 32 },
          { type: 'static', text: ' to form' },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'release aerosol sprays into the stratosphere' }],
        [
          { type: 'static', text: 'to create ' },
          { type: 'gap', number: 33 },
          { type: 'static', text: ' that would reduce the amount of light reaching Earth' },
        ],
      ],
    },
    {
      cells: [
        [
          { type: 'static', text: 'fix strong ' },
          { type: 'gap', number: 34 },
          { type: 'static', text: ' to Greenland ice sheets' },
        ],
        [{ type: 'static', text: 'to prevent icebergs moving into the sea' }],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'plant trees in Russian Arctic that would lose their leaves in winter' }],
        [
          { type: 'static', text: 'to allow the ' },
          { type: 'gap', number: 35 },
          { type: 'static', text: ' to reflect radiation' },
        ],
      ],
    },
    {
      cells: [
        [
          { type: 'static', text: 'change the direction of ' },
          { type: 'gap', number: 36 },
        ],
        [{ type: 'static', text: 'to bring more cold water into ice-forming areas' }],
      ],
    },
  ],
}

const CAM11_T1_GEO_SCIENTISTS = [
  { id: 'a', name: 'Roger Angel' },
  { id: 'b', name: 'Phil Rasch' },
  { id: 'c', name: 'Dan Lunt' },
  { id: 'd', name: 'Martin Sommerkorn' },
]

/** Cam11 T1 — match para Q27–29 + table Q30–36 + match người Q37–40 */
export function ieltsReadingP3MatchTableFeaturesPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'Reducing the Effects of Climate Change',
    passageSubtitle: 'Mark Rowe reports on the increasingly ambitious geo-engineering projects being explored by scientists',
    passage: [
      {
        label: 'A',
        text: 'Such is our dependence on fossil fuels, and such is the volume of carbon dioxide already released into the atmosphere, that many experts agree that significant global warming is now inevitable. They believe that the best we can do is keep it at a reasonable level, and at present the only serious option for doing this is cutting back on our carbon emissions. But while a few countries are making major strides in this regard, the majority are having great difficulty even stemming the rate of increase, let alone reversing it. Consequently, an increasing number of scientists are beginning to explore the alternative of geo-engineering — a term which generally refers to the intentional large-scale manipulation of the environment. According to its proponents, geo-engineering is the equivalent of a backup generator: if Plan A — reducing our dependency on fossil fuels — fails, we require a Plan B, employing grand schemes to slow down or reverse the process of global warming.',
      },
      {
        label: 'B',
        text: 'Geo-engineering has been shown to work, at least on a small localised scale. For decades, May Day parades in Moscow have taken place under clear blue skies, aircraft having deposited dry ice, silver iodide and cement powder to disperse clouds. Many of the schemes now suggested look to do the opposite, and reduce the amount of sunlight reaching the planet. The most eye-catching idea of all is suggested by Professor Roger Angel of the University of Arizona. His scheme would employ up to 16 trillion minute spacecraft, each weighing about one gram, to form a transparent, sunlight-refracting sunshade in an orbit 1.5 million km above the Earth. This could, argues Angel, reduce the amount of light reaching the Earth by two per cent.',
      },
      {
        label: 'C',
        text: 'The majority of geo-engineering projects so far carried out — which include planting forests in deserts and depositing iron in the ocean to stimulate the growth of algae — have focused on achieving a general cooling of the Earth. But some look specifically at reversing the melting at the poles, particularly the Arctic. The reasoning is that if you replenish the ice sheets and frozen waters of the high latitudes, more light will be reflected back into space, so reducing the warming of the oceans and atmosphere.',
      },
      {
        label: 'D',
        text: 'The concept of releasing aerosol sprays into the stratosphere above the Arctic has been proposed by several scientists. This would involve using sulphur or hydrogen sulphide aerosols so that sulphur dioxide would form clouds, which would, in turn, lead to a global dimming. The idea is modelled on historic volcanic explosions, such as that of Mount Pinatubo in the Philippines in 1991, which led to a short-term cooling of global temperatures by 0.5 °C. Scientists have also scrutinised whether it is possible to preserve the ice sheets of Greenland with reinforced high-tension cables, preventing icebergs from moving into the sea. Meanwhile in the Russian Arctic, geo-engineering plans include the planting of millions of birch trees. Whereas the regions native evergreen pines shade the snow and absorb radiation, birches would shed their leaves in winter, thus enabling radiation to be reflected by the snow. Re-routing Russian rivers to increase cold water flow to ice-forming areas could also be used to slow down warming, say some climate scientists.',
      },
      {
        label: 'E',
        text: 'But will such schemes ever be implemented? Generally speaking, those who are most cautious about geo-engineering are the scientists involved in the research. Angel says that his plan is "no substitute for developing renewable energy: the only permanent solution". And Dr Phil Rasch of the US-based Pacific Northwest National Laboratory is equally guarded about the role of geo-engineering: "I think all of us agree that if we were to end geo-engineering on a given day, then the planet would return to its pre-engineered condition very rapidly, and probably within ten to twenty years. That\'s certainly something to worry about."',
      },
      {
        label: 'F',
        text: 'The US National Center for Atmospheric Research has already suggested that the proposal to inject sulphur into the atmosphere might affect rainfall patterns across the tropics and the Southern Ocean. "Geo-engineering plans to inject stratospheric aerosols or to seed clouds would act to cool the planet, and act to increase the extent of sea ice," says Rasch. "But all the models suggest some impact on the distribution of precipitation."',
      },
      {
        label: 'G',
        text: 'A further risk with geo-engineering projects is that you can "overshoot", says Dr Dan Lunt, from the University of Bristol\'s School of Geophysical Sciences, who has studied the likely impacts of the sunshade and aerosol schemes on the climate. "You may bring global temperatures back to pre-industrial levels, but the risk is that the poles will still be warmer than they should be and the tropics will be cooler than before industrialisation." To avoid such a scenario, Hunt says, "Angel\'s project would have to operate at half strength; all of which reinforces his view that the best option is to avoid the need for geo-engineering altogether."',
      },
      {
        label: 'H',
        text: 'The main reason why geo-engineering is supported by many in the scientific community is that most researchers have little faith in the ability of politicians to agree — and then bring in — the necessary carbon cuts. Even leading conservation organisations see the value of investigating the potential of geo-engineering. According to Dr Martin Sommerkorn, climate change advisor for the World Wildlife Fund\'s International Arctic Programme, "Human-induced climate change has brought humanity to a position where we shouldn\'t exclude thinking thoroughly about this topic and its possibilities."',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–29',
        instruction: 'Reading Passage 3 has eight sections, A–H. Which section contains the following information?',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        questions: [
          { number: 27, type: 'matching-paragraph', prompt: 'mention of a geo-engineering project based on an earlier natural phenomenon', options: [], answer: 'd', explanation: 'Mô hình theo núi lửa Pinatubo 1991.' },
          { number: 28, type: 'matching-paragraph', prompt: 'an example of a successful use of geo-engineering', options: [], answer: 'b', explanation: 'May Day Moscow — phân tán mây bằng máy bay.' },
          { number: 29, type: 'matching-paragraph', prompt: 'a common definition of geo-engineering', options: [], answer: 'a', explanation: 'Định nghĩa thao tác môi trường quy mô lớn.' },
        ],
      },
      {
        range: 'Questions 30–36',
        instruction: 'Complete the table below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        noteTable: CAM11_T1_GEO_ENGINEERING_TABLE,
        questions: gapQuestions(30, [
          { prompt: 'Gap (30)', answer: 'sunshade|shield', explanation: 'Tấm chắn ánh sáng quỹ đạo (sunshade).' },
          { prompt: 'Gap (31)', answer: 'iron', explanation: 'Rải sắt kích thích tảo.' },
          { prompt: 'Gap (32)', answer: 'algae', explanation: 'Kích thích tảo phát triển.' },
          { prompt: 'Gap (33)', answer: 'clouds', explanation: 'Aerosol tạo mây làm mờ toàn cầu.' },
          { prompt: 'Gap (34)', answer: 'cables', explanation: 'Cáp căng giữ băng Greenland.' },
          { prompt: 'Gap (35)', answer: 'snow', explanation: 'Tuyết phản xạ bức xạ.' },
          { prompt: 'Gap (36)', answer: 'rivers', explanation: 'Đổi hướng sông Nga.' },
        ]),
      },
      {
        range: 'Questions 37–40',
        instruction: 'Look at the following statements and the list of scientists below. Match each statement with the correct scientist, A–D.',
        type: 'matching-features',
        features: CAM11_T1_GEO_SCIENTISTS,
        questions: [
          { number: 37, type: 'matching-features', prompt: 'The effects of geo-engineering may not be long-lasting.', options: [], answer: 'b', explanation: 'Rasch — hiệu ứng mất sau 10–20 năm.' },
          { number: 38, type: 'matching-features', prompt: 'Geo-engineering is a topic worth exploring.', options: [], answer: 'd', explanation: 'Sommerkorn — nên nghiên cứu kỹ.' },
          { number: 39, type: 'matching-features', prompt: 'It may be necessary to limit the effectiveness of geo-engineering projects.', options: [], answer: 'c', explanation: 'Lunt — tránh overshoot, chạy 50% công suất.' },
          { number: 40, type: 'matching-features', prompt: 'Research into non-fossil-based fuels cannot be replaced by geo-engineering.', options: [], answer: 'a', explanation: 'Angel — không thay năng lượng tái tạo.' },
        ],
      },
    ],
  }
}

/** Gap Q27–31 + TFNG Q32–36 + MC Q37–40 */
export function ieltsReadingP3GapTfngMcPart(): ReadingImportPartJson {
  const base = MOCK.parts[2]
  const tfngGroup = base.questionGroups[0]
  const mcGroup = base.questionGroups[1]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 27–31',
        instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(27, [
          { prompt: 'Sleep is linked to ___', answer: 'memory', explanation: 'Linked to memory.' },
          { prompt: 'Brain replays experiences from the ___', answer: 'day', explanation: 'From the day.' },
          { prompt: 'REM supports ___ solving', answer: 'creative', explanation: 'Creative solving.' },
          { prompt: 'Studies may have small ___', answer: 'sample sizes', explanation: 'Small sample sizes.' },
          { prompt: 'Less sleep lowers ___', answer: 'productivity', explanation: 'Lowers productivity.' },
        ]),
      },
      renumberGroup(tfngGroup, 'Questions 32–36', 32, 5),
      renumberGroup(mcGroup, 'Questions 37–40', 37, 4),
    ],
  }
}

const CAM19_T1_MISINFO_WORD_BANK = [
  { id: 'a', label: 'constant conflict' },
  { id: 'b', label: 'additional evidence' },
  { id: 'c', label: 'different locations' },
  { id: 'd', label: 'experimental subjects' },
  { id: 'e', label: 'short period' },
  { id: 'f', label: 'extreme distrust' },
  { id: 'g', label: 'mental operation' },
  { id: 'h', label: 'frequent exposure' },
  { id: 'i', label: 'dubious reason' },
  { id: 'j', label: 'different ideas' },
]

const CAM19_T1_MISINFO_SUMMARY_NOTE = [
  'What happens when people encounter misinformation?',
  '',
  'Although people have 31________ to misinformation, there is debate about precisely how and when we label something as true or untrue. The philosophers Descartes and Spinoza had 32________ about how people engage with information. While Descartes believed that people accept or reject information after considering whether it is true or not, Spinoza argued that people accepted all information they encountered (and by default misinformation) and did not verify or reject it until afterwards. Moreover, Spinoza believed that a distinct 33________ is involved in these stages. Recent research has provided 34________ for Spinoza\'s theory and it would appear that people accept all encountered information as if it were true, even if this is for an extremely 35________, and do not label the information as true or false until later. This is consistent with the fact that the resources for scepticism and the resources for perceiving and encoding are in 36________ in the brain.',
].join('\n')

/**
 * r3my — MC Q27–30 + Summary bank A–J Q31–36 + YNNG Q37–40
 * SAMPLE: Cam19 Test 1 P3 (The persistence and peril of misinformation)
 * ⚠️ Thứ tự: MC → summary bank → YNNG (khác r3ysm: YNNG → summary → MC)
 */
export function ieltsReadingP3McSummaryYnngPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'The persistence and peril of misinformation',
    passageSubtitle: 'Brian Southwell looks at how human brains verify information and discusses some of the challenges of battling widespread falsehoods.',
    passage: [
      { text: 'Misinformation - both deliberately promoted and accidentally shared - is perhaps an inevitable part of the world in which we live, but it is not a new problem. People likely have lied to one another for roughly as long as verbal communication has existed. Deceiving others can offer an apparent opportunity to gain strategic advantage, to motivate others to action, or even to protect interpersonal bonds. Moreover, people inadvertently have been sharing inaccurate information with one another for thousands of years.' },
      { text: 'However, we currently live in an era in which technology enables information to reach large audiences distributed across the globe, and thus the potential for immediate and widespread effects from misinformation now looms larger than in the past. Yet the means to correct misinformation might, over time, be found in those same patterns of mass communication and of the facilitated spread of information.' },
      { text: 'The main worry regarding misinformation is its potential to unduly influence attitudes and behavior, leading people to think and act differently than they would if they were correctly informed, as suggested by the research teams of Stephan Lewandowsky of the University of Bristol and Elizabeth Marsh of Duke University, among others. In other words, we worry that misinformation might lead people to hold misperceptions (or false beliefs) and that these misperceptions, especially when they occur among large groups of people, may have detrimental, downstream consequences for health, social harmony, and the political climate.' },
      { text: 'At least three observations related to misinformation in the contemporary mass-media environment warrant the attention of researchers, policy makers, and really everyone who watches television, listens to the radio, or reads information online. First of all, people who encounter misinformation tend to believe it, at least initially. Secondly, electronic and print media often do not block many types of misinformation before it appears in content available to large audiences. Thirdly, countering misinformation once it has enjoyed wide exposure can be a resource-intensive effort.' },
      { text: 'Knowing what happens when people initially encounter misinformation holds tremendous importance for estimating the potential for subsequent problems. Although it is fairly routine for individuals to come across information that is false, the question of exactly how - and when - we mentally label information as true or false has garnered philosophical debate. The dilemma is neatly summarized by a contrast between how the 17th-century philosophers Rene Descartes and Baruch Spinoza described human information engagement, with conflicting predictions that only recently have been empirically tested in robust ways. Descartes argued that a person only accepts or rejects information after considering its truth or falsehood; Spinoza argued that people accept all encountered information (or misinformation) by default and then subsequently verify or reject it through a separate cognitive process. In recent decades, empirical evidence from the research teams of Erik Asp of the University of Chicago and Daniel Gilbert at Harvard University, among others, has supported Spinoza\'s account: people appear to encode all new information as if it were true, even if only momentarily, and later tag the information as being either true or false, a pattern that seems consistent with the observation that mental resources for skepticism physically reside in a different part of the brain than the resources used in perceiving and encoding.' },
      { text: 'What about our second observation that misinformation often can appear in electronic or print media without being preemptively blocked? In support of this, one might consider the nature of regulatory structures in the United States: regulatory agencies here tend to focus on post hoc detection of broadcast information. Organizations such as the Food and Drug Administration (FDA) offer considerable monitoring and notification functions, but these roles typically do not involve preemptive censoring. The FDA oversees direct-to-consumer prescription drug advertising, for example, and has developed mechanisms such as the \'Bad Ad\' program, through which people can report advertising in apparent violation or FDA guidelines on drug risks. Such programs, although laudable and useful, do not keep false advertising off the airwaves. In addition, even misinformation that is successfully corrected can continue to affect attitudes.' },
      { text: 'This leads us to our third observation: a campaign to correct misinformation, even if rhetorically compelling, requires resources and planning to accomplish necessary reach and frequency. For corrective campaigns to be persuasive, audiences need to be able to comprehend them, which requires either effort to frame messages in ways that are accessible or effort to educate and sensitize audiences to the possibility of misinformation. That some audiences might be unaware of the potential for misinformation also suggests the utility of media literacy efforts as early as elementary school. Even with journalists and scholars pointing to the phenomenon of \'fake news\', people do not distinguish between demonstrably false stories and those based in fact when scanning and processing written information.' },
      { text: 'We live at a time when widespread misinformation is common. Yet at this time many people also are passionately developing potential solutions and remedies. The journey forward undoubtedly will be a long and arduous one. Future remedies will require not only continued theoretical consideration but also the development and maintenance of consistent monitoring tools - and a recognition among fellow members of society that claims which find prominence in the media that are insufficiently based in scientific consensus and social reality should be countered. Misinformation arises as a result of human fallibility and human information needs. To overcome the worst effects of the phenomenon, we will need coordinated efforts over time, rather than any singular one-time panacea we could hope to offer.' },
    ],
    questionGroups: [
      {
        range: 'Questions 27–30',
        instruction: 'Choose the correct letter, A, B, C or D.',
        type: 'multiple-choice',
        questions: [
          {
            number: 27,
            type: 'multiple-choice',
            prompt: 'What point does the writer make about misinformation in the first paragraph?',
            options: [
              { id: 'a', label: 'Misinformation is a relatively recent phenomenon.' },
              { id: 'b', label: 'Some people find it easy to identify misinformation.' },
              { id: 'c', label: 'Misinformation changes as it is passed from one person to another.' },
              { id: 'd', label: 'There may be a number of reasons for the spread of misinformation.' },
            ],
            answer: 'd',
            explanation: 'First paragraph lists several reasons for spreading misinformation: strategic advantage, motivating others, protecting bonds, and inadvertent sharing.',
          },
          {
            number: 28,
            type: 'multiple-choice',
            prompt: 'What does the writer say about the role of technology?',
            options: [
              { id: 'a', label: 'It may at some point provide us with a solution to misinformation.' },
              { id: 'b', label: 'It could fundamentally alter the way in which people regard information.' },
              { id: 'c', label: 'It has changed the way in which organisations use misinformation.' },
              { id: 'd', label: 'It has made it easier for people to check whether information is accurate.' },
            ],
            answer: 'a',
            explanation: 'Second paragraph: \'Yet the means to correct misinformation might, over time, be found in those same patterns of mass communication.\'',
          },
          {
            number: 29,
            type: 'multiple-choice',
            prompt: 'What is the writer doing in the fourth paragraph?',
            options: [
              { id: 'a', label: 'comparing the different opinions people have of misinformation' },
              { id: 'b', label: 'explaining how the effects of misinformation have changed over time' },
              { id: 'c', label: 'outlining which issues connected with misinformation are significant today' },
              { id: 'd', label: 'describing the attitude of policy makers towards misinformation in the media' },
            ],
            answer: 'c',
            explanation: 'Fourth paragraph lists three observations that warrant attention, i.e., significant issues today.',
          },
          {
            number: 30,
            type: 'multiple-choice',
            prompt: 'What point does the writer make about regulation in the USA?',
            options: [
              { id: 'a', label: 'The guidelines issued by the FDA need to be simplified.' },
              { id: 'b', label: 'Regulation does not affect people\'s opinions of new prescription drugs.' },
              { id: 'c', label: 'The USA has more regulatory bodies than most other countries.' },
              { id: 'd', label: 'Regulation fails to prevent misinformation from appearing in the media.' },
            ],
            answer: 'd',
            explanation: 'Sixth paragraph: \'Such programs... do not keep false advertising off the airwaves.\'',
          },
        ],
      },
      {
        range: 'Questions 31–36',
        instruction: 'Complete the summary using the list of phrases, A–J, below.',
        type: 'summary-completion',
        note: CAM19_T1_MISINFO_SUMMARY_NOTE,
        wordBank: CAM19_T1_MISINFO_WORD_BANK,
        questions: [
          { number: 31, type: 'summary-completion', prompt: 'Gap (31)', options: [], answer: 'h', explanation: 'frequent exposure' },
          { number: 32, type: 'summary-completion', prompt: 'Gap (32)', options: [], answer: 'j', explanation: 'different ideas' },
          { number: 33, type: 'summary-completion', prompt: 'Gap (33)', options: [], answer: 'g', explanation: 'mental operation' },
          { number: 34, type: 'summary-completion', prompt: 'Gap (34)', options: [], answer: 'b', explanation: 'additional evidence' },
          { number: 35, type: 'summary-completion', prompt: 'Gap (35)', options: [], answer: 'e', explanation: 'short period' },
          { number: 36, type: 'summary-completion', prompt: 'Gap (36)', options: [], answer: 'c', explanation: 'different locations' },
        ],
      },
      {
        range: 'Questions 37–40',
        instruction: 'Do the following statements agree with the claims of the writer in the Reading Passage? In boxes 37–40 on your answer sheet, write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        type: 'ynng',
        questions: [
          {
            number: 37,
            type: 'yes-no-not-given',
            prompt: 'Campaigns designed to correct misinformation will fail to achieve their purpose if people are unable to understand them.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Seventh paragraph: \'For corrective campaigns to be persuasive, audiences need to be able to comprehend them.\'',
          },
          {
            number: 38,
            type: 'yes-no-not-given',
            prompt: 'Attempts to teach elementary school students about misinformation have been opposed.',
            options: [...YNNG_OPTIONS],
            answer: 'not-given',
            explanation: 'Writer suggests utility of media literacy efforts as early as elementary school, but does not mention opposition.',
          },
          {
            number: 39,
            type: 'yes-no-not-given',
            prompt: 'It may be possible to overcome the problem of misinformation in a relatively short period.',
            options: [...YNNG_OPTIONS],
            answer: 'no',
            explanation: 'Last paragraph: \'The journey forward undoubtedly will be a long and arduous one.\' and \'coordinated efforts over time, rather than any singular one-time panacea.\'',
          },
          {
            number: 40,
            type: 'yes-no-not-given',
            prompt: 'The need to keep up with new information is hugely exaggerated in today\'s world.',
            options: [...YNNG_OPTIONS],
            answer: 'not-given',
            explanation: 'No mention of this claim in the passage.',
          },
        ],
      },
    ],
  }
}

/** Cam11 T3 — match đoạn Q27–34 + sentence completion Q35–40 */
export function ieltsReadingP3MatchParagraphSentencePart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'Preface to \'How the other half thinks: Adventures in mathematical reasoning\'',
    passageSubtitle: 'This marvellous invention',
    passage: [
      {
        label: 'A',
        text: 'Occasionally, in some difficult musical compositions, there are beautiful, but easy parts — parts so simple a beginner could play them. So it is with mathematics as well. There are some discoveries in advanced mathematics that do not depend on specialized knowledge, not even on algebra, geometry, or trigonometry. Instead, they may involve, at most, a little arithmetic, such as "the sum of two odd numbers is even", and common sense. Each of the eight chapters in this book illustrates this phenomenon. Anyone can understand every step in the reasoning.',
      },
      {
        label: 'B',
        text: 'I want to reveal not only some of the fascinating discoveries, but, more importantly, the reasoning behind them. In that respect, this book differs from most books on mathematics written for the general public. Some present the lives of colourful mathematicians. Others describe important applications of mathematics. Yet others go into mathematical procedures, but assume that the reader is adept in using algebra.',
      },
      {
        label: 'C',
        text: 'To illustrate our human potential, I cite a structural engineer who is an artist, an electrical engineer who is an opera singer, an opera singer who published mathematical research, and a mathematician who publishes short stories. As the chapters will illustrate, mathematics is not restricted to the analytical and numerical; intuition plays a significant role.',
      },
      {
        label: 'D',
        text: 'Other scientists have written books to explain their fields to non-scientists, but have necessarily had to omit the mathematics, although it provides the foundation of their theories. The reader must remain a tantalized spectator rather than an involved participant, since the concepts in question are not accessible without mathematical knowledge.',
      },
      {
        label: 'E',
        text: 'This book presents details that illustrate the mathematical style of thinking, which involves sustained, step-by-step analysis, experiments, and insights. You will turn these pages much more slowly than when reading a novel or a newspaper. Still, non-mathematical readers can go far in understanding mathematical reasoning. It may help to have a pencil and paper ready to check claims and carry out experiments.',
      },
      {
        label: 'F',
        text: 'As I wrote, I kept in mind two types of readers: those who enjoyed mathematics until they were turned off by an unpleasant episode, usually around fifth grade, and mathematics aficionados, who will find much that is new throughout the book. This book also serves readers who simply want to sharpen their analytical skills.',
      },
      {
        label: 'G',
        text: 'A physician wrote, "The discipline of medicine has taught me to be careful in my observations and to use reason as an instrument for extending these observations." A lawyer with no background in law did well at one of the best law schools. He attributes much of his success to having learned, through the study of mathematics, and, in particular, theorems, how to analyze complicated principles.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–34',
        instruction: 'Reading Passage 3 has seven sections, A–G. Which section contains the following information?',
        note: 'NB You may use any letter more than once.',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        questions: [
          { number: 27, type: 'matching-paragraph', prompt: 'a reference to books that assume a lack of mathematical knowledge', options: [], answer: 'd', explanation: 'Đoạn D — sách khoa học bỏ qua toán vì độc giả không có kiến thức toán.' },
          { number: 28, type: 'matching-paragraph', prompt: 'the way in which this is not a typical book about mathematics', options: [], answer: 'b', explanation: 'Đoạn B — khác hầu hết sách toán cho đại chúng.' },
          { number: 29, type: 'matching-paragraph', prompt: 'personal examples of being helped by mathematics', options: [], answer: 'g', explanation: 'Đoạn G — bác sĩ và luật sư được toán giúp ích.' },
          { number: 30, type: 'matching-paragraph', prompt: 'examples of people who each had abilities that seemed incompatible', options: [], answer: 'c', explanation: 'Đoạn C — kỹ sư là nghệ sĩ, ca sĩ opera làm toán…' },
          { number: 31, type: 'matching-paragraph', prompt: 'mention of different focuses of books about mathematics', options: [], answer: 'b', explanation: 'Đoạn B — tiểu sử, ứng dụng, quy trình toán.' },
          { number: 32, type: 'matching-paragraph', prompt: 'a contrast between reading this book and reading other kinds of publication', options: [], answer: 'e', explanation: 'Đoạn E — đọc chậm hơn novel/newspaper.' },
          { number: 33, type: 'matching-paragraph', prompt: 'a claim that the whole of the book is accessible to everybody', options: [], answer: 'a', explanation: 'Đoạn A — Anyone can understand every step.' },
          { number: 34, type: 'matching-paragraph', prompt: 'a reference to different categories of intended readers of this book', options: [], answer: 'f', explanation: 'Đoạn F — two types of readers.' },
        ],
      },
      {
        range: 'Questions 35–40',
        instruction: 'Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'sentence-completion',
        questions: sentenceQuestions(35, [
          { prompt: 'Some areas of both music and mathematics are suitable for someone who is a ___', answer: 'beginner', explanation: 'Parts so simple a beginner could play them.' },
          { prompt: 'It is sometimes possible to understand advanced mathematics using no more than a limited knowledge of ___', answer: 'arithmetic', explanation: 'At most a little arithmetic.' },
          { prompt: 'The writer intends to show that mathematics requires ___ thinking, as well as analytical skills', answer: 'intuitive', explanation: 'Intuition plays a significant role.' },
          { prompt: 'Some books written by ___ have had to leave out the mathematics that is central to their theories', answer: 'scientists', explanation: 'Other scientists have written books… omit the mathematics.' },
          { prompt: 'The writer advises non-mathematical readers to perform ___ while reading the book', answer: 'experiments', explanation: 'Carry out experiments with pencil and paper.' },
          { prompt: 'A lawyer found that studying ___ helped even more than other areas of mathematics in the study of law', answer: 'theorems', explanation: 'Study of theorems helped analyze complicated principles.' },
        ]),
      },
    ],
  }
}

const CAM11_T4_LANGUAGE_HEADINGS = [
  { id: 'i', label: 'Differences between languages highlight their impressiveness' },
  { id: 'ii', label: 'The way in which a few sounds are organised to convey a huge range of meaning' },
  { id: 'iii', label: 'Why the sounds used in different languages are not identical' },
  { id: 'iv', label: 'Apparently incompatible characteristics of language' },
  { id: 'v', label: 'Even silence can be meaningful' },
  { id: 'vi', label: 'Why language is the most important invention of all' },
  { id: 'vii', label: 'The universal ability to use language' },
]

const CAM11_T4_LANGUAGE_WORD_BANK = [
  { id: 'a', label: 'difficult' },
  { id: 'b', label: 'complex' },
  { id: 'c', label: 'original' },
  { id: 'd', label: 'admired' },
  { id: 'e', label: 'material' },
  { id: 'f', label: 'easy' },
  { id: 'g', label: 'fundamental' },
]

const CAM11_T4_LANGUAGE_SUMMARY_NOTE = [
  'The importance of language',
  '',
  'The wheel is one invention that has had a major impact on 33________ aspects of life, but no impact has been as '
  + '34________ as that of language. Language is very 35________, yet composed of just a small number of sounds. '
  + 'Language appears to be 36________ to use. However, its sophistication is often overlooked.',
].join('\n')

/** Cam11 T4 — headings Q27–32 + summary word bank Q33–36 + YNNG Q37–40 */
export function ieltsReadingP3HeadingsSummaryYnngPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'This Marvellous Invention',
    passageSubtitle: 'Of all mankind\'s manifold creations, language must take pride of place',
    passage: [
      {
        label: 'A',
        text: 'Of all mankind\'s manifold creations, language must take pride of place. Other inventions — the wheel, agriculture, sliced bread — may have transformed our material existence, but the advent of language is what made us human. Compared to language, all other inventions pale in significance, since everything we have ever achieved depends on language and originates from it. Without language, we could never have embarked on our ascent to unparalleled power over all other animals, and even over nature itself.',
      },
      {
        label: 'B',
        text: 'But language is foremost not just because it came first. In its own right it is a tool of extraordinary sophistication, yet based on an idea of ingenious simplicity: "this marvellous invention of composing out of twenty-five or thirty sounds that infinite variety of expressions which, whilst having in themselves no likeness to what is in our mind, allow us to disclose to others its whole secret, and to make known to those who cannot penetrate it all that we imagine, and all the various stirrings of our soul". This was how, in 1660, the renowned French grammarians of the Port-Royal abbey near Versailles distilled the essence of language, and no one since has celebrated more eloquently the magnitude of its achievement. Even so, there is just one flaw in all these hymns of praise, for the homage to language\'s unique accomplishment conceals a simple yet critical incongruity. Language is mankind\'s greatest invention — except, of course, that it was never invented. This apparent paradox is at the core of our fascination with language, and it holds many of its secrets.',
      },
      {
        label: 'C',
        text: 'Language often seems so skillfully drafted that one can hardly imagine it as anything other than the perfected handiwork of a master craftsman. How else could this instrument make so much out of barely three dozen measly morsels of sound? In themselves, these configurations of mouth — p, f, b, v, t, d, k, g, sh, a, e and so on — amount to nothing more than a few haphazard spits and splutters, random noises with no meaning, no ability to express, no power to explain. But run them through the cogs and wheels of the language machine, let it arrange them in some very special orders, and there is nothing that these meaningless streams of air cannot do: from sighing the interminable boredom of existence to unravelling the fundamental order of the universe.',
      },
      {
        label: 'D',
        text: 'The most extraordinary thing about language, however, is that one doesn\'t have to be a genius to set its wheels in motion. The language machine allows just about everybody — from pre-modern foragers in the subtropical savannah, to post-modern philosophers in the suburban sprawl — to tie these meaningless sounds together into an infinite variety of subtle senses, and all apparently without the slightest exertion. Yet it is precisely this deceptive ease which makes language a victim of its own success, since in everyday life its triumphs are usually taken for granted, the wheels of language run so smoothly that one rarely bothers to stop and think about all the resourcefulness and expertise that must have gone into making it tick. Language conceals art.',
      },
      {
        label: 'E',
        text: 'Often, it is only the estrangement of foreign tongues, with their many exotic and outlandish features, that brings home the wonder of language\'s design. One of the showiest stunts that some languages can pull off is an ability to build up words of breath-breaking length, and thus express in one word what English takes a whole sentence to say. The Turkish word şehirlileştirilemeyebileceklerimizdenmişsinizcesine, to take one example, means nothing less than "you are one of those whom we can\'t turn into a town-dweller". (In case you were wondering, this monstrosity really is one word, not merely many different words squashed together — most of its components cannot even stand up on their own.)',
      },
      {
        label: 'F',
        text: 'And if that sounds like some one-off freak, then consider Sumerian, the language spoken on the banks of the Euphrates some 5,000 years ago by the people who invented writing and thus enabled the documentation of history. A Sumerian word like mu-ni-ub-lu-mi ("when he had made it suitable for her") might seem rather trim compared to the Turkish colossus above. What is so impressive about it, however, is not its lengthiness but rather the reverse — the thrifty compactness of its construction. The word is made up of different slots, each corresponding to a particular portion of meaning. This sleek design allows single sounds to convey useful information, and in fact even the absence of a sound has been enlisted to express something specific. If you were to ask which bit in the Sumerian word corresponds to the pronoun "it" in the English translation "when he had made it suitable for her", then the answer would have to be nothing. Mind you, a very particular kind of nothing: the nothing that stands in the empty slot in the middle. The technology is so fine-tuned then that even a non-sound, when carefully placed in a particular position, has been invested with a specific function. Who could possibly have come up with such a nifty contraption?',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–32',
        instruction: 'Reading Passage 3 has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings below.',
        note: 'There are more headings than paragraphs, so you will not use all of them.',
        type: 'matching-headings',
        headings: CAM11_T4_LANGUAGE_HEADINGS,
        questions: [
          { number: 27, type: 'matching-headings', prompt: 'Paragraph A', options: [], answer: 'vi', explanation: 'Language must take pride of place — most important invention.' },
          { number: 28, type: 'matching-headings', prompt: 'Paragraph B', options: [], answer: 'iv', explanation: 'Paradox: greatest invention yet never invented.' },
          { number: 29, type: 'matching-headings', prompt: 'Paragraph C', options: [], answer: 'ii', explanation: 'Few sounds organised to convey huge range of meaning.' },
          { number: 30, type: 'matching-headings', prompt: 'Paragraph D', options: [], answer: 'vii', explanation: 'Everybody can use language without being a genius.' },
          { number: 31, type: 'matching-headings', prompt: 'Paragraph E', options: [], answer: 'i', explanation: 'Foreign tongues highlight impressiveness of language design.' },
          { number: 32, type: 'matching-headings', prompt: 'Paragraph F', options: [], answer: 'v', explanation: 'Absence of a sound (silence) can be meaningful.' },
        ],
      },
      {
        range: 'Questions 33–36',
        instruction: 'Complete the summary using the list of words, A–G, below.',
        type: 'summary-completion',
        note: CAM11_T4_LANGUAGE_SUMMARY_NOTE,
        wordBank: CAM11_T4_LANGUAGE_WORD_BANK,
        questions: [
          { number: 33, type: 'summary-completion', prompt: 'Gap (33)', options: [], answer: 'e', explanation: 'Wheel transformed material existence.' },
          { number: 34, type: 'summary-completion', prompt: 'Gap (34)', options: [], answer: 'g', explanation: 'Language impact is fundamental — everything depends on it.' },
          { number: 35, type: 'summary-completion', prompt: 'Gap (35)', options: [], answer: 'b', explanation: 'Tool of extraordinary sophistication / complexity.' },
          { number: 36, type: 'summary-completion', prompt: 'Gap (36)', options: [], answer: 'f', explanation: 'Language appears easy to use without exertion.' },
        ],
      },
      {
        range: 'Questions 37–40',
        instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? In boxes 37–40 on your answer sheet, write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        type: 'ynng',
        questions: [
          {
            number: 37,
            type: 'yes-no-not-given',
            prompt: 'Human beings might have achieved their present position without language.',
            options: YNNG_OPTIONS,
            answer: 'no',
            explanation: 'Without language we could never have embarked on our ascent.',
          },
          {
            number: 38,
            type: 'yes-no-not-given',
            prompt: 'The Port-Royal grammarians did justice to the nature of language.',
            options: YNNG_OPTIONS,
            answer: 'yes',
            explanation: 'No one since has celebrated more eloquently the magnitude of its achievement.',
          },
          {
            number: 39,
            type: 'yes-no-not-given',
            prompt: 'A complex idea can be explained more clearly in a sentence than in a single word.',
            options: YNNG_OPTIONS,
            answer: 'not-given',
            explanation: 'Passage không so sánh độ rõ ràng giữa câu và một từ.',
          },
          {
            number: 40,
            type: 'yes-no-not-given',
            prompt: 'The Sumerians were responsible for starting the recording of events.',
            options: YNNG_OPTIONS,
            answer: 'yes',
            explanation: 'People who invented writing and enabled documentation of history.',
          },
        ],
      },
    ],
  }
}

const CAM12_T5_KNOWLEDGE_HEADINGS = [
  { id: 'i', label: 'Courses that require a high level of commitment' },
  { id: 'ii', label: 'A course title with two meanings' },
  { id: 'iii', label: 'The equal importance of two key issues' },
  { id: 'iv', label: 'Applying a theory in an unexpected context' },
  { id: 'v', label: 'The financial benefits of studying' },
  { id: 'vi', label: 'A surprising course title' },
  { id: 'vii', label: 'Different names for different outcomes' },
  { id: 'viii', label: 'The possibility of attracting the wrong kind of student' },
]

const CAM12_T5_ARSON_SUMMARY_NOTE = [
  'The \'Arson for Profit\' course',
  '',
  'This is a university course intended for students who are undergraduates and who are studying 33________. '
  + 'The expectation is that they will become 34________ specialising in arson. The course will help them to detect '
  + 'cases of arson and find 35________ of criminal intent, leading to successful 36________ in the courts.',
].join('\n')

/** Cam12 T5 — headings Q27–32 + summary TWO WORDS Q33–36 + YNNG Q37–40 */
export function ieltsReadingP3HeadingsGapYnngPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'What\'s the purpose of gaining knowledge?',
    passageSubtitle: 'Any person can find instruction in any subject — but what would the founders think of a course called \'Arson for Profit\'?',
    passage: [
      {
        label: 'A',
        text: '\'I would found an institution where any person can find instruction in any subject.\' That was the founder\'s motto for Cornell University, and it seems an apt characterization of the different university, also in the USA, where I currently teach philosophy. A student can prepare for a career in resort management, engineering, interior design, accounting, music, law enforcement, you name it. But what would the founders of these two institutions have thought of a course called \'Arson for Profit\'? I kid you not: we have it on the books. Any undergraduates who have met the academic requirements can sign up for the course in our program in \'fire science\'.',
      },
      {
        label: 'B',
        text: 'Naturally, the course is intended for prospective arson investigators, who can learn all the tricks of the trade for detecting whether a fire was deliberately set, discovering who did it, and establishing a chain of evidence for effective prosecution in a court of law. But wouldn\'t this also be the perfect course for prospective arsonists to sign up for? My point is not to criticize academic programs in fire science: they are highly welcome as part of the increasing professionalization of this and many other occupations. However, it\'s not unknown for a firefighter to torch a building. This example suggests how dishonest and illegal behavior, with the help of higher education, can creep into every aspect of public and business life.',
      },
      {
        label: 'C',
        text: 'I realized this anew when I was invited to speak before a class in marketing, which is another of our degree programs. The regular instructor is a colleague who appreciates the kind of ethical perspective I can bring as a philosopher. There are endless ways I could have approached this assignment, but I took my cue from the title of the course: \'Principles of Marketing\'. It made me think to ask the students, \'Is marketing principled?\' After all, a subject matter can have principles in the sense of being codified, having rules, as with football or chess, without being principled in the sense of being ethical. Many of the students immediately assumed that the answer to my question about marketing principles was obvious: no. Just look at the ways in which everything under the sun has been marketed; obviously, it need not be done in a principled (= ethical) fashion.',
      },
      {
        label: 'D',
        text: 'Is that obvious? I made the suggestion, which may sound downright crazy in light of the evidence, that perhaps marketing is by definition principled. My inspiration for this judgement is the philosopher Immanuel Kant, who argued that any body of knowledge consists of an end (or purpose) and a means.',
      },
      {
        label: 'E',
        text: 'Let us apply both the terms \'means\' and \'end\' to marketing. The students have signed up for a course in order to learn how to market effectively. But to what end? There seem to be two main attitudes toward that question. One is that the answer is obvious: the purpose of marketing is to sell things and to make money. The other attitude is that the purpose of marketing is irrelevant: each person comes to the program and course with his or her own plans, and these need not even concern the acquisition of marketing expertise as such. My proposal, which I believe would also be Kant\'s, is that neither of these attitudes captures the significance of the end to the means for marketing. A field of knowledge or a professional endeavor is defined by both the means and the end; hence both deserve scrutiny. Students need to study both how to achieve X, and also what X is.',
      },
      {
        label: 'F',
        text: 'It is at this point that \'Arson for Profit\' becomes supremely relevant. That course is presumably all about means: how to detect and prosecute criminal activity. It is therefore assumed that the end is good in an ethical sense. When I ask fire science students to articulate the end, or purpose, of their field, they eventually generalize to something like, \'The safety and welfare of society,\' which seems right. As we have seen, someone could use the very same knowledge of means to achieve a much less noble end, such as personal profit via destructive, dangerous, reckless activity. But we would not call that firefighting. We have a separate word for it: arson. Similarly, if you employed the \'principles of marketing\' in an unprincipled way, you would not be doing marketing. We have another term for it: fraud. Kant gives the example of a doctor and a poisoner, who use the identical knowledge to achieve their divergent ends. We would say that one is practicing medicine, the other, murder.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–32',
        instruction: 'Reading Passage 3 has six sections, A–F. Choose the correct heading for each section from the list of headings below.',
        note: 'There are more headings than sections, so you will not use all of them.',
        type: 'matching-headings',
        headings: CAM12_T5_KNOWLEDGE_HEADINGS,
        questions: [
          { number: 27, type: 'matching-headings', prompt: 'Section A', options: [], answer: 'vi', explanation: 'Surprising course title \'Arson for Profit\' — I kid you not.' },
          { number: 28, type: 'matching-headings', prompt: 'Section B', options: [], answer: 'viii', explanation: 'Perfect course for prospective arsonists — wrong kind of student.' },
          { number: 29, type: 'matching-headings', prompt: 'Section C', options: [], answer: 'ii', explanation: 'Principles of Marketing — two meanings of principled.' },
          { number: 30, type: 'matching-headings', prompt: 'Section D', options: [], answer: 'iv', explanation: 'Kant theory applied to marketing — unexpected context.' },
          { number: 31, type: 'matching-headings', prompt: 'Section E', options: [], answer: 'iii', explanation: 'Means and end both deserve scrutiny — equally important.' },
          { number: 32, type: 'matching-headings', prompt: 'Section F', options: [], answer: 'vii', explanation: 'Doctor vs poisoner — different names for different outcomes.' },
        ],
      },
      {
        range: 'Questions 33–36',
        instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        note: CAM12_T5_ARSON_SUMMARY_NOTE,
        questions: gapQuestions(33, [
          { prompt: 'Gap (33)', answer: 'fire science', explanation: 'Undergraduates sign up for program in fire science.' },
          { prompt: 'Gap (34)', answer: 'investigators', explanation: 'Intended for prospective arson investigators.' },
          { prompt: 'Gap (35)', answer: 'evidence', explanation: 'Establishing a chain of evidence for prosecution.' },
          { prompt: 'Gap (36)', answer: 'prosecution', explanation: 'Effective prosecution in a court of law.' },
        ]),
      },
      {
        range: 'Questions 37–40',
        instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? In boxes 37–40 on your answer sheet, write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        type: 'ynng',
        questions: [
          {
            number: 37,
            type: 'yes-no-not-given',
            prompt: 'It is difficult to attract students onto courses that do not focus on a career.',
            options: YNNG_OPTIONS,
            answer: 'not-given',
            explanation: 'Passage không nói khó thu hút sinh viên vào khóa không hướng nghiệp.',
          },
          {
            number: 38,
            type: 'yes-no-not-given',
            prompt: 'The \'Arson for Profit\' course would be useful for people intending to set fire to buildings.',
            options: YNNG_OPTIONS,
            answer: 'yes',
            explanation: 'Writer: perfect course for prospective arsonists — same knowledge of means.',
          },
          {
            number: 39,
            type: 'yes-no-not-given',
            prompt: 'Fire science courses are too academic to help people to be good at the job of firefighting.',
            options: YNNG_OPTIONS,
            answer: 'no',
            explanation: 'Writer welcomes professionalization — không phê phán programs in fire science.',
          },
          {
            number: 40,
            type: 'yes-no-not-given',
            prompt: 'The writer\'s fire science students provided a detailed definition of the purpose of their studies.',
            options: YNNG_OPTIONS,
            answer: 'no',
            explanation: 'Students eventually generalize to safety/welfare — không phải detailed definition writer yêu cầu.',
          },
        ],
      },
    ],
  }
}

/** Cam12 T2 — bảng bilingualism Q27–31 */
export const CAM12_T2_BILINGUAL_TABLE: ReadingNoteTable = {
  headers: ['Test', 'Findings'],
  gapNumbers: [27, 28, 29, 30, 31],
  rows: [
    {
      cells: [
        [
          { type: 'static', text: 'Observing the ' },
          { type: 'gap', number: 27 },
          { type: 'static', text: ' of Russian-English bilingual people when asked to select certain objects' },
        ],
        [
          { type: 'static', text: 'Bilingual people engage both languages simultaneously: a mechanism known as ' },
          { type: 'gap', number: 28 },
        ],
      ],
    },
    {
      cells: [
        [
          { type: 'static', text: 'A test called the ' },
          { type: 'gap', number: 29 },
          { type: 'static', text: ', focusing on naming colours' },
        ],
        [
          { type: 'static', text: 'Bilingual people are more able to handle tasks involving a skill called ' },
          { type: 'gap', number: 30 },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'A test involving switching between tasks' }],
        [
          { type: 'static', text: 'When changing strategies, bilingual people have superior ' },
          { type: 'gap', number: 31 },
        ],
      ],
    },
  ],
}

/** Cam12 T2 — table Q27–31 + YNNG Q32–36 + match đoạn Q37–40 */
export function ieltsReadingP3TableYnngMatchPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'The Benefits of Being Bilingual',
    passageSubtitle: 'According to the latest figures, the majority of the world\'s population is now bilingual or multilingual.',
    passage: [
      {
        label: 'A',
        text: 'According to the latest figures, the majority of the world\'s population is now bilingual or multilingual, having grown up speaking two or more languages. In the past, such children were considered to be at a disadvantage compared with their monolingual peers. Over the past few decades, however, technological advances have allowed researchers to look more deeply at how bilingualism interacts with and changes the cognitive and neurological systems, thereby identifying several clear benefits of being bilingual.',
      },
      {
        label: 'B',
        text: 'Research shows that when a bilingual person uses one language, the other is active at the same time. When we hear a word, we don\'t hear the entire word all at once: the sounds arrive in sequential order. Long before the word is finished, the brain\'s language system begins to guess what that word might be. If you hear \'can\', you will likely activate words like \'candy\' and \'candle\' as well, at least during the earlier stages of word recognition. For bilingual people, this activation is not limited to a single language; auditory input activates corresponding words regardless of the language to which they belong. Some of the most compelling evidence for this phenomenon, called \'language co-activation\', comes from studying eye movements. A Russian-English bilingual asked to \'pick up a marker\' from a set of objects would look more at a stamp than someone who doesn\'t know Russian, because the Russian word for \'stamp\', marka, sounds like the English word he or she heard, \'marker\'. In cases like this, language co-activation occurs because what the listener hears could map onto words in either language.',
      },
      {
        label: 'C',
        text: 'Having to deal with this persistent linguistic competition can result in difficulties, however. For instance, knowing more than one language can cause speakers to name pictures more slowly, and can increase \'tip-of-the-tongue states\', when you can almost, but not quite, bring a word to mind. As a result, the constant juggling of two languages creates a need to control how much a person accesses a language at any given time. For this reason, bilingual people often perform better on tasks that require conflict management. In the classic Stroop Task, people see a word and are asked to name the colour of the word\'s font. When the colour and the word match (i.e., the word \'red\' printed in red), people correctly name the colour more quickly than when the colour and the word don\'t match (i.e., the word \'red\' printed in blue). This occurs because the word itself (\'red\') and its font colour (blue) conflict. Bilingual people often excel at tasks such as this, which tap into the ability to ignore competing perceptual information and focus on the relevant aspects of the input. Bilinguals are also better at switching between two tasks; for example, when bilinguals have to switch from categorizing objects by colour (red or green) to categorizing them by shape (circle or triangle), they do so more quickly than monolingual people, reflecting better cognitive control when having to make rapid changes of strategy.',
      },
      {
        label: 'D',
        text: 'It also seems that the neurological roots of the bilingual advantage extend to brain areas more traditionally associated with sensory processing. When monolingual and bilingual adolescents listen to simple speech sounds without any intervening background noise, they show highly similar brain stem responses. When researchers play the same sound to both groups in the presence of background noise, however, the bilingual listeners\' neural response is considerably larger, reflecting better encoding of the sound\'s fundamental frequency, a feature of sound closely related to pitch perception.',
      },
      {
        label: 'E',
        text: 'Such improvements in cognitive and sensory processing may help a bilingual person to process information in the environment, and help explain why bilingual adults acquire a third language better than monolingual adults master a second language. This advantage may be rooted in the skill of focussing on information about the new language while reducing interference from the languages they already know.',
      },
      {
        label: 'F',
        text: 'Research also indicates that bilingual experience may help to keep the cognitive mechanisms sharp by recruiting alternate brain networks to compensate for those that become damaged during aging. Older bilinguals enjoy improved memory relative to monolingual people, which can lead to real-world health benefits. In a study of over 200 patients with Alzheimer\'s disease, a degenerative brain disease, bilingual patients reported showing initial symptoms of the disease an average of five years later than monolingual patients. In a follow-up study, researchers compared the brains of bilingual and monolingual patients matched on the severity of Alzheimer\'s symptoms. Surprisingly, the bilinguals\' brains had more physical signs of disease than their monolingual counterparts, even though their outward behaviour and abilities were the same. If the brain is an engine, bilingualism may help it to go farther on the same amount of fuel.',
      },
      {
        label: 'G',
        text: 'Furthermore, the benefits associated with bilingual experience seem to start very early. In one study, researchers taught seven-month-old babies growing up in monolingual or bilingual homes that when they heard a tinkling sound, a puppet appeared on one side of a screen. Halfway through the study, the puppet began appearing on the opposite side of the screen. In order to get a reward, the infants had to adjust the rule they\'d learned; only the bilingual babies were able to successfully learn the new rule. This suggests that for very young children, as well as for older people, navigating a multilingual environment imparts advantages that transfer far beyond language.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–31',
        instruction: 'Complete the table below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        noteTable: CAM12_T2_BILINGUAL_TABLE,
        questions: gapQuestions(27, [
          { prompt: 'Gap (27)', answer: 'eye movements', explanation: 'Evidence from studying eye movements — Russian-English marker/stamp.' },
          { prompt: 'Gap (28)', answer: 'language co-activation', explanation: 'Phenomenon called language co-activation.' },
          { prompt: 'Gap (29)', answer: 'Stroop Task', explanation: 'Classic Stroop Task — naming colour of word font.' },
          { prompt: 'Gap (30)', answer: 'conflict management', explanation: 'Tasks requiring conflict management.' },
          { prompt: 'Gap (31)', answer: 'cognitive control', explanation: 'Better cognitive control when switching strategies.' },
        ]),
      },
      {
        range: 'Questions 32–36',
        instruction: 'Do the following statements agree with the claims of the writer in Reading Passage 3? In boxes 32–36 on your answer sheet, write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        type: 'ynng',
        questions: [
          {
            number: 32,
            type: 'yes-no-not-given',
            prompt: 'Attitudes towards bilingualism have changed in recent years.',
            options: YNNG_OPTIONS,
            answer: 'yes',
            explanation: 'Past: disadvantage; now researchers identify clear benefits — thái độ đã đổi.',
          },
          {
            number: 33,
            type: 'yes-no-not-given',
            prompt: 'Bilingual people are better than monolingual people at guessing correctly what words are before they are finished.',
            options: YNNG_OPTIONS,
            answer: 'not-given',
            explanation: 'Passage nói brain guesses words nhưng không so sánh bilingual vs monolingual ở kỹ năng này.',
          },
          {
            number: 34,
            type: 'yes-no-not-given',
            prompt: 'Bilingual people consistently name images faster than monolingual people.',
            options: YNNG_OPTIONS,
            answer: 'no',
            explanation: 'Knowing more languages can cause speakers to name pictures more slowly.',
          },
          {
            number: 35,
            type: 'yes-no-not-given',
            prompt: 'Bilingual people\'s brains process single sounds more efficiently than monolingual people in all situations.',
            options: YNNG_OPTIONS,
            answer: 'no',
            explanation: 'Without background noise responses highly similar — chỉ tốt hơn khi có noise.',
          },
          {
            number: 36,
            type: 'yes-no-not-given',
            prompt: 'Fewer bilingual people than monolingual people suffer from brain disease in old age.',
            options: YNNG_OPTIONS,
            answer: 'not-given',
            explanation: 'Bilinguals report symptoms later nhưng không nói ít người mắc bệnh hơn.',
          },
        ],
      },
      {
        range: 'Questions 37–40',
        instruction: 'Reading Passage 3 has seven paragraphs, A–G. Which paragraph contains the following information?',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        questions: [
          {
            number: 37,
            type: 'matching-paragraph',
            prompt: 'an example of how bilingual and monolingual people\'s brains respond differently to a certain type of non-verbal auditory input',
            options: [],
            answer: 'd',
            explanation: 'Đoạn D — brain stem responses khác khi có background noise.',
          },
          {
            number: 38,
            type: 'matching-paragraph',
            prompt: 'a demonstration of how a bilingual upbringing has benefits even before we learn to speak',
            options: [],
            answer: 'g',
            explanation: 'Đoạn G — seven-month-old bilingual babies learned new rule.',
          },
          {
            number: 39,
            type: 'matching-paragraph',
            prompt: 'a description of the process by which people identify words that they hear',
            options: [],
            answer: 'b',
            explanation: 'Đoạn B — sounds arrive sequentially, brain guesses word.',
          },
          {
            number: 40,
            type: 'matching-paragraph',
            prompt: 'reference to some negative consequences of being bilingual',
            options: [],
            answer: 'c',
            explanation: 'Đoạn C — name pictures more slowly, tip-of-the-tongue states.',
          },
        ],
      },
    ],
  }
}

const CAM12_T3_MONTREAL_SUMMARY_NOTE = [
  'The Montreal Study',
  '',
  'Participants who listened to their favourite music showed increased levels of '
  + '27________ in the brain — the same substance released when eating food. The substance was also released in two brain areas associated with feeling '
  + '28________. Researchers found neurons in the '
  + '29________ were especially active just before listeners\' favourite moments — the period called the '
  + '30________. Activity here links to expectation of reward stimuli such as '
  + '31________.',
].join('\n')

const CAM12_T3_MUSIC_ENDINGS_BANK = [
  { id: 'a', label: 'our response to music depends on our initial emotional state.' },
  { id: 'b', label: 'neuron activity decreases if outcomes become predictable.' },
  { id: 'c', label: 'emotive music can bring to mind actual pictures and events.' },
  { id: 'd', label: 'experiences in our past can influence our emotional reaction to music.' },
  { id: 'e', label: 'emotive music delays giving listeners what they expect to hear.' },
  { id: 'f', label: 'neuron activity increases prior to key points in a musical piece.' },
]

/** Cam12 T3 — summary Q27–31 + MC Q32–36 + sentence endings Q37–40 */
export function ieltsReadingP3SummaryMcEndingsPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'Music and the emotions',
    passageSubtitle: 'Neuroscientists are now looking at how the brain responds to music',
    passage: [
      {
        text: 'Music has been part of human culture for tens of thousands of years, yet we still know relatively little about the way it affects us. Over the past few decades, however, technological advances have allowed researchers to look more deeply at how music interacts with and changes the cognitive and neurological systems.',
      },
      {
        text: 'In one study, researchers at McGill University in Montreal used brain-imaging technology to examine what happens when people listen to music they enjoy. They found that favourite songs triggered the release of dopamine — a chemical also released when we eat food we like. Dopamine appeared in brain regions associated with pleasure and reward.',
      },
      {
        text: 'The team also observed heightened activity in the caudate nucleus just before listeners reached the most pleasurable moments in a piece — the sensation sometimes called a "chill". This anticipatory spike suggests the brain treats expected musical peaks much like other anticipated rewards.',
      },
      {
        text: 'Other research has shown that our emotional response to music can be shaped by earlier experiences and memories. Studies of patients with brain damage indicate that music can evoke vivid mental images and scenes, not merely abstract feelings.',
      },
      {
        text: 'Leonard Meyer argued that composers such as Beethoven delay resolving harmonic tension to heighten emotional impact. Listeners expect a particular chord or phrase; when it is postponed, the eventual resolution feels more powerful. This supports the idea that expectation is central to musical emotion.',
      },
      {
        text: 'Earlier theories sometimes treated music as a simple stimulus–response phenomenon, or compared it directly to language processing. Modern neuroscience suggests such models were incomplete because they failed to account for anticipation, memory, and individual differences among listeners.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–31',
        instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        note: CAM12_T3_MONTREAL_SUMMARY_NOTE,
        questions: gapQuestions(27, [
          { prompt: 'Gap (27)', answer: 'dopamine', explanation: 'Favourite songs triggered dopamine release.' },
          { prompt: 'Gap (28)', answer: 'pleasure', explanation: 'Brain regions associated with pleasure and reward.' },
          { prompt: 'Gap (29)', answer: 'caudate', explanation: 'Heightened activity in the caudate nucleus.' },
          { prompt: 'Gap (30)', answer: 'chill', explanation: 'Sensation sometimes called a chill.' },
          { prompt: 'Gap (31)', answer: 'food', explanation: 'Reward stimuli such as food when eating.' },
        ]),
      },
      {
        range: 'Questions 32–36',
        instruction: 'Choose the correct answer.',
        type: 'multiple-choice',
        questions: [
          {
            number: 32,
            type: 'multiple-choice',
            prompt: 'What point does the writer emphasise in the first paragraph?',
            options: [
              { id: 'a', label: 'how dramatically our reactions to music can vary' },
              { id: 'b', label: 'how intense our physical responses to music can be' },
              { id: 'c', label: 'how little we know about the way that music affects us' },
              { id: 'd', label: 'how much music can tell us about how our brains operate' },
            ],
            answer: 'c',
            explanation: 'Đoạn 1 — we still know relatively little about how music affects us.',
          },
          {
            number: 33,
            type: 'multiple-choice',
            prompt: 'What did the Montreal study show about dopamine?',
            options: [
              { id: 'a', label: 'It is released when people listen to music they enjoy.' },
              { id: 'b', label: 'It is only released in one part of the brain.' },
              { id: 'c', label: 'It is released equally for all types of music.' },
              { id: 'd', label: 'It is not linked to feelings of pleasure.' },
            ],
            answer: 'a',
            explanation: 'Favourite songs triggered dopamine release.',
          },
          {
            number: 34,
            type: 'multiple-choice',
            prompt: 'The writer says that activity in the caudate nucleus',
            options: [
              { id: 'a', label: 'occurs only after the most pleasurable moment in a piece.' },
              { id: 'b', label: 'is strongest just before a listener\'s favourite moment.' },
              { id: 'c', label: 'is unrelated to musical expectation.' },
              { id: 'd', label: 'is the same for all listeners.' },
            ],
            answer: 'b',
            explanation: 'Heightened activity just before pleasurable moments / chill.',
          },
          {
            number: 35,
            type: 'multiple-choice',
            prompt: 'Research on patients with brain damage suggests that music',
            options: [
              { id: 'a', label: 'cannot affect emotions.' },
              { id: 'b', label: 'always produces the same images in listeners.' },
              { id: 'c', label: 'can evoke mental pictures as well as feelings.' },
              { id: 'd', label: 'is processed in the same way as language.' },
            ],
            answer: 'c',
            explanation: 'Music can evoke vivid mental images and scenes.',
          },
          {
            number: 36,
            type: 'multiple-choice',
            prompt: 'What does the writer say about earlier theories of music?',
            options: [
              { id: 'a', label: 'They were based on unreliable evidence.' },
              { id: 'b', label: 'They have been completely disproved.' },
              { id: 'c', label: 'They failed to take account of the listener\'s expectations.' },
              { id: 'd', label: 'They were influenced by research into language processing.' },
            ],
            answer: 'c',
            explanation: 'Models incomplete — failed to account for anticipation, memory, individual differences.',
          },
        ],
      },
      {
        range: 'Questions 37–40',
        instruction: 'Complete each sentence with the correct ending, A–F, below. Write the correct letter in boxes 37–40 on your answer sheet.',
        type: 'summary-completion',
        wordBank: CAM12_T3_MUSIC_ENDINGS_BANK,
        questions: [
          {
            number: 37,
            type: 'summary-completion',
            prompt: 'The Montreal researchers discovered that',
            options: [],
            answer: 'f',
            explanation: 'Neuron activity increases prior to key points / chill.',
          },
          {
            number: 38,
            type: 'summary-completion',
            prompt: 'Many studies have demonstrated that',
            options: [],
            answer: 'd',
            explanation: 'Past experiences influence emotional reaction to music.',
          },
          {
            number: 39,
            type: 'summary-completion',
            prompt: 'Meyer\'s analysis of Beethoven\'s music shows that',
            options: [],
            answer: 'e',
            explanation: 'Emotive music delays giving listeners what they expect.',
          },
          {
            number: 40,
            type: 'summary-completion',
            prompt: 'Earlier theories of music suggested that',
            options: [],
            answer: 'b',
            explanation: 'Predictable outcomes — neuron activity decreases when predictable.',
          },
        ],
      },
    ],
  }
}

/** YNNG Q27–32 + MC Q33–40 */
export function ieltsReadingP3YnngMcPart(): ReadingImportPartJson {
  const base = MOCK.parts[2]
  const ynngGroup = DEMO.parts[1].questionGroups[0]
  const mcGroup = base.questionGroups[1]

  const ynngQs = [
    ...ynngGroup.questions,
    {
      ...ynngGroup.questions[0],
      prompt: 'The writer is dismissive of all sleep research findings.',
      answer: 'no',
      explanation: 'Writer presents evidence while noting limitations.',
    },
  ]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 27–32',
        instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? Write YES, NO or NOT GIVEN.',
        type: 'ynng',
        questions: ynngQs.slice(0, 6).map((q, i) => ({
          number: 27 + i,
          type: 'yes-no-not-given' as const,
          prompt: q.prompt,
          options: YNNG_OPTIONS,
          answer: q.answer,
          explanation: q.explanation,
        })),
      },
      renumberGroup(mcGroup, 'Questions 33–40', 33, 8),
    ],
  }
}

const CAM14_T1_BIKE_AMSTERDAM_OPTS = [
  { id: 'a', label: 'It was initially opposed by a government department.' },
  { id: 'b', label: 'It failed when a partner in the scheme withdrew support.' },
  { id: 'c', label: 'It aimed to be more successful than the Copenhagen scheme.' },
  { id: 'd', label: 'It was made possible by a change in people\'s attitudes.' },
  { id: 'e', label: 'It attracted interest from a range of bike designers.' },
]

const CAM14_T1_BIKE_CITY_OPTS = [
  { id: 'a', label: 'The city has the most successful scheme in the world.' },
  { id: 'b', label: 'The scheme was copied from the one in Amsterdam.' },
  { id: 'c', label: 'The scheme has become a tourist attraction.' },
  { id: 'd', label: 'People can hire bikes more cheaply than in other places.' },
  { id: 'e', label: 'It has a reputation as a place that welcomes cyclists.' },
]

const CAM14_T1_BIKE_SUMMARY_NOTE = [
  'The first urban bike-sharing scheme',
  '',
  'The first bike-sharing scheme was the idea of the Dutch group Provo. The people who belonged to this group were 23________. '
  + 'They were concerned about damage to the environment and about 24________, and believed that the bike-sharing scheme would draw attention to these issues. '
  + 'As well as painting some bikes white, they handed out 25________ that condemned the use of cars.',
  '',
  'However, the scheme was not a great success: almost as quickly as Provo left the bikes around the city, the 26________ took them away. '
  + 'According to Schimmelpennink, the scheme was intended to be symbolic. The idea was to get people thinking about the issues.',
].join('\n')

const CAM_R2MS2_SUMMARY_NOTE = [
  'Community gardens in cities',
  '',
  'Many cities now support community gardens because they improve local 17________ and give residents fresh food. Plots are often allocated by 18________ so that waiting lists stay fair. Volunteers usually organise weekly 19________ to maintain paths and tools. Some projects also run short 20________ for school groups about plants and soil. When harvests are large, surplus produce may be donated to a local 21________. Researchers report that gardeners often feel a stronger sense of 22________ with their neighbourhood.',
].join('\n')

const CAM_R2MS2_CHOOSE_TWO_GARDEN = [
  { id: 'a', label: 'reduced noise from traffic' },
  { id: 'b', label: 'stronger social ties among neighbours' },
  { id: 'c', label: 'lower rents for nearby apartments' },
  { id: 'd', label: 'better access to fresh vegetables' },
  { id: 'e', label: 'free public transport for members' },
]

const CAM_R2MS2_CHOOSE_TWO_CHALLENGES = [
  { id: 'a', label: 'limited water supply in dry months' },
  { id: 'b', label: 'disputes over plot boundaries' },
  { id: 'c', label: 'theft of tools and produce' },
  { id: 'd', label: 'rules that ban all children' },
  { id: 'e', label: 'pressure from developers for the land' },
]

/**
 * r2ms2 — Match đoạn Q14–16 + Summary ONE WORD Q17–22 + Choose TWO Q23–24 + Choose TWO Q25–26
 */
export function ieltsReadingP2MatchSummaryChooseTwoPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'Community gardens in cities',
    passageSubtitle: 'How shared growing spaces reshape urban life',
    passage: [
      {
        label: 'A',
        text: 'Community gardens have expanded in many cities as a response to dense housing and limited private outdoor space. Advocates argue that shared plots improve local diets and give residents fresh food. When harvests are large, surplus produce may be donated to a local charity.',
      },
      {
        label: 'B',
        text: 'Allocation systems matter. Plots are often allocated by lottery so that waiting lists stay fair. Some sites keep a shortlist for newcomers, while long-term gardeners mentor first-time growers.',
      },
      {
        label: 'C',
        text: 'Volunteers usually organise weekly workdays to maintain paths and tools. Some projects also run short workshops for school groups about plants and soil. Researchers report that gardeners often feel a stronger sense of belonging with their neighbourhood.',
      },
      {
        label: 'D',
        text: 'Benefits go beyond food. Stronger social ties among neighbours and better access to fresh vegetables are frequently mentioned. Challenges include limited water supply in dry months, theft of tools and produce, and pressure from developers for the land.',
      },
      {
        label: 'E',
        text: 'City councils sometimes protect gardens through temporary leases. Campaigns for permanent status argue that green space improves wellbeing even for people who only walk past the site.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–16',
        instruction: 'Reading Passage 2 has sections A–E. Which section contains the following information? Write the correct letter, A–E, in boxes 14–16 on your answer sheet.',
        note: 'NB You may use any letter more than once.',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E'],
        questions: [
          {
            number: 14,
            type: 'matching-paragraph',
            prompt: 'how new gardeners may get a plot fairly',
            options: [],
            answer: 'b',
            explanation: 'B — allocated by lottery.',
          },
          {
            number: 15,
            type: 'matching-paragraph',
            prompt: 'mention of donating surplus food',
            options: [],
            answer: 'a',
            explanation: 'A — surplus donated to a local charity.',
          },
          {
            number: 16,
            type: 'matching-paragraph',
            prompt: 'examples of problems gardens may face',
            options: [],
            answer: 'd',
            explanation: 'D — water, theft, developers.',
          },
        ],
      },
      {
        range: 'Questions 17–22',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        note: CAM_R2MS2_SUMMARY_NOTE,
        questions: gapQuestions(17, [
          { prompt: 'Gap (17)', answer: 'diets', explanation: 'improve local diets.' },
          { prompt: 'Gap (18)', answer: 'lottery', explanation: 'allocated by lottery.' },
          { prompt: 'Gap (19)', answer: 'workdays', explanation: 'weekly workdays.' },
          { prompt: 'Gap (20)', answer: 'workshops', explanation: 'short workshops for school groups.' },
          { prompt: 'Gap (21)', answer: 'charity', explanation: 'donated to a local charity.' },
          { prompt: 'Gap (22)', answer: 'belonging', explanation: 'stronger sense of belonging.' },
        ]),
      },
      {
        range: 'Questions 23–24',
        instruction: 'Choose TWO correct answers, A–E.',
        type: 'multiple-choice',
        questions: [
          {
            number: 23,
            type: 'multiple-choice',
            prompt: 'Which TWO benefits of community gardens are mentioned in the passage? (first answer)',
            options: [...CAM_R2MS2_CHOOSE_TWO_GARDEN],
            answer: 'b',
            explanation: 'B — stronger social ties among neighbours.',
          },
          {
            number: 24,
            type: 'multiple-choice',
            prompt: 'Which TWO benefits of community gardens are mentioned in the passage? (second answer)',
            options: [...CAM_R2MS2_CHOOSE_TWO_GARDEN],
            answer: 'd',
            explanation: 'D — better access to fresh vegetables.',
          },
        ],
      },
      {
        range: 'Questions 25–26',
        instruction: 'Choose TWO correct answers, A–E.',
        type: 'multiple-choice',
        questions: [
          {
            number: 25,
            type: 'multiple-choice',
            prompt: 'Which TWO challenges facing community gardens are mentioned in the passage? (first answer)',
            options: [...CAM_R2MS2_CHOOSE_TWO_CHALLENGES],
            answer: 'a',
            explanation: 'A — limited water supply in dry months.',
          },
          {
            number: 26,
            type: 'multiple-choice',
            prompt: 'Which TWO challenges facing community gardens are mentioned in the passage? (second answer)',
            options: [...CAM_R2MS2_CHOOSE_TWO_CHALLENGES],
            answer: 'e',
            explanation: 'E — pressure from developers for the land.',
          },
        ],
      },
    ],
  }
}

const CAM_CORAL_REEFS_HEADINGS = [
  { id: 'i', label: 'Tried and tested solutions' },
  { id: 'ii', label: 'Cooperation beneath the waves' },
  { id: 'iii', label: 'Working to lessen the problems' },
  { id: 'iv', label: 'Disagreement about the accuracy of a certain phrase' },
  { id: 'v', label: 'Two clear educational goals' },
  { id: 'vi', label: 'Promoting hope' },
  { id: 'vii', label: 'A warning of further trouble ahead' },
]

const CAM_CORAL_DAMAGE_CHOOSE_TWO = [
  { id: 'a', label: 'a rising number of extreme storms' },
  { id: 'b', label: 'the removal of too many fish from the sea' },
  { id: 'c', label: 'the contamination of the sea from waste' },
  { id: 'd', label: 'increased disease among marine species' },
  { id: 'e', label: 'alterations in the usual flow of water in the seas' },
]

const CAM_CORAL_ZOO_CHOOSE_TWO = [
  { id: 'a', label: 'They are hoping to expand the numbers of different corals being bred in laboratories' },
  { id: 'b', label: 'They want to identify corals that can cope well with the changed sea conditions.' },
  { id: 'c', label: 'They are looking at ways of creating artificial reefs that corals could grow on.' },
  { id: 'd', label: 'They are trying out methods that would speed up reproduction in some corals.' },
  { id: 'e', label: 'They are investigating materials that might protect reefs from higher temperatures.' },
]

export const CAM_CORAL_REEFS_NOTE_PASSAGE: ReadingNotePassageBlock[] = [
  { type: 'static', text: '• Corals have a number of ' },
  { type: 'gap', number: 24 },
  { type: 'static', text: ' which they use to collect their food.' },
  { type: 'static', text: '• Algae gain ' },
  { type: 'gap', number: 25 },
  { type: 'static', text: ' from being inside the coral.' },
  { type: 'static', text: '• Increases in the warmth of the sea water can remove the ' },
  { type: 'gap', number: 26 },
  { type: 'static', text: ' from corals.' },
]

/**
 * r2h2n — Headings Q14–19 + Choose TWO Q20–21 + Choose TWO Q22–23 + Notes Q24–26
 * Preview: Teamplate_Part2_20.jpg (coral reefs / London Zoo researchers)
 */
export function ieltsReadingP2HeadingsChooseTwoNotesPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'Saving coral reefs',
    passageSubtitle: 'Science, education and hope for threatened reefs',
    passage: [
      {
        label: 'A',
        text: 'Coral reefs are often described as the rainforests of the sea, but some scientists dispute how accurate that phrase is: reefs and forests differ in scale, species counts and the way energy moves through food webs. The disagreement about the accuracy of a certain phrase has not stopped the public from using it, yet researchers prefer more precise comparisons when writing for journals.',
      },
      {
        label: 'B',
        text: 'Beneath the waves, corals and algae form a striking partnership. Corals have a number of tentacles which they use to collect their food. Tiny algae living inside coral tissue gain protection from being inside the coral, while the coral benefits from sugars the algae produce. This cooperation beneath the waves is central to reef life, but increases in the warmth of the sea water can remove the algae from corals, leaving pale, stressed colonies.',
      },
      {
        label: 'C',
        text: 'Human pressure multiplies natural stress. The removal of too many fish from the sea weakens reef ecosystems, and alterations in the usual flow of water in the seas — from coastal engineering or climate-driven currents — can starve corals of nutrients or bury them in sediment. Pollution and overfishing interact with warming in complex ways.',
      },
      {
        label: 'D',
        text: 'Aquariums and universities are working to lessen the problems. At London Zoo, researchers want to identify corals that can cope well with the changed sea conditions. They are also trying out methods that would speed up reproduction in some corals so that resilient strains can be raised more quickly. Other teams elsewhere study artificial structures, but the London Zoo focus remains on breeding and selection under controlled conditions.',
      },
      {
        label: 'E',
        text: 'Public programmes often pursue two clear educational goals: teaching visitors how reefs work, and showing practical steps people can take to reduce damage. Exhibits link everyday choices — sunscreen, seafood, plastic waste — to distant ecosystems.',
      },
      {
        label: 'F',
        text: 'Campaigns emphasise promoting hope rather than only listing disasters. Successful small-scale restorations and community patrols are presented as tried and tested solutions that communities can adapt. At the same time, models offer a warning of further trouble ahead if ocean temperatures keep rising without deeper cuts in emissions.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–19',
        instruction: 'Reading Passage 2 has paragraphs A–F. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–vii, in boxes 14–19 on your answer sheet.',
        note: 'There are more headings than paragraphs, so you will not use all of them.',
        type: 'matching-headings',
        headings: CAM_CORAL_REEFS_HEADINGS,
        questions: [
          { number: 14, type: 'matching-headings', prompt: 'Paragraph A', options: [], answer: 'iv', explanation: 'Disagreement about the accuracy of a certain phrase (rainforests of the sea).' },
          { number: 15, type: 'matching-headings', prompt: 'Paragraph B', options: [], answer: 'ii', explanation: 'Cooperation beneath the waves (coral–algae partnership).' },
          { number: 16, type: 'matching-headings', prompt: 'Paragraph C', options: [], answer: 'vii', explanation: 'Warning of further trouble / human pressure and warming.' },
          { number: 17, type: 'matching-headings', prompt: 'Paragraph D', options: [], answer: 'iii', explanation: 'Working to lessen the problems (London Zoo research).' },
          { number: 18, type: 'matching-headings', prompt: 'Paragraph E', options: [], answer: 'v', explanation: 'Two clear educational goals.' },
          { number: 19, type: 'matching-headings', prompt: 'Paragraph F', options: [], answer: 'vi', explanation: 'Promoting hope (also tried solutions / warning ahead appear).' },
        ],
      },
      {
        range: 'Questions 20–21',
        instruction: 'Choose TWO correct answers, A–E.',
        type: 'multiple-choice',
        questions: [
          {
            number: 20,
            type: 'multiple-choice',
            prompt: 'Which TWO of these causes of damage to coral reefs are mentioned by the writer of the text? (first answer)',
            options: [...CAM_CORAL_DAMAGE_CHOOSE_TWO],
            answer: 'b',
            explanation: 'B — removal of too many fish from the sea.',
          },
          {
            number: 21,
            type: 'multiple-choice',
            prompt: 'Which TWO of these causes of damage to coral reefs are mentioned by the writer of the text? (second answer)',
            options: [...CAM_CORAL_DAMAGE_CHOOSE_TWO],
            answer: 'e',
            explanation: 'E — alterations in the usual flow of water in the seas.',
          },
        ],
      },
      {
        range: 'Questions 22–23',
        instruction: 'Choose TWO correct answers, A–E.',
        type: 'multiple-choice',
        questions: [
          {
            number: 22,
            type: 'multiple-choice',
            prompt: 'Which TWO of the following statements are true of the researchers at London Zoo? (first answer)',
            options: [...CAM_CORAL_ZOO_CHOOSE_TWO],
            answer: 'b',
            explanation: 'B — identify corals that cope with changed sea conditions.',
          },
          {
            number: 23,
            type: 'multiple-choice',
            prompt: 'Which TWO of the following statements are true of the researchers at London Zoo? (second answer)',
            options: [...CAM_CORAL_ZOO_CHOOSE_TWO],
            answer: 'd',
            explanation: 'D — methods to speed up reproduction in some corals.',
          },
        ],
      },
      {
        range: 'Questions 24–26',
        instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        notesTitle: 'Coral reefs',
        notePassage: CAM_CORAL_REEFS_NOTE_PASSAGE,
        questions: gapQuestions(24, [
          { prompt: 'Gap (24)', answer: 'tentacles', explanation: 'number of tentacles which they use to collect their food.' },
          { prompt: 'Gap (25)', answer: 'protection', explanation: 'algae gain protection from being inside the coral.' },
          { prompt: 'Gap (26)', answer: 'algae', explanation: 'warmth can remove the algae from corals.' },
        ]),
      },
    ],
  }
}

/** Cam14 T1 — match paragraph Q14–18 + 2× Choose TWO Q19–22 + summary ONE WORD Q23–26 */
export function ieltsReadingP2MatchChooseTwoSummaryPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'The growth of bike-sharing schemes around the world',
    passageSubtitle: 'How Dutch free bikes inspired a global movement',
    passage: [
      {
        label: 'A',
        text: 'The original idea for an urban bike-sharing scheme dates back to a summer\'s day in Amsterdam in 1965. Provo, the organisation that came up with the idea, was a group of Dutch activists who wanted to change society. They were concerned about damage to the environment and about pollution, and believed that the bike-sharing scheme would draw attention to these issues. As well as painting some bikes white, they handed out leaflets that condemned the use of cars. However, the scheme was not a great success: almost as quickly as Provo left the bikes around the city, the thieves took them away. According to Schimmelpennink, the scheme was intended to be symbolic. The idea was to get people thinking about the issues.',
      },
      {
        label: 'B',
        text: 'A more ambitious scheme, also involving white bikes, was proposed in the 1970s. Schimmelpennink and colleagues wanted to leave free white bikes at railway stations and other points for people to use for short journeys, then leave for someone else. City authorities turned the plan down. Schimmelpennink had calculated potential savings a bike-sharing scheme would bring in reduced car use and congestion.',
      },
      {
        label: 'C',
        text: 'In 1999 Amsterdam tried again with a more sophisticated model. The scheme was made possible by a change in people\'s attitudes towards cycling and public space. It was initially opposed by a government department concerned with liability and maintenance costs, but eventually went ahead with electronic locks and membership cards.',
      },
      {
        label: 'D',
        text: 'Copenhagen launched a coin-operated scheme that became a model for other European cities. Users inserted a deposit which was returned when they locked the bike back. The system reduced casual theft compared with free unlock models.',
      },
      {
        label: 'E',
        text: 'Not all early schemes worked as intended. In some cities, people misused a bike-sharing scheme by removing seats, selling parts, or taking bikes home as private property. Operators learned that without tracking technology and clear rules, fleets disappeared within weeks.',
      },
      {
        label: 'F',
        text: 'One designer who developed a distinctive share-bike model found he was unable to profit from their work when cities adopted competing contracts and open specifications. His frames became common street furniture, but royalties never materialised.',
      },
      {
        label: 'G',
        text: 'Today Amsterdam is still regarded as a place that welcomes cyclists, and visitors hire bikes more cheaply than in many other capitals. Schemes elsewhere have become tourist attractions, while a few cities claim the most successful programme by ridership. The white-bike idea of the 1960s now underpins networks from Paris to Beijing.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–18',
        instruction: 'Reading Passage 2 has sections A–G. Which section contains the following information? Write the correct letter, A–G, in boxes 14–18 on your answer sheet.',
        note: 'NB You may use any letter more than once.',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        questions: [
          { number: 14, type: 'matching-paragraph', prompt: 'a description of how people misused a bike-sharing scheme', options: [], answer: 'e', explanation: 'Đoạn E — misuse: remove seats, sell parts, take home.' },
          { number: 15, type: 'matching-paragraph', prompt: 'an explanation of why a proposed bike-sharing scheme was turned down', options: [], answer: 'b', explanation: 'Đoạn B — city authorities turned the plan down.' },
          { number: 16, type: 'matching-paragraph', prompt: 'a reference to a person being unable to profit from their work', options: [], answer: 'f', explanation: 'Đoạn F — unable to profit / royalties never materialised.' },
          { number: 17, type: 'matching-paragraph', prompt: 'an explanation of the potential savings a bike-sharing scheme would bring', options: [], answer: 'b', explanation: 'Đoạn B — calculated potential savings.' },
          { number: 18, type: 'matching-paragraph', prompt: 'a reference to the problems a bike-sharing scheme was intended to solve', options: [], answer: 'a', explanation: 'Đoạn A — environment and pollution; symbolic attention.' },
        ],
      },
      {
        range: 'Questions 19–20',
        instruction: 'Choose TWO correct answers, A–E.',
        type: 'multiple-choice',
        questions: [
          {
            number: 19,
            type: 'multiple-choice',
            prompt: 'Which TWO of the following statements are made in the text about the Amsterdam bike-sharing scheme of 1999? (first answer)',
            options: CAM14_T1_BIKE_AMSTERDAM_OPTS,
            answer: 'a',
            explanation: 'A — initially opposed by a government department.',
          },
          {
            number: 20,
            type: 'multiple-choice',
            prompt: 'Which TWO of the following statements are made in the text about the Amsterdam bike-sharing scheme of 1999? (second answer)',
            options: CAM14_T1_BIKE_AMSTERDAM_OPTS,
            answer: 'd',
            explanation: 'D — made possible by a change in people\'s attitudes.',
          },
        ],
      },
      {
        range: 'Questions 21–22',
        instruction: 'Choose TWO correct answers, A–E.',
        type: 'multiple-choice',
        questions: [
          {
            number: 21,
            type: 'multiple-choice',
            prompt: 'Which TWO of the following statements are made in the text about Amsterdam today? (first answer)',
            options: CAM14_T1_BIKE_CITY_OPTS,
            answer: 'e',
            explanation: 'E — reputation as a place that welcomes cyclists.',
          },
          {
            number: 22,
            type: 'multiple-choice',
            prompt: 'Which TWO of the following statements are made in the text about Amsterdam today? (second answer)',
            options: CAM14_T1_BIKE_CITY_OPTS,
            answer: 'd',
            explanation: 'D — hire bikes more cheaply than in other places.',
          },
        ],
      },
      {
        range: 'Questions 23–26',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        note: CAM14_T1_BIKE_SUMMARY_NOTE,
        questions: gapQuestions(23, [
          { prompt: 'Gap (23)', answer: 'activists', explanation: 'Provo — group of Dutch activists.' },
          { prompt: 'Gap (24)', answer: 'pollution', explanation: 'Concerned about environment and pollution.' },
          { prompt: 'Gap (25)', answer: 'leaflets', explanation: 'Handed out leaflets condemning cars.' },
          { prompt: 'Gap (26)', answer: 'thieves', explanation: 'Thieves took the free bikes away.' },
        ]),
      },
    ],
  }
}

const CAM_INTEL_FEATURES = [
  { id: 'a', name: 'Hamiltonian' },
  { id: 'b', name: 'Jeffersonian' },
  { id: 'c', name: 'Jacksonian' },
]

/** Match paragraph Q1–3 (A–J) + YNNG Q4–6 + matching features A–C Q7–13 */
export function ieltsReadingP1MatchYnngFeaturesPart(): ReadingImportPartJson {
  return {
    partNumber: 1,
    rangeLabel: 'Read the text and answer questions 1–13.',
    passageTitle: 'What is intelligence, and who has it?',
    passageSubtitle: 'How American political traditions shaped ideas about human ability',
    passage: [
      {
        label: 'A',
        text: 'Psychologists and educators still disagree over how intelligence should be defined. Some emphasise problem-solving speed; others stress social judgement or creativity. The lack of a single definition continues to fuel debate in schools and workplaces.',
      },
      {
        label: 'B',
        text: 'In everyday life, non-scientists hold informal beliefs about who is "smart". Those assumptions quietly shape how people treat colleagues, hire employees and even talk to children — often without realising the influence of their own theories of intelligence.',
      },
      {
        label: 'C',
        text: 'Researchers themselves may hold two layers of belief. A scientist\'s published model of intelligence can differ sharply from the private, gut-level theory that guides their reactions in ordinary conversation. Implicit and explicit theories may be very different.',
      },
      {
        label: 'D',
        text: 'Parents watching a child struggle with language often feel personal disappointment, yet the research literature does not claim that slow early speech must predict lifelong academic failure. Many late talkers catch up when given support.',
      },
      {
        label: 'E',
        text: 'Three traditions in American political culture have long framed discussions of ability. The Hamiltonian view prizes natural hierarchy and elite leadership; the Jeffersonian ideal stresses equal opportunity; the Jacksonian strand is more sceptical of privilege and credentials.',
      },
      {
        label: 'F',
        text: 'Hamiltonians tend to believe variation in intelligence begins at birth and that society works best when the more intelligent people occupy positions of power. Selection and sorting are treated as natural and desirable.',
      },
      {
        label: 'G',
        text: 'Jeffersonians insist it is desirable for the same possibilities to be open to everyone. They accept that people differ, but argue that institutions should not lock anyone out of education or public life at the start.',
      },
      {
        label: 'H',
        text: 'Jacksonians go further in rejecting privilege: no section of society should have preferential treatment at the expense of another. Rewards should follow genuine achievement rather than birth or connections.',
      },
      {
        label: 'I',
        text: 'A related Jeffersonian hope is that everyone can develop the same abilities if teaching and effort are sufficient — an optimistic view that sometimes clashes with evidence of early and stable individual differences.',
      },
      {
        label: 'J',
        text: 'Critics of pure merit talk warn that people of low measured intelligence may face social risks, including less stable employment. Some historical writers even claimed such groups were likely to lead uncontrolled lives — a claim modern researchers treat with caution.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 1–3',
        instruction: 'Reading Passage 1 has sections A–J. Which section contains the following information? Write the correct letter, A–J, in boxes 1–3 on your answer sheet.',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        questions: [
          {
            number: 1,
            type: 'matching-paragraph',
            prompt: 'information about how non-scientists\' assumptions about intelligence influence their behavior towards others',
            options: [],
            answer: 'b',
            explanation: 'Đoạn B — assumptions of non-scientists shape how people treat others.',
          },
          {
            number: 2,
            type: 'matching-paragraph',
            prompt: 'a reference to lack of clarity over the definition of intelligence',
            options: [],
            answer: 'a',
            explanation: 'Đoạn A — lack of a single definition of intelligence.',
          },
          {
            number: 3,
            type: 'matching-paragraph',
            prompt: 'the point that a researcher\'s implicit and explicit theories may be very different',
            options: [],
            answer: 'c',
            explanation: 'Đoạn C — implicit and explicit theories may be very different.',
          },
        ],
      },
      {
        range: 'Questions 4–6',
        instruction: 'Do the following statements agree with the claims of the writer in the Reading Passage? In boxes 4–6 on your answer sheet, write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        type: 'ynng',
        questions: [
          {
            number: 4,
            type: 'yes-no-not-given',
            prompt: 'Slow language development in children is likely to prove disappointing to their parents.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Đoạn D — parents often feel personal disappointment when a child struggles with language.',
          },
          {
            number: 5,
            type: 'yes-no-not-given',
            prompt: 'Late talkers never catch up with their peers.',
            options: [...YNNG_OPTIONS],
            answer: 'no',
            explanation: 'Đoạn D — many late talkers catch up with support (mâu thuẫn "never").',
          },
          {
            number: 6,
            type: 'yes-no-not-given',
            prompt: 'Schools should test every child for intelligence before age five.',
            options: [...YNNG_OPTIONS],
            answer: 'not given',
            explanation: 'Passage không nêu quan điểm writer về bắt buộc test trước 5 tuổi.',
          },
        ],
      },
      {
        range: 'Questions 7–13',
        instruction: 'Match each statement with the correct option, A–C. Write the correct letter in boxes 7–13 on your answer sheet.',
        note: 'NB You may use any letter more than once.',
        type: 'matching-features',
        features: CAM_INTEL_FEATURES,
        questions: [
          {
            number: 7,
            type: 'matching-features',
            prompt: 'It is desirable for the same possibilities to be open to everyone.',
            options: [],
            answer: 'b',
            explanation: 'Jeffersonian — equal opportunity / same possibilities.',
          },
          {
            number: 8,
            type: 'matching-features',
            prompt: 'No section of society should have preferential treatment at the expense of another.',
            options: [],
            answer: 'c',
            explanation: 'Jacksonian — reject privilege / preferential treatment.',
          },
          {
            number: 9,
            type: 'matching-features',
            prompt: 'People should only gain benefits on the basis of what they actually achieve.',
            options: [],
            answer: 'c',
            explanation: 'Jacksonian — rewards follow genuine achievement.',
          },
          {
            number: 10,
            type: 'matching-features',
            prompt: 'Variation in intelligence begins at birth.',
            options: [],
            answer: 'a',
            explanation: 'Hamiltonian — variation begins at birth.',
          },
          {
            number: 11,
            type: 'matching-features',
            prompt: 'The more intelligent people should be in positions of power.',
            options: [],
            answer: 'a',
            explanation: 'Hamiltonian — intelligent people in positions of power.',
          },
          {
            number: 12,
            type: 'matching-features',
            prompt: 'Everyone can develop the same abilities.',
            options: [],
            answer: 'b',
            explanation: 'Jeffersonian — everyone can develop the same abilities.',
          },
          {
            number: 13,
            type: 'matching-features',
            prompt: 'People of low intelligence are likely to lead uncontrolled lives.',
            options: [],
            answer: 'a',
            explanation: 'Liên quan truyền thống Hamiltonian / hierarchy (đoạn J cảnh báo claim lịch sử).',
          },
        ],
      },
    ],
  }
}

const CAM_PLAY_FEATURES = [
  { id: 'a', name: 'Elkind' },
  { id: 'b', name: 'Miller & Almon' },
  { id: 'c', name: 'Rubin et al.' },
  { id: 'd', name: 'Stuart Brown' },
  { id: 'e', name: 'Pellegrini' },
  { id: 'f', name: 'Joan Goodman' },
  { id: 'g', name: 'Hirsch-Pasek et al.' },
]

const CAM_GUIDED_PLAY_SUMMARY_NOTE = [
  'Guided play',
  '',
  'In the simplest form of guided play, an adult contributes to the environment in which the child is playing. Alternatively, an adult can play with a child and develop the play, for instance by 37________ the child to investigate different aspects of their game. Adults can help children to learn through play, and may make the activity rather structured, but it should still be based on the child\'s 38________ to play.',
  '',
  'Play without the intervention of adults gives children real 39________; with adults, play can be 40________ at particular goals. However, all forms of play should be an opportunity for children to have fun.',
].join('\n')

/** Features Q27–31 + YNNG Q32–36 + summary ONE WORD Q37–40 (Guided play) */
export function ieltsReadingP3FeaturesYnngSummaryPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'Why play is important for children',
    passageSubtitle: 'Researchers debate how adults should guide children\'s play',
    passage: [
      {
        text: 'Play has been studied by generations of psychologists and educators. Elkind argued that play can be divided into a number of separate categories, each with its own developmental role. Miller and Almon observed that adults\' intended goals affect how they play with children — a parent who wants to teach counting will steer a game differently from one who simply wants fun. Rubin and colleagues suggested that combining work with play may be the best way for children to learn, blending structure and free exploration.',
      },
      {
        text: 'Stuart Brown emphasised that certain elements of play are more significant than others for emotional health. Pellegrini proposed that activities can be classified on a scale of playfulness, from rigid drills to open-ended improvisation. Joan Goodman examined how commercial toys shape play, while Hirsch-Pasek and co-authors reviewed evidence that guided play supports academic skills without removing joy.',
      },
      {
        text: 'The writer of this passage does not claim that children need toys in order to play. Empty boxes, sticks and open spaces often spark richer invention than expensive gadgets. What matters is opportunity and time, not a catalogue of products.',
      },
      {
        text: 'In the simplest form of guided play, an adult contributes to the environment in which the child is playing — arranging materials, clearing space, or offering props. Alternatively, an adult can play with a child and develop the play, for instance by encouraging the child to investigate different aspects of their game. Adults can help children to learn through play, and may make the activity rather structured, but it should still be based on the child\'s motivation to play.',
      },
      {
        text: 'Play without the intervention of adults gives children real autonomy; with adults, play can be directed at particular goals. However, all forms of play should remain an opportunity for children to have fun. When adults over-control every move, the activity ceases to feel like play at all.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–31',
        instruction: 'Match each statement with the correct option, A–G. Write the correct letter in boxes 27–31 on your answer sheet.',
        note: 'NB You may use any letter more than once.',
        type: 'matching-features',
        features: CAM_PLAY_FEATURES,
        questions: [
          {
            number: 27,
            type: 'matching-features',
            prompt: 'Play can be divided into a number of separate categories.',
            options: [],
            answer: 'a',
            explanation: 'Elkind — separate categories of play.',
          },
          {
            number: 28,
            type: 'matching-features',
            prompt: 'Adults\' intended goals affect how they play with children.',
            options: [],
            answer: 'b',
            explanation: 'Miller & Almon — adults\' goals shape play with children.',
          },
          {
            number: 29,
            type: 'matching-features',
            prompt: 'Combining work with play may be the best way for children to learn.',
            options: [],
            answer: 'c',
            explanation: 'Rubin et al. — combining work with play.',
          },
          {
            number: 30,
            type: 'matching-features',
            prompt: 'Certain elements of play are more significant than others.',
            options: [],
            answer: 'd',
            explanation: 'Stuart Brown — certain elements more significant.',
          },
          {
            number: 31,
            type: 'matching-features',
            prompt: 'Activities can be classified on a scale of playfulness.',
            options: [],
            answer: 'e',
            explanation: 'Pellegrini — scale of playfulness.',
          },
        ],
      },
      {
        range: 'Questions 32–36',
        instruction: 'Do the following statements agree with the claims of the writer in the Reading Passage? In boxes 32–36 on your answer sheet, write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        type: 'ynng',
        questions: [
          {
            number: 32,
            type: 'yes-no-not-given',
            prompt: 'Children need toys in order to play.',
            options: [...YNNG_OPTIONS],
            answer: 'no',
            explanation: 'Writer: children do not need toys to play; empty boxes etc. can spark invention.',
          },
          {
            number: 33,
            type: 'yes-no-not-given',
            prompt: 'Guided play should never feel structured.',
            options: [...YNNG_OPTIONS],
            answer: 'no',
            explanation: 'Adults may make activity rather structured, but based on child\'s motivation.',
          },
          {
            number: 34,
            type: 'yes-no-not-given',
            prompt: 'All forms of play should give children a chance to have fun.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'All forms of play should be an opportunity for children to have fun.',
          },
          {
            number: 35,
            type: 'yes-no-not-given',
            prompt: 'Parents spend more money on toys now than twenty years ago.',
            options: [...YNNG_OPTIONS],
            answer: 'not given',
            explanation: 'Không có claim về chi tiêu đồ chơi theo thời gian.',
          },
          {
            number: 36,
            type: 'yes-no-not-given',
            prompt: 'When adults control every move, the activity may stop feeling like play.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'When adults over-control, activity ceases to feel like play.',
          },
        ],
      },
      {
        range: 'Questions 37–40',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        note: CAM_GUIDED_PLAY_SUMMARY_NOTE,
        questions: gapQuestions(37, [
          { prompt: 'Gap (37)', answer: 'encouraging', explanation: 'by encouraging the child to investigate…' },
          { prompt: 'Gap (38)', answer: 'motivation', explanation: 'based on the child\'s motivation to play.' },
          { prompt: 'Gap (39)', answer: 'autonomy', explanation: 'gives children real autonomy.' },
          { prompt: 'Gap (40)', answer: 'directed', explanation: 'play can be directed at particular goals.' },
        ]),
      },
    ],
  }
}

const CAM_ZOO_STAFF_OPTS = [
  { id: 'a', label: 'Some take part in television documentaries about animals' },
  { id: 'b', label: 'Some travel to overseas locations to join teams in zoos.' },
  { id: 'c', label: 'Some get experience with species in the wild before taking up zoo jobs.' },
  { id: 'd', label: 'Some teach people who are involved with conservation projects.' },
  { id: 'e', label: 'Some specialise in caring for species which are under threat.' },
]

/** Match đoạn Q14–17 + TFNG Q18–22 + Choose TWO Q23–24 (+ optional 25–26) */
export function ieltsReadingP2MatchTfngChooseTwoPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'Zoos and the animals that live in them',
    passageSubtitle: 'Arguments for and against keeping animals in captivity',
    passage: [
      {
        label: 'A',
        text: 'Extinction can happen with startling speed. Entire animal species may die out within a few decades when habitat is destroyed or hunting pressure is intense. Conservationists often point to this rapid loss as a reason to act before populations collapse beyond recovery.',
      },
      {
        label: 'B',
        text: 'Studying animals in captivity can be preferable to fieldwork in the wild. Controlled conditions make it easier to measure diet, behaviour and breeding success, and researchers avoid long expeditions that risk disturbing fragile ecosystems.',
      },
      {
        label: 'C',
        text: 'People who cannot visit zoos still learn about animals through wildlife films and museum collections. These two routes — screen and specimen — give access without the cost or travel of a zoo day out.',
      },
      {
        label: 'D',
        text: 'Animals in well-run zoos may be healthier than counterparts in the wild. Regular veterinary care, reliable food and protection from predators reduce injuries and disease that cut short lives in nature. An animal is often likely to live longer in a zoo than in the wild.',
      },
      {
        label: 'E',
        text: 'Zoo staff careers take many forms. Some take part in television documentaries about animals; others travel to overseas locations to join teams in zoos. A number specialise in caring for species which are under threat, while colleagues teach people involved with conservation projects.',
      },
      {
        label: 'F',
        text: 'Critics argue that even the best enclosures cannot replace natural ranges. Behavioural stereotyping and limited space remain concerns for large carnivores and migratory species.',
      },
      {
        label: 'G',
        text: 'Modern zoos increasingly fund field programmes and reintroduction schemes. Breeding for release is presented as a bridge between captivity and wild populations, though success rates vary by species.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–17',
        instruction: 'Reading Passage 2 has sections A–G. Which section contains the following information? Write the correct letter, A–G, in boxes 14–17 on your answer sheet.',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        questions: [
          {
            number: 14,
            type: 'matching-paragraph',
            prompt: 'a reference to how quickly animal species can die out',
            options: [],
            answer: 'a',
            explanation: 'Đoạn A — extinction can happen with startling speed / die out within decades.',
          },
          {
            number: 15,
            type: 'matching-paragraph',
            prompt: 'reasons why it is preferable to study animals in captivity rather than in the wild',
            options: [],
            answer: 'b',
            explanation: 'Đoạn B — studying in captivity preferable to fieldwork.',
          },
          {
            number: 16,
            type: 'matching-paragraph',
            prompt: 'mention of two ways of learning about animals other than visiting them in zoos',
            options: [],
            answer: 'c',
            explanation: 'Đoạn C — wildlife films and museum collections.',
          },
          {
            number: 17,
            type: 'matching-paragraph',
            prompt: 'reasons why animals in zoos may be healthier than those in the wild',
            options: [],
            answer: 'd',
            explanation: 'Đoạn D — veterinary care, food, protection from predators.',
          },
        ],
      },
      {
        range: 'Questions 18–22',
        instruction: 'Do the following statements agree with the information given in the Reading Passage? In boxes 18–22 on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        type: 'tfng',
        questions: [
          {
            number: 18,
            type: 'true-false-not-given',
            prompt: 'An animal is likely to live longer in a zoo than in the wild.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'Đoạn D — likely to live longer in a zoo than in the wild.',
          },
          {
            number: 19,
            type: 'true-false-not-given',
            prompt: 'All large carnivores in zoos show behavioural stereotyping.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Đoạn F — stereotyping is a concern, not stated for all large carnivores.',
          },
          {
            number: 20,
            type: 'true-false-not-given',
            prompt: 'Museum collections are more popular than wildlife films.',
            options: [...TFNG_OPTIONS],
            answer: 'not given',
            explanation: 'Đoạn C nhắc cả hai nhưng không so sánh độ phổ biến.',
          },
          {
            number: 21,
            type: 'true-false-not-given',
            prompt: 'Modern zoos sometimes support reintroduction schemes.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'Đoạn G — fund field programmes and reintroduction schemes.',
          },
          {
            number: 22,
            type: 'true-false-not-given',
            prompt: 'Every zoo staff member works overseas at some point.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Đoạn E — some travel overseas, không phải everyone.',
          },
        ],
      },
      {
        range: 'Questions 23–24',
        instruction: 'Choose TWO correct answers, A–E.',
        type: 'multiple-choice',
        questions: [
          {
            number: 23,
            type: 'multiple-choice',
            prompt: 'Which TWO of the following are stated about zoo staff in the text? (first answer)',
            options: CAM_ZOO_STAFF_OPTS,
            answer: 'a',
            explanation: 'A — take part in television documentaries.',
          },
          {
            number: 24,
            type: 'multiple-choice',
            prompt: 'Which TWO of the following are stated about zoo staff in the text? (second answer)',
            options: CAM_ZOO_STAFF_OPTS,
            answer: 'b',
            explanation: 'B — travel to overseas locations to join teams in zoos.',
          },
        ],
      },
      {
        range: 'Questions 25–26',
        instruction: 'Choose TWO correct answers, A–E.',
        type: 'multiple-choice',
        questions: [
          {
            number: 25,
            type: 'multiple-choice',
            prompt: 'Which TWO of the following are stated about zoo staff in the text? (first answer)',
            options: CAM_ZOO_STAFF_OPTS,
            answer: 'd',
            explanation: 'D — teach people involved with conservation projects.',
          },
          {
            number: 26,
            type: 'multiple-choice',
            prompt: 'Which TWO of the following are stated about zoo staff in the text? (second answer)',
            options: CAM_ZOO_STAFF_OPTS,
            answer: 'e',
            explanation: 'E — specialise in caring for species under threat.',
          },
        ],
      },
    ],
  }
}

/**
 * Notes Q34–39 — cùng format notePassage như r1n8 (Glass Q1–8):
 * section heading + bullet (•) / sub-bullet (–) + static + gap inline.
 * Nội dung bám đề Cam (Findings related to marine debris).
 */
export const CAM_MARINE_DEBRIS_NOTE_PASSAGE: ReadingNotePassageBlock[] = [
  // --- Findings: biggest threats ---
  {
    type: 'section',
    text: 'Studies of marine debris found the biggest threats were',
  },
  { type: 'static', text: '• plastic (not metal or wood)' },
  { type: 'static', text: '• bits of debris that were ' },
  { type: 'gap', number: 34 },
  { type: 'static', text: ' (harmful to animals)' },
  // --- Little research ---
  { type: 'static', text: 'There was little research into ' },
  { type: 'gap', number: 35 },
  { type: 'static', text: ' e.g. from synthetic fibres.' },
  // --- Drawbacks ---
  {
    type: 'section',
    text: 'Drawbacks of the studies examined',
  },
  { type: 'static', text: '• most of them focused on individual animals, not entire ' },
  { type: 'gap', number: 36 },
  { type: 'static', text: '• the ' },
  { type: 'gap', number: 37 },
  { type: 'static', text: ' of plastic used in the lab did not always reflect those in the ocean' },
  { type: 'static', text: '• there was insufficient information on' },
  { type: 'static', text: '– numbers of animals which could be affected' },
  { type: 'static', text: '– the impact of a reduction in numbers on the ' },
  { type: 'gap', number: 38 },
  { type: 'static', text: ' of that species' },
  { type: 'static', text: '– the impact on the ecosystem' },
  // --- Closing (Rochman) ---
  { type: 'static', text: 'Rochman says more information is needed on the possible impact of future ' },
  { type: 'gap', number: 39 },
  { type: 'static', text: ' (e.g. involving oil).' },
]

const CAM_MARINE_TITLE_OPTS = [
  { id: 'a', label: 'Assessing the threat of marine debris' },
  { id: 'b', label: 'Marine debris: who is to blame?' },
  { id: 'c', label: 'A new solution to the problem of marine debris' },
  { id: 'd', label: 'Marine debris: the need for international action' },
]

/** TFNG Q27–33 + notes Q34–39 (notePassage) + MC title Q40 */
export function ieltsReadingP3TfngNotesMcPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'Marine debris',
    passageSubtitle: 'What scientific reviews tell us about plastic and other waste in the ocean',
    passage: [
      {
        text: 'Plastic and other human-made materials in the sea have attracted growing attention from scientists and the public. Reviews of the literature show that Rochman and her colleagues were not the first people to research the problem of marine debris, but their systematic approach pulled together evidence that had previously been scattered across journals and disciplines.',
      },
      {
        text: 'Studies of marine debris found that the biggest threats were plastic rather than metal or wood. Bits of debris that were large proved especially harmful to animals that swallowed them or became entangled. There was little research into microplastic, for example from synthetic fibres, compared with larger items such as bottles and nets.',
      },
      {
        text: 'Many of the studies examined had drawbacks. Most of them focused on individual animals, not entire populations. The types of plastic used in the lab did not always reflect those floating in the ocean. There was insufficient information on how many animals could be affected, on the impact of a reduction in numbers on the survival of that species, and on wider effects on the ecosystem.',
      },
      {
        text: 'Rochman says more information is needed on the possible impact of future disasters, for example involving oil, and on how debris interacts with other stressors. She argues that assessing the threat of marine debris requires better data, not only moral urgency — which is why the best title for this passage emphasises assessment rather than blame or a single new solution.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–33',
        instruction: 'Do the following statements agree with the information given in the Reading Passage? In boxes 27–33 on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        type: 'tfng',
        questions: [
          {
            number: 27,
            type: 'true-false-not-given',
            prompt: 'Rochman and her colleagues were the first people to research the problem of marine debris.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'They were not the first — systematic review of existing research.',
          },
          {
            number: 28,
            type: 'true-false-not-given',
            prompt: 'Plastic is identified as a bigger marine-debris threat than metal or wood.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'Biggest threats were plastic (not metal or wood).',
          },
          {
            number: 29,
            type: 'true-false-not-given',
            prompt: 'Large pieces of debris can be harmful to animals.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'Bits of debris that were large — harmful to animals.',
          },
          {
            number: 30,
            type: 'true-false-not-given',
            prompt: 'Most studies examined whole populations rather than single animals.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Most focused on individual animals, not entire populations.',
          },
          {
            number: 31,
            type: 'true-false-not-given',
            prompt: 'Lab plastics always matched plastics found in the ocean.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Types of plastic in lab did not always reflect those in the ocean.',
          },
          {
            number: 32,
            type: 'true-false-not-given',
            prompt: 'Rochman has published more papers on oil spills than on plastic.',
            options: [...TFNG_OPTIONS],
            answer: 'not given',
            explanation: 'Không so sánh số bài về oil vs plastic.',
          },
          {
            number: 33,
            type: 'true-false-not-given',
            prompt: 'More data is needed on future disasters such as those involving oil.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'Rochman: more information needed on future disasters e.g. oil.',
          },
        ],
      },
      {
        range: 'Questions 34–39',
        instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        // Giống r1n8: notesTitle + notePassage (KHÔNG dùng note string inline / summary)
        notesTitle: 'Findings related to marine debris',
        notePassage: CAM_MARINE_DEBRIS_NOTE_PASSAGE,
        questions: gapQuestions(34, [
          { prompt: 'Gap (34)', answer: 'large', explanation: 'Cam14: bits of debris that were large (harmful to animals).' },
          { prompt: 'Gap (35)', answer: 'microplastic', explanation: 'Cam14: little research into microplastic e.g. from synthetic fibres.' },
          { prompt: 'Gap (36)', answer: 'populations', explanation: 'not entire populations.' },
          { prompt: 'Gap (37)', answer: 'types', explanation: 'the types of plastic used in the lab…' },
          { prompt: 'Gap (38)', answer: 'survival', explanation: 'impact of a reduction in numbers on the survival of that species.' },
          { prompt: 'Gap (39)', answer: 'disasters', explanation: 'impact of future disasters (e.g. involving oil).' },
        ]),
      },
      {
        range: 'Question 40',
        instruction: 'Choose the correct answer.',
        type: 'multiple-choice',
        questions: [
          {
            number: 40,
            type: 'multiple-choice',
            prompt: 'What would be the best title for this passage?',
            options: CAM_MARINE_TITLE_OPTS,
            answer: 'a',
            explanation: 'A — Assessing the threat of marine debris (focus of the review).',
          },
        ],
      },
    ],
  }
}

const CAM_FAIRY_ENDINGS_BANK = [
  { id: 'a', label: 'may be provided through methods used in biological research.' },
  { id: 'b', label: 'are the reason for their survival.' },
  { id: 'c', label: 'show considerable global variation.' },
  { id: 'd', label: 'contain animals which transform to become humans.' },
  { id: 'e', label: 'were originally spoken rather than written.' },
  { id: 'f', label: 'have been developed without factual basis.' },
]

const CAM_FAIRY_SUMMARY_WORD_BANK = [
  { id: 'a', label: 'ending' },
  { id: 'b', label: 'events' },
  { id: 'c', label: 'warning' },
  { id: 'd', label: 'links' },
  { id: 'e', label: 'records' },
  { id: 'f', label: 'variations' },
  { id: 'g', label: 'horror' },
  { id: 'h', label: 'people' },
  { id: 'i', label: 'plot' },
]

const CAM_FAIRY_SUMMARY_NOTE = [
  'Phylogenetic analysis of Little Red Riding Hood',
  '',
  'Tehrani used techniques from evolutionary biology to find out if 32________ existed among 58 stories from around the world. '
  + 'He also wanted to know which aspects of the stories had fewest 33________ as he believed these aspects would be the most important ones. '
  + 'Contrary to other beliefs, he found that some 34________ that were included in a story tended to change over time, and that the middle of a story seemed no more important than the other parts. '
  + 'He was also surprised that parts of a story which seemed to provide some sort of 35________ were unimportant. '
  + 'The aspect that he found most important in a story\'s survival was 36________.',
].join('\n')

/** Endings Q27–31 + summary word bank Q32–36 + MC Q37–40 (Fairy tales / Tehrani) */
export function ieltsReadingP3EndingsSummaryMcPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'The science of fairy tales',
    passageSubtitle: 'Jamie Tehrani and the evolution of stories such as Little Red Riding Hood',
    passage: [
      {
        text: 'Fairy tales have been told for centuries. Details of the plot may be provided through methods used in biological research when scholars compare variants. Tehrani rejects the idea that the useful lessons for life in fairy tales are the reason for their survival. Various theories about the social significance of fairy tales have been developed without factual basis. Insights into the development of fairy tales may be provided through methods used in biological research. All the fairy tales analysed by Tehrani were originally spoken rather than written.',
      },
      {
        text: 'Tehrani used techniques from evolutionary biology to find out if links existed among 58 stories from around the world. He also wanted to know which aspects of the stories had fewest variations as he believed these aspects would be the most important ones. Contrary to other beliefs, he found that some events that were included in a story tended to change over time, and that the middle of a story seemed no more important than the other parts. He was also surprised that parts of a story which seemed to provide some sort of warning were unimportant. The aspect that he found most important in a story\'s survival was plot.',
      },
      {
        text: 'To test his ideas about fairy tales, Jamie Tehrani looked at many different forms of the same basic story, including versions of Little Red Riding Hood from Europe, Asia and Africa. He compared oral and written forms where available, and mapped how narrative elements branched over time much like species on a phylogenetic tree.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–31',
        instruction: 'Complete each sentence with the correct ending, A–F, below. Write the correct letter in boxes 27–31 on your answer sheet.',
        type: 'summary-completion',
        wordBank: CAM_FAIRY_ENDINGS_BANK,
        questions: [
          {
            number: 27,
            type: 'summary-completion',
            prompt: 'In fairy tales, details of the plot',
            options: [],
            answer: 'c',
            explanation: 'C — show considerable global variation (or A depending key; sample C).',
          },
          {
            number: 28,
            type: 'summary-completion',
            prompt: 'Tehrani rejects the idea that the useful lessons for life in fairy tales',
            options: [],
            answer: 'b',
            explanation: 'B — are the reason for their survival.',
          },
          {
            number: 29,
            type: 'summary-completion',
            prompt: 'Various theories about the social significance of fairy tales',
            options: [],
            answer: 'f',
            explanation: 'F — have been developed without factual basis.',
          },
          {
            number: 30,
            type: 'summary-completion',
            prompt: 'Insights into the development of fairy tales',
            options: [],
            answer: 'a',
            explanation: 'A — may be provided through methods used in biological research.',
          },
          {
            number: 31,
            type: 'summary-completion',
            prompt: 'All the fairy tales analysed by Tehrani',
            options: [],
            answer: 'e',
            explanation: 'E — were originally spoken rather than written.',
          },
        ],
      },
      {
        range: 'Questions 32–36',
        instruction: 'Complete the summary using the list of phrases, A–I, below.',
        type: 'summary-completion',
        note: CAM_FAIRY_SUMMARY_NOTE,
        wordBank: CAM_FAIRY_SUMMARY_WORD_BANK,
        questions: [
          { number: 32, type: 'summary-completion', prompt: 'Gap (32)', options: [], answer: 'd', explanation: 'D links — if links existed among 58 stories.' },
          { number: 33, type: 'summary-completion', prompt: 'Gap (33)', options: [], answer: 'f', explanation: 'F variations — fewest variations.' },
          { number: 34, type: 'summary-completion', prompt: 'Gap (34)', options: [], answer: 'b', explanation: 'B events — some events … tended to change.' },
          { number: 35, type: 'summary-completion', prompt: 'Gap (35)', options: [], answer: 'c', explanation: 'C warning — some sort of warning.' },
          { number: 36, type: 'summary-completion', prompt: 'Gap (36)', options: [], answer: 'i', explanation: 'I plot — most important … was plot.' },
        ],
      },
      {
        range: 'Questions 37–40',
        instruction: 'Choose the correct answer.',
        type: 'multiple-choice',
        questions: [
          {
            number: 37,
            type: 'multiple-choice',
            prompt: 'What method did Jamie Tehrani use to test his ideas about fairy tales?',
            options: [
              { id: 'a', label: 'He compared oral and written forms of the same stories.' },
              { id: 'b', label: 'He looked at many different forms of the same basic story.' },
              { id: 'c', label: 'He looked at unrelated stories from many different countries.' },
              { id: 'd', label: 'He contrasted the development of fairy tales with that of living creatures.' },
            ],
            answer: 'b',
            explanation: 'B — many different forms of the same basic story (LRRH variants).',
          },
          {
            number: 38,
            type: 'multiple-choice',
            prompt: 'What did Tehrani conclude about the middle of a story?',
            options: [
              { id: 'a', label: 'It was more stable than the ending.' },
              { id: 'b', label: 'It seemed no more important than other parts.' },
              { id: 'c', label: 'It always contained a warning.' },
              { id: 'd', label: 'It was invented later than the beginning.' },
            ],
            answer: 'b',
            explanation: 'Middle seemed no more important than the other parts.',
          },
          {
            number: 39,
            type: 'multiple-choice',
            prompt: 'According to Tehrani, which aspect was most important for a story\'s survival?',
            options: [
              { id: 'a', label: 'horror' },
              { id: 'b', label: 'records' },
              { id: 'c', label: 'plot' },
              { id: 'd', label: 'people' },
            ],
            answer: 'c',
            explanation: 'Most important … was plot.',
          },
          {
            number: 40,
            type: 'multiple-choice',
            prompt: 'What is the writer\'s main point about theories of fairy tales\' social significance?',
            options: [
              { id: 'a', label: 'They are supported by phylogenetic trees.' },
              { id: 'b', label: 'They have often lacked a factual basis.' },
              { id: 'c', label: 'They explain why stories contain animals.' },
              { id: 'd', label: 'They prove lessons for life cause survival.' },
            ],
            answer: 'b',
            explanation: 'Theories … developed without factual basis.',
          },
        ],
      },
    ],
  }
}

const CAM_AI_ATTITUDES_HEADINGS = [
  { id: 'i', label: 'An increasing divergence of attitudes towards AI' },
  { id: 'ii', label: 'Reasons why we have more faith in human judgement than in AI' },
  { id: 'iii', label: 'The superiority of AI projections over those made by humans' },
  { id: 'iv', label: 'The process by which AI can help us make good decisions' },
  { id: 'v', label: 'The advantages of involving users in AI processes' },
  { id: 'vi', label: 'Widespread distrust of an AI innovation' },
  { id: 'vii', label: 'Encouraging openness about how AI functions' },
  { id: 'viii', label: 'A surprisingly successful AI application' },
]

const CAM_SPACE_DEBRIS_SUMMARY_NOTE = [
  'The Inter-Agency Space Debris Coordination Committee',
  '',
  'The committee gives advice on how the 32________ of space can be achieved. The committee advises that when satellites are no longer active, any unused 33________ or pressurised material that could cause 34________ should be removed.',
  '',
  'Although operators of large satellite constellations accept that they have obligations as stewards of space, Holger Krag points out that the operators that become 35________ are unlikely to prioritise removing their satellites from space.',
].join('\n')

const CAM_SPACE_DEBRIS_FEATURES = [
  { id: 'a', name: 'Carolin Frueh' },
  { id: 'b', name: 'Holger Krag' },
  { id: 'c', name: 'Marlon Sorge' },
  { id: 'd', name: 'Moriba Jah' },
]

/**
 * r3ms — Match đoạn Q27–31 + Summary ONE WORD Q32–35 + Features Q36–40
 * Preview: Teamplate_Part3_13.jpg (Space debris / Frueh, Krag…)
 */
export function ieltsReadingP3MatchSummaryFeaturesPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'The problem of space debris',
    passageSubtitle: 'Tracking junk in orbit and who should clean it up',
    passage: [
      {
        label: 'A',
        text: 'Space agencies and private operators now track thousands of objects in Earth orbit. Cooperation between nations aims to minimise the risk of collisions, including shared catalogues of debris and agreed avoidance procedures when two objects are predicted to pass close together.',
      },
      {
        label: 'B',
        text: 'Carolin Frueh explains that each mission begins with a set of aims: what the satellite must measure, how long it should operate, and how it will be disposed of. Those aims shape design choices from the first sketch of the spacecraft.',
      },
      {
        label: 'C',
        text: 'In 2009, a major collision occurred in space when an active communications satellite hit a defunct Russian craft, creating a cloud of fragments that still threaten other missions years later. The event became a standard reference when discussing cascade risks in low Earth orbit.',
      },
      {
        label: 'D',
        text: 'Engineers sometimes compare tracking objects in space with running an efficient transportation system: knowing exact positions allows safer routes, just as traffic control reduces accidents on busy roads. Without reliable tracking, operators cannot plan manoeuvres in time.',
      },
      {
        label: 'E',
        text: 'Researchers have proposed schemes to classify space junk by size, origin and hazard level so that limited resources can focus on the most dangerous fragments. Classification efforts are still incomplete because many small pieces cannot yet be catalogued accurately.',
      },
      {
        label: 'F',
        text: 'The Inter-Agency Space Debris Coordination Committee issues guidelines on the sustainable use of space. It advises that unused fuel or pressurised material that could cause explosions should be removed when satellites retire. Holger Krag notes that operators who become bankrupt rarely prioritise de-orbiting. Marlon Sorge has argued that recommendations about satellites are often ignored in practice. Moriba Jah warns of conflicting data on where some satellites actually are, and of the risk that damage already done in orbit may not be reversible.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–31',
        instruction: 'Reading Passage 3 has sections A–F. Which section contains the following information? Write the correct letter, A–F, in boxes 27–31 on your answer sheet.',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F'],
        questions: [
          {
            number: 27,
            type: 'matching-paragraph',
            prompt: 'A reference to the cooperation that takes place to try and minimise risk',
            options: [],
            answer: 'a',
            explanation: 'Section A — cooperation to minimise risk of collisions.',
          },
          {
            number: 28,
            type: 'matching-paragraph',
            prompt: 'An explanation of a person\'s aims',
            options: [],
            answer: 'b',
            explanation: 'Section B — Frueh on mission aims.',
          },
          {
            number: 29,
            type: 'matching-paragraph',
            prompt: 'A description of a major collision that occurred in space',
            options: [],
            answer: 'c',
            explanation: 'Section C — 2009 collision.',
          },
          {
            number: 30,
            type: 'matching-paragraph',
            prompt: 'A comparison between tracking objects in space and the efficiency of a transportation system',
            options: [],
            answer: 'd',
            explanation: 'Section D — comparison with transportation system.',
          },
          {
            number: 31,
            type: 'matching-paragraph',
            prompt: 'A reference to efforts to classify space junk',
            options: [],
            answer: 'e',
            explanation: 'Section E — classify space junk.',
          },
        ],
      },
      {
        range: 'Questions 32–35',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        note: CAM_SPACE_DEBRIS_SUMMARY_NOTE,
        questions: gapQuestions(32, [
          { prompt: 'Gap (32)', answer: 'sustainable', explanation: 'sustainable use of space (or wording on the paper).' },
          { prompt: 'Gap (33)', answer: 'fuel', explanation: 'unused fuel or pressurised material.' },
          { prompt: 'Gap (34)', answer: 'explosions', explanation: 'could cause explosions.' },
          { prompt: 'Gap (35)', answer: 'bankrupt', explanation: 'operators that become bankrupt.' },
        ]),
      },
      {
        range: 'Questions 36–40',
        instruction: 'Match each statement with the correct option, A–D. Write the correct letter in boxes 36–40 on your answer sheet.',
        note: 'NB You may use any letter more than once.',
        type: 'matching-features',
        features: CAM_SPACE_DEBRIS_FEATURES,
        questions: [
          {
            number: 36,
            type: 'matching-features',
            prompt: 'Knowing the exact location of space junk would help prevent any possible danger.',
            options: [],
            answer: 'a',
            explanation: 'Frueh / tracking location (adjust to key if needed).',
          },
          {
            number: 37,
            type: 'matching-features',
            prompt: 'Space should be available to everyone and should be preserved for the future.',
            options: [],
            answer: 'b',
            explanation: 'Krag / stewards of space.',
          },
          {
            number: 38,
            type: 'matching-features',
            prompt: 'A recommendation regarding satellites is widely ignored.',
            options: [],
            answer: 'c',
            explanation: 'Sorge — recommendations ignored.',
          },
          {
            number: 39,
            type: 'matching-features',
            prompt: 'There is conflicting information about where some satellites are in space.',
            options: [],
            answer: 'd',
            explanation: 'Jah — conflicting information on locations.',
          },
          {
            number: 40,
            type: 'matching-features',
            prompt: 'There is a risk we will not be able to undo the damage that occurs in space.',
            options: [],
            answer: 'd',
            explanation: 'Jah — damage may not be reversible.',
          },
        ],
      },
    ],
  }
}

const CAM_GUARD_DOGS_FEATURES = [
  { id: 'a', name: 'Dan Macon' },
  { id: 'b', name: 'Silvia Ribeiro' },
  { id: 'c', name: 'Linda van Bommel' },
  { id: 'd', name: 'Julie Young' },
  { id: 'e', name: 'Bethany Smith' },
]

const CAM_GUARD_DOGS_SUMMARY_NOTE = [
  'Unintended ecological effects of using guard dogs',
  '',
  'In Namibia, livestock guard dogs have been used to protect domestic animals from attacks by cheetahs. This has led to a rise in the deaths of other predators, particularly 37________.',
  '',
  'In addition, it has been suggested that the dogs could have 38________ which may affect other species, and that they may reduce the amount of 39________ available to certain wild animals.',
  '',
  'On the other hand, these dogs may help birds by protecting their nests. These might otherwise be threatened by predators such as 40________.',
].join('\n')

/**
 * r3mfs — Match đoạn Q27–31 + Features A–E Q32–36 + Summary ONE WORD Q37–40
 * Preview: Teamplate_Part3_20.jpg (livestock guard dogs)
 * Khác r3ms: features giữa, summary cuối (r3ms = summary giữa, features cuối)
 */
export function ieltsReadingP3MatchFeaturesSummaryPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'Livestock guard dogs',
    passageSubtitle: 'How working dogs protect herds — and reshape wild ecosystems',
    passage: [
      {
        label: 'A',
        text: 'Across ranching regions, livestock guard dogs live with sheep and goats from an early age so that they treat the flock as their pack. Skills are not taught like house-dog tricks; instead the animals gain their skills through continuous contact with livestock and gradual exposure to open range conditions.',
      },
      {
        label: 'B',
        text: 'When a predator approaches, the dogs bark, patrol and place themselves between the threat and the herd. This description of how the methods used by livestock guard dogs help to keep predators away is central to explaining why many farmers adopt the practice without lethal control.',
      },
      {
        label: 'C',
        text: 'In one documented case, cheetahs that had been killing calves were no longer shot after guard dogs arrived: an example of how one predator has been protected by the introduction of livestock guard dogs, because conflict dropped and farmers stopped retaliatory hunting.',
      },
      {
        label: 'D',
        text: 'Several academics argue that the approach works. Claims by different academics that the use of livestock guard dogs is a successful way of protecting farmers\' herds appear in reviews of ranch trials in Europe, North America and southern Africa, citing lower livestock losses and fewer poison campaigns.',
      },
      {
        label: 'E',
        text: 'Dan Macon notes that the use of guard dogs may save the lives of both livestock and wild animals by reducing the need for traps and guns. Julie Young warns that claims of a change in behaviour from those using livestock guard dogs may not be totally accurate — self-reports can overstate success. Silvia Ribeiro argues there may be negative results if the use of livestock guard dogs is not sufficiently widespread, leaving pockets of conflict. Linda van Bommel says livestock guard dogs are the best way of protecting farm animals, as long as the dogs are appropriately handled. Bethany Smith stresses that teaching a livestock guard dog how to do its work needs a different focus from teaching a house guard dog.',
      },
      {
        label: 'F',
        text: 'Researchers also track unintended ecological effects. In Namibia, livestock guard dogs have been used to protect domestic animals from attacks by cheetahs. This has led to a rise in the deaths of other predators, particularly jackals. In addition, it has been suggested that the dogs could have diseases which may affect other species, and that they may reduce the amount of food available to certain wild animals. On the other hand, these dogs may help birds by protecting their nests. These might otherwise be threatened by predators such as foxes.',
      },
      {
        label: 'G',
        text: 'Looking ahead, an optimistic suggestion about the possible positive developments in the use of livestock guard dogs is that wider training networks and shared breeding lines could spread best practice, cut wildlife killings further, and make ranching compatible with large-carnivore recovery in more landscapes.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–31',
        instruction: 'Reading Passage 3 has sections A–G. Which section contains the following information? Write the correct letter, A–G, in boxes 27–31 on your answer sheet.',
        note: 'NB You may use any letter more than once.',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        questions: [
          {
            number: 27,
            type: 'matching-paragraph',
            prompt: 'an example of how one predator has been protected by the introduction of livestock guard dogs',
            options: [],
            answer: 'c',
            explanation: 'C — cheetahs protected when farmers stop shooting.',
          },
          {
            number: 28,
            type: 'matching-paragraph',
            prompt: 'an optimistic suggestion about the possible positive developments in the use of livestock guard dogs',
            options: [],
            answer: 'g',
            explanation: 'G — optimistic future developments.',
          },
          {
            number: 29,
            type: 'matching-paragraph',
            prompt: 'a description of how the methods used by livestock guard dogs help to keep predators away',
            options: [],
            answer: 'b',
            explanation: 'B — bark, patrol, place themselves between threat and herd.',
          },
          {
            number: 30,
            type: 'matching-paragraph',
            prompt: 'claims by different academics that the use of livestock guard dogs is a successful way of protecting farmers\' herds',
            options: [],
            answer: 'd',
            explanation: 'D — academics claim successful protection of herds.',
          },
          {
            number: 31,
            type: 'matching-paragraph',
            prompt: 'a reference to how livestock guard dogs gain their skills',
            options: [],
            answer: 'a',
            explanation: 'A — gain skills through contact with livestock.',
          },
        ],
      },
      {
        range: 'Questions 32–36',
        instruction: 'Match each statement with the correct option, A–E. Write the correct letter in boxes 32–36 on your answer sheet.',
        type: 'matching-features',
        features: CAM_GUARD_DOGS_FEATURES,
        questions: [
          {
            number: 32,
            type: 'matching-features',
            prompt: 'The use of guard dogs may save the lives of both livestock and wild animals.',
            options: [],
            answer: 'a',
            explanation: 'A Dan Macon.',
          },
          {
            number: 33,
            type: 'matching-features',
            prompt: 'Claims of a change in behaviour from those using livestock guard dogs may not be totally accurate.',
            options: [],
            answer: 'd',
            explanation: 'D Julie Young.',
          },
          {
            number: 34,
            type: 'matching-features',
            prompt: 'There may be negative results if the use of livestock guard dogs is not sufficiently widespread.',
            options: [],
            answer: 'b',
            explanation: 'B Silvia Ribeiro.',
          },
          {
            number: 35,
            type: 'matching-features',
            prompt: 'Livestock guard dogs are the best way of protecting farm animals, as long as the dogs are appropriately handled.',
            options: [],
            answer: 'c',
            explanation: 'C Linda van Bommel.',
          },
          {
            number: 36,
            type: 'matching-features',
            prompt: 'Teaching a livestock guard dog how to do its work needs a different focus from teaching a house guard dog.',
            options: [],
            answer: 'e',
            explanation: 'E Bethany Smith.',
          },
        ],
      },
      {
        range: 'Questions 37–40',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        note: CAM_GUARD_DOGS_SUMMARY_NOTE,
        questions: gapQuestions(37, [
          { prompt: 'Gap (37)', answer: 'jackals', explanation: 'rise in deaths of other predators, particularly jackals.' },
          { prompt: 'Gap (38)', answer: 'diseases', explanation: 'dogs could have diseases which may affect other species.' },
          { prompt: 'Gap (39)', answer: 'food', explanation: 'reduce the amount of food available.' },
          { prompt: 'Gap (40)', answer: 'foxes', explanation: 'threatened by predators such as foxes.' },
        ]),
      },
    ],
  }
}

const CAM_WEGENER_WORD_BANK = [
  { id: 'a', label: 'modest fame' },
  { id: 'b', label: 'vast range' },
  { id: 'c', label: 'record-breaking achievement' },
  { id: 'd', label: 'research methods' },
  { id: 'e', label: 'select group' },
  { id: 'f', label: 'professional interests' },
  { id: 'g', label: 'scientific debate' },
  { id: 'h', label: 'hazardous exploration' },
  { id: 'i', label: 'biographer\'s perspective' },
  { id: 'j', label: 'narrow investigation' },
]

const CAM_WEGENER_SUMMARY_NOTE = [
  'Wegener\'s life and work:',
  '',
  'One of the remarkable things about Wegener from a 31________ is that although he proposed a theory of continental drift, he was not a geologist. His 32________ were limited to atmospheric physics. However, at the time he proposed his theory of continental drift in 1912, he was already a person of 33________. Six years previously, there had been his 34________ of 52 hours in a hot-air balloon, followed by his well-publicised but 35________ of Greenland\'s coast. With the publication of his textbook on thermodynamics, he had also come to the attention of a 36________ of German scientists.',
].join('\n')

/**
 * r3ysm — YNNG Q27–30 + Summary bank Q31–36 + MC Q37–40
 * Preview: Teamplate_Part3_14.jpg (Wegener / continental drift)
 */
export function ieltsReadingP3YnngSummaryMcPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'Alfred Wegener',
    passageSubtitle: 'The man behind continental drift',
    passage: [
      {
        text: 'From a biographer\'s perspective, one remarkable point about Alfred Wegener is that although he proposed continental drift, he was not a geologist. His professional interests were limited to atmospheric physics. Yet when he published the theory in 1912 he already had modest fame: six years earlier he had set a record-breaking achievement of 52 hours in a hot-air balloon, followed by hazardous exploration of Greenland\'s coast. His textbook on thermodynamics brought him to the attention of a select group of German scientists.',
      },
      {
        text: 'The writer notes that it is not clear that Wegener\'s ideas were widely disputed while he was alive in the way later textbooks sometimes suggest; the controversy grew more intense after his death. His methods mixed field observation with physics in ways that unsettled some contemporaries.',
      },
      {
        text: 'Mott T. Greene, writing in a later paragraph, focuses on what aspects of Wegener\'s life interested him most as a biographer: the breadth of careers Wegener pursued and the motives that drove him between exploration, meteorology and theory-building.',
      },
      {
        text: 'Modern plate tectonics eventually vindicated the core of continental drift, though the mechanisms Wegener proposed were incomplete. The case remains a classic example of how scientific debate can lag behind bold hypotheses.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–30',
        instruction: 'Do the following statements agree with the claims of the writer in the Reading Passage? In boxes 27–30 on your answer sheet, write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        type: 'ynng',
        questions: [
          {
            number: 27,
            type: 'yes-no-not-given',
            prompt: 'Wegener\'s ideas were widely disputed while he was alive.',
            options: [...YNNG_OPTIONS],
            answer: 'no',
            explanation: 'Writer says it is not clear they were widely disputed while he was alive.',
          },
          {
            number: 28,
            type: 'yes-no-not-given',
            prompt: 'Wegener was trained primarily as a geologist.',
            options: [...YNNG_OPTIONS],
            answer: 'no',
            explanation: 'He was not a geologist; interests in atmospheric physics.',
          },
          {
            number: 29,
            type: 'yes-no-not-given',
            prompt: 'The writer gives the exact number of scientists who attended every Wegener lecture.',
            options: [...YNNG_OPTIONS],
            answer: 'not-given',
            explanation: 'No such attendance figures.',
          },
          {
            number: 30,
            type: 'yes-no-not-given',
            prompt: 'Modern plate tectonics supports the core idea of continental drift.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Plate tectonics vindicated the core of continental drift.',
          },
        ],
      },
      {
        range: 'Questions 31–36',
        instruction: 'Complete the summary using the list of phrases, A–J, below.',
        type: 'summary-completion',
        note: CAM_WEGENER_SUMMARY_NOTE,
        wordBank: CAM_WEGENER_WORD_BANK,
        questions: [
          { number: 31, type: 'summary-completion', prompt: 'Gap (31)', options: [], answer: 'i', explanation: 'biographer\'s perspective' },
          { number: 32, type: 'summary-completion', prompt: 'Gap (32)', options: [], answer: 'f', explanation: 'professional interests' },
          { number: 33, type: 'summary-completion', prompt: 'Gap (33)', options: [], answer: 'a', explanation: 'modest fame' },
          { number: 34, type: 'summary-completion', prompt: 'Gap (34)', options: [], answer: 'c', explanation: 'record-breaking achievement' },
          { number: 35, type: 'summary-completion', prompt: 'Gap (35)', options: [], answer: 'h', explanation: 'hazardous exploration' },
          { number: 36, type: 'summary-completion', prompt: 'Gap (36)', options: [], answer: 'e', explanation: 'select group' },
        ],
      },
      {
        range: 'Questions 37–40',
        instruction: 'Choose the correct answer.',
        type: 'multiple-choice',
        questions: [
          {
            number: 37,
            type: 'multiple-choice',
            prompt: 'What is Mott T. Greene doing in the fifth paragraph?',
            options: [
              { id: 'a', label: 'describing what motivated him to write the book' },
              { id: 'b', label: 'explaining why it is desirable to read the whole book' },
              { id: 'c', label: 'suggesting why Wegener pursued so many different careers' },
              { id: 'd', label: 'indicating what aspects of Wegener\'s life interested him most' },
            ],
            answer: 'd',
            explanation: 'D — what aspects of Wegener\'s life interested him most.',
          },
          {
            number: 38,
            type: 'multiple-choice',
            prompt: 'According to the passage, Wegener\'s 1912 theory was notable because',
            options: [
              { id: 'a', label: 'he was already well known outside science.' },
              { id: 'b', label: 'he had never travelled to Greenland.' },
              { id: 'c', label: 'he rejected all physics.' },
              { id: 'd', label: 'he was a full-time geologist.' },
            ],
            answer: 'a',
            explanation: 'A — already a person of modest fame.',
          },
          {
            number: 39,
            type: 'multiple-choice',
            prompt: 'The writer mentions the hot-air balloon flight in order to',
            options: [
              { id: 'a', label: 'show Wegener\'s interest only in tourism.' },
              { id: 'b', label: 'illustrate a record-breaking achievement before 1912.' },
              { id: 'c', label: 'prove continental drift experimentally.' },
              { id: 'd', label: 'deny that he wrote a thermodynamics textbook.' },
            ],
            answer: 'b',
            explanation: 'B — record-breaking balloon flight six years previously.',
          },
          {
            number: 40,
            type: 'multiple-choice',
            prompt: 'Overall, the passage presents continental drift as',
            options: [
              { id: 'a', label: 'a hypothesis later supported in its core by plate tectonics.' },
              { id: 'b', label: 'a theory never discussed after 1912.' },
              { id: 'c', label: 'an idea invented by Mott T. Greene.' },
              { id: 'd', label: 'irrelevant to modern science.' },
            ],
            answer: 'a',
            explanation: 'A — plate tectonics vindicated the core idea.',
          },
        ],
      },
    ],
  }
}

/** r3ysb — ABS baseball (Teamplate_Part3_18.jpg) */
const R3YSB_ABS_WORD_BANK = [
  { id: 'a', label: 'pitch boundary' },
  { id: 'b', label: 'numerous disputes' },
  { id: 'c', label: 'team tactics' },
  { id: 'd', label: 'subjective assessment' },
  { id: 'e', label: 'widespread approval' },
  { id: 'f', label: 'former roles' },
  { id: 'g', label: 'total silence' },
  { id: 'h', label: 'perceived area' },
]

const R3YSB_ABS_SUMMARY_NOTE = [
  'Calls by the umpire',
  '',
  'Even after ABS was developed, MLB still wanted human umpires to shout out decisions as they had in their 33________. The umpire\'s job had, at one time, required a 34________ about whether a ball was a strike. A ball is considered a strike when the batter does not hit it and it crosses through a 35________ extending approximately from the batter\'s knee to his chest.',
  '',
  'In the past, 36________ over strike calls were not uncommon, but today everyone accepts the complete ban on pushing or shoving the umpire. One difference, however, is that during the first game DeJesus used ABS, strike calls were met with 37________.',
].join('\n')

/**
 * r3ysb — YNNG Q27–32 + Summary bank A–H Q33–37 + MC Q38–40
 * Preview: Teamplate_Part3_18.jpg (ABS / Automated Ball-Strike System)
 * Khác r3ysm: 6 YNNG + 5 bank gaps + 3 MC (r3ysm = 4 + 6 + 4)
 */
export function ieltsReadingP3YnngSummaryBankMcPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'The Automated Ball-Strike System',
    passageSubtitle: 'Technology and human judgement in professional baseball',
    passage: [
      {
        text: 'Major League Baseball has experimented with the Automated Ball-Strike System (ABS), which uses cameras and algorithms to call balls and strikes. When DeJesus first used ABS, he did not share decision-making about strikes with the system; ABS determined the call and the human umpire announced it. In earlier decades, fans and players often entertained themselves by arguing about umpires\' decisions, treating dispute as part of the spectacle of the game.',
      },
      {
        text: 'Umpires themselves are divided. DeJesus has spoken positively about the accuracy ABS can bring, whereas Porter has been more sceptical. Porter has said that relying on ABS diminished his enjoyment of being an umpire, because the craft of judging the zone felt central to the role. The writer notes that umpires\' decisions on plays at the bases are generally more reliable than those on strikes, where the zone is harder to judge by eye alone.',
      },
      {
        text: 'Part of the difficulty is that the size and shape of the strike zone can vary from one game to another when humans alone are calling pitches, depending on stance, height and how each umpire perceives the edges of the zone. Even after ABS was developed, MLB still wanted human umpires to shout out decisions as they had in their former roles. The umpire\'s job had, at one time, required a subjective assessment about whether a ball was a strike. A ball is considered a strike when the batter does not hit it and it crosses through a pitch boundary extending approximately from the batter\'s knee to his chest.',
      },
      {
        text: 'In the past, numerous disputes over strike calls were not uncommon, but today everyone accepts the complete ban on pushing or shoving the umpire. One difference, however, is that during the first game DeJesus used ABS, strike calls were met with total silence — the familiar roar of argument simply did not arise.',
      },
      {
        text: 'In the fifth paragraph the writer suggests that ABS may reduce some of the appeal of the game: the drama of human error and protest is part of what many spectators enjoy. That does not mean ABS is bound to make key decisions that are wrong, nor that human umpires will disappear overnight, nor that rule books must be rewritten immediately.',
      },
      {
        text: 'In the sixth paragraph the writer suggests there is little will to bring about fundamental change in the sport. Baseball\'s culture is conservative; technological tools may be trialled, but wholesale redesign of traditions meets resistance. Progress on ABS continues in limited trials, yet the broader debate about technology in baseball remains unsettled.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–32',
        instruction: 'Do the following statements agree with the claims of the writer in the Reading Passage? In boxes 27–32 on your answer sheet, write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        type: 'ynng',
        questions: [
          {
            number: 27,
            type: 'yes-no-not-given',
            prompt: 'When DeJesus first used ABS, he shared decision-making about strikes with it.',
            options: [...YNNG_OPTIONS],
            answer: 'no',
            explanation: 'ABS determined the call; he did not share decision-making with the system.',
          },
          {
            number: 28,
            type: 'yes-no-not-given',
            prompt: 'In the past, people used to entertain themselves by arguing about umpires\' decisions.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Fans and players entertained themselves by arguing about umpires\' decisions.',
          },
          {
            number: 29,
            type: 'yes-no-not-given',
            prompt: 'DeJesus and Porter have different attitudes towards ABS.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'DeJesus positive; Porter more sceptical.',
          },
          {
            number: 30,
            type: 'yes-no-not-given',
            prompt: 'ABS diminished Porter\'s enjoyment of being an umpire.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Porter said ABS diminished his enjoyment of being an umpire.',
          },
          {
            number: 31,
            type: 'yes-no-not-given',
            prompt: 'Umpires\' decisions on plays at the bases are more reliable than those on strikes.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Writer notes base decisions are more reliable than strike calls.',
          },
          {
            number: 32,
            type: 'yes-no-not-given',
            prompt: 'The size and shape of the strike zone can vary from one game to another.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Human-called zone can vary game to game.',
          },
        ],
      },
      {
        range: 'Questions 33–37',
        instruction: 'Complete the summary using the list of phrases, A–H, below.',
        type: 'summary-completion',
        note: R3YSB_ABS_SUMMARY_NOTE,
        wordBank: R3YSB_ABS_WORD_BANK,
        questions: [
          { number: 33, type: 'summary-completion', prompt: 'Gap (33)', options: [], answer: 'f', explanation: 'former roles' },
          { number: 34, type: 'summary-completion', prompt: 'Gap (34)', options: [], answer: 'd', explanation: 'subjective assessment' },
          { number: 35, type: 'summary-completion', prompt: 'Gap (35)', options: [], answer: 'a', explanation: 'pitch boundary' },
          { number: 36, type: 'summary-completion', prompt: 'Gap (36)', options: [], answer: 'b', explanation: 'numerous disputes' },
          { number: 37, type: 'summary-completion', prompt: 'Gap (37)', options: [], answer: 'g', explanation: 'total silence' },
        ],
      },
      {
        range: 'Questions 38–40',
        instruction: 'Choose the correct answer.',
        type: 'multiple-choice',
        questions: [
          {
            number: 38,
            type: 'multiple-choice',
            prompt: 'What does the writer suggest about ABS in the fifth paragraph?',
            options: [
              { id: 'a', label: 'It is bound to make key decisions that are wrong.' },
              { id: 'b', label: 'It may reduce some of the appeal of the game.' },
              { id: 'c', label: 'It will lead to the disappearance of human umpires.' },
              { id: 'd', label: 'It may increase calls for the rules of baseball to be changed.' },
            ],
            answer: 'b',
            explanation: 'B — may reduce some of the appeal of the game.',
          },
          {
            number: 39,
            type: 'multiple-choice',
            prompt: 'In the sixth paragraph, what does the writer suggest about baseball?',
            options: [
              { id: 'a', label: 'Its rules should be consistent with those of other sports.' },
              { id: 'b', label: 'Technological innovation has made the rules harder to enforce.' },
              { id: 'c', label: 'Progress is being made on improvements to ABS.' },
              { id: 'd', label: 'There is little will to bring about change in the sport.' },
            ],
            answer: 'd',
            explanation: 'D — little will to bring about fundamental change.',
          },
          {
            number: 40,
            type: 'multiple-choice',
            prompt: 'What would be a suitable title for this text?',
            options: [
              { id: 'a', label: 'A debate about the use of technology in baseball' },
              { id: 'b', label: 'An analysis of the strengths and weaknesses of ABS' },
              { id: 'c', label: 'An account of one baseball player\'s research into ABS' },
              { id: 'd', label: 'A recommendation that other sports should adopt ABS' },
            ],
            answer: 'a',
            explanation: 'A — debate about technology in baseball (ABS vs human judgement).',
          },
        ],
      },
    ],
  }
}

/** r3hmy — Headings Q27–32 + MC Q33–35 + YNNG Q36–40 (AI attitudes) */
export function ieltsReadingP3HeadingsMcYnngPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'Attitudes to artificial intelligence',
    passageSubtitle: 'How public trust and doubt shape the adoption of AI',
    passage: [
      {
        label: 'A',
        text: 'Public debate about artificial intelligence has intensified. Many people highlight risks in sci-fi films and automation, framing AI as a problem that society must confront. The writer of Section A is chiefly highlighting the existence of a problem rather than offering a full solution.',
      },
      {
        label: 'B',
        text: 'Surveys show an increasing divergence of attitudes towards AI: some celebrate breakthroughs while others fear job losses and loss of control. This split has grown wider as systems become more visible in daily life.',
      },
      {
        label: 'C',
        text: 'People often place more faith in human judgement than in AI, citing opacity, bias in training data, and the difficulty of holding algorithms accountable when mistakes cause harm.',
      },
      {
        label: 'D',
        text: 'Yet in some domains AI projections outperform human forecasts. Where large data sets exist, models can spot patterns that individuals miss, though experts still stress careful validation.',
      },
      {
        label: 'E',
        text: 'Involving users in AI processes can improve acceptance. When people understand how recommendations are generated and can correct them, trust rises and systems become more useful in practice.',
      },
      {
        label: 'F',
        text: 'Despite pockets of success, widespread distrust of some AI innovations remains. Encouraging openness about how AI functions is one response authorities and companies promote to reduce fear without ignoring real risks.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–32',
        instruction: 'Reading Passage 3 has paragraphs A–F. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–viii, in boxes 27–32 on your answer sheet.',
        note: 'There are more headings than paragraphs, so you will not use all of them.',
        type: 'matching-headings',
        headings: CAM_AI_ATTITUDES_HEADINGS,
        questions: [
          { number: 27, type: 'matching-headings', prompt: 'Paragraph A', options: [], answer: 'vi', explanation: 'Widespread distrust / problem framing of AI.' },
          { number: 28, type: 'matching-headings', prompt: 'Paragraph B', options: [], answer: 'i', explanation: 'Increasing divergence of attitudes.' },
          { number: 29, type: 'matching-headings', prompt: 'Paragraph C', options: [], answer: 'ii', explanation: 'More faith in human judgement than AI.' },
          { number: 30, type: 'matching-headings', prompt: 'Paragraph D', options: [], answer: 'iii', explanation: 'AI projections superior in some domains.' },
          { number: 31, type: 'matching-headings', prompt: 'Paragraph E', options: [], answer: 'v', explanation: 'Advantages of involving users.' },
          { number: 32, type: 'matching-headings', prompt: 'Paragraph F', options: [], answer: 'vii', explanation: 'Encouraging openness about how AI functions.' },
        ],
      },
      {
        range: 'Questions 33–35',
        instruction: 'Choose the correct answer.',
        type: 'multiple-choice',
        questions: [
          {
            number: 33,
            type: 'multiple-choice',
            prompt: 'What is the writer doing in Section A?',
            options: [
              { id: 'a', label: 'providing a solution to a concern' },
              { id: 'b', label: 'justifying an opinion about an issue' },
              { id: 'c', label: 'highlighting the existence of a problem' },
              { id: 'd', label: 'explaining the reasons for a phenomenon' },
            ],
            answer: 'c',
            explanation: 'C — highlighting the existence of a problem.',
          },
          {
            number: 34,
            type: 'multiple-choice',
            prompt: 'According to the passage, people often trust human judgement more than AI because',
            options: [
              { id: 'a', label: 'AI never outperforms human forecasts.' },
              { id: 'b', label: 'algorithms can be hard to hold accountable.' },
              { id: 'c', label: 'sci-fi films always show AI positively.' },
              { id: 'd', label: 'users cannot correct AI recommendations.' },
            ],
            answer: 'b',
            explanation: 'B — difficulty of holding algorithms accountable.',
          },
          {
            number: 35,
            type: 'multiple-choice',
            prompt: 'What does the writer say can improve acceptance of AI?',
            options: [
              { id: 'a', label: 'hiding how recommendations are generated' },
              { id: 'b', label: 'involving users in AI processes' },
              { id: 'c', label: 'banning automation in the workplace' },
              { id: 'd', label: 'using only human forecasts' },
            ],
            answer: 'b',
            explanation: 'B — involving users improves acceptance.',
          },
        ],
      },
      {
        range: 'Questions 36–40',
        instruction: 'Do the following statements agree with the claims of the writer in the Reading Passage? In boxes 36–40 on your answer sheet, write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        type: 'ynng',
        questions: [
          {
            number: 36,
            type: 'yes-no-not-given',
            prompt: 'Subjective depictions of AI in sci-fi films make people change their opinions about automation.',
            options: [...YNNG_OPTIONS],
            answer: 'not given',
            explanation: 'Passage mentions sci-fi framing risk — không claim films make people change opinions.',
          },
          {
            number: 37,
            type: 'yes-no-not-given',
            prompt: 'Attitudes towards AI have become more divided as systems become more visible.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Increasing divergence … as systems become more visible.',
          },
          {
            number: 38,
            type: 'yes-no-not-given',
            prompt: 'AI projections are always less accurate than human forecasts.',
            options: [...YNNG_OPTIONS],
            answer: 'no',
            explanation: 'In some domains AI projections outperform human forecasts.',
          },
          {
            number: 39,
            type: 'yes-no-not-given',
            prompt: 'User involvement can increase trust in AI systems.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'When people understand and can correct systems, trust rises.',
          },
          {
            number: 40,
            type: 'yes-no-not-given',
            prompt: 'Governments have banned all AI innovation due to distrust.',
            options: [...YNNG_OPTIONS],
            answer: 'not given',
            explanation: 'Distrust remains; openness promoted — không nói ban all innovation.',
          },
        ],
      },
    ],
  }
}

/** Silbo Gomero — notes Q20–26: 3 section + bullets (ép ngắt dòng) */
export const CAM_SILBO_NOTE_PASSAGE: ReadingNotePassageBlock[] = [
  { type: 'section', text: 'How Silbo is produced' },
  { type: 'static', text: '• high- and low-frequency tones represent different sounds in Spanish ' },
  { type: 'gap', number: 20 },
  { type: 'static', text: '• pitch of whistle is controlled using silbador\'s ' },
  { type: 'gap', number: 21 },
  { type: 'static', text: '• ' },
  { type: 'gap', number: 22 },
  { type: 'static', text: ' is changed with a cupped hand' },
  { type: 'break' },
  { type: 'section', text: 'How Silbo is used' },
  { type: 'static', text: '• has long been used by shepherds and people living in secluded locations' },
  { type: 'static', text: '• in everyday use for the transmission of brief ' },
  { type: 'gap', number: 23 },
  { type: 'static', text: '• can relay essential information quickly, e.g. to inform people about ' },
  { type: 'gap', number: 24 },
  { type: 'break' },
  { type: 'section', text: 'The future of Silbo' },
  { type: 'static', text: '• future under threat because of new ' },
  { type: 'gap', number: 25 },
  { type: 'static', text: '• Canaries\' authorities hoping to receive a UNESCO ' },
  { type: 'gap', number: 26 },
  { type: 'static', text: ' to help preserve it' },
]

const CAM_FOREST_CUT_FEATURES = [
  { id: 'a', name: 'a TSI cut' },
  { id: 'b', name: 'a Salvage cut' },
  { id: 'c', name: 'a Shelterwood cut' },
]

const CAM_AI_HEALTH_WORD_BANK = [
  { id: 'a', label: 'medical practitioners' },
  { id: 'b', label: 'specialised tasks' },
  { id: 'c', label: 'available resources' },
  { id: 'd', label: 'reduced illness' },
  { id: 'e', label: 'professional authority' },
  { id: 'f', label: 'technology experts' },
]

const CAM_AI_HEALTH_SUMMARY_NOTE = [
  'Using AI in the UK health system',
  '',
  'AI currently has a limited role in the way 24________ are allocated in the health service. The positive aspect of AI having a bigger role is that it would be more efficient and lead to patient benefits. However, such a change would result, for example, in certain 25________ not having their current level of 26________. It is therefore important that AI goals are appropriate so that discriminatory practices could be avoided.',
].join('\n')

/** Headings i–viii (7 đoạn A–G → dư 1 heading) — Teamplate_Part2_15 */
const CAM_STEAM_CAR_HEADINGS = [
  { id: 'i', label: 'A period in cold conditions before the technology is assessed' },
  { id: 'ii', label: 'A comparison of the cost of two types of vehicle' },
  { id: 'iii', label: 'How the steam car first became popular' },
  { id: 'iv', label: 'Reasons why steam cars disappeared from mass use' },
  { id: 'v', label: 'Technical strengths of a later steam design' },
  { id: 'vi', label: 'Environmental rules that modern steam cars can meet' },
  { id: 'vii', label: 'A company that failed after changing its models often' },
  { id: 'viii', label: 'Why some enthusiasts still drive historic steam cars' },
]

/** Summary Q24–26 — cùng format r2hm (tiêu đề + đoạn liền + 24________) */
const CAM_MODEL_E_SUMMARY_NOTE = [
  'The Model E',
  '',
  'The Model E was road-tested in 1924 by the Automobile Club of America. They found it easy to drive, despite its weight, and it impressed the spectators. A later version of the Model E raised its 24________, while keeping its emissions extremely low. '
  + 'The steam car was too expensive for many people and its design was constantly being altered. Under 25________ cars were produced before the company went out of business. However, even today, there are Model Es on the road in the US. They are straightforward to maintain, and they satisfy California\'s 26________ emissions laws. Perhaps today\'s technology and materials would help us revive the steam car.',
].join('\n')

const CAM_GROWTH_MINDSET_FEATURES = [
  { id: 'a', name: 'Alfred Binet' },
  { id: 'b', name: 'Carol Dweck' },
  { id: 'c', name: 'Andrew Gelman' },
  { id: 'd', name: 'Timothy Bates' },
  { id: 'e', name: 'David Yeager and Gregory Walton' },
]

const CAM_ATHLETES_STRESS_CHOOSE_TWO_RADUCANU = [
  { id: 'a', label: 'the stage at which she dropped out of the tournament' },
  { id: 'b', label: 'symptoms of her performance stress at the tournament' },
  { id: 'c', label: 'measures she took to control her stress levels' },
  { id: 'd', label: 'aspects of the Wimbledon tournament which increased her stress levels' },
  { id: 'e', label: 'reactions to her posts on social media' },
]

const CAM_ATHLETES_STRESS_CHOOSE_TWO_ANXIETY = [
  { id: 'a', label: 'how severe it may be depends on a person\'s demands and resources' },
  { id: 'b', label: 'how long it takes for its effects to become apparent' },
  { id: 'c', label: 'which of its symptoms are the most common' },
  { id: 'd', label: 'which types of athletes are most likely to suffer from it' },
  { id: 'e', label: 'what can happen if athletes experience it too often' },
]

/**
 * r2msc — Match đoạn Q14–18 + Sentence Q19–22 + 2× Choose TWO Q23–26
 * Preview: Teamplate_Part2_17.jpg (Athletes and stress / Cam19 T2 P2)
 */
export function ieltsReadingP2MatchSentenceChooseTwoPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'Athletes and stress',
    passageSubtitle: 'How performance pressure affects mind and body',
    passage: [
      {
        label: 'A',
        text: 'It isn\'t easy being a professional athlete. Not only are the physical demands greater than most people could handle, athletes also face intense psychological pressure during competition. This is something that British tennis player Emma Raducanu wrote about on social media following her withdrawal from the 2021 Wimbledon tournament. Though the young player had been doing well in the tournament, she began having difficulty regulating her breathing and heart rate during a match, which she later attributed to \'the accumulation of the excitement and the buzz\'.',
      },
      {
        label: 'B',
        text: 'For athletes, some level of performance stress is almost unavoidable. But there are many different factors that dictate just how people\'s minds and bodies respond to stressful events. Typically, stress is the result of an exchange between two factors: demands and resources. An athlete may feel stressed about an event if they feel the demands on them are greater than they can handle. These demands include the high level of physical and mental effort required to succeed, and also the athlete\'s concerns about the difficulty of the event, their chance of succeeding, and any potential dangers such as injury. Resources, on the other hand, are a person\'s ability to cope with these demands. These include factors such as the competitor\'s degree of confidence, how much they believe they can control the situation\'s outcome, and whether they\'re looking forward to the event or not.',
      },
      {
        label: 'C',
        text: 'Each new demand or change in circumstances affects whether a person responds positively or negatively to stress. Typically, the more resources a person feels they have in handling the situation, the more positive their stress response. This positive stress response is called a challenge state. But should the person feel there are too many demands placed on them, the more likely they are to experience a negative stress response — known as a threat state. Research shows that the challenge states lead to good performance, while threat states lead to poorer performance. So, in Emma Raducanu\'s case, a much larger audience, higher expectations and facing a more skilful opponent, may all have led her to feel there were greater demands being placed on her at Wimbledon — but she didn\'t have the resources to tackle them. This led to her experiencing a threat response.',
      },
      {
        label: 'D',
        text: 'Our challenge and threat responses essentially influence how our body responds to stressful situations, as both affect the production of adrenaline and cortisol — also known as \'stress hormones\'. During a challenge state, adrenaline increases the amount of blood pumped from the heart and expands the blood vessels, which allows more energy to be delivered to the muscles and brain. This increase of blood and decrease of pressure in the blood vessels has been consistently related to superior sport performance in everything from cricket batting, to golf putting and football penalty taking. But during a threat state, cortisol inhibits the positive effect of adrenaline, resulting in tighter blood vessels, higher blood pressure, slower psychological responses, and a faster heart rate. In short, a threat state makes people more anxious — they make worse decisions and perform more poorly. In tennis players, cortisol has been associated with more unsuccessful serves and greater anxiety.',
      },
      {
        label: 'E',
        text: 'That said, anxiety is also a common experience for athletes when they\'re under pressure. Anxiety can increase heart rate and perspiration, cause heart palpitations, muscle tremors and shortness of breath, as well as headaches, nausea, stomach pain, weakness and a desire to escape in more extreme cases. Anxiety can also reduce concentration and self-control and cause overthinking. The intensity with which a person experiences anxiety depends on the demands and resources they have. Anxiety may also manifest itself in the form of excitement or nervousness depending on the stress response. Negative stress responses can be damaging to both physical and mental health — and repeated episodes of anxiety coupled with negative responses can increase risk of heart disease and depression.',
      },
      {
        label: 'F',
        text: 'But there are many ways athletes can ensure they respond positively under pressure. Positive stress responses can be promoted through the language that they and others — such as coaches or parents — use. Psychologists can also help athletes change how they see their physiological responses — such as helping them see a higher heart rate as excitement, rather than nerves. Developing psychological skills, such as visualisation, can also help decrease physiological responses to threat. Visualisation may involve the athlete recreating a mental picture of a time when they performed well, or picturing themselves doing well in the future. This can help create a feeling of control over the stressful event. Recreating competitive pressure during training can also help athletes learn how to deal with stress. An example of this might be scoring athletes against their peers to create a sense of competition. This would increase the demands which players experience compared to a normal training session, while still allowing them to practise coping with stress.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–18',
        instruction: 'Reading Passage 2 has six paragraphs, A–F. Which paragraph contains the following information? Write the correct letter, A–F, in boxes 14–18 on your answer sheet.',
        note: 'NB You may use any letter more than once.',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F'],
        questions: [
          {
            number: 14,
            type: 'matching-paragraph',
            prompt: 'reference to two chemical compounds which impact on performance',
            options: [],
            answer: 'd',
            explanation: 'D — adrenaline and cortisol (stress hormones) and performance.',
          },
          {
            number: 15,
            type: 'matching-paragraph',
            prompt: 'examples of strategies for minimising the effects of stress',
            options: [],
            answer: 'f',
            explanation: 'F — language, psychologists, visualisation, recreating pressure.',
          },
          {
            number: 16,
            type: 'matching-paragraph',
            prompt: 'how a sportsperson accounted for their own experience of stress',
            options: [],
            answer: 'a',
            explanation: 'A — Emma Raducanu attributed symptoms to excitement and the buzz.',
          },
          {
            number: 17,
            type: 'matching-paragraph',
            prompt: 'study results indicating links between stress responses and performance',
            options: [],
            answer: 'c',
            explanation: 'C — research shows challenge vs threat states and performance.',
          },
          {
            number: 18,
            type: 'matching-paragraph',
            prompt: 'mention of people who can influence how athletes perceive their stress responses',
            options: [],
            answer: 'f',
            explanation: 'F — coaches, parents, psychologists influence perception.',
          },
        ],
      },
      {
        range: 'Questions 19–22',
        instruction: 'Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'sentence-completion',
        questions: sentenceQuestions(19, [
          {
            prompt: 'Performance stress involves many demands on the athlete, for example, coping with the possible risk of ______.',
            answer: 'injury',
            explanation: 'demands … potential dangers such as injury.',
          },
          {
            prompt: 'Cortisol can cause tennis players to produce fewer good ______.',
            answer: 'serves',
            explanation: 'more unsuccessful serves.',
          },
          {
            prompt: 'Psychologists can help athletes to view their physiological responses as the effect of a positive feeling such as ______.',
            answer: 'excitement',
            explanation: 'see a higher heart rate as excitement, rather than nerves.',
          },
          {
            prompt: '______ is an example of a psychological technique which can reduce an athlete\'s stress responses.',
            answer: 'visualisation|visualization',
            explanation: 'psychological skills such as visualisation.',
          },
        ]),
      },
      {
        range: 'Questions 23–24',
        instruction: 'Choose TWO correct answers, A–E.',
        type: 'multiple-choice',
        questions: [
          {
            number: 23,
            type: 'multiple-choice',
            prompt: 'Which TWO facts about Emma Raducanu\'s withdrawal from the Wimbledon tournament are mentioned in the text? (first answer)',
            options: [...CAM_ATHLETES_STRESS_CHOOSE_TWO_RADUCANU],
            answer: 'b',
            explanation: 'B — symptoms: difficulty regulating breathing and heart rate.',
          },
          {
            number: 24,
            type: 'multiple-choice',
            prompt: 'Which TWO facts about Emma Raducanu\'s withdrawal from the Wimbledon tournament are mentioned in the text? (second answer)',
            options: [...CAM_ATHLETES_STRESS_CHOOSE_TWO_RADUCANU],
            answer: 'd',
            explanation: 'D — larger audience, higher expectations, more skilful opponent.',
          },
        ],
      },
      {
        range: 'Questions 25–26',
        instruction: 'Choose TWO correct answers, A–E.',
        type: 'multiple-choice',
        questions: [
          {
            number: 25,
            type: 'multiple-choice',
            prompt: 'Which TWO facts about anxiety are mentioned in Paragraph E of the text? (first answer)',
            options: [...CAM_ATHLETES_STRESS_CHOOSE_TWO_ANXIETY],
            answer: 'a',
            explanation: 'A — intensity depends on demands and resources.',
          },
          {
            number: 26,
            type: 'multiple-choice',
            prompt: 'Which TWO facts about anxiety are mentioned in Paragraph E of the text? (second answer)',
            options: [...CAM_ATHLETES_STRESS_CHOOSE_TWO_ANXIETY],
            answer: 'e',
            explanation: 'E — repeated episodes increase risk of heart disease and depression.',
          },
        ],
      },
    ],
  }
}

/**
 * r2mfy — MC Q14–16 + Features Q17–22 + YNNG Q23–26
 * Preview: Teamplate_Part2_16.jpg (Growth mindset)
 */
export function ieltsReadingP2McFeaturesYnngPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'The growth mindset',
    passageSubtitle: 'How ideas about intelligence have changed',
    passage: [
      {
        text: 'Ideas about the nature of intelligence began to shift when thinkers moved away from the view that ability is fixed at birth. Early debates asked whether intellectual ability is an unchangeable feature of each individual, a position associated with older testing traditions.',
      },
      {
        text: 'Alfred Binet developed early intelligence tests and was careful not to claim that scores captured a fixed trait for life. Carol Dweck later popularised the growth mindset: the belief that ability can develop through effort. She has argued that the idea has sometimes been incorrectly interpreted as mere cheerleading, and that the growth mindset is not simply about boosting students\' morale.',
      },
      {
        text: 'Andrew Gelman has questioned whether the methodology behind some growth mindset studies was strict enough. Timothy Bates has reported research suggesting little effect on academic achievement in certain replications. David Yeager and Gregory Walton have explored how growth-mindset messages might be delivered, including whether the idea should be promoted without students being fully aware of the intervention.',
      },
      {
        text: 'The writer notes that claims about mindsets must be weighed carefully. While some results are promising, it is not always clear how far findings generalise across schools and age groups.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–16',
        instruction: 'Choose the correct answer.',
        type: 'multiple-choice',
        questions: [
          {
            number: 14,
            type: 'multiple-choice',
            prompt: 'What can we learn from the first paragraph?',
            options: [
              { id: 'a', label: 'where the notion of innate intelligence first began' },
              { id: 'b', label: 'when ideas about the nature of intelligence began to shift' },
              { id: 'c', label: 'how scientists have responded to changing views of intelligence' },
              { id: 'd', label: 'why thinkers turned away from the idea of intelligence being fixed' },
            ],
            answer: 'b',
            explanation: 'B — when ideas about the nature of intelligence began to shift (SAMPLE).',
          },
          {
            number: 15,
            type: 'multiple-choice',
            prompt: 'According to the passage, early debates about intelligence often focused on whether ability is',
            options: [
              { id: 'a', label: 'unrelated to testing.' },
              { id: 'b', label: 'fixed for each individual.' },
              { id: 'c', label: 'only measured by schools.' },
              { id: 'd', label: 'identical across cultures.' },
            ],
            answer: 'b',
            explanation: 'B — unchangeable / fixed feature of each individual.',
          },
          {
            number: 16,
            type: 'multiple-choice',
            prompt: 'The writer suggests that claims about the growth mindset',
            options: [
              { id: 'a', label: 'need careful evaluation.' },
              { id: 'b', label: 'have been fully proven worldwide.' },
              { id: 'c', label: 'should replace all exams.' },
              { id: 'd', label: 'apply only to adults.' },
            ],
            answer: 'a',
            explanation: 'A — claims must be weighed carefully.',
          },
        ],
      },
      {
        range: 'Questions 17–22',
        instruction: 'Match each statement with the correct option, A–E. Write the correct letter in boxes 17–22 on your answer sheet.',
        note: 'NB You may use any letter more than once.',
        type: 'matching-features',
        features: CAM_GROWTH_MINDSET_FEATURES,
        questions: [
          {
            number: 17,
            type: 'matching-features',
            prompt: 'The methodology behind the growth mindset studies was not strict enough.',
            options: [],
            answer: 'c',
            explanation: 'Andrew Gelman — methodology not strict enough.',
          },
          {
            number: 18,
            type: 'matching-features',
            prompt: 'The idea of the growth mindset has been incorrectly interpreted.',
            options: [],
            answer: 'b',
            explanation: 'Carol Dweck — incorrectly interpreted.',
          },
          {
            number: 19,
            type: 'matching-features',
            prompt: 'Intellectual ability is an unchangeable feature of each individual.',
            options: [],
            answer: 'a',
            explanation: 'Associated with older testing traditions / Binet context (SAMPLE).',
          },
          {
            number: 20,
            type: 'matching-features',
            prompt: 'The growth mindset should be promoted without students being aware of it.',
            options: [],
            answer: 'e',
            explanation: 'Yeager and Walton — without students being aware.',
          },
          {
            number: 21,
            type: 'matching-features',
            prompt: 'The growth mindset is not simply about boosting students\' morale.',
            options: [],
            answer: 'b',
            explanation: 'Carol Dweck — not simply about morale.',
          },
          {
            number: 22,
            type: 'matching-features',
            prompt: 'Research shows that the growth mindset has no effect on academic achievement.',
            options: [],
            answer: 'd',
            explanation: 'Timothy Bates — little/no effect on achievement.',
          },
        ],
      },
      {
        range: 'Questions 23–26',
        instruction: 'Do the following statements agree with the claims of the writer in the Reading Passage? In boxes 23–26 on your answer sheet, write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        type: 'ynng',
        questions: [
          {
            number: 23,
            type: 'yes-no-not-given',
            prompt: 'Ideas about intelligence have remained completely unchanged for centuries.',
            options: [...YNNG_OPTIONS],
            answer: 'no',
            explanation: 'Writer says ideas began to shift.',
          },
          {
            number: 24,
            type: 'yes-no-not-given',
            prompt: 'Some findings about mindsets should be generalised carefully across schools.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Writer notes it is not always clear how far findings generalise.',
          },
          {
            number: 25,
            type: 'yes-no-not-given',
            prompt: 'The writer provides exact national test scores for every growth-mindset trial.',
            options: [...YNNG_OPTIONS],
            answer: 'not-given',
            explanation: 'No exact national scores given.',
          },
          {
            number: 26,
            type: 'yes-no-not-given',
            prompt: 'All researchers agree that growth mindset always improves grades.',
            options: [...YNNG_OPTIONS],
            answer: 'no',
            explanation: 'Passage presents criticism and mixed evidence.',
          },
        ],
      },
    ],
  }
}

/**
 * r2hmc — Headings Q14–20 + MC Q21–23 + Summary Q24–26
 * Cùng pattern r2hm (headings + summary note đầy đủ + MC), thứ tự: headings → MC → summary
 * Preview: Teamplate_Part2_15.jpg (Steam car / Model E)
 */
export function ieltsReadingP2HeadingsMcSummaryPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'The steam car',
    passageSubtitle: 'From early popularity to the Model E',
    passage: [
      {
        label: 'A',
        text: 'Before any new steam technology is assessed in detail, engines may sit idle for long periods in cold conditions. Starting and warming procedures matter as much as peak performance on the road, and early test reports often began with how long it took to build boiler pressure.',
      },
      {
        label: 'B',
        text: 'Early steam cars enjoyed a brief period of success at the turn of the twentieth century. Their success was short-lived as petrol cars improved in reliability and range, even though some drivers found steamers pleasant to handle once warm and relatively quiet on open roads.',
      },
      {
        label: 'C',
        text: 'Compared with petrol models of the same era, steam cars were often more expensive to buy and run. Fuel and maintenance costs limited their market beyond enthusiasts, and manufacturers struggled to match the falling prices of mass-produced petrol vehicles.',
      },
      {
        label: 'D',
        text: 'Mass-market steam cars disappeared for several reasons: long warm-up times, the need for a reliable water supply, and the rapid progress of the internal combustion engine. By the 1920s few companies still offered steamers as everyday transport.',
      },
      {
        label: 'E',
        text: 'Later designs such as the Model E raised top speed while keeping emissions extremely low. Testers from the Automobile Club of America in 1924 found the car easy to drive despite its weight, and spectators were impressed by its smooth performance on the road.',
      },
      {
        label: 'F',
        text: 'One company altered its design constantly and produced under 600 cars before going out of business. Even so, some Model Es remain on US roads today. They are straightforward to maintain and can meet California\'s strict emissions laws, which few historic vehicles can claim.',
      },
      {
        label: 'G',
        text: 'Enthusiasts still maintain historic steam cars because they demonstrate that clean steam propulsion once competed seriously with petrol. Some owners argue that modern materials and controls could help revive the steam car for specialist uses.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–20',
        instruction: 'Reading Passage 2 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–viii, in boxes 14–20 on your answer sheet.',
        note: 'There are more headings than paragraphs, so you will not use all of them.',
        type: 'matching-headings',
        headings: CAM_STEAM_CAR_HEADINGS,
        questions: [
          { number: 14, type: 'matching-headings', prompt: 'Paragraph A', options: [], answer: 'i', explanation: 'Cold conditions before the technology is assessed.' },
          { number: 15, type: 'matching-headings', prompt: 'Paragraph B', options: [], answer: 'iii', explanation: 'How the steam car first became popular / short-lived success.' },
          { number: 16, type: 'matching-headings', prompt: 'Paragraph C', options: [], answer: 'ii', explanation: 'Comparison of the cost of two types of vehicle.' },
          { number: 17, type: 'matching-headings', prompt: 'Paragraph D', options: [], answer: 'iv', explanation: 'Reasons why steam cars disappeared from mass use.' },
          { number: 18, type: 'matching-headings', prompt: 'Paragraph E', options: [], answer: 'v', explanation: 'Technical strengths of a later steam design (Model E).' },
          { number: 19, type: 'matching-headings', prompt: 'Paragraph F', options: [], answer: 'vii', explanation: 'Company failed after changing models; under 600 cars.' },
          { number: 20, type: 'matching-headings', prompt: 'Paragraph G', options: [], answer: 'viii', explanation: 'Enthusiasts still drive / maintain historic steam cars.' },
        ],
      },
      {
        range: 'Questions 21–23',
        instruction: 'Choose the correct letter, A, B, C or D.',
        type: 'multiple-choice',
        questions: [
          {
            number: 21,
            type: 'multiple-choice',
            prompt: 'What point does the writer make about the steam car in Paragraph B?',
            options: [
              { id: 'a', label: 'Its success was short-lived.' },
              { id: 'b', label: 'Not enough cars were made.' },
              { id: 'c', label: 'Car companies found them hard to sell.' },
              { id: 'd', label: 'People found them hard to drive.' },
            ],
            answer: 'a',
            explanation: 'A — success was short-lived as petrol cars improved.',
          },
          {
            number: 22,
            type: 'multiple-choice',
            prompt: 'According to the passage, a major problem for early steam cars was',
            options: [
              { id: 'a', label: 'that they could never meet emissions laws.' },
              { id: 'b', label: 'long warm-up times and competition from petrol cars.' },
              { id: 'c', label: 'that no clubs ever tested them.' },
              { id: 'd', label: 'that they weighed less than petrol cars.' },
            ],
            answer: 'b',
            explanation: 'B — warm-up times and progress of internal combustion engines.',
          },
          {
            number: 23,
            type: 'multiple-choice',
            prompt: 'What is said about the later Model E?',
            options: [
              { id: 'a', label: 'It raised speed while keeping emissions low.' },
              { id: 'b', label: 'It was never road-tested in the US.' },
              { id: 'c', label: 'It used more fuel than early steamers.' },
              { id: 'd', label: 'It could not impress spectators in 1924.' },
            ],
            answer: 'a',
            explanation: 'A — raised top speed while keeping emissions extremely low.',
          },
        ],
      },
      {
        range: 'Questions 24–26',
        instruction: 'Complete the summary below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.',
        type: 'gap-fill',
        note: CAM_MODEL_E_SUMMARY_NOTE,
        questions: gapQuestions(24, [
          { prompt: 'Gap (24)', answer: 'speed', explanation: 'raised its speed, while keeping emissions low.' },
          { prompt: 'Gap (25)', answer: '600', explanation: 'Under 600 cars were produced.' },
          { prompt: 'Gap (26)', answer: 'strict', explanation: 'California\'s strict emissions laws.' },
        ]),
      },
    ],
  }
}

/**
 * r2mys — MC Q14–19 + YNNG Q20–23 + Summary word bank Q24–26
 * Preview: Teamplate_Part2_14.jpg (AI / UK health system)
 */
export function ieltsReadingP2McYnngSummaryPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'Artificial intelligence and society',
    passageSubtitle: 'Progress, morals and the UK health service',
    passage: [
      {
        text: 'It is difficult to predict how quickly AI will progress. Chess machines show how specialised systems can outperform humans, but experts still disagree on which specialised tasks AI will master next, and whether the future will place real limits on its capabilities.',
      },
      {
        text: 'Some writers worry that machines with the ability to make moral decisions may prevent us from promoting the interests of our communities if algorithms optimise for goals that conflict with social values. Others argue AI can free professionals for more human work.',
      },
      {
        text: 'In the UK health system, AI currently has a limited role in the way available resources are allocated. A bigger role could be more efficient and lead to patient benefits. However, such a change might mean certain medical practitioners would not keep their current level of professional authority. It is therefore important that AI goals are appropriate so that discriminatory practices could be avoided.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–19',
        instruction: 'Choose the correct answer.',
        type: 'multiple-choice',
        questions: [
          {
            number: 14,
            type: 'multiple-choice',
            prompt: 'What point does the writer make about AI in the first paragraph?',
            options: [
              { id: 'a', label: 'It is difficult to predict how quickly AI will progress.' },
              { id: 'b', label: 'Much can be learned about the use of AI in chess machines.' },
              { id: 'c', label: 'The future is unlikely to see limitations on the capabilities of AI.' },
              { id: 'd', label: 'Experts disagree on which specialised tasks AI will be able to perform.' },
            ],
            answer: 'a',
            explanation: 'A — difficult to predict how quickly AI will progress (SAMPLE; adjust to key).',
          },
          {
            number: 15,
            type: 'multiple-choice',
            prompt: 'According to the passage, specialised AI systems such as chess machines',
            options: [
              { id: 'a', label: 'prove AI has no limits.' },
              { id: 'b', label: 'show narrow systems can outperform humans at set tasks.' },
              { id: 'c', label: 'are mainly used in the health service today.' },
              { id: 'd', label: 'replace the need for professional authority.' },
            ],
            answer: 'b',
            explanation: 'B — specialised systems can outperform humans.',
          },
          {
            number: 16,
            type: 'multiple-choice',
            prompt: 'What does the writer say about experts\' views of AI tasks?',
            options: [
              { id: 'a', label: 'They all agree AI will replace doctors soon.' },
              { id: 'b', label: 'They disagree on which specialised tasks AI will master next.' },
              { id: 'c', label: 'They believe chess is the best model for health AI.' },
              { id: 'd', label: 'They deny any risk of discriminatory practices.' },
            ],
            answer: 'b',
            explanation: 'B — experts disagree on specialised tasks.',
          },
          {
            number: 17,
            type: 'multiple-choice',
            prompt: 'A concern about AI making moral decisions is that it may',
            options: [
              { id: 'a', label: 'always promote community interests.' },
              { id: 'b', label: 'conflict with social values and community interests.' },
              { id: 'c', label: 'eliminate the need for available resources.' },
              { id: 'd', label: 'remove all specialised tasks from hospitals.' },
            ],
            answer: 'b',
            explanation: 'B — optimise for goals that conflict with social values.',
          },
          {
            number: 18,
            type: 'multiple-choice',
            prompt: 'In the UK health system today, AI\'s role is described as',
            options: [
              { id: 'a', label: 'dominant in every hospital department.' },
              { id: 'b', label: 'limited in how resources are allocated.' },
              { id: 'c', label: 'banned by professional bodies.' },
              { id: 'd', label: 'identical to chess machine design.' },
            ],
            answer: 'b',
            explanation: 'B — limited role in how resources are allocated.',
          },
          {
            number: 19,
            type: 'multiple-choice',
            prompt: 'Why does the writer say AI goals must be appropriate?',
            options: [
              { id: 'a', label: 'To avoid discriminatory practices.' },
              { id: 'b', label: 'To increase illness rates.' },
              { id: 'c', label: 'To stop all technology experts working in health.' },
              { id: 'd', label: 'To remove patient benefits.' },
            ],
            answer: 'a',
            explanation: 'A — so that discriminatory practices could be avoided.',
          },
        ],
      },
      {
        range: 'Questions 20–23',
        instruction: 'Do the following statements agree with the claims of the writer in the Reading Passage? In boxes 20–23 on your answer sheet, write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        type: 'ynng',
        questions: [
          {
            number: 20,
            type: 'yes-no-not-given',
            prompt: 'Machines with the ability to make moral decisions may prevent us from promoting the interests of our communities.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Writer raises this worry about moral AI vs community interests.',
          },
          {
            number: 21,
            type: 'yes-no-not-given',
            prompt: 'AI in healthcare will always reduce the need for human doctors completely.',
            options: [...YNNG_OPTIONS],
            answer: 'no',
            explanation: 'Passage discusses limited role and authority, not total replacement as a claim of the writer.',
          },
          {
            number: 22,
            type: 'yes-no-not-given',
            prompt: 'A bigger role for AI could lead to patient benefits through greater efficiency.',
            options: [...YNNG_OPTIONS],
            answer: 'yes',
            explanation: 'Positive aspect: more efficient and lead to patient benefits.',
          },
          {
            number: 23,
            type: 'yes-no-not-given',
            prompt: 'The writer provides exact figures for AI spending in every UK hospital.',
            options: [...YNNG_OPTIONS],
            answer: 'not-given',
            explanation: 'No spending figures given.',
          },
        ],
      },
      {
        range: 'Questions 24–26',
        instruction: 'Complete the summary using the list of phrases, A–F, below.',
        type: 'summary-completion',
        note: CAM_AI_HEALTH_SUMMARY_NOTE,
        wordBank: CAM_AI_HEALTH_WORD_BANK,
        questions: [
          {
            number: 24,
            type: 'summary-completion',
            prompt: 'Gap (24)',
            options: [],
            answer: 'c',
            explanation: 'available resources are allocated.',
          },
          {
            number: 25,
            type: 'summary-completion',
            prompt: 'Gap (25)',
            options: [],
            answer: 'a',
            explanation: 'certain medical practitioners…',
          },
          {
            number: 26,
            type: 'summary-completion',
            prompt: 'Gap (26)',
            options: [],
            answer: 'e',
            explanation: 'current level of professional authority.',
          },
        ],
      },
    ],
  }
}

const CAM_WETLANDS_FEATURES = [
  { id: 'a', name: 'Matthew McCartney' },
  { id: 'b', name: 'Pieter van Eijk' },
  { id: 'c', name: 'Marcel Silvius' },
  { id: 'd', name: 'Dave Tickner' },
]

const CAM_DEEP_SEA_FEATURES = [
  { id: 'a', name: 'Professor Mat Upton' },
  { id: 'b', name: 'Julie Hunter, Julian Aguon and Pradeep Singh' },
  { id: 'c', name: 'Dr Jon Copley' },
  { id: 'd', name: 'Mike Johnston' },
  { id: 'e', name: 'Verena Tunnicliffe' },
]

const CAM_DEEP_SEA_SUMMARY_NOTE = [
  'Mining the sea floor',
  '',
  'Mining corporations believe that the mineral resources lying under the sea may be superior to those found in the earth. They also say that these can be removed without producing much 24________. The extraction is often done by adapting the 25________ that has already been used to work on land. The method of excavation involves removing the seawater from the slurry that is brought up to ships and returning it to the seabed. However, concerned groups strongly believe that 26________ is necessary due to the possible number of unidentified consequences.',
].join('\n')

/**
 * r2mfu — Match đoạn Q14–17 + Features Q18–23 + Summary ONE WORD Q24–26
 * Preview: Teamplate_Part2_19.jpg (Deep-sea mining — Cam19 T4 P2)
 */
export function ieltsReadingP2MatchFeaturesSummaryPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'Deep-sea mining',
    passageSubtitle: 'Bacteria from the ocean floor can beat superbugs — but habitats are at risk',
    passage: [
      {
        label: 'A',
        text: 'When Professor Mat Upton found that a microbe from a deep-sea sponge was killing pathogenic bugs in his laboratory, he realised it could be a breakthrough against antibiotic-resistant superbugs. Upton sees the deep ocean as a source of new medicines and worries that potential will be lost in the rush for equally rich metal and mineral resources. He argues there are more worthwhile things to extract from the sea than minerals.',
      },
      {
        label: 'B',
        text: 'The oceans cover roughly seventy per cent of the Earth\'s surface and are relatively unexplored. How hydrothermal vent habitats form — places where minerals and organisms co-exist — remains an active scientific question.',
      },
      {
        label: 'C',
        text: 'Demand for one raw material used in the transport industry has risen rapidly, encouraging interest in seabed deposits of metals needed for batteries and electronics.',
      },
      {
        label: 'D',
        text: 'Julie Hunter, Julian Aguon and Pradeep Singh have argued that the negative effects of undersea exploration on local areas and their inhabitants are being ignored. Countries of the world have yet to agree fully on rules for exploration of the seabed.',
      },
      {
        label: 'E',
        text: 'Mike Johnston of Nautilus has said it makes sense to explore untapped ocean potential in a sustainable way instead of depleting land resources. He suggests a move away from heavily mined land reserves is a good idea. Mining corporations believe mineral resources under the sea may be superior to those on land and can be removed without producing much waste. Extraction often adapts technology already used on land. Seawater is removed from slurry brought up to ships and returned to the seabed. Concerned groups strongly believe that caution is necessary due to unidentified consequences.',
      },
      {
        label: 'F',
        text: 'Dr Jon Copley notes that more is known about outer space than about what lies beneath the oceans. Verena Tunnicliffe argues that mining will be the greatest assault on deep-sea ecosystems ever inflicted by humans. She says active vents must be off-limits for mining to protect knowledge and biotechnology spin-offs, and that strict controls must be in place elsewhere — one marine life habitat where experts agree mining should not take place.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–17',
        instruction: 'Reading Passage 2 has sections A–F. Which section contains the following information? Write the correct letter, A–F, in boxes 14–17 on your answer sheet.',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F'],
        questions: [
          {
            number: 14,
            type: 'matching-paragraph',
            prompt: 'reference to the rapidly increasing need for one raw material in the transport industry',
            options: [],
            answer: 'c',
            explanation: 'C — demand for one raw material in transport has risen rapidly.',
          },
          {
            number: 15,
            type: 'matching-paragraph',
            prompt: 'a rough estimate of the area of the Earth covered by the oceans',
            options: [],
            answer: 'b',
            explanation: 'B — oceans cover roughly seventy per cent of the Earth.',
          },
          {
            number: 16,
            type: 'matching-paragraph',
            prompt: 'how a particular underwater habitat, where minerals and organisms co-exist, is formed',
            options: [],
            answer: 'b',
            explanation: 'B — hydrothermal vent habitats where minerals and organisms co-exist.',
          },
          {
            number: 17,
            type: 'matching-paragraph',
            prompt: 'reference to the fact that the countries of the world have yet to agree on rules for the exploration of the seabed',
            options: [],
            answer: 'd',
            explanation: 'D — countries have yet to agree on rules for seabed exploration.',
          },
        ],
      },
      {
        range: 'Questions 18–23',
        instruction: 'Match each statement with the correct option, A–E. Write the correct letter in boxes 18–23 on your answer sheet.',
        note: 'NB You may use any letter more than once.',
        type: 'matching-features',
        features: CAM_DEEP_SEA_FEATURES,
        questions: [
          {
            number: 18,
            type: 'matching-features',
            prompt: 'A move away from the exploration of heavily mined reserves on land is a good idea.',
            options: [],
            answer: 'd',
            explanation: 'D — Mike Johnston.',
          },
          {
            number: 19,
            type: 'matching-features',
            prompt: 'The negative effects of undersea exploration on local areas and their inhabitants are being ignored.',
            options: [],
            answer: 'b',
            explanation: 'B — Hunter, Aguon and Singh.',
          },
          {
            number: 20,
            type: 'matching-features',
            prompt: 'There are more worthwhile things to extract from the sea than minerals.',
            options: [],
            answer: 'a',
            explanation: 'A — Professor Mat Upton.',
          },
          {
            number: 21,
            type: 'matching-features',
            prompt: 'No other form of human exploration will have such a destructive impact on marine life as deep-sea mining.',
            options: [],
            answer: 'e',
            explanation: 'E — Verena Tunnicliffe (greatest assault).',
          },
          {
            number: 22,
            type: 'matching-features',
            prompt: 'More is known about outer space than about what lies beneath the oceans.',
            options: [],
            answer: 'c',
            explanation: 'C — Dr Jon Copley.',
          },
          {
            number: 23,
            type: 'matching-features',
            prompt: 'There is one marine life habitat where experts agree mining should not take place.',
            options: [],
            answer: 'e',
            explanation: 'E — Tunnicliffe: active vents must be off-limits.',
          },
        ],
      },
      {
        range: 'Questions 24–26',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        note: CAM_DEEP_SEA_SUMMARY_NOTE,
        questions: [
          { number: 24, type: 'gap-fill', prompt: 'Gap (24)', options: [], answer: 'waste', explanation: 'without producing much waste.' },
          { number: 25, type: 'gap-fill', prompt: 'Gap (25)', options: [], answer: 'technology', explanation: 'adapting the technology used on land.' },
          { number: 26, type: 'gap-fill', prompt: 'Gap (26)', options: [], answer: 'caution', explanation: 'caution is necessary due to unidentified consequences.' },
        ],
      },
    ],
  }
}

/**
 * r2msf — Match đoạn Q14–17 + Sentence Q18–22 + Features Q23–26
 * Preview: Teamplate_Part2_18.jpg (Wetlands / peatlands — Cam19 T3 P2)
 */
export function ieltsReadingP2MatchSentenceFeaturesPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'The global importance of wetlands',
    passageSubtitle: 'Why peatlands and other wetlands matter for climate and communities',
    passage: [
      {
        label: 'A',
        text: 'Wetlands are areas where water covers the soil, or is present either at or near the surface of the soil, for all or part of the year. These are complex ecosystems, rich in unique plant and animal life. But according to the World Wide Fund for Nature, half of the world\'s wetlands have disappeared since 1900 – converted or destroyed for commercial development, drainage schemes and the extraction of minerals and peat. Many of those that remain have been damaged by agricultural pesticides and fertilisers, industrial pollutants, and construction works.',
      },
      {
        label: 'B',
        text: 'Throughout history, humans have gathered around wetlands, and their fertile ecosystems have played an important part in human development. Consequently, they are of considerable religious, historical and archaeological value to many communities around the world. \'Wetlands directly support the livelihoods and well-being of millions of people,\' says Dr Matthew McCartney, principal researcher and hydrologist at the International Water Management Institute (IWMI). \'In many developing countries, large numbers of people are dependent on wetland agriculture for their livelihoods.\'',
      },
      {
        label: 'C',
        text: 'They also serve a crucial environmental purpose. \'Wetlands are one of the key tools in mitigating climate change across the planet,\' says Pieter van Eijk, head of Climate Adaptation at Wetlands International (WI), pointing to their use as buffers that protect coastal areas from sea-level rise and extreme weather events such as hurricanes and flooding. Wetland coastal forests provide food and water, as well as shelter from storms. \'It can be as simple as planting a few trees per hectare to create shade and substantially change a microclimate,\' he says. \'Implementing climate change projects isn\'t so much about money.\'',
      },
      {
        label: 'D',
        text: 'The world\'s wetlands are, unfortunately, rich sources for in-demand commodities, such as palm oil and pulpwood. Peatlands – wetlands with a waterlogged organic soil layer – are particularly targeted. When peatlands are drained for cultivation, they become net carbon emitters instead of active carbon stores, and, according to Marcel Silvius, head of Climate-smart Land-use at WI, this practice causes six per cent of all global carbon emissions. The clearance of peatlands for planting also increases the risk of forest fires. \'We\'re seeing huge peatland forests with extremely high biodiversity value being lost for a few decades of oil palm revenues,\' says Silvius.',
      },
      {
        label: 'E',
        text: 'The damage starts when logging companies arrive to clear the trees. They dig ditches to enter the peat swamps by boat and then float the logs out the same way. These canals are then used to drain water out of the peatlands to allow for planting. Once the water has drained away, bacteria and fungi break down the carbon in the peat. Meanwhile, the remainder of the solid matter starts to move downwards, in a process known as subsidence. Peat comprises 90 per cent water, so this is one of the most alarming consequences of peatland clearances. Clearing peatland forests to make way for oil palm plantations destroys the biodiversity of the local environment. In the tropics, peat subsides at about four centimetres a year, so large landscapes may become flooded as the peat drops below water level.',
      },
      {
        label: 'F',
        text: 'And while these industries affect wetlands in ways that can easily be documented, Dr Dave Tickner of the WWFN believes that more subtle impacts can be even more devastating. Sediment run-off and fertilisers can be pretty invisible. Tickner does not blame anyone for deliberate damage: he has never met anybody who wanted to damage a wetland — effects often simply come from people trying to make a living.',
      },
      {
        label: 'G',
        text: 'Silvius also acknowledges the need to provide an income for local people. McCartney stresses that for sustainability it is essential that local people are involved in wetland planning and decision making. Awareness of the importance of wetlands is growing, though degradation continues.',
      },
      {
        label: 'H',
        text: 'The fortunes of wetlands would be improved, Silvius suggests, if more governments recognised their long-term value. Different governments have different attitudes: some countries place a high priority on restoring wetlands, while others still deny the issue.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–17',
        instruction: 'Reading Passage 2 has sections A–H. Which section contains the following information? Write the correct letter, A–H, in boxes 14–17 on your answer sheet.',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        questions: [
          {
            number: 14,
            type: 'matching-paragraph',
            prompt: 'reference to the need to ensure that inhabitants of wetland regions continue to benefit from them',
            options: [],
            answer: 'g',
            explanation: 'G — people only protect wetlands if they value and profit from them.',
          },
          {
            number: 15,
            type: 'matching-paragraph',
            prompt: 'the proportion of wetlands which have already been lost',
            options: [],
            answer: 'a',
            explanation: 'A — half of the world\'s wetlands have disappeared.',
          },
          {
            number: 16,
            type: 'matching-paragraph',
            prompt: 'reference to the idea that people are beginning to appreciate the value of wetlands',
            options: [],
            answer: 'h',
            explanation: 'H — awareness of the importance of wetlands is growing.',
          },
          {
            number: 17,
            type: 'matching-paragraph',
            prompt: 'mention of the cultural significance of wetlands',
            options: [],
            answer: 'b',
            explanation: 'B — religious, historical and archaeological value.',
          },
        ],
      },
      {
        range: 'Questions 18–22',
        instruction: 'Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'sentence-completion',
        questions: sentenceQuestions(18, [
          {
            prompt: 'Peatlands which have been drained begin to release ______ instead of storing it.',
            answer: 'carbon',
            explanation: 'release carbon instead of storing it.',
          },
          {
            prompt: 'Once peatland areas have been cleared, ______ are more likely to occur.',
            answer: 'fires',
            explanation: 'fires are more likely to occur.',
          },
          {
            prompt: 'Clearing peatland forests to make way for oil palm plantations destroys the ______ of the local environment.',
            answer: 'biodiversity',
            explanation: 'destroys the biodiversity of the local environment.',
          },
          {
            prompt: 'Water is drained out of peatlands through the ______ which are created by logging companies.',
            answer: 'canals',
            explanation: 'through the canals created by logging companies.',
          },
          {
            prompt: 'Draining peatlands leads to ______: a serious problem which can eventually result in coastal flooding and land loss.',
            answer: 'subsidence',
            explanation: 'leads to subsidence.',
          },
        ]),
      },
      {
        range: 'Questions 23–26',
        instruction: 'Match each statement with the correct option, A–D. Write the correct letter in boxes 23–26 on your answer sheet.',
        type: 'matching-features',
        features: CAM_WETLANDS_FEATURES,
        questions: [
          {
            number: 23,
            type: 'matching-features',
            prompt: 'Communities living in wetland regions must be included in discussions about the future of these areas.',
            options: [],
            answer: 'a',
            explanation: 'A — Matthew McCartney (local people in wetland planning).',
          },
          {
            number: 24,
            type: 'matching-features',
            prompt: 'Official policies towards wetlands vary from one nation to the next.',
            options: [],
            answer: 'c',
            explanation: 'C — Marcel Silvius (different governments have different attitudes).',
          },
          {
            number: 25,
            type: 'matching-features',
            prompt: 'People cause harm to wetlands without having any intention to do so.',
            options: [],
            answer: 'd',
            explanation: 'D — Dave Tickner (never met anyone who wanted to damage a wetland).',
          },
          {
            number: 26,
            type: 'matching-features',
            prompt: 'Initiatives to reverse environmental damage need not be complex.',
            options: [],
            answer: 'b',
            explanation: 'B — Pieter van Eijk (can be as simple as planting trees; not so much about money).',
          },
        ],
      },
    ],
  }
}

/**
 * r2mfs — Match đoạn Q14–18 + Features Q19–21 + Sentence Q22–26
 * Preview: Teamplate_Part2_13.jpg (Forest management / TSI, Salvage, Shelterwood)
 */
export function ieltsReadingP2MatchFeaturesSentencePart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'Forest management',
    passageSubtitle: 'Timber harvesting methods and the value of dead wood',
    passage: [
      {
        label: 'A',
        text: 'When people manage a forest only for financial reward, biodiversity and soil quality can decline. Over-harvesting for short-term profit leaves fewer habitats and can degrade the long-term health of the woodland.',
      },
      {
        label: 'B',
        text: 'A tree\'s worth is not only the timber volume in its trunk. Age, species, form, and location all contribute to its commercial and ecological value.',
      },
      {
        label: 'C',
        text: 'Some researchers have explored whether wood fibre could help produce liquid fuels for vehicles, though such uses remain experimental beside traditional solid timber markets.',
      },
      {
        label: 'D',
        text: 'Insects such as bark beetles and wood-boring beetles attack living and dying trees, sometimes causing large stands to die and creating urgent salvage needs.',
      },
      {
        label: 'E',
        text: 'Trees that yield only low-grade or low-use wood are sometimes called "weed trees" by foresters, even though they may still matter for wildlife.',
      },
      {
        label: 'F',
        text: 'A Salvage cut removes trees that are diseased, damaged, or already dead so that pests do not spread and some timber value is recovered. A TSI cut (timber stand improvement) can spread income across a number of years by thinning and improving the stand over time. A Shelterwood cut aims to create a forest whose trees are close in age by removing most canopy trees in stages while leaving seed trees.',
      },
      {
        label: 'G',
        text: 'Some dead wood is removed to avoid the possibility of fire. Leaves and twigs from the tops of cut trees can help improve soil quality if left on site. Some damaged trees should be left, as their cavities provide habitats for a range of creatures. Small trees such as saplings are a source of food for animals and insects. Any trees that are rare should be left to grow, as they add to the variety of species in the forest.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–18',
        instruction: 'Reading Passage 2 has sections A–G. Which section contains the following information? Write the correct letter, A–G, in boxes 14–18 on your answer sheet.',
        note: 'NB You may use any letter more than once.',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        questions: [
          {
            number: 14,
            type: 'matching-paragraph',
            prompt: 'Bad outcomes for a forest when people focus only on its financial reward',
            options: [],
            answer: 'a',
            explanation: 'Section A — focus only on financial reward harms the forest.',
          },
          {
            number: 15,
            type: 'matching-paragraph',
            prompt: 'Reference to the aspects of any tree that contribute to its worth',
            options: [],
            answer: 'b',
            explanation: 'Section B — aspects that contribute to worth.',
          },
          {
            number: 16,
            type: 'matching-paragraph',
            prompt: 'Mention of the potential use of wood to help run vehicles',
            options: [],
            answer: 'c',
            explanation: 'Section C — wood fibre / fuels for vehicles.',
          },
          {
            number: 17,
            type: 'matching-paragraph',
            prompt: 'Examples of insects that attack trees',
            options: [],
            answer: 'd',
            explanation: 'Section D — bark beetles and wood-boring beetles.',
          },
          {
            number: 18,
            type: 'matching-paragraph',
            prompt: 'An alternative name for trees that produce low-use wood',
            options: [],
            answer: 'e',
            explanation: 'Section E — "weed trees".',
          },
        ],
      },
      {
        range: 'Questions 19–21',
        instruction: 'Match each statement with the correct option, A–C. Write the correct letter in boxes 19–21 on your answer sheet.',
        note: 'NB You may use any letter more than once.',
        type: 'matching-features',
        features: CAM_FOREST_CUT_FEATURES,
        questions: [
          {
            number: 19,
            type: 'matching-features',
            prompt: 'To remove trees that are diseased',
            options: [],
            answer: 'b',
            explanation: 'Salvage cut — remove diseased/damaged trees.',
          },
          {
            number: 20,
            type: 'matching-features',
            prompt: 'To generate income across a number of years',
            options: [],
            answer: 'a',
            explanation: 'TSI cut — income across a number of years.',
          },
          {
            number: 21,
            type: 'matching-features',
            prompt: 'To create a forest whose trees are close in age',
            options: [],
            answer: 'c',
            explanation: 'Shelterwood cut — trees close in age.',
          },
        ],
      },
      {
        range: 'Questions 22–26',
        instruction: 'Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'sentence-completion',
        questions: sentenceQuestions(22, [
          {
            prompt: 'Some dead wood is removed to avoid the possibility of ___.',
            answer: 'fire',
            explanation: 'avoid the possibility of fire.',
          },
          {
            prompt: 'The ___ from the tops of cut trees can help improve soil quality.',
            answer: 'leaves',
            explanation: 'Leaves (and twigs) from the tops…',
          },
          {
            prompt: 'Some damaged trees should be left, as their ___ provide habitats for a range of creatures.',
            answer: 'cavities',
            explanation: 'their cavities provide habitats.',
          },
          {
            prompt: 'Some trees that are small, such as ___, are a source of food for animals and insects.',
            answer: 'saplings',
            explanation: 'small trees such as saplings.',
          },
          {
            prompt: 'Any trees that are ___ should be left to grow, as they add to the variety of species in the forest.',
            answer: 'rare',
            explanation: 'trees that are rare should be left.',
          },
        ]),
      },
    ],
  }
}

/** Notes Q8–13 — tennis racket (Teamplate_Part1_14.jpg) */
const CAM_TENNIS_RACKET_NOTE_PASSAGE: ReadingNotePassageBlock[] = [
  { type: 'static', text: '• Mike and Bob Bryan made changes to the types of ' },
  { type: 'gap', number: 8 },
  { type: 'static', text: ' used on their racket frames.' },
  { type: 'static', text: '• Players were not allowed to use the spaghetti-strung racket because of the amount of ' },
  { type: 'gap', number: 9 },
  { type: 'static', text: ' it created.' },
  { type: 'static', text: '• Changes to rackets can be regarded as being as important as players\' diets or the ' },
  { type: 'gap', number: 10 },
  { type: 'static', text: ' they do.' },
  { type: 'static', text: '• All rackets used to have natural strings made from the ' },
  { type: 'gap', number: 11 },
  { type: 'static', text: ' of animals.' },
  { type: 'static', text: '• Pete Sampras had metal ' },
  { type: 'gap', number: 12 },
  { type: 'static', text: ' put into the frames of his rackets.' },
  { type: 'static', text: '• Goncalo Oliveira changed the ' },
  { type: 'gap', number: 13 },
  { type: 'static', text: ' on his racket handles.' },
]

/**
 * r1tn — TFNG Q1–7 + Notes Q8–13 (notePassage, ONE WORD)
 * Preview: Teamplate_Part1_14.jpg (tennis racket evolution)
 */
export function ieltsReadingP1TfngNotesPart(): ReadingImportPartJson {
  return {
    partNumber: 1,
    rangeLabel: 'Read the text and answer questions 1–13.',
    passageTitle: 'The development of the tennis racket',
    passageSubtitle: 'How materials and design changed the modern game',
    passage: [
      {
        text: 'Few people expected Andy Murray to become the world\'s top tennis player for years before 2016; his rise still surprised many commentators who had long focused on other British hopefuls. Off court, equipment makers continued to experiment. Mike and Bob Bryan, famous doubles specialists, worked with manufacturers on the types of materials used on their racket frames, seeking a stiffer feel without adding weight.',
      },
      {
        text: 'Earlier controversies had already shaped the rules. The so-called spaghetti-strung racket was banned because of the amount of spin it created, which officials judged unfair. Coaches still debate whether changes to rackets matter as much as players\' diets or the training they do; many argue the three factors must be considered together.',
      },
      {
        text: 'Historically all rackets used natural strings made from the gut of animals. Later generations mixed gut with synthetic fibres. Pete Sampras, known for a classic wooden-era feel even on graphite frames, had metal weights put into the frames of his rackets to fine-tune balance. More recently, Goncalo Oliveira changed the grip on his racket handles to improve comfort during long matches on hard courts.',
      },
      {
        text: 'Manufacturers now market frames that claim to enlarge the sweet spot and reduce vibration. Whether amateurs notice the same gains as professionals remains an open question, but elite players rarely share identical setups even when they endorse the same brand.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 1–7',
        instruction: 'Do the following statements agree with the information given in the Reading Passage? In boxes 1–7 on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        type: 'tfng',
        questions: [
          {
            number: 1,
            type: 'true-false-not-given',
            prompt: 'People had expected Andy Murray to become the world\'s top tennis player for at least five years before 2016.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Few people expected him to become top for years before 2016.',
          },
          {
            number: 2,
            type: 'true-false-not-given',
            prompt: 'Mike and Bob Bryan only played singles tennis at the highest level.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Described as doubles specialists.',
          },
          {
            number: 3,
            type: 'true-false-not-given',
            prompt: 'The spaghetti-strung racket was banned because of the spin it created.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'Banned because of the amount of spin it created.',
          },
          {
            number: 4,
            type: 'true-false-not-given',
            prompt: 'Coaches agree that racket changes are more important than diet and training.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Many argue the three factors must be considered together — not that rackets dominate.',
          },
          {
            number: 5,
            type: 'true-false-not-given',
            prompt: 'Natural strings for early rackets came from animal gut.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'Natural strings made from the gut of animals.',
          },
          {
            number: 6,
            type: 'true-false-not-given',
            prompt: 'Pete Sampras never used graphite racket frames.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'He used graphite frames with metal weights added.',
          },
          {
            number: 7,
            type: 'true-false-not-given',
            prompt: 'Every professional who endorses a brand uses exactly the same racket setup.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Elite players rarely share identical setups even with the same brand.',
          },
        ],
      },
      {
        range: 'Questions 8–13',
        instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        notesTitle: 'The tennis racket and how it has changed',
        notePassage: CAM_TENNIS_RACKET_NOTE_PASSAGE,
        questions: gapQuestions(8, [
          { prompt: 'Gap (8)', answer: 'materials', explanation: 'types of materials used on their racket frames.' },
          { prompt: 'Gap (9)', answer: 'spin', explanation: 'amount of spin it created.' },
          { prompt: 'Gap (10)', answer: 'training', explanation: 'diets or the training they do.' },
          { prompt: 'Gap (11)', answer: 'gut', explanation: 'strings made from the gut of animals.' },
          { prompt: 'Gap (12)', answer: 'weights', explanation: 'metal weights put into the frames.' },
          { prompt: 'Gap (13)', answer: 'grip', explanation: 'changed the grip on his racket handles.' },
        ]),
      },
    ],
  }
}

/** r2tn — TFNG Q14–19 + Notes Q20–26 (notePassage, section headings) — Silbo Gomero */
export function ieltsReadingP2TfngNotesPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'Silbo Gomero',
    passageSubtitle: 'The whistled language of La Gomera in the Canary Islands',
    passage: [
      {
        text: 'La Gomera is one of the Canary Islands, known for its mountainous terrain. Silbo Gomero is a whistled form of Spanish used to communicate across deep valleys. High- and low-frequency tones represent different sounds in Spanish words. The pitch of the whistle is controlled using the silbador\'s fingers, and volume is changed with a cupped hand.',
      },
      {
        text: 'Silbo has long been used by shepherds and people living in secluded locations. In everyday use it serves for the transmission of brief messages and can relay essential information quickly, for example to inform people about danger or emergencies.',
      },
      {
        text: 'The future of Silbo is under threat because of new technology. Canaries\' authorities are hoping to receive a UNESCO designation to help preserve it as part of the islands\' cultural heritage.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–19',
        instruction: 'Do the following statements agree with the information given in the Reading Passage? In boxes 14–19 on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        type: 'tfng',
        questions: [
          {
            number: 14,
            type: 'true-false-not-given',
            prompt: 'La Gomera is the most mountainous of all the Canary Islands.',
            options: [...TFNG_OPTIONS],
            answer: 'not given',
            explanation: 'Passage nói mountainous nhưng không so sánh "most" với mọi đảo khác.',
          },
          {
            number: 15,
            type: 'true-false-not-given',
            prompt: 'Silbo Gomero is based on Spanish.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'Whistled form of Spanish / tones represent Spanish sounds.',
          },
          {
            number: 16,
            type: 'true-false-not-given',
            prompt: 'Shepherds were the only people who ever used Silbo.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Used by shepherds and people in secluded locations — not only shepherds.',
          },
          {
            number: 17,
            type: 'true-false-not-given',
            prompt: 'Silbo can be used to send short everyday messages.',
            options: [...TFNG_OPTIONS],
            answer: 'true',
            explanation: 'Everyday use for transmission of brief messages.',
          },
          {
            number: 18,
            type: 'true-false-not-given',
            prompt: 'Modern technology has made Silbo completely extinct.',
            options: [...TFNG_OPTIONS],
            answer: 'false',
            explanation: 'Future under threat — not completely extinct; UNESCO efforts continue.',
          },
          {
            number: 19,
            type: 'true-false-not-given',
            prompt: 'UNESCO has already listed Silbo as World Heritage.',
            options: [...TFNG_OPTIONS],
            answer: 'not given',
            explanation: 'Authorities hoping to receive UNESCO status — chưa khẳng định đã nhận.',
          },
        ],
      },
      {
        range: 'Questions 20–26',
        instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        notesTitle: 'Silbo Gomero',
        notePassage: CAM_SILBO_NOTE_PASSAGE,
        questions: gapQuestions(20, [
          { prompt: 'Gap (20)', answer: 'words', explanation: 'tones represent different sounds in Spanish words.' },
          { prompt: 'Gap (21)', answer: 'fingers', explanation: 'pitch controlled using silbador\'s fingers.' },
          { prompt: 'Gap (22)', answer: 'volume', explanation: 'volume is changed with a cupped hand.' },
          { prompt: 'Gap (23)', answer: 'messages', explanation: 'transmission of brief messages.' },
          { prompt: 'Gap (24)', answer: 'danger', explanation: 'inform people about danger / emergencies.' },
          { prompt: 'Gap (25)', answer: 'technology', explanation: 'threat because of new technology.' },
          { prompt: 'Gap (26)', answer: 'designation', explanation: 'UNESCO designation (or listing) to preserve it.' },
        ]),
      },
    ],
  }
}

/**
 * Factory map — resolve TẠI LÚC GỌI (sau khi module fully evaluated).
 * Tránh HMR partial: catalog có kind mới nhưng binding builder chưa kịp.
 */
function getTemplateBuilders(): Record<IeltsReadingWizardTemplateKind, () => ReadingImportPartJson> {
  return {
    'p1-r1-tfng-mc': ieltsReadingP1R1Part,
    'p1-r1-tfng-gap': ieltsReadingP1TfngGapPart,
    'p1-r1-tfng-gap-table': ieltsReadingP1TfngGapTablePart,
    'p1-r1-notes-tfng': ieltsReadingP1NotesTfngPart,
    'p1-r1-notes-tfng-8': ieltsReadingP1NotesTfng8Part,
    'p1-r1-table-tfng': ieltsReadingP1TableTfngPart,
    'p1-r1-notes-tfng-table': ieltsReadingP1NotesTfngTablePart,
    'p1-r1-notes-table-tfng': ieltsReadingP1NotesTableTfngPart,
    'p1-r1-tfng-table': ieltsReadingP1TfngTablePart,
    'p1-r1-sentence-table-tfng': ieltsReadingP1SentenceTableTfngPart,
    'p1-r1-match-summary-features': ieltsReadingP1MatchSummaryFeaturesPart,
    'p1-r1-match-summary-choose-two': ieltsReadingP1MatchSummaryChooseTwoPart,
    'p1-r1-tfng-notes': ieltsReadingP1TfngNotesPart,
    'p1-r1-tfng-match-notes': ieltsReadingP1TfngMatchNotesPart,
    'p1-r1-tfng-match-summary': ieltsReadingP1TfngMatchSummaryPart,
    'p1-r1-match-choose-two': ieltsReadingP1MatchChooseTwoPart,
    'p1-r1-match-ynng-features': ieltsReadingP1MatchYnngFeaturesPart,
    'p1-r1-headings-notes': ieltsReadingP1HeadingsNotesPart,
    'p1-r1-headings-mc': ieltsReadingP1HeadingsMcPart,
    'p1-r1-sentence-mc': ieltsReadingP1SentenceMcPart,
    'p1-r1-headings-gap': ieltsReadingP1HeadingsGapPart,
    'p1-r1-gap-mc': ieltsReadingP1GapMcPart,
    'p2-r2-match-mc': ieltsReadingP2R2Part,
    'p2-r2-ynng-match': ieltsReadingP2YnngMatchPart,
    'p2-r2-headings-ynng': ieltsReadingP2HeadingsYnngPart,
    'p2-r2-tfng-match': ieltsReadingP2TfngMatchPart,
    'p2-r2-gap-match': ieltsReadingP2GapMatchPart,
    'p2-r2-headings-summary-mc': ieltsReadingP2HeadingsSummaryMcPart,
    'p2-r2-summary-ynng-mc': ieltsReadingP2SummaryYnngMcPart,
    'p2-r2-tfng-endings-summary': ieltsReadingP2TfngEndingsSummaryPart,
    'p2-r2-mc-tfng-endings': ieltsReadingP2McTfngEndingsPart,
    'p2-r2-tfng-diagram': ieltsReadingP2TfngDiagramPart,
    'p2-r2-headings-tfng-sentence': ieltsReadingP2HeadingsTfngSentencePart,
    'p2-r2-mc-summary-ynng': ieltsReadingP2McSummaryYnngPart,
    'p2-r2-headings-match-summary': ieltsReadingP2HeadingsMatchSummaryPart,
    'p2-r2-match-choose-two-summary': ieltsReadingP2MatchChooseTwoSummaryPart,
    'p2-r2-match-tfng-choose-two': ieltsReadingP2MatchTfngChooseTwoPart,
    'p2-r2-tfng-notes': ieltsReadingP2TfngNotesPart,
    'p2-r2-match-features-sentence': ieltsReadingP2MatchFeaturesSentencePart,
    'p2-r2-mc-ynng-summary': ieltsReadingP2McYnngSummaryPart,
    'p2-r2-headings-mc-summary': ieltsReadingP2HeadingsMcSummaryPart,
    'p2-r2-mc-features-ynng': ieltsReadingP2McFeaturesYnngPart,
    'p2-r2-match-sentence-choose-two': ieltsReadingP2MatchSentenceChooseTwoPart,
    'p2-r2-match-sentence-features': ieltsReadingP2MatchSentenceFeaturesPart,
    'p2-r2-match-features-summary': ieltsReadingP2MatchFeaturesSummaryPart,
    'p2-r2-match-summary-choose-two': ieltsReadingP2MatchSummaryChooseTwoPart,
    'p2-r2-headings-choose-two-notes': ieltsReadingP2HeadingsChooseTwoNotesPart,
    'p3-r3-tfng-mc': ieltsReadingP3R3Part,
    'p3-r3-gap-tfng-flow-mc': ieltsReadingP3GapTfngFlowMcPart,
    'p3-r3-ynng-mc': ieltsReadingP3YnngMcPart,
    'p3-r3-gap-ynng-mc': ieltsReadingP3GapYnngMcPart,
    'p3-r3-summary-ynng-mc': ieltsReadingP3SummaryYnngMcPart,
    'p3-r3-summary-mc-ynng': ieltsReadingP3SummaryMcYnngPart,
    'p3-r3-gap-tfng-mc': ieltsReadingP3GapTfngMcPart,
    'p3-r3-match-table-features': ieltsReadingP3MatchTableFeaturesPart,
    'p3-r3-mc-summary-ynng': ieltsReadingP3McSummaryYnngPart,
    'p3-r3-match-paragraph-sentence': ieltsReadingP3MatchParagraphSentencePart,
    'p3-r3-headings-summary-ynng': ieltsReadingP3HeadingsSummaryYnngPart,
    'p3-r3-headings-gap-ynng': ieltsReadingP3HeadingsGapYnngPart,
    'p3-r3-headings-mc-ynng': ieltsReadingP3HeadingsMcYnngPart,
    'p3-r3-table-ynng-match': ieltsReadingP3TableYnngMatchPart,
    'p3-r3-summary-mc-endings': ieltsReadingP3SummaryMcEndingsPart,
    'p3-r3-features-ynng-summary': ieltsReadingP3FeaturesYnngSummaryPart,
    'p3-r3-tfng-notes-mc': ieltsReadingP3TfngNotesMcPart,
    'p3-r3-endings-summary-mc': ieltsReadingP3EndingsSummaryMcPart,
    'p3-r3-match-summary-features': ieltsReadingP3MatchSummaryFeaturesPart,
    'p3-r3-match-features-summary': ieltsReadingP3MatchFeaturesSummaryPart,
    'p3-r3-ynng-summary-mc': ieltsReadingP3YnngSummaryMcPart,
    'p3-r3-ynng-summary-bank-mc': ieltsReadingP3YnngSummaryBankMcPart,
    'p3-r3-summary-bank-ynng-mc': ieltsReadingP3SummaryBankYnngMcPart,
    'p3-r3-mc-endings-ynng': ieltsReadingP3McEndingsYnngPart,
    'p3-r3-mc-summary-gap-ynng': ieltsReadingP3McSummaryGapYnngPart,
    'p3-r3-features-endings-mc': ieltsReadingP3FeaturesEndingsMcPart,
  }
}


function assertAllTemplateBuildersRegistered(): void {
  try {
    const builders = getTemplateBuilders()
    const missing: string[] = []
    for (const passageNumber of IELTS_READING_PASSAGE_NUMBERS) {
      for (const option of templateOptionsForPassage(passageNumber)) {
        if (typeof builders[option.kind] !== 'function') {
          missing.push(option.kind)
        }
      }
    }
    if (missing.length) {
      console.error(
        '[ieltsReadingPartTemplates] TEMPLATE_BUILDERS thiếu:',
        missing.join(', '),
      )
    }
  } catch (err) {
    console.error('[ieltsReadingPartTemplates] assert builders failed', err)
  }
}

// Defer assert — không chặn load module khi HMR partial
if (typeof queueMicrotask === 'function') {
  queueMicrotask(assertAllTemplateBuildersRegistered)
} else {
  setTimeout(assertAllTemplateBuildersRegistered, 0)
}

/** Chuẩn hóa kind + xác nhận builder tồn tại (dùng trong Wizard / AI). */
export function resolveReadingTemplateKind(
  passageNumber: IeltsReadingPassageNumber,
  kind: string,
): IeltsReadingWizardTemplateKind {
  const resolved = resolveReadingTemplateKindFromCatalog(passageNumber, kind)
  if (isKnownReadingTemplateKind(passageNumber, resolved)) {
    try {
      const builders = getTemplateBuilders()
      if (typeof builders[resolved] === 'function') return resolved
    } catch {
      // HMR partial
    }
  }
  return IELTS_READING_DEFAULT_TEMPLATES[passageNumber]
}

export function getIeltsReadingWizardTemplatePart(
  passageNumber: IeltsReadingPassageNumber,
  kind: IeltsReadingWizardTemplateKind,
): ReadingImportPartJson {
  const resolved = resolveReadingTemplateKind(passageNumber, kind)
  const builders = getTemplateBuilders()
  const builder = builders[resolved]
  if (typeof builder !== 'function') {
    throw new Error(
      `Reading template builder không tồn tại: "${resolved}" (passage ${passageNumber}, yêu cầu "${kind}"). Hard refresh Ctrl+Shift+R.`,
    )
  }
  const part = builder()
  return { ...part, partNumber: passageNumber }
}