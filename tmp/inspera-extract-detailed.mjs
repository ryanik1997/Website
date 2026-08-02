import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import os from 'os'

const TARGET_URL = 'https://ceq.inspera.com/player/?assessmentRunId=160272499&context=exam#/section/8673155978802/question/160270339/scorableItem/1/skipScroll'

const tempDir = path.join(os.tmpdir(), 'pw-inspera-det-' + Date.now())
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

// Helper: click question number in footer
const clickQuestion = async (qNum) => {
  const clicked = await page.evaluate((n) => {
    const buttons = [...document.querySelectorAll('footer button, [class*="footer"] button, [role="tab"]')]
    const target = buttons.find(t => t.innerText && t.innerText.trim() === String(n))
    if (target) { target.click(); return true }
    return false
  }, qNum)
  return clicked
}

// Helper: click part tab
const clickPart = async (partNum) => {
  const clicked = await page.evaluate((pn) => {
    const buttons = [...document.querySelectorAll('footer button, [class*="footer"] button, [role="tab"]')]
    const target = buttons.find(t => t.innerText && t.innerText.trim().startsWith('Part ' + pn))
    if (target) { target.click(); return true }
    return false
  }, partNum)
  return clicked
}

// Helper: extract current question content
const extractContent = async () => {
  return await page.evaluate(() => {
    const data = {}
    const contentContainer = document.querySelector('[class*="contentContainer"], [class*="sectionContent"]')
    data.contentText = contentContainer ? contentContainer.innerText : ''
    
    // Get all text blocks with their structure
    data.blocks = [...document.querySelectorAll('[class*="QTI"] > *, [class*="questionBody"] > *, [class*="contentContainer"] > *')].map(el => ({
      tag: el.tagName,
      class: el.className?.toString().substring(0, 200) || '',
      text: el.innerText?.substring(0, 1000) || '',
    }))
    
    // Get all inputs
    data.inputs = [...document.querySelectorAll('input[type="text"], textarea')].map(el => ({
      class: el.className?.toString().substring(0, 200) || '',
      placeholder: el.placeholder || '',
      value: el.value || '',
      ariaLabel: el.getAttribute('aria-label') || '',
    }))
    
    // Get gap match tokens (Part 7)
    data.gapMatchTokens = [...document.querySelectorAll('[class*="gapMatch"] [class*="token"], [class*="gapMatch"] [class*="draggable"], [class*="gapMatch"] [draggable]')].map(el => ({
      class: el.className?.toString().substring(0, 200) || '',
      text: el.innerText?.substring(0, 500) || '',
      draggable: el.draggable || el.getAttribute('draggable') || false,
    }))
    
    // Get gap match drop zones
    data.gapMatchDrops = [...document.querySelectorAll('[class*="gapMatch"] [class*="gap"], [class*="gapMatch"] [class*="drop"], [class*="gapMatch"] [class*="target"]')].map(el => ({
      class: el.className?.toString().substring(0, 200) || '',
      text: el.innerText?.substring(0, 200) || '',
    }))
    
    // Get MC options for current question
    data.mcOptions = [...document.querySelectorAll('[class*="choiceInteraction"] [class*="option"], [class*="choiceInteraction"] label, [role="radio"], [class*="choice"] li')].map(el => ({
      class: el.className?.toString().substring(0, 200) || '',
      text: el.innerText?.substring(0, 500) || '',
    }))
    
    return data
  })
}

// ===== PART 4: Extract all 6 questions =====
console.log('\n===== PART 4 DETAILED =====')
await clickPart(4)
await page.waitForTimeout(3000)

const part4Questions = {}
for (let q = 25; q <= 30; q++) {
  console.log('\n--- Q' + q + ' ---')
  const clicked = await clickQuestion(q)
  console.log('CLICKED_Q' + q + ': ' + clicked)
  await page.waitForTimeout(2000)
  
  const data = await extractContent()
  part4Questions['q' + q] = data
  console.log('CONTENT: ' + data.contentText?.substring(0, 500))
  fs.writeFileSync('tmp/inspera-data/part4-q' + q + '.json', JSON.stringify(data, null, 2))
}

// ===== PART 7: Extract paragraph bank =====
console.log('\n===== PART 7 DETAILED =====')
await clickPart(7)
await page.waitForTimeout(3000)

