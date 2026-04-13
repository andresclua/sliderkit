import type { WebGLEffect, WebGLRendererContext } from '../types'

export abstract class BaseEffect implements WebGLEffect {
  abstract readonly name: string

  get vertexShader(): string {
    return `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `
  }

  abstract get fragmentShader(): string

  get uniforms(): Record<string, { value: unknown }> {
    return {}
  }

  protected program: WebGLProgram | null = null
  protected gl: WebGLRenderingContext | null = null

  init(renderer: WebGLRendererContext): void {
    this.gl = renderer.gl
  }

  update(_progress: number): void {
    // Override in subclasses
  }

  destroy(): void {
    if (this.gl && this.program) {
      this.gl.deleteProgram(this.program)
      this.program = null
    }
    this.gl = null
  }

  protected compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null
    const shader = this.gl.createShader(type)
    if (!shader) return null
    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader)
      const shaderType = type === this.gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'
      throw new Error(`${shaderType} shader error: ${info ?? 'unknown'}`)
    }
    return shader
  }

  protected createProgram(vertSrc: string, fragSrc: string): WebGLProgram | null {
    if (!this.gl) return null
    const vert = this.compileShader(this.gl.VERTEX_SHADER, vertSrc)
    const frag = this.compileShader(this.gl.FRAGMENT_SHADER, fragSrc)
    if (!vert || !frag) return null

    const prog = this.gl.createProgram()
    if (!prog) return null

    this.gl.attachShader(prog, vert)
    this.gl.attachShader(prog, frag)
    this.gl.linkProgram(prog)

    if (!this.gl.getProgramParameter(prog, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(prog)
      throw new Error(`Shader link error: ${info ?? 'unknown'}`)
    }

    this.gl.deleteShader(vert)
    this.gl.deleteShader(frag)

    return prog
  }
}
