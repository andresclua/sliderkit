import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@acslider/core': resolve(__dirname, '../packages/core/src/index.ts'),
      '@acslider/plugins': resolve(__dirname, '../packages/plugins/src/index.ts'),
      '@acslider/effects': resolve(__dirname, '../packages/effects/src/index.ts'),
      '@acslider/webgl': resolve(__dirname, '../packages/webgl/src/index.ts'),
    },
  },
})
