#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CAMBRIDGE_WRITING_LEVEL_CONFIGS } from './cambridge-writing-level-config.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SCHEMA_PATH = path.join(ROOT, 'packages/catalog/src/cambridge/writing/schema.ts')
const SEED_PATH = path.join(ROOT, 'packages/catalog/src/cambridge/writing/seedData.ts')
const OUTPUT = path.join(ROOT, 'tmp/cambridge-writing-current-contract.json')

async function main() {
  const [schemaSource, seedSource] = await Promise.all([
    fs.readFile(SCHEMA_PATH, 'utf8'),
    fs.readFile(SEED_PATH, 'utf8'),
  ])
  const report = {
    generatedAt: Date.now(),
    outputContract: 'CambridgeWritingTestSchema',
    schemaFile: path.relative(ROOT, SCHEMA_PATH).replaceAll('\\', '/'),
    requiredTestFields: ['id', 'level', 'testNumber', 'title', 'tasks'],
    optionalTestFields: ['sourceUrl', 'sourceFile', 'status', 'version', 'createdAt', 'updatedAt', 'createdBy', 'provenance'],
    promptBlockTypes: ['paragraph', 'panel', 'email', 'source-text', 'final-instruction'],
    presentationTemplates: ['plain', 'essay-notes', 'essay-notes-opinions', 'announcement', 'email', 'source-texts'],
    levelConfigs: CAMBRIDGE_WRITING_LEVEL_CONFIGS,
    idConventions: {
      test: '<level>-test-NN',
      task: '<level>-test-NN-task-NN',
    },
    runtimeRoutes: [
      '/app/writing/cambridge/:level',
      '/app/writing/cambridge/:level/:testId',
      '/app/writing/cambridge/:level/:testId/:taskId',
    ],
    currentSeedExamples: ['b1-test-01', 'b2-test-01', 'c1-test-01', 'c2-test-01'],
    sourceChecks: {
      schemaHasPromptBlocks: schemaSource.includes('CambridgeWritingPromptBlockSchema'),
      schemaHasProvenance: schemaSource.includes('CambridgeWritingGenerationProvenanceSchema'),
      manualA2Present: seedSource.includes("level: 'a2'"),
      manualB1ToC2Present: ['b1-test-01', 'b2-test-01', 'c1-test-01', 'c2-test-01'].every(id => seedSource.includes(id)),
    },
  }
  await fs.mkdir(path.dirname(OUTPUT), { recursive: true })
  await fs.writeFile(OUTPUT, `${JSON.stringify(report, null, 2)}\n`)
  console.log(path.relative(ROOT, OUTPUT))
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
