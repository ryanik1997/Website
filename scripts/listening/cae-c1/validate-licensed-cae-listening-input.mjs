#!/usr/bin/env node
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DEFAULT_INPUT_ROOT,
  discoverLicensedCaeInput,
  parseCliArgs,
  readLicensedCaeTest,
  resolveProjectLocalPath,
} from './licensed-cae-listening.mjs'

export async function validateInputRoot(inputRoot) {
  const { testDirs, unexpectedDirectories } = await discoverLicensedCaeInput(inputRoot)
  const results = []
  for (const testDir of testDirs) results.push(await readLicensedCaeTest(testDir))
  const errors = [
    ...unexpectedDirectories.map(testDir => ({
      testDir: path.relative(inputRoot, testDir) || '.',
      code: 'folder.name',
      message: 'Licensed test directories must use the exact test-XX naming convention.',
    })),
    ...results.flatMap(result => result.errors.map(item => ({ testDir: path.relative(inputRoot, result.testDir) || '.', ...item }))),
  ]
  return {
    ok: errors.length === 0,
    inputRoot,
    discovered: testDirs.length,
    valid: results.filter(result => result.ok).length,
    invalid: results.filter(result => !result.ok).length + unexpectedDirectories.length,
    tests: results.map(({ ok, errors: testErrors, summary, testDir }) => ({
      testDir: path.relative(inputRoot, testDir) || '.',
      ok,
      summary,
      errors: testErrors,
    })),
    errors,
  }
}

async function main() {
  const args = parseCliArgs()
  const inputRoot = resolveProjectLocalPath(args.input, DEFAULT_INPUT_ROOT)
  const report = await validateInputRoot(inputRoot)
  console.log(JSON.stringify(report, null, 2))
  if (!report.ok) process.exitCode = 1
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(caught => {
    console.error(caught instanceof Error ? caught.message : String(caught))
    process.exit(1)
  })
}
