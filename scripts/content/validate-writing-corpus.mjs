import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const tasksPath = path.join(ROOT, 'apps/web/public/catalog/writing/tid/tasks.json')
const imageRoot = path.join(ROOT, 'apps/web/public/catalog/writing/tid/images')
const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8'))
const errors = []
const ids = new Set()
let task1 = 0, task2 = 0, imageRefs = 0, resolved = 0
for (const [i, t] of tasks.entries()) {
  if (!t.id || ids.has(t.id)) errors.push(`invalid/duplicate id at ${i}: ${t.id ?? '<empty>'}`)
  ids.add(t.id)
  if (!['task1', 'task2'].includes(t.taskType)) errors.push(`invalid taskType: ${t.id}`)
  if (!t.title || !t.prompt) errors.push(`missing title/prompt: ${t.id}`)
  if (t.taskType === 'task1') task1++
  if (t.taskType === 'task2') task2++
  if (t.image) {
    imageRefs++
    const rel = t.image.replace(/^\/catalog\/writing\/tid\/images\//, '')
    if (path.isAbsolute(rel) || rel.includes('\\')) errors.push(`unsafe image path: ${t.id}`)
    else if (!fs.existsSync(path.join(imageRoot, rel))) errors.push(`missing image: ${t.id} -> ${rel}`)
    else if (fs.statSync(path.join(imageRoot, rel)).size === 0) errors.push(`zero-byte image: ${rel}`)
    else resolved++
  }
  const raw = JSON.stringify(t).toLowerCase()
  if (/todo|tbd|lorem ipsum/.test(raw)) errors.push(`placeholder text: ${t.id}`)
  if (Object.keys(t).some(k => /api[_-]?key|service[_-]?role|password|secret/i.test(k))) errors.push(`secret-like field: ${t.id}`)
}
if (tasks.length < 356) errors.push(`task count ${tasks.length} below baseline 356`)
console.log(`Writing tasks: ${tasks.length}`)
console.log(`Task 1: ${task1}`)
console.log(`Task 2: ${task2}`)
console.log(`Free: ${tasks.filter(t => t.taskType === 'free').length}`)
console.log(`Image references: ${imageRefs}`)
console.log(`Images resolved: ${resolved}`)
console.log(`Missing required images: ${imageRefs - resolved}`)
console.log(`Duplicate IDs: ${tasks.length - ids.size}`)
console.log(`Invalid tasks: ${errors.length}`)
if (errors.length) { for (const e of errors) console.error(`- ${e}`); process.exit(1) }
