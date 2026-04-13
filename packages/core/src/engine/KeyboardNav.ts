import type { SliderOptions } from '../types/options'

export class KeyboardNav {
  private el: HTMLElement
  private options: SliderOptions
  private onNext: () => void
  private onPrev: () => void
  private boundKeyDown: (e: KeyboardEvent) => void

  constructor(
    el: HTMLElement,
    options: SliderOptions,
    onNext: () => void,
    onPrev: () => void
  ) {
    this.el = el
    this.options = options
    this.onNext = onNext
    this.onPrev = onPrev
    this.boundKeyDown = this.onKeyDown.bind(this)
  }

  init(): void {
    this.el.setAttribute('tabindex', '0')
    this.el.addEventListener('keydown', this.boundKeyDown)
  }

  destroy(): void {
    this.el.removeEventListener('keydown', this.boundKeyDown)
    this.el.removeAttribute('tabindex')
  }

  private onKeyDown(e: KeyboardEvent): void {
    const isHorizontal = this.options.direction !== 'vertical'

    switch (e.key) {
      case 'ArrowRight':
        if (isHorizontal) {
          e.preventDefault()
          this.onNext()
        }
        break
      case 'ArrowLeft':
        if (isHorizontal) {
          e.preventDefault()
          this.onPrev()
        }
        break
      case 'ArrowDown':
        if (!isHorizontal) {
          e.preventDefault()
          this.onNext()
        }
        break
      case 'ArrowUp':
        if (!isHorizontal) {
          e.preventDefault()
          this.onPrev()
        }
        break
      case 'Enter':
      case ' ':
        // Let plugins handle enter/space (e.g. play/pause)
        break
    }
  }
}
