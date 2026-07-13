import fs from 'node:fs/promises'
import path from 'node:path'
import { crawlRowsToPayload } from './crawl-reading-to-payload.mjs'
import { transformReading } from './build-catalog.mjs'
import { REPO_ROOT, resolveTainguyenPath } from './tainguyen-path.mjs'

const cam = Number(process.argv[2] ?? 20)
const test = Number(process.argv[3] ?? 2)
if (cam === 11 && test === 2) throw new Error('Cam11 Test2 is excluded')

const crawlDir = path.join(resolveTainguyenPath(), 'Crawl', 'Reading_ITELTS')
const names = await fs.readdir(crawlDir)
const name = names.find(value => {
  const compact = value.replace(/\.json$/i, '').replace(/[^a-z0-9]/gi, '').toLowerCase()
  return compact === `cam${cam}test${test}` || compact === `cam0${cam}test${test}`
})
if (!name) throw new Error(`Crawl JSON not found for Cam${cam} Test${test}`)

const rows = JSON.parse(await fs.readFile(path.join(crawlDir, name), 'utf8'))
const payload = crawlRowsToPayload(rows, cam, test)
const slug = `ielts-cam${cam}-test${test}`
const exam = transformReading(payload, {
  kind: 'reading', slug, examId: `catalog-cam-${cam}-${test}-reading`,
  examTrack: 'ielts', cam, test,
})
const output = path.join(REPO_ROOT, 'packages', 'catalog', 'data', `reading-${slug}.json`)
await fs.writeFile(output, `${JSON.stringify(exam, null, 2)}\n`, 'utf8')
console.log(`Built pilot ${name} -> ${output}`)
