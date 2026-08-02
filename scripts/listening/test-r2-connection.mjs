#!/usr/bin/env node
import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME']
for (const name of required) if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`)

const bucket = process.env.R2_BUCKET_NAME
const key = `__diagnostics/cae-r2-smoke-${Date.now()}.txt`
const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
const client = new S3Client({ region: 'auto', endpoint, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } })
const context = { bucket, key }
function details(error) { return { httpStatus: error?.$metadata?.httpStatusCode ?? null, name: error?.name ?? null, code: error?.Code ?? error?.code ?? null, message: error?.message ?? String(error), attempts: error?.$metadata?.attempts ?? null } }
async function run(operation, command) {
  try { const response = await client.send(command); console.log(JSON.stringify({ operation, ...context, status: 'PASS', httpStatus: response?.$metadata?.httpStatusCode ?? 200, attempts: response?.$metadata?.attempts ?? 1 })); return { ok: true, response } }
  catch (error) { console.log(JSON.stringify({ operation, ...context, status: 'FAIL', ...details(error) })); return { ok: false, error } }
}
async function bodyToString(body) {
  if (!body) return ''
  if (typeof body.transformToString === 'function') return body.transformToString('utf-8')
  if (typeof body.text === 'function') return body.text()
  const chunks = []
  for await (const chunk of body) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

console.log(JSON.stringify({ endpoint, bucket, key }))
try {
  const put = await run('PutObject', new PutObjectCommand({ Bucket: bucket, Key: key, Body: 'CAE R2 smoke test\n', ContentType: 'text/plain; charset=utf-8', CacheControl: 'no-store' }))
  const head = await run('HeadObject', new HeadObjectCommand({ Bucket: bucket, Key: key }))
  const get = await run('GetObject', new GetObjectCommand({ Bucket: bucket, Key: key }))
  if (get.ok) await bodyToString(get.response.Body)
  const publicUrl = `https://pub-5f3e56a575084fb39da914d5daffdbea.r2.dev/${key}`
  try { const response = await fetch(publicUrl, { headers: { Range: 'bytes=0-1023' } }); console.log(JSON.stringify({ operation: 'PublicGetRange', key, status: [200, 206].includes(response.status) ? 'PASS' : 'FAIL', httpStatus: response.status, contentType: response.headers.get('content-type') })) } catch (error) { console.log(JSON.stringify({ operation: 'PublicGetRange', key, status: 'FAIL', message: error.message })) }
  if (!put.ok || !head.ok || !get.ok) process.exitCode = 1
} finally {
  const del = await run('DeleteObject', new DeleteObjectCommand({ Bucket: bucket, Key: key }))
  if (!del.ok) process.exitCode = 1
}
