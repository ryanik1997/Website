import assert from 'node:assert/strict'
import {
  isCatalogListeningExamId,
  isCatalogReadingExamId,
} from '@ryan/catalog'
import {
  isPublishableListeningId,
  isPublishableReadingId,
} from '../src/features/admin/publishLocalExamsBatch'

const readingCatalogIds = [
  'catalog-reading-ielts-cam20-test1',
  'catalog-ket-cam1-test1',
  'catalog-pet-b1-test1',
  'catalog-fce-b2-test1',
  'catalog-cae-c1-test1',
  'catalog-cpe-c2-test1',
]

for (const id of readingCatalogIds) {
  assert.equal(isCatalogReadingExamId(id), true, `${id} must be a Reading catalog id`)
  assert.equal(isPublishableReadingId(id), false, `${id} must never be published`)
}

assert.equal(isCatalogReadingExamId('reading-manual-123'), false)
assert.equal(isPublishableReadingId('reading-manual-123'), true)
assert.equal(isCatalogListeningExamId('catalog-listening-ket-a2-test1'), true)
assert.equal(isPublishableListeningId('catalog-listening-ket-a2-test1'), false)
assert.equal(isPublishableListeningId('listening-import-123'), true)

console.log('Catalog exam id policy: PASS')
