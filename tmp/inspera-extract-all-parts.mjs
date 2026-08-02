import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import os from 'os'

const TARGET_URL = 'https://ceq.inspera.com/player/?assessmentRunId=160272499&context=exam#/section/8673155978802/question/160270339/scorableItem/1/skipScroll'

const tempDir = path.join(os.tmpdir(), 'pw-inspera-extract-' + Date.now())
fs.mkdirSync(tempDir, { recursive: true })
fs.mkdirSync('tmp/inspera-screenshots', { recursive: true })

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
await page.waitForTimeout(6000)

// Extract full page structure
const extractPageData = async (partLabel) => {
  return await page.evaluate(() => {
    const data = {}
    
    // Header
    const header = document.querySelector('header, [class*="header"]')
    data.header = header ? header.innerText.substring(0, 500) : null
    
    // Instruction bar
    const instruction = document.querySelector('[class*="rubric"], [class*="instruction"], [class*="QuestionDisplay"]')
    data.instruction = instruction ? instruction.innerText.substring(0, 1000) : null
    
    // Main content - get all text from the question display area
    const questionDisplay = document.querySelector('[class*="QuestionDisplay"], [class*="question-wrapper"], [role="main"]')
    data.questionContent = questionDisplay ? questionDisplay.innerText : document.body.innerText
    
    // Footer
    const footer = document.querySelector('footer, [class*="footer"]')
    data.footer = footer ? footer.innerText.substring(0, 2000) : null
    
    // Get all input/interactive elements
    data.inputs = [...document.querySelectorAll('input, button[class*="gap"], [class*="inlineChoice"], [class*="textEntry"], [role="option"], [class*="choice"], [class*="gapMatch"]')].map(el => ({
      tag: el.tagName,
      type: el.type || el.getAttribute('role') || '',
      class: el.className?.toString().substring(0, 200) || '',
      text: el.innerText?.substring(0, 100) || '',
      ariaLabel: el.getAttribute('aria-label') || '',
    }))
    
    // Get computed styles of key elements
    const mainContent = document.querySelector('[class*="contentContainer"], [class*="mainScreen"], main, [role="main"]')
    if (mainContent) {
      const cs = getComputedStyle(mainContent)
      data.mainContentStyles = {
        width: cs.width,
        height: cs.height,
        background: cs.backgroundColor,
        overflow: cs.overflow,
        overflowY: cs.overflowY,
      }
    }
    
    // Get all passage text blocks
    data.passageBlocks = [...document.querySelectorAll('p, div[class*="paragraph"], div[class*="passage"], [class*="QTI"]')].map(el => ({
      tag: el.tagName,
      class: el.className?.toString().substring(0, 150) || '',
      text: el.innerText?.substring(0, 500) || '',
    })).filter(b => b.text.length > 20)
    
    return data
  })
}

// Extract Part 1
console.log('\n=== PART 1 ===')
const part1Data = await extractPageData('Part 1')
console.log('HEADER: ' + part1Data.header)
console.log('INSTRUCTION: ' + part1Data.instruction)
console.log('QUESTION_CONTENT (first 2000): ' + part1Data.questionContent?.substring(0, 2000))
console.log('FOOTER: ' + part1Data.footer)
console.log('INPUTS_COUNT: ' + part1Data.inputs.length)
console.log('INPUTS: ' + JSON.stringify(part1Data.inputs.slice(0, 20), null, 2))
await page.screenshot({ path: 'tmp/inspera-screenshots/part1.png', fullPage: false })
console.log('SCREENSHOT: part1.png')

// Navigate through all parts by clicking footer part tabs
const partTabs = await page.evaluate(() => {
  return [...document.querySelectorAll('[class*="footer"] [class*="part"], [class*="footer"] button, [class*="footer"] [role="tab"]')].map(el => ({
    text: el.innerText?.substring(0, 100) || '',
    class: el.className?.toString().substring(0, 200) || '',
    tag: el.tagName,
  }))
})
console.log('\nFOOTER_TABS: ' + JSON.stringify(partTabs, null, 2))

// Try clicking each part tab
for (let partNum = 2; partNum <= 8; partNum++) {
  console.log('\n=== TRYING PART ' + partNum + ' ===')
  
  // Click on the part tab in footer
  const clicked = await page.evaluate((pn) => {
    const tabs = [...document.querySelectorAll('[class*="footer"] button, [class*="footer"] [role="tab"], [class*="footer"] div')]
    const target = tabs.find(t => t.innerText && t.innerText.includes('Part ' + pn))
    if (target) {
      target.click()
      return true
    }
    return false
  }, partNum)
  
  console.log('CLICKED_PART_' + partNum + ': ' + clicked)
  await page.waitForTimeout(3000)
  
  const partData = await extractPageData('Part ' + partNum)
  console.log('INSTRUCTION: ' + partData.instruction)
  console.log('QUESTION_CONTENT (first 3000): ' + partData.questionContent?.substring(0, 3000))
  console.log('INPUTS_COUNT: ' + partData.inputs.length)
  await page.screenshot({ path: `tmp/inspera-screenshots/part${partNum}.png`, fullPage: false })
  console.log('SCREENSHOT: part' + partNum + '.png')
}

// Save all extracted data
fs.writeFileSync('tmp/inspera-extracted-data.json', JSON.stringify({
  url: page.url(),
  title: await page.title(),
  timestamp: new Date().toISOString(),
}, null, 2))

await context.close()
console.log('\nDONE')