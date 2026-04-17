import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://slider.andresclua.com',
  vite: {
    optimizeDeps: {
      exclude: ['vue', 'svelte'],
    },
    resolve: {
      alias: {
        // SliderKit aliases
        '@andresclua/sliderkit':         new URL('../core/src/index.ts', import.meta.url).pathname,
        '@andresclua/sliderkit-plugins':  new URL('../plugins/src/index.ts', import.meta.url).pathname,
        '@andresclua/sliderkit-effects':  new URL('../effects/src/index.ts', import.meta.url).pathname,
        '@andresclua/sliderkit-webgl':    new URL('../webgl/src/index.ts', import.meta.url).pathname,
      },
    },
  },
})
