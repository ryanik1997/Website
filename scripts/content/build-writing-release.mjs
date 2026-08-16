/**
 * Build the IELTS Writing release set as a local dry-run under tmp/r2-writing-release/.
 *
 * Structure (immutable release root; staging manifest published separately):
 *   tmp/r2-writing-release/<release-id>/
 *     releases/<release-id>/
 *       ielts/writing/
 *         catalog.json
 *         tasks/<task-id>.json
 *         images/<image-file>
 *     manifests/releases/<release-id>.json   (release manifest + inventory)
 *
 * Validation (fails the build):
 *   - every JSON parses
 *   - 356/356 tasks present
 *   - 352 image references resolved (every referenced image exists)
 *   - no private/secret fields in the public tree
 *   - no local Windows paths, no zero-byte assets
 *   - no duplicate object keys, no duplicate task IDs
 *   - no .answers.json, no user submissions, no API keys
 *
 * Run:
 *   node scripts/content/build-writing-release.mjs            # writes tmp/r2-writing-release/<id>/
 *   node scripts/content/build-writing-release.mjs --id r2    # custom release id
 *   node scripts/content/build-writing-release.mjs --report   # print full inventory
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')

const TASKS_PATH = path.join(ROOT, 'apps/web/public/catalog/writing/tid/tasks.json')
const IMAGES_DIR = path.join(ROOT, 'apps/web/public/catalog/writing/tid/images')
const RELEASE_ROOT = path.join(ROOT, 'tmp/r2-writing-release')

const RELEASE_ID = (() => {
  const idx = process.argv.indexOf('--id')
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1]
  return 'writing-content-r1-20260804'
})()
const SHOW_REPORT = process.argv.includes('--report')

const REL = `releases/${RELEASE_ID}`
const OUT_REL = path.join(RELEASE_ROOT, REL)
const OUT_MANIFESTS = path.join(RELEASE_ROOT, 'manifests/releases')

const CT = {
  '.json': 'application/json',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.gif': 'image/gif', '.svg': 'image/svg+xml',
}
const IMMUTABLE = 'public, max-age=31536000, immutable'

// Fields that must NOT appear in the public release tree.
const SECRET_FIELDS = [
  'apiKey', 'api_key', 'secret', 'password', 'token',
  'serviceRole', 'service_role', 'SUPABASE_SERVICE_ROLE_KEY',
  'userSubmission', 'user_submission', 'aiFeedback', 'ai_feedback',
  'feedbackHistory', 'feedback_history',
]

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex')
}

const inventory = []

function addObject(key, localPath, classification = 'public') {
  const buf = fs.readFileSync(localPath)
  if (buf.length === 0) throw new Error(`zero-byte asset: ${key} (${localPath})`)
  const ext = path.extname(localPath).toLowerCase()
  inventory.push({
    objectKey: key,
    source: path.relative(ROOT, localPath).replace(/\\/g, '/'),
    bytes: buf.length,
    sha256: sha256(buf),
    contentType: CT[ext] ?? 'application/octet-stream',
    cacheControl: IMMUTABLE,
    classification,
  })
}

const failures = []
const fail = (m) => { failures.push(m) }

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }) }

async function main() {
  // Clean previous release
  if (fs.existsSync(path.join(RELEASE_ROOT, REL))) {
    fs.rmSync(path.join(RELEASE_ROOT, REL), { recursive: true, force: true })
  }
  if (fs.existsSync(path.join(RELEASE_ROOT, 'manifests'))) {
    fs.rmSync(path.join(RELEASE_ROOT, 'manifests'), { recursive: true, force: true })
  }

  // 1. Load tasks.json
  if (!fs.existsSync(TASKS_PATH)) {
    console.error(`tasks.json not found at ${TASKS_PATH}`)
    process.exit(1)
  }
  const raw = fs.readFileSync(TASKS_PATH, 'utf8')
  const tasks = JSON.parse(raw)
  console.log(`Loaded ${tasks.length} tasks from tasks.json`)

  // 2. Validate task IDs are unique
  const ids = tasks.map(t => t.id)
  const uniqueIds = new Set(ids)
  if (ids.length !== uniqueIds.size) {
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
    fail(`Duplicate task IDs: ${[...new Set(dupes)].join(', ')}`)
  }

  // 3. Write each task as a separate JSON file
  const catalog = []
  const tasksDir = path.join(OUT_REL, 'ielts/writing/tasks')
  ensureDir(tasksDir)

  for (const task of tasks) {
    const taskFile = path.join(tasksDir, `${task.id}.json`)
    fs.writeFileSync(taskFile, JSON.stringify(task, null, 0))
    addObject(`${REL}/ielts/writing/tasks/${task.id}.json`, taskFile)

    catalog.push({
      id: task.id,
      taskType: task.taskType,
      genre: task.genre,
      title: task.title,
      hasImage: task.image !== null && task.image !== undefined && task.image !== '',
      image: task.image,
      objectKey: `${REL}/ielts/writing/tasks/${task.id}.json`,
    })
  }

  // 4. Write catalog.json
  const catalogFile = path.join(OUT_REL, 'ielts/writing/catalog.json')
  ensureDir(path.dirname(catalogFile))
  const catalogBody = {
    module: 'ielts',
    skill: 'writing',
    level: 'academic',
    count: catalog.length,
    task1Count: catalog.filter(c => c.taskType === 'task1').length,
    task2Count: catalog.filter(c => c.taskType === 'task2').length,
    imageCount: catalog.filter(c => c.hasImage).length,
    tests: catalog,
  }
  fs.writeFileSync(catalogFile, JSON.stringify(catalogBody, null, 2))
  addObject(`${REL}/ielts/writing/catalog.json`, catalogFile)

  // 5. Copy images
  const imagesDir = path.join(OUT_REL, 'ielts/writing/images')
  ensureDir(imagesDir)

  const tasksWithImage = tasks.filter(t => t.image !== null && t.image !== undefined && t.image !== '')
  const imageRefs = new Set()
  for (const task of tasksWithImage) {
    // Normalize image path: /catalog/writing/tid/images/xxx.webp → xxx.webp
    const imgPath = task.image.replace(/^\/catalog\/writing\/tid\/images\//, '')
    imageRefs.add(imgPath)
  }

  let imagesCopied = 0
  let imagesMissing = 0
  for (const imgRef of imageRefs) {
    const srcPath = path.join(IMAGES_DIR, imgRef)
    if (!fs.existsSync(srcPath)) {
      fail(`Missing image: ${imgRef} (source: ${srcPath})`)
      imagesMissing++
      continue
    }
    const dstPath = path.join(imagesDir, imgRef)
    ensureDir(path.dirname(dstPath))
    fs.copyFileSync(srcPath, dstPath)
    addObject(`${REL}/ielts/writing/images/${imgRef}`, dstPath)
    imagesCopied++
  }

  // 6. Release manifest
  const manifestLocal = path.join(OUT_MANIFESTS, `${RELEASE_ID}.json`)
  ensureDir(OUT_MANIFESTS)
  const releaseManifest = {
    releaseId: RELEASE_ID,
    builtAt: new Date().toISOString(),
    source: 'IELTS Writing TID corpus — 356 tasks, 352 images',
    modules: {
      writing: {
        total: tasks.length,
        task1: tasks.filter(t => t.taskType === 'task1').length,
        task2: tasks.filter(t => t.taskType === 'task2').length,
        images: tasksWithImage.length,
        uniqueImages: imageRefs.size,
      },
    },
    objects: inventory,
  }
  fs.writeFileSync(manifestLocal, JSON.stringify(releaseManifest, null, 2))
  addObject(`manifests/releases/${RELEASE_ID}.json`, manifestLocal, 'release-manifest')

  // 7. Validation
  // 7a. JSON parse
  for (const it of inventory) {
    if (!it.objectKey.endsWith('.json')) continue
    const local = path.join(RELEASE_ROOT, it.objectKey)
    try {
      JSON.parse(fs.readFileSync(local, 'utf8'))
    } catch (e) {
      fail(`JSON parse error in ${it.objectKey}: ${e.message}`)
    }
  }

  // 7b. Secret field scan
  for (const it of inventory) {
    if (!it.objectKey.endsWith('.json')) continue
    const local = path.join(RELEASE_ROOT, it.objectKey)
    const content = fs.readFileSync(local, 'utf8').toLowerCase()
    for (const field of SECRET_FIELDS) {
      // Check for field as a JSON key: "fieldname"
      if (content.includes(`"${field.toLowerCase()}"`)) {
        // Exclude if it's just in the prompt/guide content (not a JSON key)
        // We check if it appears as a JSON key
        const re = new RegExp(`"${field.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&').toLowerCase()}"\\s*:`)
        if (re.test(content)) {
          fail(`Secret field "${field}" found in public object ${it.objectKey}`)
        }
      }
    }
  }

  // 7c. Counts
  if (tasks.length !== 356) fail(`task count ${tasks.length} != 356`)
  if (tasksWithImage.length !== 352) fail(`image reference count ${tasksWithImage.length} != 352`)
  if (imageRefs.size !== 352) fail(`unique image count ${imageRefs.size} != 352`)
  if (imagesMissing !== 0) fail(`${imagesMissing} images missing from disk`)

  // 7d. Windows paths / zero bytes / duplicate keys
  for (const it of inventory) {
    if (it.objectKey.includes('\\')) fail(`Windows path in object key: ${it.objectKey}`)
    if (it.source.includes('\\')) fail(`Windows path in source: ${it.source}`)
    if (it.bytes === 0) fail(`zero-byte asset: ${it.objectKey}`)
  }
  const keys = inventory.map(i => i.objectKey)
  const dupKeys = keys.filter((k, i) => keys.indexOf(k) !== i)
  if (dupKeys.length) fail(`duplicate object keys: ${[...new Set(dupKeys)].join(', ')}`)

  // 7e. No .answers.json in public tree
  const answersInRelease = keys.filter(k => k.endsWith('.answers.json'))
  if (answersInRelease.length) fail(`.answers.json in release tree: ${answersInRelease.join(', ')}`)

  // 7f. No user submissions or private data
  const privatePatterns = ['userSubmission', 'user_submission', 'aiFeedback', 'ai_feedback', 'feedbackHistory']
  for (const it of inventory) {
    if (!it.objectKey.endsWith('.json')) continue
    const local = path.join(RELEASE_ROOT, it.objectKey)
    const content = fs.readFileSync(local, 'utf8')
    for (const pattern of privatePatterns) {
      if (content.includes(`"${pattern}"`)) {
        fail(`Private field "${pattern}" found in public object ${it.objectKey}`)
      }
    }
  }

  // 8. Report
  console.log(`\nRelease ID:      ${RELEASE_ID}`)
  console.log(`Writing tasks:    ${tasks.length} (Task 1: ${catalog.filter(c => c.taskType === 'task1').length}, Task 2: ${catalog.filter(c => c.taskType === 'task2').length})`)
  console.log(`Image refs:      ${tasksWithImage.length} (unique: ${imageRefs.size})`)
  console.log(`Images copied:   ${imagesCopied}`)
  console.log(`Objects:         ${inventory.length}`)
  console.log(`  JSON files:    ${inventory.filter(i => i.objectKey.endsWith('.json')).length}`)
  console.log(`  images:        ${inventory.filter(i => !i.objectKey.endsWith('.json')).length}`)
  console.log(`Total bytes:     ${inventory.reduce((n, i) => n + i.bytes, 0)} (${(inventory.reduce((n, i) => n + i.bytes, 0) / 1024 / 1024).toFixed(2)} MB)`)

  if (SHOW_REPORT) {
    console.log('\nInventory:')
    for (const it of inventory) {
      console.log(`  ${it.objectKey}  ${it.bytes}B  ${it.contentType}  ${it.classification}`)
    }
  }

  if (failures.length) {
    console.error(`\nRELEASE BUILD FAILED (${failures.length})`)
    for (const f of failures) console.error('  ✗ ' + f)
    process.exit(1)
  }
  console.log('\nRELEASE BUILD OK')
  console.log(`Staged at: ${path.relative(ROOT, path.join(RELEASE_ROOT, REL)).replace(/\\/g, '/')}`)
  console.log(`Manifest:  ${path.relative(ROOT, manifestLocal).replace(/\\/g, '/')}`)
}

main().catch(err => { console.error(err); process.exit(1) })