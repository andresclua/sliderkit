import type { SliderOptions } from '../types/options'
import type { EventBus } from '../events/EventBus'
import type { SliderEventMap, SliderInstance } from '../types/events'

interface DragState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  isDragging: boolean
  baseX: number
  baseY: number
}

function parseTranslate(el: HTMLElement): { x: number; y: number } {
  const match = el.style.transform.match(/translate3d\((-?[\d.]+)px,\s*(-?[\d.]+)px/)
  if (!match) return { x: 0, y: 0 }
  return { x: parseFloat(match[1]), y: parseFloat(match[2]) }
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
    baseX: 0,
    baseY: 0,
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
    const base = parseTranslate(this.slider.wrapper)
    this.state = {
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      isDragging: true,
      baseX: base.x,
      baseY: base.y,
    }

    // Disable transition during drag for immediate follow
    this.slider.wrapper.style.transition = 'none'

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

    // Move wrapper live with the cursor
    if (isHorizontal) {
      this.slider.wrapper.style.transform = `translate3d(${this.state.baseX + delta}px, 0px, 0px)`
    } else {
      this.slider.wrapper.style.transform = `translate3d(0px, ${this.state.baseY + delta}px, 0px)`
    }

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

    // Restore transition before snap
    const info = this.slider.getInfo() as Record<string, unknown>
    const speed = (info.speed as number) ?? 300
    this.slider.wrapper.style.transition = `transform ${speed}ms ease`

    this.eventBus.emit('dragEnd', { event: e, slider: this.slider })

    if (Math.abs(delta) >= threshold) {
      // Commit — goTo will call applyLayout which sets the final transform
      this.onSlideChange(delta < 0 ? 'next' : 'prev')
    } else {
      // Snap back to original position
      this.slider.wrapper.style.transform = `translate3d(${this.state.baseX}px, ${this.state.baseY}px, 0px)`
    }
  }
}
