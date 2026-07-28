// Convert crawled TID writing tasks into the web app's writing prompt bank.
// Output: apps/web/public/catalog/writing/tid/tasks.json + images/
// Usage: node scripts/import-tid-writing.mjs [crawlDir]
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const CRAWL_DIR = process.argv[2] ?? 'D:/App-English-Ryan/Crawl/Claude_Plan_Crawl/TID_Writing'
const ROOT = path.resolve(import.meta.dirname, '..')
const OUT_DIR = path.join(ROOT, 'apps', 'web', 'public', 'catalog', 'writing', 'tid')
const IMG_DIR = path.join(OUT_DIR, 'images')

const tasks = JSON.parse(readFileSync(path.join(CRAWL_DIR, 'writing_tasks.json'), 'utf8'))
const imageMap = JSON.parse(readFileSync(path.join(CRAWL_DIR, 'image_map.json'), 'utf8'))
const localImages = new Set(readdirSync(path.join(CRAWL_DIR, 'images')))

mkdirSync(IMG_DIR, { recursive: true })

// uuid trong description -> tên file webp đã tải
const uuidToFile = Object.fromEntries(
  Object.entries(imageMap).map(([uuid, p]) => [uuid, path.basename(String(p))]),
)

const copied = new Set()
function copyImage(file) {
  if (!file || !localImages.has(file)) return null
  if (!copied.has(file)) {
    copyFileSync(path.join(CRAWL_DIR, 'images', file), path.join(IMG_DIR, file))
    copied.add(file)
  }
  return `/catalog/writing/tid/images/${file}`
}

// Rewrite ảnh youpass trong HTML sang đường dẫn local; bỏ <img> không có file.
function rewriteHtml(html) {
  if (!html) return null
  let out = html.replace(/<img\b[^>]*src="\/data\/youpass\/images\/([0-9a-f-]+)"[^>]*\/?>/gi, (m, uuid) => {
    const local = copyImage(uuidToFile[uuid])
    return local ? m.replace(`/data/youpass/images/${uuid}`, local) : ''
  })
  return out.replace(/\/data\/youpass\/images\/[0-9a-f-]+/gi, '')
}

function stripHtml(html) {
  return (html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&rsquo;|&#8217;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim()
}

// Map đề sang WritingGenre của app (khớp inferIeltsGenre trong ieltsCatalog.ts)
// Ưu tiên title (thường ghi rõ "Pie Chart:", "Map:"), rồi mới tới nội dung đề.
function genreFor(taskType, title, text) {
  const sources = [title.toLowerCase(), text.toLowerCase()]
  if (taskType === 'task1') {
    for (const p of sources) {
      if (/\b(line graph|line chart)\b/.test(p)) return 'line_graph'
      if (/\b(bar chart|bar graph|column chart)\b/.test(p)) return 'bar_chart'
      if (/\b(pie charts?)\b/.test(p)) return 'pie_chart'
      if (/\btables?\b/.test(p)) return 'table'
      if (/\b(process|diagram|cycle|stages?|flow)\b/.test(p)) return 'process'
      if (/\b(maps?|plans?|layout)\b/.test(p)) return 'map'
      if (/\bmixed\b/.test(p)) return 'mixed'
    }
    for (const p of sources) {
      if (/\b(charts?|graphs?)\b/.test(p)) return 'mixed'
    }
    return 'other'
  }
  const p = `${sources[0]} ${sources[1]}`
  if (/\b(discuss both|both views|both these views)\b/.test(p)) return 'discussion'
  if (/\b(advantages?|disadvantages?|outweigh|drawbacks?)\b/.test(p)) return 'advantages_disadvantages'
  if (/\b(what problems|what.*(causes|reasons)|solutions?|measures)\b/.test(p)) return 'problem_solution'
  if (/\b(agree or disagree|to what extent)\b/.test(p)) return 'opinion'
  if ((p.match(/\?/g) ?? []).length >= 2) return 'two_part'
  if (/\b(positive or negative|opinion|believe)\b/.test(p)) return 'opinion'
  return 'other'
}

const visible = tasks.filter(
  t => t.is_visible && (t.task_type === 'task1' || t.task_type === 'task2'),
)

const out = []
for (const t of visible) {
  const prompt = stripHtml(t.description)
  if (!prompt) continue
  // Ưu tiên ảnh nhúng trong đề (chart gốc), fallback thumbnail
  const embedded = [...String(t.description ?? '').matchAll(/\/data\/youpass\/images\/([0-9a-f-]+)/gi)]
    .map(m => uuidToFile[m[1]])
    .find(f => f && localImages.has(f))
  const image = copyImage(embedded) ?? copyImage(`${t.task_type}_${t.youpass_id}.webp`)
  out.push({
    id: `tid-${t.youpass_id.replace(/_/g, '-')}`,
    taskType: t.task_type,
    genre: genreFor(t.task_type, t.title ?? '', prompt),
    title: t.title.trim(),
    prompt,
    image,
    guideHtml: rewriteHtml(t.guide_html),
    createdAt: t.created_at ?? null,
  })
}

out.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
writeFileSync(path.join(OUT_DIR, 'tasks.json'), JSON.stringify(out))

const byGenre = out.reduce((m, t) => ((m[t.genre] = (m[t.genre] ?? 0) + 1), m), {})
console.log(`tasks: ${out.length} | images: ${copied.size} | no image: ${out.filter(t => !t.image).length}`)
console.log(byGenre)
