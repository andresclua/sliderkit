import { BaseEffect } from './BaseEffect'
import type { DisplacementEffectOptions } from '../types'
import type { WebGLRendererContext } from '../types'
import { logger } from '@acslider/core'

export class DisplacementEffect extends BaseEffect {
  readonly name = 'displacement'
  private options: DisplacementEffectOptions
  private uProgress: WebGLUniformLocation | null = null
  private uIntensity: WebGLUniformLocation | null = null

  constructor(options: DisplacementEffectOptions = {}) {
    super()
    this.options = options
  }

  get fragmentShader(): string {
    return `
      precision highp float;
      uniform sampler2D uTexture1;
      uniform sampler2D uTexture2;
      uniform sampler2D uDisplacementMap;
      uniform float uProgress;
      uniform float uIntensity;
      varying vec2 vUv;

      void main() {
        vec4 displacement = texture2D(uDisplacementMap, vUv);
        float theta = displacement.r * 2.0 * 3.14159265;
        vec2 dir = vec2(sin(theta), cos(theta));
        vec2 uv1 = vUv + dir * uIntensity * uProgress;
        vec2 uv2 = vUv + dir * uIntensity * (1.0 - uProgress);
        vec4 t1 = texture2D(uTexture1, uv1);
        vec4 t2 = texture2D(uTexture2, uv2);
        gl_FragColor = mix(t1, t2, uProgress);
      }
    `
  }

  get uniforms() {
    return {
      uIntensity: { value: this.options.intensity ?? 0.5 },
      uProgress: { value: 0.0 },
    }
  }

  init(renderer: WebGLRendererContext): void {
    super.init(renderer)
    if (!this.gl) return

    try {
      this.program = this.createProgram(this.vertexShader, this.fragmentShader)
      if (this.program) {
        this.uProgress = this.gl.getUniformLocation(this.program, 'uProgress')
        this.uIntensity = this.gl.getUniformLocation(this.program, 'uIntensity')
      }
    } catch (err) {
      logger.error('Shader compilation failed:', err)
    }
  }

  update(progress: number): void {
    if (!this.gl || !this.program) return
    this.gl.useProgram(this.program)
    if (this.uProgress) this.gl.uniform1f(this.uProgress, progress)
    if (this.uIntensity) this.gl.uniform1f(this.uIntensity, this.options.intensity ?? 0.5)
  }
}

export function displacementEffect(options: DisplacementEffectOptions = {}): DisplacementEffect {
  return new DisplacementEffect(options)
}
