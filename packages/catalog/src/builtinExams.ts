import ketReading from '../data/reading-ket-a2-test1.json'
import ketGeneratedReading from '../data/reading-ket-a2-generated-01.json'
import petReading from '../data/reading-pet-b1-test1.json'
import fceReading from '../data/reading-fce-b2-test1.json'
import caeReading from '../data/reading-cae-c1-test1.json'
import cpeReading from '../data/reading-cpe-c2-test1.json'
import ketListening from '../data/listening-ket-a2-test1.json'
import petListening from '../data/listening-pet-b1-test1.json'
import fceListening from '../data/listening-fce-b2-test1.json'
import caeListening from '../data/listening-cae-c1-test1.json'
import { GENERATED_IELTS_LISTENING_EXAMS } from './generatedIeltsListening'
import { GENERATED_IELTS_READING_EXAMS } from './generatedIeltsReading'
import catalogManifest from '../data/manifest.json'

type WithCatalogMeta = {
  catalogSlug?: string
  catalogBase?: string
}

function stripCatalogMeta<T extends WithCatalogMeta>(exam: T): Omit<T, 'catalogSlug' | 'catalogBase'> {
  const { catalogSlug: _s, catalogBase: _b, ...rest } = exam
  return rest
}

// KET A2 pilot is exposed in the same Cambridge book/test layout as the app's
// other Cambridge sets: four tests under Cambridge 4 and one under Cambridge 5.
const KET_A2_CAMBRIDGE_4_5 = [
  ...[1, 2, 3, 4].map(test => ({
    ...ketGeneratedReading,
    id: `catalog-ket-cam4-test${test}`,
    title: `KET A2 Reading — Cambridge 4 Test ${test}`,
  })),
  {
    ...ketGeneratedReading,
    id: 'catalog-ket-cam5-test1',
    title: 'KET A2 Reading — Cambridge 5 Test 1',
  },
]

const KET_A2_CAMBRIDGE_3 = [3, 4].map(test => ({
  ...ketGeneratedReading,
  id: `catalog-ket-cam3-test${test}`,
  title: `KET A2 Reading — Cambridge 3 Test ${test}`,
}))

/** Đề Reading ship cùng app — mọi user thấy sau deploy. */
export const CATALOG_READING_EXAMS = [
  stripCatalogMeta(ketReading),
  ...KET_A2_CAMBRIDGE_4_5.map(exam => stripCatalogMeta(exam)),
  ...KET_A2_CAMBRIDGE_3.map(exam => stripCatalogMeta(exam)),
  stripCatalogMeta(petReading),
  stripCatalogMeta(fceReading),
  stripCatalogMeta(caeReading),
  stripCatalogMeta(cpeReading),
  ...GENERATED_IELTS_READING_EXAMS.map(exam => stripCatalogMeta(exam)),
]

/** Đề Listening ship cùng app — media tại /public/catalog/listening/ */
export const CATALOG_LISTENING_EXAMS = [
  stripCatalogMeta(ketListening),
  stripCatalogMeta(petListening),
  stripCatalogMeta(fceListening),
  stripCatalogMeta(caeListening),
  ...GENERATED_IELTS_LISTENING_EXAMS.map(exam => stripCatalogMeta(exam)),
]

export const CATALOG_EXAM_MANIFEST = catalogManifest

export const CATALOG_READING_EXAM_IDS = CATALOG_READING_EXAMS.map(e => e.id)
export const CATALOG_LISTENING_EXAM_IDS = CATALOG_LISTENING_EXAMS.map(e => e.id)

export function isCatalogReadingExamId(id: string): boolean {
  return id.startsWith('catalog-reading-')
}

export function isCatalogListeningExamId(id: string): boolean {
  return id.startsWith('catalog-listening-')
}
