import type { SliderInstance } from '@acslider/core'
import type { WebGLEffect } from '../types'
import { WebGLRenderer } from '../renderer/WebGLRenderer'

export class PermanentMode {
  private renderer: WebGLRenderer
  private effect: WebGLEffect
  private slider: SliderInstance

  constructor(renderer: WebGLRenderer, effect: WebGLEffect, slider: SliderInstance) {
    this.renderer = renderer
    this.effect = effect
    this.slider = slider
  }

  init(): void {
    if (!this.renderer.isSupported()) return

    const ctx = {
      gl: this.renderer.gl,
      canvas: this.renderer.canvasManager.canvas,
      width: this.renderer.canvasManager.canvas.width,
      height: this.renderer.canvasManager.canvas.height,
    }

    this.effect.init?.(ctx)

    // Render loop
    this.renderer.requestFrame((time) => {
      this.effect.update?.(time / 1000)
    })

    this.slider.container.classList.add('c--slider-a--webgl')
  }

  destroy(): void {
    this.renderer.cancelFrame()
    this.effect.destroy?.()
    this.slider.container.classList.remove('c--slider-a--webgl')
  }
}
