import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ryan/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@ryan/db': path.resolve(__dirname, '../../packages/db/src/index.ts'),
      '@ryan/catalog': path.resolve(__dirname, '../../packages/catalog/src/index.ts'),
      '@ryan/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/testSetup.ts',
  },
})
