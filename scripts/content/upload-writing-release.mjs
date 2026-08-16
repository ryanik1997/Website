import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const env = Object.fromEntries(fs.readFileSync(path.join(ROOT, '.env.r2.local'), 'utf8').split(/\r?\n/).flatMap(l => { const m=l.match(/^([A-Z0-9_]+)=(.*)$/); return m ? [[m[1],m[2].trim()]] : [] }))
for (const k of ['R2_ACCOUNT_ID','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY','R2_BUCKET_NAME','R2_PUBLIC_BASE_URL']) if (!env[k]) throw new Error(`Missing ${k}`)
const idx = process.argv.indexOf('--id'); const id = idx >= 0 ? process.argv[idx + 1] : 'exam-content-writing-r1-20260810'
const root = path.join(ROOT, 'tmp/r2-writing-release'); const rel = path.join(root, 'releases', id)
if (!fs.existsSync(rel)) throw new Error(`Release not built: ${rel}`)
const releaseManifest = path.join(root, 'manifests', 'releases', `${id}.json`)
if (!fs.existsSync(releaseManifest)) throw new Error(`Release manifest not built: ${releaseManifest}`)
const client = new S3Client({ region:'auto', endpoint:`https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials:{accessKeyId:env.R2_ACCESS_KEY_ID,secretAccessKey:env.R2_SECRET_ACCESS_KEY}, requestChecksumCalculation:'WHEN_REQUIRED', maxAttempts:4 })
const files=[]; const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else files.push(p)}}; walk(rel)
files.push(releaseManifest)
const type={'.json':'application/json','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'}
const md5=p=>crypto.createHash('md5').update(fs.readFileSync(p)).digest('base64')
async function parallel(items, limit, fn) { let next=0; await Promise.all(Array.from({length:limit}, async()=>{while(next<items.length){const i=next++;await fn(items[i])}})) }
await parallel(files, 12, async p => { const key=path.relative(root,p).replace(/\\/g,'/'); await client.send(new PutObjectCommand({Bucket:env.R2_BUCKET_NAME,Key:key,Body:fs.readFileSync(p),ContentType:type[path.extname(p).toLowerCase()]||'application/octet-stream',CacheControl:'public, max-age=31536000, immutable',ContentMD5:md5(p)})) })
let missing=0; await parallel(files, 12, async p => {const key=path.relative(root,p).replace(/\\/g,'/');try{const h=await client.send(new HeadObjectCommand({Bucket:env.R2_BUCKET_NAME,Key:key}));if(Number(h.ContentLength)!==fs.statSync(p).size)missing++}catch{missing++}})
console.log(`Uploaded: ${files.length}; HEAD verified: ${files.length-missing}; missing/mismatch: ${missing}`); if(missing)process.exit(1)
