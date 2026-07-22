import fs from 'node:fs/promises'
import path from 'node:path'

const inputDir = process.argv[2] ?? 'out-reading'
const outputDir = process.argv[3] ?? 'packages/catalog/data'

function transform(payload, cam, test) {
  const examId = `catalog-cam-${cam}-${test}-reading`
  const slug = `ielts-cam${cam}-test${test}`
  return {
    id: examId,
    title: payload.title,
    durationMinutes: 60,
    bandHint: payload.bandHint ?? `IELTS Academic · Cambridge ${cam} · Test ${test}`,
    examTrack: 'ielts',
    parts: (payload.parts ?? []).map(part => ({
      ...part,
      id: `${examId}-part-${part.partNumber}`,
      questionGroups: (part.questionGroups ?? []).map((group, index) => ({
        ...group,
        id: `${examId}-part-${part.partNumber}-g${index}`,
        questions: (group.questions ?? []).map(question => ({
          ...question,
          id: `${examId}-part-${part.partNumber}-q${question.number}`,
          options: question.options ?? [],
          explanation: question.explanation ?? '',
          answerConfidence: question.answerConfidence ?? 'key',
        })),
      })),
    })),
    catalogSlug: slug,
    catalogBase: `/catalog/reading/${slug}`,
  }
}

await fs.mkdir(outputDir, { recursive: true })
const names = (await fs.readdir(inputDir))
  .filter(name => /^reading-cam-(9|1[0-9]|20)-[1-4]\.json$/.test(name))
  .filter(name => name !== 'reading-cam-11-2.json')
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

for (const name of names) {
  const [, cam, test] = name.match(/^reading-cam-(\d+)-(\d+)\.json$/)
  const payload = JSON.parse(await fs.readFile(path.join(inputDir, name), 'utf8'))
  const exam = transform(payload, Number(cam), Number(test))
  await fs.writeFile(path.join(outputDir, `reading-ielts-cam${cam}-test${test}.json`), `${JSON.stringify(exam, null, 2)}\n`)
}

console.log(`Converted ${names.length} payloads to ${outputDir}`)
