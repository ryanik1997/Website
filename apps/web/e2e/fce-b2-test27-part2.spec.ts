import { expect, test } from 'playwright/test'
import fs from 'node:fs/promises'

const EXAM_PATH = '/app/exam/reading/catalog-reading-fce-b2-test27'
const EXAM_URL = process.env.TASK1_FCE_BASE_URL
  ? new URL(EXAM_PATH, process.env.TASK1_FCE_BASE_URL).toString()
  : EXAM_PATH
const screenshotPath = 'tmp/fce-b2-test27-part2-runtime.png'
const evidencePath = 'tmp/fce-b2-test27-part2-runtime.json'
const answers = new Map([
  [9, 'has'],
  [10, 'up'],
  [11, 'think'],
  [12, 'while'],
  [13, 'for'],
  [14, 'put'],
  [15, 'difference'],
  [16, 'majority'],
])

test('App Test 27 Part 2 renders Shakespeare and accepts source alternatives', async ({ page }, testInfo) => {
  const browserLogs: string[] = []
  page.on('console', message => browserLogs.push(`[${message.type()}] ${message.text()}`))
  page.on('pageerror', error => browserLogs.push(`[pageerror] ${error.message}`))

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => {
    localStorage.removeItem('exam-reading-draft:catalog-reading-fce-b2-test27')
  })
  await page.goto(EXAM_URL, { waitUntil: 'networkidle' })
  await expect(page.locator('.fce-rw-shell')).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'Part 2' }).click()

  await expect(page.getByRole('heading', { name: 'Shakespeare: the mysteries and the facts' })).toBeVisible()
  await expect(page.getByTestId('fce-part2-example')).toContainText('Example: ALSO')
  await expect(page.locator('.ket-rw-paragraph').filter({ hasText: 'William Shakespeare' }).first()).toBeVisible()

  const gapInputs = page.locator('input[aria-label^="Gap "]')
  await expect(gapInputs).toHaveCount(8)
  const inputCount = await gapInputs.count()
  for (const [number, answer] of answers) {
    await page.getByLabel(`Gap ${number}`).fill(answer)
  }

  await page.screenshot({ path: screenshotPath, fullPage: true })
  await page.getByRole('button', { name: 'Submit exam' }).click()
  await expect(page.getByRole('dialog', { name: 'Nộp bài Reading & Writing?' })).toBeVisible()
  await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click()

  await expect(page.getByText('Báo cáo kết quả')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText('8', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('8/52', { exact: true })).toBeVisible()

  const evidence = {
    capturedAt: new Date().toISOString(),
    examUrl: EXAM_URL,
    title: 'Shakespeare: the mysteries and the facts',
    example: 'ALSO',
    inputCount,
    submittedAnswers: Object.fromEntries(answers),
    expectedScore: '8/52',
    browserLogs,
    screenshotPath,
  }
  const evidenceBody = `${JSON.stringify(evidence, null, 2)}\n`
  await fs.writeFile(evidencePath, evidenceBody, 'utf8')
  await testInfo.attach('task1-runtime-evidence', {
    body: evidenceBody,
    contentType: 'application/json',
  })
})
