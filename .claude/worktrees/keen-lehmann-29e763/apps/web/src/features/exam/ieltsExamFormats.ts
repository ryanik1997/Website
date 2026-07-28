export interface IeltsListeningFormat {
  parts: number
  questions: number
  questionsPerPart: number
  durationMinutes: number
  accents: string
  deliveryNote: string
}

export const IELTS_LISTENING_FORMAT: IeltsListeningFormat = {
  parts: 4,
  questions: 40,
  questionsPerPart: 10,
  durationMinutes: 30,
  accents: 'UK · Australia · US · New Zealand',
  deliveryNote: 'Thi trên máy tính — gõ đáp án khi nghe, không có 10 phút chuyển đáp án.',
}

export const IELTS_LISTENING_PARTS = [
  {
    part: 1,
    style: 'Conversation',
    speakers: '2 người',
    context: 'Đời sống hàng ngày (đặt phòng, khám bệnh, đăng ký khóa học…)',
    difficulty: 'Dễ nhất',
    questions: '1–10',
  },
  {
    part: 2,
    style: 'Monologue',
    speakers: '1 người',
    context: 'Thông tin xã hội (hướng dẫn tour, thông báo khu vực…)',
    difficulty: 'Dễ',
    questions: '11–20',
  },
  {
    part: 3,
    style: 'Conversation',
    speakers: '2–4 người',
    context: 'Học thuật (sinh viên thảo luận với giáo viên / nhóm học)',
    difficulty: 'Trung bình',
    questions: '21–30',
  },
  {
    part: 4,
    style: 'Monologue (Lecture)',
    speakers: '1 người',
    context: 'Bài giảng đại học',
    difficulty: 'Khó nhất',
    questions: '31–40',
  },
] as const

export function ieltsListeningBandHint(sampleQuestions: number): string {
  const f = IELTS_LISTENING_FORMAT
  return `IELTS · ${f.parts} parts · ${sampleQuestions}/${f.questions} câu · ~${f.durationMinutes} phút · Academic & GT · ${f.deliveryNote}`
}