import type { WritingDoc } from '@ryan/db'

export const IELTS_DOC_TYPES: WritingDoc['type'][] = [
  'ielts', 'ielts_task1', 'ielts_task2', 'master',
]

export const CAMBRIDGE_DOC_TYPES: WritingDoc['type'][] = [
  'cambridge_a2',
  'cambridge_b1',
  'cambridge_b2',
  'cambridge_c1',
  'cambridge_c2',
]

export type DocTypeOption = {
  id: WritingDoc['type']
  label: string
  desc: string
  placeholder: string
  target: string
}

export const IELTS_DOC_TYPE_OPTIONS: DocTypeOption[] = [
  {
    id: 'ielts_task2',
    label: 'IELTS Task 2 — Essay',
    desc: 'Agree/disagree, discuss, problem-solution (~250 từ)',
    placeholder: 'VD: Cooking as a Popular Hobby\n\nIn recent years, many people have become interested in cooking as a hobby. Is this a positive or negative development?',
    target: 'Mục tiêu ≥ 250 từ',
  },
  {
    id: 'ielts_task1',
    label: 'IELTS Task 1 — Report',
    desc: 'Mô tả biểu đồ / quy trình (~150 từ) — nên import ảnh đề',
    placeholder: 'VD: The graph below shows the percentage of people in different age groups who used the internet every day in the UK between 2003 and 2006.',
    target: 'Mục tiêu ≥ 150 từ',
  },
  {
    id: 'master',
    label: 'Viết tự do',
    desc: 'Bài viết tự do — AI nhận xét tổng thể',
    placeholder: 'Chủ đề / ghi chú (tuỳ chọn)',
    target: '',
  },
]

export const CAMBRIDGE_DOC_TYPE_OPTIONS: DocTypeOption[] = [
  {
    id: 'cambridge_a2',
    label: 'Cambridge A2 (KET)',
    desc: 'Email / note ngắn (~35–45 từ)',
    placeholder: 'VD: Write an email to your friend about a party you are going to next week.',
    target: 'Mục tiêu ≥ 35 từ',
  },
  {
    id: 'cambridge_b1',
    label: 'Cambridge B1 (PET)',
    desc: 'Email / article (~100 từ)',
    placeholder: 'VD: Your teacher has asked you to write an article about your favourite hobby for the school magazine.',
    target: 'Mục tiêu ≥ 100 từ',
  },
  {
    id: 'cambridge_b2',
    label: 'Cambridge B2 (FCE)',
    desc: 'Essay / report / review (~140–190 từ)',
    placeholder: 'VD: In your English class you have been talking about the environment. Write an essay about what young people can do to protect the environment.',
    target: 'Mục tiêu ≥ 140 từ',
  },
  {
    id: 'cambridge_c1',
    label: 'Cambridge C1 (CAE)',
    desc: 'Essay / proposal / report (~180–220 từ)',
    placeholder: 'VD: Your class has been discussing whether governments should spend more on public transport. Write an essay giving your opinion.',
    target: 'Mục tiêu ≥ 180 từ',
  },
  {
    id: 'cambridge_c2',
    label: 'Cambridge C2 (CPE)',
    desc: 'Discursive / descriptive essay (~250–300 từ)',
    placeholder: 'VD: Write an essay discussing the extent to which technology has changed the way people form relationships.',
    target: 'Mục tiêu ≥ 250 từ',
  },
]

export const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  ielts_task2: { label: 'Task 2', color: '#6366f1' },
  ielts_task1: { label: 'Task 1', color: '#8b5cf6' },
  ielts: { label: 'IELTS', color: '#6366f1' },
  master: { label: 'Free', color: '#10b981' },
  cambridge_a2: { label: 'A2', color: '#3b82f6' },
  cambridge_b1: { label: 'B1', color: '#2563eb' },
  cambridge_b2: { label: 'B2', color: '#1d4ed8' },
  cambridge_c1: { label: 'C1', color: '#1e40af' },
  cambridge_c2: { label: 'C2', color: '#172554' },
}