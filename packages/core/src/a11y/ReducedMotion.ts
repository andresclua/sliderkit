import { prefersReducedMotion } from '../ssr/guards'

export class ReducedMotion {
  private mediaQuery: MediaQueryList | null = null
  private listeners: Array<(reduced: boolean) => void> = []
  private boundHandleChange: (e: MediaQueryListEvent) => void

  constructor() {
    this.boundHandleChange = this.handleChange.bind(this)
  }

  init(): void {
    if (typeof window === 'undefined') return
    this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.mediaQuery.addEventListener('change', this.boundHandleChange)
  }

  destroy(): void {
    this.mediaQuery?.removeEventListener('change', this.boundHandleChange)
    this.mediaQuery = null
    this.listeners = []
  }

  isReduced(): boolean {
    return prefersReducedMotion()
  }

  onReducedMotionChange(cb: (reduced: boolean) => void): void {
    this.listeners.push(cb)
  }

  private handleChange(e: MediaQueryListEvent): void {
    this.listeners.forEach((cb) => cb(e.matches))
  }
}

