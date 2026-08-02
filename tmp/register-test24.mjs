import fs from 'fs'

// 1. Add to catalog-reading-meta.json
const metaPath = 'packages/catalog/data/catalog-reading-meta.json'
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))

// Check if test24 already exists
const exists = meta.find(e => e.id === 'catalog-reading-cae-c1-test24')
if (exists) {
  console.log('TEST24_ALREADY_IN_META')
} else {
  // Find the test23 entry to copy structure
  const test23 = meta.find(e => e.id === 'catalog-reading-cae-c1-test23')
  if (!test23) {
    console.log('ERROR: test23 not found in meta')
    process.exit(1)
  }

  // Create test24 entry based on test23 structure
  const test24 = JSON.parse(JSON.stringify(test23))
  test24.id = 'catalog-reading-cae-c1-test24'
  test24.title = 'CAE C1 Reading & Use of English — Test 24'
  test24.questionCount = 56
  test24.bodyPath = 'catalog/exams/reading/catalog-reading-cae-c1-test24.json'
  test24.answersPath = 'catalog/exams/reading/catalog-reading-cae-c1-test24.answers.json'
  test24.bodyRemote = true

  // Update part IDs
  if (test24.parts) {
    test24.parts.forEach((p, i) => {
      p.id = `catalog-reading-cae-c1-test24-part-${p.partNumber}`
      if (p.questionGroups) {
        p.questionGroups.forEach(g => {
          g.id = `catalog-reading-cae-c1-test24-part-${p.partNumber}-g0`
          if (g.questions) {
            g.questions.forEach(q => {
              q.id = `catalog-reading-cae-c1-test24-part-${p.partNumber}-q${q.number}`
            })
          }
        })
      }
    })
  }

  meta.push(test24)
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))
  console.log('ADDED_TEST24_TO_META')
}

// 2. Add to manifest.json
const manifestPath = 'packages/catalog/data/manifest.json'
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

const manifestExists = manifest.readingExams?.find(e => e.id === 'catalog-reading-cae-c1-test24')
if (manifestExists) {
  console.log('TEST24_ALREADY_IN_MANIFEST')
} else {
  if (!manifest.readingExams) manifest.readingExams = []
  
  // Find test23 in manifest
  const mTest23 = manifest.readingExams.find(e => e.id === 'catalog-reading-cae-c1-test23')
  if (mTest23) {
    const mTest24 = JSON.parse(JSON.stringify(mTest23))
    mTest24.id = 'catalog-reading-cae-c1-test24'
    mTest24.slug = 'cae-c1-test24'
    manifest.readingExams.push(mTest24)
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    console.log('ADDED_TEST24_TO_MANIFEST')
  } else {
    console.log('TEST23_NOT_IN_MANIFEST - adding minimal entry')
    manifest.readingExams.push({
      id: 'catalog-reading-cae-c1-test24',
      slug: 'cae-c1-test24',
    })
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    console.log('ADDED_MINIMAL_TEST24_TO_MANIFEST')
  }
}

// Verify
const updatedMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
const caeCount = updatedMeta.filter(e => e.id && e.id.includes('cae-c1-test')).length
console.log('CAE_C1_COUNT_AFTER: ' + caeCount)
console.log('DONE')