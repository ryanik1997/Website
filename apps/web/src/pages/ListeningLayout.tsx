import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { db, lessonRepo } from '@ryan/db'
import { getStructuredCambridgePacks } from '../features/listening/cambridgePacks'
import { isStructuredLesson } from '../features/listening/listeningMeta'
import { patchTidDictationVietnamese, seedTidDictation } from '../features/listening/seedTidDictation'

async function purgeLegacyCambridge() {
  const done = await db.settings.get('listening_legacy_purged')
  if (done?.value) return

  const all = await db.lessons.where('category').equals('cambridge').toArray()
  const legacy = all.filter(l => !isStructuredLesson(l))
  await Promise.all(legacy.map(l => lessonRepo.delete(l.id)))
  await db.settings.put({ key: 'listening_legacy_purged', value: true })
}

async function seedCambridgePacks() {
  await purgeLegacyCambridge()

  const seededV2 = await db.settings.get('listening_seed_v2')
  if (seededV2?.value) return

  for (const pack of getStructuredCambridgePacks()) {
    const exists = await lessonRepo.existsStructured(pack.book, pack.test, pack.part)
    if (!exists) {
      await lessonRepo.create({
        category: pack.category,
        title: pack.title,
        book: pack.book,
        bookNum: pack.bookNum,
        test: pack.test,
        part: pack.part,
        sentences: pack.sentences,
        source: 'text',
      })
    }
  }

  await db.settings.put({ key: 'listening_seed_v2', value: true })
}

export default function ListeningLayout() {
  useEffect(() => {
    void (async () => {
      await seedCambridgePacks()
      // Real TID dictation (459 lessons / ~28k sentences + clip URLs)
      await seedTidDictation()
      // Merge VI translations when seed JSON is updated (idempotent flag)
      await patchTidDictationVietnamese()
    })()
  }, [])
  return <Outlet />
}