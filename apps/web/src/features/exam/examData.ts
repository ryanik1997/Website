export type ExamSkill = 'reading' | 'listening' | 'writing'

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
  type: 'true-false-not-given' | 'multiple-choice'
  prompt: string
  options: ReadingQuestionOption[]
  answer: string
  explanation: string
}

export interface ReadingPart {
  id: string
  title: string
  passageTitle: string
  passage: string[]
  questions: ReadingQuestion[]
}

export interface ReadingExam {
  id: string
  title: string
  durationMinutes: number
  bandHint: string
  parts: ReadingPart[]
}

export const EXAM_LIBRARY: ExamLibraryItem[] = [
  {
    id: 'ielts-mock-01',
    title: 'IELTS Mock Test 01',
    description: 'Bo de mau voi Reading, Listening va Writing theo format IELTS Academic.',
    skills: ['reading', 'listening', 'writing'],
    durationMinutes: 160,
  },
  {
    id: 'ielts-mock-02',
    title: 'IELTS Mock Test 02',
    description: 'Them mot bo de mau de user co lua chon va lam full test sau nay.',
    skills: ['reading', 'listening', 'writing'],
    durationMinutes: 160,
  },
]

export const READING_EXAMS: ReadingExam[] = [
  {
    id: 'ielts-reading-01',
    title: 'Reading Mock Test 01',
    durationMinutes: 60,
    bandHint: 'Muc tieu 6.5 - 7.5',
    parts: [
      {
        id: 'part-1',
        title: 'Part 1',
        passageTitle: 'The Return of Urban Wetlands',
        passage: [
          'Over the past two decades, several cities have started restoring wetlands that had previously been drained for construction. Urban planners once viewed wetlands as wasted land, but environmental data now shows that they reduce flooding, filter polluted water, and support biodiversity.',
          'In one coastal city, the local council removed concrete channels and reconnected a river to its natural floodplain. Within three years, peak flood levels during storms had dropped noticeably. Residents also reported more birds and cleaner public spaces around the restored area.',
          'However, restoration is not always popular at the beginning. Some business owners fear that construction work and temporary road closures will reduce customer traffic. To address this, councils often combine environmental restoration with public walkways, cafes, and outdoor education spaces.',
          'Researchers caution that wetlands alone cannot solve every climate problem. They work best when combined with stronger drainage systems, stricter building rules, and long-term monitoring. Even so, they are now considered one of the most cost-effective forms of urban resilience.',
        ],
        questions: [
          {
            id: 'q1',
            number: 1,
            type: 'true-false-not-given',
            prompt: 'Urban planners have always understood the flood-control value of wetlands.',
            options: [
              { id: 'true', label: 'True' },
              { id: 'false', label: 'False' },
              { id: 'not-given', label: 'Not Given' },
            ],
            answer: 'false',
            explanation: 'Doan dau cho biet truoc day quy hoach do thi coi wetlands la dat lang phi, khong phai da luon hieu gia tri cua no.',
          },
          {
            id: 'q2',
            number: 2,
            type: 'true-false-not-given',
            prompt: 'Peak flood levels in the coastal city disappeared completely after restoration.',
            options: [
              { id: 'true', label: 'True' },
              { id: 'false', label: 'False' },
              { id: 'not-given', label: 'Not Given' },
            ],
            answer: 'false',
            explanation: 'Bai doc chi noi muc nuoc lu cao nhat giam dang ke, khong noi la bien mat hoan toan.',
          },
          {
            id: 'q3',
            number: 3,
            type: 'multiple-choice',
            prompt: 'Why do councils add walkways and cafes to some restoration projects?',
            options: [
              { id: 'a', label: 'To replace lost housing near the wetlands' },
              { id: 'b', label: 'To reduce opposition from local businesses and residents' },
              { id: 'c', label: 'To increase the speed of construction work' },
              { id: 'd', label: 'To avoid monitoring the wetland in the future' },
            ],
            answer: 'b',
            explanation: 'Doan 3 noi ro hoi dong thuong ket hop phuc hoi moi truong voi khong gian cong cong de giam lo ngai cua doanh nghiep.',
          },
          {
            id: 'q4',
            number: 4,
            type: 'multiple-choice',
            prompt: 'What is the main view of researchers in the final paragraph?',
            options: [
              { id: 'a', label: 'Wetlands should replace all drainage systems' },
              { id: 'b', label: 'Wetlands are useful but should be part of a wider strategy' },
              { id: 'c', label: 'Wetlands are too expensive for most cities' },
              { id: 'd', label: 'Wetlands only work in coastal locations' },
            ],
            answer: 'b',
            explanation: 'Doan cuoi noi wetlands hieu qua nhat khi ket hop voi he thong thoat nuoc, quy dinh xay dung va theo doi dai han.',
          },
        ],
      },
    ],
  },
]

export function getReadingExam(examId: string) {
  return READING_EXAMS.find(exam => exam.id === examId) ?? null
}
