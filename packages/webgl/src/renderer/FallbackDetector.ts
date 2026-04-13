import { isBrowser } from '@acslider/core'

export function isWebGLSupported(): boolean {
  if (!isBrowser()) return false
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch {
    return false
  }
}

export function isWebGL2Supported(): boolean {
  if (!isBrowser()) return false
  try {
    const canvas = document.createElement('canvas')
    return !!canvas.getContext('webgl2')
  } catch {
    return false
  }
}
