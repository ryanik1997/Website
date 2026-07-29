#!/usr/bin/env node
import path from 'node:path'
import fs from 'node:fs/promises'
import { ROOT, listCambridgeWritingFiles, parseArgs, readJson } from './cambridge-writing-runtime.mjs'
const args = parseArgs()
if (args['dry-run'] !== true && args.apply !== true) throw new Error('Use --dry-run or --apply.')
const files = await listCambridgeWritingFiles({ source: 'staging', level: args.level ?? 'all', from: Number(args.from ?? 7), to: Number(args.to ?? 11) })
const entries = await Promise.all(files.map(async file => { const test = await readJson(file); return { testId: test.id, source: path.relative(ROOT, file).replaceAll('\\', '/'), destination: path.relative(ROOT, path.join('packages/catalog/data/cambridge-writing', test.level, path.basename(file))).replaceAll('\\', '/') } }))
if (args.apply === true) {
  for (const entry of entries) {
    const test = await readJson(path.join(ROOT, entry.source));
    const destination = path.join(ROOT, entry.destination)
    try { await fs.access(destination); throw new Error(`Refusing overwrite: ${entry.destination}`) } catch (error) { if (error.code !== 'ENOENT') throw error }
    const temp = `${destination}.tmp-${process.pid}`
    await fs.mkdir(path.dirname(destination), { recursive: true }); await fs.writeFile(temp, `${JSON.stringify(test, null, 2)}\n`); await fs.rename(temp, destination)
  }
}
console.log(JSON.stringify({ dryRun: args.apply !== true, wouldCopy: entries.length, copied: args.apply === true ? entries.length : 0, overwrite: 0, missing: 0, invalid: 0, entries }, null, 2))
