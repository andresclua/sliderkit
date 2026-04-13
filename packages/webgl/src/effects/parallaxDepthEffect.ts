import { BaseEffect } from './BaseEffect'
import type { ParallaxDepthEffectOptions } from '../types'
import type { WebGLRendererContext } from '../types'
import { logger } from '@acslider/core'

export class ParallaxDepthEffect extends BaseEffect {
  readonly name = 'parallaxDepth'
  private options: ParallaxDepthEffectOptions
  private uDepth: WebGLUniformLocation | null = null
  private uMouse: WebGLUniformLocation | null = null
  private mouseX = 0
  private mouseY = 0
  private canvas: HTMLCanvasElement | null = null
  private mouseMoveHandler: ((e: MouseEvent) => void) | null = null

  constructor(options: ParallaxDepthEffectOptions = {}) {
    super()
    this.options = options
  }

  get fragmentShader(): string {
    return `
      precision highp float;
      uniform sampler2D uTexture;
      uniform float uDepth;
      uniform vec2 uMouse;
      varying vec2 vUv;

      void main() {
        vec2 parallaxOffset = uMouse * uDepth * 0.05;
        vec2 uv = clamp(vUv + parallaxOffset, 0.0, 1.0);
        gl_FragColor = texture2D(uTexture, uv);
      }
    `
  }

  init(renderer: WebGLRendererContext): void {
    super.init(renderer)
    this.canvas = renderer.canvas
    if (!this.gl) return
    try {
      this.program = this.createProgram(this.vertexShader, this.fragmentShader)
      if (this.program) {
        this.uDepth = this.gl.getUniformLocation(this.program, 'uDepth')
        this.uMouse = this.gl.getUniformLocation(this.program, 'uMouse')
      }
    } catch (err) {
      logger.error('Shader compilation failed:', err)
    }

    this.mouseMoveHandler = (e: MouseEvent) => {
      const rect = this.canvas?.getBoundingClientRect()
      if (!rect) return
      this.mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      this.mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    }
    document.addEventListener('mousemove', this.mouseMoveHandler)
  }

  update(_time: number): void {
    if (!this.gl || !this.program) return
    this.gl.useProgram(this.program)
    if (this.uDepth) this.gl.uniform1f(this.uDepth, this.options.depth ?? 0.1)
    if (this.uMouse) this.gl.uniform2f(this.uMouse, this.mouseX, this.mouseY)
  }

  destroy(): void {
    if (this.mouseMoveHandler) {
      document.removeEventListener('mousemove', this.mouseMoveHandler)
      this.mouseMoveHandler = null
    }
    super.destroy()
  }
}

export function parallaxDepthEffect(options: ParallaxDepthEffectOptions = {}): ParallaxDepthEffect {
  return new ParallaxDepthEffect(options)
}
