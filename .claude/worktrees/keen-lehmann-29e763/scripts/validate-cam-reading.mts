import { readFile } from 'node:fs/promises'
import { readdir } from 'node:fs/promises'
import {
  countReadingImportQuestions,
  buildReadingExamFromImport,
  parseReadingImportJson,
  validateReadingManualImport,
} from '../apps/web/src/features/exam/importReadingManualUtils'
import { validateIeltsReadingBundle } from '../apps/web/src/features/exam/ieltsReadingBundle'

const inputDir = process.argv[2] ?? 'out-reading'
const files = (await readdir(inputDir))
  .filter(name => /^reading-cam-(9|1[0-9]|20)-[1-4]\.json$/.test(name))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

const failures: string[] = []
let complete = 0
let warningCount = 0

for (const file of files) {
  const match = file.match(/^reading-cam-(\d+)-(\d+)\.json$/)
  if (!match) continue
  const cambridge = Number(match[1])
  const test = Number(match[2])
  try {
    const payload = parseReadingImportJson(await readFile(`${inputDir}/${file}`, 'utf8'))
    const manualWarnings = validateReadingManualImport(payload)
    const bundle = validateIeltsReadingBundle({
      version: 1,
      cambridge,
      test,
      title: `Cambridge ${cambridge} Test ${test}`,
      examTrack: 'ielts',
      passages: [1, 2, 3].map(partNumber => ({
        partNumber,
        template: `r${partNumber}`,
        file: `passage-${partNumber}.json`,
      })),
    }, payload)
    const total = countReadingImportQuestions(payload)
    await buildReadingExamFromImport(payload, [], `reading-cam-${cambridge}-${test}`)
    const issues = [...new Set([...manualWarnings, ...bundle.warnings])]
    warningCount += issues.length
    if (bundle.errors.length || payload.parts.length !== 3 || total !== 40) {
      failures.push(`${file}: ${total}/40 câu, ${payload.parts.length}/3 passages${bundle.errors.length ? `; errors: ${bundle.errors.join(' | ')}` : ''}`)
    } else {
      complete += 1
    }
    if (issues.length) console.log(`WARN ${file}: ${issues.length} cảnh báo`)
  } catch (error) {
    failures.push(`${file}: parse/validate failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

console.log(`Validated: ${files.length}/48 files`)
console.log(`Complete 40-question exams: ${complete}/48`)
console.log(`Warnings: ${warningCount}`)
if (failures.length) {
  console.log('Failures:')
  for (const failure of failures) console.log(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log('Failures: none')
}
