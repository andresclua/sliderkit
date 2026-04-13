import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'
import { logger } from '@acslider/core'
import { WebGLRenderer } from './renderer/WebGLRenderer'
import { TransitionMode } from './modes/TransitionMode'
import { PermanentMode } from './modes/PermanentMode'
import { isWebGLSupported } from './renderer/FallbackDetector'
import type { WebGLRendererOptions } from './types'

export function webglRenderer(options: WebGLRendererOptions = {}): SliderPlugin {
  const { mode = 'transition', effect, fallback = 'fade', dpr = Math.min(window.devicePixelRatio, 2) } = options

  let renderer: WebGLRenderer | null = null
  let activeMode: TransitionMode | PermanentMode | null = null

  return {
    name: 'webglRenderer',

    install(slider: SliderInstance) {
      if (!isWebGLSupported()) {
        logger.error(`WebGL not supported. Falling back to CSS effect "${fallback}".`)
        return
      }

      if (!effect) {
        logger.warn('webglRenderer: no effect provided. Pass an effect instance.')
        return
      }

      const existingCanvas = slider.container.querySelector<HTMLCanvasElement>('.c--slider-a__canvas')

      renderer = new WebGLRenderer({
        container: slider.container,
        dpr,
        existingCanvas,
      })

      if (mode === 'permanent') {
        activeMode = new PermanentMode(renderer, effect, slider)
      } else {
        activeMode = new TransitionMode(renderer, effect, slider)
      }

      try {
        activeMode.init()
      } catch (err) {
        logger.error('WebGL initialization failed:', err)
      }
    },

    destroy() {
      activeMode?.destroy()
      renderer?.destroy()
      renderer = null
      activeMode = null
    },
  }
}
