import { chromium } from 'playwright'

const TARGET_URL = 'https://ceq.inspera.com/player/?assessmentRunId=160272499&context=exam#/section/8673155978802/question/160270339/scorableItem/1/skipScroll'

// Try connecting to existing Chrome debug port first
let browser = null
try {
  browser = await chromium.connectOverCDP('http://localhost:9222')
  console.log('CONNECTED_TO_CDP_9222')
} catch {
  console.log('CDP_9222_NOT_AVAILABLE - launching persistent context')
}

if (!browser) {
  // Launch with user's Chrome profile to reuse login state
  const fs = await import('fs')
  const path = await import('path')
  const os = await import('os')

  // Common Chrome user data dirs on Windows
  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
  const chromeUserDataDirs = [
    path.join(localAppData, 'Google', 'Chrome', 'User Data'),
    path.join(localAppData, 'Google', 'Chrome', 'User Data', 'Default'),
  ]

  let userDataDir = null
  for (const dir of chromeUserDataDirs) {
    if (fs.existsSync(dir)) {
      userDataDir = dir
      break
    }
  }

  if (userDataDir) {
    console.log('USING_CHROME_PROFILE: ' + userDataDir)
  } else {
    console.log('NO_CHROME_PROFILE_FOUND - using temp')
    userDataDir = path.join(os.tmpdir(), 'pw-inspera-check')
  }

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    channel: 'chrome',
    args: ['--disable-blink-features=AutomationControlled'],
  })

  browser = context
}

const contexts = browser.contexts ? browser.contexts() : [browser]
const context = contexts[0]
const page = await context.newPage()

console.log('NAVIGATING_TO: ' + TARGET_URL)
await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => {
  console.log('NAV_ERROR: ' + e.message)
})

await page.waitForTimeout(5000)

const url = page.url()
const title = await page.title()
console.log('FINAL_URL: ' + url)
console.log('PAGE_TITLE: ' + title)

// Check for login/auth blockers
const bodyText = await page.evaluate(() => document.body ? document.body.innerText.substring(0, 3000) : 'NO_BODY')
console.log('BODY_TEXT_FIRST_3000:')
console.log(bodyText)

// Check for specific auth indicators
const authCheck = await page.evaluate(() => {
  const results = {}
  results.hasLoginForm = Boolean(document.querySelector('input[type="password"], form[action*="login"], form[action*="auth"]'))
  results.hasInsperaContent = Boolean(document.querySelector('[class*="Inspera"], [class*="inspera"], #inspera, [data-testid*="inspera"]'))
  results.hasQuestionDisplay = Boolean(document.querySelector('[class*="QuestionDisplay"], [class*="question-wrapper"]'))
  results.hasHeader = Boolean(document.querySelector('header, [class*="header"]'))
  results.hasFooter = Boolean(document.querySelector('footer, [class*="footer"]'))
  results.bodyClasses = document.body ? document.body.className : ''
  results.htmlClasses = document.documentElement ? document.documentElement.className : ''
  return results
})
console.log('AUTH_CHECK: ' + JSON.stringify(authCheck, null, 2))

// Take screenshot
const screenshotPath = 'tmp/inspera-auth-check.png'
await page.screenshot({ path: screenshotPath, fullPage: false })
console.log('SCREENSHOT_SAVED: ' + screenshotPath)

if (browser.close) {
  await browser.close()
}
console.log('DONE')