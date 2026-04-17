import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SliderKitWebGL',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.umd.js'),
    },
    rollupOptions: {
      external: ['@andresclua/sliderkit', 'gsap'],
      output: {
        globals: {
          '@andresclua/sliderkit': 'SliderKitCore',
          'gsap': 'gsap',
        },
      },
    },
    minify: true,
    sourcemap: true,
  },
  plugins: [dts({ insertTypesEntry: true, outDir: 'dist' })],
  resolve: {
    alias: { '@andresclua/sliderkit': resolve(__dirname, '../core/src/index.ts') },
  },
  assetsInclude: ['**/*.vert', '**/*.frag', '**/*.glsl'],
})
