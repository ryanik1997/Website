import fs from 'node:fs/promises'
import path from 'node:path'
import { test, expect } from 'playwright/test'

const testNumbers = [2, 5, 14, 20, 27]
const outputDir = path.resolve('tmp', 'fce-b2-part7-heading-screenshots')

test.beforeAll(async () => {
  await fs.mkdir(outputDir, { recursive: true })
})

for (const testNumber of testNumbers) {
  test(`App Test ${testNumber} Part 7 keeps label and heading together`, async ({ page }) => {
    await page.goto(`/app/exam/reading/catalog-reading-fce-b2-test${testNumber}`, { waitUntil: 'networkidle' })
    const part7Button = page.locator('button').filter({ hasText: /^Part\s*7/i }).first()
    await expect(part7Button).toBeVisible({ timeout: 15000 })
    await part7Button.click()

    const sections = page.locator('[data-fce-section]')
    await expect(sections.first()).toBeVisible({ timeout: 15000 })
    const count = await sections.count()
    expect(count).toBeGreaterThanOrEqual(4)
    expect(count).toBeLessThanOrEqual(5)

    for (let index = 0; index < count; index += 1) {
      const section = sections.nth(index)
      const label = String.fromCharCode(65 + index)
      await expect(section).toHaveAttribute('data-fce-section', label)
      const heading = section.locator('.fce-rw-paragraph-heading')
      await expect(heading).toHaveText(new RegExp(`^${label}\\.`))
      const headingText = (await heading.textContent())?.replace(new RegExp(`^${label}\\.\\s*`), '').trim() ?? ''
      const bodyText = (await section.locator('.ket-rw-paragraph').textContent())?.trim() ?? ''
      expect(bodyText.length).toBeGreaterThan(0)
      if (headingText) expect(bodyText.toLowerCase().startsWith(headingText.toLowerCase())).toBe(false)
    }

    await page.screenshot({
      path: path.join(outputDir, `app-test-${testNumber}-part-7.png`),
      fullPage: false,
    })
  })
}
