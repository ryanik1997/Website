import fs from 'node:fs'
import path from 'node:path'
import {
  CAMBRIDGE_WRITING_COLLECTIONS,
  CAMBRIDGE_WRITING_MANIFEST,
} from '../packages/catalog/src/cambridge/writing/seedData.ts'
import { CambridgeWritingCollectionSchema } from '../packages/catalog/src/cambridge/writing/schema.ts'

type Level = 'b1' | 'b2' | 'c1' | 'c2'

const ROOT = process.cwd()
const RAW_DIR = path.join(ROOT, 'docs', 'research', 'ceq.inspera.com', 'writing')
const CRAWL_DIR = 'D:\\App-English-Ryan\\Crawl\\Writing_Crawl'
const OUT_DIR = path.join(ROOT, 'packages', 'catalog', 'src', 'cambridge', 'writing')
const INVENTORY_PATH = path.join(ROOT, 'data-import', 'cambridge-writing-inventory.json')

function parseArgs(argv: string[]) {
  const levels = argv
    .filter(arg => arg.startsWith('--level='))
    .map(arg => arg.slice('--level='.length) as Level)
  const all = argv.includes('--all') || levels.length === 0
  const validateOnly = argv.includes('--validate-only')
  const selectedLevels = all ? (['b1', 'b2', 'c1', 'c2'] as Level[]) : levels
  return { selectedLevels, validateOnly }
}

function ensureDir(target: string) {
  fs.mkdirSync(target, { recursive: true })
}

function writeJson(target: string, value: unknown) {
  fs.writeFileSync(target, JSON.stringify(value, null, 2), 'utf8')
}

function inventoryFor(level: Level) {
  const sourcePath = path.join(CRAWL_DIR, level.toUpperCase())
  const sourceFiles = fs.existsSync(sourcePath) ? fs.readdirSync(sourcePath) : []
  const rawFile = path.join(RAW_DIR, `${level}.questions.json`)
  const rawExists = fs.existsSync(rawFile)
  const collection = CAMBRIDGE_WRITING_COLLECTIONS.find(item => item.level === level)
  const warnings: string[] = []
  if (sourceFiles.length === 0) warnings.push('Source crawl folder is empty; using Inspera seed captures from docs/research.')
  if (!rawExists) warnings.push(`Missing raw seed capture: ${rawFile}`)
  if (!collection) warnings.push('Missing normalized seed collection in packages/catalog.')
  return {
    sourcePath,
    sourceFiles,
    rawFile,
    rawExists,
    testCount: collection?.tests.length ?? 0,
    taskCount: collection?.tests.reduce((sum, test) => sum + test.tasks.length, 0) ?? 0,
    fileTypes: rawExists ? ['json'] : [],
    warnings,
  }
}

function main() {
  const { selectedLevels, validateOnly } = parseArgs(process.argv.slice(2))
  const collections = CAMBRIDGE_WRITING_COLLECTIONS
    .filter(collection => selectedLevels.includes(collection.level as Level))
    .map(collection => CambridgeWritingCollectionSchema.parse(collection))

  const inventory = {
    generatedAt: new Date().toISOString(),
    mode: validateOnly ? 'validate-only' : 'write',
    levels: Object.fromEntries(
      (['b1', 'b2', 'c1', 'c2'] as Level[]).map(level => [level, inventoryFor(level)]),
    ),
  }

  ensureDir(path.dirname(INVENTORY_PATH))
  writeJson(INVENTORY_PATH, inventory)

  if (!validateOnly) {
    ensureDir(OUT_DIR)
    writeJson(path.join(OUT_DIR, 'manifest.json'), CAMBRIDGE_WRITING_MANIFEST)
    for (const collection of collections) {
      const levelDir = path.join(OUT_DIR, collection.level)
      ensureDir(levelDir)
      writeJson(path.join(levelDir, 'index.json'), collection)
      for (const test of collection.tests) {
        writeJson(path.join(levelDir, `${test.id}.json`), test)
      }
    }
  }

  const summary = collections.map(collection => ({
    level: collection.level,
    tests: collection.tests.length,
    tasks: collection.tests.reduce((sum, test) => sum + test.tasks.length, 0),
  }))
  console.log(JSON.stringify({ validateOnly, levels: selectedLevels, summary }, null, 2))
}

main()
