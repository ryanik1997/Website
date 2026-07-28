#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveTainguyenPath } from '../tainguyen-path.mjs'
import { auditFcePart7Page, loadFceTestExamJson } from './fce-b2-pages-to-parts.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const sourceRoot = path.join(resolveTainguyenPath(), 'Import Cambridge', 'FCE_B2', 'Reading')
const outputJson = path.join(repoRoot, 'tmp', 'fce-b2-part7-heading-audit.json')
const outputMarkdown = path.join(repoRoot, 'tmp', 'fce-b2-part7-heading-audit.md')
const rows = []

function sectionLabels(page) {
  return [...new Set((page.questions ?? []).flatMap(question => question?.options ?? []).map(option => (
    String(option?.label ?? option?.text ?? option?.value ?? '').trim().toUpperCase()
  )).filter(value => /^[A-E]$/.test(value)))]
}

for (let sourceTestNumber = 1; sourceTestNumber <= 26; sourceTestNumber += 1) {
  const { raw } = await loadFceTestExamJson(sourceTestNumber, sourceRoot)
  const page = (raw.pages ?? []).find(item => Number(item?.partNumber) === 7)
  const labels = sectionLabels(page)
  const sections = auditFcePart7Page(page, labels)
  for (const section of sections) {
    rows.push({
      sourceTestNumber,
      appTestNumber: sourceTestNumber + 1,
      section: section.label,
      rawStrongTexts: section.rawStrongTexts,
      detectedHeading: section.heading ?? '',
      bodyStart: section.bodyStart,
      shape: section.shape,
    })
  }
}

const tests = Array.from({ length: 26 }, (_, index) => index + 1).map(sourceTestNumber => {
  const sections = rows.filter(row => row.sourceTestNumber === sourceTestNumber)
  return {
    sourceTestNumber,
    appTestNumber: sourceTestNumber + 1,
    sectionCount: sections.length,
    headingsDetected: sections.filter(section => section.detectedHeading).length,
    sections,
  }
})
const report = {
  testsAudited: tests.length,
  sectionsAudited: rows.length,
  headingsDetected: rows.filter(row => row.detectedHeading).length,
  headingMissing: rows.filter(row => !row.detectedHeading).length,
  shapes: Object.fromEntries([...new Set(rows.map(row => row.shape))].sort().map(shape => [
    shape,
    rows.filter(row => row.shape === shape).length,
  ])),
  tests,
}
const markdown = [
  '# FCE B2 Part 7 Heading Audit',
  '',
  `- Tests audited: ${report.testsAudited}`,
  `- Sections audited: ${report.sectionsAudited}`,
  `- Headings detected: ${report.headingsDetected}`,
  `- Source sections without a separate heading: ${report.headingMissing}`,
  '',
  '| Source | App | Sections | Headings | Status |',
  '| ---: | ---: | ---: | ---: | --- |',
  ...tests.map(test => `| ${test.sourceTestNumber} | ${test.appTestNumber} | ${test.sectionCount} | ${test.headingsDetected} | ${test.sectionCount >= 4 && test.sectionCount <= 5 && test.headingsDetected === test.sectionCount ? 'PASS' : 'FAIL'} |`),
  '',
  '## HTML shapes',
  '',
  ...Object.entries(report.shapes).map(([shape, count]) => `- ${shape}: ${count}`),
  '',
]

await fs.mkdir(path.dirname(outputJson), { recursive: true })
await Promise.all([
  fs.writeFile(outputJson, `${JSON.stringify(report, null, 2)}\n`, 'utf8'),
  fs.writeFile(outputMarkdown, markdown.join('\n'), 'utf8'),
])

if (report.testsAudited !== 26 || tests.some(test => test.sectionCount < 4 || test.sectionCount > 5)) {
  console.error(`Part 7 heading audit FAIL: tests=${report.testsAudited}, sections=${report.sectionsAudited}, missing=${report.headingMissing}`)
  process.exit(1)
}
console.log(`Part 7 heading audit PASS: tests=${report.testsAudited}, sections=${report.sectionsAudited}, sourceHeadingsMissing=${report.headingMissing}`)
