import {
  fillReadingExamFromSources,
  repairKetPart2Passage,
  repairKetPart7Passage,
} from '../src/features/exam/fillReadingExamMedia.ts'
import ket from '../../../packages/catalog/data/reading-ket-a2-test1.json'

const catalog = ket as any

// error2 shape: title + 3 image-only blocks (no label/text) — user only saw photos
const brokenP2 = {
  id: 'catalog-reading-ket-a2-test1',
  partNumber: 2,
  rangeLabel: 'Q',
  passageTitle: 'PART 2',
  passage: [
    { text: 'Making friends at university' },
    { text: '', imageUrl: 'https://cdn.example/p1.jpg' },
    { text: '', imageUrl: 'https://cdn.example/p2.jpg' },
    { text: '', imageUrl: 'https://cdn.example/p3.jpg' },
  ],
  questionGroups: [],
}
const catP2 = catalog.parts.find((p: any) => p.partNumber === 2)
const fixedP2 = repairKetPart2Passage(brokenP2 as any, catP2)
const profiles = fixedP2.passage.filter((b: any) => b.label)
console.log(
  profiles.length === 3
  && profiles.every((b: any) => (b.text || '').length > 40)
  && profiles.every((b: any) => b.imageUrl?.includes('cdn.example'))
    ? 'PASS P2 repair (text+label+portrait)'
    : 'FAIL P2 repair',
  fixedP2.passage.map((b: any) => ({ l: b.label, t: (b.text || '').slice(0, 24), img: b.imageUrl?.slice(0, 30) })),
)

// error1 shape: broken/missing image URLs for story pics
const brokenP7 = {
  id: 'x',
  partNumber: 7,
  rangeLabel: 'Q',
  passageTitle: 'P7',
  passage: [
    { text: '', imageKey: 'local-1' },
    { text: '', imageUrl: 'part7-p2.jpg' },
    { text: '' },
  ],
  questionGroups: [],
}
const catP7 = catalog.parts.find((p: any) => p.partNumber === 7)
const fixedP7 = repairKetPart7Passage(brokenP7 as any, catP7)
const okP7 = fixedP7.passage.every((b: any) => String(b.imageUrl || '').includes('/catalog/') && !b.imageKey)
console.log(okP7 ? 'PASS P7 repair catalog URLs' : 'FAIL P7', fixedP7.passage)

// full exam fill
const brokenExam = {
  ...catalog,
  parts: catalog.parts.map((p: any) => {
    if (p.partNumber === 2) return { ...brokenP2, questionGroups: p.questionGroups }
    if (p.partNumber === 7) return { ...brokenP7, questionGroups: p.questionGroups, id: p.id }
    if (p.partNumber === 1) {
      return {
        ...p,
        passage: p.passage.map((b: any, i: number) => ({ text: '', imageKey: `k${i}` })),
      }
    }
    return p
  }),
}
const filled = fillReadingExamFromSources(brokenExam, [catalog])
const p1ok = filled.parts.find((p: any) => p.partNumber === 1)!.passage.every((b: any) => b.imageUrl?.includes('/catalog/'))
const p2ok = filled.parts.find((p: any) => p.partNumber === 2)!.passage.filter((b: any) => b.label).length === 3
const p7ok = filled.parts.find((p: any) => p.partNumber === 7)!.passage.every((b: any) => b.imageUrl?.includes('part7'))
console.log(p1ok && p2ok && p7ok ? 'PASS full fill' : 'FAIL full fill', { p1ok, p2ok, p7ok })
if (!(profiles.length === 3 && okP7 && p1ok && p2ok && p7ok)) process.exit(1)
console.log('OK')
