import type { SliderOptions } from './options'
import type { SliderPlugin } from './plugin'

// Forward declaration — resolved at runtime via module augmentation
export interface SliderInstance {
  // State
  activeIndex: number
  previousIndex: number
  slides: HTMLElement[]
  slideCount: number
  isBeginning: boolean
  isEnd: boolean
  progress: number
  isDestroyed: boolean
  isOn: boolean
  version: string
  container: HTMLElement
  wrapper: HTMLElement

  // Navigation
  goTo(target: number | 'next' | 'prev' | 'first' | 'last'): void
  next(): void
  prev(): void

  // Autoplay proxy
  play(): void
  pause(): void

  // State methods
  update(): void
  updateSliderHeight(): void
  getInfo(): Record<string, unknown>
  enable(): void
  disable(): void

  // Lifecycle
  destroy(): void
  rebuild(newOptions?: Partial<SliderOptions>): SliderInstance

  // Events
  on<K extends keyof SliderEventMap>(event: K, handler: (payload: SliderEventMap[K]) => void): void
  off<K extends keyof SliderEventMap>(event: K, handler: (payload: SliderEventMap[K]) => void): void

  // Plugin access
  use(plugin: SliderPlugin): void
}

export type BeforeSlideChangePayload = {
  from: number
  to: number
  direction: 'next' | 'prev'
  slider: SliderInstance
}

export type AfterSlideChangePayload = {
  index: number
  previousIndex: number
  slide: HTMLElement
  slider: SliderInstance
}

export type ProgressPayload = {
  progress: number
  activeIndex: number
  slider: SliderInstance
}

export type BreakpointPayload = {
  previousBreakpoint: number | null
  currentBreakpoint: number | null
  options: Partial<SliderOptions>
  slider: SliderInstance
}

export type TouchPayload = {
  event: TouchEvent
  slider: SliderInstance
}

export type TouchMovePayload = {
  event: TouchEvent
  delta: number
  direction: 'horizontal' | 'vertical'
  slider: SliderInstance
}

export type DragPayload = {
  event: MouseEvent
  slider: SliderInstance
}

export type DragMovePayload = {
  event: MouseEvent
  delta: number
  direction: 'horizontal' | 'vertical'
  slider: SliderInstance
}

export type ResizePayload = {
  width: number
  height: number
  slidesPerPage: number
  slider: SliderInstance
}

export type DestroyPayload = {
  slider: SliderInstance
}

export type InitPayload = {
  slider: SliderInstance
}

export type SliderEventMap = {
  beforeInit: InitPayload
  afterInit: InitPayload
  beforeSlideChange: BeforeSlideChangePayload
  afterSlideChange: AfterSlideChangePayload
  beforeTransitionStart: BeforeSlideChangePayload
  afterTransitionEnd: AfterSlideChangePayload
  progress: ProgressPayload
  touchStart: TouchPayload
  touchMove: TouchMovePayload
  touchEnd: TouchPayload
  dragStart: DragPayload
  dragMove: DragMovePayload
  dragEnd: DragPayload
  newBreakpointStart: BreakpointPayload
  newBreakpointEnd: BreakpointPayload
  resize: ResizePayload
  beforeDestroy: DestroyPayload
  afterDestroy: DestroyPayload
}
