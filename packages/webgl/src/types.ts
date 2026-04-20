export interface PreloadConfig {
  slides:        string[]
  displacement?: string
}

export interface WebGLAssets {
  images:        HTMLImageElement[]
  displacement?: HTMLImageElement
}

export type BuiltinEffect = 'displacement' | 'rgb-shift' | 'radial'

export interface WebGLOptions {
  effect:     BuiltinEffect | 'custom'
  assets:     WebGLAssets
  duration?:  number
  intensity?: number
  easing?:    (t: number) => number
  frag?:      string
  uniforms?:  Record<string, unknown | (() => unknown)>
}
