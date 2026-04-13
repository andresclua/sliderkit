export type WebGLMode = 'transition' | 'permanent'

export interface WebGLRendererOptions {
  mode?: WebGLMode
  effect?: WebGLEffect
  fallback?: string
  dpr?: number
}

export interface WebGLEffect {
  readonly name: string
  readonly fragmentShader: string
  readonly vertexShader?: string
  readonly uniforms?: Record<string, { value: unknown }>
  init?(renderer: WebGLRendererContext): void
  update?(progress: number): void
  destroy?(): void
}

export interface WebGLRendererContext {
  gl: WebGLRenderingContext | null
  canvas: HTMLCanvasElement | null
  width: number
  height: number
}

export interface DisplacementEffectOptions {
  map?: string
  intensity?: number
  duration?: number
  easing?: string
}

export interface RGBShiftEffectOptions {
  amount?: number
  angle?: number
  duration?: number
}

export interface PixelDissolveEffectOptions {
  pixelSize?: number
  duration?: number
}

export interface ParallaxDepthEffectOptions {
  depth?: number
  perspective?: number
}
