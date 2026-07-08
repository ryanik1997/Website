import { chromium } from 'playwright'

const url = process.env.URL ?? 'http://localhost:5173/app/exam/track/ielts'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', err => errors.push(`pageerror: ${err.message}`))
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
})
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(2000)
const text = await page.locator('body').innerText()
console.log('URL:', url)
console.log('Body length:', text.length)
console.log('Body preview:', text.slice(0, 400).replace(/\s+/g, ' '))
if (errors.length) {
  console.log('ERRORS:')
  for (const e of errors) console.log(' -', e)
  process.exit(1)
}
console.log('OK — no console/page errors')
await browser.close()