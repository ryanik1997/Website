#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CAMBRIDGE_WRITING_LEVEL_CONFIGS,
  CAMBRIDGE_WRITING_LEVELS,
  getTestId,
} from './cambridge-writing-level-config.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const JSON_OUTPUT = path.join(ROOT, 'tmp/cambridge-writing-generation-plan.json')
const MD_OUTPUT = path.join(ROOT, 'tmp/cambridge-writing-generation-plan.md')

export const TOPIC_FAMILIES = [
  'education and learning',
  'work and careers',
  'community and public services',
  'environment and sustainability',
  'technology and communication',
  'arts, culture and media',
  'travel and intercultural experience',
  'health and wellbeing',
  'consumer life and lifestyle',
  'science, society and future change',
]

const FAMILY_SEEDS = {
  'education and learning': ['peer learning project', 'library skills event', 'creative study space', 'adult learning workshop', 'language exchange scheme'],
  'work and careers': ['workplace observation day', 'career mentoring event', 'team skills workshop', 'local enterprise visit', 'volunteer experience fair'],
  'community and public services': ['community centre programme', 'neighbourhood improvement day', 'public library initiative', 'youth advisory group', 'shared town space'],
  'environment and sustainability': ['low-waste school event', 'greener local journeys', 'community garden plan', 'repair and reuse project', 'energy-saving challenge'],
  'technology and communication': ['digital communication workshop', 'screen-free club event', 'community technology support', 'online teamwork project', 'responsible media campaign'],
  'arts, culture and media': ['local arts festival', 'student magazine feature', 'community performance', 'museum activity day', 'book and film club'],
  'travel and intercultural experience': ['visitor welcome project', 'regional travel guide', 'student exchange activity', 'local heritage walk', 'intercultural food event'],
  'health and wellbeing': ['active break programme', 'wellbeing workshop', 'healthy routine campaign', 'outdoor activity club', 'community relaxation space'],
  'consumer life and lifestyle': ['local market project', 'thoughtful shopping campaign', 'shared hobby event', 'home organisation challenge', 'customer experience review'],
  'science, society and future change': ['future neighbourhood exhibition', 'everyday science event', 'public innovation forum', 'skills for future life', 'design challenge for communities'],
}

const AUDIENCES = [
  'English teacher',
  'college magazine readers',
  'English-speaking friend',
  'community programme coordinator',
  'school or college leadership team',
  'intelligent general readers',
]
const PURPOSES = [
  'discuss and justify',
  'evaluate and recommend',
  'inform and engage',
  'advise and explain',
  'compare and reflect',
  'propose and justify',
]
const REGISTERS = ['neutral academic', 'engaging semi-formal', 'informal', 'formal', 'discursive', 'friendly neutral']

function makeSubtopics(family, occurrence) {
  const seeds = FAMILY_SEEDS[family]
  const anchor = seeds[occurrence % seeds.length]
  return [anchor, `${anchor} participation`, `${anchor} long-term value`]
}

export function buildPlan() {
  const rows = []
  for (const level of CAMBRIDGE_WRITING_LEVELS) {
    const config = CAMBRIDGE_WRITING_LEVEL_CONFIGS[level]
    for (let offset = 0; offset < config.newTestCount; offset += 1) {
      const testNumber = offset + 2
      const familyIndex = offset % TOPIC_FAMILIES.length
      const family = TOPIC_FAMILIES[familyIndex]
      const occurrence = Math.floor(offset / TOPIC_FAMILIES.length)
      const subtopics = makeSubtopics(family, occurrence)
      const audiences = config.tasks.map((_, taskIndex) => AUDIENCES[(offset + taskIndex + familyIndex) % AUDIENCES.length])
      const purposes = config.tasks.map((_, taskIndex) => PURPOSES[(offset * 2 + taskIndex) % PURPOSES.length])
      const registers = config.tasks.map((_, taskIndex) => REGISTERS[(offset + taskIndex * 2) % REGISTERS.length])
      const scenarioSeeds = Object.fromEntries(config.tasks.map((task, taskIndex) => [
        `task${task.taskNumber}`,
        `${subtopics[taskIndex % subtopics.length]} for ${audiences[taskIndex]}: ${purposes[taskIndex]}`,
      ]))
      rows.push({
        level,
        testNumber,
        testId: getTestId(level, testNumber),
        topicFamily: family,
        subtopics,
        audiences,
        communicativePurposes: purposes,
        registers,
        scenarioSeeds,
        forbiddenOverlapWith: [],
        status: 'planned',
      })
    }
  }
  return rows
}

export function validatePlan(rows) {
  const errors = []
  const ids = new Set()
  for (const level of CAMBRIDGE_WRITING_LEVELS) {
    const expected = CAMBRIDGE_WRITING_LEVEL_CONFIGS[level].newTestCount
    const levelRows = rows.filter(row => row.level === level)
    if (levelRows.length !== expected) errors.push(`${level}: expected ${expected} rows, got ${levelRows.length}`)
    const familyCounts = Object.fromEntries(TOPIC_FAMILIES.map(family => [family, levelRows.filter(row => row.topicFamily === family).length]))
    const min = Math.floor(expected / TOPIC_FAMILIES.length)
    const max = Math.ceil(expected / TOPIC_FAMILIES.length)
    for (const [family, count] of Object.entries(familyCounts)) {
      if (count < min || count > max) errors.push(`${level}: topic family ${family} count ${count} outside ${min}-${max}`)
    }
    const scenarios = new Set()
    for (const row of levelRows) {
      for (const scenario of Object.values(row.scenarioSeeds)) {
        if (scenarios.has(scenario)) errors.push(`${level}: duplicate scenario: ${scenario}`)
        scenarios.add(scenario)
      }
    }
  }
  for (const row of rows) {
    if (ids.has(row.testId)) errors.push(`duplicate test id: ${row.testId}`)
    ids.add(row.testId)
  }
  if (errors.length) throw new Error(`Invalid Cambridge Writing generation plan:\n${errors.join('\n')}`)
}

function toMarkdown(rows) {
  const lines = [
    '# Cambridge Writing AI Generation Plan',
    '',
    `- Total planned tests: ${rows.length}`,
    `- Levels: ${CAMBRIDGE_WRITING_LEVELS.join(', ')}`,
    `- Topic families: ${TOPIC_FAMILIES.length}`,
    '',
    '| Level | Tests | First | Last |',
    '|---|---:|---|---|',
  ]
  for (const level of CAMBRIDGE_WRITING_LEVELS) {
    const subset = rows.filter(row => row.level === level)
    lines.push(`| ${level.toUpperCase()} | ${subset.length} | ${subset[0]?.testId ?? '-'} | ${subset.at(-1)?.testId ?? '-'} |`)
  }
  lines.push('', '## Planned rows', '', '| Test | Topic family | Subtopics |', '|---|---|---|')
  for (const row of rows) lines.push(`| ${row.testId} | ${row.topicFamily} | ${row.subtopics.join('; ')} |`)
  return `${lines.join('\n')}\n`
}

async function main() {
  const rows = buildPlan()
  validatePlan(rows)
  await fs.mkdir(path.dirname(JSON_OUTPUT), { recursive: true })
  await fs.writeFile(JSON_OUTPUT, `${JSON.stringify({ generatedAt: Date.now(), rows }, null, 2)}\n`)
  await fs.writeFile(MD_OUTPUT, toMarkdown(rows))
  console.log(`Planned ${rows.length} Cambridge Writing AI tests.`)
  console.log(path.relative(ROOT, JSON_OUTPUT))
  console.log(path.relative(ROOT, MD_OUTPUT))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
