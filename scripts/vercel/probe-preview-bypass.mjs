// Probe a Vercel Preview deployment through Deployment Protection using the
// automation bypass secret. Never logs the secret. Exits non-zero if blocked.
import { chromium } from 'playwright'

const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
const target = process.env.PREVIEW_URL ?? 'https://ryanenglishv2-llo42voz9-ryanenglish.vercel.app'
if (!secret) {
  console.error('VERCEL_AUTOMATION_BYPASS_SECRET is not set')
  process.exit(2)
}

const browser = await chromium.launch()
try {
  const context = await browser.newContext({
    extraHTTPHeaders: { 'x-vercel-protection-bypass': secret },
  })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', (e) => consoleErrors.push(String(e)))
  await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 })
  const url = page.url()
  const title = await page.title().catch(() => '')
  const body = (await page.locator('body').innerText().catch(() => '')).slice(0, 400)
  console.log('finalURL:', url)
  console.log('title:', JSON.stringify(title))
  console.log('bodyHead:', JSON.stringify(body))
  console.log('consoleErrors:', consoleErrors.length, consoleErrors.slice(0, 8))
  const blocked = /vercel\.com\/(login|sso|auth)|security checkpoint|failed to verify|verifying you are human/i.test(`${url}\n${title}\n${body}`)
  console.log('BLOCKED:', blocked)
  await browser.close()
  process.exit(blocked ? 1 : 0)
} catch (e) {
  console.error('PROBE ERROR:', String(e))
  await browser.close().catch(() => {})
  process.exit(3)
}
