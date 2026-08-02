#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SOURCE_ROOT = path.resolve(ROOT, '..', 'Crawl', 'IELTS_Bank', 'output', 'cae-listening')
const OUT_JSON = path.join(ROOT, 'tmp', 'cae-audio-upload-manifest.json')
const OUT_MD = path.join(ROOT, 'tmp', 'cae-audio-upload-manifest.md')
const mime = name => ({ '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg', '.wav': 'audio/wav' }[path.extname(name).toLowerCase()] ?? 'application/octet-stream')
const sha256 = async file => { const hash = createHash('sha256'); hash.update(await fs.readFile(file)); return hash.digest('hex') }

const assets = []
for (let sourceTest = 1; sourceTest <= 30; sourceTest += 1) {
  const sourceDir = path.join(SOURCE_ROOT, `test-${String(sourceTest).padStart(2, '0')}`)
  const source = JSON.parse(await fs.readFile(path.join(sourceDir, 'test.json'), 'utf8'))
  for (const audio of source.audio) {
    const localPath = path.resolve(sourceDir, 'audio', audio.filename)
    const stat = await fs.stat(localPath)
    const appTest = sourceTest + 1
    const runtime = audio.part >= 1 && audio.part <= 4
    assets.push({ sourceTest, appTest, part: audio.part, filename: audio.filename, localPath, size: stat.size, sha256: await sha256(localPath), mime: mime(audio.filename), decision: runtime ? 'upload-runtime' : 'keep-source-extra', objectKey: runtime ? `listening/cae-c1-test${appTest}/${audio.filename}` : null, publicUrl: runtime ? `https://pub-5f3e56a575084fb39da914d5daffdbea.r2.dev/listening/cae-c1-test${appTest}/${audio.filename}` : null, catalogId: runtime ? `catalog-listening-cae-c1-test${appTest}` : null })
  }
}
const manifest = { generatedAt: new Date().toISOString(), mapping: 'sourceTest + 1 = appTest', runtimeCount: assets.filter(a => a.decision === 'upload-runtime').length, extraCount: assets.filter(a => a.decision === 'keep-source-extra').length, assets }
await fs.writeFile(OUT_JSON, JSON.stringify(manifest, null, 2) + '\n')
const lines = ['# CAE audio upload manifest', '', `Runtime objects: ${manifest.runtimeCount}`, `Source extras retained: ${manifest.extraCount}`, '', '| Source | App | Part | Filename | Size | MIME | Decision | Object key |', '|---:|---:|---:|---|---:|---|---|---|']
for (const a of assets) lines.push(`| ${a.sourceTest} | ${a.appTest} | ${a.part} | ${a.filename} | ${a.size} | ${a.mime} | ${a.decision} | ${a.objectKey ?? '—'} |`)
await fs.writeFile(OUT_MD, lines.join('\n') + '\n')
console.log(JSON.stringify({ json: OUT_JSON, markdown: OUT_MD, runtimeCount: manifest.runtimeCount, extraCount: manifest.extraCount }, null, 2))
