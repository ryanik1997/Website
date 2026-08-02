import { chromium } from 'playwright'
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1366,height:768}})
await page.goto('http://127.0.0.1:5173/app/exam/reading/catalog-reading-cae-c1-test1');await page.waitForSelector('.cae-rw-shell');await page.locator('.ket-rw-footer__part-tab').nth(6).click()
const snap=async label=>console.log(label,await page.locator('.pet-rw-drag__slot--inline').evaluateAll(ns=>ns.map(n=>({aria:n.getAttribute('aria-label'),text:n.textContent}))))
const option=id=>page.locator(`[data-cae-part7-option="${id}"]`);const gap=n=>page.getByRole('button',{name:new RegExp(`^Gap ${n},`)}).first();
await snap('start');await option('A').dragTo(gap(41));await page.waitForTimeout(100);await snap('afterA');await option('B').dragTo(gap(42));await page.waitForTimeout(100);await snap('afterB');await gap(41).dragTo(gap(43));await page.waitForTimeout(100);await snap('afterMove');
await browser.close()
