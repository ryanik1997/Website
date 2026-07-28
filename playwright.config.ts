import { defineConfig } from 'playwright/test'

export default defineConfig({
  testDir: './apps/web/e2e',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:5173',
    viewport: { width: 1440, height: 1000 },
    actionTimeout: 10000,
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER === '1'
    ? undefined
    : {
        command: process.env.PLAYWRIGHT_DEV_AUTH_BYPASS === '1'
          ? 'VITE_DEV_AUTH_BYPASS=1 pnpm --filter web dev'
          : 'pnpm --filter web dev',
        port: 5173,
        reuseExistingServer: true,
        timeout: 30000,
      },
})
