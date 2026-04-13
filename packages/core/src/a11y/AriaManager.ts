import type { A11yOptions } from '../types/options'
import { setAttr, removeAttr } from '../utils/dom'

export class AriaManager {
  private container: HTMLElement
  private wrapper: HTMLElement
  private slides: HTMLElement[]
  private options: A11yOptions
  private liveRegion: HTMLElement | null = null

  constructor(
    container: HTMLElement,
    wrapper: HTMLElement,
    slides: HTMLElement[],
    options: A11yOptions = {}
  ) {
    this.container = container
    this.wrapper = wrapper
    this.slides = slides
    this.options = options
  }

  init(): void {
    if (this.options.enabled === false) return

    // Container
    setAttr(this.container, 'role', 'region')
    setAttr(this.container, 'aria-roledescription', 'carousel')

    // Wrapper
    setAttr(this.wrapper, 'aria-live', 'polite')

    // Slides
    this.slides.forEach((slide, index) => {
      setAttr(slide, 'role', 'group')
      setAttr(slide, 'aria-roledescription', 'slide')
      this.updateSlideLabel(slide, index)
    })

    // Live region for announcements
    this.liveRegion = document.createElement('div')
    this.liveRegion.className = 'c--slider-a__sr-only'
    setAttr(this.liveRegion, 'aria-live', 'assertive')
    setAttr(this.liveRegion, 'aria-atomic', 'true')
    this.liveRegion.style.cssText =
      'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0'
    this.container.appendChild(this.liveRegion)
  }

  update(activeIndex: number): void {
    if (this.options.enabled === false) return

    this.slides.forEach((slide, index) => {
      const isActive = index === activeIndex
      setAttr(slide, 'aria-hidden', isActive ? 'false' : 'true')
    })

    const template = this.options.slideLabel ?? '{{index}} of {{total}}'
    const announcement = template
      .replace('{{index}}', String(activeIndex + 1))
      .replace('{{total}}', String(this.slides.length))

    if (this.liveRegion) {
      this.liveRegion.textContent = announcement
    }
  }

  destroy(): void {
    removeAttr(this.container, 'role')
    removeAttr(this.container, 'aria-roledescription')
    removeAttr(this.wrapper, 'aria-live')

    this.slides.forEach((slide) => {
      removeAttr(slide, 'role')
      removeAttr(slide, 'aria-roledescription')
      removeAttr(slide, 'aria-label')
      removeAttr(slide, 'aria-hidden')
    })

    this.liveRegion?.remove()
    this.liveRegion = null
  }

  private updateSlideLabel(slide: HTMLElement, index: number): void {
    const template = this.options.slideLabel ?? '{{index}} of {{total}}'
    const label = template
      .replace('{{index}}', String(index + 1))
      .replace('{{total}}', String(this.slides.length))
    setAttr(slide, 'aria-label', label)
  }
}
