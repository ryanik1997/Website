import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const sourcePath = process.argv[2]
if (!sourcePath) throw new Error('Usage: node scripts/extract-tid-sun.mjs <about-tid.html>')

const html = await readFile(sourcePath, 'utf8')
const sunStart = html.indexOf('<div class="sun">')
if (sunStart < 0) throw new Error('TID sun container not found')

const fragment = html.slice(sunStart)
const svgMatches = [...fragment.matchAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/g)].slice(0, 2)
if (svgMatches.length !== 2) throw new Error('Expected the TID body and face SVGs')

const clean = svg => svg
  .replace(/\sclass="[^"]*"/g, '')
  .replace(/\sdata-sunny-face=""/g, '')
  .replaceAll('var(--color-light)', '#F3E8CC')
  .replaceAll('currentColor', '#121212')

const hideOriginalEyes = svg => {
  let eyeIndex = 0
  return svg.replace(/<path\b[\s\S]*?<\/path>/g, pathMarkup => {
    eyeIndex += 1
    return eyeIndex <= 2 ? pathMarkup.replace('<path', '<path opacity="0"') : pathMarkup
  })
}

const outputDir = path.resolve('apps/web/public/mascots/tid')
await mkdir(outputDir, { recursive: true })
await writeFile(path.join(outputDir, 'sun-body.svg'), clean(svgMatches[0][0]))
await writeFile(path.join(outputDir, 'sun-face.svg'), hideOriginalEyes(clean(svgMatches[1][0])))
console.log('Extracted TID sun body and face SVGs')
