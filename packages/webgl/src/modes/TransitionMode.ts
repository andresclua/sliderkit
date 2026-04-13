import type { SliderInstance } from '@acslider/core'
import type { WebGLEffect } from '../types'
import { WebGLRenderer } from '../renderer/WebGLRenderer'

export class TransitionMode {
  private renderer: WebGLRenderer
  private effect: WebGLEffect
  private slider: SliderInstance
  private progress: number = 0
  private animating: boolean = false

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

    this.slider.on('beforeSlideChange', () => {
      this.startTransition()
    })
  }

  private startTransition(): void {
    if (this.animating) return
    this.animating = true
    this.progress = 0

    const speed = (this.slider.getInfo() as Record<string, unknown>).speed as number ?? 300
    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = now - start
      this.progress = Math.min(elapsed / speed, 1)
      this.effect.update?.(this.progress)

      if (this.progress < 1) {
        requestAnimationFrame(animate)
      } else {
        this.animating = false
      }
    }

    requestAnimationFrame(animate)
  }

  destroy(): void {
    this.effect.destroy?.()
  }
}
