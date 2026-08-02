#!/usr/bin/env node
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {
  readLicensedCaeTest,
  sha256,
  stableJson,
} from './licensed-cae-listening.mjs'
import {
  applyConversionPlan,
  createConversionPlan,
} from './convert-licensed-cae-listening-to-catalog.mjs'

function options(ids, prefix) {
  return ids.map(id => ({ id, label: `${prefix} option ${id}` }))
}

function buildSyntheticFixture(testNumber = 2) {
  const partOne = Array.from({ length: 6 }, (_, index) => ({
    number: index + 1,
    type: 'multiple-choice',
    prompt: `Synthetic Part 1 question ${index + 1}`,
    options: options(['A', 'B', 'C'], `P1Q${index + 1}`),
  }))
  const partTwo = Array.from({ length: 8 }, (_, index) => ({
    number: index + 7,
    type: 'gap-fill',
    prompt: `Synthetic Part 2 gap ${index + 7}`,
    options: [],
    wordLimit: 3,
  }))
  const partThree = Array.from({ length: 6 }, (_, index) => ({
    number: index + 15,
    type: 'multiple-choice',
    prompt: `Synthetic Part 3 question ${index + 15}`,
    options: options(['A', 'B', 'C', 'D'], `P3Q${index + 15}`),
  }))
  const taskOne = options(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 'Task one')
  const taskTwo = options(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 'Task two')
  const partFour = [
    ...Array.from({ length: 5 }, (_, index) => ({ number: index + 21, type: 'matching', prompt: `Speaker ${index + 1}`, options: taskOne })),
    ...Array.from({ length: 5 }, (_, index) => ({ number: index + 26, type: 'matching', prompt: `Speaker ${index + 1}`, options: taskTwo })),
  ]
  const answers = {}
  for (let number = 1; number <= 30; number += 1) {
    answers[String(number)] = number >= 7 && number <= 14
      ? { answer: `synthetic gap ${number}`, acceptableAnswers: [`synthetic gap ${number}`] }
      : { answer: number >= 15 && number <= 20 ? 'D' : 'A', explanation: `Synthetic explanation ${number}` }
  }
  return {
    manifest: {
      testNumber,
      title: `CAE C1 Listening — Synthetic Licensed Test ${testNumber}`,
      level: 'c1',
      family: 'cae',
      durationMinutes: 40,
      license: {
        owner: 'Synthetic Corpus Owner',
        permission: 'Owned synthetic fixture for automated testing',
        source: 'https://licensed.example.test/cae-fixture',
        licensed: true,
        userOwned: false,
        writtenPermission: false,
        permissionEvidence: 'Synthetic test fixture',
      },
      audio: { part1: 'part-1.mp3', part2: 'part-2.mp3', part3: 'part-3.mp3', part4: 'part-4.mp3' },
    },
    questions: {
      parts: [
        { partNumber: 1, rangeLabel: 'Questions 1–6', instruction: 'Synthetic Part 1 instruction.', questions: partOne },
        { partNumber: 2, rangeLabel: 'Questions 7–14', instruction: 'Synthetic Part 2 instruction.', passageTitle: 'Synthetic Notes', questions: partTwo },
        { partNumber: 3, rangeLabel: 'Questions 15–20', instruction: 'Synthetic Part 3 instruction.', questions: partThree },
        {
          partNumber: 4,
          rangeLabel: 'Questions 21–30',
          instruction: 'Synthetic Part 4 instruction.',
          matchingDualTask: true,
          taskOneInstruction: 'Match synthetic task one.',
          taskTwoInstruction: 'Match synthetic task two.',
          questions: partFour,
        },
      ],
    },
    answers: { answers },
    transcripts: { parts: { '1': 'Synthetic transcript one.', '2': 'Synthetic transcript two.', '3': 'Synthetic transcript three.', '4': 'Synthetic transcript four.' } },
  }
}

