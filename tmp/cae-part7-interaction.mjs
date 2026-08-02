import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const rows = []
for (const n of [1, 2, 12, 23]) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } })
  const page = await context.newPage()
  const errors = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  page.on('pageerror', err => errors.push(err.message))
  await page.goto(`http://127.0.0.1:5173/app/exam/reading/catalog-reading-cae-c1-test${n}`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.cae-rw-shell')
  await page.locator('.ket-rw-footer__part-tab').nth(6).click()
  const option = id => page.locator(`[data-cae-part7-option="${id}"]`)
  const gap = number => page.getByRole('button', { name: new RegExp(`^Gap ${number},`) }).first()
  const drag = async (source, target) => {
    await source.evaluate((sourceNode, targetNode) => {
      const transfer = new DataTransfer()
      sourceNode.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: transfer }))
      targetNode.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: transfer }))
      targetNode.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: transfer }))
      targetNode.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }))
      sourceNode.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer: transfer }))
    }, await target.elementHandle())
    await page.waitForTimeout(30)
  }

  await drag(option('A'), gap(41))
  await drag(option('B'), gap(42))
  await drag(gap(41), gap(43))
  await page.getByRole('button', { name: 'Clear gap 42' }).click()
  await page.locator('.ket-rw-footer__part-tab').nth(5).click()
  await page.locator('.ket-rw-footer__part-tab').nth(6).click()

  const text41 = (await gap(41).textContent())?.trim() ?? ''
  const text42 = (await gap(42).textContent())?.trim() ?? ''
  const text43 = (await gap(43).textContent())?.trim() ?? ''
  const usedA = await option('A').evaluate(node => node.classList.contains('is-used'))
  const usedB = await option('B').evaluate(node => node.classList.contains('is-used'))
  rows.push({ test: n, text41, text42, text43, usedA, usedB, consoleErrors: errors.length, errors })
  await context.close()
}
console.log(JSON.stringify(rows, null, 2))
await browser.close()
