#!/usr/bin/env node
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DEFAULT_INPUT_ROOT,
  ROOT,
  buildAnswerVault,
  buildCatalogExam,
  buildCatalogStub,
  buildRuntimeBody,
  discoverLicensedCaeInput,
  parseCliArgs,
  readLicensedCaeTest,
  resolveProjectLocalPath,
  sha256,
  stableJson,
} from './licensed-cae-listening.mjs'

function normalizeOutputRoots(outputRoot) {
  if (!outputRoot) {
    return {
      packageData: path.join(ROOT, 'packages', 'catalog', 'data'),
      publicCatalog: path.join(ROOT, 'apps', 'web', 'public', 'catalog'),
    }
  }
  return {
    packageData: path.join(outputRoot, 'packages', 'catalog', 'data'),
    publicCatalog: path.join(outputRoot, 'apps', 'web', 'public', 'catalog'),
  }
}

async function readJsonIfExists(filePath, fallback) {
  if (!existsSync(filePath)) return fallback
  return JSON.parse(await fs.readFile(filePath, 'utf8'))
}

function upsertById(items, entry) {
  return [...items.filter(item => item?.id !== entry.id), entry]
    .sort((left, right) => String(left.id).localeCompare(String(right.id), undefined, { numeric: true }))
}

async function comparePlanned(filePath, content) {
  if (!existsSync(filePath)) return { status: 'new', existingHash: null, plannedHash: sha256(content) }
  const existing = await fs.readFile(filePath)
  const existingHash = sha256(existing)
  const plannedHash = sha256(content)
  return { status: existingHash === plannedHash ? 'identical' : 'conflict', existingHash, plannedHash }
}

async function atomicWrite(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  const temporary = `${filePath}.tmp-${process.pid}`
  await fs.writeFile(temporary, content)
  await fs.rename(temporary, filePath)
}

async function atomicCopy(source, destination) {
  await fs.mkdir(path.dirname(destination), { recursive: true })
  const temporary = `${destination}.tmp-${process.pid}`
  await fs.copyFile(source, temporary)
  await fs.rename(temporary, destination)
}

export async function createConversionPlan({ inputRoot, outputRoot, overwrite = false }) {
  const roots = normalizeOutputRoots(outputRoot)
  const { testDirs, unexpectedDirectories } = await discoverLicensedCaeInput(inputRoot)
  const validations = []
  for (const testDir of testDirs) validations.push(await readLicensedCaeTest(testDir))

  const invalid = validations.filter(result => !result.ok)
  if (invalid.length > 0 || unexpectedDirectories.length > 0) {
    const folderErrors = unexpectedDirectories.map(testDir => ({
      testDir,
      code: 'folder.name',
      message: 'Licensed test directories must use the exact test-XX naming convention.',
    }))
    return {
      ok: false,
      inputRoot,
      outputRoot: outputRoot ?? ROOT,
      discovered: validations.length,
      valid: validations.length - invalid.length,
      invalid: invalid.length + unexpectedDirectories.length,
      tests: validations.map(result => ({ testDir: result.testDir, ok: result.ok, summary: result.summary, errors: result.errors })),
      errors: [...folderErrors, ...invalid.flatMap(result => result.errors.map(item => ({ testDir: result.testDir, ...item })))],
      entries: [],
    }
  }

  const duplicateNumbers = validations.map(result => result.summary.testNumber).filter((value, index, list) => list.indexOf(value) !== index)
  if (duplicateNumbers.length > 0) {
    return { ok: false, inputRoot, outputRoot: outputRoot ?? ROOT, discovered: validations.length, valid: validations.length, invalid: 0, tests: [], errors: [{ code: 'test.duplicate', message: `Duplicate testNumber values: ${[...new Set(duplicateNumbers)].join(', ')}` }], entries: [] }
  }

  const entries = []
  for (const validation of validations) {
    const exam = buildCatalogExam(validation.payload)
    const body = buildRuntimeBody(exam)
    const vault = buildAnswerVault(exam)
    const stub = buildCatalogStub(exam)
    const slug = exam.catalogSlug
    const packagePath = path.join(roots.packageData, `listening-${slug}.json`)
    const bodyPath = path.join(roots.publicCatalog, 'exams', 'listening', `${exam.id}.json`)
    const vaultPath = path.join(roots.publicCatalog, 'exams', 'listening', `${exam.id}.answers.json`)
    const audioCopies = exam.parts.map(part => {
      const filename = validation.payload.manifest.audio[`part${part.partNumber}`]
      return {
        source: path.join(validation.testDir, filename),
        destination: path.join(roots.publicCatalog, 'listening', slug, filename),
      }
    })

    const outputs = [
      { kind: 'package', path: packagePath, content: stableJson(exam) },
      { kind: 'body', path: bodyPath, content: stableJson(body, true) },
      { kind: 'vault', path: vaultPath, content: stableJson(vault, true) },
    ]
    for (const output of outputs) Object.assign(output, await comparePlanned(output.path, output.content))
    for (const audio of audioCopies) {
      const content = await fs.readFile(audio.source)
      Object.assign(audio, await comparePlanned(audio.destination, content))
    }

    const conflicts = [...outputs, ...audioCopies].filter(item => item.status === 'conflict')
    entries.push({
      testDir: validation.testDir,
      testNumber: validation.summary.testNumber,
      authorization: validation.summary.authorization,
      sourceHostname: validation.summary.sourceHostname,
      examId: exam.id,
      slug,
      exam,
      body,
      vault,
      stub,
      outputs,
      audioCopies,
      conflicts: conflicts.map(item => item.path ?? item.destination),
      writable: overwrite || conflicts.length === 0,
    })
  }

  const manifestPath = path.join(roots.packageData, 'manifest.json')
  const metaPath = path.join(roots.packageData, 'catalog-listening-meta.json')
  const existingManifest = await readJsonIfExists(manifestPath, { version: 2, builtAt: null, reading: [], listening: [] })
  const existingMeta = await readJsonIfExists(metaPath, [])
  let plannedManifest = { ...existingManifest, listening: existingManifest.listening ?? [] }
  let plannedMeta = existingMeta
  for (const entry of entries) {
    plannedManifest = {
      ...plannedManifest,
      listening: upsertById(plannedManifest.listening, { id: entry.examId, slug: entry.slug, title: entry.exam.title }),
    }
    plannedMeta = upsertById(plannedMeta, entry.stub)
  }
  const manifestContent = stableJson(plannedManifest)
  const metaContent = stableJson(plannedMeta)
  const indexOutputs = [
    { kind: 'manifest', path: manifestPath, content: manifestContent, ...(await comparePlanned(manifestPath, manifestContent)) },
    { kind: 'meta', path: metaPath, content: metaContent, ...(await comparePlanned(metaPath, metaContent)) },
  ]

  const blockedEntries = entries.filter(entry => !entry.writable)
  return {
    ok: blockedEntries.length === 0,
    inputRoot,
    outputRoot: outputRoot ?? ROOT,
    discovered: validations.length,
    valid: validations.length,
    invalid: 0,
    overwrite,
    tests: validations.map(result => ({ testDir: result.testDir, ok: result.ok, summary: result.summary, errors: [] })),
    errors: blockedEntries.map(entry => ({ code: 'output.conflict', message: `${entry.examId} has materially different existing outputs. Use --overwrite after review.`, paths: entry.conflicts })),
    entries,
    indexOutputs,
    roots,
  }
}