// Get the full Part 7 content including paragraph bank
const part7Data = await page.evaluate(() => {
  const data = {}
  const contentContainer = document.querySelector('[class*="contentContainer"], [class*="sectionContent"]')
  data.contentText = contentContainer ? contentContainer.innerText : ''
  
  // Get all draggable tokens/paragraphs
  data.tokens = [...document.querySelectorAll('[class*="gapMatch"] [class*="token"], [draggable="true"], [class*="draggable"]')].map((el, i) => ({
    index: i,
    class: el.className?.toString().substring(0, 300) || '',
    text: el.innerText?.substring(0, 1000) || '',
    draggable: el.draggable || el.getAttribute('draggable') || false,
    dataId: el.getAttribute('data-id') || el.getAttribute('data-identifier') || '',
  }))
  
  // Get all gaps/drop zones
  data.gaps = [...document.querySelectorAll('[class*="gapMatch"] [class*="gap"], [class*="gapMatch"] [class*="dropzone"], [class*="gapMatch"] [class*="target"]')].map((el, i) => ({
    index: i,
    class: el.className?.toString().substring(0, 300) || '',
    text: el.innerText?.substring(0, 200) || '',
    dataId: el.getAttribute('data-id') || el.getAttribute('data-identifier') || '',
  }))
  
  // Get the right panel (tokens/paragraphs bank)
  const rightPanel = document.querySelector('[class*="tokens-right"], [class*="tokenContainer"], [class*="bank"]')
  data.rightPanelText = rightPanel ? rightPanel.innerText : ''
  
  // Get all paragraph-like elements in the right panel
  data.paragraphBank = [...document.querySelectorAll('[class*="token"], [class*="paragraph"], [draggable]')].map((el, i) => ({
    index: i,
    class: el.className?.toString().substring(0, 300) || '',
    text: el.innerText?.substring(0, 1500) || '',
    letter: el.innerText?.trim().charAt(0) || '',
  }))
  
  return data
})

console.log('PART7_CONTENT (first 2000): ' + part7Data.contentText?.substring(0, 2000))
console.log('TOKENS_COUNT: ' + part7Data.tokens.length)
console.log('GAPS_COUNT: ' + part7Data.gaps.length)
console.log('PARAGRAPH_BANK_COUNT: ' + part7Data.paragraphBank.length)

// Log each token
part7Data.tokens.forEach((t, i) => {
  console.log(`TOKEN[${i}]: ${t.text.substring(0, 200)}`)
})

fs.writeFileSync('tmp/inspera-data/part7-detailed.json', JSON.stringify(part7Data, null, 2))

// ===== PART 1: Extract MC options for each gap =====
console.log('\n===== PART 1 OPTIONS DETAILED =====')
await clickPart(1)
await page.waitForTimeout(3000)

// Click on gap 1 to see options
for (let q = 1; q <= 8; q++) {
  console.log('\n--- GAP ' + q + ' OPTIONS ---')
  // Click the gap button
  const gapClicked = await page.evaluate((n) => {
    const buttons = [...document.querySelectorAll('button[class*="inlineChoice"]')]
    const target = buttons.find(t => t.innerText?.trim() === String(n))
    if (target) { target.click(); return true }
    return false
  }, q)
  
  if (gapClicked) {
    await page.waitForTimeout(1000)
    // Get the popup options
    const options = await page.evaluate(() => {
      return [...document.querySelectorAll('[class*="collapsedMenu"] option, [class*="collapsedMenu"] [class*="option"], [class*="collapsedMenu"] button, [role="listbox"] [role="option"], [class*="inlineChoice"] [class*="option"]')].map(el => ({
        text: el.innerText?.trim() || '',
        class: el.className?.toString().substring(0, 200) || '',
      }))
    })
    console.log('OPTIONS_FOR_GAP_' + q + ': ' + JSON.stringify(options))
  } else {
    console.log('GAP_' + q + '_NOT_CLICKED')
  }
  
  // Close popup by clicking elsewhere
  await page.evaluate(() => {
    document.body.click()
  })
  await page.waitForTimeout(500)
}

// ===== PART 5: Extract questions and options =====
console.log('\n===== PART 5 QUESTIONS DETAILED =====')
await clickPart(5)
await page.waitForTimeout(3000)

