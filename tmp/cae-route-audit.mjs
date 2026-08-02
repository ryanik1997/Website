import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
const rows = []
for (let n = 1; n <= 23; n += 1) {
  const errors = []
  const onConsole = msg => { if (msg.type() === 'error') errors.push(msg.text()) }
  const onPageError = err => errors.push(err.message)
  page.on('console', onConsole)
  page.on('pageerror', onPageError)
  const url = `http://127.0.0.1:5173/app/exam/reading/catalog-reading-cae-c1-test${n}`
  let http = null
  let row
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    http = response?.status() ?? null
    await page.waitForSelector('.cae-rw-shell[data-exam-id]', { timeout: 30_000 })
    const loaded = await page.locator('.cae-rw-shell').getAttribute('data-exam-id')
    const title = await page.locator('.cae-rw-shell').getAttribute('data-exam-title')
    const tabs = page.locator('.ket-rw-footer__part-tab')
    const parts = await tabs.count()
    const counts = []
    for (let i = 0; i < parts; i += 1) {
      await tabs.nth(i).click()
      await page.waitForTimeout(20)
      counts.push(await page.locator('.ket-rw-footer__pill').count())
    }
    await tabs.nth(6).click()
    await page.waitForTimeout(30)
    const part7Cards = await page.locator('[data-cae-part7-option]').count()
    const fullTextCards = await page.locator('[data-cae-part7-option]').evaluateAll(nodes => nodes.filter(node => (node.querySelector('.pet-rw-drag__bank-text')?.textContent ?? '').trim().length > 3).length)
    row = { test: n, http, loaded, title, parts, questions: counts.reduce((a, b) => a + b, 0), ranges: counts, part7Cards, fullTextCards, consoleErrors: errors.length }
  } catch (error) {
    row = { test: n, http, error: error.message, consoleErrors: errors.length }
  }
  rows.push(row)
  page.off('console', onConsole)
  page.off('pageerror', onPageError)
}
console.log(JSON.stringify(rows, null, 2))
await browser.close()
