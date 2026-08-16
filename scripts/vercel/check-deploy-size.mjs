import fs from 'node:fs'
import path from 'node:path'
const root = process.argv[2]
if (!root) throw new Error('Usage: node scripts/vercel/check-deploy-size.mjs <clean-context>')
const forbidden = ['apps/web/dist', 'dist', 'tmp', 'apps/web/public/catalog', 'apps/web/public/data', 'apps/web/public/books', 'apps/web/public/ielts-wizard', '.env.r2.local']
for (const rel of forbidden) if (fs.existsSync(path.join(root, rel))) throw new Error(`Forbidden deploy input exists: ${rel}`)
const inv = JSON.parse(fs.readFileSync(path.join(root, 'deploy-context-inventory.json'), 'utf8'))
if (inv.bytes > 2_000_000_000) throw new Error(`Clean context too large: ${inv.bytes} bytes`)
console.log(`DEPLOY_FILES=${inv.files}`)
console.log(`DEPLOY_BYTES=${inv.bytes}`)
