import { test, expect } from 'playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const AUTH_SESSION = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'auth-token.json'), 'utf-8')
)

const EXAM_URL = '/app/exam/reading/catalog-reading-pet-b1-test1'
const STORAGE_KEY = 'sb-afryrzlcmieedcndyeug-auth-token'

test.describe('Diagnose highlight bug — REAL AUTH', () => {
  let consoleLogs: string[] = []

  test.beforeEach(async ({ page }) => {
    consoleLogs = []
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('[PET annotation]') || msg.type() === 'error') {
        consoleLogs.push(`[${msg.type()}] ${text}`)
      }
    })
    page.on('pageerror', err => {
      consoleLogs.push(`[PAGE_ERROR] ${err.message}`)
    })

    // Navigate to origin first, then inject auth token before React initializes
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.evaluate(({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value))
    }, { key: STORAGE_KEY, value: AUTH_SESSION })
  })

  async function waitForExamLoaded(page: any) {
    await page.goto(EXAM_URL, { waitUntil: 'networkidle' })
    await page.locator('.pet-rw-shell').first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {})
    await page.locator('[data-highlight-block]').first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {})
    await page.waitForTimeout(2000)
  }

  async function navigateToPart(page: any, partIndex: number) {
    const partTabs = page.locator('.pet-rw-footer__part-tab')
    await expect(partTabs.first()).toBeVisible({ timeout: 10000 })
    const count = await partTabs.count()
    if (partIndex < count) {
      await partTabs.nth(partIndex).click()
      await page.waitForTimeout(800)
    }
  }

  async function selectTextInBlock(page: any, blockIndex: number) {
    const blocks = page.locator('[data-highlight-block]')
    const count = await blocks.count()
    expect(count).toBeGreaterThan(0)
    let targetBlock = blocks.nth(blockIndex)
    let blockText = await targetBlock.textContent()
    if (!blockText || blockText.trim().length < 15) {
      for (let i = 0; i < count; i++) {
        const t = await blocks.nth(i).textContent()
        if (t && t.trim().length >= 15) {
          targetBlock = blocks.nth(i)
          break
        }
      }
    }
    await targetBlock.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    const bounds = await targetBlock.boundingBox()
    expect(bounds).toBeTruthy()
    if (!bounds) return
    await page.mouse.move(bounds.x + 20, bounds.y + 10)
    await page.mouse.down()
    await page.mouse.move(bounds.x + bounds.width * 0.6, bounds.y + 10, { steps: 12 })
    await page.mouse.up()
    await page.waitForTimeout(600)
  }

  async function clickHighlight(page: any) {
    const toolbar = page.locator('[role="toolbar"][data-cambridge-selection-toolbar]')
    await expect(toolbar).toBeVisible({ timeout: 5000 })
    const btn = toolbar.locator('button', { hasText: 'Highlight' })
    await expect(btn).toBeVisible({ timeout: 3000 })
    await btn.click()
    await page.waitForTimeout(400)
  }

  async function checkErrorToast(page: any): Promise<string | null> {
    const errorToast = page.locator('[role="alert"]')
    const visible = await errorToast.isVisible().catch(() => false)
    if (visible) return await errorToast.textContent()
    return null
  }

  async function readDebug(page: any) {
    return await page.evaluate(() => (window as any).__PET_ANNOTATION_DEBUG__ ?? null)
  }

  function report(testName: string, toast: string | null, rejection: string | undefined, debug: any) {
    console.log(`\n=== ${testName} ===`)
    console.log('Error toast:', toast)
    console.log('Rejection log:', rejection || '(none)')
    if (debug) console.log('partId:', debug.partId, 'partNumber:', debug.partNumber)
    console.log('All [PET annotation] logs:', JSON.stringify(consoleLogs, null, 2))
  }

  // ── TEST A: Part 1 → Highlight (baseline) ──
  test('A: Part 1 baseline', async ({ page }) => {
    await waitForExamLoaded(page)
    consoleLogs = []
    await selectTextInBlock(page, 0)
    await clickHighlight(page)
    report('A: Part 1 baseline', await checkErrorToast(page),
      consoleLogs.find((e: string) => e.includes('rejected')), await readDebug(page))
    expect(true).toBe(true)
  })

  // ── TEST B: Part 2 (Q6-10) → Highlight ──
  test('B: Part 2 highlight', async ({ page }) => {
    await waitForExamLoaded(page)
    await navigateToPart(page, 1)
    consoleLogs = []
    await selectTextInBlock(page, 0)
    await clickHighlight(page)
    report('B: Part 2 highlight', await checkErrorToast(page),
      consoleLogs.find((e: string) => e.includes('rejected')), await readDebug(page))
    expect(true).toBe(true)
  })

  // ── TEST C: Part switch race condition ──
  test('C: Part switch race', async ({ page }) => {
    await waitForExamLoaded(page)
    await navigateToPart(page, 1)
    consoleLogs = []
    await selectTextInBlock(page, 0)
    await clickHighlight(page)
    report('C: Part switch race', await checkErrorToast(page),
      consoleLogs.find((e: string) => e.includes('rejected')), await readDebug(page))
    expect(true).toBe(true)
  })

  // ── TEST D: Part 2 with throttling (3G slow) ──
  test('D: Part 2 with throttling', async ({ page, context }) => {
    await context.route('**/*', async route => {
      const response = await route.fetch()
      await new Promise(r => setTimeout(r, 500))
      await route.fulfill({ response })
    })
    await waitForExamLoaded(page)
    await page.waitForTimeout(3000)
    await navigateToPart(page, 1)
    consoleLogs = []
    await selectTextInBlock(page, 0)
    await clickHighlight(page)
    report('D: Part 2 with throttling', await checkErrorToast(page),
      consoleLogs.find((e: string) => e.includes('rejected')), await readDebug(page))
    expect(true).toBe(true)
  })
})
