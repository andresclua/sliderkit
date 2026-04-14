import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://slider.andresclua.com',
  vite: {
    resolve: {
      alias: {
        '@acslider/core':    new URL('../core/src/index.ts', import.meta.url).pathname,
        '@acslider/plugins': new URL('../plugins/src/index.ts', import.meta.url).pathname,
        '@acslider/effects': new URL('../effects/src/index.ts', import.meta.url).pathname,
        '@acslider/webgl':   new URL('../webgl/src/index.ts', import.meta.url).pathname,
        // New brand name aliases — point to the same source
        '@andresclua/sliderkit':         new URL('../core/src/index.ts', import.meta.url).pathname,
        '@andresclua/sliderkit-plugins':  new URL('../plugins/src/index.ts', import.meta.url).pathname,
        '@andresclua/sliderkit-effects':  new URL('../effects/src/index.ts', import.meta.url).pathname,
        '@andresclua/sliderkit-webgl':    new URL('../webgl/src/index.ts', import.meta.url).pathname,
      },
    },
  },
})
