import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import os from 'os'

const TARGET_URL = 'https://ceq.inspera.com/player/?assessmentRunId=160272499&context=exam#/section/8673155978802/question/160270339/scorableItem/1/skipScroll'

const tempDir = path.join(os.tmpdir(), 'pw-inspera-p4-' + Date.now())
fs.mkdirSync(tempDir, { recursive: true })
fs.mkdirSync('tmp/inspera-data', { recursive: true })

console.log('USING_TEMP_PROFILE: ' + tempDir)

const context = await chromium.launchPersistentContext(tempDir, {
  headless: false,
  channel: 'chrome',
  args: ['--disable-blink-features=AutomationControlled', '--no-first-run', '--no-default-browser-check'],
  viewport: { width: 1440, height: 900 },
})

const page = await context.newPage()

console.log('NAVIGATING_TO: ' + TARGET_URL)
await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => {
  console.log('NAV_ERROR: ' + e.message)
})
await page.waitForTimeout(8000)

// Go to Part 4
const clickPart = async (partNum) => {
  return await page.evaluate((pn) => {
    const buttons = [...document.querySelectorAll('footer button, [class*="footer"] button, [role="tab"]')]
    const target = buttons.find(t => t.innerText && t.innerText.trim().startsWith('Part ' + pn))
    if (target) { target.click(); return true }
    return false
  }, partNum)
}

console.log('GOING_TO_PART_4')
await clickPart(4)
await page.waitForTimeout(3000)

// Extract Q25 first
const extractQ = async () => {
  return await page.evaluate(() => {
    const contentContainer = document.querySelector('[class*="contentContainer"], [class*="sectionContent"]')
    return contentContainer ? contentContainer.innerText : ''
  })
}

const questions = {}

// Q25
console.log('\n--- Q25 ---')
questions.q25 = await extractQ()
console.log('Q25: ' + questions.q25.substring(0, 500))

// Use Next button to go to Q26-Q30
for (let q = 26; q <= 30; q++) {
  console.log('\n--- Q' + q + ' ---')
  
  // Click the Next arrow button in footer
  const nextClicked = await page.evaluate(() => {
    // Find the next button (arrow-right)
    const nextBtn = document.querySelector('[class*="footer"] [class*="next"], [class*="footer"] button[class*="promotedNext"], footer button:last-of-type')
    if (nextBtn) {
      nextBtn.click()
      return 'NEXT_BTN:' + nextBtn.className?.substring(0, 100)
    }
    
    // Try finding by aria-label or icon
    const allBtns = [...document.querySelectorAll('footer button, [class*="footer"] button')]
    const next = allBtns.find(b => b.getAttribute('aria-label')?.includes('next') || b.querySelector('[class*="arrow-right"], .fa-arrow-right'))
    if (next) {
      next.click()
      return 'ARIA_NEXT:' + next.className?.substring(0, 100)
    }
    
    return 'NOT_FOUND'
  })
  
  console.log('NEXT_CLICK: ' + nextClicked)
  await page.waitForTimeout(2000)
  
  questions['q' + q] = await extractQ()
  console.log('Q' + q + ': ' + questions['q' + q].substring(0, 500))
}

fs.writeFileSync('tmp/inspera-data/part4-all-questions.json', JSON.stringify(questions, null, 2))
console.log('\nSAVED: tmp/inspera-data/part4-all-questions.json')

await context.close()
console.log('DONE')