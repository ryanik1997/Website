import { CATALOG_READING_EXAMS } from '@ryan/catalog'
import { CAMBRIDGE_READING_SAMPLES } from './cambridgeReadingSamples'

export type ExamSkill = 'reading' | 'listening' | 'writing'

export type ReadingQuestionType =
  | 'true-false-not-given'
  | 'multiple-choice'
  | 'matching-paragraph'
  | 'matching-features'
  | 'gap-fill'
  | 'summary-completion'
  | 'sentence-completion'

export type AnswerConfidence = 'key' | 'inferred'

export interface ExamLibraryItem {
  id: string
  title: string
  description: string
  skills: ExamSkill[]
  durationMinutes: number
}

export interface ReadingQuestionOption {
  id: string
  label: string
}

export interface ReadingQuestion {
  id: string
  number: number
  type: ReadingQuestionType
  prompt: string
  options: ReadingQuestionOption[]
  answer: string
  explanation: string
  answerConfidence?: AnswerConfidence
}

export interface ReadingPassageBlock {
  label?: string
  text: string
  /** Blob key ảnh đoạn văn (import thủ công) */
  imageKey?: string
  imageUrl?: string
}

export interface ReadingQuestionGroup {
  id: string
  range: string
  instruction: string
  note?: string
  type:
    | 'tfng'
    | 'matching-paragraph'
    | 'matching-features'
    | 'multiple-choice'
    | 'gap-fill'
    | 'summary-completion'
    | 'sentence-completion'
  paragraphLetters?: string[]
  features?: { id: string; name: string }[]
  wordBank?: ReadingQuestionOption[]
  questions: ReadingQuestion[]
}

export interface ReadingPart {
  id: string
  partNumber: number
  rangeLabel: string
  passageTitle: string
  passageSubtitle?: string
  passage: ReadingPassageBlock[]
  questionGroups: ReadingQuestionGroup[]
}

export type ReadingExamTrack = 'ielts' | 'cambridge'

export interface ReadingExam {
  id: string
  title: string
  durationMinutes: number
  bandHint: string
  parts: ReadingPart[]
  examTrack?: ReadingExamTrack
  cambridgeLevel?: 'a2' | 'b1' | 'b2' | 'c1' | 'c2'
}

export const EXAM_LIBRARY: ExamLibraryItem[] = [
  {
    id: 'ielts-mock-01',
    title: 'Đề thi IELTS số 01',
    description: 'Bộ đề mẫu Reading và Listening theo format IELTS Academic.',
    skills: ['reading', 'listening'],
    durationMinutes: 160,
  },
  {
    id: 'ielts-mock-02',
    title: 'Đề thi IELTS số 02',
    description: 'Thêm một bộ đề mẫu Reading và Listening.',
    skills: ['reading', 'listening'],
    durationMinutes: 160,
  },
]

const TFNG_OPTIONS: ReadingQuestionOption[] = [
  { id: 'true', label: 'TRUE' },
  { id: 'false', label: 'FALSE' },
  { id: 'not-given', label: 'NOT GIVEN' },
]