export async function applyConversionPlan(plan) {
  if (!plan.ok) throw new Error('Refusing to apply an invalid or conflicting conversion plan.')
  for (const entry of plan.entries) {
    for (const output of entry.outputs) {
      if (output.status !== 'identical') await atomicWrite(output.path, output.content)
    }
    for (const audio of entry.audioCopies) {
      if (audio.status !== 'identical') await atomicCopy(audio.source, audio.destination)
    }
  }
  for (const output of plan.indexOutputs) {
    if (output.status !== 'identical') await atomicWrite(output.path, output.content)
  }
  return {
    applied: plan.entries.length,
    written: plan.entries.flatMap(entry => [...entry.outputs, ...entry.audioCopies]).filter(item => item.status !== 'identical').length
      + plan.indexOutputs.filter(item => item.status !== 'identical').length,
  }
}

function reportFromPlan(plan, mode, applied = null) {
  return {
    ok: plan.ok,
    mode,
    inputRoot: plan.inputRoot,
    outputRoot: plan.outputRoot,
    discovered: plan.discovered,
    valid: plan.valid,
    invalid: plan.invalid,
    overwrite: plan.overwrite,
    errors: plan.errors,
    entries: plan.entries.map(entry => ({
      testNumber: entry.testNumber,
      authorization: entry.authorization,
      sourceHostname: entry.sourceHostname,
      examId: entry.examId,
      slug: entry.slug,
      writable: entry.writable,
      outputs: entry.outputs.map(output => ({ kind: output.kind, path: output.path, status: output.status, plannedHash: output.plannedHash, existingHash: output.existingHash })),
      audio: entry.audioCopies.map(audio => ({ source: audio.source, destination: audio.destination, status: audio.status, plannedHash: audio.plannedHash, existingHash: audio.existingHash })),
    })),
    indexOutputs: (plan.indexOutputs ?? []).map(output => ({ kind: output.kind, path: output.path, status: output.status, plannedHash: output.plannedHash, existingHash: output.existingHash })),
    ...(applied ? { applied } : {}),
  }
}

async function main() {
  const args = parseCliArgs()
  const dryRun = args['dry-run'] === true
  const apply = args.apply === true
  if (dryRun === apply) throw new Error('Use exactly one of --dry-run or --apply.')
  const inputRoot = resolveProjectLocalPath(args.input, DEFAULT_INPUT_ROOT)
  const outputRoot = args['output-root'] ? resolveProjectLocalPath(args['output-root'], ROOT) : null
  const plan = await createConversionPlan({ inputRoot, outputRoot, overwrite: args.overwrite === true })
  let applied = null
  if (apply && plan.ok) applied = await applyConversionPlan(plan)
  console.log(JSON.stringify(reportFromPlan(plan, dryRun ? 'dry-run' : 'apply', applied), null, 2))
  if (!plan.ok) process.exitCode = 1
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(caught => {
    console.error(caught instanceof Error ? caught.message : String(caught))
    process.exit(1)
  })
}
