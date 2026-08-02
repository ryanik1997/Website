import { chromium } from 'playwright'

const BASE = 'http://localhost:5175'
const ROUTE = '/app/exam/reading/catalog-reading-ket-a2-book7-test2'

const VIEWPORTS = [
  { width: 1366, height: 768, label: '1366x768' },
  { width: 1920, height: 1080, label: '1920x1080' },
  { width: 2048, height: 1152, label: '2048x1152' },
]

async function extractSplitStyles(page) {
  const result = await page.evaluate(() => {
    const pick = (el, props) => {
      if (!el) return null
      const cs = getComputedStyle(el)
      const out = {}
      for (const p of props) out[p] = cs[p]
      const r = el.getBoundingClientRect()
      out.__rect = { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, bottom: r.bottom, left: r.left, right: r.right }
      return out
    }
    const q = s => document.querySelector(s)
    const qa = s => Array.from(document.querySelectorAll(s))
    const props = [
      'display', 'flexDirection', 'width', 'minWidth', 'maxWidth', 'height', 'minHeight',
      'border', 'borderTop', 'borderBottom', 'borderLeft', 'borderRight',
      'background', 'backgroundColor', 'cursor', 'zIndex', 'overflowX', 'overflowY',
      'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'scrollbarGutter', 'position', 'top', 'left', 'right', 'bottom', 'flex', 'flexGrow', 'flexShrink', 'flexBasis',
    ]
    return {
      shell: pick(q('.ket-rw-shell'), ['display', 'flexDirection', 'height', 'minHeight', 'overflow', 'background']),
      main: pick(q('.ket-rw-main'), ['display', 'flexDirection', 'flex', 'minHeight', 'overflow']),
      instruction: pick(q('.ket-rw-instruction'), ['display', 'padding', 'borderBottom', 'flexShrink']),
      body: pick(q('.ket-rw-body.is-split'), ['display', 'flexDirection', 'flex', 'minHeight', 'overflow', 'cursor']),
      paneLeft: pick(q('.ket-rw-pane-left'), props),
      paneRight: pick(q('.ket-rw-pane-right'), props),
      resizer: pick(q('.ket-rw-resizer'), props),
      resizerBefore: pick(q('.ket-rw-resizer::before'), ['width', 'background', 'position', 'inset']),
      grip: pick(q('.ket-rw-resizer__grip'), ['display', 'width', 'height', 'border', 'borderRadius', 'background', 'color', 'fontSize', 'position', 'zIndex', 'pointerEvents']),
      footer: pick(q('.ket-rw-footer'), ['display', 'height', 'minHeight', 'background', 'borderTop', 'flexShrink', 'padding']),
      floatingNav: pick(q('.ket-rw-floating-nav'), ['display', 'position', 'top', 'right', 'bottom', 'left', 'zIndex']),
      bodyScrollWidth: document.body.scrollWidth,
      bodyClientWidth: document.body.clientWidth,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
      splitterCount: qa('.ket-rw-resizer').length,
      paneLeftCount: qa('.ket-rw-pane-left').length,
      paneRightCount: qa('.ket-rw-pane-right').length,
      splitVar: q('.ket-rw-body.is-split')?.style.getPropertyValue('--ket-split-pct') || null,
    }
  })
  return result
}

async function run() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' })
  const out = {}
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    const errors = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(String(err)))
    await page.goto(BASE + ROUTE, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2500)
    // Navigate to Part 2 via footer part tab
    const partTab = page.locator('.ket-rw-footer__part-tab').filter({ hasText: 'Part 2' }).first()
    let part2Clicked = false
    if (await partTab.count() > 0) {
      await partTab.click()
      part2Clicked = true
    }
    await page.waitForTimeout(1500)
    const styles = await extractSplitStyles(page)
    styles.part2Clicked = part2Clicked
    styles.consoleErrors = errors
    out[vp.label] = styles
    await page.screenshot({ path: `tmp/ket-part2-${vp.label}.png`, fullPage: false })
    await page.close()
  }
  await browser.close()
  console.log(JSON.stringify(out, null, 2))
}

run().catch(e => { console.error('FATAL', e); process.exit(1) })