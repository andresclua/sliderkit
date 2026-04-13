import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    name: 'effects',
    environment: 'jsdom',
    globals: true,
    include: ['__tests__/**/*.test.ts'],
  },
  resolve: {
    alias: { '@acslider/core': resolve(__dirname, '../core/src/index.ts') },
  },
})
