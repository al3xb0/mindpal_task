import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', 'tests/**', 'supabase/**'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/hooks/**', 'src/components/**'],
      exclude: ['src/test/**', 'src/**/__tests__/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
