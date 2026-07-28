#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2).filter(value => value !== '--only-failed')
const result = spawnSync(process.execPath, ['scripts/writing/verify-cambridge-writing-tests.mjs', '--revise', ...args], { cwd: ROOT, stdio: 'inherit' })
process.exitCode = result.status ?? 1
