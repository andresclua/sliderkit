import type { SliderOptions, BreakpointOptions } from '../types/options'
import type { EventBus } from '../events/EventBus'
import type { SliderEventMap, SliderInstance } from '../types/events'

export class ResponsiveManager {
  private el: HTMLElement
  private options: SliderOptions
  private eventBus: EventBus<SliderEventMap>
  private slider: SliderInstance
  private onBreakpointChange: (merged: SliderOptions) => void

  private resizeObserver: ResizeObserver | null = null
  private activeBreakpoint: number | null = null

  constructor(
    el: HTMLElement,
    options: SliderOptions,
    eventBus: EventBus<SliderEventMap>,
    slider: SliderInstance,
    onBreakpointChange: (merged: SliderOptions) => void
  ) {
    this.el = el
    this.options = options
    this.eventBus = eventBus
    this.slider = slider
    this.onBreakpointChange = onBreakpointChange
  }

  init(): void {
    if (!this.options.breakpoints || Object.keys(this.options.breakpoints).length === 0) return

    this.resizeObserver = new ResizeObserver(() => {
      this.check()
    })
    this.resizeObserver.observe(this.el)
    this.check()
  }

  destroy(): void {
    this.resizeObserver?.disconnect()
    this.resizeObserver = null
  }

  get currentBreakpoint(): number | null {
    return this.activeBreakpoint
  }

  getActiveOptions(): Partial<BreakpointOptions> {
    if (!this.options.breakpoints || !this.activeBreakpoint) return {}
    return this.options.breakpoints[this.activeBreakpoint] ?? {}
  }

  getMergedOptions(): SliderOptions {
    const bpOptions = this.getActiveOptions()
    return { ...this.options, ...bpOptions }
  }

  private check(): void {
    if (!this.options.breakpoints) return

    const width = this.el.offsetWidth
    const breakpoints = Object.keys(this.options.breakpoints)
      .map(Number)
      .sort((a, b) => a - b)

    let matched: number | null = null
    for (const bp of breakpoints) {
      if (width >= bp) {
        matched = bp
      }
    }

    if (matched !== this.activeBreakpoint) {
      const previous = this.activeBreakpoint
      const current = matched
      const merged = this.getMergedOptions()

      this.eventBus.emit('newBreakpointStart', {
        previousBreakpoint: previous,
        currentBreakpoint: current,
        options: merged,
        slider: this.slider,
      })

      this.activeBreakpoint = current
      this.onBreakpointChange(merged)

      this.eventBus.emit('newBreakpointEnd', {
        previousBreakpoint: previous,
        currentBreakpoint: current,
        options: merged,
        slider: this.slider,
      })

      this.eventBus.emit('resize', {
        width: this.el.offsetWidth,
        height: this.el.offsetHeight,
        slidesPerPage: (merged.slidesPerPage as number) || 1,
        slider: this.slider,
      })
    }
  }
}
