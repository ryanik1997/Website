import ketReading from '../data/reading-ket-a2-test1.json'
import petReading from '../data/reading-pet-b1-test1.json'
import fceReading from '../data/reading-fce-b2-test1.json'
import ketListening from '../data/listening-ket-a2-test1.json'
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
  stripCatalogMeta(petReading),
  stripCatalogMeta(fceReading),
]

/** Đề Listening ship cùng app — media tại /public/catalog/listening/ */
export const CATALOG_LISTENING_EXAMS = [
  stripCatalogMeta(ketListening),
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