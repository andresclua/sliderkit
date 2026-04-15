import { clamp, mod } from '../utils/math'

export type GoToTarget = number | 'next' | 'prev' | 'first' | 'last'

export interface SlideEngineState {
  activeIndex: number
  previousIndex: number
  slideCount: number
  slidesPerPage: number
  loop: boolean
  rewind: boolean
  slideBy: number
}

export class SlideEngine {
  activeIndex: number
  previousIndex: number
  readonly slideCount: number
  private slidesPerPage: number
  private loop: boolean
  private rewind: boolean
  private slideBy: number

  constructor(state: SlideEngineState) {
    this.activeIndex = state.activeIndex
    this.previousIndex = state.previousIndex
    this.slideCount = state.slideCount
    this.slidesPerPage = state.slidesPerPage
    this.loop = state.loop
    this.rewind = state.rewind
    this.slideBy = state.slideBy
  }

  get isBeginning(): boolean {
    return this.activeIndex === 0
  }

  get isEnd(): boolean {
    return this.activeIndex >= this.slideCount - this.slidesPerPage
  }

  get progress(): number {
    const maxIndex = Math.max(this.slideCount - this.slidesPerPage, 1)
    return clamp(this.activeIndex / maxIndex, 0, 1)
  }

  resolve(target: GoToTarget): number | null {
    const current = this.activeIndex
    const last = Math.max(this.slideCount - this.slidesPerPage, 0)
    const step = this.slideBy

    switch (target) {
      case 'next': {
        const next = Math.min(current + step, last)
        if (current >= last) {
          if (this.loop) return 0
          if (this.rewind) return 0
          return null
        }
        return next
      }
      case 'prev': {
        const prev = Math.max(current - step, 0)
        if (current <= 0) {
          if (this.loop) return last
          if (this.rewind) return last
          return null
        }
        return prev
      }
      case 'first':
        return 0
      case 'last':
        return last
      default: {
        const index = Number(target)
        if (!Number.isInteger(index)) return null
        if (this.loop) {
          return mod(index, this.slideCount)
        }
        return clamp(index, 0, last)
      }
    }
  }

  commit(index: number): void {
    this.previousIndex = this.activeIndex
    this.activeIndex = index
  }

  update(slidesPerPage: number, slideBy?: number): void {
    this.slidesPerPage = slidesPerPage
    if (slideBy !== undefined) this.slideBy = slideBy
    // Clamp activeIndex after layout changes
    const last = Math.max(this.slideCount - this.slidesPerPage, 0)
    if (this.activeIndex > last) {
      this.activeIndex = last
    }
  }
}