async function writeFixture(inputRoot, fixture, folder = 'test-02') {
  const testDir = path.join(inputRoot, folder)
  await fs.mkdir(testDir, { recursive: true })
  await Promise.all([
    fs.writeFile(path.join(testDir, 'manifest.json'), stableJson(fixture.manifest)),
    fs.writeFile(path.join(testDir, 'questions.json'), stableJson(fixture.questions)),
    fs.writeFile(path.join(testDir, 'answers.json'), stableJson(fixture.answers)),
    fs.writeFile(path.join(testDir, 'transcripts.json'), stableJson(fixture.transcripts)),
    ...Array.from({ length: 4 }, (_, index) => fs.writeFile(path.join(testDir, `part-${index + 1}.mp3`), Buffer.from(`synthetic-audio-${index + 1}`))),
  ])
  return testDir
}

function clone(value) {
  return structuredClone(value)
}

async function assertInvalid(inputRoot, mutate, expectedCode, label) {
  const fixture = buildSyntheticFixture()
  mutate(fixture)
  const testDir = await writeFixture(inputRoot, fixture)
  const result = await readLicensedCaeTest(testDir)
  assert.equal(result.ok, false, `${label} must fail`)
  assert(result.errors.some(item => item.code === expectedCode), `${label} must report ${expectedCode}: ${JSON.stringify(result.errors)}`)
  await fs.rm(testDir, { recursive: true, force: true })
}

const sandbox = await fs.mkdtemp(path.join(os.tmpdir(), 'cae-licensed-pipeline-'))
const inputRoot = path.join(sandbox, 'input')
const outputRoot = path.join(sandbox, 'output')
await fs.mkdir(inputRoot, { recursive: true })

