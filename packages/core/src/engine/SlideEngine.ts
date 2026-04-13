import { clamp, mod } from '../utils/math'

export type GoToTarget = number | 'next' | 'prev' | 'first' | 'last'

export interface SlideEngineState {
  activeIndex: number
  previousIndex: number
  slideCount: number
  slidesPerPage: number
  loop: boolean
  rewind: boolean
}

export class SlideEngine {
  activeIndex: number
  previousIndex: number
  readonly slideCount: number
  private slidesPerPage: number
  private loop: boolean
  private rewind: boolean

  constructor(state: SlideEngineState) {
    this.activeIndex = state.activeIndex
    this.previousIndex = state.previousIndex
    this.slideCount = state.slideCount
    this.slidesPerPage = state.slidesPerPage
    this.loop = state.loop
    this.rewind = state.rewind
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

    switch (target) {
      case 'next': {
        if (current >= last) {
          if (this.loop) return 0
          if (this.rewind) return 0
          return null
        }
        return current + 1
      }
      case 'prev': {
        if (current <= 0) {
          if (this.loop) return last
          if (this.rewind) return last
          return null
        }
        return current - 1
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

  update(slidesPerPage: number): void {
    this.slidesPerPage = slidesPerPage
    // Clamp activeIndex after layout changes
    const last = Math.max(this.slideCount - this.slidesPerPage, 0)
    if (this.activeIndex > last) {
      this.activeIndex = last
    }
  }
}
