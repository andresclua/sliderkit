import { BaseEffect } from './BaseEffect'
import type { PixelDissolveEffectOptions } from '../types'
import type { WebGLRendererContext } from '../types'
import { logger } from '@acslider/core'

export class PixelDissolveEffect extends BaseEffect {
  readonly name = 'pixelDissolve'
  private options: PixelDissolveEffectOptions
  private uProgress: WebGLUniformLocation | null = null
  private uPixelSize: WebGLUniformLocation | null = null
  private uResolution: WebGLUniformLocation | null = null
  private width = 0
  private height = 0

  constructor(options: PixelDissolveEffectOptions = {}) {
    super()
    this.options = options
  }

  get fragmentShader(): string {
    return `
      precision highp float;
      uniform sampler2D uTexture1;
      uniform sampler2D uTexture2;
      uniform float uProgress;
      uniform float uPixelSize;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float random(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 pixelUv = floor(vUv * uResolution / uPixelSize) * uPixelSize / uResolution;
        float r = random(pixelUv);
        float threshold = uProgress;
        float edge = 0.02;
        if (r < threshold - edge) {
          gl_FragColor = texture2D(uTexture2, vUv);
        } else if (r < threshold + edge) {
          float t = (r - (threshold - edge)) / (edge * 2.0);
          gl_FragColor = mix(texture2D(uTexture1, vUv), texture2D(uTexture2, vUv), t);
        } else {
          gl_FragColor = texture2D(uTexture1, vUv);
        }
      }
    `
  }

  init(renderer: WebGLRendererContext): void {
    super.init(renderer)
    this.width = renderer.width
    this.height = renderer.height
    if (!this.gl) return
    try {
      this.program = this.createProgram(this.vertexShader, this.fragmentShader)
      if (this.program) {
        this.uProgress = this.gl.getUniformLocation(this.program, 'uProgress')
        this.uPixelSize = this.gl.getUniformLocation(this.program, 'uPixelSize')
        this.uResolution = this.gl.getUniformLocation(this.program, 'uResolution')
      }
    } catch (err) {
      logger.error('Shader compilation failed:', err)
    }
  }

  update(progress: number): void {
    if (!this.gl || !this.program) return
    this.gl.useProgram(this.program)
    if (this.uProgress) this.gl.uniform1f(this.uProgress, progress)
    if (this.uPixelSize) this.gl.uniform1f(this.uPixelSize, this.options.pixelSize ?? 20)
    if (this.uResolution) this.gl.uniform2f(this.uResolution, this.width, this.height)
  }
}

export function pixelDissolveEffect(options: PixelDissolveEffectOptions = {}): PixelDissolveEffect {
  return new PixelDissolveEffect(options)
}
