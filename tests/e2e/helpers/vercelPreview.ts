import type { Browser, BrowserContext, Page } from 'playwright'

/** Create a Preview browser context using Vercel's test-only automation bypass.
 * The secret must come from the local/CI environment and is never logged.
 */
export async function openVercelPreview(browser: Browser, previewUrl: string): Promise<{ context: BrowserContext; page: Page }> {
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  if (!bypass) throw new Error('VERCEL_AUTOMATION_BYPASS_SECRET is not configured')
  const context = await browser.newContext({ extraHTTPHeaders: { 'x-vercel-protection-bypass': bypass } })
  const page = await context.newPage()
  await page.goto(previewUrl, { waitUntil: 'domcontentloaded' })
  const body = await page.locator('body').innerText().catch(() => '')
  if (/vercel\.com\/(login|sso|auth)|security checkpoint|failed to verify/i.test(`${page.url()}\n${body}`)) {
    await context.close()
    throw new Error('Preview is still blocked by Vercel Deployment Protection')
  }
  return { context, page }
}
