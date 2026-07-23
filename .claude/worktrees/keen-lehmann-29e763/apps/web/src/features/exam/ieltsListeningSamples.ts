import {
  countListeningQuestions,
  listeningGap,
  listeningMc,
} from './cambridgeSampleBuilders'
import { ieltsListeningBandHint } from './ieltsExamFormats'
import type { ListeningExam, ListeningPart, ListeningQuestion } from './listeningExamData'

type McTuple = [string, [string, string, string], 'A' | 'B' | 'C', string]

const EXAM_ID = 'ielts-listening-sample-01'
const EXAM_TYPE = 'ielts' as const

function mcQuestions(partNum: number, start: number, items: McTuple[], type: 'multiple-choice' | 'matching' = 'multiple-choice'): ListeningQuestion[] {
  return items.map(([prompt, opts, answer, expl], i) =>
    listeningMc(EXAM_TYPE, partNum, start + i, prompt, opts, answer, expl, type),
  )
}

function gapQuestions(
  partNum: number,
  start: number,
  items: [string, string, string][],
): ListeningQuestion[] {
  return items.map(([prompt, answer, expl], i) =>
    listeningGap(EXAM_TYPE, partNum, start + i, prompt, answer, expl),
  )
}

function listeningPart(
  partNumber: number,
  start: number,
  end: number,
  instruction: string,
  ttsText: string,
  questions: ListeningQuestion[],
): ListeningPart {
  return {
    id: `${EXAM_ID}-part-${partNumber}`,
    partNumber,
    rangeLabel: `Questions ${start}–${end}`,
    instruction,
    ttsText,
    questions,
  }
}

