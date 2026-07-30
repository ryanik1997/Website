/**
 * §4 MANUAL-BROWSER SMOKE (automated via Playwright) — PET B1 Reading Part 2.
 *
 * Covers what the interactive browser MCP could not (reliable screenshots,
 * real viewport sizing, HTML5 drag dispatch). Verifies, in a real browser:
 *   - 8 bank cards render with diverse openings
 *   - click-to-assign fills the drop zone with bold title + full description
 *   - × remove empties the slot and frees the bank card
 *   - gap→gap drag reassigns uniquely (source empties, target fills)
 *   - selection persists across a Part 1 → Part 2 round-trip
 *   - no real console errors
 *   - 768px viewport: filled drop zone does not overflow
 *   - legacy Tests 1 & 13 (no separate title) render without crashing
 *
 * Run: node scripts/reading/pet-b1/smoke-part2.mjs
 * Requires: Vite dev server on :5173 with VITE_DEV_AUTH_BYPASS=1.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const ART = path.join(ROOT, 'artifacts')
const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:5173'
fs.mkdirSync(ART, { recursive: true })

const shot = page => page.screenshot({ path: path.join(ART, `${page.__tag}.png`) })

async function gotoPart2(page, examId) {
  await page.goto(`${BASE}/app/exam/reading/${examId}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForSelector('.pet-rw-footer__part-tab', { timeout: 30000 })
  const part2 = page.locator('button.pet-rw-footer__part-tab', { hasText: 'Part 2' }).first()
  await part2.click()
  await page.waitForSelector('.pet-rw-drag__bank-card', { timeout: 15000 })
  await page.waitForTimeout(400)
}

function openingsOf(page) {
  return page.evaluate(() => {
    const cards = [...document.querySelectorAll('.pet-rw-drag__bank-card')]
    return cards.map(c => {
      const t = c.querySelector('.pet-rw-drag__bank-title')
      const raw = (t ? t.textContent : c.textContent) || ''
      return raw.trim().split(/\s+/).slice(0, 3).join(' ')
    })
  })
}

const filledCount = page => page.locator('.pet-rw-drag__slot.is-filled').count()

async function assignByClick(page, cardIdx, slotIdx) {
  await page.locator('.pet-rw-drag__bank-card').nth(cardIdx).click()
  await page.waitForTimeout(150)
  await page.locator('.pet-rw-drag__slot').nth(slotIdx).click()
  await page.waitForTimeout(250)
}

// HTML5 gap→gap drag (mouse-based dragTo does not fire dataTransfer drag events).
async function dragSlotToSlot(page, fromIdx, toIdx) {
  await page.evaluate(([fi, ti]) => {
    const slots = [...document.querySelectorAll('.pet-rw-drag__slot')]
    const from = slots[fi]
    const to = slots[ti]
    const dt = new DataTransfer()
    const fire = (el, type) => el.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: dt }))
    fire(from, 'dragstart')
    fire(to, 'dragenter')
    fire(to, 'dragover')
    fire(to, 'drop')
    fire(from, 'dragend')
  }, [fromIdx, toIdx])
  await page.waitForTimeout(300)
}

async function fullCheck(browser, n) {
  const examId = `catalog-reading-pet-b1-test${n}`
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))
  const r = { test: n }
  try {
    await gotoPart2(page, examId)
    r.cards = await page.locator('.pet-rw-drag__bank-card').count()
    r.openings = await openingsOf(page)
    r.diverse = new Set(r.openings).size === r.openings.length && r.openings.length === 8

    page.__tag = `pet-smoke-test${n}-before`
    await shot(page)

    // select card #0 → Q6 (slot 0)
    await assignByClick(page, 0, 0)
    r.selectFilled = (await filledCount(page)) === 1
    r.titleBold = await page.evaluate(() => {
      const el = document.querySelector('.pet-rw-drag__slot.is-filled .pet-rw-part2-selected-title')
      return el ? Number(getComputedStyle(el).fontWeight) >= 600 : false
    })
    r.descLen = await page.evaluate(() => {
      const el = document.querySelector('.pet-rw-drag__slot.is-filled .pet-rw-part2-selected-description')
      return el ? (el.textContent || '').trim().length : 0
    })
    page.__tag = `pet-smoke-test${n}-after-selection`
    await shot(page)

    // remove via ×
    await page.locator('.pet-rw-drag__slot.is-filled .pet-rw-part2-selected-remove').first().click()
    await page.waitForTimeout(250)
    r.removeEmptied = (await filledCount(page)) === 0
    r.cardFreed = (await page.locator('.pet-rw-drag__bank-card.is-used').count()) === 0

    // reassign uniquely: fill Q6 then drag Q6 → Q7
    await assignByClick(page, 0, 0)
    await dragSlotToSlot(page, 0, 1)
    r.reassign = (await filledCount(page)) === 1
    r.reassignTarget = await page.evaluate(() =>
      Boolean(document.querySelectorAll('.pet-rw-drag__slot')[1].classList.contains('is-filled')))
    page.__tag = `pet-smoke-test${n}-after-reassign`
    await shot(page)

    // persistence across part switch
    await page.locator('button.pet-rw-footer__part-tab', { hasText: 'Part 1' }).first().click()
    await page.waitForTimeout(400)
    await page.locator('button.pet-rw-footer__part-tab', { hasText: 'Part 2' }).first().click()
    await page.waitForSelector('.pet-rw-drag__slot.is-filled', { timeout: 8000 }).catch(() => {})
    r.persistence = (await filledCount(page)) === 1

    r.consoleErrors = errors.filter(e =>
      !/favicon|React Router|future flag|Supabase|supabase|network/i.test(e))
    r.pass = r.cards === 8 && r.diverse && r.selectFilled && r.titleBold && r.descLen > 20 &&
      r.removeEmptied && r.cardFreed && r.reassign && r.reassignTarget && r.persistence &&
      r.consoleErrors.length === 0
  } catch (e) {
    r.error = String(e && e.message ? e.message : e)
    r.pass = false
  } finally {
    await page.close()
  }
  return r
}

async function overflow768(browser) {
  const page = await browser.newPage({ viewport: { width: 768, height: 1024 } })
  const out = { viewport: '768x1024' }
  try {
    await gotoPart2(page, 'catalog-reading-pet-b1-test20')
    await assignByClick(page, 0, 0)
    page.__tag = 'pet-smoke-test20-768'
    await shot(page)
    out.metrics = await page.evaluate(() => {
      const el = document.querySelector('.pet-rw-drag__slot.is-filled .pet-rw-part2-selected-content')
      const slot = document.querySelector('.pet-rw-drag__slot.is-filled')
      if (!el || !slot) return { found: false }
      return {
        found: true,
        contentScrollW: el.scrollWidth, contentClientW: el.clientWidth,
        slotScrollW: slot.scrollWidth, slotClientW: slot.clientWidth,
        docScrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
      }
    })
    const m = out.metrics
    out.overflow = m.found &&
      m.contentScrollW <= m.contentClientW + 1 &&
      m.slotScrollW <= m.slotClientW + 1 &&
      m.docScrollW <= m.innerW + 1
  } catch (e) {
    out.error = String(e && e.message ? e.message : e)
    out.overflow = false
  } finally {
    await page.close()
  }
  return out
}

async function legacyCheck(browser, n) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  const out = { test: n }
  try {
    await gotoPart2(page, `catalog-reading-pet-b1-test${n}`)
    out.cards = await page.locator('.pet-rw-drag__bank-card').count()
    out.titledCards = await page.locator('.pet-rw-drag__bank-card .pet-rw-drag__bank-title').count()
    page.__tag = `pet-smoke-legacy-test${n}`
    await shot(page)
    // fill one slot to prove interaction still works on legacy data
    await assignByClick(page, 0, 0)
    out.fills = (await filledCount(page)) === 1
    out.crash = errors.length > 0
    out.errors = errors
    out.pass = out.cards === 8 && !out.crash && out.fills
  } catch (e) {
    out.error = String(e && e.message ? e.message : e)
    out.pass = false
  } finally {
    await page.close()
  }
  return out
}

const browser = await chromium.launch()
const report = { base: BASE, at: new Date().toISOString(), full: [], legacy: [] }
try {
  for (const n of [20, 15, 24, 30]) report.full.push(await fullCheck(browser, n))
  report.overflow768 = await overflow768(browser)
  for (const n of [1, 13]) report.legacy.push(await legacyCheck(browser, n))
} finally {
  await browser.close()
}

fs.writeFileSync(path.join(ART, 'pet-smoke-report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
const allPass = report.full.every(r => r.pass) && report.legacy.every(r => r.pass) && report.overflow768.overflow
console.log('\n§4 SMOKE OVERALL:', allPass ? 'PASS ✅' : 'FAIL ❌')