export const READING_EXAMS: ReadingExam[] = [
  {
    id: 'ielts-reading-01',
    title: 'IELTS Academic Reading — Mock Test 01',
    durationMinutes: 60,
    bandHint: 'Academic 6.5 – 7.5',
    examTrack: 'ielts',
    parts: [
      {
        id: 'part-1',
        partNumber: 1,
        rangeLabel: 'Read the text and answer questions 1–13.',
        passageTitle: 'The kākāpō',
        passage: [
          {
            text: 'The kākāpō is a nocturnal, flightless parrot that is critically endangered and found only in New Zealand. It is the heaviest parrot in the world and can live for up to 100 years. Its plumage is a striking combination of green and yellow, which provides excellent camouflage in its forest habitat.',
          },
          {
            text: 'Kākāpō are solitary birds that forage on the ground at night. Although they cannot fly, they are excellent climbers and can use their wings to glide short distances. Their diet is completely vegetarian, consisting of leaves, seeds, fruit, and pollen.',
          },
          {
            text: 'Breeding is a demanding process. Females lay eggs only in summer and autumn when food is plentiful, and they alone incubate the eggs and feed the chicks. Males play no part in raising the young. Because breeding depends on abundant food supplies, adult kākāpō do not produce chicks every year.',
          },
          {
            text: 'Before humans arrived, kākāpō were common across New Zealand. Polynesian settlers brought predators such as dogs and rats, and later European colonisation caused widespread habitat loss. By the late twentieth century, the species was on the brink of extinction.',
          },
          {
            text: 'In 1894 the New Zealand government launched its first attempt to save the kākāpō. Conservationists later established predator-free islands where the remaining birds could breed safely. Today, intensive management continues, but the kākāpō remains one of the world\'s most endangered birds.',
          },
        ],
        questionGroups: [
          {
            id: 'p1-g1',
            range: 'Questions 1–6',
            type: 'tfng',
            instruction:
              'Do the following statements agree with the information given in Reading Passage 1? In boxes 1–6 on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
            questions: [
              {
                id: 'q1',
                number: 1,
                type: 'true-false-not-given',
                prompt: 'There are other parrots that share the kākāpō\'s inability to fly.',
                options: TFNG_OPTIONS,
                answer: 'not-given',
                explanation: 'The passage states the kākāpō is flightless but does not compare it with other parrots.',
              },
              {
                id: 'q2',
                number: 2,
                type: 'true-false-not-given',
                prompt: 'Adult kākāpō produce chicks every year.',
                options: TFNG_OPTIONS,
                answer: 'false',
                explanation: 'The text says breeding depends on food supplies, so chicks are not produced every year.',
              },
              {
                id: 'q3',
                number: 3,
                type: 'true-false-not-given',
                prompt: 'Adult male kākāpō bring food back to nesting females.',
                options: TFNG_OPTIONS,
                answer: 'false',
                explanation: 'Males play no part in raising the young; females alone feed the chicks.',
              },
              {
                id: 'q4',
                number: 4,
                type: 'true-false-not-given',
                prompt: 'Kākāpō can use their wings to move between trees.',
                options: TFNG_OPTIONS,
                answer: 'true',
                explanation: 'The passage says they can use their wings to glide short distances and are excellent climbers.',
              },
              {
                id: 'q5',
                number: 5,
                type: 'true-false-not-given',
                prompt: 'European settlers were the first humans to threaten kākāpō populations.',
                options: TFNG_OPTIONS,
                answer: 'false',
                explanation: 'Polynesian settlers arrived earlier and also brought predators.',
              },
              {
                id: 'q6',
                number: 6,
                type: 'true-false-not-given',
                prompt: 'Predator-free islands were created to protect breeding kākāpō.',
                options: TFNG_OPTIONS,
                answer: 'true',
                explanation: 'Conservationists established predator-free islands for safe breeding.',
              },
            ],
          },
          {
            id: 'p1-g2',
            range: 'Questions 7–13',
            type: 'multiple-choice',
            instruction: 'Choose the correct letter, A, B, C or D.',
            questions: [
              {
                id: 'q7',
                number: 7,
                type: 'multiple-choice',
                prompt: 'What is emphasized about the kākāpō\'s appearance?',
                options: [
                  { id: 'a', label: 'Its bright colours help it hide in the forest' },
                  { id: 'b', label: 'It changes colour with the seasons' },
                  { id: 'c', label: 'It is larger than any other bird in New Zealand' },
                  { id: 'd', label: 'It has feathers similar to those of seabirds' },
                ],
                answer: 'a',
                explanation: 'Green and yellow plumage provides camouflage in forest habitat.',
              },
              {
                id: 'q8',
                number: 8,
                type: 'multiple-choice',
                prompt: 'When do female kākāpō usually lay eggs?',
                options: [
                  { id: 'a', label: 'Throughout the year' },
                  { id: 'b', label: 'Only in winter' },
                  { id: 'c', label: 'In summer and autumn when food is plentiful' },
                  { id: 'd', label: 'Only after government intervention' },
                ],
                answer: 'c',
                explanation: 'Females lay eggs in summer and autumn when food is plentiful.',
              },
              {
                id: 'q9',
                number: 9,
                type: 'multiple-choice',
                prompt: 'What happened to kākāpō numbers before conservation efforts intensified?',
                options: [
                  { id: 'a', label: 'They increased on mainland farms' },
                  { id: 'b', label: 'They remained stable for centuries' },
                  { id: 'c', label: 'They were exported to other countries' },
                  { id: 'd', label: 'They declined severely and neared extinction' },
                ],
                answer: 'd',
                explanation: 'By the late twentieth century the species was on the brink of extinction.',
              },
              {
                id: 'q10',
                number: 10,
                type: 'multiple-choice',
                prompt: 'The 1894 government action was aimed at',
                options: [
                  { id: 'a', label: 'saving the kākāpō' },
                  { id: 'b', label: 'introducing new predators' },
                  { id: 'c', label: 'relocating all parrots to Australia' },
                  { id: 'd', label: 'banning nocturnal hunting' },
                ],
                answer: 'a',
                explanation: 'The government launched its first attempt to save the kākāpō in 1894.',
              },
              {
                id: 'q11',
                number: 11,
                type: 'multiple-choice',
                prompt: 'Kākāpō diet consists entirely of',
                options: [
                  { id: 'a', label: 'insects and small mammals' },
                  { id: 'b', label: 'plant material' },
                  { id: 'c', label: 'fish and shellfish' },
                  { id: 'd', label: 'food provided by conservation staff only' },
                ],
                answer: 'b',
                explanation: 'Their diet is completely vegetarian.',
              },
              {
                id: 'q12',
                number: 12,
                type: 'multiple-choice',
                prompt: 'Which factor made early European settlement especially damaging?',
                options: [
                  { id: 'a', label: 'Widespread habitat loss' },
                  { id: 'b', label: 'A ban on forest climbing' },
                  { id: 'c', label: 'Reduced rainfall' },
                  { id: 'd', label: 'Competition from other parrots' },
                ],
                answer: 'a',
                explanation: 'European colonisation caused widespread habitat loss.',
              },
              {
                id: 'q13',
                number: 13,
                type: 'multiple-choice',
                prompt: 'The writer suggests that today the kākāpō',
                options: [
                  { id: 'a', label: 'no longer needs human support' },
                  { id: 'b', label: 'is still among the most endangered birds' },
                  { id: 'c', label: 'has recovered fully in the wild' },
                  { id: 'd', label: 'lives only in European zoos' },
                ],
                answer: 'b',
                explanation: 'Intensive management continues and it remains one of the most endangered birds.',
              },
            ],
          },
        ],
      },
      {
        id: 'part-2',
        partNumber: 2,
        rangeLabel: 'Read the text and answer questions 14–26.',
        passageTitle: 'Reintroducing elms to Britain',
        passageSubtitle: 'Mark Rowe investigates attempts to reintroduce elms to Britain',
        passage: [
          {
            label: 'A',
            text: 'Around 25 million elms died in Britain in the 1960s and 1970s from Dutch elm disease. The loss of 90% of Britain\'s elms changed the landscape. Today, conservationists hope to reintroduce elms in central and southern England. Matt Elliot of the Woodland Trust says disease-resistant strains offer real hope.',
          },
          {
            label: 'B',
            text: 'Dutch elm disease is caused by a fungus that blocks the tree\'s vascular system. The first epidemic arrived in the 1920s. A far more destructive epidemic followed in the 1970s after infected elm logs were imported from Canada. Bark beetles spread the fungus between trees.',
          },
          {
            label: 'C',
            text: 'Elms can still be found in southern England, though mainly as small hedgerow trees. When the trunk reaches 10–15 cm in diameter, the tree becomes vulnerable to beetles carrying the disease. Larger surviving elms are now extremely rare.',
          },
          {
            label: 'D',
            text: 'One valley in Scotland has remained largely free of the disease because of its isolation and climate. Researchers study these locations to understand how some areas escape infection while neighbouring regions do not.',
          },
          {
            label: 'E',
            text: 'Some landowners disagree about whether reintroducing elms is worthwhile. Critics argue that resources should focus on native species already under threat. Supporters believe elm avenues are part of Britain\'s cultural heritage and worth restoring.',
          },
          {
            label: 'F',
            text: 'Scientists working with surviving mature elms face practical difficulties because so few large specimens remain. Collecting genetic material from scattered trees slows breeding programmes designed to produce resistant varieties.',
          },
          {
            label: 'G',
            text: 'New planting schemes combine resistant cultivars with careful monitoring. Young trees are inspected regularly so that infection can be detected before it spreads. The aim is not only to restore elm numbers but to learn how to manage future outbreaks.',
          },
        ],
        questionGroups: [
          {
            id: 'p2-g1',
            range: 'Questions 14–18',
            type: 'matching-paragraph',
            instruction: 'Reading Passage 2 has seven paragraphs, A–G. Which paragraph contains the following information?',
            note: 'NB You may use any letter more than once.',
            paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            questions: [
              {
                id: 'q14',
                number: 14,
                type: 'matching-paragraph',
                prompt: 'reference to the research problems that arise from there being only a few surviving large elms',
                options: [],
                answer: 'f',
                explanation: 'Paragraph F discusses difficulties because few large specimens remain.',
              },
              {
                id: 'q15',
                number: 15,
                type: 'matching-paragraph',
                prompt: 'details of a difference of opinion about the value of reintroducing elms to Britain',
                options: [],
                answer: 'e',
                explanation: 'Paragraph E describes disagreement among landowners.',
              },
              {
                id: 'q16',
                number: 16,
                type: 'matching-paragraph',
                prompt: 'reference to how Dutch elm disease was brought to Britain',
                options: [],
                answer: 'b',
                explanation: 'Paragraph B mentions infected logs imported from Canada.',
              },
              {
                id: 'q17',
                number: 17,
                type: 'matching-paragraph',
                prompt: 'a description of the conditions that have enabled a location in Britain to escape Dutch elm disease',
                options: [],
                answer: 'd',
                explanation: 'Paragraph D describes a Scottish valley that remained disease-free.',
              },
              {
                id: 'q18',
                number: 18,
                type: 'matching-paragraph',
                prompt: 'reference to the stage at which young elms become vulnerable to Dutch elm disease',
                options: [],
                answer: 'c',
                explanation: 'Paragraph C states vulnerability when trunks reach 10–15 cm.',
              },
            ],
          },
          {
            id: 'p2-g2',
            range: 'Questions 19–23',
            type: 'matching-features',
            instruction: 'Look at the following statements and the list of people below. Match each statement with the correct person, A–C.',
            note: 'NB You may use any letter more than once.',
            features: [
              { id: 'a', name: 'Matt Elliot' },
              { id: 'b', name: 'Mark Rowe' },
              { id: 'c', name: 'A Scottish researcher' },
            ],
            questions: [
              {
                id: 'q19',
                number: 19,
                type: 'matching-features',
                prompt: 'expresses optimism about disease-resistant strains',
                options: [],
                answer: 'a',
                explanation: 'Matt Elliot says disease-resistant strains offer real hope.',
              },
              {
                id: 'q20',
                number: 20,
                type: 'matching-features',
                prompt: 'reports on attempts to restore a traditional tree to the landscape',
                options: [],
                answer: 'b',
                explanation: 'Mark Rowe investigates reintroduction attempts.',
              },
              {
                id: 'q21',
                number: 21,
                type: 'matching-features',
                prompt: 'studies an area that has largely avoided infection',
                options: [],
                answer: 'c',
                explanation: 'Researchers study the Scottish valley mentioned in paragraph D.',
              },
              {
                id: 'q22',
                number: 22,
                type: 'matching-features',
                prompt: 'represents an organisation focused on woodland conservation',
                options: [],
                answer: 'a',
                explanation: 'Matt Elliot works for the Woodland Trust.',
              },
              {
                id: 'q23',
                number: 23,
                type: 'matching-features',
                prompt: 'describes how bark beetles spread infection',
                options: [],
                answer: 'b',
                explanation: 'The article by Mark Rowe explains beetle transmission in paragraph B.',
              },
            ],
          },
          {
            id: 'p2-g3',
            range: 'Questions 24–26',
            type: 'multiple-choice',
            instruction: 'Choose the correct letter, A, B, C or D.',
            questions: [
              {
                id: 'q24',
                number: 24,
                type: 'multiple-choice',
                prompt: 'What proportion of Britain\'s elms was lost in the twentieth century?',
                options: [
                  { id: 'a', label: 'About half' },
                  { id: 'b', label: 'About 70%' },
                  { id: 'c', label: 'About 90%' },
                  { id: 'd', label: 'Almost all mature trees in Scotland' },
                ],
                answer: 'c',
                explanation: 'The passage states the loss of 90% of Britain\'s elms.',
              },
              {
                id: 'q25',
                number: 25,
                type: 'multiple-choice',
                prompt: 'Young elms become vulnerable when their trunks reach',
                options: [
                  { id: 'a', label: '10–15 cm in diameter' },
                  { id: 'b', label: '25–30 cm in diameter' },
                  { id: 'c', label: 'one metre in height only' },
                  { id: 'd', label: 'the same size as hedgerow oaks' },
                ],
                answer: 'a',
                explanation: 'Paragraph C gives the 10–15 cm figure.',
              },
              {
                id: 'q26',
                number: 26,
                type: 'multiple-choice',
                prompt: 'Modern planting schemes aim to',
                options: [
                  { id: 'a', label: 'replace all other native species' },
                  { id: 'b', label: 'avoid monitoring young trees' },
                  { id: 'c', label: 'combine resistant trees with careful monitoring' },
                  { id: 'd', label: 'remove beetles from imported logs only' },
                ],
                answer: 'c',
                explanation: 'Paragraph G describes resistant cultivars with regular inspection.',
              },
            ],
          },
        ],
      },
      {
        id: 'part-3',
        partNumber: 3,
        rangeLabel: 'Read the text and answer questions 27–40.',
        passageTitle: 'The science of sleep and memory',
        passage: [
          {
            text: 'Sleep has long been linked to memory, but only in recent decades have researchers begun to understand the mechanisms involved. Studies show that different stages of sleep support different kinds of learning, from factual recall to motor skills.',
          },
          {
            text: 'During slow-wave sleep, the brain appears to replay experiences from the day, strengthening neural connections that matter and weakening those that do not. This process may explain why students who sleep after revision often perform better in tests.',
          },
          {
            text: 'REM sleep, by contrast, is associated with more creative forms of problem solving. Volunteers woken during REM sleep sometimes solve puzzles more quickly after returning to sleep, suggesting that unusual associations are formed during this stage.',
          },
          {
            text: 'Not all findings are conclusive. Some experiments use small sample sizes, and laboratory sleep differs from sleep at home. Even so, schools and workplaces are increasingly aware that cutting sleep reduces productivity and long-term retention.',
          },
        ],
        questionGroups: [
          {
            id: 'p3-g1',
            range: 'Questions 27–32',
            type: 'tfng',
            instruction:
              'Do the following statements agree with the information given in Reading Passage 3? Write TRUE, FALSE or NOT GIVEN.',
            questions: [
              {
                id: 'q27',
                number: 27,
                type: 'true-false-not-given',
                prompt: 'Scientists have fully explained how sleep affects memory.',
                options: TFNG_OPTIONS,
                answer: 'false',
                explanation: 'The passage says researchers have only recently begun to understand mechanisms.',
              },
              {
                id: 'q28',
                number: 28,
                type: 'true-false-not-given',
                prompt: 'Slow-wave sleep may strengthen useful neural connections.',
                options: TFNG_OPTIONS,
                answer: 'true',
                explanation: 'Slow-wave sleep strengthens important connections and weakens others.',
              },
              {
                id: 'q29',
                number: 29,
                type: 'true-false-not-given',
                prompt: 'REM sleep is mainly responsible for factual recall.',
                options: TFNG_OPTIONS,
                answer: 'false',
                explanation: 'Factual recall is linked to slow-wave sleep; REM supports creative problem solving.',
              },
              {
                id: 'q30',
                number: 30,
                type: 'true-false-not-given',
                prompt: 'All sleep researchers agree on the value of laboratory experiments.',
                options: TFNG_OPTIONS,
                answer: 'not-given',
                explanation: 'Limitations are noted but no universal agreement is described.',
              },
              {
                id: 'q31',
                number: 31,
                type: 'true-false-not-given',
                prompt: 'Sleeping after revision can improve test performance.',
                options: TFNG_OPTIONS,
                answer: 'true',
                explanation: 'Students who sleep after revision often perform better.',
              },
              {
                id: 'q32',
                number: 32,
                type: 'true-false-not-given',
                prompt: 'Workplaces now completely ban overtime to protect sleep.',
                options: TFNG_OPTIONS,
                answer: 'false',
                explanation: 'Workplaces are increasingly aware of sleep loss, but no ban is mentioned.',
              },
            ],
          },
          {
            id: 'p3-g2',
            range: 'Questions 33–40',
            type: 'multiple-choice',
            instruction: 'Choose the correct letter, A, B, C or D.',
            questions: [
              {
                id: 'q33',
                number: 33,
                type: 'multiple-choice',
                prompt: 'The main purpose of the first paragraph is to',
                options: [
                  { id: 'a', label: 'reject earlier theories about sleep' },
                  { id: 'b', label: 'introduce the link between sleep and memory' },
                  { id: 'c', label: 'compare human sleep with animal sleep' },
                  { id: 'd', label: 'describe laboratory recording methods' },
                ],
                answer: 'b',
                explanation: 'The opening paragraph introduces the sleep–memory connection.',
              },
              {
                id: 'q34',
                number: 34,
                type: 'multiple-choice',
                prompt: 'During slow-wave sleep the brain',
                options: [
                  { id: 'a', label: 'stops processing daytime experiences' },
                  { id: 'b', label: 'replays and reorganises experiences' },
                  { id: 'c', label: 'forms only creative associations' },
                  { id: 'd', label: 'becomes less active than during REM sleep' },
                ],
                answer: 'b',
                explanation: 'The brain replays experiences and adjusts connections.',
              },
              {
                id: 'q35',
                number: 35,
                type: 'multiple-choice',
                prompt: 'Volunteers woken during REM sleep',
                options: [
                  { id: 'a', label: 'may solve puzzles faster after sleeping again' },
                  { id: 'b', label: 'lose all memory of the puzzle' },
                  { id: 'c', label: 'cannot return to sleep in the laboratory' },
                  { id: 'd', label: 'perform worse than those woken in slow-wave sleep' },
                ],
                answer: 'a',
                explanation: 'They sometimes solve puzzles more quickly after returning to sleep.',
              },
              {
                id: 'q36',
                number: 36,
                type: 'multiple-choice',
                prompt: 'A limitation mentioned in the text is that',
                options: [
                  { id: 'a', label: 'sleep research is illegal in schools' },
                  { id: 'b', label: 'some studies use small samples' },
                  { id: 'c', label: 'REM sleep cannot be measured' },
                  { id: 'd', label: 'memory is unrelated to neural connections' },
                ],
                answer: 'b',
                explanation: 'Some experiments use small sample sizes.',
              },
              {
                id: 'q37',
                number: 37,
                type: 'multiple-choice',
                prompt: 'Laboratory sleep differs from home sleep because',
                options: [
                  { id: 'a', label: 'the environment is unnatural' },
                  { id: 'b', label: 'volunteers sleep for longer periods' },
                  { id: 'c', label: 'only children take part' },
                  { id: 'd', label: 'REM sleep does not occur' },
                ],
                answer: 'a',
                explanation: 'Laboratory sleep differs from sleep at home.',
              },
              {
                id: 'q38',
                number: 38,
                type: 'multiple-choice',
                prompt: 'The writer suggests that reducing sleep can',
                options: [
                  { id: 'a', label: 'increase long-term retention' },
                  { id: 'b', label: 'improve creative thinking at work' },
                  { id: 'c', label: 'lower productivity' },
                  { id: 'd', label: 'have no effect on learning' },
                ],
                answer: 'c',
                explanation: 'Cutting sleep reduces productivity and retention.',
              },
              {
                id: 'q39',
                number: 39,
                type: 'multiple-choice',
                prompt: 'Different stages of sleep are important because they',
                options: [
                  { id: 'a', label: 'support different kinds of learning' },
                  { id: 'b', label: 'replace the need for daytime practice' },
                  { id: 'c', label: 'occur in the same order every night' },
                  { id: 'd', label: 'are identical in all age groups' },
                ],
                answer: 'a',
                explanation: 'Different stages support factual recall and motor skills among other types.',
              },
              {
                id: 'q40',
                number: 40,
                type: 'multiple-choice',
                prompt: 'The overall tone of the passage is',
                options: [
                  { id: 'a', label: 'cautiously informative' },
                  { id: 'b', label: 'strongly dismissive' },
                  { id: 'c', label: 'humorous and informal' },
                  { id: 'd', label: 'entirely speculative' },
                ],
                answer: 'a',
                explanation: 'The writer presents evidence while noting limitations.',
              },
            ],
          },
        ],
      },
    ],
  },
  ...CAMBRIDGE_READING_SAMPLES,
  ...(CATALOG_READING_EXAMS as ReadingExam[]),
]

export function getPartQuestions(part: ReadingPart): ReadingQuestion[] {
  return part.questionGroups.flatMap(group => group.questions)
}

export function getExamQuestions(exam: ReadingExam): ReadingQuestion[] {
  return exam.parts.flatMap(getPartQuestions)
}

export function getReadingExam(examId: string) {
  return READING_EXAMS.find(exam => exam.id === examId) ?? null
}

function normalizeReadingAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, ' ')
}

export function isReadingAnswerCorrect(question: ReadingQuestion, userAnswer: string): boolean {
  if (!userAnswer.trim()) return false
  const expected = normalizeReadingAnswer(question.answer)
  const given = normalizeReadingAnswer(userAnswer)

  if (question.type === 'gap-fill' || question.type === 'sentence-completion') {
    if (given === expected) return true
    return given.split(/\s+/).length === 1 && expected.split(/\s+/).length === 1
      && (given === expected || given.includes(expected) || expected.includes(given))
  }

  return given === expected
}

export function formatReadingAnswer(question: ReadingQuestion, answerId: string): string {
  if (!answerId) return 'Chưa trả lời'
  const fromOption = question.options.find(o => o.id === answerId)
  if (fromOption) return fromOption.label
  return answerId.toUpperCase()
}