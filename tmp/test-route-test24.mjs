import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import os from 'os'

const TARGET_URL = 'http://localhost:5173/app/exam/track/cambridge/c1/reading'

const tempDir = path.join(os.tmpdir(), 'pw-test24-' + Date.now())
fs.mkdirSync(tempDir, { recursive: true })
fs.mkdirSync('tmp/test24-screenshots', { recursive: true })

console.log('USING_TEMP_PROFILE: ' + tempDir)

const context = await chromium.launchPersistentContext(tempDir, {
  headless: false,
  channel: 'chrome',
  args: ['--disable-blink-features=AutomationControlled', '--no-first-run', '--no-default-browser-check'],
  viewport: { width: 1440, height: 900 },
})

const page = await context.newPage()

// Collect console errors
const consoleErrors = []
page.on('console', msg => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text())
  }
})

// Collect network errors
const networkErrors = []
page.on('response', response => {
  if (response.status() >= 400) {
    networkErrors.push(`${response.status()} ${response.url()}`)
  }
})

console.log('NAVIGATING_TO: ' + TARGET_URL)
await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => {
  console.log('NAV_ERROR: ' + e.message)
})
await page.waitForTimeout(5000)

const url = page.url()
const title = await page.title()
console.log('FINAL_URL: ' + url)
console.log('PAGE_TITLE: ' + title)

// Check if we need login
const bodyText = await page.evaluate(() => document.body ? document.body.innerText.substring(0, 2000) : 'NO_BODY')
console.log('BODY_TEXT (first 1000): ' + bodyText.substring(0, 1000))

// Look for Test 24 link/card
const hasTest24 = await page.evaluate(() => {
  const allElements = [...document.querySelectorAll('a, button, div, span')]
  return allElements.some(el => el.innerText && el.innerText.includes('Test 24'))
})
console.log('HAS_TEST24_LINK: ' + hasTest24)

// Try to find and click Test 24
if (hasTest24) {
  const clicked = await page.evaluate(() => {
    const allElements = [...document.querySelectorAll('a, button, div, span')]
    const target = allElements.find(el => el.innerText && el.innerText.includes('Test 24') && el.tagName === 'A')
    if (target) {
      target.click()
      return 'LINK: ' + target.href
    }
    // Try any element
    const target2 = allElements.find(el => el.innerText && el.innerText.includes('Test 24'))
    if (target2) {
      target2.click()
      return 'ELEMENT: ' + target2.tagName
    }
    return 'NOT_CLICKED'
  })
  console.log('CLICKED_TEST24: ' + clicked)
  await page.waitForTimeout(5000)
  
  const testUrl = page.url()
  console.log('AFTER_CLICK_URL: ' + testUrl)
  
  // Check if we're on the exam page
  const examText = await page.evaluate(() => document.body ? document.body.innerText.substring(0, 3000) : 'NO_BODY')
  console.log('EXAM_TEXT (first 2000): ' + examText.substring(0, 2000))
  
  // Check for Part tabs
  const partTabs = await page.evaluate(() => {
    return [...document.querySelectorAll('[class*="footer"] button, [class*="part"], [role="tab"]')].map(el => ({
      text: el.innerText?.substring(0, 50) || '',
      class: el.className?.toString().substring(0, 100) || '',
    })).filter(t => t.text.includes('Part'))
  })
  console.log('PART_TABS: ' + JSON.stringify(partTabs))
  
  // Take screenshot
  try { await page.screenshot({ path: 'tmp/test24-screenshots/test24-page.png', timeout: 10000 }) } catch(e) { console.log('SS_ERROR: ' + e.message) }
  console.log('SCREENSHOT: test24-page.png')
} else {
  console.log('TEST24_NOT_FOUND - checking page content')
  try { await page.screenshot({ path: 'tmp/test24-screenshots/track-page.png', timeout: 10000 }) } catch(e) { console.log('SS_ERROR: ' + e.message) }
}

console.log('\nCONSOLE_ERRORS: ' + consoleErrors.length)
consoleErrors.forEach(e => console.log('  ERROR: ' + e))

console.log('\nNETWORK_ERRORS: ' + networkErrors.length)
networkErrors.forEach(e => console.log('  ERROR: ' + e))

await context.close()
console.log('\nDONE')