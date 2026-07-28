/**
 * Part 7 must not inject ket-a2-test1 default images into other exams.
 * Run: npx vite-node apps/web/scripts/test-ket-part7-no-test1-bleed.mts
 */
import {
  fillReadingExamFromSources,
  repairKetPart7Passage,
} from '../src/features/exam/fillReadingExamMedia.ts'
import book4t1 from '../../../packages/catalog/data/reading-ket-a2-book4-test1.json'
import book4t2 from '../../../packages/catalog/data/reading-ket-a2-book4-test2.json'

const b4t1 = book4t1 as any
const b4t2 = book4t2 as any
const p7b4t1 = b4t1.parts.find((p: any) => p.partNumber === 7)
const p7b4t2 = b4t2.parts.find((p: any) => p.partNumber === 7)

// 1) Single strip stays 1 image, no test1 paths
const fixedSame = repairKetPart7Passage(p7b4t1, p7b4t1)
const urlsSame = fixedSame.passage.map((b: any) => b.imageUrl || '')
const okSame =
  fixedSame.passage.length === 1
  && urlsSame[0]?.includes('ket-a2-book4-test1/part7-page.jpg')
  && urlsSame.every((u: string) => !u.includes('ket-a2-test1'))
console.log(okSame ? 'PASS same-exam strip' : 'FAIL same-exam strip', urlsSame)

// 2) Cross-exam fill must not paste Book4 Test1 story onto Book4 Test2
const contaminated = {
  ...b4t2,
  parts: b4t2.parts.map((p: any) =>
    p.partNumber === 7
      ? {
          ...p,
          passage: [
            { text: '', imageUrl: '/catalog/reading/ket-a2-book4-test2/part7-page.jpg' },
            { text: '' },
            { text: '' },
          ],
        }
      : p,
  ),
}
const filled = fillReadingExamFromSources(contaminated, [b4t1 as any])
const p7 = filled.parts.find((p: any) => p.partNumber === 7)!
const urls = p7.passage.map((b: any) => b.imageUrl || '').filter(Boolean)
const okCross =
  urls.length === 1
  && urls[0].includes('ket-a2-book4-test2')
  && urls.every((u: string) => !u.includes('ket-a2-test1') && !u.includes('book4-test1/part7'))
console.log(okCross ? 'PASS no cross-book bleed' : 'FAIL cross-book bleed', urls)

// 3) Empty part7 + matching source copies source only
const emptyP7 = { ...p7b4t2, passage: [] }
const fromSrc = repairKetPart7Passage(emptyP7, p7b4t2)
const okEmpty =
  fromSrc.passage.length === 1
  && fromSrc.passage[0].imageUrl?.includes('ket-a2-book4-test2')
console.log(okEmpty ? 'PASS empty→source' : 'FAIL empty→source', fromSrc.passage)

if (!(okSame && okCross && okEmpty)) process.exit(1)
console.log('OK')
