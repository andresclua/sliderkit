import type { SliderOptions } from '../types/options'

export class LoopManager {
  private wrapper: HTMLElement
  private slides: HTMLElement[]
  private options: SliderOptions
  private clones: HTMLElement[] = []

  constructor(wrapper: HTMLElement, slides: HTMLElement[], options: SliderOptions) {
    this.wrapper = wrapper
    this.slides = slides
    this.options = options
  }

  get cloneCount(): number {
    return this.clones.length
  }

  /** Number of clones prepended before the first real slide */
  get clonesBefore(): number {
    if (!this.options.loop) return 0
    return (this.options.slidesPerPage as number) || 1
  }

  init(): void {
    if (!this.options.loop) return
    this.createClones()
  }

  destroy(): void {
    this.clones.forEach((clone) => clone.remove())
    this.clones = []
  }

  private createClones(): void {
    const slidesPerPage = (this.options.slidesPerPage as number) || 1

    // Clone slides at the end (prepended) and beginning (appended)
    const clonesBefore = this.slides.slice(-slidesPerPage)
    const clonesAfter = this.slides.slice(0, slidesPerPage)

    clonesBefore.forEach((slide) => {
      const clone = slide.cloneNode(true) as HTMLElement
      clone.setAttribute('aria-hidden', 'true')
      clone.classList.add('c--slider-a__item--clone')
      this.wrapper.insertBefore(clone, this.wrapper.firstChild)
      this.clones.push(clone)
    })

    clonesAfter.forEach((slide) => {
      const clone = slide.cloneNode(true) as HTMLElement
      clone.setAttribute('aria-hidden', 'true')
      clone.classList.add('c--slider-a__item--clone')
      this.wrapper.appendChild(clone)
      this.clones.push(clone)
    })
  }
}
