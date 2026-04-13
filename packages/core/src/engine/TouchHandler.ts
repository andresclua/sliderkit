import type { SliderOptions } from '../types/options'
import type { EventBus } from '../events/EventBus'
import type { SliderEventMap } from '../types/events'
import type { SliderInstance } from '../types/events'

interface TouchState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  startTime: number
  isTouching: boolean
  direction: 'horizontal' | 'vertical' | null
}

export class TouchHandler {
  private el: HTMLElement
  private options: SliderOptions
  private eventBus: EventBus<SliderEventMap>
  private slider: SliderInstance
  private onSlideChange: (direction: 'next' | 'prev') => void

  private state: TouchState = {
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    isTouching: false,
    direction: null,
  }

  private boundTouchStart: (e: TouchEvent) => void
  private boundTouchMove: (e: TouchEvent) => void
  private boundTouchEnd: (e: TouchEvent) => void

  constructor(
    el: HTMLElement,
    options: SliderOptions,
    eventBus: EventBus<SliderEventMap>,
    slider: SliderInstance,
    onSlideChange: (direction: 'next' | 'prev') => void
  ) {
    this.el = el
    this.options = options
    this.eventBus = eventBus
    this.slider = slider
    this.onSlideChange = onSlideChange

    this.boundTouchStart = this.onTouchStart.bind(this)
    this.boundTouchMove = this.onTouchMove.bind(this)
    this.boundTouchEnd = this.onTouchEnd.bind(this)
  }

  init(): void {
    if (!this.options.touch) return
    this.el.addEventListener('touchstart', this.boundTouchStart, { passive: true })
    this.el.addEventListener('touchmove', this.boundTouchMove, { passive: false })
    this.el.addEventListener('touchend', this.boundTouchEnd, { passive: true })
  }

  destroy(): void {
    this.el.removeEventListener('touchstart', this.boundTouchStart)
    this.el.removeEventListener('touchmove', this.boundTouchMove)
    this.el.removeEventListener('touchend', this.boundTouchEnd)
  }

  private onTouchStart(e: TouchEvent): void {
    const touch = e.touches[0]
    if (!touch) return

    this.state = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: Date.now(),
      isTouching: true,
      direction: null,
    }

    this.eventBus.emit('touchStart', { event: e, slider: this.slider })
  }

  private onTouchMove(e: TouchEvent): void {
    if (!this.state.isTouching) return
    const touch = e.touches[0]
    if (!touch) return

    this.state.currentX = touch.clientX
    this.state.currentY = touch.clientY

    const deltaX = this.state.currentX - this.state.startX
    const deltaY = this.state.currentY - this.state.startY
    const isHorizontal = this.options.direction !== 'vertical'

    if (!this.state.direction) {
      const angle = Math.abs(Math.atan2(Math.abs(deltaY), Math.abs(deltaX)) * (180 / Math.PI))
      this.state.direction = angle > (this.options.swipeAngle ?? 15) ? 'vertical' : 'horizontal'
    }

    if (this.state.direction === 'horizontal' && isHorizontal) {
      if (this.options.preventScrollOnTouch === 'force') {
        e.preventDefault()
      } else if (this.options.preventScrollOnTouch === 'auto') {
        e.preventDefault()
      }
    } else if (this.state.direction === 'vertical' && !isHorizontal) {
      if (this.options.preventScrollOnTouch !== false) {
        e.preventDefault()
      }
    }

    const delta = isHorizontal ? deltaX : deltaY

    this.eventBus.emit('touchMove', {
      event: e,
      delta,
      direction: this.state.direction ?? 'horizontal',
      slider: this.slider,
    })
  }

  private onTouchEnd(e: TouchEvent): void {
    if (!this.state.isTouching) return
    this.state.isTouching = false

    const deltaX = this.state.currentX - this.state.startX
    const deltaY = this.state.currentY - this.state.startY
    const isHorizontal = this.options.direction !== 'vertical'
    const delta = isHorizontal ? deltaX : deltaY
    const threshold = this.options.swipeThreshold ?? 50

    this.eventBus.emit('touchEnd', { event: e, slider: this.slider })

    if (Math.abs(delta) >= threshold) {
      this.onSlideChange(delta < 0 ? 'next' : 'prev')
    }

    this.state.direction = null
  }
}
