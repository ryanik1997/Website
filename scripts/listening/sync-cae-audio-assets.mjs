#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { S3Client, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const manifestPath = path.join(ROOT, 'tmp', 'cae-audio-upload-manifest.json')
const PUBLIC_BASE = 'https://pub-5f3e56a575084fb39da914d5daffdbea.r2.dev'
const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME']
const args = new Set(process.argv.slice(2))
const onlyValue = process.argv.find(value => value === '--only') ? process.argv[process.argv.indexOf('--only') + 1] : null

function safeError(error) {
  return { httpStatus: error?.$metadata?.httpStatusCode ?? null, name: error?.name ?? null, code: error?.Code ?? error?.code ?? null, message: error?.message ?? String(error), attempts: error?.$metadata?.attempts ?? null }
}

async function send(operation, command, context) {
  try {
    const response = await client.send(command)
    console.log(JSON.stringify({ operation, bucket: context.bucket, key: context.key, httpStatus: response?.$metadata?.httpStatusCode ?? 200, error: null, attempts: response?.$metadata?.attempts ?? 1 }))
    return { ok: true, response }
  } catch (error) {
    console.log(JSON.stringify({ operation, bucket: context.bucket, key: context.key, ...safeError(error) }))
    return { ok: false, error }
  }
}

for (const name of required) if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`)
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
let assets = manifest.assets.filter(asset => asset.decision === 'upload-runtime')
if (onlyValue) assets = assets.filter(asset => String(asset.sourceTest) === String(onlyValue))
if (args.has('--verify-only')) assets = assets

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
})
const bucket = process.env.R2_BUCKET_NAME
console.log(JSON.stringify({ endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, bucket }))

const results = []
for (const asset of assets) {
  let remote = null
  const head = await send('HeadObject', new HeadObjectCommand({ Bucket: bucket, Key: asset.objectKey }), { bucket, key: asset.objectKey })
  remote = head.ok ? head.response : null
  const sameSize = remote?.ContentLength === asset.size
  if (args.has('--verify-only')) {
    results.push({ ...asset, action: sameSize ? 'verified' : 'missing-or-size-mismatch', remoteSize: remote?.ContentLength ?? null })
    continue
  }
  if (!sameSize && args.has('--dry-run')) {
    results.push({ ...asset, action: 'planned-upload' })
  } else if (!sameSize) {
    const body = await fs.readFile(asset.localPath)
    const put = await send('PutObject', new PutObjectCommand({ Bucket: bucket, Key: asset.objectKey, Body: body, ContentType: asset.mime, CacheControl: 'public, max-age=31536000, immutable' }), { bucket, key: asset.objectKey })
    if (!put.ok) { results.push({ ...asset, action: 'failed', error: safeError(put.error) }); continue }
    results.push({ ...asset, action: 'uploaded' })
  } else results.push({ ...asset, action: 'skipped' })
}

const remoteRows = args.has('--dry-run') ? [] : await Promise.all(results.filter(row => row.action !== 'failed').map(async row => {
  const response = await fetch(`${PUBLIC_BASE}/${row.objectKey}`, { headers: { Range: 'bytes=0-1023' } })
  return { key: row.objectKey, status: response.status, contentType: response.headers.get('content-type') }
}))
const report = { mode: args.has('--verify-only') ? 'verify-only' : args.has('--dry-run') ? 'dry-run' : 'apply', count: results.length, results: results.map(({ localPath, ...row }) => row), remote: remoteRows }
console.log(JSON.stringify(report, null, 2))
