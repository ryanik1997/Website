import { test, expect } from 'playwright/test'

const EXAM_URL = '/app/exam/reading/catalog-reading-pet-b1-test1'

test.describe('Diagnose highlight bug — capture commitHighlightRanges rejection', () => {
  let consoleErrors: string[] = []

  test.beforeEach(async ({ page }) => {
    consoleErrors = []

    // Capture all console messages
    page.on('console', msg => {
      const text = msg.text()
      // Track errors
      if (msg.type() === 'error') {
        consoleErrors.push(`[ERROR] ${text}`)
      }
      // Also track [PET annotation] logs regardless of level
      if (text.includes('[PET annotation]')) {
        consoleErrors.push(`[${msg.type()}] ${text}`)
      }
    })

    // Also capture page errors (uncaught exceptions)
    page.on('pageerror', err => {
      consoleErrors.push(`[PAGE_ERROR] ${err.message}`)
    })
  })

  async function selectTextInBlock(page: any, blockIndex: number) {
    // Find all highlight blocks with actual text content
    const blocks = page.locator('[data-highlight-block]')
    const count = await blocks.count()
    expect(count).toBeGreaterThan(0)

    // Pick the specified block, or the first text-containing block
    let targetBlock = blocks.nth(blockIndex)
    const blockText = await targetBlock.textContent()
    if (!blockText || blockText.trim().length < 20) {
      // Try finding next block with enough text
      for (let i = 0; i < count; i++) {
        const t = await blocks.nth(i).textContent()
        if (t && t.trim().length >= 20) {
          targetBlock = blocks.nth(i)
          break
        }
      }
    }

    await expect(targetBlock).toBeVisible({ timeout: 10000 })

    // Scroll into view
    await targetBlock.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)

    // Get bounding box
    const bounds = await targetBlock.boundingBox()
    expect(bounds).toBeTruthy()

    if (!bounds) return

    // Select text by dragging across a portion of the block
    await page.mouse.move(bounds.x + 20, bounds.y + 10)
    await page.mouse.down()
    // Drag across about 60% of the block width
    await page.mouse.move(
      bounds.x + bounds.width * 0.6,
      bounds.y + 10,
      { steps: 15 },
    )
    await page.mouse.up()

    await page.waitForTimeout(500)
  }

  async function clickHighlightButton(page: any) {
    // Wait for the CambridgeSelectionToolbar to appear
    // It's portaled to document.body with role="toolbar" and buttons "Note" and "Highlight"
    const toolbar = page.locator('[role="toolbar"][data-cambridge-selection-toolbar]')
    await expect(toolbar).toBeVisible({ timeout: 5000 })

    // Click the "Highlight" button (it's a button directly inside the toolbar with text "Highlight")
    const highlightBtn = toolbar.locator('button', { hasText: 'Highlight' })
    await expect(highlightBtn).toBeVisible({ timeout: 3000 })
    await highlightBtn.click()
    await page.waitForTimeout(500)
  }

  async function checkErrorToast(page: any): Promise<string | null> {
    // Check for error toast div[role="alert"]
    const errorToast = page.locator('[role="alert"]')
    const visible = await errorToast.isVisible().catch(() => false)
    if (visible) {
      return await errorToast.textContent()
    }
    return null
  }

  async function readDebugState(page: any): Promise<unknown> {
    return await page.evaluate(() => {
      return (window as any).__PET_ANNOTATION_DEBUG__ ?? null
    })
  }

  test('TEST 1: Select text in Part 2 passage and click Highlight', async ({ page }) => {
    // Navigate to the exam
    await page.goto(EXAM_URL, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Wait for the reading content to load
    const highlightBlock = page.locator('[data-highlight-block]').first()
    await expect(highlightBlock).toBeVisible({ timeout: 20000 })

    // Clear console errors collected during page load
    consoleErrors = []

    // Select text
    await selectTextInBlock(page, 0)

    // Click Highlight
    await clickHighlightButton(page)

    // Check for error toast
    const toastText = await checkErrorToast(page)
    console.log('=== TEST 1 Results ===')
    console.log('Error toast:', toastText)
    console.log('Console errors:', JSON.stringify(consoleErrors, null, 2))

    // Read debug state
    const debugState = await readDebugState(page)
    console.log('__PET_ANNOTATION_DEBUG__:', JSON.stringify(debugState, null, 2))

    // Find the specific rejection error
    const rejectionLog = consoleErrors.find(e => e.includes('commitHighlightRanges rejected'))
    console.log('Rejection log:', rejectionLog)

    // Assert the test completed — we just want the diagnostics, not pass/fail
    expect(true).toBe(true)
  })

  test('TEST 2: Select text in Part 2 different block and click Highlight', async ({ page }) => {
    await page.goto(EXAM_URL, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    const highlightBlock = page.locator('[data-highlight-block]').first()
    await expect(highlightBlock).toBeVisible({ timeout: 20000 })

    consoleErrors = []

    // Select text from a different block (index 2)
    await selectTextInBlock(page, 2)

    // Click Highlight
    await clickHighlightButton(page)

    const toastText = await checkErrorToast(page)
    console.log('=== TEST 2 Results ===')
    console.log('Error toast:', toastText)
    console.log('Console errors:', JSON.stringify(consoleErrors, null, 2))

    const debugState = await readDebugState(page)
    console.log('__PET_ANNOTATION_DEBUG__:', JSON.stringify(debugState, null, 2))

    const rejectionLog = consoleErrors.find(e => e.includes('commitHighlightRanges rejected'))
    console.log('Rejection log:', rejectionLog)

    expect(true).toBe(true)
  })

  test('TEST 3: Wait 5 seconds then select text and click Highlight (check for race condition)', async ({ page }) => {
    await page.goto(EXAM_URL, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    const highlightBlock = page.locator('[data-highlight-block]').first()
    await expect(highlightBlock).toBeVisible({ timeout: 20000 })

    // Wait additional 5 seconds to ensure everything is fully loaded
    await page.waitForTimeout(5000)

    consoleErrors = []

    await selectTextInBlock(page, 1)

    await clickHighlightButton(page)

    const toastText = await checkErrorToast(page)
    console.log('=== TEST 3 Results (with extra wait) ===')
    console.log('Error toast:', toastText)
    console.log('Console errors:', JSON.stringify(consoleErrors, null, 2))

    const debugState = await readDebugState(page)
    console.log('__PET_ANNOTATION_DEBUG__:', JSON.stringify(debugState, null, 2))

    const rejectionLog = consoleErrors.find(e => e.includes('commitHighlightRanges rejected'))
    console.log('Rejection log:', rejectionLog)

    expect(true).toBe(true)
  })
})
