#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { ROOT, DATA_ROOT, TMP_ROOT, readJson } from './cambridge-writing-runtime.mjs'
const levels = ['b1', 'b2', 'c1', 'c2']
const summary = { finalTestNumber: 36, levels: {}, generatedIndexCount: 140, totalCorpusTests: 144, stoppedReason: 'DeepSeek provider token limit reached', testsAbove36Adopted: 0, pausedStagingFiles: [], catalogValid: null, coverageValid: null, buildValid: null }
for (const level of levels) { const files = (await fs.readdir(path.join(DATA_ROOT, level))).filter(name => /-test-\d+\.json$/.test(name)); const tests = await Promise.all(files.map(name => readJson(path.join(DATA_ROOT, level, name)))); summary.levels[level] = { totalTests: tests.length, generatedTests: tests.filter(test => test.testNumber >= 2).length, taskCount: tests.reduce((sum, test) => sum + test.tasks.length, 0) } }
try { summary.pausedStagingFiles = (await readJson(path.join(TMP_ROOT, 'cambridge-writing-paused-after-36/manifest.json'))).map(item => item.testId) } catch {}
await fs.writeFile(path.join(TMP_ROOT, 'cambridge-writing-final-36-summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
await fs.writeFile(path.join(TMP_ROOT, 'cambridge-writing-final-36-summary.md'), `# Cambridge Writing corpus closed at Test 36\n\n- Catalog range: Test 01–36 per level\n- Generated index: 140 tests\n- Total corpus: 144 tests\n- Stopped reason: DeepSeek provider token limit reached\n- Test 37+ is not catalogued or indexed.\n- Partial staging was archived under `tmp/cambridge-writing-paused-after-36/`.\n- No AI provider was called in this closing session.\n`)
console.log(JSON.stringify(summary, null, 2))
