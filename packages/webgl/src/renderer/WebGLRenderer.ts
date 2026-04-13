import { CanvasManager } from './CanvasManager'
import { TextureLoader } from './TextureLoader'
import { isWebGLSupported } from './FallbackDetector'
import { logger } from '@acslider/core'

export interface WebGLRendererConfig {
  container: HTMLElement
  dpr?: number
  existingCanvas?: HTMLCanvasElement | null
}

export class WebGLRenderer {
  gl: WebGLRenderingContext | null = null
  canvasManager: CanvasManager
  textureLoader: TextureLoader | null = null
  private rafId: number | null = null
  private supported: boolean

  constructor(config: WebGLRendererConfig) {
    this.supported = isWebGLSupported()

    this.canvasManager = new CanvasManager(config.container, config.existingCanvas)

    if (!this.supported) {
      logger.error('WebGL not supported. Falling back to CSS effect "fade".')
      return
    }

    const gl = this.canvasManager.canvas.getContext('webgl')
    if (!gl) {
      logger.error('Failed to get WebGL context.')
      this.supported = false
      return
    }

    this.gl = gl
    this.textureLoader = new TextureLoader(gl)
    this.canvasManager.resize(config.dpr ?? Math.min(window.devicePixelRatio, 2))
  }

  isSupported(): boolean {
    return this.supported
  }

  requestFrame(callback: (time: number) => void): void {
    const loop = (time: number) => {
      callback(time)
      this.rafId = requestAnimationFrame(loop)
    }
    this.rafId = requestAnimationFrame(loop)
  }

  cancelFrame(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  destroy(): void {
    this.cancelFrame()
    this.textureLoader?.destroyAll()

    if (this.gl) {
      const ext = this.gl.getExtension('WEBGL_lose_context')
      if (ext) ext.loseContext()
      this.gl = null
    }

    this.canvasManager.destroy()
  }
}
