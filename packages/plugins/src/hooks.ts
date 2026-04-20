import type { SliderPlugin, SliderInstance, SliderInfo } from '@andresclua/sliderkit'

export interface HooksContext {
  onInit?:        (ctx: { slides: HTMLElement[]; slider: SliderInstance }) => void
  beforeChange?:  (ctx: { outgoing: HTMLElement | null; incoming: HTMLElement; direction: 'forward' | 'backward' }) => void
  afterChange?:   (ctx: { slide: HTMLElement; direction: 'forward' | 'backward' }) => void
  onDragStart?:   (ctx: { event?: Event | Record<string, unknown> }) => void
  onDragEnd?:     (ctx: { event?: Event | Record<string, unknown> }) => void
  onResize?:      (ctx: { breakpoint: number; items: number }) => void
  beforeDestroy?: () => void
}

export function hooks(callbacks: HooksContext = {}): SliderPlugin {
  let slider:   SliderInstance
  let prevIdx:  number

  const getSlide = (info: SliderInfo): HTMLElement =>
    slider.slides[info.index] as HTMLElement

  const onAfterInit = (info: SliderInfo) => {
    prevIdx = info.displayIndex
    callbacks.onInit?.({ slides: slider.slides, slider })
  }

  const onIndexChanged = (info: SliderInfo) => {
    const nextIdx   = info.displayIndex
    const direction = nextIdx >= prevIdx ? 'forward' : 'backward'
    const outgoing  = slider.slides[slider.activeIndex] ?? null
    const incoming  = getSlide(info)
    callbacks.beforeChange?.({ outgoing, incoming, direction })
    prevIdx = nextIdx
  }

  const onTransitionEnd = (info: SliderInfo) => {
    const direction: 'forward' | 'backward' = info.displayIndex >= prevIdx ? 'forward' : 'backward'
    callbacks.afterChange?.({ slide: getSlide(info), direction })
  }

  const onDragStart = (info: SliderInfo) => {
    const ctx: { event?: Event | Record<string, unknown> } = {}
    if (info.event !== undefined) ctx.event = info.event
    callbacks.onDragStart?.(ctx)
  }

  const onDragEnd = (info: SliderInfo) => {
    const ctx: { event?: Event | Record<string, unknown> } = {}
    if (info.event !== undefined) ctx.event = info.event
    callbacks.onDragEnd?.(ctx)
  }

  const onResize = (info: SliderInfo) => {
    callbacks.onResize?.({ breakpoint: 0, items: info.items })
  }

  const onBeforeDestroy = () => {
    callbacks.beforeDestroy?.()
  }

  return {
    name: 'hooks',

    install(s: SliderInstance): void {
      slider  = s
      prevIdx = s.activeIndex

      s.on('afterInit',      onAfterInit)
      s.on('indexChanged',   onIndexChanged)
      s.on('transitionEnd',  onTransitionEnd)
      s.on('dragStart',      onDragStart)
      s.on('touchStart',     onDragStart)
      s.on('dragEnd',        onDragEnd)
      s.on('touchEnd',       onDragEnd)
      s.on('newBreakpointEnd', onResize)
      s.on('beforeDestroy',  onBeforeDestroy)
    },

    destroy(): void {
      slider.off('afterInit',       onAfterInit)
      slider.off('indexChanged',    onIndexChanged)
      slider.off('transitionEnd',   onTransitionEnd)
      slider.off('dragStart',       onDragStart)
      slider.off('touchStart',      onDragStart)
      slider.off('dragEnd',         onDragEnd)
      slider.off('touchEnd',        onDragEnd)
      slider.off('newBreakpointEnd', onResize)
      slider.off('beforeDestroy',   onBeforeDestroy)
    },
  }
}
