export type SpeakingIeltsContext = {
  itemId: string
  sourceId: string
  part: 1 | 2 | 3 | null
  question: string
  cueCard: string | null
  bulletPoints: string[]
  topic: string
  expectedDuration: number | null
  evaluationMode: 'IELTS_PART_1' | 'IELTS_PART_2' | 'IELTS_PART_3' | 'SHADOWING'
}

export function createSpeakingIeltsContext(item: { id: string; sourceUrl: string; module: string; title: string; contentText: string }): SpeakingIeltsContext {
  const part = /part\s*1/i.test(item.contentText) ? 1 : /part\s*2/i.test(item.contentText) ? 2 : /part\s*3/i.test(item.contentText) ? 3 : null
  const evaluationMode = item.module === 'shadowing' ? 'SHADOWING' : part === 1 ? 'IELTS_PART_1' : part === 2 ? 'IELTS_PART_2' : 'IELTS_PART_3'
  return { itemId: item.id, sourceId: item.sourceUrl, part, question: item.contentText.split('\n').filter(Boolean)[0] ?? item.title, cueCard: part === 2 ? item.title : null, bulletPoints: item.contentText.split('\n').filter(Boolean).slice(1, 5), topic: item.title, expectedDuration: part === 2 ? 120 : part ? 60 : null, evaluationMode }
}
