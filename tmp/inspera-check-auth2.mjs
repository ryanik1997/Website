import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import os from 'os'

const TARGET_URL = 'https://ceq.inspera.com/player/?assessmentRunId=160272499&context=exam#/section/8673155978802/question/160270339/scorableItem/1/skipScroll'

// Use a separate temp profile to avoid conflict with running Chrome
const tempDir = path.join(os.tmpdir(), 'pw-inspera-check-' + Date.now())
fs.mkdirSync(tempDir, { recursive: true })

console.log('USING_TEMP_PROFILE: ' + tempDir)

const context = await chromium.launchPersistentContext(tempDir, {
  headless: false,
  channel: 'chrome',
  args: ['--disable-blink-features=AutomationControlled', '--no-first-run', '--no-default-browser-check'],
})

const page = await context.newPage()

console.log('NAVIGATING_TO: ' + TARGET_URL)
await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => {
  console.log('NAV_ERROR: ' + e.message)
})

// Wait for page to settle (SPA may need time)
await page.waitForTimeout(8000)

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
  // Check for login redirect
  results.currentUrl = window.location.href
  results.hasLoginText = /login|sign in|log in|đăng nhập|password|username|email/i.test(bodyText || '')
  return results
})
console.log('AUTH_CHECK: ' + JSON.stringify(authCheck, null, 2))

// Take screenshot
const screenshotPath = 'tmp/inspera-auth-check.png'
await page.screenshot({ path: screenshotPath, fullPage: false })
console.log('SCREENSHOT_SAVED: ' + screenshotPath)

await context.close()
console.log('DONE')