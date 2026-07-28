#!/usr/bin/env node
/**
 * Run skill driver for ryan-english web app.
 *
 * Usage:
 *   node driver.mjs [url] [session-dir]
 *
 * Launches headless Chromium, navigates to the app, takes a full-page
 * screenshot, captures console errors, and writes a report.
 *
 * Defaults: url=http://localhost:5173  session-dir=./.run-session
 *
 * The session directory gets:
 *   screenshot.png   — full-page PNG
 *   console.log      — all console messages (log, warn, error)
 *   report.json      — summary (ok, errors, url, timestamp)
 */

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { URL } from 'url';

const TARGET_URL = process.argv[2] || 'http://localhost:5173';
const SESSION = resolve(process.argv[3] || '.run-session');
const { port: PORT } = new URL(TARGET_URL);

mkdirSync(SESSION, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});

const page = await context.newPage();
const consoleLogs = [];

page.on('console', msg => {
  consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
});

page.on('pageerror', err => {
  consoleLogs.push(`[pageerror] ${err.message}`);
});

try {
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
  // Give React a beat to hydrate
  await page.waitForTimeout(2000);

  // Full-page screenshot
  await page.screenshot({ path: `${SESSION}/screenshot.png`, fullPage: true });

  // Also screenshot the viewport (what the user sees first)
  await page.screenshot({ path: `${SESSION}/screenshot-viewport.png` });

  // Dump console
  writeFileSync(`${SESSION}/console.log`, consoleLogs.join('\n'), 'utf8');

  // Check for the login form / app shell
  const html = await page.content();
  const hasLogin = html.includes('login') || html.includes('Đăng nhập');
  const hasError = consoleLogs.some(l => l.startsWith('[error]') || l.startsWith('[pageerror]'));

  const report = {
    ok: !hasError,
    url: TARGET_URL,
    timestamp: new Date().toISOString(),
    hasLoginPage: hasLogin,
    consoleErrors: consoleLogs.filter(l => l.startsWith('[error]') || l.startsWith('[pageerror]')),
    consoleLogCount: consoleLogs.length,
  };

  writeFileSync(`${SESSION}/report.json`, JSON.stringify(report, null, 2), 'utf8');

  console.log(`\n✓ Screenshot: ${SESSION}/screenshot.png`);
  console.log(`✓ Console:   ${SESSION}/console.log`);
  console.log(`✓ Report:    ${SESSION}/report.json`);
  if (report.consoleErrors.length) {
    console.log(`⚠ Errors:    ${report.consoleErrors.length}`);
    report.consoleErrors.forEach(e => console.log(`  ${e}`));
  } else {
    console.log(`✓ Errors:    none`);
  }
} catch (err) {
  console.error(`✗ Driver failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
