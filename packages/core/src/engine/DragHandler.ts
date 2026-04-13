import type { SliderOptions } from '../types/options'
import type { EventBus } from '../events/EventBus'
import type { SliderEventMap, SliderInstance } from '../types/events'

interface DragState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  isDragging: boolean
}

export class DragHandler {
  private el: HTMLElement
  private options: SliderOptions
  private eventBus: EventBus<SliderEventMap>
  private slider: SliderInstance
  private onSlideChange: (direction: 'next' | 'prev') => void

  private state: DragState = {
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
  }

  private boundMouseDown: (e: MouseEvent) => void
  private boundMouseMove: (e: MouseEvent) => void
  private boundMouseUp: (e: MouseEvent) => void

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

    this.boundMouseDown = this.onMouseDown.bind(this)
    this.boundMouseMove = this.onMouseMove.bind(this)
    this.boundMouseUp = this.onMouseUp.bind(this)
  }

  init(): void {
    if (!this.options.mouseDrag) return
    this.el.addEventListener('mousedown', this.boundMouseDown)
    if (this.options.grabCursor) {
      this.el.style.cursor = 'grab'
    }
  }

  destroy(): void {
    this.el.removeEventListener('mousedown', this.boundMouseDown)
    document.removeEventListener('mousemove', this.boundMouseMove)
    document.removeEventListener('mouseup', this.boundMouseUp)
    this.el.style.cursor = ''
  }

  private onMouseDown(e: MouseEvent): void {
    e.preventDefault()
    this.state = {
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      isDragging: true,
    }

    document.addEventListener('mousemove', this.boundMouseMove)
    document.addEventListener('mouseup', this.boundMouseUp)

    if (this.options.grabCursor) {
      this.el.style.cursor = 'grabbing'
    }

    this.eventBus.emit('dragStart', { event: e, slider: this.slider })
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.state.isDragging) return
    this.state.currentX = e.clientX
    this.state.currentY = e.clientY

    const isHorizontal = this.options.direction !== 'vertical'
    const delta = isHorizontal
      ? this.state.currentX - this.state.startX
      : this.state.currentY - this.state.startY

    this.eventBus.emit('dragMove', {
      event: e,
      delta,
      direction: isHorizontal ? 'horizontal' : 'vertical',
      slider: this.slider,
    })
  }

  private onMouseUp(e: MouseEvent): void {
    if (!this.state.isDragging) return
    this.state.isDragging = false

    document.removeEventListener('mousemove', this.boundMouseMove)
    document.removeEventListener('mouseup', this.boundMouseUp)

    if (this.options.grabCursor) {
      this.el.style.cursor = 'grab'
    }

    const isHorizontal = this.options.direction !== 'vertical'
    const delta = isHorizontal
      ? this.state.currentX - this.state.startX
      : this.state.currentY - this.state.startY
    const threshold = this.options.swipeThreshold ?? 50

    this.eventBus.emit('dragEnd', { event: e, slider: this.slider })

    if (Math.abs(delta) >= threshold) {
      this.onSlideChange(delta < 0 ? 'next' : 'prev')
    }
  }
}