try {
  const fixture = buildSyntheticFixture()
  const testDir = await writeFixture(inputRoot, fixture)
  const valid = await readLicensedCaeTest(testDir)
  assert.equal(valid.ok, true, JSON.stringify(valid.errors))
  assert.equal(valid.summary.questionCount, 30)
  assert.equal(valid.summary.answerCount, 30)
  assert.equal(valid.summary.transcriptMode, 'parts')
  console.log('ok: valid licensed synthetic fixture')

  await fs.rm(testDir, { recursive: true, force: true })
  const failures = [
    [value => { value.manifest.license.owner = '' }, 'license.owner', 'missing license owner'],
    [value => { value.manifest.license.licensed = false }, 'license.authorization', 'missing authorization flag'],
    [value => { value.manifest.license.source = 'https://engexam.info/example'; value.manifest.license.permissionEvidence = '' }, 'license.engexam', 'EngExam without written permission'],
    [value => { value.manifest.testNumber = 3 }, 'manifest.folderMismatch', 'folder and manifest test number mismatch'],
    [value => { value.manifest.audio.part1 = '../part-1.mp3' }, 'audio.filename', 'audio path traversal'],
    [value => { value.questions.parts[0].questions[0].options.pop() }, 'question.options', 'wrong MC option count'],
    [value => { value.questions.parts[0].questions[1].number = 1 }, 'question.duplicate', 'duplicate question number'],
    [value => { delete value.answers.answers['30'] }, 'answers.count', 'missing answer'],
    [value => { value.transcripts = {} }, 'transcripts.missing', 'missing transcripts'],
  ]
  for (const [mutate, code, label] of failures) {
    await assertInvalid(inputRoot, mutate, code, label)
    console.log(`ok: ${label} fails closed`)
  }

  const emptyAudioFixture = buildSyntheticFixture()
  const emptyAudioDir = await writeFixture(inputRoot, emptyAudioFixture)
  await fs.writeFile(path.join(emptyAudioDir, 'part-1.mp3'), Buffer.alloc(0))
  const emptyAudioResult = await readLicensedCaeTest(emptyAudioDir)
  assert.equal(emptyAudioResult.ok, false)
  assert(emptyAudioResult.errors.some(item => item.code === 'audio.empty'))
  await fs.rm(emptyAudioDir, { recursive: true, force: true })
  console.log('ok: empty audio file fails closed')

  const unexpectedDir = path.join(inputRoot, 'test-2')
  await fs.mkdir(unexpectedDir, { recursive: true })
  const unexpectedFolderPlan = await createConversionPlan({ inputRoot, outputRoot, overwrite: false })
  assert.equal(unexpectedFolderPlan.ok, false)
  assert(unexpectedFolderPlan.errors.some(item => item.code === 'folder.name'))
  await fs.rm(unexpectedDir, { recursive: true, force: true })
  console.log('ok: unexpected test directory name fails closed')

  await writeFixture(inputRoot, clone(fixture))
  const beforeDryRun = existsSync(outputRoot) ? sha256(await fs.readFile(outputRoot)) : null
  const dryPlan = await createConversionPlan({ inputRoot, outputRoot, overwrite: false })
  assert.equal(dryPlan.ok, true, JSON.stringify(dryPlan.errors))
  assert.equal(dryPlan.entries.length, 1)
  assert.equal(dryPlan.entries[0].examId, 'catalog-listening-cae-c1-test2')
  assert.equal(existsSync(outputRoot), false, 'dry-run planning must not create output root')
  const afterDryRun = existsSync(outputRoot) ? sha256(await fs.readFile(outputRoot)) : null
  assert.equal(afterDryRun, beforeDryRun)
  console.log('ok: dry-run plan writes nothing')

  const applied = await applyConversionPlan(dryPlan)
  assert.equal(applied.applied, 1)
  const packagePath = path.join(outputRoot, 'packages/catalog/data/listening-cae-c1-test2.json')
  const bodyPath = path.join(outputRoot, 'apps/web/public/catalog/exams/listening/catalog-listening-cae-c1-test2.json')
  const vaultPath = path.join(outputRoot, 'apps/web/public/catalog/exams/listening/catalog-listening-cae-c1-test2.answers.json')
  const [packageExam, body, vault] = await Promise.all([packagePath, bodyPath, vaultPath].map(file => fs.readFile(file, 'utf8').then(JSON.parse)))
  assert.equal(packageExam.parts.length, 4)
  assert.equal(packageExam.parts[0].transcript, 'Synthetic transcript one.')
  assert.equal(body.parts[0].transcript, 'Synthetic transcript one.')
  assert.equal(Object.prototype.hasOwnProperty.call(body.parts[0].questions[0], 'answer'), false)
  assert.equal(Object.keys(vault.answers).length, 30)
  assert.equal(vault.answers['catalog-listening-cae-c1-test2-q-1'].answer, 'A')
  for (let partNumber = 1; partNumber <= 4; partNumber += 1) {
    assert(existsSync(path.join(outputRoot, `apps/web/public/catalog/listening/cae-c1-test2/part-${partNumber}.mp3`)))
  }
  console.log('ok: apply emits package/body/vault/audio with transcript')

  const secondPlan = await createConversionPlan({ inputRoot, outputRoot, overwrite: false })
  assert.equal(secondPlan.ok, true, JSON.stringify(secondPlan.errors))
  assert(secondPlan.entries[0].outputs.every(output => output.status === 'identical'))
  assert(secondPlan.entries[0].audioCopies.every(audio => audio.status === 'identical'))
  assert(secondPlan.indexOutputs.every(output => output.status === 'identical'))
  console.log('ok: second conversion is idempotent')

  const changedFixture = buildSyntheticFixture()
  changedFixture.manifest.title = 'Materially changed synthetic title'
  await fs.writeFile(path.join(inputRoot, 'test-02/manifest.json'), stableJson(changedFixture.manifest))
  const conflictPlan = await createConversionPlan({ inputRoot, outputRoot, overwrite: false })
  assert.equal(conflictPlan.ok, false)
  assert(conflictPlan.errors.some(item => item.code === 'output.conflict'))
  console.log('ok: material changes require explicit overwrite')

  console.log('\nLicensed CAE Listening pipeline tests PASS')
} finally {
  await fs.rm(sandbox, { recursive: true, force: true })
}
