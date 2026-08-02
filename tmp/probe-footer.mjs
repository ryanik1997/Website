import { chromium } from 'playwright'

const BASE = 'http://localhost:5175'
const ROUTE = '/app/exam/reading/catalog-reading-ket-a2-book7-test2'

const browser = await chromium.launch({ headless: true, channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
await page.goto(BASE + ROUTE, { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(2500)

// Dump footer-related elements
const info = await page.evaluate(() => {
  const out = {}
  // All elements with class containing 'footer'
  const footers = Array.from(document.querySelectorAll('[class*="footer"]'))
  out.footerEls = footers.slice(0, 20).map(el => ({
    tag: el.tagName,
    cls: el.className,
    text: (el.textContent || '').trim().slice(0, 60),
  }))
  // All buttons
  const btns = Array.from(document.querySelectorAll('button'))
  out.buttons = btns.slice(0, 40).map(b => ({
    cls: b.className,
    text: (b.textContent || '').trim().slice(0, 30),
    aria: b.getAttribute('aria-label'),
  }))
  // data-part attributes
  out.dataParts = Array.from(document.querySelectorAll('[data-part]')).map(el => ({
    tag: el.tagName, cls: el.className, val: el.getAttribute('data-part'),
  })).slice(0, 20)
  // active part indicator
  out.shellData = document.querySelector('.ket-rw-shell')?.getAttribute('data-active-part-number') || null
  return out
})
console.log(JSON.stringify(info, null, 2))
await browser.close()