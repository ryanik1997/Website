const { chromium } = require('playwright')
const fs = require('fs')

const base = 'http://127.0.0.1:5173'
const practicePath = '/app/sentence-structure/catalog:ss:used-to'
const screenshots = [
  { name: 'task14-focus-1920x1080.png', width: 1920, height: 1080 },
  { name: 'task14-focus-1366x768.png', width: 1366, height: 768 },
  { name: 'task14-focus-390x844.png', width: 390, height: 844 },
]

async function main() {
  fs.mkdirSync('D:/App-English-Ryan/Website/outputs', { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } })
  const page = await context.newPage()
  const consoleErrors = []
  const reactWarnings = []
  page.on('console', message => {
    const text = message.text()
    if (message.type() === 'error') consoleErrors.push(text)
    if (/Warning:|React.*warning/i.test(text)) reactWarnings.push(text)
  })
  page.on('pageerror', error => consoleErrors.push(error.message))

  const checks = []
  const check = (condition, label) => {
    if (!condition) throw new Error(`FAIL: ${label}`)
    checks.push(label)
  }

  await page.goto(`${base}/app/sentence-structure?cefr=A2&status=learning`, { waitUntil: 'networkidle' })
  check(await page.locator('.desktop-sidebar').count() === 1, 'List route keeps desktop sidebar')
  check(await page.locator('.mobile-sidebar-toggle').count() === 1, 'List route keeps mobile menu control')

  await page.goto(`${base}/app/sentence-structure?cefr=A2`, { waitUntil: 'networkidle' })
  const usedToRow = page.locator('.ss-hub-row').filter({ has: page.getByRole('heading', { name: 'used to ...', exact: true }) })
  await usedToRow.waitFor({ state: 'visible' })
  await usedToRow.locator('.ss-hub-row-main').click()
  await page.waitForURL(url => decodeURIComponent(url.pathname) === practicePath)
  await page.locator('.ss-focus-header').waitFor({ state: 'visible' })

  check(await page.locator('.desktop-sidebar').count() === 0, 'Practice hides desktop sidebar')
  check(await page.locator('.mobile-sidebar-toggle').count() === 0, 'Practice hides mobile menu control')
  check(await page.locator('.sidebar-drawer').count() === 0, 'Practice hides mobile drawer')
  check(await page.locator('.app-corner-sun').count() === 0, 'Practice hides corner mascot')
  check(await page.locator('[aria-label="Mở từ điển"]').count() === 0, 'Practice hides dictionary widget')
  check(await page.locator('.ss-focus-header').count() === 1, 'Focus Header is present')
  check((await page.locator('.ss-focus-title').innerText()).toLowerCase().includes('used to'), 'Focus Header shows structure title')
  check(await page.locator('.ss-focus-progress').innerText() === '1 / 1', 'Focus Header shows route progress')

  const box = await page.locator('.ss-focus-shell').boundingBox()
  check(Boolean(box && box.x === 0 && Math.abs(box.width - 1366) < 1), 'Focus shell starts at left edge and fills viewport width')
  check(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth), 'No horizontal overflow at 1366px')

  const inputs = page.locator('.ss-input-row input')
  await inputs.nth(0).fill('I used to read before bed')
  await inputs.nth(1).fill('I no longer do it')
  check(await inputs.nth(0).inputValue() === 'I used to read before bed', 'Input A works')
  check(await inputs.nth(1).inputValue() === 'I no longer do it', 'Input B works')
  await page.getByRole('button', { name: 'Kiểm tra mẫu' }).click()
  check(await page.locator('.ss-result[role="status"]').count() === 1, 'Sample feedback renders in aria-live status')
  await page.getByRole('button', { name: 'Lật thẻ' }).click()
  check(await page.getByRole('button', { name: 'Quay lại luyện tập' }).isVisible(), 'Flip behavior works')
  await page.getByRole('button', { name: 'Quay lại luyện tập' }).click()
  check(await inputs.nth(0).inputValue() === 'I used to read before bed', 'Inputs survive flip cycle')
  check(await page.getByRole('button', { name: 'AI chấm điểm' }).isEnabled(), 'AI grading control remains enabled with inputs')

  await page.getByRole('button', { name: 'Quay lại danh sách cấu trúc' }).click()
  await page.waitForURL(`${base}/app/sentence-structure?cefr=A2`)
  await page.locator('.desktop-sidebar').waitFor({ state: 'visible' })
  check(new URL(page.url()).search === '?cefr=A2', 'Focus back preserves list query via browser history')
  check(await page.locator('.desktop-sidebar').count() === 1, 'Sidebar returns after leaving practice')

  await page.goForward()
  await page.waitForURL(url => decodeURIComponent(url.pathname) === practicePath)
  check(await page.locator('.ss-focus-header').isVisible(), 'Browser Forward restores Focus Mode')
  await page.goBack()
  await page.waitForURL(`${base}/app/sentence-structure?cefr=A2`)
  check(new URL(page.url()).search === '?cefr=A2', 'Browser Back returns to filtered list')

  for (const viewport of screenshots) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto(`${base}${practicePath}`, { waitUntil: 'networkidle' })
    await page.locator('.ss-focus-header').waitFor({ state: 'visible' })
    check(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth), `No horizontal overflow at ${viewport.width}x${viewport.height}`)
    check(await page.locator('.desktop-sidebar').count() === 0, `Sidebar hidden at ${viewport.width}x${viewport.height}`)
    await page.screenshot({ path: `D:/App-English-Ryan/Website/outputs/${viewport.name}`, fullPage: false })
  }

  await browser.close()
  console.log(JSON.stringify({ checks, consoleErrors, reactWarnings }, null, 2))
  if (consoleErrors.length || reactWarnings.length) process.exitCode = 1
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
