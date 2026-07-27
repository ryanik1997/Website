#!/usr/bin/env node
/**
 * Phase 3 — Generate AI repairs for FCE B2 Reading missing content.
 *
 * Reads:   tmp/fce-b2-ai-repair-plan.json
 * Writes:  scripts/reading/generated/fce-b2/source-testNN/part-MM.repair.json
 *
 * Run: node scripts/reading/generate-fce-b2-ai-repairs.mjs
 *      node scripts/reading/generate-fce-b2-ai-repairs.mjs --force  (regenerate all)
 *      node scripts/reading/generate-fce-b2-ai-repairs.mjs --only-missing  (only unresolved)
 *
 * Skips AI calls if cache exists and inputHash unchanged, unless --force.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..', '..')

const FCE_ROOT = path.join(
  process.env.TAINGUYEN_PATH || path.join(REPO_ROOT, 'Tainguyen'),
  'Import Cambridge', 'FCE_B2', 'Reading',
)

const PLAN_PATH = path.resolve('tmp/fce-b2-ai-repair-plan.json')
const CACHE_ROOT = path.resolve(__dirname, 'generated', 'fce-b2')

const FORCE = process.argv.includes('--force')
const ONLY_MISSING = process.argv.includes('--only-missing')

const { getPartContract } = await import('./fce-b2-ai-contracts.mjs')
const { callAiForRepair, computeInputHash, isAiProviderConfigured } = await import('./fce-b2-ai-provider.mjs')

const AI_CONFIGURED = isAiProviderConfigured()

async function loadCachePart(sourceTestNumber, partNumber) {
  const cachePath = path.join(
    CACHE_ROOT,
    `source-test${String(sourceTestNumber).padStart(2, '0')}`,
    `part-${String(partNumber).padStart(2, '0')}.repair.json`,
  )
  try {
    return JSON.parse(await fs.readFile(cachePath, 'utf8'))
  } catch {
    return null
  }
}

async function writeCache(sourceTestNumber, partNumber, data) {
  const dir = path.join(CACHE_ROOT, `source-test${String(sourceTestNumber).padStart(2, '0')}`)
  await fs.mkdir(dir, { recursive: true })
  const cachePath = path.join(dir, `part-${String(partNumber).padStart(2, '0')}.repair.json`)
  await fs.writeFile(cachePath, JSON.stringify(data, null, 2), 'utf8')
  return cachePath
}

async function loadSourceExam(sourceTestNumber) {
  const filePath = path.join(FCE_ROOT, `fce-reading-test${sourceTestNumber}`, 'exam', 'exam.json')
  return JSON.parse(await fs.readFile(filePath, 'utf8'))
}

function buildSourceCtx(page) {
  return {
    passageTextHtml: page.passageTextHtml ?? '',
    rawHtmlSample: page.rawHtmlSample ?? '',
    title: page.passageTitle ?? `Part ${page.partNumber}`,
    instructions: page.instructions ?? '',
    questions: page.questions ?? [],
  }
}

async function generateRepair(sourceTestNumber, partNumber) {
  console.log(`[generate] Test ${sourceTestNumber} Part ${partNumber}...`)

  // Check cache first
  const cached = await loadCachePart(sourceTestNumber, partNumber)
  if (cached && !FORCE) {
    const plan = JSON.parse(await fs.readFile(PLAN_PATH, 'utf8'))
    const partEntry = plan.parts.find(
      p => p.sourceTestNumber === sourceTestNumber && p.partNumber === partNumber
    )
    if (partEntry && partEntry.status === 'complete' && cached.provenance?.origin === 'source') {
      console.log(`  [cache] HIT — source origin, skipping`)
      return cached
    }
    if (cached.provenance && !FORCE) {
      console.log(`  [cache] HIT — ${cached.provenance.origin}, ${cached.provenance.generatedFields?.length ?? 0} fields`)
      return cached
    }
    console.log(`  [cache] HIT but --force, regenerating`)
  }

  // Load source
  const raw = await loadSourceExam(sourceTestNumber)
  const pages = Array.isArray(raw.pages) ? raw.pages : []
  const page = pages.find(p => Number(p.partNumber) === partNumber)

  if (!page) {
    console.log(`  SKIP — no page found for Part ${partNumber}`)
    return null
  }

  const sourceCtx = buildSourceCtx(page)
  const contract = getPartContract(partNumber, sourceCtx)

  // If no AI configured, write a placeholder
  if (!AI_CONFIGURED) {
    console.log(`  [dry-run] AI not configured — writing placeholder`)
    const { makeProvenance } = await import('./fce-b2-ai-contracts.mjs')
    const placeholder = {
      provenance: makeProvenance('ai-generated', ['pending_ai_call'], sourceTestNumber, sourceTestNumber + 1, null),
      inputHash: computeInputHash(contract.systemPrompt, contract.userPrompt),
      promptVersion: '1.0',
      model: null,
      generatedAt: new Date().toISOString(),
      repair: null,
      status: 'pending_ai_key',
    }
    await writeCache(sourceTestNumber, partNumber, placeholder)
    return placeholder
  }

  // Call AI
  const inputHash = computeInputHash(contract.systemPrompt, contract.userPrompt)
  console.log(`  Calling AI for repair...`)

  let result
  try {
    result = await callAiForRepair(contract.systemPrompt, contract.userPrompt)
  } catch (err) {
    console.error(`  AI call failed: ${err.message}`)
    // Write failed state
    const failed = {
      provenance: {
        origin: 'ai-generated',
        generatedFields: ['failed_ai_call'],
        sourceTestNumber,
        appTestNumber: sourceTestNumber + 1,
        model: process.env.FCE_REPAIR_AI_MODEL || null,
        generatedAt: new Date().toISOString(),
        promptHash: inputHash,
        confidence: 0,
        reviewed: false,
      },
      inputHash,
      promptVersion: '1.0',
      model: process.env.FCE_REPAIR_AI_MODEL || null,
      generatedAt: new Date().toISOString(),
      error: err.message,
      repair: null,
      status: 'failed',
    }
    await writeCache(sourceTestNumber, partNumber, failed)
    return failed
  }

  const { makeProvenance } = await import('./fce-b2-ai-contracts.mjs')
  const generatedFields = Object.keys(result).filter(k => k !== 'provenance')

  const repairData = {
    provenance: makeProvenance('ai-generated', generatedFields, sourceTestNumber, sourceTestNumber + 1, process.env.FCE_REPAIR_AI_MODEL || null),
    inputHash,
    promptVersion: '1.0',
    model: process.env.FCE_REPAIR_AI_MODEL || null,
    generatedAt: new Date().toISOString(),
    repair: result,
    status: 'generated',
  }
  // Update prompt hash
  repairData.provenance.promptHash = inputHash

  const cachePath = await writeCache(sourceTestNumber, partNumber, repairData)
  console.log(`  Written: ${cachePath}`)
  return repairData
}

async function main() {
  console.log('[generate-fce-b2-ai-repairs]')
  console.log(`  Force: ${FORCE}`)
  console.log(`  Only missing: ${ONLY_MISSING}`)
  console.log(`  AI configured: ${AI_CONFIGURED}`)
  console.log(`  Cache root: ${CACHE_ROOT}`)

  // Load repair plan
  const plan = JSON.parse(await fs.readFile(PLAN_PATH, 'utf8'))

  // Filter which parts to repair
  let targets = plan.parts
  if (ONLY_MISSING) {
    targets = targets.filter(p => p.status !== 'complete')
    console.log(`  Filtered to ${targets.length} parts with missing content`)
  }

  const results = []
  for (const target of targets) {
    const result = await generateRepair(target.sourceTestNumber, target.partNumber)
    results.push({ ...target, generatedStatus: result?.status ?? 'skipped' })
  }

  // Summary
  const byStatus = {}
  for (const r of results) {
    byStatus[r.generatedStatus] = (byStatus[r.generatedStatus] || 0) + 1
  }

  console.log(`\n[generate] Complete. Summary:`)
  for (const [status, count] of Object.entries(byStatus)) {
    console.log(`  ${status}: ${count}`)
  }
  console.log(`\nTotal: ${results.length} parts processed`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
