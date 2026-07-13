import ketReading from '../data/reading-ket-a2-test1.json'
import ketCam1Test1 from '../data/reading-ket-a2-cam1-test1.json'
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

/** Đề Reading ship cùng app — mọi user thấy sau deploy. */
export const CATALOG_READING_EXAMS = [
  stripCatalogMeta(ketReading),
  stripCatalogMeta(ketCam1Test1),
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

// Prefix "catalog-<slug>-" ngoài "catalog-reading-" cũng thuộc catalog builtin.
// Vd. reading-ket-a2-cam1-test1.json khai báo id "catalog-ket-cam1-test1" —
// nếu chỉ so `catalog-reading-` thì id này bị coi là "user import" → admin publish
// nhầm lên Supabase, sinh trùng row, User Library thấy đội đôi.
const CATALOG_READING_ID_PREFIXES = [
  'catalog-reading-',
  'catalog-ket-',
  'catalog-pet-',
  'catalog-fce-',
  'catalog-cae-',
  'catalog-cpe-',
] as const

const CATALOG_LISTENING_ID_PREFIXES = [
  'catalog-listening-',
] as const

export function isCatalogReadingExamId(id: string): boolean {
  return CATALOG_READING_ID_PREFIXES.some(p => id.startsWith(p))
}

export function isCatalogListeningExamId(id: string): boolean {
  return CATALOG_LISTENING_ID_PREFIXES.some(p => id.startsWith(p))
}
