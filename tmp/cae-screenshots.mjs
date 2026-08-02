import { chromium } from 'playwright'
import fs from 'node:fs/promises'

const out = 'outputs/cae-task4.1'
await fs.mkdir(out, { recursive: true })
const browser = await chromium.launch({ headless: true })

async function examShot(test, part, width, height, name) {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.goto(`http://127.0.0.1:5173/app/exam/reading/catalog-reading-cae-c1-test${test}`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.cae-rw-shell')
  await page.locator('.ket-rw-footer__part-tab').nth(part - 1).click()
  await page.waitForTimeout(100)
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: false })
  await page.close()
}

await examShot(1, 1, 1920, 1080, 'test1-part1-1920x1080')
await examShot(1, 2, 1920, 1080, 'test1-part2-1920x1080')
await examShot(1, 7, 1920, 1080, 'test1-part7-1920x1080')
await examShot(1, 8, 1920, 1080, 'test1-part8-footer-1920x1080')
await examShot(12, 7, 2048, 1152, 'test12-part7-2048x1152')
await examShot(23, 7, 2048, 1152, 'test23-part7-2048x1152')

const catalog = await browser.newPage({ viewport: { width: 2048, height: 1152 } })
await catalog.goto('http://127.0.0.1:5173/app/exam/track/cambridge/c1/reading', { waitUntil: 'domcontentloaded' })
await catalog.getByRole('heading', { name: 'Library Archives' }).waitFor()
await catalog.screenshot({ path: `${out}/cae-catalog-23-tests-2048x1152.png`, fullPage: false })
await catalog.close()
await browser.close()
console.log(out)
