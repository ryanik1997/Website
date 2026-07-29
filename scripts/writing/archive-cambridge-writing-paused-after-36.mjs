#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { ROOT, TMP_ROOT, TestSchema } from './cambridge-writing-runtime.mjs'

const sourceRoot = path.join(TMP_ROOT, 'cambridge-writing-staging')
const archiveRoot = path.join(TMP_ROOT, 'cambridge-writing-paused-after-36')
const manifest = []
const hash = async file => crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex')
await fs.mkdir(archiveRoot, { recursive: true })
for (const level of ['b1', 'b2', 'c1', 'c2']) {
  const sourceDir = path.join(sourceRoot, level)
  const targetDir = path.join(archiveRoot, level)
  await fs.mkdir(targetDir, { recursive: true })
  let names = []
  try { names = await fs.readdir(sourceDir) } catch (error) { if (error.code !== 'ENOENT') throw error }
  for (const name of names.filter(value => /^([a-z][0-9])-test-(3[7-9]|4[0-9]|5[0-1])\.json$/.test(value))) {
    const source = path.join(sourceDir, name)
    const destination = path.join(targetDir, name)
    const before = await hash(source)
    let schemaValid = true
    try { TestSchema.parse(JSON.parse(await fs.readFile(source, 'utf8'))) } catch { schemaValid = false }
    await fs.rename(source, destination)
    const after = await hash(destination)
    if (before !== after) throw new Error(`hash mismatch after move: ${name}`)
    manifest.push({ testId: name.slice(0, -5), originalPath: path.relative(ROOT, source).replaceAll('\\', '/'), archivedPath: path.relative(ROOT, destination).replaceAll('\\', '/'), contentHash: after, schemaValid, reason: 'Generation stopped at Test 36 due to provider token limit' })
  }
}
await fs.writeFile(path.join(archiveRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(JSON.stringify({ archived: manifest.length, manifest: path.relative(ROOT, path.join(archiveRoot, 'manifest.json')) }, null, 2))