function buildIeltsListeningSample(): ListeningExam {
  const part1 = listeningPart(1, 1, 10,
    'Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
    'Part 1. You will hear a woman booking a hotel room. Questions 1 to 10.',
    gapQuestions(1, 1, [
      ['Customer name:', 'sarah mitchell', 'She spells Mitchell with two Ls.'],
      ['Check-in date:', '14 june', 'They confirm the fourteenth of June.'],
      ['Number of nights:', '3', 'The booking is for three nights.'],
      ['Room type:', 'double sea view', 'She requests a double room with a sea view.'],
      ['Contact phone:', '07792 441805', 'She repeats her mobile number.'],
      ['Arrival time:', '6 pm', 'They expect to arrive around six in the evening.'],
      ['Special request:', 'quiet floor', 'She asks for a room on a quiet floor.'],
      ['Breakfast included:', 'yes', 'The rate includes breakfast.'],
      ['Payment method:', 'credit card', 'She will pay by credit card on arrival.'],
      ['Booking reference:', 'hk2841', 'The agent gives reference HK2841.'],
    ]),
  )

  const part2 = listeningPart(2, 11, 20,
    'Questions 11–15: Choose A, B or C. Questions 16–20: Choose A, B or C (matching facilities).',
    'Part 2. You will hear a speaker describing a community centre. Questions 11 to 20.',
    [
      ...mcQuestions(2, 11, [
        ['The centre opens on Sundays at', ['9 a.m.', '10 a.m.', '11 a.m.'], 'B', 'Sunday opening is ten o\'clock.'],
        ['Membership costs per year', ['£25', '£35', '£45'], 'C', 'Annual membership is forty-five pounds.'],
        ['The swimming pool closes for cleaning on', ['Mondays', 'Wednesdays', 'Fridays'], 'A', 'Pool maintenance is every Monday morning.'],
        ['Children under 8 must', ['wear armbands', 'be accompanied', 'book in advance'], 'B', 'Under-eights must be with an adult.'],
        ['The café is located next to the', ['library', 'sports hall', 'car park'], 'C', 'The café is beside the car park entrance.'],
      ]),
      ...mcQuestions(2, 16, [
        ['Fitness classes — best day', ['Tuesday morning', 'Thursday evening', 'Saturday afternoon'], 'B', 'Evening classes on Thursday are least crowded.'],
        ['Art workshop — suitable for', ['beginners only', 'experienced painters', 'all levels'], 'C', 'The art tutor welcomes all levels.'],
        ['Parking — use', ['street bays only', 'the rear car park', 'the bus station'], 'B', 'Visitors should use the rear car park.'],
        ['Volunteer desk — open', ['weekdays only', 'weekends only', 'every day'], 'A', 'Volunteer sign-up is weekday mornings.'],
        ['Guided tour — starts at', ['the reception', 'the pool entrance', 'the art studio'], 'A', 'Tours begin at reception.'],
      ], 'matching'),
    ],
  )

  const part3 = listeningPart(3, 21, 30,
    'Questions 21–26: Complete the notes. Questions 27–30: Choose A, B or C.',
    'Part 3. You will hear students discussing a research project with their tutor. Questions 21 to 30.',
    [
      ...gapQuestions(3, 21, [
        ['Project title:', 'city beekeeping', 'They focus on urban beekeeping initiatives.'],
        ['Supervisor:', 'dr henderson', 'Dr Henderson approved the topic.'],
        ['Method:', 'interviews', 'Primary data comes from interviews.'],
        ['Number of participants:', '12', 'They will interview twelve volunteers.'],
        ['First draft due:', '3 may', 'Submit the first draft on the third of May.'],
        ['Main challenge:', 'access', 'Gaining site access is the main difficulty.'],
      ]),
      ...mcQuestions(3, 27, [
        ['The tutor suggests they should', ['narrow the topic', 'change supervisors', 'use more surveys'], 'A', 'The topic is too broad at present.'],
        ['Ethics approval is needed because', ['they interview children', 'they enter private gardens', 'they publish photos'], 'B', 'Some gardens are on private land.'],
        ['The library workshop is on', ['data analysis', 'literature review', 'presentation skills'], 'C', 'A workshop on presentation skills is recommended.'],
        ['They agree to meet again on', ['Monday', 'Wednesday', 'Friday'], 'B', 'They will meet Wednesday after the lecture.'],
      ]),
    ],
  )

  const part4 = listeningPart(4, 31, 40,
    'Questions 31–36: Complete the notes. Questions 37–40: Choose A, B or C.',
    'Part 4. You will hear a university lecture about marine ecosystems. Questions 31 to 40.',
    [
      ...gapQuestions(4, 31, [
        ['Lecture topic:', 'coral bleaching', 'Today\'s lecture concerns coral bleaching.'],
        ['Main cause discussed:', 'temperature rise', 'Rising sea temperature triggers bleaching.'],
        ['Affected region example:', 'great barrier reef', 'The Great Barrier Reef is cited.'],
        ['Recovery period:', '10 years', 'Full recovery may take a decade.'],
        ['Key species affected:', 'algae', 'Symbiotic algae leave the coral tissue.'],
        ['Research method:', 'satellite imaging', 'Scientists use satellite imaging to monitor reefs.'],
      ]),
      ...mcQuestions(4, 37, [
        ['The speaker\'s main concern is', ['tourism revenue', 'loss of biodiversity', 'fishing quotas'], 'B', 'Biodiversity loss is the central issue.'],
        ['Local communities can help by', ['banning all fishing', 'monitoring water quality', 'building hotels'], 'B', 'Community monitoring improves early warning.'],
        ['International agreements are', ['fully effective', 'difficult to enforce', 'no longer relevant'], 'B', 'Enforcement across nations remains weak.'],
        ['Next week\'s seminar will cover', ['policy options', 'exam technique', 'lab safety'], 'A', 'Next week focuses on policy responses.'],
      ]),
    ],
  )

  const parts = [part1, part2, part3, part4]

  return {
    id: EXAM_ID,
    title: 'IELTS Sample Test — Listening (Academic & GT)',
    durationMinutes: 30,
    bandHint: ieltsListeningBandHint(countListeningQuestions(parts)),
    examType: 'ielts',
    examMode: 'practice',
    parts,
  }
}

/** Đề Listening mẫu builtin — 4 parts · 40 câu · ~30 phút */
export const IELTS_LISTENING_SAMPLES: ListeningExam[] = [
  buildIeltsListeningSample(),
]