const part5Data = await page.evaluate(() => {
  const data = {}
  const contentContainer = document.querySelector('[class*="contentContainer"], [class*="sectionContent"]')
  data.contentText = contentContainer ? contentContainer.innerText : ''
  
  // Get each question with its options
  data.questions = [...document.querySelectorAll('[class*="choiceInteraction"]')].map((qEl, i) => ({
    index: i,
    text: qEl.innerText?.substring(0, 1000) || '',
    options: [...qEl.querySelectorAll('[class*="option"], label, [role="radio"], li')].map(opt => ({
      text: opt.innerText?.substring(0, 500) || '',
      class: opt.className?.toString().substring(0, 200) || '',
    })),
  }))
  
  return data
})

console.log('PART5_QUESTIONS_COUNT: ' + part5Data.questions?.length)
part5Data.questions?.forEach((q, i) => {
  console.log(`\nQ${i+31}: ${q.text.substring(0, 200)}`)
  q.options.forEach((opt, j) => {
    console.log(`  OPT[${j}]: ${opt.text.substring(0, 200)}`)
  })
})
fs.writeFileSync('tmp/inspera-data/part5-detailed.json', JSON.stringify(part5Data, null, 2))

// ===== PART 6: Extract questions and options =====
console.log('\n===== PART 6 QUESTIONS DETAILED =====')
await clickPart(6)
await page.waitForTimeout(3000)

const part6Data = await page.evaluate(() => {
  const data = {}
  const contentContainer = document.querySelector('[class*="contentContainer"], [class*="sectionContent"]')
  data.contentText = contentContainer ? contentContainer.innerText : ''
  
  data.questions = [...document.querySelectorAll('[class*="choiceInteraction"]')].map((qEl, i) => ({
    index: i,
    text: qEl.innerText?.substring(0, 1000) || '',
    options: [...qEl.querySelectorAll('[class*="option"], label, [role="radio"], li')].map(opt => ({
      text: opt.innerText?.substring(0, 200) || '',
    })),
  }))
  
  // Get reviewer labels
  data.reviewerLabels = [...document.querySelectorAll('[class*="gapMatch"] [class*="token"], [class*="label"], h3, h4')].map(el => ({
    text: el.innerText?.substring(0, 100) || '',
    class: el.className?.toString().substring(0, 200) || '',
  }))
  
  return data
})

console.log('PART6_QUESTIONS_COUNT: ' + part6Data.questions?.length)
part6Data.questions?.forEach((q, i) => {
  console.log(`\nQ${i+37}: ${q.text.substring(0, 200)}`)
  q.options.forEach((opt, j) => {
    console.log(`  OPT[${j}]: ${opt.text.substring(0, 100)}`)
  })
})
fs.writeFileSync('tmp/inspera-data/part6-detailed.json', JSON.stringify(part6Data, null, 2))

// ===== PART 8: Extract questions and options =====
console.log('\n===== PART 8 QUESTIONS DETAILED =====')
await clickPart(8)
await page.waitForTimeout(3000)

const part8Data = await page.evaluate(() => {
  const data = {}
  const contentContainer = document.querySelector('[class*="contentContainer"], [class*="sectionContent"]')
  data.contentText = contentContainer ? contentContainer.innerText : ''
  
  data.questions = [...document.querySelectorAll('[class*="choiceInteraction"]')].map((qEl, i) => ({
    index: i,
    text: qEl.innerText?.substring(0, 1000) || '',
    options: [...qEl.querySelectorAll('[class*="option"], label, [role="radio"], li')].map(opt => ({
      text: opt.innerText?.substring(0, 200) || '',
    })),
  }))
  
  return data
})

console.log('PART8_QUESTIONS_COUNT: ' + part8Data.questions?.length)
part8Data.questions?.forEach((q, i) => {
  console.log(`\nQ${i+47}: ${q.text.substring(0, 200)}`)
  q.options.forEach((opt, j) => {
    console.log(`  OPT[${j}]: ${opt.text.substring(0, 100)}`)
  })
})
fs.writeFileSync('tmp/inspera-data/part8-detailed.json', JSON.stringify(part8Data, null, 2))

await context.close()
console.log('\nDONE')