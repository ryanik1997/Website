import { defineConfig } from 'playwright/test'

export default defineConfig({
  testDir: './apps/web/e2e',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1440, height: 1000 },
    actionTimeout: 10000,
  },
  webServer: {
    command: 'pnpm --filter web dev',
    port: 5173,
    reuseExistingServer: true,
    timeout: 30000,
  },
})
