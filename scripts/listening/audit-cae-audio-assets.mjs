#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SOURCE_ROOT = path.resolve(ROOT, '..', 'Crawl', 'IELTS_Bank', 'output', 'cae-listening')
const PUBLIC_ROOT = path.join(ROOT, 'apps', 'web', 'public')
const R2_BASE = 'https://pub-5f3e56a575084fb39da914d5daffdbea.r2.dev'

async function probe(url) {
  try {
    const response = await fetch(url, { headers: { Range: 'bytes=0-1023' } })
    return { status: response.status, contentType: response.headers.get('content-type'), contentLength: response.headers.get('content-length'), acceptRanges: response.headers.get('accept-ranges') }
  } catch (error) {
    return { status: null, error: error instanceof Error ? error.message : String(error) }
  }
}

const rows = []
for (let sourceNumber = 1; sourceNumber <= 30; sourceNumber += 1) {
  const appNumber = sourceNumber + 1
  const testDir = path.join(SOURCE_ROOT, `test-${String(sourceNumber).padStart(2, '0')}`)
  const test = JSON.parse(await fs.readFile(path.join(testDir, 'test.json'), 'utf8'))
  for (const asset of test.audio) {
    const filename = asset.filename
    const localPath = path.join(testDir, 'audio', filename)
    const publicPath = path.join(PUBLIC_ROOT, 'catalog', 'listening', `cae-c1-test${appNumber}`, filename)
    const objectKey = `listening/cae-c1-test${appNumber}/${filename}`
    const local = await fs.stat(localPath).then(stat => ({ exists: true, size: stat.size })).catch(() => ({ exists: false, size: 0 }))
    const bundled = await fs.stat(publicPath).then(stat => ({ exists: true, size: stat.size })).catch(() => ({ exists: false, size: 0 }))
    rows.push({ sourceTest: sourceNumber, appTest: appNumber, part: asset.part, filename, objectKey, local, bundled, remote: await probe(`${R2_BASE}/${objectKey}`) })
  }
}

const summary = {
  total: rows.length,
  localMissing: rows.filter(row => !row.local.exists || row.local.size === 0).length,
  bundledMissing: rows.filter(row => !row.bundled.exists || row.bundled.size === 0).length,
  remoteOk: rows.filter(row => [200, 206].includes(row.remote.status) && /^audio\//i.test(row.remote.contentType ?? '')).length,
  remoteFailed: rows.filter(row => !([200, 206].includes(row.remote.status) && /^audio\//i.test(row.remote.contentType ?? ''))).length,
}
console.log(JSON.stringify({ summary, rows }, null, 2))
