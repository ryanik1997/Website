import { test, expect } from 'playwright/test'

const EXAM_URL = '/app/exam/reading/catalog-reading-pet-b1-test1'

test.describe('PET Reading highlight & note', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly — the app may redirect to login then back
    await page.goto(EXAM_URL, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
  })

  test('toolbar appears on text selection in Part 3 passage', async ({ page }) => {
    // Wait for Part 3 content (passage text with data-highlight-block)
    const highlightBlock = page.locator('[data-highlight-block]').first()
    await expect(highlightBlock).toBeVisible({ timeout: 15000 })

    // Select text by dragging across a paragraph
    const blockBounds = await highlightBlock.boundingBox()
    expect(blockBounds).toBeTruthy()

    if (blockBounds) {
      await page.mouse.move(blockBounds.x + 10, blockBounds.y + 10)
      await page.mouse.down()
      await page.mouse.move(blockBounds.x + blockBounds.width - 10, blockBounds.y + 10, { steps: 10 })
      await page.mouse.up()
    }

    await page.waitForTimeout(500)

    // Toolbar should appear
    const toolbar = page.locator('[role="toolbar"]')
    await expect(toolbar).toBeVisible({ timeout: 5000 })

    // Four color buttons
    const yellowBtn = page.locator('[aria-label="Tô màu Vàng"]')
    const blueBtn = page.locator('[aria-label="Tô màu Xanh"]')
    const greenBtn = page.locator('[aria-label="Tô màu Xanh lá"]')
    const pinkBtn = page.locator('[aria-label="Tô màu Hồng"]')

    await expect(yellowBtn).toBeVisible()
    await expect(blueBtn).toBeVisible()
    await expect(greenBtn).toBeVisible()
    await expect(pinkBtn).toBeVisible()

    // Click yellow to apply highlight
    await yellowBtn.click()
    await page.waitForTimeout(300)

    // Verify highlight mark appears in DOM
    const yellowHighlight = page.locator('mark.reading-test-highlight--yellow')
    await expect(yellowHighlight).toBeVisible({ timeout: 5000 })
  })

  test('highlight persists after Part switch and reload', async ({ page }) => {
    // Wait for Part 3 content
    const highlightBlock = page.locator('[data-highlight-block]').first()
    await expect(highlightBlock).toBeVisible({ timeout: 15000 })

    // Apply a highlight on Part 3
    const blockBounds = await highlightBlock.boundingBox()
    expect(blockBounds).toBeTruthy()

    if (blockBounds) {
      await page.mouse.move(blockBounds.x + 10, blockBounds.y + 10)
      await page.mouse.down()
      await page.mouse.move(blockBounds.x + blockBounds.width - 10, blockBounds.y + 10, { steps: 10 })
      await page.mouse.up()
    }
    await page.waitForTimeout(300)

    const yellowBtn = page.locator('[aria-label="Tô màu Vàng"]')
    await expect(yellowBtn).toBeVisible({ timeout: 5000 })
    await yellowBtn.click()
    await page.waitForTimeout(300)

    // Verify highlight
    let highlights = page.locator('mark.reading-test-highlight--yellow')
    const countBefore = await highlights.count()
    expect(countBefore).toBeGreaterThan(0)

    // Navigate to footer Part pill Part 2 then back to Part 3
    // Click part pill for Part 2, then Part 3
    const partPills = page.locator('[data-part-pill]')
    const partPillCount = await partPills.count()
    if (partPillCount >= 3) {
      await partPills.nth(1).click() // Part 2
      await page.waitForTimeout(500)
      await partPills.nth(2).click() // Part 3
      await page.waitForTimeout(500)
    }

    // Verify highlight still exists after switching parts
    highlights = page.locator('mark.reading-test-highlight--yellow')
    await expect(highlights.first()).toBeVisible({ timeout: 5000 })

    // Reload the page
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // After reload, verify highlight still exists
    highlights = page.locator('mark.reading-test-highlight--yellow')
    const countAfterReload = await highlights.count()
    expect(countAfterReload).toBeGreaterThan(0)
  })
})
