import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://slider.andresclua.com',
  vite: {
    resolve: {
      alias: {
        '@acslider/core': new URL('../core/src/index.ts', import.meta.url).pathname,
        '@acslider/plugins': new URL('../plugins/src/index.ts', import.meta.url).pathname,
        '@acslider/effects': new URL('../effects/src/index.ts', import.meta.url).pathname,
        '@acslider/webgl': new URL('../webgl/src/index.ts', import.meta.url).pathname,
      },
    },
  },
})
