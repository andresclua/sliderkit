export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

export function safeWindow(): Window | null {
  return isBrowser() ? window : null
}

export function safeDocument(): Document | null {
  return isBrowser() ? document : null
}

export function prefersReducedMotion(): boolean {
  if (!isBrowser()) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
