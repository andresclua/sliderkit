import { BaseEffect } from './BaseEffect'
import type { RGBShiftEffectOptions } from '../types'
import type { WebGLRendererContext } from '../types'
import { logger } from '@acslider/core'

export class RGBShiftEffect extends BaseEffect {
  readonly name = 'rgbShift'
  private options: RGBShiftEffectOptions
  private uProgress: WebGLUniformLocation | null = null
  private uAmount: WebGLUniformLocation | null = null
  private uAngle: WebGLUniformLocation | null = null

  constructor(options: RGBShiftEffectOptions = {}) {
    super()
    this.options = options
  }

  get fragmentShader(): string {
    return `
      precision highp float;
      uniform sampler2D uTexture1;
      uniform sampler2D uTexture2;
      uniform float uProgress;
      uniform float uAmount;
      uniform float uAngle;
      varying vec2 vUv;

      void main() {
        float amount = uAmount * uProgress * (1.0 - uProgress) * 4.0;
        vec2 offset = amount * vec2(cos(uAngle), sin(uAngle));
        vec4 r1 = texture2D(uTexture1, vUv + offset);
        vec4 g1 = texture2D(uTexture1, vUv);
        vec4 b1 = texture2D(uTexture1, vUv - offset);
        vec4 t1 = vec4(r1.r, g1.g, b1.b, 1.0);
        vec4 t2 = texture2D(uTexture2, vUv);
        gl_FragColor = mix(t1, t2, uProgress);
      }
    `
  }

  init(renderer: WebGLRendererContext): void {
    super.init(renderer)
    if (!this.gl) return
    try {
      this.program = this.createProgram(this.vertexShader, this.fragmentShader)
      if (this.program) {
        this.uProgress = this.gl.getUniformLocation(this.program, 'uProgress')
        this.uAmount = this.gl.getUniformLocation(this.program, 'uAmount')
        this.uAngle = this.gl.getUniformLocation(this.program, 'uAngle')
      }
    } catch (err) {
      logger.error('Shader compilation failed:', err)
    }
  }

  update(progress: number): void {
    if (!this.gl || !this.program) return
    this.gl.useProgram(this.program)
    if (this.uProgress) this.gl.uniform1f(this.uProgress, progress)
    if (this.uAmount) this.gl.uniform1f(this.uAmount, this.options.amount ?? 0.02)
    if (this.uAngle) this.gl.uniform1f(this.uAngle, this.options.angle ?? 0)
  }
}

export function rgbShiftEffect(options: RGBShiftEffectOptions = {}): RGBShiftEffect {
  return new RGBShiftEffect(options)
}
