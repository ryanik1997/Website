import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import os from 'os'

const TARGET_URL = 'https://ceq.inspera.com/player/?assessmentRunId=160272499&context=exam#/section/8673155978802/question/160270339/scorableItem/1/skipScroll'

const tempDir = path.join(os.tmpdir(), 'pw-inspera-v2-' + Date.now())
fs.mkdirSync(tempDir, { recursive: true })
fs.mkdirSync('tmp/inspera-screenshots', { recursive: true })
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

const allPartsData = {}

const extractCurrentPart = async (partNum) => {
  return await page.evaluate(() => {
    const data = {}
    
    // Get full body text
    data.fullBodyText = document.body ? document.body.innerText : ''
    
    // Get the main content container text (excluding header/footer)
    const contentContainer = document.querySelector('[class*="contentContainer"], [class*="sectionContent"]')
    data.contentText = contentContainer ? contentContainer.innerText : ''
    
    // Get instruction/rubric
    const rubric = document.querySelector('[class*="rubric"], [class*="instruction"]')
    data.rubric = rubric ? rubric.innerText : ''
    
    // Get all interactive elements with their context
    data.interactives = [...document.querySelectorAll(
      'input, [class*="inlineChoice"], [class*="textEntry"], [class*="gapMatch"], [role="option"], [class*="choiceInteraction"], button[class*="inlineChoice"]'
    )].map(el => ({
      tag: el.tagName,
      class: el.className?.toString().substring(0, 300) || '',
      text: el.innerText?.substring(0, 200) || '',
      type: el.type || el.getAttribute('role') || '',
      placeholder: el.placeholder || '',
      value: el.value || '',
    }))
    
    // Get passage paragraphs
    data.paragraphs = [...document.querySelectorAll('[class*="QTI"] p, [class*="questionBody"] p, [class*="passage"] p, [class*="text"] p')].map(el => ({
      class: el.className?.toString().substring(0, 200) || '',
      text: el.innerText || '',
    }))
    
    // Get question options (for MC questions)
    data.options = [...document.querySelectorAll('[class*="option"], [role="option"], [class*="choice"] li, [class*="choice"] label')].map(el => ({
      class: el.className?.toString().substring(0, 200) || '',
      text: el.innerText?.substring(0, 300) || '',
    }))
    
    // Get footer info
    const footer = document.querySelector('footer, [class*="footer"]')
    data.footerText = footer ? footer.innerText : ''
    
    // Get computed styles of key layout elements
    const header = document.querySelector('header, [class*="header"]')
    if (header) {
      const cs = getComputedStyle(header)
      data.headerStyles = { height: cs.height, background: cs.backgroundColor, borderBottom: cs.borderBottom }
    }
    if (footer) {
      const cs = getComputedStyle(footer)
      data.footerStyles = { height: cs.height, background: cs.backgroundColor, borderTop: cs.borderTop }
    }
    
    return data
  })
}

// Extract Part 1
console.log('\n=== PART 1 ===')
let partData = await extractCurrentPart(1)
allPartsData.part1 = partData
console.log('RUBRIC: ' + partData.rubric)
console.log('CONTENT (first 3000): ' + partData.contentText?.substring(0, 3000))
console.log('INTERACTIVES: ' + partData.interactives.length)
fs.writeFileSync('tmp/inspera-data/part1.json', JSON.stringify(partData, null, 2))

try { await page.screenshot({ path: 'tmp/inspera-screenshots/part1.png', timeout: 10000 }) } catch(e) { console.log('SS_ERROR: ' + e.message) }
console.log('SCREENSHOT: part1.png')

// Navigate through parts 2-8
for (let partNum = 2; partNum <= 8; partNum++) {
  console.log('\n=== PART ' + partNum + ' ===')
  
  // Click on the part tab in footer
  const clicked = await page.evaluate((pn) => {
    // Try multiple selectors for part tabs
    const allButtons = [...document.querySelectorAll('footer button, [class*="footer"] button, [role="tab"]')]
    const target = allButtons.find(t => t.innerText && t.innerText.trim().startsWith('Part ' + pn))
    if (target) { target.click(); return 'tab:' + target.innerText.substring(0, 50) }
    
    // Try div elements
    const allDivs = [...document.querySelectorAll('footer div, [class*="footer"] div')]
    const targetDiv = allDivs.find(t => t.innerText && t.innerText.trim().startsWith('Part ' + pn) && t.onclick)
    if (targetDiv) { targetDiv.click(); return 'div:' + targetDiv.innerText.substring(0, 50) }
    
    return 'NOT_FOUND'
  }, partNum)
  
  console.log('CLICK_RESULT: ' + clicked)
  await page.waitForTimeout(4000)
  
  partData = await extractCurrentPart(partNum)
  allPartsData['part' + partNum] = partData
  console.log('RUBRIC: ' + partData.rubric)
  console.log('CONTENT (first 3000): ' + partData.contentText?.substring(0, 3000))
  console.log('INTERACTIVES: ' + partData.interactives.length)
  console.log('OPTIONS: ' + partData.options.length)
  fs.writeFileSync(`tmp/inspera-data/part${partNum}.json`, JSON.stringify(partData, null, 2))
  
  try { await page.screenshot({ path: `tmp/inspera-screenshots/part${partNum}.png`, timeout: 10000 }) } catch(e) { console.log('SS_ERROR: ' + e.message) }
  console.log('SCREENSHOT: part' + partNum + '.png')
}

// Save combined data
fs.writeFileSync('tmp/inspera-data/all-parts.json', JSON.stringify({
  url: page.url(),
  title: await page.title(),
  timestamp: new Date().toISOString(),
  parts: allPartsData,
}, null, 2))

console.log('\nALL_DATA_SAVED to tmp/inspera-data/')
await context.close()
console.log('DONE')